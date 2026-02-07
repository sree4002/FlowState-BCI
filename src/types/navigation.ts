// Navigation types for TypeScript type-safe navigation
// Used with @react-navigation/native and @react-navigation/bottom-tabs

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { Session, SessionConfig, BaselineProfile } from './index';

/**
 * Root stack navigator param list
 * Contains the main navigation structure including modals and flows
 */
export type RootStackParamList = {
  // Main tab navigator
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Onboarding flow (shown before main tabs for new users)
  Onboarding: undefined;

  // Device pairing modal/screen
  DevicePairing: {
    returnTo?: keyof MainTabParamList;
  };

  // Calibration flow
  Calibration: {
    returnTo?: keyof MainTabParamList;
  };

  // Session detail screen (from History)
  SessionDetail: {
    sessionId: number;
    session?: Session;
  };
};

/**
 * Main bottom tab navigator param list
 * The primary navigation structure after onboarding
 */
export type MainTabParamList = {
  Dashboard: undefined;
  Session: SessionTabParams;
  History: NavigatorScreenParams<HistoryTabParamList>;
  Games: NavigatorScreenParams<GamesStackParamList>;
  Settings: undefined;
};

/**
 * Session tab params
 * Can be navigated to with optional pre-configuration
 */
export type SessionTabParams =
  | undefined
  | {
      // Pre-configure session parameters
      config?: Partial<SessionConfig>;
      // Auto-start session on navigation
      autoStart?: boolean;
      // Preset name if using a preset
      presetName?: string;
    };

/**
 * History screen tab navigator param list
 * Sub-navigation within the History tab
 */
export type HistoryTabParamList = {
  List: undefined;
  Calendar: {
    selectedMonth?: string; // Format: YYYY-MM
  };
  Trends: {
    timeRange?: '7d' | '30d' | '3mo' | 'all';
  };
  Stats: undefined;
};

/**
 * Onboarding flow navigator param list
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
  Tour1: undefined;
  Tour2: undefined;
  Tour3: undefined;
  Permissions: undefined;
  DevicePairingPrompt: undefined;
  FirstSessionSuggestion: undefined;
};

/**
 * Calibration flow navigator param list
 */
export type CalibrationStackParamList = {
  Instructions: undefined;
  Countdown: {
    durationMinutes?: 5 | 10;
  };
  Progress: {
    durationMinutes: 5 | 10;
    startedAt: number;
  };
  Summary: {
    baseline: BaselineProfile;
    qualityScore: number;
    cleanDataPercentage: number;
  };
};

/**
 * Games navigator param list
 */
export type GamesStackParamList = {
  GameHub: undefined;
  GameConfig: {
    gameType: 'word_recall' | 'nback';
  };
  WordRecallGame: {
    config: any; // GameConfig from games types
  };
  NBackGame: {
    config: any; // GameConfig from games types
  };
  GameResults: {
    sessionId: string;
  };
};

/**
 * Settings screen navigator param list
 * For settings sub-screens
 */
export type SettingsStackParamList = {
  SettingsMain: undefined;
  DeviceManagement: undefined;
  NotificationPreferences: undefined;
  AudioSettings: undefined;
  EntrainmentSettings: undefined;
  ThetaThreshold: undefined;
  ThemeAccessibility: undefined;
  DataManagement: undefined;
  PrivacySettings: undefined;
  About: undefined;
  Integrations: undefined;
};

// ============================================================================
// Screen Props Types
// ============================================================================

/**
 * Props for screens in the Root Stack
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

/**
 * Props for screens in the Main Tab Navigator
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    RootStackScreenProps<keyof RootStackParamList>
  >;

/**
 * Props for screens in the History Tab Navigator
 */
export type HistoryTabScreenProps<T extends keyof HistoryTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<HistoryTabParamList, T>,
    MainTabScreenProps<'History'>
  >;

/**
 * Props for screens in the Onboarding Stack
 */
export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

/**
 * Props for screens in the Calibration Stack
 */
export type CalibrationScreenProps<T extends keyof CalibrationStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<CalibrationStackParamList, T>,
    RootStackScreenProps<'Calibration'>
  >;

/**
 * Props for screens in the Games Stack
 */
export type GamesScreenProps<T extends keyof GamesStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<GamesStackParamList, T>,
    MainTabScreenProps<'Games'>
  >;

/**
 * Props for screens in the Settings Stack
 */
export type SettingsScreenProps<T extends keyof SettingsStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<SettingsStackParamList, T>,
    MainTabScreenProps<'Settings'>
  >;

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * All screen names in the app (flattened)
 */
export type AllScreenNames =
  | keyof RootStackParamList
  | keyof MainTabParamList
  | keyof HistoryTabParamList
  | keyof OnboardingStackParamList
  | keyof CalibrationStackParamList
  | keyof SettingsStackParamList;

/**
 * Route params type for any screen
 */
export type RouteParams<T extends AllScreenNames> =
  T extends keyof RootStackParamList
    ? RootStackParamList[T]
    : T extends keyof MainTabParamList
      ? MainTabParamList[T]
      : T extends keyof HistoryTabParamList
        ? HistoryTabParamList[T]
        : T extends keyof OnboardingStackParamList
          ? OnboardingStackParamList[T]
          : T extends keyof CalibrationStackParamList
            ? CalibrationStackParamList[T]
            : T extends keyof SettingsStackParamList
              ? SettingsStackParamList[T]
              : never;

// ============================================================================
// Type declarations for useNavigation and useRoute hooks
// ============================================================================

/**
 * Declare module augmentation for @react-navigation/native
 * This enables type checking for useNavigation() throughout the app
 */
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
