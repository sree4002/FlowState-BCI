/**
 * Navigation setup tests for FlowState BCI
 * Verifies that React Navigation is properly configured with bottom tabs
 */

import fs from 'fs';
import path from 'path';

describe('React Navigation Setup', () => {
  const srcPath = path.join(__dirname, '..', 'src');
  const rootPath = path.join(__dirname, '..');

  describe('Screen Components', () => {
    it('should have src/screens directory', () => {
      const screensPath = path.join(srcPath, 'screens');
      expect(fs.existsSync(screensPath)).toBe(true);
      expect(fs.statSync(screensPath).isDirectory()).toBe(true);
    });

    it('should have DashboardScreen.tsx', () => {
      const screenPath = path.join(srcPath, 'screens', 'DashboardScreen.tsx');
      expect(fs.existsSync(screenPath)).toBe(true);
    });

    it('should have ActiveSessionScreen.tsx', () => {
      const screenPath = path.join(
        srcPath,
        'screens',
        'ActiveSessionScreen.tsx'
      );
      expect(fs.existsSync(screenPath)).toBe(true);
    });

    it('should have SettingsScreen.tsx', () => {
      const screenPath = path.join(srcPath, 'screens', 'SettingsScreen.tsx');
      expect(fs.existsSync(screenPath)).toBe(true);
    });

    it('should have screens index file', () => {
      const indexPath = path.join(srcPath, 'screens', 'index.ts');
      expect(fs.existsSync(indexPath)).toBe(true);
    });
  });

  describe('Screen Exports', () => {
    it('should export DashboardScreen from index', () => {
      const indexContent = fs.readFileSync(
        path.join(srcPath, 'screens', 'index.ts'),
        'utf-8'
      );
      expect(indexContent).toContain('DashboardScreen');
    });

    it('should export ActiveSessionScreen from index', () => {
      const indexContent = fs.readFileSync(
        path.join(srcPath, 'screens', 'index.ts'),
        'utf-8'
      );
      expect(indexContent).toContain('ActiveSessionScreen');
    });

    it('should export SettingsScreen from index', () => {
      const indexContent = fs.readFileSync(
        path.join(srcPath, 'screens', 'index.ts'),
        'utf-8'
      );
      expect(indexContent).toContain('SettingsScreen');
    });
  });

  describe('App.tsx Configuration', () => {
    it('should exist in root directory', () => {
      const appPath = path.join(rootPath, 'App.tsx');
      expect(fs.existsSync(appPath)).toBe(true);
    });

    it('should use createBottomTabNavigator', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('createBottomTabNavigator');
      expect(appContent).toContain('Tab.Navigator');
      expect(appContent).toContain('Tab.Screen');
    });

    it('should configure all four tab screens', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('name="Dashboard"');
      expect(appContent).toContain('name="Session"');
      expect(appContent).toContain('name="History"');
      expect(appContent).toContain('name="Settings"');
    });

    it('should use NavigationContainer', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('NavigationContainer');
    });

    it('should configure dark theme', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('DarkTheme');
      expect(appContent).toContain('theme=');
    });

    it('should configure tab bar styling', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('tabBarStyle');
      expect(appContent).toContain('tabBarActiveTintColor');
      expect(appContent).toContain('tabBarInactiveTintColor');
    });

    it('should import screens from src/screens', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain("from './src/screens'");
    });

    it('should import contexts from src/contexts', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain("from './src/contexts'");
    });

    it('should wrap app in required providers', () => {
      const appContent = fs.readFileSync(
        path.join(rootPath, 'App.tsx'),
        'utf-8'
      );
      expect(appContent).toContain('SettingsProvider');
      expect(appContent).toContain('SimulatedModeProvider');
      expect(appContent).toContain('SessionProvider');
      expect(appContent).toContain('DeviceProvider');
    });
  });

  describe('Package Dependencies', () => {
    it('should have @react-navigation/native installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootPath, 'package.json'), 'utf-8')
      );
      expect(
        packageJson.dependencies['@react-navigation/native']
      ).toBeDefined();
    });

    it('should have @react-navigation/bottom-tabs installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootPath, 'package.json'), 'utf-8')
      );
      expect(
        packageJson.dependencies['@react-navigation/bottom-tabs']
      ).toBeDefined();
    });

    it('should have react-native-screens installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootPath, 'package.json'), 'utf-8')
      );
      expect(packageJson.dependencies['react-native-screens']).toBeDefined();
    });

    it('should have react-native-safe-area-context installed', () => {
      const packageJson = JSON.parse(
        fs.readFileSync(path.join(rootPath, 'package.json'), 'utf-8')
      );
      expect(
        packageJson.dependencies['react-native-safe-area-context']
      ).toBeDefined();
    });
  });
});
