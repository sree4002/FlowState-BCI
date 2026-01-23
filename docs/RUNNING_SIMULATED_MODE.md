# Running FlowState BCI in Simulated Mode

This guide explains how to run the FlowState BCI app in simulated mode for development and testing without real EEG hardware.

## Overview

Simulated mode allows you to:
- Test the full closed-loop flow without hardware
- Develop and debug UI components
- Verify entrainment triggering logic
- Test edge cases by forcing specific theta states

## Architecture

```
┌─────────────────┐     WebSocket      ┌──────────────────┐
│  Python         │◄──────────────────►│  React Native    │
│  Simulator      │   ws://localhost   │  App             │
│  (EEG metrics)  │       :8765        │  (SimulatedEEG   │
└─────────────────┘                    │   Source)        │
                                       └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │ ClosedLoop       │
                                       │ Controller       │
                                       └────────┬─────────┘
                                                │
                                       ┌────────▼─────────┐
                                       │ PhoneAudio       │
                                       │ Output           │
                                       │ (expo-av)        │
                                       └──────────────────┘
```

## Prerequisites

- Python 3.7+ with pip
- Node.js 18+ with npm
- iOS Simulator or Android Emulator (or physical device)

## Step 1: Start the Python Simulator

Navigate to the simulator directory and install dependencies:

```bash
cd simulator
pip install -r requirements.txt
```

Start the WebSocket server:

```bash
python eeg_simulator.py
```

Options:
- `--host HOST` - Host address (default: 0.0.0.0 for LAN access)
- `--port PORT` - Port number (default: 8765)
- `--rate HZ` - Sample rate in Hz (default: 10)

Example with custom settings:
```bash
python eeg_simulator.py --port 8765 --rate 20
```

You should see:
```
[Server] Starting WebSocket server on ws://0.0.0.0:8765
[Server] Press Ctrl+C to stop
```

**Note:** The server now binds to `0.0.0.0` by default, which allows connections from any device on your LAN.

## Step 2: Enable Simulated Mode in the App

1. Open the app
2. Navigate to **Settings** tab (bottom navigation)
3. Scroll to **Developer** section at the bottom
4. You'll see the **Simulated Mode** debug panel
5. Toggle "Simulated Mode" ON
6. Press "Start Simulation" to connect

### Server URL Configuration

The server URL must be configured correctly for your setup:

#### iOS Simulator (on Mac)
```
ws://localhost:8765
```
- localhost works directly because the simulator shares the Mac's network stack

#### Android Emulator
```
ws://10.0.2.2:8765
```
- `10.0.2.2` is Android emulator's special alias for the host machine's localhost
- Do NOT use `localhost` - it refers to the emulator itself, not your computer

#### Physical iPhone (Real Device)
```
ws://192.168.x.x:8765
```
1. Find your Mac's IP address:
   ```bash
   ipconfig getifaddr en0   # Wi-Fi
   # or
   ipconfig getifaddr en1   # Ethernet
   ```
2. Ensure your iPhone is on the same Wi-Fi network as your Mac
3. Start the Python simulator with `--host 0.0.0.0` to accept external connections:
   ```bash
   python eeg_simulator.py --host 0.0.0.0 --port 8765
   ```
4. Update the server URL in the app to use your Mac's IP

#### Physical Android Device
```
ws://192.168.x.x:8765
```
1. Find your computer's IP address:
   ```bash
   # Linux/Mac
   hostname -I | awk '{print $1}'
   # Windows
   ipconfig | findstr IPv4
   ```
2. Ensure your phone is on the same Wi-Fi network
3. Start Python simulator with `--host 0.0.0.0`:
   ```bash
   python eeg_simulator.py --host 0.0.0.0 --port 8765
   ```
4. Update server URL in app settings

### Firewall Notes

If connection fails from a physical device:
- **macOS**: Allow Python in System Preferences > Security & Privacy > Firewall
- **Windows**: Add firewall exception for port 8765
- **Linux**: `sudo ufw allow 8765/tcp`

## Step 3: Using the Debug View

The `SimulatedModeDebugView` component shows:

| Metric | Description |
|--------|-------------|
| Connection Status | WebSocket connection state |
| Theta Power | Simulated theta power (uV^2) |
| Z-Score | Normalized theta value |
| Theta State | LOW / NORMAL / HIGH |
| Entrainment Active | Whether audio is playing |

### Force Theta State Controls

Use the buttons to force specific theta states for testing:

- **LOW** - Forces z-score below -0.5 (triggers entrainment)
- **NORMAL** - Forces z-score near 0
- **HIGH** - Forces z-score above 0.5 (stops entrainment)
- **AUTO** - Returns to natural fluctuation mode

## How It Works

### SimulatedEEGSource

Connects to the Python simulator via WebSocket and receives metrics every 50-200ms:

```typescript
{
  timestamp: 1234567890123,
  theta_power: 12.5,
  z_score: -0.8,
  theta_state: "low",
  signal_quality: 85,
  simulated_theta_state: "low"  // Only if forced
}
```

### ClosedLoopController

Monitors z-score and triggers entrainment:

| Condition | Action |
|-----------|--------|
| z_score < -0.5 | Start entrainment |
| z_score > 0.5 | Stop entrainment |
| After stop | 5 second cooldown before restart |

### PhoneAudioOutput

Plays isochronic tones through the phone:
- Default frequency: 6 Hz (theta range)
- Default volume: 70%
- Pulse duration: 50ms

## Verifying Audio Playback

Audio entrainment uses `expo-av` which requires **real device testing** - it will not work in unit tests or web browsers.

### Testing on Device

1. **Connect a physical device** or use iOS Simulator/Android Emulator
2. Enable simulated mode in Settings > Developer
3. Start the simulation
4. Use the "Force State" buttons:
   - Press **LOW** to force low theta state
   - This should trigger entrainment (isochronic tones)
   - The "Entrainment Active" indicator should appear
5. Press **HIGH** to force high theta state
   - Entrainment should stop after cooldown
6. Press **AUTO** to return to natural fluctuation

### What to Expect

When entrainment is active:
- "Entrainment Active" indicator shows with purple color
- You should hear pulsing tones at the configured frequency (default 6 Hz)
- The phone speaker or connected headphones will play audio

If no audio:
- Check device volume is not muted
- Check device is not in silent mode (iOS)
- Verify Simulated Mode shows "Entrainment Active"
- Check for expo-av audio permission issues

### Debug Panel Location

The SimulatedModeDebugView is mounted in:
- **Settings Screen** > scroll to **Developer** section
- Shows real-time: theta power, z-score, theta state, connection status
- Provides force state controls for testing

## Troubleshooting

### WebSocket Connection Failed

1. Verify the Python simulator is running
2. Check the server URL in settings matches the simulator
3. For Android emulator, use `10.0.2.2` instead of `localhost`
4. For physical devices, use your computer's IP and ensure same network

### No Audio Playing

1. Check device volume is not muted
2. Verify entrainment is being triggered (theta state should be LOW)
3. Check for audio permission issues in device settings

### Simulator Not Producing Data

1. Check the Python console for errors
2. Verify a client is connected (shown in simulator output)
3. Try restarting the simulator

## Swapping to Real Hardware

To switch from simulated to real hardware:

```typescript
// In your provider or service setup:

// Simulated mode (development)
const eegSource = new SimulatedEEGSource({
  serverUrl: 'ws://localhost:8765',
});

// Real hardware mode (production)
const eegSource = new BleEEGSource({
  deviceId: 'your-device-id',
});

// The controller works with either source
const controller = new ClosedLoopController(
  eegSource,
  entrainmentOutput,
  config
);
```

## Development Tips

1. **Fast iteration**: Use force state buttons to quickly test entrainment triggers
2. **Test edge cases**: Try rapidly toggling between states
3. **Monitor logs**: Watch console for connection events and errors
4. **Test cooldown**: Verify entrainment doesn't restart immediately after stopping

## Files Reference

| File | Purpose |
|------|---------|
| `simulator/eeg_simulator.py` | Python WebSocket server |
| `simulator/requirements.txt` | Python dependencies |
| `src/services/eeg/SimulatedEEGSource.ts` | WebSocket client |
| `src/services/eeg/EEGSource.ts` | Source interface |
| `src/services/entrainment/PhoneAudioOutput.ts` | Audio output |
| `src/services/ClosedLoopController.ts` | Control logic |
| `src/contexts/SimulatedModeContext.tsx` | React context |
| `src/components/SimulatedModeDebugView.tsx` | Debug UI |
