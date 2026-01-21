/**
 * Tests for SlidingBufferManager
 *
 * Comprehensive test suite covering:
 * - Buffer creation and configuration
 * - Sample addition (single, packet, multiple packets)
 * - Circular buffer behavior
 * - Window retrieval
 * - Statistics tracking
 * - Edge cases and error conditions
 */

import {
  SlidingBufferManager,
  createHeadbandBuffer,
  createEarpieceBuffer,
  SlidingBufferConfig,
  BufferSamples,
  BufferStats,
} from '../src/services/slidingBufferManager';
import { EEGDataPacket } from '../src/types';

describe('SlidingBufferManager', () => {
  describe('Construction and Configuration', () => {
    it('should create buffer with default configuration', () => {
      const buffer = new SlidingBufferManager();
      expect(buffer.getSamplingRate()).toBe(500);
      expect(buffer.getWindowDuration()).toBe(2.0);
      expect(buffer.getCapacity()).toBe(1000); // 500Hz * 2s
    });

    it('should create buffer with custom sampling rate', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 250 });
      expect(buffer.getSamplingRate()).toBe(250);
      expect(buffer.getCapacity()).toBe(500); // 250Hz * 2s
    });

    it('should create buffer with custom window duration', () => {
      const buffer = new SlidingBufferManager({ windowDuration: 4.0 });
      expect(buffer.getWindowDuration()).toBe(4.0);
      expect(buffer.getCapacity()).toBe(2000); // 500Hz * 4s
    });

    it('should create buffer with both custom settings', () => {
      const buffer = new SlidingBufferManager({
        samplingRate: 250,
        windowDuration: 3.0,
      });
      expect(buffer.getSamplingRate()).toBe(250);
      expect(buffer.getWindowDuration()).toBe(3.0);
      expect(buffer.getCapacity()).toBe(750); // 250Hz * 3s
    });

    it('should start with empty buffer', () => {
      const buffer = new SlidingBufferManager();
      expect(buffer.getSampleCount()).toBe(0);
      expect(buffer.isFull()).toBe(false);
    });
  });

  describe('Factory Functions', () => {
    it('should create headband buffer with 500Hz sampling rate', () => {
      const buffer = createHeadbandBuffer();
      expect(buffer.getSamplingRate()).toBe(500);
      expect(buffer.getWindowDuration()).toBe(2.0);
    });

    it('should create headband buffer with custom window', () => {
      const buffer = createHeadbandBuffer(4.0);
      expect(buffer.getSamplingRate()).toBe(500);
      expect(buffer.getWindowDuration()).toBe(4.0);
      expect(buffer.getCapacity()).toBe(2000);
    });

    it('should create earpiece buffer with 250Hz sampling rate', () => {
      const buffer = createEarpieceBuffer();
      expect(buffer.getSamplingRate()).toBe(250);
      expect(buffer.getWindowDuration()).toBe(2.0);
    });

    it('should create earpiece buffer with custom window', () => {
      const buffer = createEarpieceBuffer(3.0);
      expect(buffer.getSamplingRate()).toBe(250);
      expect(buffer.getWindowDuration()).toBe(3.0);
      expect(buffer.getCapacity()).toBe(750);
    });
  });

  describe('Adding Single Samples', () => {
    it('should add a single sample', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(10.5, 1000);
      expect(buffer.getSampleCount()).toBe(1);
    });

    it('should track samples correctly', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      for (let i = 0; i < 5; i++) {
        buffer.addSample(i * 10, 1000 + i * 100);
      }
      expect(buffer.getSampleCount()).toBe(5);
    });

    it('should store correct sample values', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(42.5, 1000);
      buffer.addSample(73.2, 1100);

      const samples = buffer.getSamples();
      expect(samples.samples).toEqual([42.5, 73.2]);
    });

    it('should return samples in chronological order', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(1, 1000);
      buffer.addSample(2, 1100);
      buffer.addSample(3, 1200);

      const samples = buffer.getSamples();
      expect(samples.samples).toEqual([1, 2, 3]);
    });
  });

  describe('Adding Packets', () => {
    it('should add samples from a packet', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 100, windowDuration: 1 });
      const packet: EEGDataPacket = {
        timestamp: 1000,
        samples: [10, 20, 30, 40, 50],
        sequence_number: 1,
      };

      buffer.addPacket(packet);
      expect(buffer.getSampleCount()).toBe(5);
    });

    it('should preserve packet sample values', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 100, windowDuration: 1 });
      const packet: EEGDataPacket = {
        timestamp: 1000,
        samples: [10.5, 20.5, 30.5],
        sequence_number: 1,
      };

      buffer.addPacket(packet);
      const samples = buffer.getSamples();
      expect(samples.samples).toEqual([10.5, 20.5, 30.5]);
    });

    it('should add multiple packets', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 100, windowDuration: 1 });
      const packets: EEGDataPacket[] = [
        { timestamp: 1000, samples: [1, 2, 3], sequence_number: 1 },
        { timestamp: 1030, samples: [4, 5, 6], sequence_number: 2 },
      ];

      buffer.addPackets(packets);
      expect(buffer.getSampleCount()).toBe(6);
    });

    it('should track packets processed', () => {
      const buffer = new SlidingBufferManager();
      const packet: EEGDataPacket = {
        timestamp: 1000,
        samples: [10, 20, 30],
        sequence_number: 1,
      };

      buffer.addPacket(packet);
      buffer.addPacket(packet);

      const stats = buffer.getStats();
      expect(stats.packetsProcessed).toBe(2);
    });
  });

  describe('Circular Buffer Behavior', () => {
    it('should wrap around when buffer is full', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 5, windowDuration: 1 });
      // Capacity is 5 samples

      for (let i = 0; i < 10; i++) {
        buffer.addSample(i, 1000 + i * 200);
      }

      expect(buffer.getSampleCount()).toBe(5);
      expect(buffer.isFull()).toBe(true);
    });

    it('should contain most recent samples after overflow', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 5, windowDuration: 1 });
      // Capacity is 5 samples

      for (let i = 0; i < 10; i++) {
        buffer.addSample(i, 1000 + i * 200);
      }

      const samples = buffer.getSamples();
      expect(samples.samples).toEqual([5, 6, 7, 8, 9]);
    });

    it('should maintain chronological order after wrap', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 3, windowDuration: 1 });
      // Capacity is 3 samples

      buffer.addSample(100, 1000);
      buffer.addSample(200, 1333);
      buffer.addSample(300, 1666);
      buffer.addSample(400, 2000);
      buffer.addSample(500, 2333);

      const samples = buffer.getSamples();
      expect(samples.samples).toEqual([300, 400, 500]);
    });
  });

  describe('Getting Samples', () => {
    it('should return empty result for empty buffer', () => {
      const buffer = new SlidingBufferManager();
      const samples = buffer.getSamples();

      expect(samples.samples).toEqual([]);
      expect(samples.sampleCount).toBe(0);
      expect(samples.isFull).toBe(false);
    });

    it('should return correct timestamps', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1100);
      buffer.addSample(30, 1200);

      const samples = buffer.getSamples();
      expect(samples.startTimestamp).toBe(1000);
      expect(samples.endTimestamp).toBe(1200);
    });

    it('should calculate duration correctly', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1500);
      buffer.addSample(30, 2000);

      const samples = buffer.getSamples();
      expect(samples.duration).toBe(1.0); // 2000 - 1000 = 1000ms = 1s
    });

    it('should indicate when buffer is full', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 5, windowDuration: 1 });

      for (let i = 0; i < 3; i++) {
        buffer.addSample(i, 1000 + i * 200);
      }
      expect(buffer.getSamples().isFull).toBe(false);

      for (let i = 3; i < 5; i++) {
        buffer.addSample(i, 1000 + i * 200);
      }
      expect(buffer.getSamples().isFull).toBe(true);
    });
  });

  describe('Window Retrieval', () => {
    let buffer: SlidingBufferManager;

    beforeEach(() => {
      buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 2 });
      // Capacity is 20 samples
      // Add 20 samples
      for (let i = 0; i < 20; i++) {
        buffer.addSample(i, 1000 + i * 100);
      }
    });

    it('should return full window by default', () => {
      const window = buffer.getWindow();
      expect(window.sampleCount).toBe(20);
    });

    it('should return smaller window when requested', () => {
      const window = buffer.getWindow(1.0); // 1 second = 10 samples
      expect(window.sampleCount).toBe(10);
    });

    it('should return most recent samples in window', () => {
      const window = buffer.getWindow(0.5); // 0.5 second = 5 samples
      expect(window.samples).toEqual([15, 16, 17, 18, 19]);
    });

    it('should handle window larger than buffer', () => {
      buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      for (let i = 0; i < 5; i++) {
        buffer.addSample(i, 1000 + i * 100);
      }

      const window = buffer.getWindow(2.0); // Request 2s but only have 0.5s of data
      expect(window.sampleCount).toBe(5);
      expect(window.isFull).toBe(false);
    });

    it('should return empty for empty buffer', () => {
      buffer = new SlidingBufferManager();
      const window = buffer.getWindow(1.0);
      expect(window.samples).toEqual([]);
      expect(window.sampleCount).toBe(0);
    });
  });

  describe('Recent Samples', () => {
    it('should get most recent N samples', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      for (let i = 0; i < 10; i++) {
        buffer.addSample(i, 1000 + i * 100);
      }

      expect(buffer.getRecentSamples(3)).toEqual([7, 8, 9]);
    });

    it('should handle request larger than buffer size', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(1, 1000);
      buffer.addSample(2, 1100);

      expect(buffer.getRecentSamples(10)).toEqual([1, 2]);
    });

    it('should return empty array for empty buffer', () => {
      const buffer = new SlidingBufferManager();
      expect(buffer.getRecentSamples(5)).toEqual([]);
    });
  });

  describe('Latest Sample', () => {
    it('should return null for empty buffer', () => {
      const buffer = new SlidingBufferManager();
      expect(buffer.getLatestSample()).toBeNull();
    });

    it('should return most recent sample', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1100);
      buffer.addSample(30, 1200);

      expect(buffer.getLatestSample()).toBe(30);
    });

    it('should return latest timestamp', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1500);

      expect(buffer.getLatestTimestamp()).toBe(1500);
    });

    it('should return null timestamp for empty buffer', () => {
      const buffer = new SlidingBufferManager();
      expect(buffer.getLatestTimestamp()).toBeNull();
    });
  });

  describe('Buffer Statistics', () => {
    it('should provide complete stats', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 100, windowDuration: 2 });
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1010);

      const stats = buffer.getStats();
      expect(stats.currentSamples).toBe(2);
      expect(stats.maxSamples).toBe(200);
      expect(stats.fillPercentage).toBe(1);
      expect(stats.samplingRate).toBe(100);
      expect(stats.windowDuration).toBe(2);
      expect(stats.totalSamplesProcessed).toBe(2);
    });

    it('should track total samples processed including overflow', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 5, windowDuration: 1 });

      for (let i = 0; i < 10; i++) {
        buffer.addSample(i, 1000 + i * 200);
      }

      const stats = buffer.getStats();
      expect(stats.currentSamples).toBe(5);
      expect(stats.totalSamplesProcessed).toBe(10);
    });

    it('should track oldest and latest timestamps', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 5, windowDuration: 1 });
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1200);
      buffer.addSample(30, 1400);

      const stats = buffer.getStats();
      expect(stats.oldestTimestamp).toBe(1000);
      expect(stats.latestTimestamp).toBe(1400);
    });

    it('should return null timestamps for empty buffer', () => {
      const buffer = new SlidingBufferManager();
      const stats = buffer.getStats();
      expect(stats.oldestTimestamp).toBeNull();
      expect(stats.latestTimestamp).toBeNull();
    });
  });

  describe('hasEnoughSamples', () => {
    it('should return false when buffer is empty', () => {
      const buffer = new SlidingBufferManager();
      expect(buffer.hasEnoughSamples()).toBe(false);
    });

    it('should return true when buffer is full', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 5, windowDuration: 1 });
      for (let i = 0; i < 5; i++) {
        buffer.addSample(i, 1000 + i * 200);
      }
      expect(buffer.hasEnoughSamples()).toBe(true);
    });

    it('should check against custom minimum', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(1, 1000);
      buffer.addSample(2, 1100);
      buffer.addSample(3, 1200);

      expect(buffer.hasEnoughSamples(2)).toBe(true);
      expect(buffer.hasEnoughSamples(5)).toBe(false);
    });
  });

  describe('Clear', () => {
    it('should clear all samples', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1100);

      buffer.clear();

      expect(buffer.getSampleCount()).toBe(0);
      expect(buffer.getSamples().samples).toEqual([]);
    });

    it('should reset statistics', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1100);

      buffer.clear();

      const stats = buffer.getStats();
      expect(stats.totalSamplesProcessed).toBe(0);
      expect(stats.packetsProcessed).toBe(0);
    });

    it('should preserve configuration after clear', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 250, windowDuration: 3 });
      buffer.addSample(10, 1000);

      buffer.clear();

      expect(buffer.getSamplingRate()).toBe(250);
      expect(buffer.getWindowDuration()).toBe(3);
      expect(buffer.getCapacity()).toBe(750);
    });
  });

  describe('Reconfigure', () => {
    it('should update sampling rate', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 500 });
      buffer.reconfigure({ samplingRate: 250 });

      expect(buffer.getSamplingRate()).toBe(250);
    });

    it('should update window duration', () => {
      const buffer = new SlidingBufferManager({ windowDuration: 2 });
      buffer.reconfigure({ windowDuration: 4 });

      expect(buffer.getWindowDuration()).toBe(4);
    });

    it('should recalculate capacity', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 500, windowDuration: 2 });
      expect(buffer.getCapacity()).toBe(1000);

      buffer.reconfigure({ samplingRate: 250, windowDuration: 4 });
      expect(buffer.getCapacity()).toBe(1000);
    });

    it('should clear existing samples', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(10, 1000);
      buffer.addSample(20, 1100);

      buffer.reconfigure({ windowDuration: 3 });

      expect(buffer.getSampleCount()).toBe(0);
    });
  });

  describe('Clone', () => {
    it('should create buffer with same configuration', () => {
      const original = new SlidingBufferManager({
        samplingRate: 250,
        windowDuration: 3,
      });

      const clone = original.clone();

      expect(clone.getSamplingRate()).toBe(250);
      expect(clone.getWindowDuration()).toBe(3);
    });

    it('should not copy samples', () => {
      const original = new SlidingBufferManager();
      original.addSample(10, 1000);
      original.addSample(20, 1100);

      const clone = original.clone();

      expect(clone.getSampleCount()).toBe(0);
    });

    it('should be independent of original', () => {
      const original = new SlidingBufferManager();
      const clone = original.clone();

      original.addSample(10, 1000);
      clone.addSample(20, 1100);

      expect(original.getLatestSample()).toBe(10);
      expect(clone.getLatestSample()).toBe(20);
    });
  });

  describe('Raw Buffer Access', () => {
    it('should provide access to underlying buffer', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 10, windowDuration: 1 });
      buffer.addSample(42, 1000);

      const raw = buffer.getRawBuffer();

      expect(raw).toBeInstanceOf(Float64Array);
      expect(raw[0]).toBe(42);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle continuous streaming at 500Hz for 2 seconds', () => {
      const buffer = createHeadbandBuffer(2.0);
      const startTime = Date.now();

      // Simulate 2 seconds of 500Hz data
      for (let i = 0; i < 1000; i++) {
        const sample = Math.sin((2 * Math.PI * 10 * i) / 500) * 50; // 10Hz sine wave
        buffer.addSample(sample, startTime + i * 2); // 2ms per sample
      }

      expect(buffer.isFull()).toBe(true);
      expect(buffer.getSampleCount()).toBe(1000);

      const samples = buffer.getSamples();
      expect(samples.isFull).toBe(true);
    });

    it('should handle 250Hz earpiece data for 4 seconds', () => {
      const buffer = createEarpieceBuffer(4.0);

      // Simulate 4 seconds of 250Hz data
      for (let i = 0; i < 1000; i++) {
        buffer.addSample(i, 1000 + i * 4);
      }

      expect(buffer.isFull()).toBe(true);
      expect(buffer.getCapacity()).toBe(1000);
    });

    it('should support Welch periodogram window extraction', () => {
      // Welch's method typically uses overlapping windows
      const buffer = createHeadbandBuffer(2.0);
      const startTime = 0;

      // Fill buffer with 2 seconds of data
      for (let i = 0; i < 1000; i++) {
        buffer.addSample(Math.random() * 100, startTime + i * 2);
      }

      // Get 1-second window for Welch processing
      const window1 = buffer.getWindow(1.0);
      expect(window1.sampleCount).toBe(500);
      expect(window1.isFull).toBe(true);

      // The 1-second window should contain the most recent 500 samples
      const fullSamples = buffer.getSamples();
      expect(window1.samples).toEqual(fullSamples.samples.slice(500));
    });

    it('should handle packet bursts', () => {
      const buffer = new SlidingBufferManager({ samplingRate: 500, windowDuration: 2 });

      // Simulate BLE packets arriving in bursts (typical for BLE is ~20ms intervals)
      for (let burst = 0; burst < 100; burst++) {
        const packet: EEGDataPacket = {
          timestamp: burst * 20, // 20ms between packets
          samples: Array.from({ length: 10 }, (_, i) => burst * 10 + i), // 10 samples per packet
          sequence_number: burst,
        };
        buffer.addPacket(packet);
      }

      expect(buffer.isFull()).toBe(true);
      expect(buffer.getStats().packetsProcessed).toBe(100);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small buffer', () => {
      const buffer = new SlidingBufferManager({
        samplingRate: 1,
        windowDuration: 1,
      });
      expect(buffer.getCapacity()).toBe(1);

      buffer.addSample(10, 1000);
      buffer.addSample(20, 2000);

      expect(buffer.getSampleCount()).toBe(1);
      expect(buffer.getLatestSample()).toBe(20);
    });

    it('should handle zero samples in packet', () => {
      const buffer = new SlidingBufferManager();
      const packet: EEGDataPacket = {
        timestamp: 1000,
        samples: [],
        sequence_number: 1,
      };

      buffer.addPacket(packet);
      expect(buffer.getSampleCount()).toBe(0);
    });

    it('should handle negative sample values', () => {
      const buffer = new SlidingBufferManager();
      buffer.addSample(-50.5, 1000);
      buffer.addSample(-100.0, 1100);

      expect(buffer.getLatestSample()).toBe(-100.0);
    });

    it('should handle very large timestamps', () => {
      const buffer = new SlidingBufferManager();
      const largeTimestamp = Date.now() + 365 * 24 * 60 * 60 * 1000; // 1 year from now

      buffer.addSample(10, largeTimestamp);
      expect(buffer.getLatestTimestamp()).toBe(largeTimestamp);
    });

    it('should handle floating point precision', () => {
      const buffer = new SlidingBufferManager();
      const preciseValue = 0.1 + 0.2; // Known JS floating point issue

      buffer.addSample(preciseValue, 1000);
      expect(buffer.getLatestSample()).toBeCloseTo(0.3);
    });
  });
});
