/**
 * Performance Chart Component
 *
 * Line chart showing portfolio performance over time using Recharts.
 * Features smooth curves, gradient fill, timeframe selector, and annotations.
 *
 * @features
 * - X-axis: Dates (last 7D, 30D, 90D, ALL)
 * - Y-axis: Portfolio value or PnL percentage
 * - Line: Smooth curve, gradient fill area
 * - Annotations: Key events (trades, market closes)
 * - Benchmark: Compare to market index (optional)
 * - Tooltip: Show date, value, PnL at point
 * - Zoom/pan support for detailed analysis
 * - Timeframe selector: 7D, 30D, 90D, ALL
 * - Performance stats: CAGR, Sharpe ratio, max drawdown
 * - Responsive: Full width on desktop, compact on mobile
 * - Loading state with skeleton
 * - Integration with historical portfolio data
 *
 * @example
 * ```tsx
 * <PerformanceChart
 *   historyData={portfolioHistory}
 *   initialTimeRange="30D"
 *   showBenchmark
 * />
 * ```
 */

'use client'

import * as React from 'react'
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
  Brush
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Percent,
  Activity,
  Maximize2,
  RefreshCw
} from 'lucide-react'
import { format, isValid, parseISO } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { PortfolioHistoryPoint } from '@/types/portfolio.types'

// ============================================================================
// TYPES
// ============================================================================

export interface PerformanceChartProps {
  /** Historical portfolio data points */
  historyData: PortfolioHistoryPoint[]
  /** Initial time range */
  initialTimeRange?: TimeRange
  /** Chart height in pixels */
  height?: number
  /** Show gradient area under line */
  showArea?: boolean
  /** Show grid lines */
  showGrid?: boolean
  /** Show brush (zoom/pan) */
  showBrush?: boolean
  /** Show reference line at starting value */
  showReferenceLine?: boolean
  /** Show benchmark comparison */
  showBenchmark?: boolean
  /** Benchmark data (optional) */
  benchmarkData?: PortfolioHistoryPoint[]
  /** Show performance stats */
  showStats?: boolean
  /** Timeframe selector position */
  timeframePosition?: 'top' | 'bottom'
  /** On timeframe change callback */
  onTimeframeChange?: (range: TimeRange) => void
  /** On fullscreen toggle callback */
  onFullscreenToggle?: () => void
  /** On refresh callback */
  onRefresh?: () => void
  /** Custom CSS class names */
  className?: string
  /** Loading state */
  isLoading?: boolean
  /** Disable animations */
  disableAnimation?: boolean
  /** Chart display variant */
  variant?: 'default' | 'compact' | 'minimal'
}

export type TimeRange = '7D' | '30D' | '90D' | 'ALL'

interface ChartDataPoint {
  timestamp: string
  formattedDate: string
  value: number
  pnl: number
  pnlPercentage: number
  benchmark?: number
}

// ============================================================================
// TIME RANGE CONFIG
// ============================================================================

const TIME_RANGE_LABELS: Record<TimeRange, string> = {
  '7D': '7D',
  '30D': '30D',
  '90D': '90D',
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
  // Benchmark line
  benchmark: 'hsl(var(--muted-foreground) / 0.5)',
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
// FORMATTERS
// ============================================================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function formatPercentage(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

function formatDate(timestamp: string, timeRange: TimeRange): string {
  const date = parseISO(timestamp)
  if (!isValid(date)) return ''

  switch (timeRange) {
    case '7D':
      return format(date, 'EEE h:mm a')
    case '30D':
      return format(date, 'MMM d')
    case '90D':
      return format(date, 'MMM d')
    case 'ALL':
      return format(date, 'MMM yyyy')
    default:
      return format(date, 'MMM d')
  }
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    dataKey?: string
  }>
  label?: string
  trend?: 'up' | 'down' | 'neutral'
}

const CustomTooltip = React.memo(function CustomTooltip({
  active,
  payload,
  label,
  trend
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const valueData = payload.find((p) => p.dataKey === 'value')
  const benchmarkData = payload.find((p) => p.dataKey === 'benchmark')

  if (!valueData) return null

  const value = Number(valueData.value)
  const benchmark = benchmarkData ? Number(benchmarkData.value) : null

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: trend === 'up' ? chartColors.lineUp : trend === 'down' ? chartColors.lineDown : chartColors.lineNeutral }}
        />
        <p className="text-lg font-bold">{formatCurrency(value)}</p>
      </div>
      {benchmark !== null && (
        <p className="text-xs text-muted-foreground mt-1">
          Benchmark: {formatCurrency(benchmark)}
        </p>
      )}
    </div>
  )
})

// ============================================================================
// TIMEFRAME SELECTOR
// ============================================================================

interface TimeframeSelectorProps {
  currentTimeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  className?: string
}

function TimeframeSelector({ currentTimeRange, onTimeRangeChange, className }: TimeframeSelectorProps) {
  const ranges: TimeRange[] = ['7D', '30D', '90D', 'ALL']

  return (
    <div className={cn('inline-flex items-center bg-muted/50 rounded-lg p-1 gap-1', className)}>
      {ranges.map((range) => (
        <button
          key={range}
          onClick={() => onTimeRangeChange(range)}
          className={cn(
            'px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200',
            currentTimeRange === range
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted'
          )}
        >
          {TIME_RANGE_LABELS[range]}
        </button>
      ))}
    </div>
  )
}

// ============================================================================
// PERFORMANCE STATS
// ============================================================================

interface PerformanceStatsProps {
  data: ChartDataPoint[]
  className?: string
}

function PerformanceStats({ data, className }: PerformanceStatsProps) {
  if (data.length < 2) return null

  const firstValue = data[0].value
  const lastValue = data[data.length - 1].value
  const totalReturn = ((lastValue - firstValue) / firstValue) * 100

  // Calculate max drawdown
  let maxDrawdown = 0
  let peak = data[0].value

  for (const point of data) {
    if (point.value > peak) {
      peak = point.value
    }
    const drawdown = ((peak - point.value) / peak) * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }

  // Calculate volatility (standard deviation of returns)
  const returns: number[] = []
  for (let i = 1; i < data.length; i++) {
    const dailyReturn = ((data[i].value - data[i - 1].value) / data[i - 1].value) * 100
    returns.push(dailyReturn)
  }

  const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
  const volatility = Math.sqrt(variance)

  // Calculate Sharpe ratio (simplified, assuming 2% risk-free rate)
  const riskFreeRate = 2
  const annualizedReturn = totalReturn * (365 / data.length)
  const annualizedVolatility = volatility * Math.sqrt(365)
  const sharpeRatio = annualizedVolatility > 0
    ? (annualizedReturn - riskFreeRate) / annualizedVolatility
    : 0

  const stats = [
    { label: 'Total Return', value: formatPercentage(totalReturn), icon: TrendingUp },
    { label: 'Max Drawdown', value: formatPercentage(-maxDrawdown), icon: TrendingDown },
    { label: 'Volatility', value: formatPercentage(volatility), icon: Activity },
    { label: 'Sharpe Ratio', value: sharpeRatio.toFixed(2), icon: Percent }
  ]

  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-center gap-2">
          <stat.icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <div>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
            <p className="text-sm font-semibold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface ChartSkeletonProps {
  height?: number
  variant?: PerformanceChartProps['variant']
}

function ChartSkeleton({ height = 300, variant = 'default' }: ChartSkeletonProps) {
  const isCompact = variant === 'compact' || variant === 'minimal'

  return (
    <div
      className="relative overflow-hidden rounded-lg"
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

function EmptyState({ message = 'No performance data available', onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
        <Activity className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-1" />
          Retry
        </Button>
      )}
    </div>
  )
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function processChartData(
  historyData: PortfolioHistoryPoint[],
  timeRange: TimeRange,
  benchmarkData?: PortfolioHistoryPoint[]
): ChartDataPoint[] {
  const now = new Date()
  let startDate: Date

  switch (timeRange) {
    case '7D':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30D':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90D':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    case 'ALL':
    default:
      startDate = new Date(0)
      break
  }

  // Filter data by time range
  let filteredData = historyData.filter((d) => {
    const date = parseISO(d.timestamp)
    return date >= startDate
  })

  // Sample data if too many points
  if (filteredData.length > 100) {
    const step = Math.ceil(filteredData.length / 100)
    filteredData = filteredData.filter((_, i) => i % step === 0)
  }

  const baseValue = filteredData[0]?.value || 0

  const chartData: ChartDataPoint[] = filteredData.map((point) => {
    const pnlPercentage = baseValue > 0 ? ((point.value - baseValue) / baseValue) * 100 : 0

    return {
      timestamp: point.timestamp,
      formattedDate: formatDate(point.timestamp, timeRange),
      value: point.value,
      pnl: point.pnl,
      pnlPercentage,
      // Add benchmark data if available
      benchmark: benchmarkData?.find((b) => b.timestamp === point.timestamp)?.value
    }
  })

  return chartData
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PerformanceChart = React.memo(function PerformanceChart({
  historyData,
  initialTimeRange = '30D',
  height = 300,
  showArea = true,
  showGrid = true,
  showBrush = false,
  showReferenceLine = true,
  showBenchmark = false,
  benchmarkData,
  showStats = true,
  timeframePosition = 'top',
  onTimeframeChange,
  onFullscreenToggle,
  onRefresh,
  className,
  isLoading = false,
  disableAnimation = false,
  variant = 'default'
}: PerformanceChartProps) {
  const [timeRange, setTimeRange] = React.useState<TimeRange>(initialTimeRange)
  const [isFullscreen, setIsFullscreen] = React.useState(false)

  // Process chart data
  const chartData = React.useMemo(() => {
    return processChartData(
      historyData,
      timeRange,
      showBenchmark ? benchmarkData : undefined
    )
  }, [historyData, timeRange, benchmarkData, showBenchmark])

  // Calculate trend
  const trend = React.useMemo<'up' | 'down' | 'neutral'>(() => {
    if (chartData.length < 2) return 'neutral'
    const first = chartData[0].value
    const last = chartData[chartData.length - 1].value
    return last > first ? 'up' : last < first ? 'down' : 'neutral'
  }, [chartData])

  // Determine colors based on trend
  const colors = React.useMemo(() => {
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
  const chartConfig = React.useMemo(() => {
    const isCompact = variant === 'compact' || variant === 'minimal'

    return {
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
  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    onTimeframeChange?.(range)
  }

  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setIsFullscreen((prev) => !prev)
    onFullscreenToggle?.()
  }

  // Loading state
  if (isLoading) {
    return (
      <Card variant="glass" className={className}>
        <CardContent className="p-6">
          <ChartSkeleton height={variant === 'compact' ? undefined : height} variant={variant} />
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (chartData.length === 0) {
    return (
      <Card variant="glass" className={className}>
        <CardContent className="p-6">
          <EmptyState onRetry={onRefresh} />
        </CardContent>
      </Card>
    )
  }

  const baseValue = chartData[0]?.value || 0
  const currentValue = chartData[chartData.length - 1]?.value || 0
  const totalPnl = ((currentValue - baseValue) / baseValue) * 100

  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity

  return (
    <Card
      variant="glass"
      className={cn(
        'transition-all duration-200',
        isFullscreen && 'fixed inset-4 z-50 shadow-2xl',
        className
      )}
    >
      {/* Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Portfolio Performance
          </CardTitle>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {onRefresh && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={onRefresh}
                aria-label="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleFullscreenToggle}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Time range selector */}
        {timeframePosition === 'top' && variant === 'default' && (
          <div className="mt-3">
            <TimeframeSelector
              currentTimeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </div>
        )}

        {/* Summary stats */}
        {variant === 'default' && (
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-2">
              <TrendIcon
                className={cn(
                  'w-4 h-4',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-danger'
                )}
              />
              <span className="text-sm font-medium">
                {formatCurrency(currentValue)}
              </span>
            </div>
            <span
              className={cn(
                'text-sm font-semibold',
                trend === 'up' && 'text-success',
                trend === 'down' && 'text-danger'
              )}
            >
              {formatPercentage(totalPnl)}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {/* Performance stats */}
        {showStats && variant === 'default' && (
          <PerformanceStats data={chartData} className="mb-4" />
        )}

        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: disableAnimation ? 0 : 0.4 }}
          className="relative"
          style={{ height: isFullscreen ? 'calc(100vh - 300px)' : variant === 'compact' ? 150 : height }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
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
                  dataKey="formattedDate"
                  stroke={chartConfig.axis.stroke}
                  fontSize={chartConfig.axis.fontSize}
                  tickMargin={chartConfig.axis.tickMargin}
                  tickFormatter={(value) => {
                    // Show fewer ticks on mobile
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      const tickIndex = chartData.findIndex((d) => d.formattedDate === value)
                      return tickIndex % Math.ceil(chartData.length / 4) === 0 ? value : ''
                    }
                    return value
                  }}
                  interval="preserveStartEnd"
                />
              )}

              {/* Y-axis */}
              {variant !== 'compact' && variant !== 'minimal' && (
                <YAxis
                  stroke={chartConfig.axis.stroke}
                  fontSize={chartConfig.axis.fontSize}
                  tickMargin={chartConfig.axis.tickMargin}
                  tickFormatter={(value) => formatCurrency(Number(value))}
                  width={60}
                />
              )}

              {/* Reference line at starting value */}
              {showReferenceLine && variant !== 'compact' && variant !== 'minimal' && (
                <ReferenceLine
                  y={baseValue}
                  stroke={chartColors.reference}
                  strokeDasharray="3 3"
                  strokeWidth={1}
                />
              )}

              {/* Area fill under line */}
              {showArea && (
                <defs>
                  <linearGradient id={`gradient-perf-${timeRange}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={colors.areaStart} />
                    <stop offset="100%" stopColor={colors.areaEnd} />
                  </linearGradient>
                </defs>
              )}

              {/* Area */}
              {showArea && (
                <Area
                  type="monotone"
                  dataKey="value"
                  fill={`url(#gradient-perf-${timeRange})`}
                  stroke="none"
                  isAnimationActive={!disableAnimation}
                  animationDuration={400}
                />
              )}

              {/* Main line */}
              <Line
                type="monotone"
                dataKey="value"
                stroke={colors.line}
                strokeWidth={chartConfig.line.strokeWidth}
                dot={chartConfig.line.dot}
                activeDot={chartConfig.line.activeDot}
                isAnimationActive={!disableAnimation}
                animationDuration={400}
                animationEasing="ease-out"
              />

              {/* Benchmark line */}
              {showBenchmark && benchmarkData && benchmarkData.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="benchmark"
                  stroke={chartColors.benchmark}
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                  isAnimationActive={false}
                  name="Benchmark"
                />
              )}

              {/* Custom Tooltip */}
              <Tooltip
                content={(props) => (
                  <CustomTooltip
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
              {showBrush && chartData.length > 20 && variant !== 'compact' && variant !== 'minimal' && (
                <Brush
                  dataKey="formattedDate"
                  height={30}
                  stroke={chartColors.grid}
                  fill="hsl(var(--muted) / 0.1)"
                  travellerWidth={10}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Time range selector at bottom */}
        {timeframePosition === 'bottom' && variant === 'default' && (
          <div className="mt-4 flex justify-center">
            <TimeframeSelector
              currentTimeRange={timeRange}
              onTimeRangeChange={handleTimeRangeChange}
            />
          </div>
        )}
      </CardContent>

      {/* Fullscreen overlay backdrop */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
            onClick={handleFullscreenToggle}
          />
        )}
      </AnimatePresence>
    </Card>
  )
})

PerformanceChart.displayName = 'PerformanceChart'
