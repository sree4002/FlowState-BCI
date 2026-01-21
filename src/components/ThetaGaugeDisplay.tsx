import React, { useMemo, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

/**
 * Props for ThetaGaugeDisplay
 */
export interface ThetaGaugeDisplayProps {
  /** Current theta z-score value to display */
  value?: number | null;
  /** Minimum value on the gauge scale */
  minValue?: number;
  /** Maximum value on the gauge scale */
  maxValue?: number;
  /** Size of the gauge in pixels */
  size?: number;
  /** Whether to show the title label */
  showLabel?: boolean;
  /** Title text to display above the gauge */
  title?: string;
  /** Whether to animate needle movement */
  animated?: boolean;
  /** Duration of animation in milliseconds */
  animationDuration?: number;
  /** Whether to show zone labels around the gauge */
  showZoneLabels?: boolean;
  /** Whether to show the current value text below the gauge */
  showValue?: boolean;
  /** Test ID for component testing */
  testID?: string;
}

/**
 * Theta zone information
 */
interface ThetaZone {
  name: string;
  color: string;
  startAngle: number;
  endAngle: number;
  minValue: number;
  maxValue: number;
}

/**
 * Get color based on theta z-score value
 * Red: below 0, Yellow: 0-0.5, Green: 0.5-1.5, Blue: above 1.5
 */
const getZScoreColor = (zscore: number): string => {
  if (zscore < 0) return Colors.status.red;
  if (zscore < 0.5) return Colors.status.yellow;
  if (zscore < 1.5) return Colors.status.green;
  return Colors.status.blue;
};

/**
 * Get zone label based on theta z-score value
 */
const getZoneLabel = (zscore: number): string => {
  if (zscore < 0) return 'Below Target';
  if (zscore < 0.5) return 'Approaching';
  if (zscore < 1.5) return 'Optimal';
  return 'High Theta';
};

/**
 * Calculate needle rotation angle based on value
 * Gauge spans from -135deg (min) to 135deg (max)
 */
const calculateNeedleAngle = (
  value: number,
  minValue: number,
  maxValue: number
): number => {
  const clampedValue = Math.max(minValue, Math.min(maxValue, value));
  const normalizedValue = (clampedValue - minValue) / (maxValue - minValue);
  // Gauge spans 270 degrees (-135 to 135)
  const startAngle = -135;
  const endAngle = 135;
  return startAngle + normalizedValue * (endAngle - startAngle);
};

/**
 * ThetaGaugeDisplay
 *
 * A circular gauge component that displays theta z-score values with
 * color-coded zones (red/yellow/green/blue). The gauge provides visual
 * feedback on the current theta state during meditation sessions.
 *
 * Zone colors:
 * - Red (< 0): Below target - theta activity is below baseline
 * - Yellow (0-0.5): Approaching target - getting close to optimal range
 * - Green (0.5-1.5): Optimal - theta activity is in the target range
 * - Blue (> 1.5): High theta - elevated theta activity
 */
export const ThetaGaugeDisplay: React.FC<ThetaGaugeDisplayProps> = ({
  value = null,
  minValue = -1,
  maxValue = 2,
  size = 200,
  showLabel = true,
  title = 'Theta Level',
  animated = true,
  animationDuration = 500,
  showZoneLabels = true,
  showValue = true,
  testID = 'theta-gauge-display',
}) => {
  // Animation value for the needle
  const needleRotation = useRef(new Animated.Value(-135)).current;

  // Define the four theta zones with their angular positions
  const zones: ThetaZone[] = useMemo(() => {
    const totalRange = maxValue - minValue;
    const startAngle = -135;
    const totalArcDegrees = 270;

    // Zone boundaries
    const zoneBreakpoints = [
      { value: minValue, name: 'Red' },
      { value: 0, name: 'Yellow' },
      { value: 0.5, name: 'Green' },
      { value: 1.5, name: 'Blue' },
      { value: maxValue, name: 'End' },
    ];

    return [
      {
        name: 'Below Target',
        color: Colors.status.red,
        startAngle:
          startAngle +
          ((Math.max(minValue, minValue) - minValue) / totalRange) * totalArcDegrees,
        endAngle:
          startAngle +
          ((Math.min(0, maxValue) - minValue) / totalRange) * totalArcDegrees,
        minValue: minValue,
        maxValue: Math.min(0, maxValue),
      },
      {
        name: 'Approaching',
        color: Colors.status.yellow,
        startAngle:
          startAngle +
          ((Math.max(0, minValue) - minValue) / totalRange) * totalArcDegrees,
        endAngle:
          startAngle +
          ((Math.min(0.5, maxValue) - minValue) / totalRange) * totalArcDegrees,
        minValue: Math.max(0, minValue),
        maxValue: Math.min(0.5, maxValue),
      },
      {
        name: 'Optimal',
        color: Colors.status.green,
        startAngle:
          startAngle +
          ((Math.max(0.5, minValue) - minValue) / totalRange) * totalArcDegrees,
        endAngle:
          startAngle +
          ((Math.min(1.5, maxValue) - minValue) / totalRange) * totalArcDegrees,
        minValue: Math.max(0.5, minValue),
        maxValue: Math.min(1.5, maxValue),
      },
      {
        name: 'High Theta',
        color: Colors.status.blue,
        startAngle:
          startAngle +
          ((Math.max(1.5, minValue) - minValue) / totalRange) * totalArcDegrees,
        endAngle:
          startAngle +
          ((Math.min(maxValue, maxValue) - minValue) / totalRange) * totalArcDegrees,
        minValue: Math.max(1.5, minValue),
        maxValue: maxValue,
      },
    ].filter((zone) => zone.minValue < zone.maxValue); // Filter out zones outside the range
  }, [minValue, maxValue]);

  // Calculate the current needle angle
  const currentAngle = useMemo(() => {
    if (value === null) return -135; // Point to min when no value
    return calculateNeedleAngle(value, minValue, maxValue);
  }, [value, minValue, maxValue]);

  // Get current zone color
  const currentColor = useMemo(() => {
    if (value === null) return Colors.text.tertiary;
    return getZScoreColor(value);
  }, [value]);

  // Get current zone label
  const currentZoneLabel = useMemo(() => {
    if (value === null) return 'No Data';
    return getZoneLabel(value);
  }, [value]);

  // Animate needle when value changes
  useEffect(() => {
    if (animated) {
      Animated.timing(needleRotation, {
        toValue: currentAngle,
        duration: animationDuration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    } else {
      needleRotation.setValue(currentAngle);
    }
  }, [currentAngle, animated, animationDuration, needleRotation]);

  // Calculate sizes based on the main size prop
  const gaugeSize = size;
  const strokeWidth = size * 0.12;
  const innerRadius = (gaugeSize - strokeWidth) / 2;
  const needleLength = innerRadius * 0.7;
  const needleWidth = size * 0.025;
  const centerDotSize = size * 0.08;

  // Generate arc segments for each zone
  const renderZoneArcs = () => {
    return zones.map((zone, index) => {
      const arcLength = zone.endAngle - zone.startAngle;
      if (arcLength <= 0) return null;

      return (
        <View
          key={zone.name}
          testID={`${testID}-zone-${zone.name.toLowerCase().replace(/\s/g, '-')}`}
          style={[
            styles.zoneArc,
            {
              width: gaugeSize,
              height: gaugeSize,
              borderRadius: gaugeSize / 2,
              borderWidth: strokeWidth,
              borderColor: 'transparent',
              position: 'absolute',
              borderTopColor: zone.color,
              borderRightColor: arcLength > 90 ? zone.color : 'transparent',
              borderBottomColor: arcLength > 180 ? zone.color : 'transparent',
              borderLeftColor: arcLength > 270 ? zone.color : 'transparent',
              transform: [{ rotate: `${zone.startAngle}deg` }],
            },
          ]}
        />
      );
    });
  };

  return (
    <View style={styles.container} testID={testID}>
      {showLabel && <Text style={styles.title}>{title}</Text>}

      <View style={[styles.gaugeContainer, { width: gaugeSize, height: gaugeSize }]}>
        {/* Background track */}
        <View
          style={[
            styles.gaugeTrack,
            {
              width: gaugeSize,
              height: gaugeSize,
              borderRadius: gaugeSize / 2,
              borderWidth: strokeWidth,
            },
          ]}
          testID={`${testID}-track`}
        />

        {/* Zone arcs - using View-based approach for cross-platform compatibility */}
        <View style={styles.zonesContainer}>
          {/* Red zone */}
          <View
            testID={`${testID}-zone-red`}
            style={[
              styles.zoneSegment,
              {
                width: gaugeSize,
                height: gaugeSize / 2,
                borderTopLeftRadius: gaugeSize / 2,
                borderTopRightRadius: gaugeSize / 2,
                borderWidth: strokeWidth,
                borderBottomWidth: 0,
                borderColor: Colors.status.red,
                position: 'absolute',
                top: 0,
                transform: [
                  { translateY: gaugeSize / 4 },
                  { rotate: '-135deg' },
                  { translateY: -gaugeSize / 4 },
                ],
              },
            ]}
          />
          {/* Yellow zone */}
          <View
            testID={`${testID}-zone-yellow`}
            style={[
              styles.zoneSegment,
              {
                width: gaugeSize,
                height: gaugeSize / 2,
                borderTopLeftRadius: gaugeSize / 2,
                borderTopRightRadius: gaugeSize / 2,
                borderWidth: strokeWidth,
                borderBottomWidth: 0,
                borderColor: Colors.status.yellow,
                position: 'absolute',
                top: 0,
                transform: [
                  { translateY: gaugeSize / 4 },
                  { rotate: '-67.5deg' },
                  { translateY: -gaugeSize / 4 },
                ],
              },
            ]}
          />
          {/* Green zone */}
          <View
            testID={`${testID}-zone-green`}
            style={[
              styles.zoneSegment,
              {
                width: gaugeSize,
                height: gaugeSize / 2,
                borderTopLeftRadius: gaugeSize / 2,
                borderTopRightRadius: gaugeSize / 2,
                borderWidth: strokeWidth,
                borderBottomWidth: 0,
                borderColor: Colors.status.green,
                position: 'absolute',
                top: 0,
                transform: [
                  { translateY: gaugeSize / 4 },
                  { rotate: '22.5deg' },
                  { translateY: -gaugeSize / 4 },
                ],
              },
            ]}
          />
          {/* Blue zone */}
          <View
            testID={`${testID}-zone-blue`}
            style={[
              styles.zoneSegment,
              {
                width: gaugeSize,
                height: gaugeSize / 2,
                borderTopLeftRadius: gaugeSize / 2,
                borderTopRightRadius: gaugeSize / 2,
                borderWidth: strokeWidth,
                borderBottomWidth: 0,
                borderColor: Colors.status.blue,
                position: 'absolute',
                top: 0,
                transform: [
                  { translateY: gaugeSize / 4 },
                  { rotate: '90deg' },
                  { translateY: -gaugeSize / 4 },
                ],
              },
            ]}
          />
        </View>

        {/* Needle */}
        <Animated.View
          testID={`${testID}-needle`}
          style={[
            styles.needle,
            {
              width: needleWidth,
              height: needleLength,
              backgroundColor: currentColor,
              bottom: gaugeSize / 2,
              left: gaugeSize / 2 - needleWidth / 2,
              transformOrigin: 'bottom',
              transform: [
                {
                  rotate: needleRotation.interpolate({
                    inputRange: [-135, 135],
                    outputRange: ['-135deg', '135deg'],
                  }),
                },
              ],
            },
          ]}
        />

        {/* Center dot */}
        <View
          style={[
            styles.centerDot,
            {
              width: centerDotSize,
              height: centerDotSize,
              borderRadius: centerDotSize / 2,
              top: gaugeSize / 2 - centerDotSize / 2,
              left: gaugeSize / 2 - centerDotSize / 2,
              backgroundColor: currentColor,
            },
          ]}
          testID={`${testID}-center`}
        />

        {/* Zone labels */}
        {showZoneLabels && (
          <>
            <Text
              style={[
                styles.zoneLabel,
                {
                  color: Colors.status.red,
                  left: size * 0.05,
                  top: size * 0.65,
                },
              ]}
              testID={`${testID}-label-red`}
            >
              Low
            </Text>
            <Text
              style={[
                styles.zoneLabel,
                {
                  color: Colors.status.yellow,
                  left: size * 0.12,
                  top: size * 0.2,
                },
              ]}
              testID={`${testID}-label-yellow`}
            >
              Near
            </Text>
            <Text
              style={[
                styles.zoneLabel,
                {
                  color: Colors.status.green,
                  right: size * 0.1,
                  top: size * 0.2,
                },
              ]}
              testID={`${testID}-label-green`}
            >
              Good
            </Text>
            <Text
              style={[
                styles.zoneLabel,
                {
                  color: Colors.status.blue,
                  right: size * 0.02,
                  top: size * 0.65,
                },
              ]}
              testID={`${testID}-label-blue`}
            >
              High
            </Text>
          </>
        )}
      </View>

      {/* Current value display */}
      {showValue && (
        <View style={styles.valueContainer}>
          <Text
            style={[styles.valueText, { color: currentColor }]}
            testID={`${testID}-value`}
          >
            {value !== null ? value.toFixed(2) : '--'}
          </Text>
          <Text
            style={[styles.zoneLabelText, { color: currentColor }]}
            testID={`${testID}-zone-label`}
          >
            {currentZoneLabel}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  gaugeContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gaugeTrack: {
    position: 'absolute',
    borderColor: Colors.surface.secondary,
  },
  zonesContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  zoneArc: {
    position: 'absolute',
  },
  zoneSegment: {
    backgroundColor: 'transparent',
  },
  needle: {
    position: 'absolute',
    borderRadius: BorderRadius.sm,
  },
  centerDot: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.surface.primary,
    ...Shadows.sm,
  },
  zoneLabel: {
    position: 'absolute',
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
  },
  valueContainer: {
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  valueText: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  zoneLabelText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginTop: Spacing.xs,
  },
});

export default ThetaGaugeDisplay;
