// Unit tests for z-score normalization functions
import {
  calculateZScore,
  normalizeThetaZScore,
  normalizeAllBands,
  normalizeThetaArray,
  calculateWindowZScore,
  checkZScoreThreshold,
  categorizeZScoreZone,
} from '../src/utils/signalProcessing';
import { BaselineProfile } from '../src/types';

describe('Z-Score Normalization', () => {
  // Sample baseline profile for testing
  const mockBaseline: BaselineProfile = {
    theta_mean: 10.0,
    theta_std: 2.0,
    alpha_mean: 15.0,
    beta_mean: 8.0,
    peak_theta_freq: 6.0,
    optimal_freq: 6.0,
    calibration_timestamp: Date.now(),
    quality_score: 85.0,
  };

  describe('calculateZScore', () => {
    it('should return 0 when value equals mean', () => {
      const result = calculateZScore(10, 10, 2);
      expect(result).toBe(0);
    });

    it('should return 1 when value is one std above mean', () => {
      const result = calculateZScore(12, 10, 2);
      expect(result).toBe(1);
    });

    it('should return -1 when value is one std below mean', () => {
      const result = calculateZScore(8, 10, 2);
      expect(result).toBe(-1);
    });

    it('should return 2 when value is two stds above mean', () => {
      const result = calculateZScore(14, 10, 2);
      expect(result).toBe(2);
    });

    it('should handle fractional z-scores', () => {
      const result = calculateZScore(11, 10, 2);
      expect(result).toBe(0.5);
    });

    it('should handle negative values', () => {
      const result = calculateZScore(-5, 0, 5);
      expect(result).toBe(-1);
    });

    it('should throw error when std is zero', () => {
      expect(() => calculateZScore(10, 10, 0)).toThrow(
        'Standard deviation must be positive'
      );
    });

    it('should throw error when std is negative', () => {
      expect(() => calculateZScore(10, 10, -1)).toThrow(
        'Standard deviation must be positive'
      );
    });
  });

  describe('normalizeThetaZScore', () => {
    it('should normalize theta power using baseline', () => {
      // theta_mean = 10, theta_std = 2
      // value = 14 -> z = (14 - 10) / 2 = 2
      const result = normalizeThetaZScore(14, mockBaseline);
      expect(result).toBe(2);
    });

    it('should return 0 at baseline mean', () => {
      const result = normalizeThetaZScore(10, mockBaseline);
      expect(result).toBe(0);
    });

    it('should return negative z-score below baseline', () => {
      const result = normalizeThetaZScore(6, mockBaseline);
      expect(result).toBe(-2);
    });

    it('should work with partial baseline profile', () => {
      const partialBaseline = { theta_mean: 5, theta_std: 1 };
      const result = normalizeThetaZScore(7, partialBaseline);
      expect(result).toBe(2);
    });
  });

  describe('normalizeAllBands', () => {
    it('should normalize all three bands', () => {
      const bandPowers = {
        theta: 12, // z = (12 - 10) / 2 = 1
        alpha: 17, // z = (17 - 15) / 2 = 1
        beta: 10, // z = (10 - 8) / 2 = 1
      };
      const result = normalizeAllBands(bandPowers, mockBaseline);

      expect(result.theta).toBe(1);
      expect(result.alpha).toBe(1);
      expect(result.beta).toBe(1);
    });

    it('should handle different z-scores for each band', () => {
      const bandPowers = {
        theta: 14, // z = (14 - 10) / 2 = 2
        alpha: 15, // z = (15 - 15) / 2 = 0
        beta: 6, // z = (6 - 8) / 2 = -1
      };
      const result = normalizeAllBands(bandPowers, mockBaseline);

      expect(result.theta).toBe(2);
      expect(result.alpha).toBe(0);
      expect(result.beta).toBe(-1);
    });

    it('should return object with theta, alpha, beta properties', () => {
      const bandPowers = { theta: 10, alpha: 15, beta: 8 };
      const result = normalizeAllBands(bandPowers, mockBaseline);

      expect(result).toHaveProperty('theta');
      expect(result).toHaveProperty('alpha');
      expect(result).toHaveProperty('beta');
    });
  });

  describe('normalizeThetaArray', () => {
    it('should normalize an array of theta values', () => {
      const thetaValues = [10, 12, 14, 8, 6];
      const result = normalizeThetaArray(thetaValues, mockBaseline);

      expect(result).toEqual([0, 1, 2, -1, -2]);
    });

    it('should return empty array for empty input', () => {
      const result = normalizeThetaArray([], mockBaseline);
      expect(result).toEqual([]);
    });

    it('should handle single value array', () => {
      const result = normalizeThetaArray([12], mockBaseline);
      expect(result).toEqual([1]);
    });

    it('should throw error when std is zero', () => {
      const badBaseline = { theta_mean: 10, theta_std: 0 };
      expect(() => normalizeThetaArray([10, 12], badBaseline)).toThrow(
        'Standard deviation must be positive'
      );
    });

    it('should preserve order of values', () => {
      const thetaValues = [14, 10, 8];
      const result = normalizeThetaArray(thetaValues, mockBaseline);
      expect(result[0]).toBeGreaterThan(result[1]);
      expect(result[1]).toBeGreaterThan(result[2]);
    });
  });

  describe('calculateWindowZScore', () => {
    it('should calculate z-score of window average', () => {
      // Window average = (10 + 12 + 14) / 3 = 12
      // z = (12 - 10) / 2 = 1
      const window = [10, 12, 14];
      const result = calculateWindowZScore(window, mockBaseline);
      expect(result).toBe(1);
    });

    it('should return 0 when window average equals mean', () => {
      const window = [8, 10, 12]; // avg = 10 = theta_mean
      const result = calculateWindowZScore(window, mockBaseline);
      expect(result).toBe(0);
    });

    it('should handle single value window', () => {
      const result = calculateWindowZScore([14], mockBaseline);
      expect(result).toBe(2);
    });

    it('should throw error for empty window', () => {
      expect(() => calculateWindowZScore([], mockBaseline)).toThrow(
        'Cannot calculate z-score for empty window'
      );
    });

    it('should handle negative average', () => {
      const baseline = { theta_mean: 0, theta_std: 1 };
      const window = [-2, -4, -6]; // avg = -4
      const result = calculateWindowZScore(window, baseline);
      expect(result).toBe(-4);
    });
  });

  describe('checkZScoreThreshold', () => {
    it('should detect when threshold is exceeded', () => {
      // target = 1.0, hysteresis = 0.2
      // upperTrigger = 1.2, lowerResume = 0.8
      const result = checkZScoreThreshold(1.5, 1.0, 0.2);
      expect(result.exceedsThreshold).toBe(true);
      expect(result.withinHysteresis).toBe(false);
    });

    it('should detect when within hysteresis band', () => {
      const result = checkZScoreThreshold(1.0, 1.0, 0.2);
      expect(result.exceedsThreshold).toBe(false);
      expect(result.withinHysteresis).toBe(true);
    });

    it('should detect when below threshold and hysteresis', () => {
      const result = checkZScoreThreshold(0.5, 1.0, 0.2);
      expect(result.exceedsThreshold).toBe(false);
      expect(result.withinHysteresis).toBe(false);
    });

    it('should use default hysteresis of 0.2', () => {
      const result = checkZScoreThreshold(1.25, 1.0);
      expect(result.exceedsThreshold).toBe(true);
    });

    it('should handle edge case at upper trigger', () => {
      const result = checkZScoreThreshold(1.2, 1.0, 0.2);
      expect(result.exceedsThreshold).toBe(true);
    });

    it('should handle edge case at lower resume', () => {
      const result = checkZScoreThreshold(0.8, 1.0, 0.2);
      expect(result.exceedsThreshold).toBe(false);
      expect(result.withinHysteresis).toBe(true);
    });

    it('should handle zero hysteresis', () => {
      const result = checkZScoreThreshold(1.0, 1.0, 0);
      expect(result.exceedsThreshold).toBe(true);
      expect(result.withinHysteresis).toBe(false);
    });

    it('should handle negative z-scores', () => {
      const result = checkZScoreThreshold(-1.0, 0.5, 0.2);
      expect(result.exceedsThreshold).toBe(false);
      expect(result.withinHysteresis).toBe(false);
    });
  });

  describe('categorizeZScoreZone', () => {
    it('should categorize low theta (< -0.5)', () => {
      expect(categorizeZScoreZone(-1.0)).toBe('low');
      expect(categorizeZScoreZone(-2.0)).toBe('low');
      expect(categorizeZScoreZone(-0.6)).toBe('low');
    });

    it('should categorize baseline theta (-0.5 to 0.5)', () => {
      expect(categorizeZScoreZone(-0.5)).toBe('baseline');
      expect(categorizeZScoreZone(0)).toBe('baseline');
      expect(categorizeZScoreZone(0.4)).toBe('baseline');
    });

    it('should categorize elevated theta (0.5 to 1.5)', () => {
      expect(categorizeZScoreZone(0.5)).toBe('elevated');
      expect(categorizeZScoreZone(1.0)).toBe('elevated');
      expect(categorizeZScoreZone(1.4)).toBe('elevated');
    });

    it('should categorize high theta (>= 1.5)', () => {
      expect(categorizeZScoreZone(1.5)).toBe('high');
      expect(categorizeZScoreZone(2.0)).toBe('high');
      expect(categorizeZScoreZone(3.0)).toBe('high');
    });

    it('should handle exact boundary values', () => {
      expect(categorizeZScoreZone(-0.5)).toBe('baseline');
      expect(categorizeZScoreZone(0.5)).toBe('elevated');
      expect(categorizeZScoreZone(1.5)).toBe('high');
    });
  });

  describe('Integration tests', () => {
    it('should normalize real-time theta and categorize zone', () => {
      // Simulate real-time processing pipeline
      const rawTheta = 15; // 2.5 std above mean
      const zscore = normalizeThetaZScore(rawTheta, mockBaseline);
      const zone = categorizeZScoreZone(zscore);

      expect(zscore).toBe(2.5);
      expect(zone).toBe('high');
    });

    it('should process sliding window and check threshold', () => {
      // Simulate sliding window processing
      const windowData = [12, 13, 14, 15, 16]; // avg = 14, z = 2
      const windowZScore = calculateWindowZScore(windowData, mockBaseline);
      const thresholdCheck = checkZScoreThreshold(windowZScore, 1.5, 0.2);

      expect(windowZScore).toBe(2);
      expect(thresholdCheck.exceedsThreshold).toBe(true);
    });

    it('should handle typical calibration values', () => {
      // Real-world typical theta power values in µV²/Hz
      const realisticBaseline = {
        theta_mean: 25.5,
        theta_std: 5.2,
        alpha_mean: 18.3,
        beta_mean: 8.1,
        peak_theta_freq: 5.8,
        optimal_freq: 5.8,
        calibration_timestamp: Date.now(),
        quality_score: 92.0,
      };

      const currentTheta = 30.7; // slightly elevated
      const zscore = normalizeThetaZScore(currentTheta, realisticBaseline);

      expect(zscore).toBeCloseTo(1.0, 1); // approximately 1 std above mean
      expect(categorizeZScoreZone(zscore)).toBe('elevated');
    });
  });
});
