import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ListRenderItemInfo,
} from 'react-native';
import { useSession } from '../contexts';
import { Colors, Spacing, Typography } from '../constants/theme';
import type { Session } from '../types';
import { SessionListItem } from './SessionListItem';

// Re-export utilities from SessionListItem for backward compatibility
export {
  SESSION_TYPE_LABELS,
  SESSION_TYPE_COLORS,
  getSessionTypeLabel,
  getSessionTypeBadgeColor,
  formatSessionDuration,
  formatSessionDate,
  formatSessionTime,
  formatThetaZScore,
  getThetaColor,
  getSessionAccessibilityLabel,
  getRelativeDateLabel,
  getStarRating,
} from './SessionListItem';

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
