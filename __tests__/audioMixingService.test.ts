/**
 * Tests for AudioMixingService
 * Verifies audio mixing modes, ratio controls, platform-specific behavior,
 * and state management
 */

import { Platform } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';
import {
  AudioMixMode,
  AudioMixingService,
  AudioSessionConfig,
  AudioStatus,
  AudioMixingStateListener,
  DEFAULT_AUDIO_SESSION_CONFIG,
  DEFAULT_MIXING_RATIO,
  MIN_MIXING_RATIO,
  MAX_MIXING_RATIO,
  MIXING_RATIO_STEP,
  isValidMixingRatio,
  clampMixingRatio,
  formatMixingRatio,
  getIOSInterruptionMode,
  getAndroidInterruptionMode,
  getAudioMixModeLabel,
  getAudioMixModeDescription,
  getAudioMixModeAccessibilityLabel,
  AUDIO_MIX_MODES,
  createAudioMixingService,
  getAudioMixingService,
  resetAudioMixingService,
} from '../src/services/audioMixingService';

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('AudioMixingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetAudioMixingService();
  });

  describe('AudioMixMode Type', () => {
    it('should have valid audio mix modes', () => {
      const modes: AudioMixMode[] = ['exclusive', 'mix', 'duck'];
      expect(AUDIO_MIX_MODES).toEqual(modes);
    });

    it('should have exactly 3 audio mix modes', () => {
      expect(AUDIO_MIX_MODES.length).toBe(3);
    });

    it('should include exclusive mode', () => {
      expect(AUDIO_MIX_MODES).toContain('exclusive');
    });

    it('should include mix mode', () => {
      expect(AUDIO_MIX_MODES).toContain('mix');
    });

    it('should include duck mode', () => {
      expect(AUDIO_MIX_MODES).toContain('duck');
    });
  });

  describe('Default Configuration', () => {
    it('should have valid default audio session config', () => {
      expect(DEFAULT_AUDIO_SESSION_CONFIG).toBeDefined();
      expect(DEFAULT_AUDIO_SESSION_CONFIG.allowsBackgroundAudio).toBe(true);
      expect(DEFAULT_AUDIO_SESSION_CONFIG.playsInSilentModeIOS).toBe(true);
      expect(DEFAULT_AUDIO_SESSION_CONFIG.staysActiveInBackground).toBe(true);
    });

    it('should have valid default mixing ratio', () => {
      expect(DEFAULT_MIXING_RATIO).toBe(0.7);
    });

    it('should have valid mixing ratio bounds', () => {
      expect(MIN_MIXING_RATIO).toBe(0.0);
      expect(MAX_MIXING_RATIO).toBe(1.0);
    });

    it('should have valid mixing ratio step', () => {
      expect(MIXING_RATIO_STEP).toBe(0.1);
    });
  });

  describe('isValidMixingRatio', () => {
    it('should return true for valid ratios', () => {
      expect(isValidMixingRatio(0)).toBe(true);
      expect(isValidMixingRatio(0.5)).toBe(true);
      expect(isValidMixingRatio(1.0)).toBe(true);
      expect(isValidMixingRatio(0.7)).toBe(true);
    });

    it('should return false for ratios below minimum', () => {
      expect(isValidMixingRatio(-0.1)).toBe(false);
      expect(isValidMixingRatio(-1)).toBe(false);
    });

    it('should return false for ratios above maximum', () => {
      expect(isValidMixingRatio(1.1)).toBe(false);
      expect(isValidMixingRatio(2)).toBe(false);
    });

    it('should return false for non-number values', () => {
      expect(isValidMixingRatio(NaN)).toBe(false);
      expect(isValidMixingRatio(undefined as unknown as number)).toBe(false);
      expect(isValidMixingRatio(null as unknown as number)).toBe(false);
      expect(isValidMixingRatio('0.5' as unknown as number)).toBe(false);
    });
  });

  describe('clampMixingRatio', () => {
    it('should return value unchanged if within range', () => {
      expect(clampMixingRatio(0.5)).toBe(0.5);
      expect(clampMixingRatio(0)).toBe(0);
      expect(clampMixingRatio(1)).toBe(1);
    });

    it('should clamp values below minimum to minimum', () => {
      expect(clampMixingRatio(-0.5)).toBe(0);
      expect(clampMixingRatio(-1)).toBe(0);
    });

    it('should clamp values above maximum to maximum', () => {
      expect(clampMixingRatio(1.5)).toBe(1);
      expect(clampMixingRatio(2)).toBe(1);
    });

    it('should return default for invalid values', () => {
      expect(clampMixingRatio(NaN)).toBe(DEFAULT_MIXING_RATIO);
      expect(clampMixingRatio(undefined as unknown as number)).toBe(
        DEFAULT_MIXING_RATIO
      );
    });
  });

  describe('formatMixingRatio', () => {
    it('should format 0 as "0%"', () => {
      expect(formatMixingRatio(0)).toBe('0%');
    });

    it('should format 1 as "100%"', () => {
      expect(formatMixingRatio(1)).toBe('100%');
    });

    it('should format 0.5 as "50%"', () => {
      expect(formatMixingRatio(0.5)).toBe('50%');
    });

    it('should format 0.7 as "70%"', () => {
      expect(formatMixingRatio(0.7)).toBe('70%');
    });

    it('should round decimal percentages', () => {
      expect(formatMixingRatio(0.333)).toBe('33%');
      expect(formatMixingRatio(0.666)).toBe('67%');
    });
  });

  describe('getIOSInterruptionMode', () => {
    it('should return DoNotMix for exclusive mode', () => {
      expect(getIOSInterruptionMode('exclusive')).toBe(
        InterruptionModeIOS.DoNotMix
      );
    });

    it('should return MixWithOthers for mix mode', () => {
      expect(getIOSInterruptionMode('mix')).toBe(
        InterruptionModeIOS.MixWithOthers
      );
    });

    it('should return DuckOthers for duck mode', () => {
      expect(getIOSInterruptionMode('duck')).toBe(
        InterruptionModeIOS.DuckOthers
      );
    });

    it('should return DoNotMix for unknown mode', () => {
      expect(getIOSInterruptionMode('unknown' as AudioMixMode)).toBe(
        InterruptionModeIOS.DoNotMix
      );
    });
  });

  describe('getAndroidInterruptionMode', () => {
    it('should return DoNotMix for exclusive mode', () => {
      expect(getAndroidInterruptionMode('exclusive')).toBe(
        InterruptionModeAndroid.DoNotMix
      );
    });

    it('should return DuckOthers for mix mode (Android fallback)', () => {
      expect(getAndroidInterruptionMode('mix')).toBe(
        InterruptionModeAndroid.DuckOthers
      );
    });

    it('should return DuckOthers for duck mode', () => {
      expect(getAndroidInterruptionMode('duck')).toBe(
        InterruptionModeAndroid.DuckOthers
      );
    });

    it('should return DoNotMix for unknown mode', () => {
      expect(getAndroidInterruptionMode('unknown' as AudioMixMode)).toBe(
        InterruptionModeAndroid.DoNotMix
      );
    });
  });

  describe('getAudioMixModeLabel', () => {
    it('should return "Exclusive" for exclusive mode', () => {
      expect(getAudioMixModeLabel('exclusive')).toBe('Exclusive');
    });

    it('should return "Mix" for mix mode', () => {
      expect(getAudioMixModeLabel('mix')).toBe('Mix');
    });

    it('should return "Duck" for duck mode', () => {
      expect(getAudioMixModeLabel('duck')).toBe('Duck');
    });

    it('should return "Unknown" for unknown mode', () => {
      expect(getAudioMixModeLabel('unknown' as AudioMixMode)).toBe('Unknown');
    });
  });

  describe('getAudioMixModeDescription', () => {
    it('should return description for exclusive mode', () => {
      expect(getAudioMixModeDescription('exclusive')).toBe(
        'Pauses other audio when app audio plays'
      );
    });

    it('should return description for mix mode', () => {
      expect(getAudioMixModeDescription('mix')).toBe(
        'Blends app audio with other audio sources'
      );
    });

    it('should return description for duck mode', () => {
      expect(getAudioMixModeDescription('duck')).toBe(
        'Lowers other audio volume during playback'
      );
    });

    it('should return empty string for unknown mode', () => {
      expect(getAudioMixModeDescription('unknown' as AudioMixMode)).toBe('');
    });
  });

  describe('getAudioMixModeAccessibilityLabel', () => {
    it('should return accessibility label for exclusive mode', () => {
      expect(getAudioMixModeAccessibilityLabel('exclusive')).toBe(
        'Exclusive mode, pauses other audio when app audio plays'
      );
    });

    it('should return accessibility label for mix mode', () => {
      expect(getAudioMixModeAccessibilityLabel('mix')).toBe(
        'Mix mode, blends app audio with other audio sources'
      );
    });

    it('should return accessibility label for duck mode', () => {
      expect(getAudioMixModeAccessibilityLabel('duck')).toBe(
        'Duck mode, lowers other audio volume during playback'
      );
    });

    it('should return fallback for unknown mode', () => {
      expect(getAudioMixModeAccessibilityLabel('unknown' as AudioMixMode)).toBe(
        'Unknown audio mode'
      );
    });
  });

  describe('AudioMixingService Class', () => {
    let service: AudioMixingService;

    beforeEach(() => {
      service = new AudioMixingService();
    });

    afterEach(() => {
      service.destroy();
    });

    describe('Constructor', () => {
      it('should create instance with default config', () => {
        const config = service.getConfig();
        expect(config).toEqual(DEFAULT_AUDIO_SESSION_CONFIG);
      });

      it('should create instance with custom config', () => {
        const customConfig: Partial<AudioSessionConfig> = {
          allowsBackgroundAudio: false,
        };
        const customService = new AudioMixingService(customConfig);
        const config = customService.getConfig();
        expect(config.allowsBackgroundAudio).toBe(false);
        expect(config.playsInSilentModeIOS).toBe(true);
        customService.destroy();
      });

      it('should start with exclusive mode', () => {
        expect(service.getAudioMode()).toBe('exclusive');
      });

      it('should start with default mixing ratio', () => {
        expect(service.getMixingRatio()).toBe(DEFAULT_MIXING_RATIO);
      });
    });

    describe('getStatus', () => {
      it('should return current audio status', () => {
        const status = service.getStatus();
        expect(status).toEqual({
          isActive: false,
          mode: 'exclusive',
          mixingRatio: DEFAULT_MIXING_RATIO,
          otherAudioPlaying: false,
          otherAudioPaused: false,
        });
      });
    });

    describe('getMixingRatio', () => {
      it('should return current mixing ratio', () => {
        expect(service.getMixingRatio()).toBe(DEFAULT_MIXING_RATIO);
      });
    });

    describe('setMixingRatio', () => {
      it('should set valid mixing ratio', () => {
        const result = service.setMixingRatio(0.5);
        expect(result).toBe(true);
        expect(service.getMixingRatio()).toBe(0.5);
      });

      it('should reject invalid mixing ratio', () => {
        const result = service.setMixingRatio(-0.5);
        expect(result).toBe(false);
        expect(service.getMixingRatio()).toBe(DEFAULT_MIXING_RATIO);
      });

      it('should reject NaN mixing ratio', () => {
        const result = service.setMixingRatio(NaN);
        expect(result).toBe(false);
      });

      it('should notify listeners on ratio change', () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        service.setMixingRatio(0.5);
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({ mixingRatio: 0.5 })
        );
      });
    });

    describe('setAudioMode', () => {
      it('should set audio mode to exclusive', async () => {
        const result = await service.setAudioMode('exclusive');
        expect(result).toBe(true);
        expect(service.getAudioMode()).toBe('exclusive');
        expect(Audio.setAudioModeAsync).toHaveBeenCalled();
      });

      it('should set audio mode to mix', async () => {
        const result = await service.setAudioMode('mix');
        expect(result).toBe(true);
        expect(service.getAudioMode()).toBe('mix');
      });

      it('should set audio mode to duck', async () => {
        const result = await service.setAudioMode('duck');
        expect(result).toBe(true);
        expect(service.getAudioMode()).toBe('duck');
      });

      it('should mark session as active after setting mode', async () => {
        await service.setAudioMode('mix');
        const status = service.getStatus();
        expect(status.isActive).toBe(true);
      });

      it('should notify listeners on mode change', async () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        await service.setAudioMode('mix');
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({ mode: 'mix', isActive: true })
        );
      });

      it('should handle setAudioModeAsync error', async () => {
        (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Audio error')
        );
        const result = await service.setAudioMode('mix');
        expect(result).toBe(false);
      });
    });

    describe('isOtherAudioPlaying', () => {
      it('should return false by default', () => {
        expect(service.isOtherAudioPlaying()).toBe(false);
      });

      it('should return true after setting other audio playing', () => {
        service.setOtherAudioPlaying(true);
        expect(service.isOtherAudioPlaying()).toBe(true);
      });
    });

    describe('setOtherAudioPlaying', () => {
      it('should update other audio playing status', () => {
        service.setOtherAudioPlaying(true);
        expect(service.isOtherAudioPlaying()).toBe(true);
        service.setOtherAudioPlaying(false);
        expect(service.isOtherAudioPlaying()).toBe(false);
      });

      it('should notify listeners', () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        service.setOtherAudioPlaying(true);
        expect(listener).toHaveBeenCalledWith(
          expect.objectContaining({ otherAudioPlaying: true })
        );
      });
    });

    describe('pauseOtherAudio', () => {
      it('should pause other audio and set to exclusive mode', async () => {
        const result = await service.pauseOtherAudio();
        expect(result).toBe(true);
        expect(service.getAudioMode()).toBe('exclusive');
        expect(service.getStatus().otherAudioPaused).toBe(true);
        expect(service.getStatus().otherAudioPlaying).toBe(false);
      });

      it('should handle error gracefully', async () => {
        (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Error')
        );
        const result = await service.pauseOtherAudio();
        expect(result).toBe(false);
      });
    });

    describe('resumeOtherAudio', () => {
      it('should not resume if other audio was not paused', async () => {
        const result = await service.resumeOtherAudio();
        expect(result).toBe(false);
      });

      it('should resume other audio after pausing', async () => {
        await service.pauseOtherAudio();
        const result = await service.resumeOtherAudio();
        expect(result).toBe(true);
        expect(service.getStatus().otherAudioPaused).toBe(false);
        expect(service.getStatus().isActive).toBe(false);
      });

      it('should handle error gracefully', async () => {
        await service.pauseOtherAudio();
        (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Error')
        );
        const result = await service.resumeOtherAudio();
        expect(result).toBe(false);
      });
    });

    describe('activate', () => {
      it('should activate audio session with current mode', async () => {
        const result = await service.activate();
        expect(result).toBe(true);
        expect(service.getStatus().isActive).toBe(true);
      });
    });

    describe('deactivate', () => {
      it('should deactivate audio session', async () => {
        await service.activate();
        const result = await service.deactivate();
        expect(result).toBe(true);
        expect(service.getStatus().isActive).toBe(false);
      });

      it('should handle error gracefully', async () => {
        (Audio.setAudioModeAsync as jest.Mock).mockRejectedValueOnce(
          new Error('Error')
        );
        const result = await service.deactivate();
        expect(result).toBe(false);
      });
    });

    describe('setConfig', () => {
      it('should update configuration', () => {
        service.setConfig({ allowsBackgroundAudio: false });
        const config = service.getConfig();
        expect(config.allowsBackgroundAudio).toBe(false);
      });

      it('should preserve other config values', () => {
        service.setConfig({ allowsBackgroundAudio: false });
        const config = service.getConfig();
        expect(config.playsInSilentModeIOS).toBe(true);
      });
    });

    describe('State Listeners', () => {
      it('should add and notify state listener', () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        service.setMixingRatio(0.5);
        expect(listener).toHaveBeenCalled();
      });

      it('should remove state listener', () => {
        const listener = jest.fn();
        const unsubscribe = service.addStateListener(listener);
        unsubscribe();
        service.setMixingRatio(0.5);
        expect(listener).not.toHaveBeenCalled();
      });

      it('should remove listener via removeStateListener', () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        service.removeStateListener(listener);
        service.setMixingRatio(0.5);
        expect(listener).not.toHaveBeenCalled();
      });

      it('should handle listener errors gracefully', () => {
        const errorListener = jest.fn().mockImplementation(() => {
          throw new Error('Listener error');
        });
        const consoleSpy = jest
          .spyOn(console, 'error')
          .mockImplementation(() => {});
        service.addStateListener(errorListener);
        service.setMixingRatio(0.5);
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
      });
    });

    describe('getPlatform', () => {
      it('should return ios for iOS platform', () => {
        expect(service.getPlatform()).toBe('ios');
      });
    });

    describe('isPlatformSupported', () => {
      it('should return true for iOS', () => {
        expect(service.isPlatformSupported()).toBe(true);
      });
    });

    describe('reset', () => {
      it('should reset service to default state', async () => {
        await service.setAudioMode('mix');
        service.setMixingRatio(0.3);
        service.setOtherAudioPlaying(true);

        service.reset();

        expect(service.getAudioMode()).toBe('exclusive');
        expect(service.getMixingRatio()).toBe(DEFAULT_MIXING_RATIO);
        expect(service.isOtherAudioPlaying()).toBe(false);
        expect(service.getStatus().isActive).toBe(false);
      });

      it('should notify listeners on reset', () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        service.reset();
        expect(listener).toHaveBeenCalled();
      });
    });

    describe('destroy', () => {
      it('should clear all listeners', () => {
        const listener = jest.fn();
        service.addStateListener(listener);
        service.destroy();
        service.setMixingRatio(0.5);
        expect(listener).not.toHaveBeenCalled();
      });

      it('should reset state on destroy', () => {
        service.destroy();
        expect(service.getAudioMode()).toBe('exclusive');
        expect(service.getMixingRatio()).toBe(DEFAULT_MIXING_RATIO);
      });
    });
  });

  describe('Factory Functions', () => {
    describe('createAudioMixingService', () => {
      it('should create new instance', () => {
        const service = createAudioMixingService();
        expect(service).toBeInstanceOf(AudioMixingService);
        service.destroy();
      });

      it('should create instance with custom config', () => {
        const service = createAudioMixingService({
          allowsBackgroundAudio: false,
        });
        expect(service.getConfig().allowsBackgroundAudio).toBe(false);
        service.destroy();
      });
    });

    describe('getAudioMixingService', () => {
      it('should return singleton instance', () => {
        const service1 = getAudioMixingService();
        const service2 = getAudioMixingService();
        expect(service1).toBe(service2);
      });

      it('should create new instance after reset', () => {
        const service1 = getAudioMixingService();
        resetAudioMixingService();
        const service2 = getAudioMixingService();
        expect(service1).not.toBe(service2);
      });
    });

    describe('resetAudioMixingService', () => {
      it('should destroy existing singleton instance', () => {
        const service = getAudioMixingService();
        const destroySpy = jest.spyOn(service, 'destroy');
        resetAudioMixingService();
        expect(destroySpy).toHaveBeenCalled();
      });

      it('should handle reset when no instance exists', () => {
        resetAudioMixingService();
        expect(() => resetAudioMixingService()).not.toThrow();
      });
    });
  });

  describe('Platform-specific Behavior', () => {
    describe('iOS Audio Mode Configuration', () => {
      it('should configure iOS with exclusive mode settings', async () => {
        const service = new AudioMixingService();
        await service.setAudioMode('exclusive');

        expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            interruptionModeIOS: InterruptionModeIOS.DoNotMix,
            playsInSilentModeIOS: true,
            staysActiveInBackground: true,
          })
        );
        service.destroy();
      });

      it('should configure iOS with mix mode settings', async () => {
        const service = new AudioMixingService();
        await service.setAudioMode('mix');

        expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
            shouldDuckAndroid: true,
          })
        );
        service.destroy();
      });

      it('should configure iOS with duck mode settings', async () => {
        const service = new AudioMixingService();
        await service.setAudioMode('duck');

        expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            interruptionModeIOS: InterruptionModeIOS.DuckOthers,
            shouldDuckAndroid: true,
          })
        );
        service.destroy();
      });
    });

    describe('Android Audio Mode Configuration', () => {
      it('should configure Android with exclusive mode settings', async () => {
        const service = new AudioMixingService();
        await service.setAudioMode('exclusive');

        expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            interruptionModeAndroid: InterruptionModeAndroid.DoNotMix,
            shouldDuckAndroid: false,
          })
        );
        service.destroy();
      });

      it('should configure Android with duck mode settings', async () => {
        const service = new AudioMixingService();
        await service.setAudioMode('duck');

        expect(Audio.setAudioModeAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
            shouldDuckAndroid: true,
          })
        );
        service.destroy();
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mode changes', async () => {
      const service = new AudioMixingService();

      await Promise.all([
        service.setAudioMode('exclusive'),
        service.setAudioMode('mix'),
        service.setAudioMode('duck'),
      ]);

      // Should have called setAudioModeAsync multiple times
      expect(Audio.setAudioModeAsync).toHaveBeenCalled();
      service.destroy();
    });

    it('should handle rapid ratio changes', () => {
      const service = new AudioMixingService();

      for (let i = 0; i <= 10; i++) {
        service.setMixingRatio(i / 10);
      }

      expect(service.getMixingRatio()).toBe(1.0);
      service.destroy();
    });

    it('should handle multiple listeners', () => {
      const service = new AudioMixingService();
      const listeners = [jest.fn(), jest.fn(), jest.fn()];

      listeners.forEach((l) => service.addStateListener(l));
      service.setMixingRatio(0.5);

      listeners.forEach((l) => {
        expect(l).toHaveBeenCalled();
      });

      service.destroy();
    });

    it('should handle listener removal during notification', () => {
      const service = new AudioMixingService();
      let unsubscribe: (() => void) | null = null;

      const listener1 = jest.fn().mockImplementation(() => {
        if (unsubscribe) {
          unsubscribe();
        }
      });
      const listener2 = jest.fn();

      unsubscribe = service.addStateListener(listener1);
      service.addStateListener(listener2);

      service.setMixingRatio(0.5);

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();

      service.destroy();
    });
  });
});
