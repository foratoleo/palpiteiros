/**
 * Positions Table Component
 *
 * Data table displaying all user positions with sorting, filtering,
 * and pagination. Features expandable rows, sticky header, and responsive design.
 *
 * @features
 * - Columns: Market, Outcome, Avg Price, Current Price, Size, PnL, Actions
 * - Sortable columns (click header to sort)
 * - Filterable by outcome (YES/NO), market status
 * - Expandable rows for position details
 * - Sticky header for long lists
 * - Pagination or infinite scroll
 * - PnL column with color coding (green profit, red loss)
 * - Actions: Close Position button, View Market link
 * - Responsive: horizontal scroll on mobile
 * - Loading state with skeleton rows
 * - Empty state with illustration
 * - Integration with usePortfolio hook
 *
 * @example
 * ```tsx
 * <PositionsTable
 *   positions={positions}
 *   onClosePosition={(id) => handleClose(id)}
 *   onViewMarket={(id) => router.push(`/markets/${id}`)}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  X,
  Filter,
  SlidersHorizontal
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Position, PositionSortOptions, PositionFilters } from '@/types/portfolio.types'

// ============================================================================
// TYPES
// ============================================================================

export interface PositionsTableProps {
  /** Array of positions to display */
  positions: Position[]
  /** Loading state */
  isLoading?: boolean
  /** Current sort option */
  sortOption?: PositionSortOptions
  /** On sort change callback */
  onSortChange?: (field: PositionSortOptions['field'], direction: 'asc' | 'desc') => void
  /** Current filters */
  filters?: PositionFilters
  /** On filter change callback */
  onFilterChange?: (filters: Partial<PositionFilters>) => void
  /** Close position callback */
  onClosePosition?: (positionId: string, size?: number) => void
  /** View market callback */
  onViewMarket?: (marketId: string) => void
  /** Row click callback */
  onRowClick?: (position: Position) => void
  /** Custom CSS class names */
  className?: string
  /** Compact variant for smaller spaces */
  variant?: 'default' | 'compact'
}

type SortField = PositionSortOptions['field']
type SortDirection = 'asc' | 'desc'

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

function formatPnl(value: number | null | undefined): string {
  if (value == null) return '-'
  return formatCurrency(value)
}

// ============================================================================
// TABLE HEADER COMPONENT
// ============================================================================

interface TableHeaderProps {
  field: SortField
  label: string
  currentSort?: PositionSortOptions
  onSort?: (field: SortField) => void
  align?: 'left' | 'center' | 'right'
  hideOnMobile?: boolean
}

const TableHeader = React.memo(function TableHeader({
  field,
  label,
  currentSort,
  onSort,
  align = 'left',
  hideOnMobile = false
}: TableHeaderProps) {
  const isSorted = currentSort?.field === field
  const direction = isSorted ? currentSort.direction : null

  return (
    <button
      onClick={() => onSort?.(field)}
      className={cn(
        'flex items-center gap-1 text-xs font-semibold text-muted-foreground',
        'hover:text-foreground transition-colors',
        'whitespace-nowrap',
        align === 'center' && 'justify-center',
        align === 'right' && 'justify-end',
        onSort && 'cursor-pointer group',
        hideOnMobile && 'hidden md:table-cell'
      )}
    >
      {label}
      {onSort && (
        <span className="opacity-0 group-hover:opacity-50 transition-opacity">
          {isSorted ? (
            direction === 'asc' ? (
              <ArrowUp className="w-3 h-3" />
            ) : (
              <ArrowDown className="w-3 h-3" />
            )
          ) : (
            <ArrowUpDown className="w-3 h-3" />
          )}
        </span>
      )}
      {isSorted && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-1"
        >
          {direction === 'asc' ? (
            <ArrowUp className="w-3 h-3 text-primary" />
          ) : (
            <ArrowDown className="w-3 h-3 text-primary" />
          )}
        </motion.span>
      )}
    </button>
  )
})

// ============================================================================
// FILTER CHIP COMPONENT
// ============================================================================

interface FilterChipProps {
  label: string
  active?: boolean
  onClick?: () => void
}

function FilterChip({ label, active, onClick }: FilterChipProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all',
        'border',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background hover:bg-muted text-muted-foreground border-border'
      )}
    >
      {label}
    </button>
  )
}

// ============================================================================
// POSITION ROW COMPONENT
// ============================================================================

interface PositionRowProps {
  position: Position
  isExpanded: boolean
  onToggle: () => void
  onClosePosition?: (positionId: string, size?: number) => void
  onViewMarket?: (marketId: string) => void
  onRowClick?: (position: Position) => void
  variant?: 'default' | 'compact'
  showOutcome?: boolean
}

const PositionRow = React.memo(function PositionRow({
  position,
  isExpanded,
  onToggle,
  onClosePosition,
  onViewMarket,
  onRowClick,
  variant = 'default'
}: PositionRowProps) {
  const pnl = position.pnl ?? 0
  const pnlPercentage = position.pnl_percentage ?? 0
  const isProfit = pnl > 0
  const isLoss = pnl < 0

  // Calculate position value
  const currentValue = position.current_price
    ? position.size * position.current_price
    : position.size * position.average_price

  const investedValue = position.size * position.average_price

  return (
    <>
      {/* Main row */}
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn(
          'border-b border-border/50 transition-colors',
          'hover:bg-muted/30',
          onRowClick && 'cursor-pointer'
        )}
        onClick={() => onRowClick?.(position)}
      >
        {/* Market */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
              className="shrink-0 p-1 hover:bg-muted rounded transition-colors"
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{position.market.question}</p>
              <div className="flex items-center gap-2 mt-0.5">
                {position.market.closed ? (
                  <Badge variant="secondary" className="text-xs">Closed</Badge>
                ) : position.market.active ? (
                  <Badge variant="success" className="text-xs">Active</Badge>
                ) : (
                  <Badge variant="outline" className="text-xs">Pending</Badge>
                )}
                {position.market.tags?.slice(0, 1).map((tag: any) => (
                  <Badge key={tag.id} variant="outline" className="text-xs">
                    {tag.label}
                  </Badge>
                )) ?? []}
              </div>
            </div>
          </div>
        </td>

        {/* Outcome - hidden on mobile */}
        <td className="py-3 px-4 hidden md:table-cell">
          <Badge
            variant={position.outcome.toLowerCase() === 'yes' ? 'success' : 'destructive'}
            className="font-semibold"
          >
            {position.outcome.toUpperCase()}
          </Badge>
        </td>

        {/* Avg Price */}
        <td className="py-3 px-4 text-right">
          <span className="text-sm font-mono">{formatPrice(position.average_price)}</span>
        </td>

        {/* Current Price */}
        <td className="py-3 px-4 text-right">
          {position.current_price !== null ? (
            <span className="text-sm font-mono">{formatPrice(position.current_price)}</span>
          ) : (
            <span className="text-sm text-muted-foreground">-</span>
          )}
        </td>

        {/* Size */}
        <td className="py-3 px-4 text-right">
          <span className="text-sm font-mono">{formatSize(position.size)}</span>
        </td>

        {/* PnL */}
        <td className="py-3 px-4 text-right">
          <div className="flex flex-col items-end">
            <span
              className={cn(
                'text-sm font-mono font-semibold',
                isProfit && 'text-success',
                isLoss && 'text-danger'
              )}
            >
              {formatPnl(pnl)}
            </span>
            {pnlPercentage !== null && (
              <span
                className={cn(
                  'text-xs',
                  isProfit && 'text-success',
                  isLoss && 'text-danger'
                )}
              >
                {pnlPercentage > 0 ? '+' : ''}{pnlPercentage.toFixed(1)}%
              </span>
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation()
                onViewMarket?.(position.market_id)
              }}
              aria-label="View market"
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-danger hover:text-danger hover:bg-danger/10"
              onClick={(e) => {
                e.stopPropagation()
                onClosePosition?.(position.id)
              }}
              aria-label="Close position"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </td>
      </motion.tr>

      {/* Expanded details row */}
      <AnimatePresence>
        {isExpanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-muted/20"
          >
            <td colSpan={7} className="py-4 px-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Total Invested</p>
                  <p className="font-semibold">{formatCurrency(investedValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Current Value</p>
                  <p className="font-semibold">{formatCurrency(currentValue)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Entry Date</p>
                  <p className="font-semibold">
                    {new Date(position.created_at ?? new Date()).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs mb-1">Market Category</p>
                  <p className="font-semibold capitalize">
                    {position.market.category ?? 'Uncategorized'}
                  </p>
                </div>
              </div>
              {position.market.description && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <p className="text-muted-foreground text-xs mb-1">Market Description</p>
                  <p className="text-sm">{position.market.description}</p>
                </div>
              )}
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  )
})

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface TableSkeletonProps {
  rows?: number
}

function TableSkeleton({ rows = 5 }: TableSkeletonProps) {
  return (
    <div className="space-y-3">
      {[...Array(rows)].map((_, i) => (
        <Card key={i} variant="glass" className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

function EmptyState({
  title = 'No positions yet',
  description = 'Start trading to see your positions here',
  actionLabel,
  onAction
}: EmptyStateProps) {
  return (
    <Card variant="glass" className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-muted/20 flex items-center justify-center mb-4">
          <SlidersHorizontal className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-sm">{description}</p>
        {actionLabel && onAction && (
          <Button onClick={onAction}>{actionLabel}</Button>
        )}
      </CardContent>
    </Card>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PositionsTable = React.memo(function PositionsTable({
  positions,
  isLoading = false,
  sortOption,
  onSortChange,
  filters,
  onFilterChange,
  onClosePosition,
  onViewMarket,
  onRowClick,
  className,
  variant = 'default'
}: PositionsTableProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())
  const [localSort, setLocalSort] = React.useState<PositionSortOptions>({
    field: 'created_at',
    direction: 'desc'
  })
  const [localFilters, setLocalFilters] = React.useState<Partial<PositionFilters>>({
    outcome: undefined,
    marketStatus: undefined
  })

  const currentSort = sortOption || localSort
  const currentFilters = filters || localFilters

  // Toggle row expansion
  const toggleRow = (positionId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(positionId)) {
        next.delete(positionId)
      } else {
        next.add(positionId)
      }
      return next
    })
  }

  // Handle sort
  const handleSort = (field: SortField) => {
    const direction: 'asc' | 'desc' =
      currentSort.field === field && currentSort.direction === 'asc' ? 'desc' : 'asc'

    const newSort = { field, direction }
    setLocalSort(newSort)
    onSortChange?.(field, direction)
  }

  // Handle filter
  const handleFilter = (key: keyof PositionFilters, value: any) => {
    const newFilters = { ...currentFilters, [key]: value }
    setLocalFilters(newFilters)
    onFilterChange?.(newFilters)
  }

  // Loading state
  if (isLoading) {
    return <TableSkeleton rows={5} />
  }

  // Empty state
  if (positions.length === 0) {
    return <EmptyState />
  }

  // Filter positions
  let filteredPositions = [...positions]

  if (currentFilters.outcome) {
    filteredPositions = filteredPositions.filter(
      (p) => p.outcome.toLowerCase() === currentFilters.outcome?.toLowerCase()
    )
  }

  if (currentFilters.marketStatus === 'active') {
    filteredPositions = filteredPositions.filter((p) => p.market.active)
  } else if (currentFilters.marketStatus === 'closed') {
    filteredPositions = filteredPositions.filter((p) => !p.market.active)
  }

  // Sort positions
  filteredPositions.sort((a, b) => {
    let comparison = 0

    switch (currentSort.field) {
      case 'created_at':
        comparison =
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'pnl':
        comparison = (a.pnl || 0) - (b.pnl || 0)
        break
      case 'pnl_percentage':
        comparison = (a.pnl_percentage || 0) - (b.pnl_percentage || 0)
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'current_price':
        comparison = (a.current_price || 0) - (b.current_price || 0)
        break
    }

    return comparison * (currentSort.direction === 'asc' ? 1 : -1)
  })

  return (
    <Card variant="glass" className={cn('overflow-hidden', className)}>
      {/* Header with filters */}
      {(onSortChange || onFilterChange) && (
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-lg">Positions</CardTitle>

            {/* Filters */}
            {onFilterChange && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Filter className="w-3 h-3" />
                  Filter:
                </span>
                <FilterChip
                  label="All"
                  active={!currentFilters.outcome && !currentFilters.marketStatus}
                  onClick={() => {
                    setLocalFilters({ outcome: undefined, marketStatus: undefined })
                    onFilterChange({ outcome: undefined, marketStatus: undefined })
                  }}
                />
                <FilterChip
                  label="YES"
                  active={currentFilters.outcome?.toLowerCase() === 'yes'}
                  onClick={() => handleFilter('outcome', 'YES')}
                />
                <FilterChip
                  label="NO"
                  active={currentFilters.outcome?.toLowerCase() === 'no'}
                  onClick={() => handleFilter('outcome', 'NO')}
                />
                <FilterChip
                  label="Active"
                  active={currentFilters.marketStatus === 'active'}
                  onClick={() => handleFilter('marketStatus', 'active')}
                />
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Table */}
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 sticky top-0">
              <tr>
                <th className="py-3 px-4 text-left">
                  <TableHeader
                    field="created_at"
                    label="Market"
                    currentSort={currentSort}
                    onSort={onSortChange ? handleSort : undefined}
                  />
                </th>
                <th className="py-3 px-4 hidden md:table-cell">
                  <TableHeader
                    field="current_price"
                    label="Outcome"
                    currentSort={currentSort}
                    onSort={onSortChange ? handleSort : undefined}
                  />
                </th>
                <th className="py-3 px-4 text-right">
                  <TableHeader
                    field="current_price"
                    label="Avg Price"
                    currentSort={currentSort}
                    onSort={onSortChange ? handleSort : undefined}
                    align="right"
                  />
                </th>
                <th className="py-3 px-4 text-right">
                  <TableHeader
                    field="current_price"
                    label="Current Price"
                    currentSort={currentSort}
                    onSort={onSortChange ? handleSort : undefined}
                    align="right"
                  />
                </th>
                <th className="py-3 px-4 text-right">
                  <TableHeader
                    field="size"
                    label="Size"
                    currentSort={currentSort}
                    onSort={onSortChange ? handleSort : undefined}
                    align="right"
                  />
                </th>
                <th className="py-3 px-4 text-right">
                  <TableHeader
                    field="pnl"
                    label="PnL"
                    currentSort={currentSort}
                    onSort={onSortChange ? handleSort : undefined}
                    align="right"
                  />
                </th>
                <th className="py-3 px-4 text-right">
                  <span className="text-xs font-semibold text-muted-foreground">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.map((position) => (
                <PositionRow
                  key={position.id}
                  position={position}
                  isExpanded={expandedRows.has(position.id)}
                  onToggle={() => toggleRow(position.id)}
                  onClosePosition={onClosePosition}
                  onViewMarket={onViewMarket}
                  onRowClick={onRowClick}
                  variant={variant}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Result count */}
        <div className="px-4 py-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Showing {filteredPositions.length} of {positions.length} positions
          </p>
        </div>
      </CardContent>
    </Card>
  )
})

PositionsTable.displayName = 'PositionsTable'
