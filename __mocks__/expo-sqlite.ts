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
): {
  tableName: string;
  row: Record<string, unknown>;
  onConflictField?: string;
  updateFields?: string[];
} => {
  // Normalize whitespace in SQL for easier parsing
  const normalizedSql = sql.replace(/\s+/g, ' ').trim();

  const match = normalizedSql.match(/INSERT INTO (\w+)\s*\((.*?)\)\s*VALUES/i);
  if (!match) {
    throw new Error('Invalid INSERT statement');
  }

  const tableName = match[1];
  const columns = match[2].split(',').map((col) => col.trim());

  // Extract VALUES clause to check which columns use placeholders vs expressions
  const valuesMatch = normalizedSql.match(
    /VALUES\s*\((.*?)\)(?:\s*ON CONFLICT|\s*$)/is
  );
  let valuePlaceholders: string[] = [];
  if (valuesMatch) {
    valuePlaceholders = valuesMatch[1].split(',').map((v) => v.trim());
  }

  const row: Record<string, unknown> = {};
  let paramIdx = 0;
  columns.forEach((col, colIdx) => {
    // Only use params for columns that use '?' placeholders
    const valuePart = valuePlaceholders[colIdx] || '';
    if (valuePart === '?') {
      row[col] = params[paramIdx];
      paramIdx++;
    }
    // Skip columns that use expressions like strftime(...)
  });

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

  // Handle "field >= ?" condition
  if (where.match(/(\w+)\s*>=\s*\?/i)) {
    const match = where.match(/(\w+)\s*>=\s*\?/i)!;
    const field = match[1];
    const val = params[0] as number;
    return rows.filter((row) => (row[field] as number) >= val);
  }

  // Simple WHERE id = ? parsing
  if (where.match(/id\s*=\s*\?/i)) {
    const id = params[0] as number;
    return rows.filter((row) => row.id === id);
  }

  // Simple WHERE field = ? parsing
  const fieldMatch = where.match(/(\w+)\s*=\s*\?/i);
  if (fieldMatch) {
    const field = fieldMatch[1];
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
): { tableName: string; updates: Record<string, unknown>; id: number } => {
  const match = sql.match(/UPDATE (\w+) SET (.*?) WHERE id = \?/i);
  if (!match) {
    throw new Error('Invalid UPDATE statement');
  }

  const tableName = match[1];
  const setClause = match[2];

  const updates: Record<string, unknown> = {};
  const setParts = setClause.split(',');
  setParts.forEach((part, idx) => {
    const [field] = part.trim().split('=');
    updates[field.trim()] = params[idx];
  });

  const id = params[params.length - 1] as number;

  return { tableName, updates, id };
};

/**
 * Parse SQL DELETE statement
 */
const parseDelete = (
  sql: string,
  params: unknown[]
): { tableName: string; id?: number; field?: string; value?: unknown } => {
  const match = sql.match(/DELETE FROM (\w+)/i);
  if (!match) {
    throw new Error('Invalid DELETE statement');
  }

  const tableName = match[1];

  // Check for WHERE clause with specific field
  const whereMatch = sql.match(/WHERE (\w+)\s*=\s*\?/i);
  if (whereMatch && params.length > 0) {
    const field = whereMatch[1];
    if (field === 'id') {
      return { tableName, id: params[0] as number };
    }
    return { tableName, field, value: params[0] };
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
      const { tableName, row, onConflictField, updateFields } = parseInsert(
        query,
        params
      );
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      // Handle ON CONFLICT (upsert)
      if (onConflictField) {
        const conflictValue = row[onConflictField];
        // Find existing row with same conflict field value
        let existingRowId: number | null = null;
        let existingRow: Record<string, unknown> | null = null;
        table.forEach((r, id) => {
          if (r[onConflictField] === conflictValue) {
            existingRowId = id;
            existingRow = r;
          }
        });

        if (existingRow && existingRowId !== null) {
          // Update existing row
          if (updateFields) {
            for (const field of updateFields) {
              if (field in row) {
                existingRow[field] = row[field];
              }
            }
          }
          existingRow['updated_at'] = Math.floor(Date.now() / 1000);
          return { lastInsertRowId: existingRowId, changes: 1 };
        }
      }

      const counter = (autoIncrementCounters.get(tableName) || 0) + 1;
      autoIncrementCounters.set(tableName, counter);

      const fullRow = {
        id: counter,
        ...row,
        created_at: Math.floor(Date.now() / 1000),
        updated_at: Math.floor(Date.now() / 1000),
      };
      table.set(counter, fullRow);

      return { lastInsertRowId: counter, changes: 1 };
    } else if (query.match(/UPDATE/i)) {
      const { tableName, updates, id } = parseUpdate(query, params);
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      const row = table.get(id);
      if (row) {
        Object.assign(row, updates);
        return { lastInsertRowId: 0, changes: 1 };
      }
      return { lastInsertRowId: 0, changes: 0 };
    } else if (query.match(/DELETE FROM/i)) {
      const { tableName, id, field, value } = parseDelete(query, params);
      const table = tables.get(tableName);
      if (!table) {
        throw new Error(`Table ${tableName} does not exist`);
      }

      if (id !== undefined) {
        const existed = table.has(id);
        table.delete(id);
        return { lastInsertRowId: 0, changes: existed ? 1 : 0 };
      } else if (field !== undefined && value !== undefined) {
        // Delete by field value (e.g., DELETE FROM x WHERE hour_of_day = ?)
        let changes = 0;
        const toDelete: number[] = [];
        table.forEach((row, rowId) => {
          if (row[field] === value) {
            toDelete.push(rowId);
          }
        });
        for (const rowId of toDelete) {
          table.delete(rowId);
          changes++;
        }
        return { lastInsertRowId: 0, changes };
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
