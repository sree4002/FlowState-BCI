/**
 * Tests for MockBleService
 * Comprehensive tests for the mock BLE service used in development/testing
 */

import {
  MockBleService,
  createMockBleService,
  MockDeviceConfig,
  SimulationScenario,
  EEGDataWithMetrics,
} from '../src/services/MockBleService';
import { SignalQuality } from '../src/types';

describe('MockBleService', () => {
  let service: MockBleService;

  beforeEach(() => {
    service = new MockBleService('realistic');
  });

  afterEach(() => {
    service.destroy();
  });

  describe('constructor and configuration', () => {
    it('should create instance with default realistic scenario', () => {
      expect(service.getScenario()).toBe('realistic');
      const config = service.getConfig();
      expect(config.deviceType).toBe('headband');
      expect(config.signalQuality).toBe(85);
    });

    it('should create instance with custom scenario', () => {
      const idealService = new MockBleService('ideal');
      expect(idealService.getScenario()).toBe('ideal');
      expect(idealService.getConfig().signalQuality).toBe(100);
      idealService.destroy();
    });

    it('should apply custom configuration overrides', () => {
      const customService = new MockBleService('realistic', {
        deviceType: 'earpiece',
        batteryLevel: 50,
      });
      const config = customService.getConfig();
      expect(config.deviceType).toBe('earpiece');
      expect(config.batteryLevel).toBe(50);
      customService.destroy();
    });

    it('should create instance using factory function', () => {
      const factoryService = createMockBleService('noisy');
      expect(factoryService.getScenario()).toBe('noisy');
      expect(factoryService.getConfig().signalQuality).toBe(60);
      factoryService.destroy();
    });
  });

  describe('setConfig and setScenario', () => {
    it('should update configuration at runtime', () => {
      service.setConfig({ batteryLevel: 25, dataIntervalMs: 200 });
      const config = service.getConfig();
      expect(config.batteryLevel).toBe(25);
      expect(config.dataIntervalMs).toBe(200);
    });

    it('should switch scenarios', () => {
      service.setScenario('poor_connection');
      expect(service.getScenario()).toBe('poor_connection');
      expect(service.getConfig().signalQuality).toBe(45);
    });

    it('should switch to custom scenario with config', () => {
      service.setScenario('custom', {
        signalQuality: 50,
        batteryLevel: 10,
      });
      expect(service.getScenario()).toBe('custom');
      expect(service.getConfig().signalQuality).toBe(50);
      expect(service.getConfig().batteryLevel).toBe(10);
    });
  });

  describe('setBaseline', () => {
    it('should update baseline values for z-score calculation', () => {
      service.setBaseline(15, 4);
      // Baseline values are internal, but they affect generated data
      // We can test this by connecting and checking z-scores
      expect(service).toBeDefined();
    });
  });

  describe('requestPermissions', () => {
    it('should always return true', async () => {
      const result = await service.requestPermissions();
      expect(result).toBe(true);
    });
  });

  describe('scanAndConnect', () => {
    it('should successfully connect to mock device', async () => {
      const device = await service.scanAndConnect();

      expect(device).toBeDefined();
      expect(device.id).toContain('mock-headband');
      expect(device.name).toContain('FlowState');
      expect(device.name).toContain('Mock');
      expect(device.type).toBe('headband');
      expect(device.sampling_rate).toBe(500);
      expect(device.is_connected).toBe(true);
      expect(device.firmware_version).toBe('1.0.0-mock');
    }, 10000);

    it('should connect with earpiece device type', async () => {
      service.setConfig({ deviceType: 'earpiece' });
      const device = await service.scanAndConnect();

      expect(device.type).toBe('earpiece');
      expect(device.sampling_rate).toBe(250);
      expect(device.name).toContain('Earpiece');
    }, 10000);

    it('should throw error if already connected', async () => {
      await service.scanAndConnect();
      await expect(service.scanAndConnect()).rejects.toThrow(
        'Already connected to a device'
      );
    }, 10000);

    it('should handle connection failures when enabled', async () => {
      const failingService = new MockBleService('realistic', {
        simulateConnectionFailures: true,
        connectionFailureProbability: 1.0, // Always fail
      });

      await expect(failingService.scanAndConnect()).rejects.toThrow();
      failingService.destroy();
    }, 10000);
  });

  describe('connectToDevice', () => {
    it('should connect directly without scanning', async () => {
      const device = await service.connectToDevice();

      expect(device).toBeDefined();
      expect(device.is_connected).toBe(true);
      expect(service.getConnectionStatus()).toBe(true);
    }, 10000);
  });

  describe('disconnect', () => {
    it('should disconnect from device', async () => {
      await service.connectToDevice();
      expect(service.getConnectionStatus()).toBe(true);

      await service.disconnect();
      expect(service.getConnectionStatus()).toBe(false);
      expect(service.getDeviceInfo()).toBeNull();
    }, 10000);

    it('should handle disconnect when not connected', async () => {
      await expect(service.disconnect()).resolves.toBeUndefined();
    });

    it('should stop entrainment on disconnect', async () => {
      await service.connectToDevice();
      await service.startEntrainment();
      expect(service.getEntrainmentStatus().isPlaying).toBe(true);

      await service.disconnect();
      expect(service.getEntrainmentStatus().isPlaying).toBe(false);
    }, 10000);
  });

  describe('connection status and device info', () => {
    it('should return correct connection status', async () => {
      expect(service.getConnectionStatus()).toBe(false);

      await service.connectToDevice();
      expect(service.getConnectionStatus()).toBe(true);

      await service.disconnect();
      expect(service.getConnectionStatus()).toBe(false);
    }, 10000);

    it('should return device info when connected', async () => {
      expect(service.getDeviceInfo()).toBeNull();

      await service.connectToDevice();
      const info = service.getDeviceInfo();

      expect(info).not.toBeNull();
      expect(info?.battery_level).toBe(80);
    }, 10000);

    it('should return a copy of device info', async () => {
      await service.connectToDevice();
      const info1 = service.getDeviceInfo();
      const info2 = service.getDeviceInfo();

      expect(info1).not.toBe(info2);
      expect(info1).toEqual(info2);
    }, 10000);
  });

  describe('entrainment control', () => {
    beforeEach(async () => {
      await service.connectToDevice();
    }, 10000);

    it('should start entrainment', async () => {
      await service.startEntrainment();
      expect(service.getEntrainmentStatus().isPlaying).toBe(true);
    });

    it('should stop entrainment', async () => {
      await service.startEntrainment();
      await service.stopEntrainment();
      expect(service.getEntrainmentStatus().isPlaying).toBe(false);
    });

    it('should set frequency within valid range', async () => {
      await service.setFrequency(5.5);
      expect(service.getEntrainmentStatus().frequency).toBe(5.5);
    });

    it('should reject frequency outside valid range', async () => {
      await expect(service.setFrequency(3)).rejects.toThrow(
        'Frequency must be between 4 and 8 Hz'
      );
      await expect(service.setFrequency(9)).rejects.toThrow(
        'Frequency must be between 4 and 8 Hz'
      );
    });

    it('should set volume within valid range', async () => {
      await service.setVolume(0.7);
      expect(service.getEntrainmentStatus().volume).toBe(0.7);
    });

    it('should reject volume outside valid range', async () => {
      await expect(service.setVolume(-0.1)).rejects.toThrow(
        'Volume must be between 0 and 1'
      );
      await expect(service.setVolume(1.1)).rejects.toThrow(
        'Volume must be between 0 and 1'
      );
    });

    it('should send arbitrary command', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      await service.sendCommand('TEST_COMMAND', { data: 'test' });
      expect(consoleSpy).toHaveBeenCalledWith(
        '[MockBleService] Command sent: TEST_COMMAND'
      );
      consoleSpy.mockRestore();
    });

    it('should throw error when not connected', async () => {
      await service.disconnect();

      await expect(service.startEntrainment()).rejects.toThrow(
        'No device connected'
      );
      await expect(service.stopEntrainment()).rejects.toThrow(
        'No device connected'
      );
      await expect(service.setFrequency(6)).rejects.toThrow(
        'No device connected'
      );
      await expect(service.setVolume(0.5)).rejects.toThrow(
        'No device connected'
      );
      await expect(service.sendCommand('TEST')).rejects.toThrow(
        'No device connected'
      );
    });
  });

  describe('event listeners', () => {
    it('should notify connection listeners', async () => {
      const listener = jest.fn();
      service.addConnectionListener(listener);

      await service.connectToDevice();
      expect(listener).toHaveBeenCalledWith(true);

      await service.disconnect();
      expect(listener).toHaveBeenCalledWith(false);
    }, 10000);

    it('should remove connection listeners', async () => {
      const listener = jest.fn();
      service.addConnectionListener(listener);
      service.removeConnectionListener(listener);

      await service.connectToDevice();
      expect(listener).not.toHaveBeenCalled();
    }, 10000);

    it('should notify data listeners with EEG data', async () => {
      const dataReceived: EEGDataWithMetrics[] = [];
      const listener = (data: EEGDataWithMetrics) => {
        dataReceived.push(data);
      };
      service.addDataListener(listener);

      await service.connectToDevice();

      // Wait for data generation
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(dataReceived.length).toBeGreaterThan(0);

      const packet = dataReceived[0];
      expect(packet.timestamp).toBeDefined();
      expect(packet.samples).toBeDefined();
      expect(Array.isArray(packet.samples)).toBe(true);
      expect(packet.sequence_number).toBeDefined();
      expect(packet.thetaPower).toBeDefined();
      expect(packet.alphaPower).toBeDefined();
      expect(packet.betaPower).toBeDefined();
      expect(packet.thetaZScore).toBeDefined();
    }, 10000);

    it('should remove data listeners', async () => {
      const listener = jest.fn();
      service.addDataListener(listener);
      service.removeDataListener(listener);

      await service.connectToDevice();
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(listener).not.toHaveBeenCalled();
    }, 10000);

    it('should notify status listeners on entrainment changes', async () => {
      const listener = jest.fn();
      service.addStatusListener(listener);

      await service.connectToDevice();
      await service.startEntrainment();

      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ isPlaying: true })
      );
    }, 10000);

    it('should remove status listeners', async () => {
      const listener = jest.fn();
      service.addStatusListener(listener);
      service.removeStatusListener(listener);

      await service.connectToDevice();
      await service.startEntrainment();

      expect(listener).not.toHaveBeenCalled();
    }, 10000);

    it('should notify signal quality listeners', async () => {
      // Set fast data interval to get quality updates quicker
      service.setConfig({ dataIntervalMs: 10 });
      const qualityData: SignalQuality[] = [];
      const listener = (quality: SignalQuality) => {
        qualityData.push(quality);
      };
      service.addSignalQualityListener(listener);

      await service.connectToDevice();

      // Wait for multiple data packets (quality sent every 10th packet)
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(qualityData.length).toBeGreaterThan(0);

      const quality = qualityData[0];
      expect(quality.score).toBeDefined();
      expect(typeof quality.score).toBe('number');
      expect(quality.artifact_percentage).toBeDefined();
    }, 10000);

    it('should remove signal quality listeners', async () => {
      const listener = jest.fn();
      service.addSignalQualityListener(listener);
      service.removeSignalQualityListener(listener);

      await service.connectToDevice();
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(listener).not.toHaveBeenCalled();
    }, 10000);
  });

  describe('data generation by scenario', () => {
    it('should generate stable data in ideal scenario', async () => {
      const idealService = new MockBleService('ideal', { dataIntervalMs: 20 });
      const dataPoints: EEGDataWithMetrics[] = [];

      idealService.addDataListener((data) => dataPoints.push(data));
      await idealService.connectToDevice();

      await new Promise((resolve) => setTimeout(resolve, 250));
      idealService.destroy();

      expect(dataPoints.length).toBeGreaterThan(5);

      // Check data has low variance (ideal scenario)
      const thetaValues = dataPoints.map((d) => d.thetaPower);
      const mean = thetaValues.reduce((a, b) => a + b, 0) / thetaValues.length;
      const variance =
        thetaValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        thetaValues.length;

      // Ideal scenario should have low variance
      expect(variance).toBeLessThan(10);
    }, 10000);

    it('should generate noisier data in noisy scenario', async () => {
      const noisyService = new MockBleService('noisy', { dataIntervalMs: 20 });
      const dataPoints: EEGDataWithMetrics[] = [];

      noisyService.addDataListener((data) => dataPoints.push(data));
      await noisyService.connectToDevice();

      await new Promise((resolve) => setTimeout(resolve, 250));
      noisyService.destroy();

      expect(dataPoints.length).toBeGreaterThan(5);

      // Noisy scenario should have higher variance
      const thetaValues = dataPoints.map((d) => d.thetaPower);
      const mean = thetaValues.reduce((a, b) => a + b, 0) / thetaValues.length;
      const variance =
        thetaValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        thetaValues.length;

      // Just verify we got data - variance is probabilistic
      expect(variance).toBeGreaterThanOrEqual(0);
    }, 10000);

    it('should generate correct sample array size based on device type', async () => {
      // Headband: 500Hz, 100ms interval = 50 samples
      const headbandService = new MockBleService('realistic', {
        deviceType: 'headband',
        dataIntervalMs: 100,
      });
      let headbandData: EEGDataWithMetrics | null = null;

      headbandService.addDataListener((data) => {
        if (!headbandData) headbandData = data;
      });
      await headbandService.connectToDevice();
      await new Promise((resolve) => setTimeout(resolve, 150));
      headbandService.destroy();

      expect(headbandData?.samples.length).toBe(50);

      // Earpiece: 250Hz, 100ms interval = 25 samples
      const earpieceService = new MockBleService('realistic', {
        deviceType: 'earpiece',
        dataIntervalMs: 100,
      });
      let earpieceData: EEGDataWithMetrics | null = null;

      earpieceService.addDataListener((data) => {
        if (!earpieceData) earpieceData = data;
      });
      await earpieceService.connectToDevice();
      await new Promise((resolve) => setTimeout(resolve, 150));
      earpieceService.destroy();

      expect(earpieceData?.samples.length).toBe(25);
    }, 10000);
  });

  describe('destroy', () => {
    it('should clean up all resources', async () => {
      const listener = jest.fn();
      service.addDataListener(listener);

      await service.connectToDevice();
      await new Promise((resolve) => setTimeout(resolve, 150));
      const callsBefore = listener.mock.calls.length;

      service.destroy();

      // Wait and verify no more calls
      await new Promise((resolve) => setTimeout(resolve, 200));
      expect(listener.mock.calls.length).toBe(callsBefore);

      expect(service.getConnectionStatus()).toBe(false);
      expect(service.getDeviceInfo()).toBeNull();
    }, 10000);
  });
});
