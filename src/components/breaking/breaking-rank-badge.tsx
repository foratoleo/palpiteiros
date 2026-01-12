/**
 * Breaking Rank Badge Component
 *
 * Circular badge displaying the market's rank in the breaking markets list.
 * Features metallic gradients for top ranks and subtle glow effects.
 *
 * @features
 * - Gold gradient for ranks 1-3
 * - Silver gradient for ranks 4-10
 * - Gray gradient for ranks 11+
 * - Subtle glow effect
 * - Responsive sizing (sm/md/lg)
 * - Smooth animations
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * BreakingRankBadge Props
 */
export interface BreakingRankBadgeProps {
  /** Rank number (1 = highest movement) */
  rank: number
  /** Badge size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS class names */
  className?: string
  /** Position variant for different contexts */
  variant?: 'absolute' | 'inline'
}

/**
 * Size configurations
 */
const sizeConfig = {
  sm: {
    container: 'w-6 h-6 text-xs',
    fontSize: 'text-[10px]',
    ring: 'ring-1'
  },
  md: {
    container: 'w-8 h-8 text-sm',
    fontSize: 'text-xs',
    ring: 'ring-2'
  },
  lg: {
    container: 'w-10 h-10 text-base',
    fontSize: 'text-sm',
    ring: 'ring-2'
  }
} as const

/**
 * BreakingRankBadge Component
 *
 * Displays a circular badge with the market's rank.
 * Features tiered metallic gradients based on rank position.
 *
 * @example
 * ```tsx
 * <BreakingRankBadge rank={1} size="md" />
 * <BreakingRankBadge rank={7} size="sm" variant="inline" />
 * ```
 */
export const BreakingRankBadge = React.memo<BreakingRankBadgeProps>(({
  rank,
  size = 'md',
  className,
  variant = 'absolute'
}) => {
  /**
   * Determine rank tier for styling
   */
  const tier = React.useMemo(() => {
    if (rank <= 3) return 'gold'
    if (rank <= 10) return 'silver'
    return 'bronze'
  }, [rank])

  /**
   * Get gradient classes based on tier
   */
  const gradientClasses = React.useMemo(() => {
    switch (tier) {
      case 'gold':
        return 'from-yellow-400 via-amber-400 to-yellow-500'
      case 'silver':
        return 'from-gray-300 via-slate-300 to-gray-400'
      case 'bronze':
        return 'from-orange-700 via-amber-700 to-orange-800'
      default:
        return 'from-gray-400 via-gray-500 to-gray-600'
    }
  }, [tier])

  /**
   * Get shadow/glow classes based on tier
   */
  const glowClasses = React.useMemo(() => {
    switch (tier) {
      case 'gold':
        return 'shadow-lg shadow-yellow-500/20'
      case 'silver':
        return 'shadow-md shadow-gray-400/20'
      case 'bronze':
        return 'shadow-md shadow-orange-700/20'
      default:
        return 'shadow-sm'
    }
  }, [tier])

  /**
   * Text color for contrast
   */
  const textColor = React.useMemo(() => {
    return tier === 'gold' || tier === 'silver' ? 'text-gray-900' : 'text-white'
  }, [tier])

  const config = sizeConfig[size]

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 20,
        delay: 0.1
      }}
      className={cn(
        // Base styles
        'relative flex items-center justify-center',
        'font-bold tabular-nums',
        // Rounded full for circle
        'rounded-full',
        // Gradient background
        'bg-gradient-to-br',
        gradientClasses,
        // Ring for metallic border effect
        config.ring,
        tier === 'gold' && 'ring-yellow-300/50',
        tier === 'silver' && 'ring-gray-300/50',
        tier === 'bronze' && 'ring-orange-600/50',
        // Size
        config.container,
        config.fontSize,
        // Text color
        textColor,
        // Glow effect
        glowClasses,
        // Positioning
        variant === 'absolute' && 'absolute -top-2 -left-2',
        // Custom classes
        className
      )}
      aria-label={`Rank #${rank}`}
    >
      {/* Inner shine effect */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'bg-gradient-to-br from-white/30 to-transparent',
          'pointer-events-none'
        )}
      />

      {/* Rank number */}
      <span className="relative z-10">
        {rank}
      </span>
    </motion.div>
  )
})

BreakingRankBadge.displayName = 'BreakingRankBadge'
