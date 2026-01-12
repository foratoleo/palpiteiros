/**
 * Custom Hooks Barrel Export
 *
 * Centralizes all custom React hooks for easy imports.
 * Includes TanStack Query integration hooks for market data and alert monitoring.
 * Also includes toast notification hooks for user feedback.
 *
 * @example
 * ```ts
 * import {
 *   useMarkets,
 *   useMarket,
 *   useMarketHistory,
 *   useAlertChecker,
 *   useToast,
 *   useToastNotification
 * } from '@/hooks'
 * ```
 */

// ============================================================================
// MARKET HOOKS
// ============================================================================

export { useMarkets, useMarketsInfinite, useSortedMarkets, useToggleFavoriteMarket } from './use-markets'
export { useMarket, useMarketBySlug, useMarketWithStats, useMultipleMarkets } from './use-market'
export { useMarketHistory, useMarketHistoryAggregated, useMarketHistoryStats, prefetchMarketHistory } from './use-market-history'

// ============================================================================
// BREAKING MARKETS HOOKS
// ============================================================================

/**
 * Breaking Markets Hooks
 *
 * Custom hooks for fetching and managing breaking markets data.
 * Breaking markets are those with significant price movements, volume changes,
 * or volatility within a specified time range.
 *
 * @see /hooks/use-breaking-markets.ts
 *
 * @example
 * ```tsx
 * import { useBreakingMarkets, useBreakingMarket, useBreakingRealtime } from '@/hooks'
 *
 * // Fetch breaking markets list
 * const { markets, isLoading } = useBreakingMarkets({
 *   filters: { minPriceChange: 0.10, timeRange: '24h' },
 *   limit: 20
 * })
 *
 * // Fetch single breaking market
 * const { market } = useBreakingMarket({ marketId: 'market-123' })
 *
 * // Subscribe to real-time updates
 * const { isConnected, markets: liveMarkets } = useBreakingRealtime({
 *   enabled: true,
 *   onPriceChange: (market) => console.log('Price updated:', market.price_change_24h)
 * })
 * ```
 */
export {
  useBreakingMarkets,
  useBreakingMarket,
  useBreakingRealtime,
  useBreakingMarketsSorted,
  useBreakingMarketsTrending,
  useBreakingMarketsByCategory
} from './use-breaking-markets'

/**
 * Breaking Markets Hook Types
 *
 * TypeScript types for breaking markets hooks.
 */
export type {
  UseBreakingMarketsParams,
  UseBreakingMarketsReturn,
  UseBreakingMarketParams,
  UseBreakingMarketReturn,
  UseBreakingRealtimeParams,
  UseBreakingRealtimeReturn
} from './use-breaking-markets'

// ============================================================================
// ALERT HOOKS
// ============================================================================

export {
  useAlertChecker,
  useAlertCheckerSimple,
  useAlertCheckerForMarkets,
  useAlertCheckerWithPush
} from './use-alert-checker'
export type { UseAlertCheckerOptions, AlertCheckerState } from './use-alert-checker'

// ============================================================================
// TOAST HOOKS
// ============================================================================

export {
  useToast,
  toast,
  useToastSuccess,
  useToastError,
  useToastWarning,
  useToastInfo,
  useToastPromise,
} from '@/components/toast/use-toast'

export {
  useToastNotification,
  useToastNotificationConfig,
  toastManager,
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyLoading,
  notifyPromise,
  dismissAllNotifications,
  dismissNotification,
} from '@/components/toast/use-toast-notification'

export type {
  ToastNotificationOptions,
  ToastNotificationManagerConfig,
} from '@/components/toast/use-toast-notification'

// ============================================================================
// UTILITY HOOKS
// ============================================================================

export {
  useDebounce
} from './use-debounce'

// ============================================================================
// TWITTER/X HOOKS
// ============================================================================

/**
 * Twitter/X Feed Hooks
 *
 * Custom hooks for fetching and managing Twitter/X data.
 * Integrates with Twitter API v2 via Supabase Edge Function.
 *
 * @see /hooks/use-twitter-feed.ts
 *
 * @example
 * ```tsx
 * import { useTwitterFeed, usePolymarketTweets, useBreakingNewsTweets } from '@/hooks'
 *
 * // Fetch tweets from any user
 * const { tweets, isLoading, error, status } = useTwitterFeed({
 *   username: 'polymarket',
 *   limit: 10,
 *   autoRefresh: true,
 *   categoryFilter: 'all'
 * })
 *
 * // Convenience: fetch @polymarket tweets
 * const { tweets: polymarketTweets } = usePolymarketTweets({ limit: 5 })
 *
 * // Convenience: fetch only breaking news tweets
 * const { tweets: breakingTweets } = useBreakingNewsTweets({ limit: 5 })
 * ```
 */
export {
  useTwitterFeed,
  usePolymarketTweets,
  useBreakingNewsTweets,
  useNewMarketTweets,
  prefetchTwitterFeed
} from './use-twitter-feed'

export type {
  UseTwitterFeedParams,
  UseTwitterFeedReturn
} from './use-twitter-feed'

export {
  TWITTER_CACHE_TIME,
  TWITTER_STALE_TIME,
  TWITTER_REFRESH_INTERVAL
} from './use-twitter-feed'

export {
  useMarketSearch,
  useMarketSearchSimple,
  useMarketSearchFuzzy
} from './use-market-search'

export type {
  UseMarketSearchOptions,
  MarketSearchResult,
  UseMarketSearchReturn
} from './use-market-search'

// ============================================================================
// PERFORMANCE HOOKS (T17)
// ============================================================================

export {
  useDeferredValue,
  useDebouncedCallback,
  useDebouncedValue,
  useThrottledCallback,
  useThrottledValue,
  useIdleCallback,
  useMediaQuery,
  useBreakpoint,
  usePrevious,
  useRenderCounter,
  useRenderOnce,
  useConditionalEffect,
  useFirstMountState,
  useIsMounted,
  useSafeState
} from './use-performance'
