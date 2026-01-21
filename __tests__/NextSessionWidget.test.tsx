/**
 * Tests for NextSessionWidget component
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { NextSessionWidget } from '../src/components/NextSessionWidget';
import { SessionProvider } from '../src/contexts';
import { Session } from '../src/types';

// Mock session data
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

// Create a date at a specific hour
const createDateAtHour = (hour: number, dayOffset: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  date.setHours(hour, 0, 0, 0);
  return date;
};

// Wrapper component that provides context
const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <SessionProvider>{children}</SessionProvider>
);

describe('NextSessionWidget', () => {
  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { getByTestId } = render(
        <Wrapper>
          <NextSessionWidget testID="widget" />
        </Wrapper>
      );

      expect(getByTestId('widget')).toBeTruthy();
    });

    it('should render title "Next Session"', () => {
      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget />
        </Wrapper>
      );

      expect(getByText('Next Session')).toBeTruthy();
    });

    it('should render with default suggestion when no sessions', () => {
      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget />
        </Wrapper>
      );

      expect(
        getByText('Start your first session to build personalized recommendations')
      ).toBeTruthy();
    });

    it('should render "Tap to start a session" CTA', () => {
      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget />
        </Wrapper>
      );

      expect(getByText('Tap to start a session')).toBeTruthy();
    });

    it('should render confidence badge', () => {
      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget />
        </Wrapper>
      );

      // With no sessions, should show "Try" (low confidence)
      expect(getByText('Try')).toBeTruthy();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode', () => {
      const { getByTestId, queryByText } = render(
        <Wrapper>
          <NextSessionWidget compact testID="compact-widget" />
        </Wrapper>
      );

      expect(getByTestId('compact-widget')).toBeTruthy();
      // Should not have the full title in compact mode
      expect(queryByText('Next Session')).toBeNull();
    });

    it('should show time period in compact mode', () => {
      const currentTime = createDateAtHour(10); // Midday
      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget compact currentTime={currentTime} />
        </Wrapper>
      );

      // Should show a time period label
      expect(getByText('Morning')).toBeTruthy();
    });
  });

  describe('Interaction', () => {
    it('should call onStartSession when pressed', () => {
      const mockOnStartSession = jest.fn();

      const { getByTestId } = render(
        <Wrapper>
          <NextSessionWidget
            testID="widget"
            onStartSession={mockOnStartSession}
          />
        </Wrapper>
      );

      fireEvent.press(getByTestId('widget'));

      expect(mockOnStartSession).toHaveBeenCalledTimes(1);
    });

    it('should pass suggestion to onStartSession callback', () => {
      const mockOnStartSession = jest.fn();

      const { getByTestId } = render(
        <Wrapper>
          <NextSessionWidget
            testID="widget"
            onStartSession={mockOnStartSession}
          />
        </Wrapper>
      );

      fireEvent.press(getByTestId('widget'));

      expect(mockOnStartSession).toHaveBeenCalledWith(
        expect.objectContaining({
          suggestedTime: expect.any(Date),
          timePeriod: expect.any(String),
          confidence: expect.any(String),
          reason: expect.any(String),
          recommendedConfig: expect.any(Object),
        })
      );
    });

    it('should call onStartSession in compact mode', () => {
      const mockOnStartSession = jest.fn();

      const { getByTestId } = render(
        <Wrapper>
          <NextSessionWidget
            testID="widget"
            compact
            onStartSession={mockOnStartSession}
          />
        </Wrapper>
      );

      fireEvent.press(getByTestId('widget'));

      expect(mockOnStartSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      const { getByRole } = render(
        <Wrapper>
          <NextSessionWidget />
        </Wrapper>
      );

      expect(getByRole('button')).toBeTruthy();
    });

    it('should have accessibility label in compact mode', () => {
      const currentTime = createDateAtHour(10);
      const { getByLabelText } = render(
        <Wrapper>
          <NextSessionWidget compact currentTime={currentTime} />
        </Wrapper>
      );

      // Should have an accessibility label that includes suggestion info
      const label = getByLabelText(/session/i);
      expect(label).toBeTruthy();
    });
  });

  describe('Time Display', () => {
    it('should display time based on currentTime prop', () => {
      const currentTime = createDateAtHour(14); // 2pm

      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget currentTime={currentTime} />
        </Wrapper>
      );

      // Should show time period
      expect(getByText('Morning')).toBeTruthy();
    });

    it('should show relative time', () => {
      const currentTime = createDateAtHour(10);

      const { getByText } = render(
        <Wrapper>
          <NextSessionWidget currentTime={currentTime} />
        </Wrapper>
      );

      // Should show relative time like "in X hours" or "tomorrow"
      // The exact text depends on the suggestion
      const widget = getByText(/in|tomorrow|now/i);
      expect(widget).toBeTruthy();
    });
  });

  describe('Props', () => {
    it('should accept testID prop', () => {
      const { getByTestId } = render(
        <Wrapper>
          <NextSessionWidget testID="my-widget" />
        </Wrapper>
      );

      expect(getByTestId('my-widget')).toBeTruthy();
    });

    it('should work without onStartSession callback', () => {
      const { getByTestId } = render(
        <Wrapper>
          <NextSessionWidget testID="widget" />
        </Wrapper>
      );

      // Should not throw when pressed without callback
      expect(() => fireEvent.press(getByTestId('widget'))).not.toThrow();
    });
  });
});
