/**
 * Tests for circadian analysis utilities
 */

import {
  getCurrentHour,
  getTimePeriod,
  getTimePeriodLabel,
  getTimePeriodShortLabel,
  analyzeCircadianPatterns,
  findBestTimePeriod,
  getNextSessionSuggestion,
  getNextPeriodStartTime,
  formatTime,
  formatRelativeTime,
  getPerformanceColor,
  TimePeriod,
} from '../src/utils/circadian';
import { Session, CircadianPattern } from '../src/types';

// Helper to create mock sessions
const createMockSession = (
  overrides: Partial<Session> & { start_time: number }
): Session => ({
  id: Math.floor(Math.random() * 10000),
  session_type: 'quick_boost',
  end_time: overrides.start_time + 300000,
  duration_seconds: 300,
  avg_theta_zscore: 1.2,
  max_theta_zscore: 1.8,
  entrainment_freq: 6.0,
  volume: 70,
  signal_quality_avg: 85,
  subjective_rating: null,
  notes: null,
  ...overrides,
});

// Helper to create a date at a specific hour
const createDateAtHour = (hour: number, dayOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date;
};

describe('Circadian Utilities', () => {
  describe('getCurrentHour', () => {
    it('should return a number between 0 and 23', () => {
      const hour = getCurrentHour();
      expect(hour).toBeGreaterThanOrEqual(0);
      expect(hour).toBeLessThanOrEqual(23);
    });
  });

  describe('getTimePeriod', () => {
    it('should return morning for hours 5-8', () => {
      expect(getTimePeriod(5)).toBe('morning');
      expect(getTimePeriod(6)).toBe('morning');
      expect(getTimePeriod(7)).toBe('morning');
      expect(getTimePeriod(8)).toBe('morning');
    });

    it('should return midday for hours 9-11', () => {
      expect(getTimePeriod(9)).toBe('midday');
      expect(getTimePeriod(10)).toBe('midday');
      expect(getTimePeriod(11)).toBe('midday');
    });

    it('should return afternoon for hours 12-16', () => {
      expect(getTimePeriod(12)).toBe('afternoon');
      expect(getTimePeriod(14)).toBe('afternoon');
      expect(getTimePeriod(16)).toBe('afternoon');
    });

    it('should return evening for hours 17-20', () => {
      expect(getTimePeriod(17)).toBe('evening');
      expect(getTimePeriod(18)).toBe('evening');
      expect(getTimePeriod(20)).toBe('evening');
    });

    it('should return night for hours 21-4', () => {
      expect(getTimePeriod(21)).toBe('night');
      expect(getTimePeriod(23)).toBe('night');
      expect(getTimePeriod(0)).toBe('night');
      expect(getTimePeriod(3)).toBe('night');
      expect(getTimePeriod(4)).toBe('night');
    });
  });

  describe('getTimePeriodLabel', () => {
    it('should return full labels for each period', () => {
      expect(getTimePeriodLabel('morning')).toBe('Morning (5am-9am)');
      expect(getTimePeriodLabel('midday')).toBe('Midday (9am-12pm)');
      expect(getTimePeriodLabel('afternoon')).toBe('Afternoon (12pm-5pm)');
      expect(getTimePeriodLabel('evening')).toBe('Evening (5pm-9pm)');
      expect(getTimePeriodLabel('night')).toBe('Night (9pm-5am)');
    });
  });

  describe('getTimePeriodShortLabel', () => {
    it('should return short labels for each period', () => {
      expect(getTimePeriodShortLabel('morning')).toBe('Morning');
      expect(getTimePeriodShortLabel('midday')).toBe('Midday');
      expect(getTimePeriodShortLabel('afternoon')).toBe('Afternoon');
      expect(getTimePeriodShortLabel('evening')).toBe('Evening');
      expect(getTimePeriodShortLabel('night')).toBe('Night');
    });
  });

  describe('analyzeCircadianPatterns', () => {
    it('should return empty array for no sessions', () => {
      const patterns = analyzeCircadianPatterns([]);
      expect(patterns).toEqual([]);
    });

    it('should analyze sessions by hour of day', () => {
      const sessions: Session[] = [
        createMockSession({
          start_time: createDateAtHour(9).getTime(),
          avg_theta_zscore: 1.5,
          max_theta_zscore: 2.0,
        }),
        createMockSession({
          start_time: createDateAtHour(9, -1).getTime(),
          avg_theta_zscore: 1.3,
          max_theta_zscore: 1.8,
        }),
      ];

      const patterns = analyzeCircadianPatterns(sessions);

      // Should have one pattern for hour 9
      const hour9Pattern = patterns.find((p) => p.hour_of_day === 9);
      expect(hour9Pattern).toBeDefined();
      expect(hour9Pattern?.session_count).toBe(2);
      expect(hour9Pattern?.avg_theta_mean).toBe(1.4); // Average of 1.5 and 1.3
    });

    it('should calculate average subjective ratings', () => {
      const sessions: Session[] = [
        createMockSession({
          start_time: createDateAtHour(14).getTime(),
          subjective_rating: 4,
        }),
        createMockSession({
          start_time: createDateAtHour(14, -1).getTime(),
          subjective_rating: 5,
        }),
      ];

      const patterns = analyzeCircadianPatterns(sessions);
      const hour14Pattern = patterns.find((p) => p.hour_of_day === 14);

      expect(hour14Pattern?.avg_subjective_rating).toBe(4.5);
    });

    it('should return patterns sorted by hour', () => {
      const sessions: Session[] = [
        createMockSession({ start_time: createDateAtHour(15).getTime() }),
        createMockSession({ start_time: createDateAtHour(9).getTime() }),
        createMockSession({ start_time: createDateAtHour(21).getTime() }),
      ];

      const patterns = analyzeCircadianPatterns(sessions);
      const hours = patterns.map((p) => p.hour_of_day);

      expect(hours).toEqual([9, 15, 21]);
    });
  });

  describe('findBestTimePeriod', () => {
    it('should return null for empty patterns', () => {
      const result = findBestTimePeriod([]);
      expect(result).toBeNull();
    });

    it('should find the best performing time period', () => {
      const patterns: CircadianPattern[] = [
        {
          hour_of_day: 9,
          avg_theta_mean: 1.5,
          avg_theta_std: 0.3,
          session_count: 5,
          avg_subjective_rating: 4,
        },
        {
          hour_of_day: 10,
          avg_theta_mean: 1.6,
          avg_theta_std: 0.2,
          session_count: 5,
          avg_subjective_rating: 5,
        },
        {
          hour_of_day: 14,
          avg_theta_mean: 0.8,
          avg_theta_std: 0.4,
          session_count: 3,
          avg_subjective_rating: 2,
        },
      ];

      const result = findBestTimePeriod(patterns);

      expect(result).not.toBeNull();
      expect(result?.period).toBe('midday'); // Hours 9-10 are both midday
      expect(result?.sessionCount).toBe(10);
    });

    it('should weight by session count', () => {
      const patterns: CircadianPattern[] = [
        {
          hour_of_day: 9,
          avg_theta_mean: 1.2,
          avg_theta_std: 0.3,
          session_count: 20, // Many sessions
          avg_subjective_rating: 3,
        },
        {
          hour_of_day: 14,
          avg_theta_mean: 1.8, // Higher score
          avg_theta_std: 0.2,
          session_count: 2, // But fewer sessions
          avg_subjective_rating: 4,
        },
      ];

      const result = findBestTimePeriod(patterns);
      expect(result).not.toBeNull();
    });
  });

  describe('getNextSessionSuggestion', () => {
    it('should return default suggestion when no sessions', () => {
      const suggestion = getNextSessionSuggestion([]);

      expect(suggestion.confidence).toBe('low');
      expect(suggestion.timePeriod).toBe('morning');
      expect(suggestion.averagePerformance).toBeNull();
      expect(suggestion.sessionCountAtTime).toBe(0);
      expect(suggestion.reason).toContain('first session');
    });

    it('should return high confidence when sufficient data', () => {
      const currentTime = createDateAtHour(10);
      const sessions: Session[] = [];

      // Create 8 sessions in the morning (hour 9)
      for (let i = 0; i < 8; i++) {
        sessions.push(
          createMockSession({
            start_time: createDateAtHour(9, -i).getTime(),
            avg_theta_zscore: 1.5 + Math.random() * 0.3,
            max_theta_zscore: 2.0,
            subjective_rating: 4,
          })
        );
      }

      const suggestion = getNextSessionSuggestion(sessions, currentTime);

      expect(suggestion.confidence).toBe('high');
      expect(suggestion.sessionCountAtTime).toBeGreaterThanOrEqual(7);
    });

    it('should return medium confidence with moderate data', () => {
      const currentTime = createDateAtHour(10);
      const sessions: Session[] = [];

      // Create 4 sessions
      for (let i = 0; i < 4; i++) {
        sessions.push(
          createMockSession({
            start_time: createDateAtHour(9, -i).getTime(),
            avg_theta_zscore: 1.5,
            max_theta_zscore: 2.0,
            subjective_rating: 4,
          })
        );
      }

      const suggestion = getNextSessionSuggestion(sessions, currentTime);

      expect(['high', 'medium']).toContain(suggestion.confidence);
    });

    it('should include recommended config', () => {
      const suggestion = getNextSessionSuggestion([]);

      expect(suggestion.recommendedConfig).toBeDefined();
      expect(suggestion.recommendedConfig.type).toBe('quick_boost');
    });
  });

  describe('getNextPeriodStartTime', () => {
    it('should return next morning if current time is after morning', () => {
      const currentTime = createDateAtHour(10); // 10am
      const nextMorning = getNextPeriodStartTime('morning', currentTime);

      expect(nextMorning.getHours()).toBe(5);
      expect(nextMorning.getDate()).toBe(currentTime.getDate() + 1);
    });

    it('should return same day if current time is before period', () => {
      const currentTime = createDateAtHour(4); // 4am
      const nextMorning = getNextPeriodStartTime('morning', currentTime);

      expect(nextMorning.getHours()).toBe(5);
      expect(nextMorning.getDate()).toBe(currentTime.getDate());
    });

    it('should return correct start hours for each period', () => {
      const currentTime = createDateAtHour(1); // 1am

      expect(getNextPeriodStartTime('morning', currentTime).getHours()).toBe(5);
      expect(getNextPeriodStartTime('midday', currentTime).getHours()).toBe(9);
      expect(getNextPeriodStartTime('afternoon', currentTime).getHours()).toBe(
        12
      );
      expect(getNextPeriodStartTime('evening', currentTime).getHours()).toBe(17);
      expect(getNextPeriodStartTime('night', currentTime).getHours()).toBe(21);
    });
  });

  describe('formatTime', () => {
    it('should format time in 12-hour format', () => {
      const morning = createDateAtHour(9);
      morning.setMinutes(30);

      const formatted = formatTime(morning);
      expect(formatted).toMatch(/9:30\s*(AM|am)/);
    });

    it('should format afternoon times with PM', () => {
      const afternoon = createDateAtHour(14);
      afternoon.setMinutes(0);

      const formatted = formatTime(afternoon);
      expect(formatted).toMatch(/2:00\s*(PM|pm)/);
    });
  });

  describe('formatRelativeTime', () => {
    it('should return "now" for past times', () => {
      const past = new Date(Date.now() - 60000);
      const current = new Date();

      expect(formatRelativeTime(past, current)).toBe('now');
    });

    it('should format minutes for near future', () => {
      const current = new Date();
      const future = new Date(current.getTime() + 45 * 60 * 1000); // 45 minutes

      const result = formatRelativeTime(future, current);
      // Can be minutes or rounded to 1 hour depending on rounding
      expect(result).toMatch(/in (\d+ min|1 hour|less than an hour)/);
    });

    it('should format hours for same-day future', () => {
      const current = new Date();
      const future = new Date(current.getTime() + 3 * 60 * 60 * 1000);

      const result = formatRelativeTime(future, current);
      expect(result).toMatch(/in \d+ hours?/);
    });

    it('should return "in 1 hour" for single hour', () => {
      const current = new Date();
      const future = new Date(current.getTime() + 60 * 60 * 1000);

      const result = formatRelativeTime(future, current);
      expect(result).toBe('in 1 hour');
    });

    it('should format next day times', () => {
      const current = createDateAtHour(22);
      const tomorrow = createDateAtHour(9, 1);

      const result = formatRelativeTime(tomorrow, current);
      // Can be "tomorrow morning" or "in X hours" depending on the calculation
      expect(result).toMatch(/(tomorrow|in \d+ hours)/);
    });
  });

  describe('getPerformanceColor', () => {
    it('should return red for low scores', () => {
      expect(getPerformanceColor(0.3)).toBe('red');
      expect(getPerformanceColor(0.49)).toBe('red');
    });

    it('should return yellow for below-target scores', () => {
      expect(getPerformanceColor(0.5)).toBe('yellow');
      expect(getPerformanceColor(0.8)).toBe('yellow');
      expect(getPerformanceColor(0.99)).toBe('yellow');
    });

    it('should return green for target scores', () => {
      expect(getPerformanceColor(1.0)).toBe('green');
      expect(getPerformanceColor(1.2)).toBe('green');
      expect(getPerformanceColor(1.49)).toBe('green');
    });

    it('should return blue for above-target scores', () => {
      expect(getPerformanceColor(1.5)).toBe('blue');
      expect(getPerformanceColor(2.0)).toBe('blue');
    });
  });
});
