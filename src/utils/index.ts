// Utils exports
export {
  calculateBackoffDelay,
  getBackoffSequence,
  canRetry,
  getTotalBackoffTime,
  DEFAULT_RECONNECT_CONFIG,
} from './reconnect';
export type { ReconnectConfig } from './reconnect';

// Haptics
export {
  triggerHaptic,
  isHapticsAvailable,
  Haptic,
} from './haptics';
export type { HapticFeedbackType } from './haptics';

// App State Management
export {
  AppStateManager,
  createAppStateListener,
} from './appStateManager';
export type {
  PersistedSessionState,
  AppStateTransition,
  AppStateChangeHandler,
} from './appStateManager';

// Session Data Management
export {
  SessionDataManager,
  createSessionDataManager,
  createShortSessionDataManager,
  createLongSessionDataManager,
} from './sessionDataManager';
export type {
  SessionDataPoint,
  DownsampledDataPoint,
  SessionDataManagerConfig,
  MemoryStats,
} from './sessionDataManager';
