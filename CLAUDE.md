# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FlowState BCI: Closed-loop EEG neurofeedback system. Monitors theta rhythms (4-8 Hz), triggers isochronic tone entrainment when theta drops below baseline. React Native/Expo mobile app with TypeScript.

**Current Priority**: Hackathon demo — implement `BleEEGSource` to connect OpenBCI Ganglion hardware and close the real-time feedback loop.

## Development Commands

```bash
# Start app
npx expo start

# Start EEG simulator (for development without hardware)
cd simulator && python eeg_simulator.py --host 0.0.0.0 --port 8765

# Testing
npm test                    # Run all tests (~6,300 tests, 97 files)
npm test -- <filename>      # Run specific test file
npm test -- --coverage      # With coverage report
npx tsc --noEmit           # TypeScript type check

# Code quality
npm run lint                # ESLint
npm run format              # Prettier format

# Dependencies (IMPORTANT: use --legacy-peer-deps flag)
npm ci --legacy-peer-deps
```

## Architecture Overview

### Closed-Loop System (3 Layers)

**1. EEG Input** (`src/services/eeg/`)
- `EEGSource` interface — abstraction for all EEG sources
- `SimulatedEEGSource` — WebSocket to Python simulator (working, for dev/testing)
- `BleEEGSource` — **STUB** — needs implementation for real hardware
- Emits `EEGMetrics` (theta_power, z_score, theta_state, signal_quality)

**2. Control** (`src/services/ClosedLoopController.ts`)
- Monitors EEG metrics from any source
- Hysteresis-based threshold detection (start entrainment: z < -0.5, stop: z > -0.3)
- States: idle → monitoring → entraining → cooldown

**3. Audio Output** (`src/services/entrainment/`)
- `EntrainmentOutput` interface
- `PhoneAudioOutput` — works, plays isochronic tones via expo-av
- Future: `BleEarpieceOutput` for ESP32 bone conduction earpiece

**Key Pattern**: Source-agnostic design. Swap SimulatedEEGSource → BleEEGSource with one line change. No controller/UI changes needed.

### React Contexts (State Management)

- `SessionContext` — Active session state, controls ClosedLoopController
- `SettingsContext` — User prefs, calibration baselines (AsyncStorage)
- `DeviceContext` — BLE connection state
- `SimulatedModeContext` — Simulated mode toggle, WebSocket config
- `GamesContext` — Cognitive game state (N-Back, Word Recall)

### Database (SQLite via expo-sqlite)

- Migration system in `src/services/migrations/` (5 migrations so far)
- Tables: baselines, sessions, circadian_patterns, game_sessions, game_trials
- To add migration: Create `00N_description.ts`, register in `allMigrations`

### Services (`src/services/`)

- `signalProcessing.ts` — FFT, Welch's method, Butterworth filters, band power, z-score, artifact detection (already implemented in TypeScript)
- `BLEService.ts` + `src/services/ble/` — BLE scanning, connection, packet parsing, characteristic handlers
- `games/` — N-Back and Word Recall engines with adaptive difficulty
- State machines: `SessionStateMachine`, `CalibrationStateMachine`

## Critical Implementation Gap

### BleEEGSource — ONLY Production Stub

**File**: `src/services/eeg/BleEEGSource.ts` — `start()` throws error

**What to implement:**
1. Connect to BLE device via `BLEService` (already exists)
2. Subscribe to EEG characteristic using `eegDataHandler` (already exists)
3. Process raw data through `signalProcessing.ts` pipeline (already exists)
4. Emit `EEGMetrics` to callbacks

**What NOT to change**: Controller, audio output, UI — all ready to receive real EEG data.

The handlers (`src/services/ble/eegDataHandler.ts`, etc.) are implemented and tested. This is an integration task, not greenfield.

## Development Practices

### Work Style
- **Correctness over speed** — Prioritize maintainability
- **Strict type safety** — No `any` types, use proper TypeScript
- **Test-driven development** — Aim for ~80% coverage, write tests for changes
- **Plan mode for large changes** — Use plan mode for architectural changes, get approval before implementing

### TypeScript
- Use `@/` path alias: `import { EEGSource } from '@/services/eeg'`
- `strict: true` enforced in tsconfig.json

### Testing
- Tests in `__tests__/` (not co-located)
- Mocks in `__mocks__/` for Expo/RN modules (expo-sqlite, expo-av, react-native, etc.)
- Tests run serially (`maxWorkers: 1`) due to shared in-memory DB
- **Known issues**: 4 failing migration tests (version tracking bug)

### Simulated Mode
For development without hardware:
1. Enable "Simulated Mode" in app Settings
2. Set WebSocket URL to simulator (e.g., `ws://192.168.1.100:8765`)
3. Simulator emits realistic EEG metrics with controllable states

See `docs/RUNNING_SIMULATED_MODE.md` for details.

## Common Pitfalls

1. **Dependencies**: Always use `npm ci --legacy-peer-deps` (React 19 peer conflicts). Never plain `npm install`.

2. **New module imports**: Add mocks to `__mocks__/` or tests fail with "Cannot find module"

3. **EEG source cleanup**: Always call `source.stop()` in useEffect cleanup to prevent WebSocket/BLE leaks

4. **Audio assets**: Use `require()` for audio files in `assets/audio/`, not dynamic imports

5. **PNG assets**: `*.png` is in `.gitignore` — new PNGs need `git add -f` (consider fixing this)

## Commit Conventions

`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`

## Known Issues to Fix

- 4 failing migration tests (version tracking accumulation)
- `@types/jest` and `@types/react` in both deps and devDeps (should be devDeps only)
- Consider resolving peer deps to remove `--legacy-peer-deps`
