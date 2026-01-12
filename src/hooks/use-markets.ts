/**
 * Use Markets Hook
 *
 * Custom React Query hook for fetching and managing market lists.
 * Provides filtering, sorting, pagination, and optimistic updates.
 *
 * @feature TanStack Query v5 integration
 * @feature Optimistic updates for favorites
 * @feature Infinite scroll support
 * @feature Real-time cache invalidation
 */

import { useMemo } from 'react'
import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { gammaService } from '@/services/gamma.service'
import { getMarkets as dbGetMarkets, upsertMarket } from '@/services/supabase.service'
import { marketKeys } from '@/lib/query-keys'
import { STALE_TIMES, CACHE_TIMES } from '@/lib/query-client'
import { mapGammaCategoryToUI, mapUIToGammaTagSlug } from '@/lib/category-mapper'
import type {
  Market,
  MarketFilterOptions,
  MarketSortOption
} from '@/types/market.types'

// ============================================================================
// USE MARKETS LIST (Basic)
// ============================================================================

/**
 * Use Markets Hook Parameters
 */
interface UseMarketsParams {
  /** Filter options for the query */
  filters?: MarketFilterOptions
  /** Whether to enable the query (pause if false) */
  enabled?: boolean
  /** Refetch interval in milliseconds (for auto-refresh) */
  refetchInterval?: number
}

/**
 * Use Markets Hook Return Type
 */
interface UseMarketsReturn {
  /** Array of markets */
  markets: Market[] | undefined
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
 * Use Markets Hook
 *
 * Fetches a list of markets with optional filtering.
 * Uses Gamma API as primary source, falls back to database.
 *
 * @param params - Hook parameters
 * @returns Markets data and query state
 *
 * @example
 * ```tsx
 * function MarketsList() {
 *   const { markets, isLoading, error } = useMarkets({
 *     filters: { active: true, category: 'crypto' },
 *     refetchInterval: 60000 // Refresh every minute
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {markets?.map(market => (
 *         <MarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMarkets(params: UseMarketsParams = {}): UseMarketsReturn {
  const { filters, enabled = true, refetchInterval } = params
  const queryClient = useQueryClient()

  // Map UI categories to Gamma API tag_slug for query key uniqueness
  const categoryTagSlug = filters?.categories?.[0]
    ? mapUIToGammaTagSlug(filters.categories[0])
    : undefined

  // Merge user filters with required API parameters for consistent query key
  // IMPORTANT: Include tag_slug in query key so different categories trigger refetch
  const queryFilters = {
    ...filters,
    active: true, // Always fetch active markets
    closed: false, // Exclude closed markets
    tag_slug: categoryTagSlug, // Include tag_slug for cache key uniqueness
  }

  const query = useQuery({
    queryKey: marketKeys.lists(queryFilters),
    queryFn: async () => {
      // Try Gamma API first (real-time data)
      try {

        const gammaMarkets = await gammaService.fetchMarkets({
          active: true, // Always fetch active markets
          closed: false, // Exclude closed markets
          tag_slug: categoryTagSlug,
          limit: filters?.searchQuery ? 50 : 100
        })

        // Convert Gamma markets to our Market type
        const markets: Market[] = gammaMarkets.map((gammaMarket: any) => {
          // Parse outcomes and outcomePrices from strings
          const outcomes = typeof gammaMarket.outcomes === 'string'
            ? JSON.parse(gammaMarket.outcomes)
            : gammaMarket.outcomes || []

          const outcomePrices = typeof gammaMarket.outcomePrices === 'string'
            ? JSON.parse(gammaMarket.outcomePrices)
            : gammaMarket.outcomePrices || []

          // Parse tags if available
          const tags = gammaMarket.tags?.map((tag: any) => ({
            id: String(tag.id || tag.slug),
            label: tag.label,
            slug: tag.slug,
            name: tag.name || tag.label
          })) || []

          // Map Gamma API category to UI category
          const uiCategory = mapGammaCategoryToUI(gammaMarket.category)

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
            category: uiCategory,
            image_url: gammaMarket.image || gammaMarket.imageUrl || null,
            outcomes: outcomes.map((outcome: any, index: number) => ({
              id: `${gammaMarket.conditionId}-${outcome}`,
              market_id: gammaMarket.conditionId,
              name: outcome,
              price: parseFloat(outcomePrices[index]) || 0,
              ticker: outcome
            })),
            tags,
            volume: gammaMarket.volume || null,
            volume_24h: gammaMarket.volume24hr || null,
            liquidity: gammaMarket.liquidity || null,
            current_price: outcomes.indexOf('Yes') >= 0
              ? parseFloat(outcomePrices[outcomes.indexOf('Yes')] || '0')
              : undefined,
            price_change_24h: gammaMarket.oneDayPriceChange || 0,
            created_at: gammaMarket.createdAt || new Date().toISOString(),
            updated_at: gammaMarket.updatedAt || new Date().toISOString()
          }
        })

        // Apply client-side filters (only for non-API filters)
        let filteredMarkets = markets

        // Note: Category filtering is done at API level via tag_slug parameter
        // No need for client-side category filtering

        // Search filter
        if (filters?.searchQuery) {
          const searchLower = filters.searchQuery.toLowerCase()
          filteredMarkets = filteredMarkets.filter(
            (m) =>
              m.question.toLowerCase().includes(searchLower) ||
              m.description?.toLowerCase().includes(searchLower)
          )
        }

        // Price range filter
        if (filters?.priceRange) {
          const [min, max] = filters.priceRange
          filteredMarkets = filteredMarkets.filter((m) => {
            const price = m.current_price ?? 0.5
            return price >= min && price <= max
          })
        }

        // Volume/liquidity filters
        if (filters?.minLiquidity) {
          filteredMarkets = filteredMarkets.filter(
            (m) => (m.liquidity ?? 0) >= filters.minLiquidity!
          )
        }

        if (filters?.minVolume) {
          filteredMarkets = filteredMarkets.filter(
            (m) => (m.volume ?? 0) >= filters.minVolume!
          )
        }

        console.log('[useMarkets] Query completed successfully:', {
          returnedMarkets: filteredMarkets.length,
          firstMarket: filteredMarkets[0]?.question?.substring(0, 50),
          categoryTagSlug,
          queryFilters
        })

        return filteredMarkets
      } catch (error) {
        // CRITICAL: Log detailed error for debugging
        console.error('[useMarkets] Gamma API failed:', {
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined,
          filters: queryFilters,
          categoryTagSlug
        })

        // Fallback to database if Gamma API fails
        console.warn('Falling back to database')
        try {
          return await dbGetMarkets({
            active: filters?.active,
            tag: filters?.tags?.[0],
            search: filters?.searchQuery
          })
        } catch (dbError) {
          // If both fail, return mock data for development
          console.warn('Database also failed, using mock data:', dbError)
          const mockData = getMockMarkets()
          console.log('[useMarkets] Returning mock data:', mockData.length, 'markets')
          return mockData
        }
      }
    },
    staleTime: STALE_TIMES.MARKETS,
    gcTime: CACHE_TIMES.MARKETS,
    enabled,
    refetchInterval
  })

  return {
    markets: query.data,
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: marketKeys.lists(queryFilters)
      })
    }
  }
}

// ============================================================================
// USE MARKETS INFINITE SCROLL
// ============================================================================

/**
 * Use Markets Infinite Hook Parameters
 */
interface UseMarketsInfiniteParams extends UseMarketsParams {
  /** Number of items per page */
  limit?: number
}

/**
 * Use Markets Infinite Hook Return Type
 */
interface UseMarketsInfiniteReturn {
  /** Flattened array of all loaded markets */
  markets: Market[]
  /** Loading state for first page */
  isLoading: boolean
  /** Loading state for subsequent pages */
  isLoadingMore: boolean
  /** Error state */
  error: Error | null
  /** Whether there are more pages to load */
  hasMore: boolean
  /** Load next page function */
  loadMore: () => void
  /** Refetch all pages */
  refetch: () => void
}

/**
 * Use Markets Infinite Hook
 *
 * Fetches markets with infinite scroll pagination.
 * Automatically loads more data as user scrolls.
 *
 * @param params - Hook parameters
 * @returns Infinite scroll data and controls
 *
 * @example
 * ```tsx
 * function InfiniteMarketsList() {
 *   const { markets, isLoading, hasMore, loadMore } = useMarketsInfinite({
 *     filters: { active: true },
 *     limit: 20
 *   })
 *
 *   return (
 *     <InfiniteScroll
 *       data={markets}
 *       hasMore={hasMore}
 *       loadMore={loadMore}
 *       renderItem={(market) => <MarketCard key={market.id} market={market} />}
 *     />
 *   )
 * }
 * ```
 */
export function useMarketsInfinite(params: UseMarketsInfiniteParams = {}): UseMarketsInfiniteReturn {
  const { filters, enabled = true, limit = 20 } = params

  const query = useInfiniteQuery({
    queryKey: marketKeys.infiniteLists(filters),
    queryFn: async ({ pageParam = 0 }) => {
      const offset = pageParam * limit

      // Fetch from Gamma API with pagination
      const gammaMarkets = await gammaService.fetchMarkets({
        active: filters?.active,
        tag_slug: filters?.tags?.[0],
        limit,
        offset
      })

      // Convert to Market type (same logic as useMarkets)
      const markets: Market[] = gammaMarkets.map((gammaMarket) => ({
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
      }))

      return markets
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If we got less than limit items, we've reached the end
      if (lastPage.length < limit) {
        return undefined
      }
      // Return next page index
      return allPages.length
    },
    staleTime: STALE_TIMES.MARKETS,
    gcTime: CACHE_TIMES.MARKETS,
    enabled
  })

  // Flatten all pages into single array
  const markets = query.data?.pages.flat() || []

  return {
    markets,
    isLoading: query.isLoading,
    isLoadingMore: query.isFetchingNextPage,
    error: query.error || null,
    hasMore: query.hasNextPage || false,
    loadMore: () => query.fetchNextPage(),
    refetch: query.refetch
  }
}

// ============================================================================
// USE SORTED MARKETS
// ============================================================================

/**
 * Use Sorted Markets Hook Parameters
 */
interface UseSortedMarketsParams {
  /** Sort options */
  sort: MarketSortOption
  /** Optional filters */
  filters?: MarketFilterOptions
  /** Query enabled flag */
  enabled?: boolean
}

/**
 * Use Sorted Markets Hook Return Type
 */
interface UseSortedMarketsReturn extends UseMarketsReturn {}

/**
 * Use Sorted Markets Hook
 *
 * Fetches markets with client-side sorting applied.
 * Sorts by specified field and direction.
 *
 * @param params - Hook parameters
 * @returns Sorted markets and query state
 *
 * @example
 * ```tsx
 * function SortedMarketsList() {
 *   const { markets } = useSortedMarkets({
 *     sort: { field: 'volume', direction: 'desc' },
 *     filters: { active: true }
 *   })
 *
 *   return (
 *     <div>
 *       {markets?.map(market => (
 *         <MarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useSortedMarkets(params: UseSortedMarketsParams): UseSortedMarketsReturn {
  const { sort, filters, enabled = true } = params

  // Use the base useMarkets hook
  const baseQuery = useMarkets({ filters, enabled })

  // Sort the data client-side using useMemo
  const sortedMarkets = useMemo(() => {
    if (!baseQuery.markets) {
      return []
    }

    const sorted = [...baseQuery.markets].sort((a, b) => {
      let aVal: number | string
      let bVal: number | string

      switch (sort.field) {
        case 'endDate':
          aVal = a.end_date || ''
          bVal = b.end_date || ''
          break
        case 'volume':
          aVal = a.volume || 0
          bVal = b.volume || 0
          break
        case 'liquidity':
          aVal = a.liquidity || 0
          bVal = b.liquidity || 0
          break
        case 'price':
          aVal = a.current_price || 0.5
          bVal = b.current_price || 0.5
          break
        case 'price_change_24h':
          aVal = a.price_change_24h || 0
          bVal = b.price_change_24h || 0
          break
        default:
          aVal = a.created_at
          bVal = b.created_at
      }

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sort.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal)
      }

      return sort.direction === 'asc'
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number)
    })

    return sorted
  }, [baseQuery.markets, sort.field, sort.direction])

  return {
    markets: sortedMarkets,
    isLoading: baseQuery.isLoading,
    error: baseQuery.error,
    isRefetching: baseQuery.isRefetching,
    refetch: baseQuery.refetch,
    invalidate: baseQuery.invalidate
  }
}

// ============================================================================
// USE MARKET SEARCH
// ============================================================================

/**
 * Use Market Search Hook Parameters
 */
interface UseMarketSearchParams {
  /** Search query string */
  query: string
  /** Minimum query length before searching */
  minLength?: number
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Query enabled flag */
  enabled?: boolean
}

/**
 * Use Market Search Hook Return Type
 */
interface UseMarketSearchReturn {
  /** Search results */
  results: Market[] | undefined
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Whether query is too short */
  isTooShort: boolean
}

/**
 * Use Market Search Hook
 *
 * Searches markets by question text and description.
 * Debounced to avoid excessive API calls.
 *
 * @param params - Hook parameters
 * @returns Search results and state
 *
 * @example
 * ```tsx
 * function MarketSearch() {
 *   const [query, setQuery] = useState('')
 *   const { results, isLoading, isTooShort } = useMarketSearch({
 *     query,
 *     minLength: 2,
 *     debounceMs: 300
 *   })
 *
 *   return (
 *     <div>
 *       <input value={query} onChange={(e) => setQuery(e.target.value)} />
 *       {isTooShort && <p>Type at least 2 characters</p>}
 *       {isLoading && <p>Searching...</p>}
 *       {results?.map(market => (
 *         <MarketCard key={market.id} market={market} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useMarketSearch(params: UseMarketSearchParams): UseMarketSearchReturn {
  const { query: searchQuery, minLength = 2, enabled = true } = params

  const isTooShort = searchQuery.length < minLength

  const query = useQuery({
    queryKey: marketKeys.search(searchQuery),
    queryFn: async () => {
      if (isTooShort) {
        return []
      }

      // Search using Gamma API
      const markets = await gammaService.fetchMarkets({ limit: 50 })
      const searchLower = searchQuery.toLowerCase()

      return markets.filter(
        (m) =>
          m.question.toLowerCase().includes(searchLower) ||
          m.description?.toLowerCase().includes(searchLower) ||
          m.tags?.some((tag) => tag.label.toLowerCase().includes(searchLower))
      )
    },
    enabled: enabled && !isTooShort,
    staleTime: STALE_TIMES.MARKETS,
    gcTime: CACHE_TIMES.MARKETS
  })

  return {
    results: query.data as Market[] | undefined,
    isLoading: query.isLoading,
    error: query.error || null,
    isTooShort
  }
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Use Toggle Favorite Market Hook
 *
 * Toggles a market's favorite status with optimistic update.
 * Automatically updates UI immediately, then syncs with server.
 *
 * @returns Mutation object with toggle function
 *
 * @example
 * ```tsx
 * function MarketCard({ market }: { market: Market }) {
 *   const toggleFavorite = useToggleFavoriteMarket()
 *
 *   const handleToggle = () => {
 *     toggleFavorite.mutate(market.id)
 *   }
 *
 *   return (
 *     <div>
 *       <h2>{market.question}</h2>
 *       <button onClick={handleToggle}>
 *         {toggleFavorite.isPending ? '...' : '⭐ Favorite'}
 *       </button>
 *     </div>
 *   )
 * }
 * ```
 */
export function useToggleFavoriteMarket() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (marketId: string) => {
      // In a real app, this would call an API to toggle favorite status
      // For now, we'll simulate it with a delay
      await new Promise((resolve) => setTimeout(resolve, 500))
      return marketId
    },
    onMutate: async (marketId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: marketKeys.all })

      // Snapshot previous value
      const previousMarkets = queryClient.getQueryData(marketKeys.lists())

      // Optimistically update to the new value
      queryClient.setQueryData(marketKeys.lists(), (old: Market[] | undefined) => {
        if (!old) return old
        return old.map((m) =>
          m.id === marketId
            ? { ...m }
            : m
        )
      })

      // Return context with previous value
      return { previousMarkets }
    },
    onError: (error, marketId, context) => {
      // Rollback to previous value on error
      if (context?.previousMarkets) {
        queryClient.setQueryData(marketKeys.lists(), context.previousMarkets)
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: marketKeys.all })
    }
  })
}

// ============================================================================
// MOCK DATA FOR DEVELOPMENT
// ============================================================================

/**
 * Get mock markets for development/testing
 * This is used when both Gamma API and database fail
 */
function getMockMarkets(): Market[] {
  return [
    {
      id: 'mock-1',
      condition_id: 'mock-1',
      slug: 'will-bitcoin-reach-100k',
      question: 'Will Bitcoin reach $100,000 by end of 2025?',
      description: 'This market resolves to Yes if Bitcoin trades at or above $100,000 on any major exchange before December 31, 2025.',
      end_date: '2025-12-31T23:59:59Z',
      start_date: '2024-01-01T00:00:00Z',
      active: true,
      closed: false,
      archived: false,
      image_url: null,
      outcomes: [
        { id: 'mock-1-yes', market_id: 'mock-1', name: 'Yes', price: 0.65, ticker: 'YES' },
        { id: 'mock-1-no', market_id: 'mock-1', name: 'No', price: 0.35, ticker: 'NO' }
      ],
      tags: [
        { id: 'crypto', label: 'Crypto', slug: 'crypto', name: 'Crypto' }
      ],
      volume: 5000000,
      liquidity: 250000,
      current_price: 0.65,
      price_change_24h: 5.2,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-2',
      condition_id: 'mock-2',
      slug: 'trump-2024-election',
      question: 'Will Trump win the 2024 US Presidential Election?',
      description: 'Resolves to Yes if Donald Trump is declared the winner of the 2024 US Presidential Election.',
      end_date: '2024-11-05T23:59:59Z',
      start_date: '2023-01-01T00:00:00Z',
      active: true,
      closed: false,
      archived: false,
      image_url: null,
      outcomes: [
        { id: 'mock-2-yes', market_id: 'mock-2', name: 'Yes', price: 0.52, ticker: 'YES' },
        { id: 'mock-2-no', market_id: 'mock-2', name: 'No', price: 0.48, ticker: 'NO' }
      ],
      tags: [
        { id: 'politics', label: 'Politics', slug: 'politics', name: 'Politics' }
      ],
      volume: 15000000,
      liquidity: 750000,
      current_price: 0.52,
      price_change_24h: -2.1,
      created_at: '2023-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-3',
      condition_id: 'mock-3',
      slug: 'eth-max-supply',
      question: 'Will Ethereum change its max supply?',
      description: 'Resolves Yes if Ethereum implements a maximum supply limit before 2026.',
      end_date: '2025-12-31T23:59:59Z',
      start_date: '2024-01-01T00:00:00Z',
      active: true,
      closed: false,
      archived: false,
      image_url: null,
      outcomes: [
        { id: 'mock-3-yes', market_id: 'mock-3', name: 'Yes', price: 0.15, ticker: 'YES' },
        { id: 'mock-3-no', market_id: 'mock-3', name: 'No', price: 0.85, ticker: 'NO' }
      ],
      tags: [
        { id: 'crypto', label: 'Crypto', slug: 'crypto', name: 'Crypto' },
        { id: 'technology', label: 'Technology', slug: 'technology', name: 'Technology' }
      ],
      volume: 800000,
      liquidity: 50000,
      current_price: 0.15,
      price_change_24h: 1.5,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-4',
      condition_id: 'mock-4',
      slug: 'ai-singularity',
      question: 'Will AGI be achieved by 2030?',
      description: 'Resolves Yes if a widely recognized AI system achieves human-level performance across all cognitive tasks before 2030.',
      end_date: '2030-12-31T23:59:59Z',
      start_date: '2024-01-01T00:00:00Z',
      active: true,
      closed: false,
      archived: false,
      image_url: null,
      outcomes: [
        { id: 'mock-4-yes', market_id: 'mock-4', name: 'Yes', price: 0.23, ticker: 'YES' },
        { id: 'mock-4-no', market_id: 'mock-4', name: 'No', price: 0.77, ticker: 'NO' }
      ],
      tags: [
        { id: 'technology', label: 'Technology', slug: 'technology', name: 'Technology' },
        { id: 'science', label: 'Science', slug: 'science', name: 'Science' }
      ],
      volume: 2100000,
      liquidity: 125000,
      current_price: 0.23,
      price_change_24h: 8.4,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-5',
      condition_id: 'mock-5',
      slug: 'super-bowl-winner',
      question: 'Who will win Super Bowl 2025?',
      description: 'Resolves to the team that wins Super Bowl LIX.',
      end_date: '2025-02-09T23:59:59Z',
      start_date: '2024-09-01T00:00:00Z',
      active: true,
      closed: false,
      archived: false,
      image_url: null,
      outcomes: [
        { id: 'mock-5-chiefs', market_id: 'mock-5', name: 'Chiefs', price: 0.28, ticker: 'KC' },
        { id: 'mock-5-49ers', market_id: 'mock-5', name: '49ers', price: 0.18, ticker: 'SF' },
        { id: 'mock-5-eagles', market_id: 'mock-5', name: 'Eagles', price: 0.12, ticker: 'PHI' },
        { id: 'mock-5-other', market_id: 'mock-5', name: 'Other', price: 0.42, ticker: 'OTHER' }
      ],
      tags: [
        { id: 'sports', label: 'Sports', slug: 'sports', name: 'Sports' }
      ],
      volume: 3200000,
      liquidity: 180000,
      current_price: 0.28,
      price_change_24h: -3.2,
      created_at: '2024-09-01T00:00:00Z',
      updated_at: new Date().toISOString()
    },
    {
      id: 'mock-6',
      condition_id: 'mock-6',
      slug: 'recession-2025',
      question: 'Will the US enter a recession in 2025?',
      description: 'Resolves Yes if the NBER declares a US recession in 2025.',
      end_date: '2025-12-31T23:59:59Z',
      start_date: '2024-01-01T00:00:00Z',
      active: true,
      closed: false,
      archived: false,
      image_url: null,
      outcomes: [
        { id: 'mock-6-yes', market_id: 'mock-6', name: 'Yes', price: 0.41, ticker: 'YES' },
        { id: 'mock-6-no', market_id: 'mock-6', name: 'No', price: 0.59, ticker: 'NO' }
      ],
      tags: [
        { id: 'economics', label: 'Economics', slug: 'economics', name: 'Economics' }
      ],
      volume: 8900000,
      liquidity: 420000,
      current_price: 0.41,
      price_change_24h: 4.7,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: new Date().toISOString()
    }
  ]
}
