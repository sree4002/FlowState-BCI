/**
 * Tests for React Context providers and hooks
 * Verifies DeviceContext, SessionContext, and SettingsContext
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import {
  DeviceProvider,
  useDevice,
  SessionProvider,
  useSession,
  SettingsProvider,
  useSettings,
  defaultSettings,
} from '../src/contexts';
import {
  DeviceInfo,
  SignalQuality,
  EEGDataPacket,
  Session,
  SessionConfig,
} from '../src/types';

describe('DeviceContext', () => {
  describe('Provider and Hook', () => {
    it('should throw error when useDevice is called outside provider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useDevice());
      }).toThrow('useDevice must be used within a DeviceProvider');

      console.error = originalError;
    });

    it('should provide initial device state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      expect(result.current.deviceInfo).toBeNull();
      expect(result.current.signalQuality).toBeNull();
      expect(result.current.latestEEGData).toBeNull();
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.connectionError).toBeNull();
    });

    it('should update device info', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      const mockDevice: DeviceInfo = {
        id: 'device-123',
        name: 'FlowState Headband',
        type: 'headband',
        sampling_rate: 500,
        battery_level: 85,
        firmware_version: '1.0.0',
        rssi: -65,
        is_connected: true,
        last_connected: Date.now(),
      };

      act(() => {
        result.current.setDeviceInfo(mockDevice);
      });

      expect(result.current.deviceInfo).toEqual(mockDevice);
    });

    it('should update signal quality', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      const mockQuality: SignalQuality = {
        score: 85,
        artifact_percentage: 15,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: true,
      };

      act(() => {
        result.current.setSignalQuality(mockQuality);
      });

      expect(result.current.signalQuality).toEqual(mockQuality);
    });

    it('should update latest EEG data', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      const mockEEGData: EEGDataPacket = {
        timestamp: Date.now(),
        samples: [1.5, 2.3, -0.8, 3.2],
        sequence_number: 42,
      };

      act(() => {
        result.current.setLatestEEGData(mockEEGData);
      });

      expect(result.current.latestEEGData).toEqual(mockEEGData);
    });

    it('should update connection state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      act(() => {
        result.current.setIsConnecting(true);
      });

      expect(result.current.isConnecting).toBe(true);

      act(() => {
        result.current.setIsConnecting(false);
      });

      expect(result.current.isConnecting).toBe(false);
    });

    it('should update connection error', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      const errorMessage = 'Failed to connect to device';

      act(() => {
        result.current.setConnectionError(errorMessage);
      });

      expect(result.current.connectionError).toBe(errorMessage);
    });

    it('should reset device state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <DeviceProvider>{children}</DeviceProvider>
      );

      const { result } = renderHook(() => useDevice(), { wrapper });

      // Set some state
      act(() => {
        result.current.setDeviceInfo({
          id: 'device-123',
          name: 'Test Device',
          type: 'earpiece',
          sampling_rate: 250,
          battery_level: 50,
          firmware_version: '1.0.0',
          rssi: -70,
          is_connected: true,
          last_connected: Date.now(),
        });
        result.current.setIsConnecting(true);
        result.current.setConnectionError('Some error');
      });

      // Reset
      act(() => {
        result.current.resetDeviceState();
      });

      expect(result.current.deviceInfo).toBeNull();
      expect(result.current.signalQuality).toBeNull();
      expect(result.current.latestEEGData).toBeNull();
      expect(result.current.isConnecting).toBe(false);
      expect(result.current.connectionError).toBeNull();
    });
  });
});

describe('SessionContext', () => {
  describe('Provider and Hook', () => {
    it('should throw error when useSession is called outside provider', () => {
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useSession());
      }).toThrow('useSession must be used within a SessionProvider');

      console.error = originalError;
    });

    it('should provide initial session state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessionConfig).toBeNull();
      expect(result.current.sessionState).toBe('idle');
      expect(result.current.calibrationState).toBeNull();
      expect(result.current.visualizationMode).toBe('numeric');
      expect(result.current.currentThetaZScore).toBeNull();
      expect(result.current.elapsedSeconds).toBe(0);
      expect(result.current.recentSessions).toEqual([]);
    });

    it('should update current session', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      const mockSession: Session = {
        id: 1,
        session_type: 'quick_boost',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.0,
        volume: 70,
        signal_quality_avg: 85,
        subjective_rating: 4,
        notes: 'Great session',
      };

      act(() => {
        result.current.setCurrentSession(mockSession);
      });

      expect(result.current.currentSession).toEqual(mockSession);
    });

    it('should update session config', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      const mockConfig: SessionConfig = {
        type: 'custom',
        duration_minutes: 15,
        entrainment_freq: 6.5,
        volume: 80,
        target_zscore: 1.2,
        closed_loop_behavior: 'reduce_intensity',
      };

      act(() => {
        result.current.setSessionConfig(mockConfig);
      });

      expect(result.current.sessionConfig).toEqual(mockConfig);
    });

    it('should update session state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setSessionState('running');
      });

      expect(result.current.sessionState).toBe('running');

      act(() => {
        result.current.setSessionState('paused');
      });

      expect(result.current.sessionState).toBe('paused');
    });

    it('should update calibration state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setCalibrationState('countdown');
      });

      expect(result.current.calibrationState).toBe('countdown');

      act(() => {
        result.current.setCalibrationState('recording');
      });

      expect(result.current.calibrationState).toBe('recording');
    });

    it('should update visualization mode', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setVisualizationMode('gauge');
      });

      expect(result.current.visualizationMode).toBe('gauge');

      act(() => {
        result.current.setVisualizationMode('chart');
      });

      expect(result.current.visualizationMode).toBe('chart');
    });

    it('should update current theta z-score', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setCurrentThetaZScore(1.8);
      });

      expect(result.current.currentThetaZScore).toBe(1.8);
    });

    it('should update elapsed seconds', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      act(() => {
        result.current.setElapsedSeconds(120);
      });

      expect(result.current.elapsedSeconds).toBe(120);
    });

    it('should add session to recent sessions', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      const mockSession: Session = {
        id: 1,
        session_type: 'quick_boost',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.0,
        volume: 70,
        signal_quality_avg: 85,
        subjective_rating: null,
        notes: null,
      };

      act(() => {
        result.current.addSession(mockSession);
      });

      expect(result.current.recentSessions).toHaveLength(1);
      expect(result.current.recentSessions[0]).toEqual(mockSession);
    });

    it('should limit recent sessions to 10', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      // Add 12 sessions
      act(() => {
        for (let i = 0; i < 12; i++) {
          result.current.addSession({
            id: i,
            session_type: 'quick_boost',
            start_time: Date.now(),
            end_time: Date.now() + 300000,
            duration_seconds: 300,
            avg_theta_zscore: 1.5,
            max_theta_zscore: 2.3,
            entrainment_freq: 6.0,
            volume: 70,
            signal_quality_avg: 85,
            subjective_rating: null,
            notes: null,
          });
        }
      });

      expect(result.current.recentSessions).toHaveLength(10);
      expect(result.current.recentSessions[0].id).toBe(11); // Most recent
    });

    it('should reset session state', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SessionProvider>{children}</SessionProvider>
      );

      const { result } = renderHook(() => useSession(), { wrapper });

      // Set some state
      act(() => {
        result.current.setSessionState('running');
        result.current.setCurrentThetaZScore(1.5);
        result.current.setElapsedSeconds(60);
        result.current.setVisualizationMode('gauge');
      });

      // Reset
      act(() => {
        result.current.resetSessionState();
      });

      expect(result.current.currentSession).toBeNull();
      expect(result.current.sessionConfig).toBeNull();
      expect(result.current.sessionState).toBe('idle');
      expect(result.current.calibrationState).toBeNull();
      expect(result.current.visualizationMode).toBe('numeric');
      expect(result.current.currentThetaZScore).toBeNull();
      expect(result.current.elapsedSeconds).toBe(0);
    });
  });
});

describe('SettingsContext', () => {
  describe('Provider and Hook', () => {
    it('should throw error when useSettings is called outside provider', () => {
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        renderHook(() => useSettings());
      }).toThrow('useSettings must be used within a SettingsProvider');

      console.error = originalError;
    });

    it('should provide default settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.settings).toEqual(defaultSettings);
    });

    it('should accept initial settings', () => {
      const initialSettings = {
        notifications_enabled: false,
        default_volume: 50,
      };

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider initialSettings={initialSettings}>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.settings.notifications_enabled).toBe(false);
      expect(result.current.settings.default_volume).toBe(50);
      // Other settings should still have default values
      expect(result.current.settings.auto_reconnect).toBe(true);
    });

    it('should update settings partially', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          default_volume: 80,
          haptic_feedback: false,
        });
      });

      expect(result.current.settings.default_volume).toBe(80);
      expect(result.current.settings.haptic_feedback).toBe(false);
      // Other settings should remain unchanged
      expect(result.current.settings.auto_reconnect).toBe(true);
      expect(result.current.settings.notification_style).toBe('smart');
    });

    it('should reset settings to defaults', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      // Update some settings
      act(() => {
        result.current.updateSettings({
          default_volume: 90,
          notifications_enabled: false,
          text_size: 'large',
        });
      });

      // Reset
      act(() => {
        result.current.resetSettings();
      });

      expect(result.current.settings).toEqual(defaultSettings);
    });

    it('should handle all device settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          paired_device_id: 'device-abc-123',
          auto_reconnect: false,
        });
      });

      expect(result.current.settings.paired_device_id).toBe('device-abc-123');
      expect(result.current.settings.auto_reconnect).toBe(false);
    });

    it('should handle all notification settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          notifications_enabled: false,
          notification_style: 'gentle',
          notification_frequency: 5,
          quiet_hours_start: 22,
          quiet_hours_end: 7,
        });
      });

      expect(result.current.settings.notifications_enabled).toBe(false);
      expect(result.current.settings.notification_style).toBe('gentle');
      expect(result.current.settings.notification_frequency).toBe(5);
      expect(result.current.settings.quiet_hours_start).toBe(22);
      expect(result.current.settings.quiet_hours_end).toBe(7);
    });

    it('should handle all audio settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          audio_mixing_mode: 'mix',
          default_volume: 65,
          mixing_ratio: 0.7,
        });
      });

      expect(result.current.settings.audio_mixing_mode).toBe('mix');
      expect(result.current.settings.default_volume).toBe(65);
      expect(result.current.settings.mixing_ratio).toBe(0.7);
    });

    it('should handle all entrainment settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          auto_boost_enabled: true,
          boost_frequency: 6.5,
          boost_time: 10,
        });
      });

      expect(result.current.settings.auto_boost_enabled).toBe(true);
      expect(result.current.settings.boost_frequency).toBe(6.5);
      expect(result.current.settings.boost_time).toBe(10);
    });

    it('should handle theta threshold settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          target_zscore: 1.5,
          closed_loop_behavior: 'stop_entrainment',
        });
      });

      expect(result.current.settings.target_zscore).toBe(1.5);
      expect(result.current.settings.closed_loop_behavior).toBe('stop_entrainment');
    });

    it('should handle accessibility settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          text_size: 'large',
          reduce_motion: true,
          haptic_feedback: false,
        });
      });

      expect(result.current.settings.text_size).toBe('large');
      expect(result.current.settings.reduce_motion).toBe(true);
      expect(result.current.settings.haptic_feedback).toBe(false);
    });

    it('should handle privacy and onboarding settings', () => {
      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <SettingsProvider>{children}</SettingsProvider>
      );

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.updateSettings({
          anonymous_analytics: true,
          onboarding_completed: true,
          ab_testing_enabled: true,
        });
      });

      expect(result.current.settings.anonymous_analytics).toBe(true);
      expect(result.current.settings.onboarding_completed).toBe(true);
      expect(result.current.settings.ab_testing_enabled).toBe(true);
    });
  });

  describe('Default Settings', () => {
    it('should have correct default values', () => {
      expect(defaultSettings.paired_device_id).toBeNull();
      expect(defaultSettings.auto_reconnect).toBe(true);
      expect(defaultSettings.notifications_enabled).toBe(true);
      expect(defaultSettings.notification_style).toBe('smart');
      expect(defaultSettings.notification_frequency).toBe(3);
      expect(defaultSettings.quiet_hours_start).toBeNull();
      expect(defaultSettings.quiet_hours_end).toBeNull();
      expect(defaultSettings.audio_mixing_mode).toBe('exclusive');
      expect(defaultSettings.default_volume).toBe(70);
      expect(defaultSettings.mixing_ratio).toBe(0.5);
      expect(defaultSettings.auto_boost_enabled).toBe(false);
      expect(defaultSettings.boost_frequency).toBe(6.0);
      expect(defaultSettings.boost_time).toBe(5);
      expect(defaultSettings.target_zscore).toBe(1.0);
      expect(defaultSettings.closed_loop_behavior).toBe('reduce_intensity');
      expect(defaultSettings.text_size).toBe('medium');
      expect(defaultSettings.reduce_motion).toBe(false);
      expect(defaultSettings.haptic_feedback).toBe(true);
      expect(defaultSettings.anonymous_analytics).toBe(false);
      expect(defaultSettings.onboarding_completed).toBe(false);
      expect(defaultSettings.ab_testing_enabled).toBe(false);
    });
  });
});
