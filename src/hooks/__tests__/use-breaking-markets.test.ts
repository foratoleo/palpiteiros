/**
 * useBreakingMarkets Hook Tests
 *
 * Tests for the breaking markets hooks covering:
 * - useBreakingMarkets - Fetches list of breaking markets
 * - useBreakingMarket - Fetches single breaking market by ID
 * - useBreakingRealtime - Real-time subscriptions to price updates
 * - useBreakingMarketsSorted - Sorted breaking markets
 * - useBreakingMarketsTrending - Trending breaking markets
 * - useBreakingMarketsByCategory - Category-filtered breaking markets
 */

import React from 'react'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { renderHook, waitFor, act } from '@/__tests__/utils/test-utils'
import {
  useBreakingMarkets,
  useBreakingMarket,
  useBreakingRealtime,
  useBreakingMarketsSorted,
  useBreakingMarketsTrending,
  useBreakingMarketsByCategory
} from '@/hooks/use-breaking-markets'
import { breakingService } from '@/services/breaking.service'
import type { BreakingMarket, BreakingFilters } from '@/types/breaking.types'

// Mock the breaking service
vi.mock('@/services/breaking.service', () => ({
  breakingService: {
    getBreakingMarkets: vi.fn(),
    getBreakingMarketById: vi.fn(),
    subscribeToBreakingUpdates: vi.fn(),
    subscribeToMarket: vi.fn()
  }
}))

// Mock data factories
function createMockBreakingMarket(overrides: Partial<BreakingMarket> = {}): BreakingMarket {
  return {
    id: 'breaking-market-123',
    condition_id: '0x123456',
    slug: 'test-breaking-market',
    question: 'Will Bitcoin reach $100k by end of year?',
    description: 'A test breaking market',
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    start_date: new Date().toISOString(),
    active: true,
    closed: false,
    archived: false,
    image_url: null,
    outcomes: [],
    tags: [],
    volume: 1000000,
    liquidity: 500000,
    current_price: 0.75,
    category: 'crypto',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    // Breaking-specific fields
    rank: 1,
    movement_score: 0.85,
    price_change_24h: 0.15,
    volume_change_24h: 0.30,
    price_high_24h: 0.80,
    price_low_24h: 0.65,
    volatility_index: 0.45,
    trend: 'up',
    price_history_24h: [],
    ...overrides
  }
}

function createMockBreakingMarkets(count: number): BreakingMarket[] {
  return Array.from({ length: count }, (_, i) =>
    createMockBreakingMarket({
      id: `breaking-market-${i}`,
      rank: i + 1,
      movement_score: 0.9 - i * 0.05,
      question: `Breaking market ${i + 1}`
    })
  )
}

describe('useBreakingMarkets', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  afterEach(() => {
    queryClient.clear()
  })

  it('should fetch breaking markets successfully', async () => {
    const mockMarkets = createMockBreakingMarkets(20)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarkets({ limit: 20 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Initial loading state
    expect(result.current.isLoading).toBe(true)
    expect(result.current.markets).toEqual([])
    expect(result.current.error).toBeNull()

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check data is loaded
    expect(result.current.markets).toHaveLength(20)
    expect(result.current.error).toBeNull()
    expect(breakingService.getBreakingMarkets).toHaveBeenCalledWith({}, 20)
  })

  it('should handle loading states correctly', () => {
    vi.mocked(breakingService.getBreakingMarkets).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve([]), 100))
    )

    const { result } = renderHook(
      () => useBreakingMarkets({ limit: 10 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Should be in loading state immediately
    expect(result.current.isLoading).toBe(true)
    expect(result.current.isRefetching).toBe(false)
  })

  it('should handle error states correctly', async () => {
    const mockError = new Error('Failed to fetch breaking markets')
    vi.mocked(breakingService.getBreakingMarkets).mockRejectedValue(mockError)

    const { result } = renderHook(
      () => useBreakingMarkets({ limit: 20 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Wait for error
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.error?.message).toContain('Failed to fetch')
    expect(result.current.markets).toEqual([])
  })

  it('should refetch data when refetch is called', async () => {
    const mockMarkets = createMockBreakingMarkets(10)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarkets({ limit: 10 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(breakingService.getBreakingMarkets).toHaveBeenCalledTimes(1)

    // Trigger refetch
    await act(async () => {
      result.current.refetch()
    })

    // Should have been called again
    await waitFor(() => {
      expect(breakingService.getBreakingMarkets).toHaveBeenCalledTimes(2)
    })
  })

  it('should invalidate queries correctly', async () => {
    const mockMarkets = createMockBreakingMarkets(5)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarkets({ filters: { minPriceChange: 0.10 } }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Invalidate queries
    await act(async () => {
      await result.current.invalidate()
    })

    // Queries should be invalidated (this is tested by checking the cache was cleared)
    const cache = queryClient.getQueryCache()
    expect(cache.getAll()).toHaveLength(0)
  })

  it('should pass filters to breaking service', async () => {
    const mockMarkets = createMockBreakingMarkets(15)
    const filters: BreakingFilters = {
      minPriceChange: 0.10,
      maxPriceChange: 0.50,
      minVolume: 100000,
      categories: ['crypto', 'politics'],
      timeRange: '24h',
      minMovementScore: 0.5,
      trend: 'up'
    }
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    renderHook(
      () => useBreakingMarkets({ filters, limit: 15 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(breakingService.getBreakingMarkets).toHaveBeenCalledWith(filters, 15)
    })
  })

  it('should disable query when enabled is false', () => {
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue([])

    const { result } = renderHook(
      () => useBreakingMarkets({ enabled: false }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Query should not fetch when disabled
    expect(result.current.isLoading).toBe(false)
    expect(breakingService.getBreakingMarkets).not.toHaveBeenCalled()
  })

  it('should refetch on interval when refetchInterval is provided', async () => {
    vi.useFakeTimers()
    const mockMarkets = createMockBreakingMarkets(5)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    renderHook(
      () => useBreakingMarkets({ refetchInterval: 60000 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Initial fetch
    await waitFor(() => {
      expect(breakingService.getBreakingMarkets).toHaveBeenCalledTimes(1)
    })

    // Fast-forward time
    act(() => {
      vi.advanceTimersByTime(60000)
    })

    // Should have refetched
    await waitFor(() => {
      expect(breakingService.getBreakingMarkets).toHaveBeenCalledTimes(2)
    })

    vi.useRealTimers()
  })
})

describe('useBreakingMarket', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  it('should fetch single breaking market by ID', async () => {
    const mockMarket = createMockBreakingMarket({ id: 'market-123' })
    vi.mocked(breakingService.getBreakingMarketById).mockResolvedValue(mockMarket)

    const { result } = renderHook(
      () => useBreakingMarket({ marketId: 'market-123' }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Wait for data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.market).toEqual(mockMarket)
    expect(result.current.error).toBeNull()
    expect(breakingService.getBreakingMarketById).toHaveBeenCalledWith('market-123')
  })

  it('should return null when market not found', async () => {
    vi.mocked(breakingService.getBreakingMarketById).mockResolvedValue(null)

    const { result } = renderHook(
      () => useBreakingMarket({ marketId: 'nonexistent-market' }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.market).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should handle loading and error states', async () => {
    const mockError = new Error('Network error')
    vi.mocked(breakingService.getBreakingMarketById).mockRejectedValue(mockError)

    const { result } = renderHook(
      () => useBreakingMarket({ marketId: 'market-123' }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBeTruthy()
    expect(result.current.market).toBeNull()
  })

  it('should disable query when enabled is false', () => {
    vi.mocked(breakingService.getBreakingMarketById).mockResolvedValue(null)

    const { result } = renderHook(
      () => useBreakingMarket({ marketId: 'market-123', enabled: false }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    expect(result.current.isLoading).toBe(false)
    expect(breakingService.getBreakingMarketById).not.toHaveBeenCalled()
  })
})

describe('useBreakingRealtime', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  it('should set up real-time subscription on mount', () => {
    const unsubscribe = vi.fn()
    vi.mocked(breakingService.subscribeToBreakingUpdates).mockReturnValue(unsubscribe)

    const { result } = renderHook(
      () => useBreakingRealtime({ enabled: true }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Wait for connection to establish (500ms delay in hook)
    // We can't easily test this without timers, but we can check the subscription was created
    expect(breakingService.subscribeToBreakingUpdates).toHaveBeenCalled()
  })

  it('should clean up subscription on unmount', () => {
    const unsubscribe = vi.fn()
    vi.mocked(breakingService.subscribeToBreakingUpdates).mockReturnValue(unsubscribe)

    const { unmount } = renderHook(
      () => useBreakingRealtime({ enabled: true }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Unmount the hook
    unmount()

    // Unsubscribe should have been called
    expect(unsubscribe).toHaveBeenCalled()
  })

  it('should track connection status', () => {
    const unsubscribe = vi.fn()
    vi.mocked(breakingService.subscribeToBreakingUpdates).mockReturnValue(unsubscribe)

    const { result } = renderHook(
      () => useBreakingRealtime({ enabled: true }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Initially not connected (connects after 500ms delay)
    expect(result.current.isConnected).toBe(false)
  })

  it('should update markets when prices change', () => {
    const unsubscribe = vi.fn()
    let subscriptionCallback: ((market: BreakingMarket) => void) | null = null

    vi.mocked(breakingService.subscribeToBreakingUpdates).mockImplementation((callback) => {
      subscriptionCallback = callback
      return unsubscribe
    })

    const { result } = renderHook(
      () => useBreakingRealtime({ enabled: true }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    // Simulate a price update
    const updatedMarket = createMockBreakingMarket({ id: 'market-123', current_price: 0.80 })
    act(() => {
      subscriptionCallback?.(updatedMarket)
    })

    // Market should be in the markets array
    expect(result.current.markets).toContainEqual(updatedMarket)
  })

  it('should subscribe to specific market when marketId is provided', () => {
    const unsubscribe = vi.fn()
    vi.mocked(breakingService.subscribeToMarket).mockReturnValue(unsubscribe)

    renderHook(
      () => useBreakingRealtime({ marketId: 'market-123', enabled: true }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    expect(breakingService.subscribeToMarket).toHaveBeenCalledWith(
      'market-123',
      expect.any(Function)
    )
  })

  it('should call onPriceChange callback when prices change', () => {
    const unsubscribe = vi.fn()
    const onPriceChange = vi.fn()
    let subscriptionCallback: ((market: BreakingMarket) => void) | null = null

    vi.mocked(breakingService.subscribeToBreakingUpdates).mockImplementation((callback) => {
      subscriptionCallback = callback
      return unsubscribe
    })

    renderHook(
      () => useBreakingRealtime({ enabled: true, onPriceChange }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    const updatedMarket = createMockBreakingMarket({ id: 'market-123' })
    act(() => {
      subscriptionCallback?.(updatedMarket)
    })

    expect(onPriceChange).toHaveBeenCalledWith(updatedMarket)
  })

  it('should not subscribe when enabled is false', () => {
    renderHook(
      () => useBreakingRealtime({ enabled: false }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    expect(breakingService.subscribeToBreakingUpdates).not.toHaveBeenCalled()
  })
})

describe('useBreakingMarketsSorted', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  it('should sort markets by movement_score descending by default', async () => {
    const mockMarkets = createMockBreakingMarkets(5)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarketsSorted({}),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check that markets are sorted by movement_score (highest first)
    const markets = result.current.markets
    for (let i = 0; i < markets.length - 1; i++) {
      expect(markets[i].movement_score).toBeGreaterThanOrEqual(markets[i + 1].movement_score)
    }
  })

  it('should sort markets by specified field', async () => {
    const mockMarkets = createMockBreakingMarkets(5).map((m, i) => ({
      ...m,
      price_change_24h: 0.1 + i * 0.05
    }))
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarketsSorted({ sortBy: 'price_change_24h' }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check that markets are sorted by price_change_24h
    const markets = result.current.markets
    for (let i = 0; i < markets.length - 1; i++) {
      expect(markets[i].price_change_24h).toBeGreaterThanOrEqual(markets[i + 1].price_change_24h)
    }
  })

  it('should sort in ascending order when specified', async () => {
    const mockMarkets = createMockBreakingMarkets(5)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarketsSorted({ sortOrder: 'asc' }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Check that markets are sorted in ascending order
    const markets = result.current.markets
    for (let i = 0; i < markets.length - 1; i++) {
      expect(markets[i].movement_score).toBeLessThanOrEqual(markets[i + 1].movement_score)
    }
  })
})

describe('useBreakingMarketsTrending', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  it('should fetch trending breaking markets with high movement score', async () => {
    const mockMarkets = createMockBreakingMarkets(10)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarketsTrending({ limit: 10 }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should call with minMovementScore filter
    expect(breakingService.getBreakingMarkets).toHaveBeenCalledWith(
      { minMovementScore: 0.5 },
      10
    )
  })

  it('should use default limit of 20', async () => {
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue([])

    renderHook(
      () => useBreakingMarketsTrending(),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(breakingService.getBreakingMarkets).toHaveBeenCalled()
    })

    expect(breakingService.getBreakingMarkets).toHaveBeenCalledWith(
      { minMovementScore: 0.5 },
      20
    )
  })
})

describe('useBreakingMarketsByCategory', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false }
      }
    })
    vi.clearAllMocks()
  })

  it('should fetch breaking markets for specific category', async () => {
    const mockMarkets = createMockBreakingMarkets(5)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarketsByCategory({ category: 'crypto' }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should call with categories filter
    expect(breakingService.getBreakingMarkets).toHaveBeenCalledWith(
      { categories: ['crypto'] },
      20
    )
  })

  it('should combine additional filters with category', async () => {
    const mockMarkets = createMockBreakingMarkets(5)
    vi.mocked(breakingService.getBreakingMarkets).mockResolvedValue(mockMarkets)

    const { result } = renderHook(
      () => useBreakingMarketsByCategory({
        category: 'politics',
        filters: { minPriceChange: 0.10, trend: 'up' }
      }),
      { wrapper: ({ children }) => React.createElement(QueryClientProvider, { client: queryClient }, children) }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Should call with combined filters
    expect(breakingService.getBreakingMarkets).toHaveBeenCalledWith(
      { categories: ['politics'], minPriceChange: 0.10, trend: 'up' },
      20
    )
  })
})
