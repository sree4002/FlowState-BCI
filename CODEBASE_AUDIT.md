# FlowState BCI — Codebase Audit

**Prepared for:** Nina (CTO)
**Date:** February 2026
**Auditor:** Automated code audit + manual review

---

## Section 1: Architecture Overview

### App Structure

The React Native (Expo) mobile app lives entirely in `src/` and follows a clean layered architecture:

```
src/
├── screens/          # 14 screens (pages the user navigates between)
├── components/       # 36 reusable UI components + 8 game-specific components
├── services/         # Core business logic, state machines, hardware abstraction
│   ├── eeg/          # EEG data source abstraction (strategy pattern)
│   ├── entrainment/  # Audio output abstraction
│   ├── ble/          # BLE characteristic handlers
│   ├── games/        # Cognitive game engines
│   └── migrations/   # SQLite schema migrations
├── contexts/         # 5 React Contexts for global state management
├── utils/            # 10 utility modules (signal processing, circadian, haptics)
├── types/            # TypeScript type definitions + declaration files
└── constants/        # Theme tokens and app constants
```

### Key Design Patterns

**1. EEGSource Interface (Strategy Pattern)**
`src/services/eeg/EEGSource.ts` defines a clean interface that all EEG data sources implement:
- `SimulatedEEGSource` — connects to a Python WebSocket server for development/testing
- `BleEEGSource` — **STUB** — placeholder for real BLE hardware

Swapping sources requires changing only the instantiation — no other code changes needed.

**2. EntrainmentOutput Interface (Strategy Pattern)**
`src/services/entrainment/EntrainmentOutput.ts` defines the audio output interface:
- `PhoneAudioOutput` — plays isochronic tones via phone speakers/headphones
- Future: `BleEarpieceOutput` for bone conduction earpiece

**3. ClosedLoopController (Orchestrator)**
`src/services/ClosedLoopController.ts` bridges EEGSource → EntrainmentOutput:
- Monitors theta z-score from any EEG source
- Triggers entrainment when theta drops below threshold (z < -0.5)
- Stops when theta recovers (z > -0.3, with hysteresis)
- Cooldown prevents rapid on/off cycling

**4. State Machines**
- `SessionStateMachine` — manages session lifecycle (idle → running → paused → stopped)
- `CalibrationStateMachine` — manages calibration flow (instructions → countdown → recording → summary)

**5. React Context for State Management**
- `SettingsContext` — app settings, simulated mode config
- `SessionContext` — active session state
- `DeviceContext` — BLE device connection state
- `SimulatedModeContext` — manages simulated EEG source + closed-loop controller
- `GamesContext` — cognitive game state and history

### Data Flow

```
EEG Source (Simulated or BLE)
    │
    ▼ EEGMetrics {theta_power, z_score, theta_state, signal_quality}
    │
ClosedLoopController
    │
    ├── z_score < -0.5 → EntrainmentOutput.play(6Hz)
    ├── z_score > -0.3 → EntrainmentOutput.stop()
    │
    ▼ Controller state + metrics → React Context → UI
```

---

## Section 2: What's Built and Working

### Screens (14)

| Screen | File | Description |
|--------|------|-------------|
| Dashboard | `DashboardScreen.tsx` | Home screen with widgets: device status, today's summary, theta trend, next session suggestion, quick-start buttons |
| Active Session | `ActiveSessionScreen.tsx` | Live session view with real-time theta display (numeric/gauge/chart), frequency/volume sliders, pause/stop controls |
| Calibration | `CalibrationScreen.tsx` | Container for the 4-step calibration flow |
| Calibration Instructions | `CalibrationInstructionsScreen.tsx` | Step-by-step device setup guidance |
| Calibration Countdown | `CalibrationCountdownScreen.tsx` | 30-second settle period before recording baseline |
| Calibration Progress | `CalibrationProgressScreen.tsx` | Real-time signal quality display during baseline recording |
| Calibration Summary | `CalibrationSummaryScreen.tsx` | Shows baseline results with quality assessment |
| Settings | `SettingsScreen.tsx` | App settings with section categories |
| Device Pairing | `DevicePairingScreen.tsx` | BLE device scanning, connection, and pairing UI |
| Onboarding | `OnboardingScreen.tsx` | 3-screen swipeable onboarding tour |
| First Session | `FirstSessionSuggestionScreen.tsx` | Prompts new users to start their first session |
| Insights | `InsightsScreen.tsx` | Session history and analytics |
| Profile | `ProfileScreen.tsx` | User profile screen |
| Game Hub | `games/GameHubScreen.tsx` | Cognitive games landing screen with game cards |
| Game Config | `games/GameConfigScreen.tsx` | Pre-game difficulty and settings configuration |
| N-Back Game | `games/NBackGameScreen.tsx` | Dual n-back working memory game UI |
| Word Recall | `games/WordRecallGameScreen.tsx` | Word recall memory test game UI |
| Game Results | `games/GameResultsScreen.tsx` | Post-game performance summary with theta correlation |

### Services (25+ modules)

| Service | File | Description |
|---------|------|-------------|
| EEGSource interface | `services/eeg/EEGSource.ts` | Abstract interface for all EEG data sources |
| SimulatedEEGSource | `services/eeg/SimulatedEEGSource.ts` | WebSocket client that connects to Python EEG simulator |
| BleEEGSource | `services/eeg/BleEEGSource.ts` | **STUB** — placeholder for real BLE hardware |
| EntrainmentOutput interface | `services/entrainment/EntrainmentOutput.ts` | Abstract interface for audio output |
| PhoneAudioOutput | `services/entrainment/PhoneAudioOutput.ts` | Plays isochronic tone WAV files via expo-av |
| ClosedLoopController | `services/ClosedLoopController.ts` | Core closed-loop logic: EEG monitoring → entrainment triggering |
| SessionStateMachine | `services/SessionStateMachine.ts` | Session lifecycle state management |
| CalibrationStateMachine | `services/CalibrationStateMachine.ts` | Calibration flow state management |
| BLEService | `services/BLEService.ts` | Device scanning, connection, disconnect with auto-reconnect |
| MockBleService | `services/MockBleService.ts` | Mock BLE for development without hardware |
| BlePacketParser | `services/BlePacketParser.ts` | Parses raw BLE data packets from EEG hardware |
| ConnectionQualityMonitor | `services/ConnectionQualityMonitor.ts` | RSSI-based connection quality tracking |
| Database | `services/database.ts` | SQLite CRUD for baselines, sessions, circadian patterns |
| GameDatabase | `services/gameDatabase.ts` | SQLite CRUD for game sessions and trials |
| Storage | `services/storage.ts` | AsyncStorage wrapper for settings and device pairing |
| ExportService | `services/exportService.ts` | Session data export (CSV, JSON, EDF) |
| ShareService | `services/shareService.ts` | Share exported data via native share sheet |
| AudioMixingService | `services/audioMixingService.ts` | Audio session management and mixing |
| DataClearingService | `services/dataClearingService.ts` | User data deletion |
| CrashReportingService | `services/crashReportingService.ts` | Sentry integration with graceful stub fallback |
| SignalProcessing | `services/signalProcessing.ts` | FFT, Welch's periodogram, band power extraction |
| SlidingBufferManager | `services/slidingBufferManager.ts` | Real-time EEG buffer management |
| CognitiveGameEngine | `services/games/CognitiveGameEngine.ts` | Base class for cognitive game engines |
| NBackGame | `services/games/NBackGame.ts` | Dual n-back game logic with adaptive difficulty |
| WordRecallGame | `services/games/WordRecallGame.ts` | Word recall test logic with word pools |
| AdaptiveDifficultyManager | `services/games/AdaptiveDifficultyManager.ts` | Difficulty adjustment based on performance |
| SessionGameIntegration | `services/games/SessionGameIntegration.ts` | Integrates game results with EEG session data |
| BLE Handlers | `services/ble/*.ts` | EEG data, device status, and entrainment control characteristic handlers |
| Migrations | `services/migrations/*.ts` | 5 SQLite migration scripts (baselines, sessions, circadian, game_sessions, game_trials) |

### Components (36 + 8 game-specific)

**Session & Theta Display:**
- `ThetaNumericDisplay` — current z-score with color coding
- `ThetaGaugeDisplay` — circular gauge with color zones (red/yellow/green/blue)
- `ThetaTimeSeriesChart` — scrolling line chart of theta over time
- `SessionTimer` — elapsed/total time display
- `SignalQualityIndicator` — corner signal quality badge
- `EntrainmentStateDisplay` — current entrainment frequency and state
- `VisualizationModeToggle` — switch between numeric/gauge/chart views

**Controls:**
- `FrequencySlider` — 4-8 Hz slider with 0.1 Hz increments
- `VolumeSlider` — 0-100% volume control
- `PauseResumeButton` — large pause/resume with visual state
- `StopButton` — end session
- `AudioMixingControls` — audio session mixing UI

**Dashboard Widgets:**
- `DeviceStatusWidget` — connection status, battery, signal quality
- `TodaySummaryWidget` — session count, total time, avg theta
- `ThetaTrendWidget` — sparkline chart of recent theta values
- `NextSessionWidget` — circadian-aware session suggestion
- `QuickBoostButton` — one-tap 5-min session at 6Hz
- `CalibrateButton` — link to calibration flow
- `CustomSessionButton` — configurable session launcher

**Shared UI:**
- `ErrorBoundary` — React error boundary with recovery UI
- `LoadingStates` — skeleton placeholders and loading indicators
- `Tooltip` — contextual information popover
- `ExportProgressModal` — export progress dialog
- `DataDeletionModal` — data deletion confirmation
- `SessionFilterControls` — history filtering UI
- `SessionListItem` / `SessionListView` — session history list
- `SessionCompletionHandler` — post-session summary and rating
- `SimulatedModeDebugView` — developer debug controls
- `DeveloperOptions` — developer settings panel
- `DebugOverlay` — debug information overlay
- `DemoModeBanner` — demo mode indicator
- `NeuralNetworkVisualization` — neural network animation
- `TabIcons` — bottom tab bar icons

**Game Components (8):**
- `GameCard`, `GameTimer`, `ScoreDisplay`, `TrialProgress`, `DifficultySelector`, `PerformanceChart`, `ResultsSummary`, `ThetaCorrelationWidget`

### Test Coverage

- **97 test files** in `__tests__/`
- **~6,300 total tests** (5,713 passing, 4 failing, 605 todo)
- **16 mock files** in `__mocks__/` (comprehensive mocks for RN, BLE, SQLite, Expo modules)
- **5 E2E test files** in `e2e/` (stubs only — awaiting native builds)
- **CI pipeline** runs on every push/PR: TypeScript check → Jest tests → ESLint

---

## Section 3: What's Stubbed / Incomplete

### Critical Stub: BleEEGSource

**File:** `src/services/eeg/BleEEGSource.ts`

This is the only production code stub in the codebase. The `start()` method throws `'BleEEGSource not yet implemented'`. All other production code is fully implemented.

**What needs to be implemented:**
1. Connect to BLE device via `BLEService`
2. Subscribe to EEG data characteristic notifications
3. Process raw BLE data through the signal processing pipeline (DC offset removal → Butterworth bandpass → Welch's periodogram → band power extraction → z-score normalization)
4. Emit `EEGMetrics` to registered callbacks

**What does NOT need to change:**
- `ClosedLoopController` — works with any `EEGSource` implementation
- `PhoneAudioOutput` — already fully working
- All UI screens and components — already bound via React Context

### BLE Characteristic Handlers — Implemented but Not Wired

The BLE handlers in `src/services/ble/` are fully implemented:
- `eegDataHandler.ts` — parses EEG data notifications
- `deviceStatusHandler.ts` — parses device status (battery, signal quality)
- `entrainmentControlHandler.ts` — writes entrainment commands

These handlers exist and are tested, but they aren't yet wired into `BleEEGSource`. That wiring is the implementation work needed.

### Other TODOs Found

| Location | TODO | Priority |
|----------|------|----------|
| `src/screens/games/GameConfigScreen.tsx:54` | Show error message to user (error handling gap) | Low |
| `src/types/victory-native.d.ts:8` | Migrate to victory-native v41+ CartesianChart API | Low |
| `src/constants/index.ts` | Empty export placeholder | Low |
| `src/services/index.ts` | Empty export placeholder | Low |

### Crash Reporting Sentry Stub

`src/services/crashReportingService.ts` has a deliberate Sentry stub fallback — if `@sentry/react-native` isn't installed (it currently isn't in `package.json`), the service gracefully falls back to console logging. This is intentional and not a gap.

### E2E Tests — All Stubs

The 5 E2E test files (`e2e/*.e2e.ts`) contain ~109 TODO markers. They're test stubs awaiting native iOS/Android builds for Detox integration. The test framework and mocked init exist but no real E2E assertions yet.

### Game Unit Tests — Partially Stubbed

Several game-related test files have `TODO` markers for tests that should be implemented now that the game engines exist: `AdaptiveDifficultyManager.test.ts`, `NBackGame.test.ts`, `WordRecallGame.test.ts`, `CognitiveGameEngine.test.ts`, `GamesContext.test.tsx`.

---

## Section 4: What Still Needs to Be Built for Hackathon Demo

For a working end-to-end demo: **Real EEG data → theta detection → auto-trigger entrainment**

### Must-Have (Demo-Critical)

1. **Implement `BleEEGSource.ts`** — Wire `BLEService` + `BlePacketParser` + signal processing to produce `EEGMetrics`. The interface is defined, the handlers exist, the signal processing utils exist — this is an integration task, not a greenfield build.

2. **Test with OpenBCI Ganglion hardware** — Verify BLE scanning, connection, and data streaming with the actual headband. The `BLEService` and `MockBleService` are built but untested against real hardware.

3. **Add Python signal processing pipeline to `signal/`** — Either:
   - Port the existing `simulator/eeg_simulator.py` approach to use BrainFlow for real OpenBCI data, OR
   - Rely entirely on the TypeScript signal processing already in `src/utils/signalProcessing.ts` (which has FFT, band power, artifact detection — may be sufficient for demo)

4. **Add ESP32 firmware to `firmware/`** — For the earpiece to generate isochronic tones via bone conduction. Alternatively, the demo could use `PhoneAudioOutput` (phone speakers) which already works.

### Nice-to-Have (Post-Demo)

- Fix the 4 failing database migration tests (version tracking accumulation bug)
- Implement the ~605 `todo` test stubs
- Add E2E tests once native builds are available
- Migrate from victory-native legacy API to v41+ CartesianChart
- Add Sentry for real crash reporting

---

## Section 5: Code Quality Notes

### Strengths

- **Clean interface abstractions** — The EEGSource / EntrainmentOutput strategy pattern means the entire system can be tested with simulated data and swapped to real hardware with a one-line change
- **Comprehensive signal processing** — FFT, Welch's method, Butterworth filters, band power extraction, artifact detection (amplitude, gradient, frequency ratio) — all implemented in TypeScript
- **Strong type safety** — `strict: true` TypeScript with well-defined interfaces for all key domain types
- **Good test infrastructure** — Sophisticated mocks (especially the in-memory SQLite mock with SQL parsing), 97 test files, CI runs on every push
- **State machines** — Session and calibration flows use explicit state machines rather than ad-hoc boolean flags
- **Hysteresis in ClosedLoopController** — Proper engineering to prevent rapid entrainment toggling

### Concerns

- **`*.png` in `.gitignore`** — This prevents committing new image assets. Existing tracked PNGs (app icons, splash screen) are fine because they were committed before this rule. Any new PNG assets would need to be force-added. Consider removing this rule or using a more targeted pattern.
- **`--legacy-peer-deps` in CI** — The `npm ci --legacy-peer-deps` flag suggests unresolved peer dependency conflicts. Worth investigating and resolving.
- **Duplicate `@types/jest` and `@types/react`** — These appear in both `dependencies` and `devDependencies` in `package.json`. Should be only in `devDependencies`.
- **`react-test-renderer` deprecation** — Tests emit deprecation warnings. This is used by `@testing-library/react-native` internally.
- **4 failing migration tests** — `database-migrations.test.ts` has 4 failures related to migration version tracking accumulating instead of applying incrementally.
- **Serial test execution** — `maxWorkers: 1` in Jest config means tests run sequentially (41.6s). May be required by shared in-memory database state, but worth investigating parallelization.
- **Potentially unused dependencies** — `react-native-worklets`, `@expo/ngrok`, and `react-native-chart-kit` (if Victory is the actual chart library being used) may be removable.
- **`simulator/venv/` committed to git** — A Python virtual environment with pip packages is tracked in git history. It's now in `.gitignore` but the historical bloat remains.

### Test Quality Assessment

- **Signal processing tests** — Excellent. Thorough unit tests with edge cases, real-world scenario testing (eye blink artifacts, muscle movement, electrode disconnection).
- **Database tests** — Good integration tests with proper setup/teardown (except the 4 migration failures).
- **BLE tests** — Good coverage of scanning, connection, reconnection, packet parsing.
- **Component tests** — Mostly shallow render checks (`.toBeVisible()`) without deep interaction or state change testing. Adequate for regression detection but not behavioral confidence.
- **Setup/config tests** — ~8 tests verify folder structure, TypeScript config, ESLint config. Useful for CI safety but don't test features.

---

## Section 6: Recommended Next Steps

### Priority 1: Hackathon Demo Path (Week 1-2)

1. **Implement `BleEEGSource.ts`** — Connect the already-built `BLEService`, `BlePacketParser`, and `eegDataHandler` to produce real `EEGMetrics` from OpenBCI Ganglion data. This is the single most impactful task.

2. **Hardware smoke test** — Get a basic BLE connection to the Ganglion, read raw EEG data, verify signal quality. Don't need the full closed-loop yet — just prove data flows.

3. **Decide on signal processing approach** — The TypeScript pipeline (`src/utils/signalProcessing.ts`) may be sufficient for the demo. If not, add the Python BrainFlow pipeline to `signal/`.

4. **ESP32 firmware or phone-only demo** — Decide whether the demo needs the ESP32 earpiece or if phone speaker output (already working) is sufficient. Phone-only significantly reduces scope.

### Priority 2: Stabilization (Week 2-3)

5. **Fix the 4 failing migration tests** — Database migration version tracking bug
6. **Move `@types/jest` and `@types/react` to devDependencies only** — Clean up package.json
7. **Resolve peer dependency conflicts** — Remove need for `--legacy-peer-deps`
8. **Fill in game test stubs** — The game engines are built but tests are partially stubbed

### Priority 3: Polish (Week 3-4)

9. **Add E2E test coverage** — Once native builds are working, fill in the Detox test stubs
10. **Remove `*.png` from `.gitignore`** — Or use a more targeted ignore pattern
11. **Add coverage reporting to CI** — Jest is configured for it but CI doesn't enforce thresholds
12. **Clean up root-level markdown files** — There are 6 untracked `*_COMPLETE.md` / `*_FIX.md` files from previous debugging sessions that should either be committed to `docs/` or removed
