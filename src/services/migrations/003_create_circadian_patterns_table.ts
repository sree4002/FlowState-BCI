import * as SQLite from 'expo-sqlite';
import { Migration } from './types';

/**
 * Migration: Create circadian_patterns table
 * Stores aggregated session data by hour of day for circadian analysis
 */
export const migration003CreateCircadianPatternsTable: Migration = {
  version: 3,
  name: 'create_circadian_patterns_table',

  up: (db: SQLite.SQLiteDatabase): void => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS circadian_patterns (
        hour_of_day INTEGER PRIMARY KEY CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
        avg_theta_mean REAL NOT NULL,
        avg_theta_std REAL NOT NULL,
        session_count INTEGER NOT NULL DEFAULT 0,
        avg_subjective_rating REAL,
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);
  },

  down: (db: SQLite.SQLiteDatabase): void => {
    db.execSync('DROP TABLE IF EXISTS circadian_patterns;');
  },
};
