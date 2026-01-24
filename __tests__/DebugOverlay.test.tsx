/**
 * Tests for DebugOverlay component
 * Verifies debug overlay and bar functionality
 */

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import {
  DebugOverlay,
  DebugBar,
  useTripleTap,
  getSignalQualityColor as getDebugSignalQualityColor,
  getThetaZScoreColor,
  getConnectionStatusInfo,
} from '../src/components/DebugOverlay';
import { SettingsProvider } from '../src/contexts/SettingsContext';
import { Colors } from '../src/constants/theme';

// Test wrapper with SettingsProvider
const TestWrapper: React.FC<{
  children: React.ReactNode;
  initialSettings?: Record<string, any>;
}> = ({ children, initialSettings = {} }) => (
  <SettingsProvider initialSettings={initialSettings}>{children}</SettingsProvider>
);

// Test component for useTripleTap hook
import { TouchableOpacity, Text } from 'react-native';

const TripleTapTestComponent: React.FC<{ onTripleTap: () => void }> = ({
  onTripleTap,
}) => {
  const { onPress } = useTripleTap(onTripleTap);
  return (
    <TouchableOpacity testID="triple-tap-button" onPress={onPress}>
      <Text>Tap me</Text>
    </TouchableOpacity>
  );
};

describe('DebugOverlay', () => {
  describe('Helper Functions', () => {
    describe('getDebugSignalQualityColor', () => {
      it('returns green for quality >= 80', () => {
        expect(getDebugSignalQualityColor(80)).toBe(Colors.status.green);
        expect(getDebugSignalQualityColor(100)).toBe(Colors.status.green);
      });

      it('returns yellow for quality >= 50 and < 80', () => {
        expect(getDebugSignalQualityColor(50)).toBe(Colors.status.yellow);
        expect(getDebugSignalQualityColor(79)).toBe(Colors.status.yellow);
      });

      it('returns red for quality < 50', () => {
        expect(getDebugSignalQualityColor(49)).toBe(Colors.status.red);
        expect(getDebugSignalQualityColor(0)).toBe(Colors.status.red);
      });
    });

    describe('getThetaZScoreColor', () => {
      it('returns blue for z-score >= 1.5', () => {
        expect(getThetaZScoreColor(1.5)).toBe(Colors.status.blue);
        expect(getThetaZScoreColor(2.5)).toBe(Colors.status.blue);
      });

      it('returns green for z-score >= 0.5 and < 1.5', () => {
        expect(getThetaZScoreColor(0.5)).toBe(Colors.status.green);
        expect(getThetaZScoreColor(1.4)).toBe(Colors.status.green);
      });

      it('returns yellow for z-score >= -0.5 and < 0.5', () => {
        expect(getThetaZScoreColor(-0.5)).toBe(Colors.status.yellow);
        expect(getThetaZScoreColor(0.4)).toBe(Colors.status.yellow);
      });

      it('returns red for z-score < -0.5', () => {
        expect(getThetaZScoreColor(-0.6)).toBe(Colors.status.red);
        expect(getThetaZScoreColor(-2)).toBe(Colors.status.red);
      });
    });

    describe('getConnectionStatusInfo', () => {
      it('returns SIMULATED for simulated mode', () => {
        const result = getConnectionStatusInfo('connected', true);
        expect(result.label).toBe('SIMULATED');
        expect(result.color).toBe(Colors.status.yellow);
      });

      it('returns LIVE for connected real device', () => {
        const result = getConnectionStatusInfo('connected', false);
        expect(result.label).toBe('LIVE');
        expect(result.color).toBe(Colors.status.green);
      });

      it('returns CONNECTING... for connecting device', () => {
        const result = getConnectionStatusInfo('connecting', false);
        expect(result.label).toBe('CONNECTING...');
        expect(result.color).toBe(Colors.status.yellow);
      });

      it('returns DISCONNECTED for disconnected device', () => {
        const result = getConnectionStatusInfo('disconnected', false);
        expect(result.label).toBe('DISCONNECTED');
        expect(result.color).toBe(Colors.status.red);
      });
    });
  });

  describe('DebugOverlay Component', () => {
    const defaultProps = {
      visible: true,
      onClose: jest.fn(),
      thetaZScore: 1.2,
      signalQuality: 85,
      isSimulated: false,
      connectionStatus: 'connected' as const,
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders when visible', () => {
      render(
        <TestWrapper>
          <DebugOverlay {...defaultProps} />
        </TestWrapper>
      );
      expect(screen.getByTestId('debug-overlay')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      render(
        <TestWrapper>
          <DebugOverlay {...defaultProps} visible={false} />
        </TestWrapper>
      );
      expect(screen.queryByTestId('debug-overlay')).toBeNull();
    });

    it('displays theta z-score', () => {
      render(
        <TestWrapper>
          <DebugOverlay {...defaultProps} />
        </TestWrapper>
      );
      expect(screen.getByText('Theta Z-Score')).toBeTruthy();
      expect(screen.getByText('1.20')).toBeTruthy();
    });

    it('displays signal quality', () => {
      render(
        <TestWrapper>
          <DebugOverlay {...defaultProps} />
        </TestWrapper>
      );
      expect(screen.getByText('Signal Quality')).toBeTruthy();
      expect(screen.getByText('85%')).toBeTruthy();
    });

    it('displays connection status', () => {
      render(
        <TestWrapper>
          <DebugOverlay {...defaultProps} />
        </TestWrapper>
      );
      expect(screen.getByText('Connection')).toBeTruthy();
      expect(screen.getByText('LIVE')).toBeTruthy();
    });

    it('calls onClose when close button is pressed', () => {
      render(
        <TestWrapper>
          <DebugOverlay {...defaultProps} />
        </TestWrapper>
      );
      fireEvent.press(screen.getByTestId('debug-overlay-close'));
      expect(defaultProps.onClose).toHaveBeenCalled();
    });

    it('shows force state picker when simulated mode is enabled', () => {
      render(
        <TestWrapper initialSettings={{ simulated_mode_enabled: true }}>
          <DebugOverlay {...defaultProps} isSimulated={true} />
        </TestWrapper>
      );
      expect(screen.getByText('Force Theta State')).toBeTruthy();
      expect(screen.getByTestId('debug-force-state-auto')).toBeTruthy();
    });

    it('does not show force state picker when simulated mode is disabled', () => {
      render(
        <TestWrapper initialSettings={{ simulated_mode_enabled: false }}>
          <DebugOverlay {...defaultProps} isSimulated={false} />
        </TestWrapper>
      );
      expect(screen.queryByText('Force Theta State')).toBeNull();
    });
  });

  describe('DebugBar Component', () => {
    const defaultProps = {
      visible: true,
      thetaZScore: 1.2,
      signalQuality: 85,
      isSimulated: false,
      onTap: jest.fn(),
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('renders when visible', () => {
      render(<DebugBar {...defaultProps} />);
      expect(screen.getByTestId('debug-bar')).toBeTruthy();
    });

    it('does not render when not visible', () => {
      render(<DebugBar {...defaultProps} visible={false} />);
      expect(screen.queryByTestId('debug-bar')).toBeNull();
    });

    it('displays theta z-score value', () => {
      render(<DebugBar {...defaultProps} />);
      expect(screen.getByText('1.2')).toBeTruthy();
    });

    it('displays signal quality value', () => {
      render(<DebugBar {...defaultProps} />);
      expect(screen.getByText('85%')).toBeTruthy();
    });

    it('displays LIVE when not simulated', () => {
      render(<DebugBar {...defaultProps} isSimulated={false} />);
      expect(screen.getByText('LIVE')).toBeTruthy();
    });

    it('displays SIM when simulated', () => {
      render(<DebugBar {...defaultProps} isSimulated={true} />);
      expect(screen.getByText('SIM')).toBeTruthy();
    });

    it('calls onTap when pressed', () => {
      render(<DebugBar {...defaultProps} />);
      fireEvent.press(screen.getByTestId('debug-bar').children[0]);
      expect(defaultProps.onTap).toHaveBeenCalled();
    });
  });

  describe('useTripleTap Hook', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('triggers callback after three rapid taps', () => {
      const onTripleTap = jest.fn();
      render(<TripleTapTestComponent onTripleTap={onTripleTap} />);

      const button = screen.getByTestId('triple-tap-button');

      // Three rapid taps
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onTripleTap).toHaveBeenCalledTimes(1);
    });

    it('does not trigger if taps are too slow', () => {
      const onTripleTap = jest.fn();
      render(<TripleTapTestComponent onTripleTap={onTripleTap} />);

      const button = screen.getByTestId('triple-tap-button');

      fireEvent.press(button);
      act(() => {
        jest.advanceTimersByTime(600); // Wait longer than timeout
      });
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onTripleTap).not.toHaveBeenCalled();
    });

    it('resets count after timeout', () => {
      const onTripleTap = jest.fn();
      render(<TripleTapTestComponent onTripleTap={onTripleTap} />);

      const button = screen.getByTestId('triple-tap-button');

      // Two taps, then wait
      fireEvent.press(button);
      fireEvent.press(button);
      act(() => {
        jest.advanceTimersByTime(600);
      });

      // Two more taps (not three total since count reset)
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onTripleTap).not.toHaveBeenCalled();
    });
  });

  describe('Module Exports', () => {
    it('exports DebugOverlay from components index', () => {
      const { DebugOverlay: ExportedComponent } = require('../src/components');
      expect(ExportedComponent).toBeDefined();
    });

    it('exports DebugBar from components index', () => {
      const { DebugBar: ExportedComponent } = require('../src/components');
      expect(ExportedComponent).toBeDefined();
    });

    it('exports useTripleTap from components index', () => {
      const { useTripleTap: ExportedHook } = require('../src/components');
      expect(ExportedHook).toBeDefined();
    });
  });
});
