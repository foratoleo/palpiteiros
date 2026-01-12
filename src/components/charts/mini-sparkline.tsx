/**
 * Mini Sparkline Component
 *
 * Compact line chart for market cards showing price trend.
 * Optimized for rendering many instances with minimal overhead.
 * Apple-inspired design with smooth curves and trend-based coloring.
 *
 * @feature Tiny line chart (60-80px wide, 20-30px tall)
 * @feature No axes, grid, or labels
 * @feature Trend-based coloring (green up, red down)
 * @feature Smooth curve with 1.5px stroke
 * @feature Optional fill area with low opacity
 * @feature Hover: expand slightly, show tooltip
 * @feature Performance optimized for many instances
 */

'use client'

import React, { useMemo, useRef, useEffect } from 'react'
import { LineChart, Line, Area, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface MiniSparklineProps {
  /** Price data points */
  data: Array<{ timestamp: string; priceYes: number; priceNo?: number }>
  /** Width in pixels */
  width?: number
  /** Height in pixels */
  height?: number
  /** Show fill area under line */
  showArea?: boolean
  /** Custom stroke color (overrides trend color) */
  strokeColor?: string
  /** Custom fill color */
  fillColor?: string
  /** Stroke width in pixels */
  strokeWidth?: number
  /** Smooth curve (monotone) or straight lines */
  smooth?: boolean
  /** Expand on hover */
  expandOnHover?: boolean
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Custom CSS class names */
  className?: string
  /** Click handler */
  onClick?: () => void
  /** Disable animations */
  disableAnimation?: boolean
  /** Data key to use (priceYes or priceNo) */
  dataKey?: 'priceYes' | 'priceNo'
}

export interface SparklineData {
  time: string
  value: number
}

// ============================================================================
// UTILS
// ============================================================================

/**
 * Calculate trend from price data
 */
function calculateTrend(data: Array<{ priceYes: number }>): 'up' | 'down' | 'neutral' {
  if (data.length < 2) return 'neutral'

  const first = data[0].priceYes
  const last = data[data.length - 1].priceYes
  const threshold = 0.01 // 1% threshold for neutral

  const change = (last - first) / first

  if (change > threshold) return 'up'
  if (change < -threshold) return 'down'
  return 'neutral'
}

/**
 * Normalize data to 0-100 range
 */
function normalizeData(data: Array<{ priceYes: number }>): SparklineData[] {
  if (data.length === 0) return []

  const prices = data.map((d) => d.priceYes)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1

  return data.map((d, i) => ({
    time: String(i),
    value: ((d.priceYes - min) / range) * 100
  }))
}

/**
 * Sample data to reduce points for performance
 */
function sampleData(data: Array<{ priceYes: number }>, maxPoints: number = 20): typeof data {
  if (data.length <= maxPoints) return data

  const step = Math.ceil(data.length / maxPoints)
  return data.filter((_, i) => i % step === 0)
}

// ============================================================================
// STYLES
// ============================================================================

const trendColors = {
  up: {
    stroke: 'hsl(var(--success))',
    fill: 'hsl(var(--success) / 0.2)'
  },
  down: {
    stroke: 'hsl(var(--danger))',
    fill: 'hsl(var(--danger) / 0.2)'
  },
  neutral: {
    stroke: 'hsl(var(--muted-foreground))',
    fill: 'hsl(var(--muted-foreground) / 0.1)'
  }
}

// ============================================================================
// TOOLTIP COMPONENT
// ============================================================================

interface SparklineTooltipProps {
  data: SparklineData[]
  position: { x: number; y: number }
  value: number
  visible: boolean
}

function SparklineTooltip({ data, position, value, visible }: SparklineTooltipProps) {
  if (!visible) return null

  const firstPrice = data[0]?.value || 0
  const change = ((value - firstPrice) / firstPrice) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="absolute z-50 px-2 py-1 bg-background/90 backdrop-blur text-xs rounded shadow-lg border border-border/50 whitespace-nowrap"
      style={{
        left: position.x,
        top: position.y - 40,
        transform: 'translateX(-50%)'
      }}
    >
      <span className="font-medium tabular-nums">{value.toFixed(1)}%</span>
      <span
        className={cn(
          'ml-1',
          change > 0 && 'text-success',
          change < 0 && 'text-danger'
        )}
      >
        {change > 0 ? '+' : ''}
        {change.toFixed(1)}%
      </span>
    </motion.div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const MiniSparkline = React.memo(function MiniSparkline({
  data,
  width = 80,
  height = 24,
  showArea = false,
  strokeColor,
  fillColor,
  strokeWidth = 1.5,
  smooth = true,
  expandOnHover = false,
  showTooltip = false,
  className,
  onClick,
  disableAnimation = false,
  dataKey = 'priceYes'
}: MiniSparklineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltipState, setTooltipState] = React.useState<{
    visible: boolean
    x: number
    y: number
    value: number
  }>({ visible: false, x: 0, y: 0, value: 0 })

  // Calculate trend
  const trend = useMemo(() => calculateTrend(data), [data])

  // Get colors based on trend or custom colors
  const colors = useMemo(() => {
    if (strokeColor) {
      return {
        stroke: strokeColor,
        fill: fillColor || trendColors.neutral.fill
      }
    }
    return trendColors[trend]
  }, [trend, strokeColor, fillColor])

  // Process data: sample and normalize
  const chartData = useMemo(() => {
    const sampled = sampleData(data, 20)
    return normalizeData(sampled)
  }, [data])

  // Gradient defs
  const gradientId = useMemo(
    () => `sparkline-gradient-${Math.random().toString(36).slice(2, 9)}`,
    []
  )

  // Handle mouse move for tooltip
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent) => {
      if (!showTooltip || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const dataIndex = Math.round((x / rect.width) * (chartData.length - 1))
      const clampedIndex = Math.max(0, Math.min(chartData.length - 1, dataIndex))
      const value = chartData[clampedIndex]?.value || 0

      setTooltipState({
        visible: true,
        x,
        y: e.clientY - rect.top,
        value
      })
    },
    [showTooltip, chartData]
  )

  const handleMouseLeave = React.useCallback(() => {
    setTooltipState((prev) => ({ ...prev, visible: false }))
  }, [])

  // Empty state
  if (data.length === 0) {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        style={{ width, height }}
        aria-label="No price data"
      >
        <div className="w-full h-full bg-muted/10 rounded" />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className={cn('relative inline-block', className)}
      style={{ width, height }}
      onMouseMove={showTooltip ? handleMouseMove : undefined}
      onMouseLeave={showTooltip ? handleMouseLeave : undefined}
      onClick={onClick}
      role="img"
      aria-label={`Price trend: ${trend}`}
    >
      <motion.div
        initial={{ opacity: disableAnimation ? 1 : 0.6 }}
        animate={{ opacity: 1, scale: expandOnHover && tooltipState.visible ? 1.02 : 1 }}
        transition={{ duration: 0.15 }}
        className={cn(onClick && 'cursor-pointer')}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            {/* Gradient for area fill */}
            {showArea && (
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.fill} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={colors.fill} stopOpacity={0} />
                </linearGradient>
              </defs>
            )}

            {/* Area fill */}
            {showArea && (
              <Area
                type={smooth ? 'monotone' : 'linear'}
                dataKey="value"
                fill={`url(#${gradientId})`}
                stroke="none"
                isAnimationActive={false}
              />
            )}

            {/* Line */}
            <Line
              type={smooth ? 'monotone' : 'linear'}
              dataKey="value"
              stroke={colors.stroke}
              strokeWidth={strokeWidth}
              dot={false}
              activeDot={false}
              isAnimationActive={!disableAnimation}
              animationDuration={300}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tooltip */}
      {showTooltip && containerRef.current && (
        <SparklineTooltip
          data={chartData}
          position={{ x: tooltipState.x, y: tooltipState.y }}
          value={tooltipState.value}
          visible={tooltipState.visible}
        />
      )}
    </div>
  )
})

MiniSparkline.displayName = 'MiniSparkline'

// ============================================================================
// BATCH SPARKLINE RENDERER (Optimized for lists)
// ============================================================================

export interface SparklineBatchProps {
  /** Array of data arrays, one for each sparkline */
  dataList: Array<Array<{ timestamp: string; priceYes: number }>>
  /** Common width */
  width?: number
  /** Common height */
  height?: number
  /** Custom CSS class names */
  className?: string
  /** Click handler */
  onClick?: (index: number) => void
}

/**
 * Optimized batch renderer for multiple sparklines
 * Uses shared computations and minimal re-renders
 */
export const SparklineBatch = React.memo(function SparklineBatch({
  dataList,
  width = 60,
  height = 20,
  className,
  onClick
}: SparklineBatchProps) {
  // Pre-compute trends for all data
  const trends = useMemo(
    () => dataList.map((data) => calculateTrend(data)),
    [dataList]
  )

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {dataList.map((data, i) => (
        <MiniSparkline
          key={i}
          data={data}
          width={width}
          height={height}
          onClick={onClick ? () => onClick(i) : undefined}
          className="cursor-pointer"
          strokeColor={trendColors[trends[i]].stroke}
          disableAnimation
        />
      ))}
    </div>
  )
})

SparklineBatch.displayName = 'SparklineBatch'

// ============================================================================
// TREND INDICATOR COMPONENT (Colored dot + sparkline)
// ============================================================================

export interface TrendIndicatorProps {
  data: Array<{ timestamp: string; priceYes: number }>
  changePercent?: number
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  className?: string
}

export const TrendIndicator = React.memo(function TrendIndicator({
  data,
  changePercent,
  size = 'sm',
  showLabel = true,
  className
}: TrendIndicatorProps) {
  const trend = useMemo(() => calculateTrend(data), [data])

  const sizes = {
    sm: { width: 40, height: 16 },
    md: { width: 60, height: 20 },
    lg: { width: 80, height: 24 }
  }

  const calculatedChange = useMemo(() => {
    if (changePercent !== undefined) return changePercent
    if (data.length < 2) return 0
    const first = data[0].priceYes
    const last = data[data.length - 1].priceYes
    return ((last - first) / first) * 100
  }, [data, changePercent])

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {/* Sparkline */}
      <MiniSparkline
        data={data}
        width={sizes[size].width}
        height={sizes[size].height}
        disableAnimation
      />

      {/* Label with change percent */}
      {showLabel && (
        <span
          className={cn(
            'text-xs font-medium tabular-nums',
            trend === 'up' && 'text-success',
            trend === 'down' && 'text-danger',
            trend === 'neutral' && 'text-muted-foreground'
          )}
        >
          {calculatedChange > 0 ? '+' : ''}
          {calculatedChange.toFixed(1)}%
        </span>
      )}
    </div>
  )
})

TrendIndicator.displayName = 'TrendIndicator'
