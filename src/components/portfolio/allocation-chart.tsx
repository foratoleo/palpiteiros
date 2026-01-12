/**
 * Allocation Chart Component
 *
 * Donut chart showing portfolio allocation by market using Recharts.
 * Features interactive slices, center display, responsive legend, and filtering.
 *
 * @features
 * - Donut chart using Recharts PieChart
 * - Slices represent different markets or categories
 * - Center: Total value or asset count
 * - Legend: Market name + percentage
 * - Hover: Highlight slice, show tooltip with details
 * - Animation: Slices animate in on mount
 * - Color palette: Distinct colors for each market/category
 * - Responsive: Smaller on mobile, legend below on small screens
 * - Click slice: Filter positions table by market
 * - Loading state with spinner
 * - Empty state: "No positions yet"
 * - Integration with portfolio data
 *
 * @example
 * ```tsx
 * <AllocationChart
 *   positions={positions}
 *   groupBy="market"
 *   onSliceClick={(marketId) => filterByMarket(marketId)}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { PieChart as PieChartIcon, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Position } from '@/types/portfolio.types'

// ============================================================================
// TYPES
// ============================================================================

export interface AllocationChartProps {
  /** Array of positions to calculate allocation from */
  positions: Position[]
  /** Group by market or category */
  groupBy?: 'market' | 'category'
  /** Custom data override (skips calculation) */
  data?: Array<{ name: string; value: number; id?: string; color?: string }>
  /** Center text (defaults to total value) */
  centerText?: string
  /** On slice click callback */
  onSliceClick?: (item: AllocationItem) => void
  /** Selected slice for filtering */
  selectedId?: string
  /** Chart height in pixels */
  height?: number
  /** Show legend */
  showLegend?: boolean
  /** Show center text */
  showCenterText?: boolean
  /** Custom CSS class names */
  className?: string
  /** Loading state */
  isLoading?: boolean
}

export interface AllocationItem {
  name: string
  value: number
  percentage: number
  id?: string
  color?: string
}

// ============================================================================
// COLOR PALETTE
// ============================================================================

const CHART_COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--success))',
  'hsl(var(--warning))',
  'hsl(var(--danger))',
  'hsl(var(--info) / 1)',
  'hsl(var(--purple-500))',
  'hsl(var(--pink-500))',
  'hsl(var(--orange-500))',
  'hsl(var(--teal-500))',
  'hsl(var(--indigo-500))'
]

// Custom colors for better distinction
const DISTINCT_COLORS = [
  '#6366f1', // indigo
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
  '#a855f7'  // purple
]

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
  return `${value.toFixed(1)}%`
}

// ============================================================================
// CUSTOM TOOLTIP
// ============================================================================

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    name: string
    value: number
    payload?: AllocationItem
  }>
}

const CustomTooltip = React.memo(function CustomTooltip({
  active,
  payload
}: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null

  const data = payload[0]
  const item = data.payload as AllocationItem | undefined

  return (
    <div className="bg-background/95 backdrop-blur-md border border-border/50 rounded-lg px-3 py-2 shadow-lg">
      <p className="text-sm font-medium">{data.name}</p>
      <p className="text-lg font-bold">{formatCurrency(Number(data.value))}</p>
      {item?.percentage !== undefined && (
        <p className="text-xs text-muted-foreground">{formatPercentage(item.percentage)}</p>
      )}
    </div>
  )
})

// ============================================================================
// CUSTOM LEGEND
// ============================================================================

interface CustomLegendProps {
  payload?: Array<{
    value: string
    color: string
    payload?: AllocationItem
  }>
  onClick?: (item: AllocationItem) => void
  selectedId?: string
}

const CustomLegend = React.memo(function CustomLegend({
  payload,
  onClick,
  selectedId
}: CustomLegendProps) {
  if (!payload) return null

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload.map((entry, index) => {
        const item = entry.payload as AllocationItem | undefined
        const isSelected = selectedId === item?.id

        return (
          <button
            key={index}
            onClick={() => item && onClick?.(item)}
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all',
              'hover:bg-muted/50',
              isSelected && 'bg-muted ring-2 ring-primary/20'
            )}
          >
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="font-medium">{entry.value}</span>
            {item?.percentage !== undefined && (
              <span className="text-muted-foreground text-xs">
                {formatPercentage(item.percentage)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
})

// ============================================================================
// CENTER TEXT COMPONENT
// ============================================================================

interface CenterTextProps {
  totalValue: number
  positionCount: number
  label?: string
}

function CenterText({ totalValue, positionCount, label }: CenterTextProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
      {label && (
        <span className="text-xs text-muted-foreground mb-1">{label}</span>
      )}
      <motion.span
        key={totalValue}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-xl font-bold"
      >
        {formatCurrency(totalValue)}
      </motion.span>
      <span className="text-xs text-muted-foreground mt-1">
        {positionCount} {positionCount === 1 ? 'position' : 'positions'}
      </span>
    </div>
  )
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface ChartSkeletonProps {
  height?: number
}

function ChartSkeleton({ height = 300 }: ChartSkeletonProps) {
  return (
    <div className="flex flex-col items-center justify-center" style={{ height }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-full border-4 border-muted border-t-primary"
      />
      <Skeleton className="h-4 w-32 mt-4" />
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message?: string
}

function EmptyState({ message = 'No positions to display' }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
        <PieChartIcon className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}

// ============================================================================
// DATA PROCESSING
// ============================================================================

function calculateAllocation(
  positions: Position[],
  groupBy: 'market' | 'category'
): { data: AllocationItem[]; total: number } {
  if (positions.length === 0) {
    return { data: [], total: 0 }
  }

  const groups = new Map<string, number>()
  const idMap = new Map<string, string>()

  positions.forEach((position) => {
    const currentValue = position.current_price
      ? position.size * position.current_price
      : position.size * position.average_price

    const key = groupBy === 'market'
      ? position.market.question
      : position.market.category || 'Other'

    groups.set(key, (groups.get(key) || 0) + currentValue)

    if (groupBy === 'market') {
      idMap.set(key, position.market_id)
    }
  })

  const total = Array.from(groups.values()).reduce((sum, value) => sum + value, 0)

  const data: AllocationItem[] = Array.from(groups.entries()).map(([name, value], index) => ({
    name,
    value,
    percentage: total > 0 ? (value / total) * 100 : 0,
    id: idMap.get(name),
    color: DISTINCT_COLORS[index % DISTINCT_COLORS.length]
  }))

  // Sort by value descending
  data.sort((a, b) => b.value - a.value)

  return { data, total }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const AllocationChart = React.memo(function AllocationChart({
  positions,
  groupBy = 'market',
  data: dataProp,
  centerText,
  onSliceClick,
  selectedId,
  height = 300,
  showLegend = true,
  showCenterText = true,
  className,
  isLoading = false
}: AllocationChartProps) {
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null)

  // Calculate allocation from positions
  const { data, total } = React.useMemo(() => {
    if (dataProp) {
      const total = dataProp.reduce((sum, item) => sum + item.value, 0)
      return {
        data: dataProp.map((item, index) => ({
          ...item,
          percentage: total > 0 ? (item.value / total) * 100 : 0,
          color: item.color || DISTINCT_COLORS[index % DISTINCT_COLORS.length]
        })) as AllocationItem[],
        total
      }
    }
    return calculateAllocation(positions, groupBy)
  }, [positions, groupBy, dataProp])

  // Loading state
  if (isLoading) {
    return (
      <Card variant="glass" className={className}>
        <CardContent className="p-6">
          <ChartSkeleton height={height} />
        </CardContent>
      </Card>
    )
  }

  // Empty state
  if (data.length === 0) {
    return (
      <Card variant="glass" className={className}>
        <CardContent className="p-6">
          <EmptyState />
        </CardContent>
      </Card>
    )
  }

  const positionCount = positions.length

  return (
    <Card variant="glass" className={className}>
      {showCenterText && centerText === undefined && (
        <CardHeader className="pb-0">
          <CardTitle className="text-base flex items-center gap-2">
            <Wallet className="w-4 h-4" />
            Portfolio Allocation
          </CardTitle>
        </CardHeader>
      )}

      <CardContent className="p-6">
        <div className="relative" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                animationBegin={0}
                animationDuration={400}
                animationEasing="ease-out"
                onMouseEnter={(_, index) => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={(entry) => {
                  const item = entry.payload as AllocationItem
                  onSliceClick?.(item)
                }}
              >
                {data.map((entry, index) => {
                  const isHovered = hoveredIndex === index
                  const isSelected = selectedId === entry.id

                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color}
                      stroke={isSelected ? 'hsl(var(--primary))' : undefined}
                      strokeWidth={isSelected ? 2 : 0}
                      style={{
                        opacity: hoveredIndex === null || isHovered ? 1 : 0.5,
                        transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                        transition: 'all 0.2s',
                        cursor: onSliceClick ? 'pointer' : 'default'
                      }}
                    />
                  )
                })}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              {showLegend && (
                <Legend
                  content={<CustomLegend onClick={onSliceClick} selectedId={selectedId} />}
                  verticalAlign="bottom"
                />
              )}
            </PieChart>
          </ResponsiveContainer>

          {/* Center text */}
          {showCenterText && (
            <CenterText
              totalValue={total}
              positionCount={positionCount}
              label={centerText}
            />
          )}
        </div>

        {/* Clear filter button */}
        <AnimatePresence>
          {selectedId && onSliceClick && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-center mt-4"
            >
              <button
                onClick={() => onSliceClick({ name: '', value: 0, percentage: 0, id: undefined })}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear filter
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
})

AllocationChart.displayName = 'AllocationChart'
