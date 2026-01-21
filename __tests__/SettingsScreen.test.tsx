import React from 'react';
import { render, screen } from '@testing-library/react-native';
import SettingsScreen from '../src/screens/SettingsScreen';

describe('SettingsScreen', () => {
  describe('Section Categories', () => {
    it('renders Device Management section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Device Management')).toBeTruthy();
      expect(screen.getByText('Manage your paired BCI devices')).toBeTruthy();
    });

    it('renders Notification Preferences section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Notification Preferences')).toBeTruthy();
      expect(
        screen.getByText('Configure when and how you receive notifications')
      ).toBeTruthy();
    });

    it('renders Audio Settings section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Audio Settings')).toBeTruthy();
      expect(
        screen.getByText('Control audio mixing and playback')
      ).toBeTruthy();
    });

    it('renders Entrainment Settings section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Entrainment Settings')).toBeTruthy();
      expect(
        screen.getByText('Configure automatic theta entrainment')
      ).toBeTruthy();
    });

    it('renders Theta Threshold section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Theta Threshold')).toBeTruthy();
      expect(
        screen.getByText('Set target theta levels and response behavior')
      ).toBeTruthy();
    });

    it('renders Theme & Accessibility section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Theme & Accessibility')).toBeTruthy();
      expect(
        screen.getByText('Customize appearance and interactions')
      ).toBeTruthy();
    });

    it('renders Data Management section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Data Management')).toBeTruthy();
      expect(screen.getByText('Export or clear your data')).toBeTruthy();
    });

    it('renders Privacy Settings section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Privacy Settings')).toBeTruthy();
      expect(screen.getByText('Control how your data is used')).toBeTruthy();
    });

    it('renders About section', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('About')).toBeTruthy();
      expect(screen.getByText('App and device information')).toBeTruthy();
    });
  });

  describe('Device Management Settings', () => {
    it('renders paired devices setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Paired Devices')).toBeTruthy();
    });

    it('renders auto-reconnect setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Auto-Reconnect')).toBeTruthy();
    });

    it('renders scan for devices option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Scan for Devices')).toBeTruthy();
    });
  });

  describe('Notification Settings', () => {
    it('renders enable notifications setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Enable Notifications')).toBeTruthy();
    });

    it('renders notification style setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Notification Style')).toBeTruthy();
    });

    it('renders quiet hours setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Quiet Hours')).toBeTruthy();
    });
  });

  describe('Audio Settings', () => {
    it('renders audio mode setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Audio Mode')).toBeTruthy();
    });

    it('renders default volume setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Default Volume')).toBeTruthy();
    });

    it('renders mixing ratio setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Mixing Ratio')).toBeTruthy();
    });
  });

  describe('Entrainment Settings', () => {
    it('renders auto-boost setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Auto-Boost')).toBeTruthy();
    });

    it('renders boost frequency setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Boost Frequency')).toBeTruthy();
    });

    it('renders boost duration setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Boost Duration')).toBeTruthy();
    });
  });

  describe('Theta Threshold Settings', () => {
    it('renders target z-score setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Target Z-Score')).toBeTruthy();
    });

    it('renders when target reached setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('When Target Reached')).toBeTruthy();
    });
  });

  describe('Theme & Accessibility Settings', () => {
    it('renders text size setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Text Size')).toBeTruthy();
    });

    it('renders reduce motion setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Reduce Motion')).toBeTruthy();
    });

    it('renders haptic feedback setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Haptic Feedback')).toBeTruthy();
    });
  });

  describe('Data Management Settings', () => {
    it('renders export session data option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Export Session Data')).toBeTruthy();
    });

    it('renders clear session history option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Clear Session History')).toBeTruthy();
    });

    it('renders clear baseline data option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Clear Baseline Data')).toBeTruthy();
    });
  });

  describe('Privacy Settings', () => {
    it('renders anonymous analytics setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Anonymous Analytics')).toBeTruthy();
    });

    it('renders A/B testing setting', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('A/B Testing')).toBeTruthy();
    });
  });

  describe('About Section', () => {
    it('renders app version', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('App Version')).toBeTruthy();
      expect(screen.getByText('1.0.0')).toBeTruthy();
    });

    it('renders device type', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Device Type')).toBeTruthy();
      // 'FlowState BCI' appears twice (about section value and footer text)
      expect(
        screen.getAllByText('FlowState BCI').length
      ).toBeGreaterThanOrEqual(1);
    });

    it('renders help & support option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Help & Support')).toBeTruthy();
    });

    it('renders terms of service option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Terms of Service')).toBeTruthy();
    });

    it('renders privacy policy option', () => {
      render(<SettingsScreen />);
      expect(screen.getByText('Privacy Policy')).toBeTruthy();
    });
  });

  describe('Footer', () => {
    it('renders footer text', () => {
      render(<SettingsScreen />);
      expect(
        screen.getByText('Cognitive Enhancement Through Theta Entrainment')
      ).toBeTruthy();
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
