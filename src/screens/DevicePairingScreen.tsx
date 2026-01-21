import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Platform,
} from 'react-native';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { useDevice } from '../contexts/DeviceContext';
import { DeviceInfo } from '../types';

/**
 * Discovered BLE device during scanning
 */
interface DiscoveredDevice {
  id: string;
  name: string | null;
  rssi: number | null;
  type: 'headband' | 'earpiece' | 'unknown';
}

/**
 * Pairing screen state
 */
type PairingState = 'idle' | 'scanning' | 'connecting' | 'connected' | 'error';

/**
 * Props for DevicePairingScreen
 */
interface DevicePairingScreenProps {
  onPairingComplete?: (device: DeviceInfo) => void;
  onSkip?: () => void;
}

/**
 * DevicePairingScreen component for BLE device setup
 * Allows users to scan for, discover, and pair with FlowState BCI devices
 */
export const DevicePairingScreen: React.FC<DevicePairingScreenProps> = ({
  onPairingComplete,
  onSkip,
}) => {
  // Context - isConnecting from context is unused since we track state locally via pairingState
  const {
    deviceInfo,
    connectionError,
    setDeviceInfo,
    setIsConnecting,
    setConnectionError,
    resetDeviceState,
  } = useDevice();

  // Local state
  const [pairingState, setPairingState] = useState<PairingState>('idle');
  const [discoveredDevices, setDiscoveredDevices] = useState<
    DiscoveredDevice[]
  >([]);
  const [selectedDevice, setSelectedDevice] = useState<DiscoveredDevice | null>(
    null
  );
  const [scanProgress, setScanProgress] = useState(0);

  // Refs
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scanProgressRef = useRef<NodeJS.Timeout | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Pulse animation for scanning indicator
  useEffect(() => {
    if (pairingState === 'scanning') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [pairingState, pulseAnim]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (scanProgressRef.current) {
        clearInterval(scanProgressRef.current);
      }
    };
  }, []);

  /**
   * Determine device type based on name
   */
  const getDeviceType = (
    name: string | null
  ): 'headband' | 'earpiece' | 'unknown' => {
    if (!name) return 'unknown';
    const lowerName = name.toLowerCase();
    if (lowerName.includes('headband') || lowerName.includes('band')) {
      return 'headband';
    }
    if (
      lowerName.includes('earpiece') ||
      lowerName.includes('ear') ||
      lowerName.includes('pod')
    ) {
      return 'earpiece';
    }
    return 'unknown';
  };

  /**
   * Get signal strength label based on RSSI
   */
  const getSignalStrengthLabel = (rssi: number | null): string => {
    if (rssi === null) return 'Unknown';
    if (rssi >= -50) return 'Excellent';
    if (rssi >= -60) return 'Good';
    if (rssi >= -70) return 'Fair';
    return 'Weak';
  };

  /**
   * Get signal strength color based on RSSI
   */
  const getSignalStrengthColor = (rssi: number | null): string => {
    if (rssi === null) return Colors.text.disabled;
    if (rssi >= -50) return Colors.signal.excellent;
    if (rssi >= -60) return Colors.signal.good;
    if (rssi >= -70) return Colors.signal.fair;
    return Colors.signal.poor;
  };

  /**
   * Start scanning for BLE devices
   */
  const startScan = useCallback(() => {
    setPairingState('scanning');
    setDiscoveredDevices([]);
    setConnectionError(null);
    setScanProgress(0);

    // Simulate scan progress
    scanProgressRef.current = setInterval(() => {
      setScanProgress((prev) => Math.min(prev + 10, 90));
    }, 1000);

    // Simulate discovering devices (in real implementation, use BleService)
    // For demo purposes, we'll add mock devices after a delay
    // In real usage, BLE devices come without type - we derive it from the name
    const mockRawDevices = [
      { id: 'flow-headband-001', name: 'FlowState Headband', rssi: -45 },
      { id: 'flow-earpiece-001', name: 'FlowState Earpiece', rssi: -58 },
      { id: 'bci-device-002', name: 'BCI Monitor Pro', rssi: -72 },
    ];

    // Process raw BLE devices to add inferred type
    const mockDevices: DiscoveredDevice[] = mockRawDevices.map((device) => ({
      ...device,
      type: getDeviceType(device.name),
    }));

    // Simulate gradual device discovery
    mockDevices.forEach((device, index) => {
      setTimeout(
        () => {
          setDiscoveredDevices((prev) => {
            if (prev.find((d) => d.id === device.id)) return prev;
            return [...prev, device];
          });
        },
        (index + 1) * 1500
      );
    });

    // Stop scan after 10 seconds
    scanTimeoutRef.current = setTimeout(() => {
      stopScan();
    }, 10000);
  }, [setConnectionError]);

  /**
   * Stop scanning for BLE devices
   */
  const stopScan = useCallback(() => {
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
    if (scanProgressRef.current) {
      clearInterval(scanProgressRef.current);
      scanProgressRef.current = null;
    }
    setScanProgress(100);
    setPairingState('idle');
  }, []);

  /**
   * Connect to a discovered device
   */
  const connectToDevice = useCallback(
    async (device: DiscoveredDevice) => {
      setSelectedDevice(device);
      setPairingState('connecting');
      setIsConnecting(true);
      setConnectionError(null);

      try {
        // Simulate connection delay (in real implementation, use BleService)
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Simulate successful connection
        const connectedDevice: DeviceInfo = {
          id: device.id,
          name: device.name || 'Unknown Device',
          type: device.type === 'unknown' ? 'headband' : device.type,
          sampling_rate: device.type === 'headband' ? 500 : 250,
          battery_level: Math.floor(Math.random() * 40) + 60, // 60-100%
          firmware_version: '1.2.0',
          rssi: device.rssi,
          is_connected: true,
          last_connected: Date.now(),
        };

        setDeviceInfo(connectedDevice);
        setPairingState('connected');
        setIsConnecting(false);

        // Notify parent of successful pairing
        if (onPairingComplete) {
          onPairingComplete(connectedDevice);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to connect to device';
        setConnectionError(errorMessage);
        setPairingState('error');
        setIsConnecting(false);
        setSelectedDevice(null);
      }
    },
    [setIsConnecting, setConnectionError, setDeviceInfo, onPairingComplete]
  );

  /**
   * Retry connection after error
   */
  const retryConnection = useCallback(() => {
    if (selectedDevice) {
      connectToDevice(selectedDevice);
    } else {
      startScan();
    }
  }, [selectedDevice, connectToDevice, startScan]);

  /**
   * Cancel pairing and reset state
   */
  const cancelPairing = useCallback(() => {
    stopScan();
    resetDeviceState();
    setDiscoveredDevices([]);
    setSelectedDevice(null);
    setPairingState('idle');
  }, [stopScan, resetDeviceState]);

  /**
   * Handle skip button press
   */
  const handleSkip = useCallback(() => {
    Alert.alert(
      'Skip Device Setup?',
      'You can pair a device later from Settings. Some features will be limited without a connected device.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Skip',
          onPress: () => {
            cancelPairing();
            if (onSkip) {
              onSkip();
            }
          },
        },
      ]
    );
  }, [cancelPairing, onSkip]);

  /**
   * Render a discovered device item
   */
  const renderDeviceItem = ({ item }: { item: DiscoveredDevice }) => {
    const isSelected = selectedDevice?.id === item.id;
    const isCurrentlyConnecting = isSelected && pairingState === 'connecting';

    return (
      <TouchableOpacity
        style={[styles.deviceItem, isSelected && styles.deviceItemSelected]}
        onPress={() => connectToDevice(item)}
        disabled={pairingState === 'connecting'}
        activeOpacity={0.7}
      >
        <View style={styles.deviceIcon}>
          <Text style={styles.deviceIconText}>
            {item.type === 'headband'
              ? '🎧'
              : item.type === 'earpiece'
                ? '🎵'
                : '📡'}
          </Text>
        </View>

        <View style={styles.deviceInfo}>
          <Text style={styles.deviceName}>{item.name || 'Unknown Device'}</Text>
          <View style={styles.deviceMeta}>
            <View
              style={[
                styles.signalDot,
                { backgroundColor: getSignalStrengthColor(item.rssi) },
              ]}
            />
            <Text style={styles.deviceSignal}>
              {getSignalStrengthLabel(item.rssi)}
              {item.rssi !== null && ` (${item.rssi} dBm)`}
            </Text>
          </View>
          {item.type !== 'unknown' && (
            <Text style={styles.deviceType}>
              {item.type === 'headband'
                ? 'Headband • 500Hz'
                : 'Earpiece • 250Hz'}
            </Text>
          )}
        </View>

        <View style={styles.deviceAction}>
          {isCurrentlyConnecting ? (
            <ActivityIndicator size="small" color={Colors.primary.main} />
          ) : (
            <Text style={styles.connectText}>Connect</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render empty state when no devices found
   */
  const renderEmptyState = () => {
    if (pairingState === 'scanning') {
      return (
        <View style={styles.emptyState}>
          <Animated.View
            style={[
              styles.scanningIndicator,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.scanningIcon}>📡</Text>
          </Animated.View>
          <Text style={styles.emptyTitle}>Scanning for devices...</Text>
          <Text style={styles.emptySubtitle}>
            Make sure your FlowState device is powered on and in pairing mode
          </Text>
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { width: `${scanProgress}%` }]} />
          </View>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>🔍</Text>
        <Text style={styles.emptyTitle}>No devices found</Text>
        <Text style={styles.emptySubtitle}>
          Tap "Scan for Devices" to search for nearby FlowState BCI devices
        </Text>
      </View>
    );
  };

  /**
   * Render error state
   */
  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <Text style={styles.errorIcon}>⚠️</Text>
      <Text style={styles.errorTitle}>Connection Failed</Text>
      <Text style={styles.errorMessage}>{connectionError}</Text>
      <TouchableOpacity style={styles.retryButton} onPress={retryConnection}>
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  /**
   * Render connected state
   */
  const renderConnectedState = () => (
    <View style={styles.connectedContainer}>
      <View style={styles.successIcon}>
        <Text style={styles.successIconText}>✓</Text>
      </View>
      <Text style={styles.connectedTitle}>Device Connected!</Text>
      <Text style={styles.connectedDevice}>{deviceInfo?.name}</Text>
      <View style={styles.deviceStats}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Battery</Text>
          <Text style={styles.statValue}>
            {deviceInfo?.battery_level ?? '--'}%
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Sample Rate</Text>
          <Text style={styles.statValue}>
            {deviceInfo?.sampling_rate ?? '--'} Hz
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Firmware</Text>
          <Text style={styles.statValue}>
            {deviceInfo?.firmware_version ?? '--'}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Connect Your Device</Text>
        <Text style={styles.subtitle}>
          Pair your FlowState BCI device to start monitoring brain activity
        </Text>
      </View>

      {/* Content based on state */}
      {pairingState === 'error' && renderErrorState()}

      {pairingState === 'connected' && renderConnectedState()}

      {(pairingState === 'idle' ||
        pairingState === 'scanning' ||
        pairingState === 'connecting') && (
        <>
          {/* Device list */}
          <FlatList
            data={discoveredDevices}
            keyExtractor={(item) => item.id}
            renderItem={renderDeviceItem}
            ListEmptyComponent={renderEmptyState}
            contentContainerStyle={
              discoveredDevices.length === 0
                ? styles.emptyListContainer
                : styles.listContainer
            }
            refreshControl={
              <RefreshControl
                refreshing={pairingState === 'scanning'}
                onRefresh={startScan}
                tintColor={Colors.primary.main}
                colors={[Colors.primary.main]}
              />
            }
          />

          {/* Action buttons */}
          <View style={styles.actions}>
            {pairingState === 'scanning' ? (
              <TouchableOpacity style={styles.stopButton} onPress={stopScan}>
                <Text style={styles.stopButtonText}>Stop Scanning</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.scanButton} onPress={startScan}>
                <Text style={styles.scanButtonText}>Scan for Devices</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <Text style={styles.skipButtonText}>Skip for Now</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Tips section */}
      {pairingState !== 'connected' && (
        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Pairing Tips</Text>
          <Text style={styles.tipText}>
            • Ensure Bluetooth is enabled on your device
          </Text>
          <Text style={styles.tipText}>
            • Place the BCI device within 2 meters
          </Text>
          <Text style={styles.tipText}>
            • Press the pairing button on your headband/earpiece
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  header: {
    padding: Spacing.lg,
    paddingTop: Platform.OS === 'ios' ? Spacing.xxl : Spacing.lg,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
  },
  listContainer: {
    padding: Spacing.md,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadows.sm,
  },
  deviceItemSelected: {
    borderWidth: 2,
    borderColor: Colors.primary.main,
  },
  deviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  deviceIconText: {
    fontSize: 24,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  deviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  signalDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  deviceSignal: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
  },
  deviceType: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.tertiary,
  },
  deviceAction: {
    paddingLeft: Spacing.md,
  },
  connectText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.primary.main,
  },
  emptyState: {
    alignItems: 'center',
    padding: Spacing.xl,
  },
  scanningIndicator: {
    marginBottom: Spacing.lg,
  },
  scanningIcon: {
    fontSize: 48,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.relaxed,
    maxWidth: 280,
  },
  progressContainer: {
    width: '80%',
    height: 4,
    backgroundColor: Colors.surface.secondary,
    borderRadius: 2,
    marginTop: Spacing.lg,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary.main,
    borderRadius: 2,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  errorTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.error,
    marginBottom: Spacing.sm,
  },
  errorMessage: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    maxWidth: 280,
  },
  retryButton: {
    backgroundColor: Colors.primary.main,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  connectedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  successIconText: {
    fontSize: 40,
    color: Colors.text.inverse,
    fontWeight: Typography.fontWeight.bold,
  },
  connectedTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.success,
    marginBottom: Spacing.sm,
  },
  connectedDevice: {
    fontSize: Typography.fontSize.lg,
    color: Colors.text.primary,
    marginBottom: Spacing.xl,
  },
  deviceStats: {
    flexDirection: 'row',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadows.sm,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  actions: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  scanButton: {
    backgroundColor: Colors.primary.main,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    ...Shadows.sm,
  },
  scanButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.inverse,
  },
  stopButton: {
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
  },
  stopButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  skipButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  tips: {
    backgroundColor: Colors.surface.primary,
    margin: Spacing.lg,
    marginTop: 0,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  tipsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  tipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.relaxed,
    marginBottom: Spacing.xs,
  },
});

export default DevicePairingScreen;
