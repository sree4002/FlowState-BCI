/**
 * Tests for Band Power Extraction module
 */
import {
  FrequencyBands,
  extractBandPower,
  extractNamedBandPower,
  extractThetaPower,
  extractAlphaPower,
  extractBetaPower,
  extractAllBandPowers,
  extractRelativeBandPowers,
  findPeakFrequency,
  findPeakThetaFrequency,
  calculateFrequencyResolution,
  computePowerSpectrum,
  computeBandPowerFromSamples,
  applyHanningWindow,
  calculateMeanBandPower,
  calculateStdBandPower,
  BandPowerResult,
} from '../src/utils/bandPower';

describe('FrequencyBands constant', () => {
  it('should define theta band as 4-8 Hz', () => {
    expect(FrequencyBands.theta.low).toBe(4);
    expect(FrequencyBands.theta.high).toBe(8);
  });

  it('should define alpha band as 8-13 Hz', () => {
    expect(FrequencyBands.alpha.low).toBe(8);
    expect(FrequencyBands.alpha.high).toBe(13);
  });

  it('should define beta band as 13-30 Hz', () => {
    expect(FrequencyBands.beta.low).toBe(13);
    expect(FrequencyBands.beta.high).toBe(30);
  });
});

describe('calculateFrequencyResolution', () => {
  it('should calculate correct frequency resolution', () => {
    const frequencies = [0, 0.5, 1.0, 1.5, 2.0];
    expect(calculateFrequencyResolution(frequencies)).toBe(0.5);
  });

  it('should throw error for less than 2 frequency points', () => {
    expect(() => calculateFrequencyResolution([1])).toThrow(
      'At least 2 frequency points required'
    );
  });
});

describe('extractBandPower', () => {
  // Create a simple power spectrum with known values
  const frequencies = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  const powerValues = [
    1,
    1,
    1,
    1,
    2,
    2,
    2,
    2,
    3,
    3,
    3,
    3,
    3,
    4,
    4,
    4, // Higher power in higher bands
  ];

  it('should extract power from specified frequency range', () => {
    // Extract power from 4-8 Hz (indices 4-8)
    const power = extractBandPower(frequencies, powerValues, 4, 8);
    // Trapezoidal integration: (2+2)/2*1 + (2+2)/2*1 + (2+2)/2*1 + (2+3)/2*1 = 2+2+2+2.5 = 8.5
    expect(power).toBeCloseTo(8.5, 5);
  });

  it('should return 0 for empty band', () => {
    const power = extractBandPower(frequencies, powerValues, 100, 200);
    expect(power).toBe(0);
  });

  it('should throw error for mismatched arrays', () => {
    expect(() => extractBandPower([1, 2, 3], [1, 2], 1, 2)).toThrow(
      'must have the same length'
    );
  });

  it('should throw error for empty array', () => {
    expect(() => extractBandPower([], [], 1, 2)).toThrow('Empty frequency');
  });

  it('should throw error for invalid frequency range', () => {
    expect(() => extractBandPower(frequencies, powerValues, 10, 5)).toThrow(
      'Low frequency must be less than high frequency'
    );
  });

  it('should handle single point in band', () => {
    // Only one frequency point in the 5-5.5 range (frequency 5)
    const narrowPower = extractBandPower(frequencies, powerValues, 5, 5.5);
    // Should estimate using frequency resolution (1 Hz) * power value (2)
    expect(narrowPower).toBeCloseTo(2, 5);
  });
});

describe('extractNamedBandPower', () => {
  const frequencies = Array.from({ length: 51 }, (_, i) => i * 0.6); // 0 to 30 Hz
  const powerValues = frequencies.map((f) => {
    if (f >= 4 && f < 8) return 10; // Theta
    if (f >= 8 && f < 13) return 5; // Alpha
    if (f >= 13 && f <= 30) return 2; // Beta
    return 1;
  });

  it('should extract theta power correctly', () => {
    const thetaPower = extractNamedBandPower(frequencies, powerValues, 'theta');
    expect(thetaPower).toBeGreaterThan(0);
  });

  it('should extract alpha power correctly', () => {
    const alphaPower = extractNamedBandPower(frequencies, powerValues, 'alpha');
    expect(alphaPower).toBeGreaterThan(0);
  });

  it('should extract beta power correctly', () => {
    const betaPower = extractNamedBandPower(frequencies, powerValues, 'beta');
    expect(betaPower).toBeGreaterThan(0);
  });
});

describe('extractThetaPower', () => {
  it('should extract power in 4-8 Hz range', () => {
    const frequencies = [2, 4, 6, 8, 10, 12];
    const powerValues = [1, 5, 5, 5, 1, 1];

    const thetaPower = extractThetaPower(frequencies, powerValues);
    // Should integrate from 4-8 Hz
    expect(thetaPower).toBeGreaterThan(0);
  });

  it('should return 0 when no data in theta range', () => {
    const frequencies = [0, 1, 2, 3]; // Below theta
    const powerValues = [1, 1, 1, 1];

    const thetaPower = extractThetaPower(frequencies, powerValues);
    expect(thetaPower).toBe(0);
  });
});

describe('extractAlphaPower', () => {
  it('should extract power in 8-13 Hz range', () => {
    const frequencies = [6, 8, 10, 12, 14, 16];
    const powerValues = [1, 5, 5, 5, 1, 1];

    const alphaPower = extractAlphaPower(frequencies, powerValues);
    expect(alphaPower).toBeGreaterThan(0);
  });
});

describe('extractBetaPower', () => {
  it('should extract power in 13-30 Hz range', () => {
    const frequencies = [10, 13, 20, 25, 30, 35];
    const powerValues = [1, 5, 5, 5, 5, 1];

    const betaPower = extractBetaPower(frequencies, powerValues);
    expect(betaPower).toBeGreaterThan(0);
  });
});

describe('extractAllBandPowers', () => {
  it('should extract all three bands and calculate total', () => {
    // Create spectrum with distinct power in each band
    const frequencies = Array.from({ length: 61 }, (_, i) => i * 0.5); // 0 to 30 Hz
    const powerValues = frequencies.map((f) => {
      if (f >= 4 && f < 8) return 100; // High theta
      if (f >= 8 && f < 13) return 50; // Medium alpha
      if (f >= 13 && f <= 30) return 25; // Lower beta
      return 1;
    });

    const result = extractAllBandPowers(frequencies, powerValues);

    expect(result.theta).toBeGreaterThan(0);
    expect(result.alpha).toBeGreaterThan(0);
    expect(result.beta).toBeGreaterThan(0);
    expect(result.total).toBeCloseTo(
      result.theta + result.alpha + result.beta,
      10
    );
  });

  it('should return zeros for empty spectrum', () => {
    const result = extractAllBandPowers([0, 1, 2], [0, 0, 0]);
    expect(result.total).toBe(0);
  });
});

describe('extractRelativeBandPowers', () => {
  it('should calculate relative powers that sum to approximately 1', () => {
    const frequencies = Array.from({ length: 61 }, (_, i) => i * 0.5);
    const powerValues = frequencies.map((f) => {
      if (f >= 4 && f < 8) return 40;
      if (f >= 8 && f < 13) return 30;
      if (f >= 13 && f <= 30) return 30;
      return 0;
    });

    const result = extractRelativeBandPowers(frequencies, powerValues);

    const sumRelative = result.theta + result.alpha + result.beta;
    expect(sumRelative).toBeCloseTo(1, 5);
  });

  it('should calculate correct ratios', () => {
    const frequencies = Array.from({ length: 61 }, (_, i) => i * 0.5);
    const powerValues = frequencies.map((f) => {
      if (f >= 4 && f < 8) return 100; // Theta
      if (f >= 8 && f < 13) return 50; // Alpha
      if (f >= 13 && f <= 30) return 25; // Beta
      return 0;
    });

    const result = extractRelativeBandPowers(frequencies, powerValues);

    // Theta/Alpha ratio should be approximately 2 (4 Hz * 100 / 5 Hz * 50 = 400/250 = 1.6)
    expect(result.thetaAlphaRatio).toBeGreaterThan(1);
    // All ratios should be positive
    expect(result.thetaBetaRatio).toBeGreaterThan(0);
    expect(result.alphaBetaRatio).toBeGreaterThan(0);
  });

  it('should handle zero total power', () => {
    const frequencies = [0, 1, 2, 3];
    const powerValues = [0, 0, 0, 0];

    const result = extractRelativeBandPowers(frequencies, powerValues);

    expect(result.theta).toBe(0);
    expect(result.alpha).toBe(0);
    expect(result.beta).toBe(0);
    expect(result.thetaAlphaRatio).toBe(0);
  });
});

describe('findPeakFrequency', () => {
  it('should find the frequency with maximum power in range', () => {
    const frequencies = [4, 5, 6, 7, 8];
    const powerValues = [1, 2, 5, 3, 1]; // Peak at 6 Hz

    const peak = findPeakFrequency(frequencies, powerValues, 4, 8);
    expect(peak).toBe(6);
  });

  it('should return null when no data in range', () => {
    const frequencies = [1, 2, 3];
    const powerValues = [1, 1, 1];

    const peak = findPeakFrequency(frequencies, powerValues, 10, 20);
    expect(peak).toBeNull();
  });

  it('should throw error for mismatched arrays', () => {
    expect(() => findPeakFrequency([1, 2], [1], 0, 10)).toThrow(
      'must have the same length'
    );
  });
});

describe('findPeakThetaFrequency', () => {
  it('should find peak in theta band (4-8 Hz)', () => {
    const frequencies = [3, 4, 5, 6, 7, 8, 9];
    const powerValues = [1, 2, 3, 10, 4, 2, 1]; // Peak at 6 Hz in theta

    const peak = findPeakThetaFrequency(frequencies, powerValues);
    expect(peak).toBe(6);
  });
});

describe('applyHanningWindow', () => {
  it('should apply Hanning window correctly', () => {
    const samples = [1, 1, 1, 1, 1];
    const windowed = applyHanningWindow(samples);

    // First and last samples should be near zero
    expect(windowed[0]).toBeCloseTo(0, 5);
    expect(windowed[4]).toBeCloseTo(0, 5);

    // Middle sample should be close to original (center of Hanning is 1)
    expect(windowed[2]).toBeCloseTo(1, 5);
  });

  it('should preserve array length', () => {
    const samples = [1, 2, 3, 4, 5, 6, 7, 8];
    const windowed = applyHanningWindow(samples);
    expect(windowed.length).toBe(samples.length);
  });
});

describe('computePowerSpectrum', () => {
  it('should return empty arrays for empty input', () => {
    const result = computePowerSpectrum([], 256);
    expect(result.frequencies).toEqual([]);
    expect(result.powerSpectrum).toEqual([]);
  });

  it('should compute correct frequency resolution', () => {
    const samplingRate = 256;
    const numSamples = 256;
    const samples = Array(numSamples).fill(0);

    const result = computePowerSpectrum(samples, samplingRate);

    // Frequency resolution = samplingRate / numSamples = 1 Hz
    const resolution = result.frequencies[1] - result.frequencies[0];
    expect(resolution).toBeCloseTo(1, 5);
  });

  it('should produce non-negative power values', () => {
    // Create a simple sine wave at 10 Hz
    const samplingRate = 256;
    const numSamples = 256;
    const frequency = 10;
    const samples = Array.from({ length: numSamples }, (_, i) =>
      Math.sin((2 * Math.PI * frequency * i) / samplingRate)
    );

    const result = computePowerSpectrum(samples, samplingRate);

    // All power values should be non-negative
    result.powerSpectrum.forEach((power) => {
      expect(power).toBeGreaterThanOrEqual(0);
    });
  });

  it('should detect peak at correct frequency for sine wave', () => {
    // Create a sine wave at 10 Hz
    const samplingRate = 256;
    const numSamples = 256;
    const targetFreq = 10;
    const samples = Array.from({ length: numSamples }, (_, i) =>
      Math.sin((2 * Math.PI * targetFreq * i) / samplingRate)
    );

    const result = computePowerSpectrum(samples, samplingRate);

    // Find the index with maximum power (excluding DC)
    let maxPower = -1;
    let maxIndex = -1;
    for (let i = 1; i < result.powerSpectrum.length; i++) {
      if (result.powerSpectrum[i] > maxPower) {
        maxPower = result.powerSpectrum[i];
        maxIndex = i;
      }
    }

    // Peak should be near 10 Hz
    expect(result.frequencies[maxIndex]).toBeCloseTo(targetFreq, 0);
  });
});

describe('computeBandPowerFromSamples', () => {
  it('should return zeros for empty samples', () => {
    const result = computeBandPowerFromSamples([], 256);
    expect(result.theta).toBe(0);
    expect(result.alpha).toBe(0);
    expect(result.beta).toBe(0);
    expect(result.total).toBe(0);
  });

  it('should compute band powers from raw EEG data', () => {
    // Create a mixed signal with components in different bands
    const samplingRate = 256;
    const numSamples = 512;

    // Mix of 6 Hz (theta), 10 Hz (alpha), and 20 Hz (beta)
    const samples = Array.from({ length: numSamples }, (_, i) => {
      const t = i / samplingRate;
      return (
        10 * Math.sin(2 * Math.PI * 6 * t) + // Theta (strongest)
        5 * Math.sin(2 * Math.PI * 10 * t) + // Alpha
        3 * Math.sin(2 * Math.PI * 20 * t) // Beta
      );
    });

    const result = computeBandPowerFromSamples(samples, samplingRate);

    // Theta should have most power (amplitude 10)
    expect(result.theta).toBeGreaterThan(0);
    expect(result.alpha).toBeGreaterThan(0);
    expect(result.beta).toBeGreaterThan(0);

    // Since theta has highest amplitude, it should have most power
    expect(result.theta).toBeGreaterThan(result.alpha);
    expect(result.theta).toBeGreaterThan(result.beta);
  });
});

describe('calculateMeanBandPower', () => {
  it('should calculate correct mean for multiple epochs', () => {
    const epochs: BandPowerResult[] = [
      { theta: 10, alpha: 5, beta: 2, total: 17 },
      { theta: 20, alpha: 10, beta: 4, total: 34 },
      { theta: 15, alpha: 7.5, beta: 3, total: 25.5 },
    ];

    const mean = calculateMeanBandPower(epochs);

    expect(mean.theta).toBeCloseTo(15, 5);
    expect(mean.alpha).toBeCloseTo(7.5, 5);
    expect(mean.beta).toBeCloseTo(3, 5);
  });

  it('should return zeros for empty array', () => {
    const mean = calculateMeanBandPower([]);

    expect(mean.theta).toBe(0);
    expect(mean.alpha).toBe(0);
    expect(mean.beta).toBe(0);
    expect(mean.total).toBe(0);
  });
});

describe('calculateStdBandPower', () => {
  it('should calculate correct standard deviation', () => {
    const epochs: BandPowerResult[] = [
      { theta: 10, alpha: 5, beta: 2, total: 17 },
      { theta: 20, alpha: 10, beta: 4, total: 34 },
      { theta: 15, alpha: 7.5, beta: 3, total: 25.5 },
    ];

    const std = calculateStdBandPower(epochs);

    // Manual calculation for theta: mean=15, variance=(25+25+0)/2=25, std=5
    expect(std.theta).toBeCloseTo(5, 5);
    expect(std.alpha).toBeCloseTo(2.5, 5);
    expect(std.beta).toBeCloseTo(1, 5);
  });

  it('should return zeros for less than 2 epochs', () => {
    const std = calculateStdBandPower([
      { theta: 10, alpha: 5, beta: 2, total: 17 },
    ]);

    expect(std.theta).toBe(0);
    expect(std.alpha).toBe(0);
    expect(std.beta).toBe(0);
  });

  it('should return zeros for empty array', () => {
    const std = calculateStdBandPower([]);

    expect(std.theta).toBe(0);
    expect(std.alpha).toBe(0);
    expect(std.beta).toBe(0);
  });
});

describe('Integration tests', () => {
  it('should correctly process a realistic EEG-like signal', () => {
    // Simulate 2 seconds of EEG at 250 Hz (typical earpiece sampling rate)
    const samplingRate = 250;
    const duration = 2; // seconds
    const numSamples = samplingRate * duration;

    // Create signal with realistic EEG characteristics:
    // - Strong theta (6 Hz) during relaxation
    // - Moderate alpha (10 Hz)
    // - Lower beta (20 Hz)
    // - Some noise
    const samples = Array.from({ length: numSamples }, (_, i) => {
      const t = i / samplingRate;
      const theta = 20 * Math.sin(2 * Math.PI * 6 * t);
      const alpha = 10 * Math.sin(2 * Math.PI * 10 * t);
      const beta = 5 * Math.sin(2 * Math.PI * 20 * t);
      const noise = (Math.random() - 0.5) * 2;
      return theta + alpha + beta + noise;
    });

    const result = computeBandPowerFromSamples(samples, samplingRate);

    // Verify reasonable results
    expect(result.theta).toBeGreaterThan(0);
    expect(result.alpha).toBeGreaterThan(0);
    expect(result.beta).toBeGreaterThan(0);
    expect(result.total).toBeGreaterThan(0);

    // Relative powers should reflect our signal composition
    const relPowers = extractRelativeBandPowers(
      computePowerSpectrum(samples, samplingRate).frequencies,
      computePowerSpectrum(samples, samplingRate).powerSpectrum
    );

    // Theta should be dominant
    expect(relPowers.theta).toBeGreaterThan(relPowers.alpha);
    expect(relPowers.theta).toBeGreaterThan(relPowers.beta);
  });

  it('should handle both headband (500 Hz) and earpiece (250 Hz) sampling rates', () => {
    const testSamplingRate = (samplingRate: number) => {
      const duration = 1;
      const numSamples = samplingRate * duration;
      const samples = Array.from({ length: numSamples }, (_, i) =>
        Math.sin((2 * Math.PI * 6 * i) / samplingRate)
      );

      const result = computeBandPowerFromSamples(samples, samplingRate);
      expect(result.theta).toBeGreaterThan(0);
    };

    // Headband at 500 Hz
    testSamplingRate(500);

    // Earpiece at 250 Hz
    testSamplingRate(250);
  });
});
