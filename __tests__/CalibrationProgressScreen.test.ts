/**
 * Comprehensive tests for CalibrationProgressScreen
 *
 * Tests cover:
 * - File structure and exports
 * - Required imports and dependencies
 * - Props interface
 * - CalibrationProgressState type
 * - SignalQualitySample interface
 * - CalibrationResultData interface
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
  '../src/screens/CalibrationProgressScreen.tsx'
);
const INDEX_PATH = path.join(__dirname, '../src/screens/index.ts');

describe('CalibrationProgressScreen', () => {
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

    it('should export CalibrationProgressScreen component', () => {
      expect(screenContent).toMatch(
        /export\s+(const|function)\s+CalibrationProgressScreen/
      );
    });

    it('should have default export', () => {
      expect(screenContent).toMatch(
        /export\s+default\s+CalibrationProgressScreen/
      );
    });

    it('should export CalibrationProgressScreenProps interface', () => {
      expect(screenContent).toMatch(
        /export\s+interface\s+CalibrationProgressScreenProps/
      );
    });

    it('should export CalibrationProgressState type', () => {
      expect(screenContent).toMatch(/export\s+type\s+CalibrationProgressState/);
    });

    it('should export SignalQualitySample interface', () => {
      expect(screenContent).toMatch(/export\s+interface\s+SignalQualitySample/);
    });

    it('should export CalibrationResultData interface', () => {
      expect(screenContent).toMatch(
        /export\s+interface\s+CalibrationResultData/
      );
    });

    it('should export DEFAULT_CALIBRATION_DURATION constant', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+DEFAULT_CALIBRATION_DURATION/
      );
    });

    it('should export MIN_CALIBRATION_DURATION constant', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+MIN_CALIBRATION_DURATION/
      );
    });

    it('should export CRITICAL_SIGNAL_THRESHOLD constant', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+CRITICAL_SIGNAL_THRESHOLD/
      );
    });

    it('should export helper functions', () => {
      expect(screenContent).toMatch(/export\s+const\s+formatProgressTime/);
      expect(screenContent).toMatch(/export\s+const\s+formatDurationLabel/);
      expect(screenContent).toMatch(/export\s+const\s+getCalibrationProgress/);
      expect(screenContent).toMatch(/export\s+const\s+getProgressSignalStatus/);
      expect(screenContent).toMatch(/export\s+const\s+getProgressInstruction/);
      expect(screenContent).toMatch(/export\s+const\s+getProgressStateColor/);
      expect(screenContent).toMatch(
        /export\s+const\s+getProgressAccessibilityLabel/
      );
      expect(screenContent).toMatch(
        /export\s+const\s+calculateCleanDataPercentage/
      );
      expect(screenContent).toMatch(
        /export\s+const\s+calculateAverageSignalQuality/
      );
      expect(screenContent).toMatch(/export\s+const\s+isCalibrationSuccessful/);
    });
  });

  // =============================================
  // INDEX FILE EXPORTS
  // =============================================
  describe('Index File Exports', () => {
    it('should export CalibrationProgressScreen from index', () => {
      expect(indexContent).toContain('CalibrationProgressScreen');
    });

    it('should export DEFAULT_CALIBRATION_DURATION from index', () => {
      expect(indexContent).toContain('DEFAULT_CALIBRATION_DURATION');
    });

    it('should export MIN_CALIBRATION_DURATION from index', () => {
      expect(indexContent).toContain('MIN_CALIBRATION_DURATION');
    });

    it('should export CRITICAL_SIGNAL_THRESHOLD from index', () => {
      expect(indexContent).toContain('CRITICAL_SIGNAL_THRESHOLD');
    });

    it('should export helper functions from index', () => {
      expect(indexContent).toContain('formatProgressTime');
      expect(indexContent).toContain('formatDurationLabel');
      expect(indexContent).toContain('getCalibrationProgress');
      expect(indexContent).toContain('getProgressSignalStatus');
      expect(indexContent).toContain('getProgressInstruction');
      expect(indexContent).toContain('getProgressStateColor');
      expect(indexContent).toContain('getProgressAccessibilityLabel');
      expect(indexContent).toContain('calculateCleanDataPercentage');
      expect(indexContent).toContain('calculateAverageSignalQuality');
      expect(indexContent).toContain('isCalibrationSuccessful');
    });

    it('should export CalibrationProgressState type from index', () => {
      expect(indexContent).toContain('CalibrationProgressState');
    });

    it('should export SignalQualitySample type from index', () => {
      expect(indexContent).toContain('SignalQualitySample');
    });

    it('should export CalibrationProgressScreenProps type from index', () => {
      expect(indexContent).toContain('CalibrationProgressScreenProps');
    });

    it('should export CalibrationResultData type from index', () => {
      expect(indexContent).toContain('CalibrationResultData');
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
      expect(screenContent).toContain('ScrollView');
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
  // CalibrationProgressState TYPE
  // =============================================
  describe('CalibrationProgressState Type', () => {
    it('should include recording state', () => {
      expect(screenContent).toMatch(
        /CalibrationProgressState[\s\S]*?['"]recording['"]/
      );
    });

    it('should include paused state', () => {
      expect(screenContent).toMatch(
        /CalibrationProgressState[\s\S]*?['"]paused['"]/
      );
    });

    it('should include auto_paused state', () => {
      expect(screenContent).toMatch(
        /CalibrationProgressState[\s\S]*?['"]auto_paused['"]/
      );
    });

    it('should include complete state', () => {
      expect(screenContent).toMatch(
        /CalibrationProgressState[\s\S]*?['"]complete['"]/
      );
    });

    it('should include cancelled state', () => {
      expect(screenContent).toMatch(
        /CalibrationProgressState[\s\S]*?['"]cancelled['"]/
      );
    });
  });

  // =============================================
  // SignalQualitySample INTERFACE
  // =============================================
  describe('SignalQualitySample Interface', () => {
    it('should have timestamp field', () => {
      expect(screenContent).toMatch(
        /SignalQualitySample[\s\S]*?timestamp:\s*number/
      );
    });

    it('should have score field', () => {
      expect(screenContent).toMatch(
        /SignalQualitySample[\s\S]*?score:\s*number/
      );
    });

    it('should have isClean field', () => {
      expect(screenContent).toMatch(
        /SignalQualitySample[\s\S]*?isClean:\s*boolean/
      );
    });
  });

  // =============================================
  // CalibrationResultData INTERFACE
  // =============================================
  describe('CalibrationResultData Interface', () => {
    it('should have totalDuration field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?totalDuration:\s*number/
      );
    });

    it('should have recordedDuration field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?recordedDuration:\s*number/
      );
    });

    it('should have cleanDataPercentage field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?cleanDataPercentage:\s*number/
      );
    });

    it('should have averageSignalQuality field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?averageSignalQuality:\s*number/
      );
    });

    it('should have signalQualitySamples field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?signalQualitySamples:\s*SignalQualitySample\[\]/
      );
    });

    it('should have autoPauseCount field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?autoPauseCount:\s*number/
      );
    });

    it('should have wasSuccessful field', () => {
      expect(screenContent).toMatch(
        /CalibrationResultData[\s\S]*?wasSuccessful:\s*boolean/
      );
    });
  });

  // =============================================
  // CalibrationProgressScreenProps INTERFACE
  // =============================================
  describe('CalibrationProgressScreenProps Interface', () => {
    it('should have optional onCalibrationComplete prop', () => {
      expect(screenContent).toMatch(
        /onCalibrationComplete\??:\s*\(\s*data:\s*CalibrationResultData\s*\)\s*=>\s*void/
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
  // CONSTANTS
  // =============================================
  describe('Constants', () => {
    it('should define DEFAULT_CALIBRATION_DURATION as 300 seconds', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+DEFAULT_CALIBRATION_DURATION\s*=\s*300/
      );
    });

    it('should define MIN_CALIBRATION_DURATION as 180 seconds', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+MIN_CALIBRATION_DURATION\s*=\s*180/
      );
    });

    it('should define CRITICAL_SIGNAL_THRESHOLD as 20', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+CRITICAL_SIGNAL_THRESHOLD\s*=\s*20/
      );
    });

    it('should have documentation for DEFAULT_CALIBRATION_DURATION', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Default calibration duration[\s\S]*?\*\/[\s\S]*?DEFAULT_CALIBRATION_DURATION/
      );
    });

    it('should have documentation for MIN_CALIBRATION_DURATION', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Minimum calibration duration[\s\S]*?\*\/[\s\S]*?MIN_CALIBRATION_DURATION/
      );
    });

    it('should have documentation for CRITICAL_SIGNAL_THRESHOLD', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Critical signal quality threshold[\s\S]*?\*\/[\s\S]*?CRITICAL_SIGNAL_THRESHOLD/
      );
    });
  });

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  describe('Helper Functions', () => {
    describe('formatProgressTime', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+formatProgressTime\s*=/
        );
      });

      it('should accept seconds parameter as number', () => {
        expect(screenContent).toMatch(
          /formatProgressTime\s*=\s*\(\s*seconds:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatProgressTime[\s\S]*?:\s*string/);
      });

      it('should handle negative values', () => {
        expect(screenContent).toMatch(
          /formatProgressTime[\s\S]*?if\s*\(\s*seconds\s*<\s*0\s*\)/
        );
      });

      it('should use padStart for formatting', () => {
        expect(screenContent).toMatch(
          /formatProgressTime[\s\S]*?padStart\s*\(\s*2/
        );
      });
    });

    describe('formatDurationLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+formatDurationLabel\s*=/
        );
      });

      it('should accept seconds parameter', () => {
        expect(screenContent).toMatch(
          /formatDurationLabel\s*=\s*\(\s*seconds:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatDurationLabel[\s\S]*?:\s*string/);
      });

      it('should handle zero or negative', () => {
        expect(screenContent).toMatch(
          /formatDurationLabel[\s\S]*?if\s*\(\s*seconds\s*<=\s*0\s*\)/
        );
      });

      it('should handle singular second', () => {
        expect(screenContent).toMatch(
          /formatDurationLabel[\s\S]*?if\s*\(\s*seconds\s*===\s*1\s*\)/
        );
      });

      it('should handle less than 60 seconds', () => {
        expect(screenContent).toMatch(
          /formatDurationLabel[\s\S]*?if\s*\(\s*seconds\s*<\s*60\s*\)/
        );
      });
    });

    describe('getCalibrationProgress', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCalibrationProgress\s*=/
        );
      });

      it('should accept elapsed and total parameters', () => {
        expect(screenContent).toMatch(
          /getCalibrationProgress\s*=\s*\(\s*elapsed:\s*number\s*,\s*total:\s*number/
        );
      });

      it('should return number', () => {
        expect(screenContent).toMatch(
          /getCalibrationProgress[\s\S]*?:\s*number/
        );
      });

      it('should handle zero total', () => {
        expect(screenContent).toMatch(
          /getCalibrationProgress[\s\S]*?if\s*\(\s*total\s*<=\s*0\s*\)/
        );
      });

      it('should clamp result between 0 and 100', () => {
        expect(screenContent).toMatch(
          /getCalibrationProgress[\s\S]*?Math\.min\s*\(\s*100[\s\S]*?Math\.max\s*\(\s*0/
        );
      });
    });

    describe('getProgressSignalStatus', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getProgressSignalStatus\s*=/
        );
      });

      it('should accept SignalQuality parameter', () => {
        expect(screenContent).toMatch(
          /getProgressSignalStatus\s*=\s*\(\s*quality:\s*SignalQuality\s*\|\s*null/
        );
      });

      it('should return object with label, color, isGood, and isCritical', () => {
        expect(screenContent).toMatch(
          /getProgressSignalStatus[\s\S]*?:\s*\{\s*label:\s*string;\s*color:\s*string;\s*isGood:\s*boolean;\s*isCritical:\s*boolean\s*\}/
        );
      });

      it('should handle null quality', () => {
        expect(screenContent).toMatch(
          /getProgressSignalStatus[\s\S]*?if\s*\(\s*!quality/
        );
      });

      it('should handle different score thresholds', () => {
        expect(screenContent).toMatch(
          /getProgressSignalStatus[\s\S]*?score\s*>=\s*80/
        );
        expect(screenContent).toMatch(
          /getProgressSignalStatus[\s\S]*?score\s*>=\s*60/
        );
        expect(screenContent).toMatch(
          /getProgressSignalStatus[\s\S]*?score\s*>=\s*40/
        );
        expect(screenContent).toMatch(
          /getProgressSignalStatus[\s\S]*?score\s*>=\s*CRITICAL_SIGNAL_THRESHOLD/
        );
      });
    });

    describe('getProgressInstruction', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getProgressInstruction\s*=/
        );
      });

      it('should accept state and signalStatus parameters', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction\s*=\s*\(\s*state:\s*CalibrationProgressState\s*,\s*signalStatus/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?:\s*string/
        );
      });

      it('should handle recording state', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?case\s*['"]recording['"]/
        );
      });

      it('should handle paused state', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?case\s*['"]paused['"]/
        );
      });

      it('should handle auto_paused state', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?case\s*['"]auto_paused['"]/
        );
      });

      it('should handle complete state', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?case\s*['"]complete['"]/
        );
      });

      it('should handle cancelled state', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?case\s*['"]cancelled['"]/
        );
      });

      it('should check for critical signal', () => {
        expect(screenContent).toMatch(
          /getProgressInstruction[\s\S]*?signalStatus\.isCritical/
        );
      });
    });

    describe('getProgressStateColor', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getProgressStateColor\s*=/
        );
      });

      it('should accept CalibrationProgressState parameter', () => {
        expect(screenContent).toMatch(
          /getProgressStateColor\s*=\s*\(\s*state:\s*CalibrationProgressState/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?:\s*string/
        );
      });

      it('should handle all states', () => {
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?case\s*['"]recording['"]/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?case\s*['"]paused['"]/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?case\s*['"]auto_paused['"]/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?case\s*['"]complete['"]/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?case\s*['"]cancelled['"]/
        );
      });

      it('should use theme colors', () => {
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?Colors\.primary\.main/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?Colors\.accent\.success/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?Colors\.accent\.error/
        );
        expect(screenContent).toMatch(
          /getProgressStateColor[\s\S]*?Colors\.accent\.warning/
        );
      });
    });

    describe('getProgressAccessibilityLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getProgressAccessibilityLabel\s*=/
        );
      });

      it('should accept state, elapsed, and total parameters', () => {
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel\s*=\s*\(\s*state:\s*CalibrationProgressState\s*,\s*elapsed:\s*number\s*,\s*total:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?:\s*string/
        );
      });

      it('should handle all states', () => {
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?case\s*['"]recording['"]/
        );
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?case\s*['"]paused['"]/
        );
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?case\s*['"]auto_paused['"]/
        );
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?case\s*['"]complete['"]/
        );
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?case\s*['"]cancelled['"]/
        );
      });

      it('should calculate progress percentage', () => {
        expect(screenContent).toMatch(
          /getProgressAccessibilityLabel[\s\S]*?getCalibrationProgress/
        );
      });
    });

    describe('calculateCleanDataPercentage', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+calculateCleanDataPercentage\s*=/
        );
      });

      it('should accept samples parameter', () => {
        expect(screenContent).toMatch(
          /calculateCleanDataPercentage\s*=\s*\(\s*samples:\s*SignalQualitySample\[\]/
        );
      });

      it('should return number', () => {
        expect(screenContent).toMatch(
          /calculateCleanDataPercentage[\s\S]*?:\s*number/
        );
      });

      it('should handle empty array', () => {
        expect(screenContent).toMatch(
          /calculateCleanDataPercentage[\s\S]*?if\s*\(\s*samples\.length\s*===\s*0\s*\)/
        );
      });

      it('should filter clean samples', () => {
        expect(screenContent).toMatch(
          /calculateCleanDataPercentage[\s\S]*?filter\s*\(\s*.*?isClean/
        );
      });
    });

    describe('calculateAverageSignalQuality', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+calculateAverageSignalQuality\s*=/
        );
      });

      it('should accept samples parameter', () => {
        expect(screenContent).toMatch(
          /calculateAverageSignalQuality\s*=\s*\(\s*samples:\s*SignalQualitySample\[\]/
        );
      });

      it('should return number', () => {
        expect(screenContent).toMatch(
          /calculateAverageSignalQuality[\s\S]*?:\s*number/
        );
      });

      it('should handle empty array', () => {
        expect(screenContent).toMatch(
          /calculateAverageSignalQuality[\s\S]*?if\s*\(\s*samples\.length\s*===\s*0\s*\)/
        );
      });

      it('should use reduce to calculate total', () => {
        expect(screenContent).toMatch(
          /calculateAverageSignalQuality[\s\S]*?reduce/
        );
      });
    });

    describe('isCalibrationSuccessful', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+isCalibrationSuccessful\s*=/
        );
      });

      it('should accept recordedDuration and cleanDataPercentage parameters', () => {
        expect(screenContent).toMatch(
          /isCalibrationSuccessful\s*=\s*\(\s*recordedDuration:\s*number\s*,\s*cleanDataPercentage:\s*number/
        );
      });

      it('should return boolean', () => {
        expect(screenContent).toMatch(
          /isCalibrationSuccessful[\s\S]*?:\s*boolean/
        );
      });

      it('should check minimum duration', () => {
        expect(screenContent).toMatch(
          /isCalibrationSuccessful[\s\S]*?MIN_CALIBRATION_DURATION/
        );
      });

      it('should check minimum clean data percentage', () => {
        expect(screenContent).toMatch(
          /isCalibrationSuccessful[\s\S]*?cleanDataPercentage\s*>=\s*50/
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
    it('should have progressState state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*progressState\s*,\s*setProgressState\s*\]\s*=\s*useState/
      );
    });

    it('should have elapsedSeconds state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*elapsedSeconds\s*,\s*setElapsedSeconds\s*\]\s*=\s*useState/
      );
    });

    it('should have signalSamples state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*signalSamples\s*,\s*setSignalSamples\s*\]\s*=\s*useState/
      );
    });

    it('should have autoPauseCount state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*autoPauseCount\s*,\s*setAutoPauseCount\s*\]\s*=\s*useState/
      );
    });

    it('should initialize progressState to recording', () => {
      expect(screenContent).toMatch(
        /useState<CalibrationProgressState>\s*\(\s*['"]recording['"]\s*\)/
      );
    });

    it('should initialize elapsedSeconds to 0', () => {
      expect(screenContent).toMatch(/useState<number>\s*\(\s*0\s*\)/);
    });

    it('should initialize signalSamples to empty array', () => {
      expect(screenContent).toMatch(
        /useState<SignalQualitySample\[\]>\s*\(\s*\[\s*\]\s*\)/
      );
    });

    it('should initialize autoPauseCount to 0', () => {
      expect(screenContent).toMatch(
        /autoPauseCount[\s\S]*?useState<number>\s*\(\s*0\s*\)/
      );
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

    it('should have sampleTimerRef for signal sampling', () => {
      expect(screenContent).toMatch(/const\s+sampleTimerRef\s*=\s*useRef/);
    });

    it('should have autoPauseTimeoutRef for auto-pause', () => {
      expect(screenContent).toMatch(/const\s+autoPauseTimeoutRef\s*=\s*useRef/);
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
    it('should have startRecording handler', () => {
      expect(screenContent).toMatch(/const\s+startRecording\s*=\s*useCallback/);
    });

    it('should have pauseRecording handler', () => {
      expect(screenContent).toMatch(/const\s+pauseRecording\s*=\s*useCallback/);
    });

    it('should have resumeRecording handler', () => {
      expect(screenContent).toMatch(
        /const\s+resumeRecording\s*=\s*useCallback/
      );
    });

    it('should have handleCancel handler', () => {
      expect(screenContent).toMatch(/const\s+handleCancel\s*=\s*useCallback/);
    });

    it('should have handleComplete handler', () => {
      expect(screenContent).toMatch(/const\s+handleComplete\s*=\s*useCallback/);
    });

    it('should have sampleSignalQuality handler', () => {
      expect(screenContent).toMatch(
        /const\s+sampleSignalQuality\s*=\s*useCallback/
      );
    });
  });

  // =============================================
  // TIMER LOGIC
  // =============================================
  describe('Timer Logic', () => {
    it('should use setInterval for main timer', () => {
      expect(screenContent).toMatch(/timerRef\.current\s*=\s*setInterval\s*\(/);
    });

    it('should use setInterval for signal sampling', () => {
      expect(screenContent).toMatch(
        /sampleTimerRef\.current\s*=\s*setInterval\s*\(/
      );
    });

    it('should use clearInterval for cleanup', () => {
      expect(screenContent).toMatch(/clearInterval\s*\(/);
    });

    it('should increment elapsedSeconds', () => {
      expect(screenContent).toMatch(
        /setElapsedSeconds\s*\(\s*\(\s*prev\s*\)\s*=>/
      );
    });

    it('should check for calibration completion', () => {
      expect(screenContent).toMatch(/elapsedSeconds\s*>=\s*duration/);
    });

    it('should call handleComplete when done', () => {
      expect(screenContent).toMatch(
        /useEffect[\s\S]*?elapsedSeconds\s*>=\s*duration[\s\S]*?handleComplete/
      );
    });
  });

  // =============================================
  // AUTO-PAUSE LOGIC
  // =============================================
  describe('Auto-Pause Logic', () => {
    it('should track auto-pause with useEffect', () => {
      expect(screenContent).toMatch(
        /useEffect[\s\S]*?signalStatus\.isCritical[\s\S]*?autoPauseTimeoutRef/
      );
    });

    it('should increment autoPauseCount on auto-pause', () => {
      expect(screenContent).toMatch(
        /setAutoPauseCount\s*\(\s*\(\s*prev\s*\)\s*=>\s*prev\s*\+\s*1\s*\)/
      );
    });

    it('should support isAutoPause parameter', () => {
      expect(screenContent).toMatch(
        /pauseRecording\s*=\s*useCallback\s*\(\s*\(\s*isAutoPause\s*=/
      );
    });

    it('should set auto_paused state', () => {
      expect(screenContent).toMatch(
        /if\s*\(\s*isAutoPause\s*\)[\s\S]*?setProgressState\s*\(\s*['"]auto_paused['"]\s*\)/
      );
    });

    it('should use setTimeout for auto-pause delay', () => {
      expect(screenContent).toMatch(
        /autoPauseTimeoutRef\.current\s*=\s*setTimeout/
      );
    });
  });

  // =============================================
  // SIGNAL SAMPLING
  // =============================================
  describe('Signal Sampling', () => {
    it('should sample signal quality every 500ms', () => {
      expect(screenContent).toMatch(
        /sampleTimerRef\.current\s*=\s*setInterval[\s\S]*?500/
      );
    });

    it('should create SignalQualitySample objects', () => {
      expect(screenContent).toMatch(
        /const\s+sample:\s*SignalQualitySample\s*=/
      );
    });

    it('should add samples to signalSamples state', () => {
      expect(screenContent).toMatch(
        /setSignalSamples\s*\(\s*\(\s*prev\s*\)\s*=>\s*\[\.\.\.prev/
      );
    });

    it('should determine isClean based on threshold', () => {
      expect(screenContent).toMatch(
        /isClean:\s*signalQuality\.score\s*>=\s*40/
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
    it('should have renderProgressRing function', () => {
      expect(screenContent).toMatch(/const\s+renderProgressRing\s*=/);
    });

    it('should have renderSignalQuality function', () => {
      expect(screenContent).toMatch(/const\s+renderSignalQuality\s*=/);
    });

    it('should have renderDataQuality function', () => {
      expect(screenContent).toMatch(/const\s+renderDataQuality\s*=/);
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
      expect(screenContent).toContain('Calibration');
    });

    it('should have title section', () => {
      expect(screenContent).toContain('styles.titleSection');
      expect(screenContent).toContain('Recording Baseline');
    });

    it('should have progress ring container', () => {
      expect(screenContent).toContain('styles.progressRingContainer');
    });

    it('should have ring background', () => {
      expect(screenContent).toContain('styles.ringBackground');
    });

    it('should have ring progress', () => {
      expect(screenContent).toContain('styles.ringProgress');
    });

    it('should have progress time display', () => {
      expect(screenContent).toContain('styles.progressTime');
    });

    it('should have progress label', () => {
      expect(screenContent).toContain('styles.progressLabel');
    });

    it('should have progress percent', () => {
      expect(screenContent).toContain('styles.progressPercent');
    });

    it('should have instruction container', () => {
      expect(screenContent).toContain('styles.instructionContainer');
    });

    it('should have signal container', () => {
      expect(screenContent).toContain('styles.signalContainer');
    });

    it('should have data quality container', () => {
      expect(screenContent).toContain('styles.dataQualityContainer');
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

    it('should have scroll view', () => {
      expect(screenContent).toContain('ScrollView');
      expect(screenContent).toContain('styles.scrollView');
    });
  });

  // =============================================
  // DATA QUALITY STATS
  // =============================================
  describe('Data Quality Stats', () => {
    it('should display clean data percentage', () => {
      expect(screenContent).toMatch(/cleanDataPercentage[\s\S]*?%/);
    });

    it('should display average signal quality', () => {
      expect(screenContent).toMatch(/avgSignalQuality[\s\S]*?%/);
    });

    it('should display sample count', () => {
      expect(screenContent).toMatch(/signalSamples\.length/);
    });

    it('should show auto-pause count note', () => {
      expect(screenContent).toContain('styles.autoPauseNote');
    });

    it('should have stat cards', () => {
      expect(screenContent).toContain('styles.statCard');
    });

    it('should have stats row', () => {
      expect(screenContent).toContain('styles.statsRow');
    });
  });

  // =============================================
  // SIGNAL QUALITY DISPLAY
  // =============================================
  describe('Signal Quality Display', () => {
    it('should show signal dot', () => {
      expect(screenContent).toContain('styles.signalDot');
    });

    it('should show signal label', () => {
      expect(screenContent).toContain('styles.signalLabel');
    });

    it('should show signal value', () => {
      expect(screenContent).toContain('styles.signalValue');
    });

    it('should show signal score percentage', () => {
      expect(screenContent).toContain('styles.signalScore');
    });

    it('should show warning for critical signal', () => {
      expect(screenContent).toMatch(
        /signalStatus\.isCritical[\s\S]*?signalWarning/
      );
    });
  });

  // =============================================
  // TIPS CONTENT
  // =============================================
  describe('Tips Content', () => {
    it('should have tips title', () => {
      expect(screenContent).toContain('styles.tipsTitle');
      expect(screenContent).toContain('For best results:');
    });

    it('should have tip about eyes', () => {
      expect(screenContent).toContain('Keep eyes closed');
    });

    it('should have tip about movement', () => {
      expect(screenContent).toContain('Minimize head and body movement');
    });

    it('should have tip about breathing', () => {
      expect(screenContent).toContain('Breathe slowly and naturally');
    });

    it('should have tip about mind', () => {
      expect(screenContent).toContain('Let your mind wander freely');
    });

    it('should only show tips during recording', () => {
      expect(screenContent).toMatch(
        /progressState\s*===\s*['"]recording['"][\s\S]*?renderTips/
      );
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
        /accessibilityLabel=["']Cancel calibration["']/
      );
    });

    it('should have accessibility label on pause button', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=["']Pause calibration["']/
      );
    });

    it('should have accessibility label on resume button', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=["']Resume calibration["']/
      );
    });

    it('should have accessibility label on progress time', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=\{getProgressAccessibilityLabel/
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

    it('should have testID on progress ring', () => {
      expect(screenContent).toMatch(/testID=["']progress-ring["']/);
    });

    it('should have testID on progress time', () => {
      expect(screenContent).toMatch(/testID=["']progress-time["']/);
    });

    it('should have testID on progress label', () => {
      expect(screenContent).toMatch(/testID=["']progress-label["']/);
    });

    it('should have testID on progress percent', () => {
      expect(screenContent).toMatch(/testID=["']progress-percent["']/);
    });

    it('should have testID on signal quality', () => {
      expect(screenContent).toMatch(/testID=["']signal-quality["']/);
    });

    it('should have testID on data quality', () => {
      expect(screenContent).toMatch(/testID=["']data-quality["']/);
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

    it('should have progressRingContainer style', () => {
      expect(screenContent).toMatch(
        /progressRingContainer:\s*\{[\s\S]*?alignItems/
      );
    });

    it('should have progressTime style', () => {
      expect(screenContent).toMatch(/progressTime:\s*\{[\s\S]*?fontSize/);
    });

    it('should use tabular-nums for progress time', () => {
      expect(screenContent).toMatch(
        /progressTime:[\s\S]*?fontVariant:\s*\[['"]tabular-nums['"]\]/
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
    it('should have default duration from DEFAULT_CALIBRATION_DURATION', () => {
      expect(screenContent).toMatch(
        /duration\s*=\s*DEFAULT_CALIBRATION_DURATION/
      );
    });

    it('should have default testID', () => {
      expect(screenContent).toMatch(
        /testID\s*=\s*['"]calibration-progress-screen['"]/
      );
    });
  });

  // =============================================
  // CALIBRATION STATE TRANSITIONS
  // =============================================
  describe('Calibration State Transitions', () => {
    it('should set calibration state to processing on complete', () => {
      expect(screenContent).toMatch(
        /handleComplete[\s\S]*?setCalibrationState\s*\(\s*['"]processing['"]\s*\)/
      );
    });

    it('should set calibration state to null on cancel', () => {
      expect(screenContent).toMatch(
        /handleCancel[\s\S]*?setCalibrationState\s*\(\s*null\s*\)/
      );
    });

    it('should call onCalibrationComplete callback', () => {
      expect(screenContent).toMatch(
        /handleComplete[\s\S]*?if\s*\(\s*onCalibrationComplete\s*\)/
      );
    });

    it('should call onCancel callback', () => {
      expect(screenContent).toMatch(
        /handleCancel[\s\S]*?if\s*\(\s*onCancel\s*\)/
      );
    });

    it('should pass CalibrationResultData to callback', () => {
      expect(screenContent).toMatch(
        /onCalibrationComplete\s*\(\s*resultData\s*\)/
      );
    });
  });

  // =============================================
  // FOOTER CONTENT
  // =============================================
  describe('Footer Content', () => {
    it('should show footer note', () => {
      expect(screenContent).toContain('styles.footerNote');
    });

    it('should show different notes based on state', () => {
      expect(screenContent).toContain(
        'Calibration will complete automatically'
      );
      expect(screenContent).toContain(
        'Please adjust your device before resuming'
      );
      expect(screenContent).toContain('Tap Resume when you are ready');
      expect(screenContent).toContain('Processing your calibration data');
    });

    it('should conditionally show pause button', () => {
      expect(screenContent).toMatch(
        /progressState\s*===\s*['"]recording['"][\s\S]*?pauseButton/
      );
    });

    it('should conditionally show resume button', () => {
      expect(screenContent).toMatch(
        /progressState\s*===\s*['"]paused['"][\s\S]*?progressState\s*===\s*['"]auto_paused['"][\s\S]*?resumeButton/
      );
    });
  });

  // =============================================
  // DOCUMENTATION
  // =============================================
  describe('Documentation', () => {
    it('should have component documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?CalibrationProgressScreen component[\s\S]*?\*\//
      );
    });

    it('should have props documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Props for CalibrationProgressScreen[\s\S]*?\*\//
      );
    });

    it('should have CalibrationProgressState documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Calibration progress state type[\s\S]*?\*\//
      );
    });

    it('should have SignalQualitySample documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Signal quality sample[\s\S]*?\*\//
      );
    });

    it('should have CalibrationResultData documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Calibration result data[\s\S]*?\*\//
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

    it('should have useEffect for calibration completion', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?elapsedSeconds\s*>=\s*duration[\s\S]*?handleComplete/
      );
    });

    it('should have useEffect for progress animation', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?updateProgressAnimation/
      );
    });

    it('should have useEffect for auto-pause', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?signalStatus\.isCritical/
      );
    });

    it('should clean up timers on unmount', () => {
      expect(screenContent).toMatch(
        /return\s*\(\)\s*=>\s*\{[\s\S]*?clearInterval/
      );
    });

    it('should clean up auto-pause timeout on unmount', () => {
      expect(screenContent).toMatch(
        /return\s*\(\)\s*=>\s*\{[\s\S]*?clearTimeout/
      );
    });
  });

  // =============================================
  // RESULT DATA CONSTRUCTION
  // =============================================
  describe('Result Data Construction', () => {
    it('should build CalibrationResultData object', () => {
      expect(screenContent).toMatch(
        /const\s+resultData:\s*CalibrationResultData\s*=/
      );
    });

    it('should include totalDuration in result', () => {
      expect(screenContent).toMatch(
        /resultData[\s\S]*?totalDuration:\s*duration/
      );
    });

    it('should include recordedDuration in result', () => {
      expect(screenContent).toMatch(
        /resultData[\s\S]*?recordedDuration:\s*elapsedSeconds/
      );
    });

    it('should include cleanDataPercentage in result', () => {
      expect(screenContent).toMatch(
        /resultData[\s\S]*?cleanDataPercentage:\s*calculateCleanDataPercentage/
      );
    });

    it('should include averageSignalQuality in result', () => {
      expect(screenContent).toMatch(
        /resultData[\s\S]*?averageSignalQuality:\s*calculateAverageSignalQuality/
      );
    });

    it('should include signalQualitySamples in result', () => {
      expect(screenContent).toMatch(
        /resultData[\s\S]*?signalQualitySamples:\s*signalSamples/
      );
    });

    it('should include autoPauseCount in result', () => {
      expect(screenContent).toMatch(/resultData[\s\S]*?autoPauseCount/);
    });

    it('should include wasSuccessful in result', () => {
      expect(screenContent).toMatch(
        /resultData[\s\S]*?wasSuccessful:\s*isCalibrationSuccessful/
      );
    });
  });
});

// =============================================
// FUNCTIONAL TESTS
// =============================================
describe('CalibrationProgressScreen Functional Tests', () => {
  describe('formatProgressTime function', () => {
    const {
      formatProgressTime,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should format 0 seconds as 00:00', () => {
      expect(formatProgressTime(0)).toBe('00:00');
    });

    it('should format 30 seconds as 00:30', () => {
      expect(formatProgressTime(30)).toBe('00:30');
    });

    it('should format 60 seconds as 01:00', () => {
      expect(formatProgressTime(60)).toBe('01:00');
    });

    it('should format 90 seconds as 01:30', () => {
      expect(formatProgressTime(90)).toBe('01:30');
    });

    it('should format 300 seconds as 05:00', () => {
      expect(formatProgressTime(300)).toBe('05:00');
    });

    it('should return 00:00 for negative values', () => {
      expect(formatProgressTime(-5)).toBe('00:00');
    });
  });

  describe('formatDurationLabel function', () => {
    const {
      formatDurationLabel,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return Complete for 0', () => {
      expect(formatDurationLabel(0)).toBe('Complete');
    });

    it('should return Complete for negative', () => {
      expect(formatDurationLabel(-5)).toBe('Complete');
    });

    it('should return 1 second for 1', () => {
      expect(formatDurationLabel(1)).toBe('1 second');
    });

    it('should return X seconds for values < 60', () => {
      expect(formatDurationLabel(30)).toBe('30 seconds');
      expect(formatDurationLabel(45)).toBe('45 seconds');
    });

    it('should return 1 minute for 60', () => {
      expect(formatDurationLabel(60)).toBe('1 minute');
    });

    it('should return X minutes for exact minutes', () => {
      expect(formatDurationLabel(120)).toBe('2 minutes');
    });

    it('should return formatted time for minutes and seconds', () => {
      const result = formatDurationLabel(90);
      expect(result).toContain('1m');
      expect(result).toContain('30s');
    });
  });

  describe('getCalibrationProgress function', () => {
    const {
      getCalibrationProgress,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return 0 when elapsed is 0', () => {
      expect(getCalibrationProgress(0, 300)).toBe(0);
    });

    it('should return 100 when elapsed equals total', () => {
      expect(getCalibrationProgress(300, 300)).toBe(100);
    });

    it('should return 50 when half done', () => {
      expect(getCalibrationProgress(150, 300)).toBe(50);
    });

    it('should return 0 for zero total', () => {
      expect(getCalibrationProgress(10, 0)).toBe(0);
    });

    it('should clamp at 0 for negative elapsed', () => {
      expect(getCalibrationProgress(-10, 300)).toBe(0);
    });

    it('should clamp at 100 for elapsed > total', () => {
      expect(getCalibrationProgress(400, 300)).toBe(100);
    });
  });

  describe('getProgressSignalStatus function', () => {
    const {
      getProgressSignalStatus,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return Unknown for null', () => {
      const result = getProgressSignalStatus(null);
      expect(result.label).toBe('Unknown');
      expect(result.isGood).toBe(false);
      expect(result.isCritical).toBe(false);
    });

    it('should return Unknown for undefined score', () => {
      const result = getProgressSignalStatus({});
      expect(result.label).toBe('Unknown');
      expect(result.isGood).toBe(false);
      expect(result.isCritical).toBe(false);
    });

    it('should return Excellent for score >= 80', () => {
      const result = getProgressSignalStatus({ score: 85 });
      expect(result.label).toBe('Excellent');
      expect(result.isGood).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    it('should return Good for score 60-79', () => {
      const result = getProgressSignalStatus({ score: 70 });
      expect(result.label).toBe('Good');
      expect(result.isGood).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    it('should return Fair for score 40-59', () => {
      const result = getProgressSignalStatus({ score: 50 });
      expect(result.label).toBe('Fair');
      expect(result.isGood).toBe(true);
      expect(result.isCritical).toBe(false);
    });

    it('should return Poor for score 20-39', () => {
      const result = getProgressSignalStatus({ score: 25 });
      expect(result.label).toBe('Poor');
      expect(result.isGood).toBe(false);
      expect(result.isCritical).toBe(false);
    });

    it('should return Critical for score < 20', () => {
      const result = getProgressSignalStatus({ score: 10 });
      expect(result.label).toBe('Critical');
      expect(result.isGood).toBe(false);
      expect(result.isCritical).toBe(true);
    });
  });

  describe('getProgressInstruction function', () => {
    const {
      getProgressInstruction,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return recording message for good signal', () => {
      const result = getProgressInstruction('recording', {
        isGood: true,
        isCritical: false,
      });
      expect(result).toContain('Recording');
    });

    it('should return critical warning for critical signal', () => {
      const result = getProgressInstruction('recording', {
        isGood: false,
        isCritical: true,
      });
      expect(result).toContain('critical');
    });

    it('should return low signal message for poor signal', () => {
      const result = getProgressInstruction('recording', {
        isGood: false,
        isCritical: false,
      });
      expect(result).toContain('low');
    });

    it('should return paused message for paused state', () => {
      const result = getProgressInstruction('paused', {
        isGood: true,
        isCritical: false,
      });
      expect(result).toContain('paused');
    });

    it('should return auto-paused message for auto_paused state', () => {
      const result = getProgressInstruction('auto_paused', {
        isGood: false,
        isCritical: false,
      });
      expect(result).toContain('auto-paused');
    });

    it('should return complete message for complete state', () => {
      const result = getProgressInstruction('complete', {
        isGood: true,
        isCritical: false,
      });
      expect(result).toContain('complete');
    });

    it('should return cancelled message for cancelled state', () => {
      const result = getProgressInstruction('cancelled', {
        isGood: true,
        isCritical: false,
      });
      expect(result).toContain('cancelled');
    });
  });

  describe('getProgressStateColor function', () => {
    const {
      getProgressStateColor,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return primary color for recording', () => {
      const color = getProgressStateColor('recording');
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should return warning color for paused', () => {
      const color = getProgressStateColor('paused');
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should return error color for auto_paused', () => {
      const color = getProgressStateColor('auto_paused');
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should return success color for complete', () => {
      const color = getProgressStateColor('complete');
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });

    it('should return error color for cancelled', () => {
      const color = getProgressStateColor('cancelled');
      expect(typeof color).toBe('string');
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    });
  });

  describe('getProgressAccessibilityLabel function', () => {
    const {
      getProgressAccessibilityLabel,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should include percentage for recording', () => {
      const result = getProgressAccessibilityLabel('recording', 150, 300);
      expect(result).toContain('50');
      expect(result).toContain('percent');
    });

    it('should include percentage for paused', () => {
      const result = getProgressAccessibilityLabel('paused', 150, 300);
      expect(result).toContain('50');
      expect(result).toContain('percent');
    });

    it('should mention poor signal for auto_paused', () => {
      const result = getProgressAccessibilityLabel('auto_paused', 150, 300);
      expect(result).toContain('poor signal');
    });

    it('should say complete for complete state', () => {
      const result = getProgressAccessibilityLabel('complete', 300, 300);
      expect(result).toContain('complete');
    });

    it('should say cancelled for cancelled state', () => {
      const result = getProgressAccessibilityLabel('cancelled', 150, 300);
      expect(result).toContain('cancelled');
    });
  });

  describe('calculateCleanDataPercentage function', () => {
    const {
      calculateCleanDataPercentage,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return 0 for empty array', () => {
      expect(calculateCleanDataPercentage([])).toBe(0);
    });

    it('should return 100 for all clean samples', () => {
      const samples = [
        { timestamp: 1, score: 80, isClean: true },
        { timestamp: 2, score: 90, isClean: true },
      ];
      expect(calculateCleanDataPercentage(samples)).toBe(100);
    });

    it('should return 0 for all dirty samples', () => {
      const samples = [
        { timestamp: 1, score: 20, isClean: false },
        { timestamp: 2, score: 30, isClean: false },
      ];
      expect(calculateCleanDataPercentage(samples)).toBe(0);
    });

    it('should return 50 for half clean samples', () => {
      const samples = [
        { timestamp: 1, score: 80, isClean: true },
        { timestamp: 2, score: 20, isClean: false },
      ];
      expect(calculateCleanDataPercentage(samples)).toBe(50);
    });
  });

  describe('calculateAverageSignalQuality function', () => {
    const {
      calculateAverageSignalQuality,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return 0 for empty array', () => {
      expect(calculateAverageSignalQuality([])).toBe(0);
    });

    it('should return correct average', () => {
      const samples = [
        { timestamp: 1, score: 80, isClean: true },
        { timestamp: 2, score: 60, isClean: true },
      ];
      expect(calculateAverageSignalQuality(samples)).toBe(70);
    });

    it('should round the result', () => {
      const samples = [
        { timestamp: 1, score: 80, isClean: true },
        { timestamp: 2, score: 61, isClean: true },
      ];
      expect(calculateAverageSignalQuality(samples)).toBe(71);
    });
  });

  describe('isCalibrationSuccessful function', () => {
    const {
      isCalibrationSuccessful,
      MIN_CALIBRATION_DURATION,
    } = require('../src/screens/CalibrationProgressScreen');

    it('should return true for sufficient duration and clean data', () => {
      expect(isCalibrationSuccessful(MIN_CALIBRATION_DURATION, 50)).toBe(true);
    });

    it('should return false for insufficient duration', () => {
      expect(isCalibrationSuccessful(MIN_CALIBRATION_DURATION - 1, 50)).toBe(
        false
      );
    });

    it('should return false for insufficient clean data', () => {
      expect(isCalibrationSuccessful(MIN_CALIBRATION_DURATION, 49)).toBe(false);
    });

    it('should return false for both insufficient', () => {
      expect(isCalibrationSuccessful(100, 30)).toBe(false);
    });

    it('should return true for exceeding minimums', () => {
      expect(isCalibrationSuccessful(300, 80)).toBe(true);
    });
  });

  describe('Constants', () => {
    const {
      DEFAULT_CALIBRATION_DURATION,
      MIN_CALIBRATION_DURATION,
      CRITICAL_SIGNAL_THRESHOLD,
    } = require('../src/screens/CalibrationProgressScreen');

    it('DEFAULT_CALIBRATION_DURATION should be 300 (5 minutes)', () => {
      expect(DEFAULT_CALIBRATION_DURATION).toBe(300);
    });

    it('MIN_CALIBRATION_DURATION should be 180 (3 minutes)', () => {
      expect(MIN_CALIBRATION_DURATION).toBe(180);
    });

    it('CRITICAL_SIGNAL_THRESHOLD should be 20', () => {
      expect(CRITICAL_SIGNAL_THRESHOLD).toBe(20);
    });
  });
});
