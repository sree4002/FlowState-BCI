/**
 * ResultsSummary Component
 * Displays comprehensive game results
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';
import { GameSessionDetail } from '../../types/games';

export interface ResultsSummaryProps {
  session: GameSessionDetail;
  testID?: string;
}

export const ResultsSummary: React.FC<ResultsSummaryProps> = ({
  session,
  testID,
}) => {
  const { performance, config, start_time, end_time } = session;
  const duration = Math.floor((end_time - start_time) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  const getPerformanceLevel = (accuracy: number): string => {
    if (accuracy >= 0.9) return 'Excellent';
    if (accuracy >= 0.8) return 'Great';
    if (accuracy >= 0.7) return 'Good';
    if (accuracy >= 0.6) return 'Fair';
    return 'Needs Practice';
  };

  const getPerformanceColor = (accuracy: number): string => {
    if (accuracy >= 0.8) return Colors.theta.high;
    if (accuracy >= 0.6) return Colors.theta.normal;
    return Colors.theta.low;
  };

  return (
    <ScrollView style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Complete!</Text>
        <Text
          style={[
            styles.performanceLevel,
            { color: getPerformanceColor(performance.accuracy) },
          ]}
        >
          {getPerformanceLevel(performance.accuracy)}
        </Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>
            {(performance.accuracy * 100).toFixed(1)}%
          </Text>
          <Text style={styles.statDetail}>
            {performance.correct_trials} / {performance.total_trials} correct
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Avg Response</Text>
          <Text style={styles.statValue}>
            {(performance.avg_response_time / 1000).toFixed(2)}s
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Duration</Text>
          <Text style={styles.statValue}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Difficulty</Text>
          <Text style={styles.statValue}>
            {performance.difficulty_start.toFixed(1)} → {performance.difficulty_end.toFixed(1)}
          </Text>
        </View>
      </View>

      {performance.theta_correlation !== undefined && (
        <View style={styles.correlationCard}>
          <Text style={styles.correlationTitle}>Theta Correlation</Text>
          <Text style={styles.correlationValue}>
            {performance.theta_correlation.toFixed(3)}
          </Text>
          <Text style={styles.correlationDescription}>
            {performance.theta_correlation > 0.4
              ? 'Your theta power correlated positively with performance'
              : 'No significant correlation between theta and performance'}
          </Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Game Type</Text>
        <Text style={styles.infoValue}>
          {config.gameType === 'word_recall' ? 'Word Recall' : 'N-Back'}
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoLabel}>Mode</Text>
        <Text style={styles.infoValue}>
          {config.mode.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  performanceLevel: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
  },
  statDetail: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  correlationCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  correlationTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  correlationValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
    marginBottom: Spacing.sm,
  },
  correlationDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  infoValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
});
