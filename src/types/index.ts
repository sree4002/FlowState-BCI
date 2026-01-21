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
 * Auto-reconnect status for tracking reconnection attempts
 */
export type ReconnectStatusType =
  | 'waiting'
  | 'connecting'
  | 'connected'
  | 'failed'
  | 'max_attempts_reached';

/**
 * Reconnect attempt event data
 */
export interface ReconnectAttemptEvent {
  attempt: number;
  maxAttempts: number;
  status: ReconnectStatusType;
  nextDelayMs: number | null;
  error?: string;
}

/**
 * Current reconnect state
 */
export interface ReconnectState {
  isReconnecting: boolean;
  currentAttempt: number;
  maxAttempts: number;
  autoReconnectEnabled: boolean;
  lastConnectedDeviceId: string | null;
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
 * Samples are interleaved by channel: [Ch0_S0, Ch1_S0, ..., Ch0_S1, Ch1_S1, ...]
 */
export interface EEGDataPacket {
  timestamp: number;
  samples: number[];
  sequence_number: number;
}

/**
 * Extended EEG data packet with channel-separated samples
 * Used when processing requires per-channel access
 */
export interface EEGMultiChannelPacket extends EEGDataPacket {
  channel_samples: number[][];
  channel_count: number;
  samples_per_channel: number;
  device_type: 'headband' | 'earpiece';
  sampling_rate: number;
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

/**
 * Connection quality level based on RSSI values
 * - excellent: RSSI >= -50 dBm (very close range, optimal)
 * - good: -50 > RSSI >= -70 dBm (normal operating range)
 * - fair: -70 > RSSI >= -85 dBm (usable but may have issues)
 * - poor: RSSI < -85 dBm (connection may be unstable)
 */
export type ConnectionQualityLevel = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Individual RSSI reading with timestamp
 */
export interface RSSIReading {
  rssi: number;
  timestamp: number;
}

/**
 * Connection quality metrics aggregated from RSSI readings
 */
export interface ConnectionQuality {
  /** Current RSSI value in dBm */
  currentRSSI: number;
  /** Average RSSI over the monitoring window */
  averageRSSI: number;
  /** Minimum RSSI in the monitoring window */
  minRSSI: number;
  /** Maximum RSSI in the monitoring window */
  maxRSSI: number;
  /** Standard deviation of RSSI (indicates stability) */
  rssiStdDev: number;
  /** Computed quality level based on RSSI */
  qualityLevel: ConnectionQualityLevel;
  /** Quality score 0-100 based on RSSI and stability */
  qualityScore: number;
  /** Whether the connection is considered stable */
  isStable: boolean;
  /** Timestamp of last RSSI update */
  lastUpdated: number;
  /** Number of samples in the current window */
  sampleCount: number;
}

/**
 * Configuration for connection quality monitoring
 */
export interface ConnectionQualityConfig {
  /** Interval between RSSI reads in milliseconds */
  pollingIntervalMs: number;
  /** Size of the sliding window for averaging */
  windowSize: number;
  /** RSSI threshold for excellent connection (dBm) */
  excellentThreshold: number;
  /** RSSI threshold for good connection (dBm) */
  goodThreshold: number;
  /** RSSI threshold for fair connection (dBm) */
  fairThreshold: number;
  /** Standard deviation threshold for stability */
  stabilityThreshold: number;
}

/**
 * Default connection quality configuration
 */
export const DEFAULT_CONNECTION_QUALITY_CONFIG: ConnectionQualityConfig = {
  pollingIntervalMs: 2000,
  windowSize: 10,
  excellentThreshold: -50,
  goodThreshold: -70,
  fairThreshold: -85,
  stabilityThreshold: 10,
};

/**
 * Callback type for connection quality updates
 */
export type ConnectionQualityCallback = (quality: ConnectionQuality) => void;

/**
 * Callback type for quality level change events
 */
export type QualityLevelChangeCallback = (
  newLevel: ConnectionQualityLevel,
  previousLevel: ConnectionQualityLevel
) => void;
