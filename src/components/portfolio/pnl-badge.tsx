/**
 * PnL Badge Component
 *
 * Reusable badge component for displaying profit/loss values.
 * Features color coding, icons, animations, and multiple size variants.
 *
 * @features
 * - Props: amount, percentage, size (sm/md/lg), variant (flat/outline)
 * - Color coding: Green (+), Red (-), Gray (neutral/zero)
 * - Icon: Arrow up or down based on trend
 * - Animation: Pulse on price update
 * - Format: Currency with proper decimals
 * - Compact variant: Minimal text, icon only
 * - Used in: positions-table, position-card, portfolio-summary
 * - Accessibility: ARIA labels for screen readers
 *
 * @example
 * ```tsx
 * <PnLBadge amount={123.45} percentage={5.67} size="md" />
 * <PnLBadge amount={-50} size="sm" variant="outline" />
 * ```
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface PnLBadgeProps {
  /** PnL amount in currency */
  amount: number
  /** PnL percentage (optional) */
  percentage?: number | null
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Visual style variant */
  variant?: 'flat' | 'outline' | 'subtle'
  /** Show icon */
  showIcon?: boolean
  /** Show percentage */
  showPercentage?: boolean
  /** Custom CSS class names */
  className?: string
  /** Custom content renderer */
  children?: React.ReactNode
  /** Trigger update animation */
  animateUpdate?: boolean
  /** Previous amount (for animation direction) */
  previousAmount?: number
}

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

function formatPercentage(value: number): string {
  return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`
}

// ============================================================================
// SIZE STYLES
// ============================================================================

const sizeStyles = {
  sm: {
    container: 'px-2 py-0.5 text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1'
  },
  md: {
    container: 'px-2.5 py-1 text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1.5'
  },
  lg: {
    container: 'px-3 py-1.5 text-base',
    icon: 'w-5 h-5',
    gap: 'gap-2'
  }
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles = {
  flat: {
    positive: 'bg-success/10 text-success',
    negative: 'bg-danger/10 text-danger',
    neutral: 'bg-muted text-muted-foreground'
  },
  outline: {
    positive: 'bg-transparent border border-success/30 text-success',
    negative: 'bg-transparent border border-danger/30 text-danger',
    neutral: 'bg-transparent border border-border text-muted-foreground'
  },
  subtle: {
    positive: 'text-success',
    negative: 'text-danger',
    neutral: 'text-muted-foreground'
  }
}

// ============================================================================
// ICON COMPONENTS
// ============================================================================

interface PnLIconProps {
  type: 'up' | 'down' | 'neutral'
  size: 'sm' | 'md' | 'lg'
  className?: string
}

const PnLIcon = React.memo(function PnLIcon({ type, size, className }: PnLIconProps) {
  const iconSize = sizeStyles[size].icon

  if (type === 'up') {
    return <ArrowUp className={cn(iconSize, className)} />
  }
  if (type === 'down') {
    return <ArrowDown className={cn(iconSize, className)} />
  }
  return <Minus className={cn(iconSize, className)} />
})

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PnLBadge = React.memo(function PnLBadge({
  amount,
  percentage,
  size = 'md',
  variant = 'flat',
  showIcon = true,
  showPercentage = true,
  className,
  children,
  animateUpdate = false,
  previousAmount
}: PnLBadgeProps) {
  const [prevAmount, setPrevAmount] = React.useState(amount)

  // Track changes for animation
  React.useEffect(() => {
    if (animateUpdate && amount !== prevAmount) {
      setPrevAmount(previousAmount ?? prevAmount)
    }
  }, [amount, animateUpdate, previousAmount, prevAmount])

  // Determine trend
  const trend = amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral'
  const iconType = amount > 0 ? 'up' : amount < 0 ? 'down' : 'neutral'

  const styles = sizeStyles[size]
  const colors = variantStyles[variant]

  // Animation direction
  const animationDirection = previousAmount !== undefined
    ? amount > previousAmount ? 'up' : amount < previousAmount ? 'down' : 'neutral'
    : 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center font-semibold',
        styles.container,
        styles.gap,
        colors[trend],
        variant !== 'subtle' && 'rounded-full',
        className
      )}
      role="status"
      aria-label={`Profit and loss: ${formatCurrency(amount)}${percentage !== null && percentage !== undefined ? ` (${formatPercentage(percentage)})` : ''}`}
    >
      {/* Icon */}
      {showIcon && (
        <PnLIcon type={iconType} size={size} />
      )}

      {/* Amount with animation */}
      <AnimatePresence mode="wait">
        <motion.span
          key={amount}
          initial={{ opacity: 0, y: animationDirection === 'up' ? -4 : animationDirection === 'down' ? 4 : 0 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: animationDirection === 'up' ? 4 : animationDirection === 'down' ? -4 : 0 }}
          transition={{ duration: 0.2 }}
          className="font-mono"
        >
          {amount > 0 ? '+' : ''}{formatCurrency(amount)}
        </motion.span>
      </AnimatePresence>

      {/* Percentage */}
      {showPercentage && percentage !== null && percentage !== undefined && (
        <motion.span
          key={`pct-${percentage}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-opacity-70"
        >
          ({formatPercentage(percentage)})
        </motion.span>
      )}

      {/* Custom children */}
      {children}
    </span>
  )
})

PnLBadge.displayName = 'PnLBadge'

// ============================================================================
// COMPACT VARIANT (icon only)
// ============================================================================

export interface PnLBadgeCompactProps {
  amount: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showBackground?: boolean
}

export const PnLBadgeCompact = React.memo(function PnLBadgeCompact({
  amount,
  size = 'sm',
  className,
  showBackground = true
}: PnLBadgeCompactProps) {
  const trend = amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral'
  const iconType = amount > 0 ? 'up' : amount < 0 ? 'down' : 'neutral'

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        showBackground && 'rounded-full',
        trend === 'positive' && 'bg-success/10 text-success',
        trend === 'negative' && 'bg-danger/10 text-danger',
        trend === 'neutral' && 'bg-muted text-muted-foreground',
        size === 'sm' && 'w-6 h-6',
        size === 'md' && 'w-8 h-8',
        size === 'lg' && 'w-10 h-10',
        className
      )}
      role="status"
      aria-label={`${amount > 0 ? 'Profit' : amount < 0 ? 'Loss' : 'Break even'}: ${formatCurrency(amount)}`}
    >
      <PnLIcon type={iconType} size={size} />
    </span>
  )
})

PnLBadgeCompact.displayName = 'PnLBadgeCompact'

// ============================================================================
// TREND INDICATOR (text with icon)
// ============================================================================

export interface PnLTrendProps {
  amount: number
  percentage?: number | null
  showAmount?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const PnLTrend = React.memo(function PnLTrend({
  amount,
  percentage,
  showAmount = false,
  size = 'md',
  className
}: PnLTrendProps) {
  const trend = amount > 0 ? 'up' : amount < 0 ? 'down' : 'neutral'
  const trendColor = amount > 0 ? 'text-success' : amount < 0 ? 'text-danger' : 'text-muted-foreground'

  return (
    <div className={cn('inline-flex items-center gap-1', trendColor, className)}>
      <PnLIcon type={trend} size={size} />
      {showAmount && (
        <span className="font-semibold font-mono">
          {amount > 0 ? '+' : ''}{formatCurrency(amount)}
        </span>
      )}
      {percentage !== null && percentage !== undefined && (
        <span className="font-medium">
          {percentage > 0 ? '+' : ''}{percentage.toFixed(2)}%
        </span>
      )}
    </div>
  )
})

PnLTrend.displayName = 'PnLTrend'

// ============================================================================
// PULSE ANIMATION WRAPPER
// ============================================================================

export interface PnLBadgeWithPulseProps extends PnLBadgeProps {
  /** Show pulse animation */
  pulse?: boolean
  /** Pulse color */
  pulseColor?: string
}

export const PnLBadgeWithPulse = React.memo(function PnLBadgeWithPulse({
  pulse = true,
  pulseColor,
  ...props
}: PnLBadgeWithPulseProps) {
  const amount = props.amount
  const trend = amount > 0 ? 'positive' : amount < 0 ? 'negative' : 'neutral'
  const defaultPulseColor =
    trend === 'positive' ? 'rgba(34, 197, 94, 0.5)' :
    trend === 'negative' ? 'rgba(239, 68, 68, 0.5)' :
    'rgba(115, 115, 115, 0.5)'

  return (
    <div className="relative inline-flex">
      {/* Pulse ring */}
      {pulse && (
        <motion.span
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut'
          }}
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: pulseColor || defaultPulseColor }}
        />
      )}

      {/* Badge */}
      <PnLBadge {...props} />
    </div>
  )
})

PnLBadgeWithPulse.displayName = 'PnLBadgeWithPulse'
