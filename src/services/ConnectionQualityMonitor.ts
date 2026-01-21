import { Device } from 'react-native-ble-plx';
import {
  ConnectionQuality,
  ConnectionQualityLevel,
  ConnectionQualityConfig,
  ConnectionQualityCallback,
  QualityLevelChangeCallback,
  RSSIReading,
  DEFAULT_CONNECTION_QUALITY_CONFIG,
} from '../types';

/**
 * ConnectionQualityMonitor
 *
 * Monitors BLE connection quality using RSSI (Received Signal Strength Indicator) values.
 * Provides real-time quality metrics, trend analysis, and stability detection.
 *
 * Key features:
 * - Periodic RSSI polling from connected BLE device
 * - Sliding window averaging for smoothed quality metrics
 * - Quality level classification (excellent/good/fair/poor)
 * - Connection stability detection based on RSSI variance
 * - Event callbacks for quality updates and level changes
 */
export class ConnectionQualityMonitor {
  private device: Device | null = null;
  private config: ConnectionQualityConfig;
  private rssiReadings: RSSIReading[] = [];
  private pollingInterval: ReturnType<typeof setInterval> | null = null;
  private isMonitoring: boolean = false;
  private currentQualityLevel: ConnectionQualityLevel | null = null;

  private onQualityUpdateCallbacks: ConnectionQualityCallback[] = [];
  private onQualityLevelChangeCallbacks: QualityLevelChangeCallback[] = [];

  constructor(config: Partial<ConnectionQualityConfig> = {}) {
    this.config = { ...DEFAULT_CONNECTION_QUALITY_CONFIG, ...config };
  }

  /**
   * Start monitoring connection quality for a device
   */
  startMonitoring(device: Device): void {
    if (this.isMonitoring) {
      this.stopMonitoring();
    }

    this.device = device;
    this.rssiReadings = [];
    this.currentQualityLevel = null;
    this.isMonitoring = true;

    // Start polling RSSI at configured interval
    this.pollingInterval = setInterval(() => {
      this.pollRSSI();
    }, this.config.pollingIntervalMs);

    // Immediately poll once
    this.pollRSSI();
  }

  /**
   * Stop monitoring connection quality
   */
  stopMonitoring(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isMonitoring = false;
    this.device = null;
    this.rssiReadings = [];
    this.currentQualityLevel = null;
  }

  /**
   * Check if currently monitoring
   */
  isActive(): boolean {
    return this.isMonitoring;
  }

  /**
   * Add callback for quality updates
   */
  addQualityUpdateListener(callback: ConnectionQualityCallback): void {
    this.onQualityUpdateCallbacks.push(callback);
  }

  /**
   * Remove callback for quality updates
   */
  removeQualityUpdateListener(callback: ConnectionQualityCallback): void {
    this.onQualityUpdateCallbacks = this.onQualityUpdateCallbacks.filter(
      (cb) => cb !== callback
    );
  }

  /**
   * Add callback for quality level changes
   */
  addQualityLevelChangeListener(callback: QualityLevelChangeCallback): void {
    this.onQualityLevelChangeCallbacks.push(callback);
  }

  /**
   * Remove callback for quality level changes
   */
  removeQualityLevelChangeListener(callback: QualityLevelChangeCallback): void {
    this.onQualityLevelChangeCallbacks =
      this.onQualityLevelChangeCallbacks.filter((cb) => cb !== callback);
  }

  /**
   * Get the current connection quality metrics
   */
  getCurrentQuality(): ConnectionQuality | null {
    if (this.rssiReadings.length === 0) {
      return null;
    }
    return this.computeQualityMetrics();
  }

  /**
   * Update the monitoring configuration
   */
  updateConfig(config: Partial<ConnectionQualityConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart polling if interval changed and currently monitoring
    if (config.pollingIntervalMs !== undefined && this.isMonitoring) {
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
      }
      this.pollingInterval = setInterval(() => {
        this.pollRSSI();
      }, this.config.pollingIntervalMs);
    }
  }

  /**
   * Poll RSSI value from the connected device
   */
  private async pollRSSI(): Promise<void> {
    if (!this.device || !this.isMonitoring) {
      return;
    }

    try {
      const rssi = await this.device.readRSSI();

      if (rssi !== null) {
        this.addReading(rssi);
        const quality = this.computeQualityMetrics();
        this.notifyQualityUpdate(quality);
        this.checkQualityLevelChange(quality.qualityLevel);
      }
    } catch (error) {
      // Device may have disconnected - stop monitoring
      console.warn('Failed to read RSSI:', error);
      // Don't stop monitoring automatically - let the BLE service handle disconnection
    }
  }

  /**
   * Add a new RSSI reading to the sliding window
   */
  private addReading(rssi: number): void {
    const reading: RSSIReading = {
      rssi,
      timestamp: Date.now(),
    };

    this.rssiReadings.push(reading);

    // Maintain sliding window size
    while (this.rssiReadings.length > this.config.windowSize) {
      this.rssiReadings.shift();
    }
  }

  /**
   * Compute quality metrics from current readings
   */
  private computeQualityMetrics(): ConnectionQuality {
    const rssiValues = this.rssiReadings.map((r) => r.rssi);
    const currentRSSI = rssiValues[rssiValues.length - 1];

    // Compute statistics
    const averageRSSI = this.computeAverage(rssiValues);
    const minRSSI = Math.min(...rssiValues);
    const maxRSSI = Math.max(...rssiValues);
    const rssiStdDev = this.computeStdDev(rssiValues);

    // Determine quality level based on average RSSI
    const qualityLevel = this.computeQualityLevel(averageRSSI);

    // Compute overall quality score (0-100)
    const qualityScore = this.computeQualityScore(averageRSSI, rssiStdDev);

    // Determine stability based on standard deviation
    const isStable = rssiStdDev <= this.config.stabilityThreshold;

    return {
      currentRSSI,
      averageRSSI,
      minRSSI,
      maxRSSI,
      rssiStdDev,
      qualityLevel,
      qualityScore,
      isStable,
      lastUpdated: Date.now(),
      sampleCount: this.rssiReadings.length,
    };
  }

  /**
   * Compute average of values
   */
  private computeAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * Compute standard deviation of values
   */
  private computeStdDev(values: number[]): number {
    if (values.length < 2) return 0;

    const avg = this.computeAverage(values);
    const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
    const avgSquaredDiff = this.computeAverage(squaredDiffs);

    return Math.sqrt(avgSquaredDiff);
  }

  /**
   * Determine quality level from RSSI value
   */
  private computeQualityLevel(rssi: number): ConnectionQualityLevel {
    if (rssi >= this.config.excellentThreshold) {
      return 'excellent';
    } else if (rssi >= this.config.goodThreshold) {
      return 'good';
    } else if (rssi >= this.config.fairThreshold) {
      return 'fair';
    } else {
      return 'poor';
    }
  }

  /**
   * Compute a quality score (0-100) based on RSSI and stability
   *
   * Scoring algorithm:
   * - Base score from RSSI (0-80 points):
   *   - Maps RSSI from -100 dBm (0 points) to -30 dBm (80 points)
   * - Stability bonus (0-20 points):
   *   - Full bonus if stdDev <= 5, linear decrease to 0 at stdDev >= 20
   */
  private computeQualityScore(rssi: number, stdDev: number): number {
    // Base score from RSSI (80% of total)
    // Map RSSI: -100 dBm -> 0, -30 dBm -> 80
    const normalizedRSSI = Math.max(0, Math.min(70, rssi + 100));
    const baseScore = (normalizedRSSI / 70) * 80;

    // Stability bonus (20% of total)
    // Full bonus if stdDev <= 5, linear decrease, 0 at stdDev >= 20
    let stabilityBonus: number;
    if (stdDev <= 5) {
      stabilityBonus = 20;
    } else if (stdDev >= 20) {
      stabilityBonus = 0;
    } else {
      stabilityBonus = 20 * (1 - (stdDev - 5) / 15);
    }

    return Math.round(Math.max(0, Math.min(100, baseScore + stabilityBonus)));
  }

  /**
   * Check for quality level changes and notify listeners
   */
  private checkQualityLevelChange(newLevel: ConnectionQualityLevel): void {
    if (
      this.currentQualityLevel !== null &&
      this.currentQualityLevel !== newLevel
    ) {
      this.notifyQualityLevelChange(newLevel, this.currentQualityLevel);
    }
    this.currentQualityLevel = newLevel;
  }

  /**
   * Notify all quality update listeners
   */
  private notifyQualityUpdate(quality: ConnectionQuality): void {
    this.onQualityUpdateCallbacks.forEach((callback) => {
      try {
        callback(quality);
      } catch (error) {
        console.error('Error in quality update callback:', error);
      }
    });
  }

  /**
   * Notify all quality level change listeners
   */
  private notifyQualityLevelChange(
    newLevel: ConnectionQualityLevel,
    previousLevel: ConnectionQualityLevel
  ): void {
    this.onQualityLevelChangeCallbacks.forEach((callback) => {
      try {
        callback(newLevel, previousLevel);
      } catch (error) {
        console.error('Error in quality level change callback:', error);
      }
    });
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    this.stopMonitoring();
    this.onQualityUpdateCallbacks = [];
    this.onQualityLevelChangeCallbacks = [];
  }
}

/**
 * Utility function to get a human-readable description of quality level
 */
export function getQualityLevelDescription(level: ConnectionQualityLevel): string {
  switch (level) {
    case 'excellent':
      return 'Excellent - Optimal signal strength';
    case 'good':
      return 'Good - Normal operating range';
    case 'fair':
      return 'Fair - Usable but may experience issues';
    case 'poor':
      return 'Poor - Connection may be unstable';
  }
}

/**
 * Utility function to get a color for quality level (for UI)
 */
export function getQualityLevelColor(level: ConnectionQualityLevel): string {
  switch (level) {
    case 'excellent':
      return '#22c55e'; // green
    case 'good':
      return '#3b82f6'; // blue
    case 'fair':
      return '#f59e0b'; // amber
    case 'poor':
      return '#ef4444'; // red
  }
}

// Export singleton instance for convenience
export const connectionQualityMonitor = new ConnectionQualityMonitor();
