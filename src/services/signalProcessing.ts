// Signal processing utilities for FlowState BCI application
// Provides artifact detection and signal quality analysis for EEG data

import type { EEGDataPacket, SignalQuality } from '../types';

/**
 * Default threshold for amplitude artifact detection in microvolts (µV)
 * Values exceeding ±100 µV are typically considered artifacts in EEG
 */
export const DEFAULT_AMPLITUDE_THRESHOLD_UV = 100;

/**
 * Result of amplitude artifact detection
 */
export interface AmplitudeArtifactResult {
  /** Whether any samples exceeded the amplitude threshold */
  hasArtifact: boolean;
  /** Number of samples that exceeded the threshold */
  artifactSampleCount: number;
  /** Total number of samples analyzed */
  totalSampleCount: number;
  /** Percentage of samples that were artifacts (0-100) */
  artifactPercentage: number;
  /** Maximum absolute amplitude found in the samples */
  maxAmplitude: number;
  /** Minimum amplitude found in the samples (can be negative) */
  minAmplitude: number;
  /** Indices of samples that exceeded the threshold */
  artifactIndices: number[];
}

/**
 * Detects amplitude artifacts in EEG samples
 *
 * An amplitude artifact occurs when a sample exceeds the threshold value (±100 µV by default).
 * This is a common indicator of movement artifacts, muscle artifacts, or electrode issues.
 *
 * @param samples - Array of voltage samples in microvolts (µV)
 * @param thresholdUv - Amplitude threshold in microvolts (default: 100 µV)
 * @returns AmplitudeArtifactResult containing detection results and statistics
 *
 * @example
 * ```typescript
 * const samples = [50, -30, 120, 45, -110, 60]; // µV values
 * const result = detectAmplitudeArtifacts(samples);
 * // result.hasArtifact === true (120 and -110 exceed ±100 µV)
 * // result.artifactSampleCount === 2
 * // result.artifactIndices === [2, 4]
 * ```
 */
export function detectAmplitudeArtifacts(
  samples: number[],
  thresholdUv: number = DEFAULT_AMPLITUDE_THRESHOLD_UV
): AmplitudeArtifactResult {
  // Handle empty samples array
  if (samples.length === 0) {
    return {
      hasArtifact: false,
      artifactSampleCount: 0,
      totalSampleCount: 0,
      artifactPercentage: 0,
      maxAmplitude: 0,
      minAmplitude: 0,
      artifactIndices: [],
    };
  }

  const artifactIndices: number[] = [];
  let maxAmplitude = samples[0];
  let minAmplitude = samples[0];

  // Scan through all samples
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];

    // Track min/max
    if (sample > maxAmplitude) {
      maxAmplitude = sample;
    }
    if (sample < minAmplitude) {
      minAmplitude = sample;
    }

    // Check if sample exceeds threshold (either positive or negative)
    if (Math.abs(sample) > thresholdUv) {
      artifactIndices.push(i);
    }
  }

  const artifactSampleCount = artifactIndices.length;
  const totalSampleCount = samples.length;
  const artifactPercentage = (artifactSampleCount / totalSampleCount) * 100;

  return {
    hasArtifact: artifactSampleCount > 0,
    artifactSampleCount,
    totalSampleCount,
    artifactPercentage,
    maxAmplitude,
    minAmplitude,
    artifactIndices,
  };
}

/**
 * Detects amplitude artifacts in an EEG data packet
 *
 * Convenience wrapper that extracts samples from an EEGDataPacket
 * and performs amplitude artifact detection.
 *
 * @param packet - EEG data packet containing samples
 * @param thresholdUv - Amplitude threshold in microvolts (default: 100 µV)
 * @returns AmplitudeArtifactResult containing detection results
 */
export function detectAmplitudeArtifactsInPacket(
  packet: EEGDataPacket,
  thresholdUv: number = DEFAULT_AMPLITUDE_THRESHOLD_UV
): AmplitudeArtifactResult {
  return detectAmplitudeArtifacts(packet.samples, thresholdUv);
}

/**
 * Detects amplitude artifacts across multiple consecutive packets (sliding window)
 *
 * Useful for analyzing signal quality over a time window (e.g., 2-4 seconds).
 *
 * @param packets - Array of EEG data packets
 * @param thresholdUv - Amplitude threshold in microvolts (default: 100 µV)
 * @returns AmplitudeArtifactResult for the combined samples
 */
export function detectAmplitudeArtifactsInWindow(
  packets: EEGDataPacket[],
  thresholdUv: number = DEFAULT_AMPLITUDE_THRESHOLD_UV
): AmplitudeArtifactResult {
  // Combine all samples from all packets
  const allSamples: number[] = [];
  for (const packet of packets) {
    allSamples.push(...packet.samples);
  }

  return detectAmplitudeArtifacts(allSamples, thresholdUv);
}

/**
 * Creates a partial SignalQuality object with amplitude artifact information
 *
 * This can be merged with other artifact detection results to build
 * the complete SignalQuality object.
 *
 * @param result - Result from amplitude artifact detection
 * @returns Partial SignalQuality with amplitude-related fields populated
 */
export function createAmplitudeSignalQuality(
  result: AmplitudeArtifactResult
): Pick<SignalQuality, 'has_amplitude_artifact' | 'artifact_percentage'> {
  return {
    has_amplitude_artifact: result.hasArtifact,
    artifact_percentage: result.artifactPercentage,
  };
}

/**
 * Checks if a single sample exceeds the amplitude threshold
 *
 * Utility function for real-time sample-by-sample analysis.
 *
 * @param sample - Single voltage sample in microvolts (µV)
 * @param thresholdUv - Amplitude threshold in microvolts (default: 100 µV)
 * @returns true if the sample exceeds the threshold
 */
export function isAmplitudeArtifact(
  sample: number,
  thresholdUv: number = DEFAULT_AMPLITUDE_THRESHOLD_UV
): boolean {
  return Math.abs(sample) > thresholdUv;
}

/**
 * Validates that the threshold is a positive number
 *
 * @param thresholdUv - Threshold value to validate
 * @returns true if threshold is valid (positive number)
 */
export function isValidThreshold(thresholdUv: number): boolean {
  return (
    typeof thresholdUv === 'number' && thresholdUv > 0 && isFinite(thresholdUv)
  );
}

/**
 * Clamps samples to the threshold range
 *
 * Useful for cleaning data by limiting extreme values to the threshold bounds.
 * Note: This modifies artifacts rather than detecting them - use with caution.
 *
 * @param samples - Array of voltage samples in microvolts
 * @param thresholdUv - Amplitude threshold in microvolts (default: 100 µV)
 * @returns New array with samples clamped to [-threshold, +threshold]
 */
export function clampSamplesToThreshold(
  samples: number[],
  thresholdUv: number = DEFAULT_AMPLITUDE_THRESHOLD_UV
): number[] {
  return samples.map((sample) =>
    Math.max(-thresholdUv, Math.min(thresholdUv, sample))
  );
}
