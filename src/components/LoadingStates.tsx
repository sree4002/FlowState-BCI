/**
 * FlowState BCI - Loading States and Skeleton Screens
 *
 * Provides loading indicators and skeleton placeholders
 * for better perceived performance during data loading.
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Animated,
  Easing,
  ViewStyle,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from '../constants/theme';

/**
 * Props for LoadingSpinner
 */
export interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: 'small' | 'large';
  /** Color of the spinner */
  color?: string;
  /** Optional message to display */
  message?: string;
  /** Whether to show full screen overlay */
  fullScreen?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * LoadingSpinner Component
 *
 * Simple loading spinner with optional message.
 */
export function LoadingSpinner({
  size = 'large',
  color = Colors.primary.main,
  message,
  fullScreen = false,
  testID = 'loading-spinner',
}: LoadingSpinnerProps): React.JSX.Element {
  const containerStyle = fullScreen ? styles.fullScreenContainer : styles.container;

  return (
    <View style={containerStyle} testID={testID}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

/**
 * Props for SkeletonBox
 */
export interface SkeletonBoxProps {
  /** Width of the skeleton (number or percentage string) */
  width?: number | string;
  /** Height of the skeleton */
  height?: number;
  /** Border radius */
  borderRadius?: number;
  /** Custom style */
  style?: ViewStyle;
  /** Test ID */
  testID?: string;
}

/**
 * SkeletonBox Component
 *
 * Animated placeholder box that pulses to indicate loading.
 */
export function SkeletonBox({
  width = '100%',
  height = 20,
  borderRadius = BorderRadius.sm,
  style,
  testID = 'skeleton-box',
}: SkeletonBoxProps): React.JSX.Element {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();

    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeletonBox,
        {
          width: width as number | `${number}%`,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      testID={testID}
    />
  );
}

/**
 * Props for SkeletonCard
 */
export interface SkeletonCardProps {
  /** Number of text lines to show */
  lines?: number;
  /** Whether to show an avatar */
  showAvatar?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * SkeletonCard Component
 *
 * Card-shaped skeleton placeholder for list items or cards.
 */
export function SkeletonCard({
  lines = 3,
  showAvatar = false,
  testID = 'skeleton-card',
}: SkeletonCardProps): React.JSX.Element {
  return (
    <View style={styles.cardContainer} testID={testID}>
      {showAvatar && (
        <SkeletonBox
          width={48}
          height={48}
          borderRadius={BorderRadius.round}
          style={styles.avatar}
        />
      )}
      <View style={styles.cardContent}>
        <SkeletonBox width="60%" height={16} style={styles.cardLine} />
        {Array.from({ length: lines - 1 }).map((_, index) => (
          <SkeletonBox
            key={index}
            width={index === lines - 2 ? '40%' : '100%'}
            height={12}
            style={styles.cardLine}
          />
        ))}
      </View>
    </View>
  );
}

/**
 * Props for SkeletonList
 */
export interface SkeletonListProps {
  /** Number of items to show */
  count?: number;
  /** Whether to show avatars */
  showAvatars?: boolean;
  /** Test ID */
  testID?: string;
}

/**
 * SkeletonList Component
 *
 * List of skeleton cards for loading states.
 */
export function SkeletonList({
  count = 5,
  showAvatars = false,
  testID = 'skeleton-list',
}: SkeletonListProps): React.JSX.Element {
  return (
    <View testID={testID}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard
          key={index}
          showAvatar={showAvatars}
          testID={`${testID}-item-${index}`}
        />
      ))}
    </View>
  );
}

/**
 * Props for SessionSkeleton
 */
export interface SessionSkeletonProps {
  /** Test ID */
  testID?: string;
}

/**
 * SessionSkeleton Component
 *
 * Skeleton placeholder specifically for session list items.
 */
export function SessionSkeleton({
  testID = 'session-skeleton',
}: SessionSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.sessionContainer} testID={testID}>
      <View style={styles.sessionHeader}>
        <SkeletonBox width={80} height={14} />
        <SkeletonBox width={60} height={14} />
      </View>
      <View style={styles.sessionBody}>
        <SkeletonBox width={120} height={24} style={styles.sessionMetric} />
        <View style={styles.sessionStats}>
          <SkeletonBox width={50} height={12} />
          <SkeletonBox width={50} height={12} />
          <SkeletonBox width={50} height={12} />
        </View>
      </View>
    </View>
  );
}

/**
 * Props for DashboardSkeleton
 */
export interface DashboardSkeletonProps {
  /** Test ID */
  testID?: string;
}

/**
 * DashboardSkeleton Component
 *
 * Skeleton placeholder for the dashboard screen.
 */
export function DashboardSkeleton({
  testID = 'dashboard-skeleton',
}: DashboardSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.dashboardContainer} testID={testID}>
      {/* Status bar skeleton */}
      <View style={styles.statusBarSkeleton}>
        <SkeletonBox width={100} height={14} />
        <SkeletonBox width={80} height={14} />
      </View>

      {/* Welcome card skeleton */}
      <View style={styles.welcomeCardSkeleton}>
        <SkeletonBox width="70%" height={24} style={styles.welcomeTitle} />
        <SkeletonBox width="50%" height={16} />
      </View>

      {/* Action buttons skeleton */}
      <View style={styles.actionsContainer}>
        <SkeletonBox height={56} borderRadius={BorderRadius.lg} style={styles.actionButton} />
        <SkeletonBox height={56} borderRadius={BorderRadius.lg} style={styles.actionButton} />
        <SkeletonBox height={56} borderRadius={BorderRadius.lg} style={styles.actionButton} />
      </View>

      {/* Widget skeletons */}
      <SkeletonBox height={120} borderRadius={BorderRadius.xl} style={styles.widget} />
      <SkeletonBox height={100} borderRadius={BorderRadius.xl} style={styles.widget} />
    </View>
  );
}

/**
 * Props for ChartSkeleton
 */
export interface ChartSkeletonProps {
  /** Height of the chart area */
  height?: number;
  /** Test ID */
  testID?: string;
}

/**
 * ChartSkeleton Component
 *
 * Skeleton placeholder for chart/graph areas.
 */
export function ChartSkeleton({
  height = 200,
  testID = 'chart-skeleton',
}: ChartSkeletonProps): React.JSX.Element {
  return (
    <View style={styles.chartContainer} testID={testID}>
      <View style={styles.chartHeader}>
        <SkeletonBox width={120} height={18} />
        <SkeletonBox width={60} height={32} />
      </View>
      <View style={[styles.chartArea, { height }]}>
        <View style={styles.chartBars}>
          {Array.from({ length: 7 }).map((_, index) => (
            <SkeletonBox
              key={index}
              width={24}
              height={40 + Math.random() * 80}
              borderRadius={BorderRadius.sm}
            />
          ))}
        </View>
      </View>
      <View style={styles.chartLabels}>
        {Array.from({ length: 5 }).map((_, index) => (
          <SkeletonBox key={index} width={30} height={10} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
  },
  message: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  skeletonBox: {
    backgroundColor: Colors.surface.secondary,
  },
  cardContainer: {
    flexDirection: 'row',
    padding: Spacing.md,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  avatar: {
    marginRight: Spacing.md,
  },
  cardContent: {
    flex: 1,
  },
  cardLine: {
    marginBottom: Spacing.sm,
  },
  sessionContainer: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  sessionBody: {
    gap: Spacing.sm,
  },
  sessionMetric: {
    marginBottom: Spacing.xs,
  },
  sessionStats: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  dashboardContainer: {
    padding: Spacing.lg,
  },
  statusBarSkeleton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  welcomeCardSkeleton: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  welcomeTitle: {
    marginBottom: Spacing.sm,
  },
  actionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    width: '100%',
  },
  widget: {
    marginBottom: Spacing.md,
  },
  chartContainer: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  chartArea: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  chartBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: Spacing.md,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
});

export default {
  LoadingSpinner,
  SkeletonBox,
  SkeletonCard,
  SkeletonList,
  SessionSkeleton,
  DashboardSkeleton,
  ChartSkeleton,
};
