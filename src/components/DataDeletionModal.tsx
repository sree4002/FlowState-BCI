import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

/**
 * Data type options for deletion
 */
export type DataDeletionType = 'sessions' | 'baselines' | 'all';

/**
 * Props for DataDeletionModal component
 */
export interface DataDeletionModalProps {
  /** Whether the modal is visible */
  visible: boolean;
  /** Callback when user confirms deletion */
  onConfirm: () => void;
  /** Callback when user cancels deletion */
  onCancel: () => void;
  /** Type of data to be deleted */
  dataType: DataDeletionType;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Gets the title for the deletion modal based on data type
 */
export const getModalTitle = (dataType: DataDeletionType): string => {
  switch (dataType) {
    case 'sessions':
      return 'Clear All Sessions';
    case 'baselines':
      return 'Clear All Baselines';
    case 'all':
      return 'Clear All Data';
    default:
      return 'Clear Data';
  }
};

/**
 * Gets the warning message for the deletion modal based on data type
 */
export const getWarningMessage = (dataType: DataDeletionType): string => {
  switch (dataType) {
    case 'sessions':
      return 'This will permanently delete all your session history, including theta scores, ratings, and notes.';
    case 'baselines':
      return 'This will permanently delete all your calibration baselines. You will need to recalibrate before your next session.';
    case 'all':
      return 'This will permanently delete all your data, including sessions, baselines, and settings. Your app will be reset to its initial state.';
    default:
      return 'This will permanently delete your data.';
  }
};

/**
 * Gets the accessibility label for the confirm button
 */
export const getConfirmAccessibilityLabel = (
  dataType: DataDeletionType
): string => {
  switch (dataType) {
    case 'sessions':
      return 'Delete all sessions';
    case 'baselines':
      return 'Delete all baselines';
    case 'all':
      return 'Delete all data';
    default:
      return 'Delete data';
  }
};

/**
 * Gets the accessibility hint for the confirm button
 */
export const getConfirmAccessibilityHint = (
  dataType: DataDeletionType
): string => {
  switch (dataType) {
    case 'sessions':
      return 'Double tap to permanently delete all session data';
    case 'baselines':
      return 'Double tap to permanently delete all baseline calibrations';
    case 'all':
      return 'Double tap to permanently delete all app data';
    default:
      return 'Double tap to permanently delete data';
  }
};

/**
 * Gets the checkbox label text
 */
export const getCheckboxLabel = (): string => {
  return 'I understand this cannot be undone';
};

/**
 * DataDeletionModal - Modal component for confirming data deletion
 *
 * Features:
 * - Warning icon and explanatory text about data deletion
 * - Checkbox confirmation to prevent accidental deletion
 * - Delete button disabled until checkbox is checked
 * - Smooth entrance/exit animations
 * - Accessible with proper labels and hints
 * - Supports different data types (sessions, baselines, all)
 */
export const DataDeletionModal: React.FC<DataDeletionModalProps> = ({
  visible,
  onConfirm,
  onCancel,
  dataType,
  testID = 'data-deletion-modal',
}) => {
  const [isChecked, setIsChecked] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Reset checkbox when modal closes
  useEffect(() => {
    if (!visible) {
      setIsChecked(false);
    }
  }, [visible]);

  // Animate modal entrance/exit
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, fadeAnim, slideAnim, scaleAnim]);

  const handleCheckboxToggle = useCallback(() => {
    setIsChecked((prev) => !prev);
  }, []);

  const handleConfirm = useCallback(() => {
    if (isChecked) {
      onConfirm();
    }
  }, [isChecked, onConfirm]);

  const handleCancel = useCallback(() => {
    onCancel();
  }, [onCancel]);

  const title = getModalTitle(dataType);
  const warningMessage = getWarningMessage(dataType);
  const confirmAccessibilityLabel = getConfirmAccessibilityLabel(dataType);
  const confirmAccessibilityHint = getConfirmAccessibilityHint(dataType);
  const checkboxLabel = getCheckboxLabel();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleCancel}
      testID={testID}
    >
      <View style={styles.centeredView} testID={`${testID}-centered-view`}>
        <Animated.View
          style={[styles.overlay, { opacity: fadeAnim }]}
          testID={`${testID}-overlay`}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={handleCancel}
            activeOpacity={1}
            testID={`${testID}-overlay-touchable`}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
            },
          ]}
          testID={`${testID}-modal-container`}
        >
          {/* Warning Icon */}
          <View style={styles.iconContainer} testID={`${testID}-icon-container`}>
            <Text style={styles.warningIcon} testID={`${testID}-warning-icon`}>
              !
            </Text>
          </View>

          {/* Title */}
          <Text style={styles.title} testID={`${testID}-title`}>
            {title}
          </Text>

          {/* Warning Message */}
          <Text style={styles.warningMessage} testID={`${testID}-warning-message`}>
            {warningMessage}
          </Text>

          {/* Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={handleCheckboxToggle}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isChecked }}
            accessibilityLabel={checkboxLabel}
            accessibilityHint="Tap to confirm you understand this action cannot be undone"
            testID={`${testID}-checkbox`}
          >
            <View
              style={[styles.checkbox, isChecked && styles.checkboxChecked]}
              testID={`${testID}-checkbox-box`}
            >
              {isChecked && (
                <Text
                  style={styles.checkmark}
                  testID={`${testID}-checkbox-checkmark`}
                >
                  ✓
                </Text>
              )}
            </View>
            <Text style={styles.checkboxLabel} testID={`${testID}-checkbox-label`}>
              {checkboxLabel}
            </Text>
          </TouchableOpacity>

          {/* Buttons */}
          <View style={styles.buttonContainer} testID={`${testID}-button-container`}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              accessibilityHint="Double tap to cancel and close the dialog"
              testID={`${testID}-cancel-button`}
            >
              <Text
                style={styles.cancelButtonText}
                testID={`${testID}-cancel-button-text`}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.deleteButton,
                !isChecked && styles.deleteButtonDisabled,
              ]}
              onPress={handleConfirm}
              disabled={!isChecked}
              accessibilityRole="button"
              accessibilityLabel={confirmAccessibilityLabel}
              accessibilityHint={confirmAccessibilityHint}
              accessibilityState={{ disabled: !isChecked }}
              testID={`${testID}-delete-button`}
            >
              <Text
                style={[
                  styles.deleteButtonText,
                  !isChecked && styles.deleteButtonTextDisabled,
                ]}
                testID={`${testID}-delete-button-text`}
              >
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const { width: screenWidth } = Dimensions.get('window');
const modalWidth = Math.min(screenWidth - Spacing.lg * 2, 360);

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay.dark,
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    width: modalWidth,
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    ...Shadows.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.status.red,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  warningIcon: {
    fontSize: 36,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  warningMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
    marginBottom: Spacing.lg,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.surface.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  checkboxChecked: {
    backgroundColor: Colors.accent.error,
    borderColor: Colors.accent.error,
  },
  checkmark: {
    fontSize: 16,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
  },
  buttonContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: Spacing.sm,
  },
  button: {
    flex: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  cancelButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  deleteButton: {
    backgroundColor: Colors.accent.error,
    ...Shadows.sm,
  },
  deleteButtonDisabled: {
    backgroundColor: Colors.interactive.disabled,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  deleteButtonTextDisabled: {
    color: Colors.text.disabled,
  },
});

export default DataDeletionModal;
