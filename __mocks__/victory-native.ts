/**
 * Mock implementation of victory-native
 */

import React from 'react';

// Mock VictoryChart component
export const VictoryChart: React.FC<{
  children?: React.ReactNode;
  width?: number;
  height?: number;
  padding?: any;
  domain?: any;
}> = ({ children }) => {
  return React.createElement('VictoryChart', null, children);
};

// Mock VictoryLine component
export const VictoryLine: React.FC<{
  data?: any[];
  interpolation?: string;
  style?: any;
}> = () => {
  return React.createElement('VictoryLine', null);
};

// Mock VictoryArea component
export const VictoryArea: React.FC<{
  data?: any[];
  interpolation?: string;
  style?: any;
}> = () => {
  return React.createElement('VictoryArea', null);
};

// Mock VictoryAxis component
export const VictoryAxis: React.FC<{
  dependentAxis?: boolean;
  style?: any;
}> = () => {
  return React.createElement('VictoryAxis', null);
};

// Mock VictoryBar component
export const VictoryBar: React.FC<{
  data?: any[];
  style?: any;
}> = () => {
  return React.createElement('VictoryBar', null);
};

// Mock VictoryPie component
export const VictoryPie: React.FC<{
  data?: any[];
  colorScale?: any;
  style?: any;
}> = () => {
  return React.createElement('VictoryPie', null);
};

// Mock VictoryScatter component
export const VictoryScatter: React.FC<{
  data?: any[];
  style?: any;
}> = () => {
  return React.createElement('VictoryScatter', null);
};

// Mock VictoryLabel component
export const VictoryLabel: React.FC<{
  text?: string | string[];
  style?: any;
}> = () => {
  return React.createElement('VictoryLabel', null);
};

// Mock VictoryTheme
export const VictoryTheme = {
  material: {},
  grayscale: {},
};

export default {
  VictoryChart,
  VictoryLine,
  VictoryArea,
  VictoryAxis,
  VictoryBar,
  VictoryPie,
  VictoryScatter,
  VictoryLabel,
  VictoryTheme,
};
