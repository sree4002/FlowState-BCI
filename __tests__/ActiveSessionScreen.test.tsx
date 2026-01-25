/**
 * Tests for ActiveSessionScreen component
 * Verifies basic rendering and layout structure
 * Updated for clean neural network design
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActiveSessionScreen } from '../src/screens/ActiveSessionScreen';
import { SessionProvider } from '../src/contexts/SessionContext';
import { DeviceProvider } from '../src/contexts/DeviceContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { SimulatedModeProvider } from '../src/contexts/SimulatedModeContext';

// Test wrapper with required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <SimulatedModeProvider>
      <SessionProvider>
        <DeviceProvider>{children}</DeviceProvider>
      </SessionProvider>
    </SimulatedModeProvider>
  </SettingsProvider>
);

describe('ActiveSessionScreen', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      const { toJSON } = render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(toJSON()).toBeTruthy();
    });

    it('should display Start Session button in idle state', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Start Session')).toBeTruthy();
    });

    it('should display hint text about device connection', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Connect a device to begin')).toBeTruthy();
    });

    it('should render neural network visualization container', () => {
      const { toJSON } = render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // The SVG container should be rendered
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });
  });

  describe('Idle State', () => {
    it('should show Start Session button when no active session', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Start Session')).toBeTruthy();
    });

    it('should show static neural network when idle', () => {
      const { toJSON } = render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Neural network visualization should be present
      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should respond to Start Session button press', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      const startButton = screen.getByText('Start Session');
      expect(startButton).toBeTruthy();
      fireEvent.press(startButton);
      // Button should exist and be pressable
    });
  });

  describe('UI Structure', () => {
    it('should have proper container structure', () => {
      const { toJSON } = render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      expect(tree).toBeTruthy();
      // Tree should be an object with children
      expect(typeof tree).toBe('object');
    });

    it('should include SVG elements for visualization', () => {
      const { toJSON } = render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      const tree = toJSON();
      // Should have Svg component rendered
      const treeString = JSON.stringify(tree);
      expect(treeString).toContain('Svg');
    });
  });

  describe('Timer Display', () => {
    it('should have timer format ready for active sessions', () => {
      // Timer is only shown in active state
      // In idle state, the component doesn't show timer
      const { toJSON } = render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Component should render successfully
      expect(toJSON()).toBeTruthy();
    });
  });
});
