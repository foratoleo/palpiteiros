/**
 * Market Card Meta Component
 *
 * Reusable metadata display component for market cards.
 * Shows category badge, tags, end date countdown, volume, and liquidity.
 *
 * @features
 * - Category badge with color coding
 * - Tags as clickable chips
 * - Countdown timer (days/hours/minutes)
 * - Volume/liquidity with proper formatting (K, M, B)
 * - Tooltip on hover for full details
 * - Compact layout for card footer
 * - Responsive design
 */

'use client'

import * as React from 'react'
import { Calendar, DollarSign, TrendingUp, Hash } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Market } from '@/types/market.types'

/**
 * Market Card Meta Props
 */
export interface MarketCardMetaProps {
  /** Market data */
  market: Market
  /** Show category badge */
  showCategory?: boolean
  /** Show tags as chips */
  showTags?: boolean
  /** Show end date countdown */
  showEndDate?: boolean
  /** Show volume */
  showVolume?: boolean
  /** Show liquidity */
  showLiquidity?: boolean
  /** Display density */
  density?: 'compact' | 'comfortable'
  /** Additional CSS class names */
  className?: string
}

/**
 * Format Number Utility
 *
 * Formats large numbers with K, M, B suffixes.
 */
function formatNumber(num: number): string {
  if (num == null || isNaN(num)) return '0'
  const value = Math.abs(num)
  if (value >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(1)}B`
  }
  if (value >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1)}M`
  }
  if (value >= 1_000) {
    return `${(num / 1_000).toFixed(1)}K`
  }
  return num.toFixed(0)
}

/**
 * Countdown Timer Component
 *
 * Displays time remaining until market closes.
 *
 * T17.2: Memoized with custom comparison to prevent re-renders
 * when the endDate prop hasn't changed.
 */
const CountdownTimer = React.memo(function CountdownTimer({
  endDate,
  className
}: {
  endDate: string | null
  className?: string
}) {
  const [timeLeft, setTimeLeft] = React.useState({
    days: 0,
    hours: 0,
    minutes: 0
  })

  React.useEffect(() => {
    if (!endDate) return

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const end = new Date(endDate).getTime()
      const difference = end - now

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        }
      }

      return { days: 0, hours: 0, minutes: 0 }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [endDate])

  if (!endDate) return null

  const { days, hours, minutes } = timeLeft
  const isClosingSoon = days === 0 && hours < 24

  return (
    <div
      className={cn(
        'flex items-center gap-1.5 text-xs',
        isClosingSoon ? 'text-orange-500 font-medium' : 'text-muted-foreground',
        className
      )}
    >
      <Calendar className="h-3 w-3 shrink-0" />
      <span className="tabular-nums">
        {days > 0 && `${days}d `}
        {hours}h {minutes}m
      </span>
      {isClosingSoon && <span className="ml-1 text-orange-600">· Closing soon</span>}
    </div>
  )
}, (prevProps, nextProps) => {
  // Only re-render if endDate changes
  return prevProps.endDate === nextProps.endDate
})

CountdownTimer.displayName = 'CountdownTimer'

/**
 * Market Card Meta Component
 *
 * Displays market metadata with icons and proper formatting.
 * Responsive layout that adapts to available space.
 *
 * T17.2: Memoized to prevent unnecessary re-renders when parent updates.
 * Only re-renders when market metadata or visibility flags change.
 *
 * @example
 * ```tsx
 * <MarketCardMeta
 *   market={market}
 *   showVolume
 *   showLiquidity
 *   showEndDate
 *   showTags
 * />
 * ```
 */
export const MarketCardMeta = React.memo(function MarketCardMeta({
  market,
  showCategory = false,
  showTags = false,
  showEndDate = true,
  showVolume = true,
  showLiquidity = true,
  density = 'comfortable',
  className
}: MarketCardMetaProps) {
  const isCompact = density === 'compact'

  return (
    <div
      className={cn(
        'flex items-center gap-3 flex-wrap text-xs',
        isCompact ? 'gap-2' : 'gap-3',
        className
      )}
    >
      {/* Category Badge */}
      {showCategory && market.category && (
        <Badge
          variant="outline"
          className="text-xs font-normal capitalize"
        >
          {market.category}
        </Badge>
      )}

      {/* Tags */}
      {showTags && market.tags && market.tags.length > 0 && (
        <div className="flex items-center gap-1.5">
          <Hash className="h-3 w-3 text-muted-foreground shrink-0" />
          <div className="flex items-center gap-1.5 flex-wrap">
            {market.tags?.slice(0, 2).map((tag: any) => (
              <span
                key={tag.id}
                className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                title={tag.label}
              >
                {tag.label}
              </span>
            )) ?? []}
            {(market.tags.length ?? 0) > 2 && (
              <span className="text-muted-foreground">
                +{(market.tags.length ?? 0) - 2}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Volume */}
      {showVolume && (market.volume ?? 0) > 0 && (
        <div
          className="flex items-center gap-1.5 text-muted-foreground"
          title={`Volume: $${(market.volume ?? 0).toLocaleString()}`}
        >
          <DollarSign className="h-3 w-3 shrink-0" />
          <span className="tabular-nums">{formatNumber(market.volume ?? 0)}</span>
        </div>
      )}

      {/* Liquidity */}
      {showLiquidity && (market.liquidity ?? 0) > 0 && (
        <div
          className="flex items-center gap-1.5 text-muted-foreground"
          title={`Liquidity: $${(market.liquidity ?? 0).toLocaleString()}`}
        >
          <TrendingUp className="h-3 w-3 shrink-0" />
          <span className="tabular-nums">{formatNumber(market.liquidity ?? 0)}</span>
        </div>
      )}

      {/* End Date */}
      {showEndDate && market.end_date && (
        <CountdownTimer endDate={market.end_date} />
      )}
    </div>
  )
})

MarketCardMeta.displayName = 'MarketCardMeta'

/**
 * Market Card Meta Inline Component
 *
 * Inline version for use in list views or table rows.
 * More compact layout with icon + text pairs.
 *
 * T17.2: Memoized for performance in table/list contexts.
 */
export const MarketCardMetaInline = React.memo(function MarketCardMetaInline({
  market,
  className
}: {
  market: Market
  className?: string
}) {
  return (
    <div className={cn('flex items-center gap-4 text-sm', className)}>
      {(market.volume ?? 0) > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground" title="Volume">
          <DollarSign className="h-3.5 w-3.5 shrink-0" />
          <span className="tabular-nums font-medium text-foreground">
            {formatNumber(market.volume ?? 0)}
          </span>
        </div>
      )}

      {(market.liquidity ?? 0) > 0 && (
        <div className="flex items-center gap-1.5 text-muted-foreground" title="Liquidity">
          <TrendingUp className="h-3.5 w-3.5 shrink-0" />
          <span className="tabular-nums font-medium text-foreground">
            {formatNumber(market.liquidity ?? 0)}
          </span>
        </div>
      )}

      {market.end_date && (
        <CountdownTimer endDate={market.end_date} />
      )}
    </div>
  )
})

MarketCardMetaInline.displayName = 'MarketCardMetaInline'
