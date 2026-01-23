/**
 * Entrainment Output Module
 *
 * Provides audio output for neural entrainment.
 *
 * USAGE:
 * ```typescript
 * import { PhoneAudioOutput } from './services/entrainment';
 *
 * const output = new PhoneAudioOutput({ volume: 0.7 });
 * await output.play(6); // Play 6 Hz theta entrainment
 * // ... later
 * await output.stop();
 * await output.dispose();
 * ```
 */

export * from './EntrainmentOutput';
export * from './PhoneAudioOutput';
