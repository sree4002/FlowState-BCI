/**
 * FlowState BCI - Session Data Memory Manager
 *
 * Manages session data buffers with memory limits to prevent
 * excessive memory usage during long sessions.
 */

/**
 * Data point for session history
 */
export interface SessionDataPoint {
  timestamp: number;
  thetaZScore: number;
  signalQuality: number;
  isArtifact: boolean;
}

/**
 * Downsampled data point for long-term storage
 */
export interface DownsampledDataPoint {
  timestampStart: number;
  timestampEnd: number;
  thetaZScoreAvg: number;
  thetaZScoreMin: number;
  thetaZScoreMax: number;
  signalQualityAvg: number;
  artifactPercentage: number;
  sampleCount: number;
}

/**
 * Configuration for the session data manager
 */
export interface SessionDataManagerConfig {
  /** Maximum number of full-resolution data points to keep */
  maxFullResolutionPoints: number;
  /** Maximum number of downsampled points to keep */
  maxDownsampledPoints: number;
  /** Number of points per downsampled bucket */
  downsampleBucketSize: number;
  /** Enable automatic downsampling */
  autoDownsample: boolean;
}

/**
 * Statistics about memory usage
 */
export interface MemoryStats {
  fullResolutionCount: number;
  downsampledCount: number;
  estimatedMemoryBytes: number;
  oldestTimestamp: number | null;
  newestTimestamp: number | null;
  totalPointsProcessed: number;
}

const DEFAULT_CONFIG: SessionDataManagerConfig = {
  maxFullResolutionPoints: 3600, // ~1 hour at 1 Hz
  maxDownsampledPoints: 1440, // ~24 hours of minute-averages
  downsampleBucketSize: 60, // 60 samples per bucket (1 minute at 1 Hz)
  autoDownsample: true,
};

/**
 * SessionDataManager class
 *
 * Efficiently manages session data with automatic downsampling
 * to prevent memory issues during long sessions.
 */
export class SessionDataManager {
  private fullResolutionData: SessionDataPoint[];
  private downsampledData: DownsampledDataPoint[];
  private config: SessionDataManagerConfig;
  private pendingBucket: SessionDataPoint[];
  private totalPointsProcessed: number;

  constructor(config: Partial<SessionDataManagerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.fullResolutionData = [];
    this.downsampledData = [];
    this.pendingBucket = [];
    this.totalPointsProcessed = 0;
  }

  /**
   * Add a new data point
   */
  addDataPoint(point: SessionDataPoint): void {
    this.fullResolutionData.push(point);
    this.totalPointsProcessed++;

    if (this.config.autoDownsample) {
      this.pendingBucket.push(point);

      // Check if we need to downsample
      if (this.pendingBucket.length >= this.config.downsampleBucketSize) {
        this.downsamplePendingBucket();
      }

      // Trim full resolution data if needed
      this.trimFullResolutionData();
    }
  }

  /**
   * Add multiple data points
   */
  addDataPoints(points: SessionDataPoint[]): void {
    for (const point of points) {
      this.addDataPoint(point);
    }
  }

  /**
   * Downsample the pending bucket
   */
  private downsamplePendingBucket(): void {
    if (this.pendingBucket.length === 0) return;

    const bucket = this.pendingBucket;
    const downsampledPoint: DownsampledDataPoint = {
      timestampStart: bucket[0].timestamp,
      timestampEnd: bucket[bucket.length - 1].timestamp,
      thetaZScoreAvg: this.average(bucket.map((p) => p.thetaZScore)),
      thetaZScoreMin: Math.min(...bucket.map((p) => p.thetaZScore)),
      thetaZScoreMax: Math.max(...bucket.map((p) => p.thetaZScore)),
      signalQualityAvg: this.average(bucket.map((p) => p.signalQuality)),
      artifactPercentage:
        (bucket.filter((p) => p.isArtifact).length / bucket.length) * 100,
      sampleCount: bucket.length,
    };

    this.downsampledData.push(downsampledPoint);
    this.pendingBucket = [];

    // Trim downsampled data if needed
    if (this.downsampledData.length > this.config.maxDownsampledPoints) {
      this.downsampledData = this.downsampledData.slice(
        -this.config.maxDownsampledPoints
      );
    }
  }

  /**
   * Trim full resolution data to stay within limits
   */
  private trimFullResolutionData(): void {
    if (this.fullResolutionData.length > this.config.maxFullResolutionPoints) {
      // Keep only the most recent data
      this.fullResolutionData = this.fullResolutionData.slice(
        -this.config.maxFullResolutionPoints
      );
    }
  }

  /**
   * Calculate average of an array
   */
  private average(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  /**
   * Get full resolution data
   */
  getFullResolutionData(): SessionDataPoint[] {
    return [...this.fullResolutionData];
  }

  /**
   * Get downsampled data
   */
  getDownsampledData(): DownsampledDataPoint[] {
    return [...this.downsampledData];
  }

  /**
   * Get data for a specific time range (auto-selects resolution)
   */
  getDataForTimeRange(
    startTime: number,
    endTime: number
  ): {
    fullResolution: SessionDataPoint[];
    downsampled: DownsampledDataPoint[];
  } {
    return {
      fullResolution: this.fullResolutionData.filter(
        (p) => p.timestamp >= startTime && p.timestamp <= endTime
      ),
      downsampled: this.downsampledData.filter(
        (p) => p.timestampEnd >= startTime && p.timestampStart <= endTime
      ),
    };
  }

  /**
   * Get recent data points (for real-time display)
   */
  getRecentData(count: number): SessionDataPoint[] {
    return this.fullResolutionData.slice(-count);
  }

  /**
   * Get memory statistics
   */
  getMemoryStats(): MemoryStats {
    const fullResBytes =
      this.fullResolutionData.length *
      (8 + 8 + 8 + 1); // timestamp + zScore + quality + isArtifact
    const downsampledBytes =
      this.downsampledData.length *
      (8 + 8 + 8 + 8 + 8 + 8 + 8 + 4); // all fields

    const oldestFull = this.fullResolutionData[0]?.timestamp ?? null;
    const oldestDown = this.downsampledData[0]?.timestampStart ?? null;
    const oldestTimestamp =
      oldestFull && oldestDown
        ? Math.min(oldestFull, oldestDown)
        : oldestFull ?? oldestDown;

    const newestFull =
      this.fullResolutionData[this.fullResolutionData.length - 1]?.timestamp ??
      null;
    const newestDown =
      this.downsampledData[this.downsampledData.length - 1]?.timestampEnd ??
      null;
    const newestTimestamp =
      newestFull && newestDown
        ? Math.max(newestFull, newestDown)
        : newestFull ?? newestDown;

    return {
      fullResolutionCount: this.fullResolutionData.length,
      downsampledCount: this.downsampledData.length,
      estimatedMemoryBytes: fullResBytes + downsampledBytes,
      oldestTimestamp,
      newestTimestamp,
      totalPointsProcessed: this.totalPointsProcessed,
    };
  }

  /**
   * Clear all data
   */
  clear(): void {
    this.fullResolutionData = [];
    this.downsampledData = [];
    this.pendingBucket = [];
    this.totalPointsProcessed = 0;
  }

  /**
   * Force flush pending bucket (call at end of session)
   */
  flush(): void {
    if (this.pendingBucket.length > 0) {
      this.downsamplePendingBucket();
    }
  }

  /**
   * Get session summary statistics
   */
  getSessionSummary(): {
    totalDurationSeconds: number;
    avgThetaZScore: number;
    maxThetaZScore: number;
    minThetaZScore: number;
    avgSignalQuality: number;
    artifactPercentage: number;
    dataPointCount: number;
  } {
    const allData = this.fullResolutionData;

    if (allData.length === 0) {
      return {
        totalDurationSeconds: 0,
        avgThetaZScore: 0,
        maxThetaZScore: 0,
        minThetaZScore: 0,
        avgSignalQuality: 0,
        artifactPercentage: 0,
        dataPointCount: 0,
      };
    }

    const thetaScores = allData.map((p) => p.thetaZScore);
    const firstTimestamp = allData[0].timestamp;
    const lastTimestamp = allData[allData.length - 1].timestamp;

    return {
      totalDurationSeconds: (lastTimestamp - firstTimestamp) / 1000,
      avgThetaZScore: this.average(thetaScores),
      maxThetaZScore: Math.max(...thetaScores),
      minThetaZScore: Math.min(...thetaScores),
      avgSignalQuality: this.average(allData.map((p) => p.signalQuality)),
      artifactPercentage:
        (allData.filter((p) => p.isArtifact).length / allData.length) * 100,
      dataPointCount: allData.length,
    };
  }

  /**
   * Export data for saving
   */
  exportData(): {
    fullResolution: SessionDataPoint[];
    downsampled: DownsampledDataPoint[];
    config: SessionDataManagerConfig;
    totalPointsProcessed: number;
  } {
    // Flush any pending data first
    this.flush();

    return {
      fullResolution: [...this.fullResolutionData],
      downsampled: [...this.downsampledData],
      config: { ...this.config },
      totalPointsProcessed: this.totalPointsProcessed,
    };
  }

  /**
   * Import data from saved state
   */
  importData(data: {
    fullResolution: SessionDataPoint[];
    downsampled: DownsampledDataPoint[];
    totalPointsProcessed: number;
  }): void {
    this.fullResolutionData = [...data.fullResolution];
    this.downsampledData = [...data.downsampled];
    this.totalPointsProcessed = data.totalPointsProcessed;
  }
}

/**
 * Create a session data manager with custom config
 */
export function createSessionDataManager(
  config?: Partial<SessionDataManagerConfig>
): SessionDataManager {
  return new SessionDataManager(config);
}

/**
 * Create a lightweight session data manager for shorter sessions
 */
export function createShortSessionDataManager(): SessionDataManager {
  return new SessionDataManager({
    maxFullResolutionPoints: 600, // 10 minutes at 1 Hz
    maxDownsampledPoints: 60,
    downsampleBucketSize: 10,
    autoDownsample: true,
  });
}

/**
 * Create a session data manager optimized for long sessions
 */
export function createLongSessionDataManager(): SessionDataManager {
  return new SessionDataManager({
    maxFullResolutionPoints: 1800, // 30 minutes at 1 Hz
    maxDownsampledPoints: 2880, // 48 hours of minute-averages
    downsampleBucketSize: 60,
    autoDownsample: true,
  });
}

export default SessionDataManager;
