/**
 * BLE-specific types for characteristic handlers
 */

import { Device, Subscription } from 'react-native-ble-plx';
import { EEGDataPacket, SignalQuality, DeviceInfo } from '../../types';
import { WaveformType } from './constants';

/**
 * Callback type for EEG data stream notifications
 */
export type EEGDataCallback = (data: EEGDataPacket) => void;

/**
 * Callback type for device status notifications
 */
export type DeviceStatusCallback = (status: DeviceStatusData) => void;

/**
 * Callback type for error handling
 */
export type ErrorCallback = (error: Error) => void;

/**
 * Raw device status data from BLE characteristic
 */
export interface DeviceStatusData {
  batteryLevel: number;
  isCharging: boolean;
  isStreaming: boolean;
  isEntrainmentActive: boolean;
  hasError: boolean;
  errorCode: number;
  firmwareVersion: string;
  rssi: number;
  signalQuality: SignalQuality;
}

/**
 * Entrainment configuration for write commands
 */
export interface EntrainmentConfig {
  frequency: number;
  volume: number;
  waveform: WaveformType;
}

/**
 * Result of an entrainment write operation
 */
export interface EntrainmentWriteResult {
  success: boolean;
  command: number;
  timestamp: number;
}

/**
 * BLE characteristic handler interface
 */
export interface CharacteristicHandler {
  start(): Promise<void>;
  stop(): Promise<void>;
  isActive(): boolean;
}

/**
 * EEG data handler configuration
 */
export interface EEGHandlerConfig {
  device: Device;
  onData: EEGDataCallback;
  onError?: ErrorCallback;
}

/**
 * Device status handler configuration
 */
export interface DeviceStatusHandlerConfig {
  device: Device;
  onStatus: DeviceStatusCallback;
  onError?: ErrorCallback;
  pollIntervalMs?: number;
}

/**
 * Entrainment control handler configuration
 */
export interface EntrainmentHandlerConfig {
  device: Device;
  onError?: ErrorCallback;
}

/**
 * Subscription manager for BLE notifications
 */
export interface SubscriptionManager {
  subscription: Subscription | null;
  isSubscribed: boolean;
}
