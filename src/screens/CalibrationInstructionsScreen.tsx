import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { useDevice } from '../contexts/DeviceContext';
import { useSession } from '../contexts/SessionContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Calibration instruction step data
 */
export interface CalibrationStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  tips: string[];
  importance: 'required' | 'recommended' | 'optional';
}

/**
 * Props for CalibrationInstructionsScreen
 */
export interface CalibrationInstructionsScreenProps {
  onStartCalibration?: () => void;
  onCancel?: () => void;
  onSkip?: () => void;
  duration?: 5 | 10;
  testID?: string;
}

/**
 * Default calibration steps for device setup guidance
 */
export const CALIBRATION_STEPS: CalibrationStep[] = [
  {
    id: 'environment',
    title: 'Prepare Your Environment',
    description:
      'Find a quiet, comfortable space where you can relax for 5-10 minutes without interruptions.',
    icon: '🏠',
    tips: [
      'Dim the lights or use soft lighting',
      'Minimize background noise and distractions',
      'Ensure a comfortable room temperature',
      'Silence your phone notifications',
    ],
    importance: 'required',
  },
  {
    id: 'device',
    title: 'Position Your Device',
    description:
      'Ensure your FlowState headband or earpiece is properly positioned for optimal signal quality.',
    icon: '🎧',
    tips: [
      'For headbands: Center the sensors on your forehead',
      'Ensure snug but comfortable fit',
      'Check that sensors make contact with skin',
      'Remove hair from sensor contact points',
    ],
    importance: 'required',
  },
  {
    id: 'connection',
    title: 'Verify Connection',
    description:
      'Make sure your device is connected and showing good signal quality.',
    icon: '📡',
    tips: [
      'Check the connection status indicator',
      'Signal quality should be "Good" or better',
      'Stay within 2 meters of your phone',
      'Avoid metal objects near the device',
    ],
    importance: 'required',
  },
  {
    id: 'relax',
    title: 'Get Comfortable',
    description:
      'Sit in a comfortable position and prepare to relax during the calibration recording.',
    icon: '🧘',
    tips: [
      'Sit upright in a comfortable chair',
      'Keep your eyes closed during recording',
      'Breathe naturally and stay relaxed',
      'Minimize movement and muscle tension',
    ],
    importance: 'recommended',
  },
];

/**
 * Get importance badge color based on importance level
 */
export const getImportanceColor = (
  importance: 'required' | 'recommended' | 'optional'
): string => {
  switch (importance) {
    case 'required':
      return Colors.accent.error;
    case 'recommended':
      return Colors.accent.warning;
    case 'optional':
      return Colors.accent.info;
    default:
      return Colors.text.tertiary;
  }
};

/**
 * Get importance badge label
 */
export const getImportanceLabel = (
  importance: 'required' | 'recommended' | 'optional'
): string => {
  switch (importance) {
    case 'required':
      return 'Required';
    case 'recommended':
      return 'Recommended';
    case 'optional':
      return 'Optional';
    default:
      return '';
  }
};

/**
 * Format duration as human-readable string
 */
export const formatDurationOption = (minutes: number): string => {
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};

/**
 * Get duration description text
 */
export const getDurationDescription = (minutes: 5 | 10): string => {
  if (minutes === 5) {
    return 'Quick calibration - good for most users';
  }
  return 'Extended calibration - more accurate baseline';
};

/**
 * Check if device is ready for calibration
 */
export const isDeviceReadyForCalibration = (
  isConnected: boolean,
  signalQuality: number | null
): { ready: boolean; reason: string } => {
  if (!isConnected) {
    return {
      ready: false,
      reason: 'Please connect your device first',
    };
  }
  if (signalQuality === null) {
    return {
      ready: false,
      reason: 'Waiting for signal quality data',
    };
  }
  if (signalQuality < 20) {
    return {
      ready: false,
      reason: 'Signal quality too low. Please adjust your device.',
    };
  }
  return {
    ready: true,
    reason: '',
  };
};

/**
 * Get signal quality status for display
 */
export const getSignalQualityStatus = (
  score: number | null
): { label: string; color: string } => {
  if (score === null) {
    return { label: 'Unknown', color: Colors.text.disabled };
  }
  if (score >= 80) {
    return { label: 'Excellent', color: Colors.signal.excellent };
  }
  if (score >= 60) {
    return { label: 'Good', color: Colors.signal.good };
  }
  if (score >= 40) {
    return { label: 'Fair', color: Colors.signal.fair };
  }
  if (score >= 20) {
    return { label: 'Poor', color: Colors.signal.poor };
  }
  return { label: 'Critical', color: Colors.signal.critical };
};

/**
 * CalibrationInstructionsScreen component
 * Provides comprehensive device setup guidance before starting calibration
 */
export const CalibrationInstructionsScreen: React.FC<
  CalibrationInstructionsScreenProps
> = ({
  onStartCalibration,
  onCancel,
  onSkip,
  duration = 5,
  testID = 'calibration-instructions-screen',
}) => {
  // Context
  const { deviceInfo, signalQuality } = useDevice();
  const { setCalibrationState, setSessionConfig } = useSession();

  // State
  const [selectedDuration, setSelectedDuration] = useState<5 | 10>(duration);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [allStepsViewed, setAllStepsViewed] = useState(false);
  const [isExpanded, setIsExpanded] = useState<Record<string, boolean>>({});

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Check device readiness
  const isConnected = deviceInfo?.is_connected ?? false;
  const signalScore = signalQuality?.score ?? null;
  const deviceReadiness = isDeviceReadyForCalibration(isConnected, signalScore);
  const signalStatus = getSignalQualityStatus(signalScore);

  // Animate on mount
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  /**
   * Handle step expansion toggle
   */
  const toggleStepExpanded = useCallback((stepId: string) => {
    setIsExpanded((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  }, []);

  /**
   * Handle viewing next step
   */
  const handleNextStep = useCallback(() => {
    if (currentStepIndex < CALIBRATION_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setAllStepsViewed(true);
    }
  }, [currentStepIndex]);

  /**
   * Handle viewing previous step
   */
  const handlePreviousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  /**
   * Handle duration selection
   */
  const handleDurationSelect = useCallback((dur: 5 | 10) => {
    setSelectedDuration(dur);
  }, []);

  /**
   * Handle start calibration
   */
  const handleStartCalibration = useCallback(() => {
    if (!deviceReadiness.ready) {
      Alert.alert('Device Not Ready', deviceReadiness.reason, [
        { text: 'OK', style: 'default' },
      ]);
      return;
    }

    // Set session config with selected duration
    setSessionConfig({
      type: 'calibration',
      duration_minutes: selectedDuration,
      entrainment_freq: 6.0,
      volume: 0,
      target_zscore: 1.0,
      closed_loop_behavior: 'maintain_level',
    });

    // Transition to countdown state
    setCalibrationState('countdown');

    // Notify parent
    if (onStartCalibration) {
      onStartCalibration();
    }
  }, [
    deviceReadiness,
    selectedDuration,
    setSessionConfig,
    setCalibrationState,
    onStartCalibration,
  ]);

  /**
   * Handle cancel calibration
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Calibration?',
      'Your progress will not be saved. You can restart calibration later.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            setCalibrationState(null);
            if (onCancel) {
              onCancel();
            }
          },
        },
      ]
    );
  }, [setCalibrationState, onCancel]);

  /**
   * Handle skip calibration
   */
  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Calibration?',
      'Without calibration, theta monitoring may be less accurate. You can calibrate later from Settings.',
      [
        { text: 'Continue Setup', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            setCalibrationState(null);
            if (onSkip) {
              onSkip();
            }
          },
        },
      ]
    );
  }, [setCalibrationState, onSkip]);

  /**
   * Render a single calibration step card
   */
  const renderStepCard = (step: CalibrationStep, index: number) => {
    const isActive = index === currentStepIndex;
    const isViewed = index < currentStepIndex;
    const expanded = isExpanded[step.id] ?? isActive;

    return (
      <TouchableOpacity
        key={step.id}
        style={[
          styles.stepCard,
          isActive && styles.stepCardActive,
          isViewed && styles.stepCardViewed,
        ]}
        onPress={() => toggleStepExpanded(step.id)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`Step ${index + 1}: ${step.title}`}
        accessibilityHint="Tap to expand or collapse step details"
        testID={`step-card-${step.id}`}
      >
        <View style={styles.stepHeader}>
          <View style={styles.stepIconContainer}>
            <Text style={styles.stepIcon}>{step.icon}</Text>
          </View>
          <View style={styles.stepHeaderContent}>
            <View style={styles.stepTitleRow}>
              <Text style={styles.stepNumber}>Step {index + 1}</Text>
              <View
                style={[
                  styles.importanceBadge,
                  { backgroundColor: getImportanceColor(step.importance) },
                ]}
              >
                <Text style={styles.importanceBadgeText}>
                  {getImportanceLabel(step.importance)}
                </Text>
              </View>
            </View>
            <Text style={styles.stepTitle}>{step.title}</Text>
          </View>
          <Text style={styles.expandIcon}>{expanded ? '▼' : '▶'}</Text>
        </View>

        {expanded && (
          <View style={styles.stepContent}>
            <Text style={styles.stepDescription}>{step.description}</Text>
            <View style={styles.tipsContainer}>
              <Text style={styles.tipsHeader}>Tips:</Text>
              {step.tips.map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.tipRow}>
                  <Text style={styles.tipBullet}>•</Text>
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {isViewed && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedIcon}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  /**
   * Render device status section
   */
  const renderDeviceStatus = () => (
    <View style={styles.deviceStatusContainer} testID="device-status">
      <Text style={styles.sectionTitle}>Device Status</Text>
      <View style={styles.deviceStatusCard}>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Connection</Text>
          <View style={styles.statusValueRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isConnected
                    ? Colors.accent.success
                    : Colors.accent.error,
                },
              ]}
            />
            <Text
              style={[
                styles.statusValue,
                {
                  color: isConnected
                    ? Colors.text.primary
                    : Colors.accent.error,
                },
              ]}
            >
              {isConnected ? 'Connected' : 'Not Connected'}
            </Text>
          </View>
        </View>

        {isConnected && deviceInfo && (
          <>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Device</Text>
              <Text style={styles.statusValue}>{deviceInfo.name}</Text>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Signal Quality</Text>
              <View style={styles.statusValueRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: signalStatus.color },
                  ]}
                />
                <Text
                  style={[styles.statusValue, { color: signalStatus.color }]}
                >
                  {signalStatus.label}
                  {signalScore !== null && ` (${signalScore}%)`}
                </Text>
              </View>
            </View>
            <View style={styles.statusDivider} />
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Battery</Text>
              <Text style={styles.statusValue}>
                {deviceInfo.battery_level ?? '--'}%
              </Text>
            </View>
          </>
        )}

        {!deviceReadiness.ready && (
          <View style={styles.warningBanner}>
            <Text style={styles.warningIcon}>⚠️</Text>
            <Text style={styles.warningText}>{deviceReadiness.reason}</Text>
          </View>
        )}
      </View>
    </View>
  );

  /**
   * Render duration selector
   */
  const renderDurationSelector = () => (
    <View style={styles.durationContainer} testID="duration-selector">
      <Text style={styles.sectionTitle}>Calibration Duration</Text>
      <View style={styles.durationOptions}>
        {[5, 10].map((dur) => (
          <TouchableOpacity
            key={dur}
            style={[
              styles.durationOption,
              selectedDuration === dur && styles.durationOptionSelected,
            ]}
            onPress={() => handleDurationSelect(dur as 5 | 10)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedDuration === dur }}
            accessibilityLabel={`${dur} minutes calibration`}
            testID={`duration-option-${dur}`}
          >
            <Text
              style={[
                styles.durationValue,
                selectedDuration === dur && styles.durationValueSelected,
              ]}
            >
              {dur}
            </Text>
            <Text
              style={[
                styles.durationUnit,
                selectedDuration === dur && styles.durationUnitSelected,
              ]}
            >
              min
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.durationDescription}>
        {getDurationDescription(selectedDuration)}
      </Text>
    </View>
  );

  /**
   * Render what to expect section
   */
  const renderWhatToExpect = () => (
    <View style={styles.expectContainer} testID="what-to-expect">
      <Text style={styles.sectionTitle}>What to Expect</Text>
      <View style={styles.expectCard}>
        <View style={styles.expectItem}>
          <Text style={styles.expectIcon}>⏱️</Text>
          <View style={styles.expectContent}>
            <Text style={styles.expectTitle}>30-Second Settle Period</Text>
            <Text style={styles.expectDescription}>
              Time to relax and let the signal stabilize
            </Text>
          </View>
        </View>
        <View style={styles.expectDivider} />
        <View style={styles.expectItem}>
          <Text style={styles.expectIcon}>📊</Text>
          <View style={styles.expectContent}>
            <Text style={styles.expectTitle}>Brain Activity Recording</Text>
            <Text style={styles.expectDescription}>
              {formatDurationOption(selectedDuration)} of baseline measurement
            </Text>
          </View>
        </View>
        <View style={styles.expectDivider} />
        <View style={styles.expectItem}>
          <Text style={styles.expectIcon}>✨</Text>
          <View style={styles.expectContent}>
            <Text style={styles.expectTitle}>Personalized Baseline</Text>
            <Text style={styles.expectDescription}>
              Your unique theta profile for accurate tracking
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          accessibilityRole="button"
          accessibilityLabel="Cancel calibration"
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Calibration Setup</Text>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          accessibilityRole="button"
          accessibilityLabel="Skip calibration"
          testID="skip-button"
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <View style={styles.introContainer}>
            <Text style={styles.introIcon}>🧠</Text>
            <Text style={styles.introTitle}>
              Let&apos;s Calibrate Your Baseline
            </Text>
            <Text style={styles.introDescription}>
              Calibration records your unique brain activity patterns to provide
              accurate, personalized theta monitoring.
            </Text>
          </View>

          {/* Device Status */}
          {renderDeviceStatus()}

          {/* Setup Steps */}
          <View style={styles.stepsContainer} testID="setup-steps">
            <Text style={styles.sectionTitle}>Setup Checklist</Text>
            {CALIBRATION_STEPS.map((step, index) =>
              renderStepCard(step, index)
            )}
          </View>

          {/* Step Navigation */}
          {!allStepsViewed && (
            <View style={styles.stepNavigation}>
              <TouchableOpacity
                style={[
                  styles.navButton,
                  currentStepIndex === 0 && styles.navButtonDisabled,
                ]}
                onPress={handlePreviousStep}
                disabled={currentStepIndex === 0}
                accessibilityRole="button"
                accessibilityLabel="Previous step"
                testID="prev-step-button"
              >
                <Text
                  style={[
                    styles.navButtonText,
                    currentStepIndex === 0 && styles.navButtonTextDisabled,
                  ]}
                >
                  ← Previous
                </Text>
              </TouchableOpacity>
              <Text style={styles.stepProgress}>
                {currentStepIndex + 1} / {CALIBRATION_STEPS.length}
              </Text>
              <TouchableOpacity
                style={styles.navButton}
                onPress={handleNextStep}
                accessibilityRole="button"
                accessibilityLabel={
                  currentStepIndex === CALIBRATION_STEPS.length - 1
                    ? 'Mark all steps reviewed'
                    : 'Next step'
                }
                testID="next-step-button"
              >
                <Text style={styles.navButtonText}>
                  {currentStepIndex === CALIBRATION_STEPS.length - 1
                    ? 'Done'
                    : 'Next →'}
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Duration Selector */}
          {renderDurationSelector()}

          {/* What to Expect */}
          {renderWhatToExpect()}
        </ScrollView>
      </Animated.View>

      {/* Footer with Start Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.startButton,
            !deviceReadiness.ready && styles.startButtonDisabled,
          ]}
          onPress={handleStartCalibration}
          disabled={!deviceReadiness.ready}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Begin calibration"
          accessibilityHint={
            deviceReadiness.ready
              ? 'Starts the calibration process'
              : deviceReadiness.reason
          }
          accessibilityState={{ disabled: !deviceReadiness.ready }}
          testID="start-calibration-button"
        >
          <Text
            style={[
              styles.startButtonText,
              !deviceReadiness.ready && styles.startButtonTextDisabled,
            ]}
          >
            Begin Calibration
          </Text>
        </TouchableOpacity>
        <Text style={styles.footerNote}>
          Estimated time: {formatDurationOption(selectedDuration)} + 30 seconds
        </Text>
      </View>
    </View>
  );
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
    paddingTop: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
    paddingBottom: Spacing.md,
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
  skipButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.tertiary,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  introContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  introIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  introTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  introDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    maxWidth: SCREEN_WIDTH * 0.85,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  deviceStatusContainer: {
    marginBottom: Spacing.xl,
  },
  deviceStatusCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statusLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  statusValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  statusDivider: {
    height: 1,
    backgroundColor: Colors.border.secondary,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  warningIcon: {
    fontSize: 16,
    marginRight: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.warning,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  stepsContainer: {
    marginBottom: Spacing.xl,
  },
  stepCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.secondary,
    ...Shadows.sm,
  },
  stepCardActive: {
    borderColor: Colors.primary.main,
    borderWidth: 2,
  },
  stepCardViewed: {
    borderColor: Colors.accent.success,
    borderWidth: 1,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  stepIcon: {
    fontSize: 24,
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepNumber: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginRight: Spacing.sm,
  },
  importanceBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  importanceBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.inverse,
  },
  stepTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  expandIcon: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginLeft: Spacing.sm,
  },
  stepContent: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  stepDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    marginBottom: Spacing.md,
  },
  tipsContainer: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  tipsHeader: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  tipBullet: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary.main,
    marginRight: Spacing.sm,
    width: 12,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  completedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.accent.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedIcon: {
    fontSize: 14,
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.bold,
  },
  stepNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xl,
  },
  navButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary.main,
    fontWeight: Typography.fontWeight.medium,
  },
  navButtonTextDisabled: {
    color: Colors.text.disabled,
  },
  stepProgress: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  durationContainer: {
    marginBottom: Spacing.xl,
  },
  durationOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  durationOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.secondary,
    ...Shadows.sm,
  },
  durationOptionSelected: {
    borderColor: Colors.primary.main,
    backgroundColor: Colors.surface.elevated,
  },
  durationValue: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.secondary,
  },
  durationValueSelected: {
    color: Colors.primary.main,
  },
  durationUnit: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.tertiary,
    marginLeft: Spacing.xs,
  },
  durationUnitSelected: {
    color: Colors.primary.light,
  },
  durationDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  expectContainer: {
    marginBottom: Spacing.lg,
  },
  expectCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  expectItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.sm,
  },
  expectIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  expectContent: {
    flex: 1,
  },
  expectTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  expectDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  expectDivider: {
    height: 1,
    backgroundColor: Colors.border.secondary,
    marginVertical: Spacing.sm,
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
    backgroundColor: Colors.background.primary,
  },
  startButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  startButtonDisabled: {
    backgroundColor: Colors.interactive.disabled,
  },
  startButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  startButtonTextDisabled: {
    color: Colors.text.disabled,
  },
  footerNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CalibrationInstructionsScreen;
