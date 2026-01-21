// Signal processing utilities for FlowState BCI application

import { BaselineProfile } from '../types';

/**
 * Result of z-score normalization for EEG band powers
 */
export interface ZScoreResult {
  theta: number;
  alpha: number;
  beta: number;
}

/**
 * Input for z-score normalization - raw band power values
 */
export interface BandPowerInput {
  theta: number;
  alpha: number;
  beta: number;
}

/**
 * Calculate z-score for a single value given mean and standard deviation
 * Z-score formula: z = (value - mean) / std
 *
 * @param value - The raw value to normalize
 * @param mean - The baseline mean
 * @param std - The baseline standard deviation
 * @returns The z-score (normalized value)
 * @throws Error if std is zero or negative
 */
export function calculateZScore(
  value: number,
  mean: number,
  std: number
): number {
  if (std <= 0) {
    throw new Error(
      'Standard deviation must be positive. Cannot normalize with zero or negative std.'
    );
  }

  return (value - mean) / std;
}

/**
 * Normalize theta band power using baseline statistics
 * Returns how many standard deviations the current theta is from baseline
 *
 * @param thetaPower - Current theta band power value
 * @param baseline - Baseline profile containing theta_mean and theta_std
 * @returns Z-score for theta power
 * @throws Error if baseline theta_std is zero or negative
 */
export function normalizeThetaZScore(
  thetaPower: number,
  baseline: Pick<BaselineProfile, 'theta_mean' | 'theta_std'>
): number {
  return calculateZScore(thetaPower, baseline.theta_mean, baseline.theta_std);
}

/**
 * Normalize multiple band powers (theta, alpha, beta) using baseline statistics
 * Note: Only theta has std in baseline, so alpha and beta use theta_std as approximation
 * or require extended baseline profile
 *
 * @param bandPowers - Object containing theta, alpha, beta power values
 * @param baseline - Baseline profile containing mean and std values
 * @returns Object with z-scores for each band
 * @throws Error if any std is zero or negative
 */
export function normalizeAllBands(
  bandPowers: BandPowerInput,
  baseline: BaselineProfile
): ZScoreResult {
  // For theta, we have both mean and std
  const thetaZ = calculateZScore(
    bandPowers.theta,
    baseline.theta_mean,
    baseline.theta_std
  );

  // For alpha and beta, we only have mean in BaselineProfile
  // Use theta_std as approximation (common approach when band-specific std unavailable)
  // In production, the BaselineProfile could be extended to include alpha_std and beta_std
  const alphaZ = calculateZScore(
    bandPowers.alpha,
    baseline.alpha_mean,
    baseline.theta_std
  );

  const betaZ = calculateZScore(
    bandPowers.beta,
    baseline.beta_mean,
    baseline.theta_std
  );

  return {
    theta: thetaZ,
    alpha: alphaZ,
    beta: betaZ,
  };
}

/**
 * Normalize an array of theta values using baseline statistics
 * Useful for batch processing of EEG data epochs
 *
 * @param thetaValues - Array of raw theta band power values
 * @param baseline - Baseline profile containing theta_mean and theta_std
 * @returns Array of z-scores for each theta value
 * @throws Error if baseline theta_std is zero or negative
 */
export function normalizeThetaArray(
  thetaValues: number[],
  baseline: Pick<BaselineProfile, 'theta_mean' | 'theta_std'>
): number[] {
  if (baseline.theta_std <= 0) {
    throw new Error(
      'Standard deviation must be positive. Cannot normalize with zero or negative std.'
    );
  }

  return thetaValues.map((value) =>
    calculateZScore(value, baseline.theta_mean, baseline.theta_std)
  );
}

/**
 * Calculate the running z-score for a sliding window of theta values
 * Returns the z-score of the most recent window average
 *
 * @param thetaWindow - Array of recent theta values (e.g., last 2-4 seconds)
 * @param baseline - Baseline profile containing theta_mean and theta_std
 * @returns Z-score of the window average
 * @throws Error if window is empty or baseline theta_std is zero or negative
 */
export function calculateWindowZScore(
  thetaWindow: number[],
  baseline: Pick<BaselineProfile, 'theta_mean' | 'theta_std'>
): number {
  if (thetaWindow.length === 0) {
    throw new Error('Cannot calculate z-score for empty window');
  }

  const windowMean =
    thetaWindow.reduce((sum, val) => sum + val, 0) / thetaWindow.length;

  return normalizeThetaZScore(windowMean, baseline);
}

/**
 * Check if a z-score is within target range for closed-loop control
 *
 * @param zscore - The current z-score value
 * @param targetZScore - Target z-score threshold (e.g., 1.0 for 1 std above baseline)
 * @param hysteresis - Hysteresis margin to prevent oscillation (default: 0.2)
 * @returns Object indicating if threshold is exceeded and if within hysteresis band
 */
export function checkZScoreThreshold(
  zscore: number,
  targetZScore: number,
  hysteresis: number = 0.2
): { exceedsThreshold: boolean; withinHysteresis: boolean } {
  const upperTrigger = targetZScore + hysteresis;
  const lowerResume = targetZScore - hysteresis;

  return {
    exceedsThreshold: zscore >= upperTrigger,
    withinHysteresis: zscore >= lowerResume && zscore < upperTrigger,
  };
}

/**
 * Categorize a z-score into theta zone for visualization
 * Used for color-coding the theta gauge display
 *
 * @param zscore - The current z-score value
 * @returns Zone category: 'low', 'baseline', 'elevated', 'high'
 */
export function categorizeZScoreZone(
  zscore: number
): 'low' | 'baseline' | 'elevated' | 'high' {
  if (zscore < -0.5) {
    return 'low';
  } else if (zscore >= -0.5 && zscore < 0.5) {
    return 'baseline';
  } else if (zscore >= 0.5 && zscore < 1.5) {
    return 'elevated';
  } else {
    return 'high';
  }
}
