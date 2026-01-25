/**
 * DashboardScreen Component Tests
 *
 * Tests for the WHOOP-style DashboardScreen including:
 * - Focus Score card with breakdown
 * - AI Insight card
 * - Streak tracking card
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
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

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

    it('renders User name', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('User')).toBeTruthy();
    });
  });

  describe('Focus Score Card', () => {
    it('renders Focus Score label', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Focus Score')).toBeTruthy();
    });

    it('renders Focus Score breakdown items', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Quality')).toBeTruthy();
      expect(screen.getByText('Consistency')).toBeTruthy();
      expect(screen.getByText('Focus Time')).toBeTruthy();
    });
  });

  describe('AI Insight Card', () => {
    it('renders Insight title', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('Insight')).toBeTruthy();
    });

    it('renders insight text', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(
        screen.getByText(/morning sessions show.*better theta response/i)
      ).toBeTruthy();
    });
  });

  describe('Streak Card', () => {
    it('renders day streak label', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      expect(screen.getByText('day streak')).toBeTruthy();
    });

    it('renders sessions this week', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // Multiple elements may contain "sessions" so use getAllByText
      expect(screen.getAllByText(/sessions/i).length).toBeGreaterThan(0);
      expect(screen.getByText('this week')).toBeTruthy();
    });

    it('renders week days', () => {
      render(
        <TestWrapper>
          <DashboardScreen />
        </TestWrapper>
      );
      // Week days show as single letters
      expect(screen.getAllByText('S').length).toBeGreaterThanOrEqual(1); // Sunday or Saturday
      expect(screen.getAllByText('M').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('T').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('W').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('F').length).toBeGreaterThanOrEqual(1);
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
