import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  resolve: {
    // Ensure node_modules are resolved from backend root
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
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

    // Allow longer timeout for mongodb-memory-server startup
    testTimeout: 30_000,

    // Coverage (run with --coverage flag)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.js'],
      exclude: ['src/config/**', 'server.js', 'src/scripts/**'],
    },
  },
});

