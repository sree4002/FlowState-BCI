/**
 * Insights Screen
 * Displays trends, history, and patterns with sub-tabs
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { SparkleIcon } from '../components/TabIcons';
import { DemoModeBanner } from '../components/DemoModeBanner';

type InsightTab = 'trends' | 'history' | 'patterns';

interface TrendCardProps {
  title: string;
  change: string;
  positive?: boolean;
}

const TrendCard: React.FC<TrendCardProps> = ({ title, change, positive = true }) => (
  <View style={styles.trendCard}>
    <View style={styles.trendHeader}>
      <Text style={styles.trendTitle}>{title}</Text>
      <Text style={[styles.trendChange, positive && styles.trendChangePositive]}>
        {change}
      </Text>
    </View>
    {/* Placeholder for chart */}
    <View style={styles.chartPlaceholder}>
      <View style={styles.chartLine} />
    </View>
  </View>
);

interface InsightCardProps {
  text: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ text }) => (
  <View style={styles.insightCard}>
    <View style={styles.insightHeader}>
      <SparkleIcon color={Colors.accent.primary} size={14} />
      <Text style={styles.insightTitle}>Insight</Text>
    </View>
    <Text style={styles.insightText}>{text}</Text>
  </View>
);

interface HistoryItemProps {
  date: string;
  time: string;
  duration: string;
  frequency: string;
  score: string;
}

const HistoryItem: React.FC<HistoryItemProps> = ({
  date,
  time,
  duration,
  frequency,
  score,
}) => (
  <View style={styles.historyItem}>
    <View>
      <Text style={styles.historyDate}>{date} at {time}</Text>
      <Text style={styles.historyMeta}>{duration} · {frequency}</Text>
    </View>
    <Text style={styles.historyScore}>{score}</Text>
  </View>
);

export function InsightsScreen(): React.JSX.Element {
  const [activeTab, setActiveTab] = useState<InsightTab>('trends');

  const renderTab = useCallback((tab: InsightTab, label: string) => (
    <TouchableOpacity
      key={tab}
      style={[styles.tab, activeTab === tab && styles.tabActive]}
      onPress={() => setActiveTab(tab)}
    >
      <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [activeTab]);

  const renderTrendsContent = () => (
    <>
      <TrendCard
        title="Theta Performance"
        change="↑ 18% this week"
        positive={true}
      />
      <InsightCard
        text="Your theta response is 23% stronger in morning sessions. Consider scheduling important focus work before noon."
      />
      <InsightCard
        text="Your 5-day streak is boosting consistency. Sessions after 3+ day streaks show 31% better theta response."
      />
      <InsightCard
        text="6 Hz seems to be your optimal frequency. You've reached target theta 40% faster at this setting."
      />
    </>
  );

  const renderHistoryContent = () => (
    <>
      <Text style={styles.sectionTitle}>This Week</Text>
      <HistoryItem
        date="Today"
        time="9:30 AM"
        duration="15 min"
        frequency="6 Hz"
        score="+1.8"
      />
      <HistoryItem
        date="Yesterday"
        time="8:45 AM"
        duration="20 min"
        frequency="6 Hz"
        score="+1.5"
      />
      <HistoryItem
        date="Mon"
        time="10:15 AM"
        duration="12 min"
        frequency="5.5 Hz"
        score="+1.2"
      />
      <Text style={styles.sectionTitle}>Last Week</Text>
      <HistoryItem
        date="Sun"
        time="9:00 AM"
        duration="18 min"
        frequency="6 Hz"
        score="+1.6"
      />
      <HistoryItem
        date="Sat"
        time="11:30 AM"
        duration="25 min"
        frequency="6.5 Hz"
        score="+2.1"
      />
    </>
  );

  const renderPatternsContent = () => (
    <>
      <View style={styles.patternCard}>
        <Text style={styles.patternTitle}>Best Time of Day</Text>
        <Text style={styles.patternValue}>9:00 - 10:30 AM</Text>
        <Text style={styles.patternDescription}>
          Your theta response is consistently stronger during morning sessions
        </Text>
      </View>
      <View style={styles.patternCard}>
        <Text style={styles.patternTitle}>Optimal Frequency</Text>
        <Text style={styles.patternValue}>6.0 Hz</Text>
        <Text style={styles.patternDescription}>
          You reach target theta faster at this frequency
        </Text>
      </View>
      <View style={styles.patternCard}>
        <Text style={styles.patternTitle}>Best Day</Text>
        <Text style={styles.patternValue}>Saturday</Text>
        <Text style={styles.patternDescription}>
          Weekend sessions show 28% better performance
        </Text>
      </View>
    </>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DemoModeBanner />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Insights</Text>

        {/* Tab Selector */}
        <View style={styles.tabsContainer}>
          {renderTab('trends', 'Trends')}
          {renderTab('history', 'History')}
          {renderTab('patterns', 'Patterns')}
        </View>

        {/* Tab Content */}
        {activeTab === 'trends' && renderTrendsContent()}
        {activeTab === 'history' && renderHistoryContent()}
        {activeTab === 'patterns' && renderPatternsContent()}
      </ScrollView>
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
  screenTitle: {
    fontSize: 28,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
    marginBottom: Spacing.xxl,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.round,
  },
  tabActive: {
    backgroundColor: Colors.accent.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.semibold,
  },
  trendCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  trendTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  trendChange: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  trendChangePositive: {
    color: Colors.theta.high,
  },
  chartPlaceholder: {
    height: 80,
    justifyContent: 'center',
  },
  chartLine: {
    height: 2,
    backgroundColor: Colors.accent.primary,
    borderRadius: 1,
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
    marginBottom: Spacing.md,
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
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  historyItem: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  historyDate: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  historyMeta: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  historyScore: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.theta.high,
  },
  patternCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.cardPadding,
    marginBottom: Spacing.lg,
  },
  patternTitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  patternValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  patternDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: 20,
  },
});

export default InsightsScreen;
