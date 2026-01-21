import * as SQLite from 'expo-sqlite';
import {
  openDatabase,
  createBaselinesTable,
  initializeDatabase,
  dropAllTables,
  insertBaseline,
  getLatestBaseline,
  getAllBaselines,
  getBaselineById,
  updateBaseline,
  deleteBaseline,
  deleteAllBaselines,
  getBaselinesCount,
  type BaselineRecord,
} from '../src/services/database';

describe('Database - Baselines Table', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    // Initialize database and create tables
    const result = initializeDatabase();
    db = result.db;
    // Clean up any existing data
    deleteAllBaselines(db);
  });

  afterEach(() => {
    // Clean up after each test
    dropAllTables(db);
  });

  describe('Database initialization', () => {
    it('should open database successfully', () => {
      const testDb = openDatabase();
      expect(testDb).toBeDefined();
    });

    it('should create baselines table', () => {
      const testDb = openDatabase();
      createBaselinesTable(testDb);

      // Verify table exists by querying it
      const result = testDb.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='baselines'"
      );
      expect(result?.count).toBe(1);
    });

    it('should initialize database with all tables', () => {
      const { db: testDb, migrationResult } = initializeDatabase();
      expect(testDb).toBeDefined();
      expect(migrationResult.success).toBe(true);

      // Verify baselines table exists
      const result = testDb.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='baselines'"
      );
      expect(result?.count).toBe(1);
    });
  });

  describe('Baselines table schema', () => {
    it('should have correct columns', () => {
      const columns = db.getAllSync<{ name: string }>(
        'PRAGMA table_info(baselines)'
      );
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('theta_mean');
      expect(columnNames).toContain('theta_std');
      expect(columnNames).toContain('alpha_mean');
      expect(columnNames).toContain('beta_mean');
      expect(columnNames).toContain('peak_theta_freq');
      expect(columnNames).toContain('optimal_freq');
      expect(columnNames).toContain('calibration_timestamp');
      expect(columnNames).toContain('quality_score');
      expect(columnNames).toContain('created_at');
    });

    it('should have id as primary key', () => {
      const columns = db.getAllSync<{ name: string; pk: number }>(
        'PRAGMA table_info(baselines)'
      );
      const idColumn = columns.find((col) => col.name === 'id');

      expect(idColumn?.pk).toBe(1);
    });
  });

  describe('Insert baseline', () => {
    it('should insert a baseline record successfully', () => {
      const baseline: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baseline);
      expect(id).toBeGreaterThan(0);
    });

    it('should auto-increment id for multiple inserts', () => {
      const baseline1: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const baseline2: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 11.2,
        theta_std: 2.5,
        alpha_mean: 9.1,
        beta_mean: 6.8,
        peak_theta_freq: 6.7,
        optimal_freq: 6.2,
        calibration_timestamp: Date.now(),
        quality_score: 90.0,
      };

      const id1 = insertBaseline(db, baseline1);
      const id2 = insertBaseline(db, baseline2);

      expect(id2).toBe(id1 + 1);
    });

    it('should allow null optimal_freq', () => {
      const baseline: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: null,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baseline);
      expect(id).toBeGreaterThan(0);

      const retrieved = getBaselineById(db, id);
      expect(retrieved?.optimal_freq).toBeNull();
    });
  });

  describe('Get latest baseline', () => {
    it('should return null when no baselines exist', () => {
      const latest = getLatestBaseline(db);
      expect(latest).toBeNull();
    });

    it('should return the most recent baseline', () => {
      const baseline1: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now() - 1000,
        quality_score: 85.5,
      };

      const baseline2: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 11.2,
        theta_std: 2.5,
        alpha_mean: 9.1,
        beta_mean: 6.8,
        peak_theta_freq: 6.7,
        optimal_freq: 6.2,
        calibration_timestamp: Date.now(),
        quality_score: 90.0,
      };

      insertBaseline(db, baseline1);
      const id2 = insertBaseline(db, baseline2);

      const latest = getLatestBaseline(db);
      expect(latest?.id).toBe(id2);
      expect(latest?.theta_mean).toBe(11.2);
    });
  });

  describe('Get all baselines', () => {
    it('should return empty array when no baselines exist', () => {
      const baselines = getAllBaselines(db);
      expect(baselines).toEqual([]);
    });

    it('should return all baselines ordered by timestamp (newest first)', () => {
      const baseline1: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now() - 2000,
        quality_score: 85.5,
      };

      const baseline2: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 11.2,
        theta_std: 2.5,
        alpha_mean: 9.1,
        beta_mean: 6.8,
        peak_theta_freq: 6.7,
        optimal_freq: 6.2,
        calibration_timestamp: Date.now(),
        quality_score: 90.0,
      };

      const baseline3: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.8,
        theta_std: 2.4,
        alpha_mean: 8.9,
        beta_mean: 6.5,
        peak_theta_freq: 6.6,
        optimal_freq: 6.1,
        calibration_timestamp: Date.now() - 1000,
        quality_score: 87.5,
      };

      insertBaseline(db, baseline1);
      const id2 = insertBaseline(db, baseline2);
      const id3 = insertBaseline(db, baseline3);

      const baselines = getAllBaselines(db);
      expect(baselines).toHaveLength(3);
      expect(baselines[0].id).toBe(id2);
      expect(baselines[1].id).toBe(id3);
    });
  });

  describe('Get baseline by ID', () => {
    it('should return null for non-existent ID', () => {
      const baseline = getBaselineById(db, 999);
      expect(baseline).toBeNull();
    });

    it('should retrieve baseline by ID', () => {
      const baselineData: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baselineData);
      const retrieved = getBaselineById(db, id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(id);
      expect(retrieved?.theta_mean).toBe(10.5);
      expect(retrieved?.theta_std).toBe(2.3);
    });
  });

  describe('Update baseline', () => {
    it('should update single field', () => {
      const baselineData: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baselineData);
      updateBaseline(db, id, { quality_score: 90.0 });

      const updated = getBaselineById(db, id);
      expect(updated?.quality_score).toBe(90.0);
      expect(updated?.theta_mean).toBe(10.5);
    });

    it('should update multiple fields', () => {
      const baselineData: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baselineData);
      updateBaseline(db, id, {
        theta_mean: 11.0,
        quality_score: 92.0,
        optimal_freq: 6.3,
      });

      const updated = getBaselineById(db, id);
      expect(updated?.theta_mean).toBe(11.0);
      expect(updated?.quality_score).toBe(92.0);
      expect(updated?.optimal_freq).toBe(6.3);
      expect(updated?.alpha_mean).toBe(8.7);
    });

    it('should handle empty update', () => {
      const baselineData: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baselineData);
      updateBaseline(db, id, {});

      const updated = getBaselineById(db, id);
      expect(updated?.theta_mean).toBe(10.5);
    });

    it('should update optimal_freq to null', () => {
      const baselineData: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baselineData);
      updateBaseline(db, id, { optimal_freq: null });

      const updated = getBaselineById(db, id);
      expect(updated?.optimal_freq).toBeNull();
    });
  });

  describe('Delete baseline', () => {
    it('should delete baseline by ID', () => {
      const baselineData: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baselineData);
      deleteBaseline(db, id);

      const retrieved = getBaselineById(db, id);
      expect(retrieved).toBeNull();
    });

    it('should not affect other baselines when deleting one', () => {
      const baseline1: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const baseline2: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 11.2,
        theta_std: 2.5,
        alpha_mean: 9.1,
        beta_mean: 6.8,
        peak_theta_freq: 6.7,
        optimal_freq: 6.2,
        calibration_timestamp: Date.now(),
        quality_score: 90.0,
      };

      const id1 = insertBaseline(db, baseline1);
      const id2 = insertBaseline(db, baseline2);

      deleteBaseline(db, id1);

      const retrieved1 = getBaselineById(db, id1);
      const retrieved2 = getBaselineById(db, id2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).not.toBeNull();
    });
  });

  describe('Delete all baselines', () => {
    it('should delete all baseline records', () => {
      const baseline1: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const baseline2: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 11.2,
        theta_std: 2.5,
        alpha_mean: 9.1,
        beta_mean: 6.8,
        peak_theta_freq: 6.7,
        optimal_freq: 6.2,
        calibration_timestamp: Date.now(),
        quality_score: 90.0,
      };

      insertBaseline(db, baseline1);
      insertBaseline(db, baseline2);

      deleteAllBaselines(db);

      const baselines = getAllBaselines(db);
      expect(baselines).toHaveLength(0);
    });
  });

  describe('Get baselines count', () => {
    it('should return 0 when no baselines exist', () => {
      const count = getBaselinesCount(db);
      expect(count).toBe(0);
    });

    it('should return correct count of baselines', () => {
      const baseline1: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const baseline2: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 11.2,
        theta_std: 2.5,
        alpha_mean: 9.1,
        beta_mean: 6.8,
        peak_theta_freq: 6.7,
        optimal_freq: 6.2,
        calibration_timestamp: Date.now(),
        quality_score: 90.0,
      };

      insertBaseline(db, baseline1);
      insertBaseline(db, baseline2);

      const count = getBaselinesCount(db);
      expect(count).toBe(2);
    });

    it('should update count after deletion', () => {
      const baseline: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baseline);
      expect(getBaselinesCount(db)).toBe(1);

      deleteBaseline(db, id);
      expect(getBaselinesCount(db)).toBe(0);
    });
  });

  describe('Data integrity', () => {
    it('should preserve decimal precision for EEG values', () => {
      const baseline: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.123456,
        theta_std: 2.345678,
        alpha_mean: 8.765432,
        beta_mean: 6.234567,
        peak_theta_freq: 6.54321,
        optimal_freq: 6.012345,
        calibration_timestamp: Date.now(),
        quality_score: 85.56789,
      };

      const id = insertBaseline(db, baseline);
      const retrieved = getBaselineById(db, id);

      expect(retrieved?.theta_mean).toBeCloseTo(10.123456, 5);
      expect(retrieved?.theta_std).toBeCloseTo(2.345678, 5);
      expect(retrieved?.alpha_mean).toBeCloseTo(8.765432, 5);
    });

    it('should store large timestamp values correctly', () => {
      const timestamp = 1705800000000; // Jan 2024 timestamp
      const baseline: Omit<BaselineRecord, 'id' | 'created_at'> = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: timestamp,
        quality_score: 85.5,
      };

      const id = insertBaseline(db, baseline);
      const retrieved = getBaselineById(db, id);

      expect(retrieved?.calibration_timestamp).toBe(timestamp);
    });
  });
});
