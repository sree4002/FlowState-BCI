/**
 * DeveloperOptions Component
 * Hidden developer settings revealed by tapping version 7 times
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { OnboardingStorage } from '../services/storage';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

/**
 * Props for DeveloperOptions
 */
export interface DeveloperOptionsProps {
  /** Test ID for testing */
  testID?: string;
}

/**
 * Version tap counter to unlock developer mode
 */
export const VersionTapUnlocker: React.FC<{
  version: string;
  onUnlock: () => void;
  isUnlocked: boolean;
}> = ({ version, onUnlock, isUnlocked }) => {
  const [tapCount, setTapCount] = useState(0);
  const tapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const TAPS_REQUIRED = 7;
  const TAP_TIMEOUT = 3000; // Reset after 3 seconds of no taps

  const handleTap = useCallback(() => {
    if (isUnlocked) return;

    // Clear existing timeout
    if (tapTimeoutRef.current) {
      clearTimeout(tapTimeoutRef.current);
    }

    const newCount = tapCount + 1;
    setTapCount(newCount);

    if (newCount >= TAPS_REQUIRED) {
      onUnlock();
      setTapCount(0);
      // Show toast-like alert
      if (Platform.OS !== 'web') {
        Alert.alert('🛠️ Developer Mode', 'You are now a developer!');
      }
    } else if (newCount >= 4) {
      // Hint when getting close
      const remaining = TAPS_REQUIRED - newCount;
      // Could show a subtle indicator here
    }

    // Reset tap count after timeout
    tapTimeoutRef.current = setTimeout(() => {
      setTapCount(0);
    }, TAP_TIMEOUT);
  }, [tapCount, isUnlocked, onUnlock]);

  return (
    <TouchableOpacity
      onPress={handleTap}
      activeOpacity={0.7}
      testID="version-tap-area"
    >
      <View style={styles.versionRow}>
        <Text style={styles.versionLabel}>App Version</Text>
        <Text style={styles.versionValue}>
          {version}
          {tapCount > 0 && tapCount < TAPS_REQUIRED && (
            <Text style={styles.tapHint}> ({TAPS_REQUIRED - tapCount})</Text>
          )}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

/**
 * Force Theta State Picker
 */
const ForceStatePicker: React.FC<{
  value: 'auto' | 'low' | 'normal' | 'high';
  onChange: (value: 'auto' | 'low' | 'normal' | 'high') => void;
}> = ({ value, onChange }) => {
  const states: Array<{ key: 'auto' | 'low' | 'normal' | 'high'; label: string; color: string }> = [
    { key: 'auto', label: 'AUTO', color: Colors.text.secondary },
    { key: 'low', label: 'LOW', color: Colors.status.red },
    { key: 'normal', label: 'NORMAL', color: Colors.status.green },
    { key: 'high', label: 'HIGH', color: Colors.status.blue },
  ];

  return (
    <View style={styles.statePickerContainer}>
      {states.map((state) => (
        <TouchableOpacity
          key={state.key}
          style={[
            styles.stateButton,
            value === state.key && styles.stateButtonActive,
            value === state.key && { borderColor: state.color },
          ]}
          onPress={() => onChange(state.key)}
          testID={`force-state-${state.key}`}
        >
          <Text
            style={[
              styles.stateButtonText,
              value === state.key && { color: state.color },
            ]}
          >
            {state.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * DeveloperOptions Component
 * Shows developer settings when developer mode is enabled
 */
export const DeveloperOptions: React.FC<DeveloperOptionsProps> = ({
  testID = 'developer-options',
}) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [serverUrl, setServerUrl] = useState(settings.simulated_mode_server_url);

  const handleToggleSimulator = useCallback((enabled: boolean) => {
    updateSettings({ simulated_mode_enabled: enabled });
  }, [updateSettings]);

  const handleServerUrlChange = useCallback((url: string) => {
    setServerUrl(url);
  }, []);

  const handleServerUrlBlur = useCallback(() => {
    if (serverUrl !== settings.simulated_mode_server_url) {
      updateSettings({ simulated_mode_server_url: serverUrl });
    }
  }, [serverUrl, settings.simulated_mode_server_url, updateSettings]);

  const handleForceStateChange = useCallback((state: 'auto' | 'low' | 'normal' | 'high') => {
    updateSettings({ force_theta_state: state });
  }, [updateSettings]);

  const handleResetDeveloperSettings = useCallback(() => {
    Alert.alert(
      'Reset Developer Settings',
      'This will disable developer mode and reset all developer settings. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            updateSettings({
              developer_mode_enabled: false,
              simulated_mode_enabled: false,
              simulated_mode_server_url: 'ws://localhost:8765',
              force_theta_state: 'auto',
            });
          },
        },
      ]
    );
  }, [updateSettings]);

  const handleResetOnboarding = useCallback(async () => {
    Alert.alert(
      'Reset Onboarding',
      'This will show the onboarding screens again on next app launch. The app will close.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset & Close',
          style: 'destructive',
          onPress: async () => {
            try {
              await OnboardingStorage.reset();
              Alert.alert(
                'Onboarding Reset',
                'Please restart the app to see the onboarding screens.',
                [{ text: 'OK' }]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to reset onboarding status.');
            }
          },
        },
      ]
    );
  }, []);

  if (!settings.developer_mode_enabled) {
    return null;
  }

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛠️ Developer Options</Text>
        <Text style={styles.headerSubtitle}>For development and testing only</Text>
      </View>

      {/* Enable Simulator Device */}
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingLabel}>Enable Simulator Device</Text>
          <Text style={styles.settingDescription}>
            Use simulated EEG data instead of real hardware
          </Text>
        </View>
        <Switch
          value={settings.simulated_mode_enabled}
          onValueChange={handleToggleSimulator}
          trackColor={{ false: Colors.border.primary, true: Colors.primary.main }}
          thumbColor={Colors.text.primary}
          testID="simulator-toggle"
        />
      </View>

      {/* Server URL */}
      {settings.simulated_mode_enabled && (
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Simulator Server URL</Text>
          <TextInput
            style={styles.textInput}
            value={serverUrl}
            onChangeText={handleServerUrlChange}
            onBlur={handleServerUrlBlur}
            placeholder="ws://localhost:8765"
            placeholderTextColor={Colors.text.tertiary}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            testID="server-url-input"
          />
        </View>
      )}

      {/* Force Theta State */}
      {settings.simulated_mode_enabled && (
        <View style={styles.settingRow}>
          <Text style={styles.settingLabel}>Force Theta State</Text>
          <Text style={styles.settingDescription}>
            Override theta detection for testing
          </Text>
          <ForceStatePicker
            value={settings.force_theta_state}
            onChange={handleForceStateChange}
          />
        </View>
      )}

      {/* Reset Onboarding Button */}
      <TouchableOpacity
        style={styles.onboardingButton}
        onPress={handleResetOnboarding}
        testID="reset-onboarding"
      >
        <Text style={styles.onboardingButtonText}>Reset Onboarding</Text>
      </TouchableOpacity>

      {/* Reset Developer Settings Button */}
      <TouchableOpacity
        style={styles.resetButton}
        onPress={handleResetDeveloperSettings}
        testID="reset-developer-settings"
      >
        <Text style={styles.resetButtonText}>Reset Developer Settings</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.status.yellow,
  },
  header: {
    backgroundColor: 'rgba(243, 156, 18, 0.1)',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.status.yellow,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  settingRow: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  textInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    marginTop: Spacing.sm,
  },
  statePickerContainer: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  stateButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  stateButtonActive: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 2,
  },
  stateButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  onboardingButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.accent.primary,
    alignItems: 'center',
  },
  onboardingButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.accent.primary,
  },
  resetButton: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.status.red,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.status.red,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  versionLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  versionValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  tapHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
});

export default DeveloperOptions;
