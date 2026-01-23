/**
 * Settings Screen - Configure app preferences and device settings
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants/theme';
import { SimulatedModeDebugView } from '../../../src/components';

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

interface SettingsRowProps {
  label: string;
  value?: string;
  onPress?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ label, value, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={onPress}
    disabled={!onPress}
    accessibilityRole={onPress ? 'button' : 'text'}
  >
    <Text style={styles.rowLabel}>{label}</Text>
    {value && <Text style={styles.rowValue}>{value}</Text>}
  </TouchableOpacity>
);

const SettingsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Configure your experience</Text>

        <SettingsSection title="Device">
          <SettingsRow label="Connected Device" value="None" />
          <SettingsRow label="Auto-reconnect" value="On" />
        </SettingsSection>

        <SettingsSection title="Sessions">
          <SettingsRow label="Default Duration" value="30 min" />
          <SettingsRow label="Target Frequency" value="6.0 Hz" />
          <SettingsRow label="Volume" value="50%" />
        </SettingsSection>

        <SettingsSection title="Notifications">
          <SettingsRow label="Reminders" value="On" />
          <SettingsRow label="Session Alerts" value="On" />
        </SettingsSection>

        <SettingsSection title="About">
          <SettingsRow label="Version" value="1.0.0" />
          <SettingsRow label="Privacy Policy" onPress={() => {}} />
          <SettingsRow label="Terms of Service" onPress={() => {}} />
        </SettingsSection>

        {/* Developer Tools - Simulated Mode */}
        <SettingsSection title="Developer">
          <View style={styles.debugViewContainer}>
            <SimulatedModeDebugView testID="simulated-mode-debug" />
          </View>
        </SettingsSection>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginTop: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  sectionContent: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  rowLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  rowValue: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
  },
  debugViewContainer: {
    padding: Spacing.sm,
  },
});

export default SettingsScreen;
