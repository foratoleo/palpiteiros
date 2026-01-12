/**
 * Test Utilities
 *
 * Custom render function and test utilities for Vitest + React Testing Library.
 * Includes provider wrappers for testing components that use them.
 *
 * @see https://testing-library.com/docs/react-testing-library/setup
 */

import * as React from 'react'
import { render, renderHook, type RenderOptions, type RenderHookOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import type { ThemeConfig } from '@/types/ui.types'

// ============================================================================
// MOCK PROVIDERS
// ============================================================================

/**
 * Mock Supabase Provider for testing
 */
function MockSupabaseProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

/**
 * Test Providers Wrapper
 *
 * Wraps components with all required providers for testing.
 * Includes QueryClient, ThemeProvider, and mocked SupabaseProvider.
 */
interface TestProvidersProps {
  children: React.ReactNode
  queryClient?: QueryClient
  theme?: ThemeConfig
}

export function TestProviders({
  children,
  queryClient,
  theme
}: TestProvidersProps) {
  // Create a test-specific QueryClient with disabled retries
  const testQueryClient =
    queryClient ||
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0
        },
        mutations: {
          retry: false
        }
      }
    })

  return (
    <QueryClientProvider client={testQueryClient}>
      <ThemeProvider
        themeConfig={theme || { theme: 'dark', particleEffects: false, reducedMotion: false, compactMode: false, highContrast: false }}
      >
        <MockSupabaseProvider>{children}</MockSupabaseProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

// ============================================================================
// CUSTOM RENDER
// ============================================================================

/**
 * Custom render options
 *
 * Extends React Testing Library's RenderOptions with our test providers.
 */
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  queryClient?: QueryClient
  theme?: ThemeConfig
}

/**
 * Custom render function
 *
 * Renders a component with all necessary providers wrapped.
 * Use this instead of the default @testing-library/react render.
 *
 * @param ui - Component to render
 * @param options - Render options
 * @returns Render result
 *
 * @example
 * ```tsx
 * import { renderWithProviders, screen } from '@/__tests__/utils/test-utils'
 * import { Button } from '@/components/ui/button'
 *
 * test('renders button', () => {
 *   renderWithProviders(<Button>Click me</Button>)
 *   expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
 * })
 * ```
 */
function customRender(ui: React.ReactElement, options?: CustomRenderOptions) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders queryClient={options?.queryClient} theme={options?.theme}>
      {children}
    </TestProviders>
  )

  return render(ui, { wrapper: Wrapper, ...options })
}

/**
 * Custom renderHook function
 *
 * Renders a hook with all necessary providers wrapped.
 * Use this for testing custom hooks.
 *
 * @param hook - Hook to render
 * @param options - Render options
 * @returns Render hook result
 *
 * @example
 * ```tsx
 * import { renderHookWithProviders } from '@/__tests__/utils/test-utils'
 * import { useMarket } from '@/hooks/use-market'
 *
 * test('fetches market data', async () => {
 *   const { result } = renderHookWithProviders(() => useMarket('market-123'))
 *   expect(result.current.isLoading).toBe(true)
 * })
 * ```
 */
function customRenderHook<TProps, TResult>(
  hook: (initialProps: TProps) => TResult,
  options?: RenderHookOptions<TProps> & CustomRenderOptions
) {
  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <TestProviders queryClient={options?.queryClient} theme={options?.theme}>
      {children}
    </TestProviders>
  )

  return renderHook(hook, { wrapper: Wrapper, ...options })
}

// ============================================================================
// MOCK DATA FACTORIES
// ============================================================================

/**
 * Create a mock market for testing
 */
export function createMockMarket(overrides = {}) {
  return {
    id: 'market-123',
    condition_id: '0x123456',
    slug: 'test-market',
    question: 'Will this test pass?',
    description: 'A test market for unit testing',
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    start_date: new Date().toISOString(),
    active: true,
    closed: false,
    archived: false,
    image_url: null,
    outcomes: [
      { id: 'yes-123', market_id: 'market-123', name: 'Yes', price: 0.65, ticker: 'YES' },
      { id: 'no-123', market_id: 'market-123', name: 'No', price: 0.35, ticker: 'NO' }
    ],
    tags: [
      { id: '1', label: 'Testing', slug: 'testing', name: 'Testing' },
      { id: '2', label: 'Quality', slug: 'quality', name: 'Quality' }
    ],
    volume: 100000,
    liquidity: 50000,
    current_price: 0.65,
    price_change_24h: 0.05,
    category: 'crypto',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    isFavorite: false,
    ...overrides
  }
}

/**
 * Create multiple mock markets
 */
export function createMockMarkets(count: number, overrides = {}) {
  return Array.from({ length: count }, (_, i) =>
    createMockMarket({
      id: `market-${i}`,
      condition_id: `0x${i}`,
      slug: `test-market-${i}`,
      question: `Will test ${i} pass?`,
      ...overrides
    })
  )
}

/**
 * Create a mock portfolio position
 */
export function createMockPosition(overrides = {}) {
  return {
    id: 'position-123',
    market_id: 'market-123',
    market: createMockMarket({ id: 'market-123' }),
    outcome: 'Yes',
    size: 100,
    avg_price: 0.50,
    current_price: 0.65,
    pnl: 15,
    pnl_percentage: 30,
    entry_date: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Create a mock price alert
 */
export function createMockAlert(overrides = {}) {
  return {
    id: 'alert-123',
    market_id: 'market-123',
    market: createMockMarket({ id: 'market-123' }),
    condition: 'above',
    target_price: 0.70,
    triggered: false,
    active: true,
    created_at: new Date().toISOString(),
    ...overrides
  }
}

// ============================================================================
// RE-EXPORT EVERYTHING
// ============================================================================

// Re-export all testing library utilities
export * from '@testing-library/react'
export { customRender as render, customRenderHook as renderHook }
export { TestProviders as TestProvidersUtils }

// Re-export user event for user interactions
export { userEvent } from '@testing-library/user-event'

// Default export for convenience
export default {
  render: customRender,
  renderHook: customRenderHook,
  TestProviders,
  createMockMarket,
  createMockMarkets,
  createMockPosition,
  createMockAlert
}
