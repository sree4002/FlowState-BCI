/**
 * DashboardScreen Component Tests
 *
 * Tests for the WHOOP-style DashboardScreen including:
 * - Hero card with main stat
 * - Stats row (sessions, time, theta avg)
 * - Quick action buttons
 * - Trend widget
 * - Device status indicator
 * - SafeArea handling
 */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import DashboardScreen from '../src/screens/DashboardScreen';
import { DeviceProvider } from '../src/contexts/DeviceContext';
import { SessionProvider } from '../src/contexts/SessionContext';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { SimulatedModeProvider } from '../src/contexts/SimulatedModeContext';

// Mock navigation
const mockNavigate = jest.fn();

// Wrapper component to provide all required contexts
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SettingsProvider>
    <SimulatedModeProvider>
      <DeviceProvider>
        <SessionProvider>{children}</SessionProvider>
      </DeviceProvider>
    </SimulatedModeProvider>
  </SettingsProvider>
);

describe('DashboardScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders without crashing', () => {
      const { toJSON } = render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(toJSON()).not.toBeNull();
    });

    it('renders a greeting based on time of day', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // Should have one of the greetings
      const hasGreeting =
        screen.queryByText(/Good morning/i) ||
        screen.queryByText(/Good afternoon/i) ||
        screen.queryByText(/Good evening/i);
      expect(hasGreeting).toBeTruthy();
    });
  });

  describe('Hero Card', () => {
    it('renders hero card with label', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // Hero card shows "No Sessions" label when no data
      expect(screen.getByText('No Sessions')).toBeTruthy();
    });

    it('shows sublabel with hint when no sessions', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(
        screen.getByText('Start a session to see your stats')
      ).toBeTruthy();
    });
  });

  describe('Stats Row', () => {
    it('renders sessions count', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Sessions')).toBeTruthy();
    });

    it('renders minutes count', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Minutes')).toBeTruthy();
    });

    it('renders avg theta label', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Avg Theta')).toBeTruthy();
    });

    it('shows zero sessions when no data', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // Should show 0 for sessions and minutes
      const zeros = screen.getAllByText('0');
      expect(zeros.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Quick Actions', () => {
    it('renders Quick Actions section title', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Quick Actions')).toBeTruthy();
    });

    it('renders Quick Boost button', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByTestId('quick-boost-button')).toBeTruthy();
      expect(screen.getByText('Quick Boost')).toBeTruthy();
    });

    it('renders Quick Boost subtitle', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('5 min theta session')).toBeTruthy();
    });

    it('renders Calibrate button', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByTestId('calibrate-button')).toBeTruthy();
      expect(screen.getByText('Calibrate')).toBeTruthy();
    });

    it('renders Custom session button', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByTestId('custom-session-button')).toBeTruthy();
      expect(screen.getByText('Custom')).toBeTruthy();
    });

    it('navigates to Session on Quick Boost press', () => {
      render(
        <TestWrapper>
          <DashboardScreen navigation={{ navigate: mockNavigate }} />
        </TestWrapper>
      );
      fireEvent.press(screen.getByTestId('quick-boost-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Session');
    });

    it('navigates to Calibration on Calibrate press', () => {
      render(
        <TestWrapper>
          <DashboardScreen navigation={{ navigate: mockNavigate }} />
        </TestWrapper>
      );
      fireEvent.press(screen.getByTestId('calibrate-button'));
      expect(mockNavigate).toHaveBeenCalledWith('Calibration');
    });
  });

  describe('Device Status', () => {
    it('renders device status indicator', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // Should show "No Device" or "Not Connected" when no device connected
      const hasDeviceStatus =
        screen.queryByText('No Device') || screen.queryByText('Not Connected');
      expect(hasDeviceStatus).toBeTruthy();
    });
  });

  describe('Trend Widget', () => {
    it('renders Recent Trend section', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Recent Trend')).toBeTruthy();
    });
  });

  describe('Module Export', () => {
    it('exports DashboardScreen as default', () => {
      expect(DashboardScreen).toBeDefined();
      expect(typeof DashboardScreen).toBe('function');
    });

    it('exports from screens index', () => {
      const { DashboardScreen: ExportedScreen } = require('../src/screens');
      expect(ExportedScreen).toBeDefined();
    });
  });
});
