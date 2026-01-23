/**
 * EEG Source Interface
 *
 * Abstraction layer for EEG data sources. Implementations can be:
 * - SimulatedEEGSource: Receives data from Python WebSocket server (development/testing)
 * - BleEEGSource: Receives data from real BLE hardware (production)
 *
 * SWAPPING SOURCES:
 * To switch from simulated to real hardware, change only the source instantiation:
 *   const source = new SimulatedEEGSource(config);  // Development
 *   const source = new BleEEGSource(config);        // Production
 */

/**
 * EEG metrics received from any source
 * These are pre-processed metrics, NOT raw EEG samples
 */
export interface EEGMetrics {
  /** Unix timestamp in milliseconds */
  timestamp: number;

  /** Theta band power (4-8 Hz) in µV² */
  theta_power: number;

  /** Z-score normalized against baseline */
  z_score: number;

  /**
   * Theta state classification
   * - 'low': Below baseline (good for entrainment)
   * - 'normal': At baseline
   * - 'high': Above baseline (entrainment working)
   */
  theta_state: 'low' | 'normal' | 'high';

  /** Signal quality percentage (0-100) */
  signal_quality: number;

  /**
   * For simulated sources only: the forced theta state
   * Useful for debugging/testing specific scenarios
   */
  simulated_theta_state?: 'low' | 'normal' | 'high';
}

/**
 * Callback type for receiving EEG metrics
 */
export type EEGMetricsCallback = (metrics: EEGMetrics) => void;

/**
 * Connection state for EEG sources
 */
export type EEGConnectionState =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

/**
 * Callback type for connection state changes
 */
export type ConnectionStateCallback = (state: EEGConnectionState) => void;

/**
 * Configuration options common to all EEG sources
 */
export interface EEGSourceConfig {
  /** Callback for receiving metrics updates */
  onMetrics?: EEGMetricsCallback;

  /** Callback for connection state changes */
  onConnectionStateChange?: ConnectionStateCallback;

  /** Auto-reconnect on disconnect (default: true) */
  autoReconnect?: boolean;

  /** Max reconnect attempts (default: 5) */
  maxReconnectAttempts?: number;
}

/**
 * EEG Source Interface
 *
 * All EEG data sources must implement this interface.
 * This ensures the closed-loop controller can work with any source.
 */
export interface EEGSource {
  /**
   * Start receiving EEG data
   * For SimulatedEEGSource: connects to WebSocket server
   * For BleEEGSource: connects to BLE device and starts notifications
   */
  start(): Promise<void>;

  /**
   * Stop receiving EEG data and clean up resources
   */
  stop(): Promise<void>;

  /**
   * Register a callback to receive metrics updates
   * Multiple callbacks can be registered
   */
  onMetrics(callback: EEGMetricsCallback): void;

  /**
   * Remove a previously registered metrics callback
   */
  offMetrics(callback: EEGMetricsCallback): void;

  /**
   * Register a callback for connection state changes
   */
  onConnectionStateChange(callback: ConnectionStateCallback): void;

  /**
   * Remove a previously registered connection state callback
   */
  offConnectionStateChange(callback: ConnectionStateCallback): void;

  /**
   * Get the current connection state
   */
  getConnectionState(): EEGConnectionState;

  /**
   * Check if the source is currently connected and streaming
   */
  isConnected(): boolean;
}
