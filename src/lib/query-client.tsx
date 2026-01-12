/**
 * TanStack Query Client Configuration
 *
 * Configures React Query (TanStack Query v5) for the Polymarket clone application.
 * Provides optimized caching, retry logic, and error boundary integration.
 *
 * @see https://tanstack.com/query/latest/docs/react/overview
 */

import { QueryClient, QueryClientProvider as QueryClientProviderBase } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { type ReactNode } from 'react'

// ============================================================================
// QUERY CLIENT CONFIGURATION
// ============================================================================

/**
 * Cache time constants for different data types
 *
 * Defines how long data should be cached before being garbage collected.
 */
export const CACHE_TIMES = {
  /** Markets data - 10 minutes */
  MARKETS: 10 * 60 * 1000,
  /** Market prices - 5 minutes */
  PRICES: 5 * 60 * 1000,
  /** Price history - 30 minutes */
  PRICE_HISTORY: 30 * 60 * 1000,
  /** Portfolio data - 2 minutes */
  PORTFOLIO: 2 * 60 * 1000,
  /** User data - 5 minutes */
  USER: 5 * 60 * 1000,
  /** Alerts data - 5 minutes */
  ALERTS: 5 * 60 * 1000
} as const

/**
 * Stale time constants for different data types
 *
 * Defines how long data remains "fresh" before refetching in background.
 */
export const STALE_TIMES = {
  /** Markets data - 5 minutes (don't refetch if newer than 5 min) */
  MARKETS: 5 * 60 * 1000,
  /** Market prices - 1 minute (prices change frequently) */
  PRICES: 1 * 60 * 1000,
  /** Price history - 10 minutes (historical data rarely changes) */
  PRICE_HISTORY: 10 * 60 * 1000,
  /** Portfolio data - 30 seconds (user positions change often) */
  PORTFOLIO: 30 * 1000,
  /** User data - 5 minutes */
  USER: 5 * 60 * 1000,
  /** Alerts data - 2 minutes */
  ALERTS: 2 * 60 * 1000
} as const

/**
 * Create and configure the QueryClient instance
 *
 * Features:
 * - Optimized cache times per data type
 * - Intelligent retry logic with exponential backoff
 * - Error detection and handling
 * - Development-only devtools integration
 *
 * @returns Configured QueryClient instance
 *
 * @example
 * ```ts
 * import { queryClient } from '@/lib/query-client'
 *
 * // Prefetch data on server
 * await queryClient.prefetchQuery({
 *   queryKey: ['markets'],
 *   queryFn: fetchMarkets
 * })
 * ```
 */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        /**
         * Stale time: Data is fresh for 5 minutes by default
         * Data will not be refetched if less than 5 minutes old
         */
        staleTime: STALE_TIMES.MARKETS,

        /**
         * GC Time: Garbage collection time (cacheTime in v4)
         * Inactive queries are removed from cache after 10 minutes
         */
        gcTime: CACHE_TIMES.MARKETS,

        /**
         * Retry configuration
         * - Retry failed requests up to 3 times
         * - Use exponential backoff: 1s, 2s, 4s
         * - Don't retry 4xx errors (client errors)
         */
        retry: (failureCount, error) => {
          // Don't retry on 4xx errors (client errors)
          if (error && typeof error === 'object' && 'status' in error) {
            const status = (error as { status: number }).status
            if (status >= 400 && status < 500) {
              return false
            }
          }
          // Retry up to 3 times for other errors
          return failureCount < 3
        },

        /**
         * Retry delay with exponential backoff
         * - Attempt 1: 1000ms (1 second)
         * - Attempt 2: 2000ms (2 seconds)
         * - Attempt 3: 4000ms (4 seconds)
         */
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

        /**
         * Refetch on window focus
         * Disabled by default for better UX
         * Enable selectively for critical data
         */
        refetchOnWindowFocus: false,

        /**
         * Refetch on reconnect
         * Refetch all queries when internet connection is restored
         */
        refetchOnReconnect: true,

        /**
         * Refetch on mount
         * Only refetch if data is stale
         */
        refetchOnMount: true,

        /**
         * Network mode
         * - 'online': Only fetch when online
         * - 'always': Fetch even if offline (for cached data)
         * - 'offline-first': Use offline cache, then update in background
         */
        networkMode: 'online',

        /**
         * Error boundary integration
         * Propagate errors to React error boundary for better UX
         */
        throwOnError: false
      },

      mutations: {
        /**
         * Retry mutations
         * Mutations (writes) should be retried more aggressively
         */
        retry: 1,

        /**
         * Mutation error propagation
         * Errors are thrown to be handled by the mutation caller
         */
        throwOnError: true,

        /**
         * Network mode for mutations
         * Require online connection for mutations
         */
        networkMode: 'online'
      }
    }
  })
}

/**
 * Browser query client singleton
 *
 * Single instance shared across all browser components
 * Prevents duplicate QueryClient instances
 */
let browserQueryClient: QueryClient | undefined = undefined

/**
 * Get or create the browser QueryClient instance
 *
 * Uses singleton pattern to ensure only one QueryClient exists
 * in the browser, preventing duplicate queries and cache issues.
 *
 * @returns QueryClient instance
 *
 * @example
 * ```ts
 * import { getQueryClient } from '@/lib/query-client'
 *
 * const queryClient = getQueryClient()
 * ```
 */
export function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server side: always create a new client
    return makeQueryClient()
  } else {
    // Browser side: reuse existing client or create new one
    if (!browserQueryClient) {
      browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
  }
}

/**
 * Singleton query client for direct imports
 *
 * Use this for direct access to the query client instance.
 * For most cases, use the useQueryClient hook instead.
 *
 * @example
 * ```ts
 * import { queryClient } from '@/lib/query-client'
 *
 * // Prefetch data
 * queryClient.prefetchQuery({
 *   queryKey: ['markets'],
 *   queryFn: fetchMarkets
 * })
 *
 * // Invalidate cache
 * queryClient.invalidateQueries({
 *   queryKey: ['markets']
 * })
 *
 * // Set data manually
 * queryClient.setQueryData(['markets', 'market-123'], marketData)
 * ```
 */
export const queryClient = getQueryClient()

// ============================================================================
// QUERY CLIENT PROVIDER
// ============================================================================

/**
 * QueryClientProvider Props
 */
interface QueryClientProviderProps {
  /** React children to be wrapped with query context */
  children: ReactNode
}

/**
 * QueryClient Provider Component
 *
 * Wraps the application with TanStack Query context.
 * Enables useQuery, useMutation, and other hooks throughout the app.
 *
 * Includes React Query Devtools in development mode for debugging.
 *
 * @example
 * ```tsx
 * import { QueryClientProvider } from '@/lib/query-client'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <QueryClientProvider>
 *       {children}
 *     </QueryClientProvider>
 *   )
 * }
 * ```
 */
export function QueryClientProvider({ children }: QueryClientProviderProps) {
  // Get or create the query client
  const client = getQueryClient()

  return (
    <QueryClientProviderBase client={client}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools
          position={"bottom-right" as any}
          initialIsOpen={false}
          buttonPosition={{
            bottom: 16,
            right: 16
          } as any}
        />
      )}
    </QueryClientProviderBase>
  )
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Invalidate queries by key prefix
 *
 * Helper function to invalidate all queries matching a key prefix.
 * Useful for batch cache invalidation after data mutations.
 *
 * @param keyPrefix - Query key prefix to match
 * @example
 * ```ts
 * import { invalidateQueries } from '@/lib/query-client'
 *
 * // Invalidate all market-related queries
 * await invalidateQueries('markets')
 *
 * // Invalidate all portfolio queries
 * await invalidateQueries('portfolio')
 * ```
 */
export async function invalidateQueries(keyPrefix: string) {
  await queryClient.invalidateQueries({
    predicate: (query) => {
      const queryKey = query.queryKey[0] as string
      return typeof queryKey === 'string' && queryKey.startsWith(keyPrefix)
    }
  })
}

/**
 * Cancel queries by key prefix
 *
 * Helper function to cancel all ongoing queries matching a key prefix.
 * Useful for canceling stale requests before new ones.
 *
 * @param keyPrefix - Query key prefix to match
 * @example
 * ```ts
 * import { cancelQueries } from '@/lib/query-client'
 *
 * // Cancel all market queries
 * await cancelQueries('markets')
 * ```
 */
export async function cancelQueries(keyPrefix: string) {
  await queryClient.cancelQueries({
    predicate: (query) => {
      const queryKey = query.queryKey[0] as string
      return typeof queryKey === 'string' && queryKey.startsWith(keyPrefix)
    }
  })
}

/**
 * Clear all query cache
 *
 * Removes all data from the query cache.
 * Use sparingly - prefer selective invalidation.
 *
 * @example
 * ```ts
 * import { clearCache } from '@/lib/query-client'
 *
 * // Log out user - clear all cache
 * clearCache()
 * ```
 */
export function clearCache() {
  queryClient.clear()
}

/**
 * Reset queries by key prefix
 *
 * Resets queries to their initial state (refetches on next mount).
 * Unlike invalidation, this removes the data from cache immediately.
 *
 * @param keyPrefix - Query key prefix to match
 * @example
 * ```ts
 * import { resetQueries } from '@/lib/query-client'
 *
 * // Reset all portfolio queries
 * await resetQueries('portfolio')
 * ```
 */
export async function resetQueries(keyPrefix: string) {
  await queryClient.resetQueries({
    predicate: (query) => {
      const queryKey = query.queryKey[0] as string
      return typeof queryKey === 'string' && queryKey.startsWith(keyPrefix)
    }
  })
}

/**
 * Set query data with typing
 *
 * Helper function to manually set query data with proper typing.
 * Useful for optimistic updates or SSR hydration.
 *
 * @param queryKey - Query key array
 * @param data - Data to set in cache
 * @example
 * ```ts
 * import { setQueryData } from '@/lib/query-client'
 *
 * // Optimistic update
 * setQueryData(['markets', 'market-123'], (prev) => ({
 *   ...prev,
 *   price: newPrice
 * }))
 * ```
 */
export function setQueryData<T>(queryKey: unknown[], data: T | ((old: T | undefined) => T)) {
  queryClient.setQueryData<T>(queryKey, data)
}

/**
 * Get query data with typing
 *
 * Helper function to retrieve cached query data with proper typing.
 *
 * @param queryKey - Query key array
 * @returns Cached data or undefined
 * @example
 * ```ts
 * import { getQueryData } from '@/lib/query-client'
 *
 * const market = getQueryData<Market>(['markets', 'market-123'])
 * if (market) {
 *   console.log('Cached market:', market)
 * }
 * ```
 */
export function getQueryData<T>(queryKey: unknown[]): T | undefined {
  return queryClient.getQueryData<T>(queryKey)
}
