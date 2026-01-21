// Signal Processing Service for FlowState BCI
// Implements Welch's periodogram for power spectrum estimation

/**
 * Configuration for Welch's periodogram
 */
export interface WelchConfig {
  /** Sampling rate in Hz */
  samplingRate: number;
  /** Window size in seconds (2-4 seconds recommended for EEG) */
  windowSizeSeconds: number;
  /** Overlap ratio between windows (0.0 to 1.0, typically 0.5) */
  overlapRatio: number;
  /** Window function to use */
  windowFunction: 'hann' | 'hamming' | 'rectangular';
}

/**
 * Result from Welch's periodogram computation
 */
export interface WelchResult {
  /** Frequency bins in Hz */
  frequencies: number[];
  /** Power spectral density values */
  psd: number[];
  /** Frequency resolution in Hz */
  frequencyResolution: number;
  /** Number of segments used in averaging */
  segmentCount: number;
}

/**
 * Band power result for a specific frequency band
 */
export interface BandPower {
  /** Lower frequency bound in Hz */
  lowFreq: number;
  /** Upper frequency bound in Hz */
  highFreq: number;
  /** Absolute power in the band */
  absolutePower: number;
  /** Relative power (proportion of total power) */
  relativePower: number;
  /** Peak frequency within the band */
  peakFrequency: number;
  /** Power at the peak frequency */
  peakPower: number;
}

/**
 * Default configuration for EEG signal processing
 */
export const DEFAULT_WELCH_CONFIG: WelchConfig = {
  samplingRate: 500, // 500 Hz for headband, 250 Hz for earpiece
  windowSizeSeconds: 2, // 2 second windows
  overlapRatio: 0.5, // 50% overlap
  windowFunction: 'hann',
};

/**
 * Generates a Hann window of specified length
 * The Hann window reduces spectral leakage by tapering the signal edges
 *
 * @param length - Number of samples in the window
 * @returns Array of window coefficients
 */
export function hannWindow(length: number): number[] {
  const window: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    // Hann window formula: 0.5 * (1 - cos(2π * n / (N - 1)))
    window[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (length - 1)));
  }
  return window;
}

/**
 * Generates a Hamming window of specified length
 * Similar to Hann but with slightly different coefficients
 *
 * @param length - Number of samples in the window
 * @returns Array of window coefficients
 */
export function hammingWindow(length: number): number[] {
  const window: number[] = new Array(length);
  for (let i = 0; i < length; i++) {
    // Hamming window formula: 0.54 - 0.46 * cos(2π * n / (N - 1))
    window[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (length - 1));
  }
  return window;
}

/**
 * Generates a rectangular window (no tapering)
 *
 * @param length - Number of samples in the window
 * @returns Array of window coefficients (all ones)
 */
export function rectangularWindow(length: number): number[] {
  return new Array(length).fill(1);
}

/**
 * Gets the appropriate window function based on name
 *
 * @param name - Window function name
 * @param length - Window length
 * @returns Array of window coefficients
 */
export function getWindowFunction(
  name: 'hann' | 'hamming' | 'rectangular',
  length: number
): number[] {
  switch (name) {
    case 'hann':
      return hannWindow(length);
    case 'hamming':
      return hammingWindow(length);
    case 'rectangular':
      return rectangularWindow(length);
    default:
      return hannWindow(length);
  }
}

/**
 * Calculates the window power for normalization
 *
 * @param window - Window coefficients
 * @returns Sum of squared window values
 */
export function windowPower(window: number[]): number {
  return window.reduce((sum, val) => sum + val * val, 0);
}

/**
 * Finds the next power of 2 greater than or equal to n
 *
 * @param n - Input number
 * @returns Next power of 2
 */
export function nextPowerOf2(n: number): number {
  if (n <= 0) return 1;
  return Math.pow(2, Math.ceil(Math.log2(n)));
}

/**
 * Zero-pads an array to the specified length
 *
 * @param data - Input array
 * @param targetLength - Desired length
 * @returns Zero-padded array
 */
export function zeroPad(data: number[], targetLength: number): number[] {
  if (data.length >= targetLength) {
    return data.slice(0, targetLength);
  }
  const padded = new Array(targetLength).fill(0);
  for (let i = 0; i < data.length; i++) {
    padded[i] = data[i];
  }
  return padded;
}

/**
 * Computes the Fast Fourier Transform using Cooley-Tukey algorithm
 * This is an in-place radix-2 decimation-in-time FFT
 *
 * @param real - Real part of input (modified in place)
 * @param imag - Imaginary part of input (modified in place)
 */
export function fft(real: number[], imag: number[]): void {
  const n = real.length;

  // Ensure n is a power of 2
  if ((n & (n - 1)) !== 0) {
    throw new Error('FFT length must be a power of 2');
  }

  // Bit reversal permutation
  let j = 0;
  for (let i = 0; i < n - 1; i++) {
    if (i < j) {
      // Swap real parts
      let temp = real[i];
      real[i] = real[j];
      real[j] = temp;
      // Swap imaginary parts
      temp = imag[i];
      imag[i] = imag[j];
      imag[j] = temp;
    }
    let k = n >> 1;
    while (k <= j) {
      j -= k;
      k >>= 1;
    }
    j += k;
  }

  // Cooley-Tukey iterative FFT
  for (let len = 2; len <= n; len <<= 1) {
    const halfLen = len >> 1;
    const angleStep = (-2 * Math.PI) / len;

    for (let i = 0; i < n; i += len) {
      let angle = 0;
      for (let k = 0; k < halfLen; k++) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);

        const evenIdx = i + k;
        const oddIdx = i + k + halfLen;

        const tReal = real[oddIdx] * cos - imag[oddIdx] * sin;
        const tImag = real[oddIdx] * sin + imag[oddIdx] * cos;

        real[oddIdx] = real[evenIdx] - tReal;
        imag[oddIdx] = imag[evenIdx] - tImag;
        real[evenIdx] = real[evenIdx] + tReal;
        imag[evenIdx] = imag[evenIdx] + tImag;

        angle += angleStep;
      }
    }
  }
}

/**
 * Computes the real FFT for real-valued input
 * Returns only the positive frequency components (DC to Nyquist)
 *
 * @param data - Real-valued input data (length must be power of 2)
 * @returns Object containing frequencies and complex FFT result
 */
export function rfft(data: number[]): { real: number[]; imag: number[] } {
  const n = data.length;
  const real = [...data];
  const imag = new Array(n).fill(0);

  fft(real, imag);

  // Return only positive frequencies (0 to N/2)
  const positiveN = Math.floor(n / 2) + 1;
  return {
    real: real.slice(0, positiveN),
    imag: imag.slice(0, positiveN),
  };
}

/**
 * Computes the power spectrum from FFT result
 *
 * @param fftReal - Real part of FFT
 * @param fftImag - Imaginary part of FFT
 * @returns Array of power values (magnitude squared)
 */
export function computePowerSpectrum(
  fftReal: number[],
  fftImag: number[]
): number[] {
  const power: number[] = new Array(fftReal.length);
  for (let i = 0; i < fftReal.length; i++) {
    power[i] = fftReal[i] * fftReal[i] + fftImag[i] * fftImag[i];
  }
  return power;
}

/**
 * Generates frequency bins for FFT result
 *
 * @param nfft - FFT length
 * @param samplingRate - Sampling rate in Hz
 * @returns Array of frequency values in Hz
 */
export function rfftFrequencies(nfft: number, samplingRate: number): number[] {
  const positiveN = Math.floor(nfft / 2) + 1;
  const frequencies: number[] = new Array(positiveN);
  const freqResolution = samplingRate / nfft;

  for (let i = 0; i < positiveN; i++) {
    frequencies[i] = i * freqResolution;
  }

  return frequencies;
}

/**
 * Computes Welch's periodogram for power spectral density estimation
 *
 * Welch's method divides the signal into overlapping segments, applies a window
 * function, computes the periodogram of each segment, and averages them to
 * reduce variance in the spectral estimate.
 *
 * @param data - Input signal samples
 * @param config - Welch configuration parameters
 * @returns WelchResult with frequencies and PSD values
 */
export function welchPeriodogram(
  data: number[],
  config: Partial<WelchConfig> = {}
): WelchResult {
  const cfg: WelchConfig = { ...DEFAULT_WELCH_CONFIG, ...config };
  const { samplingRate, windowSizeSeconds, overlapRatio, windowFunction } = cfg;

  // Calculate segment parameters
  const segmentLength = Math.floor(samplingRate * windowSizeSeconds);
  const overlap = Math.floor(segmentLength * overlapRatio);
  const step = segmentLength - overlap;

  // Validate input
  if (data.length < segmentLength) {
    throw new Error(
      `Input data length (${data.length}) is shorter than segment length (${segmentLength}). ` +
        `Need at least ${windowSizeSeconds} seconds of data at ${samplingRate} Hz.`
    );
  }

  // Get window function and calculate its power for normalization
  const window = getWindowFunction(windowFunction, segmentLength);
  const winPower = windowPower(window);

  // Calculate NFFT (next power of 2 for efficient FFT)
  const nfft = nextPowerOf2(segmentLength);

  // Calculate number of segments
  const numSegments = Math.floor((data.length - segmentLength) / step) + 1;

  // Initialize accumulator for averaged PSD
  const positiveN = Math.floor(nfft / 2) + 1;
  const psdAccum: number[] = new Array(positiveN).fill(0);

  // Process each segment
  for (let segIdx = 0; segIdx < numSegments; segIdx++) {
    const startIdx = segIdx * step;

    // Extract and window the segment
    const segment: number[] = new Array(segmentLength);
    for (let i = 0; i < segmentLength; i++) {
      segment[i] = data[startIdx + i] * window[i];
    }

    // Zero-pad to NFFT length
    const paddedSegment = zeroPad(segment, nfft);

    // Compute FFT
    const { real, imag } = rfft(paddedSegment);

    // Compute power spectrum and accumulate
    for (let i = 0; i < positiveN; i++) {
      psdAccum[i] += real[i] * real[i] + imag[i] * imag[i];
    }
  }

  // Calculate normalization factor
  // PSD normalization: 2 / (fs * U * K)
  // where fs = sampling rate, U = window power, K = number of segments
  // The factor of 2 accounts for the one-sided spectrum (except DC and Nyquist)
  const normFactor = samplingRate * winPower * numSegments;

  // Normalize PSD
  const psd: number[] = new Array(positiveN);
  for (let i = 0; i < positiveN; i++) {
    // Scale by 2 for one-sided spectrum (except DC and Nyquist)
    const scale = i === 0 || i === positiveN - 1 ? 1 : 2;
    psd[i] = (psdAccum[i] * scale) / normFactor;
  }

  // Generate frequency bins
  const frequencies = rfftFrequencies(nfft, samplingRate);

  return {
    frequencies,
    psd,
    frequencyResolution: samplingRate / nfft,
    segmentCount: numSegments,
  };
}

/**
 * Extracts power in a specific frequency band
 *
 * @param welchResult - Result from welchPeriodogram
 * @param lowFreq - Lower frequency bound in Hz
 * @param highFreq - Upper frequency bound in Hz
 * @returns BandPower object with power metrics
 */
export function extractBandPower(
  welchResult: WelchResult,
  lowFreq: number,
  highFreq: number
): BandPower {
  const { frequencies, psd } = welchResult;

  // Find indices for the frequency band
  let lowIdx = 0;
  let highIdx = frequencies.length - 1;

  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] >= lowFreq) {
      lowIdx = i;
      break;
    }
  }

  for (let i = frequencies.length - 1; i >= 0; i--) {
    if (frequencies[i] <= highFreq) {
      highIdx = i;
      break;
    }
  }

  // Calculate band power (integral approximation using trapezoidal rule)
  let absolutePower = 0;
  let peakPower = -Infinity;
  let peakFrequency = frequencies[lowIdx];

  for (let i = lowIdx; i <= highIdx; i++) {
    // Trapezoidal integration
    if (i < highIdx) {
      const df = frequencies[i + 1] - frequencies[i];
      absolutePower += ((psd[i] + psd[i + 1]) / 2) * df;
    }

    // Track peak
    if (psd[i] > peakPower) {
      peakPower = psd[i];
      peakFrequency = frequencies[i];
    }
  }

  // Calculate total power for relative power
  let totalPower = 0;
  for (let i = 0; i < frequencies.length - 1; i++) {
    const df = frequencies[i + 1] - frequencies[i];
    totalPower += ((psd[i] + psd[i + 1]) / 2) * df;
  }

  const relativePower = totalPower > 0 ? absolutePower / totalPower : 0;

  return {
    lowFreq,
    highFreq,
    absolutePower,
    relativePower,
    peakFrequency,
    peakPower,
  };
}

/**
 * Convenience function to extract theta band power (4-8 Hz)
 */
export function extractThetaPower(welchResult: WelchResult): BandPower {
  return extractBandPower(welchResult, 4, 8);
}

/**
 * Convenience function to extract alpha band power (8-13 Hz)
 */
export function extractAlphaPower(welchResult: WelchResult): BandPower {
  return extractBandPower(welchResult, 8, 13);
}

/**
 * Convenience function to extract beta band power (13-30 Hz)
 */
export function extractBetaPower(welchResult: WelchResult): BandPower {
  return extractBandPower(welchResult, 13, 30);
}

/**
 * Result containing all standard EEG frequency band powers
 */
export interface EEGBandPowers {
  theta: BandPower;
  alpha: BandPower;
  beta: BandPower;
}

/**
 * Extracts power from all standard EEG frequency bands
 *
 * @param welchResult - Result from welchPeriodogram
 * @returns Object containing theta, alpha, and beta band powers
 */
export function extractAllBandPowers(welchResult: WelchResult): EEGBandPowers {
  return {
    theta: extractThetaPower(welchResult),
    alpha: extractAlphaPower(welchResult),
    beta: extractBetaPower(welchResult),
  };
}

/**
 * Generates a sinusoidal test signal (useful for testing)
 *
 * @param frequency - Frequency in Hz
 * @param samplingRate - Sampling rate in Hz
 * @param duration - Duration in seconds
 * @param amplitude - Amplitude (default 1.0)
 * @returns Array of signal samples
 */
export function generateSineWave(
  frequency: number,
  samplingRate: number,
  duration: number,
  amplitude: number = 1.0
): number[] {
  const numSamples = Math.floor(samplingRate * duration);
  const signal: number[] = new Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / samplingRate;
    signal[i] = amplitude * Math.sin(2 * Math.PI * frequency * t);
  }

  return signal;
}

/**
 * Generates synthetic EEG-like signal for testing
 * Contains theta, alpha, and beta components with realistic amplitudes
 *
 * @param samplingRate - Sampling rate in Hz
 * @param duration - Duration in seconds
 * @param thetaPower - Relative theta power (default 1.0)
 * @param alphaPower - Relative alpha power (default 0.8)
 * @param betaPower - Relative beta power (default 0.5)
 * @returns Array of signal samples
 */
export function generateSyntheticEEG(
  samplingRate: number,
  duration: number,
  thetaPower: number = 1.0,
  alphaPower: number = 0.8,
  betaPower: number = 0.5
): number[] {
  const numSamples = Math.floor(samplingRate * duration);
  const signal: number[] = new Array(numSamples);

  // Typical EEG amplitudes in microvolts
  const baseAmplitude = 20; // µV

  for (let i = 0; i < numSamples; i++) {
    const t = i / samplingRate;

    // Theta (6 Hz center)
    const theta =
      thetaPower *
      baseAmplitude *
      Math.sin(2 * Math.PI * 6 * t + Math.random());

    // Alpha (10 Hz center)
    const alpha =
      alphaPower *
      baseAmplitude *
      0.8 *
      Math.sin(2 * Math.PI * 10 * t + Math.random());

    // Beta (20 Hz center)
    const beta =
      betaPower *
      baseAmplitude *
      0.5 *
      Math.sin(2 * Math.PI * 20 * t + Math.random());

    // Add small amount of noise
    const noise = (Math.random() - 0.5) * baseAmplitude * 0.1;

    signal[i] = theta + alpha + beta + noise;
  }

  return signal;
}
