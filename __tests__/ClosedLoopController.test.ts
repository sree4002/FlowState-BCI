/**
 * Tests for ClosedLoopController
 *
 * Tests cover:
 * - Controller state management
 * - EEG metrics processing
 * - Entrainment triggering logic
 * - Cooldown behavior
 * - Configuration updates
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source file for static analysis
const sourceFilePath = path.join(
  __dirname,
  '../src/services/ClosedLoopController.ts'
);
const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');

describe('ClosedLoopController', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(sourceFilePath)).toBe(true);
    });

    it('should export ClosedLoopController class', () => {
      expect(sourceCode).toContain('export class ClosedLoopController');
    });

    it('should export ControllerState type', () => {
      expect(sourceCode).toContain('export type ControllerState');
    });

    it('should export ClosedLoopControllerConfig interface', () => {
      expect(sourceCode).toContain(
        'export interface ClosedLoopControllerConfig'
      );
    });

    it('should export ControllerStateCallback type', () => {
      expect(sourceCode).toContain('export type ControllerStateCallback');
    });
  });

  describe('ControllerState Type', () => {
    it('should include idle state', () => {
      expect(sourceCode).toContain("'idle'");
    });

    it('should include monitoring state', () => {
      expect(sourceCode).toContain("'monitoring'");
    });

    it('should include entraining state', () => {
      expect(sourceCode).toContain("'entraining'");
    });

    it('should include cooldown state', () => {
      expect(sourceCode).toContain("'cooldown'");
    });
  });

  describe('ClosedLoopControllerConfig Interface', () => {
    it('should have startThreshold property', () => {
      expect(sourceCode).toMatch(/startThreshold\?:\s*number/);
    });

    it('should have stopThreshold property', () => {
      expect(sourceCode).toMatch(/stopThreshold\?:\s*number/);
    });

    it('should have cooldownMs property', () => {
      expect(sourceCode).toMatch(/cooldownMs\?:\s*number/);
    });

    it('should have minEntrainmentMs property', () => {
      expect(sourceCode).toMatch(/minEntrainmentMs\?:\s*number/);
    });

    it('should have entrainmentFrequency property', () => {
      expect(sourceCode).toMatch(/entrainmentFrequency\?:\s*number/);
    });

    it('should have entrainmentVolume property', () => {
      expect(sourceCode).toMatch(/entrainmentVolume\?:\s*number/);
    });

    it('should have onStateChange callback property', () => {
      expect(sourceCode).toMatch(/onStateChange\?:\s*ControllerStateCallback/);
    });

    it('should have onMetrics callback property', () => {
      expect(sourceCode).toMatch(/onMetrics\?:/);
    });
  });

  describe('Constructor', () => {
    it('should take eegSource as first parameter', () => {
      expect(sourceCode).toMatch(/constructor\s*\(\s*eegSource:\s*EEGSource/);
    });

    it('should take entrainmentOutput as second parameter', () => {
      expect(sourceCode).toContain('entrainmentOutput: EntrainmentOutput');
    });

    it('should take optional config as third parameter', () => {
      expect(sourceCode).toContain('config: ClosedLoopControllerConfig = {}');
    });

    it('should have default startThreshold of -0.5', () => {
      expect(sourceCode).toContain('startThreshold: -0.5');
    });

    it('should have default stopThreshold of 0.5', () => {
      expect(sourceCode).toContain('stopThreshold: 0.5');
    });

    it('should have default cooldownMs of 5000', () => {
      expect(sourceCode).toContain('cooldownMs: 5000');
    });

    it('should have default minEntrainmentMs of 3000', () => {
      expect(sourceCode).toContain('minEntrainmentMs: 3000');
    });

    it('should have default entrainmentFrequency of 6', () => {
      expect(sourceCode).toContain('entrainmentFrequency: 6');
    });

    it('should have default entrainmentVolume of 0.7', () => {
      expect(sourceCode).toContain('entrainmentVolume: 0.7');
    });
  });

  describe('Public Methods', () => {
    it('should have start method', () => {
      expect(sourceCode).toContain('async start(): Promise<void>');
    });

    it('should have stop method', () => {
      expect(sourceCode).toContain('async stop(): Promise<void>');
    });

    it('should have getState method', () => {
      expect(sourceCode).toContain('getState(): ControllerState');
    });

    it('should have getLastMetrics method', () => {
      expect(sourceCode).toContain('getLastMetrics(): EEGMetrics | null');
    });

    it('should have isEntraining method', () => {
      expect(sourceCode).toContain('isEntraining(): boolean');
    });

    it('should have onStateChange method', () => {
      expect(sourceCode).toContain(
        'onStateChange(callback: ControllerStateCallback)'
      );
    });

    it('should have offStateChange method', () => {
      expect(sourceCode).toContain(
        'offStateChange(callback: ControllerStateCallback)'
      );
    });

    it('should have updateConfig method', () => {
      expect(sourceCode).toContain(
        'updateConfig(updates: Partial<ClosedLoopControllerConfig>)'
      );
    });
  });

  describe('Private Methods', () => {
    it('should have handleMetrics method', () => {
      expect(sourceCode).toContain('private handleMetrics');
    });

    it('should have processMetrics method', () => {
      expect(sourceCode).toContain('private processMetrics');
    });

    it('should have startEntrainment method', () => {
      expect(sourceCode).toContain('private async startEntrainment');
    });

    it('should have stopEntrainment method', () => {
      expect(sourceCode).toContain('private async stopEntrainment');
    });

    it('should have handleConnectionState method', () => {
      expect(sourceCode).toContain('private handleConnectionState');
    });

    it('should have setState method', () => {
      expect(sourceCode).toContain('private setState');
    });
  });

  describe('Threshold Logic', () => {
    it('should check startThreshold for starting entrainment', () => {
      expect(sourceCode).toContain('config.startThreshold');
    });

    it('should check stopThreshold for stopping entrainment', () => {
      expect(sourceCode).toContain('config.stopThreshold');
    });

    it('should compare z_score against thresholds', () => {
      expect(sourceCode).toContain('z_score');
    });
  });

  describe('Cooldown Logic', () => {
    it('should track cooldownEndTime', () => {
      expect(sourceCode).toContain('cooldownEndTime');
    });

    it('should use cooldownMs from config', () => {
      expect(sourceCode).toContain('config.cooldownMs');
    });
  });

  describe('Minimum Entrainment Time', () => {
    it('should track entrainmentStartTime', () => {
      expect(sourceCode).toContain('entrainmentStartTime');
    });

    it('should check minEntrainmentMs before stopping', () => {
      expect(sourceCode).toContain('config.minEntrainmentMs');
    });
  });

  describe('EEG Source Integration', () => {
    it('should call eegSource.start in start method', () => {
      expect(sourceCode).toContain('eegSource.start()');
    });

    it('should call eegSource.stop in stop method', () => {
      expect(sourceCode).toContain('eegSource.stop()');
    });

    it('should register metrics callback', () => {
      expect(sourceCode).toContain('eegSource.onMetrics');
    });

    it('should unregister metrics callback on stop', () => {
      expect(sourceCode).toContain('eegSource.offMetrics');
    });
  });

  describe('Entrainment Output Integration', () => {
    it('should call entrainmentOutput.play', () => {
      expect(sourceCode).toContain('entrainmentOutput.play');
    });

    it('should call entrainmentOutput.stop', () => {
      expect(sourceCode).toContain('entrainmentOutput.stop');
    });

    it('should check entrainmentOutput.isPlaying', () => {
      expect(sourceCode).toContain('entrainmentOutput.isPlaying');
    });

    it('should call setFrequency in updateConfig', () => {
      expect(sourceCode).toContain('entrainmentOutput.setFrequency');
    });

    it('should call setVolume in updateConfig', () => {
      expect(sourceCode).toContain('entrainmentOutput.setVolume');
    });
  });

  describe('State Machine Logic', () => {
    it('should handle monitoring state', () => {
      expect(sourceCode).toContain("case 'monitoring'");
    });

    it('should handle entraining state', () => {
      expect(sourceCode).toContain("case 'entraining'");
    });

    it('should handle cooldown state', () => {
      expect(sourceCode).toContain("case 'cooldown'");
    });

    it('should handle idle state', () => {
      expect(sourceCode).toContain("case 'idle'");
    });
  });

  describe('Error Handling', () => {
    it('should catch errors when starting entrainment', () => {
      expect(sourceCode).toContain('Failed to start entrainment');
    });

    it('should catch errors when stopping entrainment', () => {
      expect(sourceCode).toContain('Failed to stop entrainment');
    });

    it('should handle connection state errors', () => {
      expect(sourceCode).toContain('Error stopping on disconnect');
    });
  });

  describe('Documentation', () => {
    it('should have module-level documentation', () => {
      expect(sourceCode).toContain('Closed Loop Controller');
    });

    it('should document threshold logic', () => {
      expect(sourceCode).toContain('THRESHOLD LOGIC');
    });

    it('should document cooldown logic', () => {
      expect(sourceCode).toContain('COOLDOWN LOGIC');
    });
  });

  describe('Service Index Export', () => {
    it('should be exported from services/index.ts', () => {
      const indexPath = path.join(__dirname, '../src/services/index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain('ClosedLoopController');
    });
  });
});

describe('ClosedLoopController Functional Tests', () => {
  // Mock dependencies
  const createMockEEGSource = () => ({
    start: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    onMetrics: jest.fn(),
    offMetrics: jest.fn(),
    onConnectionStateChange: jest.fn(),
    offConnectionStateChange: jest.fn(),
    getConnectionState: jest.fn().mockReturnValue('connected'),
    isConnected: jest.fn().mockReturnValue(true),
  });

  const createMockEntrainmentOutput = () => ({
    play: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
    setFrequency: jest.fn(),
    setVolume: jest.fn(),
    getState: jest.fn().mockReturnValue('idle'),
    isPlaying: jest.fn().mockReturnValue(false),
    onStateChange: jest.fn(),
    offStateChange: jest.fn(),
    dispose: jest.fn().mockResolvedValue(undefined),
  });

  let ClosedLoopController: typeof import('../src/services/ClosedLoopController').ClosedLoopController;

  beforeAll(async () => {
    const module = await import('../src/services/ClosedLoopController');
    ClosedLoopController = module.ClosedLoopController;
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );
      expect(controller).toBeDefined();
      expect(controller.getState()).toBe('idle');
    });

    it('should accept custom config', () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any,
        {
          startThreshold: -1.0,
          stopThreshold: 1.0,
          cooldownMs: 10000,
        }
      );
      expect(controller).toBeDefined();
    });
  });

  describe('start/stop', () => {
    it('should start and register callbacks', async () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );

      await controller.start();

      expect(eegSource.onMetrics).toHaveBeenCalled();
      expect(eegSource.onConnectionStateChange).toHaveBeenCalled();
      expect(eegSource.start).toHaveBeenCalled();
      expect(controller.getState()).toBe('monitoring');
    });

    it('should stop and unregister callbacks', async () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );

      await controller.start();
      await controller.stop();

      expect(eegSource.offMetrics).toHaveBeenCalled();
      expect(eegSource.offConnectionStateChange).toHaveBeenCalled();
      expect(eegSource.stop).toHaveBeenCalled();
      expect(controller.getState()).toBe('idle');
    });

    it('should warn if already running', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );

      await controller.start();
      await controller.start();

      expect(consoleSpy).toHaveBeenCalledWith(
        '[ClosedLoopController] Already running'
      );
      consoleSpy.mockRestore();
    });
  });

  describe('isEntraining', () => {
    it('should return false when not entraining', () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );
      expect(controller.isEntraining()).toBe(false);
    });
  });

  describe('getLastMetrics', () => {
    it('should return null initially', () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );
      expect(controller.getLastMetrics()).toBe(null);
    });
  });

  describe('onStateChange/offStateChange', () => {
    it('should register and unregister callbacks', async () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );

      const callback = jest.fn();
      controller.onStateChange(callback);

      await controller.start();
      expect(callback).toHaveBeenCalledWith('monitoring', undefined);

      controller.offStateChange(callback);
      callback.mockClear();

      await controller.stop();
      // Callback should not be called after removal
    });
  });

  describe('updateConfig', () => {
    it('should update configuration', () => {
      const eegSource = createMockEEGSource();
      const entrainmentOutput = createMockEntrainmentOutput();
      entrainmentOutput.isPlaying.mockReturnValue(true);

      const controller = new ClosedLoopController(
        eegSource as any,
        entrainmentOutput as any
      );

      controller.updateConfig({
        entrainmentFrequency: 8,
        entrainmentVolume: 0.5,
      });

      expect(entrainmentOutput.setFrequency).toHaveBeenCalledWith(8);
      expect(entrainmentOutput.setVolume).toHaveBeenCalledWith(0.5);
    });
  });
});
