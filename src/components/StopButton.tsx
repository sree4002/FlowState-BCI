import React, { useRef } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Animated,
  Alert,
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
 * Props for StopButton component
 */
export interface StopButtonProps {
  /** Callback when stop action is triggered */
  onPress?: () => void;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Size variant of the button */
  size?: 'small' | 'medium' | 'large';
  /** Whether to show confirmation dialog before stopping */
  showConfirmation?: boolean;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Returns true if the session can be stopped (running or paused)
 */
export const canStopSession = (sessionState: SessionState): boolean => {
  return sessionState === 'running' || sessionState === 'paused';
};

/**
 * Returns the button label based on session state
 */
export const getStopButtonLabel = (sessionState: SessionState): string => {
  switch (sessionState) {
    case 'running':
    case 'paused':
      return 'Stop';
    case 'stopped':
      return 'Stopped';
    case 'idle':
    default:
      return 'Stop';
  }
};

/**
 * Returns the button color based on session state and disabled status
 */
export const getStopButtonColor = (
  sessionState: SessionState,
  disabled: boolean
): string => {
  if (disabled || !canStopSession(sessionState)) {
    return Colors.interactive.disabled;
  }
  return Colors.accent.error; // Red for stop action
};

/**
 * Returns the accessibility label for the stop button
 */
export const getStopAccessibilityLabel = (
  sessionState: SessionState
): string => {
  switch (sessionState) {
    case 'running':
      return 'Stop session';
    case 'paused':
      return 'Stop paused session';
    case 'stopped':
      return 'Session already stopped';
    case 'idle':
    default:
      return 'Stop session (no active session)';
  }
};

/**
 * Returns the accessibility hint for the stop button
 */
export const getStopAccessibilityHint = (
  sessionState: SessionState
): string => {
  if (canStopSession(sessionState)) {
    return 'Double tap to end the current session';
  }
  return 'No active session to stop';
};

/**
 * Returns the stop icon character (using unicode square symbol)
 */
export const getStopButtonIcon = (): string => {
  return '⏹'; // Stop symbol (square)
};

/**
 * Returns the confirmation message for stopping a session
 */
export const getStopConfirmationMessage = (
  sessionState: SessionState,
  elapsedSeconds: number
): string => {
  const minutes = Math.floor(elapsedSeconds / 60);
  const seconds = elapsedSeconds % 60;
  const timeString =
    minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds} seconds`;

  if (sessionState === 'running') {
    return `Are you sure you want to stop the current session? You have been running for ${timeString}.`;
  }
  return `Are you sure you want to end this paused session? You have completed ${timeString}.`;
};

/**
 * StopButton - Button for ending a session early
 *
 * Features:
 * - Clear red color indicating destructive action
 * - Optional confirmation dialog before stopping
 * - Disabled state when no active session
 * - Animated press feedback
 * - Accessible with proper labels and hints
 * - Supports multiple size variants
 *
 * Uses session context to read and update session state.
 */
export const StopButton: React.FC<StopButtonProps> = ({
  onPress,
  disabled = false,
  size = 'medium',
  showConfirmation = true,
  testID = 'stop-button',
}) => {
  const { sessionState, setSessionState, elapsedSeconds } = useSession();

  // Animated value for press feedback
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const executeStop = () => {
    if (onPress) {
      onPress();
    } else {
      setSessionState('stopped');
    }
  };

  const handlePress = () => {
    if (disabled || !canStopSession(sessionState)) return;

    if (showConfirmation) {
      Alert.alert(
        'End Session',
        getStopConfirmationMessage(sessionState, elapsedSeconds),
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Stop Session',
            style: 'destructive',
            onPress: executeStop,
          },
        ],
        { cancelable: true }
      );
    } else {
      executeStop();
    }
  };

  const isDisabled = disabled || !canStopSession(sessionState);
  const buttonLabel = getStopButtonLabel(sessionState);
  const buttonColor = getStopButtonColor(sessionState, disabled);
  const accessibilityLabel = getStopAccessibilityLabel(sessionState);
  const accessibilityHint = getStopAccessibilityHint(sessionState);
  const buttonIcon = getStopButtonIcon();

  const accessibilityState: AccessibilityState = {
    disabled: isDisabled,
  };

  // Size-based style selection
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          button: styles.buttonSmall,
          icon: styles.iconSmall,
          label: styles.labelSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          button: styles.buttonLarge,
          icon: styles.iconLarge,
          label: styles.labelLarge,
        };
      case 'medium':
      default:
        return {
          container: styles.containerMedium,
          button: styles.buttonMedium,
          icon: styles.iconMedium,
          label: styles.labelMedium,
        };
    }
  };

  const sizeStyles = getSizeStyles();

  return (
    <Animated.View
      style={[
        styles.container,
        sizeStyles.container,
        { transform: [{ scale: scaleAnim }] },
      ]}
      testID={`${testID}-container`}
    >
      <TouchableOpacity
        style={[
          styles.button,
          sizeStyles.button,
          { backgroundColor: buttonColor },
          isDisabled && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
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
              sizeStyles.icon,
              isDisabled && styles.textDisabled,
            ]}
            testID={`${testID}-icon`}
          >
            {buttonIcon}
          </Text>
          <Text
            style={[
              styles.label,
              sizeStyles.label,
              isDisabled && styles.textDisabled,
            ]}
            testID={`${testID}-label`}
          >
            {buttonLabel}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Status text below button when stopped */}
      {sessionState === 'stopped' && (
        <Text style={styles.statusLabel} testID={`${testID}-status-label`}>
          Session ended
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  containerSmall: {
    marginVertical: Spacing.sm,
  },
  containerMedium: {
    marginVertical: Spacing.md,
  },
  containerLarge: {
    marginVertical: Spacing.lg,
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  buttonSmall: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
  },
  buttonMedium: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
  },
  buttonLarge: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.xl,
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
  iconSmall: {
    fontSize: 18,
  },
  iconMedium: {
    fontSize: 24,
  },
  iconLarge: {
    fontSize: 32,
  },
  label: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1,
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
  textDisabled: {
    color: Colors.text.disabled,
  },
  statusLabel: {
    marginTop: Spacing.sm,
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
});

export default StopButton;
