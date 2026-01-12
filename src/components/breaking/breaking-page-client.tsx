/**
 * Breaking Page Client Component
 *
 * Client-side wrapper for the breaking markets page.
 * Manages filters, view mode, real-time updates, and infinite scroll.
 *
 * @features
 * - Client-side state management (filters, view mode)
 * - useBreakingMarkets hook for data fetching
 * - Real-time updates via Supabase subscriptions
 * - Infinite scroll pagination
 * - Loading states with skeleton cards
 * - Error states with retry button
 * - Grid/List view modes
 *
 * @component BreakingPageClient
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBreakingMarkets, useBreakingRealtime } from '@/hooks/use-breaking-markets'
import { useBreakingStore } from '@/stores/breaking.store'
import { BreakingHeader } from './breaking-header'
import { BreakingFilters } from './breaking-filters'
import { BreakingList } from './breaking-list'
import { BreakingMarketCardSkeleton } from './breaking-market-card-skeleton'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { AlertCircle, RefreshCw, Wifi, WifiOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BreakingMarket } from '@/types/breaking.types'

/**
 * BreakingPageClient Props
 */
export interface BreakingPageClientProps {
  /** Initial markets from server-side fetch */
  initialMarkets: BreakingMarket[]
  /** Initial count of breaking markets */
  initialCount?: number
}

/**
 * BreakingPageClient Component
 *
 * Main client component for the breaking markets page.
 * Orchestrates header, filters, and markets list.
 *
 * @example
 * ```tsx
 * <BreakingPageClient
 *   initialMarkets={serverFetchedMarkets}
 *   initialCount={50}
 * />
 * ```
 */
export function BreakingPageClient({
  initialMarkets,
  initialCount = 0,
}: BreakingPageClientProps) {
  // Get filter and view state from Zustand store
  const {
    filters,
    setFilters,
    viewMode,
    setViewMode,
    setMarketsCache,
    updateMarketCache,
    isConnected,
    setConnected,
  } = useBreakingStore()

  // Local state for connection animation
  const [isConnecting, setIsConnecting] = React.useState(true)
  const [updatedMarketIds, setUpdatedMarketIds] = React.useState<Set<string>>(new Set())

  // Fetch breaking markets with current filters
  const {
    markets,
    isLoading,
    error,
    isRefetching,
    refetch,
  } = useBreakingMarkets({
    filters,
    limit: 50,
    enabled: true,
    refetchInterval: 60000, // Refresh every minute
  })

  // Real-time updates subscription
  const { isConnected: realtimeConnected } = useBreakingRealtime({
    enabled: true,
    onPriceChange: (market) => {
      // Update market in cache when price changes
      updateMarketCache(market)

      // Track updated markets for flash animation
      setUpdatedMarketIds((prev) => new Set(prev).add(market.id))

      // Clear from updated set after animation completes
      setTimeout(() => {
        setUpdatedMarketIds((prev) => {
          const next = new Set(prev)
          next.delete(market.id)
          return next
        })
      }, 1000)
    },
  })

  // Update connection state with animation
  React.useEffect(() => {
    if (realtimeConnected && isConnecting) {
      // Transition from connecting to connected
      const timer = setTimeout(() => setIsConnecting(false), 500)
      return () => clearTimeout(timer)
    } else if (!realtimeConnected && !isConnecting) {
      // Transition to disconnected state
      setIsConnecting(true)
      const timer = setTimeout(() => setIsConnecting(false), 500)
      return () => clearTimeout(timer)
    }
  }, [realtimeConnected, isConnecting])

  // Update cache when markets change
  React.useEffect(() => {
    if (markets.length > 0) {
      setMarketsCache(markets)
    }
  }, [markets, setMarketsCache])

  // Pagination state for infinite scroll
  const [displayCount, setDisplayCount] = React.useState(20)
  const displayedMarkets = React.useMemo(
    () => markets.slice(0, displayCount),
    [markets, displayCount]
  )

  /**
   * Handle filter changes
   */
  const handleFiltersChange = React.useCallback(
    (newFilters: Partial<typeof filters>) => {
      setFilters(newFilters)
      setDisplayCount(20) // Reset pagination on filter change
    },
    [setFilters]
  )

  /**
   * Handle retry after error
   */
  const handleRetry = React.useCallback(() => {
    refetch()
  }, [refetch])

  /**
   * Handle load more (for infinite scroll fallback)
   */
  const handleLoadMore = React.useCallback(() => {
    setDisplayCount((prev) => Math.min(prev + 20, markets.length))
  }, [markets.length])

  /**
   * Check if there are more markets to load
   */
  const hasMore = React.useMemo(
    () => displayCount < markets.length,
    [displayCount, markets.length]
  )

  /**
   * Get current date for header
   */
  const currentDate = React.useMemo(() => new Date(), [])

  /**
   * Container animation variants
   */
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <BreakingHeader
        date={currentDate}
        marketsCount={markets.length}
        isConnected={isConnected}
        isRefetching={isRefetching}
      />

      {/* Filters */}
      <div className="mb-6">
        <BreakingFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      </div>

      {/* Error State */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6"
          >
            <Card variant="glass" className="border-destructive/50 bg-destructive/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-destructive">Failed to load breaking markets</p>
                    <p className="text-sm text-muted-foreground">{error.message}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    className="shrink-0"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Markets List */}
      {isLoading && markets.length === 0 ? (
        // Loading skeleton
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={cn(
            'grid gap-4',
            viewMode === 'grid' && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <BreakingMarketCardSkeleton key={i} viewMode={viewMode} />
          ))}
        </motion.div>
      ) : markets.length === 0 ? (
        // Empty state
        <Card variant="glass">
          <CardContent className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No breaking markets found</h3>
            <p className="text-muted-foreground mb-4">
              {filters.minPriceChange || filters.categories?.length
                ? 'Try adjusting your filters to see more results'
                : 'Markets with significant price movements will appear here'}
            </p>
            {filters.minPriceChange || filters.categories?.length ? (
              <Button
                variant="outline"
                onClick={() => handleFiltersChange({ minPriceChange: 0.05, categories: [] })}
              >
                Clear Filters
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : (
        // Markets grid/list
        <BreakingList
          markets={displayedMarkets}
          viewMode={viewMode}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          isLoading={isLoading}
        />
      )}

      {/* Connection Status Indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium',
                'backdrop-blur-md border shadow-lg cursor-help relative',
                isConnected
                  ? 'bg-green-500/10 border-green-500/20 text-green-500 dark:text-green-400'
                  : 'bg-red-500/10 border-red-500/20 text-red-500 dark:text-red-400'
              )}
            >
              {/* Connection icon with animations */}
              <div className="relative">
                {isConnecting ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    {/* Pulsing green dot when connected */}
                    <motion.div
                      className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [1, 0.5, 1],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </>
                ) : (
                  <WifiOff className="h-3 w-3" />
                )}
              </div>

              {/* Status text */}
              <span>
                {isConnecting
                  ? 'Connecting...'
                  : isConnected
                    ? 'Live'
                    : 'Offline'}
              </span>

              {/* Pulsing effect when connecting */}
              {isConnecting && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{isConnected
              ? 'Live updates • Connected to Supabase'
              : 'Disconnected • Reconnecting...'}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
