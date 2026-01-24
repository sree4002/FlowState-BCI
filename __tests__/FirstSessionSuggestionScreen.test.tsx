/**
 * Tests for FirstSessionSuggestionScreen
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { FirstSessionSuggestionScreen } from '../src/screens/FirstSessionSuggestionScreen';

describe('FirstSessionSuggestionScreen', () => {
  describe('Rendering', () => {
    it('should render the screen with all elements', () => {
      const { getByText, getByTestId } = render(
        <FirstSessionSuggestionScreen />
      );

      expect(getByTestId('first-session-suggestion-screen')).toBeTruthy();
      expect(getByText('Ready to Begin?')).toBeTruthy();
      expect(getByText(/Choose how you'd like to start/)).toBeTruthy();
    });

    it('should render Quick Boost option card', () => {
      const { getByTestId, getByText } = render(
        <FirstSessionSuggestionScreen />
      );

      expect(getByTestId('option-card-quick-boost')).toBeTruthy();
      expect(getByText('Quick Boost')).toBeTruthy();
      expect(getByText('Start Quick Session')).toBeTruthy();
    });

    it('should render Calibrate option card', () => {
      const { getByTestId, getByText } = render(
        <FirstSessionSuggestionScreen />
      );

      expect(getByTestId('option-card-calibrate')).toBeTruthy();
      expect(getByText('Calibrate First')).toBeTruthy();
      expect(getByText('Begin Calibration')).toBeTruthy();
    });

    it('should show RECOMMENDED badge on Calibrate option', () => {
      const { getByText } = render(<FirstSessionSuggestionScreen />);

      expect(getByText('RECOMMENDED')).toBeTruthy();
    });

    it('should render skip button', () => {
      const { getByTestId, getByText } = render(
        <FirstSessionSuggestionScreen />
      );

      expect(getByTestId('skip-button')).toBeTruthy();
      expect(getByText(/Skip for now/)).toBeTruthy();
    });

    it('should render benefits list for Quick Boost', () => {
      const { getByText } = render(<FirstSessionSuggestionScreen />);

      expect(getByText('Ready in seconds')).toBeTruthy();
      expect(getByText(/universal theta frequency/)).toBeTruthy();
    });

    it('should render benefits list for Calibrate', () => {
      const { getByText } = render(<FirstSessionSuggestionScreen />);

      expect(getByText('Establishes your baseline')).toBeTruthy();
      expect(getByText(/optimal theta frequency/)).toBeTruthy();
    });
  });

  describe('User Interactions', () => {
    it('should call onQuickBoost when Quick Boost button is pressed', () => {
      const mockOnQuickBoost = jest.fn();
      const { getByTestId } = render(
        <FirstSessionSuggestionScreen onQuickBoost={mockOnQuickBoost} />
      );

      fireEvent.press(getByTestId('quick-boost-button'));
      expect(mockOnQuickBoost).toHaveBeenCalledTimes(1);
    });

    it('should call onCalibrate when Calibrate button is pressed', () => {
      const mockOnCalibrate = jest.fn();
      const { getByTestId } = render(
        <FirstSessionSuggestionScreen onCalibrate={mockOnCalibrate} />
      );

      fireEvent.press(getByTestId('calibrate-button'));
      expect(mockOnCalibrate).toHaveBeenCalledTimes(1);
    });

    it('should call onSkip when skip button is pressed', () => {
      const mockOnSkip = jest.fn();
      const { getByTestId } = render(
        <FirstSessionSuggestionScreen onSkip={mockOnSkip} />
      );

      fireEvent.press(getByTestId('skip-button'));
      expect(mockOnSkip).toHaveBeenCalledTimes(1);
    });

    it('should not crash when callbacks are not provided', () => {
      const { getByTestId } = render(<FirstSessionSuggestionScreen />);

      // These should not throw
      expect(() => fireEvent.press(getByTestId('quick-boost-button'))).not.toThrow();
      expect(() => fireEvent.press(getByTestId('calibrate-button'))).not.toThrow();
      expect(() => fireEvent.press(getByTestId('skip-button'))).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible Quick Boost button', () => {
      const { getByLabelText } = render(<FirstSessionSuggestionScreen />);

      expect(getByLabelText('Start Quick Session')).toBeTruthy();
    });

    it('should have accessible Calibrate button', () => {
      const { getByLabelText } = render(<FirstSessionSuggestionScreen />);

      expect(getByLabelText('Begin Calibration')).toBeTruthy();
    });

    it('should have accessible skip button', () => {
      const { getByLabelText } = render(<FirstSessionSuggestionScreen />);

      expect(getByLabelText('Skip and explore the app')).toBeTruthy();
    });
  });
});
