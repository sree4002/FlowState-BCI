"""
FlowState BCI - Isochronic Tone Test
====================================

Test the audio generation algorithm on your computer before
uploading to the ESP32. This uses the same math as the firmware.

Requirements:
    pip install numpy sounddevice

Usage:
    python test_isochronic_tones.py

This will play isochronic tones through your speakers/headphones
so you can verify the algorithm works correctly.



NEED TO MAKE THE TONES BETTER TO LISTEN TO, LOOK AT YOUTUBE TONES TO FIND BETTER ONES
"""

import numpy as np
import time

# Try to import sounddevice, give helpful error if missing
try:
    import sounddevice as sd
except ImportError:
    print("sounddevice not installed. Run:")
    print("  pip install sounddevice")
    print("\nOn Mac, you may also need:")
    print("  brew install portaudio")
    exit(1)

# ============================================================
# ISOCHRONIC TONE GENERATOR
# ============================================================

class IsochronicToneGenerator:
    """
    Generates isochronic tones for brainwave entrainment.
    This is a Python version of the ESP32 firmware algorithm.
    """
    
    def __init__(self, sample_rate=44100):
        self.sample_rate = sample_rate
        self.carrier_freq = 440.0    # Hz - the audible tone
        self.theta_freq = 6.0        # Hz - the entrainment frequency
        self.volume = 0.5            # 0.0 to 1.0
        self.phase = 0.0             # Current phase for continuous playback
        
    def generate(self, duration_sec):
        """
        Generate isochronic tone audio data.
        
        Args:
            duration_sec: Duration in seconds
            
        Returns:
            numpy array of audio samples
        """
        num_samples = int(duration_sec * self.sample_rate)
        t = np.arange(num_samples) / self.sample_rate + self.phase
        
        # Update phase for next call (enables continuous playback)
        self.phase += duration_sec
        
        # Calculate theta envelope phase (0 to 1 for each cycle)
        theta_phase = (t * self.theta_freq) % 1.0
        
        # Square wave envelope with smoothed edges
        ramp_width = 0.05
        
        envelope = np.zeros_like(theta_phase)
        
        # Ramp up (0 to ramp_width)
        mask = theta_phase < ramp_width
        envelope[mask] = theta_phase[mask] / ramp_width
        
        # Full on (ramp_width to 0.5 - ramp_width)
        mask = (theta_phase >= ramp_width) & (theta_phase < 0.5 - ramp_width)
        envelope[mask] = 1.0
        
        # Ramp down (0.5 - ramp_width to 0.5)
        mask = (theta_phase >= 0.5 - ramp_width) & (theta_phase < 0.5)
        envelope[mask] = (0.5 - theta_phase[mask]) / ramp_width
        
        # Off for second half (0.5 to 1.0)
        # envelope is already 0 from initialization
        
        # Generate carrier sine wave
        carrier = np.sin(2 * np.pi * self.carrier_freq * t)
        
        # Apply envelope and volume
        audio = carrier * envelope * self.volume
        
        return audio.astype(np.float32)
    
    def set_theta_freq(self, freq):
        """Set the entrainment frequency (1-40 Hz)."""
        self.theta_freq = max(1.0, min(40.0, freq))
        
    def set_carrier_freq(self, freq):
        """Set the carrier tone frequency (100-1000 Hz)."""
        self.carrier_freq = max(100.0, min(1000.0, freq))
        
    def set_volume(self, vol):
        """Set volume (0.0-1.0)."""
        self.volume = max(0.0, min(1.0, vol))


# ============================================================
# INTERACTIVE DEMO
# ============================================================

def play_tone(generator, duration_sec):
    """Play isochronic tone for specified duration."""
    audio = generator.generate(duration_sec)
    sd.play(audio, generator.sample_rate)
    sd.wait()

def continuous_playback(generator, stop_event=None):
    """
    Continuous playback using streaming.
    This is how the ESP32 does it.
    """
    def audio_callback(outdata, frames, time, status):
        audio = generator.generate(frames / generator.sample_rate)
        outdata[:, 0] = audio  # Mono to left channel
        outdata[:, 1] = audio  # Mono to right channel
    
    with sd.OutputStream(
        samplerate=generator.sample_rate,
        channels=2,
        callback=audio_callback,
        blocksize=2048
    ):
        print("Playing... Press Ctrl+C to stop")
        try:
            while True:
                time.sleep(0.1)
        except KeyboardInterrupt:
            pass

def demo_frequencies():
    """Demonstrate different theta frequencies."""
    generator = IsochronicToneGenerator()
    
    frequencies = [
        (4.0, "4 Hz - Deep theta (drowsy, meditation)"),
        (6.0, "6 Hz - Mid theta (memory, learning)"),
        (8.0, "8 Hz - High theta (relaxed alertness)"),
        (10.0, "10 Hz - Alpha (calm, focused)"),
        (40.0, "40 Hz - Gamma (Tsai lab frequency)")
    ]
    
    print("\n" + "="*50)
    print("FREQUENCY DEMONSTRATION")
    print("="*50)
    print("You'll hear each entrainment frequency for 5 seconds.\n")
    
    for freq, description in frequencies:
        print(f"Playing: {description}")
        generator.set_theta_freq(freq)
        play_tone(generator, 5.0)
        print()
        time.sleep(1)
    
    print("Demo complete!")

def interactive_mode():
    """Interactive control of the tone generator."""
    generator = IsochronicToneGenerator()
    
    print("\n" + "="*50)
    print("INTERACTIVE MODE")
    print("="*50)
    print("Commands:")
    print("  start       - Start continuous playback")
    print("  stop        - Stop playback")
    print("  freq <hz>   - Set theta frequency (e.g., 'freq 6')")
    print("  carrier <hz>- Set carrier frequency (e.g., 'carrier 440')")
    print("  vol <0-1>   - Set volume (e.g., 'vol 0.5')")
    print("  test        - Play 5 second test tone")
    print("  demo        - Run frequency demonstration")
    print("  quit        - Exit")
    print()
    
    stream = None
    
    def audio_callback(outdata, frames, time_info, status):
        audio = generator.generate(frames / generator.sample_rate)
        outdata[:, 0] = audio
        outdata[:, 1] = audio
    
    while True:
        try:
            cmd = input(f"[{generator.theta_freq}Hz, vol:{generator.volume:.0%}] > ").strip().lower()
        except EOFError:
            break
            
        if not cmd:
            continue
            
        parts = cmd.split()
        action = parts[0]
        
        if action == 'quit' or action == 'q':
            if stream:
                stream.stop()
                stream.close()
            break
            
        elif action == 'start':
            if stream:
                stream.stop()
                stream.close()
            stream = sd.OutputStream(
                samplerate=generator.sample_rate,
                channels=2,
                callback=audio_callback,
                blocksize=2048
            )
            stream.start()
            print("Playback started")
            
        elif action == 'stop':
            if stream:
                stream.stop()
                stream.close()
                stream = None
            print("Playback stopped")
            
        elif action == 'freq' and len(parts) > 1:
            try:
                freq = float(parts[1])
                generator.set_theta_freq(freq)
                print(f"Theta frequency: {generator.theta_freq} Hz")
            except ValueError:
                print("Invalid frequency")
                
        elif action == 'carrier' and len(parts) > 1:
            try:
                freq = float(parts[1])
                generator.set_carrier_freq(freq)
                print(f"Carrier frequency: {generator.carrier_freq} Hz")
            except ValueError:
                print("Invalid frequency")
                
        elif action == 'vol' and len(parts) > 1:
            try:
                vol = float(parts[1])
                generator.set_volume(vol)
                print(f"Volume: {generator.volume:.0%}")
            except ValueError:
                print("Invalid volume")
                
        elif action == 'test':
            print("Playing test tone (5 seconds)...")
            if stream:
                stream.stop()
                stream.close()
                stream = None
            play_tone(generator, 5.0)
            print("Done")
            
        elif action == 'demo':
            if stream:
                stream.stop()
                stream.close()
                stream = None
            demo_frequencies()
            
        else:
            print("Unknown command. Type 'quit' to exit.")
    
    print("Goodbye!")


# ============================================================
# VISUALIZATION
# ============================================================

def visualize_waveform():
    """Show what the isochronic tone looks like."""
    try:
        import matplotlib.pyplot as plt
    except ImportError:
        print("matplotlib not installed. Run: pip install matplotlib")
        return
    
    generator = IsochronicToneGenerator()
    generator.set_theta_freq(6.0)
    
    # Generate 1 second of audio
    audio = generator.generate(1.0)
    t = np.arange(len(audio)) / generator.sample_rate
    
    fig, axes = plt.subplots(3, 1, figsize=(12, 8))
    
    # Full waveform
    axes[0].plot(t, audio, 'b-', linewidth=0.5)
    axes[0].set_title('Isochronic Tone - Full Waveform (1 second at 6 Hz)')
    axes[0].set_xlabel('Time (s)')
    axes[0].set_ylabel('Amplitude')
    axes[0].set_xlim(0, 1)
    axes[0].grid(True, alpha=0.3)
    
    # Zoomed to show pulses
    axes[1].plot(t[:8820], audio[:8820], 'b-', linewidth=0.5)
    axes[1].set_title('Zoomed View - Two Theta Cycles')
    axes[1].set_xlabel('Time (s)')
    axes[1].set_ylabel('Amplitude')
    axes[1].grid(True, alpha=0.3)
    
    # Envelope only
    theta_phase = (t * generator.theta_freq) % 1.0
    envelope = np.zeros_like(theta_phase)
    ramp_width = 0.05
    envelope[theta_phase < ramp_width] = theta_phase[theta_phase < ramp_width] / ramp_width
    envelope[(theta_phase >= ramp_width) & (theta_phase < 0.5 - ramp_width)] = 1.0
    mask = (theta_phase >= 0.5 - ramp_width) & (theta_phase < 0.5)
    envelope[mask] = (0.5 - theta_phase[mask]) / ramp_width
    
    axes[2].plot(t, envelope, 'r-', linewidth=2)
    axes[2].set_title('Theta Envelope (6 Hz square wave with smoothed edges)')
    axes[2].set_xlabel('Time (s)')
    axes[2].set_ylabel('Envelope')
    axes[2].set_xlim(0, 1)
    axes[2].set_ylim(-0.1, 1.1)
    axes[2].grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('isochronic_waveform.png', dpi=150)
    print("Waveform saved to: isochronic_waveform.png")
    plt.show()


# ============================================================
# MAIN
# ============================================================

def main():
    print("""
    ╔═══════════════════════════════════════════════════════════╗
    ║         FlowState BCI - Isochronic Tone Tester            ║
    ╠═══════════════════════════════════════════════════════════╣
    ║  Test the audio algorithm before uploading to ESP32       ║
    ╚═══════════════════════════════════════════════════════════╝
    """)
    
    print("Select mode:")
    print("  1. Interactive mode (control tones in real-time)")
    print("  2. Frequency demonstration (hear different Hz)")
    print("  3. Visualize waveform (show what the tone looks like)")
    print("  4. Quick test (play 6 Hz for 10 seconds)")
    print()
    
    choice = input("Enter choice (1-4): ").strip()
    
    if choice == '1':
        interactive_mode()
    elif choice == '2':
        demo_frequencies()
    elif choice == '3':
        visualize_waveform()
    elif choice == '4':
        print("\nPlaying 6 Hz theta entrainment tone for 10 seconds...")
        print("(This is what the earpiece will produce)")
        generator = IsochronicToneGenerator()
        play_tone(generator, 10.0)
        print("Done!")
    else:
        print("Invalid choice, running interactive mode...")
        interactive_mode()


if __name__ == "__main__":
    main()
