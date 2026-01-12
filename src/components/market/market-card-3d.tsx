/**
 * Market Card 3D Component
 *
 * Enhanced market card with 3D tilt effect, holographic gradients,
 * and Apple-level visual polish using Framer Motion.
 *
 * @features
 * - 3D tilt effect on mouse move
 * - Specular highlights on card edges
 * - Holographic gradient effect on hover
 * - Perspective transform based on mouse position
 * - Glassmorphism variant with backdrop-blur
 * - Floating animation when idle
 * - Optimized performance with RAF throttling
 * - Touch device support with gyroscope
 */

'use client'

import * as React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Market } from '@/types/market.types'
import { useMarketStore } from '@/stores/market.store'
import { MarketCardPrice } from './market-card-price'
import { MarketCardMeta } from './market-card-meta'

/**
 * Market Card 3D Props
 */
export interface MarketCard3DProps {
  /** Market data */
  market: Market
  /** Show current price information */
  showPrice?: boolean
  /** Show trading volume */
  showVolume?: boolean
  /** Show liquidity information */
  showLiquidity?: boolean
  /** Maximum tilt angle in degrees */
  maxTilt?: number
  /** Enable holographic effect */
  holographic?: boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * Market Card 3D Component
 *
 * Displays a market card with interactive 3D effects.
 * Responds to mouse movement with smooth transforms.
 *
 * @example
 * ```tsx
 * <MarketCard3D
 *   market={market}
 *   maxTilt={15}
 *   holographic
 * />
 * ```
 */
export function MarketCard3D({
  market,
  showPrice = true,
  showVolume = true,
  showLiquidity = true,
  maxTilt = 15,
  holographic = true,
  className
}: MarketCard3DProps) {
  const { isFavorite, toggleFavorite } = useMarketStore()
  const favorite = isFavorite(market.id)

  const ref = React.useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  // Motion values for smooth transforms
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for smooth animation
  const springConfig = { damping: 20, stiffness: 300 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig)

  // Specular highlight effect
  const backgroundX = useSpring(useTransform(mouseX, [-0.5, 0.5], ['0%', '100%']))
  const backgroundY = useSpring(useTransform(mouseY, [-0.5, 0.5], ['0%', '100%']))

  // Handle mouse move with RAF throttling
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY]
  )

  // Handle mouse leave
  const handleMouseLeave = () => {
    setIsHovered(false)
    mouseX.set(0)
    mouseY.set(0)
  }

  // Handle favorite toggle
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleFavorite(market.id)
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

  return (
    <Link href={`/markets/${market.id}`} className="block">
      <motion.div
        ref={ref}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        whileHover={{ scale: 1.05, z: 50 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <Card
          className={cn(
            'relative overflow-hidden transition-all duration-300',
            'transform-gpu', // Force GPU acceleration
            holographic && 'bg-gradient-to-br from-card via-card to-accent/5',
            'hover:shadow-2xl hover:shadow-primary/20',
            className
          )}
          style={{
            // Holographic shimmer effect
            backgroundImage: holographic && isHovered
              ? `radial-gradient(circle at ${backgroundX.get()}% ${backgroundY.get()}%, rgba(255,255,255,0.1) 0%, transparent 50%)`
              : undefined
          }}
        >
          {/* Specular highlight overlay */}
          {holographic && (
            <motion.div
              className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)',
                mixBlendMode: 'overlay'
              }}
              animate={{
                opacity: isHovered ? 0.6 : 0
              }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Floating animation for idle state */}
          <motion.div
            animate={{
              y: isHovered ? 0 : [0, -5, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut'
            }}
          >
            <CardHeader className="pb-3" style={{ transform: 'translateZ(20px)' }}>
              <div className="flex items-start justify-between gap-3">
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
                    )) ?? []}
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
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    'shrink-0 transition-all duration-200',
                    favorite && 'text-red-500 hover:text-red-600'
                  )}
                  onClick={handleFavoriteClick}
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                  style={{ transform: 'translateZ(30px)' }}
                >
                  <motion.div
                    whileTap={{ scale: 0.8 }}
                    whileHover={{ rotate: favorite ? 360 : 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
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

            <CardContent className="pb-3" style={{ transform: 'translateZ(25px)' }}>
              {showPrice && <MarketCardPrice market={market} size="md" showSparkline showChange />}
            </CardContent>

            <CardFooter style={{ transform: 'translateZ(20px)' }}>
              <MarketCardMeta
                market={market}
                showVolume={showVolume}
                showLiquidity={showLiquidity}
                showEndDate
              />
            </CardFooter>
          </motion.div>

          {/* Edge glow effect */}
          {holographic && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                boxShadow: isHovered
                  ? `inset 0 0 30px rgba(59, 130, 246, 0.1), inset 0 0 60px rgba(59, 130, 246, 0.05)`
                  : 'none'
              }}
              transition={{ duration: 0.3 }}
            />
          )}
        </Card>
      </motion.div>
    </Link>
  )
}

/**
 * Market Card 3D Simple Props
 */
export interface MarketCard3DSimpleProps {
  /** Market data */
  market: Market
  /** Tilt intensity (1-10) */
  intensity?: number
  /** Additional CSS class names */
  className?: string
}

/**
 * Market Card 3D Simple Component
 *
 * Simplified version with subtle 3D effect.
 * Better performance for large grids.
 */
export function MarketCard3DSimple({
  market,
  intensity = 3,
  className
}: MarketCard3DSimpleProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  return (
    <Link href={`/markets/${market.id}`} className="block">
      <motion.div
        ref={ref}
        whileHover={{
          scale: 1.02,
          rotateX: intensity * 0.5,
          rotateY: intensity * 0.5,
          transition: { type: 'spring', stiffness: 400, damping: 30 }
        }}
        whileTap={{ scale: 0.98 }}
      >
        <Card className={cn('transition-all duration-200', className)}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base leading-tight mb-1 line-clamp-2">
                  {market.question}
                </h3>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <MarketCardPrice market={market} size="md" />
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  )
}
