/**
 * Order Book Summary Component
 *
 * Summary bar displaying key order book metrics including:
 * - Spread (best bid/ask difference)
 * - Total volume (bids + asks)
 * - Implied probability
 * - Last trade information
 * - Price change indicator
 *
 * @feature Auto-refresh every few seconds
 * @feature Compact layout for mobile
 * @feature Click to toggle between summary and detail view
 * @feature Visual indicators (up green, down red)
 */

import { useCallback, useEffect, useState } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LastTrade } from '@/types/gamma.types'
import type { OrderBookData } from './use-order-book-data'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Order Book Summary Props
 */
export interface OrderBookSummaryProps {
  /** Order book data */
  orderBook: OrderBookData | undefined
  /** Last trade information */
  lastTrade: LastTrade | undefined
  /** Previous price for change calculation */
  previousPrice?: number
  /** Auto-refresh interval in milliseconds */
  refreshInterval?: number
  /** Compact variant for mobile */
  compact?: boolean
  /** Click handler to toggle detail view */
  onToggleDetail?: () => void
  /** Whether detail view is active */
  showDetail?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Summary View Mode
 */
type ViewMode = 'summary' | 'detail'

/**
 * Price Change Direction
 */
type PriceDirection = 'up' | 'down' | 'neutral'

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate price change direction
 */
function getPriceDirection(
  current: number,
  previous?: number
): PriceDirection {
  if (previous === undefined) return 'neutral'
  if (current > previous) return 'up'
  if (current < previous) return 'down'
  return 'neutral'
}

/**
 * Format percentage for display
 */
function formatPercent(value: number, decimals: number = 2): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(decimals)}%`
}

/**
 * Format price as percentage (0-100)
 */
function formatPricePercent(price: number): string {
  return `${(price * 100).toFixed(1)}%`
}

/**
 * Format volume with appropriate suffix
 */
function formatVolume(volume: number): string {
  if (volume >= 1000000) return `$${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `$${(volume / 1000).toFixed(1)}K`
  return `$${volume.toFixed(0)}`
}

/**
 * Format timestamp for display
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Less than 1 minute
  if (diff < 60000) {
    return 'just now'
  }

  // Less than 1 hour
  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000)
    return `${minutes}m ago`
  }

  // Less than 1 day
  if (diff < 86400000) {
    const hours = Math.floor(diff / 3600000)
    return `${hours}h ago`
  }

  // Otherwise show date
  return date.toLocaleDateString()
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Order Book Summary Component
 *
 * Displays key order book metrics in a compact summary bar.
 *
 * @example
 * ```tsx
 * <OrderBookSummary
 *   orderBook={orderBookData}
 *   lastTrade={lastTradeData}
 *   previousPrice={0.60}
 *   refreshInterval={5000}
 *   onToggleDetail={() => setShowDetail(!showDetail)}
 * />
 * ```
 */
export function OrderBookSummary({
  orderBook,
  lastTrade,
  previousPrice,
  refreshInterval = 5000,
  compact = false,
  onToggleDetail,
  showDetail = false,
  className
}: OrderBookSummaryProps) {
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now())

  // Auto-refresh timestamp
  useEffect(() => {
    if (!refreshInterval || refreshInterval <= 0) return

    const interval = setInterval(() => {
      setLastUpdateTime(Date.now())
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  // Handle click to toggle detail view
  const handleClick = useCallback(() => {
    if (onToggleDetail) {
      onToggleDetail()
    }
  }, [onToggleDetail])

  if (!orderBook) {
    return (
      <div className={cn(
        'flex items-center justify-center py-4 px-4 text-muted-foreground',
        'animate-pulse',
        className
      )}>
        Loading order book...
      </div>
    )
  }

  // Calculate price direction
  const currentPrice = orderBook.impliedProbability
  const priceDirection = getPriceDirection(currentPrice, previousPrice)
  const priceChange = previousPrice !== undefined
    ? ((currentPrice - previousPrice) / previousPrice) * 100
    : 0

  // Direction icon and color
  const directionIcon = {
    up: <TrendingUp className="w-4 h-4" />,
    down: <TrendingDown className="w-4 h-4" />,
    neutral: <Minus className="w-4 h-4" />
  }[priceDirection]

  const directionColor = {
    up: 'text-green-500 dark:text-green-400',
    down: 'text-red-500 dark:text-red-400',
    neutral: 'text-muted-foreground'
  }[priceDirection]

  return (
    <div
      className={cn(
        'bg-card/50 backdrop-blur-sm border-b transition-all duration-200',
        compact ? 'py-2 px-3' : 'py-3 px-4',
        onToggleDetail && 'cursor-pointer hover:bg-accent/50',
        className
      )}
      onClick={handleClick}
      role="region"
      aria-label="Order book summary"
    >
      {/* Compact variant - horizontal layout */}
      {compact ? (
        <div className="flex items-center justify-between gap-4">
          {/* Spread */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Spread:</span>
            <span className="text-sm font-medium font-mono">
              {orderBook.spread !== undefined
                ? formatPercent(orderBook.spreadPercent || orderBook.spread * 100)
                : '-'
              }
            </span>
          </div>

          {/* Implied probability with direction */}
          <div className="flex items-center gap-1.5">
            <span className={cn('text-sm font-medium font-mono', directionColor)}>
              {formatPricePercent(currentPrice)}
            </span>
            <span className={directionColor}>{directionIcon}</span>
          </div>

          {/* Volume */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-muted-foreground">Vol:</span>
            <span className="text-sm font-medium font-mono">
              {formatVolume(orderBook.totalBidVolume + orderBook.totalAskVolume)}
            </span>
          </div>
        </div>
      ) : (
        /* Standard variant - grid layout */
        <div className="grid grid-cols-4 gap-4">
          {/* Implied probability */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Implied Prob</span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold font-mono">
                {formatPricePercent(currentPrice)}
              </span>
              <span className={directionColor}>{directionIcon}</span>
            </div>
          </div>

          {/* Spread */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Spread</span>
            <span className="text-lg font-semibold font-mono">
              {orderBook.spread !== undefined
                ? formatPercent(orderBook.spreadPercent || orderBook.spread * 100)
                : '-'
              }
            </span>
            {orderBook.bestBid !== undefined && orderBook.bestAsk !== undefined && (
              <span className="text-xs text-muted-foreground">
                {formatPricePercent(orderBook.bestBid)} - {formatPricePercent(orderBook.bestAsk)}
              </span>
            )}
          </div>

          {/* Total volume */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Total Volume</span>
            <span className="text-lg font-semibold font-mono">
              {formatVolume(orderBook.totalBidVolume + orderBook.totalAskVolume)}
            </span>
            <span className="text-xs text-muted-foreground">
              Bid: {formatVolume(orderBook.totalBidVolume)} | Ask: {formatVolume(orderBook.totalAskVolume)}
            </span>
          </div>

          {/* Last trade */}
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1">Last Trade</span>
            {lastTrade ? (
              <>
                <span className="text-lg font-semibold font-mono">
                  {formatPricePercent(lastTrade.price)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatTimestamp(lastTrade.timestamp)}
                </span>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">No trades</span>
            )}
          </div>
        </div>
      )}

      {/* Price change indicator (always visible) */}
      {priceChange !== 0 && (
        <div className={cn(
          'mt-2 text-xs font-medium',
          priceDirection === 'up' && 'text-green-500 dark:text-green-400',
          priceDirection === 'down' && 'text-red-500 dark:text-red-400'
        )}>
          {formatPercent(priceChange)} from previous
        </div>
      )}

      {/* Detail view indicator */}
      {showDetail && (
        <div className="mt-2 pt-2 border-t">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Bid:</span>
              <span className="font-mono text-green-500">
                {orderBook.bestBid !== undefined ? formatPricePercent(orderBook.bestBid) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Best Ask:</span>
              <span className="font-mono text-red-500">
                {orderBook.bestAsk !== undefined ? formatPricePercent(orderBook.bestAsk) : '-'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Bid Depth:</span>
              <span className="font-mono">{orderBook.bids.length} levels</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Ask Depth:</span>
              <span className="font-mono">{orderBook.asks.length} levels</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SKELETON VARIANT
// ============================================================================

/**
 * Order Book Summary Skeleton Props
 */
export interface OrderBookSummarySkeletonProps {
  /** Compact variant */
  compact?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Order Book Summary Skeleton Component
 *
 * Loading skeleton for order book summary.
 *
 * @example
 * ```tsx
 * <OrderBookSummarySkeleton compact={false} />
 * ```
 */
export function OrderBookSummarySkeleton({
  compact = false,
  className
}: OrderBookSummarySkeletonProps) {
  return (
    <div
      className={cn(
        'bg-card/50 backdrop-blur-sm border-b',
        compact ? 'py-2 px-3' : 'py-3 px-4',
        'animate-pulse',
        className
      )}
      role="status"
      aria-label="Loading order book summary"
    >
      {compact ? (
        <div className="flex items-center justify-between gap-4">
          <div className="w-20 h-4 bg-muted/50 rounded" />
          <div className="w-16 h-4 bg-muted/50 rounded" />
          <div className="w-24 h-4 bg-muted/50 rounded" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <div className="flex flex-col gap-2">
            <div className="w-24 h-3 bg-muted/50 rounded" />
            <div className="w-20 h-6 bg-muted/50 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-16 h-3 bg-muted/50 rounded" />
            <div className="w-20 h-6 bg-muted/50 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-24 h-3 bg-muted/50 rounded" />
            <div className="w-24 h-6 bg-muted/50 rounded" />
          </div>
          <div className="flex flex-col gap-2">
            <div className="w-20 h-3 bg-muted/50 rounded" />
            <div className="w-20 h-6 bg-muted/50 rounded" />
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// SPREAD INDICATOR COMPONENT
// ============================================================================

/**
 * Spread Indicator Props
 */
export interface SpreadIndicatorProps {
  /** Current spread value */
  spread: number
  /** Spread as percentage */
  spreadPercent: number
  /** Best bid price */
  bestBid: number
  /** Best ask price */
  bestAsk: number
  /** Custom class name */
  className?: string
}

/**
 * Spread Indicator Component
 *
 * Standalone spread indicator with visual bar.
 *
 * @example
 * ```tsx
 * <SpreadIndicator
 *   spread={0.02}
 *   spreadPercent={2}
 *   bestBid={0.65}
 *   bestAsk={0.67}
 * />
 * ```
 */
export function SpreadIndicator({
  spread,
  spreadPercent,
  bestBid,
  bestAsk,
  className
}: SpreadIndicatorProps) {
  // Calculate spread severity (0-100)
  const spreadSeverity = Math.min(spreadPercent * 5, 100)

  // Color based on severity
  const severityColor = spreadSeverity > 10
    ? 'bg-red-500'
    : spreadSeverity > 5
    ? 'bg-yellow-500'
    : 'bg-green-500'

  return (
    <div
      className={cn('flex items-center gap-3', className)}
      role="region"
      aria-label={`Spread: ${spreadPercent.toFixed(2)}%`}
    >
      <div className="text-sm font-mono">
        <span className="text-muted-foreground">Spread:</span>{' '}
        <span className="font-medium">{spreadPercent.toFixed(2)}%</span>
      </div>
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full transition-all duration-300', severityColor)}
          style={{ width: `${spreadSeverity}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground">
        {formatPricePercent(bestBid)} / {formatPricePercent(bestAsk)}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default OrderBookSummary
