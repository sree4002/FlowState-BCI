import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import type { Session } from '../types';

/**
 * Props for the SessionListItem component
 */
export interface SessionListItemProps {
  /**
   * The session data to display
   */
  session: Session;

  /**
   * Callback when the item is pressed
   */
  onPress?: (session: Session) => void;

  /**
   * Whether to show the date header above this item
   * @default false
   */
  showDateHeader?: boolean;

  /**
   * Optional test ID for testing
   */
  testID?: string;

  /**
   * Whether the item is compact (smaller padding and font sizes)
   * @default false
   */
  compact?: boolean;
}

/**
 * Session type labels for display
 */
export const SESSION_TYPE_LABELS: Record<Session['session_type'], string> = {
  calibration: 'Calibration',
  quick_boost: 'Quick Boost',
  custom: 'Custom',
  scheduled: 'Scheduled',
  sham: 'A/B Test',
  game_session: 'Game Session',
};

/**
 * Session type colors for badges
 */
export const SESSION_TYPE_COLORS: Record<Session['session_type'], string> = {
  calibration: Colors.secondary.main,
  quick_boost: Colors.accent.success,
  custom: Colors.primary.main,
  scheduled: Colors.accent.info,
  sham: Colors.text.tertiary,
  game_session: Colors.accent.warning,
};

/**
 * Gets the display label for a session type
 */
export const getSessionTypeLabel = (
  sessionType: Session['session_type']
): string => {
  return SESSION_TYPE_LABELS[sessionType] || sessionType;
};

/**
 * Gets the badge color for a session type
 */
export const getSessionTypeBadgeColor = (
  sessionType: Session['session_type']
): string => {
  return SESSION_TYPE_COLORS[sessionType] || Colors.text.tertiary;
};

/**
 * Formats duration in seconds to a human-readable string
 */
export const formatSessionDuration = (seconds: number): string => {
  if (seconds === 0) return '0m';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
  if (minutes > 0) {
    return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
  }
  return `${secs}s`;
};

/**
 * Formats a timestamp to a date string (e.g., "Jan 15, 2026")
 */
export const formatSessionDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Formats a timestamp to a time string (e.g., "2:30 PM")
 */
export const formatSessionTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats the theta z-score for display
 */
export const formatThetaZScore = (zscore: number): string => {
  const sign = zscore >= 0 ? '+' : '';
  return `${sign}${zscore.toFixed(2)}`;
};

/**
 * Gets the color for a theta z-score value
 * - Blue (≥1.0): Excellent theta elevation
 * - Green (≥0.5): Good theta elevation
 * - Yellow (≥0): Neutral/baseline
 * - Red (<0): Below baseline
 */
export const getThetaColor = (zscore: number): string => {
  if (zscore >= 1.0) return Colors.status.blue;
  if (zscore >= 0.5) return Colors.status.green;
  if (zscore >= 0) return Colors.status.yellow;
  return Colors.status.red;
};

/**
 * Gets star rating display for subjective rating (1-5 scale)
 */
export const getStarRating = (rating: number | null): string => {
  if (rating === null) return '';
  const clampedRating = Math.max(1, Math.min(5, Math.round(rating)));
  const stars = '★'.repeat(clampedRating) + '☆'.repeat(5 - clampedRating);
  return stars;
};

/**
 * Gets a relative date label (Today, Yesterday, or formatted date)
 */
export const getRelativeDateLabel = (timestamp: number): string => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStart = yesterday.getTime();

  if (timestamp >= todayStart) {
    return 'Today';
  }
  if (timestamp >= yesterdayStart) {
    return 'Yesterday';
  }
  return formatSessionDate(timestamp);
};

/**
 * Gets the accessibility label for a session item
 */
export const getSessionAccessibilityLabel = (session: Session): string => {
  const typeLabel = getSessionTypeLabel(session.session_type);
  const dateLabel = formatSessionDate(session.start_time);
  const timeLabel = formatSessionTime(session.start_time);
  const durationLabel = formatSessionDuration(session.duration_seconds);
  const thetaLabel = formatThetaZScore(session.avg_theta_zscore);
  const freqLabel = `${session.entrainment_freq.toFixed(1)} hertz`;
  const ratingLabel =
    session.subjective_rating !== null
      ? `. Rating: ${session.subjective_rating} out of 5 stars`
      : '';

  return `${typeLabel} session on ${dateLabel} at ${timeLabel}. Duration: ${durationLabel}. Average theta z-score: ${thetaLabel}. Frequency: ${freqLabel}${ratingLabel}`;
};

/**
 * SessionListItem Component
 *
 * Displays a single session item with:
 * - Session type badge with color coding
 * - Date (with optional date header)
 * - Duration
 * - Average theta z-score with color coding
 * - Entrainment frequency
 * - Subjective rating (if available)
 *
 * @example
 * ```tsx
 * <SessionListItem
 *   session={mySession}
 *   onPress={(session) => navigateToDetails(session.id)}
 *   showDateHeader={true}
 * />
 * ```
 */
export const SessionListItem: React.FC<SessionListItemProps> = ({
  session,
  onPress,
  showDateHeader = false,
  testID = 'session-list-item',
  compact = false,
}) => {
  const handlePress = useCallback(() => {
    onPress?.(session);
  }, [onPress, session]);

  const accessibilityLabel = getSessionAccessibilityLabel(session);
  const badgeColor = getSessionTypeBadgeColor(session.session_type);
  const thetaColor = getThetaColor(session.avg_theta_zscore);

  const containerStyle = compact
    ? styles.itemContainerCompact
    : styles.itemContainer;
  const statValueStyle = compact
    ? [styles.statValue, styles.statValueCompact]
    : styles.statValue;

  return (
    <View testID={testID}>
      {showDateHeader && (
        <Text
          style={styles.dateHeader}
          testID={`${testID}-date-header`}
          accessibilityRole="header"
        >
          {getRelativeDateLabel(session.start_time)}
        </Text>
      )}
      <TouchableOpacity
        style={containerStyle}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to view session details"
        testID={`${testID}-touchable`}
        disabled={!onPress}
      >
        <View style={styles.itemHeader}>
          <View style={[styles.typeBadge, { backgroundColor: badgeColor }]}>
            <Text style={styles.typeBadgeText}>
              {getSessionTypeLabel(session.session_type)}
            </Text>
          </View>
          <Text style={styles.timeText}>
            {formatSessionTime(session.start_time)}
          </Text>
        </View>

        <View style={styles.itemContent}>
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Duration</Text>
              <Text style={statValueStyle} testID={`${testID}-duration`}>
                {formatSessionDuration(session.duration_seconds)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Theta</Text>
              <Text
                style={[statValueStyle, { color: thetaColor }]}
                testID={`${testID}-theta`}
              >
                {formatThetaZScore(session.avg_theta_zscore)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Frequency</Text>
              <Text style={statValueStyle} testID={`${testID}-frequency`}>
                {session.entrainment_freq.toFixed(1)} Hz
              </Text>
            </View>
          </View>

          {session.subjective_rating !== null && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars} testID={`${testID}-rating`}>
                {getStarRating(session.subjective_rating)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  dateHeader: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  itemContainer: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  itemContainerCompact: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
    ...Shadows.sm,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  typeBadgeText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  timeText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  itemContent: {
    marginTop: Spacing.xs,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
    marginBottom: Spacing.xs,
  },
  statValue: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  statValueCompact: {
    fontSize: Typography.fontSize.md,
  },
  ratingRow: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  ratingStars: {
    color: Colors.status.yellow,
    fontSize: Typography.fontSize.md,
    letterSpacing: 2,
  },
});

export default SessionListItem;
