/**
 * Band Power Extraction for EEG Signal Processing
 *
 * Extracts power from specific frequency bands:
 * - Theta: 4-8 Hz (associated with deep relaxation, creativity, flow states)
 * - Alpha: 8-13 Hz (associated with relaxed awareness, calm focus)
 * - Beta: 13-30 Hz (associated with active thinking, concentration)
 */

/**
 * Frequency band definitions in Hz
 */
export const FrequencyBands = {
  theta: { low: 4, high: 8 },
  alpha: { low: 8, high: 13 },
  beta: { low: 13, high: 30 },
} as const;

export type FrequencyBandName = keyof typeof FrequencyBands;

/**
 * Result of band power extraction containing power values for each band
 */
export interface BandPowerResult {
  theta: number;
  alpha: number;
  beta: number;
  total: number;
}

/**
 * Result of relative band power extraction (percentages)
 */
export interface RelativeBandPowerResult {
  theta: number;
  alpha: number;
  beta: number;
  thetaAlphaRatio: number;
  thetaBetaRatio: number;
  alphaBetaRatio: number;
}

/**
 * Power spectrum data point
 */
export interface PowerSpectrumPoint {
  frequency: number;
  power: number;
}

/**
 * Calculate the frequency resolution (bin width) from a power spectrum
 *
 * @param frequencies - Array of frequency values from power spectrum
 * @returns Frequency resolution in Hz
 */
export function calculateFrequencyResolution(frequencies: number[]): number {
  if (frequencies.length < 2) {
    throw new Error(
      'At least 2 frequency points required to calculate resolution'
    );
  }
  return frequencies[1] - frequencies[0];
}

/**
 * Extract band power from a power spectrum using trapezoidal integration
 *
 * Integrates the power spectral density over the specified frequency range.
 * Uses trapezoidal rule for numerical integration to provide accurate results.
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @param lowFreq - Lower frequency bound of the band (Hz)
 * @param highFreq - Upper frequency bound of the band (Hz)
 * @returns Band power in µV²
 */
export function extractBandPower(
  frequencies: number[],
  powerValues: number[],
  lowFreq: number,
  highFreq: number
): number {
  if (frequencies.length !== powerValues.length) {
    throw new Error('Frequencies and power values must have the same length');
  }

  if (frequencies.length === 0) {
    throw new Error('Empty frequency array');
  }

  if (lowFreq >= highFreq) {
    throw new Error('Low frequency must be less than high frequency');
  }

  // Find indices within the frequency band
  const bandIndices: number[] = [];
  for (let i = 0; i < frequencies.length; i++) {
    if (frequencies[i] >= lowFreq && frequencies[i] <= highFreq) {
      bandIndices.push(i);
    }
  }

  if (bandIndices.length === 0) {
    // No frequencies in the band - return 0
    return 0;
  }

  if (bandIndices.length === 1) {
    // Only one point in band - estimate using frequency resolution
    const resolution = calculateFrequencyResolution(frequencies);
    return powerValues[bandIndices[0]] * resolution;
  }

  // Trapezoidal integration over the band
  let power = 0;
  for (let i = 0; i < bandIndices.length - 1; i++) {
    const idx1 = bandIndices[i];
    const idx2 = bandIndices[i + 1];
    const df = frequencies[idx2] - frequencies[idx1];
    const avgPower = (powerValues[idx1] + powerValues[idx2]) / 2;
    power += avgPower * df;
  }

  return power;
}

/**
 * Extract power from a specific named frequency band
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @param bandName - Name of the frequency band ('theta', 'alpha', or 'beta')
 * @returns Band power in µV²
 */
export function extractNamedBandPower(
  frequencies: number[],
  powerValues: number[],
  bandName: FrequencyBandName
): number {
  const band = FrequencyBands[bandName];
  return extractBandPower(frequencies, powerValues, band.low, band.high);
}

/**
 * Extract theta band (4-8 Hz) power from a power spectrum
 *
 * Theta waves are associated with:
 * - Deep relaxation and meditation
 * - Creativity and insight
 * - Flow states and enhanced learning
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @returns Theta band power in µV²
 */
export function extractThetaPower(
  frequencies: number[],
  powerValues: number[]
): number {
  return extractBandPower(
    frequencies,
    powerValues,
    FrequencyBands.theta.low,
    FrequencyBands.theta.high
  );
}

/**
 * Extract alpha band (8-13 Hz) power from a power spectrum
 *
 * Alpha waves are associated with:
 * - Relaxed awareness
 * - Calm, alert mental state
 * - Reduced anxiety
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @returns Alpha band power in µV²
 */
export function extractAlphaPower(
  frequencies: number[],
  powerValues: number[]
): number {
  return extractBandPower(
    frequencies,
    powerValues,
    FrequencyBands.alpha.low,
    FrequencyBands.alpha.high
  );
}

/**
 * Extract beta band (13-30 Hz) power from a power spectrum
 *
 * Beta waves are associated with:
 * - Active thinking and concentration
 * - Alert, focused mental state
 * - Problem-solving and analysis
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @returns Beta band power in µV²
 */
export function extractBetaPower(
  frequencies: number[],
  powerValues: number[]
): number {
  return extractBandPower(
    frequencies,
    powerValues,
    FrequencyBands.beta.low,
    FrequencyBands.beta.high
  );
}

/**
 * Extract power from all three bands (theta, alpha, beta) in a single pass
 *
 * More efficient than calling individual functions when you need all three.
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @returns Object containing theta, alpha, beta, and total power values
 */
export function extractAllBandPowers(
  frequencies: number[],
  powerValues: number[]
): BandPowerResult {
  const theta = extractThetaPower(frequencies, powerValues);
  const alpha = extractAlphaPower(frequencies, powerValues);
  const beta = extractBetaPower(frequencies, powerValues);
  const total = theta + alpha + beta;

  return { theta, alpha, beta, total };
}

/**
 * Calculate relative band powers as percentages of total power
 *
 * Useful for comparing the balance between different frequency bands
 * independent of overall signal amplitude.
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @returns Object containing relative powers (0-1) and band ratios
 */
export function extractRelativeBandPowers(
  frequencies: number[],
  powerValues: number[]
): RelativeBandPowerResult {
  const { theta, alpha, beta, total } = extractAllBandPowers(
    frequencies,
    powerValues
  );

  // Avoid division by zero
  if (total === 0) {
    return {
      theta: 0,
      alpha: 0,
      beta: 0,
      thetaAlphaRatio: 0,
      thetaBetaRatio: 0,
      alphaBetaRatio: 0,
    };
  }

  return {
    theta: theta / total,
    alpha: alpha / total,
    beta: beta / total,
    thetaAlphaRatio: alpha > 0 ? theta / alpha : 0,
    thetaBetaRatio: beta > 0 ? theta / beta : 0,
    alphaBetaRatio: beta > 0 ? alpha / beta : 0,
  };
}

/**
 * Find the peak frequency within a specific band
 *
 * Useful for identifying the dominant frequency in a band,
 * e.g., finding the peak theta frequency for personalized entrainment.
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @param lowFreq - Lower frequency bound of the band (Hz)
 * @param highFreq - Upper frequency bound of the band (Hz)
 * @returns Peak frequency in Hz, or null if no data in band
 */
export function findPeakFrequency(
  frequencies: number[],
  powerValues: number[],
  lowFreq: number,
  highFreq: number
): number | null {
  if (frequencies.length !== powerValues.length) {
    throw new Error('Frequencies and power values must have the same length');
  }

  let maxPower = -Infinity;
  let peakFreq: number | null = null;

  for (let i = 0; i < frequencies.length; i++) {
    if (
      frequencies[i] >= lowFreq &&
      frequencies[i] <= highFreq &&
      powerValues[i] > maxPower
    ) {
      maxPower = powerValues[i];
      peakFreq = frequencies[i];
    }
  }

  return peakFreq;
}

/**
 * Find the peak theta frequency (4-8 Hz)
 *
 * @param frequencies - Array of frequency values (Hz) from power spectrum
 * @param powerValues - Array of power spectral density values (µV²/Hz)
 * @returns Peak theta frequency in Hz, or null if no data in band
 */
export function findPeakThetaFrequency(
  frequencies: number[],
  powerValues: number[]
): number | null {
  return findPeakFrequency(
    frequencies,
    powerValues,
    FrequencyBands.theta.low,
    FrequencyBands.theta.high
  );
}

/**
 * Calculate band power from raw EEG data using simple FFT approach
 *
 * This is a convenience function that computes the FFT and extracts
 * band powers in a single step. For real-time processing with sliding
 * windows, consider using Welch's method instead (more robust to noise).
 *
 * @param samples - Raw EEG samples in µV
 * @param samplingRate - Sampling rate in Hz
 * @returns Band power results for all three bands
 */
export function computeBandPowerFromSamples(
  samples: number[],
  samplingRate: number
): BandPowerResult {
  const n = samples.length;
  if (n === 0) {
    return { theta: 0, alpha: 0, beta: 0, total: 0 };
  }

  // Compute FFT using DFT (for simplicity - in production use FFT library)
  const { frequencies, powerSpectrum } = computePowerSpectrum(
    samples,
    samplingRate
  );

  return extractAllBandPowers(frequencies, powerSpectrum);
}

/**
 * Compute power spectrum from time-domain samples using DFT
 *
 * Note: This is a simple implementation for demonstration.
 * For production use, consider using a proper FFT library for efficiency.
 *
 * @param samples - Time-domain samples
 * @param samplingRate - Sampling rate in Hz
 * @returns Frequencies and corresponding power spectrum values
 */
export function computePowerSpectrum(
  samples: number[],
  samplingRate: number
): { frequencies: number[]; powerSpectrum: number[] } {
  const n = samples.length;
  if (n === 0) {
    return { frequencies: [], powerSpectrum: [] };
  }

  // Apply Hanning window to reduce spectral leakage
  const windowed = applyHanningWindow(samples);

  // Compute one-sided power spectrum
  const freqResolution = samplingRate / n;
  const numBins = Math.floor(n / 2) + 1;

  const frequencies: number[] = [];
  const powerSpectrum: number[] = [];

  for (let k = 0; k < numBins; k++) {
    frequencies.push(k * freqResolution);

    // Compute DFT for this frequency bin
    let real = 0;
    let imag = 0;
    for (let t = 0; t < n; t++) {
      const angle = (2 * Math.PI * k * t) / n;
      real += windowed[t] * Math.cos(angle);
      imag -= windowed[t] * Math.sin(angle);
    }

    // Power spectral density (normalized by N and sampling rate)
    const magnitude = Math.sqrt(real * real + imag * imag) / n;
    // Convert to power (µV² per Hz)
    let power = (2 * magnitude * magnitude) / freqResolution;

    // DC and Nyquist components should not be doubled
    if (k === 0 || k === numBins - 1) {
      power /= 2;
    }

    powerSpectrum.push(power);
  }

  return { frequencies, powerSpectrum };
}

/**
 * Apply Hanning window to reduce spectral leakage in FFT
 *
 * @param samples - Input samples
 * @returns Windowed samples
 */
export function applyHanningWindow(samples: number[]): number[] {
  const n = samples.length;
  const windowed = new Array(n);

  for (let i = 0; i < n; i++) {
    const windowValue = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (n - 1)));
    windowed[i] = samples[i] * windowValue;
  }

  return windowed;
}

/**
 * Calculate the mean band power over multiple epochs
 *
 * Useful for calculating baseline statistics from calibration data.
 *
 * @param epochResults - Array of band power results from multiple epochs
 * @returns Mean band power for each band
 */
export function calculateMeanBandPower(
  epochResults: BandPowerResult[]
): BandPowerResult {
  if (epochResults.length === 0) {
    return { theta: 0, alpha: 0, beta: 0, total: 0 };
  }

  const sum = epochResults.reduce(
    (acc, result) => ({
      theta: acc.theta + result.theta,
      alpha: acc.alpha + result.alpha,
      beta: acc.beta + result.beta,
      total: acc.total + result.total,
    }),
    { theta: 0, alpha: 0, beta: 0, total: 0 }
  );

  const n = epochResults.length;
  return {
    theta: sum.theta / n,
    alpha: sum.alpha / n,
    beta: sum.beta / n,
    total: sum.total / n,
  };
}

/**
 * Calculate standard deviation of band power over multiple epochs
 *
 * Useful for calculating baseline statistics for z-score normalization.
 *
 * @param epochResults - Array of band power results from multiple epochs
 * @returns Standard deviation of band power for each band
 */
export function calculateStdBandPower(
  epochResults: BandPowerResult[]
): BandPowerResult {
  if (epochResults.length < 2) {
    return { theta: 0, alpha: 0, beta: 0, total: 0 };
  }

  const mean = calculateMeanBandPower(epochResults);
  const n = epochResults.length;

  const sumSquaredDiff = epochResults.reduce(
    (acc, result) => ({
      theta: acc.theta + Math.pow(result.theta - mean.theta, 2),
      alpha: acc.alpha + Math.pow(result.alpha - mean.alpha, 2),
      beta: acc.beta + Math.pow(result.beta - mean.beta, 2),
      total: acc.total + Math.pow(result.total - mean.total, 2),
    }),
    { theta: 0, alpha: 0, beta: 0, total: 0 }
  );

  // Use n-1 for sample standard deviation
  return {
    theta: Math.sqrt(sumSquaredDiff.theta / (n - 1)),
    alpha: Math.sqrt(sumSquaredDiff.alpha / (n - 1)),
    beta: Math.sqrt(sumSquaredDiff.beta / (n - 1)),
    total: Math.sqrt(sumSquaredDiff.total / (n - 1)),
  };
}
