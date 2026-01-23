#!/usr/bin/env python3
"""
Isochronic Tone Generator

Generates isochronic tones for theta brainwave entrainment.
Can play audio interactively or export to WAV file for use in the app.

Isochronic tones are evenly spaced pulses of sound at a specific frequency.
For theta entrainment (4-8 Hz), the pulses occur 4-8 times per second.

Usage:
    # Interactive playback (requires sounddevice)
    python test_isochronic_tones.py

    # Export to WAV file
    python test_isochronic_tones.py --out assets/audio/isochronic.wav --theta 6 --carrier 440 --duration 10

Arguments:
    --out        Output WAV file path (if provided, exports instead of playing)
    --theta      Theta frequency in Hz (default: 6)
    --carrier    Carrier frequency in Hz (default: 440)
    --vol        Volume 0.0-1.0 (default: 0.7)
    --duration   Duration in seconds (default: 10)
"""

import argparse
import math
import os
import struct
import wave
from typing import List

# Audio parameters
SAMPLE_RATE = 44100  # CD quality


def generate_isochronic_tone(
    theta_freq: float = 6.0,
    carrier_freq: float = 440.0,
    volume: float = 0.7,
    duration_sec: float = 10.0,
    sample_rate: int = SAMPLE_RATE,
) -> List[float]:
    """
    Generate isochronic tones.

    Args:
        theta_freq: Frequency of the isochronic pulses (Hz), typically 4-8 for theta
        carrier_freq: Frequency of the carrier tone (Hz)
        volume: Volume level 0.0-1.0
        duration_sec: Total duration in seconds
        sample_rate: Audio sample rate

    Returns:
        List of audio samples (-1.0 to 1.0)
    """
    num_samples = int(sample_rate * duration_sec)
    samples = []

    # Isochronic parameters
    pulse_duration = 0.5 / theta_freq  # 50% duty cycle
    period = 1.0 / theta_freq

    for i in range(num_samples):
        t = i / sample_rate

        # Carrier wave (sine)
        carrier = math.sin(2 * math.pi * carrier_freq * t)

        # Isochronic envelope (on/off at theta frequency)
        phase = (t % period) / period
        if phase < 0.5:  # 50% duty cycle
            # Smooth envelope with sine-shaped attack/release
            envelope_phase = phase * 2  # 0 to 1 during pulse
            envelope = math.sin(envelope_phase * math.pi)  # Smooth pulse shape
        else:
            envelope = 0.0

        # Apply envelope and volume
        sample = carrier * envelope * volume
        samples.append(sample)

    return samples


def samples_to_wav_bytes(samples: List[float], sample_rate: int = SAMPLE_RATE) -> bytes:
    """
    Convert float samples to 16-bit PCM WAV bytes.

    Args:
        samples: Audio samples (-1.0 to 1.0)
        sample_rate: Sample rate in Hz

    Returns:
        WAV file bytes
    """
    # Convert to 16-bit integers
    int_samples = []
    for s in samples:
        # Clamp and scale to 16-bit range
        clamped = max(-1.0, min(1.0, s))
        int_val = int(clamped * 32767)
        int_samples.append(int_val)

    # Pack as bytes
    return struct.pack(f'<{len(int_samples)}h', *int_samples)


def write_wav(filepath: str, samples: List[float], sample_rate: int = SAMPLE_RATE, stereo: bool = False) -> None:
    """
    Write samples to a WAV file.

    Args:
        filepath: Output file path
        samples: Audio samples (-1.0 to 1.0)
        sample_rate: Sample rate in Hz
        stereo: If True, duplicate mono to stereo (L+R identical)
    """
    # Create directory if needed
    os.makedirs(os.path.dirname(filepath) if os.path.dirname(filepath) else '.', exist_ok=True)

    # Convert samples to 16-bit integers
    int_samples = []
    for s in samples:
        clamped = max(-1.0, min(1.0, s))
        int_val = int(clamped * 32767)
        int_samples.append(int_val)

    # If stereo, interleave L and R (identical)
    if stereo:
        stereo_samples = []
        for s in int_samples:
            stereo_samples.append(s)  # Left
            stereo_samples.append(s)  # Right
        audio_bytes = struct.pack(f'<{len(stereo_samples)}h', *stereo_samples)
        num_channels = 2
    else:
        audio_bytes = struct.pack(f'<{len(int_samples)}h', *int_samples)
        num_channels = 1

    # Write WAV file
    with wave.open(filepath, 'wb') as wav_file:
        wav_file.setnchannels(num_channels)
        wav_file.setsampwidth(2)  # 16-bit
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(audio_bytes)

    channels_str = "stereo" if stereo else "mono"
    print(f"[WAV] Written {len(samples)} samples ({len(samples)/sample_rate:.2f}s) {channels_str} to {filepath}")


def play_interactive(theta_freq: float, carrier_freq: float, volume: float, duration: float) -> None:
    """
    Play isochronic tones interactively using sounddevice.
    """
    try:
        import sounddevice as sd
    except ImportError:
        print("Error: sounddevice not installed. Install with: pip install sounddevice")
        print("Or use --out to export to WAV file instead.")
        return

    print(f"[Audio] Generating isochronic tone:")
    print(f"        Theta frequency: {theta_freq} Hz")
    print(f"        Carrier frequency: {carrier_freq} Hz")
    print(f"        Volume: {volume}")
    print(f"        Duration: {duration}s")
    print()

    samples = generate_isochronic_tone(
        theta_freq=theta_freq,
        carrier_freq=carrier_freq,
        volume=volume,
        duration_sec=duration,
    )

    print("[Audio] Playing... Press Ctrl+C to stop.")

    import numpy as np
    audio_data = np.array(samples, dtype=np.float32)

    try:
        sd.play(audio_data, SAMPLE_RATE)
        sd.wait()
        print("[Audio] Playback complete.")
    except KeyboardInterrupt:
        sd.stop()
        print("\n[Audio] Stopped.")


def main():
    parser = argparse.ArgumentParser(
        description='Generate isochronic tones for theta brainwave entrainment',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Play interactively
  python test_isochronic_tones.py

  # Export 10-second WAV at 6 Hz theta
  python test_isochronic_tones.py --out isochronic.wav --theta 6 --duration 10

  # Export for app assets
  python test_isochronic_tones.py --out ../assets/audio/isochronic_theta6_carrier440.wav
        """
    )
    parser.add_argument('--out', type=str, help='Output WAV file path (export mode)')
    parser.add_argument('--theta', type=float, default=6.0, help='Theta frequency in Hz (default: 6)')
    parser.add_argument('--carrier', type=float, default=440.0, help='Carrier frequency in Hz (default: 440)')
    parser.add_argument('--vol', type=float, default=0.7, help='Volume 0.0-1.0 (default: 0.7)')
    parser.add_argument('--duration', type=float, default=10.0, help='Duration in seconds (default: 10)')
    parser.add_argument('--stereo', action='store_true', help='Output stereo WAV (default: mono)')

    args = parser.parse_args()

    if args.out:
        # Export mode
        channels_str = "stereo" if args.stereo else "mono"
        print(f"[Export] Generating isochronic tone WAV:")
        print(f"         Theta: {args.theta} Hz")
        print(f"         Carrier: {args.carrier} Hz")
        print(f"         Volume: {args.vol}")
        print(f"         Duration: {args.duration}s")
        print(f"         Channels: {channels_str}")
        print()

        samples = generate_isochronic_tone(
            theta_freq=args.theta,
            carrier_freq=args.carrier,
            volume=args.vol,
            duration_sec=args.duration,
        )

        write_wav(args.out, samples, stereo=args.stereo)
        print(f"[Export] Done! File saved to: {args.out}")
    else:
        # Interactive playback mode
        play_interactive(args.theta, args.carrier, args.vol, args.duration)


if __name__ == '__main__':
    main()
