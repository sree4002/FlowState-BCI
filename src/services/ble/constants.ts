/**
 * BLE Service and Characteristic UUIDs for FlowState BCI device
 *
 * Custom UUIDs follow the standard 128-bit format:
 * XXXXXXXX-0000-1000-8000-00805f9b34fb
 *
 * Service allocation:
 * - 0000FFF0: FlowState BCI Service
 * - 0000FFF1: EEG Data Characteristic (notify)
 * - 0000FFF2: Entrainment Control Characteristic (write)
 * - 0000FFF3: Device Status Characteristic (read/notify)
 */

// FlowState BCI Primary Service
export const BLE_SERVICE_UUID = '0000fff0-0000-1000-8000-00805f9b34fb';

// EEG Data Stream Characteristic (notify)
// Receives real-time EEG data packets from the device
export const EEG_DATA_CHARACTERISTIC_UUID =
  '0000fff1-0000-1000-8000-00805f9b34fb';

// Entrainment Control Characteristic (write)
// Sends commands to control audio entrainment
export const ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID =
  '0000fff2-0000-1000-8000-00805f9b34fb';

// Device Status Characteristic (read/notify)
// Reads device status and receives status updates
export const DEVICE_STATUS_CHARACTERISTIC_UUID =
  '0000fff3-0000-1000-8000-00805f9b34fb';

/**
 * Entrainment command opcodes
 */
export enum EntrainmentCommand {
  START = 0x01,
  STOP = 0x02,
  SET_FREQUENCY = 0x03,
  SET_VOLUME = 0x04,
  SET_WAVEFORM = 0x05,
  PAUSE = 0x06,
  RESUME = 0x07,
}

/**
 * Waveform types for entrainment
 */
export enum WaveformType {
  ISOCHRONIC = 0x01,
  BINAURAL = 0x02,
  MONAURAL = 0x03,
}

/**
 * Device status flags (bitmask)
 */
export enum DeviceStatusFlag {
  CONNECTED = 0x01,
  STREAMING = 0x02,
  ENTRAINMENT_ACTIVE = 0x04,
  LOW_BATTERY = 0x08,
  CHARGING = 0x10,
  ERROR = 0x80,
}

/**
 * EEG data packet structure sizes (in bytes)
 */
export const EEG_PACKET_HEADER_SIZE = 8; // timestamp(4) + sequence(2) + sample_count(2)
export const EEG_SAMPLE_SIZE = 4; // float32 per sample
export const EEG_MAX_SAMPLES_PER_PACKET = 32;

/**
 * Device status packet structure sizes (in bytes)
 */
export const STATUS_PACKET_SIZE = 16;
