/**
 * Market Card Skeleton Component
 *
 * Loading skeleton that matches the market-card layout.
 * Provides a smooth shimmer effect while content is loading.
 *
 * @features
 * - Animated shimmer effect
 * - Matches market-card layout
 * - Maintains aspect ratio
 * - Pulse animation
 * - Multiple variant support
 */

'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Market Card Skeleton Props
 */
export interface MarketCardSkeletonProps {
  /** Skeleton variant to match different card sizes */
  variant?: 'default' | 'compact' | 'detailed'
  /** Additional CSS class names */
  className?: string
}

/**
 * Market Card Skeleton Component
 *
 * Displays a placeholder skeleton while market data loads.
 * Uses pulse animation for smooth loading experience.
 *
 * @example
 * ```tsx
 * {isLoading ? (
 *   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 *     <MarketCardSkeleton />
 *     <MarketCardSkeleton />
 *     <MarketCardSkeleton />
 *   </div>
 * ) : (
 *   <MarketGrid markets={markets} />
 * )}
 * ```
 */
export function MarketCardSkeleton({
  variant = 'default',
  className
}: MarketCardSkeletonProps) {
  // Compact variant (smaller)
  if (variant === 'compact') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-3 w-16 rounded" />
                <Skeleton className="h-3 w-16 rounded" />
              </div>
            </div>
            <Skeleton className="h-10 w-16 rounded-lg shrink-0" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Detailed variant (larger with more content)
  if (variant === 'detailed') {
    return (
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-24 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-6 w-full rounded" />
              <Skeleton className="h-6 w-5/6 rounded" />
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-4/5 rounded" />
            </div>
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-24 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <Skeleton className="h-16 w-40 rounded-lg" />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex items-center gap-4 w-full">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" />
              <Skeleton className="h-4 w-24 rounded" />
            </div>
          </div>
        </CardFooter>
      </Card>
    )
  }

  // Default variant (balanced)
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-5 w-full rounded" />
            <Skeleton className="h-5 w-4/5 rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
          </div>
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-20 rounded" />
            <Skeleton className="h-4 w-16 rounded" />
          </div>
          <Skeleton className="h-12 w-32 rounded-lg" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex items-center gap-4 w-full text-sm">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 w-16 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded" />
            <Skeleton className="h-3.5 w-20 rounded" />
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

/**
 * Market Grid Skeleton Props
 */
export interface MarketGridSkeletonProps {
  /** Number of skeleton cards to show */
  count?: number
  /** Columns at each breakpoint */
  columns?: {
    mobile?: 1 | 2
    tablet?: 1 | 2 | 3
    desktop?: 1 | 2 | 3 | 4
  }
  /** Gap between cards */
  gap?: number
  /** Skeleton variant */
  variant?: MarketCardSkeletonProps['variant']
  /** Additional CSS class names */
  className?: string
}

/**
 * Market Grid Skeleton Component
 *
 * Displays a grid of skeleton cards for loading states.
 * Responsive columns with customizable count.
 *
 * @example
 * ```tsx
 * <MarketGridSkeleton count={6} variant="default" />
 * ```
 */
export function MarketGridSkeleton({
  count = 6,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
  variant = 'default',
  className
}: MarketGridSkeletonProps) {
  const gridClass = cn(
    'grid',
    `grid-cols-${columns.mobile}`,
    `md:grid-cols-${columns.tablet}`,
    `lg:grid-cols-${columns.desktop}`,
    `gap-${gap}`,
    className
  )

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <MarketCardSkeleton key={i} variant={variant} />
      ))}
    </div>
  )
}
