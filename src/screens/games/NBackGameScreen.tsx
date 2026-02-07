/**
 * N-Back Game Screen
 * Play the dual n-back working memory game
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
const screenWidth = Dimensions.get('window').width;
const gridPadding = Spacing.screenPadding * 2;
const cellSize = (screenWidth - gridPadding - (GRID_SIZE - 1) * Spacing.sm) / GRID_SIZE;

export const NBackGameScreen: React.FC<GamesScreenProps<'NBackGame'>> = () => {
  const navigation = useNavigation();
  const {
    gameState,
    generateNextTrial,
    recordTrialResponse,
    endGame,
    getCurrentGameEngine,
  } = useGames();

  const [currentStimulus, setCurrentStimulus] = useState<NBackStimulus | null>(null);
  const [positionPressed, setPositionPressed] = useState(false);
  const [audioPressed, setAudioPressed] = useState(false);
  const [trialStartTime, setTrialStartTime] = useState(Date.now());
  const [currentTrial, setCurrentTrial] = useState(0);
  const [correctTrials, setCorrectTrials] = useState(0);
  const [totalTrials] = useState(20); // Configurable based on difficulty

  useEffect(() => {
    startNewTrial();
  }, []);

  const startNewTrial = () => {
    try {
      const stimulus = generateNextTrial() as NBackStimulus;
      setCurrentStimulus(stimulus);
      setPositionPressed(false);
      setAudioPressed(false);
      setTrialStartTime(Date.now());

      // Auto-submit after stimulus duration (2-3 seconds based on difficulty)
      setTimeout(() => {
        handleSubmitResponse();
      }, 2500); // Default duration
    } catch (error) {
      console.error('Failed to generate trial:', error);
    }
  };

  const handleSubmitResponse = async () => {
    if (!currentStimulus) return;

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
        const correct = trials[trials.length - 1].correct;
        setCorrectTrials(prev => prev + (correct ? 1 : 0));
        setCurrentTrial(trials.length);

        if (trials.length >= totalTrials) {
          // End game after completing all trials
          handleEndGame();
        } else {
          // Start next trial
          startNewTrial();
        }
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

  const renderGrid = () => {
    const cells = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      const isActive = currentStimulus?.position === i;
      cells.push(
        <View
          key={i}
          style={[
            styles.gridCell,
            { width: cellSize, height: cellSize },
            isActive && styles.gridCellActive,
          ]}
        />
      );
    }
    return cells;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <GameTimer startTime={trialStartTime} isRunning={gameState === 'running'} />
        <TouchableOpacity style={styles.quitButton} onPress={handleQuit}>
          <Text style={styles.quitButtonText}>Quit</Text>
        </TouchableOpacity>
      </View>

      <TrialProgress
        currentTrial={currentTrial}
        totalTrials={totalTrials}
        correctTrials={correctTrials}
      />

      <View style={styles.content}>
        <View style={styles.stimulusContainer}>
          <View style={styles.grid}>{renderGrid()}</View>

          {currentStimulus && (
            <View style={styles.audioContainer}>
              <Text style={styles.audioLetter}>{currentStimulus.audio_letter}</Text>
            </View>
          )}
        </View>

        <View style={styles.controls}>
          <Text style={styles.instructionText}>
            Press buttons if current stimulus matches n-back
          </Text>

          <View style={styles.buttons}>
            <TouchableOpacity
              style={[
                styles.responseButton,
                positionPressed && styles.responseButtonPressed,
              ]}
              onPress={() => setPositionPressed(!positionPressed)}
              activeOpacity={0.7}
            >
              <Text style={styles.responseButtonText}>
                Position Match
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.responseButton,
                audioPressed && styles.responseButtonPressed,
              ]}
              onPress={() => setAudioPressed(!audioPressed)}
              activeOpacity={0.7}
            >
              <Text style={styles.responseButtonText}>
                Audio Match
              </Text>
            </TouchableOpacity>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenPadding,
    paddingTop: Spacing.xl,
  },
  stimulusContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: cellSize * GRID_SIZE + Spacing.sm * (GRID_SIZE - 1),
    gap: Spacing.sm,
    marginBottom: Spacing.xxl,
  },
  gridCell: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  gridCellActive: {
    backgroundColor: Colors.accent.primary,
    borderColor: Colors.accent.primary,
  },
  audioContainer: {
    width: 100,
    height: 100,
    borderRadius: BorderRadius.round,
    backgroundColor: Colors.accent.primaryDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioLetter: {
    fontSize: Typography.fontSize.display,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.accent.primary,
  },
  controls: {
    paddingBottom: Spacing.xl,
  },
  instructionText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  buttons: {
    gap: Spacing.md,
  },
  responseButton: {
    backgroundColor: Colors.surface.secondary,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.border.primary,
  },
  responseButtonPressed: {
    backgroundColor: Colors.accent.primaryDim,
    borderColor: Colors.accent.primary,
  },
  responseButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text.primary,
  },
});
