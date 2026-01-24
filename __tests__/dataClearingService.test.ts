/**
 * Tests for dataClearingService
 *
 * Validates the data clearing service functionality including:
 * - File structure and exports
 * - TypeScript interfaces
 * - clearAllSessions function
 * - clearAllBaselines function
 * - clearAllData function
 * - Helper functions
 * - Error handling
 * - Integration with database module
 */

import * as fs from 'fs';
import * as path from 'path';
import * as SQLite from 'expo-sqlite';
import {
  initializeDatabase,
  dropAllTables,
  insertSession,
  insertBaseline,
  upsertCircadianPattern,
  getSessionsCount,
  getBaselinesCount,
  getCircadianPatternsCount,
  type SessionRecord,
  type BaselineRecord,
  type CircadianPatternRecord,
} from '../src/services/database';
import {
  clearAllSessions,
  clearAllBaselines,
  clearAllCircadianPatterns,
  clearAllData,
  getDataSummary,
  hasDataToClear,
  formatClearingResultMessage,
  formatClearAllResultMessage,
  type ClearingResult,
  type ClearAllDataResult,
} from '../src/services/dataClearingService';

const servicePath = path.join(
  __dirname,
  '..',
  'src',
  'services',
  'dataClearingService.ts'
);

let serviceContent: string;

beforeAll(() => {
  serviceContent = fs.readFileSync(servicePath, 'utf-8');
});

describe('dataClearingService', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(servicePath)).toBe(true);
    });

    it('should be a TypeScript file', () => {
      expect(servicePath.endsWith('.ts')).toBe(true);
    });
  });

  describe('Exports', () => {
    it('should export clearAllSessions function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+clearAllSessions/);
    });

    it('should export clearAllBaselines function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+clearAllBaselines/);
    });

    it('should export clearAllCircadianPatterns function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+clearAllCircadianPatterns/);
    });

    it('should export clearAllData function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+clearAllData/);
    });

    it('should export getDataSummary function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+getDataSummary/);
    });

    it('should export hasDataToClear function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+hasDataToClear/);
    });

    it('should export formatClearingResultMessage function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+formatClearingResultMessage/);
    });

    it('should export formatClearAllResultMessage function', () => {
      expect(serviceContent).toMatch(/export\s+const\s+formatClearAllResultMessage/);
    });

    it('should export ClearingResult interface', () => {
      expect(serviceContent).toMatch(/export\s+interface\s+ClearingResult/);
    });

    it('should export ClearAllDataResult interface', () => {
      expect(serviceContent).toMatch(/export\s+interface\s+ClearAllDataResult/);
    });
  });

  describe('Required Imports', () => {
    it('should import SQLite from expo-sqlite', () => {
      expect(serviceContent).toMatch(/import\s+\*\s+as\s+SQLite\s+from\s+['"]expo-sqlite['"]/);
    });

    it('should import openDatabase from database', () => {
      expect(serviceContent).toMatch(/openDatabase/);
    });

    it('should import getSessionsCount from database', () => {
      expect(serviceContent).toMatch(/getSessionsCount/);
    });

    it('should import getBaselinesCount from database', () => {
      expect(serviceContent).toMatch(/getBaselinesCount/);
    });

    it('should import getCircadianPatternsCount from database', () => {
      expect(serviceContent).toMatch(/getCircadianPatternsCount/);
    });

    it('should import deleteAllSessions from database', () => {
      expect(serviceContent).toMatch(/deleteAllSessions/);
    });

    it('should import deleteAllBaselines from database', () => {
      expect(serviceContent).toMatch(/deleteAllBaselines/);
    });

    it('should import deleteAllCircadianPatterns from database', () => {
      expect(serviceContent).toMatch(/deleteAllCircadianPatterns/);
    });
  });

  describe('ClearingResult Interface', () => {
    it('should have success property', () => {
      expect(serviceContent).toMatch(/success\s*:\s*boolean/);
    });

    it('should have deletedCount property', () => {
      expect(serviceContent).toMatch(/deletedCount\s*:\s*number/);
    });

    it('should have optional error property', () => {
      expect(serviceContent).toMatch(/error\?\s*:\s*string/);
    });
  });

  describe('ClearAllDataResult Interface', () => {
    it('should have success property', () => {
      expect(serviceContent).toMatch(/success\s*:\s*boolean/);
    });

    it('should have sessionsDeleted property', () => {
      expect(serviceContent).toMatch(/sessionsDeleted\s*:\s*number/);
    });

    it('should have baselinesDeleted property', () => {
      expect(serviceContent).toMatch(/baselinesDeleted\s*:\s*number/);
    });

    it('should have circadianPatternsDeleted property', () => {
      expect(serviceContent).toMatch(/circadianPatternsDeleted\s*:\s*number/);
    });

    it('should have totalDeleted property', () => {
      expect(serviceContent).toMatch(/totalDeleted\s*:\s*number/);
    });

    it('should have optional error property', () => {
      expect(serviceContent).toMatch(/error\?\s*:\s*string/);
    });
  });

  describe('Function Signatures', () => {
    it('clearAllSessions should accept optional db parameter', () => {
      expect(serviceContent).toMatch(
        /clearAllSessions\s*=\s*\([\s\S]*?db\?\s*:\s*SQLite\.SQLiteDatabase/
      );
    });

    it('clearAllBaselines should accept optional db parameter', () => {
      expect(serviceContent).toMatch(
        /clearAllBaselines\s*=\s*\([\s\S]*?db\?\s*:\s*SQLite\.SQLiteDatabase/
      );
    });

    it('clearAllCircadianPatterns should accept optional db parameter', () => {
      expect(serviceContent).toMatch(
        /clearAllCircadianPatterns\s*=\s*\([\s\S]*?db\?\s*:\s*SQLite\.SQLiteDatabase/
      );
    });

    it('clearAllData should accept optional db parameter', () => {
      expect(serviceContent).toMatch(
        /clearAllData\s*=\s*\([\s\S]*?db\?\s*:\s*SQLite\.SQLiteDatabase/
      );
    });

    it('getDataSummary should accept optional db parameter', () => {
      expect(serviceContent).toMatch(
        /getDataSummary\s*=\s*\([\s\S]*?db\?\s*:\s*SQLite\.SQLiteDatabase/
      );
    });

    it('hasDataToClear should accept optional db parameter', () => {
      expect(serviceContent).toMatch(
        /hasDataToClear\s*=\s*\([\s\S]*?db\?\s*:\s*SQLite\.SQLiteDatabase/
      );
    });
  });

  describe('Return Types', () => {
    it('clearAllSessions should return ClearingResult', () => {
      expect(serviceContent).toMatch(
        /clearAllSessions[\s\S]*?:\s*ClearingResult/
      );
    });

    it('clearAllBaselines should return ClearingResult', () => {
      expect(serviceContent).toMatch(
        /clearAllBaselines[\s\S]*?:\s*ClearingResult/
      );
    });

    it('clearAllCircadianPatterns should return ClearingResult', () => {
      expect(serviceContent).toMatch(
        /clearAllCircadianPatterns[\s\S]*?:\s*ClearingResult/
      );
    });

    it('clearAllData should return ClearAllDataResult', () => {
      expect(serviceContent).toMatch(
        /clearAllData[\s\S]*?:\s*ClearAllDataResult/
      );
    });

    it('hasDataToClear should return boolean', () => {
      expect(serviceContent).toMatch(/hasDataToClear[\s\S]*?:\s*boolean/);
    });
  });

  describe('Error Handling', () => {
    it('should use try-catch for clearAllSessions', () => {
      expect(serviceContent).toMatch(
        /clearAllSessions[\s\S]*?try\s*\{[\s\S]*?catch/
      );
    });

    it('should use try-catch for clearAllBaselines', () => {
      expect(serviceContent).toMatch(
        /clearAllBaselines[\s\S]*?try\s*\{[\s\S]*?catch/
      );
    });

    it('should use try-catch for clearAllData', () => {
      expect(serviceContent).toMatch(
        /clearAllData[\s\S]*?try\s*\{[\s\S]*?catch/
      );
    });

    it('should return error message on failure', () => {
      expect(serviceContent).toMatch(/error:\s*[`'"]Failed to/);
    });

    it('should handle Error instances', () => {
      expect(serviceContent).toMatch(/error\s+instanceof\s+Error/);
    });
  });

  describe('Verification Logic', () => {
    it('should verify deletion was successful', () => {
      expect(serviceContent).toMatch(/remainingCount/);
    });

    it('should check if remaining count is zero', () => {
      expect(serviceContent).toMatch(/remainingCount\s*!==\s*0/);
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc for clearAllSessions', () => {
      expect(serviceContent).toMatch(
        /\/\*\*[\s\S]*?Clears all sessions/
      );
    });

    it('should have JSDoc for clearAllBaselines', () => {
      expect(serviceContent).toMatch(
        /\/\*\*[\s\S]*?Clears all baselines/
      );
    });

    it('should have JSDoc for clearAllData', () => {
      expect(serviceContent).toMatch(
        /\/\*\*[\s\S]*?Clears all data/
      );
    });

    it('should mention database parameter in JSDoc', () => {
      expect(serviceContent).toMatch(/@param db/);
    });

    it('should mention return type in JSDoc', () => {
      expect(serviceContent).toMatch(/@returns/);
    });
  });
});

describe('dataClearingService - Integration Tests', () => {
  let db: SQLite.SQLiteDatabase;

  const createTestSession = (
    overrides: Partial<Omit<SessionRecord, 'id' | 'created_at'>> = {}
  ): Omit<SessionRecord, 'id' | 'created_at'> => ({
    session_type: 'quick_boost',
    start_time: Date.now() - 300000,
    end_time: Date.now(),
    duration_seconds: 300,
    avg_theta_zscore: 1.5,
    max_theta_zscore: 2.3,
    entrainment_freq: 6.0,
    volume: 75,
    signal_quality_avg: 85.5,
    subjective_rating: 4,
    notes: 'Test session',
    ...overrides,
  });

  const createTestBaseline = (
    overrides: Partial<Omit<BaselineRecord, 'id' | 'created_at'>> = {}
  ): Omit<BaselineRecord, 'id' | 'created_at'> => ({
    theta_mean: 10.5,
    theta_std: 2.1,
    alpha_mean: 15.3,
    beta_mean: 8.2,
    peak_theta_freq: 6.5,
    optimal_freq: 6.0,
    calibration_timestamp: Date.now(),
    quality_score: 85.0,
    ...overrides,
  });

  const createTestCircadianPattern = (
    hourOfDay: number,
    overrides: Partial<Omit<CircadianPatternRecord, 'hour_of_day' | 'updated_at'>> = {}
  ): Omit<CircadianPatternRecord, 'updated_at'> => ({
    hour_of_day: hourOfDay,
    avg_theta_mean: 1.2,
    avg_theta_std: 0.3,
    session_count: 5,
    avg_subjective_rating: 4.0,
    ...overrides,
  });

  beforeEach(() => {
    const result = initializeDatabase();
    db = result.db;
    // Clear all data before each test
    clearAllData(db);
  });

  afterEach(() => {
    dropAllTables(db);
  });

  describe('clearAllSessions', () => {
    it('should return success with 0 count when no sessions exist', () => {
      const result = clearAllSessions(db);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should delete all sessions and return correct count', () => {
      // Insert test sessions
      insertSession(db, createTestSession());
      insertSession(db, createTestSession({ session_type: 'custom' }));
      insertSession(db, createTestSession({ session_type: 'calibration' }));

      expect(getSessionsCount(db)).toBe(3);

      const result = clearAllSessions(db);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
      expect(result.error).toBeUndefined();
      expect(getSessionsCount(db)).toBe(0);
    });

    it('should not affect baselines when clearing sessions', () => {
      insertSession(db, createTestSession());
      insertBaseline(db, createTestBaseline());

      clearAllSessions(db);

      expect(getSessionsCount(db)).toBe(0);
      expect(getBaselinesCount(db)).toBe(1);
    });
  });

  describe('clearAllBaselines', () => {
    it('should return success with 0 count when no baselines exist', () => {
      const result = clearAllBaselines(db);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should delete all baselines and return correct count', () => {
      // Insert test baselines
      insertBaseline(db, createTestBaseline());
      insertBaseline(db, createTestBaseline({ quality_score: 90 }));

      expect(getBaselinesCount(db)).toBe(2);

      const result = clearAllBaselines(db);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(2);
      expect(result.error).toBeUndefined();
      expect(getBaselinesCount(db)).toBe(0);
    });

    it('should not affect sessions when clearing baselines', () => {
      insertSession(db, createTestSession());
      insertBaseline(db, createTestBaseline());

      clearAllBaselines(db);

      expect(getBaselinesCount(db)).toBe(0);
      expect(getSessionsCount(db)).toBe(1);
    });
  });

  describe('clearAllCircadianPatterns', () => {
    it('should return success with 0 count when no patterns exist', () => {
      const result = clearAllCircadianPatterns(db);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should delete all circadian patterns and return correct count', () => {
      // Insert test patterns
      upsertCircadianPattern(db, createTestCircadianPattern(9));
      upsertCircadianPattern(db, createTestCircadianPattern(14));
      upsertCircadianPattern(db, createTestCircadianPattern(20));

      expect(getCircadianPatternsCount(db)).toBe(3);

      const result = clearAllCircadianPatterns(db);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(3);
      expect(result.error).toBeUndefined();
      expect(getCircadianPatternsCount(db)).toBe(0);
    });
  });

  describe('clearAllData', () => {
    it('should return success with 0 counts when database is empty', () => {
      const result = clearAllData(db);

      expect(result.success).toBe(true);
      expect(result.sessionsDeleted).toBe(0);
      expect(result.baselinesDeleted).toBe(0);
      expect(result.circadianPatternsDeleted).toBe(0);
      expect(result.totalDeleted).toBe(0);
      expect(result.error).toBeUndefined();
    });

    it('should delete all data types and return correct counts', () => {
      // Insert test data
      insertSession(db, createTestSession());
      insertSession(db, createTestSession({ session_type: 'custom' }));
      insertBaseline(db, createTestBaseline());
      upsertCircadianPattern(db, createTestCircadianPattern(10));
      upsertCircadianPattern(db, createTestCircadianPattern(15));

      expect(getSessionsCount(db)).toBe(2);
      expect(getBaselinesCount(db)).toBe(1);
      expect(getCircadianPatternsCount(db)).toBe(2);

      const result = clearAllData(db);

      expect(result.success).toBe(true);
      expect(result.sessionsDeleted).toBe(2);
      expect(result.baselinesDeleted).toBe(1);
      expect(result.circadianPatternsDeleted).toBe(2);
      expect(result.totalDeleted).toBe(5);
      expect(result.error).toBeUndefined();

      expect(getSessionsCount(db)).toBe(0);
      expect(getBaselinesCount(db)).toBe(0);
      expect(getCircadianPatternsCount(db)).toBe(0);
    });
  });

  describe('getDataSummary', () => {
    it('should return zero counts when database is empty', () => {
      const summary = getDataSummary(db);

      expect(summary.sessionsCount).toBe(0);
      expect(summary.baselinesCount).toBe(0);
      expect(summary.circadianPatternsCount).toBe(0);
      expect(summary.totalCount).toBe(0);
    });

    it('should return correct counts for each data type', () => {
      insertSession(db, createTestSession());
      insertSession(db, createTestSession());
      insertBaseline(db, createTestBaseline());
      upsertCircadianPattern(db, createTestCircadianPattern(12));

      const summary = getDataSummary(db);

      expect(summary.sessionsCount).toBe(2);
      expect(summary.baselinesCount).toBe(1);
      expect(summary.circadianPatternsCount).toBe(1);
      expect(summary.totalCount).toBe(4);
    });
  });

  describe('hasDataToClear', () => {
    it('should return false when database is empty', () => {
      expect(hasDataToClear(db)).toBe(false);
    });

    it('should return true when sessions exist', () => {
      insertSession(db, createTestSession());
      expect(hasDataToClear(db)).toBe(true);
    });

    it('should return true when baselines exist', () => {
      insertBaseline(db, createTestBaseline());
      expect(hasDataToClear(db)).toBe(true);
    });

    it('should return true when circadian patterns exist', () => {
      upsertCircadianPattern(db, createTestCircadianPattern(8));
      expect(hasDataToClear(db)).toBe(true);
    });
  });

  describe('formatClearingResultMessage', () => {
    it('should format success message with count', () => {
      const result: ClearingResult = { success: true, deletedCount: 5 };
      const message = formatClearingResultMessage(result, 'sessions');

      expect(message).toContain('Successfully deleted');
      expect(message).toContain('5');
      expect(message).toContain('sessions');
    });

    it('should format message for zero count', () => {
      const result: ClearingResult = { success: true, deletedCount: 0 };
      const message = formatClearingResultMessage(result, 'sessions');

      expect(message).toContain('No sessions to delete');
    });

    it('should format error message on failure', () => {
      const result: ClearingResult = {
        success: false,
        deletedCount: 0,
        error: 'Database error',
      };
      const message = formatClearingResultMessage(result, 'sessions');

      expect(message).toContain('Database error');
    });
  });

  describe('formatClearAllResultMessage', () => {
    it('should format success message with all counts', () => {
      const result: ClearAllDataResult = {
        success: true,
        sessionsDeleted: 10,
        baselinesDeleted: 2,
        circadianPatternsDeleted: 5,
        totalDeleted: 17,
      };
      const message = formatClearAllResultMessage(result);

      expect(message).toContain('Successfully deleted');
      expect(message).toContain('10 sessions');
      expect(message).toContain('2 baselines');
      expect(message).toContain('5 circadian patterns');
    });

    it('should format message for zero count', () => {
      const result: ClearAllDataResult = {
        success: true,
        sessionsDeleted: 0,
        baselinesDeleted: 0,
        circadianPatternsDeleted: 0,
        totalDeleted: 0,
      };
      const message = formatClearAllResultMessage(result);

      expect(message).toContain('No data to delete');
    });

    it('should format error message on failure', () => {
      const result: ClearAllDataResult = {
        success: false,
        sessionsDeleted: 0,
        baselinesDeleted: 0,
        circadianPatternsDeleted: 0,
        totalDeleted: 0,
        error: 'Failed to clear data',
      };
      const message = formatClearAllResultMessage(result);

      expect(message).toContain('Failed to clear data');
    });

    it('should only include non-zero counts in message', () => {
      const result: ClearAllDataResult = {
        success: true,
        sessionsDeleted: 5,
        baselinesDeleted: 0,
        circadianPatternsDeleted: 0,
        totalDeleted: 5,
      };
      const message = formatClearAllResultMessage(result);

      expect(message).toContain('5 sessions');
      expect(message).not.toContain('baselines');
      expect(message).not.toContain('circadian patterns');
    });
  });
});
