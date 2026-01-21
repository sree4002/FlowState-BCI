/**
 * CalibrateButton - Button component for initiating calibration flow
 *
 * This button links to the calibration flow where users can record their
 * baseline theta patterns for personalized entrainment.
 */

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

export interface CalibrateButtonProps {
  /** Callback when button is pressed */
  onPress: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Button variant - primary has accent colors, secondary is more subtle */
  variant?: 'primary' | 'secondary';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Custom label text (defaults to "Calibrate") */
  label?: string;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * CalibrateButton component
 *
 * A styled button that initiates the calibration flow. Supports multiple
 * variants and sizes to fit different UI contexts.
 *
 * @example
 * // Primary button for main calibration action
 * <CalibrateButton onPress={() => navigation.navigate('Calibration')} />
 *
 * @example
 * // Secondary smaller button in settings
 * <CalibrateButton
 *   onPress={handleRecalibrate}
 *   variant="secondary"
 *   size="sm"
 *   label="Recalibrate"
 * />
 */
export const CalibrateButton: React.FC<CalibrateButtonProps> = ({
  onPress,
  disabled = false,
  variant = 'primary',
  size = 'md',
  label = 'Calibrate',
  testID = 'calibrate-button',
}) => {
  const buttonStyles: ViewStyle[] = [
    styles.button,
    styles[`button_${variant}`],
    styles[`button_${size}`],
    disabled && styles.button_disabled,
  ].filter(Boolean) as ViewStyle[];

  const textStyles: TextStyle[] = [
    styles.text,
    styles[`text_${variant}`],
    styles[`text_${size}`],
    disabled && styles.text_disabled,
  ].filter(Boolean) as TextStyle[];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <Text style={textStyles}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },

  // Variant styles
  button_primary: {
    backgroundColor: Colors.primary.main,
    borderWidth: 2,
    borderColor: Colors.primary.light,
  },
  button_secondary: {
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  // Size styles
  button_sm: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minWidth: 100,
  },
  button_md: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minWidth: 140,
  },
  button_lg: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    minWidth: 180,
  },

  // Disabled state
  button_disabled: {
    backgroundColor: Colors.interactive.disabled,
    borderColor: Colors.border.secondary,
    opacity: 0.5,
  },

  // Text styles
  text: {
    fontWeight: Typography.fontWeight.semibold,
  },
  text_primary: {
    color: Colors.text.inverse,
  },
  text_secondary: {
    color: Colors.text.primary,
  },
  text_sm: {
    fontSize: Typography.fontSize.sm,
  },
  text_md: {
    fontSize: Typography.fontSize.md,
  },
  text_lg: {
    fontSize: Typography.fontSize.lg,
  },
  text_disabled: {
    color: Colors.text.disabled,
  },
});

export default CalibrateButton;
