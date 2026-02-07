/**
 * Session Game Integration Service
 * Manages integration between cognitive games and BCI sessions
 */

import { GameConfig, GameMode, GameType } from '../../types/games';
import { Session } from '../../types';

/**
 * Integration mode configuration
 */
export interface SessionGameIntegrationConfig {
  mode: GameMode;
  sessionId?: string;
  autoStartGame?: boolean;
  gameType: GameType;
}

/**
 * Session state for game integration
 */
export interface SessionGameState {
  isSessionActive: boolean;
  currentThetaZScore: number | null;
  sessionId: string | null;
  sessionStartTime: number | null;
}

/**
 * SessionGameIntegration class
 * Coordinates cognitive games with BCI session lifecycle
 */
export class SessionGameIntegration {
  private sessionState: SessionGameState;

  constructor() {
    this.sessionState = {
      isSessionActive: false,
      currentThetaZScore: null,
      sessionId: null,
      sessionStartTime: null,
    };
  }

  /**
   * Updates the current session state
   */
  public updateSessionState(state: Partial<SessionGameState>): void {
    this.sessionState = {
      ...this.sessionState,
      ...state,
    };
  }

  /**
   * Gets the current session state
   */
  public getSessionState(): SessionGameState {
    return { ...this.sessionState };
  }

  /**
   * Notifies session start
   */
  public onSessionStart(sessionId: string): void {
    this.sessionState = {
      isSessionActive: true,
      currentThetaZScore: null,
      sessionId,
      sessionStartTime: Date.now(),
    };
  }

  /**
   * Notifies session end
   */
  public onSessionEnd(): void {
    this.sessionState = {
      isSessionActive: false,
      currentThetaZScore: null,
      sessionId: null,
      sessionStartTime: null,
    };
  }

  /**
   * Updates current theta z-score (for during-session games)
   */
  public updateThetaZScore(zscore: number): void {
    this.sessionState.currentThetaZScore = zscore;
  }

  /**
   * Gets current theta z-score
   */
  public getCurrentThetaZScore(): number | null {
    return this.sessionState.currentThetaZScore;
  }

  /**
   * Determines if a game can be started in the specified mode
   */
  public canStartGame(mode: GameMode): boolean {
    switch (mode) {
      case 'during_session':
        return this.sessionState.isSessionActive;
      case 'pre_session':
        return !this.sessionState.isSessionActive;
      case 'post_session':
        return !this.sessionState.isSessionActive;
      case 'standalone':
        return true;
      default:
        return false;
    }
  }

  /**
   * Creates a game configuration based on session state
   */
  public createGameConfig(
    gameType: GameType,
    mode: GameMode,
    difficulty?: number
  ): GameConfig {
    return {
      gameType,
      mode,
      difficulty,
      sessionId:
        mode !== 'standalone' && this.sessionState.sessionId
          ? this.sessionState.sessionId
          : undefined,
    };
  }

  /**
   * Validates game configuration
   */
  public validateGameConfig(config: GameConfig): {
    valid: boolean;
    error?: string;
  } {
    // Check if mode is valid
    if (!this.canStartGame(config.mode)) {
      return {
        valid: false,
        error: `Cannot start game in ${config.mode} mode. Current session state does not allow it.`,
      };
    }

    // Check if sessionId is required and present
    if (config.mode === 'during_session' && !config.sessionId) {
      return {
        valid: false,
        error: 'Session ID is required for during_session mode.',
      };
    }

    // Check difficulty range
    if (
      config.difficulty !== undefined &&
      (config.difficulty < 0 || config.difficulty > 10)
    ) {
      return {
        valid: false,
        error: 'Difficulty must be between 0 and 10.',
      };
    }

    return { valid: true };
  }

  /**
   * Gets suggested game timing based on session state
   */
  public getSuggestedGameTiming(): {
    mode: GameMode;
    reason: string;
  } | null {
    if (this.sessionState.isSessionActive) {
      return {
        mode: 'during_session',
        reason: 'Session is currently active',
      };
    }

    // Check if session recently ended (within 5 minutes)
    if (
      this.sessionState.sessionStartTime &&
      Date.now() - this.sessionState.sessionStartTime < 5 * 60 * 1000
    ) {
      return {
        mode: 'post_session',
        reason: 'Session recently ended - post-session testing available',
      };
    }

    return {
      mode: 'standalone',
      reason: 'No active session - standalone mode recommended',
    };
  }

  /**
   * Calculates session-game correlation metrics
   */
  public calculateSessionGameCorrelation(
    gameAccuracy: number,
    avgThetaZScore: number
  ): {
    correlation: number;
    interpretation: string;
  } {
    // Simple linear correlation between theta and accuracy
    // Higher theta should correlate with better performance
    const correlation = gameAccuracy * avgThetaZScore;

    let interpretation: string;
    if (correlation > 0.7) {
      interpretation = 'Strong positive correlation between theta and performance';
    } else if (correlation > 0.4) {
      interpretation = 'Moderate positive correlation between theta and performance';
    } else if (correlation > 0.2) {
      interpretation = 'Weak positive correlation between theta and performance';
    } else {
      interpretation = 'No significant correlation observed';
    }

    return {
      correlation,
      interpretation,
    };
  }

  /**
   * Resets the integration state
   */
  public reset(): void {
    this.sessionState = {
      isSessionActive: false,
      currentThetaZScore: null,
      sessionId: null,
      sessionStartTime: null,
    };
  }

  /**
   * Static helper to determine optimal game mode for a session
   */
  public static getOptimalGameMode(session: Session | null): GameMode {
    if (!session) {
      return 'standalone';
    }

    // Check session end time to determine if it's recent
    const timeSinceEnd = Date.now() - session.end_time;
    const fiveMinutes = 5 * 60 * 1000;

    if (timeSinceEnd < fiveMinutes) {
      return 'post_session';
    }

    return 'standalone';
  }

  /**
   * Static helper to suggest game type based on session type
   */
  public static suggestGameTypeForSession(
    sessionType: string
  ): GameType {
    // Word recall for shorter sessions or calibration
    if (sessionType === 'calibration' || sessionType === 'quick_boost') {
      return 'word_recall';
    }

    // N-back for longer custom sessions
    return 'nback';
  }
}
