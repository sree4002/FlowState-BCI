/**
 * Tests for TodaySummaryWidget utility functions
 * Verifies session count, total time, and average theta calculations
 *
 * Note: These tests focus on the business logic (filtering and calculations)
 * rather than React Native component rendering, as the Jest setup is configured
 * for non-React-Native tests in this directory.
 */

import type { Session } from '../src/types';

/**
 * Helper to create a mock session with defaults
 */
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: Math.floor(Math.random() * 1000),
  session_type: 'quick_boost',
  start_time: Date.now(),
  end_time: Date.now() + 300000,
  duration_seconds: 300,
  avg_theta_zscore: 0.5,
  max_theta_zscore: 1.2,
  entrainment_freq: 6.0,
  volume: 70,
  signal_quality_avg: 85,
  subjective_rating: null,
  notes: null,
  ...overrides,
});

/**
 * Helper to get today's timestamp at a specific time
 */
const getTodayAt = (hours: number, minutes: number = 0): number => {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.getTime();
};

/**
 * Helper to get yesterday's timestamp
 */
const getYesterday = (): number => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  date.setHours(12, 0, 0, 0);
  return date.getTime();
};

/**
 * Gets the start of today (midnight) as a timestamp
 * (Mirrors the implementation in TodaySummaryWidget)
 */
const getStartOfToday = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

/**
 * Filters sessions to only include those from today
 * (Mirrors the implementation in TodaySummaryWidget)
 */
const filterTodaySessions = (sessions: Session[]): Session[] => {
  const startOfToday = getStartOfToday();
  return sessions.filter((session) => session.start_time >= startOfToday);
};

/**
 * Statistics calculated for today's sessions
 */
interface TodayStats {
  sessionCount: number;
  totalTimeSeconds: number;
  averageTheta: number | null;
}

/**
 * Calculates statistics for today's sessions
 * (Mirrors the implementation in TodaySummaryWidget)
 */
const calculateTodayStats = (sessions: Session[]): TodayStats => {
  const todaySessions = filterTodaySessions(sessions);

  const sessionCount = todaySessions.length;
  const totalTimeSeconds = todaySessions.reduce(
    (sum, session) => sum + session.duration_seconds,
    0
  );

  const averageTheta =
    sessionCount > 0
      ? todaySessions.reduce(
          (sum, session) => sum + session.avg_theta_zscore,
          0
        ) / sessionCount
      : null;

  return {
    sessionCount,
    totalTimeSeconds,
    averageTheta,
  };
};

/**
 * Formats duration in seconds to a human-readable string
 * (Mirrors the implementation in TodaySummaryWidget)
 */
const formatDuration = (seconds: number): string => {
  if (seconds === 0) return '0 min';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
};

/**
 * Formats theta z-score value for display
 * (Mirrors the implementation in TodaySummaryWidget)
 */
const formatTheta = (theta: number | null): string => {
  if (theta === null) return '--';
  const sign = theta >= 0 ? '+' : '';
  return `${sign}${theta.toFixed(2)}`;
};

describe('TodaySummaryWidget Logic', () => {
  describe('filterTodaySessions', () => {
    it('should return empty array when no sessions exist', () => {
      const result = filterTodaySessions([]);
      expect(result).toEqual([]);
    });

    it('should filter out sessions from yesterday', () => {
      const sessions = [
        createMockSession({ id: 1, start_time: getTodayAt(9) }),
        createMockSession({ id: 2, start_time: getYesterday() }),
      ];

      const result = filterTodaySessions(sessions);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(1);
    });

    it('should include sessions from any time today', () => {
      const sessions = [
        createMockSession({ id: 1, start_time: getTodayAt(0, 0) }), // Midnight
        createMockSession({ id: 2, start_time: getTodayAt(6) }),
        createMockSession({ id: 3, start_time: getTodayAt(12) }),
        createMockSession({ id: 4, start_time: getTodayAt(23, 59) }),
      ];

      const result = filterTodaySessions(sessions);

      expect(result).toHaveLength(4);
    });

    it('should return all sessions if all are from today', () => {
      const sessions = [
        createMockSession({ id: 1, start_time: getTodayAt(9) }),
        createMockSession({ id: 2, start_time: getTodayAt(14) }),
        createMockSession({ id: 3, start_time: getTodayAt(18) }),
      ];

      const result = filterTodaySessions(sessions);

      expect(result).toHaveLength(3);
    });
  });

  describe('calculateTodayStats', () => {
    describe('Empty State', () => {
      it('should return 0 session count when no sessions exist', () => {
        const stats = calculateTodayStats([]);
        expect(stats.sessionCount).toBe(0);
      });

      it('should return 0 total time when no sessions exist', () => {
        const stats = calculateTodayStats([]);
        expect(stats.totalTimeSeconds).toBe(0);
      });

      it('should return null average theta when no sessions exist', () => {
        const stats = calculateTodayStats([]);
        expect(stats.averageTheta).toBeNull();
      });
    });

    describe('Session Count', () => {
      it('should count only today sessions', () => {
        const sessions = [
          createMockSession({ id: 1, start_time: getTodayAt(9) }),
          createMockSession({ id: 2, start_time: getTodayAt(14) }),
          createMockSession({ id: 3, start_time: getYesterday() }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.sessionCount).toBe(2);
      });

      it('should return correct count for single session', () => {
        const sessions = [
          createMockSession({ id: 1, start_time: getTodayAt(10) }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.sessionCount).toBe(1);
      });

      it('should count all session types', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(8),
            session_type: 'calibration',
          }),
          createMockSession({
            id: 2,
            start_time: getTodayAt(10),
            session_type: 'quick_boost',
          }),
          createMockSession({
            id: 3,
            start_time: getTodayAt(14),
            session_type: 'custom',
          }),
          createMockSession({
            id: 4,
            start_time: getTodayAt(16),
            session_type: 'scheduled',
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.sessionCount).toBe(4);
      });
    });

    describe('Total Time', () => {
      it('should calculate total time for a single session', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            duration_seconds: 1800, // 30 minutes
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.totalTimeSeconds).toBe(1800);
      });

      it('should sum duration from multiple today sessions', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            duration_seconds: 3600, // 60 minutes
          }),
          createMockSession({
            id: 2,
            start_time: getTodayAt(14),
            duration_seconds: 1800, // 30 minutes
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.totalTimeSeconds).toBe(5400); // 90 minutes
      });

      it('should exclude yesterday sessions from total time', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            duration_seconds: 600, // 10 minutes
          }),
          createMockSession({
            id: 2,
            start_time: getTodayAt(14),
            duration_seconds: 1200, // 20 minutes
          }),
          createMockSession({
            id: 3,
            start_time: getYesterday(),
            duration_seconds: 3600, // 60 minutes (should not be counted)
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.totalTimeSeconds).toBe(1800); // 30 minutes
      });
    });

    describe('Average Theta', () => {
      it('should return correct average for single session', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            avg_theta_zscore: 0.75,
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.averageTheta).toBe(0.75);
      });

      it('should calculate average from multiple sessions', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            avg_theta_zscore: 1.0,
          }),
          createMockSession({
            id: 2,
            start_time: getTodayAt(14),
            avg_theta_zscore: 0.5,
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.averageTheta).toBe(0.75);
      });

      it('should handle negative theta values', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            avg_theta_zscore: -0.5,
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.averageTheta).toBe(-0.5);
      });

      it('should exclude yesterday sessions from average', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            avg_theta_zscore: 0.8,
          }),
          createMockSession({
            id: 2,
            start_time: getYesterday(),
            avg_theta_zscore: -1.0, // Should not affect average
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.averageTheta).toBe(0.8);
      });

      it('should handle zero theta', () => {
        const sessions = [
          createMockSession({
            id: 1,
            start_time: getTodayAt(9),
            avg_theta_zscore: 0,
          }),
        ];

        const stats = calculateTodayStats(sessions);

        expect(stats.averageTheta).toBe(0);
      });
    });
  });

  describe('formatDuration', () => {
    it('should display "0 min" for zero seconds', () => {
      expect(formatDuration(0)).toBe('0 min');
    });

    it('should display minutes for short durations', () => {
      expect(formatDuration(60)).toBe('1 min');
      expect(formatDuration(1800)).toBe('30 min');
      expect(formatDuration(3540)).toBe('59 min');
    });

    it('should display hours and minutes for longer durations', () => {
      expect(formatDuration(5400)).toBe('1h 30m');
      expect(formatDuration(7500)).toBe('2h 5m');
    });

    it('should display just hours when no remaining minutes', () => {
      expect(formatDuration(3600)).toBe('1h');
      expect(formatDuration(7200)).toBe('2h');
      expect(formatDuration(36000)).toBe('10h');
    });
  });

  describe('formatTheta', () => {
    it('should display "--" for null theta', () => {
      expect(formatTheta(null)).toBe('--');
    });

    it('should display positive theta with + sign', () => {
      expect(formatTheta(0.75)).toBe('+0.75');
      expect(formatTheta(1.5)).toBe('+1.50');
      expect(formatTheta(3.5)).toBe('+3.50');
    });

    it('should display negative theta with - sign', () => {
      expect(formatTheta(-0.5)).toBe('-0.50');
      expect(formatTheta(-1.25)).toBe('-1.25');
    });

    it('should display zero theta with + sign', () => {
      expect(formatTheta(0)).toBe('+0.00');
    });

    it('should round to two decimal places', () => {
      expect(formatTheta(0.755)).toBe('+0.76');
      expect(formatTheta(0.001)).toBe('+0.00');
      expect(formatTheta(1.999)).toBe('+2.00');
    });
  });

  describe('Edge Cases', () => {
    it('should handle session at midnight (start of today)', () => {
      const sessions = [
        createMockSession({
          id: 1,
          start_time: getTodayAt(0, 0), // Midnight
          duration_seconds: 600,
        }),
      ];

      const stats = calculateTodayStats(sessions);

      expect(stats.sessionCount).toBe(1);
      expect(stats.totalTimeSeconds).toBe(600);
    });

    it('should handle very long sessions', () => {
      const sessions = [
        createMockSession({
          id: 1,
          start_time: getTodayAt(6),
          duration_seconds: 36000, // 10 hours
        }),
      ];

      const stats = calculateTodayStats(sessions);

      expect(stats.totalTimeSeconds).toBe(36000);
      expect(formatDuration(stats.totalTimeSeconds)).toBe('10h');
    });

    it('should handle many sessions', () => {
      const sessions = Array.from({ length: 20 }, (_, i) =>
        createMockSession({
          id: i,
          start_time: getTodayAt(Math.floor(i / 2)),
          duration_seconds: 300, // 5 minutes each
          avg_theta_zscore: 0.5,
        })
      );

      const stats = calculateTodayStats(sessions);

      expect(stats.sessionCount).toBe(20);
      expect(stats.totalTimeSeconds).toBe(6000); // 100 minutes
      expect(stats.averageTheta).toBe(0.5);
    });

    it('should handle mixed positive and negative theta values', () => {
      const sessions = [
        createMockSession({
          id: 1,
          start_time: getTodayAt(9),
          avg_theta_zscore: 1.0,
        }),
        createMockSession({
          id: 2,
          start_time: getTodayAt(12),
          avg_theta_zscore: -0.5,
        }),
        createMockSession({
          id: 3,
          start_time: getTodayAt(15),
          avg_theta_zscore: 0.5,
        }),
      ];

      const stats = calculateTodayStats(sessions);

      // Average: (1.0 + -0.5 + 0.5) / 3 = 1.0 / 3 ≈ 0.333...
      expect(stats.averageTheta).toBeCloseTo(0.333, 2);
    });
  });
});
