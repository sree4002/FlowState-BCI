import {
  WelchConfig,
  WelchResult,
  BandPower,
  DEFAULT_WELCH_CONFIG,
  hannWindow,
  hammingWindow,
  rectangularWindow,
  getWindowFunction,
  windowPower,
  nextPowerOf2,
  zeroPad,
  fft,
  rfft,
  computePowerSpectrum,
  rfftFrequencies,
  welchPeriodogram,
  extractBandPower,
  extractThetaPower,
  extractAlphaPower,
  extractBetaPower,
  extractAllBandPowers,
  generateSineWave,
  generateSyntheticEEG,
} from '../src/services/signalProcessing';

describe("Signal Processing - Welch's Periodogram", () => {
  describe('Window Functions', () => {
    describe('hannWindow', () => {
      it('should generate a Hann window of correct length', () => {
        const window = hannWindow(256);
        expect(window.length).toBe(256);
      });

      it('should start and end near zero', () => {
        const window = hannWindow(256);
        expect(window[0]).toBeCloseTo(0, 5);
        expect(window[255]).toBeCloseTo(0, 5);
      });

      it('should peak at the center with value near 1', () => {
        const window = hannWindow(256);
        const center = Math.floor(255 / 2);
        expect(window[center]).toBeCloseTo(1, 1);
      });

      it('should be symmetric', () => {
        const window = hannWindow(100);
        for (let i = 0; i < 50; i++) {
          expect(window[i]).toBeCloseTo(window[99 - i], 10);
        }
      });
    });

    describe('hammingWindow', () => {
      it('should generate a Hamming window of correct length', () => {
        const window = hammingWindow(256);
        expect(window.length).toBe(256);
      });

      it('should have non-zero endpoints (0.08)', () => {
        const window = hammingWindow(256);
        expect(window[0]).toBeCloseTo(0.08, 1);
        expect(window[255]).toBeCloseTo(0.08, 1);
      });

      it('should peak at the center with value near 1', () => {
        const window = hammingWindow(256);
        const center = Math.floor(255 / 2);
        expect(window[center]).toBeCloseTo(1, 1);
      });
    });

    describe('rectangularWindow', () => {
      it('should generate all ones', () => {
        const window = rectangularWindow(100);
        expect(window.length).toBe(100);
        expect(window.every((v) => v === 1)).toBe(true);
      });
    });

    describe('getWindowFunction', () => {
      it('should return Hann window for "hann"', () => {
        const window = getWindowFunction('hann', 64);
        const hann = hannWindow(64);
        expect(window).toEqual(hann);
      });

      it('should return Hamming window for "hamming"', () => {
        const window = getWindowFunction('hamming', 64);
        const hamming = hammingWindow(64);
        expect(window).toEqual(hamming);
      });

      it('should return rectangular window for "rectangular"', () => {
        const window = getWindowFunction('rectangular', 64);
        expect(window.every((v) => v === 1)).toBe(true);
      });
    });

    describe('windowPower', () => {
      it('should calculate sum of squared values', () => {
        const window = [1, 2, 3];
        expect(windowPower(window)).toBe(14); // 1 + 4 + 9
      });

      it('should return N for rectangular window', () => {
        const window = rectangularWindow(100);
        expect(windowPower(window)).toBe(100);
      });

      it('should return approximately 0.375*N for Hann window', () => {
        const window = hannWindow(1024);
        const power = windowPower(window);
        // Hann window has a theoretical power of 0.375*N (3/8*N)
        expect(power).toBeCloseTo(384, -1); // Approximately 0.375*N
      });
    });
  });

  describe('Utility Functions', () => {
    describe('nextPowerOf2', () => {
      it('should return next power of 2 for non-power inputs', () => {
        expect(nextPowerOf2(100)).toBe(128);
        expect(nextPowerOf2(500)).toBe(512);
        expect(nextPowerOf2(1000)).toBe(1024);
      });

      it('should return same value for power of 2 inputs', () => {
        expect(nextPowerOf2(64)).toBe(64);
        expect(nextPowerOf2(256)).toBe(256);
        expect(nextPowerOf2(1024)).toBe(1024);
      });

      it('should handle edge cases', () => {
        expect(nextPowerOf2(0)).toBe(1);
        expect(nextPowerOf2(1)).toBe(1);
        expect(nextPowerOf2(2)).toBe(2);
      });
    });

    describe('zeroPad', () => {
      it('should pad with zeros to target length', () => {
        const data = [1, 2, 3];
        const padded = zeroPad(data, 8);
        expect(padded).toEqual([1, 2, 3, 0, 0, 0, 0, 0]);
      });

      it('should truncate if data is longer than target', () => {
        const data = [1, 2, 3, 4, 5];
        const truncated = zeroPad(data, 3);
        expect(truncated).toEqual([1, 2, 3]);
      });

      it('should return same length if equal to target', () => {
        const data = [1, 2, 3, 4];
        const result = zeroPad(data, 4);
        expect(result).toEqual([1, 2, 3, 4]);
      });
    });
  });

  describe('FFT Functions', () => {
    describe('fft', () => {
      it('should throw error for non-power-of-2 length', () => {
        const real = [1, 2, 3];
        const imag = [0, 0, 0];
        expect(() => fft(real, imag)).toThrow(
          'FFT length must be a power of 2'
        );
      });

      it('should compute FFT of DC signal correctly', () => {
        const real = [1, 1, 1, 1];
        const imag = [0, 0, 0, 0];
        fft(real, imag);
        expect(real[0]).toBeCloseTo(4, 5); // DC component = sum
        expect(real[1]).toBeCloseTo(0, 5);
        expect(real[2]).toBeCloseTo(0, 5);
        expect(real[3]).toBeCloseTo(0, 5);
      });

      it('should compute FFT of single frequency sine wave', () => {
        const n = 64;
        const real = new Array(n);
        const imag = new Array(n).fill(0);
        const freq = 4; // 4 cycles in n samples

        for (let i = 0; i < n; i++) {
          real[i] = Math.sin((2 * Math.PI * freq * i) / n);
        }

        fft(real, imag);

        // Peak should be at frequency bin 4 (and n-4 for negative frequency)
        const magnitude = (r: number, i: number) => Math.sqrt(r * r + i * i);
        const mag4 = magnitude(real[freq], imag[freq]);
        const mag0 = magnitude(real[0], imag[0]);

        expect(mag4).toBeGreaterThan(mag0 + 10); // Much larger than DC
      });
    });

    describe('rfft', () => {
      it('should return only positive frequencies', () => {
        const data = new Array(8).fill(1);
        const { real, imag } = rfft(data);
        expect(real.length).toBe(5); // N/2 + 1
        expect(imag.length).toBe(5);
      });

      it('should compute DC component correctly', () => {
        const data = [2, 2, 2, 2];
        const { real } = rfft(data);
        expect(real[0]).toBeCloseTo(8, 5); // Sum of all values
      });
    });

    describe('computePowerSpectrum', () => {
      it('should compute magnitude squared', () => {
        const real = [3, 4];
        const imag = [4, 3];
        const power = computePowerSpectrum(real, imag);
        expect(power[0]).toBe(25); // 3^2 + 4^2
        expect(power[1]).toBe(25); // 4^2 + 3^2
      });
    });

    describe('rfftFrequencies', () => {
      it('should generate correct frequency bins', () => {
        const freqs = rfftFrequencies(256, 500);
        expect(freqs.length).toBe(129); // N/2 + 1
        expect(freqs[0]).toBe(0); // DC
        expect(freqs[freqs.length - 1]).toBeCloseTo(250, 5); // Nyquist
      });

      it('should have correct frequency resolution', () => {
        const freqs = rfftFrequencies(1000, 500);
        const resolution = freqs[1] - freqs[0];
        expect(resolution).toBeCloseTo(0.5, 5); // fs / N = 500 / 1000
      });
    });
  });

  describe("Welch's Periodogram", () => {
    describe('welchPeriodogram', () => {
      it('should compute PSD for valid input', () => {
        const samplingRate = 500;
        const duration = 4; // 4 seconds
        const signal = generateSineWave(10, samplingRate, duration);

        const result = welchPeriodogram(signal, { samplingRate });

        expect(result.frequencies).toBeDefined();
        expect(result.psd).toBeDefined();
        expect(result.frequencies.length).toBe(result.psd.length);
        expect(result.segmentCount).toBeGreaterThan(0);
      });

      it('should throw error if input is too short', () => {
        const signal = [1, 2, 3]; // Too short for 2 second window at 500 Hz
        expect(() => welchPeriodogram(signal, { samplingRate: 500 })).toThrow(
          /Input data length/
        );
      });

      it('should detect peak at correct frequency', () => {
        const samplingRate = 500;
        const testFreq = 10; // 10 Hz
        const duration = 4;
        const signal = generateSineWave(testFreq, samplingRate, duration);

        const result = welchPeriodogram(signal, { samplingRate });

        // Find frequency with maximum power
        let maxPower = -Infinity;
        let maxFreq = 0;
        for (let i = 1; i < result.psd.length - 1; i++) {
          if (result.psd[i] > maxPower) {
            maxPower = result.psd[i];
            maxFreq = result.frequencies[i];
          }
        }

        // Peak should be close to test frequency
        expect(Math.abs(maxFreq - testFreq)).toBeLessThan(1);
      });

      it('should work with different window sizes', () => {
        const samplingRate = 500;
        const signal = generateSineWave(10, samplingRate, 8);

        const result2s = welchPeriodogram(signal, {
          samplingRate,
          windowSizeSeconds: 2,
        });

        const result4s = welchPeriodogram(signal, {
          samplingRate,
          windowSizeSeconds: 4,
        });

        // 4 second window should have better frequency resolution
        expect(result4s.frequencyResolution).toBeLessThan(
          result2s.frequencyResolution
        );
      });

      it('should work with different overlap ratios', () => {
        const samplingRate = 500;
        const signal = generateSineWave(10, samplingRate, 6);

        const result25 = welchPeriodogram(signal, {
          samplingRate,
          overlapRatio: 0.25,
        });

        const result75 = welchPeriodogram(signal, {
          samplingRate,
          overlapRatio: 0.75,
        });

        // Higher overlap should produce more segments
        expect(result75.segmentCount).toBeGreaterThan(result25.segmentCount);
      });

      it('should use default configuration values', () => {
        const signal = generateSineWave(10, 500, 4);
        const result = welchPeriodogram(signal);

        expect(result.frequencyResolution).toBeDefined();
        expect(result.segmentCount).toBeGreaterThan(0);
      });
    });

    describe('DEFAULT_WELCH_CONFIG', () => {
      it('should have expected default values', () => {
        expect(DEFAULT_WELCH_CONFIG.samplingRate).toBe(500);
        expect(DEFAULT_WELCH_CONFIG.windowSizeSeconds).toBe(2);
        expect(DEFAULT_WELCH_CONFIG.overlapRatio).toBe(0.5);
        expect(DEFAULT_WELCH_CONFIG.windowFunction).toBe('hann');
      });
    });
  });

  describe('Band Power Extraction', () => {
    describe('extractBandPower', () => {
      it('should extract power in specified frequency range', () => {
        const samplingRate = 500;
        const signal = generateSineWave(10, samplingRate, 4); // 10 Hz in alpha band
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const alphaPower = extractBandPower(welchResult, 8, 13);

        expect(alphaPower.lowFreq).toBe(8);
        expect(alphaPower.highFreq).toBe(13);
        expect(alphaPower.absolutePower).toBeGreaterThan(0);
        expect(alphaPower.relativePower).toBeGreaterThan(0);
        expect(alphaPower.relativePower).toBeLessThanOrEqual(1);
        expect(alphaPower.peakFrequency).toBeGreaterThanOrEqual(8);
        expect(alphaPower.peakFrequency).toBeLessThanOrEqual(13);
      });

      it('should find correct peak frequency', () => {
        const samplingRate = 500;
        const testFreq = 6; // 6 Hz in theta band
        const signal = generateSineWave(testFreq, samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const thetaPower = extractBandPower(welchResult, 4, 8);

        expect(Math.abs(thetaPower.peakFrequency - testFreq)).toBeLessThan(1);
      });

      it('should calculate relative power correctly', () => {
        const samplingRate = 500;
        // Signal with only alpha band component
        const signal = generateSineWave(10, samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const alphaPower = extractBandPower(welchResult, 8, 13);
        const thetaPower = extractBandPower(welchResult, 4, 8);

        // Alpha should have much more relative power than theta
        expect(alphaPower.relativePower).toBeGreaterThan(
          thetaPower.relativePower
        );
      });
    });

    describe('extractThetaPower', () => {
      it('should extract theta band (4-8 Hz)', () => {
        const samplingRate = 500;
        const signal = generateSineWave(6, samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const theta = extractThetaPower(welchResult);

        expect(theta.lowFreq).toBe(4);
        expect(theta.highFreq).toBe(8);
        expect(theta.absolutePower).toBeGreaterThan(0);
      });
    });

    describe('extractAlphaPower', () => {
      it('should extract alpha band (8-13 Hz)', () => {
        const samplingRate = 500;
        const signal = generateSineWave(10, samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const alpha = extractAlphaPower(welchResult);

        expect(alpha.lowFreq).toBe(8);
        expect(alpha.highFreq).toBe(13);
        expect(alpha.absolutePower).toBeGreaterThan(0);
      });
    });

    describe('extractBetaPower', () => {
      it('should extract beta band (13-30 Hz)', () => {
        const samplingRate = 500;
        const signal = generateSineWave(20, samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const beta = extractBetaPower(welchResult);

        expect(beta.lowFreq).toBe(13);
        expect(beta.highFreq).toBe(30);
        expect(beta.absolutePower).toBeGreaterThan(0);
      });
    });

    describe('extractAllBandPowers', () => {
      it('should extract theta, alpha, and beta band powers', () => {
        const samplingRate = 500;
        const signal = generateSyntheticEEG(samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        const bands = extractAllBandPowers(welchResult);

        expect(bands.theta).toBeDefined();
        expect(bands.alpha).toBeDefined();
        expect(bands.beta).toBeDefined();

        expect(bands.theta.lowFreq).toBe(4);
        expect(bands.theta.highFreq).toBe(8);
        expect(bands.alpha.lowFreq).toBe(8);
        expect(bands.alpha.highFreq).toBe(13);
        expect(bands.beta.lowFreq).toBe(13);
        expect(bands.beta.highFreq).toBe(30);
      });
    });
  });

  describe('Test Signal Generation', () => {
    describe('generateSineWave', () => {
      it('should generate correct number of samples', () => {
        const signal = generateSineWave(10, 500, 2);
        expect(signal.length).toBe(1000); // 500 Hz * 2 seconds
      });

      it('should generate signal with correct amplitude', () => {
        const amplitude = 5;
        const signal = generateSineWave(10, 500, 2, amplitude);
        const maxAbs = Math.max(...signal.map(Math.abs));
        expect(maxAbs).toBeCloseTo(amplitude, 1);
      });

      it('should generate signal with correct frequency', () => {
        const freq = 10;
        const samplingRate = 500;
        const duration = 4;
        const signal = generateSineWave(freq, samplingRate, duration);
        const welchResult = welchPeriodogram(signal, { samplingRate });

        // Find peak frequency
        let maxPower = -Infinity;
        let peakFreq = 0;
        for (let i = 1; i < welchResult.psd.length - 1; i++) {
          if (welchResult.psd[i] > maxPower) {
            maxPower = welchResult.psd[i];
            peakFreq = welchResult.frequencies[i];
          }
        }

        expect(Math.abs(peakFreq - freq)).toBeLessThan(1);
      });
    });

    describe('generateSyntheticEEG', () => {
      it('should generate correct number of samples', () => {
        const signal = generateSyntheticEEG(500, 3);
        expect(signal.length).toBe(1500); // 500 Hz * 3 seconds
      });

      it('should contain theta, alpha, and beta components', () => {
        const samplingRate = 500;
        const signal = generateSyntheticEEG(samplingRate, 4);
        const welchResult = welchPeriodogram(signal, { samplingRate });
        const bands = extractAllBandPowers(welchResult);

        // All bands should have non-zero power
        expect(bands.theta.absolutePower).toBeGreaterThan(0);
        expect(bands.alpha.absolutePower).toBeGreaterThan(0);
        expect(bands.beta.absolutePower).toBeGreaterThan(0);
      });

      it('should respect relative power parameters', () => {
        const samplingRate = 500;
        // Strong theta, weak alpha and beta
        const signal = generateSyntheticEEG(samplingRate, 4, 2.0, 0.2, 0.2);
        const welchResult = welchPeriodogram(signal, { samplingRate });
        const bands = extractAllBandPowers(welchResult);

        // Theta should dominate
        expect(bands.theta.absolutePower).toBeGreaterThan(
          bands.alpha.absolutePower
        );
        expect(bands.theta.absolutePower).toBeGreaterThan(
          bands.beta.absolutePower
        );
      });
    });
  });

  describe('TypeScript Types', () => {
    it('should define WelchConfig interface correctly', () => {
      const config: WelchConfig = {
        samplingRate: 500,
        windowSizeSeconds: 2,
        overlapRatio: 0.5,
        windowFunction: 'hann',
      };
      expect(config.samplingRate).toBe(500);
      expect(config.windowSizeSeconds).toBe(2);
    });

    it('should define WelchResult interface correctly', () => {
      const result: WelchResult = {
        frequencies: [0, 1, 2],
        psd: [0.1, 0.2, 0.3],
        frequencyResolution: 0.5,
        segmentCount: 3,
      };
      expect(result.frequencies.length).toBe(3);
      expect(result.segmentCount).toBe(3);
    });

    it('should define BandPower interface correctly', () => {
      const bandPower: BandPower = {
        lowFreq: 4,
        highFreq: 8,
        absolutePower: 10.5,
        relativePower: 0.25,
        peakFrequency: 6.5,
        peakPower: 8.3,
      };
      expect(bandPower.lowFreq).toBe(4);
      expect(bandPower.relativePower).toBe(0.25);
    });
  });

  describe('Integration Tests', () => {
    it('should process 2-second window correctly for 500 Hz sampling', () => {
      const samplingRate = 500;
      const windowSizeSeconds = 2;
      const signal = generateSineWave(6, samplingRate, 4);

      const result = welchPeriodogram(signal, {
        samplingRate,
        windowSizeSeconds,
      });

      // Window size of 2 seconds at 500 Hz = 1000 samples
      // NFFT = 1024 (next power of 2)
      // Frequency resolution = 500 / 1024 ≈ 0.488 Hz
      expect(result.frequencyResolution).toBeCloseTo(500 / 1024, 2);
    });

    it('should process 4-second window correctly for 500 Hz sampling', () => {
      const samplingRate = 500;
      const windowSizeSeconds = 4;
      const signal = generateSineWave(6, samplingRate, 8);

      const result = welchPeriodogram(signal, {
        samplingRate,
        windowSizeSeconds,
      });

      // Window size of 4 seconds at 500 Hz = 2000 samples
      // NFFT = 2048 (next power of 2)
      // Frequency resolution = 500 / 2048 ≈ 0.244 Hz
      expect(result.frequencyResolution).toBeCloseTo(500 / 2048, 2);
    });

    it('should process 250 Hz earpiece sampling rate correctly', () => {
      const samplingRate = 250;
      const signal = generateSineWave(10, samplingRate, 4);

      const result = welchPeriodogram(signal, { samplingRate });

      expect(result.frequencies).toBeDefined();
      // Nyquist frequency should be 125 Hz
      expect(result.frequencies[result.frequencies.length - 1]).toBeCloseTo(
        125,
        0
      );
    });

    it('should correctly identify dominant frequency in mixed signal', () => {
      const samplingRate = 500;
      const duration = 4;

      // Create signal with multiple components, theta dominant
      const theta = generateSineWave(6, samplingRate, duration, 10);
      const alpha = generateSineWave(10, samplingRate, duration, 3);
      const beta = generateSineWave(20, samplingRate, duration, 2);

      const signal = theta.map((t, i) => t + alpha[i] + beta[i]);

      const result = welchPeriodogram(signal, { samplingRate });
      const bands = extractAllBandPowers(result);

      // Theta should have highest absolute power
      expect(bands.theta.absolutePower).toBeGreaterThan(
        bands.alpha.absolutePower
      );
      expect(bands.theta.absolutePower).toBeGreaterThan(
        bands.beta.absolutePower
      );

      // Peak in theta band should be near 6 Hz (within frequency resolution)
      expect(Math.abs(bands.theta.peakFrequency - 6)).toBeLessThan(0.5);
    });
  });
});
