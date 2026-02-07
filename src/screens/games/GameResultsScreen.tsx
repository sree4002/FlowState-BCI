/**
 * Game Results Screen
 * Displays comprehensive game results and performance analysis
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { ResultsSummary } from '../../components/games/ResultsSummary';
import { GameSessionDetail } from '../../types/games';
import { openDatabase } from '../../services/database';
import { getGameSessionDetailById } from '../../services/gameDatabase';

export const GameResultsScreen: React.FC<GamesScreenProps<'GameResults'>> = ({ navigation, route }) => {
  const { sessionId } = route.params;

  const [session, setSession] = useState<GameSessionDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const db = openDatabase();
        const sessionDetail = getGameSessionDetailById(db, sessionId);
        setSession(sessionDetail);
      } catch (error) {
        console.error('Failed to load game session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const handlePlayAgain = () => {
    if (!session) return;
    navigation.navigate('GameConfig', { gameType: session.game_type });
  };

  const handleBackToHub = () => {
    navigation.navigate('GameHub');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading results...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Failed to load results</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={handleBackToHub}
            activeOpacity={0.7}
          >
            <Text style={styles.errorButtonText}>Back to Games</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ResultsSummary session={session} testID="results-summary" />

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.playAgainButton}
          onPress={handlePlayAgain}
          activeOpacity={0.7}
        >
          <Text style={styles.playAgainButtonText}>Play Again</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackToHub}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back to Games</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
  },
  errorText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.accent.error,
    marginBottom: Spacing.lg,
  },
  errorButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
  },
  errorButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  footer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    gap: Spacing.md,
  },
  playAgainButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  playAgainButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  backButton: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  backButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
