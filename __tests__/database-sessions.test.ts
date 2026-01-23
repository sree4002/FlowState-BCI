import * as SQLite from 'expo-sqlite';
import {
  initializeDatabase,
  dropAllTables,
  insertSession,
  getSessionById,
  getAllSessions,
  getLatestSession,
  getSessionsByType,
  getSessionsByDateRange,
  updateSession,
  deleteSession,
  deleteAllSessions,
  getSessionsCount,
  getSessionStats,
  createSessionsTable,
  type SessionRecord,
  type SessionType,
} from '../src/services/database';

describe('Database - Sessions Table', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    const result = initializeDatabase();
    db = result.db;
    deleteAllSessions(db);
  });

  afterEach(() => {
    dropAllTables(db);
  });

  const createTestSession = (
    overrides: Partial<Omit<SessionRecord, 'id' | 'created_at'>> = {}
  ): Omit<SessionRecord, 'id' | 'created_at'> => ({
    session_type: 'quick_boost',
    start_time: Date.now() - 300000,
    end_time: Date.now(),
    duration_seconds: 300,
    avg_theta_zscore: 1.5,
    max_theta_zscore: 2.3,
    entrainment_freq: 6.0,
    volume: 75,
    signal_quality_avg: 85.5,
    subjective_rating: 4,
    notes: 'Test session',
    ...overrides,
  });

  describe('Sessions table schema', () => {
    it('should have correct columns', () => {
      const columns = db.getAllSync<{ name: string }>(
        'PRAGMA table_info(sessions)'
      );
      const columnNames = columns.map((col) => col.name);

      expect(columnNames).toContain('id');
      expect(columnNames).toContain('session_type');
      expect(columnNames).toContain('start_time');
      expect(columnNames).toContain('end_time');
      expect(columnNames).toContain('duration_seconds');
      expect(columnNames).toContain('avg_theta_zscore');
      expect(columnNames).toContain('max_theta_zscore');
      expect(columnNames).toContain('entrainment_freq');
      expect(columnNames).toContain('volume');
      expect(columnNames).toContain('signal_quality_avg');
      expect(columnNames).toContain('subjective_rating');
      expect(columnNames).toContain('notes');
      expect(columnNames).toContain('created_at');
    });

    it('should have id as primary key', () => {
      const columns = db.getAllSync<{ name: string; pk: number }>(
        'PRAGMA table_info(sessions)'
      );
      const idColumn = columns.find((col) => col.name === 'id');

      expect(idColumn?.pk).toBe(1);
    });
  });

  describe('Insert session', () => {
    it('should insert a session record successfully', () => {
      const session = createTestSession();
      const id = insertSession(db, session);
      expect(id).toBeGreaterThan(0);
    });

    it('should auto-increment id for multiple inserts', () => {
      const session1 = createTestSession();
      const session2 = createTestSession({ session_type: 'custom' });

      const id1 = insertSession(db, session1);
      const id2 = insertSession(db, session2);

      expect(id2).toBe(id1 + 1);
    });

    it('should accept all session types', () => {
      const sessionTypes: SessionType[] = [
        'calibration',
        'quick_boost',
        'custom',
        'scheduled',
        'sham',
      ];

      sessionTypes.forEach((sessionType) => {
        const session = createTestSession({ session_type: sessionType });
        const id = insertSession(db, session);
        expect(id).toBeGreaterThan(0);

        const retrieved = getSessionById(db, id);
        expect(retrieved?.session_type).toBe(sessionType);
      });
    });

    it('should allow null subjective_rating', () => {
      const session = createTestSession({ subjective_rating: null });
      const id = insertSession(db, session);

      const retrieved = getSessionById(db, id);
      expect(retrieved?.subjective_rating).toBeNull();
    });

    it('should allow null notes', () => {
      const session = createTestSession({ notes: null });
      const id = insertSession(db, session);

      const retrieved = getSessionById(db, id);
      expect(retrieved?.notes).toBeNull();
    });
  });

  describe('Get session by ID', () => {
    it('should return null for non-existent ID', () => {
      const session = getSessionById(db, 999);
      expect(session).toBeNull();
    });

    it('should retrieve session by ID', () => {
      const sessionData = createTestSession();
      const id = insertSession(db, sessionData);
      const retrieved = getSessionById(db, id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(id);
      expect(retrieved?.session_type).toBe('quick_boost');
      expect(retrieved?.avg_theta_zscore).toBe(1.5);
    });
  });

  describe('Get all sessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = getAllSessions(db);
      expect(sessions).toEqual([]);
    });

    it('should return all sessions ordered by start time (newest first)', () => {
      const now = Date.now();
      const session1 = createTestSession({ start_time: now - 3000 });
      const session2 = createTestSession({ start_time: now });
      const session3 = createTestSession({ start_time: now - 1000 });

      insertSession(db, session1);
      const id2 = insertSession(db, session2);
      const id3 = insertSession(db, session3);

      const sessions = getAllSessions(db);
      expect(sessions).toHaveLength(3);
      expect(sessions[0].id).toBe(id2);
      expect(sessions[1].id).toBe(id3);
    });
  });

  describe('Get latest session', () => {
    it('should return null when no sessions exist', () => {
      const latest = getLatestSession(db);
      expect(latest).toBeNull();
    });

    it('should return the most recent session', () => {
      const now = Date.now();
      const session1 = createTestSession({ start_time: now - 1000 });
      const session2 = createTestSession({ start_time: now });

      insertSession(db, session1);
      const id2 = insertSession(db, session2);

      const latest = getLatestSession(db);
      expect(latest?.id).toBe(id2);
    });
  });

  describe('Get sessions by type', () => {
    it('should return empty array when no sessions of type exist', () => {
      const session = createTestSession({ session_type: 'quick_boost' });
      insertSession(db, session);

      const calibrationSessions = getSessionsByType(db, 'calibration');
      expect(calibrationSessions).toEqual([]);
    });

    it('should return only sessions of specified type', () => {
      const session1 = createTestSession({ session_type: 'quick_boost' });
      const session2 = createTestSession({ session_type: 'calibration' });
      const session3 = createTestSession({ session_type: 'quick_boost' });

      const id1 = insertSession(db, session1);
      insertSession(db, session2);
      const id3 = insertSession(db, session3);

      const quickBoostSessions = getSessionsByType(db, 'quick_boost');
      expect(quickBoostSessions).toHaveLength(2);
      expect(quickBoostSessions.map((s) => s.id)).toContain(id1);
      expect(quickBoostSessions.map((s) => s.id)).toContain(id3);
    });
  });

  describe('Get sessions by date range', () => {
    it('should return sessions within the date range', () => {
      const now = Date.now();
      const session1 = createTestSession({ start_time: now - 10000 });
      const session2 = createTestSession({ start_time: now - 5000 });
      const session3 = createTestSession({ start_time: now - 1000 });

      insertSession(db, session1);
      const id2 = insertSession(db, session2);
      const id3 = insertSession(db, session3);

      const sessions = getSessionsByDateRange(db, now - 6000, now);
      expect(sessions).toHaveLength(2);
      expect(sessions.map((s) => s.id)).toContain(id2);
      expect(sessions.map((s) => s.id)).toContain(id3);
    });

    it('should return empty array when no sessions in range', () => {
      const now = Date.now();
      const session = createTestSession({ start_time: now - 10000 });
      insertSession(db, session);

      const sessions = getSessionsByDateRange(db, now - 5000, now);
      expect(sessions).toEqual([]);
    });
  });

  describe('Update session', () => {
    it('should update single field', () => {
      const session = createTestSession();
      const id = insertSession(db, session);

      updateSession(db, id, { subjective_rating: 5 });

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBe(5);
      expect(updated?.avg_theta_zscore).toBe(1.5);
    });

    it('should update multiple fields', () => {
      const session = createTestSession();
      const id = insertSession(db, session);

      updateSession(db, id, {
        subjective_rating: 5,
        notes: 'Updated notes',
        volume: 80,
      });

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBe(5);
      expect(updated?.notes).toBe('Updated notes');
      expect(updated?.volume).toBe(80);
    });

    it('should handle empty update', () => {
      const session = createTestSession();
      const id = insertSession(db, session);

      updateSession(db, id, {});

      const updated = getSessionById(db, id);
      expect(updated?.avg_theta_zscore).toBe(1.5);
    });

    it('should update subjective_rating to null', () => {
      const session = createTestSession({ subjective_rating: 4 });
      const id = insertSession(db, session);

      updateSession(db, id, { subjective_rating: null });

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBeNull();
    });
  });

  describe('Delete session', () => {
    it('should delete session by ID', () => {
      const session = createTestSession();
      const id = insertSession(db, session);

      deleteSession(db, id);

      const retrieved = getSessionById(db, id);
      expect(retrieved).toBeNull();
    });

    it('should not affect other sessions when deleting one', () => {
      const session1 = createTestSession();
      const session2 = createTestSession({ session_type: 'custom' });

      const id1 = insertSession(db, session1);
      const id2 = insertSession(db, session2);

      deleteSession(db, id1);

      const retrieved1 = getSessionById(db, id1);
      const retrieved2 = getSessionById(db, id2);

      expect(retrieved1).toBeNull();
      expect(retrieved2).not.toBeNull();
    });
  });

  describe('Delete all sessions', () => {
    it('should delete all session records', () => {
      const session1 = createTestSession();
      const session2 = createTestSession();

      insertSession(db, session1);
      insertSession(db, session2);

      deleteAllSessions(db);

      const sessions = getAllSessions(db);
      expect(sessions).toHaveLength(0);
    });
  });

  describe('Get sessions count', () => {
    it('should return 0 when no sessions exist', () => {
      const count = getSessionsCount(db);
      expect(count).toBe(0);
    });

    it('should return correct count of sessions', () => {
      const session1 = createTestSession();
      const session2 = createTestSession();

      insertSession(db, session1);
      insertSession(db, session2);

      const count = getSessionsCount(db);
      expect(count).toBe(2);
    });

    it('should update count after deletion', () => {
      const session = createTestSession();
      const id = insertSession(db, session);

      expect(getSessionsCount(db)).toBe(1);

      deleteSession(db, id);
      expect(getSessionsCount(db)).toBe(0);
    });
  });

  describe('Get session stats', () => {
    it('should return zero stats when no sessions exist', () => {
      const stats = getSessionStats(db);

      expect(stats.total_sessions).toBe(0);
      expect(stats.total_duration_seconds).toBe(0);
      expect(stats.avg_theta_zscore).toBe(0);
      expect(stats.avg_signal_quality).toBe(0);
    });

    it('should calculate correct aggregate statistics', () => {
      const session1 = createTestSession({
        duration_seconds: 300,
        avg_theta_zscore: 1.0,
        signal_quality_avg: 80,
        subjective_rating: 3,
      });
      const session2 = createTestSession({
        duration_seconds: 600,
        avg_theta_zscore: 2.0,
        signal_quality_avg: 90,
        subjective_rating: 5,
      });

      insertSession(db, session1);
      insertSession(db, session2);

      const stats = getSessionStats(db);

      expect(stats.total_sessions).toBe(2);
      expect(stats.total_duration_seconds).toBe(900);
      expect(stats.avg_theta_zscore).toBe(1.5);
      expect(stats.avg_signal_quality).toBe(85);
      expect(stats.avg_subjective_rating).toBe(4);
    });
  });

  describe('Data integrity', () => {
    it('should preserve decimal precision for numeric values', () => {
      const session = createTestSession({
        avg_theta_zscore: 1.234567,
        max_theta_zscore: 2.345678,
        entrainment_freq: 6.54321,
        volume: 75.5,
        signal_quality_avg: 85.12345,
      });

      const id = insertSession(db, session);
      const retrieved = getSessionById(db, id);

      expect(retrieved?.avg_theta_zscore).toBeCloseTo(1.234567, 5);
      expect(retrieved?.max_theta_zscore).toBeCloseTo(2.345678, 5);
      expect(retrieved?.entrainment_freq).toBeCloseTo(6.54321, 5);
    });

    it('should store large timestamp values correctly', () => {
      const timestamp = 1705800000000; // Jan 2024 timestamp
      const session = createTestSession({
        start_time: timestamp,
        end_time: timestamp + 300000,
      });

      const id = insertSession(db, session);
      const retrieved = getSessionById(db, id);

      expect(retrieved?.start_time).toBe(timestamp);
      expect(retrieved?.end_time).toBe(timestamp + 300000);
    });
  });
});
