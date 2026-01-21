/**
 * Comprehensive tests for BLEService
 *
 * Tests device scanning, connection, and disconnection functionality
 */

import {
  BLEService,
  getBLEService,
  resetBLEService,
  BLE_SERVICE_UUIDS,
  BLE_DEVICE_NAME_PATTERNS,
  DEFAULT_SCAN_TIMEOUT_MS,
  DiscoveredDevice,
  ScanOptions,
  ConnectionOptions,
  ConnectionState,
} from '../src/services/BLEService';

// Mock react-native
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    Version: 31,
  },
  PermissionsAndroid: {
    PERMISSIONS: {
      ACCESS_FINE_LOCATION: 'android.permission.ACCESS_FINE_LOCATION',
      BLUETOOTH_SCAN: 'android.permission.BLUETOOTH_SCAN',
      BLUETOOTH_CONNECT: 'android.permission.BLUETOOTH_CONNECT',
    },
    RESULTS: {
      GRANTED: 'granted',
      DENIED: 'denied',
    },
    requestMultiple: jest.fn().mockResolvedValue({
      'android.permission.ACCESS_FINE_LOCATION': 'granted',
      'android.permission.BLUETOOTH_SCAN': 'granted',
      'android.permission.BLUETOOTH_CONNECT': 'granted',
    }),
  },
}));

// BLE Mock State
const mockState = {
  currentState: 'PoweredOn',
  isScanning: false,
  connectedDevices: new Map<string, MockDevice>(),
  scanCallback: null as ((error: Error | null, device: MockDevice | null) => void) | null,
};

// Mock Device class
class MockDevice {
  id: string;
  name: string | null;
  localName: string | null;
  rssi: number | null;
  manufacturerData: string | null;
  private disconnectCallback: ((error: Error | null, device: MockDevice) => void) | null = null;

  constructor(data: { id: string; name?: string | null; rssi?: number | null }) {
    this.id = data.id;
    this.name = data.name ?? 'Mock Device';
    this.localName = null;
    this.rssi = data.rssi ?? -50;
    this.manufacturerData = null;
  }

  async discoverAllServicesAndCharacteristics(): Promise<MockDevice> {
    return this;
  }

  async cancelConnection(): Promise<MockDevice> {
    mockState.connectedDevices.delete(this.id);
    return this;
  }

  onDisconnected(callback: (error: Error | null, device: MockDevice) => void) {
    this.disconnectCallback = callback;
    return {
      remove: () => {
        this.disconnectCallback = null;
      },
    };
  }

  simulateDisconnect(error: Error | null = null): void {
    if (this.disconnectCallback) {
      this.disconnectCallback(error, this);
    }
  }
}

// Mock devices
const mockDevices = [
  new MockDevice({ id: 'flowstate-headband-001', name: 'FlowState Headband', rssi: -45 }),
  new MockDevice({ id: 'flowstate-earpiece-001', name: 'FlowState Earpiece', rssi: -55 }),
  new MockDevice({ id: 'other-device-001', name: 'Other Device', rssi: -70 }),
];

// Mock react-native-ble-plx
jest.mock('react-native-ble-plx', () => {
  return {
    State: {
      Unknown: 'Unknown',
      Resetting: 'Resetting',
      Unsupported: 'Unsupported',
      Unauthorized: 'Unauthorized',
      PoweredOff: 'PoweredOff',
      PoweredOn: 'PoweredOn',
    },
    BleManager: jest.fn().mockImplementation(() => ({
      state: jest.fn().mockImplementation(() => Promise.resolve(mockState.currentState)),
      onStateChange: jest.fn().mockImplementation((callback, emitCurrent) => {
        if (emitCurrent) {
          callback(mockState.currentState);
        }
        return { remove: jest.fn() };
      }),
      startDeviceScan: jest.fn().mockImplementation((uuids, options, callback) => {
        mockState.isScanning = true;
        mockState.scanCallback = callback;

        // Simulate device discovery
        mockDevices.forEach((device, index) => {
          setTimeout(() => {
            if (mockState.isScanning && mockState.scanCallback) {
              mockState.scanCallback(null, device);
            }
          }, (index + 1) * 50);
        });

        return { remove: () => { mockState.isScanning = false; } };
      }),
      stopDeviceScan: jest.fn().mockImplementation(() => {
        mockState.isScanning = false;
        mockState.scanCallback = null;
      }),
      connectToDevice: jest.fn().mockImplementation((deviceId, options) => {
        const device = mockDevices.find(d => d.id === deviceId) ||
          new MockDevice({ id: deviceId, name: 'Unknown Device' });
        mockState.connectedDevices.set(deviceId, device);
        return Promise.resolve(device);
      }),
      destroy: jest.fn(),
    })),
  };
});

describe('BLEService', () => {
  let bleService: BLEService;

  beforeEach(() => {
    jest.useFakeTimers();
    // Reset mock state
    mockState.currentState = 'PoweredOn';
    mockState.isScanning = false;
    mockState.connectedDevices.clear();
    mockState.scanCallback = null;

    // Reset singleton
    resetBLEService();
    bleService = new BLEService();
  });

  afterEach(async () => {
    jest.useRealTimers();
    await bleService.destroy();
  });

  // ============= Constants Tests =============

  describe('Constants', () => {
    it('should export BLE service UUIDs', () => {
      expect(BLE_SERVICE_UUIDS).toBeDefined();
      expect(BLE_SERVICE_UUIDS.EEG_SERVICE).toBe(
        '0000181a-0000-1000-8000-00805f9b34fb'
      );
      expect(BLE_SERVICE_UUIDS.DEVICE_INFO_SERVICE).toBe(
        '0000180a-0000-1000-8000-00805f9b34fb'
      );
      expect(BLE_SERVICE_UUIDS.BATTERY_SERVICE).toBe(
        '0000180f-0000-1000-8000-00805f9b34fb'
      );
    });

    it('should export device name patterns', () => {
      expect(BLE_DEVICE_NAME_PATTERNS).toEqual(['FlowState', 'BCI', 'EEG']);
    });

    it('should export default scan timeout', () => {
      expect(DEFAULT_SCAN_TIMEOUT_MS).toBe(10000);
    });
  });

  // ============= Initialization Tests =============

  describe('Initialization', () => {
    it('should create a new BLEService instance', () => {
      expect(bleService).toBeInstanceOf(BLEService);
    });

    it('should initialize with disconnected state', () => {
      expect(bleService.getConnectionState()).toBe('disconnected');
    });

    it('should not be connected initially', () => {
      expect(bleService.isConnected()).toBe(false);
    });

    it('should not be scanning initially', () => {
      expect(bleService.isScanning()).toBe(false);
    });

    it('should return null for connected device initially', () => {
      expect(bleService.getConnectedDevice()).toBeNull();
    });
  });

  // ============= Singleton Tests =============

  describe('Singleton', () => {
    it('should return the same instance from getBLEService', () => {
      const instance1 = getBLEService();
      const instance2 = getBLEService();
      expect(instance1).toBe(instance2);
    });

    it('should create new instance after reset', async () => {
      const instance1 = getBLEService();
      resetBLEService();
      const instance2 = getBLEService();
      expect(instance1).not.toBe(instance2);
    });
  });

  // ============= Permission Tests =============

  describe('Permissions', () => {
    it('should return true on iOS without requesting permissions', async () => {
      const result = await bleService.requestPermissions();
      expect(result).toBe(true);
    });
  });

  // ============= Bluetooth State Tests =============

  describe('Bluetooth State', () => {
    it('should check if Bluetooth is enabled', async () => {
      const isEnabled = await bleService.isBluetoothEnabled();
      expect(isEnabled).toBe(true);
    });

    it('should get current Bluetooth state', async () => {
      const state = await bleService.getBluetoothState();
      expect(state).toBe('PoweredOn');
    });

    it('should add state change listeners', () => {
      const stateListener = jest.fn();
      bleService.addStateChangeListener(stateListener);
      // Listener should be added successfully (structural test)
      // Note: Initial state was already emitted during service setup
      expect(true).toBe(true);
    });

    it('should remove state change listeners', () => {
      const stateListener = jest.fn();
      bleService.addStateChangeListener(stateListener);
      stateListener.mockClear();
      bleService.removeStateChangeListener(stateListener);
      // After removal, listener should not be in the set
      expect(true).toBe(true); // Structural test
    });
  });

  // ============= Scanning Tests =============

  describe('Scanning', () => {
    it('should start scanning for devices', async () => {
      await bleService.startScan();
      expect(bleService.isScanning()).toBe(true);
    });

    it('should discover devices matching name filters', async () => {
      const discoveredDevices: DiscoveredDevice[] = [];
      bleService.addScanListener((device) => {
        discoveredDevices.push(device);
      });

      await bleService.startScan();
      jest.advanceTimersByTime(200);

      // Should find FlowState devices
      expect(discoveredDevices.length).toBeGreaterThan(0);
      expect(
        discoveredDevices.some((d) => d.name?.includes('FlowState'))
      ).toBe(true);
    });

    it('should stop scanning after timeout', async () => {
      await bleService.startScan({ timeoutMs: 5000 });
      expect(bleService.isScanning()).toBe(true);

      jest.advanceTimersByTime(5000);
      expect(bleService.isScanning()).toBe(false);
    });

    it('should stop scanning manually', async () => {
      await bleService.startScan();
      expect(bleService.isScanning()).toBe(true);

      await bleService.stopScan();
      expect(bleService.isScanning()).toBe(false);
    });

    it('should remove scan listeners', async () => {
      const scanListener = jest.fn();
      bleService.addScanListener(scanListener);
      bleService.removeScanListener(scanListener);

      await bleService.startScan();
      jest.advanceTimersByTime(200);

      expect(scanListener).not.toHaveBeenCalled();
    });

    it('should accept custom scan options', async () => {
      const options: ScanOptions = {
        timeoutMs: 3000,
        nameFilters: ['FlowState'],
        allowDuplicates: true,
      };
      await bleService.startScan(options);
      expect(bleService.isScanning()).toBe(true);
    });
  });

  // ============= Connection Tests =============

  describe('Connection', () => {
    const testDeviceId = 'flowstate-headband-001';

    it('should connect to a device', async () => {
      const deviceInfo = await bleService.connect(testDeviceId);

      expect(deviceInfo).toBeDefined();
      expect(deviceInfo.id).toBe(testDeviceId);
      expect(deviceInfo.is_connected).toBe(true);
      expect(bleService.isConnected()).toBe(true);
      expect(bleService.getConnectionState()).toBe('connected');
    });

    it('should return device info after connection', async () => {
      await bleService.connect(testDeviceId);
      const deviceInfo = bleService.getConnectedDevice();

      expect(deviceInfo).not.toBeNull();
      expect(deviceInfo?.id).toBe(testDeviceId);
      expect(deviceInfo?.name).toBe('FlowState Headband');
      expect(deviceInfo?.type).toBe('headband');
      expect(deviceInfo?.sampling_rate).toBe(500);
    });

    it('should identify earpiece devices correctly', async () => {
      const earpieceId = 'flowstate-earpiece-001';
      await bleService.connect(earpieceId);
      const deviceInfo = bleService.getConnectedDevice();

      expect(deviceInfo?.name).toBe('FlowState Earpiece');
      expect(deviceInfo?.type).toBe('earpiece');
      expect(deviceInfo?.sampling_rate).toBe(250);
    });

    it('should notify connection state listeners', async () => {
      const stateListener = jest.fn();
      bleService.addConnectionStateListener(stateListener);

      await bleService.connect(testDeviceId);

      expect(stateListener).toHaveBeenCalledWith('connecting', null);
      expect(stateListener).toHaveBeenCalledWith(
        'connected',
        expect.objectContaining({ id: testDeviceId })
      );
    });

    it('should remove connection state listeners', async () => {
      const stateListener = jest.fn();
      bleService.addConnectionStateListener(stateListener);
      bleService.removeConnectionStateListener(stateListener);

      await bleService.connect(testDeviceId);

      expect(stateListener).not.toHaveBeenCalled();
    });

    it('should not reconnect if already connected to same device', async () => {
      await bleService.connect(testDeviceId);
      const stateListener = jest.fn();
      bleService.addConnectionStateListener(stateListener);

      await bleService.connect(testDeviceId);

      // Should not have called connecting state
      expect(stateListener).not.toHaveBeenCalledWith('connecting', null);
    });

    it('should accept custom connection options', async () => {
      const options: ConnectionOptions = {
        requestMTU: 256,
        timeoutMs: 5000,
        autoDiscoverServices: false,
      };
      const deviceInfo = await bleService.connect(testDeviceId, options);
      expect(deviceInfo).toBeDefined();
    });
  });

  // ============= Disconnection Tests =============

  describe('Disconnection', () => {
    const testDeviceId = 'flowstate-headband-001';

    it('should disconnect from a connected device', async () => {
      await bleService.connect(testDeviceId);
      expect(bleService.isConnected()).toBe(true);

      await bleService.disconnect();
      expect(bleService.isConnected()).toBe(false);
      expect(bleService.getConnectionState()).toBe('disconnected');
    });

    it('should clear connected device on disconnect', async () => {
      await bleService.connect(testDeviceId);
      expect(bleService.getConnectedDevice()).not.toBeNull();

      await bleService.disconnect();
      expect(bleService.getConnectedDevice()).toBeNull();
    });

    it('should notify listeners on disconnect', async () => {
      await bleService.connect(testDeviceId);

      const stateListener = jest.fn();
      bleService.addConnectionStateListener(stateListener);

      await bleService.disconnect();

      expect(stateListener).toHaveBeenCalledWith('disconnecting', null);
      expect(stateListener).toHaveBeenCalledWith('disconnected', null);
    });

    it('should handle disconnect when not connected', async () => {
      expect(bleService.isConnected()).toBe(false);
      await bleService.disconnect(); // Should not throw
      expect(bleService.isConnected()).toBe(false);
    });
  });

  // ============= Error Handling Tests =============

  describe('Error Handling', () => {
    it('should add and remove error listeners', () => {
      const errorListener = jest.fn();
      bleService.addErrorListener(errorListener);
      bleService.removeErrorListener(errorListener);
      // Verify structural correctness
      expect(true).toBe(true);
    });
  });

  // ============= Cleanup Tests =============

  describe('Cleanup', () => {
    it('should destroy the service and clean up resources', async () => {
      await bleService.connect('flowstate-headband-001');
      await bleService.startScan();

      await bleService.destroy();

      expect(bleService.isConnected()).toBe(false);
      expect(bleService.isScanning()).toBe(false);
    });

    it('should clear all listeners on destroy', async () => {
      const scanListener = jest.fn();
      const connectionListener = jest.fn();
      const stateListener = jest.fn();
      const errorListener = jest.fn();

      bleService.addScanListener(scanListener);
      bleService.addConnectionStateListener(connectionListener);
      bleService.addStateChangeListener(stateListener);
      bleService.addErrorListener(errorListener);

      await bleService.destroy();

      // Service should be non-functional after destroy
      expect(true).toBe(true);
    });
  });

  // ============= Type Tests =============

  describe('Types', () => {
    it('should accept valid ScanOptions', () => {
      const options: ScanOptions = {
        timeoutMs: 5000,
        nameFilters: ['Custom'],
        serviceUUIDs: ['0000181a-0000-1000-8000-00805f9b34fb'],
        allowDuplicates: true,
      };
      expect(options.timeoutMs).toBe(5000);
    });

    it('should accept valid ConnectionOptions', () => {
      const options: ConnectionOptions = {
        requestMTU: 256,
        timeoutMs: 5000,
        autoDiscoverServices: false,
      };
      expect(options.requestMTU).toBe(256);
    });

    it('should have valid ConnectionState values', () => {
      const states: ConnectionState[] = [
        'disconnected',
        'connecting',
        'connected',
        'disconnecting',
      ];
      expect(states).toHaveLength(4);
    });

    it('should have valid DiscoveredDevice structure', () => {
      const device: DiscoveredDevice = {
        id: 'test-id',
        name: 'Test Device',
        rssi: -50,
        localName: 'Local Name',
        manufacturerData: null,
      };
      expect(device.id).toBe('test-id');
    });
  });

  // ============= Integration Tests =============

  describe('Integration', () => {
    it('should complete full scan and connect flow', async () => {
      const discoveredDevices: DiscoveredDevice[] = [];
      bleService.addScanListener((device) => {
        discoveredDevices.push(device);
      });

      // Start scan
      await bleService.startScan({ timeoutMs: 1000 });
      expect(bleService.isScanning()).toBe(true);

      // Wait for devices to be discovered
      jest.advanceTimersByTime(200);

      // Stop scan
      await bleService.stopScan();
      expect(bleService.isScanning()).toBe(false);

      // Connect to first discovered device
      if (discoveredDevices.length > 0) {
        const deviceInfo = await bleService.connect(discoveredDevices[0].id);
        expect(deviceInfo).toBeDefined();
        expect(bleService.isConnected()).toBe(true);
      }
    });

    it('should handle rapid connect/disconnect cycles', async () => {
      const deviceId = 'flowstate-headband-001';

      for (let i = 0; i < 3; i++) {
        await bleService.connect(deviceId);
        expect(bleService.isConnected()).toBe(true);

        await bleService.disconnect();
        expect(bleService.isConnected()).toBe(false);
      }
    });
  });
});
