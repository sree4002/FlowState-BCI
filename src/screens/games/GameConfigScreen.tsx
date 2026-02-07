/**
 * Game Config Screen
 * Configure game settings before starting
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography, Shadows } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { DifficultySelector } from '../../components/games/DifficultySelector';
import { GameConfig, GameMode, GameType } from '../../types/games';
import { useGames } from '../../contexts/GamesContext';

export const GameConfigScreen: React.FC<GamesScreenProps<'GameConfig'>> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { startGame } = useGames();
  const { gameType } = route.params as { gameType: GameType };

  const [selectedMode, setSelectedMode] = useState<GameMode>('standalone');
  const [selectedDifficulty, setSelectedDifficulty] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);

  const gameName = gameType === 'word_recall' ? 'Word Recall' : 'N-Back';

  const handleStartGame = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const config: GameConfig = {
        gameType,
        mode: selectedMode,
        difficulty: selectedDifficulty,
      };

      await startGame(config);

      // Navigate to appropriate game screen
      if (gameType === 'word_recall') {
        navigation.navigate('WordRecallGame', { config });
      } else {
        navigation.navigate('NBackGame', { config });
      }
    } catch (error) {
      console.error('Failed to start game:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const modes: { value: GameMode; label: string; description: string }[] = [
    {
      value: 'standalone',
      label: 'Standalone',
      description: 'Play independently without BCI session',
    },
    {
      value: 'during_session',
      label: 'During Session',
      description: 'Play during an active BCI session',
    },
    {
      value: 'pre_session',
      label: 'Pre-Session',
      description: 'Test before starting a BCI session',
    },
    {
      value: 'post_session',
      label: 'Post-Session',
      description: 'Test after completing a BCI session',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{gameName} Setup</Text>
          <Text style={styles.subtitle}>Configure your game settings</Text>
        </View>

        <DifficultySelector
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          testID="difficulty-selector"
        />

        <View style={styles.modeSection}>
          <Text style={styles.sectionLabel}>Game Mode</Text>
          <View style={styles.modeOptions}>
            {modes.map((mode) => (
              <TouchableOpacity
                key={mode.value}
                style={[
                  styles.modeOption,
                  selectedMode === mode.value && styles.modeOptionSelected,
                ]}
                onPress={() => setSelectedMode(mode.value)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modeLabel,
                    selectedMode === mode.value && styles.modeLabelSelected,
                  ]}
                >
                  {mode.label}
                </Text>
                <Text
                  style={[
                    styles.modeDescription,
                    selectedMode === mode.value && styles.modeDescriptionSelected,
                  ]}
                >
                  {mode.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About {gameName}</Text>
          <Text style={styles.infoText}>
            {gameType === 'word_recall'
              ? 'Word Recall tests your short-term memory by displaying a list of words and asking you to recall them after a delay. The difficulty increases by adding more words and longer delays.'
              : 'N-Back is a working memory task where you must identify when a stimulus matches one that appeared N positions earlier. This dual n-back version tests both visual position and audio letter memory simultaneously.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.startButton, isLoading && styles.startButtonDisabled]}
          onPress={handleStartGame}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Text style={styles.startButtonText}>
            {isLoading ? 'Starting...' : 'Start Game'}
          </Text>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.screenPadding,
  },
  header: {
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
  },
  modeSection: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  modeOptions: {
    gap: Spacing.sm,
  },
  modeOption: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  modeOptionSelected: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  modeLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },
  modeLabelSelected: {
    color: Colors.accent.primary,
  },
  modeDescription: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.tertiary,
  },
  modeDescriptionSelected: {
    color: Colors.text.secondary,
  },
  infoCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardPadding,
    ...Shadows.sm,
  },
  infoTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.sm * Typography.lineHeight.normal,
  },
  footer: {
    padding: Spacing.screenPadding,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },
  startButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    ...Shadows.md,
  },
  startButtonDisabled: {
    opacity: 0.5,
  },
  startButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
});
