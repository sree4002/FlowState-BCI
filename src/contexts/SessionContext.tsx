import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import {
  Session,
  SessionConfig,
  SessionState,
  CalibrationState,
  VisualizationMode,
} from '../types';
import {
  openDatabase,
  getAllSessions,
  SessionRecord,
} from '../services/database';

/**
 * Session context state interface
 */
export interface SessionContextState {
  currentSession: Session | null;
  sessionConfig: SessionConfig | null;
  sessionState: SessionState;
  calibrationState: CalibrationState | null;
  visualizationMode: VisualizationMode;
  currentThetaZScore: number | null;
  elapsedSeconds: number;
  recentSessions: Session[];
  isRefreshing: boolean;
}

/**
 * Session context actions interface
 */
export interface SessionContextActions {
  setCurrentSession: (session: Session | null) => void;
  setSessionConfig: (config: SessionConfig | null) => void;
  setSessionState: (state: SessionState) => void;
  setCalibrationState: (state: CalibrationState | null) => void;
  setVisualizationMode: (mode: VisualizationMode) => void;
  setCurrentThetaZScore: (zscore: number | null) => void;
  setElapsedSeconds: (seconds: number) => void;
  setRecentSessions: (sessions: Session[]) => void;
  addSession: (session: Session) => void;
  resetSessionState: () => void;
  refreshRecentSessions: () => Promise<void>;
}

/**
 * Combined session context type
 */
export type SessionContextType = SessionContextState & SessionContextActions;

/**
 * Session context for managing active session state
 */
const SessionContext = createContext<SessionContextType | undefined>(undefined);

/**
 * Session provider props
 */
interface SessionProviderProps {
  children: ReactNode;
}

/**
 * SessionProvider component
 * Manages global session state for active and recent sessions
 */
export const SessionProvider: React.FC<SessionProviderProps> = ({
  children,
}) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(
    null
  );
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [calibrationState, setCalibrationState] =
    useState<CalibrationState | null>(null);
  const [visualizationMode, setVisualizationMode] =
    useState<VisualizationMode>('chart');
  const [currentThetaZScore, setCurrentThetaZScore] = useState<number | null>(
    null
  );
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  /**
   * Converts a SessionRecord from the database to a Session type
   */
  const sessionRecordToSession = (record: SessionRecord): Session => ({
    id: record.id ?? 0,
    session_type: record.session_type,
    start_time: record.start_time,
    end_time: record.end_time,
    duration_seconds: record.duration_seconds,
    avg_theta_zscore: record.avg_theta_zscore,
    max_theta_zscore: record.max_theta_zscore,
    entrainment_freq: record.entrainment_freq,
    volume: record.volume,
    signal_quality_avg: record.signal_quality_avg,
    subjective_rating: record.subjective_rating,
    notes: record.notes,
  });

  /**
   * Refreshes recent sessions from the database
   */
  const refreshRecentSessions = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const db = openDatabase();
      const sessions = getAllSessions(db);
      // Convert SessionRecord[] to Session[] and keep last 10
      const convertedSessions = sessions
        .slice(0, 10)
        .map(sessionRecordToSession);
      setRecentSessions(convertedSessions);
    } catch (error) {
      // Log error but don't throw - dashboard should remain functional
      console.warn('Failed to refresh sessions:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const addSession = (session: Session) => {
    setRecentSessions((prev) => [session, ...prev].slice(0, 10)); // Keep only last 10 sessions
  };

  const resetSessionState = () => {
    setCurrentSession(null);
    setSessionConfig(null);
    setSessionState('idle');
    setCalibrationState(null);
    setVisualizationMode('chart');
    setCurrentThetaZScore(null);
    setElapsedSeconds(0);
  };

  const value: SessionContextType = {
    currentSession,
    sessionConfig,
    sessionState,
    calibrationState,
    visualizationMode,
    currentThetaZScore,
    elapsedSeconds,
    recentSessions,
    isRefreshing,
    setCurrentSession,
    setSessionConfig,
    setSessionState,
    setCalibrationState,
    setVisualizationMode,
    setCurrentThetaZScore,
    setElapsedSeconds,
    setRecentSessions,
    addSession,
    resetSessionState,
    refreshRecentSessions,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

/**
 * Hook to use session context
 * Throws error if used outside SessionProvider
 */
export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
