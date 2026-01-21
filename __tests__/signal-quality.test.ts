/**
 * Signal Quality Score Calculator Tests
 *
 * Tests the signal quality calculation functions for EEG artifact detection
 * and quality scoring based on artifact percentage.
 */

import {
  calculateSignalQualityScore,
  calculateSignalQuality,
  calculateArtifactPercentage,
  detectAmplitudeArtifact,
  detectGradientArtifact,
  getQualityCategory,
  isQualitySufficientForCalibration,
  shouldPromptRecalibration,
  ARTIFACT_THRESHOLDS,
  QUALITY_THRESHOLDS,
} from '../src/utils/signalQuality';

describe('Signal Quality Score Calculator', () => {
  describe('calculateSignalQualityScore', () => {
    it('should return 100 for 0% artifacts (perfect signal)', () => {
      expect(calculateSignalQualityScore(0)).toBe(100);
    });

    it('should return 0 for 100% artifacts (unusable signal)', () => {
      expect(calculateSignalQualityScore(100)).toBe(0);
    });

    it('should return 50 for 50% artifacts', () => {
      expect(calculateSignalQualityScore(50)).toBe(50);
    });

    it('should handle decimal artifact percentages', () => {
      expect(calculateSignalQualityScore(33.33)).toBe(66.67);
      expect(calculateSignalQualityScore(12.5)).toBe(87.5);
    });

    it('should round to 2 decimal places', () => {
      expect(calculateSignalQualityScore(33.333)).toBe(66.67);
      expect(calculateSignalQualityScore(66.666)).toBe(33.33);
    });

    it('should throw error for negative artifact percentage', () => {
      expect(() => calculateSignalQualityScore(-1)).toThrow(
        'Invalid artifact percentage: -1. Must be between 0 and 100.'
      );
    });

    it('should throw error for artifact percentage over 100', () => {
      expect(() => calculateSignalQualityScore(101)).toThrow(
        'Invalid artifact percentage: 101. Must be between 0 and 100.'
      );
    });

    it('should throw error for NaN', () => {
      expect(() => calculateSignalQualityScore(NaN)).toThrow(
        'Invalid artifact percentage: NaN. Must be a finite number.'
      );
    });

    it('should throw error for Infinity', () => {
      expect(() => calculateSignalQualityScore(Infinity)).toThrow(
        'Invalid artifact percentage: Infinity. Must be between 0 and 100.'
      );
    });
  });

  describe('detectAmplitudeArtifact', () => {
    it('should return false for empty samples', () => {
      expect(detectAmplitudeArtifact([])).toBe(false);
    });

    it('should return false for samples within threshold', () => {
      const samples = [50, -50, 80, -80, 99, -99];
      expect(detectAmplitudeArtifact(samples)).toBe(false);
    });

    it('should return false for samples exactly at threshold', () => {
      const samples = [100, -100];
      expect(detectAmplitudeArtifact(samples)).toBe(false);
    });

    it('should return true for samples exceeding positive threshold', () => {
      const samples = [50, 101, 30];
      expect(detectAmplitudeArtifact(samples)).toBe(true);
    });

    it('should return true for samples exceeding negative threshold', () => {
      const samples = [50, -101, 30];
      expect(detectAmplitudeArtifact(samples)).toBe(true);
    });

    it('should detect large amplitude artifacts', () => {
      const samples = [10, 20, 500, 30]; // 500 µV spike
      expect(detectAmplitudeArtifact(samples)).toBe(true);
    });

    it('should use the correct amplitude threshold from constants', () => {
      expect(ARTIFACT_THRESHOLDS.AMPLITUDE_UV).toBe(100);
    });
  });

  describe('detectGradientArtifact', () => {
    it('should return false for empty samples', () => {
      expect(detectGradientArtifact([])).toBe(false);
    });

    it('should return false for single sample', () => {
      expect(detectGradientArtifact([50])).toBe(false);
    });

    it('should return false for gradual changes', () => {
      const samples = [0, 10, 20, 30, 40, 50];
      expect(detectGradientArtifact(samples)).toBe(false);
    });

    it('should return false for changes exactly at threshold', () => {
      const samples = [0, 50]; // gradient of exactly 50
      expect(detectGradientArtifact(samples)).toBe(false);
    });

    it('should return true for sudden positive jump', () => {
      const samples = [0, 51]; // gradient of 51 > 50
      expect(detectGradientArtifact(samples)).toBe(true);
    });

    it('should return true for sudden negative jump', () => {
      const samples = [51, 0]; // gradient of 51 > 50
      expect(detectGradientArtifact(samples)).toBe(true);
    });

    it('should detect artifact in middle of samples', () => {
      const samples = [10, 20, 30, 100, 35, 40]; // jump from 30 to 100
      expect(detectGradientArtifact(samples)).toBe(true);
    });

    it('should use the correct gradient threshold from constants', () => {
      expect(ARTIFACT_THRESHOLDS.GRADIENT_UV_PER_SAMPLE).toBe(50);
    });
  });

  describe('calculateArtifactPercentage', () => {
    it('should return 0 for empty samples', () => {
      expect(calculateArtifactPercentage([])).toBe(0);
    });

    it('should return 0 for clean samples', () => {
      const samples = [10, 15, 20, 25, 30];
      expect(calculateArtifactPercentage(samples)).toBe(0);
    });

    it('should count amplitude artifacts', () => {
      // 2 out of 5 samples exceed amplitude threshold (150, -150)
      // Additionally, gradient artifacts are counted:
      // - index 1 (150): amplitude artifact, skip gradient check
      // - index 2 (20): gradient from 150 to 20 = 130 > 50, counted
      // - index 3 (-150): amplitude artifact, skip gradient check
      // - index 4 (30): gradient from -150 to 30 = 180 > 50, counted
      // Total: 4/5 = 80%
      const samples = [10, 150, 20, -150, 30];
      const percentage = calculateArtifactPercentage(samples);
      expect(percentage).toBe(80); // 4/5 = 80%
    });

    it('should count gradient artifacts', () => {
      // Gradient from 10 to 80 is 70, exceeds 50 threshold
      // Sample at index 1 is counted as gradient artifact
      const samples = [10, 80, 85, 90]; // only index 1 has gradient artifact
      const percentage = calculateArtifactPercentage(samples);
      expect(percentage).toBe(25); // 1/4 = 25%
    });

    it('should not double-count amplitude artifacts with gradient', () => {
      // Sample 150 exceeds amplitude (counted), so gradient not checked
      const samples = [10, 150, 20];
      const percentage = calculateArtifactPercentage(samples);
      // 150 is amplitude artifact (1 sample)
      // gradient from 150 to 20 is 130, exceeds threshold (but 150 already counted via amplitude)
      // gradient from 10 to 150 is 140, so sample at 150 would be gradient too
      // But implementation counts sample 1 (150) as amplitude artifact and stops
      // Sample 2 (20) has gradient from 150 (130 > 50), so it's counted
      expect(percentage).toBeCloseTo(66.67, 1); // 2/3 samples have artifacts
    });

    it('should return 100 for all artifacts', () => {
      // All samples exceed amplitude threshold
      const samples = [150, -150, 200, -200];
      const percentage = calculateArtifactPercentage(samples);
      expect(percentage).toBe(100);
    });
  });

  describe('calculateSignalQuality', () => {
    it('should return perfect quality for clean signal', () => {
      const samples = [10, 15, 20, 25, 30, 25, 20, 15, 10];
      const quality = calculateSignalQuality(samples);

      expect(quality.score).toBe(100);
      expect(quality.artifact_percentage).toBe(0);
      expect(quality.has_amplitude_artifact).toBe(false);
      expect(quality.has_gradient_artifact).toBe(false);
      expect(quality.has_frequency_artifact).toBe(false);
    });

    it('should detect amplitude artifacts in quality object', () => {
      const samples = [10, 150, 20]; // 150 exceeds amplitude threshold
      const quality = calculateSignalQuality(samples);

      expect(quality.has_amplitude_artifact).toBe(true);
      expect(quality.score).toBeLessThan(100);
    });

    it('should detect gradient artifacts in quality object', () => {
      const samples = [10, 80, 85]; // 70 gradient exceeds threshold
      const quality = calculateSignalQuality(samples);

      expect(quality.has_gradient_artifact).toBe(true);
    });

    it('should always set has_frequency_artifact to false (not implemented)', () => {
      const samples = [10, 150, 200, -150];
      const quality = calculateSignalQuality(samples);

      expect(quality.has_frequency_artifact).toBe(false);
    });

    it('should return empty signal quality for empty samples', () => {
      const quality = calculateSignalQuality([]);

      expect(quality.score).toBe(100);
      expect(quality.artifact_percentage).toBe(0);
      expect(quality.has_amplitude_artifact).toBe(false);
      expect(quality.has_gradient_artifact).toBe(false);
    });
  });

  describe('getQualityCategory', () => {
    it('should return "excellent" for scores >= 90', () => {
      expect(getQualityCategory(90)).toBe('excellent');
      expect(getQualityCategory(95)).toBe('excellent');
      expect(getQualityCategory(100)).toBe('excellent');
    });

    it('should return "good" for scores >= 70 and < 90', () => {
      expect(getQualityCategory(70)).toBe('good');
      expect(getQualityCategory(80)).toBe('good');
      expect(getQualityCategory(89)).toBe('good');
    });

    it('should return "fair" for scores >= 50 and < 70', () => {
      expect(getQualityCategory(50)).toBe('fair');
      expect(getQualityCategory(60)).toBe('fair');
      expect(getQualityCategory(69)).toBe('fair');
    });

    it('should return "poor" for scores >= 20 and < 50', () => {
      expect(getQualityCategory(20)).toBe('poor');
      expect(getQualityCategory(35)).toBe('poor');
      expect(getQualityCategory(49)).toBe('poor');
    });

    it('should return "unusable" for scores < 20', () => {
      expect(getQualityCategory(0)).toBe('unusable');
      expect(getQualityCategory(10)).toBe('unusable');
      expect(getQualityCategory(19)).toBe('unusable');
    });
  });

  describe('isQualitySufficientForCalibration', () => {
    it('should return true for quality >= 20', () => {
      expect(isQualitySufficientForCalibration(20)).toBe(true);
      expect(isQualitySufficientForCalibration(50)).toBe(true);
      expect(isQualitySufficientForCalibration(100)).toBe(true);
    });

    it('should return false for quality < 20', () => {
      expect(isQualitySufficientForCalibration(19)).toBe(false);
      expect(isQualitySufficientForCalibration(10)).toBe(false);
      expect(isQualitySufficientForCalibration(0)).toBe(false);
    });

    it('should use AUTO_PAUSE threshold from constants', () => {
      expect(QUALITY_THRESHOLDS.AUTO_PAUSE).toBe(20);
    });
  });

  describe('shouldPromptRecalibration', () => {
    it('should return true for quality < 50', () => {
      expect(shouldPromptRecalibration(49)).toBe(true);
      expect(shouldPromptRecalibration(30)).toBe(true);
      expect(shouldPromptRecalibration(0)).toBe(true);
    });

    it('should return false for quality >= 50', () => {
      expect(shouldPromptRecalibration(50)).toBe(false);
      expect(shouldPromptRecalibration(75)).toBe(false);
      expect(shouldPromptRecalibration(100)).toBe(false);
    });

    it('should use RECALIBRATION_PROMPT threshold from constants', () => {
      expect(QUALITY_THRESHOLDS.RECALIBRATION_PROMPT).toBe(50);
    });
  });

  describe('ARTIFACT_THRESHOLDS', () => {
    it('should have correct amplitude threshold', () => {
      expect(ARTIFACT_THRESHOLDS.AMPLITUDE_UV).toBe(100);
    });

    it('should have correct gradient threshold', () => {
      expect(ARTIFACT_THRESHOLDS.GRADIENT_UV_PER_SAMPLE).toBe(50);
    });

    it('should have correct frequency ratio threshold', () => {
      expect(ARTIFACT_THRESHOLDS.FREQUENCY_RATIO).toBe(2.0);
    });
  });

  describe('QUALITY_THRESHOLDS', () => {
    it('should have correct auto-pause threshold', () => {
      expect(QUALITY_THRESHOLDS.AUTO_PAUSE).toBe(20);
    });

    it('should have correct recalibration prompt threshold', () => {
      expect(QUALITY_THRESHOLDS.RECALIBRATION_PROMPT).toBe(50);
    });

    it('should have correct minimum acceptable threshold', () => {
      expect(QUALITY_THRESHOLDS.MINIMUM_ACCEPTABLE).toBe(70);
    });

    it('should have correct excellent threshold', () => {
      expect(QUALITY_THRESHOLDS.EXCELLENT).toBe(90);
    });
  });

  describe('Integration: Real-world scenarios', () => {
    it('should handle realistic clean EEG signal', () => {
      // Simulated clean alpha wave oscillation (8-13 Hz)
      const samples: number[] = [];
      for (let i = 0; i < 256; i++) {
        // ~1 second at 256 Hz
        samples.push(30 * Math.sin((2 * Math.PI * 10 * i) / 256)); // 10 Hz, 30 µV amplitude
      }

      const quality = calculateSignalQuality(samples);
      expect(quality.score).toBe(100);
      expect(quality.has_amplitude_artifact).toBe(false);
      expect(quality.has_gradient_artifact).toBe(false);
    });

    it('should detect eye blink artifact', () => {
      // Simulated eye blink (large amplitude spike)
      const samples: number[] = [];
      for (let i = 0; i < 256; i++) {
        if (i >= 100 && i <= 120) {
          // Eye blink artifact
          samples.push(200 * Math.sin(((i - 100) * Math.PI) / 20));
        } else {
          samples.push(30 * Math.sin((2 * Math.PI * 10 * i) / 256));
        }
      }

      const quality = calculateSignalQuality(samples);
      expect(quality.has_amplitude_artifact).toBe(true);
      expect(quality.score).toBeLessThan(100);
    });

    it('should detect muscle movement artifact', () => {
      // Simulated muscle artifact (high frequency noise)
      const samples: number[] = [];
      for (let i = 0; i < 256; i++) {
        if (i >= 50 && i <= 60) {
          // Sudden movement creates large gradient
          samples.push(i % 2 === 0 ? 60 : -60);
        } else {
          samples.push(30 * Math.sin((2 * Math.PI * 10 * i) / 256));
        }
      }

      const quality = calculateSignalQuality(samples);
      expect(quality.has_gradient_artifact).toBe(true);
      expect(quality.score).toBeLessThan(100);
    });

    it('should handle electrode disconnection (flat line)', () => {
      // Electrode disconnection typically shows as flat line or drift
      const samples = new Array(256).fill(0);

      const quality = calculateSignalQuality(samples);
      // Flat line has no artifacts by our definition, but would be
      // detected by other means (variance check, etc.)
      expect(quality.score).toBe(100);
      expect(quality.has_amplitude_artifact).toBe(false);
      expect(quality.has_gradient_artifact).toBe(false);
    });
  });
});
