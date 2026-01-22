/**
 * SessionStateMachine - Manages the session state lifecycle
 *
 * State transitions:
 * - idle → running (start session)
 * - running → paused (pause session)
 * - running → stopped (stop session)
 * - paused → running (resume session)
 * - paused → stopped (stop session while paused)
 * - stopped → idle (reset session)
 *
 * Invalid transitions are rejected with an error.
 */

import { SessionState, SessionConfig, Session } from '../types';

/**
 * Session state machine event types
 */
export type SessionEvent =
  | 'START'
  | 'PAUSE'
  | 'RESUME'
  | 'STOP'
  | 'RESET'
  | 'TICK';

/**
 * Session state machine transition result
 */
export interface TransitionResult {
  success: boolean;
  previousState: SessionState;
  newState: SessionState;
  event: SessionEvent;
  error?: string;
}

/**
 * Session timer state
 */
export interface SessionTimerState {
  elapsedSeconds: number;
  remainingSeconds: number | null;
  isComplete: boolean;
  startTimestamp: number | null;
  pausedAt: number | null;
  totalPausedDuration: number;
}

/**
 * Session state machine listener callback type
 */
export type SessionStateListener = (
  newState: SessionState,
  previousState: SessionState,
  event: SessionEvent
) => void;

/**
 * Session timer listener callback type
 */
export type SessionTimerListener = (timerState: SessionTimerState) => void;

/**
 * Session completion listener callback type
 */
export type SessionCompletionListener = (sessionData: Partial<Session>) => void;

/**
 * Valid state transitions map
 * Key: current state, Value: array of valid events and resulting states
 */
const VALID_TRANSITIONS: Record<
  SessionState,
  Partial<Record<SessionEvent, SessionState>>
> = {
  idle: {
    START: 'running',
  },
  running: {
    PAUSE: 'paused',
    STOP: 'stopped',
    TICK: 'running',
  },
  paused: {
    RESUME: 'running',
    STOP: 'stopped',
  },
  stopped: {
    RESET: 'idle',
  },
};

/**
 * Checks if a transition is valid
 */
export const isValidTransition = (
  currentState: SessionState,
  event: SessionEvent
): boolean => {
  const validEvents = VALID_TRANSITIONS[currentState];
  return validEvents !== undefined && event in validEvents;
};

/**
 * Gets the next state for a given event
 */
export const getNextState = (
  currentState: SessionState,
  event: SessionEvent
): SessionState | null => {
  const validEvents = VALID_TRANSITIONS[currentState];
  if (!validEvents || !(event in validEvents)) {
    return null;
  }
  return validEvents[event] ?? null;
};

/**
 * Gets available events for the current state
 */
export const getAvailableEvents = (currentState: SessionState): SessionEvent[] => {
  const validEvents = VALID_TRANSITIONS[currentState];
  if (!validEvents) {
    return [];
  }
  return Object.keys(validEvents) as SessionEvent[];
};

/**
 * Checks if session can be started from current state
 */
export const canStart = (currentState: SessionState): boolean => {
  return isValidTransition(currentState, 'START');
};

/**
 * Checks if session can be paused from current state
 */
export const canPause = (currentState: SessionState): boolean => {
  return isValidTransition(currentState, 'PAUSE');
};

/**
 * Checks if session can be resumed from current state
 */
export const canResume = (currentState: SessionState): boolean => {
  return isValidTransition(currentState, 'RESUME');
};

/**
 * Checks if session can be stopped from current state
 */
export const canStop = (currentState: SessionState): boolean => {
  return isValidTransition(currentState, 'STOP');
};

/**
 * Checks if session can be reset from current state
 */
export const canReset = (currentState: SessionState): boolean => {
  return isValidTransition(currentState, 'RESET');
};

/**
 * Checks if session is in an active state (running or paused)
 */
export const isSessionActive = (currentState: SessionState): boolean => {
  return currentState === 'running' || currentState === 'paused';
};

/**
 * Checks if session is running
 */
export const isSessionRunning = (currentState: SessionState): boolean => {
  return currentState === 'running';
};

/**
 * Checks if session is paused
 */
export const isSessionPaused = (currentState: SessionState): boolean => {
  return currentState === 'paused';
};

/**
 * Checks if session is stopped
 */
export const isSessionStopped = (currentState: SessionState): boolean => {
  return currentState === 'stopped';
};

/**
 * Checks if session is idle
 */
export const isSessionIdle = (currentState: SessionState): boolean => {
  return currentState === 'idle';
};

/**
 * Formats seconds to MM:SS string
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(Math.abs(seconds) / 60);
  const secs = Math.abs(seconds) % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Formats seconds to HH:MM:SS string for longer durations
 */
export const formatTimeLong = (seconds: number): string => {
  const hours = Math.floor(Math.abs(seconds) / 3600);
  const mins = Math.floor((Math.abs(seconds) % 3600) / 60);
  const secs = Math.abs(seconds) % 60;
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return formatTime(seconds);
};

/**
 * SessionStateMachine class
 * Manages the complete session lifecycle including state transitions and timer
 */
export class SessionStateMachine {
  private currentState: SessionState = 'idle';
  private config: SessionConfig | null = null;
  private timerState: SessionTimerState = {
    elapsedSeconds: 0,
    remainingSeconds: null,
    isComplete: false,
    startTimestamp: null,
    pausedAt: null,
    totalPausedDuration: 0,
  };
  private timerIntervalId: ReturnType<typeof setInterval> | null = null;
  private stateListeners: Set<SessionStateListener> = new Set();
  private timerListeners: Set<SessionTimerListener> = new Set();
  private completionListeners: Set<SessionCompletionListener> = new Set();

  /**
   * Creates a new SessionStateMachine instance
   */
  constructor() {
    this.reset();
  }

  /**
   * Gets the current session state
   */
  getState(): SessionState {
    return this.currentState;
  }

  /**
   * Gets the current session config
   */
  getConfig(): SessionConfig | null {
    return this.config;
  }

  /**
   * Gets the current timer state
   */
  getTimerState(): SessionTimerState {
    return { ...this.timerState };
  }

  /**
   * Sets the session configuration
   */
  setConfig(config: SessionConfig): void {
    if (this.currentState !== 'idle') {
      throw new Error('Cannot set config while session is active');
    }
    this.config = config;
    this.timerState.remainingSeconds = config.duration_minutes * 60;
  }

  /**
   * Adds a state change listener
   */
  addStateListener(listener: SessionStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Adds a timer update listener
   */
  addTimerListener(listener: SessionTimerListener): () => void {
    this.timerListeners.add(listener);
    return () => this.timerListeners.delete(listener);
  }

  /**
   * Adds a session completion listener
   */
  addCompletionListener(listener: SessionCompletionListener): () => void {
    this.completionListeners.add(listener);
    return () => this.completionListeners.delete(listener);
  }

  /**
   * Notifies all state listeners of a state change
   */
  private notifyStateListeners(
    newState: SessionState,
    previousState: SessionState,
    event: SessionEvent
  ): void {
    this.stateListeners.forEach((listener) => {
      try {
        listener(newState, previousState, event);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Notifies all timer listeners of a timer update
   */
  private notifyTimerListeners(): void {
    const timerState = this.getTimerState();
    this.timerListeners.forEach((listener) => {
      try {
        listener(timerState);
      } catch (error) {
        console.error('Error in timer listener:', error);
      }
    });
  }

  /**
   * Notifies all completion listeners when session ends
   */
  private notifyCompletionListeners(): void {
    const sessionData: Partial<Session> = {
      session_type: this.config?.type ?? 'custom',
      start_time: this.timerState.startTimestamp ?? Date.now(),
      end_time: Date.now(),
      duration_seconds: this.timerState.elapsedSeconds,
      entrainment_freq: this.config?.entrainment_freq ?? 6,
      volume: this.config?.volume ?? 50,
    };
    this.completionListeners.forEach((listener) => {
      try {
        listener(sessionData);
      } catch (error) {
        console.error('Error in completion listener:', error);
      }
    });
  }

  /**
   * Performs a state transition
   */
  transition(event: SessionEvent): TransitionResult {
    const previousState = this.currentState;
    const newState = getNextState(this.currentState, event);

    if (newState === null) {
      return {
        success: false,
        previousState,
        newState: previousState,
        event,
        error: `Invalid transition: cannot ${event} from ${previousState} state`,
      };
    }

    this.currentState = newState;
    this.handleTransitionSideEffects(event, previousState, newState);
    this.notifyStateListeners(newState, previousState, event);

    return {
      success: true,
      previousState,
      newState,
      event,
    };
  }

  /**
   * Handles side effects of state transitions
   */
  private handleTransitionSideEffects(
    event: SessionEvent,
    previousState: SessionState,
    newState: SessionState
  ): void {
    switch (event) {
      case 'START':
        this.startTimer();
        break;
      case 'PAUSE':
        this.pauseTimer();
        break;
      case 'RESUME':
        this.resumeTimer();
        break;
      case 'STOP':
        this.stopTimer();
        this.notifyCompletionListeners();
        break;
      case 'RESET':
        this.resetTimer();
        break;
      case 'TICK':
        // Tick is handled by the timer itself
        break;
    }
  }

  /**
   * Starts the session timer
   */
  private startTimer(): void {
    this.timerState.startTimestamp = Date.now();
    this.timerState.elapsedSeconds = 0;
    this.timerState.isComplete = false;
    this.timerState.pausedAt = null;
    this.timerState.totalPausedDuration = 0;

    if (this.config) {
      this.timerState.remainingSeconds = this.config.duration_minutes * 60;
    }

    this.startTimerInterval();
  }

  /**
   * Starts the timer interval
   */
  private startTimerInterval(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
    }

    this.timerIntervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Timer tick - increments elapsed time
   */
  private tick(): void {
    if (this.currentState !== 'running') {
      return;
    }

    this.timerState.elapsedSeconds += 1;

    if (this.timerState.remainingSeconds !== null) {
      this.timerState.remainingSeconds -= 1;

      if (this.timerState.remainingSeconds <= 0) {
        this.timerState.remainingSeconds = 0;
        this.timerState.isComplete = true;
        this.transition('STOP');
        return;
      }
    }

    this.notifyTimerListeners();
  }

  /**
   * Pauses the session timer
   */
  private pauseTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.timerState.pausedAt = Date.now();
    this.notifyTimerListeners();
  }

  /**
   * Resumes the session timer
   */
  private resumeTimer(): void {
    if (this.timerState.pausedAt !== null) {
      const pausedDuration = Date.now() - this.timerState.pausedAt;
      this.timerState.totalPausedDuration += pausedDuration;
      this.timerState.pausedAt = null;
    }
    this.startTimerInterval();
    this.notifyTimerListeners();
  }

  /**
   * Stops the session timer
   */
  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.notifyTimerListeners();
  }

  /**
   * Resets the timer state
   */
  private resetTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.timerState = {
      elapsedSeconds: 0,
      remainingSeconds: this.config ? this.config.duration_minutes * 60 : null,
      isComplete: false,
      startTimestamp: null,
      pausedAt: null,
      totalPausedDuration: 0,
    };
    this.notifyTimerListeners();
  }

  /**
   * Convenience method to start the session
   */
  start(): TransitionResult {
    return this.transition('START');
  }

  /**
   * Convenience method to pause the session
   */
  pause(): TransitionResult {
    return this.transition('PAUSE');
  }

  /**
   * Convenience method to resume the session
   */
  resume(): TransitionResult {
    return this.transition('RESUME');
  }

  /**
   * Convenience method to stop the session
   */
  stop(): TransitionResult {
    return this.transition('STOP');
  }

  /**
   * Resets the session to idle state
   */
  reset(): TransitionResult {
    // If already idle, just reset the timer
    if (this.currentState === 'idle') {
      this.resetTimer();
      return {
        success: true,
        previousState: 'idle',
        newState: 'idle',
        event: 'RESET',
      };
    }

    // If stopped, transition to idle
    if (this.currentState === 'stopped') {
      return this.transition('RESET');
    }

    // For other states, force stop first then reset
    if (this.currentState === 'running' || this.currentState === 'paused') {
      this.stop();
      return this.transition('RESET');
    }

    return {
      success: false,
      previousState: this.currentState,
      newState: this.currentState,
      event: 'RESET',
      error: `Cannot reset from ${this.currentState} state`,
    };
  }

  /**
   * Cleans up the state machine (stops timers, removes listeners)
   */
  destroy(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.stateListeners.clear();
    this.timerListeners.clear();
    this.completionListeners.clear();
    this.config = null;
  }
}

/**
 * Creates a new session state machine instance
 */
export const createSessionStateMachine = (): SessionStateMachine => {
  return new SessionStateMachine();
};

/**
 * Default export is the SessionStateMachine class
 */
export default SessionStateMachine;
