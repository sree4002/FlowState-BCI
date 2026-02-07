/**
 * Type definitions for cognitive games feature
 * Includes Word Recall and N-Back game types
 */

/**
 * Available game types
 */
export type GameType = 'word_recall' | 'nback';

/**
 * Game integration modes
 * - during_session: Integrated with active BCI session, includes theta correlation
 * - pre_session: Testing before a session starts
 * - post_session: Testing after a session ends
 * - standalone: Independent game session
 */
export type GameMode = 'during_session' | 'pre_session' | 'post_session' | 'standalone';

/**
 * Game configuration for starting a new game
 */
export interface GameConfig {
  gameType: GameType;
  mode: GameMode;
  difficulty?: number; // 0-10, undefined for adaptive
  sessionId?: string; // For during/pre/post modes
}

/**
 * Single trial/round in a game
 * Stimulus and response are stored as JSON strings for flexibility
 */
export interface GameTrial {
  trial_number: number;
  stimulus: string; // JSON string of stimulus data
  response: string | null; // JSON string of response
  correct: boolean;
  response_time: number; // milliseconds
  theta_zscore?: number; // For during-session mode
  timestamp: number;
}

/**
 * Aggregate performance metrics for a game session
 */
export interface GamePerformance {
  total_trials: number;
  correct_trials: number;
  accuracy: number; // 0-1
  avg_response_time: number;
  difficulty_start: number;
  difficulty_end: number;
  theta_correlation?: number; // For during-session mode
}

/**
 * Game session record (summary without trial details)
 */
export interface GameSession {
  id: string;
  game_type: GameType;
  mode: GameMode;
  session_id?: string;
  start_time: number;
  end_time: number;
  performance: GamePerformance;
  config: GameConfig;
}

/**
 * Complete game session with trial details
 */
export interface GameSessionDetail extends GameSession {
  trials: GameTrial[];
}

/**
 * Word Recall specific types
 */
export interface WordRecallStimulus {
  words: string[];
  display_duration_ms: number;
  delay_duration_ms: number;
}

export interface WordRecallResponse {
  recalled_words: string[];
  recall_time_ms: number;
}

export interface WordRecallDifficultyParams {
  word_count: number;
  display_duration_ms: number;
  delay_duration_ms: number;
  category?: string;
}

/**
 * N-Back specific types
 */
export interface NBackStimulus {
  position: number; // 0-8 for 3x3 grid
  audio_letter: string;
  is_position_match: boolean;
  is_audio_match: boolean;
}

export interface NBackResponse {
  position_match_pressed: boolean;
  audio_match_pressed: boolean;
  response_time_ms: number;
}

export interface NBackDifficultyParams {
  n_value: number; // 1-4
  trial_count: number;
  stimulus_duration_ms: number;
  inter_stimulus_interval_ms: number;
}

/**
 * Adaptive difficulty manager state
 */
export interface AdaptiveDifficultyState {
  current_rating: number; // Elo-style rating (1000-2000)
  current_difficulty: number; // Mapped to 0-10 scale
  games_played: number;
  last_accuracy: number;
}
