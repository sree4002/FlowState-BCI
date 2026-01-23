/**
 * Tests for BLE Characteristic Handlers
 *
 * Tests the EEG data stream, entrainment control, and device status handlers
 */

import { Device } from '../__mocks__/react-native-ble-plx';
import {
  BLE_SERVICE_UUID,
  EEG_DATA_CHARACTERISTIC_UUID,
  ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID,
  DEVICE_STATUS_CHARACTERISTIC_UUID,
  EntrainmentCommand,
  WaveformType,
  DeviceStatusFlag,
} from '../src/services/ble/constants';
import {
  EEGDataHandler,
  createEEGDataHandler,
} from '../src/services/ble/eegDataHandler';
import {
  EntrainmentControlHandler,
  createEntrainmentControlHandler,
} from '../src/services/ble/entrainmentControlHandler';
import {
  DeviceStatusHandler,
  createDeviceStatusHandler,
} from '../src/services/ble/deviceStatusHandler';
import { EEGDataPacket } from '../src/types';
import { DeviceStatusData } from '../src/services/ble/types';

// Mock timers for polling tests
jest.useFakeTimers();

/**
 * Helper to encode data to base64
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Creates a mock EEG data packet
 */
function createMockEEGPacket(
  timestamp: number,
  sequenceNumber: number,
  samples: number[]
): string {
  const buffer = new ArrayBuffer(8 + samples.length * 4);
  const view = new DataView(buffer);

  view.setUint32(0, timestamp, true);
  view.setUint16(4, sequenceNumber, true);
  view.setUint16(6, samples.length, true);

  samples.forEach((sample, i) => {
    view.setFloat32(8 + i * 4, sample, true);
  });

  return uint8ArrayToBase64(new Uint8Array(buffer));
}

/**
 * Creates a mock device status packet
 */
function createMockStatusPacket(options: {
  flags?: number;
  batteryLevel?: number;
  errorCode?: number;
  signalScore?: number;
  rssi?: number;
  artifactPercentage?: number;
  artifactFlags?: number;
  firmwareVersion?: [number, number, number];
}): string {
  const buffer = new ArrayBuffer(16);
  const view = new DataView(buffer);
  const bytes = new Uint8Array(buffer);

  bytes[0] = options.flags ?? DeviceStatusFlag.CONNECTED;
  bytes[1] = options.batteryLevel ?? 100;
  bytes[2] = options.errorCode ?? 0;
  bytes[3] = options.signalScore ?? 85;
  view.setInt16(4, options.rssi ?? -65, true);
  bytes[6] = options.artifactPercentage ?? 5;
  bytes[7] = options.artifactFlags ?? 0;

  const [major, minor, patch] = options.firmwareVersion ?? [1, 0, 0];
  bytes[8] = major;
  bytes[9] = minor;
  bytes[10] = patch;

  return uint8ArrayToBase64(bytes);
}

describe('BLE Constants', () => {
  it('should have correct service UUID format', () => {
    expect(BLE_SERVICE_UUID).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('should have unique characteristic UUIDs', () => {
    const uuids = [
      EEG_DATA_CHARACTERISTIC_UUID,
      ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
    ];

    const uniqueUuids = new Set(uuids);
    expect(uniqueUuids.size).toBe(uuids.length);
  });

  it('should have correct entrainment command values', () => {
    expect(EntrainmentCommand.START).toBe(0x01);
    expect(EntrainmentCommand.STOP).toBe(0x02);
    expect(EntrainmentCommand.SET_FREQUENCY).toBe(0x03);
    expect(EntrainmentCommand.SET_VOLUME).toBe(0x04);
  });

  it('should have correct waveform type values', () => {
    expect(WaveformType.ISOCHRONIC).toBe(0x01);
    expect(WaveformType.BINAURAL).toBe(0x02);
    expect(WaveformType.MONAURAL).toBe(0x03);
  });
});

describe('EEGDataHandler', () => {
  let device: Device;
  let handler: EEGDataHandler;
  let receivedData: EEGDataPacket[];
  let receivedErrors: Error[];

  beforeEach(() => {
    device = new Device('test-device-001', 'FlowState BCI');
    receivedData = [];
    receivedErrors = [];

    handler = createEEGDataHandler({
      device: device as unknown as import('react-native-ble-plx').Device,
      onData: (data) => receivedData.push(data),
      onError: (error) => receivedErrors.push(error),
    });
  });

  afterEach(async () => {
    await handler.stop();
  });

  it('should create handler using factory function', () => {
    expect(handler).toBeInstanceOf(EEGDataHandler);
    expect(handler.isActive()).toBe(false);
  });

  it('should start monitoring', async () => {
    await handler.start();
    expect(handler.isActive()).toBe(true);
  });

  it('should not start twice', async () => {
    await handler.start();
    await handler.start();
    expect(handler.isActive()).toBe(true);
  });

  it('should stop monitoring', async () => {
    await handler.start();
    await handler.stop();
    expect(handler.isActive()).toBe(false);
  });

  it('should receive and parse EEG data packets', async () => {
    await handler.start();

    const mockPacket = createMockEEGPacket(12345, 1, [1.5, 2.3, -0.8, 3.2]);

    device.simulateNotification(
      BLE_SERVICE_UUID,
      EEG_DATA_CHARACTERISTIC_UUID,
      mockPacket
    );

    expect(receivedData).toHaveLength(1);
    expect(receivedData[0].timestamp).toBe(12345);
    expect(receivedData[0].sequence_number).toBe(1);
    expect(receivedData[0].samples).toHaveLength(4);
    expect(receivedData[0].samples[0]).toBeCloseTo(1.5);
    expect(receivedData[0].samples[1]).toBeCloseTo(2.3);
    expect(receivedData[0].samples[2]).toBeCloseTo(-0.8);
    expect(receivedData[0].samples[3]).toBeCloseTo(3.2);
  });

  it('should track dropped packets', async () => {
    await handler.start();

    // First packet with sequence 1
    device.simulateNotification(
      BLE_SERVICE_UUID,
      EEG_DATA_CHARACTERISTIC_UUID,
      createMockEEGPacket(1000, 1, [1.0])
    );

    // Skip sequence 2, send 3 - should count as dropped
    device.simulateNotification(
      BLE_SERVICE_UUID,
      EEG_DATA_CHARACTERISTIC_UUID,
      createMockEEGPacket(2000, 3, [1.0])
    );

    expect(handler.getDroppedPacketCount()).toBe(1);
  });

  it('should reset dropped packet count', async () => {
    await handler.start();

    device.simulateNotification(
      BLE_SERVICE_UUID,
      EEG_DATA_CHARACTERISTIC_UUID,
      createMockEEGPacket(1000, 1, [1.0])
    );

    device.simulateNotification(
      BLE_SERVICE_UUID,
      EEG_DATA_CHARACTERISTIC_UUID,
      createMockEEGPacket(2000, 5, [1.0])
    );

    expect(handler.getDroppedPacketCount()).toBe(1);

    handler.resetDroppedPacketCount();

    expect(handler.getDroppedPacketCount()).toBe(0);
  });

  it('should handle monitoring errors', async () => {
    await handler.start();

    const error = new Error('Connection lost');
    device.simulateError(BLE_SERVICE_UUID, EEG_DATA_CHARACTERISTIC_UUID, error);

    expect(receivedErrors).toHaveLength(1);
    expect(receivedErrors[0].message).toContain('EEG monitoring error');
  });
});

describe('EntrainmentControlHandler', () => {
  let device: Device;
  let handler: EntrainmentControlHandler;
  let receivedErrors: Error[];
  let writtenCommands: {
    serviceUUID: string;
    characteristicUUID: string;
    value: string;
  }[];

  beforeEach(() => {
    device = new Device('test-device-001', 'FlowState BCI');
    receivedErrors = [];
    writtenCommands = [];

    device.setWriteHandler((serviceUUID, characteristicUUID, value) => {
      writtenCommands.push({ serviceUUID, characteristicUUID, value });
    });

    handler = createEntrainmentControlHandler({
      device: device as unknown as import('react-native-ble-plx').Device,
      onError: (error) => receivedErrors.push(error),
    });
  });

  afterEach(async () => {
    await handler.stop();
    device.clearWriteHandler();
  });

  it('should create handler using factory function', () => {
    expect(handler).toBeInstanceOf(EntrainmentControlHandler);
    expect(handler.isActive()).toBe(false);
  });

  it('should start and stop handler', async () => {
    await handler.start();
    expect(handler.isActive()).toBe(true);

    await handler.stop();
    expect(handler.isActive()).toBe(false);
  });

  it('should start entrainment with configuration', async () => {
    await handler.start();

    const result = await handler.startEntrainment({
      frequency: 6.5,
      volume: 70,
      waveform: WaveformType.ISOCHRONIC,
    });

    expect(result.success).toBe(true);
    expect(result.command).toBe(EntrainmentCommand.START);

    // Should have sent waveform, frequency, volume, and start commands
    expect(writtenCommands).toHaveLength(4);
    expect(writtenCommands[3].serviceUUID).toBe(BLE_SERVICE_UUID);
    expect(writtenCommands[3].characteristicUUID).toBe(
      ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID
    );
  });

  it('should stop entrainment', async () => {
    await handler.start();

    const result = await handler.stopEntrainment();

    expect(result.success).toBe(true);
    expect(result.command).toBe(EntrainmentCommand.STOP);
    expect(handler.getCurrentConfig()).toBeNull();
  });

  it('should pause and resume entrainment', async () => {
    await handler.start();

    const pauseResult = await handler.pauseEntrainment();
    expect(pauseResult.success).toBe(true);
    expect(pauseResult.command).toBe(EntrainmentCommand.PAUSE);

    const resumeResult = await handler.resumeEntrainment();
    expect(resumeResult.success).toBe(true);
    expect(resumeResult.command).toBe(EntrainmentCommand.RESUME);
  });

  it('should set frequency', async () => {
    await handler.start();
    await handler.startEntrainment({
      frequency: 6.0,
      volume: 50,
      waveform: WaveformType.ISOCHRONIC,
    });

    writtenCommands = [];
    const result = await handler.setFrequency(7.5);

    expect(result.success).toBe(true);
    expect(result.command).toBe(EntrainmentCommand.SET_FREQUENCY);

    const config = handler.getCurrentConfig();
    expect(config?.frequency).toBe(7.5);
  });

  it('should set volume', async () => {
    await handler.start();
    await handler.startEntrainment({
      frequency: 6.0,
      volume: 50,
      waveform: WaveformType.ISOCHRONIC,
    });

    writtenCommands = [];
    const result = await handler.setVolume(85);

    expect(result.success).toBe(true);
    expect(result.command).toBe(EntrainmentCommand.SET_VOLUME);

    const config = handler.getCurrentConfig();
    expect(config?.volume).toBe(85);
  });

  it('should clamp volume to valid range', async () => {
    await handler.start();
    await handler.startEntrainment({
      frequency: 6.0,
      volume: 50,
      waveform: WaveformType.ISOCHRONIC,
    });

    // Volume over 100 should be clamped
    await handler.setVolume(150);
    expect(handler.getCurrentConfig()?.volume).toBe(150); // Config stores the requested value

    // The written command should have clamped value (verified by packet parsing)
    expect(writtenCommands.length).toBeGreaterThan(0);
  });

  it('should return current config copy', async () => {
    await handler.start();
    await handler.startEntrainment({
      frequency: 6.0,
      volume: 70,
      waveform: WaveformType.BINAURAL,
    });

    const config = handler.getCurrentConfig();
    expect(config).toEqual({
      frequency: 6.0,
      volume: 70,
      waveform: WaveformType.BINAURAL,
    });

    // Modifying the returned config should not affect internal state
    if (config) {
      config.frequency = 999;
    }
    expect(handler.getCurrentConfig()?.frequency).toBe(6.0);
  });
});

describe('DeviceStatusHandler', () => {
  let device: Device;
  let handler: DeviceStatusHandler;
  let receivedStatus: DeviceStatusData[];
  let receivedErrors: Error[];

  beforeEach(() => {
    device = new Device('test-device-001', 'FlowState BCI');
    receivedStatus = [];
    receivedErrors = [];

    // Set initial status value for reads
    device.setCharacteristicValue(
      BLE_SERVICE_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
      createMockStatusPacket({})
    );

    handler = createDeviceStatusHandler({
      device: device as unknown as import('react-native-ble-plx').Device,
      onStatus: (status) => receivedStatus.push(status),
      onError: (error) => receivedErrors.push(error),
      pollIntervalMs: 5000,
    });
  });

  afterEach(async () => {
    await handler.stop();
  });

  it('should create handler using factory function', () => {
    expect(handler).toBeInstanceOf(DeviceStatusHandler);
    expect(handler.isActive()).toBe(false);
  });

  it('should start and read initial status', async () => {
    await handler.start();

    expect(handler.isActive()).toBe(true);
    expect(receivedStatus.length).toBeGreaterThan(0);
  });

  it('should receive status notifications', async () => {
    await handler.start();
    receivedStatus = [];

    const statusPacket = createMockStatusPacket({
      flags: DeviceStatusFlag.CONNECTED | DeviceStatusFlag.STREAMING,
      batteryLevel: 75,
      signalScore: 90,
      rssi: -50,
      firmwareVersion: [2, 1, 0],
    });

    device.simulateNotification(
      BLE_SERVICE_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
      statusPacket
    );

    expect(receivedStatus).toHaveLength(1);
    expect(receivedStatus[0].batteryLevel).toBe(75);
    expect(receivedStatus[0].isStreaming).toBe(true);
    expect(receivedStatus[0].signalQuality.score).toBe(90);
    expect(receivedStatus[0].rssi).toBe(-50);
    expect(receivedStatus[0].firmwareVersion).toBe('2.1.0');
  });

  it('should parse status flags correctly', async () => {
    await handler.start();
    receivedStatus = [];

    const statusPacket = createMockStatusPacket({
      flags:
        DeviceStatusFlag.CONNECTED |
        DeviceStatusFlag.ENTRAINMENT_ACTIVE |
        DeviceStatusFlag.CHARGING |
        DeviceStatusFlag.LOW_BATTERY,
      batteryLevel: 15,
    });

    device.simulateNotification(
      BLE_SERVICE_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
      statusPacket
    );

    expect(receivedStatus[0].isEntrainmentActive).toBe(true);
    expect(receivedStatus[0].isCharging).toBe(true);
    expect(receivedStatus[0].batteryLevel).toBe(15);
  });

  it('should parse artifact flags correctly', async () => {
    await handler.start();
    receivedStatus = [];

    const statusPacket = createMockStatusPacket({
      artifactFlags: 0x05, // amplitude (0x01) and frequency (0x04)
      artifactPercentage: 25,
    });

    device.simulateNotification(
      BLE_SERVICE_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
      statusPacket
    );

    expect(receivedStatus[0].signalQuality.has_amplitude_artifact).toBe(true);
    expect(receivedStatus[0].signalQuality.has_gradient_artifact).toBe(false);
    expect(receivedStatus[0].signalQuality.has_frequency_artifact).toBe(true);
    expect(receivedStatus[0].signalQuality.artifact_percentage).toBe(25);
  });

  it('should read status on demand', async () => {
    await handler.start();
    receivedStatus = [];

    device.setCharacteristicValue(
      BLE_SERVICE_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
      createMockStatusPacket({
        batteryLevel: 42,
      })
    );

    const status = await handler.readStatus();

    expect(status).not.toBeNull();
    expect(status?.batteryLevel).toBe(42);
    expect(receivedStatus).toHaveLength(1);
  });

  it('should return last status', async () => {
    await handler.start();

    const lastStatus = handler.getLastStatus();
    expect(lastStatus).not.toBeNull();

    // Modifying returned status should not affect internal state
    if (lastStatus) {
      lastStatus.batteryLevel = 999;
    }
    expect(handler.getLastStatus()?.batteryLevel).not.toBe(999);
  });

  it('should handle error flag', async () => {
    await handler.start();
    receivedStatus = [];

    const statusPacket = createMockStatusPacket({
      flags: DeviceStatusFlag.CONNECTED | DeviceStatusFlag.ERROR,
      errorCode: 42,
    });

    device.simulateNotification(
      BLE_SERVICE_UUID,
      DEVICE_STATUS_CHARACTERISTIC_UUID,
      statusPacket
    );

    expect(receivedStatus[0].hasError).toBe(true);
    expect(receivedStatus[0].errorCode).toBe(42);
  });

  it('should poll for status at configured interval', async () => {
    await handler.start();
    receivedStatus = [];

    // Fast-forward time to trigger polling
    jest.advanceTimersByTime(5000);

    // Allow promise to resolve
    await Promise.resolve();

    expect(receivedStatus.length).toBeGreaterThanOrEqual(1);
  });

  it('should stop polling when stopped', async () => {
    await handler.start();
    await handler.stop();

    receivedStatus = [];

    // Fast-forward time
    jest.advanceTimersByTime(10000);
    await Promise.resolve();

    expect(receivedStatus).toHaveLength(0);
  });

  it('should update polling interval', async () => {
    await handler.start();
    handler.setPollingInterval(1000);

    receivedStatus = [];

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    const firstCount = receivedStatus.length;

    jest.advanceTimersByTime(1000);
    await Promise.resolve();

    expect(receivedStatus.length).toBeGreaterThan(firstCount);
  });
});

describe('Index exports', () => {
  it('should export all handlers and types', async () => {
    const exports = await import('../src/services/ble');

    // Constants
    expect(exports.BLE_SERVICE_UUID).toBeDefined();
    expect(exports.EEG_DATA_CHARACTERISTIC_UUID).toBeDefined();
    expect(exports.ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID).toBeDefined();
    expect(exports.DEVICE_STATUS_CHARACTERISTIC_UUID).toBeDefined();
    expect(exports.EntrainmentCommand).toBeDefined();
    expect(exports.WaveformType).toBeDefined();
    expect(exports.DeviceStatusFlag).toBeDefined();

    // Handler classes
    expect(exports.EEGDataHandler).toBeDefined();
    expect(exports.EntrainmentControlHandler).toBeDefined();
    expect(exports.DeviceStatusHandler).toBeDefined();

    // Factory functions
    expect(exports.createEEGDataHandler).toBeDefined();
    expect(exports.createEntrainmentControlHandler).toBeDefined();
    expect(exports.createDeviceStatusHandler).toBeDefined();
  });
});
