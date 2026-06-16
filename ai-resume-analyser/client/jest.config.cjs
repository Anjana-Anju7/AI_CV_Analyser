/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        module: 'commonjs',
        moduleResolution: 'node',
        esModuleInterop: true,
      },
      useESM: false,
    }],
  },
  moduleNameMapper: {
    '\\.(css|less|scss)$': '<rootDir>/src/__tests__/__mocks__/fileMock.cjs',
    '^lucide-react$': '<rootDir>/src/__tests__/__mocks__/lucide-react.cjs',
  },
  transformIgnorePatterns: ['node_modules/'],
  testMatch: ['**/src/__tests__/**/*.test.tsx', '**/src/__tests__/**/*.test.ts'],
};
