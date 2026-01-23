/**
 * Entrainment Output Interface
 *
 * Abstraction layer for entrainment audio output.
 * Current implementation: PhoneAudioOutput (plays on phone speakers/headphones)
 * Future: Could add BleEarpieceOutput for bone conduction earpiece
 */

/**
 * Entrainment state
 */
export type EntrainmentState = 'idle' | 'playing' | 'stopping';

/**
 * Callback for entrainment state changes
 */
export type EntrainmentStateCallback = (state: EntrainmentState) => void;

/**
 * Configuration for entrainment output
 */
export interface EntrainmentOutputConfig {
  /** Target frequency in Hz (typically 4-8 Hz for theta) */
  frequency?: number;

  /** Volume level (0.0 - 1.0) */
  volume?: number;

  /** Callback for state changes */
  onStateChange?: EntrainmentStateCallback;
}

/**
 * Entrainment Output Interface
 *
 * All entrainment output implementations must follow this interface.
 * This allows the ClosedLoopController to work with any audio output.
 */
export interface EntrainmentOutput {
  /**
   * Start playing entrainment audio
   * @param frequency - Target frequency in Hz (default: 6 Hz theta)
   * @param volume - Volume level 0.0-1.0 (default: 0.7)
   */
  play(frequency?: number, volume?: number): Promise<void>;

  /**
   * Stop entrainment audio
   * Includes graceful fade-out to prevent jarring stop
   */
  stop(): Promise<void>;

  /**
   * Adjust frequency while playing
   * @param frequency - New target frequency in Hz
   */
  setFrequency(frequency: number): void;

  /**
   * Adjust volume while playing
   * @param volume - New volume level 0.0-1.0
   */
  setVolume(volume: number): void;

  /**
   * Get current entrainment state
   */
  getState(): EntrainmentState;

  /**
   * Check if entrainment is currently active
   */
  isPlaying(): boolean;

  /**
   * Register callback for state changes
   */
  onStateChange(callback: EntrainmentStateCallback): void;

  /**
   * Remove state change callback
   */
  offStateChange(callback: EntrainmentStateCallback): void;

  /**
   * Clean up resources (call when done)
   */
  dispose(): Promise<void>;
}
