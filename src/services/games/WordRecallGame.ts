/**
 * Word Recall Memory Test Game
 * Display words, test recall after delay with adaptive difficulty
 */

import {
  GameConfig,
  WordRecallStimulus,
  WordRecallResponse,
  WordRecallDifficultyParams,
} from '../../types/games';
import { CognitiveGameEngine } from './CognitiveGameEngine';

/**
 * Word pools for different difficulty levels and categories
 */
const WORD_POOLS = {
  easy: [
    'cat', 'dog', 'sun', 'moon', 'star', 'tree', 'book', 'chair', 'table', 'door',
    'car', 'bus', 'bird', 'fish', 'lamp', 'ball', 'shoe', 'hand', 'foot', 'head',
    'eye', 'ear', 'nose', 'cake', 'milk', 'bread', 'water', 'apple', 'orange', 'grape',
  ],
  medium: [
    'mountain', 'ocean', 'forest', 'desert', 'river', 'garden', 'kitchen', 'bedroom', 'office', 'library',
    'computer', 'telephone', 'television', 'bicycle', 'airplane', 'umbrella', 'keyboard', 'window', 'mirror', 'picture',
    'notebook', 'calendar', 'magazine', 'newspaper', 'violin', 'guitar', 'piano', 'trumpet', 'drum', 'flute',
  ],
  hard: [
    'architecture', 'philosophy', 'psychology', 'technology', 'astronomy', 'biology', 'chemistry', 'geography', 'history', 'literature',
    'mathematics', 'medicine', 'photography', 'sculpture', 'democracy', 'encyclopedia', 'hypothesis', 'laboratory', 'microscope', 'observatory',
    'parliament', 'restaurant', 'university', 'vocabulary', 'temperature', 'atmosphere', 'calculator', 'dictionary', 'elevator', 'microphone',
  ],
  abstract: [
    'freedom', 'justice', 'courage', 'wisdom', 'beauty', 'truth', 'faith', 'hope', 'love', 'peace',
    'power', 'honor', 'mercy', 'grace', 'virtue', 'spirit', 'thought', 'memory', 'dream', 'desire',
    'emotion', 'passion', 'reason', 'logic', 'chaos', 'order', 'balance', 'harmony', 'conflict', 'unity',
  ],
};

/**
 * Word Recall Game Engine
 */
export class WordRecallGame extends CognitiveGameEngine {
  private currentStimulus: WordRecallStimulus | null;
  private usedWords: Set<string>;

  constructor(config: GameConfig) {
    super(config);
    this.currentStimulus = null;
    this.usedWords = new Set();
  }

  /**
   * Gets difficulty parameters based on difficulty level
   */
  private getDifficultyParams(difficulty: number): WordRecallDifficultyParams {
    // Level 0-2: 5-7 words, 30s display, 10s delay
    // Level 3-5: 8-12 words, 20s display, 30s delay
    // Level 6-8: 13-17 words, 15s display, 60s delay
    // Level 9-10: 18-20 words, 10s display, 90s delay

    if (difficulty <= 2) {
      return {
        word_count: 5 + Math.floor(difficulty * 1), // 5-7
        display_duration_ms: 30000,
        delay_duration_ms: 10000,
        category: 'easy',
      };
    } else if (difficulty <= 5) {
      return {
        word_count: 8 + Math.floor((difficulty - 3) * 1.33), // 8-12
        display_duration_ms: 20000,
        delay_duration_ms: 30000,
        category: 'medium',
      };
    } else if (difficulty <= 8) {
      return {
        word_count: 13 + Math.floor((difficulty - 6) * 1.33), // 13-17
        display_duration_ms: 15000,
        delay_duration_ms: 60000,
        category: 'hard',
      };
    } else {
      return {
        word_count: 18 + Math.floor((difficulty - 9) * 2), // 18-20
        display_duration_ms: 10000,
        delay_duration_ms: 90000,
        category: 'abstract',
      };
    }
  }

  /**
   * Selects random words from the appropriate pool
   */
  private selectWords(count: number, category: string): string[] {
    const pool = WORD_POOLS[category as keyof typeof WORD_POOLS] || WORD_POOLS.easy;
    const availableWords = pool.filter((word) => !this.usedWords.has(word));

    // If we've used too many words, reset the used set
    if (availableWords.length < count) {
      this.usedWords.clear();
    }

    // Shuffle and select
    const shuffled = [...availableWords].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, count);

    // Mark as used
    selected.forEach((word) => this.usedWords.add(word));

    return selected;
  }

  /**
   * Generates the next trial stimulus
   */
  public generateNextTrial(): WordRecallStimulus {
    const params = this.getDifficultyParams(this.currentDifficulty);
    const words = this.selectWords(params.word_count, params.category || 'easy');

    this.currentStimulus = {
      words,
      display_duration_ms: params.display_duration_ms,
      delay_duration_ms: params.delay_duration_ms,
    };

    return this.currentStimulus;
  }

  /**
   * Validates a trial response
   */
  public validateResponse(
    stimulus: WordRecallStimulus,
    response: WordRecallResponse
  ): boolean {
    const stimulusWords = new Set(
      stimulus.words.map((w) => w.toLowerCase().trim())
    );
    const recalledWords = new Set(
      response.recalled_words.map((w) => w.toLowerCase().trim())
    );

    // Count correct recalls
    let correctCount = 0;
    for (const word of recalledWords) {
      if (stimulusWords.has(word)) {
        correctCount++;
      }
    }

    // Calculate accuracy (correct recalls / total words)
    const accuracy = correctCount / stimulus.words.length;

    // Consider correct if accuracy >= 70%
    return accuracy >= 0.7;
  }

  /**
   * Calculates detailed recall metrics
   */
  public calculateRecallMetrics(
    stimulus: WordRecallStimulus,
    response: WordRecallResponse
  ): {
    correctRecalls: number;
    missedWords: number;
    falseRecalls: number;
    accuracy: number;
  } {
    const stimulusWords = new Set(
      stimulus.words.map((w) => w.toLowerCase().trim())
    );
    const recalledWords = response.recalled_words.map((w) =>
      w.toLowerCase().trim()
    );

    let correctRecalls = 0;
    let falseRecalls = 0;

    for (const word of recalledWords) {
      if (stimulusWords.has(word)) {
        correctRecalls++;
      } else {
        falseRecalls++;
      }
    }

    const missedWords = stimulus.words.length - correctRecalls;
    const accuracy = correctRecalls / stimulus.words.length;

    return {
      correctRecalls,
      missedWords,
      falseRecalls,
      accuracy,
    };
  }

  /**
   * Gets the current stimulus
   */
  public getCurrentStimulus(): WordRecallStimulus | null {
    return this.currentStimulus;
  }

  // Implement abstract methods

  protected onGameStart(): void {
    // Reset used words at start
    this.usedWords.clear();
  }

  protected onGamePause(): void {
    // No specific action needed
  }

  protected onGameResume(): void {
    // No specific action needed
  }

  protected onGameEnd(): void {
    // Clear current stimulus
    this.currentStimulus = null;
  }

  protected onDifficultyChanged(newDifficulty: number): void {
    // Difficulty will be used in next trial generation
  }

  /**
   * Static helper to get word count for a difficulty level
   */
  public static getWordCountForDifficulty(difficulty: number): number {
    if (difficulty <= 2) return 5 + Math.floor(difficulty * 1);
    if (difficulty <= 5) return 8 + Math.floor((difficulty - 3) * 1.33);
    if (difficulty <= 8) return 13 + Math.floor((difficulty - 6) * 1.33);
    return 18 + Math.floor((difficulty - 9) * 2);
  }

  /**
   * Static helper to get all available word categories
   */
  public static getWordCategories(): string[] {
    return Object.keys(WORD_POOLS);
  }

  /**
   * Static helper to get word pool for a category
   */
  public static getWordPool(category: string): string[] {
    return WORD_POOLS[category as keyof typeof WORD_POOLS] || WORD_POOLS.easy;
  }
}
