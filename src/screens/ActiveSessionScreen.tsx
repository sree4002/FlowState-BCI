import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { useSession } from '../contexts/SessionContext';
import { useDevice } from '../contexts/DeviceContext';
import { VisualizationModeToggle } from '../components/VisualizationModeToggle';

interface ActiveSessionScreenProps {
  navigation?: any;
}

/**
 * ActiveSessionScreen - Displays the active meditation/focus session
 * Shows real-time theta metrics, session timer, and control buttons
 */
export const ActiveSessionScreen: React.FC<ActiveSessionScreenProps> = ({
  navigation,
}) => {
  const {
    sessionState,
    currentThetaZScore,
    elapsedSeconds,
    sessionConfig,
    visualizationMode,
    setVisualizationMode,
  } = useSession();
  const { deviceInfo, signalQuality } = useDevice();

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getSignalQualityColor = (): string => {
    if (!signalQuality) return Colors.signal.poor;
    if (signalQuality.score >= 80) return Colors.signal.excellent;
    if (signalQuality.score >= 60) return Colors.signal.good;
    if (signalQuality.score >= 40) return Colors.signal.fair;
    return Colors.signal.poor;
  };

  const getThetaZoneColor = (): string => {
    if (currentThetaZScore === null) return Colors.text.tertiary;
    if (currentThetaZScore >= 1.5) return Colors.status.green;
    if (currentThetaZScore >= 0.5) return Colors.status.yellow;
    return Colors.status.red;
  };

  const getThetaZoneLabel = (): string => {
    if (currentThetaZScore === null) return 'Waiting...';
    if (currentThetaZScore >= 1.5) return 'Optimal';
    if (currentThetaZScore >= 0.5) return 'Good';
    return 'Below Target';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: deviceInfo?.is_connected ? Colors.accent.success : Colors.accent.error },
            ]}
          />
          <Text style={styles.statusText}>
            {deviceInfo?.is_connected ? 'Connected' : 'Disconnected'}
          </Text>
        </View>
        <View style={styles.statusItem}>
          <View
            style={[
              styles.statusIndicator,
              { backgroundColor: getSignalQualityColor() },
            ]}
          />
          <Text style={styles.statusText}>
            Signal: {signalQuality?.score ?? '--'}%
          </Text>
        </View>
      </View>

      {/* Session Timer */}
      <View style={styles.timerCard}>
        <Text style={styles.timerLabel}>Session Time</Text>
        <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
        <Text style={styles.sessionTypeText}>
          {sessionConfig?.type ?? 'No active session'}
        </Text>
      </View>

      {/* Theta Z-Score Display */}
      <View style={styles.thetaCard}>
        <Text style={styles.sectionTitle}>Theta Z-Score</Text>
        <View style={styles.thetaValueContainer}>
          <Text style={[styles.thetaValue, { color: getThetaZoneColor() }]}>
            {currentThetaZScore !== null ? currentThetaZScore.toFixed(2) : '--'}
          </Text>
          <View
            style={[
              styles.thetaZoneBadge,
              { backgroundColor: getThetaZoneColor() },
            ]}
          >
            <Text style={styles.thetaZoneText}>{getThetaZoneLabel()}</Text>
          </View>
        </View>
        <Text style={styles.thetaHint}>
          Target: 1.5+ for optimal focus state
        </Text>
      </View>

      {/* Visualization Mode Toggle */}
      <View style={styles.visualizationToggleContainer}>
        <VisualizationModeToggle
          selectedMode={visualizationMode}
          onModeChange={setVisualizationMode}
          testID="visualization-mode-toggle"
        />
      </View>

      {/* Signal Quality Card */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Signal Quality</Text>
        <View style={styles.signalDetails}>
          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>Overall Score</Text>
            <Text style={[styles.signalValue, { color: getSignalQualityColor() }]}>
              {signalQuality?.score ?? '--'}%
            </Text>
          </View>
          <View style={styles.signalRow}>
            <Text style={styles.signalLabel}>Artifact %</Text>
            <Text style={styles.signalValue}>
              {signalQuality?.artifact_percentage?.toFixed(1) ?? '--'}%
            </Text>
          </View>
        </View>
      </View>

      {/* Session Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            sessionState === 'running' && styles.pauseButton,
          ]}
          accessibilityLabel={sessionState === 'running' ? 'Pause session' : 'Start session'}
          accessibilityRole="button"
        >
          <Text style={styles.controlButtonText}>
            {sessionState === 'running' ? 'Pause' : 'Start'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.controlButton, styles.stopButton]}
          accessibilityLabel="Stop session"
          accessibilityRole="button"
        >
          <Text style={styles.controlButtonText}>Stop</Text>
        </TouchableOpacity>
      </View>

      {/* Session Info */}
      <View style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Session Info</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <Text style={styles.infoValue}>{sessionState}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Device</Text>
          <Text style={styles.infoValue}>{deviceInfo?.name ?? 'None'}</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.sm,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  timerCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  timerLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginBottom: Spacing.sm,
  },
  timerValue: {
    color: Colors.text.primary,
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: 2,
  },
  sessionTypeText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.sm,
    textTransform: 'capitalize',
  },
  thetaCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  sectionTitle: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
  thetaValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thetaValue: {
    fontSize: 40,
    fontWeight: Typography.fontWeight.bold,
  },
  thetaZoneBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
  },
  thetaZoneText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
  },
  thetaHint: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.md,
  },
  infoCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadows.md,
  },
  signalDetails: {
    gap: Spacing.sm,
  },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  signalLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
  },
  signalValue: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  controlButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  pauseButton: {
    backgroundColor: Colors.secondary.main,
  },
  stopButton: {
    backgroundColor: Colors.accent.error,
  },
  controlButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  infoLabel: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
  },
  infoValue: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    textTransform: 'capitalize',
  },
  visualizationToggleContainer: {
    marginBottom: Spacing.lg,
  },
});

export default ActiveSessionScreen;
