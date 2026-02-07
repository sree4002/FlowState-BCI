/**
 * PerformanceChart Component
 * Displays game performance trends over time
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';
import { GameSession } from '../../types/games';

export interface PerformanceChartProps {
  sessions: GameSession[];
  testID?: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  sessions,
  testID,
}) => {
  // Simple bar chart visualization of recent performance
  const maxSessions = 10;
  const recentSessions = sessions.slice(0, maxSessions);
  const maxAccuracy = 1.0;

  const chartWidth = Dimensions.get('window').width - Spacing.screenPadding * 2;
  const barWidth = (chartWidth - (recentSessions.length - 1) * 4) / recentSessions.length;

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.title}>Recent Performance</Text>
      <View style={styles.chartContainer}>
        {recentSessions.length === 0 ? (
          <Text style={styles.emptyText}>No games played yet</Text>
        ) : (
          <View style={styles.bars}>
            {recentSessions.map((session, index) => {
              const height = (session.performance.accuracy / maxAccuracy) * 120;
              return (
                <View key={session.id} style={styles.barContainer}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height,
                        width: barWidth,
                        backgroundColor: getAccuracyColor(session.performance.accuracy),
                      },
                    ]}
                  />
                  <Text style={styles.barLabel}>
                    {(session.performance.accuracy * 100).toFixed(0)}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
      {recentSessions.length > 0 && (
        <Text style={styles.subtitle}>
          Last {recentSessions.length} games
        </Text>
      )}
    </View>
  );
};

const getAccuracyColor = (accuracy: number): string => {
  if (accuracy >= 0.8) return Colors.theta.high;
  if (accuracy >= 0.6) return Colors.theta.normal;
  return Colors.theta.low;
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
  chartContainer: {
    height: 150,
    justifyContent: 'flex-end',
  },
  bars: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 120,
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  bar: {
    borderTopLeftRadius: BorderRadius.sm,
    borderTopRightRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  barLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
