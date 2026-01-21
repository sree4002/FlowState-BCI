import * as SQLite from 'expo-sqlite';

/**
 * Migration interface defining the structure of a database migration
 */
export interface Migration {
  /** Unique version number for ordering migrations (use timestamps like 20240115001) */
  version: number;
  /** Human-readable name for the migration */
  name: string;
  /** SQL statements to apply the migration */
  up: (db: SQLite.SQLiteDatabase) => void;
  /** SQL statements to revert the migration (optional) */
  down?: (db: SQLite.SQLiteDatabase) => void;
}

/**
 * Record stored in the migrations table to track applied migrations
 */
export interface MigrationRecord {
  version: number;
  name: string;
  applied_at: number;
}

/**
 * Result of running migrations
 */
export interface MigrationResult {
  /** Whether all migrations ran successfully */
  success: boolean;
  /** List of migrations that were applied */
  applied: MigrationRecord[];
  /** Error message if migrations failed */
  error?: string;
  /** Current schema version after migrations */
  currentVersion: number;
}
