import * as SQLite from 'expo-sqlite';
import {
  initializeDatabase,
  dropAllTables,
  createCircadianPatternsTable,
  upsertCircadianPattern,
  getCircadianPatternByHour,
  getAllCircadianPatterns,
  getCircadianPatternsByHourRange,
  updateCircadianPattern,
  deleteCircadianPattern,
  deleteCircadianPatternByHour,
  deleteAllCircadianPatterns,
  getCircadianPatternsCount,
  getPeakThetaHour,
  getCircadianPatternsWithMinSessions,
  type CircadianPatternRecord,
} from '../src/services/database';

describe('Database - Circadian Patterns Table', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    // Initialize database and create tables
    db = initializeDatabase();
    // Clean up any existing data
    deleteAllCircadianPatterns(db);
  });

  afterEach(() => {
    // Clean up after each test
    dropAllTables(db);
  });

  describe('Table creation', () => {
    it('should create circadian_patterns table', () => {
      const testDb = initializeDatabase();

      // Verify table exists by querying sqlite_master
      const result = testDb.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='circadian_patterns'"
      );
      expect(result?.count).toBe(1);
    });

    it('should create table with createCircadianPatternsTable function', () => {
      const testDb = initializeDatabase();
      dropAllTables(testDb);

      // Recreate just the circadian_patterns table
      createCircadianPatternsTable(testDb);

      const result = testDb.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='circadian_patterns'"
      );
      expect(result?.count).toBe(1);
    });
  });

  describe('Table schema', () => {
    it('should have correct columns', () => {
      const columns = db.getAllSync<{ name: string }>(
        'PRAGMA table_info(circadian_patterns)'
      );
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('hour_of_day');
      expect(columnNames).toContain('avg_theta_mean');
      expect(columnNames).toContain('avg_theta_std');
      expect(columnNames).toContain('session_count');
      expect(columnNames).toContain('avg_subjective_rating');
      expect(columnNames).toContain('created_at');
      expect(columnNames).toContain('updated_at');
    });

    it('should have id as primary key', () => {
      const columns = db.getAllSync<{ name: string; pk: number }>(
        'PRAGMA table_info(circadian_patterns)'
      );
      const idColumn = columns.find((col) => col.name === 'id');

      expect(idColumn?.pk).toBe(1);
    });
  });

  describe('Upsert circadian pattern', () => {
    it('should insert a new pattern successfully', () => {
      const pattern: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 9,
        avg_theta_mean: 12.5,
        avg_theta_std: 2.1,
        session_count: 5,
        avg_subjective_rating: 4.2,
      };

      const id = upsertCircadianPattern(db, pattern);
      expect(id).toBeGreaterThan(0);

      const retrieved = getCircadianPatternByHour(db, 9);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.avg_theta_mean).toBe(12.5);
    });

    it('should update existing pattern for same hour', () => {
      const pattern1: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 9,
        avg_theta_mean: 12.5,
        avg_theta_std: 2.1,
        session_count: 5,
        avg_subjective_rating: 4.2,
      };

      const pattern2: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 9,
        avg_theta_mean: 13.0,
        avg_theta_std: 2.3,
        session_count: 10,
        avg_subjective_rating: 4.5,
      };

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);

      // Should still have only one record for hour 9
      const count = getCircadianPatternsCount(db);
      expect(count).toBe(1);

      const retrieved = getCircadianPatternByHour(db, 9);
      expect(retrieved?.avg_theta_mean).toBe(13.0);
      expect(retrieved?.session_count).toBe(10);
    });

    it('should allow null avg_subjective_rating', () => {
      const pattern: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 10,
        avg_theta_mean: 11.0,
        avg_theta_std: 1.8,
        session_count: 3,
        avg_subjective_rating: null,
      };

      const id = upsertCircadianPattern(db, pattern);
      expect(id).toBeGreaterThan(0);

      const retrieved = getCircadianPatternByHour(db, 10);
      expect(retrieved?.avg_subjective_rating).toBeNull();
    });

    it('should handle all 24 hours', () => {
      for (let hour = 0; hour < 24; hour++) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: hour,
          avg_theta_mean: 10 + hour * 0.5,
          avg_theta_std: 2.0,
          session_count: hour + 1,
          avg_subjective_rating: 3.0 + hour * 0.1,
        };
        upsertCircadianPattern(db, pattern);
      }

      const count = getCircadianPatternsCount(db);
      expect(count).toBe(24);

      const all = getAllCircadianPatterns(db);
      expect(all).toHaveLength(24);
      expect(all[0].hour_of_day).toBe(0);
      expect(all[23].hour_of_day).toBe(23);
    });
  });

  describe('Get circadian pattern by hour', () => {
    it('should return null for non-existent hour', () => {
      const pattern = getCircadianPatternByHour(db, 15);
      expect(pattern).toBeNull();
    });

    it('should retrieve pattern by hour', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 14,
        avg_theta_mean: 11.5,
        avg_theta_std: 2.2,
        session_count: 7,
        avg_subjective_rating: 3.8,
      };

      upsertCircadianPattern(db, patternData);
      const retrieved = getCircadianPatternByHour(db, 14);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.hour_of_day).toBe(14);
      expect(retrieved?.avg_theta_mean).toBe(11.5);
      expect(retrieved?.session_count).toBe(7);
    });
  });

  describe('Get all circadian patterns', () => {
    it('should return empty array when no patterns exist', () => {
      const patterns = getAllCircadianPatterns(db);
      expect(patterns).toEqual([]);
    });

    it('should return all patterns ordered by hour', () => {
      // Insert patterns in non-sequential order
      const hours = [14, 8, 22, 6, 10];
      for (const hour of hours) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: hour,
          avg_theta_mean: 10 + hour,
          avg_theta_std: 2.0,
          session_count: 5,
          avg_subjective_rating: 4.0,
        };
        upsertCircadianPattern(db, pattern);
      }

      const patterns = getAllCircadianPatterns(db);
      expect(patterns).toHaveLength(5);

      // Should be ordered by hour_of_day ascending
      expect(patterns[0].hour_of_day).toBe(6);
      expect(patterns[1].hour_of_day).toBe(8);
      expect(patterns[2].hour_of_day).toBe(10);
      expect(patterns[3].hour_of_day).toBe(14);
      expect(patterns[4].hour_of_day).toBe(22);
    });
  });

  describe('Get circadian patterns by hour range', () => {
    beforeEach(() => {
      // Set up patterns for hours 6-18
      for (let hour = 6; hour <= 18; hour++) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: hour,
          avg_theta_mean: 10 + hour,
          avg_theta_std: 2.0,
          session_count: 5,
          avg_subjective_rating: 4.0,
        };
        upsertCircadianPattern(db, pattern);
      }
    });

    it('should return patterns within range (morning hours)', () => {
      const morning = getCircadianPatternsByHourRange(db, 6, 11);
      expect(morning).toHaveLength(6);
      expect(morning[0].hour_of_day).toBe(6);
      expect(morning[5].hour_of_day).toBe(11);
    });

    it('should return patterns within range (afternoon hours)', () => {
      const afternoon = getCircadianPatternsByHourRange(db, 12, 17);
      expect(afternoon).toHaveLength(6);
      expect(afternoon[0].hour_of_day).toBe(12);
      expect(afternoon[5].hour_of_day).toBe(17);
    });

    it('should return empty array for range with no data', () => {
      const lateNight = getCircadianPatternsByHourRange(db, 0, 5);
      expect(lateNight).toHaveLength(0);
    });
  });

  describe('Update circadian pattern', () => {
    it('should update single field', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 9,
        avg_theta_mean: 12.0,
        avg_theta_std: 2.0,
        session_count: 5,
        avg_subjective_rating: 4.0,
      };

      upsertCircadianPattern(db, patternData);
      const original = getCircadianPatternByHour(db, 9);

      updateCircadianPattern(db, original!.id!, { avg_theta_mean: 14.0 });

      const updated = getCircadianPatternByHour(db, 9);
      expect(updated?.avg_theta_mean).toBe(14.0);
      expect(updated?.session_count).toBe(5); // Unchanged
    });

    it('should update multiple fields', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 10,
        avg_theta_mean: 11.0,
        avg_theta_std: 2.0,
        session_count: 3,
        avg_subjective_rating: 3.5,
      };

      upsertCircadianPattern(db, patternData);
      const original = getCircadianPatternByHour(db, 10);

      updateCircadianPattern(db, original!.id!, {
        avg_theta_mean: 12.5,
        session_count: 8,
        avg_subjective_rating: 4.2,
      });

      const updated = getCircadianPatternByHour(db, 10);
      expect(updated?.avg_theta_mean).toBe(12.5);
      expect(updated?.session_count).toBe(8);
      expect(updated?.avg_subjective_rating).toBe(4.2);
    });

    it('should handle empty update', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 11,
        avg_theta_mean: 10.0,
        avg_theta_std: 1.5,
        session_count: 2,
        avg_subjective_rating: 3.0,
      };

      upsertCircadianPattern(db, patternData);
      const original = getCircadianPatternByHour(db, 11);

      updateCircadianPattern(db, original!.id!, {});

      const updated = getCircadianPatternByHour(db, 11);
      expect(updated?.avg_theta_mean).toBe(10.0);
    });

    it('should update avg_subjective_rating to null', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 12,
        avg_theta_mean: 13.0,
        avg_theta_std: 2.5,
        session_count: 6,
        avg_subjective_rating: 4.5,
      };

      upsertCircadianPattern(db, patternData);
      const original = getCircadianPatternByHour(db, 12);

      updateCircadianPattern(db, original!.id!, {
        avg_subjective_rating: null,
      });

      const updated = getCircadianPatternByHour(db, 12);
      expect(updated?.avg_subjective_rating).toBeNull();
    });
  });

  describe('Delete circadian pattern', () => {
    it('should delete pattern by ID', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 15,
        avg_theta_mean: 11.0,
        avg_theta_std: 2.0,
        session_count: 4,
        avg_subjective_rating: 3.5,
      };

      upsertCircadianPattern(db, patternData);
      const original = getCircadianPatternByHour(db, 15);

      deleteCircadianPattern(db, original!.id!);

      const retrieved = getCircadianPatternByHour(db, 15);
      expect(retrieved).toBeNull();
    });

    it('should delete pattern by hour', () => {
      const patternData: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 16,
        avg_theta_mean: 10.5,
        avg_theta_std: 1.8,
        session_count: 3,
        avg_subjective_rating: 4.0,
      };

      upsertCircadianPattern(db, patternData);
      deleteCircadianPatternByHour(db, 16);

      const retrieved = getCircadianPatternByHour(db, 16);
      expect(retrieved).toBeNull();
    });

    it('should not affect other patterns when deleting one', () => {
      const pattern1: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 8,
        avg_theta_mean: 12.0,
        avg_theta_std: 2.0,
        session_count: 5,
        avg_subjective_rating: 4.0,
      };

      const pattern2: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 9,
        avg_theta_mean: 13.0,
        avg_theta_std: 2.2,
        session_count: 6,
        avg_subjective_rating: 4.2,
      };

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);

      deleteCircadianPatternByHour(db, 8);

      const retrieved1 = getCircadianPatternByHour(db, 8);
      const retrieved2 = getCircadianPatternByHour(db, 9);

      expect(retrieved1).toBeNull();
      expect(retrieved2).not.toBeNull();
    });
  });

  describe('Delete all circadian patterns', () => {
    it('should delete all pattern records', () => {
      for (let hour = 6; hour <= 12; hour++) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: hour,
          avg_theta_mean: 10 + hour,
          avg_theta_std: 2.0,
          session_count: 5,
          avg_subjective_rating: 4.0,
        };
        upsertCircadianPattern(db, pattern);
      }

      expect(getCircadianPatternsCount(db)).toBe(7);

      deleteAllCircadianPatterns(db);

      expect(getCircadianPatternsCount(db)).toBe(0);
      expect(getAllCircadianPatterns(db)).toHaveLength(0);
    });
  });

  describe('Get circadian patterns count', () => {
    it('should return 0 when no patterns exist', () => {
      const count = getCircadianPatternsCount(db);
      expect(count).toBe(0);
    });

    it('should return correct count', () => {
      const hours = [6, 9, 12, 15, 18];
      for (const hour of hours) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: hour,
          avg_theta_mean: 10 + hour,
          avg_theta_std: 2.0,
          session_count: 5,
          avg_subjective_rating: 4.0,
        };
        upsertCircadianPattern(db, pattern);
      }

      const count = getCircadianPatternsCount(db);
      expect(count).toBe(5);
    });

    it('should update count after deletion', () => {
      const pattern: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 10,
        avg_theta_mean: 12.0,
        avg_theta_std: 2.0,
        session_count: 5,
        avg_subjective_rating: 4.0,
      };

      upsertCircadianPattern(db, pattern);
      expect(getCircadianPatternsCount(db)).toBe(1);

      deleteCircadianPatternByHour(db, 10);
      expect(getCircadianPatternsCount(db)).toBe(0);
    });
  });

  describe('Get peak theta hour', () => {
    it('should return null when no patterns exist', () => {
      const peak = getPeakThetaHour(db);
      expect(peak).toBeNull();
    });

    it('should return hour with highest avg_theta_mean', () => {
      const patterns = [
        { hour: 8, theta: 10.0 },
        { hour: 10, theta: 14.5 }, // Highest
        { hour: 12, theta: 11.0 },
        { hour: 14, theta: 9.5 },
      ];

      for (const p of patterns) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: p.hour,
          avg_theta_mean: p.theta,
          avg_theta_std: 2.0,
          session_count: 5,
          avg_subjective_rating: 4.0,
        };
        upsertCircadianPattern(db, pattern);
      }

      const peak = getPeakThetaHour(db);
      expect(peak).not.toBeNull();
      expect(peak?.hour_of_day).toBe(10);
      expect(peak?.avg_theta_mean).toBe(14.5);
    });
  });

  describe('Get circadian patterns with minimum sessions', () => {
    beforeEach(() => {
      const patterns = [
        { hour: 8, sessions: 2 },
        { hour: 9, sessions: 5 },
        { hour: 10, sessions: 10 },
        { hour: 11, sessions: 3 },
        { hour: 12, sessions: 7 },
      ];

      for (const p of patterns) {
        const pattern: Omit<
          CircadianPatternRecord,
          'id' | 'created_at' | 'updated_at'
        > = {
          hour_of_day: p.hour,
          avg_theta_mean: 12.0,
          avg_theta_std: 2.0,
          session_count: p.sessions,
          avg_subjective_rating: 4.0,
        };
        upsertCircadianPattern(db, pattern);
      }
    });

    it('should return patterns with at least minimum sessions', () => {
      const reliable = getCircadianPatternsWithMinSessions(db, 5);
      expect(reliable).toHaveLength(3);

      const hours = reliable.map((p) => p.hour_of_day);
      expect(hours).toContain(9);
      expect(hours).toContain(10);
      expect(hours).toContain(12);
    });

    it('should return empty array when no patterns meet threshold', () => {
      const none = getCircadianPatternsWithMinSessions(db, 20);
      expect(none).toHaveLength(0);
    });

    it('should return all patterns when threshold is 0', () => {
      const all = getCircadianPatternsWithMinSessions(db, 0);
      expect(all).toHaveLength(5);
    });
  });

  describe('Data integrity', () => {
    it('should preserve decimal precision for theta values', () => {
      const pattern: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 9,
        avg_theta_mean: 12.123456,
        avg_theta_std: 2.345678,
        session_count: 10,
        avg_subjective_rating: 4.56789,
      };

      upsertCircadianPattern(db, pattern);
      const retrieved = getCircadianPatternByHour(db, 9);

      expect(retrieved?.avg_theta_mean).toBeCloseTo(12.123456, 5);
      expect(retrieved?.avg_theta_std).toBeCloseTo(2.345678, 5);
      expect(retrieved?.avg_subjective_rating).toBeCloseTo(4.56789, 5);
    });

    it('should enforce hour_of_day uniqueness', () => {
      const pattern1: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 10,
        avg_theta_mean: 12.0,
        avg_theta_std: 2.0,
        session_count: 5,
        avg_subjective_rating: 4.0,
      };

      const pattern2: Omit<
        CircadianPatternRecord,
        'id' | 'created_at' | 'updated_at'
      > = {
        hour_of_day: 10,
        avg_theta_mean: 14.0,
        avg_theta_std: 2.5,
        session_count: 8,
        avg_subjective_rating: 4.5,
      };

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);

      // Should only have one record
      const count = getCircadianPatternsCount(db);
      expect(count).toBe(1);

      // Values should be from the second upsert
      const retrieved = getCircadianPatternByHour(db, 10);
      expect(retrieved?.avg_theta_mean).toBe(14.0);
    });
  });
});
