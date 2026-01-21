/**
 * SlidingBufferManager - Real-time EEG data buffer for signal processing
 *
 * Manages a circular buffer of EEG samples with configurable window size
 * to support Welch's periodogram and other time-domain signal processing.
 * Optimized for real-time BCI applications with support for different
 * sampling rates (500Hz headband, 250Hz earpiece).
 */

import { EEGDataPacket } from '../types';

/**
 * Configuration options for the SlidingBufferManager
 */
export interface SlidingBufferConfig {
  /** Sampling rate in Hz (default: 500 for headband, 250 for earpiece) */
  samplingRate: number;
  /** Window duration in seconds (default: 2.0, typically 2-4 seconds) */
  windowDuration: number;
}

/**
 * Result of getting samples from the buffer
 */
export interface BufferSamples {
  /** Array of EEG samples in chronological order */
  samples: number[];
  /** Timestamp of the oldest sample in the window */
  startTimestamp: number;
  /** Timestamp of the newest sample in the window */
  endTimestamp: number;
  /** Actual duration covered by samples in seconds */
  duration: number;
  /** Number of samples in the buffer */
  sampleCount: number;
  /** Whether the buffer is full (has enough samples for the configured window) */
  isFull: boolean;
}

/**
 * Statistics about the current buffer state
 */
export interface BufferStats {
  /** Current number of samples in buffer */
  currentSamples: number;
  /** Maximum buffer capacity */
  maxSamples: number;
  /** Percentage of buffer filled (0-100) */
  fillPercentage: number;
  /** Configured sampling rate */
  samplingRate: number;
  /** Configured window duration */
  windowDuration: number;
  /** Total samples added since creation/reset */
  totalSamplesProcessed: number;
  /** Number of packets processed */
  packetsProcessed: number;
  /** Timestamp of most recent sample */
  latestTimestamp: number | null;
  /** Timestamp of oldest sample in buffer */
  oldestTimestamp: number | null;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: SlidingBufferConfig = {
  samplingRate: 500, // 500 Hz for headband devices
  windowDuration: 2.0, // 2 second window
};

/**
 * SlidingBufferManager class for real-time EEG data buffering
 *
 * Uses a circular buffer implementation with typed arrays for performance.
 * Supports continuous data streaming from BLE devices with automatic
 * management of window boundaries.
 */
export class SlidingBufferManager {
  private buffer: Float64Array;
  private timestamps: Float64Array;
  private head: number;
  private count: number;
  private maxSamples: number;
  private samplingRate: number;
  private windowDuration: number;
  private totalSamplesProcessed: number;
  private packetsProcessed: number;

  /**
   * Creates a new SlidingBufferManager instance
   * @param config - Configuration options for the buffer
   */
  constructor(config: Partial<SlidingBufferConfig> = {}) {
    this.samplingRate = config.samplingRate ?? DEFAULT_CONFIG.samplingRate;
    this.windowDuration =
      config.windowDuration ?? DEFAULT_CONFIG.windowDuration;

    // Calculate buffer size based on window duration and sampling rate
    this.maxSamples = Math.ceil(this.samplingRate * this.windowDuration);

    // Initialize typed arrays for efficient storage
    this.buffer = new Float64Array(this.maxSamples);
    this.timestamps = new Float64Array(this.maxSamples);

    // Initialize circular buffer pointers
    this.head = 0;
    this.count = 0;

    // Statistics counters
    this.totalSamplesProcessed = 0;
    this.packetsProcessed = 0;
  }

  /**
   * Adds a single EEG sample to the buffer
   * @param sample - The EEG sample value (typically in microvolts)
   * @param timestamp - Unix timestamp in milliseconds
   */
  addSample(sample: number, timestamp: number): void {
    this.buffer[this.head] = sample;
    this.timestamps[this.head] = timestamp;
    this.head = (this.head + 1) % this.maxSamples;

    if (this.count < this.maxSamples) {
      this.count++;
    }

    this.totalSamplesProcessed++;
  }

  /**
   * Adds multiple EEG samples from a data packet
   * Samples are assumed to be evenly spaced based on sampling rate
   * @param packet - EEG data packet from BLE device
   */
  addPacket(packet: EEGDataPacket): void {
    const { samples, timestamp } = packet;
    const sampleInterval = 1000 / this.samplingRate; // ms between samples

    for (let i = 0; i < samples.length; i++) {
      const sampleTimestamp = timestamp + i * sampleInterval;
      this.addSample(samples[i], sampleTimestamp);
    }

    this.packetsProcessed++;
  }

  /**
   * Adds multiple EEG data packets to the buffer
   * @param packets - Array of EEG data packets
   */
  addPackets(packets: EEGDataPacket[]): void {
    for (const packet of packets) {
      this.addPacket(packet);
    }
  }

  /**
   * Gets all samples currently in the buffer in chronological order
   * @returns BufferSamples object with samples and metadata
   */
  getSamples(): BufferSamples {
    if (this.count === 0) {
      return {
        samples: [],
        startTimestamp: 0,
        endTimestamp: 0,
        duration: 0,
        sampleCount: 0,
        isFull: false,
      };
    }

    const samples: number[] = new Array(this.count);
    const startIdx = this.count < this.maxSamples ? 0 : this.head;

    for (let i = 0; i < this.count; i++) {
      const bufferIdx = (startIdx + i) % this.maxSamples;
      samples[i] = this.buffer[bufferIdx];
    }

    // Get timestamps
    const oldestIdx = this.count < this.maxSamples ? 0 : this.head;
    const newestIdx = (this.head - 1 + this.maxSamples) % this.maxSamples;

    const startTimestamp = this.timestamps[oldestIdx];
    const endTimestamp = this.timestamps[newestIdx];
    const duration = (endTimestamp - startTimestamp) / 1000;

    return {
      samples,
      startTimestamp,
      endTimestamp,
      duration,
      sampleCount: this.count,
      isFull: this.count >= this.maxSamples,
    };
  }

  /**
   * Gets samples for a specific time window (most recent N seconds)
   * @param windowSeconds - Number of seconds to retrieve (defaults to configured windowDuration)
   * @returns BufferSamples object with samples for the requested window
   */
  getWindow(windowSeconds?: number): BufferSamples {
    const requestedDuration = windowSeconds ?? this.windowDuration;
    const requestedSamples = Math.ceil(this.samplingRate * requestedDuration);

    if (this.count === 0) {
      return {
        samples: [],
        startTimestamp: 0,
        endTimestamp: 0,
        duration: 0,
        sampleCount: 0,
        isFull: false,
      };
    }

    const sampleCount = Math.min(requestedSamples, this.count);
    const samples: number[] = new Array(sampleCount);

    // Start from the oldest sample we need
    const skipCount = this.count - sampleCount;
    const startIdx = this.count < this.maxSamples ? skipCount : this.head;

    for (let i = 0; i < sampleCount; i++) {
      const bufferIdx =
        (startIdx + (this.count < this.maxSamples ? i : skipCount + i)) %
        this.maxSamples;
      samples[i] = this.buffer[bufferIdx];
    }

    // Get timestamps for the window
    const oldestIdx =
      (this.head - sampleCount + this.maxSamples) % this.maxSamples;
    const newestIdx = (this.head - 1 + this.maxSamples) % this.maxSamples;

    const startTimestamp = this.timestamps[oldestIdx];
    const endTimestamp = this.timestamps[newestIdx];
    const duration = (endTimestamp - startTimestamp) / 1000;

    return {
      samples,
      startTimestamp,
      endTimestamp,
      duration,
      sampleCount,
      isFull: sampleCount >= requestedSamples,
    };
  }

  /**
   * Gets raw Float64Array reference to the buffer (for high-performance access)
   * Warning: This provides direct access to internal buffer; modifications will affect the manager
   * @returns The underlying Float64Array buffer
   */
  getRawBuffer(): Float64Array {
    return this.buffer;
  }

  /**
   * Gets the current state/statistics of the buffer
   * @returns BufferStats object with current buffer state
   */
  getStats(): BufferStats {
    const oldestTimestamp =
      this.count > 0
        ? this.timestamps[this.count < this.maxSamples ? 0 : this.head]
        : null;

    const latestTimestamp =
      this.count > 0
        ? this.timestamps[(this.head - 1 + this.maxSamples) % this.maxSamples]
        : null;

    return {
      currentSamples: this.count,
      maxSamples: this.maxSamples,
      fillPercentage: (this.count / this.maxSamples) * 100,
      samplingRate: this.samplingRate,
      windowDuration: this.windowDuration,
      totalSamplesProcessed: this.totalSamplesProcessed,
      packetsProcessed: this.packetsProcessed,
      latestTimestamp,
      oldestTimestamp,
    };
  }

  /**
   * Clears all samples from the buffer
   * Resets the buffer to empty state but preserves configuration
   */
  clear(): void {
    this.buffer.fill(0);
    this.timestamps.fill(0);
    this.head = 0;
    this.count = 0;
    this.totalSamplesProcessed = 0;
    this.packetsProcessed = 0;
  }

  /**
   * Checks if the buffer has enough samples for processing
   * @param minSamples - Minimum number of samples required (defaults to full window)
   * @returns true if buffer has at least minSamples
   */
  hasEnoughSamples(minSamples?: number): boolean {
    const required = minSamples ?? this.maxSamples;
    return this.count >= required;
  }

  /**
   * Checks if the buffer is full (at capacity)
   * @returns true if buffer contains maxSamples
   */
  isFull(): boolean {
    return this.count >= this.maxSamples;
  }

  /**
   * Gets the number of samples currently in the buffer
   * @returns Current sample count
   */
  getSampleCount(): number {
    return this.count;
  }

  /**
   * Gets the maximum capacity of the buffer
   * @returns Maximum number of samples the buffer can hold
   */
  getCapacity(): number {
    return this.maxSamples;
  }

  /**
   * Gets the configured sampling rate
   * @returns Sampling rate in Hz
   */
  getSamplingRate(): number {
    return this.samplingRate;
  }

  /**
   * Gets the configured window duration
   * @returns Window duration in seconds
   */
  getWindowDuration(): number {
    return this.windowDuration;
  }

  /**
   * Reconfigures the buffer with new settings
   * Warning: This clears all existing samples
   * @param config - New configuration options
   */
  reconfigure(config: Partial<SlidingBufferConfig>): void {
    if (config.samplingRate !== undefined) {
      this.samplingRate = config.samplingRate;
    }
    if (config.windowDuration !== undefined) {
      this.windowDuration = config.windowDuration;
    }

    // Recalculate buffer size
    this.maxSamples = Math.ceil(this.samplingRate * this.windowDuration);

    // Reallocate buffers
    this.buffer = new Float64Array(this.maxSamples);
    this.timestamps = new Float64Array(this.maxSamples);

    // Reset state
    this.head = 0;
    this.count = 0;
    this.totalSamplesProcessed = 0;
    this.packetsProcessed = 0;
  }

  /**
   * Creates a copy of the buffer manager with the same configuration
   * @returns A new SlidingBufferManager with same config but empty buffer
   */
  clone(): SlidingBufferManager {
    return new SlidingBufferManager({
      samplingRate: this.samplingRate,
      windowDuration: this.windowDuration,
    });
  }

  /**
   * Gets the most recent N samples (useful for quick visualization)
   * @param count - Number of samples to retrieve
   * @returns Array of the most recent samples
   */
  getRecentSamples(count: number): number[] {
    const actualCount = Math.min(count, this.count);
    const samples: number[] = new Array(actualCount);

    for (let i = 0; i < actualCount; i++) {
      const bufferIdx =
        (this.head - actualCount + i + this.maxSamples) % this.maxSamples;
      samples[i] = this.buffer[bufferIdx];
    }

    return samples;
  }

  /**
   * Gets the most recent sample value
   * @returns The most recent sample or null if buffer is empty
   */
  getLatestSample(): number | null {
    if (this.count === 0) {
      return null;
    }
    return this.buffer[(this.head - 1 + this.maxSamples) % this.maxSamples];
  }

  /**
   * Gets the timestamp of the most recent sample
   * @returns Timestamp in milliseconds or null if buffer is empty
   */
  getLatestTimestamp(): number | null {
    if (this.count === 0) {
      return null;
    }
    return this.timestamps[(this.head - 1 + this.maxSamples) % this.maxSamples];
  }
}

/**
 * Factory function to create a SlidingBufferManager for headband devices (500Hz)
 * @param windowDuration - Window duration in seconds (default: 2.0)
 */
export function createHeadbandBuffer(
  windowDuration: number = 2.0
): SlidingBufferManager {
  return new SlidingBufferManager({
    samplingRate: 500,
    windowDuration,
  });
}

/**
 * Factory function to create a SlidingBufferManager for earpiece devices (250Hz)
 * @param windowDuration - Window duration in seconds (default: 2.0)
 */
export function createEarpieceBuffer(
  windowDuration: number = 2.0
): SlidingBufferManager {
  return new SlidingBufferManager({
    samplingRate: 250,
    windowDuration,
  });
}
