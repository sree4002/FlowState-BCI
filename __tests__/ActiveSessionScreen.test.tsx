/**
 * Tests for ActiveSessionScreen component
 * Verifies basic rendering and layout structure
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
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

    it('should display session timer section', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Timer shows 00:00 format
      expect(screen.getByText('00:00')).toBeTruthy();
    });

    it('should display initial timer value as 00:00', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('00:00')).toBeTruthy();
    });

    it('should display theta z-score section', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    it('should display signal quality section', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Signal Quality')).toBeTruthy();
    });

    it('should display session status info', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Info card shows status, mode, and signal quality
      expect(screen.getByText('Status')).toBeTruthy();
      expect(screen.getByText('Mode')).toBeTruthy();
    });

    it('should display connection status as disconnected initially', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // When simulated mode is disabled, shows 'OFF' in compact status pill
      expect(screen.getByText('OFF')).toBeTruthy();
    });

    it('should display control buttons', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Start')).toBeTruthy();
      expect(screen.getByText('Stop')).toBeTruthy();
    });

    it('should display chart empty state when no session', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Chart mode is now the default, shows empty state when no session
      // Use getAllByText since text appears multiple times
      expect(screen.getAllByText('No active session').length).toBeGreaterThan(0);
    });

    it('should display chart empty state hint', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(
        screen.getByText('Start a session to see real-time theta data')
      ).toBeTruthy();
    });

    it('should display theta z-score title in chart', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    it('should display idle session state', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Session state is 'idle' (textTransform: capitalize is applied via CSS in actual render)
      expect(screen.getByText('idle')).toBeTruthy();
    });

    it('should display chart visualization mode as default', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      // Chart is now the default visualization mode
      // The toggle shows all modes, and Chart should be selected
      expect(screen.getByText('Chart')).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible start button', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByLabelText('Start session')).toBeTruthy();
    });

    it('should have accessible stop button', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByLabelText('Stop session')).toBeTruthy();
    });
  });
});
