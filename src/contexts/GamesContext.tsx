import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
  useRef,
} from 'react';
import {
  GameConfig,
  GameSessionDetail,
  GameSession,
  GameTrial,
  GameType,
  GameMode,
} from '../types/games';
import { openDatabase } from '../services/database';
import {
  insertGameSession,
  insertGameTrial,
  getAllGameSessions,
  getGameSessionDetailById,
  ensureGameTables,
  GameSessionRecord,
  GameTrialRecord,
} from '../services/gameDatabase';
import { WordRecallGame } from '../services/games/WordRecallGame';
import { NBackGame } from '../services/games/NBackGame';
import { CognitiveGameEngine } from '../services/games/CognitiveGameEngine';
import { SessionGameIntegration } from '../services/games/SessionGameIntegration';

/**
 * Game state type
 */
export type GameState = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Games context state interface
 */
export interface GamesContextState {
  activeGame: GameSessionDetail | null;
  gameState: GameState;
  currentTrial: GameTrial | null;
  recentGames: GameSession[];
  isRefreshing: boolean;
  currentDifficulty: number;
  currentGameType: GameType | null;
}

/**
 * Games context actions interface
 */
export interface GamesContextActions {
  startGame: (config: GameConfig) => Promise<void>;
  recordTrialResponse: (
    stimulus: any,
    response: any,
    responseTime: number,
    thetaZScore?: number
  ) => Promise<void>;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => Promise<GameSessionDetail>;
  refreshGameHistory: () => Promise<void>;
  generateNextTrial: () => any;
  getCurrentGameEngine: () => CognitiveGameEngine | null;
  updateSessionState: (thetaZScore: number) => void;
}

/**
 * Combined games context type
 */
export type GamesContextType = GamesContextState & GamesContextActions;

/**
 * Games context for managing cognitive game state
 */
const GamesContext = createContext<GamesContextType | undefined>(undefined);

/**
 * Games provider props
 */
interface GamesProviderProps {
  children: ReactNode;
}

/**
 * GamesProvider component
 * Manages global game state for cognitive games
 */
export const GamesProvider: React.FC<GamesProviderProps> = ({ children }) => {
  const [activeGame, setActiveGame] = useState<GameSessionDetail | null>(null);
  const [gameState, setGameState] = useState<GameState>('idle');
  const [currentTrial, setCurrentTrial] = useState<GameTrial | null>(null);
  const [recentGames, setRecentGames] = useState<GameSession[]>([]);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(5);
  const [currentGameType, setCurrentGameType] = useState<GameType | null>(null);

  // Refs to hold game engine and integration instances
  const gameEngineRef = useRef<CognitiveGameEngine | null>(null);
  const sessionIntegrationRef = useRef<SessionGameIntegration>(
    new SessionGameIntegration()
  );

  // Ensure game tables exist on mount
  useEffect(() => {
    const initTables = async () => {
      try {
        await ensureGameTables();
        console.log('[GamesContext] Game tables initialized');
      } catch (error) {
        console.error('[GamesContext] Failed to initialize game tables:', error);
      }
    };
    initTables();
  }, []);

  /**
   * Starts a new game
   */
  const startGame = useCallback(async (config: GameConfig): Promise<void> => {
    try {
      // Ensure tables exist
      await ensureGameTables();

      // Validate config
      const validation = sessionIntegrationRef.current.validateGameConfig(config);
      if (!validation.valid) {
        throw new Error(`Game configuration error: ${validation.error}`);
      }

      // Create game engine based on type
      let engine: CognitiveGameEngine;
      if (config.gameType === 'word_recall') {
        engine = new WordRecallGame(config);
      } else if (config.gameType === 'nback') {
        engine = new NBackGame(config);
      } else {
        throw new Error(`Unknown game type: ${config.gameType}`);
      }

      // Start the game
      engine.start();
      gameEngineRef.current = engine;

      // Update state
      setGameState('running');
      setCurrentGameType(config.gameType);
      setCurrentDifficulty(engine.getCurrentDifficulty());
      setActiveGame({
        id: engine.getSessionId(),
        game_type: config.gameType,
        mode: config.mode,
        session_id: config.sessionId,
        start_time: Date.now(),
        end_time: 0,
        performance: {
          total_trials: 0,
          correct_trials: 0,
          accuracy: 0,
          avg_response_time: 0,
          difficulty_start: engine.getCurrentDifficulty(),
          difficulty_end: engine.getCurrentDifficulty(),
        },
        config,
        trials: [],
      });
    } catch (error) {
      console.error('Failed to start game:', error);
      throw error;
    }
  }, []);

  /**
   * Records a trial response
   */
  const recordTrialResponse = useCallback(
    async (
      stimulus: any,
      response: any,
      responseTime: number,
      thetaZScore?: number
    ): Promise<void> => {
      if (!gameEngineRef.current || gameState !== 'running') {
        throw new Error('No active game running. Please start a game first.');
      }

      try {
        // Validate response
        const correct = gameEngineRef.current.validateResponse(stimulus, response);

        // Record trial in engine
        gameEngineRef.current.recordTrial(
          stimulus,
          response,
          correct,
          responseTime,
          thetaZScore
        );

        // Update difficulty
        const newDifficulty = gameEngineRef.current.getCurrentDifficulty();
        setCurrentDifficulty(newDifficulty);

        // Update current trial
        const trials = gameEngineRef.current.getTrials();
        const latestTrial = trials[trials.length - 1];
        setCurrentTrial(latestTrial);

        // Update active game with latest trial
        if (activeGame) {
          setActiveGame({
            ...activeGame,
            trials: trials,
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[GamesContext] Failed to record trial response:', errorMessage);
        throw new Error(`Failed to record response: ${errorMessage}`);
      }
    },
    [gameState, activeGame]
  );

  /**
   * Pauses the current game
   */
  const pauseGame = useCallback((): void => {
    if (!gameEngineRef.current || gameState !== 'running') {
      throw new Error('No active game to pause');
    }

    gameEngineRef.current.pause();
    setGameState('paused');
  }, [gameState]);

  /**
   * Resumes the current game
   */
  const resumeGame = useCallback((): void => {
    if (!gameEngineRef.current || gameState !== 'paused') {
      throw new Error('No paused game to resume');
    }

    gameEngineRef.current.resume();
    setGameState('running');
  }, [gameState]);

  /**
   * Ends the current game and saves to database
   */
  const endGame = useCallback(async (): Promise<GameSessionDetail> => {
    if (!gameEngineRef.current || gameState === 'idle') {
      throw new Error('No active game to end');
    }

    try {
      // End the game
      const sessionDetail = gameEngineRef.current.end();
      setGameState('completed');

      // Ensure tables exist before saving
      await ensureGameTables();

      // Save to database
      const db = openDatabase();

      // Convert to database record
      const sessionRecord: Omit<GameSessionRecord, 'created_at'> = {
        id: sessionDetail.id,
        game_type: sessionDetail.game_type,
        mode: sessionDetail.mode,
        session_id: sessionDetail.session_id
          ? parseInt(sessionDetail.session_id, 10)
          : null,
        start_time: sessionDetail.start_time,
        end_time: sessionDetail.end_time,
        difficulty_start: sessionDetail.performance.difficulty_start,
        difficulty_end: sessionDetail.performance.difficulty_end,
        total_trials: sessionDetail.performance.total_trials,
        correct_trials: sessionDetail.performance.correct_trials,
        accuracy: sessionDetail.performance.accuracy,
        avg_response_time: sessionDetail.performance.avg_response_time,
        theta_correlation: sessionDetail.performance.theta_correlation ?? null,
        config: JSON.stringify(sessionDetail.config),
      };

      insertGameSession(db, sessionRecord);

      // Save trials
      for (const trial of sessionDetail.trials) {
        const trialRecord: Omit<GameTrialRecord, 'id' | 'created_at'> = {
          game_session_id: sessionDetail.id,
          trial_number: trial.trial_number,
          stimulus: trial.stimulus,
          response: trial.response,
          correct: trial.correct ? 1 : 0,
          response_time: trial.response_time,
          theta_zscore: trial.theta_zscore ?? null,
          timestamp: trial.timestamp,
        };
        insertGameTrial(db, trialRecord);
      }

      // Update recent games
      await refreshGameHistory();

      // Clear active game
      setActiveGame(null);
      setCurrentTrial(null);
      setCurrentGameType(null);
      gameEngineRef.current = null;

      return sessionDetail;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[GamesContext] Failed to end game:', errorMessage);
      throw new Error(`Failed to save game: ${errorMessage}`);
    }
  }, [gameState]);

  /**
   * Refreshes game history from database
   */
  const refreshGameHistory = useCallback(async (): Promise<void> => {
    setIsRefreshing(true);
    try {
      const db = openDatabase();
      const games = getAllGameSessions(db, 10);
      setRecentGames(games);
    } catch (error) {
      console.warn('Failed to refresh game history:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  /**
   * Generates the next trial stimulus
   */
  const generateNextTrial = useCallback((): any => {
    if (!gameEngineRef.current) {
      throw new Error('Game engine not initialized. Please start a game first.');
    }

    try {
      return gameEngineRef.current.generateNextTrial();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('[GamesContext] Failed to generate trial:', errorMessage);
      throw new Error(`Failed to generate trial: ${errorMessage}`);
    }
  }, []);

  /**
   * Gets the current game engine
   */
  const getCurrentGameEngine = useCallback((): CognitiveGameEngine | null => {
    return gameEngineRef.current;
  }, []);

  /**
   * Updates session state for integration
   */
  const updateSessionState = useCallback((thetaZScore: number): void => {
    sessionIntegrationRef.current.updateThetaZScore(thetaZScore);
  }, []);

  const value: GamesContextType = {
    activeGame,
    gameState,
    currentTrial,
    recentGames,
    isRefreshing,
    currentDifficulty,
    currentGameType,
    startGame,
    recordTrialResponse,
    pauseGame,
    resumeGame,
    endGame,
    refreshGameHistory,
    generateNextTrial,
    getCurrentGameEngine,
    updateSessionState,
  };

  return (
    <GamesContext.Provider value={value}>{children}</GamesContext.Provider>
  );
};

/**
 * Hook to use games context
 * Throws error if used outside GamesProvider
 */
export const useGames = (): GamesContextType => {
  const context = useContext(GamesContext);
  if (context === undefined) {
    throw new Error('useGames must be used within a GamesProvider');
  }
  return context;
};
