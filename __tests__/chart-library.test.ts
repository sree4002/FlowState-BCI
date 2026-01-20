/**
 * Chart Library Installation Tests
 *
 * Verifies that victory-native chart library is properly installed and configured.
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

    test('should have victory-native in dependencies', () => {
      const dependencies = packageJson.dependencies as Record<string, string>;
      expect(dependencies).toBeDefined();
      expect(dependencies['victory-native']).toBeDefined();
      expect(typeof dependencies['victory-native']).toBe('string');
    });

    test('should have a valid version for victory-native', () => {
      const dependencies = packageJson.dependencies as Record<string, string>;
      const version = dependencies['victory-native'];
      // Should be a semver-compatible version string
      expect(version).toMatch(/^[\^~]?\d+\.\d+\.\d+/);
    });
  });

  describe('node_modules', () => {
    test('victory-native should be installed in node_modules', () => {
      const victoryNativePath = resolve(
        __dirname,
        '../node_modules/victory-native'
      );
      expect(existsSync(victoryNativePath)).toBe(true);
    });

    test('victory-native package.json should exist', () => {
      const packageJsonPath = resolve(
        __dirname,
        '../node_modules/victory-native/package.json'
      );
      expect(existsSync(packageJsonPath)).toBe(true);
    });

    test('victory-native should have a valid package.json', () => {
      const packageJsonPath = resolve(
        __dirname,
        '../node_modules/victory-native/package.json'
      );
      const packageContent = readFileSync(packageJsonPath, 'utf-8');
      const packageJson = JSON.parse(packageContent);
      expect(packageJson.name).toBe('victory-native');
      expect(packageJson.version).toBeDefined();
    });

    test('victory-native should be resolvable', () => {
      expect(() => {
        require.resolve('victory-native');
      }).not.toThrow();
    });

    test('victory-native dist folder should exist', () => {
      const distPath = resolve(
        __dirname,
        '../node_modules/victory-native/dist'
      );
      expect(existsSync(distPath)).toBe(true);
    });

    test('victory-native should have index file', () => {
      const indexPath = resolve(
        __dirname,
        '../node_modules/victory-native/dist/index.js'
      );
      expect(existsSync(indexPath)).toBe(true);
    });
  });

  describe('Chart Library Purpose', () => {
    test('victory-native is installed for charting needs', () => {
      // This test documents the purpose of victory-native in the project
      // Victory Native provides chart components for:
      // - ThetaTrendWidget with sparkline charts
      // - ThetaTimeSeriesChart with scrolling line charts
      // - ThetaGaugeDisplay with circular gauge charts
      // - CircadianPatternChart showing theta by time of day
      // - SessionFrequencyChart with bar charts
      // - And other visualization needs throughout the app

      const packageJsonPath = resolve(
        __dirname,
        '../node_modules/victory-native/package.json'
      );
      expect(existsSync(packageJsonPath)).toBe(true);
    });
  });
});
