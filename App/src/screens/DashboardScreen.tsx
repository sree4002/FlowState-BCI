/**
 * Dashboard Screen - Main entry point showing device status and quick actions
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { DashboardScreenProps } from '../navigation/types';
import { Colors, Spacing, Typography, BorderRadius } from '../../../src/constants/theme';

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<DashboardScreenProps['navigation']>();

  const handleStartSession = () => {
    navigation.navigate('Session');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>FlowState BCI</Text>
        <Text style={styles.subtitle}>Brain-Computer Interface</Text>

        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Device Status</Text>
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, styles.statusDisconnected]} />
            <Text style={styles.statusText}>Not Connected</Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleStartSession}
            accessibilityRole="button"
            accessibilityLabel="Start a new session"
          >
            <Text style={styles.actionButtonText}>Start Session</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('History')}
            accessibilityRole="button"
            accessibilityLabel="View session history"
          >
            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>
              View History
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  statusCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  statusLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  statusDisconnected: {
    backgroundColor: Colors.status.yellow,
  },
  statusConnected: {
    backgroundColor: Colors.status.green,
  },
  statusText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
  },
  quickActions: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },
  actionButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  secondaryButtonText: {
    color: Colors.primary.main,
  },
});

export default DashboardScreen;
