import * as SQLite from 'expo-sqlite';

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
 * Creates the circadian_patterns table if it doesn't exist
 * Stores aggregated theta statistics by hour of day for circadian rhythm analysis
 */
export const createCircadianPatternsTable = (
  db: SQLite.SQLiteDatabase
): void => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS circadian_patterns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hour_of_day INTEGER NOT NULL CHECK (hour_of_day >= 0 AND hour_of_day <= 23),
      avg_theta_mean REAL NOT NULL,
      avg_theta_std REAL NOT NULL,
      session_count INTEGER NOT NULL DEFAULT 0,
      avg_subjective_rating REAL,
      created_at INTEGER DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER DEFAULT (strftime('%s', 'now')),
      UNIQUE(hour_of_day)
    );
  `);
};

/**
 * Initializes all database tables
 * Should be called on app startup
 */
export const initializeDatabase = (): SQLite.SQLiteDatabase => {
  const db = openDatabase();
  createBaselinesTable(db);
  createCircadianPatternsTable(db);
  return db;
};

/**
 * Drops all tables (use with caution - for testing/development only)
 */
export const dropAllTables = (db: SQLite.SQLiteDatabase): void => {
  db.execSync('DROP TABLE IF EXISTS baselines;');
  db.execSync('DROP TABLE IF EXISTS circadian_patterns;');
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
// Circadian Patterns CRUD Operations
// ============================================================================

/**
 * Inserts or updates a circadian pattern record for a specific hour
 * Uses UPSERT (INSERT OR REPLACE) since hour_of_day is unique
 * @returns The ID of the inserted/updated record
 */
export const upsertCircadianPattern = (
  db: SQLite.SQLiteDatabase,
  pattern: Omit<CircadianPatternRecord, 'id' | 'created_at' | 'updated_at'>
): number => {
  const result = db.runSync(
    `INSERT INTO circadian_patterns
     (hour_of_day, avg_theta_mean, avg_theta_std, session_count, avg_subjective_rating, updated_at)
     VALUES (?, ?, ?, ?, ?, strftime('%s', 'now'))
     ON CONFLICT(hour_of_day) DO UPDATE SET
       avg_theta_mean = excluded.avg_theta_mean,
       avg_theta_std = excluded.avg_theta_std,
       session_count = excluded.session_count,
       avg_subjective_rating = excluded.avg_subjective_rating,
       updated_at = strftime('%s', 'now')`,
    [
      pattern.hour_of_day,
      pattern.avg_theta_mean,
      pattern.avg_theta_std,
      pattern.session_count,
      pattern.avg_subjective_rating,
    ]
  );
  return result.lastInsertRowId;
};

/**
 * Retrieves a circadian pattern by hour of day
 * @returns The pattern record or null if none exists for that hour
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
 * Retrieves all circadian patterns ordered by hour of day
 */
export const getAllCircadianPatterns = (
  db: SQLite.SQLiteDatabase
): CircadianPatternRecord[] => {
  return db.getAllSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns ORDER BY hour_of_day ASC'
  );
};

/**
 * Retrieves circadian patterns for a range of hours (inclusive)
 * Useful for analyzing specific time periods (e.g., morning hours 6-11)
 */
export const getCircadianPatternsByHourRange = (
  db: SQLite.SQLiteDatabase,
  startHour: number,
  endHour: number
): CircadianPatternRecord[] => {
  return db.getAllSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns WHERE hour_of_day >= ? AND hour_of_day <= ? ORDER BY hour_of_day ASC',
    [startHour, endHour]
  );
};

/**
 * Updates an existing circadian pattern by ID
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

  // Always update the updated_at timestamp
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
 * Deletes a circadian pattern by hour of day
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
 * Deletes all circadian pattern records
 */
export const deleteAllCircadianPatterns = (db: SQLite.SQLiteDatabase): void => {
  db.runSync('DELETE FROM circadian_patterns');
};

/**
 * Gets the count of circadian pattern records in the database
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
 * Gets the hour with the highest average theta mean
 * Useful for identifying peak focus times
 */
export const getPeakThetaHour = (
  db: SQLite.SQLiteDatabase
): CircadianPatternRecord | null => {
  const result = db.getFirstSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns ORDER BY avg_theta_mean DESC LIMIT 1'
  );
  return result || null;
};

/**
 * Gets hours with sufficient session data (minimum session count threshold)
 * Useful for filtering out hours with unreliable data
 */
export const getCircadianPatternsWithMinSessions = (
  db: SQLite.SQLiteDatabase,
  minSessions: number
): CircadianPatternRecord[] => {
  return db.getAllSync<CircadianPatternRecord>(
    'SELECT * FROM circadian_patterns WHERE session_count >= ? ORDER BY hour_of_day ASC',
    [minSessions]
  );
};
