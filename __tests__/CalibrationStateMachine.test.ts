/**
 * Comprehensive tests for CalibrationStateMachine
 *
 * Tests cover:
 * - File structure and exports
 * - Type definitions
 * - State transitions
 * - Valid and invalid transitions
 * - Timer functionality
 * - Signal quality tracking
 * - Event listeners
 * - Helper functions
 * - Edge cases
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source file for static analysis
const sourceFilePath = path.join(
  __dirname,
  '../src/services/CalibrationStateMachine.ts'
);
const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');

// Import the module for functional tests
import {
  CalibrationStateMachine,
  createCalibrationStateMachine,
  isValidCalibrationTransition,
  getNextCalibrationState,
  getAvailableCalibrationEvents,
  canStartCalibration,
  canPauseCalibration,
  canResumeCalibration,
  canCancelCalibration,
  canAdvanceCalibration,
  isCalibrationActive,
  isCalibrationRecording,
  isCalibrationPaused,
  isCalibrationComplete,
  isCalibrationFailed,
  isCalibrationCountdown,
  isCalibrationProcessing,
  isSignalQualitySufficient,
  calculateCleanDataPercentage,
  calculateAverageSignalQuality,
  meetsMinimumCalibrationRequirements,
  formatCalibrationTime,
  getCalibrationPhaseLabel,
  getCalibrationStepNumber,
  getTotalCalibrationSteps,
  DEFAULT_CALIBRATION_CONFIG,
  CalibrationConfig,
  CalibrationSignalSample,
} from '../src/services/CalibrationStateMachine';

describe('CalibrationStateMachine', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(sourceFilePath)).toBe(true);
    });

    it('should export CalibrationStateMachine class', () => {
      expect(sourceCode).toContain('export class CalibrationStateMachine');
    });

    it('should export createCalibrationStateMachine function', () => {
      expect(sourceCode).toContain(
        'export const createCalibrationStateMachine'
      );
    });

    it('should have default export', () => {
      expect(sourceCode).toContain('export default CalibrationStateMachine');
    });

    it('should have module documentation comment', () => {
      expect(sourceCode).toContain(
        'CalibrationStateMachine - Manages the calibration flow lifecycle'
      );
    });
  });

  describe('Type Exports', () => {
    it('should export ExtendedCalibrationState type', () => {
      expect(sourceCode).toContain('export type ExtendedCalibrationState');
    });

    it('should export CalibrationEvent type', () => {
      expect(sourceCode).toContain('export type CalibrationEvent');
    });

    it('should export CalibrationTransitionResult interface', () => {
      expect(sourceCode).toContain(
        'export interface CalibrationTransitionResult'
      );
    });

    it('should export CalibrationTimerState interface', () => {
      expect(sourceCode).toContain('export interface CalibrationTimerState');
    });

    it('should export CalibrationSignalSample interface', () => {
      expect(sourceCode).toContain('export interface CalibrationSignalSample');
    });

    it('should export CalibrationData interface', () => {
      expect(sourceCode).toContain('export interface CalibrationData');
    });

    it('should export CalibrationResult interface', () => {
      expect(sourceCode).toContain('export interface CalibrationResult');
    });

    it('should export CalibrationConfig interface', () => {
      expect(sourceCode).toContain('export interface CalibrationConfig');
    });

    it('should export CalibrationStateListener type', () => {
      expect(sourceCode).toContain('export type CalibrationStateListener');
    });

    it('should export CalibrationTimerListener type', () => {
      expect(sourceCode).toContain('export type CalibrationTimerListener');
    });

    it('should export CalibrationCompletionListener type', () => {
      expect(sourceCode).toContain('export type CalibrationCompletionListener');
    });

    it('should export CalibrationSignalListener type', () => {
      expect(sourceCode).toContain('export type CalibrationSignalListener');
    });
  });

  describe('Required Imports', () => {
    it('should import CalibrationState from types', () => {
      expect(sourceCode).toMatch(
        /import.*CalibrationState.*from.*['"]\.\.\/types['"]/
      );
    });

    it('should import BaselineProfile from types', () => {
      expect(sourceCode).toMatch(
        /import.*BaselineProfile.*from.*['"]\.\.\/types['"]/
      );
    });

    it('should import SignalQuality from types', () => {
      expect(sourceCode).toMatch(
        /import.*SignalQuality.*from.*['"]\.\.\/types['"]/
      );
    });
  });

  describe('ExtendedCalibrationState Type Values', () => {
    it('should include idle state', () => {
      expect(sourceCode).toMatch(
        /ExtendedCalibrationState[\s\S]*?['"]idle['"]/
      );
    });

    it('should include instructions state', () => {
      expect(sourceCode).toMatch(
        /CalibrationState[\s\S]*?['"]instructions['"]/
      );
    });

    it('should include countdown state', () => {
      expect(sourceCode).toMatch(/CalibrationState[\s\S]*?['"]countdown['"]/);
    });

    it('should include recording state', () => {
      expect(sourceCode).toMatch(/CalibrationState[\s\S]*?['"]recording['"]/);
    });

    it('should include processing state', () => {
      expect(sourceCode).toMatch(/CalibrationState[\s\S]*?['"]processing['"]/);
    });

    it('should include complete state', () => {
      expect(sourceCode).toMatch(/CalibrationState[\s\S]*?['"]complete['"]/);
    });

    it('should include paused state', () => {
      expect(sourceCode).toMatch(
        /ExtendedCalibrationState[\s\S]*?['"]paused['"]/
      );
    });

    it('should include failed state', () => {
      expect(sourceCode).toMatch(
        /ExtendedCalibrationState[\s\S]*?['"]failed['"]/
      );
    });
  });

  describe('CalibrationEvent Type Values', () => {
    it('should include START event', () => {
      expect(sourceCode).toContain("'START'");
    });

    it('should include NEXT event', () => {
      expect(sourceCode).toContain("'NEXT'");
    });

    it('should include PAUSE event', () => {
      expect(sourceCode).toContain("'PAUSE'");
    });

    it('should include RESUME event', () => {
      expect(sourceCode).toContain("'RESUME'");
    });

    it('should include COMPLETE event', () => {
      expect(sourceCode).toContain("'COMPLETE'");
    });

    it('should include FAIL event', () => {
      expect(sourceCode).toContain("'FAIL'");
    });

    it('should include CANCEL event', () => {
      expect(sourceCode).toContain("'CANCEL'");
    });

    it('should include RESET event', () => {
      expect(sourceCode).toContain("'RESET'");
    });

    it('should include RETRY event', () => {
      expect(sourceCode).toContain("'RETRY'");
    });

    it('should include TICK event', () => {
      expect(sourceCode).toContain("'TICK'");
    });
  });

  describe('CalibrationTransitionResult Interface', () => {
    it('should have success property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTransitionResult[\s\S]*?success:\s*boolean/
      );
    });

    it('should have previousState property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTransitionResult[\s\S]*?previousState:\s*ExtendedCalibrationState/
      );
    });

    it('should have newState property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTransitionResult[\s\S]*?newState:\s*ExtendedCalibrationState/
      );
    });

    it('should have event property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTransitionResult[\s\S]*?event:\s*CalibrationEvent/
      );
    });

    it('should have optional error property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTransitionResult[\s\S]*?error\?:\s*string/
      );
    });
  });

  describe('CalibrationTimerState Interface', () => {
    it('should have elapsedSeconds property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?elapsedSeconds:\s*number/
      );
    });

    it('should have remainingSeconds property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?remainingSeconds:\s*number\s*\|\s*null/
      );
    });

    it('should have isPhaseComplete property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?isPhaseComplete:\s*boolean/
      );
    });

    it('should have startTimestamp property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?startTimestamp:\s*number\s*\|\s*null/
      );
    });

    it('should have pausedAt property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?pausedAt:\s*number\s*\|\s*null/
      );
    });

    it('should have totalPausedDuration property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?totalPausedDuration:\s*number/
      );
    });

    it('should have countdownSeconds property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?countdownSeconds:\s*number/
      );
    });

    it('should have recordingDurationSeconds property', () => {
      expect(sourceCode).toMatch(
        /CalibrationTimerState[\s\S]*?recordingDurationSeconds:\s*number/
      );
    });
  });

  describe('CalibrationSignalSample Interface', () => {
    it('should have timestamp property', () => {
      expect(sourceCode).toMatch(
        /CalibrationSignalSample[\s\S]*?timestamp:\s*number/
      );
    });

    it('should have score property', () => {
      expect(sourceCode).toMatch(
        /CalibrationSignalSample[\s\S]*?score:\s*number/
      );
    });

    it('should have isClean property', () => {
      expect(sourceCode).toMatch(
        /CalibrationSignalSample[\s\S]*?isClean:\s*boolean/
      );
    });

    it('should have artifactPercentage property', () => {
      expect(sourceCode).toMatch(
        /CalibrationSignalSample[\s\S]*?artifactPercentage:\s*number/
      );
    });
  });

  describe('CalibrationData Interface', () => {
    it('should have signalSamples property', () => {
      expect(sourceCode).toMatch(
        /CalibrationData[\s\S]*?signalSamples:\s*CalibrationSignalSample\[\]/
      );
    });

    it('should have cleanDataPercentage property', () => {
      expect(sourceCode).toMatch(
        /CalibrationData[\s\S]*?cleanDataPercentage:\s*number/
      );
    });

    it('should have averageSignalQuality property', () => {
      expect(sourceCode).toMatch(
        /CalibrationData[\s\S]*?averageSignalQuality:\s*number/
      );
    });

    it('should have autoPauseCount property', () => {
      expect(sourceCode).toMatch(
        /CalibrationData[\s\S]*?autoPauseCount:\s*number/
      );
    });

    it('should have recordingDuration property', () => {
      expect(sourceCode).toMatch(
        /CalibrationData[\s\S]*?recordingDuration:\s*number/
      );
    });

    it('should have meetsMinimumRequirements property', () => {
      expect(sourceCode).toMatch(
        /CalibrationData[\s\S]*?meetsMinimumRequirements:\s*boolean/
      );
    });
  });

  describe('CalibrationResult Interface', () => {
    it('should have success property', () => {
      expect(sourceCode).toMatch(/CalibrationResult[\s\S]*?success:\s*boolean/);
    });

    it('should have data property', () => {
      expect(sourceCode).toMatch(
        /CalibrationResult[\s\S]*?data:\s*CalibrationData/
      );
    });

    it('should have baseline property', () => {
      expect(sourceCode).toMatch(
        /CalibrationResult[\s\S]*?baseline:\s*BaselineProfile\s*\|\s*null/
      );
    });

    it('should have qualityScore property', () => {
      expect(sourceCode).toMatch(
        /CalibrationResult[\s\S]*?qualityScore:\s*number/
      );
    });

    it('should have optional errorMessage property', () => {
      expect(sourceCode).toMatch(
        /CalibrationResult[\s\S]*?errorMessage\?:\s*string/
      );
    });
  });

  describe('CalibrationConfig Interface', () => {
    it('should have countdownDuration property', () => {
      expect(sourceCode).toMatch(
        /CalibrationConfig[\s\S]*?countdownDuration:\s*number/
      );
    });

    it('should have recordingDuration property', () => {
      expect(sourceCode).toMatch(
        /CalibrationConfig[\s\S]*?recordingDuration:\s*number/
      );
    });

    it('should have minRecordingDuration property', () => {
      expect(sourceCode).toMatch(
        /CalibrationConfig[\s\S]*?minRecordingDuration:\s*number/
      );
    });

    it('should have minCleanDataPercentage property', () => {
      expect(sourceCode).toMatch(
        /CalibrationConfig[\s\S]*?minCleanDataPercentage:\s*number/
      );
    });

    it('should have criticalSignalThreshold property', () => {
      expect(sourceCode).toMatch(
        /CalibrationConfig[\s\S]*?criticalSignalThreshold:\s*number/
      );
    });

    it('should have autoPauseDelaySeconds property', () => {
      expect(sourceCode).toMatch(
        /CalibrationConfig[\s\S]*?autoPauseDelaySeconds:\s*number/
      );
    });
  });

  describe('DEFAULT_CALIBRATION_CONFIG', () => {
    it('should export DEFAULT_CALIBRATION_CONFIG constant', () => {
      expect(sourceCode).toContain('export const DEFAULT_CALIBRATION_CONFIG');
    });

    it('should have countdownDuration of 30', () => {
      expect(DEFAULT_CALIBRATION_CONFIG.countdownDuration).toBe(30);
    });

    it('should have recordingDuration of 300', () => {
      expect(DEFAULT_CALIBRATION_CONFIG.recordingDuration).toBe(300);
    });

    it('should have minRecordingDuration of 180', () => {
      expect(DEFAULT_CALIBRATION_CONFIG.minRecordingDuration).toBe(180);
    });

    it('should have minCleanDataPercentage of 50', () => {
      expect(DEFAULT_CALIBRATION_CONFIG.minCleanDataPercentage).toBe(50);
    });

    it('should have criticalSignalThreshold of 20', () => {
      expect(DEFAULT_CALIBRATION_CONFIG.criticalSignalThreshold).toBe(20);
    });

    it('should have autoPauseDelaySeconds of 10', () => {
      expect(DEFAULT_CALIBRATION_CONFIG.autoPauseDelaySeconds).toBe(10);
    });
  });

  describe('Valid State Transitions Map', () => {
    it('should define VALID_TRANSITIONS constant', () => {
      expect(sourceCode).toContain('const VALID_TRANSITIONS');
    });

    it('should allow START from idle', () => {
      expect(sourceCode).toMatch(
        /idle:\s*\{[\s\S]*?START:\s*['"]instructions['"]/
      );
    });

    it('should allow NEXT from instructions', () => {
      expect(sourceCode).toMatch(
        /instructions:\s*\{[\s\S]*?NEXT:\s*['"]countdown['"]/
      );
    });

    it('should allow CANCEL from instructions', () => {
      expect(sourceCode).toMatch(
        /instructions:\s*\{[\s\S]*?CANCEL:\s*['"]idle['"]/
      );
    });

    it('should allow NEXT from countdown', () => {
      expect(sourceCode).toMatch(
        /countdown:\s*\{[\s\S]*?NEXT:\s*['"]recording['"]/
      );
    });

    it('should allow COMPLETE from recording', () => {
      expect(sourceCode).toMatch(
        /recording:\s*\{[\s\S]*?COMPLETE:\s*['"]processing['"]/
      );
    });

    it('should allow PAUSE from recording', () => {
      expect(sourceCode).toMatch(
        /recording:\s*\{[\s\S]*?PAUSE:\s*['"]paused['"]/
      );
    });

    it('should allow RESUME from paused', () => {
      expect(sourceCode).toMatch(
        /paused:\s*\{[\s\S]*?RESUME:\s*['"]recording['"]/
      );
    });

    it('should allow COMPLETE from processing', () => {
      expect(sourceCode).toMatch(
        /processing:\s*\{[\s\S]*?COMPLETE:\s*['"]complete['"]/
      );
    });

    it('should allow FAIL from processing', () => {
      expect(sourceCode).toMatch(
        /processing:\s*\{[\s\S]*?FAIL:\s*['"]failed['"]/
      );
    });

    it('should allow RESET from complete', () => {
      expect(sourceCode).toMatch(/complete:\s*\{[\s\S]*?RESET:\s*['"]idle['"]/);
    });

    it('should allow RETRY from failed', () => {
      expect(sourceCode).toMatch(
        /failed:\s*\{[\s\S]*?RETRY:\s*['"]instructions['"]/
      );
    });
  });

  describe('Helper Functions Export', () => {
    it('should export isValidCalibrationTransition function', () => {
      expect(sourceCode).toContain('export const isValidCalibrationTransition');
    });

    it('should export getNextCalibrationState function', () => {
      expect(sourceCode).toContain('export const getNextCalibrationState');
    });

    it('should export getAvailableCalibrationEvents function', () => {
      expect(sourceCode).toContain(
        'export const getAvailableCalibrationEvents'
      );
    });

    it('should export canStartCalibration function', () => {
      expect(sourceCode).toContain('export const canStartCalibration');
    });

    it('should export canPauseCalibration function', () => {
      expect(sourceCode).toContain('export const canPauseCalibration');
    });

    it('should export canResumeCalibration function', () => {
      expect(sourceCode).toContain('export const canResumeCalibration');
    });

    it('should export canCancelCalibration function', () => {
      expect(sourceCode).toContain('export const canCancelCalibration');
    });

    it('should export canAdvanceCalibration function', () => {
      expect(sourceCode).toContain('export const canAdvanceCalibration');
    });

    it('should export isCalibrationActive function', () => {
      expect(sourceCode).toContain('export const isCalibrationActive');
    });

    it('should export isCalibrationRecording function', () => {
      expect(sourceCode).toContain('export const isCalibrationRecording');
    });

    it('should export isCalibrationPaused function', () => {
      expect(sourceCode).toContain('export const isCalibrationPaused');
    });

    it('should export isCalibrationComplete function', () => {
      expect(sourceCode).toContain('export const isCalibrationComplete');
    });

    it('should export isCalibrationFailed function', () => {
      expect(sourceCode).toContain('export const isCalibrationFailed');
    });

    it('should export isCalibrationCountdown function', () => {
      expect(sourceCode).toContain('export const isCalibrationCountdown');
    });

    it('should export isCalibrationProcessing function', () => {
      expect(sourceCode).toContain('export const isCalibrationProcessing');
    });

    it('should export isSignalQualitySufficient function', () => {
      expect(sourceCode).toContain('export const isSignalQualitySufficient');
    });

    it('should export calculateCleanDataPercentage function', () => {
      expect(sourceCode).toContain('export const calculateCleanDataPercentage');
    });

    it('should export calculateAverageSignalQuality function', () => {
      expect(sourceCode).toContain(
        'export const calculateAverageSignalQuality'
      );
    });

    it('should export meetsMinimumCalibrationRequirements function', () => {
      expect(sourceCode).toContain(
        'export const meetsMinimumCalibrationRequirements'
      );
    });

    it('should export formatCalibrationTime function', () => {
      expect(sourceCode).toContain('export const formatCalibrationTime');
    });

    it('should export getCalibrationPhaseLabel function', () => {
      expect(sourceCode).toContain('export const getCalibrationPhaseLabel');
    });

    it('should export getCalibrationStepNumber function', () => {
      expect(sourceCode).toContain('export const getCalibrationStepNumber');
    });

    it('should export getTotalCalibrationSteps function', () => {
      expect(sourceCode).toContain('export const getTotalCalibrationSteps');
    });
  });

  describe('isValidCalibrationTransition Function', () => {
    it('should return true for valid transitions', () => {
      expect(isValidCalibrationTransition('idle', 'START')).toBe(true);
      expect(isValidCalibrationTransition('instructions', 'NEXT')).toBe(true);
      expect(isValidCalibrationTransition('countdown', 'NEXT')).toBe(true);
      expect(isValidCalibrationTransition('recording', 'PAUSE')).toBe(true);
      expect(isValidCalibrationTransition('paused', 'RESUME')).toBe(true);
      expect(isValidCalibrationTransition('processing', 'COMPLETE')).toBe(true);
      expect(isValidCalibrationTransition('complete', 'RESET')).toBe(true);
    });

    it('should return false for invalid transitions', () => {
      expect(isValidCalibrationTransition('idle', 'PAUSE')).toBe(false);
      expect(isValidCalibrationTransition('instructions', 'RESUME')).toBe(
        false
      );
      expect(isValidCalibrationTransition('countdown', 'PAUSE')).toBe(false);
      expect(isValidCalibrationTransition('recording', 'START')).toBe(false);
      expect(isValidCalibrationTransition('complete', 'START')).toBe(false);
    });
  });

  describe('getNextCalibrationState Function', () => {
    it('should return correct next state for valid transitions', () => {
      expect(getNextCalibrationState('idle', 'START')).toBe('instructions');
      expect(getNextCalibrationState('instructions', 'NEXT')).toBe('countdown');
      expect(getNextCalibrationState('countdown', 'NEXT')).toBe('recording');
      expect(getNextCalibrationState('recording', 'COMPLETE')).toBe(
        'processing'
      );
      expect(getNextCalibrationState('processing', 'COMPLETE')).toBe(
        'complete'
      );
    });

    it('should return null for invalid transitions', () => {
      expect(getNextCalibrationState('idle', 'PAUSE')).toBe(null);
      expect(getNextCalibrationState('complete', 'NEXT')).toBe(null);
    });
  });

  describe('getAvailableCalibrationEvents Function', () => {
    it('should return available events for idle state', () => {
      const events = getAvailableCalibrationEvents('idle');
      expect(events).toContain('START');
      expect(events.length).toBe(1);
    });

    it('should return available events for instructions state', () => {
      const events = getAvailableCalibrationEvents('instructions');
      expect(events).toContain('NEXT');
      expect(events).toContain('CANCEL');
    });

    it('should return available events for recording state', () => {
      const events = getAvailableCalibrationEvents('recording');
      expect(events).toContain('COMPLETE');
      expect(events).toContain('PAUSE');
      expect(events).toContain('TICK');
      expect(events).toContain('CANCEL');
    });

    it('should return available events for paused state', () => {
      const events = getAvailableCalibrationEvents('paused');
      expect(events).toContain('RESUME');
      expect(events).toContain('CANCEL');
    });
  });

  describe('canStartCalibration Function', () => {
    it('should return true for idle state', () => {
      expect(canStartCalibration('idle')).toBe(true);
    });

    it('should return false for non-idle states', () => {
      expect(canStartCalibration('instructions')).toBe(false);
      expect(canStartCalibration('recording')).toBe(false);
      expect(canStartCalibration('complete')).toBe(false);
    });
  });

  describe('canPauseCalibration Function', () => {
    it('should return true for recording state', () => {
      expect(canPauseCalibration('recording')).toBe(true);
    });

    it('should return false for non-recording states', () => {
      expect(canPauseCalibration('idle')).toBe(false);
      expect(canPauseCalibration('countdown')).toBe(false);
      expect(canPauseCalibration('paused')).toBe(false);
    });
  });

  describe('canResumeCalibration Function', () => {
    it('should return true for paused state', () => {
      expect(canResumeCalibration('paused')).toBe(true);
    });

    it('should return false for non-paused states', () => {
      expect(canResumeCalibration('idle')).toBe(false);
      expect(canResumeCalibration('recording')).toBe(false);
    });
  });

  describe('canCancelCalibration Function', () => {
    it('should return true for cancellable states', () => {
      expect(canCancelCalibration('instructions')).toBe(true);
      expect(canCancelCalibration('countdown')).toBe(true);
      expect(canCancelCalibration('recording')).toBe(true);
      expect(canCancelCalibration('paused')).toBe(true);
      expect(canCancelCalibration('failed')).toBe(true);
    });

    it('should return false for non-cancellable states', () => {
      expect(canCancelCalibration('idle')).toBe(false);
      expect(canCancelCalibration('processing')).toBe(false);
      expect(canCancelCalibration('complete')).toBe(false);
    });
  });

  describe('canAdvanceCalibration Function', () => {
    it('should return true for advanceable states', () => {
      expect(canAdvanceCalibration('instructions')).toBe(true);
      expect(canAdvanceCalibration('countdown')).toBe(true);
    });

    it('should return false for non-advanceable states', () => {
      expect(canAdvanceCalibration('idle')).toBe(false);
      expect(canAdvanceCalibration('recording')).toBe(false);
      expect(canAdvanceCalibration('complete')).toBe(false);
    });
  });

  describe('isCalibrationActive Function', () => {
    it('should return true for active states', () => {
      expect(isCalibrationActive('countdown')).toBe(true);
      expect(isCalibrationActive('recording')).toBe(true);
      expect(isCalibrationActive('paused')).toBe(true);
      expect(isCalibrationActive('processing')).toBe(true);
    });

    it('should return false for inactive states', () => {
      expect(isCalibrationActive('idle')).toBe(false);
      expect(isCalibrationActive('instructions')).toBe(false);
      expect(isCalibrationActive('complete')).toBe(false);
      expect(isCalibrationActive('failed')).toBe(false);
    });
  });

  describe('isCalibrationRecording Function', () => {
    it('should return true only for recording state', () => {
      expect(isCalibrationRecording('recording')).toBe(true);
    });

    it('should return false for other states', () => {
      expect(isCalibrationRecording('idle')).toBe(false);
      expect(isCalibrationRecording('paused')).toBe(false);
    });
  });

  describe('isCalibrationPaused Function', () => {
    it('should return true only for paused state', () => {
      expect(isCalibrationPaused('paused')).toBe(true);
    });

    it('should return false for other states', () => {
      expect(isCalibrationPaused('idle')).toBe(false);
      expect(isCalibrationPaused('recording')).toBe(false);
    });
  });

  describe('isCalibrationComplete Function', () => {
    it('should return true only for complete state', () => {
      expect(isCalibrationComplete('complete')).toBe(true);
    });

    it('should return false for other states', () => {
      expect(isCalibrationComplete('idle')).toBe(false);
      expect(isCalibrationComplete('failed')).toBe(false);
    });
  });

  describe('isCalibrationFailed Function', () => {
    it('should return true only for failed state', () => {
      expect(isCalibrationFailed('failed')).toBe(true);
    });

    it('should return false for other states', () => {
      expect(isCalibrationFailed('idle')).toBe(false);
      expect(isCalibrationFailed('complete')).toBe(false);
    });
  });

  describe('isCalibrationCountdown Function', () => {
    it('should return true only for countdown state', () => {
      expect(isCalibrationCountdown('countdown')).toBe(true);
    });

    it('should return false for other states', () => {
      expect(isCalibrationCountdown('idle')).toBe(false);
      expect(isCalibrationCountdown('recording')).toBe(false);
    });
  });

  describe('isCalibrationProcessing Function', () => {
    it('should return true only for processing state', () => {
      expect(isCalibrationProcessing('processing')).toBe(true);
    });

    it('should return false for other states', () => {
      expect(isCalibrationProcessing('idle')).toBe(false);
      expect(isCalibrationProcessing('complete')).toBe(false);
    });
  });

  describe('isSignalQualitySufficient Function', () => {
    it('should return true for sufficient signal quality', () => {
      expect(
        isSignalQualitySufficient({
          score: 50,
          artifact_percentage: 10,
          has_amplitude_artifact: false,
          has_gradient_artifact: false,
          has_frequency_artifact: false,
        })
      ).toBe(true);
    });

    it('should return false for insufficient signal quality', () => {
      expect(
        isSignalQualitySufficient({
          score: 15,
          artifact_percentage: 50,
          has_amplitude_artifact: true,
          has_gradient_artifact: false,
          has_frequency_artifact: false,
        })
      ).toBe(false);
    });

    it('should return false for null signal quality', () => {
      expect(isSignalQualitySufficient(null)).toBe(false);
    });

    it('should use custom threshold', () => {
      expect(
        isSignalQualitySufficient(
          {
            score: 30,
            artifact_percentage: 10,
            has_amplitude_artifact: false,
            has_gradient_artifact: false,
            has_frequency_artifact: false,
          },
          40
        )
      ).toBe(false);
    });
  });

  describe('calculateCleanDataPercentage Function', () => {
    it('should calculate correct percentage', () => {
      const samples: CalibrationSignalSample[] = [
        { timestamp: 1, score: 80, isClean: true, artifactPercentage: 10 },
        { timestamp: 2, score: 60, isClean: true, artifactPercentage: 20 },
        { timestamp: 3, score: 30, isClean: false, artifactPercentage: 50 },
        { timestamp: 4, score: 50, isClean: true, artifactPercentage: 15 },
      ];
      expect(calculateCleanDataPercentage(samples)).toBe(75);
    });

    it('should return 0 for empty array', () => {
      expect(calculateCleanDataPercentage([])).toBe(0);
    });

    it('should return 100 for all clean samples', () => {
      const samples: CalibrationSignalSample[] = [
        { timestamp: 1, score: 80, isClean: true, artifactPercentage: 10 },
        { timestamp: 2, score: 90, isClean: true, artifactPercentage: 5 },
      ];
      expect(calculateCleanDataPercentage(samples)).toBe(100);
    });

    it('should return 0 for no clean samples', () => {
      const samples: CalibrationSignalSample[] = [
        { timestamp: 1, score: 20, isClean: false, artifactPercentage: 60 },
        { timestamp: 2, score: 15, isClean: false, artifactPercentage: 70 },
      ];
      expect(calculateCleanDataPercentage(samples)).toBe(0);
    });
  });

  describe('calculateAverageSignalQuality Function', () => {
    it('should calculate correct average', () => {
      const samples: CalibrationSignalSample[] = [
        { timestamp: 1, score: 80, isClean: true, artifactPercentage: 10 },
        { timestamp: 2, score: 60, isClean: true, artifactPercentage: 20 },
        { timestamp: 3, score: 40, isClean: true, artifactPercentage: 30 },
      ];
      expect(calculateAverageSignalQuality(samples)).toBe(60);
    });

    it('should return 0 for empty array', () => {
      expect(calculateAverageSignalQuality([])).toBe(0);
    });
  });

  describe('meetsMinimumCalibrationRequirements Function', () => {
    it('should return true when requirements are met', () => {
      expect(meetsMinimumCalibrationRequirements(200, 60)).toBe(true);
    });

    it('should return false when duration is insufficient', () => {
      expect(meetsMinimumCalibrationRequirements(100, 60)).toBe(false);
    });

    it('should return false when clean data is insufficient', () => {
      expect(meetsMinimumCalibrationRequirements(200, 40)).toBe(false);
    });

    it('should use custom config', () => {
      const config: CalibrationConfig = {
        ...DEFAULT_CALIBRATION_CONFIG,
        minRecordingDuration: 100,
        minCleanDataPercentage: 30,
      };
      expect(meetsMinimumCalibrationRequirements(110, 35, config)).toBe(true);
    });
  });

  describe('formatCalibrationTime Function', () => {
    it('should format zero correctly', () => {
      expect(formatCalibrationTime(0)).toBe('00:00');
    });

    it('should format seconds correctly', () => {
      expect(formatCalibrationTime(45)).toBe('00:45');
    });

    it('should format minutes and seconds correctly', () => {
      expect(formatCalibrationTime(125)).toBe('02:05');
    });

    it('should handle negative values', () => {
      expect(formatCalibrationTime(-10)).toBe('00:00');
    });
  });

  describe('getCalibrationPhaseLabel Function', () => {
    it('should return correct labels for all states', () => {
      expect(getCalibrationPhaseLabel('idle')).toBe('Ready');
      expect(getCalibrationPhaseLabel('instructions')).toBe(
        'Setup Instructions'
      );
      expect(getCalibrationPhaseLabel('countdown')).toBe('Settle Period');
      expect(getCalibrationPhaseLabel('recording')).toBe('Recording Baseline');
      expect(getCalibrationPhaseLabel('paused')).toBe('Paused');
      expect(getCalibrationPhaseLabel('processing')).toBe('Processing Data');
      expect(getCalibrationPhaseLabel('complete')).toBe('Calibration Complete');
      expect(getCalibrationPhaseLabel('failed')).toBe('Calibration Failed');
    });
  });

  describe('getCalibrationStepNumber Function', () => {
    it('should return correct step numbers', () => {
      expect(getCalibrationStepNumber('idle')).toBe(0);
      expect(getCalibrationStepNumber('instructions')).toBe(1);
      expect(getCalibrationStepNumber('countdown')).toBe(2);
      expect(getCalibrationStepNumber('recording')).toBe(3);
      expect(getCalibrationStepNumber('paused')).toBe(3);
      expect(getCalibrationStepNumber('processing')).toBe(4);
      expect(getCalibrationStepNumber('complete')).toBe(5);
      expect(getCalibrationStepNumber('failed')).toBe(5);
    });
  });

  describe('getTotalCalibrationSteps Function', () => {
    it('should return 5', () => {
      expect(getTotalCalibrationSteps()).toBe(5);
    });
  });

  describe('CalibrationStateMachine Class Structure', () => {
    it('should have constructor', () => {
      expect(sourceCode).toContain('constructor(');
    });

    it('should have getState method', () => {
      expect(sourceCode).toContain('getState()');
    });

    it('should have getConfig method', () => {
      expect(sourceCode).toContain('getConfig()');
    });

    it('should have getTimerState method', () => {
      expect(sourceCode).toContain('getTimerState()');
    });

    it('should have getCalibrationData method', () => {
      expect(sourceCode).toContain('getCalibrationData()');
    });

    it('should have setConfig method', () => {
      expect(sourceCode).toContain('setConfig(');
    });

    it('should have addStateListener method', () => {
      expect(sourceCode).toContain('addStateListener(');
    });

    it('should have addTimerListener method', () => {
      expect(sourceCode).toContain('addTimerListener(');
    });

    it('should have addCompletionListener method', () => {
      expect(sourceCode).toContain('addCompletionListener(');
    });

    it('should have addSignalListener method', () => {
      expect(sourceCode).toContain('addSignalListener(');
    });

    it('should have recordSignalSample method', () => {
      expect(sourceCode).toContain('recordSignalSample(');
    });

    it('should have transition method', () => {
      expect(sourceCode).toContain('transition(');
    });

    it('should have start method', () => {
      expect(sourceCode).toContain('start()');
    });

    it('should have next method', () => {
      expect(sourceCode).toContain('next()');
    });

    it('should have pause method', () => {
      expect(sourceCode).toContain('pause()');
    });

    it('should have resume method', () => {
      expect(sourceCode).toContain('resume()');
    });

    it('should have complete method', () => {
      expect(sourceCode).toContain('complete()');
    });

    it('should have fail method', () => {
      expect(sourceCode).toContain('fail()');
    });

    it('should have cancel method', () => {
      expect(sourceCode).toContain('cancel()');
    });

    it('should have reset method', () => {
      expect(sourceCode).toContain('reset()');
    });

    it('should have retry method', () => {
      expect(sourceCode).toContain('retry()');
    });

    it('should have destroy method', () => {
      expect(sourceCode).toContain('destroy()');
    });
  });

  describe('CalibrationStateMachine Private Methods', () => {
    it('should have notifyStateListeners method', () => {
      expect(sourceCode).toContain('notifyStateListeners(');
    });

    it('should have notifyTimerListeners method', () => {
      expect(sourceCode).toContain('notifyTimerListeners(');
    });

    it('should have notifyCompletionListeners method', () => {
      expect(sourceCode).toContain('notifyCompletionListeners(');
    });

    it('should have handleTransitionSideEffects method', () => {
      expect(sourceCode).toContain('handleTransitionSideEffects(');
    });

    it('should have startCountdown method', () => {
      expect(sourceCode).toContain('startCountdown(');
    });

    it('should have startRecording method', () => {
      expect(sourceCode).toContain('startRecording(');
    });

    it('should have pauseRecording method', () => {
      expect(sourceCode).toContain('pauseRecording(');
    });

    it('should have resumeRecording method', () => {
      expect(sourceCode).toContain('resumeRecording(');
    });

    it('should have startTimer method', () => {
      expect(sourceCode).toContain('startTimer(');
    });

    it('should have stopTimer method', () => {
      expect(sourceCode).toContain('stopTimer(');
    });

    it('should have tick method', () => {
      expect(sourceCode).toContain('tick(');
    });

    it('should have tickCountdown method', () => {
      expect(sourceCode).toContain('tickCountdown(');
    });

    it('should have tickRecording method', () => {
      expect(sourceCode).toContain('tickRecording(');
    });

    it('should have resetTimerState method', () => {
      expect(sourceCode).toContain('resetTimerState(');
    });

    it('should have resetCalibrationData method', () => {
      expect(sourceCode).toContain('resetCalibrationData(');
    });

    it('should have updateCalibrationDataStats method', () => {
      expect(sourceCode).toContain('updateCalibrationDataStats(');
    });

    it('should have checkCriticalSignal method', () => {
      expect(sourceCode).toContain('checkCriticalSignal(');
    });

    it('should have autoPause method', () => {
      expect(sourceCode).toContain('autoPause(');
    });

    it('should have generateMockBaseline method', () => {
      expect(sourceCode).toContain('generateMockBaseline(');
    });
  });

  describe('CalibrationStateMachine Instance Tests', () => {
    let machine: CalibrationStateMachine;

    beforeEach(() => {
      machine = createCalibrationStateMachine();
    });

    afterEach(() => {
      machine.destroy();
    });

    it('should create instance with default config', () => {
      expect(machine.getState()).toBe('idle');
      expect(machine.getConfig()).toEqual(DEFAULT_CALIBRATION_CONFIG);
    });

    it('should create instance with custom config', () => {
      const customMachine = createCalibrationStateMachine({
        countdownDuration: 15,
        recordingDuration: 120,
      });
      const config = customMachine.getConfig();
      expect(config.countdownDuration).toBe(15);
      expect(config.recordingDuration).toBe(120);
      customMachine.destroy();
    });

    it('should return initial timer state', () => {
      const timerState = machine.getTimerState();
      expect(timerState.elapsedSeconds).toBe(0);
      expect(timerState.remainingSeconds).toBe(null);
      expect(timerState.isPhaseComplete).toBe(false);
    });

    it('should return initial calibration data', () => {
      const data = machine.getCalibrationData();
      expect(data.signalSamples).toEqual([]);
      expect(data.cleanDataPercentage).toBe(0);
      expect(data.averageSignalQuality).toBe(0);
      expect(data.autoPauseCount).toBe(0);
      expect(data.recordingDuration).toBe(0);
      expect(data.meetsMinimumRequirements).toBe(false);
    });

    it('should transition from idle to instructions on START', () => {
      const result = machine.start();
      expect(result.success).toBe(true);
      expect(result.previousState).toBe('idle');
      expect(result.newState).toBe('instructions');
      expect(machine.getState()).toBe('instructions');
    });

    it('should transition from instructions to countdown on NEXT', () => {
      machine.start();
      const result = machine.next();
      expect(result.success).toBe(true);
      expect(result.newState).toBe('countdown');
    });

    it('should reject invalid transitions', () => {
      const result = machine.pause();
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid transition');
    });

    it('should cancel calibration and return to idle', () => {
      machine.start();
      const result = machine.cancel();
      expect(result.success).toBe(true);
      expect(result.newState).toBe('idle');
    });

    it('should not allow setConfig when not idle', () => {
      machine.start();
      expect(() => machine.setConfig({ countdownDuration: 20 })).toThrow(
        'Cannot set config while calibration is active'
      );
    });

    it('should allow setConfig when idle', () => {
      machine.setConfig({ countdownDuration: 20 });
      expect(machine.getConfig().countdownDuration).toBe(20);
    });

    it('should add and remove state listeners', () => {
      const listener = jest.fn();
      const unsubscribe = machine.addStateListener(listener);

      machine.start();
      expect(listener).toHaveBeenCalledWith('instructions', 'idle', 'START');

      unsubscribe();
      machine.next();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should add and remove timer listeners', () => {
      const listener = jest.fn();
      const unsubscribe = machine.addTimerListener(listener);

      machine.start();
      machine.next(); // Go to countdown which starts timer

      unsubscribe();
      expect(typeof unsubscribe).toBe('function');
    });

    it('should add and remove completion listeners', () => {
      const listener = jest.fn();
      const unsubscribe = machine.addCompletionListener(listener);
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should add and remove signal listeners', () => {
      const listener = jest.fn();
      const unsubscribe = machine.addSignalListener(listener);
      expect(typeof unsubscribe).toBe('function');
      unsubscribe();
    });

    it('should reset from idle state', () => {
      const result = machine.reset();
      expect(result.success).toBe(true);
      expect(result.newState).toBe('idle');
    });

    it('should reset from complete state', () => {
      machine.start();
      machine.next(); // countdown
      machine.next(); // recording
      machine.complete(); // processing
      machine.complete(); // complete

      const result = machine.reset();
      expect(result.success).toBe(true);
      expect(result.newState).toBe('idle');
    });

    it('should handle transition flow: idle -> instructions -> countdown', () => {
      expect(machine.getState()).toBe('idle');

      machine.start();
      expect(machine.getState()).toBe('instructions');

      machine.next();
      expect(machine.getState()).toBe('countdown');
    });

    it('should retry from failed state', () => {
      machine.start();
      machine.next(); // countdown
      machine.next(); // recording
      machine.complete(); // processing
      machine.fail(); // failed

      const result = machine.retry();
      expect(result.success).toBe(true);
      expect(result.newState).toBe('instructions');
    });

    it('should destroy and clean up', () => {
      const stateListener = jest.fn();
      const timerListener = jest.fn();

      machine.addStateListener(stateListener);
      machine.addTimerListener(timerListener);

      machine.destroy();

      // After destroy, getState should still work but state should be reset
      expect(machine.getState()).toBe('idle');
    });
  });

  describe('CalibrationStateMachine Signal Recording', () => {
    let machine: CalibrationStateMachine;

    beforeEach(() => {
      machine = createCalibrationStateMachine({
        countdownDuration: 1,
        recordingDuration: 60,
      });
      // Advance to recording state
      machine.start();
      machine.next();
      machine.next();
    });

    afterEach(() => {
      machine.destroy();
    });

    it('should record signal samples during recording', () => {
      machine.recordSignalSample({
        score: 80,
        artifact_percentage: 10,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      });

      const data = machine.getCalibrationData();
      expect(data.signalSamples.length).toBe(1);
      expect(data.signalSamples[0].score).toBe(80);
      expect(data.signalSamples[0].isClean).toBe(true);
    });

    it('should not record signal samples when not recording', () => {
      machine.pause();

      machine.recordSignalSample({
        score: 80,
        artifact_percentage: 10,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      });

      const data = machine.getCalibrationData();
      expect(data.signalSamples.length).toBe(0);
    });

    it('should mark samples as not clean when score < 40', () => {
      machine.recordSignalSample({
        score: 30,
        artifact_percentage: 40,
        has_amplitude_artifact: true,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      });

      const data = machine.getCalibrationData();
      expect(data.signalSamples[0].isClean).toBe(false);
    });

    it('should update data stats after recording samples', () => {
      machine.recordSignalSample({
        score: 80,
        artifact_percentage: 10,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      });

      machine.recordSignalSample({
        score: 60,
        artifact_percentage: 20,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      });

      const data = machine.getCalibrationData();
      expect(data.cleanDataPercentage).toBe(100);
      expect(data.averageSignalQuality).toBe(70);
    });

    it('should notify signal listeners', () => {
      const listener = jest.fn();
      machine.addSignalListener(listener);

      const quality = {
        score: 80,
        artifact_percentage: 10,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      };

      machine.recordSignalSample(quality);

      expect(listener).toHaveBeenCalledWith(
        quality,
        expect.objectContaining({
          score: 80,
          isClean: true,
        })
      );
    });
  });

  describe('CalibrationStateMachine Pause/Resume', () => {
    let machine: CalibrationStateMachine;

    beforeEach(() => {
      machine = createCalibrationStateMachine({
        countdownDuration: 1,
        recordingDuration: 60,
      });
      machine.start();
      machine.next();
      machine.next();
    });

    afterEach(() => {
      machine.destroy();
    });

    it('should pause recording', () => {
      const result = machine.pause();
      expect(result.success).toBe(true);
      expect(machine.getState()).toBe('paused');
    });

    it('should resume recording', () => {
      machine.pause();
      const result = machine.resume();
      expect(result.success).toBe(true);
      expect(machine.getState()).toBe('recording');
    });

    it('should track pausedAt timestamp when paused', () => {
      machine.pause();
      const timerState = machine.getTimerState();
      expect(timerState.pausedAt).not.toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('should catch errors in state listeners', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const machine = createCalibrationStateMachine();

      machine.addStateListener(() => {
        throw new Error('Listener error');
      });

      machine.start();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in calibration state listener:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      machine.destroy();
    });

    it('should catch errors in timer listeners', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const machine = createCalibrationStateMachine({
        countdownDuration: 30,
        recordingDuration: 60,
      });

      // Advance to recording state where the timer tick will call notifyTimerListeners
      machine.start();
      machine.next(); // countdown
      machine.next(); // recording

      machine.addTimerListener(() => {
        throw new Error('Timer listener error');
      });

      // Pause will call notifyTimerListeners synchronously
      machine.pause();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in calibration timer listener:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      machine.destroy();
    });

    it('should catch errors in signal listeners', () => {
      const consoleErrorSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const machine = createCalibrationStateMachine({
        countdownDuration: 1,
        recordingDuration: 60,
      });

      machine.start();
      machine.next();
      machine.next();

      machine.addSignalListener(() => {
        throw new Error('Signal listener error');
      });

      machine.recordSignalSample({
        score: 80,
        artifact_percentage: 10,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Error in calibration signal listener:',
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
      machine.destroy();
    });
  });

  describe('Documentation', () => {
    it('should have JSDoc comments for class', () => {
      expect(sourceCode).toContain('* CalibrationStateMachine class');
    });

    it('should have JSDoc comments for factory function', () => {
      expect(sourceCode).toContain(
        '* Creates a new calibration state machine instance'
      );
    });

    it('should document state transitions in header', () => {
      expect(sourceCode).toContain('State transitions:');
    });

    it('should have JSDoc for helper functions', () => {
      expect(sourceCode).toContain('* Checks if a transition is valid');
      expect(sourceCode).toContain('* Gets the next state for a given event');
      expect(sourceCode).toContain(
        '* Gets available events for the current state'
      );
    });
  });

  describe('Index Exports', () => {
    it('should be exported from services index', () => {
      const indexPath = path.join(__dirname, '../src/services/index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain(
        "export * from './CalibrationStateMachine'"
      );
    });
  });
});
