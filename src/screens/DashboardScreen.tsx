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
import { useSettings } from '../contexts/SettingsContext';
import { DemoModeBanner } from '../components/DemoModeBanner';

// Demo Dashboard Component
const DemoDashboard: React.FC = () => {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DemoModeBanner />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.demoHero}>
          <Text style={styles.demoHeroTitle}>FlowState BCI</Text>
          <Text style={styles.demoHeroSubtitle}>
            Closed-Loop Theta Entrainment for Peak Cognitive Performance
          </Text>
          <Text style={styles.demoHeroDescription}>
            Real-time brainwave monitoring meets adaptive neurofeedback.
            Our technology delivers measurable cognitive enhancement through
            personalized theta oscillation entrainment.
          </Text>
        </View>

        {/* Live EEG Simulation */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Real-Time EEG Monitoring</Text>
          <Text style={styles.demoCardSubtitle}>4-channel frontal theta detection</Text>
          <View style={styles.demoEEGContainer}>
            <View style={styles.demoEEGChannel}>
              <Text style={styles.demoChannelLabel}>Fp1</Text>
              <View style={styles.demoWaveform} />
              <Text style={styles.demoChannelValue}>6.2 Hz</Text>
            </View>
            <View style={styles.demoEEGChannel}>
              <Text style={styles.demoChannelLabel}>Fp2</Text>
              <View style={styles.demoWaveform} />
              <Text style={styles.demoChannelValue}>6.0 Hz</Text>
            </View>
            <View style={styles.demoEEGChannel}>
              <Text style={styles.demoChannelLabel}>F3</Text>
              <View style={styles.demoWaveform} />
              <Text style={styles.demoChannelValue}>6.3 Hz</Text>
            </View>
            <View style={styles.demoEEGChannel}>
              <Text style={styles.demoChannelLabel}>F4</Text>
              <View style={styles.demoWaveform} />
              <Text style={styles.demoChannelValue}>6.1 Hz</Text>
            </View>
          </View>
          <View style={styles.demoThetaIndicator}>
            <Text style={styles.demoThetaLabel}>Theta Z-Score</Text>
            <Text style={styles.demoThetaValue}>+1.8</Text>
            <Text style={styles.demoThetaStatus}>HIGH THETA STATE</Text>
          </View>
        </View>

        {/* Pipeline Visualization */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Signal Processing Pipeline</Text>
          <View style={styles.demoPipeline}>
            <View style={styles.demoPipelineStep}>
              <View style={styles.demoPipelineCircle}>
                <Text style={styles.demoPipelineNumber}>1</Text>
              </View>
              <Text style={styles.demoPipelineLabel}>Raw EEG</Text>
              <Text style={styles.demoPipelineDetail}>500 Hz, 4 channels</Text>
            </View>
            <View style={styles.demoPipelineArrow}>
              <Text style={styles.demoPipelineArrowText}>→</Text>
            </View>
            <View style={styles.demoPipelineStep}>
              <View style={styles.demoPipelineCircle}>
                <Text style={styles.demoPipelineNumber}>2</Text>
              </View>
              <Text style={styles.demoPipelineLabel}>Filter</Text>
              <Text style={styles.demoPipelineDetail}>4-8 Hz bandpass</Text>
            </View>
            <View style={styles.demoPipelineArrow}>
              <Text style={styles.demoPipelineArrowText}>→</Text>
            </View>
            <View style={styles.demoPipelineStep}>
              <View style={styles.demoPipelineCircle}>
                <Text style={styles.demoPipelineNumber}>3</Text>
              </View>
              <Text style={styles.demoPipelineLabel}>Detect</Text>
              <Text style={styles.demoPipelineDetail}>Z-score vs baseline</Text>
            </View>
            <View style={styles.demoPipelineArrow}>
              <Text style={styles.demoPipelineArrowText}>→</Text>
            </View>
            <View style={styles.demoPipelineStep}>
              <View style={styles.demoPipelineCircle}>
                <Text style={styles.demoPipelineNumber}>4</Text>
              </View>
              <Text style={styles.demoPipelineLabel}>Entrain</Text>
              <Text style={styles.demoPipelineDetail}>Adaptive audio</Text>
            </View>
          </View>
        </View>

        {/* Calibration Results */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Latest Calibration Results</Text>
          <View style={styles.demoMetricsGrid}>
            <View style={styles.demoMetric}>
              <Text style={styles.demoMetricValue}>94%</Text>
              <Text style={styles.demoMetricLabel}>Signal Quality</Text>
            </View>
            <View style={styles.demoMetric}>
              <Text style={styles.demoMetricValue}>6.2 Hz</Text>
              <Text style={styles.demoMetricLabel}>Avg Theta Freq</Text>
            </View>
            <View style={styles.demoMetric}>
              <Text style={styles.demoMetricValue}>μ=1.2 σ=0.8</Text>
              <Text style={styles.demoMetricLabel}>Baseline Stats</Text>
            </View>
            <View style={styles.demoMetric}>
              <Text style={styles.demoMetricValue}>18 min</Text>
              <Text style={styles.demoMetricLabel}>Duration</Text>
            </View>
          </View>
        </View>

        {/* Cognitive Performance */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Cognitive Performance</Text>
          <Text style={styles.demoCardSubtitle}>Pre/Post session improvements</Text>
          <View style={styles.demoPerformanceRow}>
            <View style={styles.demoPerformanceItem}>
              <Text style={styles.demoPerformanceTest}>N-Back (2-back)</Text>
              <Text style={styles.demoPerformanceImprovement}>+23%</Text>
              <Text style={styles.demoPerformanceDetail}>Pre: 72% → Post: 95%</Text>
            </View>
            <View style={styles.demoPerformanceItem}>
              <Text style={styles.demoPerformanceTest}>Word Recall</Text>
              <Text style={styles.demoPerformanceImprovement}>+18%</Text>
              <Text style={styles.demoPerformanceDetail}>Pre: 11/15 → Post: 14/15</Text>
            </View>
          </View>
        </View>

        {/* Competitive Edge */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Competitive Advantages</Text>
          <View style={styles.demoAdvantagesList}>
            <View style={styles.demoAdvantage}>
              <Text style={styles.demoAdvantageIcon}>✓</Text>
              <Text style={styles.demoAdvantageText}>
                <Text style={styles.demoAdvantageBold}>Closed-Loop Control:</Text>
                {' '}Real-time feedback adaptation based on live EEG
              </Text>
            </View>
            <View style={styles.demoAdvantage}>
              <Text style={styles.demoAdvantageIcon}>✓</Text>
              <Text style={styles.demoAdvantageText}>
                <Text style={styles.demoAdvantageBold}>Validated Efficacy:</Text>
                {' '}Integrated cognitive testing pre/post every session
              </Text>
            </View>
            <View style={styles.demoAdvantage}>
              <Text style={styles.demoAdvantageIcon}>✓</Text>
              <Text style={styles.demoAdvantageText}>
                <Text style={styles.demoAdvantageBold}>Personalized Baseline:</Text>
                {' '}Individual z-score normalization, not one-size-fits-all
              </Text>
            </View>
            <View style={styles.demoAdvantage}>
              <Text style={styles.demoAdvantageIcon}>✓</Text>
              <Text style={styles.demoAdvantageText}>
                <Text style={styles.demoAdvantageBold}>Consumer-Ready:</Text>
                {' '}Native mobile app with seamless BLE integration
              </Text>
            </View>
          </View>
        </View>

        {/* Roadmap */}
        <View style={styles.demoCard}>
          <Text style={styles.demoCardTitle}>Product Roadmap</Text>
          <View style={styles.demoRoadmapList}>
            <View style={styles.demoRoadmapItem}>
              <Text style={styles.demoRoadmapPhase}>Phase 1 (Complete)</Text>
              <Text style={styles.demoRoadmapText}>
                • Core EEG pipeline + Closed-loop entrainment
              </Text>
              <Text style={styles.demoRoadmapText}>
                • Cognitive games (N-Back, Word Recall)
              </Text>
            </View>
            <View style={styles.demoRoadmapItem}>
              <Text style={styles.demoRoadmapPhase}>Phase 2 (Q2 2026)</Text>
              <Text style={styles.demoRoadmapText}>
                • Pilot study with 50 users (IRB approved)
              </Text>
              <Text style={styles.demoRoadmapText}>
                • ML model for optimal timing predictions
              </Text>
            </View>
            <View style={styles.demoRoadmapItem}>
              <Text style={styles.demoRoadmapPhase}>Phase 3 (Q3 2026)</Text>
              <Text style={styles.demoRoadmapText}>
                • FDA breakthrough device designation
              </Text>
              <Text style={styles.demoRoadmapText}>
                • Public beta launch
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.demoDisclaimer}>
          <Text style={styles.demoDisclaimerText}>
            This demo showcases simulated data for investor presentation purposes.
            All metrics and results shown are representative of system capabilities.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  const { settings } = useSettings();

  // Show demo dashboard if demo mode is enabled
  if (settings.demo_mode_enabled) {
    return <DemoDashboard />;
  }

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
      <DemoModeBanner />
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
  // Demo Mode Styles
  demoHero: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xxxl,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  demoHeroTitle: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
    marginBottom: Spacing.md,
    letterSpacing: -1,
  },
  demoHeroSubtitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  demoHeroDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  demoCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
  },
  demoCardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  demoCardSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  demoEEGContainer: {
    marginTop: Spacing.md,
  },
  demoEEGChannel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  demoChannelLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    width: 40,
  },
  demoWaveform: {
    flex: 1,
    height: 40,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
  },
  demoChannelValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.theta.high,
    width: 60,
    textAlign: 'right',
  },
  demoThetaIndicator: {
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    alignItems: 'center',
  },
  demoThetaLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  demoThetaValue: {
    fontSize: Typography.fontSize.xxxl * 1.2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.theta.high,
    marginBottom: Spacing.xs,
  },
  demoThetaStatus: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.theta.high,
    letterSpacing: 1,
  },
  demoPipeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
  },
  demoPipelineStep: {
    alignItems: 'center',
    flex: 1,
  },
  demoPipelineCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  demoPipelineNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  demoPipelineLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: 2,
  },
  demoPipelineDetail: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  demoPipelineArrow: {
    paddingHorizontal: Spacing.xs,
  },
  demoPipelineArrowText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.tertiary,
  },
  demoMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.md,
  },
  demoMetric: {
    width: '50%',
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  demoMetricValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  demoMetricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  demoPerformanceRow: {
    marginTop: Spacing.md,
  },
  demoPerformanceItem: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  demoPerformanceTest: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  demoPerformanceImprovement: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.status.green,
    marginBottom: Spacing.xs,
  },
  demoPerformanceDetail: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  demoAdvantagesList: {
    marginTop: Spacing.md,
  },
  demoAdvantage: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  demoAdvantageIcon: {
    fontSize: Typography.fontSize.xl,
    color: Colors.status.green,
    marginRight: Spacing.md,
    marginTop: 2,
  },
  demoAdvantageText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 21,
  },
  demoAdvantageBold: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  demoRoadmapList: {
    marginTop: Spacing.md,
  },
  demoRoadmapItem: {
    marginBottom: Spacing.lg,
  },
  demoRoadmapPhase: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
    marginBottom: Spacing.sm,
  },
  demoRoadmapText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 21,
    marginBottom: Spacing.xs,
  },
  demoDisclaimer: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.xxl,
  },
  demoDisclaimerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
    fontStyle: 'italic',
  },
});
