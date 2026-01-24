import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

/**
 * Data point for time series chart
 */
export interface TimeSeriesDataPoint {
  /** Timestamp in seconds from session start */
  x: number;
  /** Theta z-score value */
  y: number;
}

/**
 * Time window options for chart display
 */
export type TimeWindowMinutes = 1 | 2 | 3 | 5;

/**
 * Props for ThetaTimeSeriesChart
 */
export interface ThetaTimeSeriesChartProps {
  /** Height of the chart in pixels */
  height?: number;
  /** Time window to display in minutes (1-5) */
  timeWindowMinutes?: TimeWindowMinutes;
  /** Whether to show time window selector buttons */
  showTimeSelector?: boolean;
  /** Whether to show current value indicator */
  showCurrentValue?: boolean;
  /** Whether to show zone reference lines */
  showZoneLines?: boolean;
  /** Custom title for the chart */
  title?: string;
  /** Update interval in milliseconds (default: 500ms) */
  updateInterval?: number;
  /** Callback when time window changes */
  onTimeWindowChange?: (minutes: TimeWindowMinutes) => void;
  /** Optional externally provided theta z-score (overrides SessionContext) */
  externalThetaZScore?: number | null;
  /** Optional externally provided elapsed seconds (overrides SessionContext) */
  externalElapsedSeconds?: number;
  /** Optional externally provided running state (overrides SessionContext) */
  externalIsRunning?: boolean;
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
 * Get zone name based on z-score
 */
const getZoneName = (zscore: number): string => {
  if (zscore < 0) return 'Below Target';
  if (zscore < 0.5) return 'Approaching';
  if (zscore < 1.5) return 'Target';
  return 'Optimal';
};

/**
 * Format seconds as MM:SS
 */
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * ThetaTimeSeriesChart
 *
 * A real-time scrolling line chart that displays theta z-score values
 * over the last 1-5 minutes of an active session. Features:
 * - Smooth scrolling as time progresses
 * - Color-coded line based on theta zone
 * - Optional zone reference lines
 * - Time window selector (1, 2, 3, or 5 minutes)
 * - Current value indicator
 */
export const ThetaTimeSeriesChart: React.FC<ThetaTimeSeriesChartProps> = ({
  height = 200,
  timeWindowMinutes = 1,
  showTimeSelector = true,
  showCurrentValue = true,
  showZoneLines: _showZoneLines = true,
  title = 'Theta Z-Score',
  updateInterval = 500,
  onTimeWindowChange,
  externalThetaZScore,
  externalElapsedSeconds,
  externalIsRunning,
}) => {
  const sessionContext = useSession();

  // Use external props if provided, otherwise fall back to SessionContext
  const currentThetaZScore =
    externalThetaZScore !== undefined
      ? externalThetaZScore
      : sessionContext.currentThetaZScore;
  const elapsedSeconds =
    externalElapsedSeconds !== undefined
      ? externalElapsedSeconds
      : sessionContext.elapsedSeconds;
  const isRunning =
    externalIsRunning !== undefined
      ? externalIsRunning
      : sessionContext.sessionState === 'running';

  // Derive sessionState for internal use
  const sessionState = isRunning ? 'running' : 'idle';

  // Internal state for time window selection
  const [selectedWindow, setSelectedWindow] =
    useState<TimeWindowMinutes>(timeWindowMinutes);

  // Data buffer to store time series points
  const [dataPoints, setDataPoints] = useState<TimeSeriesDataPoint[]>([]);

  // Track the last update time to throttle updates
  const lastUpdateRef = useRef<number>(0);

  // Track if component is mounted
  const isMountedRef = useRef<boolean>(true);

  // Maximum data points to keep (enough for 5 minutes at 2Hz = 600 points)
  const maxDataPoints = 600;

  // Time window in seconds
  const timeWindowSeconds = selectedWindow * 60;

  // Handle time window change
  const handleTimeWindowChange = useCallback(
    (minutes: TimeWindowMinutes) => {
      setSelectedWindow(minutes);
      onTimeWindowChange?.(minutes);
    },
    [onTimeWindowChange]
  );

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Collect data points when theta z-score updates
  useEffect(() => {
    if (sessionState !== 'running' || currentThetaZScore === null) {
      return;
    }

    const now = Date.now();

    // Throttle updates based on updateInterval
    if (now - lastUpdateRef.current < updateInterval) {
      return;
    }

    lastUpdateRef.current = now;

    // Add new data point
    const newPoint: TimeSeriesDataPoint = {
      x: elapsedSeconds,
      y: currentThetaZScore,
    };

    setDataPoints((prevPoints) => {
      const updatedPoints = [...prevPoints, newPoint];
      // Trim to max data points
      if (updatedPoints.length > maxDataPoints) {
        return updatedPoints.slice(-maxDataPoints);
      }
      return updatedPoints;
    });
  }, [currentThetaZScore, elapsedSeconds, sessionState, updateInterval]);

  // Reset data when session resets
  useEffect(() => {
    if (sessionState === 'idle') {
      setDataPoints([]);
    }
  }, [sessionState]);

  // Filter data points to the selected time window
  const visibleData = useMemo(() => {
    if (dataPoints.length === 0) return [];

    const windowStart = Math.max(0, elapsedSeconds - timeWindowSeconds);
    return dataPoints.filter((point) => point.x >= windowStart);
  }, [dataPoints, elapsedSeconds, timeWindowSeconds]);

  // Get line color based on current z-score
  const lineColor = useMemo(() => {
    if (currentThetaZScore !== null) {
      return getZScoreColor(currentThetaZScore);
    }
    return Colors.chart.line1;
  }, [currentThetaZScore]);

  // Calculate chart dimensions
  const chartWidth =
    Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md * 2;
  const chartHeight =
    height - (showTimeSelector ? 50 : 0) - (showCurrentValue ? 30 : 0);

  // Time window options
  const timeWindows: TimeWindowMinutes[] = [1, 2, 3, 5];

  // Generate time labels for x-axis
  const generateLabels = useMemo(() => {
    if (visibleData.length === 0) return ['0:00'];
    const firstTime = visibleData[0]?.x ?? 0;
    const lastTime = visibleData[visibleData.length - 1]?.x ?? 0;
    const step = (lastTime - firstTime) / 4;
    return Array.from({ length: 5 }, (_, i) =>
      formatTime(Math.round(firstTime + step * i))
    );
  }, [visibleData]);

  // Prepare chart data - ensure at least 2 points for LineChart
  const chartData = useMemo(() => {
    const data = visibleData.map((d) => d.y);
    // LineChart needs at least 2 data points
    if (data.length < 2) {
      return data.length === 1 ? [data[0], data[0]] : [0, 0];
    }
    return data;
  }, [visibleData]);

  // Empty state
  if (sessionState !== 'running' && visibleData.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.emptyState, { height: chartHeight }]}>
          <Text style={styles.emptyText}>No active session</Text>
          <Text style={styles.emptySubtext}>
            Start a session to see real-time theta data
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showCurrentValue && currentThetaZScore !== null && (
          <View style={styles.currentValueContainer}>
            <Text style={[styles.currentValue, { color: lineColor }]}>
              {currentThetaZScore.toFixed(2)}
            </Text>
            <Text style={[styles.zoneBadge, { backgroundColor: lineColor }]}>
              {getZoneName(currentThetaZScore)}
            </Text>
          </View>
        )}
      </View>

      {/* Chart */}
      <View style={styles.chartContainer}>
        <LineChart
          data={{
            labels: generateLabels,
            datasets: [{ data: chartData }],
          }}
          width={chartWidth}
          height={chartHeight}
          chartConfig={{
            backgroundColor: Colors.surface.primary,
            backgroundGradientFrom: Colors.surface.primary,
            backgroundGradientTo: Colors.surface.primary,
            decimalPlaces: 1,
            color: () => lineColor,
            labelColor: () => Colors.text.tertiary,
            strokeWidth: 2.5,
            propsForBackgroundLines: {
              stroke: Colors.chart.grid,
              strokeDasharray: '4,4',
              strokeWidth: 1,
            },
            propsForLabels: {
              fontSize: Typography.fontSize.xs,
            },
            fillShadowGradientFrom: lineColor,
            fillShadowGradientTo: Colors.surface.primary,
            fillShadowGradientFromOpacity: 0.15,
            fillShadowGradientToOpacity: 0,
          }}
          bezier
          withDots={visibleData.length < 30}
          withInnerLines={true}
          withOuterLines={true}
          withHorizontalLabels={true}
          withVerticalLabels={true}
          fromZero={false}
          style={{ borderRadius: BorderRadius.md }}
        />
      </View>

      {/* Time window selector */}
      {showTimeSelector && (
        <View style={styles.timeSelectorContainer}>
          <Text style={styles.timeSelectorLabel}>Time Window:</Text>
          <View style={styles.timeSelectorButtons}>
            {timeWindows.map((minutes) => (
              <TouchableOpacity
                key={minutes}
                style={[
                  styles.timeButton,
                  selectedWindow === minutes && styles.timeButtonSelected,
                ]}
                onPress={() => handleTimeWindowChange(minutes)}
              >
                <Text
                  style={[
                    styles.timeButtonText,
                    selectedWindow === minutes && styles.timeButtonTextSelected,
                  ]}
                >
                  {minutes}m
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  currentValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  currentValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  zoneBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.inverse,
    overflow: 'hidden',
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
  timeSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  timeSelectorLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginRight: Spacing.sm,
  },
  timeSelectorButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  timeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  timeButtonSelected: {
    backgroundColor: Colors.primary.main,
    borderColor: Colors.primary.main,
  },
  timeButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  timeButtonTextSelected: {
    color: Colors.text.primary,
  },
});

export default ThetaTimeSeriesChart;
