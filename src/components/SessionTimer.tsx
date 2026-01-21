import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

/**
 * Props for SessionTimer component
 */
export interface SessionTimerProps {
  /** Display size variant */
  size?: 'compact' | 'large';
  /** Show remaining time instead of total time */
  showRemaining?: boolean;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Formats seconds into MM:SS display format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(Math.max(0, seconds) / 60);
  const secs = Math.floor(Math.max(0, seconds)) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculates progress percentage (0-100)
 */
export const calculateProgress = (
  elapsed: number,
  total: number
): number => {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
};

/**
 * Returns color based on progress percentage
 */
const getProgressColor = (progress: number): string => {
  if (progress >= 100) return Colors.accent.success;
  if (progress >= 75) return Colors.status.green;
  if (progress >= 50) return Colors.status.yellow;
  if (progress >= 25) return Colors.primary.main;
  return Colors.primary.muted;
};

/**
 * SessionTimer - Displays elapsed and total session time
 *
 * Shows:
 * - Elapsed time in MM:SS format
 * - Total session duration
 * - Visual progress indicator
 * - Optional remaining time display
 *
 * Uses session context to access elapsed time and session configuration.
 */
export const SessionTimer: React.FC<SessionTimerProps> = ({
  size = 'large',
  showRemaining = false,
  testID = 'session-timer',
}) => {
  const { elapsedSeconds, sessionConfig, sessionState } = useSession();

  const totalSeconds = useMemo(() => {
    return sessionConfig ? sessionConfig.duration_minutes * 60 : 0;
  }, [sessionConfig]);

  const remainingSeconds = useMemo(() => {
    return Math.max(0, totalSeconds - elapsedSeconds);
  }, [totalSeconds, elapsedSeconds]);

  const progress = useMemo(() => {
    return calculateProgress(elapsedSeconds, totalSeconds);
  }, [elapsedSeconds, totalSeconds]);

  const progressColor = useMemo(() => {
    return getProgressColor(progress);
  }, [progress]);

  const isCompact = size === 'compact';
  const isActive = sessionState === 'running' || sessionState === 'paused';

  return (
    <View
      style={[styles.container, isCompact && styles.containerCompact]}
      testID={testID}
      accessibilityRole="timer"
      accessibilityLabel={`Session timer: ${formatTime(elapsedSeconds)} elapsed of ${formatTime(totalSeconds)} total`}
    >
      {/* Progress Bar */}
      <View style={[styles.progressBar, isCompact && styles.progressBarCompact]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress}%`, backgroundColor: progressColor },
          ]}
          testID={`${testID}-progress`}
        />
      </View>

      {/* Time Display */}
      <View style={styles.timeContainer}>
        {/* Elapsed Time */}
        <View style={styles.timeBlock}>
          <Text
            style={[
              styles.timeLabel,
              isCompact && styles.timeLabelCompact,
            ]}
          >
            Elapsed
          </Text>
          <Text
            style={[
              styles.timeValue,
              isCompact && styles.timeValueCompact,
              isActive && { color: progressColor },
            ]}
            testID={`${testID}-elapsed`}
          >
            {formatTime(elapsedSeconds)}
          </Text>
        </View>

        {/* Divider */}
        <View style={[styles.divider, isCompact && styles.dividerCompact]} />

        {/* Total or Remaining Time */}
        <View style={styles.timeBlock}>
          <Text
            style={[
              styles.timeLabel,
              isCompact && styles.timeLabelCompact,
            ]}
          >
            {showRemaining ? 'Remaining' : 'Total'}
          </Text>
          <Text
            style={[
              styles.timeValue,
              isCompact && styles.timeValueCompact,
              styles.timeValueSecondary,
            ]}
            testID={`${testID}-total`}
          >
            {showRemaining ? formatTime(remainingSeconds) : formatTime(totalSeconds)}
          </Text>
        </View>
      </View>

      {/* Progress Percentage */}
      {!isCompact && (
        <Text
          style={[styles.progressText, { color: progressColor }]}
          testID={`${testID}-percentage`}
        >
          {Math.round(progress)}% complete
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  containerCompact: {
    padding: Spacing.sm,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.round,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  progressBarCompact: {
    height: 4,
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.round,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  timeBlock: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  timeLabelCompact: {
    fontSize: Typography.fontSize.xs,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  timeValueCompact: {
    fontSize: Typography.fontSize.xl,
  },
  timeValueSecondary: {
    color: Colors.text.secondary,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.border.secondary,
    marginHorizontal: Spacing.sm,
  },
  dividerCompact: {
    height: 30,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textAlign: 'center',
    marginTop: Spacing.sm,
  },
});

export default SessionTimer;
