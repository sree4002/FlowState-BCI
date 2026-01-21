import * as SQLite from 'expo-sqlite';
import {
  openDatabase,
  createSessionsTable,
  initializeDatabase,
  dropAllTables,
  insertSession,
  getLatestSession,
  getAllSessions,
  getSessionById,
  getSessionsByType,
  updateSession,
  deleteSession,
  deleteAllSessions,
  getSessionsCount,
  type SessionRecord,
  type SessionType,
} from '../src/services/database';

describe('Database - Sessions Table', () => {
  let db: SQLite.SQLiteDatabase;

  beforeEach(() => {
    // Initialize database and create tables
    db = initializeDatabase();
    // Clean up any existing data
    deleteAllSessions(db);
  });

  afterEach(() => {
    // Clean up after each test
    dropAllTables(db);
  });

  describe('Database initialization', () => {
    it('should create sessions table', () => {
      const testDb = openDatabase();
      createSessionsTable(testDb);

      // Verify table exists by querying it
      const result = testDb.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='sessions'"
      );
      expect(result?.count).toBe(1);
    });

    it('should initialize database with sessions table', () => {
      const testDb = initializeDatabase();
      expect(testDb).toBeDefined();

      // Verify sessions table exists
      const result = testDb.getFirstSync<{ count: number }>(
        "SELECT COUNT(*) as count FROM sqlite_master WHERE type='table' AND name='sessions'"
      );
      expect(result?.count).toBe(1);
    });
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
      const session: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Great session',
      };

      const id = insertSession(db, session);
      expect(id).toBeGreaterThan(0);
    });

    it('should auto-increment id for multiple inserts', () => {
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Session 1',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: 5,
        notes: 'Session 2',
      };

      const id1 = insertSession(db, session1);
      const id2 = insertSession(db, session2);

      expect(id2).toBe(id1 + 1);
    });

    it('should allow null subjective_rating', () => {
      const session: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: null,
        notes: null,
      };

      const id = insertSession(db, session);
      expect(id).toBeGreaterThan(0);

      const retrieved = getSessionById(db, id);
      expect(retrieved?.subjective_rating).toBeNull();
      expect(retrieved?.notes).toBeNull();
    });

    it('should support all session types', () => {
      const sessionTypes: SessionType[] = [
        'calibration',
        'quick_boost',
        'custom',
        'scheduled',
        'sham',
      ];

      sessionTypes.forEach((sessionType, index) => {
        const session: Omit<SessionRecord, 'id' | 'created_at'> = {
          session_type: sessionType,
          start_time: Date.now() + index * 1000,
          end_time: Date.now() + index * 1000 + 600000,
          duration_seconds: 600,
          avg_theta_zscore: 1.5,
          max_theta_zscore: 2.3,
          entrainment_freq: 6.5,
          volume: 0.7,
          signal_quality_avg: 85.5,
          subjective_rating: null,
          notes: null,
        };

        const id = insertSession(db, session);
        const retrieved = getSessionById(db, id);
        expect(retrieved?.session_type).toBe(sessionType);
      });
    });
  });

  describe('Get latest session', () => {
    it('should return null when no sessions exist', () => {
      const latest = getLatestSession(db);
      expect(latest).toBeNull();
    });

    it('should return the most recent session', () => {
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 1200000,
        end_time: Date.now() - 600000,
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Older session',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'custom',
        start_time: Date.now(),
        end_time: Date.now() + 600000,
        duration_seconds: 600,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: 5,
        notes: 'Newer session',
      };

      insertSession(db, session1);
      const id2 = insertSession(db, session2);

      const latest = getLatestSession(db);
      expect(latest?.id).toBe(id2);
      expect(latest?.session_type).toBe('custom');
    });
  });

  describe('Get all sessions', () => {
    it('should return empty array when no sessions exist', () => {
      const sessions = getAllSessions(db);
      expect(sessions).toEqual([]);
    });

    it('should return all sessions ordered by start_time (newest first)', () => {
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 2000,
        end_time: Date.now() - 1000,
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Session 1',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now() + 1000,
        duration_seconds: 300,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: 5,
        notes: 'Session 2',
      };

      const session3: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'custom',
        start_time: Date.now() - 1000,
        end_time: Date.now(),
        duration_seconds: 450,
        avg_theta_zscore: 1.6,
        max_theta_zscore: 2.4,
        entrainment_freq: 6.2,
        volume: 0.75,
        signal_quality_avg: 87.5,
        subjective_rating: 4,
        notes: 'Session 3',
      };

      insertSession(db, session1);
      const id2 = insertSession(db, session2);
      const id3 = insertSession(db, session3);

      const sessions = getAllSessions(db);
      expect(sessions).toHaveLength(3);
      expect(sessions[0].id).toBe(id2); // Newest first
      expect(sessions[1].id).toBe(id3);
    });
  });

  describe('Get session by ID', () => {
    it('should return null for non-existent ID', () => {
      const session = getSessionById(db, 999);
      expect(session).toBeNull();
    });

    it('should retrieve session by ID', () => {
      const sessionData: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Test session',
      };

      const id = insertSession(db, sessionData);
      const retrieved = getSessionById(db, id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(id);
      expect(retrieved?.session_type).toBe('quick_boost');
      expect(retrieved?.avg_theta_zscore).toBe(1.5);
    });
  });

  describe('Get sessions by type', () => {
    it('should return empty array when no sessions of type exist', () => {
      const sessions = getSessionsByType(db, 'sham');
      expect(sessions).toEqual([]);
    });

    it('should return only sessions of specified type', () => {
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Quick boost 1',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: null,
        notes: null,
      };

      const session3: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() + 1000,
        end_time: Date.now() + 601000,
        duration_seconds: 600,
        avg_theta_zscore: 1.6,
        max_theta_zscore: 2.4,
        entrainment_freq: 6.3,
        volume: 0.75,
        signal_quality_avg: 88.0,
        subjective_rating: 5,
        notes: 'Quick boost 2',
      };

      insertSession(db, session1);
      insertSession(db, session2);
      insertSession(db, session3);

      const quickBoostSessions = getSessionsByType(db, 'quick_boost');
      expect(quickBoostSessions).toHaveLength(2);
      quickBoostSessions.forEach((s) => {
        expect(s.session_type).toBe('quick_boost');
      });

      const calibrationSessions = getSessionsByType(db, 'calibration');
      expect(calibrationSessions).toHaveLength(1);
      expect(calibrationSessions[0].session_type).toBe('calibration');
    });
  });

  describe('Update session', () => {
    it('should update single field', () => {
      const sessionData: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Original notes',
      };

      const id = insertSession(db, sessionData);
      updateSession(db, id, { subjective_rating: 5 });

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBe(5);
      expect(updated?.notes).toBe('Original notes');
    });

    it('should update multiple fields', () => {
      const sessionData: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Original notes',
      };

      const id = insertSession(db, sessionData);
      updateSession(db, id, {
        subjective_rating: 5,
        notes: 'Updated notes',
        avg_theta_zscore: 1.7,
      });

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBe(5);
      expect(updated?.notes).toBe('Updated notes');
      expect(updated?.avg_theta_zscore).toBe(1.7);
      expect(updated?.volume).toBe(0.7);
    });

    it('should handle empty update', () => {
      const sessionData: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Original notes',
      };

      const id = insertSession(db, sessionData);
      updateSession(db, id, {});

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBe(4);
    });

    it('should update subjective_rating to null', () => {
      const sessionData: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Some notes',
      };

      const id = insertSession(db, sessionData);
      updateSession(db, id, { subjective_rating: null, notes: null });

      const updated = getSessionById(db, id);
      expect(updated?.subjective_rating).toBeNull();
      expect(updated?.notes).toBeNull();
    });
  });

  describe('Delete session', () => {
    it('should delete session by ID', () => {
      const sessionData: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Test session',
      };

      const id = insertSession(db, sessionData);
      deleteSession(db, id);

      const retrieved = getSessionById(db, id);
      expect(retrieved).toBeNull();
    });

    it('should not affect other sessions when deleting one', () => {
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Session 1',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: 5,
        notes: 'Session 2',
      };

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
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Session 1',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: 5,
        notes: 'Session 2',
      };

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
      const session1: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Session 1',
      };

      const session2: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.8,
        max_theta_zscore: 2.5,
        entrainment_freq: 6.0,
        volume: 0.8,
        signal_quality_avg: 90.0,
        subjective_rating: 5,
        notes: 'Session 2',
      };

      insertSession(db, session1);
      insertSession(db, session2);

      const count = getSessionsCount(db);
      expect(count).toBe(2);
    });

    it('should update count after deletion', () => {
      const session: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Test session',
      };

      const id = insertSession(db, session);
      expect(getSessionsCount(db)).toBe(1);

      deleteSession(db, id);
      expect(getSessionsCount(db)).toBe(0);
    });
  });

  describe('Data integrity', () => {
    it('should preserve decimal precision for theta z-scores', () => {
      const session: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.543210,
        max_theta_zscore: 2.345678,
        entrainment_freq: 6.567890,
        volume: 0.712345,
        signal_quality_avg: 85.56789,
        subjective_rating: 4,
        notes: 'Precision test',
      };

      const id = insertSession(db, session);
      const retrieved = getSessionById(db, id);

      expect(retrieved?.avg_theta_zscore).toBeCloseTo(1.543210, 5);
      expect(retrieved?.max_theta_zscore).toBeCloseTo(2.345678, 5);
      expect(retrieved?.entrainment_freq).toBeCloseTo(6.567890, 5);
    });

    it('should store large timestamp values correctly', () => {
      const startTime = 1705800000000; // Jan 2024 timestamp
      const endTime = startTime + 600000;
      const session: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: startTime,
        end_time: endTime,
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Timestamp test',
      };

      const id = insertSession(db, session);
      const retrieved = getSessionById(db, id);

      expect(retrieved?.start_time).toBe(startTime);
      expect(retrieved?.end_time).toBe(endTime);
    });

    it('should store long notes correctly', () => {
      const longNotes = 'A'.repeat(1000);
      const session: Omit<SessionRecord, 'id' | 'created_at'> = {
        session_type: 'quick_boost',
        start_time: Date.now() - 600000,
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.5,
        volume: 0.7,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: longNotes,
      };

      const id = insertSession(db, session);
      const retrieved = getSessionById(db, id);

      expect(retrieved?.notes).toBe(longNotes);
      expect(retrieved?.notes?.length).toBe(1000);
    });
  });
});
