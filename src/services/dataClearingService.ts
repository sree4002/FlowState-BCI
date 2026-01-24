import * as SQLite from 'expo-sqlite';
import {
  openDatabase,
  getSessionsCount,
  getBaselinesCount,
  getCircadianPatternsCount,
  deleteAllSessions,
  deleteAllBaselines,
  deleteAllCircadianPatterns,
} from './database';

/**
 * Result interface for data clearing operations
 */
export interface ClearingResult {
  /** Whether the operation completed successfully */
  success: boolean;
  /** Number of records deleted */
  deletedCount: number;
  /** Error message if operation failed */
  error?: string;
}

/**
 * Result interface for clearing all data
 */
export interface ClearAllDataResult {
  /** Whether all operations completed successfully */
  success: boolean;
  /** Number of sessions deleted */
  sessionsDeleted: number;
  /** Number of baselines deleted */
  baselinesDeleted: number;
  /** Number of circadian patterns deleted */
  circadianPatternsDeleted: number;
  /** Total number of records deleted */
  totalDeleted: number;
  /** Error message if any operation failed */
  error?: string;
}

/**
 * Clears all sessions from the database
 * @param db Optional database instance. If not provided, opens a new connection.
 * @returns ClearingResult with success status and deleted count
 */
export const clearAllSessions = (
  db?: SQLite.SQLiteDatabase
): ClearingResult => {
  try {
    const database = db || openDatabase();
    const count = getSessionsCount(database);

    if (count === 0) {
      return {
        success: true,
        deletedCount: 0,
      };
    }

    deleteAllSessions(database);

    // Verify deletion
    const remainingCount = getSessionsCount(database);
    if (remainingCount !== 0) {
      return {
        success: false,
        deletedCount: count - remainingCount,
        error: `Failed to delete all sessions. ${remainingCount} sessions remaining.`,
      };
    }

    return {
      success: true,
      deletedCount: count,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      deletedCount: 0,
      error: `Failed to clear sessions: ${errorMessage}`,
    };
  }
};

/**
 * Clears all baselines from the database
 * @param db Optional database instance. If not provided, opens a new connection.
 * @returns ClearingResult with success status and deleted count
 */
export const clearAllBaselines = (
  db?: SQLite.SQLiteDatabase
): ClearingResult => {
  try {
    const database = db || openDatabase();
    const count = getBaselinesCount(database);

    if (count === 0) {
      return {
        success: true,
        deletedCount: 0,
      };
    }

    deleteAllBaselines(database);

    // Verify deletion
    const remainingCount = getBaselinesCount(database);
    if (remainingCount !== 0) {
      return {
        success: false,
        deletedCount: count - remainingCount,
        error: `Failed to delete all baselines. ${remainingCount} baselines remaining.`,
      };
    }

    return {
      success: true,
      deletedCount: count,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      deletedCount: 0,
      error: `Failed to clear baselines: ${errorMessage}`,
    };
  }
};

/**
 * Clears all circadian patterns from the database
 * @param db Optional database instance. If not provided, opens a new connection.
 * @returns ClearingResult with success status and deleted count
 */
export const clearAllCircadianPatterns = (
  db?: SQLite.SQLiteDatabase
): ClearingResult => {
  try {
    const database = db || openDatabase();
    const count = getCircadianPatternsCount(database);

    if (count === 0) {
      return {
        success: true,
        deletedCount: 0,
      };
    }

    deleteAllCircadianPatterns(database);

    // Verify deletion
    const remainingCount = getCircadianPatternsCount(database);
    if (remainingCount !== 0) {
      return {
        success: false,
        deletedCount: count - remainingCount,
        error: `Failed to delete all circadian patterns. ${remainingCount} patterns remaining.`,
      };
    }

    return {
      success: true,
      deletedCount: count,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      deletedCount: 0,
      error: `Failed to clear circadian patterns: ${errorMessage}`,
    };
  }
};

/**
 * Clears all data from the database including sessions, baselines, and circadian patterns
 * This is a comprehensive data wipe that resets the app to its initial state
 * @param db Optional database instance. If not provided, opens a new connection.
 * @returns ClearAllDataResult with success status and counts for each data type
 */
export const clearAllData = (
  db?: SQLite.SQLiteDatabase
): ClearAllDataResult => {
  try {
    const database = db || openDatabase();

    // Get counts before deletion
    const sessionsCount = getSessionsCount(database);
    const baselinesCount = getBaselinesCount(database);
    const circadianPatternsCount = getCircadianPatternsCount(database);

    // Clear all data types
    const sessionsResult = clearAllSessions(database);
    const baselinesResult = clearAllBaselines(database);
    const circadianResult = clearAllCircadianPatterns(database);

    // Check if all operations succeeded
    const allSuccessful =
      sessionsResult.success &&
      baselinesResult.success &&
      circadianResult.success;

    // Collect error messages
    const errors: string[] = [];
    if (!sessionsResult.success && sessionsResult.error) {
      errors.push(sessionsResult.error);
    }
    if (!baselinesResult.success && baselinesResult.error) {
      errors.push(baselinesResult.error);
    }
    if (!circadianResult.success && circadianResult.error) {
      errors.push(circadianResult.error);
    }

    const totalDeleted =
      sessionsResult.deletedCount +
      baselinesResult.deletedCount +
      circadianResult.deletedCount;

    return {
      success: allSuccessful,
      sessionsDeleted: sessionsResult.deletedCount,
      baselinesDeleted: baselinesResult.deletedCount,
      circadianPatternsDeleted: circadianResult.deletedCount,
      totalDeleted,
      error: errors.length > 0 ? errors.join('; ') : undefined,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      sessionsDeleted: 0,
      baselinesDeleted: 0,
      circadianPatternsDeleted: 0,
      totalDeleted: 0,
      error: `Failed to clear all data: ${errorMessage}`,
    };
  }
};

/**
 * Gets a summary of current data counts in the database
 * Useful for displaying to user before deletion
 * @param db Optional database instance. If not provided, opens a new connection.
 * @returns Object with counts for each data type
 */
export const getDataSummary = (
  db?: SQLite.SQLiteDatabase
): {
  sessionsCount: number;
  baselinesCount: number;
  circadianPatternsCount: number;
  totalCount: number;
} => {
  try {
    const database = db || openDatabase();
    const sessionsCount = getSessionsCount(database);
    const baselinesCount = getBaselinesCount(database);
    const circadianPatternsCount = getCircadianPatternsCount(database);

    return {
      sessionsCount,
      baselinesCount,
      circadianPatternsCount,
      totalCount: sessionsCount + baselinesCount + circadianPatternsCount,
    };
  } catch {
    return {
      sessionsCount: 0,
      baselinesCount: 0,
      circadianPatternsCount: 0,
      totalCount: 0,
    };
  }
};

/**
 * Checks if there is any data to clear
 * @param db Optional database instance. If not provided, opens a new connection.
 * @returns true if there is any data in the database
 */
export const hasDataToClear = (db?: SQLite.SQLiteDatabase): boolean => {
  const summary = getDataSummary(db);
  return summary.totalCount > 0;
};

/**
 * Formats the deletion result for display to the user
 * @param result The ClearingResult to format
 * @param dataType The type of data that was cleared
 * @returns A user-friendly message string
 */
export const formatClearingResultMessage = (
  result: ClearingResult,
  dataType: 'sessions' | 'baselines' | 'circadian patterns'
): string => {
  if (result.success) {
    if (result.deletedCount === 0) {
      return `No ${dataType} to delete.`;
    }
    return `Successfully deleted ${result.deletedCount} ${dataType}.`;
  }
  return result.error || `Failed to delete ${dataType}.`;
};

/**
 * Formats the clear all data result for display to the user
 * @param result The ClearAllDataResult to format
 * @returns A user-friendly message string
 */
export const formatClearAllResultMessage = (
  result: ClearAllDataResult
): string => {
  if (result.success) {
    if (result.totalDeleted === 0) {
      return 'No data to delete.';
    }
    const parts: string[] = [];
    if (result.sessionsDeleted > 0) {
      parts.push(`${result.sessionsDeleted} sessions`);
    }
    if (result.baselinesDeleted > 0) {
      parts.push(`${result.baselinesDeleted} baselines`);
    }
    if (result.circadianPatternsDeleted > 0) {
      parts.push(`${result.circadianPatternsDeleted} circadian patterns`);
    }
    return `Successfully deleted ${parts.join(', ')}.`;
  }
  return result.error || 'Failed to delete data.';
};
