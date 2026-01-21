/**
 * FlowState BCI - History Screen
 *
 * Shows past sessions and trends with tab navigation:
 * - List: Session list view
 * - Calendar: Calendar heat map view
 * - Trends: Performance trends over time
 * - Stats: Detailed statistics
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Tab types
const TABS = ['List', 'Calendar', 'Trends', 'Stats'];

// Mock data for development
const MOCK_SESSIONS = [
  {
    id: '1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    duration: 1800, // 30 min
    entrainmentTime: 420, // 7 min
    avgZScore: 0.3,
    improvement: 15,
  },
  {
    id: '2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 26), // Yesterday
    duration: 2400, // 40 min
    entrainmentTime: 600, // 10 min
    avgZScore: -0.2,
    improvement: 22,
  },
  {
    id: '3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 50), // 2 days ago
    duration: 1200, // 20 min
    entrainmentTime: 300, // 5 min
    avgZScore: 0.5,
    improvement: 8,
  },
  {
    id: '4',
    date: new Date(Date.now() - 1000 * 60 * 60 * 74), // 3 days ago
    duration: 3600, // 60 min
    entrainmentTime: 900, // 15 min
    avgZScore: 0.1,
    improvement: 28,
  },
];

export default function HistoryScreen() {
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [activeTab, setActiveTab] = useState('List');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const stored = await AsyncStorage.getItem('flowstate_sessions');
      if (stored) {
        const parsed = JSON.parse(stored);
        const withDates = parsed.map(s => ({
          ...s,
          date: new Date(s.date),
        }));
        setSessions(withDates);
      }
    } catch (e) {
      console.log('Using mock data');
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const hrs = Math.floor(mins / 60);
    const remainMins = mins % 60;
    return `${hrs}h ${remainMins}m`;
  };

  const formatDate = (date) => {
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Today, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday, ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'long' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getWeeklyStats = () => {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = sessions.filter(s => s.date >= weekAgo);

    if (weekSessions.length === 0) {
      return { totalTime: 0, totalEntrainment: 0, avgImprovement: 0, count: 0 };
    }

    return {
      count: weekSessions.length,
      totalTime: weekSessions.reduce((sum, s) => sum + s.duration, 0),
      totalEntrainment: weekSessions.reduce((sum, s) => sum + s.entrainmentTime, 0),
      avgImprovement: weekSessions.reduce((sum, s) => sum + s.improvement, 0) / weekSessions.length,
    };
  };

  const weeklyStats = getWeeklyStats();

  const renderSessionCard = (session) => (
    <TouchableOpacity key={session.id} style={styles.sessionCard}>
      <View style={styles.sessionHeader}>
        <Text style={styles.sessionDate}>{formatDate(session.date)}</Text>
        <Text style={styles.sessionDuration}>{formatDuration(session.duration)}</Text>
      </View>

      <View style={styles.sessionStats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{formatDuration(session.entrainmentTime)}</Text>
          <Text style={styles.statLabel}>Entrainment</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[
            styles.statValue,
            { color: session.avgZScore >= 0 ? '#64ffda' : '#e94560' }
          ]}>
            {session.avgZScore >= 0 ? '+' : ''}{session.avgZScore.toFixed(1)}
          </Text>
          <Text style={styles.statLabel}>Avg Z-Score</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: '#64ffda' }]}>
            +{session.improvement}%
          </Text>
          <Text style={styles.statLabel}>Improvement</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Tab Navigation Component
  const renderTabBar = () => (
    <View style={styles.tabBar}>
      {TABS.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[
            styles.tabButton,
            activeTab === tab && styles.tabButtonActive,
          ]}
          onPress={() => setActiveTab(tab)}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === tab }}
          accessibilityLabel={`${tab} tab`}
        >
          <Text style={[
            styles.tabButtonText,
            activeTab === tab && styles.tabButtonTextActive,
          ]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // List Tab Content
  const renderListTab = () => (
    <>
      {/* Weekly Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>This Week</Text>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{weeklyStats.count}</Text>
            <Text style={styles.summaryLabel}>Sessions</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDuration(weeklyStats.totalTime)}</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryValue}>{formatDuration(weeklyStats.totalEntrainment)}</Text>
            <Text style={styles.summaryLabel}>Entrainment</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryValue, { color: '#64ffda' }]}>
              +{weeklyStats.avgImprovement.toFixed(0)}%
            </Text>
            <Text style={styles.summaryLabel}>Avg Gain</Text>
          </View>
        </View>
      </View>

      {/* Session List */}
      <Text style={styles.sectionTitle}>Recent Sessions</Text>

      {sessions.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>No Sessions Yet</Text>
          <Text style={styles.emptyText}>
            Complete your first session to start tracking your progress.
          </Text>
        </View>
      ) : (
        sessions.map(renderSessionCard)
      )}
    </>
  );

  // Calendar Tab Content (Placeholder)
  const renderCalendarTab = () => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderEmoji}>📅</Text>
      <Text style={styles.placeholderTitle}>Calendar View</Text>
      <Text style={styles.placeholderText}>
        View your sessions on a calendar heat map.
        See patterns in your practice over days, weeks, and months.
      </Text>
      <View style={styles.placeholderFeatures}>
        <Text style={styles.featureItem}>• Daily session indicators</Text>
        <Text style={styles.featureItem}>• Heat map visualization</Text>
        <Text style={styles.featureItem}>• Streak tracking</Text>
        <Text style={styles.featureItem}>• Monthly overview</Text>
      </View>
    </View>
  );

  // Trends Tab Content (Placeholder)
  const renderTrendsTab = () => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderEmoji}>📈</Text>
      <Text style={styles.placeholderTitle}>Performance Trends</Text>
      <Text style={styles.placeholderText}>
        Track your theta power and entrainment trends over time.
        Identify your optimal training patterns.
      </Text>
      <View style={styles.placeholderFeatures}>
        <Text style={styles.featureItem}>• Theta power progression</Text>
        <Text style={styles.featureItem}>• Entrainment efficiency</Text>
        <Text style={styles.featureItem}>• Session duration trends</Text>
        <Text style={styles.featureItem}>• Circadian patterns</Text>
      </View>
    </View>
  );

  // Stats Tab Content (Placeholder)
  const renderStatsTab = () => (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderEmoji}>📊</Text>
      <Text style={styles.placeholderTitle}>Detailed Statistics</Text>
      <Text style={styles.placeholderText}>
        Comprehensive analytics about your training progress
        and performance metrics.
      </Text>
      <View style={styles.placeholderFeatures}>
        <Text style={styles.featureItem}>• Total sessions & time</Text>
        <Text style={styles.featureItem}>• Average z-score trends</Text>
        <Text style={styles.featureItem}>• Best performing times</Text>
        <Text style={styles.featureItem}>• Personal records</Text>
      </View>
    </View>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'List':
        return renderListTab();
      case 'Calendar':
        return renderCalendarTab();
      case 'Trends':
        return renderTrendsTab();
      case 'Stats':
        return renderStatsTab();
      default:
        return renderListTab();
    }
  };

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      {renderTabBar()}

      {/* Tab Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}

        {/* Tips Card - shown on List tab only */}
        {activeTab === 'List' && (
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Insight</Text>
            <Text style={styles.tipsText}>
              Your theta power tends to be highest in the morning.
              Consider scheduling important learning tasks between 9-11 AM.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 12,
  },
  // Tab Bar Styles
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#0f3460',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: '#0f3460',
  },
  tabButtonText: {
    color: '#8892b0',
    fontSize: 14,
    fontWeight: '600',
  },
  tabButtonTextActive: {
    color: '#64ffda',
  },
  // Summary Card Styles
  summaryCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  summaryTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryItem: {
    width: '48%',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  summaryValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  summaryLabel: {
    color: '#8892b0',
    fontSize: 12,
    marginTop: 4,
  },
  // Section Title
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  // Session Card Styles
  sessionCard: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sessionDate: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  sessionDuration: {
    color: '#8892b0',
    fontSize: 14,
  },
  sessionStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  statLabel: {
    color: '#8892b0',
    fontSize: 12,
    marginTop: 2,
  },
  // Empty State Styles
  emptyState: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    color: '#8892b0',
    fontSize: 14,
    textAlign: 'center',
  },
  // Placeholder Styles for Upcoming Tabs
  placeholderContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  placeholderTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  placeholderText: {
    color: '#8892b0',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  placeholderFeatures: {
    alignSelf: 'stretch',
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
  },
  featureItem: {
    color: '#b8c5d6',
    fontSize: 14,
    lineHeight: 28,
  },
  // Tips Card Styles
  tipsCard: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#64ffda',
  },
  tipsTitle: {
    color: '#64ffda',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  tipsText: {
    color: '#ffffff',
    fontSize: 14,
    lineHeight: 20,
  },
});
