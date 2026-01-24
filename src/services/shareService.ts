/**
 * Share Service for FlowState BCI
 * Provides cross-platform sharing functionality using expo-sharing
 * Handles file sharing and text sharing with graceful fallbacks
 */

import { Platform } from 'react-native';

// Type definitions for expo-sharing module
interface SharingOptions {
  mimeType?: string;
  dialogTitle?: string;
  UTI?: string; // iOS only: Uniform Type Identifier
}

/**
 * Result of a share operation
 */
export interface ShareResult {
  success: boolean;
  error?: string;
  platform: 'ios' | 'android' | 'web' | 'unknown';
}

/**
 * Options for sharing a file
 */
export interface ShareFileOptions {
  mimeType?: string;
  title?: string;
  /** iOS only: Uniform Type Identifier for better sharing experience */
  UTI?: string;
}

/**
 * Options for sharing text
 */
export interface ShareTextOptions {
  title?: string;
  subject?: string;
}

// Type definitions for internal file system module
interface FileSystemModule {
  cacheDirectory: string;
  writeAsStringAsync: (
    fileUri: string,
    contents: string,
    options?: { encoding?: string }
  ) => Promise<void>;
  deleteAsync: (
    fileUri: string,
    options?: { idempotent?: boolean }
  ) => Promise<void>;
  EncodingType: { UTF8: string };
}

// Lazy-loaded expo-sharing module
let sharingModule: {
  isAvailableAsync: () => Promise<boolean>;
  shareAsync: (url: string, options?: SharingOptions) => Promise<void>;
} | null = null;

/**
 * Attempts to load the expo-sharing module
 * Returns null if the module is not available
 */
const loadSharingModule = async (): Promise<typeof sharingModule> => {
  if (sharingModule !== null) {
    return sharingModule;
  }

  try {
    // Dynamic import to handle cases where expo-sharing is not available
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = (await import('expo-sharing')) as any;
    sharingModule = {
      isAvailableAsync: module.isAvailableAsync,
      shareAsync: module.shareAsync,
    };
    return sharingModule;
  } catch (error) {
    console.warn('expo-sharing module not available:', error);
    return null;
  }
};

/**
 * Gets the current platform
 */
const getCurrentPlatform = (): ShareResult['platform'] => {
  if (Platform.OS === 'ios') return 'ios';
  if (Platform.OS === 'android') return 'android';
  if (Platform.OS === 'web') return 'web';
  return 'unknown';
};

/**
 * Checks if sharing is available on the current platform
 *
 * @returns Promise resolving to true if sharing is available
 *
 * @example
 * ```typescript
 * const canShare = await isShareAvailable();
 * if (canShare) {
 *   await shareFile('/path/to/file.csv', 'text/csv', 'Export Data');
 * }
 * ```
 */
export const isShareAvailable = async (): Promise<boolean> => {
  const platform = Platform.OS;

  // Web platform generally doesn't support expo-sharing
  if (platform === 'web') {
    // Check for Web Share API as fallback
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      return true;
    }
    return false;
  }

  try {
    const sharing = await loadSharingModule();
    if (!sharing) {
      return false;
    }
    return await sharing.isAvailableAsync();
  } catch (error) {
    console.warn('Error checking share availability:', error);
    return false;
  }
};

/**
 * Shares a file using the native share sheet
 *
 * @param filePath - Absolute path to the file to share
 * @param mimeType - MIME type of the file (e.g., 'text/csv', 'application/json')
 * @param title - Optional title for the share dialog
 * @returns Promise resolving to ShareResult indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await shareFile(
 *   '/path/to/sessions.csv',
 *   'text/csv',
 *   'FlowState Sessions Export'
 * );
 * if (!result.success) {
 *   console.error('Share failed:', result.error);
 * }
 * ```
 */
export const shareFile = async (
  filePath: string,
  mimeType?: string,
  title?: string
): Promise<ShareResult> => {
  const platform = getCurrentPlatform();

  // Validate inputs
  if (!filePath || typeof filePath !== 'string') {
    return {
      success: false,
      error: 'Invalid file path provided',
      platform,
    };
  }

  try {
    const sharing = await loadSharingModule();

    if (!sharing) {
      return {
        success: false,
        error: 'Sharing module not available on this platform',
        platform,
      };
    }

    const isAvailable = await sharing.isAvailableAsync();
    if (!isAvailable) {
      return {
        success: false,
        error: 'Sharing is not available on this device',
        platform,
      };
    }

    // Build sharing options based on platform
    const options: SharingOptions = {};

    if (mimeType) {
      options.mimeType = mimeType;
    }

    if (title) {
      options.dialogTitle = title;
    }

    // iOS-specific: Add UTI for better file type handling
    if (Platform.OS === 'ios' && mimeType) {
      options.UTI = getUTIFromMimeType(mimeType);
    }

    await sharing.shareAsync(filePath, options);

    return {
      success: true,
      platform,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';

    // Handle user cancellation - this is not an error
    if (errorMessage.includes('cancel') || errorMessage.includes('dismiss')) {
      return {
        success: true, // User chose to cancel, but the operation itself succeeded
        platform,
      };
    }

    return {
      success: false,
      error: errorMessage,
      platform,
    };
  }
};

/**
 * Shares text content using the native share functionality
 * Note: expo-sharing doesn't directly support text sharing,
 * so this creates a temporary file for the text content
 *
 * @param text - The text content to share
 * @param title - Optional title for the share dialog
 * @returns Promise resolving to ShareResult indicating success or failure
 *
 * @example
 * ```typescript
 * const result = await shareText(
 *   'My session summary: 10 minutes, average theta z-score 1.5',
 *   'FlowState Summary'
 * );
 * ```
 */
export const shareText = async (
  text: string,
  title?: string
): Promise<ShareResult> => {
  const platform = getCurrentPlatform();

  // Validate input
  if (!text || typeof text !== 'string') {
    return {
      success: false,
      error: 'Invalid text provided',
      platform,
    };
  }

  try {
    // For web, try the Web Share API first
    if (
      Platform.OS === 'web' &&
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        await navigator.share({
          title: title || 'FlowState',
          text: text,
        });
        return {
          success: true,
          platform,
        };
      } catch (webError) {
        // User may have cancelled, which is still success
        const errorMessage =
          webError instanceof Error ? webError.message : String(webError);
        if (
          errorMessage.includes('cancel') ||
          errorMessage.includes('abort')
        ) {
          return {
            success: true,
            platform,
          };
        }
        throw webError;
      }
    }

    // For native platforms, we need to write to a temp file since expo-sharing
    // only supports file sharing
    const FileSystem = await loadFileSystem();
    if (!FileSystem) {
      return {
        success: false,
        error: 'File system not available for text sharing',
        platform,
      };
    }

    // Create a temporary text file
    const fileName = `flowstate_share_${Date.now()}.txt`;
    const filePath = `${FileSystem.cacheDirectory}${fileName}`;

    await FileSystem.writeAsStringAsync(filePath, text, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    // Share the temporary file
    const result = await shareFile(filePath, 'text/plain', title);

    // Clean up: delete the temporary file after a delay
    // (delay allows the share sheet to read the file)
    setTimeout(async () => {
      try {
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      } catch {
        // Ignore cleanup errors
      }
    }, 5000);

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      success: false,
      error: errorMessage,
      platform,
    };
  }
};

// File system module for text sharing
let fileSystemModule: FileSystemModule | null = null;

/**
 * Attempts to load the expo-file-system module
 */
const loadFileSystem = async (): Promise<FileSystemModule | null> => {
  if (fileSystemModule !== null) {
    return fileSystemModule;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const module = (await import('expo-file-system')) as any;
    fileSystemModule = {
      cacheDirectory: module.cacheDirectory || '',
      writeAsStringAsync: module.writeAsStringAsync,
      deleteAsync: module.deleteAsync,
      EncodingType: module.EncodingType || { UTF8: 'utf8' },
    };
    return fileSystemModule;
  } catch (error) {
    console.warn('expo-file-system module not available:', error);
    return null;
  }
};

/**
 * Converts a MIME type to iOS Uniform Type Identifier (UTI)
 * This helps iOS provide better sharing options
 */
const getUTIFromMimeType = (mimeType: string): string => {
  const mimeToUTI: Record<string, string> = {
    // Text formats
    'text/plain': 'public.plain-text',
    'text/csv': 'public.comma-separated-values-text',
    'text/tab-separated-values': 'public.tab-separated-values-text',

    // Data formats
    'application/json': 'public.json',
    'application/xml': 'public.xml',

    // EDF format (no standard UTI, use generic data)
    'application/octet-stream': 'public.data',
    'application/x-edf': 'public.data',

    // Document formats
    'application/pdf': 'com.adobe.pdf',

    // Image formats
    'image/png': 'public.png',
    'image/jpeg': 'public.jpeg',
  };

  return mimeToUTI[mimeType] || 'public.data';
};

/**
 * Gets the appropriate MIME type for a file extension
 */
export const getMimeTypeForExtension = (extension: string): string => {
  const extensionToMime: Record<string, string> = {
    csv: 'text/csv',
    json: 'application/json',
    txt: 'text/plain',
    edf: 'application/x-edf',
    pdf: 'application/pdf',
    xml: 'application/xml',
  };

  const normalizedExt = extension.toLowerCase().replace(/^\./, '');
  return extensionToMime[normalizedExt] || 'application/octet-stream';
};

/**
 * Checks if the current platform supports native sharing
 * Different from isShareAvailable - this is a synchronous check
 * that doesn't verify device capabilities
 */
export const isPlatformSupportedForSharing = (): boolean => {
  const platform = Platform.OS;
  return platform === 'ios' || platform === 'android';
};

/**
 * Gets share capability information for the current platform
 */
export interface ShareCapabilities {
  supportsFileSharing: boolean;
  supportsTextSharing: boolean;
  platform: ShareResult['platform'];
  requiresFileSystemForText: boolean;
}

export const getShareCapabilities = (): ShareCapabilities => {
  const platform = getCurrentPlatform();

  switch (platform) {
    case 'ios':
    case 'android':
      return {
        supportsFileSharing: true,
        supportsTextSharing: true,
        platform,
        requiresFileSystemForText: true,
      };
    case 'web':
      return {
        supportsFileSharing: false,
        supportsTextSharing:
          typeof navigator !== 'undefined' && typeof navigator.share === 'function',
        platform,
        requiresFileSystemForText: false,
      };
    default:
      return {
        supportsFileSharing: false,
        supportsTextSharing: false,
        platform,
        requiresFileSystemForText: false,
      };
  }
};
