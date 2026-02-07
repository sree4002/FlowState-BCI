/**
 * ScoreDisplay Component
 * Displays game performance metrics
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

export interface ScoreDisplayProps {
  accuracy: number; // 0-1
  averageResponseTime: number; // milliseconds
  difficulty: number; // 0-10
  totalTrials: number;
  correctTrials: number;
  compact?: boolean;
  testID?: string;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  accuracy,
  averageResponseTime,
  difficulty,
  totalTrials,
  correctTrials,
  compact = false,
  testID,
}) => {
  const accuracyPercent = (accuracy * 100).toFixed(1);
  const responseTimeSec = (averageResponseTime / 1000).toFixed(2);

  if (compact) {
    return (
      <View style={styles.containerCompact} testID={testID}>
        <View style={styles.metricCompact}>
          <Text style={styles.valueCompact}>{accuracyPercent}%</Text>
          <Text style={styles.labelCompact}>Accuracy</Text>
        </View>
        <View style={styles.metricCompact}>
          <Text style={styles.valueCompact}>{responseTimeSec}s</Text>
          <Text style={styles.labelCompact}>Avg Time</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.metric}>
        <Text style={styles.label}>Accuracy</Text>
        <Text style={styles.value}>{accuracyPercent}%</Text>
        <Text style={styles.detail}>
          {correctTrials} / {totalTrials} correct
        </Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.label}>Avg Response</Text>
        <Text style={styles.value}>{responseTimeSec}s</Text>
      </View>
      <View style={styles.metric}>
        <Text style={styles.label}>Difficulty</Text>
        <Text style={styles.value}>{difficulty.toFixed(1)}</Text>
        <Text style={styles.detail}>0-10 scale</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  containerCompact: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
  },
  metricCompact: {
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  labelCompact: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  value: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
  },
  valueCompact: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
  },
  detail: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
});
