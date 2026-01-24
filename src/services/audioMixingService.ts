/**
 * AudioMixingService - Manages audio mixing and session configuration
 *
 * Provides platform-specific audio mixing controls for iOS (AVAudioSession)
 * and Android (AudioManager) using expo-av for audio session configuration.
 *
 * Audio Mix Modes:
 * - exclusive: App audio only, pauses other audio
 * - mix: Blends app audio with other audio sources
 * - duck: Lowers other audio volume when app audio plays
 */

import { Platform } from 'react-native';
import { Audio, InterruptionModeIOS, InterruptionModeAndroid } from 'expo-av';

/**
 * Audio mixing mode type
 * - 'exclusive': App audio only, pauses other audio
 * - 'mix': Blends app audio with other audio sources
 * - 'duck': Lowers other audio volume when app audio plays
 */
export type AudioMixMode = 'exclusive' | 'mix' | 'duck';

/**
 * Audio session configuration options
 */
export interface AudioSessionConfig {
  /** Whether to allow audio playback in the background */
  allowsBackgroundAudio: boolean;
  /** Whether to play through earpiece (vs speaker) */
  playsInSilentModeIOS: boolean;
  /** Whether to stay active during audio interruptions */
  staysActiveInBackground: boolean;
}

/**
 * Audio status information
 */
export interface AudioStatus {
  /** Whether the audio session is active */
  isActive: boolean;
  /** Current audio mix mode */
  mode: AudioMixMode;
  /** Current mixing ratio (0.0 to 1.0) */
  mixingRatio: number;
  /** Whether other audio is currently playing */
  otherAudioPlaying: boolean;
  /** Whether other audio was paused by this service */
  otherAudioPaused: boolean;
}

/**
 * Audio mixing state change listener callback type
 */
export type AudioMixingStateListener = (status: AudioStatus) => void;

/**
 * Default audio session configuration
 */
export const DEFAULT_AUDIO_SESSION_CONFIG: AudioSessionConfig = {
  allowsBackgroundAudio: true,
  playsInSilentModeIOS: true,
  staysActiveInBackground: true,
};

/**
 * Default mixing ratio
 */
export const DEFAULT_MIXING_RATIO = 0.7;

/**
 * Minimum mixing ratio
 */
export const MIN_MIXING_RATIO = 0.0;

/**
 * Maximum mixing ratio
 */
export const MAX_MIXING_RATIO = 1.0;

/**
 * Mixing ratio step size
 */
export const MIXING_RATIO_STEP = 0.1;

/**
 * Validates mixing ratio is within valid range
 */
export const isValidMixingRatio = (ratio: number): boolean => {
  return (
    typeof ratio === 'number' &&
    !isNaN(ratio) &&
    ratio >= MIN_MIXING_RATIO &&
    ratio <= MAX_MIXING_RATIO
  );
};

/**
 * Clamps mixing ratio to valid range
 */
export const clampMixingRatio = (ratio: number): number => {
  if (typeof ratio !== 'number' || isNaN(ratio)) {
    return DEFAULT_MIXING_RATIO;
  }
  return Math.max(MIN_MIXING_RATIO, Math.min(MAX_MIXING_RATIO, ratio));
};

/**
 * Formats mixing ratio as percentage string
 */
export const formatMixingRatio = (ratio: number): string => {
  const percentage = Math.round(ratio * 100);
  return `${percentage}%`;
};

/**
 * Gets the iOS interruption mode for an audio mix mode
 */
export const getIOSInterruptionMode = (
  mode: AudioMixMode
): InterruptionModeIOS => {
  switch (mode) {
    case 'exclusive':
      return InterruptionModeIOS.DoNotMix;
    case 'mix':
      return InterruptionModeIOS.MixWithOthers;
    case 'duck':
      return InterruptionModeIOS.DuckOthers;
    default:
      return InterruptionModeIOS.DoNotMix;
  }
};

/**
 * Gets the Android interruption mode for an audio mix mode
 */
export const getAndroidInterruptionMode = (
  mode: AudioMixMode
): InterruptionModeAndroid => {
  switch (mode) {
    case 'exclusive':
      return InterruptionModeAndroid.DoNotMix;
    case 'mix':
      // Android doesn't have MixWithOthers, use DuckOthers as fallback
      return InterruptionModeAndroid.DuckOthers;
    case 'duck':
      return InterruptionModeAndroid.DuckOthers;
    default:
      return InterruptionModeAndroid.DoNotMix;
  }
};

/**
 * Gets the display label for an audio mix mode
 */
export const getAudioMixModeLabel = (mode: AudioMixMode): string => {
  switch (mode) {
    case 'exclusive':
      return 'Exclusive';
    case 'mix':
      return 'Mix';
    case 'duck':
      return 'Duck';
    default:
      return 'Unknown';
  }
};

/**
 * Gets the description for an audio mix mode
 */
export const getAudioMixModeDescription = (mode: AudioMixMode): string => {
  switch (mode) {
    case 'exclusive':
      return 'Pauses other audio when app audio plays';
    case 'mix':
      return 'Blends app audio with other audio sources';
    case 'duck':
      return 'Lowers other audio volume during playback';
    default:
      return '';
  }
};

/**
 * Gets the accessibility label for an audio mix mode
 */
export const getAudioMixModeAccessibilityLabel = (
  mode: AudioMixMode
): string => {
  switch (mode) {
    case 'exclusive':
      return 'Exclusive mode, pauses other audio when app audio plays';
    case 'mix':
      return 'Mix mode, blends app audio with other audio sources';
    case 'duck':
      return 'Duck mode, lowers other audio volume during playback';
    default:
      return 'Unknown audio mode';
  }
};

/**
 * Audio modes list for UI rendering
 */
export const AUDIO_MIX_MODES: readonly AudioMixMode[] = [
  'exclusive',
  'mix',
  'duck',
] as const;

/**
 * Audio mixing service class
 * Manages audio session configuration and mixing controls
 */
export class AudioMixingService {
  private currentMode: AudioMixMode = 'exclusive';
  private mixingRatio: number = DEFAULT_MIXING_RATIO;
  private isActive: boolean = false;
  private otherAudioPlaying: boolean = false;
  private otherAudioPaused: boolean = false;
  private config: AudioSessionConfig = { ...DEFAULT_AUDIO_SESSION_CONFIG };
  private listeners: Set<AudioMixingStateListener> = new Set();

  /**
   * Creates a new AudioMixingService instance
   */
  constructor(config?: Partial<AudioSessionConfig>) {
    if (config) {
      this.config = { ...DEFAULT_AUDIO_SESSION_CONFIG, ...config };
    }
  }

  /**
   * Gets the current audio status
   */
  getStatus(): AudioStatus {
    return {
      isActive: this.isActive,
      mode: this.currentMode,
      mixingRatio: this.mixingRatio,
      otherAudioPlaying: this.otherAudioPlaying,
      otherAudioPaused: this.otherAudioPaused,
    };
  }

  /**
   * Gets the current audio mix mode
   */
  getAudioMode(): AudioMixMode {
    return this.currentMode;
  }

  /**
   * Gets the current mixing ratio
   */
  getMixingRatio(): number {
    return this.mixingRatio;
  }

  /**
   * Sets the mixing ratio (0.0 to 1.0)
   * @param ratio - The new mixing ratio
   * @returns true if ratio was set successfully
   */
  setMixingRatio(ratio: number): boolean {
    if (!isValidMixingRatio(ratio)) {
      return false;
    }

    this.mixingRatio = clampMixingRatio(ratio);
    this.notifyListeners();
    return true;
  }

  /**
   * Configures the audio session with the specified mode
   * Platform-specific implementation for iOS and Android
   * @param mode - The audio mix mode to set
   */
  async setAudioMode(mode: AudioMixMode): Promise<boolean> {
    try {
      const iosInterruptionMode = getIOSInterruptionMode(mode);
      const androidInterruptionMode = getAndroidInterruptionMode(mode);

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: this.config.playsInSilentModeIOS,
        staysActiveInBackground: this.config.staysActiveInBackground,
        interruptionModeIOS: iosInterruptionMode,
        interruptionModeAndroid: androidInterruptionMode,
        shouldDuckAndroid: mode === 'duck' || mode === 'mix',
        playThroughEarpieceAndroid: false,
      });

      this.currentMode = mode;
      this.isActive = true;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to set audio mode:', error);
      return false;
    }
  }

  /**
   * Checks if other audio is currently playing
   * Note: This is platform-specific and may have limitations
   */
  isOtherAudioPlaying(): boolean {
    // Note: expo-av doesn't provide direct access to check other audio
    // This is tracked internally based on service state
    return this.otherAudioPlaying;
  }

  /**
   * Sets the other audio playing status
   * Used for tracking and testing purposes
   */
  setOtherAudioPlaying(playing: boolean): void {
    this.otherAudioPlaying = playing;
    this.notifyListeners();
  }

  /**
   * Pauses other audio sources
   * Platform-specific implementation
   * @returns true if successfully paused other audio
   */
  async pauseOtherAudio(): Promise<boolean> {
    try {
      // Set to exclusive mode to pause other audio
      const success = await this.setAudioMode('exclusive');

      if (success) {
        this.otherAudioPaused = true;
        this.otherAudioPlaying = false;
        this.notifyListeners();
      }

      return success;
    } catch (error) {
      console.error('Failed to pause other audio:', error);
      return false;
    }
  }

  /**
   * Resumes other audio sources that were paused
   * Platform-specific implementation
   * @returns true if successfully resumed other audio
   */
  async resumeOtherAudio(): Promise<boolean> {
    try {
      if (!this.otherAudioPaused) {
        return false;
      }

      // Deactivate our audio session to allow other audio to resume
      // Note: In a real implementation, this would involve platform-specific calls
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      this.otherAudioPaused = false;
      this.isActive = false;
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error('Failed to resume other audio:', error);
      return false;
    }
  }

  /**
   * Activates the audio session with the current mode
   */
  async activate(): Promise<boolean> {
    return this.setAudioMode(this.currentMode);
  }

  /**
   * Deactivates the audio session
   */
  async deactivate(): Promise<boolean> {
    try {
      // Set to a neutral mode that doesn't interrupt
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        interruptionModeIOS: InterruptionModeIOS.MixWithOthers,
        interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      this.isActive = false;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Failed to deactivate audio session:', error);
      return false;
    }
  }

  /**
   * Updates the audio session configuration
   */
  setConfig(config: Partial<AudioSessionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Gets the current configuration
   */
  getConfig(): AudioSessionConfig {
    return { ...this.config };
  }

  /**
   * Adds a state change listener
   */
  addStateListener(listener: AudioMixingStateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Removes a state change listener
   */
  removeStateListener(listener: AudioMixingStateListener): void {
    this.listeners.delete(listener);
  }

  /**
   * Notifies all listeners of state changes
   */
  private notifyListeners(): void {
    const status = this.getStatus();
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in audio mixing state listener:', error);
      }
    });
  }

  /**
   * Gets the current platform
   */
  getPlatform(): 'ios' | 'android' | 'web' | 'unknown' {
    switch (Platform.OS) {
      case 'ios':
        return 'ios';
      case 'android':
        return 'android';
      case 'web':
        return 'web';
      default:
        return 'unknown';
    }
  }

  /**
   * Checks if the current platform supports audio mixing
   */
  isPlatformSupported(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Resets the service to default state
   */
  reset(): void {
    this.currentMode = 'exclusive';
    this.mixingRatio = DEFAULT_MIXING_RATIO;
    this.isActive = false;
    this.otherAudioPlaying = false;
    this.otherAudioPaused = false;
    this.notifyListeners();
  }

  /**
   * Cleans up the service (removes listeners)
   */
  destroy(): void {
    this.listeners.clear();
    this.reset();
  }
}

/**
 * Creates a new AudioMixingService instance
 */
export const createAudioMixingService = (
  config?: Partial<AudioSessionConfig>
): AudioMixingService => {
  return new AudioMixingService(config);
};

/**
 * Singleton instance of the audio mixing service
 */
let audioMixingServiceInstance: AudioMixingService | null = null;

/**
 * Gets the singleton audio mixing service instance
 */
export const getAudioMixingService = (): AudioMixingService => {
  if (!audioMixingServiceInstance) {
    audioMixingServiceInstance = new AudioMixingService();
  }
  return audioMixingServiceInstance;
};

/**
 * Resets the singleton instance (useful for testing)
 */
export const resetAudioMixingService = (): void => {
  if (audioMixingServiceInstance) {
    audioMixingServiceInstance.destroy();
    audioMixingServiceInstance = null;
  }
};

/**
 * Default export is the AudioMixingService class
 */
export default AudioMixingService;
