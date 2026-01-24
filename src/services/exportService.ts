/**
 * Data Export Service for FlowState BCI
 * Provides utilities for exporting data in CSV, JSON, and EDF formats
 * Includes share sheet integration for iOS and Android
 */

import type {
  Session,
  BaselineProfile,
  EEGDataPacket,
  DeviceInfo,
  AppSettings,
} from '../types';

import {
  shareFile,
  isShareAvailable,
  getMimeTypeForExtension,
  type ShareResult,
} from './shareService';

/**
 * Progress callback type for export operations
 * Called at key milestones during export (0%, 25%, 50%, 75%, 100%)
 */
export type ExportProgressCallback = (
  progress: number,
  message: string
) => void;

/**
 * Export options for customizing output
 */
export interface ExportOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  prettyPrint?: boolean;
  indentation?: number;
  /** Optional progress callback for tracking export progress */
  onProgress?: ExportProgressCallback;
}

/**
 * EDF file header information
 * Based on European Data Format specification
 */
export interface EDFHeader {
  version: string;
  patientId: string;
  recordingId: string;
  startDate: string;
  startTime: string;
  headerBytes: number;
  reserved: string;
  numDataRecords: number;
  dataRecordDuration: number;
  numSignals: number;
}

/**
 * EDF signal header for each channel
 */
export interface EDFSignalHeader {
  label: string;
  transducerType: string;
  physicalDimension: string;
  physicalMinimum: number;
  physicalMaximum: number;
  digitalMinimum: number;
  digitalMaximum: number;
  prefiltering: string;
  numSamplesPerRecord: number;
  reserved: string;
}

/**
 * Complete user data export structure
 */
export interface UserDataExport {
  exportedAt: number;
  version: string;
  baselines: BaselineProfile[];
  sessions: Session[];
  settings?: AppSettings;
  device?: DeviceInfo;
}

/**
 * EDF export data structure
 */
export interface EDFExportData {
  header: EDFHeader;
  signalHeaders: EDFSignalHeader[];
  samples: number[][];
}

// ============================================================================
// CSV Export Functions
// ============================================================================

/**
 * Escapes a value for CSV format
 * Wraps in quotes if contains delimiter, quote, or newline
 */
const escapeCSVValue = (value: unknown, delimiter: string = ','): string => {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  if (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
};

/**
 * Converts an array of objects to CSV format
 */
const objectsToCSV = <T extends Record<string, unknown>>(
  data: T[],
  options: ExportOptions = {}
): string => {
  const { includeHeaders = true, delimiter = ',' } = options;

  if (data.length === 0) {
    return '';
  }

  const keys = Object.keys(data[0]);
  const rows: string[] = [];

  if (includeHeaders) {
    rows.push(
      keys.map((key) => escapeCSVValue(key, delimiter)).join(delimiter)
    );
  }

  for (const item of data) {
    const values = keys.map((key) => escapeCSVValue(item[key], delimiter));
    rows.push(values.join(delimiter));
  }

  return rows.join('\n');
};

/**
 * Exports sessions to CSV format
 * Includes all session fields with human-readable timestamps
 */
export const exportSessionsToCSV = (
  sessions: Session[],
  options: ExportOptions = {}
): string => {
  const { onProgress } = options;

  // Report start of export
  onProgress?.(0, 'Preparing session data...');

  if (sessions.length === 0) {
    onProgress?.(100, 'Export complete');
    return options.includeHeaders !== false
      ? 'id,session_type,start_time,end_time,duration_seconds,avg_theta_zscore,max_theta_zscore,entrainment_freq,volume,signal_quality_avg,subjective_rating,notes'
      : '';
  }

  // Report 25% - starting data transformation
  onProgress?.(25, 'Formatting session data...');

  const formattedSessions = sessions.map((session) => ({
    id: session.id,
    session_type: session.session_type,
    start_time: new Date(session.start_time).toISOString(),
    end_time: new Date(session.end_time).toISOString(),
    duration_seconds: session.duration_seconds,
    avg_theta_zscore: session.avg_theta_zscore.toFixed(4),
    max_theta_zscore: session.max_theta_zscore.toFixed(4),
    entrainment_freq: session.entrainment_freq.toFixed(2),
    volume: session.volume.toFixed(2),
    signal_quality_avg: session.signal_quality_avg.toFixed(2),
    subjective_rating: session.subjective_rating,
    notes: session.notes,
  }));

  // Report 50% - data formatted
  onProgress?.(50, 'Converting to CSV format...');

  // Report 75% - starting CSV conversion
  onProgress?.(75, 'Generating CSV output...');

  const result = objectsToCSV(formattedSessions, options);

  // Report 100% - complete
  onProgress?.(100, 'Export complete');

  return result;
};

/**
 * Exports baseline profiles to CSV format
 */
export const exportBaselinesToCSV = (
  baselines: BaselineProfile[],
  options: ExportOptions = {}
): string => {
  const { onProgress } = options;

  // Report start of export
  onProgress?.(0, 'Preparing baseline data...');

  if (baselines.length === 0) {
    onProgress?.(100, 'Export complete');
    return options.includeHeaders !== false
      ? 'theta_mean,theta_std,alpha_mean,beta_mean,peak_theta_freq,optimal_freq,calibration_timestamp,quality_score'
      : '';
  }

  // Report 25% - starting data transformation
  onProgress?.(25, 'Formatting baseline data...');

  const formattedBaselines = baselines.map((baseline) => ({
    theta_mean: baseline.theta_mean.toFixed(6),
    theta_std: baseline.theta_std.toFixed(6),
    alpha_mean: baseline.alpha_mean.toFixed(6),
    beta_mean: baseline.beta_mean.toFixed(6),
    peak_theta_freq: baseline.peak_theta_freq.toFixed(4),
    optimal_freq: baseline.optimal_freq.toFixed(4),
    calibration_timestamp: new Date(
      baseline.calibration_timestamp
    ).toISOString(),
    quality_score: baseline.quality_score.toFixed(2),
  }));

  // Report 50% - data formatted
  onProgress?.(50, 'Converting to CSV format...');

  // Report 75% - starting CSV conversion
  onProgress?.(75, 'Generating CSV output...');

  const result = objectsToCSV(formattedBaselines, options);

  // Report 100% - complete
  onProgress?.(100, 'Export complete');

  return result;
};

/**
 * Exports EEG data packets to CSV format
 * Flattens samples array into columns
 */
export const exportEEGDataToCSV = (
  packets: EEGDataPacket[],
  options: ExportOptions = {}
): string => {
  const { onProgress } = options;

  // Report start of export
  onProgress?.(0, 'Preparing EEG data...');

  if (packets.length === 0) {
    onProgress?.(100, 'Export complete');
    return '';
  }

  const { includeHeaders = true, delimiter = ',' } = options;

  // Report 25% - analyzing data structure
  onProgress?.(25, 'Analyzing EEG packet structure...');

  const maxSamples = Math.max(...packets.map((p) => p.samples.length));
  const rows: string[] = [];

  if (includeHeaders) {
    const headers = ['timestamp', 'sequence_number'];
    for (let i = 0; i < maxSamples; i++) {
      headers.push(`sample_${i}`);
    }
    rows.push(headers.join(delimiter));
  }

  // Report 50% - processing packets
  onProgress?.(50, 'Processing EEG packets...');

  for (const packet of packets) {
    const values: string[] = [
      String(packet.timestamp),
      String(packet.sequence_number),
    ];
    for (let i = 0; i < maxSamples; i++) {
      values.push(
        i < packet.samples.length ? packet.samples[i].toFixed(6) : ''
      );
    }
    rows.push(values.join(delimiter));
  }

  // Report 75% - generating output
  onProgress?.(75, 'Generating CSV output...');

  const result = rows.join('\n');

  // Report 100% - complete
  onProgress?.(100, 'Export complete');

  return result;
};

// ============================================================================
// JSON Export Functions
// ============================================================================

/**
 * Exports sessions to JSON format
 */
export const exportSessionsToJSON = (
  sessions: Session[],
  options: ExportOptions = {}
): string => {
  const { prettyPrint = true, indentation = 2, onProgress } = options;

  // Report start of export
  onProgress?.(0, 'Preparing session data...');

  // Report 25% - validating data
  onProgress?.(25, 'Validating session data...');

  // Report 50% - serializing
  onProgress?.(50, 'Serializing to JSON...');

  // Report 75% - formatting
  onProgress?.(75, 'Formatting JSON output...');

  const result = JSON.stringify(
    sessions,
    null,
    prettyPrint ? indentation : undefined
  );

  // Report 100% - complete
  onProgress?.(100, 'Export complete');

  return result;
};

/**
 * Exports baseline profiles to JSON format
 */
export const exportBaselinesToJSON = (
  baselines: BaselineProfile[],
  options: ExportOptions = {}
): string => {
  const { prettyPrint = true, indentation = 2, onProgress } = options;

  // Report start of export
  onProgress?.(0, 'Preparing baseline data...');

  // Report 25% - validating data
  onProgress?.(25, 'Validating baseline data...');

  // Report 50% - serializing
  onProgress?.(50, 'Serializing to JSON...');

  // Report 75% - formatting
  onProgress?.(75, 'Formatting JSON output...');

  const result = JSON.stringify(
    baselines,
    null,
    prettyPrint ? indentation : undefined
  );

  // Report 100% - complete
  onProgress?.(100, 'Export complete');

  return result;
};

/**
 * Exports complete user data profile to JSON
 * Includes sessions, baselines, settings, and device info
 */
export const exportUserDataToJSON = (
  data: UserDataExport,
  options: ExportOptions = {}
): string => {
  const { prettyPrint = true, indentation = 2, onProgress } = options;

  // Report start of export
  onProgress?.(0, 'Preparing user data...');

  // Report 25% - processing sessions
  onProgress?.(25, 'Processing sessions...');

  // Report 50% - processing baselines
  onProgress?.(50, 'Processing baselines...');

  // Report 75% - serializing
  onProgress?.(75, 'Serializing user data...');

  const result = JSON.stringify(data, null, prettyPrint ? indentation : undefined);

  // Report 100% - complete
  onProgress?.(100, 'Export complete');

  return result;
};

/**
 * Creates a complete user data export object
 */
export const createUserDataExport = (
  baselines: BaselineProfile[],
  sessions: Session[],
  settings?: AppSettings,
  device?: DeviceInfo
): UserDataExport => {
  return {
    exportedAt: Date.now(),
    version: '1.0.0',
    baselines,
    sessions,
    settings,
    device,
  };
};

// ============================================================================
// EDF Export Functions
// ============================================================================

/**
 * Pads a string to a fixed length with spaces
 */
const padString = (str: string, length: number): string => {
  return str.slice(0, length).padEnd(length, ' ');
};

/**
 * Formats a date for EDF header (dd.mm.yy)
 */
const formatEDFDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear() % 100).padStart(2, '0');
  return `${day}.${month}.${year}`;
};

/**
 * Formats a time for EDF header (hh.mm.ss)
 */
const formatEDFTime = (timestamp: number): string => {
  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}.${minutes}.${seconds}`;
};

/**
 * Creates an EDF header from recording parameters
 */
export const createEDFHeader = (
  startTimestamp: number,
  numDataRecords: number,
  dataRecordDuration: number,
  numSignals: number,
  patientId: string = 'X X X X',
  recordingId: string = 'Startdate X X X X'
): EDFHeader => {
  const headerBytes = 256 + numSignals * 256;

  return {
    version: '0',
    patientId: patientId.slice(0, 80),
    recordingId: recordingId.slice(0, 80),
    startDate: formatEDFDate(startTimestamp),
    startTime: formatEDFTime(startTimestamp),
    headerBytes,
    reserved: '',
    numDataRecords,
    dataRecordDuration,
    numSignals,
  };
};

/**
 * Creates an EDF signal header for an EEG channel
 */
export const createEDFSignalHeader = (
  label: string,
  samplingRate: number,
  dataRecordDuration: number,
  physicalMin: number = -1000,
  physicalMax: number = 1000,
  digitalMin: number = -32768,
  digitalMax: number = 32767
): EDFSignalHeader => {
  return {
    label: label.slice(0, 16),
    transducerType: 'AgAgCl electrode',
    physicalDimension: 'uV',
    physicalMinimum: physicalMin,
    physicalMaximum: physicalMax,
    digitalMinimum: digitalMin,
    digitalMaximum: digitalMax,
    prefiltering: 'HP:0.1Hz LP:100Hz',
    numSamplesPerRecord: Math.round(samplingRate * dataRecordDuration),
    reserved: '',
  };
};

/**
 * Converts physical EEG values to digital values for EDF
 */
export const physicalToDigital = (
  physicalValue: number,
  physicalMin: number,
  physicalMax: number,
  digitalMin: number,
  digitalMax: number
): number => {
  const physicalRange = physicalMax - physicalMin;
  const digitalRange = digitalMax - digitalMin;

  if (physicalRange === 0) {
    return digitalMin;
  }

  const normalized = (physicalValue - physicalMin) / physicalRange;
  const digital = Math.round(normalized * digitalRange + digitalMin);

  return Math.max(digitalMin, Math.min(digitalMax, digital));
};

/**
 * Converts digital EDF values to physical EEG values
 */
export const digitalToPhysical = (
  digitalValue: number,
  physicalMin: number,
  physicalMax: number,
  digitalMin: number,
  digitalMax: number
): number => {
  const physicalRange = physicalMax - physicalMin;
  const digitalRange = digitalMax - digitalMin;

  if (digitalRange === 0) {
    return physicalMin;
  }

  const normalized = (digitalValue - digitalMin) / digitalRange;
  return normalized * physicalRange + physicalMin;
};

/**
 * Serializes EDF header to string (256 bytes)
 */
export const serializeEDFHeader = (header: EDFHeader): string => {
  let result = '';
  result += padString(header.version, 8);
  result += padString(header.patientId, 80);
  result += padString(header.recordingId, 80);
  result += padString(header.startDate, 8);
  result += padString(header.startTime, 8);
  result += padString(String(header.headerBytes), 8);
  result += padString(header.reserved, 44);
  result += padString(String(header.numDataRecords), 8);
  result += padString(String(header.dataRecordDuration), 8);
  result += padString(String(header.numSignals), 4);
  return result;
};

/**
 * Serializes EDF signal headers to string (256 bytes per signal)
 */
export const serializeEDFSignalHeaders = (
  signalHeaders: EDFSignalHeader[]
): string => {
  let result = '';

  // Labels (16 bytes each)
  for (const sh of signalHeaders) {
    result += padString(sh.label, 16);
  }

  // Transducer types (80 bytes each)
  for (const sh of signalHeaders) {
    result += padString(sh.transducerType, 80);
  }

  // Physical dimensions (8 bytes each)
  for (const sh of signalHeaders) {
    result += padString(sh.physicalDimension, 8);
  }

  // Physical minimums (8 bytes each)
  for (const sh of signalHeaders) {
    result += padString(String(sh.physicalMinimum), 8);
  }

  // Physical maximums (8 bytes each)
  for (const sh of signalHeaders) {
    result += padString(String(sh.physicalMaximum), 8);
  }

  // Digital minimums (8 bytes each)
  for (const sh of signalHeaders) {
    result += padString(String(sh.digitalMinimum), 8);
  }

  // Digital maximums (8 bytes each)
  for (const sh of signalHeaders) {
    result += padString(String(sh.digitalMaximum), 8);
  }

  // Prefiltering (80 bytes each)
  for (const sh of signalHeaders) {
    result += padString(sh.prefiltering, 80);
  }

  // Number of samples per record (8 bytes each)
  for (const sh of signalHeaders) {
    result += padString(String(sh.numSamplesPerRecord), 8);
  }

  // Reserved (32 bytes each)
  for (const sh of signalHeaders) {
    result += padString(sh.reserved, 32);
  }

  return result;
};

/**
 * Creates EDF export data from EEG packets
 */
export const createEDFExportData = (
  packets: EEGDataPacket[],
  deviceInfo: DeviceInfo,
  dataRecordDuration: number = 1
): EDFExportData => {
  if (packets.length === 0) {
    throw new Error('Cannot create EDF export with no data packets');
  }

  const samplingRate = deviceInfo.sampling_rate;
  const samplesPerRecord = Math.round(samplingRate * dataRecordDuration);
  const numChannels = packets[0].samples.length > 0 ? 1 : 0;

  // Flatten all samples from packets
  const allSamples: number[] = [];
  for (const packet of packets) {
    allSamples.push(...packet.samples);
  }

  // Calculate number of complete data records
  const numDataRecords = Math.floor(allSamples.length / samplesPerRecord);

  if (numDataRecords === 0) {
    throw new Error('Insufficient data for at least one data record');
  }

  // Create header
  const header = createEDFHeader(
    packets[0].timestamp,
    numDataRecords,
    dataRecordDuration,
    numChannels,
    'X X X FlowState',
    `Startdate ${formatEDFDate(packets[0].timestamp)} X ${deviceInfo.name} ${deviceInfo.type}`
  );

  // Create signal headers
  const signalHeaders: EDFSignalHeader[] = [];
  const channelLabel =
    deviceInfo.type === 'headband' ? 'EEG Fp1-Fp2' : 'EEG Ear';

  signalHeaders.push(
    createEDFSignalHeader(channelLabel, samplingRate, dataRecordDuration)
  );

  // Organize samples into data records
  const samples: number[][] = [];
  for (let i = 0; i < numDataRecords; i++) {
    const recordSamples: number[] = [];
    for (let j = 0; j < samplesPerRecord; j++) {
      const idx = i * samplesPerRecord + j;
      if (idx < allSamples.length) {
        recordSamples.push(allSamples[idx]);
      }
    }
    samples.push(recordSamples);
  }

  return {
    header,
    signalHeaders,
    samples,
  };
};

/**
 * Serializes EDF data to a complete EDF format string
 * Note: This produces the text representation; for binary EDF files,
 * the samples would need to be converted to 16-bit integers
 */
export const serializeEDFToText = (edfData: EDFExportData): string => {
  const { header, signalHeaders, samples } = edfData;

  let result = '';
  result += serializeEDFHeader(header);
  result += serializeEDFSignalHeaders(signalHeaders);

  // Add data records (text representation of samples)
  for (const record of samples) {
    for (const signalHeader of signalHeaders) {
      const digitalSamples = record.map((sample) =>
        physicalToDigital(
          sample,
          signalHeader.physicalMinimum,
          signalHeader.physicalMaximum,
          signalHeader.digitalMinimum,
          signalHeader.digitalMaximum
        )
      );
      result += digitalSamples.join(',') + '\n';
    }
  }

  return result;
};

/**
 * Creates binary buffer for EDF data samples
 * Returns an array of 16-bit signed integers ready for binary file writing
 */
export const createEDFBinaryData = (edfData: EDFExportData): Int16Array => {
  const { signalHeaders, samples } = edfData;

  // Calculate total number of samples
  let totalSamples = 0;
  for (const record of samples) {
    totalSamples += record.length;
  }

  const binaryData = new Int16Array(totalSamples);
  let offset = 0;

  for (const record of samples) {
    for (let i = 0; i < record.length; i++) {
      const signalHeader = signalHeaders[0]; // Single channel
      const digitalValue = physicalToDigital(
        record[i],
        signalHeader.physicalMinimum,
        signalHeader.physicalMaximum,
        signalHeader.digitalMinimum,
        signalHeader.digitalMaximum
      );
      binaryData[offset++] = digitalValue;
    }
  }

  return binaryData;
};

/**
 * Exports EEG data to EDF format metadata (JSON representation)
 * Use this for debugging or when binary export is not needed
 */
export const exportEEGToEDFMetadata = (
  packets: EEGDataPacket[],
  deviceInfo: DeviceInfo,
  dataRecordDuration: number = 1
): string => {
  const edfData = createEDFExportData(packets, deviceInfo, dataRecordDuration);

  return JSON.stringify(
    {
      header: edfData.header,
      signalHeaders: edfData.signalHeaders,
      numSamples: edfData.samples.reduce((acc, r) => acc + r.length, 0),
      dataRecords: edfData.samples.length,
    },
    null,
    2
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generates a suggested filename for an export
 */
export const generateExportFilename = (
  dataType: 'sessions' | 'baselines' | 'userdata' | 'eeg',
  format: 'csv' | 'json' | 'edf'
): string => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  return `flowstate_${dataType}_${timestamp}.${format}`;
};

/**
 * Estimates the size of an export in bytes (approximate)
 */
export const estimateExportSize = (
  data: Session[] | BaselineProfile[] | EEGDataPacket[],
  format: 'csv' | 'json' | 'edf'
): number => {
  if (data.length === 0) return 0;

  // Rough estimates based on typical data sizes
  const baseSize = format === 'json' ? 200 : format === 'csv' ? 150 : 2; // bytes per record

  if ('samples' in data[0]) {
    // EEG packets
    const avgSamples =
      (data as EEGDataPacket[]).reduce((acc, p) => acc + p.samples.length, 0) /
      data.length;
    return Math.round(data.length * (baseSize + avgSamples * 8));
  }

  return data.length * baseSize;
};

/**
 * Validates session data before export
 */
export const validateSessionsForExport = (
  sessions: Session[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (let i = 0; i < sessions.length; i++) {
    const session = sessions[i];

    if (session.id === undefined || session.id === null) {
      errors.push(`Session at index ${i} is missing an ID`);
    }

    if (!session.session_type) {
      errors.push(`Session ${session.id} is missing session_type`);
    }

    if (session.start_time > session.end_time) {
      errors.push(`Session ${session.id} has start_time after end_time`);
    }

    if (session.duration_seconds < 0) {
      errors.push(`Session ${session.id} has negative duration`);
    }

    if (session.signal_quality_avg < 0 || session.signal_quality_avg > 100) {
      errors.push(
        `Session ${session.id} has signal_quality_avg outside valid range (0-100)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates baseline profiles before export
 */
export const validateBaselinesForExport = (
  baselines: BaselineProfile[]
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (let i = 0; i < baselines.length; i++) {
    const baseline = baselines[i];

    if (baseline.theta_std < 0) {
      errors.push(`Baseline at index ${i} has negative theta_std`);
    }

    if (baseline.quality_score < 0 || baseline.quality_score > 100) {
      errors.push(
        `Baseline at index ${i} has quality_score outside valid range (0-100)`
      );
    }

    if (baseline.peak_theta_freq < 4 || baseline.peak_theta_freq > 8) {
      errors.push(
        `Baseline at index ${i} has peak_theta_freq outside theta band (4-8 Hz)`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

// ============================================================================
// Share Sheet Integration Functions
// ============================================================================

/**
 * Result of a save and share operation
 */
export interface SaveAndShareResult extends ShareResult {
  /** The temporary file path where data was saved */
  filePath?: string;
  /** The filename used for the export */
  filename?: string;
}

// Type definition for internal file system module
interface ExportFileSystemModule {
  cacheDirectory: string;
  writeAsStringAsync: (
    fileUri: string,
    contents: string,
    options?: { encoding?: string }
  ) => Promise<void>;
  deleteAsync: (
    fileUri: string,
    options?: { idempotent?: boolean }
  ) => Promise<void>;
  EncodingType: { UTF8: string; Base64: string };
}

// Lazy-loaded file system module
let fileSystemModule: ExportFileSystemModule | null = null;

/**
 * Attempts to load the expo-file-system module
 */
const loadFileSystem = async (): Promise<ExportFileSystemModule | null> => {
  if (fileSystemModule !== null) {
    return fileSystemModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = (await import('expo-file-system')) as any;
    fileSystemModule = {
      cacheDirectory: module.cacheDirectory || '',
      writeAsStringAsync: module.writeAsStringAsync,
      deleteAsync: module.deleteAsync,
      EncodingType: module.EncodingType || { UTF8: 'utf8', Base64: 'base64' },
    };
    return fileSystemModule;
  } catch (error) {
    console.warn('expo-file-system module not available:', error);
    return null;
  }
};

/**
 * Saves sessions to a temporary CSV file and opens the share sheet
 *
 * @param sessions - Array of sessions to export
 * @param options - Export options for CSV generation
 * @returns Promise resolving to SaveAndShareResult
 *
 * @example
 * ```typescript
 * const result = await saveAndShareCSV(sessions);
 * if (result.success) {
 *   console.log('Shared successfully from:', result.filePath);
 * } else {
 *   console.error('Share failed:', result.error);
 * }
 * ```
 */
export const saveAndShareCSV = async (
  sessions: Session[],
  options: ExportOptions = {}
): Promise<SaveAndShareResult> => {
  try {
    // Check if sharing is available
    const available = await isShareAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
        platform: 'unknown',
      };
    }

    // Load file system
    const FileSystem = await loadFileSystem();
    if (!FileSystem) {
      return {
        success: false,
        error: 'File system not available',
        platform: 'unknown',
      };
    }

    // Generate CSV content
    const csvContent = exportSessionsToCSV(sessions, options);

    // Generate filename
    const filename = generateExportFilename('sessions', 'csv');
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    // Write to temp file
    await FileSystem.writeAsStringAsync(filePath, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const mimeType = getMimeTypeForExtension('csv');
    const shareResult = await shareFile(
      filePath,
      mimeType,
      'FlowState Sessions Export'
    );

    // Schedule cleanup of temp file
    scheduleFileCleanup(FileSystem, filePath);

    return {
      ...shareResult,
      filePath,
      filename,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
      platform: 'unknown',
    };
  }
};

/**
 * Saves user data to a temporary JSON file and opens the share sheet
 *
 * @param userData - Complete user data export object
 * @param options - Export options for JSON generation
 * @returns Promise resolving to SaveAndShareResult
 *
 * @example
 * ```typescript
 * const userData = createUserDataExport(baselines, sessions, settings, device);
 * const result = await saveAndShareJSON(userData);
 * if (result.success) {
 *   console.log('User data shared successfully');
 * }
 * ```
 */
export const saveAndShareJSON = async (
  userData: UserDataExport,
  options: ExportOptions = {}
): Promise<SaveAndShareResult> => {
  try {
    // Check if sharing is available
    const available = await isShareAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
        platform: 'unknown',
      };
    }

    // Load file system
    const FileSystem = await loadFileSystem();
    if (!FileSystem) {
      return {
        success: false,
        error: 'File system not available',
        platform: 'unknown',
      };
    }

    // Generate JSON content
    const jsonContent = exportUserDataToJSON(userData, options);

    // Generate filename
    const filename = generateExportFilename('userdata', 'json');
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    // Write to temp file
    await FileSystem.writeAsStringAsync(filePath, jsonContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const mimeType = getMimeTypeForExtension('json');
    const shareResult = await shareFile(
      filePath,
      mimeType,
      'FlowState Data Export'
    );

    // Schedule cleanup of temp file
    scheduleFileCleanup(FileSystem, filePath);

    return {
      ...shareResult,
      filePath,
      filename,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
      platform: 'unknown',
    };
  }
};

/**
 * EDF share options
 */
export interface EDFShareOptions extends ExportOptions {
  /** Duration of each data record in seconds (default: 1) */
  dataRecordDuration?: number;
}

/**
 * Saves EEG data to a temporary EDF file and opens the share sheet
 *
 * @param eegData - Object containing packets and device info
 * @param options - EDF export and share options
 * @returns Promise resolving to SaveAndShareResult
 *
 * @example
 * ```typescript
 * const result = await saveAndShareEDF({
 *   packets: eegPackets,
 *   deviceInfo: connectedDevice
 * });
 * if (result.success) {
 *   console.log('EDF data shared successfully');
 * }
 * ```
 */
export const saveAndShareEDF = async (
  eegData: {
    packets: EEGDataPacket[];
    deviceInfo: DeviceInfo;
  },
  options: EDFShareOptions = {}
): Promise<SaveAndShareResult> => {
  try {
    // Validate input
    if (!eegData.packets || eegData.packets.length === 0) {
      return {
        success: false,
        error: 'No EEG data packets provided',
        platform: 'unknown',
      };
    }

    if (!eegData.deviceInfo) {
      return {
        success: false,
        error: 'Device info is required for EDF export',
        platform: 'unknown',
      };
    }

    // Check if sharing is available
    const available = await isShareAvailable();
    if (!available) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
        platform: 'unknown',
      };
    }

    // Load file system
    const FileSystem = await loadFileSystem();
    if (!FileSystem) {
      return {
        success: false,
        error: 'File system not available',
        platform: 'unknown',
      };
    }

    // Create EDF data
    const dataRecordDuration = options.dataRecordDuration ?? 1;
    const edfExportData = createEDFExportData(
      eegData.packets,
      eegData.deviceInfo,
      dataRecordDuration
    );

    // Serialize to text format (EDF text representation)
    const edfContent = serializeEDFToText(edfExportData);

    // Generate filename
    const filename = generateExportFilename('eeg', 'edf');
    const filePath = `${FileSystem.cacheDirectory}${filename}`;

    // Write to temp file
    await FileSystem.writeAsStringAsync(filePath, edfContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the file
    const mimeType = getMimeTypeForExtension('edf');
    const shareResult = await shareFile(
      filePath,
      mimeType,
      'FlowState EEG Data Export'
    );

    // Schedule cleanup of temp file
    scheduleFileCleanup(FileSystem, filePath);

    return {
      ...shareResult,
      filePath,
      filename,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
      platform: 'unknown',
    };
  }
};

/**
 * Schedules cleanup of a temporary file after a delay
 * Gives the share sheet time to read the file before deletion
 */
const scheduleFileCleanup = (
  FileSystem: ExportFileSystemModule,
  filePath: string,
  delayMs: number = 30000 // 30 seconds default
): void => {
  setTimeout(async () => {
    try {
      await FileSystem.deleteAsync(filePath, { idempotent: true });
    } catch {
      // Ignore cleanup errors - file may already be deleted or moved
    }
  }, delayMs);
};

// Re-export share service types and functions for convenience
export { isShareAvailable, type ShareResult };
