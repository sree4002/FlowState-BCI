/**
 * Navigation setup tests for FlowState BCI
 * Verifies that React Navigation is properly configured with bottom tabs
 */

import fs from 'fs';
import path from 'path';

describe('React Navigation Setup', () => {
  const appSrcPath = path.join(__dirname, '..', 'App', 'src');
  const appPath = path.join(__dirname, '..', 'App');

  describe('Navigation Directory Structure', () => {
    it('should have App/src/navigation directory', () => {
      const navPath = path.join(appSrcPath, 'navigation');
      expect(fs.existsSync(navPath)).toBe(true);
      expect(fs.statSync(navPath).isDirectory()).toBe(true);
    });

    it('should have navigation types file', () => {
      const typesPath = path.join(appSrcPath, 'navigation', 'types.ts');
      expect(fs.existsSync(typesPath)).toBe(true);
    });

    it('should have navigation index file', () => {
      const indexPath = path.join(appSrcPath, 'navigation', 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });
  });

  describe('Screen Components', () => {
    const requiredScreens = [
      'DashboardScreen',
      'SessionScreen',
      'HistoryScreen',
      'SettingsScreen',
    ];

    it('should have App/src/screens directory', () => {
      const screensPath = path.join(appSrcPath, 'screens');
      expect(fs.existsSync(screensPath)).toBe(true);
      expect(fs.statSync(screensPath).isDirectory()).toBe(true);
    });

    requiredScreens.forEach((screen) => {
      it(`should have ${screen}.tsx file`, () => {
        const screenPath = path.join(appSrcPath, 'screens', `${screen}.tsx`);
        expect(fs.existsSync(screenPath)).toBe(true);
      });
    });

    it('should have screens index file', () => {
      const indexPath = path.join(appSrcPath, 'screens', 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });
  });

  describe('Navigation Types', () => {
    it('should export RootTabParamList type', () => {
      const typesContent = fs.readFileSync(
        path.join(appSrcPath, 'navigation', 'types.ts'),
        'utf-8'
      );
      expect(typesContent).toContain('RootTabParamList');
      expect(typesContent).toContain('Dashboard');
      expect(typesContent).toContain('Session');
      expect(typesContent).toContain('History');
      expect(typesContent).toContain('Settings');
    });

    it('should define screen props types', () => {
      const typesContent = fs.readFileSync(
        path.join(appSrcPath, 'navigation', 'types.ts'),
        'utf-8'
      );
      expect(typesContent).toContain('DashboardScreenProps');
      expect(typesContent).toContain('SessionScreenProps');
      expect(typesContent).toContain('HistoryScreenProps');
      expect(typesContent).toContain('SettingsScreenProps');
    });
  });

  describe('App.tsx Configuration', () => {
    it('should import all required screens', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain("import DashboardScreen from './src/screens/DashboardScreen'");
      expect(appContent).toContain("import SessionScreen from './src/screens/SessionScreen'");
      expect(appContent).toContain("import HistoryScreen from './src/screens/HistoryScreen'");
      expect(appContent).toContain("import SettingsScreen from './src/screens/SettingsScreen'");
    });

    it('should use createBottomTabNavigator', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('createBottomTabNavigator');
      expect(appContent).toContain('Tab.Navigator');
      expect(appContent).toContain('Tab.Screen');
    });

    it('should configure all four tab screens', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('name="Dashboard"');
      expect(appContent).toContain('name="Session"');
      expect(appContent).toContain('name="History"');
      expect(appContent).toContain('name="Settings"');
    });

    it('should use typed navigator with RootTabParamList', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('RootTabParamList');
      expect(appContent).toContain('createBottomTabNavigator<RootTabParamList>');
    });

    it('should use NavigationContainer', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('NavigationContainer');
    });

    it('should configure dark theme', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('DarkTheme');
      expect(appContent).toContain('theme=');
    });

    it('should configure tab bar styling', () => {
      const appContent = fs.readFileSync(
        path.join(appPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('tabBarStyle');
      expect(appContent).toContain('tabBarActiveTintColor');
      expect(appContent).toContain('tabBarInactiveTintColor');
    });
  });

  describe('Supporting Files', () => {
    it('should have AppContext', () => {
      const contextPath = path.join(appSrcPath, 'context', 'AppContext.tsx');
      expect(fs.existsSync(contextPath)).toBe(true);
    });

    it('should have BleService', () => {
      const servicePath = path.join(appSrcPath, 'services', 'BleService.ts');
      expect(fs.existsSync(servicePath)).toBe(true);
    });
  });

  describe('Package Dependencies', () => {
    it('should have @react-navigation/native installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies['@react-navigation/native']).toBeDefined();
    });

    it('should have @react-navigation/bottom-tabs installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies['@react-navigation/bottom-tabs']).toBeDefined();
    });

    it('should have react-native-screens installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies['react-native-screens']).toBeDefined();
    });

    it('should have react-native-safe-area-context installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies['react-native-safe-area-context']).toBeDefined();
    });
  });
});
