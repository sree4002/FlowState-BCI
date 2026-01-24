/**
 * Type declarations for expo-sharing module
 * This module may not be installed in all environments
 */
declare module 'expo-sharing' {
  export interface SharingOptions {
    /** MIME type of the content being shared */
    mimeType?: string;
    /** Title to display in the share dialog */
    dialogTitle?: string;
    /** iOS only: Uniform Type Identifier */
    UTI?: string;
  }

  /**
   * Checks if sharing is available on the current platform
   */
  export function isAvailableAsync(): Promise<boolean>;

  /**
   * Opens the share dialog to share a file
   * @param url - URL or file path to share
   * @param options - Sharing options
   */
  export function shareAsync(url: string, options?: SharingOptions): Promise<void>;
}
