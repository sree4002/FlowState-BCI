/**
 * Tests for ThetaGaugeDisplay component
 * Verifies circular gauge rendering, color-coded zones, and value display
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { ThetaGaugeDisplay } from '../src/components/ThetaGaugeDisplay';
import { Colors } from '../src/constants/theme';

describe('ThetaGaugeDisplay', () => {
  describe('Basic Rendering', () => {
    it('should render the gauge container', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay testID="custom-gauge" />);
      expect(getByTestId('custom-gauge')).toBeTruthy();
    });

    it('should render the title when showLabel is true', () => {
      const { getByText } = render(<ThetaGaugeDisplay showLabel={true} />);
      expect(getByText('Theta Level')).toBeTruthy();
    });

    it('should render custom title', () => {
      const { getByText } = render(
        <ThetaGaugeDisplay showLabel={true} title="Custom Title" />
      );
      expect(getByText('Custom Title')).toBeTruthy();
    });

    it('should not render title when showLabel is false', () => {
      const { queryByText } = render(
        <ThetaGaugeDisplay showLabel={false} title="Hidden Title" />
      );
      expect(queryByText('Hidden Title')).toBeNull();
    });

    it('should render the gauge track', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      expect(getByTestId('theta-gauge-display-track')).toBeTruthy();
    });

    it('should render the needle', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      expect(getByTestId('theta-gauge-display-needle')).toBeTruthy();
    });

    it('should render the center dot', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      expect(getByTestId('theta-gauge-display-center')).toBeTruthy();
    });
  });

  describe('Color-Coded Zones', () => {
    it('should render all four zone segments', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      expect(getByTestId('theta-gauge-display-zone-red')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-zone-yellow')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-zone-green')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-zone-blue')).toBeTruthy();
    });

    it('should render zone labels when showZoneLabels is true', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay showZoneLabels={true} />);
      expect(getByTestId('theta-gauge-display-label-red')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-label-yellow')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-label-green')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-label-blue')).toBeTruthy();
    });

    it('should not render zone labels when showZoneLabels is false', () => {
      const { queryByTestId } = render(<ThetaGaugeDisplay showZoneLabels={false} />);
      expect(queryByTestId('theta-gauge-display-label-red')).toBeNull();
      expect(queryByTestId('theta-gauge-display-label-yellow')).toBeNull();
      expect(queryByTestId('theta-gauge-display-label-green')).toBeNull();
      expect(queryByTestId('theta-gauge-display-label-blue')).toBeNull();
    });

    it('should display zone label text correctly', () => {
      const { getByText } = render(<ThetaGaugeDisplay showZoneLabels={true} />);
      expect(getByText('Low')).toBeTruthy();
      expect(getByText('Near')).toBeTruthy();
      expect(getByText('Good')).toBeTruthy();
      expect(getByText('High')).toBeTruthy();
    });
  });

  describe('Value Display', () => {
    it('should display "--" when value is null', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={null} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('--');
    });

    it('should display "No Data" zone label when value is null', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={null} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'No Data'
      );
    });

    it('should display formatted value with 2 decimal places', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={1.234} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('1.23');
    });

    it('should display "Below Target" for negative values', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={-0.5} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Below Target'
      );
    });

    it('should display "Approaching" for values 0 to 0.5', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0.3} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Approaching'
      );
    });

    it('should display "Optimal" for values 0.5 to 1.5', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={1.0} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Optimal'
      );
    });

    it('should display "High Theta" for values above 1.5', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={1.8} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'High Theta'
      );
    });

    it('should not show value when showValue is false', () => {
      const { queryByTestId } = render(
        <ThetaGaugeDisplay value={1.0} showValue={false} />
      );
      expect(queryByTestId('theta-gauge-display-value')).toBeNull();
      expect(queryByTestId('theta-gauge-display-zone-label')).toBeNull();
    });
  });

  describe('Zone Color Mapping', () => {
    it('should use red color for values below 0', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={-0.5} />);
      const valueElement = getByTestId('theta-gauge-display-value');
      expect(valueElement.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: Colors.status.red })])
      );
    });

    it('should use yellow color for values 0 to 0.5', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0.25} />);
      const valueElement = getByTestId('theta-gauge-display-value');
      expect(valueElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: Colors.status.yellow }),
        ])
      );
    });

    it('should use green color for values 0.5 to 1.5', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={1.0} />);
      const valueElement = getByTestId('theta-gauge-display-value');
      expect(valueElement.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: Colors.status.green })])
      );
    });

    it('should use blue color for values above 1.5', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={2.0} />);
      const valueElement = getByTestId('theta-gauge-display-value');
      expect(valueElement.props.style).toEqual(
        expect.arrayContaining([expect.objectContaining({ color: Colors.status.blue })])
      );
    });

    it('should use tertiary text color for null value', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={null} />);
      const valueElement = getByTestId('theta-gauge-display-value');
      expect(valueElement.props.style).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ color: Colors.text.tertiary }),
        ])
      );
    });
  });

  describe('Boundary Values', () => {
    it('should correctly identify zone at 0 boundary (yellow)', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Approaching'
      );
    });

    it('should correctly identify zone at 0.5 boundary (green)', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0.5} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Optimal'
      );
    });

    it('should correctly identify zone at 1.5 boundary (blue)', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={1.5} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'High Theta'
      );
    });

    it('should correctly identify just below 0 (red)', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={-0.01} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Below Target'
      );
    });

    it('should correctly identify just below 0.5 (yellow)', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0.49} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Approaching'
      );
    });

    it('should correctly identify just below 1.5 (green)', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={1.49} />);
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Optimal'
      );
    });
  });

  describe('Size Configuration', () => {
    it('should accept custom size prop', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay size={300} />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });

    it('should use default size of 200', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      const track = getByTestId('theta-gauge-display-track');
      // Style is passed as an array of objects
      const flatStyle = Array.isArray(track.props.style)
        ? Object.assign({}, ...track.props.style)
        : track.props.style;
      expect(flatStyle.width).toBe(200);
      expect(flatStyle.height).toBe(200);
    });

    it('should scale track with custom size', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay size={300} />);
      const track = getByTestId('theta-gauge-display-track');
      // Style is passed as an array of objects
      const flatStyle = Array.isArray(track.props.style)
        ? Object.assign({}, ...track.props.style)
        : track.props.style;
      expect(flatStyle.width).toBe(300);
      expect(flatStyle.height).toBe(300);
    });
  });

  describe('Min/Max Value Configuration', () => {
    it('should accept custom minValue', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay minValue={-2} value={-1.5} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('-1.50');
    });

    it('should accept custom maxValue', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay maxValue={3} value={2.5} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('2.50');
    });

    it('should use default minValue of -1', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={-1} />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });

    it('should use default maxValue of 2', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={2} />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });
  });

  describe('Animation Configuration', () => {
    it('should accept animated prop', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay animated={true} />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });

    it('should accept animationDuration prop', () => {
      const { getByTestId } = render(
        <ThetaGaugeDisplay animated={true} animationDuration={1000} />
      );
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });

    it('should work with animation disabled', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay animated={false} value={1.0} />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });
  });

  describe('Component Export', () => {
    it('should be exported as named export', () => {
      expect(ThetaGaugeDisplay).toBeDefined();
      expect(typeof ThetaGaugeDisplay).toBe('function');
    });

    it('should have proper displayName or function name', () => {
      expect(
        ThetaGaugeDisplay.name === 'ThetaGaugeDisplay' ||
          ThetaGaugeDisplay.displayName === 'ThetaGaugeDisplay'
      ).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large positive values', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={10} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('10.00');
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'High Theta'
      );
    });

    it('should handle very large negative values', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={-10} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('-10.00');
      expect(getByTestId('theta-gauge-display-zone-label').props.children).toBe(
        'Below Target'
      );
    });

    it('should handle zero value', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('0.00');
    });

    it('should handle value updates', () => {
      const { getByTestId, rerender } = render(<ThetaGaugeDisplay value={0.5} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('0.50');

      rerender(<ThetaGaugeDisplay value={1.5} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('1.50');
    });

    it('should handle transition from null to value', () => {
      const { getByTestId, rerender } = render(<ThetaGaugeDisplay value={null} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('--');

      rerender(<ThetaGaugeDisplay value={1.0} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('1.00');
    });

    it('should handle transition from value to null', () => {
      const { getByTestId, rerender } = render(<ThetaGaugeDisplay value={1.0} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('1.00');

      rerender(<ThetaGaugeDisplay value={null} />);
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('--');
    });
  });

  describe('Accessibility', () => {
    it('should have testID on main container', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay testID="accessible-gauge" />);
      expect(getByTestId('accessible-gauge')).toBeTruthy();
    });

    it('should have testIDs on all important elements', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay testID="gauge" />);
      expect(getByTestId('gauge-track')).toBeTruthy();
      expect(getByTestId('gauge-needle')).toBeTruthy();
      expect(getByTestId('gauge-center')).toBeTruthy();
      expect(getByTestId('gauge-value')).toBeTruthy();
      expect(getByTestId('gauge-zone-label')).toBeTruthy();
    });
  });

  describe('Props Interface', () => {
    it('should accept all optional props', () => {
      const { getByTestId } = render(
        <ThetaGaugeDisplay
          value={1.0}
          minValue={-2}
          maxValue={3}
          size={250}
          showLabel={true}
          title="Custom Gauge"
          animated={true}
          animationDuration={750}
          showZoneLabels={true}
          showValue={true}
          testID="full-props-gauge"
        />
      );
      expect(getByTestId('full-props-gauge')).toBeTruthy();
    });

    it('should work with minimal props', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
    });

    it('should work with only value prop', () => {
      const { getByTestId } = render(<ThetaGaugeDisplay value={0.75} />);
      expect(getByTestId('theta-gauge-display')).toBeTruthy();
      expect(getByTestId('theta-gauge-display-value').props.children).toBe('0.75');
    });
  });
});
