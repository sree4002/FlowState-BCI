/**
 * Jest mock for react-native module
 * Provides minimal implementations needed for component testing
 */
import * as React from 'react';

// Platform mock
export const Platform = {
  OS: 'ios' as const,
  Version: '14.0',
  select: jest.fn((obj: Record<string, unknown>) => obj.ios ?? obj.default),
  isPad: false,
  isTVOS: false,
  isTV: false,
};

// StyleSheet mock
export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
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

// View component mock
export const View = ({
  children,
  style,
  testID,
  ...props
}: React.PropsWithChildren<{ style?: unknown; testID?: string }>) =>
  React.createElement('View', { style, testID, ...props }, children);

// Text component mock
export const Text = ({
  children,
  style,
  testID,
  ...props
}: React.PropsWithChildren<{ style?: unknown; testID?: string }>) =>
  React.createElement('Text', { style, testID, ...props }, children);

// ScrollView component mock
export const ScrollView = ({
  children,
  style,
  contentContainerStyle,
  testID,
  ...props
}: React.PropsWithChildren<{
  style?: unknown;
  contentContainerStyle?: unknown;
  testID?: string;
}>) =>
  React.createElement(
    'ScrollView',
    { style, contentContainerStyle, testID, ...props },
    children
  );

// TouchableOpacity component mock
export const TouchableOpacity = ({
  children,
  onPress,
  style,
  activeOpacity,
  testID,
  ...props
}: React.PropsWithChildren<{
  onPress?: () => void;
  style?: unknown;
  activeOpacity?: number;
  testID?: string;
}>) =>
  React.createElement(
    'TouchableOpacity',
    { onPress, style, activeOpacity, testID, ...props },
    children
  );

// Switch component mock
export const Switch = ({
  value,
  onValueChange,
  trackColor,
  thumbColor,
  testID,
  ...props
}: {
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  trackColor?: { false?: string; true?: string };
  thumbColor?: string;
  testID?: string;
}) =>
  React.createElement('Switch', {
    value,
    onValueChange,
    trackColor,
    thumbColor,
    testID,
    ...props,
  });

// Alert mock
export const Alert = {
  alert: jest.fn(),
};

// Dimensions mock
export const Dimensions = {
  get: jest.fn().mockReturnValue({ width: 375, height: 812, scale: 2, fontScale: 1 }),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Other commonly used components and utilities
export const SafeAreaView = View;
export const TouchableHighlight = TouchableOpacity;
export const TouchableWithoutFeedback = TouchableOpacity;
export const Pressable = TouchableOpacity;
export const FlatList = ScrollView;
export const SectionList = ScrollView;
export const Image = View;
export const TextInput = View;
export const ActivityIndicator = View;
export const Modal = View;
export const StatusBar = View;
export const KeyboardAvoidingView = View;

export default {
  Platform,
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Pressable,
  Switch,
  Alert,
  Dimensions,
  SafeAreaView,
  FlatList,
  SectionList,
  Image,
  TextInput,
  ActivityIndicator,
  Modal,
  StatusBar,
  KeyboardAvoidingView,
};
