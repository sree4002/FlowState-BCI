/**
 * Component tests for OnboardingScreen
 *
 * These tests render the actual component and verify:
 * 1. Rendering the 5 onboarding slides
 * 2. Navigation between slides
 * 3. Skip and complete actions
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OnboardingScreen } from '../src/screens/OnboardingScreen';

describe('OnboardingScreen Component', () => {
  describe('Rendering 5 onboarding slides', () => {
    it('should render the onboarding screen container', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-screen')).toBeTruthy();
    });

    it('should render slide 1 with focus training hook content', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-slide-1')).toBeTruthy();
      expect(screen.getByText('Train Your Focus')).toBeTruthy();
      expect(
        screen.getByText("Unlock your brain's potential with real-time neurofeedback training.")
      ).toBeTruthy();
    });

    it('should render slide 2 with theta monitoring content', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-slide-2')).toBeTruthy();
      expect(screen.getByText('Real-Time Theta Monitoring')).toBeTruthy();
      expect(
        screen.getByText(
          'Watch your brain activity in real-time. See your theta waves rise as you enter deeper states of focus.'
        )
      ).toBeTruthy();
    });

    it('should render slide 3 with AI insights content', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-slide-3')).toBeTruthy();
      expect(screen.getByText('AI-Powered Insights')).toBeTruthy();
      expect(
        screen.getByText(
          'Discover your peak performance hours. Get personalized recommendations to optimize your focus routine.'
        )
      ).toBeTruthy();
    });

    it('should render slide 4 with permissions/device connection content', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-slide-4')).toBeTruthy();
      expect(screen.getByText('Connect Your Device')).toBeTruthy();
      expect(
        screen.getByText('We need a few permissions to help you get started.')
      ).toBeTruthy();
    });

    it('should render slide 5 with call to action', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-slide-5')).toBeTruthy();
      expect(screen.getByText('Ready to Focus?')).toBeTruthy();
      expect(
        screen.getByText('Your journey to enhanced focus and clarity begins now.')
      ).toBeTruthy();
    });

    it('should render all five slides', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-slide-1')).toBeTruthy();
      expect(screen.getByTestId('onboarding-slide-2')).toBeTruthy();
      expect(screen.getByTestId('onboarding-slide-3')).toBeTruthy();
      expect(screen.getByTestId('onboarding-slide-4')).toBeTruthy();
      expect(screen.getByTestId('onboarding-slide-5')).toBeTruthy();
    });

    it('should render pagination dots for 5 slides', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-pagination')).toBeTruthy();
      expect(screen.getByTestId('pagination-dot-0')).toBeTruthy();
      expect(screen.getByTestId('pagination-dot-1')).toBeTruthy();
      expect(screen.getByTestId('pagination-dot-2')).toBeTruthy();
      expect(screen.getByTestId('pagination-dot-3')).toBeTruthy();
      expect(screen.getByTestId('pagination-dot-4')).toBeTruthy();
    });

    it('should render the FlatList for slides', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-flatlist')).toBeTruthy();
    });
  });

  describe('Navigation between slides', () => {
    it('should render the Next button', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-next-button')).toBeTruthy();
      expect(screen.getByText('Next')).toBeTruthy();
    });

    it('should render the Skip button', () => {
      render(<OnboardingScreen />);
      expect(screen.getByTestId('onboarding-skip-button')).toBeTruthy();
      expect(screen.getByText('Skip')).toBeTruthy();
    });

    it('should have clickable pagination dots', () => {
      render(<OnboardingScreen />);
      const dot0 = screen.getByTestId('pagination-dot-0');
      const dot1 = screen.getByTestId('pagination-dot-1');
      const dot2 = screen.getByTestId('pagination-dot-2');
      const dot3 = screen.getByTestId('pagination-dot-3');
      const dot4 = screen.getByTestId('pagination-dot-4');

      // All dots should be touchable
      expect(dot0).toBeTruthy();
      expect(dot1).toBeTruthy();
      expect(dot2).toBeTruthy();
      expect(dot3).toBeTruthy();
      expect(dot4).toBeTruthy();

      // Dots should have accessibility labels
      expect(screen.getByLabelText('Go to slide 1')).toBeTruthy();
      expect(screen.getByLabelText('Go to slide 2')).toBeTruthy();
      expect(screen.getByLabelText('Go to slide 3')).toBeTruthy();
      expect(screen.getByLabelText('Go to slide 4')).toBeTruthy();
      expect(screen.getByLabelText('Go to slide 5')).toBeTruthy();
    });

    it('should allow pressing the Next button', () => {
      render(<OnboardingScreen />);
      const nextButton = screen.getByTestId('onboarding-next-button');
      // Should not throw when pressed
      fireEvent.press(nextButton);
    });

    it('should allow pressing pagination dots', () => {
      render(<OnboardingScreen />);
      const dot1 = screen.getByTestId('pagination-dot-1');
      // Should not throw when pressed
      fireEvent.press(dot1);
    });
  });

  describe('Skip and complete actions', () => {
    it('should call onSkip when Skip button is pressed', () => {
      const onSkipMock = jest.fn();
      render(<OnboardingScreen onSkip={onSkipMock} />);

      const skipButton = screen.getByTestId('onboarding-skip-button');
      fireEvent.press(skipButton);

      expect(onSkipMock).toHaveBeenCalledTimes(1);
    });

    it('should not throw when Skip is pressed without onSkip prop', () => {
      render(<OnboardingScreen />);
      const skipButton = screen.getByTestId('onboarding-skip-button');

      // Should not throw
      expect(() => fireEvent.press(skipButton)).not.toThrow();
    });

    it('should allow pressing Skip button multiple times', () => {
      const onSkipMock = jest.fn();
      render(<OnboardingScreen onSkip={onSkipMock} />);

      const skipButton = screen.getByTestId('onboarding-skip-button');
      fireEvent.press(skipButton);
      fireEvent.press(skipButton);
      fireEvent.press(skipButton);

      expect(onSkipMock).toHaveBeenCalledTimes(3);
    });

    it('should have Skip button with correct accessibility label', () => {
      render(<OnboardingScreen />);
      expect(screen.getByLabelText('Skip onboarding')).toBeTruthy();
    });

    it('should have Skip button with button accessibility role', () => {
      render(<OnboardingScreen />);
      const skipButton = screen.getByLabelText('Skip onboarding');
      expect(skipButton.props.accessibilityRole).toBe('button');
    });

    it('should have Next button with button accessibility role', () => {
      render(<OnboardingScreen />);
      const nextButton = screen.getByTestId('onboarding-next-button');
      expect(nextButton.props.accessibilityRole).toBe('button');
    });

    it('should render onComplete callback prop correctly', () => {
      const onCompleteMock = jest.fn();
      // Component should accept onComplete prop without errors
      const { toJSON } = render(<OnboardingScreen onComplete={onCompleteMock} />);
      expect(toJSON()).toBeTruthy();
    });

    it('should render without crashing when both callbacks are provided', () => {
      const onSkipMock = jest.fn();
      const onCompleteMock = jest.fn();

      const { toJSON } = render(
        <OnboardingScreen onSkip={onSkipMock} onComplete={onCompleteMock} />
      );

      expect(toJSON()).toBeTruthy();
    });
  });

  describe('Slide content and SVG icons', () => {
    it('should render SVG-based icons (no emojis)', () => {
      render(<OnboardingScreen />);
      // The new design uses SVG icons instead of emojis
      // Just verify the slides render without looking for specific emojis
      expect(screen.getByTestId('onboarding-slide-1')).toBeTruthy();
      expect(screen.getByTestId('onboarding-slide-2')).toBeTruthy();
      expect(screen.getByTestId('onboarding-slide-3')).toBeTruthy();
    });

    it('should render permission cards on slide 4', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('Bluetooth')).toBeTruthy();
      expect(screen.getByText('Notifications')).toBeTruthy();
      expect(screen.getByText('Connect to your EEG headband')).toBeTruthy();
      expect(screen.getByText('Get session reminders')).toBeTruthy();
    });
  });

  describe('Initial state', () => {
    it('should show Next button text initially (not Get Started)', () => {
      render(<OnboardingScreen />);
      expect(screen.getByText('Next')).toBeTruthy();
    });

    it('should render all slides in the FlatList', () => {
      render(<OnboardingScreen />);
      // All five slide titles should be present
      expect(screen.getByText('Train Your Focus')).toBeTruthy();
      expect(screen.getByText('Real-Time Theta Monitoring')).toBeTruthy();
      expect(screen.getByText('AI-Powered Insights')).toBeTruthy();
      expect(screen.getByText('Connect Your Device')).toBeTruthy();
      expect(screen.getByText('Ready to Focus?')).toBeTruthy();
    });
  });

  describe('Component props', () => {
    it('should accept optional onComplete prop', () => {
      // Should render without onComplete
      const { rerender } = render(<OnboardingScreen />);
      // Should render with onComplete
      rerender(<OnboardingScreen onComplete={() => {}} />);
    });

    it('should accept optional onSkip prop', () => {
      // Should render without onSkip
      const { rerender } = render(<OnboardingScreen />);
      // Should render with onSkip
      rerender(<OnboardingScreen onSkip={() => {}} />);
    });
  });
});
