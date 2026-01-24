/**
 * DebugOverlay Component
 * Floating debug overlay for active sessions
 * Accessed via triple-tap or shake gesture
 */

import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
  Platform,
  Dimensions,
} from 'react-native';
import { Colors, Spacing, BorderRadius, Typography } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Props for DebugOverlay
 */
export interface DebugOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Callback when overlay is closed */
  onClose: () => void;
  /** Current theta z-score */
  thetaZScore: number;
  /** Signal quality percentage (0-100) */
  signalQuality: number;
  /** Whether using simulated data */
  isSimulated: boolean;
  /** Device connection status */
  connectionStatus: 'connected' | 'disconnected' | 'connecting';
  /** Test ID for testing */
  testID?: string;
}

/**
 * Force Theta State Picker for debug overlay
 */
const ForceStatePicker: React.FC<{
  value: 'auto' | 'low' | 'normal' | 'high';
  onChange: (value: 'auto' | 'low' | 'normal' | 'high') => void;
}> = ({ value, onChange }) => {
  const states: Array<{ key: 'auto' | 'low' | 'normal' | 'high'; label: string; color: string }> = [
    { key: 'auto', label: 'AUTO', color: Colors.text.secondary },
    { key: 'low', label: 'LOW', color: Colors.status.red },
    { key: 'normal', label: 'NORMAL', color: Colors.status.green },
    { key: 'high', label: 'HIGH', color: Colors.status.blue },
  ];

  return (
    <View style={styles.statePickerContainer}>
      {states.map((state) => (
        <TouchableOpacity
          key={state.key}
          style={[
            styles.stateButton,
            value === state.key && styles.stateButtonActive,
            value === state.key && { borderColor: state.color },
          ]}
          onPress={() => onChange(state.key)}
          testID={`debug-force-state-${state.key}`}
        >
          <Text
            style={[
              styles.stateButtonText,
              value === state.key && { color: state.color },
            ]}
          >
            {state.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

/**
 * Debug stat row component
 */
const DebugStatRow: React.FC<{
  label: string;
  value: string;
  valueColor?: string;
}> = ({ label, value, valueColor }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>
      {value}
    </Text>
  </View>
);

/**
 * Get color based on signal quality
 */
export const getSignalQualityColor = (quality: number): string => {
  if (quality >= 80) return Colors.status.green;
  if (quality >= 50) return Colors.status.yellow;
  return Colors.status.red;
};

/**
 * Get color based on theta z-score
 */
export const getThetaZScoreColor = (zScore: number): string => {
  if (zScore >= 1.5) return Colors.status.blue;
  if (zScore >= 0.5) return Colors.status.green;
  if (zScore >= -0.5) return Colors.status.yellow;
  return Colors.status.red;
};

/**
 * Get connection status display info
 */
export const getConnectionStatusInfo = (
  status: 'connected' | 'disconnected' | 'connecting',
  isSimulated: boolean
): { label: string; color: string } => {
  if (isSimulated) {
    return { label: 'SIMULATED', color: Colors.status.yellow };
  }
  switch (status) {
    case 'connected':
      return { label: 'LIVE', color: Colors.status.green };
    case 'connecting':
      return { label: 'CONNECTING...', color: Colors.status.yellow };
    case 'disconnected':
    default:
      return { label: 'DISCONNECTED', color: Colors.status.red };
  }
};

/**
 * DebugOverlay Component
 * Shows debug information during active session
 */
export const DebugOverlay: React.FC<DebugOverlayProps> = ({
  visible,
  onClose,
  thetaZScore,
  signalQuality,
  isSimulated,
  connectionStatus,
  testID = 'debug-overlay',
}) => {
  const { settings, updateSettings } = useSettings();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
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
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.9);
    }
  }, [visible, fadeAnim, scaleAnim]);

  const handleForceStateChange = useCallback(
    (state: 'auto' | 'low' | 'normal' | 'high') => {
      updateSettings({ force_theta_state: state });
    },
    [updateSettings]
  );

  const connectionInfo = getConnectionStatusInfo(connectionStatus, isSimulated);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      testID={testID}
    >
      <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]}>
        <TouchableOpacity
          style={styles.backdropTouch}
          activeOpacity={1}
          onPress={onClose}
        />
        <Animated.View
          style={[
            styles.container,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Debug Info</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeButton}
              testID="debug-overlay-close"
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsContainer}>
            <DebugStatRow
              label="Theta Z-Score"
              value={thetaZScore.toFixed(2)}
              valueColor={getThetaZScoreColor(thetaZScore)}
            />
            <DebugStatRow
              label="Signal Quality"
              value={`${Math.round(signalQuality)}%`}
              valueColor={getSignalQualityColor(signalQuality)}
            />
            <DebugStatRow
              label="Connection"
              value={connectionInfo.label}
              valueColor={connectionInfo.color}
            />
          </View>

          {/* Force Theta State (only when simulated) */}
          {settings.simulated_mode_enabled && (
            <View style={styles.forceStateSection}>
              <Text style={styles.sectionLabel}>Force Theta State</Text>
              <ForceStatePicker
                value={settings.force_theta_state}
                onChange={handleForceStateChange}
              />
            </View>
          )}

          {/* Footer hint */}
          <Text style={styles.footerHint}>
            Triple-tap or shake to toggle
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

/**
 * Props for DebugBar
 */
export interface DebugBarProps {
  /** Whether the bar is visible */
  visible: boolean;
  /** Current theta z-score */
  thetaZScore: number;
  /** Signal quality percentage (0-100) */
  signalQuality: number;
  /** Whether using simulated data */
  isSimulated: boolean;
  /** Callback to show full overlay */
  onTap?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * DebugBar Component
 * Compact debug bar shown at top of screen via swipe-down
 */
export const DebugBar: React.FC<DebugBarProps> = ({
  visible,
  thetaZScore,
  signalQuality,
  isSimulated,
  onTap,
  testID = 'debug-bar',
}) => {
  const slideAnim = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 0 : -50,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [visible, slideAnim]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.debugBar,
        { transform: [{ translateY: slideAnim }] },
      ]}
      testID={testID}
    >
      <TouchableOpacity
        style={styles.debugBarContent}
        onPress={onTap}
        activeOpacity={0.8}
      >
        <View style={styles.debugBarItem}>
          <Text style={styles.debugBarLabel}>θ</Text>
          <Text
            style={[
              styles.debugBarValue,
              { color: getThetaZScoreColor(thetaZScore) },
            ]}
          >
            {thetaZScore.toFixed(1)}
          </Text>
        </View>
        <View style={styles.debugBarDivider} />
        <View style={styles.debugBarItem}>
          <Text style={styles.debugBarLabel}>SQ</Text>
          <Text
            style={[
              styles.debugBarValue,
              { color: getSignalQualityColor(signalQuality) },
            ]}
          >
            {Math.round(signalQuality)}%
          </Text>
        </View>
        <View style={styles.debugBarDivider} />
        <View style={styles.debugBarItem}>
          <Text
            style={[
              styles.debugBarStatus,
              { color: isSimulated ? Colors.status.yellow : Colors.status.green },
            ]}
          >
            {isSimulated ? 'SIM' : 'LIVE'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

/**
 * Hook for detecting triple-tap gesture
 */
export const useTripleTap = (
  onTripleTap: () => void,
  timeout: number = 500
): { onPress: () => void } => {
  const tapCountRef = useRef(0);
  const lastTapRef = useRef(0);

  const onPress = useCallback(() => {
    const now = Date.now();
    if (now - lastTapRef.current < timeout) {
      tapCountRef.current += 1;
      if (tapCountRef.current >= 3) {
        tapCountRef.current = 0;
        onTripleTap();
      }
    } else {
      tapCountRef.current = 1;
    }
    lastTapRef.current = now;
  }, [onTripleTap, timeout]);

  return { onPress };
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouch: {
    ...StyleSheet.absoluteFillObject,
  },
  container: {
    width: SCREEN_WIDTH - Spacing.xl * 2,
    maxWidth: 360,
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.primary.main,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.primary.main,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.text.primary,
    fontWeight: Typography.fontWeight.bold,
    marginTop: -2,
  },
  statsContainer: {
    padding: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  statLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  forceStateSection: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.sm,
  },
  statePickerContainer: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  stateButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
  },
  stateButtonActive: {
    backgroundColor: Colors.surface.elevated,
    borderWidth: 2,
  },
  stateButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
  },
  footerHint: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    padding: Spacing.md,
  },
  // Debug Bar styles
  debugBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface.elevated,
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary.main,
    zIndex: 1000,
  },
  debugBarContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  debugBarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  debugBarLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginRight: Spacing.xs,
  },
  debugBarValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  debugBarStatus: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
  },
  debugBarDivider: {
    width: 1,
    height: 16,
    backgroundColor: Colors.border.secondary,
  },
});

export default DebugOverlay;
