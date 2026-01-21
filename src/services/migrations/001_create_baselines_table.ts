import * as SQLite from 'expo-sqlite';
import { Migration } from './types';

/**
 * Migration: Create baselines table
 * Stores calibration baseline profiles for EEG signal normalization
 */
export const migration001CreateBaselinesTable: Migration = {
  version: 1,
  name: 'create_baselines_table',

  up: (db: SQLite.SQLiteDatabase): void => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS baselines (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        theta_mean REAL NOT NULL,
        theta_std REAL NOT NULL,
        alpha_mean REAL NOT NULL,
        beta_mean REAL NOT NULL,
        peak_theta_freq REAL NOT NULL,
        optimal_freq REAL,
        calibration_timestamp INTEGER NOT NULL,
        quality_score REAL NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
  },

  down: (db: SQLite.SQLiteDatabase): void => {
    db.execSync('DROP TABLE IF EXISTS baselines;');
  },
};
