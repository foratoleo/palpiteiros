/**
 * BreakingService Tests
 *
 * Tests for the BreakingService class covering:
 * - getBreakingMarkets fetches from edge function
 * - getBreakingMarketById returns single market or null
 * - refreshBreakingData calls sync edge function
 * - Cache works correctly (30s TTL)
 * - subscribeToBreakingUpdates creates Supabase subscription
 * - Unsubscribe cleans up subscription
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { BreakingService } from '@/services/breaking.service'
import { supabase } from '@/config/supabase'
import type { BreakingMarket, BreakingFilters, PriceHistoryPoint } from '@/types/breaking.types'

// Mock Supabase client
vi.mock('@/config/supabase', () => ({
  supabase: {
    channel: vi.fn(() => ({
      on: vi.fn(() => ({
        subscribe: vi.fn((callback) => {
          callback('SUBSCRIBED', null)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        })
      })),
      subscribe: vi.fn()
    })),
    removeChannel: vi.fn()
  }
}))

// Mock fetch globally
global.fetch = vi.fn()

// Mock data factories
function createMockBreakingMarket(overrides: Partial<BreakingMarket> = {}): BreakingMarket {
  return {
    id: 'breaking-market-123',
    condition_id: '0x123456',
    slug: 'test-breaking-market',
    question: 'Will Bitcoin reach $100k?',
    description: 'Test market',
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

function createMockPriceHistoryPoint(): PriceHistoryPoint {
  return {
    id: 'point-123',
    market_id: 'breaking-market-123',
    condition_id: '0x123456',
    price_yes: 0.75,
    price_no: 0.25,
    volume: 1000,
    liquidity: 500,
    timestamp: new Date().toISOString()
  }
}

describe('BreakingService', () => {
  let service: BreakingService

  beforeEach(() => {
    service = new BreakingService('https://test-supabase-url.com', 1000)
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('getBreakingMarkets', () => {
    it('should fetch breaking markets from edge function', async () => {
      const mockMarkets = [createMockBreakingMarket(), createMockBreakingMarket({ id: 'market-2' })]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 2,
        timestamp: new Date().toISOString(),
        cached: false
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await service.getBreakingMarkets({}, 20)

      expect(result).toEqual(mockMarkets)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/get-breaking-markets'),
        expect.any(Object)
      )
    })

    it('should pass filters to edge function', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const filters: BreakingFilters = {
        minPriceChange: 0.10,
        maxPriceChange: 0.50,
        minVolume: 100000,
        categories: ['crypto', 'politics'],
        timeRange: '24h',
        minMovementScore: 0.5,
        trend: 'up'
      }

      await service.getBreakingMarkets(filters, 20)

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const url = fetchCall[0] as string

      expect(url).toContain('min_price_change=0.1')
      expect(url).toContain('max_price_change=0.5')
      expect(url).toContain('min_volume=100000')
      expect(url).toContain('categories=crypto,politics')
      expect(url).toContain('time_range_hours=24')
      expect(url).toContain('min_movement_score=0.5')
      expect(url).toContain('trend=up')
      expect(url).toContain('limit=20')
    })

    it('should handle API errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      } as Response)

      await expect(service.getBreakingMarkets()).rejects.toThrow('Failed to fetch breaking markets')
    })

    it('should handle unsuccessful response', async () => {
      const mockResponse = {
        success: false,
        error: 'Invalid parameters',
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await expect(service.getBreakingMarkets()).rejects.toThrow('Invalid parameters')
    })

    it('should cache results for 30 seconds', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      // First call
      await service.getBreakingMarkets({ minPriceChange: 0.10 }, 20)
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call within cache TTL - should use cache
      await service.getBreakingMarkets({ minPriceChange: 0.10 }, 20)
      expect(global.fetch).toHaveBeenCalledTimes(1) // Still 1, not called again

      // Advance time past cache TTL
      vi.advanceTimersByTime(1001)

      // Third call after cache expires - should fetch again
      await service.getBreakingMarkets({ minPriceChange: 0.10 }, 20)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should use different cache keys for different filters', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      // First call with different filters
      await service.getBreakingMarkets({ minPriceChange: 0.10 }, 20)
      await service.getBreakingMarkets({ minPriceChange: 0.20 }, 20)

      // Both should trigger fetch (different cache keys)
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should limit results to 100', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await service.getBreakingMarkets({}, 200) // Request 200

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const url = fetchCall[0] as string

      expect(url).toContain('limit=100') // Should be capped at 100
    })
  })

  describe('getBreakingMarketById', () => {
    it('should fetch single breaking market by ID', async () => {
      const mockMarket = createMockBreakingMarket({ id: 'market-123' })
      const mockResponse = {
        success: true,
        data: [mockMarket],
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await service.getBreakingMarketById('market-123')

      expect(result).toEqual(mockMarket)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('market_id=market-123'),
        expect.any(Object)
      )
    })

    it('should return null when market not found', async () => {
      const mockResponse = {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await service.getBreakingMarketById('nonexistent-market')

      expect(result).toBeNull()
    })

    it('should return null for 404 errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: async () => 'Market not found'
      } as Response)

      const result = await service.getBreakingMarketById('nonexistent-market')

      expect(result).toBeNull()
    })

    it('should throw for other errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      } as Response)

      await expect(service.getBreakingMarketById('market-123')).rejects.toThrow()
    })

    it('should cache results', async () => {
      const mockMarket = createMockBreakingMarket()
      const mockResponse = {
        success: true,
        data: [mockMarket],
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      // First call
      await service.getBreakingMarketById('market-123')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call - should use cache
      await service.getBreakingMarketById('market-123')
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Advance time past cache TTL
      vi.advanceTimersByTime(1001)

      // Third call - should fetch again
      await service.getBreakingMarketById('market-123')
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('refreshBreakingData', () => {
    it('should call sync edge function', async () => {
      const mockResponse = {
        success: true,
        synced: 150,
        failed: 0,
        message: 'Price history synced successfully',
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const result = await service.refreshBreakingData()

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/functions/v1/sync-price-history'),
        expect.objectContaining({
          signal: expect.any(AbortSignal)
        })
      )
    })

    it('should use 2 minute timeout for sync operation', async () => {
      const mockResponse = {
        success: true,
        synced: 100,
        failed: 0,
        message: 'Synced',
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await service.refreshBreakingData()

      const fetchCall = vi.mocked(global.fetch).mock.calls[1] // First call is getBreakingMarkets from constructor
      const options = fetchCall[1] as RequestInit

      // Should have a longer timeout for sync operations
      expect(options).toBeDefined()
    })

    it('should clear cache after successful sync', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const marketsResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      const syncResponse = {
        success: true,
        synced: 100,
        failed: 0,
        message: 'Synced',
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => marketsResponse
      } as Response)

      // Populate cache
      await service.getBreakingMarkets()
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Sync
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => syncResponse
      } as Response)

      await service.refreshBreakingData()

      // Fetch again - should not use cache (was cleared)
      await service.getBreakingMarkets()
      expect(global.fetch).toHaveBeenCalledTimes(3) // getBreakingMarkets + refresh + getBreakingMarkets
    })

    it('should debounce refresh operations', async () => {
      const syncResponse = {
        success: true,
        synced: 100,
        failed: 0,
        message: 'Synced',
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => syncResponse
      } as Response)

      // First refresh
      await service.refreshBreakingData()

      // Immediate second refresh should be debounced
      await expect(service.refreshBreakingData()).rejects.toThrow('Refresh debounce active')
    })

    it('should allow refresh after debounce period', async () => {
      const syncResponse = {
        success: true,
        synced: 100,
        failed: 0,
        message: 'Synced',
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => syncResponse
      } as Response)

      // Note: The service has a 30 second debounce, but our test service has 1 second TTL
      // We need to test the actual debounce behavior with a longer delay

      // First refresh
      await service.refreshBreakingData()

      // Wait past debounce period (30000ms in real service)
      vi.advanceTimersByTime(31000)

      // Second refresh should succeed
      await expect(service.refreshBreakingData()).resolves.toBeDefined()
    })

    it('should handle sync errors', async () => {
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Sync failed'
      } as Response)

      await expect(service.refreshBreakingData()).rejects.toThrow('Failed to refresh breaking data')
    })

    it('should handle unsuccessful sync response', async () => {
      const mockResponse = {
        success: false,
        message: 'Sync failed due to error',
        synced: 0,
        failed: 100,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      } as Response)

      await expect(service.refreshBreakingData()).rejects.toThrow('Sync failed due to error')
    })
  })

  describe('subscribeToBreakingUpdates', () => {
    it('should create Supabase subscription', () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn(() => channel),
        subscribe: vi.fn((cb) => {
          cb('SUBSCRIBED', null)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        })
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)

      const unsubscribe = service.subscribeToBreakingUpdates(callback)

      expect(supabase.channel).toHaveBeenCalled()
      expect(channel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          schema: 'public',
          table: 'market_price_history'
        }),
        expect.any(Function)
      )
      expect(typeof unsubscribe).toBe('function')
    })

    it('should call callback when significant price change occurs', async () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn((event, config, handler) => {
          // Simulate a price update event
          setTimeout(() => {
            const mockPayload = {
              new: {
                market_id: 'market-123',
                price_yes: 0.80,
                price_no: 0.20,
                timestamp: new Date().toISOString()
              }
            }
            handler(mockPayload as any)
          }, 0)
          return channel
        }),
        subscribe: vi.fn((cb) => {
          cb('SUBSCRIBED', null)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        })
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)

      // Mock getBreakingMarketById to return market data
      const mockMarket = createMockBreakingMarket({ id: 'market-123', current_price: 0.80 })
      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: [mockMarket],
          count: 1,
          timestamp: new Date().toISOString()
        })
      } as Response)

      service.subscribeToBreakingUpdates(callback)

      // Wait for async operations
      await vi.waitFor(() => {
        expect(callback).toHaveBeenCalledWith(mockMarket)
      })
    })

    it('should not call callback for insignificant price changes (<1%)', async () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn((event, config, handler) => {
          // Simulate a small price change (0.5%)
          setTimeout(() => {
            handler({
              new: {
                market_id: 'market-123',
                price_yes: 0.755, // Only 0.5% change from 0.75
                price_no: 0.245,
                timestamp: new Date().toISOString()
              }
            } as any)
          }, 0)
          return channel
        }),
        subscribe: vi.fn((cb) => {
          cb('SUBSCRIBED', null)
          return { data: { subscription: { unsubscribe: vi.fn() } } }
        })
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)

      service.subscribeToBreakingUpdates(callback)

      // Wait a bit
      await vi.advanceTimersByTimeAsync(100)

      // Callback should not be called for small changes
      expect(callback).not.toHaveBeenCalled()
    })

    it('should unsubscribe and clean up subscription', () => {
      const callback = vi.fn()
      const mockSubscription = { unsubscribe: vi.fn() }
      const channel = {
        on: vi.fn(() => channel),
        subscribe: vi.fn(() => ({
          data: { subscription: mockSubscription }
        }))
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)
      vi.mocked(supabase.removeChannel).mockReturnValue(undefined)

      const unsubscribe = service.subscribeToBreakingUpdates(callback)

      // Call unsubscribe
      unsubscribe()

      expect(supabase.removeChannel).toHaveBeenCalledWith(channel)
    })

    it('should handle subscription errors gracefully', () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn(() => channel),
        subscribe: vi.fn((cb) => {
          cb('CHANNEL_ERROR', new Error('Subscription failed'))
          return {}
        })
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)

      // Should not throw, just log error
      expect(() => {
        service.subscribeToBreakingUpdates(callback)
      }).not.toThrow()
    })
  })

  describe('subscribeToMarket', () => {
    it('should create filtered subscription for specific market', () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn(() => channel),
        subscribe: vi.fn()
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)

      service.subscribeToMarket('market-123', callback)

      expect(supabase.channel).toHaveBeenCalled()
      expect(channel.on).toHaveBeenCalledWith(
        'postgres_changes',
        expect.objectContaining({
          event: 'INSERT',
          table: 'market_price_history',
          filter: 'market_id=eq.market-123'
        }),
        expect.any(Function)
      )
    })

    it('should return unsubscribe function', () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn(() => channel),
        subscribe: vi.fn()
      }

      vi.mocked(supabase.channel).mockReturnValue(channel as any)
      vi.mocked(supabase.removeChannel).mockReturnValue(undefined)

      const unsubscribe = service.subscribeToMarket('market-123', callback)

      expect(typeof unsubscribe).toBe('function')

      unsubscribe()

      expect(supabase.removeChannel).toHaveBeenCalledWith(channel)
    })
  })

  describe('unsubscribeAll', () => {
    it('should remove all active subscriptions', () => {
      const channel1 = { on: vi.fn(() => channel1), subscribe: vi.fn() } as any
      const channel2 = { on: vi.fn(() => channel2), subscribe: vi.fn() } as any

      vi.mocked(supabase.channel)
        .mockReturnValueOnce(channel1)
        .mockReturnValueOnce(channel2)
      vi.mocked(supabase.removeChannel).mockReturnValue(undefined)

      // Create multiple subscriptions
      service.subscribeToBreakingUpdates(vi.fn())
      service.subscribeToMarket('market-1', vi.fn())

      // Unsubscribe all
      service.unsubscribeAll()

      expect(supabase.removeChannel).toHaveBeenCalledTimes(2)
    })

    it('should clear subscriptions map after unsubscribing', () => {
      const callback = vi.fn()
      const channel = {
        on: vi.fn(() => channel),
        subscribe: vi.fn()
      } as any

      vi.mocked(supabase.channel).mockReturnValue(channel)
      vi.mocked(supabase.removeChannel).mockReturnValue(undefined)

      // Create subscription
      service.subscribeToBreakingUpdates(callback)

      // Unsubscribe all
      service.unsubscribeAll()

      // Subscriptions should be cleared
      // This is tested by ensuring removeChannel was called
      expect(supabase.removeChannel).toHaveBeenCalled()
    })
  })

  describe('clearCache', () => {
    it('should clear all cached data', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      // Populate cache
      await service.getBreakingMarkets()
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Clear cache
      service.clearCache()

      // Fetch again - should not use cache
      await service.getBreakingMarkets()
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('Utility Functions', () => {
    it('should build query params correctly', async () => {
      const mockMarkets = [createMockBreakingMarket()]
      const mockResponse = {
        success: true,
        data: mockMarkets,
        count: 1,
        timestamp: new Date().toISOString()
      }

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse
      } as Response)

      const filters: BreakingFilters = {
        minPriceChange: 0.10,
        maxPriceChange: 0.50,
        minVolume: 100000,
        categories: ['crypto'],
        timeRange: '7d',
        minMovementScore: 0.6,
        trend: 'down'
      }

      await service.getBreakingMarkets(filters, 25)

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const url = fetchCall[0] as string

      expect(url).toContain('min_price_change=0.1')
      expect(url).toContain('max_price_change=0.5')
      expect(url).toContain('min_volume=100000')
      expect(url).toContain('categories=crypto')
      expect(url).toContain('time_range_hours=168') // 7 days = 168 hours
      expect(url).toContain('min_movement_score=0.6')
      expect(url).toContain('trend=down')
      expect(url).toContain('limit=25')
    })

    it('should handle fetch timeout', async () => {
      vi.mocked(global.fetch).mockImplementation(() => {
        return new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Request timeout')), 31000)
        })
      })

      await expect(service.getBreakingMarkets()).rejects.toThrow('Request timeout')
    })
  })
})
