import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useDevice } from '../contexts/DeviceContext';
import { SessionConfig } from '../types';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';

/**
 * Props for QuickBoostButton component
 */
export interface QuickBoostButtonProps {
  onSessionStart?: () => void;
  disabled?: boolean;
  testID?: string;
}

/**
 * QuickBoostButton - One-tap button to start a 5-minute session at 6Hz
 *
 * This component provides a quick way to start a theta entrainment session
 * using the default boost settings (5 minutes at 6Hz). It integrates with
 * the session context to configure and start the session.
 */
export const QuickBoostButton: React.FC<QuickBoostButtonProps> = ({
  onSessionStart,
  disabled = false,
  testID = 'quick-boost-button',
}) => {
  const { sessionState, setSessionConfig, setSessionState, setElapsedSeconds } = useSession();
  const { settings } = useSettings();
  const { deviceInfo, isConnecting } = useDevice();

  const isSessionActive = sessionState === 'running' || sessionState === 'paused';
  const isDeviceConnected = deviceInfo?.is_connected ?? false;
  const isButtonDisabled = disabled || isSessionActive || isConnecting;

  const handlePress = () => {
    if (isButtonDisabled) {
      return;
    }

    // Create session config for quick boost
    const config: SessionConfig = {
      type: 'quick_boost',
      duration_minutes: settings.boost_time, // Default: 5 minutes
      entrainment_freq: settings.boost_frequency, // Default: 6 Hz
      volume: settings.default_volume,
      target_zscore: settings.target_zscore,
      closed_loop_behavior: settings.closed_loop_behavior,
    };

    // Reset elapsed time and configure session
    setElapsedSeconds(0);
    setSessionConfig(config);
    setSessionState('running');

    // Notify parent component if callback provided
    onSessionStart?.();
  };

  const getButtonText = (): string => {
    if (isConnecting) {
      return 'Connecting...';
    }
    if (isSessionActive) {
      return 'Session Active';
    }
    return 'Quick Boost';
  };

  const getSubText = (): string => {
    if (isConnecting || isSessionActive) {
      return '';
    }
    return `${settings.boost_time} min @ ${settings.boost_frequency} Hz`;
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        isButtonDisabled && styles.buttonDisabled,
        !isDeviceConnected && !isConnecting && styles.buttonNoDevice,
      ]}
      onPress={handlePress}
      disabled={isButtonDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={`Quick Boost: Start ${settings.boost_time} minute session at ${settings.boost_frequency} hertz`}
      accessibilityState={{ disabled: isButtonDisabled }}
      accessibilityHint="Double tap to start a quick theta entrainment session"
    >
      <View style={styles.content}>
        {isConnecting ? (
          <ActivityIndicator
            size="small"
            color={Colors.text.primary}
            style={styles.loader}
          />
        ) : (
          <Text style={styles.icon}>⚡</Text>
        )}
        <Text style={[styles.text, isButtonDisabled && styles.textDisabled]}>
          {getButtonText()}
        </Text>
        {getSubText() ? (
          <Text style={[styles.subText, isButtonDisabled && styles.textDisabled]}>
            {getSubText()}
          </Text>
        ) : null}
      </View>
      {!isDeviceConnected && !isConnecting && !isSessionActive && (
        <Text style={styles.warningText}>No device connected</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    ...Shadows.md,
  },
  buttonDisabled: {
    backgroundColor: Colors.interactive.disabled,
    opacity: 0.6,
  },
  buttonNoDevice: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    fontSize: Typography.fontSize.xxxl,
    marginBottom: Spacing.xs,
  },
  loader: {
    marginBottom: Spacing.xs,
  },
  text: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
  },
  textDisabled: {
    color: Colors.text.disabled,
  },
  subText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.xs,
  },
  warningText: {
    color: Colors.accent.warning,
    fontSize: Typography.fontSize.xs,
    marginTop: Spacing.sm,
  },
});

export default QuickBoostButton;
