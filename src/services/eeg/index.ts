/**
 * EEG Source Module
 *
 * Provides abstraction layer for EEG data sources.
 *
 * USAGE:
 * ```typescript
 * // Development (simulated data via WebSocket)
 * import { SimulatedEEGSource } from './services/eeg';
 * const source = new SimulatedEEGSource({ serverUrl: 'ws://localhost:8765' });
 *
 * // Production (real BLE hardware) - NOT YET IMPLEMENTED
 * import { BleEEGSource } from './services/eeg';
 * const source = new BleEEGSource({ deviceId: 'xx:xx:xx:xx' });
 * ```
 *
 * SWAPPING SOURCES:
 * The ONLY change needed to switch from simulated to real hardware
 * is changing the source instantiation. The ClosedLoopController
 * and PhoneAudioOutput remain unchanged.
 */

export * from './EEGSource';
export * from './SimulatedEEGSource';
export * from './BleEEGSource';
