import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  Dimensions,
  ScrollView,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { useSession } from '../contexts/SessionContext';
import { BaselineProfile } from '../types';
import { CalibrationResultData } from './CalibrationProgressScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Quality threshold for successful calibration
 */
export const GOOD_QUALITY_THRESHOLD = 70;

/**
 * Quality threshold for acceptable calibration
 */
export const ACCEPTABLE_QUALITY_THRESHOLD = 50;

/**
 * Minimum clean data percentage for valid baseline
 */
export const MIN_CLEAN_DATA_PERCENTAGE = 50;

/**
 * Quality level for calibration results
 */
export type CalibrationQualityLevel =
  | 'excellent'
  | 'good'
  | 'acceptable'
  | 'poor';

/**
 * Props for CalibrationSummaryScreen
 */
export interface CalibrationSummaryScreenProps {
  calibrationData?: CalibrationResultData;
  baselineProfile?: BaselineProfile;
  onSaveBaseline?: (profile: BaselineProfile) => void;
  onRecalibrate?: () => void;
  onContinue?: () => void;
  testID?: string;
}

/**
 * Baseline statistics for display
 */
export interface BaselineStats {
  thetaMean: number;
  thetaStd: number;
  alphaMean: number;
  betaMean: number;
  peakThetaFreq: number;
  optimalFreq: number;
  qualityScore: number;
}

/**
 * Get quality level from calibration score
 */
export const getCalibrationQualityLevel = (
  qualityScore: number,
  cleanDataPercentage: number
): CalibrationQualityLevel => {
  if (cleanDataPercentage < MIN_CLEAN_DATA_PERCENTAGE) {
    return 'poor';
  }
  if (qualityScore >= 80 && cleanDataPercentage >= 80) {
    return 'excellent';
  }
  if (qualityScore >= GOOD_QUALITY_THRESHOLD && cleanDataPercentage >= 70) {
    return 'good';
  }
  if (
    qualityScore >= ACCEPTABLE_QUALITY_THRESHOLD &&
    cleanDataPercentage >= MIN_CLEAN_DATA_PERCENTAGE
  ) {
    return 'acceptable';
  }
  return 'poor';
};

/**
 * Get color for quality level
 */
export const getQualityLevelColor = (
  level: CalibrationQualityLevel
): string => {
  switch (level) {
    case 'excellent':
      return Colors.signal.excellent;
    case 'good':
      return Colors.signal.good;
    case 'acceptable':
      return Colors.signal.fair;
    case 'poor':
      return Colors.signal.critical;
    default:
      return Colors.text.secondary;
  }
};

/**
 * Get label for quality level
 */
export const getQualityLevelLabel = (
  level: CalibrationQualityLevel
): string => {
  switch (level) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'acceptable':
      return 'Acceptable';
    case 'poor':
      return 'Poor';
    default:
      return 'Unknown';
  }
};

/**
 * Get icon for quality level
 */
export const getQualityLevelIcon = (level: CalibrationQualityLevel): string => {
  switch (level) {
    case 'excellent':
      return '🌟';
    case 'good':
      return '✓';
    case 'acceptable':
      return '~';
    case 'poor':
      return '⚠️';
    default:
      return '?';
  }
};

/**
 * Get summary message based on quality level
 */
export const getQualitySummaryMessage = (
  level: CalibrationQualityLevel
): string => {
  switch (level) {
    case 'excellent':
      return 'Your calibration is excellent! Your baseline profile has been captured with high accuracy.';
    case 'good':
      return 'Your calibration is good. You have a reliable baseline for theta tracking.';
    case 'acceptable':
      return 'Your calibration is acceptable but could be improved. Consider recalibrating in better conditions.';
    case 'poor':
      return 'Your calibration quality is low. We recommend recalibrating for better results.';
    default:
      return '';
  }
};

/**
 * Get recommendation for quality level
 */
export const getQualityRecommendation = (
  level: CalibrationQualityLevel
): string => {
  switch (level) {
    case 'excellent':
      return 'You are ready to start your first session!';
    case 'good':
      return 'You can start using the app, but recalibrating occasionally may improve accuracy.';
    case 'acceptable':
      return 'Try recalibrating in a quieter environment with better device placement.';
    case 'poor':
      return 'Please recalibrate before starting sessions. Check device placement and minimize movement.';
    default:
      return '';
  }
};

/**
 * Format frequency value for display
 */
export const formatFrequencyValue = (frequency: number | null): string => {
  if (frequency === null || frequency === undefined || isNaN(frequency)) {
    return '-- Hz';
  }
  return `${frequency.toFixed(1)} Hz`;
};

/**
 * Format power value for display
 */
export const formatPowerValue = (power: number | null): string => {
  if (power === null || power === undefined || isNaN(power)) {
    return '-- µV²';
  }
  return `${power.toFixed(2)} µV²`;
};

/**
 * Format standard deviation value for display
 */
export const formatStdValue = (std: number | null): string => {
  if (std === null || std === undefined || isNaN(std)) {
    return '±-- µV²';
  }
  return `±${std.toFixed(2)} µV²`;
};

/**
 * Format percentage for display
 */
export const formatPercentage = (value: number | null): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '--%';
  }
  return `${Math.round(value)}%`;
};

/**
 * Format duration in human-readable format
 */
export const formatCalibrationDuration = (seconds: number): string => {
  if (seconds <= 0) return '0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
};

/**
 * Get accessibility label for baseline stat
 */
export const getStatAccessibilityLabel = (
  label: string,
  value: string
): string => {
  return `${label}: ${value}`;
};

/**
 * Check if baseline profile is valid
 */
export const isBaselineValid = (profile: BaselineProfile | null): boolean => {
  if (!profile) return false;
  return (
    !isNaN(profile.theta_mean) &&
    !isNaN(profile.theta_std) &&
    profile.theta_mean > 0 &&
    profile.theta_std > 0 &&
    profile.quality_score >= MIN_CLEAN_DATA_PERCENTAGE
  );
};

/**
 * Get frequency band label
 */
export const getFrequencyBandLabel = (frequency: number): string => {
  if (frequency >= 4 && frequency <= 8) return 'Theta Band';
  if (frequency > 8 && frequency <= 13) return 'Alpha Band';
  if (frequency > 13 && frequency <= 30) return 'Beta Band';
  if (frequency < 4) return 'Delta Band';
  return 'High Frequency';
};

/**
 * CalibrationSummaryScreen component
 * Displays baseline calibration results and allows user to save or recalibrate
 */
export const CalibrationSummaryScreen: React.FC<
  CalibrationSummaryScreenProps
> = ({
  calibrationData,
  baselineProfile,
  onSaveBaseline,
  onRecalibrate,
  onContinue,
  testID = 'calibration-summary-screen',
}) => {
  // Context
  const { setCalibrationState } = useSession();

  // State
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Animation refs
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const checkmarkAnim = useRef(new Animated.Value(0)).current;
  const statsAnim = useRef(new Animated.Value(0)).current;

  // Derived values
  const qualityScore = calibrationData?.averageSignalQuality ?? 0;
  const cleanDataPercentage = calibrationData?.cleanDataPercentage ?? 0;
  const qualityLevel = getCalibrationQualityLevel(
    qualityScore,
    cleanDataPercentage
  );
  const qualityColor = getQualityLevelColor(qualityLevel);
  const qualityLabel = getQualityLevelLabel(qualityLevel);
  const qualityIcon = getQualityLevelIcon(qualityLevel);
  const summaryMessage = getQualitySummaryMessage(qualityLevel);
  const recommendation = getQualityRecommendation(qualityLevel);
  const isSuccessful = calibrationData?.wasSuccessful ?? false;
  const canSave =
    isSuccessful && baselineProfile && isBaselineValid(baselineProfile);

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
    ]).start(() => {
      // Start checkmark animation after entrance
      Animated.sequence([
        Animated.timing(checkmarkAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(statsAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [fadeAnim, scaleAnim, checkmarkAnim, statsAnim]);

  /**
   * Handle save baseline
   */
  const handleSaveBaseline = useCallback(async () => {
    if (!baselineProfile || !canSave) return;

    setIsSaving(true);

    try {
      if (onSaveBaseline) {
        onSaveBaseline(baselineProfile);
      }
      setCalibrationState('complete');

      if (onContinue) {
        onContinue();
      }
    } finally {
      setIsSaving(false);
    }
  }, [
    baselineProfile,
    canSave,
    onSaveBaseline,
    onContinue,
    setCalibrationState,
  ]);

  /**
   * Handle recalibrate
   */
  const handleRecalibrate = useCallback(() => {
    setCalibrationState('instructions');
    if (onRecalibrate) {
      onRecalibrate();
    }
  }, [setCalibrationState, onRecalibrate]);

  // Initialize on mount
  useEffect(() => {
    startEntranceAnimation();
  }, [startEntranceAnimation]);

  /**
   * Render quality badge
   */
  const renderQualityBadge = () => (
    <Animated.View
      style={[
        styles.qualityBadgeContainer,
        {
          opacity: checkmarkAnim,
          transform: [
            {
              scale: checkmarkAnim.interpolate({
                inputRange: [0, 0.5, 1],
                outputRange: [0.5, 1.1, 1],
              }),
            },
          ],
        },
      ]}
      testID="quality-badge"
    >
      <View style={[styles.qualityBadge, { borderColor: qualityColor }]}>
        <Text style={styles.qualityIcon}>{qualityIcon}</Text>
        <Text
          style={[styles.qualityLabel, { color: qualityColor }]}
          accessibilityLabel={`Calibration quality: ${qualityLabel}`}
        >
          {qualityLabel}
        </Text>
      </View>
    </Animated.View>
  );

  /**
   * Render summary message section
   */
  const renderSummaryMessage = () => (
    <View style={styles.summaryContainer} testID="summary-message">
      <Text style={styles.summaryTitle}>Calibration Complete</Text>
      <Text style={styles.summaryText}>{summaryMessage}</Text>
      <Text style={styles.recommendationText}>{recommendation}</Text>
    </View>
  );

  /**
   * Render calibration stats
   */
  const renderCalibrationStats = () => (
    <Animated.View
      style={[styles.calibrationStatsContainer, { opacity: statsAnim }]}
      testID="calibration-stats"
    >
      <Text style={styles.sectionTitle}>Calibration Statistics</Text>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatPercentage(cleanDataPercentage)}
          </Text>
          <Text
            style={styles.statLabel}
            accessibilityLabel={getStatAccessibilityLabel(
              'Clean Data',
              formatPercentage(cleanDataPercentage)
            )}
          >
            Clean Data
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{formatPercentage(qualityScore)}</Text>
          <Text
            style={styles.statLabel}
            accessibilityLabel={getStatAccessibilityLabel(
              'Signal Quality',
              formatPercentage(qualityScore)
            )}
          >
            Signal Quality
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {formatCalibrationDuration(calibrationData?.recordedDuration ?? 0)}
          </Text>
          <Text
            style={styles.statLabel}
            accessibilityLabel={getStatAccessibilityLabel(
              'Duration',
              formatCalibrationDuration(calibrationData?.recordedDuration ?? 0)
            )}
          >
            Duration
          </Text>
        </View>
        {calibrationData && calibrationData.autoPauseCount > 0 && (
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: Colors.accent.warning }]}>
              {calibrationData.autoPauseCount}
            </Text>
            <Text style={styles.statLabel}>Auto-Pauses</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );

  /**
   * Render baseline profile section
   */
  const renderBaselineProfile = () => {
    if (!baselineProfile) return null;

    return (
      <Animated.View
        style={[styles.baselineContainer, { opacity: statsAnim }]}
        testID="baseline-profile"
      >
        <Text style={styles.sectionTitle}>Your Baseline Profile</Text>

        {/* Theta section */}
        <View style={styles.bandSection}>
          <View style={styles.bandHeader}>
            <Text style={styles.bandTitle}>Theta Band (4-8 Hz)</Text>
            <Text style={styles.bandSubtitle}>Your focus frequency range</Text>
          </View>
          <View style={styles.bandStatsRow}>
            <View style={styles.bandStatItem}>
              <Text style={styles.bandStatValue}>
                {formatPowerValue(baselineProfile.theta_mean)}
              </Text>
              <Text style={styles.bandStatLabel}>Mean Power</Text>
            </View>
            <View style={styles.bandStatItem}>
              <Text style={styles.bandStatValue}>
                {formatStdValue(baselineProfile.theta_std)}
              </Text>
              <Text style={styles.bandStatLabel}>Variability</Text>
            </View>
          </View>
        </View>

        {/* Peak frequency section */}
        <View style={styles.frequencySection}>
          <View style={styles.frequencyRow}>
            <View style={styles.frequencyItem}>
              <Text style={styles.frequencyLabel}>Peak Theta Frequency</Text>
              <Text
                style={[styles.frequencyValue, { color: Colors.primary.main }]}
              >
                {formatFrequencyValue(baselineProfile.peak_theta_freq)}
              </Text>
              <Text style={styles.frequencyBandLabel}>
                {getFrequencyBandLabel(baselineProfile.peak_theta_freq)}
              </Text>
            </View>
            <View style={styles.frequencyItem}>
              <Text style={styles.frequencyLabel}>Optimal Entrainment</Text>
              <Text
                style={[
                  styles.frequencyValue,
                  { color: Colors.secondary.main },
                ]}
              >
                {formatFrequencyValue(baselineProfile.optimal_freq)}
              </Text>
              <Text style={styles.frequencyBandLabel}>Recommended</Text>
            </View>
          </View>
        </View>

        {/* Other bands summary */}
        <View style={styles.otherBandsSection}>
          <Text style={styles.otherBandsTitle}>Other Band Powers</Text>
          <View style={styles.otherBandsRow}>
            <View style={styles.otherBandItem}>
              <Text style={styles.otherBandLabel}>Alpha (8-13 Hz)</Text>
              <Text style={styles.otherBandValue}>
                {formatPowerValue(baselineProfile.alpha_mean)}
              </Text>
            </View>
            <View style={styles.otherBandItem}>
              <Text style={styles.otherBandLabel}>Beta (13-30 Hz)</Text>
              <Text style={styles.otherBandValue}>
                {formatPowerValue(baselineProfile.beta_mean)}
              </Text>
            </View>
          </View>
        </View>

        {/* Quality score */}
        <View style={styles.qualityScoreSection}>
          <Text style={styles.qualityScoreLabel}>Baseline Quality Score</Text>
          <View style={styles.qualityScoreBar}>
            <View
              style={[
                styles.qualityScoreFill,
                {
                  width: `${Math.min(100, baselineProfile.quality_score)}%`,
                  backgroundColor: qualityColor,
                },
              ]}
            />
          </View>
          <Text style={[styles.qualityScoreValue, { color: qualityColor }]}>
            {formatPercentage(baselineProfile.quality_score)}
          </Text>
        </View>
      </Animated.View>
    );
  };

  /**
   * Render action buttons
   */
  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer} testID="action-buttons">
      {canSave ? (
        <TouchableOpacity
          style={[styles.primaryButton, isSaving && styles.buttonDisabled]}
          onPress={handleSaveBaseline}
          disabled={isSaving}
          accessibilityRole="button"
          accessibilityLabel="Save baseline and continue"
          accessibilityHint="Saves your calibration data and proceeds to the dashboard"
          testID="save-button"
        >
          <Text style={styles.primaryButtonText}>
            {isSaving ? 'Saving...' : 'Save & Continue'}
          </Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.warningContainer}>
          <Text style={styles.warningIcon}>⚠️</Text>
          <Text style={styles.warningText}>
            Calibration quality is too low. Please recalibrate for better
            results.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleRecalibrate}
        accessibilityRole="button"
        accessibilityLabel="Recalibrate"
        accessibilityHint="Starts a new calibration session"
        testID="recalibrate-button"
      >
        <Text style={styles.secondaryButtonText}>Recalibrate</Text>
      </TouchableOpacity>

      {canSave && (
        <Text style={styles.footerNote}>
          Your baseline will be used to personalize your theta tracking
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.container} testID={testID}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Calibration Results</Text>
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
          {/* Quality badge */}
          {renderQualityBadge()}

          {/* Summary message */}
          {renderSummaryMessage()}

          {/* Calibration stats */}
          {renderCalibrationStats()}

          {/* Baseline profile */}
          {renderBaselineProfile()}
        </Animated.View>
      </ScrollView>

      {/* Footer with action buttons */}
      <View style={styles.footer}>{renderActionButtons()}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    alignItems: 'center',
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
    paddingTop: Spacing.xl,
  },
  qualityBadgeContainer: {
    marginBottom: Spacing.lg,
  },
  qualityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.round,
    borderWidth: 2,
    backgroundColor: Colors.surface.primary,
    ...Shadows.md,
  },
  qualityIcon: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  qualityLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  summaryContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.md,
  },
  summaryTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  summaryText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
  },
  recommendationText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    alignSelf: 'flex-start',
  },
  calibrationStatsContainer: {
    width: '100%',
    marginBottom: Spacing.xl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: (SCREEN_WIDTH - Spacing.lg * 2 - Spacing.sm) / 2 - Spacing.xs,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
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
  baselineContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  bandSection: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  bandHeader: {
    marginBottom: Spacing.md,
  },
  bandTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  bandSubtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
  bandStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bandStatItem: {
    alignItems: 'center',
  },
  bandStatValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary.main,
    fontVariant: ['tabular-nums'],
  },
  bandStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  frequencySection: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  frequencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  frequencyItem: {
    alignItems: 'center',
  },
  frequencyLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  frequencyValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    fontVariant: ['tabular-nums'],
  },
  frequencyBandLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  otherBandsSection: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  otherBandsTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  otherBandsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  otherBandItem: {
    alignItems: 'center',
  },
  otherBandLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  otherBandValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  qualityScoreSection: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.sm,
  },
  qualityScoreLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  qualityScoreBar: {
    height: 8,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  qualityScoreFill: {
    height: '100%',
    borderRadius: BorderRadius.sm,
  },
  qualityScoreValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'right',
  },
  footer: {
    padding: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  actionButtonsContainer: {
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  buttonDisabled: {
    backgroundColor: Colors.interactive.disabled,
  },
  secondaryButton: {
    width: '100%',
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.accent.warning,
  },
  warningIcon: {
    fontSize: 20,
    marginRight: Spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.warning,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  footerNote: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
});

export default CalibrationSummaryScreen;
