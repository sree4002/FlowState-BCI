/**
 * Export Progress Modal Component for FlowState BCI
 * Displays export progress with a modal overlay, progress bar, and cancel option
 */

import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  DimensionValue,
} from 'react-native';

/**
 * Props for the ExportProgressModal component
 */
export interface ExportProgressModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Current progress value (0-100) */
  progress: number;
  /** Current operation message (e.g., "Exporting sessions...") */
  message: string;
  /** Callback when cancel button is pressed */
  onCancel: () => void;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Clamps a value between min and max
 */
export const clampProgress = (value: number): number => {
  return Math.max(0, Math.min(100, value));
};

/**
 * Formats progress value for display
 */
export const formatProgress = (progress: number): string => {
  const clamped = clampProgress(progress);
  return `${Math.round(clamped)}%`;
};

/**
 * Gets accessibility label for the progress bar
 */
export const getProgressAccessibilityLabel = (
  progress: number,
  message: string
): string => {
  const formattedProgress = formatProgress(progress);
  return `${message} ${formattedProgress} complete`;
};

/**
 * Calculates progress bar width percentage
 */
export const getProgressBarWidth = (progress: number): DimensionValue => {
  const clamped = clampProgress(progress);
  return `${clamped}%` as DimensionValue;
};

/**
 * Gets the progress bar color based on progress value
 * Blue for in-progress, green when complete
 */
export const getProgressColor = (progress: number): string => {
  if (progress >= 100) {
    return '#4CAF50'; // Green for complete
  }
  return '#2196F3'; // Blue for in-progress
};

const { width: screenWidth } = Dimensions.get('window');

/**
 * ExportProgressModal Component
 *
 * A modal overlay that displays export progress with:
 * - Progress bar visualization
 * - Current operation text
 * - Progress percentage display
 * - Cancel button
 */
export const ExportProgressModal: React.FC<ExportProgressModalProps> = ({
  visible,
  progress,
  message,
  onCancel,
  testID = 'export-progress-modal',
}) => {
  const clampedProgress = clampProgress(progress);
  const progressWidth = getProgressBarWidth(clampedProgress);
  const progressColor = getProgressColor(clampedProgress);
  const formattedProgress = formatProgress(clampedProgress);
  const accessibilityLabel = getProgressAccessibilityLabel(
    clampedProgress,
    message
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onCancel}
      testID={testID}
    >
      <View
        style={styles.overlay}
        testID={`${testID}-overlay`}
        accessibilityRole="none"
      >
        <View
          style={styles.container}
          testID={`${testID}-container`}
          accessibilityRole="alert"
          accessibilityLabel={accessibilityLabel}
        >
          {/* Title */}
          <Text
            style={styles.title}
            testID={`${testID}-title`}
            accessibilityRole="header"
          >
            Exporting Data
          </Text>

          {/* Message */}
          <Text
            style={styles.message}
            testID={`${testID}-message`}
            accessibilityLabel={message}
          >
            {message}
          </Text>

          {/* Progress Bar Container */}
          <View
            style={styles.progressBarContainer}
            testID={`${testID}-progress-bar-container`}
            accessibilityRole="progressbar"
            accessibilityValue={{
              min: 0,
              max: 100,
              now: clampedProgress,
            }}
          >
            {/* Progress Bar Fill */}
            <View
              style={[
                styles.progressBarFill,
                {
                  width: progressWidth,
                  backgroundColor: progressColor,
                },
              ]}
              testID={`${testID}-progress-bar-fill`}
            />
          </View>

          {/* Progress Percentage */}
          <Text
            style={styles.progressText}
            testID={`${testID}-progress-text`}
            accessibilityLabel={`${formattedProgress} complete`}
          >
            {formattedProgress}
          </Text>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onCancel}
            testID={`${testID}-cancel-button`}
            accessibilityRole="button"
            accessibilityLabel="Cancel export"
            accessibilityHint="Cancels the current export operation"
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: Math.min(screenWidth - 48, 320),
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#EF4444',
  },
});

export default ExportProgressModal;
