import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, Typography } from '../constants/theme';

/**
 * Constants for the Theta frequency range
 */
const MIN_FREQUENCY_HZ = 4.0;
const MAX_FREQUENCY_HZ = 8.0;
const FREQUENCY_STEP = 0.1;
const DEFAULT_FREQUENCY = 6.0;

/**
 * Props for FrequencySlider component
 */
export interface FrequencySliderProps {
  /** Current frequency value in Hz */
  value?: number;
  /** Callback when frequency changes */
  onValueChange?: (value: number) => void;
  /** Callback when user finishes sliding */
  onSlidingComplete?: (value: number) => void;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Optional label text (defaults to "Frequency") */
  label?: string;
  /** Whether to show the min/max range labels */
  showRangeLabels?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * FrequencySlider component
 * A specialized slider for selecting entrainment frequencies in the Theta range (4-8 Hz).
 * Designed for BCI neurofeedback sessions to adjust brainwave entrainment frequency.
 */
export const FrequencySlider: React.FC<FrequencySliderProps> = ({
  value = DEFAULT_FREQUENCY,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  label = 'Frequency',
  showRangeLabels = true,
  testID,
}) => {
  /**
   * Handle slider value change
   * Rounds to 1 decimal place to ensure clean 0.1 Hz increments
   */
  const handleValueChange = (newValue: number) => {
    const roundedValue = Math.round(newValue * 10) / 10;
    if (onValueChange) {
      onValueChange(roundedValue);
    }
  };

  /**
   * Handle sliding complete
   * Rounds to 1 decimal place to ensure clean 0.1 Hz increments
   */
  const handleSlidingComplete = (newValue: number) => {
    const roundedValue = Math.round(newValue * 10) / 10;
    if (onSlidingComplete) {
      onSlidingComplete(roundedValue);
    }
  };

  /**
   * Format frequency for display
   */
  const formatFrequency = (freq: number): string => {
    return `${freq.toFixed(1)} Hz`;
  };

  return (
    <View
      style={styles.container}
      testID={testID}
      accessibilityRole="adjustable"
      accessibilityLabel={`${label} slider`}
    >
      <View style={styles.header}>
        <Text style={[styles.label, disabled && styles.labelDisabled]}>
          {label}
        </Text>
        <Text
          style={[styles.value, disabled && styles.valueDisabled]}
          testID={testID ? `${testID}-value` : undefined}
        >
          {formatFrequency(value)}
        </Text>
      </View>

      <Slider
        style={styles.slider}
        minimumValue={MIN_FREQUENCY_HZ}
        maximumValue={MAX_FREQUENCY_HZ}
        step={FREQUENCY_STEP}
        value={value}
        onValueChange={handleValueChange}
        onSlidingComplete={handleSlidingComplete}
        minimumTrackTintColor={disabled ? Colors.interactive.disabled : Colors.secondary.main}
        maximumTrackTintColor={Colors.border.primary}
        thumbTintColor={disabled ? Colors.interactive.disabled : Colors.secondary.light}
        disabled={disabled}
        testID={testID ? `${testID}-slider` : undefined}
        accessibilityLabel={`${label}: ${formatFrequency(value)}`}
        accessibilityValue={{
          min: MIN_FREQUENCY_HZ,
          max: MAX_FREQUENCY_HZ,
          now: value,
          text: `${value.toFixed(1)} Hertz`,
        }}
      />

      {showRangeLabels && (
        <View style={styles.rangeLabels}>
          <Text style={[styles.rangeText, disabled && styles.rangeTextDisabled]}>
            {MIN_FREQUENCY_HZ} Hz (Low Theta)
          </Text>
          <Text style={[styles.rangeText, disabled && styles.rangeTextDisabled]}>
            {MAX_FREQUENCY_HZ} Hz (High Theta)
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  labelDisabled: {
    color: Colors.text.disabled,
  },
  value: {
    color: Colors.secondary.main,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  valueDisabled: {
    color: Colors.text.disabled,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
  },
  rangeTextDisabled: {
    color: Colors.text.disabled,
  },
});

export default FrequencySlider;
