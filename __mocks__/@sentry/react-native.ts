/**
 * Mock for @sentry/react-native
 * Provides mock implementations for Sentry SDK functions
 */

export const init = jest.fn();

export const captureException = jest.fn().mockReturnValue('mock-event-id');

export const captureMessage = jest.fn().mockReturnValue('mock-message-id');

export const setUser = jest.fn();

export const addBreadcrumb = jest.fn();

export const setContext = jest.fn();

export const Severity = {
  Info: 'info',
  Warning: 'warning',
  Error: 'error',
  Fatal: 'fatal',
  Log: 'log',
  Debug: 'debug',
};

export default {
  init,
  captureException,
  captureMessage,
  setUser,
  addBreadcrumb,
  setContext,
  Severity,
};
