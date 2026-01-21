import {
  calculateDCOffset,
  removeDCOffset,
  removeDCOffsetInPlace,
  removeDCOffsetWithBaseline,
} from '../src/services/signalProcessing';

describe('Signal Processing - DC Offset Removal', () => {
  describe('calculateDCOffset', () => {
    it('should calculate mean of a simple array', () => {
      const samples = [1, 2, 3, 4, 5];
      const dcOffset = calculateDCOffset(samples);
      expect(dcOffset).toBe(3);
    });

    it('should calculate mean of array with decimals', () => {
      const samples = [10.5, 11.5, 12.5, 13.5];
      const dcOffset = calculateDCOffset(samples);
      expect(dcOffset).toBe(12);
    });

    it('should handle single element array', () => {
      const samples = [42.5];
      const dcOffset = calculateDCOffset(samples);
      expect(dcOffset).toBe(42.5);
    });

    it('should handle negative values', () => {
      const samples = [-5, -3, -1, 1, 3, 5];
      const dcOffset = calculateDCOffset(samples);
      expect(dcOffset).toBe(0);
    });

    it('should handle mixed positive and negative values', () => {
      const samples = [-10, 20, -30, 40];
      const dcOffset = calculateDCOffset(samples);
      expect(dcOffset).toBe(5);
    });

    it('should throw error for empty array', () => {
      expect(() => calculateDCOffset([])).toThrow(
        'Cannot calculate DC offset of empty samples array'
      );
    });

    it('should preserve precision for typical EEG values', () => {
      const samples = [10.12345, 10.23456, 10.34567, 10.45678];
      const dcOffset = calculateDCOffset(samples);
      expect(dcOffset).toBeCloseTo(10.290115, 5);
    });
  });

  describe('removeDCOffset', () => {
    it('should remove DC offset from simple array', () => {
      const samples = [101, 102, 103, 104, 105];
      const corrected = removeDCOffset(samples);

      // Mean should be approximately 0
      const correctedMean = calculateDCOffset(corrected);
      expect(correctedMean).toBeCloseTo(0, 10);

      // Values should be shifted
      expect(corrected[0]).toBe(-2);
      expect(corrected[2]).toBe(0);
      expect(corrected[4]).toBe(2);
    });

    it('should not modify original array', () => {
      const samples = [100, 101, 102];
      const originalCopy = [...samples];
      removeDCOffset(samples);

      expect(samples).toEqual(originalCopy);
    });

    it('should return new array', () => {
      const samples = [100, 101, 102];
      const corrected = removeDCOffset(samples);

      expect(corrected).not.toBe(samples);
    });

    it('should handle array with zero mean', () => {
      const samples = [-2, -1, 0, 1, 2];
      const corrected = removeDCOffset(samples);

      expect(corrected).toEqual([-2, -1, 0, 1, 2]);
    });

    it('should handle single element array', () => {
      const samples = [50];
      const corrected = removeDCOffset(samples);

      expect(corrected).toEqual([0]);
    });

    it('should throw error for empty array', () => {
      expect(() => removeDCOffset([])).toThrow(
        'Cannot remove DC offset from empty samples array'
      );
    });

    it('should handle typical EEG data with DC offset', () => {
      // Simulated EEG data with ~100µV DC offset
      const samples = [100.5, 101.2, 99.8, 100.1, 100.4, 99.9, 100.3, 99.8];
      const corrected = removeDCOffset(samples);

      // Check that mean is now ~0
      const correctedMean = calculateDCOffset(corrected);
      expect(correctedMean).toBeCloseTo(0, 10);

      // Check that signal shape is preserved (differences between consecutive samples)
      for (let i = 1; i < samples.length; i++) {
        const originalDiff = samples[i] - samples[i - 1];
        const correctedDiff = corrected[i] - corrected[i - 1];
        expect(correctedDiff).toBeCloseTo(originalDiff, 10);
      }
    });

    it('should handle large DC offset', () => {
      const samples = [1000, 1001, 1002, 999, 1000];
      const corrected = removeDCOffset(samples);

      const correctedMean = calculateDCOffset(corrected);
      expect(correctedMean).toBeCloseTo(0, 10);
    });

    it('should preserve signal variance', () => {
      const samples = [10, 20, 30, 20, 10];
      const corrected = removeDCOffset(samples);

      // Calculate variance of original
      const originalMean = calculateDCOffset(samples);
      const originalVariance =
        samples.reduce((acc, val) => acc + Math.pow(val - originalMean, 2), 0) /
        samples.length;

      // Calculate variance of corrected
      const correctedMean = calculateDCOffset(corrected);
      const correctedVariance =
        corrected.reduce(
          (acc, val) => acc + Math.pow(val - correctedMean, 2),
          0
        ) / corrected.length;

      expect(correctedVariance).toBeCloseTo(originalVariance, 10);
    });
  });

  describe('removeDCOffsetInPlace', () => {
    it('should modify array in place', () => {
      const samples = [101, 102, 103, 104, 105];
      removeDCOffsetInPlace(samples);

      expect(samples[0]).toBe(-2);
      expect(samples[2]).toBe(0);
      expect(samples[4]).toBe(2);
    });

    it('should return the DC offset that was removed', () => {
      const samples = [100, 101, 102, 103, 104];
      const dcOffset = removeDCOffsetInPlace(samples);

      expect(dcOffset).toBe(102);
    });

    it('should result in zero mean', () => {
      const samples = [50.5, 51.2, 49.8, 50.1];
      removeDCOffsetInPlace(samples);

      const mean = calculateDCOffset(samples);
      expect(mean).toBeCloseTo(0, 10);
    });

    it('should throw error for empty array', () => {
      expect(() => removeDCOffsetInPlace([])).toThrow(
        'Cannot remove DC offset from empty samples array'
      );
    });

    it('should handle single element', () => {
      const samples = [42];
      const dcOffset = removeDCOffsetInPlace(samples);

      expect(dcOffset).toBe(42);
      expect(samples[0]).toBe(0);
    });

    it('should be equivalent to removeDCOffset', () => {
      const samples1 = [10.5, 11.2, 9.8, 10.1, 10.4];
      const samples2 = [...samples1];

      const correctedNew = removeDCOffset(samples1);
      removeDCOffsetInPlace(samples2);

      for (let i = 0; i < samples1.length; i++) {
        expect(samples2[i]).toBeCloseTo(correctedNew[i], 10);
      }
    });
  });

  describe('removeDCOffsetWithBaseline', () => {
    it('should remove DC offset using baseline segment', () => {
      // First 4 samples are baseline with mean 100
      // Last 4 samples have different mean but should be corrected using baseline
      const samples = [99, 100, 101, 100, 110, 111, 112, 113];
      const corrected = removeDCOffsetWithBaseline(samples, 0, 4);

      // Baseline mean was 100, so all samples shifted by -100
      expect(corrected[0]).toBe(-1);
      expect(corrected[1]).toBe(0);
      expect(corrected[4]).toBe(10);
      expect(corrected[7]).toBe(13);
    });

    it('should not modify original array', () => {
      const samples = [100, 101, 102, 110, 111];
      const originalCopy = [...samples];
      removeDCOffsetWithBaseline(samples, 0, 3);

      expect(samples).toEqual(originalCopy);
    });

    it('should handle middle baseline segment', () => {
      const samples = [90, 91, 100, 101, 100, 110, 111];
      // Use samples at indices 2, 3, 4 as baseline (mean = 100.333...)
      const corrected = removeDCOffsetWithBaseline(samples, 2, 5);

      const baselineMean = calculateDCOffset([100, 101, 100]);
      expect(corrected[2]).toBeCloseTo(100 - baselineMean, 10);
    });

    it('should handle single sample baseline', () => {
      const samples = [100, 105, 110, 115];
      const corrected = removeDCOffsetWithBaseline(samples, 0, 1);

      // Baseline is just [100], so offset is 100
      expect(corrected[0]).toBe(0);
      expect(corrected[1]).toBe(5);
      expect(corrected[3]).toBe(15);
    });

    it('should throw error for empty samples array', () => {
      expect(() => removeDCOffsetWithBaseline([], 0, 1)).toThrow(
        'Cannot remove DC offset from empty samples array'
      );
    });

    it('should throw error for negative baseline start', () => {
      expect(() => removeDCOffsetWithBaseline([1, 2, 3], -1, 2)).toThrow(
        'Baseline start index cannot be negative'
      );
    });

    it('should throw error for baseline end exceeding length', () => {
      expect(() => removeDCOffsetWithBaseline([1, 2, 3], 0, 5)).toThrow(
        'Baseline end index cannot exceed samples length'
      );
    });

    it('should throw error for baseline start >= end', () => {
      expect(() => removeDCOffsetWithBaseline([1, 2, 3], 2, 2)).toThrow(
        'Baseline start must be less than baseline end'
      );

      expect(() => removeDCOffsetWithBaseline([1, 2, 3], 2, 1)).toThrow(
        'Baseline start must be less than baseline end'
      );
    });

    it('should handle ERP-style baseline correction', () => {
      // Simulate ERP data: 100 samples baseline, 400 samples post-stimulus
      const baselineSamples = Array.from(
        { length: 100 },
        () => 50 + Math.random() * 2
      );
      const postStimulusSamples = Array.from(
        { length: 400 },
        () => 55 + Math.random() * 5
      );
      const samples = [...baselineSamples, ...postStimulusSamples];

      const corrected = removeDCOffsetWithBaseline(samples, 0, 100);

      // Baseline period should now have mean ~0
      const correctedBaselineMean = calculateDCOffset(
        corrected.slice(0, 100)
      );
      expect(Math.abs(correctedBaselineMean)).toBeLessThan(0.01);
    });

    it('should preserve relative amplitudes within epoch', () => {
      const samples = [100, 102, 104, 106, 108];
      const corrected = removeDCOffsetWithBaseline(samples, 0, 2);

      // Baseline mean is 101
      // Differences between consecutive samples should be preserved
      for (let i = 1; i < samples.length; i++) {
        const originalDiff = samples[i] - samples[i - 1];
        const correctedDiff = corrected[i] - corrected[i - 1];
        expect(correctedDiff).toBeCloseTo(originalDiff, 10);
      }
    });
  });

  describe('Real-world EEG scenarios', () => {
    it('should handle 500Hz sampling rate epoch (1 second)', () => {
      // Generate 500 samples simulating 1 second of EEG at 500Hz
      const sampleCount = 500;
      const dcOffset = 150; // Typical DC offset in µV
      const samples = Array.from(
        { length: sampleCount },
        () => dcOffset + (Math.random() - 0.5) * 20
      );

      const corrected = removeDCOffset(samples);
      const correctedMean = calculateDCOffset(corrected);

      expect(Math.abs(correctedMean)).toBeLessThan(0.001);
      expect(corrected.length).toBe(sampleCount);
    });

    it('should handle 250Hz sampling rate epoch (1 second)', () => {
      // Generate 250 samples simulating 1 second of EEG at 250Hz
      const sampleCount = 250;
      const dcOffset = 100;
      const samples = Array.from(
        { length: sampleCount },
        () => dcOffset + (Math.random() - 0.5) * 15
      );

      const corrected = removeDCOffset(samples);
      const correctedMean = calculateDCOffset(corrected);

      expect(Math.abs(correctedMean)).toBeLessThan(0.001);
    });

    it('should not amplify noise', () => {
      // Small signal with noise should not have noise amplified
      const samples = Array.from(
        { length: 100 },
        () => 50 + (Math.random() - 0.5) * 0.1
      );

      const originalVariance =
        samples.reduce(
          (acc, val) =>
            acc + Math.pow(val - calculateDCOffset(samples), 2),
          0
        ) / samples.length;

      const corrected = removeDCOffset(samples);
      const correctedVariance =
        corrected.reduce(
          (acc, val) =>
            acc + Math.pow(val - calculateDCOffset(corrected), 2),
          0
        ) / corrected.length;

      // Variance should be identical
      expect(correctedVariance).toBeCloseTo(originalVariance, 10);
    });

    it('should handle varying DC offset levels', () => {
      const offsets = [0, 50, 100, 200, -50, -100];

      for (const offset of offsets) {
        const samples = Array.from(
          { length: 50 },
          () => offset + (Math.random() - 0.5) * 10
        );
        const corrected = removeDCOffset(samples);
        const correctedMean = calculateDCOffset(corrected);

        expect(Math.abs(correctedMean)).toBeLessThan(0.001);
      }
    });
  });
});
