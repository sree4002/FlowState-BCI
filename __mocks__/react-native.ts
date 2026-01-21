/**
 * Mock for React Native components
 * Provides basic implementations for testing with @testing-library/react-native
 */

import React from 'react';

// Mock TouchableOpacity
export const TouchableOpacity = React.forwardRef(
  (
    {
      children,
      onPress,
      disabled,
      testID,
      accessibilityLabel,
      accessibilityRole,
      accessibilityState,
      style,
      ...props
    }: {
      children?: React.ReactNode;
      onPress?: () => void;
      disabled?: boolean;
      testID?: string;
      accessibilityLabel?: string;
      accessibilityRole?: string;
      accessibilityState?: { disabled?: boolean };
      style?: unknown;
      activeOpacity?: number;
    },
    ref: React.Ref<HTMLDivElement>
  ) => {
    // Pass testID directly for @testing-library/react-native compatibility
    return React.createElement(
      'div',
      {
        ref,
        onClick: disabled ? undefined : onPress,
        testID,
        accessibilityLabel,
        accessibilityRole,
        accessibilityState,
        disabled,
        style,
        ...props,
      },
      children
    );
  }
);
TouchableOpacity.displayName = 'TouchableOpacity';

// Mock Text
export const Text = ({
  children,
  style,
  testID,
  ...props
}: {
  children?: React.ReactNode;
  style?: unknown;
  testID?: string;
}) => {
  return React.createElement('span', { style, testID, ...props }, children);
};

// Mock View
export const View = ({
  children,
  style,
  testID,
  ...props
}: {
  children?: React.ReactNode;
  style?: unknown;
  testID?: string;
}) => {
  return React.createElement('div', { style, testID, ...props }, children);
};

// Mock StyleSheet
export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: (style: unknown) => style,
  absoluteFill: {},
  absoluteFillObject: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  hairlineWidth: 1,
};

// Mock Platform
export const Platform = {
  OS: 'ios',
  select: <T>(obj: { ios?: T; android?: T; default?: T }): T | undefined =>
    obj.ios || obj.default,
  Version: '16.0',
};

// Mock Dimensions
export const Dimensions = {
  get: () => ({
    width: 375,
    height: 812,
    scale: 2,
    fontScale: 1,
  }),
  addEventListener: () => ({ remove: () => {} }),
  removeEventListener: () => {},
};

// Mock Animated
export const Animated = {
  View: View,
  Text: Text,
  Value: class {
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
  },
  timing: () => ({
    start: (callback?: () => void) => callback && callback(),
  }),
  spring: () => ({
    start: (callback?: () => void) => callback && callback(),
  }),
  loop: () => ({
    start: () => {},
    stop: () => {},
  }),
  sequence: () => ({
    start: (callback?: () => void) => callback && callback(),
  }),
  parallel: () => ({
    start: (callback?: () => void) => callback && callback(),
  }),
  createAnimatedComponent: (component: unknown) => component,
};

// Default export for compatibility
export default {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
};
