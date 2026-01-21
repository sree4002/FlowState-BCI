import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

/**
 * Section component for grouping related settings
 */
interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({
  title,
  description,
  children,
}: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description && (
        <Text style={styles.sectionDescription}>{description}</Text>
      )}
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

/**
 * Placeholder row component for settings items
 */
interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

function SettingsRow({ label, value, onPress }: SettingsRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      {value && <Text style={styles.settingValue}>{value}</Text>}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

/**
 * SettingsScreen - Placeholder with section categories
 *
 * This screen provides access to all app settings organized into logical sections:
 * - Device Management: Manage paired BCI devices
 * - Notification Preferences: Configure notifications and quiet hours
 * - Audio Settings: Audio mixing and volume preferences
 * - Entrainment Settings: Auto-boost and frequency configuration
 * - Theta Threshold: Target z-score and closed-loop behavior
 * - Theme & Accessibility: Visual and interaction preferences
 * - Data Management: Export and clear data
 * - Privacy Settings: Analytics and data sharing
 * - About: App version and device info
 */
export default function SettingsScreen() {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Device Management Section */}
      <SettingsSection
        title="Device Management"
        description="Manage your paired BCI devices"
      >
        <SettingsRow label="Paired Devices" value="None" />
        <SettingsRow label="Auto-Reconnect" value="Enabled" />
        <SettingsRow label="Scan for Devices" />
      </SettingsSection>

      {/* Notification Preferences Section */}
      <SettingsSection
        title="Notification Preferences"
        description="Configure when and how you receive notifications"
      >
        <SettingsRow label="Enable Notifications" value="On" />
        <SettingsRow label="Notification Style" value="Smart" />
        <SettingsRow label="Quiet Hours" value="Off" />
      </SettingsSection>

      {/* Audio Settings Section */}
      <SettingsSection
        title="Audio Settings"
        description="Control audio mixing and playback"
      >
        <SettingsRow label="Audio Mode" value="Mix with Other Apps" />
        <SettingsRow label="Default Volume" value="70%" />
        <SettingsRow label="Mixing Ratio" value="50%" />
      </SettingsSection>

      {/* Entrainment Settings Section */}
      <SettingsSection
        title="Entrainment Settings"
        description="Configure automatic theta entrainment"
      >
        <SettingsRow label="Auto-Boost" value="Disabled" />
        <SettingsRow label="Boost Frequency" value="6.0 Hz" />
        <SettingsRow label="Boost Duration" value="5 min" />
      </SettingsSection>

      {/* Theta Threshold Section */}
      <SettingsSection
        title="Theta Threshold"
        description="Set target theta levels and response behavior"
      >
        <SettingsRow label="Target Z-Score" value="1.0" />
        <SettingsRow label="When Target Reached" value="Reduce Intensity" />
      </SettingsSection>

      {/* Theme & Accessibility Section */}
      <SettingsSection
        title="Theme & Accessibility"
        description="Customize appearance and interactions"
      >
        <SettingsRow label="Text Size" value="Medium" />
        <SettingsRow label="Reduce Motion" value="Off" />
        <SettingsRow label="Haptic Feedback" value="On" />
      </SettingsSection>

      {/* Data Management Section */}
      <SettingsSection
        title="Data Management"
        description="Export or clear your data"
      >
        <SettingsRow label="Export Session Data" />
        <SettingsRow label="Clear Session History" />
        <SettingsRow label="Clear Baseline Data" />
      </SettingsSection>

      {/* Privacy Settings Section */}
      <SettingsSection
        title="Privacy Settings"
        description="Control how your data is used"
      >
        <SettingsRow label="Anonymous Analytics" value="Disabled" />
        <SettingsRow label="A/B Testing" value="Disabled" />
      </SettingsSection>

      {/* About Section */}
      <SettingsSection title="About" description="App and device information">
        <SettingsRow label="App Version" value="1.0.0" />
        <SettingsRow label="Device Type" value="FlowState BCI" />
        <SettingsRow label="Help & Support" />
        <SettingsRow label="Terms of Service" />
        <SettingsRow label="Privacy Policy" />
      </SettingsSection>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>FlowState BCI</Text>
        <Text style={styles.footerSubtext}>
          Cognitive Enhancement Through Theta Entrainment
        </Text>
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
    paddingBottom: Spacing.xxl,
  },
  section: {
    backgroundColor: Colors.surface.primary,
    marginTop: Spacing.md,
    marginHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.md,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
    paddingTop: Spacing.sm,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  settingValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});
