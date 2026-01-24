/**
 * FlowState BCI - Contextual Tooltip System
 *
 * A tooltip system for first-time feature discovery.
 * Features:
 * - Shows helpful hints for new users
 * - Tracks which tooltips have been dismissed
 * - Supports different positions and styles
 * - Accessible with screen readers
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Animated,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Storage key for dismissed tooltips
 */
const DISMISSED_TOOLTIPS_KEY = '@flowstate/dismissed_tooltips';

/**
 * Tooltip position relative to the target element
 */
export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * Predefined tooltip IDs for consistent tracking
 */
export type TooltipId =
  | 'dashboard-quick-boost'
  | 'dashboard-custom-session'
  | 'dashboard-calibrate'
  | 'session-visualization-toggle'
  | 'session-pause-resume'
  | 'history-filter'
  | 'history-export'
  | 'settings-simulated-mode'
  | 'calibration-signal-quality'
  | 'device-pairing-scan';

/**
 * Props for Tooltip component
 */
export interface TooltipProps {
  /** Unique identifier for this tooltip */
  id: TooltipId;
  /** The tooltip message to display */
  message: string;
  /** Title for the tooltip (optional) */
  title?: string;
  /** Position relative to children */
  position?: TooltipPosition;
  /** Whether to show the tooltip (can be controlled externally) */
  visible?: boolean;
  /** Callback when tooltip is dismissed */
  onDismiss?: () => void;
  /** Whether to show only once (persists dismissal) */
  showOnce?: boolean;
  /** Children to wrap (the target element) */
  children: React.ReactNode;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Hook to manage tooltip dismissed state
 */
export function useTooltipDismissed(id: TooltipId): {
  isDismissed: boolean | null;
  dismiss: () => Promise<void>;
  reset: () => Promise<void>;
} {
  const [isDismissed, setIsDismissed] = useState<boolean | null>(null);

  useEffect(() => {
    const checkDismissed = async () => {
      try {
        const json = await AsyncStorage.getItem(DISMISSED_TOOLTIPS_KEY);
        const dismissed = json ? JSON.parse(json) : [];
        setIsDismissed(dismissed.includes(id));
      } catch {
        setIsDismissed(false);
      }
    };
    checkDismissed();
  }, [id]);

  const dismiss = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(DISMISSED_TOOLTIPS_KEY);
      const dismissed = json ? JSON.parse(json) : [];
      if (!dismissed.includes(id)) {
        dismissed.push(id);
        await AsyncStorage.setItem(
          DISMISSED_TOOLTIPS_KEY,
          JSON.stringify(dismissed)
        );
      }
      setIsDismissed(true);
    } catch (error) {
      console.error('Failed to dismiss tooltip:', error);
    }
  }, [id]);

  const reset = useCallback(async () => {
    try {
      const json = await AsyncStorage.getItem(DISMISSED_TOOLTIPS_KEY);
      const dismissed = json ? JSON.parse(json) : [];
      const filtered = dismissed.filter((d: string) => d !== id);
      await AsyncStorage.setItem(
        DISMISSED_TOOLTIPS_KEY,
        JSON.stringify(filtered)
      );
      setIsDismissed(false);
    } catch (error) {
      console.error('Failed to reset tooltip:', error);
    }
  }, [id]);

  return { isDismissed, dismiss, reset };
}

/**
 * Resets all dismissed tooltips (for testing or re-onboarding)
 */
export async function resetAllTooltips(): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(DISMISSED_TOOLTIPS_KEY);
    return true;
  } catch (error) {
    console.error('Failed to reset all tooltips:', error);
    return false;
  }
}

/**
 * Gets the list of dismissed tooltip IDs
 */
export async function getDismissedTooltips(): Promise<TooltipId[]> {
  try {
    const json = await AsyncStorage.getItem(DISMISSED_TOOLTIPS_KEY);
    return json ? JSON.parse(json) : [];
  } catch {
    return [];
  }
}

/**
 * Tooltip Component
 *
 * Wraps a target element and shows a contextual tooltip on first view.
 */
export function Tooltip({
  id,
  message,
  title,
  position = 'bottom',
  visible: controlledVisible,
  onDismiss,
  showOnce = true,
  children,
  testID,
}: TooltipProps): React.JSX.Element {
  const { isDismissed, dismiss } = useTooltipDismissed(id);
  const [internalVisible, setInternalVisible] = useState(false);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Determine if tooltip should be visible
  const isVisible =
    controlledVisible !== undefined
      ? controlledVisible
      : internalVisible && (showOnce ? !isDismissed : true);

  // Auto-show tooltip after a short delay
  useEffect(() => {
    if (showOnce && isDismissed) {
      return;
    }

    const timer = setTimeout(() => {
      setInternalVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isDismissed, showOnce]);

  // Animate visibility
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: isVisible ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isVisible, fadeAnim]);

  const handleDismiss = useCallback(async () => {
    setInternalVisible(false);
    if (showOnce) {
      await dismiss();
    }
    onDismiss?.();
  }, [dismiss, showOnce, onDismiss]);

  const getArrowStyle = () => {
    switch (position) {
      case 'top':
        return styles.arrowBottom;
      case 'bottom':
        return styles.arrowTop;
      case 'left':
        return styles.arrowRight;
      case 'right':
        return styles.arrowLeft;
    }
  };

  const getTooltipPosition = () => {
    switch (position) {
      case 'top':
        return { bottom: '100%', marginBottom: Spacing.sm };
      case 'bottom':
        return { top: '100%', marginTop: Spacing.sm };
      case 'left':
        return { right: '100%', marginRight: Spacing.sm };
      case 'right':
        return { left: '100%', marginLeft: Spacing.sm };
    }
  };

  // When controlled visibility is used, don't wait for dismissed state to load
  if (isDismissed === null && controlledVisible === undefined) {
    // Loading state - just render children
    return <>{children}</>;
  }

  // Calculate final visibility based on controlled state or internal state
  const shouldShow =
    controlledVisible !== undefined ? controlledVisible : isVisible;

  return (
    <View style={styles.container} testID={testID}>
      {children}

      {shouldShow && (
        <Animated.View
          style={[
            styles.tooltipContainer,
            getTooltipPosition(),
            { opacity: fadeAnim },
          ]}
          testID={`${testID}-tooltip`}
        >
          <View style={[styles.arrow, getArrowStyle()]} />
          <View style={styles.tooltipContent}>
            {title && <Text style={styles.tooltipTitle}>{title}</Text>}
            <Text style={styles.tooltipMessage}>{message}</Text>
            <TouchableOpacity
              style={styles.dismissButton}
              onPress={handleDismiss}
              testID={`${testID}-dismiss`}
              accessibilityLabel="Dismiss tooltip"
              accessibilityRole="button"
            >
              <Text style={styles.dismissButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

/**
 * Spotlight Tooltip Component
 *
 * Shows a full-screen overlay with a spotlight on the target element.
 * Used for more important first-time feature discovery.
 */
export interface SpotlightTooltipProps extends Omit<TooltipProps, 'position'> {
  /** X position of spotlight center */
  spotlightX?: number;
  /** Y position of spotlight center */
  spotlightY?: number;
  /** Radius of spotlight */
  spotlightRadius?: number;
}

export function SpotlightTooltip({
  id,
  message,
  title,
  visible: controlledVisible,
  onDismiss,
  showOnce = true,
  children,
  testID,
}: SpotlightTooltipProps): React.JSX.Element {
  const { isDismissed, dismiss } = useTooltipDismissed(id);
  const [internalVisible, setInternalVisible] = useState(false);

  const isVisible =
    controlledVisible !== undefined
      ? controlledVisible
      : internalVisible && (showOnce ? !isDismissed : true);

  useEffect(() => {
    if (showOnce && isDismissed) {
      return;
    }

    const timer = setTimeout(() => {
      setInternalVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [isDismissed, showOnce]);

  const handleDismiss = useCallback(async () => {
    setInternalVisible(false);
    if (showOnce) {
      await dismiss();
    }
    onDismiss?.();
  }, [dismiss, showOnce, onDismiss]);

  // When controlled visibility is used, don't wait for dismissed state to load
  const shouldShowModal =
    controlledVisible !== undefined
      ? controlledVisible
      : isDismissed !== null && isVisible;

  return (
    <View style={styles.container} testID={testID}>
      {children}

      <Modal
        visible={shouldShowModal}
        transparent
        animationType="fade"
        onRequestClose={handleDismiss}
      >
        <TouchableOpacity
          style={styles.spotlightOverlay}
          activeOpacity={1}
          onPress={handleDismiss}
          testID={`${testID}-overlay`}
        >
          <View style={styles.spotlightContent}>
            {title && <Text style={styles.spotlightTitle}>{title}</Text>}
            <Text style={styles.spotlightMessage}>{message}</Text>
            <TouchableOpacity
              style={styles.spotlightButton}
              onPress={handleDismiss}
              testID={`${testID}-dismiss`}
            >
              <Text style={styles.spotlightButtonText}>Got it!</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  tooltipContainer: {
    position: 'absolute',
    zIndex: 1000,
    alignItems: 'center',
    width: SCREEN_WIDTH * 0.7,
    maxWidth: 280,
  },
  tooltipContent: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    ...Shadows.lg,
  },
  tooltipTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  tooltipMessage: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    marginBottom: Spacing.sm,
  },
  dismissButton: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.primary.main,
    borderRadius: BorderRadius.sm,
  },
  dismissButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  arrow: {
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowTop: {
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: Colors.surface.primary,
  },
  arrowBottom: {
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.surface.primary,
  },
  arrowLeft: {
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderRightColor: Colors.surface.primary,
  },
  arrowRight: {
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftWidth: 8,
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    borderLeftColor: Colors.surface.primary,
  },
  spotlightOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  spotlightContent: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    maxWidth: SCREEN_WIDTH * 0.85,
    alignItems: 'center',
  },
  spotlightTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  spotlightMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    marginBottom: Spacing.lg,
  },
  spotlightButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xxl,
    borderRadius: BorderRadius.lg,
  },
  spotlightButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});

export default Tooltip;
