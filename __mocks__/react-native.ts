/**
 * Mock implementation of React Native for Jest testing
 */

import React from 'react';

// Mock View component with testID support
export const View = ({ children, style, testID, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
};

// Mock Text component
export const Text = ({ children, style, ...props }: any) => {
  return React.createElement('Text', { style, ...props }, children);
};

// Mock StyleSheet
export const StyleSheet = {
  create: <T extends Record<string, any>>(styles: T): T => styles,
  flatten: (style: any) => style,
};

// Mock Platform
export const Platform = {
  OS: 'ios',
  select: (obj: any) => obj.ios ?? obj.default,
};

// Mock TouchableOpacity component with testID support
export const TouchableOpacity = ({ children, style, testID, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
};

export const ScrollView = ({ children, style, testID, contentContainerStyle, refreshControl, ...props }: any) => {
  return React.createElement(
    'scrollview',
    { style, 'data-testid': testID, testID, ...props },
    refreshControl,
    children
  );
};
export const SafeAreaView = View;
export const Image = View;
export const ActivityIndicator = View;
export const TextInput = View;
export const FlatList = View;

// Mock Pressable component with testID support
export const Pressable = ({ children, style, testID, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
};

export const RefreshControl = ({ refreshing, onRefresh, ...props }: any) => {
  return React.createElement('refreshcontrol', { refreshing, onRefresh, ...props });
};
export const Modal = ({ children, style, testID, visible, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, visible, ...props },
    children
  );
};

// Mock Dimensions
export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

// Mock Animated
export const Animated = {
  View,
  Text,
  Image,
  Value: class {
    constructor(value: number) {}
    setValue(value: number) {}
    interpolate(config: any) {
      return this;
    }
  },
  timing: () => ({ start: (callback?: () => void) => callback?.() }),
  spring: () => ({ start: (callback?: () => void) => callback?.() }),
  parallel: () => ({ start: (callback?: () => void) => callback?.() }),
  sequence: () => ({ start: (callback?: () => void) => callback?.() }),
};

// Mock PixelRatio
export const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size: number) => size * 2,
  roundToNearestPixel: (size: number) => Math.round(size),
};

// Mock Keyboard
export const Keyboard = {
  dismiss: () => {},
  addListener: () => ({ remove: () => {} }),
};

// Default export
export default {
  View,
  Text,
  StyleSheet,
  Platform,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  ActivityIndicator,
  TextInput,
  FlatList,
  Pressable,
  RefreshControl,
  Modal,
  Dimensions,
  Animated,
  PixelRatio,
  Keyboard,
};
