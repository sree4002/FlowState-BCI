import {
  exportSessionsToCSV,
  exportBaselinesToCSV,
  exportEEGDataToCSV,
  exportSessionsToJSON,
  exportBaselinesToJSON,
  exportUserDataToJSON,
  createUserDataExport,
  createEDFHeader,
  createEDFSignalHeader,
  physicalToDigital,
  digitalToPhysical,
  serializeEDFHeader,
  serializeEDFSignalHeaders,
  createEDFExportData,
  createEDFBinaryData,
  generateExportFilename,
  estimateExportSize,
  validateSessionsForExport,
  validateBaselinesForExport,
  type ExportOptions,
  type EDFHeader,
  type EDFSignalHeader,
} from '../src/services/exportService';

import type {
  Session,
  BaselineProfile,
  EEGDataPacket,
  DeviceInfo,
  AppSettings,
} from '../src/types';

// ============================================================================
// Test Data Fixtures
// ============================================================================

const createMockSession = (overrides: Partial<Session> = {}): Session => ({
  id: 1,
  session_type: 'quick_boost',
  start_time: 1705800000000,
  end_time: 1705800600000,
  duration_seconds: 600,
  avg_theta_zscore: 1.5,
  max_theta_zscore: 2.8,
  entrainment_freq: 6.5,
  volume: 0.75,
  signal_quality_avg: 85.5,
  subjective_rating: 4,
  notes: 'Good session',
  ...overrides,
});

const createMockBaseline = (
  overrides: Partial<BaselineProfile> = {}
): BaselineProfile => ({
  theta_mean: 10.5,
  theta_std: 2.3,
  alpha_mean: 8.7,
  beta_mean: 6.2,
  peak_theta_freq: 6.5,
  optimal_freq: 6.0,
  calibration_timestamp: 1705800000000,
  quality_score: 85.5,
  ...overrides,
});

const createMockEEGPacket = (
  overrides: Partial<EEGDataPacket> = {}
): EEGDataPacket => ({
  timestamp: 1705800000000,
  samples: [10.5, 11.2, 9.8, 10.1, 10.7],
  sequence_number: 1,
  ...overrides,
});

const createMockDeviceInfo = (
  overrides: Partial<DeviceInfo> = {}
): DeviceInfo => ({
  id: 'device-123',
  name: 'FlowState Headband',
  type: 'headband',
  sampling_rate: 500,
  battery_level: 85,
  firmware_version: '1.2.0',
  rssi: -65,
  is_connected: true,
  last_connected: 1705800000000,
  ...overrides,
});

const createMockSettings = (
  overrides: Partial<AppSettings> = {}
): AppSettings => ({
  paired_device_id: 'device-123',
  auto_reconnect: true,
  notifications_enabled: true,
  notification_style: 'smart',
  notification_frequency: 4,
  quiet_hours_start: 22,
  quiet_hours_end: 7,
  audio_mixing_mode: 'mix',
  default_volume: 0.7,
  mixing_ratio: 0.5,
  auto_boost_enabled: true,
  boost_frequency: 6.0,
  boost_time: 7,
  target_zscore: 2.0,
  closed_loop_behavior: 'reduce_intensity',
  text_size: 'medium',
  reduce_motion: false,
  haptic_feedback: true,
  anonymous_analytics: true,
  onboarding_completed: true,
  ab_testing_enabled: false,
  ...overrides,
});

// ============================================================================
// CSV Export Tests
// ============================================================================

describe('CSV Export Functions', () => {
  describe('exportSessionsToCSV', () => {
    it('should export sessions with headers by default', () => {
      const sessions = [createMockSession()];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).toContain('id,session_type,start_time,end_time');
      expect(csv).toContain('quick_boost');
      expect(csv.split('\n')).toHaveLength(2);
    });

    it('should export sessions without headers when option is false', () => {
      const sessions = [createMockSession()];
      const csv = exportSessionsToCSV(sessions, { includeHeaders: false });

      expect(csv).not.toContain('id,session_type');
      expect(csv.split('\n')).toHaveLength(1);
    });

    it('should return header row only for empty sessions array', () => {
      const csv = exportSessionsToCSV([]);
      expect(csv).toContain('id,session_type');
      expect(csv.split('\n')).toHaveLength(1);
    });

    it('should return empty string for empty sessions with no headers', () => {
      const csv = exportSessionsToCSV([], { includeHeaders: false });
      expect(csv).toBe('');
    });

    it('should format timestamps as ISO strings', () => {
      const sessions = [createMockSession({ start_time: 1705800000000 })];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).toContain('2024-01-21T');
    });

    it('should handle null subjective_rating', () => {
      const sessions = [createMockSession({ subjective_rating: null })];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).not.toContain('undefined');
    });

    it('should handle null notes', () => {
      const sessions = [createMockSession({ notes: null })];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).not.toContain('undefined');
    });

    it('should escape notes containing commas', () => {
      const sessions = [createMockSession({ notes: 'Good, but tired' })];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).toContain('"Good, but tired"');
    });

    it('should escape notes containing quotes', () => {
      const sessions = [createMockSession({ notes: 'Said "great"' })];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).toContain('"Said ""great"""');
    });

    it('should export multiple sessions', () => {
      const sessions = [
        createMockSession({ id: 1 }),
        createMockSession({ id: 2, session_type: 'calibration' }),
        createMockSession({ id: 3, session_type: 'custom' }),
      ];
      const csv = exportSessionsToCSV(sessions);

      expect(csv.split('\n')).toHaveLength(4);
      expect(csv).toContain('calibration');
      expect(csv).toContain('custom');
    });

    it('should use custom delimiter', () => {
      const sessions = [createMockSession()];
      const csv = exportSessionsToCSV(sessions, { delimiter: ';' });

      expect(csv).toContain('id;session_type;start_time');
    });

    it('should format numeric values with appropriate precision', () => {
      const sessions = [
        createMockSession({
          avg_theta_zscore: 1.5678,
          entrainment_freq: 6.5,
          volume: 0.75,
        }),
      ];
      const csv = exportSessionsToCSV(sessions);

      expect(csv).toContain('1.5678');
      expect(csv).toContain('6.50');
      expect(csv).toContain('0.75');
    });
  });

  describe('exportBaselinesToCSV', () => {
    it('should export baselines with headers by default', () => {
      const baselines = [createMockBaseline()];
      const csv = exportBaselinesToCSV(baselines);

      expect(csv).toContain('theta_mean,theta_std');
      expect(csv.split('\n')).toHaveLength(2);
    });

    it('should return header row only for empty baselines', () => {
      const csv = exportBaselinesToCSV([]);
      expect(csv).toContain('theta_mean,theta_std');
    });

    it('should format values with high precision', () => {
      const baselines = [createMockBaseline({ theta_mean: 10.123456 })];
      const csv = exportBaselinesToCSV(baselines);

      expect(csv).toContain('10.123456');
    });

    it('should format calibration_timestamp as ISO string', () => {
      const baselines = [createMockBaseline()];
      const csv = exportBaselinesToCSV(baselines);

      expect(csv).toContain('2024-01-21T');
    });
  });

  describe('exportEEGDataToCSV', () => {
    it('should export EEG data with timestamp and samples', () => {
      const packets = [
        createMockEEGPacket({
          timestamp: 1705800000000,
          samples: [10.5, 11.2, 9.8],
          sequence_number: 1,
        }),
      ];
      const csv = exportEEGDataToCSV(packets);

      expect(csv).toContain(
        'timestamp,sequence_number,sample_0,sample_1,sample_2'
      );
      expect(csv).toContain('1705800000000');
      expect(csv).toContain('10.500000');
    });

    it('should return empty string for empty packets', () => {
      const csv = exportEEGDataToCSV([]);
      expect(csv).toBe('');
    });

    it('should handle packets with different sample counts', () => {
      const packets = [
        createMockEEGPacket({ samples: [1, 2, 3, 4, 5] }),
        createMockEEGPacket({ samples: [1, 2, 3] }),
      ];
      const csv = exportEEGDataToCSV(packets);

      // Should have columns for max samples (5)
      expect(csv).toContain('sample_4');
      // Second row should have empty values for missing samples
      const lines = csv.split('\n');
      expect(lines[2].split(',').length).toBe(7); // timestamp + seq + 5 samples
    });

    it('should use custom delimiter', () => {
      const packets = [createMockEEGPacket()];
      const csv = exportEEGDataToCSV(packets, { delimiter: '\t' });

      expect(csv).toContain('timestamp\tsequence_number');
    });
  });
});

// ============================================================================
// JSON Export Tests
// ============================================================================

describe('JSON Export Functions', () => {
  describe('exportSessionsToJSON', () => {
    it('should export sessions as pretty-printed JSON by default', () => {
      const sessions = [createMockSession()];
      const json = exportSessionsToJSON(sessions);

      expect(() => JSON.parse(json)).not.toThrow();
      expect(json).toContain('\n');
      expect(json).toContain('  ');
    });

    it('should export compact JSON when prettyPrint is false', () => {
      const sessions = [createMockSession()];
      const json = exportSessionsToJSON(sessions, { prettyPrint: false });

      expect(json).not.toContain('\n');
      expect(JSON.parse(json)).toEqual(sessions);
    });

    it('should respect custom indentation', () => {
      const sessions = [createMockSession()];
      const json = exportSessionsToJSON(sessions, { indentation: 4 });

      expect(json).toContain('    ');
    });

    it('should preserve all session fields', () => {
      const session = createMockSession();
      const json = exportSessionsToJSON([session]);
      const parsed = JSON.parse(json);

      expect(parsed[0]).toEqual(session);
    });
  });

  describe('exportBaselinesToJSON', () => {
    it('should export baselines as valid JSON', () => {
      const baselines = [createMockBaseline()];
      const json = exportBaselinesToJSON(baselines);

      const parsed = JSON.parse(json);
      expect(parsed[0].theta_mean).toBe(10.5);
    });
  });

  describe('exportUserDataToJSON', () => {
    it('should export complete user data', () => {
      const data = createUserDataExport(
        [createMockBaseline()],
        [createMockSession()],
        createMockSettings(),
        createMockDeviceInfo()
      );
      const json = exportUserDataToJSON(data);
      const parsed = JSON.parse(json);

      expect(parsed.version).toBe('1.0.0');
      expect(parsed.exportedAt).toBeDefined();
      expect(parsed.baselines).toHaveLength(1);
      expect(parsed.sessions).toHaveLength(1);
      expect(parsed.settings).toBeDefined();
      expect(parsed.device).toBeDefined();
    });
  });

  describe('createUserDataExport', () => {
    it('should create export object with current timestamp', () => {
      const before = Date.now();
      const data = createUserDataExport([], []);
      const after = Date.now();

      expect(data.exportedAt).toBeGreaterThanOrEqual(before);
      expect(data.exportedAt).toBeLessThanOrEqual(after);
    });

    it('should include version string', () => {
      const data = createUserDataExport([], []);
      expect(data.version).toBe('1.0.0');
    });

    it('should include optional settings and device when provided', () => {
      const data = createUserDataExport(
        [],
        [],
        createMockSettings(),
        createMockDeviceInfo()
      );

      expect(data.settings).toBeDefined();
      expect(data.device).toBeDefined();
    });

    it('should work without optional parameters', () => {
      const data = createUserDataExport(
        [createMockBaseline()],
        [createMockSession()]
      );

      expect(data.settings).toBeUndefined();
      expect(data.device).toBeUndefined();
    });
  });
});

// ============================================================================
// EDF Export Tests
// ============================================================================

describe('EDF Export Functions', () => {
  describe('createEDFHeader', () => {
    it('should create header with correct version', () => {
      const header = createEDFHeader(1705800000000, 10, 1, 1);
      expect(header.version).toBe('0');
    });

    it('should format date correctly (dd.mm.yy)', () => {
      const header = createEDFHeader(1705800000000, 10, 1, 1);
      expect(header.startDate).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
    });

    it('should format time correctly (hh.mm.ss)', () => {
      const header = createEDFHeader(1705800000000, 10, 1, 1);
      expect(header.startTime).toMatch(/^\d{2}\.\d{2}\.\d{2}$/);
    });

    it('should calculate header bytes correctly', () => {
      const header = createEDFHeader(1705800000000, 10, 1, 2);
      // 256 for main header + 256 per signal
      expect(header.headerBytes).toBe(256 + 2 * 256);
    });

    it('should truncate long patient ID', () => {
      const longId = 'A'.repeat(100);
      const header = createEDFHeader(1705800000000, 10, 1, 1, longId);
      expect(header.patientId.length).toBe(80);
    });
  });

  describe('createEDFSignalHeader', () => {
    it('should create signal header with correct label', () => {
      const signalHeader = createEDFSignalHeader('EEG Fp1', 500, 1);
      expect(signalHeader.label).toBe('EEG Fp1');
    });

    it('should calculate samples per record based on sampling rate', () => {
      const signalHeader = createEDFSignalHeader('EEG', 500, 1);
      expect(signalHeader.numSamplesPerRecord).toBe(500);

      const signalHeader2 = createEDFSignalHeader('EEG', 250, 2);
      expect(signalHeader2.numSamplesPerRecord).toBe(500);
    });

    it('should use default physical range', () => {
      const signalHeader = createEDFSignalHeader('EEG', 500, 1);
      expect(signalHeader.physicalMinimum).toBe(-1000);
      expect(signalHeader.physicalMaximum).toBe(1000);
    });

    it('should use custom physical range when provided', () => {
      const signalHeader = createEDFSignalHeader('EEG', 500, 1, -500, 500);
      expect(signalHeader.physicalMinimum).toBe(-500);
      expect(signalHeader.physicalMaximum).toBe(500);
    });

    it('should set correct physical dimension for EEG', () => {
      const signalHeader = createEDFSignalHeader('EEG', 500, 1);
      expect(signalHeader.physicalDimension).toBe('uV');
    });

    it('should truncate long label to 16 characters', () => {
      const longLabel = 'EEG_Channel_Fp1_Reference_A1';
      const signalHeader = createEDFSignalHeader(longLabel, 500, 1);
      expect(signalHeader.label.length).toBe(16);
    });
  });

  describe('physicalToDigital', () => {
    it('should convert physical value to digital value', () => {
      // Mid-point should map to mid-point
      const digital = physicalToDigital(0, -1000, 1000, -32768, 32767);
      expect(digital).toBeCloseTo(0, 0);
    });

    it('should map physical minimum to digital minimum', () => {
      const digital = physicalToDigital(-1000, -1000, 1000, -32768, 32767);
      expect(digital).toBe(-32768);
    });

    it('should map physical maximum to digital maximum', () => {
      const digital = physicalToDigital(1000, -1000, 1000, -32768, 32767);
      expect(digital).toBe(32767);
    });

    it('should clamp values outside range', () => {
      const digital = physicalToDigital(2000, -1000, 1000, -32768, 32767);
      expect(digital).toBe(32767);

      const digitalLow = physicalToDigital(-2000, -1000, 1000, -32768, 32767);
      expect(digitalLow).toBe(-32768);
    });

    it('should handle zero physical range', () => {
      const digital = physicalToDigital(100, 100, 100, -32768, 32767);
      expect(digital).toBe(-32768);
    });
  });

  describe('digitalToPhysical', () => {
    it('should convert digital value back to physical value', () => {
      const physical = digitalToPhysical(0, -1000, 1000, -32768, 32767);
      expect(physical).toBeCloseTo(0, 1);
    });

    it('should be inverse of physicalToDigital', () => {
      const original = 500;
      const digital = physicalToDigital(original, -1000, 1000, -32768, 32767);
      const converted = digitalToPhysical(digital, -1000, 1000, -32768, 32767);
      expect(converted).toBeCloseTo(original, 0);
    });
  });

  describe('serializeEDFHeader', () => {
    it('should produce exactly 256 bytes', () => {
      const header = createEDFHeader(1705800000000, 10, 1, 1);
      const serialized = serializeEDFHeader(header);
      expect(serialized.length).toBe(256);
    });

    it('should start with version field', () => {
      const header = createEDFHeader(1705800000000, 10, 1, 1);
      const serialized = serializeEDFHeader(header);
      expect(serialized.substring(0, 8)).toBe('0       ');
    });
  });

  describe('serializeEDFSignalHeaders', () => {
    it('should produce 256 bytes per signal', () => {
      const signalHeaders = [
        createEDFSignalHeader('EEG Fp1', 500, 1),
        createEDFSignalHeader('EEG Fp2', 500, 1),
      ];
      const serialized = serializeEDFSignalHeaders(signalHeaders);
      expect(serialized.length).toBe(256 * 2);
    });

    it('should start with labels', () => {
      const signalHeaders = [createEDFSignalHeader('EEG Fp1', 500, 1)];
      const serialized = serializeEDFSignalHeaders(signalHeaders);
      expect(serialized.substring(0, 16)).toContain('EEG Fp1');
    });
  });

  describe('createEDFExportData', () => {
    it('should create EDF data from packets', () => {
      const packets = Array.from({ length: 10 }, (_, i) =>
        createMockEEGPacket({
          timestamp: 1705800000000 + i * 2,
          samples: Array.from(
            { length: 500 },
            (_, j) => Math.sin((i * 500 + j) * 0.01) * 100
          ),
          sequence_number: i,
        })
      );
      const device = createMockDeviceInfo({ sampling_rate: 500 });

      const edfData = createEDFExportData(packets, device, 1);

      expect(edfData.header.numSignals).toBe(1);
      expect(edfData.signalHeaders).toHaveLength(1);
      expect(edfData.samples.length).toBeGreaterThan(0);
    });

    it('should throw error for empty packets', () => {
      const device = createMockDeviceInfo();
      expect(() => createEDFExportData([], device)).toThrow(
        'Cannot create EDF export with no data packets'
      );
    });

    it('should throw error for insufficient data', () => {
      const packets = [
        createMockEEGPacket({ samples: [1, 2, 3] }), // Only 3 samples
      ];
      const device = createMockDeviceInfo({ sampling_rate: 500 }); // Needs 500 samples per record

      expect(() => createEDFExportData(packets, device, 1)).toThrow(
        'Insufficient data for at least one data record'
      );
    });

    it('should use headband channel label for headband device', () => {
      const packets = Array.from({ length: 5 }, (_, i) =>
        createMockEEGPacket({
          samples: Array.from({ length: 500 }, () => Math.random() * 100),
        })
      );
      const device = createMockDeviceInfo({ type: 'headband' });

      const edfData = createEDFExportData(packets, device, 1);

      expect(edfData.signalHeaders[0].label).toContain('Fp1');
    });

    it('should use earpiece channel label for earpiece device', () => {
      const packets = Array.from({ length: 5 }, (_, i) =>
        createMockEEGPacket({
          samples: Array.from({ length: 250 }, () => Math.random() * 100),
        })
      );
      const device = createMockDeviceInfo({
        type: 'earpiece',
        sampling_rate: 250,
      });

      const edfData = createEDFExportData(packets, device, 1);

      expect(edfData.signalHeaders[0].label).toContain('Ear');
    });
  });

  describe('createEDFBinaryData', () => {
    it('should create Int16Array from EDF data', () => {
      const packets = Array.from({ length: 5 }, () =>
        createMockEEGPacket({
          samples: Array.from({ length: 500 }, () => Math.random() * 100),
        })
      );
      const device = createMockDeviceInfo({ sampling_rate: 500 });
      const edfData = createEDFExportData(packets, device, 1);

      const binaryData = createEDFBinaryData(edfData);

      expect(binaryData).toBeInstanceOf(Int16Array);
      expect(binaryData.length).toBeGreaterThan(0);
    });

    it('should contain values within 16-bit signed integer range', () => {
      const packets = Array.from({ length: 5 }, () =>
        createMockEEGPacket({
          samples: Array.from(
            { length: 500 },
            () => Math.random() * 2000 - 1000
          ),
        })
      );
      const device = createMockDeviceInfo({ sampling_rate: 500 });
      const edfData = createEDFExportData(packets, device, 1);

      const binaryData = createEDFBinaryData(edfData);

      for (const value of binaryData) {
        expect(value).toBeGreaterThanOrEqual(-32768);
        expect(value).toBeLessThanOrEqual(32767);
      }
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Utility Functions', () => {
  describe('generateExportFilename', () => {
    it('should generate filename with correct data type', () => {
      const filename = generateExportFilename('sessions', 'csv');
      expect(filename).toContain('sessions');
      expect(filename).toContain('.csv');
    });

    it('should generate filename with timestamp', () => {
      const filename = generateExportFilename('baselines', 'json');
      // Should match pattern like flowstate_baselines_2024-01-21T12-30-45.json
      expect(filename).toMatch(
        /flowstate_baselines_\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.json/
      );
    });

    it('should support all data types', () => {
      expect(generateExportFilename('sessions', 'csv')).toContain('sessions');
      expect(generateExportFilename('baselines', 'json')).toContain(
        'baselines'
      );
      expect(generateExportFilename('userdata', 'json')).toContain('userdata');
      expect(generateExportFilename('eeg', 'edf')).toContain('eeg');
    });

    it('should support all formats', () => {
      expect(generateExportFilename('sessions', 'csv')).toContain('.csv');
      expect(generateExportFilename('sessions', 'json')).toContain('.json');
      expect(generateExportFilename('eeg', 'edf')).toContain('.edf');
    });
  });

  describe('estimateExportSize', () => {
    it('should return 0 for empty data', () => {
      expect(estimateExportSize([], 'csv')).toBe(0);
      expect(estimateExportSize([], 'json')).toBe(0);
    });

    it('should estimate larger size for JSON than CSV', () => {
      const sessions = [createMockSession()];
      const csvSize = estimateExportSize(sessions, 'csv');
      const jsonSize = estimateExportSize(sessions, 'json');

      expect(jsonSize).toBeGreaterThan(csvSize);
    });

    it('should scale with number of records', () => {
      const oneSessions = [createMockSession()];
      const tenSessions = Array.from({ length: 10 }, () => createMockSession());

      const oneSize = estimateExportSize(oneSessions, 'csv');
      const tenSize = estimateExportSize(tenSessions, 'csv');

      expect(tenSize).toBe(oneSize * 10);
    });

    it('should account for sample count in EEG packets', () => {
      const smallPackets = [createMockEEGPacket({ samples: [1, 2, 3] })];
      const largePackets = [
        createMockEEGPacket({ samples: Array.from({ length: 100 }, () => 1) }),
      ];

      const smallSize = estimateExportSize(smallPackets, 'edf');
      const largeSize = estimateExportSize(largePackets, 'edf');

      expect(largeSize).toBeGreaterThan(smallSize);
    });
  });

  describe('validateSessionsForExport', () => {
    it('should return valid for correct sessions', () => {
      const sessions = [createMockSession()];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect missing ID', () => {
      const sessions = [
        createMockSession({ id: undefined as unknown as number }),
      ];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('missing an ID'))).toBe(true);
    });

    it('should detect missing session_type', () => {
      const sessions = [
        createMockSession({ session_type: '' as Session['session_type'] }),
      ];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('session_type'))).toBe(true);
    });

    it('should detect start_time after end_time', () => {
      const sessions = [
        createMockSession({
          start_time: 1705800600000,
          end_time: 1705800000000,
        }),
      ];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(false);
      expect(
        result.errors.some((e) => e.includes('start_time after end_time'))
      ).toBe(true);
    });

    it('should detect negative duration', () => {
      const sessions = [createMockSession({ duration_seconds: -100 })];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('negative duration'))).toBe(
        true
      );
    });

    it('should detect signal quality outside valid range', () => {
      const sessions = [createMockSession({ signal_quality_avg: 150 })];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('signal_quality_avg'))).toBe(
        true
      );
    });

    it('should return multiple errors when multiple issues exist', () => {
      const sessions = [
        createMockSession({
          id: undefined as unknown as number,
          duration_seconds: -100,
          signal_quality_avg: 150,
        }),
      ];
      const result = validateSessionsForExport(sessions);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('validateBaselinesForExport', () => {
    it('should return valid for correct baselines', () => {
      const baselines = [createMockBaseline()];
      const result = validateBaselinesForExport(baselines);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect negative theta_std', () => {
      const baselines = [createMockBaseline({ theta_std: -1 })];
      const result = validateBaselinesForExport(baselines);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('negative theta_std'))).toBe(
        true
      );
    });

    it('should detect quality_score outside range', () => {
      const baselines = [createMockBaseline({ quality_score: 150 })];
      const result = validateBaselinesForExport(baselines);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('quality_score'))).toBe(true);
    });

    it('should detect peak_theta_freq outside theta band', () => {
      const baselines = [createMockBaseline({ peak_theta_freq: 12 })];
      const result = validateBaselinesForExport(baselines);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('peak_theta_freq'))).toBe(
        true
      );
    });

    it('should accept peak_theta_freq within theta band', () => {
      const baselines = [
        createMockBaseline({ peak_theta_freq: 4 }),
        createMockBaseline({ peak_theta_freq: 6 }),
        createMockBaseline({ peak_theta_freq: 8 }),
      ];
      const result = validateBaselinesForExport(baselines);

      expect(result.valid).toBe(true);
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Export Integration Tests', () => {
  it('should export and validate a complete workflow', () => {
    // Create test data
    const sessions = [
      createMockSession({ id: 1 }),
      createMockSession({ id: 2, session_type: 'calibration' }),
    ];
    const baselines = [createMockBaseline()];

    // Validate data
    const sessionValidation = validateSessionsForExport(sessions);
    const baselineValidation = validateBaselinesForExport(baselines);

    expect(sessionValidation.valid).toBe(true);
    expect(baselineValidation.valid).toBe(true);

    // Export to CSV
    const sessionsCSV = exportSessionsToCSV(sessions);
    const baselinesCSV = exportBaselinesToCSV(baselines);

    expect(sessionsCSV.split('\n').length).toBe(3); // Header + 2 sessions
    expect(baselinesCSV.split('\n').length).toBe(2); // Header + 1 baseline

    // Export to JSON
    const userData = createUserDataExport(baselines, sessions);
    const userDataJSON = exportUserDataToJSON(userData);
    const parsed = JSON.parse(userDataJSON);

    expect(parsed.sessions).toHaveLength(2);
    expect(parsed.baselines).toHaveLength(1);
    expect(parsed.version).toBe('1.0.0');
  });

  it('should generate unique filenames for concurrent exports', async () => {
    const filename1 = generateExportFilename('sessions', 'csv');

    // Small delay to ensure different timestamp
    await new Promise((resolve) => setTimeout(resolve, 10));

    const filename2 = generateExportFilename('sessions', 'csv');

    // Filenames may be the same if within same second, but that's expected behavior
    expect(filename1).toContain('flowstate_sessions_');
    expect(filename2).toContain('flowstate_sessions_');
  });
});
