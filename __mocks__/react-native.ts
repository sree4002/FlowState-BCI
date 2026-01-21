/**
 * Mock implementation of React Native for Jest testing
 * Provides basic component stubs for unit tests
 */

import React from 'react';

// Basic component mock factory
const createComponentMock =
  (name: string) =>
  ({ children, ...props }: { children?: React.ReactNode }) => {
    return React.createElement(name, props, children);
  };

// Mock components
export const View = createComponentMock('View');
export const Text = createComponentMock('Text');
export const TouchableOpacity = createComponentMock('TouchableOpacity');
export const Pressable = createComponentMock('Pressable');
export const Button = createComponentMock('Button');
export const TextInput = createComponentMock('TextInput');
export const ScrollView = createComponentMock('ScrollView');
export const FlatList = createComponentMock('FlatList');
export const Image = createComponentMock('Image');
export const SafeAreaView = createComponentMock('SafeAreaView');
export const Modal = createComponentMock('Modal');
export const ActivityIndicator = createComponentMock('ActivityIndicator');
export const Switch = createComponentMock('Switch');
export const RefreshControl = createComponentMock('RefreshControl');

// Mock StyleSheet
export const StyleSheet = {
  create: <T extends Record<string, Record<string, unknown>>>(styles: T): T =>
    styles,
  flatten: (style: unknown): Record<string, unknown> =>
    typeof style === 'object' && style !== null
      ? (style as Record<string, unknown>)
      : {},
  compose: (
    style1: Record<string, unknown>,
    style2: Record<string, unknown>
  ): Record<string, unknown> => ({
    ...style1,
    ...style2,
  }),
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  hairlineWidth: 0.5,
};

// Mock Platform
export const Platform = {
  OS: 'ios',
  Version: '14.0',
  isPad: false,
  isTV: false,
  isTesting: true,
  select: <T>(options: { ios?: T; android?: T; default?: T }): T | undefined =>
    options.ios ?? options.default,
};

// Mock Dimensions
export const Dimensions = {
  get: (dim: string) => {
    if (dim === 'window' || dim === 'screen') {
      return { width: 375, height: 812, scale: 2, fontScale: 1 };
    }
    return { width: 0, height: 0, scale: 1, fontScale: 1 };
  },
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// Mock PixelRatio
export const PixelRatio = {
  get: () => 2,
  getFontScale: () => 1,
  getPixelSizeForLayoutSize: (size: number) => size * 2,
  roundToNearestPixel: (size: number) => Math.round(size * 2) / 2,
};

// Mock Animated
export const Animated = {
  View: createComponentMock('Animated.View'),
  Text: createComponentMock('Animated.Text'),
  Image: createComponentMock('Animated.Image'),
  ScrollView: createComponentMock('Animated.ScrollView'),
  Value: class AnimatedValue {
    _value: number;
    constructor(value: number) {
      this._value = value;
    }
    setValue(value: number) {
      this._value = value;
    }
    interpolate() {
      return this;
    }
    addListener() {
      return '';
    }
    removeListener() {}
  },
  timing: () => ({
    start: (callback?: () => void) => callback?.(),
    stop: () => {},
  }),
  spring: () => ({
    start: (callback?: () => void) => callback?.(),
    stop: () => {},
  }),
  sequence: () => ({
    start: (callback?: () => void) => callback?.(),
    stop: () => {},
  }),
  parallel: () => ({
    start: (callback?: () => void) => callback?.(),
    stop: () => {},
  }),
  loop: () => ({
    start: (callback?: () => void) => callback?.(),
    stop: () => {},
  }),
  event: () => () => {},
  createAnimatedComponent: (component: unknown) => component,
};

// Mock Alert
export const Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

// Mock Keyboard
export const Keyboard = {
  dismiss: jest.fn(),
  addListener: () => ({ remove: () => {} }),
  removeListener: () => {},
};

// Mock Linking
export const Linking = {
  openURL: jest.fn().mockResolvedValue(true),
  canOpenURL: jest.fn().mockResolvedValue(true),
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: () => ({ remove: () => {} }),
};

// Mock AppState
export const AppState = {
  currentState: 'active',
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// Mock Appearance
export const Appearance = {
  getColorScheme: () => 'dark',
  addChangeListener: () => ({ remove: () => {} }),
};

// Default export
export default {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Button,
  TextInput,
  ScrollView,
  FlatList,
  Image,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Switch,
  RefreshControl,
  StyleSheet,
  Platform,
  Dimensions,
  PixelRatio,
  Animated,
  Alert,
  Keyboard,
  Linking,
  AppState,
  Appearance,
};
