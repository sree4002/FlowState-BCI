/** @type {import('jest').Config} */
module.exports = {
  // Root directory for Detox E2E tests
  rootDir: '..',

  // Test environment for Detox
  testEnvironment: 'node',

  // Test file pattern for E2E tests
  testMatch: ['<rootDir>/e2e/**/*.e2e.ts'],

  // Test timeout - E2E tests need longer timeout (5 minutes)
  testTimeout: 300000,

  // TypeScript transformation
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.json',
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  // Setup files to run before tests
  setupFilesAfterEnv: ['<rootDir>/e2e/init.ts'],

  // Reporters for test output
  // Note: Add 'jest-junit' reporter when installed for CI/CD integration
  // reporters: [
  //   'default',
  //   [
  //     'jest-junit',
  //     {
  //       outputDirectory: './e2e/reports',
  //       outputName: 'e2e-results.xml',
  //     },
  //   ],
  // ],
  reporters: ['default'],

  // Verbose output for debugging
  verbose: true,

  // Max workers - run E2E tests serially to avoid device conflicts
  maxWorkers: 1,

  // Global setup/teardown for Detox (when native builds are available)
  // globalSetup: 'detox/runners/jest/globalSetup',
  // globalTeardown: 'detox/runners/jest/globalTeardown',
};
