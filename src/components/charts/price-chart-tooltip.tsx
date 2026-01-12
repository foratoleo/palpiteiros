/**
 * Price Chart Tooltip Component
 *
 * Custom tooltip for Recharts price chart.
 * Features glassmorphism design, smooth animations, and accessibility support.
 * Shows date/time, price, and price change percentage.
 *
 * @feature Glassmorphism card with backdrop-blur
 * @feature Trend-based color coding (green up, red down)
 * @feature Smooth fade in/out animations
 * @feature Keyboard focusable with ARIA labels
 * @feature Responsive sizing for mobile
 * @feature Dark mode support
 */

'use client'

import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { format, isValid, parseISO } from 'date-fns'
import type { Payload } from 'recharts/types/component/DefaultTooltipContent'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface PriceChartTooltipProps {
  /** Whether tooltip is active */
  active?: boolean
  /** Payload data from Recharts */
  payload?: Payload<any, string>[]
  /** Label (timestamp) */
  label?: string
  /** Price trend for color coding */
  trend?: 'up' | 'down' | 'neutral'
  /** Custom CSS class names */
  className?: string
  /** Show volume in tooltip */
  showVolume?: boolean
  /** Format as percentage or decimal */
  format?: 'percent' | 'decimal'
  /** Custom formatter for values */
  valueFormatter?: (value: number) => string
}

export type TrendDirection = 'up' | 'down' | 'neutral'

// ============================================================================
// UTILS
// ============================================================================

/**
 * Format price based on format option
 */
function formatPrice(price: number, format: 'percent' | 'decimal' = 'percent'): string {
  if (format === 'decimal') {
    return price.toFixed(4)
  }
  return `${price.toFixed(1)}%`
}

/**
 * Format timestamp for tooltip header
 */
function formatTooltipDate(timestamp: string): string {
  const date = typeof timestamp === 'string' ? parseISO(timestamp) : new Date(timestamp)
  if (!isValid(date)) return timestamp

  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const isThisYear = date.getFullYear() === now.getFullYear()

  if (isToday) {
    return format(date, 'HH:mm')
  } else if (isThisYear) {
    return format(date, 'MMM d, HH:mm')
  }
  return format(date, 'MMM d, yyyy')
}

/**
 * Calculate price change from previous price
 */
function calculatePriceChange(current: number, previous?: number): number | null {
  if (previous === undefined || previous === 0) return null
  return ((current - previous) / previous) * 100
}

// ============================================================================
// STYLES
// ============================================================================

const tooltipStyles = {
  container: cn(
    'rounded-lg shadow-lg pointer-events-none',
    'bg-background/80 backdrop-blur-md',
    'border border-border/50',
    'px-3 py-2 min-w-[140px]'
  ),
  trendUp: 'text-success',
  trendDown: 'text-danger',
  trendNeutral: 'text-muted-foreground',
  label: 'text-xs text-muted-foreground mb-1',
  valueRow: 'flex items-center justify-between gap-4',
  valueLabel: 'text-xs text-muted-foreground',
  valuePrice: 'text-sm font-semibold tabular-nums',
  changePositive: 'text-xs font-medium text-success',
  changeNegative: 'text-xs font-medium text-danger',
  changeNeutral: 'text-xs font-medium text-muted-foreground',
  volume: 'text-xs text-muted-foreground mt-1 pt-1 border-t border-border/50',
  dot: 'w-2 h-2 rounded-full mr-2'
}

// ============================================================================
// TOOLTIP ROW COMPONENT
// ============================================================================

interface TooltipRowProps {
  label: string
  value: string
  change?: number | null
  valueColor?: string
}

function TooltipRow({ label, value, change, valueColor }: TooltipRowProps) {
  return (
    <div className={tooltipStyles.valueRow}>
      <span className={tooltipStyles.valueLabel}>{label}</span>
      <div className="flex items-center gap-2">
        {change !== null && change !== undefined && (
          <span
            className={cn(
              change > 0 && tooltipStyles.changePositive,
              change < 0 && tooltipStyles.changeNegative,
              change === 0 && tooltipStyles.changeNeutral
            )}
          >
            {change > 0 ? '+' : ''}
            {change.toFixed(1)}%
          </span>
        )}
        <span
          className={cn(tooltipStyles.valuePrice, valueColor)}
          style={valueColor ? undefined : { color: 'hsl(var(--foreground))' }}
        >
          {value}
        </span>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PriceChartTooltip = React.memo(function PriceChartTooltip({
  active,
  payload,
  label,
  trend = 'neutral',
  className,
  showVolume = true,
  format = 'percent',
  valueFormatter
}: PriceChartTooltipProps) {
  // Extract data from payload
  const data = useMemo(() => {
    if (!active || !payload || payload.length === 0) return null

    const point = payload[0]?.payload
    if (!point) return null

    return {
      timestamp: point.timestamp as string,
      formattedTime: point.formattedTime as string,
      priceYes: point.priceYes as number,
      priceNo: point.priceNo as number,
      pricePercent: point.pricePercent as number,
      volume: point.volume as number | undefined
    }
  }, [active, payload])

  // Calculate trend color
  const trendColor = useMemo(() => {
    if (trend === 'up') return 'hsl(var(--success))'
    if (trend === 'down') return 'hsl(var(--danger))'
    return 'hsl(var(--muted-foreground))'
  }, [trend])

  // Format value
  const formatValue = React.useCallback(
    (value: number): string => {
      if (valueFormatter) return valueFormatter(value)
      return formatPrice(value, format)
    },
    [valueFormatter, format]
  )

  if (!active || !data) {
    return null
  }

  // Calculate YES price change (from NO price, since YES + NO = 1)
  const yesChange = calculatePriceChange(data.pricePercent * 100, data.priceNo * 100)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 4 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        className={cn(tooltipStyles.container, className)}
        role="tooltip"
        aria-label={`Price at ${data.formattedTime}: ${formatValue(data.pricePercent * 100)}`}
      >
        {/* Timestamp */}
        <div className={tooltipStyles.label}>
          {formatTooltipDate(data.timestamp)}
        </div>

        {/* YES Price */}
        <TooltipRow
          label="YES"
          value={formatValue(data.pricePercent * 100)}
          change={yesChange}
          valueColor={trendColor}
        />

        {/* NO Price */}
        <TooltipRow
          label="NO"
          value={formatValue(100 - data.pricePercent * 100)}
          valueColor="hsl(var(--muted-foreground))"
        />

        {/* Volume */}
        {showVolume && data.volume !== undefined && (
          <div className={tooltipStyles.volume}>
            Vol: {data.volume.toLocaleString()}
          </div>
        )}

        {/* Trend indicator dot */}
        <div className="absolute top-3 right-3">
          <div
            className={cn(tooltipStyles.dot, 'opacity-50')}
            style={{ backgroundColor: trendColor }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

PriceChartTooltip.displayName = 'PriceChartTooltip'

// ============================================================================
// COMPACT TOOLTIP FOR MOBILE
// ============================================================================

export interface CompactTooltipProps {
  active?: boolean
  payload?: PriceChartTooltipProps['payload']
  trend?: TrendDirection
  format?: 'percent' | 'decimal'
}

export const CompactTooltip = React.memo(function CompactTooltip({
  active,
  payload,
  trend = 'neutral',
  format = 'percent'
}: CompactTooltipProps) {
  const data = useMemo(() => {
    if (!active || !payload || payload.length === 0) return null
    return payload[0]?.payload
  }, [active, payload])

  if (!active || !data) return null

  const price = (data.pricePercent as number) * 100
  const trendColor =
    trend === 'up' ? 'text-success' : trend === 'down' ? 'text-danger' : 'text-foreground'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-2 py-1 rounded bg-background/90 backdrop-blur text-xs"
    >
      <span className={cn('font-semibold tabular-nums', trendColor)}>
        {format === 'percent' ? `${price.toFixed(1)}%` : price.toFixed(4)}
      </span>
    </motion.div>
  )
})

CompactTooltip.displayName = 'CompactTooltip'
