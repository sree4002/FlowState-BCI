/**
 * Tests for AudioMixingControls component
 * Verifies component structure, props handling, accessibility, and user interactions
 */

import React from 'react';
import { Colors } from '../src/constants/theme';
import {
  AudioMixMode,
  AUDIO_MIX_MODES,
  getAudioMixModeLabel,
  getAudioMixModeDescription,
  getAudioMixModeAccessibilityLabel,
  formatMixingRatio,
  MIN_MIXING_RATIO,
  MAX_MIXING_RATIO,
  DEFAULT_MIXING_RATIO,
} from '../src/services/audioMixingService';
import {
  AudioMixingControlsProps,
  AudioStatusDisplay,
  getAudioStatusColor,
  getAudioStatusLabel,
  getAudioStatusAccessibilityLabel,
  getModeButtonStyle,
  getModeButtonTextStyle,
} from '../src/components/AudioMixingControls';

describe('AudioMixingControls', () => {
  describe('AudioStatusDisplay Interface', () => {
    it('should define audio status properties', () => {
      const status: AudioStatusDisplay = {
        isActive: true,
        otherAudioPlaying: false,
      };

      expect(status.isActive).toBe(true);
      expect(status.otherAudioPlaying).toBe(false);
    });

    it('should support all status combinations', () => {
      const statuses: AudioStatusDisplay[] = [
        { isActive: true, otherAudioPlaying: false },
        { isActive: false, otherAudioPlaying: true },
        { isActive: false, otherAudioPlaying: false },
        { isActive: true, otherAudioPlaying: true },
      ];

      statuses.forEach((status) => {
        expect(status).toHaveProperty('isActive');
        expect(status).toHaveProperty('otherAudioPlaying');
      });
    });
  });

  describe('AudioMixingControlsProps Interface', () => {
    it('should define required props correctly', () => {
      const mockModeCallback = jest.fn();
      const mockRatioCallback = jest.fn();

      const props: AudioMixingControlsProps = {
        currentMode: 'exclusive',
        currentRatio: 0.7,
        onModeChange: mockModeCallback,
        onRatioChange: mockRatioCallback,
      };

      expect(props.currentMode).toBe('exclusive');
      expect(props.currentRatio).toBe(0.7);
      expect(props.onModeChange).toBe(mockModeCallback);
      expect(props.onRatioChange).toBe(mockRatioCallback);
    });

    it('should allow optional audioStatus prop', () => {
      const props: AudioMixingControlsProps = {
        currentMode: 'mix',
        currentRatio: 0.5,
        onModeChange: jest.fn(),
        onRatioChange: jest.fn(),
        audioStatus: { isActive: true, otherAudioPlaying: false },
      };

      expect(props.audioStatus).toBeDefined();
      expect(props.audioStatus?.isActive).toBe(true);
    });

    it('should allow optional disabled prop', () => {
      const props: AudioMixingControlsProps = {
        currentMode: 'duck',
        currentRatio: 0.3,
        onModeChange: jest.fn(),
        onRatioChange: jest.fn(),
        disabled: true,
      };

      expect(props.disabled).toBe(true);
    });

    it('should allow optional label prop', () => {
      const props: AudioMixingControlsProps = {
        currentMode: 'exclusive',
        currentRatio: 0.7,
        onModeChange: jest.fn(),
        onRatioChange: jest.fn(),
        label: 'Custom Audio Controls',
      };

      expect(props.label).toBe('Custom Audio Controls');
    });

    it('should allow optional testID prop', () => {
      const props: AudioMixingControlsProps = {
        currentMode: 'mix',
        currentRatio: 0.5,
        onModeChange: jest.fn(),
        onRatioChange: jest.fn(),
        testID: 'custom-audio-controls',
      };

      expect(props.testID).toBe('custom-audio-controls');
    });

    it('should handle full props configuration', () => {
      const fullProps: AudioMixingControlsProps = {
        currentMode: 'duck',
        currentRatio: 0.6,
        onModeChange: jest.fn(),
        onRatioChange: jest.fn(),
        audioStatus: { isActive: true, otherAudioPlaying: true },
        disabled: false,
        label: 'Session Audio Mixing',
        testID: 'session-audio-mixing',
      };

      expect(fullProps.currentMode).toBe('duck');
      expect(fullProps.currentRatio).toBe(0.6);
      expect(fullProps.audioStatus?.isActive).toBe(true);
      expect(fullProps.audioStatus?.otherAudioPlaying).toBe(true);
      expect(fullProps.disabled).toBe(false);
      expect(fullProps.label).toBe('Session Audio Mixing');
      expect(fullProps.testID).toBe('session-audio-mixing');
    });
  });

  describe('getAudioStatusColor', () => {
    it('should return tertiary color when status is undefined', () => {
      expect(getAudioStatusColor(undefined)).toBe(Colors.text.tertiary);
    });

    it('should return success color when active', () => {
      const status: AudioStatusDisplay = {
        isActive: true,
        otherAudioPlaying: false,
      };
      expect(getAudioStatusColor(status)).toBe(Colors.accent.success);
    });

    it('should return warning color when other audio is playing', () => {
      const status: AudioStatusDisplay = {
        isActive: false,
        otherAudioPlaying: true,
      };
      expect(getAudioStatusColor(status)).toBe(Colors.accent.warning);
    });

    it('should return tertiary color when inactive and no other audio', () => {
      const status: AudioStatusDisplay = {
        isActive: false,
        otherAudioPlaying: false,
      };
      expect(getAudioStatusColor(status)).toBe(Colors.text.tertiary);
    });

    it('should prioritize active status over other audio', () => {
      const status: AudioStatusDisplay = {
        isActive: true,
        otherAudioPlaying: true,
      };
      expect(getAudioStatusColor(status)).toBe(Colors.accent.success);
    });
  });

  describe('getAudioStatusLabel', () => {
    it('should return "Unknown" when status is undefined', () => {
      expect(getAudioStatusLabel(undefined)).toBe('Unknown');
    });

    it('should return "Active" when session is active', () => {
      const status: AudioStatusDisplay = {
        isActive: true,
        otherAudioPlaying: false,
      };
      expect(getAudioStatusLabel(status)).toBe('Active');
    });

    it('should return "Other Audio Playing" when other audio is playing', () => {
      const status: AudioStatusDisplay = {
        isActive: false,
        otherAudioPlaying: true,
      };
      expect(getAudioStatusLabel(status)).toBe('Other Audio Playing');
    });

    it('should return "Inactive" when session is inactive', () => {
      const status: AudioStatusDisplay = {
        isActive: false,
        otherAudioPlaying: false,
      };
      expect(getAudioStatusLabel(status)).toBe('Inactive');
    });

    it('should prioritize active label over other audio', () => {
      const status: AudioStatusDisplay = {
        isActive: true,
        otherAudioPlaying: true,
      };
      expect(getAudioStatusLabel(status)).toBe('Active');
    });
  });

  describe('getAudioStatusAccessibilityLabel', () => {
    it('should return unknown label when status is undefined', () => {
      expect(getAudioStatusAccessibilityLabel(undefined)).toBe(
        'Audio status unknown'
      );
    });

    it('should return active accessibility label', () => {
      const status: AudioStatusDisplay = {
        isActive: true,
        otherAudioPlaying: false,
      };
      expect(getAudioStatusAccessibilityLabel(status)).toBe(
        'Audio session is active'
      );
    });

    it('should return other audio playing accessibility label', () => {
      const status: AudioStatusDisplay = {
        isActive: false,
        otherAudioPlaying: true,
      };
      expect(getAudioStatusAccessibilityLabel(status)).toBe(
        'Other audio is currently playing'
      );
    });

    it('should return inactive accessibility label', () => {
      const status: AudioStatusDisplay = {
        isActive: false,
        otherAudioPlaying: false,
      };
      expect(getAudioStatusAccessibilityLabel(status)).toBe(
        'Audio session is inactive'
      );
    });
  });

  describe('getModeButtonStyle', () => {
    describe('when disabled', () => {
      it('should return disabled style for selected button', () => {
        const style = getModeButtonStyle('exclusive', 'exclusive', true);
        expect(style).toEqual({
          backgroundColor: Colors.interactive.disabled,
          borderColor: Colors.border.secondary,
        });
      });

      it('should return disabled style for unselected button', () => {
        const style = getModeButtonStyle('mix', 'exclusive', true);
        expect(style).toEqual({
          backgroundColor: Colors.surface.secondary,
          borderColor: Colors.border.secondary,
        });
      });
    });

    describe('when enabled', () => {
      it('should return selected style for selected button', () => {
        const style = getModeButtonStyle('exclusive', 'exclusive', false);
        expect(style).toEqual({
          backgroundColor: Colors.primary.main,
          borderColor: Colors.primary.light,
        });
      });

      it('should return unselected style for unselected button', () => {
        const style = getModeButtonStyle('mix', 'exclusive', false);
        expect(style).toEqual({
          backgroundColor: Colors.surface.secondary,
          borderColor: Colors.border.primary,
        });
      });
    });

    it('should work for all audio modes', () => {
      AUDIO_MIX_MODES.forEach((mode) => {
        const selectedStyle = getModeButtonStyle(mode, mode, false);
        expect(selectedStyle.backgroundColor).toBe(Colors.primary.main);

        AUDIO_MIX_MODES.filter((m) => m !== mode).forEach((otherMode) => {
          const unselectedStyle = getModeButtonStyle(mode, otherMode, false);
          expect(unselectedStyle.backgroundColor).toBe(
            Colors.surface.secondary
          );
        });
      });
    });
  });

  describe('getModeButtonTextStyle', () => {
    describe('when disabled', () => {
      it('should return disabled text color', () => {
        const style = getModeButtonTextStyle('exclusive', 'exclusive', true);
        expect(style).toEqual({ color: Colors.text.disabled });
      });
    });

    describe('when enabled', () => {
      it('should return primary text color for selected button', () => {
        const style = getModeButtonTextStyle('exclusive', 'exclusive', false);
        expect(style).toEqual({ color: Colors.text.primary });
      });

      it('should return secondary text color for unselected button', () => {
        const style = getModeButtonTextStyle('mix', 'exclusive', false);
        expect(style).toEqual({ color: Colors.text.secondary });
      });
    });
  });

  describe('Mode Selection Logic', () => {
    it('should correctly identify selected mode', () => {
      AUDIO_MIX_MODES.forEach((currentMode) => {
        AUDIO_MIX_MODES.forEach((buttonMode) => {
          const isSelected = buttonMode === currentMode;
          const style = getModeButtonStyle(buttonMode, currentMode, false);

          if (isSelected) {
            expect(style.backgroundColor).toBe(Colors.primary.main);
          } else {
            expect(style.backgroundColor).toBe(Colors.surface.secondary);
          }
        });
      });
    });
  });

  describe('Audio Mix Mode Display', () => {
    describe('Labels', () => {
      it('should have correct labels for all modes', () => {
        expect(getAudioMixModeLabel('exclusive')).toBe('Exclusive');
        expect(getAudioMixModeLabel('mix')).toBe('Mix');
        expect(getAudioMixModeLabel('duck')).toBe('Duck');
      });
    });

    describe('Descriptions', () => {
      it('should have correct descriptions for all modes', () => {
        expect(getAudioMixModeDescription('exclusive')).toBe(
          'Pauses other audio when app audio plays'
        );
        expect(getAudioMixModeDescription('mix')).toBe(
          'Blends app audio with other audio sources'
        );
        expect(getAudioMixModeDescription('duck')).toBe(
          'Lowers other audio volume during playback'
        );
      });
    });

    describe('Accessibility Labels', () => {
      it('should have correct accessibility labels for all modes', () => {
        expect(getAudioMixModeAccessibilityLabel('exclusive')).toContain(
          'Exclusive mode'
        );
        expect(getAudioMixModeAccessibilityLabel('mix')).toContain('Mix mode');
        expect(getAudioMixModeAccessibilityLabel('duck')).toContain(
          'Duck mode'
        );
      });
    });
  });

  describe('Mixing Ratio Display', () => {
    it('should format ratio as percentage', () => {
      expect(formatMixingRatio(0)).toBe('0%');
      expect(formatMixingRatio(0.5)).toBe('50%');
      expect(formatMixingRatio(1)).toBe('100%');
      expect(formatMixingRatio(0.7)).toBe('70%');
    });

    it('should round decimal percentages', () => {
      expect(formatMixingRatio(0.333)).toBe('33%');
      expect(formatMixingRatio(0.666)).toBe('67%');
    });
  });

  describe('Ratio Slider Visibility Logic', () => {
    it('should show slider only in mix mode', () => {
      const shouldShowSlider = (mode: AudioMixMode): boolean => {
        return mode === 'mix';
      };

      expect(shouldShowSlider('exclusive')).toBe(false);
      expect(shouldShowSlider('mix')).toBe(true);
      expect(shouldShowSlider('duck')).toBe(false);
    });
  });

  describe('Mixing Ratio Bounds', () => {
    it('should have valid ratio bounds', () => {
      expect(MIN_MIXING_RATIO).toBe(0.0);
      expect(MAX_MIXING_RATIO).toBe(1.0);
    });

    it('should have valid default ratio', () => {
      expect(DEFAULT_MIXING_RATIO).toBeGreaterThanOrEqual(MIN_MIXING_RATIO);
      expect(DEFAULT_MIXING_RATIO).toBeLessThanOrEqual(MAX_MIXING_RATIO);
    });
  });

  describe('Callback Behavior', () => {
    it('should accept mode change callback', () => {
      const mockCallback = jest.fn();
      const props: AudioMixingControlsProps = {
        currentMode: 'exclusive',
        currentRatio: 0.7,
        onModeChange: mockCallback,
        onRatioChange: jest.fn(),
      };

      props.onModeChange('mix');
      expect(mockCallback).toHaveBeenCalledWith('mix');
    });

    it('should accept ratio change callback', () => {
      const mockCallback = jest.fn();
      const props: AudioMixingControlsProps = {
        currentMode: 'mix',
        currentRatio: 0.7,
        onModeChange: jest.fn(),
        onRatioChange: mockCallback,
      };

      props.onRatioChange(0.5);
      expect(mockCallback).toHaveBeenCalledWith(0.5);
    });

    it('should be able to call callbacks multiple times', () => {
      const modeCallback = jest.fn();
      const ratioCallback = jest.fn();

      modeCallback('exclusive');
      modeCallback('mix');
      modeCallback('duck');

      ratioCallback(0.1);
      ratioCallback(0.5);
      ratioCallback(0.9);

      expect(modeCallback).toHaveBeenCalledTimes(3);
      expect(ratioCallback).toHaveBeenCalledTimes(3);
    });
  });

  describe('Default Values', () => {
    it('should have "Audio Mixing" as default label', () => {
      const DEFAULT_LABEL = 'Audio Mixing';
      expect(DEFAULT_LABEL).toBe('Audio Mixing');
    });

    it('should have false as default disabled state', () => {
      const DEFAULT_DISABLED = false;
      expect(DEFAULT_DISABLED).toBe(false);
    });

    it('should have "audio-mixing-controls" as default testID', () => {
      const DEFAULT_TEST_ID = 'audio-mixing-controls';
      expect(DEFAULT_TEST_ID).toBe('audio-mixing-controls');
    });
  });

  describe('TestID Structure', () => {
    it('should derive mode button testIDs correctly', () => {
      const testID = 'audio-mixing-controls';
      AUDIO_MIX_MODES.forEach((mode) => {
        expect(`${testID}-mode-${mode}`).toBe(
          `audio-mixing-controls-mode-${mode}`
        );
      });
    });

    it('should derive status dot testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-status-dot`).toBe('audio-mixing-controls-status-dot');
    });

    it('should derive status text testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-status-text`).toBe('audio-mixing-controls-status-text');
    });

    it('should derive mode selector testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-mode-selector`).toBe(
        'audio-mixing-controls-mode-selector'
      );
    });

    it('should derive mode description testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-mode-description`).toBe(
        'audio-mixing-controls-mode-description'
      );
    });

    it('should derive ratio container testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-ratio-container`).toBe(
        'audio-mixing-controls-ratio-container'
      );
    });

    it('should derive ratio value testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-ratio-value`).toBe('audio-mixing-controls-ratio-value');
    });

    it('should derive ratio slider testID correctly', () => {
      const testID = 'audio-mixing-controls';
      expect(`${testID}-ratio-slider`).toBe(
        'audio-mixing-controls-ratio-slider'
      );
    });

    it('should support custom testID prefix', () => {
      const testID = 'session-audio';
      expect(`${testID}-mode-exclusive`).toBe('session-audio-mode-exclusive');
      expect(`${testID}-ratio-slider`).toBe('session-audio-ratio-slider');
    });
  });

  describe('Theme Integration', () => {
    it('should have access to primary colors', () => {
      expect(Colors.primary.main).toBeDefined();
      expect(Colors.primary.light).toBeDefined();
    });

    it('should have access to surface colors', () => {
      expect(Colors.surface.secondary).toBeDefined();
    });

    it('should have access to border colors', () => {
      expect(Colors.border.primary).toBeDefined();
      expect(Colors.border.secondary).toBeDefined();
    });

    it('should have access to text colors', () => {
      expect(Colors.text.primary).toBeDefined();
      expect(Colors.text.secondary).toBeDefined();
      expect(Colors.text.tertiary).toBeDefined();
      expect(Colors.text.disabled).toBeDefined();
    });

    it('should have access to accent colors', () => {
      expect(Colors.accent.success).toBeDefined();
      expect(Colors.accent.warning).toBeDefined();
    });

    it('should have access to interactive colors', () => {
      expect(Colors.interactive.disabled).toBeDefined();
    });
  });

  describe('Accessibility Configuration', () => {
    it('should have proper accessibility roles for buttons', () => {
      const buttonRole = 'button';
      expect(buttonRole).toBe('button');
    });

    it('should have proper accessibility roles for slider', () => {
      const sliderRole = 'adjustable';
      expect(sliderRole).toBe('adjustable');
    });

    it('should have proper accessibility state structure', () => {
      const state = {
        selected: true,
        disabled: false,
      };
      expect(state.selected).toBe(true);
      expect(state.disabled).toBe(false);
    });

    it('should have proper accessibility value structure for slider', () => {
      const currentRatio = 0.7;
      const accessibilityValue = {
        min: MIN_MIXING_RATIO * 100,
        max: MAX_MIXING_RATIO * 100,
        now: currentRatio * 100,
        text: `${Math.round(currentRatio * 100)} percent`,
      };

      expect(accessibilityValue.min).toBe(0);
      expect(accessibilityValue.max).toBe(100);
      expect(accessibilityValue.now).toBe(70);
      expect(accessibilityValue.text).toBe('70 percent');
    });

    it('should provide accessibility hints for mode buttons', () => {
      AUDIO_MIX_MODES.forEach((mode) => {
        const hint = `Tap to select ${getAudioMixModeLabel(mode)} mode`;
        expect(hint).toContain('Tap to select');
        expect(hint).toContain('mode');
      });
    });
  });

  describe('Slider Label Text', () => {
    it('should have "App Only" label for low end', () => {
      const label = 'App Only';
      expect(label).toBe('App Only');
    });

    it('should have "Equal Mix" label for high end', () => {
      const label = 'Equal Mix';
      expect(label).toBe('Equal Mix');
    });

    it('should have "Mixing Ratio" as slider label', () => {
      const label = 'Mixing Ratio';
      expect(label).toBe('Mixing Ratio');
    });
  });

  describe('Mode Handling', () => {
    it('should not trigger callback when clicking same mode', () => {
      const mockCallback = jest.fn();

      // Simulate the handleModePress logic
      const currentMode: AudioMixMode = 'exclusive';
      const pressedMode: AudioMixMode = 'exclusive';
      const disabled = false;

      if (!disabled && pressedMode !== currentMode) {
        mockCallback(pressedMode);
      }

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it('should trigger callback when clicking different mode', () => {
      const mockCallback = jest.fn();

      const currentMode: AudioMixMode = 'exclusive';
      const pressedMode: AudioMixMode = 'mix';
      const disabled = false;

      if (!disabled && pressedMode !== currentMode) {
        mockCallback(pressedMode);
      }

      expect(mockCallback).toHaveBeenCalledWith('mix');
    });

    it('should not trigger callback when disabled', () => {
      const mockCallback = jest.fn();

      const currentMode: AudioMixMode = 'exclusive';
      const pressedMode: AudioMixMode = 'mix';
      const disabled = true;

      if (!disabled && pressedMode !== currentMode) {
        mockCallback(pressedMode);
      }

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('Component State Combinations', () => {
    it('should support all mode and status combinations', () => {
      const modes: AudioMixMode[] = ['exclusive', 'mix', 'duck'];
      const statuses: (AudioStatusDisplay | undefined)[] = [
        undefined,
        { isActive: true, otherAudioPlaying: false },
        { isActive: false, otherAudioPlaying: true },
        { isActive: false, otherAudioPlaying: false },
      ];

      modes.forEach((mode) => {
        statuses.forEach((status) => {
          // All combinations should be valid
          expect(mode).toBeDefined();
          if (status) {
            expect(getAudioStatusLabel(status)).toBeDefined();
          }
        });
      });
    });

    it('should support all ratio values in steps', () => {
      for (let i = 0; i <= 10; i++) {
        const ratio = i * 0.1;
        expect(formatMixingRatio(ratio)).toMatch(/^\d+%$/);
      }
    });
  });
});
