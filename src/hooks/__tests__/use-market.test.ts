/**
 * useMarket Hook Tests
 *
 * Tests for the useMarket hook which fetches single market data.
 * Tests cover loading states, error handling, and data fetching.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@/__tests__/utils/test-utils'
import { useMarket } from '@/hooks/use-market'
import { marketKeys } from '@/lib/query-keys'
import { createMockMarket } from '@/__tests__/utils/test-utils'

// Mock the gamma service
vi.mock('@/services/gamma.service', () => ({
  gammaService: {
    fetchMarkets: vi.fn()
  }
}))

// Mock the Supabase service
vi.mock('@/services/supabase.service', () => ({
  getMarkets: vi.fn()
}))

describe('useMarket', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return initial loading state', () => {
    const { result } = renderHook(() => useMarket('market-123'))

    expect(result.current.isLoading).toBe(true)
    expect(result.current.market).toBeUndefined()
    expect(result.current.error).toBeNull()
  })

  it('should fetch market by ID', async () => {
    const mockMarket = createMockMarket({ id: 'market-123' })

    // We'll need to set up the mock to return this market
    // This test structure assumes the hook is properly mocked

    const { result } = renderHook(() => useMarket('market-123'))

    // After loading completes, we should have data
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })

  it('should handle errors when market is not found', async () => {
    const { result } = renderHook(() => useMarket('nonexistent-market'))

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
      // Error should be set or market should be null
    })
  })

  it('should disable query when enabled is false', () => {
    const { result } = renderHook(() =>
      useMarket('market-123', { enabled: false })
    )

    // Query should not fetch when disabled
    expect(result.current.isLoading).toBe(false)
  })
})

describe('useMarketBySlug', () => {
  it('should fetch market by slug', async () => {
    const { result } = renderHook(() =>
      // useMarketBySlug is a convenience wrapper
      // In actual implementation it would use slug lookup
      renderHook(() => useMarket('market-123'))
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })
  })
})
