import React, { useRef, useEffect } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  AccessibilityState,
} from 'react-native';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { SessionState } from '../types';

/**
 * Props for PauseResumeButton component
 */
export interface PauseResumeButtonProps {
  /** Callback when pause/resume action is triggered */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Size variant of the button */
  size?: 'medium' | 'large';
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Returns the button label based on session state
 */
export const getButtonLabel = (sessionState: SessionState): string => {
  switch (sessionState) {
    case 'running':
      return 'Pause';
    case 'paused':
      return 'Resume';
    case 'idle':
      return 'Start';
    case 'stopped':
      return 'Restart';
    default:
      return 'Start';
  }
};

/**
 * Returns the button color based on session state
 */
export const getButtonColor = (
  sessionState: SessionState,
  disabled: boolean
): string => {
  if (disabled) {
    return Colors.interactive.disabled;
  }
  switch (sessionState) {
    case 'running':
      return Colors.secondary.main; // Purple for pause
    case 'paused':
      return Colors.accent.success; // Green for resume
    case 'idle':
      return Colors.primary.main; // Blue for start
    case 'stopped':
      return Colors.primary.main; // Blue for restart
    default:
      return Colors.primary.main;
  }
};

/**
 * Returns the accessibility label based on session state
 */
export const getAccessibilityLabel = (sessionState: SessionState): string => {
  switch (sessionState) {
    case 'running':
      return 'Pause session';
    case 'paused':
      return 'Resume session';
    case 'idle':
      return 'Start session';
    case 'stopped':
      return 'Restart session';
    default:
      return 'Control session';
  }
};

/**
 * Returns the accessibility hint based on session state
 */
export const getAccessibilityHint = (sessionState: SessionState): string => {
  switch (sessionState) {
    case 'running':
      return 'Double tap to pause the current session';
    case 'paused':
      return 'Double tap to resume the paused session';
    case 'idle':
      return 'Double tap to start a new session';
    case 'stopped':
      return 'Double tap to restart the session';
    default:
      return 'Double tap to control the session';
  }
};

/**
 * Returns the icon character based on session state
 * Using unicode symbols for pause/play visualization
 */
export const getButtonIcon = (sessionState: SessionState): string => {
  switch (sessionState) {
    case 'running':
      return '⏸'; // Pause symbol
    case 'paused':
      return '▶'; // Play symbol
    case 'idle':
      return '▶'; // Play symbol
    case 'stopped':
      return '↻'; // Restart symbol
    default:
      return '▶';
  }
};

/**
 * PauseResumeButton - Large button for controlling session state
 *
 * Features:
 * - Large, easily tappable touch target
 * - Clear visual state differentiation between pause/resume/start/restart
 * - Animated press feedback
 * - Color-coded states (purple=pause, green=resume, blue=start/restart)
 * - Accessible with proper labels and hints
 * - Pulsing animation when session is running
 *
 * Uses session context to read current session state.
 */
export const PauseResumeButton: React.FC<PauseResumeButtonProps> = ({
  onPress,
  disabled = false,
  size = 'large',
  testID = 'pause-resume-button',
}) => {
  const { sessionState, setSessionState } = useSession();

  // Animated values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulsing animation for running state
  useEffect(() => {
    if (sessionState === 'running' && !disabled) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [sessionState, disabled, pulseAnim]);

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
    if (disabled) return;

    // Default behavior: toggle between running and paused
    if (!onPress) {
      switch (sessionState) {
        case 'running':
          setSessionState('paused');
          break;
        case 'paused':
          setSessionState('running');
          break;
        case 'idle':
          setSessionState('running');
          break;
        case 'stopped':
          setSessionState('running');
          break;
      }
    } else {
      onPress();
    }
  };

  const buttonLabel = getButtonLabel(sessionState);
  const buttonColor = getButtonColor(sessionState, disabled);
  const accessibilityLabel = getAccessibilityLabel(sessionState);
  const accessibilityHint = getAccessibilityHint(sessionState);
  const buttonIcon = getButtonIcon(sessionState);

  const isLarge = size === 'large';

  const accessibilityState: AccessibilityState = {
    disabled,
    busy: sessionState === 'running',
  };

  return (
    <Animated.View
      style={[
        styles.container,
        isLarge ? styles.containerLarge : styles.containerMedium,
        { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] },
      ]}
      testID={`${testID}-container`}
    >
      <TouchableOpacity
        style={[
          styles.button,
          isLarge ? styles.buttonLarge : styles.buttonMedium,
          { backgroundColor: buttonColor },
          disabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        testID={testID}
      >
        <View style={styles.contentContainer}>
          <Text
            style={[
              styles.icon,
              isLarge ? styles.iconLarge : styles.iconMedium,
              disabled && styles.textDisabled,
            ]}
            testID={`${testID}-icon`}
          >
            {buttonIcon}
          </Text>
          <Text
            style={[
              styles.label,
              isLarge ? styles.labelLarge : styles.labelMedium,
              disabled && styles.textDisabled,
            ]}
            testID={`${testID}-label`}
          >
            {buttonLabel}
          </Text>
        </View>

        {/* State indicator ring */}
        {sessionState === 'running' && !disabled && (
          <View style={styles.runningIndicatorRing} testID={`${testID}-running-indicator`} />
        )}
      </TouchableOpacity>

      {/* State label below button */}
      <Text
        style={[styles.stateLabel, disabled && styles.textDisabled]}
        testID={`${testID}-state-label`}
      >
        {sessionState === 'running'
          ? 'Session in progress'
          : sessionState === 'paused'
            ? 'Session paused'
            : sessionState === 'stopped'
              ? 'Session ended'
              : 'Ready to start'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerLarge: {
    marginVertical: Spacing.lg,
  },
  containerMedium: {
    marginVertical: Spacing.md,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadows.lg,
  },
  buttonLarge: {
    width: 160,
    height: 160,
    borderRadius: 80, // Round button
  },
  buttonMedium: {
    width: 100,
    height: 100,
    borderRadius: 50, // Round button
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  iconLarge: {
    fontSize: 40,
  },
  iconMedium: {
    fontSize: 28,
  },
  label: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  labelLarge: {
    fontSize: Typography.fontSize.lg,
  },
  labelMedium: {
    fontSize: Typography.fontSize.md,
  },
  textDisabled: {
    color: Colors.text.disabled,
  },
  runningIndicatorRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    borderRadius: 84, // Slightly larger than button
    borderWidth: 3,
    borderColor: Colors.accent.success,
    opacity: 0.6,
  },
  stateLabel: {
    marginTop: Spacing.md,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default PauseResumeButton;
