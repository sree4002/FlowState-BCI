/**
 * Tests for DataDeletionModal component
 *
 * Validates the data deletion confirmation modal including:
 * - File structure and exports
 * - Required imports and dependencies
 * - React Native components used
 * - TypeScript interfaces and types
 * - Props interface
 * - Helper functions for text generation
 * - Checkbox confirmation logic
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
  'DataDeletionModal.tsx'
);
const indexPath = path.join(__dirname, '..', 'src', 'components', 'index.ts');

let componentContent: string;
let indexContent: string;

beforeAll(() => {
  componentContent = fs.readFileSync(componentPath, 'utf-8');
  indexContent = fs.readFileSync(indexPath, 'utf-8');
});

describe('DataDeletionModal', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React component file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should export DataDeletionModal component', () => {
      expect(componentContent).toMatch(
        /export\s+(const|function)\s+DataDeletionModal/
      );
    });

    it('should have a default export', () => {
      expect(componentContent).toMatch(/export\s+default\s+DataDeletionModal/);
    });
  });

  describe('Component Exports in index.ts', () => {
    it('should export DataDeletionModal from index', () => {
      expect(indexContent).toContain('DataDeletionModal');
    });

    it('should export DataDeletionModalProps type', () => {
      expect(indexContent).toContain('DataDeletionModalProps');
    });

    it('should export DataDeletionType type', () => {
      expect(indexContent).toContain('DataDeletionType');
    });

    it('should export getModalTitle helper', () => {
      expect(indexContent).toContain('getModalTitle');
    });

    it('should export getWarningMessage helper', () => {
      expect(indexContent).toContain('getWarningMessage');
    });

    it('should export getConfirmAccessibilityLabel helper', () => {
      expect(indexContent).toContain('getConfirmAccessibilityLabel');
    });

    it('should export getConfirmAccessibilityHint helper', () => {
      expect(indexContent).toContain('getConfirmAccessibilityHint');
    });

    it('should export getCheckboxLabel helper', () => {
      expect(indexContent).toContain('getCheckboxLabel');
    });
  });

  describe('Required Imports', () => {
    it('should import React', () => {
      expect(componentContent).toMatch(/import\s+React/);
    });

    it('should import useState from React', () => {
      expect(componentContent).toMatch(/useState/);
    });

    it('should import useEffect from React', () => {
      expect(componentContent).toMatch(/useEffect/);
    });

    it('should import useRef from React', () => {
      expect(componentContent).toMatch(/useRef/);
    });

    it('should import useCallback from React', () => {
      expect(componentContent).toMatch(/useCallback/);
    });

    it('should import View from react-native', () => {
      expect(componentContent).toMatch(/View/);
    });

    it('should import Text from react-native', () => {
      expect(componentContent).toMatch(/Text/);
    });

    it('should import StyleSheet from react-native', () => {
      expect(componentContent).toMatch(/StyleSheet/);
    });

    it('should import Modal from react-native', () => {
      expect(componentContent).toMatch(/Modal/);
    });

    it('should import TouchableOpacity from react-native', () => {
      expect(componentContent).toMatch(/TouchableOpacity/);
    });

    it('should import Animated from react-native', () => {
      expect(componentContent).toMatch(/Animated/);
    });

    it('should import Dimensions from react-native', () => {
      expect(componentContent).toMatch(/Dimensions/);
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
  });

  describe('Type Definitions', () => {
    it('should define DataDeletionType type', () => {
      expect(componentContent).toMatch(/export\s+type\s+DataDeletionType/);
    });

    it('should include sessions in DataDeletionType', () => {
      expect(componentContent).toContain("'sessions'");
    });

    it('should include baselines in DataDeletionType', () => {
      expect(componentContent).toContain("'baselines'");
    });

    it('should include all in DataDeletionType', () => {
      expect(componentContent).toContain("'all'");
    });
  });

  describe('Props Interface', () => {
    it('should define DataDeletionModalProps interface', () => {
      expect(componentContent).toMatch(
        /export\s+interface\s+DataDeletionModalProps/
      );
    });

    it('should have visible prop', () => {
      expect(componentContent).toMatch(/visible\s*:\s*boolean/);
    });

    it('should have onConfirm prop', () => {
      expect(componentContent).toMatch(/onConfirm\s*:\s*\(\)/);
    });

    it('should have onCancel prop', () => {
      expect(componentContent).toMatch(/onCancel\s*:\s*\(\)/);
    });

    it('should have dataType prop', () => {
      expect(componentContent).toMatch(/dataType\s*:\s*DataDeletionType/);
    });

    it('should have testID prop', () => {
      expect(componentContent).toMatch(/testID\??\s*:\s*string/);
    });
  });

  describe('Helper Functions', () => {
    describe('getModalTitle', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getModalTitle/);
      });

      it('should accept dataType parameter', () => {
        expect(componentContent).toMatch(
          /getModalTitle\s*=\s*\(\s*dataType\s*:\s*DataDeletionType/
        );
      });

      it('should return Clear All Sessions for sessions', () => {
        expect(componentContent).toMatch(/Clear All Sessions/);
      });

      it('should return Clear All Baselines for baselines', () => {
        expect(componentContent).toMatch(/Clear All Baselines/);
      });

      it('should return Clear All Data for all', () => {
        expect(componentContent).toMatch(/Clear All Data/);
      });
    });

    describe('getWarningMessage', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getWarningMessage/);
      });

      it('should accept dataType parameter', () => {
        expect(componentContent).toMatch(
          /getWarningMessage\s*=\s*\(\s*dataType\s*:\s*DataDeletionType/
        );
      });

      it('should mention permanent deletion', () => {
        expect(componentContent).toMatch(/permanently delete/);
      });

      it('should mention session history for sessions type', () => {
        expect(componentContent).toMatch(/session history/);
      });

      it('should mention calibration for baselines type', () => {
        expect(componentContent).toMatch(/calibration baselines/);
      });

      it('should mention reset to initial state for all type', () => {
        expect(componentContent).toMatch(/reset to its initial state/);
      });
    });

    describe('getConfirmAccessibilityLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getConfirmAccessibilityLabel/
        );
      });

      it('should return Delete all sessions for sessions', () => {
        expect(componentContent).toMatch(/Delete all sessions/);
      });

      it('should return Delete all baselines for baselines', () => {
        expect(componentContent).toMatch(/Delete all baselines/);
      });

      it('should return Delete all data for all', () => {
        expect(componentContent).toMatch(/Delete all data/);
      });
    });

    describe('getConfirmAccessibilityHint', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getConfirmAccessibilityHint/
        );
      });

      it('should mention double tap', () => {
        expect(componentContent).toMatch(/Double tap/);
      });

      it('should mention permanently delete', () => {
        expect(componentContent).toMatch(/permanently delete/);
      });
    });

    describe('getCheckboxLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getCheckboxLabel/);
      });

      it('should mention cannot be undone', () => {
        expect(componentContent).toMatch(/cannot be undone/);
      });
    });
  });

  describe('State Management', () => {
    it('should have isChecked state', () => {
      expect(componentContent).toMatch(/const\s*\[\s*isChecked/);
    });

    it('should initialize isChecked to false', () => {
      expect(componentContent).toMatch(/useState\(false\)/);
    });

    it('should reset checkbox when modal closes', () => {
      expect(componentContent).toMatch(/if\s*\(\s*!visible\s*\)/);
      expect(componentContent).toMatch(/setIsChecked\(false\)/);
    });
  });

  describe('Animation Implementation', () => {
    it('should use Animated.Value for fade', () => {
      expect(componentContent).toMatch(/fadeAnim/);
      expect(componentContent).toMatch(/new\s+Animated\.Value/);
    });

    it('should use Animated.Value for slide', () => {
      expect(componentContent).toMatch(/slideAnim/);
    });

    it('should use Animated.Value for scale', () => {
      expect(componentContent).toMatch(/scaleAnim/);
    });

    it('should use useRef for animation values', () => {
      expect(componentContent).toMatch(/useRef\(new\s+Animated\.Value/);
    });

    it('should animate on visibility change', () => {
      expect(componentContent).toMatch(/useEffect[\s\S]*?visible[\s\S]*?fadeAnim/);
    });

    it('should use Animated.parallel', () => {
      expect(componentContent).toMatch(/Animated\.parallel/);
    });

    it('should use Animated.timing', () => {
      expect(componentContent).toMatch(/Animated\.timing/);
    });

    it('should use Animated.spring', () => {
      expect(componentContent).toMatch(/Animated\.spring/);
    });

    it('should use useNativeDriver', () => {
      expect(componentContent).toMatch(/useNativeDriver:\s*true/);
    });
  });

  describe('Checkbox Implementation', () => {
    it('should have checkbox container', () => {
      expect(componentContent).toMatch(/checkboxContainer/);
    });

    it('should have checkbox toggle handler', () => {
      expect(componentContent).toMatch(/handleCheckboxToggle/);
    });

    it('should toggle checkbox state', () => {
      expect(componentContent).toMatch(/setIsChecked\(\s*\(prev\)\s*=>/);
    });

    it('should have checked and unchecked styles', () => {
      expect(componentContent).toMatch(/checkboxChecked/);
    });

    it('should show checkmark when checked', () => {
      expect(componentContent).toMatch(/isChecked[\s\S]*?checkmark/);
    });
  });

  describe('Button Implementation', () => {
    it('should have Cancel button', () => {
      expect(componentContent).toMatch(/cancelButton/);
    });

    it('should have Delete button', () => {
      expect(componentContent).toMatch(/deleteButton/);
    });

    it('should disable Delete button when not checked', () => {
      expect(componentContent).toMatch(/disabled=\{!isChecked\}/);
    });

    it('should have disabled styles for Delete button', () => {
      expect(componentContent).toMatch(/deleteButtonDisabled/);
    });

    it('should call onConfirm when Delete pressed', () => {
      expect(componentContent).toMatch(/onConfirm\(\)/);
    });

    it('should only confirm when checkbox is checked', () => {
      expect(componentContent).toMatch(/if\s*\(\s*isChecked\s*\)/);
    });

    it('should call onCancel when Cancel pressed', () => {
      expect(componentContent).toMatch(/onCancel\(\)/);
    });
  });

  describe('Accessibility Features', () => {
    it('should have accessibilityRole for checkbox', () => {
      expect(componentContent).toMatch(
        /accessibilityRole\s*=\s*["']checkbox["']/
      );
    });

    it('should have accessibilityState for checkbox', () => {
      expect(componentContent).toMatch(
        /accessibilityState\s*=\s*\{\s*\{\s*checked/
      );
    });

    it('should have accessibilityRole for buttons', () => {
      expect(componentContent).toMatch(/accessibilityRole\s*=\s*["']button["']/);
    });

    it('should have accessibilityLabel for Cancel button', () => {
      expect(componentContent).toMatch(/accessibilityLabel\s*=\s*["']Cancel["']/);
    });

    it('should have accessibilityHint for Cancel button', () => {
      expect(componentContent).toMatch(/accessibilityHint[\s\S]*?cancel/i);
    });

    it('should have accessibilityLabel for Delete button', () => {
      expect(componentContent).toMatch(
        /accessibilityLabel\s*=\s*\{confirmAccessibilityLabel\}/
      );
    });

    it('should have accessibilityHint for Delete button', () => {
      expect(componentContent).toMatch(
        /accessibilityHint\s*=\s*\{confirmAccessibilityHint\}/
      );
    });

    it('should have accessibilityState disabled for Delete button', () => {
      expect(componentContent).toMatch(
        /accessibilityState\s*=\s*\{\s*\{\s*disabled:\s*!isChecked/
      );
    });
  });

  describe('Visual Elements', () => {
    it('should have warning icon container', () => {
      expect(componentContent).toMatch(/iconContainer/);
    });

    it('should display warning icon', () => {
      expect(componentContent).toMatch(/warningIcon/);
    });

    it('should display title', () => {
      expect(componentContent).toMatch(/style\s*=\s*\{styles\.title\}/);
    });

    it('should display warning message', () => {
      expect(componentContent).toMatch(/warningMessage/);
    });

    it('should have checkbox label', () => {
      expect(componentContent).toMatch(/checkboxLabel/);
    });

    it('should have button container', () => {
      expect(componentContent).toMatch(/buttonContainer/);
    });
  });

  describe('Modal Configuration', () => {
    it('should use Modal component', () => {
      expect(componentContent).toMatch(/<Modal/);
    });

    it('should have transparent background', () => {
      expect(componentContent).toMatch(/transparent/);
    });

    it('should have animationType none', () => {
      expect(componentContent).toMatch(/animationType\s*=\s*["']none["']/);
    });

    it('should handle onRequestClose', () => {
      expect(componentContent).toMatch(/onRequestClose\s*=\s*\{handleCancel\}/);
    });
  });

  describe('Overlay', () => {
    it('should have overlay view', () => {
      expect(componentContent).toMatch(/styles\.overlay/);
    });

    it('should have touchable overlay', () => {
      expect(componentContent).toMatch(/overlayTouchable/);
    });

    it('should close modal when overlay tapped', () => {
      expect(componentContent).toMatch(
        /overlayTouchable[\s\S]*?onPress\s*=\s*\{handleCancel\}/
      );
    });
  });

  describe('Styling', () => {
    it('should define styles with StyleSheet.create', () => {
      expect(componentContent).toMatch(/StyleSheet\.create\(/);
    });

    it('should have centered view style', () => {
      expect(componentContent).toMatch(/centeredView\s*:/);
    });

    it('should have modal container style', () => {
      expect(componentContent).toMatch(/modalContainer\s*:/);
    });

    it('should use Colors.overlay.dark for overlay', () => {
      expect(componentContent).toMatch(/Colors\.overlay\.dark/);
    });

    it('should use Colors.surface.elevated for modal', () => {
      expect(componentContent).toMatch(/Colors\.surface\.elevated/);
    });

    it('should use Colors.accent.error for warning', () => {
      expect(componentContent).toMatch(/Colors\.accent\.error/);
    });

    it('should use Colors.status.red for warning icon', () => {
      expect(componentContent).toMatch(/Colors\.status\.red/);
    });

    it('should use BorderRadius for modal', () => {
      expect(componentContent).toMatch(/BorderRadius\.xl/);
    });

    it('should use Shadows for modal', () => {
      expect(componentContent).toMatch(/\.\.\.Shadows\.lg/);
    });

    it('should use Typography for text', () => {
      expect(componentContent).toMatch(/Typography\.fontSize/);
      expect(componentContent).toMatch(/Typography\.fontWeight/);
    });

    it('should use Spacing for layout', () => {
      expect(componentContent).toMatch(/Spacing\.(sm|md|lg)/);
    });

    it('should calculate modal width from screen dimensions', () => {
      expect(componentContent).toMatch(/Dimensions\.get\(['"]window['"]\)/);
      expect(componentContent).toMatch(/modalWidth/);
    });
  });

  describe('Test IDs', () => {
    it('should have default testID', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]data-deletion-modal['"]/
      );
    });

    it('should have testID for overlay', () => {
      expect(componentContent).toMatch(/-overlay`\}/);
    });

    it('should have testID for modal container', () => {
      expect(componentContent).toMatch(/-modal-container`\}/);
    });

    it('should have testID for warning icon', () => {
      expect(componentContent).toMatch(/-warning-icon`\}/);
    });

    it('should have testID for title', () => {
      expect(componentContent).toMatch(/-title`\}/);
    });

    it('should have testID for warning message', () => {
      expect(componentContent).toMatch(/-warning-message`\}/);
    });

    it('should have testID for checkbox', () => {
      expect(componentContent).toMatch(/-checkbox`\}/);
    });

    it('should have testID for cancel button', () => {
      expect(componentContent).toMatch(/-cancel-button`\}/);
    });

    it('should have testID for delete button', () => {
      expect(componentContent).toMatch(/-delete-button`\}/);
    });
  });

  describe('Component Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?DataDeletionModal/);
    });

    it('should document features in JSDoc', () => {
      expect(componentContent).toMatch(/Features:/);
    });

    it('should have JSDoc for props interface', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?Props for DataDeletionModal/);
    });

    it('should mention warning icon in docs', () => {
      expect(componentContent).toMatch(/[Ww]arning icon/);
    });

    it('should mention checkbox confirmation in docs', () => {
      expect(componentContent).toMatch(/[Cc]heckbox/);
    });

    it('should mention animation in docs', () => {
      expect(componentContent).toMatch(/[Aa]nimation/);
    });
  });

  describe('Default Prop Values', () => {
    it('should have default testID value', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]data-deletion-modal['"]/
      );
    });
  });
});
