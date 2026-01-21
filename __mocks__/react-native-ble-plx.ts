/**
 * Mock implementation of react-native-ble-plx for testing
 */

// BLE States
export enum State {
  Unknown = 'Unknown',
  Resetting = 'Resetting',
  Unsupported = 'Unsupported',
  Unauthorized = 'Unauthorized',
  PoweredOff = 'PoweredOff',
  PoweredOn = 'PoweredOn',
}

// Mock Subscription class
export class Subscription {
  private callback: (() => void) | null = null;
  private removed = false;

  constructor(callback?: () => void) {
    this.callback = callback || null;
  }

  remove(): void {
    this.removed = true;
    if (this.callback) {
      this.callback();
    }
  }

  isRemoved(): boolean {
    return this.removed;
  }
}

// Mock Device class
export class Device {
  id: string;
  name: string | null;
  localName: string | null;
  rssi: number | null;
  manufacturerData: string | null;
  serviceUUIDs: string[] | null;
  private disconnectCallback:
    | ((error: Error | null, device: Device) => void)
    | null = null;
  private isConnected = false;

  constructor(data: Partial<Device> = {}) {
    this.id = data.id || 'mock-device-id';
    this.name = data.name ?? 'Mock Device';
    this.localName = data.localName ?? null;
    this.rssi = data.rssi ?? -50;
    this.manufacturerData = data.manufacturerData ?? null;
    this.serviceUUIDs = data.serviceUUIDs ?? null;
  }

  async connect(): Promise<Device> {
    this.isConnected = true;
    return this;
  }

  async discoverAllServicesAndCharacteristics(): Promise<Device> {
    return this;
  }

  async cancelConnection(): Promise<Device> {
    this.isConnected = false;
    return this;
  }

  onDisconnected(
    callback: (error: Error | null, device: Device) => void
  ): Subscription {
    this.disconnectCallback = callback;
    return new Subscription(() => {
      this.disconnectCallback = null;
    });
  }

  // Test helper to simulate disconnection
  simulateDisconnect(error: Error | null = null): void {
    this.isConnected = false;
    if (this.disconnectCallback) {
      this.disconnectCallback(error, this);
    }
  }
}

// Mock device storage for scan simulation
interface MockScanDevice {
  device: Device;
  delay?: number;
}

// BleManager mock
export class BleManager {
  private currentState: State = State.PoweredOn;
  private stateCallback:
    | ((state: State) => void)
    | null = null;
  private scanCallback:
    | ((error: Error | null, device: Device | null) => void)
    | null = null;
  private isScanning = false;
  private mockDevices: MockScanDevice[] = [];
  private destroyed = false;
  private connectedDevices: Map<string, Device> = new Map();

  constructor() {
    // Default mock devices for testing
    this.mockDevices = [
      {
        device: new Device({
          id: 'flowstate-headband-001',
          name: 'FlowState Headband',
          rssi: -45,
        }),
        delay: 100,
      },
      {
        device: new Device({
          id: 'flowstate-earpiece-001',
          name: 'FlowState Earpiece',
          rssi: -55,
        }),
        delay: 200,
      },
      {
        device: new Device({
          id: 'other-device-001',
          name: 'Other Device',
          rssi: -70,
        }),
        delay: 150,
      },
    ];
  }

  // Allow tests to configure mock devices
  setMockDevices(devices: MockScanDevice[]): void {
    this.mockDevices = devices;
  }

  // Allow tests to set the BLE state
  setMockState(state: State): void {
    this.currentState = state;
    if (this.stateCallback) {
      this.stateCallback(state);
    }
  }

  async state(): Promise<State> {
    return this.currentState;
  }

  onStateChange(
    callback: (state: State) => void,
    emitCurrentState?: boolean
  ): Subscription {
    this.stateCallback = callback;
    if (emitCurrentState) {
      callback(this.currentState);
    }
    return new Subscription(() => {
      this.stateCallback = null;
    });
  }

  startDeviceScan(
    uuids: string[] | null,
    options: { allowDuplicates?: boolean } | null,
    callback: (error: Error | null, device: Device | null) => void
  ): Subscription {
    if (this.destroyed) {
      callback(new Error('BleManager is destroyed'), null);
      return new Subscription();
    }

    if (this.currentState !== State.PoweredOn) {
      callback(new Error('Bluetooth is not powered on'), null);
      return new Subscription();
    }

    this.isScanning = true;
    this.scanCallback = callback;

    // Simulate device discovery with delays
    this.mockDevices.forEach(({ device, delay = 0 }) => {
      setTimeout(() => {
        if (this.isScanning && this.scanCallback) {
          this.scanCallback(null, device);
        }
      }, delay);
    });

    return new Subscription(() => {
      this.stopDeviceScan();
    });
  }

  stopDeviceScan(): void {
    this.isScanning = false;
    this.scanCallback = null;
  }

  async connectToDevice(
    deviceId: string,
    options?: { requestMTU?: number }
  ): Promise<Device> {
    if (this.destroyed) {
      throw new Error('BleManager is destroyed');
    }

    // Find the device in mock devices
    const mockDevice = this.mockDevices.find(
      (d) => d.device.id === deviceId
    );

    let device: Device;
    if (mockDevice) {
      device = mockDevice.device;
    } else {
      // Create a new device if not found
      device = new Device({ id: deviceId, name: 'Unknown Device' });
    }

    await device.connect();
    this.connectedDevices.set(deviceId, device);

    return device;
  }

  async cancelDeviceConnection(deviceId: string): Promise<Device> {
    const device = this.connectedDevices.get(deviceId);
    if (device) {
      await device.cancelConnection();
      this.connectedDevices.delete(deviceId);
      return device;
    }
    throw new Error(`Device ${deviceId} not found`);
  }

  async connectedDevicesList(): Promise<Device[]> {
    return Array.from(this.connectedDevices.values());
  }

  destroy(): void {
    this.destroyed = true;
    this.stopDeviceScan();
    this.stateCallback = null;
    this.connectedDevices.clear();
  }

  // Test helper methods
  isDestroyed(): boolean {
    return this.destroyed;
  }

  getIsScanning(): boolean {
    return this.isScanning;
  }

  // Simulate scan error
  simulateScanError(error: Error): void {
    if (this.scanCallback) {
      this.scanCallback(error, null);
    }
  }
}

// Export types that might be needed
export type BleError = Error;
