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

// Mock Slider component
jest.mock('@react-native-community/slider', () => {
  const React = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: (props) => {
      return React.createElement(View, {
        testID: props.testID,
        accessibilityLabel: props.accessibilityLabel,
        accessibilityValue: props.accessibilityValue,
        onValueChange: props.onValueChange,
      });
    },
  };
});
