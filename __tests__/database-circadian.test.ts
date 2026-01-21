import * as SQLite from 'expo-sqlite';
import {
  initializeDatabase,
  dropAllTables,
  upsertCircadianPattern,
  getCircadianPatternByHour,
  getCircadianPatternById,
  getAllCircadianPatterns,
  updateCircadianPattern,
  deleteCircadianPattern,
  deleteCircadianPatternByHour,
  deleteAllCircadianPatterns,
  getCircadianPatternsCount,
  getBestCircadianHour,
  recalculateCircadianPatterns,
  insertSession,
  deleteAllSessions,
  type CircadianPatternRecord,
} from '../src/services/database';

describe('Database - Circadian Patterns Table', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    db = initializeDatabase();
    deleteAllCircadianPatterns(db);
    deleteAllSessions(db);
  });

  afterEach(() => {
    dropAllTables(db);
  });

  const createTestPattern = (
    overrides: Partial<
      Omit<CircadianPatternRecord, 'id' | 'created_at' | 'updated_at'>
    > = {}
  ): Omit<CircadianPatternRecord, 'id' | 'created_at' | 'updated_at'> => ({
    hour_of_day: 10,
    avg_theta_mean: 1.5,
    avg_theta_std: 0.3,
    session_count: 5,
    avg_subjective_rating: 4.2,
    ...overrides,
  });

  describe('Circadian patterns table schema', () => {
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
    it('should insert a new pattern when none exists for the hour', () => {
      const pattern = createTestPattern({ hour_of_day: 9 });
      const id = upsertCircadianPattern(db, pattern);

      expect(id).toBeGreaterThan(0);

      const retrieved = getCircadianPatternByHour(db, 9);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.avg_theta_mean).toBe(1.5);
    });

    it('should update existing pattern when one exists for the hour', () => {
      const pattern1 = createTestPattern({
        hour_of_day: 10,
        avg_theta_mean: 1.0,
      });
      const id1 = upsertCircadianPattern(db, pattern1);

      const pattern2 = createTestPattern({
        hour_of_day: 10,
        avg_theta_mean: 2.0,
      });
      const id2 = upsertCircadianPattern(db, pattern2);

      expect(id2).toBe(id1);

      const retrieved = getCircadianPatternByHour(db, 10);
      expect(retrieved?.avg_theta_mean).toBe(2.0);
    });

    it('should accept valid hours (0-23)', () => {
      [0, 12, 23].forEach((hour) => {
        const pattern = createTestPattern({ hour_of_day: hour });
        const id = upsertCircadianPattern(db, pattern);
        expect(id).toBeGreaterThan(0);

        const retrieved = getCircadianPatternByHour(db, hour);
        expect(retrieved?.hour_of_day).toBe(hour);
      });
    });

    it('should allow null avg_subjective_rating', () => {
      const pattern = createTestPattern({ avg_subjective_rating: null });
      const id = upsertCircadianPattern(db, pattern);

      const retrieved = getCircadianPatternById(db, id);
      expect(retrieved?.avg_subjective_rating).toBeNull();
    });
  });

  describe('Get circadian pattern by hour', () => {
    it('should return null for non-existent hour', () => {
      const pattern = getCircadianPatternByHour(db, 15);
      expect(pattern).toBeNull();
    });

    it('should retrieve pattern by hour', () => {
      const patternData = createTestPattern({ hour_of_day: 14 });
      upsertCircadianPattern(db, patternData);

      const retrieved = getCircadianPatternByHour(db, 14);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.hour_of_day).toBe(14);
      expect(retrieved?.avg_theta_mean).toBe(1.5);
    });
  });

  describe('Get circadian pattern by ID', () => {
    it('should return null for non-existent ID', () => {
      const pattern = getCircadianPatternById(db, 999);
      expect(pattern).toBeNull();
    });

    it('should retrieve pattern by ID', () => {
      const patternData = createTestPattern();
      const id = upsertCircadianPattern(db, patternData);

      const retrieved = getCircadianPatternById(db, id);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(id);
    });
  });

  describe('Get all circadian patterns', () => {
    it('should return empty array when no patterns exist', () => {
      const patterns = getAllCircadianPatterns(db);
      expect(patterns).toEqual([]);
    });

    it('should return all patterns ordered by hour (ascending)', () => {
      const pattern1 = createTestPattern({ hour_of_day: 14 });
      const pattern2 = createTestPattern({ hour_of_day: 8 });
      const pattern3 = createTestPattern({ hour_of_day: 20 });

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);
      upsertCircadianPattern(db, pattern3);

      const patterns = getAllCircadianPatterns(db);
      expect(patterns).toHaveLength(3);
      expect(patterns[0].hour_of_day).toBe(8);
      expect(patterns[1].hour_of_day).toBe(14);
      expect(patterns[2].hour_of_day).toBe(20);
    });
  });

  describe('Update circadian pattern', () => {
    it('should update single field', () => {
      const pattern = createTestPattern();
      const id = upsertCircadianPattern(db, pattern);

      updateCircadianPattern(db, id, { session_count: 10 });

      const updated = getCircadianPatternById(db, id);
      expect(updated?.session_count).toBe(10);
      expect(updated?.avg_theta_mean).toBe(1.5);
    });

    it('should update multiple fields', () => {
      const pattern = createTestPattern();
      const id = upsertCircadianPattern(db, pattern);

      updateCircadianPattern(db, id, {
        avg_theta_mean: 2.0,
        avg_theta_std: 0.5,
        session_count: 15,
      });

      const updated = getCircadianPatternById(db, id);
      expect(updated?.avg_theta_mean).toBe(2.0);
      expect(updated?.avg_theta_std).toBe(0.5);
      expect(updated?.session_count).toBe(15);
    });

    it('should handle empty update', () => {
      const pattern = createTestPattern();
      const id = upsertCircadianPattern(db, pattern);

      updateCircadianPattern(db, id, {});

      const updated = getCircadianPatternById(db, id);
      expect(updated?.avg_theta_mean).toBe(1.5);
    });
  });

  describe('Delete circadian pattern', () => {
    it('should delete pattern by ID', () => {
      const pattern = createTestPattern();
      const id = upsertCircadianPattern(db, pattern);

      deleteCircadianPattern(db, id);

      const retrieved = getCircadianPatternById(db, id);
      expect(retrieved).toBeNull();
    });

    it('should delete pattern by hour', () => {
      const pattern = createTestPattern({ hour_of_day: 11 });
      upsertCircadianPattern(db, pattern);

      deleteCircadianPatternByHour(db, 11);

      const retrieved = getCircadianPatternByHour(db, 11);
      expect(retrieved).toBeNull();
    });

    it('should not affect other patterns when deleting one', () => {
      const pattern1 = createTestPattern({ hour_of_day: 9 });
      const pattern2 = createTestPattern({ hour_of_day: 15 });

      const id1 = upsertCircadianPattern(db, pattern1);
      const id2 = upsertCircadianPattern(db, pattern2);

      deleteCircadianPattern(db, id1);

      const retrieved1 = getCircadianPatternById(db, id1);
      const retrieved2 = getCircadianPatternById(db, id2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).not.toBeNull();
    });
  });

  describe('Delete all circadian patterns', () => {
    it('should delete all pattern records', () => {
      const pattern1 = createTestPattern({ hour_of_day: 8 });
      const pattern2 = createTestPattern({ hour_of_day: 14 });

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);

      deleteAllCircadianPatterns(db);

      const patterns = getAllCircadianPatterns(db);
      expect(patterns).toHaveLength(0);
    });
  });

  describe('Get circadian patterns count', () => {
    it('should return 0 when no patterns exist', () => {
      const count = getCircadianPatternsCount(db);
      expect(count).toBe(0);
    });

    it('should return correct count of patterns', () => {
      const pattern1 = createTestPattern({ hour_of_day: 9 });
      const pattern2 = createTestPattern({ hour_of_day: 15 });

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);

      const count = getCircadianPatternsCount(db);
      expect(count).toBe(2);
    });

    it('should update count after deletion', () => {
      const pattern = createTestPattern({ hour_of_day: 10 });
      const id = upsertCircadianPattern(db, pattern);

      expect(getCircadianPatternsCount(db)).toBe(1);

      deleteCircadianPattern(db, id);
      expect(getCircadianPatternsCount(db)).toBe(0);
    });
  });

  describe('Get best circadian hour', () => {
    it('should return null when no patterns exist', () => {
      const best = getBestCircadianHour(db);
      expect(best).toBeNull();
    });

    it('should return null when no patterns have enough sessions', () => {
      const pattern = createTestPattern({ session_count: 2 });
      upsertCircadianPattern(db, pattern);

      const best = getBestCircadianHour(db);
      expect(best).toBeNull();
    });

    it('should return hour with highest avg theta mean (min 3 sessions)', () => {
      const pattern1 = createTestPattern({
        hour_of_day: 9,
        avg_theta_mean: 1.5,
        session_count: 5,
      });
      const pattern2 = createTestPattern({
        hour_of_day: 14,
        avg_theta_mean: 2.0,
        session_count: 3,
      });
      const pattern3 = createTestPattern({
        hour_of_day: 20,
        avg_theta_mean: 2.5,
        session_count: 2,
      });

      upsertCircadianPattern(db, pattern1);
      upsertCircadianPattern(db, pattern2);
      upsertCircadianPattern(db, pattern3);

      const best = getBestCircadianHour(db);
      expect(best?.hour_of_day).toBe(14);
      expect(best?.avg_theta_mean).toBe(2.0);
    });
  });

  describe('Recalculate circadian patterns', () => {
    it('should clear and regenerate patterns from sessions', () => {
      // Add some existing patterns
      upsertCircadianPattern(db, createTestPattern({ hour_of_day: 5 }));

      // Add sessions at specific hours
      const now = new Date();
      now.setHours(10, 30, 0, 0);
      const hour10Time = now.getTime();

      now.setHours(10, 45, 0, 0);
      const hour10Time2 = now.getTime();

      now.setHours(14, 0, 0, 0);
      const hour14Time = now.getTime();

      insertSession(db, {
        session_type: 'quick_boost',
        start_time: hour10Time,
        end_time: hour10Time + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.0,
        max_theta_zscore: 1.5,
        entrainment_freq: 6.0,
        volume: 75,
        signal_quality_avg: 85,
        subjective_rating: 4,
        notes: null,
      });

      insertSession(db, {
        session_type: 'quick_boost',
        start_time: hour10Time2,
        end_time: hour10Time2 + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 2.0,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 75,
        signal_quality_avg: 85,
        subjective_rating: 5,
        notes: null,
      });

      insertSession(db, {
        session_type: 'custom',
        start_time: hour14Time,
        end_time: hour14Time + 600000,
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.0,
        entrainment_freq: 6.5,
        volume: 80,
        signal_quality_avg: 90,
        subjective_rating: null,
        notes: 'Test',
      });

      recalculateCircadianPatterns(db);

      const patterns = getAllCircadianPatterns(db);

      // Should only have patterns for hours with sessions (10 and 14)
      expect(patterns.length).toBe(2);

      // Check hour 10 pattern (average of 1.0 and 2.0 = 1.5)
      const hour10Pattern = getCircadianPatternByHour(db, 10);
      expect(hour10Pattern).not.toBeNull();
      expect(hour10Pattern?.session_count).toBe(2);
      expect(hour10Pattern?.avg_theta_mean).toBeCloseTo(1.5, 5);
      expect(hour10Pattern?.avg_subjective_rating).toBeCloseTo(4.5, 5);

      // Check hour 14 pattern
      const hour14Pattern = getCircadianPatternByHour(db, 14);
      expect(hour14Pattern).not.toBeNull();
      expect(hour14Pattern?.session_count).toBe(1);
      expect(hour14Pattern?.avg_theta_mean).toBeCloseTo(1.5, 5);
      expect(hour14Pattern?.avg_subjective_rating).toBeNull();

      // Old pattern at hour 5 should be gone
      const hour5Pattern = getCircadianPatternByHour(db, 5);
      expect(hour5Pattern).toBeNull();
    });

    it('should handle empty sessions', () => {
      upsertCircadianPattern(db, createTestPattern({ hour_of_day: 10 }));

      recalculateCircadianPatterns(db);

      const count = getCircadianPatternsCount(db);
      expect(count).toBe(0);
    });
  });

  describe('Data integrity', () => {
    it('should preserve decimal precision', () => {
      const pattern = createTestPattern({
        avg_theta_mean: 1.234567,
        avg_theta_std: 0.345678,
        avg_subjective_rating: 3.567,
      });

      const id = upsertCircadianPattern(db, pattern);
      const retrieved = getCircadianPatternById(db, id);

      expect(retrieved?.avg_theta_mean).toBeCloseTo(1.234567, 5);
      expect(retrieved?.avg_theta_std).toBeCloseTo(0.345678, 5);
      expect(retrieved?.avg_subjective_rating).toBeCloseTo(3.567, 3);
    });
  });
});
