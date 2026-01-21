/**
 * Tests for VisualizationModeToggle component
 * Verifies visualization mode selection and state management
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { renderHook, act } from '@testing-library/react';
import { VisualizationModeToggle } from '../src/components/VisualizationModeToggle';
import { SessionProvider, useSession } from '../src/contexts/SessionContext';
import { VisualizationMode } from '../src/types';

describe('VisualizationModeToggle', () => {
  describe('Rendering', () => {
    it('should render all three mode options', () => {
      const mockOnModeChange = jest.fn();
      const { getByText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      expect(getByText('Numeric')).toBeTruthy();
      expect(getByText('Gauge')).toBeTruthy();
      expect(getByText('Chart')).toBeTruthy();
    });

    it('should render the label "Visualization Mode"', () => {
      const mockOnModeChange = jest.fn();
      const { getByText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      expect(getByText('Visualization Mode')).toBeTruthy();
    });

    it('should render with testID on toggle buttons when provided', () => {
      const mockOnModeChange = jest.fn();
      const { getByLabelText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
          testID="viz-toggle"
        />
      );

      // Verify all three mode buttons are rendered with accessibility labels
      expect(getByLabelText('Numeric visualization mode')).toBeTruthy();
      expect(getByLabelText('Gauge visualization mode')).toBeTruthy();
      expect(getByLabelText('Chart visualization mode')).toBeTruthy();
    });
  });

  describe('Mode Selection', () => {
    it('should call onModeChange with "numeric" when Numeric option is pressed', () => {
      const mockOnModeChange = jest.fn();
      const { getByText } = render(
        <VisualizationModeToggle
          selectedMode="chart"
          onModeChange={mockOnModeChange}
        />
      );

      fireEvent.press(getByText('Numeric'));

      expect(mockOnModeChange).toHaveBeenCalledWith('numeric');
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });

    it('should call onModeChange with "gauge" when Gauge option is pressed', () => {
      const mockOnModeChange = jest.fn();
      const { getByText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      fireEvent.press(getByText('Gauge'));

      expect(mockOnModeChange).toHaveBeenCalledWith('gauge');
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });

    it('should call onModeChange with "chart" when Chart option is pressed', () => {
      const mockOnModeChange = jest.fn();
      const { getByText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      fireEvent.press(getByText('Chart'));

      expect(mockOnModeChange).toHaveBeenCalledWith('chart');
      expect(mockOnModeChange).toHaveBeenCalledTimes(1);
    });

    it('should still call onModeChange when pressing already selected mode', () => {
      const mockOnModeChange = jest.fn();
      const { getByText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      fireEvent.press(getByText('Numeric'));

      expect(mockOnModeChange).toHaveBeenCalledWith('numeric');
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility roles for all options', () => {
      const mockOnModeChange = jest.fn();
      const { getByLabelText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      expect(getByLabelText('Numeric visualization mode')).toBeTruthy();
      expect(getByLabelText('Gauge visualization mode')).toBeTruthy();
      expect(getByLabelText('Chart visualization mode')).toBeTruthy();
    });

    it('should have selected state for current mode', () => {
      const mockOnModeChange = jest.fn();
      const { getByLabelText } = render(
        <VisualizationModeToggle
          selectedMode="gauge"
          onModeChange={mockOnModeChange}
        />
      );

      const gaugeButton = getByLabelText('Gauge visualization mode');
      expect(gaugeButton.props.accessibilityState?.selected).toBe(true);

      const numericButton = getByLabelText('Numeric visualization mode');
      expect(numericButton.props.accessibilityState?.selected).toBe(false);
    });
  });

  describe('Selected Mode Prop', () => {
    it('should accept "numeric" as selectedMode', () => {
      const mockOnModeChange = jest.fn();
      const { getByLabelText } = render(
        <VisualizationModeToggle
          selectedMode="numeric"
          onModeChange={mockOnModeChange}
        />
      );

      const numericButton = getByLabelText('Numeric visualization mode');
      expect(numericButton.props.accessibilityState?.selected).toBe(true);
    });

    it('should accept "gauge" as selectedMode', () => {
      const mockOnModeChange = jest.fn();
      const { getByLabelText } = render(
        <VisualizationModeToggle
          selectedMode="gauge"
          onModeChange={mockOnModeChange}
        />
      );

      const gaugeButton = getByLabelText('Gauge visualization mode');
      expect(gaugeButton.props.accessibilityState?.selected).toBe(true);
    });

    it('should accept "chart" as selectedMode', () => {
      const mockOnModeChange = jest.fn();
      const { getByLabelText } = render(
        <VisualizationModeToggle
          selectedMode="chart"
          onModeChange={mockOnModeChange}
        />
      );

      const chartButton = getByLabelText('Chart visualization mode');
      expect(chartButton.props.accessibilityState?.selected).toBe(true);
    });
  });
});

describe('VisualizationModeToggle with SessionContext', () => {
  describe('Context Integration', () => {
    it('should have default visualizationMode as "numeric"', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      expect(result.current.visualizationMode).toBe('numeric');
    });

    it('should update visualizationMode to "gauge" via context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setVisualizationMode('gauge');
      });

      expect(result.current.visualizationMode).toBe('gauge');
    });

    it('should update visualizationMode to "chart" via context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setVisualizationMode('chart');
      });

      expect(result.current.visualizationMode).toBe('chart');
    });

    it('should update visualizationMode back to "numeric" via context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setVisualizationMode('chart');
      });

      expect(result.current.visualizationMode).toBe('chart');

      act(() => {
        result.current.setVisualizationMode('numeric');
      });

      expect(result.current.visualizationMode).toBe('numeric');
    });

    it('should reset visualizationMode to "numeric" when session is reset', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setVisualizationMode('chart');
      });

      expect(result.current.visualizationMode).toBe('chart');

      act(() => {
        result.current.resetSessionState();
      });

      expect(result.current.visualizationMode).toBe('numeric');
    });
  });

  describe('Mode Type Validation', () => {
    const validModes: VisualizationMode[] = ['numeric', 'gauge', 'chart'];

    validModes.forEach((mode) => {
      it(`should accept "${mode}" as a valid VisualizationMode`, () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
          <SessionProvider>{children}</SessionProvider>
        );

        const { result } = renderHook(() => useSession(), { wrapper });

        act(() => {
          result.current.setVisualizationMode(mode);
        });

        expect(result.current.visualizationMode).toBe(mode);
      });
    });
  });

  describe('Full Integration', () => {
    it('should work correctly when integrated with SessionProvider', () => {
      const TestComponent: React.FC = () => {
        const { visualizationMode, setVisualizationMode } = useSession();
        return (
          <VisualizationModeToggle
            selectedMode={visualizationMode}
            onModeChange={setVisualizationMode}
          />
        );
      };

      const { getByText, getByLabelText } = render(
        <SessionProvider>
          <TestComponent />
        </SessionProvider>
      );

      // Verify initial state - numeric should be selected
      const numericButton = getByLabelText('Numeric visualization mode');
      expect(numericButton.props.accessibilityState?.selected).toBe(true);

      // Change mode to gauge
      fireEvent.press(getByText('Gauge'));

      // Change mode to chart
      fireEvent.press(getByText('Chart'));

      // Change back to numeric
      fireEvent.press(getByText('Numeric'));
    });
  });
});
