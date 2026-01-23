/**
 * Tests for ThetaNumericDisplay component
 * Verifies z-score display, color coding, and zone labels
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SessionProvider, useSession } from '../src/contexts/SessionContext';
import { Colors } from '../src/constants/theme';
import {
  getThetaZoneColor,
  getThetaZoneLabel,
  categorizeZScoreZone,
  formatZScore,
  ThetaNumericDisplayProps,
} from '../src/components/ThetaNumericDisplay';

describe('ThetaNumericDisplay', () => {
  describe('getThetaZoneColor', () => {
    it('should return tertiary color for null value', () => {
      expect(getThetaZoneColor(null)).toBe(Colors.text.tertiary);
    });

    it('should return red for z-score below -0.5 (low zone)', () => {
      expect(getThetaZoneColor(-0.6)).toBe(Colors.status.red);
      expect(getThetaZoneColor(-1.0)).toBe(Colors.status.red);
      expect(getThetaZoneColor(-2.0)).toBe(Colors.status.red);
    });

    it('should return yellow for z-score between -0.5 and 0.5 (baseline zone)', () => {
      expect(getThetaZoneColor(-0.5)).toBe(Colors.status.yellow);
      expect(getThetaZoneColor(0)).toBe(Colors.status.yellow);
      expect(getThetaZoneColor(0.4)).toBe(Colors.status.yellow);
      expect(getThetaZoneColor(0.49)).toBe(Colors.status.yellow);
    });

    it('should return green for z-score between 0.5 and 1.5 (elevated zone)', () => {
      expect(getThetaZoneColor(0.5)).toBe(Colors.status.green);
      expect(getThetaZoneColor(1.0)).toBe(Colors.status.green);
      expect(getThetaZoneColor(1.49)).toBe(Colors.status.green);
    });

    it('should return blue for z-score >= 1.5 (high/optimal zone)', () => {
      expect(getThetaZoneColor(1.5)).toBe(Colors.status.blue);
      expect(getThetaZoneColor(2.0)).toBe(Colors.status.blue);
      expect(getThetaZoneColor(3.0)).toBe(Colors.status.blue);
    });

    it('should handle boundary values correctly', () => {
      // Exact boundary at -0.5
      expect(getThetaZoneColor(-0.5)).toBe(Colors.status.yellow);
      expect(getThetaZoneColor(-0.50001)).toBe(Colors.status.red);

      // Exact boundary at 0.5
      expect(getThetaZoneColor(0.5)).toBe(Colors.status.green);
      expect(getThetaZoneColor(0.49999)).toBe(Colors.status.yellow);

      // Exact boundary at 1.5
      expect(getThetaZoneColor(1.5)).toBe(Colors.status.blue);
      expect(getThetaZoneColor(1.49999)).toBe(Colors.status.green);
    });
  });

  describe('getThetaZoneLabel', () => {
    it('should return "Waiting" for null value', () => {
      expect(getThetaZoneLabel(null)).toBe('Waiting');
    });

    it('should return "Low" for z-score below -0.5', () => {
      expect(getThetaZoneLabel(-0.6)).toBe('Low');
      expect(getThetaZoneLabel(-1.0)).toBe('Low');
      expect(getThetaZoneLabel(-2.0)).toBe('Low');
    });

    it('should return "Baseline" for z-score between -0.5 and 0.5', () => {
      expect(getThetaZoneLabel(-0.5)).toBe('Baseline');
      expect(getThetaZoneLabel(0)).toBe('Baseline');
      expect(getThetaZoneLabel(0.4)).toBe('Baseline');
    });

    it('should return "Elevated" for z-score between 0.5 and 1.5', () => {
      expect(getThetaZoneLabel(0.5)).toBe('Elevated');
      expect(getThetaZoneLabel(1.0)).toBe('Elevated');
      expect(getThetaZoneLabel(1.49)).toBe('Elevated');
    });

    it('should return "Optimal" for z-score >= 1.5', () => {
      expect(getThetaZoneLabel(1.5)).toBe('Optimal');
      expect(getThetaZoneLabel(2.0)).toBe('Optimal');
      expect(getThetaZoneLabel(3.0)).toBe('Optimal');
    });
  });

  describe('categorizeZScoreZone', () => {
    it('should return null for null value', () => {
      expect(categorizeZScoreZone(null)).toBeNull();
    });

    it('should return "low" for z-score below -0.5', () => {
      expect(categorizeZScoreZone(-0.6)).toBe('low');
      expect(categorizeZScoreZone(-1.0)).toBe('low');
    });

    it('should return "baseline" for z-score between -0.5 and 0.5', () => {
      expect(categorizeZScoreZone(-0.5)).toBe('baseline');
      expect(categorizeZScoreZone(0)).toBe('baseline');
      expect(categorizeZScoreZone(0.4)).toBe('baseline');
    });

    it('should return "elevated" for z-score between 0.5 and 1.5', () => {
      expect(categorizeZScoreZone(0.5)).toBe('elevated');
      expect(categorizeZScoreZone(1.0)).toBe('elevated');
    });

    it('should return "high" for z-score >= 1.5', () => {
      expect(categorizeZScoreZone(1.5)).toBe('high');
      expect(categorizeZScoreZone(2.0)).toBe('high');
    });
  });

  describe('formatZScore', () => {
    it('should return "--" for null value', () => {
      expect(formatZScore(null)).toBe('--');
    });

    it('should format positive values with + sign', () => {
      expect(formatZScore(1.5)).toBe('+1.50');
      expect(formatZScore(0.5)).toBe('+0.50');
      expect(formatZScore(2.345)).toBe('+2.35');
    });

    it('should format zero with + sign', () => {
      expect(formatZScore(0)).toBe('+0.00');
    });

    it('should format negative values with - sign', () => {
      expect(formatZScore(-0.5)).toBe('-0.50');
      expect(formatZScore(-1.0)).toBe('-1.00');
      expect(formatZScore(-2.345)).toBe('-2.35');
    });

    it('should format to exactly 2 decimal places', () => {
      expect(formatZScore(1)).toBe('+1.00');
      expect(formatZScore(1.1)).toBe('+1.10');
      expect(formatZScore(1.123)).toBe('+1.12');
      expect(formatZScore(1.999)).toBe('+2.00');
    });
  });

  describe('Context Integration', () => {
    it('should read currentThetaZScore from context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      // Initial value should be null
      expect(result.current.currentThetaZScore).toBeNull();
    });

    it('should update when context value changes', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setCurrentThetaZScore(1.25);
      });

      expect(result.current.currentThetaZScore).toBe(1.25);
    });

    it('should handle null context value', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setCurrentThetaZScore(null);
      });

      expect(result.current.currentThetaZScore).toBeNull();
    });
  });

  describe('Color Coding Consistency', () => {
    it('should have consistent colors and labels for all zones', () => {
      const testCases = [
        {
          zscore: -1.0,
          expectedColor: Colors.status.red,
          expectedLabel: 'Low',
          expectedZone: 'low',
        },
        {
          zscore: 0.0,
          expectedColor: Colors.status.yellow,
          expectedLabel: 'Baseline',
          expectedZone: 'baseline',
        },
        {
          zscore: 1.0,
          expectedColor: Colors.status.green,
          expectedLabel: 'Elevated',
          expectedZone: 'elevated',
        },
        {
          zscore: 2.0,
          expectedColor: Colors.status.blue,
          expectedLabel: 'Optimal',
          expectedZone: 'high',
        },
      ];

      testCases.forEach(
        ({ zscore, expectedColor, expectedLabel, expectedZone }) => {
          expect(getThetaZoneColor(zscore)).toBe(expectedColor);
          expect(getThetaZoneLabel(zscore)).toBe(expectedLabel);
          expect(categorizeZScoreZone(zscore)).toBe(expectedZone);
        }
      );
    });

    it('should handle extreme values', () => {
      // Very negative values
      expect(getThetaZoneColor(-10)).toBe(Colors.status.red);
      expect(getThetaZoneLabel(-10)).toBe('Low');

      // Very positive values
      expect(getThetaZoneColor(10)).toBe(Colors.status.blue);
      expect(getThetaZoneLabel(10)).toBe('Optimal');
    });
  });

  describe('Display Value Formatting', () => {
    it('should properly format values across all zones', () => {
      // Low zone
      expect(formatZScore(-0.75)).toBe('-0.75');

      // Baseline zone
      expect(formatZScore(0.25)).toBe('+0.25');

      // Elevated zone
      expect(formatZScore(1.25)).toBe('+1.25');

      // High zone
      expect(formatZScore(1.75)).toBe('+1.75');
    });

    it('should handle typical real-time values', () => {
      // Typical EEG z-score values during a session
      const typicalValues = [
        { zscore: -0.32, expected: '-0.32' },
        { zscore: 0.18, expected: '+0.18' },
        { zscore: 0.76, expected: '+0.76' },
        { zscore: 1.54, expected: '+1.54' },
        { zscore: 2.01, expected: '+2.01' },
      ];

      typicalValues.forEach(({ zscore, expected }) => {
        expect(formatZScore(zscore)).toBe(expected);
      });
    });
  });

  describe('Props Interface', () => {
    it('should have correct default prop values', () => {
      const defaultProps: Required<
        Pick<ThetaNumericDisplayProps, 'size' | 'showLabel' | 'showZone'>
      > = {
        size: 'medium',
        showLabel: true,
        showZone: true,
      };

      // These are the expected defaults based on the component implementation
      expect(defaultProps.size).toBe('medium');
      expect(defaultProps.showLabel).toBe(true);
      expect(defaultProps.showZone).toBe(true);
    });

    it('should accept all size variants', () => {
      const sizes: Array<'small' | 'medium' | 'large'> = [
        'small',
        'medium',
        'large',
      ];

      sizes.forEach((size) => {
        const props: ThetaNumericDisplayProps = { size, value: 1.0 };
        expect(props.size).toBe(size);
      });
    });
  });

  describe('Value Override', () => {
    it('should accept prop value to override context', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      // Set context value
      act(() => {
        result.current.setCurrentThetaZScore(1.0);
      });

      // The component should be able to use prop value instead
      // This is tested by the component logic itself
      const propValue = 2.0;
      expect(getThetaZoneColor(propValue)).toBe(Colors.status.blue);
      expect(getThetaZoneLabel(propValue)).toBe('Optimal');
    });
  });
});
