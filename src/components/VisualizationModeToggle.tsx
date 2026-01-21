import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../constants/theme';
import { VisualizationMode } from '../types';

export interface VisualizationModeToggleProps {
  /** Currently selected visualization mode */
  selectedMode: VisualizationMode;
  /** Callback when mode is changed */
  onModeChange: (mode: VisualizationMode) => void;
  /** Optional test ID for testing */
  testID?: string;
}

interface ModeOption {
  mode: VisualizationMode;
  label: string;
  accessibilityHint: string;
}

const MODE_OPTIONS: ModeOption[] = [
  {
    mode: 'numeric',
    label: 'Numeric',
    accessibilityHint: 'Display theta values as numbers',
  },
  {
    mode: 'gauge',
    label: 'Gauge',
    accessibilityHint: 'Display theta values as a gauge meter',
  },
  {
    mode: 'chart',
    label: 'Chart',
    accessibilityHint: 'Display theta values as a real-time chart',
  },
];

/**
 * VisualizationModeToggle - A segmented control for switching between
 * visualization modes (Numeric, Gauge, Chart)
 */
export const VisualizationModeToggle: React.FC<VisualizationModeToggleProps> = ({
  selectedMode,
  onModeChange,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>Visualization Mode</Text>
      <View style={styles.toggleContainer}>
        {MODE_OPTIONS.map((option, index) => {
          const isSelected = selectedMode === option.mode;
          const isFirst = index === 0;
          const isLast = index === MODE_OPTIONS.length - 1;

          return (
            <TouchableOpacity
              key={option.mode}
              style={[
                styles.toggleOption,
                isSelected && styles.toggleOptionSelected,
                isFirst && styles.toggleOptionFirst,
                isLast && styles.toggleOptionLast,
              ]}
              onPress={() => onModeChange(option.mode)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${option.label} visualization mode`}
              accessibilityHint={option.accessibilityHint}
              accessibilityState={{ selected: isSelected }}
              testID={testID ? `${testID}-${option.mode}` : undefined}
            >
              <Text
                style={[
                  styles.toggleText,
                  isSelected && styles.toggleTextSelected,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadows.md,
  },
  label: {
    color: Colors.text.secondary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    marginBottom: Spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  toggleOptionSelected: {
    backgroundColor: Colors.primary.main,
    ...Shadows.sm,
  },
  toggleOptionFirst: {
    borderTopLeftRadius: BorderRadius.md,
    borderBottomLeftRadius: BorderRadius.md,
  },
  toggleOptionLast: {
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },
  toggleText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  toggleTextSelected: {
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default VisualizationModeToggle;
