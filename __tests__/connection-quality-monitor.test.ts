import {
  ConnectionQuality,
  ConnectionQualityLevel,
  ConnectionQualityConfig,
  DEFAULT_CONNECTION_QUALITY_CONFIG,
} from '../src/types';

// Mock the ConnectionQualityMonitor for testing without react-native-ble-plx
// We test the logic directly

/**
 * Simplified ConnectionQualityMonitor logic for testing
 * This mirrors the actual implementation but without BLE dependencies
 */
class TestableConnectionQualityMonitor {
  private config: ConnectionQualityConfig;
  private rssiReadings: { rssi: number; timestamp: number }[] = [];

  constructor(config: Partial<ConnectionQualityConfig> = {}) {
    this.config = { ...DEFAULT_CONNECTION_QUALITY_CONFIG, ...config };
  }

  addReading(rssi: number): void {
    this.rssiReadings.push({ rssi, timestamp: Date.now() });
    while (this.rssiReadings.length > this.config.windowSize) {
      this.rssiReadings.shift();
    }
  }

  clearReadings(): void {
    this.rssiReadings = [];
  }

  getCurrentQuality(): ConnectionQuality | null {
    if (this.rssiReadings.length === 0) {
      return null;
    }
    return this.computeQualityMetrics();
  }

  private computeQualityMetrics(): ConnectionQuality {
    const rssiValues = this.rssiReadings.map((r) => r.rssi);
    const currentRSSI = rssiValues[rssiValues.length - 1];

    const averageRSSI = this.computeAverage(rssiValues);
    const minRSSI = Math.min(...rssiValues);
    const maxRSSI = Math.max(...rssiValues);
    const rssiStdDev = this.computeStdDev(rssiValues);

    const qualityLevel = this.computeQualityLevel(averageRSSI);
    const qualityScore = this.computeQualityScore(averageRSSI, rssiStdDev);
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

  private computeAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private computeStdDev(values: number[]): number {
    if (values.length < 2) return 0;
    const avg = this.computeAverage(values);
    const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
    const avgSquaredDiff = this.computeAverage(squaredDiffs);
    return Math.sqrt(avgSquaredDiff);
  }

  computeQualityLevel(rssi: number): ConnectionQualityLevel {
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

  computeQualityScore(rssi: number, stdDev: number): number {
    const normalizedRSSI = Math.max(0, Math.min(70, rssi + 100));
    const baseScore = (normalizedRSSI / 70) * 80;

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
}

describe('ConnectionQualityMonitor', () => {
  let monitor: TestableConnectionQualityMonitor;

  beforeEach(() => {
    monitor = new TestableConnectionQualityMonitor();
  });

  describe('Quality Level Classification', () => {
    test('should classify RSSI >= -50 as excellent', () => {
      expect(monitor.computeQualityLevel(-40)).toBe('excellent');
      expect(monitor.computeQualityLevel(-50)).toBe('excellent');
      expect(monitor.computeQualityLevel(-30)).toBe('excellent');
    });

    test('should classify -50 > RSSI >= -70 as good', () => {
      expect(monitor.computeQualityLevel(-51)).toBe('good');
      expect(monitor.computeQualityLevel(-60)).toBe('good');
      expect(monitor.computeQualityLevel(-70)).toBe('good');
    });

    test('should classify -70 > RSSI >= -85 as fair', () => {
      expect(monitor.computeQualityLevel(-71)).toBe('fair');
      expect(monitor.computeQualityLevel(-80)).toBe('fair');
      expect(monitor.computeQualityLevel(-85)).toBe('fair');
    });

    test('should classify RSSI < -85 as poor', () => {
      expect(monitor.computeQualityLevel(-86)).toBe('poor');
      expect(monitor.computeQualityLevel(-90)).toBe('poor');
      expect(monitor.computeQualityLevel(-100)).toBe('poor');
    });
  });

  describe('Quality Score Calculation', () => {
    test('should return high score for excellent RSSI with low stdDev', () => {
      const score = monitor.computeQualityScore(-40, 3);
      expect(score).toBeGreaterThanOrEqual(85);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should return medium score for good RSSI with low stdDev', () => {
      const score = monitor.computeQualityScore(-60, 3);
      expect(score).toBeGreaterThanOrEqual(60);
      expect(score).toBeLessThan(85);
    });

    test('should return lower score for poor RSSI', () => {
      const score = monitor.computeQualityScore(-95, 3);
      expect(score).toBeLessThan(30);
    });

    test('should penalize high stdDev (instability)', () => {
      const stableScore = monitor.computeQualityScore(-60, 3);
      const unstableScore = monitor.computeQualityScore(-60, 25);
      expect(unstableScore).toBeLessThan(stableScore);
    });

    test('should give full stability bonus for stdDev <= 5', () => {
      const score1 = monitor.computeQualityScore(-60, 5);
      const score2 = monitor.computeQualityScore(-60, 0);
      expect(score1).toBe(score2);
    });

    test('should give no stability bonus for stdDev >= 20', () => {
      const score1 = monitor.computeQualityScore(-60, 20);
      const score2 = monitor.computeQualityScore(-60, 30);
      expect(score1).toBe(score2);
    });
  });

  describe('RSSI Reading Collection', () => {
    test('should return null quality when no readings', () => {
      expect(monitor.getCurrentQuality()).toBeNull();
    });

    test('should compute quality after single reading', () => {
      monitor.addReading(-60);
      const quality = monitor.getCurrentQuality();
      expect(quality).not.toBeNull();
      expect(quality!.currentRSSI).toBe(-60);
      expect(quality!.sampleCount).toBe(1);
    });

    test('should compute average from multiple readings', () => {
      monitor.addReading(-50);
      monitor.addReading(-60);
      monitor.addReading(-70);
      const quality = monitor.getCurrentQuality();
      expect(quality).not.toBeNull();
      expect(quality!.averageRSSI).toBe(-60);
      expect(quality!.minRSSI).toBe(-70);
      expect(quality!.maxRSSI).toBe(-50);
    });

    test('should maintain window size', () => {
      const smallWindowMonitor = new TestableConnectionQualityMonitor({
        windowSize: 3,
      });

      smallWindowMonitor.addReading(-50);
      smallWindowMonitor.addReading(-60);
      smallWindowMonitor.addReading(-70);
      smallWindowMonitor.addReading(-80);
      smallWindowMonitor.addReading(-90);

      const quality = smallWindowMonitor.getCurrentQuality();
      expect(quality!.sampleCount).toBe(3);
      // Only last 3 readings should be considered
      expect(quality!.currentRSSI).toBe(-90);
      expect(quality!.averageRSSI).toBeCloseTo(-80, 1);
    });
  });

  describe('Stability Detection', () => {
    test('should detect stable connection with low variance', () => {
      // Add readings with low variance
      monitor.addReading(-60);
      monitor.addReading(-61);
      monitor.addReading(-59);
      monitor.addReading(-60);
      monitor.addReading(-62);

      const quality = monitor.getCurrentQuality();
      expect(quality!.isStable).toBe(true);
      expect(quality!.rssiStdDev).toBeLessThan(10);
    });

    test('should detect unstable connection with high variance', () => {
      // Add readings with high variance
      monitor.addReading(-40);
      monitor.addReading(-70);
      monitor.addReading(-50);
      monitor.addReading(-90);
      monitor.addReading(-55);

      const quality = monitor.getCurrentQuality();
      expect(quality!.isStable).toBe(false);
      expect(quality!.rssiStdDev).toBeGreaterThan(10);
    });
  });

  describe('Current RSSI Tracking', () => {
    test('should return most recent RSSI as currentRSSI', () => {
      monitor.addReading(-50);
      expect(monitor.getCurrentQuality()!.currentRSSI).toBe(-50);

      monitor.addReading(-60);
      expect(monitor.getCurrentQuality()!.currentRSSI).toBe(-60);

      monitor.addReading(-40);
      expect(monitor.getCurrentQuality()!.currentRSSI).toBe(-40);
    });
  });

  describe('Standard Deviation Calculation', () => {
    test('should return 0 stdDev for single reading', () => {
      monitor.addReading(-60);
      const quality = monitor.getCurrentQuality();
      expect(quality!.rssiStdDev).toBe(0);
    });

    test('should compute correct stdDev for uniform readings', () => {
      monitor.addReading(-60);
      monitor.addReading(-60);
      monitor.addReading(-60);
      const quality = monitor.getCurrentQuality();
      expect(quality!.rssiStdDev).toBe(0);
    });

    test('should compute correct stdDev for varied readings', () => {
      // Known values: -50, -60, -70 has mean -60 and stdDev ~8.165
      monitor.addReading(-50);
      monitor.addReading(-60);
      monitor.addReading(-70);
      const quality = monitor.getCurrentQuality();
      expect(quality!.rssiStdDev).toBeCloseTo(8.165, 2);
    });
  });
});

describe('DEFAULT_CONNECTION_QUALITY_CONFIG', () => {
  test('should have expected default values', () => {
    expect(DEFAULT_CONNECTION_QUALITY_CONFIG.pollingIntervalMs).toBe(2000);
    expect(DEFAULT_CONNECTION_QUALITY_CONFIG.windowSize).toBe(10);
    expect(DEFAULT_CONNECTION_QUALITY_CONFIG.excellentThreshold).toBe(-50);
    expect(DEFAULT_CONNECTION_QUALITY_CONFIG.goodThreshold).toBe(-70);
    expect(DEFAULT_CONNECTION_QUALITY_CONFIG.fairThreshold).toBe(-85);
    expect(DEFAULT_CONNECTION_QUALITY_CONFIG.stabilityThreshold).toBe(10);
  });
});

describe('ConnectionQuality Type', () => {
  test('should have all required fields', () => {
    const quality: ConnectionQuality = {
      currentRSSI: -60,
      averageRSSI: -62,
      minRSSI: -70,
      maxRSSI: -55,
      rssiStdDev: 5.2,
      qualityLevel: 'good',
      qualityScore: 75,
      isStable: true,
      lastUpdated: Date.now(),
      sampleCount: 10,
    };

    expect(quality.currentRSSI).toBeDefined();
    expect(quality.averageRSSI).toBeDefined();
    expect(quality.minRSSI).toBeDefined();
    expect(quality.maxRSSI).toBeDefined();
    expect(quality.rssiStdDev).toBeDefined();
    expect(quality.qualityLevel).toBeDefined();
    expect(quality.qualityScore).toBeDefined();
    expect(quality.isStable).toBeDefined();
    expect(quality.lastUpdated).toBeDefined();
    expect(quality.sampleCount).toBeDefined();
  });
});

describe('ConnectionQualityLevel Type', () => {
  test('should accept valid quality levels', () => {
    const levels: ConnectionQualityLevel[] = [
      'excellent',
      'good',
      'fair',
      'poor',
    ];

    levels.forEach((level) => {
      const quality: Partial<ConnectionQuality> = { qualityLevel: level };
      expect(quality.qualityLevel).toBe(level);
    });
  });
});
