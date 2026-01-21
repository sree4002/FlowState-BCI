/**
 * Circadian Analysis Utilities
 * Functions for analyzing session performance by time of day
 * and generating circadian-aware session suggestions
 */

import { Session, CircadianPattern, SessionConfig } from '../types';

/**
 * Time periods for circadian analysis
 */
export type TimePeriod =
  | 'morning'
  | 'midday'
  | 'afternoon'
  | 'evening'
  | 'night';

/**
 * Session suggestion with circadian context
 */
export interface SessionSuggestion {
  suggestedTime: Date;
  timePeriod: TimePeriod;
  confidence: 'high' | 'medium' | 'low';
  reason: string;
  recommendedConfig: Partial<SessionConfig>;
  averagePerformance: number | null;
  sessionCountAtTime: number;
}

/**
 * Get the current hour (0-23) in local time
 */
export const getCurrentHour = (): number => {
  return new Date().getHours();
};

/**
 * Get the time period for a given hour
 */
export const getTimePeriod = (hour: number): TimePeriod => {
  if (hour >= 5 && hour < 9) return 'morning';
  if (hour >= 9 && hour < 12) return 'midday';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
};

/**
 * Get a human-readable label for a time period
 */
export const getTimePeriodLabel = (period: TimePeriod): string => {
  const labels: Record<TimePeriod, string> = {
    morning: 'Morning (5am-9am)',
    midday: 'Midday (9am-12pm)',
    afternoon: 'Afternoon (12pm-5pm)',
    evening: 'Evening (5pm-9pm)',
    night: 'Night (9pm-5am)',
  };
  return labels[period];
};

/**
 * Get a short label for a time period
 */
export const getTimePeriodShortLabel = (period: TimePeriod): string => {
  const labels: Record<TimePeriod, string> = {
    morning: 'Morning',
    midday: 'Midday',
    afternoon: 'Afternoon',
    evening: 'Evening',
    night: 'Night',
  };
  return labels[period];
};

/**
 * Analyze sessions to build circadian patterns
 */
export const analyzeCircadianPatterns = (
  sessions: Session[]
): CircadianPattern[] => {
  // Group sessions by hour of day
  const hourlyData: Map<
    number,
    { thetaMeans: number[]; thetaStds: number[]; ratings: number[] }
  > = new Map();

  for (let hour = 0; hour < 24; hour++) {
    hourlyData.set(hour, { thetaMeans: [], thetaStds: [], ratings: [] });
  }

  sessions.forEach((session) => {
    const hour = new Date(session.start_time).getHours();
    const data = hourlyData.get(hour);
    if (data) {
      data.thetaMeans.push(session.avg_theta_zscore);
      // Use max as an approximation for variability
      data.thetaStds.push(
        Math.abs(session.max_theta_zscore - session.avg_theta_zscore)
      );
      if (session.subjective_rating !== null) {
        data.ratings.push(session.subjective_rating);
      }
    }
  });

  const patterns: CircadianPattern[] = [];

  hourlyData.forEach((data, hour) => {
    if (data.thetaMeans.length > 0) {
      const avgTheta =
        data.thetaMeans.reduce((a, b) => a + b, 0) / data.thetaMeans.length;
      const avgStd =
        data.thetaStds.length > 0
          ? data.thetaStds.reduce((a, b) => a + b, 0) / data.thetaStds.length
          : 0;
      const avgRating =
        data.ratings.length > 0
          ? data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length
          : 0;

      patterns.push({
        hour_of_day: hour,
        avg_theta_mean: avgTheta,
        avg_theta_std: avgStd,
        session_count: data.thetaMeans.length,
        avg_subjective_rating: avgRating,
      });
    }
  });

  return patterns.sort((a, b) => a.hour_of_day - b.hour_of_day);
};

/**
 * Find the best performing time period based on circadian patterns
 */
export const findBestTimePeriod = (
  patterns: CircadianPattern[]
): { period: TimePeriod; avgScore: number; sessionCount: number } | null => {
  if (patterns.length === 0) return null;

  // Group patterns by time period
  const periodScores: Map<TimePeriod, { scores: number[]; counts: number[] }> =
    new Map();

  const allPeriods: TimePeriod[] = [
    'morning',
    'midday',
    'afternoon',
    'evening',
    'night',
  ];
  allPeriods.forEach((period) => {
    periodScores.set(period, { scores: [], counts: [] });
  });

  patterns.forEach((pattern) => {
    const period = getTimePeriod(pattern.hour_of_day);
    const data = periodScores.get(period);
    if (data) {
      // Score combines theta z-score performance and subjective rating
      const score =
        pattern.avg_theta_mean * 0.7 +
        (pattern.avg_subjective_rating / 5) * 0.3 * 2;
      data.scores.push(score);
      data.counts.push(pattern.session_count);
    }
  });

  let bestPeriod: TimePeriod | null = null;
  let bestAvgScore = -Infinity;
  let bestCount = 0;

  periodScores.forEach((data, period) => {
    if (data.scores.length > 0) {
      // Weight by session count for more reliable periods
      const totalCount = data.counts.reduce((a, b) => a + b, 0);
      const weightedScore =
        data.scores.reduce((sum, score, i) => sum + score * data.counts[i], 0) /
        totalCount;

      if (weightedScore > bestAvgScore) {
        bestAvgScore = weightedScore;
        bestPeriod = period;
        bestCount = totalCount;
      }
    }
  });

  if (bestPeriod === null) return null;

  return {
    period: bestPeriod,
    avgScore: bestAvgScore,
    sessionCount: bestCount,
  };
};

/**
 * Get the next suggested session time based on circadian patterns
 */
export const getNextSessionSuggestion = (
  sessions: Session[],
  currentTime: Date = new Date()
): SessionSuggestion => {
  const patterns = analyzeCircadianPatterns(sessions);
  const currentHour = currentTime.getHours();
  const currentPeriod = getTimePeriod(currentHour);

  // Default suggestion if no data
  if (sessions.length === 0 || patterns.length === 0) {
    return {
      suggestedTime: getNextPeriodStartTime('morning', currentTime),
      timePeriod: 'morning',
      confidence: 'low',
      reason: 'Start your first session to build personalized recommendations',
      recommendedConfig: {
        type: 'quick_boost',
        duration_minutes: 5,
      },
      averagePerformance: null,
      sessionCountAtTime: 0,
    };
  }

  const bestTimePeriod = findBestTimePeriod(patterns);

  // If we have a best time period with enough data
  if (bestTimePeriod && bestTimePeriod.sessionCount >= 3) {
    const suggestedTime = getNextPeriodStartTime(
      bestTimePeriod.period,
      currentTime
    );

    return {
      suggestedTime,
      timePeriod: bestTimePeriod.period,
      confidence: bestTimePeriod.sessionCount >= 7 ? 'high' : 'medium',
      reason: `Your best focus time based on ${bestTimePeriod.sessionCount} sessions`,
      recommendedConfig: {
        type: 'quick_boost',
        duration_minutes: 5,
      },
      averagePerformance: bestTimePeriod.avgScore,
      sessionCountAtTime: bestTimePeriod.sessionCount,
    };
  }

  // Fallback: suggest current period or next period based on time of day
  const currentPeriodData = patterns.filter(
    (p) => getTimePeriod(p.hour_of_day) === currentPeriod
  );

  if (currentPeriodData.length > 0) {
    const avgScore =
      currentPeriodData.reduce((sum, p) => sum + p.avg_theta_mean, 0) /
      currentPeriodData.length;
    const totalSessions = currentPeriodData.reduce(
      (sum, p) => sum + p.session_count,
      0
    );

    // Suggest now if it's a reasonable time
    const suggestedTime = new Date(currentTime);
    suggestedTime.setMinutes(0, 0, 0);
    if (suggestedTime <= currentTime) {
      suggestedTime.setHours(suggestedTime.getHours() + 1);
    }

    return {
      suggestedTime,
      timePeriod: currentPeriod,
      confidence: totalSessions >= 3 ? 'medium' : 'low',
      reason:
        totalSessions >= 3
          ? `Good time for a session based on ${totalSessions} past sessions`
          : 'Continue building your circadian profile',
      recommendedConfig: {
        type: 'quick_boost',
        duration_minutes: 5,
      },
      averagePerformance: avgScore,
      sessionCountAtTime: totalSessions,
    };
  }

  // If no data for current period, suggest exploring
  return {
    suggestedTime: new Date(currentTime),
    timePeriod: currentPeriod,
    confidence: 'low',
    reason: 'Try a session now to learn your patterns',
    recommendedConfig: {
      type: 'quick_boost',
      duration_minutes: 5,
    },
    averagePerformance: null,
    sessionCountAtTime: 0,
  };
};

/**
 * Get the start time for the next occurrence of a time period
 */
export const getNextPeriodStartTime = (
  period: TimePeriod,
  currentTime: Date = new Date()
): Date => {
  const periodStartHours: Record<TimePeriod, number> = {
    morning: 5,
    midday: 9,
    afternoon: 12,
    evening: 17,
    night: 21,
  };

  const targetHour = periodStartHours[period];
  const result = new Date(currentTime);
  result.setMinutes(0, 0, 0);

  if (result.getHours() < targetHour) {
    result.setHours(targetHour);
  } else {
    // Next day
    result.setDate(result.getDate() + 1);
    result.setHours(targetHour);
  }

  return result;
};

/**
 * Format a time for display (e.g., "9:00 AM")
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Format relative time (e.g., "in 2 hours", "tomorrow morning")
 */
export const formatRelativeTime = (
  targetTime: Date,
  currentTime: Date = new Date()
): string => {
  const diffMs = targetTime.getTime() - currentTime.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) {
    return 'now';
  }

  if (diffHours === 0) {
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    if (diffMinutes <= 0) return 'now';
    if (diffMinutes < 60) return `in ${diffMinutes} min`;
    return 'in less than an hour';
  }

  if (diffHours === 1) {
    return 'in 1 hour';
  }

  if (diffHours < 24) {
    return `in ${diffHours} hours`;
  }

  const period = getTimePeriod(targetTime.getHours());
  return `tomorrow ${getTimePeriodShortLabel(period).toLowerCase()}`;
};

/**
 * Get performance indicator color based on score
 */
export const getPerformanceColor = (
  score: number
): 'red' | 'yellow' | 'green' | 'blue' => {
  if (score < 0.5) return 'red';
  if (score < 1.0) return 'yellow';
  if (score < 1.5) return 'green';
  return 'blue';
};
