/**
 * Signal processing utilities for EEG data
 * Provides functions for preprocessing, filtering, and analysis of EEG signals
 */

/**
 * Calculates the mean (DC offset) of an EEG signal epoch
 *
 * @param samples - Array of EEG samples
 * @returns The mean value (DC offset) of the signal
 * @throws Error if samples array is empty
 */
export const calculateDCOffset = (samples: number[]): number => {
  if (samples.length === 0) {
    throw new Error('Cannot calculate DC offset of empty samples array');
  }

  const sum = samples.reduce((acc, val) => acc + val, 0);
  return sum / samples.length;
};

/**
 * Removes DC offset from EEG signal epoch
 *
 * DC offset is the mean value of the signal and must be removed before
 * frequency domain analysis to prevent spectral leakage. This is a fundamental
 * preprocessing step in EEG signal processing.
 *
 * The function subtracts the mean value from each sample, resulting in a
 * zero-mean signal that is suitable for further processing like FFT.
 *
 * @param samples - Array of raw EEG samples
 * @returns Array of DC-offset corrected samples (zero-mean signal)
 * @throws Error if samples array is empty
 *
 * @example
 * const rawSamples = [100.5, 101.2, 99.8, 100.1];
 * const corrected = removeDCOffset(rawSamples);
 * // corrected will have mean ≈ 0
 */
export const removeDCOffset = (samples: number[]): number[] => {
  if (samples.length === 0) {
    throw new Error('Cannot remove DC offset from empty samples array');
  }

  const dcOffset = calculateDCOffset(samples);
  return samples.map((sample) => sample - dcOffset);
};

/**
 * Removes DC offset from EEG signal epoch in-place for performance
 *
 * This variant modifies the input array directly, avoiding allocation
 * of a new array. Useful for real-time processing where memory allocation
 * overhead needs to be minimized.
 *
 * @param samples - Array of raw EEG samples (will be modified in-place)
 * @returns The DC offset value that was removed
 * @throws Error if samples array is empty
 *
 * @example
 * const samples = [100.5, 101.2, 99.8, 100.1];
 * const dcOffset = removeDCOffsetInPlace(samples);
 * // samples is now modified to have mean ≈ 0
 */
export const removeDCOffsetInPlace = (samples: number[]): number => {
  if (samples.length === 0) {
    throw new Error('Cannot remove DC offset from empty samples array');
  }

  const dcOffset = calculateDCOffset(samples);
  for (let i = 0; i < samples.length; i++) {
    samples[i] -= dcOffset;
  }
  return dcOffset;
};

/**
 * Removes DC offset using a baseline segment of the signal
 *
 * Instead of using the mean of the entire epoch, this function uses
 * a specified baseline period (typically the start of the epoch) to
 * calculate the DC offset. This is useful for event-related potential
 * (ERP) analysis where the baseline period represents the pre-stimulus
 * activity.
 *
 * @param samples - Array of raw EEG samples
 * @param baselineStart - Start index of the baseline period (inclusive)
 * @param baselineEnd - End index of the baseline period (exclusive)
 * @returns Array of baseline-corrected samples
 * @throws Error if samples array is empty
 * @throws Error if baseline indices are invalid
 *
 * @example
 * const samples = [100.5, 101.2, 99.8, 100.1, 105.0, 106.2];
 * // Use first 4 samples as baseline
 * const corrected = removeDCOffsetWithBaseline(samples, 0, 4);
 */
export const removeDCOffsetWithBaseline = (
  samples: number[],
  baselineStart: number,
  baselineEnd: number
): number[] => {
  if (samples.length === 0) {
    throw new Error('Cannot remove DC offset from empty samples array');
  }

  if (baselineStart < 0) {
    throw new Error('Baseline start index cannot be negative');
  }

  if (baselineEnd > samples.length) {
    throw new Error('Baseline end index cannot exceed samples length');
  }

  if (baselineStart >= baselineEnd) {
    throw new Error('Baseline start must be less than baseline end');
  }

  const baselineSamples = samples.slice(baselineStart, baselineEnd);
  const dcOffset = calculateDCOffset(baselineSamples);
  return samples.map((sample) => sample - dcOffset);
};
