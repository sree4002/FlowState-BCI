import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AppSettings } from '../types';

/**
 * Settings context state interface
 */
export interface SettingsContextState {
  settings: AppSettings;
}

/**
 * Settings context actions interface
 */
export interface SettingsContextActions {
  updateSettings: (updates: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

/**
 * Combined settings context type
 */
export type SettingsContextType = SettingsContextState & SettingsContextActions;

/**
 * Default application settings
 */
export const defaultSettings: AppSettings = {
  // Device settings
  paired_device_id: null,
  auto_reconnect: true,

  // Notification settings
  notifications_enabled: true,
  notification_style: 'smart',
  notification_frequency: 3,
  quiet_hours_start: null,
  quiet_hours_end: null,

  // Audio settings
  audio_mixing_mode: 'exclusive',
  default_volume: 70,
  mixing_ratio: 0.5,

  // Entrainment settings
  auto_boost_enabled: false,
  boost_frequency: 6.0,
  boost_time: 5,

  // Theta threshold settings
  target_zscore: 1.0,
  closed_loop_behavior: 'reduce_intensity',

  // Accessibility settings
  text_size: 'medium',
  reduce_motion: false,
  haptic_feedback: true,

  // Privacy settings
  anonymous_analytics: false,

  // Onboarding status
  onboarding_completed: false,

  // A/B testing
  ab_testing_enabled: false,

  // Developer settings
  developer_mode_enabled: false,
  simulated_mode_enabled: false,
  // NOTE: For physical devices, use your computer's LAN IP
  // localhost only works on iOS Simulator; Android emulator needs 10.0.2.2
  simulated_mode_server_url: 'ws://10.5.29.191:8765',
  force_theta_state: 'auto',
  demo_mode_enabled: false,
};

/**
 * Settings context for managing app preferences
 */
const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined
);

/**
 * Settings provider props
 */
interface SettingsProviderProps {
  children: ReactNode;
  initialSettings?: Partial<AppSettings>;
}

/**
 * SettingsProvider component
 * Manages global application settings and user preferences
 */
export const SettingsProvider: React.FC<SettingsProviderProps> = ({
  children,
  initialSettings = {},
}) => {
  const [settings, setSettings] = useState<AppSettings>({
    ...defaultSettings,
    ...initialSettings,
  });

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook to use settings context
 * Throws error if used outside SettingsProvider
 */
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
