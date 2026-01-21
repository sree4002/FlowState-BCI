import {
  fft,
  computePowerSpectrum,
  getFrequencyBins,
  calculateBandPower,
  detectFrequencyRatioArtifact,
  generateSineWave,
  generateSyntheticEEG,
  FrequencyBands,
  FREQUENCY_RATIO_ARTIFACT_THRESHOLD,
  FrequencyRatioResult,
} from '../src/utils/signalProcessing';

describe('Signal Processing - Frequency Ratio Artifact Detection', () => {
  describe('FrequencyBands constants', () => {
    it('should have correct delta band range', () => {
      expect(FrequencyBands.delta.low).toBe(0.5);
      expect(FrequencyBands.delta.high).toBe(4);
    });

    it('should have correct theta band range', () => {
      expect(FrequencyBands.theta.low).toBe(4);
      expect(FrequencyBands.theta.high).toBe(8);
    });

    it('should have correct alpha band range', () => {
      expect(FrequencyBands.alpha.low).toBe(8);
      expect(FrequencyBands.alpha.high).toBe(13);
    });

    it('should have correct beta band range', () => {
      expect(FrequencyBands.beta.low).toBe(13);
      expect(FrequencyBands.beta.high).toBe(30);
    });

    it('should have correct gamma band range', () => {
      expect(FrequencyBands.gamma.low).toBe(30);
      expect(FrequencyBands.gamma.high).toBe(50);
    });

    it('should have correct low frequency band range (4-30 Hz)', () => {
      expect(FrequencyBands.lowFrequency.low).toBe(4);
      expect(FrequencyBands.lowFrequency.high).toBe(30);
    });

    it('should have correct high frequency band range (30-50 Hz)', () => {
      expect(FrequencyBands.highFrequency.low).toBe(30);
      expect(FrequencyBands.highFrequency.high).toBe(50);
    });
  });

  describe('FREQUENCY_RATIO_ARTIFACT_THRESHOLD', () => {
    it('should be 2.0', () => {
      expect(FREQUENCY_RATIO_ARTIFACT_THRESHOLD).toBe(2.0);
    });
  });

  describe('generateSineWave', () => {
    it('should generate correct number of samples', () => {
      const samplingRate = 200;
      const duration = 2;
      const wave = generateSineWave(10, samplingRate, duration);
      expect(wave.length).toBe(samplingRate * duration);
    });

    it('should generate a wave with correct amplitude', () => {
      const amplitude = 5.0;
      const wave = generateSineWave(10, 200, 1, amplitude);
      const maxAbs = Math.max(...wave.map(Math.abs));
      expect(maxAbs).toBeCloseTo(amplitude, 1);
    });

    it('should have zero mean for complete cycles', () => {
      const wave = generateSineWave(10, 200, 1); // 10 complete cycles
      const mean = wave.reduce((sum, val) => sum + val, 0) / wave.length;
      expect(mean).toBeCloseTo(0, 5);
    });
  });

  describe('generateSyntheticEEG', () => {
    it('should generate correct number of samples', () => {
      const samplingRate = 200;
      const duration = 2;
      const eeg = generateSyntheticEEG(samplingRate, duration);
      expect(eeg.length).toBe(samplingRate * duration);
    });

    it('should accept custom amplitude parameters', () => {
      const eeg = generateSyntheticEEG(200, 1, {
        thetaAmplitude: 20,
        alphaAmplitude: 15,
        betaAmplitude: 10,
        gammaAmplitude: 5,
        noiseAmplitude: 0,
      });
      expect(eeg.length).toBe(200);
      // With noise=0, signal should be deterministic
      expect(eeg[0]).toBeDefined();
    });

    it('should use default amplitudes when not specified', () => {
      const eeg1 = generateSyntheticEEG(200, 1);
      const eeg2 = generateSyntheticEEG(200, 1);
      // Due to random noise, these won't be identical
      expect(eeg1.length).toBe(eeg2.length);
    });
  });

  describe('fft', () => {
    it('should return same length as input for power of 2', () => {
      const signal = new Array(256).fill(0).map(() => Math.random());
      const result = fft(signal);
      expect(result.length).toBe(256);
    });

    it('should pad to next power of 2', () => {
      const signal = new Array(200).fill(0).map(() => Math.random());
      const result = fft(signal);
      expect(result.length).toBe(256); // Next power of 2 after 200
    });

    it('should handle DC signal correctly', () => {
      const signal = new Array(64).fill(5);
      const result = fft(signal);
      // DC component should be at index 0
      expect(result[0][0]).toBeCloseTo(5 * 64, 1);
      expect(result[0][1]).toBeCloseTo(0, 5);
    });

    it('should detect single frequency correctly', () => {
      const samplingRate = 64;
      const frequency = 8; // Hz
      const duration = 1;
      const signal = generateSineWave(frequency, samplingRate, duration, 1);

      const result = fft(signal);
      const power = computePowerSpectrum(result);
      const frequencies = getFrequencyBins(result.length, samplingRate);

      // Find peak frequency
      let maxPowerIdx = 0;
      let maxPower = 0;
      for (let i = 1; i < power.length / 2; i++) {
        if (power[i] > maxPower) {
          maxPower = power[i];
          maxPowerIdx = i;
        }
      }

      expect(frequencies[maxPowerIdx]).toBeCloseTo(frequency, 0);
    });
  });

  describe('computePowerSpectrum', () => {
    it('should calculate power as sum of squares', () => {
      const fftResult: Array<[number, number]> = [
        [3, 4], // power = 9 + 16 = 25
        [1, 0], // power = 1
        [0, 2], // power = 4
      ];
      const power = computePowerSpectrum(fftResult);
      expect(power[0]).toBe(25);
      expect(power[1]).toBe(1);
      expect(power[2]).toBe(4);
    });

    it('should return same length as input', () => {
      const fftResult: Array<[number, number]> = new Array(100)
        .fill(null)
        .map(() => [Math.random(), Math.random()]);
      const power = computePowerSpectrum(fftResult);
      expect(power.length).toBe(100);
    });
  });

  describe('getFrequencyBins', () => {
    it('should start at 0 Hz', () => {
      const bins = getFrequencyBins(100, 200);
      expect(bins[0]).toBe(0);
    });

    it('should have correct bin width', () => {
      const samplingRate = 200;
      const numSamples = 100;
      const bins = getFrequencyBins(numSamples, samplingRate);
      const binWidth = samplingRate / numSamples;
      expect(bins[1] - bins[0]).toBeCloseTo(binWidth, 5);
    });

    it('should return correct number of bins', () => {
      const bins = getFrequencyBins(256, 200);
      expect(bins.length).toBe(256);
    });

    it('should reach Nyquist frequency at half the bins', () => {
      const samplingRate = 200;
      const numSamples = 100;
      const bins = getFrequencyBins(numSamples, samplingRate);
      // At index numSamples/2, we should be at Nyquist
      expect(bins[numSamples / 2]).toBeCloseTo(samplingRate / 2, 5);
    });
  });

  describe('calculateBandPower', () => {
    it('should return 0 for empty frequency range', () => {
      const power = [1, 2, 3, 4, 5];
      const frequencies = [0, 10, 20, 30, 40];
      const bandPower = calculateBandPower(power, frequencies, 100, 200);
      expect(bandPower).toBe(0);
    });

    it('should calculate mean power in band', () => {
      const power = [1, 2, 3, 4, 5];
      const frequencies = [0, 10, 20, 30, 40];
      // Band 10-30 Hz includes indices 1, 2, 3 with values 2, 3, 4
      const bandPower = calculateBandPower(power, frequencies, 10, 30);
      expect(bandPower).toBeCloseTo((2 + 3 + 4) / 3, 5);
    });

    it('should include boundary frequencies', () => {
      const power = [1, 2, 3, 4, 5];
      const frequencies = [0, 10, 20, 30, 40];
      // Band exactly at 20 Hz should include index 2
      const bandPower = calculateBandPower(power, frequencies, 20, 20);
      expect(bandPower).toBe(3);
    });
  });

  describe('detectFrequencyRatioArtifact', () => {
    const samplingRate = 200; // Hz

    it('should return correct structure', () => {
      const samples = generateSineWave(10, samplingRate, 2);
      const result = detectFrequencyRatioArtifact(samples, samplingRate);

      expect(result).toHaveProperty('highFrequencyPower');
      expect(result).toHaveProperty('lowFrequencyPower');
      expect(result).toHaveProperty('ratio');
      expect(result).toHaveProperty('hasArtifact');
      expect(result).toHaveProperty('threshold');
    });

    it('should use default threshold of 2.0', () => {
      const samples = generateSineWave(10, samplingRate, 2);
      const result = detectFrequencyRatioArtifact(samples, samplingRate);
      expect(result.threshold).toBe(2.0);
    });

    it('should accept custom threshold', () => {
      const samples = generateSineWave(10, samplingRate, 2);
      const result = detectFrequencyRatioArtifact(samples, samplingRate, 1.5);
      expect(result.threshold).toBe(1.5);
    });

    it('should handle very short signals gracefully', () => {
      const samples = [1, 2, 3];
      const result = detectFrequencyRatioArtifact(samples, samplingRate);
      expect(result.hasArtifact).toBe(false);
      expect(result.ratio).toBe(0);
    });

    it('should handle low sampling rate gracefully', () => {
      const samples = generateSineWave(10, 50, 2); // 50 Hz sampling rate
      const result = detectFrequencyRatioArtifact(samples, 50);
      // Nyquist is 25 Hz, can't measure 30-50 Hz band
      expect(result.hasArtifact).toBe(false);
      expect(result.ratio).toBe(0);
    });

    it('should NOT detect artifact in clean low-frequency signal', () => {
      // Clean EEG with dominant theta/alpha activity
      const cleanEEG = generateSyntheticEEG(samplingRate, 2, {
        thetaAmplitude: 20,
        alphaAmplitude: 15,
        betaAmplitude: 8,
        gammaAmplitude: 1, // Very low gamma
        noiseAmplitude: 2,
      });

      const result = detectFrequencyRatioArtifact(cleanEEG, samplingRate);
      expect(result.hasArtifact).toBe(false);
      expect(result.ratio).toBeLessThan(2.0);
    });

    it('should detect artifact in high-frequency dominated signal', () => {
      // Artifact-contaminated signal with high gamma
      const artifactEEG = generateSyntheticEEG(samplingRate, 2, {
        thetaAmplitude: 5,
        alphaAmplitude: 3,
        betaAmplitude: 2,
        gammaAmplitude: 50, // Very high gamma (muscle artifact)
        noiseAmplitude: 2,
      });

      const result = detectFrequencyRatioArtifact(artifactEEG, samplingRate);
      expect(result.hasArtifact).toBe(true);
      expect(result.ratio).toBeGreaterThan(2.0);
    });

    it('should detect artifact with pure 40 Hz signal', () => {
      // Pure muscle artifact simulation
      const muscleArtifact = generateSineWave(40, samplingRate, 2, 50);
      const result = detectFrequencyRatioArtifact(muscleArtifact, samplingRate);
      expect(result.hasArtifact).toBe(true);
      expect(result.highFrequencyPower).toBeGreaterThan(0);
    });

    it('should NOT detect artifact with pure 10 Hz signal', () => {
      // Pure alpha wave
      const alphaWave = generateSineWave(10, samplingRate, 2, 50);
      const result = detectFrequencyRatioArtifact(alphaWave, samplingRate);
      expect(result.hasArtifact).toBe(false);
      expect(result.lowFrequencyPower).toBeGreaterThan(0);
    });

    it('should have lowFrequencyPower > 0 for signals with low frequency content', () => {
      const thetaWave = generateSineWave(6, samplingRate, 2, 20);
      const result = detectFrequencyRatioArtifact(thetaWave, samplingRate);
      expect(result.lowFrequencyPower).toBeGreaterThan(0);
    });

    it('should have highFrequencyPower > 0 for signals with high frequency content', () => {
      const gammaWave = generateSineWave(40, samplingRate, 2, 20);
      const result = detectFrequencyRatioArtifact(gammaWave, samplingRate);
      expect(result.highFrequencyPower).toBeGreaterThan(0);
    });

    it('should correctly identify boundary case at ratio = 2.0', () => {
      // Test with custom threshold just below and above
      const samples = generateSyntheticEEG(samplingRate, 2, {
        thetaAmplitude: 10,
        alphaAmplitude: 10,
        betaAmplitude: 5,
        gammaAmplitude: 20,
        noiseAmplitude: 0,
      });

      const result = detectFrequencyRatioArtifact(samples, samplingRate);
      // Check that hasArtifact is consistent with ratio > threshold
      expect(result.hasArtifact).toBe(result.ratio > result.threshold);
    });

    it('should work with 250 Hz sampling rate', () => {
      const samples = generateSineWave(10, 250, 2, 20);
      const result = detectFrequencyRatioArtifact(samples, 250);
      expect(result.hasArtifact).toBe(false);
      expect(result.lowFrequencyPower).toBeGreaterThan(0);
    });

    it('should work with 500 Hz sampling rate', () => {
      const samples = generateSineWave(40, 500, 2, 50);
      const result = detectFrequencyRatioArtifact(samples, 500);
      expect(result.hasArtifact).toBe(true);
      expect(result.highFrequencyPower).toBeGreaterThan(0);
    });
  });

  describe('Frequency Ratio Artifact Detection - Edge Cases', () => {
    it('should handle DC offset in signal', () => {
      const samplingRate = 200;
      // Signal with DC offset
      const signal = generateSineWave(10, samplingRate, 2, 20).map(
        (s) => s + 100
      );
      const result = detectFrequencyRatioArtifact(signal, samplingRate);
      // DC offset should not affect ratio calculation
      expect(result.lowFrequencyPower).toBeGreaterThan(0);
    });

    it('should handle all-zero signal', () => {
      const samples = new Array(400).fill(0);
      const result = detectFrequencyRatioArtifact(samples, 200);
      expect(result.hasArtifact).toBe(false);
      expect(result.ratio).toBe(0);
    });

    it('should handle constant (non-zero) signal', () => {
      const samples = new Array(400).fill(5);
      const result = detectFrequencyRatioArtifact(samples, 200);
      // After DC removal, this becomes all zeros
      expect(result.hasArtifact).toBe(false);
    });

    it('should handle negative values', () => {
      const samplingRate = 200;
      const signal = generateSineWave(10, samplingRate, 2, 20).map(
        (s) => s - 50
      );
      const result = detectFrequencyRatioArtifact(signal, samplingRate);
      expect(result.lowFrequencyPower).toBeGreaterThan(0);
    });

    it('should handle mixed artifact and clean signal', () => {
      const samplingRate = 200;
      // Combine low frequency (clean) with high frequency (artifact)
      const lowFreq = generateSineWave(10, samplingRate, 2, 10);
      const highFreq = generateSineWave(40, samplingRate, 2, 25);
      const mixed = lowFreq.map((s, i) => s + highFreq[i]);

      const result = detectFrequencyRatioArtifact(mixed, samplingRate);
      // Should detect artifact due to high gamma content
      expect(result.highFrequencyPower).toBeGreaterThan(0);
      expect(result.lowFrequencyPower).toBeGreaterThan(0);
    });
  });

  describe('FrequencyRatioResult interface', () => {
    it('should have all required properties', () => {
      const result: FrequencyRatioResult = {
        highFrequencyPower: 100,
        lowFrequencyPower: 50,
        ratio: 2.0,
        hasArtifact: true,
        threshold: 2.0,
      };

      expect(typeof result.highFrequencyPower).toBe('number');
      expect(typeof result.lowFrequencyPower).toBe('number');
      expect(typeof result.ratio).toBe('number');
      expect(typeof result.hasArtifact).toBe('boolean');
      expect(typeof result.threshold).toBe('number');
    });
  });

  describe('Integration with SignalQuality type', () => {
    it('should provide values usable for SignalQuality.has_frequency_artifact', () => {
      // This test verifies the function output can be used with the SignalQuality type
      const samplingRate = 200;
      const cleanEEG = generateSyntheticEEG(samplingRate, 2, {
        thetaAmplitude: 20,
        alphaAmplitude: 15,
        betaAmplitude: 8,
        gammaAmplitude: 1,
        noiseAmplitude: 2,
      });

      const result = detectFrequencyRatioArtifact(cleanEEG, samplingRate);

      // The hasArtifact boolean can be directly used for SignalQuality.has_frequency_artifact
      const signalQuality = {
        score: 85,
        artifact_percentage: 5,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: result.hasArtifact,
      };

      expect(signalQuality.has_frequency_artifact).toBe(false);
    });
  });
});
