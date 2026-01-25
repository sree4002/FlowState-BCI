/**
 * FlowState BCI - Onboarding Screen
 *
 * A premium 5-screen onboarding experience with:
 * 1. Hook - Head silhouette with pulsating focus rings
 * 2. Theta Monitoring - Line chart visualization
 * 3. AI Insights - Sparkle/star pattern
 * 4. Permissions - Bluetooth and notification requests
 * 5. Get Started - Call to action
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  FlatList,
  TouchableOpacity,
  ViewToken,
  Animated,
  Easing,
} from 'react-native';
import Svg, { Path, Circle, G, Line, Polyline, Rect } from 'react-native-svg';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// SVG Icon Components

interface IconProps {
  size?: number;
  color?: string;
}

// Screen 1: Head silhouette with brain waves
const HeadIcon: React.FC<IconProps> = ({ size = 120, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Head silhouette */}
    <Path
      d="M50 10C30 10 15 30 15 50C15 65 22 78 35 85V95H65V85C78 78 85 65 85 50C85 30 70 10 50 10Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
    />
    {/* Brain wave pattern inside */}
    <Path
      d="M30 50C32 45 35 55 38 50C41 45 44 55 47 50C50 45 53 55 56 50C59 45 62 55 65 50C68 45 70 50 70 50"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
    />
    {/* Second brain wave */}
    <Path
      d="M35 60C37 56 39 64 42 60C45 56 48 64 51 60C54 56 57 64 60 60"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinecap="round"
      opacity="0.6"
    />
  </Svg>
);

// Pulsating focus rings component
const PulsatingRings: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const ring1Opacity = useRef(new Animated.Value(0.4)).current;
  const ring2Opacity = useRef(new Animated.Value(0.3)).current;
  const ring3Opacity = useRef(new Animated.Value(0.2)).current;
  const ring4Opacity = useRef(new Animated.Value(0.1)).current;

  const ring1Scale = useRef(new Animated.Value(1)).current;
  const ring2Scale = useRef(new Animated.Value(1)).current;
  const ring3Scale = useRef(new Animated.Value(1)).current;
  const ring4Scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!isActive) return;

    const createPulse = (
      opacityAnim: Animated.Value,
      scaleAnim: Animated.Value,
      delay: number
    ) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.parallel([
            Animated.sequence([
              Animated.timing(opacityAnim, {
                toValue: 0.6,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(opacityAnim, {
                toValue: 0.2,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.05,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
            ]),
          ]),
        ])
      );
    };

    const animations = [
      createPulse(ring1Opacity, ring1Scale, 0),
      createPulse(ring2Opacity, ring2Scale, 250),
      createPulse(ring3Opacity, ring3Scale, 500),
      createPulse(ring4Opacity, ring4Scale, 750),
    ];

    animations.forEach(anim => anim.start());

    return () => {
      animations.forEach(anim => anim.stop());
    };
  }, [isActive, ring1Opacity, ring2Opacity, ring3Opacity, ring4Opacity, ring1Scale, ring2Scale, ring3Scale, ring4Scale]);

  const ringSize = 180;

  return (
    <View style={styles.ringsContainer}>
      {/* Ring 4 - Outermost */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize + 120,
            height: ringSize + 120,
            borderRadius: (ringSize + 120) / 2,
            opacity: ring4Opacity,
            transform: [{ scale: ring4Scale }],
          },
        ]}
      />
      {/* Ring 3 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize + 80,
            height: ringSize + 80,
            borderRadius: (ringSize + 80) / 2,
            opacity: ring3Opacity,
            transform: [{ scale: ring3Scale }],
          },
        ]}
      />
      {/* Ring 2 */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize + 40,
            height: ringSize + 40,
            borderRadius: (ringSize + 40) / 2,
            opacity: ring2Opacity,
            transform: [{ scale: ring2Scale }],
          },
        ]}
      />
      {/* Ring 1 - Innermost */}
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            opacity: ring1Opacity,
            transform: [{ scale: ring1Scale }],
          },
        ]}
      />
    </View>
  );
};

// Screen 2: Line chart icon
const LineChartIcon: React.FC<IconProps> = ({ size = 120, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Axes */}
    <Line x1="15" y1="85" x2="15" y2="15" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Line x1="15" y1="85" x2="85" y2="85" stroke={color} strokeWidth="2" strokeLinecap="round" />
    {/* Chart line - theta wave pattern */}
    <Polyline
      points="20,70 30,50 40,60 50,35 60,45 70,25 80,40"
      stroke={color}
      strokeWidth="2.5"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Data points */}
    <Circle cx="20" cy="70" r="3" fill={color} />
    <Circle cx="30" cy="50" r="3" fill={color} />
    <Circle cx="40" cy="60" r="3" fill={color} />
    <Circle cx="50" cy="35" r="3" fill={color} />
    <Circle cx="60" cy="45" r="3" fill={color} />
    <Circle cx="70" cy="25" r="3" fill={color} />
    <Circle cx="80" cy="40" r="3" fill={color} />
  </Svg>
);

// Screen 3: Sparkle/AI icon
const SparkleIcon: React.FC<IconProps> = ({ size = 120, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Main sparkle */}
    <Path
      d="M50 10L55 40L85 50L55 60L50 90L45 60L15 50L45 40L50 10Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
    />
    {/* Small sparkle top right */}
    <Path
      d="M75 15L77 22L84 25L77 28L75 35L73 28L66 25L73 22L75 15Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
      opacity="0.7"
    />
    {/* Small sparkle bottom left */}
    <Path
      d="M25 65L27 72L34 75L27 78L25 85L23 78L16 75L23 72L25 65Z"
      stroke={color}
      strokeWidth="1.5"
      fill="none"
      strokeLinejoin="round"
      opacity="0.7"
    />
  </Svg>
);

// Screen 4: Shield icon
const ShieldIcon: React.FC<IconProps> = ({ size = 80, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Shield outline */}
    <Path
      d="M50 10L15 25V50C15 70 30 85 50 95C70 85 85 70 85 50V25L50 10Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinejoin="round"
    />
    {/* Checkmark inside */}
    <Path
      d="M35 52L45 62L65 42"
      stroke={color}
      strokeWidth="3"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Bluetooth icon for permission card
const BluetoothIcon: React.FC<IconProps> = ({ size = 24, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2L18 8L12 14L18 20L12 26V14L6 20M12 2V14L6 8L12 2Z"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      transform="translate(0, -1) scale(0.92)"
    />
  </Svg>
);

// Bell/Notification icon for permission card
const BellIcon: React.FC<IconProps> = ({ size = 24, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C18 6.4 17.4 4.8 16.2 3.6C15 2.4 13.4 1.8 12 2C9.2 2 7 4.4 7 8C7 15 4 17 4 17H20C20 17 17 15 17 8"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M13.7 21C13.5 21.3 13.2 21.6 12.9 21.8C12.6 21.9 12.3 22 12 22C11.7 22 11.4 21.9 11.1 21.8C10.8 21.6 10.5 21.3 10.3 21"
      stroke={color}
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Screen 5: Play button icon
const PlayIcon: React.FC<IconProps> = ({ size = 120, color = Colors.accent.primary }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    {/* Circle */}
    <Circle cx="50" cy="50" r="40" stroke={color} strokeWidth="2" fill="none" />
    {/* Play triangle */}
    <Path
      d="M40 30L70 50L40 70V30Z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      strokeLinejoin="round"
    />
  </Svg>
);

// Permission Card Component
interface PermissionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const PermissionCard: React.FC<PermissionCardProps> = ({ icon, title, description }) => (
  <View style={styles.permissionCard}>
    <View style={styles.permissionIconContainer}>{icon}</View>
    <View style={styles.permissionTextContainer}>
      <Text style={styles.permissionTitle}>{title}</Text>
      <Text style={styles.permissionDescription}>{description}</Text>
    </View>
  </View>
);

/**
 * Slide data for the onboarding tour
 */
interface OnboardingSlide {
  id: string;
  type: 'hook' | 'theta' | 'ai' | 'permissions' | 'start';
  title: string;
  description: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    type: 'hook',
    title: 'Train Your Focus',
    description: 'Unlock your brain\'s potential with real-time neurofeedback training.',
  },
  {
    id: '2',
    type: 'theta',
    title: 'Real-Time Theta Monitoring',
    description: 'Watch your brain activity in real-time. See your theta waves rise as you enter deeper states of focus.',
  },
  {
    id: '3',
    type: 'ai',
    title: 'AI-Powered Insights',
    description: 'Discover your peak performance hours. Get personalized recommendations to optimize your focus routine.',
  },
  {
    id: '4',
    type: 'permissions',
    title: 'Connect Your Device',
    description: 'We need a few permissions to help you get started.',
  },
  {
    id: '5',
    type: 'start',
    title: 'Ready to Focus?',
    description: 'Your journey to enhanced focus and clarity begins now.',
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

  const renderSlideContent = useCallback((item: OnboardingSlide, isCurrentSlide: boolean) => {
    switch (item.type) {
      case 'hook':
        return (
          <View style={styles.iconContainer}>
            <PulsatingRings isActive={isCurrentSlide} />
            <View style={styles.iconOverlay}>
              <HeadIcon size={100} />
            </View>
          </View>
        );
      case 'theta':
        return (
          <View style={styles.iconContainer}>
            <LineChartIcon size={140} />
          </View>
        );
      case 'ai':
        return (
          <View style={styles.iconContainer}>
            <SparkleIcon size={140} />
          </View>
        );
      case 'permissions':
        return (
          <View style={styles.permissionsContainer}>
            <ShieldIcon size={80} />
            <View style={styles.permissionCards}>
              <PermissionCard
                icon={<BluetoothIcon size={22} />}
                title="Bluetooth"
                description="Connect to your EEG headband"
              />
              <PermissionCard
                icon={<BellIcon size={22} />}
                title="Notifications"
                description="Get session reminders"
              />
            </View>
          </View>
        );
      case 'start':
        return (
          <View style={styles.iconContainer}>
            <PlayIcon size={140} />
          </View>
        );
      default:
        return null;
    }
  }, []);

  const renderSlide = useCallback(
    ({ item, index }: { item: OnboardingSlide; index: number }) => {
      const isCurrentSlide = index === currentIndex;
      return (
        <View
          style={styles.slide}
          testID={`onboarding-slide-${item.id}`}
        >
          <View style={styles.slideContent}>
            {renderSlideContent(item, isCurrentSlide)}
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </View>
        </View>
      );
    },
    [currentIndex, renderSlideContent]
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
    (_: ArrayLike<OnboardingSlide> | null | undefined, index: number) => ({
      length: SCREEN_WIDTH,
      offset: SCREEN_WIDTH * index,
      index,
    }),
    []
  );

  return (
    <View style={styles.container} testID="onboarding-screen">
      {/* Skip button - hidden on last slide */}
      {!isLastSlide && (
        <TouchableOpacity
          style={styles.skipButton}
          onPress={handleSkip}
          testID="onboarding-skip-button"
          accessibilityLabel="Skip onboarding"
          accessibilityRole="button"
        >
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      )}

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
        extraData={currentIndex}
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
          <Text style={[styles.nextButtonText, isLastSlide && styles.nextButtonTextLast]}>
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
    backgroundColor: '#000000',
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: Spacing.screenPadding,
    zIndex: 10,
    padding: Spacing.sm,
  },
  skipButtonText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  slide: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    backgroundColor: '#000000',
  },
  slideContent: {
    alignItems: 'center',
    maxWidth: 340,
    marginTop: -60,
  },
  iconContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxxl,
  },
  iconOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringsContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: Colors.accent.primary,
  },
  permissionsContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  permissionCards: {
    marginTop: Spacing.xxl,
    width: '100%',
    gap: Spacing.md,
  },
  permissionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    width: SCREEN_WIDTH - Spacing.screenPadding * 2,
  },
  permissionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.accent.primaryDim,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  permissionTextContainer: {
    flex: 1,
  },
  permissionTitle: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    marginBottom: 2,
  },
  permissionDescription: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
  },
  title: {
    color: Colors.text.primary,
    fontSize: 28,
    fontWeight: Typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: Spacing.md,
    letterSpacing: -0.5,
  },
  description: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: Spacing.md,
  },
  bottomControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surface.secondary,
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: Colors.accent.primary,
    width: 24,
  },
  nextButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.accent.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl,
    borderRadius: BorderRadius.xl,
    minWidth: 200,
    alignItems: 'center',
  },
  nextButtonLast: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  nextButtonText: {
    color: Colors.accent.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  nextButtonTextLast: {
    color: Colors.text.inverse,
  },
});

export default OnboardingScreen;
