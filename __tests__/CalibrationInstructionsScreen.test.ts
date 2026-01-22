/**
 * Comprehensive tests for CalibrationInstructionsScreen
 *
 * Tests cover:
 * - File structure and exports
 * - Required imports and dependencies
 * - Props interface
 * - CalibrationStep interface
 * - Helper functions
 * - CALIBRATION_STEPS constant
 * - Context integration
 * - State management
 * - Event handlers
 * - Accessibility features
 * - UI elements
 * - Styling
 * - Theme integration
 */

import * as fs from 'fs';
import * as path from 'path';

const SCREEN_PATH = path.join(
  __dirname,
  '../src/screens/CalibrationInstructionsScreen.tsx'
);
const INDEX_PATH = path.join(__dirname, '../src/screens/index.ts');

describe('CalibrationInstructionsScreen', () => {
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

    it('should export CalibrationInstructionsScreen component', () => {
      expect(screenContent).toMatch(
        /export\s+(const|function)\s+CalibrationInstructionsScreen/
      );
    });

    it('should have default export', () => {
      expect(screenContent).toMatch(/export\s+default\s+CalibrationInstructionsScreen/);
    });

    it('should export CalibrationStep interface', () => {
      expect(screenContent).toMatch(/export\s+interface\s+CalibrationStep/);
    });

    it('should export CalibrationInstructionsScreenProps interface', () => {
      expect(screenContent).toMatch(
        /export\s+interface\s+CalibrationInstructionsScreenProps/
      );
    });

    it('should export CALIBRATION_STEPS constant', () => {
      expect(screenContent).toMatch(/export\s+const\s+CALIBRATION_STEPS/);
    });

    it('should export helper functions', () => {
      expect(screenContent).toMatch(/export\s+const\s+getImportanceColor/);
      expect(screenContent).toMatch(/export\s+const\s+getImportanceLabel/);
      expect(screenContent).toMatch(/export\s+const\s+formatDurationOption/);
      expect(screenContent).toMatch(/export\s+const\s+getDurationDescription/);
      expect(screenContent).toMatch(/export\s+const\s+isDeviceReadyForCalibration/);
      expect(screenContent).toMatch(/export\s+const\s+getSignalQualityStatus/);
    });
  });

  // =============================================
  // INDEX FILE EXPORTS
  // =============================================
  describe('Index File Exports', () => {
    it('should export CalibrationInstructionsScreen from index', () => {
      expect(indexContent).toContain('CalibrationInstructionsScreen');
    });

    it('should export CALIBRATION_STEPS from index', () => {
      expect(indexContent).toContain('CALIBRATION_STEPS');
    });

    it('should export helper functions from index', () => {
      expect(indexContent).toContain('getImportanceColor');
      expect(indexContent).toContain('getImportanceLabel');
      expect(indexContent).toContain('formatDurationOption');
      expect(indexContent).toContain('getDurationDescription');
      expect(indexContent).toContain('isDeviceReadyForCalibration');
      expect(indexContent).toContain('getSignalQualityStatus');
    });

    it('should export CalibrationStep type from index', () => {
      expect(indexContent).toContain('CalibrationStep');
    });

    it('should export CalibrationInstructionsScreenProps type from index', () => {
      expect(indexContent).toContain('CalibrationInstructionsScreenProps');
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
      expect(screenContent).toContain('useCallback');
    });

    it('should import React Native components', () => {
      expect(screenContent).toContain('View');
      expect(screenContent).toContain('Text');
      expect(screenContent).toContain('StyleSheet');
      expect(screenContent).toContain('TouchableOpacity');
      expect(screenContent).toContain('ScrollView');
      expect(screenContent).toContain('Animated');
      expect(screenContent).toContain('Platform');
      expect(screenContent).toContain('Alert');
      expect(screenContent).toContain('Dimensions');
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
  });

  // =============================================
  // CalibrationStep INTERFACE
  // =============================================
  describe('CalibrationStep Interface', () => {
    it('should have id field', () => {
      expect(screenContent).toMatch(/interface\s+CalibrationStep\s*\{[\s\S]*?id:\s*string/);
    });

    it('should have title field', () => {
      expect(screenContent).toMatch(
        /interface\s+CalibrationStep\s*\{[\s\S]*?title:\s*string/
      );
    });

    it('should have description field', () => {
      expect(screenContent).toMatch(
        /interface\s+CalibrationStep\s*\{[\s\S]*?description:\s*string/
      );
    });

    it('should have icon field', () => {
      expect(screenContent).toMatch(
        /interface\s+CalibrationStep\s*\{[\s\S]*?icon:\s*string/
      );
    });

    it('should have tips field as string array', () => {
      expect(screenContent).toMatch(
        /interface\s+CalibrationStep\s*\{[\s\S]*?tips:\s*string\[\]/
      );
    });

    it('should have importance field with correct union type', () => {
      expect(screenContent).toMatch(
        /interface\s+CalibrationStep\s*\{[\s\S]*?importance:\s*['"]required['"]\s*\|\s*['"]recommended['"]\s*\|\s*['"]optional['"]/
      );
    });
  });

  // =============================================
  // CalibrationInstructionsScreenProps INTERFACE
  // =============================================
  describe('CalibrationInstructionsScreenProps Interface', () => {
    it('should have optional onStartCalibration prop', () => {
      expect(screenContent).toMatch(/onStartCalibration\??:\s*\(\)\s*=>\s*void/);
    });

    it('should have optional onCancel prop', () => {
      expect(screenContent).toMatch(/onCancel\??:\s*\(\)\s*=>\s*void/);
    });

    it('should have optional onSkip prop', () => {
      expect(screenContent).toMatch(/onSkip\??:\s*\(\)\s*=>\s*void/);
    });

    it('should have optional duration prop with 5 | 10 type', () => {
      expect(screenContent).toMatch(/duration\??:\s*5\s*\|\s*10/);
    });

    it('should have optional testID prop', () => {
      expect(screenContent).toMatch(/testID\??:\s*string/);
    });
  });

  // =============================================
  // CALIBRATION_STEPS CONSTANT
  // =============================================
  describe('CALIBRATION_STEPS Constant', () => {
    it('should be defined as an array', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+CALIBRATION_STEPS:\s*CalibrationStep\[\]\s*=/
      );
    });

    it('should contain environment step', () => {
      expect(screenContent).toMatch(/id:\s*['"]environment['"]/);
    });

    it('should contain device step', () => {
      expect(screenContent).toMatch(/id:\s*['"]device['"]/);
    });

    it('should contain connection step', () => {
      expect(screenContent).toMatch(/id:\s*['"]connection['"]/);
    });

    it('should contain relax step', () => {
      expect(screenContent).toMatch(/id:\s*['"]relax['"]/);
    });

    it('should have step with environment title', () => {
      expect(screenContent).toContain('Prepare Your Environment');
    });

    it('should have step with device positioning title', () => {
      expect(screenContent).toContain('Position Your Device');
    });

    it('should have step with connection verification title', () => {
      expect(screenContent).toContain('Verify Connection');
    });

    it('should have step with comfort title', () => {
      expect(screenContent).toContain('Get Comfortable');
    });

    it('should have required importance for environment', () => {
      expect(screenContent).toMatch(
        /id:\s*['"]environment['"][\s\S]*?importance:\s*['"]required['"]/
      );
    });

    it('should have required importance for device', () => {
      expect(screenContent).toMatch(
        /id:\s*['"]device['"][\s\S]*?importance:\s*['"]required['"]/
      );
    });

    it('should have required importance for connection', () => {
      expect(screenContent).toMatch(
        /id:\s*['"]connection['"][\s\S]*?importance:\s*['"]required['"]/
      );
    });

    it('should have recommended importance for relax', () => {
      expect(screenContent).toMatch(
        /id:\s*['"]relax['"][\s\S]*?importance:\s*['"]recommended['"]/
      );
    });

    it('should have tips arrays for each step', () => {
      // Each step should have tips array
      const tipsMatches = screenContent.match(/tips:\s*\[/g);
      expect(tipsMatches).not.toBeNull();
      expect(tipsMatches!.length).toBeGreaterThanOrEqual(4);
    });

    it('should have icons for each step', () => {
      expect(screenContent).toContain("icon: '🏠'");
      expect(screenContent).toContain("icon: '🎧'");
      expect(screenContent).toContain("icon: '📡'");
      expect(screenContent).toContain("icon: '🧘'");
    });
  });

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  describe('Helper Functions', () => {
    describe('getImportanceColor', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+getImportanceColor\s*=/);
      });

      it('should accept importance parameter', () => {
        expect(screenContent).toMatch(
          /getImportanceColor\s*=\s*\(\s*importance:\s*['"]required['"]\s*\|\s*['"]recommended['"]\s*\|\s*['"]optional['"]/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/getImportanceColor[\s\S]*?:\s*string\s*=>/);
      });

      it('should handle required case', () => {
        expect(screenContent).toMatch(
          /getImportanceColor[\s\S]*?case\s*['"]required['"][\s\S]*?Colors\.accent\.error/
        );
      });

      it('should handle recommended case', () => {
        expect(screenContent).toMatch(
          /getImportanceColor[\s\S]*?case\s*['"]recommended['"][\s\S]*?Colors\.accent\.warning/
        );
      });

      it('should handle optional case', () => {
        expect(screenContent).toMatch(
          /getImportanceColor[\s\S]*?case\s*['"]optional['"][\s\S]*?Colors\.accent\.info/
        );
      });
    });

    describe('getImportanceLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+getImportanceLabel\s*=/);
      });

      it('should handle required case', () => {
        expect(screenContent).toMatch(
          /getImportanceLabel[\s\S]*?case\s*['"]required['"][\s\S]*?['"]Required['"]/
        );
      });

      it('should handle recommended case', () => {
        expect(screenContent).toMatch(
          /getImportanceLabel[\s\S]*?case\s*['"]recommended['"][\s\S]*?['"]Recommended['"]/
        );
      });

      it('should handle optional case', () => {
        expect(screenContent).toMatch(
          /getImportanceLabel[\s\S]*?case\s*['"]optional['"][\s\S]*?['"]Optional['"]/
        );
      });
    });

    describe('formatDurationOption', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+formatDurationOption\s*=/);
      });

      it('should accept minutes parameter as number', () => {
        expect(screenContent).toMatch(/formatDurationOption\s*=\s*\(\s*minutes:\s*number/);
      });

      it('should return formatted string', () => {
        expect(screenContent).toMatch(/formatDurationOption[\s\S]*?:\s*string\s*=>/);
      });

      it('should use template literal for formatting', () => {
        expect(screenContent).toMatch(
          /formatDurationOption[\s\S]*?\$\{minutes\}.*minute/
        );
      });

      it('should handle plural form', () => {
        expect(screenContent).toMatch(
          /formatDurationOption[\s\S]*?minutes\s*!==\s*1\s*\?\s*['"]s['"]/
        );
      });
    });

    describe('getDurationDescription', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+getDurationDescription\s*=/);
      });

      it('should accept minutes parameter with 5 | 10 type', () => {
        expect(screenContent).toMatch(
          /getDurationDescription\s*=\s*\(\s*minutes:\s*5\s*\|\s*10/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/getDurationDescription[\s\S]*?:\s*string\s*=>/);
      });

      it('should handle 5 minutes case', () => {
        expect(screenContent).toMatch(
          /getDurationDescription[\s\S]*?if\s*\(\s*minutes\s*===\s*5\s*\)/
        );
      });

      it('should return quick calibration description for 5 min', () => {
        expect(screenContent).toContain('Quick calibration');
      });

      it('should return extended calibration description for 10 min', () => {
        expect(screenContent).toContain('Extended calibration');
      });
    });

    describe('isDeviceReadyForCalibration', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+isDeviceReadyForCalibration\s*=/
        );
      });

      it('should accept isConnected boolean parameter', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration\s*=\s*\(\s*isConnected:\s*boolean/
        );
      });

      it('should accept signalQuality number | null parameter', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration[\s\S]*?signalQuality:\s*number\s*\|\s*null/
        );
      });

      it('should return object with ready and reason', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration[\s\S]*?:\s*\{\s*ready:\s*boolean;\s*reason:\s*string\s*\}/
        );
      });

      it('should check isConnected first', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration[\s\S]*?if\s*\(\s*!isConnected\s*\)/
        );
      });

      it('should check for null signalQuality', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration[\s\S]*?if\s*\(\s*signalQuality\s*===\s*null\s*\)/
        );
      });

      it('should check signalQuality threshold', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration[\s\S]*?if\s*\(\s*signalQuality\s*<\s*20\s*\)/
        );
      });

      it('should return ready true when all conditions met', () => {
        expect(screenContent).toMatch(
          /isDeviceReadyForCalibration[\s\S]*?return\s*\{\s*ready:\s*true/
        );
      });
    });

    describe('getSignalQualityStatus', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+getSignalQualityStatus\s*=/);
      });

      it('should accept score parameter as number | null', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus\s*=\s*\(\s*score:\s*number\s*\|\s*null/
        );
      });

      it('should return object with label and color', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?:\s*\{\s*label:\s*string;\s*color:\s*string\s*\}/
        );
      });

      it('should handle null score', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?if\s*\(\s*score\s*===\s*null\s*\)[\s\S]*?Unknown/
        );
      });

      it('should return Excellent for score >= 80', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?if\s*\(\s*score\s*>=\s*80\s*\)[\s\S]*?Excellent/
        );
      });

      it('should return Good for score >= 60', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?if\s*\(\s*score\s*>=\s*60\s*\)[\s\S]*?Good/
        );
      });

      it('should return Fair for score >= 40', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?if\s*\(\s*score\s*>=\s*40\s*\)[\s\S]*?Fair/
        );
      });

      it('should return Poor for score >= 20', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?if\s*\(\s*score\s*>=\s*20\s*\)[\s\S]*?Poor/
        );
      });

      it('should return Critical for score < 20', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?return\s*\{\s*label:\s*['"]Critical['"]/
        );
      });

      it('should use signal colors from theme', () => {
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?Colors\.signal\.excellent/
        );
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?Colors\.signal\.good/
        );
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?Colors\.signal\.fair/
        );
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?Colors\.signal\.poor/
        );
        expect(screenContent).toMatch(
          /getSignalQualityStatus[\s\S]*?Colors\.signal\.critical/
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
      expect(screenContent).toMatch(/const\s*\{[\s\S]*?\}\s*=\s*useSession\(\)/);
    });

    it('should get deviceInfo from DeviceContext', () => {
      expect(screenContent).toMatch(/const\s*\{[\s\S]*?deviceInfo[\s\S]*?\}\s*=\s*useDevice/);
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

    it('should get setSessionConfig from SessionContext', () => {
      expect(screenContent).toMatch(
        /const\s*\{[\s\S]*?setSessionConfig[\s\S]*?\}\s*=\s*useSession/
      );
    });
  });

  // =============================================
  // STATE MANAGEMENT
  // =============================================
  describe('State Management', () => {
    it('should have selectedDuration state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*selectedDuration\s*,\s*setSelectedDuration\s*\]\s*=\s*useState/
      );
    });

    it('should have currentStepIndex state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*currentStepIndex\s*,\s*setCurrentStepIndex\s*\]\s*=\s*useState/
      );
    });

    it('should have allStepsViewed state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*allStepsViewed\s*,\s*setAllStepsViewed\s*\]\s*=\s*useState/
      );
    });

    it('should have isExpanded state', () => {
      expect(screenContent).toMatch(
        /const\s*\[\s*isExpanded\s*,\s*setIsExpanded\s*\]\s*=\s*useState/
      );
    });

    it('should initialize selectedDuration with duration prop', () => {
      expect(screenContent).toMatch(/useState<5\s*\|\s*10>\s*\(\s*duration\s*\)/);
    });

    it('should initialize currentStepIndex to 0', () => {
      expect(screenContent).toMatch(/useState\(\s*0\s*\)/);
    });

    it('should initialize allStepsViewed to false', () => {
      expect(screenContent).toMatch(/useState\(\s*false\s*\)/);
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

    it('should have slideAnim ref', () => {
      expect(screenContent).toMatch(
        /const\s+slideAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value\s*\(\s*50\s*\)/
      );
    });

    it('should use useEffect for mount animation', () => {
      expect(screenContent).toMatch(/useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?Animated\.parallel/);
    });

    it('should animate fadeAnim to 1', () => {
      expect(screenContent).toMatch(/Animated\.timing\s*\(\s*fadeAnim[\s\S]*?toValue:\s*1/);
    });

    it('should animate slideAnim to 0', () => {
      expect(screenContent).toMatch(/Animated\.timing\s*\(\s*slideAnim[\s\S]*?toValue:\s*0/);
    });

    it('should use native driver for animations', () => {
      expect(screenContent).toMatch(/useNativeDriver:\s*true/);
    });
  });

  // =============================================
  // EVENT HANDLERS
  // =============================================
  describe('Event Handlers', () => {
    it('should have toggleStepExpanded handler', () => {
      expect(screenContent).toMatch(/const\s+toggleStepExpanded\s*=\s*useCallback/);
    });

    it('should have handleNextStep handler', () => {
      expect(screenContent).toMatch(/const\s+handleNextStep\s*=\s*useCallback/);
    });

    it('should have handlePreviousStep handler', () => {
      expect(screenContent).toMatch(/const\s+handlePreviousStep\s*=\s*useCallback/);
    });

    it('should have handleDurationSelect handler', () => {
      expect(screenContent).toMatch(/const\s+handleDurationSelect\s*=\s*useCallback/);
    });

    it('should have handleStartCalibration handler', () => {
      expect(screenContent).toMatch(/const\s+handleStartCalibration\s*=\s*useCallback/);
    });

    it('should have handleCancel handler', () => {
      expect(screenContent).toMatch(/const\s+handleCancel\s*=\s*useCallback/);
    });

    it('should have handleSkip handler', () => {
      expect(screenContent).toMatch(/const\s+handleSkip\s*=\s*useCallback/);
    });
  });

  // =============================================
  // ALERT DIALOGS
  // =============================================
  describe('Alert Dialogs', () => {
    it('should show alert for device not ready', () => {
      expect(screenContent).toMatch(
        /Alert\.alert\s*\(\s*['"]Device Not Ready['"]/
      );
    });

    it('should show cancel confirmation alert', () => {
      expect(screenContent).toMatch(
        /Alert\.alert\s*\(\s*['"]Cancel Calibration\?['"]/
      );
    });

    it('should show skip confirmation alert', () => {
      expect(screenContent).toMatch(
        /Alert\.alert\s*\(\s*['"]Skip Calibration\?['"]/
      );
    });
  });

  // =============================================
  // RENDER FUNCTIONS
  // =============================================
  describe('Render Functions', () => {
    it('should have renderStepCard function', () => {
      expect(screenContent).toMatch(/const\s+renderStepCard\s*=/);
    });

    it('should have renderDeviceStatus function', () => {
      expect(screenContent).toMatch(/const\s+renderDeviceStatus\s*=/);
    });

    it('should have renderDurationSelector function', () => {
      expect(screenContent).toMatch(/const\s+renderDurationSelector\s*=/);
    });

    it('should have renderWhatToExpect function', () => {
      expect(screenContent).toMatch(/const\s+renderWhatToExpect\s*=/);
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
      expect(screenContent).toContain('Cancel');
    });

    it('should have skip button', () => {
      expect(screenContent).toContain('styles.skipButton');
      expect(screenContent).toContain('Skip');
    });

    it('should have intro section with icon', () => {
      expect(screenContent).toContain('styles.introIcon');
      expect(screenContent).toContain('🧠');
    });

    it('should have intro title', () => {
      expect(screenContent).toContain('styles.introTitle');
      expect(screenContent).toContain('Calibrate Your Baseline');
    });

    it('should have device status section', () => {
      expect(screenContent).toContain('styles.deviceStatusContainer');
      expect(screenContent).toContain('Device Status');
    });

    it('should have steps container', () => {
      expect(screenContent).toContain('styles.stepsContainer');
      expect(screenContent).toContain('Setup Checklist');
    });

    it('should have step navigation', () => {
      expect(screenContent).toContain('styles.stepNavigation');
    });

    it('should have duration selector', () => {
      expect(screenContent).toContain('styles.durationContainer');
      expect(screenContent).toContain('Calibration Duration');
    });

    it('should have what to expect section', () => {
      expect(screenContent).toContain('styles.expectContainer');
      expect(screenContent).toContain('What to Expect');
    });

    it('should have footer with start button', () => {
      expect(screenContent).toContain('styles.footer');
      expect(screenContent).toContain('styles.startButton');
      expect(screenContent).toContain('Begin Calibration');
    });

    it('should have step cards', () => {
      expect(screenContent).toContain('styles.stepCard');
    });

    it('should have step icons', () => {
      expect(screenContent).toContain('styles.stepIcon');
    });

    it('should have importance badges', () => {
      expect(screenContent).toContain('styles.importanceBadge');
    });

    it('should have tips container', () => {
      expect(screenContent).toContain('styles.tipsContainer');
    });

    it('should have warning banner', () => {
      expect(screenContent).toContain('styles.warningBanner');
    });
  });

  // =============================================
  // ACCESSIBILITY
  // =============================================
  describe('Accessibility Features', () => {
    it('should have accessibility role on buttons', () => {
      expect(screenContent).toMatch(/accessibilityRole=["']button["']/);
    });

    it('should have accessibility role radio on duration options', () => {
      expect(screenContent).toMatch(/accessibilityRole=["']radio["']/);
    });

    it('should have accessibility label on cancel button', () => {
      expect(screenContent).toMatch(/accessibilityLabel=["']Cancel calibration["']/);
    });

    it('should have accessibility label on skip button', () => {
      expect(screenContent).toMatch(/accessibilityLabel=["']Skip calibration["']/);
    });

    it('should have accessibility label on start button', () => {
      expect(screenContent).toMatch(/accessibilityLabel=["']Begin calibration["']/);
    });

    it('should have accessibility hint on start button', () => {
      expect(screenContent).toMatch(/accessibilityHint=\{[\s\S]*?deviceReadiness\.ready/);
    });

    it('should have accessibility state on start button', () => {
      expect(screenContent).toMatch(
        /accessibilityState=\{\s*\{\s*disabled:\s*!deviceReadiness\.ready\s*\}\s*\}/
      );
    });

    it('should have accessibility state on duration options', () => {
      expect(screenContent).toMatch(
        /accessibilityState=\{\s*\{\s*selected:\s*selectedDuration\s*===\s*dur/
      );
    });

    it('should have accessibility hint on step cards', () => {
      expect(screenContent).toMatch(
        /accessibilityHint=["']Tap to expand or collapse step details["']/
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

    it('should have testID on skip button', () => {
      expect(screenContent).toMatch(/testID=["']skip-button["']/);
    });

    it('should have testID on start button', () => {
      expect(screenContent).toMatch(/testID=["']start-calibration-button["']/);
    });

    it('should have testID on device status', () => {
      expect(screenContent).toMatch(/testID=["']device-status["']/);
    });

    it('should have testID on duration selector', () => {
      expect(screenContent).toMatch(/testID=["']duration-selector["']/);
    });

    it('should have testID on what to expect', () => {
      expect(screenContent).toMatch(/testID=["']what-to-expect["']/);
    });

    it('should have testID on setup steps', () => {
      expect(screenContent).toMatch(/testID=["']setup-steps["']/);
    });

    it('should have testID on step cards', () => {
      expect(screenContent).toMatch(/testID=\{`step-card-\$\{step\.id\}`\}/);
    });

    it('should have testID on duration options', () => {
      expect(screenContent).toMatch(/testID=\{`duration-option-\$\{dur\}`\}/);
    });

    it('should have testID on nav buttons', () => {
      expect(screenContent).toMatch(/testID=["']prev-step-button["']/);
      expect(screenContent).toMatch(/testID=["']next-step-button["']/);
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
      expect(screenContent).toMatch(/header:\s*\{[\s\S]*?flexDirection:\s*['"]row['"]/);
    });

    it('should have scrollView style', () => {
      expect(screenContent).toMatch(/scrollView:\s*\{[\s\S]*?flex:\s*1/);
    });

    it('should have stepCard style', () => {
      expect(screenContent).toMatch(/stepCard:\s*\{[\s\S]*?backgroundColor/);
    });

    it('should have stepCardActive style', () => {
      expect(screenContent).toMatch(/stepCardActive:\s*\{[\s\S]*?borderColor/);
    });

    it('should have stepCardViewed style', () => {
      expect(screenContent).toMatch(/stepCardViewed:\s*\{[\s\S]*?borderColor/);
    });

    it('should have startButton style', () => {
      expect(screenContent).toMatch(
        /startButton:\s*\{[\s\S]*?backgroundColor:\s*Colors\.primary\.main/
      );
    });

    it('should have startButtonDisabled style', () => {
      expect(screenContent).toMatch(
        /startButtonDisabled:\s*\{[\s\S]*?backgroundColor:\s*Colors\.interactive\.disabled/
      );
    });

    it('should use Shadows in styles', () => {
      expect(screenContent).toMatch(/\.\.\.Shadows\.sm/);
      expect(screenContent).toMatch(/\.\.\.Shadows\.md/);
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
        /paddingTop:\s*Platform\.OS\s*===\s*['"]ios['"]\s*\?\s*Spacing\.xxl\s*:\s*Spacing\.lg/
      );
    });
  });

  // =============================================
  // WHAT TO EXPECT CONTENT
  // =============================================
  describe('What to Expect Content', () => {
    it('should show 30-second settle period', () => {
      expect(screenContent).toContain('30-Second Settle Period');
    });

    it('should show brain activity recording', () => {
      expect(screenContent).toContain('Brain Activity Recording');
    });

    it('should show personalized baseline', () => {
      expect(screenContent).toContain('Personalized Baseline');
    });

    it('should have clock icon', () => {
      expect(screenContent).toContain('⏱️');
    });

    it('should have chart icon', () => {
      expect(screenContent).toContain('📊');
    });

    it('should have sparkle icon', () => {
      expect(screenContent).toContain('✨');
    });
  });

  // =============================================
  // FOOTER CONTENT
  // =============================================
  describe('Footer Content', () => {
    it('should show estimated time note', () => {
      expect(screenContent).toContain('Estimated time:');
    });

    it('should include 30 seconds in estimate', () => {
      expect(screenContent).toContain('+ 30 seconds');
    });

    it('should use formatDurationOption in footer', () => {
      expect(screenContent).toMatch(
        /formatDurationOption\s*\(\s*selectedDuration\s*\)/
      );
    });
  });

  // =============================================
  // DEFAULT PROPS
  // =============================================
  describe('Default Props', () => {
    it('should have default duration of 5', () => {
      expect(screenContent).toMatch(/duration\s*=\s*5/);
    });

    it('should have default testID', () => {
      expect(screenContent).toMatch(
        /testID\s*=\s*['"]calibration-instructions-screen['"]/
      );
    });
  });

  // =============================================
  // SESSION CONFIG
  // =============================================
  describe('Session Config on Start', () => {
    it('should call setSessionConfig on start', () => {
      expect(screenContent).toMatch(
        /handleStartCalibration[\s\S]*?setSessionConfig\s*\(/
      );
    });

    it('should set session_type to calibration', () => {
      expect(screenContent).toMatch(
        /setSessionConfig[\s\S]*?session_type:\s*['"]calibration['"]/
      );
    });

    it('should calculate duration in seconds', () => {
      expect(screenContent).toMatch(
        /setSessionConfig[\s\S]*?duration:\s*selectedDuration\s*\*\s*60/
      );
    });

    it('should set entrainment_freq to 6.0', () => {
      expect(screenContent).toMatch(/setSessionConfig[\s\S]*?entrainment_freq:\s*6\.0/);
    });

    it('should set volume to 0', () => {
      expect(screenContent).toMatch(/setSessionConfig[\s\S]*?volume:\s*0/);
    });

    it('should call setCalibrationState to countdown', () => {
      expect(screenContent).toMatch(
        /handleStartCalibration[\s\S]*?setCalibrationState\s*\(\s*['"]countdown['"]\s*\)/
      );
    });
  });

  // =============================================
  // DOCUMENTATION
  // =============================================
  describe('Documentation', () => {
    it('should have component documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?CalibrationInstructionsScreen component[\s\S]*?\*\//
      );
    });

    it('should have CalibrationStep documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Calibration instruction step data[\s\S]*?\*\//
      );
    });

    it('should have props documentation', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Props for CalibrationInstructionsScreen[\s\S]*?\*\//
      );
    });

    it('should have handler documentation', () => {
      expect(screenContent).toMatch(/\/\*\*[\s\S]*?Handle start calibration[\s\S]*?\*\//);
    });
  });
});

// =============================================
// FUNCTIONAL TESTS
// =============================================
describe('CalibrationInstructionsScreen Functional Tests', () => {
  describe('getImportanceColor function', () => {
    // Import the function for functional testing
    const { getImportanceColor } = require('../src/screens/CalibrationInstructionsScreen');

    it('should return error color for required', () => {
      const result = getImportanceColor('required');
      expect(result).toBe('#E74C3C'); // Colors.accent.error
    });

    it('should return warning color for recommended', () => {
      const result = getImportanceColor('recommended');
      expect(result).toBe('#F39C12'); // Colors.accent.warning
    });

    it('should return info color for optional', () => {
      const result = getImportanceColor('optional');
      expect(result).toBe('#4A90E2'); // Colors.accent.info
    });
  });

  describe('getImportanceLabel function', () => {
    const { getImportanceLabel } = require('../src/screens/CalibrationInstructionsScreen');

    it('should return Required for required', () => {
      expect(getImportanceLabel('required')).toBe('Required');
    });

    it('should return Recommended for recommended', () => {
      expect(getImportanceLabel('recommended')).toBe('Recommended');
    });

    it('should return Optional for optional', () => {
      expect(getImportanceLabel('optional')).toBe('Optional');
    });
  });

  describe('formatDurationOption function', () => {
    const { formatDurationOption } = require('../src/screens/CalibrationInstructionsScreen');

    it('should format 1 minute correctly', () => {
      expect(formatDurationOption(1)).toBe('1 minute');
    });

    it('should format 5 minutes correctly', () => {
      expect(formatDurationOption(5)).toBe('5 minutes');
    });

    it('should format 10 minutes correctly', () => {
      expect(formatDurationOption(10)).toBe('10 minutes');
    });
  });

  describe('getDurationDescription function', () => {
    const { getDurationDescription } = require('../src/screens/CalibrationInstructionsScreen');

    it('should return quick description for 5 minutes', () => {
      expect(getDurationDescription(5)).toContain('Quick calibration');
    });

    it('should return extended description for 10 minutes', () => {
      expect(getDurationDescription(10)).toContain('Extended calibration');
    });
  });

  describe('isDeviceReadyForCalibration function', () => {
    const {
      isDeviceReadyForCalibration,
    } = require('../src/screens/CalibrationInstructionsScreen');

    it('should return not ready when not connected', () => {
      const result = isDeviceReadyForCalibration(false, 80);
      expect(result.ready).toBe(false);
      expect(result.reason).toContain('connect');
    });

    it('should return not ready when signalQuality is null', () => {
      const result = isDeviceReadyForCalibration(true, null);
      expect(result.ready).toBe(false);
      expect(result.reason).toContain('Waiting');
    });

    it('should return not ready when signalQuality is below 20', () => {
      const result = isDeviceReadyForCalibration(true, 15);
      expect(result.ready).toBe(false);
      expect(result.reason).toContain('too low');
    });

    it('should return ready when connected and signal quality >= 20', () => {
      const result = isDeviceReadyForCalibration(true, 50);
      expect(result.ready).toBe(true);
      expect(result.reason).toBe('');
    });

    it('should return ready for excellent signal quality', () => {
      const result = isDeviceReadyForCalibration(true, 95);
      expect(result.ready).toBe(true);
    });
  });

  describe('getSignalQualityStatus function', () => {
    const { getSignalQualityStatus } = require('../src/screens/CalibrationInstructionsScreen');

    it('should return Unknown for null score', () => {
      const result = getSignalQualityStatus(null);
      expect(result.label).toBe('Unknown');
    });

    it('should return Excellent for score >= 80', () => {
      expect(getSignalQualityStatus(80).label).toBe('Excellent');
      expect(getSignalQualityStatus(100).label).toBe('Excellent');
    });

    it('should return Good for score 60-79', () => {
      expect(getSignalQualityStatus(60).label).toBe('Good');
      expect(getSignalQualityStatus(79).label).toBe('Good');
    });

    it('should return Fair for score 40-59', () => {
      expect(getSignalQualityStatus(40).label).toBe('Fair');
      expect(getSignalQualityStatus(59).label).toBe('Fair');
    });

    it('should return Poor for score 20-39', () => {
      expect(getSignalQualityStatus(20).label).toBe('Poor');
      expect(getSignalQualityStatus(39).label).toBe('Poor');
    });

    it('should return Critical for score < 20', () => {
      expect(getSignalQualityStatus(0).label).toBe('Critical');
      expect(getSignalQualityStatus(19).label).toBe('Critical');
    });

    it('should return appropriate colors', () => {
      expect(getSignalQualityStatus(80).color).toBe('#2ECC71'); // signal.excellent
      expect(getSignalQualityStatus(60).color).toBe('#3498DB'); // signal.good
      expect(getSignalQualityStatus(40).color).toBe('#F39C12'); // signal.fair
      expect(getSignalQualityStatus(20).color).toBe('#E67E22'); // signal.poor
      expect(getSignalQualityStatus(10).color).toBe('#E74C3C'); // signal.critical
    });
  });

  describe('CALIBRATION_STEPS constant', () => {
    const { CALIBRATION_STEPS } = require('../src/screens/CalibrationInstructionsScreen');

    it('should have exactly 4 steps', () => {
      expect(CALIBRATION_STEPS).toHaveLength(4);
    });

    it('should have environment as first step', () => {
      expect(CALIBRATION_STEPS[0].id).toBe('environment');
    });

    it('should have device as second step', () => {
      expect(CALIBRATION_STEPS[1].id).toBe('device');
    });

    it('should have connection as third step', () => {
      expect(CALIBRATION_STEPS[2].id).toBe('connection');
    });

    it('should have relax as fourth step', () => {
      expect(CALIBRATION_STEPS[3].id).toBe('relax');
    });

    it('should have tips array for each step', () => {
      CALIBRATION_STEPS.forEach((step: { tips: string[] }) => {
        expect(Array.isArray(step.tips)).toBe(true);
        expect(step.tips.length).toBeGreaterThan(0);
      });
    });

    it('should have required fields for each step', () => {
      CALIBRATION_STEPS.forEach(
        (step: {
          id: string;
          title: string;
          description: string;
          icon: string;
          tips: string[];
          importance: string;
        }) => {
          expect(step.id).toBeDefined();
          expect(step.title).toBeDefined();
          expect(step.description).toBeDefined();
          expect(step.icon).toBeDefined();
          expect(step.importance).toBeDefined();
        }
      );
    });
  });
});
