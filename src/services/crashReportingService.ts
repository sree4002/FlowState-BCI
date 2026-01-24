/**
 * Crash Reporting Service for FlowState BCI
 * Provides Sentry-based crash reporting with dynamic loading and mock-friendly interface
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Severity level for captured messages
 */
export type SeverityLevel = 'info' | 'warning' | 'error';

/**
 * Breadcrumb data for crash context
 */
export interface BreadcrumbData {
  [key: string]: unknown;
}

/**
 * User identification for crash reports
 */
export interface CrashReportingUser {
  id: string;
  email?: string;
}

/**
 * Context data for crash reports
 */
export interface CrashReportingContext {
  [key: string]: unknown;
}

/**
 * Configuration options for initialization
 */
export interface CrashReportingConfig {
  dsn: string;
  environment?: string;
  release?: string;
  debug?: boolean;
  enableAutoSessionTracking?: boolean;
  tracesSampleRate?: number;
}

/**
 * Interface for Sentry module operations
 * This enables mocking and type safety
 */
interface SentryModule {
  init: (config: CrashReportingConfig) => void;
  captureException: (error: Error, captureContext?: unknown) => string;
  captureMessage: (message: string, captureContext?: unknown) => string;
  setUser: (user: CrashReportingUser | null) => void;
  addBreadcrumb: (breadcrumb: {
    message: string;
    category?: string;
    data?: BreadcrumbData;
    level?: SeverityLevel;
  }) => void;
  setContext: (name: string, context: CrashReportingContext | null) => void;
  Severity?: {
    Info: string;
    Warning: string;
    Error: string;
  };
}

// ============================================================================
// Module State
// ============================================================================

/**
 * Cached Sentry module reference
 */
let sentryModule: SentryModule | null = null;

/**
 * Flag indicating if Sentry is initialized
 */
let isInitialized = false;

/**
 * Flag indicating if Sentry module is available
 */
let isSentryAvailable: boolean | null = null;

// ============================================================================
// Module Loading
// ============================================================================

/**
 * Attempts to dynamically load the Sentry module
 * Returns null if the module is not available
 */
const loadSentryModule = async (): Promise<SentryModule | null> => {
  if (sentryModule !== null) {
    return sentryModule;
  }

  if (isSentryAvailable === false) {
    return null;
  }

  try {
    // Dynamic import to handle cases where Sentry is not installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sentry = (await import('@sentry/react-native')) as any;

    sentryModule = {
      init: sentry.init,
      captureException: sentry.captureException,
      captureMessage: sentry.captureMessage,
      setUser: sentry.setUser,
      addBreadcrumb: sentry.addBreadcrumb,
      setContext: sentry.setContext,
      Severity: sentry.Severity,
    };

    isSentryAvailable = true;
    return sentryModule;
  } catch (error) {
    console.warn(
      'Sentry module not available. Crash reporting will be disabled.',
      error
    );
    isSentryAvailable = false;
    return null;
  }
};

/**
 * Synchronously gets the Sentry module if already loaded
 * Returns null if not loaded or unavailable
 */
const getSentryModule = (): SentryModule | null => {
  return sentryModule;
};

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the crash reporting service with Sentry
 *
 * @param dsn - The Sentry DSN (Data Source Name)
 * @param options - Additional configuration options
 * @returns Promise that resolves to true if initialization succeeded
 *
 * @example
 * ```typescript
 * const success = await initializeCrashReporting('https://xxx@sentry.io/123');
 * if (success) {
 *   console.log('Crash reporting initialized');
 * }
 * ```
 */
export const initializeCrashReporting = async (
  dsn: string,
  options?: Partial<Omit<CrashReportingConfig, 'dsn'>>
): Promise<boolean> => {
  if (isInitialized) {
    console.warn('Crash reporting is already initialized');
    return true;
  }

  if (!dsn || dsn.trim() === '') {
    console.warn('Invalid DSN provided for crash reporting');
    return false;
  }

  try {
    const sentry = await loadSentryModule();

    if (!sentry) {
      console.warn('Sentry module not available. Crash reporting disabled.');
      return false;
    }

    const devMode = isDevelopment();
    const config: CrashReportingConfig = {
      dsn,
      environment: options?.environment ?? (devMode ? 'development' : 'production'),
      debug: options?.debug ?? devMode,
      enableAutoSessionTracking: options?.enableAutoSessionTracking ?? true,
      tracesSampleRate: options?.tracesSampleRate ?? 0.2,
      ...options,
    };

    sentry.init(config);
    isInitialized = true;

    return true;
  } catch (error) {
    console.error('Failed to initialize crash reporting:', error);
    return false;
  }
};

// ============================================================================
// Exception Capture
// ============================================================================

/**
 * Captures an exception and sends it to Sentry
 *
 * @param error - The error to capture
 * @param context - Optional additional context for the error
 * @returns The event ID if captured, or null if capture failed
 *
 * @example
 * ```typescript
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   captureException(error, { operation: 'riskyOperation', userId: '123' });
 * }
 * ```
 */
export const captureException = (
  error: Error,
  context?: CrashReportingContext
): string | null => {
  const sentry = getSentryModule();

  if (!sentry || !isInitialized) {
    console.error('Crash reporting not initialized. Error:', error.message);
    return null;
  }

  try {
    const captureContext = context
      ? {
          extra: context,
        }
      : undefined;

    const eventId = sentry.captureException(error, captureContext);
    return eventId;
  } catch (captureError) {
    console.error('Failed to capture exception:', captureError);
    return null;
  }
};

// ============================================================================
// Message Capture
// ============================================================================

/**
 * Maps severity level string to Sentry severity
 */
const mapSeverityLevel = (
  level: SeverityLevel,
  sentry: SentryModule
): string => {
  const severityMap: Record<SeverityLevel, string> = {
    info: sentry.Severity?.Info ?? 'info',
    warning: sentry.Severity?.Warning ?? 'warning',
    error: sentry.Severity?.Error ?? 'error',
  };

  return severityMap[level] ?? 'info';
};

/**
 * Captures a message and sends it to Sentry
 *
 * @param message - The message to capture
 * @param level - Optional severity level (defaults to 'info')
 * @returns The event ID if captured, or null if capture failed
 *
 * @example
 * ```typescript
 * captureMessage('User started session', 'info');
 * captureMessage('Session quality degraded', 'warning');
 * captureMessage('Critical calibration failure', 'error');
 * ```
 */
export const captureMessage = (
  message: string,
  level: SeverityLevel = 'info'
): string | null => {
  const sentry = getSentryModule();

  if (!sentry || !isInitialized) {
    console.log(`[${level.toUpperCase()}] ${message}`);
    return null;
  }

  try {
    const captureContext = {
      level: mapSeverityLevel(level, sentry),
    };

    const eventId = sentry.captureMessage(message, captureContext);
    return eventId;
  } catch (captureError) {
    console.error('Failed to capture message:', captureError);
    return null;
  }
};

// ============================================================================
// User Management
// ============================================================================

/**
 * Sets the current user for crash reports
 *
 * @param userId - The user's unique identifier
 * @param email - Optional email address
 *
 * @example
 * ```typescript
 * setUser('user-123', 'user@example.com');
 * ```
 */
export const setUser = (userId: string, email?: string): void => {
  const sentry = getSentryModule();

  if (!sentry || !isInitialized) {
    console.log(`Set user: ${userId}${email ? ` (${email})` : ''}`);
    return;
  }

  try {
    const user: CrashReportingUser = {
      id: userId,
    };

    if (email) {
      user.email = email;
    }

    sentry.setUser(user);
  } catch (error) {
    console.error('Failed to set user:', error);
  }
};

/**
 * Clears the current user from crash reports
 *
 * @example
 * ```typescript
 * // On user logout
 * clearUser();
 * ```
 */
export const clearUser = (): void => {
  const sentry = getSentryModule();

  if (!sentry || !isInitialized) {
    console.log('Cleared user');
    return;
  }

  try {
    sentry.setUser(null);
  } catch (error) {
    console.error('Failed to clear user:', error);
  }
};

// ============================================================================
// Breadcrumbs
// ============================================================================

/**
 * Adds a breadcrumb to the crash reporting trail
 * Breadcrumbs help understand the sequence of events leading to a crash
 *
 * @param message - The breadcrumb message
 * @param category - Optional category for grouping breadcrumbs
 * @param data - Optional additional data
 *
 * @example
 * ```typescript
 * addBreadcrumb('Session started', 'session', { duration: 600 });
 * addBreadcrumb('Bluetooth connected', 'ble', { deviceName: 'FlowBand' });
 * addBreadcrumb('User navigated to settings', 'navigation');
 * ```
 */
export const addBreadcrumb = (
  message: string,
  category?: string,
  data?: BreadcrumbData
): void => {
  const sentry = getSentryModule();

  if (!sentry || !isInitialized) {
    console.log(
      `[Breadcrumb${category ? ` - ${category}` : ''}] ${message}`,
      data ?? ''
    );
    return;
  }

  try {
    sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    });
  } catch (error) {
    console.error('Failed to add breadcrumb:', error);
  }
};

// ============================================================================
// Context Management
// ============================================================================

/**
 * Sets context data for crash reports
 * Context provides structured data that helps with debugging
 *
 * @param key - The context key/name
 * @param context - The context data object
 *
 * @example
 * ```typescript
 * setContext('device', {
 *   name: 'FlowBand Pro',
 *   firmware: '2.0.1',
 *   batteryLevel: 85
 * });
 *
 * setContext('session', {
 *   id: 'session-123',
 *   type: 'focus',
 *   duration: 600
 * });
 * ```
 */
export const setContext = (
  key: string,
  context: CrashReportingContext
): void => {
  const sentry = getSentryModule();

  if (!sentry || !isInitialized) {
    console.log(`[Context - ${key}]`, context);
    return;
  }

  try {
    sentry.setContext(key, context);
  } catch (error) {
    console.error('Failed to set context:', error);
  }
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Checks if crash reporting is currently initialized
 *
 * @returns true if initialized, false otherwise
 */
export const isCrashReportingInitialized = (): boolean => {
  return isInitialized;
};

/**
 * Checks if Sentry module is available
 *
 * @returns true if available, false if not, null if not yet checked
 */
export const isSentryModuleAvailable = (): boolean | null => {
  return isSentryAvailable;
};

/**
 * Resets the crash reporting service state
 * Primarily used for testing purposes
 */
export const resetCrashReportingState = (): void => {
  sentryModule = null;
  isInitialized = false;
  isSentryAvailable = null;
};

// ============================================================================
// Mock Support
// ============================================================================

/**
 * Injects a mock Sentry module for testing
 * This allows tests to verify crash reporting behavior without the actual Sentry SDK
 *
 * @param mockModule - The mock module to inject
 */
export const injectMockSentryModule = (mockModule: SentryModule): void => {
  sentryModule = mockModule;
  isSentryAvailable = true;
};

// Declare __DEV__ for TypeScript (defaults to false if not defined)
declare const __DEV__: boolean | undefined;

/**
 * Safely check if we're in development mode
 */
const isDevelopment = (): boolean => {
  try {
    return typeof __DEV__ !== 'undefined' ? __DEV__ : false;
  } catch {
    return false;
  }
};
