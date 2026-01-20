import {
  BaselineProfile,
  Session,
  CircadianPattern,
  DeviceInfo,
  AppSettings,
  EEGDataPacket,
  SignalQuality,
  SessionConfig,
  SessionState,
  CalibrationState,
  VisualizationMode,
  ThemeColors,
} from '../src/types';

describe('TypeScript Types', () => {
  describe('BaselineProfile', () => {
    it('should create a valid BaselineProfile object', () => {
      const baseline: BaselineProfile = {
        theta_mean: 10.5,
        theta_std: 2.3,
        alpha_mean: 8.7,
        beta_mean: 6.2,
        peak_theta_freq: 6.5,
        optimal_freq: 6.0,
        calibration_timestamp: Date.now(),
        quality_score: 85.5,
      };

      expect(baseline.theta_mean).toBe(10.5);
      expect(baseline.quality_score).toBe(85.5);
    });

    it('should require all fields', () => {
      const baseline: BaselineProfile = {
        theta_mean: 0,
        theta_std: 0,
        alpha_mean: 0,
        beta_mean: 0,
        peak_theta_freq: 0,
        optimal_freq: 0,
        calibration_timestamp: 0,
        quality_score: 0,
      };

      expect(baseline).toBeDefined();
    });
  });

  describe('Session', () => {
    it('should create a valid Session object', () => {
      const session: Session = {
        id: 1,
        session_type: 'quick_boost',
        start_time: Date.now(),
        end_time: Date.now() + 300000,
        duration_seconds: 300,
        avg_theta_zscore: 1.5,
        max_theta_zscore: 2.3,
        entrainment_freq: 6.0,
        volume: 75,
        signal_quality_avg: 85.5,
        subjective_rating: 4,
        notes: 'Felt focused',
      };

      expect(session.session_type).toBe('quick_boost');
      expect(session.duration_seconds).toBe(300);
    });

    it('should allow null for subjective_rating and notes', () => {
      const session: Session = {
        id: 2,
        session_type: 'calibration',
        start_time: Date.now(),
        end_time: Date.now(),
        duration_seconds: 600,
        avg_theta_zscore: 0,
        max_theta_zscore: 0,
        entrainment_freq: 0,
        volume: 0,
        signal_quality_avg: 0,
        subjective_rating: null,
        notes: null,
      };

      expect(session.subjective_rating).toBeNull();
      expect(session.notes).toBeNull();
    });

    it('should accept all valid session_type values', () => {
      const types: Session['session_type'][] = [
        'calibration',
        'quick_boost',
        'custom',
        'scheduled',
        'sham',
      ];

      types.forEach((type) => {
        const session: Session = {
          id: 1,
          session_type: type,
          start_time: 0,
          end_time: 0,
          duration_seconds: 0,
          avg_theta_zscore: 0,
          max_theta_zscore: 0,
          entrainment_freq: 0,
          volume: 0,
          signal_quality_avg: 0,
          subjective_rating: null,
          notes: null,
        };

        expect(session.session_type).toBe(type);
      });
    });
  });

  describe('CircadianPattern', () => {
    it('should create a valid CircadianPattern object', () => {
      const pattern: CircadianPattern = {
        hour_of_day: 14,
        avg_theta_mean: 12.5,
        avg_theta_std: 2.1,
        session_count: 5,
        avg_subjective_rating: 4.2,
      };

      expect(pattern.hour_of_day).toBe(14);
      expect(pattern.session_count).toBe(5);
    });
  });

  describe('DeviceInfo', () => {
    it('should create a valid DeviceInfo object', () => {
      const device: DeviceInfo = {
        id: 'abc123',
        name: 'FlowState Headband',
        type: 'headband',
        sampling_rate: 500,
        battery_level: 85,
        firmware_version: '1.2.3',
        rssi: -60,
        is_connected: true,
        last_connected: Date.now(),
      };

      expect(device.type).toBe('headband');
      expect(device.is_connected).toBe(true);
    });

    it('should allow null for optional fields', () => {
      const device: DeviceInfo = {
        id: 'xyz789',
        name: 'FlowState Earpiece',
        type: 'earpiece',
        sampling_rate: 250,
        battery_level: null,
        firmware_version: null,
        rssi: null,
        is_connected: false,
        last_connected: null,
      };

      expect(device.battery_level).toBeNull();
      expect(device.firmware_version).toBeNull();
    });

    it('should accept both device types', () => {
      const headband: DeviceInfo = {
        id: '1',
        name: 'Headband',
        type: 'headband',
        sampling_rate: 500,
        battery_level: null,
        firmware_version: null,
        rssi: null,
        is_connected: false,
        last_connected: null,
      };

      const earpiece: DeviceInfo = {
        id: '2',
        name: 'Earpiece',
        type: 'earpiece',
        sampling_rate: 250,
        battery_level: null,
        firmware_version: null,
        rssi: null,
        is_connected: false,
        last_connected: null,
      };

      expect(headband.type).toBe('headband');
      expect(earpiece.type).toBe('earpiece');
    });
  });

  describe('AppSettings', () => {
    it('should create a valid AppSettings object with all fields', () => {
      const settings: AppSettings = {
        paired_device_id: 'device123',
        auto_reconnect: true,
        notifications_enabled: true,
        notification_style: 'smart',
        notification_frequency: 60,
        quiet_hours_start: 22,
        quiet_hours_end: 7,
        audio_mixing_mode: 'mix',
        default_volume: 70,
        mixing_ratio: 0.5,
        auto_boost_enabled: false,
        boost_frequency: 6.0,
        boost_time: 5,
        target_zscore: 1.5,
        closed_loop_behavior: 'reduce_intensity',
        text_size: 'medium',
        reduce_motion: false,
        haptic_feedback: true,
        anonymous_analytics: true,
        onboarding_completed: true,
        ab_testing_enabled: false,
      };

      expect(settings.paired_device_id).toBe('device123');
      expect(settings.notification_style).toBe('smart');
      expect(settings.closed_loop_behavior).toBe('reduce_intensity');
    });

    it('should allow null for optional fields', () => {
      const settings: AppSettings = {
        paired_device_id: null,
        auto_reconnect: true,
        notifications_enabled: false,
        notification_style: 'off',
        notification_frequency: 0,
        quiet_hours_start: null,
        quiet_hours_end: null,
        audio_mixing_mode: 'exclusive',
        default_volume: 50,
        mixing_ratio: 0,
        auto_boost_enabled: false,
        boost_frequency: 6.0,
        boost_time: 5,
        target_zscore: 1.0,
        closed_loop_behavior: 'maintain_level',
        text_size: 'small',
        reduce_motion: false,
        haptic_feedback: false,
        anonymous_analytics: false,
        onboarding_completed: false,
        ab_testing_enabled: false,
      };

      expect(settings.paired_device_id).toBeNull();
      expect(settings.quiet_hours_start).toBeNull();
    });

    it('should accept all valid notification_style values', () => {
      const styles: AppSettings['notification_style'][] = [
        'simple',
        'smart',
        'gentle',
        'off',
      ];

      styles.forEach((style) => {
        const settings: Partial<AppSettings> = {
          notification_style: style,
        };
        expect(settings.notification_style).toBe(style);
      });
    });

    it('should accept all valid closed_loop_behavior values', () => {
      const behaviors: AppSettings['closed_loop_behavior'][] = [
        'reduce_intensity',
        'stop_entrainment',
        'maintain_level',
      ];

      behaviors.forEach((behavior) => {
        const settings: Partial<AppSettings> = {
          closed_loop_behavior: behavior,
        };
        expect(settings.closed_loop_behavior).toBe(behavior);
      });
    });
  });

  describe('EEGDataPacket', () => {
    it('should create a valid EEGDataPacket object', () => {
      const packet: EEGDataPacket = {
        timestamp: Date.now(),
        samples: [1.2, 3.4, 5.6, 7.8],
        sequence_number: 123,
      };

      expect(packet.samples.length).toBe(4);
      expect(packet.sequence_number).toBe(123);
    });
  });

  describe('SignalQuality', () => {
    it('should create a valid SignalQuality object', () => {
      const quality: SignalQuality = {
        score: 85.5,
        artifact_percentage: 12.3,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: true,
      };

      expect(quality.score).toBe(85.5);
      expect(quality.has_frequency_artifact).toBe(true);
    });
  });

  describe('SessionConfig', () => {
    it('should create a valid SessionConfig object', () => {
      const config: SessionConfig = {
        type: 'custom',
        duration_minutes: 30,
        entrainment_freq: 6.5,
        volume: 80,
        target_zscore: 1.8,
        closed_loop_behavior: 'reduce_intensity',
      };

      expect(config.type).toBe('custom');
      expect(config.duration_minutes).toBe(30);
    });
  });

  describe('SessionState type', () => {
    it('should accept all valid SessionState values', () => {
      const states: SessionState[] = ['idle', 'running', 'paused', 'stopped'];

      states.forEach((state) => {
        const currentState: SessionState = state;
        expect(currentState).toBe(state);
      });
    });
  });

  describe('CalibrationState type', () => {
    it('should accept all valid CalibrationState values', () => {
      const states: CalibrationState[] = [
        'instructions',
        'countdown',
        'recording',
        'processing',
        'complete',
      ];

      states.forEach((state) => {
        const currentState: CalibrationState = state;
        expect(currentState).toBe(state);
      });
    });
  });

  describe('VisualizationMode type', () => {
    it('should accept all valid VisualizationMode values', () => {
      const modes: VisualizationMode[] = ['numeric', 'gauge', 'chart'];

      modes.forEach((mode) => {
        const currentMode: VisualizationMode = mode;
        expect(currentMode).toBe(mode);
      });
    });
  });

  describe('ThemeColors', () => {
    it('should create a valid ThemeColors object', () => {
      const theme: ThemeColors = {
        primary: '#6366f1',
        secondary: '#8b5cf6',
        background: '#0f172a',
        surface: '#1e293b',
        error: '#ef4444',
        warning: '#f59e0b',
        success: '#10b981',
        text: '#f8fafc',
        textSecondary: '#94a3b8',
        border: '#334155',
      };

      expect(theme.primary).toBe('#6366f1');
      expect(theme.background).toBe('#0f172a');
    });
  });
});
