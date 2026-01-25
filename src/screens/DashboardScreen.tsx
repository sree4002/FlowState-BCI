/**
 * Dashboard Screen - Premium WHOOP-style Design
 * Focus Score, AI Insights, and Streak tracking
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { SparkleIcon, PlusIcon } from '../components/TabIcons';

// Helper to get time-based greeting
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

// Helper to get day abbreviation
const getDayAbbreviation = (date: Date): string => {
  return ['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()];
};

// Focus Score Breakdown Item
interface BreakdownItemProps {
  value: number;
  label: string;
  color?: string;
}

const BreakdownItem: React.FC<BreakdownItemProps> = ({
  value,
  label,
  color = Colors.theta.high
}) => (
  <View style={styles.breakdownItem}>
    <Text style={styles.breakdownValue}>{value}</Text>
    <Text style={styles.breakdownLabel}>{label}</Text>
    <View style={styles.breakdownBar}>
      <View
        style={[
          styles.breakdownFill,
          { width: `${Math.min(value, 100)}%`, backgroundColor: color }
        ]}
      />
    </View>
  </View>
);

// Mini Week Day Dot
interface WeekDotProps {
  day: string;
  isCompleted: boolean;
  isToday: boolean;
}

const WeekDot: React.FC<WeekDotProps> = ({ day, isCompleted, isToday }) => (
  <View style={[
    styles.miniDot,
    isCompleted && styles.miniDotCompleted,
    isToday && styles.miniDotToday,
  ]}>
    <Text style={[
      styles.miniDotText,
      isCompleted && styles.miniDotTextCompleted,
    ]}>
      {day}
    </Text>
  </View>
);

export default function DashboardScreen(): React.JSX.Element {
  const navigation = useNavigation();

  // Get current week days
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const days = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - currentDay + i);
      days.push({
        day: getDayAbbreviation(date),
        isCompleted: i < currentDay, // Past days marked as completed for demo
        isToday: i === currentDay,
      });
    }
    return days;
  }, []);

  // Mock data - replace with real data from context
  const focusScore = 87;
  const qualityScore = 92;
  const consistencyScore = 85;
  const focusTimeScore = 78;
  const streakDays = 5;
  const sessionsThisWeek = 4;

  const getScoreSubtitle = (score: number): { text: string; color: string } => {
    if (score >= 85) return { text: "You're in a great flow", color: Colors.theta.high };
    if (score >= 70) return { text: "Good progress today", color: Colors.theta.normal };
    return { text: "Room for improvement", color: Colors.theta.low };
  };

  const { text: subtitleText, color: subtitleColor } = getScoreSubtitle(focusScore);

  const handleStartSession = () => {
    navigation.navigate('Session' as never);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>User</Text>
        </View>

        {/* Focus Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>Focus Score</Text>
          <Text style={styles.scoreValue}>{focusScore}</Text>
          <Text style={[styles.scoreSubtitle, { color: subtitleColor }]}>
            {subtitleText}
          </Text>

          {/* Breakdown Row */}
          <View style={styles.breakdownRow}>
            <BreakdownItem value={qualityScore} label="Quality" />
            <BreakdownItem value={consistencyScore} label="Consistency" />
            <BreakdownItem value={focusTimeScore} label="Focus Time" />
          </View>
        </View>

        {/* AI Insight Card */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <SparkleIcon color={Colors.accent.primary} size={14} />
            <Text style={styles.insightTitle}>Insight</Text>
          </View>
          <Text style={styles.insightText}>
            Your morning sessions show 23% better theta response. Consider scheduling
            important focus work before noon for optimal results.
          </Text>
        </View>

        {/* Combined Streak Card */}
        <View style={styles.combinedCard}>
          <View style={styles.combinedHeader}>
            <View>
              <Text style={styles.streakValue}>{streakDays}</Text>
              <Text style={styles.streakLabel}>day streak</Text>
            </View>
            <View style={styles.sessionsContainer}>
              <Text style={styles.sessionsValue}>{sessionsThisWeek} sessions</Text>
              <Text style={styles.sessionsLabel}>this week</Text>
            </View>
          </View>

          {/* Mini Week */}
          <View style={styles.miniWeek}>
            {weekDays.map((day, index) => (
              <WeekDot
                key={index}
                day={day.day}
                isCompleted={day.isCompleted}
                isToday={day.isToday}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* FAB - Start Session */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleStartSession}
        activeOpacity={0.8}
      >
        <PlusIcon color={Colors.text.inverse} size={28} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
    paddingBottom: 100,
  },
  header: {
    marginBottom: Spacing.xxxl,
  },
  greeting: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  userName: {
    fontSize: 30,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  scoreCard: {
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  scoreLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  scoreValue: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: Typography.letterSpacing.tight,
  },
  scoreSubtitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 10,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xl,
    marginTop: Spacing.xxl,
    width: '100%',
  },
  breakdownItem: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  breakdownLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  breakdownBar: {
    width: 50,
    height: 3,
    backgroundColor: Colors.surface.secondary,
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  breakdownFill: {
    height: '100%',
    borderRadius: 2,
  },
  insightCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 10,
  },
  insightTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.accent.primary,
  },
  insightText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 21,
  },
  combinedCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
  },
  combinedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  streakValue: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  streakLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
  },
  sessionsContainer: {
    alignItems: 'flex-end',
  },
  sessionsValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  sessionsLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
  },
  miniWeek: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  miniDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniDotCompleted: {
    backgroundColor: Colors.theta.high,
  },
  miniDotToday: {
    borderWidth: 2,
    borderColor: Colors.accent.primary,
    backgroundColor: 'transparent',
  },
  miniDotText: {
    fontSize: Typography.fontSize.xs + 1,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.tertiary,
  },
  miniDotTextCompleted: {
    color: Colors.text.inverse,
  },
  fab: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.screenPadding,
    width: 56,
    height: 56,
    backgroundColor: Colors.accent.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
});
