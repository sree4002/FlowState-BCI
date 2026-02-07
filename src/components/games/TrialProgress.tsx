/**
 * TrialProgress Component
 * Shows progress through game trials
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

export interface TrialProgressProps {
  currentTrial: number;
  totalTrials: number;
  correctTrials: number;
  testID?: string;
}

export const TrialProgress: React.FC<TrialProgressProps> = ({
  currentTrial,
  totalTrials,
  correctTrials,
  testID,
}) => {
  const progress = totalTrials > 0 ? currentTrial / totalTrials : 0;
  const accuracy = currentTrial > 0 ? (correctTrials / currentTrial) * 100 : 0;

  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.header}>
        <Text style={styles.trialText}>
          Trial {currentTrial} of {totalTrials}
        </Text>
        <Text style={styles.accuracyText}>{accuracy.toFixed(0)}% Correct</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  trialText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  accuracyText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.accent.primary,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.sm,
  },
});
