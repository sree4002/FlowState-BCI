/**
 * FlowState BCI - Battery Optimization Utilities
 *
 * Provides battery-aware configuration for active sessions.
 * Optimizes sampling rates, chart update intervals, and animations
 * based on current battery level and low power mode status.
 */

/**
 * Battery optimization configuration
 */
export interface BatteryOptimizationConfig {
  /** Recommended EEG sampling rate in Hz */
  samplingRate: number;
  /** Chart update interval in milliseconds */
  chartUpdateInterval: number;
  /** Whether to reduce UI animations */
  reduceAnimations: boolean;
  /** Current battery level (0-100) */
  batteryLevel: number;
  /** Whether device is in low power mode */
  isLowPowerMode: boolean;
  /** Optimization level based on battery state */
  optimizationLevel: 'none' | 'moderate' | 'aggressive';
}

/**
 * Battery level thresholds for optimization
 */
export const BATTERY_THRESHOLDS = {
  /** Below this level, apply aggressive optimizations */
  CRITICAL: 10,
  /** Below this level, reduce animations */
  LOW: 20,
  /** Below this level, apply moderate optimizations */
  MODERATE: 35,
  /** Above this level, no optimizations needed */
  NORMAL: 35,
} as const;

/**
 * Default sampling rates (in Hz)
 */
export const SAMPLING_RATES = {
  /** Full sampling rate for normal battery */
  NORMAL: 256,
  /** Reduced rate for moderate battery savings */
  MODERATE: 128,
  /** Minimum rate for aggressive battery savings */
  AGGRESSIVE: 64,
} as const;

/**
 * Chart update intervals (in milliseconds)
 */
export const CHART_UPDATE_INTERVALS = {
  /** Fast updates for normal battery */
  NORMAL: 100,
  /** Slower updates for moderate battery savings */
  MODERATE: 250,
  /** Slowest updates for aggressive battery savings */
  AGGRESSIVE: 500,
} as const;

/**
 * Default battery level when actual level cannot be determined
 */
const DEFAULT_BATTERY_LEVEL = 100;

/**
 * Interface for expo-battery module functions we use
 */
interface ExpoBatteryModule {
  getBatteryLevelAsync: () => Promise<number>;
  isLowPowerModeEnabledAsync: () => Promise<boolean>;
}

/**
 * Flag to track expo-battery availability
 */
let expoBatteryAvailable: boolean | null = null;
let expoBattery: ExpoBatteryModule | null = null;

/**
 * Attempts to load expo-battery module
 * @returns Whether expo-battery is available
 */
async function loadExpoBattery(): Promise<boolean> {
  if (expoBatteryAvailable !== null) {
    return expoBatteryAvailable;
  }

  try {
    // Dynamic import for optional dependency
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    expoBattery = await import('expo-battery').catch(() => null) as ExpoBatteryModule | null;
    expoBatteryAvailable = expoBattery !== null;
    return expoBatteryAvailable;
  } catch {
    expoBatteryAvailable = false;
    return false;
  }
}

/**
 * Gets the current battery level
 * @returns Battery percentage (0-100), or 100 if unavailable
 */
export async function getBatteryLevel(): Promise<number> {
  try {
    const isAvailable = await loadExpoBattery();
    if (!isAvailable || !expoBattery) {
      return DEFAULT_BATTERY_LEVEL;
    }

    const level = await expoBattery.getBatteryLevelAsync();

    // Battery level is returned as 0-1 float, convert to percentage
    if (level < 0) {
      // -1 indicates battery level is unknown
      return DEFAULT_BATTERY_LEVEL;
    }

    return Math.round(level * 100);
  } catch {
    // Graceful fallback if battery API fails
    return DEFAULT_BATTERY_LEVEL;
  }
}

/**
 * Checks if the device is in low power mode
 * @returns True if low power mode is enabled
 */
export async function isLowPowerMode(): Promise<boolean> {
  try {
    const isAvailable = await loadExpoBattery();
    if (!isAvailable || !expoBattery) {
      return false;
    }

    return await expoBattery.isLowPowerModeEnabledAsync();
  } catch {
    // Graceful fallback if API fails
    return false;
  }
}

/**
 * Gets the optimal sampling rate based on battery level
 * @param batteryLevel - Current battery percentage (0-100)
 * @returns Optimal sampling rate in Hz
 */
export function getOptimalSamplingRate(batteryLevel: number): number {
  if (batteryLevel < 0 || batteryLevel > 100) {
    throw new Error('Battery level must be between 0 and 100');
  }

  if (batteryLevel <= BATTERY_THRESHOLDS.CRITICAL) {
    return SAMPLING_RATES.AGGRESSIVE;
  }

  if (batteryLevel <= BATTERY_THRESHOLDS.MODERATE) {
    return SAMPLING_RATES.MODERATE;
  }

  return SAMPLING_RATES.NORMAL;
}

/**
 * Gets the optimal chart update interval based on battery level
 * @param batteryLevel - Current battery percentage (0-100)
 * @returns Update interval in milliseconds
 */
export function getOptimalChartUpdateInterval(batteryLevel: number): number {
  if (batteryLevel < 0 || batteryLevel > 100) {
    throw new Error('Battery level must be between 0 and 100');
  }

  if (batteryLevel <= BATTERY_THRESHOLDS.CRITICAL) {
    return CHART_UPDATE_INTERVALS.AGGRESSIVE;
  }

  if (batteryLevel <= BATTERY_THRESHOLDS.MODERATE) {
    return CHART_UPDATE_INTERVALS.MODERATE;
  }

  return CHART_UPDATE_INTERVALS.NORMAL;
}

/**
 * Determines if animations should be reduced based on battery level
 * @param batteryLevel - Current battery percentage (0-100)
 * @returns True if animations should be reduced
 */
export function shouldReduceAnimations(batteryLevel: number): boolean {
  if (batteryLevel < 0 || batteryLevel > 100) {
    throw new Error('Battery level must be between 0 and 100');
  }

  return batteryLevel < BATTERY_THRESHOLDS.LOW;
}

/**
 * Determines the optimization level based on battery state
 * @param batteryLevel - Current battery percentage (0-100)
 * @param lowPowerMode - Whether device is in low power mode
 * @returns Optimization level
 */
export function getOptimizationLevel(
  batteryLevel: number,
  lowPowerMode: boolean
): 'none' | 'moderate' | 'aggressive' {
  // Low power mode always triggers at least moderate optimization
  if (lowPowerMode) {
    return batteryLevel <= BATTERY_THRESHOLDS.LOW ? 'aggressive' : 'moderate';
  }

  if (batteryLevel <= BATTERY_THRESHOLDS.CRITICAL) {
    return 'aggressive';
  }

  if (batteryLevel <= BATTERY_THRESHOLDS.MODERATE) {
    return 'moderate';
  }

  return 'none';
}

/**
 * Gets a complete battery-optimized configuration
 * @param batteryLevel - Current battery percentage (0-100)
 * @param lowPowerMode - Whether device is in low power mode (optional, defaults to false)
 * @returns Full optimization configuration
 */
export function getBatteryOptimizedConfig(
  batteryLevel: number,
  lowPowerMode: boolean = false
): BatteryOptimizationConfig {
  if (batteryLevel < 0 || batteryLevel > 100) {
    throw new Error('Battery level must be between 0 and 100');
  }

  const optimizationLevel = getOptimizationLevel(batteryLevel, lowPowerMode);

  // Apply low power mode adjustments
  let effectiveBatteryLevel = batteryLevel;
  if (lowPowerMode && batteryLevel > BATTERY_THRESHOLDS.MODERATE) {
    // Treat low power mode as if battery is at moderate threshold
    effectiveBatteryLevel = BATTERY_THRESHOLDS.MODERATE;
  }

  return {
    samplingRate: getOptimalSamplingRate(effectiveBatteryLevel),
    chartUpdateInterval: getOptimalChartUpdateInterval(effectiveBatteryLevel),
    reduceAnimations: shouldReduceAnimations(effectiveBatteryLevel) || lowPowerMode,
    batteryLevel,
    isLowPowerMode: lowPowerMode,
    optimizationLevel,
  };
}

/**
 * Gets the current battery-optimized configuration asynchronously
 * Fetches actual battery level and low power mode status
 * @returns Full optimization configuration based on current device state
 */
export async function getCurrentBatteryOptimizedConfig(): Promise<BatteryOptimizationConfig> {
  const [batteryLevel, lowPowerMode] = await Promise.all([
    getBatteryLevel(),
    isLowPowerMode(),
  ]);

  return getBatteryOptimizedConfig(batteryLevel, lowPowerMode);
}

/**
 * Checks if battery monitoring is available on this device
 * @returns True if expo-battery is available
 */
export async function isBatteryMonitoringAvailable(): Promise<boolean> {
  return loadExpoBattery();
}

/**
 * Resets the expo-battery availability cache (useful for testing)
 */
export function _resetBatteryModuleCache(): void {
  expoBatteryAvailable = null;
  expoBattery = null;
}
