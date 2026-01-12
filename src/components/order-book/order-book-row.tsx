/**
 * Order Book Row Component
 *
 * Individual row component for a single price level in the order book.
 * Displays price, size, and cumulative total with visual bar and flash animations.
 *
 * @feature Optimized with React.memo
 * @feature Flash animations on updates
 * @feature Compact variant for dense display
 * @feature Accessibility with ARIA labels
 */

import { memo, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import type { OrderBookLevel } from './use-order-book-data'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Order Book Row Props
 */
export interface OrderBookRowProps {
  /** Order book level data */
  level: OrderBookLevel
  /** Side of the order book */
  side: 'bid' | 'ask'
  /** Whether to show compact view */
  compact?: boolean
  /** Maximum total for percentage calculation */
  maxTotal: number
  /** Whether this row is selected */
  selected?: boolean
  /** Click handler */
  onClick?: (price: number) => void
  /** Whether to show flash animation */
  flashUpdate?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Update Animation Type
 */
type UpdateAnimation = 'none' | 'flash-green' | 'flash-red' | 'fade-in'

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Order Book Row Component
 *
 * Displays a single price level with:
 * - Price (color coded by side)
 * - Size (number of shares/contracts)
 * - Total (cumulative with horizontal bar)
 * - Flash animation on updates
 *
 * @example
 * ```tsx
 * <OrderBookRow
 *   level={{ price: 0.65, size: 1000, total: 5000, totalPercent: 50 }}
 *   side="bid"
 *   maxTotal={10000}
 *   onClick={(price) => console.log('Selected price:', price)}
 * />
 * ```
 */
const OrderBookRowComponent = ({
  level,
  side,
  compact = false,
  maxTotal,
  selected = false,
  onClick,
  flashUpdate = false,
  className
}: OrderBookRowProps) => {
  const [animation, setAnimation] = useState<UpdateAnimation>('fade-in')

  // Trigger flash animation on update
  useEffect(() => {
    if (flashUpdate) {
      setAnimation(side === 'bid' ? 'flash-green' : 'flash-red')
      const timer = setTimeout(() => setAnimation('none'), 300)
      return () => clearTimeout(timer)
    }
  }, [flashUpdate, side])

  // Color classes based on side
  const colorClass = side === 'bid'
    ? 'text-green-500 dark:text-green-400'
    : 'text-red-500 dark:text-red-400'

  // Background bar color (more subtle)
  const barBgClass = side === 'bid'
    ? 'bg-green-500/10 dark:bg-green-400/10'
    : 'bg-red-500/10 dark:bg-red-400/10'

  // Format price as percentage
  const pricePercent = (level.price * 100).toFixed(1)

  // Format size with K suffix for large numbers
  const formatSize = (size: number): string => {
    if (size >= 1000000) return `${(size / 1000000).toFixed(1)}M`
    if (size >= 1000) return `${(size / 1000).toFixed(1)}K`
    return size.toFixed(0)
  }

  // Calculate bar width percentage
  const barWidth = maxTotal > 0 ? (level.total / maxTotal) * 100 : 0

  // Animation classes
  const animationClass = {
    'none': '',
    'flash-green': 'animate-flash-green',
    'flash-red': 'animate-flash-red',
    'fade-in': 'animate-fade-in'
  }[animation]

  const handleClick = () => {
    if (onClick) {
      onClick(level.price)
    }
  }

  return (
    <div
      role="row"
      aria-label={`${side} order at ${pricePercent}%`}
      className={cn(
        'group relative flex items-center gap-2 py-1.5 px-2 text-sm',
        'transition-all duration-200',
        'hover:bg-accent/50',
        selected && 'bg-accent',
        onClick && 'cursor-pointer',
        animationClass,
        className
      )}
      onClick={handleClick}
    >
      {/* Background bar visualization */}
      <div
        className={cn(
          'absolute inset-y-0 left-0 pointer-events-none',
          barBgClass,
          'transition-all duration-300 ease-out'
        )}
        style={{ width: `${barWidth}%` }}
      />

      {/* Price column */}
      <div className={cn(
        'relative z-10 font-mono font-medium',
        colorClass,
        'w-16 text-right shrink-0'
      )}>
        {pricePercent}¢
      </div>

      {/* Size column */}
      <div className={cn(
        'relative z-10 font-mono text-muted-foreground',
        'w-20 text-right shrink-0',
        !compact && 'hidden md:block'
      )}>
        {formatSize(level.size)}
      </div>

      {/* Total column with bar */}
      <div className="relative z-10 flex items-center gap-2 flex-1">
        <div className="font-mono text-muted-foreground w-16 text-right shrink-0">
          {formatSize(level.total)}
        </div>
        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300',
              side === 'bid'
                ? 'bg-green-500/80 dark:bg-green-400/80'
                : 'bg-red-500/80 dark:bg-red-400/80'
            )}
            style={{ width: `${level.totalPercent}%` }}
          />
        </div>
      </div>

      {/* Own order indicator */}
      {level.isOwnOrder && (
        <div className="relative z-10 ml-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        </div>
      )}
    </div>
  )
}

/**
 * Memoized Order Book Row
 *
 * Only re-renders when price, size, total, or side changes.
 * Optimized for performance with large order books.
 */
export const OrderBookRow = memo(OrderBookRowComponent, (prevProps, nextProps) => {
  return (
    prevProps.level.price === nextProps.level.price &&
    prevProps.level.size === nextProps.level.size &&
    prevProps.level.total === nextProps.level.total &&
    prevProps.side === nextProps.side &&
    prevProps.selected === nextProps.selected &&
    prevProps.compact === nextProps.compact
  )
})

OrderBookRow.displayName = 'OrderBookRow'

// ============================================================================
// SKELETON VARIANT
// ============================================================================

/**
 * Order Book Row Skeleton Props
 */
export interface OrderBookRowSkeletonProps {
  /** Side for color coding */
  side?: 'bid' | 'ask'
  /** Compact variant */
  compact?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Order Book Row Skeleton Component
 *
 * Loading skeleton for order book rows.
 *
 * @example
 * ```tsx
 * <OrderBookRowSkeleton side="bid" />
 * ```
 */
export function OrderBookRowSkeleton({
  side = 'bid',
  compact = false,
  className
}: OrderBookRowSkeletonProps) {
  const colorClass = side === 'bid'
    ? 'bg-green-500/20'
    : 'bg-red-500/20'

  return (
    <div
      role="status"
      aria-label="Loading order book row"
      className={cn(
        'flex items-center gap-2 py-1.5 px-2',
        className
      )}
    >
      <div className={cn('w-16 h-4 rounded animate-pulse', colorClass)} />
      <div className={cn('w-20 h-4 rounded animate-pulse bg-muted/50', !compact && 'hidden md:block')} />
      <div className="flex-1 flex items-center gap-2">
        <div className="w-16 h-4 rounded animate-pulse bg-muted/50" />
        <div className="flex-1 h-2 bg-muted/30 rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full animate-pulse', colorClass)} style={{ width: '40%' }} />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// HEADER COMPONENT
// ============================================================================

/**
 * Order Book Header Props
 */
export interface OrderBookHeaderProps {
  /** Compact variant */
  compact?: boolean
  /** Custom class name */
  className?: string
}

/**
 * Order Book Header Component
 *
 * Column headers for the order book.
 *
 * @example
 * ```tsx
 * <OrderBookHeader compact={false} />
 * ```
 */
export function OrderBookHeader({
  compact = false,
  className
}: OrderBookHeaderProps) {
  return (
    <div
      role="rowheader"
      className={cn(
        'flex items-center gap-2 py-2 px-2 text-xs font-medium text-muted-foreground border-b',
        className
      )}
    >
      <div className="w-16 text-right shrink-0">Price</div>
      <div className={cn('w-20 text-right shrink-0', !compact && 'hidden md:block')}>Size</div>
      <div className="flex-1 flex items-center gap-2">
        <div className="w-16 text-right shrink-0">Total</div>
        <div className="flex-1" />
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default OrderBookRow
