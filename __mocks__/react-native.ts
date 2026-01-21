/**
 * Mock for react-native module
 * Used by Jest for testing React Native components
 */

import React from 'react';

// Helper to create mock components
const createMockComponent = (name: string) => {
  const Component = ({
    children,
    style,
    testID,
    ...props
  }: {
    children?: React.ReactNode;
    style?: Record<string, unknown>;
    testID?: string;
    [key: string]: unknown;
  }) => {
    return React.createElement(
      name.toLowerCase(),
      { 'data-testid': testID, style, ...props },
      children
    );
  };
  Component.displayName = name;
  return Component;
};

// Mock components
export const View = createMockComponent('View');
export const Text = createMockComponent('Text');
export const TouchableOpacity = createMockComponent('TouchableOpacity');
export const ScrollView = createMockComponent('ScrollView');
export const Image = createMockComponent('Image');
export const TextInput = createMockComponent('TextInput');
export const FlatList = createMockComponent('FlatList');
export const SectionList = createMockComponent('SectionList');
export const ActivityIndicator = createMockComponent('ActivityIndicator');
export const Button = createMockComponent('Button');
export const Modal = createMockComponent('Modal');
export const SafeAreaView = createMockComponent('SafeAreaView');
export const StatusBar = createMockComponent('StatusBar');
export const Switch = createMockComponent('Switch');
export const Pressable = createMockComponent('Pressable');
export const RefreshControl = createMockComponent('RefreshControl');

// StyleSheet mock
export const StyleSheet = {
  create: <T extends Record<string, Record<string, unknown>>>(styles: T): T =>
    styles,
  flatten: (style: unknown) => style,
  hairlineWidth: 1,
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
};

// Platform mock
export const Platform = {
  OS: 'ios',
  Version: '14.0',
  select: <T>(specifics: { ios?: T; android?: T; default?: T }) =>
    specifics.ios ?? specifics.default,
  isPad: false,
  isTV: false,
  isTesting: true,
};

// Dimensions mock
export const Dimensions = {
  get: () => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

// Animated mock
const AnimatedValue = jest.fn().mockImplementation((value: number) => ({
  _value: value,
  setValue: jest.fn(),
  setOffset: jest.fn(),
  flattenOffset: jest.fn(),
  extractOffset: jest.fn(),
  addListener: jest.fn(() => 'listener-id'),
  removeListener: jest.fn(),
  removeAllListeners: jest.fn(),
  stopAnimation: jest.fn(),
  resetAnimation: jest.fn(),
  interpolate: jest.fn(() => ({ __getValue: () => 0 })),
  __getValue: () => value,
}));

export const Animated = {
  Value: AnimatedValue,
  ValueXY: jest.fn(() => ({
    x: new AnimatedValue(0),
    y: new AnimatedValue(0),
    setValue: jest.fn(),
    setOffset: jest.fn(),
    flattenOffset: jest.fn(),
    extractOffset: jest.fn(),
    stopAnimation: jest.fn(),
    resetAnimation: jest.fn(),
    addListener: jest.fn(() => 'listener-id'),
    removeListener: jest.fn(),
    removeAllListeners: jest.fn(),
    getLayout: jest.fn(() => ({})),
    getTranslateTransform: jest.fn(() => []),
  })),
  timing: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  spring: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  decay: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  parallel: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  sequence: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  stagger: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  loop: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  event: jest.fn(() => jest.fn()),
  add: jest.fn(() => new AnimatedValue(0)),
  subtract: jest.fn(() => new AnimatedValue(0)),
  multiply: jest.fn(() => new AnimatedValue(0)),
  divide: jest.fn(() => new AnimatedValue(0)),
  modulo: jest.fn(() => new AnimatedValue(0)),
  diffClamp: jest.fn(() => new AnimatedValue(0)),
  delay: jest.fn(() => ({
    start: jest.fn((callback?: (result: { finished: boolean }) => void) => {
      callback?.({ finished: true });
    }),
    stop: jest.fn(),
    reset: jest.fn(),
  })),
  createAnimatedComponent: <T extends React.ComponentType<unknown>>(
    component: T
  ) => component,
  View: createMockComponent('Animated.View'),
  Text: createMockComponent('Animated.Text'),
  Image: createMockComponent('Animated.Image'),
  ScrollView: createMockComponent('Animated.ScrollView'),
  FlatList: createMockComponent('Animated.FlatList'),
};

// Alert mock
export const Alert = {
  alert: jest.fn(),
  prompt: jest.fn(),
};

// Linking mock
export const Linking = {
  openURL: jest.fn(() => Promise.resolve()),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

// AppState mock
export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
};

// Keyboard mock
export const Keyboard = {
  dismiss: jest.fn(),
  addListener: jest.fn(() => ({ remove: jest.fn() })),
  removeListener: jest.fn(),
  scheduleLayoutAnimation: jest.fn(),
};

// LayoutAnimation mock
export const LayoutAnimation = {
  configureNext: jest.fn(),
  create: jest.fn(),
  Types: {
    spring: 'spring',
    linear: 'linear',
    easeInEaseOut: 'easeInEaseOut',
    easeIn: 'easeIn',
    easeOut: 'easeOut',
  },
  Properties: {
    opacity: 'opacity',
    scaleX: 'scaleX',
    scaleY: 'scaleY',
    scaleXY: 'scaleXY',
  },
  Presets: {
    easeInEaseOut: {},
    linear: {},
    spring: {},
  },
};

// Appearance mock
export const Appearance = {
  getColorScheme: jest.fn(() => 'light'),
  addChangeListener: jest.fn(() => ({ remove: jest.fn() })),
  removeChangeListener: jest.fn(),
};

// useColorScheme hook mock
export const useColorScheme = jest.fn(() => 'light');

// useWindowDimensions hook mock
export const useWindowDimensions = jest.fn(() => ({
  width: 375,
  height: 812,
  scale: 2,
  fontScale: 1,
}));

// PixelRatio mock
export const PixelRatio = {
  get: jest.fn(() => 2),
  getFontScale: jest.fn(() => 1),
  getPixelSizeForLayoutSize: jest.fn((size: number) => size * 2),
  roundToNearestPixel: jest.fn((size: number) => size),
};

// NativeModules mock
export const NativeModules = {};

// Export default
export default {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  FlatList,
  SectionList,
  ActivityIndicator,
  Button,
  Modal,
  SafeAreaView,
  StatusBar,
  Switch,
  Pressable,
  RefreshControl,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
  Alert,
  Linking,
  AppState,
  Keyboard,
  LayoutAnimation,
  Appearance,
  useColorScheme,
  useWindowDimensions,
  PixelRatio,
  NativeModules,
};
