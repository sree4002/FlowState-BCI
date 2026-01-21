/**
 * Entrainment Control Handler
 *
 * Handles BLE write operations for controlling audio entrainment.
 * Supports commands: start, stop, pause, resume, set frequency, set volume.
 */

import { Device } from 'react-native-ble-plx';
import {
  BLE_SERVICE_UUID,
  ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID,
  EntrainmentCommand,
  WaveformType,
} from './constants';
import {
  CharacteristicHandler,
  ErrorCallback,
  EntrainmentHandlerConfig,
  EntrainmentConfig,
  EntrainmentWriteResult,
} from './types';

/**
 * Encodes a Uint8Array to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Creates a command packet with optional payload
 *
 * Packet format:
 * - Byte 0: Command opcode
 * - Bytes 1+: Payload (varies by command)
 */
function createCommandPacket(command: EntrainmentCommand, payload?: Uint8Array): Uint8Array {
  const payloadLength = payload?.length ?? 0;
  const packet = new Uint8Array(1 + payloadLength);
  packet[0] = command;

  if (payload) {
    packet.set(payload, 1);
  }

  return packet;
}

/**
 * Creates a frequency payload (float32, little-endian)
 */
function createFrequencyPayload(frequency: number): Uint8Array {
  const buffer = new ArrayBuffer(4);
  const view = new DataView(buffer);
  view.setFloat32(0, frequency, true);
  return new Uint8Array(buffer);
}

/**
 * Creates a volume payload (uint8, 0-100)
 */
function createVolumePayload(volume: number): Uint8Array {
  const clampedVolume = Math.max(0, Math.min(100, Math.round(volume)));
  return new Uint8Array([clampedVolume]);
}

/**
 * Creates a waveform type payload
 */
function createWaveformPayload(waveform: WaveformType): Uint8Array {
  return new Uint8Array([waveform]);
}

/**
 * Entrainment Control Handler
 *
 * Sends control commands to the BLE device for managing
 * audio entrainment playback.
 */
export class EntrainmentControlHandler implements CharacteristicHandler {
  private device: Device;
  private onError?: ErrorCallback;
  private active = false;
  private currentConfig: EntrainmentConfig | null = null;

  constructor(config: EntrainmentHandlerConfig) {
    this.device = config.device;
    this.onError = config.onError;
  }

  /**
   * Initializes the handler (verifies characteristic availability)
   */
  async start(): Promise<void> {
    if (this.active) {
      return;
    }

    try {
      // Verify the characteristic exists by attempting to read services
      await this.device.discoverAllServicesAndCharacteristics();
      this.active = true;
    } catch (error) {
      this.handleError(
        new Error(
          `Failed to initialize entrainment control: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      throw error;
    }
  }

  /**
   * Stops the handler
   */
  async stop(): Promise<void> {
    this.active = false;
    this.currentConfig = null;
  }

  /**
   * Returns whether the handler is active
   */
  isActive(): boolean {
    return this.active;
  }

  /**
   * Sends a command to start entrainment with the given configuration
   */
  async startEntrainment(config: EntrainmentConfig): Promise<EntrainmentWriteResult> {
    this.currentConfig = config;

    // Set waveform first
    await this.setWaveform(config.waveform);

    // Set frequency
    await this.setFrequency(config.frequency);

    // Set volume
    await this.setVolume(config.volume);

    // Send start command
    return this.writeCommand(EntrainmentCommand.START);
  }

  /**
   * Sends a command to stop entrainment
   */
  async stopEntrainment(): Promise<EntrainmentWriteResult> {
    const result = await this.writeCommand(EntrainmentCommand.STOP);
    this.currentConfig = null;
    return result;
  }

  /**
   * Sends a command to pause entrainment
   */
  async pauseEntrainment(): Promise<EntrainmentWriteResult> {
    return this.writeCommand(EntrainmentCommand.PAUSE);
  }

  /**
   * Sends a command to resume entrainment
   */
  async resumeEntrainment(): Promise<EntrainmentWriteResult> {
    return this.writeCommand(EntrainmentCommand.RESUME);
  }

  /**
   * Sets the entrainment frequency (in Hz)
   */
  async setFrequency(frequency: number): Promise<EntrainmentWriteResult> {
    const payload = createFrequencyPayload(frequency);
    const result = await this.writeCommand(EntrainmentCommand.SET_FREQUENCY, payload);

    if (result.success && this.currentConfig) {
      this.currentConfig.frequency = frequency;
    }

    return result;
  }

  /**
   * Sets the entrainment volume (0-100)
   */
  async setVolume(volume: number): Promise<EntrainmentWriteResult> {
    const payload = createVolumePayload(volume);
    const result = await this.writeCommand(EntrainmentCommand.SET_VOLUME, payload);

    if (result.success && this.currentConfig) {
      this.currentConfig.volume = volume;
    }

    return result;
  }

  /**
   * Sets the waveform type
   */
  async setWaveform(waveform: WaveformType): Promise<EntrainmentWriteResult> {
    const payload = createWaveformPayload(waveform);
    const result = await this.writeCommand(EntrainmentCommand.SET_WAVEFORM, payload);

    if (result.success && this.currentConfig) {
      this.currentConfig.waveform = waveform;
    }

    return result;
  }

  /**
   * Returns the current entrainment configuration
   */
  getCurrentConfig(): EntrainmentConfig | null {
    return this.currentConfig ? { ...this.currentConfig } : null;
  }

  /**
   * Writes a command to the entrainment control characteristic
   */
  private async writeCommand(
    command: EntrainmentCommand,
    payload?: Uint8Array
  ): Promise<EntrainmentWriteResult> {
    const timestamp = Date.now();

    try {
      const packet = createCommandPacket(command, payload);
      const base64Data = uint8ArrayToBase64(packet);

      await this.device.writeCharacteristicWithResponseForService(
        BLE_SERVICE_UUID,
        ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID,
        base64Data
      );

      return {
        success: true,
        command,
        timestamp,
      };
    } catch (error) {
      this.handleError(
        new Error(
          `Entrainment command failed (${command}): ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );

      return {
        success: false,
        command,
        timestamp,
      };
    }
  }

  private handleError(error: Error): void {
    if (this.onError) {
      this.onError(error);
    }
  }
}

/**
 * Creates an entrainment control handler instance
 */
export function createEntrainmentControlHandler(
  config: EntrainmentHandlerConfig
): EntrainmentControlHandler {
  return new EntrainmentControlHandler(config);
}
