import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/SettingsScreen';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Helper to render with SettingsProvider
const renderWithSettings = (ui: React.ReactElement) => {
  return render(<SettingsProvider>{ui}</SettingsProvider>);
};

describe('SettingsScreen', () => {
  describe('Screen Layout', () => {
    it('renders Settings title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Settings')).toBeTruthy();
    });

    it('renders Device section (expanded by default)', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Device')).toBeTruthy();
      // Device section is expanded by default, so rows are visible
      expect(screen.getByText('Paired Devices')).toBeTruthy();
    });
  });

  describe('Collapsible Sections', () => {
    it('renders Notifications section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Notifications')).toBeTruthy();
    });

    it('renders Audio section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Audio')).toBeTruthy();
    });

    it('renders Entrainment section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Entrainment')).toBeTruthy();
    });

    it('renders Theta Target section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Theta Target')).toBeTruthy();
    });

    it('renders Accessibility section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Accessibility')).toBeTruthy();
    });

    it('renders Data section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Data')).toBeTruthy();
    });

    it('renders Privacy section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Privacy')).toBeTruthy();
    });

    it('renders About section title', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('About')).toBeTruthy();
    });
  });

  describe('Device Section (expanded)', () => {
    it('renders paired devices setting', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Paired Devices')).toBeTruthy();
    });

    it('renders auto-reconnect setting', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Auto-Reconnect')).toBeTruthy();
    });

    it('renders scan for devices option', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Scan for Devices')).toBeTruthy();
    });
  });

  describe('About Section (always visible)', () => {
    it('renders app version via VersionTapUnlocker', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('App Version')).toBeTruthy();
      expect(screen.getByText('1.0.0')).toBeTruthy();
    });

    it('renders device type', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Device Type')).toBeTruthy();
    });

    it('renders help & support option', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Help & Support')).toBeTruthy();
    });

    it('renders terms of service option', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Terms of Service')).toBeTruthy();
    });

    it('renders privacy policy option', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByText('Privacy Policy')).toBeTruthy();
    });
  });

  describe('Footer', () => {
    it('renders footer text', () => {
      renderWithSettings(<SettingsScreen />);
      // FlowState BCI appears multiple times (Device Type value and footer)
      expect(screen.getAllByText('FlowState BCI').length).toBeGreaterThanOrEqual(1);
      expect(
        screen.getByText('Cognitive Enhancement Through Theta Entrainment')
      ).toBeTruthy();
    });
  });

  describe('Developer Options', () => {
    it('does not show developer options by default', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.queryByTestId('developer-options')).toBeNull();
    });

    it('shows version tap area', () => {
      renderWithSettings(<SettingsScreen />);
      expect(screen.getByTestId('version-tap-area')).toBeTruthy();
    });

    it('shows developer options when enabled via settings', () => {
      render(
        <SettingsProvider initialSettings={{ developer_mode_enabled: true }}>
          <SettingsScreen />
        </SettingsProvider>
      );
      expect(screen.getByTestId('developer-options')).toBeTruthy();
    });

    it('shows simulator toggle in developer options', () => {
      render(
        <SettingsProvider initialSettings={{ developer_mode_enabled: true }}>
          <SettingsScreen />
        </SettingsProvider>
      );
      expect(screen.getByText('Enable Simulator Device')).toBeTruthy();
    });
  });

  describe('Module Export', () => {
    it('exports SettingsScreen from screens index', () => {
      const { SettingsScreen: ExportedScreen } = require('../src/screens');
      expect(ExportedScreen).toBeDefined();
      expect(typeof ExportedScreen).toBe('function');
    });
  });
});
