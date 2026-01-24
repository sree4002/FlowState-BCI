/**
 * BLE EEG Source (STUB)
 *
 * Placeholder for real BLE hardware integration.
 * Will connect to actual EEG headband/earpiece devices via BLE.
 *
 * SWAP INSTRUCTIONS:
 * When ready to integrate real hardware:
 * 1. Implement the connect() method to use BLEService
 * 2. Implement handleBleData() to process raw EEG samples
 * 3. Add signal processing to compute theta_power, z_score, etc.
 * 4. Replace SimulatedEEGSource with BleEEGSource in the app
 *
 * The ClosedLoopController and PhoneAudioOutput require NO changes.
 */

import {
  EEGSource,
  EEGSourceConfig,
  EEGMetrics,
  EEGMetricsCallback,
  EEGConnectionState,
  ConnectionStateCallback,
} from './EEGSource';

/**
 * Configuration specific to BleEEGSource
 */
export interface BleEEGSourceConfig extends EEGSourceConfig {
  /** BLE device ID to connect to */
  deviceId?: string;

  /** Device type: 'headband' (500Hz) or 'earpiece' (250Hz) */
  deviceType?: 'headband' | 'earpiece';
}

/**
 * BleEEGSource (STUB)
 *
 * NOT YET IMPLEMENTED - This is a placeholder.
 * See SimulatedEEGSource for the working implementation pattern.
 */
export class BleEEGSource implements EEGSource {
  private config: BleEEGSourceConfig;
  private connectionState: EEGConnectionState = 'disconnected';
  private metricsCallbacks: Set<EEGMetricsCallback> = new Set();
  private connectionCallbacks: Set<ConnectionStateCallback> = new Set();

  constructor(config: BleEEGSourceConfig = {}) {
    this.config = {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      deviceType: 'headband',
      ...config,
    };

    if (config.onMetrics) {
      this.metricsCallbacks.add(config.onMetrics);
    }
    if (config.onConnectionStateChange) {
      this.connectionCallbacks.add(config.onConnectionStateChange);
    }
  }

  async start(): Promise<void> {
    // TODO: Implement BLE connection
    // 1. Use BLEService to scan/connect to device
    // 2. Subscribe to EEG data characteristic
    // 3. Start signal processing pipeline
    console.warn(
      '[BleEEGSource] NOT IMPLEMENTED - Use SimulatedEEGSource for development'
    );
    throw new Error(
      'BleEEGSource not yet implemented. Use SimulatedEEGSource for development.'
    );
  }

  async stop(): Promise<void> {
    // TODO: Implement BLE disconnection
    // 1. Unsubscribe from characteristics
    // 2. Disconnect from device
    // 3. Clean up signal processing buffers
    this.setConnectionState('disconnected');
  }

  onMetrics(callback: EEGMetricsCallback): void {
    this.metricsCallbacks.add(callback);
  }

  offMetrics(callback: EEGMetricsCallback): void {
    this.metricsCallbacks.delete(callback);
  }

  onConnectionStateChange(callback: ConnectionStateCallback): void {
    this.connectionCallbacks.add(callback);
  }

  offConnectionStateChange(callback: ConnectionStateCallback): void {
    this.connectionCallbacks.delete(callback);
  }

  getConnectionState(): EEGConnectionState {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  // Private methods

  private setConnectionState(state: EEGConnectionState): void {
    if (this.connectionState !== state) {
      this.connectionState = state;
      this.connectionCallbacks.forEach((callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error('[BleEEGSource] Connection callback error:', error);
        }
      });
    }
  }

  /**
   * TODO: Implement this method to process raw BLE data
   * Should compute EEGMetrics from raw samples using:
   * - DC offset removal
   * - Butterworth bandpass filter
   * - Welch's periodogram
   * - Band power extraction
   * - Z-score normalization
   */

  private handleBleData(_rawData: Uint8Array): void {
    // TODO: Process raw EEG samples to compute metrics
    // const metrics: EEGMetrics = {
    //   timestamp: Date.now(),
    //   theta_power: computedThetaPower,
    //   z_score: computedZScore,
    //   theta_state: derivedState,
    //   signal_quality: computedQuality,
    // };
    // this.emitMetrics(metrics);
  }

  private emitMetrics(_metrics: EEGMetrics): void {
    // TODO: Emit to all registered callbacks
  }
}
