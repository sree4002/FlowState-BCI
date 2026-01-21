/**
 * Unit tests for AsyncStorage wrapper service
 * Tests UserSettingsStorage, DevicePairingStorage, OnboardingStorage
 */

import {
  STORAGE_KEYS,
  UserSettingsStorage,
  DevicePairingStorage,
  OnboardingStorage,
  StoredDeviceInfo,
  clearAllAppData,
} from '../src/services/storage';
import { AppSettings, DeviceInfo } from '../src/types';
import { defaultSettings } from '../src/contexts/SettingsContext';

// In-memory mock storage
let mockStorage: Map<string, string> = new Map();

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(async (key: string): Promise<string | null> => {
    return mockStorage.get(key) ?? null;
  }),
  setItem: jest.fn(async (key: string, value: string): Promise<void> => {
    mockStorage.set(key, value);
  }),
  removeItem: jest.fn(async (key: string): Promise<void> => {
    mockStorage.delete(key);
  }),
  multiRemove: jest.fn(async (keys: string[]): Promise<void> => {
    keys.forEach((key) => mockStorage.delete(key));
  }),
  clear: jest.fn(async (): Promise<void> => {
    mockStorage.clear();
  }),
}));

// Import the mocked module after mocking
import AsyncStorage from '@react-native-async-storage/async-storage';

// Helper to reset mock storage
const resetMockStorage = () => {
  mockStorage = new Map();
  jest.clearAllMocks();
};

// Helper to set mock storage
const setMockStorage = (data: Record<string, string>) => {
  mockStorage = new Map(Object.entries(data));
};

describe('Storage Keys', () => {
  it('should have all required storage keys', () => {
    expect(STORAGE_KEYS.USER_SETTINGS).toBe('@flowstate/user_settings');
    expect(STORAGE_KEYS.PAIRED_DEVICES).toBe('@flowstate/paired_devices');
    expect(STORAGE_KEYS.LAST_PAIRED_DEVICE).toBe(
      '@flowstate/last_paired_device'
    );
    expect(STORAGE_KEYS.ONBOARDING_COMPLETED).toBe(
      '@flowstate/onboarding_completed'
    );
  });

  it('should have unique storage keys', () => {
    const keys = Object.values(STORAGE_KEYS);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);
  });

  it('should use @flowstate namespace prefix', () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      expect(key.startsWith('@flowstate/')).toBe(true);
    });
  });
});

describe('UserSettingsStorage', () => {
  beforeEach(() => {
    resetMockStorage();
  });

  describe('get', () => {
    it('should return null when no settings stored', async () => {
      const result = await UserSettingsStorage.get();
      expect(result).toBeNull();
    });

    it('should return stored settings', async () => {
      const settings: AppSettings = { ...defaultSettings, default_volume: 80 };
      setMockStorage({
        [STORAGE_KEYS.USER_SETTINGS]: JSON.stringify(settings),
      });

      const result = await UserSettingsStorage.get();
      expect(result).toEqual(settings);
      expect(result?.default_volume).toBe(80);
    });

    it('should return null on parse error', async () => {
      setMockStorage({
        [STORAGE_KEYS.USER_SETTINGS]: 'invalid json',
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await UserSettingsStorage.get();
      expect(result).toBeNull();
      consoleSpy.mockRestore();
    });
  });

  describe('getWithDefaults', () => {
    it('should return default settings when none stored', async () => {
      const result = await UserSettingsStorage.getWithDefaults();
      expect(result).toEqual(defaultSettings);
    });

    it('should merge stored settings with defaults', async () => {
      const partialSettings = { default_volume: 90, haptic_feedback: false };
      setMockStorage({
        [STORAGE_KEYS.USER_SETTINGS]: JSON.stringify(partialSettings),
      });

      const result = await UserSettingsStorage.getWithDefaults();
      expect(result.default_volume).toBe(90);
      expect(result.haptic_feedback).toBe(false);
      expect(result.auto_reconnect).toBe(defaultSettings.auto_reconnect);
    });
  });

  describe('save', () => {
    it('should save settings to AsyncStorage', async () => {
      const settings: AppSettings = { ...defaultSettings, default_volume: 75 };

      const result = await UserSettingsStorage.save(settings);

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(settings)
      );
    });

    it('should return false on save error', async () => {
      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Save failed')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await UserSettingsStorage.save(defaultSettings);
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('update', () => {
    it('should update specific settings while preserving others', async () => {
      const initial: AppSettings = { ...defaultSettings, default_volume: 50 };
      setMockStorage({
        [STORAGE_KEYS.USER_SETTINGS]: JSON.stringify(initial),
      });

      const result = await UserSettingsStorage.update({
        haptic_feedback: false,
        text_size: 'large',
      });

      expect(result).not.toBeNull();
      expect(result?.haptic_feedback).toBe(false);
      expect(result?.text_size).toBe('large');
      expect(result?.default_volume).toBe(50);
    });

    it('should use defaults for missing fields', async () => {
      const result = await UserSettingsStorage.update({ default_volume: 100 });

      expect(result).not.toBeNull();
      expect(result?.default_volume).toBe(100);
      expect(result?.auto_reconnect).toBe(defaultSettings.auto_reconnect);
    });
  });

  describe('reset', () => {
    it('should reset settings to defaults', async () => {
      const result = await UserSettingsStorage.reset();

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SETTINGS,
        JSON.stringify(defaultSettings)
      );
    });
  });

  describe('clear', () => {
    it('should remove settings from AsyncStorage', async () => {
      const result = await UserSettingsStorage.clear();

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.USER_SETTINGS
      );
    });

    it('should return false on clear error', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
        new Error('Remove failed')
      );

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await UserSettingsStorage.clear();
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });
});

describe('DevicePairingStorage', () => {
  beforeEach(() => {
    resetMockStorage();
  });

  const createMockDeviceInfo = (
    id: string,
    name: string = 'Test Device'
  ): DeviceInfo => ({
    id,
    name,
    type: 'headband',
    sampling_rate: 500,
    battery_level: 85,
    firmware_version: '1.0.0',
    rssi: -50,
    is_connected: true,
    last_connected: Date.now(),
  });

  const createStoredDevice = (
    id: string,
    name: string = 'Test Device'
  ): StoredDeviceInfo => ({
    id,
    name,
    type: 'headband',
    sampling_rate: 500,
    firmware_version: '1.0.0',
    paired_at: Date.now(),
    last_connected: Date.now(),
  });

  describe('getAll', () => {
    it('should return empty array when no devices stored', async () => {
      const result = await DevicePairingStorage.getAll();
      expect(result).toEqual([]);
    });

    it('should return all stored devices', async () => {
      const devices: StoredDeviceInfo[] = [
        createStoredDevice('device-1', 'Device 1'),
        createStoredDevice('device-2', 'Device 2'),
      ];
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify(devices),
      });

      const result = await DevicePairingStorage.getAll();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('device-1');
      expect(result[1].id).toBe('device-2');
    });

    it('should return empty array on parse error', async () => {
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: 'invalid json',
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = await DevicePairingStorage.getAll();
      expect(result).toEqual([]);
      consoleSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('should return null when device not found', async () => {
      const result = await DevicePairingStorage.getById('non-existent');
      expect(result).toBeNull();
    });

    it('should return device by ID', async () => {
      const devices: StoredDeviceInfo[] = [
        createStoredDevice('device-1', 'Device 1'),
        createStoredDevice('device-2', 'Device 2'),
      ];
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify(devices),
      });

      const result = await DevicePairingStorage.getById('device-2');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('device-2');
      expect(result?.name).toBe('Device 2');
    });
  });

  describe('save', () => {
    it('should add new device to storage', async () => {
      const device = createMockDeviceInfo('device-1');

      const result = await DevicePairingStorage.save(device);

      expect(result).toBe(true);
      const stored = JSON.parse(
        mockStorage.get(STORAGE_KEYS.PAIRED_DEVICES) || '[]'
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('device-1');
    });

    it('should update existing device', async () => {
      const initialDevice = createStoredDevice('device-1', 'Old Name');
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify([initialDevice]),
      });

      const updatedDevice = createMockDeviceInfo('device-1', 'New Name');
      const result = await DevicePairingStorage.save(updatedDevice);

      expect(result).toBe(true);
      const stored = JSON.parse(
        mockStorage.get(STORAGE_KEYS.PAIRED_DEVICES) || '[]'
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].name).toBe('New Name');
    });

    it('should preserve paired_at timestamp on update', async () => {
      const pairedAt = Date.now() - 100000;
      const initialDevice: StoredDeviceInfo = {
        ...createStoredDevice('device-1'),
        paired_at: pairedAt,
      };
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify([initialDevice]),
      });

      const updatedDevice = createMockDeviceInfo('device-1', 'Updated Device');
      await DevicePairingStorage.save(updatedDevice);

      const stored = JSON.parse(
        mockStorage.get(STORAGE_KEYS.PAIRED_DEVICES) || '[]'
      );
      expect(stored[0].paired_at).toBe(pairedAt);
    });

    it('should not store runtime-only fields (battery_level, rssi, is_connected)', async () => {
      const device = createMockDeviceInfo('device-1');

      await DevicePairingStorage.save(device);

      const stored = JSON.parse(
        mockStorage.get(STORAGE_KEYS.PAIRED_DEVICES) || '[]'
      );
      expect(stored[0]).not.toHaveProperty('battery_level');
      expect(stored[0]).not.toHaveProperty('rssi');
      expect(stored[0]).not.toHaveProperty('is_connected');
    });
  });

  describe('remove', () => {
    it('should remove device from storage', async () => {
      const devices: StoredDeviceInfo[] = [
        createStoredDevice('device-1'),
        createStoredDevice('device-2'),
      ];
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify(devices),
      });

      const result = await DevicePairingStorage.remove('device-1');

      expect(result).toBe(true);
      const stored = JSON.parse(
        mockStorage.get(STORAGE_KEYS.PAIRED_DEVICES) || '[]'
      );
      expect(stored).toHaveLength(1);
      expect(stored[0].id).toBe('device-2');
    });

    it('should succeed even if device not found', async () => {
      const result = await DevicePairingStorage.remove('non-existent');
      expect(result).toBe(true);
    });

    it('should clear last paired if removed device was last paired', async () => {
      const devices: StoredDeviceInfo[] = [createStoredDevice('device-1')];
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify(devices),
        [STORAGE_KEYS.LAST_PAIRED_DEVICE]: 'device-1',
      });

      await DevicePairingStorage.remove('device-1');

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_PAIRED_DEVICE
      );
    });
  });

  describe('clearAll', () => {
    it('should remove all paired devices and last paired', async () => {
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify([
          createStoredDevice('device-1'),
        ]),
        [STORAGE_KEYS.LAST_PAIRED_DEVICE]: 'device-1',
      });

      const result = await DevicePairingStorage.clearAll();

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PAIRED_DEVICES
      );
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_PAIRED_DEVICE
      );
    });
  });

  describe('getLastPaired', () => {
    it('should return null when no last paired device', async () => {
      const result = await DevicePairingStorage.getLastPaired();
      expect(result).toBeNull();
    });

    it('should return last paired device ID', async () => {
      setMockStorage({
        [STORAGE_KEYS.LAST_PAIRED_DEVICE]: 'device-1',
      });

      const result = await DevicePairingStorage.getLastPaired();
      expect(result).toBe('device-1');
    });
  });

  describe('setLastPaired', () => {
    it('should set last paired device ID', async () => {
      const result = await DevicePairingStorage.setLastPaired('device-2');

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_PAIRED_DEVICE,
        'device-2'
      );
    });
  });

  describe('clearLastPaired', () => {
    it('should clear last paired device', async () => {
      const result = await DevicePairingStorage.clearLastPaired();

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.LAST_PAIRED_DEVICE
      );
    });
  });

  describe('updateLastConnected', () => {
    it('should update last connected timestamp', async () => {
      const device = createStoredDevice('device-1');
      device.last_connected = null;
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify([device]),
      });

      const beforeUpdate = Date.now();
      const result = await DevicePairingStorage.updateLastConnected('device-1');

      expect(result).toBe(true);
      const stored = JSON.parse(
        mockStorage.get(STORAGE_KEYS.PAIRED_DEVICES) || '[]'
      );
      expect(stored[0].last_connected).toBeGreaterThanOrEqual(beforeUpdate);
    });

    it('should return false if device not found', async () => {
      const result =
        await DevicePairingStorage.updateLastConnected('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getCount', () => {
    it('should return 0 when no devices stored', async () => {
      const result = await DevicePairingStorage.getCount();
      expect(result).toBe(0);
    });

    it('should return count of stored devices', async () => {
      const devices: StoredDeviceInfo[] = [
        createStoredDevice('device-1'),
        createStoredDevice('device-2'),
        createStoredDevice('device-3'),
      ];
      setMockStorage({
        [STORAGE_KEYS.PAIRED_DEVICES]: JSON.stringify(devices),
      });

      const result = await DevicePairingStorage.getCount();
      expect(result).toBe(3);
    });
  });
});

describe('OnboardingStorage', () => {
  beforeEach(() => {
    resetMockStorage();
  });

  describe('isCompleted', () => {
    it('should return false when not completed', async () => {
      const result = await OnboardingStorage.isCompleted();
      expect(result).toBe(false);
    });

    it('should return true when completed', async () => {
      setMockStorage({
        [STORAGE_KEYS.ONBOARDING_COMPLETED]: 'true',
      });

      const result = await OnboardingStorage.isCompleted();
      expect(result).toBe(true);
    });

    it('should return false for invalid value', async () => {
      setMockStorage({
        [STORAGE_KEYS.ONBOARDING_COMPLETED]: 'invalid',
      });

      const result = await OnboardingStorage.isCompleted();
      expect(result).toBe(false);
    });
  });

  describe('markCompleted', () => {
    it('should mark onboarding as completed', async () => {
      const result = await OnboardingStorage.markCompleted();

      expect(result).toBe(true);
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ONBOARDING_COMPLETED,
        'true'
      );
    });
  });

  describe('reset', () => {
    it('should reset onboarding status', async () => {
      const result = await OnboardingStorage.reset();

      expect(result).toBe(true);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.ONBOARDING_COMPLETED
      );
    });
  });
});

describe('clearAllAppData', () => {
  beforeEach(() => {
    resetMockStorage();
  });

  it('should clear all storage keys', async () => {
    const result = await clearAllAppData();

    expect(result).toBe(true);
    expect(AsyncStorage.multiRemove).toHaveBeenCalledWith(
      Object.values(STORAGE_KEYS)
    );
  });

  it('should return false on error', async () => {
    (AsyncStorage.multiRemove as jest.Mock).mockRejectedValueOnce(
      new Error('Multi-remove failed')
    );

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const result = await clearAllAppData();
    expect(result).toBe(false);
    consoleSpy.mockRestore();
  });
});

describe('StoredDeviceInfo type', () => {
  it('should have required fields', () => {
    const device: StoredDeviceInfo = {
      id: 'test-id',
      name: 'Test Device',
      type: 'headband',
      sampling_rate: 500,
      firmware_version: '1.0.0',
      paired_at: Date.now(),
      last_connected: Date.now(),
    };

    expect(device.id).toBeDefined();
    expect(device.name).toBeDefined();
    expect(device.type).toBeDefined();
    expect(device.sampling_rate).toBeDefined();
    expect(device.firmware_version).toBeDefined();
    expect(device.paired_at).toBeDefined();
    expect(device.last_connected).toBeDefined();
  });

  it('should support earpiece device type', () => {
    const device: StoredDeviceInfo = {
      id: 'earpiece-1',
      name: 'Earpiece Device',
      type: 'earpiece',
      sampling_rate: 250,
      firmware_version: null,
      paired_at: Date.now(),
      last_connected: null,
    };

    expect(device.type).toBe('earpiece');
    expect(device.sampling_rate).toBe(250);
    expect(device.firmware_version).toBeNull();
    expect(device.last_connected).toBeNull();
  });
});
