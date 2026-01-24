/**
 * Tests for SessionDataManager utility
 */

import {
  SessionDataManager,
  createSessionDataManager,
  createShortSessionDataManager,
  createLongSessionDataManager,
  SessionDataPoint,
} from '../src/utils/sessionDataManager';

describe('SessionDataManager', () => {
  describe('initialization', () => {
    it('should create manager with default config', () => {
      const manager = new SessionDataManager();
      expect(manager).toBeDefined();
    });

    it('should create manager with custom config', () => {
      const manager = new SessionDataManager({
        maxFullResolutionPoints: 100,
        maxDownsampledPoints: 50,
        downsampleBucketSize: 10,
        autoDownsample: true,
      });
      expect(manager).toBeDefined();
    });
  });

  describe('adding data points', () => {
    it('should add a single data point', () => {
      const manager = new SessionDataManager();
      const point: SessionDataPoint = {
        timestamp: Date.now(),
        thetaZScore: 1.5,
        signalQuality: 85,
        isArtifact: false,
      };

      manager.addDataPoint(point);

      const data = manager.getFullResolutionData();
      expect(data.length).toBe(1);
      expect(data[0].thetaZScore).toBe(1.5);
    });

    it('should add multiple data points', () => {
      const manager = new SessionDataManager();
      const points: SessionDataPoint[] = [
        { timestamp: 1000, thetaZScore: 1.0, signalQuality: 80, isArtifact: false },
        { timestamp: 2000, thetaZScore: 1.5, signalQuality: 85, isArtifact: false },
        { timestamp: 3000, thetaZScore: 2.0, signalQuality: 90, isArtifact: false },
      ];

      manager.addDataPoints(points);

      const data = manager.getFullResolutionData();
      expect(data.length).toBe(3);
    });
  });

  describe('memory limits', () => {
    it('should respect maxFullResolutionPoints limit', () => {
      const manager = new SessionDataManager({
        maxFullResolutionPoints: 5,
        autoDownsample: true,
        downsampleBucketSize: 100, // High to avoid downsampling
      });

      // Add more points than the limit
      for (let i = 0; i < 10; i++) {
        manager.addDataPoint({
          timestamp: i * 1000,
          thetaZScore: i,
          signalQuality: 80,
          isArtifact: false,
        });
      }

      const data = manager.getFullResolutionData();
      expect(data.length).toBeLessThanOrEqual(5);
    });

    it('should downsample when bucket is full', () => {
      const manager = new SessionDataManager({
        maxFullResolutionPoints: 100,
        maxDownsampledPoints: 100,
        downsampleBucketSize: 5,
        autoDownsample: true,
      });

      // Add enough points to trigger downsampling
      for (let i = 0; i < 10; i++) {
        manager.addDataPoint({
          timestamp: i * 1000,
          thetaZScore: i * 0.1,
          signalQuality: 80 + i,
          isArtifact: i % 2 === 0,
        });
      }

      const downsampled = manager.getDownsampledData();
      // Should have at least one downsampled bucket
      expect(downsampled.length).toBeGreaterThan(0);
    });
  });

  describe('data retrieval', () => {
    it('should get recent data points', () => {
      const manager = new SessionDataManager();

      for (let i = 0; i < 10; i++) {
        manager.addDataPoint({
          timestamp: i * 1000,
          thetaZScore: i,
          signalQuality: 80,
          isArtifact: false,
        });
      }

      const recent = manager.getRecentData(3);
      expect(recent.length).toBe(3);
      expect(recent[0].thetaZScore).toBe(7);
      expect(recent[2].thetaZScore).toBe(9);
    });

    it('should get data for time range', () => {
      const manager = new SessionDataManager();

      for (let i = 0; i < 10; i++) {
        manager.addDataPoint({
          timestamp: i * 1000,
          thetaZScore: i,
          signalQuality: 80,
          isArtifact: false,
        });
      }

      const rangeData = manager.getDataForTimeRange(2000, 5000);
      expect(rangeData.fullResolution.length).toBe(4);
    });
  });

  describe('memory statistics', () => {
    it('should return memory stats', () => {
      const manager = new SessionDataManager();

      manager.addDataPoint({
        timestamp: Date.now(),
        thetaZScore: 1.5,
        signalQuality: 85,
        isArtifact: false,
      });

      const stats = manager.getMemoryStats();

      expect(stats.fullResolutionCount).toBe(1);
      expect(stats.estimatedMemoryBytes).toBeGreaterThan(0);
      expect(stats.totalPointsProcessed).toBe(1);
    });

    it('should track oldest and newest timestamps', () => {
      const manager = new SessionDataManager();
      const startTime = 1000;
      const endTime = 5000;

      manager.addDataPoint({
        timestamp: startTime,
        thetaZScore: 1.0,
        signalQuality: 80,
        isArtifact: false,
      });

      manager.addDataPoint({
        timestamp: endTime,
        thetaZScore: 2.0,
        signalQuality: 90,
        isArtifact: false,
      });

      const stats = manager.getMemoryStats();

      expect(stats.oldestTimestamp).toBe(startTime);
      expect(stats.newestTimestamp).toBe(endTime);
    });
  });

  describe('session summary', () => {
    it('should calculate session summary', () => {
      const manager = new SessionDataManager();

      const points: SessionDataPoint[] = [
        { timestamp: 1000, thetaZScore: 1.0, signalQuality: 80, isArtifact: false },
        { timestamp: 2000, thetaZScore: 2.0, signalQuality: 85, isArtifact: false },
        { timestamp: 3000, thetaZScore: 3.0, signalQuality: 90, isArtifact: true },
      ];

      manager.addDataPoints(points);

      const summary = manager.getSessionSummary();

      expect(summary.avgThetaZScore).toBe(2.0);
      expect(summary.maxThetaZScore).toBe(3.0);
      expect(summary.minThetaZScore).toBe(1.0);
      expect(summary.dataPointCount).toBe(3);
      expect(summary.artifactPercentage).toBeCloseTo(33.33, 1);
    });

    it('should return zeros for empty manager', () => {
      const manager = new SessionDataManager();
      const summary = manager.getSessionSummary();

      expect(summary.avgThetaZScore).toBe(0);
      expect(summary.dataPointCount).toBe(0);
    });
  });

  describe('data management', () => {
    it('should clear all data', () => {
      const manager = new SessionDataManager();

      manager.addDataPoint({
        timestamp: Date.now(),
        thetaZScore: 1.5,
        signalQuality: 85,
        isArtifact: false,
      });

      manager.clear();

      const data = manager.getFullResolutionData();
      expect(data.length).toBe(0);
    });

    it('should flush pending bucket', () => {
      const manager = new SessionDataManager({
        downsampleBucketSize: 5,
        autoDownsample: true,
      });

      // Add 3 points (not enough to trigger automatic flush)
      for (let i = 0; i < 3; i++) {
        manager.addDataPoint({
          timestamp: i * 1000,
          thetaZScore: i,
          signalQuality: 80,
          isArtifact: false,
        });
      }

      // Force flush
      manager.flush();

      const downsampled = manager.getDownsampledData();
      expect(downsampled.length).toBe(1);
    });
  });

  describe('data export and import', () => {
    it('should export data', () => {
      const manager = new SessionDataManager();

      manager.addDataPoint({
        timestamp: Date.now(),
        thetaZScore: 1.5,
        signalQuality: 85,
        isArtifact: false,
      });

      const exported = manager.exportData();

      expect(exported.fullResolution.length).toBe(1);
      expect(exported.config).toBeDefined();
      expect(exported.totalPointsProcessed).toBe(1);
    });

    it('should import data', () => {
      const manager = new SessionDataManager();

      const importData = {
        fullResolution: [
          { timestamp: 1000, thetaZScore: 1.5, signalQuality: 85, isArtifact: false },
        ],
        downsampled: [],
        totalPointsProcessed: 1,
      };

      manager.importData(importData);

      const data = manager.getFullResolutionData();
      expect(data.length).toBe(1);
    });
  });
});

describe('Factory functions', () => {
  it('should create session data manager', () => {
    const manager = createSessionDataManager();
    expect(manager).toBeInstanceOf(SessionDataManager);
  });

  it('should create session data manager with config', () => {
    const manager = createSessionDataManager({
      maxFullResolutionPoints: 500,
    });
    expect(manager).toBeInstanceOf(SessionDataManager);
  });

  it('should create short session manager', () => {
    const manager = createShortSessionDataManager();
    expect(manager).toBeInstanceOf(SessionDataManager);
  });

  it('should create long session manager', () => {
    const manager = createLongSessionDataManager();
    expect(manager).toBeInstanceOf(SessionDataManager);
  });
});

describe('Downsampled data quality', () => {
  it('should correctly calculate downsampled averages', () => {
    const manager = new SessionDataManager({
      downsampleBucketSize: 4,
      autoDownsample: true,
    });

    const points: SessionDataPoint[] = [
      { timestamp: 1000, thetaZScore: 1.0, signalQuality: 80, isArtifact: false },
      { timestamp: 2000, thetaZScore: 2.0, signalQuality: 80, isArtifact: false },
      { timestamp: 3000, thetaZScore: 3.0, signalQuality: 80, isArtifact: false },
      { timestamp: 4000, thetaZScore: 4.0, signalQuality: 80, isArtifact: false },
    ];

    manager.addDataPoints(points);

    const downsampled = manager.getDownsampledData();
    expect(downsampled.length).toBe(1);
    expect(downsampled[0].thetaZScoreAvg).toBe(2.5);
    expect(downsampled[0].thetaZScoreMin).toBe(1.0);
    expect(downsampled[0].thetaZScoreMax).toBe(4.0);
  });

  it('should correctly calculate artifact percentage', () => {
    const manager = new SessionDataManager({
      downsampleBucketSize: 4,
      autoDownsample: true,
    });

    const points: SessionDataPoint[] = [
      { timestamp: 1000, thetaZScore: 1.0, signalQuality: 80, isArtifact: true },
      { timestamp: 2000, thetaZScore: 2.0, signalQuality: 80, isArtifact: true },
      { timestamp: 3000, thetaZScore: 3.0, signalQuality: 80, isArtifact: false },
      { timestamp: 4000, thetaZScore: 4.0, signalQuality: 80, isArtifact: false },
    ];

    manager.addDataPoints(points);

    const downsampled = manager.getDownsampledData();
    expect(downsampled[0].artifactPercentage).toBe(50);
  });
});
