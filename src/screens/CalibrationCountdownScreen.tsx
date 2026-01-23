import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  Alert,
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
import { SignalQuality } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Default countdown duration in seconds (30 seconds)
 */
export const DEFAULT_COUNTDOWN_DURATION = 30;

/**
 * Countdown state type
 */
export type CountdownState = 'waiting' | 'counting' | 'complete' | 'cancelled';

/**
 * Props for CalibrationCountdownScreen
 */
export interface CalibrationCountdownScreenProps {
  onCountdownComplete?: () => void;
  onCancel?: () => void;
  duration?: number;
  testID?: string;
}

/**
 * Format seconds as MM:SS display
 */
export const formatCountdownTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds as human-readable string
 */
export const formatCountdownLabel = (seconds: number): string => {
  if (seconds <= 0) return 'Complete';
  if (seconds === 1) return '1 second';
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return mins === 1 ? '1 minute' : `${mins} minutes`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')} minutes`;
};

/**
 * Get countdown progress percentage (0-100)
 */
export const getCountdownProgress = (
  remaining: number,
  total: number
): number => {
  if (total <= 0) return 100;
  const progress = ((total - remaining) / total) * 100;
  return Math.min(100, Math.max(0, progress));
};

/**
 * Get signal quality status for display during countdown
 */
export const getCountdownSignalStatus = (
  quality: SignalQuality | null
): { label: string; color: string; isGood: boolean } => {
  if (!quality || quality.score === undefined) {
    return { label: 'Unknown', color: Colors.text.disabled, isGood: false };
  }
  const score = quality.score;
  if (score >= 80) {
    return { label: 'Excellent', color: Colors.signal.excellent, isGood: true };
  }
  if (score >= 60) {
    return { label: 'Good', color: Colors.signal.good, isGood: true };
  }
  if (score >= 40) {
    return { label: 'Fair', color: Colors.signal.fair, isGood: true };
  }
  if (score >= 20) {
    return { label: 'Poor', color: Colors.signal.poor, isGood: false };
  }
  return { label: 'Critical', color: Colors.signal.critical, isGood: false };
};

/**
 * Get instruction text based on countdown state and remaining time
 */
export const getCountdownInstruction = (
  state: CountdownState,
  remaining: number
): string => {
  switch (state) {
    case 'waiting':
      return 'Preparing to start...';
    case 'counting':
      if (remaining > 20) {
        return 'Close your eyes and relax';
      }
      if (remaining > 10) {
        return 'Breathe slowly and deeply';
      }
      if (remaining > 5) {
        return 'Let your mind settle';
      }
      return 'Almost ready...';
    case 'complete':
      return 'Ready to begin calibration!';
    case 'cancelled':
      return 'Countdown cancelled';
    default:
      return '';
  }
};

/**
 * Get countdown state color
 */
export const getCountdownStateColor = (state: CountdownState): string => {
  switch (state) {
    case 'waiting':
      return Colors.text.tertiary;
    case 'counting':
      return Colors.primary.main;
    case 'complete':
      return Colors.accent.success;
    case 'cancelled':
      return Colors.accent.error;
    default:
      return Colors.text.primary;
  }
};

/**
 * Get countdown accessibility label
 */
export const getCountdownAccessibilityLabel = (
  state: CountdownState,
  remaining: number
): string => {
  switch (state) {
    case 'waiting':
      return 'Preparing countdown, please wait';
    case 'counting':
      return `${remaining} seconds remaining in settle period`;
    case 'complete':
      return 'Settle period complete, ready to begin calibration';
    case 'cancelled':
      return 'Countdown cancelled';
    default:
      return 'Countdown';
  }
};

/**
 * CalibrationCountdownScreen component
 * Provides a 30-second settle period before calibration starts
 */
export const CalibrationCountdownScreen: React.FC<
  CalibrationCountdownScreenProps
> = ({
  onCountdownComplete,
  onCancel,
  duration = DEFAULT_COUNTDOWN_DURATION,
  testID = 'calibration-countdown-screen',
}) => {
  // Context
  const { signalQuality } = useDevice();
  const { setCalibrationState } = useSession();

  // State
  const [countdownState, setCountdownState] =
    useState<CountdownState>('waiting');
  const [remainingSeconds, setRemainingSeconds] = useState<number>(duration);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Calculate progress
  const progress = getCountdownProgress(remainingSeconds, duration);
  const signalStatus = getCountdownSignalStatus(signalQuality);
  const instruction = getCountdownInstruction(countdownState, remainingSeconds);

  /**
   * Start entrance animation
   */
  const startEntranceAnimation = useCallback(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  /**
   * Start pulse animation for the countdown circle
   */
  const startPulseAnimation = useCallback(() => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  /**
   * Stop pulse animation
   */
  const stopPulseAnimation = useCallback(() => {
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  }, [pulseAnim]);

  /**
   * Update progress animation
   */
  const updateProgressAnimation = useCallback(
    (newProgress: number) => {
      Animated.timing(progressAnim, {
        toValue: newProgress,
        duration: 200,
        useNativeDriver: false,
      }).start();
    },
    [progressAnim]
  );

  /**
   * Start the countdown timer
   */
  const startCountdown = useCallback(() => {
    setCountdownState('counting');
    startPulseAnimation();

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          return 0;
        }
        return newValue;
      });
    }, 1000);
  }, [startPulseAnimation]);

  /**
   * Pause the countdown
   */
  const pauseCountdown = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsPaused(true);
    stopPulseAnimation();
  }, [stopPulseAnimation]);

  /**
   * Resume the countdown
   */
  const resumeCountdown = useCallback(() => {
    setIsPaused(false);
    startPulseAnimation();

    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        const newValue = prev - 1;
        if (newValue <= 0) {
          return 0;
        }
        return newValue;
      });
    }, 1000);
  }, [startPulseAnimation]);

  /**
   * Handle cancel
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Calibration?',
      'Are you sure you want to cancel? You can restart calibration later.',
      [
        { text: 'Continue', style: 'cancel' },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            setCountdownState('cancelled');
            stopPulseAnimation();
            setCalibrationState(null);
            if (onCancel) {
              onCancel();
            }
          },
        },
      ]
    );
  }, [setCalibrationState, onCancel, stopPulseAnimation]);

  /**
   * Handle countdown complete
   */
  const handleComplete = useCallback(() => {
    setCountdownState('complete');
    stopPulseAnimation();
    setCalibrationState('recording');
    if (onCountdownComplete) {
      onCountdownComplete();
    }
  }, [setCalibrationState, onCountdownComplete, stopPulseAnimation]);

  // Initialize on mount
  useEffect(() => {
    startEntranceAnimation();

    // Start countdown after a brief delay
    const startDelay = setTimeout(() => {
      startCountdown();
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startEntranceAnimation, startCountdown]);

  // Handle countdown completion
  useEffect(() => {
    if (remainingSeconds <= 0 && countdownState === 'counting') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      handleComplete();
    }
  }, [remainingSeconds, countdownState, handleComplete]);

  // Update progress animation
  useEffect(() => {
    updateProgressAnimation(progress);
  }, [progress, updateProgressAnimation]);

  /**
   * Render the countdown circle
   */
  const renderCountdownCircle = () => {
    const circleSize = SCREEN_WIDTH * 0.6;
    const strokeWidth = 12;

    return (
      <Animated.View
        style={[
          styles.countdownCircleContainer,
          {
            width: circleSize,
            height: circleSize,
            transform: [{ scale: pulseAnim }],
          },
        ]}
        testID="countdown-circle"
      >
        {/* Background circle */}
        <View
          style={[
            styles.circleBackground,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />

        {/* Progress circle (using Animated.View with border) */}
        <Animated.View
          style={[
            styles.circleProgress,
            {
              width: circleSize,
              height: circleSize,
              borderRadius: circleSize / 2,
              borderWidth: strokeWidth,
              borderColor: getCountdownStateColor(countdownState),
              opacity: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />

        {/* Center content */}
        <View style={styles.circleCenter}>
          <Text
            style={styles.countdownTime}
            accessibilityLabel={getCountdownAccessibilityLabel(
              countdownState,
              remainingSeconds
            )}
            testID="countdown-time"
          >
            {formatCountdownTime(remainingSeconds)}
          </Text>
          <Text style={styles.countdownLabel} testID="countdown-label">
            {formatCountdownLabel(remainingSeconds)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  /**
   * Render signal quality indicator
   */
  const renderSignalIndicator = () => (
    <View style={styles.signalContainer} testID="signal-indicator">
      <View style={styles.signalRow}>
        <View
          style={[styles.signalDot, { backgroundColor: signalStatus.color }]}
        />
        <Text style={styles.signalLabel}>Signal Quality:</Text>
        <Text style={[styles.signalValue, { color: signalStatus.color }]}>
          {signalStatus.label}
        </Text>
      </View>
      {!signalStatus.isGood && (
        <Text style={styles.signalWarning}>
          Signal quality is low. Please adjust your device for better results.
        </Text>
      )}
    </View>
  );

  /**
   * Render instruction text
   */
  const renderInstruction = () => (
    <View style={styles.instructionContainer} testID="instruction">
      <Text style={styles.instructionIcon}>
        {countdownState === 'complete' ? '✓' : '🧘'}
      </Text>
      <Text style={styles.instructionText}>{instruction}</Text>
    </View>
  );

  /**
   * Render progress bar (alternative to circle for accessibility)
   */
  const renderProgressBar = () => (
    <View style={styles.progressBarContainer} testID="progress-bar">
      <View style={styles.progressBarBackground}>
        <Animated.View
          style={[
            styles.progressBarFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: getCountdownStateColor(countdownState),
            },
          ]}
        />
      </View>
      <Text style={styles.progressText}>{Math.round(progress)}% complete</Text>
    </View>
  );

  /**
   * Render tips section
   */
  const renderTips = () => (
    <View style={styles.tipsContainer} testID="tips">
      <Text style={styles.tipsTitle}>During this time:</Text>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Keep your eyes closed</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Breathe slowly and naturally</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Minimize movement</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Let your thoughts drift</Text>
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
          accessibilityLabel="Cancel countdown"
          testID="cancel-button"
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settle Period</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Title section */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Preparing for Calibration</Text>
          <Text style={styles.subtitle}>
            Please relax while the signal stabilizes
          </Text>
        </View>

        {/* Countdown circle */}
        {renderCountdownCircle()}

        {/* Instruction */}
        {renderInstruction()}

        {/* Signal indicator */}
        {renderSignalIndicator()}

        {/* Progress bar */}
        {renderProgressBar()}

        {/* Tips */}
        {countdownState === 'counting' && renderTips()}
      </Animated.View>

      {/* Footer */}
      <View style={styles.footer}>
        {countdownState === 'counting' && !isPaused && (
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={pauseCountdown}
            accessibilityRole="button"
            accessibilityLabel="Pause countdown"
            testID="pause-button"
          >
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
        )}
        {countdownState === 'counting' && isPaused && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={resumeCountdown}
            accessibilityRole="button"
            accessibilityLabel="Resume countdown"
            testID="resume-button"
          >
            <Text style={styles.resumeButtonText}>Resume</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.footerNote}>
          Calibration will begin automatically when complete
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
    color: Colors.accent.error,
  },
  headerSpacer: {
    width: 60,
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  titleSection: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  countdownCircleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  circleBackground: {
    position: 'absolute',
    borderColor: Colors.border.secondary,
  },
  circleProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  circleCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownTime: {
    fontSize: Typography.fontSize.xxxl * 1.5,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  countdownLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  instructionText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  signalContainer: {
    width: '100%',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadows.sm,
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  signalDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.sm,
  },
  signalLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginRight: Spacing.sm,
  },
  signalValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  signalWarning: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.warning,
    marginTop: Spacing.sm,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  tipsContainer: {
    width: '100%',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  tipsTitle: {
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
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  footer: {
    alignItems: 'center',
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  pauseButton: {
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  pauseButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  resumeButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  resumeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  footerNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CalibrationCountdownScreen;
