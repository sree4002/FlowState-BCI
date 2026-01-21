/**
 * Mock implementation of @react-native-async-storage/async-storage
 * Provides an in-memory storage for testing purposes
 */

let mockStorage: Map<string, string> = new Map();

const AsyncStorage = {
  getItem: jest.fn(async (key: string): Promise<string | null> => {
    return mockStorage.get(key) ?? null;
  }),

  setItem: jest.fn(async (key: string, value: string): Promise<void> => {
    mockStorage.set(key, value);
  }),

  removeItem: jest.fn(async (key: string): Promise<void> => {
    mockStorage.delete(key);
  }),

  multiRemove: jest.fn(async (keys: string[]): Promise<void> => {
    keys.forEach((key) => mockStorage.delete(key));
  }),

  multiGet: jest.fn(
    async (keys: string[]): Promise<readonly [string, string | null][]> => {
      return keys.map((key) => [key, mockStorage.get(key) ?? null] as const);
    }
  ),

  multiSet: jest.fn(async (keyValuePairs: [string, string][]): Promise<void> => {
    keyValuePairs.forEach(([key, value]) => mockStorage.set(key, value));
  }),

  getAllKeys: jest.fn(async (): Promise<readonly string[]> => {
    return Array.from(mockStorage.keys());
  }),

  clear: jest.fn(async (): Promise<void> => {
    mockStorage.clear();
  }),

  mergeItem: jest.fn(async (key: string, value: string): Promise<void> => {
    const existing = mockStorage.get(key);
    if (existing) {
      const existingObj = JSON.parse(existing);
      const valueObj = JSON.parse(value);
      mockStorage.set(key, JSON.stringify({ ...existingObj, ...valueObj }));
    } else {
      mockStorage.set(key, value);
    }
  }),

  /**
   * Test utility: Reset the mock storage and all mock functions
   */
  __resetMock: () => {
    mockStorage = new Map();
    AsyncStorage.getItem.mockClear();
    AsyncStorage.setItem.mockClear();
    AsyncStorage.removeItem.mockClear();
    AsyncStorage.multiRemove.mockClear();
    AsyncStorage.multiGet.mockClear();
    AsyncStorage.multiSet.mockClear();
    AsyncStorage.getAllKeys.mockClear();
    AsyncStorage.clear.mockClear();
    AsyncStorage.mergeItem.mockClear();
  },

  /**
   * Test utility: Get direct access to the mock storage
   */
  __getMockStorage: () => mockStorage,

  /**
   * Test utility: Set the mock storage directly
   */
  __setMockStorage: (data: Record<string, string>) => {
    mockStorage = new Map(Object.entries(data));
  },
};

export default AsyncStorage;
