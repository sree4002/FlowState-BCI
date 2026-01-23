/**
 * Tests for PauseResumeButton component
 *
 * Validates the large Pause/Resume button implementation including:
 * - File structure and exports
 * - Required imports and dependencies
 * - React Native components used
 * - TypeScript interfaces and types
 * - Props interface
 * - Context integration
 * - Helper functions
 * - State-based UI rendering
 * - Accessibility features
 * - Animation implementation
 * - Theme-based styling
 */

import * as fs from 'fs';
import * as path from 'path';

const componentPath = path.join(
  __dirname,
  '..',
  'src',
  'components',
  'PauseResumeButton.tsx'
);
const indexPath = path.join(__dirname, '..', 'src', 'components', 'index.ts');

let componentContent: string;
let indexContent: string;

beforeAll(() => {
  componentContent = fs.readFileSync(componentPath, 'utf-8');
  indexContent = fs.readFileSync(indexPath, 'utf-8');
});

describe('PauseResumeButton', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React component file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should export PauseResumeButton component', () => {
      expect(componentContent).toMatch(
        /export\s+(const|function)\s+PauseResumeButton/
      );
    });

    it('should have a default export', () => {
      expect(componentContent).toMatch(/export\s+default\s+PauseResumeButton/);
    });
  });

  describe('Component Exports in index.ts', () => {
    it('should export PauseResumeButton from index', () => {
      expect(indexContent).toContain('export { PauseResumeButton }');
    });

    it('should export PauseResumeButtonProps type', () => {
      expect(indexContent).toContain('export type { PauseResumeButtonProps }');
    });

    it('should export getButtonLabel helper', () => {
      expect(indexContent).toContain('getButtonLabel');
    });

    it('should export getButtonColor helper', () => {
      expect(indexContent).toContain('getButtonColor');
    });

    it('should export getAccessibilityLabel helper', () => {
      expect(indexContent).toContain('getAccessibilityLabel');
    });

    it('should export getAccessibilityHint helper', () => {
      expect(indexContent).toContain('getAccessibilityHint');
    });

    it('should export getButtonIcon helper', () => {
      expect(indexContent).toContain('getButtonIcon');
    });
  });

  describe('Required Imports', () => {
    it('should import React', () => {
      expect(componentContent).toMatch(/import\s+React/);
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

    it('should import AccessibilityState from react-native', () => {
      expect(componentContent).toMatch(/AccessibilityState/);
    });

    it('should import useSession from contexts', () => {
      expect(componentContent).toMatch(/useSession/);
    });

    it('should import Colors from theme', () => {
      expect(componentContent).toMatch(/Colors/);
    });

    it('should import Spacing from theme', () => {
      expect(componentContent).toMatch(/Spacing/);
    });

    it('should import Typography from theme', () => {
      expect(componentContent).toMatch(/Typography/);
    });

    it('should import Shadows from theme', () => {
      expect(componentContent).toMatch(/Shadows/);
    });

    it('should import SessionState type', () => {
      expect(componentContent).toMatch(/SessionState/);
    });
  });

  describe('Props Interface', () => {
    it('should define PauseResumeButtonProps interface', () => {
      expect(componentContent).toMatch(
        /export\s+interface\s+PauseResumeButtonProps/
      );
    });

    it('should have onPress prop', () => {
      expect(componentContent).toMatch(/onPress\??\s*:\s*\(\)/);
    });

    it('should have disabled prop', () => {
      expect(componentContent).toMatch(/disabled\??\s*:\s*boolean/);
    });

    it('should have size prop', () => {
      expect(componentContent).toMatch(/size\??\s*:/);
    });

    it('should have testID prop', () => {
      expect(componentContent).toMatch(/testID\??\s*:\s*string/);
    });
  });

  describe('Size Variants', () => {
    it('should support medium size', () => {
      expect(componentContent).toContain("'medium'");
    });

    it('should support large size', () => {
      expect(componentContent).toContain("'large'");
    });

    it('should have large as default size', () => {
      expect(componentContent).toMatch(/size\s*=\s*['"]large['"]/);
    });

    it('should have different styles for large size', () => {
      expect(componentContent).toMatch(/buttonLarge/);
    });

    it('should have different styles for medium size', () => {
      expect(componentContent).toMatch(/buttonMedium/);
    });
  });

  describe('Helper Functions', () => {
    describe('getButtonLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getButtonLabel/);
      });

      it('should return Pause for running state', () => {
        expect(componentContent).toMatch(
          /'running'[\s\S]*?return\s+['"]Pause['"]/
        );
      });

      it('should return Resume for paused state', () => {
        expect(componentContent).toMatch(
          /'paused'[\s\S]*?return\s+['"]Resume['"]/
        );
      });

      it('should return Start for idle state', () => {
        expect(componentContent).toMatch(
          /'idle'[\s\S]*?return\s+['"]Start['"]/
        );
      });

      it('should return Restart for stopped state', () => {
        expect(componentContent).toMatch(
          /'stopped'[\s\S]*?return\s+['"]Restart['"]/
        );
      });
    });

    describe('getButtonColor', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getButtonColor/);
      });

      it('should accept sessionState parameter', () => {
        expect(componentContent).toMatch(
          /getButtonColor\s*\(\s*\n?\s*sessionState/
        );
      });

      it('should accept disabled parameter', () => {
        expect(componentContent).toMatch(/getButtonColor[\s\S]*?disabled/);
      });

      it('should return disabled color when disabled', () => {
        expect(componentContent).toMatch(/Colors\.interactive\.disabled/);
      });

      it('should use secondary color for running state', () => {
        expect(componentContent).toMatch(/Colors\.secondary\.main/);
      });

      it('should use success color for paused state', () => {
        expect(componentContent).toMatch(/Colors\.accent\.success/);
      });

      it('should use primary color for idle state', () => {
        expect(componentContent).toMatch(/Colors\.primary\.main/);
      });
    });

    describe('getAccessibilityLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getAccessibilityLabel/
        );
      });

      it('should return Pause session for running', () => {
        expect(componentContent).toMatch(/['"]Pause session['"]/);
      });

      it('should return Resume session for paused', () => {
        expect(componentContent).toMatch(/['"]Resume session['"]/);
      });

      it('should return Start session for idle', () => {
        expect(componentContent).toMatch(/['"]Start session['"]/);
      });

      it('should return Restart session for stopped', () => {
        expect(componentContent).toMatch(/['"]Restart session['"]/);
      });
    });

    describe('getAccessibilityHint', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getAccessibilityHint/
        );
      });

      it('should provide double tap instruction', () => {
        expect(componentContent).toMatch(/Double tap to/);
      });
    });

    describe('getButtonIcon', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getButtonIcon/);
      });

      it('should return pause symbol for running state', () => {
        expect(componentContent).toMatch(/⏸/);
      });

      it('should return play symbol for paused state', () => {
        expect(componentContent).toMatch(/▶/);
      });

      it('should return restart symbol for stopped state', () => {
        expect(componentContent).toMatch(/↻/);
      });
    });
  });

  describe('Context Integration', () => {
    it('should use useSession hook', () => {
      expect(componentContent).toMatch(
        /const\s*\{[^}]*\}\s*=\s*useSession\(\)/
      );
    });

    it('should destructure sessionState from context', () => {
      expect(componentContent).toMatch(/sessionState/);
    });

    it('should destructure setSessionState from context', () => {
      expect(componentContent).toMatch(/setSessionState/);
    });
  });

  describe('State Handling', () => {
    it('should handle running state', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]running['"]/);
    });

    it('should handle paused state', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]paused['"]/);
    });

    it('should handle idle state', () => {
      expect(componentContent).toMatch(/case\s*['"]idle['"]/);
    });

    it('should handle stopped state', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]stopped['"]/);
    });

    it('should toggle from running to paused', () => {
      expect(componentContent).toMatch(
        /'running'[\s\S]*?setSessionState\(['"]paused['"]\)/
      );
    });

    it('should toggle from paused to running', () => {
      expect(componentContent).toMatch(
        /'paused'[\s\S]*?setSessionState\(['"]running['"]\)/
      );
    });
  });

  describe('Animation Implementation', () => {
    it('should use Animated.Value for scale', () => {
      expect(componentContent).toMatch(/new\s+Animated\.Value/);
    });

    it('should use useRef for animation values', () => {
      expect(componentContent).toMatch(/useRef\(new\s+Animated\.Value/);
    });

    it('should implement pulse animation for running state', () => {
      expect(componentContent).toMatch(/pulseAnim/);
    });

    it('should use Animated.loop for pulse', () => {
      expect(componentContent).toMatch(/Animated\.loop/);
    });

    it('should use Animated.sequence', () => {
      expect(componentContent).toMatch(/Animated\.sequence/);
    });

    it('should use Animated.timing', () => {
      expect(componentContent).toMatch(/Animated\.timing/);
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

    it('should set disabled in accessibilityState', () => {
      expect(componentContent).toMatch(/accessibilityState[\s\S]*?disabled/);
    });

    it('should set busy in accessibilityState for running', () => {
      expect(componentContent).toMatch(
        /busy:\s*sessionState\s*===\s*['"]running['"]/
      );
    });
  });

  describe('Visual Elements', () => {
    it('should render button icon', () => {
      expect(componentContent).toMatch(/buttonIcon/);
    });

    it('should render button label', () => {
      expect(componentContent).toMatch(/buttonLabel/);
    });

    it('should have running indicator ring', () => {
      expect(componentContent).toMatch(/runningIndicatorRing/);
    });

    it('should have state label below button', () => {
      expect(componentContent).toMatch(/stateLabel/);
    });

    it('should show "Session in progress" for running', () => {
      expect(componentContent).toMatch(/Session in progress/);
    });

    it('should show "Session paused" for paused', () => {
      expect(componentContent).toMatch(/Session paused/);
    });

    it('should show "Session ended" for stopped', () => {
      expect(componentContent).toMatch(/Session ended/);
    });

    it('should show "Ready to start" for idle', () => {
      expect(componentContent).toMatch(/Ready to start/);
    });
  });

  describe('Disabled State', () => {
    it('should accept disabled prop', () => {
      expect(componentContent).toMatch(/disabled\s*=\s*false/);
    });

    it('should prevent action when disabled', () => {
      expect(componentContent).toMatch(/if\s*\(disabled\)\s*return/);
    });

    it('should apply disabled styles', () => {
      expect(componentContent).toMatch(/buttonDisabled/);
    });

    it('should apply disabled text styles', () => {
      expect(componentContent).toMatch(/textDisabled/);
    });

    it('should not run pulse animation when disabled', () => {
      expect(componentContent).toMatch(/&&\s*!disabled/);
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

    it('should disable TouchableOpacity when disabled', () => {
      expect(componentContent).toMatch(/disabled\s*=\s*\{disabled\}/);
    });
  });

  describe('Test IDs', () => {
    it('should have default testID', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]pause-resume-button['"]/
      );
    });

    it('should have testID for container', () => {
      expect(componentContent).toMatch(/-container`\}/);
    });

    it('should have testID for icon', () => {
      expect(componentContent).toMatch(/-icon`\}/);
    });

    it('should have testID for label', () => {
      expect(componentContent).toMatch(/-label`\}/);
    });

    it('should have testID for state label', () => {
      expect(componentContent).toMatch(/-state-label/);
    });

    it('should have testID for running indicator', () => {
      expect(componentContent).toMatch(/-running-indicator/);
    });
  });

  describe('Styling', () => {
    it('should define styles with StyleSheet.create', () => {
      expect(componentContent).toMatch(/StyleSheet\.create\(/);
    });

    it('should have container style', () => {
      expect(componentContent).toMatch(/container\s*:/);
    });

    it('should have button style', () => {
      expect(componentContent).toMatch(/button\s*:/);
    });

    it('should have round button shape', () => {
      expect(componentContent).toMatch(/borderRadius:\s*80/);
    });

    it('should use theme shadows', () => {
      expect(componentContent).toMatch(/\.\.\.Shadows\.(sm|md|lg)/);
    });

    it('should use Colors.text.primary for text', () => {
      expect(componentContent).toMatch(/Colors\.text\.primary/);
    });

    it('should use Colors.text.secondary for state label', () => {
      expect(componentContent).toMatch(/Colors\.text\.secondary/);
    });

    it('should use Colors.text.disabled for disabled text', () => {
      expect(componentContent).toMatch(/Colors\.text\.disabled/);
    });

    it('should have large button dimensions (160x160)', () => {
      expect(componentContent).toMatch(/width:\s*160/);
      expect(componentContent).toMatch(/height:\s*160/);
    });

    it('should have medium button dimensions (100x100)', () => {
      expect(componentContent).toMatch(/width:\s*100/);
      expect(componentContent).toMatch(/height:\s*100/);
    });

    it('should use uppercase text', () => {
      expect(componentContent).toMatch(/textTransform:\s*['"]uppercase['"]/);
    });

    it('should have letter spacing', () => {
      expect(componentContent).toMatch(/letterSpacing/);
    });

    it('should use bold font weight for label', () => {
      expect(componentContent).toMatch(/Typography\.fontWeight\.bold/);
    });
  });

  describe('Custom onPress Handler', () => {
    it('should call custom onPress when provided', () => {
      expect(componentContent).toMatch(/onPress\(\)/);
    });

    it('should use default behavior when onPress not provided', () => {
      expect(componentContent).toMatch(/if\s*\(!onPress\)/);
    });
  });

  describe('Component Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?PauseResumeButton/);
    });

    it('should document features in JSDoc', () => {
      expect(componentContent).toMatch(/Features:/);
    });

    it('should have JSDoc for props interface', () => {
      expect(componentContent).toMatch(
        /\/\*\*[\s\S]*?Props for PauseResumeButton/
      );
    });
  });
});
