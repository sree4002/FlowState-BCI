/**
 * Word Recall Game Screen
 * Play the word recall memory game
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { GameTimer } from '../../components/games/GameTimer';
import { ScoreDisplay } from '../../components/games/ScoreDisplay';
import { useGames } from '../../contexts/GamesContext';
import {
  WordRecallStimulus,
  WordRecallResponse,
} from '../../types/games';

type GamePhase = 'display' | 'delay' | 'recall' | 'complete';

export const WordRecallGameScreen: React.FC<GamesScreenProps<'WordRecallGame'>> = () => {
  const navigation = useNavigation();
  const {
    gameState,
    generateNextTrial,
    recordTrialResponse,
    endGame,
    getCurrentGameEngine,
  } = useGames();

  const [phase, setPhase] = useState<GamePhase>('display');
  const [currentStimulus, setCurrentStimulus] = useState<WordRecallStimulus | null>(null);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [trialStartTime, setTrialStartTime] = useState(Date.now());
  const [phaseTimer, setPhaseTimer] = useState(0);

  useEffect(() => {
    // Start first trial
    startNewTrial();
  }, []);

  useEffect(() => {
    if (!currentStimulus) return;

    let timer: NodeJS.Timeout;

    if (phase === 'display') {
      timer = setTimeout(() => {
        setPhase('delay');
        setPhaseTimer(Date.now());
      }, currentStimulus.display_duration_ms);
    } else if (phase === 'delay') {
      timer = setTimeout(() => {
        setPhase('recall');
        setPhaseTimer(Date.now());
      }, currentStimulus.delay_duration_ms);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [phase, currentStimulus]);

  const startNewTrial = () => {
    try {
      const stimulus = generateNextTrial() as WordRecallStimulus;
      setCurrentStimulus(stimulus);
      setRecalledWords([]);
      setCurrentInput('');
      setPhase('display');
      setTrialStartTime(Date.now());
      setPhaseTimer(Date.now());
    } catch (error) {
      console.error('Failed to generate trial:', error);
    }
  };

  const handleAddWord = () => {
    const word = currentInput.trim();
    if (word && !recalledWords.includes(word.toLowerCase())) {
      setRecalledWords([...recalledWords, word.toLowerCase()]);
      setCurrentInput('');
    }
  };

  const handleRemoveWord = (word: string) => {
    setRecalledWords(recalledWords.filter((w) => w !== word));
  };

  const handleSubmitRecall = async () => {
    if (!currentStimulus) return;

    const responseTime = Date.now() - trialStartTime;
    const response: WordRecallResponse = {
      recalled_words: recalledWords,
      recall_time_ms: Date.now() - phaseTimer,
    };

    try {
      await recordTrialResponse(
        currentStimulus,
        response,
        responseTime
      );

      const engine = getCurrentGameEngine();
      if (engine && engine.getCurrentTrialNumber() >= 5) {
        // End after 5 trials (configurable)
        setPhase('complete');
      } else {
        // Start next trial
        startNewTrial();
      }
    } catch (error) {
      console.error('Failed to record trial:', error);
    }
  };

  const handleEndGame = async () => {
    try {
      const sessionDetail = await endGame();
      navigation.navigate('GameResults', { sessionId: sessionDetail.id });
    } catch (error) {
      console.error('Failed to end game:', error);
      Alert.alert('Error', 'Failed to end game. Please try again.');
    }
  };

  const handleQuit = () => {
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit? Your progress will be saved.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: handleEndGame,
        },
      ]
    );
  };

  if (phase === 'complete') {
    handleEndGame();
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <GameTimer startTime={trialStartTime} isRunning={gameState === 'running'} />
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Quit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {phase === 'display' && currentStimulus && (
          <View style={styles.displayPhase}>
            <Text style={styles.phaseTitle}>Memorize These Words</Text>
            <View style={styles.wordsGrid}>
              {currentStimulus.words.map((word, index) => (
                <View key={index} style={styles.wordChip}>
                  <Text style={styles.wordText}>{word}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {phase === 'delay' && (
          <View style={styles.delayPhase}>
            <Text style={styles.phaseTitle}>Wait...</Text>
            <Text style={styles.phaseDescription}>
              Get ready to recall the words
            </Text>
          </View>
        )}

        {phase === 'recall' && (
          <View style={styles.recallPhase}>
            <Text style={styles.phaseTitle}>Recall the Words</Text>
            <Text style={styles.phaseDescription}>
              Type and add as many words as you remember
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a word..."
                placeholderTextColor={Colors.text.tertiary}
                value={currentInput}
                onChangeText={setCurrentInput}
                onSubmitEditing={handleAddWord}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddWord}
                disabled={!currentInput.trim()}
              >
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>

            {recalledWords.length > 0 && (
              <View style={styles.recalledWords}>
                <Text style={styles.recalledTitle}>
                  Your Answers ({recalledWords.length})
                </Text>
                <View style={styles.wordsGrid}>
                  {recalledWords.map((word, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.recalledWordChip}
                      onPress={() => handleRemoveWord(word)}
                    >
                      <Text style={styles.recalledWordText}>{word}</Text>
                      <Text style={styles.removeIcon}>✕</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmitRecall}
              activeOpacity={0.7}
            >
              <Text style={styles.submitButtonText}>Submit Answers</Text>
            </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },
  quitButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.button.dangerBg,
  },
  quitButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.button.danger,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.xl,
  },
  displayPhase: {
    flex: 1,
  },
  delayPhase: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recallPhase: {
    flex: 1,
  },
  phaseTitle: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  phaseDescription: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  wordsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  wordChip: {
    backgroundColor: Colors.accent.primaryDim,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  wordText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.accent.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.md,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  addButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  recalledWords: {
    marginBottom: Spacing.xl,
  },
  recalledTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  recalledWordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.theta.high,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  recalledWordText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.background.primary,
  },
  removeIcon: {
    fontSize: Typography.fontSize.md,
    color: Colors.background.primary,
  },
  submitButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  submitButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
});
