/**
 * Games Navigator
 * Stack navigator for cognitive games screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GamesStackParamList } from '../types/navigation';
import { Colors } from '../constants/theme';

// Placeholder screens - will be implemented in Phase 6
const GameHubScreen = () => null;
const GameConfigScreen = () => null;
const WordRecallGameScreen = () => null;
const NBackGameScreen = () => null;
const GameResultsScreen = () => null;

const Stack = createNativeStackNavigator<GamesStackParamList>();

export const GamesNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.background.primary,
        },
        headerTintColor: Colors.text.primary,
        headerShadowVisible: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen
        name="GameHub"
        component={GameHubScreen}
        options={{
          headerTitle: 'Cognitive Games',
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="GameConfig"
        component={GameConfigScreen}
        options={{
          headerTitle: 'Game Setup',
        }}
      />
      <Stack.Screen
        name="WordRecallGame"
        component={WordRecallGameScreen}
        options={{
          headerTitle: 'Word Recall',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="NBackGame"
        component={NBackGameScreen}
        options={{
          headerTitle: 'N-Back',
          headerBackVisible: false,
        }}
      />
      <Stack.Screen
        name="GameResults"
        component={GameResultsScreen}
        options={{
          headerTitle: 'Results',
          headerBackVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};
