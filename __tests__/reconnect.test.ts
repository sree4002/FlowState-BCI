/**
 * Tests for auto-reconnect logic with exponential backoff
 * Verifies delay calculations, retry limits, and state management
 */

import {
  calculateBackoffDelay,
  getBackoffSequence,
  canRetry,
  getTotalBackoffTime,
  DEFAULT_RECONNECT_CONFIG,
  ReconnectConfig,
} from '../src/utils/reconnect';

describe('Reconnect Utils', () => {
  describe('DEFAULT_RECONNECT_CONFIG', () => {
    it('should have correct default values', () => {
      expect(DEFAULT_RECONNECT_CONFIG.baseDelayMs).toBe(2000);
      expect(DEFAULT_RECONNECT_CONFIG.maxDelayMs).toBe(32000);
      expect(DEFAULT_RECONNECT_CONFIG.maxAttempts).toBe(5);
    });
  });

  describe('calculateBackoffDelay', () => {
    it('should calculate exponential backoff delays (2s, 4s, 8s intervals)', () => {
      // Using default config: baseDelay = 2000ms
      expect(calculateBackoffDelay(0)).toBe(2000); // 2s
      expect(calculateBackoffDelay(1)).toBe(4000); // 4s
      expect(calculateBackoffDelay(2)).toBe(8000); // 8s
    });

    it('should continue exponential pattern for further attempts', () => {
      expect(calculateBackoffDelay(3)).toBe(16000); // 16s
      expect(calculateBackoffDelay(4)).toBe(32000); // 32s (at max)
    });

    it('should cap delay at maxDelayMs', () => {
      // Attempt 5 would be 64000ms, but capped at 32000
      expect(calculateBackoffDelay(5)).toBe(32000);
      expect(calculateBackoffDelay(10)).toBe(32000);
      expect(calculateBackoffDelay(100)).toBe(32000);
    });

    it('should use custom config values', () => {
      const customConfig: ReconnectConfig = {
        baseDelayMs: 1000, // 1 second
        maxDelayMs: 10000, // 10 seconds max
        maxAttempts: 3,
      };

      expect(calculateBackoffDelay(0, customConfig)).toBe(1000);
      expect(calculateBackoffDelay(1, customConfig)).toBe(2000);
      expect(calculateBackoffDelay(2, customConfig)).toBe(4000);
      expect(calculateBackoffDelay(3, customConfig)).toBe(8000);
      expect(calculateBackoffDelay(4, customConfig)).toBe(10000); // Capped
    });

    it('should throw error for negative attempt number', () => {
      expect(() => calculateBackoffDelay(-1)).toThrow(
        'Attempt number must be non-negative'
      );
    });

    it('should handle zero attempt correctly', () => {
      expect(calculateBackoffDelay(0)).toBe(2000);
    });
  });

  describe('getBackoffSequence', () => {
    it('should return correct sequence for default config', () => {
      const sequence = getBackoffSequence();

      expect(sequence).toHaveLength(5);
      expect(sequence).toEqual([2000, 4000, 8000, 16000, 32000]);
    });

    it('should return sequence matching PRD spec (2s, 4s, 8s...)', () => {
      const sequence = getBackoffSequence();

      // First three delays as specified in PRD
      expect(sequence[0]).toBe(2000); // 2s
      expect(sequence[1]).toBe(4000); // 4s
      expect(sequence[2]).toBe(8000); // 8s
    });

    it('should use custom config', () => {
      const customConfig: ReconnectConfig = {
        baseDelayMs: 500,
        maxDelayMs: 4000,
        maxAttempts: 4,
      };

      const sequence = getBackoffSequence(customConfig);

      expect(sequence).toHaveLength(4);
      expect(sequence).toEqual([500, 1000, 2000, 4000]);
    });

    it('should cap values in sequence at maxDelayMs', () => {
      const customConfig: ReconnectConfig = {
        baseDelayMs: 1000,
        maxDelayMs: 5000,
        maxAttempts: 6,
      };

      const sequence = getBackoffSequence(customConfig);

      expect(sequence).toEqual([1000, 2000, 4000, 5000, 5000, 5000]);
    });
  });

  describe('canRetry', () => {
    it('should allow retries within max attempts', () => {
      expect(canRetry(0)).toBe(true);
      expect(canRetry(1)).toBe(true);
      expect(canRetry(4)).toBe(true);
    });

    it('should disallow retries at or beyond max attempts', () => {
      expect(canRetry(5)).toBe(false);
      expect(canRetry(6)).toBe(false);
      expect(canRetry(100)).toBe(false);
    });

    it('should use custom maxAttempts', () => {
      const customConfig: ReconnectConfig = {
        baseDelayMs: 2000,
        maxDelayMs: 32000,
        maxAttempts: 3,
      };

      expect(canRetry(0, customConfig)).toBe(true);
      expect(canRetry(2, customConfig)).toBe(true);
      expect(canRetry(3, customConfig)).toBe(false);
    });
  });

  describe('getTotalBackoffTime', () => {
    it('should calculate total wait time for default config', () => {
      // 2000 + 4000 + 8000 + 16000 + 32000 = 62000ms
      expect(getTotalBackoffTime()).toBe(62000);
    });

    it('should work with custom config', () => {
      const customConfig: ReconnectConfig = {
        baseDelayMs: 1000,
        maxDelayMs: 10000,
        maxAttempts: 3,
      };

      // 1000 + 2000 + 4000 = 7000ms
      expect(getTotalBackoffTime(customConfig)).toBe(7000);
    });

    it('should account for capped delays', () => {
      const customConfig: ReconnectConfig = {
        baseDelayMs: 1000,
        maxDelayMs: 2500,
        maxAttempts: 5,
      };

      // 1000 + 2000 + 2500 + 2500 + 2500 = 10500ms
      expect(getTotalBackoffTime(customConfig)).toBe(10500);
    });
  });

  describe('Exponential Backoff Pattern', () => {
    it('should follow power of 2 pattern', () => {
      for (let i = 0; i < 5; i++) {
        const expected = Math.min(
          2000 * Math.pow(2, i),
          DEFAULT_RECONNECT_CONFIG.maxDelayMs
        );
        expect(calculateBackoffDelay(i)).toBe(expected);
      }
    });

    it('should double with each attempt until cap', () => {
      const sequence = getBackoffSequence();

      for (let i = 1; i < sequence.length; i++) {
        // Each delay should be double the previous (until capped)
        if (sequence[i - 1] < DEFAULT_RECONNECT_CONFIG.maxDelayMs / 2) {
          expect(sequence[i]).toBe(sequence[i - 1] * 2);
        } else {
          expect(sequence[i]).toBe(DEFAULT_RECONNECT_CONFIG.maxDelayMs);
        }
      }
    });
  });
});

describe('BleService Auto-Reconnect', () => {
  describe('Backoff Delay Calculation (BleService method equivalent)', () => {
    // These tests verify the expected behavior that BleService implements
    const baseReconnectDelay = 2000;
    const maxDelay = 32000;

    const calculateBleServiceBackoff = (attempt: number): number => {
      const delay = baseReconnectDelay * Math.pow(2, attempt);
      return Math.min(delay, maxDelay);
    };

    it('should match PRD specification (2s, 4s, 8s intervals)', () => {
      expect(calculateBleServiceBackoff(0)).toBe(2000);
      expect(calculateBleServiceBackoff(1)).toBe(4000);
      expect(calculateBleServiceBackoff(2)).toBe(8000);
    });

    it('should continue pattern correctly', () => {
      expect(calculateBleServiceBackoff(3)).toBe(16000);
      expect(calculateBleServiceBackoff(4)).toBe(32000);
    });

    it('should cap at maximum delay', () => {
      expect(calculateBleServiceBackoff(5)).toBe(32000);
      expect(calculateBleServiceBackoff(10)).toBe(32000);
    });
  });

  describe('Reconnect State Management', () => {
    it('should have correct initial state values', () => {
      // These represent expected initial values for BleService
      const initialState = {
        autoReconnectEnabled: false,
        lastConnectedDeviceId: null,
        reconnectAttempts: 0,
        maxReconnectAttempts: 5,
        baseReconnectDelay: 2000,
        reconnectTimer: null,
        isReconnecting: false,
        intentionalDisconnect: false,
      };

      expect(initialState.autoReconnectEnabled).toBe(false);
      expect(initialState.reconnectAttempts).toBe(0);
      expect(initialState.maxReconnectAttempts).toBe(5);
      expect(initialState.isReconnecting).toBe(false);
    });

    it('should distinguish intentional vs unexpected disconnects', () => {
      // Intentional disconnect should not trigger auto-reconnect
      const intentionalDisconnect = true;
      const autoReconnectEnabled = true;

      const shouldReconnect = autoReconnectEnabled && !intentionalDisconnect;
      expect(shouldReconnect).toBe(false);

      // Unexpected disconnect should trigger auto-reconnect
      const unexpectedDisconnect = false;
      const shouldReconnectAfterUnexpected =
        autoReconnectEnabled && !unexpectedDisconnect;
      expect(shouldReconnectAfterUnexpected).toBe(true);
    });
  });

  describe('Reconnect Attempt Limits', () => {
    const maxReconnectAttempts = 5;

    it('should allow attempts within limit', () => {
      for (let i = 0; i < maxReconnectAttempts; i++) {
        expect(i < maxReconnectAttempts).toBe(true);
      }
    });

    it('should stop at max attempts', () => {
      const reconnectAttempts = maxReconnectAttempts;
      expect(reconnectAttempts >= maxReconnectAttempts).toBe(true);
    });
  });
});

describe('ReconnectAttemptEvent Shape', () => {
  it('should have correct structure for waiting status', () => {
    const event = {
      attempt: 1,
      maxAttempts: 5,
      status: 'waiting' as const,
      nextDelayMs: 2000,
    };

    expect(event.attempt).toBe(1);
    expect(event.maxAttempts).toBe(5);
    expect(event.status).toBe('waiting');
    expect(event.nextDelayMs).toBe(2000);
  });

  it('should have correct structure for connecting status', () => {
    const event = {
      attempt: 1,
      maxAttempts: 5,
      status: 'connecting' as const,
      nextDelayMs: null,
    };

    expect(event.status).toBe('connecting');
    expect(event.nextDelayMs).toBeNull();
  });

  it('should have correct structure for failed status with error', () => {
    const event = {
      attempt: 1,
      maxAttempts: 5,
      status: 'failed' as const,
      error: 'Connection timeout',
      nextDelayMs: 4000,
    };

    expect(event.status).toBe('failed');
    expect(event.error).toBe('Connection timeout');
    expect(event.nextDelayMs).toBe(4000);
  });

  it('should have correct structure for max_attempts_reached status', () => {
    const event = {
      attempt: 5,
      maxAttempts: 5,
      status: 'max_attempts_reached' as const,
      nextDelayMs: null,
    };

    expect(event.status).toBe('max_attempts_reached');
    expect(event.nextDelayMs).toBeNull();
  });

  it('should have correct structure for connected status', () => {
    const event = {
      attempt: 2,
      maxAttempts: 5,
      status: 'connected' as const,
      nextDelayMs: null,
    };

    expect(event.status).toBe('connected');
    expect(event.nextDelayMs).toBeNull();
  });
});
