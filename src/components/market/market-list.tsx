/**
 * Market List Component
 *
 * List/table view alternative to grid for data-dense display.
 * Features sortable columns, expandable rows, and sticky header.
 *
 * @features
 * - Horizontal layout (market info | price | actions)
 * - Compact mode for mobile
 * - Sortable columns (click header to sort)
 * - Expandable rows for details
 * - Sticky header with column names
 * - Better for data-dense display
 * - Integrates with useMarkets hook
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Heart
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import type { Market } from '@/types/market.types'
import { MarketSortField, MarketSortDirection } from '@/types/market.types'
import { useMarketStore } from '@/stores/market.store'
import { MarketCardMetaInline } from './market-card-meta'

/**
 * Market List Props
 */
export interface MarketListProps {
  /** Array of markets to display */
  markets: Market[]
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string | null
  /** Initial sort field */
  sortField?: MarketSortField
  /** Initial sort direction */
  sortDirection?: MarketSortDirection
  /** Sort change callback */
  onSortChange?: (field: MarketSortField, direction: MarketSortDirection) => void
  /** Enable compact mode */
  compact?: boolean
  /** Enable row expansion */
  expandable?: boolean
  /** Show favorite column */
  showFavorite?: boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * Column definition
 */
interface Column {
  id: string
  label: string
  sortable: boolean
  className?: string
}

/**
 * Sort indicator component
 */
function SortIndicator({
  direction,
  active
}: {
  direction?: MarketSortDirection
  active?: boolean
}) {
  if (!active) return null

  return (
    <motion.span
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex ml-1"
    >
      {direction === 'asc' ? (
        <ChevronUp className="h-4 w-4" />
      ) : (
        <ChevronDown className="h-4 w-4" />
      )}
    </motion.span>
  )
}

/**
 * Market List Row Component
 *
 * Individual row in the market list.
 */
function MarketListRow({
  market,
  compact,
  expanded,
  onToggleExpand,
  showFavorite
}: {
  market: Market
  compact?: boolean
  expanded: boolean
  onToggleExpand: () => void
  showFavorite?: boolean
}) {
  const { isFavorite, toggleFavorite } = useMarketStore()
  const favorite = isFavorite(market.id)

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(market.id)
  }

  const priceChange = market.price_change_24h ?? 0
  const isPositive = priceChange > 0
  const isNegative = priceChange < 0

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      className="border-b border-border last:border-b-0"
    >
      <Link href={`/markets/${market.id}`} className="block">
        <div
          className={cn(
            'grid gap-4 px-4 py-3 transition-colors hover:bg-accent/50',
            compact
              ? 'grid-cols-[1fr_auto_auto] items-center'
              : 'grid-cols-[1fr_auto_auto_auto] items-center'
          )}
        >
          {/* Market Info */}
          <div className="min-w-0">
            <div className="flex items-start gap-3">
              {/* Expand Button (if expandable) */}
              {!compact && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 h-6 w-6 mt-0.5"
                  onClick={(e) => {
                    e.preventDefault()
                    onToggleExpand()
                  }}
                  aria-label={expanded ? 'Collapse' : 'Expand'}
                >
                  <motion.div
                    animate={{ rotate: expanded ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </motion.div>
                </Button>
              )}

              {/* Question and Tags */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                  {market.question}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {market.active ? (
                    <Badge variant="success" className="text-xs">Active</Badge>
                  ) : market.closed ? (
                    <Badge variant="secondary" className="text-xs">Closed</Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Pending</Badge>
                  )}
                  {market.tags?.slice(0, 2).map((tag: any) => (
                    <Badge key={tag.id} variant="outline" className="text-xs font-normal">
                      {tag.label}
                    </Badge>
                  )) ?? []}
                </div>
              </div>
            </div>
          </div>

          {/* Price */}
          <div className="shrink-0">
            <div className="text-right">
              <div className="font-bold text-lg tabular-nums">
                {((market.current_price ?? 0.5) * 100).toFixed(1)}%
              </div>
              <div
                className={cn(
                  'text-xs flex items-center justify-end gap-1',
                  isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {isPositive && <TrendingUp className="h-3 w-3" />}
                {isNegative && <TrendingDown className="h-3 w-3" />}
                <span className="tabular-nums">
                  {isPositive && '+'}
                  {priceChange.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Volume/Liquidity (hidden in compact) */}
          {!compact && (
            <div className="shrink-0 hidden sm:block">
              <MarketCardMetaInline market={market} />
            </div>
          )}

          {/* Actions */}
          <div className="shrink-0 flex items-center gap-2">
            {showFavorite && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'shrink-0 h-8 w-8',
                  favorite && 'text-red-500 hover:text-red-600'
                )}
                onClick={handleFavoriteClick}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Heart
                  className={cn(
                    'h-4 w-4 transition-all',
                    favorite && 'fill-current'
                  )}
                />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {expanded && !compact && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="px-4 pb-4 overflow-hidden"
            >
              <div className="pt-4 border-t border-border/50">
                {market.description && (
                  <p className="text-sm text-muted-foreground mb-3">
                    {market.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Volume: </span>
                    <span className="font-medium tabular-nums">
                      ${(market.volume ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Liquidity: </span>
                    <span className="font-medium tabular-nums">
                      ${(market.liquidity ?? 0).toLocaleString()}
                    </span>
                  </div>
                  {market.end_date && (
                    <div>
                      <span className="text-muted-foreground">Ends: </span>
                      <span className="font-medium">
                        {new Date(market.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>
    </motion.div>
  )
}

/**
 * Market List Component
 *
 * Table-like list view with sortable columns.
 * Better for data-dense displays and quick scanning.
 *
 * @example
 * ```tsx
 * const [sortField, setSortField] = useState<MarketSortField>(MarketSortField.VOLUME)
 * const [sortDirection, setSortDirection] = useState<MarketSortDirection>(MarketSortDirection.DESC)
 *
 * <MarketList
 *   markets={markets}
 *   sortField={sortField}
 *   sortDirection={sortDirection}
 *   onSortChange={(field, direction) => {
 *     setSortField(field)
 *     setSortDirection(direction)
 *   }}
 *   expandable
 *   showFavorite
 * />
 * ```
 */
export function MarketList({
  markets,
  loading = false,
  error = null,
  sortField = MarketSortField.VOLUME,
  sortDirection = MarketSortDirection.DESC,
  onSortChange,
  compact = false,
  expandable = true,
  showFavorite = true,
  className
}: MarketListProps) {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set())

  // Handle sort change
  const handleSort = (field: MarketSortField) => {
    if (!onSortChange) return

    // If clicking same field, toggle direction
    if (field === sortField) {
      const newDirection = sortDirection === MarketSortDirection.ASC
        ? MarketSortDirection.DESC
        : MarketSortDirection.ASC
      onSortChange(field, newDirection)
    } else {
      // New field, default to desc
      onSortChange(field, MarketSortDirection.DESC)
    }
  }

  // Toggle row expansion
  const toggleRow = (marketId: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev)
      if (next.has(marketId)) {
        next.delete(marketId)
      } else {
        next.add(marketId)
      }
      return next
    })
  }

  // Column definitions
  const columns: Column[] = [
    { id: 'question', label: 'Market', sortable: false },
    { id: 'price', label: 'Price', sortable: true },
    ...(!compact ? [{ id: 'volume', label: 'Volume / Liquidity', sortable: true }] as Column[] : []),
    { id: 'actions', label: '', sortable: false, className: 'w-16' }
  ]

  // Error state
  if (error) {
    return (
      <div className={cn('text-center py-16 px-4', className)}>
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  // Loading state
  if (loading && markets.length === 0) {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-muted/50 rounded-lg h-20" />
        ))}
      </div>
    )
  }

  // Empty state
  if (!loading && markets.length === 0) {
    return (
      <div className={cn('text-center py-16 px-4', className)}>
        <p className="text-muted-foreground">No markets found</p>
      </div>
    )
  }

  return (
    <div className={cn('border border-border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      {!compact && (
        <div className="bg-muted/50 px-4 py-3 border-b border-border">
          <div
            className={cn(
              'grid gap-4 font-semibold text-sm text-muted-foreground',
              compact
                ? 'grid-cols-[1fr_auto_auto]'
                : 'grid-cols-[1fr_auto_auto_auto]'
            )}
          >
            {columns.map((column) => (
              <div
                key={column.id}
                className={cn(
                  column.sortable && 'cursor-pointer hover:text-foreground transition-colors select-none',
                  column.className
                )}
                onClick={() => column.sortable && handleSort(column.id as MarketSortField)}
              >
                <div className="flex items-center">
                  {column.label}
                  {column.sortable && (
                    <SortIndicator
                      direction={
                        column.id === sortField ? sortDirection : undefined
                      }
                      active={column.id === sortField}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rows */}
      <div className="divide-y divide-border">
        <AnimatePresence mode="popLayout">
          {markets.map((market) => (
            <MarketListRow
              key={market.id}
              market={market}
              compact={compact}
              expanded={expandedRows.has(market.id)}
              onToggleExpand={() => toggleRow(market.id)}
              showFavorite={showFavorite}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
