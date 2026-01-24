/**
 * Tests for Share Service
 * Tests cross-platform sharing functionality for FlowState BCI
 */

import { Platform } from 'react-native';

// Import the mock modules first
import * as ExpoSharing from 'expo-sharing';
import * as ExpoFileSystem from 'expo-file-system';

import {
  shareFile,
  shareText,
  isShareAvailable,
  getMimeTypeForExtension,
  isPlatformSupportedForSharing,
  getShareCapabilities,
} from '../src/services/shareService';

// ============================================================================
// Mock Setup
// ============================================================================

// Get references to the mocked functions
const mockIsAvailableAsync = ExpoSharing.isAvailableAsync as jest.Mock;
const mockShareAsync = ExpoSharing.shareAsync as jest.Mock;
const mockWriteAsStringAsync = ExpoFileSystem.writeAsStringAsync as jest.Mock;
const mockDeleteAsync = ExpoFileSystem.deleteAsync as jest.Mock;

// ============================================================================
// Test Setup
// ============================================================================

describe('Share Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset Platform.OS for each test
    (Platform as { OS: string }).OS = 'ios';
    // Default mock implementations
    mockIsAvailableAsync.mockResolvedValue(true);
    mockShareAsync.mockResolvedValue(undefined);
    mockWriteAsStringAsync.mockResolvedValue(undefined);
    mockDeleteAsync.mockResolvedValue(undefined);
  });

  // ============================================================================
  // isShareAvailable Tests
  // ============================================================================

  describe('isShareAvailable', () => {
    it('should return true when sharing is available on iOS', async () => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(true);

      const result = await isShareAvailable();

      expect(result).toBe(true);
      expect(mockIsAvailableAsync).toHaveBeenCalled();
    });

    it('should return true when sharing is available on Android', async () => {
      (Platform as { OS: string }).OS = 'android';
      mockIsAvailableAsync.mockResolvedValue(true);

      const result = await isShareAvailable();

      expect(result).toBe(true);
      expect(mockIsAvailableAsync).toHaveBeenCalled();
    });

    it('should return false when sharing is not available', async () => {
      mockIsAvailableAsync.mockResolvedValue(false);

      const result = await isShareAvailable();

      expect(result).toBe(false);
    });

    it('should return false on web platform without Web Share API', async () => {
      (Platform as { OS: string }).OS = 'web';

      const result = await isShareAvailable();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockIsAvailableAsync.mockRejectedValue(new Error('Module not found'));

      const result = await isShareAvailable();

      expect(result).toBe(false);
    });
  });

  // ============================================================================
  // shareFile Tests
  // ============================================================================

  describe('shareFile', () => {
    it('should share a file successfully on iOS', async () => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);

      const result = await shareFile(
        '/path/to/file.csv',
        'text/csv',
        'Export Data'
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('ios');
      expect(mockShareAsync).toHaveBeenCalledWith('/path/to/file.csv', {
        mimeType: 'text/csv',
        dialogTitle: 'Export Data',
        UTI: 'public.comma-separated-values-text',
      });
    });

    it('should share a file successfully on Android', async () => {
      (Platform as { OS: string }).OS = 'android';
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);

      const result = await shareFile(
        '/path/to/file.json',
        'application/json',
        'JSON Data'
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('android');
      expect(mockShareAsync).toHaveBeenCalledWith('/path/to/file.json', {
        mimeType: 'application/json',
        dialogTitle: 'JSON Data',
      });
    });

    it('should return error for invalid file path', async () => {
      const result = await shareFile('', 'text/csv');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid file path provided');
    });

    it('should return error when sharing is not available', async () => {
      mockIsAvailableAsync.mockResolvedValue(false);

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sharing is not available on this device');
    });

    it('should handle share cancellation gracefully', async () => {
      mockShareAsync.mockRejectedValue(new Error('User cancelled'));

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.success).toBe(true); // Cancellation is not an error
    });

    it('should handle share errors', async () => {
      mockShareAsync.mockRejectedValue(new Error('Share failed'));

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Share failed');
    });

    it('should work without optional parameters', async () => {
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);

      const result = await shareFile('/path/to/file.csv');

      expect(result.success).toBe(true);
      expect(mockShareAsync).toHaveBeenCalledWith('/path/to/file.csv', {});
    });
  });

  // ============================================================================
  // shareText Tests
  // ============================================================================

  describe('shareText', () => {
    it('should share text by creating a temporary file', async () => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      const result = await shareText('Hello, world!', 'Greeting');

      expect(result.success).toBe(true);
      expect(mockWriteAsStringAsync).toHaveBeenCalled();
      expect(mockShareAsync).toHaveBeenCalled();
    });

    it('should return error for empty text', async () => {
      const result = await shareText('');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid text provided');
    });

    it('should handle file system errors', async () => {
      mockWriteAsStringAsync.mockRejectedValue(
        new Error('Cannot write to file')
      );

      const result = await shareText('Hello, world!');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Cannot write to file');
    });

    it('should cleanup temporary file after sharing', async () => {
      jest.useFakeTimers();

      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);
      mockWriteAsStringAsync.mockResolvedValue(undefined);
      mockDeleteAsync.mockResolvedValue(undefined);

      await shareText('Hello, world!');

      // Fast-forward time to trigger cleanup
      jest.advanceTimersByTime(6000);

      expect(mockDeleteAsync).toHaveBeenCalled();

      jest.useRealTimers();
    });
  });

  // ============================================================================
  // getMimeTypeForExtension Tests
  // ============================================================================

  describe('getMimeTypeForExtension', () => {
    it('should return correct MIME type for csv', () => {
      expect(getMimeTypeForExtension('csv')).toBe('text/csv');
    });

    it('should return correct MIME type for json', () => {
      expect(getMimeTypeForExtension('json')).toBe('application/json');
    });

    it('should return correct MIME type for txt', () => {
      expect(getMimeTypeForExtension('txt')).toBe('text/plain');
    });

    it('should return correct MIME type for edf', () => {
      expect(getMimeTypeForExtension('edf')).toBe('application/x-edf');
    });

    it('should return correct MIME type for pdf', () => {
      expect(getMimeTypeForExtension('pdf')).toBe('application/pdf');
    });

    it('should handle extension with leading dot', () => {
      expect(getMimeTypeForExtension('.csv')).toBe('text/csv');
    });

    it('should handle uppercase extension', () => {
      expect(getMimeTypeForExtension('CSV')).toBe('text/csv');
    });

    it('should return octet-stream for unknown extension', () => {
      expect(getMimeTypeForExtension('unknown')).toBe(
        'application/octet-stream'
      );
    });
  });

  // ============================================================================
  // isPlatformSupportedForSharing Tests
  // ============================================================================

  describe('isPlatformSupportedForSharing', () => {
    it('should return true for iOS', () => {
      (Platform as { OS: string }).OS = 'ios';
      expect(isPlatformSupportedForSharing()).toBe(true);
    });

    it('should return true for Android', () => {
      (Platform as { OS: string }).OS = 'android';
      expect(isPlatformSupportedForSharing()).toBe(true);
    });

    it('should return false for web', () => {
      (Platform as { OS: string }).OS = 'web';
      expect(isPlatformSupportedForSharing()).toBe(false);
    });

    it('should return false for unknown platform', () => {
      (Platform as { OS: string }).OS = 'windows';
      expect(isPlatformSupportedForSharing()).toBe(false);
    });
  });

  // ============================================================================
  // getShareCapabilities Tests
  // ============================================================================

  describe('getShareCapabilities', () => {
    it('should return correct capabilities for iOS', () => {
      (Platform as { OS: string }).OS = 'ios';

      const capabilities = getShareCapabilities();

      expect(capabilities).toEqual({
        supportsFileSharing: true,
        supportsTextSharing: true,
        platform: 'ios',
        requiresFileSystemForText: true,
      });
    });

    it('should return correct capabilities for Android', () => {
      (Platform as { OS: string }).OS = 'android';

      const capabilities = getShareCapabilities();

      expect(capabilities).toEqual({
        supportsFileSharing: true,
        supportsTextSharing: true,
        platform: 'android',
        requiresFileSystemForText: true,
      });
    });

    it('should return correct capabilities for web', () => {
      (Platform as { OS: string }).OS = 'web';

      const capabilities = getShareCapabilities();

      expect(capabilities.supportsFileSharing).toBe(false);
      expect(capabilities.platform).toBe('web');
      expect(capabilities.requiresFileSystemForText).toBe(false);
    });

    it('should return limited capabilities for unknown platform', () => {
      (Platform as { OS: string }).OS = 'unknown';

      const capabilities = getShareCapabilities();

      expect(capabilities).toEqual({
        supportsFileSharing: false,
        supportsTextSharing: false,
        platform: 'unknown',
        requiresFileSystemForText: false,
      });
    });
  });

  // ============================================================================
  // UTI Mapping Tests (iOS-specific)
  // ============================================================================

  describe('UTI Mapping for iOS', () => {
    beforeEach(() => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);
    });

    it('should include UTI for CSV on iOS', async () => {
      await shareFile('/path/to/file.csv', 'text/csv');

      expect(mockShareAsync).toHaveBeenCalledWith(
        '/path/to/file.csv',
        expect.objectContaining({
          UTI: 'public.comma-separated-values-text',
        })
      );
    });

    it('should include UTI for JSON on iOS', async () => {
      await shareFile('/path/to/file.json', 'application/json');

      expect(mockShareAsync).toHaveBeenCalledWith(
        '/path/to/file.json',
        expect.objectContaining({
          UTI: 'public.json',
        })
      );
    });

    it('should include UTI for plain text on iOS', async () => {
      await shareFile('/path/to/file.txt', 'text/plain');

      expect(mockShareAsync).toHaveBeenCalledWith(
        '/path/to/file.txt',
        expect.objectContaining({
          UTI: 'public.plain-text',
        })
      );
    });

    it('should include generic UTI for unknown MIME type on iOS', async () => {
      await shareFile('/path/to/file.xyz', 'application/x-unknown');

      expect(mockShareAsync).toHaveBeenCalledWith(
        '/path/to/file.xyz',
        expect.objectContaining({
          UTI: 'public.data',
        })
      );
    });

    it('should not include UTI on Android', async () => {
      (Platform as { OS: string }).OS = 'android';

      await shareFile('/path/to/file.csv', 'text/csv');

      expect(mockShareAsync).toHaveBeenCalledWith('/path/to/file.csv', {
        mimeType: 'text/csv',
        dialogTitle: undefined,
      });
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle module not available error gracefully', async () => {
      // Simulate module import failure
      mockIsAvailableAsync.mockImplementation(() => {
        throw new Error('Module not found');
      });

      const result = await isShareAvailable();

      expect(result).toBe(false);
    });

    it('should handle non-Error exceptions', async () => {
      mockShareAsync.mockRejectedValue('String error');

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error occurred');
    });

    it('should handle dismiss action as success', async () => {
      mockShareAsync.mockRejectedValue(new Error('User dismissed'));

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.success).toBe(true);
    });
  });

  // ============================================================================
  // Platform-specific Behavior Tests
  // ============================================================================

  describe('Platform-specific Behavior', () => {
    it('should detect iOS platform correctly', async () => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(true);

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.platform).toBe('ios');
    });

    it('should detect Android platform correctly', async () => {
      (Platform as { OS: string }).OS = 'android';
      mockIsAvailableAsync.mockResolvedValue(true);

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.platform).toBe('android');
    });

    it('should detect web platform correctly', async () => {
      (Platform as { OS: string }).OS = 'web';

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.platform).toBe('web');
    });

    it('should detect unknown platform correctly', async () => {
      (Platform as { OS: string }).OS = 'windows';
      mockIsAvailableAsync.mockResolvedValue(false);

      const result = await shareFile('/path/to/file.csv', 'text/csv');

      expect(result.platform).toBe('unknown');
    });
  });

  // ============================================================================
  // Integration-style Tests
  // ============================================================================

  describe('Integration Tests', () => {
    it('should complete full share workflow for CSV file', async () => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);

      // Check availability
      const available = await isShareAvailable();
      expect(available).toBe(true);

      // Get capabilities
      const capabilities = getShareCapabilities();
      expect(capabilities.supportsFileSharing).toBe(true);

      // Share file
      const result = await shareFile(
        '/path/to/sessions.csv',
        getMimeTypeForExtension('csv'),
        'FlowState Sessions'
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('ios');
    });

    it('should complete full share workflow for text', async () => {
      (Platform as { OS: string }).OS = 'android';
      mockIsAvailableAsync.mockResolvedValue(true);
      mockShareAsync.mockResolvedValue(undefined);
      mockWriteAsStringAsync.mockResolvedValue(undefined);

      const result = await shareText(
        'Session summary: 10 minutes, theta z-score 1.5',
        'FlowState Summary'
      );

      expect(result.success).toBe(true);
      expect(result.platform).toBe('android');
      expect(mockWriteAsStringAsync).toHaveBeenCalled();
    });

    it('should gracefully handle unavailable sharing', async () => {
      (Platform as { OS: string }).OS = 'ios';
      mockIsAvailableAsync.mockResolvedValue(false);

      const available = await isShareAvailable();
      expect(available).toBe(false);

      const result = await shareFile('/path/to/file.csv', 'text/csv');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not available');
    });
  });
});
