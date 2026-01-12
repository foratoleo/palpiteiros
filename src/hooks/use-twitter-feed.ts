/**
 * Use Twitter Feed Hook
 *
 * Custom React Query hook for fetching and managing Twitter feed data.
 * Provides auto-refresh, error handling, and category filtering.
 *
 * @feature TanStack Query v5 integration
 * @feature Auto-refresh with configurable interval
 * @feature Connection status tracking
 * @feature Category filtering
 */

import { useMemo, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { twitterService } from '@/services/twitter.service'
import type {
  EnrichedTweet,
  TwitterConnectionStatus,
  GetPolymarketTweetsRequest
} from '@/types/twitter.types'

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default cache time for tweets (5 minutes)
 */
export const TWITTER_CACHE_TIME = 5 * 60 * 1000

/**
 * Default stale time for tweets (2 minutes)
 */
export const TWITTER_STALE_TIME = 2 * 60 * 1000

/**
 * Default auto-refresh interval (5 minutes)
 */
export const TWITTER_REFRESH_INTERVAL = 5 * 60 * 1000

// ============================================================================
// QUERY KEYS
// ============================================================================

/**
 * Twitter query keys factory
 */
export const twitterKeys = {
  /**
   * Base key for all Twitter queries
   */
  all: ['twitter'] as const,

  /**
   * Key for tweet lists by username
   */
  tweets: (username: string, options?: Omit<GetPolymarketTweetsRequest, 'username'>) => [
    ...twitterKeys.all,
    'tweets',
    username,
    options
  ] as const,

  /**
   * Key for filtered tweets
   */
  filteredTweets: (
    username: string,
    category: 'Breaking news' | 'New polymarket' | 'all'
  ) => [
    ...twitterKeys.all,
    'filtered',
    username,
    category
  ] as const,
}

// ============================================================================
// USE TWITTER FEED HOOK
// ============================================================================

/**
 * Use Twitter Feed Hook Parameters
 */
export interface UseTwitterFeedParams {
  /** Username to fetch tweets from (default: 'polymarket') */
  username?: string
  /** Maximum number of tweets (default: 10, max: 100) */
  limit?: number
  /** Category filter: show only tweets matching this category */
  categoryFilter?: 'Breaking news' | 'New polymarket' | 'all'
  /** Auto-refresh enabled (default: false) */
  autoRefresh?: boolean
  /** Auto-refresh interval in milliseconds (default: 5 minutes) */
  refreshInterval?: number
  /** Whether to enable the query (pause if false) */
  enabled?: boolean
  /** Exclude replies from results (default: true) */
  excludeReplies?: boolean
  /** Exclude retweets from results (default: true) */
  excludeRetweets?: boolean
}

/**
 * Use Twitter Feed Hook Return Type
 */
export interface UseTwitterFeedReturn {
  /** Array of enriched tweets */
  tweets: EnrichedTweet[]
  /** Loading state (initial fetch) */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Connection status */
  status: TwitterConnectionStatus
  /** Whether data is currently refetching */
  isRefetching: boolean
  /** Manual refetch function */
  refetch: () => void
  /** Invalidate and refetch */
  invalidate: () => Promise<void>
  /** Clear cached data */
  clearCache: () => void
}

/**
 * Use Twitter Feed Hook
 *
 * Fetches tweets from a specified Twitter user with optional filtering.
 * Uses Twitter service with TanStack Query for caching and state management.
 *
 * @param params - Hook parameters
 * @returns Tweets data and query state
 *
 * @example
 * ```tsx
 * function TwitterFeed() {
 *   const { tweets, isLoading, error, status, refetch } = useTwitterFeed({
 *     username: 'polymarket',
 *     limit: 10,
 *     categoryFilter: 'all',
 *     autoRefresh: true,
 *     refreshInterval: 300000, // 5 minutes
 *   })
 *
 *   if (isLoading) return <TweetCardSkeleton count={3} />
 *   if (error) return <ErrorMessage error={error} />
 *
 *   return (
 *     <div>
 *       {tweets.map(tweet => (
 *         <TweetCard key={tweet.id} tweet={tweet} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useTwitterFeed(params: UseTwitterFeedParams = {}): UseTwitterFeedReturn {
  const {
    username = 'polymarket',
    limit = 10,
    categoryFilter = 'all',
    autoRefresh = false,
    refreshInterval = TWITTER_REFRESH_INTERVAL,
    enabled = true,
    excludeReplies = true,
    excludeRetweets = true,
  } = params

  const queryClient = useQueryClient()

  // Build query options for consistent query key
  const queryOptions = useMemo(
    () => ({
      limit,
      excludeReplies,
      excludeRetweets,
    }),
    [limit, excludeReplies, excludeRetweets]
  )

  // Fetch tweets using TanStack Query
  const {
    data: tweets = [],
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: twitterKeys.tweets(username, queryOptions),
    queryFn: async () => {
      const result = await twitterService.getTweets({
        username,
        ...queryOptions,
      })
      return result
    },
    staleTime: TWITTER_STALE_TIME,
    gcTime: TWITTER_CACHE_TIME,
    refetchInterval: autoRefresh ? refreshInterval : false,
    enabled,
    retry: (failureCount, error) => {
      // Don't retry on rate limit errors
      if (error instanceof Error && error.message.includes('Rate limit')) {
        return false
      }
      // Retry up to 2 times on other errors
      return failureCount < 2
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Get connection status from service
  const status: TwitterConnectionStatus = useMemo(() => {
    if (isLoading) return 'connecting'
    const serviceStatus = twitterService.getStatus()
    if (serviceStatus !== 'connecting') return serviceStatus
    return error ? 'error' : 'connected'
  }, [isLoading, error])

  // Invalidate and refetch
  const invalidate = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: twitterKeys.tweets(username, queryOptions),
    })
  }, [queryClient, username, queryOptions])

  // Clear cache
  const clearCache = useCallback(() => {
    twitterService.clearUserCache(username)
    queryClient.removeQueries({
      queryKey: twitterKeys.tweets(username, queryOptions),
    })
  }, [queryClient, username, queryOptions])

  // Filter tweets by category if specified
  const filteredTweets = useMemo(() => {
    if (categoryFilter === 'all') {
      return tweets
    }

    return tweets.filter(tweet => {
      const text = tweet.text.toLowerCase()
      if (categoryFilter === 'Breaking news') {
        const keywords = ['breaking', 'urgent', 'alert', '🚨', '⚡']
        return keywords.some(kw => text.includes(kw))
      }
      if (categoryFilter === 'New polymarket') {
        const keywords = ['new market', 'just launched', 'now live', '🆕']
        return keywords.some(kw => text.includes(kw))
      }
      return true
    })
  }, [tweets, categoryFilter])

  return {
    tweets: filteredTweets,
    isLoading,
    error,
    status,
    isRefetching,
    refetch,
    invalidate,
    clearCache,
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * Use Polymarket Tweets Hook
 *
 * Convenience hook for fetching @polymarket tweets with default settings.
 *
 * @param params - Optional override parameters
 * @returns Tweets data and query state
 *
 * @example
 * ```tsx
 * function PolymarketFeed() {
 *   const { tweets, isLoading } = usePolymarketTweets({ limit: 5 })
 *
 *   return (
 *     <div>
 *       {tweets.map(tweet => (
 *         <TweetCard key={tweet.id} tweet={tweet} />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function usePolymarketTweets(
  params?: Omit<UseTwitterFeedParams, 'username'>
): UseTwitterFeedReturn {
  return useTwitterFeed({
    username: 'polymarket',
    ...params,
  })
}

/**
 * Use Breaking News Tweets Hook
 *
 * Convenience hook for fetching only breaking news tweets.
 *
 * @param params - Optional override parameters
 * @returns Tweets data and query state
 *
 * @example
 * ```tsx
 * function BreakingNewsFeed() {
 *   const { tweets, isLoading } = useBreakingNewsTweets({ limit: 5 })
 *
 *   return (
 *     <div>
 *       {tweets.map(tweet => (
 *         <TweetCard key={tweet.id} tweet={tweet} showCategory />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useBreakingNewsTweets(
  params?: Omit<UseTwitterFeedParams, 'username' | 'categoryFilter'>
): UseTwitterFeedReturn {
  return useTwitterFeed({
    username: 'polymarket',
    categoryFilter: 'Breaking news',
    ...params,
  })
}

/**
 * Use New Market Tweets Hook
 *
 * Convenience hook for fetching only new market announcement tweets.
 *
 * @param params - Optional override parameters
 * @returns Tweets data and query state
 *
 * @example
 * ```tsx
 * function NewMarketsFeed() {
 *   const { tweets, isLoading } = useNewMarketTweets({ limit: 5 })
 *
 *   return (
 *     <div>
 *       {tweets.map(tweet => (
 *         <TweetCard key={tweet.id} tweet={tweet} showCategory />
 *       ))}
 *     </div>
 *   )
 * }
 * ```
 */
export function useNewMarketTweets(
  params?: Omit<UseTwitterFeedParams, 'username' | 'categoryFilter'>
): UseTwitterFeedReturn {
  return useTwitterFeed({
    username: 'polymarket',
    categoryFilter: 'New polymarket',
    ...params,
  })
}

// ============================================================================
// PREFETCH HELPER
// ============================================================================

/**
 * Prefetch Twitter feed data
 *
 * Use this to prefetch tweets before they're needed (e.g., on hover).
 * Requires a QueryClient instance to be passed in.
 *
 * @param queryClient - TanStack Query client instance
 * @param username - Twitter username
 * @param options - Optional fetch parameters
 *
 * @example
 * ```tsx
 * import { useQueryClient } from '@tanstack/react-query'
 * import { prefetchTwitterFeed } from '@/hooks'
 *
 * function NavigationItem() {
 *   const queryClient = useQueryClient()
 *
 *   return (
 *     <div
 *       onMouseEnter={() => prefetchTwitterFeed(queryClient, 'polymarket', { limit: 10 })}
 *     >
 *       <Link href="/breaking">Breaking News</Link>
 *     </div>
 *   )
 * }
 * ```
 */
export function prefetchTwitterFeed(
  queryClient: ReturnType<typeof useQueryClient>,
  username: string,
  options?: Omit<GetPolymarketTweetsRequest, 'username'>
): void {
  queryClient.prefetchQuery({
    queryKey: twitterKeys.tweets(username, options),
    queryFn: async () => {
      const result = await twitterService.getTweets({
        username,
        ...options,
      })
      return result
    },
    staleTime: TWITTER_STALE_TIME,
  })
}
