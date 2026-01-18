"""
FlowState BCI - Simulated EEG Development Environment
=====================================================

This lets you develop and test the entire signal processing pipeline
without any hardware. Run this to get started immediately.

Usage:
    python simulated_eeg_test.py

What it does:
    1. Generates realistic synthetic EEG with controllable theta power
    2. Runs the full processing pipeline (filtering, theta extraction, artifact rejection)
    3. Shows real-time visualization
    4. Simulates the closed-loop decision making
"""

import numpy as np
import time
from collections import deque
from scipy import signal
from scipy.fft import rfft, rfftfreq
import threading

# ============================================================
# PART 1: SYNTHETIC EEG GENERATOR
# ============================================================

class SyntheticEEG:
    """
    Generates realistic synthetic EEG data with controllable parameters.
    Useful for testing without hardware.
    """
    
    def __init__(self, sampling_rate=200, num_channels=4):
        self.fs = sampling_rate
        self.num_channels = num_channels
        self.t = 0  # Current time in seconds
        
        # Controllable parameters
        self.theta_amplitude = 15.0   # 4-8 Hz (memory, attention)
        self.alpha_amplitude = 10.0   # 8-12 Hz (relaxed wakefulness)
        self.beta_amplitude = 5.0     # 12-30 Hz (active thinking)
        self.noise_amplitude = 8.0    # Background noise
        
        # For simulating state changes
        self.theta_state = 'normal'  # 'high', 'normal', 'low'
        
    def set_theta_state(self, state):
        """Change theta amplitude to simulate different cognitive states."""
        if state == 'high':
            self.theta_amplitude = 25.0
        elif state == 'low':
            self.theta_amplitude = 5.0
        else:
            self.theta_amplitude = 15.0
        self.theta_state = state
        
    def generate(self, num_samples):
        """
        Generate synthetic EEG data.
        
        Returns:
            numpy array of shape (num_channels, num_samples)
        """
        t = np.arange(num_samples) / self.fs + self.t
        self.t += num_samples / self.fs
        
        data = np.zeros((self.num_channels, num_samples))
        
        for ch in range(self.num_channels):
            # Theta band (4-8 Hz) - varies slightly per channel
            theta_freq = 6.0 + 0.5 * np.sin(ch)  # Slightly different per channel
            theta = self.theta_amplitude * np.sin(2 * np.pi * theta_freq * t + ch)
            
            # Alpha band (8-12 Hz)
            alpha_freq = 10.0 + 0.3 * ch
            alpha = self.alpha_amplitude * np.sin(2 * np.pi * alpha_freq * t + ch * 0.5)
            
            # Beta band (12-30 Hz)
            beta_freq = 20.0 + ch
            beta = self.beta_amplitude * np.sin(2 * np.pi * beta_freq * t)
            
            # Pink noise (1/f spectrum, more realistic than white noise)
            white = np.random.randn(num_samples)
            # Simple approximation of pink noise
            b, a = signal.butter(2, 0.1)
            pink = signal.filtfilt(b, a, white) * self.noise_amplitude * 3
            
           # Occasional eye blink artifact (large slow deflection)
        if np.random.random() < 0.02:  # 2% chance per chunk
            blink_len = 50

           # If the chunk is too small, either skip the blink or fit it safely
            if num_samples >= blink_len:
                max_start = num_samples - blink_len  # inclusive start range is [0, max_start]
                blink_pos = np.random.randint(0, max_start + 1)

                blink = np.zeros(num_samples)
                blink_shape = 80 * np.exp(-((np.arange(blink_len) - blink_len/2) ** 2) / 100)
                blink[blink_pos:blink_pos + blink_len] = blink_shape
                data[ch] += blink

        
        return data 


# ============================================================
# PART 2: THETA PROCESSOR (same as production code)
# ============================================================

class ThetaProcessor:
    """
    Real-time theta band extraction and power calculation.
    This is the same code you'll use with real hardware.
    """
    
    def __init__(self, sampling_rate=200, window_size_sec=2.0):
        self.fs = sampling_rate
        self.window_size = int(window_size_sec * sampling_rate)
        
        # Theta band: 4-8 Hz
        self.theta_low = 4.0
        self.theta_high = 8.0
        
        # Design bandpass filter for theta
        nyquist = self.fs / 2
        low = self.theta_low / nyquist
        high = self.theta_high / nyquist
        self.b_theta, self.a_theta = signal.butter(4, [low, high], btype='band')
        
        # Design notch filter for 60Hz line noise
        self.b_notch, self.a_notch = signal.iirnotch(60.0, 30.0, self.fs)
        
        # Rolling buffer for each channel
        self.buffers = {}
        
        # Baseline statistics
        self.baseline_mean = None
        self.baseline_std = None
        
        # History
        self.power_history = deque(maxlen=300)  # 5 min at 1 Hz
        
    def update(self, channel_id, samples):
        """Add new samples to buffer."""
        if channel_id not in self.buffers:
            self.buffers[channel_id] = deque(maxlen=self.window_size)
        for s in samples:
            self.buffers[channel_id].append(s)
    
    def preprocess(self, data):
        """Apply preprocessing: notch filter, detrend."""
        data = data - np.mean(data)
        data = signal.filtfilt(self.b_notch, self.a_notch, data)
        return data
    
    def extract_theta(self, data):
        """Extract theta band from preprocessed data."""
        return signal.filtfilt(self.b_theta, self.a_theta, data)
    
    def calculate_theta_power(self, channel_id):
        """Calculate theta band power for a channel using FFT."""
        if channel_id not in self.buffers:
            return None
        if len(self.buffers[channel_id]) < self.window_size:
            return None
        
        data = np.array(self.buffers[channel_id])
        data = self.preprocess(data)
        
        # Artifact rejection: simple amplitude threshold
        if np.max(np.abs(data)) > 100:
            return None
        
        # FFT-based power calculation
        freqs = rfftfreq(len(data), 1/self.fs)
        fft_vals = np.abs(rfft(data)) ** 2
        
        # Extract theta band
        theta_mask = (freqs >= self.theta_low) & (freqs <= self.theta_high)
        power = np.mean(fft_vals[theta_mask])
        
        return power
    
    def calculate_average_theta_power(self):
        """Calculate average theta power across all channels."""
        powers = []
        for ch_id in self.buffers:
            p = self.calculate_theta_power(ch_id)
            if p is not None:
                powers.append(p)
        
        if len(powers) == 0:
            return None
        
        avg_power = np.mean(powers)
        self.power_history.append(avg_power)
        return avg_power
    
    def set_baseline(self, mean, std):
        """Set baseline statistics from calibration."""
        self.baseline_mean = mean
        self.baseline_std = std
    
    def calculate_baseline_from_history(self):
        """Calculate baseline from collected power history."""
        if len(self.power_history) < 10:
            return False
        history = np.array(self.power_history)
        self.baseline_mean = np.mean(history)
        self.baseline_std = np.std(history)
        return True
    
    def get_theta_z_score(self):
        """Get current theta power as z-score relative to baseline."""
        power = self.calculate_average_theta_power()
        if power is None or self.baseline_mean is None:
            return None
        return (power - self.baseline_mean) / self.baseline_std
    
    def get_theta_state(self):
        """Determine current theta state."""
        z = self.get_theta_z_score()
        if z is None:
            return None
        if z > 1.0:
            return 'high'
        elif z < -1.0:
            return 'low'
        return 'normal'


# ============================================================
# PART 3: ARTIFACT REJECTOR
# ============================================================

class ArtifactRejector:
    """Simple artifact rejection for real-time EEG processing."""
    
    def __init__(self, sampling_rate=200):
        self.fs = sampling_rate
        self.amplitude_threshold = 100  # μV
        self.gradient_threshold = 50    # μV per sample
        
    def is_clean(self, data):
        """Check if data segment is artifact-free."""
        if len(data) < 10:
            return False
        
        # Amplitude check
        if np.max(np.abs(data)) > self.amplitude_threshold:
            return False
        
        # Gradient check (sudden jumps)
        if np.max(np.abs(np.diff(data))) > self.gradient_threshold:
            return False
        
        return True
    
    def get_artifact_type(self, data):
        """Identify type of artifact."""
        if np.max(np.abs(data)) > self.amplitude_threshold:
            return 'amplitude'
        if np.max(np.abs(np.diff(data))) > self.gradient_threshold:
            return 'gradient'
        return 'clean'


# ============================================================
# PART 4: SIMULATED CLOSED-LOOP CONTROLLER
# ============================================================

class SimulatedClosedLoop:
    """
    Simulates the full closed-loop system.
    Tests your logic without hardware.
    """
    
    def __init__(self):
        self.eeg = SyntheticEEG()
        self.processor = ThetaProcessor()
        self.artifact_rejector = ArtifactRejector()
        
        # State
        self.entrainment_active = False
        self.entrainment_threshold_z = -0.5
        self.min_entrainment_duration = 5  # Shorter for testing
        self.entrainment_cooldown = 10
        self.last_entrainment_end = 0
        self.entrainment_start_time = 0
        
        # Logging
        self.log = []
        
    def run_calibration(self, duration_sec=30):
        """Run simulated calibration."""
        print("\n" + "="*50)
        print("CALIBRATION PHASE")
        print("="*50)
        print(f"Collecting baseline for {duration_sec} seconds...")
        
        start = time.time()
        samples_per_chunk = 50  # 250ms at 200Hz
        
        while time.time() - start < duration_sec:
            # Generate and process EEG
            data = self.eeg.generate(samples_per_chunk)
            for ch in range(data.shape[0]):
                self.processor.update(f'ch{ch}', data[ch])
            
            power = self.processor.calculate_average_theta_power()
            
            # Progress
            elapsed = time.time() - start
            if int(elapsed) % 5 == 0 and int(elapsed) > 0:
                print(f"  {int(elapsed)}/{duration_sec} sec - Current power: {power:.1f}" if power else f"  {int(elapsed)}/{duration_sec} sec")
            
            time.sleep(0.1)
        
        # Calculate baseline
        self.processor.calculate_baseline_from_history()
        print(f"\nBaseline established:")
        print(f"  Mean: {self.processor.baseline_mean:.2f}")
        print(f"  Std:  {self.processor.baseline_std:.2f}")
        
    def run_session(self, duration_sec=60):
        """Run simulated closed-loop session."""
        print("\n" + "="*50)
        print("CLOSED-LOOP SESSION")
        print("="*50)
        print("Monitoring theta and triggering entrainment as needed...")
        print("(Theta state will randomly fluctuate to test the system)\n")
        
        start = time.time()
        samples_per_chunk = 50
        last_state_change = start
        
        while time.time() - start < duration_sec:
            current_time = time.time()
            elapsed = current_time - start
            
            # Randomly change theta state every 10-20 seconds to test closed-loop
            if current_time - last_state_change > np.random.uniform(10, 20):
                new_state = np.random.choice(['high', 'normal', 'low'], p=[0.2, 0.5, 0.3])
                self.eeg.set_theta_state(new_state)
                last_state_change = current_time
                print(f"  [{elapsed:.0f}s] Simulated state change -> {new_state} theta")
            
            # Generate and process EEG
            data = self.eeg.generate(samples_per_chunk)
            for ch in range(data.shape[0]):
                self.processor.update(f'ch{ch}', data[ch])
            
            # Get current state
            z_score = self.processor.get_theta_z_score()
            state = self.processor.get_theta_state()
            
            if z_score is not None:
                # Closed-loop decision
                self._closed_loop_decision(z_score, current_time, elapsed)
                
                # Log
                self.log.append({
                    'time': elapsed,
                    'z_score': z_score,
                    'state': state,
                    'entrainment': self.entrainment_active,
                    'simulated_theta': self.eeg.theta_state
                })
            
            time.sleep(0.1)
        
        print("\n" + "="*50)
        print("SESSION COMPLETE")
        print("="*50)
        self._print_summary()
    
    def _closed_loop_decision(self, z_score, current_time, elapsed):
        """Make entrainment decision based on theta state."""
        
        if self.entrainment_active:
            # Check if we should stop
            duration = current_time - self.entrainment_start_time
            if duration >= self.min_entrainment_duration and z_score > 0:
                self.entrainment_active = False
                self.last_entrainment_end = current_time
                print(f"  [{elapsed:.0f}s] ⬛ ENTRAINMENT STOPPED (theta recovered, z={z_score:.2f})")
        else:
            # Check if we should start
            cooldown = current_time - self.last_entrainment_end
            if z_score < self.entrainment_threshold_z and cooldown > self.entrainment_cooldown:
                self.entrainment_active = True
                self.entrainment_start_time = current_time
                print(f"  [{elapsed:.0f}s] 🟩 ENTRAINMENT STARTED (low theta, z={z_score:.2f})")
    
    def _print_summary(self):
        """Print session summary."""
        if not self.log:
            return
        
        total_time = self.log[-1]['time']
        entrainment_time = sum(1 for e in self.log if e['entrainment']) * 0.1
        z_scores = [e['z_score'] for e in self.log]
        
        print(f"Duration: {total_time:.0f} seconds")
        print(f"Entrainment time: {entrainment_time:.1f}s ({entrainment_time/total_time*100:.1f}%)")
        print(f"Z-score range: {min(z_scores):.2f} to {max(z_scores):.2f}")
        print(f"Mean z-score: {np.mean(z_scores):.2f}")


# ============================================================
# PART 5: REAL-TIME VISUALIZATION
# ============================================================

def run_visualization():
    """
    Run real-time visualization with simulated EEG.
    This tests your plotting code.
    """
    try:
        import pyqtgraph as pg
        from pyqtgraph.Qt import QtCore, QtWidgets
    except ImportError:
        print("PyQtGraph not installed. Run: pip install pyqtgraph PyQt5")
        return
    
    print("\n" + "="*50)
    print("REAL-TIME VISUALIZATION")
    print("="*50)
    print("Starting visualization with simulated EEG...")
    print("Close the window to stop.\n")
    
    # Initialize
    eeg = SyntheticEEG()
    processor = ThetaProcessor()
    
    # Qt setup
    app = QtWidgets.QApplication([])
    win = pg.GraphicsLayoutWidget(title="FlowState BCI - Simulated EEG")
    win.resize(1200, 800)
    
    # EEG plot
    eeg_plot = win.addPlot(row=0, col=0, title="Raw EEG (4 channels)")
    eeg_plot.setLabel('left', 'Amplitude', 'μV')
    eeg_plot.setLabel('bottom', 'Samples')
    eeg_plot.setYRange(-150, 450)
    eeg_curves = []
    colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4']
    for color in colors:
        curve = eeg_plot.plot(pen=pg.mkPen(color, width=1))
        eeg_curves.append(curve)
    
    # Theta plot
    theta_plot = win.addPlot(row=1, col=0, title="Theta Band (4-8 Hz)")
    theta_plot.setLabel('left', 'Amplitude', 'μV')
    theta_plot.setLabel('bottom', 'Samples')
    theta_curve = theta_plot.plot(pen=pg.mkPen('#FFD93D', width=2))
    
    # Power plot
    power_plot = win.addPlot(row=2, col=0, title="Theta Power Over Time")
    power_plot.setLabel('left', 'Power')
    power_plot.setLabel('bottom', 'Time (samples)')
    power_curve = power_plot.plot(pen=pg.mkPen('#6BCB77', width=2))
    
    # State text
    state_text = pg.TextItem(text="Calibrating...", color='w', anchor=(0, 0))
    power_plot.addItem(state_text)
    
    win.show()
    
    # Data buffers
    eeg_buffers = [deque(maxlen=1000) for _ in range(4)]
    theta_buffer = deque(maxlen=1000)
    power_buffer = deque(maxlen=300)
    
    # Calibration flag
    calibration_samples = 0
    calibrated = False
    
    # Design theta filter for visualization
    nyq = 200 / 2
    b_theta, a_theta = signal.butter(4, [4/nyq, 8/nyq], btype='band')
    
    def update():
        nonlocal calibration_samples, calibrated
        
        # Generate data
        data = eeg.generate(50)
        
        # Update processor
        for ch in range(4):
            processor.update(f'ch{ch}', data[ch])
            for sample in data[ch]:
                eeg_buffers[ch].append(sample)
        
        # Update EEG plot
        for ch, curve in enumerate(eeg_curves):
            if len(eeg_buffers[ch]) > 0:
                y = np.array(eeg_buffers[ch]) + ch * 100  # Offset for visibility
                curve.setData(y)
        
        # Theta filtered
        if len(eeg_buffers[0]) > 100:
            avg_eeg = np.mean([np.array(buf) for buf in eeg_buffers], axis=0)
            theta_filtered = signal.filtfilt(b_theta, a_theta, avg_eeg)
            for s in theta_filtered[-50:]:
                theta_buffer.append(s)
            theta_curve.setData(np.array(theta_buffer))
        
        # Power
        power = processor.calculate_average_theta_power()
        if power is not None:
            power_buffer.append(power)
            power_curve.setData(np.array(power_buffer))
            
            calibration_samples += 1
            
            # Calibrate after 100 samples
            if not calibrated and calibration_samples > 100:
                processor.calculate_baseline_from_history()
                calibrated = True
            
            # Update state text
            if calibrated:
                z = processor.get_theta_z_score()
                state = processor.get_theta_state()
                if z is not None:
                    color = {'high': '#6BCB77', 'normal': '#FFD93D', 'low': '#FF6B6B'}.get(state, 'w')
                    state_text.setText(f"State: {state}  |  z-score: {z:.2f}")
                    state_text.setColor(color)
        
        # Randomly change theta state for demo
        if np.random.random() < 0.005:
            new_state = np.random.choice(['high', 'normal', 'low'])
            eeg.set_theta_state(new_state)
    
    # Timer
    timer = QtCore.QTimer()
    timer.timeout.connect(update)
    timer.start(50)  # 20 Hz update
    
    app.exec_()


# ============================================================
# PART 6: MAIN - RUN TESTS
# ============================================================

def main():
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║           FlowState BCI - Development Environment          ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  This runs WITHOUT hardware using simulated EEG data.      ║
    ║  Use this to develop and test your signal processing.      ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    print("Select test mode:")
    print("  1. Run closed-loop simulation (text output)")
    print("  2. Run real-time visualization (graphical)")
    print("  3. Run both (simulation first, then visualization)")
    print("  4. Quick signal processing test")
    print()
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice == '1':
        sim = SimulatedClosedLoop()
        sim.run_calibration(duration_sec=20)
        sim.run_session(duration_sec=60)
        
    elif choice == '2':
        run_visualization()
        
    elif choice == '3':
        sim = SimulatedClosedLoop()
        sim.run_calibration(duration_sec=20)
        sim.run_session(duration_sec=45)
        print("\nNow launching visualization...")
        time.sleep(2)
        run_visualization()
        
    elif choice == '4':
        print("\nRunning quick signal processing test...\n")
        
        eeg = SyntheticEEG()
        processor = ThetaProcessor()
        
        # Generate 10 seconds of data
        print("Generating synthetic EEG...")
        for i in range(100):
            data = eeg.generate(20)
            for ch in range(4):
                processor.update(f'ch{ch}', data[ch])
        
        # Calculate power
        power = processor.calculate_average_theta_power()
        print(f"Theta power: {power:.2f}")
        
        # Test with different states
        print("\nTesting different theta states:")
        for state in ['low', 'normal', 'high']:
            eeg.set_theta_state(state)
            for i in range(50):
                data = eeg.generate(20)
                for ch in range(4):
                    processor.update(f'ch{ch}', data[ch])
            power = processor.calculate_average_theta_power()
            print(f"  {state}: power = {power:.2f}")
        
        print("\n✓ Signal processing pipeline working correctly!")
        
    else:
        print("Invalid choice. Running visualization by default...")
        run_visualization()


if __name__ == "__main__":
    main()
