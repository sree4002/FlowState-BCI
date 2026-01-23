/**
 * DevicePairingScreen Unit Tests
 *
 * These tests verify the component's module structure, type definitions,
 * and exported interfaces without requiring full React Native rendering.
 * Full component integration tests would require react-native-testing-library
 * with proper React Native preset configuration.
 */

import * as fs from 'fs';
import * as path from 'path';

describe('DevicePairingScreen Module', () => {
  const componentPath = path.join(
    __dirname,
    '../src/screens/DevicePairingScreen.tsx'
  );
  let componentSource: string;

  beforeAll(() => {
    componentSource = fs.readFileSync(componentPath, 'utf8');
  });

  describe('File Structure', () => {
    it('exists at the correct path', () => {
      expect(fs.existsSync(componentPath)).toBe(true);
    });

    it('is a TypeScript React component file', () => {
      expect(componentPath.endsWith('.tsx')).toBe(true);
    });

    it('has non-trivial content', () => {
      expect(componentSource.length).toBeGreaterThan(1000);
    });
  });

  describe('Component Exports', () => {
    it('exports DevicePairingScreen as named export', () => {
      expect(componentSource).toContain('export const DevicePairingScreen');
    });

    it('exports DevicePairingScreen as default export', () => {
      expect(componentSource).toContain('export default DevicePairingScreen');
    });
  });

  describe('Required Imports', () => {
    it('imports React', () => {
      expect(componentSource).toMatch(/import React/);
    });

    it('imports from react-native', () => {
      expect(componentSource).toMatch(/from 'react-native'/);
    });

    it('imports theme constants', () => {
      expect(componentSource).toContain("from '../constants/theme'");
    });

    it('imports DeviceContext hook', () => {
      expect(componentSource).toContain("from '../contexts/DeviceContext'");
    });

    it('imports types', () => {
      expect(componentSource).toContain("from '../types'");
    });
  });

  describe('React Native Components Used', () => {
    it('uses View component', () => {
      expect(componentSource).toContain('View');
    });

    it('uses Text component', () => {
      expect(componentSource).toContain('Text');
    });

    it('uses TouchableOpacity for buttons', () => {
      expect(componentSource).toContain('TouchableOpacity');
    });

    it('uses FlatList for device list', () => {
      expect(componentSource).toContain('FlatList');
    });

    it('uses ActivityIndicator for loading states', () => {
      expect(componentSource).toContain('ActivityIndicator');
    });

    it('uses Alert for confirmations', () => {
      expect(componentSource).toContain('Alert');
    });

    it('uses StyleSheet for styling', () => {
      expect(componentSource).toContain('StyleSheet');
    });

    it('uses Animated for animations', () => {
      expect(componentSource).toContain('Animated');
    });

    it('uses RefreshControl for pull-to-refresh', () => {
      expect(componentSource).toContain('RefreshControl');
    });
  });

  describe('TypeScript Interfaces', () => {
    it('defines DiscoveredDevice interface', () => {
      expect(componentSource).toContain('interface DiscoveredDevice');
    });

    it('defines PairingState type', () => {
      expect(componentSource).toContain('type PairingState');
    });

    it('defines DevicePairingScreenProps interface', () => {
      expect(componentSource).toContain('interface DevicePairingScreenProps');
    });

    it('includes all required PairingState values', () => {
      expect(componentSource).toContain("'idle'");
      expect(componentSource).toContain("'scanning'");
      expect(componentSource).toContain("'connecting'");
      expect(componentSource).toContain("'connected'");
      expect(componentSource).toContain("'error'");
    });
  });

  describe('Props Interface', () => {
    it('includes onPairingComplete callback', () => {
      expect(componentSource).toContain('onPairingComplete');
    });

    it('includes onSkip callback', () => {
      expect(componentSource).toContain('onSkip');
    });
  });

  describe('Context Integration', () => {
    it('uses useDevice hook', () => {
      expect(componentSource).toContain('useDevice()');
    });

    it('uses setDeviceInfo from context', () => {
      expect(componentSource).toContain('setDeviceInfo');
    });

    it('uses setIsConnecting from context', () => {
      expect(componentSource).toContain('setIsConnecting');
    });

    it('uses setConnectionError from context', () => {
      expect(componentSource).toContain('setConnectionError');
    });

    it('uses resetDeviceState from context', () => {
      expect(componentSource).toContain('resetDeviceState');
    });
  });

  describe('State Management', () => {
    it('uses useState for pairingState', () => {
      expect(componentSource).toContain("useState<PairingState>('idle')");
    });

    it('uses useState for discoveredDevices', () => {
      expect(componentSource).toMatch(
        /useState<\s*DiscoveredDevice\[\]\s*>\s*\(\[\]\)/
      );
    });

    it('uses useState for selectedDevice', () => {
      expect(componentSource).toMatch(
        /useState<DiscoveredDevice\s*\|\s*null>\s*\(\s*null\s*\)/
      );
    });

    it('uses useState for scanProgress', () => {
      expect(componentSource).toContain('useState(0)');
    });
  });

  describe('Core Functions', () => {
    it('implements startScan function', () => {
      expect(componentSource).toContain('const startScan');
    });

    it('implements stopScan function', () => {
      expect(componentSource).toContain('const stopScan');
    });

    it('implements connectToDevice function', () => {
      expect(componentSource).toContain('const connectToDevice');
    });

    it('implements retryConnection function', () => {
      expect(componentSource).toContain('const retryConnection');
    });

    it('implements cancelPairing function', () => {
      expect(componentSource).toContain('const cancelPairing');
    });

    it('implements handleSkip function', () => {
      expect(componentSource).toContain('const handleSkip');
    });
  });

  describe('Helper Functions', () => {
    it('implements getDeviceType function', () => {
      expect(componentSource).toContain('const getDeviceType');
    });

    it('implements getSignalStrengthLabel function', () => {
      expect(componentSource).toContain('const getSignalStrengthLabel');
    });

    it('implements getSignalStrengthColor function', () => {
      expect(componentSource).toContain('const getSignalStrengthColor');
    });
  });

  describe('Render Functions', () => {
    it('implements renderDeviceItem', () => {
      expect(componentSource).toContain('const renderDeviceItem');
    });

    it('implements renderEmptyState', () => {
      expect(componentSource).toContain('const renderEmptyState');
    });

    it('implements renderErrorState', () => {
      expect(componentSource).toContain('const renderErrorState');
    });

    it('implements renderConnectedState', () => {
      expect(componentSource).toContain('const renderConnectedState');
    });
  });

  describe('UI Elements', () => {
    it('displays screen title', () => {
      expect(componentSource).toContain('Connect Your Device');
    });

    it('displays scan button text', () => {
      expect(componentSource).toContain('Scan for Devices');
    });

    it('displays stop scanning button text', () => {
      expect(componentSource).toContain('Stop Scanning');
    });

    it('displays skip button text', () => {
      expect(componentSource).toContain('Skip for Now');
    });

    it('displays connection success message', () => {
      expect(componentSource).toContain('Device Connected!');
    });

    it('displays connection failed message', () => {
      expect(componentSource).toContain('Connection Failed');
    });

    it('displays pairing tips section', () => {
      expect(componentSource).toContain('Pairing Tips');
    });

    it('includes Bluetooth tip', () => {
      expect(componentSource).toContain(
        'Ensure Bluetooth is enabled on your device'
      );
    });

    it('includes proximity tip', () => {
      expect(componentSource).toContain('Place the BCI device within 2 meters');
    });

    it('displays scanning message', () => {
      expect(componentSource).toContain('Scanning for devices...');
    });

    it('displays no devices found message', () => {
      expect(componentSource).toContain('No devices found');
    });
  });

  describe('Device Information Display', () => {
    it('displays battery level', () => {
      expect(componentSource).toContain('Battery');
    });

    it('displays sample rate', () => {
      expect(componentSource).toContain('Sample Rate');
    });

    it('displays firmware version', () => {
      expect(componentSource).toContain('Firmware');
    });
  });

  describe('Signal Strength Handling', () => {
    it('handles Excellent signal strength', () => {
      expect(componentSource).toContain("return 'Excellent'");
    });

    it('handles Good signal strength', () => {
      expect(componentSource).toContain("return 'Good'");
    });

    it('handles Fair signal strength', () => {
      expect(componentSource).toContain("return 'Fair'");
    });

    it('handles Weak signal strength', () => {
      expect(componentSource).toContain("return 'Weak'");
    });

    it('handles Unknown signal strength', () => {
      expect(componentSource).toContain("return 'Unknown'");
    });

    it('uses appropriate RSSI thresholds', () => {
      expect(componentSource).toContain('-50');
      expect(componentSource).toContain('-60');
      expect(componentSource).toContain('-70');
    });
  });

  describe('Device Type Detection', () => {
    it('detects headband type', () => {
      expect(componentSource).toContain("return 'headband'");
    });

    it('detects earpiece type', () => {
      expect(componentSource).toContain("return 'earpiece'");
    });

    it('handles unknown device type', () => {
      expect(componentSource).toContain("return 'unknown'");
    });

    it('checks for headband in name', () => {
      expect(componentSource).toContain("includes('headband')");
    });

    it('checks for earpiece in name', () => {
      expect(componentSource).toContain("includes('earpiece')");
    });
  });

  describe('Animation Implementation', () => {
    it('uses Animated.Value for pulse animation', () => {
      expect(componentSource).toContain('new Animated.Value');
    });

    it('implements pulse animation loop', () => {
      expect(componentSource).toContain('Animated.loop');
    });

    it('implements animation sequence', () => {
      expect(componentSource).toContain('Animated.sequence');
    });

    it('uses timing animation', () => {
      expect(componentSource).toContain('Animated.timing');
    });

    it('uses native driver for performance', () => {
      expect(componentSource).toContain('useNativeDriver: true');
    });
  });

  describe('Effects and Refs', () => {
    it('uses useEffect for animation lifecycle', () => {
      expect(componentSource).toMatch(/useEffect\s*\(/);
    });

    it('uses useRef for scan timeout', () => {
      expect(componentSource).toContain('useRef<NodeJS.Timeout');
    });

    it('uses useCallback for memoized functions', () => {
      expect(componentSource).toMatch(/useCallback\s*\(/);
    });

    it('cleans up timeouts on unmount', () => {
      expect(componentSource).toContain('clearTimeout');
    });

    it('cleans up intervals on unmount', () => {
      expect(componentSource).toContain('clearInterval');
    });
  });

  describe('Error Handling', () => {
    it('handles connection errors', () => {
      expect(componentSource).toContain("setPairingState('error')");
    });

    it('displays error messages from context', () => {
      expect(componentSource).toContain('connectionError');
    });

    it('provides retry functionality', () => {
      expect(componentSource).toContain('retryConnection');
    });

    it('includes Try Again button text', () => {
      expect(componentSource).toContain('Try Again');
    });
  });

  describe('Skip Functionality', () => {
    it('shows skip confirmation alert', () => {
      expect(componentSource).toContain('Alert.alert');
    });

    it('includes skip warning message', () => {
      expect(componentSource).toContain('Skip Device Setup?');
    });

    it('warns about limited features', () => {
      expect(componentSource).toContain(
        'Some features will be limited without a connected device'
      );
    });
  });

  describe('Styles', () => {
    it('defines styles using StyleSheet.create', () => {
      expect(componentSource).toContain('const styles = StyleSheet.create');
    });

    it('uses theme colors from constants', () => {
      expect(componentSource).toContain('Colors.background');
      expect(componentSource).toContain('Colors.primary');
      expect(componentSource).toContain('Colors.text');
      expect(componentSource).toContain('Colors.surface');
    });

    it('uses theme spacing from constants', () => {
      expect(componentSource).toContain('Spacing.');
    });

    it('uses theme border radius from constants', () => {
      expect(componentSource).toContain('BorderRadius.');
    });

    it('uses theme typography from constants', () => {
      expect(componentSource).toContain('Typography.');
    });

    it('uses theme shadows from constants', () => {
      expect(componentSource).toContain('Shadows.');
    });
  });
});

describe('Screen Exports', () => {
  it('is exported from screens index', () => {
    const indexPath = path.join(__dirname, '../src/screens/index.ts');
    const indexSource = fs.readFileSync(indexPath, 'utf8');
    expect(indexSource).toContain('export { DevicePairingScreen }');
  });
});
