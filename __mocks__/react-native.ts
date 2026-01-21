/**
 * Mock implementation of React Native for Jest testing
 */

import React from 'react';

// Mock View component
export const View = ({ children, style, testID, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
};

// Mock Text component
export const Text = ({ children, style, testID, ...props }: any) => {
  return React.createElement(
    'Text',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
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

// Mock other commonly used components
export const TouchableOpacity = View;
export const ScrollView = View;
export const SafeAreaView = View;
export const Image = View;
export const ActivityIndicator = View;
export const TextInput = View;
export const FlatList = View;
export const Pressable = View;

// Mock Dimensions
export const Dimensions = {
  get: () => ({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: () => ({ remove: () => {} }),
};

// Mock Easing
export const Easing = {
  linear: (t: number) => t,
  ease: (t: number) => t,
  quad: (t: number) => t * t,
  cubic: (t: number) => t * t * t,
  poly: (n: number) => (t: number) => Math.pow(t, n),
  sin: (t: number) => 1 - Math.cos((t * Math.PI) / 2),
  circle: (t: number) => 1 - Math.sqrt(1 - t * t),
  exp: (t: number) => Math.pow(2, 10 * (t - 1)),
  elastic: (a?: number, p?: number) => (t: number) => t,
  back: (s?: number) => (t: number) => t,
  bounce: (t: number) => t,
  bezier: (x1: number, y1: number, x2: number, y2: number) => (t: number) => t,
  in: (easing: (t: number) => number) => easing,
  out: (easing: (t: number) => number) => (t: number) => 1 - easing(1 - t),
  inOut: (easing: (t: number) => number) => (t: number) => t,
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
  Dimensions,
  Animated,
  Easing,
  PixelRatio,
  Keyboard,
};
