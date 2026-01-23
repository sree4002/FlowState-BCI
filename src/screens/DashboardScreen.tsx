/**
 * FlowState BCI - Dashboard Screen
 *
 * Main dashboard showing:
 * - Device connection status
 * - Today's summary statistics
 * - Theta trend sparkline
 * - Next session suggestion
 * - Quick action buttons (Quick Boost, Calibrate, Custom Session)
 *
 * Uses ScrollView with proper spacing and safe area handling
 * for a polished widget layout experience.
 */

import React, { useCallback } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDevice } from '../contexts';
import { useSession } from '../contexts';
import { Colors, Spacing } from '../constants/theme';
import { DeviceStatusWidget } from '../components/DeviceStatusWidget';
import { TodaySummaryWidget } from '../components/TodaySummaryWidget';
import { ThetaTrendWidget } from '../components/ThetaTrendWidget';
import { NextSessionWidget } from '../components/NextSessionWidget';
import { QuickBoostButton } from '../components/QuickBoostButton';
import { CalibrateButton } from '../components/CalibrateButton';
import { CustomSessionButton } from '../components/CustomSessionButton';

interface DashboardScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { isConnected } = useDevice();
  const { sessionState, isRefreshing, refreshRecentSessions } = useSession();

  const handleRefresh = useCallback(() => {
    refreshRecentSessions();
  }, [refreshRecentSessions]);

  const handleCalibrate = useCallback(() => {
    // Navigate to calibration screen
    navigation?.navigate('Calibration');
  }, [navigation]);

  const handleSessionStart = useCallback(() => {
    // Navigate to active session screen
    navigation?.navigate('Session');
  }, [navigation]);

  const isSessionActive =
    sessionState === 'running' || sessionState === 'paused';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.primary.main}
          colors={[Colors.primary.main]}
          progressBackgroundColor={Colors.surface.primary}
        />
      }
    >
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
      </View>
      {/* Device Status Section */}
      <View style={styles.section}>
        <DeviceStatusWidget testID="device-status-widget" />
      </View>

      {/* Today's Summary Section */}
      <View style={styles.section}>
        <TodaySummaryWidget />
      </View>

      {/* Theta Trend Section */}
      <View style={styles.section}>
        <ThetaTrendWidget
          maxDataPoints={10}
          showStats={true}
          title="Recent Theta Trend"
        />
      </View>

      {/* Next Session Suggestion */}
      <View style={styles.section}>
        <NextSessionWidget
          onStartSession={handleSessionStart}
          testID="next-session-widget"
        />
      </View>

      {/* Quick Actions Section */}
      <View style={styles.actionsSection}>
        {/* Quick Boost Button - Primary action */}
        <View style={styles.primaryAction}>
          <QuickBoostButton
            onSessionStart={handleSessionStart}
            disabled={!isConnected || isSessionActive}
            testID="quick-boost-button"
          />
        </View>

        {/* Secondary Actions Row */}
        <View style={styles.secondaryActions}>
          <View style={styles.secondaryActionItem}>
            <CalibrateButton
              onPress={handleCalibrate}
              variant="secondary"
              size="md"
              label="Calibrate"
              disabled={!isConnected || isSessionActive}
              testID="calibrate-button"
            />
          </View>
          <View style={styles.secondaryActionItem}>
            <CustomSessionButton
              onSessionStart={handleSessionStart}
              disabled={!isConnected || isSessionActive}
              testID="custom-session-button"
            />
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
  },
  connectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  section: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  actionsSection: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  primaryAction: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  secondaryActionItem: {
    flex: 1,
  },
});
