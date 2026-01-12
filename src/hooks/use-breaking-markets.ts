/**
 * Breaking Markets Hooks
 *
 * Custom React Query hooks for fetching and managing breaking markets data.
 * Breaking markets are those with significant price movements, volume changes,
 * or volatility within a specified time range.
 *
 * @feature TanStack Query v5 integration
 * @feature Real-time Supabase subscriptions
 * @feature Automatic refetch on price changes
 * @feature Optimistic cache updates
 */

import { useEffect, useState, useCallback as ReactUseCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { breakingService } from '@/services/breaking.service'
import { breakingKeys } from '@/lib/query-keys'
import { STALE_TIMES, CACHE_TIMES } from '@/lib/query-client'
import type {
  BreakingMarket,
  BreakingFilters
} from '@/types/breaking.types'

// ============================================================================
// USE BREAKING MARKETS (List)
// ============================================================================

/**
 * Use Breaking Markets Hook Parameters
 */
export interface UseBreakingMarketsParams {
  /** Filter options for breaking markets */
  filters?: BreakingFilters
  /** Maximum number of results (default: 20, max: 100) */
  limit?: number
  /** Whether to enable the query */
  enabled?: boolean
  /** Refetch interval in milliseconds (for live updates) */
  refetchInterval?: number
}

/**
 * Use Breaking Markets Hook Return Type
 */
export interface UseBreakingMarketsReturn {
  /** Array of breaking markets */
  markets: BreakingMarket[]
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Whether data is currently refetching */
  isRefetching: boolean
  /** Manual refetch function */
  refetch: () => void
  /** Invalidate and refetch */
  invalidate: () => Promise<void>
}

/**
 * Use Breaking Markets Hook
 *
 * Fetches a list of breaking markets with optional filtering.
 * Uses BreakingService to fetch markets with significant price movements.
 *
 * @param params - Hook parameters
 * @returns Breaking markets data and query state
 *
 * @example
 * ```tsx
 * function BreakingMarketsList() {
 *   const { markets, isLoading, error } = useBreakingMarkets({
 *     filters: { minPriceChange: 0.10, timeRange: '24h' },
 *     limit: 20,
 *     refetchInterval: 60000 // Refresh every minute
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {markets.map(market => (
 *         <BreakingMarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingMarkets(
  params: UseBreakingMarketsParams = {}
): UseBreakingMarketsReturn {
  const { filters, limit = 20, enabled = true, refetchInterval } = params
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: breakingKeys.lists(filters),
    queryFn: async () => {
      return await breakingService.getBreakingMarkets(filters, limit)
    },
    staleTime: STALE_TIMES.PRICES, // Prices go stale quickly (1 minute)
    gcTime: CACHE_TIMES.PRICES,
    enabled,
    refetchInterval
  })

  return {
    markets: query.data || [],
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: breakingKeys.lists(filters)
      })
    }
  }
}

// ============================================================================
// USE BREAKING MARKET (Single)
// ============================================================================

/**
 * Use Breaking Market Hook Parameters
 */
export interface UseBreakingMarketParams {
  /** Market ID to fetch */
  marketId: string
  /** Whether to enable the query */
  enabled?: boolean
}

/**
 * Use Breaking Market Hook Return Type
 */
export interface UseBreakingMarketReturn {
  /** Breaking market data */
  market: BreakingMarket | null
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Whether data is currently refetching */
  isRefetching: boolean
  /** Manual refetch function */
  refetch: () => void
  /** Invalidate and refetch */
  invalidate: () => Promise<void>
}

/**
 * Use Breaking Market Hook
 *
 * Fetches a single breaking market by ID with computed metrics.
 * Returns null if market not found (instead of throwing).
 *
 * @param params - Hook parameters
 * @returns Breaking market data and query state
 *
 * @example
 * ```tsx
 * function BreakingMarketDetail({ marketId }: { marketId: string }) {
 *   const { market, isLoading, error } = useBreakingMarket({
 *     marketId,
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   if (!market) return <MarketNotFound />
 *
 *   return (
 *     <div>
 *       <h1>{market.question}</h1>
 *       <p>Movement Score: {market.movement_score}</p>
 *       <p>Price Change 24h: {(market.price_change_24h * 100).toFixed(2)}%</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingMarket(
  params: UseBreakingMarketParams
): UseBreakingMarketReturn {
  const { marketId, enabled = true } = params
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: breakingKeys.detail(marketId),
    queryFn: async () => {
      const market = await breakingService.getBreakingMarketById(marketId)
      return market
    },
    staleTime: STALE_TIMES.PRICES,
    gcTime: CACHE_TIMES.PRICES,
    enabled
  })

  return {
    market: query.data || null,
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: breakingKeys.detail(marketId)
      })
    }
  }
}

// ============================================================================
// USE BREAKING REALTIME (Subscription)
// ============================================================================

/**
 * Use Breaking Realtime Hook Parameters
 */
export interface UseBreakingRealtimeParams {
  /** Optional specific market ID to subscribe to */
  marketId?: string
  /** Whether to enable the subscription */
  enabled?: boolean
  /** Callback when price changes >1% */
  onPriceChange?: (market: BreakingMarket) => void
}

/**
 * Use Breaking Realtime Hook Return Type
 */
export interface UseBreakingRealtimeReturn {
  /** Whether real-time subscription is connected */
  isConnected: boolean
  /** Error state */
  error: Error | null
  /** Updated markets array from real-time updates */
  markets: BreakingMarket[]
  /** Function to manually invalidate queries after update */
  invalidateQueries: () => void
}

/**
 * Use Breaking Realtime Hook
 *
 * Subscribes to real-time breaking market price updates.
 * Uses BreakingService's subscribeToBreakingUpdates or subscribeToMarket.
 *
 * @param params - Hook parameters
 * @returns Real-time subscription state and updated markets
 *
 * @example
 * ```tsx
 * function BreakingMarketsLive() {
 *   const { isConnected, markets } = useBreakingRealtime({
 *     enabled: true,
 *     onPriceChange: (market) => {
 *       console.log(`Price update: ${market.question}`, market.price_change_24h)
 *     }
 *   })
 *
 *   return (
 *     <div>
 *       <div className={isConnected ? 'text-green' : 'text-red'}>
 *         {isConnected ? '🟢 Live' : '🔴 Offline'}
 *       </div>
 *       {markets.map(market => (
 *         <BreakingMarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingRealtime(
  params: UseBreakingRealtimeParams = {}
): UseBreakingRealtimeReturn {
  const { marketId, enabled = true, onPriceChange } = params
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [markets, setMarkets] = useState<BreakingMarket[]>([])
  const queryClient = useQueryClient()

  /**
   * Invalidate related queries when market updates
   * This ensures TanStack Query cache stays fresh with real-time data
   */
  const invalidateQueries = ReactUseCallback(() => {
    // Invalidate all breaking queries to refetch fresh data
    queryClient.invalidateQueries({
      queryKey: breakingKeys.all
    })
    // Also invalidate the specific market if marketId is provided
    if (marketId) {
      queryClient.invalidateQueries({
        queryKey: breakingKeys.detail(marketId)
      })
    }
  }, [queryClient, marketId])

  useEffect(() => {
    if (!enabled) {
      return
    }

    let unsubscribe: (() => void) | null = null
    let isConnecting = true
    const connectionTimer = setTimeout(() => {
      // Set to connected after a short delay (simulating connection)
      if (isConnecting) {
        setIsConnected(true)
        isConnecting = false
      }
    }, 500)

    // Subscribe to breaking market updates
    try {
      if (marketId) {
        // Subscribe to specific market
        unsubscribe = breakingService.subscribeToMarket(
          marketId,
          (market) => {
            setMarkets((prev) => {
              const index = prev.findIndex((m) => m.id === market.id)
              if (index >= 0) {
                // Update existing market
                const updated = [...prev]
                updated[index] = market
                return updated
              } else {
                // Add new market
                return [...prev, market]
              }
            })

            // Invalidate related queries to ensure cache is fresh
            invalidateQueries()

            // Call price change callback
            if (onPriceChange) {
              onPriceChange(market)
            }
          }
        )
      } else {
        // Subscribe to all breaking market updates
        unsubscribe = breakingService.subscribeToBreakingUpdates(
          (market) => {
            setMarkets((prev) => {
              const index = prev.findIndex((m) => m.id === market.id)
              if (index >= 0) {
                // Update existing market
                const updated = [...prev]
                updated[index] = market
                return updated
              } else {
                // Add new market
                return [...prev, market]
              }
            })

            // Invalidate related queries to ensure cache is fresh
            invalidateQueries()

            // Call price change callback
            if (onPriceChange) {
              onPriceChange(market)
            }
          }
        )
      }

      setIsConnected(true)
      setError(null)
      isConnecting = false
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to subscribe to breaking updates')
      setError(errorObj)
      setIsConnected(false)
      isConnecting = false
    }

    // Cleanup subscription on unmount
    return () => {
      clearTimeout(connectionTimer)
      if (unsubscribe) {
        unsubscribe()
        setIsConnected(false)
      }
    }
  }, [marketId, enabled, onPriceChange, invalidateQueries])

  return {
    isConnected,
    error,
    markets,
    invalidateQueries
  }
}

// ============================================================================
// USE BREAKING MARKETS WITH SORTING
// ============================================================================

/**
 * Use Breaking Markets Sorted Hook Parameters
 */
interface UseBreakingMarketsSortedParams extends UseBreakingMarketsParams {
  /** Sort by field (default: 'movement_score') */
  sortBy?: 'movement_score' | 'price_change_24h' | 'volume_change_24h' | 'volatility_index' | 'rank'
  /** Sort direction (default: 'desc') */
  sortOrder?: 'asc' | 'desc'
}

/**
 * Use Breaking Markets Sorted Hook Return Type
 */
interface UseBreakingMarketsSortedReturn extends Omit<UseBreakingMarketsReturn, 'markets'> {
  /** Sorted array of breaking markets */
  markets: BreakingMarket[]
}

/**
 * Use Breaking Markets Sorted Hook
 *
 * Fetches breaking markets with client-side sorting applied.
 * Useful for displaying markets ranked by different metrics.
 *
 * @param params - Hook parameters
 * @returns Sorted breaking markets and query state
 *
 * @example
 * ```tsx
 * function BreakingMarketsByVolume() {
 *   const { markets } = useBreakingMarketsSorted({
 *     filters: { timeRange: '24h' },
 *     sortBy: 'volume_change_24h',
 *     sortOrder: 'desc'
 *   })
 *
 *   return (
 *     <div>
 *       <h2>Top Movers by Volume</h2>
 *       {markets.map(market => (
 *         <MarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingMarketsSorted(
  params: UseBreakingMarketsSortedParams = {}
): UseBreakingMarketsSortedReturn {
  const { filters, limit, enabled, refetchInterval, sortBy = 'movement_score', sortOrder = 'desc' } = params

  // Use the base useBreakingMarkets hook
  const baseQuery = useBreakingMarkets({ filters, limit, enabled, refetchInterval })

  // Sort the data client-side
  const sortedMarkets = [...baseQuery.markets].sort((a, b) => {
    const aVal = a[sortBy]
    const bVal = b[sortBy]

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal
    }

    return 0
  })

  return {
    ...baseQuery,
    markets: sortedMarkets
  }
}

// ============================================================================
// USE BREAKING MARKETS TRENDING
// ============================================================================

/**
 * Use Breaking Markets Trending Hook Parameters
 */
interface UseBreakingMarketsTrendingParams {
  /** Number of markets to return (default: 20) */
  limit?: number
  /** Whether to enable the query */
  enabled?: boolean
  /** Refetch interval in milliseconds */
  refetchInterval?: number
}

/**
 * Use Breaking Markets Trending Hook Return Type
 */
interface UseBreakingMarketsTrendingReturn extends UseBreakingMarketsReturn {}

/**
 * Use Breaking Markets Trending Hook
 *
 * Fetches the top trending breaking markets ranked by movement score.
 * Convenience wrapper around useBreakingMarkets with trending defaults.
 *
 * @param params - Hook parameters
 * @returns Trending breaking markets and query state
 *
 * @example
 * ```tsx
 * function TrendingMarketsWidget() {
 *   const { markets, isLoading } = useBreakingMarketsTrending({
 *     limit: 10,
 *     refetchInterval: 30000 // Refresh every 30 seconds
 *   })
 *
 *   if (isLoading) return <Skeleton count={10} />
 *
 *   return (
 *     <div>
 *       <h2>Trending Markets</h2>
 *       {markets.map((market, index) => (
 *         <div key={market.id}>
 *           <span>#{index + 1}</span>
 *           <MarketCard market={market} />
 *         </div>
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingMarketsTrending(
  params: UseBreakingMarketsTrendingParams = {}
): UseBreakingMarketsTrendingReturn {
  const { limit = 20, enabled = true, refetchInterval } = params

  return useBreakingMarkets({
    filters: { minMovementScore: 0.5 }, // Only high movement score markets
    limit,
    enabled,
    refetchInterval
  })
}

// ============================================================================
// USE BREAKING MARKETS BY CATEGORY
// ============================================================================

/**
 * Use Breaking Markets By Category Hook Parameters
 */
interface UseBreakingMarketsByCategoryParams {
  /** Category slug to filter by */
  category: string
  /** Additional filters */
  filters?: Omit<BreakingFilters, 'categories'>
  /** Limit results */
  limit?: number
  /** Query enabled flag */
  enabled?: boolean
}

/**
 * Use Breaking Markets By Category Hook Return Type
 */
interface UseBreakingMarketsByCategoryReturn extends UseBreakingMarketsReturn {}

/**
 * Use Breaking Markets By Category Hook
 *
 * Fetches breaking markets for a specific category.
 * Convenience wrapper around useBreakingMarkets with category filter.
 *
 * @param params - Hook parameters
 * @returns Breaking markets for the category and query state
 *
 * @example
 * ```tsx
 * function CryptoBreakingMarkets() {
 *   const { markets, isLoading } = useBreakingMarketsByCategory({
 *     category: 'crypto',
 *     filters: { minPriceChange: 0.05 },
 *     limit: 15
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *
 *   return (
 *     <div>
 *       <h2>Crypto Breakouts</h2>
 *       {markets.map(market => (
 *         <MarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingMarketsByCategory(
  params: UseBreakingMarketsByCategoryParams
): UseBreakingMarketsByCategoryReturn {
  const { category, filters, limit = 20, enabled = true } = params

  return useBreakingMarkets({
    filters: {
      ...filters,
      categories: [category]
    },
    limit,
    enabled
  })
}
