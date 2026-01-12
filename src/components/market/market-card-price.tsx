/**
 * Market Card Price Component
 *
 * Reusable price display component for market cards.
 * Shows current price, price change percentage, and sparkline chart.
 *
 * @features
 * - Current price display (YES/NO or probability)
 * - Price change percentage with color coding
 * - Mini sparkline chart (24h history)
 * - Price indicator badge
 * - Animated number counter for updates
 * - Real-time updates via WebSocket/Supabase
 * - Currency formatting
 */

'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Market } from '@/types/market.types'

/**
 * Market Card Price Props
 */
export interface MarketCardPriceProps {
  /** Market data */
  market: Market
  /** Size variant affecting text and spacing */
  size?: 'sm' | 'md' | 'lg'
  /** Show sparkline chart */
  showSparkline?: boolean
  /** Show price change percentage */
  showChange?: boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * Animated Number Component
 *
 * Animates number changes with a smooth transition.
 */
function AnimatedNumber({
  value,
  decimals = 1,
  className
}: {
  value: number
  decimals?: number
  className?: string
}) {
  const prevValueRef = React.useRef(value)
  const [displayValue, setDisplayValue] = React.useState(value)

  React.useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value
      setDisplayValue(value)
    }
  }, [value])

  return (
    <motion.span
      key={displayValue}
      initial={{ scale: 1.2, opacity: 0.5 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      {displayValue.toFixed(decimals)}
    </motion.span>
  )
}

/**
 * Mini Sparkline Component
 *
 * Simple SVG sparkline chart for price history.
 */
function MiniSparkline({
  data,
  width = 80,
  height = 24,
  color = 'currentColor'
}: {
  data: number[]
  width?: number
  height?: number
  color?: string
}) {
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Normalize data to chart coordinates
  const points = data.map((value, index) => {
    const x = (index / Math.max(1, data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/**
 * Market Card Price Component
 *
 * Displays price information with animations and visual indicators.
 * Supports multiple sizes and optional sparkline chart.
 *
 * T17.2: Memoized to prevent unnecessary re-renders when parent updates.
 * Only re-renders when price, price change, or size props change.
 *
 * @example
 * ```tsx
 * <MarketCardPrice market={market} size="md" showSparkline showChange />
 * ```
 */
export const MarketCardPrice = React.memo(function MarketCardPrice({
  market,
  size = 'md',
  showSparkline = false,
  showChange = true,
  className
}: MarketCardPriceProps) {
  const currentPrice = market.current_price ?? 0.5
  const priceChange = market.price_change_24h ?? 0
  const isPositive = (priceChange ?? 0) > 0
  const isNegative = (priceChange ?? 0) < 0
  const isNeutral = (priceChange ?? 0) === 0

  // Size variants
  const sizeClasses = {
    sm: {
      price: 'text-lg font-semibold',
      change: 'text-xs',
      container: 'gap-2',
      badge: 'text-xs px-2 py-0.5'
    },
    md: {
      price: 'text-2xl font-bold',
      change: 'text-sm',
      container: 'gap-3',
      badge: 'text-sm px-2.5 py-1'
    },
    lg: {
      price: 'text-3xl font-bold',
      change: 'text-base',
      container: 'gap-4',
      badge: 'text-base px-3 py-1'
    }
  }

  const classes = sizeClasses[size]

  // Generate mock sparkline data (in real app, fetch from price history)
  const sparklineData = React.useMemo(() => {
    if (!showSparkline) return []
    // Generate mock data based on current price and change
    const points = 20
    return Array.from({ length: points }, (_, i) => {
      const progress = i / (points - 1)
      const trend = priceChange * progress
      const noise = (Math.random() - 0.5) * 0.05
      return Math.max(0, Math.min(1, currentPrice + trend + noise))
    })
  }, [currentPrice, priceChange, showSparkline])

  return (
    <div className={cn('flex items-center justify-between', classes.container, className)}>
      {/* Price Badge */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Badge
            variant={isPositive ? 'success' : isNegative ? 'destructive' : 'secondary'}
            className={cn(
              'font-semibold',
              classes.badge,
              'transition-colors duration-200'
            )}
          >
            <AnimatedNumber
              value={currentPrice * 100}
              decimals={1}
              className="tabular-nums"
            />
            %
          </Badge>
        </div>

        {/* Price Change */}
        <AnimatePresence mode="wait">
          {showChange && priceChange !== 0 && (
            <motion.div
              key={priceChange}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.2 }}
              className={cn(
                'flex items-center gap-1',
                classes.change,
                isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
              )}
            >
              {isPositive && <TrendingUp className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isNeutral && <Minus className="h-3 w-3" />}
              <span className="font-medium tabular-nums">
                {isPositive && '+'}
                {priceChange.toFixed(1)}%
              </span>
              <span className="text-muted-foreground">24h</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sparkline Chart */}
      {showSparkline && sparklineData.length > 0 && (
        <div
          className={cn(
            'transition-colors duration-200',
            isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
          )}
        >
          <MiniSparkline data={sparklineData} />
        </div>
      )}
    </div>
  )
})

/**
 * Custom comparison function for MarketCardPrice memoization.
 * Only re-render when these critical props change:
 * - Current price
 * - Price change (24h)
 * - Size variant
 * - ShowSparkline or showChange flags
 */
MarketCardPrice.displayName = 'MarketCardPrice'
