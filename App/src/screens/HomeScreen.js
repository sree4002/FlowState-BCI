/**
 * FlowState BCI - Home Screen
 * 
 * Main dashboard showing:
 * - Connection status
 * - Current theta state
 * - Quick boost button
 * - Next optimal study time
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useApp } from '../context/AppContext';

export default function HomeScreen({ navigation }) {
  const { isConnected, deviceStatus, bleService, userProfile } = useApp();
  
  const [isBoostActive, setIsBoostActive] = useState(false);
  const [boostTimeRemaining, setBoostTimeRemaining] = useState(0);
  const [nextOptimalTime, setNextOptimalTime] = useState(null);
  
  // Pulse animation for boost button
  const pulseAnim = new Animated.Value(1);
  
  useEffect(() => {
    if (isBoostActive) {
      // Pulse animation while boost is active
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isBoostActive]);
  
  // Boost timer countdown
  useEffect(() => {
    let interval;
    if (isBoostActive && boostTimeRemaining > 0) {
      interval = setInterval(() => {
        setBoostTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBoostActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isBoostActive, boostTimeRemaining]);
  
  // Calculate next optimal time from profile
  useEffect(() => {
    if (userProfile?.circadianPattern) {
      const now = new Date();
      const currentHour = now.getHours();
      const pattern = userProfile.circadianPattern;
      
      // Find average
      const values = Object.values(pattern);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      
      // Find next hour above average
      for (let i = 1; i <= 24; i++) {
        const checkHour = (currentHour + i) % 24;
        if (pattern[checkHour] > avg) {
          const nextTime = new Date();
          nextTime.setHours(checkHour, 0, 0, 0);
          if (nextTime <= now) {
            nextTime.setDate(nextTime.getDate() + 1);
          }
          setNextOptimalTime(nextTime);
          break;
        }
      }
    }
  }, [userProfile]);
  
  const handleBoostPress = async () => {
    if (isBoostActive) {
      // Stop boost
      await bleService.stopEntrainment();
      setIsBoostActive(false);
      setBoostTimeRemaining(0);
    } else {
      // Start 5-minute boost
      await bleService.sendCommand('BOOST');
      setIsBoostActive(true);
      setBoostTimeRemaining(5 * 60); // 5 minutes in seconds
    }
  };
  
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatOptimalTime = (date) => {
    if (!date) return '--:--';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={styles.container}>
      {/* Connection Status */}
      <View style={styles.connectionBar}>
        <View style={[
          styles.connectionDot,
          isConnected ? styles.connected : styles.disconnected
        ]} />
        <Text style={styles.connectionText}>
          {isConnected ? 'Earpiece Connected' : 'Not Connected'}
        </Text>
        {!isConnected && (
          <TouchableOpacity
            style={styles.connectButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.connectButtonText}>Connect</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Status Card */}
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Current Status</Text>
        <Text style={styles.statusValue}>
          {deviceStatus.isPlaying ? 'Entrainment Active' : 'Idle'}
        </Text>
        {deviceStatus.isPlaying && (
          <Text style={styles.statusFreq}>
            {deviceStatus.frequency} Hz at {Math.round(deviceStatus.volume * 100)}%
          </Text>
        )}
      </View>
      
      {/* Boost Button */}
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <TouchableOpacity
          style={[
            styles.boostButton,
            isBoostActive && styles.boostButtonActive,
            !isConnected && styles.boostButtonDisabled,
          ]}
          onPress={handleBoostPress}
          disabled={!isConnected}
        >
          <Text style={styles.boostEmoji}>
            {isBoostActive ? '⚡' : '🧠'}
          </Text>
          <Text style={styles.boostButtonText}>
            {isBoostActive ? 'Stop Boost' : 'Quick Boost'}
          </Text>
          <Text style={styles.boostSubtext}>
            {isBoostActive 
              ? formatTime(boostTimeRemaining) + ' remaining'
              : '5 min theta entrainment'
            }
          </Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Next Optimal Time */}
      <View style={styles.predictionCard}>
        <Text style={styles.predictionLabel}>Next Optimal Study Time</Text>
        <Text style={styles.predictionValue}>
          {formatOptimalTime(nextOptimalTime)}
        </Text>
        <Text style={styles.predictionSubtext}>
          Based on your theta patterns
        </Text>
      </View>
      
      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Session')}
        >
          <Text style={styles.actionEmoji}>📊</Text>
          <Text style={styles.actionText}>Start Session</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.actionEmoji}>📈</Text>
          <Text style={styles.actionText}>View History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    padding: 20,
  },
  connectionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  connectionDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  connected: {
    backgroundColor: '#64ffda',
  },
  disconnected: {
    backgroundColor: '#e94560',
  },
  connectionText: {
    color: '#ffffff',
    fontSize: 14,
    flex: 1,
  },
  connectButton: {
    backgroundColor: '#0f3460',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  connectButtonText: {
    color: '#64ffda',
    fontSize: 14,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    alignItems: 'center',
  },
  statusLabel: {
    color: '#8892b0',
    fontSize: 14,
    marginBottom: 8,
  },
  statusValue: {
    color: '#64ffda',
    fontSize: 24,
    fontWeight: '700',
  },
  statusFreq: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
  },
  boostButton: {
    backgroundColor: '#0f3460',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 3,
    borderColor: '#64ffda',
  },
  boostButtonActive: {
    backgroundColor: '#64ffda',
    borderColor: '#64ffda',
  },
  boostButtonDisabled: {
    opacity: 0.5,
    borderColor: '#8892b0',
  },
  boostEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  boostButtonText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  boostSubtext: {
    color: '#8892b0',
    fontSize: 14,
    marginTop: 4,
  },
  predictionCard: {
    backgroundColor: '#16213e',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  predictionLabel: {
    color: '#8892b0',
    fontSize: 14,
  },
  predictionValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
    marginVertical: 8,
  },
  predictionSubtext: {
    color: '#8892b0',
    fontSize: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 0.48,
  },
  actionEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 14,
  },
});
