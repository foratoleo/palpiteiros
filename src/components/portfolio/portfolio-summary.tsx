/**
 * Portfolio Summary Component
 *
 * Displays key portfolio metrics in a grid of summary cards.
 * Features glassmorphism design, animated counters, and responsive layout.
 *
 * @features
 * - Total Value card with currency formatting and trend indicator
 * - Total PnL card with green/red color coding and percentage
 * - Win Rate card with circular progress indicator
 * - Open Positions card with count badge
 * - 2x2 grid on desktop, stacked on mobile
 * - Glassmorphism cards with hover effects
 * - Loading skeleton state
 * - Integration with portfolio.store
 *
 * @example
 * ```tsx
 * <PortfolioSummary />
 * ```
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Wallet, Trophy, Briefcase } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { usePortfolioStore } from '@/stores/portfolio.store'
import type { PortfolioSummary as PortfolioSummaryType } from '@/types/portfolio.types'

// ============================================================================
// TYPES
// ============================================================================

export interface PortfolioSummaryProps {
  /** Custom CSS class names */
  className?: string
  /** Override summary data */
  summary?: PortfolioSummaryType
  /** Show trend indicators */
  showTrend?: boolean
  /** Compact variant for smaller spaces */
  variant?: 'default' | 'compact'
}

// ============================================================================
// FORMATTERS
// ============================================================================

/**
 * Format currency with proper decimals and separators
 */
function formatCurrency(value: number): string {
  const absValue = Math.abs(value)

  if (absValue >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`
  }
  if (absValue >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

/**
 * Format percentage with sign
 */
function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : ''
  return `${sign}${value.toFixed(2)}%`
}

// ============================================================================
// CIRCULAR PROGRESS COMPONENT
// ============================================================================

interface CircularProgressProps {
  value: number
  size?: number
  strokeWidth?: number
  className?: string
}

const CircularProgress = React.memo(function CircularProgress({
  value,
  size = 80,
  strokeWidth = 6,
  className
}: CircularProgressProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalizedValue / 100) * circumference

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          strokeLinecap="round"
        />
      </svg>
      {/* Center value */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-semibold">{Math.round(normalizedValue)}%</span>
      </div>
    </div>
  )
})

// ============================================================================
// SUMMARY CARD COMPONENT
// ============================================================================

interface SummaryCardProps {
  title: string
  value: string | number | React.ReactNode
  subtitle?: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  variant?: 'default' | 'success' | 'danger' | 'warning'
  className?: string
  children?: React.ReactNode
}

const SummaryCard = React.memo(function SummaryCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  variant = 'default',
  className,
  children
}: SummaryCardProps) {
  const variantStyles = {
    default: 'border-border/50',
    success: 'border-success/30 bg-success/5',
    danger: 'border-danger/30 bg-danger/5',
    warning: 'border-warning/30 bg-warning/5'
  }

  const iconStyles = {
    default: 'text-primary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning'
  }

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        variant="glass"
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          'hover:shadow-lg',
          variantStyles[variant],
          className
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            {/* Left side - Value */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-muted-foreground mb-1">{title}</p>
              {React.isValidElement(value) ? (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'text-xl font-bold tracking-tight',
                    variant === 'success' && 'text-success',
                    variant === 'danger' && 'text-danger'
                  )}
                >
                  {value}
                </motion.div>
              ) : (
                <motion.p
                  key={typeof value === 'string' ? value : String(value)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'text-xl font-bold tracking-tight truncate',
                    variant === 'success' && 'text-success',
                    variant === 'danger' && 'text-danger'
                  )}
                >
                  {value}
                </motion.p>
              )}
              {subtitle && (
                <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
              )}
            </div>

            {/* Right side - Icon */}
            <div className={cn('shrink-0 ml-3', iconStyles[variant])}>
              {icon}
            </div>
          </div>

          {/* Trend indicator */}
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-3">
              {trend === 'up' && <TrendingUp className="w-3 h-3 text-success" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3 text-danger" />}
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-success',
                  trend === 'down' && 'text-danger',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trendValue}
              </span>
            </div>
          )}

          {/* Custom children */}
          {children}
        </CardContent>
      </Card>
    </motion.div>
  )
})

// ============================================================================
// LOADING SKELETON
// ============================================================================

interface SummarySkeletonProps {
  variant?: 'default' | 'compact'
}

function SummarySkeleton({ variant = 'default' }: SummarySkeletonProps) {
  const cards = [1, 2, 3, 4]

  return (
    <div className={cn(
      'grid gap-3',
      variant === 'compact' ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4'
    )}>
      {cards.map((i) => (
        <Card key={i} variant="glass" className="overflow-hidden">
          <CardContent className="p-4">
            <Skeleton className="h-4 w-20 mb-2" />
            <Skeleton className="h-7 w-24 mb-1" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

interface AnimatedCounterProps {
  value: number
  duration?: number
  formatFn?: (value: number) => string
}

function AnimatedCounter({ value, duration = 0.6, formatFn }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = React.useState(value)
  const prevValueRef = React.useRef(value)

  React.useEffect(() => {
    const prevValue = prevValueRef.current
    const direction = value > prevValue ? 1 : -1
    const difference = Math.abs(value - prevValue)

    if (difference === 0) return

    let startTime: number | null = null
    const startValue = prevValue

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = startValue + (value - startValue) * easeOutQuart

      setDisplayValue(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        prevValueRef.current = value
      }
    }

    requestAnimationFrame(animate)
  }, [value, duration])

  return <>{formatFn ? formatFn(displayValue) : displayValue}</>
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PortfolioSummary = React.memo(function PortfolioSummary({
  className,
  summary: summaryProp,
  showTrend = true,
  variant = 'default'
}: PortfolioSummaryProps) {
  const storeSummary = usePortfolioStore((state) => state.summary)
  const loading = usePortfolioStore((state) => state.loading)

  const summary = summaryProp || storeSummary

  // Loading state
  if (loading || !summary) {
    return <SummarySkeleton variant={variant} />
  }

  // Calculate trend (mock data - in real app, compare with previous period)
  const valueTrend = summary.totalPnl >= 0 ? 'up' : 'down'
  const pnlTrend = summary.totalPnl >= 0 ? 'up' : summary.totalPnl < 0 ? 'down' : 'neutral'

  const isCompact = variant === 'compact'

  return (
    <div
      className={cn(
        'grid gap-3',
        isCompact ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 lg:grid-cols-4',
        className
      )}
    >
      {/* Total Value Card */}
      <SummaryCard
        title="Total Value"
        value={<AnimatedCounter value={summary.totalValue} formatFn={formatCurrency} />}
        subtitle={summary.activePositions > 0 ? `${summary.activePositions} positions` : 'No positions'}
        icon={<Wallet className="w-5 h-5" />}
        trend={showTrend ? valueTrend : undefined}
        trendValue={showTrend ? formatCurrency(summary.totalPnl) : undefined}
      />

      {/* Total PnL Card */}
      <SummaryCard
        title="Total PnL"
        value={<AnimatedCounter value={summary.totalPnl} formatFn={formatCurrency} />}
        subtitle={summary.totalInvested > 0 ? `Invested: ${formatCurrency(summary.totalInvested)}` : undefined}
        icon={summary.totalPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
        variant={summary.totalPnl > 0 ? 'success' : summary.totalPnl < 0 ? 'danger' : 'default'}
        trend={showTrend ? pnlTrend : undefined}
        trendValue={showTrend ? formatPercentage(summary.totalPnlPercentage) : undefined}
      />

      {/* Win Rate Card */}
      <SummaryCard
        title="Win Rate"
        value={
          summary.winRate !== undefined ? (
            <AnimatedCounter value={summary.winRate} formatFn={(v) => `${v.toFixed(1)}%`} />
          ) : 'N/A'
        }
        subtitle={summary.closedPositions > 0 ? `${summary.closedPositions} closed` : 'No closed positions'}
        icon={<Trophy className="w-5 h-5" />}
        variant={summary.winRate && summary.winRate >= 50 ? 'success' : summary.winRate && summary.winRate < 50 ? 'warning' : 'default'}
      >
        {summary.winRate !== undefined && !isCompact && (
          <div className="flex justify-center mt-3">
            <CircularProgress value={summary.winRate} size={60} strokeWidth={4} />
          </div>
        )}
      </SummaryCard>

      {/* Open Positions Card */}
      <SummaryCard
        title="Open Positions"
        value={summary.activePositions}
        subtitle={summary.closedPositions > 0 ? `${summary.closedPositions} closed` : undefined}
        icon={<Briefcase className="w-5 h-5" />}
      />
    </div>
  )
})

PortfolioSummary.displayName = 'PortfolioSummary'
