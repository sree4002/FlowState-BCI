import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { useSession } from '../contexts/SessionContext';
import { useDevice } from '../contexts/DeviceContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSimulatedMode } from '../contexts/SimulatedModeContext';
import { VisualizationModeToggle } from '../components/VisualizationModeToggle';
import { ThetaTimeSeriesChart } from '../components/ThetaTimeSeriesChart';
import { ThetaGaugeDisplay } from '../components/ThetaGaugeDisplay';
import { ThetaNumericDisplay } from '../components/ThetaNumericDisplay';
import { DebugOverlay, DebugBar, useTripleTap } from '../components/DebugOverlay';

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
    currentThetaZScore: sessionThetaZScore,
    elapsedSeconds: sessionElapsedSeconds,
    sessionConfig,
    visualizationMode,
    setVisualizationMode,
  } = useSession();
  const { deviceInfo, signalQuality } = useDevice();
  const { settings } = useSettings();
  const {
    metrics: simulatedMetrics,
    isControllerRunning,
    connectionState,
    start: startSimulation,
    stop: stopSimulation,
  } = useSimulatedMode();

  // Track elapsed time for simulated mode
  const [simulatedElapsedSeconds, setSimulatedElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Debug overlay/bar state
  const [showDebugOverlay, setShowDebugOverlay] = useState(false);
  const [showDebugBar, setShowDebugBar] = useState(false);

  // Determine if we're using simulated mode
  const isSimulatedMode = settings.simulated_mode_enabled;

  // Use simulated mode data when enabled, otherwise use session context
  const currentThetaZScore = isSimulatedMode
    ? (simulatedMetrics?.z_score ?? null)
    : sessionThetaZScore;
  const elapsedSeconds = isSimulatedMode
    ? simulatedElapsedSeconds
    : sessionElapsedSeconds;
  const isRunning = isSimulatedMode
    ? isControllerRunning
    : sessionState === 'running';

  // Timer for simulated mode elapsed time
  useEffect(() => {
    if (isSimulatedMode && isControllerRunning) {
      // Start timer when controller starts
      timerRef.current = setInterval(() => {
        setSimulatedElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else if (!isControllerRunning) {
      // Stop timer and reset when controller stops
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setSimulatedElapsedSeconds(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSimulatedMode, isControllerRunning]);

  // Triple-tap gesture handler
  const handleTripleTap = useCallback(() => {
    setShowDebugOverlay(true);
  }, []);

  const { onPress: handleVisualizationPress } = useTripleTap(handleTripleTap);

  // Pan responder for swipe-down gesture to show debug bar
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to downward swipes from near top of container
        return gestureState.dy > 30 && gestureState.y0 < 150;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          setShowDebugBar((prev) => !prev);
        }
      },
    })
  ).current;

  // Close debug overlay handler
  const handleCloseDebugOverlay = useCallback(() => {
    setShowDebugOverlay(false);
  }, []);

  // Debug bar tap to show full overlay
  const handleDebugBarTap = useCallback(() => {
    setShowDebugBar(false);
    setShowDebugOverlay(true);
  }, []);

  // Session control handlers
  const handleStart = useCallback(async () => {
    console.log('[ActiveSessionScreen] Start button pressed');
    console.log('[ActiveSessionScreen] Current state:', {
      sessionState,
      isSimulatedMode,
      connectionState,
      isControllerRunning,
    });

    if (isSimulatedMode) {
      try {
        await startSimulation();
      } catch (error) {
        console.error('[ActiveSessionScreen] Failed to start simulation:', error);
      }
    } else {
      // TODO: Handle real BLE session start
      console.log('[ActiveSessionScreen] BLE session start not implemented');
    }
  }, [isSimulatedMode, sessionState, connectionState, isControllerRunning, startSimulation]);

  const handleStop = useCallback(async () => {
    console.log('[ActiveSessionScreen] Stop button pressed');

    if (isSimulatedMode) {
      try {
        await stopSimulation();
      } catch (error) {
        console.error('[ActiveSessionScreen] Failed to stop simulation:', error);
      }
    } else {
      // TODO: Handle real BLE session stop
      console.log('[ActiveSessionScreen] BLE session stop not implemented');
    }
  }, [isSimulatedMode, stopSimulation]);

  // Get connection status for debug overlay
  const getConnectionStatus = (): 'connected' | 'disconnected' | 'connecting' => {
    if (isSimulatedMode) {
      return connectionState === 'connected' ? 'connected' : 'disconnected';
    }
    return deviceInfo?.is_connected ? 'connected' : 'disconnected';
  };

  // Get signal quality for debug overlay
  const getDebugSignalQuality = (): number => {
    if (isSimulatedMode) {
      return simulatedMetrics?.signal_quality ?? 0;
    }
    return signalQuality?.score ?? 0;
  };

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

  // Render the appropriate visualization based on mode
  // Wrapped with triple-tap handler for debug overlay
  const renderVisualization = () => {
    const content = (() => {
      switch (visualizationMode) {
        case 'chart':
          return (
            <ThetaTimeSeriesChart
              height={250}
              timeWindowMinutes={1}
              showTimeSelector={true}
              showCurrentValue={true}
              showZoneLines={true}
              externalThetaZScore={currentThetaZScore}
              externalElapsedSeconds={elapsedSeconds}
              externalIsRunning={isRunning}
            />
          );
        case 'gauge':
          return (
            <View style={styles.thetaCard}>
              <ThetaGaugeDisplay
                value={currentThetaZScore}
                size={200}
                showLabel={true}
                showValue={true}
              />
            </View>
          );
        case 'numeric':
        default:
          return (
            <View style={styles.thetaCard}>
              <Text style={styles.sectionTitle}>Theta Z-Score</Text>
              <View style={styles.thetaValueContainer}>
                <Text style={[styles.thetaValue, { color: getThetaZoneColor() }]}>
                  {currentThetaZScore !== null
                    ? currentThetaZScore.toFixed(2)
                    : '--'}
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
          );
      }
    })();

    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={handleVisualizationPress}
        testID="visualization-triple-tap-area"
      >
        {content}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Debug Bar (shown via swipe-down) */}
      <DebugBar
        visible={showDebugBar}
        thetaZScore={currentThetaZScore ?? 0}
        signalQuality={getDebugSignalQuality()}
        isSimulated={isSimulatedMode}
        onTap={handleDebugBarTap}
        testID="session-debug-bar"
      />

      {/* Debug Overlay (shown via triple-tap or shake) */}
      <DebugOverlay
        visible={showDebugOverlay}
        onClose={handleCloseDebugOverlay}
        thetaZScore={currentThetaZScore ?? 0}
        signalQuality={getDebugSignalQuality()}
        isSimulated={isSimulatedMode}
        connectionStatus={getConnectionStatus()}
        testID="session-debug-overlay"
      />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        {...panResponder.panHandlers}
      >
        {/* Compact Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusPill}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isSimulatedMode
                    ? connectionState === 'connected'
                      ? Colors.accent.success
                      : Colors.accent.error
                    : deviceInfo?.is_connected
                      ? Colors.accent.success
                      : Colors.accent.error,
                },
              ]}
            />
            <Text style={styles.statusText}>
              {isSimulatedMode
                ? connectionState === 'connected'
                  ? 'SIM'
                  : 'OFF'
                : deviceInfo?.is_connected
                  ? 'LIVE'
                  : 'OFF'}
            </Text>
          </View>
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>
              SQ:{' '}
              {isSimulatedMode
                ? (simulatedMetrics?.signal_quality?.toFixed(0) ?? '--')
                : (signalQuality?.score ?? '--')}%
            </Text>
          </View>
        </View>

        {/* Large Centered Timer */}
        <View style={styles.timerSection}>
          <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
          <Text style={styles.timerLabel}>
            {isSimulatedMode
              ? isControllerRunning
                ? 'Simulated Session'
                : 'Ready'
              : (sessionConfig?.type ?? 'No active session')}
          </Text>
        </View>

        {/* Theta Visualization (Numeric, Gauge, or Chart based on mode) */}
        {renderVisualization()}

        {/* Visualization Mode Toggle */}
        <View style={styles.visualizationToggleContainer}>
          <VisualizationModeToggle
            selectedMode={visualizationMode}
            onModeChange={setVisualizationMode}
            testID="visualization-mode-toggle"
          />
        </View>

        {/* Session Controls - Large buttons at bottom */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.controlButton,
              styles.primaryButton,
              isRunning && styles.pauseButton,
            ]}
            onPress={handleStart}
            disabled={isRunning}
            accessibilityLabel={isRunning ? 'Pause session' : 'Start session'}
            accessibilityRole="button"
          >
            <Text style={styles.controlButtonText}>
              {isRunning ? 'Running' : 'Start'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.stopButton]}
            onPress={handleStop}
            disabled={!isRunning}
            accessibilityLabel="Stop session"
            accessibilityRole="button"
          >
            <Text style={styles.controlButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>

        {/* Signal Quality Card - Compact */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Signal Quality</Text>
            <Text
              style={[styles.infoValue, { color: getSignalQualityColor() }]}
            >
              {signalQuality?.score ?? '--'}%
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mode</Text>
            <Text style={styles.infoValue}>
              {isSimulatedMode ? 'Simulated' : 'BLE Device'}
            </Text>
          </View>
          <View style={[styles.infoRow, styles.lastInfoRow]}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={styles.infoValue}>
              {isSimulatedMode
                ? isControllerRunning
                  ? 'Running'
                  : 'Idle'
                : sessionState}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
  // Compact status bar
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: Spacing.md,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  // Large centered timer
  timerSection: {
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },
  timerValue: {
    color: Colors.text.primary,
    fontSize: 72,
    fontWeight: Typography.fontWeight.bold,
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  timerLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.md,
    marginTop: Spacing.sm,
    textTransform: 'capitalize',
  },
  // Theta visualization cards
  thetaCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
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
    width: '100%',
  },
  thetaValue: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
  },
  thetaZoneBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.round,
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
  // Controls
  controlsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  controlButton: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    ...Shadows.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
  },
  pauseButton: {
    backgroundColor: Colors.secondary.main,
  },
  stopButton: {
    backgroundColor: Colors.accent.error,
    flex: 0.5,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  // Info card (compact)
  infoCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  lastInfoRow: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
  },
  infoValue: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    textTransform: 'capitalize',
  },
  visualizationToggleContainer: {
    marginBottom: Spacing.lg,
  },
});

export default ActiveSessionScreen;
