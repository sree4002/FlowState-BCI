/**
 * Type declarations for expo-battery module
 * This module may not be installed in all environments
 */
declare module 'expo-battery' {
  /**
   * Battery state enumeration
   */
  export enum BatteryState {
    UNKNOWN = 0,
    UNPLUGGED = 1,
    CHARGING = 2,
    FULL = 3,
  }

  /**
   * Gets the battery level of the device as a value between 0 and 1
   * @returns Battery level (0-1) or -1 if unknown
   */
  export function getBatteryLevelAsync(): Promise<number>;

  /**
   * Gets the current battery state
   */
  export function getBatteryStateAsync(): Promise<BatteryState>;

  /**
   * Checks if low power mode is currently enabled
   * @returns True if low power mode is enabled
   */
  export function isLowPowerModeEnabledAsync(): Promise<boolean>;

  /**
   * Checks if battery monitoring is available on this device
   */
  export function isAvailableAsync(): Promise<boolean>;

  /**
   * Subscribe to battery level changes
   * @param listener - Callback for battery level changes
   * @returns Subscription object with remove() method
   */
  export function addBatteryLevelListener(
    listener: (event: { batteryLevel: number }) => void
  ): { remove: () => void };

  /**
   * Subscribe to battery state changes
   * @param listener - Callback for battery state changes
   * @returns Subscription object with remove() method
   */
  export function addBatteryStateListener(
    listener: (event: { batteryState: BatteryState }) => void
  ): { remove: () => void };

  /**
   * Subscribe to low power mode changes
   * @param listener - Callback for low power mode changes
   * @returns Subscription object with remove() method
   */
  export function addLowPowerModeListener(
    listener: (event: { lowPowerMode: boolean }) => void
  ): { remove: () => void };
}
