import * as SQLite from 'expo-sqlite';
import { Migration, MigrationRecord, MigrationResult } from './types';

const MIGRATIONS_TABLE = 'schema_migrations';

/**
 * Creates the migrations tracking table if it doesn't exist
 */
export const createMigrationsTable = (db: SQLite.SQLiteDatabase): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      version INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      applied_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);
};

/**
 * Gets all applied migrations from the database
 */
export const getAppliedMigrations = (
  db: SQLite.SQLiteDatabase
): MigrationRecord[] => {
  return db.getAllSync<MigrationRecord>(
    `SELECT version, name, applied_at FROM ${MIGRATIONS_TABLE} ORDER BY version ASC`
  );
};

/**
 * Gets the current schema version (highest applied migration version)
 */
export const getCurrentVersion = (db: SQLite.SQLiteDatabase): number => {
  const result = db.getFirstSync<{ max_version: number | null }>(
    `SELECT MAX(version) as max_version FROM ${MIGRATIONS_TABLE}`
  );
  return result?.max_version ?? 0;
};

/**
 * Checks if a specific migration has been applied
 */
export const isMigrationApplied = (
  db: SQLite.SQLiteDatabase,
  version: number
): boolean => {
  const result = db.getFirstSync<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${MIGRATIONS_TABLE} WHERE version = ?`,
    [version]
  );
  return (result?.count ?? 0) > 0;
};

/**
 * Records a migration as applied
 */
const recordMigration = (
  db: SQLite.SQLiteDatabase,
  migration: Migration
): void => {
  db.runSync(`INSERT INTO ${MIGRATIONS_TABLE} (version, name) VALUES (?, ?)`, [
    migration.version,
    migration.name,
  ]);
};

/**
 * Removes a migration record (used during rollback)
 */
const removeMigrationRecord = (
  db: SQLite.SQLiteDatabase,
  version: number
): void => {
  db.runSync(`DELETE FROM ${MIGRATIONS_TABLE} WHERE version = ?`, [version]);
};

/**
 * Runs all pending migrations in order
 * @param db - SQLite database instance
 * @param migrations - Array of migrations to potentially run
 * @returns Result of the migration run
 */
export const runMigrations = (
  db: SQLite.SQLiteDatabase,
  migrations: Migration[]
): MigrationResult => {
  const applied: MigrationRecord[] = [];

  try {
    createMigrationsTable(db);

    // Sort migrations by version
    const sortedMigrations = [...migrations].sort(
      (a, b) => a.version - b.version
    );

    for (const migration of sortedMigrations) {
      if (!isMigrationApplied(db, migration.version)) {
        // Run the migration
        migration.up(db);

        // Record it as applied
        recordMigration(db, migration);

        applied.push({
          version: migration.version,
          name: migration.name,
          applied_at: Math.floor(Date.now() / 1000),
        });
      }
    }

    return {
      success: true,
      applied,
      currentVersion: getCurrentVersion(db),
    };
  } catch (error) {
    return {
      success: false,
      applied,
      error: error instanceof Error ? error.message : String(error),
      currentVersion: getCurrentVersion(db),
    };
  }
};

/**
 * Rolls back the last applied migration
 * @param db - SQLite database instance
 * @param migrations - Array of all migrations
 * @returns Result of the rollback
 */
export const rollbackLastMigration = (
  db: SQLite.SQLiteDatabase,
  migrations: Migration[]
): MigrationResult => {
  try {
    createMigrationsTable(db);

    const currentVersion = getCurrentVersion(db);
    if (currentVersion === 0) {
      return {
        success: true,
        applied: [],
        currentVersion: 0,
      };
    }

    const migrationToRollback = migrations.find(
      (m) => m.version === currentVersion
    );
    if (!migrationToRollback) {
      return {
        success: false,
        applied: [],
        error: `Migration version ${currentVersion} not found in provided migrations`,
        currentVersion,
      };
    }

    if (!migrationToRollback.down) {
      return {
        success: false,
        applied: [],
        error: `Migration ${migrationToRollback.name} does not support rollback`,
        currentVersion,
      };
    }

    // Run the rollback
    migrationToRollback.down(db);

    // Remove the migration record
    removeMigrationRecord(db, currentVersion);

    return {
      success: true,
      applied: [],
      currentVersion: getCurrentVersion(db),
    };
  } catch (error) {
    return {
      success: false,
      applied: [],
      error: error instanceof Error ? error.message : String(error),
      currentVersion: getCurrentVersion(db),
    };
  }
};

/**
 * Gets pending migrations that haven't been applied yet
 */
export const getPendingMigrations = (
  db: SQLite.SQLiteDatabase,
  migrations: Migration[]
): Migration[] => {
  createMigrationsTable(db);
  return migrations
    .filter((m) => !isMigrationApplied(db, m.version))
    .sort((a, b) => a.version - b.version);
};

/**
 * Drops the migrations table (for testing only)
 */
export const dropMigrationsTable = (db: SQLite.SQLiteDatabase): void => {
  db.execSync(`DROP TABLE IF EXISTS ${MIGRATIONS_TABLE};`);
};
