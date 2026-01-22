# FlowState BCI - Development Tasks

## Phase 1: Project Setup & Foundation

- [x] Initialize React Native project with Expo SDK 54+ and TypeScript
- [x] Set up project folder structure (src/screens, src/components, src/services, src/hooks, src/utils, src/types, src/constants)
- [x] Install and configure core dependencies: react-native-ble-plx, @react-navigation/native, @react-navigation/bottom-tabs, expo-sqlite, @react-native-async-storage/async-storage
- [x] Install and configure chart library (react-native-chart-kit or victory-native)
- [x] Create TypeScript types for Session, BaselineProfile, CircadianPattern, DeviceInfo, and AppSettings
- [x] Set up React Context for global state management (DeviceContext, SessionContext, SettingsContext)
- [x] Configure ESLint and Prettier for code consistency
- [x] Set up dark theme color palette (calming blues/purples) as design tokens

## Phase 2: Database & Storage Layer

- [x] Create SQLite database schema for baselines table (theta_mean, theta_std, alpha_mean, beta_mean, peak_theta_freq, optimal_freq, calibration_timestamp, quality_score)
- [x] Create SQLite database schema for sessions table (id, session_type, start_time, end_time, duration_seconds, avg_theta_zscore, max_theta_zscore, entrainment_freq, volume, signal_quality_avg, subjective_rating, notes)
- [x] Create SQLite database schema for circadian_patterns table (hour_of_day, avg_theta_mean, avg_theta_std, session_count, avg_subjective_rating)
- [x] Implement DatabaseService with CRUD operations for all tables
- [x] Implement AsyncStorage wrapper for user settings and device pairing info
- [x] Create data export utilities for CSV, JSON, and EDF formats
- [x] Add database migration support for future schema updates

## Phase 3: BLE Device Communication

- [x] Create BLEService class with device scanning, connection, and disconnection methods
- [x] Implement auto-reconnect logic with exponential backoff (2s, 4s, 8s intervals)
- [x] Create BLE characteristic handlers for EEG data stream (notify), entrainment control (write), device status (read/notify)
- [x] Implement connection quality monitoring using RSSI values
- [x] Add paired device storage and retrieval from AsyncStorage
- [x] Create mock BLE service for development/testing without hardware
- [x] Implement BLE data packet parsing for EEG samples (500Hz headband, 250Hz earpiece)

## Phase 4: Signal Processing (Mobile)

- [x] Implement DC offset removal function for EEG data epochs
- [x] Create Butterworth bandpass filter (0.5-50 Hz) using typed arrays
- [x] Implement Welch's periodogram for power spectrum estimation (2-4 second windows)
- [x] Create theta (4-8 Hz), alpha (8-13 Hz), and beta (13-30 Hz) band power extraction
- [x] Implement z-score normalization function using baseline mean and std
- [x] Create sliding buffer manager for real-time EEG processing (last 2-4 seconds)
- [x] Implement amplitude threshold artifact detection (±100 µV)
- [x] Implement gradient threshold artifact detection (>50 µV per sample)
- [x] Implement frequency ratio artifact detection (30-50 Hz vs 4-30 Hz ratio >2.0)
- [x] Create signal quality score calculator (0-100 based on artifact percentage)

## Phase 5: Navigation & Screen Structure

- [x] Set up React Navigation with bottom tab navigator (Dashboard, Session, History, Settings)
- [x] Create navigation types for TypeScript type-safe navigation
- [x] Create DashboardScreen placeholder with basic layout
- [x] Create ActiveSessionScreen placeholder with basic layout
- [x] Create HistoryScreen placeholder with tab navigation (List, Calendar, Trends, Stats)
- [x] Create SettingsScreen placeholder with section categories
- [x] Create CalibrationScreen placeholder for calibration flow
- [x] Create DevicePairingScreen for BLE device setup
- [x] Create OnboardingScreen with swipeable tour (3 screens)

## Phase 6: Dashboard Screen

- [x] Create DeviceStatusWidget showing connection status, battery level, and signal quality
- [x] Create TodaySummaryWidget showing session count, total time, and avg theta
- [x] Create ThetaTrendWidget with sparkline chart of recent theta values
- [x] Create NextSessionWidget showing circadian-aware session suggestion
- [x] Create QuickBoostButton component (one-tap 5-min session at 6Hz)
- [x] Create CalibrateButton component linking to calibration flow
- [x] Create CustomSessionButton component for configurable sessions
- [x] Implement widget layout with ScrollView and proper spacing
- [x] Add pull-to-refresh for updating dashboard data

## Phase 7: Active Session Screen

- [x] Create SessionTimer component with elapsed/total time display
- [x] Create ThetaNumericDisplay showing current z-score value with color coding
- [x] Create ThetaGaugeDisplay with circular gauge and color-coded zones (red/yellow/green/blue)
- [x] Create ThetaTimeSeriesChart with scrolling line chart (last 1-5 minutes)
- [x] Create visualization mode toggle (Numeric, Gauge, Chart)
- [x] Create FrequencySlider component (4-8 Hz, 0.1 Hz increments)
- [x] Create VolumeSlider component (0-100%)
- [x] Create large Pause/Resume button with clear visual state
- [x] Create Stop button for ending session early
- [x] Create SignalQualityIndicator (corner placement, tap for details)
- [x] Create EntrainmentStateDisplay showing current frequency prominently
- [x] Implement session state machine (idle, running, paused, stopped)
- [x] Add session completion handler with summary display

## Phase 8: Calibration Flow

- [x] Create CalibrationInstructionsScreen with device setup guidance
- [x] Create CalibrationCountdownScreen (30-second settle period)
- [x] Create CalibrationProgressScreen with real-time signal quality display
- [x] Create CalibrationSummaryScreen showing baseline results
- [x] Implement calibration session state machine
- [x] Add auto-pause when signal quality critically degraded (<20%)
- [x] Display percentage of clean data during calibration
- [x] Implement calibration data collection (5-10 minute duration options)
- [x] Add recalibration prompt if quality score is poor (<50)

## Phase 9: History & Analytics

- [ ] Create SessionListView with scrollable list, newest first
- [ ] Create SessionListItem showing date, duration, avg theta, frequency, rating
- [ ] Add filter controls for date range and session type
- [ ] Add sort controls (date, duration, theta score)
- [ ] Create SessionDetailScreen for individual session breakdown
- [ ] Create CalendarHeatMap component with monthly grid view
- [ ] Implement color intensity based on session outcome
- [ ] Create ThetaTrendChart showing avg z-score over time (7d/30d/3mo/all)
- [ ] Create FrequencyConvergenceChart showing ML frequency changes
- [ ] Create CircadianPatternChart showing theta by time of day
- [ ] Create SessionFrequencyChart (bar chart, sessions per week)
- [ ] Create StatisticsDashboard with summary cards (this week, this month, all time)
- [ ] Add streak tracking display (current streak, longest streak)

## Phase 10: Settings Screen

- [ ] Create DeviceManagementSection with paired devices list and forget/re-pair options
- [ ] Create NotificationPreferencesSection (enable/disable, style, frequency, quiet hours)
- [ ] Create AudioSettingsSection (mixing behavior, default volume, mixing ratio)
- [ ] Create EntrainmentSettingsSection (auto-boost, boost frequency, boost time)
- [ ] Create ThetaThresholdSection (target z-score slider +0.5 to +2.0, closed-loop behavior picker)
- [ ] Create ThemeAccessibilitySection (text size, reduce motion, haptic feedback)
- [ ] Create DataManagementSection (export buttons, clear history, storage usage)
- [ ] Create PrivacySettingsSection (anonymous analytics toggle, data policy link)
- [ ] Create AboutSection with app version and firmware version display

## Phase 11: Closed-Loop Entrainment Logic

- [ ] Implement theta monitoring service that computes z-score in real-time
- [ ] Create threshold comparison logic (z-score > target for >10 seconds)
- [ ] Implement "Reduce intensity" behavior (decrease volume by 10-20%)
- [ ] Implement "Stop entrainment" behavior
- [ ] Implement "Maintain level" behavior
- [ ] Add hysteresis logic (trigger at threshold+0.2, resume at threshold-0.2)
- [ ] Create closed-loop adjustment logger (timestamp, reason, parameters)
- [ ] Implement user preference storage for closed-loop behavior
- [ ] Add mid-session behavior change capability

## Phase 12: Session Management

- [ ] Create session configuration screen with duration presets (5, 15, 30, 60 min, custom)
- [ ] Implement session start flow with device connection check
- [ ] Create session data logger saving theta values at 0.5 Hz
- [ ] Implement entrainment parameter logging (frequency, volume over time)
- [ ] Add manual adjustment tracking
- [ ] Create post-session subjective rating prompt (1-5 scale)
- [ ] Implement session save to SQLite on completion
- [ ] Add session recovery after app restart (restore in-progress session)

## Phase 13: Onboarding Flow

- [ ] Create WelcomeScreen with app introduction and skip option
- [ ] Create TourScreen1: "Monitor your theta waves in real-time"
- [ ] Create TourScreen2: "Personalized audio entrainment adapts to your brain"
- [ ] Create TourScreen3: "Track your progress and optimize over time"
- [ ] Create PermissionsScreen for Bluetooth, Notifications, Calendar requests
- [ ] Create DevicePairingPrompt with "Pair now" or "Skip for later" options
- [ ] Create FirstSessionSuggestion screen (Quick Boost vs Calibrate choice)
- [ ] Implement onboarding completion flag in AsyncStorage
- [ ] Add contextual tooltips system for first-time feature discovery

## Phase 14: Python Signal Processing Service

- [ ] Set up Python FastAPI project with virtual environment
- [ ] Create /health endpoint returning service status and version
- [ ] Create /calibration/process endpoint accepting raw EEG data
- [ ] Implement NumPy/SciPy preprocessing pipeline (DC removal, bandpass filter)
- [ ] Implement artifact rejection (amplitude, gradient, frequency methods)
- [ ] Implement Welch periodogram for multi-band power extraction
- [ ] Calculate baseline statistics (mean, std, percentiles for theta/alpha/beta)
- [ ] Implement peak theta frequency detection via FFT
- [ ] Calculate calibration quality score and confidence metric
- [ ] Return baseline profile as JSON response
- [ ] Create WebSocket endpoint for real-time calibration streaming
- [ ] Add CORS configuration for mobile app communication

## Phase 15: ML Personalization Pipeline (Python)

- [ ] Create /ml/train endpoint accepting session history JSON
- [ ] Implement feature extraction (physiological, behavioral, temporal features)
- [ ] Train gradient boosting model (XGBoost or LightGBM) for optimal frequency prediction
- [ ] Implement cross-validation and hyperparameter tuning
- [ ] Export trained model as lightweight format (ONNX or JSON)
- [ ] Create model metadata output (accuracy, confidence, feature importance)
- [ ] Add fallback logic when insufficient training data (<10 sessions)
- [ ] Implement model retraining trigger (weekly batch job)

## Phase 16: Mobile-Python Integration

- [ ] Create NetworkService for HTTP communication with Python service
- [ ] Implement BLE-to-HTTP bridge for forwarding raw EEG during calibration
- [ ] Handle Python service response and store baseline profile
- [ ] Add error handling for network failures with retry logic
- [ ] Implement offline mode detection and queuing
- [ ] Create ML model loader for on-device inference
- [ ] Display optimal frequency suggestion from ML model on dashboard

## Phase 17: Scheduled Sessions & Circadian Awareness

- [ ] Create ScheduledSessionManager for managing future sessions
- [ ] Implement circadian pattern analysis from session history
- [ ] Generate optimal session time suggestions based on historical theta peaks
- [ ] Create scheduling UI with time picker and repeat options
- [ ] Implement push notification service for session reminders
- [ ] Add notification style options (simple, smart, gentle, off)
- [ ] Create quiet hours configuration
- [ ] Implement calendar integration for detecting focus/work/study events
- [ ] Add adherence tracking and adaptive suggestion refinement

## Phase 18: Data Export Implementation

- [ ] Implement CSV export with session summary columns
- [ ] Implement JSON export with complete user profile
- [ ] Implement EDF export for raw EEG data (with electrode metadata)
- [ ] Create share sheet integration for iOS/Android
- [ ] Add export progress indicator for large datasets
- [ ] Create data deletion confirmation flow with "Clear all data" option

## Phase 19: A/B Testing Mode

- [ ] Create A/B testing toggle in settings
- [ ] Implement randomized session assignment (real theta vs sham non-theta)
- [ ] Create blinded user experience (no indication of session type during)
- [ ] Store session type (real/sham) hidden from user until analysis
- [ ] Implement statistical analysis comparing real vs sham outcomes
- [ ] Create results display screen after 10+ sessions
- [ ] Show theta comparison and rating difference with confidence intervals

## Phase 20: Adaptive Presets

- [ ] Analyze session history to cluster by context (time of day, duration, outcome)
- [ ] Generate preset suggestions from successful session configurations
- [ ] Create preset display on dashboard ("Morning Boost", "Afternoon Focus", etc.)
- [ ] Allow user to save custom presets with name and parameters
- [ ] Implement preset selection quick-start flow
- [ ] Track preset usage and adapt suggestions based on user choices

## Phase 21: Third-Party Integrations

- [ ] Create IntegrationsSettingsSection with available integrations list
- [ ] Implement OAuth flow for Todoist integration
- [ ] Implement OAuth flow for Notion integration
- [ ] Fetch productivity data (tasks completed, focus time)
- [ ] Correlate productivity data with FlowState session history
- [ ] Display correlation insights ("You study 25% longer on session days")
- [ ] Add integration disconnect and data clear options

## Phase 22: Audio Mixing & Controls

- [ ] Implement exclusive audio mode (pause other audio during entrainment)
- [ ] Implement mix mode (blend isochronic tones with other audio)
- [ ] Create mixing ratio control slider
- [ ] Configure iOS AVAudioSession for mixing behavior
- [ ] Configure Android AudioManager for mixing behavior
- [ ] Detect playing audio and suggest appropriate mode

## Phase 23: Testing & Quality Assurance

- [ ] Set up Jest for unit testing
- [ ] Write unit tests for signal processing functions (filter, FFT, artifact detection)
- [ ] Write unit tests for z-score normalization
- [ ] Write unit tests for database CRUD operations
- [ ] Set up Detox for end-to-end testing
- [ ] Write E2E test for onboarding flow
- [ ] Write E2E test for calibration flow
- [ ] Write E2E test for daily session flow
- [ ] Write E2E test for data export flow
- [ ] Create mock BLE device for integration testing
- [ ] Add crash reporting integration (Sentry or similar)

## Phase 24: Polish & Performance

- [ ] Optimize real-time chart rendering for smooth 2-5 Hz updates
- [ ] Implement memory management for long session data buffers
- [ ] Add loading states and skeleton screens throughout app
- [ ] Implement error boundaries with user-friendly error messages
- [ ] Add haptic feedback for key interactions
- [ ] Optimize SQLite queries for history screens with large datasets
- [ ] Add app state persistence for background/foreground transitions
- [ ] Test and optimize battery usage during active sessions

## Phase 25: Documentation & Release Prep

- [ ] Write README with setup instructions and architecture overview
- [ ] Document API endpoints for Python service
- [ ] Create user guide with screenshots for key features
- [ ] Write privacy policy document
- [ ] Prepare app store metadata (description, screenshots, keywords)
- [ ] Configure app icons and splash screen
- [ ] Set up CI/CD pipeline for builds
- [ ] Create release checklist for TestFlight/Play Store deployment
