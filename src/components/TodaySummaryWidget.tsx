import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSession } from '../contexts';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import type { Session } from '../types';

/**
 * Props for the TodaySummaryWidget component
 */
export interface TodaySummaryWidgetProps {
  /**
   * Optional custom sessions array to use instead of context data.
   * Useful for testing or when sessions are passed from a parent component.
   */
  sessions?: Session[];
}

/**
 * Statistics calculated for today's sessions
 */
interface TodayStats {
  sessionCount: number;
  totalTimeSeconds: number;
  averageTheta: number | null;
}

/**
 * Formats duration in seconds to a human-readable string
 */
const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0 min';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Formats theta z-score value for display
 */
const formatTheta = (theta: number | null): string => {
  if (theta === null) return '--';
  const sign = theta >= 0 ? '+' : '';
  return `${sign}${theta.toFixed(2)}`;
};

/**
 * Gets the start of today (midnight) as a timestamp
 */
const getStartOfToday = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/**
 * Filters sessions to only include those from today
 */
const filterTodaySessions = (sessions: Session[]): Session[] => {
  const startOfToday = getStartOfToday();
  return sessions.filter((session) => session.start_time >= startOfToday);
};

/**
 * Calculates statistics for today's sessions
 */
const calculateTodayStats = (sessions: Session[]): TodayStats => {
  const todaySessions = filterTodaySessions(sessions);

  const sessionCount = todaySessions.length;
  const totalTimeSeconds = todaySessions.reduce(
    (sum, session) => sum + session.duration_seconds,
    0
  );

  const averageTheta =
    sessionCount > 0
      ? todaySessions.reduce((sum, session) => sum + session.avg_theta_zscore, 0) /
        sessionCount
      : null;

  return {
    sessionCount,
    totalTimeSeconds,
    averageTheta,
  };
};

/**
 * Returns the appropriate color for the theta value
 */
const getThetaColor = (theta: number | null): string => {
  if (theta === null) return Colors.text.secondary;
  if (theta >= 0.5) return Colors.status.green;
  if (theta >= 0) return Colors.status.yellow;
  return Colors.status.red;
};

/**
 * TodaySummaryWidget Component
 *
 * Displays a summary of today's session statistics including:
 * - Session count: Number of sessions completed today
 * - Total time: Cumulative duration of all sessions
 * - Average theta: Mean theta z-score across all sessions
 *
 * Uses the SessionContext by default but can accept sessions prop for testing.
 */
export const TodaySummaryWidget: React.FC<TodaySummaryWidgetProps> = ({
  sessions: propSessions,
}) => {
  const { recentSessions } = useSession();

  // Use prop sessions if provided, otherwise use context
  const sessions = propSessions ?? recentSessions;

  // Memoize stats calculation to avoid recalculating on every render
  const stats = useMemo(() => calculateTodayStats(sessions), [sessions]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>

      <View style={styles.grid}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.sessionCount}</Text>
          <Text style={styles.statLabel}>Sessions</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {formatDuration(stats.totalTimeSeconds)}
          </Text>
          <Text style={styles.statLabel}>Total Time</Text>
        </View>

        <View style={[styles.statItem, styles.statItemFullWidth]}>
          <Text style={[styles.statValue, { color: getThetaColor(stats.averageTheta) }]}>
            {formatTheta(stats.averageTheta)}
          </Text>
          <Text style={styles.statLabel}>Avg Theta</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  statItemFullWidth: {
    width: '100%',
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});

export default TodaySummaryWidget;
