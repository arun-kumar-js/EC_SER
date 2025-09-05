module.exports = {
  preset: 'react-native',
  // Improve stability and prevent child process exceptions
  maxWorkers: 2, // Limit concurrent workers to reduce memory usage
  testTimeout: 10000, // Increase timeout for slower tests
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // Add setup files if needed
  // Handle memory issues
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-safe-area-context)/)',
  ],
  // Clear mocks between tests
  clearMocks: true,
  // Collect coverage if needed
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
};
