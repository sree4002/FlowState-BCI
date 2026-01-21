/**
 * Mock implementation of @react-navigation/native
 */

import React from 'react';

// Mock navigation object
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  reset: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  isFocused: jest.fn(() => true),
  canGoBack: jest.fn(() => true),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
  getParent: jest.fn(),
  getState: jest.fn(() => ({
    index: 0,
    routes: [{ name: 'Dashboard', key: 'dashboard-1' }],
  })),
};

// Mock route object
const mockRoute = {
  key: 'test-route-key',
  name: 'TestScreen',
  params: {},
};

// Mock useNavigation hook
export const useNavigation = () => mockNavigation;

// Mock useRoute hook
export const useRoute = () => mockRoute;

// Mock useFocusEffect hook
export const useFocusEffect = (callback: () => void | (() => void)) => {
  React.useEffect(() => {
    const cleanup = callback();
    return cleanup;
  }, [callback]);
};

// Mock useIsFocused hook
export const useIsFocused = () => true;

// Mock NavigationContainer
export const NavigationContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return React.createElement('NavigationContainer', null, children);
};

// Mock createNavigationContainerRef
export const createNavigationContainerRef = () => ({
  current: null,
  isReady: () => true,
  resetRoot: jest.fn(),
  getRootState: jest.fn(),
  navigate: jest.fn(),
  dispatch: jest.fn(),
});

// Mock CommonActions
export const CommonActions = {
  navigate: jest.fn((params: any) => ({ type: 'NAVIGATE', payload: params })),
  reset: jest.fn((params: any) => ({ type: 'RESET', payload: params })),
  goBack: jest.fn(() => ({ type: 'GO_BACK' })),
  setParams: jest.fn((params: any) => ({ type: 'SET_PARAMS', payload: params })),
};

// Mock StackActions
export const StackActions = {
  push: jest.fn((name: string, params?: any) => ({ type: 'PUSH', payload: { name, params } })),
  pop: jest.fn((count?: number) => ({ type: 'POP', payload: { count } })),
  popToTop: jest.fn(() => ({ type: 'POP_TO_TOP' })),
  replace: jest.fn((name: string, params?: any) => ({ type: 'REPLACE', payload: { name, params } })),
};

// Export mock navigation for test access
export const __mockNavigation = mockNavigation;
export const __mockRoute = mockRoute;

export default {
  useNavigation,
  useRoute,
  useFocusEffect,
  useIsFocused,
  NavigationContainer,
  createNavigationContainerRef,
  CommonActions,
  StackActions,
};
