import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Shadows,
} from '../constants/theme';
import type { CalibrationState } from '../types';

/**
 * CalibrationScreen - Placeholder for the calibration flow
 *
 * This screen guides users through the baseline calibration process:
 * 1. Instructions - Initial setup guidance
 * 2. Countdown - 30-second settle period
 * 3. Recording - Active EEG data collection
 * 4. Processing - Backend processing of collected data
 * 5. Complete - Display baseline results
 */

interface CalibrationScreenProps {
  onComplete?: () => void;
  onCancel?: () => void;
}

const CalibrationScreen: React.FC<CalibrationScreenProps> = ({
  onComplete,
  onCancel,
}) => {
  const { calibrationState, setCalibrationState } = useSession();

  useEffect(() => {
    // Initialize calibration state when screen mounts
    setCalibrationState('instructions');

    return () => {
      // Clean up calibration state when screen unmounts
      setCalibrationState(null);
    };
  }, [setCalibrationState]);

  const handleStartCalibration = () => {
    setCalibrationState('countdown');
  };

  const handleCancel = () => {
    setCalibrationState(null);
    onCancel?.();
  };

  const renderStateContent = (state: CalibrationState | null) => {
    switch (state) {
      case 'instructions':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>Calibration Setup</Text>
            <Text style={styles.stateDescription}>
              We'll record your baseline brain activity to personalize your
              experience.
            </Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>
                1. Find a quiet, comfortable space
              </Text>
              <Text style={styles.instructionItem}>
                2. Ensure your headband is properly positioned
              </Text>
              <Text style={styles.instructionItem}>
                3. Close your eyes and relax during recording
              </Text>
            </View>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleStartCalibration}
            >
              <Text style={styles.primaryButtonText}>Begin Calibration</Text>
            </TouchableOpacity>
          </View>
        );

      case 'countdown':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>Get Ready</Text>
            <Text style={styles.countdownText}>30</Text>
            <Text style={styles.stateDescription}>
              Recording will begin shortly. Please relax and close your eyes.
            </Text>
          </View>
        );

      case 'recording':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>Recording</Text>
            <View style={styles.progressIndicator}>
              <View style={styles.progressBar} />
            </View>
            <Text style={styles.stateDescription}>
              Please remain still with your eyes closed.
            </Text>
            <Text style={styles.signalQualityLabel}>Signal Quality: Good</Text>
          </View>
        );

      case 'processing':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>Processing</Text>
            <Text style={styles.stateDescription}>
              Analyzing your baseline brain activity...
            </Text>
          </View>
        );

      case 'complete':
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>Calibration Complete</Text>
            <Text style={styles.stateDescription}>
              Your baseline has been established successfully.
            </Text>
            <View style={styles.resultCard}>
              <Text style={styles.resultLabel}>Quality Score</Text>
              <Text style={styles.resultValue}>85%</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton} onPress={onComplete}>
              <Text style={styles.primaryButtonText}>Continue</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.stateContainer}>
            <Text style={styles.stateTitle}>Calibration</Text>
            <Text style={styles.stateDescription}>
              Initializing calibration...
            </Text>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calibration</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>{renderStateContent(calibrationState)}</View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Step {getStepNumber(calibrationState)} of 5
        </Text>
      </View>
    </SafeAreaView>
  );
};

const getStepNumber = (state: CalibrationState | null): number => {
  switch (state) {
    case 'instructions':
      return 1;
    case 'countdown':
      return 2;
    case 'recording':
      return 3;
    case 'processing':
      return 4;
    case 'complete':
      return 5;
    default:
      return 1;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  cancelButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.main,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  stateContainer: {
    alignItems: 'center',
  },
  stateTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  stateDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    marginBottom: Spacing.lg,
  },
  instructionsList: {
    alignSelf: 'stretch',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  instructionItem: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    marginBottom: Spacing.sm,
  },
  primaryButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
    textAlign: 'center',
  },
  countdownText: {
    fontSize: Typography.fontSize.xxxl * 2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    marginVertical: Spacing.xl,
  },
  progressIndicator: {
    width: '80%',
    height: 8,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.round,
    marginVertical: Spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    width: '50%',
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.round,
  },
  signalQualityLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.signal.good,
    marginTop: Spacing.md,
  },
  resultCard: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    ...Shadows.md,
  },
  resultLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  resultValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.success,
  },
  footer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  footerText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
});

export default CalibrationScreen;
