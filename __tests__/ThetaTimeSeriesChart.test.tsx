/**
 * ThetaTimeSeriesChart Tests
 *
 * Tests for the ThetaTimeSeriesChart component that displays
 * a real-time scrolling line chart of theta z-score values.
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import {
  ThetaTimeSeriesChart,
  TimeSeriesDataPoint,
  TimeWindowMinutes,
} from '../src/components/ThetaTimeSeriesChart';
import { SessionProvider } from '../src/contexts/SessionContext';

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

describe('ThetaTimeSeriesChart', () => {
  describe('Rendering', () => {
    test('renders with default title', () => {
      renderWithProviders(<ThetaTimeSeriesChart />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    test('renders with custom title', () => {
      renderWithProviders(<ThetaTimeSeriesChart title="Custom Title" />);
      expect(screen.getByText('Custom Title')).toBeTruthy();
    });

    test('renders empty state when no active session', () => {
      renderWithProviders(<ThetaTimeSeriesChart />);
      expect(screen.getByText('No active session')).toBeTruthy();
      expect(
        screen.getByText('Start a session to see real-time theta data')
      ).toBeTruthy();
    });
  });

  describe('Props', () => {
    test('accepts height prop', () => {
      renderWithProviders(<ThetaTimeSeriesChart height={300} />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    test('accepts timeWindowMinutes prop', () => {
      renderWithProviders(<ThetaTimeSeriesChart timeWindowMinutes={5} />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    test('accepts showTimeSelector prop', () => {
      renderWithProviders(<ThetaTimeSeriesChart showTimeSelector={false} />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
      // Time selector label should not be present
      expect(screen.queryByText('Time Window:')).toBeNull();
    });

    test('accepts showCurrentValue prop', () => {
      renderWithProviders(<ThetaTimeSeriesChart showCurrentValue={false} />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    test('accepts showZoneLines prop', () => {
      renderWithProviders(<ThetaTimeSeriesChart showZoneLines={false} />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });

    test('accepts updateInterval prop', () => {
      renderWithProviders(<ThetaTimeSeriesChart updateInterval={1000} />);
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
    });
  });

  describe('Time Selector', () => {
    // Note: Time selector is only rendered when session is active (not in empty state)
    test('does not render time selector in empty state', () => {
      renderWithProviders(<ThetaTimeSeriesChart showTimeSelector={true} />);
      // Empty state doesn't show the time selector
      expect(screen.queryByText('Time Window:')).toBeNull();
    });

    test('accepts showTimeSelector prop without error', () => {
      expect(() => {
        renderWithProviders(<ThetaTimeSeriesChart showTimeSelector={true} />);
      }).not.toThrow();
    });
  });

  describe('Component Structure', () => {
    test('contains expected container elements', () => {
      const { toJSON } = renderWithProviders(<ThetaTimeSeriesChart />);
      const tree = toJSON();
      expect(tree).toBeTruthy();
    });

    test('renders without crashing with all props', () => {
      const { toJSON } = renderWithProviders(
        <ThetaTimeSeriesChart
          height={250}
          timeWindowMinutes={3}
          showTimeSelector={true}
          showCurrentValue={true}
          showZoneLines={true}
          title="Real-Time Theta"
          updateInterval={500}
          onTimeWindowChange={() => {}}
        />
      );
      expect(toJSON()).toBeTruthy();
    });
  });
});

describe('ThetaTimeSeriesChart Type Exports', () => {
  test('TimeSeriesDataPoint type is exported correctly', () => {
    const dataPoint: TimeSeriesDataPoint = {
      x: 60,
      y: 0.75,
    };
    expect(dataPoint.x).toBe(60);
    expect(dataPoint.y).toBe(0.75);
  });

  test('TimeWindowMinutes type accepts valid values', () => {
    const oneMin: TimeWindowMinutes = 1;
    const twoMin: TimeWindowMinutes = 2;
    const threeMin: TimeWindowMinutes = 3;
    const fiveMin: TimeWindowMinutes = 5;

    expect(oneMin).toBe(1);
    expect(twoMin).toBe(2);
    expect(threeMin).toBe(3);
    expect(fiveMin).toBe(5);
  });
});

describe('ThetaTimeSeriesChart Integration', () => {
  test('renders within SessionProvider', () => {
    const { toJSON } = renderWithProviders(<ThetaTimeSeriesChart />);
    expect(toJSON()).toBeTruthy();
  });

  test('does not throw when rendered', () => {
    expect(() => {
      renderWithProviders(<ThetaTimeSeriesChart />);
    }).not.toThrow();
  });

  test('renders with all props combined', () => {
    renderWithProviders(
      <ThetaTimeSeriesChart
        title="My Theta Chart"
        height={300}
        timeWindowMinutes={2}
        showTimeSelector={true}
        showCurrentValue={true}
        showZoneLines={true}
      />
    );
    expect(screen.getByText('My Theta Chart')).toBeTruthy();
  });
});

describe('ThetaTimeSeriesChart Accessibility', () => {
  test('displays readable text for empty state', () => {
    renderWithProviders(<ThetaTimeSeriesChart />);
    const emptyText = screen.getByText('No active session');
    expect(emptyText).toBeTruthy();
  });

  test('displays title text', () => {
    renderWithProviders(<ThetaTimeSeriesChart title="Accessible Title" />);
    const title = screen.getByText('Accessible Title');
    expect(title).toBeTruthy();
  });

  test('displays subtext in empty state', () => {
    renderWithProviders(<ThetaTimeSeriesChart />);
    const subtext = screen.getByText(
      'Start a session to see real-time theta data'
    );
    expect(subtext).toBeTruthy();
  });
});

describe('ThetaTimeSeriesChart Default Values', () => {
  test('renders with default props', () => {
    const { toJSON } = renderWithProviders(<ThetaTimeSeriesChart />);
    expect(toJSON()).toBeTruthy();
  });

  test('defaults to Theta Z-Score title', () => {
    renderWithProviders(<ThetaTimeSeriesChart />);
    expect(screen.getByText('Theta Z-Score')).toBeTruthy();
  });

  test('shows empty state when no session', () => {
    renderWithProviders(<ThetaTimeSeriesChart />);
    expect(screen.getByText('No active session')).toBeTruthy();
  });
});
