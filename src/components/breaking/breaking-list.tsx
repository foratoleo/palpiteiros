/**
 * Breaking List Component
 *
 * Markets list component with infinite scroll functionality.
 * Displays breaking markets in grid or list view mode.
 *
 * @features
 * - Grid view: 2 columns on tablet, 3 on desktop
 * - List view: full-width cards
 * - Infinite scroll with Intersection Observer
 * - Load More button (fallback)
 * - Loading skeletons at bottom
 * - Empty state: "No breaking markets found"
 * - Framer Motion stagger animation on mount
 * - Real-time updates with flash animation
 *
 * @component BreakingList
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { BreakingMarketCard } from './breaking-market-card'
import { BreakingMarketCardSkeleton } from './breaking-market-card-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BreakingMarket } from '@/types/breaking.types'

/**
 * BreakingList Props
 */
export interface BreakingListProps {
  /** Array of breaking markets to display */
  markets: BreakingMarket[]
  /** Current view mode */
  viewMode: 'grid' | 'list'
  /** Callback when load more is triggered */
  onLoadMore: () => void
  /** Whether there are more markets to load */
  hasMore: boolean
  /** Whether currently loading */
  isLoading: boolean
}

/**
 * Container animation variants for stagger effect
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

/**
 * Item animation variants
 */
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
}

/**
 * BreakingList Component
 *
 * Displays breaking markets in grid or list layout.
 * Supports infinite scroll pagination.
 *
 * @example
 * ```tsx
 * <BreakingList
 *   markets={markets}
 *   viewMode="grid"
 *   onLoadMore={handleLoadMore}
 *   hasMore={true}
 *   isLoading={false}
 * />
 * ```
 */
export function BreakingList({
  markets,
  viewMode,
  onLoadMore,
  hasMore,
  isLoading,
}: BreakingListProps) {
  // Intersection Observer ref for infinite scroll
  const loadMoreRef = React.useRef<HTMLDivElement>(null)
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  /**
   * Set up Intersection Observer for infinite scroll
   */
  React.useEffect(() => {
    const ref = loadMoreRef.current
    if (!ref) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          setIsIntersecting(true)
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(ref)

    return () => {
      observer.disconnect()
    }
  }, [hasMore, isLoading])

  /**
   * Trigger load more when intersecting
   */
  React.useEffect(() => {
    if (isIntersecting && hasMore && !isLoading) {
      onLoadMore()
      setIsIntersecting(false)
    }
  }, [isIntersecting, hasMore, isLoading, onLoadMore])

  /**
   * Format currency for display
   */
  const formatCurrency = React.useCallback((value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }, [])

  /**
   * Render list view card
   * Safely handles undefined/null values from API
   */
  const renderListCard = React.useCallback(
    (market: BreakingMarket, index: number) => {
      const isUp = market.trend === 'up'
      const priceChangePercent = (market.price_change_24h ?? 0) !== 0
        ? ((market.price_change_24h ?? 0) * 100).toFixed(2)
        : '0.00'
      const movementScore = (market.movement_score ?? 0) !== 0
        ? ((market.movement_score ?? 0) * 100).toFixed(0)
        : '0'

      return (
        <Link key={market.id} href={`/markets/${market.id}`} className="block">
          <motion.div variants={itemVariants}>
            <Card
              variant="glass"
              className="group hover:shadow-lg hover:border-primary/30 transition-all duration-200 cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank Badge */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                    {index + 1}
                  </div>

                  {/* Market Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                        {market.question}
                      </h3>
                      {market.category && (
                        <span className="text-xs text-muted-foreground shrink-0">
                          {market.category}
                        </span>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="flex items-center gap-4 text-sm">
                      {/* Current Price */}
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground">Price:</span>
                        <span className="font-medium tabular-nums">
                          {Math.round((market.current_price ?? 0) * 100)}%
                        </span>
                      </div>

                      {/* Price Change */}
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          isUp ? 'text-green-500' : 'text-red-500'
                        )}
                      >
                        {isUp ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span className="font-medium tabular-nums">
                          {priceChangePercent}%
                        </span>
                      </div>

                      {/* Volume */}
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span>Vol:</span>
                        <span className="tabular-nums">
                          {formatCurrency(market.volume ?? 0)}
                        </span>
                      </div>

                      {/* Movement Score */}
                      <div className="flex items-center gap-1">
                        <span className="text-muted-foreground text-xs">Score:</span>
                        <span className="text-xs font-medium tabular-nums">
                          {movementScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Trend Icon */}
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-full',
                      isUp
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                    )}
                  >
                    {isUp ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </Link>
      )
    },
    [formatCurrency]
  )

  if (markets.length === 0) {
    return (
      <Card variant="glass">
        <CardContent className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
            <TrendingUp className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No breaking markets found</h3>
          <p className="text-muted-foreground">
            Markets with significant price movements will appear here
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      {/* Markets Grid/List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={
          viewMode === 'grid'
            ? 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-3'
        }
      >
        <AnimatePresence mode="popLayout">
          {markets.map((market, index) =>
            viewMode === 'grid' ? (
              <motion.div key={market.id} variants={itemVariants} layout>
                <BreakingMarketCard market={market} rank={index + 1} />
              </motion.div>
            ) : (
              renderListCard(market, index)
            )
          )}
        </AnimatePresence>
      </motion.div>

      {/* Loading Skeletons */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={
            viewMode === 'grid'
              ? 'grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4'
              : 'space-y-3 mt-4'
          }
        >
          {Array.from({ length: viewMode === 'grid' ? 6 : 3 }).map((_, i) => (
            <BreakingMarketCardSkeleton key={`skeleton-${i}`} viewMode={viewMode} />
          ))}
        </motion.div>
      )}

      {/* Load More Trigger (Infinite Scroll) */}
      <div ref={loadMoreRef} className="h-4" />

      {/* Load More Button (Fallback) */}
      {hasMore && !isLoading && (
        <div className="flex justify-center mt-6">
          <Button
            variant="outline"
            onClick={onLoadMore}
            className="gap-2"
          >
            Load More
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* End of List Indicator */}
      {!hasMore && markets.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mt-6 text-sm text-muted-foreground"
        >
          Showing all {markets.length} breaking markets
        </motion.div>
      )}
    </div>
  )
}
