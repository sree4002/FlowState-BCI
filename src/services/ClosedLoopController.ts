/**
 * Closed Loop Controller
 *
 * Implements the core closed-loop neurofeedback logic:
 * 1. Monitors EEG metrics from any EEGSource
 * 2. Detects when theta is below threshold (entrainment needed)
 * 3. Triggers entrainment output with appropriate cooldown
 * 4. Stops entrainment when theta recovers
 *
 * THRESHOLD LOGIC:
 * - Start entrainment when z_score < startThreshold (default: -0.5)
 * - Stop entrainment when z_score > stopThreshold (default: 0.5)
 *
 * COOLDOWN LOGIC:
 * - After stopping entrainment, wait cooldownMs before restarting
 * - Prevents rapid on/off cycling
 */

import { EEGSource, EEGMetrics, EEGConnectionState } from './eeg/EEGSource';
import { EntrainmentOutput } from './entrainment/EntrainmentOutput';

/**
 * Controller state
 */
export type ControllerState =
  | 'idle' // Not running
  | 'monitoring' // Running, not entraining
  | 'entraining' // Running, entrainment active
  | 'cooldown'; // Running, waiting after entrainment stopped

/**
 * Callback for controller state changes
 */
export type ControllerStateCallback = (
  state: ControllerState,
  metrics?: EEGMetrics
) => void;

/**
 * Configuration for ClosedLoopController
 */
export interface ClosedLoopControllerConfig {
  /** Z-score threshold to START entrainment (default: -0.5) */
  startThreshold?: number;

  /** Z-score threshold to STOP entrainment (default: 0.5) */
  stopThreshold?: number;

  /** Cooldown period in ms after stopping entrainment (default: 5000) */
  cooldownMs?: number;

  /** Minimum time entrainment must play before stopping (default: 3000) */
  minEntrainmentMs?: number;

  /** Entrainment frequency in Hz (default: 6) */
  entrainmentFrequency?: number;

  /** Entrainment volume 0-1 (default: 0.7) */
  entrainmentVolume?: number;

  /** Callback for state changes */
  onStateChange?: ControllerStateCallback;

  /** Callback for each metrics update (for UI display) */
  onMetrics?: (metrics: EEGMetrics) => void;
}

/**
 * ClosedLoopController
 *
 * Orchestrates the EEG source and entrainment output for
 * closed-loop neurofeedback.
 */
export class ClosedLoopController {
  private eegSource: EEGSource;
  private entrainmentOutput: EntrainmentOutput;
  private config: Required<ClosedLoopControllerConfig>;
  private state: ControllerState = 'idle';
  private stateCallbacks: Set<ControllerStateCallback> = new Set();
  private lastMetrics: EEGMetrics | null = null;
  private entrainmentStartTime: number | null = null;
  private cooldownEndTime: number | null = null;
  private boundHandleMetrics: (metrics: EEGMetrics) => void;
  private boundHandleConnectionState: (state: EEGConnectionState) => void;

  constructor(
    eegSource: EEGSource,
    entrainmentOutput: EntrainmentOutput,
    config: ClosedLoopControllerConfig = {}
  ) {
    this.eegSource = eegSource;
    this.entrainmentOutput = entrainmentOutput;

    this.config = {
      startThreshold: -0.5,
      stopThreshold: 0.5,
      cooldownMs: 5000,
      minEntrainmentMs: 3000,
      entrainmentFrequency: 6,
      entrainmentVolume: 0.7,
      onStateChange: () => {},
      onMetrics: () => {},
      ...config,
    };

    if (config.onStateChange) {
      this.stateCallbacks.add(config.onStateChange);
    }

    // Bind handlers
    this.boundHandleMetrics = this.handleMetrics.bind(this);
    this.boundHandleConnectionState = this.handleConnectionState.bind(this);
  }

  /**
   * Start the closed-loop control
   */
  async start(): Promise<void> {
    if (this.state !== 'idle') {
      console.warn('[ClosedLoopController] Already running');
      return;
    }

    // Register callbacks
    this.eegSource.onMetrics(this.boundHandleMetrics);
    this.eegSource.onConnectionStateChange(this.boundHandleConnectionState);

    // Start EEG source
    await this.eegSource.start();

    this.setState('monitoring');
  }

  /**
   * Stop the closed-loop control
   */
  async stop(): Promise<void> {
    console.log('[ClosedLoopController] stop() called, current state:', this.state);

    // Always try to stop entrainment, regardless of state or isPlaying()
    // This ensures audio stops even if there's a state mismatch
    try {
      console.log('[ClosedLoopController] Force stopping entrainment output...');
      await this.entrainmentOutput.stop();
    } catch (error) {
      console.error('[ClosedLoopController] Error stopping entrainment:', error);
    }

    // Unregister callbacks (safe to call even if not registered)
    this.eegSource.offMetrics(this.boundHandleMetrics);
    this.eegSource.offConnectionStateChange(this.boundHandleConnectionState);

    // Stop EEG source
    try {
      await this.eegSource.stop();
    } catch (error) {
      console.error('[ClosedLoopController] Error stopping EEG source:', error);
    }

    // Reset state
    this.entrainmentStartTime = null;
    this.cooldownEndTime = null;
    this.lastMetrics = null;

    this.setState('idle');
    console.log('[ClosedLoopController] Stopped');
  }

  /**
   * Get current controller state
   */
  getState(): ControllerState {
    return this.state;
  }

  /**
   * Get the most recent EEG metrics
   */
  getLastMetrics(): EEGMetrics | null {
    return this.lastMetrics;
  }

  /**
   * Check if entrainment is currently active
   */
  isEntraining(): boolean {
    return this.state === 'entraining';
  }

  /**
   * Register callback for state changes
   */
  onStateChange(callback: ControllerStateCallback): void {
    this.stateCallbacks.add(callback);
  }

  /**
   * Remove state change callback
   */
  offStateChange(callback: ControllerStateCallback): void {
    this.stateCallbacks.delete(callback);
  }

  /**
   * Update configuration at runtime
   */
  updateConfig(updates: Partial<ClosedLoopControllerConfig>): void {
    Object.assign(this.config, updates);

    // Update entrainment output if playing
    if (this.entrainmentOutput.isPlaying()) {
      if (updates.entrainmentFrequency !== undefined) {
        this.entrainmentOutput.setFrequency(updates.entrainmentFrequency);
      }
      if (updates.entrainmentVolume !== undefined) {
        this.entrainmentOutput.setVolume(updates.entrainmentVolume);
      }
    }
  }

  // Private methods

  private handleMetrics(metrics: EEGMetrics): void {
    this.lastMetrics = metrics;

    // Notify listeners
    this.config.onMetrics(metrics);

    // Run control logic
    this.processMetrics(metrics);
  }

  private processMetrics(metrics: EEGMetrics): void {
    const now = Date.now();

    switch (this.state) {
      case 'monitoring':
        // Check if we should start entrainment
        if (metrics.z_score < this.config.startThreshold) {
          this.startEntrainment();
        }
        break;

      case 'entraining':
        // Check if we should stop entrainment
        if (metrics.z_score > this.config.stopThreshold) {
          // Only stop if minimum time has passed
          const elapsed = this.entrainmentStartTime
            ? now - this.entrainmentStartTime
            : 0;
          if (elapsed >= this.config.minEntrainmentMs) {
            this.stopEntrainment();
          }
        }
        break;

      case 'cooldown':
        // Check if cooldown has expired
        if (this.cooldownEndTime && now >= this.cooldownEndTime) {
          this.cooldownEndTime = null;
          this.setState('monitoring', metrics);

          // Immediately check if entrainment needed
          if (metrics.z_score < this.config.startThreshold) {
            this.startEntrainment();
          }
        }
        break;

      case 'idle':
        // Not running, ignore metrics
        break;
    }
  }

  private async startEntrainment(): Promise<void> {
    if (this.entrainmentOutput.isPlaying()) {
      return;
    }

    try {
      this.entrainmentStartTime = Date.now();
      await this.entrainmentOutput.play(
        this.config.entrainmentFrequency,
        this.config.entrainmentVolume
      );
      this.setState('entraining', this.lastMetrics ?? undefined);
    } catch (error) {
      console.error('[ClosedLoopController] Failed to start entrainment:', error);
      this.setState('monitoring', this.lastMetrics ?? undefined);
    }
  }

  private async stopEntrainment(): Promise<void> {
    if (!this.entrainmentOutput.isPlaying()) {
      return;
    }

    try {
      await this.entrainmentOutput.stop();
    } catch (error) {
      console.error('[ClosedLoopController] Failed to stop entrainment:', error);
    }

    // Enter cooldown
    this.entrainmentStartTime = null;
    this.cooldownEndTime = Date.now() + this.config.cooldownMs;
    this.setState('cooldown', this.lastMetrics ?? undefined);
  }

  private handleConnectionState(connectionState: EEGConnectionState): void {
    console.log('[ClosedLoopController] Connection state changed:', connectionState);

    if (connectionState === 'disconnected' || connectionState === 'error') {
      // Always try to stop entrainment when EEG source disconnects
      console.log('[ClosedLoopController] Connection lost, force stopping entrainment...');
      this.entrainmentOutput.stop().catch((err) => {
        console.error('[ClosedLoopController] Error stopping on disconnect:', err);
      });

      if (this.state !== 'idle') {
        this.setState('monitoring');
      }
    }
  }

  private setState(state: ControllerState, metrics?: EEGMetrics): void {
    if (this.state !== state) {
      this.state = state;
      this.stateCallbacks.forEach((callback) => {
        try {
          callback(state, metrics);
        } catch (error) {
          console.error('[ClosedLoopController] State callback error:', error);
        }
      });
      this.config.onStateChange(state, metrics);
    }
  }
}
