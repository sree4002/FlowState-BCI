/**
 * Base class for cognitive game engines
 * Provides common functionality for game state management and trial recording
 */

import {
  GameConfig,
  GameTrial,
  GameSessionDetail,
  GamePerformance,
} from '../../types/games';
import { AdaptiveDifficultyManager } from './AdaptiveDifficultyManager';

/**
 * Game engine state
 */
export type GameEngineState = 'idle' | 'running' | 'paused' | 'completed';

/**
 * Base class for all cognitive game engines
 */
export abstract class CognitiveGameEngine {
  protected config: GameConfig;
  protected state: GameEngineState;
  protected trials: GameTrial[];
  protected currentTrialNumber: number;
  protected startTime: number;
  protected endTime: number;
  protected sessionId: string;
  protected difficultyManager: AdaptiveDifficultyManager | null;
  protected currentDifficulty: number;

  constructor(config: GameConfig) {
    this.config = config;
    this.state = 'idle';
    this.trials = [];
    this.currentTrialNumber = 0;
    this.startTime = 0;
    this.endTime = 0;
    this.sessionId = this.generateSessionId();

    // Initialize difficulty
    if (config.difficulty === undefined) {
      // Adaptive mode
      this.difficultyManager = new AdaptiveDifficultyManager();
      this.currentDifficulty = this.difficultyManager.getCurrentDifficulty();
    } else {
      // Fixed difficulty mode
      this.difficultyManager = null;
      this.currentDifficulty = AdaptiveDifficultyManager.clampDifficulty(
        config.difficulty
      );
    }
  }

  /**
   * Generates a unique session ID
   */
  protected generateSessionId(): string {
    return `${this.config.gameType}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Starts the game
   */
  public start(): void {
    if (this.state !== 'idle') {
      throw new Error('Game has already started');
    }

    this.state = 'running';
    this.startTime = Date.now();
    this.onGameStart();
  }

  /**
   * Pauses the game
   */
  public pause(): void {
    if (this.state !== 'running') {
      throw new Error('Game is not running');
    }

    this.state = 'paused';
    this.onGamePause();
  }

  /**
   * Resumes the game
   */
  public resume(): void {
    if (this.state !== 'paused') {
      throw new Error('Game is not paused');
    }

    this.state = 'running';
    this.onGameResume();
  }

  /**
   * Ends the game
   */
  public end(): GameSessionDetail {
    if (this.state === 'idle') {
      throw new Error('Game has not started');
    }

    this.state = 'completed';
    this.endTime = Date.now();
    this.onGameEnd();

    return this.getSessionDetail();
  }

  /**
   * Records a trial response
   */
  public recordTrial(
    stimulus: any,
    response: any,
    correct: boolean,
    responseTime: number,
    thetaZScore?: number
  ): void {
    if (this.state !== 'running') {
      throw new Error('Game is not running');
    }

    const trial: GameTrial = {
      trial_number: this.currentTrialNumber,
      stimulus: JSON.stringify(stimulus),
      response: response ? JSON.stringify(response) : null,
      correct,
      response_time: responseTime,
      theta_zscore: thetaZScore,
      timestamp: Date.now(),
    };

    this.trials.push(trial);
    this.currentTrialNumber++;

    // Update difficulty if adaptive mode
    if (this.difficultyManager && this.shouldUpdateDifficulty()) {
      const recentAccuracy = this.calculateRecentAccuracy();
      const newDifficulty = this.difficultyManager.updateDifficulty(
        recentAccuracy,
        this.currentDifficulty
      );
      this.currentDifficulty = newDifficulty;
      this.onDifficultyChanged(newDifficulty);
    }
  }

  /**
   * Gets the current game state
   */
  public getState(): GameEngineState {
    return this.state;
  }

  /**
   * Gets the session ID
   */
  public getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Gets the current difficulty
   */
  public getCurrentDifficulty(): number {
    return this.currentDifficulty;
  }

  /**
   * Gets the current trial number
   */
  public getCurrentTrialNumber(): number {
    return this.currentTrialNumber;
  }

  /**
   * Gets all recorded trials
   */
  public getTrials(): GameTrial[] {
    return [...this.trials];
  }

  /**
   * Calculates performance metrics
   */
  protected calculatePerformance(): GamePerformance {
    const totalTrials = this.trials.length;
    const correctTrials = this.trials.filter((t) => t.correct).length;
    const accuracy = totalTrials > 0 ? correctTrials / totalTrials : 0;

    const avgResponseTime =
      totalTrials > 0
        ? this.trials.reduce((sum, t) => sum + t.response_time, 0) / totalTrials
        : 0;

    const difficultyStart =
      this.config.difficulty ?? AdaptiveDifficultyManager.getStartingDifficulty();

    // Calculate theta correlation if applicable
    let thetaCorrelation: number | undefined;
    if (this.config.mode === 'during_session') {
      thetaCorrelation = this.calculateThetaCorrelation();
    }

    return {
      total_trials: totalTrials,
      correct_trials: correctTrials,
      accuracy,
      avg_response_time: avgResponseTime,
      difficulty_start: difficultyStart,
      difficulty_end: this.currentDifficulty,
      theta_correlation: thetaCorrelation,
    };
  }

  /**
   * Gets the complete session detail
   */
  protected getSessionDetail(): GameSessionDetail {
    return {
      id: this.sessionId,
      game_type: this.config.gameType,
      mode: this.config.mode,
      session_id: this.config.sessionId,
      start_time: this.startTime,
      end_time: this.endTime,
      performance: this.calculatePerformance(),
      config: this.config,
      trials: this.getTrials(),
    };
  }

  /**
   * Calculates recent accuracy (last 5 trials)
   */
  protected calculateRecentAccuracy(): number {
    const recentTrials = this.trials.slice(-5);
    if (recentTrials.length === 0) return 0;

    const correctCount = recentTrials.filter((t) => t.correct).length;
    return correctCount / recentTrials.length;
  }

  /**
   * Determines if difficulty should be updated
   * Updates every 5 trials
   */
  protected shouldUpdateDifficulty(): boolean {
    return this.currentTrialNumber > 0 && this.currentTrialNumber % 5 === 0;
  }

  /**
   * Calculates correlation between theta z-scores and performance
   */
  protected calculateThetaCorrelation(): number | undefined {
    const trialsWithTheta = this.trials.filter((t) => t.theta_zscore !== undefined);
    if (trialsWithTheta.length < 3) {
      return undefined;
    }

    // Calculate Pearson correlation between theta z-score and correctness
    const n = trialsWithTheta.length;
    const thetaValues = trialsWithTheta.map((t) => t.theta_zscore!);
    const correctValues = trialsWithTheta.map((t) => (t.correct ? 1 : 0));

    const meanTheta = thetaValues.reduce((a, b) => a + b, 0) / n;
    const meanCorrect = correctValues.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let thetaVariance = 0;
    let correctVariance = 0;

    for (let i = 0; i < n; i++) {
      const thetaDiff = thetaValues[i] - meanTheta;
      const correctDiff = correctValues[i] - meanCorrect;
      numerator += thetaDiff * correctDiff;
      thetaVariance += thetaDiff * thetaDiff;
      correctVariance += correctDiff * correctDiff;
    }

    const denominator = Math.sqrt(thetaVariance * correctVariance);
    if (denominator === 0) return undefined;

    return numerator / denominator;
  }

  // Abstract methods to be implemented by subclasses

  /**
   * Called when game starts
   */
  protected abstract onGameStart(): void;

  /**
   * Called when game is paused
   */
  protected abstract onGamePause(): void;

  /**
   * Called when game is resumed
   */
  protected abstract onGameResume(): void;

  /**
   * Called when game ends
   */
  protected abstract onGameEnd(): void;

  /**
   * Called when difficulty changes (adaptive mode only)
   */
  protected abstract onDifficultyChanged(newDifficulty: number): void;

  /**
   * Generates the next trial stimulus
   */
  public abstract generateNextTrial(): any;

  /**
   * Validates a trial response
   */
  public abstract validateResponse(stimulus: any, response: any): boolean;
}
