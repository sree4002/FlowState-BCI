/**
 * Tests for OnboardingScreen component
 *
 * These tests verify the OnboardingScreen module structure, exports,
 * and file content without requiring the full React Native runtime.
 */

import * as fs from 'fs';
import * as path from 'path';

const ONBOARDING_SCREEN_PATH = path.join(
  __dirname,
  '../src/screens/OnboardingScreen.tsx'
);
const SCREENS_INDEX_PATH = path.join(__dirname, '../src/screens/index.ts');

describe('OnboardingScreen Module', () => {
  describe('File structure', () => {
    it('should exist at the expected path', () => {
      expect(fs.existsSync(ONBOARDING_SCREEN_PATH)).toBe(true);
    });

    it('should be a TypeScript React component file', () => {
      expect(ONBOARDING_SCREEN_PATH).toMatch(/\.tsx$/);
    });
  });

  describe('Component exports', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should export OnboardingScreen as a named export', () => {
      expect(fileContent).toMatch(/export function OnboardingScreen/);
    });

    it('should export OnboardingScreen as the default export', () => {
      expect(fileContent).toMatch(/export default OnboardingScreen/);
    });

    it('should export OnboardingScreenProps interface', () => {
      expect(fileContent).toMatch(/export interface OnboardingScreenProps/);
    });
  });

  describe('Screen index exports', () => {
    let indexContent: string;

    beforeAll(() => {
      indexContent = fs.readFileSync(SCREENS_INDEX_PATH, 'utf-8');
    });

    it('should export OnboardingScreen from screens index', () => {
      expect(indexContent).toMatch(
        /export \{ OnboardingScreen \} from '\.\/OnboardingScreen'/
      );
    });

    it('should export OnboardingScreenProps type from screens index', () => {
      expect(indexContent).toMatch(
        /export type \{ OnboardingScreenProps \} from '\.\/OnboardingScreen'/
      );
    });
  });

  describe('Slide content', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should have 3 slides defined in the SLIDES array', () => {
      const slidesMatch = fileContent.match(
        /const SLIDES: OnboardingSlide\[\] = \[[\s\S]*?\];/
      );
      expect(slidesMatch).toBeTruthy();
      if (slidesMatch) {
        const slidesContent = slidesMatch[0];
        // Count occurrences of slide objects (by counting { id: patterns)
        const slideCount = (slidesContent.match(/id: '\d+'/g) || []).length;
        expect(slideCount).toBe(3);
      }
    });

    it('should have slide 1 about theta wave monitoring', () => {
      expect(fileContent).toContain('Monitor Your Theta Waves');
      expect(fileContent).toContain('real-time');
    });

    it('should have slide 2 about personalized audio entrainment', () => {
      expect(fileContent).toContain('Personalized Audio Entrainment');
      expect(fileContent).toContain('adaptive audio');
    });

    it('should have slide 3 about progress tracking', () => {
      expect(fileContent).toContain('Track Your Progress');
      expect(fileContent).toContain('peak hours');
    });
  });

  describe('Component props', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should accept onComplete callback prop', () => {
      expect(fileContent).toContain('onComplete?: () => void');
    });

    it('should accept onSkip callback prop', () => {
      expect(fileContent).toContain('onSkip?: () => void');
    });
  });

  describe('UI elements', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should have a skip button', () => {
      expect(fileContent).toContain('testID="onboarding-skip-button"');
      expect(fileContent).toContain('Skip');
    });

    it('should have a next button', () => {
      expect(fileContent).toContain('testID="onboarding-next-button"');
      expect(fileContent).toContain('Next');
    });

    it('should have a get started button state', () => {
      expect(fileContent).toContain('Get Started');
    });

    it('should have pagination dots', () => {
      expect(fileContent).toContain('testID="onboarding-pagination"');
      expect(fileContent).toContain('pagination-dot-');
    });

    it('should use FlatList for swipeable slides', () => {
      expect(fileContent).toMatch(
        /import[\s\S]*FlatList[\s\S]*from 'react-native'/
      );
      expect(fileContent).toContain('<FlatList');
      expect(fileContent).toContain('pagingEnabled');
    });
  });

  describe('Accessibility', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should have accessibility label on skip button', () => {
      expect(fileContent).toContain('accessibilityLabel="Skip onboarding"');
    });

    it('should have accessibility role on skip button', () => {
      expect(fileContent).toContain('accessibilityRole="button"');
    });

    it('should have accessibility labels on pagination dots', () => {
      expect(fileContent).toContain(
        'accessibilityLabel={`Go to slide ${index + 1}`}'
      );
    });
  });

  describe('Styling', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should use theme colors from constants', () => {
      expect(fileContent).toContain(
        "import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme'"
      );
    });

    it('should define styles using StyleSheet.create', () => {
      expect(fileContent).toContain('StyleSheet.create');
    });

    it('should have slide styling', () => {
      expect(fileContent).toContain('styles.slide');
    });

    it('should have pagination dot styling', () => {
      expect(fileContent).toContain('styles.paginationDot');
      expect(fileContent).toContain('styles.paginationDotActive');
    });
  });

  describe('Navigation functionality', () => {
    let fileContent: string;

    beforeAll(() => {
      fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
    });

    it('should track current slide index with useState', () => {
      expect(fileContent).toContain('useState(0)');
      expect(fileContent).toContain('currentIndex');
      expect(fileContent).toContain('setCurrentIndex');
    });

    it('should detect last slide', () => {
      expect(fileContent).toContain('isLastSlide');
      expect(fileContent).toContain('SLIDES.length - 1');
    });

    it('should handle viewable items change for pagination sync', () => {
      expect(fileContent).toContain('handleViewableItemsChanged');
      expect(fileContent).toContain('onViewableItemsChanged');
    });

    it('should scroll to next slide on next button press', () => {
      expect(fileContent).toContain('handleNext');
      expect(fileContent).toContain('scrollToIndex');
    });

    it('should call onComplete on last slide next press', () => {
      expect(fileContent).toContain('isLastSlide');
      expect(fileContent).toContain('onComplete?.()');
    });

    it('should call onSkip when skip button is pressed', () => {
      expect(fileContent).toContain('handleSkip');
      expect(fileContent).toContain('onSkip?.()');
    });
  });
});

describe('OnboardingScreen TypeScript types', () => {
  let fileContent: string;

  beforeAll(() => {
    fileContent = fs.readFileSync(ONBOARDING_SCREEN_PATH, 'utf-8');
  });

  it('should define OnboardingSlide interface', () => {
    expect(fileContent).toContain('interface OnboardingSlide');
    expect(fileContent).toContain('id: string');
    expect(fileContent).toContain('icon: string');
    expect(fileContent).toContain('title: string');
    expect(fileContent).toContain('description: string');
    expect(fileContent).toContain('backgroundColor: string');
  });

  it('should have proper return type', () => {
    expect(fileContent).toContain('React.JSX.Element');
  });

  it('should use FlatList ref with correct type', () => {
    expect(fileContent).toContain('useRef<FlatList<OnboardingSlide>>');
  });
});
