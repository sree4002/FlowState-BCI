/**
 * N-Back Working Memory Task
 * Dual n-back (position + audio) with adaptive difficulty
 */

import {
  GameConfig,
  NBackStimulus,
  NBackResponse,
  NBackDifficultyParams,
} from '../../types/games';
import { CognitiveGameEngine } from './CognitiveGameEngine';

/**
 * Audio letters for n-back task
 */
const AUDIO_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'N', 'Q', 'R', 'T'];

/**
 * N-Back Game Engine
 */
export class NBackGame extends CognitiveGameEngine {
  private positionHistory: number[];
  private audioHistory: string[];
  private currentNValue: number;
  private trialSequence: NBackStimulus[];
  private currentSequenceIndex: number;

  constructor(config: GameConfig) {
    super(config);
    this.positionHistory = [];
    this.audioHistory = [];
    this.currentNValue = 1;
    this.trialSequence = [];
    this.currentSequenceIndex = 0;
  }

  /**
   * Gets difficulty parameters based on difficulty level
   */
  private getDifficultyParams(difficulty: number): NBackDifficultyParams {
    // Level 0-2: 1-back, 20 trials, 3000ms stimulus
    // Level 3-5: 2-back, 25 trials, 2500ms stimulus
    // Level 6-7: 3-back, 30 trials, 2000ms stimulus
    // Level 8-10: 4-back, 40 trials, 1500ms stimulus

    if (difficulty <= 2) {
      return {
        n_value: 1,
        trial_count: 20,
        stimulus_duration_ms: 3000,
        inter_stimulus_interval_ms: 500,
      };
    } else if (difficulty <= 5) {
      return {
        n_value: 2,
        trial_count: 25,
        stimulus_duration_ms: 2500,
        inter_stimulus_interval_ms: 500,
      };
    } else if (difficulty <= 7) {
      return {
        n_value: 3,
        trial_count: 30,
        stimulus_duration_ms: 2000,
        inter_stimulus_interval_ms: 500,
      };
    } else {
      return {
        n_value: 4,
        trial_count: 40,
        stimulus_duration_ms: 1500,
        inter_stimulus_interval_ms: 500,
      };
    }
  }

  /**
   * Generates a complete trial sequence for the current difficulty
   */
  private generateTrialSequence(): NBackStimulus[] {
    const params = this.getDifficultyParams(this.currentDifficulty);
    this.currentNValue = params.n_value;
    const sequence: NBackStimulus[] = [];

    // Target frequency: ~30% position matches, ~30% audio matches, ~10% both
    const targetPositionMatches = Math.floor(params.trial_count * 0.3);
    const targetAudioMatches = Math.floor(params.trial_count * 0.3);

    let positionMatchesCreated = 0;
    let audioMatchesCreated = 0;

    for (let i = 0; i < params.trial_count; i++) {
      let position: number;
      let audioLetter: string;
      let isPositionMatch = false;
      let isAudioMatch = false;

      // Determine if this should be a match trial
      const shouldBePositionMatch =
        i >= this.currentNValue &&
        positionMatchesCreated < targetPositionMatches &&
        Math.random() < 0.4;

      const shouldBeAudioMatch =
        i >= this.currentNValue &&
        audioMatchesCreated < targetAudioMatches &&
        Math.random() < 0.4;

      // Generate position
      if (shouldBePositionMatch && i >= this.currentNValue) {
        position = sequence[i - this.currentNValue].position;
        isPositionMatch = true;
        positionMatchesCreated++;
      } else {
        // Generate random position that doesn't match n-back
        do {
          position = Math.floor(Math.random() * 9);
        } while (
          i >= this.currentNValue &&
          position === sequence[i - this.currentNValue].position
        );
      }

      // Generate audio letter
      if (shouldBeAudioMatch && i >= this.currentNValue) {
        audioLetter = sequence[i - this.currentNValue].audio_letter;
        isAudioMatch = true;
        audioMatchesCreated++;
      } else {
        // Generate random letter that doesn't match n-back
        do {
          audioLetter = AUDIO_LETTERS[Math.floor(Math.random() * AUDIO_LETTERS.length)];
        } while (
          i >= this.currentNValue &&
          audioLetter === sequence[i - this.currentNValue].audio_letter
        );
      }

      sequence.push({
        position,
        audio_letter: audioLetter,
        is_position_match: isPositionMatch,
        is_audio_match: isAudioMatch,
      });
    }

    return sequence;
  }

  /**
   * Generates the next trial stimulus
   */
  public generateNextTrial(): NBackStimulus {
    // Generate new sequence if starting or finished previous sequence
    if (this.currentSequenceIndex === 0 || this.currentSequenceIndex >= this.trialSequence.length) {
      this.trialSequence = this.generateTrialSequence();
      this.currentSequenceIndex = 0;
      this.positionHistory = [];
      this.audioHistory = [];
    }

    const stimulus = this.trialSequence[this.currentSequenceIndex];
    this.currentSequenceIndex++;

    // Update history
    this.positionHistory.push(stimulus.position);
    this.audioHistory.push(stimulus.audio_letter);

    return stimulus;
  }

  /**
   * Validates a trial response
   */
  public validateResponse(
    stimulus: NBackStimulus,
    response: NBackResponse
  ): boolean {
    const positionCorrect =
      stimulus.is_position_match === response.position_match_pressed;
    const audioCorrect =
      stimulus.is_audio_match === response.audio_match_pressed;

    // Both must be correct for the trial to be considered correct
    return positionCorrect && audioCorrect;
  }

  /**
   * Calculates detailed n-back metrics
   */
  public calculateNBackMetrics(
    stimulus: NBackStimulus,
    response: NBackResponse
  ): {
    positionCorrect: boolean;
    audioCorrect: boolean;
    positionHit: boolean;
    positionFalseAlarm: boolean;
    audioHit: boolean;
    audioFalseAlarm: boolean;
  } {
    const positionCorrect =
      stimulus.is_position_match === response.position_match_pressed;
    const audioCorrect =
      stimulus.is_audio_match === response.audio_match_pressed;

    const positionHit = stimulus.is_position_match && response.position_match_pressed;
    const positionFalseAlarm =
      !stimulus.is_position_match && response.position_match_pressed;

    const audioHit = stimulus.is_audio_match && response.audio_match_pressed;
    const audioFalseAlarm = !stimulus.is_audio_match && response.audio_match_pressed;

    return {
      positionCorrect,
      audioCorrect,
      positionHit,
      positionFalseAlarm,
      audioHit,
      audioFalseAlarm,
    };
  }

  /**
   * Gets the current n-value
   */
  public getCurrentNValue(): number {
    return this.currentNValue;
  }

  /**
   * Gets the current position history
   */
  public getPositionHistory(): number[] {
    return [...this.positionHistory];
  }

  /**
   * Gets the current audio history
   */
  public getAudioHistory(): string[] {
    return [...this.audioHistory];
  }

  /**
   * Gets the position that matches n-back (if any)
   */
  public getNBackPosition(): number | null {
    if (this.positionHistory.length < this.currentNValue) {
      return null;
    }
    return this.positionHistory[this.positionHistory.length - this.currentNValue];
  }

  /**
   * Gets the audio letter that matches n-back (if any)
   */
  public getNBackAudioLetter(): string | null {
    if (this.audioHistory.length < this.currentNValue) {
      return null;
    }
    return this.audioHistory[this.audioHistory.length - this.currentNValue];
  }

  /**
   * Gets the total trial count for current sequence
   */
  public getTotalTrialsInSequence(): number {
    return this.trialSequence.length;
  }

  /**
   * Gets the current trial index in sequence
   */
  public getCurrentTrialIndex(): number {
    return this.currentSequenceIndex;
  }

  // Implement abstract methods

  protected onGameStart(): void {
    // Generate initial sequence
    this.trialSequence = this.generateTrialSequence();
    this.currentSequenceIndex = 0;
    this.positionHistory = [];
    this.audioHistory = [];
  }

  protected onGamePause(): void {
    // No specific action needed
  }

  protected onGameResume(): void {
    // No specific action needed
  }

  protected onGameEnd(): void {
    // Clear sequence
    this.trialSequence = [];
    this.currentSequenceIndex = 0;
    this.positionHistory = [];
    this.audioHistory = [];
  }

  protected onDifficultyChanged(newDifficulty: number): void {
    // New difficulty will be used when generating next sequence
    // Don't interrupt current sequence
  }

  /**
   * Static helper to get n-value for a difficulty level
   */
  public static getNValueForDifficulty(difficulty: number): number {
    if (difficulty <= 2) return 1;
    if (difficulty <= 5) return 2;
    if (difficulty <= 7) return 3;
    return 4;
  }

  /**
   * Static helper to get all available audio letters
   */
  public static getAudioLetters(): string[] {
    return [...AUDIO_LETTERS];
  }

  /**
   * Static helper to convert position index to grid coordinates (0-8 -> [row, col])
   */
  public static positionToGrid(position: number): [number, number] {
    const row = Math.floor(position / 3);
    const col = position % 3;
    return [row, col];
  }

  /**
   * Static helper to convert grid coordinates to position index ([row, col] -> 0-8)
   */
  public static gridToPosition(row: number, col: number): number {
    return row * 3 + col;
  }
}
