/**
 * Mock for react-native-ble-plx module
 * Used for testing BLE characteristic handlers
 */

export class Subscription {
  private callback: (() => void) | null = null;

  remove(): void {
    if (this.callback) {
      this.callback();
      this.callback = null;
    }
  }

  setRemoveCallback(cb: () => void): void {
    this.callback = cb;
  }
}

export interface Characteristic {
  value: string | null;
  uuid: string;
  serviceUUID: string;
}

export class Device {
  id: string;
  name: string | null;
  private monitorCallbacks: Map<
    string,
    (error: Error | null, characteristic: Characteristic | null) => void
  > = new Map();
  private subscriptions: Map<string, Subscription> = new Map();
  private characteristicValues: Map<string, string> = new Map();
  private writeHandler:
    | ((serviceUUID: string, characteristicUUID: string, value: string) => void)
    | null = null;

  constructor(id: string, name: string | null = null) {
    this.id = id;
    this.name = name;
  }

  async connect(): Promise<Device> {
    return this;
  }

  async discoverAllServicesAndCharacteristics(): Promise<Device> {
    return this;
  }

  async cancelConnection(): Promise<Device> {
    return this;
  }

  monitorCharacteristicForService(
    serviceUUID: string,
    characteristicUUID: string,
    callback: (error: Error | null, characteristic: Characteristic | null) => void
  ): Subscription {
    const key = `${serviceUUID}:${characteristicUUID}`;
    this.monitorCallbacks.set(key, callback);

    const subscription = new Subscription();
    subscription.setRemoveCallback(() => {
      this.monitorCallbacks.delete(key);
      this.subscriptions.delete(key);
    });

    this.subscriptions.set(key, subscription);
    return subscription;
  }

  async readCharacteristicForService(
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<Characteristic> {
    const key = `${serviceUUID}:${characteristicUUID}`;
    const value = this.characteristicValues.get(key) ?? null;

    return {
      value,
      uuid: characteristicUUID,
      serviceUUID,
    };
  }

  async writeCharacteristicWithResponseForService(
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): Promise<Characteristic> {
    if (this.writeHandler) {
      this.writeHandler(serviceUUID, characteristicUUID, value);
    }

    return {
      value,
      uuid: characteristicUUID,
      serviceUUID,
    };
  }

  // Test helper methods
  simulateNotification(
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): void {
    const key = `${serviceUUID}:${characteristicUUID}`;
    const callback = this.monitorCallbacks.get(key);

    if (callback) {
      callback(null, {
        value,
        uuid: characteristicUUID,
        serviceUUID,
      });
    }
  }

  simulateError(
    serviceUUID: string,
    characteristicUUID: string,
    error: Error
  ): void {
    const key = `${serviceUUID}:${characteristicUUID}`;
    const callback = this.monitorCallbacks.get(key);

    if (callback) {
      callback(error, null);
    }
  }

  setCharacteristicValue(
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ): void {
    const key = `${serviceUUID}:${characteristicUUID}`;
    this.characteristicValues.set(key, value);
  }

  setWriteHandler(
    handler: (
      serviceUUID: string,
      characteristicUUID: string,
      value: string
    ) => void
  ): void {
    this.writeHandler = handler;
  }

  clearWriteHandler(): void {
    this.writeHandler = null;
  }
}

export class BleManager {
  private devices: Map<string, Device> = new Map();
  private scanCallback:
    | ((error: Error | null, device: Device | null) => void)
    | null = null;

  destroy(): void {
    this.devices.clear();
    this.scanCallback = null;
  }

  startDeviceScan(
    _serviceUUIDs: string[] | null,
    _options: object | null,
    callback: (error: Error | null, device: Device | null) => void
  ): void {
    this.scanCallback = callback;
  }

  stopDeviceScan(): void {
    this.scanCallback = null;
  }

  // Test helper methods
  simulateDeviceFound(device: Device): void {
    if (this.scanCallback) {
      this.scanCallback(null, device);
    }
  }

  simulateScanError(error: Error): void {
    if (this.scanCallback) {
      this.scanCallback(error, null);
    }
  }

  addDevice(device: Device): void {
    this.devices.set(device.id, device);
  }
}
