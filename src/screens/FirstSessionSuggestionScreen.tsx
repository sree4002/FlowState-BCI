/**
 * FlowState BCI - First Session Suggestion Screen
 *
 * Presented after onboarding completion, offering the user
 * a choice between:
 * - Quick Boost: Start a session immediately with default settings
 * - Calibrate First: Go through calibration for personalized experience
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface FirstSessionSuggestionScreenProps {
  /** Called when user chooses Quick Boost */
  onQuickBoost?: () => void;
  /** Called when user chooses Calibrate */
  onCalibrate?: () => void;
  /** Called when user wants to skip and explore */
  onSkip?: () => void;
}

/**
 * Option card data structure
 */
interface OptionCard {
  id: 'quick-boost' | 'calibrate';
  icon: string;
  title: string;
  description: string;
  benefits: string[];
  recommended: boolean;
  buttonText: string;
}

const OPTIONS: OptionCard[] = [
  {
    id: 'quick-boost',
    icon: '⚡',
    title: 'Quick Boost',
    description: 'Start a session right away with default settings.',
    benefits: [
      'Ready in seconds',
      'Uses universal theta frequency (6 Hz)',
      'Great for trying out the experience',
    ],
    recommended: false,
    buttonText: 'Start Quick Session',
  },
  {
    id: 'calibrate',
    icon: '🎯',
    title: 'Calibrate First',
    description: 'Personalize the experience to your unique brain patterns.',
    benefits: [
      'Establishes your baseline',
      'Finds your optimal theta frequency',
      'More effective sessions long-term',
    ],
    recommended: true,
    buttonText: 'Begin Calibration',
  },
];

export function FirstSessionSuggestionScreen({
  onQuickBoost,
  onCalibrate,
  onSkip,
}: FirstSessionSuggestionScreenProps): React.JSX.Element {
  const handleOptionPress = useCallback(
    (optionId: 'quick-boost' | 'calibrate') => {
      if (optionId === 'quick-boost') {
        onQuickBoost?.();
      } else {
        onCalibrate?.();
      }
    },
    [onQuickBoost, onCalibrate]
  );

  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  const renderOptionCard = useCallback(
    (option: OptionCard) => (
      <View
        key={option.id}
        style={[styles.optionCard, option.recommended && styles.optionCardRecommended]}
        testID={`option-card-${option.id}`}
      >
        {option.recommended && (
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedText}>RECOMMENDED</Text>
          </View>
        )}

        <View style={styles.optionHeader}>
          <Text style={styles.optionIcon}>{option.icon}</Text>
          <Text style={styles.optionTitle}>{option.title}</Text>
        </View>

        <Text style={styles.optionDescription}>{option.description}</Text>

        <View style={styles.benefitsList}>
          {option.benefits.map((benefit, index) => (
            <View key={index} style={styles.benefitItem}>
              <Text style={styles.benefitBullet}>✓</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.optionButton,
            option.recommended && styles.optionButtonRecommended,
          ]}
          onPress={() => handleOptionPress(option.id)}
          testID={`${option.id}-button`}
          accessibilityLabel={option.buttonText}
          accessibilityRole="button"
        >
          <Text
            style={[
              styles.optionButtonText,
              option.recommended && styles.optionButtonTextRecommended,
            ]}
          >
            {option.buttonText}
          </Text>
        </TouchableOpacity>
      </View>
    ),
    [handleOptionPress]
  );

  return (
    <View style={styles.container} testID="first-session-suggestion-screen">
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ready to Begin?</Text>
        <Text style={styles.headerSubtitle}>
          Choose how you'd like to start your FlowState journey
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {OPTIONS.map(renderOptionCard)}
      </View>

      {/* Skip link */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        testID="skip-button"
        accessibilityLabel="Skip and explore the app"
        accessibilityRole="button"
      >
        <Text style={styles.skipButtonText}>
          Skip for now and explore the app
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    maxWidth: SCREEN_WIDTH * 0.8,
  },
  optionsContainer: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  optionCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    ...Shadows.md,
  },
  optionCardRecommended: {
    borderColor: Colors.accent.success,
    backgroundColor: Colors.surface.primary,
  },
  recommendedBadge: {
    position: 'absolute',
    top: -12,
    right: Spacing.lg,
    backgroundColor: Colors.accent.success,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },
  recommendedText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
    letterSpacing: 1,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  optionIcon: {
    fontSize: 32,
    marginRight: Spacing.sm,
  },
  optionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  optionDescription: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  benefitsList: {
    marginBottom: Spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },
  benefitBullet: {
    fontSize: Typography.fontSize.sm,
    color: Colors.accent.success,
    marginRight: Spacing.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  benefitText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    flex: 1,
  },
  optionButton: {
    backgroundColor: Colors.surface.secondary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  optionButtonRecommended: {
    backgroundColor: Colors.accent.success,
  },
  optionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  optionButtonTextRecommended: {
    color: Colors.text.inverse,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    textDecorationLine: 'underline',
  },
});

export default FirstSessionSuggestionScreen;
