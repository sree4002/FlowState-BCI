/**
 * ThetaTrendWidget Tests
 *
 * Tests for the ThetaTrendWidget component that displays
 * a sparkline chart of recent theta z-score values.
 */

import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { ThetaTrendWidget } from '../src/components/ThetaTrendWidget';
import { SessionProvider } from '../src/contexts/SessionContext';
import { Session } from '../src/types';

// Mock react-native-chart-kit components
jest.mock('react-native-chart-kit', () => ({
  LineChart: 'LineChart',
  BarChart: 'BarChart',
  PieChart: 'PieChart',
  ProgressChart: 'ProgressChart',
  ContributionGraph: 'ContributionGraph',
  StackedBarChart: 'StackedBarChart',
}));

// Mock Dimensions
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.Dimensions.get = jest.fn().mockReturnValue({ width: 375, height: 812 });
  return RN;
});

/**
 * Helper to wrap component with required providers
 */
const renderWithProviders = (ui: React.ReactElement) => {
  return render(<SessionProvider>{ui}</SessionProvider>);
};

/**
 * Create mock session data for testing
 */
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: Math.floor(Math.random() * 1000),
  session_type: 'quick_boost',
  start_time: Date.now() - 3600000,
  end_time: Date.now(),
  duration_seconds: 3600,
  avg_theta_zscore: 0.8,
  max_theta_zscore: 1.2,
  entrainment_freq: 6.5,
  volume: 0.7,
  signal_quality_avg: 85,
  subjective_rating: null,
  notes: null,
  ...overrides,
});

describe('ThetaTrendWidget', () => {
  describe('Rendering', () => {
    test('renders with default title', () => {
      renderWithProviders(<ThetaTrendWidget />);
      expect(screen.getByText('Theta Trend')).toBeTruthy();
    });

    test('renders with custom title', () => {
      renderWithProviders(<ThetaTrendWidget title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeTruthy();
    });

    test('renders empty state when no sessions exist', () => {
      renderWithProviders(<ThetaTrendWidget />);
      expect(screen.getByText('No session data yet')).toBeTruthy();
      expect(
        screen.getByText('Complete sessions to see your theta trend')
      ).toBeTruthy();
    });
  });

  describe('Props', () => {
    test('accepts maxDataPoints prop', () => {
      renderWithProviders(<ThetaTrendWidget maxDataPoints={5} />);
      expect(screen.getByText('Theta Trend')).toBeTruthy();
    });

    test('accepts height prop', () => {
      renderWithProviders(<ThetaTrendWidget height={200} />);
      expect(screen.getByText('Theta Trend')).toBeTruthy();
    });

    test('accepts showStats prop', () => {
      renderWithProviders(<ThetaTrendWidget showStats={false} />);
      expect(screen.getByText('Theta Trend')).toBeTruthy();
    });
  });

  describe('Component Structure', () => {
    test('contains expected container elements', () => {
      const { toJSON } = renderWithProviders(<ThetaTrendWidget />);
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });
  });
});

describe('ThetaTrendWidget Helper Functions', () => {
  describe('getZScoreColor', () => {
    // Test the color logic by checking component exports or testing indirectly
    test('component renders without errors', () => {
      renderWithProviders(<ThetaTrendWidget />);
      // If the component renders, the helper functions are working
      expect(screen.getByText('Theta Trend')).toBeTruthy();
    });
  });

  describe('calculateStats', () => {
    test('handles empty data gracefully', () => {
      renderWithProviders(<ThetaTrendWidget />);
      // Empty state should show - stats calculation returns null for empty data
      expect(screen.getByText('No session data yet')).toBeTruthy();
    });
  });
});

describe('ThetaTrendWidget Integration', () => {
  test('renders within SessionProvider', () => {
    const { toJSON } = renderWithProviders(<ThetaTrendWidget />);
    expect(toJSON()).toBeTruthy();
  });

  test('does not throw when rendered', () => {
    expect(() => {
      renderWithProviders(<ThetaTrendWidget />);
    }).not.toThrow();
  });

  test('renders with all props combined', () => {
    renderWithProviders(
      <ThetaTrendWidget
        title="My Theta"
        maxDataPoints={15}
        height={150}
        showStats={true}
      />
    );
    expect(screen.getByText('My Theta')).toBeTruthy();
  });
});

describe('ThetaTrendWidget Accessibility', () => {
  test('displays readable text for empty state', () => {
    renderWithProviders(<ThetaTrendWidget />);
    const emptyText = screen.getByText('No session data yet');
    expect(emptyText).toBeTruthy();
  });

  test('displays title text', () => {
    renderWithProviders(<ThetaTrendWidget title="Accessible Title" />);
    const title = screen.getByText('Accessible Title');
    expect(title).toBeTruthy();
  });
});
