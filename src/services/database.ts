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
 * Initializes all database tables
 * Should be called on app startup
 */
export const initializeDatabase = (): SQLite.SQLiteDatabase => {
  const db = openDatabase();
  createBaselinesTable(db);
  return db;
};

/**
 * Drops all tables (use with caution - for testing/development only)
 */
export const dropAllTables = (db: SQLite.SQLiteDatabase): void => {
  db.execSync('DROP TABLE IF EXISTS baselines;');
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
