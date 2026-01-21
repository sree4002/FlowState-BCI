import type { EEGDataPacket } from '../src/types';
import {
  detectAmplitudeArtifacts,
  detectAmplitudeArtifactsInPacket,
  detectAmplitudeArtifactsInWindow,
  createAmplitudeSignalQuality,
  isAmplitudeArtifact,
  isValidThreshold,
  clampSamplesToThreshold,
  DEFAULT_AMPLITUDE_THRESHOLD_UV,
  type AmplitudeArtifactResult,
} from '../src/services/signalProcessing';

describe('Signal Processing - Amplitude Threshold Artifact Detection', () => {
  describe('DEFAULT_AMPLITUDE_THRESHOLD_UV', () => {
    it('should be 100 µV as per EEG standards', () => {
      expect(DEFAULT_AMPLITUDE_THRESHOLD_UV).toBe(100);
    });
  });

  describe('detectAmplitudeArtifacts', () => {
    describe('Basic detection', () => {
      it('should return no artifacts for empty samples array', () => {
        const result = detectAmplitudeArtifacts([]);

        expect(result.hasArtifact).toBe(false);
        expect(result.artifactSampleCount).toBe(0);
        expect(result.totalSampleCount).toBe(0);
        expect(result.artifactPercentage).toBe(0);
        expect(result.maxAmplitude).toBe(0);
        expect(result.minAmplitude).toBe(0);
        expect(result.artifactIndices).toEqual([]);
      });

      it('should detect no artifacts when all samples are within threshold', () => {
        const samples = [50, -30, 80, -90, 100, -100, 0, 45];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(false);
        expect(result.artifactSampleCount).toBe(0);
        expect(result.totalSampleCount).toBe(8);
        expect(result.artifactPercentage).toBe(0);
        expect(result.artifactIndices).toEqual([]);
      });

      it('should detect positive amplitude artifact (exceeding +100 µV)', () => {
        const samples = [50, 101, 80];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(1);
        expect(result.artifactIndices).toEqual([1]);
      });

      it('should detect negative amplitude artifact (exceeding -100 µV)', () => {
        const samples = [50, -101, 80];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(1);
        expect(result.artifactIndices).toEqual([1]);
      });

      it('should detect multiple artifacts', () => {
        const samples = [50, -110, 120, 45, -150, 60];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(3);
        expect(result.artifactIndices).toEqual([1, 2, 4]);
      });

      it('should not flag exactly ±100 µV as artifact (boundary condition)', () => {
        const samples = [100, -100, 100.0, -100.0];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(false);
        expect(result.artifactSampleCount).toBe(0);
      });

      it('should flag values just over ±100 µV as artifact', () => {
        const samples = [100.001, -100.001];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(2);
      });
    });

    describe('Statistics calculation', () => {
      it('should calculate correct artifact percentage', () => {
        const samples = [50, 150, 60, 200, 70]; // 2 out of 5 are artifacts
        const result = detectAmplitudeArtifacts(samples);

        expect(result.artifactPercentage).toBe(40);
      });

      it('should calculate 100% artifact rate when all samples exceed threshold', () => {
        const samples = [150, -200, 300, -400];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.artifactPercentage).toBe(100);
      });

      it('should track min and max amplitudes correctly', () => {
        const samples = [50, -80, 120, -150, 30];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.maxAmplitude).toBe(120);
        expect(result.minAmplitude).toBe(-150);
      });

      it('should handle single sample array', () => {
        const samples = [75];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(false);
        expect(result.totalSampleCount).toBe(1);
        expect(result.maxAmplitude).toBe(75);
        expect(result.minAmplitude).toBe(75);
      });
    });

    describe('Custom threshold', () => {
      it('should use custom threshold when provided', () => {
        const samples = [50, 60, 70, 80];
        const result = detectAmplitudeArtifacts(samples, 55);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(3); // 60, 70, 80 exceed 55
        expect(result.artifactIndices).toEqual([1, 2, 3]);
      });

      it('should detect artifacts with very low threshold', () => {
        const samples = [5, 10, 15, 20];
        const result = detectAmplitudeArtifacts(samples, 10);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(2); // 15, 20 exceed 10
      });

      it('should detect no artifacts with very high threshold', () => {
        const samples = [500, -600, 700, -800];
        const result = detectAmplitudeArtifacts(samples, 1000);

        expect(result.hasArtifact).toBe(false);
        expect(result.artifactSampleCount).toBe(0);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero values', () => {
        const samples = [0, 0, 0, 0];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(false);
        expect(result.maxAmplitude).toBe(0);
        expect(result.minAmplitude).toBe(0);
      });

      it('should handle very large positive values', () => {
        const samples = [1000000, 50];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.maxAmplitude).toBe(1000000);
      });

      it('should handle very large negative values', () => {
        const samples = [-1000000, 50];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.minAmplitude).toBe(-1000000);
      });

      it('should handle floating point precision', () => {
        const samples = [100.0000001, 99.9999999];
        const result = detectAmplitudeArtifacts(samples);

        // 100.0000001 > 100, so it's an artifact
        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(1);
      });
    });

    describe('Realistic EEG scenarios', () => {
      it('should handle typical clean EEG data (low amplitude, 20-80 µV range)', () => {
        // Simulated clean EEG at 500 Hz for ~20ms
        const samples = [45, 52, 48, 55, 42, 58, 44, 51, 47, 53];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(false);
        expect(result.artifactPercentage).toBe(0);
      });

      it('should detect eye blink artifact (150-200 µV spike)', () => {
        // Normal EEG with eye blink artifact
        const samples = [45, 50, 55, 180, 200, 170, 60, 50, 45, 48];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(3);
        expect(result.artifactIndices).toEqual([3, 4, 5]);
      });

      it('should detect muscle artifact (high frequency, varying amplitude)', () => {
        // Muscle artifact typically shows rapid polarity changes
        const samples = [-120, 130, -140, 150, -110, 105, -95, 90];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(6); // -120, 130, -140, 150, -110, 105 (all > 100)
      });

      it('should detect electrode pop artifact (sudden large deflection)', () => {
        // Electrode pop: sudden spike followed by recovery
        const samples = [50, 52, 500, 480, 100, 55, 48, 51];
        const result = detectAmplitudeArtifacts(samples);

        expect(result.hasArtifact).toBe(true);
        expect(result.artifactSampleCount).toBe(2); // 500, 480
      });
    });
  });

  describe('detectAmplitudeArtifactsInPacket', () => {
    it('should detect artifacts in an EEG packet', () => {
      const packet: EEGDataPacket = {
        timestamp: Date.now(),
        samples: [50, 150, 60, -200, 70],
        sequence_number: 1,
      };

      const result = detectAmplitudeArtifactsInPacket(packet);

      expect(result.hasArtifact).toBe(true);
      expect(result.artifactSampleCount).toBe(2);
      expect(result.artifactIndices).toEqual([1, 3]);
    });

    it('should use custom threshold', () => {
      const packet: EEGDataPacket = {
        timestamp: Date.now(),
        samples: [50, 60, 70],
        sequence_number: 1,
      };

      const result = detectAmplitudeArtifactsInPacket(packet, 55);

      expect(result.hasArtifact).toBe(true);
      expect(result.artifactSampleCount).toBe(2); // 60, 70 exceed 55
    });

    it('should handle packet with no samples', () => {
      const packet: EEGDataPacket = {
        timestamp: Date.now(),
        samples: [],
        sequence_number: 1,
      };

      const result = detectAmplitudeArtifactsInPacket(packet);

      expect(result.hasArtifact).toBe(false);
      expect(result.totalSampleCount).toBe(0);
    });
  });

  describe('detectAmplitudeArtifactsInWindow', () => {
    it('should analyze multiple packets as a window', () => {
      const packets: EEGDataPacket[] = [
        { timestamp: 1000, samples: [50, 60], sequence_number: 1 },
        { timestamp: 1020, samples: [150, 70], sequence_number: 2 },
        { timestamp: 1040, samples: [-200, 80], sequence_number: 3 },
      ];

      const result = detectAmplitudeArtifactsInWindow(packets);

      expect(result.hasArtifact).toBe(true);
      expect(result.totalSampleCount).toBe(6);
      expect(result.artifactSampleCount).toBe(2); // 150, -200
      expect(result.artifactIndices).toEqual([2, 4]); // Indices in combined array
    });

    it('should handle empty packets array', () => {
      const packets: EEGDataPacket[] = [];

      const result = detectAmplitudeArtifactsInWindow(packets);

      expect(result.hasArtifact).toBe(false);
      expect(result.totalSampleCount).toBe(0);
    });

    it('should handle packets with varying sample counts', () => {
      const packets: EEGDataPacket[] = [
        { timestamp: 1000, samples: [50], sequence_number: 1 },
        { timestamp: 1020, samples: [60, 70, 80], sequence_number: 2 },
        { timestamp: 1040, samples: [90, 150], sequence_number: 3 },
      ];

      const result = detectAmplitudeArtifactsInWindow(packets);

      expect(result.totalSampleCount).toBe(6);
      expect(result.artifactSampleCount).toBe(1); // 150
      expect(result.artifactIndices).toEqual([5]);
    });

    it('should use custom threshold for window analysis', () => {
      const packets: EEGDataPacket[] = [
        { timestamp: 1000, samples: [50, 60], sequence_number: 1 },
        { timestamp: 1020, samples: [70, 80], sequence_number: 2 },
      ];

      const result = detectAmplitudeArtifactsInWindow(packets, 55);

      expect(result.hasArtifact).toBe(true);
      expect(result.artifactSampleCount).toBe(3); // 60, 70, 80 exceed 55
    });

    it('should simulate realistic 2-second window at 500 Hz', () => {
      // 500 Hz * 2 seconds = 1000 samples, split across 50 packets of 20 samples
      const packets: EEGDataPacket[] = [];
      for (let i = 0; i < 50; i++) {
        const samples: number[] = [];
        for (let j = 0; j < 20; j++) {
          // Normal EEG with occasional artifact
          const isArtifact = (i * 20 + j) % 100 === 50; // Every 100th sample
          samples.push(isArtifact ? 200 : 50 + Math.random() * 30);
        }
        packets.push({
          timestamp: 1000 + i * 40, // 40ms per packet (20 samples at 500 Hz)
          samples,
          sequence_number: i + 1,
        });
      }

      const result = detectAmplitudeArtifactsInWindow(packets);

      expect(result.totalSampleCount).toBe(1000);
      expect(result.hasArtifact).toBe(true);
      expect(result.artifactSampleCount).toBe(10); // 10 artifacts (every 100th sample)
      expect(result.artifactPercentage).toBe(1); // 1% artifact rate
    });
  });

  describe('createAmplitudeSignalQuality', () => {
    it('should create SignalQuality with artifact detected', () => {
      const result: AmplitudeArtifactResult = {
        hasArtifact: true,
        artifactSampleCount: 5,
        totalSampleCount: 100,
        artifactPercentage: 5,
        maxAmplitude: 150,
        minAmplitude: -120,
        artifactIndices: [10, 20, 30, 40, 50],
      };

      const quality = createAmplitudeSignalQuality(result);

      expect(quality.has_amplitude_artifact).toBe(true);
      expect(quality.artifact_percentage).toBe(5);
    });

    it('should create SignalQuality with no artifact', () => {
      const result: AmplitudeArtifactResult = {
        hasArtifact: false,
        artifactSampleCount: 0,
        totalSampleCount: 100,
        artifactPercentage: 0,
        maxAmplitude: 80,
        minAmplitude: -70,
        artifactIndices: [],
      };

      const quality = createAmplitudeSignalQuality(result);

      expect(quality.has_amplitude_artifact).toBe(false);
      expect(quality.artifact_percentage).toBe(0);
    });
  });

  describe('isAmplitudeArtifact', () => {
    it('should return true for positive value exceeding threshold', () => {
      expect(isAmplitudeArtifact(150)).toBe(true);
      expect(isAmplitudeArtifact(100.1)).toBe(true);
    });

    it('should return true for negative value exceeding threshold', () => {
      expect(isAmplitudeArtifact(-150)).toBe(true);
      expect(isAmplitudeArtifact(-100.1)).toBe(true);
    });

    it('should return false for values within threshold', () => {
      expect(isAmplitudeArtifact(50)).toBe(false);
      expect(isAmplitudeArtifact(-50)).toBe(false);
      expect(isAmplitudeArtifact(100)).toBe(false);
      expect(isAmplitudeArtifact(-100)).toBe(false);
      expect(isAmplitudeArtifact(0)).toBe(false);
    });

    it('should use custom threshold', () => {
      expect(isAmplitudeArtifact(60, 50)).toBe(true);
      expect(isAmplitudeArtifact(40, 50)).toBe(false);
    });
  });

  describe('isValidThreshold', () => {
    it('should return true for positive numbers', () => {
      expect(isValidThreshold(100)).toBe(true);
      expect(isValidThreshold(0.1)).toBe(true);
      expect(isValidThreshold(1000000)).toBe(true);
    });

    it('should return false for zero', () => {
      expect(isValidThreshold(0)).toBe(false);
    });

    it('should return false for negative numbers', () => {
      expect(isValidThreshold(-100)).toBe(false);
      expect(isValidThreshold(-0.1)).toBe(false);
    });

    it('should return false for Infinity', () => {
      expect(isValidThreshold(Infinity)).toBe(false);
      expect(isValidThreshold(-Infinity)).toBe(false);
    });

    it('should return false for NaN', () => {
      expect(isValidThreshold(NaN)).toBe(false);
    });
  });

  describe('clampSamplesToThreshold', () => {
    it('should not modify samples within threshold', () => {
      const samples = [50, -50, 100, -100, 0];
      const clamped = clampSamplesToThreshold(samples);

      expect(clamped).toEqual([50, -50, 100, -100, 0]);
    });

    it('should clamp positive values exceeding threshold', () => {
      const samples = [50, 150, 200];
      const clamped = clampSamplesToThreshold(samples);

      expect(clamped).toEqual([50, 100, 100]);
    });

    it('should clamp negative values exceeding threshold', () => {
      const samples = [-50, -150, -200];
      const clamped = clampSamplesToThreshold(samples);

      expect(clamped).toEqual([-50, -100, -100]);
    });

    it('should clamp both positive and negative values', () => {
      const samples = [150, -200, 50, -300, 80];
      const clamped = clampSamplesToThreshold(samples);

      expect(clamped).toEqual([100, -100, 50, -100, 80]);
    });

    it('should use custom threshold', () => {
      const samples = [30, 60, 90];
      const clamped = clampSamplesToThreshold(samples, 50);

      expect(clamped).toEqual([30, 50, 50]);
    });

    it('should return new array (not mutate original)', () => {
      const samples = [50, 150, 200];
      const clamped = clampSamplesToThreshold(samples);

      expect(clamped).not.toBe(samples);
      expect(samples).toEqual([50, 150, 200]); // Original unchanged
    });

    it('should handle empty array', () => {
      const samples: number[] = [];
      const clamped = clampSamplesToThreshold(samples);

      expect(clamped).toEqual([]);
    });
  });

  describe('Integration scenarios', () => {
    it('should process continuous data stream simulation', () => {
      // Simulate 10 seconds of EEG at 500 Hz with 1% artifact rate
      const totalSamples = 5000;
      const artifactRate = 0.01;
      const samples: number[] = [];

      for (let i = 0; i < totalSamples; i++) {
        if (Math.random() < artifactRate) {
          // Artifact: random spike between 150-300 µV
          samples.push(
            (Math.random() * 150 + 150) * (Math.random() > 0.5 ? 1 : -1)
          );
        } else {
          // Normal: 20-80 µV range
          samples.push(Math.random() * 60 + 20);
        }
      }

      const result = detectAmplitudeArtifacts(samples);

      expect(result.totalSampleCount).toBe(totalSamples);
      // With 1% artifact rate, expect roughly 50 artifacts (±20 due to randomness)
      expect(result.artifactSampleCount).toBeGreaterThan(20);
      expect(result.artifactSampleCount).toBeLessThan(100);
      expect(result.artifactPercentage).toBeGreaterThan(0.4);
      expect(result.artifactPercentage).toBeLessThan(2);
    });

    it('should work with SignalQuality type integration', () => {
      const samples = [50, 150, 60, -200, 70, 80, 90];
      const result = detectAmplitudeArtifacts(samples);
      const qualityPartial = createAmplitudeSignalQuality(result);

      // Verify the partial can be spread into a full SignalQuality object
      const fullQuality = {
        score: 85,
        ...qualityPartial,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      };

      expect(fullQuality.score).toBe(85);
      expect(fullQuality.has_amplitude_artifact).toBe(true);
      expect(fullQuality.artifact_percentage).toBeCloseTo(28.57, 1);
      expect(fullQuality.has_gradient_artifact).toBe(false);
      expect(fullQuality.has_frequency_artifact).toBe(false);
    });
  });
});
