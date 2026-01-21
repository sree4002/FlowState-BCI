/**
 * Mock implementation of @react-native-community/slider
 */

import React from 'react';

interface SliderProps {
  style?: any;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  value?: number;
  onValueChange?: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  testID?: string;
  accessibilityLabel?: string;
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
}

const Slider: React.FC<SliderProps> = ({
  style,
  value = 0,
  testID,
  ...props
}) => {
  return React.createElement('slider', {
    style,
    value,
    'data-testid': testID,
    ...props,
  });
};

export default Slider;
