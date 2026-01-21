import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import {
  ConnectionQualityMonitor,
  getQualityLevelDescription,
  getQualityLevelColor,
} from './ConnectionQualityMonitor';
import {
  DeviceInfo,
  ConnectionQuality,
  ConnectionQualityLevel,
  ConnectionQualityConfig,
  EEGDataPacket,
} from '../types';

// BLE Service and Characteristic UUIDs (adjust for your actual BCI device)
const SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb';
const EEG_CHARACTERISTIC_UUID = '00002a6e-0000-1000-8000-00805f9b34fb';
const COMMAND_CHARACTERISTIC_UUID = '00002a6f-0000-1000-8000-00805f9b34fb';

// Auto-reconnect configuration
const RECONNECT_INTERVALS = [2000, 4000, 8000]; // Exponential backoff: 2s, 4s, 8s

/**
 * Connection state for the BLE service
 */
export type BLEConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting';

/**
 * Callback types
 */
export type ConnectionStateCallback = (state: BLEConnectionState) => void;
export type EEGDataCallback = (data: EEGDataPacket) => void;
export type DeviceInfoCallback = (info: DeviceInfo) => void;

/**
 * BLEService
 *
 * Manages BLE communication with the FlowState BCI device.
 * Includes connection quality monitoring via RSSI values.
 */
export class BLEService {
  private manager: BleManager;
  private device: Device | null = null;
  private connectionState: BLEConnectionState = 'disconnected';
  private qualityMonitor: ConnectionQualityMonitor;
  private reconnectAttempt: number = 0;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private autoReconnectEnabled: boolean = true;
  private deviceSubscription: Subscription | null = null;
  private eegMonitorSubscription: Subscription | null = null;

  // Listeners
  private connectionStateListeners: ConnectionStateCallback[] = [];
  private eegDataListeners: EEGDataCallback[] = [];
  private deviceInfoListeners: DeviceInfoCallback[] = [];

  // Device info cache
  private deviceInfo: DeviceInfo | null = null;

  constructor(qualityConfig?: Partial<ConnectionQualityConfig>) {
    this.manager = new BleManager();
    this.qualityMonitor = new ConnectionQualityMonitor(qualityConfig);

    // Set up quality monitor callbacks
    this.qualityMonitor.addQualityUpdateListener((quality) => {
      this.handleQualityUpdate(quality);
    });

    this.qualityMonitor.addQualityLevelChangeListener((newLevel, oldLevel) => {
      this.handleQualityLevelChange(newLevel, oldLevel);
    });
  }

  /**
   * Request Bluetooth permissions (Android)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  /**
   * Check if Bluetooth is powered on
   */
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  /**
   * Scan for BCI devices
   */
  async scanForDevices(
    timeoutMs: number = 10000
  ): Promise<Device[]> {
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    const devices: Device[] = [];

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        resolve(devices);
      }, timeoutMs);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          reject(error);
          return;
        }

        if (
          device?.name &&
          (device.name.includes('BCI') || device.name.includes('FlowState'))
        ) {
          // Avoid duplicates
          if (!devices.find((d) => d.id === device.id)) {
            devices.push(device);
          }
        }
      });
    });
  }

  /**
   * Connect to a specific device
   */
  async connect(device: Device): Promise<void> {
    if (this.device) {
      await this.disconnect();
    }

    this.setConnectionState('connecting');
    this.reconnectAttempt = 0;

    try {
      const connectedDevice = await device.connect();
      await connectedDevice.discoverAllServicesAndCharacteristics();

      this.device = connectedDevice;
      this.setConnectionState('connected');

      // Set up disconnect listener
      this.deviceSubscription = this.device.onDisconnected(() => {
        this.handleDisconnect();
      });

      // Start connection quality monitoring
      this.qualityMonitor.startMonitoring(this.device);

      // Update device info
      await this.updateDeviceInfo();

      // Start EEG data monitoring
      await this.startEEGMonitoring();
    } catch (error) {
      this.setConnectionState('disconnected');
      throw error;
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect(): Promise<void> {
    this.autoReconnectEnabled = false;
    this.clearReconnectTimeout();

    this.qualityMonitor.stopMonitoring();

    if (this.eegMonitorSubscription) {
      this.eegMonitorSubscription.remove();
      this.eegMonitorSubscription = null;
    }

    if (this.deviceSubscription) {
      this.deviceSubscription.remove();
      this.deviceSubscription = null;
    }

    if (this.device) {
      try {
        await this.device.cancelConnection();
      } catch {
        // Device may already be disconnected
      }
      this.device = null;
    }

    this.deviceInfo = null;
    this.setConnectionState('disconnected');
    this.autoReconnectEnabled = true;
  }

  /**
   * Handle device disconnection
   */
  private handleDisconnect(): void {
    this.qualityMonitor.stopMonitoring();

    if (this.eegMonitorSubscription) {
      this.eegMonitorSubscription.remove();
      this.eegMonitorSubscription = null;
    }

    if (this.autoReconnectEnabled && this.device) {
      this.attemptReconnect();
    } else {
      this.device = null;
      this.deviceInfo = null;
      this.setConnectionState('disconnected');
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempt >= RECONNECT_INTERVALS.length) {
      console.log('Max reconnect attempts reached');
      this.device = null;
      this.deviceInfo = null;
      this.setConnectionState('disconnected');
      return;
    }

    this.setConnectionState('reconnecting');
    const delay = RECONNECT_INTERVALS[this.reconnectAttempt];

    console.log(
      `Attempting reconnect in ${delay}ms (attempt ${this.reconnectAttempt + 1})`
    );

    this.reconnectTimeout = setTimeout(async () => {
      if (!this.device) {
        this.setConnectionState('disconnected');
        return;
      }

      try {
        const connectedDevice = await this.device.connect();
        await connectedDevice.discoverAllServicesAndCharacteristics();

        this.device = connectedDevice;
        this.reconnectAttempt = 0;
        this.setConnectionState('connected');

        // Re-setup monitoring
        this.deviceSubscription = this.device.onDisconnected(() => {
          this.handleDisconnect();
        });

        this.qualityMonitor.startMonitoring(this.device);
        await this.updateDeviceInfo();
        await this.startEEGMonitoring();
      } catch {
        this.reconnectAttempt++;
        this.attemptReconnect();
      }
    }, delay);
  }

  /**
   * Clear reconnect timeout
   */
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Update device info including RSSI
   */
  private async updateDeviceInfo(): Promise<void> {
    if (!this.device) return;

    try {
      const rssi = await this.device.readRSSI();

      this.deviceInfo = {
        id: this.device.id,
        name: this.device.name || 'Unknown Device',
        type: this.device.name?.includes('Earpiece') ? 'earpiece' : 'headband',
        sampling_rate: this.device.name?.includes('Earpiece') ? 250 : 500,
        battery_level: null, // Would be read from device characteristic
        firmware_version: null, // Would be read from device characteristic
        rssi,
        is_connected: true,
        last_connected: Date.now(),
      };

      this.notifyDeviceInfoListeners();
    } catch (error) {
      console.error('Failed to update device info:', error);
    }
  }

  /**
   * Start monitoring EEG data stream
   */
  private async startEEGMonitoring(): Promise<void> {
    if (!this.device) return;

    try {
      this.eegMonitorSubscription =
        this.device.monitorCharacteristicForService(
          SERVICE_UUID,
          EEG_CHARACTERISTIC_UUID,
          (error, characteristic) => {
            if (error) {
              console.error('EEG monitoring error:', error);
              return;
            }

            if (characteristic?.value) {
              const rawData = this.base64ToUint8Array(characteristic.value);
              const eegData = this.parseEEGData(rawData);
              this.notifyEEGDataListeners(eegData);
            }
          }
        );
    } catch (error) {
      console.error('Failed to start EEG monitoring:', error);
    }
  }

  /**
   * Parse EEG data from raw bytes
   */
  private parseEEGData(rawData: Uint8Array): EEGDataPacket {
    const dataView = new DataView(rawData.buffer);

    try {
      // Example format - adjust based on actual device protocol
      const timestamp = dataView.getUint32(0, true);
      const sequenceNumber = dataView.getUint16(4, true);
      const sampleCount = (rawData.length - 6) / 2; // Assuming 16-bit samples

      const samples: number[] = [];
      for (let i = 0; i < sampleCount; i++) {
        const sample = dataView.getInt16(6 + i * 2, true);
        samples.push(sample);
      }

      return {
        timestamp,
        samples,
        sequence_number: sequenceNumber,
      };
    } catch {
      return {
        timestamp: Date.now(),
        samples: [],
        sequence_number: 0,
      };
    }
  }

  /**
   * Handle connection quality update
   */
  private handleQualityUpdate(quality: ConnectionQuality): void {
    // Update device info with current RSSI
    if (this.deviceInfo) {
      this.deviceInfo.rssi = quality.currentRSSI;
      this.notifyDeviceInfoListeners();
    }
  }

  /**
   * Handle quality level change
   */
  private handleQualityLevelChange(
    newLevel: ConnectionQualityLevel,
    oldLevel: ConnectionQualityLevel
  ): void {
    console.log(
      `Connection quality changed: ${oldLevel} -> ${newLevel} (${getQualityLevelDescription(newLevel)})`
    );

    // Could trigger warnings for poor quality
    if (newLevel === 'poor') {
      console.warn(
        'Connection quality is poor. Consider moving closer to the device.'
      );
    }
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(state: BLEConnectionState): void {
    this.connectionState = state;
    this.connectionStateListeners.forEach((callback) => {
      try {
        callback(state);
      } catch (error) {
        console.error('Error in connection state callback:', error);
      }
    });
  }

  /**
   * Notify EEG data listeners
   */
  private notifyEEGDataListeners(data: EEGDataPacket): void {
    this.eegDataListeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in EEG data callback:', error);
      }
    });
  }

  /**
   * Notify device info listeners
   */
  private notifyDeviceInfoListeners(): void {
    if (!this.deviceInfo) return;

    this.deviceInfoListeners.forEach((callback) => {
      try {
        callback(this.deviceInfo!);
      } catch (error) {
        console.error('Error in device info callback:', error);
      }
    });
  }

  /**
   * Convert base64 string to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  // Public API for listeners

  addConnectionStateListener(callback: ConnectionStateCallback): void {
    this.connectionStateListeners.push(callback);
  }

  removeConnectionStateListener(callback: ConnectionStateCallback): void {
    this.connectionStateListeners = this.connectionStateListeners.filter(
      (cb) => cb !== callback
    );
  }

  addEEGDataListener(callback: EEGDataCallback): void {
    this.eegDataListeners.push(callback);
  }

  removeEEGDataListener(callback: EEGDataCallback): void {
    this.eegDataListeners = this.eegDataListeners.filter(
      (cb) => cb !== callback
    );
  }

  addDeviceInfoListener(callback: DeviceInfoCallback): void {
    this.deviceInfoListeners.push(callback);
  }

  removeDeviceInfoListener(callback: DeviceInfoCallback): void {
    this.deviceInfoListeners = this.deviceInfoListeners.filter(
      (cb) => cb !== callback
    );
  }

  // Public getters

  getConnectionState(): BLEConnectionState {
    return this.connectionState;
  }

  getDeviceInfo(): DeviceInfo | null {
    return this.deviceInfo;
  }

  getConnectionQuality(): ConnectionQuality | null {
    return this.qualityMonitor.getCurrentQuality();
  }

  getConnectionQualityMonitor(): ConnectionQualityMonitor {
    return this.qualityMonitor;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  /**
   * Enable/disable auto-reconnect
   */
  setAutoReconnect(enabled: boolean): void {
    this.autoReconnectEnabled = enabled;
  }

  /**
   * Update connection quality monitoring configuration
   */
  updateQualityConfig(config: Partial<ConnectionQualityConfig>): void {
    this.qualityMonitor.updateConfig(config);
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.disconnect();
    this.qualityMonitor.destroy();
    this.manager.destroy();
    this.connectionStateListeners = [];
    this.eegDataListeners = [];
    this.deviceInfoListeners = [];
  }
}

// Export singleton instance
export const bleService = new BLEService();

// Re-export utility functions for convenience
export { getQualityLevelDescription, getQualityLevelColor };
