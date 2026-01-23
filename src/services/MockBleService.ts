/**
 * Mock BLE Service for development and testing without hardware
 *
 * This service simulates a BLE BCI device connection and generates
 * realistic EEG data patterns for development and testing purposes.
 */

import { DeviceInfo, EEGDataPacket, SignalQuality } from '../types';

/**
 * EEG data with theta power metrics (extends basic packet)
 */
export interface EEGDataWithMetrics extends EEGDataPacket {
  thetaPower: number;
  alphaPower: number;
  betaPower: number;
  thetaZScore: number;
}

/**
 * Mock device configuration options
 */
export interface MockDeviceConfig {
  /** Device type: headband (500Hz) or earpiece (250Hz) */
  deviceType: 'headband' | 'earpiece';
  /** Simulated signal quality (0-100) */
  signalQuality: number;
  /** Whether to simulate connection failures */
  simulateConnectionFailures: boolean;
  /** Connection failure probability (0-1) */
  connectionFailureProbability: number;
  /** Data generation interval in ms */
  dataIntervalMs: number;
  /** Simulated battery level (0-100) */
  batteryLevel: number;
  /** Enable artifact simulation */
  simulateArtifacts: boolean;
  /** Artifact probability per packet (0-1) */
  artifactProbability: number;
}

/**
 * Simulation scenario presets
 */
export type SimulationScenario =
  | 'ideal' // Perfect signal, stable theta
  | 'realistic' // Normal variation with occasional artifacts
  | 'noisy' // Frequent artifacts, unstable signal
  | 'entrainment_success' // Gradual theta increase
  | 'entrainment_plateau' // Theta plateau at target
  | 'poor_connection' // Weak signal, frequent drops
  | 'custom'; // Use custom config

/**
 * Entrainment status from mock device
 */
export interface EntrainmentStatus {
  isPlaying: boolean;
  frequency: number;
  volume: number;
}

/**
 * Listener callback types
 */
export type ConnectionListener = (isConnected: boolean) => void;
export type DataListener = (data: EEGDataWithMetrics) => void;
export type StatusListener = (status: EntrainmentStatus) => void;
export type SignalQualityListener = (quality: SignalQuality) => void;

/**
 * Default mock device configuration
 */
const DEFAULT_CONFIG: MockDeviceConfig = {
  deviceType: 'headband',
  signalQuality: 85,
  simulateConnectionFailures: false,
  connectionFailureProbability: 0.1,
  dataIntervalMs: 100, // 10 packets per second
  batteryLevel: 80,
  simulateArtifacts: true,
  artifactProbability: 0.05,
};

/**
 * Scenario presets
 */
const SCENARIO_CONFIGS: Record<
  Exclude<SimulationScenario, 'custom'>,
  Partial<MockDeviceConfig>
> = {
  ideal: {
    signalQuality: 100,
    simulateConnectionFailures: false,
    simulateArtifacts: false,
    artifactProbability: 0,
  },
  realistic: {
    signalQuality: 85,
    simulateConnectionFailures: false,
    simulateArtifacts: true,
    artifactProbability: 0.05,
  },
  noisy: {
    signalQuality: 60,
    simulateConnectionFailures: false,
    simulateArtifacts: true,
    artifactProbability: 0.2,
  },
  entrainment_success: {
    signalQuality: 90,
    simulateConnectionFailures: false,
    simulateArtifacts: true,
    artifactProbability: 0.03,
  },
  entrainment_plateau: {
    signalQuality: 88,
    simulateConnectionFailures: false,
    simulateArtifacts: true,
    artifactProbability: 0.04,
  },
  poor_connection: {
    signalQuality: 45,
    simulateConnectionFailures: true,
    connectionFailureProbability: 0.3,
    simulateArtifacts: true,
    artifactProbability: 0.15,
  },
};

/**
 * Mock BLE Service class
 * Simulates BLE device behavior for development/testing
 */
export class MockBleService {
  private config: MockDeviceConfig;
  private scenario: SimulationScenario;
  private isConnected: boolean = false;
  private device: DeviceInfo | null = null;
  private dataInterval: ReturnType<typeof setInterval> | null = null;
  private sequenceNumber: number = 0;
  private sessionStartTime: number = 0;

  // Simulated baseline values for z-score calculation
  private baselineThetaMean: number = 10;
  private baselineThetaStd: number = 3;

  // Entrainment state
  private entrainmentStatus: EntrainmentStatus = {
    isPlaying: false,
    frequency: 6.0,
    volume: 0.5,
  };

  // Event listeners
  private listeners: {
    onConnectionChange: ConnectionListener[];
    onDataReceived: DataListener[];
    onStatusUpdate: StatusListener[];
    onSignalQuality: SignalQualityListener[];
  } = {
    onConnectionChange: [],
    onDataReceived: [],
    onStatusUpdate: [],
    onSignalQuality: [],
  };

  constructor(
    scenario: SimulationScenario = 'realistic',
    customConfig?: Partial<MockDeviceConfig>
  ) {
    this.scenario = scenario;
    this.config = this.buildConfig(scenario, customConfig);
  }

  /**
   * Build configuration from scenario and custom overrides
   */
  private buildConfig(
    scenario: SimulationScenario,
    customConfig?: Partial<MockDeviceConfig>
  ): MockDeviceConfig {
    if (scenario === 'custom') {
      return { ...DEFAULT_CONFIG, ...customConfig };
    }
    return {
      ...DEFAULT_CONFIG,
      ...SCENARIO_CONFIGS[scenario],
      ...customConfig,
    };
  }

  /**
   * Update configuration at runtime
   */
  setConfig(config: Partial<MockDeviceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Switch to a different simulation scenario
   */
  setScenario(
    scenario: SimulationScenario,
    customConfig?: Partial<MockDeviceConfig>
  ): void {
    this.scenario = scenario;
    this.config = this.buildConfig(scenario, customConfig);
  }

  /**
   * Get current configuration
   */
  getConfig(): MockDeviceConfig {
    return { ...this.config };
  }

  /**
   * Get current scenario
   */
  getScenario(): SimulationScenario {
    return this.scenario;
  }

  /**
   * Set baseline values for z-score calculation
   */
  setBaseline(thetaMean: number, thetaStd: number): void {
    this.baselineThetaMean = thetaMean;
    this.baselineThetaStd = thetaStd;
  }

  /**
   * Simulate requesting BLE permissions (always succeeds in mock)
   */
  async requestPermissions(): Promise<boolean> {
    // Simulate small delay
    await this.delay(100);
    return true;
  }

  /**
   * Simulate scanning for and connecting to a BCI device
   */
  async scanAndConnect(): Promise<DeviceInfo> {
    if (this.isConnected) {
      throw new Error('Already connected to a device');
    }

    // Simulate scan delay
    await this.delay(1500 + Math.random() * 1000);

    // Check for simulated connection failure
    if (
      this.config.simulateConnectionFailures &&
      Math.random() < this.config.connectionFailureProbability
    ) {
      throw new Error('Scan timeout - no BCI device found');
    }

    return this.connectToDevice();
  }

  /**
   * Connect to a simulated device
   */
  async connectToDevice(): Promise<DeviceInfo> {
    // Simulate connection delay
    await this.delay(500 + Math.random() * 500);

    // Check for simulated connection failure
    if (
      this.config.simulateConnectionFailures &&
      Math.random() < this.config.connectionFailureProbability
    ) {
      throw new Error('Connection failed - device not responding');
    }

    const samplingRate = this.config.deviceType === 'headband' ? 500 : 250;

    this.device = {
      id: `mock-${this.config.deviceType}-${Date.now()}`,
      name: `FlowState ${this.config.deviceType === 'headband' ? 'Headband' : 'Earpiece'} (Mock)`,
      type: this.config.deviceType,
      sampling_rate: samplingRate,
      battery_level: this.config.batteryLevel,
      firmware_version: '1.0.0-mock',
      rssi: -50 - Math.floor(Math.random() * 30),
      is_connected: true,
      last_connected: Date.now(),
    };

    this.isConnected = true;
    this.sessionStartTime = Date.now();
    this.sequenceNumber = 0;

    this.notifyConnectionChange(true);
    this.startDataGeneration();

    return this.device;
  }

  /**
   * Disconnect from the simulated device
   */
  async disconnect(): Promise<void> {
    if (!this.isConnected) {
      return;
    }

    this.stopDataGeneration();
    this.isConnected = false;

    if (this.device) {
      this.device.is_connected = false;
      this.device = null;
    }

    this.entrainmentStatus.isPlaying = false;
    this.notifyConnectionChange(false);
    this.notifyStatusUpdate();
  }

  /**
   * Start generating simulated EEG data
   */
  private startDataGeneration(): void {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
    }

    this.dataInterval = setInterval(() => {
      if (this.isConnected) {
        const data = this.generateEEGData();
        this.notifyDataReceived(data);

        // Periodically send signal quality updates
        if (this.sequenceNumber % 10 === 0) {
          const quality = this.generateSignalQuality();
          this.notifySignalQuality(quality);
        }
      }
    }, this.config.dataIntervalMs);
  }

  /**
   * Stop generating simulated EEG data
   */
  private stopDataGeneration(): void {
    if (this.dataInterval) {
      clearInterval(this.dataInterval);
      this.dataInterval = null;
    }
  }

  /**
   * Generate simulated EEG data packet
   */
  private generateEEGData(): EEGDataWithMetrics {
    this.sequenceNumber++;
    const timestamp = Date.now();
    const elapsedSeconds = (timestamp - this.sessionStartTime) / 1000;

    // Base theta power with scenario-specific modulation
    let thetaPower = this.generateThetaPower(elapsedSeconds);
    const alphaPower = this.generateAlphaPower();
    const betaPower = this.generateBetaPower();

    // Add entrainment effect if active
    if (this.entrainmentStatus.isPlaying) {
      thetaPower = this.applyEntrainmentEffect(thetaPower, elapsedSeconds);
    }

    // Add artifacts if enabled
    if (
      this.config.simulateArtifacts &&
      Math.random() < this.config.artifactProbability
    ) {
      thetaPower = this.addArtifact(thetaPower);
    }

    // Calculate z-score
    const thetaZScore =
      (thetaPower - this.baselineThetaMean) / this.baselineThetaStd;

    // Generate sample array based on device type
    const samplingRate = this.config.deviceType === 'headband' ? 500 : 250;
    const samplesPerPacket = Math.floor(
      (samplingRate * this.config.dataIntervalMs) / 1000
    );
    const samples = this.generateRawSamples(samplesPerPacket, thetaPower);

    return {
      timestamp,
      samples,
      sequence_number: this.sequenceNumber,
      thetaPower,
      alphaPower,
      betaPower,
      thetaZScore,
    };
  }

  /**
   * Generate theta power based on scenario
   */
  private generateThetaPower(elapsedSeconds: number): number {
    const baseTheta = this.baselineThetaMean;
    const noise = (Math.random() - 0.5) * 2 * this.baselineThetaStd * 0.5;

    // Add slow oscillation (circadian-like rhythm)
    const slowOscillation = Math.sin(elapsedSeconds / 60) * 0.5;

    // Scenario-specific modulation
    let scenarioModulation = 0;

    switch (this.scenario) {
      case 'ideal':
        // Stable theta with minimal variation
        return baseTheta + noise * 0.3;

      case 'entrainment_success':
        // Gradual increase over time
        scenarioModulation = Math.min(elapsedSeconds / 120, 1) * 3;
        break;

      case 'entrainment_plateau':
        // Quick rise then plateau
        scenarioModulation = Math.min(elapsedSeconds / 30, 1) * 2;
        break;

      case 'noisy':
        // Extra noise
        scenarioModulation = (Math.random() - 0.5) * 4;
        break;

      case 'poor_connection':
        // Occasional signal dropouts
        if (Math.random() < 0.1) {
          return 0; // Simulated dropout
        }
        break;

      default:
        // Realistic with natural variation
        break;
    }

    return Math.max(
      0,
      baseTheta + noise + slowOscillation + scenarioModulation
    );
  }

  /**
   * Generate alpha power (typically inversely related to theta during focus)
   */
  private generateAlphaPower(): number {
    const baseAlpha = 8;
    const noise = (Math.random() - 0.5) * 3;
    return Math.max(0, baseAlpha + noise);
  }

  /**
   * Generate beta power
   */
  private generateBetaPower(): number {
    const baseBeta = 5;
    const noise = (Math.random() - 0.5) * 2;
    return Math.max(0, baseBeta + noise);
  }

  /**
   * Apply entrainment effect to theta power
   */
  private applyEntrainmentEffect(
    thetaPower: number,
    _elapsedSeconds: number
  ): number {
    // Entrainment increases theta by a factor related to volume and frequency match
    const entrainmentBoost = this.entrainmentStatus.volume * 2;
    return thetaPower * (1 + entrainmentBoost * 0.2);
  }

  /**
   * Add artifact to signal
   */
  private addArtifact(value: number): number {
    // Random artifact types
    const artifactType = Math.random();
    if (artifactType < 0.3) {
      // Amplitude spike
      return value * (2 + Math.random() * 3);
    } else if (artifactType < 0.6) {
      // Signal dropout
      return 0;
    } else {
      // Gradual drift
      return value + (Math.random() - 0.5) * value;
    }
  }

  /**
   * Generate raw sample array
   */
  private generateRawSamples(count: number, thetaPower: number): number[] {
    const samples: number[] = [];
    for (let i = 0; i < count; i++) {
      // Generate sinusoidal sample at theta frequency with noise
      const t = (i / count) * 2 * Math.PI * this.entrainmentStatus.frequency;
      const sample =
        Math.sin(t) * thetaPower + (Math.random() - 0.5) * thetaPower * 0.1;
      samples.push(sample);
    }
    return samples;
  }

  /**
   * Generate signal quality metrics
   */
  private generateSignalQuality(): SignalQuality {
    const baseQuality = this.config.signalQuality;
    const noise = (Math.random() - 0.5) * 10;
    const score = Math.max(0, Math.min(100, baseQuality + noise));

    // Determine artifact flags based on quality and probability
    const hasArtifact =
      score < 70 || Math.random() < this.config.artifactProbability;

    return {
      score,
      artifact_percentage: hasArtifact
        ? 20 + Math.random() * 30
        : Math.random() * 10,
      has_amplitude_artifact: hasArtifact && Math.random() < 0.4,
      has_gradient_artifact: hasArtifact && Math.random() < 0.3,
      has_frequency_artifact: hasArtifact && Math.random() < 0.2,
    };
  }

  // ==================== Entrainment Control ====================

  /**
   * Start entrainment playback
   */
  async startEntrainment(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    await this.delay(50);
    this.entrainmentStatus.isPlaying = true;
    this.notifyStatusUpdate();
  }

  /**
   * Stop entrainment playback
   */
  async stopEntrainment(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    await this.delay(50);
    this.entrainmentStatus.isPlaying = false;
    this.notifyStatusUpdate();
  }

  /**
   * Set entrainment frequency
   */
  async setFrequency(frequency: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    if (frequency < 4 || frequency > 8) {
      throw new Error('Frequency must be between 4 and 8 Hz');
    }

    await this.delay(50);
    this.entrainmentStatus.frequency = frequency;
    this.notifyStatusUpdate();
  }

  /**
   * Set entrainment volume
   */
  async setVolume(volume: number): Promise<void> {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    if (volume < 0 || volume > 1) {
      throw new Error('Volume must be between 0 and 1');
    }

    await this.delay(50);
    this.entrainmentStatus.volume = volume;
    this.notifyStatusUpdate();
  }

  /**
   * Send arbitrary command (for compatibility)
   */
  async sendCommand(command: string, _data?: unknown): Promise<void> {
    if (!this.isConnected) {
      throw new Error('No device connected');
    }

    await this.delay(50);
    console.log(`[MockBleService] Command sent: ${command}`);
  }

  // ==================== Status Methods ====================

  /**
   * Get connection status
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get current device info
   */
  getDeviceInfo(): DeviceInfo | null {
    return this.device ? { ...this.device } : null;
  }

  /**
   * Get entrainment status
   */
  getEntrainmentStatus(): EntrainmentStatus {
    return { ...this.entrainmentStatus };
  }

  // ==================== Event Listeners ====================

  /**
   * Add connection change listener
   */
  addConnectionListener(callback: ConnectionListener): void {
    this.listeners.onConnectionChange.push(callback);
  }

  /**
   * Remove connection change listener
   */
  removeConnectionListener(callback: ConnectionListener): void {
    this.listeners.onConnectionChange =
      this.listeners.onConnectionChange.filter((cb) => cb !== callback);
  }

  /**
   * Add data received listener
   */
  addDataListener(callback: DataListener): void {
    this.listeners.onDataReceived.push(callback);
  }

  /**
   * Remove data received listener
   */
  removeDataListener(callback: DataListener): void {
    this.listeners.onDataReceived = this.listeners.onDataReceived.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Add status update listener
   */
  addStatusListener(callback: StatusListener): void {
    this.listeners.onStatusUpdate.push(callback);
  }

  /**
   * Remove status update listener
   */
  removeStatusListener(callback: StatusListener): void {
    this.listeners.onStatusUpdate = this.listeners.onStatusUpdate.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Add signal quality listener
   */
  addSignalQualityListener(callback: SignalQualityListener): void {
    this.listeners.onSignalQuality.push(callback);
  }

  /**
   * Remove signal quality listener
   */
  removeSignalQualityListener(callback: SignalQualityListener): void {
    this.listeners.onSignalQuality = this.listeners.onSignalQuality.filter(
      (cb) => cb !== callback
    );
  }

  // ==================== Notification Methods ====================

  private notifyConnectionChange(isConnected: boolean): void {
    this.listeners.onConnectionChange.forEach((cb) => cb(isConnected));
  }

  private notifyDataReceived(data: EEGDataWithMetrics): void {
    this.listeners.onDataReceived.forEach((cb) => cb(data));
  }

  private notifyStatusUpdate(): void {
    this.listeners.onStatusUpdate.forEach((cb) => cb(this.entrainmentStatus));
  }

  private notifySignalQuality(quality: SignalQuality): void {
    this.listeners.onSignalQuality.forEach((cb) => cb(quality));
  }

  // ==================== Utility Methods ====================

  /**
   * Simulate async delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Cleanup and destroy the service
   */
  destroy(): void {
    this.stopDataGeneration();
    this.isConnected = false;
    this.device = null;
    this.listeners = {
      onConnectionChange: [],
      onDataReceived: [],
      onStatusUpdate: [],
      onSignalQuality: [],
    };
  }
}

/**
 * Create a mock BLE service instance with the given scenario
 */
export const createMockBleService = (
  scenario: SimulationScenario = 'realistic',
  customConfig?: Partial<MockDeviceConfig>
): MockBleService => {
  return new MockBleService(scenario, customConfig);
};

/**
 * Default singleton instance for convenience
 */
export const mockBleService = new MockBleService('realistic');

export default mockBleService;
