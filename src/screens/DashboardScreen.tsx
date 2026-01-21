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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useDevice, useSession } from '../contexts';
import {
  DeviceStatusWidget,
  TodaySummaryWidget,
  ThetaTrendWidget,
  NextSessionWidget,
  QuickBoostButton,
  CalibrateButton,
  CustomSessionButton,
} from '../components';
import { Colors, Spacing } from '../constants/theme';

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { isConnected } = useDevice();
  const { sessionState } = useSession();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in production this would fetch latest data
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleCalibrate = useCallback(() => {
    // Navigate to calibration screen
    // @ts-expect-error Navigation type will be properly set up in navigation config
    navigation.navigate('Calibration');
  }, [navigation]);

  const handleSessionStart = useCallback(() => {
    // Navigate to active session screen
    // @ts-expect-error Navigation type will be properly set up in navigation config
    navigation.navigate('Session');
  }, [navigation]);

  const isSessionActive = sessionState === 'running' || sessionState === 'paused';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingBottom: insets.bottom + Spacing.xxl },
      ]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary.main}
          colors={[Colors.primary.main]}
        />
      }
      testID="dashboard-scroll-view"
    >
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
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  section: {
    marginBottom: Spacing.md,
  },
  actionsSection: {
    marginTop: Spacing.sm,
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
