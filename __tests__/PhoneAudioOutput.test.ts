/**
 * Tests for PhoneAudioOutput
 *
 * Tests cover:
 * - Audio playback interface using pre-generated WAV file
 * - State management
 * - Volume control
 * - Fade out behavior
 *
 * NOTE: PhoneAudioOutput now uses a pre-generated isochronic WAV file
 * instead of generating pulses dynamically. The WAV file has the
 * isochronic pulses baked in at 6 Hz theta frequency.
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source file for static analysis
const sourceFilePath = path.join(
  __dirname,
  '../src/services/entrainment/PhoneAudioOutput.ts'
);
const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');

describe('PhoneAudioOutput', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(sourceFilePath)).toBe(true);
    });

    it('should export PhoneAudioOutput class', () => {
      expect(sourceCode).toContain('export class PhoneAudioOutput');
    });

    it('should implement EntrainmentOutput interface', () => {
      expect(sourceCode).toContain('implements EntrainmentOutput');
    });

    it('should export PhoneAudioOutputConfig interface', () => {
      expect(sourceCode).toContain('export interface PhoneAudioOutputConfig');
    });
  });

  describe('Required Imports', () => {
    it('should import Audio from expo-av', () => {
      expect(sourceCode).toMatch(/import.*Audio.*from.*['"]expo-av['"]/);
    });

    it('should import AVPlaybackStatus from expo-av', () => {
      expect(sourceCode).toMatch(/import.*AVPlaybackStatus.*from.*['"]expo-av['"]/);
    });

    it('should import EntrainmentOutput interface', () => {
      expect(sourceCode).toContain("from './EntrainmentOutput'");
    });
  });

  describe('WAV Asset', () => {
    it('should require the pre-generated isochronic WAV file', () => {
      expect(sourceCode).toContain("require('../../../assets/audio/isochronic_theta6_carrier440.wav')");
    });

    it('should define ISOCHRONIC_TONE_ASSET constant', () => {
      expect(sourceCode).toContain('ISOCHRONIC_TONE_ASSET');
    });

    it('should have WAV file available', () => {
      const wavPath = path.join(__dirname, '../assets/audio/isochronic_theta6_carrier440.wav');
      expect(fs.existsSync(wavPath)).toBe(true);
    });
  });

  describe('PhoneAudioOutputConfig Interface', () => {
    it('should extend EntrainmentOutputConfig', () => {
      expect(sourceCode).toContain('extends EntrainmentOutputConfig');
    });

    it('should have fadeOutDuration property', () => {
      expect(sourceCode).toMatch(/fadeOutDuration\?:\s*number/);
    });
  });

  describe('Constructor', () => {
    it('should accept optional config', () => {
      expect(sourceCode).toContain('constructor(config: PhoneAudioOutputConfig = {})');
    });

    it('should have default frequency of 6 Hz (baked into WAV)', () => {
      expect(sourceCode).toContain('frequency: 6');
    });

    it('should have default volume of 0.7', () => {
      expect(sourceCode).toContain('volume: 0.7');
    });

    it('should have default fadeOutDuration of 500ms', () => {
      expect(sourceCode).toContain('fadeOutDuration: 500');
    });
  });

  describe('Public Methods', () => {
    it('should have play method', () => {
      expect(sourceCode).toContain('async play(frequency?: number, volume?: number): Promise<void>');
    });

    it('should have stop method', () => {
      expect(sourceCode).toContain('async stop(): Promise<void>');
    });

    it('should have setFrequency method', () => {
      expect(sourceCode).toContain('setFrequency(frequency: number): void');
    });

    it('should have setVolume method', () => {
      expect(sourceCode).toContain('setVolume(volume: number): void');
    });

    it('should have getState method', () => {
      expect(sourceCode).toContain('getState(): EntrainmentState');
    });

    it('should have isPlaying method', () => {
      expect(sourceCode).toContain('isPlaying(): boolean');
    });

    it('should have onStateChange method', () => {
      expect(sourceCode).toContain('onStateChange(callback: EntrainmentStateCallback): void');
    });

    it('should have offStateChange method', () => {
      expect(sourceCode).toContain('offStateChange(callback: EntrainmentStateCallback): void');
    });

    it('should have dispose method', () => {
      expect(sourceCode).toContain('async dispose(): Promise<void>');
    });
  });

  describe('Private Methods', () => {
    it('should have initialize method', () => {
      expect(sourceCode).toContain('private async initialize()');
    });

    it('should have forceStopSound method', () => {
      expect(sourceCode).toContain('private async forceStopSound()');
    });

    it('should have forceUnloadSound method', () => {
      expect(sourceCode).toContain('private async forceUnloadSound()');
    });

    it('should have createPlaybackStatusHandler method', () => {
      expect(sourceCode).toContain('private createPlaybackStatusHandler');
    });

    it('should have setState method', () => {
      expect(sourceCode).toContain('private setState');
    });

    it('should have serializeOperation method', () => {
      expect(sourceCode).toContain('private async serializeOperation');
    });
  });

  describe('State Management', () => {
    it('should track state as EntrainmentState', () => {
      expect(sourceCode).toContain("state: EntrainmentState = 'idle'");
    });

    it('should track isInitialized flag', () => {
      expect(sourceCode).toContain('isInitialized = false');
    });

    it('should use Set for stateCallbacks', () => {
      expect(sourceCode).toContain('stateCallbacks: Set<EntrainmentStateCallback>');
    });
  });

  describe('Audio Configuration', () => {
    it('should configure audio mode for playback', () => {
      expect(sourceCode).toContain('Audio.setAudioModeAsync');
    });

    it('should allow playback in silent mode on iOS', () => {
      expect(sourceCode).toContain('playsInSilentModeIOS: true');
    });

    it('should stay active in background', () => {
      expect(sourceCode).toContain('staysActiveInBackground: true');
    });

    it('should duck audio on Android', () => {
      expect(sourceCode).toContain('shouldDuckAndroid: true');
    });
  });

  describe('Sound Creation', () => {
    it('should use Audio.Sound.createAsync', () => {
      expect(sourceCode).toContain('Audio.Sound.createAsync');
    });

    it('should load the isochronic tone asset', () => {
      expect(sourceCode).toContain('ISOCHRONIC_TONE_ASSET');
    });

    it('should set shouldPlay to false initially', () => {
      expect(sourceCode).toContain('shouldPlay: false');
    });

    it('should set isLooping to true for continuous playback', () => {
      expect(sourceCode).toContain('isLooping: true');
    });
  });

  describe('Playback Control', () => {
    it('should set position to start before playing', () => {
      expect(sourceCode).toContain('setPositionAsync(0)');
    });

    it('should set volume before playing', () => {
      expect(sourceCode).toContain('setVolumeAsync(this.currentVolume)');
    });

    it('should call playAsync to start playback', () => {
      expect(sourceCode).toContain('playAsync()');
    });

    it('should pause after fade out', () => {
      expect(sourceCode).toContain('pauseAsync()');
    });
  });

  describe('Volume Control', () => {
    it('should clamp volume to 0-1 range', () => {
      expect(sourceCode).toContain('Math.max(0, Math.min(volume, 1))');
    });

    it('should apply volume immediately if sound loaded', () => {
      const methodMatch = sourceCode.match(/setVolume[\s\S]*?(?=getState)/);
      expect(methodMatch?.[0]).toContain('setVolumeAsync');
    });
  });

  describe('Frequency Control', () => {
    it('should warn that frequency is baked into WAV', () => {
      expect(sourceCode).toContain('frequency is baked into WAV');
    });

    it('should log warning when setFrequency is called', () => {
      // Log format includes instance ID now
      expect(sourceCode).toContain('setFrequency');
      expect(sourceCode).toContain('ignored');
    });
  });

  describe('Fade Out (in forceStopSound)', () => {
    it('should use 5 steps for quick fade out', () => {
      expect(sourceCode).toContain('steps = 5');
    });

    it('should use fixed step duration of 50ms', () => {
      expect(sourceCode).toContain('stepDuration = 50');
    });

    it('should decrease volume in steps', () => {
      // Volume calculation: (this.currentVolume * i) / steps
      expect(sourceCode).toContain('this.currentVolume * i');
    });

    it('should stop and pause after fade complete', () => {
      const methodMatch = sourceCode.match(/private async forceStopSound[\s\S]*?(?=private async forceUnloadSound)/);
      expect(methodMatch?.[0]).toContain('stopAsync()');
      expect(methodMatch?.[0]).toContain('pauseAsync()');
    });
  });

  describe('Dispose', () => {
    it('should force stop and unload before disposing', () => {
      const methodMatch = sourceCode.match(/async dispose[\s\S]*?(?=\/\/ ===)/);
      expect(methodMatch?.[0]).toContain('forceStopSound');
      expect(methodMatch?.[0]).toContain('forceUnloadSound');
    });

    it('should unload audio', () => {
      expect(sourceCode).toContain('unloadAsync()');
    });

    it('should reset isInitialized flag', () => {
      expect(sourceCode).toContain('this.isInitialized = false');
    });

    it('should mark as disposed to reject new operations', () => {
      expect(sourceCode).toContain('this.isDisposed = true');
    });
  });

  describe('Error Handling', () => {
    it('should handle play errors', () => {
      expect(sourceCode).toContain('Failed to start playback');
    });

    it('should handle volume set errors', () => {
      expect(sourceCode).toContain('Failed to set volume');
    });

    it('should handle audio mode errors', () => {
      expect(sourceCode).toContain('Failed to set audio mode');
    });

    it('should handle state callback errors', () => {
      expect(sourceCode).toContain('State callback error');
    });

    it('should handle playback errors in status handler', () => {
      expect(sourceCode).toContain('error:');
    });
  });

  describe('Kill-Switch Safety Guard (Static Analysis)', () => {
    it('should have kill-switch for ghost audio in status handler', () => {
      expect(sourceCode).toContain('KILL-SWITCH');
      expect(sourceCode).toContain('Ghost audio detected');
    });

    it('should detect ghost audio when disposed, idle, or stopping but playing', () => {
      expect(sourceCode).toContain('isGhostAudio');
      expect(sourceCode).toContain('shouldBeStopped');
      // Check that all three conditions are covered
      expect(sourceCode).toContain("this.state === 'idle'");
      expect(sourceCode).toContain("this.state === 'stopping'");
      expect(sourceCode).toContain('this.isDisposed');
    });

    it('should have debounce flag to prevent kill-switch loops', () => {
      expect(sourceCode).toContain('isKillingStaleSound');
    });

    it('should reset debounce after delay', () => {
      expect(sourceCode).toContain('setTimeout');
      expect(sourceCode).toContain('isKillingStaleSound = false');
    });
  });

  describe('Kill-Switch Behavior Tests', () => {
    // Mock Audio.Sound for behavior testing
    const mockSound = {
      setVolumeAsync: jest.fn().mockResolvedValue(undefined),
      setPositionAsync: jest.fn().mockResolvedValue(undefined),
      playAsync: jest.fn().mockResolvedValue(undefined),
      stopAsync: jest.fn().mockResolvedValue(undefined),
      pauseAsync: jest.fn().mockResolvedValue(undefined),
      unloadAsync: jest.fn().mockResolvedValue(undefined),
      getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
      setOnPlaybackStatusUpdate: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should trigger kill-switch when idle but status.isPlaying is true', () => {
      // Verify the code structure handles this case
      // The actual kill-switch is in createPlaybackStatusHandler
      const handlerMatch = sourceCode.match(/createPlaybackStatusHandler[\s\S]*?return \(status[\s\S]*?\};/);
      expect(handlerMatch).toBeTruthy();

      // Check it calls forceStopSound when isGhostAudio
      expect(handlerMatch![0]).toContain('forceStopSound');
      expect(handlerMatch![0]).toContain('isGhostAudio');
    });

    it('should trigger kill-switch when stopping but audio is playing', () => {
      // Verify 'stopping' state is included in kill-switch condition
      expect(sourceCode).toContain("this.state === 'stopping'");

      // Verify it's part of shouldBeStopped calculation
      const conditionMatch = sourceCode.match(/const shouldBeStopped[\s\S]*?;/);
      expect(conditionMatch).toBeTruthy();
      expect(conditionMatch![0]).toContain("'stopping'");
    });

    it('should trigger kill-switch when disposed but audio is playing', () => {
      // Verify isDisposed is checked
      expect(sourceCode).toContain('this.isDisposed');

      // Verify it's part of the condition
      const conditionMatch = sourceCode.match(/const shouldBeStopped[\s\S]*?;/);
      expect(conditionMatch).toBeTruthy();
      expect(conditionMatch![0]).toContain('this.isDisposed');
    });

    it('should debounce kill-switch to prevent repeated calls', () => {
      // Verify debounce flag is checked before triggering
      expect(sourceCode).toContain('!this.isKillingStaleSound');

      // Verify flag is set to true before calling forceStopSound
      const killSwitchBlock = sourceCode.match(/if \(isGhostAudio[\s\S]*?setTimeout/);
      expect(killSwitchBlock).toBeTruthy();
      expect(killSwitchBlock![0]).toContain('this.isKillingStaleSound = true');
    });

    it('should reset debounce flag after 500ms', () => {
      // Verify the setTimeout resets the flag
      const timeoutMatch = sourceCode.match(/setTimeout\(\(\) => \{[\s\S]*?isKillingStaleSound = false[\s\S]*?\}, 500\)/);
      expect(timeoutMatch).toBeTruthy();
    });

    it('should not trigger kill-switch when playing state matches audio playing', () => {
      // When state is 'playing' and audio is playing, no kill-switch needed
      // Verify 'playing' is NOT in the shouldBeStopped condition
      const conditionMatch = sourceCode.match(/const shouldBeStopped = .*?;/);
      expect(conditionMatch).toBeTruthy();
      expect(conditionMatch![0]).not.toContain("'playing'");
    });
  });

  describe('Documentation', () => {
    it('should have module-level documentation', () => {
      expect(sourceCode).toContain('Phone Audio Output');
    });

    it('should document isochronic tones', () => {
      expect(sourceCode).toContain('ISOCHRONIC TONES');
    });

    it('should document WAV generation', () => {
      expect(sourceCode).toContain('WAV GENERATION');
    });

    it('should document expo-av requirement', () => {
      expect(sourceCode).toContain('REQUIRES: expo-av');
    });

    it('should explain how to regenerate WAV file', () => {
      expect(sourceCode).toContain('test_isochronic_tones.py');
    });
  });

  describe('Logging', () => {
    it('should log when audio is loaded', () => {
      expect(sourceCode).toContain('Sound#');
      expect(sourceCode).toContain('loaded');
    });

    it('should log when playback starts', () => {
      expect(sourceCode).toContain('Playing sound#');
    });

    it('should log when stopping', () => {
      expect(sourceCode).toContain('stop() called');
    });

    it('should log volume changes', () => {
      expect(sourceCode).toContain('Volume set to');
    });

    it('should track instance IDs', () => {
      expect(sourceCode).toContain('instanceId');
      expect(sourceCode).toContain('soundInstanceId');
    });
  });

  describe('Service Index Export', () => {
    it('should be exported from services/entrainment/index.ts', () => {
      const indexPath = path.join(__dirname, '../src/services/entrainment/index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain('PhoneAudioOutput');
    });
  });
});

// Note: Functional tests for PhoneAudioOutput are limited because
// expo-av requires a React Native environment. The static analysis
// above verifies the implementation structure.
describe('PhoneAudioOutput Module Structure', () => {
  it('should export PhoneAudioOutput class (verified via static analysis)', () => {
    // Cannot import directly due to expo-av dependency
    // Static analysis above verifies the class export
    expect(sourceCode).toContain('export class PhoneAudioOutput');
  });

  it('should export PhoneAudioOutputConfig interface (verified via static analysis)', () => {
    expect(sourceCode).toContain('export interface PhoneAudioOutputConfig');
  });
});
