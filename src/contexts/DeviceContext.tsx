import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DeviceInfo, SignalQuality, EEGDataPacket } from '../types';

/**
 * Device context state interface
 */
export interface DeviceContextState {
  deviceInfo: DeviceInfo | null;
  signalQuality: SignalQuality | null;
  latestEEGData: EEGDataPacket | null;
  isConnecting: boolean;
  connectionError: string | null;
  /** Computed: whether the device is currently connected */
  isConnected: boolean;
}

/**
 * Device context actions interface
 */
export interface DeviceContextActions {
  setDeviceInfo: (device: DeviceInfo | null) => void;
  setSignalQuality: (quality: SignalQuality | null) => void;
  setLatestEEGData: (data: EEGDataPacket | null) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | null) => void;
  resetDeviceState: () => void;
}

/**
 * Combined device context type
 */
export type DeviceContextType = DeviceContextState & DeviceContextActions;

/**
 * Device context for managing BLE device connection state
 */
const DeviceContext = createContext<DeviceContextType | undefined>(undefined);

/**
 * Device provider props
 */
interface DeviceProviderProps {
  children: ReactNode;
}

/**
 * DeviceProvider component
 * Manages global BLE device connection state
 */
export const DeviceProvider: React.FC<DeviceProviderProps> = ({ children }) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [signalQuality, setSignalQuality] = useState<SignalQuality | null>(
    null
  );
  const [latestEEGData, setLatestEEGData] = useState<EEGDataPacket | null>(
    null
  );
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const resetDeviceState = () => {
    setDeviceInfo(null);
    setSignalQuality(null);
    setLatestEEGData(null);
    setIsConnecting(false);
    setConnectionError(null);
  };

  const value: DeviceContextType = {
    deviceInfo,
    signalQuality,
    latestEEGData,
    isConnecting,
    connectionError,
    isConnected: deviceInfo?.is_connected ?? false,
    setDeviceInfo,
    setSignalQuality,
    setLatestEEGData,
    setIsConnecting,
    setConnectionError,
    resetDeviceState,
  };

  return (
    <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
  );
};

/**
 * Hook to use device context
 * Throws error if used outside DeviceProvider
 */
export const useDevice = (): DeviceContextType => {
  const context = useContext(DeviceContext);
  if (context === undefined) {
    throw new Error('useDevice must be used within a DeviceProvider');
  }
  return context;
};
