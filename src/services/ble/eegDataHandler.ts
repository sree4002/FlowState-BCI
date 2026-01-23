/**
 * EEG Data Stream Handler
 *
 * Handles BLE notifications for real-time EEG data streaming.
 * Parses raw BLE data into structured EEGDataPacket objects.
 */

import { Device, Subscription } from 'react-native-ble-plx';
import { EEGDataPacket } from '../../types';
import {
  BLE_SERVICE_UUID,
  EEG_DATA_CHARACTERISTIC_UUID,
  EEG_PACKET_HEADER_SIZE,
  EEG_SAMPLE_SIZE,
} from './constants';
import {
  CharacteristicHandler,
  EEGDataCallback,
  ErrorCallback,
  EEGHandlerConfig,
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
 * Parses raw BLE data into an EEGDataPacket
 *
 * Packet format:
 * - Bytes 0-3: Timestamp (uint32, little-endian)
 * - Bytes 4-5: Sequence number (uint16, little-endian)
 * - Bytes 6-7: Sample count (uint16, little-endian)
 * - Bytes 8+: Samples (float32 array, little-endian)
 */
function parseEEGPacket(rawData: Uint8Array): EEGDataPacket {
  const dataView = new DataView(rawData.buffer);

  // Parse header
  const timestamp = dataView.getUint32(0, true);
  const sequenceNumber = dataView.getUint16(4, true);
  const sampleCount = dataView.getUint16(6, true);

  // Parse samples
  const samples: number[] = [];
  const samplesStartOffset = EEG_PACKET_HEADER_SIZE;

  for (let i = 0; i < sampleCount; i++) {
    const offset = samplesStartOffset + i * EEG_SAMPLE_SIZE;
    if (offset + EEG_SAMPLE_SIZE <= rawData.length) {
      const sample = dataView.getFloat32(offset, true);
      samples.push(sample);
    }
  }

  return {
    timestamp,
    samples,
    sequence_number: sequenceNumber,
  };
}

/**
 * EEG Data Stream Handler
 *
 * Subscribes to EEG data notifications from the BLE device and
 * delivers parsed data packets to registered callbacks.
 */
export class EEGDataHandler implements CharacteristicHandler {
  private device: Device;
  private onData: EEGDataCallback;
  private onError?: ErrorCallback;
  private subscription: Subscription | null = null;
  private active = false;
  private lastSequenceNumber = -1;
  private droppedPackets = 0;

  constructor(config: EEGHandlerConfig) {
    this.device = config.device;
    this.onData = config.onData;
    this.onError = config.onError;
  }

  /**
   * Starts listening for EEG data notifications
   */
  async start(): Promise<void> {
    if (this.active) {
      return;
    }

    try {
      this.subscription = this.device.monitorCharacteristicForService(
        BLE_SERVICE_UUID,
        EEG_DATA_CHARACTERISTIC_UUID,
        (error, characteristic) => {
          if (error) {
            this.handleError(
              new Error(`EEG monitoring error: ${error.message}`)
            );
            return;
          }

          if (characteristic?.value) {
            try {
              const rawData = base64ToUint8Array(characteristic.value);
              const packet = parseEEGPacket(rawData);

              // Track dropped packets
              if (this.lastSequenceNumber >= 0) {
                const expectedSeq = (this.lastSequenceNumber + 1) & 0xffff;
                if (packet.sequence_number !== expectedSeq) {
                  this.droppedPackets++;
                }
              }
              this.lastSequenceNumber = packet.sequence_number;

              this.onData(packet);
            } catch (parseError) {
              this.handleError(
                new Error(
                  `EEG packet parse error: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`
                )
              );
            }
          }
        }
      );

      this.active = true;
      this.lastSequenceNumber = -1;
      this.droppedPackets = 0;
    } catch (error) {
      this.handleError(
        new Error(
          `Failed to start EEG monitoring: ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      );
      throw error;
    }
  }

  /**
   * Stops listening for EEG data notifications
   */
  async stop(): Promise<void> {
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
   * Returns the count of dropped packets since start
   */
  getDroppedPacketCount(): number {
    return this.droppedPackets;
  }

  /**
   * Resets the dropped packet counter
   */
  resetDroppedPacketCount(): void {
    this.droppedPackets = 0;
  }

  private handleError(error: Error): void {
    if (this.onError) {
      this.onError(error);
    }
  }
}

/**
 * Creates an EEG data handler instance
 */
export function createEEGDataHandler(config: EEGHandlerConfig): EEGDataHandler {
  return new EEGDataHandler(config);
}
