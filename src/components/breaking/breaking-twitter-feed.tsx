/**
 * Breaking Twitter Feed Component
 *
 * Displays a live feed of tweets from a specified Twitter account
 * (default: @polymarket) with auto-refresh capabilities.
 *
 * @features
 * - Fetches tweets on mount
 * - Auto-refresh every 5 minutes (configurable)
 * - Loading skeleton state
 * - Error state with retry button
 * - Connection status indicator
 * - Responsive grid layout
 * - Category filtering (Breaking news / New polymarket)
 * - Glassmorphism design
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff,
  XCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TweetCard } from './tweet-card'
import type { EnrichedTweet, TwitterConnectionStatus } from '@/types/twitter.types'

/**
 * BreakingTwitterFeed Props
 */
export interface BreakingTwitterFeedProps {
  /** Username to fetch tweets from (default: 'polymarket') */
  username?: string
  /** Maximum number of tweets to fetch (default: 10, max: 100) */
  limit?: number
  /** Auto-refresh enabled (default: true) */
  autoRefresh?: boolean
  /** Auto-refresh interval in milliseconds (default: 300000 = 5 min) */
  refreshInterval?: number
  /** Show connection status indicator (default: true) */
  showStatus?: boolean
  /** Category filter: show only tweets matching this category */
  categoryFilter?: 'Breaking news' | 'New polymarket' | 'all'
  /** Compact card variant */
  compact?: boolean
  /** Grid layout: 'grid' for responsive grid, 'list' for single column */
  layout?: 'grid' | 'list'
  /** Show media attachments (default: true) */
  showMedia?: boolean
  /** Show engagement metrics (default: true) */
  showMetrics?: boolean
  /** Show category badges (default: true) */
  showCategory?: boolean
  /** Additional CSS class names */
  className?: string
  /** Custom fetch function (for testing or override) */
  fetchTweets?: (username: string, limit: number) => Promise<EnrichedTweet[]>
}

/**
 * Connection Status Indicator Props
 */
interface ConnectionStatusProps {
  status: TwitterConnectionStatus
  lastUpdated: string | null
}

/**
 * Connection Status Indicator Component
 */
function ConnectionStatus({ status, lastUpdated }: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'connecting':
        return {
          icon: Loader2,
          label: 'Connecting...',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/10',
          animate: true,
        }
      case 'connected':
        return {
          icon: Wifi,
          label: 'Live',
          color: 'text-green-400',
          bgColor: 'bg-green-400/10',
          animate: false,
        }
      case 'error':
        return {
          icon: WifiOff,
          label: 'Disconnected',
          color: 'text-red-400',
          bgColor: 'bg-red-400/10',
          animate: false,
        }
      case 'rate_limited':
        return {
          icon: AlertCircle,
          label: 'Rate limited',
          color: 'text-orange-400',
          bgColor: 'bg-orange-400/10',
          animate: false,
        }
      default:
        return {
          icon: WifiOff,
          label: 'Unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/10',
          animate: false,
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  // Format last updated time
  const formatLastUpdated = React.useMemo(() => {
    if (!lastUpdated) return null
    const now = new Date()
    const updated = new Date(lastUpdated)
    const diffMs = now.getTime() - updated.getTime()
    const minutes = Math.floor(diffMs / 60000)

    if (minutes < 1) return 'just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return 'yesterday'
  }, [lastUpdated])

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium',
        config.bgColor,
        config.color
      )}
    >
      <Icon
        className={cn(
          'w-3.5 h-3.5',
          config.animate && 'animate-spin'
        )}
      />
      <span>{config.label}</span>
      {formatLastUpdated && (
        <>
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Updated {formatLastUpdated}</span>
        </>
      )}
    </div>
  )
}

/**
 * Loading Skeleton Component
 */
function TweetCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={cn(
        'bg-glass-light backdrop-blur-md border border-glass-border rounded-xl overflow-hidden',
        compact ? 'p-3' : 'p-4'
      )}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-4 bg-muted rounded animate-pulse w-24 mb-1" />
          <div className="h-3 bg-muted rounded animate-pulse w-32" />
        </div>
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-4/5" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/5" />
      </div>
      <div className="h-24 bg-muted rounded-lg animate-pulse" />
    </div>
  )
}

/**
 * BreakingTwitterFeed Component
 *
 * Displays a live feed of tweets with:
 * - Auto-refresh every 5 minutes
 * - Loading skeletons during fetch
 * - Error handling with retry
 * - Connection status indicator
 * - Category filtering
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <BreakingTwitterFeed
 *   username="polymarket"
 *   limit={10}
 *   autoRefresh
 *   categoryFilter="all"
 *   layout="grid"
 * />
 * ```
 */
export const BreakingTwitterFeed = React.memo<BreakingTwitterFeedProps>(({
  username = 'polymarket',
  limit = 10,
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
  showStatus = true,
  categoryFilter = 'all',
  compact = false,
  layout = 'grid',
  showMedia = true,
  showMetrics = true,
  showCategory = true,
  className,
  fetchTweets: customFetchTweets
}) => {
  const [tweets, setTweets] = React.useState<EnrichedTweet[]>([])
  const [status, setStatus] = React.useState<TwitterConnectionStatus>('connecting')
  const [lastUpdated, setLastUpdated] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Refs for cleanup
  const intervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = React.useRef(true)

  /**
   * Default fetch function using Supabase Edge Function
   */
  const defaultFetchTweets = React.useCallback(async (user: string, maxResults: number): Promise<EnrichedTweet[]> => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!supabaseUrl) {
      throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/get-polymarket-tweets`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify({
          username: user,
          limit: maxResults,
          excludeReplies: true,
          excludeRetweets: true,
        }),
      }
    )

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.')
      }
      if (response.status === 401) {
        throw new Error('Twitter authentication failed.')
      }
      const text = await response.text()
      throw new Error(`Failed to fetch tweets: ${text}`)
    }

    const data = await response.json()
    return data.data || []
  }, [])

  /**
   * Fetch tweets from the API
   */
  const fetchTweets = React.useCallback(async () => {
    if (!mountedRef.current) return

    try {
      setStatus('connecting')
      setError(null)

      const fetchFn = customFetchTweets || defaultFetchTweets
      const fetchedTweets = await fetchFn(username, limit)

      if (!mountedRef.current) return

      // Filter by category if specified
      let filteredTweets = fetchedTweets
      if (categoryFilter !== 'all') {
        filteredTweets = fetchedTweets.filter(tweet => {
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
      }

      setTweets(filteredTweets)
      setStatus('connected')
      setLastUpdated(new Date().toISOString())
    } catch (err) {
      if (!mountedRef.current) return

      console.error('Failed to fetch tweets:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      // Check for rate limit
      if (errorMessage.includes('Rate limit')) {
        setStatus('rate_limited')
      } else {
        setStatus('error')
      }

      setError(errorMessage)
    } finally {
      setIsRefreshing(false)
    }
  }, [username, limit, categoryFilter, customFetchTweets, defaultFetchTweets])

  /**
   * Manual refresh handler
   */
  const handleRefresh = React.useCallback(() => {
    setIsRefreshing(true)
    fetchTweets()
  }, [fetchTweets])

  /**
   * Initial fetch on mount
   */
  React.useEffect(() => {
    fetchTweets()
  }, [fetchTweets])

  /**
   * Set up auto-refresh interval
   */
  React.useEffect(() => {
    if (!autoRefresh) return

    intervalRef.current = setInterval(() => {
      fetchTweets()
    }, refreshInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, refreshInterval, fetchTweets])

  /**
   * Cleanup on unmount
   */
  React.useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  /**
   * Filter tweets by category
   */
  const displayedTweets = React.useMemo(() => {
    return tweets
  }, [tweets])

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Latest Tweets</h2>
          {showStatus && (
            <ConnectionStatus status={status} lastUpdated={lastUpdated} />
          )}
        </div>

        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || status === 'connecting'}
          className={cn(
            'p-2 rounded-lg transition-colors',
            'hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed',
            'text-muted-foreground hover:text-foreground'
          )}
          aria-label="Refresh tweets"
        >
          <RefreshCw
            className={cn(
              'w-4 h-4',
              isRefreshing && 'animate-spin'
            )}
          />
        </button>
      </div>

      {/* Error state */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-red-400">
                  Failed to load tweets
                </p>
                <p className="text-xs text-red-300/80 mt-1">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="text-sm text-red-400 hover:text-red-300 flex-shrink-0"
              >
                Retry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {status === 'connected' && displayedTweets.length === 0 && (
        <div className="bg-glass-light backdrop-blur-md border border-glass-border rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No tweets found</p>
          {categoryFilter !== 'all' && (
            <p className="text-xs text-muted-foreground mt-1">
              Try adjusting the category filter
            </p>
          )}
        </div>
      )}

      {/* Loading state */}
      {status === 'connecting' && displayedTweets.length === 0 && (
        <div
          className={cn(
            layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
            layout === 'list' && 'space-y-4'
          )}
        >
          {Array.from({ length: Math.min(limit, 4) }).map((_, index) => (
            <TweetCardSkeleton key={index} compact={compact} />
          ))}
        </div>
      )}

      {/* Tweets */}
      <AnimatePresence mode="popLayout">
        {displayedTweets.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              layout === 'grid' && 'grid grid-cols-1 md:grid-cols-2 gap-4',
              layout === 'list' && 'space-y-4'
            )}
          >
            <AnimatePresence mode="popLayout">
              {displayedTweets.map((tweet) => (
                <motion.div
                  key={tweet.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <TweetCard
                    tweet={tweet}
                    compact={compact}
                    showMedia={showMedia}
                    showMetrics={showMetrics}
                    showCategory={showCategory}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rate limited notice */}
      {status === 'rate_limited' && displayedTweets.length > 0 && (
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex items-center gap-2 text-xs text-orange-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>
            Rate limit reached. Tweets will update in 30 minutes.
          </span>
        </div>
      )}
    </div>
  )
})

BreakingTwitterFeed.displayName = 'BreakingTwitterFeed'
