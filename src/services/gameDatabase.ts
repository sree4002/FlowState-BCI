import * as SQLite from 'expo-sqlite';
import {
  GameSession,
  GameSessionDetail,
  GameTrial,
  GameType,
  GameMode,
  GameConfig,
  GamePerformance,
} from '../types/games';
import { openDatabase } from './database';

/**
 * Game session database record interface
 */
export interface GameSessionRecord {
  id: string;
  game_type: GameType;
  mode: GameMode;
  session_id: number | null;
  start_time: number;
  end_time: number;
  difficulty_start: number;
  difficulty_end: number;
  total_trials: number;
  correct_trials: number;
  accuracy: number;
  avg_response_time: number;
  theta_correlation: number | null;
  config: string; // JSON string
  created_at?: number;
}

/**
 * Game trial database record interface
 */
export interface GameTrialRecord {
  id?: number;
  game_session_id: string;
  trial_number: number;
  stimulus: string; // JSON string
  response: string | null; // JSON string
  correct: number; // 0 or 1 (SQLite boolean)
  response_time: number;
  theta_zscore: number | null;
  timestamp: number;
  created_at?: number;
}

/**
 * Converts a GameSessionRecord to a GameSession
 */
const recordToGameSession = (record: GameSessionRecord): GameSession => {
  const config: GameConfig = JSON.parse(record.config);
  const performance: GamePerformance = {
    total_trials: record.total_trials,
    correct_trials: record.correct_trials,
    accuracy: record.accuracy,
    avg_response_time: record.avg_response_time,
    difficulty_start: record.difficulty_start,
    difficulty_end: record.difficulty_end,
    theta_correlation: record.theta_correlation ?? undefined,
  };

  return {
    id: record.id,
    game_type: record.game_type,
    mode: record.mode,
    session_id: record.session_id?.toString(),
    start_time: record.start_time,
    end_time: record.end_time,
    performance,
    config,
  };
};

/**
 * Converts a GameTrialRecord to a GameTrial
 */
const recordToGameTrial = (record: GameTrialRecord): GameTrial => ({
  trial_number: record.trial_number,
  stimulus: record.stimulus,
  response: record.response,
  correct: record.correct === 1,
  response_time: record.response_time,
  theta_zscore: record.theta_zscore ?? undefined,
  timestamp: record.timestamp,
});

/**
 * Inserts a new game session into the database
 * @returns The ID of the inserted game session
 */
export const insertGameSession = (
  db: SQLite.SQLiteDatabase,
  session: Omit<GameSessionRecord, 'created_at'>
): string => {
  db.runSync(
    `INSERT INTO game_sessions
     (id, game_type, mode, session_id, start_time, end_time, difficulty_start, difficulty_end, total_trials, correct_trials, accuracy, avg_response_time, theta_correlation, config)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.id,
      session.game_type,
      session.mode,
      session.session_id,
      session.start_time,
      session.end_time,
      session.difficulty_start,
      session.difficulty_end,
      session.total_trials,
      session.correct_trials,
      session.accuracy,
      session.avg_response_time,
      session.theta_correlation,
      session.config,
    ]
  );
  return session.id;
};

/**
 * Inserts a new game trial into the database
 * @returns The ID of the inserted trial
 */
export const insertGameTrial = (
  db: SQLite.SQLiteDatabase,
  trial: Omit<GameTrialRecord, 'id' | 'created_at'>
): number => {
  const result = db.runSync(
    `INSERT INTO game_trials
     (game_session_id, trial_number, stimulus, response, correct, response_time, theta_zscore, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      trial.game_session_id,
      trial.trial_number,
      trial.stimulus,
      trial.response,
      trial.correct,
      trial.response_time,
      trial.theta_zscore,
      trial.timestamp,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Retrieves a game session by ID (without trials)
 */
export const getGameSessionById = (
  db: SQLite.SQLiteDatabase,
  id: string
): GameSession | null => {
  const record = db.getFirstSync<GameSessionRecord>(
    'SELECT * FROM game_sessions WHERE id = ?',
    [id]
  );
  return record ? recordToGameSession(record) : null;
};

/**
 * Retrieves a game session by ID with all trial details
 */
export const getGameSessionDetailById = (
  db: SQLite.SQLiteDatabase,
  id: string
): GameSessionDetail | null => {
  const session = getGameSessionById(db, id);
  if (!session) {
    return null;
  }

  const trialRecords = db.getAllSync<GameTrialRecord>(
    'SELECT * FROM game_trials WHERE game_session_id = ? ORDER BY trial_number ASC',
    [id]
  );

  const trials = trialRecords.map(recordToGameTrial);

  return {
    ...session,
    trials,
  };
};

/**
 * Retrieves all game sessions ordered by start time (newest first)
 */
export const getAllGameSessions = (
  db: SQLite.SQLiteDatabase,
  limit?: number
): GameSession[] => {
  const query = limit
    ? 'SELECT * FROM game_sessions ORDER BY start_time DESC LIMIT ?'
    : 'SELECT * FROM game_sessions ORDER BY start_time DESC';
  const params = limit ? [limit] : [];

  const records = db.getAllSync<GameSessionRecord>(query, params);
  return records.map(recordToGameSession);
};

/**
 * Retrieves game sessions by game type
 */
export const getGameSessionsByType = (
  db: SQLite.SQLiteDatabase,
  gameType: GameType,
  limit?: number
): GameSession[] => {
  const query = limit
    ? 'SELECT * FROM game_sessions WHERE game_type = ? ORDER BY start_time DESC LIMIT ?'
    : 'SELECT * FROM game_sessions WHERE game_type = ? ORDER BY start_time DESC';
  const params = limit ? [gameType, limit] : [gameType];

  const records = db.getAllSync<GameSessionRecord>(query, params);
  return records.map(recordToGameSession);
};

/**
 * Retrieves game sessions by mode
 */
export const getGameSessionsByMode = (
  db: SQLite.SQLiteDatabase,
  mode: GameMode,
  limit?: number
): GameSession[] => {
  const query = limit
    ? 'SELECT * FROM game_sessions WHERE mode = ? ORDER BY start_time DESC LIMIT ?'
    : 'SELECT * FROM game_sessions WHERE mode = ? ORDER BY start_time DESC';
  const params = limit ? [mode, limit] : [mode];

  const records = db.getAllSync<GameSessionRecord>(query, params);
  return records.map(recordToGameSession);
};

/**
 * Retrieves game sessions linked to a specific BCI session
 */
export const getGameSessionsBySessionId = (
  db: SQLite.SQLiteDatabase,
  sessionId: number
): GameSession[] => {
  const records = db.getAllSync<GameSessionRecord>(
    'SELECT * FROM game_sessions WHERE session_id = ? ORDER BY start_time ASC',
    [sessionId]
  );
  return records.map(recordToGameSession);
};

/**
 * Retrieves game sessions within a date range
 */
export const getGameSessionsByDateRange = (
  db: SQLite.SQLiteDatabase,
  startTime: number,
  endTime: number
): GameSession[] => {
  const records = db.getAllSync<GameSessionRecord>(
    'SELECT * FROM game_sessions WHERE start_time >= ? AND start_time <= ? ORDER BY start_time DESC',
    [startTime, endTime]
  );
  return records.map(recordToGameSession);
};

/**
 * Updates an existing game session
 */
export const updateGameSession = (
  db: SQLite.SQLiteDatabase,
  id: string,
  updates: Partial<Omit<GameSessionRecord, 'id' | 'created_at'>>
): void => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (updates.game_type !== undefined) {
    fields.push('game_type = ?');
    values.push(updates.game_type);
  }
  if (updates.mode !== undefined) {
    fields.push('mode = ?');
    values.push(updates.mode);
  }
  if (updates.session_id !== undefined) {
    fields.push('session_id = ?');
    values.push(updates.session_id);
  }
  if (updates.start_time !== undefined) {
    fields.push('start_time = ?');
    values.push(updates.start_time);
  }
  if (updates.end_time !== undefined) {
    fields.push('end_time = ?');
    values.push(updates.end_time);
  }
  if (updates.difficulty_start !== undefined) {
    fields.push('difficulty_start = ?');
    values.push(updates.difficulty_start);
  }
  if (updates.difficulty_end !== undefined) {
    fields.push('difficulty_end = ?');
    values.push(updates.difficulty_end);
  }
  if (updates.total_trials !== undefined) {
    fields.push('total_trials = ?');
    values.push(updates.total_trials);
  }
  if (updates.correct_trials !== undefined) {
    fields.push('correct_trials = ?');
    values.push(updates.correct_trials);
  }
  if (updates.accuracy !== undefined) {
    fields.push('accuracy = ?');
    values.push(updates.accuracy);
  }
  if (updates.avg_response_time !== undefined) {
    fields.push('avg_response_time = ?');
    values.push(updates.avg_response_time);
  }
  if (updates.theta_correlation !== undefined) {
    fields.push('theta_correlation = ?');
    values.push(updates.theta_correlation);
  }
  if (updates.config !== undefined) {
    fields.push('config = ?');
    values.push(updates.config);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(id);
  db.runSync(
    `UPDATE game_sessions SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

/**
 * Deletes a game session by ID (cascades to trials)
 */
export const deleteGameSession = (
  db: SQLite.SQLiteDatabase,
  id: string
): void => {
  db.runSync('DELETE FROM game_sessions WHERE id = ?', [id]);
};

/**
 * Deletes all game sessions (use with caution)
 */
export const deleteAllGameSessions = (db: SQLite.SQLiteDatabase): void => {
  db.runSync('DELETE FROM game_sessions');
};

/**
 * Gets the count of game sessions in the database
 */
export const getGameSessionsCount = (db: SQLite.SQLiteDatabase): number => {
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM game_sessions'
  );
  return result?.count || 0;
};

/**
 * Gets aggregate statistics for game sessions
 */
export interface GameStats {
  total_games: number;
  avg_accuracy: number;
  avg_response_time: number;
  best_accuracy: number;
  games_by_type: Record<GameType, number>;
}

export const getGameStats = (
  db: SQLite.SQLiteDatabase,
  gameType?: GameType
): GameStats => {
  const whereClause = gameType ? 'WHERE game_type = ?' : '';
  const params = gameType ? [gameType] : [];

  const query = `
    SELECT
      COUNT(*) as total_games,
      COALESCE(AVG(accuracy), 0) as avg_accuracy,
      COALESCE(AVG(avg_response_time), 0) as avg_response_time,
      COALESCE(MAX(accuracy), 0) as best_accuracy
    FROM game_sessions
    ${whereClause}
  `;

  const result = db.getFirstSync<{
    total_games: number;
    avg_accuracy: number;
    avg_response_time: number;
    best_accuracy: number;
  }>(query, params);

  // Get counts by game type
  const typeCountsQuery = gameType
    ? 'SELECT game_type, COUNT(*) as count FROM game_sessions WHERE game_type = ? GROUP BY game_type'
    : 'SELECT game_type, COUNT(*) as count FROM game_sessions GROUP BY game_type';
  const typeCountsParams = gameType ? [gameType] : [];

  const typeCounts = db.getAllSync<{ game_type: GameType; count: number }>(
    typeCountsQuery,
    typeCountsParams
  );

  const games_by_type: Record<GameType, number> = {
    word_recall: 0,
    nback: 0,
  };

  typeCounts.forEach((row) => {
    games_by_type[row.game_type] = row.count;
  });

  return {
    total_games: result?.total_games || 0,
    avg_accuracy: result?.avg_accuracy || 0,
    avg_response_time: result?.avg_response_time || 0,
    best_accuracy: result?.best_accuracy || 0,
    games_by_type,
  };
};

/**
 * Helper function to get database instance
 * Convenience wrapper around openDatabase
 */
export const getGameDatabase = (): SQLite.SQLiteDatabase => {
  return openDatabase();
};
