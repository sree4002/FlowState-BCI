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
  ScrollView,
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
 * Default calibration duration in seconds (5 minutes)
 */
export const DEFAULT_CALIBRATION_DURATION = 300;

/**
 * Minimum calibration duration in seconds (3 minutes)
 */
export const MIN_CALIBRATION_DURATION = 180;

/**
 * Critical signal quality threshold for auto-pause
 */
export const CRITICAL_SIGNAL_THRESHOLD = 20;

/**
 * Calibration progress state type
 */
export type CalibrationProgressState =
  | 'recording'
  | 'paused'
  | 'auto_paused'
  | 'complete'
  | 'cancelled';

/**
 * Signal quality sample for tracking
 */
export interface SignalQualitySample {
  timestamp: number;
  score: number;
  isClean: boolean;
}

/**
 * Props for CalibrationProgressScreen
 */
export interface CalibrationProgressScreenProps {
  onCalibrationComplete?: (data: CalibrationResultData) => void;
  onCancel?: () => void;
  duration?: number;
  testID?: string;
}

/**
 * Calibration result data
 */
export interface CalibrationResultData {
  totalDuration: number;
  recordedDuration: number;
  cleanDataPercentage: number;
  averageSignalQuality: number;
  signalQualitySamples: SignalQualitySample[];
  autoPauseCount: number;
  wasSuccessful: boolean;
}

/**
 * Format seconds as MM:SS display
 */
export const formatProgressTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format seconds as human-readable string
 */
export const formatDurationLabel = (seconds: number): string => {
  if (seconds <= 0) return 'Complete';
  if (seconds === 1) return '1 second';
  if (seconds < 60) return `${seconds} seconds`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (secs === 0) {
    return mins === 1 ? '1 minute' : `${mins} minutes`;
  }
  return `${mins}m ${secs}s`;
};

/**
 * Get calibration progress percentage (0-100)
 */
export const getCalibrationProgress = (
  elapsed: number,
  total: number
): number => {
  if (total <= 0) return 0;
  const progress = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, progress));
};

/**
 * Get signal quality status for display during calibration
 */
export const getProgressSignalStatus = (
  quality: SignalQuality | null
): { label: string; color: string; isGood: boolean; isCritical: boolean } => {
  if (!quality || quality.score === undefined) {
    return {
      label: 'Unknown',
      color: Colors.text.disabled,
      isGood: false,
      isCritical: false,
    };
  }
  const score = quality.score;
  if (score >= 80) {
    return {
      label: 'Excellent',
      color: Colors.signal.excellent,
      isGood: true,
      isCritical: false,
    };
  }
  if (score >= 60) {
    return {
      label: 'Good',
      color: Colors.signal.good,
      isGood: true,
      isCritical: false,
    };
  }
  if (score >= 40) {
    return {
      label: 'Fair',
      color: Colors.signal.fair,
      isGood: true,
      isCritical: false,
    };
  }
  if (score >= CRITICAL_SIGNAL_THRESHOLD) {
    return {
      label: 'Poor',
      color: Colors.signal.poor,
      isGood: false,
      isCritical: false,
    };
  }
  return {
    label: 'Critical',
    color: Colors.signal.critical,
    isGood: false,
    isCritical: true,
  };
};

/**
 * Get instruction text based on progress state
 */
export const getProgressInstruction = (
  state: CalibrationProgressState,
  signalStatus: { isGood: boolean; isCritical: boolean }
): string => {
  switch (state) {
    case 'recording':
      if (signalStatus.isCritical) {
        return 'Signal quality is critical. Please adjust your device.';
      }
      if (!signalStatus.isGood) {
        return 'Signal quality is low. Try to minimize movement.';
      }
      return 'Recording your baseline brain activity...';
    case 'paused':
      return 'Calibration paused. Tap Resume when ready.';
    case 'auto_paused':
      return 'Calibration auto-paused due to poor signal. Please adjust your device.';
    case 'complete':
      return 'Calibration recording complete!';
    case 'cancelled':
      return 'Calibration cancelled';
    default:
      return '';
  }
};

/**
 * Get progress state color
 */
export const getProgressStateColor = (
  state: CalibrationProgressState
): string => {
  switch (state) {
    case 'recording':
      return Colors.primary.main;
    case 'paused':
      return Colors.accent.warning;
    case 'auto_paused':
      return Colors.accent.error;
    case 'complete':
      return Colors.accent.success;
    case 'cancelled':
      return Colors.accent.error;
    default:
      return Colors.text.primary;
  }
};

/**
 * Get progress accessibility label
 */
export const getProgressAccessibilityLabel = (
  state: CalibrationProgressState,
  elapsed: number,
  total: number
): string => {
  const progressPercent = Math.round(getCalibrationProgress(elapsed, total));
  switch (state) {
    case 'recording':
      return `Recording calibration data, ${progressPercent} percent complete, ${formatDurationLabel(total - elapsed)} remaining`;
    case 'paused':
      return `Calibration paused at ${progressPercent} percent`;
    case 'auto_paused':
      return `Calibration auto-paused due to poor signal quality at ${progressPercent} percent`;
    case 'complete':
      return 'Calibration recording complete';
    case 'cancelled':
      return 'Calibration cancelled';
    default:
      return 'Calibration';
  }
};

/**
 * Calculate clean data percentage
 */
export const calculateCleanDataPercentage = (
  samples: SignalQualitySample[]
): number => {
  if (samples.length === 0) return 0;
  const cleanSamples = samples.filter((s) => s.isClean).length;
  return Math.round((cleanSamples / samples.length) * 100);
};

/**
 * Calculate average signal quality
 */
export const calculateAverageSignalQuality = (
  samples: SignalQualitySample[]
): number => {
  if (samples.length === 0) return 0;
  const totalScore = samples.reduce((sum, s) => sum + s.score, 0);
  return Math.round(totalScore / samples.length);
};

/**
 * Check if calibration meets minimum requirements
 */
export const isCalibrationSuccessful = (
  recordedDuration: number,
  cleanDataPercentage: number
): boolean => {
  return (
    recordedDuration >= MIN_CALIBRATION_DURATION && cleanDataPercentage >= 50
  );
};

/**
 * CalibrationProgressScreen component
 * Displays real-time signal quality during calibration recording
 */
export const CalibrationProgressScreen: React.FC<
  CalibrationProgressScreenProps
> = ({
  onCalibrationComplete,
  onCancel,
  duration = DEFAULT_CALIBRATION_DURATION,
  testID = 'calibration-progress-screen',
}) => {
  // Context
  const { signalQuality } = useDevice();
  const { setCalibrationState } = useSession();

  // State
  const [progressState, setProgressState] =
    useState<CalibrationProgressState>('recording');
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [signalSamples, setSignalSamples] = useState<SignalQualitySample[]>([]);
  const [autoPauseCount, setAutoPauseCount] = useState<number>(0);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sampleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const autoPauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  // Calculate derived values
  const progress = getCalibrationProgress(elapsedSeconds, duration);
  const signalStatus = getProgressSignalStatus(signalQuality);
  const instruction = getProgressInstruction(progressState, signalStatus);
  const cleanDataPercentage = calculateCleanDataPercentage(signalSamples);
  const avgSignalQuality = calculateAverageSignalQuality(signalSamples);

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
   * Start pulse animation for the progress ring
   */
  const startPulseAnimation = useCallback(() => {
    pulseAnim.setValue(1);
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.03,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
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
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [progressAnim]
  );

  /**
   * Sample signal quality
   */
  const sampleSignalQuality = useCallback(() => {
    if (signalQuality && signalQuality.score !== undefined) {
      const sample: SignalQualitySample = {
        timestamp: Date.now(),
        score: signalQuality.score,
        isClean: signalQuality.score >= 40,
      };
      setSignalSamples((prev) => [...prev, sample]);
    }
  }, [signalQuality]);

  /**
   * Start the calibration timer
   */
  const startRecording = useCallback(() => {
    setProgressState('recording');
    startPulseAnimation();

    // Main timer - counts every second
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newValue = prev + 1;
        if (newValue >= duration) {
          return duration;
        }
        return newValue;
      });
    }, 1000);

    // Signal sampling timer - samples at 2Hz
    sampleTimerRef.current = setInterval(() => {
      sampleSignalQuality();
    }, 500);
  }, [duration, startPulseAnimation, sampleSignalQuality]);

  /**
   * Pause the calibration
   */
  const pauseRecording = useCallback(
    (isAutoPause = false) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (sampleTimerRef.current) {
        clearInterval(sampleTimerRef.current);
        sampleTimerRef.current = null;
      }
      if (isAutoPause) {
        setProgressState('auto_paused');
        setAutoPauseCount((prev) => prev + 1);
      } else {
        setProgressState('paused');
      }
      stopPulseAnimation();
    },
    [stopPulseAnimation]
  );

  /**
   * Resume the calibration
   */
  const resumeRecording = useCallback(() => {
    setProgressState('recording');
    startPulseAnimation();

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        const newValue = prev + 1;
        if (newValue >= duration) {
          return duration;
        }
        return newValue;
      });
    }, 1000);

    sampleTimerRef.current = setInterval(() => {
      sampleSignalQuality();
    }, 500);
  }, [duration, startPulseAnimation, sampleSignalQuality]);

  /**
   * Handle calibration cancel
   */
  const handleCancel = useCallback(() => {
    Alert.alert(
      'Cancel Calibration?',
      'Are you sure you want to cancel? Your progress will be lost.',
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
            if (sampleTimerRef.current) {
              clearInterval(sampleTimerRef.current);
              sampleTimerRef.current = null;
            }
            setProgressState('cancelled');
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
   * Handle calibration complete
   */
  const handleComplete = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (sampleTimerRef.current) {
      clearInterval(sampleTimerRef.current);
      sampleTimerRef.current = null;
    }

    setProgressState('complete');
    stopPulseAnimation();
    setCalibrationState('processing');

    const resultData: CalibrationResultData = {
      totalDuration: duration,
      recordedDuration: elapsedSeconds,
      cleanDataPercentage: calculateCleanDataPercentage(signalSamples),
      averageSignalQuality: calculateAverageSignalQuality(signalSamples),
      signalQualitySamples: signalSamples,
      autoPauseCount,
      wasSuccessful: isCalibrationSuccessful(
        elapsedSeconds,
        calculateCleanDataPercentage(signalSamples)
      ),
    };

    if (onCalibrationComplete) {
      onCalibrationComplete(resultData);
    }
  }, [
    duration,
    elapsedSeconds,
    signalSamples,
    autoPauseCount,
    setCalibrationState,
    onCalibrationComplete,
    stopPulseAnimation,
  ]);

  // Initialize on mount
  useEffect(() => {
    startEntranceAnimation();

    // Start recording after a brief delay
    const startDelay = setTimeout(() => {
      startRecording();
    }, 500);

    return () => {
      clearTimeout(startDelay);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (sampleTimerRef.current) {
        clearInterval(sampleTimerRef.current);
      }
      if (autoPauseTimeoutRef.current) {
        clearTimeout(autoPauseTimeoutRef.current);
      }
    };
  }, [startEntranceAnimation, startRecording]);

  // Handle calibration completion
  useEffect(() => {
    if (elapsedSeconds >= duration && progressState === 'recording') {
      handleComplete();
    }
  }, [elapsedSeconds, duration, progressState, handleComplete]);

  // Update progress animation
  useEffect(() => {
    updateProgressAnimation(progress);
  }, [progress, updateProgressAnimation]);

  // Auto-pause when signal is critical for extended period
  useEffect(() => {
    if (
      progressState === 'recording' &&
      signalStatus.isCritical &&
      !autoPauseTimeoutRef.current
    ) {
      // Auto-pause after 10 seconds of critical signal
      autoPauseTimeoutRef.current = setTimeout(() => {
        if (progressState === 'recording') {
          pauseRecording(true);
        }
        autoPauseTimeoutRef.current = null;
      }, 10000);
    } else if (!signalStatus.isCritical && autoPauseTimeoutRef.current) {
      clearTimeout(autoPauseTimeoutRef.current);
      autoPauseTimeoutRef.current = null;
    }
  }, [progressState, signalStatus.isCritical, pauseRecording]);

  /**
   * Render the progress ring
   */
  const renderProgressRing = () => {
    const ringSize = SCREEN_WIDTH * 0.55;
    const strokeWidth = 10;

    return (
      <Animated.View
        style={[
          styles.progressRingContainer,
          {
            width: ringSize,
            height: ringSize,
            transform: [{ scale: pulseAnim }],
          },
        ]}
        testID="progress-ring"
      >
        {/* Background ring */}
        <View
          style={[
            styles.ringBackground,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: strokeWidth,
            },
          ]}
        />

        {/* Progress ring */}
        <Animated.View
          style={[
            styles.ringProgress,
            {
              width: ringSize,
              height: ringSize,
              borderRadius: ringSize / 2,
              borderWidth: strokeWidth,
              borderColor: getProgressStateColor(progressState),
              opacity: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: [0.3, 1],
              }),
            },
          ]}
        />

        {/* Center content */}
        <View style={styles.ringCenter}>
          <Text
            style={styles.progressTime}
            accessibilityLabel={getProgressAccessibilityLabel(
              progressState,
              elapsedSeconds,
              duration
            )}
            testID="progress-time"
          >
            {formatProgressTime(elapsedSeconds)}
          </Text>
          <Text style={styles.progressLabel} testID="progress-label">
            {formatDurationLabel(duration - elapsedSeconds)} remaining
          </Text>
          <Text
            style={[
              styles.progressPercent,
              { color: getProgressStateColor(progressState) },
            ]}
            testID="progress-percent"
          >
            {Math.round(progress)}%
          </Text>
        </View>
      </Animated.View>
    );
  };

  /**
   * Render signal quality display
   */
  const renderSignalQuality = () => (
    <View style={styles.signalContainer} testID="signal-quality">
      <Text style={styles.sectionTitle}>Signal Quality</Text>
      <View style={styles.signalCard}>
        <View style={styles.signalRow}>
          <View
            style={[styles.signalDot, { backgroundColor: signalStatus.color }]}
          />
          <Text style={styles.signalLabel}>Current:</Text>
          <Text style={[styles.signalValue, { color: signalStatus.color }]}>
            {signalStatus.label}
          </Text>
          {signalQuality && signalQuality.score !== undefined && (
            <Text style={styles.signalScore}>{signalQuality.score}%</Text>
          )}
        </View>
        {signalStatus.isCritical && (
          <Text style={styles.signalWarning}>
            ⚠️ Signal quality is critically low. Please check device placement.
          </Text>
        )}
      </View>
    </View>
  );

  /**
   * Render data quality stats
   */
  const renderDataQuality = () => (
    <View style={styles.dataQualityContainer} testID="data-quality">
      <Text style={styles.sectionTitle}>Data Quality</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{cleanDataPercentage}%</Text>
          <Text style={styles.statLabel}>Clean Data</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{avgSignalQuality}%</Text>
          <Text style={styles.statLabel}>Avg Quality</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{signalSamples.length}</Text>
          <Text style={styles.statLabel}>Samples</Text>
        </View>
      </View>
      {autoPauseCount > 0 && (
        <Text style={styles.autoPauseNote}>
          Auto-paused {autoPauseCount} time{autoPauseCount > 1 ? 's' : ''} due
          to signal issues
        </Text>
      )}
    </View>
  );

  /**
   * Render instruction text
   */
  const renderInstruction = () => (
    <View style={styles.instructionContainer} testID="instruction">
      <Text
        style={styles.instructionIcon}
        testID={`instruction-icon-${progressState}`}
      >
        {progressState === 'complete'
          ? '✓'
          : progressState === 'auto_paused'
            ? '⚠️'
            : progressState === 'paused'
              ? '⏸'
              : '🧠'}
      </Text>
      <Text
        style={[
          styles.instructionText,
          {
            color:
              signalStatus.isCritical && progressState === 'recording'
                ? Colors.accent.error
                : Colors.text.primary,
          },
        ]}
      >
        {instruction}
      </Text>
    </View>
  );

  /**
   * Render progress bar
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
              backgroundColor: getProgressStateColor(progressState),
            },
          ]}
        />
      </View>
    </View>
  );

  /**
   * Render tips for calibration
   */
  const renderTips = () => (
    <View style={styles.tipsContainer} testID="tips">
      <Text style={styles.tipsTitle}>For best results:</Text>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Keep eyes closed or softly focused</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Minimize head and body movement</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Breathe slowly and naturally</Text>
      </View>
      <View style={styles.tipRow}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Let your mind wander freely</Text>
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
        <Text style={styles.headerTitle}>Calibration</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
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
            <Text style={styles.title}>Recording Baseline</Text>
            <Text style={styles.subtitle}>
              Please relax while we capture your brain activity
            </Text>
          </View>

          {/* Progress ring */}
          {renderProgressRing()}

          {/* Progress bar */}
          {renderProgressBar()}

          {/* Instruction */}
          {renderInstruction()}

          {/* Signal quality */}
          {renderSignalQuality()}

          {/* Data quality stats */}
          {renderDataQuality()}

          {/* Tips */}
          {progressState === 'recording' && renderTips()}
        </Animated.View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {progressState === 'recording' && (
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={() => pauseRecording(false)}
            accessibilityRole="button"
            accessibilityLabel="Pause calibration"
            testID="pause-button"
          >
            <Text style={styles.pauseButtonText}>Pause</Text>
          </TouchableOpacity>
        )}
        {(progressState === 'paused' || progressState === 'auto_paused') && (
          <TouchableOpacity
            style={styles.resumeButton}
            onPress={resumeRecording}
            accessibilityRole="button"
            accessibilityLabel="Resume calibration"
            testID="resume-button"
          >
            <Text style={styles.resumeButtonText}>Resume</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.footerNote}>
          {progressState === 'recording'
            ? 'Calibration will complete automatically'
            : progressState === 'auto_paused'
              ? 'Please adjust your device before resuming'
              : progressState === 'paused'
                ? 'Tap Resume when you are ready to continue'
                : 'Processing your calibration data...'}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: Spacing.xl,
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
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
  progressRingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  ringBackground: {
    position: 'absolute',
    borderColor: Colors.border.secondary,
  },
  ringProgress: {
    position: 'absolute',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    transform: [{ rotate: '-90deg' }],
  },
  ringCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressTime: {
    fontSize: Typography.fontSize.xxxl * 1.2,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  progressPercent: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.xs,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
    width: '100%',
    ...Shadows.sm,
  },
  instructionIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  instructionText: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  signalContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  signalCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
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
    flex: 1,
  },
  signalScore: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  signalWarning: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.error,
    marginTop: Spacing.sm,
  },
  dataQualityContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
    alignItems: 'center',
    ...Shadows.sm,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  autoPauseNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.warning,
    textAlign: 'center',
    marginTop: Spacing.md,
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

export default CalibrationProgressScreen;
