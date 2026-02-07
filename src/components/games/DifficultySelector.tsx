/**
 * DifficultySelector Component
 * Allows user to select fixed difficulty or enable adaptive mode
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';

export interface DifficultySelectorProps {
  selectedDifficulty: number | undefined; // undefined = adaptive
  onDifficultyChange: (difficulty: number | undefined) => void;
  disabled?: boolean;
  testID?: string;
}

const DIFFICULTY_LEVELS = [
  { value: undefined, label: 'Adaptive' },
  { value: 0, label: 'Very Easy' },
  { value: 2, label: 'Easy' },
  { value: 5, label: 'Medium' },
  { value: 7, label: 'Hard' },
  { value: 10, label: 'Expert' },
];

export const DifficultySelector: React.FC<DifficultySelectorProps> = ({
  selectedDifficulty,
  onDifficultyChange,
  disabled = false,
  testID,
}) => {
  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>Difficulty</Text>
      <View style={styles.optionsContainer}>
        {DIFFICULTY_LEVELS.map((level) => {
          const isSelected = selectedDifficulty === level.value;
          return (
            <TouchableOpacity
              key={level.label}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                disabled && styles.optionDisabled,
              ]}
              onPress={() => onDifficultyChange(level.value)}
              disabled={disabled}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`${level.label} difficulty`}
              accessibilityState={{ selected: isSelected, disabled }}
            >
              <Text
                style={[
                  styles.optionText,
                  isSelected && styles.optionTextSelected,
                ]}
              >
                {level.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {selectedDifficulty === undefined && (
        <Text style={styles.hint}>
          Adaptive mode adjusts difficulty based on your performance
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.xs,
  },
  option: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    margin: Spacing.xs,
  },
  optionSelected: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  optionDisabled: {
    opacity: 0.5,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  optionTextSelected: {
    color: Colors.accent.primary,
  },
  hint: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
    marginTop: Spacing.sm,
    fontStyle: 'italic',
  },
});
