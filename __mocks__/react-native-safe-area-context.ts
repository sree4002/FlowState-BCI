/**
 * Mock implementation of react-native-safe-area-context
 */

import React from 'react';

// Mock SafeAreaProvider
export const SafeAreaProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return React.createElement('SafeAreaProvider', null, children);
};

// Mock SafeAreaView
export const SafeAreaView: React.FC<{
  children?: React.ReactNode;
  style?: any;
}> = ({ children, style }) => {
  return React.createElement('SafeAreaView', { style }, children);
};

// Mock useSafeAreaInsets hook
export const useSafeAreaInsets = () => ({
  top: 47,
  bottom: 34,
  left: 0,
  right: 0,
});

// Mock useSafeAreaFrame hook
export const useSafeAreaFrame = () => ({
  x: 0,
  y: 0,
  width: 375,
  height: 812,
});

// Mock EdgeInsets type
export type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export default {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
  useSafeAreaFrame,
};
