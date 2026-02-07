import * as SQLite from 'expo-sqlite';
import { Migration } from './types';

/**
 * Migration: Create game_trials table
 * Stores individual trial data for each game session
 */
export const migration005CreateGameTrialsTable: Migration = {
  version: 5,
  name: 'create_game_trials_table',

  up: (db: SQLite.SQLiteDatabase): void => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS game_trials (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        game_session_id TEXT NOT NULL,
        trial_number INTEGER NOT NULL,
        stimulus TEXT NOT NULL,
        response TEXT,
        correct INTEGER NOT NULL CHECK(correct IN (0, 1)),
        response_time REAL NOT NULL,
        theta_zscore REAL,
        timestamp INTEGER NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (game_session_id) REFERENCES game_sessions(id) ON DELETE CASCADE
      );
    `);

    // Create index for faster queries by game session
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_game_trials_game_session_id
      ON game_trials(game_session_id);
    `);

    // Create composite index for ordered trial retrieval
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_game_trials_session_trial
      ON game_trials(game_session_id, trial_number);
    `);
  },

  down: (db: SQLite.SQLiteDatabase): void => {
    db.execSync('DROP INDEX IF EXISTS idx_game_trials_session_trial;');
    db.execSync('DROP INDEX IF EXISTS idx_game_trials_game_session_id;');
    db.execSync('DROP TABLE IF EXISTS game_trials;');
  },
};
