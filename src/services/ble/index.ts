/**
 * BLE Characteristic Handlers
 *
 * This module provides typed handlers for BLE communication with the
 * FlowState BCI device. It includes handlers for:
 *
 * - EEG Data Stream (notify): Real-time EEG data from the device
 * - Entrainment Control (write): Commands to control audio entrainment
 * - Device Status (read/notify): Device battery, firmware, and signal quality
 */

// Constants
export {
  BLE_SERVICE_UUID,
  EEG_DATA_CHARACTERISTIC_UUID,
  ENTRAINMENT_CONTROL_CHARACTERISTIC_UUID,
  DEVICE_STATUS_CHARACTERISTIC_UUID,
  EntrainmentCommand,
  WaveformType,
  DeviceStatusFlag,
  EEG_PACKET_HEADER_SIZE,
  EEG_SAMPLE_SIZE,
  EEG_MAX_SAMPLES_PER_PACKET,
  STATUS_PACKET_SIZE,
} from './constants';

// Types
export type {
  EEGDataCallback,
  DeviceStatusCallback,
  ErrorCallback,
  DeviceStatusData,
  EntrainmentConfig,
  EntrainmentWriteResult,
  CharacteristicHandler,
  EEGHandlerConfig,
  DeviceStatusHandlerConfig,
  EntrainmentHandlerConfig,
  SubscriptionManager,
} from './types';

// EEG Data Handler
export { EEGDataHandler, createEEGDataHandler } from './eegDataHandler';

// Entrainment Control Handler
export {
  EntrainmentControlHandler,
  createEntrainmentControlHandler,
} from './entrainmentControlHandler';

// Device Status Handler
export {
  DeviceStatusHandler,
  createDeviceStatusHandler,
} from './deviceStatusHandler';
