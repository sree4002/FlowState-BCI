import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { SessionConfig } from '../types';

/**
 * Props for CustomSessionButton component
 */
export interface CustomSessionButtonProps {
  /** Optional callback when session is started */
  onSessionStart?: (config: SessionConfig) => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Default configuration values for custom sessions
 */
const DEFAULT_DURATION_MINUTES = 15;
const MIN_DURATION_MINUTES = 5;
const MAX_DURATION_MINUTES = 60;
const MIN_FREQUENCY_HZ = 4;
const MAX_FREQUENCY_HZ = 12;
const MIN_VOLUME = 0;
const MAX_VOLUME = 100;

/**
 * CustomSessionButton component
 * Allows users to configure and start custom BCI entrainment sessions
 * with adjustable duration, frequency, and volume settings.
 */
export const CustomSessionButton: React.FC<CustomSessionButtonProps> = ({
  onSessionStart,
  disabled = false,
  testID,
}) => {
  const { sessionState, setSessionConfig, setSessionState } = useSession();
  const { settings } = useSettings();

  // Modal visibility state
  const [modalVisible, setModalVisible] = useState(false);

  // Session configuration state
  const [duration, setDuration] = useState(DEFAULT_DURATION_MINUTES);
  const [frequency, setFrequency] = useState(settings.boost_frequency);
  const [volume, setVolume] = useState(settings.default_volume);

  // Determine if button should be disabled
  const isDisabled = disabled || sessionState !== 'idle';

  /**
   * Handle button press - opens configuration modal
   */
  const handlePress = () => {
    if (!isDisabled) {
      // Reset to defaults based on current settings
      setDuration(DEFAULT_DURATION_MINUTES);
      setFrequency(settings.boost_frequency);
      setVolume(settings.default_volume);
      setModalVisible(true);
    }
  };

  /**
   * Handle starting the configured session
   */
  const handleStartSession = () => {
    const config: SessionConfig = {
      type: 'custom',
      duration_minutes: duration,
      entrainment_freq: frequency,
      volume: volume,
      target_zscore: settings.target_zscore,
      closed_loop_behavior: settings.closed_loop_behavior,
    };

    setSessionConfig(config);
    setSessionState('running');
    setModalVisible(false);

    if (onSessionStart) {
      onSessionStart(config);
    }
  };

  /**
   * Handle modal close/cancel
   */
  const handleCancel = () => {
    setModalVisible(false);
  };

  /**
   * Format duration for display
   */
  const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, isDisabled && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={isDisabled}
        activeOpacity={0.7}
        testID={testID}
        accessibilityLabel="Start custom session"
        accessibilityRole="button"
        accessibilityState={{ disabled: isDisabled }}
        accessibilityHint="Opens configuration panel to customize session duration, frequency, and volume"
      >
        <View style={styles.buttonContent}>
          <Text style={[styles.buttonIcon, isDisabled && styles.textDisabled]}>
            ⚙️
          </Text>
          <View style={styles.buttonTextContainer}>
            <Text
              style={[styles.buttonTitle, isDisabled && styles.textDisabled]}
            >
              Custom Session
            </Text>
            <Text
              style={[styles.buttonSubtitle, isDisabled && styles.textDisabled]}
            >
              Configure duration & settings
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancel}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Configure Session</Text>

            {/* Duration Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Duration</Text>
                <Text style={styles.sliderValue}>
                  {formatDuration(duration)}
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={MIN_DURATION_MINUTES}
                maximumValue={MAX_DURATION_MINUTES}
                step={5}
                value={duration}
                onValueChange={setDuration}
                minimumTrackTintColor={Colors.primary.main}
                maximumTrackTintColor={Colors.border.primary}
                thumbTintColor={Colors.primary.light}
                testID={testID ? `${testID}-duration-slider` : undefined}
                accessibilityLabel="Session duration"
                accessibilityValue={{
                  min: MIN_DURATION_MINUTES,
                  max: MAX_DURATION_MINUTES,
                  now: duration,
                  text: formatDuration(duration),
                }}
              />
              <View style={styles.sliderRange}>
                <Text style={styles.sliderRangeText}>
                  {MIN_DURATION_MINUTES} min
                </Text>
                <Text style={styles.sliderRangeText}>
                  {MAX_DURATION_MINUTES} min
                </Text>
              </View>
            </View>

            {/* Frequency Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Frequency</Text>
                <Text style={styles.sliderValue}>
                  {frequency.toFixed(1)} Hz
                </Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={MIN_FREQUENCY_HZ}
                maximumValue={MAX_FREQUENCY_HZ}
                step={0.5}
                value={frequency}
                onValueChange={setFrequency}
                minimumTrackTintColor={Colors.secondary.main}
                maximumTrackTintColor={Colors.border.primary}
                thumbTintColor={Colors.secondary.light}
                testID={testID ? `${testID}-frequency-slider` : undefined}
                accessibilityLabel="Entrainment frequency"
                accessibilityValue={{
                  min: MIN_FREQUENCY_HZ,
                  max: MAX_FREQUENCY_HZ,
                  now: frequency,
                  text: `${frequency.toFixed(1)} Hertz`,
                }}
              />
              <View style={styles.sliderRange}>
                <Text style={styles.sliderRangeText}>
                  {MIN_FREQUENCY_HZ} Hz (Theta)
                </Text>
                <Text style={styles.sliderRangeText}>
                  {MAX_FREQUENCY_HZ} Hz (Alpha)
                </Text>
              </View>
            </View>

            {/* Volume Slider */}
            <View style={styles.sliderContainer}>
              <View style={styles.sliderHeader}>
                <Text style={styles.sliderLabel}>Volume</Text>
                <Text style={styles.sliderValue}>{Math.round(volume)}%</Text>
              </View>
              <Slider
                style={styles.slider}
                minimumValue={MIN_VOLUME}
                maximumValue={MAX_VOLUME}
                step={5}
                value={volume}
                onValueChange={setVolume}
                minimumTrackTintColor={Colors.accent.success}
                maximumTrackTintColor={Colors.border.primary}
                thumbTintColor={Colors.status.greenLight}
                testID={testID ? `${testID}-volume-slider` : undefined}
                accessibilityLabel="Audio volume"
                accessibilityValue={{
                  min: MIN_VOLUME,
                  max: MAX_VOLUME,
                  now: volume,
                  text: `${Math.round(volume)} percent`,
                }}
              />
              <View style={styles.sliderRange}>
                <Text style={styles.sliderRangeText}>0%</Text>
                <Text style={styles.sliderRangeText}>100%</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.modalActions}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
                testID={testID ? `${testID}-cancel-button` : undefined}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.startButton]}
                onPress={handleStartSession}
                testID={testID ? `${testID}-start-button` : undefined}
                accessibilityLabel="Start session"
                accessibilityRole="button"
              >
                <Text style={styles.startButtonText}>Start Session</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    ...Shadows.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.surface.secondary,
    borderColor: Colors.border.secondary,
    opacity: 0.5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    fontSize: Typography.fontSize.xxl,
    marginRight: Spacing.md,
  },
  buttonTextContainer: {
    flex: 1,
  },
  buttonTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  buttonSubtitle: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  textDisabled: {
    color: Colors.text.disabled,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.dark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    ...Shadows.lg,
  },
  modalTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  sliderContainer: {
    marginBottom: Spacing.lg,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sliderLabel: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  sliderValue: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderRangeText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  cancelButtonText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
  },
  startButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default CustomSessionButton;
