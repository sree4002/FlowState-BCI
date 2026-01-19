/**
 * FlowState BCI - App Context
 *
 * Global state management for the app
 */

import { createContext, useContext } from 'react';

// Create context for global state
export const AppContext = createContext();

// Custom hook for accessing app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppContext.Provider');
  }
  return context;
};
