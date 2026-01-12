/**
 * Price Chart Component
 *
 * Main price chart using Recharts for displaying market price history.
 * Features smooth curves, gradient fills, crosshair interaction, and zoom/pan.
 * Apple-inspired design with glassmorphism and smooth animations.
 *
 * @feature Recharts LineChart with smooth monotone curves
 * @feature Responsive container with aspect ratio
 * @feature Custom tooltip with glassmorphism
 * @feature Zoom/pan support for detailed analysis
 * @feature Loading and empty states
 * @feature Dark mode support with CSS variables
 * @feature Accessibility with keyboard navigation and ARIA labels
 */

'use client'

import React, { useMemo, useState, useRef, useCallback } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Brush,
  TooltipProps
} from 'recharts'
import type { ValueType, NameType } from 'recharts/types/component/DefaultTooltipContent'
import { format, isValid, parseISO } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus, Maximize2, Download } from 'lucide-react'

import { PriceChartTooltip } from './price-chart-tooltip'
import { PriceChartControls } from './price-chart-controls'
import { useChartData } from './use-chart-data'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface PriceChartProps {
  /** Market ID for fetching price history */
  marketId: string
  /** Initial time range */
  initialTimeRange?: '1H' | '24H' | '7D' | '30D' | 'ALL'
  /** Chart height in pixels */
  height?: number
  /** Aspect ratio (width/height) for responsive sizing */
  aspectRatio?: number
  /** Show gradient area under line */
  showArea?: boolean
  /** Show grid lines */
  showGrid?: boolean
  /** Show brush (zoom/pan) */
  showBrush?: boolean
  /** Show reference line at 50% */
  showReferenceLine?: boolean
  /** Custom CSS class names */
  className?: string
  /** Data override (skips fetching) */
  data?: Array<{ timestamp: string; priceYes: number; priceNo: number }>
  /** Loading state */
  isLoading?: boolean
  /** Disable animations */
  disableAnimation?: boolean
  /** Chart display variant */
  variant?: 'default' | 'compact' | 'minimal'
}

export type ChartTimeRange = '1H' | '24H' | '7D' | '30D' | 'ALL'

export type ChartType = 'line' | 'area' | 'candlestick'

interface ChartDataPoint {
  timestamp: string
  formattedTime: string
  priceYes: number
  priceNo: number
  pricePercent: number
  volume?: number
}

// ============================================================================
// TIME RANGE CONFIG
// ============================================================================

const TIME_RANGE_LABELS: Record<ChartTimeRange, string> = {
  '1H': '1H',
  '24H': '24H',
  '7D': '7D',
  '30D': '30D',
  'ALL': 'ALL'
}

// ============================================================================
// STYLES
// ============================================================================

const chartColors = {
  // Trend colors
  up: 'hsl(var(--success) / 0.9)',
  down: 'hsl(var(--danger) / 0.9)',
  neutral: 'hsl(var(--muted-foreground) / 0.9)',
  // Line colors
  lineUp: 'hsl(var(--success))',
  lineDown: 'hsl(var(--danger))',
  lineNeutral: 'hsl(var(--primary))',
  // Area gradient
  areaStart: 'hsl(var(--success) / 0.3)',
  areaEnd: 'hsl(var(--success) / 0)',
  areaDownStart: 'hsl(var(--danger) / 0.3)',
  areaDownEnd: 'hsl(var(--danger) / 0)',
  // Grid
  grid: 'hsl(var(--border) / 0.5)',
  // Reference line
  reference: 'hsl(var(--muted-foreground) / 0.3)'
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface ChartSkeletonProps {
  height?: number
  variant?: PriceChartProps['variant']
}

function ChartSkeleton({ height = 300, variant = 'default' }: ChartSkeletonProps) {
  const isCompact = variant === 'compact' || variant === 'minimal'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg',
        isCompact ? 'h-32' : 'h-full'
      )}
      style={{ minHeight: isCompact ? undefined : height }}
      role="status"
      aria-label="Loading chart data"
    >
      {/* Animated shimmer effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite]">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      </div>

      {/* Skeleton lines */}
      <div className="absolute inset-0 flex items-end justify-between p-4">
        {[...Array(isCompact ? 5 : 10)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1 bg-muted/30 rounded-full"
            initial={{ height: 0 }}
            animate={{ height: `${20 + Math.random() * 60}%` }}
            transition={{
              duration: 0.8,
              delay: i * 0.05,
              ease: 'easeOut'
            }}
          />
        ))}
      </div>

      {/* Skeleton label */}
      {!isCompact && (
        <div className="absolute top-4 left-4">
          <div className="h-4 w-24 bg-muted/20 rounded animate-pulse" />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message?: string
  onRetry?: () => void
}

function EmptyState({ message = 'No price data available', onRetry }: EmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full min-h-[200px] text-center p-6"
      role="status"
      aria-label="No data available"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <Minus className="w-6 h-6 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <p className="text-sm text-muted-foreground">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:underline"
          >
            Try Again
          </button>
        )}
      </motion.div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PriceChart = React.memo(function PriceChart({
  marketId,
  initialTimeRange = '7D',
  height = 300,
  aspectRatio,
  showArea = true,
  showGrid = true,
  showBrush = false,
  showReferenceLine = true,
  className,
  data: dataProp,
  isLoading: isLoadingProp,
  disableAnimation = false,
  variant = 'default'
}: PriceChartProps) {
  // State
  const [timeRange, setTimeRange] = useState<ChartTimeRange>(initialTimeRange)
  const [chartType, setChartType] = useState<ChartType>('area')
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Refs
  const chartRef = useRef<HTMLDivElement>(null)

  // Process data
  const { data, trend, priceChange, isLoading, isEmpty, refetch } = useChartData({
    marketId,
    timeRange,
    data: dataProp,
    isLoading: isLoadingProp
  })

  // Determine colors based on trend
  const colors = useMemo(() => {
    if (trend === 'up') {
      return {
        line: chartColors.lineUp,
        areaStart: chartColors.areaStart,
        areaEnd: chartColors.areaEnd
      }
    } else if (trend === 'down') {
      return {
        line: chartColors.lineDown,
        areaStart: chartColors.areaDownStart,
        areaEnd: chartColors.areaDownEnd
      }
    }
    return {
      line: chartColors.lineNeutral,
      areaStart: 'hsl(var(--primary) / 0.2)',
      areaEnd: 'hsl(var(--primary) / 0)'
    }
  }, [trend])

  // Memoized chart configuration
  const chartConfig = useMemo(() => {
    const isCompact = variant === 'compact' || variant === 'minimal'

    return {
      // Y-axis domain (0-100%)
      domain: [0, 100],
      // Grid config
      grid: {
        stroke: chartColors.grid,
        strokeDasharray: isCompact ? '0' : '3 3',
        vertical: false,
        horizontal: showGrid
      },
      // Axis config
      axis: {
        stroke: chartColors.grid,
        fontSize: isCompact ? 10 : 12,
        tickMargin: isCompact ? 4 : 8
      },
      // Line config
      line: {
        strokeWidth: isCompact ? 1.5 : 2,
        dot: false,
        activeDot: {
          r: isCompact ? 3 : 4,
          strokeWidth: 2,
          fill: 'hsl(var(--background))'
        }
      }
    }
  }, [showGrid, variant])

  // Handle time range change
  const handleTimeRangeChange = useCallback((range: ChartTimeRange) => {
    setTimeRange(range)
  }, [])

  // Handle chart type change
  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type)
  }, [])

  // Handle fullscreen toggle
  const handleFullscreenToggle = useCallback(() => {
    setIsFullscreen((prev) => !prev)
  }, [])

  // Handle export as PNG
  const handleExport = useCallback(() => {
    const svgElement = chartRef.current?.querySelector('svg')
    if (!svgElement) return

    // Create canvas and convert SVG
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const svgData = new XMLSerializer().serializeToString(svgElement)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * 2
      canvas.height = img.height * 2
      ctx.scale(2, 2)
      ctx.fillStyle = 'hsl(var(--background))'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      // Download
      canvas.toBlob((blob) => {
        if (!blob) return
        const link = document.createElement('a')
        link.download = `price-chart-${marketId}-${timeRange}.png`
        link.href = URL.createObjectURL(blob)
        link.click()
      })
    }
    img.src = url
  }, [marketId, timeRange])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn('rounded-lg bg-muted/10', className)}>
        <ChartSkeleton height={variant === 'compact' ? undefined : height} variant={variant} />
      </div>
    )
  }

  // Empty state
  if (isEmpty || !data || data.length === 0) {
    return (
      <div className={cn('rounded-lg bg-muted/10', className)}>
        <EmptyState onRetry={refetch} />
      </div>
    )
  }

  // Calculate Y-axis padding
  const priceValues = data.map((d) => d.pricePercent)
  const minPrice = Math.min(...priceValues)
  const maxPrice = Math.max(...priceValues)
  const yDomain = [
    Math.max(0, Math.floor(minPrice / 10) * 10 - 5),
    Math.min(100, Math.ceil(maxPrice / 10) * 10 + 5)
  ]

  // Trend indicator
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  return (
    <div
      ref={chartRef}
      className={cn(
        'relative',
        isFullscreen && 'fixed inset-4 z-50 rounded-xl bg-background shadow-2xl',
        className
      )}
    >
      {/* Header with controls */}
      {variant === 'default' && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2"
            >
              <TrendIcon
                className={cn(
                  'w-4 h-4',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-danger',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              />
              <span className="text-sm font-medium">
                {priceChange !== null && (
                  <span
                    className={cn(
                      'ml-1',
                      trend === 'up' && 'text-success',
                      trend === 'down' && 'text-danger'
                    )}
                  >
                    {priceChange > 0 ? '+' : ''}
                    {priceChange.toFixed(1)}%
                  </span>
                )}
              </span>
            </motion.div>
          </div>

          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFullscreenToggle}
              className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize2 className="w-4 h-4 text-muted-foreground" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleExport}
              className="p-1.5 rounded-md hover:bg-muted/50 transition-colors"
              aria-label="Export chart as PNG"
            >
              <Download className="w-4 h-4 text-muted-foreground" />
            </motion.button>
          </div>
        </div>
      )}

      {/* Time range selector */}
      {variant === 'default' && (
        <PriceChartControls
          currentTimeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          currentChartType={chartType}
          onChartTypeChange={handleChartTypeChange}
          onRefresh={refetch}
          isRefreshing={isLoading}
          className="mb-4"
        />
      )}

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: disableAnimation ? 0 : 0.4 }}
        className={cn(
          'relative',
          isFullscreen && 'h-[calc(100%-120px)]'
        )}
        style={{ height: isFullscreen ? undefined : variant === 'compact' ? 120 : height }}
      >
        <ResponsiveContainer
          width="100%"
          height="100%"
          {...(aspectRatio && { aspect: aspectRatio })}
        >
          <LineChart
            data={data}
            margin={{
              top: 8,
              right: variant === 'compact' ? 0 : 8,
              bottom: variant === 'compact' ? 0 : 8,
              left: variant === 'compact' ? 0 : 8
            }}
          >
            {/* Grid */}
            {chartConfig.grid.horizontal && (
              <CartesianGrid
                stroke={chartConfig.grid.stroke}
                strokeDasharray={chartConfig.grid.strokeDasharray}
                vertical={false}
              />
            )}

            {/* X-axis */}
            {variant !== 'compact' && variant !== 'minimal' && (
              <XAxis
                dataKey="formattedTime"
                stroke={chartConfig.axis.stroke}
                fontSize={chartConfig.axis.fontSize}
                tickMargin={chartConfig.axis.tickMargin}
                tickFormatter={(value) => {
                  // Show fewer ticks on mobile
                  if (typeof window !== 'undefined' && window.innerWidth < 640) {
                    const tickIndex = data.findIndex((d) => d.formattedTime === value)
                    return tickIndex % Math.ceil(data.length / 4) === 0 ? value : ''
                  }
                  return value
                }}
                interval="preserveStartEnd"
              />
            )}

            {/* Y-axis */}
            {variant !== 'compact' && variant !== 'minimal' && (
              <YAxis
                domain={yDomain}
                stroke={chartConfig.axis.stroke}
                fontSize={chartConfig.axis.fontSize}
                tickMargin={chartConfig.axis.tickMargin}
                tickFormatter={(value) => `${value}%`}
                width={40}
              />
            )}

            {/* Reference line at 50% */}
            {showReferenceLine && variant !== 'compact' && variant !== 'minimal' && (
              <ReferenceLine
                y={50}
                stroke={chartColors.reference}
                strokeDasharray="3 3"
                strokeWidth={1}
              />
            )}

            {/* Area fill under line */}
            {showArea && chartType !== 'line' && (
              <defs>
                <linearGradient id={`gradient-${marketId}-${timeRange}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={colors.areaStart} />
                  <stop offset="100%" stopColor={colors.areaEnd} />
                </linearGradient>
              </defs>
            )}

            {/* Area */}
            {showArea && chartType !== 'line' && (
              <Area
                type="monotone"
                dataKey="pricePercent"
                fill={`url(#gradient-${marketId}-${timeRange})`}
                stroke="none"
                isAnimationActive={!disableAnimation}
                animationDuration={400}
              />
            )}

            {/* Line */}
            <Line
              type="monotone"
              dataKey="pricePercent"
              stroke={colors.line}
              strokeWidth={chartConfig.line.strokeWidth}
              dot={chartConfig.line.dot}
              activeDot={chartConfig.line.activeDot}
              isAnimationActive={!disableAnimation}
              animationDuration={400}
              animationEasing="ease-out"
            />

            {/* Custom Tooltip */}
            <Tooltip
              content={(props) => (
                <PriceChartTooltip
                  active={props.active}
                  payload={props.payload as any}
                  label={props.label}
                  trend={trend}
                />
              )}
              cursor={{
                stroke: 'hsl(var(--muted-foreground) / 0.3)',
                strokeWidth: 1,
                strokeDasharray: '4 4'
              }}
              position={{ y: 0 }}
              wrapperStyle={{ outline: 'none' }}
            />

            {/* Brush for zoom/pan */}
            {showBrush && data.length > 20 && variant !== 'compact' && variant !== 'minimal' && (
              <Brush
                dataKey="formattedTime"
                height={30}
                stroke={chartColors.grid}
                fill="hsl(var(--muted) / 0.1)"
                travellerWidth={10}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Fullscreen overlay backdrop */}
      <AnimatePresence>
        {isFullscreen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
              onClick={handleFullscreenToggle}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

PriceChart.displayName = 'PriceChart'
