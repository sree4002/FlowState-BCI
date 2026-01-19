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

      // Setup disconnect listener
      this.device.onDisconnected((error, device) => {
        console.log('Device disconnected:', device.id);
        this.isConnected = false;
        this.device = null;
        this.notifyConnectionChange(false);
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
    this.disconnect();
    this.manager.destroy();
  }
}

// Export singleton instance
const bleService = new BleService();
export default bleService;
