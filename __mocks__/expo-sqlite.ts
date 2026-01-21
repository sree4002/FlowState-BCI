/**
 * Mock implementation of expo-sqlite for testing
 * Provides in-memory SQLite database for unit tests
 */

interface MockResult {
  lastInsertRowId: number;
  changes: number;
}

export interface SQLiteDatabase {
  execSync(query: string): void;
  runSync(query: string, params?: unknown[]): MockResult;
  getFirstSync<T>(query: string, params?: unknown[]): T | null;
  getAllSync<T>(query: string, params?: unknown[]): T[];
}

// In-memory storage for test database
let tables: Map<string, Map<number, Record<string, unknown>>> = new Map();
let autoIncrementCounters: Map<string, number> = new Map();

/**
 * Resets the mock database state
 */
export const resetMockDatabase = (): void => {
  tables = new Map();
  autoIncrementCounters = new Map();
};

/**
 * Parse SQL CREATE TABLE statement
 */
const parseCreateTable = (sql: string): void => {
  const match = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
  if (match) {
    const tableName = match[1];
    if (!tables.has(tableName)) {
      tables.set(tableName, new Map());
      autoIncrementCounters.set(tableName, 0);
    }
  }
};

/**
 * Parse SQL DROP TABLE statement
 */
const parseDropTable = (sql: string): void => {
  const match = sql.match(/DROP TABLE IF EXISTS (\w+)/i);
  if (match) {
    const tableName = match[1];
    tables.delete(tableName);
    autoIncrementCounters.delete(tableName);
  }
};

/**
 * Parse SQL INSERT statement
 */
const parseInsert = (
  sql: string,
  params: unknown[]
): { tableName: string; row: Record<string, unknown> } => {
  const match = sql.match(/INSERT INTO (\w+)\s*\((.*?)\)\s*VALUES/i);
  if (!match) {
    throw new Error('Invalid INSERT statement');
  }

  const tableName = match[1];
  const columns = match[2].split(',').map((col) => col.trim());

  const row: Record<string, unknown> = {};
  columns.forEach((col, idx) => {
    row[col] = params[idx];
  });

  return { tableName, row };
};

/**
 * Parse SQL SELECT statement
 */
const parseSelect = (
  sql: string
): {
  tableName: string;
  isCount: boolean;
  orderBy: string | null;
  limit: number | null;
  where: string | null;
} => {
  let tableName = '';
  let isCount = false;
  let orderBy: string | null = null;
  let limit: number | null = null;
  let where: string | null = null;

  // Extract table name
  const tableMatch = sql.match(/FROM (\w+)/i);
  if (tableMatch) {
    tableName = tableMatch[1];
  }

  // Check if it's a COUNT query
  if (sql.match(/SELECT COUNT\(\*\)/i)) {
    isCount = true;
  }

  // Extract ORDER BY
  const orderMatch = sql.match(/ORDER BY (.*?)(?:LIMIT|$)/i);
  if (orderMatch) {
    orderBy = orderMatch[1].trim();
  }

  // Extract LIMIT
  const limitMatch = sql.match(/LIMIT (\d+)/i);
  if (limitMatch) {
    limit = parseInt(limitMatch[1]);
  }

  // Extract WHERE
  const whereMatch = sql.match(/WHERE (.*?)(?:ORDER BY|LIMIT|$)/i);
  if (whereMatch) {
    where = whereMatch[1].trim();
  }

  return { tableName, isCount, orderBy, limit, where };
};

/**
 * Filter rows based on WHERE clause
 */
const filterRows = (
  rows: Record<string, unknown>[],
  where: string | null,
  params: unknown[]
): Record<string, unknown>[] => {
  if (!where) return rows;

  // Simple WHERE id = ? parsing
  if (where.match(/^id\s*=\s*\?$/i)) {
    const id = params[0] as number;
    return rows.filter((row) => row.id === id);
  }

  // WHERE session_type = ?
  if (where.match(/session_type\s*=\s*\?/i)) {
    const sessionType = params[0] as string;
    return rows.filter((row) => row.session_type === sessionType);
  }

  // WHERE hour_of_day = ?
  if (where.match(/hour_of_day\s*=\s*\?/i)) {
    const hourOfDay = params[0] as number;
    return rows.filter((row) => row.hour_of_day === hourOfDay);
  }

  // WHERE start_time >= ? AND start_time <= ?
  if (where.match(/start_time\s*>=\s*\?\s*AND\s*start_time\s*<=\s*\?/i)) {
    const startTime = params[0] as number;
    const endTime = params[1] as number;
    return rows.filter((row) => {
      const rowStartTime = row.start_time as number;
      return rowStartTime >= startTime && rowStartTime <= endTime;
    });
  }

  // WHERE session_count >= ? (used with ORDER BY)
  if (where.match(/session_count\s*>=\s*(\d+)/i)) {
    const match = where.match(/session_count\s*>=\s*(\d+)/i);
    const minCount = parseInt(match![1]);
    return rows.filter((row) => (row.session_count as number) >= minCount);
  }

  return rows;
};

/**
 * Sort rows based on ORDER BY clause
 */
const sortRows = (
  rows: Record<string, unknown>[],
  orderBy: string | null
): Record<string, unknown>[] => {
  if (!orderBy) return rows;

  const parts = orderBy.split(/\s+/);
  const field = parts[0];
  const direction = parts[1]?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  return [...rows].sort((a, b) => {
    const aVal = a[field] as number;
    const bVal = b[field] as number;
    if (direction === 'ASC') {
      return aVal > bVal ? 1 : -1;
    } else {
      return aVal < bVal ? 1 : -1;
    }
  });
};

/**
 * Parse SQL UPDATE statement
 */
const parseUpdate = (
  sql: string,
  params: unknown[]
): {
  tableName: string;
  updates: Record<string, unknown>;
  whereField: string;
  whereValue: number;
} => {
  // Support both id = ? and hour_of_day = ? WHERE clauses
  const matchById = sql.match(/UPDATE (\w+)\s+SET (.*?) WHERE id = \?/is);
  const matchByHour = sql.match(
    /UPDATE (\w+)\s+SET (.*?) WHERE hour_of_day = \?/is
  );

  const match = matchById || matchByHour;
  if (!match) {
    throw new Error('Invalid UPDATE statement');
  }

  const tableName = match[1];
  const setClause = match[2];
  const whereField = matchByHour ? 'hour_of_day' : 'id';

  const updates: Record<string, unknown> = {};
  // Parse SET clause more carefully - split by comma but handle strftime expressions
  const setParts: string[] = [];
  let current = '';
  let parenDepth = 0;
  for (const char of setClause) {
    if (char === '(') parenDepth++;
    if (char === ')') parenDepth--;
    if (char === ',' && parenDepth === 0) {
      setParts.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) setParts.push(current.trim());

  let paramIdx = 0;
  setParts.forEach((part) => {
    const [field] = part.trim().split('=');
    const fieldName = field.trim();
    // Skip fields that use SQL functions like strftime
    if (!part.includes('strftime')) {
      updates[fieldName] = params[paramIdx];
      paramIdx++;
    }
  });

  const whereValue = params[params.length - 1] as number;

  return { tableName, updates, whereField, whereValue };
};

/**
 * Parse SQL DELETE statement
 */
const parseDelete = (
  sql: string,
  params: unknown[]
): { tableName: string; whereField?: string; whereValue?: number } => {
  const match = sql.match(/DELETE FROM (\w+)/i);
  if (!match) {
    throw new Error('Invalid DELETE statement');
  }

  const tableName = match[1];

  // Check for WHERE clause
  if (sql.match(/WHERE id = \?/i)) {
    return { tableName, whereField: 'id', whereValue: params[0] as number };
  }
  if (sql.match(/WHERE hour_of_day = \?/i)) {
    return {
      tableName,
      whereField: 'hour_of_day',
      whereValue: params[0] as number,
    };
  }

  return { tableName };
};

/**
 * Mock SQLite database implementation
 */
class MockSQLiteDatabase implements SQLiteDatabase {
  execSync(query: string): void {
    if (query.match(/CREATE TABLE/i)) {
      parseCreateTable(query);
    } else if (query.match(/DROP TABLE/i)) {
      parseDropTable(query);
    }
  }

  runSync(query: string, params: unknown[] = []): MockResult {
    if (query.match(/INSERT INTO/i)) {
      const { tableName, row } = parseInsert(query, params);
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      const counter = (autoIncrementCounters.get(tableName) || 0) + 1;
      autoIncrementCounters.set(tableName, counter);

      const fullRow = {
        id: counter,
        ...row,
        created_at: Math.floor(Date.now() / 1000),
      };
      table.set(counter, fullRow);

      return { lastInsertRowId: counter, changes: 1 };
    } else if (query.match(/UPDATE/i)) {
      const { tableName, updates, whereField, whereValue } = parseUpdate(
        query,
        params
      );
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      // Find the row to update based on whereField
      let foundRow: Record<string, unknown> | undefined;
      for (const row of table.values()) {
        if (row[whereField] === whereValue) {
          foundRow = row;
          break;
        }
      }

      if (foundRow) {
        Object.assign(foundRow, updates);
        return { lastInsertRowId: 0, changes: 1 };
      }
      return { lastInsertRowId: 0, changes: 0 };
    } else if (query.match(/DELETE FROM/i)) {
      const { tableName, whereField, whereValue } = parseDelete(query, params);
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      if (whereField !== undefined && whereValue !== undefined) {
        // Find and delete row by whereField
        let deletedId: number | null = null;
        for (const [id, row] of table.entries()) {
          if (row[whereField] === whereValue) {
            deletedId = id;
            break;
          }
        }
        if (deletedId !== null) {
          table.delete(deletedId);
          return { lastInsertRowId: 0, changes: 1 };
        }
        return { lastInsertRowId: 0, changes: 0 };
      } else {
        const count = table.size;
        table.clear();
        return { lastInsertRowId: 0, changes: count };
      }
    }

    return { lastInsertRowId: 0, changes: 0 };
  }

  getFirstSync<T>(query: string, params: unknown[] = []): T | null {
    // Handle sqlite_master queries
    if (query.match(/sqlite_master/i)) {
      const tableMatch = query.match(/name='(\w+)'/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        return { count: tables.has(tableName) ? 1 : 0 } as T;
      }
    }

    // Handle aggregate queries (SUM, AVG, COUNT)
    if (query.match(/SELECT\s+COUNT\(\*\)|SUM\(|AVG\(/i)) {
      const tableMatch = query.match(/FROM (\w+)/i);
      if (!tableMatch) return null;
      const tableName = tableMatch[1];
      const table = tables.get(tableName);
      if (!table) {
        return {
          total_sessions: 0,
          total_duration_seconds: 0,
          avg_theta_zscore: 0,
          avg_signal_quality: 0,
          avg_subjective_rating: null,
          count: 0,
        } as T;
      }

      let rows = Array.from(table.values()) as Record<string, unknown>[];

      // Apply WHERE clause if present
      const { where } = parseSelect(query);
      rows = filterRows(rows, where, params);

      // Handle simple COUNT
      if (query.match(/SELECT COUNT\(\*\) as count/i)) {
        return { count: rows.length } as T;
      }

      // Handle aggregate session stats
      if (query.match(/total_sessions|total_duration_seconds/i)) {
        const totalSessions = rows.length;
        const totalDuration = rows.reduce(
          (sum, r) => sum + ((r.duration_seconds as number) || 0),
          0
        );
        const avgTheta =
          totalSessions > 0
            ? rows.reduce(
                (sum, r) => sum + ((r.avg_theta_zscore as number) || 0),
                0
              ) / totalSessions
            : 0;
        const avgSignal =
          totalSessions > 0
            ? rows.reduce(
                (sum, r) => sum + ((r.signal_quality_avg as number) || 0),
                0
              ) / totalSessions
            : 0;
        const ratingsRows = rows.filter((r) => r.subjective_rating !== null);
        const avgRating =
          ratingsRows.length > 0
            ? ratingsRows.reduce(
                (sum, r) => sum + ((r.subjective_rating as number) || 0),
                0
              ) / ratingsRows.length
            : null;

        return {
          total_sessions: totalSessions,
          total_duration_seconds: totalDuration,
          avg_theta_zscore: avgTheta,
          avg_signal_quality: avgSignal,
          avg_subjective_rating: avgRating,
        } as T;
      }

      return { count: rows.length } as T;
    }

    const { tableName, isCount, orderBy, where } = parseSelect(query);

    if (isCount) {
      const table = tables.get(tableName);
      if (!table) return { count: 0 } as T;
      return { count: table.size } as T;
    }

    const table = tables.get(tableName);
    if (!table || table.size === 0) return null;

    let rows = Array.from(table.values()) as Record<string, unknown>[];
    rows = filterRows(rows, where, params);
    rows = sortRows(rows, orderBy);

    return rows.length > 0 ? (rows[0] as T) : null;
  }

  getAllSync<T>(query: string, params: unknown[] = []): T[] {
    // Handle PRAGMA queries
    if (query.match(/PRAGMA/i)) {
      const match = query.match(/PRAGMA table_info\((\w+)\)/i);
      if (match) {
        const tableName = match[1];
        if (tableName === 'baselines') {
          return [
            { name: 'id', pk: 1 },
            { name: 'theta_mean', pk: 0 },
            { name: 'theta_std', pk: 0 },
            { name: 'alpha_mean', pk: 0 },
            { name: 'beta_mean', pk: 0 },
            { name: 'peak_theta_freq', pk: 0 },
            { name: 'optimal_freq', pk: 0 },
            { name: 'calibration_timestamp', pk: 0 },
            { name: 'quality_score', pk: 0 },
            { name: 'created_at', pk: 0 },
          ] as T[];
        }
        if (tableName === 'sessions') {
          return [
            { name: 'id', pk: 1 },
            { name: 'session_type', pk: 0 },
            { name: 'start_time', pk: 0 },
            { name: 'end_time', pk: 0 },
            { name: 'duration_seconds', pk: 0 },
            { name: 'avg_theta_zscore', pk: 0 },
            { name: 'max_theta_zscore', pk: 0 },
            { name: 'entrainment_freq', pk: 0 },
            { name: 'volume', pk: 0 },
            { name: 'signal_quality_avg', pk: 0 },
            { name: 'subjective_rating', pk: 0 },
            { name: 'notes', pk: 0 },
            { name: 'created_at', pk: 0 },
          ] as T[];
        }
        if (tableName === 'circadian_patterns') {
          return [
            { name: 'id', pk: 1 },
            { name: 'hour_of_day', pk: 0 },
            { name: 'avg_theta_mean', pk: 0 },
            { name: 'avg_theta_std', pk: 0 },
            { name: 'session_count', pk: 0 },
            { name: 'avg_subjective_rating', pk: 0 },
            { name: 'created_at', pk: 0 },
            { name: 'updated_at', pk: 0 },
          ] as T[];
        }
      }
      return [];
    }

    const { tableName, orderBy, limit, where } = parseSelect(query);
    const table = tables.get(tableName);
    if (!table) return [];

    let rows = Array.from(table.values()) as Record<string, unknown>[];
    rows = filterRows(rows, where, params);
    rows = sortRows(rows, orderBy);

    if (limit !== null) {
      rows = rows.slice(0, limit);
    }

    return rows as T[];
  }
}

/**
 * Opens or creates a mock SQLite database
 */
export const openDatabaseSync = (_name: string): SQLiteDatabase => {
  return new MockSQLiteDatabase();
};

// Export for testing utilities
export { resetMockDatabase as __resetMockDatabase };
