/**
 * Device Status Handler
 *
 * Handles BLE read and notify operations for device status.
 * Supports reading current status and subscribing to status updates.
 */

import { Device, Subscription } from 'react-native-ble-plx';
import { SignalQuality } from '../../types';
import {
  BLE_SERVICE_UUID,
  DEVICE_STATUS_CHARACTERISTIC_UUID,
  DeviceStatusFlag,
  STATUS_PACKET_SIZE,
} from './constants';
import {
  CharacteristicHandler,
  DeviceStatusCallback,
  ErrorCallback,
  DeviceStatusHandlerConfig,
  DeviceStatusData,
} from './types';

/**
 * Decodes a base64 string to a Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Parses raw BLE data into DeviceStatusData
 *
 * Packet format (16 bytes):
 * - Byte 0: Status flags (bitmask)
 * - Byte 1: Battery level (0-100)
 * - Byte 2: Error code
 * - Byte 3: Signal quality score (0-100)
 * - Bytes 4-5: RSSI (int16, little-endian)
 * - Byte 6: Artifact percentage (0-100)
 * - Byte 7: Artifact flags (amplitude, gradient, frequency)
 * - Bytes 8-10: Firmware version (major.minor.patch)
 * - Bytes 11-15: Reserved
 */
function parseStatusPacket(rawData: Uint8Array): DeviceStatusData {
  const dataView = new DataView(rawData.buffer);

  const flags = rawData[0];
  const batteryLevel = rawData[1];
  const errorCode = rawData[2];
  const signalScore = rawData[3];
  const rssi = dataView.getInt16(4, true);
  const artifactPercentage = rawData[6];
  const artifactFlags = rawData[7];

  // Parse firmware version
  const firmwareMajor = rawData[8];
  const firmwareMinor = rawData[9];
  const firmwarePatch = rawData[10];
  const firmwareVersion = `${firmwareMajor}.${firmwareMinor}.${firmwarePatch}`;

  // Parse status flags
  const isConnected = (flags & DeviceStatusFlag.CONNECTED) !== 0;
  const isStreaming = (flags & DeviceStatusFlag.STREAMING) !== 0;
  const isEntrainmentActive = (flags & DeviceStatusFlag.ENTRAINMENT_ACTIVE) !== 0;
  const isLowBattery = (flags & DeviceStatusFlag.LOW_BATTERY) !== 0;
  const isCharging = (flags & DeviceStatusFlag.CHARGING) !== 0;
  const hasError = (flags & DeviceStatusFlag.ERROR) !== 0;

  // Parse artifact flags
  const hasAmplitudeArtifact = (artifactFlags & 0x01) !== 0;
  const hasGradientArtifact = (artifactFlags & 0x02) !== 0;
  const hasFrequencyArtifact = (artifactFlags & 0x04) !== 0;

  const signalQuality: SignalQuality = {
    score: signalScore,
    artifact_percentage: artifactPercentage,
    has_amplitude_artifact: hasAmplitudeArtifact,
    has_gradient_artifact: hasGradientArtifact,
    has_frequency_artifact: hasFrequencyArtifact,
  };

  return {
    batteryLevel: isLowBattery && batteryLevel > 20 ? batteryLevel : batteryLevel,
    isCharging,
    isStreaming,
    isEntrainmentActive,
    hasError,
    errorCode,
    firmwareVersion,
    rssi,
    signalQuality,
  };
}

/**
 * Device Status Handler
 *
 * Reads device status on demand and subscribes to real-time
 * status notifications from the BLE device.
 */
export class DeviceStatusHandler implements CharacteristicHandler {
  private device: Device;
  private onStatus: DeviceStatusCallback;
  private onError?: ErrorCallback;
  private subscription: Subscription | null = null;
  private active = false;
  private lastStatus: DeviceStatusData | null = null;
  private pollIntervalMs: number;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  constructor(config: DeviceStatusHandlerConfig) {
    this.device = config.device;
    this.onStatus = config.onStatus;
    this.onError = config.onError;
    this.pollIntervalMs = config.pollIntervalMs ?? 5000;
  }

  /**
   * Starts listening for device status notifications and begins polling
   */
  async start(): Promise<void> {
    if (this.active) {
      return;
    }

    try {
      // Subscribe to status notifications
      this.subscription = this.device.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        DEVICE_STATUS_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            this.handleError(new Error(`Status monitoring error: ${error.message}`));
            return;
          }

          if (characteristic?.value) {
            try {
              const rawData = base64ToUint8Array(characteristic.value);
              if (rawData.length >= STATUS_PACKET_SIZE) {
                const status = parseStatusPacket(rawData);
                this.lastStatus = status;
                this.onStatus(status);
              }
            } catch (parseError) {
              this.handleError(
                new Error(
                  `Status packet parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
                )
              );
            }
          }
        }
      );

      // Start polling for status reads (backup for missed notifications)
      this.startPolling();

      this.active = true;

      // Read initial status
      await this.readStatus();
    } catch (error) {
      this.handleError(
        new Error(
          `Failed to start status monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      throw error;
    }
  }

  /**
   * Stops listening for device status notifications
   */
  async stop(): Promise<void> {
    this.stopPolling();

    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }

    this.active = false;
  }

  /**
   * Returns whether the handler is actively listening
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Reads the current device status
   */
  async readStatus(): Promise<DeviceStatusData | null> {
    try {
      const characteristic = await this.device.readCharacteristicForService(
        BLE_SERVICE_UUID,
        DEVICE_STATUS_CHARACTERISTIC_UUID
      );

      if (characteristic.value) {
        const rawData = base64ToUint8Array(characteristic.value);
        if (rawData.length >= STATUS_PACKET_SIZE) {
          const status = parseStatusPacket(rawData);
          this.lastStatus = status;
          this.onStatus(status);
          return status;
        }
      }

      return null;
    } catch (error) {
      this.handleError(
        new Error(
          `Failed to read device status: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      return null;
    }
  }

  /**
   * Returns the last known device status
   */
  getLastStatus(): DeviceStatusData | null {
    return this.lastStatus ? { ...this.lastStatus } : null;
  }

  /**
   * Sets the polling interval (in milliseconds)
   */
  setPollingInterval(intervalMs: number): void {
    this.pollIntervalMs = intervalMs;

    if (this.active) {
      this.stopPolling();
      this.startPolling();
    }
  }

  private startPolling(): void {
    if (this.pollTimer) {
      return;
    }

    this.pollTimer = setInterval(() => {
      this.readStatus().catch(() => {
        // Error already handled in readStatus
      });
    }, this.pollIntervalMs);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private handleError(error: Error): void {
    if (this.onError) {
      this.onError(error);
    }
  }
}

/**
 * Creates a device status handler instance
 */
export function createDeviceStatusHandler(
  config: DeviceStatusHandlerConfig
): DeviceStatusHandler {
  return new DeviceStatusHandler(config);
}
