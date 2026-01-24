import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import {
  DeveloperOptions,
  VersionTapUnlocker,
} from '../src/components/DeveloperOptions';
import { SettingsProvider } from '../src/contexts/SettingsContext';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Helper to render with SettingsProvider
const renderWithSettings = (
  ui: React.ReactElement,
  initialSettings = {}
) => {
  return render(
    <SettingsProvider initialSettings={initialSettings}>{ui}</SettingsProvider>
  );
};

describe('DeveloperOptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('VersionTapUnlocker', () => {
    it('renders version number', () => {
      render(
        <VersionTapUnlocker
          version="1.0.0"
          onUnlock={jest.fn()}
          isUnlocked={false}
        />
      );
      expect(screen.getByText('1.0.0')).toBeTruthy();
    });

    it('renders app version label', () => {
      render(
        <VersionTapUnlocker
          version="1.0.0"
          onUnlock={jest.fn()}
          isUnlocked={false}
        />
      );
      expect(screen.getByText('App Version')).toBeTruthy();
    });

    it('calls onUnlock after 7 taps', () => {
      const onUnlock = jest.fn();
      render(
        <VersionTapUnlocker
          version="1.0.0"
          onUnlock={onUnlock}
          isUnlocked={false}
        />
      );

      const tapArea = screen.getByTestId('version-tap-area');

      // Tap 7 times
      for (let i = 0; i < 7; i++) {
        fireEvent.press(tapArea);
      }

      expect(onUnlock).toHaveBeenCalledTimes(1);
    });

    it('shows countdown hint after 4 taps', () => {
      render(
        <VersionTapUnlocker
          version="1.0.0"
          onUnlock={jest.fn()}
          isUnlocked={false}
        />
      );

      const tapArea = screen.getByTestId('version-tap-area');

      // Tap 4 times
      for (let i = 0; i < 4; i++) {
        fireEvent.press(tapArea);
      }

      // Should show version with remaining taps hint
      expect(screen.getByText(/1\.0\.0/)).toBeTruthy();
      // The (3) hint is shown in a nested Text element
      expect(screen.getByText(/(3)/)).toBeTruthy();
    });

    it('does not respond to taps when already unlocked', () => {
      const onUnlock = jest.fn();
      render(
        <VersionTapUnlocker
          version="1.0.0"
          onUnlock={onUnlock}
          isUnlocked={true}
        />
      );

      const tapArea = screen.getByTestId('version-tap-area');

      // Tap 7 times
      for (let i = 0; i < 7; i++) {
        fireEvent.press(tapArea);
      }

      expect(onUnlock).not.toHaveBeenCalled();
    });

    it('resets tap count after timeout', () => {
      const onUnlock = jest.fn();
      render(
        <VersionTapUnlocker
          version="1.0.0"
          onUnlock={onUnlock}
          isUnlocked={false}
        />
      );

      const tapArea = screen.getByTestId('version-tap-area');

      // Tap 3 times
      for (let i = 0; i < 3; i++) {
        fireEvent.press(tapArea);
      }

      // Wait for timeout (3 seconds)
      act(() => {
        jest.advanceTimersByTime(3500);
      });

      // Tap 3 more times (should not trigger unlock since counter reset)
      for (let i = 0; i < 3; i++) {
        fireEvent.press(tapArea);
      }

      expect(onUnlock).not.toHaveBeenCalled();
    });
  });

  describe('DeveloperOptions Component', () => {
    it('renders nothing when developer mode is disabled', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: false,
      });
      expect(screen.queryByTestId('developer-options')).toBeNull();
    });

    it('renders when developer mode is enabled', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
      });
      expect(screen.getByTestId('developer-options')).toBeTruthy();
    });

    it('renders header with developer options title', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
      });
      // Title includes emoji
      expect(screen.getByText(/Developer Options/)).toBeTruthy();
    });

    it('renders simulator toggle', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
      });
      expect(screen.getByTestId('simulator-toggle')).toBeTruthy();
    });

    it('renders reset developer settings button', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
      });
      expect(screen.getByTestId('reset-developer-settings')).toBeTruthy();
    });

    it('shows server URL input when simulator is enabled', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
        simulated_mode_enabled: true,
      });
      expect(screen.getByTestId('server-url-input')).toBeTruthy();
    });

    it('shows force theta state picker when simulator is enabled', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
        simulated_mode_enabled: true,
      });
      expect(screen.getByTestId('force-state-auto')).toBeTruthy();
      expect(screen.getByTestId('force-state-low')).toBeTruthy();
      expect(screen.getByTestId('force-state-normal')).toBeTruthy();
      expect(screen.getByTestId('force-state-high')).toBeTruthy();
    });

    it('shows confirmation alert when reset button is pressed', () => {
      renderWithSettings(<DeveloperOptions />, {
        developer_mode_enabled: true,
      });

      fireEvent.press(screen.getByTestId('reset-developer-settings'));

      expect(Alert.alert).toHaveBeenCalledWith(
        'Reset Developer Settings',
        'This will disable developer mode and reset all developer settings. Continue?',
        expect.any(Array)
      );
    });
  });

  describe('Module Export', () => {
    it('exports DeveloperOptions from components index', () => {
      const { DeveloperOptions: ExportedComponent } = require('../src/components');
      expect(ExportedComponent).toBeDefined();
    });

    it('exports VersionTapUnlocker from components index', () => {
      const { VersionTapUnlocker: ExportedComponent } = require('../src/components');
      expect(ExportedComponent).toBeDefined();
    });
  });
});
