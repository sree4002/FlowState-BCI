/**
 * FlowState BCI - Dashboard Screen
 *
 * WHOOP-style dashboard showing:
 * - Hero card with today's main stat and gradient
 * - Stats row (sessions, time, theta avg)
 * - Quick action buttons (Quick Boost, Calibrate, Custom)
 * - Theta trend sparkline
 * - Subtle device status indicator
 *
 * Clean, minimal design with proper SafeArea handling.
 */

import React, { useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDevice, useSimulatedMode, useSettings } from '../contexts';
import { useSession } from '../contexts';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { ThetaTrendWidget } from '../components/ThetaTrendWidget';

interface DashboardScreenProps {
  navigation?: {
    navigate: (screen: string) => void;
  };
}

/**
 * Hero stat card with gradient-like background
 * Uses primary color with accent border for visual interest
 */
const HeroCard: React.FC<{
  value: string;
  label: string;
  sublabel?: string;
}> = ({ value, label, sublabel }) => (
  <View style={styles.heroCard}>
    <View style={styles.heroAccent} />
    <Text style={styles.heroLabel}>{label}</Text>
    <Text style={styles.heroValue}>{value}</Text>
    {sublabel && <Text style={styles.heroSublabel}>{sublabel}</Text>}
  </View>
);

/**
 * Stats row showing key metrics
 */
const StatsRow: React.FC<{
  sessions: number;
  totalMinutes: number;
  avgTheta: number | null;
}> = ({ sessions, totalMinutes, avgTheta }) => (
  <View style={styles.statsRow}>
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{sessions}</Text>
      <Text style={styles.statLabel}>Sessions</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{totalMinutes}</Text>
      <Text style={styles.statLabel}>Minutes</Text>
    </View>
    <View style={styles.statDivider} />
    <View style={styles.statItem}>
      <Text style={styles.statValue}>
        {avgTheta !== null ? avgTheta.toFixed(1) : '--'}
      </Text>
      <Text style={styles.statLabel}>Avg Theta</Text>
    </View>
  </View>
);

/**
 * Quick action button component
 */
const ActionButton: React.FC<{
  title: string;
  subtitle?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  testID?: string;
}> = ({ title, subtitle, onPress, variant = 'secondary', disabled, testID }) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      variant === 'primary' && styles.actionButtonPrimary,
      disabled && styles.actionButtonDisabled,
    ]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.7}
    testID={testID}
  >
    <Text
      style={[
        styles.actionButtonTitle,
        variant === 'primary' && styles.actionButtonTitlePrimary,
        disabled && styles.actionButtonTitleDisabled,
      ]}
    >
      {title}
    </Text>
    {subtitle && (
      <Text
        style={[
          styles.actionButtonSubtitle,
          disabled && styles.actionButtonSubtitleDisabled,
        ]}
      >
        {subtitle}
      </Text>
    )}
  </TouchableOpacity>
);

/**
 * Device status indicator (subtle)
 */
const DeviceStatusIndicator: React.FC<{
  isConnected: boolean;
  deviceName?: string;
  isSimulated?: boolean;
}> = ({ isConnected, deviceName, isSimulated }) => (
  <View style={styles.deviceStatus}>
    <View
      style={[
        styles.deviceDot,
        {
          backgroundColor: isConnected
            ? Colors.accent.success
            : Colors.accent.error,
        },
      ]}
    />
    <Text style={styles.deviceText}>
      {isSimulated
        ? isConnected
          ? 'Simulator'
          : 'Not Connected'
        : deviceName || 'No Device'}
    </Text>
  </View>
);

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { isConnected, deviceInfo } = useDevice();
  const { connectionState: simulatedConnectionState } = useSimulatedMode();
  const { settings } = useSettings();
  const {
    sessionState,
    isRefreshing,
    refreshRecentSessions,
    recentSessions,
  } = useSession();

  // Device is usable if either real device OR simulator is connected
  const isSimulatedMode = settings.simulated_mode_enabled;
  const isDeviceUsable =
    isConnected || simulatedConnectionState === 'connected';

  // Calculate today's stats from recent sessions
  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    const todaySessions = (recentSessions || []).filter(
      (s) => s.start_time >= todayTimestamp
    );

    const sessions = todaySessions.length;
    const totalMinutes = Math.round(
      todaySessions.reduce((acc, s) => acc + s.duration_seconds, 0) / 60
    );
    const avgTheta =
      todaySessions.length > 0
        ? todaySessions.reduce((acc, s) => acc + s.avg_theta_zscore, 0) /
          todaySessions.length
        : null;

    return { sessions, totalMinutes, avgTheta };
  }, [recentSessions]);

  const handleRefresh = useCallback(() => {
    refreshRecentSessions();
  }, [refreshRecentSessions]);

  const handleCalibrate = useCallback(() => {
    navigation?.navigate('Calibration');
  }, [navigation]);

  const handleQuickBoost = useCallback(() => {
    navigation?.navigate('Session');
  }, [navigation]);

  const handleCustomSession = useCallback(() => {
    navigation?.navigate('Session');
  }, [navigation]);

  const isSessionActive =
    sessionState === 'running' || sessionState === 'paused';

  // Generate greeting based on time of day
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  // Get main stat for hero card
  const heroStat = useMemo(() => {
    if (todayStats.avgTheta !== null) {
      return {
        value: todayStats.avgTheta.toFixed(2),
        label: "Today's Average",
        sublabel: 'Theta Z-Score',
      };
    }
    return {
      value: '--',
      label: 'No Sessions',
      sublabel: 'Start a session to see your stats',
    };
  }, [todayStats.avgTheta]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
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
        {/* Header with greeting and device status */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{greeting}</Text>
          <DeviceStatusIndicator
            isConnected={isDeviceUsable}
            deviceName={isSimulatedMode ? 'Simulator' : deviceInfo?.name}
            isSimulated={isSimulatedMode}
          />
        </View>

        {/* Hero Card - Main stat of the day */}
        <HeroCard
          value={heroStat.value}
          label={heroStat.label}
          sublabel={heroStat.sublabel}
        />

        {/* Stats Row */}
        <StatsRow
          sessions={todayStats.sessions}
          totalMinutes={todayStats.totalMinutes}
          avgTheta={todayStats.avgTheta}
        />

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <ActionButton
            title="Quick Boost"
            subtitle="5 min theta session"
            onPress={handleQuickBoost}
            variant="primary"
            disabled={!isDeviceUsable || isSessionActive}
            testID="quick-boost-button"
          />
          <View style={styles.secondaryActions}>
            <ActionButton
              title="Calibrate"
              onPress={handleCalibrate}
              disabled={!isDeviceUsable || isSessionActive}
              testID="calibrate-button"
            />
            <ActionButton
              title="Custom"
              onPress={handleCustomSession}
              disabled={!isDeviceUsable || isSessionActive}
              testID="custom-session-button"
            />
          </View>
        </View>

        {/* Theta Trend */}
        <View style={styles.trendSection}>
          <ThetaTrendWidget
            maxDataPoints={10}
            showStats={true}
            title="Recent Trend"
          />
        </View>
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
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  deviceStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  deviceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  deviceText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  // Hero Card
  heroCard: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    backgroundColor: Colors.primary.main,
    overflow: 'hidden',
    position: 'relative',
    ...Shadows.lg,
  },
  heroAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: Colors.secondary.main,
  },
  heroLabel: {
    fontSize: Typography.fontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Spacing.xs,
  },
  heroValue: {
    fontSize: 64,
    fontWeight: Typography.fontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -2,
  },
  heroSublabel: {
    fontSize: Typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: Spacing.xs,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  statDivider: {
    width: 1,
    backgroundColor: Colors.border.secondary,
    marginHorizontal: Spacing.md,
  },
  // Actions Section
  actionsSection: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  actionButton: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.sm,
    alignItems: 'center',
    ...Shadows.sm,
  },
  actionButtonPrimary: {
    backgroundColor: Colors.primary.main,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  actionButtonTitlePrimary: {
    color: '#FFFFFF',
  },
  actionButtonTitleDisabled: {
    color: Colors.text.disabled,
  },
  actionButtonSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  actionButtonSubtitleDisabled: {
    color: Colors.text.disabled,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  // Trend Section
  trendSection: {
    marginBottom: Spacing.lg,
  },
});
