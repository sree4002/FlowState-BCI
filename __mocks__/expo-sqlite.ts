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
let tables: Map<
  string,
  Map<number | string, Record<string, unknown>>
> = new Map();
let autoIncrementCounters: Map<string, number> = new Map();
let indexes: Set<string> = new Set();
let tableSchemas: Map<string, string> = new Map(); // Store original CREATE TABLE SQL

/**
 * Resets the mock database state
 */
export const resetMockDatabase = (): void => {
  tables = new Map();
  autoIncrementCounters = new Map();
  indexes = new Set();
  tableSchemas = new Map();
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
      tableSchemas.set(tableName, sql);
    }
  }
};

/**
 * Parse SQL CREATE INDEX statement
 */
const parseCreateIndex = (sql: string): void => {
  const match = sql.match(/CREATE INDEX IF NOT EXISTS (\w+)/i);
  if (match) {
    indexes.add(match[1]);
  }
};

/**
 * Parse SQL DROP INDEX statement
 */
const parseDropIndex = (sql: string): void => {
  const match = sql.match(/DROP INDEX IF EXISTS (\w+)/i);
  if (match) {
    indexes.delete(match[1]);
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
    tableSchemas.delete(tableName);
  }
};

/**
 * Parse SQL INSERT statement
 */
const parseInsert = (
  sql: string,
  params: unknown[]
): { tableName: string; row: Record<string, unknown> } => {
  // Normalize whitespace for multiline SQL
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();
  const match = normalizedSql.match(
    /INSERT INTO (\w+)\s*\((.*?)\)\s*VALUES\s*\((.*?)\)/i
  );
  if (!match) {
    throw new Error('Invalid INSERT statement');
  }

  const tableName = match[1];
  const columns = match[2].split(',').map((col) => col.trim());
  const valuesStr = match[3];

  // Extract VALUES clause to check which columns use placeholders vs expressions
  const valuesMatch = normalizedSql.match(
    /VALUES\s*\((.*?)\)(?:\s*ON CONFLICT|\s*$)/is
  );
  let valuePlaceholders: string[] = [];
  if (valuesMatch) {
    valuePlaceholders = valuesMatch[1].split(',').map((v) => v.trim());
  }

  const row: Record<string, unknown> = {};

  // If we have params, use them. Otherwise, parse literal values from SQL
  if (params.length > 0) {
    columns.forEach((col, idx) => {
      row[col] = params[idx];
    });
  } else {
    // Parse literal values from VALUES clause
    const literalValues = valuesStr.split(',').map((v) => {
      const trimmed = v.trim();
      // Handle string literals
      if (trimmed.startsWith("'") && trimmed.endsWith("'")) {
        return trimmed.slice(1, -1);
      }
      // Handle numbers
      const num = parseFloat(trimmed);
      if (!isNaN(num)) {
        return num;
      }
      // Handle NULL
      if (trimmed.toUpperCase() === 'NULL') {
        return null;
      }
      return trimmed;
    });
    columns.forEach((col, idx) => {
      row[col] = literalValues[idx];
    });
  }

  // Check for ON CONFLICT clause
  const conflictMatch = normalizedSql.match(/ON CONFLICT\((\w+)\)/i);
  let onConflictField: string | undefined;
  let updateFields: string[] | undefined;

  if (conflictMatch) {
    onConflictField = conflictMatch[1];

    // Parse DO UPDATE SET fields
    // We want to extract field names that use "excluded.field" as the value source
    // E.g., "field = excluded.field" means update that field with the new value
    const updateMatch = normalizedSql.match(/DO UPDATE SET\s+(.*?)(?:$)/i);
    if (updateMatch) {
      const updateClause = updateMatch[1];
      // Extract field names from "field = excluded.field" patterns (not strftime or other expressions)
      const excludedFieldMatches = updateClause.match(
        /(\w+)\s*=\s*excluded\.\w+/gi
      );
      if (excludedFieldMatches) {
        updateFields = excludedFieldMatches.map(
          (m) => m.split('=')[0].trim() as string
        );
      }
    }
  }

  return { tableName, row, onConflictField, updateFields };
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

  // Handle compound WHERE conditions (e.g., "field >= ? AND field <= ?")
  if (where.match(/(\w+)\s*>=\s*\?\s*AND\s*(\w+)\s*<=\s*\?/i)) {
    const match = where.match(/(\w+)\s*>=\s*\?\s*AND\s*(\w+)\s*<=\s*\?/i)!;
    const field1 = match[1];
    const min = params[0] as number;
    const max = params[1] as number;
    return rows.filter((row) => {
      const val = row[field1] as number;
      return val >= min && val <= max;
    });
  }

  // Handle "field >= ?" condition with placeholder
  if (where.match(/(\w+)\s*>=\s*\?/i)) {
    const match = where.match(/(\w+)\s*>=\s*\?/i)!;
    const field = match[1];
    const val = params[0] as number;
    return rows.filter((row) => (row[field] as number) >= val);
  }

  // Handle "field >= literal_number" condition (no placeholder)
  const literalGeMatch = where.match(/(\w+)\s*>=\s*(\d+)/i);
  if (literalGeMatch) {
    const field = literalGeMatch[1];
    const val = parseInt(literalGeMatch[2], 10);
    return rows.filter((row) => (row[field] as number) >= val);
  }

  // Simple WHERE id = ? parsing
  if (where.match(/^id\s*=\s*\?$/i)) {
    const id = params[0] as number;
    return rows.filter((row) => row.id === id);
  }

  // WHERE version = ? parsing
  if (where.match(/version\s*=\s*\?/i)) {
    const version = params[0] as number;
    return rows.filter((row) => row.version === version);
  }

  // WHERE hour_of_day = ? parsing
  if (where.match(/hour_of_day\s*=\s*\?/i)) {
    const hourOfDay = params[0] as number;
    return rows.filter((row) => row.hour_of_day === hourOfDay);
  }

  // Generic WHERE field = ? parsing for any single field
  const genericMatch = where.match(/^(\w+)\s*=\s*\?$/i);
  if (genericMatch) {
    const field = genericMatch[1];
    const value = params[0];
    return rows.filter((row) => row[field] === value);
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
): { tableName: string; key?: number | string; keyField?: string } => {
  const match = sql.match(/DELETE FROM (\w+)/i);
  if (!match) {
    throw new Error('Invalid DELETE statement');
  }

  const tableName = match[1];

  // Check for WHERE clause
  if (sql.match(/WHERE\s+id\s*=\s*\?/i)) {
    return { tableName, key: params[0] as number, keyField: 'id' };
  } else if (sql.match(/WHERE\s+version\s*=\s*\?/i)) {
    return { tableName, key: params[0] as number, keyField: 'version' };
  } else if (sql.match(/WHERE\s+hour_of_day\s*=\s*\?/i)) {
    return { tableName, key: params[0] as number, keyField: 'hour_of_day' };
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
    } else if (query.match(/CREATE INDEX/i)) {
      parseCreateIndex(query);
    } else if (query.match(/DROP INDEX/i)) {
      parseDropIndex(query);
    }
  }

  runSync(query: string, params: unknown[] = []): MockResult {
    if (query.match(/INSERT INTO/i)) {
      const { tableName, row, onConflictField, updateFields } = parseInsert(
        query,
        params
      );
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      // Check table schema for primary key
      const schema = tableSchemas.get(tableName) || '';
      const hasPrimaryKeyVersion = schema.match(/version\s+INTEGER\s+PRIMARY/i);
      const hasPrimaryKeyHour = schema.match(
        /hour_of_day\s+INTEGER\s+PRIMARY/i
      );

      let key: number | string;
      let fullRow: Record<string, unknown>;

      if (hasPrimaryKeyVersion && row.version !== undefined) {
        // Use version as primary key
        key = row.version as number;

        // Check constraint for hour_of_day if applicable
        if (row.hour_of_day !== undefined) {
          const hour = row.hour_of_day as number;
          if (hour < 0 || hour > 23) {
            throw new Error('CHECK constraint failed: hour_of_day');
          }
        }

        fullRow = {
          ...row,
          applied_at: Math.floor(Date.now() / 1000),
        };
      } else if (
        (hasPrimaryKeyHour || tableName === 'circadian_patterns') &&
        row.hour_of_day !== undefined
      ) {
        // Use hour_of_day as primary key
        const hour = row.hour_of_day as number;
        if (hour < 0 || hour > 23) {
          throw new Error('CHECK constraint failed: hour_of_day');
        }
        key = hour;
        fullRow = {
          ...row,
          updated_at: Math.floor(Date.now() / 1000),
        };
      } else {
        // Auto-increment id
        const counter = (autoIncrementCounters.get(tableName) || 0) + 1;
        autoIncrementCounters.set(tableName, counter);
        key = counter;

        // Check session_type constraint for sessions table
        if (tableName === 'sessions' && row.session_type) {
          const validTypes = [
            'calibration',
            'quick_boost',
            'custom',
            'scheduled',
            'sham',
          ];
          if (!validTypes.includes(row.session_type as string)) {
            throw new Error('CHECK constraint failed: session_type');
          }
        }

        fullRow = {
          id: counter,
          ...row,
          created_at: Math.floor(Date.now() / 1000),
        };
      }

      table.set(key, fullRow);

      return {
        lastInsertRowId: typeof key === 'number' ? key : 0,
        changes: 1,
      };
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
      const { tableName, key, keyField } = parseDelete(query, params);
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      if (key !== undefined && keyField) {
        // Delete by specific key field
        let existed = false;
        if (keyField === 'version' || keyField === 'hour_of_day') {
          // For tables using version or hour_of_day as PK
          existed = table.has(key);
          table.delete(key);
        } else {
          // For id-based deletes
          existed = table.has(key);
          table.delete(key);
        }
        return { lastInsertRowId: 0, changes: existed ? 1 : 0 };
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

    // Handle MAX() queries
    const maxMatch = query.match(/SELECT MAX\((\w+)\) as (\w+) FROM (\w+)/i);
    if (maxMatch) {
      const [, field, alias, tableName] = maxMatch;
      const table = tables.get(tableName);
      if (!table || table.size === 0) {
        return { [alias]: null } as T;
      }
      const rows = Array.from(table.values()) as Record<string, unknown>[];
      const maxVal = Math.max(
        ...rows.map((r) => (r[field] as number) ?? -Infinity)
      );
      return { [alias]: maxVal === -Infinity ? null : maxVal } as T;
    }

    // Handle aggregate stats queries (COUNT, SUM, AVG)
    if (query.match(/SELECT\s+.*COUNT\(\*\).*SUM\(/is)) {
      const tableMatch = query.match(/FROM\s+(\w+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = tables.get(tableName);
        if (!table || table.size === 0) {
          return {
            total_sessions: 0,
            total_duration_seconds: 0,
            avg_theta_zscore: 0,
            avg_signal_quality: 0,
            avg_subjective_rating: null,
          } as T;
        }

        const rows = Array.from(table.values()) as Record<string, unknown>[];
        const total_sessions = rows.length;
        const total_duration_seconds = rows.reduce(
          (sum, r) => sum + ((r.duration_seconds as number) || 0),
          0
        );
        const avg_theta_zscore =
          total_sessions > 0
            ? rows.reduce(
                (sum, r) => sum + ((r.avg_theta_zscore as number) || 0),
                0
              ) / total_sessions
            : 0;
        const avg_signal_quality =
          total_sessions > 0
            ? rows.reduce(
                (sum, r) => sum + ((r.signal_quality_avg as number) || 0),
                0
              ) / total_sessions
            : 0;
        const ratingsWithValue = rows.filter(
          (r) => r.subjective_rating !== null && r.subjective_rating !== undefined
        );
        const avg_subjective_rating =
          ratingsWithValue.length > 0
            ? ratingsWithValue.reduce(
                (sum, r) => sum + (r.subjective_rating as number),
                0
              ) / ratingsWithValue.length
            : null;

        return {
          total_sessions,
          total_duration_seconds,
          avg_theta_zscore,
          avg_signal_quality,
          avg_subjective_rating,
        } as T;
      }
    }

    const { tableName, isCount, orderBy, where } = parseSelect(query);

    if (isCount) {
      const table = tables.get(tableName);
      if (!table) return { count: 0 } as T;

      // Handle filtered count
      if (where) {
        let rows = Array.from(table.values()) as Record<string, unknown>[];
        rows = filterRows(rows, where, params);
        return { count: rows.length } as T;
      }

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
        if (tableName === 'schema_migrations') {
          return [
            { name: 'version', pk: 1 },
            { name: 'name', pk: 0 },
            { name: 'applied_at', pk: 0 },
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
            { name: 'hour_of_day', pk: 1 },
            { name: 'avg_theta_mean', pk: 0 },
            { name: 'avg_theta_std', pk: 0 },
            { name: 'session_count', pk: 0 },
            { name: 'avg_subjective_rating', pk: 0 },
            { name: 'updated_at', pk: 0 },
          ] as T[];
        }
      }
      return [];
    }

    // Handle sqlite_master queries for indexes
    if (query.match(/sqlite_master/i) && query.match(/type='index'/i)) {
      const tblMatch = query.match(/tbl_name='(\w+)'/i);
      if (tblMatch) {
        const tblName = tblMatch[1];
        const result: { name: string }[] = [];
        indexes.forEach((indexName) => {
          if (indexName.includes(tblName)) {
            result.push({ name: indexName });
          }
        });
        return result as T[];
      }
    }

    // Handle sqlite_master queries for tables (without type filter)
    if (query.match(/sqlite_master/i) && query.match(/type='table'/i)) {
      const result: { name: string }[] = [];
      tables.forEach((_, tableName) => {
        if (!tableName.startsWith('sqlite_')) {
          result.push({ name: tableName });
        }
      });
      return result as T[];
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
