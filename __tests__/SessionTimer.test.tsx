/**
 * Tests for SessionTimer component
 * Verifies elapsed/total time display, progress calculation, and formatting
 */

import React from 'react';
import { render } from '@testing-library/react';
import {
  SessionTimer,
  formatTime,
  calculateProgress,
} from '../src/components/SessionTimer';
import { SessionProvider, useSession } from '../src/contexts';
import { renderHook, act } from '@testing-library/react';
import { SessionConfig, SessionState } from '../src/types';

// Helper to create wrapper with SessionProvider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <SessionProvider>{children}</SessionProvider>
  );
};

// Helper to render widget with provider
const renderTimer = (props?: React.ComponentProps<typeof SessionTimer>) => {
  return render(
    <SessionProvider>
      <SessionTimer testID="session-timer" {...props} />
    </SessionProvider>
  );
};

// Helper component that sets session state and renders timer
const TestTimerWithSession = ({
  elapsedSeconds,
  sessionConfig,
  sessionState,
  ...timerProps
}: {
  elapsedSeconds?: number;
  sessionConfig?: SessionConfig | null;
  sessionState?: SessionState;
} & React.ComponentProps<typeof SessionTimer>) => {
  const session = useSession();
  React.useEffect(() => {
    if (elapsedSeconds !== undefined) {
      session.setElapsedSeconds(elapsedSeconds);
    }
    if (sessionConfig !== undefined) {
      session.setSessionConfig(sessionConfig);
    }
    if (sessionState !== undefined) {
      session.setSessionState(sessionState);
    }
  }, []);
  return <SessionTimer testID="session-timer" {...timerProps} />;
};

describe('SessionTimer', () => {
  describe('formatTime helper', () => {
    it('should format 0 seconds as 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should format 30 seconds as 00:30', () => {
      expect(formatTime(30)).toBe('00:30');
    });

    it('should format 60 seconds as 01:00', () => {
      expect(formatTime(60)).toBe('01:00');
    });

    it('should format 90 seconds as 01:30', () => {
      expect(formatTime(90)).toBe('01:30');
    });

    it('should format 600 seconds (10 min) as 10:00', () => {
      expect(formatTime(600)).toBe('10:00');
    });

    it('should format 3661 seconds (61 min 1 sec) as 61:01', () => {
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should handle negative numbers by treating as 0', () => {
      expect(formatTime(-10)).toBe('00:00');
    });

    it('should pad single digit minutes and seconds', () => {
      expect(formatTime(65)).toBe('01:05');
    });
  });

  describe('calculateProgress helper', () => {
    it('should return 0 for 0 elapsed of any total', () => {
      expect(calculateProgress(0, 100)).toBe(0);
      expect(calculateProgress(0, 600)).toBe(0);
    });

    it('should return 50 for half elapsed', () => {
      expect(calculateProgress(50, 100)).toBe(50);
      expect(calculateProgress(300, 600)).toBe(50);
    });

    it('should return 100 when elapsed equals total', () => {
      expect(calculateProgress(100, 100)).toBe(100);
      expect(calculateProgress(600, 600)).toBe(100);
    });

    it('should cap at 100 when elapsed exceeds total', () => {
      expect(calculateProgress(150, 100)).toBe(100);
    });

    it('should return 0 when total is 0', () => {
      expect(calculateProgress(50, 0)).toBe(0);
    });

    it('should return 0 when total is negative', () => {
      expect(calculateProgress(50, -100)).toBe(0);
    });

    it('should handle fractional progress', () => {
      expect(calculateProgress(33, 100)).toBe(33);
      expect(calculateProgress(1, 3)).toBeCloseTo(33.33, 1);
    });
  });

  describe('Basic Rendering', () => {
    it('should render the timer container', () => {
      const { container } = renderTimer();
      expect(
        container.querySelector('[data-testid="session-timer"]')
      ).toBeTruthy();
    });

    it('should render Elapsed label', () => {
      const { container } = renderTimer();
      expect(container.textContent).toContain('Elapsed');
    });

    it('should render Total label by default', () => {
      const { container } = renderTimer();
      expect(container.textContent).toContain('Total');
    });

    it('should render Remaining label when showRemaining is true', () => {
      const { container } = renderTimer({ showRemaining: true });
      expect(container.textContent).toContain('Remaining');
    });

    it('should render progress percentage text in large mode', () => {
      const { container } = renderTimer({ size: 'large' });
      expect(container.textContent).toContain('complete');
    });

    it('should not render progress percentage text in compact mode', () => {
      const { container } = renderTimer({ size: 'compact' });
      expect(container.textContent).not.toContain('complete');
    });
  });

  describe('Initial State (No Session)', () => {
    it('should display 00:00 for elapsed when no session', () => {
      const { container } = renderTimer();
      expect(container.textContent).toContain('00:00');
    });

    it('should display 0% complete when no session', () => {
      const { container } = renderTimer();
      expect(container.textContent).toContain('0% complete');
    });
  });

  describe('Active Session Display', () => {
    const mockConfig: SessionConfig = {
      type: 'quick_boost',
      duration_minutes: 10,
      entrainment_freq: 10,
      volume: 50,
      target_zscore: 1.5,
      closed_loop_behavior: 'reduce_intensity',
    };

    it('should display correct elapsed time from context', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={125}
            sessionConfig={mockConfig}
          />
        </SessionProvider>
      );
      expect(container.textContent).toContain('02:05');
    });

    it('should display correct total time from config', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={0}
            sessionConfig={mockConfig}
          />
        </SessionProvider>
      );
      // 10 minutes = 10:00
      expect(container.textContent).toContain('10:00');
    });

    it('should display correct remaining time when showRemaining is true', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={300}
            sessionConfig={mockConfig}
            showRemaining={true}
          />
        </SessionProvider>
      );
      // 10 min - 5 min elapsed = 5 min remaining = 05:00
      expect(container.textContent).toContain('05:00');
    });

    it('should display 50% progress at halfway point', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={300}
            sessionConfig={mockConfig}
          />
        </SessionProvider>
      );
      expect(container.textContent).toContain('50% complete');
    });

    it('should display 100% progress when session is complete', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={600}
            sessionConfig={mockConfig}
          />
        </SessionProvider>
      );
      expect(container.textContent).toContain('100% complete');
    });

    it('should cap remaining time at 00:00 when elapsed exceeds total', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={700}
            sessionConfig={mockConfig}
            showRemaining={true}
          />
        </SessionProvider>
      );
      expect(container.textContent).toContain('00:00');
    });
  });

  describe('Different Session Durations', () => {
    it('should handle 5 minute session', () => {
      const config: SessionConfig = {
        type: 'quick_boost',
        duration_minutes: 5,
        entrainment_freq: 10,
        volume: 50,
        target_zscore: 1.5,
        closed_loop_behavior: 'reduce_intensity',
      };

      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession elapsedSeconds={150} sessionConfig={config} />
        </SessionProvider>
      );
      // 150 seconds = 02:30 elapsed
      // 5 minutes = 05:00 total
      expect(container.textContent).toContain('02:30');
      expect(container.textContent).toContain('05:00');
    });

    it('should handle 30 minute session', () => {
      const config: SessionConfig = {
        type: 'custom',
        duration_minutes: 30,
        entrainment_freq: 10,
        volume: 50,
        target_zscore: 1.5,
        closed_loop_behavior: 'reduce_intensity',
      };

      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession elapsedSeconds={900} sessionConfig={config} />
        </SessionProvider>
      );
      // 900 seconds = 15:00 elapsed
      // 30 minutes = 30:00 total
      expect(container.textContent).toContain('15:00');
      expect(container.textContent).toContain('30:00');
    });
  });

  describe('Size Variants', () => {
    const mockConfig: SessionConfig = {
      type: 'quick_boost',
      duration_minutes: 10,
      entrainment_freq: 10,
      volume: 50,
      target_zscore: 1.5,
      closed_loop_behavior: 'reduce_intensity',
    };

    it('should render in large mode by default', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={60}
            sessionConfig={mockConfig}
          />
        </SessionProvider>
      );
      expect(container.textContent).toContain('complete');
    });

    it('should render in compact mode without progress text', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession
            elapsedSeconds={60}
            sessionConfig={mockConfig}
            size="compact"
          />
        </SessionProvider>
      );
      expect(container.textContent).not.toContain('complete');
    });
  });

  describe('Context Integration', () => {
    it('should throw error when used outside SessionProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<SessionTimer />);
      }).toThrow('useSession must be used within a SessionProvider');

      console.error = originalError;
    });

    it('should update when elapsed seconds change in context', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setElapsedSeconds(120);
      });

      expect(result.current.elapsedSeconds).toBe(120);
    });

    it('should update when session config changes in context', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useSession(), { wrapper });

      const config: SessionConfig = {
        type: 'quick_boost',
        duration_minutes: 15,
        entrainment_freq: 10,
        volume: 50,
        target_zscore: 1.5,
        closed_loop_behavior: 'reduce_intensity',
      };

      act(() => {
        result.current.setSessionConfig(config);
      });

      expect(result.current.sessionConfig).toEqual(config);
    });
  });

  describe('Component Export', () => {
    it('should be exported as named export', () => {
      expect(SessionTimer).toBeDefined();
      expect(typeof SessionTimer).toBe('function');
    });

    it('should have proper displayName or function name', () => {
      expect(
        SessionTimer.name === 'SessionTimer' ||
          SessionTimer.displayName === 'SessionTimer'
      ).toBe(true);
    });

    it('should export formatTime helper', () => {
      expect(formatTime).toBeDefined();
      expect(typeof formatTime).toBe('function');
    });

    it('should export calculateProgress helper', () => {
      expect(calculateProgress).toBeDefined();
      expect(typeof calculateProgress).toBe('function');
    });
  });

  describe('TestID Props', () => {
    it('should apply custom testID', () => {
      const { container } = render(
        <SessionProvider>
          <SessionTimer testID="custom-timer" />
        </SessionProvider>
      );
      expect(
        container.querySelector('[data-testid="custom-timer"]')
      ).toBeTruthy();
    });

    it('should have progress testID', () => {
      const { container } = render(
        <SessionProvider>
          <SessionTimer testID="session-timer" />
        </SessionProvider>
      );
      expect(
        container.querySelector('[data-testid="session-timer-progress"]')
      ).toBeTruthy();
    });
  });

  describe('Progress Boundaries', () => {
    const config: SessionConfig = {
      type: 'quick_boost',
      duration_minutes: 10,
      entrainment_freq: 10,
      volume: 50,
      target_zscore: 1.5,
      closed_loop_behavior: 'reduce_intensity',
    };

    it('should show 0% at start of session', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession elapsedSeconds={0} sessionConfig={config} />
        </SessionProvider>
      );
      expect(container.textContent).toContain('0% complete');
    });

    it('should show 25% at quarter progress', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession elapsedSeconds={150} sessionConfig={config} />
        </SessionProvider>
      );
      expect(container.textContent).toContain('25% complete');
    });

    it('should show 75% at three-quarter progress', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession elapsedSeconds={450} sessionConfig={config} />
        </SessionProvider>
      );
      expect(container.textContent).toContain('75% complete');
    });

    it('should cap at 100% when over time', () => {
      const { container } = render(
        <SessionProvider>
          <TestTimerWithSession elapsedSeconds={700} sessionConfig={config} />
        </SessionProvider>
      );
      expect(container.textContent).toContain('100% complete');
    });
  });
});
