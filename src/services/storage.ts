import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, DeviceInfo } from '../types';
import { defaultSettings } from '../contexts/SettingsContext';

/**
 * Storage keys used by AsyncStorage wrapper
 */
export const STORAGE_KEYS = {
  USER_SETTINGS: '@flowstate/user_settings',
  PAIRED_DEVICES: '@flowstate/paired_devices',
  PAIRED_DEVICE: '@flowstate/paired_device', // Single device key for backward compatibility
  LAST_PAIRED_DEVICE: '@flowstate/last_paired_device',
  ONBOARDING_COMPLETED: '@flowstate/onboarding_completed',
  SESSIONS: '@flowstate/sessions',
} as const;

/**
 * Stored device info extends DeviceInfo with pairing metadata
 */
export interface StoredDeviceInfo {
  id: string;
  name: string;
  type: 'headband' | 'earpiece';
  sampling_rate: number;
  firmware_version: string | null;
  paired_at: number;
  last_connected: number | null;
}

/**
 * Paired device data for single device storage (backward compatibility)
 */
export interface PairedDeviceData {
  id: string;
  name: string;
  type: 'headband' | 'earpiece';
  paired_at: number;
  last_connected: number | null;
}

/**
 * Converts DeviceInfo to PairedDeviceData
 * @param device - DeviceInfo object
 * @returns PairedDeviceData with only essential pairing fields
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
 * Saves a single paired device to storage
 * @param device - PairedDeviceData to save
 * @returns Promise resolving to true on success, false on failure
 */
export const savePairedDevice = async (
  device: PairedDeviceData
): Promise<boolean> => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PAIRED_DEVICE,
      JSON.stringify(device)
    );
    return true;
  } catch (error) {
    console.error('Failed to save paired device:', error);
    return false;
  }
};

/**
 * Retrieves the paired device from storage
 * @returns Promise resolving to PairedDeviceData or null if not found
 */
export const getPairedDevice = async (): Promise<PairedDeviceData | null> => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEYS.PAIRED_DEVICE);
    if (json === null) {
      return null;
    }
    return JSON.parse(json) as PairedDeviceData;
  } catch (error) {
    console.error('Failed to get paired device:', error);
    return null;
  }
};

/**
 * Removes the paired device from storage
 * @returns Promise resolving to true on success, false on failure
 */
export const removePairedDevice = async (): Promise<boolean> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.PAIRED_DEVICE);
    return true;
  } catch (error) {
    console.error('Failed to remove paired device:', error);
    return false;
  }
};

/**
 * Updates the last_connected timestamp for the paired device
 * @returns Promise resolving to true on success, false on failure
 */
export const updatePairedDeviceLastConnected = async (): Promise<boolean> => {
  try {
    const device = await getPairedDevice();
    if (!device) {
      return false;
    }
    device.last_connected = Date.now();
    return savePairedDevice(device);
  } catch (error) {
    console.error('Failed to update last connected:', error);
    return false;
  }
};

/**
 * Checks if a device is paired
 * @returns Promise resolving to true if a device is paired, false otherwise
 */
export const hasPairedDevice = async (): Promise<boolean> => {
  const device = await getPairedDevice();
  return device !== null;
};

/**
 * Gets the ID of the paired device
 * @returns Promise resolving to device ID or null if no device paired
 */
export const getPairedDeviceId = async (): Promise<string | null> => {
  const device = await getPairedDevice();
  return device?.id ?? null;
};

/**
 * Clears all storage (alias for clearAllAppData)
 * @returns Promise resolving to true on success, false on failure
 */
export const clearAllStorage = async (): Promise<boolean> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Failed to clear all storage:', error);
    return false;
  }
};

/**
 * User settings storage service
 * Handles persistence of app settings to AsyncStorage
 */
export const UserSettingsStorage = {
  /**
   * Retrieves user settings from AsyncStorage
   * @returns Promise resolving to AppSettings or null if not found
   */
  async get(): Promise<AppSettings | null> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
      if (json === null) {
        return null;
      }
      return JSON.parse(json) as AppSettings;
    } catch (error) {
      console.error('Failed to retrieve user settings:', error);
      return null;
    }
  },

  /**
   * Retrieves user settings with defaults for missing fields
   * @returns Promise resolving to AppSettings with defaults applied
   */
  async getWithDefaults(): Promise<AppSettings> {
    const stored = await this.get();
    if (stored === null) {
      return { ...defaultSettings };
    }
    return { ...defaultSettings, ...stored };
  },

  /**
   * Saves user settings to AsyncStorage
   * @param settings - Complete or partial AppSettings to save
   * @returns Promise resolving to true on success, false on failure
   */
  async save(settings: AppSettings): Promise<boolean> {
    try {
      const json = JSON.stringify(settings);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_SETTINGS, json);
      return true;
    } catch (error) {
      console.error('Failed to save user settings:', error);
      return false;
    }
  },

  /**
   * Updates specific settings fields while preserving others
   * @param updates - Partial AppSettings with fields to update
   * @returns Promise resolving to the updated AppSettings or null on failure
   */
  async update(updates: Partial<AppSettings>): Promise<AppSettings | null> {
    try {
      const current = await this.getWithDefaults();
      const updated = { ...current, ...updates };
      const success = await this.save(updated);
      return success ? updated : null;
    } catch (error) {
      console.error('Failed to update user settings:', error);
      return null;
    }
  },

  /**
   * Resets user settings to defaults
   * @returns Promise resolving to true on success, false on failure
   */
  async reset(): Promise<boolean> {
    return this.save({ ...defaultSettings });
  },

  /**
   * Clears user settings from AsyncStorage
   * @returns Promise resolving to true on success, false on failure
   */
  async clear(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_SETTINGS);
      return true;
    } catch (error) {
      console.error('Failed to clear user settings:', error);
      return false;
    }
  },
};

/**
 * Device pairing storage service
 * Handles persistence of paired BLE devices to AsyncStorage
 */
export const DevicePairingStorage = {
  /**
   * Retrieves all paired devices from AsyncStorage
   * @returns Promise resolving to array of StoredDeviceInfo
   */
  async getAll(): Promise<StoredDeviceInfo[]> {
    try {
      const json = await AsyncStorage.getItem(STORAGE_KEYS.PAIRED_DEVICES);
      if (json === null) {
        return [];
      }
      return JSON.parse(json) as StoredDeviceInfo[];
    } catch (error) {
      console.error('Failed to retrieve paired devices:', error);
      return [];
    }
  },

  /**
   * Retrieves a specific paired device by ID
   * @param deviceId - The device ID to find
   * @returns Promise resolving to StoredDeviceInfo or null if not found
   */
  async getById(deviceId: string): Promise<StoredDeviceInfo | null> {
    try {
      const devices = await this.getAll();
      return devices.find((d) => d.id === deviceId) || null;
    } catch (error) {
      console.error('Failed to retrieve device by ID:', error);
      return null;
    }
  },

  /**
   * Saves a device to paired devices list
   * Updates existing device if ID matches, otherwise adds new device
   * @param device - DeviceInfo to save (battery_level, rssi, is_connected are excluded from storage)
   * @returns Promise resolving to true on success, false on failure
   */
  async save(device: DeviceInfo): Promise<boolean> {
    try {
      const devices = await this.getAll();
      const existingIndex = devices.findIndex((d) => d.id === device.id);

      const storedDevice: StoredDeviceInfo = {
        id: device.id,
        name: device.name,
        type: device.type,
        sampling_rate: device.sampling_rate,
        firmware_version: device.firmware_version,
        paired_at:
          existingIndex >= 0 ? devices[existingIndex].paired_at : Date.now(),
        last_connected: device.last_connected,
      };

      if (existingIndex >= 0) {
        devices[existingIndex] = storedDevice;
      } else {
        devices.push(storedDevice);
      }

      await AsyncStorage.setItem(
        STORAGE_KEYS.PAIRED_DEVICES,
        JSON.stringify(devices)
      );
      return true;
    } catch (error) {
      console.error('Failed to save paired device:', error);
      return false;
    }
  },

  /**
   * Removes a device from paired devices list
   * @param deviceId - The device ID to remove
   * @returns Promise resolving to true on success (including if device not found), false on error
   */
  async remove(deviceId: string): Promise<boolean> {
    try {
      const devices = await this.getAll();
      const filtered = devices.filter((d) => d.id !== deviceId);
      await AsyncStorage.setItem(
        STORAGE_KEYS.PAIRED_DEVICES,
        JSON.stringify(filtered)
      );

      // Clear last paired device if it was the removed device
      const lastPaired = await this.getLastPaired();
      if (lastPaired === deviceId) {
        await this.clearLastPaired();
      }

      return true;
    } catch (error) {
      console.error('Failed to remove paired device:', error);
      return false;
    }
  },

  /**
   * Clears all paired devices from AsyncStorage
   * @returns Promise resolving to true on success, false on failure
   */
  async clearAll(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.PAIRED_DEVICES);
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_PAIRED_DEVICE);
      return true;
    } catch (error) {
      console.error('Failed to clear all paired devices:', error);
      return false;
    }
  },

  /**
   * Gets the ID of the last paired/connected device
   * @returns Promise resolving to device ID string or null
   */
  async getLastPaired(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.LAST_PAIRED_DEVICE);
    } catch (error) {
      console.error('Failed to get last paired device:', error);
      return null;
    }
  },

  /**
   * Sets the last paired/connected device ID
   * @param deviceId - The device ID to set as last paired
   * @returns Promise resolving to true on success, false on failure
   */
  async setLastPaired(deviceId: string): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_PAIRED_DEVICE, deviceId);
      return true;
    } catch (error) {
      console.error('Failed to set last paired device:', error);
      return false;
    }
  },

  /**
   * Clears the last paired device reference
   * @returns Promise resolving to true on success, false on failure
   */
  async clearLastPaired(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.LAST_PAIRED_DEVICE);
      return true;
    } catch (error) {
      console.error('Failed to clear last paired device:', error);
      return false;
    }
  },

  /**
   * Updates the last_connected timestamp for a device
   * @param deviceId - The device ID to update
   * @returns Promise resolving to true on success, false on failure
   */
  async updateLastConnected(deviceId: string): Promise<boolean> {
    try {
      const device = await this.getById(deviceId);
      if (!device) {
        return false;
      }

      const devices = await this.getAll();
      const index = devices.findIndex((d) => d.id === deviceId);
      if (index >= 0) {
        devices[index].last_connected = Date.now();
        await AsyncStorage.setItem(
          STORAGE_KEYS.PAIRED_DEVICES,
          JSON.stringify(devices)
        );
      }
      return true;
    } catch (error) {
      console.error('Failed to update last connected time:', error);
      return false;
    }
  },

  /**
   * Gets the count of paired devices
   * @returns Promise resolving to number of paired devices
   */
  async getCount(): Promise<number> {
    const devices = await this.getAll();
    return devices.length;
  },
};

/**
 * Onboarding status storage service
 * Handles persistence of onboarding completion state
 */
export const OnboardingStorage = {
  /**
   * Checks if onboarding has been completed
   * @returns Promise resolving to true if completed, false otherwise
   */
  async isCompleted(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(
        STORAGE_KEYS.ONBOARDING_COMPLETED
      );
      return value === 'true';
    } catch (error) {
      console.error('Failed to check onboarding status:', error);
      return false;
    }
  },

  /**
   * Marks onboarding as completed
   * @returns Promise resolving to true on success, false on failure
   */
  async markCompleted(): Promise<boolean> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
      return true;
    } catch (error) {
      console.error('Failed to mark onboarding completed:', error);
      return false;
    }
  },

  /**
   * Resets onboarding status (for testing or re-onboarding)
   * @returns Promise resolving to true on success, false on failure
   */
  async reset(): Promise<boolean> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
      return true;
    } catch (error) {
      console.error('Failed to reset onboarding status:', error);
      return false;
    }
  },
};

/**
 * Clears all FlowState app data from AsyncStorage
 * Use with caution - this removes all user data
 * @returns Promise resolving to true on success, false on failure
 */
export const clearAllAppData = async (): Promise<boolean> => {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
    return true;
  } catch (error) {
    console.error('Failed to clear all app data:', error);
    return false;
  }
};
