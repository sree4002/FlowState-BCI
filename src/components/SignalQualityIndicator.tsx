import React, { useState, useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Modal,
  AccessibilityState,
} from 'react-native';
import { useDevice } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { SignalQuality } from '../types';

/**
 * Props for SignalQualityIndicator component
 */
export interface SignalQualityIndicatorProps {
  /** Optional callback when indicator is tapped */
  onPress?: () => void;
  /** Size variant of the indicator */
  size?: 'small' | 'medium' | 'large';
  /** Position corner for the indicator */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Whether to show the details modal on tap */
  showDetailsOnTap?: boolean;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Signal quality level based on score thresholds
 */
export type SignalQualityLevel =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'critical'
  | 'unknown';

/**
 * Returns the signal quality level based on score (0-100)
 */
export const getSignalQualityLevel = (
  score: number | null | undefined
): SignalQualityLevel => {
  if (score === null || score === undefined) {
    return 'unknown';
  }
  if (score >= 80) {
    return 'excellent';
  }
  if (score >= 60) {
    return 'good';
  }
  if (score >= 40) {
    return 'fair';
  }
  if (score >= 20) {
    return 'poor';
  }
  return 'critical';
};

/**
 * Returns the color for a signal quality level
 */
export const getSignalQualityColor = (level: SignalQualityLevel): string => {
  switch (level) {
    case 'excellent':
      return Colors.signal.excellent;
    case 'good':
      return Colors.signal.good;
    case 'fair':
      return Colors.signal.fair;
    case 'poor':
      return Colors.signal.poor;
    case 'critical':
      return Colors.signal.critical;
    case 'unknown':
    default:
      return Colors.interactive.disabled;
  }
};

/**
 * Returns the label for a signal quality level
 */
export const getSignalQualityLabel = (level: SignalQualityLevel): string => {
  switch (level) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    case 'critical':
      return 'Critical';
    case 'unknown':
    default:
      return 'Unknown';
  }
};

/**
 * Returns the signal icon based on quality level (using bars pattern)
 */
export const getSignalQualityIcon = (level: SignalQualityLevel): string => {
  switch (level) {
    case 'excellent':
      return '📶'; // Full signal
    case 'good':
      return '📶'; // Good signal
    case 'fair':
      return '📶'; // Fair signal
    case 'poor':
      return '📶'; // Poor signal
    case 'critical':
      return '⚠️'; // Warning
    case 'unknown':
    default:
      return '❓'; // Unknown
  }
};

/**
 * Returns the number of signal bars to show (1-4)
 */
export const getSignalBars = (level: SignalQualityLevel): number => {
  switch (level) {
    case 'excellent':
      return 4;
    case 'good':
      return 3;
    case 'fair':
      return 2;
    case 'poor':
      return 1;
    case 'critical':
    case 'unknown':
    default:
      return 0;
  }
};

/**
 * Returns the accessibility label for the indicator
 */
export const getSignalAccessibilityLabel = (
  level: SignalQualityLevel,
  score: number | null | undefined
): string => {
  const label = getSignalQualityLabel(level);
  if (score !== null && score !== undefined) {
    return `Signal quality: ${label}, ${Math.round(score)} percent`;
  }
  return `Signal quality: ${label}`;
};

/**
 * Returns the accessibility hint for the indicator
 */
export const getSignalAccessibilityHint = (): string => {
  return 'Double tap to view signal quality details';
};

/**
 * Returns detailed signal quality information for display
 */
export const getSignalQualityDetails = (
  signalQuality: SignalQuality | null
): {
  score: string;
  artifacts: string;
  amplitudeArtifact: string;
  gradientArtifact: string;
  frequencyArtifact: string;
} => {
  if (!signalQuality) {
    return {
      score: 'N/A',
      artifacts: 'N/A',
      amplitudeArtifact: 'N/A',
      gradientArtifact: 'N/A',
      frequencyArtifact: 'N/A',
    };
  }

  return {
    score: `${Math.round(signalQuality.score)}%`,
    artifacts: `${Math.round(signalQuality.artifact_percentage)}%`,
    amplitudeArtifact: signalQuality.has_amplitude_artifact
      ? 'Detected'
      : 'None',
    gradientArtifact: signalQuality.has_gradient_artifact ? 'Detected' : 'None',
    frequencyArtifact: signalQuality.has_frequency_artifact
      ? 'Detected'
      : 'None',
  };
};

/**
 * Returns position styles based on corner position
 */
export const getPositionStyles = (
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
): { top?: number; bottom?: number; left?: number; right?: number } => {
  switch (position) {
    case 'top-left':
      return { top: Spacing.md, left: Spacing.md };
    case 'top-right':
      return { top: Spacing.md, right: Spacing.md };
    case 'bottom-left':
      return { bottom: Spacing.md, left: Spacing.md };
    case 'bottom-right':
    default:
      return { bottom: Spacing.md, right: Spacing.md };
  }
};

/**
 * SignalQualityIndicator - Compact indicator for signal quality
 *
 * Features:
 * - Corner placement with configurable position
 * - Color-coded signal quality visualization
 * - Signal bars showing quality level visually
 * - Tap to view detailed signal quality information
 * - Pulsing animation when signal quality is critical
 * - Accessible with proper labels and hints
 * - Supports multiple size variants
 *
 * Uses device context to read signal quality data.
 */
export const SignalQualityIndicator: React.FC<SignalQualityIndicatorProps> = ({
  onPress,
  size = 'medium',
  position = 'top-right',
  showDetailsOnTap = true,
  testID = 'signal-quality-indicator',
}) => {
  const { signalQuality } = useDevice();
  const [modalVisible, setModalVisible] = useState(false);

  // Animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get signal quality level
  const score = signalQuality?.score ?? null;
  const level = getSignalQualityLevel(score);
  const color = getSignalQualityColor(level);
  const bars = getSignalBars(level);
  const accessibilityLabel = getSignalAccessibilityLabel(level, score);
  const accessibilityHint = getSignalAccessibilityHint();

  // Pulse animation for critical signal
  useEffect(() => {
    if (level === 'critical') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [level, pulseAnim]);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (showDetailsOnTap) {
      setModalVisible(true);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const accessibilityState: AccessibilityState = {
    disabled: false,
  };

  // Size-based style selection
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          bar: styles.barSmall,
          label: styles.labelSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          bar: styles.barLarge,
          label: styles.labelLarge,
        };
      case 'medium':
      default:
        return {
          container: styles.containerMedium,
          bar: styles.barMedium,
          label: styles.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles(position);
  const details = getSignalQualityDetails(signalQuality);

  // Render signal bars
  const renderBars = () => {
    const barElements = [];
    for (let i = 0; i < 4; i++) {
      const isActive = i < bars;
      const barHeight =
        (i + 1) * (size === 'small' ? 3 : size === 'large' ? 6 : 4);
      barElements.push(
        <View
          key={i}
          style={[
            styles.bar,
            sizeStyles.bar,
            { height: barHeight },
            { backgroundColor: isActive ? color : Colors.interactive.disabled },
          ]}
          testID={`${testID}-bar-${i}`}
        />
      );
    }
    return barElements;
  };

  return (
    <>
      <Animated.View
        style={[
          styles.outerContainer,
          positionStyles,
          {
            transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
          },
        ]}
        testID={`${testID}-container`}
      >
        <TouchableOpacity
          style={[
            styles.container,
            sizeStyles.container,
            { borderColor: color },
          ]}
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={accessibilityState}
          testID={testID}
        >
          <View style={styles.barsContainer} testID={`${testID}-bars`}>
            {renderBars()}
          </View>
          {size !== 'small' && (
            <Text
              style={[styles.label, sizeStyles.label, { color }]}
              testID={`${testID}-label`}
            >
              {score !== null ? `${Math.round(score)}%` : '---'}
            </Text>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Details Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeModal}
        testID={`${testID}-modal`}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeModal}
          testID={`${testID}-modal-overlay`}
        >
          <View style={styles.modalContent} testID={`${testID}-modal-content`}>
            <Text style={styles.modalTitle} testID={`${testID}-modal-title`}>
              Signal Quality Details
            </Text>

            {/* Quality Score */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quality Score</Text>
              <View style={styles.detailValueContainer}>
                <View
                  style={[styles.statusDot, { backgroundColor: color }]}
                  testID={`${testID}-status-dot`}
                />
                <Text style={[styles.detailValue, { color }]}>
                  {details.score}
                </Text>
              </View>
            </View>

            {/* Quality Level */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Quality Level</Text>
              <Text style={[styles.detailValue, { color }]}>
                {getSignalQualityLabel(level)}
              </Text>
            </View>

            {/* Artifact Percentage */}
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Artifact Percentage</Text>
              <Text style={styles.detailValue}>{details.artifacts}</Text>
            </View>

            <View style={styles.divider} />

            {/* Artifact Types */}
            <Text style={styles.sectionTitle}>Artifact Detection</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Amplitude (±100 µV)</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      details.amplitudeArtifact === 'Detected'
                        ? Colors.accent.warning
                        : Colors.accent.success,
                  },
                ]}
              >
                {details.amplitudeArtifact}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Gradient ({'>'}50 µV)</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      details.gradientArtifact === 'Detected'
                        ? Colors.accent.warning
                        : Colors.accent.success,
                  },
                ]}
              >
                {details.gradientArtifact}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Frequency Ratio</Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color:
                      details.frequencyArtifact === 'Detected'
                        ? Colors.accent.warning
                        : Colors.accent.success,
                  },
                ]}
              >
                {details.frequencyArtifact}
              </Text>
            </View>

            {/* Close Button */}
            <TouchableOpacity
              style={styles.closeButton}
              onPress={closeModal}
              testID={`${testID}-close-button`}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    zIndex: 100,
  },
  container: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
  },
  containerSmall: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.md,
    padding: Spacing.xs,
  },
  containerMedium: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm,
  },
  containerLarge: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 2,
  },
  bar: {
    borderRadius: 1,
  },
  barSmall: {
    width: 3,
  },
  barMedium: {
    width: 4,
  },
  barLarge: {
    width: 6,
  },
  label: {
    marginTop: 2,
    fontWeight: Typography.fontWeight.bold,
  },
  labelSmall: {
    fontSize: Typography.fontSize.xs,
  },
  labelMedium: {
    fontSize: Typography.fontSize.sm,
  },
  labelLarge: {
    fontSize: Typography.fontSize.md,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay.medium,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 320,
    ...Shadows.lg,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  detailLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  detailValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  detailValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border.secondary,
    marginVertical: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  closeButton: {
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});

export default SignalQualityIndicator;
