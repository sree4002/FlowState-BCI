/**
 * FlowState BCI - Haptic Feedback Utilities
 *
 * Provides haptic feedback for key interactions.
 * Gracefully handles cases where haptics are not available.
 */

import { Platform } from 'react-native';

/**
 * Haptic feedback types
 */
export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'selection';

/**
 * Check if haptics are available
 */
let hapticsAvailable = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Haptics: any = null;

// Try to import expo-haptics
try {
  // Dynamic import to avoid crash if not installed
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Haptics = require('expo-haptics');
  hapticsAvailable = Platform.OS !== 'web';
} catch {
  hapticsAvailable = false;
}

/**
 * Check if haptic feedback is available on this device
 */
export function isHapticsAvailable(): boolean {
  return hapticsAvailable;
}

/**
 * Trigger haptic feedback
 *
 * @param type - The type of haptic feedback to trigger
 */
export async function triggerHaptic(type: HapticFeedbackType): Promise<void> {
  if (!hapticsAvailable || !Haptics) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case 'medium':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case 'heavy':
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case 'success':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        break;
      case 'warning':
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        break;
      case 'error':
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'selection':
        await Haptics.selectionAsync();
        break;
    }
  } catch (error) {
    // Silently fail - haptics not critical
    console.debug('[Haptics] Failed to trigger haptic:', error);
  }
}

/**
 * Convenience functions for common haptic feedback patterns
 */
export const Haptic = {
  /**
   * Light impact - for subtle UI interactions
   */
  light: () => triggerHaptic('light'),

  /**
   * Medium impact - for standard button presses
   */
  medium: () => triggerHaptic('medium'),

  /**
   * Heavy impact - for significant actions
   */
  heavy: () => triggerHaptic('heavy'),

  /**
   * Success notification - for completed actions
   */
  success: () => triggerHaptic('success'),

  /**
   * Warning notification - for alerts
   */
  warning: () => triggerHaptic('warning'),

  /**
   * Error notification - for failures
   */
  error: () => triggerHaptic('error'),

  /**
   * Selection feedback - for picker/selection changes
   */
  selection: () => triggerHaptic('selection'),

  /**
   * Button press - standard button haptic
   */
  buttonPress: () => triggerHaptic('light'),

  /**
   * Session start - important action haptic
   */
  sessionStart: () => triggerHaptic('medium'),

  /**
   * Session complete - success haptic
   */
  sessionComplete: () => triggerHaptic('success'),

  /**
   * Toggle change - selection haptic
   */
  toggle: () => triggerHaptic('selection'),

  /**
   * Calibration milestone - medium haptic
   */
  calibrationMilestone: () => triggerHaptic('medium'),

  /**
   * Device connected - success haptic
   */
  deviceConnected: () => triggerHaptic('success'),

  /**
   * Device disconnected - warning haptic
   */
  deviceDisconnected: () => triggerHaptic('warning'),

  /**
   * Error occurred - error haptic
   */
  errorOccurred: () => triggerHaptic('error'),
};

export default Haptic;
