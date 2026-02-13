# FlowState BCI

**Codename: FlowState_BCI**

A closed-loop memory enhancement system using EEG theta rhythm detection and isochronic tone entrainment. Built for the April 2026 hackathon.

## Overview

FlowState BCI monitors your brain's theta rhythms in real-time and automatically delivers precisely-timed isochronic tones to enhance memory consolidation during learning and focus sessions. When theta power drops below your personal baseline, the system activates entrainment to guide your brain back into an optimal state.

## Features

- **Real-time EEG Theta Detection** — Monitors 4-8 Hz theta band power with z-score normalization
- **Closed-loop Entrainment** — Automatically triggers 6 Hz isochronic tones when theta drops
- **Adaptive Thresholds** — Personal baseline calibration for accurate detection
- **Simulated EEG Mode** — Full development/testing without hardware
- **Mobile App** — React Native app for iOS and Android via Expo

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile App | React Native / Expo |
| Language | TypeScript |
| EEG Simulator | Python (WebSocket) |
| Audio | expo-av with pre-generated WAV |
| Hardware | OpenBCI Ganglion *(coming soon)* |
| CI/CD | GitHub Actions |

## Getting Started

### Prerequisites

- **Node.js** 18+ ([download](https://nodejs.org/))
- **Python** 3.8+ ([download](https://python.org/))
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Installation

```bash
# Clone the repository
git clone https://github.com/sree4002/FlowState-BCI.git
cd FlowState-BCI

# Install JavaScript dependencies
npm install

# Install Python simulator dependencies
cd simulator
pip install -r requirements.txt
cd ..
```

## Running the App

### Development Mode (Simulated EEG)

1. **Start the EEG simulator:**
   ```bash
   cd simulator
   python eeg_simulator.py --host 0.0.0.0 --port 8765
   ```

2. **Find your computer's LAN IP:**
   ```bash
   # Mac
   ipconfig getifaddr en0

   # Windows
   ipconfig | findstr IPv4

   # Linux
   hostname -I | awk '{print $1}'
   ```

3. **Start Expo:**
   ```bash
   npx expo start
   ```

4. **Connect from your phone:**
   - Open Expo Go on your phone (must be on same WiFi network)
   - Scan the QR code from the terminal
   - Go to Settings → Enable "Simulated Mode"
   - Set server URL to `ws://<YOUR_IP>:8765`
   - Return to Dashboard and start a session

### Simulator Controls

The Python simulator supports forcing theta states for testing:

```bash
# In the simulator terminal, the server logs connection info
# Use the app's debug controls to force low/normal/high theta states
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run linting
npm run lint

# TypeScript type check
npx tsc --noEmit

# Format code
npm run format
```

## Project Structure

```
FlowState-BCI/
├── src/
│   ├── components/     # React Native components
│   ├── screens/        # App screens (Dashboard, Session, Calibration, etc.)
│   ├── services/       # Core logic
│   │   ├── eeg/        # EEG source abstraction
│   │   ├── entrainment/# Audio output
│   │   └── ble/        # Bluetooth handlers
│   ├── contexts/       # React contexts (Settings, Session, Device)
│   └── types/          # TypeScript type definitions
├── firmware/           # ESP32 earpiece firmware (coming soon)
├── signal/             # Python EEG signal processing pipeline (coming soon)
├── simulator/
│   ├── eeg_simulator.py      # WebSocket EEG simulator
│   ├── requirements.txt      # Python dependencies
│   └── test_isochronic_tones.py  # WAV file generator
├── assets/
│   └── audio/          # Isochronic tone WAV files
├── __tests__/          # Jest test files
├── __mocks__/          # Jest mocks for native modules
├── docs/
│   ├── prd.md          # Product Requirements Document
│   └── RUNNING_SIMULATED_MODE.md  # Detailed simulator guide
└── .github/
    └── workflows/
        └── ci.yml      # GitHub Actions CI
```

## System Architecture

FlowState BCI is a three-subsystem closed-loop neurofeedback platform:

| Subsystem | Technology | Status |
|-----------|------------|--------|
| **Mobile App** | React Native / Expo / TypeScript | Active development (`src/`) |
| **Signal Processing** | Python / BrainFlow / scipy | Coming soon (`signal/`) |
| **Earpiece Firmware** | ESP32 / Arduino / ESP-IDF | Coming soon (`firmware/`) |

**How they connect:**

```
┌──────────────┐  BLE   ┌──────────────────┐  BLE   ┌──────────────┐
│  OpenBCI     │───────▶│   Mobile App     │───────▶│  ESP32       │
│  Ganglion    │  EEG   │  (React Native)  │ Audio  │  Earpiece    │
│  (headband)  │  data  │                  │  ctrl  │  (firmware)  │
└──────────────┘        └──────────────────┘        └──────────────┘
                               │    ▲
                               ▼    │
                        ┌──────────────────┐
                        │  Signal Pipeline │
                        │  (Python/BrainFlow)
                        └──────────────────┘
```

**App-internal data flow:**

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   EEG Source    │────▶│  ClosedLoop      │────▶│  Entrainment    │
│ (Simulated/BLE) │     │  Controller      │     │  Output (Audio) │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                       │                        │
        ▼                       ▼                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    React Native UI                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Dashboard │  │ Session  │  │Calibrate │  │ Settings │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

## CI/CD

GitHub Actions automatically runs on every push and pull request:

- TypeScript type checking
- Jest tests (4800+ tests)
- ESLint linting

View the CI status: [Actions](https://github.com/sree4002/FlowState-BCI/actions)

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit with conventional commits: `git commit -m "feat: add new feature"`
6. Push and open a Pull Request

### Commit Convention

- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactoring
- `test:` — Adding or updating tests
- `docs:` — Documentation changes
- `chore:` — Maintenance tasks
- `ci:` — CI/CD changes

## Roadmap

- [x] Simulated EEG mode
- [x] Closed-loop controller
- [x] Isochronic tone entrainment
- [x] Calibration flow
- [ ] OpenBCI Ganglion integration
- [ ] Session history and analytics
- [ ] Circadian rhythm optimization

## Team

- **Sreenidhi** — Founder / Lead Developer
- **Nina** — CTO

## License

*License information placeholder*

<!-- Choose a license (MIT, Apache 2.0, etc.) -->

---

Built with focus for the April 2026 Hackathon
