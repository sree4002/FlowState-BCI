import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Slider from '@react-native-community/slider';
import { Colors, Spacing, Typography, BorderRadius } from '../constants/theme';
import {
  AudioMixMode,
  AUDIO_MIX_MODES,
  getAudioMixModeLabel,
  getAudioMixModeDescription,
  getAudioMixModeAccessibilityLabel,
  formatMixingRatio,
  MIN_MIXING_RATIO,
  MAX_MIXING_RATIO,
  MIXING_RATIO_STEP,
} from '../services/audioMixingService';

/**
 * Audio status for display
 */
export interface AudioStatusDisplay {
  /** Whether the audio session is active */
  isActive: boolean;
  /** Whether other audio is currently playing */
  otherAudioPlaying: boolean;
}

/**
 * Props for AudioMixingControls component
 */
export interface AudioMixingControlsProps {
  /** Current audio mix mode */
  currentMode: AudioMixMode;
  /** Current mixing ratio (0.0 to 1.0) */
  currentRatio: number;
  /** Callback when mode changes */
  onModeChange: (mode: AudioMixMode) => void;
  /** Callback when mixing ratio changes */
  onRatioChange: (ratio: number) => void;
  /** Optional audio status for status indicator */
  audioStatus?: AudioStatusDisplay;
  /** Whether the controls are disabled */
  disabled?: boolean;
  /** Optional label for the component */
  label?: string;
  /** Test ID for testing */
  testID?: string;
}

/**
 * Gets the color for the current audio status
 */
export const getAudioStatusColor = (status?: AudioStatusDisplay): string => {
  if (!status) {
    return Colors.text.tertiary;
  }

  if (status.isActive) {
    return Colors.accent.success;
  }

  if (status.otherAudioPlaying) {
    return Colors.accent.warning;
  }

  return Colors.text.tertiary;
};

/**
 * Gets the label for the current audio status
 */
export const getAudioStatusLabel = (status?: AudioStatusDisplay): string => {
  if (!status) {
    return 'Unknown';
  }

  if (status.isActive) {
    return 'Active';
  }

  if (status.otherAudioPlaying) {
    return 'Other Audio Playing';
  }

  return 'Inactive';
};

/**
 * Gets the accessibility label for the audio status
 */
export const getAudioStatusAccessibilityLabel = (
  status?: AudioStatusDisplay
): string => {
  if (!status) {
    return 'Audio status unknown';
  }

  if (status.isActive) {
    return 'Audio session is active';
  }

  if (status.otherAudioPlaying) {
    return 'Other audio is currently playing';
  }

  return 'Audio session is inactive';
};

/**
 * Gets the button style for a mode button based on selection state
 */
export const getModeButtonStyle = (
  mode: AudioMixMode,
  currentMode: AudioMixMode,
  disabled: boolean
): object => {
  const isSelected = mode === currentMode;

  if (disabled) {
    return {
      backgroundColor: isSelected
        ? Colors.interactive.disabled
        : Colors.surface.secondary,
      borderColor: Colors.border.secondary,
    };
  }

  if (isSelected) {
    return {
      backgroundColor: Colors.primary.main,
      borderColor: Colors.primary.light,
    };
  }

  return {
    backgroundColor: Colors.surface.secondary,
    borderColor: Colors.border.primary,
  };
};

/**
 * Gets the text style for a mode button based on selection state
 */
export const getModeButtonTextStyle = (
  mode: AudioMixMode,
  currentMode: AudioMixMode,
  disabled: boolean
): object => {
  const isSelected = mode === currentMode;

  if (disabled) {
    return {
      color: Colors.text.disabled,
    };
  }

  if (isSelected) {
    return {
      color: Colors.text.primary,
    };
  }

  return {
    color: Colors.text.secondary,
  };
};

/**
 * AudioMixingControls component
 * Provides controls for audio mixing mode and ratio configuration.
 * Features a mode selector (Exclusive, Mix, Duck), a mixing ratio slider
 * (visible only in Mix mode), and a status indicator.
 *
 * @example
 * ```tsx
 * <AudioMixingControls
 *   currentMode={audioMode}
 *   currentRatio={mixingRatio}
 *   onModeChange={handleModeChange}
 *   onRatioChange={handleRatioChange}
 *   audioStatus={{ isActive: true, otherAudioPlaying: false }}
 *   testID="audio-mixing"
 * />
 * ```
 */
export const AudioMixingControls: React.FC<AudioMixingControlsProps> = ({
  currentMode,
  currentRatio,
  onModeChange,
  onRatioChange,
  audioStatus,
  disabled = false,
  label = 'Audio Mixing',
  testID = 'audio-mixing-controls',
}) => {
  /**
   * Handles mode button press
   */
  const handleModePress = (mode: AudioMixMode): void => {
    if (!disabled && mode !== currentMode) {
      onModeChange(mode);
    }
  };

  /**
   * Renders a mode selection button
   */
  const renderModeButton = (mode: AudioMixMode): React.ReactNode => {
    const isSelected = mode === currentMode;
    const buttonStyle = getModeButtonStyle(mode, currentMode, disabled);
    const textStyle = getModeButtonTextStyle(mode, currentMode, disabled);

    return (
      <TouchableOpacity
        key={mode}
        style={[styles.modeButton, buttonStyle]}
        onPress={() => handleModePress(mode)}
        disabled={disabled}
        testID={`${testID}-mode-${mode}`}
        accessibilityRole="button"
        accessibilityLabel={getAudioMixModeAccessibilityLabel(mode)}
        accessibilityState={{
          selected: isSelected,
          disabled,
        }}
        accessibilityHint={`Tap to select ${getAudioMixModeLabel(mode)} mode`}
      >
        <Text style={[styles.modeButtonText, textStyle]}>
          {getAudioMixModeLabel(mode)}
        </Text>
      </TouchableOpacity>
    );
  };

  /**
   * Gets the description for the current mode
   */
  const currentModeDescription = getAudioMixModeDescription(currentMode);

  /**
   * Whether to show the mixing ratio slider (only in mix mode)
   */
  const showRatioSlider = currentMode === 'mix';

  return (
    <View
      style={[styles.container, disabled && styles.containerDisabled]}
      testID={testID}
    >
      {/* Header with label and status */}
      <View style={styles.header}>
        <Text
          style={[styles.label, disabled && styles.textDisabled]}
          accessibilityRole="text"
        >
          {label}
        </Text>
        {audioStatus && (
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: getAudioStatusColor(audioStatus) },
              ]}
              testID={`${testID}-status-dot`}
            />
            <Text
              style={[styles.statusText, disabled && styles.textDisabled]}
              testID={`${testID}-status-text`}
              accessibilityLabel={getAudioStatusAccessibilityLabel(audioStatus)}
            >
              {getAudioStatusLabel(audioStatus)}
            </Text>
          </View>
        )}
      </View>

      {/* Mode selector buttons */}
      <View style={styles.modeSelector} testID={`${testID}-mode-selector`}>
        {AUDIO_MIX_MODES.map(renderModeButton)}
      </View>

      {/* Mode description */}
      <Text
        style={[styles.modeDescription, disabled && styles.textDisabled]}
        testID={`${testID}-mode-description`}
        accessibilityRole="text"
      >
        {currentModeDescription}
      </Text>

      {/* Mixing ratio slider (only visible in mix mode) */}
      {showRatioSlider && (
        <View style={styles.ratioContainer} testID={`${testID}-ratio-container`}>
          <View style={styles.ratioHeader}>
            <Text
              style={[styles.ratioLabel, disabled && styles.textDisabled]}
              accessibilityRole="text"
            >
              Mixing Ratio
            </Text>
            <Text
              style={[styles.ratioValue, disabled && styles.textDisabled]}
              testID={`${testID}-ratio-value`}
              accessibilityRole="text"
            >
              {formatMixingRatio(currentRatio)}
            </Text>
          </View>

          <Slider
            style={styles.slider}
            minimumValue={MIN_MIXING_RATIO}
            maximumValue={MAX_MIXING_RATIO}
            step={MIXING_RATIO_STEP}
            value={currentRatio}
            onValueChange={onRatioChange}
            minimumTrackTintColor={
              disabled ? Colors.interactive.disabled : Colors.primary.main
            }
            maximumTrackTintColor={Colors.border.primary}
            thumbTintColor={
              disabled ? Colors.interactive.disabled : Colors.primary.light
            }
            disabled={disabled}
            testID={`${testID}-ratio-slider`}
            accessibilityLabel="Mixing ratio slider"
            accessibilityRole="adjustable"
            accessibilityValue={{
              min: MIN_MIXING_RATIO * 100,
              max: MAX_MIXING_RATIO * 100,
              now: currentRatio * 100,
              text: `${Math.round(currentRatio * 100)} percent`,
            }}
            accessibilityState={{ disabled }}
          />

          <View style={styles.ratioRange}>
            <Text
              style={[styles.ratioRangeText, disabled && styles.textDisabled]}
            >
              App Only
            </Text>
            <Text
              style={[styles.ratioRangeText, disabled && styles.textDisabled]}
            >
              Equal Mix
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  containerDisabled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  label: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
  },
  statusText: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.sm,
  },
  modeSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  modeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  modeDescription: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  ratioContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  ratioHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  ratioLabel: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  ratioValue: {
    color: Colors.primary.main,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  ratioRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  ratioRangeText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.xs,
  },
  textDisabled: {
    color: Colors.text.disabled,
  },
});

export default AudioMixingControls;
