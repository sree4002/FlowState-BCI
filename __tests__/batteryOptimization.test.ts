/**
 * Tests for battery optimization utilities
 *
 * Verifies battery level detection, sampling rate optimization,
 * chart update intervals, animation reduction, and configuration generation.
 */

import {
  BatteryOptimizationConfig,
  BATTERY_THRESHOLDS,
  SAMPLING_RATES,
  CHART_UPDATE_INTERVALS,
  getBatteryLevel,
  isLowPowerMode,
  getOptimalSamplingRate,
  getOptimalChartUpdateInterval,
  shouldReduceAnimations,
  getOptimizationLevel,
  getBatteryOptimizedConfig,
  getCurrentBatteryOptimizedConfig,
  isBatteryMonitoringAvailable,
  _resetBatteryModuleCache,
} from '../src/utils/batteryOptimization';

// Mock expo-battery
const mockGetBatteryLevelAsync = jest.fn();
const mockIsLowPowerModeEnabledAsync = jest.fn();

jest.mock('expo-battery', () => ({
  getBatteryLevelAsync: () => mockGetBatteryLevelAsync(),
  isLowPowerModeEnabledAsync: () => mockIsLowPowerModeEnabledAsync(),
}), { virtual: true });

describe('Battery Optimization Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetBatteryModuleCache();
  });

  describe('BATTERY_THRESHOLDS', () => {
    it('should have correct threshold values', () => {
      expect(BATTERY_THRESHOLDS.CRITICAL).toBe(10);
      expect(BATTERY_THRESHOLDS.LOW).toBe(20);
      expect(BATTERY_THRESHOLDS.MODERATE).toBe(35);
      expect(BATTERY_THRESHOLDS.NORMAL).toBe(35);
    });

    it('should have thresholds in ascending order', () => {
      expect(BATTERY_THRESHOLDS.CRITICAL).toBeLessThan(BATTERY_THRESHOLDS.LOW);
      expect(BATTERY_THRESHOLDS.LOW).toBeLessThan(BATTERY_THRESHOLDS.MODERATE);
    });
  });

  describe('SAMPLING_RATES', () => {
    it('should have correct sampling rate values', () => {
      expect(SAMPLING_RATES.NORMAL).toBe(256);
      expect(SAMPLING_RATES.MODERATE).toBe(128);
      expect(SAMPLING_RATES.AGGRESSIVE).toBe(64);
    });

    it('should have rates in descending order', () => {
      expect(SAMPLING_RATES.NORMAL).toBeGreaterThan(SAMPLING_RATES.MODERATE);
      expect(SAMPLING_RATES.MODERATE).toBeGreaterThan(SAMPLING_RATES.AGGRESSIVE);
    });
  });

  describe('CHART_UPDATE_INTERVALS', () => {
    it('should have correct interval values', () => {
      expect(CHART_UPDATE_INTERVALS.NORMAL).toBe(100);
      expect(CHART_UPDATE_INTERVALS.MODERATE).toBe(250);
      expect(CHART_UPDATE_INTERVALS.AGGRESSIVE).toBe(500);
    });

    it('should have intervals in ascending order (slower updates as battery decreases)', () => {
      expect(CHART_UPDATE_INTERVALS.NORMAL).toBeLessThan(CHART_UPDATE_INTERVALS.MODERATE);
      expect(CHART_UPDATE_INTERVALS.MODERATE).toBeLessThan(CHART_UPDATE_INTERVALS.AGGRESSIVE);
    });
  });

  describe('getBatteryLevel', () => {
    it('should return battery level as percentage when expo-battery is available', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(0.75);

      const level = await getBatteryLevel();

      expect(level).toBe(75);
    });

    it('should convert 0-1 float to percentage', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(0.5);

      const level = await getBatteryLevel();

      expect(level).toBe(50);
    });

    it('should return 100 when battery level is unknown (-1)', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(-1);

      const level = await getBatteryLevel();

      expect(level).toBe(100);
    });

    it('should return 100 when expo-battery throws an error', async () => {
      mockGetBatteryLevelAsync.mockRejectedValue(new Error('Not available'));

      const level = await getBatteryLevel();

      expect(level).toBe(100);
    });

    it('should round battery level to nearest integer', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(0.456);

      const level = await getBatteryLevel();

      expect(level).toBe(46);
    });

    it('should handle 0% battery', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(0);

      const level = await getBatteryLevel();

      expect(level).toBe(0);
    });

    it('should handle 100% battery', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(1.0);

      const level = await getBatteryLevel();

      expect(level).toBe(100);
    });
  });

  describe('isLowPowerMode', () => {
    it('should return true when low power mode is enabled', async () => {
      mockIsLowPowerModeEnabledAsync.mockResolvedValue(true);

      const result = await isLowPowerMode();

      expect(result).toBe(true);
    });

    it('should return false when low power mode is disabled', async () => {
      mockIsLowPowerModeEnabledAsync.mockResolvedValue(false);

      const result = await isLowPowerMode();

      expect(result).toBe(false);
    });

    it('should return false when expo-battery throws an error', async () => {
      mockIsLowPowerModeEnabledAsync.mockRejectedValue(new Error('Not available'));

      const result = await isLowPowerMode();

      expect(result).toBe(false);
    });
  });

  describe('getOptimalSamplingRate', () => {
    it('should return aggressive rate for critical battery (<=10%)', () => {
      expect(getOptimalSamplingRate(10)).toBe(SAMPLING_RATES.AGGRESSIVE);
      expect(getOptimalSamplingRate(5)).toBe(SAMPLING_RATES.AGGRESSIVE);
      expect(getOptimalSamplingRate(0)).toBe(SAMPLING_RATES.AGGRESSIVE);
    });

    it('should return moderate rate for moderate battery (11-35%)', () => {
      expect(getOptimalSamplingRate(11)).toBe(SAMPLING_RATES.MODERATE);
      expect(getOptimalSamplingRate(20)).toBe(SAMPLING_RATES.MODERATE);
      expect(getOptimalSamplingRate(35)).toBe(SAMPLING_RATES.MODERATE);
    });

    it('should return normal rate for good battery (>35%)', () => {
      expect(getOptimalSamplingRate(36)).toBe(SAMPLING_RATES.NORMAL);
      expect(getOptimalSamplingRate(50)).toBe(SAMPLING_RATES.NORMAL);
      expect(getOptimalSamplingRate(100)).toBe(SAMPLING_RATES.NORMAL);
    });

    it('should throw error for invalid battery level', () => {
      expect(() => getOptimalSamplingRate(-1)).toThrow('Battery level must be between 0 and 100');
      expect(() => getOptimalSamplingRate(101)).toThrow('Battery level must be between 0 and 100');
    });

    it('should handle boundary values correctly', () => {
      // At exactly 10% - critical
      expect(getOptimalSamplingRate(10)).toBe(SAMPLING_RATES.AGGRESSIVE);
      // At exactly 35% - moderate
      expect(getOptimalSamplingRate(35)).toBe(SAMPLING_RATES.MODERATE);
      // Just above 35% - normal
      expect(getOptimalSamplingRate(36)).toBe(SAMPLING_RATES.NORMAL);
    });
  });

  describe('getOptimalChartUpdateInterval', () => {
    it('should return aggressive interval for critical battery (<=10%)', () => {
      expect(getOptimalChartUpdateInterval(10)).toBe(CHART_UPDATE_INTERVALS.AGGRESSIVE);
      expect(getOptimalChartUpdateInterval(5)).toBe(CHART_UPDATE_INTERVALS.AGGRESSIVE);
      expect(getOptimalChartUpdateInterval(0)).toBe(CHART_UPDATE_INTERVALS.AGGRESSIVE);
    });

    it('should return moderate interval for moderate battery (11-35%)', () => {
      expect(getOptimalChartUpdateInterval(11)).toBe(CHART_UPDATE_INTERVALS.MODERATE);
      expect(getOptimalChartUpdateInterval(20)).toBe(CHART_UPDATE_INTERVALS.MODERATE);
      expect(getOptimalChartUpdateInterval(35)).toBe(CHART_UPDATE_INTERVALS.MODERATE);
    });

    it('should return normal interval for good battery (>35%)', () => {
      expect(getOptimalChartUpdateInterval(36)).toBe(CHART_UPDATE_INTERVALS.NORMAL);
      expect(getOptimalChartUpdateInterval(50)).toBe(CHART_UPDATE_INTERVALS.NORMAL);
      expect(getOptimalChartUpdateInterval(100)).toBe(CHART_UPDATE_INTERVALS.NORMAL);
    });

    it('should throw error for invalid battery level', () => {
      expect(() => getOptimalChartUpdateInterval(-1)).toThrow('Battery level must be between 0 and 100');
      expect(() => getOptimalChartUpdateInterval(101)).toThrow('Battery level must be between 0 and 100');
    });
  });

  describe('shouldReduceAnimations', () => {
    it('should return true for battery below 20%', () => {
      expect(shouldReduceAnimations(19)).toBe(true);
      expect(shouldReduceAnimations(10)).toBe(true);
      expect(shouldReduceAnimations(0)).toBe(true);
    });

    it('should return false for battery at or above 20%', () => {
      expect(shouldReduceAnimations(20)).toBe(false);
      expect(shouldReduceAnimations(50)).toBe(false);
      expect(shouldReduceAnimations(100)).toBe(false);
    });

    it('should throw error for invalid battery level', () => {
      expect(() => shouldReduceAnimations(-1)).toThrow('Battery level must be between 0 and 100');
      expect(() => shouldReduceAnimations(101)).toThrow('Battery level must be between 0 and 100');
    });

    it('should handle exact threshold of 20%', () => {
      expect(shouldReduceAnimations(20)).toBe(false);
      expect(shouldReduceAnimations(19)).toBe(true);
    });
  });

  describe('getOptimizationLevel', () => {
    describe('without low power mode', () => {
      it('should return none for good battery', () => {
        expect(getOptimizationLevel(100, false)).toBe('none');
        expect(getOptimizationLevel(50, false)).toBe('none');
        expect(getOptimizationLevel(36, false)).toBe('none');
      });

      it('should return moderate for moderate battery', () => {
        expect(getOptimizationLevel(35, false)).toBe('moderate');
        expect(getOptimizationLevel(20, false)).toBe('moderate');
        expect(getOptimizationLevel(11, false)).toBe('moderate');
      });

      it('should return aggressive for critical battery', () => {
        expect(getOptimizationLevel(10, false)).toBe('aggressive');
        expect(getOptimizationLevel(5, false)).toBe('aggressive');
        expect(getOptimizationLevel(0, false)).toBe('aggressive');
      });
    });

    describe('with low power mode', () => {
      it('should return at least moderate even with good battery', () => {
        expect(getOptimizationLevel(100, true)).toBe('moderate');
        expect(getOptimizationLevel(50, true)).toBe('moderate');
      });

      it('should return aggressive for low battery', () => {
        expect(getOptimizationLevel(20, true)).toBe('aggressive');
        expect(getOptimizationLevel(10, true)).toBe('aggressive');
        expect(getOptimizationLevel(5, true)).toBe('aggressive');
      });
    });
  });

  describe('getBatteryOptimizedConfig', () => {
    it('should return full config object', () => {
      const config = getBatteryOptimizedConfig(75);

      expect(config).toHaveProperty('samplingRate');
      expect(config).toHaveProperty('chartUpdateInterval');
      expect(config).toHaveProperty('reduceAnimations');
      expect(config).toHaveProperty('batteryLevel');
      expect(config).toHaveProperty('isLowPowerMode');
      expect(config).toHaveProperty('optimizationLevel');
    });

    it('should return correct config for good battery', () => {
      const config = getBatteryOptimizedConfig(75);

      expect(config.samplingRate).toBe(SAMPLING_RATES.NORMAL);
      expect(config.chartUpdateInterval).toBe(CHART_UPDATE_INTERVALS.NORMAL);
      expect(config.reduceAnimations).toBe(false);
      expect(config.batteryLevel).toBe(75);
      expect(config.isLowPowerMode).toBe(false);
      expect(config.optimizationLevel).toBe('none');
    });

    it('should return correct config for moderate battery', () => {
      const config = getBatteryOptimizedConfig(25);

      expect(config.samplingRate).toBe(SAMPLING_RATES.MODERATE);
      expect(config.chartUpdateInterval).toBe(CHART_UPDATE_INTERVALS.MODERATE);
      expect(config.reduceAnimations).toBe(false);
      expect(config.batteryLevel).toBe(25);
      expect(config.optimizationLevel).toBe('moderate');
    });

    it('should return correct config for low battery', () => {
      const config = getBatteryOptimizedConfig(15);

      expect(config.samplingRate).toBe(SAMPLING_RATES.MODERATE);
      expect(config.chartUpdateInterval).toBe(CHART_UPDATE_INTERVALS.MODERATE);
      expect(config.reduceAnimations).toBe(true);
      expect(config.batteryLevel).toBe(15);
      expect(config.optimizationLevel).toBe('moderate');
    });

    it('should return correct config for critical battery', () => {
      const config = getBatteryOptimizedConfig(5);

      expect(config.samplingRate).toBe(SAMPLING_RATES.AGGRESSIVE);
      expect(config.chartUpdateInterval).toBe(CHART_UPDATE_INTERVALS.AGGRESSIVE);
      expect(config.reduceAnimations).toBe(true);
      expect(config.batteryLevel).toBe(5);
      expect(config.optimizationLevel).toBe('aggressive');
    });

    describe('with low power mode', () => {
      it('should apply moderate optimizations even with good battery', () => {
        const config = getBatteryOptimizedConfig(75, true);

        expect(config.samplingRate).toBe(SAMPLING_RATES.MODERATE);
        expect(config.chartUpdateInterval).toBe(CHART_UPDATE_INTERVALS.MODERATE);
        expect(config.reduceAnimations).toBe(true);
        expect(config.isLowPowerMode).toBe(true);
        expect(config.optimizationLevel).toBe('moderate');
      });

      it('should apply aggressive optimizations for low battery', () => {
        const config = getBatteryOptimizedConfig(15, true);

        expect(config.samplingRate).toBe(SAMPLING_RATES.MODERATE);
        expect(config.chartUpdateInterval).toBe(CHART_UPDATE_INTERVALS.MODERATE);
        expect(config.reduceAnimations).toBe(true);
        expect(config.optimizationLevel).toBe('aggressive');
      });
    });

    it('should throw error for invalid battery level', () => {
      expect(() => getBatteryOptimizedConfig(-1)).toThrow('Battery level must be between 0 and 100');
      expect(() => getBatteryOptimizedConfig(101)).toThrow('Battery level must be between 0 and 100');
    });

    it('should preserve original battery level in config', () => {
      const config = getBatteryOptimizedConfig(75, true);

      // Even though low power mode adjusts effective level,
      // the original battery level should be preserved
      expect(config.batteryLevel).toBe(75);
    });
  });

  describe('getCurrentBatteryOptimizedConfig', () => {
    it('should fetch current battery state and return config', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(0.75);
      mockIsLowPowerModeEnabledAsync.mockResolvedValue(false);

      const config = await getCurrentBatteryOptimizedConfig();

      expect(config.batteryLevel).toBe(75);
      expect(config.isLowPowerMode).toBe(false);
      expect(config.optimizationLevel).toBe('none');
    });

    it('should include low power mode in config', async () => {
      mockGetBatteryLevelAsync.mockResolvedValue(0.5);
      mockIsLowPowerModeEnabledAsync.mockResolvedValue(true);

      const config = await getCurrentBatteryOptimizedConfig();

      expect(config.isLowPowerMode).toBe(true);
      expect(config.optimizationLevel).toBe('moderate');
    });
  });

  describe('isBatteryMonitoringAvailable', () => {
    it('should return true when expo-battery is available', async () => {
      // expo-battery is mocked and should be available
      const available = await isBatteryMonitoringAvailable();

      expect(available).toBe(true);
    });
  });

  describe('_resetBatteryModuleCache', () => {
    it('should reset the module cache', async () => {
      // First call loads the module
      await isBatteryMonitoringAvailable();

      // Reset cache
      _resetBatteryModuleCache();

      // Next call should reload the module
      const available = await isBatteryMonitoringAvailable();
      expect(available).toBe(true);
    });
  });

  describe('BatteryOptimizationConfig type', () => {
    it('should match expected shape', () => {
      const config: BatteryOptimizationConfig = {
        samplingRate: 256,
        chartUpdateInterval: 100,
        reduceAnimations: false,
        batteryLevel: 100,
        isLowPowerMode: false,
        optimizationLevel: 'none',
      };

      expect(config.samplingRate).toBeDefined();
      expect(config.chartUpdateInterval).toBeDefined();
      expect(config.reduceAnimations).toBeDefined();
      expect(config.batteryLevel).toBeDefined();
      expect(config.isLowPowerMode).toBeDefined();
      expect(config.optimizationLevel).toBeDefined();
    });

    it('should allow all optimization levels', () => {
      const levels: Array<'none' | 'moderate' | 'aggressive'> = ['none', 'moderate', 'aggressive'];

      levels.forEach(level => {
        const config: BatteryOptimizationConfig = {
          samplingRate: 256,
          chartUpdateInterval: 100,
          reduceAnimations: false,
          batteryLevel: 100,
          isLowPowerMode: false,
          optimizationLevel: level,
        };

        expect(config.optimizationLevel).toBe(level);
      });
    });
  });
});

describe('Battery Optimization Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    _resetBatteryModuleCache();
  });

  describe('boundary conditions', () => {
    it('should handle 0% battery correctly', () => {
      const config = getBatteryOptimizedConfig(0);

      expect(config.optimizationLevel).toBe('aggressive');
      expect(config.reduceAnimations).toBe(true);
    });

    it('should handle 100% battery correctly', () => {
      const config = getBatteryOptimizedConfig(100);

      expect(config.optimizationLevel).toBe('none');
      expect(config.reduceAnimations).toBe(false);
    });

    it('should handle threshold boundaries correctly', () => {
      // At CRITICAL threshold (10)
      expect(getOptimizationLevel(10, false)).toBe('aggressive');
      expect(getOptimizationLevel(11, false)).toBe('moderate');

      // At LOW threshold (20)
      expect(shouldReduceAnimations(20)).toBe(false);
      expect(shouldReduceAnimations(19)).toBe(true);

      // At MODERATE threshold (35)
      expect(getOptimizationLevel(35, false)).toBe('moderate');
      expect(getOptimizationLevel(36, false)).toBe('none');
    });
  });

  describe('consistency between functions', () => {
    it('should have consistent optimization levels across all functions', () => {
      const testLevels = [0, 5, 10, 15, 20, 25, 35, 50, 75, 100];

      testLevels.forEach(level => {
        const config = getBatteryOptimizedConfig(level);
        const samplingRate = getOptimalSamplingRate(level);
        const chartInterval = getOptimalChartUpdateInterval(level);
        const reduceAnimations = shouldReduceAnimations(level);
        const optimizationLevel = getOptimizationLevel(level, false);

        expect(config.samplingRate).toBe(samplingRate);
        expect(config.chartUpdateInterval).toBe(chartInterval);
        expect(config.reduceAnimations).toBe(reduceAnimations);
        expect(config.optimizationLevel).toBe(optimizationLevel);
      });
    });
  });
});
