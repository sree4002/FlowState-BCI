/**
 * FlowState BCI - Main App Entry Point
 *
 * This is the entry point for the React Native Expo app.
 * Sets up navigation and provides global state via context providers.
 */

import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar, Text, View, StyleSheet } from 'react-native';

// Contexts
import {
  SettingsProvider,
  SimulatedModeProvider,
  SessionProvider,
  DeviceProvider,
} from './src/contexts';

// Screens
import {
  DashboardScreen,
  ActiveSessionScreen,
  SettingsScreen,
} from './src/screens';

// Theme
import { Colors } from './src/constants/theme';

// Navigation types
type RootTabParamList = {
  Dashboard: undefined;
  Session: undefined;
  History: undefined;
  Settings: undefined;
};

// Tab navigator
const Tab = createBottomTabNavigator<RootTabParamList>();

// Simple icon component (replace with react-native-vector-icons in production)
interface TabIconProps {
  name: keyof RootTabParamList;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ name, focused }) => {
  const icons: Record<keyof RootTabParamList, string> = {
    Dashboard: focused ? '🏠' : '🏚️',
    Session: focused ? '🧠' : '💭',
    History: focused ? '📊' : '📈',
    Settings: focused ? '⚙️' : '🔧',
  };
  return <Text style={{ fontSize: 24 }}>{icons[name] || '•'}</Text>;
};

// Placeholder History Screen (to be replaced with full implementation)
const HistoryScreen: React.FC = () => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>Session History</Text>
    <Text style={styles.placeholderSubtext}>Coming soon</Text>
  </View>
);

export default function App(): React.JSX.Element {
  return (
    <SettingsProvider>
      <SimulatedModeProvider>
        <SessionProvider>
          <DeviceProvider>
            <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
            <NavigationContainer
              theme={{
                ...DarkTheme,
                colors: {
                  ...DarkTheme.colors,
                  primary: Colors.primary.main,
                  background: Colors.background.primary,
                  card: Colors.surface.primary,
                  text: Colors.text.primary,
                  border: Colors.border.primary,
                  notification: Colors.accent.error,
                },
              }}
            >
              <Tab.Navigator
                screenOptions={{
                  headerShown: false,
                  tabBarActiveTintColor: Colors.primary.main,
                  tabBarInactiveTintColor: Colors.text.tertiary,
                  tabBarStyle: {
                    backgroundColor: Colors.surface.primary,
                    borderTopColor: Colors.border.primary,
                    paddingBottom: 5,
                    paddingTop: 5,
                    height: 60,
                  },
                }}
              >
                <Tab.Screen
                  name="Dashboard"
                  component={DashboardScreen}
                  options={{
                    tabBarLabel: 'Dashboard',
                    tabBarIcon: ({ focused }) => (
                      <TabIcon name="Dashboard" focused={focused} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Session"
                  component={ActiveSessionScreen}
                  options={{
                    tabBarLabel: 'Session',
                    tabBarIcon: ({ focused }) => (
                      <TabIcon name="Session" focused={focused} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="History"
                  component={HistoryScreen}
                  options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ focused }) => (
                      <TabIcon name="History" focused={focused} />
                    ),
                  }}
                />
                <Tab.Screen
                  name="Settings"
                  component={SettingsScreen}
                  options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ focused }) => (
                      <TabIcon name="Settings" focused={focused} />
                    ),
                  }}
                />
              </Tab.Navigator>
            </NavigationContainer>
          </DeviceProvider>
        </SessionProvider>
      </SimulatedModeProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: Colors.text.primary,
    fontSize: 24,
    fontWeight: '600',
  },
  placeholderSubtext: {
    color: Colors.text.secondary,
    fontSize: 16,
    marginTop: 8,
  },
});
