/**
 * BLE Packet Parser for FlowState BCI EEG Data
 *
 * Handles parsing of raw BLE packets from:
 * - Headband device: 500Hz sampling rate (4+ channels, used for calibration)
 * - Earpiece device: 250Hz sampling rate (2 channels, for daily wear)
 *
 * Packet Format Specification:
 * ┌─────────────┬──────────┬────────────────────────────────────────────┬──────────┐
 * │ Header (2B) │ Meta (6B)│ Samples (variable)                         │ CRC (2B) │
 * ├─────────────┼──────────┼────────────────────────────────────────────┼──────────┤
 * │ 0xAA 0x55   │ See below│ Int16 samples per channel, interleaved     │ CRC16    │
 * └─────────────┴──────────┴────────────────────────────────────────────┴──────────┘
 *
 * Meta bytes:
 * - Byte 0: Device type (0x01 = headband, 0x02 = earpiece)
 * - Byte 1: Channel count
 * - Byte 2-3: Sequence number (uint16, little-endian)
 * - Byte 4-5: Samples per channel in this packet (uint16, little-endian)
 */

import type { EEGDataPacket, SignalQuality, DeviceInfo } from '../types';

// Packet format constants
export const PACKET_HEADER = new Uint8Array([0xaa, 0x55]);
export const HEADER_LENGTH = 2;
export const META_LENGTH = 6;
export const CRC_LENGTH = 2;
export const MIN_PACKET_LENGTH = HEADER_LENGTH + META_LENGTH + CRC_LENGTH;

// Device type identifiers
export const DEVICE_TYPE_HEADBAND = 0x01;
export const DEVICE_TYPE_EARPIECE = 0x02;

// Sampling rates by device type
export const HEADBAND_SAMPLING_RATE = 500; // Hz
export const EARPIECE_SAMPLING_RATE = 250; // Hz

// Channel configurations
export const HEADBAND_CHANNELS = 4; // Frontal and temporal electrodes
export const EARPIECE_CHANNELS = 2; // In-ear electrodes

// ADC resolution (16-bit signed, range -32768 to 32767)
export const ADC_RESOLUTION = 16;
export const ADC_MAX_VALUE = 32767;
export const ADC_MIN_VALUE = -32768;

// Microvolts per ADC unit (typical EEG: ±200µV full scale)
export const MICROVOLTS_PER_UNIT = 200 / ADC_MAX_VALUE;

/**
 * Parsed metadata from packet header
 */
export interface PacketMetadata {
  deviceType: 'headband' | 'earpiece';
  channelCount: number;
  sequenceNumber: number;
  samplesPerChannel: number;
  samplingRate: number;
}

/**
 * Raw parsed packet before conversion to EEGDataPacket
 */
export interface RawParsedPacket {
  metadata: PacketMetadata;
  channelSamples: number[][]; // Array of channels, each containing sample values
  timestamp: number;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * Packet parsing result
 */
export interface ParseResult {
  success: boolean;
  packet?: EEGDataPacket;
  metadata?: PacketMetadata;
  channelData?: number[][];
  error?: string;
}

/**
 * Parser state for tracking sequence numbers and detecting gaps
 */
export interface ParserState {
  lastSequenceNumber: number;
  packetsReceived: number;
  packetsDropped: number;
  deviceType: 'headband' | 'earpiece' | null;
}

/**
 * CRC-16/CCITT-FALSE lookup table for fast CRC calculation
 */
const CRC16_TABLE = generateCRC16Table();

function generateCRC16Table(): Uint16Array {
  const table = new Uint16Array(256);
  const polynomial = 0x1021;

  for (let i = 0; i < 256; i++) {
    let crc = i << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
    table[i] = crc;
  }

  return table;
}

/**
 * Calculate CRC-16/CCITT-FALSE checksum
 */
export function calculateCRC16(
  data: Uint8Array,
  start = 0,
  length?: number
): number {
  let crc = 0xffff;
  const end = length !== undefined ? start + length : data.length;

  for (let i = start; i < end; i++) {
    const byte = data[i];
    const tableIndex = ((crc >> 8) ^ byte) & 0xff;
    crc = ((crc << 8) ^ CRC16_TABLE[tableIndex]) & 0xffff;
  }

  return crc;
}

/**
 * Validate packet header bytes
 */
export function validateHeader(data: Uint8Array): boolean {
  if (data.length < HEADER_LENGTH) {
    return false;
  }
  return data[0] === PACKET_HEADER[0] && data[1] === PACKET_HEADER[1];
}

/**
 * Validate packet CRC
 */
export function validateCRC(data: Uint8Array): boolean {
  if (data.length < MIN_PACKET_LENGTH) {
    return false;
  }

  const payloadLength = data.length - CRC_LENGTH;
  const calculatedCRC = calculateCRC16(data, 0, payloadLength);

  // Extract CRC from packet (little-endian)
  const packetCRC = data[payloadLength] | (data[payloadLength + 1] << 8);

  return calculatedCRC === packetCRC;
}

/**
 * Parse metadata from packet
 */
export function parseMetadata(data: Uint8Array): PacketMetadata | null {
  if (data.length < HEADER_LENGTH + META_LENGTH) {
    return null;
  }

  const deviceTypeByte = data[HEADER_LENGTH];
  const channelCount = data[HEADER_LENGTH + 1];
  const sequenceNumber =
    data[HEADER_LENGTH + 2] | (data[HEADER_LENGTH + 3] << 8);
  const samplesPerChannel =
    data[HEADER_LENGTH + 4] | (data[HEADER_LENGTH + 5] << 8);

  let deviceType: 'headband' | 'earpiece';
  let samplingRate: number;

  if (deviceTypeByte === DEVICE_TYPE_HEADBAND) {
    deviceType = 'headband';
    samplingRate = HEADBAND_SAMPLING_RATE;
  } else if (deviceTypeByte === DEVICE_TYPE_EARPIECE) {
    deviceType = 'earpiece';
    samplingRate = EARPIECE_SAMPLING_RATE;
  } else {
    return null;
  }

  return {
    deviceType,
    channelCount,
    sequenceNumber,
    samplesPerChannel,
    samplingRate,
  };
}

/**
 * Parse channel samples from packet data
 */
export function parseChannelSamples(
  data: Uint8Array,
  channelCount: number,
  samplesPerChannel: number
): number[][] | null {
  const dataStartOffset = HEADER_LENGTH + META_LENGTH;
  const expectedSampleBytes = channelCount * samplesPerChannel * 2; // 2 bytes per sample (int16)
  const expectedPacketLength =
    dataStartOffset + expectedSampleBytes + CRC_LENGTH;

  if (data.length !== expectedPacketLength) {
    return null;
  }

  const dataView = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const channels: number[][] = [];

  // Initialize channel arrays
  for (let ch = 0; ch < channelCount; ch++) {
    channels.push([]);
  }

  // Parse interleaved samples
  // Format: [Ch0_S0, Ch1_S0, Ch2_S0, Ch3_S0, Ch0_S1, Ch1_S1, ...]
  let byteOffset = dataStartOffset;
  for (let sample = 0; sample < samplesPerChannel; sample++) {
    for (let ch = 0; ch < channelCount; ch++) {
      const rawValue = dataView.getInt16(byteOffset, true); // little-endian
      // Convert to microvolts
      const microvolts = rawValue * MICROVOLTS_PER_UNIT;
      channels[ch].push(microvolts);
      byteOffset += 2;
    }
  }

  return channels;
}

/**
 * Main packet parsing function
 * Parses raw BLE data into structured EEG data packet
 */
export function parsePacket(data: Uint8Array): ParseResult {
  // Validate minimum length
  if (data.length < MIN_PACKET_LENGTH) {
    return {
      success: false,
      error: `Packet too short: ${data.length} bytes (minimum: ${MIN_PACKET_LENGTH})`,
    };
  }

  // Validate header
  if (!validateHeader(data)) {
    return {
      success: false,
      error: `Invalid header bytes: 0x${data[0].toString(16)} 0x${data[1].toString(16)}`,
    };
  }

  // Validate CRC
  if (!validateCRC(data)) {
    return {
      success: false,
      error: 'CRC validation failed',
    };
  }

  // Parse metadata
  const metadata = parseMetadata(data);
  if (!metadata) {
    return {
      success: false,
      error: 'Failed to parse packet metadata',
    };
  }

  // Validate channel count matches device type
  const expectedChannels =
    metadata.deviceType === 'headband' ? HEADBAND_CHANNELS : EARPIECE_CHANNELS;
  if (metadata.channelCount !== expectedChannels) {
    return {
      success: false,
      error: `Unexpected channel count: ${metadata.channelCount} (expected: ${expectedChannels} for ${metadata.deviceType})`,
    };
  }

  // Parse channel samples
  const channelData = parseChannelSamples(
    data,
    metadata.channelCount,
    metadata.samplesPerChannel
  );
  if (!channelData) {
    return {
      success: false,
      error: 'Failed to parse channel samples',
    };
  }

  // Create flattened samples array for EEGDataPacket
  // Flatten channel data: all samples from all channels in sequence
  const samples: number[] = [];
  for (let sample = 0; sample < metadata.samplesPerChannel; sample++) {
    for (let ch = 0; ch < metadata.channelCount; ch++) {
      samples.push(channelData[ch][sample]);
    }
  }

  const packet: EEGDataPacket = {
    timestamp: Date.now(),
    samples,
    sequence_number: metadata.sequenceNumber,
  };

  return {
    success: true,
    packet,
    metadata,
    channelData,
  };
}

/**
 * Create a parser state tracker for managing sequence numbers
 */
export function createParserState(): ParserState {
  return {
    lastSequenceNumber: -1,
    packetsReceived: 0,
    packetsDropped: 0,
    deviceType: null,
  };
}

/**
 * Update parser state with new packet and detect sequence gaps
 */
export function updateParserState(
  state: ParserState,
  metadata: PacketMetadata
): { droppedPackets: number; isFirstPacket: boolean } {
  const isFirstPacket = state.lastSequenceNumber === -1;
  let droppedPackets = 0;

  if (!isFirstPacket) {
    // Calculate expected sequence number (wraps at 65535)
    const expectedSeq = (state.lastSequenceNumber + 1) & 0xffff;
    if (metadata.sequenceNumber !== expectedSeq) {
      // Calculate gap (handle wrap-around)
      if (metadata.sequenceNumber > state.lastSequenceNumber) {
        droppedPackets = metadata.sequenceNumber - state.lastSequenceNumber - 1;
      } else {
        // Wrap-around case
        droppedPackets =
          0xffff - state.lastSequenceNumber + metadata.sequenceNumber;
      }
      state.packetsDropped += droppedPackets;
    }
  }

  state.lastSequenceNumber = metadata.sequenceNumber;
  state.packetsReceived++;
  state.deviceType = metadata.deviceType;

  return { droppedPackets, isFirstPacket };
}

/**
 * Calculate signal quality score based on sample statistics
 * Returns a quality score from 0-100
 */
export function calculateSignalQuality(channelData: number[][]): SignalQuality {
  if (channelData.length === 0 || channelData[0].length === 0) {
    return {
      score: 0,
      artifact_percentage: 100,
      has_amplitude_artifact: true,
      has_gradient_artifact: true,
      has_frequency_artifact: true,
    };
  }

  // Thresholds for artifact detection (in microvolts)
  const AMPLITUDE_THRESHOLD = 150; // µV - typical EEG should be under 100µV
  const GRADIENT_THRESHOLD = 50; // µV per sample - sudden jumps
  const FLATLINE_THRESHOLD = 0.1; // µV - no variation indicates bad contact

  let totalSamples = 0;
  let amplitudeArtifacts = 0;
  let gradientArtifacts = 0;
  let flatlineCount = 0;

  // Analyze each channel
  for (const samples of channelData) {
    for (let i = 0; i < samples.length; i++) {
      totalSamples++;

      // Check amplitude artifacts
      if (Math.abs(samples[i]) > AMPLITUDE_THRESHOLD) {
        amplitudeArtifacts++;
      }

      // Check gradient (sudden changes)
      if (i > 0) {
        const gradient = Math.abs(samples[i] - samples[i - 1]);
        if (gradient > GRADIENT_THRESHOLD) {
          gradientArtifacts++;
        }
        if (gradient < FLATLINE_THRESHOLD) {
          flatlineCount++;
        }
      }
    }
  }

  // Calculate percentages
  const amplitudeArtifactPct = (amplitudeArtifacts / totalSamples) * 100;
  const gradientArtifactPct =
    (gradientArtifacts / Math.max(totalSamples - channelData.length, 1)) * 100;
  const flatlinePct =
    (flatlineCount / Math.max(totalSamples - channelData.length, 1)) * 100;

  // Determine if specific artifact types are present (> 5% threshold)
  const hasAmplitudeArtifact = amplitudeArtifactPct > 5;
  const hasGradientArtifact = gradientArtifactPct > 10;
  const hasFrequencyArtifact = flatlinePct > 50; // Flatline indicates lost signal

  // Calculate overall artifact percentage
  const artifactPercentage = Math.min(
    100,
    amplitudeArtifactPct + gradientArtifactPct + (hasFrequencyArtifact ? 20 : 0)
  );

  // Calculate quality score (inverse of artifact percentage)
  const score = Math.max(0, Math.min(100, 100 - artifactPercentage));

  return {
    score: Math.round(score),
    artifact_percentage: Math.round(artifactPercentage * 10) / 10,
    has_amplitude_artifact: hasAmplitudeArtifact,
    has_gradient_artifact: hasGradientArtifact,
    has_frequency_artifact: hasFrequencyArtifact,
  };
}

/**
 * Create a mock packet for testing
 */
export function createMockPacket(
  deviceType: 'headband' | 'earpiece',
  sequenceNumber: number,
  samplesPerChannel: number
): Uint8Array {
  const channelCount =
    deviceType === 'headband' ? HEADBAND_CHANNELS : EARPIECE_CHANNELS;
  const deviceTypeByte =
    deviceType === 'headband' ? DEVICE_TYPE_HEADBAND : DEVICE_TYPE_EARPIECE;

  // Calculate total packet size
  const sampleBytes = channelCount * samplesPerChannel * 2;
  const totalLength = HEADER_LENGTH + META_LENGTH + sampleBytes + CRC_LENGTH;

  const packet = new Uint8Array(totalLength);
  const dataView = new DataView(packet.buffer);

  // Write header
  packet[0] = PACKET_HEADER[0];
  packet[1] = PACKET_HEADER[1];

  // Write metadata
  packet[HEADER_LENGTH] = deviceTypeByte;
  packet[HEADER_LENGTH + 1] = channelCount;
  dataView.setUint16(HEADER_LENGTH + 2, sequenceNumber, true); // little-endian
  dataView.setUint16(HEADER_LENGTH + 4, samplesPerChannel, true);

  // Write sample data (simulated EEG - mix of theta-like oscillations)
  let offset = HEADER_LENGTH + META_LENGTH;
  const samplingRate =
    deviceType === 'headband' ? HEADBAND_SAMPLING_RATE : EARPIECE_SAMPLING_RATE;

  for (let sample = 0; sample < samplesPerChannel; sample++) {
    const t = sample / samplingRate;
    for (let ch = 0; ch < channelCount; ch++) {
      // Simulate EEG with dominant theta (6Hz) and some alpha (10Hz)
      const theta = Math.sin(2 * Math.PI * 6 * t + ch * 0.5) * 20; // 20µV theta
      const alpha = Math.sin(2 * Math.PI * 10 * t + ch * 0.3) * 10; // 10µV alpha
      const noise = (Math.random() - 0.5) * 5; // 5µV noise

      // Convert to ADC units
      const microvolts = theta + alpha + noise;
      const adcValue = Math.round(microvolts / MICROVOLTS_PER_UNIT);

      dataView.setInt16(offset, adcValue, true);
      offset += 2;
    }
  }

  // Calculate and write CRC
  const crc = calculateCRC16(packet, 0, totalLength - CRC_LENGTH);
  dataView.setUint16(totalLength - CRC_LENGTH, crc, true);

  return packet;
}

/**
 * Get device info from packet metadata
 */
export function getDeviceInfoFromMetadata(
  metadata: PacketMetadata,
  deviceId: string,
  deviceName: string
): Partial<DeviceInfo> {
  return {
    id: deviceId,
    name: deviceName,
    type: metadata.deviceType,
    sampling_rate: metadata.samplingRate,
    is_connected: true,
  };
}

/**
 * Class-based packet parser with state management
 */
export class BlePacketParser {
  private state: ParserState;
  private onPacketParsed?: (
    packet: EEGDataPacket,
    metadata: PacketMetadata
  ) => void;
  private onPacketError?: (error: string) => void;
  private onSignalQuality?: (quality: SignalQuality) => void;

  constructor() {
    this.state = createParserState();
  }

  /**
   * Set callback for successfully parsed packets
   */
  setOnPacketParsed(
    callback: (packet: EEGDataPacket, metadata: PacketMetadata) => void
  ): void {
    this.onPacketParsed = callback;
  }

  /**
   * Set callback for parse errors
   */
  setOnPacketError(callback: (error: string) => void): void {
    this.onPacketError = callback;
  }

  /**
   * Set callback for signal quality updates
   */
  setOnSignalQuality(callback: (quality: SignalQuality) => void): void {
    this.onSignalQuality = callback;
  }

  /**
   * Process raw BLE data
   */
  processData(data: Uint8Array): ParseResult {
    const result = parsePacket(data);

    if (!result.success) {
      this.onPacketError?.(result.error || 'Unknown parse error');
      return result;
    }

    if (result.metadata && result.packet && result.channelData) {
      // Update state and check for dropped packets
      const { droppedPackets } = updateParserState(this.state, result.metadata);

      if (droppedPackets > 0) {
        console.warn(`Detected ${droppedPackets} dropped packets`);
      }

      // Calculate signal quality
      const quality = calculateSignalQuality(result.channelData);
      this.onSignalQuality?.(quality);

      // Notify packet parsed
      this.onPacketParsed?.(result.packet, result.metadata);
    }

    return result;
  }

  /**
   * Get parser statistics
   */
  getStats(): {
    packetsReceived: number;
    packetsDropped: number;
    dropRate: number;
    deviceType: 'headband' | 'earpiece' | null;
  } {
    const total = this.state.packetsReceived + this.state.packetsDropped;
    return {
      packetsReceived: this.state.packetsReceived,
      packetsDropped: this.state.packetsDropped,
      dropRate: total > 0 ? this.state.packetsDropped / total : 0,
      deviceType: this.state.deviceType,
    };
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.state = createParserState();
  }
}

export default BlePacketParser;
