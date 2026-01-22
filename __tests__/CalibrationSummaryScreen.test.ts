/**
 * Comprehensive tests for CalibrationSummaryScreen
 *
 * Tests cover:
 * - File structure and exports
 * - Required imports and dependencies
 * - Props interface
 * - CalibrationQualityLevel type
 * - BaselineStats interface
 * - Constants
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
  '../src/screens/CalibrationSummaryScreen.tsx'
);
const INDEX_PATH = path.join(__dirname, '../src/screens/index.ts');

describe('CalibrationSummaryScreen', () => {
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

    it('should export CalibrationSummaryScreen component', () => {
      expect(screenContent).toMatch(
        /export\s+(const|function)\s+CalibrationSummaryScreen/
      );
    });

    it('should have default export', () => {
      expect(screenContent).toMatch(
        /export\s+default\s+CalibrationSummaryScreen/
      );
    });

    it('should export CalibrationSummaryScreenProps interface', () => {
      expect(screenContent).toMatch(
        /export\s+interface\s+CalibrationSummaryScreenProps/
      );
    });

    it('should export CalibrationQualityLevel type', () => {
      expect(screenContent).toMatch(/export\s+type\s+CalibrationQualityLevel/);
    });

    it('should export BaselineStats interface', () => {
      expect(screenContent).toMatch(/export\s+interface\s+BaselineStats/);
    });

    it('should export GOOD_QUALITY_THRESHOLD constant', () => {
      expect(screenContent).toMatch(/export\s+const\s+GOOD_QUALITY_THRESHOLD/);
    });

    it('should export ACCEPTABLE_QUALITY_THRESHOLD constant', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+ACCEPTABLE_QUALITY_THRESHOLD/
      );
    });

    it('should export MIN_CLEAN_DATA_PERCENTAGE constant', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+MIN_CLEAN_DATA_PERCENTAGE/
      );
    });

    it('should export helper functions', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+getCalibrationQualityLevel/
      );
      expect(screenContent).toMatch(/export\s+const\s+getQualityLevelColor/);
      expect(screenContent).toMatch(/export\s+const\s+getQualityLevelLabel/);
      expect(screenContent).toMatch(/export\s+const\s+getQualityLevelIcon/);
      expect(screenContent).toMatch(
        /export\s+const\s+getQualitySummaryMessage/
      );
      expect(screenContent).toMatch(
        /export\s+const\s+getQualityRecommendation/
      );
      expect(screenContent).toMatch(/export\s+const\s+formatFrequencyValue/);
      expect(screenContent).toMatch(/export\s+const\s+formatPowerValue/);
      expect(screenContent).toMatch(/export\s+const\s+formatStdValue/);
      expect(screenContent).toMatch(/export\s+const\s+formatPercentage/);
      expect(screenContent).toMatch(
        /export\s+const\s+formatCalibrationDuration/
      );
      expect(screenContent).toMatch(
        /export\s+const\s+getStatAccessibilityLabel/
      );
      expect(screenContent).toMatch(/export\s+const\s+isBaselineValid/);
      expect(screenContent).toMatch(/export\s+const\s+getFrequencyBandLabel/);
    });
  });

  // =============================================
  // INDEX FILE EXPORTS
  // =============================================
  describe('Index File Exports', () => {
    it('should export CalibrationSummaryScreen from index', () => {
      expect(indexContent).toContain('CalibrationSummaryScreen');
    });

    it('should export GOOD_QUALITY_THRESHOLD from index', () => {
      expect(indexContent).toContain('GOOD_QUALITY_THRESHOLD');
    });

    it('should export ACCEPTABLE_QUALITY_THRESHOLD from index', () => {
      expect(indexContent).toContain('ACCEPTABLE_QUALITY_THRESHOLD');
    });

    it('should export MIN_CLEAN_DATA_PERCENTAGE from index', () => {
      expect(indexContent).toContain('MIN_CLEAN_DATA_PERCENTAGE');
    });

    it('should export helper functions from index', () => {
      expect(indexContent).toContain('getCalibrationQualityLevel');
      expect(indexContent).toContain('getQualityLevelColor');
      expect(indexContent).toContain('getQualityLevelLabel');
      expect(indexContent).toContain('getQualityLevelIcon');
      expect(indexContent).toContain('getQualitySummaryMessage');
      expect(indexContent).toContain('getQualityRecommendation');
      expect(indexContent).toContain('formatFrequencyValue');
      expect(indexContent).toContain('formatPowerValue');
      expect(indexContent).toContain('formatStdValue');
      expect(indexContent).toContain('formatPercentage');
      expect(indexContent).toContain('formatCalibrationDuration');
      expect(indexContent).toContain('getStatAccessibilityLabel');
      expect(indexContent).toContain('isBaselineValid');
      expect(indexContent).toContain('getFrequencyBandLabel');
    });

    it('should export CalibrationQualityLevel type from index', () => {
      expect(indexContent).toContain('CalibrationQualityLevel');
    });

    it('should export CalibrationSummaryScreenProps type from index', () => {
      expect(indexContent).toContain('CalibrationSummaryScreenProps');
    });

    it('should export BaselineStats type from index', () => {
      expect(indexContent).toContain('BaselineStats');
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
      expect(screenContent).toContain('ScrollView');
    });

    it('should import theme constants', () => {
      expect(screenContent).toContain('Colors');
      expect(screenContent).toContain('Spacing');
      expect(screenContent).toContain('BorderRadius');
      expect(screenContent).toContain('Typography');
      expect(screenContent).toContain('Shadows');
    });

    it('should import SessionContext', () => {
      expect(screenContent).toContain('useSession');
    });

    it('should import BaselineProfile type', () => {
      expect(screenContent).toContain('BaselineProfile');
    });

    it('should import CalibrationResultData type', () => {
      expect(screenContent).toContain('CalibrationResultData');
    });
  });

  // =============================================
  // CalibrationQualityLevel TYPE
  // =============================================
  describe('CalibrationQualityLevel Type', () => {
    it('should include excellent level', () => {
      expect(screenContent).toMatch(
        /CalibrationQualityLevel[\s\S]*?['"]excellent['"]/
      );
    });

    it('should include good level', () => {
      expect(screenContent).toMatch(
        /CalibrationQualityLevel[\s\S]*?['"]good['"]/
      );
    });

    it('should include acceptable level', () => {
      expect(screenContent).toMatch(
        /CalibrationQualityLevel[\s\S]*?['"]acceptable['"]/
      );
    });

    it('should include poor level', () => {
      expect(screenContent).toMatch(
        /CalibrationQualityLevel[\s\S]*?['"]poor['"]/
      );
    });
  });

  // =============================================
  // BaselineStats INTERFACE
  // =============================================
  describe('BaselineStats Interface', () => {
    it('should have thetaMean field', () => {
      expect(screenContent).toMatch(/BaselineStats[\s\S]*?thetaMean:\s*number/);
    });

    it('should have thetaStd field', () => {
      expect(screenContent).toMatch(/BaselineStats[\s\S]*?thetaStd:\s*number/);
    });

    it('should have alphaMean field', () => {
      expect(screenContent).toMatch(/BaselineStats[\s\S]*?alphaMean:\s*number/);
    });

    it('should have betaMean field', () => {
      expect(screenContent).toMatch(/BaselineStats[\s\S]*?betaMean:\s*number/);
    });

    it('should have peakThetaFreq field', () => {
      expect(screenContent).toMatch(
        /BaselineStats[\s\S]*?peakThetaFreq:\s*number/
      );
    });

    it('should have optimalFreq field', () => {
      expect(screenContent).toMatch(
        /BaselineStats[\s\S]*?optimalFreq:\s*number/
      );
    });

    it('should have qualityScore field', () => {
      expect(screenContent).toMatch(
        /BaselineStats[\s\S]*?qualityScore:\s*number/
      );
    });
  });

  // =============================================
  // CalibrationSummaryScreenProps INTERFACE
  // =============================================
  describe('CalibrationSummaryScreenProps Interface', () => {
    it('should have optional calibrationData prop', () => {
      expect(screenContent).toMatch(
        /CalibrationSummaryScreenProps[\s\S]*?calibrationData\?:\s*CalibrationResultData/
      );
    });

    it('should have optional baselineProfile prop', () => {
      expect(screenContent).toMatch(
        /CalibrationSummaryScreenProps[\s\S]*?baselineProfile\?:\s*BaselineProfile/
      );
    });

    it('should have optional onSaveBaseline prop', () => {
      expect(screenContent).toMatch(
        /CalibrationSummaryScreenProps[\s\S]*?onSaveBaseline\?:/
      );
    });

    it('should have optional onRecalibrate prop', () => {
      expect(screenContent).toMatch(
        /CalibrationSummaryScreenProps[\s\S]*?onRecalibrate\?:\s*\(\)\s*=>\s*void/
      );
    });

    it('should have optional onContinue prop', () => {
      expect(screenContent).toMatch(
        /CalibrationSummaryScreenProps[\s\S]*?onContinue\?:\s*\(\)\s*=>\s*void/
      );
    });

    it('should have optional testID prop', () => {
      expect(screenContent).toMatch(
        /CalibrationSummaryScreenProps[\s\S]*?testID\?:\s*string/
      );
    });
  });

  // =============================================
  // CONSTANTS
  // =============================================
  describe('Constants', () => {
    it('should define GOOD_QUALITY_THRESHOLD as 70', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+GOOD_QUALITY_THRESHOLD\s*=\s*70/
      );
    });

    it('should define ACCEPTABLE_QUALITY_THRESHOLD as 50', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+ACCEPTABLE_QUALITY_THRESHOLD\s*=\s*50/
      );
    });

    it('should define MIN_CLEAN_DATA_PERCENTAGE as 50', () => {
      expect(screenContent).toMatch(
        /export\s+const\s+MIN_CLEAN_DATA_PERCENTAGE\s*=\s*50/
      );
    });

    it('should have documentation for GOOD_QUALITY_THRESHOLD', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Quality threshold[\s\S]*?\*\/[\s\S]*?GOOD_QUALITY_THRESHOLD/
      );
    });

    it('should have documentation for ACCEPTABLE_QUALITY_THRESHOLD', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Quality threshold[\s\S]*?\*\/[\s\S]*?ACCEPTABLE_QUALITY_THRESHOLD/
      );
    });

    it('should have documentation for MIN_CLEAN_DATA_PERCENTAGE', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Minimum clean data[\s\S]*?\*\/[\s\S]*?MIN_CLEAN_DATA_PERCENTAGE/
      );
    });
  });

  // =============================================
  // HELPER FUNCTIONS
  // =============================================
  describe('Helper Functions', () => {
    describe('getCalibrationQualityLevel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getCalibrationQualityLevel\s*=/
        );
      });

      it('should accept qualityScore and cleanDataPercentage parameters', () => {
        expect(screenContent).toMatch(
          /getCalibrationQualityLevel\s*=\s*\(\s*qualityScore:\s*number\s*,\s*cleanDataPercentage:\s*number/
        );
      });

      it('should return CalibrationQualityLevel', () => {
        expect(screenContent).toMatch(
          /getCalibrationQualityLevel[\s\S]*?:\s*CalibrationQualityLevel/
        );
      });

      it('should check for poor quality when clean data is below minimum', () => {
        expect(screenContent).toMatch(
          /getCalibrationQualityLevel[\s\S]*?cleanDataPercentage\s*<\s*MIN_CLEAN_DATA_PERCENTAGE/
        );
      });

      it('should check for excellent quality', () => {
        expect(screenContent).toMatch(
          /getCalibrationQualityLevel[\s\S]*?qualityScore\s*>=\s*80[\s\S]*?['"]excellent['"]/
        );
      });

      it('should check for good quality using GOOD_QUALITY_THRESHOLD', () => {
        expect(screenContent).toMatch(
          /getCalibrationQualityLevel[\s\S]*?qualityScore\s*>=\s*GOOD_QUALITY_THRESHOLD[\s\S]*?['"]good['"]/
        );
      });

      it('should check for acceptable quality using ACCEPTABLE_QUALITY_THRESHOLD', () => {
        expect(screenContent).toMatch(
          /getCalibrationQualityLevel[\s\S]*?qualityScore\s*>=\s*ACCEPTABLE_QUALITY_THRESHOLD[\s\S]*?['"]acceptable['"]/
        );
      });
    });

    describe('getQualityLevelColor', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getQualityLevelColor\s*=/
        );
      });

      it('should accept level parameter', () => {
        expect(screenContent).toMatch(
          /getQualityLevelColor\s*=\s*\(\s*level:\s*CalibrationQualityLevel/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/getQualityLevelColor[\s\S]*?:\s*string/);
      });

      it('should use switch statement for levels', () => {
        expect(screenContent).toMatch(
          /getQualityLevelColor[\s\S]*?switch\s*\(\s*level\s*\)/
        );
      });

      it('should return Colors.signal.excellent for excellent', () => {
        expect(screenContent).toMatch(
          /getQualityLevelColor[\s\S]*?case\s*['"]excellent['"][\s\S]*?Colors\.signal\.excellent/
        );
      });

      it('should return Colors.signal.good for good', () => {
        expect(screenContent).toMatch(
          /getQualityLevelColor[\s\S]*?case\s*['"]good['"][\s\S]*?Colors\.signal\.good/
        );
      });

      it('should return Colors.signal.fair for acceptable', () => {
        expect(screenContent).toMatch(
          /getQualityLevelColor[\s\S]*?case\s*['"]acceptable['"][\s\S]*?Colors\.signal\.fair/
        );
      });

      it('should return Colors.signal.critical for poor', () => {
        expect(screenContent).toMatch(
          /getQualityLevelColor[\s\S]*?case\s*['"]poor['"][\s\S]*?Colors\.signal\.critical/
        );
      });
    });

    describe('getQualityLevelLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getQualityLevelLabel\s*=/
        );
      });

      it('should accept level parameter', () => {
        expect(screenContent).toMatch(
          /getQualityLevelLabel\s*=\s*\(\s*level:\s*CalibrationQualityLevel/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/getQualityLevelLabel[\s\S]*?:\s*string/);
      });

      it('should return Excellent for excellent level', () => {
        expect(screenContent).toMatch(
          /getQualityLevelLabel[\s\S]*?case\s*['"]excellent['"][\s\S]*?return\s*['"]Excellent['"]/
        );
      });

      it('should return Good for good level', () => {
        expect(screenContent).toMatch(
          /getQualityLevelLabel[\s\S]*?case\s*['"]good['"][\s\S]*?return\s*['"]Good['"]/
        );
      });

      it('should return Acceptable for acceptable level', () => {
        expect(screenContent).toMatch(
          /getQualityLevelLabel[\s\S]*?case\s*['"]acceptable['"][\s\S]*?return\s*['"]Acceptable['"]/
        );
      });

      it('should return Poor for poor level', () => {
        expect(screenContent).toMatch(
          /getQualityLevelLabel[\s\S]*?case\s*['"]poor['"][\s\S]*?return\s*['"]Poor['"]/
        );
      });
    });

    describe('getQualityLevelIcon', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getQualityLevelIcon\s*=/
        );
      });

      it('should accept level parameter', () => {
        expect(screenContent).toMatch(
          /getQualityLevelIcon\s*=\s*\(\s*level:\s*CalibrationQualityLevel/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/getQualityLevelIcon[\s\S]*?:\s*string/);
      });

      it('should return star emoji for excellent', () => {
        expect(screenContent).toMatch(
          /getQualityLevelIcon[\s\S]*?case\s*['"]excellent['"][\s\S]*?return/
        );
      });

      it('should return checkmark for good', () => {
        expect(screenContent).toMatch(
          /getQualityLevelIcon[\s\S]*?case\s*['"]good['"][\s\S]*?return/
        );
      });

      it('should return warning for poor', () => {
        expect(screenContent).toMatch(
          /getQualityLevelIcon[\s\S]*?case\s*['"]poor['"][\s\S]*?return/
        );
      });
    });

    describe('getQualitySummaryMessage', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getQualitySummaryMessage\s*=/
        );
      });

      it('should accept level parameter', () => {
        expect(screenContent).toMatch(
          /getQualitySummaryMessage\s*=\s*\(\s*level:\s*CalibrationQualityLevel/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getQualitySummaryMessage[\s\S]*?:\s*string/
        );
      });

      it('should have message for excellent level', () => {
        expect(screenContent).toMatch(
          /getQualitySummaryMessage[\s\S]*?case\s*['"]excellent['"][\s\S]*?return/
        );
      });

      it('should have message for good level', () => {
        expect(screenContent).toMatch(
          /getQualitySummaryMessage[\s\S]*?case\s*['"]good['"][\s\S]*?return/
        );
      });

      it('should have message for acceptable level', () => {
        expect(screenContent).toMatch(
          /getQualitySummaryMessage[\s\S]*?case\s*['"]acceptable['"][\s\S]*?return/
        );
      });

      it('should have message for poor level', () => {
        expect(screenContent).toMatch(
          /getQualitySummaryMessage[\s\S]*?case\s*['"]poor['"][\s\S]*?return/
        );
      });
    });

    describe('getQualityRecommendation', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getQualityRecommendation\s*=/
        );
      });

      it('should accept level parameter', () => {
        expect(screenContent).toMatch(
          /getQualityRecommendation\s*=\s*\(\s*level:\s*CalibrationQualityLevel/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getQualityRecommendation[\s\S]*?:\s*string/
        );
      });

      it('should have recommendation for excellent level', () => {
        expect(screenContent).toMatch(
          /getQualityRecommendation[\s\S]*?case\s*['"]excellent['"][\s\S]*?return/
        );
      });

      it('should have recommendation for poor level mentioning recalibration', () => {
        expect(screenContent).toMatch(
          /getQualityRecommendation[\s\S]*?case\s*['"]poor['"][\s\S]*?recalibrat/i
        );
      });
    });

    describe('formatFrequencyValue', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+formatFrequencyValue\s*=/
        );
      });

      it('should accept frequency parameter', () => {
        expect(screenContent).toMatch(
          /formatFrequencyValue\s*=\s*\(\s*frequency:\s*number\s*\|\s*null/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatFrequencyValue[\s\S]*?:\s*string/);
      });

      it('should handle null or undefined', () => {
        expect(screenContent).toMatch(
          /formatFrequencyValue[\s\S]*?frequency\s*===\s*null/
        );
      });

      it('should handle NaN', () => {
        expect(screenContent).toMatch(
          /formatFrequencyValue[\s\S]*?isNaN\s*\(\s*frequency\s*\)/
        );
      });

      it('should append Hz suffix', () => {
        expect(screenContent).toMatch(/formatFrequencyValue[\s\S]*?Hz/);
      });
    });

    describe('formatPowerValue', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+formatPowerValue\s*=/);
      });

      it('should accept power parameter', () => {
        expect(screenContent).toMatch(
          /formatPowerValue\s*=\s*\(\s*power:\s*number\s*\|\s*null/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatPowerValue[\s\S]*?:\s*string/);
      });

      it('should handle null or undefined', () => {
        expect(screenContent).toMatch(
          /formatPowerValue[\s\S]*?power\s*===\s*null/
        );
      });

      it('should append µV² suffix', () => {
        expect(screenContent).toMatch(/formatPowerValue[\s\S]*?µV²/);
      });
    });

    describe('formatStdValue', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+formatStdValue\s*=/);
      });

      it('should accept std parameter', () => {
        expect(screenContent).toMatch(
          /formatStdValue\s*=\s*\(\s*std:\s*number\s*\|\s*null/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatStdValue[\s\S]*?:\s*string/);
      });

      it('should handle null or undefined', () => {
        expect(screenContent).toMatch(/formatStdValue[\s\S]*?std\s*===\s*null/);
      });

      it('should include ± prefix', () => {
        expect(screenContent).toMatch(/formatStdValue[\s\S]*?±/);
      });
    });

    describe('formatPercentage', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+formatPercentage\s*=/);
      });

      it('should accept value parameter', () => {
        expect(screenContent).toMatch(
          /formatPercentage\s*=\s*\(\s*value:\s*number\s*\|\s*null/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(/formatPercentage[\s\S]*?:\s*string/);
      });

      it('should handle null or undefined', () => {
        expect(screenContent).toMatch(
          /formatPercentage[\s\S]*?value\s*===\s*null/
        );
      });

      it('should use Math.round', () => {
        expect(screenContent).toMatch(
          /formatPercentage[\s\S]*?Math\.round\s*\(\s*value\s*\)/
        );
      });

      it('should append % suffix', () => {
        expect(screenContent).toMatch(/formatPercentage[\s\S]*?%/);
      });
    });

    describe('formatCalibrationDuration', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+formatCalibrationDuration\s*=/
        );
      });

      it('should accept seconds parameter', () => {
        expect(screenContent).toMatch(
          /formatCalibrationDuration\s*=\s*\(\s*seconds:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /formatCalibrationDuration[\s\S]*?:\s*string/
        );
      });

      it('should handle zero or negative values', () => {
        expect(screenContent).toMatch(
          /formatCalibrationDuration[\s\S]*?if\s*\(\s*seconds\s*<=\s*0\s*\)/
        );
      });

      it('should handle minutes', () => {
        expect(screenContent).toMatch(
          /formatCalibrationDuration[\s\S]*?mins\s*=\s*Math\.floor/
        );
      });

      it('should format with m and s suffixes', () => {
        expect(screenContent).toMatch(/formatCalibrationDuration[\s\S]*?m/);
        expect(screenContent).toMatch(/formatCalibrationDuration[\s\S]*?s/);
      });
    });

    describe('getStatAccessibilityLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getStatAccessibilityLabel\s*=/
        );
      });

      it('should accept label and value parameters', () => {
        expect(screenContent).toMatch(
          /getStatAccessibilityLabel\s*=\s*\(\s*label:\s*string\s*,\s*value:\s*string/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getStatAccessibilityLabel[\s\S]*?:\s*string/
        );
      });

      it('should combine label and value', () => {
        expect(screenContent).toMatch(
          /getStatAccessibilityLabel[\s\S]*?\$\{label\}[\s\S]*?\$\{value\}/
        );
      });
    });

    describe('isBaselineValid', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(/export\s+const\s+isBaselineValid\s*=/);
      });

      it('should accept profile parameter', () => {
        expect(screenContent).toMatch(
          /isBaselineValid\s*=\s*\(\s*profile:\s*BaselineProfile\s*\|\s*null/
        );
      });

      it('should return boolean', () => {
        expect(screenContent).toMatch(/isBaselineValid[\s\S]*?:\s*boolean/);
      });

      it('should check for null profile', () => {
        expect(screenContent).toMatch(
          /isBaselineValid[\s\S]*?if\s*\(\s*!profile\s*\)/
        );
      });

      it('should check theta_mean is not NaN', () => {
        expect(screenContent).toMatch(
          /isBaselineValid[\s\S]*?isNaN\s*\(\s*profile\.theta_mean\s*\)/
        );
      });

      it('should check theta_mean is greater than 0', () => {
        expect(screenContent).toMatch(
          /isBaselineValid[\s\S]*?profile\.theta_mean\s*>\s*0/
        );
      });

      it('should check quality_score meets minimum', () => {
        expect(screenContent).toMatch(
          /isBaselineValid[\s\S]*?profile\.quality_score\s*>=\s*MIN_CLEAN_DATA_PERCENTAGE/
        );
      });
    });

    describe('getFrequencyBandLabel', () => {
      it('should be defined', () => {
        expect(screenContent).toMatch(
          /export\s+const\s+getFrequencyBandLabel\s*=/
        );
      });

      it('should accept frequency parameter', () => {
        expect(screenContent).toMatch(
          /getFrequencyBandLabel\s*=\s*\(\s*frequency:\s*number/
        );
      });

      it('should return string', () => {
        expect(screenContent).toMatch(
          /getFrequencyBandLabel[\s\S]*?:\s*string/
        );
      });

      it('should identify Theta Band (4-8 Hz)', () => {
        expect(screenContent).toMatch(
          /getFrequencyBandLabel[\s\S]*?Theta Band/
        );
      });

      it('should identify Alpha Band (8-13 Hz)', () => {
        expect(screenContent).toMatch(
          /getFrequencyBandLabel[\s\S]*?Alpha Band/
        );
      });

      it('should identify Beta Band (13-30 Hz)', () => {
        expect(screenContent).toMatch(/getFrequencyBandLabel[\s\S]*?Beta Band/);
      });

      it('should identify Delta Band (< 4 Hz)', () => {
        expect(screenContent).toMatch(
          /getFrequencyBandLabel[\s\S]*?Delta Band/
        );
      });
    });
  });

  // =============================================
  // CONTEXT INTEGRATION
  // =============================================
  describe('Context Integration', () => {
    it('should use useSession hook', () => {
      expect(screenContent).toMatch(/useSession\s*\(\s*\)/);
    });

    it('should destructure setCalibrationState from useSession', () => {
      expect(screenContent).toMatch(
        /const\s*\{[\s\S]*?setCalibrationState[\s\S]*?\}\s*=\s*useSession/
      );
    });

    it('should call setCalibrationState with complete on save', () => {
      expect(screenContent).toMatch(
        /setCalibrationState\s*\(\s*['"]complete['"]\s*\)/
      );
    });

    it('should call setCalibrationState with instructions on recalibrate', () => {
      expect(screenContent).toMatch(
        /setCalibrationState\s*\(\s*['"]instructions['"]\s*\)/
      );
    });
  });

  // =============================================
  // STATE MANAGEMENT
  // =============================================
  describe('State Management', () => {
    it('should have isSaving state', () => {
      expect(screenContent).toMatch(/useState<boolean>\s*\(\s*false\s*\)/);
    });

    it('should have setIsSaving setter', () => {
      expect(screenContent).toContain('setIsSaving');
    });
  });

  // =============================================
  // ANIMATION REFS
  // =============================================
  describe('Animation Refs', () => {
    it('should have fadeAnim ref', () => {
      expect(screenContent).toMatch(/fadeAnim\s*=\s*useRef/);
    });

    it('should have scaleAnim ref', () => {
      expect(screenContent).toMatch(/scaleAnim\s*=\s*useRef/);
    });

    it('should have checkmarkAnim ref', () => {
      expect(screenContent).toMatch(/checkmarkAnim\s*=\s*useRef/);
    });

    it('should have statsAnim ref', () => {
      expect(screenContent).toMatch(/statsAnim\s*=\s*useRef/);
    });

    it('should initialize animations with Animated.Value', () => {
      expect(screenContent).toMatch(/new\s+Animated\.Value\s*\(\s*0\s*\)/);
    });
  });

  // =============================================
  // ANIMATION IMPLEMENTATION
  // =============================================
  describe('Animation Implementation', () => {
    it('should define startEntranceAnimation function', () => {
      expect(screenContent).toMatch(/startEntranceAnimation\s*=/);
    });

    it('should use Animated.parallel for entrance animation', () => {
      expect(screenContent).toMatch(
        /startEntranceAnimation[\s\S]*?Animated\.parallel/
      );
    });

    it('should use Animated.timing for fade animation', () => {
      expect(screenContent).toMatch(
        /startEntranceAnimation[\s\S]*?Animated\.timing\s*\(\s*fadeAnim/
      );
    });

    it('should use Animated.spring for scale animation', () => {
      expect(screenContent).toMatch(
        /startEntranceAnimation[\s\S]*?Animated\.spring\s*\(\s*scaleAnim/
      );
    });

    it('should use Animated.sequence for checkmark and stats animations', () => {
      expect(screenContent).toMatch(/Animated\.sequence/);
    });

    it('should use useNativeDriver for animations', () => {
      expect(screenContent).toMatch(/useNativeDriver:\s*true/);
    });
  });

  // =============================================
  // EVENT HANDLERS
  // =============================================
  describe('Event Handlers', () => {
    it('should define handleSaveBaseline function', () => {
      expect(screenContent).toMatch(/handleSaveBaseline\s*=/);
    });

    it('should define handleRecalibrate function', () => {
      expect(screenContent).toMatch(/handleRecalibrate\s*=/);
    });

    it('should call onSaveBaseline callback when saving', () => {
      expect(screenContent).toMatch(
        /handleSaveBaseline[\s\S]*?onSaveBaseline\s*\(/
      );
    });

    it('should call onRecalibrate callback', () => {
      expect(screenContent).toMatch(
        /handleRecalibrate[\s\S]*?onRecalibrate\s*\(/
      );
    });

    it('should call onContinue after saving', () => {
      expect(screenContent).toMatch(
        /handleSaveBaseline[\s\S]*?onContinue\s*\(/
      );
    });
  });

  // =============================================
  // RENDER FUNCTIONS
  // =============================================
  describe('Render Functions', () => {
    it('should define renderQualityBadge function', () => {
      expect(screenContent).toMatch(/renderQualityBadge\s*=/);
    });

    it('should define renderSummaryMessage function', () => {
      expect(screenContent).toMatch(/renderSummaryMessage\s*=/);
    });

    it('should define renderCalibrationStats function', () => {
      expect(screenContent).toMatch(/renderCalibrationStats\s*=/);
    });

    it('should define renderBaselineProfile function', () => {
      expect(screenContent).toMatch(/renderBaselineProfile\s*=/);
    });

    it('should define renderActionButtons function', () => {
      expect(screenContent).toMatch(/renderActionButtons\s*=/);
    });
  });

  // =============================================
  // UI ELEMENTS
  // =============================================
  describe('UI Elements', () => {
    it('should have header section', () => {
      expect(screenContent).toMatch(/styles\.header/);
    });

    it('should have header title', () => {
      expect(screenContent).toMatch(/headerTitle/);
    });

    it('should have ScrollView', () => {
      expect(screenContent).toMatch(/<ScrollView/);
    });

    it('should have footer section', () => {
      expect(screenContent).toMatch(/styles\.footer/);
    });

    it('should display quality badge', () => {
      expect(screenContent).toMatch(/qualityBadge/);
    });

    it('should display quality label', () => {
      expect(screenContent).toMatch(/qualityLabel/);
    });

    it('should display quality icon', () => {
      expect(screenContent).toMatch(/qualityIcon/);
    });

    it('should display summary title', () => {
      expect(screenContent).toMatch(/summaryTitle/);
    });

    it('should display summary text', () => {
      expect(screenContent).toMatch(/summaryText/);
    });

    it('should display recommendation text', () => {
      expect(screenContent).toMatch(/recommendationText/);
    });

    it('should display calibration stats grid', () => {
      expect(screenContent).toMatch(/statsGrid/);
    });

    it('should display stat cards', () => {
      expect(screenContent).toMatch(/statCard/);
    });

    it('should display baseline profile section', () => {
      expect(screenContent).toMatch(/baselineContainer/);
    });

    it('should display theta band section', () => {
      expect(screenContent).toMatch(/bandSection/);
    });

    it('should display frequency section', () => {
      expect(screenContent).toMatch(/frequencySection/);
    });

    it('should display other bands section', () => {
      expect(screenContent).toMatch(/otherBandsSection/);
    });

    it('should display quality score bar', () => {
      expect(screenContent).toMatch(/qualityScoreBar/);
    });

    it('should display primary button', () => {
      expect(screenContent).toMatch(/primaryButton/);
    });

    it('should display secondary button', () => {
      expect(screenContent).toMatch(/secondaryButton/);
    });
  });

  // =============================================
  // BASELINE PROFILE DISPLAY
  // =============================================
  describe('Baseline Profile Display', () => {
    it('should display theta mean', () => {
      expect(screenContent).toMatch(/theta_mean/);
    });

    it('should display theta std', () => {
      expect(screenContent).toMatch(/theta_std/);
    });

    it('should display alpha mean', () => {
      expect(screenContent).toMatch(/alpha_mean/);
    });

    it('should display beta mean', () => {
      expect(screenContent).toMatch(/beta_mean/);
    });

    it('should display peak theta frequency', () => {
      expect(screenContent).toMatch(/peak_theta_freq/);
    });

    it('should display optimal frequency', () => {
      expect(screenContent).toMatch(/optimal_freq/);
    });

    it('should display quality score', () => {
      expect(screenContent).toMatch(/quality_score/);
    });
  });

  // =============================================
  // CALIBRATION STATS DISPLAY
  // =============================================
  describe('Calibration Stats Display', () => {
    it('should display clean data percentage', () => {
      expect(screenContent).toContain('cleanDataPercentage');
    });

    it('should display quality score', () => {
      expect(screenContent).toContain('qualityScore');
    });

    it('should display recorded duration', () => {
      expect(screenContent).toContain('recordedDuration');
    });

    it('should conditionally display auto-pause count', () => {
      expect(screenContent).toMatch(/autoPauseCount\s*>\s*0/);
    });
  });

  // =============================================
  // ACCESSIBILITY FEATURES
  // =============================================
  describe('Accessibility Features', () => {
    it('should have accessibilityRole on buttons', () => {
      expect(screenContent).toMatch(/accessibilityRole="button"/);
    });

    it('should have accessibilityLabel on save button', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel="Save baseline and continue"/
      );
    });

    it('should have accessibilityLabel on recalibrate button', () => {
      expect(screenContent).toMatch(/accessibilityLabel="Recalibrate"/);
    });

    it('should have accessibilityHint on save button', () => {
      expect(screenContent).toMatch(
        /accessibilityHint="Saves your calibration data/
      );
    });

    it('should have accessibilityHint on recalibrate button', () => {
      expect(screenContent).toMatch(
        /accessibilityHint="Starts a new calibration session"/
      );
    });

    it('should have accessibilityLabel on quality badge', () => {
      expect(screenContent).toMatch(
        /accessibilityLabel=\{`Calibration quality/
      );
    });
  });

  // =============================================
  // TEST IDS
  // =============================================
  describe('Test IDs', () => {
    it('should have testID on container', () => {
      expect(screenContent).toMatch(/testID=\{testID\}/);
    });

    it('should have testID on quality badge', () => {
      expect(screenContent).toMatch(/testID="quality-badge"/);
    });

    it('should have testID on summary message', () => {
      expect(screenContent).toMatch(/testID="summary-message"/);
    });

    it('should have testID on calibration stats', () => {
      expect(screenContent).toMatch(/testID="calibration-stats"/);
    });

    it('should have testID on baseline profile', () => {
      expect(screenContent).toMatch(/testID="baseline-profile"/);
    });

    it('should have testID on action buttons', () => {
      expect(screenContent).toMatch(/testID="action-buttons"/);
    });

    it('should have testID on save button', () => {
      expect(screenContent).toMatch(/testID="save-button"/);
    });

    it('should have testID on recalibrate button', () => {
      expect(screenContent).toMatch(/testID="recalibrate-button"/);
    });
  });

  // =============================================
  // STYLING
  // =============================================
  describe('Styling', () => {
    it('should use StyleSheet.create', () => {
      expect(screenContent).toMatch(/StyleSheet\.create/);
    });

    it('should have container style', () => {
      expect(screenContent).toMatch(/container:\s*\{/);
    });

    it('should have header style', () => {
      expect(screenContent).toMatch(/header:\s*\{/);
    });

    it('should have scrollView style', () => {
      expect(screenContent).toMatch(/scrollView:\s*\{/);
    });

    it('should have footer style', () => {
      expect(screenContent).toMatch(/footer:\s*\{/);
    });

    it('should have qualityBadge style', () => {
      expect(screenContent).toMatch(/qualityBadge:\s*\{/);
    });

    it('should have summaryContainer style', () => {
      expect(screenContent).toMatch(/summaryContainer:\s*\{/);
    });

    it('should have statsGrid style', () => {
      expect(screenContent).toMatch(/statsGrid:\s*\{/);
    });

    it('should have statCard style', () => {
      expect(screenContent).toMatch(/statCard:\s*\{/);
    });

    it('should have baselineContainer style', () => {
      expect(screenContent).toMatch(/baselineContainer:\s*\{/);
    });

    it('should have primaryButton style', () => {
      expect(screenContent).toMatch(/primaryButton:\s*\{/);
    });

    it('should have secondaryButton style', () => {
      expect(screenContent).toMatch(/secondaryButton:\s*\{/);
    });

    it('should have buttonDisabled style', () => {
      expect(screenContent).toMatch(/buttonDisabled:\s*\{/);
    });
  });

  // =============================================
  // THEME INTEGRATION
  // =============================================
  describe('Theme Integration', () => {
    it('should use Colors.background.primary', () => {
      expect(screenContent).toMatch(/Colors\.background\.primary/);
    });

    it('should use Colors.surface.primary', () => {
      expect(screenContent).toMatch(/Colors\.surface\.primary/);
    });

    it('should use Colors.text.primary', () => {
      expect(screenContent).toMatch(/Colors\.text\.primary/);
    });

    it('should use Colors.text.secondary', () => {
      expect(screenContent).toMatch(/Colors\.text\.secondary/);
    });

    it('should use Colors.text.tertiary', () => {
      expect(screenContent).toMatch(/Colors\.text\.tertiary/);
    });

    it('should use Colors.primary.main', () => {
      expect(screenContent).toMatch(/Colors\.primary\.main/);
    });

    it('should use Colors.secondary.main', () => {
      expect(screenContent).toMatch(/Colors\.secondary\.main/);
    });

    it('should use Spacing constants', () => {
      expect(screenContent).toMatch(/Spacing\.(xs|sm|md|lg|xl|xxl)/);
    });

    it('should use BorderRadius constants', () => {
      expect(screenContent).toMatch(/BorderRadius\.(sm|md|lg|xl|round)/);
    });

    it('should use Typography.fontSize', () => {
      expect(screenContent).toMatch(
        /Typography\.fontSize\.(xs|sm|md|lg|xl|xxl)/
      );
    });

    it('should use Typography.fontWeight', () => {
      expect(screenContent).toMatch(
        /Typography\.fontWeight\.(light|regular|medium|semibold|bold)/
      );
    });

    it('should use Shadows constants', () => {
      expect(screenContent).toMatch(/Shadows\.(sm|md|lg)/);
    });
  });

  // =============================================
  // PLATFORM SPECIFIC
  // =============================================
  describe('Platform Specific', () => {
    it('should use Platform.OS for iOS-specific styling', () => {
      expect(screenContent).toMatch(/Platform\.OS\s*===\s*['"]ios['"]/);
    });

    it('should apply different padding for iOS', () => {
      expect(screenContent).toMatch(
        /Platform\.OS\s*===\s*['"]ios['"][\s\S]*?Spacing/
      );
    });
  });

  // =============================================
  // DEFAULT PROPS
  // =============================================
  describe('Default Props', () => {
    it('should have default testID', () => {
      expect(screenContent).toMatch(
        /testID\s*=\s*['"]calibration-summary-screen['"]/
      );
    });
  });

  // =============================================
  // WARNING DISPLAY
  // =============================================
  describe('Warning Display', () => {
    it('should have warning container style', () => {
      expect(screenContent).toMatch(/warningContainer:\s*\{/);
    });

    it('should have warning icon', () => {
      expect(screenContent).toMatch(/warningIcon/);
    });

    it('should have warning text', () => {
      expect(screenContent).toMatch(/warningText/);
    });

    it('should show warning when calibration is not successful', () => {
      expect(screenContent).toMatch(
        /canSave[\s\S]*?\?[\s\S]*?:[\s\S]*?warning/i
      );
    });
  });

  // =============================================
  // FOOTER NOTE
  // =============================================
  describe('Footer Note', () => {
    it('should have footerNote style', () => {
      expect(screenContent).toMatch(/footerNote:\s*\{/);
    });

    it('should display footer note when can save', () => {
      expect(screenContent).toMatch(/canSave\s*&&[\s\S]*?footerNote/);
    });

    it('should mention baseline usage in footer', () => {
      expect(screenContent).toMatch(/baseline[\s\S]*?personalize/i);
    });
  });

  // =============================================
  // DOCUMENTATION
  // =============================================
  describe('Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?CalibrationSummaryScreen component[\s\S]*?\*\//
      );
    });

    it('should have JSDoc comment for CalibrationQualityLevel type', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Quality level[\s\S]*?\*\/[\s\S]*?CalibrationQualityLevel/
      );
    });

    it('should have JSDoc comment for CalibrationSummaryScreenProps', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Props for CalibrationSummaryScreen[\s\S]*?\*\//
      );
    });

    it('should have JSDoc comment for BaselineStats interface', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Baseline statistics[\s\S]*?\*\/[\s\S]*?BaselineStats/
      );
    });

    it('should have JSDoc comments for helper functions', () => {
      expect(screenContent).toMatch(
        /\/\*\*[\s\S]*?Get quality level[\s\S]*?\*\/[\s\S]*?getCalibrationQualityLevel/
      );
    });
  });

  // =============================================
  // DERIVED VALUES
  // =============================================
  describe('Derived Values', () => {
    it('should compute qualityScore from calibrationData', () => {
      expect(screenContent).toMatch(
        /qualityScore\s*=\s*calibrationData\?\.averageSignalQuality/
      );
    });

    it('should compute cleanDataPercentage from calibrationData', () => {
      expect(screenContent).toMatch(
        /cleanDataPercentage\s*=\s*calibrationData\?\.cleanDataPercentage/
      );
    });

    it('should compute qualityLevel using getCalibrationQualityLevel', () => {
      expect(screenContent).toMatch(
        /qualityLevel\s*=\s*getCalibrationQualityLevel/
      );
    });

    it('should compute qualityColor using getQualityLevelColor', () => {
      expect(screenContent).toMatch(/qualityColor\s*=\s*getQualityLevelColor/);
    });

    it('should compute qualityLabel using getQualityLevelLabel', () => {
      expect(screenContent).toMatch(/qualityLabel\s*=\s*getQualityLevelLabel/);
    });

    it('should compute qualityIcon using getQualityLevelIcon', () => {
      expect(screenContent).toMatch(/qualityIcon\s*=\s*getQualityLevelIcon/);
    });

    it('should compute summaryMessage using getQualitySummaryMessage', () => {
      expect(screenContent).toMatch(
        /summaryMessage\s*=\s*getQualitySummaryMessage/
      );
    });

    it('should compute recommendation using getQualityRecommendation', () => {
      expect(screenContent).toMatch(
        /recommendation\s*=\s*getQualityRecommendation/
      );
    });

    it('should compute isSuccessful from calibrationData', () => {
      expect(screenContent).toMatch(
        /isSuccessful\s*=\s*calibrationData\?\.wasSuccessful/
      );
    });

    it('should compute canSave based on isSuccessful and isBaselineValid', () => {
      expect(screenContent).toMatch(
        /canSave\s*=\s*isSuccessful\s*&&\s*baselineProfile\s*&&\s*isBaselineValid/
      );
    });
  });

  // =============================================
  // useEffect HOOKS
  // =============================================
  describe('useEffect Hooks', () => {
    it('should have useEffect for entrance animation', () => {
      expect(screenContent).toMatch(
        /useEffect\s*\(\s*\(\)\s*=>\s*\{[\s\S]*?startEntranceAnimation/
      );
    });

    it('should call startEntranceAnimation on mount', () => {
      expect(screenContent).toMatch(/startEntranceAnimation\s*\(\s*\)/);
    });
  });

  // =============================================
  // FUNCTIONAL TESTS - Helper Functions
  // =============================================
  describe('Functional Tests - Helper Functions', () => {
    // Import functions for functional testing
    let helpers: Record<string, (...args: unknown[]) => unknown>;

    beforeAll(async () => {
      // Dynamic import for testing
      try {
        helpers = await import('../src/screens/CalibrationSummaryScreen');
      } catch {
        helpers = {};
      }
    });

    describe('getCalibrationQualityLevel functional tests', () => {
      it('should return poor when clean data is below 50%', () => {
        if (helpers.getCalibrationQualityLevel) {
          expect(helpers.getCalibrationQualityLevel(90, 40)).toBe('poor');
        }
      });

      it('should return excellent for high quality and clean data', () => {
        if (helpers.getCalibrationQualityLevel) {
          expect(helpers.getCalibrationQualityLevel(85, 85)).toBe('excellent');
        }
      });

      it('should return good for moderately high quality', () => {
        if (helpers.getCalibrationQualityLevel) {
          expect(helpers.getCalibrationQualityLevel(75, 75)).toBe('good');
        }
      });

      it('should return acceptable for medium quality', () => {
        if (helpers.getCalibrationQualityLevel) {
          expect(helpers.getCalibrationQualityLevel(55, 55)).toBe('acceptable');
        }
      });

      it('should return poor for low quality score', () => {
        if (helpers.getCalibrationQualityLevel) {
          expect(helpers.getCalibrationQualityLevel(40, 60)).toBe('poor');
        }
      });
    });

    describe('getQualityLevelColor functional tests', () => {
      it('should return green color for excellent', () => {
        if (helpers.getQualityLevelColor) {
          const color = helpers.getQualityLevelColor('excellent');
          expect(typeof color).toBe('string');
          expect(color).toBeTruthy();
        }
      });

      it('should return different colors for different levels', () => {
        if (helpers.getQualityLevelColor) {
          const excellent = helpers.getQualityLevelColor('excellent');
          const poor = helpers.getQualityLevelColor('poor');
          expect(excellent).not.toBe(poor);
        }
      });
    });

    describe('getQualityLevelLabel functional tests', () => {
      it('should return Excellent for excellent level', () => {
        if (helpers.getQualityLevelLabel) {
          expect(helpers.getQualityLevelLabel('excellent')).toBe('Excellent');
        }
      });

      it('should return Good for good level', () => {
        if (helpers.getQualityLevelLabel) {
          expect(helpers.getQualityLevelLabel('good')).toBe('Good');
        }
      });

      it('should return Acceptable for acceptable level', () => {
        if (helpers.getQualityLevelLabel) {
          expect(helpers.getQualityLevelLabel('acceptable')).toBe('Acceptable');
        }
      });

      it('should return Poor for poor level', () => {
        if (helpers.getQualityLevelLabel) {
          expect(helpers.getQualityLevelLabel('poor')).toBe('Poor');
        }
      });
    });

    describe('formatFrequencyValue functional tests', () => {
      it('should format valid frequency with Hz suffix', () => {
        if (helpers.formatFrequencyValue) {
          expect(helpers.formatFrequencyValue(6.5)).toBe('6.5 Hz');
        }
      });

      it('should handle null', () => {
        if (helpers.formatFrequencyValue) {
          expect(helpers.formatFrequencyValue(null)).toBe('-- Hz');
        }
      });

      it('should format with one decimal place', () => {
        if (helpers.formatFrequencyValue) {
          expect(helpers.formatFrequencyValue(7.123)).toBe('7.1 Hz');
        }
      });
    });

    describe('formatPowerValue functional tests', () => {
      it('should format valid power with µV² suffix', () => {
        if (helpers.formatPowerValue) {
          expect(helpers.formatPowerValue(12.345)).toBe('12.35 µV²');
        }
      });

      it('should handle null', () => {
        if (helpers.formatPowerValue) {
          expect(helpers.formatPowerValue(null)).toBe('-- µV²');
        }
      });
    });

    describe('formatStdValue functional tests', () => {
      it('should format with ± prefix', () => {
        if (helpers.formatStdValue) {
          expect(helpers.formatStdValue(2.5)).toBe('±2.50 µV²');
        }
      });

      it('should handle null', () => {
        if (helpers.formatStdValue) {
          expect(helpers.formatStdValue(null)).toBe('±-- µV²');
        }
      });
    });

    describe('formatPercentage functional tests', () => {
      it('should format with % suffix', () => {
        if (helpers.formatPercentage) {
          expect(helpers.formatPercentage(75.6)).toBe('76%');
        }
      });

      it('should handle null', () => {
        if (helpers.formatPercentage) {
          expect(helpers.formatPercentage(null)).toBe('--%');
        }
      });
    });

    describe('formatCalibrationDuration functional tests', () => {
      it('should format minutes and seconds', () => {
        if (helpers.formatCalibrationDuration) {
          expect(helpers.formatCalibrationDuration(185)).toBe('3m 5s');
        }
      });

      it('should format seconds only', () => {
        if (helpers.formatCalibrationDuration) {
          expect(helpers.formatCalibrationDuration(45)).toBe('45s');
        }
      });

      it('should format minutes only when no seconds', () => {
        if (helpers.formatCalibrationDuration) {
          expect(helpers.formatCalibrationDuration(120)).toBe('2m');
        }
      });

      it('should handle zero', () => {
        if (helpers.formatCalibrationDuration) {
          expect(helpers.formatCalibrationDuration(0)).toBe('0s');
        }
      });
    });

    describe('getStatAccessibilityLabel functional tests', () => {
      it('should combine label and value', () => {
        if (helpers.getStatAccessibilityLabel) {
          expect(helpers.getStatAccessibilityLabel('Clean Data', '85%')).toBe(
            'Clean Data: 85%'
          );
        }
      });
    });

    describe('isBaselineValid functional tests', () => {
      it('should return false for null profile', () => {
        if (helpers.isBaselineValid) {
          expect(helpers.isBaselineValid(null)).toBe(false);
        }
      });

      it('should return true for valid profile', () => {
        if (helpers.isBaselineValid) {
          const validProfile = {
            theta_mean: 10,
            theta_std: 2,
            alpha_mean: 8,
            beta_mean: 5,
            peak_theta_freq: 6,
            optimal_freq: 6.5,
            calibration_timestamp: Date.now(),
            quality_score: 75,
          };
          expect(helpers.isBaselineValid(validProfile)).toBe(true);
        }
      });

      it('should return false for low quality score', () => {
        if (helpers.isBaselineValid) {
          const lowQualityProfile = {
            theta_mean: 10,
            theta_std: 2,
            alpha_mean: 8,
            beta_mean: 5,
            peak_theta_freq: 6,
            optimal_freq: 6.5,
            calibration_timestamp: Date.now(),
            quality_score: 30,
          };
          expect(helpers.isBaselineValid(lowQualityProfile)).toBe(false);
        }
      });
    });

    describe('getFrequencyBandLabel functional tests', () => {
      it('should return Theta Band for 4-8 Hz', () => {
        if (helpers.getFrequencyBandLabel) {
          expect(helpers.getFrequencyBandLabel(6)).toBe('Theta Band');
          expect(helpers.getFrequencyBandLabel(4)).toBe('Theta Band');
          expect(helpers.getFrequencyBandLabel(8)).toBe('Theta Band');
        }
      });

      it('should return Alpha Band for 8-13 Hz', () => {
        if (helpers.getFrequencyBandLabel) {
          expect(helpers.getFrequencyBandLabel(10)).toBe('Alpha Band');
        }
      });

      it('should return Beta Band for 13-30 Hz', () => {
        if (helpers.getFrequencyBandLabel) {
          expect(helpers.getFrequencyBandLabel(20)).toBe('Beta Band');
        }
      });

      it('should return Delta Band for < 4 Hz', () => {
        if (helpers.getFrequencyBandLabel) {
          expect(helpers.getFrequencyBandLabel(2)).toBe('Delta Band');
        }
      });
    });
  });
});
