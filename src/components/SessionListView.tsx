import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import type { Session } from '../types';

/**
 * Props for the SessionListView component
 */
export interface SessionListViewProps {
  /**
   * Optional custom sessions array to use instead of context data.
   * Useful for testing or when sessions are passed from a parent component.
   */
  sessions?: Session[];

  /**
   * Callback when a session is pressed
   */
  onSessionPress?: (session: Session) => void;

  /**
   * Whether to show the refresh control
   * @default true
   */
  showRefreshControl?: boolean;

  /**
   * Optional test ID for testing
   */
  testID?: string;

  /**
   * Maximum number of sessions to display
   * @default undefined (show all)
   */
  maxItems?: number;

  /**
   * Whether the list is loading
   */
  isLoading?: boolean;
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
 */
export const getThetaColor = (zscore: number): string => {
  if (zscore >= 1.0) return Colors.status.blue;
  if (zscore >= 0.5) return Colors.status.green;
  if (zscore >= 0) return Colors.status.yellow;
  return Colors.status.red;
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

  return `${typeLabel} session on ${dateLabel} at ${timeLabel}. Duration: ${durationLabel}. Average theta z-score: ${thetaLabel}`;
};

/**
 * Checks if two timestamps are on the same day
 */
export const isSameDay = (timestamp1: number, timestamp2: number): boolean => {
  const date1 = new Date(timestamp1);
  const date2 = new Date(timestamp2);
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

/**
 * Gets a relative date label (Today, Yesterday, or date)
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
 * Gets star rating display for subjective rating
 */
export const getStarRating = (rating: number | null): string => {
  if (rating === null) return '';
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  return stars;
};

/**
 * Empty state component
 */
const EmptyState: React.FC<{ testID?: string }> = ({ testID }) => (
  <View style={styles.emptyContainer} testID={testID}>
    <Text style={styles.emptyIcon}>📋</Text>
    <Text style={styles.emptyTitle}>No Sessions Yet</Text>
    <Text style={styles.emptyMessage}>
      Complete your first session to see your history here.
    </Text>
  </View>
);

/**
 * Session list item component
 */
const SessionListItem: React.FC<{
  session: Session;
  onPress?: (session: Session) => void;
  showDateHeader: boolean;
  testID?: string;
}> = ({ session, onPress, showDateHeader, testID }) => {
  const handlePress = useCallback(() => {
    onPress?.(session);
  }, [onPress, session]);

  const accessibilityLabel = getSessionAccessibilityLabel(session);
  const badgeColor = getSessionTypeBadgeColor(session.session_type);
  const thetaColor = getThetaColor(session.avg_theta_zscore);

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
        style={styles.itemContainer}
        onPress={handlePress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint="Double tap to view session details"
        testID={`${testID}-touchable`}
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
              <Text style={styles.statValue}>
                {formatSessionDuration(session.duration_seconds)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Avg Theta</Text>
              <Text style={[styles.statValue, { color: thetaColor }]}>
                {formatThetaZScore(session.avg_theta_zscore)}
              </Text>
            </View>

            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Frequency</Text>
              <Text style={styles.statValue}>
                {session.entrainment_freq.toFixed(1)} Hz
              </Text>
            </View>
          </View>

          {session.subjective_rating !== null && (
            <View style={styles.ratingRow}>
              <Text style={styles.ratingStars}>
                {getStarRating(session.subjective_rating)}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

/**
 * SessionListView Component
 *
 * Displays a scrollable list of sessions ordered by start time (newest first).
 * Includes:
 * - Session type badges with color coding
 * - Duration and theta z-score display
 * - Entrainment frequency
 * - Subjective rating stars
 * - Date headers for grouping
 * - Pull-to-refresh functionality
 * - Empty state when no sessions exist
 *
 * Uses the SessionContext by default but can accept sessions prop for testing.
 */
export const SessionListView: React.FC<SessionListViewProps> = ({
  sessions: propSessions,
  onSessionPress,
  showRefreshControl = true,
  testID = 'session-list-view',
  maxItems,
  isLoading: propIsLoading,
}) => {
  const { recentSessions, isRefreshing, refreshRecentSessions } = useSession();

  // Use prop sessions if provided, otherwise use context
  const allSessions = propSessions ?? recentSessions;

  // Apply maxItems limit if specified
  const sessions = useMemo(() => {
    if (maxItems !== undefined && maxItems > 0) {
      return allSessions.slice(0, maxItems);
    }
    return allSessions;
  }, [allSessions, maxItems]);

  // Determine loading state
  const isLoading = propIsLoading ?? isRefreshing;

  // Handle refresh
  const handleRefresh = useCallback(() => {
    refreshRecentSessions();
  }, [refreshRecentSessions]);

  // Render individual session item
  const renderItem = useCallback(
    ({ item, index }: ListRenderItemInfo<Session>) => {
      // Show date header if this is the first item or different day from previous
      const showDateHeader =
        index === 0 ||
        !isSameDay(item.start_time, sessions[index - 1].start_time);

      return (
        <SessionListItem
          session={item}
          onPress={onSessionPress}
          showDateHeader={showDateHeader}
          testID={`${testID}-item-${index}`}
        />
      );
    },
    [onSessionPress, sessions, testID]
  );

  // Extract key from session
  const keyExtractor = useCallback(
    (item: Session, index: number) => `session-${item.id ?? index}`,
    []
  );

  // List header component (optional)
  const ListHeaderComponent = useMemo(
    () => (
      <View style={styles.listHeader}>
        <Text style={styles.listHeaderText}>
          {sessions.length} {sessions.length === 1 ? 'Session' : 'Sessions'}
        </Text>
      </View>
    ),
    [sessions.length]
  );

  // Empty component
  const ListEmptyComponent = useMemo(
    () => <EmptyState testID={`${testID}-empty`} />,
    [testID]
  );

  // Refresh control
  const refreshControl = useMemo(
    () =>
      showRefreshControl ? (
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={Colors.primary.main}
          colors={[Colors.primary.main]}
          testID={`${testID}-refresh-control`}
        />
      ) : undefined,
    [showRefreshControl, isLoading, handleRefresh, testID]
  );

  return (
    <View style={styles.container} testID={testID}>
      <FlatList
        data={sessions}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={sessions.length > 0 ? ListHeaderComponent : null}
        ListEmptyComponent={ListEmptyComponent}
        refreshControl={refreshControl}
        contentContainerStyle={
          sessions.length === 0 ? styles.emptyListContent : styles.listContent
        }
        showsVerticalScrollIndicator={true}
        testID={`${testID}-flatlist`}
        accessibilityRole="list"
        accessibilityLabel="Session history list"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  listContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  emptyListContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  listHeader: {
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  listHeaderText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
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
  ratingRow: {
    marginTop: Spacing.sm,
    alignItems: 'center',
  },
  ratingStars: {
    color: Colors.status.yellow,
    fontSize: Typography.fontSize.md,
    letterSpacing: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: Spacing.sm,
  },
  emptyMessage: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
  },
});

export default SessionListView;
