/**
 * Auto-reconnect utility with exponential backoff
 * Provides reusable logic for connection retry strategies
 */

export interface ReconnectConfig {
  /** Base delay in milliseconds (default: 2000ms) */
  baseDelayMs: number;
  /** Maximum delay cap in milliseconds (default: 32000ms) */
  maxDelayMs: number;
  /** Maximum number of retry attempts (default: 5) */
  maxAttempts: number;
}

export const DEFAULT_RECONNECT_CONFIG: ReconnectConfig = {
  baseDelayMs: 2000, // 2 seconds
  maxDelayMs: 32000, // 32 seconds
  maxAttempts: 5,
};

/**
 * Calculate the delay for a given reconnect attempt using exponential backoff
 *
 * Formula: min(baseDelay * 2^attempt, maxDelay)
 *
 * With default config (baseDelay=2000ms):
 * - Attempt 0: 2s
 * - Attempt 1: 4s
 * - Attempt 2: 8s
 * - Attempt 3: 16s
 * - Attempt 4: 32s (capped)
 *
 * @param attempt - Zero-indexed attempt number
 * @param config - Reconnect configuration options
 * @returns Delay in milliseconds
 */
export function calculateBackoffDelay(
  attempt: number,
  config: ReconnectConfig = DEFAULT_RECONNECT_CONFIG
): number {
  if (attempt < 0) {
    throw new Error('Attempt number must be non-negative');
  }

  const { baseDelayMs, maxDelayMs } = config;
  const delay = baseDelayMs * Math.pow(2, attempt);
  return Math.min(delay, maxDelayMs);
}

/**
 * Get the sequence of delays for all attempts
 *
 * @param config - Reconnect configuration options
 * @returns Array of delays in milliseconds for each attempt
 */
export function getBackoffSequence(
  config: ReconnectConfig = DEFAULT_RECONNECT_CONFIG
): number[] {
  const sequence: number[] = [];
  for (let i = 0; i < config.maxAttempts; i++) {
    sequence.push(calculateBackoffDelay(i, config));
  }
  return sequence;
}

/**
 * Check if more reconnect attempts are allowed
 *
 * @param currentAttempt - Current attempt count (1-indexed)
 * @param config - Reconnect configuration options
 * @returns Whether more attempts are allowed
 */
export function canRetry(
  currentAttempt: number,
  config: ReconnectConfig = DEFAULT_RECONNECT_CONFIG
): boolean {
  return currentAttempt < config.maxAttempts;
}

/**
 * Get total time that would be spent waiting across all retry attempts
 *
 * @param config - Reconnect configuration options
 * @returns Total delay time in milliseconds
 */
export function getTotalBackoffTime(
  config: ReconnectConfig = DEFAULT_RECONNECT_CONFIG
): number {
  return getBackoffSequence(config).reduce((sum, delay) => sum + delay, 0);
}
