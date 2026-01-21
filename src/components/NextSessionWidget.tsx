/**
 * NextSessionWidget
 * Displays circadian-aware session suggestions based on user's historical performance
 */

import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { useSession } from '../contexts';
import {
  getNextSessionSuggestion,
  formatTime,
  formatRelativeTime,
  getTimePeriodShortLabel,
  getPerformanceColor,
  SessionSuggestion,
} from '../utils/circadian';

/**
 * Props for NextSessionWidget
 */
export interface NextSessionWidgetProps {
  /** Callback when user taps to start a session */
  onStartSession?: (suggestion: SessionSuggestion) => void;
  /** Override current time for testing */
  currentTime?: Date;
  /** Compact display mode */
  compact?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * NextSessionWidget component
 * Shows personalized session suggestions based on circadian patterns
 */
export const NextSessionWidget: React.FC<NextSessionWidgetProps> = ({
  onStartSession,
  currentTime,
  compact = false,
  testID,
}) => {
  const { recentSessions } = useSession();

  const suggestion = useMemo(() => {
    return getNextSessionSuggestion(recentSessions, currentTime);
  }, [recentSessions, currentTime]);

  const handlePress = () => {
    onStartSession?.(suggestion);
  };

  const performanceColor = suggestion.averagePerformance
    ? getPerformanceColor(suggestion.averagePerformance)
    : null;

  const confidenceLabel = {
    high: 'Recommended',
    medium: 'Suggested',
    low: 'Try',
  }[suggestion.confidence];

  if (compact) {
    return (
      <TouchableOpacity
        style={styles.compactContainer}
        onPress={handlePress}
        activeOpacity={0.7}
        testID={testID}
        accessibilityRole="button"
        accessibilityLabel={`${confidenceLabel} session ${formatRelativeTime(suggestion.suggestedTime, currentTime)}`}
      >
        <View style={styles.compactContent}>
          <View style={styles.compactTimeInfo}>
            <Text style={styles.compactTimeLabel}>
              {getTimePeriodShortLabel(suggestion.timePeriod)}
            </Text>
            <Text style={styles.compactTime}>
              {formatRelativeTime(suggestion.suggestedTime, currentTime)}
            </Text>
          </View>
          <View
            style={[
              styles.compactConfidenceBadge,
              styles[`confidence${suggestion.confidence}`],
            ]}
          >
            <Text style={styles.compactConfidenceText}>{confidenceLabel}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={`Next session suggestion: ${suggestion.reason}`}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Next Session</Text>
        <View
          style={[
            styles.confidenceBadge,
            styles[`confidence${suggestion.confidence}`],
          ]}
        >
          <Text style={styles.confidenceText}>{confidenceLabel}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.timeSection}>
          <Text style={styles.timePeriod}>
            {getTimePeriodShortLabel(suggestion.timePeriod)}
          </Text>
          <Text style={styles.time}>
            {formatTime(suggestion.suggestedTime)}
          </Text>
          <Text style={styles.relativeTime}>
            {formatRelativeTime(suggestion.suggestedTime, currentTime)}
          </Text>
        </View>

        {performanceColor && suggestion.sessionCountAtTime > 0 && (
          <View style={styles.performanceSection}>
            <View
              style={[
                styles.performanceIndicator,
                styles[`performance${performanceColor}`],
              ]}
            />
            <Text style={styles.performanceLabel}>
              Based on {suggestion.sessionCountAtTime} session
              {suggestion.sessionCountAtTime !== 1 ? 's' : ''}
            </Text>
          </View>
        )}
      </View>

      <Text style={styles.reason}>{suggestion.reason}</Text>

      <View style={styles.footer}>
        <Text style={styles.ctaText}>Tap to start a session</Text>
        <View style={styles.ctaArrow}>
          <Text style={styles.ctaArrowText}>→</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  confidenceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  confidencehigh: {
    backgroundColor: Colors.status.greenDark,
  },
  confidencemedium: {
    backgroundColor: Colors.primary.dark,
  },
  confidencelow: {
    backgroundColor: Colors.surface.overlay,
  },
  confidenceText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    textTransform: 'uppercase',
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  timeSection: {
    flex: 1,
  },
  timePeriod: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  time: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  relativeTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  performanceSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  performanceIndicator: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
  },
  performancered: {
    backgroundColor: Colors.status.red,
  },
  performanceyellow: {
    backgroundColor: Colors.status.yellow,
  },
  performancegreen: {
    backgroundColor: Colors.status.green,
  },
  performanceblue: {
    backgroundColor: Colors.status.blue,
  },
  performanceLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  reason: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
    marginBottom: Spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  ctaText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary.main,
  },
  ctaArrow: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.primary.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaArrowText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
  },
  // Compact styles
  compactContainer: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  compactContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactTimeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  compactTimeLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  compactTime: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  compactConfidenceBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  compactConfidenceText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
});

export default NextSessionWidget;
