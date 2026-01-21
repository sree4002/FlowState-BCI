/**
 * FlowState BCI - Dashboard Screen
 *
 * Main dashboard showing:
 * - Device connection status
 * - Signal quality indicator
 * - Current session summary (if active)
 * - Recent session statistics
 * - Quick action buttons
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useDevice } from '../contexts';
import { useSession } from '../contexts';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

export default function DashboardScreen() {
  const { deviceInfo, signalQuality, isConnected } = useDevice();
  const { currentSession, sessionState, thetaZScore, recentSessions } =
    useSession();

  const getSignalQualityLabel = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Fair';
    if (score >= 30) return 'Poor';
    return 'Critical';
  };

  const getSignalQualityColor = (score: number): string => {
    if (score >= 90) return Colors.signal.excellent;
    if (score >= 70) return Colors.signal.good;
    if (score >= 50) return Colors.signal.fair;
    if (score >= 30) return Colors.signal.poor;
    return Colors.signal.critical;
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Connection Status Bar */}
      <View style={styles.connectionBar}>
        <View
          style={[
            styles.connectionDot,
            {
              backgroundColor: isConnected
                ? Colors.accent.success
                : Colors.accent.error,
            },
          ]}
        />
        <Text style={styles.connectionText}>
          {isConnected
            ? deviceInfo?.name || 'Device Connected'
            : 'Not Connected'}
        </Text>
        {isConnected && deviceInfo?.battery_level !== null && (
          <Text style={styles.batteryText}>{deviceInfo?.battery_level}%</Text>
        )}
      </View>

      {/* Signal Quality Card */}
      {isConnected && signalQuality && (
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Signal Quality</Text>
          <View style={styles.signalRow}>
            <View
              style={[
                styles.signalIndicator,
                { backgroundColor: getSignalQualityColor(signalQuality.score) },
              ]}
            />
            <Text
              style={[
                styles.signalValue,
                { color: getSignalQualityColor(signalQuality.score) },
              ]}
            >
              {getSignalQualityLabel(signalQuality.score)}
            </Text>
            <Text style={styles.signalScore}>{signalQuality.score}%</Text>
          </View>
          {signalQuality.artifact_percentage > 0 && (
            <Text style={styles.artifactText}>
              {signalQuality.artifact_percentage.toFixed(1)}% artifacts detected
            </Text>
          )}
        </View>
      )}

      {/* Current Session Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Current Session</Text>
        {sessionState === 'running' || sessionState === 'paused' ? (
          <>
            <Text style={styles.sessionStatus}>
              {sessionState === 'running' ? 'In Progress' : 'Paused'}
            </Text>
            {currentSession && (
              <Text style={styles.sessionDuration}>
                Duration: {formatDuration(currentSession.duration_seconds)}
              </Text>
            )}
            <View style={styles.thetaRow}>
              <Text style={styles.thetaLabel}>Theta Z-Score</Text>
              <Text style={styles.thetaValue}>
                {thetaZScore !== null ? thetaZScore.toFixed(2) : '--'}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.noSessionText}>No active session</Text>
        )}
      </View>

      {/* Recent Sessions Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Recent Sessions</Text>
        {recentSessions.length > 0 ? (
          recentSessions.slice(0, 3).map((session, index) => (
            <View key={session.id || index} style={styles.sessionItem}>
              <Text style={styles.sessionType}>{session.session_type}</Text>
              <Text style={styles.sessionStat}>
                {formatDuration(session.duration_seconds)} ·{' '}
                {session.avg_theta_zscore.toFixed(2)} avg z-score
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noSessionText}>No recent sessions</Text>
        )}
      </View>

      {/* Quick Stats Card */}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Quick Stats</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{recentSessions.length}</Text>
            <Text style={styles.statLabel}>Sessions</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {recentSessions.length > 0
                ? formatDuration(
                    Math.round(
                      recentSessions.reduce(
                        (sum, s) => sum + s.duration_seconds,
                        0
                      ) / recentSessions.length
                    )
                  )
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Avg Duration</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {recentSessions.length > 0
                ? (
                    recentSessions.reduce(
                      (sum, s) => sum + s.avg_theta_zscore,
                      0
                    ) / recentSessions.length
                  ).toFixed(2)
                : '--'}
            </Text>
            <Text style={styles.statLabel}>Avg Z-Score</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    padding: Spacing.md,
  },
  connectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  connectionText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    flex: 1,
  },
  batteryText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  card: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: Spacing.sm,
  },
  signalValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    flex: 1,
  },
  signalScore: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
  },
  artifactText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  sessionStatus: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  sessionDuration: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    marginBottom: Spacing.md,
  },
  thetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  thetaLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
  },
  thetaValue: {
    color: Colors.accent.focus,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
  },
  noSessionText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.md,
    fontStyle: 'italic',
  },
  sessionItem: {
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  sessionType: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  sessionStat: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
  },
  statLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
});
