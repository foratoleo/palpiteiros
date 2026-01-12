/**
 * Position Card Component
 *
 * Mobile-first card component for individual positions.
 * Features vertical layout, swipe actions, expandable details, and mini sparkline.
 *
 * @features
 * - Vertical layout: market title, outcome badge, price info, PnL, actions
 * - Swipe-to-delete or swipe-to-close functionality
 * - Tap to expand for details
 * - Mini sparkline showing price history
 * - Quick actions: Close, View Market
 * - Compact variant for list view
 * - Optimized with React.memo
 * - Integration with position data
 *
 * @example
 * ```tsx
 * <PositionCard
 *   position={position}
 *   onClose={() => handleClose(position.id)}
 *   onViewMarket={() => router.push(`/markets/${position.marketId}`)}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import {
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Position } from '@/types/portfolio.types'

// ============================================================================
// TYPES
// ============================================================================

export interface PositionCardProps {
  /** Position data */
  position: Position
  /** Close position callback */
  onClose?: (position: Position) => void
  /** View market callback */
  onViewMarket?: (marketId: string) => void
  /** Card click callback */
  onClick?: (position: Position) => void
  /** Show sparkline chart */
  showSparkline?: boolean
  /** Price history data for sparkline */
  priceHistory?: Array<{ timestamp: string; price: number }>
  /** Compact variant */
  variant?: 'default' | 'compact'
  /** Custom CSS class names */
  className?: string
  /** Enable swipe actions */
  enableSwipe?: boolean
}

// ============================================================================
// FORMATTERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatPrice(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function formatSize(value: number): string {
  return value.toFixed(2)
}

// ============================================================================
// MINI SPARKLINE COMPONENT
// ============================================================================

interface MiniSparklineProps {
  data: number[]
  trend: 'up' | 'down' | 'neutral'
  className?: string
}

const MiniSparkline = React.memo(function MiniSparkline({
  data,
  trend,
  className
}: MiniSparklineProps) {
  const width = 60
  const height = 24
  const padding = 2

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * (width - 2 * padding)
    const y =
      height - padding - ((value - min) / range) * (height - 2 * padding)
    return `${x},${y}`
  })

  const color =
    trend === 'up' ? 'hsl(var(--success))' :
    trend === 'down' ? 'hsl(var(--danger))' :
    'hsl(var(--primary))'

  return (
    <svg
      width={width}
      height={height}
      className={className}
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        points={points.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface CardSkeletonProps {
  variant?: 'default' | 'compact'
}

function PositionCardSkeleton({ variant = 'default' }: CardSkeletonProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
        {variant === 'default' && (
          <div className="grid grid-cols-3 gap-4 mt-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PositionCard = React.memo(function PositionCard({
  position,
  onClose,
  onViewMarket,
  onClick,
  showSparkline = false,
  priceHistory,
  variant = 'default',
  className,
  enableSwipe = true
}: PositionCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [swipeProgress, setSwipeProgress] = React.useState(0)

  const x = useMotionValue(0)
  const rotate = useTransform(x, [-100, 0, 100], [-5, 0, 5])
  const opacity = useTransform(x, [-100, -50, 0, 50, 100], [0, 1, 1, 1, 0])

  // Calculate PnL
  const pnl = position.pnl ?? 0
  const pnlPercentage = position.pnl_percentage ?? 0
  const isProfit = pnl > 0
  const isLoss = pnl < 0

  // Calculate trend for sparkline
  const trend = priceHistory && priceHistory.length > 1
    ? (priceHistory[priceHistory.length - 1].price > priceHistory[0].price ? 'up' :
       priceHistory[priceHistory.length - 1].price < priceHistory[0].price ? 'down' : 'neutral')
    : isProfit ? 'up' : isLoss ? 'down' : 'neutral'

  // Sparkline data
  const sparklineData = priceHistory?.map((p) => p.price * 100) ?? []

  // Handle drag end for swipe action
  const handleDragEnd = (_event: any, info: PanInfo) => {
    if (!enableSwipe) return

    const threshold = 80
    if (info.offset.x > threshold) {
      // Swiped right - could be a custom action
      setSwipeProgress(0)
    } else if (info.offset.x < -threshold) {
      // Swiped left - close position
      if (onClose) {
        onClose(position)
      }
    }
    setSwipeProgress(0)
  }

  // Calculate position value
  const currentValue = position.current_price
    ? position.size * position.current_price
    : position.size * position.average_price

  const investedValue = position.size * position.average_price

  const isCompact = variant === 'compact'

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={enableSwipe ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        variant="glass"
        className={cn(
          'overflow-hidden transition-all duration-200',
          'hover:shadow-md',
          onClick && 'cursor-pointer',
          className
        )}
        onClick={() => {
          setIsExpanded(!isExpanded)
          onClick?.(position)
        }}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            {/* Market info */}
            <div className="flex-1 min-w-0">
              {/* Expand button (mobile) */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="md:hidden flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors mb-1"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Title */}
              <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                {position.market.question}
              </h3>

              {/* Badges */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant={position.outcome.toLowerCase() === 'yes' ? 'success' : 'destructive'}
                  className="text-xs font-semibold"
                >
                  {position.outcome.toUpperCase()}
                </Badge>
                {position.market.closed ? (
                  <Badge variant="secondary" className="text-xs">Closed</Badge>
                ) : position.market.active ? (
                  <Badge variant="success" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                )}
              </div>
            </div>

            {/* PnL display */}
            <div className="shrink-0 text-right">
              <motion.p
                key={pnl}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className={cn(
                  'text-lg font-bold font-mono',
                  isProfit && 'text-success',
                  isLoss && 'text-danger'
                )}
              >
                {pnl > 0 ? '+' : ''}{formatCurrency(pnl)}
              </motion.p>
              <p
                className={cn(
                  'text-xs font-medium',
                  isProfit && 'text-success',
                  isLoss && 'text-danger'
                )}
              >
                {pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Sparkline */}
          {showSparkline && sparklineData.length > 1 && (
            <div className="mt-3 flex items-center gap-2">
              <MiniSparkline data={sparklineData} trend={trend} />
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-danger" />}
            </div>
          )}

          {/* Price info row */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            {/* Avg Price */}
            <div>
              <p className="text-xs text-muted-foreground">Avg Price</p>
              <p className="text-sm font-semibold font-mono">{formatPrice(position.average_price)}</p>
            </div>

            {/* Current Price */}
            <div>
              <p className="text-xs text-muted-foreground">Current</p>
              {position.current_price !== null ? (
                <p className="text-sm font-semibold font-mono">{formatPrice(position.current_price)}</p>
              ) : (
                <p className="text-sm text-muted-foreground">-</p>
              )}
            </div>

            {/* Size */}
            <div>
              <p className="text-xs text-muted-foreground">Size</p>
              <p className="text-sm font-semibold font-mono">{formatSize(position.size)}</p>
            </div>
          </div>

          {/* Expanded details */}
          {isExpanded && !isCompact && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 pt-4 border-t border-border/50 space-y-3"
            >
              {/* Additional stats */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Invested</p>
                  <p className="text-sm font-semibold">{formatCurrency(investedValue)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current Value</p>
                  <p className="text-sm font-semibold">{formatCurrency(currentValue)}</p>
                </div>
              </div>

              {/* Category */}
              {position.market.category && (
                <div>
                  <p className="text-xs text-muted-foreground">Category</p>
                  <p className="text-sm font-medium capitalize">{position.market.category}</p>
                </div>
              )}

              {/* Entry date */}
              <div>
                <p className="text-xs text-muted-foreground">Entry Date</p>
                <p className="text-sm">{new Date(position.created_at ?? new Date()).toLocaleDateString()}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewMarket?.(position.market_id)
                  }}
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Market
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex-1"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClose?.(position)
                  }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </Button>
              </div>
            </motion.div>
          )}

          {/* Quick actions (compact mode) */}
          {isCompact && (
            <div className="flex gap-2 mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8"
                onClick={(e) => {
                  e.stopPropagation()
                  onViewMarket?.(position.market_id)
                }}
              >
                <ExternalLink className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 h-8 text-danger hover:text-danger"
                onClick={(e) => {
                  e.stopPropagation()
                  onClose?.(position)
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
})

PositionCard.displayName = 'PositionCard'

export { PositionCardSkeleton }
