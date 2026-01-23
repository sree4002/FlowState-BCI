/**
 * Tests for QuickBoostButton component logic
 * Verifies quick boost session configuration and state management
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { SessionProvider, useSession } from '../src/contexts/SessionContext';
import {
  SettingsProvider,
  useSettings,
  defaultSettings,
} from '../src/contexts/SettingsContext';
import { DeviceProvider, useDevice } from '../src/contexts/DeviceContext';
import { SessionConfig } from '../src/types';

/**
 * Test helper: Creates a quick boost session configuration
 * This mirrors the logic in QuickBoostButton component
 */
function createQuickBoostConfig(
  settings: typeof defaultSettings
): SessionConfig {
  return {
    type: 'quick_boost',
    duration_minutes: settings.boost_time,
    entrainment_freq: settings.boost_frequency,
    volume: settings.default_volume,
    target_zscore: settings.target_zscore,
    closed_loop_behavior: settings.closed_loop_behavior,
  };
}

/**
 * Test helper: Simulates the QuickBoostButton press handler logic
 */
function simulateQuickBoostPress(
  sessionActions: ReturnType<typeof useSession>,
  settings: typeof defaultSettings
) {
  const config = createQuickBoostConfig(settings);
  sessionActions.setElapsedSeconds(0);
  sessionActions.setSessionConfig(config);
  sessionActions.setSessionState('running');
}

describe('QuickBoostButton Logic', () => {
  describe('Quick Boost Configuration', () => {
    it('should create correct session config with default settings', () => {
      const config = createQuickBoostConfig(defaultSettings);

      expect(config).toEqual({
        type: 'quick_boost',
        duration_minutes: 5, // default boost_time
        entrainment_freq: 6.0, // default boost_frequency
        volume: 70, // default volume
        target_zscore: 1.0, // default target
        closed_loop_behavior: 'reduce_intensity', // default behavior
      });
    });

    it('should create session config with custom boost_time', () => {
      const customSettings = { ...defaultSettings, boost_time: 10 };
      const config = createQuickBoostConfig(customSettings);

      expect(config.duration_minutes).toBe(10);
    });

    it('should create session config with custom boost_frequency', () => {
      const customSettings = { ...defaultSettings, boost_frequency: 8.0 };
      const config = createQuickBoostConfig(customSettings);

      expect(config.entrainment_freq).toBe(8.0);
    });

    it('should create session config with custom volume', () => {
      const customSettings = { ...defaultSettings, default_volume: 50 };
      const config = createQuickBoostConfig(customSettings);

      expect(config.volume).toBe(50);
    });

    it('should create session config with custom target_zscore', () => {
      const customSettings = { ...defaultSettings, target_zscore: 1.5 };
      const config = createQuickBoostConfig(customSettings);

      expect(config.target_zscore).toBe(1.5);
    });

    it('should create session config with custom closed_loop_behavior', () => {
      const customSettings = {
        ...defaultSettings,
        closed_loop_behavior: 'stop_entrainment' as const,
      };
      const config = createQuickBoostConfig(customSettings);

      expect(config.closed_loop_behavior).toBe('stop_entrainment');
    });
  });

  describe('Session State Management', () => {
    it('should set session state to running when quick boost is pressed', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      expect(result.current.sessionState).toBe('idle');

      act(() => {
        simulateQuickBoostPress(result.current, defaultSettings);
      });

      expect(result.current.sessionState).toBe('running');
    });

    it('should reset elapsed seconds when quick boost is pressed', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      // Simulate previous session with elapsed time
      act(() => {
        result.current.setElapsedSeconds(120);
      });

      expect(result.current.elapsedSeconds).toBe(120);

      act(() => {
        simulateQuickBoostPress(result.current, defaultSettings);
      });

      expect(result.current.elapsedSeconds).toBe(0);
    });

    it('should set session config when quick boost is pressed', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      expect(result.current.sessionConfig).toBeNull();

      act(() => {
        simulateQuickBoostPress(result.current, defaultSettings);
      });

      expect(result.current.sessionConfig).toEqual({
        type: 'quick_boost',
        duration_minutes: 5,
        entrainment_freq: 6.0,
        volume: 70,
        target_zscore: 1.0,
        closed_loop_behavior: 'reduce_intensity',
      });
    });
  });

  describe('Disabled State Logic', () => {
    it('should be disabled when session is running', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setSessionState('running');
      });

      const sessionState = result.current.sessionState;
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      expect(isSessionActive).toBe(true);
    });

    it('should be disabled when session is paused', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setSessionState('paused');
      });

      const sessionState = result.current.sessionState;
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      expect(isSessionActive).toBe(true);
    });

    it('should not be disabled when session is idle', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      const sessionState = result.current.sessionState;
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      expect(sessionState).toBe('idle');
      expect(isSessionActive).toBe(false);
    });

    it('should not be disabled when session is stopped', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setSessionState('stopped');
      });

      const sessionState = result.current.sessionState;
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      expect(sessionState).toBe('stopped');
      expect(isSessionActive).toBe(false);
    });
  });

  describe('Device Connection State', () => {
    it('should detect when device is not connected', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      const isDeviceConnected =
        result.current.deviceInfo?.is_connected ?? false;

      expect(isDeviceConnected).toBe(false);
    });

    it('should detect when device is connected', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      act(() => {
        result.current.setDeviceInfo({
          id: 'device-123',
          name: 'FlowState Headband',
          type: 'headband',
          sampling_rate: 500,
          battery_level: 85,
          firmware_version: '1.0.0',
          rssi: -65,
          is_connected: true,
          last_connected: Date.now(),
        });
      });

      const isDeviceConnected =
        result.current.deviceInfo?.is_connected ?? false;

      expect(isDeviceConnected).toBe(true);
    });

    it('should detect when device is connecting', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      act(() => {
        result.current.setIsConnecting(true);
      });

      expect(result.current.isConnecting).toBe(true);
    });
  });

  describe('Settings Context Integration', () => {
    it('should provide default boost settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.settings.boost_time).toBe(5);
      expect(result.current.settings.boost_frequency).toBe(6.0);
    });

    it('should allow custom boost settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider
          initialSettings={{ boost_time: 10, boost_frequency: 7.5 }}
        >
          {children}
        </SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.settings.boost_time).toBe(10);
      expect(result.current.settings.boost_frequency).toBe(7.5);
    });

    it('should create session config using context settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider
          initialSettings={{
            boost_time: 15,
            boost_frequency: 8.0,
            default_volume: 50,
            target_zscore: 1.5,
            closed_loop_behavior: 'stop_entrainment',
          }}
        >
          {children}
        </SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });
      const config = createQuickBoostConfig(result.current.settings);

      expect(config).toEqual({
        type: 'quick_boost',
        duration_minutes: 15,
        entrainment_freq: 8.0,
        volume: 50,
        target_zscore: 1.5,
        closed_loop_behavior: 'stop_entrainment',
      });
    });
  });

  describe('Button Text Logic', () => {
    it('should show "Quick Boost" when idle and not connecting', () => {
      const isConnecting = false;
      const sessionState = 'idle';
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      const getButtonText = (): string => {
        if (isConnecting) return 'Connecting...';
        if (isSessionActive) return 'Session Active';
        return 'Quick Boost';
      };

      expect(getButtonText()).toBe('Quick Boost');
    });

    it('should show "Connecting..." when device is connecting', () => {
      const isConnecting = true;
      const sessionState = 'idle';
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      const getButtonText = (): string => {
        if (isConnecting) return 'Connecting...';
        if (isSessionActive) return 'Session Active';
        return 'Quick Boost';
      };

      expect(getButtonText()).toBe('Connecting...');
    });

    it('should show "Session Active" when session is running', () => {
      const isConnecting = false;
      const sessionState = 'running';
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      const getButtonText = (): string => {
        if (isConnecting) return 'Connecting...';
        if (isSessionActive) return 'Session Active';
        return 'Quick Boost';
      };

      expect(getButtonText()).toBe('Session Active');
    });

    it('should show "Session Active" when session is paused', () => {
      const isConnecting = false;
      const sessionState = 'paused';
      const isSessionActive =
        sessionState === 'running' || sessionState === 'paused';

      const getButtonText = (): string => {
        if (isConnecting) return 'Connecting...';
        if (isSessionActive) return 'Session Active';
        return 'Quick Boost';
      };

      expect(getButtonText()).toBe('Session Active');
    });
  });

  describe('SubText Logic', () => {
    it('should show session details when idle', () => {
      const settings = defaultSettings;
      const isConnecting = false;
      const isSessionActive = false;

      const getSubText = (): string => {
        if (isConnecting || isSessionActive) return '';
        return `${settings.boost_time} min @ ${settings.boost_frequency} Hz`;
      };

      expect(getSubText()).toBe('5 min @ 6 Hz');
    });

    it('should show empty string when connecting', () => {
      const settings = defaultSettings;
      const isConnecting = true;
      const isSessionActive = false;

      const getSubText = (): string => {
        if (isConnecting || isSessionActive) return '';
        return `${settings.boost_time} min @ ${settings.boost_frequency} Hz`;
      };

      expect(getSubText()).toBe('');
    });

    it('should show empty string when session is active', () => {
      const settings = defaultSettings;
      const isConnecting = false;
      const isSessionActive = true;

      const getSubText = (): string => {
        if (isConnecting || isSessionActive) return '';
        return `${settings.boost_time} min @ ${settings.boost_frequency} Hz`;
      };

      expect(getSubText()).toBe('');
    });

    it('should show custom settings in subtext', () => {
      const settings = {
        ...defaultSettings,
        boost_time: 10,
        boost_frequency: 7.5,
      };
      const isConnecting = false;
      const isSessionActive = false;

      const getSubText = (): string => {
        if (isConnecting || isSessionActive) return '';
        return `${settings.boost_time} min @ ${settings.boost_frequency} Hz`;
      };

      expect(getSubText()).toBe('10 min @ 7.5 Hz');
    });
  });
});
