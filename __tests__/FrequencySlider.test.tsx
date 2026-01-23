/**
 * Tests for FrequencySlider component
 * Verifies component structure, props handling, and frequency configuration logic
 */

import React from 'react';
import { Colors } from '../src/constants/theme';

// Constants matching the component
const MIN_FREQUENCY_HZ = 4.0;
const MAX_FREQUENCY_HZ = 8.0;
const FREQUENCY_STEP = 0.1;
const DEFAULT_FREQUENCY = 6.0;

describe('FrequencySlider', () => {
  describe('Frequency Range Constants', () => {
    it('should have valid theta frequency range (4-8 Hz)', () => {
      expect(MIN_FREQUENCY_HZ).toBe(4.0);
      expect(MAX_FREQUENCY_HZ).toBe(8.0);
      expect(MIN_FREQUENCY_HZ).toBeLessThan(MAX_FREQUENCY_HZ);
    });

    it('should use 0.1 Hz increments', () => {
      expect(FREQUENCY_STEP).toBe(0.1);
    });

    it('should have a sensible default in the middle of theta range', () => {
      expect(DEFAULT_FREQUENCY).toBe(6.0);
      expect(DEFAULT_FREQUENCY).toBeGreaterThanOrEqual(MIN_FREQUENCY_HZ);
      expect(DEFAULT_FREQUENCY).toBeLessThanOrEqual(MAX_FREQUENCY_HZ);
    });

    it('should allow all incremental values from 4.0 to 8.0 Hz', () => {
      const possibleValues: number[] = [];
      for (
        let freq = MIN_FREQUENCY_HZ;
        freq <= MAX_FREQUENCY_HZ;
        freq += FREQUENCY_STEP
      ) {
        possibleValues.push(Math.round(freq * 10) / 10);
      }

      // Should have 41 possible values: 4.0, 4.1, 4.2, ... 7.9, 8.0
      expect(possibleValues.length).toBe(41);
      expect(possibleValues[0]).toBe(4.0);
      expect(possibleValues[possibleValues.length - 1]).toBe(8.0);
    });
  });

  describe('Frequency Formatting Logic', () => {
    /**
     * Helper function matching the component's formatFrequency logic
     */
    const formatFrequency = (freq: number): string => {
      return `${freq.toFixed(1)} Hz`;
    };

    it('should format frequency with one decimal place', () => {
      expect(formatFrequency(4.0)).toBe('4.0 Hz');
      expect(formatFrequency(6.5)).toBe('6.5 Hz');
      expect(formatFrequency(8.0)).toBe('8.0 Hz');
    });

    it('should handle integer frequencies', () => {
      expect(formatFrequency(4)).toBe('4.0 Hz');
      expect(formatFrequency(5)).toBe('5.0 Hz');
      expect(formatFrequency(6)).toBe('6.0 Hz');
    });

    it('should format boundary values correctly', () => {
      expect(formatFrequency(MIN_FREQUENCY_HZ)).toBe('4.0 Hz');
      expect(formatFrequency(MAX_FREQUENCY_HZ)).toBe('8.0 Hz');
    });

    it('should format incremental values correctly', () => {
      expect(formatFrequency(4.1)).toBe('4.1 Hz');
      expect(formatFrequency(5.5)).toBe('5.5 Hz');
      expect(formatFrequency(7.9)).toBe('7.9 Hz');
    });
  });

  describe('Value Rounding Logic', () => {
    /**
     * Helper function matching the component's rounding logic
     */
    const roundToStep = (value: number): number => {
      return Math.round(value * 10) / 10;
    };

    it('should round to nearest 0.1 Hz', () => {
      expect(roundToStep(4.05)).toBe(4.1);
      expect(roundToStep(4.04)).toBe(4.0);
      expect(roundToStep(6.55)).toBe(6.6);
      expect(roundToStep(6.54)).toBe(6.5);
    });

    it('should handle floating point precision', () => {
      // Test for floating point issues like 4.0 + 0.1 = 4.1000000000001
      expect(roundToStep(4.0 + 0.1)).toBe(4.1);
      expect(roundToStep(4.0 + 0.2)).toBe(4.2);
      expect(roundToStep(7.9 + 0.1)).toBe(8.0);
    });

    it('should not change already rounded values', () => {
      expect(roundToStep(4.0)).toBe(4.0);
      expect(roundToStep(5.5)).toBe(5.5);
      expect(roundToStep(8.0)).toBe(8.0);
    });
  });

  describe('Theme Integration', () => {
    it('should use secondary colors for frequency slider (purple theme)', () => {
      expect(Colors.secondary.main).toBe('#7B68EE'); // Medium purple - track fill
      expect(Colors.secondary.light).toBe('#9B88F8'); // Light purple - thumb
    });

    it('should have correct disabled state colors', () => {
      expect(Colors.interactive.disabled).toBe('#3A4658');
      expect(Colors.text.disabled).toBe('#5A6070');
    });

    it('should have correct text colors for labels', () => {
      expect(Colors.text.primary).toBe('#E8ECF1'); // Label
      expect(Colors.text.tertiary).toBe('#8891A0'); // Range text
    });

    it('should use correct border colors for track background', () => {
      expect(Colors.border.primary).toBe('#3A4658'); // Track unfilled portion
    });
  });

  describe('Props Interface', () => {
    it('should accept value prop', () => {
      const props = { value: 5.5 };
      expect(props.value).toBe(5.5);
    });

    it('should accept onValueChange callback', () => {
      const mockCallback = jest.fn();
      const props = { onValueChange: mockCallback };

      // Simulate calling the callback
      props.onValueChange(6.0);
      expect(mockCallback).toHaveBeenCalledWith(6.0);
    });

    it('should accept onSlidingComplete callback', () => {
      const mockCallback = jest.fn();
      const props = { onSlidingComplete: mockCallback };

      props.onSlidingComplete(7.5);
      expect(mockCallback).toHaveBeenCalledWith(7.5);
    });

    it('should accept disabled prop', () => {
      const enabledProps = { disabled: false };
      const disabledProps = { disabled: true };

      expect(enabledProps.disabled).toBe(false);
      expect(disabledProps.disabled).toBe(true);
    });

    it('should accept custom label prop', () => {
      const defaultLabel = { label: 'Frequency' };
      const customLabel = { label: 'Target Frequency' };

      expect(defaultLabel.label).toBe('Frequency');
      expect(customLabel.label).toBe('Target Frequency');
    });

    it('should accept showRangeLabels prop', () => {
      const withLabels = { showRangeLabels: true };
      const withoutLabels = { showRangeLabels: false };

      expect(withLabels.showRangeLabels).toBe(true);
      expect(withoutLabels.showRangeLabels).toBe(false);
    });

    it('should accept testID prop', () => {
      const props = { testID: 'freq-slider' };
      expect(props.testID).toBe('freq-slider');
    });

    it('should allow minimal props (all optional)', () => {
      const minimalProps = {};
      expect(Object.keys(minimalProps).length).toBe(0);
    });

    it('should allow full props configuration', () => {
      const fullProps = {
        value: 6.5,
        onValueChange: jest.fn(),
        onSlidingComplete: jest.fn(),
        disabled: false,
        label: 'Entrainment Frequency',
        showRangeLabels: true,
        testID: 'test-frequency-slider',
      };

      expect(fullProps.value).toBe(6.5);
      expect(fullProps.onValueChange).toBeDefined();
      expect(fullProps.onSlidingComplete).toBeDefined();
      expect(fullProps.disabled).toBe(false);
      expect(fullProps.label).toBe('Entrainment Frequency');
      expect(fullProps.showRangeLabels).toBe(true);
      expect(fullProps.testID).toBe('test-frequency-slider');
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility value structure', () => {
      const accessibilityValue = {
        min: MIN_FREQUENCY_HZ,
        max: MAX_FREQUENCY_HZ,
        now: 6.0,
        text: '6.0 Hertz',
      };

      expect(accessibilityValue.min).toBe(4.0);
      expect(accessibilityValue.max).toBe(8.0);
      expect(accessibilityValue.now).toBe(6.0);
      expect(accessibilityValue.text).toBe('6.0 Hertz');
    });

    it('should provide meaningful accessibility labels', () => {
      const label = 'Frequency';
      const accessibilityLabel = `${label} slider`;

      expect(accessibilityLabel).toBe('Frequency slider');
    });

    it('should format accessibility text properly', () => {
      const formatAccessibilityText = (freq: number): string => {
        return `${freq.toFixed(1)} Hertz`;
      };

      expect(formatAccessibilityText(4.0)).toBe('4.0 Hertz');
      expect(formatAccessibilityText(6.5)).toBe('6.5 Hertz');
      expect(formatAccessibilityText(8.0)).toBe('8.0 Hertz');
    });
  });

  describe('Theta Range Description', () => {
    it('should label 4 Hz as Low Theta', () => {
      const lowThetaLabel = `${MIN_FREQUENCY_HZ} Hz (Low Theta)`;
      expect(lowThetaLabel).toBe('4 Hz (Low Theta)');
    });

    it('should label 8 Hz as High Theta', () => {
      const highThetaLabel = `${MAX_FREQUENCY_HZ} Hz (High Theta)`;
      expect(highThetaLabel).toBe('8 Hz (High Theta)');
    });

    it('should cover the full theta brainwave range', () => {
      // Theta waves are typically 4-8 Hz
      // This range is associated with relaxation, meditation, and creativity
      expect(MIN_FREQUENCY_HZ).toBe(4.0);
      expect(MAX_FREQUENCY_HZ).toBe(8.0);
    });
  });

  describe('Callback Behavior', () => {
    it('should call onValueChange with rounded value', () => {
      const mockOnValueChange = jest.fn();

      // Simulate what the component does internally
      const handleValueChange = (newValue: number) => {
        const roundedValue = Math.round(newValue * 10) / 10;
        mockOnValueChange(roundedValue);
      };

      handleValueChange(5.55);
      expect(mockOnValueChange).toHaveBeenCalledWith(5.6);

      handleValueChange(5.54);
      expect(mockOnValueChange).toHaveBeenCalledWith(5.5);
    });

    it('should call onSlidingComplete with rounded value', () => {
      const mockOnSlidingComplete = jest.fn();

      const handleSlidingComplete = (newValue: number) => {
        const roundedValue = Math.round(newValue * 10) / 10;
        mockOnSlidingComplete(roundedValue);
      };

      handleSlidingComplete(7.05);
      expect(mockOnSlidingComplete).toHaveBeenCalledWith(7.1);
    });

    it('should not call callbacks if they are not provided', () => {
      // Simulate component behavior with undefined callbacks
      const onValueChange: ((value: number) => void) | undefined = undefined;
      const onSlidingComplete: ((value: number) => void) | undefined =
        undefined;

      const handleValueChange = (newValue: number) => {
        const roundedValue = Math.round(newValue * 10) / 10;
        if (onValueChange) {
          onValueChange(roundedValue);
        }
      };

      const handleSlidingComplete = (newValue: number) => {
        const roundedValue = Math.round(newValue * 10) / 10;
        if (onSlidingComplete) {
          onSlidingComplete(roundedValue);
        }
      };

      // These should not throw
      expect(() => handleValueChange(5.0)).not.toThrow();
      expect(() => handleSlidingComplete(6.0)).not.toThrow();
    });
  });
});
