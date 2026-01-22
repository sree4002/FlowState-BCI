/**
 * Tests for SignalQualityIndicator component
 *
 * Validates the Signal Quality indicator implementation including:
 * - File structure and exports
 * - Required imports and dependencies
 * - React Native components used
 * - TypeScript interfaces and types
 * - Props interface
 * - Context integration
 * - Helper functions
 * - Signal quality level determination
 * - Visual elements (bars, colors, labels)
 * - Modal functionality
 * - Accessibility features
 * - Animation implementation
 * - Position variants
 * - Size variants
 * - Theme-based styling
 */

import * as fs from 'fs';
import * as path from 'path';

const componentPath = path.join(
  __dirname,
  '..',
  'src',
  'components',
  'SignalQualityIndicator.tsx'
);
const indexPath = path.join(__dirname, '..', 'src', 'components', 'index.ts');

let componentContent: string;
let indexContent: string;

beforeAll(() => {
  componentContent = fs.readFileSync(componentPath, 'utf-8');
  indexContent = fs.readFileSync(indexPath, 'utf-8');
});

describe('SignalQualityIndicator', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React component file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should export SignalQualityIndicator component', () => {
      expect(componentContent).toMatch(
        /export\s+(const|function)\s+SignalQualityIndicator/
      );
    });

    it('should have a default export', () => {
      expect(componentContent).toMatch(
        /export\s+default\s+SignalQualityIndicator/
      );
    });
  });

  describe('Component Exports in index.ts', () => {
    it('should export SignalQualityIndicator from index', () => {
      expect(indexContent).toContain('export { SignalQualityIndicator }');
    });

    it('should export SignalQualityIndicatorProps type', () => {
      expect(indexContent).toContain('SignalQualityIndicatorProps');
    });

    it('should export SignalQualityLevel type', () => {
      expect(indexContent).toContain('SignalQualityLevel');
    });

    it('should export getSignalQualityLevel helper', () => {
      expect(indexContent).toContain('getSignalQualityLevel');
    });

    it('should export getSignalQualityColor helper', () => {
      expect(indexContent).toContain('getSignalQualityColor');
    });

    it('should export getSignalQualityLabel helper', () => {
      expect(indexContent).toContain('getSignalQualityLabel');
    });

    it('should export getSignalQualityIcon helper', () => {
      expect(indexContent).toContain('getSignalQualityIcon');
    });

    it('should export getSignalBars helper', () => {
      expect(indexContent).toContain('getSignalBars');
    });

    it('should export getSignalAccessibilityLabel helper', () => {
      expect(indexContent).toContain('getSignalAccessibilityLabel');
    });

    it('should export getSignalAccessibilityHint helper', () => {
      expect(indexContent).toContain('getSignalAccessibilityHint');
    });

    it('should export getSignalQualityDetails helper', () => {
      expect(indexContent).toContain('getSignalQualityDetails');
    });

    it('should export getPositionStyles helper', () => {
      expect(indexContent).toContain('getPositionStyles');
    });
  });

  describe('Required Imports', () => {
    it('should import React', () => {
      expect(componentContent).toMatch(/import\s+React/);
    });

    it('should import useState from React', () => {
      expect(componentContent).toMatch(/useState/);
    });

    it('should import useRef from React', () => {
      expect(componentContent).toMatch(/useRef/);
    });

    it('should import useEffect from React', () => {
      expect(componentContent).toMatch(/useEffect/);
    });

    it('should import TouchableOpacity from react-native', () => {
      expect(componentContent).toMatch(/TouchableOpacity/);
    });

    it('should import Text from react-native', () => {
      expect(componentContent).toMatch(/Text/);
    });

    it('should import View from react-native', () => {
      expect(componentContent).toMatch(/View/);
    });

    it('should import StyleSheet from react-native', () => {
      expect(componentContent).toMatch(/StyleSheet/);
    });

    it('should import Animated from react-native', () => {
      expect(componentContent).toMatch(/Animated/);
    });

    it('should import Modal from react-native', () => {
      expect(componentContent).toMatch(/Modal/);
    });

    it('should import AccessibilityState from react-native', () => {
      expect(componentContent).toMatch(/AccessibilityState/);
    });

    it('should import useDevice from contexts', () => {
      expect(componentContent).toMatch(/useDevice/);
    });

    it('should import Colors from theme', () => {
      expect(componentContent).toMatch(/Colors/);
    });

    it('should import Spacing from theme', () => {
      expect(componentContent).toMatch(/Spacing/);
    });

    it('should import BorderRadius from theme', () => {
      expect(componentContent).toMatch(/BorderRadius/);
    });

    it('should import Typography from theme', () => {
      expect(componentContent).toMatch(/Typography/);
    });

    it('should import Shadows from theme', () => {
      expect(componentContent).toMatch(/Shadows/);
    });

    it('should import SignalQuality type', () => {
      expect(componentContent).toMatch(/SignalQuality/);
    });
  });

  describe('Props Interface', () => {
    it('should define SignalQualityIndicatorProps interface', () => {
      expect(componentContent).toMatch(
        /export\s+interface\s+SignalQualityIndicatorProps/
      );
    });

    it('should have onPress prop', () => {
      expect(componentContent).toMatch(/onPress\??\s*:\s*\(\)/);
    });

    it('should have size prop', () => {
      expect(componentContent).toMatch(/size\??\s*:/);
    });

    it('should have position prop', () => {
      expect(componentContent).toMatch(/position\??\s*:/);
    });

    it('should have showDetailsOnTap prop', () => {
      expect(componentContent).toMatch(/showDetailsOnTap\??\s*:\s*boolean/);
    });

    it('should have testID prop', () => {
      expect(componentContent).toMatch(/testID\??\s*:\s*string/);
    });
  });

  describe('SignalQualityLevel Type', () => {
    it('should define SignalQualityLevel type', () => {
      expect(componentContent).toMatch(/export\s+type\s+SignalQualityLevel/);
    });

    it('should include excellent level', () => {
      expect(componentContent).toMatch(/'excellent'/);
    });

    it('should include good level', () => {
      expect(componentContent).toMatch(/'good'/);
    });

    it('should include fair level', () => {
      expect(componentContent).toMatch(/'fair'/);
    });

    it('should include poor level', () => {
      expect(componentContent).toMatch(/'poor'/);
    });

    it('should include critical level', () => {
      expect(componentContent).toMatch(/'critical'/);
    });

    it('should include unknown level', () => {
      expect(componentContent).toMatch(/'unknown'/);
    });
  });

  describe('Size Variants', () => {
    it('should support small size', () => {
      expect(componentContent).toContain("'small'");
    });

    it('should support medium size', () => {
      expect(componentContent).toContain("'medium'");
    });

    it('should support large size', () => {
      expect(componentContent).toContain("'large'");
    });

    it('should have medium as default size', () => {
      expect(componentContent).toMatch(/size\s*=\s*['"]medium['"]/);
    });

    it('should have different styles for small size', () => {
      expect(componentContent).toMatch(/containerSmall/);
    });

    it('should have different styles for medium size', () => {
      expect(componentContent).toMatch(/containerMedium/);
    });

    it('should have different styles for large size', () => {
      expect(componentContent).toMatch(/containerLarge/);
    });

    it('should have bar styles for each size', () => {
      expect(componentContent).toMatch(/barSmall/);
      expect(componentContent).toMatch(/barMedium/);
      expect(componentContent).toMatch(/barLarge/);
    });

    it('should have label styles for each size', () => {
      expect(componentContent).toMatch(/labelSmall/);
      expect(componentContent).toMatch(/labelMedium/);
      expect(componentContent).toMatch(/labelLarge/);
    });
  });

  describe('Position Variants', () => {
    it('should support top-left position', () => {
      expect(componentContent).toContain("'top-left'");
    });

    it('should support top-right position', () => {
      expect(componentContent).toContain("'top-right'");
    });

    it('should support bottom-left position', () => {
      expect(componentContent).toContain("'bottom-left'");
    });

    it('should support bottom-right position', () => {
      expect(componentContent).toContain("'bottom-right'");
    });

    it('should have top-right as default position', () => {
      expect(componentContent).toMatch(/position\s*=\s*['"]top-right['"]/);
    });
  });

  describe('Helper Functions', () => {
    describe('getSignalQualityLevel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalQualityLevel/
        );
      });

      it('should accept score parameter', () => {
        expect(componentContent).toMatch(
          /getSignalQualityLevel\s*\(\s*\n?\s*score/
        );
      });

      it('should return excellent for score >= 80', () => {
        expect(componentContent).toMatch(/score\s*>=\s*80[\s\S]*?excellent/);
      });

      it('should return good for score >= 60', () => {
        expect(componentContent).toMatch(/score\s*>=\s*60[\s\S]*?good/);
      });

      it('should return fair for score >= 40', () => {
        expect(componentContent).toMatch(/score\s*>=\s*40[\s\S]*?fair/);
      });

      it('should return poor for score >= 20', () => {
        expect(componentContent).toMatch(/score\s*>=\s*20[\s\S]*?poor/);
      });

      it('should return critical for score < 20', () => {
        expect(componentContent).toMatch(/return\s*['"]critical['"]/);
      });

      it('should return unknown for null score', () => {
        expect(componentContent).toMatch(/null[\s\S]*?unknown/);
      });
    });

    describe('getSignalQualityColor', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalQualityColor/
        );
      });

      it('should accept level parameter', () => {
        expect(componentContent).toMatch(/getSignalQualityColor\s*\(\s*level/);
      });

      it('should use Colors.signal.excellent for excellent', () => {
        expect(componentContent).toMatch(/Colors\.signal\.excellent/);
      });

      it('should use Colors.signal.good for good', () => {
        expect(componentContent).toMatch(/Colors\.signal\.good/);
      });

      it('should use Colors.signal.fair for fair', () => {
        expect(componentContent).toMatch(/Colors\.signal\.fair/);
      });

      it('should use Colors.signal.poor for poor', () => {
        expect(componentContent).toMatch(/Colors\.signal\.poor/);
      });

      it('should use Colors.signal.critical for critical', () => {
        expect(componentContent).toMatch(/Colors\.signal\.critical/);
      });

      it('should use disabled color for unknown', () => {
        expect(componentContent).toMatch(/Colors\.interactive\.disabled/);
      });
    });

    describe('getSignalQualityLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalQualityLabel/
        );
      });

      it('should return Excellent for excellent level', () => {
        expect(componentContent).toMatch(/['"]Excellent['"]/);
      });

      it('should return Good for good level', () => {
        expect(componentContent).toMatch(/['"]Good['"]/);
      });

      it('should return Fair for fair level', () => {
        expect(componentContent).toMatch(/['"]Fair['"]/);
      });

      it('should return Poor for poor level', () => {
        expect(componentContent).toMatch(/['"]Poor['"]/);
      });

      it('should return Critical for critical level', () => {
        expect(componentContent).toMatch(/['"]Critical['"]/);
      });

      it('should return Unknown for unknown level', () => {
        expect(componentContent).toMatch(/['"]Unknown['"]/);
      });
    });

    describe('getSignalQualityIcon', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalQualityIcon/
        );
      });

      it('should return signal icon', () => {
        expect(componentContent).toMatch(/📶/);
      });

      it('should return warning icon for critical', () => {
        expect(componentContent).toMatch(/⚠️/);
      });

      it('should return question icon for unknown', () => {
        expect(componentContent).toMatch(/❓/);
      });
    });

    describe('getSignalBars', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getSignalBars/);
      });

      it('should return 4 for excellent', () => {
        expect(componentContent).toMatch(/excellent[\s\S]*?return\s*4/);
      });

      it('should return 3 for good', () => {
        expect(componentContent).toMatch(/good[\s\S]*?return\s*3/);
      });

      it('should return 2 for fair', () => {
        expect(componentContent).toMatch(/fair[\s\S]*?return\s*2/);
      });

      it('should return 1 for poor', () => {
        expect(componentContent).toMatch(/poor[\s\S]*?return\s*1/);
      });

      it('should return 0 for critical', () => {
        expect(componentContent).toMatch(/return\s*0/);
      });
    });

    describe('getSignalAccessibilityLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalAccessibilityLabel/
        );
      });

      it('should include Signal quality in label', () => {
        expect(componentContent).toMatch(/Signal quality/);
      });

      it('should include percent in label', () => {
        expect(componentContent).toMatch(/percent/);
      });
    });

    describe('getSignalAccessibilityHint', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalAccessibilityHint/
        );
      });

      it('should mention double tap', () => {
        expect(componentContent).toMatch(/Double tap/);
      });

      it('should mention signal quality details', () => {
        expect(componentContent).toMatch(/signal quality details/);
      });
    });

    describe('getSignalQualityDetails', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getSignalQualityDetails/
        );
      });

      it('should accept signalQuality parameter', () => {
        expect(componentContent).toMatch(
          /getSignalQualityDetails\s*\(\s*\n?\s*signalQuality/
        );
      });

      it('should return score', () => {
        expect(componentContent).toMatch(/score:/);
      });

      it('should return artifacts', () => {
        expect(componentContent).toMatch(/artifacts:/);
      });

      it('should return amplitudeArtifact', () => {
        expect(componentContent).toMatch(/amplitudeArtifact:/);
      });

      it('should return gradientArtifact', () => {
        expect(componentContent).toMatch(/gradientArtifact:/);
      });

      it('should return frequencyArtifact', () => {
        expect(componentContent).toMatch(/frequencyArtifact:/);
      });

      it('should return N/A for null signal quality', () => {
        expect(componentContent).toMatch(/['"]N\/A['"]/);
      });

      it('should return Detected or None for artifacts', () => {
        expect(componentContent).toMatch(/['"]Detected['"]/);
        expect(componentContent).toMatch(/['"]None['"]/);
      });
    });

    describe('getPositionStyles', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getPositionStyles/);
      });

      it('should accept position parameter', () => {
        expect(componentContent).toMatch(
          /getPositionStyles\s*\(\s*\n?\s*position/
        );
      });

      it('should return top and left for top-left', () => {
        expect(componentContent).toMatch(/top-left[\s\S]*?top:/);
        expect(componentContent).toMatch(/top-left[\s\S]*?left:/);
      });

      it('should return top and right for top-right', () => {
        expect(componentContent).toMatch(/top-right[\s\S]*?right:/);
      });

      it('should return bottom and left for bottom-left', () => {
        expect(componentContent).toMatch(/bottom-left[\s\S]*?bottom:/);
      });

      it('should return bottom and right for bottom-right', () => {
        expect(componentContent).toMatch(/bottom-right[\s\S]*?bottom:/);
      });
    });
  });

  describe('Context Integration', () => {
    it('should use useDevice hook', () => {
      expect(componentContent).toMatch(/const\s*\{[^}]*\}\s*=\s*useDevice\(\)/);
    });

    it('should destructure signalQuality from context', () => {
      expect(componentContent).toMatch(/signalQuality/);
    });
  });

  describe('State Management', () => {
    it('should use useState for modal visibility', () => {
      expect(componentContent).toMatch(/useState\(false\)/);
    });

    it('should have modalVisible state', () => {
      expect(componentContent).toMatch(/modalVisible/);
    });

    it('should have setModalVisible setter', () => {
      expect(componentContent).toMatch(/setModalVisible/);
    });
  });

  describe('Modal Functionality', () => {
    it('should render Modal component', () => {
      expect(componentContent).toMatch(/<Modal/);
    });

    it('should set modal to transparent', () => {
      expect(componentContent).toMatch(/transparent/);
    });

    it('should use fade animation', () => {
      expect(componentContent).toMatch(/animationType\s*=\s*["']fade["']/);
    });

    it('should have onRequestClose handler', () => {
      expect(componentContent).toMatch(/onRequestClose/);
    });

    it('should have closeModal function', () => {
      expect(componentContent).toMatch(/closeModal/);
    });

    it('should have modal overlay', () => {
      expect(componentContent).toMatch(/modalOverlay/);
    });

    it('should have modal content', () => {
      expect(componentContent).toMatch(/modalContent/);
    });

    it('should have modal title', () => {
      expect(componentContent).toMatch(/modalTitle/);
    });

    it('should display Signal Quality Details title', () => {
      expect(componentContent).toMatch(/Signal Quality Details/);
    });

    it('should have close button', () => {
      expect(componentContent).toMatch(/closeButton/);
    });

    it('should display Close text', () => {
      expect(componentContent).toMatch(/Close/);
    });
  });

  describe('Modal Content', () => {
    it('should display Quality Score', () => {
      expect(componentContent).toMatch(/Quality Score/);
    });

    it('should display Quality Level', () => {
      expect(componentContent).toMatch(/Quality Level/);
    });

    it('should display Artifact Percentage', () => {
      expect(componentContent).toMatch(/Artifact Percentage/);
    });

    it('should have Artifact Detection section', () => {
      expect(componentContent).toMatch(/Artifact Detection/);
    });

    it('should display Amplitude artifact info', () => {
      expect(componentContent).toMatch(/Amplitude/);
    });

    it('should display Gradient artifact info', () => {
      expect(componentContent).toMatch(/Gradient/);
    });

    it('should display Frequency Ratio artifact info', () => {
      expect(componentContent).toMatch(/Frequency Ratio/);
    });

    it('should have status dot', () => {
      expect(componentContent).toMatch(/statusDot/);
    });

    it('should have divider', () => {
      expect(componentContent).toMatch(/divider/);
    });
  });

  describe('Signal Bars Visualization', () => {
    it('should have barsContainer', () => {
      expect(componentContent).toMatch(/barsContainer/);
    });

    it('should render 4 bars', () => {
      expect(componentContent).toMatch(
        /for\s*\(\s*let\s+i\s*=\s*0;\s*i\s*<\s*4/
      );
    });

    it('should have renderBars function', () => {
      expect(componentContent).toMatch(/renderBars/);
    });

    it('should determine bar active state', () => {
      expect(componentContent).toMatch(/isActive/);
    });

    it('should set different bar heights', () => {
      expect(componentContent).toMatch(/barHeight/);
    });

    it('should use color for active bars', () => {
      expect(componentContent).toMatch(/isActive\s*\?\s*color/);
    });

    it('should use disabled color for inactive bars', () => {
      expect(componentContent).toMatch(/Colors\.interactive\.disabled/);
    });
  });

  describe('Animation Implementation', () => {
    it('should use Animated.Value for scale', () => {
      expect(componentContent).toMatch(/new\s+Animated\.Value/);
    });

    it('should use useRef for animation values', () => {
      expect(componentContent).toMatch(/useRef\(new\s+Animated\.Value/);
    });

    it('should have scaleAnim', () => {
      expect(componentContent).toMatch(/scaleAnim/);
    });

    it('should have pulseAnim', () => {
      expect(componentContent).toMatch(/pulseAnim/);
    });

    it('should use Animated.spring for press feedback', () => {
      expect(componentContent).toMatch(/Animated\.spring/);
    });

    it('should have handlePressIn for press animation', () => {
      expect(componentContent).toMatch(/handlePressIn/);
    });

    it('should have handlePressOut for release animation', () => {
      expect(componentContent).toMatch(/handlePressOut/);
    });

    it('should use useNativeDriver for performance', () => {
      expect(componentContent).toMatch(/useNativeDriver:\s*true/);
    });

    it('should scale down on press', () => {
      expect(componentContent).toMatch(/toValue:\s*0\.95/);
    });

    it('should scale back to 1 on release', () => {
      expect(componentContent).toMatch(/toValue:\s*1/);
    });
  });

  describe('Pulse Animation for Critical Signal', () => {
    it('should use useEffect for pulse animation', () => {
      expect(componentContent).toMatch(/useEffect\(/);
    });

    it('should check for critical level', () => {
      expect(componentContent).toMatch(/level\s*===\s*['"]critical['"]/);
    });

    it('should use Animated.loop for pulse', () => {
      expect(componentContent).toMatch(/Animated\.loop/);
    });

    it('should use Animated.sequence for pulse', () => {
      expect(componentContent).toMatch(/Animated\.sequence/);
    });

    it('should use Animated.timing for pulse steps', () => {
      expect(componentContent).toMatch(/Animated\.timing/);
    });

    it('should pulse to 1.1 scale', () => {
      expect(componentContent).toMatch(/toValue:\s*1\.1/);
    });

    it('should have 500ms duration for pulse', () => {
      expect(componentContent).toMatch(/duration:\s*500/);
    });

    it('should stop pulse animation on cleanup', () => {
      expect(componentContent).toMatch(/pulse\.stop\(\)/);
    });
  });

  describe('Accessibility Features', () => {
    it('should have accessibilityRole="button"', () => {
      expect(componentContent).toMatch(
        /accessibilityRole\s*=\s*["']button["']/
      );
    });

    it('should have accessibilityLabel', () => {
      expect(componentContent).toMatch(/accessibilityLabel\s*=/);
    });

    it('should have accessibilityHint', () => {
      expect(componentContent).toMatch(/accessibilityHint\s*=/);
    });

    it('should have accessibilityState', () => {
      expect(componentContent).toMatch(/accessibilityState\s*=/);
    });
  });

  describe('Visual Elements', () => {
    it('should render signal bars', () => {
      expect(componentContent).toMatch(/renderBars/);
    });

    it('should render percentage label', () => {
      expect(componentContent).toMatch(/%/);
    });

    it('should show --- when no score', () => {
      expect(componentContent).toMatch(/---/);
    });

    it('should hide label on small size', () => {
      expect(componentContent).toMatch(/size\s*!==\s*['"]small['"]/);
    });
  });

  describe('Touch Handling', () => {
    it('should have onPress handler', () => {
      expect(componentContent).toMatch(/onPress\s*=\s*\{handlePress\}/);
    });

    it('should have onPressIn handler', () => {
      expect(componentContent).toMatch(/onPressIn\s*=\s*\{handlePressIn\}/);
    });

    it('should have onPressOut handler', () => {
      expect(componentContent).toMatch(/onPressOut\s*=\s*\{handlePressOut\}/);
    });

    it('should set activeOpacity', () => {
      expect(componentContent).toMatch(/activeOpacity/);
    });

    it('should call custom onPress when provided', () => {
      expect(componentContent).toMatch(/onPress\(\)/);
    });

    it('should show modal when showDetailsOnTap is true', () => {
      expect(componentContent).toMatch(/showDetailsOnTap/);
    });
  });

  describe('Test IDs', () => {
    it('should have default testID', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]signal-quality-indicator['"]/
      );
    });

    it('should have testID for container', () => {
      expect(componentContent).toMatch(/-container`\}/);
    });

    it('should have testID for bars', () => {
      expect(componentContent).toMatch(/-bars/);
    });

    it('should have testID for individual bars', () => {
      expect(componentContent).toMatch(/-bar-/);
    });

    it('should have testID for label', () => {
      expect(componentContent).toMatch(/-label/);
    });

    it('should have testID for modal', () => {
      expect(componentContent).toMatch(/-modal/);
    });

    it('should have testID for modal overlay', () => {
      expect(componentContent).toMatch(/-modal-overlay/);
    });

    it('should have testID for modal content', () => {
      expect(componentContent).toMatch(/-modal-content/);
    });

    it('should have testID for modal title', () => {
      expect(componentContent).toMatch(/-modal-title/);
    });

    it('should have testID for close button', () => {
      expect(componentContent).toMatch(/-close-button/);
    });

    it('should have testID for status dot', () => {
      expect(componentContent).toMatch(/-status-dot/);
    });
  });

  describe('Styling', () => {
    it('should define styles with StyleSheet.create', () => {
      expect(componentContent).toMatch(/StyleSheet\.create\(/);
    });

    it('should have outerContainer style', () => {
      expect(componentContent).toMatch(/outerContainer\s*:/);
    });

    it('should have container style', () => {
      expect(componentContent).toMatch(/container\s*:/);
    });

    it('should have barsContainer style', () => {
      expect(componentContent).toMatch(/barsContainer\s*:/);
    });

    it('should have bar style', () => {
      expect(componentContent).toMatch(/bar\s*:/);
    });

    it('should have label style', () => {
      expect(componentContent).toMatch(/label\s*:/);
    });

    it('should use position absolute for corner placement', () => {
      expect(componentContent).toMatch(/position:\s*['"]absolute['"]/);
    });

    it('should use zIndex for layering', () => {
      expect(componentContent).toMatch(/zIndex:\s*100/);
    });

    it('should use BorderRadius for container shape', () => {
      expect(componentContent).toMatch(/BorderRadius\.(sm|md|lg|xl)/);
    });

    it('should use theme shadows', () => {
      expect(componentContent).toMatch(/\.\.\.Shadows\.(sm|md|lg)/);
    });

    it('should use Colors.surface.elevated for background', () => {
      expect(componentContent).toMatch(/Colors\.surface\.elevated/);
    });

    it('should use Colors.text.primary for text', () => {
      expect(componentContent).toMatch(/Colors\.text\.primary/);
    });

    it('should use Colors.text.secondary for labels', () => {
      expect(componentContent).toMatch(/Colors\.text\.secondary/);
    });

    it('should have small container dimensions (36x36)', () => {
      expect(componentContent).toMatch(/width:\s*36/);
      expect(componentContent).toMatch(/height:\s*36/);
    });

    it('should have medium container dimensions (56x56)', () => {
      expect(componentContent).toMatch(/width:\s*56/);
      expect(componentContent).toMatch(/height:\s*56/);
    });

    it('should have large container dimensions (72x72)', () => {
      expect(componentContent).toMatch(/width:\s*72/);
      expect(componentContent).toMatch(/height:\s*72/);
    });

    it('should use bold font weight for label', () => {
      expect(componentContent).toMatch(/Typography\.fontWeight\.bold/);
    });

    it('should use semibold font weight for values', () => {
      expect(componentContent).toMatch(/Typography\.fontWeight\.semibold/);
    });
  });

  describe('Modal Styling', () => {
    it('should have modalOverlay style', () => {
      expect(componentContent).toMatch(/modalOverlay\s*:/);
    });

    it('should have modalContent style', () => {
      expect(componentContent).toMatch(/modalContent\s*:/);
    });

    it('should have modalTitle style', () => {
      expect(componentContent).toMatch(/modalTitle\s*:/);
    });

    it('should have detailRow style', () => {
      expect(componentContent).toMatch(/detailRow\s*:/);
    });

    it('should have detailLabel style', () => {
      expect(componentContent).toMatch(/detailLabel\s*:/);
    });

    it('should have detailValue style', () => {
      expect(componentContent).toMatch(/detailValue\s*:/);
    });

    it('should have closeButton style', () => {
      expect(componentContent).toMatch(/closeButton\s*:/);
    });

    it('should have closeButtonText style', () => {
      expect(componentContent).toMatch(/closeButtonText\s*:/);
    });

    it('should use overlay color for modal background', () => {
      expect(componentContent).toMatch(/Colors\.overlay\.medium/);
    });

    it('should center modal content', () => {
      expect(componentContent).toMatch(/justifyContent:\s*['"]center['"]/);
      expect(componentContent).toMatch(/alignItems:\s*['"]center['"]/);
    });
  });

  describe('Default Prop Values', () => {
    it('should have default size value of medium', () => {
      expect(componentContent).toMatch(/size\s*=\s*['"]medium['"]/);
    });

    it('should have default position value of top-right', () => {
      expect(componentContent).toMatch(/position\s*=\s*['"]top-right['"]/);
    });

    it('should have default showDetailsOnTap value of true', () => {
      expect(componentContent).toMatch(/showDetailsOnTap\s*=\s*true/);
    });

    it('should have default testID value', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]signal-quality-indicator['"]/
      );
    });
  });

  describe('Component Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?SignalQualityIndicator/);
    });

    it('should document features in JSDoc', () => {
      expect(componentContent).toMatch(/Features:/);
    });

    it('should have JSDoc for props interface', () => {
      expect(componentContent).toMatch(
        /\/\*\*[\s\S]*?Props for SignalQualityIndicator/
      );
    });

    it('should mention corner placement in docs', () => {
      expect(componentContent).toMatch(/corner/i);
    });

    it('should mention tap for details in docs', () => {
      expect(componentContent).toMatch(/Tap to view/i);
    });

    it('should mention signal bars in docs', () => {
      expect(componentContent).toMatch(/Signal bars/i);
    });

    it('should mention pulse animation in docs', () => {
      expect(componentContent).toMatch(/puls/i);
    });
  });

  describe('Artifact Color Coding', () => {
    it('should use warning color for detected artifacts', () => {
      expect(componentContent).toMatch(/Colors\.accent\.warning/);
    });

    it('should use success color for no artifacts', () => {
      expect(componentContent).toMatch(/Colors\.accent\.success/);
    });
  });

  describe('Score Formatting', () => {
    it('should round score value', () => {
      expect(componentContent).toMatch(/Math\.round\(score\)/);
    });

    it('should round signalQuality.score', () => {
      expect(componentContent).toMatch(/Math\.round\(signalQuality\.score\)/);
    });

    it('should round artifact_percentage', () => {
      expect(componentContent).toMatch(
        /Math\.round\(signalQuality\.artifact_percentage\)/
      );
    });
  });

  describe('Border Color', () => {
    it('should have border on container', () => {
      expect(componentContent).toMatch(/borderWidth:\s*2/);
    });

    it('should set border color dynamically', () => {
      expect(componentContent).toMatch(/borderColor:\s*color/);
    });
  });
});
