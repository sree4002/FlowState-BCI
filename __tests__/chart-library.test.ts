/**
 * Chart Library Installation Tests
 *
 * Verifies that react-native-chart-kit chart library is properly installed and configured.
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

describe('Chart Library Installation', () => {
  describe('package.json', () => {
    let packageJson: Record<string, unknown>;

    beforeAll(() => {
      const packagePath = resolve(__dirname, '../package.json');
      const packageContent = readFileSync(packagePath, 'utf-8');
      packageJson = JSON.parse(packageContent);
    });

    test('should have react-native-chart-kit in dependencies', () => {
      const dependencies = packageJson.dependencies as Record<string, string>;
      expect(dependencies).toBeDefined();
      expect(dependencies['react-native-chart-kit']).toBeDefined();
      expect(typeof dependencies['react-native-chart-kit']).toBe('string');
    });

    test('should have a valid version for react-native-chart-kit', () => {
      const dependencies = packageJson.dependencies as Record<string, string>;
      const version = dependencies['react-native-chart-kit'];
      // Should be a semver-compatible version string
      expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
    });

    test('should have react-native-svg in dependencies', () => {
      const dependencies = packageJson.dependencies as Record<string, string>;
      expect(dependencies).toBeDefined();
      expect(dependencies['react-native-svg']).toBeDefined();
      expect(typeof dependencies['react-native-svg']).toBe('string');
    });
  });

  describe('node_modules', () => {
    test('react-native-chart-kit should be installed in node_modules', () => {
      const chartKitPath = resolve(
        __dirname,
        '../node_modules/react-native-chart-kit'
      );
      expect(existsSync(chartKitPath)).toBe(true);
    });

    test('react-native-chart-kit package.json should exist', () => {
      const packageJsonPath = resolve(
        __dirname,
        '../node_modules/react-native-chart-kit/package.json'
      );
      expect(existsSync(packageJsonPath)).toBe(true);
    });

    test('react-native-chart-kit should have a valid package.json', () => {
      const packageJsonPath = resolve(
        __dirname,
        '../node_modules/react-native-chart-kit/package.json'
      );
      const packageContent = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      expect(packageJson.name).toBe('react-native-chart-kit');
      expect(packageJson.version).toBeDefined();
    });

    test('react-native-chart-kit should be resolvable', () => {
      expect(() => {
        require.resolve('react-native-chart-kit');
      }).not.toThrow();
    });

    test('react-native-svg should be installed in node_modules', () => {
      const svgPath = resolve(
        __dirname,
        '../node_modules/react-native-svg'
      );
      expect(existsSync(svgPath)).toBe(true);
    });
  });

  describe('Chart Library Purpose', () => {
    test('react-native-chart-kit is installed for charting needs', () => {
      // This test documents the purpose of react-native-chart-kit in the project
      // react-native-chart-kit provides chart components for:
      // - ThetaTrendWidget with sparkline charts
      // - ThetaTimeSeriesChart with scrolling line charts
      // - And other visualization needs throughout the app

      const packageJsonPath = resolve(
        __dirname,
        '../node_modules/react-native-chart-kit/package.json'
      );
      expect(existsSync(packageJsonPath)).toBe(true);
    });
  });
});
