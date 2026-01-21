// Jest setup file
// Note: @testing-library/jest-native is deprecated in favor of @testing-library/react-native v12.4+

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock BLE
jest.mock('react-native-ble-plx', () => ({
  BleManager: jest.fn(),
}));
