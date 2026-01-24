/**
 * Simulated EEG Source
 *
 * Connects to a local Python WebSocket server that generates simulated EEG metrics.
 * Used for development and testing without real hardware.
 *
 * The Python server streams pre-processed metrics at 5-20 Hz:
 * { timestamp, theta_power, z_score, theta_state, signal_quality, simulated_theta_state }
 *
 * CONTROL MESSAGES:
 * Send { command: 'set_state', state: 'low' | 'normal' | 'high' } to force theta state
 */

import { Platform } from 'react-native';
import {
  EEGSource,
  EEGSourceConfig,
  EEGMetrics,
  EEGMetricsCallback,
  EEGConnectionState,
  ConnectionStateCallback,
} from './EEGSource';

/**
 * Configuration specific to SimulatedEEGSource
 */
export interface SimulatedEEGSourceConfig extends EEGSourceConfig {
  /** WebSocket server URL - should be configured via settings for real devices */
  serverUrl?: string;

  /** Reconnect delay in ms (default: 2000) */
  reconnectDelay?: number;
}

/**
 * Control message to send to the simulator
 */
export interface SimulatorControlMessage {
  command: 'set_state' | 'clear_state';
  state?: 'low' | 'normal' | 'high';
}

/**
 * SimulatedEEGSource
 *
 * Connects to a Python WebSocket server for simulated EEG data.
 * Use this during development to test the full closed-loop flow.
 */
export class SimulatedEEGSource implements EEGSource {
  private config: SimulatedEEGSourceConfig;
  private ws: WebSocket | null = null;
  private connectionState: EEGConnectionState = 'disconnected';
  private metricsCallbacks: Set<EEGMetricsCallback> = new Set();
  private connectionCallbacks: Set<ConnectionStateCallback> = new Set();
  private reconnectAttempts = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private connectionTimeoutTimer: ReturnType<typeof setTimeout> | null = null;
  private shouldReconnect = false;
  private urlSource: 'settings' | 'default' = 'default';

  constructor(config: SimulatedEEGSourceConfig = {}) {
    // Determine if URL came from settings or using default
    this.urlSource = config.serverUrl ? 'settings' : 'default';

    this.config = {
      serverUrl: 'ws://10.5.29.185:8765', // Your LAN IP; override via settings
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 2000,
      ...config,
    };

    // Log initialization details
    console.log('[SimulatedEEGSource] ========== INIT ==========');
    console.log(`[SimulatedEEGSource] Platform: ${Platform.OS}`);
    console.log(`[SimulatedEEGSource] serverUrl: ${this.config.serverUrl}`);
    console.log(`[SimulatedEEGSource] urlSource: ${this.urlSource}`);
    console.log('[SimulatedEEGSource] ===========================');

    if (config.onMetrics) {
      this.metricsCallbacks.add(config.onMetrics);
    }
    if (config.onConnectionStateChange) {
      this.connectionCallbacks.add(config.onConnectionStateChange);
    }
  }

  async start(): Promise<void> {
    if (
      this.connectionState === 'connected' ||
      this.connectionState === 'connecting'
    ) {
      console.warn('[SimulatedEEGSource] Already connected or connecting');
      return;
    }

    // Block on web platform
    if (Platform.OS === 'web') {
      console.error(
        '[SimulatedEEGSource] Simulated mode is NOT supported on web platform'
      );
      this.setConnectionState('error');
      throw new Error(
        'Simulated mode is not supported on web. Use a physical device or emulator.'
      );
    }

    // Validate URL
    const url = this.config.serverUrl!;
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      console.error(
        `[SimulatedEEGSource] Invalid URL scheme: ${url} (must start with ws:// or wss://)`
      );
      this.setConnectionState('error');
      throw new Error(`Invalid WebSocket URL: ${url}`);
    }

    // Warn about localhost on device (ios/android)
    if (
      (url.includes('localhost') || url.includes('127.0.0.1')) &&
      (Platform.OS === 'ios' || Platform.OS === 'android')
    ) {
      console.warn(
        '[SimulatedEEGSource] ⚠️ WARNING: Using localhost URL on device!'
      );
      console.warn(
        '[SimulatedEEGSource] This will NOT work on a physical device.'
      );
      console.warn(
        "[SimulatedEEGSource] Use your computer's LAN IP instead (e.g., ws://192.168.x.x:8765)"
      );
    }

    this.shouldReconnect = true;
    this.reconnectAttempts = 0;
    await this.connect();
  }

  async stop(): Promise<void> {
    this.shouldReconnect = false;
    this.clearReconnectTimer();
    this.clearConnectionTimeout();

    if (this.ws) {
      console.log('[SimulatedEEGSource] Closing WebSocket...');
      this.ws.close(1000, 'Client requested stop');
      this.ws = null;
    }

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

  /**
   * Send a control message to the simulator
   * Use this to force specific theta states for testing
   */
  sendControlMessage(message: SimulatorControlMessage): boolean {
    if (!this.ws || this.connectionState !== 'connected') {
      console.warn('[SimulatedEEGSource] Cannot send message: not connected');
      return false;
    }

    try {
      this.ws.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(
        '[SimulatedEEGSource] Failed to send control message:',
        error
      );
      return false;
    }
  }

  /**
   * Convenience method to force a specific theta state
   */
  forceState(state: 'low' | 'normal' | 'high'): boolean {
    return this.sendControlMessage({ command: 'set_state', state });
  }

  /**
   * Clear forced state and return to natural simulation
   */
  clearForcedState(): boolean {
    return this.sendControlMessage({ command: 'clear_state' });
  }

  // Private methods

  private async connect(): Promise<void> {
    this.setConnectionState('connecting');

    const serverUrl = this.config.serverUrl!;
    console.log('[SimulatedEEGSource] ========== CONNECT ==========');
    console.log(
      `[SimulatedEEGSource] Using serverUrl: ${serverUrl} (source=${this.urlSource})`
    );
    console.log(`[SimulatedEEGSource] Platform: ${Platform.OS}`);
    console.log('[SimulatedEEGSource] Creating WebSocket...');

    try {
      await new Promise<void>((resolve, reject) => {
        // Create WebSocket
        try {
          this.ws = new WebSocket(serverUrl);
          console.log('[SimulatedEEGSource] WebSocket object created');
        } catch (createError) {
          console.error(
            '[SimulatedEEGSource] Failed to create WebSocket:',
            createError
          );
          reject(createError);
          return;
        }

        // Connection timeout (5 seconds)
        this.connectionTimeoutTimer = setTimeout(() => {
          if (this.connectionState === 'connecting') {
            console.error(
              '[SimulatedEEGSource] ❌ Connection TIMEOUT after 5 seconds'
            );
            console.error(
              '[SimulatedEEGSource] Server may not be running or URL may be wrong'
            );
            console.error(`[SimulatedEEGSource] Attempted URL: ${serverUrl}`);
            this.ws?.close();
            reject(new Error(`Connection timeout to ${serverUrl}`));
          }
        }, 5000);

        this.ws.onopen = () => {
          this.clearConnectionTimeout();
          console.log('[SimulatedEEGSource] ✅ WebSocket OPEN');
          console.log(`[SimulatedEEGSource] Connected to: ${serverUrl}`);
          this.reconnectAttempts = 0;
          this.setConnectionState('connected');
          resolve();
        };

        this.ws.onclose = (event: WebSocketCloseEvent) => {
          this.clearConnectionTimeout();
          console.log('[SimulatedEEGSource] ❌ WebSocket CLOSED');
          console.log(`[SimulatedEEGSource]   code: ${event.code}`);
          console.log(
            `[SimulatedEEGSource]   reason: "${event.reason || '(no reason)'}"`
          );
          this.ws = null;

          // Interpret close codes
          if (event.code === 1000) {
            console.log('[SimulatedEEGSource]   → Normal closure');
          } else if (event.code === 1006) {
            console.log(
              '[SimulatedEEGSource]   → Abnormal closure (connection failed or dropped)'
            );
          } else if (event.code === 1002) {
            console.log('[SimulatedEEGSource]   → Protocol error');
          } else if (event.code === 1003) {
            console.log('[SimulatedEEGSource]   → Unsupported data');
          }

          if (this.shouldReconnect && this.config.autoReconnect) {
            this.scheduleReconnect();
          } else {
            this.setConnectionState('disconnected');
          }
        };

        this.ws.onerror = (error: Event) => {
          this.clearConnectionTimeout();
          console.error('[SimulatedEEGSource] ❌ WebSocket ERROR');
          console.error(
            '[SimulatedEEGSource] Error event:',
            JSON.stringify(error, null, 2)
          );
          console.error(`[SimulatedEEGSource] URL was: ${serverUrl}`);
          console.error('[SimulatedEEGSource] Common causes:');
          console.error('  - Server not running');
          console.error('  - Wrong IP address');
          console.error('  - Firewall blocking port 8765');
          console.error('  - Using localhost on physical device');
          this.setConnectionState('error');
          reject(new Error(`WebSocket error connecting to ${serverUrl}`));
        };

        this.ws.onmessage = (event: WebSocketMessageEvent) => {
          this.handleMessage(event.data);
        };
      });
    } catch (error) {
      console.error('[SimulatedEEGSource] Connection failed:', error);
      this.setConnectionState('error');

      if (this.shouldReconnect && this.config.autoReconnect) {
        this.scheduleReconnect();
      }
    }
  }

  private handleMessage(data: string): void {
    try {
      const parsed = JSON.parse(data);

      // Validate required fields
      if (
        typeof parsed.timestamp !== 'number' ||
        typeof parsed.theta_power !== 'number' ||
        typeof parsed.z_score !== 'number' ||
        typeof parsed.theta_state !== 'string' ||
        typeof parsed.signal_quality !== 'number'
      ) {
        console.warn('[SimulatedEEGSource] Invalid message format:', parsed);
        return;
      }

      const metrics: EEGMetrics = {
        timestamp: parsed.timestamp,
        theta_power: parsed.theta_power,
        z_score: parsed.z_score,
        theta_state: parsed.theta_state as 'low' | 'normal' | 'high',
        signal_quality: parsed.signal_quality,
        simulated_theta_state: parsed.simulated_theta_state,
      };

      this.emitMetrics(metrics);
    } catch (error) {
      console.error('[SimulatedEEGSource] Failed to parse message:', error);
    }
  }

  private emitMetrics(metrics: EEGMetrics): void {
    this.metricsCallbacks.forEach((callback) => {
      try {
        callback(metrics);
      } catch (error) {
        console.error('[SimulatedEEGSource] Callback error:', error);
      }
    });
  }

  private setConnectionState(state: EEGConnectionState): void {
    if (this.connectionState !== state) {
      console.log(
        `[SimulatedEEGSource] State: ${this.connectionState} → ${state}`
      );
      this.connectionState = state;
      this.connectionCallbacks.forEach((callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error(
            '[SimulatedEEGSource] Connection callback error:',
            error
          );
        }
      });
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts ?? 5)) {
      console.error('[SimulatedEEGSource] Max reconnect attempts reached');
      this.setConnectionState('error');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.config.reconnectDelay! * this.reconnectAttempts;

    console.log(
      `[SimulatedEEGSource] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  private clearConnectionTimeout(): void {
    if (this.connectionTimeoutTimer) {
      clearTimeout(this.connectionTimeoutTimer);
      this.connectionTimeoutTimer = null;
    }
  }
}
