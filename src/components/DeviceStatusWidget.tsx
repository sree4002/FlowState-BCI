import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useDevice } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';

/**
 * Props for DeviceStatusWidget
 */
export interface DeviceStatusWidgetProps {
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Returns the color for a given signal quality score
 */
const getSignalColor = (score: number | null): string => {
  if (score === null) return Colors.text.disabled;
  if (score >= 80) return Colors.signal.excellent;
  if (score >= 60) return Colors.signal.good;
  if (score >= 40) return Colors.signal.fair;
  if (score >= 20) return Colors.signal.poor;
  return Colors.signal.critical;
};

/**
 * Returns a label for a given signal quality score
 */
const getSignalLabel = (score: number | null): string => {
  if (score === null) return 'N/A';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Critical';
};

/**
 * Returns the color for a given battery level
 */
const getBatteryColor = (level: number | null): string => {
  if (level === null) return Colors.text.disabled;
  if (level >= 50) return Colors.signal.excellent;
  if (level >= 20) return Colors.signal.fair;
  return Colors.signal.critical;
};

/**
 * Returns a battery icon representation based on level
 */
const getBatteryIcon = (level: number | null): string => {
  if (level === null) return '[ ? ]';
  if (level >= 80) return '[████]';
  if (level >= 60) return '[███ ]';
  if (level >= 40) return '[██  ]';
  if (level >= 20) return '[█   ]';
  return '[    ]';
};

/**
 * DeviceStatusWidget - Displays BLE device connection status, battery level, and signal quality
 *
 * Shows:
 * - Connection status (connected/disconnected/connecting)
 * - Device name and type
 * - Battery level with visual indicator
 * - Signal quality score with color-coded label
 */
export const DeviceStatusWidget: React.FC<DeviceStatusWidgetProps> = ({
  testID,
}) => {
  const { deviceInfo, signalQuality, isConnecting, connectionError } =
    useDevice();

  const isConnected = deviceInfo?.is_connected ?? false;
  const batteryLevel = deviceInfo?.battery_level ?? null;
  const signalScore = signalQuality?.score ?? null;

  // Determine connection status display
  const getConnectionStatus = (): { text: string; color: string } => {
    if (connectionError) {
      return { text: 'Error', color: Colors.signal.critical };
    }
    if (isConnecting) {
      return { text: 'Connecting...', color: Colors.signal.fair };
    }
    if (isConnected) {
      return { text: 'Connected', color: Colors.signal.excellent };
    }
    return { text: 'Disconnected', color: Colors.text.tertiary };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <View style={styles.container} testID={testID}>
      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.title}>Device Status</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: connectionStatus.color + '20' },
          ]}
        >
          <View
            style={[
              styles.statusDot,
              { backgroundColor: connectionStatus.color },
            ]}
          />
          <Text style={[styles.statusText, { color: connectionStatus.color }]}>
            {connectionStatus.text}
          </Text>
        </View>
      </View>

      {/* Device Info */}
      {deviceInfo && (
        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{deviceInfo.name}</Text>
          <Text style={styles.deviceType}>
            {deviceInfo.type === 'headband' ? 'Headband' : 'Earpiece'}
          </Text>
        </View>
      )}

      {/* Metrics Row */}
      <View style={styles.metricsRow}>
        {/* Battery Level */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Battery</Text>
          <View style={styles.metricValueRow}>
            <Text
              style={[
                styles.batteryIcon,
                { color: getBatteryColor(batteryLevel) },
              ]}
            >
              {getBatteryIcon(batteryLevel)}
            </Text>
          </View>
          <Text
            style={[
              styles.metricValue,
              { color: getBatteryColor(batteryLevel) },
            ]}
          >
            {batteryLevel !== null ? `${batteryLevel}%` : '--'}
          </Text>
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Signal Quality */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Signal</Text>
          <Text
            style={[styles.metricValue, { color: getSignalColor(signalScore) }]}
          >
            {signalScore !== null ? signalScore : '--'}
          </Text>
          <Text
            style={[
              styles.metricSubtext,
              { color: getSignalColor(signalScore) },
            ]}
          >
            {getSignalLabel(signalScore)}
          </Text>
        </View>
      </View>

      {/* Error Message */}
      {connectionError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{connectionError}</Text>
        </View>
      )}

      {/* No Device Message */}
      {!deviceInfo && !isConnecting && !connectionError && (
        <View style={styles.noDeviceContainer}>
          <Text style={styles.noDeviceText}>No device paired</Text>
          <Text style={styles.noDeviceSubtext}>
            Go to Settings to pair a device
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadows.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.round,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.round,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
  },
  deviceInfo: {
    marginBottom: Spacing.md,
  },
  deviceName: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  deviceType: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryIcon: {
    fontSize: Typography.fontSize.sm,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
  },
  metricSubtext: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.medium,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 50,
    backgroundColor: Colors.border.secondary,
  },
  errorContainer: {
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.signal.critical + '15',
    borderRadius: BorderRadius.sm,
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.signal.critical,
    textAlign: 'center',
  },
  noDeviceContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  noDeviceText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    fontWeight: Typography.fontWeight.medium,
  },
  noDeviceSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginTop: Spacing.xs,
  },
});

export default DeviceStatusWidget;
