/**
 * Tests for SessionListItem component
 * Verifies display of date, duration, avg theta, frequency, and rating
 */

import { Colors } from '../src/constants/theme';
import {
  formatSessionDuration,
  formatSessionDate,
  formatSessionTime,
  formatThetaZScore,
  getThetaColor,
  getSessionTypeLabel,
  getSessionTypeBadgeColor,
  getSessionAccessibilityLabel,
  getRelativeDateLabel,
  getStarRating,
  SESSION_TYPE_LABELS,
  SESSION_TYPE_COLORS,
  SessionListItemProps,
} from '../src/components/SessionListItem';
import type { Session } from '../src/types';

// Helper to create mock session data
const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: 1,
  session_type: 'custom',
  start_time: new Date('2026-01-15T14:30:00').getTime(),
  end_time: new Date('2026-01-15T15:00:00').getTime(),
  duration_seconds: 1800,
  avg_theta_zscore: 0.75,
  max_theta_zscore: 1.5,
  entrainment_freq: 6.0,
  volume: 70,
  signal_quality_avg: 85,
  subjective_rating: 4,
  notes: null,
  ...overrides,
});

describe('SessionListItem', () => {
  describe('formatSessionDuration', () => {
    it('should format 0 seconds as "0m"', () => {
      expect(formatSessionDuration(0)).toBe('0m');
    });

    it('should format seconds only', () => {
      expect(formatSessionDuration(30)).toBe('30s');
      expect(formatSessionDuration(59)).toBe('59s');
    });

    it('should format minutes without seconds when exact', () => {
      expect(formatSessionDuration(60)).toBe('1m');
      expect(formatSessionDuration(300)).toBe('5m');
      expect(formatSessionDuration(1800)).toBe('30m');
    });

    it('should format minutes with seconds', () => {
      expect(formatSessionDuration(90)).toBe('1m 30s');
      expect(formatSessionDuration(330)).toBe('5m 30s');
    });

    it('should format hours without minutes when exact', () => {
      expect(formatSessionDuration(3600)).toBe('1h');
      expect(formatSessionDuration(7200)).toBe('2h');
    });

    it('should format hours with minutes', () => {
      expect(formatSessionDuration(3660)).toBe('1h 1m');
      expect(formatSessionDuration(5400)).toBe('1h 30m');
      expect(formatSessionDuration(9000)).toBe('2h 30m');
    });

    it('should drop seconds when hours are present', () => {
      expect(formatSessionDuration(3661)).toBe('1h 1m');
      expect(formatSessionDuration(3630)).toBe('1h');
    });
  });

  describe('formatSessionDate', () => {
    it('should format date in "Mon D, YYYY" format', () => {
      const timestamp = new Date('2026-01-15T14:30:00').getTime();
      expect(formatSessionDate(timestamp)).toBe('Jan 15, 2026');
    });

    it('should handle different months', () => {
      // Use explicit time to avoid timezone issues
      expect(formatSessionDate(new Date('2026-06-01T12:00:00').getTime())).toBe(
        'Jun 1, 2026'
      );
      expect(formatSessionDate(new Date('2026-12-25T12:00:00').getTime())).toBe(
        'Dec 25, 2026'
      );
    });

    it('should handle year boundaries', () => {
      // Use explicit time to avoid timezone issues
      expect(formatSessionDate(new Date('2025-12-31T12:00:00').getTime())).toBe(
        'Dec 31, 2025'
      );
      expect(formatSessionDate(new Date('2027-01-01T12:00:00').getTime())).toBe(
        'Jan 1, 2027'
      );
    });
  });

  describe('formatSessionTime', () => {
    it('should format time in 12-hour format', () => {
      const timestamp = new Date('2026-01-15T14:30:00').getTime();
      expect(formatSessionTime(timestamp)).toBe('2:30 PM');
    });

    it('should handle AM times', () => {
      expect(formatSessionTime(new Date('2026-01-15T09:00:00').getTime())).toBe(
        '9:00 AM'
      );
      expect(formatSessionTime(new Date('2026-01-15T00:30:00').getTime())).toBe(
        '12:30 AM'
      );
    });

    it('should handle PM times', () => {
      expect(formatSessionTime(new Date('2026-01-15T12:00:00').getTime())).toBe(
        '12:00 PM'
      );
      expect(formatSessionTime(new Date('2026-01-15T23:45:00').getTime())).toBe(
        '11:45 PM'
      );
    });

    it('should handle noon and midnight', () => {
      expect(formatSessionTime(new Date('2026-01-15T12:00:00').getTime())).toBe(
        '12:00 PM'
      );
      expect(formatSessionTime(new Date('2026-01-15T00:00:00').getTime())).toBe(
        '12:00 AM'
      );
    });
  });

  describe('formatThetaZScore', () => {
    it('should format positive values with + sign', () => {
      expect(formatThetaZScore(1.5)).toBe('+1.50');
      expect(formatThetaZScore(0.75)).toBe('+0.75');
      expect(formatThetaZScore(2.345)).toBe('+2.35');
    });

    it('should format zero with + sign', () => {
      expect(formatThetaZScore(0)).toBe('+0.00');
    });

    it('should format negative values with - sign', () => {
      expect(formatThetaZScore(-0.5)).toBe('-0.50');
      expect(formatThetaZScore(-1.0)).toBe('-1.00');
      expect(formatThetaZScore(-2.345)).toBe('-2.35');
    });

    it('should format to exactly 2 decimal places', () => {
      expect(formatThetaZScore(1)).toBe('+1.00');
      expect(formatThetaZScore(1.1)).toBe('+1.10');
      expect(formatThetaZScore(1.123)).toBe('+1.12');
      expect(formatThetaZScore(1.999)).toBe('+2.00');
    });
  });

  describe('getThetaColor', () => {
    it('should return blue for z-score >= 1.0 (excellent)', () => {
      expect(getThetaColor(1.0)).toBe(Colors.status.blue);
      expect(getThetaColor(1.5)).toBe(Colors.status.blue);
      expect(getThetaColor(2.0)).toBe(Colors.status.blue);
    });

    it('should return green for z-score between 0.5 and 1.0 (good)', () => {
      expect(getThetaColor(0.5)).toBe(Colors.status.green);
      expect(getThetaColor(0.75)).toBe(Colors.status.green);
      expect(getThetaColor(0.99)).toBe(Colors.status.green);
    });

    it('should return yellow for z-score between 0 and 0.5 (neutral)', () => {
      expect(getThetaColor(0)).toBe(Colors.status.yellow);
      expect(getThetaColor(0.25)).toBe(Colors.status.yellow);
      expect(getThetaColor(0.49)).toBe(Colors.status.yellow);
    });

    it('should return red for z-score < 0 (below baseline)', () => {
      expect(getThetaColor(-0.1)).toBe(Colors.status.red);
      expect(getThetaColor(-0.5)).toBe(Colors.status.red);
      expect(getThetaColor(-1.0)).toBe(Colors.status.red);
    });

    it('should handle boundary values correctly', () => {
      expect(getThetaColor(1.0)).toBe(Colors.status.blue);
      expect(getThetaColor(0.999)).toBe(Colors.status.green);
      expect(getThetaColor(0.5)).toBe(Colors.status.green);
      expect(getThetaColor(0.499)).toBe(Colors.status.yellow);
      expect(getThetaColor(0)).toBe(Colors.status.yellow);
      expect(getThetaColor(-0.001)).toBe(Colors.status.red);
    });
  });

  describe('SESSION_TYPE_LABELS', () => {
    it('should have labels for all session types', () => {
      expect(SESSION_TYPE_LABELS.calibration).toBe('Calibration');
      expect(SESSION_TYPE_LABELS.quick_boost).toBe('Quick Boost');
      expect(SESSION_TYPE_LABELS.custom).toBe('Custom');
      expect(SESSION_TYPE_LABELS.scheduled).toBe('Scheduled');
      expect(SESSION_TYPE_LABELS.sham).toBe('A/B Test');
    });
  });

  describe('SESSION_TYPE_COLORS', () => {
    it('should have colors for all session types', () => {
      expect(SESSION_TYPE_COLORS.calibration).toBe(Colors.secondary.main);
      expect(SESSION_TYPE_COLORS.quick_boost).toBe(Colors.accent.success);
      expect(SESSION_TYPE_COLORS.custom).toBe(Colors.primary.main);
      expect(SESSION_TYPE_COLORS.scheduled).toBe(Colors.accent.info);
      expect(SESSION_TYPE_COLORS.sham).toBe(Colors.text.tertiary);
    });
  });

  describe('getSessionTypeLabel', () => {
    it('should return correct label for each session type', () => {
      expect(getSessionTypeLabel('calibration')).toBe('Calibration');
      expect(getSessionTypeLabel('quick_boost')).toBe('Quick Boost');
      expect(getSessionTypeLabel('custom')).toBe('Custom');
      expect(getSessionTypeLabel('scheduled')).toBe('Scheduled');
      expect(getSessionTypeLabel('sham')).toBe('A/B Test');
    });

    it('should return the type itself for unknown types', () => {
      expect(getSessionTypeLabel('unknown' as Session['session_type'])).toBe(
        'unknown'
      );
    });
  });

  describe('getSessionTypeBadgeColor', () => {
    it('should return correct color for each session type', () => {
      expect(getSessionTypeBadgeColor('calibration')).toBe(
        Colors.secondary.main
      );
      expect(getSessionTypeBadgeColor('quick_boost')).toBe(
        Colors.accent.success
      );
      expect(getSessionTypeBadgeColor('custom')).toBe(Colors.primary.main);
      expect(getSessionTypeBadgeColor('scheduled')).toBe(Colors.accent.info);
      expect(getSessionTypeBadgeColor('sham')).toBe(Colors.text.tertiary);
    });

    it('should return tertiary color for unknown types', () => {
      expect(
        getSessionTypeBadgeColor('unknown' as Session['session_type'])
      ).toBe(Colors.text.tertiary);
    });
  });

  describe('getStarRating', () => {
    it('should return empty string for null rating', () => {
      expect(getStarRating(null)).toBe('');
    });

    it('should return correct star pattern for each rating', () => {
      expect(getStarRating(1)).toBe('★☆☆☆☆');
      expect(getStarRating(2)).toBe('★★☆☆☆');
      expect(getStarRating(3)).toBe('★★★☆☆');
      expect(getStarRating(4)).toBe('★★★★☆');
      expect(getStarRating(5)).toBe('★★★★★');
    });

    it('should clamp ratings to valid range', () => {
      expect(getStarRating(0)).toBe('★☆☆☆☆');
      expect(getStarRating(-1)).toBe('★☆☆☆☆');
      expect(getStarRating(6)).toBe('★★★★★');
      expect(getStarRating(10)).toBe('★★★★★');
    });

    it('should round fractional ratings', () => {
      expect(getStarRating(2.4)).toBe('★★☆☆☆');
      expect(getStarRating(2.5)).toBe('★★★☆☆');
      expect(getStarRating(3.7)).toBe('★★★★☆');
    });
  });

  describe('getRelativeDateLabel', () => {
    it('should return "Today" for timestamps from today', () => {
      const now = new Date();
      now.setHours(12, 0, 0, 0);
      expect(getRelativeDateLabel(now.getTime())).toBe('Today');
    });

    it('should return "Yesterday" for timestamps from yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(12, 0, 0, 0);
      expect(getRelativeDateLabel(yesterday.getTime())).toBe('Yesterday');
    });

    it('should return formatted date for older timestamps', () => {
      const oldDate = new Date('2026-01-10T12:00:00').getTime();
      expect(getRelativeDateLabel(oldDate)).toBe('Jan 10, 2026');
    });

    it('should handle timestamps at midnight correctly', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      expect(getRelativeDateLabel(today.getTime())).toBe('Today');
    });

    it('should handle timestamps near day boundaries', () => {
      const todayEnd = new Date();
      todayEnd.setHours(23, 59, 59, 999);
      expect(getRelativeDateLabel(todayEnd.getTime())).toBe('Today');
    });
  });

  describe('getSessionAccessibilityLabel', () => {
    it('should create a comprehensive accessibility label', () => {
      const session = createMockSession({
        session_type: 'quick_boost',
        start_time: new Date('2026-01-15T14:30:00').getTime(),
        duration_seconds: 300,
        avg_theta_zscore: 0.85,
        entrainment_freq: 6.0,
        subjective_rating: 4,
      });

      const label = getSessionAccessibilityLabel(session);

      expect(label).toContain('Quick Boost');
      expect(label).toContain('Jan 15, 2026');
      expect(label).toContain('2:30 PM');
      expect(label).toContain('5m');
      expect(label).toContain('+0.85');
      expect(label).toContain('6.0 hertz');
      expect(label).toContain('4 out of 5 stars');
    });

    it('should handle session without rating', () => {
      const session = createMockSession({
        subjective_rating: null,
      });

      const label = getSessionAccessibilityLabel(session);

      expect(label).not.toContain('stars');
      expect(label).not.toContain('Rating');
    });

    it('should handle negative theta values', () => {
      const session = createMockSession({
        avg_theta_zscore: -0.5,
      });

      const label = getSessionAccessibilityLabel(session);

      expect(label).toContain('-0.50');
    });

    it('should include all session types correctly', () => {
      const sessionTypes: Session['session_type'][] = [
        'calibration',
        'quick_boost',
        'custom',
        'scheduled',
        'sham',
      ];

      sessionTypes.forEach((type) => {
        const session = createMockSession({ session_type: type });
        const label = getSessionAccessibilityLabel(session);
        expect(label).toContain(SESSION_TYPE_LABELS[type]);
      });
    });
  });

  describe('SessionListItem Props Interface', () => {
    it('should accept required session prop', () => {
      const session = createMockSession();
      const props: SessionListItemProps = {
        session,
      };
      expect(props.session).toBe(session);
    });

    it('should accept optional onPress callback', () => {
      const session = createMockSession();
      const onPress = jest.fn();
      const props: SessionListItemProps = {
        session,
        onPress,
      };
      expect(props.onPress).toBe(onPress);
    });

    it('should accept optional showDateHeader prop', () => {
      const session = createMockSession();
      const props: SessionListItemProps = {
        session,
        showDateHeader: true,
      };
      expect(props.showDateHeader).toBe(true);
    });

    it('should accept optional testID prop', () => {
      const session = createMockSession();
      const props: SessionListItemProps = {
        session,
        testID: 'custom-test-id',
      };
      expect(props.testID).toBe('custom-test-id');
    });

    it('should accept optional compact prop', () => {
      const session = createMockSession();
      const props: SessionListItemProps = {
        session,
        compact: true,
      };
      expect(props.compact).toBe(true);
    });
  });

  describe('Display Data Formatting', () => {
    it('should display all required session data fields', () => {
      const session = createMockSession({
        start_time: new Date('2026-01-15T14:30:00').getTime(),
        duration_seconds: 1800,
        avg_theta_zscore: 0.75,
        entrainment_freq: 6.0,
        subjective_rating: 4,
      });

      // Verify date formatting
      expect(formatSessionDate(session.start_time)).toBe('Jan 15, 2026');
      expect(formatSessionTime(session.start_time)).toBe('2:30 PM');

      // Verify duration formatting
      expect(formatSessionDuration(session.duration_seconds)).toBe('30m');

      // Verify theta z-score formatting and color
      expect(formatThetaZScore(session.avg_theta_zscore)).toBe('+0.75');
      expect(getThetaColor(session.avg_theta_zscore)).toBe(Colors.status.green);

      // Verify frequency display (component formats as "X.X Hz")
      expect(session.entrainment_freq.toFixed(1)).toBe('6.0');

      // Verify rating display
      expect(getStarRating(session.subjective_rating)).toBe('★★★★☆');
    });

    it('should handle edge case session data', () => {
      const session = createMockSession({
        duration_seconds: 0,
        avg_theta_zscore: -1.5,
        entrainment_freq: 4.0,
        subjective_rating: 1,
      });

      expect(formatSessionDuration(session.duration_seconds)).toBe('0m');
      expect(formatThetaZScore(session.avg_theta_zscore)).toBe('-1.50');
      expect(getThetaColor(session.avg_theta_zscore)).toBe(Colors.status.red);
      expect(session.entrainment_freq.toFixed(1)).toBe('4.0');
      expect(getStarRating(session.subjective_rating)).toBe('★☆☆☆☆');
    });

    it('should handle high-performing session data', () => {
      const session = createMockSession({
        duration_seconds: 7200,
        avg_theta_zscore: 2.0,
        entrainment_freq: 8.0,
        subjective_rating: 5,
      });

      expect(formatSessionDuration(session.duration_seconds)).toBe('2h');
      expect(formatThetaZScore(session.avg_theta_zscore)).toBe('+2.00');
      expect(getThetaColor(session.avg_theta_zscore)).toBe(Colors.status.blue);
      expect(session.entrainment_freq.toFixed(1)).toBe('8.0');
      expect(getStarRating(session.subjective_rating)).toBe('★★★★★');
    });
  });

  describe('Theta Color Coding Consistency', () => {
    it('should have consistent color coding across thresholds', () => {
      const testCases = [
        { zscore: -1.0, expectedColor: Colors.status.red },
        { zscore: -0.01, expectedColor: Colors.status.red },
        { zscore: 0, expectedColor: Colors.status.yellow },
        { zscore: 0.25, expectedColor: Colors.status.yellow },
        { zscore: 0.5, expectedColor: Colors.status.green },
        { zscore: 0.75, expectedColor: Colors.status.green },
        { zscore: 1.0, expectedColor: Colors.status.blue },
        { zscore: 1.5, expectedColor: Colors.status.blue },
      ];

      testCases.forEach(({ zscore, expectedColor }) => {
        expect(getThetaColor(zscore)).toBe(expectedColor);
      });
    });

    it('should handle extreme values', () => {
      expect(getThetaColor(-10)).toBe(Colors.status.red);
      expect(getThetaColor(10)).toBe(Colors.status.blue);
    });
  });

  describe('Session Type Coverage', () => {
    it('should support all defined session types', () => {
      const sessionTypes: Session['session_type'][] = [
        'calibration',
        'quick_boost',
        'custom',
        'scheduled',
        'sham',
      ];

      sessionTypes.forEach((type) => {
        const label = getSessionTypeLabel(type);
        const color = getSessionTypeBadgeColor(type);

        expect(label).toBeTruthy();
        expect(label.length).toBeGreaterThan(0);
        expect(color).toBeTruthy();
        expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      });
    });
  });
});
