import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';
import { DeveloperOptions, VersionTapUnlocker } from '../components/DeveloperOptions';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * Collapsible section component with tap to expand/collapse
 */
interface CollapsibleSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

function CollapsibleSection({
  title,
  description,
  children,
  defaultExpanded = false,
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <View style={styles.section}>
      <TouchableOpacity
        onPress={toggleExpanded}
        activeOpacity={0.7}
        style={styles.sectionHeader}
      >
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {description && (
            <Text style={styles.sectionDescription}>{description}</Text>
          )}
        </View>
        <Text style={styles.chevron}>{isExpanded ? '−' : '+'}</Text>
      </TouchableOpacity>
      {isExpanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
}

/**
 * Static section without collapse functionality
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
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {description && (
            <Text style={styles.sectionDescription}>{description}</Text>
          )}
        </View>
      </View>
      <View style={styles.sectionContent}>{children}</View>
    </View>
  );
}

/**
 * Settings row component
 */
interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
}

function SettingsRow({ label, value, onPress, showChevron }: SettingsRowProps) {
  const content = (
    <View style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingValueContainer}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        {showChevron && <Text style={styles.rowChevron}>›</Text>}
      </View>
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
 * SettingsScreen - Clean, collapsible settings UI
 */
export default function SettingsScreen() {
  const { settings, updateSettings } = useSettings();

  const handleUnlockDeveloper = useCallback(() => {
    updateSettings({ developer_mode_enabled: true });
  }, [updateSettings]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Text style={styles.screenTitle}>Settings</Text>

        {/* Device Management */}
        <CollapsibleSection
          title="Device"
          description="Manage BCI devices"
          defaultExpanded={true}
        >
          <SettingsRow label="Paired Devices" value="None" showChevron />
          <SettingsRow label="Auto-Reconnect" value="Enabled" />
          <SettingsRow label="Scan for Devices" showChevron />
        </CollapsibleSection>

        {/* Notifications */}
        <CollapsibleSection title="Notifications" description="Alert preferences">
          <SettingsRow label="Enable Notifications" value="On" />
          <SettingsRow label="Notification Style" value="Smart" />
          <SettingsRow label="Quiet Hours" value="Off" showChevron />
        </CollapsibleSection>

        {/* Audio */}
        <CollapsibleSection title="Audio" description="Sound and mixing">
          <SettingsRow label="Audio Mode" value="Mix" />
          <SettingsRow label="Default Volume" value="70%" />
          <SettingsRow label="Mixing Ratio" value="50%" />
        </CollapsibleSection>

        {/* Entrainment */}
        <CollapsibleSection title="Entrainment" description="Theta boost settings">
          <SettingsRow label="Auto-Boost" value="Off" />
          <SettingsRow label="Boost Frequency" value="6.0 Hz" />
          <SettingsRow label="Boost Duration" value="5 min" />
        </CollapsibleSection>

        {/* Theta Threshold */}
        <CollapsibleSection title="Theta Target" description="Goal settings">
          <SettingsRow label="Target Z-Score" value="1.0" />
          <SettingsRow label="When Target Reached" value="Reduce" />
        </CollapsibleSection>

        {/* Accessibility */}
        <CollapsibleSection title="Accessibility" description="Display options">
          <SettingsRow label="Text Size" value="Medium" />
          <SettingsRow label="Reduce Motion" value="Off" />
          <SettingsRow label="Haptic Feedback" value="On" />
        </CollapsibleSection>

        {/* Data Management */}
        <CollapsibleSection title="Data" description="Export and clear">
          <SettingsRow label="Export Session Data" showChevron />
          <SettingsRow label="Clear Session History" showChevron />
          <SettingsRow label="Clear Baseline Data" showChevron />
        </CollapsibleSection>

        {/* Privacy */}
        <CollapsibleSection title="Privacy" description="Data sharing">
          <SettingsRow label="Anonymous Analytics" value="Off" />
          <SettingsRow label="A/B Testing" value="Off" />
        </CollapsibleSection>

        {/* About - Always expanded */}
        <SettingsSection title="About" description="App information">
          <VersionTapUnlocker
            version="1.0.0"
            onUnlock={handleUnlockDeveloper}
            isUnlocked={settings.developer_mode_enabled}
          />
          <SettingsRow label="Device Type" value="FlowState BCI" />
          <SettingsRow label="Help & Support" showChevron />
          <SettingsRow label="Terms of Service" showChevron />
          <SettingsRow label="Privacy Policy" showChevron />
        </SettingsSection>

        {/* Developer Options - Hidden until unlocked */}
        <DeveloperOptions />

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>FlowState BCI</Text>
          <Text style={styles.footerSubtext}>
            Cognitive Enhancement Through Theta Entrainment
          </Text>
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
    paddingBottom: Spacing.xxl,
  },
  screenTitle: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  section: {
    backgroundColor: Colors.surface.primary,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: 2,
  },
  chevron: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.tertiary,
    fontWeight: Typography.fontWeight.bold,
    width: 24,
    textAlign: 'center',
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    flex: 1,
  },
  settingValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
  },
  rowChevron: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.tertiary,
    marginLeft: Spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  footerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  footerSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.disabled,
    textAlign: 'center',
  },
});
