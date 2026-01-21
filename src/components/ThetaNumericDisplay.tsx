import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

/**
 * Size variants for the ThetaNumericDisplay component
 */
export type ThetaNumericDisplaySize = 'small' | 'medium' | 'large';

/**
 * Zone classification for theta z-scores
 */
export type ThetaZone = 'low' | 'baseline' | 'elevated' | 'high';

/**
 * Props for the ThetaNumericDisplay component
 */
export interface ThetaNumericDisplayProps {
  /**
   * Optional z-score value to display. If not provided, uses context value.
   */
  value?: number | null;
  /**
   * Size variant for the display (affects font size and padding)
   */
  size?: ThetaNumericDisplaySize;
  /**
   * Whether to show the "Theta Z-Score" label above the value
   */
  showLabel?: boolean;
  /**
   * Whether to show the zone badge (Low, Baseline, Elevated, Optimal)
   */
  showZone?: boolean;
  /**
   * Test ID for testing purposes
   */
  testID?: string;
}

/**
 * Returns the appropriate color for the theta z-score value
 * Based on zone thresholds:
 * - < -0.5: Red (low/below target)
 * - -0.5 to 0.5: Yellow (baseline)
 * - 0.5 to 1.5: Green (elevated/good)
 * - >= 1.5: Blue (high/optimal)
 */
export const getThetaZoneColor = (zscore: number | null): string => {
  if (zscore === null) return Colors.text.tertiary;
  if (zscore >= 1.5) return Colors.status.blue;
  if (zscore >= 0.5) return Colors.status.green;
  if (zscore >= -0.5) return Colors.status.yellow;
  return Colors.status.red;
};

/**
 * Returns the zone label for the theta z-score value
 */
export const getThetaZoneLabel = (zscore: number | null): string => {
  if (zscore === null) return 'Waiting';
  if (zscore >= 1.5) return 'Optimal';
  if (zscore >= 0.5) return 'Elevated';
  if (zscore >= -0.5) return 'Baseline';
  return 'Low';
};

/**
 * Returns the zone classification for the theta z-score value
 */
export const categorizeZScoreZone = (zscore: number | null): ThetaZone | null => {
  if (zscore === null) return null;
  if (zscore >= 1.5) return 'high';
  if (zscore >= 0.5) return 'elevated';
  if (zscore >= -0.5) return 'baseline';
  return 'low';
};

/**
 * Formats the z-score value for display with sign prefix
 */
export const formatZScore = (zscore: number | null): string => {
  if (zscore === null) return '--';
  const sign = zscore >= 0 ? '+' : '';
  return `${sign}${zscore.toFixed(2)}`;
};

/**
 * ThetaNumericDisplay Component
 *
 * Displays the current theta z-score value with color coding based on zones.
 * Color zones:
 * - Red: Below -0.5 (Low/Below target)
 * - Yellow: -0.5 to 0.5 (Baseline)
 * - Green: 0.5 to 1.5 (Elevated/Good)
 * - Blue: 1.5+ (High/Optimal)
 *
 * Uses SessionContext by default but can accept value prop for testing.
 */
export const ThetaNumericDisplay: React.FC<ThetaNumericDisplayProps> = ({
  value: propValue,
  size = 'medium',
  showLabel = true,
  showZone = true,
  testID,
}) => {
  const { currentThetaZScore } = useSession();

  // Use prop value if provided, otherwise use context
  const zscore = propValue !== undefined ? propValue : currentThetaZScore;

  const zoneColor = getThetaZoneColor(zscore);
  const zoneLabel = getThetaZoneLabel(zscore);
  const formattedValue = formatZScore(zscore);

  // Get size-specific styles
  const containerStyle = [
    styles.container,
    size === 'small' && styles.containerSmall,
    size === 'large' && styles.containerLarge,
  ];

  const valueStyle = [
    styles.value,
    size === 'small' && styles.valueSmall,
    size === 'large' && styles.valueLarge,
    { color: zoneColor },
  ];

  const badgeStyle = [
    styles.zoneBadge,
    size === 'small' && styles.zoneBadgeSmall,
    size === 'large' && styles.zoneBadgeLarge,
    { backgroundColor: zoneColor },
  ];

  return (
    <View style={containerStyle} testID={testID}>
      {showLabel && (
        <Text style={styles.label}>Theta Z-Score</Text>
      )}

      <View style={styles.valueContainer}>
        <Text
          style={valueStyle}
          accessibilityLabel={`Theta Z-Score: ${formattedValue}`}
          accessibilityRole="text"
        >
          {formattedValue}
        </Text>

        {showZone && (
          <View style={badgeStyle}>
            <Text
              style={[
                styles.zoneBadgeText,
                size === 'small' && styles.zoneBadgeTextSmall,
              ]}
            >
              {zoneLabel}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
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
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
  },
  value: {
    fontSize: 40,
    fontWeight: Typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  valueSmall: {
    fontSize: Typography.fontSize.xxl,
  },
  valueLarge: {
    fontSize: 56,
  },
  zoneBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  zoneBadgeSmall: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  zoneBadgeLarge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xl,
  },
  zoneBadgeText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  zoneBadgeTextSmall: {
    fontSize: Typography.fontSize.xs,
  },
});

export default ThetaNumericDisplay;
