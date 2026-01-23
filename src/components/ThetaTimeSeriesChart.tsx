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
import {
  VictoryLine,
  VictoryChart,
  VictoryAxis,
  VictoryArea,
  VictoryScatter,
} from 'victory-native';
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
  showZoneLines = true,
  title = 'Theta Z-Score',
  updateInterval = 500,
  onTimeWindowChange,
}) => {
  const { currentThetaZScore, elapsedSeconds, sessionState } = useSession();

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

  // Calculate chart domain
  const domain = useMemo(() => {
    const xMin = Math.max(0, elapsedSeconds - timeWindowSeconds);
    const xMax = Math.max(timeWindowSeconds, elapsedSeconds);

    // Y domain with padding
    let yMin = -1;
    let yMax = 2;

    if (visibleData.length > 0) {
      const values = visibleData.map((d) => d.y);
      yMin = Math.min(...values, -0.5);
      yMax = Math.max(...values, 1.5);
      const padding = Math.max((yMax - yMin) * 0.15, 0.5);
      yMin -= padding;
      yMax += padding;
    }

    return {
      x: [xMin, xMax] as [number, number],
      y: [yMin, yMax] as [number, number],
    };
  }, [elapsedSeconds, timeWindowSeconds, visibleData]);

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

  // Generate X-axis tick values (show 5 ticks)
  const xTickValues = useMemo(() => {
    const [xMin, xMax] = domain.x;
    const tickCount = 5;
    const step = (xMax - xMin) / (tickCount - 1);
    return Array.from({ length: tickCount }, (_, i) =>
      Math.round(xMin + step * i)
    );
  }, [domain.x]);

  // Zone line data
  const zoneLines = useMemo(() => {
    if (!showZoneLines) return [];
    return [
      { y: 0, color: Colors.status.yellow, label: '0' },
      { y: 0.5, color: Colors.status.green, label: '0.5' },
      { y: 1.5, color: Colors.status.blue, label: '1.5' },
    ];
  }, [showZoneLines]);

  // Time window options
  const timeWindows: TimeWindowMinutes[] = [1, 2, 3, 5];

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
        <VictoryChart
          width={chartWidth}
          height={chartHeight}
          padding={{ top: 20, bottom: 35, left: 45, right: 20 }}
          domain={domain}
        >
          {/* X Axis - Time */}
          <VictoryAxis
            tickValues={xTickValues}
            tickFormat={(t: number) => formatTime(t)}
            style={{
              axis: { stroke: Colors.chart.grid },
              ticks: { stroke: Colors.chart.grid, size: 5 },
              tickLabels: {
                fill: Colors.text.tertiary,
                fontSize: Typography.fontSize.xs,
              },
              grid: { stroke: Colors.chart.grid, strokeDasharray: '4,4' },
            }}
          />

          {/* Y Axis - Z-Score */}
          <VictoryAxis
            dependentAxis
            style={{
              axis: { stroke: Colors.chart.grid },
              ticks: { stroke: Colors.chart.grid, size: 5 },
              tickLabels: {
                fill: Colors.text.tertiary,
                fontSize: Typography.fontSize.xs,
              },
              grid: { stroke: Colors.chart.grid, strokeDasharray: '4,4' },
            }}
          />

          {/* Zone reference lines */}
          {zoneLines.map((zone) => (
            <VictoryLine
              key={zone.y}
              data={[
                { x: domain.x[0], y: zone.y },
                { x: domain.x[1], y: zone.y },
              ]}
              style={{
                data: {
                  stroke: zone.color,
                  strokeWidth: 1,
                  strokeDasharray: '8,4',
                  strokeOpacity: 0.5,
                },
              }}
            />
          ))}

          {/* Area fill under the line */}
          {visibleData.length > 0 && (
            <VictoryArea
              data={visibleData}
              interpolation="monotoneX"
              style={{
                data: {
                  fill: lineColor,
                  fillOpacity: 0.15,
                },
              }}
            />
          )}

          {/* Main data line */}
          {visibleData.length > 0 && (
            <VictoryLine
              data={visibleData}
              interpolation="monotoneX"
              style={{
                data: {
                  stroke: lineColor,
                  strokeWidth: 2.5,
                },
              }}
            />
          )}

          {/* Current value indicator dot */}
          {visibleData.length > 0 && (
            <VictoryScatter
              data={[visibleData[visibleData.length - 1]]}
              size={6}
              style={{
                data: {
                  fill: lineColor,
                  stroke: Colors.surface.primary,
                  strokeWidth: 2,
                },
              }}
            />
          )}
        </VictoryChart>
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
