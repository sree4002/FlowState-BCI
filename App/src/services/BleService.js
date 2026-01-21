import { BleManager } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform } from 'react-native';

class BleService {
  constructor() {
    this.manager = new BleManager();
    this.device = null;
    this.isConnected = false;
    this.onStatusUpdate = null; // Callback for status updates
    this.currentStatus = {
      isPlaying: false,
      frequency: 6.0,
      volume: 0.5,
    };
    this.listeners = {
      onConnectionChange: [],
      onDataReceived: [],
      onReconnectAttempt: [],
    };

    // Auto-reconnect configuration
    this.autoReconnectEnabled = false;
    this.lastConnectedDeviceId = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.baseReconnectDelay = 2000; // 2 seconds
    this.reconnectTimer = null;
    this.isReconnecting = false;
    this.intentionalDisconnect = false;
  }

  /**
   * Configure auto-reconnect settings
   * @param {boolean} enabled - Whether auto-reconnect is enabled
   * @param {string|null} deviceId - Device ID to reconnect to (optional)
   */
  setAutoReconnect(enabled, deviceId = null) {
    this.autoReconnectEnabled = enabled;
    if (deviceId) {
      this.lastConnectedDeviceId = deviceId;
    }
    console.log('Auto-reconnect:', enabled ? 'enabled' : 'disabled', deviceId ? `for device ${deviceId}` : '');
  }

  /**
   * Calculate delay for exponential backoff
   * Intervals: 2s, 4s, 8s, 16s, 32s (capped)
   * @param {number} attempt - Current attempt number (0-indexed)
   * @returns {number} Delay in milliseconds
   */
  calculateBackoffDelay(attempt) {
    // Exponential backoff: 2^attempt * baseDelay
    // attempt 0: 2s, attempt 1: 4s, attempt 2: 8s, attempt 3: 16s, attempt 4: 32s
    const delay = this.baseReconnectDelay * Math.pow(2, attempt);
    const maxDelay = 32000; // Cap at 32 seconds
    return Math.min(delay, maxDelay);
  }

  /**
   * Attempt to reconnect to the last connected device
   */
  async attemptReconnect() {
    if (!this.autoReconnectEnabled || this.isConnected || this.intentionalDisconnect) {
      this.isReconnecting = false;
      return;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnect attempts reached, stopping auto-reconnect');
      this.isReconnecting = false;
      this.notifyReconnectAttempt({
        attempt: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
        status: 'max_attempts_reached',
        nextDelayMs: null,
      });
      return;
    }

    this.isReconnecting = true;
    const currentAttempt = this.reconnectAttempts;
    const delay = this.calculateBackoffDelay(currentAttempt);

    console.log(`Auto-reconnect attempt ${currentAttempt + 1}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.notifyReconnectAttempt({
      attempt: currentAttempt + 1,
      maxAttempts: this.maxReconnectAttempts,
      status: 'waiting',
      nextDelayMs: delay,
    });

    this.reconnectTimer = setTimeout(async () => {
      try {
        this.notifyReconnectAttempt({
          attempt: currentAttempt + 1,
          maxAttempts: this.maxReconnectAttempts,
          status: 'connecting',
          nextDelayMs: null,
        });

        if (this.lastConnectedDeviceId) {
          // Try to reconnect to specific device by ID
          await this.reconnectToDeviceById(this.lastConnectedDeviceId);
        } else {
          // Fall back to scanning for any compatible device
          await this.scanAndConnect();
        }

        // Success - reset attempts
        this.reconnectAttempts = 0;
        this.isReconnecting = false;
        console.log('Auto-reconnect successful');

        this.notifyReconnectAttempt({
          attempt: currentAttempt + 1,
          maxAttempts: this.maxReconnectAttempts,
          status: 'connected',
          nextDelayMs: null,
        });
      } catch (error) {
        console.log(`Reconnect attempt ${currentAttempt + 1} failed:`, error.message);
        this.reconnectAttempts++;

        this.notifyReconnectAttempt({
          attempt: currentAttempt + 1,
          maxAttempts: this.maxReconnectAttempts,
          status: 'failed',
          error: error.message,
          nextDelayMs: this.reconnectAttempts < this.maxReconnectAttempts
            ? this.calculateBackoffDelay(this.reconnectAttempts)
            : null,
        });

        // Schedule next attempt
        this.attemptReconnect();
      }
    }, delay);
  }

  /**
   * Reconnect to a specific device by ID
   * @param {string} deviceId - The device ID to reconnect to
   */
  async reconnectToDeviceById(deviceId) {
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        reject(new Error('Reconnect timeout - device not found'));
      }, 10000);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          reject(error);
          return;
        }

        // Look for the specific device by ID
        if (device && device.id === deviceId) {
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          this.connectToDevice(device)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  /**
   * Cancel any pending reconnect attempts
   */
  cancelReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    console.log('Auto-reconnect cancelled');
  }

  /**
   * Reset reconnect state (call on successful manual connection)
   */
  resetReconnectState() {
    this.reconnectAttempts = 0;
    this.isReconnecting = false;
    this.intentionalDisconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Handle unexpected disconnection - trigger auto-reconnect if enabled
   * @param {Error|null} error - The disconnection error if any
   */
  handleUnexpectedDisconnect(error) {
    console.log('Unexpected disconnect detected', error ? error.message : '');

    if (this.autoReconnectEnabled && !this.intentionalDisconnect) {
      this.attemptReconnect();
    }
  }

  // Reconnect attempt listener methods
  addReconnectListener(callback) {
    this.listeners.onReconnectAttempt.push(callback);
  }

  removeReconnectListener(callback) {
    this.listeners.onReconnectAttempt = this.listeners.onReconnectAttempt.filter(
      cb => cb !== callback
    );
  }

  notifyReconnectAttempt(status) {
    this.listeners.onReconnectAttempt.forEach(callback => {
      callback(status);
    });
  }

  /**
   * Get current reconnect status
   * @returns {Object} Current reconnect state
   */
  getReconnectStatus() {
    return {
      isReconnecting: this.isReconnecting,
      currentAttempt: this.reconnectAttempts,
      maxAttempts: this.maxReconnectAttempts,
      autoReconnectEnabled: this.autoReconnectEnabled,
      lastConnectedDeviceId: this.lastConnectedDeviceId,
    };
  }

  async requestPermissions() {
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);

        return (
          granted['android.permission.BLUETOOTH_SCAN'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.BLUETOOTH_CONNECT'] === PermissionsAndroid.RESULTS.GRANTED &&
          granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Permission request error:', err);
        return false;
      }
    }
    return true;
  }

  async scanAndConnect() {
    const hasPermissions = await this.requestPermissions();
    if (!hasPermissions) {
      throw new Error('Bluetooth permissions not granted');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.manager.stopDeviceScan();
        reject(new Error('Scan timeout - no BCI device found'));
      }, 10000);

      this.manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          reject(error);
          return;
        }

        // Look for BCI device by name or specific service UUID
        // Adjust this to match your actual BCI device identifier
        if (device.name && (device.name.includes('BCI') || device.name.includes('FlowState'))) {
          clearTimeout(timeout);
          this.manager.stopDeviceScan();
          this.connectToDevice(device)
            .then(resolve)
            .catch(reject);
        }
      });
    });
  }

  async connectToDevice(device) {
    try {
      console.log('Connecting to device:', device.name || device.id);

      const connectedDevice = await device.connect();
      this.device = connectedDevice;

      // Store device ID for potential reconnection
      this.lastConnectedDeviceId = device.id;

      // Reset reconnect state on successful connection
      this.resetReconnectState();

      // Setup disconnect listener with auto-reconnect support
      this.device.onDisconnected((error, disconnectedDevice) => {
        console.log('Device disconnected:', disconnectedDevice.id);
        this.isConnected = false;
        this.device = null;
        this.notifyConnectionChange(false);

        // Trigger auto-reconnect if enabled and not intentional
        this.handleUnexpectedDisconnect(error);
      });

      // Discover all services and characteristics
      await this.device.discoverAllServicesAndCharacteristics();

      this.isConnected = true;
      this.notifyConnectionChange(true);

      // Start monitoring EEG data
      // Adjust UUIDs to match your BCI device's service and characteristic
      await this.startMonitoring();

      return this.device;
    } catch (error) {
      console.error('Connection error:', error);
      throw error;
    }
  }

  async startMonitoring() {
    if (!this.device) {
      throw new Error('No device connected');
    }

    try {
      // Replace these UUIDs with your BCI device's actual service and characteristic UUIDs
      const SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb';
      const CHARACTERISTIC_UUID = '00002a6e-0000-1000-8000-00805f9b34fb';

      // Subscribe to notifications from the EEG characteristic
      this.device.monitorCharacteristicForService(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            console.error('Monitoring error:', error);
            return;
          }

          // Decode the EEG data from base64
          if (characteristic?.value) {
            const rawData = this.base64ToArrayBuffer(characteristic.value);
            const eegData = this.parseEEGData(rawData);
            this.notifyDataReceived(eegData);
          }
        }
      );

      console.log('Started monitoring EEG data');
    } catch (error) {
      console.error('Failed to start monitoring:', error);
      throw error;
    }
  }

  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }

  parseEEGData(rawData) {
    // Parse the raw byte data into EEG values
    // Adjust this based on your BCI device's data format
    // This is a simplified example assuming float32 values
    const dataView = new DataView(rawData.buffer);

    try {
      // Example: first 4 bytes are timestamp, next 4 are theta power
      const timestamp = dataView.getUint32(0, true);
      const thetaPower = dataView.getFloat32(4, true);

      return {
        timestamp,
        thetaPower,
        frequency: 6.0, // Default theta frequency
      };
    } catch (error) {
      console.error('Error parsing EEG data:', error);
      return {
        timestamp: Date.now(),
        thetaPower: 0,
        frequency: 6.0,
      };
    }
  }

  async disconnect() {
    // Mark as intentional to prevent auto-reconnect
    this.intentionalDisconnect = true;
    this.cancelReconnect();

    if (this.device) {
      try {
        await this.device.cancelConnection();
        this.device = null;
        this.isConnected = false;
        this.notifyConnectionChange(false);
        console.log('Disconnected from device');
      } catch (error) {
        console.error('Disconnect error:', error);
      }
    }
  }

  // Event listener methods
  addConnectionListener(callback) {
    this.listeners.onConnectionChange.push(callback);
  }

  removeConnectionListener(callback) {
    this.listeners.onConnectionChange = this.listeners.onConnectionChange.filter(
      cb => cb !== callback
    );
  }

  addDataListener(callback) {
    this.listeners.onDataReceived.push(callback);
  }

  removeDataListener(callback) {
    this.listeners.onDataReceived = this.listeners.onDataReceived.filter(
      cb => cb !== callback
    );
  }

  notifyConnectionChange(isConnected) {
    this.listeners.onConnectionChange.forEach(callback => {
      callback(isConnected);
    });
  }

  notifyDataReceived(data) {
    this.listeners.onDataReceived.forEach(callback => {
      callback(data);
    });
  }

  getConnectionStatus() {
    return this.isConnected;
  }

  // Entrainment control methods
  async startEntrainment() {
    if (!this.device) {
      console.warn('No device connected, cannot start entrainment');
      return;
    }

    try {
      // Send command to start isochronic tone playback
      // Replace with actual BLE command for your device
      await this.sendCommand('START_ENTRAINMENT');

      this.currentStatus.isPlaying = true;
      this.notifyStatusUpdate();

      console.log('Entrainment started');
    } catch (error) {
      console.error('Failed to start entrainment:', error);
      throw error;
    }
  }

  async stopEntrainment() {
    if (!this.device) {
      console.warn('No device connected');
      return;
    }

    try {
      // Send command to stop playback
      await this.sendCommand('STOP_ENTRAINMENT');

      this.currentStatus.isPlaying = false;
      this.notifyStatusUpdate();

      console.log('Entrainment stopped');
    } catch (error) {
      console.error('Failed to stop entrainment:', error);
      throw error;
    }
  }

  async setFrequency(frequency) {
    if (!this.device) {
      console.warn('No device connected');
      return;
    }

    try {
      // Send frequency value to device
      // Replace with actual BLE command for your device
      const freqBytes = new Float32Array([frequency]);
      await this.sendCommand('SET_FREQUENCY', freqBytes);

      this.currentStatus.frequency = frequency;
      this.notifyStatusUpdate();

      console.log('Frequency set to:', frequency);
    } catch (error) {
      console.error('Failed to set frequency:', error);
      throw error;
    }
  }

  async setVolume(volume) {
    if (!this.device) {
      console.warn('No device connected');
      return;
    }

    try {
      // Send volume value to device
      const volBytes = new Float32Array([volume]);
      await this.sendCommand('SET_VOLUME', volBytes);

      this.currentStatus.volume = volume;
      this.notifyStatusUpdate();

      console.log('Volume set to:', volume);
    } catch (error) {
      console.error('Failed to set volume:', error);
      throw error;
    }
  }

  async sendCommand(command, data = null) {
    if (!this.device) {
      console.warn('No device connected');
      return;
    }

    try {
      // Replace these UUIDs with your BCI device's actual command service and characteristic
      const COMMAND_SERVICE_UUID = '0000181a-0000-1000-8000-00805f9b34fb';
      const COMMAND_CHARACTERISTIC_UUID = '00002a6f-0000-1000-8000-00805f9b34fb';

      // Convert command to bytes
      let commandData;
      if (data) {
        // If data provided, combine command string with data bytes
        const encoder = new TextEncoder();
        const cmdBytes = encoder.encode(command);
        commandData = new Uint8Array([...cmdBytes, 0, ...new Uint8Array(data.buffer)]);
      } else {
        // Just send command string
        const encoder = new TextEncoder();
        commandData = encoder.encode(command);
      }

      // Convert to base64 for BLE transmission
      const base64Data = this.arrayBufferToBase64(commandData);

      // Write to device
      await this.device.writeCharacteristicWithResponseForService(
        COMMAND_SERVICE_UUID,
        COMMAND_CHARACTERISTIC_UUID,
        base64Data
      );

      console.log('Command sent:', command);
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  notifyStatusUpdate() {
    if (this.onStatusUpdate) {
      this.onStatusUpdate(this.currentStatus);
    }
  }

  // Cleanup method
  destroy() {
    this.cancelReconnect();
    this.disconnect();
    this.manager.destroy();
  }
}

// Export singleton instance
const bleService = new BleService();
export default bleService;
