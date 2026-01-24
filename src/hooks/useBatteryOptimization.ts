/**
 * FlowState BCI - Battery Optimization Hook
 *
 * React hook for monitoring battery level and providing
 * optimized configuration for active sessions.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  BatteryOptimizationConfig,
  getBatteryLevel,
  isLowPowerMode,
  getBatteryOptimizedConfig,
  isBatteryMonitoringAvailable,
  BATTERY_THRESHOLDS,
} from '../utils/batteryOptimization';

/**
 * Hook options
 */
export interface UseBatteryOptimizationOptions {
  /** How often to poll battery level (in milliseconds). Default: 60000 (1 minute) */
  pollingInterval?: number;
  /** Whether to enable battery monitoring. Default: true */
  enabled?: boolean;
  /** Callback when optimization level changes */
  onOptimizationLevelChange?: (
    newLevel: 'none' | 'moderate' | 'aggressive',
    oldLevel: 'none' | 'moderate' | 'aggressive'
  ) => void;
}

/**
 * Hook return value
 */
export interface UseBatteryOptimizationResult {
  /** Current battery optimization configuration */
  config: BatteryOptimizationConfig;
  /** Whether battery monitoring is available on this device */
  isAvailable: boolean;
  /** Whether the hook is currently loading initial battery state */
  isLoading: boolean;
  /** Force refresh the battery state */
  refresh: () => Promise<void>;
  /** Last time battery state was updated */
  lastUpdated: Date | null;
}

/**
 * Default polling interval (1 minute)
 */
const DEFAULT_POLLING_INTERVAL = 60000;

/**
 * Default configuration when battery state is unknown
 */
const DEFAULT_CONFIG: BatteryOptimizationConfig = {
  samplingRate: 256,
  chartUpdateInterval: 100,
  reduceAnimations: false,
  batteryLevel: 100,
  isLowPowerMode: false,
  optimizationLevel: 'none',
};

/**
 * Hook for monitoring battery level and providing optimized configuration
 *
 * @param options - Hook configuration options
 * @returns Battery optimization result with config and utilities
 *
 * @example
 * ```tsx
 * function ActiveSession() {
 *   const { config, isLoading } = useBatteryOptimization({
 *     pollingInterval: 30000,
 *     onOptimizationLevelChange: (newLevel) => {
 *       console.log('Battery optimization changed to:', newLevel);
 *     },
 *   });
 *
 *   // Use config.samplingRate, config.chartUpdateInterval, etc.
 *   return (
 *     <View>
 *       <Chart updateInterval={config.chartUpdateInterval} />
 *       {config.reduceAnimations ? <StaticIndicator /> : <AnimatedIndicator />}
 *     </View>
 *   );
 * }
 * ```
 */
export function useBatteryOptimization(
  options: UseBatteryOptimizationOptions = {}
): UseBatteryOptimizationResult {
  const {
    pollingInterval = DEFAULT_POLLING_INTERVAL,
    enabled = true,
    onOptimizationLevelChange,
  } = options;

  const [config, setConfig] = useState<BatteryOptimizationConfig>(DEFAULT_CONFIG);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Keep track of previous optimization level for change detection
  const previousOptimizationLevel = useRef<'none' | 'moderate' | 'aggressive'>('none');

  /**
   * Fetches current battery state and updates config
   */
  const fetchBatteryState = useCallback(async (): Promise<void> => {
    try {
      const [batteryLevel, lowPowerMode] = await Promise.all([
        getBatteryLevel(),
        isLowPowerMode(),
      ]);

      const newConfig = getBatteryOptimizedConfig(batteryLevel, lowPowerMode);

      // Check if optimization level changed
      if (
        onOptimizationLevelChange &&
        previousOptimizationLevel.current !== newConfig.optimizationLevel
      ) {
        onOptimizationLevelChange(
          newConfig.optimizationLevel,
          previousOptimizationLevel.current
        );
      }

      previousOptimizationLevel.current = newConfig.optimizationLevel;
      setConfig(newConfig);
      setLastUpdated(new Date());
    } catch {
      // Keep existing config on error
      console.warn('[useBatteryOptimization] Failed to fetch battery state');
    }
  }, [onOptimizationLevelChange]);

  /**
   * Public refresh function
   */
  const refresh = useCallback(async (): Promise<void> => {
    await fetchBatteryState();
  }, [fetchBatteryState]);

  // Check availability and fetch initial state
  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let mounted = true;

    const initialize = async () => {
      try {
        const available = await isBatteryMonitoringAvailable();

        if (!mounted) return;

        setIsAvailable(available);

        if (available) {
          await fetchBatteryState();
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [enabled, fetchBatteryState]);

  // Set up polling interval
  useEffect(() => {
    if (!enabled || !isAvailable || pollingInterval <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      fetchBatteryState();
    }, pollingInterval);

    return () => {
      clearInterval(intervalId);
    };
  }, [enabled, isAvailable, pollingInterval, fetchBatteryState]);

  return {
    config,
    isAvailable,
    isLoading,
    refresh,
    lastUpdated,
  };
}

/**
 * Determines if the optimization level has changed significantly
 * @param oldLevel - Previous optimization level
 * @param newLevel - New optimization level
 * @returns True if the change is significant (not just none -> none or same level)
 */
export function hasOptimizationLevelChanged(
  oldLevel: 'none' | 'moderate' | 'aggressive',
  newLevel: 'none' | 'moderate' | 'aggressive'
): boolean {
  return oldLevel !== newLevel;
}

/**
 * Gets a human-readable description of the optimization level
 * @param level - Optimization level
 * @returns Description string
 */
export function getOptimizationLevelDescription(
  level: 'none' | 'moderate' | 'aggressive'
): string {
  switch (level) {
    case 'none':
      return 'Full performance mode';
    case 'moderate':
      return 'Battery saver mode - reduced update frequency';
    case 'aggressive':
      return 'Low battery mode - minimal updates and animations';
  }
}

/**
 * Gets the battery level category
 * @param batteryLevel - Battery percentage
 * @returns Category string
 */
export function getBatteryLevelCategory(
  batteryLevel: number
): 'critical' | 'low' | 'moderate' | 'normal' {
  if (batteryLevel <= BATTERY_THRESHOLDS.CRITICAL) {
    return 'critical';
  }
  if (batteryLevel <= BATTERY_THRESHOLDS.LOW) {
    return 'low';
  }
  if (batteryLevel <= BATTERY_THRESHOLDS.MODERATE) {
    return 'moderate';
  }
  return 'normal';
}

export default useBatteryOptimization;
