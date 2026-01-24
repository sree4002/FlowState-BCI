/**
 * Tests for AppStateManager utility
 */

import {
  AppStateManager,
  createAppStateListener,
  PersistedSessionState,
} from '../src/utils/appStateManager';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock AppState
const mockAppStateListeners: Array<(state: string) => void> = [];
jest.mock('react-native', () => ({
  AppState: {
    currentState: 'active',
    addEventListener: jest.fn((event: string, callback: (state: string) => void) => {
      mockAppStateListeners.push(callback);
      return { remove: () => mockAppStateListeners.splice(mockAppStateListeners.indexOf(callback), 1) };
    }),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';

describe('AppStateManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAppStateListeners.length = 0;
  });

  describe('initialization', () => {
    it('should exist as a singleton', () => {
      expect(AppStateManager).toBeDefined();
    });

    it('should have initialize method', () => {
      expect(typeof AppStateManager.initialize).toBe('function');
    });

    it('should have cleanup method', () => {
      expect(typeof AppStateManager.cleanup).toBe('function');
    });
  });

  describe('state queries', () => {
    it('should return current state', () => {
      const state = AppStateManager.getCurrentState();
      expect(state).toBeDefined();
    });

    it('should check if active', () => {
      expect(typeof AppStateManager.isActive).toBe('function');
    });

    it('should check if background', () => {
      expect(typeof AppStateManager.isBackground).toBe('function');
    });

    it('should check if inactive', () => {
      expect(typeof AppStateManager.isInactive).toBe('function');
    });
  });

  describe('listener management', () => {
    it('should add a listener', () => {
      const handler = jest.fn();
      const remove = AppStateManager.addListener('test-listener', handler);

      expect(typeof remove).toBe('function');
    });

    it('should remove a listener', () => {
      const handler = jest.fn();
      AppStateManager.addListener('test-listener-2', handler);
      AppStateManager.removeListener('test-listener-2');
      // No error thrown means success
    });
  });

  describe('session state persistence', () => {
    it('should save session state', async () => {
      const sessionState: PersistedSessionState = {
        sessionId: 'test-123',
        sessionType: 'quick_boost',
        elapsedSeconds: 120,
        sessionState: 'running',
        currentThetaZScore: 1.5,
        entrainmentFrequency: 6.0,
        volume: 80,
        backgroundedAt: Date.now(),
        wasPaused: false,
      };

      await AppStateManager.saveSessionState(sessionState);

      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('should load session state when available', async () => {
      const sessionState: PersistedSessionState = {
        elapsedSeconds: 120,
        sessionState: 'running',
        currentThetaZScore: 1.5,
        entrainmentFrequency: 6.0,
        volume: 80,
        backgroundedAt: Date.now(),
        wasPaused: false,
      };

      (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key.includes('active_session')) {
          return Promise.resolve(JSON.stringify(sessionState));
        }
        if (key.includes('session_timestamp')) {
          return Promise.resolve(Date.now().toString());
        }
        return Promise.resolve(null);
      });

      const result = await AppStateManager.loadSessionState();

      expect(result).toBeDefined();
      expect(result?.elapsedSeconds).toBe(120);
    });

    it('should return null when no session state exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await AppStateManager.loadSessionState();

      expect(result).toBeNull();
    });

    it('should clear session state', async () => {
      await AppStateManager.clearSessionState();

      expect(AsyncStorage.multiRemove).toHaveBeenCalled();
    });
  });

  describe('background duration calculation', () => {
    it('should calculate background duration', () => {
      const backgroundedAt = Date.now() - 5000; // 5 seconds ago
      const duration = AppStateManager.calculateBackgroundDuration(backgroundedAt);

      expect(duration).toBeGreaterThanOrEqual(5);
    });
  });

  describe('state history', () => {
    it('should return state history', () => {
      const history = AppStateManager.getStateHistory();

      expect(Array.isArray(history)).toBe(true);
    });

    it('should return last background duration or null', () => {
      const duration = AppStateManager.getLastBackgroundDuration();

      // Should be null or a number
      expect(duration === null || typeof duration === 'number').toBe(true);
    });
  });
});

describe('createAppStateListener', () => {
  it('should create a listener helper', () => {
    const onForeground = jest.fn();
    const onBackground = jest.fn();

    const removeListener = createAppStateListener(onForeground, onBackground);

    expect(typeof removeListener).toBe('function');
  });

  it('should work with only onForeground callback', () => {
    const onForeground = jest.fn();

    const removeListener = createAppStateListener(onForeground);

    expect(typeof removeListener).toBe('function');
  });

  it('should work with only onBackground callback', () => {
    const onBackground = jest.fn();

    const removeListener = createAppStateListener(undefined, onBackground);

    expect(typeof removeListener).toBe('function');
  });

  it('should work with no callbacks', () => {
    const removeListener = createAppStateListener();

    expect(typeof removeListener).toBe('function');
  });
});
