/**
 * Market Card Component
 *
 * Main market card component for displaying prediction markets in a grid or list view.
 * Features responsive design, hover effects, and accessibility.
 *
 * @features
 * - Responsive layout (mobile/tablet/desktop)
 * - Status badges (active, closed, pending)
 * - Favorite toggle with animation
 * - Hover effects (scale, shadow, border glow)
 * - Click navigation to market detail
 * - Apple-inspired micro-interactions
 * - Dark mode support
 * - Accessibility (ARIA labels, keyboard nav)
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import type { Market, MarketCardProps } from '@/types/market.types'
import { useMarketStore } from '@/stores/market.store'
import { MarketCardPrice } from './market-card-price'
import { MarketCardMeta } from './market-card-meta'
import { BlurUpLoader, SkeletonImage } from '@/components/effects/images'

/**
 * Market Card Component
 *
 * Displays a prediction market with question, price, metadata, and actions.
 * Supports multiple variants (default, compact, detailed) for different contexts.
 *
 * @example
 * ```tsx
 * <MarketCard
 *   market={market}
 *   variant="default"
 *   showPrice
 *   showVolume
 *   onClick={(market) => router.push(`/markets/${market.id}`)}
 * />
 * ```
 */
export const MarketCard = React.memo<MarketCardProps>(({
  market,
  variant = 'default',
  showPrice = true,
  showVolume = true,
  showLiquidity = true,
  onClick,
  className,
  showImage = true,
  enableProgressiveImage = true,
  imageLoadingEffect = 'blur-up'
}) => {
  const { isFavorite, toggleFavorite } = useMarketStore()
  const favorite = isFavorite(market.id)
  const [isHovered, setIsHovered] = React.useState(false)

  // Handle favorite toggle
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(market.id)
  }

  // Handle card click
  const handleClick = () => {
    if (onClick) {
      onClick(market)
    }
  }

  // Determine status badge
  const statusBadge = React.useMemo(() => {
    if (market.closed) {
      return <Badge variant="secondary">Closed</Badge>
    }
    if (!market.active) {
      return <Badge variant="outline">Pending</Badge>
    }
    return <Badge variant="success">Active</Badge>
  }, [market.active, market.closed])

  // Generate placeholder image URL based on market ID (for demo purposes)
  const getImageUrl = () => {
    if (market.image_url) return market.image_url
    // Generate deterministic gradient based on market ID
    const hash = market.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const hue1 = hash % 360
    const hue2 = (hue1 + 40) % 360
    return `data:image/svg+xml;base64,${Buffer.from(
      `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:hsl(${hue1},70%,80%)" />
            <stop offset="100%" style="stop-color:hsl(${hue2},70%,80%)" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
      </svg>`
    ).toString('base64')}`
  }

  // Render thumbnail image (48x48px) for horizontal layout
  const renderThumbnail = () => {
    const imageUrl = getImageUrl()

    return (
      <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/50">
        <img
          src={imageUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  // Render image component based on effect (for detailed variant)
  const renderImage = () => {
    const imageUrl = getImageUrl()
    const imageAlt = market.question || 'Market image'

    if (imageLoadingEffect === 'skeleton') {
      return (
        <SkeletonImage
          src={imageUrl}
          alt={imageAlt}
          width={400}
          height={200}
          variant="rounded"
          shimmer
          className="w-full aspect-video"
          imageClassName="rounded-t-lg"
        />
      )
    }

    if (imageLoadingEffect === 'blur-up') {
      return (
        <BlurUpLoader
          src={imageUrl}
          alt={imageAlt}
          width={400}
          height={200}
          placeholderColor={`hsl(${parseInt(market.id.slice(0, 3), 36) % 360}, 30%, 90%)`}
          blurAmount={15}
          className="w-full aspect-video rounded-t-lg overflow-hidden"
          imageClassName="w-full h-full object-cover"
        />
      )
    }

    // Progressive
    return (
      <BlurUpLoader
        src={imageUrl}
        alt={imageAlt}
        width={400}
        height={200}
        placeholderColor={`hsl(${parseInt(market.id.slice(0, 3), 36) % 360}, 30%, 90%)`}
        enableBlur={enableProgressiveImage}
        className="w-full aspect-video rounded-t-lg overflow-hidden"
        imageClassName="w-full h-full object-cover"
      />
    )
  }

  // Compact variant (smaller, more data-dense)
  if (variant === 'compact') {
    return (
      <Link href={`/markets/${market.id}`} className="block">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Card
            variant={isHovered ? 'elevated' : 'default'}
            className={cn(
              'cursor-pointer transition-all duration-200',
              'hover:border-primary/50',
              className
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {statusBadge}
                    {market.tags?.slice(0, 1).map((tag: any) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.label}
                      </Badge>
                    )) ?? null}
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                    {market.question}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {showVolume && (market.volume ?? 0) > 0 && (
                      <span>Vol: ${((market.volume ?? 0) / 1000).toFixed(1)}K</span>
                    )}
                    {showLiquidity && (market.liquidity ?? 0) > 0 && (
                      <span>Liq: ${((market.liquidity ?? 0) / 1000).toFixed(1)}K</span>
                    )}
                  </div>
                </div>
                {/* Thumbnail in compact view */}
                {showImage && renderThumbnail()}
                {showPrice && <MarketCardPrice market={market} size="sm" />}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </Link>
    )
  }

  // Detailed variant (more information, larger)
  if (variant === 'detailed') {
    return (
      <Link href={`/markets/${market.id}`} className="block">
        <motion.div
          whileHover={{ scale: 1.02, y: -4 }}
          whileTap={{ scale: 0.98 }}
          onHoverStart={() => setIsHovered(true)}
          onHoverEnd={() => setIsHovered(false)}
        >
          <Card
            variant={isHovered ? 'elevated' : 'glass'}
            className={cn(
              'cursor-pointer transition-all duration-300',
              'hover:border-primary/50 hover:shadow-2xl',
              'overflow-hidden',
              className
            )}
          >
            {/* Image section */}
            {showImage && (
              <div className="relative">
                {renderImage()}
                <div className="absolute top-2 right-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      'bg-background/80 backdrop-blur-sm transition-colors',
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
                </div>
              </div>
            )}
            <CardHeader className={cn(showImage ? 'pb-3' : 'pb-3')}>
              <div className={cn('flex items-start gap-3', showImage && '-mt-2')}>
                {/* Title section with tags and description */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    {statusBadge}
                    {market.tags?.slice(0, 3).map((tag: any) => (
                      <Badge key={tag.id} variant="outline" className="text-xs">
                        {tag.label}
                      </Badge>
                    )) ?? null}
                  </div>
                  <h3 className="font-bold text-lg leading-tight mb-2 line-clamp-2">
                    {market.question}
                  </h3>
                  {market.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {market.description}
                    </p>
                  )}
                </div>

                {/* Thumbnail in detailed view */}
                {showImage && renderThumbnail()}

                {/* Favorite button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'shrink-0 transition-colors',
                    favorite && 'text-red-500 hover:text-red-600'
                  )}
                  onClick={handleFavoriteClick}
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart
                    className={cn(
                      'h-5 w-5 transition-all',
                      favorite && 'fill-current'
                    )}
                  />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              {showPrice && <MarketCardPrice market={market} size="lg" />}
            </CardContent>
            <CardFooter>
              <MarketCardMeta
                market={market}
                showVolume={showVolume}
                showLiquidity={showLiquidity}
                showEndDate
                showTags
              />
            </CardFooter>
          </Card>
        </motion.div>
      </Link>
    )
  }

  // Default variant (balanced)
  return (
    <Link href={`/markets/${market.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        <Card
          variant={isHovered ? 'elevated' : 'default'}
          className={cn(
            'cursor-pointer transition-all duration-200',
            'group hover:border-primary/50',
            className
          )}
          onClick={handleClick}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              {/* Title section with category badges and question */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {statusBadge}
                  {market.tags?.slice(0, 2).map((tag: any) => (
                    <Badge
                      key={tag.id}
                      variant="glass"
                      className="text-xs font-normal"
                    >
                      {tag.label}
                    </Badge>
                  )) ?? null}
                </div>
                <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                  {market.question}
                </h3>
                {market.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {market.description}
                  </p>
                )}
              </div>

              {/* Thumbnail image (48x48px) */}
              {showImage && renderThumbnail()}

              {/* Favorite button */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'shrink-0 transition-all duration-200',
                  favorite && 'text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'
                )}
                onClick={handleFavoriteClick}
                aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 transition-all',
                      favorite && 'fill-current scale-110'
                    )}
                  />
                </motion.div>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            {showPrice && <MarketCardPrice market={market} size="md" />}
          </CardContent>
          <CardFooter>
            <MarketCardMeta
              market={market}
              showVolume={showVolume}
              showLiquidity={showLiquidity}
              showEndDate
            />
          </CardFooter>
        </Card>
      </motion.div>
    </Link>
  )
})

MarketCard.displayName = 'MarketCard'
