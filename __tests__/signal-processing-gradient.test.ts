/**
 * Tests for gradient threshold artifact detection
 * Tests the detectGradientArtifacts function and related utilities
 */

import {
  detectGradientArtifacts,
  detectGradientArtifactsWithThreshold,
  calculateGradients,
  isGradientArtifact,
  GRADIENT_THRESHOLD_UV,
  type GradientArtifactResult,
} from '../src/services/signalProcessing';

describe('Signal Processing - Gradient Artifact Detection', () => {
  describe('GRADIENT_THRESHOLD_UV constant', () => {
    it('should be 50 µV per sample', () => {
      expect(GRADIENT_THRESHOLD_UV).toBe(50);
    });
  });

  describe('detectGradientArtifacts', () => {
    describe('edge cases', () => {
      it('should handle empty array', () => {
        const result = detectGradientArtifacts([]);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.artifactPercentage).toBe(0);
        expect(result.violationCount).toBe(0);
        expect(result.violationIndices).toEqual([]);
        expect(result.maxGradient).toBe(0);
      });

      it('should handle null/undefined input', () => {
        const result = detectGradientArtifacts(
          null as unknown as number[]
        );

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.artifactPercentage).toBe(0);
        expect(result.violationCount).toBe(0);
        expect(result.violationIndices).toEqual([]);
        expect(result.maxGradient).toBe(0);
      });

      it('should handle single sample (no gradient possible)', () => {
        const result = detectGradientArtifacts([42]);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.artifactPercentage).toBe(0);
        expect(result.violationCount).toBe(0);
        expect(result.violationIndices).toEqual([]);
        expect(result.maxGradient).toBe(0);
      });

      it('should handle two samples with no violation', () => {
        const result = detectGradientArtifacts([10, 20]);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.artifactPercentage).toBe(0);
        expect(result.violationCount).toBe(0);
        expect(result.maxGradient).toBe(10);
      });

      it('should handle two samples with violation', () => {
        const result = detectGradientArtifacts([10, 100]);

        expect(result.hasGradientArtifact).toBe(true);
        expect(result.artifactPercentage).toBe(100);
        expect(result.violationCount).toBe(1);
        expect(result.violationIndices).toEqual([1]);
        expect(result.maxGradient).toBe(90);
      });
    });

    describe('clean data (no artifacts)', () => {
      it('should detect no artifacts in stable signal', () => {
        const samples = [10, 12, 14, 13, 15, 11, 9, 10, 12, 14];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.artifactPercentage).toBe(0);
        expect(result.violationCount).toBe(0);
        expect(result.violationIndices).toEqual([]);
        expect(result.maxGradient).toBeLessThanOrEqual(50);
      });

      it('should detect no artifacts in constant signal', () => {
        const samples = [20, 20, 20, 20, 20];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.maxGradient).toBe(0);
      });

      it('should detect no artifacts at exactly 50 µV gradient', () => {
        // Exactly at threshold should NOT trigger (uses > not >=)
        const samples = [0, 50, 100, 150];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.maxGradient).toBe(50);
      });

      it('should handle negative values without artifacts', () => {
        const samples = [-20, -15, -10, -5, 0, 5, 10];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(false);
        expect(result.maxGradient).toBe(5);
      });
    });

    describe('artifact detection', () => {
      it('should detect single gradient artifact', () => {
        // Gradient of 60 µV at index 2
        const samples = [10, 20, 80, 85, 90];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(true);
        expect(result.violationCount).toBe(1);
        expect(result.violationIndices).toEqual([2]);
        expect(result.maxGradient).toBe(60);
      });

      it('should detect multiple gradient artifacts', () => {
        // Gradients > 50 at indices 2 and 4
        const samples = [10, 20, 100, 105, 200, 205];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(true);
        expect(result.violationCount).toBe(2);
        expect(result.violationIndices).toEqual([2, 4]);
      });

      it('should detect artifact with negative gradient', () => {
        // Large negative jump
        const samples = [100, 90, 10, 15];
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(true);
        expect(result.violationCount).toBe(1);
        expect(result.violationIndices).toEqual([2]);
        expect(result.maxGradient).toBe(80);
      });

      it('should detect artifacts crossing zero', () => {
        const samples = [30, -30]; // Gradient of 60 µV
        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(true);
        expect(result.maxGradient).toBe(60);
      });
    });

    describe('artifact percentage calculation', () => {
      it('should calculate 100% when all transitions are artifacts', () => {
        // All 4 transitions exceed 50 µV
        const samples = [0, 100, 200, 300, 400];
        const result = detectGradientArtifacts(samples);

        expect(result.artifactPercentage).toBe(100);
        expect(result.violationCount).toBe(4);
      });

      it('should calculate 50% when half transitions are artifacts', () => {
        // 2 out of 4 transitions exceed threshold
        const samples = [0, 100, 110, 200, 210];
        const result = detectGradientArtifacts(samples);

        expect(result.artifactPercentage).toBe(50);
        expect(result.violationCount).toBe(2);
      });

      it('should calculate 25% when quarter of transitions are artifacts', () => {
        // 1 out of 4 transitions exceeds threshold
        const samples = [0, 10, 20, 100, 110];
        const result = detectGradientArtifacts(samples);

        expect(result.artifactPercentage).toBe(25);
        expect(result.violationCount).toBe(1);
      });

      it('should calculate accurate percentage for longer data', () => {
        // 10 samples = 9 transitions, 3 artifacts = 33.33...%
        const samples = [0, 100, 110, 200, 210, 300, 310, 320, 330, 340];
        const result = detectGradientArtifacts(samples);

        expect(result.violationCount).toBe(3);
        expect(result.artifactPercentage).toBeCloseTo(33.333, 2);
      });
    });

    describe('real-world EEG scenarios', () => {
      it('should handle typical theta wave oscillations (4-8 Hz at ~20 µV)', () => {
        // Simulated theta wave at ~6 Hz, 500 Hz sampling = ~83 samples/cycle
        // Typical theta amplitude ~20 µV peak-to-peak
        const samples: number[] = [];
        const samplesPerCycle = 83;
        const amplitude = 10; // 20 µV peak-to-peak

        for (let i = 0; i < samplesPerCycle * 2; i++) {
          samples.push(amplitude * Math.sin((2 * Math.PI * i) / samplesPerCycle));
        }

        const result = detectGradientArtifacts(samples);

        // Normal theta waves should not trigger gradient artifacts
        expect(result.hasGradientArtifact).toBe(false);
      });

      it('should detect muscle artifact in theta data', () => {
        // Normal theta then sudden muscle spike
        const samples: number[] = [];
        for (let i = 0; i < 50; i++) {
          samples.push(10 * Math.sin((2 * Math.PI * i) / 83));
        }
        // Muscle artifact: sudden jump
        samples.push(100);
        samples.push(150);
        samples.push(80);

        for (let i = 0; i < 50; i++) {
          samples.push(10 * Math.sin((2 * Math.PI * i) / 83));
        }

        const result = detectGradientArtifacts(samples);

        expect(result.hasGradientArtifact).toBe(true);
        expect(result.violationCount).toBeGreaterThan(0);
      });

      it('should handle 500 Hz headband sampling rate data', () => {
        // 2 seconds of data at 500 Hz = 1000 samples
        const samples: number[] = [];
        for (let i = 0; i < 1000; i++) {
          // Normal EEG with slight noise
          samples.push(15 * Math.sin((2 * Math.PI * 6 * i) / 500) + Math.random() * 5);
        }

        const result = detectGradientArtifacts(samples);

        // Normal EEG should have very few or no gradient artifacts
        expect(result.artifactPercentage).toBeLessThan(1);
      });

      it('should handle 250 Hz earpiece sampling rate data', () => {
        // 2 seconds of data at 250 Hz = 500 samples
        const samples: number[] = [];
        for (let i = 0; i < 500; i++) {
          // Normal EEG with slight noise
          samples.push(15 * Math.sin((2 * Math.PI * 6 * i) / 250) + Math.random() * 5);
        }

        const result = detectGradientArtifacts(samples);

        // Normal EEG should have very few or no gradient artifacts
        expect(result.artifactPercentage).toBeLessThan(1);
      });
    });

    describe('result structure', () => {
      it('should return all expected properties', () => {
        const result = detectGradientArtifacts([10, 20, 30]);

        expect(result).toHaveProperty('hasGradientArtifact');
        expect(result).toHaveProperty('artifactPercentage');
        expect(result).toHaveProperty('violationCount');
        expect(result).toHaveProperty('violationIndices');
        expect(result).toHaveProperty('maxGradient');
      });

      it('should have correct types for all properties', () => {
        const result: GradientArtifactResult = detectGradientArtifacts([10, 100, 110]);

        expect(typeof result.hasGradientArtifact).toBe('boolean');
        expect(typeof result.artifactPercentage).toBe('number');
        expect(typeof result.violationCount).toBe('number');
        expect(Array.isArray(result.violationIndices)).toBe(true);
        expect(typeof result.maxGradient).toBe('number');
      });
    });
  });

  describe('detectGradientArtifactsWithThreshold', () => {
    it('should detect artifacts with custom threshold', () => {
      const samples = [10, 40, 70]; // Gradients of 30 µV each

      // With default 50 µV threshold, no artifacts
      const defaultResult = detectGradientArtifacts(samples);
      expect(defaultResult.hasGradientArtifact).toBe(false);

      // With 25 µV threshold, should detect artifacts
      const customResult = detectGradientArtifactsWithThreshold(samples, 25);
      expect(customResult.hasGradientArtifact).toBe(true);
      expect(customResult.violationCount).toBe(2);
    });

    it('should use default threshold for invalid threshold values', () => {
      const samples = [0, 60, 120]; // 60 µV gradients

      // Zero threshold should fall back to default
      const zeroResult = detectGradientArtifactsWithThreshold(samples, 0);
      expect(zeroResult.hasGradientArtifact).toBe(true);

      // Negative threshold should fall back to default
      const negResult = detectGradientArtifactsWithThreshold(samples, -10);
      expect(negResult.hasGradientArtifact).toBe(true);
    });

    it('should allow stricter threshold (lower value)', () => {
      const samples = [10, 35, 60]; // 25 µV gradients

      // With 20 µV threshold
      const result = detectGradientArtifactsWithThreshold(samples, 20);
      expect(result.hasGradientArtifact).toBe(true);
      expect(result.violationCount).toBe(2);
    });

    it('should allow more lenient threshold (higher value)', () => {
      const samples = [10, 70, 130]; // 60 µV gradients

      // With 100 µV threshold, no artifacts
      const result = detectGradientArtifactsWithThreshold(samples, 100);
      expect(result.hasGradientArtifact).toBe(false);
    });
  });

  describe('calculateGradients', () => {
    it('should return empty array for empty input', () => {
      expect(calculateGradients([])).toEqual([]);
    });

    it('should return empty array for single sample', () => {
      expect(calculateGradients([42])).toEqual([]);
    });

    it('should calculate gradients correctly', () => {
      const samples = [10, 20, 15, 30];
      const gradients = calculateGradients(samples);

      expect(gradients).toEqual([10, 5, 15]);
    });

    it('should return absolute values', () => {
      const samples = [100, 50, 80];
      const gradients = calculateGradients(samples);

      expect(gradients).toEqual([50, 30]);
    });

    it('should handle negative values', () => {
      const samples = [-10, 10, -5];
      const gradients = calculateGradients(samples);

      expect(gradients).toEqual([20, 15]);
    });

    it('should return n-1 gradients for n samples', () => {
      const samples = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const gradients = calculateGradients(samples);

      expect(gradients.length).toBe(9);
    });
  });

  describe('isGradientArtifact', () => {
    it('should return false for gradient below default threshold', () => {
      expect(isGradientArtifact(30)).toBe(false);
      expect(isGradientArtifact(49.9)).toBe(false);
    });

    it('should return false for gradient exactly at default threshold', () => {
      expect(isGradientArtifact(50)).toBe(false);
    });

    it('should return true for gradient above default threshold', () => {
      expect(isGradientArtifact(50.1)).toBe(true);
      expect(isGradientArtifact(100)).toBe(true);
    });

    it('should use absolute value of gradient', () => {
      expect(isGradientArtifact(-60)).toBe(true);
      expect(isGradientArtifact(-30)).toBe(false);
    });

    it('should work with custom threshold', () => {
      expect(isGradientArtifact(30, 25)).toBe(true);
      expect(isGradientArtifact(30, 50)).toBe(false);
      expect(isGradientArtifact(30, 30)).toBe(false);
    });
  });

  describe('integration with SignalQuality type', () => {
    it('should produce result compatible with SignalQuality.has_gradient_artifact', () => {
      const samples = [10, 100, 110];
      const result = detectGradientArtifacts(samples);

      // The result should directly map to SignalQuality.has_gradient_artifact
      const signalQuality = {
        score: 75,
        artifact_percentage: result.artifactPercentage,
        has_amplitude_artifact: false,
        has_gradient_artifact: result.hasGradientArtifact,
        has_frequency_artifact: false,
      };

      expect(signalQuality.has_gradient_artifact).toBe(true);
      expect(typeof signalQuality.artifact_percentage).toBe('number');
    });
  });

  describe('performance considerations', () => {
    it('should handle large datasets efficiently', () => {
      // Generate 10 seconds of data at 500 Hz = 5000 samples
      const samples: number[] = [];
      for (let i = 0; i < 5000; i++) {
        samples.push(Math.random() * 100);
      }

      const startTime = Date.now();
      const result = detectGradientArtifacts(samples);
      const endTime = Date.now();

      // Should complete in well under 100ms
      expect(endTime - startTime).toBeLessThan(100);
      expect(typeof result.hasGradientArtifact).toBe('boolean');
    });
  });
});
