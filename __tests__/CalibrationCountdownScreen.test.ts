/**
 * Comprehensive tests for CalibrationCountdownScreen
 *
 * Tests cover:
 * - File structure and exports
 * - Required imports and dependencies
 * - Props interface
 * - CountdownState type
 * - Helper functions
 * - Context integration
 * - State management
 * - Event handlers
 * - Animation implementation
 * - Accessibility features
 * - UI elements
 * - Styling
 * - Theme integration
 */

import * as fs from 'fs';
import * as path from 'path';

const SCREEN_PATH = path.join(
  __dirname,
  '../src/screens/CalibrationCountdownScreen.tsx'
);
const INDEX_PATH = path.join(__dirname, '../src/screens/index.ts');

describe('CalibrationCountdownScreen', () => {
  let screenContent: string;
  let indexContent: string;

  beforeAll(() => {
    screenContent = fs.readFileSync(SCREEN_PATH, 'utf-8');
    indexContent = fs.readFileSync(INDEX_PATH, 'utf-8');
  });

  // =============================================
  // FILE STRUCTURE AND EXPORTS
  // =============================================
  describe('File Structure and Exports', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(SCREEN_PATH)).toBe(true);
    });

    it('should export CalibrationCountdownScreen component', () => {
      expect(screenContent).toMatch(
        /export\s+(const|function)\s+CalibrationCountdownScreen/
      );
    });

    it('should have default export', () => {
      expect(screenContent).toMatch(
        /export\s+default\s+CalibrationCountdownScreen/
      );
    });

    it('should export CalibrationCountdownScreenProps interface', () => {
      expect(screenContent).toMatch(
        /export\s+interface\s+CalibrationCountdownScreenProps/
      );
    });

    it('should export CountdownState type', () => {
      expect(screenContent).toMatch(/export\s+type\s+CountdownState/);
    });

    it('should export DEFAULT_COUNTDOWN_DURATION constant', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+DEFAULT_COUNTDOWN_DURATION/
      );
    });

    it('should export helper functions', () => {
      expect(screenContent).toMatch(/export\s+const\s+formatCountdownTime/);
      expect(screenContent).toMatch(/export\s+const\s+formatCountdownLabel/);
      expect(screenContent).toMatch(/export\s+const\s+getCountdownProgress/);
      expect(screenContent).toMatch(
        /export\s+const\s+getCountdownSignalStatus/
      );
      expect(screenContent).toMatch(/export\s+const\s+getCountdownInstruction/);
      expect(screenContent).toMatch(/export\s+const\s+getCountdownStateColor/);
      expect(screenContent).toMatch(
        /export\s+const\s+getCountdownAccessibilityLabel/
      );
    });
  });

  // =============================================
  // INDEX FILE EXPORTS
  // =============================================
  describe('Index File Exports', () => {
    it('should export CalibrationCountdownScreen from index', () => {
      expect(indexContent).toContain('CalibrationCountdownScreen');
    });

    it('should export DEFAULT_COUNTDOWN_DURATION from index', () => {
      expect(indexContent).toContain('DEFAULT_COUNTDOWN_DURATION');
    });

    it('should export helper functions from index', () => {
      expect(indexContent).toContain('formatCountdownTime');
      expect(indexContent).toContain('formatCountdownLabel');
      expect(indexContent).toContain('getCountdownProgress');
      expect(indexContent).toContain('getCountdownSignalStatus');
      expect(indexContent).toContain('getCountdownInstruction');
      expect(indexContent).toContain('getCountdownStateColor');
      expect(indexContent).toContain('getCountdownAccessibilityLabel');
    });

    it('should export CountdownState type from index', () => {
      expect(indexContent).toContain('CountdownState');
    });

    it('should export CalibrationCountdownScreenProps type from index', () => {
      expect(indexContent).toContain('CalibrationCountdownScreenProps');
    });
  });

  // =============================================
  // REQUIRED IMPORTS
  // =============================================
  describe('Required Imports', () => {
    it('should import React and hooks', () => {
      expect(screenContent).toMatch(/import\s+React.*from\s+['"]react['"]/);
      expect(screenContent).toContain('useState');
      expect(screenContent).toContain('useRef');
      expect(screenContent).toContain('useEffect');
      expect(screenContent).toContain('useCallback');
    });

    it('should import React Native components', () => {
      expect(screenContent).toContain('View');
      expect(screenContent).toContain('Text');
      expect(screenContent).toContain('StyleSheet');
      expect(screenContent).toContain('TouchableOpacity');
      expect(screenContent).toContain('Animated');
      expect(screenContent).toContain('Platform');
      expect(screenContent).toContain('Dimensions');
      expect(screenContent).toContain('Alert');
    });

    it('should import theme constants', () => {
      expect(screenContent).toContain('Colors');
      expect(screenContent).toContain('Spacing');
      expect(screenContent).toContain('BorderRadius');
      expect(screenContent).toContain('Typography');
      expect(screenContent).toContain('Shadows');
    });

    it('should import DeviceContext', () => {
      expect(screenContent).toContain('useDevice');
    });

    it('should import SessionContext', () => {
      expect(screenContent).toContain('useSession');
    });

    it('should import SignalQuality type', () => {
      expect(screenContent).toContain('SignalQuality');
    });
  });

  // =============================================
  // CountdownState TYPE
  // =============================================
  describe('CountdownState Type', () => {
    it('should include waiting state', () => {
      expect(screenContent).toMatch(/CountdownState\s*=\s*['"]waiting['"]/);
    });

    it('should include counting state', () => {
      expect(screenContent).toMatch(/CountdownState[\s\S]*?['"]counting['"]/);
    });

    it('should include complete state', () => {
      expect(screenContent).toMatch(/CountdownState[\s\S]*?['"]complete['"]/);
    });

    it('should include cancelled state', () => {
      expect(screenContent).toMatch(/CountdownState[\s\S]*?['"]cancelled['"]/);
    });
  });

  // =============================================
  // CalibrationCountdownScreenProps INTERFACE
  // =============================================
  describe('CalibrationCountdownScreenProps Interface', () => {
    it('should have optional onCountdownComplete prop', () => {
      expect(screenContent).toMatch(
        /onCountdownComplete\??:\s*\(\)\s*=>\s*void/
      );
    });

    it('should have optional onCancel prop', () => {
      expect(screenContent).toMatch(/onCancel\??:\s*\(\)\s*=>\s*void/);
    });

    it('should have optional duration prop', () => {
      expect(screenContent).toMatch(/duration\??:\s*number/);
    });

    it('should have optional testID prop', () => {
      expect(screenContent).toMatch(/testID\??:\s*string/);
    });
  });

  // =============================================
  // DEFAULT_COUNTDOWN_DURATION CONSTANT
  // =============================================
  describe('DEFAULT_COUNTDOWN_DURATION Constant', () => {
    it('should be defined as 30 seconds', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+DEFAULT_COUNTDOWN_DURATION\s*=\s*30/
      );
    });

    it('should have documentation comment', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Default countdown duration[\s\S]*?\*\/[\s\S]*?DEFAULT_COUNTDOWN_DURATION/
      );
    });
  });

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  describe('Helper Functions', () => {
    describe('formatCountdownTime', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+formatCountdownTime\s*=/
        );
      });

      it('should accept seconds parameter as number', () => {
        expect(screenContent).toMatch(
          /formatCountdownTime\s*=\s*\(\s*seconds:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatCountdownTime[\s\S]*?:\s*string/);
      });

      it('should handle negative values', () => {
        expect(screenContent).toMatch(
          /formatCountdownTime[\s\S]*?if\s*\(\s*seconds\s*<\s*0\s*\)/
        );
      });

      it('should use padStart for formatting', () => {
        expect(screenContent).toMatch(
          /formatCountdownTime[\s\S]*?padStart\s*\(\s*2/
        );
      });
    });

    describe('formatCountdownLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+formatCountdownLabel\s*=/
        );
      });

      it('should accept seconds parameter', () => {
        expect(screenContent).toMatch(
          /formatCountdownLabel\s*=\s*\(\s*seconds:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatCountdownLabel[\s\S]*?:\s*string/);
      });

      it('should handle zero or negative', () => {
        expect(screenContent).toMatch(
          /formatCountdownLabel[\s\S]*?if\s*\(\s*seconds\s*<=\s*0\s*\)/
        );
      });

      it('should handle singular second', () => {
        expect(screenContent).toMatch(
          /formatCountdownLabel[\s\S]*?if\s*\(\s*seconds\s*===\s*1\s*\)/
        );
      });

      it('should handle less than 60 seconds', () => {
        expect(screenContent).toMatch(
          /formatCountdownLabel[\s\S]*?if\s*\(\s*seconds\s*<\s*60\s*\)/
        );
      });
    });

    describe('getCountdownProgress', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCountdownProgress\s*=/
        );
      });

      it('should accept remaining and total parameters', () => {
        expect(screenContent).toMatch(
          /getCountdownProgress\s*=\s*\(\s*remaining:\s*number\s*,\s*total:\s*number/
        );
      });

      it('should return number', () => {
        expect(screenContent).toMatch(/getCountdownProgress[\s\S]*?:\s*number/);
      });

      it('should handle zero total', () => {
        expect(screenContent).toMatch(
          /getCountdownProgress[\s\S]*?if\s*\(\s*total\s*<=\s*0\s*\)/
        );
      });

      it('should clamp result between 0 and 100', () => {
        expect(screenContent).toMatch(
          /getCountdownProgress[\s\S]*?Math\.min\s*\(\s*100[\s\S]*?Math\.max\s*\(\s*0/
        );
      });
    });

    describe('getCountdownSignalStatus', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCountdownSignalStatus\s*=/
        );
      });

      it('should accept SignalQuality parameter', () => {
        expect(screenContent).toMatch(
          /getCountdownSignalStatus\s*=\s*\(\s*quality:\s*SignalQuality\s*\|\s*null/
        );
      });

      it('should return object with label, color, and isGood', () => {
        expect(screenContent).toMatch(
          /getCountdownSignalStatus[\s\S]*?:\s*\{\s*label:\s*string;\s*color:\s*string;\s*isGood:\s*boolean\s*\}/
        );
      });

      it('should handle null quality', () => {
        expect(screenContent).toMatch(
          /getCountdownSignalStatus[\s\S]*?if\s*\(\s*!quality/
        );
      });

      it('should handle different score thresholds', () => {
        expect(screenContent).toMatch(
          /getCountdownSignalStatus[\s\S]*?score\s*>=\s*80/
        );
        expect(screenContent).toMatch(
          /getCountdownSignalStatus[\s\S]*?score\s*>=\s*60/
        );
        expect(screenContent).toMatch(
          /getCountdownSignalStatus[\s\S]*?score\s*>=\s*40/
        );
        expect(screenContent).toMatch(
          /getCountdownSignalStatus[\s\S]*?score\s*>=\s*20/
        );
      });
    });

    describe('getCountdownInstruction', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCountdownInstruction\s*=/
        );
      });

      it('should accept state and remaining parameters', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction\s*=\s*\(\s*state:\s*CountdownState\s*,\s*remaining:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?:\s*string/
        );
      });

      it('should handle waiting state', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?case\s*['"]waiting['"]/
        );
      });

      it('should handle counting state', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?case\s*['"]counting['"]/
        );
      });

      it('should handle complete state', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?case\s*['"]complete['"]/
        );
      });

      it('should handle cancelled state', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?case\s*['"]cancelled['"]/
        );
      });

      it('should provide different messages based on remaining time', () => {
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?remaining\s*>\s*20/
        );
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?remaining\s*>\s*10/
        );
        expect(screenContent).toMatch(
          /getCountdownInstruction[\s\S]*?remaining\s*>\s*5/
        );
      });
    });

    describe('getCountdownStateColor', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCountdownStateColor\s*=/
        );
      });

      it('should accept CountdownState parameter', () => {
        expect(screenContent).toMatch(
          /getCountdownStateColor\s*=\s*\(\s*state:\s*CountdownState/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?:\s*string/
        );
      });

      it('should handle all states', () => {
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?case\s*['"]waiting['"]/
        );
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?case\s*['"]counting['"]/
        );
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?case\s*['"]complete['"]/
        );
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?case\s*['"]cancelled['"]/
        );
      });

      it('should use theme colors', () => {
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?Colors\.primary\.main/
        );
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?Colors\.accent\.success/
        );
        expect(screenContent).toMatch(
          /getCountdownStateColor[\s\S]*?Colors\.accent\.error/
        );
      });
    });

    describe('getCountdownAccessibilityLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCountdownAccessibilityLabel\s*=/
        );
      });

      it('should accept state and remaining parameters', () => {
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel\s*=\s*\(\s*state:\s*CountdownState\s*,\s*remaining:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel[\s\S]*?:\s*string/
        );
      });

      it('should handle all states', () => {
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel[\s\S]*?case\s*['"]waiting['"]/
        );
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel[\s\S]*?case\s*['"]counting['"]/
        );
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel[\s\S]*?case\s*['"]complete['"]/
        );
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel[\s\S]*?case\s*['"]cancelled['"]/
        );
      });

      it('should include remaining seconds in counting label', () => {
        expect(screenContent).toMatch(
          /getCountdownAccessibilityLabel[\s\S]*?counting[\s\S]*?\$\{remaining\}/
        );
      });
    });
  });

  // =============================================
  // CONTEXT INTEGRATION
  // =============================================
  describe('Context Integration', () => {
    it('should use useDevice hook', () => {
      expect(screenContent).toMatch(/const\s*\{[\s\S]*?\}\s*=\s*useDevice\(\)/);
    });

    it('should use useSession hook', () => {
      expect(screenContent).toMatch(
        /const\s*\{[\s\S]*?\}\s*=\s*useSession\(\)/
      );
    });

    it('should get signalQuality from DeviceContext', () => {
      expect(screenContent).toMatch(
        /const\s*\{[\s\S]*?signalQuality[\s\S]*?\}\s*=\s*useDevice/
      );
    });

    it('should get setCalibrationState from SessionContext', () => {
      expect(screenContent).toMatch(
        /const\s*\{[\s\S]*?setCalibrationState[\s\S]*?\}\s*=\s*useSession/
      );
    });
  });

  // =============================================
  // STATE MANAGEMENT
  // =============================================
  describe('State Management', () => {
    it('should have countdownState state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*countdownState\s*,\s*setCountdownState\s*\]\s*=\s*useState/
      );
    });

    it('should have remainingSeconds state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*remainingSeconds\s*,\s*setRemainingSeconds\s*\]\s*=\s*useState/
      );
    });

    it('should have isPaused state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*isPaused\s*,\s*setIsPaused\s*\]\s*=\s*useState/
      );
    });

    it('should initialize countdownState to waiting', () => {
      expect(screenContent).toMatch(
        /useState<CountdownState>\s*\(\s*['"]waiting['"]\s*\)/
      );
    });

    it('should initialize remainingSeconds with duration prop', () => {
      expect(screenContent).toMatch(/useState<number>\s*\(\s*duration\s*\)/);
    });

    it('should initialize isPaused to false', () => {
      expect(screenContent).toMatch(/useState<boolean>\s*\(\s*false\s*\)/);
    });
  });

  // =============================================
  // ANIMATION REFS
  // =============================================
  describe('Animation Refs', () => {
    it('should have fadeAnim ref', () => {
      expect(screenContent).toMatch(
        /const\s+fadeAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value\s*\(\s*0\s*\)/
      );
    });

    it('should have scaleAnim ref', () => {
      expect(screenContent).toMatch(
        /const\s+scaleAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value/
      );
    });

    it('should have progressAnim ref', () => {
      expect(screenContent).toMatch(
        /const\s+progressAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value/
      );
    });

    it('should have pulseAnim ref', () => {
      expect(screenContent).toMatch(
        /const\s+pulseAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value/
      );
    });

    it('should have timerRef for interval', () => {
      expect(screenContent).toMatch(/const\s+timerRef\s*=\s*useRef/);
    });
  });

  // =============================================
  // ANIMATION FUNCTIONS
  // =============================================
  describe('Animation Functions', () => {
    it('should have startEntranceAnimation function', () => {
      expect(screenContent).toMatch(
        /const\s+startEntranceAnimation\s*=\s*useCallback/
      );
    });

    it('should have startPulseAnimation function', () => {
      expect(screenContent).toMatch(
        /const\s+startPulseAnimation\s*=\s*useCallback/
      );
    });

    it('should have stopPulseAnimation function', () => {
      expect(screenContent).toMatch(
        /const\s+stopPulseAnimation\s*=\s*useCallback/
      );
    });

    it('should have updateProgressAnimation function', () => {
      expect(screenContent).toMatch(
        /const\s+updateProgressAnimation\s*=\s*useCallback/
      );
    });

    it('should use Animated.parallel for entrance', () => {
      expect(screenContent).toMatch(
        /startEntranceAnimation[\s\S]*?Animated\.parallel/
      );
    });

    it('should use Animated.loop for pulse', () => {
      expect(screenContent).toMatch(
        /startPulseAnimation[\s\S]*?Animated\.loop/
      );
    });

    it('should use Animated.sequence for pulse', () => {
      expect(screenContent).toMatch(
        /startPulseAnimation[\s\S]*?Animated\.sequence/
      );
    });
  });

  // =============================================
  // EVENT HANDLERS
  // =============================================
  describe('Event Handlers', () => {
    it('should have startCountdown handler', () => {
      expect(screenContent).toMatch(/const\s+startCountdown\s*=\s*useCallback/);
    });

    it('should have pauseCountdown handler', () => {
      expect(screenContent).toMatch(/const\s+pauseCountdown\s*=\s*useCallback/);
    });

    it('should have resumeCountdown handler', () => {
      expect(screenContent).toMatch(
        /const\s+resumeCountdown\s*=\s*useCallback/
      );
    });

    it('should have handleCancel handler', () => {
      expect(screenContent).toMatch(/const\s+handleCancel\s*=\s*useCallback/);
    });

    it('should have handleComplete handler', () => {
      expect(screenContent).toMatch(/const\s+handleComplete\s*=\s*useCallback/);
    });
  });

  // =============================================
  // TIMER LOGIC
  // =============================================
  describe('Timer Logic', () => {
    it('should use setInterval for countdown', () => {
      expect(screenContent).toMatch(/setInterval\s*\(/);
    });

    it('should use clearInterval for cleanup', () => {
      expect(screenContent).toMatch(/clearInterval\s*\(/);
    });

    it('should decrement remainingSeconds', () => {
      expect(screenContent).toMatch(
        /setRemainingSeconds\s*\(\s*\(\s*prev\s*\)\s*=>/
      );
    });

    it('should check for countdown completion', () => {
      expect(screenContent).toMatch(/remainingSeconds\s*<=\s*0/);
    });

    it('should call handleComplete when countdown reaches zero', () => {
      expect(screenContent).toMatch(
        /useEffect[\s\S]*?remainingSeconds\s*<=\s*0[\s\S]*?handleComplete/
      );
    });
  });

  // =============================================
  // ALERT DIALOGS
  // =============================================
  describe('Alert Dialogs', () => {
    it('should show cancel confirmation alert', () => {
      expect(screenContent).toMatch(
        /Alert\.alert\s*\(\s*['"]Cancel Calibration\?['"]/
      );
    });

    it('should have Continue button in alert', () => {
      expect(screenContent).toMatch(/text:\s*['"]Continue['"]/);
    });

    it('should have Cancel button in alert', () => {
      expect(screenContent).toMatch(
        /text:\s*['"]Cancel['"][\s\S]*?style:\s*['"]destructive['"]/
      );
    });
  });

  // =============================================
  // RENDER FUNCTIONS
  // =============================================
  describe('Render Functions', () => {
    it('should have renderCountdownCircle function', () => {
      expect(screenContent).toMatch(/const\s+renderCountdownCircle\s*=/);
    });

    it('should have renderSignalIndicator function', () => {
      expect(screenContent).toMatch(/const\s+renderSignalIndicator\s*=/);
    });

    it('should have renderInstruction function', () => {
      expect(screenContent).toMatch(/const\s+renderInstruction\s*=/);
    });

    it('should have renderProgressBar function', () => {
      expect(screenContent).toMatch(/const\s+renderProgressBar\s*=/);
    });

    it('should have renderTips function', () => {
      expect(screenContent).toMatch(/const\s+renderTips\s*=/);
    });
  });

  // =============================================
  // UI ELEMENTS
  // =============================================
  describe('UI Elements', () => {
    it('should have header section', () => {
      expect(screenContent).toContain('styles.header');
    });

    it('should have cancel button', () => {
      expect(screenContent).toContain('styles.cancelButton');
    });

    it('should have header title', () => {
      expect(screenContent).toContain('styles.headerTitle');
      expect(screenContent).toContain('Settle Period');
    });

    it('should have title section', () => {
      expect(screenContent).toContain('styles.titleSection');
      expect(screenContent).toContain('Preparing for Calibration');
    });

    it('should have countdown circle container', () => {
      expect(screenContent).toContain('styles.countdownCircleContainer');
    });

    it('should have circle background', () => {
      expect(screenContent).toContain('styles.circleBackground');
    });

    it('should have circle progress', () => {
      expect(screenContent).toContain('styles.circleProgress');
    });

    it('should have countdown time display', () => {
      expect(screenContent).toContain('styles.countdownTime');
    });

    it('should have countdown label', () => {
      expect(screenContent).toContain('styles.countdownLabel');
    });

    it('should have instruction container', () => {
      expect(screenContent).toContain('styles.instructionContainer');
    });

    it('should have signal container', () => {
      expect(screenContent).toContain('styles.signalContainer');
    });

    it('should have progress bar container', () => {
      expect(screenContent).toContain('styles.progressBarContainer');
    });

    it('should have tips container', () => {
      expect(screenContent).toContain('styles.tipsContainer');
    });

    it('should have footer section', () => {
      expect(screenContent).toContain('styles.footer');
    });

    it('should have pause button', () => {
      expect(screenContent).toContain('styles.pauseButton');
    });

    it('should have resume button', () => {
      expect(screenContent).toContain('styles.resumeButton');
    });
  });

  // =============================================
  // COUNTDOWN CIRCLE
  // =============================================
  describe('Countdown Circle', () => {
    it('should calculate circle size based on screen width', () => {
      expect(screenContent).toMatch(/circleSize\s*=\s*SCREEN_WIDTH\s*\*/);
    });

    it('should use pulseAnim for scale transform', () => {
      expect(screenContent).toMatch(
        /transform:\s*\[\s*\{\s*scale:\s*pulseAnim\s*\}/
      );
    });

    it('should display countdown time', () => {
      expect(screenContent).toMatch(
        /formatCountdownTime\s*\(\s*remainingSeconds\s*\)/
      );
    });

    it('should display countdown label', () => {
      expect(screenContent).toMatch(
        /formatCountdownLabel\s*\(\s*remainingSeconds\s*\)/
      );
    });
  });

  // =============================================
  // SIGNAL INDICATOR
  // =============================================
  describe('Signal Indicator', () => {
    it('should show signal dot', () => {
      expect(screenContent).toContain('styles.signalDot');
    });

    it('should show signal label', () => {
      expect(screenContent).toContain('styles.signalLabel');
      expect(screenContent).toContain('Signal Quality:');
    });

    it('should show signal value', () => {
      expect(screenContent).toContain('styles.signalValue');
    });

    it('should show warning when signal is not good', () => {
      expect(screenContent).toMatch(
        /\{!signalStatus\.isGood[\s\S]*?signalWarning/
      );
    });
  });

  // =============================================
  // TIPS CONTENT
  // =============================================
  describe('Tips Content', () => {
    it('should have tips title', () => {
      expect(screenContent).toContain('styles.tipsTitle');
      expect(screenContent).toContain('During this time:');
    });

    it('should have tip about eyes closed', () => {
      expect(screenContent).toContain('Keep your eyes closed');
    });

    it('should have tip about breathing', () => {
      expect(screenContent).toContain('Breathe slowly and naturally');
    });

    it('should have tip about movement', () => {
      expect(screenContent).toContain('Minimize movement');
    });

    it('should have tip about thoughts', () => {
      expect(screenContent).toContain('Let your thoughts drift');
    });
  });

  // =============================================
  // ACCESSIBILITY
  // =============================================
  describe('Accessibility Features', () => {
    it('should have accessibility role on buttons', () => {
      expect(screenContent).toMatch(/accessibilityRole=["']button["']/);
    });

    it('should have accessibility label on cancel button', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=["']Cancel countdown["']/
      );
    });

    it('should have accessibility label on pause button', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=["']Pause countdown["']/
      );
    });

    it('should have accessibility label on resume button', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=["']Resume countdown["']/
      );
    });

    it('should have accessibility label on countdown time', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=\{getCountdownAccessibilityLabel/
      );
    });
  });

  // =============================================
  // TEST IDs
  // =============================================
  describe('Test IDs', () => {
    it('should have testID on container', () => {
      expect(screenContent).toMatch(/testID=\{testID\}/);
    });

    it('should have testID on cancel button', () => {
      expect(screenContent).toMatch(/testID=["']cancel-button["']/);
    });

    it('should have testID on countdown circle', () => {
      expect(screenContent).toMatch(/testID=["']countdown-circle["']/);
    });

    it('should have testID on countdown time', () => {
      expect(screenContent).toMatch(/testID=["']countdown-time["']/);
    });

    it('should have testID on countdown label', () => {
      expect(screenContent).toMatch(/testID=["']countdown-label["']/);
    });

    it('should have testID on signal indicator', () => {
      expect(screenContent).toMatch(/testID=["']signal-indicator["']/);
    });

    it('should have testID on instruction', () => {
      expect(screenContent).toMatch(/testID=["']instruction["']/);
    });

    it('should have testID on progress bar', () => {
      expect(screenContent).toMatch(/testID=["']progress-bar["']/);
    });

    it('should have testID on tips', () => {
      expect(screenContent).toMatch(/testID=["']tips["']/);
    });

    it('should have testID on pause button', () => {
      expect(screenContent).toMatch(/testID=["']pause-button["']/);
    });

    it('should have testID on resume button', () => {
      expect(screenContent).toMatch(/testID=["']resume-button["']/);
    });
  });

  // =============================================
  // STYLING
  // =============================================
  describe('Styling', () => {
    it('should have container style', () => {
      expect(screenContent).toMatch(/container:\s*\{[\s\S]*?flex:\s*1/);
    });

    it('should use Colors.background.primary for container', () => {
      expect(screenContent).toMatch(
        /container:[\s\S]*?backgroundColor:\s*Colors\.background\.primary/
      );
    });

    it('should have header style', () => {
      expect(screenContent).toMatch(
        /header:\s*\{[\s\S]*?flexDirection:\s*['"]row['"]/
      );
    });

    it('should have countdownCircleContainer style', () => {
      expect(screenContent).toMatch(
        /countdownCircleContainer:\s*\{[\s\S]*?alignItems/
      );
    });

    it('should have countdownTime style', () => {
      expect(screenContent).toMatch(/countdownTime:\s*\{[\s\S]*?fontSize/);
    });

    it('should use tabular-nums for countdown time', () => {
      expect(screenContent).toMatch(
        /countdownTime:[\s\S]*?fontVariant:\s*\[['"]tabular-nums['"]\]/
      );
    });

    it('should have pauseButton style', () => {
      expect(screenContent).toMatch(/pauseButton:\s*\{[\s\S]*?backgroundColor/);
    });

    it('should have resumeButton style', () => {
      expect(screenContent).toMatch(
        /resumeButton:\s*\{[\s\S]*?backgroundColor:\s*Colors\.primary\.main/
      );
    });

    it('should use Shadows in styles', () => {
      expect(screenContent).toMatch(/\.\.\.Shadows\.sm/);
    });

    it('should use BorderRadius in styles', () => {
      expect(screenContent).toMatch(/borderRadius:\s*BorderRadius\./);
    });

    it('should use Typography in styles', () => {
      expect(screenContent).toMatch(/fontSize:\s*Typography\.fontSize\./);
      expect(screenContent).toMatch(/fontWeight:\s*Typography\.fontWeight\./);
    });

    it('should use Spacing in styles', () => {
      expect(screenContent).toMatch(/padding:\s*Spacing\./);
      expect(screenContent).toMatch(/marginBottom:\s*Spacing\./);
    });
  });

  // =============================================
  // PLATFORM SPECIFIC
  // =============================================
  describe('Platform Specific', () => {
    it('should use Platform.OS for conditional styling', () => {
      expect(screenContent).toMatch(/Platform\.OS\s*===\s*['"]ios['"]/);
    });

    it('should adjust padding based on platform', () => {
      expect(screenContent).toMatch(
        /paddingTop:\s*Platform\.OS\s*===\s*['"]ios['"].*Spacing/
      );
    });
  });

  // =============================================
  // DEFAULT PROPS
  // =============================================
  describe('Default Props', () => {
    it('should have default duration from DEFAULT_COUNTDOWN_DURATION', () => {
      expect(screenContent).toMatch(
        /duration\s*=\s*DEFAULT_COUNTDOWN_DURATION/
      );
    });

    it('should have default testID', () => {
      expect(screenContent).toMatch(
        /testID\s*=\s*['"]calibration-countdown-screen['"]/
      );
    });
  });

  // =============================================
  // CALIBRATION STATE TRANSITIONS
  // =============================================
  describe('Calibration State Transitions', () => {
    it('should set calibration state to recording on complete', () => {
      expect(screenContent).toMatch(
        /handleComplete[\s\S]*?setCalibrationState\s*\(\s*['"]recording['"]\s*\)/
      );
    });

    it('should set calibration state to null on cancel', () => {
      expect(screenContent).toMatch(
        /handleCancel[\s\S]*?setCalibrationState\s*\(\s*null\s*\)/
      );
    });

    it('should call onCountdownComplete callback', () => {
      expect(screenContent).toMatch(
        /handleComplete[\s\S]*?if\s*\(\s*onCountdownComplete\s*\)/
      );
    });

    it('should call onCancel callback', () => {
      expect(screenContent).toMatch(
        /handleCancel[\s\S]*?if\s*\(\s*onCancel\s*\)/
      );
    });
  });

  // =============================================
  // FOOTER CONTENT
  // =============================================
  describe('Footer Content', () => {
    it('should show footer note', () => {
      expect(screenContent).toContain('styles.footerNote');
      expect(screenContent).toContain(
        'Calibration will begin automatically when complete'
      );
    });

    it('should conditionally show pause button', () => {
      expect(screenContent).toMatch(
        /countdownState\s*===\s*['"]counting['"][\s\S]*?!isPaused[\s\S]*?pauseButton/
      );
    });

    it('should conditionally show resume button', () => {
      expect(screenContent).toMatch(
        /countdownState\s*===\s*['"]counting['"][\s\S]*?isPaused[\s\S]*?resumeButton/
      );
    });
  });

  // =============================================
  // DOCUMENTATION
  // =============================================
  describe('Documentation', () => {
    it('should have component documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?CalibrationCountdownScreen component[\s\S]*?\*\//
      );
    });

    it('should have props documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Props for CalibrationCountdownScreen[\s\S]*?\*\//
      );
    });

    it('should have CountdownState documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Countdown state type[\s\S]*?\*\//
      );
    });

    it('should have helper function documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Format seconds as MM:SS[\s\S]*?\*\//
      );
    });
  });

  // =============================================
  // USEEFFECT HOOKS
  // =============================================
  describe('useEffect Hooks', () => {
    it('should have useEffect for initialization', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?startEntranceAnimation/
      );
    });

    it('should have useEffect for countdown completion', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?remainingSeconds[\s\S]*?handleComplete/
      );
    });

    it('should have useEffect for progress animation', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?updateProgressAnimation/
      );
    });

    it('should clean up timer on unmount', () => {
      expect(screenContent).toMatch(
        /return\s*\(\)\s*=>\s*\{[\s\S]*?clearInterval/
      );
    });
  });
});

// =============================================
// FUNCTIONAL TESTS
// =============================================
describe('CalibrationCountdownScreen Functional Tests', () => {
  describe('formatCountdownTime function', () => {
    const {
      formatCountdownTime,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should format 0 seconds as 00:00', () => {
      expect(formatCountdownTime(0)).toBe('00:00');
    });

    it('should format 30 seconds as 00:30', () => {
      expect(formatCountdownTime(30)).toBe('00:30');
    });

    it('should format 60 seconds as 01:00', () => {
      expect(formatCountdownTime(60)).toBe('01:00');
    });

    it('should format 90 seconds as 01:30', () => {
      expect(formatCountdownTime(90)).toBe('01:30');
    });

    it('should format 125 seconds as 02:05', () => {
      expect(formatCountdownTime(125)).toBe('02:05');
    });

    it('should return 00:00 for negative values', () => {
      expect(formatCountdownTime(-5)).toBe('00:00');
    });
  });

  describe('formatCountdownLabel function', () => {
    const {
      formatCountdownLabel,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should return Complete for 0', () => {
      expect(formatCountdownLabel(0)).toBe('Complete');
    });

    it('should return Complete for negative', () => {
      expect(formatCountdownLabel(-5)).toBe('Complete');
    });

    it('should return 1 second for 1', () => {
      expect(formatCountdownLabel(1)).toBe('1 second');
    });

    it('should return X seconds for values < 60', () => {
      expect(formatCountdownLabel(30)).toBe('30 seconds');
      expect(formatCountdownLabel(45)).toBe('45 seconds');
    });

    it('should return 1 minute for 60', () => {
      expect(formatCountdownLabel(60)).toBe('1 minute');
    });

    it('should return X minutes for exact minutes', () => {
      expect(formatCountdownLabel(120)).toBe('2 minutes');
    });

    it('should return formatted time for minutes and seconds', () => {
      const result = formatCountdownLabel(90);
      expect(result).toContain('1:30');
    });
  });

  describe('getCountdownProgress function', () => {
    const {
      getCountdownProgress,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should return 0 when remaining equals total', () => {
      expect(getCountdownProgress(30, 30)).toBe(0);
    });

    it('should return 100 when remaining is 0', () => {
      expect(getCountdownProgress(0, 30)).toBe(100);
    });

    it('should return 50 when half done', () => {
      expect(getCountdownProgress(15, 30)).toBe(50);
    });

    it('should return 100 for zero total', () => {
      expect(getCountdownProgress(10, 0)).toBe(100);
    });

    it('should clamp at 0', () => {
      expect(getCountdownProgress(40, 30)).toBe(0);
    });

    it('should clamp at 100', () => {
      expect(getCountdownProgress(-10, 30)).toBe(100);
    });
  });

  describe('getCountdownSignalStatus function', () => {
    const {
      getCountdownSignalStatus,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should return Unknown for null', () => {
      const result = getCountdownSignalStatus(null);
      expect(result.label).toBe('Unknown');
      expect(result.isGood).toBe(false);
    });

    it('should return Unknown for undefined overall_score', () => {
      const result = getCountdownSignalStatus({});
      expect(result.label).toBe('Unknown');
      expect(result.isGood).toBe(false);
    });

    it('should return Excellent for score >= 80', () => {
      const result = getCountdownSignalStatus({ overall_score: 85 });
      expect(result.label).toBe('Excellent');
      expect(result.isGood).toBe(true);
    });

    it('should return Good for score 60-79', () => {
      const result = getCountdownSignalStatus({ overall_score: 70 });
      expect(result.label).toBe('Good');
      expect(result.isGood).toBe(true);
    });

    it('should return Fair for score 40-59', () => {
      const result = getCountdownSignalStatus({ overall_score: 50 });
      expect(result.label).toBe('Fair');
      expect(result.isGood).toBe(true);
    });

    it('should return Poor for score 20-39', () => {
      const result = getCountdownSignalStatus({ overall_score: 25 });
      expect(result.label).toBe('Poor');
      expect(result.isGood).toBe(false);
    });

    it('should return Critical for score < 20', () => {
      const result = getCountdownSignalStatus({ overall_score: 10 });
      expect(result.label).toBe('Critical');
      expect(result.isGood).toBe(false);
    });
  });

  describe('getCountdownInstruction function', () => {
    const {
      getCountdownInstruction,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should return preparing message for waiting state', () => {
      expect(getCountdownInstruction('waiting', 30)).toContain('Preparing');
    });

    it('should return relax message for counting > 20', () => {
      expect(getCountdownInstruction('counting', 25)).toContain('relax');
    });

    it('should return breathe message for counting 11-20', () => {
      expect(getCountdownInstruction('counting', 15)).toContain('Breathe');
    });

    it('should return settle message for counting 6-10', () => {
      expect(getCountdownInstruction('counting', 8)).toContain('settle');
    });

    it('should return almost ready for counting <= 5', () => {
      expect(getCountdownInstruction('counting', 3)).toContain('Almost');
    });

    it('should return ready message for complete state', () => {
      expect(getCountdownInstruction('complete', 0)).toContain('Ready');
    });

    it('should return cancelled message for cancelled state', () => {
      expect(getCountdownInstruction('cancelled', 15)).toContain('cancelled');
    });
  });

  describe('getCountdownStateColor function', () => {
    const {
      getCountdownStateColor,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should return tertiary color for waiting', () => {
      expect(getCountdownStateColor('waiting')).toBe('#8891A0'); // Colors.text.tertiary
    });

    it('should return primary color for counting', () => {
      expect(getCountdownStateColor('counting')).toBe('#4A90E2'); // Colors.primary.main
    });

    it('should return success color for complete', () => {
      expect(getCountdownStateColor('complete')).toBe('#2ECC71'); // Colors.accent.success
    });

    it('should return error color for cancelled', () => {
      expect(getCountdownStateColor('cancelled')).toBe('#E74C3C'); // Colors.accent.error
    });
  });

  describe('getCountdownAccessibilityLabel function', () => {
    const {
      getCountdownAccessibilityLabel,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should return preparing label for waiting', () => {
      expect(getCountdownAccessibilityLabel('waiting', 30)).toContain(
        'Preparing'
      );
    });

    it('should include seconds for counting', () => {
      expect(getCountdownAccessibilityLabel('counting', 15)).toContain('15');
      expect(getCountdownAccessibilityLabel('counting', 15)).toContain(
        'seconds'
      );
    });

    it('should return complete label for complete', () => {
      expect(getCountdownAccessibilityLabel('complete', 0)).toContain(
        'complete'
      );
    });

    it('should return cancelled label for cancelled', () => {
      expect(getCountdownAccessibilityLabel('cancelled', 10)).toContain(
        'cancelled'
      );
    });
  });

  describe('DEFAULT_COUNTDOWN_DURATION constant', () => {
    const {
      DEFAULT_COUNTDOWN_DURATION,
    } = require('../src/screens/CalibrationCountdownScreen');

    it('should be 30 seconds', () => {
      expect(DEFAULT_COUNTDOWN_DURATION).toBe(30);
    });
  });
});
