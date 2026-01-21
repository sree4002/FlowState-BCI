/**
 * Navigation type definitions for FlowState BCI
 * Provides type-safe navigation throughout the app
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/**
 * Root tab navigator parameter list
 * Defines all screens in the bottom tab navigator
 */
export type RootTabParamList = {
  Dashboard: undefined;
  Session: undefined;
  History: undefined;
  Settings: undefined;
};

/**
 * Screen names as a const for type-safe references
 */
export const ScreenNames = {
  Dashboard: 'Dashboard',
  Session: 'Session',
  History: 'History',
  Settings: 'Settings',
} as const;

/**
 * Props type for each tab screen
 */
export type DashboardScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Dashboard'
>;
export type SessionScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Session'
>;
export type HistoryScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'History'
>;
export type SettingsScreenProps = BottomTabScreenProps<
  RootTabParamList,
  'Settings'
>;

/**
 * Generic tab screen props type
 */
export type TabScreenProps<T extends keyof RootTabParamList> =
  BottomTabScreenProps<RootTabParamList, T>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
