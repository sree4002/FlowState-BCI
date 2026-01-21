/**
 * BLEService - Bluetooth Low Energy Service for FlowState BCI
 *
 * Provides device scanning, connection, and disconnection functionality
 * for communicating with BCI devices (headbands and earpieces).
 */

import { BleManager, Device, State, Subscription } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';
import { DeviceInfo } from '../types';

/**
 * BLE service UUIDs for FlowState BCI devices
 */
export const BLE_SERVICE_UUIDS = {
  // Primary EEG data service
  EEG_SERVICE: '0000181a-0000-1000-8000-00805f9b34fb',
  // Device information service
  DEVICE_INFO_SERVICE: '0000180a-0000-1000-8000-00805f9b34fb',
  // Battery service
  BATTERY_SERVICE: '0000180f-0000-1000-8000-00805f9b34fb',
} as const;

/**
 * Device name patterns used to identify FlowState BCI devices
 */
export const BLE_DEVICE_NAME_PATTERNS = ['FlowState', 'BCI', 'EEG'] as const;

/**
 * Default scan timeout in milliseconds
 */
export const DEFAULT_SCAN_TIMEOUT_MS = 10000;

/**
 * Discovered device information during scanning
 */
export interface DiscoveredDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  localName: string | null;
  manufacturerData: string | null;
}

/**
 * Scan options for device discovery
 */
export interface ScanOptions {
  /** Timeout in milliseconds (default: 10000) */
  timeoutMs?: number;
  /** Filter devices by name patterns */
  nameFilters?: string[];
  /** Service UUIDs to filter by */
  serviceUUIDs?: string[];
  /** Allow duplicate discoveries */
  allowDuplicates?: boolean;
}

/**
 * Connection options
 */
export interface ConnectionOptions {
  /** Request MTU size */
  requestMTU?: number;
  /** Connection timeout in milliseconds */
  timeoutMs?: number;
  /** Auto-discover services after connection */
  autoDiscoverServices?: boolean;
}

/**
 * Connection state enum
 */
export type ConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'disconnecting';

/**
 * Event listener callback types
 */
export type ScanListener = (device: DiscoveredDevice) => void;
export type ConnectionStateListener = (
  state: ConnectionState,
  device: DeviceInfo | null
) => void;
export type StateChangeListener = (state: State) => void;
export type ErrorListener = (error: Error) => void;

/**
 * BLEService class for managing BLE device communication
 *
 * Features:
 * - Device scanning with configurable filters
 * - Connection management with timeout support
 * - Disconnection handling
 * - Event-based architecture for state changes
 * - Platform-specific permission handling (Android)
 */
export class BLEService {
  private manager: BleManager;
  private connectedDevice: Device | null = null;
  private connectionState: ConnectionState = 'disconnected';
  private scanSubscription: Subscription | null = null;
  private stateSubscription: Subscription | null = null;
  private disconnectSubscription: Subscription | null = null;
  private scanTimeout: ReturnType<typeof setTimeout> | null = null;

  // Event listeners
  private scanListeners: Set<ScanListener> = new Set();
  private connectionStateListeners: Set<ConnectionStateListener> = new Set();
  private stateChangeListeners: Set<StateChangeListener> = new Set();
  private errorListeners: Set<ErrorListener> = new Set();

  constructor() {
    this.manager = new BleManager();
    this.setupStateMonitoring();
  }

  /**
   * Set up BLE state monitoring
   */
  private setupStateMonitoring(): void {
    this.stateSubscription = this.manager.onStateChange((state) => {
      this.notifyStateChange(state);
    }, true);
  }

  /**
   * Request BLE permissions (Android only)
   * @returns True if permissions are granted
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const permissions: string[] = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ];

        // Android 12+ requires additional BLE permissions
        if (Platform.Version >= 31) {
          permissions.push(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          );
        }

        const granted = await PermissionsAndroid.requestMultiple(
          permissions as (typeof PermissionsAndroid.PERMISSIONS)[keyof typeof PermissionsAndroid.PERMISSIONS][]
        );

        const allGranted = Object.values(granted).every(
          (status) => status === PermissionsAndroid.RESULTS.GRANTED
        );

        return allGranted;
      } catch (error) {
        this.notifyError(
          error instanceof Error
            ? error
            : new Error('Permission request failed')
        );
        return false;
      }
    }

    // iOS handles permissions through Info.plist
    return true;
  }

  /**
   * Check if Bluetooth is powered on
   * @returns True if Bluetooth is powered on
   */
  async isBluetoothEnabled(): Promise<boolean> {
    const state = await this.manager.state();
    return state === State.PoweredOn;
  }

  /**
   * Get current Bluetooth state
   * @returns Current BLE state
   */
  async getBluetoothState(): Promise<State> {
    return this.manager.state();
  }

  /**
   * Start scanning for BLE devices
   * @param options Scan configuration options
   * @returns Promise that resolves when scanning starts
   */
  async startScan(options: ScanOptions = {}): Promise<void> {
    const {
      timeoutMs = DEFAULT_SCAN_TIMEOUT_MS,
      nameFilters = [...BLE_DEVICE_NAME_PATTERNS],
      serviceUUIDs = null,
      allowDuplicates = false,
    } = options;

    // Check permissions first
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    // Check if Bluetooth is enabled
    const isEnabled = await this.isBluetoothEnabled();
    if (!isEnabled) {
      throw new Error('Bluetooth is not enabled');
    }

    // Stop any existing scan
    await this.stopScan();

    // Set up scan timeout
    if (timeoutMs > 0) {
      this.scanTimeout = setTimeout(() => {
        this.stopScan();
      }, timeoutMs);
    }

    // Start scanning
    this.scanSubscription = this.manager.startDeviceScan(
      serviceUUIDs as string[] | null,
      { allowDuplicates },
      (error, device) => {
        if (error) {
          this.notifyError(error);
          this.stopScan();
          return;
        }

        if (device) {
          // Apply name filters
          const deviceName = device.name || device.localName || '';
          const matchesFilter =
            nameFilters.length === 0 ||
            nameFilters.some(
              (pattern) =>
                deviceName.toLowerCase().includes(pattern.toLowerCase()) ||
                device.id === pattern
            );

          if (matchesFilter) {
            const discoveredDevice: DiscoveredDevice = {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              localName: device.localName,
              manufacturerData: device.manufacturerData,
            };
            this.notifyScanResult(discoveredDevice);
          }
        }
      }
    ) as unknown as Subscription;
  }

  /**
   * Stop scanning for devices
   */
  async stopScan(): Promise<void> {
    if (this.scanTimeout) {
      clearTimeout(this.scanTimeout);
      this.scanTimeout = null;
    }

    if (this.scanSubscription) {
      this.scanSubscription.remove();
      this.scanSubscription = null;
    }

    this.manager.stopDeviceScan();
  }

  /**
   * Check if currently scanning
   */
  isScanning(): boolean {
    return this.scanSubscription !== null;
  }

  /**
   * Connect to a BLE device
   * @param deviceId Device ID to connect to
   * @param options Connection options
   * @returns Connected device info
   */
  async connect(
    deviceId: string,
    options: ConnectionOptions = {}
  ): Promise<DeviceInfo> {
    const {
      requestMTU = 512,
      timeoutMs = 10000,
      autoDiscoverServices = true,
    } = options;

    // Don't connect if already connected to this device
    if (
      this.connectedDevice?.id === deviceId &&
      this.connectionState === 'connected'
    ) {
      return this.getDeviceInfo(this.connectedDevice);
    }

    // Disconnect from any existing device
    if (this.connectedDevice) {
      await this.disconnect();
    }

    this.setConnectionState('connecting', null);

    try {
      // Create connection with timeout
      const device = await Promise.race([
        this.manager.connectToDevice(deviceId, {
          requestMTU,
        }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Connection timeout')), timeoutMs)
        ),
      ]);

      this.connectedDevice = device;

      // Set up disconnect listener
      this.disconnectSubscription = device.onDisconnected((error, _device) => {
        if (error) {
          this.notifyError(error);
        }
        this.handleDisconnection();
      });

      // Discover services if requested
      if (autoDiscoverServices) {
        await device.discoverAllServicesAndCharacteristics();
      }

      const deviceInfo = this.getDeviceInfo(device);
      this.setConnectionState('connected', deviceInfo);

      return deviceInfo;
    } catch (error) {
      this.setConnectionState('disconnected', null);
      throw error instanceof Error ? error : new Error('Connection failed');
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect(): Promise<void> {
    if (!this.connectedDevice) {
      return;
    }

    this.setConnectionState('disconnecting', null);

    try {
      // Remove disconnect listener before disconnecting
      if (this.disconnectSubscription) {
        this.disconnectSubscription.remove();
        this.disconnectSubscription = null;
      }

      await this.connectedDevice.cancelConnection();
    } catch (error) {
      // Log error but don't throw - device may already be disconnected
      this.notifyError(
        error instanceof Error ? error : new Error('Disconnect failed')
      );
    } finally {
      this.connectedDevice = null;
      this.setConnectionState('disconnected', null);
    }
  }

  /**
   * Handle unexpected disconnection
   */
  private handleDisconnection(): void {
    if (this.disconnectSubscription) {
      this.disconnectSubscription.remove();
      this.disconnectSubscription = null;
    }
    this.connectedDevice = null;
    this.setConnectionState('disconnected', null);
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Check if connected to a device
   */
  isConnected(): boolean {
    return (
      this.connectionState === 'connected' && this.connectedDevice !== null
    );
  }

  /**
   * Get currently connected device info
   */
  getConnectedDevice(): DeviceInfo | null {
    if (!this.connectedDevice) {
      return null;
    }
    return this.getDeviceInfo(this.connectedDevice);
  }

  /**
   * Convert BLE Device to DeviceInfo
   */
  private getDeviceInfo(device: Device): DeviceInfo {
    const deviceName = device.name || device.localName || 'Unknown Device';
    const isHeadband =
      deviceName.toLowerCase().includes('headband') ||
      deviceName.toLowerCase().includes('head');

    return {
      id: device.id,
      name: deviceName,
      type: isHeadband ? 'headband' : 'earpiece',
      sampling_rate: isHeadband ? 500 : 250,
      battery_level: null, // Will be read from device characteristic
      firmware_version: null, // Will be read from device characteristic
      rssi: device.rssi,
      is_connected: true,
      last_connected: Date.now(),
    };
  }

  /**
   * Set connection state and notify listeners
   */
  private setConnectionState(
    state: ConnectionState,
    device: DeviceInfo | null
  ): void {
    this.connectionState = state;
    this.notifyConnectionState(state, device);
  }

  // ============= Event Listener Management =============

  /**
   * Add scan result listener
   */
  addScanListener(listener: ScanListener): void {
    this.scanListeners.add(listener);
  }

  /**
   * Remove scan result listener
   */
  removeScanListener(listener: ScanListener): void {
    this.scanListeners.delete(listener);
  }

  /**
   * Add connection state listener
   */
  addConnectionStateListener(listener: ConnectionStateListener): void {
    this.connectionStateListeners.add(listener);
  }

  /**
   * Remove connection state listener
   */
  removeConnectionStateListener(listener: ConnectionStateListener): void {
    this.connectionStateListeners.delete(listener);
  }

  /**
   * Add Bluetooth state change listener
   */
  addStateChangeListener(listener: StateChangeListener): void {
    this.stateChangeListeners.add(listener);
  }

  /**
   * Remove Bluetooth state change listener
   */
  removeStateChangeListener(listener: StateChangeListener): void {
    this.stateChangeListeners.delete(listener);
  }

  /**
   * Add error listener
   */
  addErrorListener(listener: ErrorListener): void {
    this.errorListeners.add(listener);
  }

  /**
   * Remove error listener
   */
  removeErrorListener(listener: ErrorListener): void {
    this.errorListeners.delete(listener);
  }

  // ============= Event Notification Methods =============

  private notifyScanResult(device: DiscoveredDevice): void {
    this.scanListeners.forEach((listener) => listener(device));
  }

  private notifyConnectionState(
    state: ConnectionState,
    device: DeviceInfo | null
  ): void {
    this.connectionStateListeners.forEach((listener) =>
      listener(state, device)
    );
  }

  private notifyStateChange(state: State): void {
    this.stateChangeListeners.forEach((listener) => listener(state));
  }

  private notifyError(error: Error): void {
    this.errorListeners.forEach((listener) => listener(error));
  }

  // ============= Cleanup =============

  /**
   * Destroy the BLE service and clean up resources
   */
  async destroy(): Promise<void> {
    await this.stopScan();
    await this.disconnect();

    if (this.stateSubscription) {
      this.stateSubscription.remove();
      this.stateSubscription = null;
    }

    // Clear all listeners
    this.scanListeners.clear();
    this.connectionStateListeners.clear();
    this.stateChangeListeners.clear();
    this.errorListeners.clear();

    this.manager.destroy();
  }
}

// Export singleton instance for convenience
let bleServiceInstance: BLEService | null = null;

/**
 * Get the singleton BLE service instance
 */
export function getBLEService(): BLEService {
  if (!bleServiceInstance) {
    bleServiceInstance = new BLEService();
  }
  return bleServiceInstance;
}

/**
 * Reset the singleton instance (useful for testing)
 */
export function resetBLEService(): void {
  if (bleServiceInstance) {
    bleServiceInstance.destroy();
    bleServiceInstance = null;
  }
}

export default BLEService;
