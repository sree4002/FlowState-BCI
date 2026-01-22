import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { useSession } from '../contexts';
import {
  Colors,
  Spacing,
  BorderRadius,
  Typography,
  Shadows,
} from '../constants/theme';
import { Session, SessionState } from '../types';

/**
 * Session completion data structure
 */
export interface SessionCompletionData {
  session_type: Session['session_type'];
  start_time: number;
  end_time: number;
  duration_seconds: number;
  entrainment_freq: number;
  volume: number;
  avg_theta_zscore: number;
  max_theta_zscore: number;
  signal_quality_avg: number;
  subjective_rating: number | null;
  notes: string | null;
}

/**
 * Props for SessionCompletionHandler component
 */
export interface SessionCompletionHandlerProps {
  /** Whether the modal is visible */
  visible?: boolean;
  /** Session data to display */
  sessionData?: Partial<SessionCompletionData>;
  /** Callback when session is saved */
  onSave?: (data: SessionCompletionData) => void;
  /** Callback when modal is dismissed without saving */
  onDismiss?: () => void;
  /** Callback when user chooses to start a new session */
  onNewSession?: () => void;
  /** Whether to show automatically when session state changes to stopped */
  autoShow?: boolean;
  /** Optional test ID for testing */
  testID?: string;
}

/**
 * Formats duration in seconds to a human-readable string
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Formats duration in seconds to MM:SS or HH:MM:SS
 */
export const formatDurationClock = (seconds: number): string => {
  if (seconds < 0) return '00:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
  }
  return `${pad(minutes)}:${pad(secs)}`;
};

/**
 * Gets a congratulatory message based on session performance
 */
export const getCompletionMessage = (
  durationSeconds: number,
  avgThetaZScore: number | undefined,
  maxThetaZScore: number | undefined
): string => {
  const minutes = Math.floor(durationSeconds / 60);

  // Based on theta z-score performance
  if (avgThetaZScore !== undefined && avgThetaZScore >= 1.5) {
    return 'Excellent session! You achieved deep focus.';
  }
  if (avgThetaZScore !== undefined && avgThetaZScore >= 1.0) {
    return 'Great work! Your theta activity was elevated.';
  }
  if (avgThetaZScore !== undefined && avgThetaZScore >= 0.5) {
    return 'Good session! Keep practicing for better results.';
  }

  // Based on duration
  if (minutes >= 30) {
    return 'Impressive dedication! Long session completed.';
  }
  if (minutes >= 15) {
    return 'Well done! Solid practice session.';
  }
  if (minutes >= 5) {
    return 'Session complete! Every minute counts.';
  }

  return 'Session complete!';
};

/**
 * Gets theta performance level description
 */
export const getThetaPerformanceLevel = (
  avgZScore: number | undefined
): { label: string; color: string } => {
  if (avgZScore === undefined || avgZScore === null) {
    return { label: 'N/A', color: Colors.text.tertiary };
  }
  if (avgZScore >= 1.5) {
    return { label: 'Excellent', color: Colors.status.green };
  }
  if (avgZScore >= 1.0) {
    return { label: 'Great', color: Colors.status.blue };
  }
  if (avgZScore >= 0.5) {
    return { label: 'Good', color: Colors.status.yellow };
  }
  if (avgZScore >= 0) {
    return { label: 'Fair', color: Colors.signal.poor };
  }
  return { label: 'Below Baseline', color: Colors.status.red };
};

/**
 * Gets signal quality level description
 */
export const getSignalQualityLevel = (
  score: number | undefined
): { label: string; color: string } => {
  if (score === undefined || score === null) {
    return { label: 'N/A', color: Colors.text.tertiary };
  }
  if (score >= 80) {
    return { label: 'Excellent', color: Colors.signal.excellent };
  }
  if (score >= 60) {
    return { label: 'Good', color: Colors.signal.good };
  }
  if (score >= 40) {
    return { label: 'Fair', color: Colors.signal.fair };
  }
  if (score >= 20) {
    return { label: 'Poor', color: Colors.signal.poor };
  }
  return { label: 'Critical', color: Colors.signal.critical };
};

/**
 * Formats z-score for display
 */
export const formatZScore = (zscore: number | undefined): string => {
  if (zscore === undefined || zscore === null) {
    return '--';
  }
  const sign = zscore >= 0 ? '+' : '';
  return `${sign}${zscore.toFixed(2)}`;
};

/**
 * Gets session type display label
 */
export const getSessionTypeLabel = (
  sessionType: Session['session_type'] | undefined
): string => {
  switch (sessionType) {
    case 'calibration':
      return 'Calibration';
    case 'quick_boost':
      return 'Quick Boost';
    case 'custom':
      return 'Custom Session';
    case 'scheduled':
      return 'Scheduled Session';
    case 'sham':
      return 'Practice Session';
    default:
      return 'Session';
  }
};

/**
 * Gets the accessibility label for the rating button
 */
export const getRatingAccessibilityLabel = (
  rating: number,
  selectedRating: number | null
): string => {
  const isSelected = selectedRating === rating;
  const ratingLabel = `${rating} star${rating > 1 ? 's' : ''}`;
  return isSelected
    ? `${ratingLabel}, selected`
    : `Rate session ${ratingLabel}`;
};

/**
 * Rating star labels for accessibility
 */
export const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Great',
  5: 'Excellent',
};

/**
 * SessionCompletionHandler - Modal component for session summary display
 *
 * Features:
 * - Displays session summary with duration, theta performance, and signal quality
 * - Allows user to rate the session (1-5 stars)
 * - Allows user to add optional notes
 * - Animated entrance/exit
 * - Accessible with proper labels and hints
 * - Auto-shows when session state changes to 'stopped' (if autoShow is true)
 *
 * Uses session context to read session state and data.
 */
export const SessionCompletionHandler: React.FC<
  SessionCompletionHandlerProps
> = ({
  visible: propVisible,
  sessionData: propSessionData,
  onSave,
  onDismiss,
  onNewSession,
  autoShow = true,
  testID = 'session-completion-handler',
}) => {
  const {
    sessionState,
    sessionConfig,
    currentThetaZScore,
    elapsedSeconds,
    setSessionState,
    addSession,
  } = useSession();

  // Internal visibility state (controlled by autoShow or prop)
  const [internalVisible, setInternalVisible] = useState(false);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Track previous session state to detect transition to stopped
  const prevSessionStateRef = useRef<SessionState>(sessionState);

  // Determine actual visibility
  const isVisible = propVisible !== undefined ? propVisible : internalVisible;

  // Build session data from context or props
  const buildSessionData = useCallback((): Partial<SessionCompletionData> => {
    if (propSessionData) {
      return propSessionData;
    }

    return {
      session_type: sessionConfig?.type ?? 'custom',
      start_time: Date.now() - elapsedSeconds * 1000,
      end_time: Date.now(),
      duration_seconds: elapsedSeconds,
      entrainment_freq: sessionConfig?.entrainment_freq ?? 6,
      volume: sessionConfig?.volume ?? 50,
      avg_theta_zscore: currentThetaZScore ?? 0,
      max_theta_zscore: currentThetaZScore ?? 0,
      signal_quality_avg: 75, // Default, should be passed in via context
    };
  }, [propSessionData, sessionConfig, elapsedSeconds, currentThetaZScore]);

  const [sessionCompletionData, setSessionCompletionData] =
    useState<Partial<SessionCompletionData>>(buildSessionData());

  // Auto-show when session transitions to stopped
  useEffect(() => {
    if (
      autoShow &&
      sessionState === 'stopped' &&
      prevSessionStateRef.current !== 'stopped'
    ) {
      setSessionCompletionData(buildSessionData());
      setInternalVisible(true);
    }
    prevSessionStateRef.current = sessionState;
  }, [sessionState, autoShow, buildSessionData]);

  // Animate modal entrance/exit
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 50,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, slideAnim]);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating === selectedRating ? null : rating);
  };

  const handleSave = async () => {
    setIsSaving(true);

    const completeData: SessionCompletionData = {
      session_type: sessionCompletionData.session_type ?? 'custom',
      start_time: sessionCompletionData.start_time ?? Date.now(),
      end_time: sessionCompletionData.end_time ?? Date.now(),
      duration_seconds: sessionCompletionData.duration_seconds ?? 0,
      entrainment_freq: sessionCompletionData.entrainment_freq ?? 6,
      volume: sessionCompletionData.volume ?? 50,
      avg_theta_zscore: sessionCompletionData.avg_theta_zscore ?? 0,
      max_theta_zscore: sessionCompletionData.max_theta_zscore ?? 0,
      signal_quality_avg: sessionCompletionData.signal_quality_avg ?? 0,
      subjective_rating: selectedRating,
      notes: notes.trim() || null,
    };

    // Add to recent sessions in context
    const sessionRecord: Session = {
      id: Date.now(), // Temporary ID, will be replaced by DB
      ...completeData,
    };
    addSession(sessionRecord);

    if (onSave) {
      onSave(completeData);
    }

    setIsSaving(false);
    handleClose();
  };

  const handleClose = () => {
    setInternalVisible(false);
    setSelectedRating(null);
    setNotes('');

    // Reset session state to idle
    setSessionState('idle');

    if (onDismiss) {
      onDismiss();
    }
  };

  const handleNewSession = () => {
    handleClose();
    if (onNewSession) {
      onNewSession();
    }
  };

  // Get display values
  const duration = sessionCompletionData.duration_seconds ?? 0;
  const avgThetaZScore = sessionCompletionData.avg_theta_zscore;
  const maxThetaZScore = sessionCompletionData.max_theta_zscore;
  const signalQuality = sessionCompletionData.signal_quality_avg;
  const sessionType = sessionCompletionData.session_type;
  const entrainmentFreq = sessionCompletionData.entrainment_freq;

  const completionMessage = getCompletionMessage(
    duration,
    avgThetaZScore,
    maxThetaZScore
  );
  const thetaPerformance = getThetaPerformanceLevel(avgThetaZScore);
  const signalLevel = getSignalQualityLevel(signalQuality);

  const renderRatingStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const isSelected = selectedRating !== null && i <= selectedRating;
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => handleRatingSelect(i)}
          accessibilityRole="button"
          accessibilityLabel={getRatingAccessibilityLabel(i, selectedRating)}
          accessibilityHint={`Tap to rate this session ${i} star${i > 1 ? 's' : ''}`}
          testID={`${testID}-rating-star-${i}`}
          style={styles.starButton}
        >
          <Text
            style={[styles.star, isSelected && styles.starSelected]}
            testID={`${testID}-star-icon-${i}`}
          >
            {isSelected ? '★' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <Animated.View
          style={[styles.overlay, { opacity: fadeAnim }]}
          testID={`${testID}-overlay`}
        >
          <TouchableOpacity
            style={styles.overlayTouchable}
            onPress={handleClose}
            activeOpacity={1}
            testID={`${testID}-overlay-touchable`}
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.modalContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
          testID={`${testID}-modal`}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            {/* Header */}
            <View style={styles.header} testID={`${testID}-header`}>
              <Text style={styles.completionIcon} testID={`${testID}-icon`}>
                ✓
              </Text>
              <Text style={styles.title} testID={`${testID}-title`}>
                Session Complete
              </Text>
              <Text style={styles.message} testID={`${testID}-message`}>
                {completionMessage}
              </Text>
            </View>

            {/* Summary Stats */}
            <View style={styles.statsContainer} testID={`${testID}-stats`}>
              {/* Duration */}
              <View style={styles.statCard} testID={`${testID}-duration-card`}>
                <Text style={styles.statLabel}>Duration</Text>
                <Text style={styles.statValue} testID={`${testID}-duration`}>
                  {formatDurationClock(duration)}
                </Text>
                <Text style={styles.statSubtext}>
                  {formatDuration(duration)}
                </Text>
              </View>

              {/* Theta Performance */}
              <View style={styles.statCard} testID={`${testID}-theta-card`}>
                <Text style={styles.statLabel}>Avg Theta</Text>
                <Text
                  style={[styles.statValue, { color: thetaPerformance.color }]}
                  testID={`${testID}-theta-zscore`}
                >
                  {formatZScore(avgThetaZScore)}
                </Text>
                <Text
                  style={[
                    styles.statSubtext,
                    { color: thetaPerformance.color },
                  ]}
                >
                  {thetaPerformance.label}
                </Text>
              </View>

              {/* Signal Quality */}
              <View style={styles.statCard} testID={`${testID}-signal-card`}>
                <Text style={styles.statLabel}>Signal</Text>
                <Text
                  style={[styles.statValue, { color: signalLevel.color }]}
                  testID={`${testID}-signal-quality`}
                >
                  {signalQuality !== undefined
                    ? `${Math.round(signalQuality)}%`
                    : '--'}
                </Text>
                <Text
                  style={[styles.statSubtext, { color: signalLevel.color }]}
                >
                  {signalLevel.label}
                </Text>
              </View>
            </View>

            {/* Session Details */}
            <View style={styles.detailsSection} testID={`${testID}-details`}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Session Type</Text>
                <Text
                  style={styles.detailValue}
                  testID={`${testID}-session-type`}
                >
                  {getSessionTypeLabel(sessionType)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Entrainment Frequency</Text>
                <Text style={styles.detailValue} testID={`${testID}-frequency`}>
                  {entrainmentFreq ? `${entrainmentFreq.toFixed(1)} Hz` : '--'}
                </Text>
              </View>
              {maxThetaZScore !== undefined && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Peak Theta</Text>
                  <Text
                    style={styles.detailValue}
                    testID={`${testID}-max-theta`}
                  >
                    {formatZScore(maxThetaZScore)}
                  </Text>
                </View>
              )}
            </View>

            {/* Rating Section */}
            <View
              style={styles.ratingSection}
              testID={`${testID}-rating-section`}
            >
              <Text style={styles.ratingTitle}>How was this session?</Text>
              <View
                style={styles.starsContainer}
                testID={`${testID}-stars-container`}
              >
                {renderRatingStars()}
              </View>
              {selectedRating !== null && (
                <Text
                  style={styles.ratingLabel}
                  testID={`${testID}-rating-label`}
                >
                  {RATING_LABELS[selectedRating]}
                </Text>
              )}
            </View>

            {/* Notes Section */}
            <View
              style={styles.notesSection}
              testID={`${testID}-notes-section`}
            >
              <Text style={styles.notesLabel}>Notes (optional)</Text>
              <TextInput
                style={styles.notesInput}
                placeholder="Add notes about this session..."
                placeholderTextColor={Colors.text.tertiary}
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                maxLength={500}
                accessibilityLabel="Session notes"
                accessibilityHint="Enter optional notes about this session"
                testID={`${testID}-notes-input`}
              />
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer} testID={`${testID}-buttons`}>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
                accessibilityRole="button"
                accessibilityLabel="Save session"
                accessibilityHint="Saves the session with your rating and notes"
                testID={`${testID}-save-button`}
              >
                <Text style={styles.saveButtonText}>
                  {isSaving ? 'Saving...' : 'Save Session'}
                </Text>
              </TouchableOpacity>

              <View style={styles.secondaryButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.newSessionButton]}
                  onPress={handleNewSession}
                  accessibilityRole="button"
                  accessibilityLabel="Start new session"
                  accessibilityHint="Saves this session and starts a new one"
                  testID={`${testID}-new-session-button`}
                >
                  <Text style={styles.newSessionButtonText}>New Session</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.dismissButton]}
                  onPress={handleClose}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss"
                  accessibilityHint="Closes this summary without saving rating"
                  testID={`${testID}-dismiss-button`}
                >
                  <Text style={styles.dismissButtonText}>Dismiss</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const { width: screenWidth } = Dimensions.get('window');
const modalWidth = Math.min(screenWidth - Spacing.lg * 2, 400);

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay.dark,
  },
  overlayTouchable: {
    flex: 1,
  },
  modalContainer: {
    width: modalWidth,
    maxHeight: '90%',
    backgroundColor: Colors.surface.elevated,
    borderRadius: BorderRadius.xl,
    ...Shadows.lg,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  completionIcon: {
    fontSize: 48,
    color: Colors.accent.success,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },
  message: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.md * Typography.lineHeight.normal,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text.tertiary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  statSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  detailsSection: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.secondary,
  },
  detailLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
  },
  detailValue: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  ratingSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  ratingTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  starButton: {
    padding: Spacing.xs,
  },
  star: {
    fontSize: 36,
    color: Colors.text.tertiary,
  },
  starSelected: {
    color: Colors.status.yellow,
  },
  ratingLabel: {
    fontSize: Typography.fontSize.md,
    color: Colors.text.secondary,
    marginTop: Spacing.xs,
  },
  notesSection: {
    marginBottom: Spacing.lg,
  },
  notesLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
  },
  notesInput: {
    backgroundColor: Colors.surface.primary,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: Spacing.md,
    color: Colors.text.primary,
    fontSize: Typography.fontSize.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    gap: Spacing.md,
  },
  button: {
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    backgroundColor: Colors.accent.success,
    ...Shadows.sm,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text.inverse,
  },
  secondaryButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.sm,
  },
  newSessionButton: {
    flex: 1,
    backgroundColor: Colors.primary.main,
  },
  newSessionButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.primary,
  },
  dismissButton: {
    flex: 1,
    backgroundColor: Colors.surface.secondary,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },
  dismissButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.text.secondary,
  },
});

export default SessionCompletionHandler;
