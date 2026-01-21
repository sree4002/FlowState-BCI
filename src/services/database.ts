import * as SQLite from 'expo-sqlite';
import {
  allMigrations,
  runMigrations,
  getCurrentVersion,
  getAppliedMigrations,
  getPendingMigrations,
  rollbackLastMigration,
  dropMigrationsTable,
  MigrationResult,
  MigrationRecord,
  Migration,
} from './migrations';

/**
 * Database schema and initialization for FlowState BCI
 * Manages SQLite database for baselines, sessions, and circadian patterns
 */

const DB_NAME = 'flowstate.db';

/**
 * Opens or creates the SQLite database
 */
export const openDatabase = (): SQLite.SQLiteDatabase => {
  return SQLite.openDatabaseSync(DB_NAME);
};

/**
 * Creates the baselines table if it doesn't exist
 * @deprecated Use initializeDatabase() with migrations instead
 * Stores calibration baseline profiles for EEG signal normalization
 */
export const createBaselinesTable = (db: SQLite.SQLiteDatabase): void => {
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
};

/**
 * Initializes the database with all migrations
 * Should be called on app startup
 * @returns Object containing db instance and migration result
 */
export const initializeDatabase = (): {
  db: SQLite.SQLiteDatabase;
  migrationResult: MigrationResult;
} => {
  const db = openDatabase();
  const migrationResult = runMigrations(db, allMigrations);
  return { db, migrationResult };
};

/**
 * Initializes the database and returns just the db instance
 * For backwards compatibility with existing code
 */
export const initializeDatabaseSimple = (): SQLite.SQLiteDatabase => {
  const { db } = initializeDatabase();
  return db;
};

/**
 * Gets the current schema version
 */
export const getSchemaVersion = (db: SQLite.SQLiteDatabase): number => {
  return getCurrentVersion(db);
};

/**
 * Gets list of applied migrations
 */
export const getAppliedMigrationsList = (
  db: SQLite.SQLiteDatabase
): MigrationRecord[] => {
  return getAppliedMigrations(db);
};

/**
 * Gets list of pending migrations
 */
export const getPendingMigrationsList = (
  db: SQLite.SQLiteDatabase
): Migration[] => {
  return getPendingMigrations(db, allMigrations);
};

/**
 * Rolls back the last migration
 */
export const rollbackMigration = (
  db: SQLite.SQLiteDatabase
): MigrationResult => {
  return rollbackLastMigration(db, allMigrations);
};

/**
 * Drops all tables (use with caution - for testing/development only)
 */
export const dropAllTables = (db: SQLite.SQLiteDatabase): void => {
  db.execSync('DROP TABLE IF EXISTS baselines;');
  db.execSync('DROP TABLE IF EXISTS sessions;');
  db.execSync('DROP TABLE IF EXISTS circadian_patterns;');
  dropMigrationsTable(db);
};

/**
 * Baseline profile interface matching database schema
 */
export interface BaselineRecord {
  id?: number;
  theta_mean: number;
  theta_std: number;
  alpha_mean: number;
  beta_mean: number;
  peak_theta_freq: number;
  optimal_freq: number | null;
  calibration_timestamp: number;
  quality_score: number;
  created_at?: number;
}

/**
 * Circadian pattern record interface matching database schema
 * Stores aggregated theta statistics by hour of day
 */
export interface CircadianPatternRecord {
  id?: number;
  hour_of_day: number;
  avg_theta_mean: number;
  avg_theta_std: number;
  session_count: number;
  avg_subjective_rating: number | null;
  created_at?: number;
  updated_at?: number;
}

/**
 * Inserts a new baseline profile into the database
 * @returns The ID of the inserted record
 */
export const insertBaseline = (
  db: SQLite.SQLiteDatabase,
  baseline: Omit<BaselineRecord, 'id' | 'created_at'>
): number => {
  const result = db.runSync(
    `INSERT INTO baselines
     (theta_mean, theta_std, alpha_mean, beta_mean, peak_theta_freq, optimal_freq, calibration_timestamp, quality_score)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      baseline.theta_mean,
      baseline.theta_std,
      baseline.alpha_mean,
      baseline.beta_mean,
      baseline.peak_theta_freq,
      baseline.optimal_freq,
      baseline.calibration_timestamp,
      baseline.quality_score,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Retrieves the most recent baseline profile
 * @returns The latest baseline record or null if none exists
 */
export const getLatestBaseline = (
  db: SQLite.SQLiteDatabase
): BaselineRecord | null => {
  const result = db.getFirstSync<BaselineRecord>(
    'SELECT * FROM baselines ORDER BY calibration_timestamp DESC LIMIT 1'
  );
  return result || null;
};

/**
 * Retrieves all baseline profiles ordered by timestamp (newest first)
 */
export const getAllBaselines = (
  db: SQLite.SQLiteDatabase
): BaselineRecord[] => {
  return db.getAllSync<BaselineRecord>(
    'SELECT * FROM baselines ORDER BY calibration_timestamp DESC'
  );
};

/**
 * Retrieves a baseline profile by ID
 */
export const getBaselineById = (
  db: SQLite.SQLiteDatabase,
  id: number
): BaselineRecord | null => {
  const result = db.getFirstSync<BaselineRecord>(
    'SELECT * FROM baselines WHERE id = ?',
    [id]
  );
  return result || null;
};

/**
 * Updates an existing baseline profile
 */
export const updateBaseline = (
  db: SQLite.SQLiteDatabase,
  id: number,
  baseline: Partial<Omit<BaselineRecord, 'id' | 'created_at'>>
): void => {
  const fields: string[] = [];
  const values: (number | null)[] = [];

  if (baseline.theta_mean !== undefined) {
    fields.push('theta_mean = ?');
    values.push(baseline.theta_mean);
  }
  if (baseline.theta_std !== undefined) {
    fields.push('theta_std = ?');
    values.push(baseline.theta_std);
  }
  if (baseline.alpha_mean !== undefined) {
    fields.push('alpha_mean = ?');
    values.push(baseline.alpha_mean);
  }
  if (baseline.beta_mean !== undefined) {
    fields.push('beta_mean = ?');
    values.push(baseline.beta_mean);
  }
  if (baseline.peak_theta_freq !== undefined) {
    fields.push('peak_theta_freq = ?');
    values.push(baseline.peak_theta_freq);
  }
  if (baseline.optimal_freq !== undefined) {
    fields.push('optimal_freq = ?');
    values.push(baseline.optimal_freq);
  }
  if (baseline.calibration_timestamp !== undefined) {
    fields.push('calibration_timestamp = ?');
    values.push(baseline.calibration_timestamp);
  }
  if (baseline.quality_score !== undefined) {
    fields.push('quality_score = ?');
    values.push(baseline.quality_score);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(id);
  db.runSync(`UPDATE baselines SET ${fields.join(', ')} WHERE id = ?`, values);
};

/**
 * Deletes a baseline profile by ID
 */
export const deleteBaseline = (db: SQLite.SQLiteDatabase, id: number): void => {
  db.runSync('DELETE FROM baselines WHERE id = ?', [id]);
};

/**
 * Deletes all baseline profiles (use with caution)
 */
export const deleteAllBaselines = (db: SQLite.SQLiteDatabase): void => {
  db.runSync('DELETE FROM baselines');
};

/**
 * Gets the count of baseline profiles in the database
 */
export const getBaselinesCount = (db: SQLite.SQLiteDatabase): number => {
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM baselines'
  );
  return result?.count || 0;
};

// ============================================================================
// Sessions Table
// ============================================================================

/**
 * Session type enumeration
 */
export type SessionType =
  | 'calibration'
  | 'quick_boost'
  | 'custom'
  | 'scheduled'
  | 'sham';

/**
 * Session record interface matching database schema
 */
export interface SessionRecord {
  id?: number;
  session_type: SessionType;
  start_time: number;
  end_time: number;
  duration_seconds: number;
  avg_theta_zscore: number;
  max_theta_zscore: number;
  entrainment_freq: number;
  volume: number;
  signal_quality_avg: number;
  subjective_rating: number | null;
  notes: string | null;
  created_at?: number;
}

/**
 * Creates the sessions table if it doesn't exist
 * Stores BCI entrainment session records
 */
export const createSessionsTable = (db: SQLite.SQLiteDatabase): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_type TEXT NOT NULL CHECK(session_type IN ('calibration', 'quick_boost', 'custom', 'scheduled', 'sham')),
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
};

/**
 * Inserts a new session record into the database
 * @returns The ID of the inserted record
 */
export const insertSession = (
  db: SQLite.SQLiteDatabase,
  session: Omit<SessionRecord, 'id' | 'created_at'>
): number => {
  const result = db.runSync(
    `INSERT INTO sessions
     (session_type, start_time, end_time, duration_seconds, avg_theta_zscore, max_theta_zscore, entrainment_freq, volume, signal_quality_avg, subjective_rating, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      session.session_type,
      session.start_time,
      session.end_time,
      session.duration_seconds,
      session.avg_theta_zscore,
      session.max_theta_zscore,
      session.entrainment_freq,
      session.volume,
      session.signal_quality_avg,
      session.subjective_rating,
      session.notes,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Retrieves a session by ID
 */
export const getSessionById = (
  db: SQLite.SQLiteDatabase,
  id: number
): SessionRecord | null => {
  const result = db.getFirstSync<SessionRecord>(
    'SELECT * FROM sessions WHERE id = ?',
    [id]
  );
  return result || null;
};

/**
 * Retrieves all sessions ordered by start time (newest first)
 */
export const getAllSessions = (db: SQLite.SQLiteDatabase): SessionRecord[] => {
  return db.getAllSync<SessionRecord>(
    'SELECT * FROM sessions ORDER BY start_time DESC'
  );
};

/**
 * Retrieves the most recent session
 */
export const getLatestSession = (
  db: SQLite.SQLiteDatabase
): SessionRecord | null => {
  const result = db.getFirstSync<SessionRecord>(
    'SELECT * FROM sessions ORDER BY start_time DESC LIMIT 1'
  );
  return result || null;
};

/**
 * Retrieves sessions by type
 */
export const getSessionsByType = (
  db: SQLite.SQLiteDatabase,
  sessionType: SessionType
): SessionRecord[] => {
  return db.getAllSync<SessionRecord>(
    'SELECT * FROM sessions WHERE session_type = ? ORDER BY start_time DESC',
    [sessionType]
  );
};

/**
 * Retrieves sessions within a date range
 * @param startTime - Start of range (unix timestamp in milliseconds)
 * @param endTime - End of range (unix timestamp in milliseconds)
 */
export const getSessionsByDateRange = (
  db: SQLite.SQLiteDatabase,
  startTime: number,
  endTime: number
): SessionRecord[] => {
  return db.getAllSync<SessionRecord>(
    'SELECT * FROM sessions WHERE start_time >= ? AND start_time <= ? ORDER BY start_time DESC',
    [startTime, endTime]
  );
};

/**
 * Updates an existing session record
 */
export const updateSession = (
  db: SQLite.SQLiteDatabase,
  id: number,
  session: Partial<Omit<SessionRecord, 'id' | 'created_at'>>
): void => {
  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (session.session_type !== undefined) {
    fields.push('session_type = ?');
    values.push(session.session_type);
  }
  if (session.start_time !== undefined) {
    fields.push('start_time = ?');
    values.push(session.start_time);
  }
  if (session.end_time !== undefined) {
    fields.push('end_time = ?');
    values.push(session.end_time);
  }
  if (session.duration_seconds !== undefined) {
    fields.push('duration_seconds = ?');
    values.push(session.duration_seconds);
  }
  if (session.avg_theta_zscore !== undefined) {
    fields.push('avg_theta_zscore = ?');
    values.push(session.avg_theta_zscore);
  }
  if (session.max_theta_zscore !== undefined) {
    fields.push('max_theta_zscore = ?');
    values.push(session.max_theta_zscore);
  }
  if (session.entrainment_freq !== undefined) {
    fields.push('entrainment_freq = ?');
    values.push(session.entrainment_freq);
  }
  if (session.volume !== undefined) {
    fields.push('volume = ?');
    values.push(session.volume);
  }
  if (session.signal_quality_avg !== undefined) {
    fields.push('signal_quality_avg = ?');
    values.push(session.signal_quality_avg);
  }
  if (session.subjective_rating !== undefined) {
    fields.push('subjective_rating = ?');
    values.push(session.subjective_rating);
  }
  if (session.notes !== undefined) {
    fields.push('notes = ?');
    values.push(session.notes);
  }

  if (fields.length === 0) {
    return;
  }

  values.push(id);
  db.runSync(`UPDATE sessions SET ${fields.join(', ')} WHERE id = ?`, values);
};

/**
 * Deletes a session by ID
 */
export const deleteSession = (db: SQLite.SQLiteDatabase, id: number): void => {
  db.runSync('DELETE FROM sessions WHERE id = ?', [id]);
};

/**
 * Deletes all sessions (use with caution)
 */
export const deleteAllSessions = (db: SQLite.SQLiteDatabase): void => {
  db.runSync('DELETE FROM sessions');
};

/**
 * Gets the count of sessions in the database
 */
export const getSessionsCount = (db: SQLite.SQLiteDatabase): number => {
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM sessions'
  );
  return result?.count || 0;
};

/**
 * Session statistics interface
 */
export interface SessionStats {
  total_sessions: number;
  total_duration_seconds: number;
  avg_theta_zscore: number;
  avg_signal_quality: number;
  avg_subjective_rating: number | null;
}

/**
 * Gets aggregate statistics for sessions within a date range
 */
export const getSessionStats = (
  db: SQLite.SQLiteDatabase,
  startTime?: number,
  endTime?: number
): SessionStats => {
  let query = `
    SELECT
      COUNT(*) as total_sessions,
      COALESCE(SUM(duration_seconds), 0) as total_duration_seconds,
      COALESCE(AVG(avg_theta_zscore), 0) as avg_theta_zscore,
      COALESCE(AVG(signal_quality_avg), 0) as avg_signal_quality,
      AVG(subjective_rating) as avg_subjective_rating
    FROM sessions
  `;
  const params: number[] = [];

  if (startTime !== undefined && endTime !== undefined) {
    query += ' WHERE start_time >= ? AND start_time <= ?';
    params.push(startTime, endTime);
  }

  const result = db.getFirstSync<SessionStats>(query, params);
  return (
    result || {
      total_sessions: 0,
      total_duration_seconds: 0,
      avg_theta_zscore: 0,
      avg_signal_quality: 0,
      avg_subjective_rating: null,
    }
  );
};

// ============================================================================
// Circadian Patterns Table
// ============================================================================

/**
 * Circadian pattern record interface matching database schema
 */
export interface CircadianPatternRecord {
  id?: number;
  hour_of_day: number;
  avg_theta_mean: number;
  avg_theta_std: number;
  session_count: number;
  avg_subjective_rating: number | null;
  created_at?: number;
  updated_at?: number;
}

/**
 * Creates the circadian_patterns table if it doesn't exist
 * Stores aggregated session performance by hour of day
 */
export const createCircadianPatternsTable = (
  db: SQLite.SQLiteDatabase
): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS circadian_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hour_of_day INTEGER NOT NULL UNIQUE CHECK(hour_of_day >= 0 AND hour_of_day <= 23),
      avg_theta_mean REAL NOT NULL,
      avg_theta_std REAL NOT NULL,
      session_count INTEGER NOT NULL,
      avg_subjective_rating REAL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now'))
    );
  `);
};

/**
 * Inserts or updates a circadian pattern for a specific hour
 * Uses upsert logic - inserts if not exists, updates if exists
 * @returns The ID of the inserted/updated record
 */
export const upsertCircadianPattern = (
  db: SQLite.SQLiteDatabase,
  pattern: Omit<CircadianPatternRecord, 'id' | 'created_at' | 'updated_at'>
): number => {
  // Check if pattern for this hour already exists
  const existing = getCircadianPatternByHour(db, pattern.hour_of_day);

  if (existing) {
    // Update existing pattern
    db.runSync(
      `UPDATE circadian_patterns
       SET avg_theta_mean = ?, avg_theta_std = ?, session_count = ?, avg_subjective_rating = ?, updated_at = strftime('%s', 'now')
       WHERE hour_of_day = ?`,
      [
        pattern.avg_theta_mean,
        pattern.avg_theta_std,
        pattern.session_count,
        pattern.avg_subjective_rating,
        pattern.hour_of_day,
      ]
    );
    return existing.id!;
  } else {
    // Insert new pattern
    const result = db.runSync(
      `INSERT INTO circadian_patterns
       (hour_of_day, avg_theta_mean, avg_theta_std, session_count, avg_subjective_rating)
       VALUES (?, ?, ?, ?, ?)`,
      [
        pattern.hour_of_day,
        pattern.avg_theta_mean,
        pattern.avg_theta_std,
        pattern.session_count,
        pattern.avg_subjective_rating,
      ]
    );
    return result.lastInsertRowId;
  }
};

/**
 * Retrieves a circadian pattern by hour of day
 */
export const getCircadianPatternByHour = (
  db: SQLite.SQLiteDatabase,
  hourOfDay: number
): CircadianPatternRecord | null => {
  const result = db.getFirstSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns WHERE hour_of_day = ?',
    [hourOfDay]
  );
  return result || null;
};

/**
 * Retrieves a circadian pattern by ID
 */
export const getCircadianPatternById = (
  db: SQLite.SQLiteDatabase,
  id: number
): CircadianPatternRecord | null => {
  const result = db.getFirstSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns WHERE id = ?',
    [id]
  );
  return result || null;
};

/**
 * Retrieves all circadian patterns ordered by hour
 */
export const getAllCircadianPatterns = (
  db: SQLite.SQLiteDatabase
): CircadianPatternRecord[] => {
  return db.getAllSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns ORDER BY hour_of_day ASC'
  );
};

/**
 * Updates an existing circadian pattern
 */
export const updateCircadianPattern = (
  db: SQLite.SQLiteDatabase,
  id: number,
  pattern: Partial<
    Omit<CircadianPatternRecord, 'id' | 'created_at' | 'updated_at'>
  >
): void => {
  const fields: string[] = [];
  const values: (number | null)[] = [];

  if (pattern.hour_of_day !== undefined) {
    fields.push('hour_of_day = ?');
    values.push(pattern.hour_of_day);
  }
  if (pattern.avg_theta_mean !== undefined) {
    fields.push('avg_theta_mean = ?');
    values.push(pattern.avg_theta_mean);
  }
  if (pattern.avg_theta_std !== undefined) {
    fields.push('avg_theta_std = ?');
    values.push(pattern.avg_theta_std);
  }
  if (pattern.session_count !== undefined) {
    fields.push('session_count = ?');
    values.push(pattern.session_count);
  }
  if (pattern.avg_subjective_rating !== undefined) {
    fields.push('avg_subjective_rating = ?');
    values.push(pattern.avg_subjective_rating);
  }

  if (fields.length === 0) {
    return;
  }

  fields.push("updated_at = strftime('%s', 'now')");
  values.push(id);
  db.runSync(
    `UPDATE circadian_patterns SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
};

/**
 * Deletes a circadian pattern by ID
 */
export const deleteCircadianPattern = (
  db: SQLite.SQLiteDatabase,
  id: number
): void => {
  db.runSync('DELETE FROM circadian_patterns WHERE id = ?', [id]);
};

/**
 * Deletes a circadian pattern by hour
 */
export const deleteCircadianPatternByHour = (
  db: SQLite.SQLiteDatabase,
  hourOfDay: number
): void => {
  db.runSync('DELETE FROM circadian_patterns WHERE hour_of_day = ?', [
    hourOfDay,
  ]);
};

/**
 * Deletes all circadian patterns (use with caution)
 */
export const deleteAllCircadianPatterns = (
  db: SQLite.SQLiteDatabase
): void => {
  db.runSync('DELETE FROM circadian_patterns');
};

/**
 * Gets the count of circadian patterns in the database
 */
export const getCircadianPatternsCount = (
  db: SQLite.SQLiteDatabase
): number => {
  const result = db.getFirstSync<{ count: number }>(
    'SELECT COUNT(*) as count FROM circadian_patterns'
  );
  return result?.count || 0;
};

/**
 * Gets the hour with the best average theta performance
 */
export const getBestCircadianHour = (
  db: SQLite.SQLiteDatabase
): CircadianPatternRecord | null => {
  const result = db.getFirstSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns WHERE session_count >= 3 ORDER BY avg_theta_mean DESC LIMIT 1'
  );
  return result || null;
};

/**
 * Recalculates circadian patterns from session history
 * Aggregates all sessions by hour of day and updates the circadian_patterns table
 */
export const recalculateCircadianPatterns = (
  db: SQLite.SQLiteDatabase
): void => {
  // Clear existing patterns
  deleteAllCircadianPatterns(db);

  // Get all sessions
  const sessions = getAllSessions(db);

  // Group sessions by hour
  const hourlyData: Map<
    number,
    {
      theta_sum: number;
      theta_sq_sum: number;
      rating_sum: number;
      rating_count: number;
      count: number;
    }
  > = new Map();

  for (const session of sessions) {
    const date = new Date(session.start_time);
    const hour = date.getHours();

    const existing = hourlyData.get(hour) || {
      theta_sum: 0,
      theta_sq_sum: 0,
      rating_sum: 0,
      rating_count: 0,
      count: 0,
    };

    existing.theta_sum += session.avg_theta_zscore;
    existing.theta_sq_sum += session.avg_theta_zscore * session.avg_theta_zscore;
    existing.count += 1;

    if (session.subjective_rating !== null) {
      existing.rating_sum += session.subjective_rating;
      existing.rating_count += 1;
    }

    hourlyData.set(hour, existing);
  }

  // Calculate and insert patterns for each hour
  for (const [hour, data] of hourlyData) {
    const avg_theta_mean = data.theta_sum / data.count;
    const variance =
      data.theta_sq_sum / data.count - avg_theta_mean * avg_theta_mean;
    const avg_theta_std = Math.sqrt(Math.max(0, variance));
    const avg_subjective_rating =
      data.rating_count > 0 ? data.rating_sum / data.rating_count : null;

    upsertCircadianPattern(db, {
      hour_of_day: hour,
      avg_theta_mean,
      avg_theta_std,
      session_count: data.count,
      avg_subjective_rating,
    });
  }
};