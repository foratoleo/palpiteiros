/**
 * Vitest Type Declarations
 *
 * Extends Vitest with jest-dom matchers for type safety.
 * This file tells TypeScript about the custom matchers added in setup.ts.
 */

import type { TestingLibraryMatchers } from '@testing-library/jest-dom/matchers'

declare module 'vitest' {
  interface Assertion<T = any> extends jest.Matchers<void, T>, TestingLibraryMatchers<T, void> {}
  interface AsymmetricMatchersContaining extends TestingLibraryMatchers<any, void> {}
}
