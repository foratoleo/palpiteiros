/**
 * Use Market Hook
 *
 * Custom React Query hook for fetching single market details.
 * Provides real-time price updates and Supabase subscriptions.
 *
 * @feature TanStack Query v5 integration
 * @feature Real-time Supabase subscriptions
 * @feature Automatic refetch on price changes
 * @feature Optimistic cache updates
 */

import { useEffect, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { gammaService } from '@/services/gamma.service'
import { getMarketBySlug, getMarketPrices, subscribeToMarketPrices } from '@/services/supabase.service'
import { MarketTimeRange } from '@/types/market.types'
import { marketKeys } from '@/lib/query-keys'
import { STALE_TIMES, CACHE_TIMES } from '@/lib/query-client'
import type { Market, PriceDataPoint } from '@/types/market.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

// ============================================================================
// USE MARKET (Basic)
// ============================================================================

/**
 * Use Market Hook Parameters
 */
interface UseMarketParams {
  /** Market ID or slug */
  marketId: string
  /** Whether to enable the query */
  enabled?: boolean
  /** Refetch interval in milliseconds (for live price updates) */
  refetchInterval?: number
  /** Whether to enable real-time subscriptions via Supabase */
  enableRealtime?: boolean
}

/**
 * Use Market Hook Return Type
 */
interface UseMarketReturn {
  /** Market data */
  market: Market | undefined
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
  /** Latest price from real-time subscription */
  latestPrice?: number
  /** Whether real-time subscription is active */
  isSubscribed: boolean
}

/**
 * Use Market Hook
 *
 * Fetches a single market by ID with real-time price updates.
 * Combines data from Gamma API (market details) and Supabase (price history).
 *
 * @param params - Hook parameters
 * @returns Market data and query state
 *
 * @example
 * ```tsx
 * function MarketDetailPage({ marketId }: { marketId: string }) {
 *   const { market, isLoading, error, latestPrice } = useMarket({
 *     marketId,
 *     refetchInterval: 30000, // Refresh every 30 seconds
 *     enableRealtime: true
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *   if (!market) return <MarketNotFound />
 *
 *   return (
 *     <div>
 *       <h1>{market.question}</h1>
 *       <p>Current Price: {(latestPrice || market.current_price || 0) * 100}%</p>
 *       <MarketChart marketId={market.id} />
 *     </div>
 *   )
 * }
 * ```
 */
export function useMarket(params: UseMarketParams): UseMarketReturn {
  const { marketId, enabled = true, refetchInterval, enableRealtime = false } = params

  const queryClient = useQueryClient()
  const [latestPrice, setLatestPrice] = useState<number>()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscription, setSubscription] = useState<RealtimeChannel | null>(null)

  // Main market query
  const query = useQuery({
    queryKey: marketKeys.detail(marketId),
    queryFn: async () => {
      // Determine if marketId is a condition ID (starts with 0x) or a slug
      const isConditionId = marketId.startsWith('0x')

      try {
        // Try to get from database first (faster, has our custom fields)
        let dbMarket = isConditionId
          ? null // Database lookup by condition ID not implemented yet
          : await getMarketBySlug(marketId)

        // Always fetch fresh data from Gamma API for real-time prices
        const gammaMarket = isConditionId
          ? (await gammaService.getMarketsByConditionIds(marketId))?.[0] || null
          : await gammaService.getMarketBySlug(marketId)

        if (gammaMarket) {
          // Parse JSON string fields that Gamma API returns as strings
          const outcomes = typeof gammaMarket.outcomes === 'string'
            ? JSON.parse(gammaMarket.outcomes)
            : gammaMarket.outcomes

          const outcomePrices = typeof gammaMarket.outcomePrices === 'string'
            ? JSON.parse(gammaMarket.outcomePrices)
            : gammaMarket.outcomePrices

          // Convert outcomes array to objects with prices
          const outcomesWithPrices = outcomes.map((name: string, index: number) => ({
            name,
            price: parseFloat(outcomePrices[index]) || 0,
            ticker: name.toLowerCase()
          }))

          // Convert Gamma market to our Market type
          const market: Market = {
            id: gammaMarket.conditionId,
            condition_id: gammaMarket.conditionId,
            slug: gammaMarket.slug,
            question: gammaMarket.question,
            description: gammaMarket.description,
            end_date: gammaMarket.endDate || null,
            start_date: gammaMarket.startDate || null,
            active: gammaMarket.active,
            closed: gammaMarket.closed,
            archived: gammaMarket.archived || false,
            image_url: gammaMarket.imageUrl || null,
            outcomes: outcomesWithPrices.map((outcome) => ({
              id: `${gammaMarket.conditionId}-${outcome.name}`,
              market_id: gammaMarket.conditionId,
              name: outcome.name,
              price: outcome.price,
              ticker: outcome.ticker || null
            })),
            tags: gammaMarket.tags?.map((tag) => ({
              id: String(tag.id || tag.slug),
              label: tag.label,
              slug: tag.slug,
              name: tag.name || tag.label
            })) || [],
            volume: gammaMarket.volume ? parseFloat(gammaMarket.volume) : null,
            liquidity: gammaMarket.liquidity ? parseFloat(gammaMarket.liquidity) : null,
            current_price: outcomesWithPrices.find((o) => o.name === 'Yes')?.price,
            price_change_24h: undefined,
            created_at: dbMarket?.created_at || new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          // Update latest price for real-time display
          const yesPrice = market.current_price
          if (yesPrice !== undefined) {
            setLatestPrice(yesPrice)
          }

          return market
        }
      } catch (error) {
        console.error('[useMarket] Market fetch failed:', error)
      }

      // Fallback to database market
      let dbMarket = isConditionId
        ? null
        : await getMarketBySlug(marketId)

      if (dbMarket) {
        return {
          ...dbMarket,
          current_price: dbMarket.outcomes.find((o: any) => o.name === 'Yes')?.price
        }
      }

      throw new Error(`Market not found: ${marketId}`)
    },
    staleTime: STALE_TIMES.PRICES, // Prices go stale quickly (1 minute)
    gcTime: CACHE_TIMES.PRICES,
    enabled, // Run on client side
    refetchInterval
  })

  // Real-time subscription for price updates
  useEffect(() => {
    if (!enableRealtime || !query.data) {
      return
    }

    // Subscribe to price updates from Supabase
    const channel = subscribeToMarketPrices(query.data.id, (priceUpdate) => {
      // Update latest price immediately
      setLatestPrice(priceUpdate.price_yes ?? undefined)

      // Update cache in background
      queryClient.setQueryData(marketKeys.detail(marketId), (old: Market | undefined) => {
        if (!old) return old

        return {
          ...old,
          current_price: priceUpdate.price_yes ?? undefined,
          outcomes: old.outcomes.map((outcome: any) =>
            outcome.name === 'Yes'
              ? { ...outcome, price: priceUpdate.price_yes ?? 0 }
              : outcome.name === 'No'
              ? { ...outcome, price: priceUpdate.price_no ?? 0 }
              : outcome
          ),
          updated_at: priceUpdate.timestamp
        }
      })
    })

    setSubscription(channel)
    setIsSubscribed(true)

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        channel.unsubscribe()
        setIsSubscribed(false)
      }
    }
  }, [enableRealtime, query.data, marketId, queryClient])

  return {
    market: query.data,
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: marketKeys.detail(marketId)
      })
    },
    latestPrice,
    isSubscribed
  }
}

// ============================================================================
// USE MARKET BY SLUG
// ============================================================================

/**
 * Use Market By Slug Hook Parameters
 */
interface UseMarketBySlugParams extends Omit<UseMarketParams, 'marketId'> {
  /** Market slug instead of ID */
  slug: string
}

/**
 * Use Market By Slug Hook Return Type
 */
interface UseMarketBySlugReturn extends Omit<UseMarketReturn, 'market'> {
  /** Market data */
  market: Market | undefined
}

/**
 * Use Market By Slug Hook
 *
 * Convenience wrapper around useMarket that accepts slug instead of ID.
 * Internally converts slug to ID for query key consistency.
 *
 * @param params - Hook parameters with slug
 * @returns Market data and query state
 *
 * @example
 * ```tsx
 * function MarketPage({ slug }: { slug: string }) {
 *   const { market, isLoading } = useMarketBySlug({
 *     slug,
 *     enableRealtime: true
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (!market) return <NotFound />
 *
 *   return <MarketDetailView market={market} />
 * }
 * ```
 */
export function useMarketBySlug(params: UseMarketBySlugParams): UseMarketBySlugReturn {
  const { slug, ...rest } = params

  // Use the slug as the marketId (works for both ID and slug)
  return useMarket({
    marketId: slug,
    ...rest
  }) as UseMarketBySlugReturn
}

// ============================================================================
// USE MARKET WITH STATISTICS
// ============================================================================

/**
 * Use Market With Statistics Hook Parameters
 */
interface UseMarketWithStatsParams extends UseMarketParams {
  /** Whether to fetch market statistics */
  includeStats?: boolean
  /** Time range for statistics calculation */
  statsTimeRange?: '24h' | '7d' | '30d' | 'all'
}

/**
 * Market Statistics
 */
interface MarketStats {
  /** 24-hour trading volume */
  volume24h: number
  /** 24-hour price change percentage */
  priceChange24h: number
  /** All-time high price */
  ath: number
  /** All-time low price */
  atl: number
  /** Number of price updates in time range */
  updateCount: number
}

/**
 * Use Market With Statistics Hook Return Type
 */
interface UseMarketWithStatsReturn extends UseMarketReturn {
  /** Market data */
  market: Market | undefined
  /** Market statistics */
  stats?: MarketStats
  /** Loading state for statistics */
  isLoadingStats: boolean
}

/**
 * Use Market With Statistics Hook
 *
 * Fetches market data along with calculated statistics.
 * Computes ATH, ATL, volume, and price changes from price history.
 *
 * @param params - Hook parameters
 * @returns Market data, statistics, and query state
 *
 * @example
 * ```tsx
 * function MarketStatsView({ marketId }: { marketId: string }) {
 *   const { market, stats, isLoading, isLoadingStats } = useMarketWithStats({
 *     marketId,
 *     includeStats: true,
 *     statsTimeRange: '7d'
 *   })
 *
 *   return (
 *     <div>
 *       {isLoading ? <Spinner /> : <MarketCard market={market!} />}
 *       {isLoadingStats ? <Spinner /> : (
 *         <StatsDisplay stats={stats!} />
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMarketWithStats(params: UseMarketWithStatsParams): UseMarketWithStatsReturn {
  const { includeStats = false, statsTimeRange = '24h', ...marketParams } = params

  // Get market data
  const marketQuery = useMarket(marketParams)

  // Fetch price history for statistics
  const statsQuery = useQuery({
    queryKey: marketKeys.history(marketParams.marketId, statsTimeRange === '24h' ? MarketTimeRange.HOUR_24 : statsTimeRange === '7d' ? MarketTimeRange.DAY_7 : MarketTimeRange.DAY_30),
    queryFn: async () => {
      const prices = await getMarketPrices(marketParams.marketId, 1000)

      // Calculate statistics
      const yesPrices = prices.map((p) => p.price_yes).filter((p): p is number => p !== null)

      const volume24h = prices
        .filter((p) => {
          const priceTime = new Date(p.timestamp).getTime()
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000
          return priceTime >= dayAgo
        })
        .reduce((sum, p) => sum + (p.volume_24h || 0), 0)

      const firstPrice = yesPrices[yesPrices.length - 1]
      const lastPrice = yesPrices[0]
      const priceChange24h = firstPrice && lastPrice
        ? ((lastPrice - firstPrice) / firstPrice) * 100
        : 0

      const ath = yesPrices.length > 0 ? Math.max(...yesPrices) : 0
      const atl = yesPrices.length > 0 ? Math.min(...yesPrices) : 0

      return {
        volume24h,
        priceChange24h,
        ath,
        atl,
        updateCount: prices.length
      } as MarketStats
    },
    enabled: includeStats && marketQuery.market !== undefined,
    staleTime: STALE_TIMES.PRICE_HISTORY,
    gcTime: CACHE_TIMES.PRICE_HISTORY
  })

  return {
    ...marketQuery,
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading
  }
}

// ============================================================================
// USE MULTIPLE MARKETS
// ============================================================================

/**
 * Use Multiple Markets Hook Parameters
 */
interface UseMultipleMarketsParams {
  /** Array of market IDs to fetch */
  marketIds: string[]
  /** Whether to enable the query */
  enabled?: boolean
}

/**
 * Use Multiple Markets Hook Return Type
 */
interface UseMultipleMarketsReturn {
  /** Map of market ID to market data */
  markets: Map<string, Market>
  /** Array of fetched markets */
  marketsArray: Market[]
  /** Loading state */
  isLoading: boolean
  /** Number of markets still loading */
  pendingCount: number
  /** Error state (first error encountered) */
  error: Error | null
  /** Refetch all markets */
  refetch: () => void
}

/**
 * Use Multiple Markets Hook
 *
 * Fetches multiple markets in parallel.
 * Returns results as both Map and Array for flexible consumption.
 *
 * @param params - Hook parameters
 * @returns Multiple markets data and state
 *
 * @example
 * ```tsx
 * function PortfolioMarkets({ marketIds }: { marketIds: string[] }) {
 *   const { marketsArray, isLoading } = useMultipleMarkets({
 *     marketIds
 *   })
 *
 *   return (
 *     <div>
 *       {isLoading ? <Spinner /> : (
 *         marketsArray.map(market => (
 *           <MiniMarketCard key={market.id} market={market} />
 *         ))
 *       )}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMultipleMarkets(params: UseMultipleMarketsParams): UseMultipleMarketsReturn {
  const { marketIds, enabled = true } = params
  const queryClient = useQueryClient()

  // Use useQuery for each market ID
  const queries = marketIds.map((marketId) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useQuery({
      queryKey: marketKeys.detail(marketId),
      queryFn: async () => {
        const gammaMarket = await gammaService.getMarketBySlug(marketId)
        if (!gammaMarket) {
          throw new Error(`Market not found: ${marketId}`)
        }

        return {
          id: gammaMarket.conditionId,
          condition_id: gammaMarket.conditionId,
          slug: gammaMarket.slug,
          question: gammaMarket.question,
          description: gammaMarket.description,
          end_date: gammaMarket.endDate || null,
          start_date: gammaMarket.startDate || null,
          active: gammaMarket.active,
          closed: gammaMarket.closed,
          archived: gammaMarket.archived || false,
          image_url: gammaMarket.imageUrl || null,
          outcomes: gammaMarket.outcomes.map((outcome) => ({
            id: `${gammaMarket.conditionId}-${outcome.name}`,
            market_id: gammaMarket.conditionId,
            name: outcome.name,
            price: outcome.price,
            ticker: outcome.ticker || null
          })),
          tags: gammaMarket.tags?.map((tag) => ({
            id: String(tag.id || tag.slug),
            label: tag.label,
            slug: tag.slug,
            name: tag.name || tag.label
          })) || [],
          volume: gammaMarket.volume || null,
          liquidity: gammaMarket.liquidity || null,
          current_price: gammaMarket.outcomes.find((o) => o.name === 'Yes')?.price,
          price_change_24h: undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        } as Market
      },
      staleTime: STALE_TIMES.PRICES,
      gcTime: CACHE_TIMES.PRICES,
      enabled
    })
  })

  const markets = new Map<string, Market>()
  const marketsArray: Market[] = []
  let pendingCount = 0
  let error: Error | null = null

  queries.forEach((query, index) => {
    if (query.isLoading) {
      pendingCount++
    } else if (query.error) {
      if (!error) {
        error = query.error
      }
    } else if (query.data) {
      markets.set(marketIds[index], query.data)
      marketsArray.push(query.data)
    }
  })

  return {
    markets,
    marketsArray,
    isLoading: pendingCount === marketIds.length,
    pendingCount,
    error,
    refetch: () => {
      marketIds.forEach((marketId) => {
        queryClient.invalidateQueries({
          queryKey: marketKeys.detail(marketId)
        })
      })
    }
  }
}
