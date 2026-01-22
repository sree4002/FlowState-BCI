/**
 * Tests for StopButton component
 *
 * Validates the Stop button implementation for ending sessions including:
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
 * - Confirmation dialog
 */

import * as fs from 'fs';
import * as path from 'path';

const componentPath = path.join(
  __dirname,
  '..',
  'src',
  'components',
  'StopButton.tsx'
);
const indexPath = path.join(__dirname, '..', 'src', 'components', 'index.ts');

let componentContent: string;
let indexContent: string;

beforeAll(() => {
  componentContent = fs.readFileSync(componentPath, 'utf-8');
  indexContent = fs.readFileSync(indexPath, 'utf-8');
});

describe('StopButton', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React component file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should export StopButton component', () => {
      expect(componentContent).toMatch(
        /export\s+(const|function)\s+StopButton/
      );
    });

    it('should have a default export', () => {
      expect(componentContent).toMatch(/export\s+default\s+StopButton/);
    });
  });

  describe('Component Exports in index.ts', () => {
    it('should export StopButton from index', () => {
      expect(indexContent).toContain('export { StopButton }');
    });

    it('should export StopButtonProps type', () => {
      expect(indexContent).toContain('export type { StopButtonProps }');
    });

    it('should export canStopSession helper', () => {
      expect(indexContent).toContain('canStopSession');
    });

    it('should export getStopButtonLabel helper', () => {
      expect(indexContent).toContain('getStopButtonLabel');
    });

    it('should export getStopButtonColor helper', () => {
      expect(indexContent).toContain('getStopButtonColor');
    });

    it('should export getStopAccessibilityLabel helper', () => {
      expect(indexContent).toContain('getStopAccessibilityLabel');
    });

    it('should export getStopAccessibilityHint helper', () => {
      expect(indexContent).toContain('getStopAccessibilityHint');
    });

    it('should export getStopButtonIcon helper', () => {
      expect(indexContent).toContain('getStopButtonIcon');
    });

    it('should export getStopConfirmationMessage helper', () => {
      expect(indexContent).toContain('getStopConfirmationMessage');
    });
  });

  describe('Required Imports', () => {
    it('should import React', () => {
      expect(componentContent).toMatch(/import\s+React/);
    });

    it('should import useRef from React', () => {
      expect(componentContent).toMatch(/useRef/);
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

    it('should import Alert from react-native', () => {
      expect(componentContent).toMatch(/Alert/);
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

    it('should import BorderRadius from theme', () => {
      expect(componentContent).toMatch(/BorderRadius/);
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
    it('should define StopButtonProps interface', () => {
      expect(componentContent).toMatch(/export\s+interface\s+StopButtonProps/);
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

    it('should have showConfirmation prop', () => {
      expect(componentContent).toMatch(/showConfirmation\??\s*:\s*boolean/);
    });

    it('should have testID prop', () => {
      expect(componentContent).toMatch(/testID\??\s*:\s*string/);
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
      expect(componentContent).toMatch(/buttonSmall/);
    });

    it('should have different styles for medium size', () => {
      expect(componentContent).toMatch(/buttonMedium/);
    });

    it('should have different styles for large size', () => {
      expect(componentContent).toMatch(/buttonLarge/);
    });

    it('should have container styles for each size', () => {
      expect(componentContent).toMatch(/containerSmall/);
      expect(componentContent).toMatch(/containerMedium/);
      expect(componentContent).toMatch(/containerLarge/);
    });
  });

  describe('Helper Functions', () => {
    describe('canStopSession', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+canStopSession/);
      });

      it('should accept sessionState parameter', () => {
        expect(componentContent).toMatch(/canStopSession\s*\(\s*sessionState/);
      });

      it('should return true for running state', () => {
        expect(componentContent).toMatch(
          /sessionState\s*===\s*['"]running['"]/
        );
      });

      it('should return true for paused state', () => {
        expect(componentContent).toMatch(/sessionState\s*===\s*['"]paused['"]/);
      });
    });

    describe('getStopButtonLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getStopButtonLabel/);
      });

      it('should return Stop for running state', () => {
        expect(componentContent).toMatch(
          /'running'[\s\S]*?'paused'[\s\S]*?return\s+['"]Stop['"]/
        );
      });

      it('should return Stopped for stopped state', () => {
        expect(componentContent).toMatch(
          /'stopped'[\s\S]*?return\s+['"]Stopped['"]/
        );
      });
    });

    describe('getStopButtonColor', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getStopButtonColor/);
      });

      it('should accept sessionState parameter', () => {
        expect(componentContent).toMatch(
          /getStopButtonColor\s*\(\s*\n?\s*sessionState/
        );
      });

      it('should accept disabled parameter', () => {
        expect(componentContent).toMatch(/getStopButtonColor[\s\S]*?disabled/);
      });

      it('should return disabled color when disabled', () => {
        expect(componentContent).toMatch(/Colors\.interactive\.disabled/);
      });

      it('should use error color for stop action', () => {
        expect(componentContent).toMatch(/Colors\.accent\.error/);
      });
    });

    describe('getStopAccessibilityLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getStopAccessibilityLabel/
        );
      });

      it('should return Stop session for running', () => {
        expect(componentContent).toMatch(/['"]Stop session['"]/);
      });

      it('should return Stop paused session for paused', () => {
        expect(componentContent).toMatch(/['"]Stop paused session['"]/);
      });

      it('should indicate no active session for idle', () => {
        expect(componentContent).toMatch(/no active session/i);
      });
    });

    describe('getStopAccessibilityHint', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getStopAccessibilityHint/
        );
      });

      it('should provide double tap instruction for active session', () => {
        expect(componentContent).toMatch(/Double tap to end/);
      });

      it('should indicate no active session when not stoppable', () => {
        expect(componentContent).toMatch(/No active session to stop/);
      });
    });

    describe('getStopButtonIcon', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getStopButtonIcon/);
      });

      it('should return stop symbol', () => {
        expect(componentContent).toMatch(/⏹/);
      });
    });

    describe('getStopConfirmationMessage', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getStopConfirmationMessage/
        );
      });

      it('should accept sessionState parameter', () => {
        expect(componentContent).toMatch(
          /getStopConfirmationMessage\s*\(\s*\n?\s*sessionState/
        );
      });

      it('should accept elapsedSeconds parameter', () => {
        expect(componentContent).toMatch(/elapsedSeconds/);
      });

      it('should format time string', () => {
        expect(componentContent).toMatch(/minutes/);
        expect(componentContent).toMatch(/seconds/);
      });

      it('should ask for confirmation', () => {
        expect(componentContent).toMatch(/Are you sure/);
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

    it('should destructure elapsedSeconds from context', () => {
      expect(componentContent).toMatch(/elapsedSeconds/);
    });
  });

  describe('State Handling', () => {
    it('should handle running state', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]running['"]/);
    });

    it('should handle paused state', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]paused['"]/);
    });

    it('should handle stopped state', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]stopped['"]/);
    });

    it('should set session to stopped state', () => {
      expect(componentContent).toMatch(/setSessionState\(['"]stopped['"]\)/);
    });
  });

  describe('Confirmation Dialog', () => {
    it('should use Alert.alert for confirmation', () => {
      expect(componentContent).toMatch(/Alert\.alert/);
    });

    it('should have End Session title', () => {
      expect(componentContent).toMatch(/['"]End Session['"]/);
    });

    it('should have Cancel button', () => {
      expect(componentContent).toMatch(/['"]Cancel['"]/);
    });

    it('should have Stop Session button', () => {
      expect(componentContent).toMatch(/['"]Stop Session['"]/);
    });

    it('should set destructive style for stop button', () => {
      expect(componentContent).toMatch(/style:\s*['"]destructive['"]/);
    });

    it('should set cancel style for cancel button', () => {
      expect(componentContent).toMatch(/style:\s*['"]cancel['"]/);
    });

    it('should make dialog cancelable', () => {
      expect(componentContent).toMatch(/cancelable:\s*true/);
    });

    it('should skip confirmation when showConfirmation is false', () => {
      expect(componentContent).toMatch(/if\s*\(showConfirmation\)/);
    });

    it('should have executeStop function', () => {
      expect(componentContent).toMatch(/executeStop/);
    });
  });

  describe('Animation Implementation', () => {
    it('should use Animated.Value for scale', () => {
      expect(componentContent).toMatch(/new\s+Animated\.Value/);
    });

    it('should use useRef for animation values', () => {
      expect(componentContent).toMatch(/useRef\(new\s+Animated\.Value/);
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
  });

  describe('Visual Elements', () => {
    it('should render button icon', () => {
      expect(componentContent).toMatch(/buttonIcon/);
    });

    it('should render button label', () => {
      expect(componentContent).toMatch(/buttonLabel/);
    });

    it('should have status label when stopped', () => {
      expect(componentContent).toMatch(/statusLabel/);
    });

    it('should show "Session ended" when stopped', () => {
      expect(componentContent).toMatch(/Session ended/);
    });
  });

  describe('Disabled State', () => {
    it('should accept disabled prop with default false', () => {
      expect(componentContent).toMatch(/disabled\s*=\s*false/);
    });

    it('should compute isDisabled from disabled prop and session state', () => {
      expect(componentContent).toMatch(/isDisabled/);
    });

    it('should prevent action when disabled', () => {
      expect(componentContent).toMatch(/if\s*\(disabled\s*\|\|/);
    });

    it('should check canStopSession for disabled state', () => {
      expect(componentContent).toMatch(/!canStopSession\(sessionState\)/);
    });

    it('should apply disabled styles', () => {
      expect(componentContent).toMatch(/buttonDisabled/);
    });

    it('should apply disabled text styles', () => {
      expect(componentContent).toMatch(/textDisabled/);
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
      expect(componentContent).toMatch(/disabled\s*=\s*\{isDisabled\}/);
    });
  });

  describe('Test IDs', () => {
    it('should have default testID', () => {
      expect(componentContent).toMatch(/testID\s*=\s*['"]stop-button['"]/);
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

    it('should have testID for status label', () => {
      expect(componentContent).toMatch(/-status-label/);
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

    it('should use BorderRadius for button shape', () => {
      expect(componentContent).toMatch(/BorderRadius\.(sm|md|lg|xl)/);
    });

    it('should use theme shadows', () => {
      expect(componentContent).toMatch(/\.\.\.Shadows\.(sm|md|lg)/);
    });

    it('should use Colors.text.primary for text', () => {
      expect(componentContent).toMatch(/Colors\.text\.primary/);
    });

    it('should use Colors.text.secondary for status label', () => {
      expect(componentContent).toMatch(/Colors\.text\.secondary/);
    });

    it('should use Colors.text.disabled for disabled text', () => {
      expect(componentContent).toMatch(/Colors\.text\.disabled/);
    });

    it('should have small button dimensions (60x60)', () => {
      expect(componentContent).toMatch(/width:\s*60/);
      expect(componentContent).toMatch(/height:\s*60/);
    });

    it('should have medium button dimensions (80x80)', () => {
      expect(componentContent).toMatch(/width:\s*80/);
      expect(componentContent).toMatch(/height:\s*80/);
    });

    it('should have large button dimensions (100x100)', () => {
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

    it('should use medium font weight for status label', () => {
      expect(componentContent).toMatch(/Typography\.fontWeight\.medium/);
    });
  });

  describe('Custom onPress Handler', () => {
    it('should call custom onPress when provided', () => {
      expect(componentContent).toMatch(/onPress\(\)/);
    });

    it('should use default behavior when onPress not provided', () => {
      expect(componentContent).toMatch(/if\s*\(onPress\)/);
    });
  });

  describe('Component Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?StopButton/);
    });

    it('should document features in JSDoc', () => {
      expect(componentContent).toMatch(/Features:/);
    });

    it('should have JSDoc for props interface', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?Props for StopButton/);
    });

    it('should mention confirmation dialog in docs', () => {
      expect(componentContent).toMatch(/confirmation/i);
    });

    it('should mention destructive action in docs', () => {
      expect(componentContent).toMatch(/destructive/i);
    });
  });

  describe('Error Color for Stop Button', () => {
    it('should use red/error color for stop action', () => {
      expect(componentContent).toMatch(/Colors\.accent\.error/);
    });

    it('should comment about red color indicating destructive action', () => {
      expect(componentContent).toMatch(/Red for stop/i);
    });
  });

  describe('Size-based Style Selection', () => {
    it('should have getSizeStyles function or similar', () => {
      expect(componentContent).toMatch(/getSizeStyles|sizeStyles/);
    });

    it('should return different icon sizes', () => {
      expect(componentContent).toMatch(/iconSmall/);
      expect(componentContent).toMatch(/iconMedium/);
      expect(componentContent).toMatch(/iconLarge/);
    });

    it('should return different label sizes', () => {
      expect(componentContent).toMatch(/labelSmall/);
      expect(componentContent).toMatch(/labelMedium/);
      expect(componentContent).toMatch(/labelLarge/);
    });
  });

  describe('Default Prop Values', () => {
    it('should have default disabled value of false', () => {
      expect(componentContent).toMatch(/disabled\s*=\s*false/);
    });

    it('should have default size value of medium', () => {
      expect(componentContent).toMatch(/size\s*=\s*['"]medium['"]/);
    });

    it('should have default showConfirmation value of true', () => {
      expect(componentContent).toMatch(/showConfirmation\s*=\s*true/);
    });

    it('should have default testID value', () => {
      expect(componentContent).toMatch(/testID\s*=\s*['"]stop-button['"]/);
    });
  });
});
