/**
 * Type declarations for victory-native
 *
 * Note: victory-native v41+ has a completely different API.
 * These declarations provide backward compatibility for the
 * legacy Victory API patterns used in this codebase.
 *
 * TODO: Migrate to victory-native v41+ CartesianChart API
 */

declare module 'victory-native' {
  import { ComponentType, ReactNode } from 'react';

  export interface VictoryChartProps {
    width?: number;
    height?: number;
    padding?:
      | number
      | { top?: number; bottom?: number; left?: number; right?: number };
    domain?: { x?: [number, number]; y?: [number, number] };
    domainPadding?: number | { x?: number; y?: number };
    style?: object;
    children?: ReactNode;
  }

  export interface VictoryLineProps {
    data?: Array<{ x: number; y: number }>;
    style?: { data?: object; labels?: object };
    interpolation?: string;
    animate?: boolean | object;
  }

  export interface VictoryAreaProps {
    data?: Array<{ x: number; y: number }>;
    style?: { data?: object; labels?: object };
    interpolation?: string;
    animate?: boolean | object;
  }

  export interface VictoryAxisProps {
    dependentAxis?: boolean;
    style?: {
      axis?: object;
      axisLabel?: object;
      grid?: object;
      ticks?: object;
      tickLabels?: object;
    };
    tickFormat?: (t: number) => string;
    tickCount?: number;
    tickValues?: number[];
    label?: string;
  }

  export interface VictoryScatterProps {
    data?: Array<{ x: number; y: number }>;
    style?: { data?: object; labels?: object };
    size?: number | ((datum: any) => number);
  }

  export const VictoryChart: ComponentType<VictoryChartProps>;
  export const VictoryLine: ComponentType<VictoryLineProps>;
  export const VictoryArea: ComponentType<VictoryAreaProps>;
  export const VictoryAxis: ComponentType<VictoryAxisProps>;
  export const VictoryScatter: ComponentType<VictoryScatterProps>;
}
