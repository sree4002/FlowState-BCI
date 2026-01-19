/**
 * FlowState BCI - Session Screen
 * 
 * Active session monitoring showing:
 * - Session timer
 * - Real-time theta visualization (mock for now)
 * - Entrainment controls
 * - Session stats
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useApp } from '../../App';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SessionScreen() {
  const { isConnected, deviceStatus, bleService } = useApp();
  
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [entrainmentActive, setEntrainmentActive] = useState(false);
  const [thetaFrequency, setThetaFrequency] = useState(6.0);
  const [volume, setVolume] = useState(0.5);
  
  // Mock theta data for visualization
  const [thetaHistory, setThetaHistory] = useState([]);
  const [currentZ, setCurrentZ] = useState(0);
  
  const timerRef = useRef(null);
  const dataRef = useRef(null);
  
  // Session timer
  useEffect(() => {
    if (isSessionActive) {
      timerRef.current = setInterval(() => {
        setSessionTime(prev => prev + 1);
      }, 1000);
      
      // Mock theta data generator
      dataRef.current = setInterval(() => {
        const newZ = (Math.random() - 0.5) * 4; // Random z-score between -2 and 2
        setCurrentZ(newZ);
        setThetaHistory(prev => [...prev.slice(-59), newZ]);
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (dataRef.current) clearInterval(dataRef.current);
    };
  }, [isSessionActive]);
  
  // Sync with device status
  useEffect(() => {
    setEntrainmentActive(deviceStatus.isPlaying);
  }, [deviceStatus.isPlaying]);
  
  const startSession = () => {
    setIsSessionActive(true);
    setSessionTime(0);
    setThetaHistory([]);
  };
  
  const stopSession = async () => {
    setIsSessionActive(false);
    if (entrainmentActive) {
      await bleService.stopEntrainment();
      setEntrainmentActive(false);
    }
  };
  
  const toggleEntrainment = async () => {
    if (entrainmentActive) {
      await bleService.stopEntrainment();
      setEntrainmentActive(false);
    } else {
      await bleService.setFrequency(thetaFrequency);
      await bleService.setVolume(volume);
      await bleService.startEntrainment();
      setEntrainmentActive(true);
    }
  };
  
  const adjustFrequency = async (delta) => {
    const newFreq = Math.max(4, Math.min(8, thetaFrequency + delta));
    setThetaFrequency(newFreq);
    if (entrainmentActive) {
      await bleService.setFrequency(newFreq);
    }
  };
  
  const adjustVolume = async (delta) => {
    const newVol = Math.max(0.1, Math.min(1.0, volume + delta));
    setVolume(newVol);
    if (entrainmentActive) {
      await bleService.setVolume(newVol);
    }
  };
  
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const getStateColor = (z) => {
    if (z > 0.5) return '#64ffda';  // High - green
    if (z < -0.5) return '#e94560'; // Low - red
    return '#ffd93d';               // Normal - yellow
  };
  
  const getStateLabel = (z) => {
    if (z > 0.5) return 'HIGH';
    if (z < -0.5) return 'LOW';
    return 'NORMAL';
  };
  
  // Simple bar chart for theta history
  const renderThetaChart = () => {
    const maxBars = 30;
    const data = thetaHistory.slice(-maxBars);
    const barWidth = (SCREEN_WIDTH - 80) / maxBars;
    
    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Theta Power (z-score)</Text>
        <View style={styles.chart}>
          {/* Zero line */}
          <View style={styles.zeroLine} />
          
          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((value, index) => {
              const height = Math.abs(value) * 20;
              const isPositive = value >= 0;
              return (
                <View
                  key={index}
                  style={[
                    styles.bar,
                    {
                      width: barWidth - 2,
                      height: Math.min(height, 60),
                      backgroundColor: getStateColor(value),
                      marginBottom: isPositive ? 0 : undefined,
                      marginTop: isPositive ? undefined : 0,
                      alignSelf: isPositive ? 'flex-end' : 'flex-start',
                    },
                  ]}
                />
              );
            })}
          </View>
        </View>
      </View>
    );
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Timer */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Session Time</Text>
        <Text style={styles.timerValue}>{formatTime(sessionTime)}</Text>
      </View>
      
      {/* Current State */}
      {isSessionActive && (
        <View style={styles.stateContainer}>
          <Text style={styles.stateLabel}>Current Theta State</Text>
          <View style={[styles.stateIndicator, { backgroundColor: getStateColor(currentZ) }]}>
            <Text style={styles.stateValue}>{getStateLabel(currentZ)}</Text>
            <Text style={styles.stateZ}>z = {currentZ.toFixed(2)}</Text>
          </View>
        </View>
      )}
      
      {/* Theta Chart */}
      {isSessionActive && thetaHistory.length > 0 && renderThetaChart()}
      
      {/* Entrainment Controls */}
      {isSessionActive && (
        <View style={styles.controlsCard}>
          <Text style={styles.controlsTitle}>Entrainment Controls</Text>
          
          {/* Frequency */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Frequency</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustFrequency(-0.5)}
              >
                <Text style={styles.controlBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{thetaFrequency.toFixed(1)} Hz</Text>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustFrequency(0.5)}
              >
                <Text style={styles.controlBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Volume */}
          <View style={styles.controlRow}>
            <Text style={styles.controlLabel}>Volume</Text>
            <View style={styles.controlButtons}>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustVolume(-0.1)}
              >
                <Text style={styles.controlBtnText}>−</Text>
              </TouchableOpacity>
              <Text style={styles.controlValue}>{Math.round(volume * 100)}%</Text>
              <TouchableOpacity
                style={styles.controlBtn}
                onPress={() => adjustVolume(0.1)}
              >
                <Text style={styles.controlBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Entrainment Toggle */}
          <TouchableOpacity
            style={[
              styles.entrainmentButton,
              entrainmentActive && styles.entrainmentButtonActive,
            ]}
            onPress={toggleEntrainment}
            disabled={!isConnected}
          >
            <Text style={[
              styles.entrainmentButtonText,
              entrainmentActive && styles.entrainmentButtonTextActive,
            ]}>
              {entrainmentActive ? '⏸ Stop Entrainment' : '▶ Start Entrainment'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* Start/Stop Session */}
      <TouchableOpacity
        style={[
          styles.sessionButton,
          isSessionActive && styles.sessionButtonStop,
        ]}
        onPress={isSessionActive ? stopSession : startSession}
      >
        <Text style={styles.sessionButtonText}>
          {isSessionActive ? 'End Session' : 'Start Session'}
        </Text>
      </TouchableOpacity>
      
      {/* Info when not in session */}
      {!isSessionActive && (
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>How Sessions Work</Text>
          <Text style={styles.infoText}>
            1. Start a session to begin monitoring{'\n'}
            2. Your theta power is tracked in real-time{'\n'}
            3. Use entrainment when theta drops{'\n'}
            4. End session to save your data
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    padding: 20,
  },
  timerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    color: '#8892b0',
    fontSize: 14,
  },
  timerValue: {
    color: '#ffffff',
    fontSize: 56,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  stateContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stateLabel: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 8,
  },
  stateIndicator: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    alignItems: 'center',
  },
  stateValue: {
    color: '#1a1a2e',
    fontSize: 24,
    fontWeight: '700',
  },
  stateZ: {
    color: '#1a1a2e',
    fontSize: 14,
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartTitle: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 12,
  },
  chart: {
    height: 120,
    justifyContent: 'center',
  },
  zeroLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    backgroundColor: '#8892b0',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 120,
  },
  bar: {
    marginHorizontal: 1,
    borderRadius: 2,
  },
  controlsCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  controlsTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  controlLabel: {
    color: '#8892b0',
    fontSize: 16,
  },
  controlButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlBtn: {
    backgroundColor: '#0f3460',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlBtnText: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: '700',
  },
  controlValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    minWidth: 70,
    textAlign: 'center',
  },
  entrainmentButton: {
    backgroundColor: '#0f3460',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#64ffda',
    marginTop: 8,
  },
  entrainmentButtonActive: {
    backgroundColor: '#64ffda',
  },
  entrainmentButtonText: {
    color: '#64ffda',
    fontSize: 18,
    fontWeight: '700',
  },
  entrainmentButtonTextActive: {
    color: '#1a1a2e',
  },
  sessionButton: {
    backgroundColor: '#64ffda',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  sessionButtonStop: {
    backgroundColor: '#e94560',
  },
  sessionButtonText: {
    color: '#1a1a2e',
    fontSize: 20,
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
  },
  infoTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  infoText: {
    color: '#8892b0',
    fontSize: 14,
    lineHeight: 24,
  },
});
