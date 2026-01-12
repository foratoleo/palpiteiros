/**
 * Order Book Visual Component
 *
 * Main order book visualization with split view for YES/NO orders.
 * Features include:
 * - Split view: YES orders (left/green), NO orders (right/red)
 * - Virtualization for large order books
 * - Real-time updates with animations
 * - Price selection for trading
 * - Responsive design (horizontal on desktop, vertical tabs on mobile)
 *
 * @feature Virtual scrolling for 100+ levels
 * @feature Real-time updates with flash animations
 * @feature Interactive price selection
 * @feature Responsive layout
 */

import 'use-client'

import { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { OrderBookRow, OrderBookRowSkeleton, OrderBookHeader } from './order-book-row'
import { OrderBookSummary, OrderBookSummarySkeleton } from './order-book-summary'
import { DepthChart, DepthChartSkeleton } from './depth-chart'
import type { OrderBookData, OrderBookLevel, LastTrade } from './use-order-book-data'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Order Book Visual Props
 */
export interface OrderBookVisualProps {
  /** Order book data */
  orderBook: OrderBookData | undefined
  /** Last trade information */
  lastTrade?: LastTrade | undefined
  /** Previous price for change calculation */
  previousPrice?: number
  /** Loading state */
  isLoading?: boolean
  /** Error state */
  error?: string | null
  /** Number of levels to display */
  maxLevels?: number
  /** Enable depth chart */
  showDepthChart?: boolean
  /** Enable summary bar */
  showSummary?: boolean
  /** Price selection callback */
  onPriceSelect?: (price: number, side: 'bid' | 'ask') => void
  /** Currently selected price */
  selectedPrice?: number
  /** Custom class name */
  className?: string
}

/**
 * Order Book Side Props
 */
interface OrderBookSideProps {
  /** Order levels for this side */
  levels: OrderBookLevel[]
  /** Side identifier */
  side: 'bid' | 'ask'
  /** Maximum total for bar scaling */
  maxTotal: number
  /** Selected price */
  selectedPrice?: number
  /** Price selection callback */
  onPriceSelect?: (price: number) => void
  /** Number of levels to show */
  maxLevels?: number
  /** Compact variant */
  compact?: boolean
  /** Show header */
  showHeader?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const VIRTUALIZED_ROW_HEIGHT = 36 // pixels per row
const VISIBLE_ROWS_THRESHOLD = 50 // Use virtualization above this count

// ============================================================================
// ORDER BOOK SIDE COMPONENT
// ============================================================================

/**
 * Order Book Side Component
 *
 * Displays one side of the order book (bids or asks).
 * Uses virtualization for performance with large datasets.
 */
function OrderBookSide({
  levels,
  side,
  maxTotal,
  selectedPrice,
  onPriceSelect,
  maxLevels = 20,
  compact = false,
  showHeader = true
}: OrderBookSideProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(400)

  // Limit levels to maxLevels
  const displayLevels = useMemo(() => {
    return levels.slice(0, maxLevels)
  }, [levels, maxLevels])

  // Use virtualization for large datasets
  const useVirtualization = displayLevels.length > VISIBLE_ROWS_THRESHOLD

  // Calculate visible range for virtualization
  const visibleRange = useMemo(() => {
    if (!useVirtualization) {
      return { start: 0, end: displayLevels.length }
    }

    const start = Math.floor(scrollTop / VIRTUALIZED_ROW_HEIGHT)
    const visibleCount = Math.ceil(containerHeight / VIRTUALIZED_ROW_HEIGHT)
    const end = Math.min(start + visibleCount + 1, displayLevels.length)

    return { start: Math.max(0, start - 5), end: Math.min(displayLevels.length, end + 5) }
  }, [scrollTop, containerHeight, displayLevels.length, useVirtualization])

  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Measure container height
  useEffect(() => {
    if (scrollRef.current) {
      setContainerHeight(scrollRef.current.clientHeight)
    }
  }, [])

  // Visible levels for rendering
  const visibleLevels = useVirtualization
    ? displayLevels.slice(visibleRange.start, visibleRange.end)
    : displayLevels

  // Calculate total height for virtualization spacer
  const totalHeight = displayLevels.length * VIRTUALIZED_ROW_HEIGHT
  const offsetTop = visibleRange.start * VIRTUALIZED_ROW_HEIGHT

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      {showHeader && (
        <OrderBookHeader compact={compact} />
      )}

      {/* Order levels */}
      <ScrollArea
        ref={scrollRef}
        className={cn(
          'flex-1',
          !useVirtualization && 'scroll-area'
        )}
        onScroll={handleScroll}
      >
        {useVirtualization ? (
          <div
            className="relative"
            style={{ height: totalHeight }}
          >
            <div
              className="absolute left-0 right-0"
              style={{ top: offsetTop }}
            >
              {visibleLevels.map((level) => (
                <OrderBookRow
                  key={`${side}-${level.price}`}
                  level={level}
                  side={side}
                  compact={compact}
                  maxTotal={maxTotal}
                  selected={selectedPrice === level.price}
                  onClick={onPriceSelect}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-0.5">
            {visibleLevels.map((level) => (
              <OrderBookRow
                key={`${side}-${level.price}`}
                level={level}
                side={side}
                compact={compact}
                maxTotal={maxTotal}
                selected={selectedPrice === level.price}
                onClick={onPriceSelect}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {displayLevels.length === 0 && (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            No {side === 'bid' ? 'bids' : 'asks'} available
          </div>
        )}
      </ScrollArea>
    </div>
  )
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

/**
 * Order Book Skeleton Props
 */
interface OrderBookSkeletonProps {
  /** Show depth chart */
  showDepthChart?: boolean
  /** Show summary */
  showSummary?: boolean
  /** Number of skeleton rows */
  rowCount?: number
}

/**
 * Order Book Skeleton Component
 *
 * Loading skeleton for full order book.
 */
function OrderBookSkeleton({
  showDepthChart = true,
  showSummary = true,
  rowCount = 15
}: OrderBookSkeletonProps) {
  return (
    <Card>
      {showSummary && (
        <OrderBookSummarySkeleton />
      )}
      <CardContent className="p-0">
        <div className="grid grid-cols-2 divide-x">
          {/* Bids skeleton */}
          <div className="p-4">
            <OrderBookHeader />
            <div className="space-y-0.5 mt-2">
              {Array.from({ length: rowCount }).map((_, i) => (
                <OrderBookRowSkeleton key={`bid-${i}`} side="bid" />
              ))}
            </div>
          </div>

          {/* Asks skeleton */}
          <div className="p-4">
            <OrderBookHeader />
            <div className="space-y-0.5 mt-2">
              {Array.from({ length: rowCount }).map((_, i) => (
                <OrderBookRowSkeleton key={`ask-${i}`} side="ask" />
              ))}
            </div>
          </div>
        </div>

        {showDepthChart && (
          <div className="p-4 border-t">
            <DepthChartSkeleton />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

/**
 * Order Book Empty State Props
 */
interface OrderBookEmptyStateProps {
  /** Error message */
  error?: string | null
  /** Retry callback */
  onRetry?: () => void
}

/**
 * Order Book Empty State Component
 *
 * Displayed when no order book data is available.
 */
function OrderBookEmptyState({ error, onRetry }: OrderBookEmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="text-6xl mb-4" role="img" aria-label="No data">
          {error ? '⚠️' : '📊'}
        </div>
        <h3 className="text-lg font-semibold mb-2">
          {error ? 'Error Loading Order Book' : 'No Orders Available'}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
          {error
            ? error
            : 'There are currently no active orders for this market. Check back later or place an order to start trading.'
          }
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Order Book Visual Component
 *
 * Complete order book visualization with split view, summary, and depth chart.
 *
 * @example
 * ```tsx
 * <OrderBookVisual
 *   orderBook={orderBookData}
 *   lastTrade={lastTradeData}
 *   isLoading={false}
 *   onPriceSelect={(price, side) => handleTrade(price, side)}
 *   selectedPrice={tradePrice}
 *   showDepthChart={true}
 *   showSummary={true}
 * />
 * ```
 */
export function OrderBookVisual({
  orderBook,
  lastTrade,
  previousPrice,
  isLoading = false,
  error = null,
  maxLevels = 20,
  showDepthChart = true,
  showSummary = true,
  onPriceSelect,
  selectedPrice,
  className
}: OrderBookVisualProps) {
  const [showDetail, setShowDetail] = useState(false)
  const [selectedSide, setSelectedSide] = useState<'bid' | 'ask'>('bid')

  // Calculate max total for bar scaling
  const maxTotal = useMemo(() => {
    if (!orderBook) return 10000
    return Math.max(
      orderBook.totalBidVolume,
      orderBook.totalAskVolume
    )
  }, [orderBook])

  // Handle price selection
  const handlePriceSelect = useCallback((price: number, side: 'bid' | 'ask') => {
    setSelectedSide(side)
    if (onPriceSelect) {
      onPriceSelect(price, side)
    }
  }, [onPriceSelect])

  // Handle side price selection
  const handleBidSelect = useCallback((price: number) => {
    handlePriceSelect(price, 'bid')
  }, [handlePriceSelect])

  const handleAskSelect = useCallback((price: number) => {
    handlePriceSelect(price, 'ask')
  }, [handlePriceSelect])

  // Loading state
  if (isLoading) {
    return (
      <OrderBookSkeleton
        showDepthChart={showDepthChart}
        showSummary={showSummary}
      />
    )
  }

  // Error or empty state
  if (error || !orderBook) {
    return (
      <OrderBookEmptyState
        error={error}
        onRetry={() => window.location.reload()}
      />
    )
  }

  return (
    <Card
      className={cn(
        'overflow-hidden',
        className
      )}
    >
      {/* Summary bar */}
      {showSummary && (
        <OrderBookSummary
          orderBook={orderBook}
          lastTrade={lastTrade}
          previousPrice={previousPrice}
          refreshInterval={5000}
          onToggleDetail={() => setShowDetail(!showDetail)}
          showDetail={showDetail}
        />
      )}

      <CardContent className="p-0">
        {/* Desktop: Split view side by side */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {/* YES bids (left) */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-green-500 dark:text-green-400">
                  YES (Buy)
                </h3>
                <span className="text-xs text-muted-foreground">
                  {orderBook.bids.length} levels
                </span>
              </div>
              <OrderBookSide
                levels={orderBook.bids}
                side="bid"
                maxTotal={maxTotal}
                selectedPrice={selectedPrice}
                onPriceSelect={handleBidSelect}
                maxLevels={maxLevels}
                showHeader={false}
              />
            </div>

            {/* NO asks (right) */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-red-500 dark:text-red-400">
                  NO (Sell)
                </h3>
                <span className="text-xs text-muted-foreground">
                  {orderBook.asks.length} levels
                </span>
              </div>
              <OrderBookSide
                levels={orderBook.asks}
                side="ask"
                maxTotal={maxTotal}
                selectedPrice={selectedPrice}
                onPriceSelect={handleAskSelect}
                maxLevels={maxLevels}
                showHeader={false}
              />
            </div>
          </div>
        </div>

        {/* Mobile: Tabbed view */}
        <div className="md:hidden">
          <Tabs defaultValue="bids" className="w-full">
            <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
              <TabsTrigger value="bids" className="data-[state=active]:bg-green-500/10">
                <span className="text-green-500 font-medium">YES</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {orderBook.bids.length}
                </span>
              </TabsTrigger>
              <TabsTrigger value="asks" className="data-[state=active]:bg-red-500/10">
                <span className="text-red-500 font-medium">NO</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {orderBook.asks.length}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="bids" className="p-4">
              <OrderBookSide
                levels={orderBook.bids}
                side="bid"
                maxTotal={maxTotal}
                selectedPrice={selectedPrice}
                onPriceSelect={handleBidSelect}
                maxLevels={maxLevels}
                compact={true}
              />
            </TabsContent>

            <TabsContent value="asks" className="p-4">
              <OrderBookSide
                levels={orderBook.asks}
                side="ask"
                maxTotal={maxTotal}
                selectedPrice={selectedPrice}
                onPriceSelect={handleAskSelect}
                maxLevels={maxLevels}
                compact={true}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Depth chart */}
        {showDepthChart && (
          <div className="border-t p-4">
            <DepthChart
              orderBook={orderBook}
              selectedPrice={selectedPrice}
              onPriceSelect={(price) => handlePriceSelect(price, selectedSide)}
              height={250}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

/**
 * Order Book Compact Props
 */
export interface OrderBookCompactProps {
  /** Order book data */
  orderBook: OrderBookData
  /** Last trade information */
  lastTrade?: LastTrade
  /** Price selection callback */
  onPriceSelect?: (price: number, side: 'bid' | 'ask') => void
  /** Custom class name */
  className?: string
}

/**
 * Order Book Compact Component
 *
 * Compact version showing only best bid/ask with mini depth chart.
 *
 * @example
 * ```tsx
 * <OrderBookCompact
 *   orderBook={orderBookData}
 *   onPriceSelect={(price, side) => console.log(price, side)}
 * />
 * ```
 */
export function OrderBookCompact({
  orderBook,
  lastTrade,
  onPriceSelect,
  className
}: OrderBookCompactProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-4">
        {/* Best bid/ask */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button
            onClick={() => onPriceSelect?.(orderBook.bestBid!, 'bid')}
            className="text-left p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
          >
            <div className="text-xs text-muted-foreground mb-1">Best Bid (YES)</div>
            <div className="text-lg font-semibold text-green-500 font-mono">
              {orderBook.bestBid !== undefined
                ? `${(orderBook.bestBid * 100).toFixed(1)}%`
                : '-'
              }
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {orderBook.bids[0]?.size
                ? `${orderBook.bids[0].size.toFixed(0)} available`
                : ''
              }
            </div>
          </button>

          <button
            onClick={() => onPriceSelect?.(orderBook.bestAsk!, 'ask')}
            className="text-left p-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors"
          >
            <div className="text-xs text-muted-foreground mb-1">Best Ask (NO)</div>
            <div className="text-lg font-semibold text-red-500 font-mono">
              {orderBook.bestAsk !== undefined
                ? `${(orderBook.bestAsk * 100).toFixed(1)}%`
                : '-'
              }
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {orderBook.asks[0]?.size
                ? `${orderBook.asks[0].size.toFixed(0)} available`
                : ''
              }
            </div>
          </button>
        </div>

        {/* Mini depth chart */}
        <div className="rounded-lg bg-muted/30 p-3">
          <div className="text-xs text-muted-foreground mb-2">Depth</div>
          <DepthChart
            orderBook={orderBook}
            height={120}
            showBrush={false}
          />
        </div>

        {/* Last trade */}
        {lastTrade && (
          <div className="mt-3 text-center text-xs text-muted-foreground">
            Last trade:{' '}
            <span className="font-mono">
              {(lastTrade.price * 100).toFixed(1)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default OrderBookVisual
export { OrderBookSkeleton, OrderBookEmptyState }
