import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Use Node.js environment (not jsdom)
    environment: 'node',

    // Test file patterns
    include: ['src/**/*.test.js', 'tests/**/*.test.js'],

    // Setup files run before each test file
    setupFiles: ['./tests/setup.js'],

    // Enable globals (describe, it, expect etc.) without importing
    globals: true,

    // Reporter
    reporter: 'verbose',

    // Coverage (run with --coverage flag)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/config/**', 'server.js'],
    },
  },
});
