import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Session, SessionConfig, SessionState, CalibrationState, VisualizationMode } from '../types';

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
export const SessionProvider: React.FC<SessionProviderProps> = ({ children }) => {
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('idle');
  const [calibrationState, setCalibrationState] = useState<CalibrationState | null>(null);
  const [visualizationMode, setVisualizationMode] = useState<VisualizationMode>('numeric');
  const [currentThetaZScore, setCurrentThetaZScore] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  const addSession = (session: Session) => {
    setRecentSessions((prev) => [session, ...prev].slice(0, 10)); // Keep only last 10 sessions
  };

  const resetSessionState = () => {
    setCurrentSession(null);
    setSessionConfig(null);
    setSessionState('idle');
    setCalibrationState(null);
    setVisualizationMode('numeric');
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
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
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
