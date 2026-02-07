import * as SQLite from 'expo-sqlite';
import { Migration } from './types';

/**
 * Migration: Create game_sessions table
 * Stores cognitive game session records with performance metrics
 */
export const migration004CreateGameSessionsTable: Migration = {
  version: 4,
  name: 'create_game_sessions_table',

  up: (db: SQLite.SQLiteDatabase): void => {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id TEXT PRIMARY KEY,
        game_type TEXT NOT NULL CHECK(game_type IN ('word_recall', 'nback')),
        mode TEXT NOT NULL CHECK(mode IN ('during_session', 'pre_session', 'post_session', 'standalone')),
        session_id INTEGER,
        start_time INTEGER NOT NULL,
        end_time INTEGER NOT NULL,
        difficulty_start REAL NOT NULL,
        difficulty_end REAL NOT NULL,
        total_trials INTEGER NOT NULL,
        correct_trials INTEGER NOT NULL,
        accuracy REAL NOT NULL,
        avg_response_time REAL NOT NULL,
        theta_correlation REAL,
        config TEXT NOT NULL,
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE SET NULL
      );
    `);

    // Create index for faster queries by game type and mode
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_game_sessions_game_type
      ON game_sessions(game_type);
    `);

    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_game_sessions_mode
      ON game_sessions(mode);
    `);

    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_game_sessions_session_id
      ON game_sessions(session_id);
    `);

    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_game_sessions_start_time
      ON game_sessions(start_time DESC);
    `);
  },

  down: (db: SQLite.SQLiteDatabase): void => {
    db.execSync('DROP INDEX IF EXISTS idx_game_sessions_start_time;');
    db.execSync('DROP INDEX IF EXISTS idx_game_sessions_session_id;');
    db.execSync('DROP INDEX IF EXISTS idx_game_sessions_mode;');
    db.execSync('DROP INDEX IF EXISTS idx_game_sessions_game_type;');
    db.execSync('DROP TABLE IF EXISTS game_sessions;');
  },
};
