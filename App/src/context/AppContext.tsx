/**
 * App-level context for FlowState BCI
 * Provides global state for device connection, status, and user profile
 */

import React, { createContext, useContext } from 'react';

export interface DeviceStatus {
  isPlaying: boolean;
  frequency: number;
  volume: number;
}

export interface BleServiceInterface {
  connect: (deviceId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  onStatusUpdate: ((status: DeviceStatus) => void) | null;
}

export interface AppContextValue {
  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;
  deviceStatus: DeviceStatus;
  setDeviceStatus: React.Dispatch<React.SetStateAction<DeviceStatus>>;
  userProfile: Record<string, unknown> | null;
  setUserProfile: React.Dispatch<
    React.SetStateAction<Record<string, unknown> | null>
  >;
  bleService: BleServiceInterface;
}

export const AppContext = createContext<AppContextValue | undefined>(undefined);

export function useAppContext(): AppContextValue {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContext.Provider');
  }
  return context;
}

export default AppContext;
