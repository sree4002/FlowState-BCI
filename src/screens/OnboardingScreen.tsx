/**
 * FlowState BCI - Onboarding Screen
 *
 * A swipeable tour introducing new users to the app's key features.
 * Contains 3 screens covering:
 * 1. Real-time theta wave monitoring
 * 2. Personalized audio entrainment
 * 3. Progress tracking and optimization
 */

import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Slide data for the onboarding tour
 */
interface OnboardingSlide {
  id: string;
  icon: string;
  title: string;
  description: string;
  backgroundColor: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: '🧠',
    title: 'Monitor Your Theta Waves',
    description:
      'Watch your brain activity in real-time. See your theta waves rise as you enter deeper states of focus and relaxation.',
    backgroundColor: Colors.primary.dark,
  },
  {
    id: '2',
    icon: '🎵',
    title: 'Personalized Audio Entrainment',
    description:
      'Our adaptive audio technology responds to your unique brain patterns, guiding you into optimal flow states.',
    backgroundColor: Colors.secondary.dark,
  },
  {
    id: '3',
    icon: '📈',
    title: 'Track Your Progress',
    description:
      'Build your practice over time. Discover your peak hours, track trends, and optimize your routine for maximum benefit.',
    backgroundColor: Colors.primary.main,
  },
];

export interface OnboardingScreenProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

export function OnboardingScreen({
  onComplete,
  onSkip,
}: OnboardingScreenProps): React.JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<OnboardingSlide>[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
    []
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      onComplete?.();
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex, isLastSlide, onComplete]);

  const handleSkip = useCallback(() => {
    onSkip?.();
  }, [onSkip]);

  const handleScrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
    });
  }, []);

  const renderSlide = useCallback(
    ({ item }: { item: OnboardingSlide }) => (
      <View
        style={[styles.slide, { backgroundColor: item.backgroundColor }]}
        testID={`onboarding-slide-${item.id}`}
      >
        <View style={styles.slideContent}>
          <Text style={styles.icon}>{item.icon}</Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    ),
    []
  );

  const renderPaginationDots = useCallback(() => {
    return (
      <View style={styles.pagination} testID="onboarding-pagination">
        {SLIDES.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.paginationDot,
              currentIndex === index && styles.paginationDotActive,
            ]}
            onPress={() => handleScrollToIndex(index)}
            testID={`pagination-dot-${index}`}
            accessibilityLabel={`Go to slide ${index + 1}`}
            accessibilityRole="button"
          />
        ))}
      </View>
    );
  }, [currentIndex, handleScrollToIndex]);

  const keyExtractor = useCallback((item: OnboardingSlide) => item.id, []);

  const getItemLayout = useCallback(
    (_: OnboardingSlide[] | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container} testID="onboarding-screen">
      {/* Skip button */}
      <TouchableOpacity
        style={styles.skipButton}
        onPress={handleSkip}
        testID="onboarding-skip-button"
        accessibilityLabel="Skip onboarding"
        accessibilityRole="button"
      >
        <Text style={styles.skipButtonText}>Skip</Text>
      </TouchableOpacity>

      {/* Swipeable slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={keyExtractor}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={getItemLayout}
        testID="onboarding-flatlist"
      />

      {/* Bottom controls */}
      <View style={styles.bottomControls}>
        {renderPaginationDots()}

        {/* Next/Get Started button */}
        <TouchableOpacity
          style={[styles.nextButton, isLastSlide && styles.nextButtonLast]}
          onPress={handleNext}
          testID="onboarding-next-button"
          accessibilityLabel={isLastSlide ? 'Get Started' : 'Next'}
          accessibilityRole="button"
        >
          <Text style={styles.nextButtonText}>
            {isLastSlide ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  skipButton: {
    position: 'absolute',
    top: Spacing.xxl,
    right: Spacing.lg,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipButtonText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 320,
  },
  icon: {
    fontSize: 80,
    marginBottom: Spacing.xl,
  },
  title: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    lineHeight: Typography.fontSize.xxl * Typography.lineHeight.normal,
  },
  description: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    textAlign: 'center',
    lineHeight: Typography.fontSize.lg * Typography.lineHeight.relaxed,
  },
  bottomControls: {
    position: 'absolute',
    bottom: Spacing.xxl + Spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.text.tertiary,
    marginHorizontal: Spacing.xs,
  },
  paginationDotActive: {
    backgroundColor: Colors.text.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: Colors.interactive.normal,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
    minWidth: 200,
    alignItems: 'center',
  },
  nextButtonLast: {
    backgroundColor: Colors.accent.success,
  },
  nextButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default OnboardingScreen;
