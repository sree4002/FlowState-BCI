import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  STORAGE_KEYS,
  PairedDeviceData,
  deviceInfoToPairedData,
  savePairedDevice,
  getPairedDevice,
  removePairedDevice,
  updatePairedDeviceLastConnected,
  hasPairedDevice,
  getPairedDeviceId,
  clearAllStorage,
} from '../src/services/storage';
import { DeviceInfo } from '../src/types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
  multiRemove: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
}));

const mockedAsyncStorage = jest.mocked(AsyncStorage);

describe('Storage Service - Paired Device', () => {
  // Sample test data
  const mockDeviceInfo: DeviceInfo = {
    id: 'device-123',
    name: 'FlowState Headband',
    type: 'headband',
    sampling_rate: 256,
    battery_level: 85,
    firmware_version: '1.2.3',
    rssi: -45,
    is_connected: true,
    last_connected: 1705708800000,
  };

  const mockPairedDeviceData: PairedDeviceData = {
    id: 'device-123',
    name: 'FlowState Headband',
    type: 'headband',
    paired_at: 1705708800000,
    last_connected: 1705708800000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(1705708800000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('STORAGE_KEYS', () => {
    it('should have correct key for paired device', () => {
      expect(STORAGE_KEYS.PAIRED_DEVICE).toBe('@flowstate/paired_device');
    });

    it('should have all required storage keys', () => {
      expect(STORAGE_KEYS).toHaveProperty('PAIRED_DEVICE');
      expect(STORAGE_KEYS).toHaveProperty('USER_SETTINGS');
      expect(STORAGE_KEYS).toHaveProperty('SESSIONS');
      expect(STORAGE_KEYS).toHaveProperty('ONBOARDING_COMPLETED');
    });

    it('should have keys prefixed with @flowstate/', () => {
      Object.values(STORAGE_KEYS).forEach((key) => {
        expect(key).toMatch(/^@flowstate\//);
      });
    });
  });

  describe('deviceInfoToPairedData', () => {
    it('should convert DeviceInfo to PairedDeviceData', () => {
      const result = deviceInfoToPairedData(mockDeviceInfo);

      expect(result.id).toBe(mockDeviceInfo.id);
      expect(result.name).toBe(mockDeviceInfo.name);
      expect(result.type).toBe(mockDeviceInfo.type);
      expect(result.paired_at).toBe(1705708800000);
      expect(result.last_connected).toBe(mockDeviceInfo.last_connected);
    });

    it('should not include unnecessary DeviceInfo fields', () => {
      const result = deviceInfoToPairedData(mockDeviceInfo);

      expect(result).not.toHaveProperty('sampling_rate');
      expect(result).not.toHaveProperty('battery_level');
      expect(result).not.toHaveProperty('firmware_version');
      expect(result).not.toHaveProperty('rssi');
      expect(result).not.toHaveProperty('is_connected');
    });

    it('should use current timestamp for paired_at', () => {
      const now = 1705795200000;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = deviceInfoToPairedData(mockDeviceInfo);

      expect(result.paired_at).toBe(now);
    });

    it('should handle device with null last_connected', () => {
      const deviceWithNullLastConnected: DeviceInfo = {
        ...mockDeviceInfo,
        last_connected: null,
      };

      const result = deviceInfoToPairedData(deviceWithNullLastConnected);

      expect(result.last_connected).toBeNull();
    });

    it('should handle earpiece device type', () => {
      const earpieceDevice: DeviceInfo = {
        ...mockDeviceInfo,
        type: 'earpiece',
      };

      const result = deviceInfoToPairedData(earpieceDevice);

      expect(result.type).toBe('earpiece');
    });
  });

  describe('savePairedDevice', () => {
    it('should save DeviceInfo to AsyncStorage', async () => {
      await savePairedDevice(mockDeviceInfo);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PAIRED_DEVICE,
        expect.any(String)
      );

      const savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[0][1] as string
      );
      expect(savedData.id).toBe(mockDeviceInfo.id);
      expect(savedData.name).toBe(mockDeviceInfo.name);
      expect(savedData.type).toBe(mockDeviceInfo.type);
    });

    it('should save PairedDeviceData directly', async () => {
      await savePairedDevice(mockPairedDeviceData);

      expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1);

      const savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[0][1] as string
      );
      expect(savedData).toEqual(mockPairedDeviceData);
    });

    it('should serialize data as JSON', async () => {
      await savePairedDevice(mockPairedDeviceData);

      const savedString = mockedAsyncStorage.setItem.mock.calls[0][1] as string;
      expect(() => JSON.parse(savedString)).not.toThrow();
    });

    it('should return false on AsyncStorage errors', async () => {
      const error = new Error('Storage full');
      mockedAsyncStorage.setItem.mockRejectedValueOnce(error);

      const result = await savePairedDevice(mockPairedDeviceData);
      expect(result).toBe(false);
    });
  });

  describe('getPairedDevice', () => {
    it('should return null when no device is paired', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await getPairedDevice();

      expect(result).toBeNull();
      expect(mockedAsyncStorage.getItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PAIRED_DEVICE
      );
    });

    it('should return paired device data when present', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockPairedDeviceData)
      );

      const result = await getPairedDevice();

      expect(result).toEqual(mockPairedDeviceData);
    });

    it('should parse JSON data correctly', async () => {
      const deviceWithNullLastConnected: PairedDeviceData = {
        ...mockPairedDeviceData,
        last_connected: null,
      };
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(deviceWithNullLastConnected)
      );

      const result = await getPairedDevice();

      expect(result).not.toBeNull();
      expect(result!.last_connected).toBeNull();
    });

    it('should return data even with missing id (graceful degradation)', async () => {
      const invalidData = { name: 'Test', type: 'headband', paired_at: 123 };
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(invalidData)
      );

      const result = await getPairedDevice();
      expect(result).toEqual(invalidData);
    });

    it('should return data even with wrong type (graceful degradation)', async () => {
      const invalidData = {
        id: '123',
        name: 'Test',
        type: 'invalid',
        paired_at: 123,
      };
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(invalidData)
      );

      const result = await getPairedDevice();
      expect(result).toEqual(invalidData);
    });

    it('should return data even with missing paired_at (graceful degradation)', async () => {
      const invalidData = { id: '123', name: 'Test', type: 'headband' };
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(invalidData)
      );

      const result = await getPairedDevice();
      expect(result).toEqual(invalidData);
    });

    it('should return null on AsyncStorage errors', async () => {
      const error = new Error('Storage unavailable');
      mockedAsyncStorage.getItem.mockRejectedValueOnce(error);

      const result = await getPairedDevice();
      expect(result).toBeNull();
    });

    it('should return null for corrupted JSON', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce('not valid json');

      const result = await getPairedDevice();
      expect(result).toBeNull();
    });
  });

  describe('removePairedDevice', () => {
    it('should remove paired device from AsyncStorage', async () => {
      await removePairedDevice();

      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledTimes(1);
      expect(mockedAsyncStorage.removeItem).toHaveBeenCalledWith(
        STORAGE_KEYS.PAIRED_DEVICE
      );
    });

    it('should not throw when no device is paired', async () => {
      await expect(removePairedDevice()).resolves.not.toThrow();
    });

    it('should return false on AsyncStorage errors', async () => {
      const error = new Error('Remove failed');
      mockedAsyncStorage.removeItem.mockRejectedValueOnce(error);

      const result = await removePairedDevice();
      expect(result).toBe(false);
    });
  });

  describe('updatePairedDeviceLastConnected', () => {
    it('should update last_connected with current time', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockPairedDeviceData)
      );

      const now = 1705968000000;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      const result = await updatePairedDeviceLastConnected();

      expect(result).toBe(true);
      expect(mockedAsyncStorage.setItem).toHaveBeenCalledTimes(1);

      const savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[0][1] as string
      );
      expect(savedData.last_connected).toBe(now);
    });

    it('should return false when no device is paired', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await updatePairedDeviceLastConnected();
      expect(result).toBe(false);
    });

    it('should preserve other device data when updating', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockPairedDeviceData)
      );

      const now = 1705968000000;
      jest.spyOn(Date, 'now').mockReturnValue(now);

      await updatePairedDeviceLastConnected();

      const savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[0][1] as string
      );
      expect(savedData.id).toBe(mockPairedDeviceData.id);
      expect(savedData.name).toBe(mockPairedDeviceData.name);
      expect(savedData.type).toBe(mockPairedDeviceData.type);
      expect(savedData.paired_at).toBe(mockPairedDeviceData.paired_at);
    });
  });

  describe('hasPairedDevice', () => {
    it('should return true when device is paired', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockPairedDeviceData)
      );

      const result = await hasPairedDevice();

      expect(result).toBe(true);
    });

    it('should return false when no device is paired', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await hasPairedDevice();

      expect(result).toBe(false);
    });
  });

  describe('getPairedDeviceId', () => {
    it('should return device ID when paired', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(mockPairedDeviceData)
      );

      const result = await getPairedDeviceId();

      expect(result).toBe(mockPairedDeviceData.id);
    });

    it('should return null when no device is paired', async () => {
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      const result = await getPairedDeviceId();

      expect(result).toBeNull();
    });
  });

  describe('clearAllStorage', () => {
    it('should remove all storage keys', async () => {
      await clearAllStorage();

      expect(mockedAsyncStorage.multiRemove).toHaveBeenCalledTimes(1);
      expect(mockedAsyncStorage.multiRemove).toHaveBeenCalledWith(
        expect.arrayContaining([
          STORAGE_KEYS.PAIRED_DEVICE,
          STORAGE_KEYS.USER_SETTINGS,
          STORAGE_KEYS.SESSIONS,
          STORAGE_KEYS.ONBOARDING_COMPLETED,
        ])
      );
    });

    it('should return false on AsyncStorage errors', async () => {
      const error = new Error('Multi-remove failed');
      mockedAsyncStorage.multiRemove.mockRejectedValueOnce(error);

      const result = await clearAllStorage();
      expect(result).toBe(false);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle pair -> get -> update -> get cycle', async () => {
      // First save
      await savePairedDevice(mockPairedDeviceData);

      // Mock get to return what was saved
      const savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[0][1] as string
      );
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(savedData)
      );

      // Get paired device
      const retrieved = await getPairedDevice();
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(mockPairedDeviceData.id);

      // Mock for update operation
      mockedAsyncStorage.getItem.mockResolvedValueOnce(
        JSON.stringify(savedData)
      );

      // Update last connected (uses Date.now() internally)
      const newTimestamp = 1705881600000;
      jest.spyOn(Date, 'now').mockReturnValue(newTimestamp);
      await updatePairedDeviceLastConnected();

      // Verify update was made
      const updatedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[1][1] as string
      );
      expect(updatedData.last_connected).toBe(newTimestamp);
    });

    it('should handle pair -> remove -> get cycle', async () => {
      // Save device
      await savePairedDevice(mockDeviceInfo);

      // Remove device
      await removePairedDevice();

      // Mock that storage is empty
      mockedAsyncStorage.getItem.mockResolvedValueOnce(null);

      // Get should return null
      const result = await getPairedDevice();
      expect(result).toBeNull();
    });

    it('should handle both headband and earpiece device types', async () => {
      // Test headband
      await savePairedDevice(mockDeviceInfo);
      let savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[0][1] as string
      );
      expect(savedData.type).toBe('headband');

      // Test earpiece
      const earpieceDevice: DeviceInfo = {
        ...mockDeviceInfo,
        type: 'earpiece',
        name: 'FlowState Earpiece',
      };
      await savePairedDevice(earpieceDevice);
      savedData = JSON.parse(
        mockedAsyncStorage.setItem.mock.calls[1][1] as string
      );
      expect(savedData.type).toBe('earpiece');
    });
  });
});
