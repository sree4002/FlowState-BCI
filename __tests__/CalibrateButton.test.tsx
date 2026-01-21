/**
 * Tests for CalibrateButton component
 * Verifies button rendering, variants, sizes, and interactions
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { CalibrateButton, CalibrateButtonProps } from '../src/components';

describe('CalibrateButton', () => {
  const defaultProps: CalibrateButtonProps = {
    onPress: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByTestId } = render(<CalibrateButton {...defaultProps} />);

      const button = getByTestId('calibrate-button');
      expect(button).toBeTruthy();
      // Check that the button has the default label via accessibility
      expect(button.props.accessibilityLabel).toBe('Calibrate');
    });

    it('should render with custom label', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} label="Recalibrate" />
      );

      const button = getByTestId('calibrate-button');
      expect(button.props.accessibilityLabel).toBe('Recalibrate');
    });

    it('should render with custom testID', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} testID="custom-test-id" />
      );

      expect(getByTestId('custom-test-id')).toBeTruthy();
    });
  });

  describe('Variants', () => {
    it('should render primary variant by default', () => {
      const { getByTestId } = render(<CalibrateButton {...defaultProps} />);

      const button = getByTestId('calibrate-button');
      // Button should be rendered (style validation would require snapshot testing)
      expect(button).toBeTruthy();
    });

    it('should render secondary variant', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} variant="secondary" />
      );

      const button = getByTestId('calibrate-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Sizes', () => {
    it('should render small size', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} size="sm" />
      );

      expect(getByTestId('calibrate-button')).toBeTruthy();
    });

    it('should render medium size by default', () => {
      const { getByTestId } = render(<CalibrateButton {...defaultProps} />);

      expect(getByTestId('calibrate-button')).toBeTruthy();
    });

    it('should render large size', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} size="lg" />
      );

      expect(getByTestId('calibrate-button')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} onPress={onPress} />
      );

      fireEvent.press(getByTestId('calibrate-button'));

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should pass disabled prop to TouchableOpacity', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} onPress={onPress} disabled />
      );

      const button = getByTestId('calibrate-button');
      // Check disabled prop is passed correctly
      expect(button.props.disabled).toBe(true);
    });
  });

  describe('Disabled state', () => {
    it('should render disabled state', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} disabled />
      );

      const button = getByTestId('calibrate-button');
      expect(button).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have correct accessibility label', () => {
      const { getByLabelText } = render(<CalibrateButton {...defaultProps} />);

      expect(getByLabelText('Calibrate')).toBeTruthy();
    });

    it('should have custom accessibility label when label prop is provided', () => {
      const { getByLabelText } = render(
        <CalibrateButton {...defaultProps} label="Start Calibration" />
      );

      expect(getByLabelText('Start Calibration')).toBeTruthy();
    });

    it('should have button accessibility role', () => {
      const { getByTestId } = render(<CalibrateButton {...defaultProps} />);

      const button = getByTestId('calibrate-button');
      expect(button.props.accessibilityRole).toBe('button');
    });

    it('should indicate disabled state in accessibility', () => {
      const { getByTestId } = render(
        <CalibrateButton {...defaultProps} disabled />
      );

      const button = getByTestId('calibrate-button');
      expect(button.props.accessibilityState).toEqual({ disabled: true });
    });
  });

  describe('Props combinations', () => {
    it('should handle all props together', () => {
      const onPress = jest.fn();
      const { getByTestId } = render(
        <CalibrateButton
          onPress={onPress}
          disabled={false}
          variant="secondary"
          size="lg"
          label="Custom Label"
          testID="custom-button"
        />
      );

      const button = getByTestId('custom-button');
      expect(button).toBeTruthy();
      expect(button.props.accessibilityLabel).toBe('Custom Label');

      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should handle variant and size combinations', () => {
      // Primary + small
      const { rerender, getByTestId } = render(
        <CalibrateButton {...defaultProps} variant="primary" size="sm" />
      );
      expect(getByTestId('calibrate-button')).toBeTruthy();

      // Primary + large
      rerender(
        <CalibrateButton {...defaultProps} variant="primary" size="lg" />
      );
      expect(getByTestId('calibrate-button')).toBeTruthy();

      // Secondary + small
      rerender(
        <CalibrateButton {...defaultProps} variant="secondary" size="sm" />
      );
      expect(getByTestId('calibrate-button')).toBeTruthy();

      // Secondary + large
      rerender(
        <CalibrateButton {...defaultProps} variant="secondary" size="lg" />
      );
      expect(getByTestId('calibrate-button')).toBeTruthy();
    });
  });
});

describe('CalibrateButton - Component file structure', () => {
  it('should export CalibrateButton from components index', () => {
    const { CalibrateButton: ExportedButton } =
      require('../src/components') as typeof import('../src/components');
    expect(ExportedButton).toBeDefined();
    expect(typeof ExportedButton).toBe('function');
  });

  it('should export CalibrateButtonProps type', () => {
    // This test verifies the type is exported - compilation would fail if not
    const props: CalibrateButtonProps = {
      onPress: () => {},
      disabled: false,
      variant: 'primary',
      size: 'md',
      label: 'Test',
      testID: 'test',
    };
    expect(props).toBeDefined();
  });
});
