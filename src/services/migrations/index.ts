import { Migration } from './types';
import { migration001CreateBaselinesTable } from './001_create_baselines_table';
import { migration002CreateSessionsTable } from './002_create_sessions_table';
import { migration003CreateCircadianPatternsTable } from './003_create_circadian_patterns_table';

/**
 * All database migrations in order
 * Add new migrations to this array
 */
export const allMigrations: Migration[] = [
  migration001CreateBaselinesTable,
  migration002CreateSessionsTable,
  migration003CreateCircadianPatternsTable,
];

// Re-export types and runner functions
export * from './types';
export * from './runner';
