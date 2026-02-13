/**
 * N-Back Game Screen
 * Dual n-back working memory game with position and audio matching
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Colors, Spacing, BorderRadius, Typography } from '../../constants/theme';
import { GamesScreenProps } from '../../types/navigation';
import { GameTimer } from '../../components/games/GameTimer';
import { useGames } from '../../contexts/GamesContext';

const GRID_SIZE = 3;
const CELL_SIZE = 70;
const STIMULUS_DURATION = 2500; // Time to show stimulus and collect response
const FEEDBACK_DURATION = 800; // Time to show feedback

// Available letters for audio
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'L', 'N', 'Q', 'R'];

interface Trial {
  position: number; // 0-8 grid position
  letter: string;
  isPositionMatch: boolean;
  isAudioMatch: boolean;
}

interface TrialResult {
  userRespondedPosition: boolean;
  userRespondedAudio: boolean;
  correctPosition: boolean;
  correctAudio: boolean;
  responseTime: number; // milliseconds
}

type Phase = 'showing' | 'feedback' | 'waiting';

export const NBackGameScreen: React.FC<GamesScreenProps<'NBackGame'>> = ({ navigation }) => {
  const { endGame, getCurrentGameEngine } = useGames();

  // REFS: Game-critical state (no re-renders, no stale closures)
  const trialsRef = useRef<Trial[]>([]);
  const currentTrialRef = useRef(0);
  const userPressedPosition = useRef(false);
  const userPressedAudio = useRef(false);
  const trialStartTimeRef = useRef(0);
  const responseTimesRef = useRef<number[]>([]);
  const resultsRef = useRef<TrialResult[]>([]);
  const isEvaluating = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const nLevelRef = useRef(2);
  const gameStartTimeRef = useRef(Date.now());

  // STATE: UI display only (triggers re-renders)
  const [showInstructions, setShowInstructions] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const [displayTrialIndex, setDisplayTrialIndex] = useState(0);
  const [activePosition, setActivePosition] = useState<number | null>(null);
  const [activeLetter, setActiveLetter] = useState('');
  const [positionPressed, setPositionPressed] = useState(false);
  const [audioPressed, setAudioPressed] = useState(false);
  const [positionFeedback, setPositionFeedback] = useState<'correct' | 'incorrect' | 'miss' | null>(null);
  const [audioFeedback, setAudioFeedback] = useState<'correct' | 'incorrect' | 'miss' | null>(null);
  const [trialActive, setTrialActive] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [totalEvaluated, setTotalEvaluated] = useState(0);
  const [totalTrials] = useState(20);

  // Button handlers - dead simple, no stale closures
  const handlePositionPress = useCallback(() => {
    if (!trialActive || isEvaluating.current) {
      console.log('[N-Back] Position press ignored - trialActive:', trialActive, 'isEvaluating:', isEvaluating.current);
      return;
    }

    console.log('[N-Back] Position Match pressed on trial', currentTrialRef.current + 1);
    userPressedPosition.current = true;

    // Record response time on first button press
    if (responseTimesRef.current[currentTrialRef.current] === 0) {
      responseTimesRef.current[currentTrialRef.current] = Date.now() - trialStartTimeRef.current;
      console.log('[N-Back] Response time:', responseTimesRef.current[currentTrialRef.current], 'ms');
    }

    setPositionPressed(true); // Visual feedback only
  }, [trialActive]);

  const handleAudioPress = useCallback(() => {
    if (!trialActive || isEvaluating.current) {
      console.log('[N-Back] Audio press ignored - trialActive:', trialActive, 'isEvaluating:', isEvaluating.current);
      return;
    }

    console.log('[N-Back] Audio Match pressed on trial', currentTrialRef.current + 1);
    userPressedAudio.current = true;

    // Record response time on first button press
    if (responseTimesRef.current[currentTrialRef.current] === 0) {
      responseTimesRef.current[currentTrialRef.current] = Date.now() - trialStartTimeRef.current;
      console.log('[N-Back] Response time:', responseTimesRef.current[currentTrialRef.current], 'ms');
    }

    setAudioPressed(true); // Visual feedback only
  }, [trialActive]);

  // Generate trial sequence upfront
  const generateTrialSequence = (n: number, numTrials: number): Trial[] => {
    const sequence: Trial[] = [];
    const positions: number[] = [];
    const letters: string[] = [];

    console.log(`[N-Back] Generating ${numTrials} trials for ${n}-back`);

    for (let i = 0; i < numTrials; i++) {
      // Generate random position and letter
      const position = Math.floor(Math.random() * 9);
      const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];

      positions.push(position);
      letters.push(letter);

      // Determine if this trial is a match
      let isPositionMatch = false;
      let isAudioMatch = false;

      if (i >= n) {
        // Compare current trial (index i) with N trials back (index i - n)
        isPositionMatch = positions[i] === positions[i - n];
        isAudioMatch = letters[i] === letters[i - n];

        // Debug logging for matches
        if (isPositionMatch || isAudioMatch) {
          console.log(`[N-Back] Trial ${i + 1}: MATCH DETECTED!`, {
            currentPos: positions[i],
            nBackPos: positions[i - n],
            currentLetter: letters[i],
            nBackLetter: letters[i - n],
            isPositionMatch,
            isAudioMatch,
          });
        }
      }

      sequence.push({
        position,
        letter,
        isPositionMatch,
        isAudioMatch,
      });
    }

    // Count matches for verification
    const posMatches = sequence.filter(t => t.isPositionMatch).length;
    const audMatches = sequence.filter(t => t.isAudioMatch).length;
    console.log(`[N-Back] Generated sequence: ${posMatches} position matches, ${audMatches} audio matches`);

    return sequence;
  };

  // Get N-back level from game config
  const getNBackLevel = (): number => {
    const engine = getCurrentGameEngine();
    if (!engine) return 2;
    const config = (engine as any).config;
    const difficulty = config.difficulty ?? 5;
    if (difficulty <= 2) return 1;
    if (difficulty <= 5) return 2;
    if (difficulty <= 7) return 3;
    return 4;
  };

  // Trial flow using refs to avoid stale closures
  const startTrial = useCallback((index: number) => {
    const trial = trialsRef.current[index];
    if (!trial) {
      console.log('[N-Back] startTrial: no trial at index', index);
      return;
    }

    console.log(`[N-Back] ===== STARTING TRIAL ${index + 1}/${trialsRef.current.length} =====`);

    // Enhanced debugging for match detection
    const referenceTrialIndex = index - nLevelRef.current;
    const referenceTrial = referenceTrialIndex >= 0 ? trialsRef.current[referenceTrialIndex] : null;

    console.log(`[N-Back] Current trial:`, {
      index,
      position: trial.position,
      letter: trial.letter,
      isPositionMatch: trial.isPositionMatch,
      isAudioMatch: trial.isAudioMatch,
    });

    if (referenceTrial) {
      console.log(`[N-Back] ${nLevelRef.current}-back reference trial (index ${referenceTrialIndex}):`, {
        position: referenceTrial.position,
        letter: referenceTrial.letter,
      });
    }

    // Reset refs
    currentTrialRef.current = index;
    userPressedPosition.current = false;
    userPressedAudio.current = false;
    isEvaluating.current = false;
    trialStartTimeRef.current = Date.now();
    responseTimesRef.current[index] = 0;

    // Update display state
    setDisplayTrialIndex(index);
    setActivePosition(trial.position);
    setActiveLetter(trial.letter);
    setPositionPressed(false);
    setAudioPressed(false);
    setPositionFeedback(null);
    setAudioFeedback(null);
    setTrialActive(true);

    // Speak letter
    Speech.speak(trial.letter, { language: 'en', rate: 0.8, pitch: 1.0 });

    // Set timer for end of response window
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      console.log(`[N-Back] Response window ended for trial ${index + 1}`);
      evaluateTrial(index);
    }, STIMULUS_DURATION);
  }, []);

  const evaluateTrial = useCallback((index: number) => {
    console.log(`[N-Back] ===== EVALUATING TRIAL ${index + 1} =====`);

    isEvaluating.current = true;
    setTrialActive(false);

    const trial = trialsRef.current[index];
    const pressedPos = userPressedPosition.current;
    const pressedAudio = userPressedAudio.current;

    // Determine correctness
    const posCorrect = pressedPos === trial.isPositionMatch;
    const audCorrect = pressedAudio === trial.isAudioMatch;
    const trialCorrect = posCorrect && audCorrect;

    console.log(`[N-Back] Expected:`, {
      shouldPressPosition: trial.isPositionMatch,
      shouldPressAudio: trial.isAudioMatch,
    });
    console.log(`[N-Back] User pressed:`, { position: pressedPos, audio: pressedAudio });
    console.log(`[N-Back] Result:`, {
      positionCorrect: posCorrect ? '✓' : '✗',
      audioCorrect: audCorrect ? '✓' : '✗',
      trialCorrect: trialCorrect ? '✓ CORRECT' : '✗ INCORRECT',
    });

    // Show feedback
    if (pressedPos && trial.isPositionMatch) {
      setPositionFeedback('correct');
    } else if (pressedPos && !trial.isPositionMatch) {
      setPositionFeedback('incorrect');
    } else if (!pressedPos && trial.isPositionMatch) {
      setPositionFeedback('miss');
    } else {
      setPositionFeedback('correct'); // Correct rejection
    }

    if (pressedAudio && trial.isAudioMatch) {
      setAudioFeedback('correct');
    } else if (pressedAudio && !trial.isAudioMatch) {
      setAudioFeedback('incorrect');
    } else if (!pressedAudio && trial.isAudioMatch) {
      setAudioFeedback('miss');
    } else {
      setAudioFeedback('correct'); // Correct rejection
    }

    // Save result
    const result: TrialResult = {
      userRespondedPosition: pressedPos,
      userRespondedAudio: pressedAudio,
      correctPosition: posCorrect,
      correctAudio: audCorrect,
      responseTime: responseTimesRef.current[index],
    };
    resultsRef.current.push(result);

    const newCorrectCount = resultsRef.current.filter(r => r.correctPosition && r.correctAudio).length;
    setCorrectCount(newCorrectCount);
    setTotalEvaluated(resultsRef.current.length);

    console.log('[N-Back] Stats:', { correct: newCorrectCount, total: resultsRef.current.length });

    // Clear highlight
    setActivePosition(null);

    // Advance after feedback
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (index + 1 < trialsRef.current.length) {
        console.log(`[N-Back] Advancing to trial ${index + 2}`);
        startTrial(index + 1);
      } else {
        console.log('[N-Back] All trials completed');
        endGameAndShowResults();
      }
    }, FEEDBACK_DURATION);
  }, []);

  // Start game - pre-generate all trials
  const handleStartGame = useCallback(() => {
    const level = getNBackLevel();
    nLevelRef.current = level;
    const sequence = generateTrialSequence(level, totalTrials);
    trialsRef.current = sequence;
    responseTimesRef.current = new Array(sequence.length).fill(0);

    setShowInstructions(false);
    setGameStarted(true);

    // Start first trial
    startTrial(0);
  }, [totalTrials, startTrial]);

  // End game and show results
  const endGameAndShowResults = useCallback(async () => {
    try {
      const results = resultsRef.current;

      // Calculate overall accuracy (both position AND audio correct)
      const totalCorrect = results.filter(r => r.correctPosition && r.correctAudio).length;
      const finalAccuracy = results.length > 0 ? (totalCorrect / results.length) * 100 : 0;

      // Calculate position-only accuracy
      const positionCorrect = results.filter(r => r.correctPosition).length;
      const positionAccuracy = results.length > 0 ? (positionCorrect / results.length) * 100 : 0;

      // Calculate audio-only accuracy
      const audioCorrect = results.filter(r => r.correctAudio).length;
      const audioAccuracy = results.length > 0 ? (audioCorrect / results.length) * 100 : 0;

      // Calculate average response time (only for trials where user responded)
      const responseTimes = results.filter(r => r.responseTime > 0).map(r => r.responseTime);
      const avgResponseTime = responseTimes.length > 0
        ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
        : 0;

      console.log('[N-Back] ===== FINAL RESULTS =====');
      console.log('[N-Back] Total trials:', results.length);
      console.log('[N-Back] Correct trials:', totalCorrect);
      console.log('[N-Back] Overall accuracy:', finalAccuracy.toFixed(1) + '%');
      console.log('[N-Back] Position accuracy:', positionAccuracy.toFixed(1) + '%');
      console.log('[N-Back] Audio accuracy:', audioAccuracy.toFixed(1) + '%');
      console.log('[N-Back] Avg response time:', avgResponseTime.toFixed(0) + 'ms');

      // Save to database via GamesContext
      const sessionDetail = await endGame();

      // Navigate with computed results as backup
      // NOTE: Pass accuracy as DECIMAL (0.5 for 50%) to match database format
      navigation.navigate('GameResults', {
        sessionId: sessionDetail.id,
        directResults: {
          accuracy: finalAccuracy / 100, // Convert percentage to decimal
          avgResponseTime: avgResponseTime,
          totalTrials: results.length,
          correctTrials: totalCorrect,
          positionAccuracy: positionAccuracy / 100,
          audioAccuracy: audioAccuracy / 100,
          gameType: 'nback' as const,
          nLevel: nLevelRef.current,
        },
      });
    } catch (error) {
      console.error('[N-Back] Failed to end game:', error);
      Alert.alert('Error', 'Failed to end game. Please try again.');
    }
  }, [endGame, navigation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      Speech.stop();
      console.log('[N-Back] Component unmounted, timers cleared');
    };
  }, []);

  const handleQuit = useCallback(() => {
    Alert.alert(
      'Quit Game',
      'Are you sure you want to quit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Quit',
          style: 'destructive',
          onPress: endGameAndShowResults,
        },
      ]
    );
  }, [endGameAndShowResults]);

  // Calculate current accuracy
  const currentAccuracy = totalEvaluated > 0
    ? Math.round((correctCount / totalEvaluated) * 100)
    : 0;

  // Render grid
  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const isActive = activePosition === i;
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
            <Text style={styles.modalTitle}>{getNBackLevel()}-Back Game</Text>
            <Text style={styles.modalText}>
              A position will highlight on the grid and a letter will appear.
            </Text>
            <Text style={styles.modalText}>
              Press <Text style={styles.highlight}>'Position Match'</Text> if the position is the same as {getNBackLevel()} trial{getNBackLevel() > 1 ? 's' : ''} ago.
            </Text>
            <Text style={styles.modalText}>
              Press <Text style={styles.highlight}>'Audio Match'</Text> if the letter is the same as {getNBackLevel()} trial{getNBackLevel() > 1 ? 's' : ''} ago.
            </Text>
            <Text style={styles.modalText}>
              Press both if both match!
            </Text>
            <View style={styles.modalInfoBox}>
              <Text style={styles.modalInfoText}>
                Example: If N={getNBackLevel()} and you see position B on trial 5, press Position Match if trial {5 - getNBackLevel()} also had position B.
              </Text>
            </View>
            <Pressable
              style={styles.modalButton}
              onPress={handleStartGame}
            >
              <Text style={styles.modalButtonText}>Start Game</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* Header */}
      <View style={styles.header}>
        <GameTimer startTime={gameStartTimeRef.current} isRunning={gameStarted} />
        <Pressable style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Quit</Text>
        </Pressable>
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <Text style={styles.statsText}>
          Trial {displayTrialIndex + 1} of {totalTrials}
        </Text>
        <Text style={styles.statsText}>
          {currentAccuracy}% Correct
        </Text>
      </View>

      {/* Game Content */}
      <View style={styles.content}>
        {/* Audio Letter Display */}
        {gameStarted && (
          <View style={styles.audioContainer}>
            <Text style={styles.audioLabel}>Letter:</Text>
            <Text style={styles.audioLetter}>{activeLetter}</Text>
          </View>
        )}

        {/* Grid */}
        <View style={styles.gridContainer}>
          <View style={styles.grid}>{renderGrid()}</View>
        </View>

        {/* Instruction */}
        <Text style={styles.instructionText}>
          Press if current matches {nLevelRef.current} trial{nLevelRef.current > 1 ? 's' : ''} ago
        </Text>

        {/* Response Buttons */}
        <View style={styles.buttons}>
          <Pressable
            onPress={handlePositionPress}
            style={({ pressed }) => [
              styles.matchButton,
              positionPressed && styles.buttonSelected,
              positionFeedback === 'correct' && styles.buttonCorrect,
              positionFeedback === 'incorrect' && styles.buttonIncorrect,
              positionFeedback === 'miss' && styles.buttonMiss,
              pressed && !positionPressed && styles.buttonPressing,
            ]}
          >
            <Text style={styles.buttonText}>Position{'\n'}Match</Text>
          </Pressable>

          <Pressable
            onPress={handleAudioPress}
            style={({ pressed }) => [
              styles.matchButton,
              audioPressed && styles.buttonSelected,
              audioFeedback === 'correct' && styles.buttonCorrect,
              audioFeedback === 'incorrect' && styles.buttonIncorrect,
              audioFeedback === 'miss' && styles.buttonMiss,
              pressed && !audioPressed && styles.buttonPressing,
            ]}
          >
            <Text style={styles.buttonText}>Audio{'\n'}Match</Text>
          </Pressable>
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
    paddingHorizontal: Spacing.screenPadding,
  },
  matchButton: {
    flex: 1,
    paddingVertical: 20,
    borderRadius: BorderRadius.lg,
    backgroundColor: '#1a2a3a',
    borderWidth: 2,
    borderColor: '#2a3a4a',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 70,
  },
  buttonSelected: {
    backgroundColor: '#0d3d4d',
    borderColor: '#64ffda',
  },
  buttonCorrect: {
    backgroundColor: '#1b5e20',
    borderColor: '#4CAF50',
  },
  buttonIncorrect: {
    backgroundColor: '#b71c1c',
    borderColor: '#F44336',
  },
  buttonMiss: {
    backgroundColor: '#e65100',
    borderColor: '#FF9800',
  },
  buttonPressing: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
    textAlign: 'center',
  },
});
