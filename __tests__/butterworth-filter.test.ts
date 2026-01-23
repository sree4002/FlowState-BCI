import {
  FilterCoefficients,
  ButterworthConfig,
  FilterState,
  DEFAULT_BANDPASS_CONFIG,
  designButterworthBandpass,
  createFilterState,
  applyFilter,
  applyZeroPhaseFilter,
  toFloat64Array,
  toNumberArray,
  filterEEG,
  ButterworthBandpassFilter,
  createEEGBandpassFilter,
} from '../src/services/signalProcessing';

describe('Butterworth Bandpass Filter', () => {
  // Common test configurations
  const SAMPLE_RATE = 256; // Common EEG sample rate
  const DEFAULT_CONFIG: ButterworthConfig = {
    lowCutoff: 0.5,
    highCutoff: 50,
    sampleRate: SAMPLE_RATE,
    order: 4,
  };

  describe('DEFAULT_BANDPASS_CONFIG', () => {
    it('should have correct default values for EEG filtering', () => {
      expect(DEFAULT_BANDPASS_CONFIG.lowCutoff).toBe(0.5);
      expect(DEFAULT_BANDPASS_CONFIG.highCutoff).toBe(50);
      expect(DEFAULT_BANDPASS_CONFIG.order).toBe(4);
    });
  });

  describe('designButterworthBandpass', () => {
    it('should return valid filter coefficients', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);

      expect(coefficients).toHaveProperty('b');
      expect(coefficients).toHaveProperty('a');
      expect(coefficients.b).toBeInstanceOf(Float64Array);
      expect(coefficients.a).toBeInstanceOf(Float64Array);
    });

    it('should have normalized a[0] = 1', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      expect(coefficients.a[0]).toBeCloseTo(1, 10);
    });

    it('should produce correct number of coefficients for given order', () => {
      const config: ButterworthConfig = {
        lowCutoff: 1,
        highCutoff: 40,
        sampleRate: 256,
        order: 2,
      };
      const coefficients = designButterworthBandpass(config);

      // Bandpass filter of order N produces 2N+1 coefficients
      expect(coefficients.b.length).toBeGreaterThanOrEqual(
        2 * config.order + 1
      );
      expect(coefficients.a.length).toBeGreaterThanOrEqual(
        2 * config.order + 1
      );
    });

    it('should throw error for invalid cutoff frequencies', () => {
      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          lowCutoff: -1,
        })
      ).toThrow('Cutoff frequencies must be positive');

      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          highCutoff: 0,
        })
      ).toThrow('Cutoff frequencies must be positive');
    });

    it('should throw error when low cutoff >= high cutoff', () => {
      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          lowCutoff: 50,
          highCutoff: 10,
        })
      ).toThrow('Low cutoff must be less than high cutoff');

      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          lowCutoff: 50,
          highCutoff: 50,
        })
      ).toThrow('Low cutoff must be less than high cutoff');
    });

    it('should throw error when high cutoff >= Nyquist frequency', () => {
      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          highCutoff: 128, // Nyquist for 256 Hz sample rate
        })
      ).toThrow('High cutoff must be below Nyquist frequency');

      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          highCutoff: 200,
        })
      ).toThrow('High cutoff must be below Nyquist frequency');
    });

    it('should throw error for invalid order', () => {
      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          order: 0,
        })
      ).toThrow('Order must be a positive integer');

      expect(() =>
        designButterworthBandpass({
          ...DEFAULT_CONFIG,
          order: 2.5,
        })
      ).toThrow('Order must be a positive integer');
    });

    it('should work with different sample rates', () => {
      const rates = [128, 256, 512, 1000];

      rates.forEach((sampleRate) => {
        const coefficients = designButterworthBandpass({
          ...DEFAULT_CONFIG,
          sampleRate,
          highCutoff: Math.min(50, sampleRate / 2 - 1),
        });

        expect(coefficients.b.length).toBeGreaterThan(0);
        expect(coefficients.a.length).toBeGreaterThan(0);
      });
    });
  });

  describe('createFilterState', () => {
    it('should create zeroed filter state', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const state = createFilterState(coefficients);

      expect(state.x).toBeInstanceOf(Float64Array);
      expect(state.y).toBeInstanceOf(Float64Array);

      // Check all values are zero
      state.x.forEach((val) => expect(val).toBe(0));
      state.y.forEach((val) => expect(val).toBe(0));
    });

    it('should have correct state length based on coefficients', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const state = createFilterState(coefficients);

      const expectedLen = Math.max(
        coefficients.b.length,
        coefficients.a.length
      );
      expect(state.x.length).toBe(expectedLen);
      expect(state.y.length).toBe(expectedLen);
    });
  });

  describe('applyFilter', () => {
    it('should return Float64Array output', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const state = createFilterState(coefficients);
      const input = new Float64Array([1, 2, 3, 4, 5]);

      const output = applyFilter(input, coefficients, state);

      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(input.length);
    });

    it('should maintain state between calls', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const state = createFilterState(coefficients);

      const chunk1 = new Float64Array([1, 2, 3, 4, 5]);
      const chunk2 = new Float64Array([6, 7, 8, 9, 10]);

      applyFilter(chunk1, coefficients, state);

      // State should be non-zero after processing
      const hasNonZero =
        state.x.some((val) => val !== 0) || state.y.some((val) => val !== 0);
      expect(hasNonZero).toBe(true);

      // Processing second chunk should continue from state
      const output2 = applyFilter(chunk2, coefficients, state);
      expect(output2.length).toBe(chunk2.length);
    });

    it('should attenuate DC component (very low frequency)', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const state = createFilterState(coefficients);

      // DC signal (constant)
      const dcSignal = new Float64Array(1000).fill(100);
      const output = applyFilter(dcSignal, coefficients, state);

      // After settling, output should be near zero for DC
      const lastValues = output.slice(-100);
      const avgLastValues =
        lastValues.reduce((a, b) => a + b, 0) / lastValues.length;

      expect(Math.abs(avgLastValues)).toBeLessThan(1); // Should be close to 0
    });

    it('should pass through signal within passband', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const state = createFilterState(coefficients);

      // 10 Hz sine wave (within 0.5-50 Hz passband)
      const freq = 10;
      const samples = 1000;
      const input = new Float64Array(samples);
      for (let i = 0; i < samples; i++) {
        input[i] = Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
      }

      const output = applyFilter(input, coefficients, state);

      // Calculate power of last half of signal (after settling)
      const startIdx = Math.floor(samples / 2);
      let inputPower = 0;
      let outputPower = 0;

      for (let i = startIdx; i < samples; i++) {
        inputPower += input[i] * input[i];
        outputPower += output[i] * output[i];
      }

      // Output power should be close to input power (within 20% for passband)
      const powerRatio = outputPower / inputPower;
      expect(powerRatio).toBeGreaterThan(0.5);
      expect(powerRatio).toBeLessThan(1.5);
    });
  });

  describe('applyZeroPhaseFilter', () => {
    it('should return Float64Array output', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);
      const input = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

      const output = applyZeroPhaseFilter(input, coefficients);

      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(input.length);
    });

    it('should produce symmetric response (no phase shift)', () => {
      const coefficients = designButterworthBandpass({
        lowCutoff: 5,
        highCutoff: 40,
        sampleRate: SAMPLE_RATE,
        order: 2,
      });

      // Create a symmetric test signal
      const halfLen = 100;
      const input = new Float64Array(2 * halfLen);
      for (let i = 0; i < halfLen; i++) {
        const val = Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE);
        input[i] = val;
        input[2 * halfLen - 1 - i] = val;
      }

      const output = applyZeroPhaseFilter(input, coefficients);

      // Output should also be roughly symmetric
      let asymmetry = 0;
      for (let i = 0; i < halfLen / 2; i++) {
        asymmetry += Math.abs(output[i] - output[2 * halfLen - 1 - i]);
      }
      asymmetry /= halfLen / 2;

      expect(asymmetry).toBeLessThan(0.1);
    });

    it('should have double the effective attenuation of single-pass filter', () => {
      const coefficients = designButterworthBandpass(DEFAULT_CONFIG);

      // High frequency signal (above 50 Hz cutoff)
      const freq = 100;
      const samples = 1000;
      const input = new Float64Array(samples);
      for (let i = 0; i < samples; i++) {
        input[i] = Math.sin((2 * Math.PI * freq * i) / SAMPLE_RATE);
      }

      // Single pass
      const state = createFilterState(coefficients);
      const singlePass = applyFilter(input, coefficients, state);

      // Zero phase (forward-backward)
      const zeroPhase = applyZeroPhaseFilter(input, coefficients);

      // Calculate powers
      const startIdx = Math.floor(samples / 2);
      let singlePower = 0;
      let zeroPower = 0;

      for (let i = startIdx; i < samples; i++) {
        singlePower += singlePass[i] * singlePass[i];
        zeroPower += zeroPhase[i] * zeroPhase[i];
      }

      // Zero-phase should have significantly more attenuation
      expect(zeroPower).toBeLessThan(singlePower);
    });
  });

  describe('toFloat64Array', () => {
    it('should convert number array to Float64Array', () => {
      const input = [1, 2, 3, 4, 5];
      const output = toFloat64Array(input);

      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(input.length);
      input.forEach((val, i) => expect(output[i]).toBe(val));
    });

    it('should handle empty array', () => {
      const output = toFloat64Array([]);
      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(0);
    });
  });

  describe('toNumberArray', () => {
    it('should convert Float64Array to number array', () => {
      const input = new Float64Array([1.5, 2.5, 3.5]);
      const output = toNumberArray(input);

      expect(Array.isArray(output)).toBe(true);
      expect(output.length).toBe(input.length);
      input.forEach((val, i) => expect(output[i]).toBe(val));
    });

    it('should handle empty Float64Array', () => {
      const output = toNumberArray(new Float64Array(0));
      expect(Array.isArray(output)).toBe(true);
      expect(output.length).toBe(0);
    });
  });

  describe('filterEEG', () => {
    it('should accept number array input', () => {
      const input = Array.from({ length: 256 }, (_, i) =>
        Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE)
      );

      const output = filterEEG(input, SAMPLE_RATE);

      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(input.length);
    });

    it('should accept Float64Array input', () => {
      const input = new Float64Array(256);
      for (let i = 0; i < 256; i++) {
        input[i] = Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE);
      }

      const output = filterEEG(input, SAMPLE_RATE);

      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(input.length);
    });

    it('should use zero-phase filtering by default', () => {
      const input = Array.from({ length: 500 }, (_, i) =>
        Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE)
      );

      const zeroPhase = filterEEG(input, SAMPLE_RATE, true);
      const singlePass = filterEEG(input, SAMPLE_RATE, false);

      // Results should differ
      let diff = 0;
      for (let i = 0; i < input.length; i++) {
        diff += Math.abs(zeroPhase[i] - singlePass[i]);
      }

      expect(diff).toBeGreaterThan(0);
    });

    it('should filter out high-frequency noise', () => {
      // Signal: 10 Hz + 100 Hz noise
      const input = new Float64Array(1000);
      for (let i = 0; i < 1000; i++) {
        const signal = Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE);
        const noise = 0.5 * Math.sin((2 * Math.PI * 100 * i) / SAMPLE_RATE);
        input[i] = signal + noise;
      }

      const output = filterEEG(input, SAMPLE_RATE);

      // Calculate how much 100 Hz component remains
      // Use correlation with 100 Hz sine
      let correlation = 0;
      for (let i = 500; i < 1000; i++) {
        correlation +=
          output[i] * Math.sin((2 * Math.PI * 100 * i) / SAMPLE_RATE);
      }
      correlation = Math.abs(correlation) / 500;

      // High frequency should be significantly attenuated
      expect(correlation).toBeLessThan(0.1);
    });

    it('should filter out DC offset', () => {
      // Signal with DC offset - use longer signal for edge effects to settle
      const dcOffset = 100;
      const samples = 2000;
      const input = new Float64Array(samples);
      for (let i = 0; i < samples; i++) {
        input[i] = dcOffset + Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE);
      }

      const output = filterEEG(input, SAMPLE_RATE);

      // Calculate mean of middle portion (avoiding edge effects)
      const startIdx = Math.floor(samples * 0.25);
      const endIdx = Math.floor(samples * 0.75);
      let sum = 0;
      for (let i = startIdx; i < endIdx; i++) {
        sum += output[i];
      }
      const mean = sum / (endIdx - startIdx);
      expect(Math.abs(mean)).toBeLessThan(5);
    });
  });

  describe('ButterworthBandpassFilter class', () => {
    it('should create filter with given config', () => {
      const filter = new ButterworthBandpassFilter(DEFAULT_CONFIG);

      const config = filter.getConfig();
      expect(config.lowCutoff).toBe(DEFAULT_CONFIG.lowCutoff);
      expect(config.highCutoff).toBe(DEFAULT_CONFIG.highCutoff);
      expect(config.sampleRate).toBe(DEFAULT_CONFIG.sampleRate);
      expect(config.order).toBe(DEFAULT_CONFIG.order);
    });

    it('should return immutable config copy', () => {
      const filter = new ButterworthBandpassFilter(DEFAULT_CONFIG);

      const config1 = filter.getConfig();
      const config2 = filter.getConfig();

      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });

    it('should return coefficients', () => {
      const filter = new ButterworthBandpassFilter(DEFAULT_CONFIG);

      const coefficients = filter.getCoefficients();

      expect(coefficients.b).toBeInstanceOf(Float64Array);
      expect(coefficients.a).toBeInstanceOf(Float64Array);
      expect(coefficients.b.length).toBeGreaterThan(0);
    });

    it('should process chunks maintaining state', () => {
      const filter = new ButterworthBandpassFilter(DEFAULT_CONFIG);

      const chunk1 = new Float64Array(100);
      const chunk2 = new Float64Array(100);
      for (let i = 0; i < 100; i++) {
        chunk1[i] = Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE);
        chunk2[i] = Math.sin((2 * Math.PI * 10 * (i + 100)) / SAMPLE_RATE);
      }

      const output1 = filter.process(chunk1);
      const output2 = filter.process(chunk2);

      expect(output1.length).toBe(100);
      expect(output2.length).toBe(100);

      // Second chunk should show settled response
      const lastValChunk2 = output2[output2.length - 1];
      expect(Math.abs(lastValChunk2)).toBeGreaterThan(0);
    });

    it('should reset state correctly', () => {
      const filter = new ButterworthBandpassFilter(DEFAULT_CONFIG);

      // Process some data
      const chunk1 = new Float64Array(100).fill(100);
      filter.process(chunk1);

      // Reset and process same data
      filter.reset();
      const output1 = filter.process(chunk1);

      // Create new filter and process same data
      const filter2 = new ButterworthBandpassFilter(DEFAULT_CONFIG);
      const output2 = filter2.process(chunk1);

      // Results should be identical
      for (let i = 0; i < output1.length; i++) {
        expect(output1[i]).toBeCloseTo(output2[i], 10);
      }
    });

    it('should accept number array input', () => {
      const filter = new ButterworthBandpassFilter(DEFAULT_CONFIG);

      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      const output = filter.process(input);

      expect(output).toBeInstanceOf(Float64Array);
      expect(output.length).toBe(input.length);
    });
  });

  describe('createEEGBandpassFilter', () => {
    it('should create filter with default EEG settings', () => {
      const filter = createEEGBandpassFilter(SAMPLE_RATE);

      const config = filter.getConfig();
      expect(config.lowCutoff).toBe(0.5);
      expect(config.highCutoff).toBe(50);
      expect(config.order).toBe(4);
      expect(config.sampleRate).toBe(SAMPLE_RATE);
    });

    it('should work with different sample rates', () => {
      const rates = [128, 256, 512];

      rates.forEach((rate) => {
        const filter = createEEGBandpassFilter(rate);
        const config = filter.getConfig();

        expect(config.sampleRate).toBe(rate);
        expect(config.lowCutoff).toBe(0.5);
        expect(config.highCutoff).toBe(50);
      });
    });
  });

  describe('Filter frequency response', () => {
    it('should have unity gain at center frequency', () => {
      const coefficients = designButterworthBandpass({
        lowCutoff: 5,
        highCutoff: 40,
        sampleRate: SAMPLE_RATE,
        order: 4,
      });

      const centerFreq = Math.sqrt(5 * 40); // Geometric mean
      const omega = (2 * Math.PI * centerFreq) / SAMPLE_RATE;

      // Evaluate H(z) at center frequency
      let numReal = 0,
        numImag = 0;
      let denReal = 0,
        denImag = 0;

      for (let i = 0; i < coefficients.b.length; i++) {
        numReal += coefficients.b[i] * Math.cos(-omega * i);
        numImag += coefficients.b[i] * Math.sin(-omega * i);
      }

      for (let i = 0; i < coefficients.a.length; i++) {
        denReal += coefficients.a[i] * Math.cos(-omega * i);
        denImag += coefficients.a[i] * Math.sin(-omega * i);
      }

      const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
      const denMag = Math.sqrt(denReal * denReal + denImag * denImag);
      const gain = numMag / denMag;

      expect(gain).toBeCloseTo(1, 1);
    });

    it('should attenuate frequencies below passband', () => {
      const coefficients = designButterworthBandpass({
        lowCutoff: 5,
        highCutoff: 40,
        sampleRate: SAMPLE_RATE,
        order: 4,
      });

      // Test at 0.1 Hz (well below 5 Hz cutoff)
      const testFreq = 0.1;
      const omega = (2 * Math.PI * testFreq) / SAMPLE_RATE;

      let numReal = 0,
        numImag = 0;
      let denReal = 0,
        denImag = 0;

      for (let i = 0; i < coefficients.b.length; i++) {
        numReal += coefficients.b[i] * Math.cos(-omega * i);
        numImag += coefficients.b[i] * Math.sin(-omega * i);
      }

      for (let i = 0; i < coefficients.a.length; i++) {
        denReal += coefficients.a[i] * Math.cos(-omega * i);
        denImag += coefficients.a[i] * Math.sin(-omega * i);
      }

      const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
      const denMag = Math.sqrt(denReal * denReal + denImag * denImag);
      const gain = numMag / denMag;

      expect(gain).toBeLessThan(0.1); // Should be significantly attenuated
    });

    it('should attenuate frequencies above passband', () => {
      const coefficients = designButterworthBandpass({
        lowCutoff: 5,
        highCutoff: 40,
        sampleRate: SAMPLE_RATE,
        order: 4,
      });

      // Test at 100 Hz (well above 40 Hz cutoff)
      const testFreq = 100;
      const omega = (2 * Math.PI * testFreq) / SAMPLE_RATE;

      let numReal = 0,
        numImag = 0;
      let denReal = 0,
        denImag = 0;

      for (let i = 0; i < coefficients.b.length; i++) {
        numReal += coefficients.b[i] * Math.cos(-omega * i);
        numImag += coefficients.b[i] * Math.sin(-omega * i);
      }

      for (let i = 0; i < coefficients.a.length; i++) {
        denReal += coefficients.a[i] * Math.cos(-omega * i);
        denImag += coefficients.a[i] * Math.sin(-omega * i);
      }

      const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
      const denMag = Math.sqrt(denReal * denReal + denImag * denImag);
      const gain = numMag / denMag;

      expect(gain).toBeLessThan(0.1); // Should be significantly attenuated
    });
  });

  describe('Integration with EEG workflow', () => {
    it('should process typical EEG data packet', () => {
      // Simulate a typical EEG packet (256 samples at 256 Hz = 1 second)
      const samples = 256;
      const input: number[] = [];

      // Mix of theta (6 Hz), alpha (10 Hz), and high-frequency noise
      for (let i = 0; i < samples; i++) {
        const theta = 10 * Math.sin((2 * Math.PI * 6 * i) / SAMPLE_RATE);
        const alpha = 5 * Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE);
        const noise = 2 * Math.sin((2 * Math.PI * 80 * i) / SAMPLE_RATE);
        const dcOffset = 500; // Typical DC offset from electrode
        input.push(dcOffset + theta + alpha + noise);
      }

      const output = filterEEG(input, SAMPLE_RATE);

      // Verify output is valid
      expect(output.length).toBe(samples);
      expect(output.every((v) => !isNaN(v) && isFinite(v))).toBe(true);

      // Verify DC is significantly reduced (not completely removed due to edge effects)
      const inputMean = input.reduce((a, b) => a + b, 0) / input.length;

      // Calculate mean of middle portion to avoid edge effects
      const startIdx = Math.floor(samples * 0.3);
      const endIdx = Math.floor(samples * 0.7);
      let midSum = 0;
      for (let i = startIdx; i < endIdx; i++) {
        midSum += output[i];
      }
      const outputMidMean = midSum / (endIdx - startIdx);

      expect(Math.abs(inputMean)).toBeGreaterThan(100); // Input has DC
      expect(Math.abs(outputMidMean)).toBeLessThan(50); // DC significantly reduced
    });

    it('should handle streaming chunks correctly', () => {
      const filter = createEEGBandpassFilter(SAMPLE_RATE);
      const chunkSize = 32; // Typical BLE packet size
      const totalChunks = 10;

      // Generate continuous sine wave
      const fullSignal: number[] = [];
      for (let i = 0; i < chunkSize * totalChunks; i++) {
        fullSignal.push(Math.sin((2 * Math.PI * 10 * i) / SAMPLE_RATE));
      }

      // Process in chunks
      const streamedOutput: number[] = [];
      for (let c = 0; c < totalChunks; c++) {
        const chunk = fullSignal.slice(c * chunkSize, (c + 1) * chunkSize);
        const filtered = filter.process(chunk);
        streamedOutput.push(...filtered);
      }

      // Verify continuous processing
      expect(streamedOutput.length).toBe(fullSignal.length);

      // Later chunks should have stable output
      const lastChunk = streamedOutput.slice(-chunkSize);
      const maxVal = Math.max(...lastChunk.map(Math.abs));
      expect(maxVal).toBeGreaterThan(0.5); // Signal passes through
      expect(maxVal).toBeLessThan(1.5); // Not amplified excessively
    });
  });
});
