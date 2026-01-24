/**
 * Mock implementation of react-native-chart-kit
 */

import React from 'react';

// Mock LineChart component
export const LineChart: React.FC<{
  data?: {
    labels?: string[];
    datasets?: Array<{ data: number[] }>;
  };
  width?: number;
  height?: number;
  chartConfig?: object;
  bezier?: boolean;
  withDots?: boolean;
  withInnerLines?: boolean;
  withOuterLines?: boolean;
  withHorizontalLabels?: boolean;
  withVerticalLabels?: boolean;
  fromZero?: boolean;
  style?: object;
}> = () => {
  return React.createElement('LineChart', null);
};

// Mock BarChart component
export const BarChart: React.FC<{
  data?: {
    labels?: string[];
    datasets?: Array<{ data: number[] }>;
  };
  width?: number;
  height?: number;
  chartConfig?: object;
  style?: object;
}> = () => {
  return React.createElement('BarChart', null);
};

// Mock PieChart component
export const PieChart: React.FC<{
  data?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  width?: number;
  height?: number;
  chartConfig?: object;
  accessor?: string;
  backgroundColor?: string;
  paddingLeft?: string;
}> = () => {
  return React.createElement('PieChart', null);
};

// Mock ProgressChart component
export const ProgressChart: React.FC<{
  data?: number[] | { data: number[] };
  width?: number;
  height?: number;
  chartConfig?: object;
}> = () => {
  return React.createElement('ProgressChart', null);
};

// Mock ContributionGraph component
export const ContributionGraph: React.FC<{
  values?: Array<{ date: string; count: number }>;
  endDate?: Date;
  numDays?: number;
  width?: number;
  height?: number;
  chartConfig?: object;
}> = () => {
  return React.createElement('ContributionGraph', null);
};

// Mock StackedBarChart component
export const StackedBarChart: React.FC<{
  data?: {
    labels?: string[];
    legend?: string[];
    data?: number[][];
    barColors?: string[];
  };
  width?: number;
  height?: number;
  chartConfig?: object;
}> = () => {
  return React.createElement('StackedBarChart', null);
};

export default {
  LineChart,
  BarChart,
  PieChart,
  ProgressChart,
  ContributionGraph,
  StackedBarChart,
};
