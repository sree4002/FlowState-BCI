/**
 * Tests for DeviceStatusWidget component
 * Verifies connection status, battery level, and signal quality display
 */

import React from 'react';
import { render } from '@testing-library/react';
import { DeviceStatusWidget } from '../src/components/DeviceStatusWidget';
import { DeviceProvider, useDevice } from '../src/contexts';
import { renderHook, act } from '@testing-library/react';
import { DeviceInfo, SignalQuality } from '../src/types';

// Helper to create wrapper with DeviceProvider
const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <DeviceProvider>{children}</DeviceProvider>
  );
};

// Helper to render widget with provider
const renderWidget = () => {
  return render(
    <DeviceProvider>
      <DeviceStatusWidget testID="device-status-widget" />
    </DeviceProvider>
  );
};

// Helper component that sets device state and renders widget
const TestWidgetWithDevice = ({
  deviceInfo,
  signalQuality,
  isConnecting,
  connectionError,
}: {
  deviceInfo?: DeviceInfo | null;
  signalQuality?: SignalQuality | null;
  isConnecting?: boolean;
  connectionError?: string | null;
}) => {
  const device = useDevice();
  React.useEffect(() => {
    if (deviceInfo !== undefined) {
      device.setDeviceInfo(deviceInfo);
    }
    if (signalQuality !== undefined) {
      device.setSignalQuality(signalQuality);
    }
    if (isConnecting !== undefined) {
      device.setIsConnecting(isConnecting);
    }
    if (connectionError !== undefined) {
      device.setConnectionError(connectionError);
    }
  }, []);
  return <DeviceStatusWidget testID="device-status-widget" />;
};

describe('DeviceStatusWidget', () => {
  describe('Basic Rendering', () => {
    it('should render the widget container', () => {
      const { container } = renderWidget();
      expect(
        container.querySelector('[data-testid="device-status-widget"]')
      ).toBeTruthy();
    });

    it('should render the Device Status title', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain('Device Status');
    });

    it('should render Battery label', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain('Battery');
    });

    it('should render Signal label', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain('Signal');
    });
  });

  describe('No Device State', () => {
    it('should show disconnected status when no device is paired', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain('Disconnected');
    });

    it('should show "No device paired" message when no device info', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain('No device paired');
    });

    it('should show pairing instructions when no device', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain(
        'Go to Settings to pair a device'
      );
    });

    it('should show -- for battery when no device', () => {
      const { container } = renderWidget();
      expect(container.textContent).toContain('--');
    });
  });

  describe('Connected Device State', () => {
    const mockDevice: DeviceInfo = {
      id: 'device-123',
      name: 'FlowState Headband',
      type: 'headband',
      sampling_rate: 500,
      battery_level: 85,
      firmware_version: '1.0.0',
      rssi: -65,
      is_connected: true,
      last_connected: Date.now(),
    };

    const mockSignalQuality: SignalQuality = {
      score: 90,
      artifact_percentage: 10,
      has_amplitude_artifact: false,
      has_gradient_artifact: false,
      has_frequency_artifact: false,
    };

    it('should show connected status when device is connected', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice deviceInfo={mockDevice} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Connected');
    });

    it('should display device name when connected', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice deviceInfo={mockDevice} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('FlowState Headband');
    });

    it('should display device type as Headband', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice deviceInfo={mockDevice} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Headband');
    });

    it('should display device type as Earpiece when type is earpiece', () => {
      const earpieceDevice = { ...mockDevice, type: 'earpiece' as const };
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice deviceInfo={earpieceDevice} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Earpiece');
    });

    it('should display battery level percentage', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice deviceInfo={mockDevice} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('85%');
    });

    it('should display signal quality score', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={mockSignalQuality}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('90');
    });

    it('should display Excellent for high signal quality', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={mockSignalQuality}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Excellent');
    });
  });

  describe('Signal Quality Labels', () => {
    const mockDevice: DeviceInfo = {
      id: 'device-123',
      name: 'Test Device',
      type: 'headband',
      sampling_rate: 500,
      battery_level: 50,
      firmware_version: '1.0.0',
      rssi: -65,
      is_connected: true,
      last_connected: Date.now(),
    };

    it('should show Good label for signal score 60-79', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 65,
              artifact_percentage: 35,
              has_amplitude_artifact: false,
              has_gradient_artifact: false,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Good');
    });

    it('should show Fair label for signal score 40-59', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 45,
              artifact_percentage: 55,
              has_amplitude_artifact: true,
              has_gradient_artifact: false,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Fair');
    });

    it('should show Poor label for signal score 20-39', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 25,
              artifact_percentage: 75,
              has_amplitude_artifact: true,
              has_gradient_artifact: true,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Poor');
    });

    it('should show Critical label for signal score below 20', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 10,
              artifact_percentage: 90,
              has_amplitude_artifact: true,
              has_gradient_artifact: true,
              has_frequency_artifact: true,
            }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Critical');
    });

    it('should show N/A for null signal quality', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice deviceInfo={mockDevice} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('N/A');
    });
  });

  describe('Connection States', () => {
    it('should show Connecting status when isConnecting is true', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice isConnecting={true} />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Connecting...');
    });

    it('should show Error status when connection error exists', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice connectionError="Failed to connect" />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Error');
    });

    it('should display error message when connection error exists', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice connectionError="Bluetooth is disabled" />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Bluetooth is disabled');
    });
  });

  describe('Battery Level Indicators', () => {
    const mockDevice: DeviceInfo = {
      id: 'device-123',
      name: 'Test Device',
      type: 'headband',
      sampling_rate: 500,
      battery_level: 100,
      firmware_version: '1.0.0',
      rssi: -65,
      is_connected: true,
      last_connected: Date.now(),
    };

    it('should show battery percentage for full battery', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={{ ...mockDevice, battery_level: 100 }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('100%');
    });

    it('should show battery percentage for low battery', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={{ ...mockDevice, battery_level: 15 }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('15%');
    });

    it('should show -- for null battery level', () => {
      const { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={{ ...mockDevice, battery_level: null }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('--');
    });
  });

  describe('Context Integration', () => {
    it('should throw error when used outside DeviceProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = jest.fn();

      expect(() => {
        render(<DeviceStatusWidget />);
      }).toThrow('useDevice must be used within a DeviceProvider');

      console.error = originalError;
    });
  });

  describe('Component Export', () => {
    it('should be exported as named export', () => {
      expect(DeviceStatusWidget).toBeDefined();
      expect(typeof DeviceStatusWidget).toBe('function');
    });

    it('should have proper displayName or function name', () => {
      expect(
        DeviceStatusWidget.name === 'DeviceStatusWidget' ||
          DeviceStatusWidget.displayName === 'DeviceStatusWidget'
      ).toBe(true);
    });
  });

  describe('DeviceContext Hook Integration', () => {
    it('should access device info from context', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDevice(), { wrapper });

      const mockDevice: DeviceInfo = {
        id: 'test-device',
        name: 'Test Headband',
        type: 'headband',
        sampling_rate: 500,
        battery_level: 75,
        firmware_version: '2.0.0',
        rssi: -50,
        is_connected: true,
        last_connected: Date.now(),
      };

      act(() => {
        result.current.setDeviceInfo(mockDevice);
      });

      expect(result.current.deviceInfo).toEqual(mockDevice);
    });

    it('should access signal quality from context', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useDevice(), { wrapper });

      const mockQuality: SignalQuality = {
        score: 80,
        artifact_percentage: 20,
        has_amplitude_artifact: false,
        has_gradient_artifact: false,
        has_frequency_artifact: false,
      };

      act(() => {
        result.current.setSignalQuality(mockQuality);
      });

      expect(result.current.signalQuality).toEqual(mockQuality);
    });
  });

  describe('Helper Functions', () => {
    it('should have signal score thresholds at correct boundaries', () => {
      const mockDevice: DeviceInfo = {
        id: 'test',
        name: 'Test',
        type: 'headband',
        sampling_rate: 500,
        battery_level: 50,
        firmware_version: '1.0',
        rssi: -60,
        is_connected: true,
        last_connected: Date.now(),
      };

      // Test boundary at 80 (Excellent)
      let { container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 80,
              artifact_percentage: 20,
              has_amplitude_artifact: false,
              has_gradient_artifact: false,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      );
      expect(container.textContent).toContain('Excellent');

      // Test boundary at 79 (Good)
      ({ container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 79,
              artifact_percentage: 21,
              has_amplitude_artifact: false,
              has_gradient_artifact: false,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      ));
      expect(container.textContent).toContain('Good');

      // Test boundary at 60 (Good)
      ({ container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 60,
              artifact_percentage: 40,
              has_amplitude_artifact: false,
              has_gradient_artifact: false,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      ));
      expect(container.textContent).toContain('Good');

      // Test boundary at 59 (Fair)
      ({ container } = render(
        <DeviceProvider>
          <TestWidgetWithDevice
            deviceInfo={mockDevice}
            signalQuality={{
              score: 59,
              artifact_percentage: 41,
              has_amplitude_artifact: false,
              has_gradient_artifact: false,
              has_frequency_artifact: false,
            }}
          />
        </DeviceProvider>
      ));
      expect(container.textContent).toContain('Fair');
    });
  });
});
