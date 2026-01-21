/**
 * Signal Processing Utilities for FlowState BCI
 *
 * This module provides signal processing functions for EEG data analysis,
 * including FFT-based frequency band power calculation and artifact detection.
 */

/**
 * Frequency band definitions in Hz for EEG analysis
 */
export const FrequencyBands = {
  /** Delta band: 0.5-4 Hz (deep sleep) */
  delta: { low: 0.5, high: 4 },
  /** Theta band: 4-8 Hz (memory, attention, meditation) */
  theta: { low: 4, high: 8 },
  /** Alpha band: 8-13 Hz (relaxed wakefulness) */
  alpha: { low: 8, high: 13 },
  /** Beta band: 13-30 Hz (active thinking, concentration) */
  beta: { low: 13, high: 30 },
  /** Gamma band: 30-50 Hz (high cognitive functions, also artifact-prone) */
  gamma: { low: 30, high: 50 },
  /** Low frequency band for ratio calculation: 4-30 Hz */
  lowFrequency: { low: 4, high: 30 },
  /** High frequency band for ratio calculation: 30-50 Hz (muscle/EMG artifacts) */
  highFrequency: { low: 30, high: 50 },
} as const;

/**
 * Default threshold for frequency ratio artifact detection
 * Ratio of high frequency (30-50 Hz) to low frequency (4-30 Hz) power
 * Values > 2.0 typically indicate muscle artifact contamination
 */
export const FREQUENCY_RATIO_ARTIFACT_THRESHOLD = 2.0;

/**
 * Result of frequency ratio artifact detection
 */
export interface FrequencyRatioResult {
  /** Power in the high frequency band (30-50 Hz) */
  highFrequencyPower: number;
  /** Power in the low frequency band (4-30 Hz) */
  lowFrequencyPower: number;
  /** Ratio of high to low frequency power */
  ratio: number;
  /** Whether an artifact was detected (ratio > threshold) */
  hasArtifact: boolean;
  /** The threshold used for detection */
  threshold: number;
}

/**
 * Compute the Fast Fourier Transform (FFT) of a real-valued signal.
 * Returns the magnitude spectrum (absolute values of FFT coefficients).
 *
 * This is a simple radix-2 Cooley-Tukey FFT implementation.
 * For production use, consider using a more optimized library.
 *
 * @param signal - Input signal array (real values)
 * @returns Complex FFT result as [real, imaginary] pairs
 */
export function fft(signal: number[]): Array<[number, number]> {
  const n = signal.length;

  // Base case
  if (n === 1) {
    return [[signal[0], 0]];
  }

  // Pad to next power of 2 if needed
  const nextPow2 = Math.pow(2, Math.ceil(Math.log2(n)));
  if (n !== nextPow2) {
    const padded = new Array(nextPow2).fill(0);
    for (let i = 0; i < n; i++) {
      padded[i] = signal[i];
    }
    return fft(padded);
  }

  // Split into even and odd indices
  const even: number[] = [];
  const odd: number[] = [];
  for (let i = 0; i < n; i += 2) {
    even.push(signal[i]);
    odd.push(signal[i + 1]);
  }

  // Recursive FFT
  const evenFFT = fft(even);
  const oddFFT = fft(odd);

  // Combine results
  const result: Array<[number, number]> = new Array(n);
  for (let k = 0; k < n / 2; k++) {
    const angle = (-2 * Math.PI * k) / n;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    // Twiddle factor multiplication
    const tReal = cos * oddFFT[k][0] - sin * oddFFT[k][1];
    const tImag = cos * oddFFT[k][1] + sin * oddFFT[k][0];

    result[k] = [evenFFT[k][0] + tReal, evenFFT[k][1] + tImag];
    result[k + n / 2] = [evenFFT[k][0] - tReal, evenFFT[k][1] - tImag];
  }

  return result;
}

/**
 * Compute the power spectrum from an FFT result.
 * Power is calculated as the squared magnitude of each frequency component.
 *
 * @param fftResult - Complex FFT result as [real, imaginary] pairs
 * @returns Power values for each frequency bin
 */
export function computePowerSpectrum(
  fftResult: Array<[number, number]>
): number[] {
  return fftResult.map(([real, imag]) => real * real + imag * imag);
}

/**
 * Get the frequency values corresponding to each FFT bin.
 *
 * @param numSamples - Number of samples in the original signal
 * @param samplingRate - Sampling rate in Hz
 * @returns Array of frequency values in Hz for each bin
 */
export function getFrequencyBins(
  numSamples: number,
  samplingRate: number
): number[] {
  const frequencies: number[] = [];
  const binWidth = samplingRate / numSamples;

  for (let i = 0; i < numSamples; i++) {
    frequencies.push(i * binWidth);
  }

  return frequencies;
}

/**
 * Calculate the power in a specific frequency band.
 *
 * @param powerSpectrum - Power spectrum values
 * @param frequencies - Frequency bin values in Hz
 * @param lowFreq - Lower bound of the frequency band in Hz
 * @param highFreq - Upper bound of the frequency band in Hz
 * @returns Sum of power in the specified frequency band
 */
export function calculateBandPower(
  powerSpectrum: number[],
  frequencies: number[],
  lowFreq: number,
  highFreq: number
): number {
  let power = 0;
  let count = 0;

  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] >= lowFreq && frequencies[i] <= highFreq) {
      power += powerSpectrum[i];
      count++;
    }
  }

  // Return mean power in the band (avoids bias from different band widths)
  return count > 0 ? power / count : 0;
}

/**
 * Detect frequency ratio artifacts in EEG data.
 *
 * This function calculates the ratio of power in the high frequency band (30-50 Hz)
 * to power in the low frequency band (4-30 Hz). A ratio greater than 2.0 typically
 * indicates muscle artifact contamination (EMG interference).
 *
 * High frequency (30-50 Hz) activity in clean EEG is normally much lower than
 * low frequency (4-30 Hz) activity. When muscle activity contaminates the signal,
 * it adds broadband power that is especially prominent in higher frequencies.
 *
 * @param samples - EEG data samples (voltage values)
 * @param samplingRate - Sampling rate in Hz (e.g., 200, 250, 500)
 * @param threshold - Ratio threshold for artifact detection (default: 2.0)
 * @returns FrequencyRatioResult with power values, ratio, and artifact flag
 *
 * @example
 * ```typescript
 * const eegData = [...]; // 2 seconds of EEG at 200 Hz (400 samples)
 * const result = detectFrequencyRatioArtifact(eegData, 200);
 * if (result.hasArtifact) {
 *   console.log(`Artifact detected! Ratio: ${result.ratio}`);
 * }
 * ```
 */
export function detectFrequencyRatioArtifact(
  samples: number[],
  samplingRate: number,
  threshold: number = FREQUENCY_RATIO_ARTIFACT_THRESHOLD
): FrequencyRatioResult {
  // Validate inputs
  if (samples.length < 4) {
    return {
      highFrequencyPower: 0,
      lowFrequencyPower: 0,
      ratio: 0,
      hasArtifact: false,
      threshold,
    };
  }

  // Check if sampling rate allows us to measure the required frequencies
  // Nyquist frequency must be at least 50 Hz to measure 30-50 Hz band
  const nyquistFreq = samplingRate / 2;
  if (nyquistFreq < FrequencyBands.highFrequency.high) {
    // Cannot accurately measure 30-50 Hz band
    return {
      highFrequencyPower: 0,
      lowFrequencyPower: 0,
      ratio: 0,
      hasArtifact: false,
      threshold,
    };
  }

  // Remove DC offset (mean)
  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  const centeredSamples = samples.map((s) => s - mean);

  // Compute FFT
  const fftResult = fft(centeredSamples);

  // Compute power spectrum
  const powerSpectrum = computePowerSpectrum(fftResult);

  // Get frequency bins
  const frequencies = getFrequencyBins(fftResult.length, samplingRate);

  // Calculate power in low frequency band (4-30 Hz)
  const lowFrequencyPower = calculateBandPower(
    powerSpectrum,
    frequencies,
    FrequencyBands.lowFrequency.low,
    FrequencyBands.lowFrequency.high
  );

  // Calculate power in high frequency band (30-50 Hz)
  const highFrequencyPower = calculateBandPower(
    powerSpectrum,
    frequencies,
    FrequencyBands.highFrequency.low,
    FrequencyBands.highFrequency.high
  );

  // Calculate ratio (avoid division by zero)
  const ratio =
    lowFrequencyPower > 0 ? highFrequencyPower / lowFrequencyPower : 0;

  // Determine if artifact is present
  const hasArtifact = ratio > threshold;

  return {
    highFrequencyPower,
    lowFrequencyPower,
    ratio,
    hasArtifact,
    threshold,
  };
}

/**
 * Generate a simple sine wave for testing purposes.
 *
 * @param frequency - Frequency of the sine wave in Hz
 * @param samplingRate - Sampling rate in Hz
 * @param duration - Duration in seconds
 * @param amplitude - Amplitude of the wave (default: 1.0)
 * @returns Array of samples
 */
export function generateSineWave(
  frequency: number,
  samplingRate: number,
  duration: number,
  amplitude: number = 1.0
): number[] {
  const numSamples = Math.floor(samplingRate * duration);
  const samples: number[] = [];

  for (let i = 0; i < numSamples; i++) {
    const t = i / samplingRate;
    samples.push(amplitude * Math.sin(2 * Math.PI * frequency * t));
  }

  return samples;
}

/**
 * Generate synthetic EEG-like data with controllable frequency components.
 * Useful for testing artifact detection algorithms.
 *
 * @param samplingRate - Sampling rate in Hz
 * @param duration - Duration in seconds
 * @param options - Amplitude options for different frequency components
 * @returns Array of samples
 */
export function generateSyntheticEEG(
  samplingRate: number,
  duration: number,
  options: {
    thetaAmplitude?: number;
    alphaAmplitude?: number;
    betaAmplitude?: number;
    gammaAmplitude?: number;
    noiseAmplitude?: number;
  } = {}
): number[] {
  const {
    thetaAmplitude = 15.0,
    alphaAmplitude = 10.0,
    betaAmplitude = 5.0,
    gammaAmplitude = 2.0,
    noiseAmplitude = 3.0,
  } = options;

  const numSamples = Math.floor(samplingRate * duration);
  const samples: number[] = new Array(numSamples).fill(0);

  // Add theta (6 Hz)
  const theta = generateSineWave(6, samplingRate, duration, thetaAmplitude);

  // Add alpha (10 Hz)
  const alpha = generateSineWave(10, samplingRate, duration, alphaAmplitude);

  // Add beta (20 Hz)
  const beta = generateSineWave(20, samplingRate, duration, betaAmplitude);

  // Add gamma (40 Hz)
  const gamma = generateSineWave(40, samplingRate, duration, gammaAmplitude);

  // Combine signals
  for (let i = 0; i < numSamples; i++) {
    samples[i] = theta[i] + alpha[i] + beta[i] + gamma[i];
    // Add random noise
    samples[i] += (Math.random() - 0.5) * 2 * noiseAmplitude;
  }

  return samples;
}
