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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { GameTimer } from '../../components/games/GameTimer';
import { ScoreDisplay } from '../../components/games/ScoreDisplay';
import { useGames } from '../../contexts/GamesContext';
import {
  WordRecallStimulus,
  WordRecallResponse,
} from '../../types/games';

type GamePhase = 'instructions' | 'display' | 'delay' | 'recall' | 'results' | 'complete';

export const WordRecallGameScreen: React.FC<GamesScreenProps<'WordRecallGame'>> = ({ navigation }) => {
  const {
    gameState,
    generateNextTrial,
    recordTrialResponse,
    endGame,
    getCurrentGameEngine,
  } = useGames();

  const [phase, setPhase] = useState<GamePhase>('instructions');
  const [currentStimulus, setCurrentStimulus] = useState<WordRecallStimulus | null>(null);
  const [recalledWords, setRecalledWords] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [trialStartTime, setTrialStartTime] = useState(Date.now());
  const [phaseTimer, setPhaseTimer] = useState(0);

  // Multi-round tracking
  const [currentRound, setCurrentRound] = useState(1);
  const [totalWordsCorrect, setTotalWordsCorrect] = useState(0);
  const [totalWordsShown, setTotalWordsShown] = useState(0);

  const handleStartGame = () => {
    setPhase('display');
    setCurrentRound(1);
    setTotalWordsCorrect(0);
    setTotalWordsShown(0);
    startNewTrial();
  };

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

      // Show inline results before navigating to full results
      setPhase('results');
    } catch (error) {
      console.error('Failed to record trial:', error);
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    }
  };

  const calculateResults = () => {
    if (!currentStimulus) return { correct: [], missed: [], incorrect: [], accuracy: 0 };

    const originalWords = currentStimulus.words.map(w => w.toLowerCase());
    const recalled = recalledWords.map(w => w.toLowerCase());

    const correct = recalled.filter(w => originalWords.includes(w));
    const missed = originalWords.filter(w => !recalled.includes(w));
    const incorrect = recalled.filter(w => !originalWords.includes(w));

    const accuracy = originalWords.length > 0
      ? Math.round((correct.length / originalWords.length) * 100)
      : 0;

    return { correct, missed, incorrect, accuracy };
  };

  const handleContinuePlaying = () => {
    if (!currentStimulus) return;

    // Update cumulative stats
    const results = calculateResults();
    setTotalWordsCorrect(prev => prev + results.correct.length);
    setTotalWordsShown(prev => prev + currentStimulus.words.length);
    setCurrentRound(prev => prev + 1);

    // Start new round
    startNewTrial();
  };

  const handleSeeFinalResults = async () => {
    try {
      // Calculate final cumulative stats
      if (!currentStimulus) return;

      const currentResults = calculateResults();
      const finalCorrect = totalWordsCorrect + currentResults.correct.length;
      const finalShown = totalWordsShown + currentStimulus.words.length;
      const finalAccuracy = finalShown > 0 ? (finalCorrect / finalShown) * 100 : 0;

      console.log('[Word Recall] Final results:', {
        totalRounds: currentRound,
        totalWordsCorrect: finalCorrect,
        totalWordsShown: finalShown,
        accuracy: finalAccuracy.toFixed(1) + '%',
      });

      // Save to database
      const sessionDetail = await endGame();

      // Navigate with computed results as backup
      // NOTE: Pass accuracy as DECIMAL (0.5 for 50%) to match database format
      navigation.navigate('GameResults', {
        sessionId: sessionDetail.id,
        directResults: {
          accuracy: finalAccuracy / 100, // Convert percentage to decimal
          avgResponseTime: 0, // Word recall doesn't track individual response times
          totalTrials: currentRound,
          correctTrials: currentRound, // All rounds completed
          gameType: 'word_recall' as const,
        },
      });
    } catch (error) {
      console.error('Failed to end game:', error);
      Alert.alert('Error', 'Failed to end game. Please try again.');
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

  const getGameInfo = () => {
    const engine = getCurrentGameEngine();
    if (!engine) return { wordCount: 10, studyTime: 20, delayTime: 30 };
    const config = (engine as any).config;
    const difficulty = config.difficulty ?? 5;

    let wordCount = 5, studyTime = 30, delayTime = 10;
    if (difficulty <= 2) {
      wordCount = 5 + difficulty * 1;
      studyTime = 30;
      delayTime = 10;
    } else if (difficulty <= 5) {
      wordCount = 8 + (difficulty - 3) * 2;
      studyTime = 20;
      delayTime = 30;
    } else if (difficulty <= 8) {
      wordCount = 13 + (difficulty - 6) * 2;
      studyTime = 15;
      delayTime = 60;
    } else {
      wordCount = 18 + (difficulty - 9) * 1;
      studyTime = 10;
      delayTime = 90;
    }

    return { wordCount, studyTime, delayTime };
  };

  const gameInfo = getGameInfo();

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Instructions Modal */}
      <Modal
        visible={phase === 'instructions'}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Word Recall Game</Text>
            <Text style={styles.modalText}>
              You will see a list of words. Memorize as many as you can.
            </Text>
            <Text style={styles.modalText}>
              After the study period, you'll have a delay, then type back as many words as you remember.
            </Text>
            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                • Words to memorize: {gameInfo.wordCount}
              </Text>
              <Text style={styles.modalInfoText}>
                • Study time: {gameInfo.studyTime} seconds
              </Text>
              <Text style={styles.modalInfoText}>
                • Delay period: {gameInfo.delayTime} seconds
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={handleStartGame}
            >
              <Text style={styles.modalButtonText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <GameTimer startTime={trialStartTime} isRunning={gameState === 'running'} />
          {phase !== 'instructions' && (
            <Text style={styles.roundIndicator}>Round {currentRound}</Text>
          )}
        </View>
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

        {phase === 'results' && currentStimulus && (
          <View style={styles.resultsPhase}>
            <Text style={styles.phaseTitle}>Round {currentRound} Results</Text>

            {(() => {
              const results = calculateResults();
              const roundWordsCorrect = results.correct.length;
              const roundWordsShown = currentStimulus.words.length;
              const cumulativeCorrect = totalWordsCorrect + roundWordsCorrect;
              const cumulativeShown = totalWordsShown + roundWordsShown;
              const overallAccuracy = cumulativeShown > 0
                ? Math.round((cumulativeCorrect / cumulativeShown) * 100)
                : 0;

              return (
                <>
                  <View style={styles.scoreBox}>
                    <Text style={styles.scoreTitle}>This Round</Text>
                    <Text style={styles.scoreValue}>
                      {results.correct.length} / {currentStimulus.words.length}
                    </Text>
                    <Text style={styles.scorePercentage}>
                      {results.accuracy}% Correct
                    </Text>
                  </View>

                  {currentRound > 1 && (
                    <View style={styles.cumulativeStatsBox}>
                      <Text style={styles.cumulativeTitle}>Overall Performance</Text>
                      <View style={styles.cumulativeRow}>
                        <Text style={styles.cumulativeLabel}>Total Words Correct:</Text>
                        <Text style={styles.cumulativeValue}>{cumulativeCorrect}</Text>
                      </View>
                      <View style={styles.cumulativeRow}>
                        <Text style={styles.cumulativeLabel}>Total Words Shown:</Text>
                        <Text style={styles.cumulativeValue}>{cumulativeShown}</Text>
                      </View>
                      <View style={styles.cumulativeRow}>
                        <Text style={styles.cumulativeLabel}>Overall Accuracy:</Text>
                        <Text style={styles.cumulativeValue}>{overallAccuracy}%</Text>
                      </View>
                    </View>
                  )}

                  <View style={styles.wordComparison}>
                    <View style={styles.comparisonColumn}>
                      <Text style={styles.columnTitle}>Original Words</Text>
                      <View style={styles.wordsGrid}>
                        {currentStimulus.words.map((word, index) => {
                          const wasRecalled = results.correct.includes(word.toLowerCase());
                          return (
                            <View
                              key={index}
                              style={[
                                styles.resultWordChip,
                                wasRecalled ? styles.correctWordChip : styles.missedWordChip,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.resultWordText,
                                  wasRecalled ? styles.correctWordText : styles.missedWordText,
                                ]}
                              >
                                {word}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>

                    <View style={styles.comparisonColumn}>
                      <Text style={styles.columnTitle}>Your Recall</Text>
                      <View style={styles.wordsGrid}>
                        {recalledWords.map((word, index) => {
                          const isCorrect = results.correct.includes(word);
                          const isIncorrect = results.incorrect.includes(word);
                          return (
                            <View
                              key={index}
                              style={[
                                styles.resultWordChip,
                                isCorrect && styles.correctWordChip,
                                isIncorrect && styles.incorrectWordChip,
                              ]}
                            >
                              <Text
                                style={[
                                  styles.resultWordText,
                                  isCorrect && styles.correctWordText,
                                  isIncorrect && styles.incorrectWordText,
                                ]}
                              >
                                {word}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {results.missed.length > 0 && (
                    <View style={styles.missedWordsBox}>
                      <Text style={styles.missedTitle}>
                        Words You Missed ({results.missed.length})
                      </Text>
                      <View style={styles.wordsGrid}>
                        {results.missed.map((word, index) => (
                          <View key={index} style={[styles.resultWordChip, styles.missedWordChip]}>
                            <Text style={[styles.resultWordText, styles.missedWordText]}>
                              {word}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={styles.continuePlayingButton}
                      onPress={handleContinuePlaying}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.continuePlayingButtonText}>Continue Playing</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.finalResultsButton}
                      onPress={handleSeeFinalResults}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.finalResultsButtonText}>See Final Results</Text>
                    </TouchableOpacity>
                  </View>
                </>
              );
            })()}
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.screenPadding,
  },
  modalContent: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  modalTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  modalText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    lineHeight: 24,
  },
  modalInfoBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.lg,
  },
  modalInfoText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  modalButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  modalButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.background.primary,
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  roundIndicator: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.accent.primary,
    backgroundColor: Colors.accent.primaryDim,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
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
  resultsPhase: {
    padding: Spacing.screenPadding,
  },
  scoreBox: {
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  scoreTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
    marginBottom: Spacing.xs,
  },
  scorePercentage: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
  wordComparison: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  comparisonColumn: {
    flex: 1,
  },
  columnTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  resultWordChip: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  correctWordChip: {
    backgroundColor: 'rgba(93, 138, 107, 0.2)',
    borderColor: '#5d8a6b',
  },
  correctWordText: {
    color: '#5d8a6b',
  },
  missedWordChip: {
    backgroundColor: 'rgba(181, 101, 102, 0.2)',
    borderColor: '#b56566',
  },
  missedWordText: {
    color: '#b56566',
  },
  incorrectWordChip: {
    backgroundColor: 'rgba(201, 168, 87, 0.2)',
    borderColor: '#c9a857',
  },
  incorrectWordText: {
    color: '#c9a857',
  },
  resultWordText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
  },
  missedWordsBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  missedTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.secondary,
    marginBottom: Spacing.sm,
  },
  continueButton: {
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  cumulativeStatsBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  cumulativeTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  cumulativeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cumulativeLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  cumulativeValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  continuePlayingButton: {
    flex: 1,
    backgroundColor: Colors.accent.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  continuePlayingButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.background.primary,
  },
  finalResultsButton: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  finalResultsButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
