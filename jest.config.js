module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
  testMatch: [
    '**/tests/unit/**/*.test.ts',
    '**/tests/integration/**/*.test.ts',
  ],
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/tests/mocks/react-native.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          esModuleInterop: true,
          allowJs: true,
          types: ['jest', 'node'],
        },
      },
    ],
  },
};
