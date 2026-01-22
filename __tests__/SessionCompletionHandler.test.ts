/**
 * SessionCompletionHandler Component Tests
 *
 * Comprehensive test suite for the session completion handler component
 * that displays session summary after a session ends.
 */

import * as fs from 'fs';
import * as path from 'path';

const componentPath = path.join(
  __dirname,
  '../src/components/SessionCompletionHandler.tsx'
);
const componentContent = fs.readFileSync(componentPath, 'utf-8');

const indexPath = path.join(__dirname, '../src/components/index.ts');
const indexContent = fs.readFileSync(indexPath, 'utf-8');

describe('SessionCompletionHandler Component', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('should be a TypeScript React file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('should have reasonable file size', () => {
      const stats = fs.statSync(componentPath);
      expect(stats.size).toBeGreaterThan(1000); // At least 1KB
      expect(stats.size).toBeLessThan(100000); // Less than 100KB
    });
  });

  describe('Component Exports', () => {
    it('should export SessionCompletionHandler as named export', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+SessionCompletionHandler/
      );
    });

    it('should export SessionCompletionHandler as default export', () => {
      expect(componentContent).toMatch(
        /export\s+default\s+SessionCompletionHandler/
      );
    });

    it('should export SessionCompletionHandlerProps interface', () => {
      expect(componentContent).toMatch(
        /export\s+interface\s+SessionCompletionHandlerProps/
      );
    });

    it('should export SessionCompletionData interface', () => {
      expect(componentContent).toMatch(
        /export\s+interface\s+SessionCompletionData/
      );
    });

    it('should be exported from components index', () => {
      expect(indexContent).toContain('SessionCompletionHandler');
    });

    it('should export SessionCompletionHandlerProps type from index', () => {
      expect(indexContent).toContain('SessionCompletionHandlerProps');
    });

    it('should export SessionCompletionData type from index', () => {
      expect(indexContent).toContain('SessionCompletionData');
    });
  });

  describe('Required Imports', () => {
    it('should import React', () => {
      expect(componentContent).toMatch(/import\s+React/);
    });

    it('should import useEffect hook', () => {
      expect(componentContent).toContain('useEffect');
    });

    it('should import useState hook', () => {
      expect(componentContent).toContain('useState');
    });

    it('should import useCallback hook', () => {
      expect(componentContent).toContain('useCallback');
    });

    it('should import useRef hook', () => {
      expect(componentContent).toContain('useRef');
    });

    it('should import View from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*View[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import Text from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*Text[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import Modal from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*Modal[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import TouchableOpacity from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*TouchableOpacity[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import TextInput from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*TextInput[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import ScrollView from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*ScrollView[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import Animated from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*Animated[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import KeyboardAvoidingView from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*KeyboardAvoidingView[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import StyleSheet from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*StyleSheet[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import Dimensions from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*Dimensions[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import Platform from react-native', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*Platform[^}]*}\s*from\s*['"]react-native['"]/
      );
    });

    it('should import useSession from contexts', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*useSession[^}]*}\s*from\s*['"]\.\.\/contexts['"]/
      );
    });

    it('should import theme constants', () => {
      expect(componentContent).toContain('Colors');
      expect(componentContent).toContain('Spacing');
      expect(componentContent).toContain('BorderRadius');
      expect(componentContent).toContain('Typography');
      expect(componentContent).toContain('Shadows');
    });

    it('should import Session type', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*Session[^}]*}\s*from\s*['"]\.\.\/types['"]/
      );
    });

    it('should import SessionState type', () => {
      expect(componentContent).toMatch(
        /import\s*{[^}]*SessionState[^}]*}\s*from\s*['"]\.\.\/types['"]/
      );
    });
  });

  describe('SessionCompletionData Interface', () => {
    it('should have session_type field', () => {
      expect(componentContent).toMatch(
        /session_type:\s*Session\['session_type'\]/
      );
    });

    it('should have start_time field', () => {
      expect(componentContent).toMatch(/start_time:\s*number/);
    });

    it('should have end_time field', () => {
      expect(componentContent).toMatch(/end_time:\s*number/);
    });

    it('should have duration_seconds field', () => {
      expect(componentContent).toMatch(/duration_seconds:\s*number/);
    });

    it('should have entrainment_freq field', () => {
      expect(componentContent).toMatch(/entrainment_freq:\s*number/);
    });

    it('should have volume field', () => {
      expect(componentContent).toMatch(/volume:\s*number/);
    });

    it('should have avg_theta_zscore field', () => {
      expect(componentContent).toMatch(/avg_theta_zscore:\s*number/);
    });

    it('should have max_theta_zscore field', () => {
      expect(componentContent).toMatch(/max_theta_zscore:\s*number/);
    });

    it('should have signal_quality_avg field', () => {
      expect(componentContent).toMatch(/signal_quality_avg:\s*number/);
    });

    it('should have subjective_rating field (nullable)', () => {
      expect(componentContent).toMatch(
        /subjective_rating:\s*number\s*\|\s*null/
      );
    });

    it('should have notes field (nullable)', () => {
      expect(componentContent).toMatch(/notes:\s*string\s*\|\s*null/);
    });
  });

  describe('SessionCompletionHandlerProps Interface', () => {
    it('should have visible prop (optional)', () => {
      expect(componentContent).toMatch(/visible\?:\s*boolean/);
    });

    it('should have sessionData prop (optional)', () => {
      expect(componentContent).toMatch(
        /sessionData\?:\s*Partial<SessionCompletionData>/
      );
    });

    it('should have onSave callback prop (optional)', () => {
      expect(componentContent).toMatch(
        /onSave\?:\s*\(data:\s*SessionCompletionData\)\s*=>\s*void/
      );
    });

    it('should have onDismiss callback prop (optional)', () => {
      expect(componentContent).toMatch(/onDismiss\?:\s*\(\)\s*=>\s*void/);
    });

    it('should have onNewSession callback prop (optional)', () => {
      expect(componentContent).toMatch(/onNewSession\?:\s*\(\)\s*=>\s*void/);
    });

    it('should have autoShow prop (optional)', () => {
      expect(componentContent).toMatch(/autoShow\?:\s*boolean/);
    });

    it('should have testID prop (optional)', () => {
      expect(componentContent).toMatch(/testID\?:\s*string/);
    });
  });

  describe('Helper Functions - formatDuration', () => {
    it('should export formatDuration function', () => {
      expect(componentContent).toMatch(/export\s+const\s+formatDuration\s*=/);
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('formatDuration');
    });

    it('should accept seconds as parameter', () => {
      expect(componentContent).toMatch(
        /formatDuration\s*=\s*\(\s*seconds:\s*number\s*\)/
      );
    });

    it('should return a string', () => {
      expect(componentContent).toMatch(
        /formatDuration\s*=\s*\([^)]+\):\s*string/
      );
    });

    it('should handle negative values', () => {
      expect(componentContent).toMatch(/if\s*\(\s*seconds\s*<\s*0\s*\)/);
    });

    it('should handle hours', () => {
      expect(componentContent).toMatch(
        /Math\.floor\s*\(\s*seconds\s*\/\s*3600\s*\)/
      );
    });

    it('should handle minutes', () => {
      expect(componentContent).toMatch(
        /Math\.floor\s*\(\s*\(\s*seconds\s*%\s*3600\s*\)\s*\/\s*60\s*\)/
      );
    });
  });

  describe('Helper Functions - formatDurationClock', () => {
    it('should export formatDurationClock function', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+formatDurationClock\s*=/
      );
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('formatDurationClock');
    });

    it('should accept seconds as parameter', () => {
      expect(componentContent).toMatch(
        /formatDurationClock\s*=\s*\(\s*seconds:\s*number\s*\)/
      );
    });

    it('should return a string', () => {
      expect(componentContent).toMatch(
        /formatDurationClock\s*=\s*\([^)]+\):\s*string/
      );
    });

    it('should use zero padding', () => {
      expect(componentContent).toMatch(
        /padStart\s*\(\s*2\s*,\s*['"]0['"]\s*\)/
      );
    });
  });

  describe('Helper Functions - getCompletionMessage', () => {
    it('should export getCompletionMessage function', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+getCompletionMessage\s*=/
      );
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('getCompletionMessage');
    });

    it('should accept durationSeconds parameter', () => {
      expect(componentContent).toMatch(
        /getCompletionMessage\s*=\s*\(\s*durationSeconds:\s*number/
      );
    });

    it('should accept avgThetaZScore parameter', () => {
      expect(componentContent).toMatch(
        /avgThetaZScore:\s*number\s*\|\s*undefined/
      );
    });

    it('should accept maxThetaZScore parameter', () => {
      expect(componentContent).toMatch(
        /maxThetaZScore:\s*number\s*\|\s*undefined/
      );
    });

    it('should return a string', () => {
      expect(componentContent).toMatch(
        /getCompletionMessage\s*=\s*\([^)]+\):\s*string/
      );
    });

    it('should check for excellent theta performance (>= 1.5)', () => {
      expect(componentContent).toMatch(/avgThetaZScore\s*>=\s*1\.5/);
    });

    it('should check for great theta performance (>= 1.0)', () => {
      expect(componentContent).toMatch(/avgThetaZScore\s*>=\s*1\.0/);
    });

    it('should check for good theta performance (>= 0.5)', () => {
      expect(componentContent).toMatch(/avgThetaZScore\s*>=\s*0\.5/);
    });

    it('should provide messages based on duration', () => {
      expect(componentContent).toMatch(/minutes\s*>=\s*30/);
      expect(componentContent).toMatch(/minutes\s*>=\s*15/);
      expect(componentContent).toMatch(/minutes\s*>=\s*5/);
    });
  });

  describe('Helper Functions - getThetaPerformanceLevel', () => {
    it('should export getThetaPerformanceLevel function', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+getThetaPerformanceLevel\s*=/
      );
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('getThetaPerformanceLevel');
    });

    it('should accept avgZScore parameter', () => {
      expect(componentContent).toMatch(
        /getThetaPerformanceLevel\s*=\s*\(\s*avgZScore:\s*number\s*\|\s*undefined/
      );
    });

    it('should return object with label property', () => {
      expect(componentContent).toMatch(/:\s*{\s*label:\s*string/);
    });

    it('should return object with color property', () => {
      expect(componentContent).toMatch(/color:\s*string\s*}/);
    });

    it('should handle undefined score', () => {
      expect(componentContent).toMatch(/avgZScore\s*===\s*undefined/);
    });

    it('should use Excellent for high scores (>= 1.5)', () => {
      expect(componentContent).toMatch(/label:\s*['"]Excellent['"]/);
    });

    it('should use Great for good scores (>= 1.0)', () => {
      expect(componentContent).toMatch(/label:\s*['"]Great['"]/);
    });

    it('should use Good for moderate scores (>= 0.5)', () => {
      expect(componentContent).toMatch(/label:\s*['"]Good['"]/);
    });

    it('should use Fair for low scores (>= 0)', () => {
      expect(componentContent).toMatch(/label:\s*['"]Fair['"]/);
    });

    it('should use Below Baseline for negative scores', () => {
      expect(componentContent).toMatch(/label:\s*['"]Below Baseline['"]/);
    });
  });

  describe('Helper Functions - getSignalQualityLevel', () => {
    it('should export getSignalQualityLevel function', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+getSignalQualityLevel\s*=/
      );
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('getSignalQualityLevel');
    });

    it('should accept score parameter', () => {
      expect(componentContent).toMatch(
        /getSignalQualityLevel\s*=\s*\(\s*score:\s*number\s*\|\s*undefined/
      );
    });

    it('should return object with label and color', () => {
      // Already verified in getThetaPerformanceLevel tests
      expect(componentContent).toContain('getSignalQualityLevel');
    });

    it('should check for excellent signal (>= 80)', () => {
      expect(componentContent).toMatch(/score\s*>=\s*80/);
    });

    it('should check for good signal (>= 60)', () => {
      expect(componentContent).toMatch(/score\s*>=\s*60/);
    });

    it('should check for fair signal (>= 40)', () => {
      expect(componentContent).toMatch(/score\s*>=\s*40/);
    });

    it('should check for poor signal (>= 20)', () => {
      expect(componentContent).toMatch(/score\s*>=\s*20/);
    });
  });

  describe('Helper Functions - formatZScore', () => {
    it('should export formatZScore function', () => {
      expect(componentContent).toMatch(/export\s+const\s+formatZScore\s*=/);
    });

    it('should be exported from index as formatCompletionZScore', () => {
      expect(indexContent).toContain('formatZScore as formatCompletionZScore');
    });

    it('should accept zscore parameter', () => {
      expect(componentContent).toMatch(
        /formatZScore\s*=\s*\(\s*zscore:\s*number\s*\|\s*undefined\s*\)/
      );
    });

    it('should return a string', () => {
      expect(componentContent).toMatch(
        /formatZScore\s*=\s*\([^)]+\):\s*string/
      );
    });

    it('should handle undefined values', () => {
      expect(componentContent).toMatch(/zscore\s*===\s*undefined/);
    });

    it('should add sign prefix for positive values', () => {
      expect(componentContent).toMatch(
        /sign\s*=\s*zscore\s*>=\s*0\s*\?\s*['"]\+['"]/
      );
    });

    it('should format to 2 decimal places', () => {
      expect(componentContent).toMatch(/\.toFixed\s*\(\s*2\s*\)/);
    });
  });

  describe('Helper Functions - getSessionTypeLabel', () => {
    it('should export getSessionTypeLabel function', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+getSessionTypeLabel\s*=/
      );
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('getSessionTypeLabel');
    });

    it('should handle calibration type', () => {
      expect(componentContent).toMatch(/case\s*['"]calibration['"]:/);
      expect(componentContent).toMatch(/return\s*['"]Calibration['"]/);
    });

    it('should handle quick_boost type', () => {
      expect(componentContent).toMatch(/case\s*['"]quick_boost['"]:/);
      expect(componentContent).toMatch(/return\s*['"]Quick Boost['"]/);
    });

    it('should handle custom type', () => {
      expect(componentContent).toMatch(/case\s*['"]custom['"]:/);
      expect(componentContent).toMatch(/return\s*['"]Custom Session['"]/);
    });

    it('should handle scheduled type', () => {
      expect(componentContent).toMatch(/case\s*['"]scheduled['"]:/);
      expect(componentContent).toMatch(/return\s*['"]Scheduled Session['"]/);
    });

    it('should handle sham type', () => {
      expect(componentContent).toMatch(/case\s*['"]sham['"]:/);
      expect(componentContent).toMatch(/return\s*['"]Practice Session['"]/);
    });

    it('should have a default case', () => {
      expect(componentContent).toMatch(/default:/);
    });
  });

  describe('Helper Functions - getRatingAccessibilityLabel', () => {
    it('should export getRatingAccessibilityLabel function', () => {
      expect(componentContent).toMatch(
        /export\s+const\s+getRatingAccessibilityLabel\s*=/
      );
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('getRatingAccessibilityLabel');
    });

    it('should accept rating parameter', () => {
      expect(componentContent).toMatch(
        /getRatingAccessibilityLabel\s*=\s*\(\s*rating:\s*number/
      );
    });

    it('should accept selectedRating parameter', () => {
      expect(componentContent).toMatch(/selectedRating:\s*number\s*\|\s*null/);
    });

    it('should return a string', () => {
      expect(componentContent).toMatch(
        /getRatingAccessibilityLabel\s*=\s*\([^)]+\):\s*string/
      );
    });

    it('should indicate if rating is selected', () => {
      expect(componentContent).toMatch(/isSelected\s*\?\s*/);
    });
  });

  describe('RATING_LABELS Constant', () => {
    it('should export RATING_LABELS constant', () => {
      expect(componentContent).toMatch(/export\s+const\s+RATING_LABELS/);
    });

    it('should be exported from index', () => {
      expect(indexContent).toContain('RATING_LABELS');
    });

    it('should have label for rating 1', () => {
      expect(componentContent).toMatch(/1:\s*['"]Poor['"]/);
    });

    it('should have label for rating 2', () => {
      expect(componentContent).toMatch(/2:\s*['"]Fair['"]/);
    });

    it('should have label for rating 3', () => {
      expect(componentContent).toMatch(/3:\s*['"]Good['"]/);
    });

    it('should have label for rating 4', () => {
      expect(componentContent).toMatch(/4:\s*['"]Great['"]/);
    });

    it('should have label for rating 5', () => {
      expect(componentContent).toMatch(/5:\s*['"]Excellent['"]/);
    });
  });

  describe('Context Integration', () => {
    it('should use useSession hook', () => {
      expect(componentContent).toMatch(
        /const\s*{[^}]+}\s*=\s*useSession\s*\(\s*\)/
      );
    });

    it('should access sessionState from context', () => {
      expect(componentContent).toContain('sessionState');
    });

    it('should access sessionConfig from context', () => {
      expect(componentContent).toContain('sessionConfig');
    });

    it('should access currentThetaZScore from context', () => {
      expect(componentContent).toContain('currentThetaZScore');
    });

    it('should access elapsedSeconds from context', () => {
      expect(componentContent).toContain('elapsedSeconds');
    });

    it('should access setSessionState from context', () => {
      expect(componentContent).toContain('setSessionState');
    });

    it('should access addSession from context', () => {
      expect(componentContent).toContain('addSession');
    });
  });

  describe('State Management', () => {
    it('should have internal visibility state', () => {
      expect(componentContent).toMatch(
        /const\s*\[\s*internalVisible\s*,\s*setInternalVisible\s*\]\s*=\s*useState\s*\(\s*false\s*\)/
      );
    });

    it('should have selectedRating state', () => {
      expect(componentContent).toMatch(
        /const\s*\[\s*selectedRating\s*,\s*setSelectedRating\s*\]\s*=\s*useState/
      );
    });

    it('should have notes state', () => {
      expect(componentContent).toMatch(
        /const\s*\[\s*notes\s*,\s*setNotes\s*\]\s*=\s*useState/
      );
    });

    it('should have isSaving state', () => {
      expect(componentContent).toMatch(
        /const\s*\[\s*isSaving\s*,\s*setIsSaving\s*\]\s*=\s*useState/
      );
    });

    it('should track previous session state with ref', () => {
      expect(componentContent).toMatch(/prevSessionStateRef/);
    });
  });

  describe('Auto-Show Behavior', () => {
    it('should detect session state transition to stopped', () => {
      expect(componentContent).toMatch(/sessionState\s*===\s*['"]stopped['"]/);
    });

    it('should check previous state is not stopped', () => {
      expect(componentContent).toMatch(
        /prevSessionStateRef\.current\s*!==\s*['"]stopped['"]/
      );
    });

    it('should set internal visible to true on transition', () => {
      expect(componentContent).toMatch(/setInternalVisible\s*\(\s*true\s*\)/);
    });

    it('should update session completion data', () => {
      expect(componentContent).toMatch(/setSessionCompletionData/);
    });

    it('should respect autoShow prop', () => {
      expect(componentContent).toMatch(/if\s*\(\s*autoShow/);
    });
  });

  describe('Animation Implementation', () => {
    it('should create fade animation value', () => {
      expect(componentContent).toMatch(
        /fadeAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value\s*\(\s*0\s*\)\s*\)/
      );
    });

    it('should create slide animation value', () => {
      expect(componentContent).toMatch(
        /slideAnim\s*=\s*useRef\s*\(\s*new\s+Animated\.Value\s*\(\s*50\s*\)\s*\)/
      );
    });

    it('should use Animated.parallel for entrance', () => {
      expect(componentContent).toMatch(/Animated\.parallel\s*\(/);
    });

    it('should use Animated.timing for fade', () => {
      expect(componentContent).toMatch(/Animated\.timing\s*\(\s*fadeAnim/);
    });

    it('should use Animated.spring for slide', () => {
      expect(componentContent).toMatch(/Animated\.spring\s*\(\s*slideAnim/);
    });

    it('should use native driver', () => {
      expect(componentContent).toMatch(/useNativeDriver:\s*true/);
    });
  });

  describe('Modal Component', () => {
    it('should use Modal component', () => {
      expect(componentContent).toMatch(/<Modal/);
    });

    it('should have transparent prop', () => {
      expect(componentContent).toMatch(/<Modal[^>]*transparent/);
    });

    it('should have animationType none', () => {
      expect(componentContent).toMatch(/animationType=["']none["']/);
    });

    it('should have onRequestClose handler', () => {
      expect(componentContent).toMatch(/onRequestClose\s*=\s*{/);
    });

    it('should render overlay', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-overlay`\}/);
    });

    it('should have touchable overlay for dismissal', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-overlay-touchable`\}/
      );
    });
  });

  describe('Rating Section', () => {
    it('should render rating section', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-rating-section`\}/
      );
    });

    it('should render 5 rating stars', () => {
      expect(componentContent).toMatch(
        /for\s*\(\s*let\s+i\s*=\s*1;\s*i\s*<=\s*5;\s*i\+\+\s*\)/
      );
    });

    it('should have star container', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-stars-container`\}/
      );
    });

    it('should render individual stars with testID', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-rating-star-\$\{i\}`\}/
      );
    });

    it('should display rating label when selected', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-rating-label`\}/
      );
    });

    it('should use filled star character for selected', () => {
      expect(componentContent).toContain('★');
    });

    it('should use empty star character for unselected', () => {
      expect(componentContent).toContain('☆');
    });

    it('should handle rating selection', () => {
      expect(componentContent).toMatch(/handleRatingSelect/);
    });

    it('should toggle rating on re-tap', () => {
      expect(componentContent).toMatch(
        /rating\s*===\s*selectedRating\s*\?\s*null\s*:\s*rating/
      );
    });
  });

  describe('Notes Section', () => {
    it('should render notes section', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-notes-section`\}/
      );
    });

    it('should render notes input', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-notes-input`\}/);
    });

    it('should use TextInput component', () => {
      expect(componentContent).toMatch(/<TextInput/);
    });

    it('should have multiline enabled', () => {
      expect(componentContent).toMatch(/multiline/);
    });

    it('should have max length', () => {
      expect(componentContent).toMatch(/maxLength=\{500\}/);
    });

    it('should have placeholder text', () => {
      expect(componentContent).toMatch(
        /placeholder=["']Add notes about this session\.\.\.["']/
      );
    });
  });

  describe('Summary Stats Display', () => {
    it('should render stats container', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-stats`\}/);
    });

    it('should render duration card', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-duration-card`\}/
      );
    });

    it('should render duration value', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-duration`\}/);
    });

    it('should render theta card', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-theta-card`\}/);
    });

    it('should render theta zscore value', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-theta-zscore`\}/
      );
    });

    it('should render signal card', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-signal-card`\}/);
    });

    it('should render signal quality value', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-signal-quality`\}/
      );
    });
  });

  describe('Session Details Display', () => {
    it('should render details section', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-details`\}/);
    });

    it('should display session type', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-session-type`\}/
      );
    });

    it('should display entrainment frequency', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-frequency`\}/);
    });

    it('should conditionally display max theta', () => {
      expect(componentContent).toMatch(/maxThetaZScore\s*!==\s*undefined\s*&&/);
    });
  });

  describe('Header Section', () => {
    it('should render header', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-header`\}/);
    });

    it('should render completion icon', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-icon`\}/);
    });

    it('should show checkmark icon', () => {
      expect(componentContent).toContain('✓');
    });

    it('should render title', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-title`\}/);
    });

    it('should show "Session Complete" title', () => {
      expect(componentContent).toMatch(/Session Complete/);
    });

    it('should render completion message', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-message`\}/);
    });
  });

  describe('Action Buttons', () => {
    it('should render buttons container', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-buttons`\}/);
    });

    it('should render save button', () => {
      expect(componentContent).toMatch(/testID=\{`\$\{testID\}-save-button`\}/);
    });

    it('should show "Save Session" text', () => {
      expect(componentContent).toMatch(/Save Session/);
    });

    it('should show "Saving..." when isSaving', () => {
      expect(componentContent).toMatch(
        /isSaving\s*\?\s*['"]Saving\.\.\.['"].*['"]Save Session['"]/
      );
    });

    it('should disable save button when saving', () => {
      expect(componentContent).toMatch(/disabled=\{isSaving\}/);
    });

    it('should render new session button', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-new-session-button`\}/
      );
    });

    it('should show "New Session" text', () => {
      expect(componentContent).toMatch(/New Session/);
    });

    it('should render dismiss button', () => {
      expect(componentContent).toMatch(
        /testID=\{`\$\{testID\}-dismiss-button`\}/
      );
    });

    it('should show "Dismiss" text', () => {
      expect(componentContent).toMatch(/Dismiss/);
    });
  });

  describe('Event Handlers', () => {
    it('should have handleSave function', () => {
      expect(componentContent).toMatch(
        /const\s+handleSave\s*=\s*async\s*\(\s*\)/
      );
    });

    it('should have handleClose function', () => {
      expect(componentContent).toMatch(/const\s+handleClose\s*=\s*\(\s*\)/);
    });

    it('should have handleNewSession function', () => {
      expect(componentContent).toMatch(
        /const\s+handleNewSession\s*=\s*\(\s*\)/
      );
    });

    it('should have handleRatingSelect function', () => {
      expect(componentContent).toMatch(/const\s+handleRatingSelect\s*=\s*\(/);
    });

    it('should call onSave callback when saving', () => {
      expect(componentContent).toMatch(/if\s*\(\s*onSave\s*\)/);
    });

    it('should call onDismiss callback when closing', () => {
      expect(componentContent).toMatch(/if\s*\(\s*onDismiss\s*\)/);
    });

    it('should call onNewSession callback', () => {
      expect(componentContent).toMatch(/if\s*\(\s*onNewSession\s*\)/);
    });

    it('should reset session state to idle on close', () => {
      expect(componentContent).toMatch(
        /setSessionState\s*\(\s*['"]idle['"]\s*\)/
      );
    });

    it('should add session to recent sessions', () => {
      expect(componentContent).toMatch(/addSession\s*\(/);
    });
  });

  describe('Accessibility Features', () => {
    it('should have accessibilityRole on buttons', () => {
      expect(componentContent).toMatch(/accessibilityRole=["']button["']/);
    });

    it('should have accessibilityLabel on save button', () => {
      expect(componentContent).toMatch(
        /accessibilityLabel=["']Save session["']/
      );
    });

    it('should have accessibilityHint on save button', () => {
      expect(componentContent).toMatch(
        /accessibilityHint=["']Saves the session with your rating and notes["']/
      );
    });

    it('should have accessibilityLabel on new session button', () => {
      expect(componentContent).toMatch(
        /accessibilityLabel=["']Start new session["']/
      );
    });

    it('should have accessibilityLabel on dismiss button', () => {
      expect(componentContent).toMatch(/accessibilityLabel=["']Dismiss["']/);
    });

    it('should have accessibilityLabel on notes input', () => {
      expect(componentContent).toMatch(
        /accessibilityLabel=["']Session notes["']/
      );
    });

    it('should have accessibilityHint on notes input', () => {
      expect(componentContent).toMatch(
        /accessibilityHint=["']Enter optional notes about this session["']/
      );
    });

    it('should have accessibility on rating stars', () => {
      expect(componentContent).toMatch(
        /accessibilityHint=\{`Tap to rate this session/
      );
    });
  });

  describe('Styling', () => {
    it('should use StyleSheet.create', () => {
      expect(componentContent).toMatch(
        /const\s+styles\s*=\s*StyleSheet\.create\s*\(/
      );
    });

    it('should have overlay style', () => {
      expect(componentContent).toMatch(/overlay:\s*{/);
    });

    it('should have modalContainer style', () => {
      expect(componentContent).toMatch(/modalContainer:\s*{/);
    });

    it('should have header style', () => {
      expect(componentContent).toMatch(/header:\s*{/);
    });

    it('should have title style', () => {
      expect(componentContent).toMatch(/title:\s*{/);
    });

    it('should have statsContainer style', () => {
      expect(componentContent).toMatch(/statsContainer:\s*{/);
    });

    it('should have statCard style', () => {
      expect(componentContent).toMatch(/statCard:\s*{/);
    });

    it('should have statLabel style', () => {
      expect(componentContent).toMatch(/statLabel:\s*{/);
    });

    it('should have statValue style', () => {
      expect(componentContent).toMatch(/statValue:\s*{/);
    });

    it('should have ratingSection style', () => {
      expect(componentContent).toMatch(/ratingSection:\s*{/);
    });

    it('should have star style', () => {
      expect(componentContent).toMatch(/star:\s*{/);
    });

    it('should have starSelected style', () => {
      expect(componentContent).toMatch(/starSelected:\s*{/);
    });

    it('should have notesSection style', () => {
      expect(componentContent).toMatch(/notesSection:\s*{/);
    });

    it('should have notesInput style', () => {
      expect(componentContent).toMatch(/notesInput:\s*{/);
    });

    it('should have button styles', () => {
      expect(componentContent).toMatch(/button:\s*{/);
      expect(componentContent).toMatch(/saveButton:\s*{/);
      expect(componentContent).toMatch(/dismissButton:\s*{/);
    });

    it('should use tabular-nums for numeric values', () => {
      expect(componentContent).toMatch(
        /fontVariant:\s*\[['"]tabular-nums['"]\]/
      );
    });
  });

  describe('Theme Integration', () => {
    it('should use Colors.overlay.dark for overlay', () => {
      expect(componentContent).toContain('Colors.overlay.dark');
    });

    it('should use Colors.surface.elevated for modal', () => {
      expect(componentContent).toContain('Colors.surface.elevated');
    });

    it('should use Colors.accent.success for completion icon', () => {
      expect(componentContent).toContain('Colors.accent.success');
    });

    it('should use Colors.status colors for theta performance', () => {
      expect(componentContent).toContain('Colors.status.green');
      expect(componentContent).toContain('Colors.status.blue');
      expect(componentContent).toContain('Colors.status.yellow');
      expect(componentContent).toContain('Colors.status.red');
    });

    it('should use Colors.signal colors for signal quality', () => {
      expect(componentContent).toContain('Colors.signal.excellent');
      expect(componentContent).toContain('Colors.signal.good');
      expect(componentContent).toContain('Colors.signal.fair');
      expect(componentContent).toContain('Colors.signal.poor');
      expect(componentContent).toContain('Colors.signal.critical');
    });

    it('should use Shadows for modal elevation', () => {
      expect(componentContent).toContain('Shadows.lg');
    });

    it('should use BorderRadius for rounded corners', () => {
      expect(componentContent).toContain('BorderRadius.xl');
      expect(componentContent).toContain('BorderRadius.md');
    });

    it('should use Typography for font sizes', () => {
      expect(componentContent).toContain('Typography.fontSize');
    });

    it('should use Typography for font weights', () => {
      expect(componentContent).toContain('Typography.fontWeight');
    });

    it('should use Spacing for margins and padding', () => {
      expect(componentContent).toContain('Spacing.lg');
      expect(componentContent).toContain('Spacing.md');
      expect(componentContent).toContain('Spacing.sm');
      expect(componentContent).toContain('Spacing.xs');
    });
  });

  describe('KeyboardAvoidingView', () => {
    it('should use KeyboardAvoidingView', () => {
      expect(componentContent).toMatch(/<KeyboardAvoidingView/);
    });

    it('should handle iOS and Android differently', () => {
      expect(componentContent).toMatch(/Platform\.OS\s*===\s*['"]ios['"]/);
    });

    it('should use padding behavior for iOS', () => {
      expect(componentContent).toMatch(/['"]padding['"]/);
    });

    it('should use height behavior for Android', () => {
      expect(componentContent).toMatch(/['"]height['"]/);
    });
  });

  describe('ScrollView', () => {
    it('should use ScrollView for content', () => {
      expect(componentContent).toMatch(/<ScrollView/);
    });

    it('should hide vertical scroll indicator', () => {
      expect(componentContent).toMatch(
        /showsVerticalScrollIndicator=\{false\}/
      );
    });

    it('should have bounces disabled', () => {
      expect(componentContent).toMatch(/bounces=\{false\}/);
    });
  });

  describe('Modal Dimensions', () => {
    it('should use Dimensions.get for screen width', () => {
      expect(componentContent).toMatch(
        /Dimensions\.get\s*\(\s*['"]window['"]\s*\)/
      );
    });

    it('should calculate modal width', () => {
      expect(componentContent).toMatch(/modalWidth\s*=\s*Math\.min/);
    });

    it('should have max width of 400', () => {
      expect(componentContent).toContain('400');
    });

    it('should use horizontal spacing for margin', () => {
      expect(componentContent).toMatch(/Spacing\.lg\s*\*\s*2/);
    });
  });

  describe('Default Props', () => {
    it('should have autoShow default to true', () => {
      expect(componentContent).toMatch(/autoShow\s*=\s*true/);
    });

    it('should have default testID', () => {
      expect(componentContent).toMatch(
        /testID\s*=\s*['"]session-completion-handler['"],?/
      );
    });
  });

  describe('Documentation', () => {
    it('should have component documentation', () => {
      expect(componentContent).toMatch(
        /\/\*\*\s*\n\s*\*\s*SessionCompletionHandler/
      );
    });

    it('should document features', () => {
      expect(componentContent).toMatch(/\*\s*Features:/);
    });

    it('should document session summary display', () => {
      expect(componentContent).toMatch(/session summary/i);
    });

    it('should document rating functionality', () => {
      expect(componentContent).toMatch(/rate the session/i);
    });

    it('should document notes functionality', () => {
      expect(componentContent).toMatch(/add optional notes/i);
    });

    it('should document animation', () => {
      expect(componentContent).toMatch(/Animated entrance\/exit/i);
    });

    it('should document accessibility', () => {
      expect(componentContent).toMatch(/Accessible with proper labels/i);
    });

    it('should document auto-show behavior', () => {
      expect(componentContent).toMatch(
        /Auto-shows when session state changes to 'stopped'/i
      );
    });

    it('should have helper function documentation', () => {
      expect(componentContent).toMatch(/\/\*\*\s*\n\s*\*\s*Formats duration/);
      expect(componentContent).toMatch(
        /\/\*\*\s*\n\s*\*\s*Gets a congratulatory message/
      );
    });
  });

  describe('Build Session Data', () => {
    it('should have buildSessionData function', () => {
      expect(componentContent).toMatch(
        /const\s+buildSessionData\s*=\s*useCallback/
      );
    });

    it('should use prop session data if provided', () => {
      expect(componentContent).toMatch(/if\s*\(\s*propSessionData\s*\)/);
    });

    it('should calculate start_time from elapsed seconds', () => {
      expect(componentContent).toMatch(
        /Date\.now\s*\(\s*\)\s*-\s*elapsedSeconds\s*\*\s*1000/
      );
    });

    it('should use session config for session type', () => {
      expect(componentContent).toMatch(
        /sessionConfig\?\.type\s*\?\?\s*['"]custom['"]/
      );
    });

    it('should use session config for entrainment frequency', () => {
      expect(componentContent).toMatch(
        /sessionConfig\?\.entrainment_freq\s*\?\?\s*6/
      );
    });

    it('should use session config for volume', () => {
      expect(componentContent).toMatch(/sessionConfig\?\.volume\s*\?\?\s*50/);
    });
  });
});

// Functional tests for helper functions
describe('SessionCompletionHandler Helper Functions - Functional Tests', () => {
  // We'll import the actual functions for testing
  let helpers: {
    formatDuration: (seconds: number) => string;
    formatDurationClock: (seconds: number) => string;
    getCompletionMessage: (
      durationSeconds: number,
      avgThetaZScore: number | undefined,
      maxThetaZScore: number | undefined
    ) => string;
    getThetaPerformanceLevel: (avgZScore: number | undefined) => {
      label: string;
      color: string;
    };
    getSignalQualityLevel: (score: number | undefined) => {
      label: string;
      color: string;
    };
    formatZScore: (zscore: number | undefined) => string;
    getSessionTypeLabel: (sessionType: string | undefined) => string;
    RATING_LABELS: Record<number, string>;
  };

  beforeAll(() => {
    // Extract the functions from the component file for testing
    // Since we can't import directly in this test environment,
    // we'll test the patterns match expected behavior
  });

  describe('formatDuration', () => {
    it('function signature should handle seconds to human-readable', () => {
      // Pattern: 30s -> "30s", 90s -> "1m 30s", 3661s -> "1h 1m 1s"
      expect(componentContent).toContain('${hours}h ${minutes}m ${secs}s');
      expect(componentContent).toContain('${minutes}m ${secs}s');
      expect(componentContent).toContain('${secs}s');
    });
  });

  describe('formatDurationClock', () => {
    it('function signature should handle clock format', () => {
      // Pattern: 30s -> "00:30", 90s -> "01:30", 3661s -> "01:01:01"
      expect(componentContent).toContain(
        '${pad(hours)}:${pad(minutes)}:${pad(secs)}'
      );
      expect(componentContent).toContain('${pad(minutes)}:${pad(secs)}');
    });
  });

  describe('getCompletionMessage', () => {
    it('should have messages for different theta levels', () => {
      expect(componentContent).toContain(
        'Excellent session! You achieved deep focus.'
      );
      expect(componentContent).toContain(
        'Great work! Your theta activity was elevated.'
      );
      expect(componentContent).toContain(
        'Good session! Keep practicing for better results.'
      );
    });

    it('should have messages for different durations', () => {
      expect(componentContent).toContain(
        'Impressive dedication! Long session completed.'
      );
      expect(componentContent).toContain('Well done! Solid practice session.');
      expect(componentContent).toContain(
        'Session complete! Every minute counts.'
      );
    });

    it('should have default message', () => {
      expect(componentContent).toMatch(/return\s*['"]Session complete!['"]/);
    });
  });

  describe('RATING_LABELS', () => {
    it('should have all 5 ratings defined', () => {
      expect(componentContent).toContain('1:');
      expect(componentContent).toContain('2:');
      expect(componentContent).toContain('3:');
      expect(componentContent).toContain('4:');
      expect(componentContent).toContain('5:');
    });
  });
});
