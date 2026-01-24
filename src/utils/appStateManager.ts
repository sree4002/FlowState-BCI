/**
 * FlowState BCI - App State Management
 *
 * Handles app state persistence for background/foreground transitions.
 * Saves and restores session state when the app is backgrounded.
 */

import { AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Keys for app state persistence
 */
const STORAGE_KEYS = {
  ACTIVE_SESSION: '@flowstate/active_session',
  SESSION_TIMESTAMP: '@flowstate/session_timestamp',
  APP_STATE_HISTORY: '@flowstate/app_state_history',
} as const;

/**
 * Persisted session state
 */
export interface PersistedSessionState {
  /** Session ID if any */
  sessionId?: string;
  /** Session type */
  sessionType?: 'quick_boost' | 'calibration' | 'custom';
  /** Elapsed time in seconds when backgrounded */
  elapsedSeconds: number;
  /** Session state (running, paused, etc.) */
  sessionState: string;
  /** Current theta z-score */
  currentThetaZScore: number | null;
  /** Entrainment frequency */
  entrainmentFrequency: number;
  /** Volume level */
  volume: number;
  /** Timestamp when backgrounded */
  backgroundedAt: number;
  /** Whether session was paused before backgrounding */
  wasPaused: boolean;
}

/**
 * App state transition record
 */
export interface AppStateTransition {
  from: AppStateStatus;
  to: AppStateStatus;
  timestamp: number;
}

/**
 * Callback type for app state change handlers
 */
export type AppStateChangeHandler = (
  currentState: AppStateStatus,
  previousState: AppStateStatus
) => void;

/**
 * AppStateManager class
 *
 * Manages app lifecycle events and persists session state
 * when the app goes to background.
 */
class AppStateManagerClass {
  private currentAppState: AppStateStatus;
  private listeners: Map<string, AppStateChangeHandler>;
  private stateHistory: AppStateTransition[];
  private maxHistorySize: number;
  private subscription: { remove: () => void } | null;

  constructor() {
    this.currentAppState = AppState.currentState;
    this.listeners = new Map();
    this.stateHistory = [];
    this.maxHistorySize = 50;
    this.subscription = null;
  }

  /**
   * Initialize the app state manager
   * Call this once when the app starts
   */
  initialize(): void {
    if (this.subscription) {
      return; // Already initialized
    }

    this.subscription = AppState.addEventListener('change', this.handleAppStateChange);
    this.loadStateHistory();
  }

  /**
   * Clean up the app state manager
   */
  cleanup(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.listeners.clear();
  }

  /**
   * Handle app state changes
   */
  private handleAppStateChange = (nextAppState: AppStateStatus): void => {
    const previousState = this.currentAppState;

    // Record transition
    this.recordTransition(previousState, nextAppState);

    // Notify listeners
    this.listeners.forEach((handler) => {
      try {
        handler(nextAppState, previousState);
      } catch (error) {
        console.error('[AppStateManager] Error in listener:', error);
      }
    });

    this.currentAppState = nextAppState;
  };

  /**
   * Record a state transition
   */
  private recordTransition(from: AppStateStatus, to: AppStateStatus): void {
    const transition: AppStateTransition = {
      from,
      to,
      timestamp: Date.now(),
    };

    this.stateHistory.push(transition);

    // Trim history if needed
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory = this.stateHistory.slice(-this.maxHistorySize);
    }

    // Persist history asynchronously
    this.saveStateHistory();
  }

  /**
   * Add a listener for app state changes
   * @returns A function to remove the listener
   */
  addListener(id: string, handler: AppStateChangeHandler): () => void {
    this.listeners.set(id, handler);
    return () => this.removeListener(id);
  }

  /**
   * Remove a listener
   */
  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  /**
   * Get current app state
   */
  getCurrentState(): AppStateStatus {
    return this.currentAppState;
  }

  /**
   * Check if app is in foreground
   */
  isActive(): boolean {
    return this.currentAppState === 'active';
  }

  /**
   * Check if app is in background
   */
  isBackground(): boolean {
    return this.currentAppState === 'background';
  }

  /**
   * Check if app is inactive (transitioning)
   */
  isInactive(): boolean {
    return this.currentAppState === 'inactive';
  }

  /**
   * Get state transition history
   */
  getStateHistory(): AppStateTransition[] {
    return [...this.stateHistory];
  }

  /**
   * Save session state for background persistence
   */
  async saveSessionState(state: PersistedSessionState): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.ACTIVE_SESSION,
        JSON.stringify(state)
      );
      await AsyncStorage.setItem(
        STORAGE_KEYS.SESSION_TIMESTAMP,
        Date.now().toString()
      );
    } catch (error) {
      console.error('[AppStateManager] Failed to save session state:', error);
    }
  }

  /**
   * Load persisted session state
   */
  async loadSessionState(): Promise<PersistedSessionState | null> {
    try {
      const stateJson = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
      const timestampStr = await AsyncStorage.getItem(STORAGE_KEYS.SESSION_TIMESTAMP);

      if (!stateJson || !timestampStr) {
        return null;
      }

      const timestamp = parseInt(timestampStr, 10);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      // Don't restore sessions older than 24 hours
      if (now - timestamp > maxAge) {
        await this.clearSessionState();
        return null;
      }

      return JSON.parse(stateJson) as PersistedSessionState;
    } catch (error) {
      console.error('[AppStateManager] Failed to load session state:', error);
      return null;
    }
  }

  /**
   * Clear persisted session state
   */
  async clearSessionState(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACTIVE_SESSION,
        STORAGE_KEYS.SESSION_TIMESTAMP,
      ]);
    } catch (error) {
      console.error('[AppStateManager] Failed to clear session state:', error);
    }
  }

  /**
   * Calculate time elapsed while in background
   */
  calculateBackgroundDuration(backgroundedAt: number): number {
    const now = Date.now();
    return Math.floor((now - backgroundedAt) / 1000); // seconds
  }

  /**
   * Save state history
   */
  private async saveStateHistory(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_STATE_HISTORY,
        JSON.stringify(this.stateHistory)
      );
    } catch (error) {
      console.error('[AppStateManager] Failed to save state history:', error);
    }
  }

  /**
   * Load state history
   */
  private async loadStateHistory(): Promise<void> {
    try {
      const historyJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE_HISTORY);
      if (historyJson) {
        this.stateHistory = JSON.parse(historyJson);
      }
    } catch (error) {
      console.error('[AppStateManager] Failed to load state history:', error);
      this.stateHistory = [];
    }
  }

  /**
   * Get the duration of the last background period
   */
  getLastBackgroundDuration(): number | null {
    const history = this.stateHistory;
    let backgroundStart: number | null = null;
    let backgroundEnd: number | null = null;

    // Find the most recent background-to-active transition
    for (let i = history.length - 1; i >= 0; i--) {
      const transition = history[i];
      if (transition.to === 'active' && backgroundEnd === null) {
        backgroundEnd = transition.timestamp;
      }
      if (transition.to === 'background' && backgroundEnd !== null) {
        backgroundStart = transition.timestamp;
        break;
      }
    }

    if (backgroundStart !== null && backgroundEnd !== null) {
      return Math.floor((backgroundEnd - backgroundStart) / 1000);
    }

    return null;
  }
}

// Export singleton instance
export const AppStateManager = new AppStateManagerClass();

/**
 * Hook helper for using app state in functional components
 */
export function createAppStateListener(
  onForeground?: () => void,
  onBackground?: () => void
): () => void {
  const id = `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const handler: AppStateChangeHandler = (current, previous) => {
    if (current === 'active' && previous !== 'active') {
      onForeground?.();
    } else if (current === 'background' && previous !== 'background') {
      onBackground?.();
    }
  };

  return AppStateManager.addListener(id, handler);
}

export default AppStateManager;
