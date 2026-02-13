/**
 * DemoModeBanner Component
 * Persistent banner shown at top of all screens when Demo Mode is enabled
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSettings } from '../contexts/SettingsContext';
import { Colors, Spacing, Typography } from '../constants/theme';

export const DemoModeBanner: React.FC = () => {
  const { settings } = useSettings();

  if (!settings.demo_mode_enabled) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Text style={styles.bannerText}>🎭 INVESTOR DEMO MODE</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.status.yellow,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background.primary,
    letterSpacing: 1,
  },
});
