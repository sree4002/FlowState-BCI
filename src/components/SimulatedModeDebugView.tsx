/**
 * Simulated Mode Debug View
 *
 * Developer-facing component that displays real-time EEG metrics and
 * closed-loop controller state when running in simulated mode.
 *
 * Shows:
 * - Connection status to simulator server
 * - Theta power and z-score
 * - Theta state (low/normal/high)
 * - Entrainment active indicator
 * - Controls to force theta state
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  Platform,
  Alert,
} from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useSimulatedMode } from '../contexts';
import { useSettings } from '../contexts';

// Import the bundled audio asset for self-test
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AUDIO_TEST_ASSET = require('../../assets/audio/isochronic_theta6_carrier440.wav');
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

/**
 * Props for SimulatedModeDebugView
 */
export interface SimulatedModeDebugViewProps {
  /** Optional test ID */
  testID?: string;
  /** Whether to show the full panel or just the toggle */
  showFullPanel?: boolean;
}

/**
 * Get color for theta state
 */
const getThetaStateColor = (state: 'low' | 'normal' | 'high'): string => {
  switch (state) {
    case 'low':
      return Colors.status.red;
    case 'high':
      return Colors.status.blue;
    case 'normal':
    default:
      return Colors.status.green;
  }
};

/**
 * Get color for connection state
 */
const getConnectionColor = (
  state: 'disconnected' | 'connecting' | 'connected' | 'error'
): string => {
  switch (state) {
    case 'connected':
      return Colors.signal.excellent;
    case 'connecting':
      return Colors.signal.fair;
    case 'error':
      return Colors.signal.critical;
    case 'disconnected':
    default:
      return Colors.text.disabled;
  }
};

/**
 * Format z-score for display
 */
const formatZScore = (zScore: number | undefined): string => {
  if (zScore === undefined || zScore === null) return '--';
  const sign = zScore >= 0 ? '+' : '';
  return `${sign}${zScore.toFixed(2)}`;
};

/**
 * SimulatedModeDebugView Component
 */
export const SimulatedModeDebugView: React.FC<SimulatedModeDebugViewProps> = ({
  testID,
  showFullPanel = true,
}) => {
  const { settings, updateSettings } = useSettings();
  const {
    isEnabled,
    metrics,
    connectionState,
    isControllerRunning,
    isEntrainmentActive,
    controllerState,
    error,
    start,
    stop,
    forceState,
    clearForcedState,
    clearError,
  } = useSimulatedMode();

  // Local state for URL editing
  const [urlInput, setUrlInput] = useState(settings.simulated_mode_server_url);
  const [audioTestStatus, setAudioTestStatus] = useState<string | null>(null);

  // Handle URL save
  const handleSaveUrl = () => {
    if (urlInput !== settings.simulated_mode_server_url) {
      updateSettings({ simulated_mode_server_url: urlInput });
      console.log('[SimulatedModeDebugView] Saved URL:', urlInput);
    }
  };

  // Handle reset settings
  const handleResetSettings = () => {
    const defaultUrl = 'ws://10.0.2.2:8765';
    console.log('[SimulatedModeDebugView] Resetting simulated mode settings');
    updateSettings({
      simulated_mode_enabled: false,
      simulated_mode_server_url: defaultUrl,
    });
    setUrlInput(defaultUrl);
    stop();
    Alert.alert('Reset', 'Simulated mode settings have been reset to defaults.');
  };

  // Audio self-test
  const handleAudioSelfTest = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Audio self-test is not supported on web.');
      return;
    }

    console.log('[AudioSelfTest] ========== START ==========');
    console.log(`[AudioSelfTest] Platform: ${Platform.OS}`);
    console.log(`[AudioSelfTest] Asset ID: ${AUDIO_TEST_ASSET}`);
    setAudioTestStatus('Running...');

    try {
      // Step 1: Configure audio mode
      console.log('[AudioSelfTest] Step 1: Setting audio mode...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
      console.log('[AudioSelfTest] Step 1: Audio mode set OK');

      // Step 2: Load the sound
      console.log('[AudioSelfTest] Step 2: Loading asset...');
      const { sound, status } = await Audio.Sound.createAsync(
        AUDIO_TEST_ASSET,
        { shouldPlay: false, volume: 1.0 },
        (playbackStatus: AVPlaybackStatus) => {
          if (playbackStatus.isLoaded) {
            console.log(`[AudioSelfTest] Status: isPlaying=${playbackStatus.isPlaying}, pos=${playbackStatus.positionMillis}ms`);
          } else if (playbackStatus.error) {
            console.error(`[AudioSelfTest] Playback error: ${playbackStatus.error}`);
          }
        }
      );
      console.log('[AudioSelfTest] Step 2: Loaded OK');
      console.log('[AudioSelfTest] Initial status:', JSON.stringify(status, null, 2));

      // Step 3: Play at full volume
      console.log('[AudioSelfTest] Step 3: Playing at volume 1.0...');
      await sound.setVolumeAsync(1.0);
      const playResult = await sound.playAsync();
      console.log('[AudioSelfTest] Step 3: playAsync OK');
      console.log('[AudioSelfTest] Play result:', JSON.stringify(playResult, null, 2));

      setAudioTestStatus('Playing... (2 sec)');

      // Step 4: Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Step 5: Get final status and stop
      const finalStatus = await sound.getStatusAsync();
      console.log('[AudioSelfTest] Final status:', JSON.stringify(finalStatus, null, 2));

      await sound.stopAsync();
      await sound.unloadAsync();

      console.log('[AudioSelfTest] ========== SUCCESS ==========');
      setAudioTestStatus('✅ SUCCESS');
      Alert.alert('Audio Self-Test', 'Audio played successfully! Check logs for details.');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error('[AudioSelfTest] ========== FAILED ==========');
      console.error('[AudioSelfTest] Error:', errorMsg);
      setAudioTestStatus(`❌ FAILED: ${errorMsg}`);
      Alert.alert('Audio Self-Test Failed', errorMsg);
    }
  };

  // Handle toggle change
  const handleToggle = async (value: boolean) => {
    updateSettings({ simulated_mode_enabled: value });
    if (value) {
      await start();
    } else {
      await stop();
    }
  };

  // Handle start/stop button
  const handleStartStop = async () => {
    if (isControllerRunning) {
      await stop();
    } else {
      await start();
    }
  };

  // Minimal toggle view
  if (!showFullPanel) {
    return (
      <View style={styles.toggleRow} testID={testID}>
        <Text style={styles.toggleLabel}>Simulated Mode</Text>
        <Switch
          value={settings.simulated_mode_enabled}
          onValueChange={handleToggle}
          trackColor={{
            false: Colors.border.primary,
            true: Colors.primary.main + '60',
          }}
          thumbColor={
            settings.simulated_mode_enabled
              ? Colors.primary.main
              : Colors.text.disabled
          }
        />
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Simulated Mode</Text>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isEnabled
                  ? Colors.accent.success + '20'
                  : Colors.text.disabled + '20',
              },
            ]}
          >
            <Text
              style={[
                styles.badgeText,
                {
                  color: isEnabled
                    ? Colors.accent.success
                    : Colors.text.disabled,
                },
              ]}
            >
              {isEnabled ? 'DEV' : 'OFF'}
            </Text>
          </View>
        </View>
        <Switch
          value={settings.simulated_mode_enabled}
          onValueChange={handleToggle}
          trackColor={{
            false: Colors.border.primary,
            true: Colors.primary.main + '60',
          }}
          thumbColor={
            settings.simulated_mode_enabled
              ? Colors.primary.main
              : Colors.text.disabled
          }
        />
      </View>

      {/* Only show details if enabled */}
      {isEnabled && (
        <>
          {/* Connection Status */}
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: getConnectionColor(connectionState) },
                ]}
              />
              <Text style={styles.statusLabel}>
                {connectionState.charAt(0).toUpperCase() +
                  connectionState.slice(1)}
              </Text>
            </View>

            {isEntrainmentActive && (
              <View style={styles.statusItem}>
                <View
                  style={[
                    styles.statusDot,
                    styles.pulsing,
                    { backgroundColor: Colors.accent.focus },
                  ]}
                />
                <Text style={[styles.statusLabel, { color: Colors.accent.focus }]}>
                  Entrainment Active
                </Text>
              </View>
            )}
          </View>

          {/* Metrics Grid */}
          <View style={styles.metricsGrid}>
            {/* Theta Power */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Theta Power</Text>
              <Text style={styles.metricValue}>
                {metrics?.theta_power?.toFixed(1) ?? '--'}
              </Text>
              <Text style={styles.metricUnit}>uV^2</Text>
            </View>

            {/* Z-Score */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Z-Score</Text>
              <Text
                style={[
                  styles.metricValue,
                  {
                    color: getThetaStateColor(
                      metrics?.theta_state ?? 'normal'
                    ),
                  },
                ]}
              >
                {formatZScore(metrics?.z_score)}
              </Text>
              <Text style={styles.metricUnit}>std</Text>
            </View>

            {/* Theta State */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Theta State</Text>
              <View
                style={[
                  styles.stateBadge,
                  {
                    backgroundColor:
                      getThetaStateColor(metrics?.theta_state ?? 'normal') + '20',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.stateText,
                    {
                      color: getThetaStateColor(metrics?.theta_state ?? 'normal'),
                    },
                  ]}
                >
                  {(metrics?.theta_state ?? 'N/A').toUpperCase()}
                </Text>
              </View>
            </View>

            {/* Signal Quality */}
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Signal Quality</Text>
              <Text style={styles.metricValue}>
                {metrics?.signal_quality?.toFixed(0) ?? '--'}
              </Text>
              <Text style={styles.metricUnit}>%</Text>
            </View>
          </View>

          {/* Force State Controls */}
          <View style={styles.controlsSection}>
            <Text style={styles.controlsLabel}>Force Theta State:</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={[styles.stateButton, styles.lowButton]}
                onPress={() => forceState('low')}
              >
                <Text style={styles.buttonText}>LOW</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stateButton, styles.normalButton]}
                onPress={() => forceState('normal')}
              >
                <Text style={styles.buttonText}>NORMAL</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stateButton, styles.highButton]}
                onPress={() => forceState('high')}
              >
                <Text style={styles.buttonText}>HIGH</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.stateButton, styles.clearButton]}
                onPress={clearForcedState}
              >
                <Text style={styles.buttonText}>AUTO</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Forced State Indicator */}
          {metrics?.simulated_theta_state && (
            <View style={styles.forcedIndicator}>
              <Text style={styles.forcedText}>
                Forced: {metrics.simulated_theta_state.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Start/Stop Button */}
          <TouchableOpacity
            style={[
              styles.actionButton,
              isControllerRunning
                ? styles.stopButton
                : styles.startButton,
            ]}
            onPress={handleStartStop}
          >
            <Text style={styles.actionButtonText}>
              {isControllerRunning ? 'Stop Simulation' : 'Start Simulation'}
            </Text>
          </TouchableOpacity>

          {/* Error Display */}
          {error && (
            <TouchableOpacity style={styles.errorContainer} onPress={clearError}>
              <Text style={styles.errorText}>{error}</Text>
              <Text style={styles.errorDismiss}>Tap to dismiss</Text>
            </TouchableOpacity>
          )}

          {/* Server URL Input */}
          <View style={styles.urlSection}>
            <Text style={styles.urlLabel}>Server URL:</Text>
            <View style={styles.urlInputRow}>
              <TextInput
                style={styles.urlInput}
                value={urlInput}
                onChangeText={setUrlInput}
                onBlur={handleSaveUrl}
                onSubmitEditing={handleSaveUrl}
                placeholder="ws://192.168.x.x:8765"
                placeholderTextColor={Colors.text.disabled}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <TouchableOpacity
                style={styles.saveUrlButton}
                onPress={handleSaveUrl}
              >
                <Text style={styles.saveUrlText}>Save</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.urlHint}>
              Use your computer's LAN IP for physical devices
            </Text>
          </View>

          {/* Debug Tools Section */}
          <View style={styles.debugSection}>
            <Text style={styles.debugSectionTitle}>Debug Tools</Text>

            {/* Platform Info */}
            <Text style={styles.platformInfo}>
              Platform: {Platform.OS}
            </Text>

            {/* Audio Self-Test Button */}
            <TouchableOpacity
              style={styles.debugButton}
              onPress={handleAudioSelfTest}
            >
              <Text style={styles.debugButtonText}>Audio Self-Test</Text>
            </TouchableOpacity>
            {audioTestStatus && (
              <Text style={styles.audioTestStatus}>{audioTestStatus}</Text>
            )}

            {/* Reset Settings Button */}
            <TouchableOpacity
              style={[styles.debugButton, styles.resetButton]}
              onPress={handleResetSettings}
            >
              <Text style={styles.debugButtonText}>Reset Simulated Settings</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  badge: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  badgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  toggleLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
  },
  pulsing: {
    // Animation would be added via Animated API
  },
  statusLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  metricCard: {
    width: '50%',
    padding: Spacing.xs,
  },
  metricLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: 2,
  },
  metricValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  metricUnit: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.disabled,
  },
  stateBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginTop: 2,
  },
  stateText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  controlsSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  controlsLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stateButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  lowButton: {
    backgroundColor: Colors.status.red + '30',
  },
  normalButton: {
    backgroundColor: Colors.status.green + '30',
  },
  highButton: {
    backgroundColor: Colors.status.blue + '30',
  },
  clearButton: {
    backgroundColor: Colors.surface.secondary,
  },
  buttonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  forcedIndicator: {
    marginTop: Spacing.sm,
    padding: Spacing.xs,
    backgroundColor: Colors.accent.warning + '20',
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  forcedText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.accent.warning,
    fontWeight: Typography.fontWeight.medium,
  },
  actionButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  startButton: {
    backgroundColor: Colors.primary.main,
  },
  stopButton: {
    backgroundColor: Colors.signal.critical,
  },
  actionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  errorContainer: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.signal.critical + '20',
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.signal.critical,
  },
  errorDismiss: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  urlSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  urlLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  urlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlInput: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.primary,
    fontFamily: 'monospace',
  },
  saveUrlButton: {
    marginLeft: Spacing.sm,
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  saveUrlText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  urlHint: {
    marginTop: Spacing.xs,
    fontSize: Typography.fontSize.xs,
    color: Colors.text.disabled,
  },
  debugSection: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  debugSectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  platformInfo: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
    fontFamily: 'monospace',
  },
  debugButton: {
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: Colors.signal.critical + '30',
  },
  debugButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  audioTestStatus: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
});

export default SimulatedModeDebugView;
