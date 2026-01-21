/**
 * Signal processing utilities for EEG artifact detection
 * Provides functions to detect various types of artifacts in EEG data
 */

/**
 * Threshold for gradient artifact detection in microvolts per sample
 * Values exceeding this indicate rapid voltage changes typically caused by
 * muscle artifacts, electrode pops, or movement
 */
export const GRADIENT_THRESHOLD_UV = 50;

/**
 * Result of gradient artifact detection analysis
 */
export interface GradientArtifactResult {
  /** True if any gradient violations were detected */
  hasGradientArtifact: boolean;
  /** Percentage of sample transitions that exceeded the threshold (0-100) */
  artifactPercentage: number;
  /** Number of gradient violations detected */
  violationCount: number;
  /** Indices of samples where violations occurred (index of the second sample in each violating pair) */
  violationIndices: number[];
  /** Maximum gradient magnitude found in the data (absolute value in µV) */
  maxGradient: number;
}

/**
 * Detects gradient artifacts in EEG samples
 *
 * Gradient artifacts occur when the voltage change between consecutive samples
 * exceeds a threshold (default: 50 µV per sample). This typically indicates:
 * - Muscle artifacts (EMG contamination)
 * - Electrode pops or movement artifacts
 * - Electrical interference
 *
 * @param samples - Array of EEG voltage samples in microvolts (µV)
 * @returns GradientArtifactResult containing detection results and statistics
 *
 * @example
 * ```typescript
 * const samples = [10, 20, 80, 85, 90]; // 80-20=60µV exceeds threshold
 * const result = detectGradientArtifacts(samples);
 * // result.hasGradientArtifact = true
 * // result.violationIndices = [2]
 * ```
 */
export function detectGradientArtifacts(
  samples: number[]
): GradientArtifactResult {
  // Handle edge cases
  if (!samples || samples.length === 0) {
    return {
      hasGradientArtifact: false,
      artifactPercentage: 0,
      violationCount: 0,
      violationIndices: [],
      maxGradient: 0,
    };
  }

  if (samples.length === 1) {
    return {
      hasGradientArtifact: false,
      artifactPercentage: 0,
      violationCount: 0,
      violationIndices: [],
      maxGradient: 0,
    };
  }

  const violationIndices: number[] = [];
  let maxGradient = 0;

  // Calculate gradients between consecutive samples
  for (let i = 1; i < samples.length; i++) {
    const gradient = Math.abs(samples[i] - samples[i - 1]);

    // Track maximum gradient
    if (gradient > maxGradient) {
      maxGradient = gradient;
    }

    // Check if gradient exceeds threshold
    if (gradient > GRADIENT_THRESHOLD_UV) {
      violationIndices.push(i);
    }
  }

  const violationCount = violationIndices.length;
  const totalTransitions = samples.length - 1;

  // Calculate percentage of transitions that exceeded threshold
  const artifactPercentage =
    totalTransitions > 0 ? (violationCount / totalTransitions) * 100 : 0;

  return {
    hasGradientArtifact: violationCount > 0,
    artifactPercentage,
    violationCount,
    violationIndices,
    maxGradient,
  };
}

/**
 * Detects gradient artifacts with a custom threshold
 *
 * @param samples - Array of EEG voltage samples in microvolts (µV)
 * @param threshold - Custom threshold in µV per sample (default: 50 µV)
 * @returns GradientArtifactResult containing detection results and statistics
 */
export function detectGradientArtifactsWithThreshold(
  samples: number[],
  threshold: number
): GradientArtifactResult {
  // Handle edge cases
  if (!samples || samples.length === 0) {
    return {
      hasGradientArtifact: false,
      artifactPercentage: 0,
      violationCount: 0,
      violationIndices: [],
      maxGradient: 0,
    };
  }

  if (samples.length === 1) {
    return {
      hasGradientArtifact: false,
      artifactPercentage: 0,
      violationCount: 0,
      violationIndices: [],
      maxGradient: 0,
    };
  }

  // Validate threshold
  const effectiveThreshold = threshold > 0 ? threshold : GRADIENT_THRESHOLD_UV;

  const violationIndices: number[] = [];
  let maxGradient = 0;

  // Calculate gradients between consecutive samples
  for (let i = 1; i < samples.length; i++) {
    const gradient = Math.abs(samples[i] - samples[i - 1]);

    // Track maximum gradient
    if (gradient > maxGradient) {
      maxGradient = gradient;
    }

    // Check if gradient exceeds threshold
    if (gradient > effectiveThreshold) {
      violationIndices.push(i);
    }
  }

  const violationCount = violationIndices.length;
  const totalTransitions = samples.length - 1;

  // Calculate percentage of transitions that exceeded threshold
  const artifactPercentage =
    totalTransitions > 0 ? (violationCount / totalTransitions) * 100 : 0;

  return {
    hasGradientArtifact: violationCount > 0,
    artifactPercentage,
    violationCount,
    violationIndices,
    maxGradient,
  };
}

/**
 * Calculates all gradients in the sample array
 * Useful for visualization and debugging
 *
 * @param samples - Array of EEG voltage samples in microvolts (µV)
 * @returns Array of absolute gradient values between consecutive samples
 */
export function calculateGradients(samples: number[]): number[] {
  if (!samples || samples.length < 2) {
    return [];
  }

  const gradients: number[] = [];
  for (let i = 1; i < samples.length; i++) {
    gradients.push(Math.abs(samples[i] - samples[i - 1]));
  }

  return gradients;
}

/**
 * Checks if a single gradient value exceeds the threshold
 *
 * @param gradient - Absolute gradient value in µV
 * @param threshold - Optional custom threshold (default: 50 µV)
 * @returns True if gradient exceeds threshold
 */
export function isGradientArtifact(
  gradient: number,
  threshold: number = GRADIENT_THRESHOLD_UV
): boolean {
  return Math.abs(gradient) > threshold;
}
