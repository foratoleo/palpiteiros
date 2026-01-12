/**
 * Breaking Market Card Skeleton Component
 *
 * Loading skeleton for breaking market cards.
 * Displays a shimmering placeholder while data is loading.
 *
 * @features
 * - Shimmer animation
 * - Grid and list view variants
 * - Matches BreakingMarketCard layout
 * - Accessibility with loading labels
 *
 * @component BreakingMarketCardSkeleton
 */

'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * BreakingMarketCardSkeleton Props
 */
export interface BreakingMarketCardSkeletonProps {
  /** View mode for skeleton layout */
  viewMode?: 'grid' | 'list'
  /** Additional CSS class names */
  className?: string
}

/**
 * Shimmer animation component
 */
const Shimmer = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse bg-muted/50 rounded',
      'bg-gradient-to-r from-muted via-muted/50 to-muted',
      'bg-[length:200%_100%]',
      'animate-[shimmer_1.5s_infinite]',
      className
    )}
    style={{
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
    }}
  />
)

/**
 * BreakingMarketCardSkeleton Component
 *
 * Displays a loading placeholder for breaking market cards.
 *
 * @example
 * ```tsx
 * <BreakingMarketCardSkeleton viewMode="grid" />
 * <BreakingMarketCardSkeleton viewMode="list" />
 * ```
 */
export function BreakingMarketCardSkeleton({
  viewMode = 'grid',
  className,
}: BreakingMarketCardSkeletonProps) {
  if (viewMode === 'list') {
    return (
      <Card variant="glass" className={cn('opacity-70', className)}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Rank Badge Skeleton */}
            <Shimmer className="w-8 h-8 rounded-full shrink-0" />

            {/* Image Skeleton */}
            <Shimmer className="w-16 h-16 rounded-lg shrink-0" />

            {/* Content Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <Shimmer className="h-4 w-3/4 rounded" />
              <Shimmer className="h-3 w-1/2 rounded" />
              <div className="flex items-center gap-4">
                <Shimmer className="h-3 w-16 rounded" />
                <Shimmer className="h-3 w-20 rounded" />
                <Shimmer className="h-3 w-24 rounded" />
              </div>
            </div>

            {/* Trend Icon Skeleton */}
            <Shimmer className="w-10 h-10 rounded-full shrink-0" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view skeleton
  return (
    <Card variant="glass" className={cn('h-full opacity-70', className)}>
      <CardContent className="p-4">
        {/* Rank Badge Skeleton */}
        <div className="relative mb-4">
          <Shimmer className="w-8 h-8 rounded-full absolute -top-2 -left-2" />
        </div>

        {/* Image Skeleton */}
        <div className="flex items-start gap-3 mb-4">
          <Shimmer className="w-16 h-16 rounded-lg shrink-0" />

          {/* Text Skeletons */}
          <div className="flex-1 min-w-0 space-y-2">
            <Shimmer className="h-3 w-16 rounded" />
            <Shimmer className="h-4 w-full rounded" />
            <Shimmer className="h-4 w-3/4 rounded" />
          </div>
        </div>

        {/* Price Section Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Shimmer className="h-6 w-20 rounded" />
            <Shimmer className="h-8 w-16 rounded" />
          </div>

          {/* Sparkline Skeleton */}
          <Shimmer className="h-10 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  )
}
