/**
 * Simulated Mode Context
 *
 * Manages the simulated EEG source and closed-loop controller for development/testing.
 * Provides real-time EEG metrics and entrainment state to the UI.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from 'react';
import { useSettings } from './SettingsContext';
import {
  EEGMetrics,
  EEGConnectionState,
  SimulatedEEGSource,
} from '../services/eeg';
import {
  ClosedLoopController,
  ControllerState,
} from '../services/ClosedLoopController';
import { PhoneAudioOutput } from '../services/entrainment';

/**
 * Simulated mode context state
 */
export interface SimulatedModeContextState {
  /** Whether simulated mode is enabled */
  isEnabled: boolean;

  /** Current EEG metrics from the simulator */
  metrics: EEGMetrics | null;

  /** Connection state to the simulator server */
  connectionState: EEGConnectionState;

  /** Whether the closed-loop controller is running */
  isControllerRunning: boolean;

  /** Whether entrainment is currently active */
  isEntrainmentActive: boolean;

  /** Closed-loop controller state */
  controllerState: ControllerState;

  /** Error message if any */
  error: string | null;
}

/**
 * Simulated mode context actions
 */
export interface SimulatedModeContextActions {
  /** Start the simulated mode connection */
  start: () => Promise<void>;

  /** Stop the simulated mode connection */
  stop: () => Promise<void>;

  /** Force a specific theta state for testing */
  forceState: (state: 'low' | 'normal' | 'high') => void;

  /** Clear forced state */
  clearForcedState: () => void;

  /** Clear any error */
  clearError: () => void;
}

/**
 * Combined context type
 */
export type SimulatedModeContextType = SimulatedModeContextState &
  SimulatedModeContextActions;

/**
 * Default state
 */
const defaultState: SimulatedModeContextState = {
  isEnabled: false,
  metrics: null,
  connectionState: 'disconnected',
  isControllerRunning: false,
  isEntrainmentActive: false,
  controllerState: 'idle',
  error: null,
};

/**
 * Create context
 */
const SimulatedModeContext = createContext<
  SimulatedModeContextType | undefined
>(undefined);

/**
 * Provider props
 */
interface SimulatedModeProviderProps {
  children: ReactNode;
}

/**
 * SimulatedModeProvider
 *
 * Manages the lifecycle of the simulated EEG source and closed-loop controller.
 */
export const SimulatedModeProvider: React.FC<SimulatedModeProviderProps> = ({
  children,
}) => {
  const { settings } = useSettings();

  // State
  const [state, setState] = useState<SimulatedModeContextState>(defaultState);

  // Refs for services (avoid recreation on re-renders)
  const eegSourceRef = useRef<SimulatedEEGSource | null>(null);
  const audioOutputRef = useRef<PhoneAudioOutput | null>(null);
  const controllerRef = useRef<ClosedLoopController | null>(null);

  // Update isEnabled when settings change
  useEffect(() => {
    setState((prev) => ({
      ...prev,
      isEnabled: settings.simulated_mode_enabled,
    }));
  }, [settings.simulated_mode_enabled]);

  // Metrics handler
  const handleMetrics = useCallback((metrics: EEGMetrics) => {
    setState((prev) => ({
      ...prev,
      metrics,
    }));
  }, []);

  // Connection state handler
  const handleConnectionState = useCallback(
    (connectionState: EEGConnectionState) => {
      setState((prev) => ({
        ...prev,
        connectionState,
      }));
    },
    []
  );

  // Closed-loop state handler
  const handleControllerState = useCallback(
    (controllerState: ControllerState) => {
      setState((prev) => ({
        ...prev,
        controllerState,
        isEntrainmentActive: controllerState === 'entraining',
      }));
    },
    []
  );

  // Start simulated mode
  const start = useCallback(async () => {
    if (!settings.simulated_mode_enabled) {
      setState((prev) => ({
        ...prev,
        error: 'Simulated mode is not enabled in settings',
      }));
      return;
    }

    try {
      setState((prev) => ({ ...prev, error: null }));

      // Create EEG source
      if (!eegSourceRef.current) {
        eegSourceRef.current = new SimulatedEEGSource({
          serverUrl: settings.simulated_mode_server_url,
          autoReconnect: true,
          onConnectionStateChange: handleConnectionState,
        });
      }

      // Create audio output
      if (!audioOutputRef.current) {
        audioOutputRef.current = new PhoneAudioOutput({
          frequency: settings.boost_frequency,
          volume: settings.default_volume / 100,
        });
      }

      // Create closed-loop controller
      if (!controllerRef.current) {
        controllerRef.current = new ClosedLoopController(
          eegSourceRef.current,
          audioOutputRef.current,
          {
            startThreshold: -0.5,
            stopThreshold: settings.target_zscore,
            entrainmentFrequency: settings.boost_frequency,
            entrainmentVolume: settings.default_volume / 100,
            onStateChange: handleControllerState,
          }
        );
      }

      // Subscribe to metrics
      eegSourceRef.current.onMetrics(handleMetrics);

      // Start the EEG source
      await eegSourceRef.current.start();

      // Start the closed-loop controller
      await controllerRef.current.start();

      setState((prev) => ({
        ...prev,
        isControllerRunning: true,
      }));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to start simulated mode';
      setState((prev) => ({
        ...prev,
        error: message,
        isControllerRunning: false,
      }));
    }
  }, [
    settings.simulated_mode_enabled,
    settings.simulated_mode_server_url,
    settings.boost_frequency,
    settings.default_volume,
    settings.target_zscore,
    handleMetrics,
    handleConnectionState,
    handleControllerState,
  ]);

  // Stop simulated mode
  const stop = useCallback(async () => {
    console.log('[SimulatedModeContext] stop() called');

    try {
      // Step 1: Stop controller first (this stops entrainment and unsubscribes)
      if (controllerRef.current) {
        console.log('[SimulatedModeContext] Stopping controller...');
        await controllerRef.current.stop();
        console.log('[SimulatedModeContext] Controller stopped');
      }

      // Step 2: Unsubscribe from metrics and stop EEG source
      if (eegSourceRef.current) {
        console.log('[SimulatedModeContext] Stopping EEG source...');
        eegSourceRef.current.offMetrics(handleMetrics);
        await eegSourceRef.current.stop();
        console.log('[SimulatedModeContext] EEG source stopped');
      }

      // Step 3: Dispose audio output (force stops even if controller missed it)
      if (audioOutputRef.current) {
        console.log('[SimulatedModeContext] Disposing audio output...');
        await audioOutputRef.current.dispose();
        console.log('[SimulatedModeContext] Audio output disposed');
      }

      // Step 4: Clear refs
      eegSourceRef.current = null;
      audioOutputRef.current = null;
      controllerRef.current = null;

      setState((prev) => ({
        ...prev,
        isControllerRunning: false,
        isEntrainmentActive: false,
        connectionState: 'disconnected',
        metrics: null,
        controllerState: 'idle',
      }));

      console.log('[SimulatedModeContext] Stop complete');
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to stop simulated mode';
      console.error('[SimulatedModeContext] Stop error:', message);
      setState((prev) => ({
        ...prev,
        error: message,
      }));
    }
  }, [handleMetrics]);

  // Force theta state
  const forceState = useCallback((thetaState: 'low' | 'normal' | 'high') => {
    if (eegSourceRef.current) {
      eegSourceRef.current.forceState(thetaState);
    }
  }, []);

  // Clear forced state
  const clearForcedState = useCallback(() => {
    if (eegSourceRef.current) {
      eegSourceRef.current.clearForcedState();
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('[SimulatedModeContext] Unmounting, cleaning up...');

      // Fire-and-forget cleanup, but log any errors
      const cleanup = async () => {
        try {
          if (controllerRef.current) {
            await controllerRef.current.stop();
          }
        } catch (e) {
          console.error('[SimulatedModeContext] Cleanup controller error:', e);
        }

        try {
          if (eegSourceRef.current) {
            await eegSourceRef.current.stop();
          }
        } catch (e) {
          console.error('[SimulatedModeContext] Cleanup EEG source error:', e);
        }

        try {
          if (audioOutputRef.current) {
            await audioOutputRef.current.dispose();
          }
        } catch (e) {
          console.error(
            '[SimulatedModeContext] Cleanup audio output error:',
            e
          );
        }

        console.log('[SimulatedModeContext] Cleanup complete');
      };

      cleanup();
    };
  }, []);

  const value: SimulatedModeContextType = {
    ...state,
    start,
    stop,
    forceState,
    clearForcedState,
    clearError,
  };

  return (
    <SimulatedModeContext.Provider value={value}>
      {children}
    </SimulatedModeContext.Provider>
  );
};

/**
 * Hook to use simulated mode context
 */
export const useSimulatedMode = (): SimulatedModeContextType => {
  const context = useContext(SimulatedModeContext);
  if (context === undefined) {
    throw new Error(
      'useSimulatedMode must be used within a SimulatedModeProvider'
    );
  }
  return context;
};
