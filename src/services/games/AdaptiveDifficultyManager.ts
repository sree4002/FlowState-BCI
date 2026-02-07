/**
 * Adaptive Difficulty Manager
 * Uses Elo-based rating system to dynamically adjust game difficulty
 */

import { AdaptiveDifficultyState } from '../../types/games';

/**
 * Adaptive difficulty configuration
 */
interface AdaptiveDifficultyConfig {
  initialRating: number; // Starting Elo rating (default: 1500)
  kFactor: number; // Learning rate (default: 32)
  minRating: number; // Minimum rating (default: 1000)
  maxRating: number; // Maximum rating (default: 2000)
  minDifficulty: number; // Minimum difficulty level (default: 0)
  maxDifficulty: number; // Maximum difficulty level (default: 10)
}

const DEFAULT_CONFIG: AdaptiveDifficultyConfig = {
  initialRating: 1500,
  kFactor: 32,
  minRating: 1000,
  maxRating: 2000,
  minDifficulty: 0,
  maxDifficulty: 10,
};

/**
 * Adaptive Difficulty Manager class
 * Manages dynamic difficulty adjustment based on player performance
 */
export class AdaptiveDifficultyManager {
  private state: AdaptiveDifficultyState;
  private config: AdaptiveDifficultyConfig;

  constructor(
    initialState?: Partial<AdaptiveDifficultyState>,
    config?: Partial<AdaptiveDifficultyConfig>
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.state = {
      current_rating: initialState?.current_rating ?? this.config.initialRating,
      current_difficulty:
        initialState?.current_difficulty ?? this.ratingToDifficulty(this.config.initialRating),
      games_played: initialState?.games_played ?? 0,
      last_accuracy: initialState?.last_accuracy ?? 0,
    };
  }

  /**
   * Converts Elo rating to difficulty level (0-10)
   */
  private ratingToDifficulty(rating: number): number {
    // Map rating [1000-2000] to difficulty [0-10]
    const normalizedRating = Math.max(
      this.config.minRating,
      Math.min(this.config.maxRating, rating)
    );
    const difficulty =
      ((normalizedRating - this.config.minRating) /
        (this.config.maxRating - this.config.minRating)) *
      (this.config.maxDifficulty - this.config.minDifficulty);

    return Math.round(difficulty * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Converts difficulty level to Elo rating
   */
  private difficultyToRating(difficulty: number): number {
    // Map difficulty [0-10] to rating [1000-2000]
    const normalizedDifficulty = Math.max(
      this.config.minDifficulty,
      Math.min(this.config.maxDifficulty, difficulty)
    );
    return (
      this.config.minRating +
      (normalizedDifficulty / this.config.maxDifficulty) *
        (this.config.maxRating - this.config.minRating)
    );
  }

  /**
   * Calculates expected performance based on current rating and difficulty
   */
  private calculateExpectedPerformance(
    playerRating: number,
    difficultyRating: number
  ): number {
    // Elo expected score formula
    return 1 / (1 + Math.pow(10, (difficultyRating - playerRating) / 400));
  }

  /**
   * Updates rating based on performance
   * @param accuracy - Actual accuracy achieved (0-1)
   * @param difficulty - Difficulty level played at (0-10)
   * @returns New difficulty level
   */
  public updateDifficulty(accuracy: number, difficulty: number): number {
    // Clamp accuracy to [0, 1]
    const clampedAccuracy = Math.max(0, Math.min(1, accuracy));

    // Convert difficulty to rating
    const difficultyRating = this.difficultyToRating(difficulty);

    // Calculate expected performance
    const expectedPerformance = this.calculateExpectedPerformance(
      this.state.current_rating,
      difficultyRating
    );

    // Update rating using Elo formula
    const ratingChange = this.config.kFactor * (clampedAccuracy - expectedPerformance);
    const newRating = Math.max(
      this.config.minRating,
      Math.min(this.config.maxRating, this.state.current_rating + ratingChange)
    );

    // Convert new rating to difficulty
    const newDifficulty = this.ratingToDifficulty(newRating);

    // Update state
    this.state = {
      current_rating: newRating,
      current_difficulty: newDifficulty,
      games_played: this.state.games_played + 1,
      last_accuracy: clampedAccuracy,
    };

    return newDifficulty;
  }

  /**
   * Gets the current difficulty level
   */
  public getCurrentDifficulty(): number {
    return this.state.current_difficulty;
  }

  /**
   * Gets the current rating
   */
  public getCurrentRating(): number {
    return this.state.current_rating;
  }

  /**
   * Gets the complete state
   */
  public getState(): AdaptiveDifficultyState {
    return { ...this.state };
  }

  /**
   * Sets the state (for restoring from saved data)
   */
  public setState(state: AdaptiveDifficultyState): void {
    this.state = { ...state };
  }

  /**
   * Resets to initial state
   */
  public reset(): void {
    this.state = {
      current_rating: this.config.initialRating,
      current_difficulty: this.ratingToDifficulty(this.config.initialRating),
      games_played: 0,
      last_accuracy: 0,
    };
  }

  /**
   * Gets a suggested difficulty for a new player
   */
  public static getStartingDifficulty(): number {
    return 5; // Middle difficulty for new players
  }

  /**
   * Validates if a difficulty level is valid
   */
  public static isValidDifficulty(difficulty: number): boolean {
    return difficulty >= 0 && difficulty <= 10;
  }

  /**
   * Clamps a difficulty value to valid range
   */
  public static clampDifficulty(difficulty: number): number {
    return Math.max(0, Math.min(10, difficulty));
  }
}
