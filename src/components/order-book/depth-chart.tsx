/**
 * Depth Chart Component
 *
 * Visualization of cumulative order book depth showing:
 * - YES demand curve (green)
 * - NO demand curve (red)
 * - Intersection showing current price
 * - Crosshair on hover with price/volume info
 * - Zoom and pan support
 *
 * @feature Smooth transitions on data update
 * @feature Interactive crosshair with tooltip
 * @feature Responsive design (hidden on mobile)
 * @feature Performance-optimized with Recharts
 */

import { useCallback, useMemo, useRef, useState } from 'react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  ReferenceLine,
  Brush
} from 'recharts'
import { cn } from '@/lib/utils'
import type { OrderBookData } from './use-order-book-data'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Depth Chart Data Point
 */
interface DepthDataPoint {
  /** Price (0-100) */
  price: number
  /** Cumulative YES volume */
  yesVolume: number
  /** Cumulative NO volume */
  noVolume: number
}

/**
 * Depth Chart Props
 */
export interface DepthChartProps {
  /** Order book data */
  orderBook: OrderBookData
  /** Current selected price */
  selectedPrice?: number
  /** Price change callback */
  onPriceSelect?: (price: number) => void
  /** Show brush for zoom */
  showBrush?: boolean
  /** Height in pixels */
  height?: number
  /** Custom class name */
  className?: string
  /** Hide on mobile */
  hideOnMobile?: boolean
}

/**
 * Custom Tooltip Props
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    color: string
  }>
  label?: string
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert order book to depth chart data
 */
function orderBookToDepthData(orderBook: OrderBookData): DepthDataPoint[] {
  const data: DepthDataPoint[] = []

  // Add YES bids (sorted descending by price, reverse for chart)
  for (let i = orderBook.bids.length - 1; i >= 0; i--) {
    const bid = orderBook.bids[i]
    data.push({
      price: bid.price * 100,
      yesVolume: bid.total,
      noVolume: 0
    })
  }

  // Add NO asks (sorted ascending)
  for (const ask of orderBook.asks) {
    data.push({
      price: ask.price * 100,
      yesVolume: 0,
      noVolume: ask.total
    })
  }

  // Sort by price
  return data.sort((a, b) => a.price - b.price)
}

/**
 * Calculate cumulative volumes for depth curve
 */
function calculateCumulativeVolumes(data: DepthDataPoint[]): DepthDataPoint[] {
  let cumulativeYes = 0
  let cumulativeNo = 0

  return data.map((point) => {
    cumulativeYes += point.yesVolume
    cumulativeNo += point.noVolume

    return {
      price: point.price,
      yesVolume: cumulativeYes,
      noVolume: cumulativeNo
    }
  })
}

/**
 * Format price for display
 */
function formatPrice(price: number): string {
  return `${price.toFixed(1)}%`
}

/**
 * Format volume for display
 */
function formatVolume(volume: number): string {
  if (volume >= 1000000) return `${(volume / 1000000).toFixed(1)}M`
  if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`
  return volume.toFixed(0)
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

/**
 * Custom Tooltip Component
 */
function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !label) {
    return null
  }

  const yesVolume = payload.find((p) => p.name === 'YES')?.value ?? 0
  const noVolume = payload.find((p) => p.name === 'NO')?.value ?? 0

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg px-3 py-2">
      <div className="text-sm font-medium mb-2">{formatPrice(Number(label))}</div>
      <div className="space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">YES:</span>
          <span className="font-mono">{formatVolume(yesVolume)}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-muted-foreground">NO:</span>
          <span className="font-mono">{formatVolume(noVolume)}</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * Depth Chart Component
 *
 * Visualizes order book depth with interactive crosshair.
 *
 * @example
 * ```tsx
 * <DepthChart
 *   orderBook={orderBookData}
 *   selectedPrice={0.65}
 *   onPriceSelect={(price) => setTradePrice(price)}
 *   height={300}
 * />
 * ```
 */
export function DepthChart({
  orderBook,
  selectedPrice,
  onPriceSelect,
  showBrush = true,
  height = 300,
  className,
  hideOnMobile = true
}: DepthChartProps) {
  const [hoveredPrice, setHoveredPrice] = useState<number | null>(null)
  const [zoomDomain, setZoomDomain] = useState<[number, number] | null>(null)

  // Calculate chart data
  const chartData = useMemo(() => {
    const rawData = orderBookToDepthData(orderBook)
    return calculateCumulativeVolumes(rawData)
  }, [orderBook])

  // Calculate max volume for Y-axis scaling
  const maxVolume = useMemo(() => {
    const maxYes = Math.max(...chartData.map((d) => d.yesVolume))
    const maxNo = Math.max(...chartData.map((d) => d.noVolume))
    return Math.max(maxYes, maxNo) * 1.1 // Add 10% padding
  }, [chartData])

  // Calculate intersection point (where YES and NO volumes meet)
  const intersectionPrice = useMemo(() => {
    if (chartData.length === 0) return null

    // Find the point where YES and NO volumes are closest
    let minDiff = Infinity
    let intersection = null

    for (const point of chartData) {
      const diff = Math.abs(point.yesVolume - point.noVolume)
      if (diff < minDiff) {
        minDiff = diff
        intersection = point.price
      }
    }

    return intersection
  }, [chartData])

  // Handle click on chart
  const handleChartClick = useCallback((data: any) => {
    if (onPriceSelect && data && data.activePayload && data.activePayload.length > 0) {
      const price = data.activePayload[0].payload.price / 100
      onPriceSelect(price)
    }
  }, [onPriceSelect])

  // Handle zoom change
  const handleZoomChange = useCallback((domain: any) => {
    if (domain && domain.xAxis) {
      setZoomDomain(domain.xAxis)
    }
  }, [])

  // X-axis domain
  const xDomain = zoomDomain || [0, 100]

  return (
    <div
      className={cn(
        'relative',
        hideOnMobile && 'hidden md:block',
        className
      )}
      role="region"
      aria-label="Order book depth chart"
    >
      {/* Chart header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium">Order Book Depth</h3>
        {zoomDomain && (
          <button
            onClick={() => setZoomDomain(null)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset Zoom
          </button>
        )}
      </div>

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            onClick={handleChartClick}
            onMouseMove={(data) => {
              if (data && data.activePayload && data.activePayload.length > 0) {
                setHoveredPrice(data.activePayload[0].payload.price)
              }
            }}
            onMouseLeave={() => setHoveredPrice(null)}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />

            <XAxis
              dataKey="price"
              domain={xDomain}
              type="number"
              tickFormatter={formatPrice}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              stroke="hsl(var(--border))"
            />

            <YAxis
              tickFormatter={formatVolume}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
              stroke="hsl(var(--border))"
            />

            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1, strokeDasharray: '4 4' }}
              position={{ y: 0 }}
            />

            {/* YES demand area (green) */}
            <Area
              type="monotone"
              dataKey="yesVolume"
              name="YES"
              stroke="hsl(var(--success) / 0.8)"
              strokeWidth={2}
              fill="hsl(var(--success) / 0.1)"
              animationDuration={300}
              isAnimationActive={true}
            />

            {/* NO demand area (red) */}
            <Area
              type="monotone"
              dataKey="noVolume"
              name="NO"
              stroke="hsl(var(--destructive) / 0.8)"
              strokeWidth={2}
              fill="hsl(var(--destructive) / 0.1)"
              animationDuration={300}
              isAnimationActive={true}
            />

            {/* Intersection reference line */}
            {intersectionPrice !== null && (
              <ReferenceLine
                x={intersectionPrice}
                stroke="hsl(var(--muted-foreground))"
                strokeDasharray="3 3"
                strokeWidth={1}
                label={{
                  value: formatPrice(intersectionPrice),
                  position: 'top',
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: 10
                }}
              />
            )}

            {/* Selected price reference line */}
            {selectedPrice !== undefined && (
              <ReferenceLine
                x={selectedPrice * 100}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            )}

            {/* Brush for zoom */}
            {showBrush && (
              <Brush
                dataKey="price"
                height={30}
                stroke="hsl(var(--border))"
                fill="hsl(var(--muted) / 0.3)"
                travellerWidth={10}
                onChange={handleZoomChange}
                tickFormatter={formatPrice}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Hovered price indicator */}
      {hoveredPrice !== null && (
        <div className="absolute top-10 right-4 bg-popover border border-border rounded-lg shadow-lg px-3 py-2 text-xs">
          <div className="font-medium mb-1">{formatPrice(hoveredPrice)}</div>
          {onPriceSelect && (
            <button
              onClick={() => onPriceSelect(hoveredPrice / 100)}
              className="text-primary hover:underline"
            >
              Trade at this price
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500/80" />
          <span className="text-muted-foreground">YES Demand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500/80" />
          <span className="text-muted-foreground">NO Demand</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-dashed bg-muted-foreground" />
          <span className="text-muted-foreground">Intersection</span>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// MINI DEPTH CHART (Compact Variant)
// ============================================================================

/**
 * Mini Depth Chart Props
 */
export interface MiniDepthChartProps {
  /** Order book data */
  orderBook: OrderBookData
  /** Height in pixels */
  height?: number
  /** Custom class name */
  className?: string
}

/**
 * Mini Depth Chart Component
 *
 * Compact version without brush or zoom for inline display.
 *
 * @example
 * ```tsx
 * <MiniDepthChart orderBook={orderBookData} height={150} />
 * ```
 */
export function MiniDepthChart({
  orderBook,
  height = 150,
  className
}: MiniDepthChartProps) {
  const chartData = useMemo(() => {
    const rawData = orderBookToDepthData(orderBook)
    return calculateCumulativeVolumes(rawData)
  }, [orderBook])

  return (
    <div className={cn('relative', className)}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart
          data={chartData}
          margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        >
          <XAxis hide />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />

          <Area
            type="monotone"
            dataKey="yesVolume"
            stroke="hsl(var(--success) / 0.8)"
            strokeWidth={1.5}
            fill="hsl(var(--success) / 0.1)"
            animationDuration={300}
          />

          <Area
            type="monotone"
            dataKey="noVolume"
            stroke="hsl(var(--destructive) / 0.8)"
            strokeWidth={1.5}
            fill="hsl(var(--destructive) / 0.1)"
            animationDuration={300}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ============================================================================
// SKELETON VARIANT
// ============================================================================

/**
 * Depth Chart Skeleton Props
 */
export interface DepthChartSkeletonProps {
  /** Height in pixels */
  height?: number
  /** Custom class name */
  className?: string
}

/**
 * Depth Chart Skeleton Component
 *
 * Loading skeleton for depth chart.
 *
 * @example
 * ```tsx
 * <DepthChartSkeleton height={300} />
 * ```
 */
export function DepthChartSkeleton({
  height = 300,
  className
}: DepthChartSkeletonProps) {
  return (
    <div
      className={cn('relative animate-pulse', className)}
      role="status"
      aria-label="Loading depth chart"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="h-4 w-32 bg-muted/50 rounded" />
        <div className="h-4 w-20 bg-muted/50 rounded" />
      </div>
      <div
        className="w-full bg-muted/30 rounded-lg"
        style={{ height }}
      />
      <div className="flex items-center justify-center gap-6 mt-4">
        <div className="h-3 w-20 bg-muted/50 rounded" />
        <div className="h-3 w-24 bg-muted/50 rounded" />
        <div className="h-3 w-24 bg-muted/50 rounded" />
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default DepthChart
