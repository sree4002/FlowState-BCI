/**
 * CalibrationStateMachine - Manages the calibration flow lifecycle
 *
 * State transitions:
 * - idle → instructions (start calibration)
 * - instructions → countdown (begin countdown)
 * - instructions → idle (cancel)
 * - countdown → recording (countdown complete)
 * - countdown → idle (cancel)
 * - recording → processing (recording complete)
 * - recording → paused (pause due to poor signal)
 * - recording → idle (cancel)
 * - paused → recording (resume)
 * - paused → idle (cancel)
 * - processing → complete (processing complete)
 * - processing → failed (processing failed)
 * - complete → idle (reset)
 * - failed → instructions (retry)
 * - failed → idle (cancel)
 *
 * Invalid transitions are rejected with an error.
 */

import { CalibrationState, BaselineProfile, SignalQuality } from '../types';

/**
 * Extended calibration state type including additional states for the state machine
 */
export type ExtendedCalibrationState =
  | CalibrationState
  | 'idle'
  | 'paused'
  | 'failed';

/**
 * Calibration state machine event types
 */
export type CalibrationEvent =
  | 'START'
  | 'NEXT'
  | 'PAUSE'
  | 'RESUME'
  | 'COMPLETE'
  | 'FAIL'
  | 'CANCEL'
  | 'RESET'
  | 'RETRY'
  | 'TICK';

/**
 * Calibration state machine transition result
 */
export interface CalibrationTransitionResult {
  success: boolean;
  previousState: ExtendedCalibrationState;
  newState: ExtendedCalibrationState;
  event: CalibrationEvent;
  error?: string;
}

/**
 * Calibration timer state
 */
export interface CalibrationTimerState {
  /** Elapsed seconds in current phase */
  elapsedSeconds: number;
  /** Remaining seconds in current phase (null if no limit) */
  remainingSeconds: number | null;
  /** Whether the current phase is complete */
  isPhaseComplete: boolean;
  /** Start timestamp of current phase */
  startTimestamp: number | null;
  /** When calibration was paused (null if not paused) */
  pausedAt: number | null;
  /** Total duration paused in milliseconds */
  totalPausedDuration: number;
  /** Countdown seconds for settle period */
  countdownSeconds: number;
  /** Recording duration in seconds */
  recordingDurationSeconds: number;
}

/**
 * Signal quality sample for calibration data collection
 */
export interface CalibrationSignalSample {
  timestamp: number;
  score: number;
  isClean: boolean;
  artifactPercentage: number;
}

/**
 * Calibration data collected during the recording phase
 */
export interface CalibrationData {
  /** All signal quality samples collected */
  signalSamples: CalibrationSignalSample[];
  /** Percentage of clean samples (score >= 40) */
  cleanDataPercentage: number;
  /** Average signal quality score */
  averageSignalQuality: number;
  /** Number of times auto-paused due to poor signal */
  autoPauseCount: number;
  /** Total recording duration in seconds */
  recordingDuration: number;
  /** Whether minimum recording requirements were met */
  meetsMinimumRequirements: boolean;
}

/**
 * Calibration result with baseline profile
 */
export interface CalibrationResult {
  success: boolean;
  data: CalibrationData;
  baseline: BaselineProfile | null;
  qualityScore: number;
  errorMessage?: string;
}

/**
 * Calibration configuration
 */
export interface CalibrationConfig {
  /** Countdown duration in seconds (default: 30) */
  countdownDuration: number;
  /** Recording duration in seconds (default: 300 = 5 minutes) */
  recordingDuration: number;
  /** Minimum recording duration in seconds (default: 180 = 3 minutes) */
  minRecordingDuration: number;
  /** Minimum clean data percentage (default: 50) */
  minCleanDataPercentage: number;
  /** Critical signal threshold for auto-pause (default: 20) */
  criticalSignalThreshold: number;
  /** Duration of critical signal before auto-pause in seconds (default: 10) */
  autoPauseDelaySeconds: number;
}

/**
 * Default calibration configuration
 */
export const DEFAULT_CALIBRATION_CONFIG: CalibrationConfig = {
  countdownDuration: 30,
  recordingDuration: 300,
  minRecordingDuration: 180,
  minCleanDataPercentage: 50,
  criticalSignalThreshold: 20,
  autoPauseDelaySeconds: 10,
};

/**
 * Calibration state listener callback type
 */
export type CalibrationStateListener = (
  newState: ExtendedCalibrationState,
  previousState: ExtendedCalibrationState,
  event: CalibrationEvent
) => void;

/**
 * Calibration timer listener callback type
 */
export type CalibrationTimerListener = (
  timerState: CalibrationTimerState
) => void;

/**
 * Calibration completion listener callback type
 */
export type CalibrationCompletionListener = (result: CalibrationResult) => void;

/**
 * Signal quality listener callback type
 */
export type CalibrationSignalListener = (
  signalQuality: SignalQuality,
  sample: CalibrationSignalSample
) => void;

/**
 * Valid state transitions map
 * Key: current state, Value: map of valid events and resulting states
 */
const VALID_TRANSITIONS: Record<
  ExtendedCalibrationState,
  Partial<Record<CalibrationEvent, ExtendedCalibrationState>>
> = {
  idle: {
    START: 'instructions',
  },
  instructions: {
    NEXT: 'countdown',
    CANCEL: 'idle',
  },
  countdown: {
    NEXT: 'recording',
    TICK: 'countdown',
    CANCEL: 'idle',
  },
  recording: {
    COMPLETE: 'processing',
    PAUSE: 'paused',
    TICK: 'recording',
    CANCEL: 'idle',
  },
  paused: {
    RESUME: 'recording',
    CANCEL: 'idle',
  },
  processing: {
    COMPLETE: 'complete',
    FAIL: 'failed',
  },
  complete: {
    RESET: 'idle',
  },
  failed: {
    RETRY: 'instructions',
    CANCEL: 'idle',
  },
};

/**
 * Checks if a transition is valid
 */
export const isValidCalibrationTransition = (
  currentState: ExtendedCalibrationState,
  event: CalibrationEvent
): boolean => {
  const validEvents = VALID_TRANSITIONS[currentState];
  return validEvents !== undefined && event in validEvents;
};

/**
 * Gets the next state for a given event
 */
export const getNextCalibrationState = (
  currentState: ExtendedCalibrationState,
  event: CalibrationEvent
): ExtendedCalibrationState | null => {
  const validEvents = VALID_TRANSITIONS[currentState];
  if (!validEvents || !(event in validEvents)) {
    return null;
  }
  return validEvents[event] ?? null;
};

/**
 * Gets available events for the current state
 */
export const getAvailableCalibrationEvents = (
  currentState: ExtendedCalibrationState
): CalibrationEvent[] => {
  const validEvents = VALID_TRANSITIONS[currentState];
  if (!validEvents) {
    return [];
  }
  return Object.keys(validEvents) as CalibrationEvent[];
};

/**
 * Checks if calibration can be started from current state
 */
export const canStartCalibration = (
  currentState: ExtendedCalibrationState
): boolean => {
  return isValidCalibrationTransition(currentState, 'START');
};

/**
 * Checks if calibration can be paused from current state
 */
export const canPauseCalibration = (
  currentState: ExtendedCalibrationState
): boolean => {
  return isValidCalibrationTransition(currentState, 'PAUSE');
};

/**
 * Checks if calibration can be resumed from current state
 */
export const canResumeCalibration = (
  currentState: ExtendedCalibrationState
): boolean => {
  return isValidCalibrationTransition(currentState, 'RESUME');
};

/**
 * Checks if calibration can be cancelled from current state
 */
export const canCancelCalibration = (
  currentState: ExtendedCalibrationState
): boolean => {
  return isValidCalibrationTransition(currentState, 'CANCEL');
};

/**
 * Checks if calibration can advance to next step
 */
export const canAdvanceCalibration = (
  currentState: ExtendedCalibrationState
): boolean => {
  return isValidCalibrationTransition(currentState, 'NEXT');
};

/**
 * Checks if calibration is in an active state
 */
export const isCalibrationActive = (
  currentState: ExtendedCalibrationState
): boolean => {
  return (
    currentState === 'countdown' ||
    currentState === 'recording' ||
    currentState === 'paused' ||
    currentState === 'processing'
  );
};

/**
 * Checks if calibration is recording
 */
export const isCalibrationRecording = (
  currentState: ExtendedCalibrationState
): boolean => {
  return currentState === 'recording';
};

/**
 * Checks if calibration is paused
 */
export const isCalibrationPaused = (
  currentState: ExtendedCalibrationState
): boolean => {
  return currentState === 'paused';
};

/**
 * Checks if calibration is complete
 */
export const isCalibrationComplete = (
  currentState: ExtendedCalibrationState
): boolean => {
  return currentState === 'complete';
};

/**
 * Checks if calibration failed
 */
export const isCalibrationFailed = (
  currentState: ExtendedCalibrationState
): boolean => {
  return currentState === 'failed';
};

/**
 * Checks if calibration is in countdown phase
 */
export const isCalibrationCountdown = (
  currentState: ExtendedCalibrationState
): boolean => {
  return currentState === 'countdown';
};

/**
 * Checks if calibration is processing
 */
export const isCalibrationProcessing = (
  currentState: ExtendedCalibrationState
): boolean => {
  return currentState === 'processing';
};

/**
 * Checks if signal quality meets minimum threshold
 */
export const isSignalQualitySufficient = (
  signalQuality: SignalQuality | null,
  threshold: number = DEFAULT_CALIBRATION_CONFIG.criticalSignalThreshold
): boolean => {
  if (!signalQuality || signalQuality.score === undefined) {
    return false;
  }
  return signalQuality.score >= threshold;
};

/**
 * Calculates clean data percentage from samples
 */
export const calculateCleanDataPercentage = (
  samples: CalibrationSignalSample[]
): number => {
  if (samples.length === 0) return 0;
  const cleanSamples = samples.filter((s) => s.isClean).length;
  return Math.round((cleanSamples / samples.length) * 100);
};

/**
 * Calculates average signal quality from samples
 */
export const calculateAverageSignalQuality = (
  samples: CalibrationSignalSample[]
): number => {
  if (samples.length === 0) return 0;
  const totalScore = samples.reduce((sum, s) => sum + s.score, 0);
  return Math.round(totalScore / samples.length);
};

/**
 * Checks if calibration meets minimum requirements
 */
export const meetsMinimumCalibrationRequirements = (
  recordingDuration: number,
  cleanDataPercentage: number,
  config: CalibrationConfig = DEFAULT_CALIBRATION_CONFIG
): boolean => {
  return (
    recordingDuration >= config.minRecordingDuration &&
    cleanDataPercentage >= config.minCleanDataPercentage
  );
};

/**
 * Formats countdown time to MM:SS
 */
export const formatCalibrationTime = (seconds: number): string => {
  if (seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Gets calibration phase label
 */
export const getCalibrationPhaseLabel = (
  state: ExtendedCalibrationState
): string => {
  switch (state) {
    case 'idle':
      return 'Ready';
    case 'instructions':
      return 'Setup Instructions';
    case 'countdown':
      return 'Settle Period';
    case 'recording':
      return 'Recording Baseline';
    case 'paused':
      return 'Paused';
    case 'processing':
      return 'Processing Data';
    case 'complete':
      return 'Calibration Complete';
    case 'failed':
      return 'Calibration Failed';
    default:
      return 'Unknown';
  }
};

/**
 * Gets calibration step number (1-based)
 */
export const getCalibrationStepNumber = (
  state: ExtendedCalibrationState
): number => {
  switch (state) {
    case 'idle':
      return 0;
    case 'instructions':
      return 1;
    case 'countdown':
      return 2;
    case 'recording':
    case 'paused':
      return 3;
    case 'processing':
      return 4;
    case 'complete':
    case 'failed':
      return 5;
    default:
      return 0;
  }
};

/**
 * Gets total calibration steps
 */
export const getTotalCalibrationSteps = (): number => {
  return 5;
};

/**
 * CalibrationStateMachine class
 * Manages the complete calibration lifecycle including state transitions,
 * timer, and signal quality tracking
 */
export class CalibrationStateMachine {
  private currentState: ExtendedCalibrationState = 'idle';
  private config: CalibrationConfig = { ...DEFAULT_CALIBRATION_CONFIG };
  private timerState: CalibrationTimerState = {
    elapsedSeconds: 0,
    remainingSeconds: null,
    isPhaseComplete: false,
    startTimestamp: null,
    pausedAt: null,
    totalPausedDuration: 0,
    countdownSeconds: 0,
    recordingDurationSeconds: 0,
  };
  private calibrationData: CalibrationData = {
    signalSamples: [],
    cleanDataPercentage: 0,
    averageSignalQuality: 0,
    autoPauseCount: 0,
    recordingDuration: 0,
    meetsMinimumRequirements: false,
  };
  private timerIntervalId: ReturnType<typeof setInterval> | null = null;
  private autoPauseTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private criticalSignalStartTime: number | null = null;
  private stateListeners: Set<CalibrationStateListener> = new Set();
  private timerListeners: Set<CalibrationTimerListener> = new Set();
  private completionListeners: Set<CalibrationCompletionListener> = new Set();
  private signalListeners: Set<CalibrationSignalListener> = new Set();

  /**
   * Creates a new CalibrationStateMachine instance
   */
  constructor(config?: Partial<CalibrationConfig>) {
    if (config) {
      this.config = { ...DEFAULT_CALIBRATION_CONFIG, ...config };
    }
    this.resetTimerState();
    this.resetCalibrationData();
  }

  /**
   * Gets the current calibration state
   */
  getState(): ExtendedCalibrationState {
    return this.currentState;
  }

  /**
   * Gets the current configuration
   */
  getConfig(): CalibrationConfig {
    return { ...this.config };
  }

  /**
   * Gets the current timer state
   */
  getTimerState(): CalibrationTimerState {
    return { ...this.timerState };
  }

  /**
   * Gets the collected calibration data
   */
  getCalibrationData(): CalibrationData {
    return { ...this.calibrationData };
  }

  /**
   * Sets the calibration configuration
   */
  setConfig(config: Partial<CalibrationConfig>): void {
    if (this.currentState !== 'idle') {
      throw new Error('Cannot set config while calibration is active');
    }
    this.config = { ...this.config, ...config };
    this.resetTimerState();
  }

  /**
   * Adds a state change listener
   */
  addStateListener(listener: CalibrationStateListener): () => void {
    this.stateListeners.add(listener);
    return () => this.stateListeners.delete(listener);
  }

  /**
   * Adds a timer update listener
   */
  addTimerListener(listener: CalibrationTimerListener): () => void {
    this.timerListeners.add(listener);
    return () => this.timerListeners.delete(listener);
  }

  /**
   * Adds a calibration completion listener
   */
  addCompletionListener(listener: CalibrationCompletionListener): () => void {
    this.completionListeners.add(listener);
    return () => this.completionListeners.delete(listener);
  }

  /**
   * Adds a signal quality listener
   */
  addSignalListener(listener: CalibrationSignalListener): () => void {
    this.signalListeners.add(listener);
    return () => this.signalListeners.delete(listener);
  }

  /**
   * Notifies all state listeners of a state change
   */
  private notifyStateListeners(
    newState: ExtendedCalibrationState,
    previousState: ExtendedCalibrationState,
    event: CalibrationEvent
  ): void {
    this.stateListeners.forEach((listener) => {
      try {
        listener(newState, previousState, event);
      } catch (error) {
        console.error('Error in calibration state listener:', error);
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
        console.error('Error in calibration timer listener:', error);
      }
    });
  }

  /**
   * Notifies all completion listeners when calibration ends
   */
  private notifyCompletionListeners(success: boolean): void {
    const result: CalibrationResult = {
      success,
      data: this.getCalibrationData(),
      baseline: success ? this.generateMockBaseline() : null,
      qualityScore: this.calibrationData.averageSignalQuality,
      errorMessage: success
        ? undefined
        : 'Calibration did not meet minimum requirements',
    };
    this.completionListeners.forEach((listener) => {
      try {
        listener(result);
      } catch (error) {
        console.error('Error in calibration completion listener:', error);
      }
    });
  }

  /**
   * Generates a mock baseline profile for successful calibration
   * In production, this would be computed from actual EEG data
   */
  private generateMockBaseline(): BaselineProfile {
    return {
      theta_mean: 10 + Math.random() * 5,
      theta_std: 2 + Math.random() * 2,
      alpha_mean: 8 + Math.random() * 4,
      beta_mean: 5 + Math.random() * 3,
      peak_theta_freq: 6 + Math.random() * 1.5,
      optimal_freq: 6,
      calibration_timestamp: Date.now(),
      quality_score: this.calibrationData.averageSignalQuality,
    };
  }

  /**
   * Records a signal quality sample
   */
  recordSignalSample(signalQuality: SignalQuality): void {
    if (this.currentState !== 'recording') {
      return;
    }

    const sample: CalibrationSignalSample = {
      timestamp: Date.now(),
      score: signalQuality.score,
      isClean: signalQuality.score >= 40,
      artifactPercentage: signalQuality.artifact_percentage,
    };

    this.calibrationData.signalSamples.push(sample);
    this.updateCalibrationDataStats();

    // Check for critical signal quality
    this.checkCriticalSignal(signalQuality);

    // Notify signal listeners
    this.signalListeners.forEach((listener) => {
      try {
        listener(signalQuality, sample);
      } catch (error) {
        console.error('Error in calibration signal listener:', error);
      }
    });
  }

  /**
   * Updates calibration data statistics
   */
  private updateCalibrationDataStats(): void {
    this.calibrationData.cleanDataPercentage = calculateCleanDataPercentage(
      this.calibrationData.signalSamples
    );
    this.calibrationData.averageSignalQuality = calculateAverageSignalQuality(
      this.calibrationData.signalSamples
    );
    this.calibrationData.recordingDuration = this.timerState.elapsedSeconds;
    this.calibrationData.meetsMinimumRequirements =
      meetsMinimumCalibrationRequirements(
        this.calibrationData.recordingDuration,
        this.calibrationData.cleanDataPercentage,
        this.config
      );
  }

  /**
   * Checks for critical signal quality and handles auto-pause
   */
  private checkCriticalSignal(signalQuality: SignalQuality): void {
    const isCritical =
      signalQuality.score < this.config.criticalSignalThreshold;

    if (isCritical) {
      if (this.criticalSignalStartTime === null) {
        this.criticalSignalStartTime = Date.now();
      }

      const criticalDuration =
        (Date.now() - this.criticalSignalStartTime) / 1000;

      if (
        criticalDuration >= this.config.autoPauseDelaySeconds &&
        this.currentState === 'recording'
      ) {
        this.autoPause();
      }
    } else {
      this.criticalSignalStartTime = null;
    }
  }

  /**
   * Auto-pauses calibration due to poor signal quality
   */
  private autoPause(): void {
    if (this.currentState !== 'recording') {
      return;
    }

    this.calibrationData.autoPauseCount += 1;
    this.transition('PAUSE');
  }

  /**
   * Performs a state transition
   */
  transition(event: CalibrationEvent): CalibrationTransitionResult {
    const previousState = this.currentState;
    const newState = getNextCalibrationState(this.currentState, event);

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
    event: CalibrationEvent,
    previousState: ExtendedCalibrationState,
    newState: ExtendedCalibrationState
  ): void {
    // Stop any existing timers
    if (event !== 'TICK') {
      this.stopTimer();
    }

    switch (newState) {
      case 'countdown':
        this.startCountdown();
        break;
      case 'recording':
        if (previousState === 'countdown') {
          this.startRecording();
        } else if (previousState === 'paused') {
          this.resumeRecording();
        }
        break;
      case 'paused':
        this.pauseRecording();
        break;
      case 'processing':
        // Processing would happen here
        break;
      case 'complete':
        this.notifyCompletionListeners(true);
        break;
      case 'failed':
        this.notifyCompletionListeners(false);
        break;
      case 'idle':
        this.resetTimerState();
        this.resetCalibrationData();
        break;
    }
  }

  /**
   * Starts the countdown timer
   */
  private startCountdown(): void {
    this.timerState.startTimestamp = Date.now();
    this.timerState.elapsedSeconds = 0;
    this.timerState.remainingSeconds = this.config.countdownDuration;
    this.timerState.countdownSeconds = this.config.countdownDuration;
    this.timerState.isPhaseComplete = false;

    this.startTimer();
  }

  /**
   * Starts the recording phase
   */
  private startRecording(): void {
    this.timerState.startTimestamp = Date.now();
    this.timerState.elapsedSeconds = 0;
    this.timerState.remainingSeconds = this.config.recordingDuration;
    this.timerState.recordingDurationSeconds = this.config.recordingDuration;
    this.timerState.isPhaseComplete = false;
    this.timerState.pausedAt = null;
    this.timerState.totalPausedDuration = 0;

    this.startTimer();
  }

  /**
   * Pauses the recording phase
   */
  private pauseRecording(): void {
    this.timerState.pausedAt = Date.now();
    this.stopTimer();
    this.notifyTimerListeners();
  }

  /**
   * Resumes the recording phase
   */
  private resumeRecording(): void {
    if (this.timerState.pausedAt !== null) {
      const pausedDuration = Date.now() - this.timerState.pausedAt;
      this.timerState.totalPausedDuration += pausedDuration;
      this.timerState.pausedAt = null;
    }
    this.criticalSignalStartTime = null;
    this.startTimer();
    this.notifyTimerListeners();
  }

  /**
   * Starts the timer interval
   */
  private startTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
    }

    this.timerIntervalId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  /**
   * Stops the timer interval
   */
  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    if (this.autoPauseTimeoutId !== null) {
      clearTimeout(this.autoPauseTimeoutId);
      this.autoPauseTimeoutId = null;
    }
  }

  /**
   * Timer tick - handles countdown and recording progress
   */
  private tick(): void {
    if (this.currentState === 'countdown') {
      this.tickCountdown();
    } else if (this.currentState === 'recording') {
      this.tickRecording();
    }
  }

  /**
   * Handles countdown tick
   */
  private tickCountdown(): void {
    this.timerState.elapsedSeconds += 1;

    if (this.timerState.remainingSeconds !== null) {
      this.timerState.remainingSeconds -= 1;

      if (this.timerState.remainingSeconds <= 0) {
        this.timerState.remainingSeconds = 0;
        this.timerState.isPhaseComplete = true;
        this.stopTimer();
        this.transition('NEXT');
        return;
      }
    }

    this.notifyTimerListeners();
  }

  /**
   * Handles recording tick
   */
  private tickRecording(): void {
    this.timerState.elapsedSeconds += 1;

    if (this.timerState.remainingSeconds !== null) {
      this.timerState.remainingSeconds -= 1;

      if (this.timerState.remainingSeconds <= 0) {
        this.timerState.remainingSeconds = 0;
        this.timerState.isPhaseComplete = true;
        this.updateCalibrationDataStats();
        this.stopTimer();
        this.transition('COMPLETE');
        return;
      }
    }

    this.notifyTimerListeners();
  }

  /**
   * Resets the timer state
   */
  private resetTimerState(): void {
    this.timerState = {
      elapsedSeconds: 0,
      remainingSeconds: null,
      isPhaseComplete: false,
      startTimestamp: null,
      pausedAt: null,
      totalPausedDuration: 0,
      countdownSeconds: this.config.countdownDuration,
      recordingDurationSeconds: this.config.recordingDuration,
    };
  }

  /**
   * Resets the calibration data
   */
  private resetCalibrationData(): void {
    this.calibrationData = {
      signalSamples: [],
      cleanDataPercentage: 0,
      averageSignalQuality: 0,
      autoPauseCount: 0,
      recordingDuration: 0,
      meetsMinimumRequirements: false,
    };
    this.criticalSignalStartTime = null;
  }

  /**
   * Convenience method to start calibration
   */
  start(): CalibrationTransitionResult {
    return this.transition('START');
  }

  /**
   * Convenience method to advance to next phase
   */
  next(): CalibrationTransitionResult {
    return this.transition('NEXT');
  }

  /**
   * Convenience method to pause calibration
   */
  pause(): CalibrationTransitionResult {
    return this.transition('PAUSE');
  }

  /**
   * Convenience method to resume calibration
   */
  resume(): CalibrationTransitionResult {
    return this.transition('RESUME');
  }

  /**
   * Convenience method to complete calibration
   */
  complete(): CalibrationTransitionResult {
    return this.transition('COMPLETE');
  }

  /**
   * Convenience method to fail calibration
   */
  fail(): CalibrationTransitionResult {
    return this.transition('FAIL');
  }

  /**
   * Convenience method to cancel calibration
   */
  cancel(): CalibrationTransitionResult {
    return this.transition('CANCEL');
  }

  /**
   * Convenience method to reset calibration
   */
  reset(): CalibrationTransitionResult {
    // If already idle, just reset the data
    if (this.currentState === 'idle') {
      this.resetTimerState();
      this.resetCalibrationData();
      return {
        success: true,
        previousState: 'idle',
        newState: 'idle',
        event: 'RESET',
      };
    }

    // If complete or failed, transition to idle
    if (this.currentState === 'complete') {
      return this.transition('RESET');
    }

    // For other states, cancel first
    if (canCancelCalibration(this.currentState)) {
      return this.transition('CANCEL');
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
   * Convenience method to retry calibration
   */
  retry(): CalibrationTransitionResult {
    return this.transition('RETRY');
  }

  /**
   * Cleans up the state machine (stops timers, removes listeners)
   */
  destroy(): void {
    this.stopTimer();
    this.stateListeners.clear();
    this.timerListeners.clear();
    this.completionListeners.clear();
    this.signalListeners.clear();
    this.resetTimerState();
    this.resetCalibrationData();
  }
}

/**
 * Creates a new calibration state machine instance
 */
export const createCalibrationStateMachine = (
  config?: Partial<CalibrationConfig>
): CalibrationStateMachine => {
  return new CalibrationStateMachine(config);
};

/**
 * Default export is the CalibrationStateMachine class
 */
export default CalibrationStateMachine;
