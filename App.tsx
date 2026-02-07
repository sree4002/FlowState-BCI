/**
 * FlowState BCI - Main App Entry Point
 *
 * This is the entry point for the React Native Expo app.
 * Sets up navigation and provides global state via context providers.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar, View, StyleSheet, ActivityIndicator } from 'react-native';

// Contexts
import {
  SettingsProvider,
  SimulatedModeProvider,
  SessionProvider,
  DeviceProvider,
} from './src/contexts';
import { GamesProvider } from './src/contexts/GamesContext';

// Screens
import {
  DashboardScreen,
  ActiveSessionScreen,
  OnboardingScreen,
  InsightsScreen,
  ProfileScreen,
  SettingsScreen,
} from './src/screens';

// Components
import {
  DashboardIcon,
  SessionIcon,
  InsightsIcon,
  ProfileIcon,
} from './src/components';

// Storage
import { OnboardingStorage } from './src/services/storage';

// Theme
import { Colors, Typography } from './src/constants/theme';

// Navigation types
export type RootStackParamList = {
  MainTabs: undefined;
  Settings: undefined;
};

type MainTabParamList = {
  Dashboard: undefined;
  Session: undefined;
  Insights: undefined;
  Profile: undefined;
};

// Navigators
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Main Tab Navigator Component
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.accent.primary,
        tabBarInactiveTintColor: Colors.text.tertiary,
        tabBarStyle: {
          backgroundColor: Colors.background.primary,
          borderTopColor: Colors.border.primary,
          borderTopWidth: 0.5,
          paddingTop: 8,
          paddingBottom: 24,
          height: 80,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs + 1,
          marginTop: 4,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <DashboardIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Session"
        component={ActiveSessionScreen}
        options={{
          tabBarLabel: 'Session',
          tabBarIcon: ({ color }) => (
            <SessionIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Insights"
        component={InsightsScreen}
        options={{
          tabBarLabel: 'Insights',
          tabBarIcon: ({ color }) => (
            <InsightsIcon color={color} size={24} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <ProfileIcon color={color} size={24} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await OnboardingStorage.isCompleted();
        setHasCompletedOnboarding(completed);
      } catch (error) {
        console.error('Failed to check onboarding status:', error);
        // Default to showing onboarding if check fails
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(async () => {
    try {
      await OnboardingStorage.markCompleted();
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Failed to mark onboarding complete:', error);
      // Still proceed to main app even if storage fails
      setHasCompletedOnboarding(true);
    }
  }, []);

  // Show loading screen while checking onboarding status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <ActivityIndicator size="large" color={Colors.accent.primary} />
      </View>
    );
  }

  // Show onboarding for first-time users
  if (!hasCompletedOnboarding) {
    return (
      <View style={styles.onboardingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <OnboardingScreen
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      </View>
    );
  }

  return (
    <SettingsProvider>
      <SimulatedModeProvider>
        <SessionProvider>
          <DeviceProvider>
            <GamesProvider>
              <StatusBar barStyle="light-content" backgroundColor="#000000" />
              <NavigationContainer
                theme={{
                  ...DarkTheme,
                  colors: {
                    ...DarkTheme.colors,
                    primary: Colors.accent.primary,
                    background: Colors.background.primary,
                    card: Colors.background.primary,
                    text: Colors.text.primary,
                    border: Colors.border.primary,
                    notification: Colors.accent.error,
                  },
                }}
              >
                <Stack.Navigator
                  screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right',
                  }}
                >
                  <Stack.Screen name="MainTabs" component={MainTabNavigator} />
                  <Stack.Screen
                    name="Settings"
                    component={SettingsScreen}
                    options={{
                      headerShown: true,
                      headerTitle: 'Settings',
                      headerStyle: {
                        backgroundColor: Colors.background.primary,
                      },
                      headerTintColor: Colors.text.primary,
                      headerShadowVisible: false,
                    }}
                  />
                </Stack.Navigator>
              </NavigationContainer>
            </GamesProvider>
          </DeviceProvider>
        </SessionProvider>
      </SimulatedModeProvider>
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onboardingContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
});
