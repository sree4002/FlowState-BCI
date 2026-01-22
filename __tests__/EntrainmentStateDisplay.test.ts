/**
 * Tests for EntrainmentStateDisplay component
 *
 * Validates the Entrainment State Display implementation including:
 * - File structure and exports
 * - Required imports and dependencies
 * - React Native components used
 * - TypeScript interfaces and types
 * - Props interface
 * - Context integration
 * - Helper functions
 * - Entrainment state determination
 * - Visual elements (frequency display, state badge, band label)
 * - Accessibility features
 * - Animation implementation
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
  'EntrainmentStateDisplay.tsx'
);
const indexPath = path.join(__dirname, '..', 'src', 'components', 'index.ts');

let componentContent: string;
let indexContent: string;

beforeAll(() => {
  componentContent = fs.readFileSync(componentPath, 'utf-8');
  indexContent = fs.readFileSync(indexPath, 'utf-8');
});

describe('EntrainmentStateDisplay', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React component file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should export EntrainmentStateDisplay component', () => {
      expect(componentContent).toMatch(
        /export\s+(const|function)\s+EntrainmentStateDisplay/
      );
    });

    it('should have a default export', () => {
      expect(componentContent).toMatch(
        /export\s+default\s+EntrainmentStateDisplay/
      );
    });
  });

  describe('Component Exports in index.ts', () => {
    it('should export EntrainmentStateDisplay from index', () => {
      expect(indexContent).toContain('export { EntrainmentStateDisplay }');
    });

    it('should export EntrainmentStateDisplayProps type', () => {
      expect(indexContent).toContain('EntrainmentStateDisplayProps');
    });

    it('should export EntrainmentStateDisplaySize type', () => {
      expect(indexContent).toContain('EntrainmentStateDisplaySize');
    });

    it('should export EntrainmentState type', () => {
      expect(indexContent).toContain('EntrainmentState');
    });

    it('should export formatFrequency helper', () => {
      expect(indexContent).toContain('formatFrequency');
    });

    it('should export getEntrainmentState helper', () => {
      expect(indexContent).toContain('getEntrainmentState');
    });

    it('should export getEntrainmentStateColor helper', () => {
      expect(indexContent).toContain('getEntrainmentStateColor');
    });

    it('should export getEntrainmentStateLabel helper', () => {
      expect(indexContent).toContain('getEntrainmentStateLabel');
    });

    it('should export getEntrainmentStateIcon helper', () => {
      expect(indexContent).toContain('getEntrainmentStateIcon');
    });

    it('should export getFrequencyColor helper', () => {
      expect(indexContent).toContain('getFrequencyColor');
    });

    it('should export getEntrainmentAccessibilityLabel helper', () => {
      expect(indexContent).toContain('getEntrainmentAccessibilityLabel');
    });

    it('should export getFrequencyBandLabel helper', () => {
      expect(indexContent).toContain('getFrequencyBandLabel');
    });

    it('should export isValidThetaFrequency helper', () => {
      expect(indexContent).toContain('isValidThetaFrequency');
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

    it('should import View from react-native', () => {
      expect(componentContent).toMatch(/View/);
    });

    it('should import Text from react-native', () => {
      expect(componentContent).toMatch(/Text/);
    });

    it('should import StyleSheet from react-native', () => {
      expect(componentContent).toMatch(/StyleSheet/);
    });

    it('should import Animated from react-native', () => {
      expect(componentContent).toMatch(/Animated/);
    });

    it('should import useSession from contexts', () => {
      expect(componentContent).toMatch(/useSession/);
    });

    it('should import SessionState from types', () => {
      expect(componentContent).toMatch(/SessionState/);
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

  describe('Props Interface', () => {
    it('should define EntrainmentStateDisplayProps interface', () => {
      expect(componentContent).toMatch(
        /export\s+interface\s+EntrainmentStateDisplayProps/
      );
    });

    it('should have frequency prop', () => {
      expect(componentContent).toMatch(/frequency\??\s*:/);
    });

    it('should have sessionState prop', () => {
      expect(componentContent).toMatch(/sessionState\??\s*:/);
    });

    it('should have size prop', () => {
      expect(componentContent).toMatch(/size\??\s*:/);
    });

    it('should have showLabel prop', () => {
      expect(componentContent).toMatch(/showLabel\??\s*:\s*boolean/);
    });

    it('should have showState prop', () => {
      expect(componentContent).toMatch(/showState\??\s*:\s*boolean/);
    });

    it('should have showPulse prop', () => {
      expect(componentContent).toMatch(/showPulse\??\s*:\s*boolean/);
    });

    it('should have testID prop', () => {
      expect(componentContent).toMatch(/testID\??\s*:\s*string/);
    });
  });

  describe('EntrainmentStateDisplaySize Type', () => {
    it('should define EntrainmentStateDisplaySize type', () => {
      expect(componentContent).toMatch(
        /export\s+type\s+EntrainmentStateDisplaySize/
      );
    });

    it('should include small size', () => {
      expect(componentContent).toMatch(/'small'/);
    });

    it('should include medium size', () => {
      expect(componentContent).toMatch(/'medium'/);
    });

    it('should include large size', () => {
      expect(componentContent).toMatch(/'large'/);
    });
  });

  describe('EntrainmentState Type', () => {
    it('should define EntrainmentState type', () => {
      expect(componentContent).toMatch(/export\s+type\s+EntrainmentState/);
    });

    it('should include idle state', () => {
      expect(componentContent).toMatch(/'idle'/);
    });

    it('should include active state', () => {
      expect(componentContent).toMatch(/'active'/);
    });

    it('should include paused state', () => {
      expect(componentContent).toMatch(/'paused'/);
    });

    it('should include stopped state', () => {
      expect(componentContent).toMatch(/'stopped'/);
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

    it('should have different styles for large size', () => {
      expect(componentContent).toMatch(/containerLarge/);
    });

    it('should have frequency styles for small size', () => {
      expect(componentContent).toMatch(/frequencySmall/);
    });

    it('should have frequency styles for large size', () => {
      expect(componentContent).toMatch(/frequencyLarge/);
    });

    it('should have state badge styles for small size', () => {
      expect(componentContent).toMatch(/stateBadgeSmall/);
    });

    it('should have state badge styles for large size', () => {
      expect(componentContent).toMatch(/stateBadgeLarge/);
    });
  });

  describe('Helper Functions', () => {
    describe('formatFrequency', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+formatFrequency/);
      });

      it('should accept frequency parameter', () => {
        expect(componentContent).toMatch(
          /formatFrequency\s*=\s*\(\s*frequency/
        );
      });

      it('should return Hz suffix', () => {
        expect(componentContent).toMatch(/Hz/);
      });

      it('should handle null frequency', () => {
        expect(componentContent).toMatch(/--\s*Hz/);
      });

      it('should use toFixed(1) for formatting', () => {
        expect(componentContent).toMatch(/toFixed\(1\)/);
      });
    });

    describe('getEntrainmentState', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getEntrainmentState/
        );
      });

      it('should accept sessionState parameter', () => {
        expect(componentContent).toMatch(
          /getEntrainmentState\s*\(\s*\n?\s*sessionState/
        );
      });

      it('should return active for running session', () => {
        expect(componentContent).toMatch(/running[\s\S]*?active/);
      });

      it('should return paused for paused session', () => {
        expect(componentContent).toMatch(/paused[\s\S]*?paused/);
      });

      it('should return stopped for stopped session', () => {
        expect(componentContent).toMatch(/stopped[\s\S]*?stopped/);
      });

      it('should return idle for idle session', () => {
        expect(componentContent).toMatch(/idle/);
      });
    });

    describe('getEntrainmentStateColor', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getEntrainmentStateColor/
        );
      });

      it('should accept state parameter', () => {
        expect(componentContent).toMatch(
          /getEntrainmentStateColor\s*=\s*\(\s*state/
        );
      });

      it('should use Colors.accent.success for active', () => {
        expect(componentContent).toMatch(/Colors\.accent\.success/);
      });

      it('should use Colors.accent.warning for paused', () => {
        expect(componentContent).toMatch(/Colors\.accent\.warning/);
      });

      it('should use Colors.accent.error for stopped', () => {
        expect(componentContent).toMatch(/Colors\.accent\.error/);
      });

      it('should use Colors.text.tertiary for idle', () => {
        expect(componentContent).toMatch(/Colors\.text\.tertiary/);
      });
    });

    describe('getEntrainmentStateLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getEntrainmentStateLabel/
        );
      });

      it('should return Active for active state', () => {
        expect(componentContent).toMatch(/['"]Active['"]/);
      });

      it('should return Paused for paused state', () => {
        expect(componentContent).toMatch(/['"]Paused['"]/);
      });

      it('should return Stopped for stopped state', () => {
        expect(componentContent).toMatch(/['"]Stopped['"]/);
      });

      it('should return Ready for idle state', () => {
        expect(componentContent).toMatch(/['"]Ready['"]/);
      });
    });

    describe('getEntrainmentStateIcon', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getEntrainmentStateIcon/
        );
      });

      it('should return speaker icon for active', () => {
        expect(componentContent).toMatch(/🔊/);
      });

      it('should return pause icon for paused', () => {
        expect(componentContent).toMatch(/⏸/);
      });

      it('should return stop icon for stopped', () => {
        expect(componentContent).toMatch(/⏹/);
      });

      it('should return power icon for idle', () => {
        expect(componentContent).toMatch(/⏻/);
      });
    });

    describe('getFrequencyColor', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(/export\s+const\s+getFrequencyColor/);
      });

      it('should accept frequency and state parameters', () => {
        expect(componentContent).toMatch(
          /getFrequencyColor\s*\(\s*\n?\s*frequency/
        );
      });

      it('should use secondary color for theta range', () => {
        expect(componentContent).toMatch(/Colors\.secondary\.main/);
      });

      it('should handle null frequency', () => {
        expect(componentContent).toMatch(/frequency\s*===\s*null/);
      });

      it('should check theta range 4-8 Hz', () => {
        expect(componentContent).toMatch(/frequency\s*>=\s*4/);
        expect(componentContent).toMatch(/frequency\s*<=\s*8/);
      });
    });

    describe('getEntrainmentAccessibilityLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getEntrainmentAccessibilityLabel/
        );
      });

      it('should include Entrainment in label', () => {
        expect(componentContent).toMatch(/Entrainment/);
      });

      it('should include hertz in label', () => {
        expect(componentContent).toMatch(/hertz/);
      });

      it('should handle null frequency', () => {
        expect(componentContent).toMatch(/frequency not set/);
      });
    });

    describe('getFrequencyBandLabel', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+getFrequencyBandLabel/
        );
      });

      it('should return Theta Band for 4-8 Hz', () => {
        expect(componentContent).toMatch(/Theta Band/);
      });

      it('should return Alpha Band for 8-13 Hz', () => {
        expect(componentContent).toMatch(/Alpha Band/);
      });

      it('should return Beta Band for 13-30 Hz', () => {
        expect(componentContent).toMatch(/Beta Band/);
      });

      it('should return Delta Band for < 4 Hz', () => {
        expect(componentContent).toMatch(/Delta Band/);
      });

      it('should return Not Set for null frequency', () => {
        expect(componentContent).toMatch(/Not Set/);
      });

      it('should handle high frequency', () => {
        expect(componentContent).toMatch(/High Frequency/);
      });
    });

    describe('isValidThetaFrequency', () => {
      it('should be exported', () => {
        expect(componentContent).toMatch(
          /export\s+const\s+isValidThetaFrequency/
        );
      });

      it('should return boolean', () => {
        expect(componentContent).toMatch(
          /isValidThetaFrequency[\s\S]*?boolean/
        );
      });

      it('should check for null frequency', () => {
        expect(componentContent).toMatch(
          /isValidThetaFrequency[\s\S]*?null[\s\S]*?false/
        );
      });

      it('should check theta range 4-8 Hz', () => {
        expect(componentContent).toMatch(
          /isValidThetaFrequency[\s\S]*?frequency\s*>=\s*4/
        );
      });
    });
  });

  describe('Context Integration', () => {
    it('should use useSession hook', () => {
      expect(componentContent).toMatch(
        /const\s*\{[^}]*\}\s*=\s*useSession\(\)/
      );
    });

    it('should destructure sessionConfig from context', () => {
      expect(componentContent).toMatch(/sessionConfig/);
    });

    it('should destructure sessionState from context', () => {
      expect(componentContent).toMatch(/sessionState/);
    });

    it('should get entrainment_freq from sessionConfig', () => {
      expect(componentContent).toMatch(/entrainment_freq/);
    });
  });

  describe('Animation Implementation', () => {
    it('should use Animated.Value for pulse', () => {
      expect(componentContent).toMatch(/new\s+Animated\.Value/);
    });

    it('should use useRef for animation value', () => {
      expect(componentContent).toMatch(/useRef\(new\s+Animated\.Value/);
    });

    it('should have pulseAnim', () => {
      expect(componentContent).toMatch(/pulseAnim/);
    });

    it('should use useEffect for pulse animation', () => {
      expect(componentContent).toMatch(/useEffect\(/);
    });

    it('should check for active state to start pulse', () => {
      expect(componentContent).toMatch(
        /entrainmentState\s*===\s*['"]active['"]/
      );
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

    it('should pulse to 1.02 scale', () => {
      expect(componentContent).toMatch(/toValue:\s*1\.02/);
    });

    it('should have 1000ms duration for pulse', () => {
      expect(componentContent).toMatch(/duration:\s*1000/);
    });

    it('should use useNativeDriver for performance', () => {
      expect(componentContent).toMatch(/useNativeDriver:\s*true/);
    });

    it('should stop pulse animation on cleanup', () => {
      expect(componentContent).toMatch(/pulse\.stop\(\)/);
    });

    it('should check showPulse prop', () => {
      expect(componentContent).toMatch(/showPulse/);
    });
  });

  describe('Accessibility Features', () => {
    it('should have accessibilityRole="text"', () => {
      expect(componentContent).toMatch(/accessibilityRole\s*=\s*["']text["']/);
    });

    it('should have accessibilityLabel', () => {
      expect(componentContent).toMatch(/accessibilityLabel\s*=/);
    });
  });

  describe('Visual Elements', () => {
    it('should render Entrainment Frequency label', () => {
      expect(componentContent).toMatch(/Entrainment Frequency/);
    });

    it('should render frequency value', () => {
      expect(componentContent).toMatch(/formattedFrequency/);
    });

    it('should render band label', () => {
      expect(componentContent).toMatch(/bandLabel/);
    });

    it('should render state badge', () => {
      expect(componentContent).toMatch(/stateBadge/);
    });

    it('should render state icon', () => {
      expect(componentContent).toMatch(/stateIcon/);
    });

    it('should render state text', () => {
      expect(componentContent).toMatch(/stateLabel/);
    });

    it('should render active indicator when active', () => {
      expect(componentContent).toMatch(/activeIndicator/);
    });
  });

  describe('Conditional Rendering', () => {
    it('should conditionally show label', () => {
      expect(componentContent).toMatch(/showLabel\s*&&/);
    });

    it('should conditionally show state badge', () => {
      expect(componentContent).toMatch(/showState\s*&&/);
    });

    it('should conditionally show active indicator', () => {
      expect(componentContent).toMatch(
        /entrainmentState\s*===\s*['"]active['"]\s*&&/
      );
    });
  });

  describe('Test IDs', () => {
    it('should have default testID', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]entrainment-state-display['"]/
      );
    });

    it('should have testID for main component', () => {
      expect(componentContent).toMatch(/testID=\{testID\}/);
    });

    it('should have testID for label', () => {
      expect(componentContent).toMatch(/-label/);
    });

    it('should have testID for frequency', () => {
      expect(componentContent).toMatch(/-frequency/);
    });

    it('should have testID for band label', () => {
      expect(componentContent).toMatch(/-band-label/);
    });

    it('should have testID for state badge', () => {
      expect(componentContent).toMatch(/-state-badge/);
    });

    it('should have testID for state icon', () => {
      expect(componentContent).toMatch(/-state-icon/);
    });

    it('should have testID for state text', () => {
      expect(componentContent).toMatch(/-state-text/);
    });

    it('should have testID for active indicator', () => {
      expect(componentContent).toMatch(/-active-indicator/);
    });
  });

  describe('Styling', () => {
    it('should define styles with StyleSheet.create', () => {
      expect(componentContent).toMatch(/StyleSheet\.create\(/);
    });

    it('should have container style', () => {
      expect(componentContent).toMatch(/container\s*:/);
    });

    it('should have containerSmall style', () => {
      expect(componentContent).toMatch(/containerSmall\s*:/);
    });

    it('should have containerLarge style', () => {
      expect(componentContent).toMatch(/containerLarge\s*:/);
    });

    it('should have label style', () => {
      expect(componentContent).toMatch(/label\s*:/);
    });

    it('should have frequency style', () => {
      expect(componentContent).toMatch(/frequency\s*:/);
    });

    it('should have frequencySmall style', () => {
      expect(componentContent).toMatch(/frequencySmall\s*:/);
    });

    it('should have frequencyLarge style', () => {
      expect(componentContent).toMatch(/frequencyLarge\s*:/);
    });

    it('should have frequencyContainer style', () => {
      expect(componentContent).toMatch(/frequencyContainer\s*:/);
    });

    it('should have frequencyRow style', () => {
      expect(componentContent).toMatch(/frequencyRow\s*:/);
    });

    it('should have bandLabel style', () => {
      expect(componentContent).toMatch(/bandLabel\s*:/);
    });

    it('should have stateContainer style', () => {
      expect(componentContent).toMatch(/stateContainer\s*:/);
    });

    it('should have stateBadge style', () => {
      expect(componentContent).toMatch(/stateBadge\s*:/);
    });

    it('should have stateBadgeSmall style', () => {
      expect(componentContent).toMatch(/stateBadgeSmall\s*:/);
    });

    it('should have stateBadgeLarge style', () => {
      expect(componentContent).toMatch(/stateBadgeLarge\s*:/);
    });

    it('should have stateIcon style', () => {
      expect(componentContent).toMatch(/stateIcon\s*:/);
    });

    it('should have stateBadgeText style', () => {
      expect(componentContent).toMatch(/stateBadgeText\s*:/);
    });

    it('should have stateBadgeTextSmall style', () => {
      expect(componentContent).toMatch(/stateBadgeTextSmall\s*:/);
    });

    it('should have activeIndicator style', () => {
      expect(componentContent).toMatch(/activeIndicator\s*:/);
    });
  });

  describe('Theme Integration', () => {
    it('should use Colors.surface.primary for background', () => {
      expect(componentContent).toMatch(/Colors\.surface\.primary/);
    });

    it('should use Colors.text.secondary for secondary text', () => {
      expect(componentContent).toMatch(/Colors\.text\.secondary/);
    });

    it('should use Colors.text.tertiary for band label', () => {
      expect(componentContent).toMatch(/Colors\.text\.tertiary/);
    });

    it('should use Colors.text.inverse for badge text', () => {
      expect(componentContent).toMatch(/Colors\.text\.inverse/);
    });

    it('should use BorderRadius for container shape', () => {
      expect(componentContent).toMatch(/BorderRadius\.(sm|md|lg|xl)/);
    });

    it('should use theme shadows', () => {
      expect(componentContent).toMatch(/\.\.\.Shadows\.(sm|md|lg)/);
    });

    it('should use Spacing for padding', () => {
      expect(componentContent).toMatch(/Spacing\.(xs|sm|md|lg|xl)/);
    });

    it('should use Typography.fontSize', () => {
      expect(componentContent).toMatch(/Typography\.fontSize/);
    });

    it('should use Typography.fontWeight', () => {
      expect(componentContent).toMatch(/Typography\.fontWeight/);
    });
  });

  describe('Frequency Display', () => {
    it('should use large font size for frequency', () => {
      expect(componentContent).toMatch(/fontSize:\s*(48|56|64)/);
    });

    it('should use bold font weight for frequency', () => {
      expect(componentContent).toMatch(
        /fontWeight:\s*Typography\.fontWeight\.bold/
      );
    });

    it('should use tabular-nums for consistent number width', () => {
      expect(componentContent).toMatch(/tabular-nums/);
    });
  });

  describe('Active Indicator', () => {
    it('should position active indicator absolutely', () => {
      expect(componentContent).toMatch(
        /activeIndicator[\s\S]*?position:\s*['"]absolute['"]/
      );
    });

    it('should have border for active indicator', () => {
      expect(componentContent).toMatch(/borderWidth:\s*2/);
    });

    it('should use border radius for active indicator', () => {
      expect(componentContent).toMatch(/activeIndicator[\s\S]*?borderRadius/);
    });

    it('should have reduced opacity for active indicator', () => {
      expect(componentContent).toMatch(
        /activeIndicator[\s\S]*?opacity:\s*0\.5/
      );
    });
  });

  describe('Default Prop Values', () => {
    it('should have default size value of medium', () => {
      expect(componentContent).toMatch(/size\s*=\s*['"]medium['"]/);
    });

    it('should have default showLabel value of true', () => {
      expect(componentContent).toMatch(/showLabel\s*=\s*true/);
    });

    it('should have default showState value of true', () => {
      expect(componentContent).toMatch(/showState\s*=\s*true/);
    });

    it('should have default showPulse value of true', () => {
      expect(componentContent).toMatch(/showPulse\s*=\s*true/);
    });

    it('should have default testID value', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]entrainment-state-display['"]/
      );
    });
  });

  describe('Component Documentation', () => {
    it('should have JSDoc comment for component', () => {
      expect(componentContent).toMatch(/\/\*\*[\s\S]*?EntrainmentStateDisplay/);
    });

    it('should document features in JSDoc', () => {
      expect(componentContent).toMatch(/Features:/);
    });

    it('should have JSDoc for props interface', () => {
      expect(componentContent).toMatch(
        /\/\*\*[\s\S]*?Props for.*EntrainmentStateDisplay/
      );
    });

    it('should mention frequency display in docs', () => {
      expect(componentContent).toMatch(/frequency/i);
    });

    it('should mention pulsing animation in docs', () => {
      expect(componentContent).toMatch(/puls/i);
    });

    it('should mention state indication in docs', () => {
      expect(componentContent).toMatch(/state/i);
    });
  });

  describe('Prop Value Handling', () => {
    it('should use prop frequency if provided', () => {
      expect(componentContent).toMatch(/propFrequency/);
    });

    it('should use prop sessionState if provided', () => {
      expect(componentContent).toMatch(/propSessionState/);
    });

    it('should fall back to context values when props not provided', () => {
      expect(componentContent).toMatch(/sessionConfig\?\./);
    });

    it('should use nullish coalescing for frequency', () => {
      expect(componentContent).toMatch(/\?\?\s*null/);
    });
  });

  describe('State Badge Styling', () => {
    it('should use flexDirection row for state badge', () => {
      expect(componentContent).toMatch(/flexDirection:\s*['"]row['"]/);
    });

    it('should align items center in state badge', () => {
      expect(componentContent).toMatch(/alignItems:\s*['"]center['"]/);
    });

    it('should have gap between icon and text', () => {
      expect(componentContent).toMatch(/gap:\s*Spacing\.(xs|sm)/);
    });
  });

  describe('Animated View', () => {
    it('should use Animated.View for main container', () => {
      expect(componentContent).toMatch(/<Animated\.View/);
    });

    it('should apply transform scale from animation', () => {
      expect(componentContent).toMatch(/transform:\s*\[\s*\{\s*scale:/);
    });
  });
});
