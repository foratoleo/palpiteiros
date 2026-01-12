/**
 * Query Keys for TanStack Query
 *
 * Type-safe query key factory for TanStack Query cache management.
 * Provides structured, hierarchical query keys for efficient cache
 * invalidation and refetching.
 *
 * @see https://tanstack.com/query/latest/docs/react/guides/query-keys
 */

import type {
  MarketFilterOptions,
  MarketSortOption,
  MarketTimeRange
} from '@/types/market.types'
import type { PositionFilters, PositionSortOptions } from '@/types/portfolio.types'
import type { AlertFilters, AlertSortOptions } from '@/types/alert.types'
import type { BreakingFilters } from '@/types/breaking.types'
import type { GetPolymarketTweetsRequest } from '@/types/twitter.types'

// ============================================================================
// QUERY KEY FACTORIES
// ============================================================================

/**
 * Markets Query Keys
 *
 * Query keys for market-related data fetching.
 * Supports filtering, sorting, pagination, and search.
 */
export const marketKeys = {
  /**
   * Base key for all market queries
   */
  all: ['markets'] as const,

  /**
   * Key for lists of markets (market list page)
   *
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.lists({ active: true, category: 'crypto' })
   * ```
   */
  lists: (filters?: MarketFilterOptions) => [
    ...marketKeys.all,
    'list',
    filters
  ] as const,

  /**
   * Key for list pagination
   *
   * @param filters - Filter options
   * @param page - Page number
   * @param limit - Items per page
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.paginatedList({ active: true }, 1, 20)
   * ```
   */
  paginatedList: (
    filters: MarketFilterOptions,
    page: number,
    limit: number
  ) => [
    ...marketKeys.all,
    'list',
    'paginated',
    filters,
    page,
    limit
  ] as const,

  /**
   * Key for infinite scroll market lists
   *
   * @param filters - Filter options
   * @returns Query key array for infinite queries
   *
   * @example
   * ```ts
   * queryKey: marketKeys.infiniteLists({ active: true })
   * ```
   */
  infiniteLists: (filters?: MarketFilterOptions) => [
    ...marketKeys.all,
    'list',
    'infinite',
    filters
  ] as const,

  /**
   * Key for sorted market lists
   *
   * @param sort - Sort options
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.sorted({ field: 'volume', direction: 'desc' })
   * ```
   */
  sorted: (sort: MarketSortOption, filters?: MarketFilterOptions) => [
    ...marketKeys.all,
    'list',
    'sorted',
    sort,
    filters
  ] as const,

  /**
   * Key for single market details
   *
   * @param marketId - Market ID or slug
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.detail('market-123')
   * ```
   */
  detail: (marketId: string) => [
    ...marketKeys.all,
    'detail',
    marketId
  ] as const,

  /**
   * Key for market price history
   *
   * @param marketId - Market ID
   * @param timeRange - Time range for history
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.history('market-123', '7d')
   * ```
   */
  history: (marketId: string, timeRange: MarketTimeRange) => [
    ...marketKeys.all,
    'history',
    marketId,
    timeRange
  ] as const,

  /**
   * Key for market statistics
   *
   * @param marketId - Market ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.stats('market-123')
   * ```
   */
  stats: (marketId: string) => [
    ...marketKeys.all,
    'stats',
    marketId
  ] as const,

  /**
   * Key for market search results
   *
   * @param query - Search query string
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.search('Bitcoin')
   * ```
   */
  search: (query: string) => [
    ...marketKeys.all,
    'search',
    query
  ] as const,

  /**
   * Key for markets by tag/category
   *
   * @param tag - Tag or category slug
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.byTag('crypto')
   * ```
   */
  byTag: (tag: string) => [
    ...marketKeys.all,
    'byTag',
    tag
  ] as const,

  /**
   * Key for active markets
   *
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.active()
   * ```
   */
  active: () => [
    ...marketKeys.all,
    'active'
  ] as const,

  /**
   * Key for markets closing soon
   *
   * @param hours - Hours threshold (default: 24)
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.closingSoon(24)
   * ```
   */
  closingSoon: (hours: number = 24) => [
    ...marketKeys.all,
    'closingSoon',
    hours
  ] as const,

  /**
   * Key for popular/high-volume markets
   *
   * @param limit - Number of markets to return
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: marketKeys.popular(20)
   * ```
   */
  popular: (limit: number = 20) => [
    ...marketKeys.all,
    'popular',
    limit
  ] as const
}

/**
 * Portfolio Query Keys
 *
 * Query keys for user portfolio and position data.
 */
export const portfolioKeys = {
  /**
   * Base key for all portfolio queries
   */
  all: ['portfolio'] as const,

  /**
   * Key for complete portfolio summary
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.summary('user-123')
   * ```
   */
  summary: (userId: string) => [
    ...portfolioKeys.all,
    'summary',
    userId
  ] as const,

  /**
   * Key for portfolio performance metrics
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.performance('user-123')
   * ```
   */
  performance: (userId: string) => [
    ...portfolioKeys.all,
    'performance',
    userId
  ] as const,

  /**
   * Key for position lists with filters
   *
   * @param userId - User ID
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.positions('user-123', { status: 'active' })
   * ```
   */
  positions: (userId: string, filters?: PositionFilters) => [
    ...portfolioKeys.all,
    'positions',
    userId,
    filters
  ] as const,

  /**
   * Key for sorted positions
   *
   * @param userId - User ID
   * @param sort - Sort options
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.sortedPositions('user-123', { field: 'pnl', direction: 'desc' })
   * ```
   */
  sortedPositions: (
    userId: string,
    sort: PositionSortOptions,
    filters?: PositionFilters
  ) => [
    ...portfolioKeys.all,
    'positions',
    'sorted',
    userId,
    sort,
    filters
  ] as const,

  /**
   * Key for single position details
   *
   * @param positionId - Position ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.positionDetail('pos-123')
   * ```
   */
  positionDetail: (positionId: string) => [
    ...portfolioKeys.all,
    'position',
    positionId
  ] as const,

  /**
   * Key for portfolio history
   *
   * @param userId - User ID
   * @param timeRange - Time range for history
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.history('user-123', '30d')
   * ```
   */
  history: (userId: string, timeRange: MarketTimeRange) => [
    ...portfolioKeys.all,
    'history',
    userId,
    timeRange
  ] as const,

  /**
   * Key for portfolio analytics
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.analytics('user-123')
   * ```
   */
  analytics: (userId: string) => [
    ...portfolioKeys.all,
    'analytics',
    userId
  ] as const,

  /**
   * Key for PnL breakdown
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: portfolioKeys.pnlBreakdown('user-123')
   * ```
   */
  pnlBreakdown: (userId: string) => [
    ...portfolioKeys.all,
    'pnl',
    userId
  ] as const
}

/**
 * Alert Query Keys
 *
 * Query keys for price alerts and notifications.
 */
export const alertKeys = {
  /**
   * Base key for all alert queries
   */
  all: ['alerts'] as const,

  /**
   * Key for user's alert list
   *
   * @param userId - User ID
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: alertKeys.lists('user-123', { triggered: false })
   * ```
   */
  lists: (userId: string, filters?: AlertFilters) => [
    ...alertKeys.all,
    'list',
    userId,
    filters
  ] as const,

  /**
   * Key for sorted alerts
   *
   * @param userId - User ID
   * @param sort - Sort options
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: alertKeys.sorted('user-123', { field: 'created_at', direction: 'desc' })
   * ```
   */
  sorted: (
    userId: string,
    sort: AlertSortOptions,
    filters?: AlertFilters
  ) => [
    ...alertKeys.all,
    'list',
    'sorted',
    userId,
    sort,
    filters
  ] as const,

  /**
   * Key for single alert details
   *
   * @param alertId - Alert ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: alertKeys.detail('alert-123')
   * ```
   */
  detail: (alertId: string) => [
    ...alertKeys.all,
    'detail',
    alertId
  ] as const,

  /**
   * Key for alerts for a specific market
   *
   * @param marketId - Market ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: alertKeys.byMarket('market-123')
   * ```
   */
  byMarket: (marketId: string) => [
    ...alertKeys.all,
    'byMarket',
    marketId
  ] as const,

  /**
   * Key for alert statistics
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: alertKeys.statistics('user-123')
   * ```
   */
  statistics: (userId: string) => [
    ...alertKeys.all,
    'statistics',
    userId
  ] as const,

  /**
   * Key for alert history
   *
   * @param alertId - Alert ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: alertKeys.history('alert-123')
   * ```
   */
  history: (alertId: string) => [
    ...alertKeys.all,
    'history',
    alertId
  ] as const
}

/**
 * User Query Keys
 *
 * Query keys for user data and preferences.
 */
export const userKeys = {
  /**
   * Base key for all user queries
   */
  all: ['user'] as const,

  /**
   * Key for user profile data
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: userKeys.profile('user-123')
   * ```
   */
  profile: (userId: string) => [
    ...userKeys.all,
    'profile',
    userId
  ] as const,

  /**
   * Key for user preferences
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: userKeys.preferences('user-123')
   * ```
   */
  preferences: (userId: string) => [
    ...userKeys.all,
    'preferences',
    userId
  ] as const,

  /**
   * Key for user settings
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: userKeys.settings('user-123')
   * ```
   */
  settings: (userId: string) => [
    ...userKeys.all,
    'settings',
    userId
  ] as const,

  /**
   * Key for user activity log
   *
   * @param userId - User ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: userKeys.activity('user-123')
   * ```
   */
  activity: (userId: string) => [
    ...userKeys.all,
    'activity',
    userId
  ] as const
}

/**
 * Gamma API Query Keys
 *
 * Query keys specifically for Gamma API (Polymarket external API).
 * Separated from database market keys for independent caching.
 */
export const gammaKeys = {
  /**
   * Base key for all Gamma API queries
   */
  all: ['gamma'] as const,

  /**
   * Key for Gamma markets list
   *
   * @param params - Query parameters
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: gammaKeys.markets({ active: true, limit: 20 })
   * ```
   */
  markets: (params?: Record<string, unknown>) => [
    ...gammaKeys.all,
    'markets',
    params
  ] as const,

  /**
   * Key for single Gamma market
   *
   * @param slug - Market slug
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: gammaKeys.market('btc-price-above-100k')
   * ```
   */
  market: (slug: string) => [
    ...gammaKeys.all,
    'market',
    slug
  ] as const,

  /**
   * Key for Gamma events
   *
   * @param slug - Optional event slug
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: gammaKeys.events('us-election')
   * ```
   */
  events: (slug?: string) => [
    ...gammaKeys.all,
    'events',
    slug
  ] as const,

  /**
   * Key for tag statistics
   *
   * @param tagSlug - Tag slug
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: gammaKeys.tagStats('crypto')
   * ```
   */
  tagStats: (tagSlug: string) => [
    ...gammaKeys.all,
    'stats',
    tagSlug
  ] as const
}

/**
 * Breaking Markets Query Keys
 *
 * Query keys for breaking markets with significant price movements.
 * Separated from regular market keys for independent caching and refresh.
 */
export const breakingKeys = {
  /**
   * Base key for all breaking markets queries
   */
  all: ['breaking'] as const,

  /**
   * Key for lists of breaking markets with filters
   *
   * @param filters - Optional filter options
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: breakingKeys.lists({ minPriceChange: 0.10, timeRange: '24h' })
   * ```
   */
  lists: (filters?: BreakingFilters) => [
    ...breakingKeys.all,
    'list',
    filters
  ] as const,

  /**
   * Key for single breaking market details
   *
   * @param marketId - Market ID
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: breakingKeys.detail('market-123')
   * ```
   */
  detail: (marketId: string) => [
    ...breakingKeys.all,
    'detail',
    marketId
  ] as const,

  /**
   * Key for trending breaking markets
   *
   * @param limit - Number of markets to return
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: breakingKeys.trending(20)
   * ```
   */
  trending: (limit: number = 20) => [
    ...breakingKeys.all,
    'trending',
    limit
  ] as const,

  /**
   * Key for time-range filtered breaking markets
   *
   * @param hours - Time range in hours
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: breakingKeys.timeRange(24) // Last 24 hours
   * ```
   */
  timeRange: (hours: number) => [
    ...breakingKeys.all,
    'timeRange',
    hours
  ] as const,

  /**
   * Key for breaking markets by trend direction
   *
   * @param trend - Trend direction ('up', 'down', 'neutral')
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: breakingKeys.byTrend('up')
   * ```
   */
  byTrend: (trend: 'up' | 'down' | 'neutral') => [
    ...breakingKeys.all,
    'byTrend',
    trend
  ] as const,

  /**
   * Key for breaking markets by category
   *
   * @param category - Category slug
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: breakingKeys.byCategory('crypto')
   * ```
   */
  byCategory: (category: string) => [
    ...breakingKeys.all,
    'byCategory',
    category
  ] as const
}

/**
 * Twitter/X Query Keys
 *
 * Query keys for Twitter API v2 data fetching.
 */
export const twitterKeys = {
  /**
   * Base key for all Twitter queries
   */
  all: ['twitter'] as const,

  /**
   * Key for tweet lists by username
   *
   * @param username - Twitter username (without @)
   * @param options - Optional fetch parameters
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: twitterKeys.tweets('polymarket', { limit: 10, excludeReplies: true })
   * ```
   */
  tweets: (
    username: string,
    options?: Omit<GetPolymarketTweetsRequest, 'username'>
  ) => [
    ...twitterKeys.all,
    'tweets',
    username,
    options
  ] as const,

  /**
   * Key for filtered tweets by category
   *
   * @param username - Twitter username
   * @param category - Category filter ('Breaking news', 'New polymarket', 'all')
   * @returns Query key array
   *
   * @example
   * ```ts
   * queryKey: twitterKeys.filteredTweets('polymarket', 'Breaking news')
   * ```
   */
  filteredTweets: (
    username: string,
    category: 'Breaking news' | 'New polymarket' | 'all'
  ) => [
    ...twitterKeys.all,
    'filtered',
    username,
    category
  ] as const
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all query keys for a namespace
 *
 * Useful for batch invalidation of all queries in a category.
 *
 * @param namespace - Query namespace ('markets', 'portfolio', etc.)
 * @returns Query key base array
 *
 * @example
 * ```ts
 * import { getBaseKey } from '@/lib/query-keys'
 * import { queryClient } from '@/lib/query-client'
 *
 * // Invalidate all market queries
 * queryClient.invalidateQueries({
 *   queryKey: getBaseKey('markets')
 * })
 * ```
 */
export function getBaseKey(namespace: 'markets' | 'portfolio' | 'alerts' | 'user' | 'gamma' | 'breaking' | 'twitter') {
  switch (namespace) {
    case 'markets':
      return marketKeys.all
    case 'portfolio':
      return portfolioKeys.all
    case 'alerts':
      return alertKeys.all
    case 'user':
      return userKeys.all
    case 'gamma':
      return gammaKeys.all
    case 'breaking':
      return breakingKeys.all
    case 'twitter':
      return twitterKeys.all
  }
}

/**
 * Type for query key inference
 *
 * Helps TypeScript infer query key types for useMutation and useQuery.
 */
export type QueryKey = readonly unknown[]
