/**
 * ThetaCorrelationWidget Component
 * Displays correlation between theta power and game performance
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';

export interface ThetaCorrelationWidgetProps {
  correlation: number | undefined; // -1 to 1
  avgThetaZScore: number;
  accuracy: number;
  testID?: string;
}

export const ThetaCorrelationWidget: React.FC<ThetaCorrelationWidgetProps> = ({
  correlation,
  avgThetaZScore,
  accuracy,
  testID,
}) => {
  if (correlation === undefined) {
    return null;
  }

  const getCorrelationLabel = (corr: number): string => {
    if (corr > 0.7) return 'Strong Positive';
    if (corr > 0.4) return 'Moderate Positive';
    if (corr > 0.2) return 'Weak Positive';
    if (corr < -0.7) return 'Strong Negative';
    if (corr < -0.4) return 'Moderate Negative';
    if (corr < -0.2) return 'Weak Negative';
    return 'None';
  };

  const getCorrelationColor = (corr: number): string => {
    if (Math.abs(corr) > 0.7) return Colors.theta.high;
    if (Math.abs(corr) > 0.4) return Colors.theta.normal;
    return Colors.theta.low;
  };

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Theta-Performance Correlation</Text>
      <View style={styles.content}>
        <View style={styles.correlationContainer}>
          <Text
            style={[
              styles.correlationValue,
              { color: getCorrelationColor(correlation) },
            ]}
          >
            {correlation.toFixed(3)}
          </Text>
          <Text style={styles.correlationLabel}>
            {getCorrelationLabel(correlation)}
          </Text>
        </View>
        <View style={styles.metricsContainer}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Avg Theta</Text>
            <Text style={styles.metricValue}>
              {avgThetaZScore.toFixed(2)} z
            </Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Accuracy</Text>
            <Text style={styles.metricValue}>
              {(accuracy * 100).toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
      <Text style={styles.description}>
        {correlation > 0.4
          ? 'Higher theta correlates with better performance'
          : 'No significant correlation between theta and performance'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  correlationContainer: {
    alignItems: 'center',
  },
  correlationValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
  },
  correlationLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  metricsContainer: {
    gap: Spacing.md,
  },
  metric: {
    alignItems: 'flex-end',
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
  },
  metricValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.accent.primary,
  },
  description: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
