/**
 * Mock implementation of expo-linear-gradient for Jest testing
 */

import React from 'react';

export const LinearGradient = ({
  children,
  style,
  colors,
  start,
  end,
  testID,
  ...props
}: any) => {
  return React.createElement(
    'View',
    {
      style,
      'data-testid': testID,
      testID,
      'data-colors': colors,
      'data-start': start,
      'data-end': end,
      ...props,
    },
    children
  );
};

export default LinearGradient;
