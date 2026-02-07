/**
 * Game Hub Screen
 * Main entry point for cognitive games
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { GameCard } from '../../components/games/GameCard';
import { PerformanceChart } from '../../components/games/PerformanceChart';
import { useGames } from '../../contexts/GamesContext';
import Svg, { Path, Rect } from 'react-native-svg';

// Word Recall Icon
const WordRecallIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Rect
      x={5}
      y={6}
      width={14}
      height={12}
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8 10h8M8 13h6"
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </Svg>
);

// N-Back Icon
const NBackIcon = () => (
  <Svg width={32} height={32} viewBox="0 0 24 24" fill="none">
    <Rect
      x={5}
      y={5}
      width={4}
      height={4}
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
    />
    <Rect
      x={10}
      y={5}
      width={4}
      height={4}
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
    />
    <Rect
      x={15}
      y={5}
      width={4}
      height={4}
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
    />
    <Rect
      x={5}
      y={10}
      width={4}
      height={4}
      fill={Colors.accent.primary}
    />
    <Rect
      x={10}
      y={10}
      width={4}
      height={4}
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
    />
    <Rect
      x={15}
      y={10}
      width={4}
      height={4}
      stroke={Colors.accent.primary}
      strokeWidth={1.5}
    />
  </Svg>
);

export const GameHubScreen: React.FC<GamesScreenProps<'GameHub'>> = () => {
  const navigation = useNavigation();
  const { recentGames, refreshGameHistory } = useGames();

  useEffect(() => {
    refreshGameHistory();
  }, [refreshGameHistory]);

  const handleGameSelect = (gameType: 'word_recall' | 'nback') => {
    navigation.navigate('GameConfig', { gameType });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Cognitive Games</Text>
          <Text style={styles.subtitle}>
            Train your memory and attention with adaptive challenges
          </Text>
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>Choose a Game</Text>

          <GameCard
            gameType="word_recall"
            title="Word Recall"
            description="Test your short-term memory by recalling words after a delay"
            icon={<WordRecallIcon />}
            onPress={() => handleGameSelect('word_recall')}
            testID="word-recall-card"
          />

          <GameCard
            gameType="nback"
            title="N-Back Task"
            description="Challenge your working memory with dual n-back training"
            icon={<NBackIcon />}
            onPress={() => handleGameSelect('nback')}
            testID="nback-card"
          />
        </View>

        {recentGames.length > 0 && (
          <View style={styles.performanceSection}>
            <Text style={styles.sectionTitle}>Your Performance</Text>
            <PerformanceChart sessions={recentGames} />

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Overall Stats</Text>
              <View style={styles.statsRow}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{recentGames.length}</Text>
                  <Text style={styles.statLabel}>Games Played</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {(
                      (recentGames.reduce(
                        (sum, g) => sum + g.performance.accuracy,
                        0
                      ) /
                        recentGames.length) *
                      100
                    ).toFixed(0)}
                    %
                  </Text>
                  <Text style={styles.statLabel}>Avg Accuracy</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {(
                      recentGames.reduce(
                        (sum, g) => sum + g.performance.difficulty_end,
                        0
                      ) / recentGames.length
                    ).toFixed(1)}
                  </Text>
                  <Text style={styles.statLabel}>Avg Difficulty</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
    paddingBottom: Spacing.screenPadding,
  },
  header: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  title: {
    fontSize: Typography.fontSize.xxxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
  },
  gamesSection: {
    marginBottom: Spacing.xxl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  performanceSection: {
    marginBottom: Spacing.xxl,
  },
  statsCard: {
    backgroundColor: Colors.background.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.cardPadding,
  },
  statsTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
});
