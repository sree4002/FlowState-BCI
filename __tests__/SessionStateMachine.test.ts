/**
 * Comprehensive tests for SessionStateMachine
 *
 * Tests cover:
 * - State transitions
 * - Valid and invalid transitions
 * - Timer functionality
 * - Event listeners
 * - Helper functions
 * - Edge cases
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source file for static analysis
const sourceFilePath = path.join(
  __dirname,
  '../src/services/SessionStateMachine.ts'
);
const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');

describe('SessionStateMachine', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(sourceFilePath)).toBe(true);
    });

    it('should export SessionStateMachine class', () => {
      expect(sourceCode).toContain('export class SessionStateMachine');
    });

    it('should export createSessionStateMachine function', () => {
      expect(sourceCode).toContain('export const createSessionStateMachine');
    });

    it('should have default export', () => {
      expect(sourceCode).toContain('export default SessionStateMachine');
    });
  });

  describe('Type Exports', () => {
    it('should export SessionEvent type', () => {
      expect(sourceCode).toContain('export type SessionEvent');
    });

    it('should export TransitionResult interface', () => {
      expect(sourceCode).toContain('export interface TransitionResult');
    });

    it('should export SessionTimerState interface', () => {
      expect(sourceCode).toContain('export interface SessionTimerState');
    });

    it('should export SessionStateListener type', () => {
      expect(sourceCode).toContain('export type SessionStateListener');
    });

    it('should export SessionTimerListener type', () => {
      expect(sourceCode).toContain('export type SessionTimerListener');
    });

    it('should export SessionCompletionListener type', () => {
      expect(sourceCode).toContain('export type SessionCompletionListener');
    });
  });

  describe('Required Imports', () => {
    it('should import SessionState from types', () => {
      expect(sourceCode).toMatch(/import.*SessionState.*from.*['"]\.\.\/types['"]/);
    });

    it('should import SessionConfig from types', () => {
      expect(sourceCode).toMatch(/import.*SessionConfig.*from.*['"]\.\.\/types['"]/);
    });

    it('should import Session from types', () => {
      expect(sourceCode).toMatch(/import.*Session.*from.*['"]\.\.\/types['"]/);
    });
  });

  describe('SessionEvent Type Values', () => {
    it('should include START event', () => {
      expect(sourceCode).toContain("'START'");
    });

    it('should include PAUSE event', () => {
      expect(sourceCode).toContain("'PAUSE'");
    });

    it('should include RESUME event', () => {
      expect(sourceCode).toContain("'RESUME'");
    });

    it('should include STOP event', () => {
      expect(sourceCode).toContain("'STOP'");
    });

    it('should include RESET event', () => {
      expect(sourceCode).toContain("'RESET'");
    });

    it('should include TICK event', () => {
      expect(sourceCode).toContain("'TICK'");
    });
  });

  describe('TransitionResult Interface', () => {
    it('should have success property', () => {
      expect(sourceCode).toMatch(/success:\s*boolean/);
    });

    it('should have previousState property', () => {
      expect(sourceCode).toMatch(/previousState:\s*SessionState/);
    });

    it('should have newState property', () => {
      expect(sourceCode).toMatch(/newState:\s*SessionState/);
    });

    it('should have event property', () => {
      expect(sourceCode).toMatch(/event:\s*SessionEvent/);
    });

    it('should have optional error property', () => {
      expect(sourceCode).toMatch(/error\?:\s*string/);
    });
  });

  describe('SessionTimerState Interface', () => {
    it('should have elapsedSeconds property', () => {
      expect(sourceCode).toMatch(/elapsedSeconds:\s*number/);
    });

    it('should have remainingSeconds property', () => {
      expect(sourceCode).toMatch(/remainingSeconds:\s*number\s*\|\s*null/);
    });

    it('should have isComplete property', () => {
      expect(sourceCode).toMatch(/isComplete:\s*boolean/);
    });

    it('should have startTimestamp property', () => {
      expect(sourceCode).toMatch(/startTimestamp:\s*number\s*\|\s*null/);
    });

    it('should have pausedAt property', () => {
      expect(sourceCode).toMatch(/pausedAt:\s*number\s*\|\s*null/);
    });

    it('should have totalPausedDuration property', () => {
      expect(sourceCode).toMatch(/totalPausedDuration:\s*number/);
    });
  });

  describe('Valid State Transitions Map', () => {
    it('should define VALID_TRANSITIONS constant', () => {
      expect(sourceCode).toContain('const VALID_TRANSITIONS');
    });

    it('should allow START from idle', () => {
      expect(sourceCode).toMatch(/idle:\s*\{[\s\S]*?START:\s*['"]running['"]/);
    });

    it('should allow PAUSE from running', () => {
      expect(sourceCode).toMatch(/running:\s*\{[\s\S]*?PAUSE:\s*['"]paused['"]/);
    });

    it('should allow STOP from running', () => {
      expect(sourceCode).toMatch(/running:\s*\{[\s\S]*?STOP:\s*['"]stopped['"]/);
    });

    it('should allow RESUME from paused', () => {
      expect(sourceCode).toMatch(/paused:\s*\{[\s\S]*?RESUME:\s*['"]running['"]/);
    });

    it('should allow STOP from paused', () => {
      expect(sourceCode).toMatch(/paused:\s*\{[\s\S]*?STOP:\s*['"]stopped['"]/);
    });

    it('should allow RESET from stopped', () => {
      expect(sourceCode).toMatch(/stopped:\s*\{[\s\S]*?RESET:\s*['"]idle['"]/);
    });
  });

  describe('Helper Functions Export', () => {
    it('should export isValidTransition function', () => {
      expect(sourceCode).toContain('export const isValidTransition');
    });

    it('should export getNextState function', () => {
      expect(sourceCode).toContain('export const getNextState');
    });

    it('should export getAvailableEvents function', () => {
      expect(sourceCode).toContain('export const getAvailableEvents');
    });

    it('should export canStart function', () => {
      expect(sourceCode).toContain('export const canStart');
    });

    it('should export canPause function', () => {
      expect(sourceCode).toContain('export const canPause');
    });

    it('should export canResume function', () => {
      expect(sourceCode).toContain('export const canResume');
    });

    it('should export canStop function', () => {
      expect(sourceCode).toContain('export const canStop');
    });

    it('should export canReset function', () => {
      expect(sourceCode).toContain('export const canReset');
    });

    it('should export isSessionActive function', () => {
      expect(sourceCode).toContain('export const isSessionActive');
    });

    it('should export isSessionRunning function', () => {
      expect(sourceCode).toContain('export const isSessionRunning');
    });

    it('should export isSessionPaused function', () => {
      expect(sourceCode).toContain('export const isSessionPaused');
    });

    it('should export isSessionStopped function', () => {
      expect(sourceCode).toContain('export const isSessionStopped');
    });

    it('should export isSessionIdle function', () => {
      expect(sourceCode).toContain('export const isSessionIdle');
    });

    it('should export formatTime function', () => {
      expect(sourceCode).toContain('export const formatTime');
    });

    it('should export formatTimeLong function', () => {
      expect(sourceCode).toContain('export const formatTimeLong');
    });
  });

  describe('isValidTransition Function', () => {
    it('should take currentState and event parameters', () => {
      expect(sourceCode).toMatch(
        /isValidTransition\s*=\s*\(\s*currentState:\s*SessionState,\s*event:\s*SessionEvent\s*\)/
      );
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/isValidTransition[\s\S]*?:\s*boolean/);
    });

    it('should use VALID_TRANSITIONS map', () => {
      const functionMatch = sourceCode.match(
        /export const isValidTransition[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain('VALID_TRANSITIONS');
    });
  });

  describe('getNextState Function', () => {
    it('should take currentState and event parameters', () => {
      expect(sourceCode).toMatch(
        /getNextState\s*=\s*\(\s*currentState:\s*SessionState,\s*event:\s*SessionEvent\s*\)/
      );
    });

    it('should return SessionState or null', () => {
      expect(sourceCode).toMatch(/getNextState[\s\S]*?:\s*SessionState\s*\|\s*null/);
    });
  });

  describe('getAvailableEvents Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(
        /getAvailableEvents\s*=\s*\(\s*currentState:\s*SessionState\s*\)/
      );
    });

    it('should return SessionEvent array', () => {
      expect(sourceCode).toMatch(/getAvailableEvents[\s\S]*?:\s*SessionEvent\[\]/);
    });
  });

  describe('canStart Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(/canStart\s*=\s*\(\s*currentState:\s*SessionState\s*\)/);
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/canStart[\s\S]*?:\s*boolean/);
    });

    it('should use isValidTransition with START event', () => {
      const functionMatch = sourceCode.match(/export const canStart[\s\S]*?(?=export const)/);
      expect(functionMatch?.[0]).toContain("'START'");
    });
  });

  describe('canPause Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(/canPause\s*=\s*\(\s*currentState:\s*SessionState\s*\)/);
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/canPause[\s\S]*?:\s*boolean/);
    });

    it('should use isValidTransition with PAUSE event', () => {
      const functionMatch = sourceCode.match(/export const canPause[\s\S]*?(?=export const)/);
      expect(functionMatch?.[0]).toContain("'PAUSE'");
    });
  });

  describe('canResume Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(/canResume\s*=\s*\(\s*currentState:\s*SessionState\s*\)/);
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/canResume[\s\S]*?:\s*boolean/);
    });

    it('should use isValidTransition with RESUME event', () => {
      const functionMatch = sourceCode.match(/export const canResume[\s\S]*?(?=export const)/);
      expect(functionMatch?.[0]).toContain("'RESUME'");
    });
  });

  describe('canStop Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(/canStop\s*=\s*\(\s*currentState:\s*SessionState\s*\)/);
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/canStop[\s\S]*?:\s*boolean/);
    });

    it('should use isValidTransition with STOP event', () => {
      const functionMatch = sourceCode.match(/export const canStop[\s\S]*?(?=export const)/);
      expect(functionMatch?.[0]).toContain("'STOP'");
    });
  });

  describe('canReset Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(/canReset\s*=\s*\(\s*currentState:\s*SessionState\s*\)/);
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/canReset[\s\S]*?:\s*boolean/);
    });

    it('should use isValidTransition with RESET event', () => {
      const functionMatch = sourceCode.match(/export const canReset[\s\S]*?(?=export const)/);
      expect(functionMatch?.[0]).toContain("'RESET'");
    });
  });

  describe('isSessionActive Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(
        /isSessionActive\s*=\s*\(\s*currentState:\s*SessionState\s*\)/
      );
    });

    it('should return boolean', () => {
      expect(sourceCode).toMatch(/isSessionActive[\s\S]*?:\s*boolean/);
    });

    it('should check for running state', () => {
      const functionMatch = sourceCode.match(
        /export const isSessionActive[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain("'running'");
    });

    it('should check for paused state', () => {
      const functionMatch = sourceCode.match(
        /export const isSessionActive[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain("'paused'");
    });
  });

  describe('isSessionRunning Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(
        /isSessionRunning\s*=\s*\(\s*currentState:\s*SessionState\s*\)/
      );
    });

    it('should check for running state', () => {
      const functionMatch = sourceCode.match(
        /export const isSessionRunning[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain("'running'");
    });
  });

  describe('isSessionPaused Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(
        /isSessionPaused\s*=\s*\(\s*currentState:\s*SessionState\s*\)/
      );
    });

    it('should check for paused state', () => {
      const functionMatch = sourceCode.match(
        /export const isSessionPaused[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain("'paused'");
    });
  });

  describe('isSessionStopped Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(
        /isSessionStopped\s*=\s*\(\s*currentState:\s*SessionState\s*\)/
      );
    });

    it('should check for stopped state', () => {
      const functionMatch = sourceCode.match(
        /export const isSessionStopped[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain("'stopped'");
    });
  });

  describe('isSessionIdle Function', () => {
    it('should take currentState parameter', () => {
      expect(sourceCode).toMatch(
        /isSessionIdle\s*=\s*\(\s*currentState:\s*SessionState\s*\)/
      );
    });

    it('should check for idle state', () => {
      const functionMatch = sourceCode.match(
        /export const isSessionIdle[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain("'idle'");
    });
  });

  describe('formatTime Function', () => {
    it('should take seconds parameter', () => {
      expect(sourceCode).toMatch(/formatTime\s*=\s*\(\s*seconds:\s*number\s*\)/);
    });

    it('should return string', () => {
      expect(sourceCode).toMatch(/formatTime[\s\S]*?:\s*string/);
    });

    it('should use padStart for formatting', () => {
      const functionMatch = sourceCode.match(
        /export const formatTime[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain('padStart');
    });

    it('should calculate minutes', () => {
      const functionMatch = sourceCode.match(
        /export const formatTime[\s\S]*?(?=export const)/
      );
      expect(functionMatch?.[0]).toContain('60');
    });
  });

  describe('formatTimeLong Function', () => {
    it('should take seconds parameter', () => {
      expect(sourceCode).toMatch(/formatTimeLong\s*=\s*\(\s*seconds:\s*number\s*\)/);
    });

    it('should return string', () => {
      expect(sourceCode).toMatch(/formatTimeLong[\s\S]*?:\s*string/);
    });

    it('should calculate hours', () => {
      const functionMatch = sourceCode.match(
        /export const formatTimeLong[\s\S]*?(?=export class)/
      );
      expect(functionMatch?.[0]).toContain('3600');
    });
  });

  describe('SessionStateMachine Class', () => {
    it('should have private currentState property', () => {
      expect(sourceCode).toMatch(/private\s+currentState:\s*SessionState/);
    });

    it('should have private config property', () => {
      expect(sourceCode).toMatch(/private\s+config:\s*SessionConfig\s*\|\s*null/);
    });

    it('should have private timerState property', () => {
      expect(sourceCode).toMatch(/private\s+timerState:\s*SessionTimerState/);
    });

    it('should have private timerIntervalId property', () => {
      expect(sourceCode).toContain('private timerIntervalId');
    });

    it('should have private stateListeners property', () => {
      expect(sourceCode).toMatch(/private\s+stateListeners:\s*Set/);
    });

    it('should have private timerListeners property', () => {
      expect(sourceCode).toMatch(/private\s+timerListeners:\s*Set/);
    });

    it('should have private completionListeners property', () => {
      expect(sourceCode).toMatch(/private\s+completionListeners:\s*Set/);
    });
  });

  describe('SessionStateMachine Constructor', () => {
    it('should have a constructor', () => {
      expect(sourceCode).toMatch(/constructor\s*\(\s*\)/);
    });

    it('should call reset in constructor', () => {
      const constructorMatch = sourceCode.match(/constructor\s*\(\s*\)\s*\{[\s\S]*?\}/);
      expect(constructorMatch?.[0]).toContain('reset');
    });
  });

  describe('SessionStateMachine Public Methods', () => {
    it('should have getState method', () => {
      expect(sourceCode).toContain('getState(): SessionState');
    });

    it('should have getConfig method', () => {
      expect(sourceCode).toContain('getConfig(): SessionConfig | null');
    });

    it('should have getTimerState method', () => {
      expect(sourceCode).toContain('getTimerState(): SessionTimerState');
    });

    it('should have setConfig method', () => {
      expect(sourceCode).toContain('setConfig(config: SessionConfig)');
    });

    it('should have addStateListener method', () => {
      expect(sourceCode).toContain('addStateListener(listener: SessionStateListener)');
    });

    it('should have addTimerListener method', () => {
      expect(sourceCode).toContain('addTimerListener(listener: SessionTimerListener)');
    });

    it('should have addCompletionListener method', () => {
      expect(sourceCode).toContain('addCompletionListener(listener: SessionCompletionListener)');
    });

    it('should have transition method', () => {
      expect(sourceCode).toContain('transition(event: SessionEvent): TransitionResult');
    });

    it('should have start method', () => {
      expect(sourceCode).toContain('start(): TransitionResult');
    });

    it('should have pause method', () => {
      expect(sourceCode).toContain('pause(): TransitionResult');
    });

    it('should have resume method', () => {
      expect(sourceCode).toContain('resume(): TransitionResult');
    });

    it('should have stop method', () => {
      expect(sourceCode).toContain('stop(): TransitionResult');
    });

    it('should have reset method', () => {
      expect(sourceCode).toContain('reset(): TransitionResult');
    });

    it('should have destroy method', () => {
      expect(sourceCode).toContain('destroy(): void');
    });
  });

  describe('SessionStateMachine Private Methods', () => {
    it('should have notifyStateListeners method', () => {
      expect(sourceCode).toContain('private notifyStateListeners');
    });

    it('should have notifyTimerListeners method', () => {
      expect(sourceCode).toContain('private notifyTimerListeners');
    });

    it('should have notifyCompletionListeners method', () => {
      expect(sourceCode).toContain('private notifyCompletionListeners');
    });

    it('should have handleTransitionSideEffects method', () => {
      expect(sourceCode).toContain('private handleTransitionSideEffects');
    });

    it('should have startTimer method', () => {
      expect(sourceCode).toContain('private startTimer');
    });

    it('should have startTimerInterval method', () => {
      expect(sourceCode).toContain('private startTimerInterval');
    });

    it('should have tick method', () => {
      expect(sourceCode).toContain('private tick');
    });

    it('should have pauseTimer method', () => {
      expect(sourceCode).toContain('private pauseTimer');
    });

    it('should have resumeTimer method', () => {
      expect(sourceCode).toContain('private resumeTimer');
    });

    it('should have stopTimer method', () => {
      expect(sourceCode).toContain('private stopTimer');
    });

    it('should have resetTimer method', () => {
      expect(sourceCode).toContain('private resetTimer');
    });
  });

  describe('setConfig Method', () => {
    it('should throw error if not in idle state', () => {
      expect(sourceCode).toContain('Cannot set config while session is active');
    });

    it('should check current state', () => {
      const methodMatch = sourceCode.match(/setConfig[\s\S]*?(?=addStateListener)/);
      expect(methodMatch?.[0]).toContain("this.currentState !== 'idle'");
    });

    it('should set remaining seconds from config duration', () => {
      const methodMatch = sourceCode.match(/setConfig[\s\S]*?(?=addStateListener)/);
      expect(methodMatch?.[0]).toContain('duration_minutes');
    });
  });

  describe('Listener Methods Return Unsubscribe Function', () => {
    it('addStateListener should return function', () => {
      const methodMatch = sourceCode.match(/addStateListener[\s\S]*?(?=addTimerListener)/);
      expect(methodMatch?.[0]).toContain('return () =>');
    });

    it('addTimerListener should return function', () => {
      const methodMatch = sourceCode.match(/addTimerListener[\s\S]*?(?=addCompletionListener)/);
      expect(methodMatch?.[0]).toContain('return () =>');
    });

    it('addCompletionListener should return function', () => {
      const methodMatch = sourceCode.match(
        /addCompletionListener[\s\S]*?(?=private notifyStateListeners)/
      );
      expect(methodMatch?.[0]).toContain('return () =>');
    });
  });

  describe('transition Method', () => {
    it('should use getNextState for validation', () => {
      const methodMatch = sourceCode.match(/transition\(event[\s\S]*?(?=private handleTransitionSideEffects)/);
      expect(methodMatch?.[0]).toContain('getNextState');
    });

    it('should return success false for invalid transitions', () => {
      const methodMatch = sourceCode.match(/transition\(event[\s\S]*?(?=private handleTransitionSideEffects)/);
      expect(methodMatch?.[0]).toContain('success: false');
    });

    it('should call handleTransitionSideEffects', () => {
      const methodMatch = sourceCode.match(/transition\(event[\s\S]*?(?=private handleTransitionSideEffects)/);
      expect(methodMatch?.[0]).toContain('handleTransitionSideEffects');
    });

    it('should call notifyStateListeners', () => {
      const methodMatch = sourceCode.match(/transition\(event[\s\S]*?(?=private handleTransitionSideEffects)/);
      expect(methodMatch?.[0]).toContain('notifyStateListeners');
    });
  });

  describe('handleTransitionSideEffects Method', () => {
    it('should handle START event', () => {
      const methodMatch = sourceCode.match(
        /handleTransitionSideEffects[\s\S]*?(?=private startTimer)/
      );
      expect(methodMatch?.[0]).toContain("case 'START'");
    });

    it('should handle PAUSE event', () => {
      const methodMatch = sourceCode.match(
        /handleTransitionSideEffects[\s\S]*?(?=private startTimer)/
      );
      expect(methodMatch?.[0]).toContain("case 'PAUSE'");
    });

    it('should handle RESUME event', () => {
      const methodMatch = sourceCode.match(
        /handleTransitionSideEffects[\s\S]*?(?=private startTimer)/
      );
      expect(methodMatch?.[0]).toContain("case 'RESUME'");
    });

    it('should handle STOP event', () => {
      const methodMatch = sourceCode.match(
        /handleTransitionSideEffects[\s\S]*?(?=private startTimer)/
      );
      expect(methodMatch?.[0]).toContain("case 'STOP'");
    });

    it('should handle RESET event', () => {
      const methodMatch = sourceCode.match(
        /handleTransitionSideEffects[\s\S]*?(?=private startTimer)/
      );
      expect(methodMatch?.[0]).toContain("case 'RESET'");
    });

    it('should call notifyCompletionListeners on STOP', () => {
      const methodMatch = sourceCode.match(
        /handleTransitionSideEffects[\s\S]*?(?=private startTimer)/
      );
      expect(methodMatch?.[0]).toContain('notifyCompletionListeners');
    });
  });

  describe('Timer Methods', () => {
    it('startTimer should set startTimestamp', () => {
      const methodMatch = sourceCode.match(/private startTimer[\s\S]*?(?=private startTimerInterval)/);
      expect(methodMatch?.[0]).toContain('startTimestamp');
    });

    it('startTimer should reset elapsedSeconds to 0', () => {
      const methodMatch = sourceCode.match(/private startTimer[\s\S]*?(?=private startTimerInterval)/);
      expect(methodMatch?.[0]).toContain('elapsedSeconds = 0');
    });

    it('startTimerInterval should use setInterval', () => {
      const methodMatch = sourceCode.match(/private startTimerInterval[\s\S]*?(?=private tick)/);
      expect(methodMatch?.[0]).toContain('setInterval');
    });

    it('startTimerInterval should call tick every 1000ms', () => {
      const methodMatch = sourceCode.match(/private startTimerInterval[\s\S]*?(?=private tick)/);
      expect(methodMatch?.[0]).toContain('1000');
    });

    it('tick should increment elapsedSeconds', () => {
      const methodMatch = sourceCode.match(/private tick[\s\S]*?(?=private pauseTimer)/);
      expect(methodMatch?.[0]).toContain('elapsedSeconds += 1');
    });

    it('tick should decrement remainingSeconds', () => {
      const methodMatch = sourceCode.match(/private tick[\s\S]*?(?=private pauseTimer)/);
      expect(methodMatch?.[0]).toContain('remainingSeconds -= 1');
    });

    it('tick should check for completion', () => {
      const methodMatch = sourceCode.match(/private tick[\s\S]*?(?=private pauseTimer)/);
      expect(methodMatch?.[0]).toContain('isComplete');
    });

    it('tick should auto-stop when complete', () => {
      const methodMatch = sourceCode.match(/private tick[\s\S]*?(?=private pauseTimer)/);
      expect(methodMatch?.[0]).toContain("transition('STOP')");
    });

    it('pauseTimer should clear interval', () => {
      const methodMatch = sourceCode.match(/private pauseTimer[\s\S]*?(?=private resumeTimer)/);
      expect(methodMatch?.[0]).toContain('clearInterval');
    });

    it('pauseTimer should set pausedAt', () => {
      const methodMatch = sourceCode.match(/private pauseTimer[\s\S]*?(?=private resumeTimer)/);
      expect(methodMatch?.[0]).toContain('pausedAt');
    });

    it('resumeTimer should calculate paused duration', () => {
      const methodMatch = sourceCode.match(/private resumeTimer[\s\S]*?(?=private stopTimer)/);
      expect(methodMatch?.[0]).toContain('totalPausedDuration');
    });

    it('stopTimer should clear interval', () => {
      const methodMatch = sourceCode.match(/private stopTimer[\s\S]*?(?=private resetTimer)/);
      expect(methodMatch?.[0]).toContain('clearInterval');
    });

    it('resetTimer should reset all timer state', () => {
      const methodMatch = sourceCode.match(/private resetTimer[\s\S]*?(?=start\(\))/);
      expect(methodMatch?.[0]).toContain('elapsedSeconds: 0');
    });
  });

  describe('Convenience Methods', () => {
    it("start method should call transition with 'START'", () => {
      const methodMatch = sourceCode.match(/start\(\)[\s\S]*?(?=pause\(\))/);
      expect(methodMatch?.[0]).toContain("transition('START')");
    });

    it("pause method should call transition with 'PAUSE'", () => {
      const methodMatch = sourceCode.match(/pause\(\)[\s\S]*?(?=resume\(\))/);
      expect(methodMatch?.[0]).toContain("transition('PAUSE')");
    });

    it("resume method should call transition with 'RESUME'", () => {
      const methodMatch = sourceCode.match(/resume\(\)[\s\S]*?(?=stop\(\))/);
      expect(methodMatch?.[0]).toContain("transition('RESUME')");
    });

    it("stop method should call transition with 'STOP'", () => {
      const methodMatch = sourceCode.match(/stop\(\):\s*TransitionResult[\s\S]*?(?=reset\(\))/);
      expect(methodMatch?.[0]).toContain("transition('STOP')");
    });
  });

  describe('reset Method', () => {
    it('should handle reset when already idle', () => {
      const methodMatch = sourceCode.match(/reset\(\)[\s\S]*?(?=destroy\(\))/);
      expect(methodMatch?.[0]).toContain("this.currentState === 'idle'");
    });

    it('should handle reset when stopped', () => {
      const methodMatch = sourceCode.match(/reset\(\)[\s\S]*?(?=destroy\(\))/);
      expect(methodMatch?.[0]).toContain("this.currentState === 'stopped'");
    });

    it('should force stop before reset for running/paused states', () => {
      const methodMatch = sourceCode.match(/reset\(\)[\s\S]*?(?=destroy\(\))/);
      expect(methodMatch?.[0]).toContain('this.stop()');
    });
  });

  describe('destroy Method', () => {
    it('should clear interval if exists', () => {
      const methodMatch = sourceCode.match(/destroy\(\)[\s\S]*$/);
      expect(methodMatch?.[0]).toContain('clearInterval');
    });

    it('should clear stateListeners', () => {
      const methodMatch = sourceCode.match(/destroy\(\)[\s\S]*$/);
      expect(methodMatch?.[0]).toContain('stateListeners.clear()');
    });

    it('should clear timerListeners', () => {
      const methodMatch = sourceCode.match(/destroy\(\)[\s\S]*$/);
      expect(methodMatch?.[0]).toContain('timerListeners.clear()');
    });

    it('should clear completionListeners', () => {
      const methodMatch = sourceCode.match(/destroy\(\)[\s\S]*$/);
      expect(methodMatch?.[0]).toContain('completionListeners.clear()');
    });

    it('should set config to null', () => {
      const methodMatch = sourceCode.match(/destroy\(\)[\s\S]*$/);
      expect(methodMatch?.[0]).toContain('this.config = null');
    });
  });

  describe('Error Handling', () => {
    it('should catch errors in state listeners', () => {
      expect(sourceCode).toContain('Error in state listener');
    });

    it('should catch errors in timer listeners', () => {
      expect(sourceCode).toContain('Error in timer listener');
    });

    it('should catch errors in completion listeners', () => {
      expect(sourceCode).toContain('Error in completion listener');
    });
  });

  describe('notifyCompletionListeners Creates Session Data', () => {
    it('should include session_type', () => {
      const methodMatch = sourceCode.match(
        /private notifyCompletionListeners[\s\S]*?(?=transition)/
      );
      expect(methodMatch?.[0]).toContain('session_type');
    });

    it('should include start_time', () => {
      const methodMatch = sourceCode.match(
        /private notifyCompletionListeners[\s\S]*?(?=transition)/
      );
      expect(methodMatch?.[0]).toContain('start_time');
    });

    it('should include end_time', () => {
      const methodMatch = sourceCode.match(
        /private notifyCompletionListeners[\s\S]*?(?=transition)/
      );
      expect(methodMatch?.[0]).toContain('end_time');
    });

    it('should include duration_seconds', () => {
      const methodMatch = sourceCode.match(
        /private notifyCompletionListeners[\s\S]*?(?=transition)/
      );
      expect(methodMatch?.[0]).toContain('duration_seconds');
    });

    it('should include entrainment_freq', () => {
      const methodMatch = sourceCode.match(
        /private notifyCompletionListeners[\s\S]*?(?=transition)/
      );
      expect(methodMatch?.[0]).toContain('entrainment_freq');
    });

    it('should include volume', () => {
      const methodMatch = sourceCode.match(
        /private notifyCompletionListeners[\s\S]*?(?=transition)/
      );
      expect(methodMatch?.[0]).toContain('volume');
    });
  });

  describe('Documentation', () => {
    it('should have module-level documentation', () => {
      expect(sourceCode).toContain('SessionStateMachine - Manages the session state lifecycle');
    });

    it('should document state transitions', () => {
      expect(sourceCode).toContain('idle → running');
    });

    it('should document invalid transitions are rejected', () => {
      expect(sourceCode).toContain('Invalid transitions are rejected');
    });

    it('should have JSDoc for SessionEvent type', () => {
      expect(sourceCode).toContain('Session state machine event types');
    });

    it('should have JSDoc for TransitionResult interface', () => {
      expect(sourceCode).toContain('Session state machine transition result');
    });

    it('should have JSDoc for SessionTimerState interface', () => {
      expect(sourceCode).toContain('Session timer state');
    });

    it('should have JSDoc for SessionStateMachine class', () => {
      expect(sourceCode).toContain('SessionStateMachine class');
    });
  });

  describe('Service Index Export', () => {
    it('should be exported from services/index.ts', () => {
      const indexPath = path.join(__dirname, '../src/services/index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain('SessionStateMachine');
    });
  });
});

describe('SessionStateMachine Functional Tests', () => {
  // Import the actual module for functional testing
  let SessionStateMachine: typeof import('../src/services/SessionStateMachine').SessionStateMachine;
  let isValidTransition: typeof import('../src/services/SessionStateMachine').isValidTransition;
  let getNextState: typeof import('../src/services/SessionStateMachine').getNextState;
  let getAvailableEvents: typeof import('../src/services/SessionStateMachine').getAvailableEvents;
  let canStart: typeof import('../src/services/SessionStateMachine').canStart;
  let canPause: typeof import('../src/services/SessionStateMachine').canPause;
  let canResume: typeof import('../src/services/SessionStateMachine').canResume;
  let canStop: typeof import('../src/services/SessionStateMachine').canStop;
  let canReset: typeof import('../src/services/SessionStateMachine').canReset;
  let isSessionActive: typeof import('../src/services/SessionStateMachine').isSessionActive;
  let isSessionRunning: typeof import('../src/services/SessionStateMachine').isSessionRunning;
  let isSessionPaused: typeof import('../src/services/SessionStateMachine').isSessionPaused;
  let isSessionStopped: typeof import('../src/services/SessionStateMachine').isSessionStopped;
  let isSessionIdle: typeof import('../src/services/SessionStateMachine').isSessionIdle;
  let formatTime: typeof import('../src/services/SessionStateMachine').formatTime;
  let formatTimeLong: typeof import('../src/services/SessionStateMachine').formatTimeLong;
  let createSessionStateMachine: typeof import('../src/services/SessionStateMachine').createSessionStateMachine;

  beforeAll(async () => {
    const module = await import('../src/services/SessionStateMachine');
    SessionStateMachine = module.SessionStateMachine;
    isValidTransition = module.isValidTransition;
    getNextState = module.getNextState;
    getAvailableEvents = module.getAvailableEvents;
    canStart = module.canStart;
    canPause = module.canPause;
    canResume = module.canResume;
    canStop = module.canStop;
    canReset = module.canReset;
    isSessionActive = module.isSessionActive;
    isSessionRunning = module.isSessionRunning;
    isSessionPaused = module.isSessionPaused;
    isSessionStopped = module.isSessionStopped;
    isSessionIdle = module.isSessionIdle;
    formatTime = module.formatTime;
    formatTimeLong = module.formatTimeLong;
    createSessionStateMachine = module.createSessionStateMachine;
  });

  describe('isValidTransition', () => {
    it('should return true for valid idle -> running transition', () => {
      expect(isValidTransition('idle', 'START')).toBe(true);
    });

    it('should return true for valid running -> paused transition', () => {
      expect(isValidTransition('running', 'PAUSE')).toBe(true);
    });

    it('should return true for valid running -> stopped transition', () => {
      expect(isValidTransition('running', 'STOP')).toBe(true);
    });

    it('should return true for valid paused -> running transition', () => {
      expect(isValidTransition('paused', 'RESUME')).toBe(true);
    });

    it('should return true for valid paused -> stopped transition', () => {
      expect(isValidTransition('paused', 'STOP')).toBe(true);
    });

    it('should return true for valid stopped -> idle transition', () => {
      expect(isValidTransition('stopped', 'RESET')).toBe(true);
    });

    it('should return false for invalid idle -> paused transition', () => {
      expect(isValidTransition('idle', 'PAUSE')).toBe(false);
    });

    it('should return false for invalid idle -> stopped transition', () => {
      expect(isValidTransition('idle', 'STOP')).toBe(false);
    });

    it('should return false for invalid running -> running transition', () => {
      expect(isValidTransition('running', 'START')).toBe(false);
    });

    it('should return false for invalid stopped -> running transition', () => {
      expect(isValidTransition('stopped', 'START')).toBe(false);
    });
  });

  describe('getNextState', () => {
    it('should return running for idle + START', () => {
      expect(getNextState('idle', 'START')).toBe('running');
    });

    it('should return paused for running + PAUSE', () => {
      expect(getNextState('running', 'PAUSE')).toBe('paused');
    });

    it('should return stopped for running + STOP', () => {
      expect(getNextState('running', 'STOP')).toBe('stopped');
    });

    it('should return running for paused + RESUME', () => {
      expect(getNextState('paused', 'RESUME')).toBe('running');
    });

    it('should return stopped for paused + STOP', () => {
      expect(getNextState('paused', 'STOP')).toBe('stopped');
    });

    it('should return idle for stopped + RESET', () => {
      expect(getNextState('stopped', 'RESET')).toBe('idle');
    });

    it('should return null for invalid transitions', () => {
      expect(getNextState('idle', 'PAUSE')).toBe(null);
    });
  });

  describe('getAvailableEvents', () => {
    it('should return [START] for idle state', () => {
      expect(getAvailableEvents('idle')).toEqual(['START']);
    });

    it('should return [PAUSE, STOP, TICK] for running state', () => {
      expect(getAvailableEvents('running')).toEqual(['PAUSE', 'STOP', 'TICK']);
    });

    it('should return [RESUME, STOP] for paused state', () => {
      expect(getAvailableEvents('paused')).toEqual(['RESUME', 'STOP']);
    });

    it('should return [RESET] for stopped state', () => {
      expect(getAvailableEvents('stopped')).toEqual(['RESET']);
    });
  });

  describe('canStart', () => {
    it('should return true for idle state', () => {
      expect(canStart('idle')).toBe(true);
    });

    it('should return false for running state', () => {
      expect(canStart('running')).toBe(false);
    });

    it('should return false for paused state', () => {
      expect(canStart('paused')).toBe(false);
    });

    it('should return false for stopped state', () => {
      expect(canStart('stopped')).toBe(false);
    });
  });

  describe('canPause', () => {
    it('should return false for idle state', () => {
      expect(canPause('idle')).toBe(false);
    });

    it('should return true for running state', () => {
      expect(canPause('running')).toBe(true);
    });

    it('should return false for paused state', () => {
      expect(canPause('paused')).toBe(false);
    });

    it('should return false for stopped state', () => {
      expect(canPause('stopped')).toBe(false);
    });
  });

  describe('canResume', () => {
    it('should return false for idle state', () => {
      expect(canResume('idle')).toBe(false);
    });

    it('should return false for running state', () => {
      expect(canResume('running')).toBe(false);
    });

    it('should return true for paused state', () => {
      expect(canResume('paused')).toBe(true);
    });

    it('should return false for stopped state', () => {
      expect(canResume('stopped')).toBe(false);
    });
  });

  describe('canStop', () => {
    it('should return false for idle state', () => {
      expect(canStop('idle')).toBe(false);
    });

    it('should return true for running state', () => {
      expect(canStop('running')).toBe(true);
    });

    it('should return true for paused state', () => {
      expect(canStop('paused')).toBe(true);
    });

    it('should return false for stopped state', () => {
      expect(canStop('stopped')).toBe(false);
    });
  });

  describe('canReset', () => {
    it('should return false for idle state', () => {
      expect(canReset('idle')).toBe(false);
    });

    it('should return false for running state', () => {
      expect(canReset('running')).toBe(false);
    });

    it('should return false for paused state', () => {
      expect(canReset('paused')).toBe(false);
    });

    it('should return true for stopped state', () => {
      expect(canReset('stopped')).toBe(true);
    });
  });

  describe('isSessionActive', () => {
    it('should return false for idle state', () => {
      expect(isSessionActive('idle')).toBe(false);
    });

    it('should return true for running state', () => {
      expect(isSessionActive('running')).toBe(true);
    });

    it('should return true for paused state', () => {
      expect(isSessionActive('paused')).toBe(true);
    });

    it('should return false for stopped state', () => {
      expect(isSessionActive('stopped')).toBe(false);
    });
  });

  describe('isSessionRunning', () => {
    it('should return false for idle state', () => {
      expect(isSessionRunning('idle')).toBe(false);
    });

    it('should return true for running state', () => {
      expect(isSessionRunning('running')).toBe(true);
    });

    it('should return false for paused state', () => {
      expect(isSessionRunning('paused')).toBe(false);
    });

    it('should return false for stopped state', () => {
      expect(isSessionRunning('stopped')).toBe(false);
    });
  });

  describe('isSessionPaused', () => {
    it('should return false for idle state', () => {
      expect(isSessionPaused('idle')).toBe(false);
    });

    it('should return false for running state', () => {
      expect(isSessionPaused('running')).toBe(false);
    });

    it('should return true for paused state', () => {
      expect(isSessionPaused('paused')).toBe(true);
    });

    it('should return false for stopped state', () => {
      expect(isSessionPaused('stopped')).toBe(false);
    });
  });

  describe('isSessionStopped', () => {
    it('should return false for idle state', () => {
      expect(isSessionStopped('idle')).toBe(false);
    });

    it('should return false for running state', () => {
      expect(isSessionStopped('running')).toBe(false);
    });

    it('should return false for paused state', () => {
      expect(isSessionStopped('paused')).toBe(false);
    });

    it('should return true for stopped state', () => {
      expect(isSessionStopped('stopped')).toBe(true);
    });
  });

  describe('isSessionIdle', () => {
    it('should return true for idle state', () => {
      expect(isSessionIdle('idle')).toBe(true);
    });

    it('should return false for running state', () => {
      expect(isSessionIdle('running')).toBe(false);
    });

    it('should return false for paused state', () => {
      expect(isSessionIdle('paused')).toBe(false);
    });

    it('should return false for stopped state', () => {
      expect(isSessionIdle('stopped')).toBe(false);
    });
  });

  describe('formatTime', () => {
    it('should format 0 seconds as 00:00', () => {
      expect(formatTime(0)).toBe('00:00');
    });

    it('should format 30 seconds as 00:30', () => {
      expect(formatTime(30)).toBe('00:30');
    });

    it('should format 60 seconds as 01:00', () => {
      expect(formatTime(60)).toBe('01:00');
    });

    it('should format 90 seconds as 01:30', () => {
      expect(formatTime(90)).toBe('01:30');
    });

    it('should format 3600 seconds as 60:00', () => {
      expect(formatTime(3600)).toBe('60:00');
    });

    it('should handle negative numbers using absolute value', () => {
      expect(formatTime(-60)).toBe('01:00');
    });
  });

  describe('formatTimeLong', () => {
    it('should format short durations as MM:SS', () => {
      expect(formatTimeLong(90)).toBe('01:30');
    });

    it('should format 3600 seconds as 01:00:00', () => {
      expect(formatTimeLong(3600)).toBe('01:00:00');
    });

    it('should format 3661 seconds as 01:01:01', () => {
      expect(formatTimeLong(3661)).toBe('01:01:01');
    });

    it('should format 7200 seconds as 02:00:00', () => {
      expect(formatTimeLong(7200)).toBe('02:00:00');
    });
  });

  describe('createSessionStateMachine', () => {
    it('should return a SessionStateMachine instance', () => {
      const machine = createSessionStateMachine();
      expect(machine).toBeInstanceOf(SessionStateMachine);
      machine.destroy();
    });
  });

  describe('SessionStateMachine Instance', () => {
    let machine: InstanceType<typeof SessionStateMachine>;

    beforeEach(() => {
      machine = new SessionStateMachine();
    });

    afterEach(() => {
      machine.destroy();
    });

    describe('Initial State', () => {
      it('should start in idle state', () => {
        expect(machine.getState()).toBe('idle');
      });

      it('should have null config initially', () => {
        expect(machine.getConfig()).toBe(null);
      });

      it('should have 0 elapsed seconds initially', () => {
        expect(machine.getTimerState().elapsedSeconds).toBe(0);
      });

      it('should have null remaining seconds initially', () => {
        expect(machine.getTimerState().remainingSeconds).toBe(null);
      });

      it('should not be complete initially', () => {
        expect(machine.getTimerState().isComplete).toBe(false);
      });
    });

    describe('setConfig', () => {
      it('should set config in idle state', () => {
        const config = {
          type: 'custom' as const,
          duration_minutes: 5,
          entrainment_freq: 6,
          volume: 50,
          target_zscore: 1.5,
          closed_loop_behavior: 'maintain_level' as const,
        };
        machine.setConfig(config);
        expect(machine.getConfig()).toEqual(config);
      });

      it('should set remaining seconds from config', () => {
        const config = {
          type: 'custom' as const,
          duration_minutes: 5,
          entrainment_freq: 6,
          volume: 50,
          target_zscore: 1.5,
          closed_loop_behavior: 'maintain_level' as const,
        };
        machine.setConfig(config);
        expect(machine.getTimerState().remainingSeconds).toBe(300);
      });

      it('should throw error when not in idle state', () => {
        const config = {
          type: 'custom' as const,
          duration_minutes: 5,
          entrainment_freq: 6,
          volume: 50,
          target_zscore: 1.5,
          closed_loop_behavior: 'maintain_level' as const,
        };
        machine.setConfig(config);
        machine.start();
        expect(() => machine.setConfig(config)).toThrow(
          'Cannot set config while session is active'
        );
      });
    });

    describe('State Transitions', () => {
      it('should transition from idle to running on start', () => {
        const result = machine.start();
        expect(result.success).toBe(true);
        expect(result.previousState).toBe('idle');
        expect(result.newState).toBe('running');
        expect(machine.getState()).toBe('running');
      });

      it('should transition from running to paused on pause', () => {
        machine.start();
        const result = machine.pause();
        expect(result.success).toBe(true);
        expect(result.previousState).toBe('running');
        expect(result.newState).toBe('paused');
        expect(machine.getState()).toBe('paused');
      });

      it('should transition from paused to running on resume', () => {
        machine.start();
        machine.pause();
        const result = machine.resume();
        expect(result.success).toBe(true);
        expect(result.previousState).toBe('paused');
        expect(result.newState).toBe('running');
        expect(machine.getState()).toBe('running');
      });

      it('should transition from running to stopped on stop', () => {
        machine.start();
        const result = machine.stop();
        expect(result.success).toBe(true);
        expect(result.previousState).toBe('running');
        expect(result.newState).toBe('stopped');
        expect(machine.getState()).toBe('stopped');
      });

      it('should transition from paused to stopped on stop', () => {
        machine.start();
        machine.pause();
        const result = machine.stop();
        expect(result.success).toBe(true);
        expect(result.previousState).toBe('paused');
        expect(result.newState).toBe('stopped');
        expect(machine.getState()).toBe('stopped');
      });

      it('should transition from stopped to idle on reset', () => {
        machine.start();
        machine.stop();
        const result = machine.reset();
        expect(result.success).toBe(true);
        expect(result.newState).toBe('idle');
        expect(machine.getState()).toBe('idle');
      });
    });

    describe('Invalid Transitions', () => {
      it('should fail to pause from idle', () => {
        const result = machine.pause();
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid transition');
        expect(machine.getState()).toBe('idle');
      });

      it('should fail to resume from idle', () => {
        const result = machine.resume();
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid transition');
        expect(machine.getState()).toBe('idle');
      });

      it('should fail to stop from idle', () => {
        const result = machine.stop();
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid transition');
        expect(machine.getState()).toBe('idle');
      });

      it('should fail to start from running', () => {
        machine.start();
        const result = machine.start();
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid transition');
        expect(machine.getState()).toBe('running');
      });

      it('should fail to start from stopped', () => {
        machine.start();
        machine.stop();
        const result = machine.start();
        expect(result.success).toBe(false);
        expect(result.error).toContain('Invalid transition');
        expect(machine.getState()).toBe('stopped');
      });
    });

    describe('Listeners', () => {
      it('should call state listeners on transition', () => {
        const listener = jest.fn();
        machine.addStateListener(listener);
        machine.start();
        expect(listener).toHaveBeenCalledWith('running', 'idle', 'START');
      });

      it('should allow removing state listeners', () => {
        const listener = jest.fn();
        const unsubscribe = machine.addStateListener(listener);
        unsubscribe();
        machine.start();
        expect(listener).not.toHaveBeenCalled();
      });

      it('should call completion listeners on stop', () => {
        const listener = jest.fn();
        machine.addCompletionListener(listener);
        machine.start();
        machine.stop();
        expect(listener).toHaveBeenCalled();
        expect(listener.mock.calls[0][0]).toHaveProperty('session_type');
        expect(listener.mock.calls[0][0]).toHaveProperty('start_time');
        expect(listener.mock.calls[0][0]).toHaveProperty('end_time');
        expect(listener.mock.calls[0][0]).toHaveProperty('duration_seconds');
      });

      it('should allow removing completion listeners', () => {
        const listener = jest.fn();
        const unsubscribe = machine.addCompletionListener(listener);
        unsubscribe();
        machine.start();
        machine.stop();
        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('Reset Behavior', () => {
      it('should reset timer state when already idle', () => {
        const result = machine.reset();
        expect(result.success).toBe(true);
        expect(machine.getTimerState().elapsedSeconds).toBe(0);
      });

      it('should force stop and reset from running', () => {
        machine.start();
        const result = machine.reset();
        expect(result.success).toBe(true);
        expect(machine.getState()).toBe('idle');
      });

      it('should force stop and reset from paused', () => {
        machine.start();
        machine.pause();
        const result = machine.reset();
        expect(result.success).toBe(true);
        expect(machine.getState()).toBe('idle');
      });
    });
  });
});
