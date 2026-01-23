/**
 * Phone Audio Output
 *
 * Plays isochronic tones through the phone's speakers or connected headphones.
 * Uses a pre-generated WAV file with isochronic pulses baked in.
 *
 * ISOCHRONIC TONES:
 * - Regular pulses of sound at a specific frequency (6 Hz for theta)
 * - Pulses are pre-rendered in the WAV file
 * - Audio loops continuously during entrainment
 *
 * CONCURRENCY SAFETY:
 * - Uses promise guards to prevent multiple concurrent init/play/stop calls
 * - Tracks sound instances with unique IDs for debugging
 * - Force-stops audio regardless of internal state
 *
 * WAV GENERATION:
 * The isochronic WAV file is generated using:
 *   cd simulator
 *   python test_isochronic_tones.py --out ../assets/audio/isochronic_theta6_carrier440.wav
 *
 * REQUIRES: expo-av package
 * Install with: npx expo install expo-av
 */

import { Audio, AVPlaybackStatus } from 'expo-av';
import {
  EntrainmentOutput,
  EntrainmentState,
  EntrainmentStateCallback,
  EntrainmentOutputConfig,
} from './EntrainmentOutput';

// Import the pre-generated isochronic tone WAV
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ISOCHRONIC_TONE_ASSET = require('../../../assets/audio/isochronic_theta6_carrier440.wav');

// Global instance counter for debugging
let globalInstanceCounter = 0;

// Global sound instance counter for tracking
let globalSoundInstanceCounter = 0;

/**
 * Configuration for PhoneAudioOutput
 */
export interface PhoneAudioOutputConfig extends EntrainmentOutputConfig {
  /** Fade out duration in ms (default: 500ms) */
  fadeOutDuration?: number;
}

/**
 * PhoneAudioOutput
 *
 * Plays isochronic entrainment tones through the phone using a pre-generated WAV.
 * Thread-safe with promise guards for concurrent access.
 */
export class PhoneAudioOutput implements EntrainmentOutput {
  private config: PhoneAudioOutputConfig;
  private state: EntrainmentState = 'idle';
  private stateCallbacks: Set<EntrainmentStateCallback> = new Set();
  private sound: Audio.Sound | null = null;
  private currentVolume: number;
  private isInitialized = false;

  // Instance tracking
  private readonly instanceId: number;
  private soundInstanceId: number = 0;

  // Concurrency guards - promises that serialize operations
  private initPromise: Promise<void> | null = null;
  private operationPromise: Promise<void> = Promise.resolve();

  // Disposed flag to reject new operations
  private isDisposed = false;

  // Debounce flag to prevent kill-switch loops
  private isKillingStaleSound = false;

  constructor(config: PhoneAudioOutputConfig = {}) {
    this.instanceId = ++globalInstanceCounter;

    this.config = {
      frequency: 6, // 6 Hz theta frequency (baked into WAV)
      volume: 0.7,
      fadeOutDuration: 500,
      ...config,
    };

    this.currentVolume = this.config.volume!;

    if (config.onStateChange) {
      this.stateCallbacks.add(config.onStateChange);
    }

    console.log(`[PhoneAudioOutput#${this.instanceId}] Created with volume: ${this.currentVolume}`);
  }

  async play(frequency?: number, volume?: number): Promise<void> {
    // Serialize with other operations
    return this.serializeOperation(async () => {
      if (this.isDisposed) {
        console.warn(`[PhoneAudioOutput#${this.instanceId}] play() called after dispose, ignoring`);
        return;
      }

      if (this.state === 'playing') {
        console.log(`[PhoneAudioOutput#${this.instanceId}] Already playing (sound#${this.soundInstanceId}), ignoring play()`);
        return;
      }

      // Note: frequency parameter is ignored since it's baked into the WAV
      if (frequency && frequency !== 6) {
        console.warn(`[PhoneAudioOutput#${this.instanceId}] Frequency change ignored - using pre-generated 6 Hz WAV`);
      }

      if (volume !== undefined) {
        this.currentVolume = Math.max(0, Math.min(volume, 1));
      }

      console.log(`[PhoneAudioOutput#${this.instanceId}] play() starting...`);

      try {
        await this.initialize();

        if (!this.sound) {
          throw new Error('Sound not loaded after initialize');
        }

        // Set volume and start playback
        await this.sound.setVolumeAsync(this.currentVolume);
        await this.sound.setPositionAsync(0);
        await this.sound.playAsync();

        this.setState('playing');
        console.log(`[PhoneAudioOutput#${this.instanceId}] ▶️ Playing sound#${this.soundInstanceId} at volume ${this.currentVolume}`);
      } catch (error) {
        console.error(`[PhoneAudioOutput#${this.instanceId}] Failed to start playback:`, error);
        this.setState('idle');
        throw error;
      }
    });
  }

  async stop(): Promise<void> {
    // Serialize with other operations
    return this.serializeOperation(async () => {
      console.log(`[PhoneAudioOutput#${this.instanceId}] stop() called, state=${this.state}, sound#${this.soundInstanceId}`);

      // Force stop regardless of state - always try to stop the sound
      await this.forceStopSound();

      this.setState('idle');
      console.log(`[PhoneAudioOutput#${this.instanceId}] ⏹️ Stopped`);
    });
  }

  setFrequency(frequency: number): void {
    // Frequency is baked into the WAV file
    console.warn(
      `[PhoneAudioOutput#${this.instanceId}] setFrequency(${frequency}) ignored - frequency is baked into WAV (6 Hz)`
    );
  }

  setVolume(volume: number): void {
    this.currentVolume = Math.max(0, Math.min(volume, 1));
    console.log(`[PhoneAudioOutput#${this.instanceId}] Volume set to ${this.currentVolume}`);

    // Apply immediately if sound is loaded (fire and forget)
    if (this.sound && !this.isDisposed) {
      this.sound.setVolumeAsync(this.currentVolume).catch((err) => {
        console.error(`[PhoneAudioOutput#${this.instanceId}] Failed to set volume:`, err);
      });
    }
  }

  getState(): EntrainmentState {
    return this.state;
  }

  isPlaying(): boolean {
    return this.state === 'playing';
  }

  onStateChange(callback: EntrainmentStateCallback): void {
    this.stateCallbacks.add(callback);
  }

  offStateChange(callback: EntrainmentStateCallback): void {
    this.stateCallbacks.delete(callback);
  }

  async dispose(): Promise<void> {
    console.log(`[PhoneAudioOutput#${this.instanceId}] dispose() called`);

    // Mark as disposed first to reject new operations
    this.isDisposed = true;

    // Wait for any pending operation to complete
    try {
      await this.operationPromise;
    } catch {
      // Ignore errors from pending operations
    }

    // Force stop and unload regardless of state
    await this.forceStopSound();
    await this.forceUnloadSound();

    this.setState('idle');
    console.log(`[PhoneAudioOutput#${this.instanceId}] 🗑️ Disposed completely`);
  }

  /**
   * Audio self-test: plays the bundled WAV for 2 seconds to verify expo-av works.
   */
  async selfTest(): Promise<{ success: boolean; error?: string; status?: AVPlaybackStatus }> {
    const testId = ++globalSoundInstanceCounter;
    console.log(`[PhoneAudioOutput#${this.instanceId}] ========== SELF-TEST #${testId} START ==========`);

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });

      // Create a separate test sound
      const { sound: testSound, status: initialStatus } = await Audio.Sound.createAsync(
        ISOCHRONIC_TONE_ASSET,
        { shouldPlay: false, volume: 1.0 }
      );
      console.log(`[PhoneAudioOutput#${this.instanceId}] Self-test sound created`);

      // Play at full volume
      await testSound.setVolumeAsync(1.0);
      await testSound.playAsync();
      console.log(`[PhoneAudioOutput#${this.instanceId}] Self-test playing...`);

      // Wait 2 seconds
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Get final status
      const finalStatus = await testSound.getStatusAsync();

      // Stop and unload
      await testSound.stopAsync();
      await testSound.unloadAsync();

      console.log(`[PhoneAudioOutput#${this.instanceId}] ========== SELF-TEST #${testId} SUCCESS ==========`);
      return { success: true, status: finalStatus };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`[PhoneAudioOutput#${this.instanceId}] ========== SELF-TEST #${testId} FAILED ==========`);
      console.error(`[PhoneAudioOutput#${this.instanceId}] Error:`, errorMsg);
      return { success: false, error: errorMsg };
    }
  }

  // ============ Private Methods ============

  /**
   * Serialize operations to prevent race conditions.
   * Each operation waits for the previous one to complete.
   */
  private async serializeOperation(operation: () => Promise<void>): Promise<void> {
    const previousOperation = this.operationPromise;

    // Chain this operation after the previous one
    this.operationPromise = (async () => {
      try {
        await previousOperation;
      } catch {
        // Ignore errors from previous operations
      }
      await operation();
    })();

    return this.operationPromise;
  }

  /**
   * Initialize audio - concurrency-safe.
   * If already initializing, returns the existing promise.
   * If already initialized with a valid sound, returns immediately.
   */
  private async initialize(): Promise<void> {
    // Already initialized and sound exists
    if (this.isInitialized && this.sound) {
      console.log(`[PhoneAudioOutput#${this.instanceId}] Already initialized with sound#${this.soundInstanceId}`);
      return;
    }

    // Already initializing - wait for it
    if (this.initPromise) {
      console.log(`[PhoneAudioOutput#${this.instanceId}] Init already in progress, waiting...`);
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = this.doInitialize();

    try {
      await this.initPromise;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Actual initialization logic - only called once at a time.
   */
  private async doInitialize(): Promise<void> {
    // If there's an existing sound, clean it up first
    if (this.sound) {
      console.log(`[PhoneAudioOutput#${this.instanceId}] Cleaning up old sound#${this.soundInstanceId} before reinit`);
      await this.forceUnloadSound();
    }

    const newSoundId = ++globalSoundInstanceCounter;
    console.log(`[PhoneAudioOutput#${this.instanceId}] 🔄 Initializing new sound#${newSoundId}...`);

    // Configure audio mode for playback
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (modeError) {
      console.error(`[PhoneAudioOutput#${this.instanceId}] Failed to set audio mode:`, modeError);
      throw modeError;
    }

    // Load the pre-generated isochronic tone WAV
    try {
      const { sound, status } = await Audio.Sound.createAsync(
        ISOCHRONIC_TONE_ASSET,
        {
          shouldPlay: false,
          isLooping: true,
          volume: this.currentVolume,
        },
        this.createPlaybackStatusHandler(newSoundId)
      );

      this.sound = sound;
      this.soundInstanceId = newSoundId;
      this.isInitialized = true;

      console.log(`[PhoneAudioOutput#${this.instanceId}] ✅ Sound#${newSoundId} loaded, duration=${(status as AVPlaybackStatus & { isLoaded: true }).durationMillis}ms`);
    } catch (loadError) {
      console.error(`[PhoneAudioOutput#${this.instanceId}] Failed to load audio:`, loadError);
      throw loadError;
    }
  }

  /**
   * Force stop the current sound - always tries to stop regardless of state.
   * Includes fade out for smooth audio.
   */
  private async forceStopSound(): Promise<void> {
    if (!this.sound) {
      return;
    }

    const soundId = this.soundInstanceId;
    console.log(`[PhoneAudioOutput#${this.instanceId}] Force stopping sound#${soundId}...`);

    try {
      // Quick fade out (shorter than normal for force stop)
      const steps = 5;
      const stepDuration = 50; // 250ms total

      for (let i = steps; i >= 0; i--) {
        try {
          await this.sound.setVolumeAsync((this.currentVolume * i) / steps);
          if (i > 0) {
            await new Promise((resolve) => setTimeout(resolve, stepDuration));
          }
        } catch {
          break; // Sound may already be unloaded
        }
      }

      // Stop and pause
      try {
        await this.sound.stopAsync();
      } catch {
        // Ignore - may already be stopped
      }

      try {
        await this.sound.pauseAsync();
      } catch {
        // Ignore - may already be paused
      }

      // Reset position for next play
      try {
        await this.sound.setPositionAsync(0);
      } catch {
        // Ignore
      }

      // Restore volume for next play
      try {
        await this.sound.setVolumeAsync(this.currentVolume);
      } catch {
        // Ignore
      }

      console.log(`[PhoneAudioOutput#${this.instanceId}] Sound#${soundId} force stopped`);
    } catch (error) {
      console.error(`[PhoneAudioOutput#${this.instanceId}] Error during force stop:`, error);
    }
  }

  /**
   * Force unload the current sound and null out references.
   */
  private async forceUnloadSound(): Promise<void> {
    if (!this.sound) {
      return;
    }

    const soundId = this.soundInstanceId;
    console.log(`[PhoneAudioOutput#${this.instanceId}] Unloading sound#${soundId}...`);

    try {
      await this.sound.unloadAsync();
    } catch (error) {
      console.error(`[PhoneAudioOutput#${this.instanceId}] Error unloading sound#${soundId}:`, error);
    }

    this.sound = null;
    this.isInitialized = false;
    console.log(`[PhoneAudioOutput#${this.instanceId}] 🗑️ Sound#${soundId} unloaded`);
  }

  /**
   * Create a playback status handler bound to a specific sound instance.
   * Includes a kill-switch for ghost audio: if we're disposed or idle but audio is playing,
   * force stop it (debounced to prevent loops).
   */
  private createPlaybackStatusHandler(soundId: number) {
    return (status: AVPlaybackStatus): void => {
      // Only process if this is still the current sound
      if (soundId !== this.soundInstanceId) {
        return;
      }

      if (!status.isLoaded) {
        if (status.error) {
          console.error(`[PhoneAudioOutput#${this.instanceId}] Sound#${soundId} error:`, status.error);
        }
        return;
      }

      // KILL-SWITCH: If disposed, idle, or stopping but audio is playing, force kill it
      const shouldBeStopped = this.isDisposed || this.state === 'idle' || this.state === 'stopping';
      const isGhostAudio = status.isPlaying && shouldBeStopped;

      if (isGhostAudio && !this.isKillingStaleSound) {
        console.warn(
          `[PhoneAudioOutput#${this.instanceId}] 🚨 KILL-SWITCH: Ghost audio detected! ` +
          `state=${this.state}, isDisposed=${this.isDisposed}, status.isPlaying=${status.isPlaying}`
        );
        this.isKillingStaleSound = true;

        // Fire-and-forget force stop
        this.forceStopSound()
          .catch((err) => {
            console.error(`[PhoneAudioOutput#${this.instanceId}] Kill-switch error:`, err);
          })
          .finally(() => {
            // Reset debounce after a short delay to allow re-trigger if needed
            setTimeout(() => {
              this.isKillingStaleSound = false;
            }, 500);
          });
      }
    };
  }

  private setState(state: EntrainmentState): void {
    if (this.state !== state) {
      const oldState = this.state;
      this.state = state;
      console.log(`[PhoneAudioOutput#${this.instanceId}] State: ${oldState} → ${state}`);

      this.stateCallbacks.forEach((callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error(`[PhoneAudioOutput#${this.instanceId}] State callback error:`, error);
        }
      });
    }
  }
}
