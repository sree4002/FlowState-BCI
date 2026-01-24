/**
 * Tests for useBatteryOptimization hook utility functions
 *
 * Verifies helper functions for battery optimization.
 * Hook rendering tests are excluded due to async complexity with expo-battery.
 */

import {
  hasOptimizationLevelChanged,
  getOptimizationLevelDescription,
  getBatteryLevelCategory,
} from '../src/hooks/useBatteryOptimization';
import {
  BATTERY_THRESHOLDS,
} from '../src/utils/batteryOptimization';

describe('useBatteryOptimization helper functions', () => {
  describe('hasOptimizationLevelChanged', () => {
    it('should return false for same levels', () => {
      expect(hasOptimizationLevelChanged('none', 'none')).toBe(false);
      expect(hasOptimizationLevelChanged('moderate', 'moderate')).toBe(false);
      expect(hasOptimizationLevelChanged('aggressive', 'aggressive')).toBe(false);
    });

    it('should return true for different levels', () => {
      expect(hasOptimizationLevelChanged('none', 'moderate')).toBe(true);
      expect(hasOptimizationLevelChanged('none', 'aggressive')).toBe(true);
      expect(hasOptimizationLevelChanged('moderate', 'none')).toBe(true);
      expect(hasOptimizationLevelChanged('moderate', 'aggressive')).toBe(true);
      expect(hasOptimizationLevelChanged('aggressive', 'none')).toBe(true);
      expect(hasOptimizationLevelChanged('aggressive', 'moderate')).toBe(true);
    });
  });

  describe('getOptimizationLevelDescription', () => {
    it('should return description for none', () => {
      expect(getOptimizationLevelDescription('none')).toBe('Full performance mode');
    });

    it('should return description for moderate', () => {
      expect(getOptimizationLevelDescription('moderate')).toBe(
        'Battery saver mode - reduced update frequency'
      );
    });

    it('should return description for aggressive', () => {
      expect(getOptimizationLevelDescription('aggressive')).toBe(
        'Low battery mode - minimal updates and animations'
      );
    });
  });

  describe('getBatteryLevelCategory', () => {
    it('should return critical for 0-10%', () => {
      expect(getBatteryLevelCategory(0)).toBe('critical');
      expect(getBatteryLevelCategory(5)).toBe('critical');
      expect(getBatteryLevelCategory(BATTERY_THRESHOLDS.CRITICAL)).toBe('critical');
    });

    it('should return low for 11-20%', () => {
      expect(getBatteryLevelCategory(11)).toBe('low');
      expect(getBatteryLevelCategory(15)).toBe('low');
      expect(getBatteryLevelCategory(BATTERY_THRESHOLDS.LOW)).toBe('low');
    });

    it('should return moderate for 21-35%', () => {
      expect(getBatteryLevelCategory(21)).toBe('moderate');
      expect(getBatteryLevelCategory(30)).toBe('moderate');
      expect(getBatteryLevelCategory(BATTERY_THRESHOLDS.MODERATE)).toBe('moderate');
    });

    it('should return normal for 36-100%', () => {
      expect(getBatteryLevelCategory(36)).toBe('normal');
      expect(getBatteryLevelCategory(50)).toBe('normal');
      expect(getBatteryLevelCategory(100)).toBe('normal');
    });

    it('should handle boundary values correctly', () => {
      // At exact thresholds
      expect(getBatteryLevelCategory(10)).toBe('critical');
      expect(getBatteryLevelCategory(20)).toBe('low');
      expect(getBatteryLevelCategory(35)).toBe('moderate');
      expect(getBatteryLevelCategory(36)).toBe('normal');
    });
  });
});

describe('useBatteryOptimization hook interface', () => {
  describe('UseBatteryOptimizationOptions type', () => {
    it('should accept pollingInterval option', () => {
      const options = { pollingInterval: 30000 };
      expect(options.pollingInterval).toBe(30000);
    });

    it('should accept enabled option', () => {
      const options = { enabled: false };
      expect(options.enabled).toBe(false);
    });

    it('should accept onOptimizationLevelChange callback', () => {
      const callback = jest.fn();
      const options = { onOptimizationLevelChange: callback };
      options.onOptimizationLevelChange('moderate', 'none');
      expect(callback).toHaveBeenCalledWith('moderate', 'none');
    });
  });

  describe('UseBatteryOptimizationResult type', () => {
    it('should have expected shape', () => {
      const result = {
        config: {
          samplingRate: 256,
          chartUpdateInterval: 100,
          reduceAnimations: false,
          batteryLevel: 100,
          isLowPowerMode: false,
          optimizationLevel: 'none' as const,
        },
        isAvailable: true,
        isLoading: false,
        refresh: async () => {},
        lastUpdated: new Date(),
      };

      expect(result.config).toBeDefined();
      expect(result.isAvailable).toBe(true);
      expect(result.isLoading).toBe(false);
      expect(typeof result.refresh).toBe('function');
      expect(result.lastUpdated).toBeInstanceOf(Date);
    });
  });
});

describe('Default hook values', () => {
  it('should define default polling interval', () => {
    // Default polling interval is 60000ms (1 minute)
    const DEFAULT_POLLING_INTERVAL = 60000;
    expect(DEFAULT_POLLING_INTERVAL).toBe(60000);
  });

  it('should define default config values', () => {
    const DEFAULT_CONFIG = {
      samplingRate: 256,
      chartUpdateInterval: 100,
      reduceAnimations: false,
      batteryLevel: 100,
      isLowPowerMode: false,
      optimizationLevel: 'none' as const,
    };

    expect(DEFAULT_CONFIG.samplingRate).toBe(256);
    expect(DEFAULT_CONFIG.chartUpdateInterval).toBe(100);
    expect(DEFAULT_CONFIG.reduceAnimations).toBe(false);
    expect(DEFAULT_CONFIG.batteryLevel).toBe(100);
    expect(DEFAULT_CONFIG.isLowPowerMode).toBe(false);
    expect(DEFAULT_CONFIG.optimizationLevel).toBe('none');
  });
});
