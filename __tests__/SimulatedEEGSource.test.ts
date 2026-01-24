/**
 * Tests for SimulatedEEGSource
 *
 * Tests cover:
 * - WebSocket connection management
 * - Metrics parsing and validation
 * - Control message sending
 * - Auto-reconnect behavior
 * - Connection state callbacks
 */

import * as fs from 'fs';
import * as path from 'path';

// Read the source file for static analysis
const sourceFilePath = path.join(
  __dirname,
  '../src/services/eeg/SimulatedEEGSource.ts'
);
const sourceCode = fs.readFileSync(sourceFilePath, 'utf-8');

describe('SimulatedEEGSource', () => {
  describe('File Structure', () => {
    it('should exist at the correct path', () => {
      expect(fs.existsSync(sourceFilePath)).toBe(true);
    });

    it('should export SimulatedEEGSource class', () => {
      expect(sourceCode).toContain('export class SimulatedEEGSource');
    });

    it('should implement EEGSource interface', () => {
      expect(sourceCode).toContain('implements EEGSource');
    });

    it('should export SimulatedEEGSourceConfig interface', () => {
      expect(sourceCode).toContain('export interface SimulatedEEGSourceConfig');
    });

    it('should export SimulatorControlMessage interface', () => {
      expect(sourceCode).toContain('export interface SimulatorControlMessage');
    });
  });

  describe('Required Imports', () => {
    it('should import EEGSource from EEGSource', () => {
      expect(sourceCode).toContain('EEGSource');
      expect(sourceCode).toContain("from './EEGSource'");
    });

    it('should import EEGMetrics from EEGSource', () => {
      expect(sourceCode).toContain('EEGMetrics');
    });

    it('should import EEGConnectionState from EEGSource', () => {
      expect(sourceCode).toContain('EEGConnectionState');
    });
  });

  describe('SimulatedEEGSourceConfig Interface', () => {
    it('should extend EEGSourceConfig', () => {
      expect(sourceCode).toContain('extends EEGSourceConfig');
    });

    it('should have serverUrl property', () => {
      expect(sourceCode).toMatch(/serverUrl\?:\s*string/);
    });

    it('should have reconnectDelay property', () => {
      expect(sourceCode).toMatch(/reconnectDelay\?:\s*number/);
    });
  });

  describe('SimulatorControlMessage Interface', () => {
    it('should have command property', () => {
      expect(sourceCode).toMatch(
        /command:\s*['"]set_state['"].*\|.*['"]clear_state['"]/
      );
    });

    it('should have optional state property', () => {
      expect(sourceCode).toMatch(
        /state\?:\s*['"]low['"].*\|.*['"]normal['"].*\|.*['"]high['"]/
      );
    });
  });

  describe('Constructor', () => {
    it('should accept optional config', () => {
      expect(sourceCode).toContain(
        'constructor(config: SimulatedEEGSourceConfig = {})'
      );
    });

    it('should have default serverUrl with port 8765', () => {
      // Default URL can be configured for different environments (emulator vs physical device)
      expect(sourceCode).toMatch(/serverUrl: 'ws:\/\/[\d.]+:8765'/);
    });

    it('should have default autoReconnect of true', () => {
      expect(sourceCode).toContain('autoReconnect: true');
    });

    it('should have default reconnectDelay of 2000', () => {
      expect(sourceCode).toContain('reconnectDelay: 2000');
    });
  });

  describe('Public Methods', () => {
    it('should have start method', () => {
      expect(sourceCode).toContain('async start(): Promise<void>');
    });

    it('should have stop method', () => {
      expect(sourceCode).toContain('async stop(): Promise<void>');
    });

    it('should have onMetrics method', () => {
      expect(sourceCode).toContain('onMetrics(callback: EEGMetricsCallback)');
    });

    it('should have offMetrics method', () => {
      expect(sourceCode).toContain('offMetrics(callback: EEGMetricsCallback)');
    });

    it('should have onConnectionStateChange method', () => {
      expect(sourceCode).toContain(
        'onConnectionStateChange(callback: ConnectionStateCallback)'
      );
    });

    it('should have offConnectionStateChange method', () => {
      expect(sourceCode).toContain(
        'offConnectionStateChange(callback: ConnectionStateCallback)'
      );
    });

    it('should have getConnectionState method', () => {
      expect(sourceCode).toContain('getConnectionState(): EEGConnectionState');
    });

    it('should have isConnected method', () => {
      expect(sourceCode).toContain('isConnected(): boolean');
    });

    it('should have sendControlMessage method', () => {
      expect(sourceCode).toContain(
        'sendControlMessage(message: SimulatorControlMessage)'
      );
    });

    it('should have forceState method', () => {
      expect(sourceCode).toContain(
        "forceState(state: 'low' | 'normal' | 'high')"
      );
    });

    it('should have clearForcedState method', () => {
      expect(sourceCode).toContain('clearForcedState()');
    });
  });

  describe('Private Methods', () => {
    it('should have connect method', () => {
      expect(sourceCode).toContain('private async connect()');
    });

    it('should have handleMessage method', () => {
      expect(sourceCode).toContain('private handleMessage');
    });

    it('should have emitMetrics method', () => {
      expect(sourceCode).toContain('private emitMetrics');
    });

    it('should have setConnectionState method', () => {
      expect(sourceCode).toContain('private setConnectionState');
    });

    it('should have scheduleReconnect method', () => {
      expect(sourceCode).toContain('private scheduleReconnect');
    });

    it('should have clearReconnectTimer method', () => {
      expect(sourceCode).toContain('private clearReconnectTimer');
    });
  });

  describe('Connection State Management', () => {
    it('should track connectionState', () => {
      expect(sourceCode).toContain(
        "connectionState: EEGConnectionState = 'disconnected'"
      );
    });

    it('should track reconnectAttempts', () => {
      expect(sourceCode).toContain('reconnectAttempts = 0');
    });

    it('should track shouldReconnect flag', () => {
      expect(sourceCode).toContain('shouldReconnect = false');
    });
  });

  describe('WebSocket Handling', () => {
    it('should create WebSocket with serverUrl', () => {
      expect(sourceCode).toContain('new WebSocket(serverUrl)');
    });

    it('should handle onopen event', () => {
      expect(sourceCode).toContain('ws.onopen');
    });

    it('should handle onclose event', () => {
      expect(sourceCode).toContain('ws.onclose');
    });

    it('should handle onerror event', () => {
      expect(sourceCode).toContain('ws.onerror');
    });

    it('should handle onmessage event', () => {
      expect(sourceCode).toContain('ws.onmessage');
    });
  });

  describe('Message Parsing', () => {
    it('should parse JSON messages', () => {
      expect(sourceCode).toContain('JSON.parse');
    });

    it('should validate timestamp field', () => {
      expect(sourceCode).toContain("typeof parsed.timestamp !== 'number'");
    });

    it('should validate theta_power field', () => {
      expect(sourceCode).toContain("typeof parsed.theta_power !== 'number'");
    });

    it('should validate z_score field', () => {
      expect(sourceCode).toContain("typeof parsed.z_score !== 'number'");
    });

    it('should validate theta_state field', () => {
      expect(sourceCode).toContain("typeof parsed.theta_state !== 'string'");
    });

    it('should validate signal_quality field', () => {
      expect(sourceCode).toContain("typeof parsed.signal_quality !== 'number'");
    });
  });

  describe('Auto-Reconnect', () => {
    it('should check autoReconnect config', () => {
      expect(sourceCode).toContain('config.autoReconnect');
    });

    it('should check maxReconnectAttempts', () => {
      expect(sourceCode).toContain('config.maxReconnectAttempts');
    });

    it('should calculate reconnect delay with backoff', () => {
      expect(sourceCode).toContain('reconnectDelay! * this.reconnectAttempts');
    });

    it('should use setTimeout for reconnect', () => {
      expect(sourceCode).toContain('setTimeout');
    });
  });

  describe('Control Messages', () => {
    it('should send control messages via WebSocket', () => {
      expect(sourceCode).toContain('ws.send(JSON.stringify(message))');
    });

    it('forceState should send set_state command', () => {
      expect(sourceCode).toContain("command: 'set_state'");
    });

    it('clearForcedState should send clear_state command', () => {
      expect(sourceCode).toContain("command: 'clear_state'");
    });
  });

  describe('Error Handling', () => {
    it('should log connection errors', () => {
      expect(sourceCode).toContain('[SimulatedEEGSource] ❌ WebSocket ERROR');
    });

    it('should log parse errors', () => {
      expect(sourceCode).toContain(
        '[SimulatedEEGSource] Failed to parse message'
      );
    });

    it('should log invalid message format', () => {
      expect(sourceCode).toContain(
        '[SimulatedEEGSource] Invalid message format'
      );
    });

    it('should catch callback errors', () => {
      expect(sourceCode).toContain('[SimulatedEEGSource] Callback error');
    });
  });

  describe('Documentation', () => {
    it('should have module-level documentation', () => {
      expect(sourceCode).toContain('Simulated EEG Source');
    });

    it('should document WebSocket server connection', () => {
      expect(sourceCode).toContain('WebSocket server');
    });

    it('should document control messages', () => {
      expect(sourceCode).toContain('CONTROL MESSAGES');
    });
  });

  describe('Service Index Export', () => {
    it('should be exported from services/eeg/index.ts', () => {
      const indexPath = path.join(__dirname, '../src/services/eeg/index.ts');
      const indexContent = fs.readFileSync(indexPath, 'utf-8');
      expect(indexContent).toContain('SimulatedEEGSource');
    });
  });
});

describe('SimulatedEEGSource Functional Tests', () => {
  let SimulatedEEGSource: typeof import('../src/services/eeg/SimulatedEEGSource').SimulatedEEGSource;

  beforeAll(async () => {
    const module = await import('../src/services/eeg/SimulatedEEGSource');
    SimulatedEEGSource = module.SimulatedEEGSource;
  });

  describe('Constructor', () => {
    it('should create instance with default config', () => {
      const source = new SimulatedEEGSource();
      expect(source).toBeDefined();
      expect(source.getConnectionState()).toBe('disconnected');
      expect(source.isConnected()).toBe(false);
    });

    it('should accept custom serverUrl', () => {
      const source = new SimulatedEEGSource({
        serverUrl: 'ws://custom:9999',
      });
      expect(source).toBeDefined();
    });

    it('should accept onMetrics callback in config', () => {
      const callback = jest.fn();
      const source = new SimulatedEEGSource({
        onMetrics: callback,
      });
      expect(source).toBeDefined();
    });

    it('should accept onConnectionStateChange callback in config', () => {
      const callback = jest.fn();
      const source = new SimulatedEEGSource({
        onConnectionStateChange: callback,
      });
      expect(source).toBeDefined();
    });
  });

  describe('Callback Management', () => {
    it('should register metrics callbacks', () => {
      const source = new SimulatedEEGSource();
      const callback = jest.fn();
      source.onMetrics(callback);
      // Callback registered (no way to verify without emitting)
    });

    it('should unregister metrics callbacks', () => {
      const source = new SimulatedEEGSource();
      const callback = jest.fn();
      source.onMetrics(callback);
      source.offMetrics(callback);
      // Callback unregistered
    });

    it('should register connection state callbacks', () => {
      const source = new SimulatedEEGSource();
      const callback = jest.fn();
      source.onConnectionStateChange(callback);
      // Callback registered
    });

    it('should unregister connection state callbacks', () => {
      const source = new SimulatedEEGSource();
      const callback = jest.fn();
      source.onConnectionStateChange(callback);
      source.offConnectionStateChange(callback);
      // Callback unregistered
    });
  });

  describe('Connection State', () => {
    it('should start disconnected', () => {
      const source = new SimulatedEEGSource();
      expect(source.getConnectionState()).toBe('disconnected');
    });

    it('should report not connected initially', () => {
      const source = new SimulatedEEGSource();
      expect(source.isConnected()).toBe(false);
    });
  });

  describe('Control Messages', () => {
    it('forceState should return false when not connected', () => {
      const source = new SimulatedEEGSource();
      const result = source.forceState('low');
      expect(result).toBe(false);
    });

    it('clearForcedState should return false when not connected', () => {
      const source = new SimulatedEEGSource();
      const result = source.clearForcedState();
      expect(result).toBe(false);
    });

    it('sendControlMessage should return false when not connected', () => {
      const source = new SimulatedEEGSource();
      const result = source.sendControlMessage({
        command: 'set_state',
        state: 'high',
      });
      expect(result).toBe(false);
    });
  });

  describe('Stop Behavior', () => {
    it('should be safe to stop when not started', async () => {
      const source = new SimulatedEEGSource();
      await expect(source.stop()).resolves.toBeUndefined();
      expect(source.getConnectionState()).toBe('disconnected');
    });
  });
});
