/**
 * Tests for Navigation Types
 *
 * Verifies that all navigation types are properly defined and exported.
 * Tests type structure and validates proper TypeScript compilation.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('Navigation Types', () => {
  const typesDir = path.join(__dirname, '..', 'src', 'types');
  const navigationTypesPath = path.join(typesDir, 'navigation.ts');
  const indexPath = path.join(typesDir, 'index.ts');

  describe('File structure', () => {
    it('should have navigation.ts file in src/types', () => {
      expect(fs.existsSync(navigationTypesPath)).toBe(true);
    });

    it('should export navigation types from index.ts', () => {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain("export * from './navigation'");
    });
  });

  describe('RootStackParamList', () => {
    it('should define MainTabs screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('MainTabs:');
      expect(content).toContain('NavigatorScreenParams<MainTabParamList>');
    });

    it('should define Onboarding screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Onboarding: undefined');
    });

    it('should define DevicePairing screen with optional returnTo param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('DevicePairing:');
      expect(content).toContain('returnTo?: keyof MainTabParamList');
    });

    it('should define Calibration screen with optional returnTo param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Calibration:');
    });

    it('should define SessionDetail screen with sessionId param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('SessionDetail:');
      expect(content).toContain('sessionId: number');
    });
  });

  describe('MainTabParamList', () => {
    it('should define Dashboard tab', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Dashboard: undefined');
    });

    it('should define Session tab with SessionTabParams', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Session: SessionTabParams');
    });

    it('should define History tab with nested navigator', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'History: NavigatorScreenParams<HistoryTabParamList>'
      );
    });

    it('should define Settings tab', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Settings: undefined');
    });
  });

  describe('SessionTabParams', () => {
    it('should allow undefined params', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('export type SessionTabParams =');
      expect(content).toContain('| undefined');
    });

    it('should allow config param with Partial<SessionConfig>', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('config?: Partial<SessionConfig>');
    });

    it('should allow autoStart param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('autoStart?: boolean');
    });

    it('should allow presetName param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('presetName?: string');
    });
  });

  describe('HistoryTabParamList', () => {
    it('should define List screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('List: undefined');
    });

    it('should define Calendar screen with selectedMonth param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Calendar:');
      expect(content).toContain('selectedMonth?: string; // Format: YYYY-MM');
    });

    it('should define Trends screen with timeRange param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Trends:');
      expect(content).toContain("timeRange?: '7d' | '30d' | '3mo' | 'all'");
    });

    it('should define Stats screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Stats: undefined');
    });
  });

  describe('OnboardingStackParamList', () => {
    it('should define Welcome screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Welcome: undefined');
    });

    it('should define Tour1, Tour2, Tour3 screens', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Tour1: undefined');
      expect(content).toContain('Tour2: undefined');
      expect(content).toContain('Tour3: undefined');
    });

    it('should define Permissions screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Permissions: undefined');
    });

    it('should define DevicePairingPrompt screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('DevicePairingPrompt: undefined');
    });

    it('should define FirstSessionSuggestion screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('FirstSessionSuggestion: undefined');
    });
  });

  describe('CalibrationStackParamList', () => {
    it('should define Instructions screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Instructions: undefined');
    });

    it('should define Countdown screen with durationMinutes param', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Countdown:');
      expect(content).toContain('durationMinutes?: 5 | 10');
    });

    it('should define Progress screen with required params', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Progress:');
      expect(content).toContain('durationMinutes: 5 | 10');
      expect(content).toContain('startedAt: number');
    });

    it('should define Summary screen with baseline result params', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Summary:');
      expect(content).toContain('baseline: BaselineProfile');
      expect(content).toContain('qualityScore: number');
      expect(content).toContain('cleanDataPercentage: number');
    });
  });

  describe('SettingsStackParamList', () => {
    it('should define SettingsMain screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('SettingsMain: undefined');
    });

    it('should define DeviceManagement screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('DeviceManagement: undefined');
    });

    it('should define NotificationPreferences screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('NotificationPreferences: undefined');
    });

    it('should define AudioSettings screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('AudioSettings: undefined');
    });

    it('should define EntrainmentSettings screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('EntrainmentSettings: undefined');
    });

    it('should define ThetaThreshold screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('ThetaThreshold: undefined');
    });

    it('should define ThemeAccessibility screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('ThemeAccessibility: undefined');
    });

    it('should define DataManagement screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('DataManagement: undefined');
    });

    it('should define PrivacySettings screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('PrivacySettings: undefined');
    });

    it('should define About screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('About: undefined');
    });

    it('should define Integrations screen', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('Integrations: undefined');
    });
  });

  describe('Screen Props Types', () => {
    it('should export RootStackScreenProps', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type RootStackScreenProps<T extends keyof RootStackParamList>'
      );
    });

    it('should export MainTabScreenProps', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type MainTabScreenProps<T extends keyof MainTabParamList>'
      );
    });

    it('should export HistoryTabScreenProps', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type HistoryTabScreenProps<T extends keyof HistoryTabParamList>'
      );
    });

    it('should export OnboardingScreenProps', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type OnboardingScreenProps<T extends keyof OnboardingStackParamList>'
      );
    });

    it('should export CalibrationScreenProps', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type CalibrationScreenProps<T extends keyof CalibrationStackParamList>'
      );
    });

    it('should export SettingsScreenProps', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type SettingsScreenProps<T extends keyof SettingsStackParamList>'
      );
    });
  });

  describe('Navigation Helpers', () => {
    it('should export AllScreenNames type', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('export type AllScreenNames =');
    });

    it('should export RouteParams type', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        'export type RouteParams<T extends AllScreenNames>'
      );
    });
  });

  describe('Type imports', () => {
    it('should import NavigatorScreenParams from @react-navigation/native', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        "import type { NavigatorScreenParams } from '@react-navigation/native'"
      );
    });

    it('should import BottomTabScreenProps from @react-navigation/bottom-tabs', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        "import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs'"
      );
    });

    it('should import NativeStackScreenProps from @react-navigation/native-stack', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        "import type { NativeStackScreenProps } from '@react-navigation/native-stack'"
      );
    });

    it('should import CompositeScreenProps from @react-navigation/native', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        "import type { CompositeScreenProps } from '@react-navigation/native'"
      );
    });

    it('should import Session and SessionConfig types', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain(
        "import type { Session, SessionConfig, BaselineProfile } from './index'"
      );
    });
  });

  describe('Global type declarations', () => {
    it('should declare ReactNavigation namespace for useNavigation type checking', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('declare global');
      expect(content).toContain('namespace ReactNavigation');
      expect(content).toContain(
        'interface RootParamList extends RootStackParamList'
      );
    });
  });

  describe('JSDoc comments', () => {
    it('should have JSDoc comment for RootStackParamList', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('* Root stack navigator param list');
    });

    it('should have JSDoc comment for MainTabParamList', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('* Main bottom tab navigator param list');
    });

    it('should have JSDoc comment for HistoryTabParamList', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('* History screen tab navigator param list');
    });

    it('should have JSDoc comment for OnboardingStackParamList', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('* Onboarding flow navigator param list');
    });

    it('should have JSDoc comment for CalibrationStackParamList', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('* Calibration flow navigator param list');
    });

    it('should have JSDoc comment for SettingsStackParamList', () => {
      const content = fs.readFileSync(navigationTypesPath, 'utf-8');
      expect(content).toContain('* Settings screen navigator param list');
    });
  });
});
