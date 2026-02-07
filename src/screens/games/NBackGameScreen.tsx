/**
 * N-Back Game Screen
 * Play the dual n-back working memory game
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { GameTimer } from '../../components/games/GameTimer';
import { TrialProgress } from '../../components/games/TrialProgress';
import { useGames } from '../../contexts/GamesContext';
import {
  NBackStimulus,
  NBackResponse,
} from '../../types/games';

const GRID_SIZE = 3;
const CELL_SIZE = 70; // Fixed size for better layout control
const STIMULUS_DURATION = 2500; // Time to show stimulus
const FEEDBACK_DURATION = 500; // Time to show feedback
const INTER_TRIAL_INTERVAL = 300; // Pause between trials

export const NBackGameScreen: React.FC<GamesScreenProps<'NBackGame'>> = ({ navigation }) => {
  const {
    gameState,
    generateNextTrial,
    recordTrialResponse,
    endGame,
    getCurrentGameEngine,
  } = useGames();

  const [showInstructions, setShowInstructions] = useState(true);
  const [currentStimulus, setCurrentStimulus] = useState<NBackStimulus | null>(null);
  const [positionPressed, setPositionPressed] = useState(false);
  const [audioPressed, setAudioPressed] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState(Date.now());
  const [currentTrial, setCurrentTrial] = useState(0);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [totalTrials] = useState(20); // Configurable based on difficulty
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showStimulus, setShowStimulus] = useState(true);

  const responseTimerRef = useRef<NodeJS.Timeout | null>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTrialTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartGame = () => {
    setShowInstructions(false);
    startNewTrial();
  };

  const startNewTrial = () => {
    try {
      // Clear any existing timers
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (nextTrialTimerRef.current) clearTimeout(nextTrialTimerRef.current);

      // Reset state
      setPositionPressed(false);
      setAudioPressed(false);
      setFeedback(null);
      setIsProcessing(false);
      setShowStimulus(true);

      // Generate new trial
      const stimulus = generateNextTrial() as NBackStimulus;
      setCurrentStimulus(stimulus);
      setTrialStartTime(Date.now());

      // Speak the letter aloud
      if (stimulus.audio_letter) {
        Speech.speak(stimulus.audio_letter, {
          language: 'en',
          rate: 0.8,
          pitch: 1.0,
        });
      }

      // Auto-submit after stimulus duration
      responseTimerRef.current = setTimeout(() => {
        handleSubmitResponse();
      }, STIMULUS_DURATION);
    } catch (error) {
      console.error('Failed to generate trial:', error);
      Alert.alert('Error', 'Failed to start trial. Ending game.');
      handleEndGame();
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentStimulus || isProcessing) return;

    setIsProcessing(true);
    setShowStimulus(false);

    const responseTime = Date.now() - trialStartTime;
    const response: NBackResponse = {
      position_match_pressed: positionPressed,
      audio_match_pressed: audioPressed,
      response_time_ms: responseTime,
    };

    try {
      await recordTrialResponse(
        currentStimulus,
        response,
        responseTime
      );

      const engine = getCurrentGameEngine();
      if (engine) {
        const trials = engine.getTrials();
        const latestTrial = trials[trials.length - 1];
        const isCorrect = latestTrial.correct;

        // Show feedback
        setFeedback(isCorrect ? 'correct' : 'incorrect');

        // Update counters
        if (isCorrect) {
          setCorrectTrials(prev => prev + 1);
        }
        setCurrentTrial(trials.length);

        // Hide feedback and move to next trial or end game
        feedbackTimerRef.current = setTimeout(() => {
          setFeedback(null);

          if (trials.length >= totalTrials) {
            // End game after completing all trials
            handleEndGame();
          } else {
            // Brief pause before next trial
            nextTrialTimerRef.current = setTimeout(() => {
              startNewTrial();
            }, INTER_TRIAL_INTERVAL);
          }
        }, FEEDBACK_DURATION);
      }
    } catch (error) {
      console.error('Failed to record trial:', error);
      Alert.alert('Error', 'Failed to record response. Please try again.');
      setIsProcessing(false);
    }
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      if (nextTrialTimerRef.current) clearTimeout(nextTrialTimerRef.current);
    };
  }, []);

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

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const isActive = currentStimulus?.position === i;
      cells.push(
        <View
          key={i}
          style={[
            styles.gridCell,
            { width: CELL_SIZE, height: CELL_SIZE },
            isActive && styles.gridCellActive,
          ]}
        />
      );
    }
    return cells;
  };

  const getNBackLevel = () => {
    const engine = getCurrentGameEngine();
    if (!engine) return 2;
    const config = (engine as any).config;
    const difficulty = config.difficulty ?? 5;
    if (difficulty <= 2) return 1;
    if (difficulty <= 5) return 2;
    if (difficulty <= 7) return 3;
    return 4;
  };

  const nBackLevel = getNBackLevel();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Instructions Modal */}
      <Modal
        visible={showInstructions}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{nBackLevel}-Back Game</Text>
            <Text style={styles.modalText}>
              A position will highlight on the grid and a letter will appear.
            </Text>
            <Text style={styles.modalText}>
              Press <Text style={styles.highlight}>'Position Match'</Text> if the position is the same as {nBackLevel} trial{nBackLevel > 1 ? 's' : ''} ago.
            </Text>
            <Text style={styles.modalText}>
              Press <Text style={styles.highlight}>'Audio Match'</Text> if the letter is the same as {nBackLevel} trial{nBackLevel > 1 ? 's' : ''} ago.
            </Text>
            <Text style={styles.modalText}>
              Press both if both match!
            </Text>
            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                Example: If N={nBackLevel} and you see position B on trial 5, press Position Match if trial {5 - nBackLevel} also had position B.
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

      {/* Header with timer and quit */}
      <View style={styles.header}>
        <GameTimer startTime={trialStartTime} isRunning={gameState === 'running'} />
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Quit</Text>
        </TouchableOpacity>
      </View>

      {/* Trial counter and accuracy */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          Trial {currentTrial + 1} of {totalTrials}
        </Text>
        <Text style={styles.statsText}>
          {Math.round((correctTrials / Math.max(currentTrial, 1)) * 100)}% Correct
        </Text>
      </View>

      <View style={styles.content}>
        {/* Audio letter display - above grid */}
        {currentStimulus && (
          <View style={styles.audioContainer}>
            <Text style={styles.audioLabel}>Letter:</Text>
            <Text style={styles.audioLetter}>{currentStimulus.audio_letter}</Text>
          </View>
        )}

        {/* 3x3 Grid - centered and appropriately sized */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>{renderGrid()}</View>
        </View>

        {/* Instruction text */}
        <Text style={styles.instructionText}>
          Press if current matches N trials ago
        </Text>

        {/* Response buttons - side by side */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={[
              styles.responseButton,
              positionPressed && styles.responseButtonPressed,
              feedback === 'correct' && positionPressed && styles.responseButtonCorrect,
              feedback === 'incorrect' && styles.responseButtonIncorrect,
            ]}
            onPress={() => !isProcessing && setPositionPressed(!positionPressed)}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Text style={styles.responseButtonText}>
              Position{'\n'}Match
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.responseButton,
              audioPressed && styles.responseButtonPressed,
              feedback === 'correct' && audioPressed && styles.responseButtonCorrect,
              feedback === 'incorrect' && styles.responseButtonIncorrect,
            ]}
            onPress={() => !isProcessing && setAudioPressed(!audioPressed)}
            activeOpacity={0.7}
            disabled={isProcessing}
          >
            <Text style={styles.responseButtonText}>
              Audio{'\n'}Match
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  highlight: {
    color: Colors.accent.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  modalInfoBox: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginVertical: Spacing.lg,
  },
  modalInfoText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    lineHeight: 20,
    fontStyle: 'italic',
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.screenPadding,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface.secondary,
  },
  statsText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.lg,
    justifyContent: 'space-between',
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  audioLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
  audioLetter: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
    minWidth: 50,
    textAlign: 'center',
  },
  gridContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CELL_SIZE * GRID_SIZE + Spacing.md * (GRID_SIZE - 1),
    gap: Spacing.md,
  },
  gridCell: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    borderColor: Colors.border.primary,
  },
  gridCellActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  instructionText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginVertical: Spacing.lg,
  },
  buttons: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingBottom: Spacing.xl,
  },
  responseButton: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.border.primary,
    minHeight: 70,
  },
  responseButtonPressed: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  responseButtonCorrect: {
    backgroundColor: 'rgba(93, 138, 107, 0.3)',
    borderColor: '#5d8a6b',
  },
  responseButtonIncorrect: {
    backgroundColor: 'rgba(181, 101, 102, 0.3)',
    borderColor: '#b56566',
  },
  responseButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
