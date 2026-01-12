/**
 * Vitest Global Setup File
 *
 * Global test configuration and utilities for Vitest.
 * This file runs before all test suites.
 *
 * @see https://vitest.dev/config/#setupfiles
 */

import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

/**
 * Extend Vitest's expect with jest-dom matchers
 *
 * This adds custom DOM-related matchers like:
 * - toBeInTheDocument()
 * - toHaveTextContent()
 * - toBeVisible()
 * - toBeDisabled()
 * - etc.
 */
expect.extend(matchers)

/**
 * Cleanup after each test
 *
 * Automatically unmounts React components and cleans up
 * the DOM after each test to prevent test interference.
 */
afterEach(() => {
  cleanup()
})

/**
 * Mock Next.js navigation
 *
 * Mocks the Next.js router and navigation hooks to prevent
 * errors when testing components that use them.
 */
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    pathname: '/',
    query: {},
    asPath: '/'
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams()
}))

/**
 * Mock Next.js image optimization
 *
 * Mocks Next.js Image component to use regular img tags
 * in the test environment.
 */
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => {
    // In tests, use a regular img tag instead of Next.js optimized image
    const MockImg = document.createElement('img')
    MockImg.src = src
    MockImg.alt = alt
    Object.assign(MockImg, props)
    return MockImg
  }
}))

/**
 * Mock Supabase client
 *
 * Prevents actual Supabase connections during tests.
 */
vi.mock('@/services/supabase.service', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null
          }))
        })),
        data: [],
        error: null
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          data: null,
          error: null
        }))
      }))
    })),
    auth: {
      getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    }
  },
  getMarkets: vi.fn(async () => []),
  getMarketById: vi.fn(async () => null)
}))

/**
 * Mock Gamma API service
 *
 * Prevents actual API calls to Polymarket during tests.
 */
vi.mock('@/services/gamma.service', () => ({
  gammaService: {
    fetchMarkets: vi.fn(async () => []),
    getMarketBySlug: vi.fn(async () => null),
    fetchEvents: vi.fn(async () => [])
  }
}))

/**
 * Mock IntersectionObserver
 *
 * Many components use IntersectionObserver for lazy loading.
 * This mock prevents errors in the test environment.
 */
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

/**
 * Mock ResizeObserver
 *
 * Some components use ResizeObserver for responsive behavior.
 */
global.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

/**
 * Mock matchMedia
 *
 * Used for responsive design testing.
 */
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: query === '(prefers-color-scheme: dark)' || query.includes('min-width'),
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

/**
 * Mock localStorage
 *
 * Prevents actual localStorage operations during tests.
 */
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString()
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => Object.keys(store)[index] || null
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

/**
 * Mock requestAnimationFrame
 *
 * Required for Framer Motion animations in tests.
 */
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 0) as unknown as number
}

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id)
}

/**
 * Suppress console errors in tests (optional)
 *
 * Uncomment this to suppress expected console errors during tests.
 * Be careful as this may hide real issues.
 */
// const originalError = console.error
// console.error = (...args) => {
//   if (
//     typeof args[0] === 'string' &&
//     args[0].includes('Warning: ReactDOM.render')
//   ) {
//     return
//   }
//   originalError.call(console, ...args)
// }
