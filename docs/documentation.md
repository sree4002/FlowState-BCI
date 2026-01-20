# FlowState BCI - Product Requirements Document

**Version:** 1.0
**Date:** January 2026
**Status:** Draft
**Author:** FlowState Team

---

## 1. Executive Summary

### 1.1 Product Vision

FlowState BCI is a closed-loop brain-computer interface system that leverages real-time EEG monitoring and personalized audio entrainment to enhance cognitive performance through theta brainwave optimization. Our mission is to make neurofeedback-based cognitive enhancement accessible, comfortable, and effective for everyday use.

### 1.2 Target Users

- **Students**: Seeking enhanced focus and retention during study sessions
- **Knowledge Workers**: Professionals requiring sustained concentration for deep work
- **General Wellness Users**: Individuals interested in optimizing mental performance and cognitive health

### 1.3 Core Value Proposition

FlowState BCI delivers personalized theta brainwave entrainment through:

- **Dual-device system**: Comprehensive calibration headband + comfortable all-day earpiece
- **Closed-loop feedback**: Real-time EEG monitoring adjusts entrainment dynamically
- **ML-driven personalization**: Machine learning discovers each user's optimal entrainment frequency
- **Circadian awareness**: Scheduling adapts to individual daily theta rhythms
- **Comprehensive tracking**: Build detailed cognitive profile over time

### 1.4 Key Differentiators

1. **Two-device architecture** separating calibration from daily use
2. **Ear-EEG technology** enabling comfortable extended wear
3. **Ensemble ML approach** combining physiological, behavioral, and temporal features
4. **User-configurable closed-loop** behavior tailored to individual preferences
5. **Privacy-first design** with local data storage and full user control

---

## 2. Product Overview

### 2.1 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FlowState BCI System                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────┐              ┌──────────────────┐    │
│  │   Calibration    │              │   Daily Wear     │    │
│  │  EEG Headband    │              │    Earpiece      │    │
│  │                  │              │                  │    │
│  │  • 4+ channels   │              │  • 2 channels    │    │
│  │  • 500 Hz        │              │  • 250 Hz        │    │
│  │  • BLE 5.0+      │              │  • Audio output  │    │
│  │  • 4-6h battery  │              │  • 16+ h battery │    │
│  └────────┬─────────┘              └────────┬─────────┘    │
│           │                                 │               │
│           │         BLE Connection          │               │
│           └────────────┬────────────────────┘               │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │   Mobile App      │                         │
│              │  (React Native)   │                         │
│              │                   │                         │
│              │  • Dashboard      │                         │
│              │  • Session ctrl   │                         │
│              │  • Analytics      │                         │
│              │  • Settings       │                         │
│              └─────────┬─────────┘                         │
│                        │                                    │
│              BLE Passthrough (calibration)                 │
│                        │                                    │
│              ┌─────────▼─────────┐                         │
│              │  Python Service   │                         │
│              │                   │                         │
│              │  • Signal proc    │                         │
│              │  • ML training    │                         │
│              │  • Baseline calc  │                         │
│              └───────────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Core Capabilities

#### Calibration Mode

- **Purpose**: Establish individual baseline theta patterns
- **Duration**: 5-10 minutes per session
- **Process**: High-fidelity EEG acquisition → Python processing → Baseline profile generation
- **Output**: Mean/std theta power, optimal starting frequency, circadian metadata

#### Daily Wear Mode

- **Purpose**: On-demand and scheduled cognitive enhancement
- **Process**: Real-time theta monitoring → Closed-loop entrainment adjustment → Session logging
- **Features**: Manual boost, scheduled sessions, circadian suggestions, performance tracking

#### Closed-Loop Entrainment

- **Mechanism**: Monitor theta z-score → Compare to threshold → Adjust audio parameters
- **User-configurable**: Reduce intensity / Stop / Maintain when threshold exceeded
- **Adaptive**: Learn from session outcomes to refine future entrainment

#### Personalization Engine

- **ML approach**: Ensemble model (physiological + behavioral + temporal features)
- **Learning**: Continuous improvement as session data accumulates
- **Flexibility**: User can override, system adapts to preferences

#### Session Tracking & Analytics

- **Storage**: Local SQLite database with CSV/EDF/JSON export
- **Views**: Session list, calendar heat map, trend charts, statistics dashboard
- **Insights**: Theta improvement trends, frequency optimization, circadian patterns

---

## 3. Detailed Requirements

### 3.1 Hardware Specifications

#### 3.1.1 Calibration EEG Headband

| Specification            | Requirement   | Notes                                        |
| ------------------------ | ------------- | -------------------------------------------- |
| **Channels**             | 4+ electrodes | Comprehensive brain mapping                  |
| **Sampling Rate**        | 500 Hz        | High-fidelity acquisition during calibration |
| **ADC Resolution**       | 12-16 bit     | Adequate signal resolution                   |
| **Battery Life**         | 4-6 hours     | Multiple calibration sessions                |
| **Connectivity**         | BLE 5.0+      | Reliable, low-latency communication          |
| **Form Factor**          | Headband      | Comfortable for short-duration use           |
| **Impedance Monitoring** | Real-time     | Signal quality feedback                      |
| **Weight**               | <100g target  | Minimize discomfort                          |

**Signal Quality Requirements:**

- Real-time impedance monitoring (<10 kΩ ideal, <50 kΩ acceptable)
- Artifact detection: motion, EMG, eye blinks
- Visual quality indicator in app (green/yellow/red)
- Auto-rejection of high-artifact segments

**Electrical Safety:**

- Low voltage: <5V DC
- Current-limited electrodes
- Biocompatible materials (hypoallergenic)
- Compliance with IEC 60601-1 if medical claims pursued

#### 3.1.2 Daily Wear Earpiece

| Specification      | Requirement                | Notes                                  |
| ------------------ | -------------------------- | -------------------------------------- |
| **Channels**       | 2 (1 active + reference)   | In-ear EEG electrode + reference       |
| **Sampling Rate**  | 250 Hz                     | Power-optimized for daily wear         |
| **ADC Resolution** | 12-16 bit                  | Consistent with headband               |
| **Battery Life**   | 16+ hours                  | Full day + overnight margin            |
| **Audio Output**   | Isochronic tone generation | 4-8 Hz theta range                     |
| **Connectivity**   | BLE 5.0+                   | Matched to headband                    |
| **Form Factor**    | Earpiece                   | Comfortable extended wear, unobtrusive |
| **Weight**         | <20g per ear               | Minimal fatigue                        |
| **Volume Range**   | 0-100%                     | Independent of system volume           |

**Audio Specifications:**

- Frequency range: 4-8 Hz (theta band), 0.1 Hz precision
- Volume control: Independent of device system volume
- Tone generation: DAC or PWM-based isochronic tones
- Audio mixing: Option to blend with other audio sources

**Power Management:**

- Adaptive sampling: Lower rate when not in active session
- Sleep mode: When disconnected or idle
- Charging: USB-C, <2 hours full charge

#### 3.1.3 ESP32 Firmware Implementation

**Core Responsibilities:**

- EEG signal acquisition via ADC
- On-device signal preprocessing (bandpass filter, artifact detection)
- Isochronic tone generation via DAC/PWM
- BLE communication with mobile app
- OTA firmware updates (automatic, background)
- Power management for battery optimization

**BLE Protocol:**

- Service UUID: Custom FlowState service
- Characteristics:
  - EEG Data Stream (notify)
  - Entrainment Control (write): START, STOP, frequency, volume
  - Device Status (read/notify): Battery, connection quality
  - Firmware Version (read)
  - OTA Update (write)

**Signal Processing (On-Device):**

- Hardware filters: 0.5-50 Hz bandpass (if feasible)
- Software preprocessing:
  - DC offset removal
  - Basic artifact detection (amplitude threshold)
  - Downsample for BLE transmission (send processed theta power, not raw samples when possible)

**OTA Updates:**

- Automatic updates in background when device idle
- Integrity verification (checksum, signature)
- Rollback capability on failed update
- User notification of critical updates

### 3.2 Mobile App Requirements

#### 3.2.1 Platform & Technology Stack

| Component            | Technology                               | Version                  |
| -------------------- | ---------------------------------------- | ------------------------ |
| **Framework**        | React Native with Expo                   | Expo SDK 54+             |
| **iOS Support**      | iOS 13.0+                                |                          |
| **Android Support**  | Android 8.0+                             | API level 26+            |
| **BLE Library**      | react-native-ble-plx                     | v3.1.2+                  |
| **Navigation**       | React Navigation                         | v6.1.9+                  |
| **State Management** | React Context API                        | Built-in                 |
| **Local Storage**    | AsyncStorage                             | For settings/preferences |
| **Database**         | SQLite                                   | For session data         |
| **Charts**           | React Native Chart Kit or Victory Native | TBD                      |
| **Data Export**      | Custom modules                           | CSV, EDF, JSON           |

#### 3.2.2 Navigation & Information Architecture

**Dashboard-Centric Design:**

Primary screen with **configurable widgets** (user can add/remove/reorder):

- Device connection status
- Today's session summary (count, total time, avg theta)
- Recent theta trends (sparkline or mini-chart)
- Next suggested session (circadian-aware)
- Quick action buttons:
  - **Boost** (5-minute theta session)
  - **Calibrate** (start calibration session)
  - **Custom Session** (configure and start)

**Drill-Down Screens:**

1. **Active Session Screen**
   - Full-screen view during entrainment
   - Real-time theta visualization (multiple view options)
   - Entrainment controls (frequency, volume, pause/stop)
   - Session timer
   - Signal quality indicator

2. **History & Analytics Screen**
   - Multi-view tabs:
     - Session List
     - Calendar Heat Map
     - Trend Charts
     - Statistics Dashboard
   - Filter by date range, session type
   - Detailed session drill-down

3. **Settings & Configuration Screen**
   - Device management
   - Audio settings
   - Notifications
   - Closed-loop behavior
   - Theta thresholds
   - Theme & accessibility
   - Data management (export, clear)
   - Privacy settings

#### 3.2.3 Device Management

**Auto-Discovery & Pairing:**

- Scan for BLE devices named "FlowState" or "BCI"
- Separate pairing for calibration headband and daily earpiece
- Store paired device IDs in AsyncStorage
- Visual pairing instructions with illustrations

**Connection Management:**

- Real-time connection status indicator
- Auto-reconnect on connectivity loss
  - Seamless session continuation (earpiece maintains last settings)
  - App syncs state upon reconnection
- Connection quality monitoring (RSSI)
- Troubleshooting tips for poor connection

**Firmware Updates:**

- Automatic background updates when device idle
- Progress indicator during update
- Notification of available updates
- Version display in settings

#### 3.2.4 Session Types

##### 3.2.4.1 Calibration Session

**Purpose:** Establish user's baseline theta patterns

**Configuration:**

- Duration: 5-10 minutes (user selectable, default 8 min)
- EEG source: Calibration headband (4+ channels)
- Processing: Python service via BLE passthrough

**User Flow:**

1. User taps "Calibrate" from dashboard
2. App checks for paired calibration headband
3. If not paired, guide pairing process
4. App establishes connection, checks signal quality
5. User settles (30-second countdown)
6. Calibration begins:
   - Real-time signal quality monitoring
   - Visual feedback (green/yellow/red indicator)
   - Progress bar showing time remaining
7. App streams raw EEG to Python service
8. Python processes in near real-time:
   - Artifact rejection
   - Multi-band analysis (theta, alpha, beta)
   - Baseline statistics computation
9. Auto-pause if signal quality critically degraded
10. Session completes, Python returns baseline profile
11. App displays summary:
    - Baseline theta mean & std dev
    - Recommended starting frequency
    - Signal quality score
    - Option to recalibrate if quality poor

**Data Collected:**

- Raw EEG (all channels, 500 Hz)
- Processed theta/alpha/beta power time series
- Baseline statistics: mean, std, percentiles
- Peak theta frequency (FFT peak in 4-8 Hz)
- Time of day metadata
- Signal quality metrics

**Storage:**

- Baseline profile: SQLite (theta_mean, theta_std, optimal_freq, timestamp)
- Raw EEG: Optional export to EDF file
- Session metadata: SQLite

##### 3.2.4.2 Daily Wear Session

**Purpose:** Real-time theta enhancement with closed-loop feedback

**Configuration:**

- Duration: User selectable (5, 15, 30, 60 min presets or custom)
- EEG source: Daily wear earpiece (2 channels)
- Entrainment: Isochronic tones, 4-8 Hz, adjustable volume
- Closed-loop: User-configurable threshold behavior

**User Flow:**

1. User taps "Start Session" or "Boost"
2. App checks for paired earpiece, establishes connection
3. Session configuration:
   - Select duration (or use preset)
   - Set initial frequency (ML suggestion or manual)
   - Set initial volume
4. Session begins:
   - Timer starts
   - Earpiece starts isochronic tone generation
   - App monitors real-time theta from earpiece
   - Display updates 2-5 Hz
5. Closed-loop control:
   - If theta z-score exceeds threshold (e.g., +1.0 SD):
     - **Option 1**: Reduce volume by 10-20%
     - **Option 2**: Stop entrainment
     - **Option 3**: Maintain current level
     - User's preference (from settings) determines behavior
6. User can manually adjust frequency/volume during session
7. Session ends (timer expires or user stops)
8. App logs session data
9. Optional: Prompt user for subjective rating (focus 1-5)

**Real-Time Visualization Options:**
User can toggle between or show multiple views:

- **Numeric**: Z-score value (e.g., "+1.2 SD above baseline")
- **Gauge**: Circular or bar gauge, color-coded zones
  - Red: Below baseline (<0 SD)
  - Yellow: Baseline to target (0 to +1 SD)
  - Green: Optimal zone (+1 to +2 SD)
  - Blue: Above target (>+2 SD)
- **Time-Series Chart**: Scrolling line chart of theta power over time (last 1-5 minutes visible)

**Controls (Always Visible):**

- Frequency slider: 4-8 Hz, 0.1 Hz increments, current value displayed
- Volume slider: 0-100%, current value displayed
- Pause/Resume button (large, center)
- Stop button (end session early)
- Timer display (elapsed / total)
- Signal quality indicator (corner, non-intrusive)

**Data Collected:**

- Theta power time series (250 Hz EEG → 0.5 Hz theta estimates)
- Entrainment parameters: frequency and volume over time
- Closed-loop adjustments: timestamps and reasons
- Manual user adjustments
- Session metadata: start/end time, duration, avg theta z-score
- Subjective rating (if provided)

##### 3.2.4.3 Scheduled Sessions

**Purpose:** Circadian-aware proactive entrainment

**Configuration:**

- Scheduling: Time-based OR circadian-suggested
- Notifications: User-configurable (timing, style, frequency)
- Calendar integration: Detect study/work blocks

**Circadian Awareness:**

- System analyzes historical theta patterns by time of day
- Identifies peak performance times
- Suggests optimal session times (e.g., "Your theta is typically highest at 2 PM")
- Adapts over time as more data accumulates

**Notification Options (User Configurable):**

- **Simple reminder**: Push notification at scheduled time
- **Smart reminder**: Remind at predicted optimal time (circadian model)
- **Gentle prompt**: In-app prompt only, no push
- **Off**: No notifications, scheduled sessions visible in dashboard only

**Integration with Calendar:**

- Request calendar permissions (optional)
- Detect calendar events tagged as "study", "focus", "work"
- Suggest sessions before these blocks
- Auto-schedule if user enables

**User Flow:**

1. User creates scheduled session:
   - Choose time (manual) or accept circadian suggestion
   - Set default frequency/duration
   - Enable notifications
2. At scheduled time:
   - App sends notification (if enabled)
   - User taps notification → starts session immediately
   - OR user ignores, session remains in "suggested" state
3. System tracks adherence, adjusts future suggestions

#### 3.2.5 Visualization & Feedback

**Real-Time Updates:**

- Update frequency: 2-5 Hz (fast, responsive)
- Smooth animations for gauge/chart
- Visual indicators for entrainment state:
  - **Active**: Pulsing or animated visualization
  - **Paused**: Grayed out, "Paused" overlay
  - **Stopped**: Session summary screen

**Signal Quality Indicator:**

- **Visual only**: Color-coded icon (red/yellow/green)
- **Location**: Corner of session screen (non-intrusive)
- **Behavior**: Does not auto-pause unless critically degraded (<20% quality)
- **Tap for details**: Shows impedance values, troubleshooting tips

**Entrainment State Visualization:**

- Current frequency displayed prominently (e.g., "6.3 Hz")
- Volume level (0-100%)
- Theta state relative to baseline and target

#### 3.2.6 History & Analytics

**Multi-View Analytics (Tabs/Cards):**

##### 1. Session List View

- **Display**: Scrollable list, newest first
- **Each entry shows**:
  - Date & time
  - Duration
  - Avg theta z-score
  - Entrainment frequency used
  - Session type (Calibration / Daily Wear)
  - Subjective rating (if provided)
- **Interactions**:
  - Tap to view detailed breakdown
  - Filter by date range (week/month/all time)
  - Filter by session type
  - Sort by date, duration, or theta score

##### 2. Calendar Heat Map

- **Display**: Monthly calendar grid
- **Color coding**: Intensity represents session outcome
  - Darker colors = better theta improvement OR more consistent usage
  - Gray = no session
- **Interactions**:
  - Tap date to see sessions from that day
  - Swipe to change month
- **Insight**: Visual pattern recognition (e.g., weekday vs weekend consistency)

##### 3. Trend Charts

Multiple charts, user can scroll or tab through:

- **Theta Power Improvement**: Line chart of avg theta z-score over time
- **Optimal Frequency Convergence**: Show how ML-suggested frequency changes and stabilizes
- **Circadian Pattern**: Heatmap or line chart of theta power by time of day
- **Session Frequency**: Bar chart of sessions per week over time
- **Duration Trends**: Avg session duration over time

**X-axis options**: Last 7 days, 30 days, 3 months, all time

##### 4. Statistics Dashboard

Summary cards with key metrics:

- **This Week**:
  - Total sessions
  - Total time
  - Avg theta z-score
  - Streak (consecutive days with session)
- **This Month**:
  - Same metrics as above
- **All Time**:
  - Total sessions
  - Total hours
  - Best theta z-score achieved
  - Current streak & longest streak
- **Personalization Status**:
  - Baseline confidence (Low / Medium / High)
  - ML model accuracy (if applicable)
  - Optimal frequency: X.X Hz
  - Last calibration: X days ago

#### 3.2.7 User Profile & Personalization

**Baseline Profile (Stored in SQLite):**

```
{
  "theta_mean": float,  // Mean theta power (µV²)
  "theta_std": float,   // Std deviation
  "alpha_mean": float,
  "alpha_std": float,
  "beta_mean": float,
  "beta_std": float,
  "peak_theta_freq": float,  // Hz, detected from FFT
  "optimal_freq": float,     // Hz, ML-suggested or peak_theta_freq initially
  "calibration_timestamp": datetime,
  "calibration_quality_score": float,  // 0-100
  "time_of_day": string,  // Morning/Afternoon/Evening
  "calibration_count": int
}
```

**Circadian Patterns (Aggregated from Sessions):**

```
{
  "hour_of_day": int,  // 0-23
  "avg_theta_mean": float,
  "avg_theta_std": float,
  "session_count": int,
  "avg_subjective_rating": float  // 1-5 scale
}
```

**Session History (SQLite Schema):**

```
sessions {
  id: integer primary key,
  session_type: string,  // "calibration" | "daily_wear"
  start_time: datetime,
  end_time: datetime,
  duration_seconds: integer,
  avg_theta_zscore: float,
  max_theta_zscore: float,
  min_theta_zscore: float,
  entrainment_freq: float,  // Hz, avg or final
  entrainment_volume: float,  // 0-100, avg or final
  closed_loop_adjustments: integer,  // count
  manual_adjustments: integer,  // count
  signal_quality_avg: float,  // 0-100
  subjective_rating: float,  // 1-5, nullable
  notes: text,  // User notes, nullable
  raw_data_path: string  // Path to EDF export if applicable
}
```

**Export Functionality:**

1. **CSV Export (Session Summary)**:
   - One row per session
   - Columns: id, type, start_time, end_time, duration, avg_theta_zscore, entrainment_freq, volume, rating
   - Use case: Import to spreadsheet for personal analysis

2. **EDF Export (Raw EEG)**:
   - European Data Format, standard in neuroscience
   - Includes all channels, full sample rate
   - Metadata: electrode positions, sampling rate, filters applied
   - Use case: Advanced analysis in external tools (MATLAB, MNE-Python)

3. **JSON Export (Structured Data)**:
   - Complete user profile: baseline, circadian patterns, session history
   - Includes metadata, settings, ML model parameters (if applicable)
   - Use case: Programmatic access, backup, migration

#### 3.2.8 Settings & Configuration

**Device Management:**

- Paired devices list (headband, earpiece)
- Forget device / Re-pair
- Device info: name, battery level, firmware version
- OTA update controls: Auto-update on/off

**Notification Preferences:**

- Enable/disable notifications
- Notification style: Simple / Smart / Gentle
- Notification frequency: Before every scheduled session / Daily summary only
- Quiet hours: No notifications during specific times

**Audio Settings:**

- **Audio mixing behavior**:
  - Exclusive: Pause other audio during entrainment
  - Mix: Blend isochronic tones with music/podcasts
- **Default volume**: 0-100%, initial volume for new sessions
- **Mixing ratio** (if Mix enabled): Entrainment volume relative to other audio

**Entrainment Settings:**

- **Auto-boost**: Enable/disable scheduled auto-boost
- **Boost frequency**: How often (daily, weekdays only, custom)
- **Boost time**: Preferred time of day

**Theta Threshold Settings:**

- **Target theta z-score**: +0.5 to +2.0 SD (default +1.0)
- **Closed-loop behavior** when threshold exceeded:
  - Reduce intensity
  - Stop entrainment
  - Maintain level

**Theme & Accessibility:**

- **Theme**: Wellness aesthetic (calming blues/purples, rounded elements)
  - Future: Light mode option
- **Text size**: Small / Medium / Large / Extra Large
- **Reduce motion**: Disable animations
- **Haptic feedback**: Enable/disable vibration for events

**Data Management:**

- **Export data**: Choose format (CSV / EDF / JSON)
- **Clear session history**: Delete all sessions (confirmation required)
- **Storage usage**: Display current database size

**Privacy Settings:**

- **Anonymous analytics**: Opt in/out of usage statistics
  - Clarify: No PII, no raw EEG, aggregate metrics only
- **Data policy**: Link to full privacy policy document
- **Data rights**: Export, delete, portability (GDPR compliance)

#### 3.2.9 Onboarding

**Goals:**

- Minimal friction: Get users to first session quickly
- Contextual learning: Explain features as encountered, not upfront
- Optional depth: Users can skip and explore on their own

**Onboarding Flow:**

1. **Welcome Screen**:
   - Brief intro: "FlowState BCI helps you enhance focus through personalized brainwave entrainment"
   - Option to skip or continue tour
2. **Quick Tour** (3 screens, swipeable):
   - Screen 1: "Monitor your theta waves in real-time"
   - Screen 2: "Personalized audio entrainment adapts to your brain"
   - Screen 3: "Track your progress and optimize over time"
3. **Permissions**:
   - Bluetooth: Required for device connection
   - Notifications: Optional, for session reminders
   - Calendar: Optional, for circadian scheduling
4. **Device Pairing** (optional at onboarding):
   - "Pair your devices now or skip and do it later"
   - If skip: Dashboard loads with "Pair Device" prompts
5. **First Session Suggestion**:
   - "Try a Quick Boost now (no calibration needed) or Calibrate for personalized recommendations"
   - User choice determines first experience

**Contextual Learning Throughout App:**

- **Tooltips**: Tap "?" icons next to complex terms (z-score, entrainment, etc.)
- **Progressive disclosure**: First time user sees a screen, brief overlay explains key elements
- **Help section**: Accessible from settings, articles on:
  - What are theta waves?
  - How does entrainment work?
  - Interpreting your z-score
  - Getting the best signal quality
  - Understanding circadian patterns

### 3.3 Signal Processing & Algorithms

#### 3.3.1 EEG Acquisition Pipeline

**Adaptive Sampling Strategy:**

- **Calibration mode**: 500 Hz (high-fidelity for baseline computation)
- **Daily wear mode**: 250 Hz (power-optimized, adequate for theta)

**Hardware Preprocessing (ESP32):**

1. **ADC sampling**: 12-16 bit resolution
2. **Hardware bandpass filter** (if feasible): 0.5-50 Hz
   - High-pass 0.5 Hz: Remove DC offset and slow drift
   - Low-pass 50 Hz: Anti-aliasing, remove high-frequency noise

**Software Preprocessing (Python Service or On-Device):**

1. **DC offset removal**: Subtract mean of each epoch
2. **Notch filter**: 50 Hz or 60 Hz (line noise), depending on region
3. **Bandpass filter**: 0.5-50 Hz (if not done in hardware)
   - Method: Butterworth IIR filter, 4th order
4. **Artifact detection** (see 3.3.2)

#### 3.3.2 Artifact Rejection

**Real-Time Artifact Detection (All Methods):**

1. **Amplitude Threshold**:
   - Detect motion artifacts and large voltage swings
   - Threshold: ±100 µV (adjustable based on calibration)
   - Action: Mark segment as bad if threshold exceeded

2. **Frequency Analysis**:
   - Detect muscle/EMG contamination (high-frequency content >30 Hz)
   - Method: Ratio of power in 30-50 Hz vs 4-30 Hz
   - Threshold: Ratio >2.0 indicates artifact
   - Action: Mark segment as bad

3. **Gradient Threshold**:
   - Detect sudden jumps (electrode pops, connection issues)
   - Method: Absolute difference between consecutive samples
   - Threshold: >50 µV per sample (adjustable)
   - Action: Mark segment as bad

**Artifact Handling:**

- **During calibration**:
  - Auto-reject bad segments (exclude from baseline computation)
  - If >30% of session is bad, extend session or prompt user to adjust headband
  - Display real-time quality score: % of clean data
- **During daily wear**:
  - Real-time quality indicator (red/yellow/green)
  - If quality <20% for >10 seconds, pause session and prompt user
  - Log artifact events for post-hoc analysis

#### 3.3.3 Band Power Extraction

**Multi-Band Analysis:**

- **Theta**: 4-8 Hz
- **Alpha**: 8-13 Hz
- **Beta**: 13-30 Hz

**Method:**

- **Welch's periodogram** or **FFT with sliding window**
- **Window size**: 2-4 seconds (trade-off: time resolution vs frequency resolution)
  - 2 sec window → 0.5 Hz frequency resolution
  - 4 sec window → 0.25 Hz resolution
- **Window overlap**: 50% (Hanning window)
- **Update rate**: 2-5 Hz for real-time feedback (new estimate every 200-500 ms)

**Z-Score Normalization:**

```
theta_zscore = (theta_power_current - theta_mean_baseline) / theta_std_baseline
```

- Provides standardized measure relative to user's baseline
- Positive z-score: Above baseline
- +1.0: One standard deviation above baseline (target zone)

**Real-Time Implementation:**

- Maintain sliding buffer of last 2-4 seconds of EEG
- Compute FFT every 200-500 ms (depending on desired update rate)
- Extract power in theta band, compute z-score
- Display on session screen

#### 3.3.4 Baseline Computation (Calibration)

**Process:**

1. Collect 5-10 minutes of clean EEG data (artifact-rejected)
2. Extract theta power for each 2-4 second window
3. Compute statistics across all windows:
   - **Mean**: Average theta power
   - **Standard deviation**: Variability
   - **Percentiles**: 25th, 50th, 75th (distribution shape)
4. **Time-of-day stratification** (if calibrating at multiple times):
   - Separate baselines for morning/afternoon/evening
   - Enables more accurate circadian-aware z-scores
5. **Peak theta frequency detection**:
   - Compute average power spectrum across all windows
   - Find peak in 4-8 Hz range
   - This is initial "optimal frequency" for entrainment
6. **Confidence metric**:
   - Based on data quality (% clean), stability (coefficient of variation)
   - Confidence = (% clean) \* (1 - CV)
   - High confidence (>0.8): Reliable baseline
   - Low confidence (<0.5): Suggest recalibration

**Storage:**

- Save baseline profile to SQLite
- Timestamp for tracking recalibration needs
- Multiple baselines if time-of-day stratified

**Recalibration:**

- Recommend recalibration every 4-8 weeks (baseline may drift)
- OR if user reports subjective change in efficacy
- New calibration updates baseline profile

#### 3.3.5 Personalization ML Pipeline

**Ensemble Approach:**
Combine multiple feature types for robust optimal frequency discovery:

1. **Physiological features**:
   - Peak theta frequency from calibration
   - Theta/alpha ratio
   - Baseline variability (std dev)

2. **Behavioral outcomes**:
   - Post-session subjective rating (1-5 scale)
   - Cognitive task scores (if third-party integration)
   - Session adherence (did user complete full duration?)

3. **Temporal patterns**:
   - Time of day (morning/afternoon/evening)
   - Circadian phase (estimated from historical data)
   - Session duration
   - Days since last session

4. **Session history**:
   - Previous entrainment frequencies used
   - Theta z-scores achieved during those sessions
   - Closed-loop adjustments made

**ML Architecture:**

**Training (Python Service, Offline):**

- **Algorithm**: Gradient boosting (XGBoost or LightGBM) OR Gaussian process regression
- **Features**: All features listed above (~10-15 features total)
- **Target**: Optimal frequency (4-8 Hz) that maximizes:
  - Theta z-score during session
  - Subjective rating
  - Minimal closed-loop adjustments needed
- **Training data**: Accumulate from user's session history (requires ~10-20 sessions minimum)
- **Validation**: Cross-validation, ensure model generalizes
- **Export**: Lightweight model parameters for on-device inference

**Deployment (Mobile App / ESP32):**

- **Inference on-device**: Given current context (time of day, recent sessions), predict optimal frequency
- **Periodic retraining**: Weekly or monthly, as more data accumulates
- **User override**: User can always manually set frequency; system learns from these choices too

**Fallback:**

- If insufficient data (<10 sessions): Use peak theta frequency from calibration
- If model confidence low: Use 6.0 Hz default

**Adaptive Presets:**

- System learns common patterns:
  - Example: "Morning sessions at 6.5 Hz work best for you"
  - Example: "After 3 PM, you respond better to 5.8 Hz"
- Presets auto-update as model learns

#### 3.3.6 Closed-Loop Entrainment

**Control Loop:**

1. **Monitor**: Real-time theta z-score from earpiece
2. **Compare**: Current z-score vs target threshold (default +1.0 SD)
3. **Decide**: If z-score > threshold for >10 seconds:
   - Trigger user-selected behavior
4. **Adjust**:
   - **Option 1 (Reduce intensity)**: Decrease volume by 10-20%
   - **Option 2 (Stop)**: Stop isochronic tone, maintain monitoring
   - **Option 3 (Maintain)**: No change, continue current entrainment
5. **Log**: Record adjustment timestamp, reason, parameters

**User Configuration:**

- User selects preferred behavior in settings
- Can change mid-session if desired
- System logs which behavior user prefers, may suggest based on past preferences

**Hysteresis:**

- To prevent oscillation, use hysteresis:
  - Trigger adjustment when z-score > threshold + 0.2
  - Resume normal entrainment when z-score < threshold - 0.2

#### 3.3.7 Adaptive Presets

**Learning Process:**

1. System analyzes session history
2. Clusters sessions by context (time of day, recent activity, etc.)
3. Identifies optimal configurations for each cluster
4. Generates preset suggestions

**Example Presets:**

- **"Morning Boost"**: 6.5 Hz, 10 min (learned from user's successful morning sessions)
- **"Afternoon Focus"**: 5.8 Hz, 30 min (optimized for post-lunch sessions)
- **"Quick Reset"**: 6.0 Hz, 5 min (when user needs fast recharge)

**User Interaction:**

- Dashboard shows suggested preset based on current time/context
- User can accept, modify, or ignore
- System learns from user's choices (if user always modifies preset, system adapts)

### 3.4 Python Signal Processing Service

#### 3.4.1 Architecture

**Deployment:**

- Local service running on user's computer (development machine)
- Production: Could be containerized (Docker) or native app

**Communication:**

- **BLE Passthrough**: Mobile app forwards raw EEG data from headband to Python service
  - Method: HTTP POST with binary EEG data OR WebSocket stream
  - Mobile app acts as BLE-to-network bridge
- **Response**: Python returns processed results (baseline profile) to app

**Flexible Design:**

- Modular: Can migrate components to on-device processing as mobile/ESP32 capabilities improve
- Well-defined API: Makes transition smooth

#### 3.4.2 Responsibilities

**1. Calibration Session Processing:**

- **Input**: Raw EEG stream (4+ channels, 500 Hz)
- **Processing**:
  - Apply preprocessing pipeline (filtering, artifact rejection)
  - Compute multi-band power spectra
  - Calculate baseline statistics
  - Detect peak theta frequency
- **Output**: Baseline profile (JSON)
  ```json
  {
    "theta_mean": 12.5,
    "theta_std": 3.2,
    "alpha_mean": 8.1,
    "beta_mean": 5.3,
    "peak_theta_freq": 6.3,
    "calibration_quality_score": 87.5,
    "confidence": 0.85,
    "timestamp": "2026-01-19T14:30:00Z"
  }
  ```

**2. ML Model Training:**

- **Input**: Session history (SQLite export or JSON)
- **Processing**:
  - Feature extraction
  - Model training (gradient boosting, hyperparameter tuning)
  - Validation
- **Output**: Trained model parameters (export to mobile app)
  - Lightweight format: Pickle, ONNX, or custom JSON
  - Model metadata: accuracy, confidence, feature importance

**3. Research & Experimentation:**

- Test new algorithms (different filters, ML models, features)
- Generate synthetic EEG for testing (already implemented: `FlowState_SimulatedEEG_Test.py`)
- Visualization and debugging tools
- Export visualizations for user (e.g., detailed calibration report)

#### 3.4.3 Technology Stack

| Component             | Technology            | Notes                                |
| --------------------- | --------------------- | ------------------------------------ |
| **Language**          | Python 3.9+           |                                      |
| **Signal Processing** | NumPy, SciPy          | FFT, filtering, statistics           |
| **ML Training**       | scikit-learn          | Gradient boosting, preprocessing     |
| **EEG Analysis**      | MNE-Python (optional) | Advanced EEG tools, if needed        |
| **API Framework**     | Flask or FastAPI      | HTTP endpoints for app communication |
| **Real-time**         | WebSocket (optional)  | For streaming during calibration     |
| **Data Export**       | pandas                | CSV/JSON export                      |

#### 3.4.4 API Endpoints

**1. POST /calibration/process**

- **Input**: Raw EEG data (binary or JSON array)
- **Output**: Baseline profile (JSON)
- **Processing time**: Near real-time (process as data streams in)

**2. POST /ml/train**

- **Input**: Session history (JSON)
- **Output**: Trained model parameters
- **Processing time**: Minutes (offline, run periodically)

**3. GET /health**

- **Output**: Service status, version

#### 3.4.5 Data Flow (Calibration Mode)

```
1. Mobile App ← BLE ← Calibration Headband (raw EEG, 500 Hz)
2. Mobile App → HTTP POST → Python Service (forward raw EEG)
3. Python Service: Process EEG in real-time
4. Python Service → HTTP Response → Mobile App (baseline profile)
5. Mobile App: Store baseline in SQLite, display summary to user
```

### 3.5 Data Storage & Privacy

#### 3.5.1 Local Storage

**AsyncStorage (Key-Value Store):**

- User settings and preferences
- Device pairing info (UUIDs, names)
- Current session state (for recovery after app restart)
- Last sync timestamps

**SQLite (Relational Database):**

- **Tables**:
  - `baselines`: Calibration baseline profiles
  - `sessions`: Session history with detailed metrics
  - `circadian_patterns`: Aggregated theta data by time of day
  - `ml_models`: Trained model parameters and metadata

**File Storage:**

- Raw EEG exports (EDF format): `<app_documents>/eeg_exports/session_<id>.edf`
- CSV exports: `<app_documents>/exports/sessions_<timestamp>.csv`
- JSON exports: `<app_documents>/exports/profile_<timestamp>.json`

#### 3.5.2 Data Export

**CSV (Session Summary):**

- Columns: session_id, type, start_time, end_time, duration_sec, avg_theta_zscore, max_theta_zscore, entrainment_freq_hz, volume, subjective_rating, notes
- Use case: Import to Excel/Sheets for personal analysis

**EDF (Raw EEG):**

- Standard: European Data Format (EDF or EDF+)
- Includes: All channels, full sampling rate, electrode metadata
- Use case: Advanced analysis in MATLAB, Python (MNE), or other neuroscience tools

**JSON (Structured Export):**

- Complete user profile: baselines, sessions, circadian patterns, settings, ML model params
- Use case: Programmatic access, backup, migration to new device

**Export Trigger:**

- User-initiated from settings
- Choose format
- Share via iOS/Android share sheet (email, cloud storage, etc.)

#### 3.5.3 Privacy & Security

**All Measures Implemented:**

**1. Local-Only Data (MVP):**

- No cloud sync in initial version
- All data stays on device
- User has full control

**2. End-to-End Encryption (Future Cloud Features):**

- If cloud backup/sync added later:
  - E2E encryption (user's device encrypts, only user can decrypt)
  - Zero-knowledge architecture (server cannot read data)

**3. Anonymized Analytics (Opt-In):**

- User can opt-in to share anonymous usage statistics
- **What's shared** (if opted-in):
  - App version, OS version
  - Feature usage counts (e.g., calibrations completed, sessions started)
  - Aggregate metrics (e.g., avg session duration across all users)
- **What's NOT shared**:
  - No personally identifiable information (PII)
  - No raw EEG data
  - No session timestamps or patterns that could identify individual
- **Purpose**: Improve app, guide feature development

**4. Full Transparency:**

- Clear privacy policy (accessible from settings)
- User controls all data sharing (opt-in, not opt-out)
- GDPR compliance:
  - Right to access data (export)
  - Right to erasure (delete account, clear all data)
  - Right to portability (export in standard formats)
  - Explicit consent for data processing
- CCPA compliance: California privacy rights
- HIPAA considerations: If future clinical features, ensure compliance

**Data Retention:**

- Local: User controls (can clear anytime)
- Cloud (future): User controls retention period
- Analytics: Aggregate only, no individual user data retained

#### 3.5.4 Multi-User Support

**MVP: Single User Only**

- One profile per app installation
- Simplifies data model, privacy, UX

**Future Enhancement:**

- Multiple user profiles per device
- Each profile has own:
  - Baseline calibration
  - Session history
  - Settings
  - Paired devices
- Use case: Family sharing, research studies

### 3.6 Third-Party Integrations

#### 3.6.1 Cognitive Performance Tracking

**Purpose:** Correlate theta sessions with behavioral outcomes

**Potential Integrations:**

1. **Pomodoro Timers**:
   - Forest, Focus Keeper, Be Focused
   - Data: Focus session duration, completion rate
   - Correlation: Did theta session before Pomodoro improve focus?

2. **Study Trackers**:
   - StudySmarter, Notion, Obsidian
   - Data: Study time, topics covered
   - Correlation: Theta sessions on study days vs non-study days

3. **Task Management**:
   - Todoist, Things, Asana
   - Data: Tasks completed, productivity score
   - Correlation: Task completion rate on days with theta sessions

**Integration Method:**

- OAuth or API key authentication
- Read-only access (privacy-conscious)
- User grants permissions explicitly
- Data fetched periodically (daily sync)

**Data Flow:**

1. User enables integration in FlowState settings
2. App authenticates with third-party service
3. App fetches study/focus time for past 7-30 days
4. App correlates with theta session history
5. Display insights: "On days you use FlowState, you study 25% longer on average"

**Privacy:**

- Third-party data stays local (same privacy as FlowState data)
- User can disconnect integration anytime

#### 3.6.2 Audio Mixing

**Purpose:** Allow users to listen to music/podcasts while using entrainment

**User Choice (Configurable in Settings):**

1. **Exclusive Audio**:
   - FlowState pauses other audio during entrainment
   - Resume other audio when session ends
   - Use case: User wants full focus on entrainment

2. **Mix with Other Audio**:
   - Blend isochronic tones with user's music/podcasts
   - Adjustable mixing ratio:
     - Entrainment volume: 0-100%
     - Other audio: Unchanged OR duck (reduce by X%)
   - Use case: User prefers background music while working

**Audio Mixing Implementation:**

- iOS: Use AVAudioSession with `.mixWithOthers` option
- Android: Use AudioManager with `AUDIOFOCUS_GAIN_TRANSIENT_MAY_DUCK`
- Detect if other audio playing, suggest appropriate mode if not set

### 3.7 Validation & Testing

**All Validation Methods Implemented:**

#### 3.7.1 A/B Testing Mode

**Purpose:** Allow users to self-validate entrainment efficacy

**Implementation:**

- User enables A/B testing in settings
- System randomly assigns sessions as:
  - **Real**: Isochronic tones at theta frequency (e.g., 6 Hz)
  - **Sham**: Isochronic tones at non-theta frequency (e.g., 12 Hz, outside theta band)
- User is blinded (doesn't know which type until after)
- After session, user rates focus/productivity (1-5 scale)

**Analysis:**

- Compare subjective ratings: Real vs Sham
- Compare theta z-scores achieved: Real vs Sham (should be higher for Real)
- Display results after 10+ sessions (sufficient N for basic stats)
- Example insight: "Your theta was 35% higher during real sessions, and you rated focus 0.8 points higher on average"

**Use Case:**

- User wants to verify FlowState is actually working
- Builds user confidence in product

#### 3.7.2 Statistical Tracking

**Purpose:** Track theta improvement over time

**Metrics Tracked:**

- **Theta z-score trends**: Plot avg z-score per session over weeks/months
- **Improvement percentage**: Compare recent avg (last 7 days) vs baseline calibration or first sessions
- **Frequency optimization convergence**: Show how ML-suggested frequency stabilizes
- **Session outcomes**: % of sessions reaching target theta threshold

**Display:**

- Trend charts in History & Analytics
- Summary stats in dashboard ("Your theta has improved 18% over the past month")

**Use Case:**

- User sees objective progress
- Motivates continued use
- Identifies when recalibration may be needed (if trends plateau or decline)

#### 3.7.3 External Validation

**Purpose:** Correlate FlowState usage with external performance metrics

**Methods:**

1. **Third-Party Integration** (see 3.6.1):
   - Correlate session usage with study time, task completion, productivity scores
   - Display insights in app

2. **User Surveys**:
   - Periodic prompts (weekly): "How has your focus been this week?" (1-5 scale)
   - Correlate with session frequency/consistency
   - Example: "Users who session 5+ times per week report 30% better focus"

3. **Recommendation to Track Externally**:
   - Onboarding/help section suggests:
     - "Keep a focus journal"
     - "Track study hours or work output"
     - "Note days you feel most productive"
   - User can manually correlate with FlowState usage

**Use Case:**

- Strengthen evidence of efficacy beyond EEG metrics
- Build user confidence and adherence

#### 3.7.4 Quality Assurance Strategy

**Comprehensive QA Approach:**

**1. Unit Tests:**

- Signal processing functions (filtering, FFT, artifact detection)
- ML model training and inference
- BLE service methods (connection, data parsing)
- Database operations (CRUD for sessions, baselines)
- **Target coverage**: >80%

**2. Integration Tests:**

- App-to-device communication (mock BLE devices)
- Python service integration (mock calibration flow)
- Third-party API integrations (mock OAuth, data fetch)
- **Test scenarios**: Typical user flows end-to-end

**3. End-to-End Tests:**

- Complete user flows:
  - Onboarding → Device pairing → Calibration → Daily session → View analytics
  - Scheduled session trigger → Notification → Start session
  - Export data → Verify file format
- **Tools**: Detox (React Native E2E), Appium

**4. User Studies:**

- **Alpha testing** (internal, 5-10 users):
  - Test basic functionality, identify critical bugs
  - Collect qualitative feedback on UX
- **Beta testing** (external, 20-50 users):
  - Real-world usage over 4-8 weeks
  - Track engagement, retention, efficacy metrics
  - Identify edge cases, hardware issues
  - Refine based on feedback

**5. Clinical Validation:**

- **Signal quality validation**:
  - Compare ear-EEG (daily earpiece) vs traditional scalp EEG (research-grade)
  - Measure correlation of theta power estimates
  - N=10-20 participants, controlled lab setting
  - **Success criterion**: Correlation >0.7 between ear-EEG and scalp EEG theta
- **Efficacy pilot study**:
  - N=50-100 participants, 4-8 weeks usage
  - Pre/post cognitive assessments (attention, working memory)
  - Compare FlowState group vs control (no entrainment)
  - Measure theta improvement, subjective focus, task performance
  - **Success criterion**: Statistically significant improvement in FlowState group
- **Publication**:
  - Document methodology, results
  - Submit to peer-reviewed journal (e.g., Journal of Neural Engineering)
  - Builds credibility, supports future medical device pathway if desired

---

## 4. Success Metrics (KPIs)

**Comprehensive KPIs Across Three Dimensions:**

### 4.1 Engagement Metrics

| Metric                    | Definition                                  | Target (Month 3)                        |
| ------------------------- | ------------------------------------------- | --------------------------------------- |
| **DAU / WAU**             | Daily Active Users / Weekly Active Users    | WAU >70% of installs                    |
| **Session Frequency**     | Avg sessions per user per week              | >3 sessions/week                        |
| **Retention Rate**        | % users still active after X days           | 7-day: >40%, 30-day: >25%, 90-day: >15% |
| **Feature Adoption**      | % users who complete calibration            | >60% within first week                  |
| **Feature Adoption**      | % users who use scheduled sessions          | >30% by month 2                         |
| **Time to First Session** | Time from download to first session         | <24 hours for >50% users                |
| **Session Completion**    | % of sessions completed (not stopped early) | >80%                                    |
| **Streak**                | % users with 3+ day streak                  | >20%                                    |

### 4.2 Efficacy Metrics

| Metric                        | Definition                                          | Target                        |
| ----------------------------- | --------------------------------------------------- | ----------------------------- |
| **Theta Improvement**         | Avg z-score increase from baseline after 4 weeks    | +0.3 to +0.5 SD               |
| **Baseline Stability**        | Coefficient of variation in repeat calibrations     | <15% CV                       |
| **Optimal Freq Discovery**    | % users for whom ML finds stable optimal frequency  | >70% after 20+ sessions       |
| **Closed-Loop Effectiveness** | Correlation between target theta and achieved theta | r >0.6                        |
| **Target Achievement**        | % of sessions reaching target theta threshold       | >60%                          |
| **Session Outcomes**          | User-reported focus improvement (pre/post rating)   | +1.0 point avg (on 1-5 scale) |

### 4.3 User Satisfaction

| Metric                       | Definition                                | Target                                     |
| ---------------------------- | ----------------------------------------- | ------------------------------------------ |
| **NPS (Net Promoter Score)** | "How likely to recommend?" (0-10)         | NPS >30 (promoters - detractors)           |
| **App Store Ratings**        | Avg rating on iOS App Store / Google Play | >4.0 stars                                 |
| **Subjective Focus Rating**  | Post-session focus/productivity (1-5)     | >3.5 avg                                   |
| **Qualitative Feedback**     | User testimonials, feature requests       | Collect >20 testimonials in beta           |
| **Support Tickets**          | Volume and resolution time                | <5% users submit tickets, <48h resolution  |
| **Churn Reasons**            | Exit surveys: Why did you stop using?     | Identify top 3 reasons, address in updates |

### 4.4 Technical Metrics

| Metric                         | Definition                               | Target             |
| ------------------------------ | ---------------------------------------- | ------------------ |
| **Signal Quality**             | Avg signal quality score during sessions | >75%               |
| **BLE Connection Reliability** | % of sessions with zero connection drops | >90%               |
| **App Crashes**                | Crash rate per session                   | <1%                |
| **Battery Impact**             | Battery drain during 30-min session      | <10% on avg device |

---

## 5. Technical Risks & Mitigation

### 5.1 EEG Signal Quality (HIGH RISK)

**Risk:**

- Ear-EEG may have more artifacts than traditional scalp EEG
- Motion, jaw clenching, talking can contaminate signal
- Poor electrode contact in ear canal

**Mitigation:**

1. **Comprehensive artifact rejection algorithms**:
   - Multi-method detection (amplitude, frequency, gradient)
   - Real-time quality feedback to user
   - Auto-reject bad segments during calibration
2. **Validation study**:
   - Compare ear-EEG vs research-grade headband EEG
   - Measure correlation, identify failure modes
   - Iterate on electrode design based on results
3. **Electrode design optimization**:
   - Test dry electrodes vs gel-based
   - Optimize placement (in-ear vs around-ear)
   - User education: Proper insertion, moisture, hair interference
4. **User education**:
   - Onboarding guide with images/video
   - Real-time troubleshooting (if quality poor, show tips)
   - Help section: "Getting the best signal quality"

**Success Criterion:**

- Correlation between ear-EEG and scalp EEG theta power >0.7
- > 75% avg signal quality during user sessions

### 5.2 Bluetooth Reliability (MEDIUM RISK)

**Risk:**

- BLE connection drops during sessions
- Latency issues (delay between EEG event and app display)
- Data throughput limitations (500 Hz × 4 channels × 2 bytes = 4 KB/s during calibration)

**Mitigation:**

1. **Auto-reconnect and resume**:
   - App detects disconnect immediately
   - Attempts reconnection every 2 seconds
   - Earpiece continues entrainment at last settings during disconnect
   - App syncs state when reconnected
   - User sees "Reconnecting..." notification, not error
2. **Connection monitoring and retry logic**:
   - Monitor RSSI (signal strength)
   - Warn user if signal weak (<-80 dBm)
   - Suggest moving closer or reducing interference
3. **BLE 5.0 advantages**:
   - Improved range (4x vs BLE 4.2)
   - Higher throughput (2x speed)
   - Ensure devices use BLE 5.0
4. **Optimize data packet size**:
   - During daily wear: Send processed theta power (1 value per 200ms) instead of raw samples
   - Reduces throughput from 4 KB/s to <1 KB/s
   - Only send raw samples during calibration (higher bandwidth requirement)
5. **Robust BLE stack**:
   - Use well-tested library (react-native-ble-plx)
   - Handle edge cases (rapid connect/disconnect, multiple devices)
   - Test on variety of phones (iOS/Android, old/new models)

**Success Criterion:**

- > 90% of sessions have zero connection drops
- Avg latency <500 ms (EEG event to app display)

### 5.3 ML Model Accuracy (MEDIUM RISK)

**Risk:**

- Personalized frequency optimization may not work reliably with limited training data
- Cold start problem: New users have no data
- Model may overfit to noise in small datasets

**Mitigation:**

1. **Start with physiological baseline**:
   - Initial optimal frequency = peak theta frequency from calibration
   - Grounded in neuroscience (individual peak frequency hypothesis)
   - No ML needed, works immediately
2. **Progressive learning**:
   - As more sessions accumulate (10-20+), train ML model
   - Model improves over time
   - User sees gradual refinement, not sudden changes
3. **Fallback to default**:
   - If ML model confidence low (<0.5): Use 6.0 Hz default OR peak theta freq
   - Clearly communicate to user: "Still learning your preferences, using baseline frequency"
4. **User can override**:
   - User always has manual control
   - If user consistently overrides ML, system learns from that
   - Treat manual settings as implicit feedback
5. **Ensemble approach**:
   - Combine multiple signals (physiological, behavioral, temporal)
   - More robust than single feature
   - If one feature noisy, others compensate
6. **Validation**:
   - Cross-validation during training
   - Track model accuracy over time
   - A/B test: ML-suggested freq vs random freq, measure outcomes

**Success Criterion:**

- > 70% of users reach stable optimal frequency after 20+ sessions
- ML-suggested frequency outperforms random frequency in A/B tests (higher theta z-score, better subjective ratings)

### 5.4 User Compliance (LOW-MEDIUM RISK)

**Risk:**

- Users may not complete calibration (perceived friction)
- Users may not wear devices consistently (forget, uncomfortable)
- Without consistent usage, insufficient data for personalization

**Mitigation:**

1. **Minimal friction onboarding**:
   - Calibration optional at first
   - Let users try Quick Boost immediately (no calibration needed, use default 6 Hz)
   - After user sees value, suggest calibration for personalization
2. **Quick Boost mode**:
   - 5-minute session, one-tap start
   - Immediate value, low commitment
   - Builds habit before asking for calibration
3. **Gamification**:
   - Streaks: Celebrate consecutive days with session
   - Achievements: "Completed 10 sessions!", "Reached +2.0 theta z-score!"
   - Progress visualization: Show theta improvement over time
4. **Comfortable hardware design**:
   - Invest in ergonomic earpiece design
   - Lightweight, soft materials
   - Multiple ear tip sizes for fit
   - Beta testing focused on comfort feedback
5. **Clear value communication**:
   - Show theta improvement trends
   - "Your focus improved 18% this month"
   - Testimonials from other users
6. **Smart reminders**:
   - Circadian-aware scheduling
   - Gentle notifications at optimal times
   - "Your theta is usually highest now, good time for a session"

**Success Criterion:**

- > 60% of users complete calibration within first week
- > 50% of users session 3+ times per week by month 2
- 30-day retention >25%

---

## 6. Development Roadmap

### 6.1 Phase 1: MVP (Parallel Development)

**Timeline:** 3-4 months
**Goal:** Functional system with core features, ready for alpha testing

#### Software (Mobile App + Python Service)

**Done (Partially Implemented):**

- ✅ Mobile app structure: Dashboard, session screen, history, settings
- ✅ BLE connectivity: Device scanning, pairing, data streaming
- ✅ Basic session tracking and storage

**To Do:**

- 🔲 Calibration mode integration:
  - BLE passthrough to Python service
  - Real-time signal quality monitoring
  - Session summary display
- 🔲 Python service:
  - REST API or WebSocket endpoint
  - Calibration processing pipeline
  - Baseline computation and export
- 🔲 Daily wear mode enhancement:
  - Real-time theta z-score calculation
  - Multiple visualization options (numeric, gauge, chart)
  - Entrainment controls (frequency/volume sliders)
  - Closed-loop logic (basic, user-configurable threshold behavior)
- 🔲 Session logging:
  - SQLite schema implementation
  - Session detail view
  - Basic analytics (list view, simple stats)
- 🔲 Signal quality indicator:
  - Real-time display (red/yellow/green)
  - Artifact detection (amplitude, frequency, gradient thresholds)
- 🔲 Quick Boost button:
  - One-tap 5-minute theta session
  - Default 6 Hz frequency, adjustable volume
- 🔲 Data export:
  - CSV export (session summary)
  - JSON export (user profile)

#### Hardware (ESP32 Firmware + Devices)

**To Do:**

- 🔲 Calibration headband prototype:
  - 4-channel EEG acquisition
  - 500 Hz sampling
  - BLE communication with app
  - Battery management (4-6 hour target)
- 🔲 Daily wear earpiece prototype:
  - 2-channel ear-EEG acquisition
  - 250 Hz sampling
  - Isochronic tone generation (DAC or PWM)
  - BLE communication
  - Battery management (16+ hour target)
- 🔲 ESP32 firmware:
  - ADC configuration for EEG
  - Hardware filters (if feasible)
  - BLE stack implementation
  - Basic on-device preprocessing
  - Audio generation for earpiece
  - OTA update capability

#### Testing

- 🔲 Internal alpha testing (5-10 users):
  - Test core flows: calibration, daily session, analytics
  - Identify critical bugs
  - Collect UX feedback
- 🔲 Signal quality validation study:
  - Compare ear-EEG vs scalp EEG (N=10-20)
  - Measure theta correlation
  - Iterate on electrode design

**Deliverable:** Functional MVP ready for expanded beta testing

### 6.2 Phase 2: Enhanced Personalization

**Timeline:** 2-3 months after MVP
**Goal:** ML-driven personalization, advanced features, beta testing

#### Software Features

- 🔲 ML frequency optimization:
  - Ensemble model implementation (Python service)
  - Feature extraction from session history
  - Model training pipeline
  - Export to mobile app for on-device inference
  - Display optimal frequency in dashboard
- 🔲 Closed-loop entrainment enhancements:
  - Refined control logic (hysteresis, smoothing)
  - User-configurable behaviors fully implemented
  - Logging and analysis of adjustments
- 🔲 Circadian scheduling:
  - Analyze historical theta by time of day
  - Generate circadian pattern visualization
  - Smart session suggestions based on patterns
  - Notification integration
- 🔲 Multi-band analysis:
  - Alpha and beta visualization in analytics
  - Band ratio calculations (theta/alpha, theta/beta)
  - Expanded baseline profile
- 🔲 Adaptive presets:
  - Preset generation from session history
  - User can save custom presets
  - Dashboard shows suggested preset based on context
- 🔲 Third-party integrations (initial):
  - OAuth implementation
  - Connect with 1-2 productivity apps (e.g., Todoist, Notion)
  - Display correlation insights
- 🔲 A/B testing mode:
  - Randomized sham vs real session assignment
  - Blinded user experience
  - Statistical analysis and results display

#### Testing

- 🔲 Beta testing (20-50 users, 4-8 weeks):
  - Real-world usage, diverse user base
  - Track engagement and efficacy metrics
  - Collect detailed feedback
  - Identify edge cases, refine UX
- 🔲 Efficacy pilot study:
  - N=50-100, controlled study
  - Pre/post cognitive assessments
  - Compare FlowState vs control group
  - Measure theta improvement, task performance
- 🔲 ML model validation:
  - Cross-validation on accumulated data
  - A/B test: ML freq vs random freq
  - Measure accuracy and user satisfaction

**Deliverable:** Personalized, validated product ready for wider release

### 6.3 Phase 3: Advanced Features

**Timeline:** 6-12 months after MVP
**Goal:** Polish, scale, expand capabilities

#### Software Features

- 🔲 Advanced analytics:
  - Calendar heat map implementation
  - Trend prediction (forecast future theta patterns)
  - Detailed insights and recommendations
- 🔲 On-device ML inference:
  - Migrate ML model to run fully on mobile app or ESP32
  - Reduce dependency on Python service
  - Enable offline personalization
- 🔲 Cloud sync (optional):
  - E2E encrypted backup
  - Multi-device support
  - User controls sync settings
- 🔲 Social features:
  - Anonymous leaderboards (optional opt-in)
  - Community challenges ("30-day focus challenge")
  - Share achievements (privacy-conscious)
- 🔲 Advanced audio:
  - Binaural beats option (alternative to isochronic tones)
  - Combined protocols (theta + alpha for creativity)
  - Nature sounds overlay
- 🔲 Expanded integrations:
  - More productivity apps (Forest, Asana, etc.)
  - Wearables (Apple Watch, Fitbit) for additional biomarkers
  - Calendar apps for automated scheduling
- 🔲 Configurable dashboard widgets:
  - User can add/remove/reorder widgets
  - Widget library with multiple options
  - Personalized dashboard layout
- 🔲 Light mode theme:
  - Add light theme option
  - User toggle dark/light
  - Accessibility improvements

#### Hardware

- 🔲 Hardware v2:
  - Refined form factors based on user feedback
  - Improved battery life (optimization, larger cells)
  - Enhanced comfort (ergonomic design, materials)
- 🔲 Production-ready manufacturing:
  - Design for manufacturing (DFM)
  - Supply chain setup
  - Quality control processes
  - Regulatory certifications (CE, FCC, etc.)

#### Testing

- 🔲 Clinical validation study (100+ participants):
  - Rigorous methodology
  - Peer-reviewed protocol
  - Measure efficacy, safety, usability
  - Statistical analysis
- 🔲 Publication:
  - Document study results
  - Submit to peer-reviewed journal
  - Present at conferences
  - Build credibility for future medical pathway

**Deliverable:** Polished, validated, scalable product ready for broader market

### 6.4 Phase 4: Long-Term Vision (12+ months)

**Exploratory Features & Strategic Initiatives:**

- 🔲 Medical device pathway:
  - Evaluate FDA clearance or CE medical device marking
  - Clinical trials if pursuing medical indications (ADHD, cognitive rehabilitation)
  - Regulatory consulting and compliance
- 🔲 Clinical applications:
  - ADHD support: Theta training protocols
  - Meditation enhancement: Alpha/theta integration
  - Sleep optimization: Pre-sleep theta entrainment
  - Cognitive rehabilitation: Post-injury recovery
- 🔲 Advanced ML:
  - Deep learning models (LSTM, transformers for EEG)
  - Transfer learning across users (leverage population data)
  - Real-time anomaly detection (predict fatigue, stress)
- 🔲 Multi-modal sensing:
  - Heart rate variability (HRV) integration
  - Skin conductance (stress/arousal)
  - Eye tracking (via phone camera, attention detection)
  - Correlate multi-modal data for richer insights
- 🔲 Expanded brain states:
  - Alpha (relaxation, creativity)
  - Beta (alert focus, problem-solving)
  - Gamma (peak performance, insight)
  - User selects target state, system optimizes entrainment
- 🔲 Research platform:
  - Enable third-party researchers to access FlowState data (with user consent)
  - API for research data export
  - Collaborative studies with universities
  - Contribute to neuroscience research
- 🔲 Tablet/desktop apps:
  - Companion apps for richer analytics
  - Large-screen visualization
  - Advanced data export and manipulation
  - Research/clinical use cases

---

## 7. Regulatory & Compliance

### 7.1 Current Status: Wellness Device

**Classification:** General wellness product, not a medical device

**Regulatory Burden:** Minimal

- No medical claims (does not diagnose, treat, cure disease)
- Focus on cognitive enhancement, focus, productivity (wellness claims)
- Safety and quality standards (electrical safety, materials)

**Benefits:**

- Faster time to market
- Lower regulatory costs
- Flexibility in marketing and features

**Future Option:**

- Can pursue medical device pathway later if warranted (clinical evidence, market demand)

### 7.2 Safety Considerations

**Electrical Safety:**

- **Low voltage**: <5V DC (USB power standard)
- **Current-limited electrodes**: <1 mA through any electrode
- **Isolation**: Galvanic isolation between EEG and power supply
- **Compliance**: IEC 60601-1 (medical electrical equipment) as guideline, even if not required
  - Ensures high safety standards
  - Prepares for potential future medical classification

**Skin Compatibility:**

- **Biocompatible materials**: Medical-grade plastics, silicone
- **Hypoallergenic**: No latex, minimize sensitizers
- **Testing**: Skin irritation testing (ISO 10993-10)

**Audio Safety:**

- **Volume limiting**: Max output <85 dB SPL (NIOSH safe exposure limit)
- **Warning**: In-app warning if user sets volume >80%
- **Hearing protection**: Recommend breaks, monitor usage duration

**Contraindications (User Warnings):**

- **Epilepsy/seizure disorders**: Consult physician before use (auditory stimulation could theoretically trigger in susceptible individuals, though risk very low at theta frequencies)
- **Pacemakers/implanted devices**: Consult physician (EEG acquisition uses low currents, but caution warranted)
- **Pregnancy**: Consult physician (general precaution, no known risk)
- **Age**: Intended for adults 18+ (developing brains may respond differently)

### 7.3 Data Compliance

**GDPR (General Data Protection Regulation) - EU:**

- **User rights**:
  - Right to access: User can export all data
  - Right to erasure: User can delete all data
  - Right to portability: Export in standard formats (CSV, JSON)
  - Right to be informed: Clear privacy policy
- **Explicit consent**: User opts-in to any data processing (analytics, integrations)
- **Data minimization**: Collect only what's necessary
- **Security**: Encryption at rest and in transit (if cloud features)

**CCPA (California Consumer Privacy Act) - California, USA:**

- **Transparency**: Disclose what data is collected and why
- **Opt-out**: User can opt-out of data sale (not applicable, we don't sell data)
- **Deletion**: User can request deletion

**HIPAA (Health Insurance Portability and Accountability Act) - USA:**

- **Current status**: Not applicable (wellness device, not medical)
- **Future consideration**: If pursuing medical pathway or clinical studies, ensure HIPAA compliance
  - Protected Health Information (PHI) safeguards
  - Business Associate Agreements (BAAs) with any third parties
  - Encryption, access controls, audit logs

**Privacy Policy:**

- Clear, accessible from app settings
- Written in plain language (not just legalese)
- Covers:
  - What data is collected (EEG, session metadata, settings)
  - How it's used (personalization, analytics if opted-in)
  - Who it's shared with (no one by default, third parties only if user enables integrations)
  - User rights (access, delete, export)
  - Security measures (encryption, local storage)
  - Contact info for privacy questions

---

## 8. Open Questions & Future Decisions

### 8.1 Hardware Manufacturing

**Questions:**

1. **In-house vs contract manufacturing?**
   - In-house: More control, higher upfront cost, slower scaling
   - Contract: Faster to market, lower upfront, less control
   - **Decision point**: After MVP validation, evaluate based on production volume needs

2. **Target unit cost and pricing strategy?**
   - Hardware cost: TBD based on components, manufacturing scale
   - Pricing: Premium ($300-500?) vs mid-range ($150-300?) vs budget (<$150?)
   - **Decision point**: Market research, competitive analysis, cost breakdown

3. **Initial production volume?**
   - Small batch (100-500 units) for beta testing
   - Larger run (1000-5000) for initial launch
   - **Decision point**: Based on pre-orders, funding, demand validation

### 8.2 Business Model

**Questions:**

1. **One-time purchase vs subscription?**
   - One-time: User buys hardware + app (freemium app or paid)
   - Subscription: Monthly fee for premium app features, hardware sold separately or bundled
   - Hybrid: Hardware purchase + optional subscription for advanced features (cloud sync, expanded integrations)
   - **Decision point**: User research, competitive analysis, revenue modeling

2. **Freemium app with premium features?**
   - Free tier: Basic sessions, limited history
   - Premium: ML personalization, circadian scheduling, unlimited history, integrations
   - **Decision point**: Feature prioritization, user willingness to pay

3. **Hardware + software bundle pricing?**
   - Bundle: Calibration headband + earpiece + 1 year premium app
   - Separate: Users can buy just earpiece (skip calibration), pay for app separately
   - **Decision point**: Simplify vs flexibility, user personas

### 8.3 Platform Expansion

**Questions:**

1. **Web app for richer analytics?**
   - Pros: Large screen, more complex visualizations, easier data manipulation
   - Cons: Development cost, most users prefer mobile
   - **Decision point**: User demand, resources

2. **Desktop app for power users?**
   - Use case: Researchers, data enthusiasts, detailed analysis
   - **Decision point**: After mobile app mature, if demand exists

3. **Tablet-optimized UI?**
   - iPad, Android tablets: Larger screen real estate
   - Multi-column layouts, richer dashboards
   - **Decision point**: User base analysis (% on tablets), resources

### 8.4 Research Collaborations

**Questions:**

1. **Partner with universities for validation studies?**
   - Pros: Credibility, access to participants, publication opportunities
   - Cons: Slower, may require data sharing, IRB approval
   - **Decision point**: After Phase 2, seek partnerships

2. **Open-source signal processing algorithms?**
   - Pros: Community contributions, transparency, credibility
   - Cons: Competitive risk (easy to replicate)
   - **Decision point**: Evaluate IP strategy, community engagement value

3. **Publish research papers on efficacy?**
   - Pros: Credibility, marketing, contribution to science
   - Cons: Time, resources, peer review process
   - **Decision point**: After clinical validation study (Phase 3)

---

## 9. Appendix

### 9.1 Glossary

- **Theta Waves**: Brain oscillations in the 4-8 Hz frequency range, associated with relaxation, creativity, and deep focus
- **Z-Score**: Standardized measure of how many standard deviations a value is from the mean (baseline)
- **Entrainment**: Process of synchronizing brainwave activity to an external rhythmic stimulus (e.g., isochronic tones)
- **Isochronic Tones**: Auditory stimulation with evenly spaced pulses of sound at a specific frequency
- **Closed-Loop**: System that monitors output (EEG) and adjusts input (audio) in real-time
- **Circadian**: Relating to daily 24-hour biological rhythms
- **Artifact**: Unwanted noise in EEG signal (motion, muscle activity, electrical interference)
- **EDF (European Data Format)**: Standard file format for storing biological signals, widely used in neuroscience

### 9.2 References

**Neuroscience & Neurofeedback:**

- Gruzelier, J. H. (2014). EEG-neurofeedback for optimising performance. _Neuroscience & Biobehavioral Reviews_, 44, 124-141.
- Klimesch, W. (1999). EEG alpha and theta oscillations reflect cognitive and memory performance: a review and analysis. _Brain Research Reviews_, 29(2-3), 169-195.

**Brain-Computer Interfaces:**

- Wolpaw, J., & Wolpaw, E. W. (Eds.). (2012). _Brain-computer interfaces: principles and practice_. Oxford University Press.

**Auditory Entrainment:**

- Huang, T. L., & Charyton, C. (2008). A comprehensive review of the psychological effects of brainwave entrainment. _Alternative Therapies in Health and Medicine_, 14(5), 38-50.

**Ear-EEG:**

- Looney, D., et al. (2012). The in-the-ear recording concept: user-centered and wearable brain monitoring. _IEEE Pulse_, 3(6), 32-42.

### 9.3 Document Revision History

| Version | Date       | Author         | Changes                                                     |
| ------- | ---------- | -------------- | ----------------------------------------------------------- |
| 1.0     | 2026-01-19 | FlowState Team | Initial draft based on comprehensive requirements gathering |

---

**End of Product Requirements Document**
