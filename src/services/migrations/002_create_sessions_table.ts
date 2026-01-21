import * as SQLite from 'expo-sqlite';
import { Migration } from './types';

/**
 * Migration: Create sessions table
 * Stores session records for BCI entrainment sessions
 */
export const migration002CreateSessionsTable: Migration = {
  version: 2,
  name: 'create_sessions_table',

  up: (db: SQLite.SQLiteDatabase): void => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_type TEXT NOT NULL CHECK (session_type IN ('calibration', 'quick_boost', 'custom', 'scheduled', 'sham')),
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        duration_seconds INTEGER NOT NULL,
        avg_theta_zscore REAL NOT NULL,
        max_theta_zscore REAL NOT NULL,
        entrainment_freq REAL NOT NULL,
        volume REAL NOT NULL,
        signal_quality_avg REAL NOT NULL,
        subjective_rating INTEGER,
        notes TEXT,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Create index on start_time for efficient querying by date
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON sessions(start_time);
    `);
  },

  down: (db: SQLite.SQLiteDatabase): void => {
    db.execSync('DROP INDEX IF EXISTS idx_sessions_start_time;');
    db.execSync('DROP TABLE IF EXISTS sessions;');
  },
};
