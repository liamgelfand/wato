const path = require('path')
const nextJest = require('next/jest')

const projectRoot = path.join(__dirname, '..')

const createJestConfig = nextJest({
  dir: projectRoot,
})

const customJestConfig = {
  rootDir: projectRoot,
  setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'app/**/*.{js,jsx,ts,tsx}',
    'components/**/*.{js,jsx,ts,tsx}',
    'lib/**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/coverage/**',
    '!**/dist/**',
  ],
  testMatch: ['<rootDir>/tests/**/*.test.{ts,tsx}'],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/.next/',
    '/tests/e2e/',
  ],
  modulePathIgnorePatterns: ['<rootDir>/.next/'],
}

module.exports = createJestConfig(customJestConfig)
