/**
 * Tests for ActiveSessionScreen component
 * Verifies basic rendering and layout structure
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ActiveSessionScreen } from '../src/screens/ActiveSessionScreen';
import { SessionProvider } from '../src/contexts/SessionContext';
import { DeviceProvider } from '../src/contexts/DeviceContext';

// Test wrapper with required providers
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SessionProvider>
    <DeviceProvider>{children}</DeviceProvider>
  </SessionProvider>
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
      expect(screen.getByText('Session Time')).toBeTruthy();
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

    it('should display session info section', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Session Info')).toBeTruthy();
    });

    it('should display connection status as disconnected initially', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Disconnected')).toBeTruthy();
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

    it('should display theta target hint', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Target: 1.5+ for optimal focus state')).toBeTruthy();
    });

    it('should display placeholder theta value when no data', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('--')).toBeTruthy();
    });

    it('should display waiting state for theta zone', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Waiting...')).toBeTruthy();
    });

    it('should display idle session state', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('idle')).toBeTruthy();
    });

    it('should display numeric visualization mode as default', () => {
      render(
        <TestWrapper>
          <ActiveSessionScreen />
        </TestWrapper>
      );
      expect(screen.getByText('numeric')).toBeTruthy();
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
