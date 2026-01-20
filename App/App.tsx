/**
 * FlowState BCI - Main App
 *
 * This is the entry point for the React Native app.
 * It sets up navigation and provides global state.
 */

import React, { useState, useEffect } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Text } from 'react-native';

// Context
import { AppContext } from './src/context/AppContext';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import SessionScreen from './src/screens/SessionScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Services
import BleService from './src/services/BleService';

// Tab navigator
const Tab = createBottomTabNavigator();

// Simple icon component (replace with react-native-vector-icons in production)
interface TabIconProps {
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => {
  const icons: Record<string, string> = {
    Home: focused ? '🏠' : '🏚️',
    Session: focused ? '🧠' : '💭',
    History: focused ? '📊' : '📈',
    Settings: focused ? '⚙️' : '🔧',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>;
};

interface DeviceStatus {
  isPlaying: boolean;
  frequency: number;
  volume: number;
}

export default function App(): React.JSX.Element {
  // Global state
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>({
    isPlaying: false,
    frequency: 6.0,
    volume: 0.5,
  });
  const [userProfile, setUserProfile] = useState<Record<
    string,
    unknown
  > | null>(null);

  // Initialize BLE service
  useEffect(() => {
    // Set up status callback
    BleService.onStatusUpdate = (status) => {
      setDeviceStatus(status);
    };

    // Clean up on unmount
    return () => {
      BleService.disconnect();
    };
  }, []);

  // Context value
  const contextValue = {
    isConnected,
    setIsConnected,
    deviceStatus,
    setDeviceStatus,
    userProfile,
    setUserProfile,
    bleService: BleService,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <NavigationContainer
        theme={{
          ...DarkTheme,
          colors: {
            ...DarkTheme.colors,
            primary: '#64ffda',
            background: '#1a1a2e',
            card: '#16213e',
            text: '#ffffff',
            border: '#0f3460',
            notification: '#e94560',
          },
        }}
      >
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: '#64ffda',
            tabBarInactiveTintColor: '#8892b0',
            tabBarStyle: {
              backgroundColor: '#16213e',
              borderTopColor: '#0f3460',
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
          }}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon name="Home" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Session"
            component={SessionScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon name="Session" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="History"
            component={HistoryScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon name="History" focused={focused} />
              ),
            }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{
              headerShown: false,
              tabBarIcon: ({ focused }) => (
                <TabIcon name="Settings" focused={focused} />
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </AppContext.Provider>
  );
}
