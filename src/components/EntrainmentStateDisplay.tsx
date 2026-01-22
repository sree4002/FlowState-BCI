import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { SessionState } from '../types';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

/**
 * Size variants for the EntrainmentStateDisplay component
 */
export type EntrainmentStateDisplaySize = 'small' | 'medium' | 'large';

/**
 * Entrainment state based on session state
 */
export type EntrainmentState = 'idle' | 'active' | 'paused' | 'stopped';

/**
 * Props for the EntrainmentStateDisplay component
 */
export interface EntrainmentStateDisplayProps {
  /**
   * Optional frequency value to display. If not provided, uses context value.
   */
  frequency?: number | null;
  /**
   * Optional session state. If not provided, uses context value.
   */
  sessionState?: SessionState;
  /**
   * Size variant for the display (affects font size and padding)
   */
  size?: EntrainmentStateDisplaySize;
  /**
   * Whether to show the "Entrainment Frequency" label above the value
   */
  showLabel?: boolean;
  /**
   * Whether to show the state badge (Active, Paused, etc.)
   */
  showState?: boolean;
  /**
   * Whether to show the pulsing animation when active
   */
  showPulse?: boolean;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * Formats frequency value for display (e.g., "6.0 Hz")
 */
export const formatFrequency = (frequency: number | null): string => {
  if (frequency === null) {
    return '-- Hz';
  }
  return `${frequency.toFixed(1)} Hz`;
};

/**
 * Returns the entrainment state based on session state
 */
export const getEntrainmentState = (
  sessionState: SessionState
): EntrainmentState => {
  switch (sessionState) {
    case 'running':
      return 'active';
    case 'paused':
      return 'paused';
    case 'stopped':
      return 'stopped';
    case 'idle':
    default:
      return 'idle';
  }
};

/**
 * Returns the color for the entrainment state
 */
export const getEntrainmentStateColor = (state: EntrainmentState): string => {
  switch (state) {
    case 'active':
      return Colors.accent.success;
    case 'paused':
      return Colors.accent.warning;
    case 'stopped':
      return Colors.accent.error;
    case 'idle':
    default:
      return Colors.text.tertiary;
  }
};

/**
 * Returns the label for the entrainment state
 */
export const getEntrainmentStateLabel = (state: EntrainmentState): string => {
  switch (state) {
    case 'active':
      return 'Active';
    case 'paused':
      return 'Paused';
    case 'stopped':
      return 'Stopped';
    case 'idle':
    default:
      return 'Ready';
  }
};

/**
 * Returns the icon for the entrainment state
 */
export const getEntrainmentStateIcon = (state: EntrainmentState): string => {
  switch (state) {
    case 'active':
      return '🔊';
    case 'paused':
      return '⏸';
    case 'stopped':
      return '⏹';
    case 'idle':
    default:
      return '⏻';
  }
};

/**
 * Returns the frequency color based on whether it's in the optimal theta range (4-8 Hz)
 */
export const getFrequencyColor = (
  frequency: number | null,
  state: EntrainmentState
): string => {
  if (frequency === null || state === 'idle') {
    return Colors.text.tertiary;
  }
  // Frequency is in the optimal theta range
  if (frequency >= 4 && frequency <= 8) {
    return Colors.secondary.main;
  }
  // Frequency is outside theta range (unusual, but handle gracefully)
  return Colors.text.primary;
};

/**
 * Returns the accessibility label for the entrainment display
 */
export const getEntrainmentAccessibilityLabel = (
  frequency: number | null,
  state: EntrainmentState
): string => {
  const stateLabel = getEntrainmentStateLabel(state);
  if (frequency === null) {
    return `Entrainment ${stateLabel}, frequency not set`;
  }
  return `Entrainment ${stateLabel}, frequency ${frequency.toFixed(1)} hertz`;
};

/**
 * Returns the frequency band label based on the frequency value
 */
export const getFrequencyBandLabel = (frequency: number | null): string => {
  if (frequency === null) {
    return 'Not Set';
  }
  if (frequency >= 4 && frequency <= 8) {
    return 'Theta Band';
  }
  if (frequency > 8 && frequency <= 13) {
    return 'Alpha Band';
  }
  if (frequency > 13 && frequency <= 30) {
    return 'Beta Band';
  }
  if (frequency < 4) {
    return 'Delta Band';
  }
  return 'High Frequency';
};

/**
 * Validates if frequency is within the valid entrainment range (4-8 Hz for theta)
 */
export const isValidThetaFrequency = (frequency: number | null): boolean => {
  if (frequency === null) {
    return false;
  }
  return frequency >= 4 && frequency <= 8;
};

/**
 * EntrainmentStateDisplay Component
 *
 * Displays the current entrainment frequency prominently with state indication.
 * Shows the frequency in Hz with a pulsing animation when entrainment is active.
 *
 * Features:
 * - Large, prominent frequency display
 * - Color-coded state indication (Active/Paused/Stopped/Ready)
 * - Pulsing animation when entrainment is active
 * - Frequency band label (Theta Band)
 * - Accessible with proper labels
 * - Multiple size variants
 *
 * Uses SessionContext by default but can accept props for testing.
 */
export const EntrainmentStateDisplay: React.FC<
  EntrainmentStateDisplayProps
> = ({
  frequency: propFrequency,
  sessionState: propSessionState,
  size = 'medium',
  showLabel = true,
  showState = true,
  showPulse = true,
  testID = 'entrainment-state-display',
}) => {
  const { sessionConfig, sessionState: contextSessionState } = useSession();

  // Use prop values if provided, otherwise use context
  const frequency =
    propFrequency !== undefined
      ? propFrequency
      : (sessionConfig?.entrainment_freq ?? null);
  const sessionState = propSessionState ?? contextSessionState;

  // Derive state values
  const entrainmentState = getEntrainmentState(sessionState);
  const stateColor = getEntrainmentStateColor(entrainmentState);
  const stateLabel = getEntrainmentStateLabel(entrainmentState);
  const stateIcon = getEntrainmentStateIcon(entrainmentState);
  const frequencyColor = getFrequencyColor(frequency, entrainmentState);
  const formattedFrequency = formatFrequency(frequency);
  const bandLabel = getFrequencyBandLabel(frequency);
  const accessibilityLabel = getEntrainmentAccessibilityLabel(
    frequency,
    entrainmentState
  );

  // Pulse animation for active state
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (entrainmentState === 'active' && showPulse) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [entrainmentState, showPulse, pulseAnim]);

  // Get size-specific styles
  const containerStyle = [
    styles.container,
    size === 'small' && styles.containerSmall,
    size === 'large' && styles.containerLarge,
  ];

  const frequencyStyle = [
    styles.frequency,
    size === 'small' && styles.frequencySmall,
    size === 'large' && styles.frequencyLarge,
    { color: frequencyColor },
  ];

  const stateBadgeStyle = [
    styles.stateBadge,
    size === 'small' && styles.stateBadgeSmall,
    size === 'large' && styles.stateBadgeLarge,
    { backgroundColor: stateColor },
  ];

  const stateTextStyle = [
    styles.stateBadgeText,
    size === 'small' && styles.stateBadgeTextSmall,
  ];

  return (
    <Animated.View
      style={[
        containerStyle,
        entrainmentState === 'active' && showPulse
          ? { transform: [{ scale: pulseAnim }] }
          : undefined,
      ]}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {showLabel && (
        <Text style={styles.label} testID={`${testID}-label`}>
          Entrainment Frequency
        </Text>
      )}

      <View style={styles.frequencyContainer}>
        {/* Frequency Display */}
        <View style={styles.frequencyRow}>
          <Text style={frequencyStyle} testID={`${testID}-frequency`}>
            {formattedFrequency}
          </Text>
        </View>

        {/* Band Label */}
        <Text style={styles.bandLabel} testID={`${testID}-band-label`}>
          {bandLabel}
        </Text>
      </View>

      {/* State Badge */}
      {showState && (
        <View style={styles.stateContainer}>
          <View style={stateBadgeStyle} testID={`${testID}-state-badge`}>
            <Text style={styles.stateIcon} testID={`${testID}-state-icon`}>
              {stateIcon}
            </Text>
            <Text style={stateTextStyle} testID={`${testID}-state-text`}>
              {stateLabel}
            </Text>
          </View>
        </View>
      )}

      {/* Active Indicator Ring */}
      {entrainmentState === 'active' && (
        <View
          style={[styles.activeIndicator, { borderColor: stateColor }]}
          testID={`${testID}-active-indicator`}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    ...Shadows.md,
  },
  containerSmall: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  containerLarge: {
    padding: Spacing.xl,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
  frequencyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  frequency: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  frequencySmall: {
    fontSize: Typography.fontSize.xxl,
  },
  frequencyLarge: {
    fontSize: 64,
  },
  bandLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    marginTop: Spacing.xs,
  },
  stateContainer: {
    marginTop: Spacing.md,
  },
  stateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    gap: Spacing.xs,
  },
  stateBadgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  stateBadgeLarge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  stateIcon: {
    fontSize: Typography.fontSize.md,
  },
  stateBadgeText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  stateBadgeTextSmall: {
    fontSize: Typography.fontSize.xs,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderRadius: BorderRadius.xl,
    opacity: 0.5,
  },
});

export default EntrainmentStateDisplay;
