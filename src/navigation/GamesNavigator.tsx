/**
 * Games Navigator
 * Stack navigator for cognitive games screens
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GamesStackParamList } from '../types/navigation';
import { Colors } from '../constants/theme';

// Import game screens
import { GameHubScreen } from '../screens/games/GameHubScreen';
import { GameConfigScreen } from '../screens/games/GameConfigScreen';
import { WordRecallGameScreen } from '../screens/games/WordRecallGameScreen';
import { NBackGameScreen } from '../screens/games/NBackGameScreen';
import { GameResultsScreen } from '../screens/games/GameResultsScreen';

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
