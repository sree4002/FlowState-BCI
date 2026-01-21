module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  roots: ['<rootDir>/__tests__', '<rootDir>/App/__tests__'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react',
        },
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(expo-sqlite|react-native|@react-native|@react-navigation|@testing-library/jest-native)/)',
  ],
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    'App/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!**/*.test.{ts,tsx}',
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/App/__tests__/', // Temporarily ignore React Native component tests
    'NextSessionWidget.test.tsx', // Temporarily ignore RN component test (requires full RN env)
  ],
  moduleNameMapper: {
    '^expo-sqlite$': '<rootDir>/__mocks__/expo-sqlite.ts',
    '^react-native$': '<rootDir>/__mocks__/react-native.ts',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.ts',
    '^@react-navigation/native$': '<rootDir>/__mocks__/@react-navigation/native.ts',
    '^@react-native-community/slider$': '<rootDir>/__mocks__/@react-native-community/slider.ts',
    '^victory-native$': '<rootDir>/__mocks__/victory-native.ts',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testTimeout: 10000,
  maxWorkers: 1,
};
