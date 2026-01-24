import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { Session } from '../types';

/**
 * Props for ThetaTrendWidget
 */
export interface ThetaTrendWidgetProps {
  /** Maximum number of sessions to display in the sparkline */
  maxDataPoints?: number;
  /** Height of the widget */
  height?: number;
  /** Whether to show stats below the chart */
  showStats?: boolean;
  /** Title to display above the chart */
  title?: string;
}

/**
 * Statistics calculated from theta data
 */
interface ThetaStats {
  min: number;
  max: number;
  avg: number;
  latest: number | null;
  trend: 'up' | 'down' | 'stable';
}

/**
 * Get color based on theta z-score value
 * Uses the theta zone color gradient
 */
const getZScoreColor = (zscore: number): string => {
  if (zscore < 0) return Colors.status.red;
  if (zscore < 0.5) return Colors.status.yellow;
  if (zscore < 1.5) return Colors.status.green;
  return Colors.status.blue;
};

/**
 * Calculate statistics from session data
 */
const calculateStats = (sessions: Session[]): ThetaStats | null => {
  if (sessions.length === 0) return null;

  const zscores = sessions.map((s) => s.avg_theta_zscore);
  const min = Math.min(...zscores);
  const max = Math.max(...zscores);
  const avg = zscores.reduce((sum, val) => sum + val, 0) / zscores.length;
  const latest = sessions[0]?.avg_theta_zscore ?? null;

  // Calculate trend based on recent sessions
  let trend: 'up' | 'down' | 'stable' = 'stable';
  if (sessions.length >= 3) {
    const recentAvg =
      sessions.slice(0, 3).reduce((sum, s) => sum + s.avg_theta_zscore, 0) / 3;
    const olderAvg =
      sessions.slice(-3).reduce((sum, s) => sum + s.avg_theta_zscore, 0) / 3;
    const diff = recentAvg - olderAvg;
    if (diff > 0.2) trend = 'up';
    else if (diff < -0.2) trend = 'down';
  }

  return { min, max, avg, latest, trend };
};

/**
 * Get trend indicator symbol
 */
const getTrendIndicator = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return '↑';
    case 'down':
      return '↓';
    default:
      return '→';
  }
};

/**
 * Get trend color
 */
const getTrendColor = (trend: 'up' | 'down' | 'stable'): string => {
  switch (trend) {
    case 'up':
      return Colors.status.green;
    case 'down':
      return Colors.status.red;
    default:
      return Colors.text.secondary;
  }
};

/**
 * ThetaTrendWidget
 *
 * Displays a compact sparkline chart showing recent theta z-score trends
 * from completed sessions. Includes optional statistics display.
 */
export const ThetaTrendWidget: React.FC<ThetaTrendWidgetProps> = ({
  maxDataPoints = 10,
  height = 120,
  showStats = true,
  title = 'Theta Trend',
}) => {
  const { recentSessions } = useSession();

  // Prepare data for sparkline - reverse to show oldest to newest left-to-right
  const chartData = useMemo(() => {
    const sessions = recentSessions.slice(0, maxDataPoints).reverse();
    const data = sessions.map((session) => session.avg_theta_zscore);
    const labels = sessions.map((_, index) => (index + 1).toString());
    return { data, labels };
  }, [recentSessions, maxDataPoints]);

  // Calculate statistics
  const stats = useMemo(
    () => calculateStats(recentSessions.slice(0, maxDataPoints)),
    [recentSessions, maxDataPoints]
  );

  // Get color for the latest value
  const lineColor = useMemo(() => {
    if (stats?.latest !== null && stats?.latest !== undefined) {
      return getZScoreColor(stats.latest);
    }
    return Colors.chart.line1;
  }, [stats]);

  const chartWidth =
    Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md * 2;
  const chartHeight = showStats ? height - 40 : height;

  // Empty state
  if (chartData.data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.emptyState, { height: chartHeight }]}>
          <Text style={styles.emptyText}>No session data yet</Text>
          <Text style={styles.emptySubtext}>
            Complete sessions to see your theta trend
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {stats && (
          <View style={styles.trendBadge}>
            <Text
              style={[styles.trendText, { color: getTrendColor(stats.trend) }]}
            >
              {getTrendIndicator(stats.trend)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: [],
            datasets: [{ data: chartData.data }],
          }}
          width={chartWidth}
          height={chartHeight}
          chartConfig={{
            backgroundColor: Colors.surface.primary,
            backgroundGradientFrom: Colors.surface.primary,
            backgroundGradientTo: Colors.surface.primary,
            decimalPlaces: 2,
            color: () => lineColor,
            labelColor: () => Colors.text.tertiary,
            strokeWidth: 2,
            propsForBackgroundLines: {
              strokeWidth: 0,
            },
            fillShadowGradientFrom: lineColor,
            fillShadowGradientTo: Colors.surface.primary,
            fillShadowGradientFromOpacity: 0.2,
            fillShadowGradientToOpacity: 0,
          }}
          bezier
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withHorizontalLabels={false}
          withVerticalLabels={false}
          style={{ borderRadius: BorderRadius.md }}
        />
      </View>

      {showStats && stats && (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Min</Text>
            <Text
              style={[styles.statValue, { color: getZScoreColor(stats.min) }]}
            >
              {stats.min.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Avg</Text>
            <Text
              style={[styles.statValue, { color: getZScoreColor(stats.avg) }]}
            >
              {stats.avg.toFixed(2)}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Max</Text>
            <Text
              style={[styles.statValue, { color: getZScoreColor(stats.max) }]}
            >
              {stats.max.toFixed(2)}
            </Text>
          </View>
          {stats.latest !== null && (
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Latest</Text>
              <Text
                style={[
                  styles.statValue,
                  { color: getZScoreColor(stats.latest) },
                ]}
              >
                {stats.latest.toFixed(2)}
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  trendBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
  },
  trendText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs / 2,
  },
  statValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default ThetaTrendWidget;
