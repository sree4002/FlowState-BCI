import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceInfo } from '../types';

/**
 * Storage keys for AsyncStorage
 * Centralized location for all storage keys to prevent typos and enable refactoring
 */
export const STORAGE_KEYS = {
  PAIRED_DEVICE: '@flowstate/paired_device',
  SETTINGS: '@flowstate/settings',
  SESSIONS: '@flowstate/sessions',
  ONBOARDING_COMPLETED: '@flowstate/onboarding_completed',
} as const;

/**
 * Type for storage keys
 */
export type StorageKey = (typeof STORAGE_KEYS)[keyof typeof STORAGE_KEYS];

/**
 * Paired device data stored in AsyncStorage
 * Contains essential device identification and connection info
 */
export interface PairedDeviceData {
  id: string;
  name: string;
  type: 'headband' | 'earpiece';
  paired_at: number;
  last_connected: number | null;
}

/**
 * Converts a DeviceInfo object to PairedDeviceData for storage
 * Only stores essential information needed for reconnection
 */
export const deviceInfoToPairedData = (
  device: DeviceInfo
): PairedDeviceData => ({
  id: device.id,
  name: device.name,
  type: device.type,
  paired_at: Date.now(),
  last_connected: device.last_connected,
});

/**
 * Saves a paired device to AsyncStorage
 * @param device - The device info to save, or PairedDeviceData directly
 * @returns Promise that resolves when the device is saved
 * @throws Error if storage operation fails
 */
export const savePairedDevice = async (
  device: DeviceInfo | PairedDeviceData
): Promise<void> => {
  const dataToStore: PairedDeviceData =
    'sampling_rate' in device ? deviceInfoToPairedData(device) : device;

  const jsonValue = JSON.stringify(dataToStore);
  await AsyncStorage.setItem(STORAGE_KEYS.PAIRED_DEVICE, jsonValue);
};

/**
 * Retrieves the paired device from AsyncStorage
 * @returns Promise that resolves to the paired device data, or null if none exists
 * @throws Error if storage operation fails or data is corrupted
 */
export const getPairedDevice = async (): Promise<PairedDeviceData | null> => {
  const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.PAIRED_DEVICE);

  if (jsonValue === null) {
    return null;
  }

  const parsed = JSON.parse(jsonValue) as PairedDeviceData;

  // Validate required fields
  if (
    typeof parsed.id !== 'string' ||
    typeof parsed.name !== 'string' ||
    (parsed.type !== 'headband' && parsed.type !== 'earpiece') ||
    typeof parsed.paired_at !== 'number'
  ) {
    throw new Error('Invalid paired device data in storage');
  }

  return parsed;
};

/**
 * Removes the paired device from AsyncStorage
 * @returns Promise that resolves when the device is removed
 * @throws Error if storage operation fails
 */
export const removePairedDevice = async (): Promise<void> => {
  await AsyncStorage.removeItem(STORAGE_KEYS.PAIRED_DEVICE);
};

/**
 * Updates the last_connected timestamp for the paired device
 * @param timestamp - The timestamp to set, defaults to current time
 * @returns Promise that resolves when updated, or rejects if no device is paired
 * @throws Error if no device is paired or storage operation fails
 */
export const updatePairedDeviceLastConnected = async (
  timestamp: number = Date.now()
): Promise<void> => {
  const device = await getPairedDevice();

  if (device === null) {
    throw new Error('No paired device found');
  }

  device.last_connected = timestamp;
  await savePairedDevice(device);
};

/**
 * Checks if a device is currently paired
 * @returns Promise that resolves to true if a device is paired, false otherwise
 */
export const hasPairedDevice = async (): Promise<boolean> => {
  const device = await getPairedDevice();
  return device !== null;
};

/**
 * Gets the paired device ID if one exists
 * Useful for quick checks without loading full device data
 * @returns Promise that resolves to the device ID, or null if none paired
 */
export const getPairedDeviceId = async (): Promise<string | null> => {
  const device = await getPairedDevice();
  return device?.id ?? null;
};

/**
 * Clears all FlowState storage data
 * Use with caution - primarily for testing or user-initiated data reset
 * @returns Promise that resolves when all data is cleared
 */
export const clearAllStorage = async (): Promise<void> => {
  const keys = Object.values(STORAGE_KEYS);
  await AsyncStorage.multiRemove(keys);
};
