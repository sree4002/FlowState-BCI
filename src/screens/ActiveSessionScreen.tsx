/**
 * ActiveSessionScreen - Clean Neural Network Design
 *
 * Displays the active meditation/focus session with:
 * - Animated neural network visualization
 * - Real-time theta metrics
 * - Clean, minimal interface
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path, Line, Circle, Polyline } from 'react-native-svg';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
} from '../constants/theme';
import { useSession } from '../contexts/SessionContext';
import { useDevice } from '../contexts/DeviceContext';
import { useSettings } from '../contexts/SettingsContext';
import { useSimulatedMode } from '../contexts/SimulatedModeContext';
import { NeuralNetworkVisualization } from '../components/NeuralNetworkVisualization';
import { DemoModeBanner } from '../components/DemoModeBanner';

interface ActiveSessionScreenProps {
  navigation?: any;
}

// Mini chart component for theta visualization
const MiniThetaChart: React.FC<{
  value: number | null;
  history: number[];
}> = ({ value, history }) => {
  const chartWidth = 200;
  const chartHeight = 60;
  const padding = 10;

  // Generate path from history
  const getChartPath = () => {
    if (history.length < 2) return '';

    const maxVal = Math.max(...history, 2);
    const minVal = Math.min(...history, -1);
    const range = maxVal - minVal || 1;

    const points = history.map((val, i) => {
      const x = padding + (i / (history.length - 1)) * (chartWidth - 2 * padding);
      const y = chartHeight - padding - ((val - minVal) / range) * (chartHeight - 2 * padding);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  };

  const getValueColor = () => {
    if (value === null) return Colors.text.tertiary;
    if (value >= 1.5) return Colors.theta.high;
    if (value >= 0.5) return Colors.theta.normal;
    return Colors.theta.low;
  };

  return (
    <View style={styles.chartCard}>
      <View style={styles.chartHeader}>
        <Text style={styles.chartLabel}>Theta Z-Score</Text>
        <Text style={[styles.chartValue, { color: getValueColor() }]}>
          {value !== null ? (value >= 0 ? '+' : '') + value.toFixed(1) : '--'}
        </Text>
      </View>
      <Svg width={chartWidth} height={chartHeight}>
        {/* Grid lines */}
        <Line
          x1={padding}
          y1={chartHeight / 2}
          x2={chartWidth - padding}
          y2={chartHeight / 2}
          stroke={Colors.border.secondary}
          strokeWidth={1}
          strokeDasharray="4,4"
        />
        {/* Chart line */}
        {history.length >= 2 && (
          <Path
            d={getChartPath()}
            stroke={Colors.accent.primary}
            strokeWidth={2}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        {/* Current value dot */}
        {history.length > 0 && (
          <Circle
            cx={chartWidth - padding}
            cy={chartHeight / 2 - (history[history.length - 1] || 0) * 15}
            r={4}
            fill={getValueColor()}
          />
        )}
      </Svg>
    </View>
  );
};

export const ActiveSessionScreen: React.FC<ActiveSessionScreenProps> = ({
  navigation,
}) => {
  const {
    sessionState,
    currentThetaZScore: sessionThetaZScore,
    elapsedSeconds: sessionElapsedSeconds,
    sessionConfig,
  } = useSession();
  const { deviceInfo, signalQuality } = useDevice();
  const { settings } = useSettings();
  const {
    metrics: simulatedMetrics,
    isControllerRunning,
    connectionState,
    start: startSimulation,
    stop: stopSimulation,
  } = useSimulatedMode();

  // Local state
  const [simulatedElapsedSeconds, setSimulatedElapsedSeconds] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [thetaHistory, setThetaHistory] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Determine if we're using simulated mode
  const isSimulatedMode = settings.simulated_mode_enabled;

  // Use simulated mode data when enabled, otherwise use session context
  const currentThetaZScore = isSimulatedMode
    ? (simulatedMetrics?.z_score ?? null)
    : sessionThetaZScore;
  const elapsedSeconds = isSimulatedMode
    ? simulatedElapsedSeconds
    : sessionElapsedSeconds;
  const isRunning = isSimulatedMode
    ? isControllerRunning && !isPaused
    : sessionState === 'running';
  const isActive = isSimulatedMode
    ? isControllerRunning
    : sessionState === 'running' || sessionState === 'paused';

  // Get theta state
  const getThetaState = (): 'low' | 'normal' | 'high' => {
    if (currentThetaZScore === null) return 'normal';
    if (currentThetaZScore >= 1.5) return 'high';
    if (currentThetaZScore >= 0.5) return 'normal';
    return 'low';
  };

  const getThetaLabel = (): string => {
    if (currentThetaZScore === null) return 'Waiting';
    if (currentThetaZScore >= 1.5) return 'Optimal';
    if (currentThetaZScore >= 0.5) return 'Good';
    return 'Building';
  };

  const getThetaColor = (): string => {
    const state = getThetaState();
    switch (state) {
      case 'high':
        return Colors.theta.high;
      case 'low':
        return Colors.theta.low;
      default:
        return Colors.theta.normal;
    }
  };

  // Timer for simulated mode elapsed time
  useEffect(() => {
    if (isSimulatedMode && isControllerRunning && !isPaused) {
      timerRef.current = setInterval(() => {
        setSimulatedElapsedSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isSimulatedMode, isControllerRunning, isPaused]);

  // Update theta history
  useEffect(() => {
    if (currentThetaZScore !== null && isRunning) {
      setThetaHistory((prev) => {
        const newHistory = [...prev, currentThetaZScore];
        // Keep last 30 values
        return newHistory.slice(-30);
      });
    }
  }, [currentThetaZScore, isRunning]);

  // Reset state when session stops
  useEffect(() => {
    if (!isControllerRunning) {
      setSimulatedElapsedSeconds(0);
      setThetaHistory([]);
      setIsPaused(false);
    }
  }, [isControllerRunning]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Session control handlers
  const handleStart = useCallback(async () => {
    console.log('[ActiveSessionScreen] Start button pressed');
    if (isSimulatedMode) {
      try {
        await startSimulation();
      } catch (error) {
        console.error('[ActiveSessionScreen] Failed to start simulation:', error);
      }
    }
  }, [isSimulatedMode, startSimulation]);

  const handlePause = useCallback(() => {
    console.log('[ActiveSessionScreen] Pause button pressed');
    setIsPaused((prev) => !prev);
  }, []);

  const handleStop = useCallback(async () => {
    console.log('[ActiveSessionScreen] Stop button pressed');
    if (isSimulatedMode) {
      try {
        await stopSimulation();
      } catch (error) {
        console.error('[ActiveSessionScreen] Failed to stop simulation:', error);
      }
    }
  }, [isSimulatedMode, stopSimulation]);

  // Render idle state (no active session)
  if (!isActive) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <DemoModeBanner />
        <View style={styles.idleContainer}>
          {/* Neural network - static */}
          <View style={styles.visualizationContainer}>
            <NeuralNetworkVisualization
              isAnimating={false}
              size={280}
              thetaState="normal"
            />
          </View>

          {/* Start session button */}
          <TouchableOpacity
            style={styles.startButton}
            onPress={handleStart}
            activeOpacity={0.8}
          >
            <Text style={styles.startButtonText}>Start Session</Text>
          </TouchableOpacity>

          {/* Connection status hint */}
          <Text style={styles.hintText}>
            {isSimulatedMode
              ? connectionState === 'connected'
                ? 'Simulator connected'
                : 'Tap to start simulated session'
              : deviceInfo?.is_connected
                ? 'Device connected'
                : 'Connect a device to begin'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Render active session state
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <DemoModeBanner />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with status and timer */}
        <View style={styles.header}>
          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isPaused
                    ? Colors.theta.normal
                    : Colors.theta.high,
                },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isPaused ? Colors.theta.normal : Colors.theta.high },
              ]}
            >
              {isPaused ? 'Paused' : 'Entraining'}
            </Text>
          </View>
          <Text style={styles.timerText}>
            {formatTime(elapsedSeconds)}
            {sessionConfig?.duration_minutes && (
              <Text style={styles.timerTotal}>
                {' '}/ {formatTime(sessionConfig.duration_minutes * 60)}
              </Text>
            )}
          </Text>
        </View>

        {/* Neural network visualization */}
        <View style={styles.visualizationContainer}>
          <NeuralNetworkVisualization
            isAnimating={isRunning}
            size={280}
            thetaState={getThetaState()}
          />
        </View>

        {/* Theta badge */}
        <View
          style={[
            styles.thetaBadge,
            { backgroundColor: `${getThetaColor()}20` },
          ]}
        >
          <Text style={[styles.thetaBadgeText, { color: getThetaColor() }]}>
            {currentThetaZScore !== null
              ? `θ ${currentThetaZScore >= 0 ? '+' : ''}${currentThetaZScore.toFixed(1)} ${getThetaLabel()}`
              : 'θ -- Waiting'}
          </Text>
        </View>

        {/* Mini theta chart */}
        <MiniThetaChart value={currentThetaZScore} history={thetaHistory} />

        {/* Control buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={styles.pauseButton}
            onPress={handlePause}
            activeOpacity={0.8}
          >
            <Text style={styles.pauseButtonText}>
              {isPaused ? 'Resume' : 'Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.stopButton}
            onPress={handleStop}
            activeOpacity={0.8}
          >
            <Text style={styles.stopButtonText}>Stop</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.screenPadding,
    paddingBottom: 100,
  },
  // Idle state
  idleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  startButton: {
    backgroundColor: Colors.accent.primary,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xxxl + Spacing.xl,
    borderRadius: BorderRadius.xl,
    marginTop: Spacing.xxl,
  },
  startButtonText: {
    color: Colors.text.inverse,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  hintText: {
    color: Colors.text.tertiary,
    fontSize: Typography.fontSize.sm,
    marginTop: Spacing.lg,
  },
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  timerText: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    fontVariant: ['tabular-nums'],
  },
  timerTotal: {
    color: Colors.text.tertiary,
  },
  // Visualization
  visualizationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.xl,
  },
  // Theta badge
  thetaBadge: {
    alignSelf: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.round,
    marginBottom: Spacing.xl,
  },
  thetaBadgeText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Chart card
  chartCard: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  chartLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
  },
  chartValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  // Controls
  controlsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  pauseButton: {
    flex: 1,
    backgroundColor: Colors.secondary.main,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  pauseButtonText: {
    color: Colors.text.primary,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
  stopButton: {
    flex: 1,
    backgroundColor: 'rgba(181, 101, 102, 0.2)',
    borderWidth: 1,
    borderColor: Colors.accent.error,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  stopButtonText: {
    color: Colors.accent.error,
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
  },
});

export default ActiveSessionScreen;
