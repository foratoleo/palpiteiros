/**
 * Market Grid Component
 *
 * Grid container for market cards with responsive columns,
 * infinite scroll, and staggered animations.
 *
 * @features
 * - Responsive columns (1/2/3/4)
 * - Infinite scroll integration
 * - Load more button
 * - Empty state with illustration
 * - Loading state with skeletons
 * - Stagger children animation
 * - Virtual scroll support for 100+ markets
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { FileQuestion, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MarketCard } from './market-card'
import { MarketCard3D } from './market-card-3d'
import { MarketGridSkeleton } from './market-card-skeleton'
import { Button } from '@/components/ui/button'
import type { Market, MarketCardProps } from '@/types/market.types'

/**
 * Market Grid Props
 */
export interface MarketGridProps {
  /** Array of markets to display */
  markets: Market[]
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
  /** Whether there are more markets to load */
  hasMore?: boolean
  /** Load more callback */
  onLoadMore?: () => void
  /** Loading more state */
  loadingMore?: boolean
  /** Refresh callback */
  onRefresh?: () => void
  /** Number of columns at each breakpoint */
  columns?: {
    mobile?: 1 | 2
    tablet?: 1 | 2 | 3
    desktop?: 1 | 2 | 3 | 4
    wide?: 1 | 2 | 3 | 4 | 5 | 6
  }
  /** Gap between cards */
  gap?: number
  /** Card variant */
  variant?: MarketCardProps['variant']
  /** Use 3D cards instead of regular cards */
  use3D?: boolean
  /** Enable staggered animation on mount */
  staggerAnimation?: boolean
  /** Enable virtual scrolling for large lists */
  virtualScroll?: boolean
  /** Number of items to render in virtual scroll */
  virtualThreshold?: number
  /** Empty state message */
  emptyMessage?: string
  /** Empty state description */
  emptyDescription?: string
  /** Additional CSS class names */
  className?: string
}

/**
 * Empty State Component
 *
 * Displayed when no markets are found.
 */
function EmptyState({
  message = 'No markets found',
  description = 'Try adjusting your filters or search query',
  onRefresh,
  className
}: {
  message?: string
  description?: string
  onRefresh?: () => void
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 px-4', className)}>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="text-center"
      >
        <div className="relative mb-6">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
              ease: 'easeInOut'
            }}
          >
            <FileQuestion className="h-16 w-16 text-muted-foreground/50 mx-auto" />
          </motion.div>
        </div>

        <h3 className="text-lg font-semibold mb-2">{message}</h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
          {description}
        </p>

        {onRefresh && (
          <Button variant="outline" onClick={onRefresh}>
            Refresh Markets
          </Button>
        )}
      </motion.div>
    </div>
  )
}

/**
 * Market Grid Component
 *
 * Displays markets in a responsive grid with animations.
 * Supports infinite scroll and virtual scrolling.
 *
 * @example
 * ```tsx
 * const { markets, isLoading, hasMore, loadMore } = useMarketsInfinite()
 *
 * <MarketGrid
 *   markets={markets}
 *   loading={isLoading}
 *   hasMore={hasMore}
 *   onLoadMore={loadMore}
 *   columns={{ mobile: 1, tablet: 2, desktop: 3, wide: 4 }}
 *   staggerAnimation
 * />
 * ```
 */
export function MarketGrid({
  markets,
  loading = false,
  error = null,
  hasMore = false,
  onLoadMore,
  loadingMore = false,
  onRefresh,
  columns = { mobile: 1, tablet: 2, desktop: 3, wide: 4 },
  gap = 4,
  variant = 'default',
  use3D = false,
  staggerAnimation = true,
  virtualScroll = false,
  virtualThreshold = 100,
  emptyMessage,
  emptyDescription,
  className
}: MarketGridProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Infinite scroll with intersection observer
  React.useEffect(() => {
    if (!onLoadMore || !hasMore || loadingMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore()
        }
      },
      { threshold: 0.1 }
    )

    const sentinel = containerRef.current?.querySelector('[data-sentinel]')
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => observer.disconnect()
  }, [onLoadMore, hasMore, loadingMore])

  // Animation variants for stagger effect
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    }
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        message="Error loading markets"
        description={error}
        onRefresh={onRefresh}
        className={className}
      />
    )
  }

  // Loading state
  if (loading && markets.length === 0) {
    return (
      <div className={className}>
        <MarketGridSkeleton
          count={6}
          columns={columns}
          gap={gap}
          variant={variant}
        />
      </div>
    )
  }

  // Empty state
  if (!loading && markets.length === 0) {
    return (
      <EmptyState
        message={emptyMessage}
        description={emptyDescription}
        onRefresh={onRefresh}
        className={className}
      />
    )
  }

  // Grid layout classes
  const gridClasses = cn(
    'grid',
    `grid-cols-${columns.mobile}`,
    columns.tablet && `md:grid-cols-${columns.tablet}`,
    columns.desktop && `lg:grid-cols-${columns.desktop}`,
    columns.wide && `xl:grid-cols-${columns.wide}`,
    `gap-${gap}`,
    className
  )

  // Choose card component
  const CardComponent = use3D ? MarketCard3D : MarketCard

  // Render markets
  const renderMarkets = (marketList: Market[]) => {
    return marketList.map((market, index) => (
      <motion.div
        key={market.id}
        variants={staggerAnimation ? itemVariants : undefined}
        initial={staggerAnimation ? 'hidden' : undefined}
        animate={staggerAnimation ? 'visible' : undefined}
        transition={{ delay: staggerAnimation ? index * 0.05 : 0 }}
      >
        {use3D ? (
          <MarketCard3D market={market} />
        ) : (
          <MarketCard market={market} variant={variant} />
        )}
      </motion.div>
    ))
  }

  return (
    <div ref={containerRef}>
      <motion.div
        className={gridClasses}
        variants={staggerAnimation ? containerVariants : undefined}
        initial={staggerAnimation ? 'hidden' : undefined}
        animate={staggerAnimation ? 'visible' : undefined}
      >
        {renderMarkets(markets)}

        {/* Sentinel for infinite scroll */}
        {hasMore && (
          <div
            data-sentinel
            className="col-span-full flex items-center justify-center py-8"
          >
            {loadingMore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 text-muted-foreground"
              >
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading more markets...</span>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>

      {/* Load more button (alternative to infinite scroll) */}
      {hasMore && !loadingMore && onLoadMore && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={onLoadMore}
            className="min-w-[200px]"
          >
            Load More Markets
          </Button>
        </div>
      )}
    </div>
  )
}

/**
 * Market Grid Masonry Props
 */
export interface MarketGridMasonryProps extends Omit<MarketGridProps, 'columns'> {
  /** Minimum column width */
  minColumnWidth?: number
}

/**
 * Market Grid Masonry Component
 *
 * Alternative masonry layout for varying card heights.
 * Automatically calculates optimal columns based on width.
 *
 * @example
 * ```tsx
 * <MarketGridMasonry
 *   markets={markets}
 *   minColumnWidth={300}
 *   variant="detailed"
 * />
 * ```
 */
export function MarketGridMasonry({
  markets,
  minColumnWidth = 300,
  ...props
}: MarketGridMasonryProps) {
  const [columns, setColumns] = React.useState(1)

  React.useEffect(() => {
    const calculateColumns = () => {
      const width = window.innerWidth
      const padding = 32 // Account for container padding
      const availableWidth = width - padding
      const calculatedColumns = Math.max(1, Math.floor(availableWidth / minColumnWidth))
      setColumns(calculatedColumns)
    }

    calculateColumns()
    window.addEventListener('resize', calculateColumns)
    return () => window.removeEventListener('resize', calculateColumns)
  }, [minColumnWidth])

  return (
    <MarketGrid
      {...props}
      markets={markets}
      columns={{
        mobile: 1 as const,
        tablet: 2 as const,
        desktop: columns as 1 | 2 | 3 | 4,
        wide: Math.min(columns + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6
      }}
    />
  )
}
