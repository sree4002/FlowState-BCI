/**
 * Mock for expo-file-system module
 */

export const cacheDirectory = '/mock/cache/';

export const documentDirectory = '/mock/documents/';

export const writeAsStringAsync = jest
  .fn()
  .mockResolvedValue(undefined);

export const readAsStringAsync = jest
  .fn()
  .mockResolvedValue('');

export const deleteAsync = jest.fn().mockResolvedValue(undefined);

export const getInfoAsync = jest.fn().mockResolvedValue({
  exists: true,
  isDirectory: false,
  size: 1024,
  modificationTime: Date.now(),
  uri: '/mock/cache/file.txt',
});

export const makeDirectoryAsync = jest.fn().mockResolvedValue(undefined);

export const copyAsync = jest.fn().mockResolvedValue(undefined);

export const moveAsync = jest.fn().mockResolvedValue(undefined);

export const EncodingType = {
  UTF8: 'utf8',
  Base64: 'base64',
};

export const FileSystemSessionType = {
  BACKGROUND: 0,
  FOREGROUND: 1,
};

export default {
  cacheDirectory,
  documentDirectory,
  writeAsStringAsync,
  readAsStringAsync,
  deleteAsync,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  moveAsync,
  EncodingType,
  FileSystemSessionType,
};
