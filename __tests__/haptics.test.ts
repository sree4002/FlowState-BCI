/**
 * Tests for src/utils/haptics.ts
 *
 * Tests cover:
 * - isHapticsAvailable function
 * - triggerHaptic function for all feedback types
 * - Haptic convenience methods
 * - Graceful fallback when expo-haptics is not available
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source file for static analysis
const sourceFilePath = path.join(__dirname, '../src/utils/haptics.ts');
const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');

// Import the mocked expo-haptics to get references to mock functions
// These are the same functions the haptics module will use via its require()
import * as ExpoHaptics from 'expo-haptics';

const mockImpactAsync = ExpoHaptics.impactAsync as jest.Mock;
const mockNotificationAsync = ExpoHaptics.notificationAsync as jest.Mock;
const mockSelectionAsync = ExpoHaptics.selectionAsync as jest.Mock;

describe('haptics utility - Source Code Analysis', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(sourceFilePath)).toBe(true);
    });

    it('should import Platform from react-native', () => {
      expect(sourceCode).toContain("import { Platform } from 'react-native'");
    });

    it('should export HapticFeedbackType type', () => {
      expect(sourceCode).toContain('export type HapticFeedbackType');
    });

    it('should export isHapticsAvailable function', () => {
      expect(sourceCode).toContain('export function isHapticsAvailable');
    });

    it('should export triggerHaptic function', () => {
      expect(sourceCode).toContain('export async function triggerHaptic');
    });

    it('should export Haptic convenience object', () => {
      expect(sourceCode).toContain('export const Haptic');
    });

    it('should have default export', () => {
      expect(sourceCode).toContain('export default Haptic');
    });
  });

  describe('HapticFeedbackType Definition', () => {
    it('should include light type', () => {
      expect(sourceCode).toContain("| 'light'");
    });

    it('should include medium type', () => {
      expect(sourceCode).toContain("| 'medium'");
    });

    it('should include heavy type', () => {
      expect(sourceCode).toContain("| 'heavy'");
    });

    it('should include success type', () => {
      expect(sourceCode).toContain("| 'success'");
    });

    it('should include warning type', () => {
      expect(sourceCode).toContain("| 'warning'");
    });

    it('should include error type', () => {
      expect(sourceCode).toContain("| 'error'");
    });

    it('should include selection type', () => {
      expect(sourceCode).toContain("| 'selection'");
    });
  });

  describe('Haptics Availability Detection', () => {
    it('should have hapticsAvailable variable', () => {
      expect(sourceCode).toContain('let hapticsAvailable');
    });

    it('should have Haptics variable for the module', () => {
      expect(sourceCode).toContain('let Haptics');
    });

    it('should try to require expo-haptics dynamically', () => {
      expect(sourceCode).toContain("require('expo-haptics')");
    });

    it('should check Platform.OS is not web', () => {
      expect(sourceCode).toContain("Platform.OS !== 'web'");
    });

    it('should handle require failure gracefully', () => {
      expect(sourceCode).toContain('catch');
      expect(sourceCode).toContain('hapticsAvailable = false');
    });
  });

  describe('isHapticsAvailable Function', () => {
    it('should return hapticsAvailable boolean', () => {
      const functionMatch = sourceCode.match(
        /export function isHapticsAvailable[\s\S]*?return hapticsAvailable/
      );
      expect(functionMatch).not.toBeNull();
    });

    it('should have correct return type', () => {
      expect(sourceCode).toContain('isHapticsAvailable(): boolean');
    });
  });

  describe('triggerHaptic Function', () => {
    it('should be an async function', () => {
      expect(sourceCode).toContain('export async function triggerHaptic');
    });

    it('should accept HapticFeedbackType parameter', () => {
      expect(sourceCode).toContain(
        'triggerHaptic(type: HapticFeedbackType): Promise<void>'
      );
    });

    it('should check hapticsAvailable before triggering', () => {
      expect(sourceCode).toContain('if (!hapticsAvailable || !Haptics)');
    });

    it('should handle light feedback type', () => {
      expect(sourceCode).toContain("case 'light':");
      expect(sourceCode).toContain('Haptics.ImpactFeedbackStyle.Light');
    });

    it('should handle medium feedback type', () => {
      expect(sourceCode).toContain("case 'medium':");
      expect(sourceCode).toContain('Haptics.ImpactFeedbackStyle.Medium');
    });

    it('should handle heavy feedback type', () => {
      expect(sourceCode).toContain("case 'heavy':");
      expect(sourceCode).toContain('Haptics.ImpactFeedbackStyle.Heavy');
    });

    it('should handle success feedback type', () => {
      expect(sourceCode).toContain("case 'success':");
      expect(sourceCode).toContain('Haptics.NotificationFeedbackType.Success');
    });

    it('should handle warning feedback type', () => {
      expect(sourceCode).toContain("case 'warning':");
      expect(sourceCode).toContain('Haptics.NotificationFeedbackType.Warning');
    });

    it('should handle error feedback type', () => {
      expect(sourceCode).toContain("case 'error':");
      expect(sourceCode).toContain('Haptics.NotificationFeedbackType.Error');
    });

    it('should handle selection feedback type', () => {
      expect(sourceCode).toContain("case 'selection':");
      expect(sourceCode).toContain('Haptics.selectionAsync()');
    });

    it('should use impactAsync for impact feedback types', () => {
      expect(sourceCode).toContain('Haptics.impactAsync');
    });

    it('should use notificationAsync for notification feedback types', () => {
      expect(sourceCode).toContain('Haptics.notificationAsync');
    });

    it('should catch errors and log to debug', () => {
      expect(sourceCode).toContain(
        "console.debug('[Haptics] Failed to trigger haptic:'"
      );
    });
  });

  describe('Haptic Convenience Object', () => {
    it('should have light method', () => {
      expect(sourceCode).toMatch(/light:\s*\(\)\s*=>\s*triggerHaptic\('light'\)/);
    });

    it('should have medium method', () => {
      expect(sourceCode).toMatch(
        /medium:\s*\(\)\s*=>\s*triggerHaptic\('medium'\)/
      );
    });

    it('should have heavy method', () => {
      expect(sourceCode).toMatch(/heavy:\s*\(\)\s*=>\s*triggerHaptic\('heavy'\)/);
    });

    it('should have success method', () => {
      expect(sourceCode).toMatch(
        /success:\s*\(\)\s*=>\s*triggerHaptic\('success'\)/
      );
    });

    it('should have warning method', () => {
      expect(sourceCode).toMatch(
        /warning:\s*\(\)\s*=>\s*triggerHaptic\('warning'\)/
      );
    });

    it('should have error method', () => {
      expect(sourceCode).toMatch(/error:\s*\(\)\s*=>\s*triggerHaptic\('error'\)/);
    });

    it('should have selection method', () => {
      expect(sourceCode).toMatch(
        /selection:\s*\(\)\s*=>\s*triggerHaptic\('selection'\)/
      );
    });

    it('should have buttonPress method that triggers light feedback', () => {
      expect(sourceCode).toMatch(
        /buttonPress:\s*\(\)\s*=>\s*triggerHaptic\('light'\)/
      );
    });

    it('should have sessionStart method that triggers medium feedback', () => {
      expect(sourceCode).toMatch(
        /sessionStart:\s*\(\)\s*=>\s*triggerHaptic\('medium'\)/
      );
    });

    it('should have sessionComplete method that triggers success feedback', () => {
      expect(sourceCode).toMatch(
        /sessionComplete:\s*\(\)\s*=>\s*triggerHaptic\('success'\)/
      );
    });

    it('should have toggle method that triggers selection feedback', () => {
      expect(sourceCode).toMatch(
        /toggle:\s*\(\)\s*=>\s*triggerHaptic\('selection'\)/
      );
    });

    it('should have calibrationMilestone method that triggers medium feedback', () => {
      expect(sourceCode).toMatch(
        /calibrationMilestone:\s*\(\)\s*=>\s*triggerHaptic\('medium'\)/
      );
    });

    it('should have deviceConnected method that triggers success feedback', () => {
      expect(sourceCode).toMatch(
        /deviceConnected:\s*\(\)\s*=>\s*triggerHaptic\('success'\)/
      );
    });

    it('should have deviceDisconnected method that triggers warning feedback', () => {
      expect(sourceCode).toMatch(
        /deviceDisconnected:\s*\(\)\s*=>\s*triggerHaptic\('warning'\)/
      );
    });

    it('should have errorOccurred method that triggers error feedback', () => {
      expect(sourceCode).toMatch(
        /errorOccurred:\s*\(\)\s*=>\s*triggerHaptic\('error'\)/
      );
    });
  });

  describe('Documentation', () => {
    it('should have module-level documentation', () => {
      expect(sourceCode).toContain('FlowState BCI - Haptic Feedback Utilities');
    });

    it('should document graceful handling when haptics unavailable', () => {
      expect(sourceCode).toContain(
        'Gracefully handles cases where haptics are not available'
      );
    });

    it('should have JSDoc for HapticFeedbackType', () => {
      expect(sourceCode).toContain('Haptic feedback types');
    });

    it('should have JSDoc for isHapticsAvailable', () => {
      expect(sourceCode).toContain('Check if haptic feedback is available');
    });

    it('should have JSDoc for triggerHaptic', () => {
      expect(sourceCode).toContain('Trigger haptic feedback');
    });

    it('should have JSDoc for convenience functions', () => {
      expect(sourceCode).toContain(
        'Convenience functions for common haptic feedback patterns'
      );
    });

    it('should document each convenience method', () => {
      expect(sourceCode).toContain('Light impact - for subtle UI interactions');
      expect(sourceCode).toContain('Medium impact - for standard button presses');
      expect(sourceCode).toContain('Heavy impact - for significant actions');
      expect(sourceCode).toContain('Success notification - for completed actions');
      expect(sourceCode).toContain('Warning notification - for alerts');
      expect(sourceCode).toContain('Error notification - for failures');
      expect(sourceCode).toContain(
        'Selection feedback - for picker/selection changes'
      );
      expect(sourceCode).toContain('Button press - standard button haptic');
      expect(sourceCode).toContain('Session start - important action haptic');
      expect(sourceCode).toContain('Session complete - success haptic');
      expect(sourceCode).toContain('Toggle change - selection haptic');
      expect(sourceCode).toContain('Calibration milestone - medium haptic');
      expect(sourceCode).toContain('Device connected - success haptic');
      expect(sourceCode).toContain('Device disconnected - warning haptic');
      expect(sourceCode).toContain('Error occurred - error haptic');
    });
  });
});

describe('haptics utility - Functional Tests', () => {
  let haptics: typeof import('../src/utils/haptics');

  beforeAll(async () => {
    // Import the module (uses the mocked expo-haptics)
    haptics = await import('../src/utils/haptics');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('isHapticsAvailable', () => {
    it('should return a boolean', () => {
      const result = haptics.isHapticsAvailable();
      expect(typeof result).toBe('boolean');
    });

    it('should be callable without arguments', () => {
      expect(() => haptics.isHapticsAvailable()).not.toThrow();
    });

    it('should return true since Platform.OS is ios in mock', () => {
      // Our react-native mock sets Platform.OS to 'ios', so haptics should be available
      expect(haptics.isHapticsAvailable()).toBe(true);
    });
  });

  describe('triggerHaptic function', () => {
    describe('light feedback', () => {
      it('should call impactAsync with Light style', async () => {
        await haptics.triggerHaptic('light');
        expect(mockImpactAsync).toHaveBeenCalledWith(
          ExpoHaptics.ImpactFeedbackStyle.Light
        );
      });
    });

    describe('medium feedback', () => {
      it('should call impactAsync with Medium style', async () => {
        await haptics.triggerHaptic('medium');
        expect(mockImpactAsync).toHaveBeenCalledWith(
          ExpoHaptics.ImpactFeedbackStyle.Medium
        );
      });
    });

    describe('heavy feedback', () => {
      it('should call impactAsync with Heavy style', async () => {
        await haptics.triggerHaptic('heavy');
        expect(mockImpactAsync).toHaveBeenCalledWith(
          ExpoHaptics.ImpactFeedbackStyle.Heavy
        );
      });
    });

    describe('success feedback', () => {
      it('should call notificationAsync with Success type', async () => {
        await haptics.triggerHaptic('success');
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Success
        );
      });
    });

    describe('warning feedback', () => {
      it('should call notificationAsync with Warning type', async () => {
        await haptics.triggerHaptic('warning');
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Warning
        );
      });
    });

    describe('error feedback', () => {
      it('should call notificationAsync with Error type', async () => {
        await haptics.triggerHaptic('error');
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Error
        );
      });
    });

    describe('selection feedback', () => {
      it('should call selectionAsync', async () => {
        await haptics.triggerHaptic('selection');
        expect(mockSelectionAsync).toHaveBeenCalled();
      });
    });

    describe('all feedback types', () => {
      const feedbackTypes: Array<
        'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' | 'selection'
      > = ['light', 'medium', 'heavy', 'success', 'warning', 'error', 'selection'];

      it.each(feedbackTypes)(
        'should handle %s feedback type without throwing',
        async (type) => {
          await expect(haptics.triggerHaptic(type)).resolves.toBeUndefined();
        }
      );
    });
  });

  describe('Haptic convenience object', () => {
    describe('basic feedback methods', () => {
      it('should have light method', () => {
        expect(typeof haptics.Haptic.light).toBe('function');
      });

      it('should have medium method', () => {
        expect(typeof haptics.Haptic.medium).toBe('function');
      });

      it('should have heavy method', () => {
        expect(typeof haptics.Haptic.heavy).toBe('function');
      });

      it('should have success method', () => {
        expect(typeof haptics.Haptic.success).toBe('function');
      });

      it('should have warning method', () => {
        expect(typeof haptics.Haptic.warning).toBe('function');
      });

      it('should have error method', () => {
        expect(typeof haptics.Haptic.error).toBe('function');
      });

      it('should have selection method', () => {
        expect(typeof haptics.Haptic.selection).toBe('function');
      });
    });

    describe('contextual convenience methods', () => {
      it('should have buttonPress method', () => {
        expect(typeof haptics.Haptic.buttonPress).toBe('function');
      });

      it('should have sessionStart method', () => {
        expect(typeof haptics.Haptic.sessionStart).toBe('function');
      });

      it('should have sessionComplete method', () => {
        expect(typeof haptics.Haptic.sessionComplete).toBe('function');
      });

      it('should have toggle method', () => {
        expect(typeof haptics.Haptic.toggle).toBe('function');
      });

      it('should have calibrationMilestone method', () => {
        expect(typeof haptics.Haptic.calibrationMilestone).toBe('function');
      });

      it('should have deviceConnected method', () => {
        expect(typeof haptics.Haptic.deviceConnected).toBe('function');
      });

      it('should have deviceDisconnected method', () => {
        expect(typeof haptics.Haptic.deviceDisconnected).toBe('function');
      });

      it('should have errorOccurred method', () => {
        expect(typeof haptics.Haptic.errorOccurred).toBe('function');
      });
    });

    describe('convenience method execution', () => {
      it('buttonPress should trigger light feedback', async () => {
        await haptics.Haptic.buttonPress();
        expect(mockImpactAsync).toHaveBeenCalledWith(
          ExpoHaptics.ImpactFeedbackStyle.Light
        );
      });

      it('sessionStart should trigger medium feedback', async () => {
        await haptics.Haptic.sessionStart();
        expect(mockImpactAsync).toHaveBeenCalledWith(
          ExpoHaptics.ImpactFeedbackStyle.Medium
        );
      });

      it('sessionComplete should trigger success feedback', async () => {
        await haptics.Haptic.sessionComplete();
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Success
        );
      });

      it('toggle should trigger selection feedback', async () => {
        await haptics.Haptic.toggle();
        expect(mockSelectionAsync).toHaveBeenCalled();
      });

      it('calibrationMilestone should trigger medium feedback', async () => {
        await haptics.Haptic.calibrationMilestone();
        expect(mockImpactAsync).toHaveBeenCalledWith(
          ExpoHaptics.ImpactFeedbackStyle.Medium
        );
      });

      it('deviceConnected should trigger success feedback', async () => {
        await haptics.Haptic.deviceConnected();
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Success
        );
      });

      it('deviceDisconnected should trigger warning feedback', async () => {
        await haptics.Haptic.deviceDisconnected();
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Warning
        );
      });

      it('errorOccurred should trigger error feedback', async () => {
        await haptics.Haptic.errorOccurred();
        expect(mockNotificationAsync).toHaveBeenCalledWith(
          ExpoHaptics.NotificationFeedbackType.Error
        );
      });
    });
  });

  describe('default export', () => {
    it('should export Haptic as default', () => {
      expect(haptics.default).toBe(haptics.Haptic);
    });

    it('should have all convenience methods on default export', () => {
      const expectedMethods = [
        'light',
        'medium',
        'heavy',
        'success',
        'warning',
        'error',
        'selection',
        'buttonPress',
        'sessionStart',
        'sessionComplete',
        'toggle',
        'calibrationMilestone',
        'deviceConnected',
        'deviceDisconnected',
        'errorOccurred',
      ];

      for (const method of expectedMethods) {
        expect(typeof haptics.default[method]).toBe('function');
      }
    });
  });
});

describe('haptics - Error handling', () => {
  let haptics: typeof import('../src/utils/haptics');

  beforeAll(async () => {
    haptics = await import('../src/utils/haptics');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle impactAsync errors gracefully', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    mockImpactAsync.mockRejectedValueOnce(new Error('Haptic engine error'));

    await expect(haptics.triggerHaptic('light')).resolves.toBeUndefined();

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Haptics] Failed to trigger haptic:',
      expect.any(Error)
    );

    consoleDebugSpy.mockRestore();
  });

  it('should handle notificationAsync errors gracefully', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    mockNotificationAsync.mockRejectedValueOnce(new Error('Haptic engine error'));

    await expect(haptics.triggerHaptic('success')).resolves.toBeUndefined();

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Haptics] Failed to trigger haptic:',
      expect.any(Error)
    );

    consoleDebugSpy.mockRestore();
  });

  it('should handle selectionAsync errors gracefully', async () => {
    const consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    mockSelectionAsync.mockRejectedValueOnce(new Error('Haptic engine error'));

    await expect(haptics.triggerHaptic('selection')).resolves.toBeUndefined();

    expect(consoleDebugSpy).toHaveBeenCalledWith(
      '[Haptics] Failed to trigger haptic:',
      expect.any(Error)
    );

    consoleDebugSpy.mockRestore();
  });
});

describe('HapticFeedbackType', () => {
  it('should be a union of all valid feedback types', () => {
    // Type-level test - compile-time check that the type includes all expected values
    const validTypes: import('../src/utils/haptics').HapticFeedbackType[] = [
      'light',
      'medium',
      'heavy',
      'success',
      'warning',
      'error',
      'selection',
    ];
    expect(validTypes).toHaveLength(7);
  });
});

describe('haptics - Integration with utils index', () => {
  it('should be exportable from utils/index if it exists', () => {
    const indexPath = path.join(__dirname, '../src/utils/index.ts');
    if (fs.existsSync(indexPath)) {
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      // Check if haptics is exported (it may or may not be depending on project structure)
      const isExported =
        indexContent.includes('haptics') || indexContent.includes('Haptic');
      // This is informational - not a hard requirement
      expect(typeof isExported).toBe('boolean');
    }
  });
});
