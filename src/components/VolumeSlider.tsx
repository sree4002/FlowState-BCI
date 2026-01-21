import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Colors,
  Spacing,
  Typography,
} from '../constants/theme';

/**
 * Minimum volume value (0%)
 */
const MIN_VOLUME = 0;

/**
 * Maximum volume value (100%)
 */
const MAX_VOLUME = 100;

/**
 * Volume slider step size
 */
const VOLUME_STEP = 5;

/**
 * Props for VolumeSlider component
 */
export interface VolumeSliderProps {
  /** Current volume value (0-100) */
  value: number;
  /** Callback when volume changes */
  onValueChange: (value: number) => void;
  /** Optional label text (defaults to "Volume") */
  label?: string;
  /** Whether the slider is disabled */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * VolumeSlider component
 * A reusable slider component for controlling audio volume from 0-100%.
 * Features a labeled header with current value display, a native slider,
 * and range indicators showing min/max values.
 *
 * @example
 * ```tsx
 * <VolumeSlider
 *   value={volume}
 *   onValueChange={setVolume}
 *   label="Audio Volume"
 *   testID="session-volume"
 * />
 * ```
 */
export const VolumeSlider: React.FC<VolumeSliderProps> = ({
  value,
  onValueChange,
  label = 'Volume',
  disabled = false,
  testID = 'volume-slider',
}) => {
  /**
   * Format volume value as percentage string
   */
  const formatVolume = (vol: number): string => {
    return `${Math.round(vol)}%`;
  };

  return (
    <View
      style={[styles.container, disabled && styles.containerDisabled]}
      testID={testID}
    >
      {/* Header with label and current value */}
      <View style={styles.header}>
        <Text
          style={[styles.label, disabled && styles.textDisabled]}
          accessibilityRole="text"
        >
          {label}
        </Text>
        <Text
          style={[styles.value, disabled && styles.textDisabled]}
          testID={`${testID}-value`}
          accessibilityRole="text"
        >
          {formatVolume(value)}
        </Text>
      </View>

      {/* Slider */}
      <Slider
        style={styles.slider}
        minimumValue={MIN_VOLUME}
        maximumValue={MAX_VOLUME}
        step={VOLUME_STEP}
        value={value}
        onValueChange={onValueChange}
        minimumTrackTintColor={
          disabled ? Colors.interactive.disabled : Colors.accent.success
        }
        maximumTrackTintColor={Colors.border.primary}
        thumbTintColor={
          disabled ? Colors.interactive.disabled : Colors.status.greenLight
        }
        disabled={disabled}
        testID={`${testID}-slider`}
        accessibilityLabel={`${label} slider`}
        accessibilityRole="adjustable"
        accessibilityValue={{
          min: MIN_VOLUME,
          max: MAX_VOLUME,
          now: value,
          text: `${Math.round(value)} percent`,
        }}
        accessibilityState={{ disabled }}
      />

      {/* Range indicators */}
      <View style={styles.range}>
        <Text style={[styles.rangeText, disabled && styles.textDisabled]}>
          0%
        </Text>
        <Text style={[styles.rangeText, disabled && styles.textDisabled]}>
          100%
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  containerDisabled: {
    opacity: 0.5,
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
  value: {
    color: Colors.accent.success,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  range: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rangeText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
  },
  textDisabled: {
    color: Colors.text.disabled,
  },
});

export default VolumeSlider;
