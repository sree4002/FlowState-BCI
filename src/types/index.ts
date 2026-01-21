// Core TypeScript types for FlowState BCI application

// Re-export navigation types
export * from './navigation';

/**
 * Baseline profile containing calibrated EEG statistics
 * Used to normalize real-time theta measurements
 */
export interface BaselineProfile {
  theta_mean: number;
  theta_std: number;
  alpha_mean: number;
  beta_mean: number;
  peak_theta_freq: number;
  optimal_freq: number;
  calibration_timestamp: number;
  quality_score: number;
}

/**
 * Session record representing a single BCI entrainment session
 */
export interface Session {
  id: number;
  session_type: 'calibration' | 'quick_boost' | 'custom' | 'scheduled' | 'sham';
  start_time: number;
  end_time: number;
  duration_seconds: number;
  avg_theta_zscore: number;
  max_theta_zscore: number;
  entrainment_freq: number;
  volume: number;
  signal_quality_avg: number;
  subjective_rating: number | null;
  notes: string | null;
}

/**
 * Circadian pattern analysis data
 * Aggregates session performance by hour of day
 */
export interface CircadianPattern {
  hour_of_day: number;
  avg_theta_mean: number;
  avg_theta_std: number;
  session_count: number;
  avg_subjective_rating: number;
}

/**
 * BLE device information
 */
export interface DeviceInfo {
  id: string;
  name: string;
  type: 'headband' | 'earpiece';
  sampling_rate: number;
  battery_level: number | null;
  firmware_version: string | null;
  rssi: number | null;
  is_connected: boolean;
  last_connected: number | null;
}

/**
 * Application settings and user preferences
 */
export interface AppSettings {
  // Device settings
  paired_device_id: string | null;
  auto_reconnect: boolean;

  // Notification settings
  notifications_enabled: boolean;
  notification_style: 'simple' | 'smart' | 'gentle' | 'off';
  notification_frequency: number;
  quiet_hours_start: number | null;
  quiet_hours_end: number | null;

  // Audio settings
  audio_mixing_mode: 'exclusive' | 'mix';
  default_volume: number;
  mixing_ratio: number;

  // Entrainment settings
  auto_boost_enabled: boolean;
  boost_frequency: number;
  boost_time: number;

  // Theta threshold settings
  target_zscore: number;
  closed_loop_behavior:
    | 'reduce_intensity'
    | 'stop_entrainment'
    | 'maintain_level';

  // Accessibility settings
  text_size: 'small' | 'medium' | 'large';
  reduce_motion: boolean;
  haptic_feedback: boolean;

  // Privacy settings
  anonymous_analytics: boolean;

  // Onboarding status
  onboarding_completed: boolean;

  // A/B testing
  ab_testing_enabled: boolean;
}

/**
 * EEG data packet from BLE device
 */
export interface EEGDataPacket {
  timestamp: number;
  samples: number[];
  sequence_number: number;
}

/**
 * Real-time signal quality metrics
 */
export interface SignalQuality {
  score: number;
  artifact_percentage: number;
  has_amplitude_artifact: boolean;
  has_gradient_artifact: boolean;
  has_frequency_artifact: boolean;
}

/**
 * Session configuration for starting a new session
 */
export interface SessionConfig {
  type: 'calibration' | 'quick_boost' | 'custom' | 'scheduled';
  duration_minutes: number;
  entrainment_freq: number;
  volume: number;
  target_zscore: number;
  closed_loop_behavior:
    | 'reduce_intensity'
    | 'stop_entrainment'
    | 'maintain_level';
}

/**
 * Session state for active session management
 */
export type SessionState = 'idle' | 'running' | 'paused' | 'stopped';

/**
 * Calibration state for calibration flow
 */
export type CalibrationState =
  | 'instructions'
  | 'countdown'
  | 'recording'
  | 'processing'
  | 'complete';

/**
 * Visualization mode for active session screen
 */
export type VisualizationMode = 'numeric' | 'gauge' | 'chart';

/**
 * Theme color palette
 */
export interface ThemeColors {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  error: string;
  warning: string;
  success: string;
  text: string;
  textSecondary: string;
  border: string;
}
