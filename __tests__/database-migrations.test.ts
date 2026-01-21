import * as SQLite from 'expo-sqlite';
import {
  openDatabase,
  initializeDatabase,
  dropAllTables,
  getSchemaVersion,
  getAppliedMigrationsList,
  getPendingMigrationsList,
  rollbackMigration,
} from '../src/services/database';
import {
  allMigrations,
  runMigrations,
  createMigrationsTable,
  getAppliedMigrations,
  getCurrentVersion,
  isMigrationApplied,
  getPendingMigrations,
  rollbackLastMigration,
  dropMigrationsTable,
  Migration,
} from '../src/services/migrations';

describe('Database Migrations', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    db = openDatabase();
    dropAllTables(db);
  });

  afterEach(() => {
    dropAllTables(db);
  });

  describe('Migration table management', () => {
    it('should create migrations table', () => {
      createMigrationsTable(db);

      const result = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='schema_migrations'"
      );
      expect(result?.count).toBe(1);
    });

    it('should create migrations table with correct schema', () => {
      createMigrationsTable(db);

      const columns = db.getAllSync<{ name: string }>(
        'PRAGMA table_info(schema_migrations)'
      );
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain('version');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('applied_at');
    });

    it('should return 0 when no migrations have been applied', () => {
      createMigrationsTable(db);
      const version = getCurrentVersion(db);
      expect(version).toBe(0);
    });

    it('should return empty array when no migrations exist', () => {
      createMigrationsTable(db);
      const migrations = getAppliedMigrations(db);
      expect(migrations).toEqual([]);
    });
  });

  describe('Running migrations', () => {
    it('should run all migrations successfully', () => {
      const result = runMigrations(db, allMigrations);

      expect(result.success).toBe(true);
      expect(result.applied.length).toBe(allMigrations.length);
      expect(result.currentVersion).toBe(allMigrations.length);
    });

    it('should create baselines table after migration', () => {
      runMigrations(db, allMigrations);

      const result = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='baselines'"
      );
      expect(result?.count).toBe(1);
    });

    it('should create sessions table after migration', () => {
      runMigrations(db, allMigrations);

      const result = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='sessions'"
      );
      expect(result?.count).toBe(1);
    });

    it('should create circadian_patterns table after migration', () => {
      runMigrations(db, allMigrations);

      const result = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='circadian_patterns'"
      );
      expect(result?.count).toBe(1);
    });

    it('should not re-run already applied migrations', () => {
      const firstResult = runMigrations(db, allMigrations);
      const secondResult = runMigrations(db, allMigrations);

      expect(firstResult.applied.length).toBe(allMigrations.length);
      expect(secondResult.applied.length).toBe(0);
      expect(secondResult.currentVersion).toBe(firstResult.currentVersion);
    });

    it('should run migrations in order by version', () => {
      const result = runMigrations(db, allMigrations);

      const appliedVersions = result.applied.map((m) => m.version);
      const sortedVersions = [...appliedVersions].sort((a, b) => a - b);

      expect(appliedVersions).toEqual(sortedVersions);
    });

    it('should record migration metadata', () => {
      runMigrations(db, allMigrations);

      const migrations = getAppliedMigrations(db);
      expect(migrations.length).toBe(allMigrations.length);

      const firstMigration = migrations[0];
      expect(firstMigration.version).toBe(1);
      expect(firstMigration.name).toBe('create_baselines_table');
      expect(firstMigration.applied_at).toBeGreaterThan(0);
    });
  });

  describe('Migration version tracking', () => {
    it('should track current schema version', () => {
      runMigrations(db, allMigrations);
      const version = getCurrentVersion(db);
      expect(version).toBe(allMigrations.length);
    });

    it('should check if specific migration is applied', () => {
      runMigrations(db, allMigrations);

      expect(isMigrationApplied(db, 1)).toBe(true);
      expect(isMigrationApplied(db, 2)).toBe(true);
      expect(isMigrationApplied(db, 3)).toBe(true);
      expect(isMigrationApplied(db, 999)).toBe(false);
    });

    it('should list pending migrations', () => {
      createMigrationsTable(db);
      const pending = getPendingMigrations(db, allMigrations);
      expect(pending.length).toBe(allMigrations.length);

      runMigrations(db, allMigrations);
      const pendingAfter = getPendingMigrations(db, allMigrations);
      expect(pendingAfter.length).toBe(0);
    });
  });

  describe('Incremental migrations', () => {
    it('should apply only new migrations', () => {
      // Apply first migration only
      const firstMigration = allMigrations.filter((m) => m.version === 1);
      runMigrations(db, firstMigration);

      expect(getCurrentVersion(db)).toBe(1);
      expect(isMigrationApplied(db, 1)).toBe(true);
      expect(isMigrationApplied(db, 2)).toBe(false);

      // Apply all migrations
      const result = runMigrations(db, allMigrations);

      // Should only apply migrations 2 and 3
      expect(result.applied.length).toBe(2);
      expect(result.applied[0].version).toBe(2);
      expect(result.applied[1].version).toBe(3);
      expect(getCurrentVersion(db)).toBe(3);
    });
  });

  describe('Migration rollback', () => {
    it('should rollback last migration', () => {
      runMigrations(db, allMigrations);
      expect(getCurrentVersion(db)).toBe(3);

      const result = rollbackLastMigration(db, allMigrations);

      expect(result.success).toBe(true);
      expect(result.currentVersion).toBe(2);
    });

    it('should remove rolled back table', () => {
      runMigrations(db, allMigrations);

      // Verify table exists
      let result = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='circadian_patterns'"
      );
      expect(result?.count).toBe(1);

      rollbackLastMigration(db, allMigrations);

      // Verify table is dropped
      result = db.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='circadian_patterns'"
      );
      expect(result?.count).toBe(0);
    });

    it('should handle rollback when no migrations applied', () => {
      createMigrationsTable(db);
      const result = rollbackLastMigration(db, allMigrations);

      expect(result.success).toBe(true);
      expect(result.currentVersion).toBe(0);
    });

    it('should rollback multiple migrations sequentially', () => {
      runMigrations(db, allMigrations);

      rollbackLastMigration(db, allMigrations);
      expect(getCurrentVersion(db)).toBe(2);

      rollbackLastMigration(db, allMigrations);
      expect(getCurrentVersion(db)).toBe(1);

      rollbackLastMigration(db, allMigrations);
      expect(getCurrentVersion(db)).toBe(0);
    });
  });

  describe('Database wrapper functions', () => {
    it('should get schema version through wrapper', () => {
      const { db: initializedDb } = initializeDatabase();
      const version = getSchemaVersion(initializedDb);
      expect(version).toBe(allMigrations.length);
    });

    it('should get applied migrations through wrapper', () => {
      const { db: initializedDb } = initializeDatabase();
      const migrations = getAppliedMigrationsList(initializedDb);
      expect(migrations.length).toBe(allMigrations.length);
    });

    it('should get pending migrations through wrapper', () => {
      const { db: initializedDb } = initializeDatabase();
      const pending = getPendingMigrationsList(initializedDb);
      expect(pending.length).toBe(0);
    });

    it('should rollback through wrapper', () => {
      const { db: initializedDb } = initializeDatabase();
      const result = rollbackMigration(initializedDb);
      expect(result.success).toBe(true);
      expect(result.currentVersion).toBe(allMigrations.length - 1);
    });
  });

  describe('Sessions table schema', () => {
    beforeEach(() => {
      runMigrations(db, allMigrations);
    });

    it('should have correct columns', () => {
      const columns = db.getAllSync<{ name: string }>(
        'PRAGMA table_info(sessions)'
      );
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('session_type');
      expect(columnNames).toContain('start_time');
      expect(columnNames).toContain('end_time');
      expect(columnNames).toContain('duration_seconds');
      expect(columnNames).toContain('avg_theta_zscore');
      expect(columnNames).toContain('max_theta_zscore');
      expect(columnNames).toContain('entrainment_freq');
      expect(columnNames).toContain('volume');
      expect(columnNames).toContain('signal_quality_avg');
      expect(columnNames).toContain('subjective_rating');
      expect(columnNames).toContain('notes');
      expect(columnNames).toContain('created_at');
    });

    it('should have index on start_time', () => {
      const indexes = db.getAllSync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='sessions'"
      );
      const indexNames = indexes.map((idx) => idx.name);
      expect(indexNames).toContain('idx_sessions_start_time');
    });

    it('should enforce session_type check constraint', () => {
      expect(() => {
        db.runSync(
          `INSERT INTO sessions (session_type, start_time, end_time, duration_seconds,
           avg_theta_zscore, max_theta_zscore, entrainment_freq, volume, signal_quality_avg)
           VALUES ('invalid_type', 0, 100, 100, 1.5, 2.0, 6.0, 80, 85)`
        );
      }).toThrow();
    });

    it('should accept valid session types', () => {
      const validTypes = [
        'calibration',
        'quick_boost',
        'custom',
        'scheduled',
        'sham',
      ];

      validTypes.forEach((type, index) => {
        db.runSync(
          `INSERT INTO sessions (session_type, start_time, end_time, duration_seconds,
           avg_theta_zscore, max_theta_zscore, entrainment_freq, volume, signal_quality_avg)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [type, index * 1000, (index + 1) * 1000, 1000, 1.5, 2.0, 6.0, 80, 85]
        );
      });

      const count = db.getFirstSync<{ count: number }>(
        'SELECT COUNT(*) as count FROM sessions'
      );
      expect(count?.count).toBe(validTypes.length);
    });
  });

  describe('Circadian patterns table schema', () => {
    beforeEach(() => {
      runMigrations(db, allMigrations);
    });

    it('should have correct columns', () => {
      const columns = db.getAllSync<{ name: string }>(
        'PRAGMA table_info(circadian_patterns)'
      );
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain('hour_of_day');
      expect(columnNames).toContain('avg_theta_mean');
      expect(columnNames).toContain('avg_theta_std');
      expect(columnNames).toContain('session_count');
      expect(columnNames).toContain('avg_subjective_rating');
      expect(columnNames).toContain('updated_at');
    });

    it('should use hour_of_day as primary key', () => {
      const columns = db.getAllSync<{ name: string; pk: number }>(
        'PRAGMA table_info(circadian_patterns)'
      );
      const hourColumn = columns.find((col) => col.name === 'hour_of_day');
      expect(hourColumn?.pk).toBe(1);
    });

    it('should enforce hour_of_day range constraint', () => {
      // Valid values
      db.runSync(
        'INSERT INTO circadian_patterns (hour_of_day, avg_theta_mean, avg_theta_std, session_count) VALUES (0, 10.5, 2.3, 5)'
      );
      db.runSync(
        'INSERT INTO circadian_patterns (hour_of_day, avg_theta_mean, avg_theta_std, session_count) VALUES (23, 10.5, 2.3, 5)'
      );

      // Invalid values
      expect(() => {
        db.runSync(
          'INSERT INTO circadian_patterns (hour_of_day, avg_theta_mean, avg_theta_std, session_count) VALUES (-1, 10.5, 2.3, 5)'
        );
      }).toThrow();

      expect(() => {
        db.runSync(
          'INSERT INTO circadian_patterns (hour_of_day, avg_theta_mean, avg_theta_std, session_count) VALUES (24, 10.5, 2.3, 5)'
        );
      }).toThrow();
    });
  });

  describe('Custom migration handling', () => {
    it('should handle migration without down function', () => {
      const migrationWithoutDown: Migration = {
        version: 100,
        name: 'test_migration_no_down',
        up: (db) => {
          db.execSync('CREATE TABLE test_no_down (id INTEGER PRIMARY KEY)');
        },
        // No down function
      };

      runMigrations(db, [migrationWithoutDown]);
      const result = rollbackLastMigration(db, [migrationWithoutDown]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('does not support rollback');
    });

    it('should handle migration errors gracefully', () => {
      const badMigration: Migration = {
        version: 100,
        name: 'bad_migration',
        up: () => {
          throw new Error('Migration failed intentionally');
        },
      };

      const result = runMigrations(db, [badMigration]);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Migration failed intentionally');
    });
  });

  describe('initializeDatabase integration', () => {
    it('should return migration result', () => {
      const { db: initializedDb, migrationResult } = initializeDatabase();

      expect(initializedDb).toBeDefined();
      expect(migrationResult.success).toBe(true);
      expect(migrationResult.currentVersion).toBe(allMigrations.length);
    });

    it('should create all tables on first initialization', () => {
      const { db: initializedDb } = initializeDatabase();

      const tables = initializedDb.getAllSync<{ name: string }>(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'"
      );
      const tableNames = tables.map((t) => t.name);

      expect(tableNames).toContain('schema_migrations');
      expect(tableNames).toContain('baselines');
      expect(tableNames).toContain('sessions');
      expect(tableNames).toContain('circadian_patterns');
    });

    it('should be idempotent', () => {
      const first = initializeDatabase();
      const second = initializeDatabase();

      expect(first.migrationResult.applied.length).toBe(allMigrations.length);
      expect(second.migrationResult.applied.length).toBe(0);
      expect(second.migrationResult.currentVersion).toBe(
        first.migrationResult.currentVersion
      );
    });
  });
});
