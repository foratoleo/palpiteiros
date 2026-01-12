/**
 * Breaking Market Card Component
 *
 * Main card component for displaying breaking markets with significant
 * price movements. Features glassmorphism design, real-time updates,
 * and Apple-inspired animations.
 *
 * @features
 * - Glassmorphism card with backdrop blur
 * - Rank badge (top-left)
 * - Market image thumbnail
 * - Question and category tags
 * - Current price → Previous price display
 * - Mini sparkline chart (24h history)
 * - Volume change indicator
 * - Movement trend arrow
 * - Hover effects (scale + shadow)
 * - Flash animation on price updates
 * - Responsive layout
 * - Accessibility (keyboard nav, ARIA labels)
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import type { BreakingMarket } from '@/types/breaking.types'
import { BreakingRankBadge } from './breaking-rank-badge'
import { MovementIndicator } from './movement-indicator'
import { MiniSparkline } from './mini-sparkline'

/**
 * BreakingMarketCard Props
 */
export interface BreakingMarketCardProps {
  /** Breaking market data to display */
  market: BreakingMarket
  /** Rank in breaking markets list */
  rank: number
  /** Click handler for navigation/selection */
  onClick?: () => void
  /** Show both current and previous prices */
  showPreviousPrice?: boolean
  /** Additional CSS class names */
  className?: string
  /** Callback invoked when market receives real-time update (triggers flash animation) */
  onUpdate?: (marketId: string) => void
}

/**
 * BreakingMarketCard Component
 *
 * Displays a breaking market with:
 * - Rank badge (gold/silver/bronze)
 * - Market image
 * - Question text
 * - Category tags
 * - Current price → Previous price
 * - Trend arrow indicator
 * - Mini sparkline chart
 * - Volume change
 *
 * @example
 * ```tsx
 * <BreakingMarketCard
 *   market={breakingMarket}
 *   rank={1}
 *   showPreviousPrice
 *   onClick={() => router.push(`/markets/${market.id}`)}
 * />
 * ```
 */
export const BreakingMarketCard = React.memo<BreakingMarketCardProps>(({
  market,
  rank,
  onClick,
  showPreviousPrice = false,
  className,
  onUpdate
}) => {
  const [isHovered, setIsHovered] = React.useState(false)
  const [priceFlash, setPriceFlash] = React.useState<'up' | 'down' | null>(null)
  const previousMarketRef = React.useRef<BreakingMarket | null>(null)

  /**
   * Flash animation when price changes significantly
   * Detects both initial load (from price_change_24h) and real-time updates
   */
  React.useEffect(() => {
    const prevMarket = previousMarketRef.current

    // Check for significant price change on initial load
    if (!prevMarket && market.price_change_24h) {
      if (market.price_change_24h > 0.05) {
        setPriceFlash('up')
        const timer = setTimeout(() => setPriceFlash(null), 1000)
        return () => clearTimeout(timer)
      } else if (market.price_change_24h < -0.05) {
        setPriceFlash('down')
        const timer = setTimeout(() => setPriceFlash(null), 1000)
        return () => clearTimeout(timer)
      }
    }

    // Check for real-time price updates
    if (prevMarket && prevMarket.current_price !== market.current_price) {
      const currentPrice = market.current_price ?? 0
      const previousPrice = prevMarket.current_price ?? 0
      const priceChange = Math.abs((currentPrice - previousPrice) / (previousPrice || 1))

      if (priceChange > 0.05) {
        // Flash animation based on price direction
        const direction = currentPrice > previousPrice ? 'up' : 'down'
        setPriceFlash(direction)

        // Trigger animation sequence: pulse -> highlight -> normal
        const pulseTimer = setTimeout(() => setPriceFlash(null), 300)
        const highlightTimer = setTimeout(() => setPriceFlash(direction), 300)
        const normalTimer = setTimeout(() => setPriceFlash(null), 1000)

        // Call onUpdate callback to notify parent
        if (onUpdate) {
          onUpdate(market.id)
        }

        return () => {
          clearTimeout(pulseTimer)
          clearTimeout(highlightTimer)
          clearTimeout(normalTimer)
        }
      }
    }

    // Update ref for next comparison
    previousMarketRef.current = market
  }, [market.current_price, market.price_change_24h, market.id, onUpdate])

  /**
   * Handle card click
   */
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick()
    }
  }, [onClick])

  /**
   * Calculate previous price from 24h change
   */
  const previousPrice = React.useMemo(() => {
    const change = market.price_change_24h ?? 0
    const currentPrice = market.current_price ?? 0.5
    if (currentPrice) {
      return Math.max(0, Math.min(1, currentPrice / (1 + change)))
    }
    return 0.5
  }, [market.current_price, market.price_change_24h])

  /**
   * Format price as percentage
   */
  const formatPrice = (price: number) => {
    return `${Math.round(price * 100)}%`
  }

  /**
   * Get volume change color
   * Handles undefined/null values safely
   */
  const volumeChangeColor = React.useMemo(() => {
    const volumeChange = market.volume_change_24h ?? 0
    if (volumeChange > 0) return 'text-green-500'
    if (volumeChange < 0) return 'text-red-500'
    return 'text-gray-400'
  }, [market.volume_change_24h])

  /**
   * Generate placeholder image URL
   */
  const imageUrl = React.useMemo(() => {
    if (market.image_url) return market.image_url

    // Generate deterministic gradient based on market ID
    const hash = market.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue1 = hash % 360
    const hue2 = (hue1 + 40) % 360
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="80" height="80" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue1},70%,80%)" />
            <stop offset="100%" style="stop-color:hsl(${hue2},70%,80%)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" rx="8" />
      </svg>`
    ).toString('base64')}`
  }, [market.id, market.image_url])

  /**
   * Extract price history for sparkline
   * Fallback to empty array if price_history_24h is undefined/null
   */
  const sparklineData = React.useMemo(() => {
    return market.price_history_24h?.map((point) => point.price_yes) ?? []
  }, [market.price_history_24h])

  const cardContent = (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card
        variant={isHovered ? 'elevated' : 'glass'}
        className={cn(
          'relative h-full overflow-hidden',
          'transition-all duration-200',
          'hover:border-primary/50 hover:shadow-xl',
          'group cursor-pointer',
          className
        )}
        onClick={handleClick}
      >
        {/* Rank Badge */}
        <BreakingRankBadge rank={rank} size="md" variant="absolute" />

        {/* Main Content */}
        <div className="relative p-4 pl-14">
          {/* Market Image + Question */}
          <div className="flex items-start gap-3 mb-3">
            {/* Thumbnail Image */}
            <div className="relative shrink-0">
              <div
                className={cn(
                  'w-16 h-16 rounded-lg overflow-hidden',
                  'bg-gradient-to-br from-primary/10 to-primary/5',
                  'border border-border/50',
                  'transition-transform duration-200',
                  'group-hover:scale-105'
                )}
              >
                <img
                  src={imageUrl}
                  alt={market.question}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Question + Category */}
            <div className="flex-1 min-w-0">
              {/* Category Badge */}
              {market.category && (
                <Badge
                  variant="glass"
                  className="mb-2 text-xs font-normal"
                >
                  {market.category}
                </Badge>
              )}

              {/* Question Text */}
              <h3
                className={cn(
                  'font-semibold text-sm leading-tight',
                  'line-clamp-2',
                  'mb-1',
                  'group-hover:text-primary transition-colors duration-200'
                )}
              >
                {market.question}
              </h3>

              {/* Volume Change */}
              {(market.volume_change_24h ?? 0) !== 0 && (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs font-medium',
                    volumeChangeColor
                  )}
                >
                  {(market.volume_change_24h ?? 0) > 0 ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span className="tabular-nums">
                    {Math.abs((market.volume_change_24h ?? 0) * 100).toFixed(1)}% vol
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Price Section */}
          <div className="flex items-center justify-between gap-3">
            {/* Current Price + Previous Price */}
            <div className="flex items-center gap-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${market.current_price}-${priceFlash}`}
                  initial={priceFlash ? { scale: 1.2, opacity: 0.8 } : false}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex items-baseline gap-2"
                >
                  {/* Current Price (LARGE) */}
                  <span
                    className={cn(
                      'text-2xl font-bold tabular-nums',
                      'bg-gradient-to-r bg-clip-text text-transparent',
                      market.trend === 'up' && 'from-green-500 to-emerald-500',
                      market.trend === 'down' && 'from-red-500 to-rose-500',
                      market.trend === 'neutral' && 'from-gray-600 to-gray-700',
                      priceFlash === 'up' && 'animate-pulse',
                      priceFlash === 'down' && 'animate-pulse'
                    )}
                  >
                    {formatPrice(market.current_price ?? 0)}
                  </span>

                  {/* Arrow + Previous Price */}
                  {showPreviousPrice && (
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 text-sm">→</span>
                      <span className="text-gray-400 text-sm font-medium tabular-nums">
                        {formatPrice(previousPrice)}
                      </span>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Movement Indicator */}
            <MovementIndicator
              currentPrice={market.current_price || 0}
              previousPrice={previousPrice}
              size={20}
            />
          </div>

          {/* Mini Sparkline Chart */}
          {sparklineData.length > 1 && (
            <div className="mt-3 h-10 w-full">
              <MiniSparkline
                data={sparklineData}
                height={40}
                color={
                  market.trend === 'up'
                    ? 'hsl(142, 76%, 36%)'
                    : market.trend === 'down'
                    ? 'hsl(0, 84%, 60%)'
                    : undefined
                }
              />
            </div>
          )}
        </div>

        {/* Shine effect on hover */}
        <motion.div
          className={cn(
            'absolute inset-0 pointer-events-none',
            'bg-gradient-to-tr from-white/0 via-white/5 to-white/0',
            'opacity-0 group-hover:opacity-100',
            'transition-opacity duration-300'
          )}
          animate={isHovered ? { x: ['0%', '100%'] } : {}}
          transition={{ duration: 0.6, ease: 'linear' }}
        />
      </Card>
    </motion.div>
  )

  // Wrap in Link if onClick is not provided (default navigation)
  if (!onClick) {
    return (
      <Link
        href={`/markets/${market.id}`}
        className="block w-full md:w-[400px]"
        style={{ width: '100%' }}
      >
        {cardContent}
      </Link>
    )
  }

  return <div className="w-full md:w-[400px]">{cardContent}</div>
})

BreakingMarketCard.displayName = 'BreakingMarketCard'
