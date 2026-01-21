/**
 * Signal Processing Service for FlowState BCI
 * Implements Butterworth bandpass filter using typed arrays for performance
 */

/**
 * Filter coefficients for IIR filter
 * b: numerator coefficients (feedforward)
 * a: denominator coefficients (feedback)
 */
export interface FilterCoefficients {
  b: Float64Array;
  a: Float64Array;
}

/**
 * Configuration for Butterworth bandpass filter
 */
export interface ButterworthConfig {
  lowCutoff: number;    // Low cutoff frequency in Hz
  highCutoff: number;   // High cutoff frequency in Hz
  sampleRate: number;   // Sample rate in Hz
  order: number;        // Filter order (must be even for bandpass)
}

/**
 * Filter state for maintaining continuity between chunks
 */
export interface FilterState {
  x: Float64Array;  // Input history
  y: Float64Array;  // Output history
}

/**
 * Default configuration for EEG bandpass filtering (0.5-50 Hz)
 */
export const DEFAULT_BANDPASS_CONFIG: Omit<ButterworthConfig, 'sampleRate'> = {
  lowCutoff: 0.5,
  highCutoff: 50,
  order: 4,
};

/**
 * Compute binomial coefficient C(n, k)
 */
function binomial(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  if (k === 0 || k === n) return 1;

  let result = 1;
  for (let i = 0; i < k; i++) {
    result = (result * (n - i)) / (i + 1);
  }
  return result;
}

/**
 * Design analog Butterworth lowpass prototype filter poles
 * Returns the poles of an Nth order Butterworth filter with cutoff at 1 rad/s
 */
function butterworthPoles(order: number): { real: number; imag: number }[] {
  const poles: { real: number; imag: number }[] = [];

  for (let k = 0; k < order; k++) {
    // Poles are evenly spaced on the left half of the unit circle
    const theta = (Math.PI * (2 * k + order + 1)) / (2 * order);
    poles.push({
      real: Math.cos(theta),
      imag: Math.sin(theta),
    });
  }

  return poles;
}

/**
 * Transform lowpass prototype to bandpass using frequency transformation
 * s -> (s^2 + w0^2) / (bw * s)
 * where w0 = sqrt(wl * wh) and bw = wh - wl
 */
function lowpassToBandpass(
  poles: { real: number; imag: number }[],
  lowFreq: number,
  highFreq: number
): { real: number; imag: number }[] {
  const w0 = Math.sqrt(lowFreq * highFreq);
  const bw = highFreq - lowFreq;
  const bandpassPoles: { real: number; imag: number }[] = [];

  for (const pole of poles) {
    // For each lowpass pole p, we get two bandpass poles:
    // p_bp = (bw * p ± sqrt((bw * p)^2 - 4 * w0^2)) / 2
    const scaledReal = (bw * pole.real) / 2;
    const scaledImag = (bw * pole.imag) / 2;

    // (bw * p)^2 = bw^2 * (real^2 - imag^2 + 2*real*imag*j)
    const bwpReal = bw * pole.real;
    const bwpImag = bw * pole.imag;
    const bwpSqReal = bwpReal * bwpReal - bwpImag * bwpImag;
    const bwpSqImag = 2 * bwpReal * bwpImag;

    // (bw * p)^2 - 4 * w0^2
    const discriminantReal = bwpSqReal - 4 * w0 * w0;
    const discriminantImag = bwpSqImag;

    // Complex square root
    const discMag = Math.sqrt(
      discriminantReal * discriminantReal + discriminantImag * discriminantImag
    );
    const discAngle = Math.atan2(discriminantImag, discriminantReal);

    const sqrtMag = Math.sqrt(discMag);
    const sqrtAngle = discAngle / 2;

    const sqrtReal = sqrtMag * Math.cos(sqrtAngle);
    const sqrtImag = sqrtMag * Math.sin(sqrtAngle);

    // Two poles: (bw * p / 2) ± sqrt(...)/ 2
    bandpassPoles.push({
      real: scaledReal + sqrtReal / 2,
      imag: scaledImag + sqrtImag / 2,
    });
    bandpassPoles.push({
      real: scaledReal - sqrtReal / 2,
      imag: scaledImag - sqrtImag / 2,
    });
  }

  return bandpassPoles;
}

/**
 * Apply bilinear transform: s = (2/T) * (z-1)/(z+1)
 * Transforms analog poles/zeros to digital domain
 */
function bilinearTransform(
  analogPole: { real: number; imag: number },
  sampleRate: number
): { real: number; imag: number } {
  const T = 1 / sampleRate;
  const k = 2 / T;

  // z = (1 + s*T/2) / (1 - s*T/2)
  // where s is the analog pole
  const sT2Real = (analogPole.real * T) / 2;
  const sT2Imag = (analogPole.imag * T) / 2;

  // Numerator: 1 + s*T/2
  const numReal = 1 + sT2Real;
  const numImag = sT2Imag;

  // Denominator: 1 - s*T/2
  const denReal = 1 - sT2Real;
  const denImag = -sT2Imag;

  // Complex division
  const denMagSq = denReal * denReal + denImag * denImag;

  return {
    real: (numReal * denReal + numImag * denImag) / denMagSq,
    imag: (numImag * denReal - numReal * denImag) / denMagSq,
  };
}

/**
 * Convert poles and zeros to transfer function coefficients
 * Using polynomial expansion
 */
function polesToCoefficients(
  poles: { real: number; imag: number }[]
): Float64Array {
  // Start with polynomial [1]
  let coeffs = new Float64Array([1]);

  for (const pole of poles) {
    // Multiply by (z - pole)
    // If pole is complex, we need to handle it with its conjugate
    const newCoeffs = new Float64Array(coeffs.length + 1);

    for (let i = 0; i < coeffs.length; i++) {
      // z * current term
      newCoeffs[i] += coeffs[i];
      // -pole * current term
      newCoeffs[i + 1] -= pole.real * coeffs[i];
    }

    // If pole has imaginary part, multiply by conjugate too
    if (Math.abs(pole.imag) > 1e-10) {
      // We handle conjugate pairs together
      // (z - p)(z - p*) = z^2 - 2*Re(p)*z + |p|^2
      const conjCoeffs = new Float64Array(newCoeffs.length + 1);

      for (let i = 0; i < newCoeffs.length; i++) {
        conjCoeffs[i] += newCoeffs[i];
        conjCoeffs[i + 1] -= pole.real * newCoeffs[i];
      }

      // Skip the conjugate when we encounter it later
      coeffs = conjCoeffs;
    } else {
      coeffs = newCoeffs;
    }
  }

  return coeffs;
}

/**
 * Multiply polynomial coefficients from conjugate pole pairs
 */
function expandPolesReal(
  poles: { real: number; imag: number }[]
): Float64Array {
  // Start with polynomial [1]
  let coeffs: number[] = [1];

  // Process poles in conjugate pairs
  const processed = new Set<number>();

  for (let i = 0; i < poles.length; i++) {
    if (processed.has(i)) continue;

    const pole = poles[i];

    if (Math.abs(pole.imag) < 1e-10) {
      // Real pole: (z - pole)
      const newCoeffs = new Array(coeffs.length + 1).fill(0);
      for (let j = 0; j < coeffs.length; j++) {
        newCoeffs[j] += coeffs[j];
        newCoeffs[j + 1] -= pole.real * coeffs[j];
      }
      coeffs = newCoeffs;
      processed.add(i);
    } else {
      // Complex pole: find conjugate and multiply (z - p)(z - p*)
      // = z^2 - 2*Re(p)*z + |p|^2
      const magSq = pole.real * pole.real + pole.imag * pole.imag;
      const twoReal = 2 * pole.real;

      const newCoeffs = new Array(coeffs.length + 2).fill(0);
      for (let j = 0; j < coeffs.length; j++) {
        newCoeffs[j] += coeffs[j];
        newCoeffs[j + 1] -= twoReal * coeffs[j];
        newCoeffs[j + 2] += magSq * coeffs[j];
      }
      coeffs = newCoeffs;

      // Mark conjugate as processed
      processed.add(i);
      for (let k = i + 1; k < poles.length; k++) {
        if (
          !processed.has(k) &&
          Math.abs(poles[k].real - pole.real) < 1e-10 &&
          Math.abs(poles[k].imag + pole.imag) < 1e-10
        ) {
          processed.add(k);
          break;
        }
      }
    }
  }

  return new Float64Array(coeffs);
}

/**
 * Pre-warp analog frequency for bilinear transform
 * w_analog = (2/T) * tan(w_digital * T / 2)
 */
function prewarpFrequency(digitalFreq: number, sampleRate: number): number {
  const T = 1 / sampleRate;
  const omega = 2 * Math.PI * digitalFreq;
  return (2 / T) * Math.tan((omega * T) / 2);
}

/**
 * Design Butterworth bandpass filter coefficients
 *
 * @param config - Filter configuration
 * @returns Filter coefficients {b, a}
 */
export function designButterworthBandpass(
  config: ButterworthConfig
): FilterCoefficients {
  const { lowCutoff, highCutoff, sampleRate, order } = config;

  // Validate inputs
  if (lowCutoff <= 0 || highCutoff <= 0) {
    throw new Error('Cutoff frequencies must be positive');
  }
  if (lowCutoff >= highCutoff) {
    throw new Error('Low cutoff must be less than high cutoff');
  }
  if (highCutoff >= sampleRate / 2) {
    throw new Error('High cutoff must be below Nyquist frequency');
  }
  if (order < 1 || order % 1 !== 0) {
    throw new Error('Order must be a positive integer');
  }

  // Pre-warp the cutoff frequencies
  const wLow = prewarpFrequency(lowCutoff, sampleRate);
  const wHigh = prewarpFrequency(highCutoff, sampleRate);

  // Get analog lowpass Butterworth poles
  const lpPoles = butterworthPoles(order);

  // Transform to bandpass
  const bpPoles = lowpassToBandpass(lpPoles, wLow, wHigh);

  // Apply bilinear transform to get digital poles
  const digitalPoles = bpPoles.map((p) => bilinearTransform(p, sampleRate));

  // For bandpass, zeros are at z = 1 (order times) and z = -1 (order times)
  const digitalZeros: { real: number; imag: number }[] = [];
  for (let i = 0; i < order; i++) {
    digitalZeros.push({ real: 1, imag: 0 }); // zero at DC
    digitalZeros.push({ real: -1, imag: 0 }); // zero at Nyquist
  }

  // Convert poles and zeros to polynomial coefficients
  const a = expandPolesReal(digitalPoles);
  const bRaw = expandPolesReal(digitalZeros);

  // Normalize so that a[0] = 1
  const a0 = a[0];
  const aNorm = new Float64Array(a.length);
  for (let i = 0; i < a.length; i++) {
    aNorm[i] = a[i] / a0;
  }

  // Calculate gain at center frequency to normalize b coefficients
  const centerFreq = Math.sqrt(lowCutoff * highCutoff);
  const omega = (2 * Math.PI * centerFreq) / sampleRate;

  // Evaluate H(z) at z = e^(j*omega)
  let numReal = 0,
    numImag = 0;
  let denReal = 0,
    denImag = 0;

  for (let i = 0; i < bRaw.length; i++) {
    const angle = -omega * i;
    numReal += bRaw[i] * Math.cos(angle);
    numImag += bRaw[i] * Math.sin(angle);
  }

  for (let i = 0; i < aNorm.length; i++) {
    const angle = -omega * i;
    denReal += aNorm[i] * Math.cos(angle);
    denImag += aNorm[i] * Math.sin(angle);
  }

  const numMag = Math.sqrt(numReal * numReal + numImag * numImag);
  const denMag = Math.sqrt(denReal * denReal + denImag * denImag);
  const gain = numMag / denMag;

  // Normalize b coefficients
  const bNorm = new Float64Array(bRaw.length);
  for (let i = 0; i < bRaw.length; i++) {
    bNorm[i] = bRaw[i] / (a0 * gain);
  }

  return { b: bNorm, a: aNorm };
}

/**
 * Create initial filter state for streaming processing
 *
 * @param coefficients - Filter coefficients
 * @returns Initial filter state with zeroed history
 */
export function createFilterState(
  coefficients: FilterCoefficients
): FilterState {
  const maxLen = Math.max(coefficients.b.length, coefficients.a.length);
  return {
    x: new Float64Array(maxLen),
    y: new Float64Array(maxLen),
  };
}

/**
 * Apply IIR filter to input samples (Direct Form II Transposed)
 * This is more numerically stable than Direct Form I
 *
 * @param input - Input samples as Float64Array
 * @param coefficients - Filter coefficients
 * @param state - Filter state (modified in place)
 * @returns Filtered output samples
 */
export function applyFilter(
  input: Float64Array,
  coefficients: FilterCoefficients,
  state: FilterState
): Float64Array {
  const { b, a } = coefficients;
  const output = new Float64Array(input.length);

  const nb = b.length;
  const na = a.length;
  const nState = state.x.length;

  for (let n = 0; n < input.length; n++) {
    // Shift input history
    for (let i = nState - 1; i > 0; i--) {
      state.x[i] = state.x[i - 1];
    }
    state.x[0] = input[n];

    // Calculate output: y[n] = sum(b[k]*x[n-k]) - sum(a[k]*y[n-k]) for k>0
    let yn = 0;

    // Feedforward (numerator)
    for (let k = 0; k < nb && k < nState; k++) {
      yn += b[k] * state.x[k];
    }

    // Feedback (denominator, skip a[0] which is 1)
    for (let k = 1; k < na && k < nState; k++) {
      yn -= a[k] * state.y[k - 1];
    }

    // Shift output history
    for (let i = nState - 1; i > 0; i--) {
      state.y[i] = state.y[i - 1];
    }
    state.y[0] = yn;

    output[n] = yn;
  }

  return output;
}

/**
 * Apply zero-phase filtering (forward-backward filter)
 * This eliminates phase distortion but doubles the effective order
 *
 * @param input - Input samples as Float64Array
 * @param coefficients - Filter coefficients
 * @returns Zero-phase filtered output
 */
export function applyZeroPhaseFilter(
  input: Float64Array,
  coefficients: FilterCoefficients
): Float64Array {
  // Forward pass
  let state = createFilterState(coefficients);
  const forward = applyFilter(input, coefficients, state);

  // Reverse the signal
  const reversed = new Float64Array(forward.length);
  for (let i = 0; i < forward.length; i++) {
    reversed[i] = forward[forward.length - 1 - i];
  }

  // Backward pass
  state = createFilterState(coefficients);
  const backward = applyFilter(reversed, coefficients, state);

  // Reverse again to get final output
  const output = new Float64Array(backward.length);
  for (let i = 0; i < backward.length; i++) {
    output[i] = backward[backward.length - 1 - i];
  }

  return output;
}

/**
 * Convert number array to Float64Array
 *
 * @param input - Input number array
 * @returns Float64Array copy
 */
export function toFloat64Array(input: number[]): Float64Array {
  return new Float64Array(input);
}

/**
 * Convert Float64Array to number array
 *
 * @param input - Input Float64Array
 * @returns number array copy
 */
export function toNumberArray(input: Float64Array): number[] {
  return Array.from(input);
}

/**
 * High-level function to filter EEG data with default bandpass settings
 *
 * @param samples - Raw EEG samples
 * @param sampleRate - Sampling rate in Hz
 * @param useZeroPhase - Use zero-phase filtering (default: true)
 * @returns Filtered samples
 */
export function filterEEG(
  samples: number[] | Float64Array,
  sampleRate: number,
  useZeroPhase: boolean = true
): Float64Array {
  const config: ButterworthConfig = {
    ...DEFAULT_BANDPASS_CONFIG,
    sampleRate,
  };

  const coefficients = designButterworthBandpass(config);

  const input =
    samples instanceof Float64Array ? samples : new Float64Array(samples);

  if (useZeroPhase) {
    return applyZeroPhaseFilter(input, coefficients);
  } else {
    const state = createFilterState(coefficients);
    return applyFilter(input, coefficients, state);
  }
}

/**
 * Create a reusable filter instance for streaming data
 */
export class ButterworthBandpassFilter {
  private coefficients: FilterCoefficients;
  private state: FilterState;
  private config: ButterworthConfig;

  constructor(config: ButterworthConfig) {
    this.config = config;
    this.coefficients = designButterworthBandpass(config);
    this.state = createFilterState(this.coefficients);
  }

  /**
   * Get the filter configuration
   */
  getConfig(): ButterworthConfig {
    return { ...this.config };
  }

  /**
   * Get the filter coefficients
   */
  getCoefficients(): FilterCoefficients {
    return {
      b: new Float64Array(this.coefficients.b),
      a: new Float64Array(this.coefficients.a),
    };
  }

  /**
   * Process a chunk of samples (maintains state between calls)
   *
   * @param samples - Input samples
   * @returns Filtered output
   */
  process(samples: number[] | Float64Array): Float64Array {
    const input =
      samples instanceof Float64Array ? samples : new Float64Array(samples);
    return applyFilter(input, this.coefficients, this.state);
  }

  /**
   * Reset the filter state (call when starting a new signal)
   */
  reset(): void {
    this.state = createFilterState(this.coefficients);
  }
}

/**
 * Create a bandpass filter with default EEG settings (0.5-50 Hz)
 *
 * @param sampleRate - Sampling rate in Hz
 * @returns Configured ButterworthBandpassFilter instance
 */
export function createEEGBandpassFilter(
  sampleRate: number
): ButterworthBandpassFilter {
  return new ButterworthBandpassFilter({
    ...DEFAULT_BANDPASS_CONFIG,
    sampleRate,
  });
}
