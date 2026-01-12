/**
 * Vitest Configuration
 *
 * Testing configuration for Palpiteiros v2 using Vitest as the test runner.
 * Optimized for React + Next.js with TypeScript support.
 *
 * @see https://vitest.dev/config/
 */

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  // Plugins
  plugins: [react()],

  // Test configuration
  test: {
    // Global test setup file
    setupFiles: ['./src/__tests__/setup.ts'],

    // Global test utilities (auto-imported in tests)
    globals: true,

    // Environment for React components
    environment: 'jsdom',

    // Environment options for jsdom
    environmentOptions: {
      jsdom: {
        url: 'http://localhost:3000'
      }
    },

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/.next/**',
        '**/coverage/**',
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx'
      ],
      // Coverage thresholds
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80
      },
      // Per-file thresholds
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80
    },

    // Test files matching patterns
    include: [
      'src/**/__tests__/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],

    // Exclude patterns
    exclude: [
      'node_modules/',
      'dist/',
      '.next/',
      '.idea/',
      '.git/',
      '.cache/'
    ],

    // Watch mode configuration
    watch: true,

    // Test timeout (milliseconds) - increased for slower CI environments
    testTimeout: 10000,
    hookTimeout: 10000,

    // Isolate tests (each test runs in isolation)
    isolate: true,

    // Threads configuration
    threads: true,
    maxThreads: 4,
    minThreads: 1,

    // Show coverage summary after running tests with coverage
    reporters: ['default', 'html', 'json'],

    // Output directory for coverage reports
    coverageDirectory: './coverage',

    // UI for debugging tests
    ui: true,

    // Benchmark configuration
    benchmark: {
      include: ['**/*.{bench,benchmark}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}']
    }
  },

  // Path aliases (matches tsconfig.json)
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/app': path.resolve(__dirname, './src/app')
    }
  }
})
