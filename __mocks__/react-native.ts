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

// Mock TouchableOpacity component with testID support
export const TouchableOpacity = ({
  children,
  style,
  testID,
  ...props
}: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
};

export const ScrollView = ({
  children,
  style,
  testID,
  contentContainerStyle,
  refreshControl,
  ...props
}: any) => {
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

// Mock FlatList component that renders its items
export const FlatList = ({
  data,
  renderItem,
  keyExtractor,
  horizontal,
  testID,
  onViewableItemsChanged,
  style,
  ...props
}: any) => {
  if (!data || !renderItem) {
    return React.createElement('View', { 'data-testid': testID, testID, ...props });
  }
  const items = data.map((item: any, index: number) => {
    const key = keyExtractor ? keyExtractor(item, index) : index.toString();
    return React.createElement(
      'View',
      { key },
      renderItem({ item, index })
    );
  });
  return React.createElement(
    'View',
    {
      style,
      'data-testid': testID,
      testID,
      'data-horizontal': horizontal,
      ...props,
    },
    items
  );
};

// Mock Pressable component with testID support
export const Pressable = ({ children, style, testID, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, ...props },
    children
  );
};

export const RefreshControl = ({ refreshing, onRefresh, ...props }: any) => {
  return React.createElement('refreshcontrol', {
    refreshing,
    onRefresh,
    ...props,
  });
};
export const Modal = ({ children, style, testID, visible, ...props }: any) => {
  return React.createElement(
    'View',
    { style, 'data-testid': testID, testID, visible, ...props },
    children
  );
};

// Mock Switch component
export const Switch = ({
  value,
  onValueChange,
  testID,
  trackColor,
  thumbColor,
  ...props
}: any) => {
  return React.createElement('Switch', {
    value,
    onValueChange,
    'data-testid': testID,
    testID,
    trackColor,
    thumbColor,
    ...props,
  });
};

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

// Mock Animated Value class
class AnimatedValue {
  _value: number;
  constructor(value: number) {
    this._value = value;
  }
  setValue(value: number) {
    this._value = value;
  }
  interpolate(config: any) {
    return this;
  }
  stopAnimation(callback?: (value: number) => void) {
    callback?.(this._value);
  }
}

// Mock Animated
export const Animated = {
  View,
  Text,
  Image,
  Value: AnimatedValue,
  timing: () => ({
    start: (callback?: (result?: { finished: boolean }) => void) => callback?.({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  spring: () => ({
    start: (callback?: (result?: { finished: boolean }) => void) => callback?.({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  parallel: () => ({
    start: (callback?: (result?: { finished: boolean }) => void) => callback?.({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  sequence: () => ({
    start: (callback?: (result?: { finished: boolean }) => void) => callback?.({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  loop: () => ({
    start: (callback?: (result?: { finished: boolean }) => void) => callback?.({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  delay: () => ({
    start: (callback?: (result?: { finished: boolean }) => void) => callback?.({ finished: true }),
    stop: () => {},
    reset: () => {},
  }),
  createAnimatedComponent: (Component: any) => {
    return React.forwardRef((props: any, ref: any) => {
      return React.createElement(Component, { ...props, ref });
    });
  },
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

// Mock Alert
export const Alert = {
  alert: jest.fn(),
};

// Mock PanResponder
export const PanResponder = {
  create: (config: any) => ({
    panHandlers: {
      onStartShouldSetResponder: config.onStartShouldSetPanResponder,
      onMoveShouldSetResponder: config.onMoveShouldSetPanResponder,
      onResponderRelease: config.onPanResponderRelease,
      onResponderGrant: config.onPanResponderGrant,
      onResponderMove: config.onPanResponderMove,
      onResponderTerminate: config.onPanResponderTerminate,
    },
  }),
};

// Mock LayoutAnimation
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

// Mock UIManager
export const UIManager = {
  setLayoutAnimationEnabledExperimental: jest.fn(),
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
  Switch,
  Dimensions,
  Animated,
  Easing,
  PixelRatio,
  Keyboard,
  Alert,
  PanResponder,
  LayoutAnimation,
  UIManager,
};
