#!/usr/bin/env python3
"""
FlowState BCI - Simulated EEG WebSocket Server

Generates simulated EEG metrics and streams them via WebSocket.
Used for development and testing of the closed-loop system.

Usage:
    python eeg_simulator.py [--port PORT] [--rate HZ]

Control Messages:
    {"command": "set_state", "state": "low" | "normal" | "high"}
    Forces the simulated theta state for testing specific scenarios.

Output Format (JSON):
    {
        "timestamp": 1234567890123,
        "theta_power": 12.5,
        "z_score": -0.8,
        "theta_state": "low",
        "signal_quality": 85,
        "simulated_theta_state": "low"  // Only present if forced
    }
"""

import asyncio
import json
import time
import math
import random
import argparse
from typing import Optional, Set
import websockets
from websockets.server import WebSocketServerProtocol

# Simulation parameters
BASELINE_THETA_MEAN = 10.0  # µV²
BASELINE_THETA_STD = 2.0    # µV²
SIGNAL_QUALITY_MEAN = 85    # %
SIGNAL_QUALITY_STD = 5      # %

# State boundaries (in z-score)
LOW_THRESHOLD = -0.5
HIGH_THRESHOLD = 0.5


class EEGSimulator:
    """Generates simulated EEG metrics with natural fluctuations."""

    def __init__(self):
        self.forced_state: Optional[str] = None
        self.current_theta = BASELINE_THETA_MEAN
        self.natural_drift = 0.0
        self.drift_phase = random.uniform(0, 2 * math.pi)
        self.noise_amplitude = 0.3

    def set_state(self, state: str) -> None:
        """Force a specific theta state."""
        if state in ('low', 'normal', 'high'):
            self.forced_state = state
            print(f"[Simulator] Forced state: {state}")
        else:
            print(f"[Simulator] Invalid state: {state}")

    def clear_forced_state(self) -> None:
        """Clear forced state and return to natural simulation."""
        self.forced_state = None
        print("[Simulator] Cleared forced state")

    def generate_metrics(self) -> dict:
        """Generate a single metrics sample."""
        timestamp = int(time.time() * 1000)

        # Generate theta power
        if self.forced_state:
            theta_power = self._generate_forced_theta()
        else:
            theta_power = self._generate_natural_theta()

        # Calculate z-score
        z_score = (theta_power - BASELINE_THETA_MEAN) / BASELINE_THETA_STD

        # Determine theta state
        if z_score < LOW_THRESHOLD:
            theta_state = 'low'
        elif z_score > HIGH_THRESHOLD:
            theta_state = 'high'
        else:
            theta_state = 'normal'

        # Generate signal quality with some variation
        signal_quality = max(0, min(100,
            random.gauss(SIGNAL_QUALITY_MEAN, SIGNAL_QUALITY_STD)
        ))

        metrics = {
            'timestamp': timestamp,
            'theta_power': round(theta_power, 2),
            'z_score': round(z_score, 2),
            'theta_state': theta_state,
            'signal_quality': round(signal_quality, 1),
        }

        # Add forced state indicator if applicable
        if self.forced_state:
            metrics['simulated_theta_state'] = self.forced_state

        return metrics

    def _generate_natural_theta(self) -> float:
        """Generate naturally fluctuating theta power."""
        # Slow drift over time (simulates natural state changes)
        self.drift_phase += 0.02
        self.natural_drift = 3.0 * math.sin(self.drift_phase)

        # Add random noise
        noise = random.gauss(0, BASELINE_THETA_STD * self.noise_amplitude)

        # Combine baseline + drift + noise
        theta = BASELINE_THETA_MEAN + self.natural_drift + noise

        # Ensure positive
        return max(0.1, theta)

    def _generate_forced_theta(self) -> float:
        """Generate theta power for forced state."""
        # Add small noise even when forced
        noise = random.gauss(0, BASELINE_THETA_STD * 0.1)

        if self.forced_state == 'low':
            # Well below baseline
            return max(0.1, BASELINE_THETA_MEAN - 2 * BASELINE_THETA_STD + noise)
        elif self.forced_state == 'high':
            # Well above baseline
            return BASELINE_THETA_MEAN + 2 * BASELINE_THETA_STD + noise
        else:  # normal
            return BASELINE_THETA_MEAN + noise


class WebSocketServer:
    """WebSocket server for streaming EEG metrics."""

    def __init__(self, host: str = '0.0.0.0', port: int = 8765, rate: int = 10):
        self.host = host
        self.port = port
        self.rate = rate  # Samples per second
        self.simulator = EEGSimulator()
        self.clients: Set[WebSocketServerProtocol] = set()
        self.running = False

    async def handler(self, websocket: WebSocketServerProtocol) -> None:
        """Handle a single client connection."""
        # Log connection details
        remote = websocket.remote_address
        remote_str = f"{remote[0]}:{remote[1]}" if remote else "unknown"
        print(f"[Server] ✅ Client CONNECTED from {remote_str}")
        print(f"[Server]    Total clients: {len(self.clients) + 1}")

        self.clients.add(websocket)

        try:
            async for message in websocket:
                await self.handle_message(message)
        except websockets.ConnectionClosed as e:
            print(f"[Server] Connection closed: code={e.code}, reason='{e.reason or '(none)'}'")
        except Exception as e:
            print(f"[Server] ❌ Handler error: {type(e).__name__}: {e}")
        finally:
            self.clients.discard(websocket)
            print(f"[Server] ❌ Client DISCONNECTED ({remote_str}). Total clients: {len(self.clients)}")

    async def handle_message(self, message: str) -> None:
        """Handle incoming control messages."""
        try:
            data = json.loads(message)
            command = data.get('command')

            if command == 'set_state':
                state = data.get('state')
                if state:
                    self.simulator.set_state(state)
            elif command == 'clear_state':
                self.simulator.clear_forced_state()
            else:
                print(f"[Server] Unknown command: {command}")

        except json.JSONDecodeError:
            print(f"[Server] Invalid JSON: {message}")

    async def broadcast(self, message: str) -> None:
        """Send message to all connected clients."""
        if self.clients:
            await asyncio.gather(
                *[client.send(message) for client in self.clients],
                return_exceptions=True
            )

    async def stream_loop(self) -> None:
        """Main loop for streaming metrics."""
        interval = 1.0 / self.rate
        print(f"[Server] Streaming at {self.rate} Hz (interval: {interval*1000:.1f}ms)")

        while self.running:
            if self.clients:
                metrics = self.simulator.generate_metrics()
                message = json.dumps(metrics)
                await self.broadcast(message)

            await asyncio.sleep(interval)

    async def start(self) -> None:
        """Start the WebSocket server."""
        self.running = True

        print(f"[Server] Starting WebSocket server on ws://{self.host}:{self.port}")
        print(f"[Server] Press Ctrl+C to stop")
        print()

        async with websockets.serve(self.handler, self.host, self.port):
            await self.stream_loop()

    def stop(self) -> None:
        """Stop the server."""
        self.running = False


async def main():
    """Main entry point."""
    parser = argparse.ArgumentParser(description='FlowState BCI EEG Simulator')
    parser.add_argument('--host', default='0.0.0.0', help='Host address (default: 0.0.0.0 for LAN access)')
    parser.add_argument('--port', type=int, default=8765, help='Port number (default: 8765)')
    parser.add_argument('--rate', type=int, default=10, help='Sample rate in Hz (default: 10)')
    args = parser.parse_args()

    server = WebSocketServer(host=args.host, port=args.port, rate=args.rate)

    try:
        await server.start()
    except KeyboardInterrupt:
        print("\n[Server] Shutting down...")
        server.stop()


if __name__ == '__main__':
    asyncio.run(main())
