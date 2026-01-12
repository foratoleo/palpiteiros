/**
 * Movement Indicator Component
 *
 * Visual indicator showing price trend direction and magnitude.
 * Features animated arrow icons and color-coded gradients.
 *
 * @features
 * - Animated arrow icons (trending-up/down/flat)
 * - Color-coded by direction (green/red/gray)
 * - Optional percentage display
 * - Smooth animation on value changes
 * - Responsive sizing
 */

'use client'

import * as React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * MovementIndicator Props
 */
export interface MovementIndicatorProps {
  /** Current price (0-1) */
  currentPrice: number
  /** Previous price (0-1) */
  previousPrice: number
  /** Show percentage change alongside arrow */
  showPercentage?: boolean
  /** Size of the icon */
  size?: number
  /** Additional CSS class names */
  className?: string
}

/**
 * MovementIndicator Component
 *
 * Displays an arrow indicator showing price trend direction.
 * Color-coded: green for up, red for down, gray for neutral.
 *
 * @example
 * ```tsx
 * <MovementIndicator
 *   currentPrice={0.65}
 *   previousPrice={0.50}
 *   showPercentage
 *   size={16}
 * />
 * ```
 */
export const MovementIndicator = React.memo<MovementIndicatorProps>(({
  currentPrice,
  previousPrice,
  showPercentage = false,
  size = 16,
  className
}) => {
  /**
   * Calculate price change
   */
  const priceChange = React.useMemo(() => {
    return currentPrice - previousPrice
  }, [currentPrice, previousPrice])

  /**
   * Calculate percentage change
   */
  const percentageChange = React.useMemo(() => {
    if (previousPrice === 0) return 0
    return ((currentPrice - previousPrice) / previousPrice) * 100
  }, [currentPrice, previousPrice])

  /**
   * Determine trend direction
   */
  const trend = React.useMemo(() => {
    if (Math.abs(priceChange) < 0.001) return 'neutral'
    return priceChange > 0 ? 'up' : 'down'
  }, [priceChange])

  /**
   * Get icon based on trend
   */
  const Icon = React.useMemo(() => {
    switch (trend) {
      case 'up':
        return TrendingUp
      case 'down':
        return TrendingDown
      default:
        return Minus
    }
  }, [trend])

  /**
   * Get color based on trend
   */
  const colorClass = React.useMemo(() => {
    switch (trend) {
      case 'up':
        return 'text-green-500 dark:text-green-400'
      case 'down':
        return 'text-red-500 dark:text-red-400'
      default:
        return 'text-gray-400 dark:text-gray-500'
    }
  }, [trend])

  /**
   * Format percentage for display
   */
  const formattedPercentage = React.useMemo(() => {
    const absValue = Math.abs(percentageChange)
    if (absValue < 0.01) return '<0.01%'
    return `${absValue.toFixed(2)}%`
  }, [percentageChange])

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        colorClass,
        className
      )}
      aria-label={`Price ${trend === 'up' ? 'increased' : trend === 'down' ? 'decreased' : 'unchanged'}${showPercentage ? ` by ${formattedPercentage}` : ''}`}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 400,
          damping: 17
        }}
      >
        <Icon
          size={size}
          strokeWidth={2.5}
          className={cn(
            'transition-transform duration-200',
            trend === 'up' && 'rotate-0',
            trend === 'down' && 'rotate-180'
          )}
        />
      </motion.div>

      {showPercentage && (
        <motion.span
          initial={{ opacity: 0, x: -5 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className={cn(
            'text-sm font-medium tabular-nums',
            'bg-gradient-to-r bg-clip-text text-transparent',
            trend === 'up' && 'from-green-500 to-emerald-500',
            trend === 'down' && 'from-red-500 to-rose-500',
            trend === 'neutral' && 'from-gray-400 to-gray-500'
          )}
        >
          {formattedPercentage}
        </motion.span>
      )}
    </div>
  )
})

MovementIndicator.displayName = 'MovementIndicator'
