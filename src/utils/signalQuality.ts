/**
 * Signal Quality Score Calculator
 *
 * Calculates a 0-100 quality score based on artifact percentage.
 * Used to assess EEG signal reliability in real-time.
 */

import { SignalQuality } from '../types';

/**
 * Artifact detection thresholds (from PRD)
 */
export const ARTIFACT_THRESHOLDS = {
  /** Amplitude artifact threshold in microvolts */
  AMPLITUDE_UV: 100,
  /** Gradient artifact threshold in microvolts per sample */
  GRADIENT_UV_PER_SAMPLE: 50,
  /** Frequency ratio threshold (30-50 Hz vs 4-30 Hz) */
  FREQUENCY_RATIO: 2.0,
} as const;

/**
 * Signal quality score thresholds for application behavior
 */
export const QUALITY_THRESHOLDS = {
  /** Auto-pause calibration when quality falls below this */
  AUTO_PAUSE: 20,
  /** Prompt recalibration when quality is below this */
  RECALIBRATION_PROMPT: 50,
  /** Minimum acceptable quality for reliable data */
  MINIMUM_ACCEPTABLE: 70,
  /** Excellent signal quality */
  EXCELLENT: 90,
} as const;

/**
 * Calculates signal quality score (0-100) from artifact percentage.
 *
 * The score is inversely proportional to artifact percentage:
 * - 0% artifacts = 100 score (perfect signal)
 * - 100% artifacts = 0 score (unusable signal)
 *
 * @param artifactPercentage - Percentage of data containing artifacts (0-100)
 * @returns Quality score from 0 to 100
 * @throws Error if artifactPercentage is outside valid range
 */
export function calculateSignalQualityScore(
  artifactPercentage: number
): number {
  if (artifactPercentage < 0 || artifactPercentage > 100) {
    throw new Error(
      `Invalid artifact percentage: ${artifactPercentage}. Must be between 0 and 100.`
    );
  }

  if (!Number.isFinite(artifactPercentage)) {
    throw new Error(
      `Invalid artifact percentage: ${artifactPercentage}. Must be a finite number.`
    );
  }

  // Quality score is simply the inverse of artifact percentage
  const score = 100 - artifactPercentage;

  // Round to 2 decimal places for consistency
  return Math.round(score * 100) / 100;
}

/**
 * Detects amplitude artifacts in EEG samples.
 * Samples exceeding ±100 µV are considered artifacts.
 *
 * @param samples - Array of EEG sample values in microvolts
 * @returns true if any sample exceeds amplitude threshold
 */
export function detectAmplitudeArtifact(samples: number[]): boolean {
  if (!samples || samples.length === 0) {
    return false;
  }

  return samples.some(
    (sample) => Math.abs(sample) > ARTIFACT_THRESHOLDS.AMPLITUDE_UV
  );
}

/**
 * Detects gradient artifacts in EEG samples.
 * Sample-to-sample changes exceeding 50 µV are considered artifacts.
 *
 * @param samples - Array of EEG sample values in microvolts
 * @returns true if any sample-to-sample gradient exceeds threshold
 */
export function detectGradientArtifact(samples: number[]): boolean {
  if (!samples || samples.length < 2) {
    return false;
  }

  for (let i = 1; i < samples.length; i++) {
    const gradient = Math.abs(samples[i] - samples[i - 1]);
    if (gradient > ARTIFACT_THRESHOLDS.GRADIENT_UV_PER_SAMPLE) {
      return true;
    }
  }

  return false;
}

/**
 * Calculates artifact percentage from a buffer of EEG samples.
 * Counts samples affected by amplitude or gradient artifacts.
 *
 * @param samples - Array of EEG sample values in microvolts
 * @returns Percentage of samples containing artifacts (0-100)
 */
export function calculateArtifactPercentage(samples: number[]): number {
  if (!samples || samples.length === 0) {
    return 0;
  }

  let artifactCount = 0;

  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];

    // Check amplitude artifact
    if (Math.abs(sample) > ARTIFACT_THRESHOLDS.AMPLITUDE_UV) {
      artifactCount++;
      continue;
    }

    // Check gradient artifact (requires previous sample)
    if (i > 0) {
      const gradient = Math.abs(sample - samples[i - 1]);
      if (gradient > ARTIFACT_THRESHOLDS.GRADIENT_UV_PER_SAMPLE) {
        artifactCount++;
      }
    }
  }

  return (artifactCount / samples.length) * 100;
}

/**
 * Creates a complete SignalQuality object from EEG samples.
 * Calculates all artifact indicators and the overall quality score.
 *
 * @param samples - Array of EEG sample values in microvolts
 * @returns SignalQuality object with score and artifact details
 */
export function calculateSignalQuality(samples: number[]): SignalQuality {
  const hasAmplitudeArtifact = detectAmplitudeArtifact(samples);
  const hasGradientArtifact = detectGradientArtifact(samples);
  const artifactPercentage = calculateArtifactPercentage(samples);
  const score = calculateSignalQualityScore(artifactPercentage);

  return {
    score,
    artifact_percentage: Math.round(artifactPercentage * 100) / 100,
    has_amplitude_artifact: hasAmplitudeArtifact,
    has_gradient_artifact: hasGradientArtifact,
    has_frequency_artifact: false, // Not yet implemented per PRD
  };
}

/**
 * Determines the quality category based on score.
 *
 * @param score - Quality score (0-100)
 * @returns Quality category string
 */
export function getQualityCategory(
  score: number
): 'excellent' | 'good' | 'fair' | 'poor' | 'unusable' {
  if (score >= QUALITY_THRESHOLDS.EXCELLENT) {
    return 'excellent';
  }
  if (score >= QUALITY_THRESHOLDS.MINIMUM_ACCEPTABLE) {
    return 'good';
  }
  if (score >= QUALITY_THRESHOLDS.RECALIBRATION_PROMPT) {
    return 'fair';
  }
  if (score >= QUALITY_THRESHOLDS.AUTO_PAUSE) {
    return 'poor';
  }
  return 'unusable';
}

/**
 * Checks if signal quality is sufficient for calibration.
 *
 * @param score - Quality score (0-100)
 * @returns true if quality is above auto-pause threshold
 */
export function isQualitySufficientForCalibration(score: number): boolean {
  return score >= QUALITY_THRESHOLDS.AUTO_PAUSE;
}

/**
 * Checks if recalibration should be prompted based on quality.
 *
 * @param score - Quality score (0-100)
 * @returns true if quality is below recalibration threshold
 */
export function shouldPromptRecalibration(score: number): boolean {
  return score < QUALITY_THRESHOLDS.RECALIBRATION_PROMPT;
}
