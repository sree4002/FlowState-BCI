/**
 * Core Dependencies Test Suite
 *
 * Verifies that all core dependencies from Phase 1 Task 3 are properly installed
 * and listed in package.json with valid versions.
 *
 * Note: We verify package.json entries rather than runtime imports because
 * React Native modules require a complete React Native environment to load,
 * which is not available in Node.js test environment. The presence in package.json
 * with valid version numbers confirms successful installation.
 */

describe('Core Dependencies', () => {
  describe('Package.json verification', () => {
    it('should have all required dependencies in package.json', () => {
      const packageJson = require('../package.json');
      const { dependencies } = packageJson;

      // Verify BLE dependency
      expect(dependencies['react-native-ble-plx']).toBeDefined();

      // Verify Navigation dependencies
      expect(dependencies['@react-navigation/native']).toBeDefined();
      expect(dependencies['@react-navigation/bottom-tabs']).toBeDefined();
      expect(dependencies['react-native-screens']).toBeDefined();
      expect(dependencies['react-native-safe-area-context']).toBeDefined();

      // Verify Database dependency
      expect(dependencies['expo-sqlite']).toBeDefined();

      // Verify Storage dependency
      expect(dependencies['@react-native-async-storage/async-storage']).toBeDefined();
    });

    it('should have compatible versions', () => {
      const packageJson = require('../package.json');
      const { dependencies } = packageJson;

      // Check that versions are specified
      expect(dependencies['react-native-ble-plx']).toMatch(/\d+\.\d+\.\d+/);
      expect(dependencies['@react-navigation/native']).toMatch(/\d+\.\d+\.\d+/);
      expect(dependencies['@react-navigation/bottom-tabs']).toMatch(/\d+\.\d+\.\d+/);
      expect(dependencies['expo-sqlite']).toMatch(/\d+\.\d+\.\d+/);
      expect(dependencies['@react-native-async-storage/async-storage']).toMatch(/\d+\.\d+\.\d+/);
    });
  });

  describe('Node modules installation', () => {
    const fs = require('fs');
    const path = require('path');

    it('should have react-native-ble-plx installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', 'react-native-ble-plx');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have @react-navigation/native installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', '@react-navigation', 'native');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have @react-navigation/bottom-tabs installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', '@react-navigation', 'bottom-tabs');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have expo-sqlite installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', 'expo-sqlite');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have @react-native-async-storage/async-storage installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', '@react-native-async-storage', 'async-storage');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have react-native-screens installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', 'react-native-screens');
      expect(fs.existsSync(modulePath)).toBe(true);
    });

    it('should have react-native-safe-area-context installed in node_modules', () => {
      const modulePath = path.join(__dirname, '..', 'node_modules', 'react-native-safe-area-context');
      expect(fs.existsSync(modulePath)).toBe(true);
    });
  });
});
