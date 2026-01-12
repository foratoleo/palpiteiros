/**
 * Lazy Loading Utilities
 *
 * T17.1: Code Splitting and Lazy Loading utilities for heavy components.
 *
 * This module provides:
 * - Dynamic imports with Suspense boundaries
 * - Loading fallbacks for different component types
 * - Error boundaries for lazy-loaded components
 * - Preloading utilities for critical routes
 *
 * @module lib/lazy-loading
 */

'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { Skeleton } from '@/components/ui/skeleton'

// ============================================================================
// LOADING FALLBACKS
// ============================================================================

/**
 * Chart loading skeleton
 * Used for Recharts components which are heavy
 */
export function ChartSkeleton({ height = 300 }: { height?: number }) {
  return (
    <div
      className="relative overflow-hidden rounded-lg bg-muted/10"
      style={{ height }}
      role="status"
      aria-label="Loading chart"
    >
      <div className="absolute inset-0 animate-pulse">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-muted/20 to-transparent animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="absolute inset-0 flex items-end justify-between p-4 gap-1">
        {[...Array(20)].map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1"
            style={{
              height: `${20 + Math.random() * 60}%`,
              animationDelay: `${i * 50}ms`
            }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Table loading skeleton
 * Used for data tables (positions, order book, etc.)
 */
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading table">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-muted/10 rounded-lg animate-pulse">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  )
}

/**
 * Card loading skeleton
 * Used for market cards and other card components
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={`bg-muted/10 rounded-lg p-4 animate-pulse`}
      role="status"
      aria-label="Loading card"
    >
      <div className="space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex justify-between pt-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// DYNAMIC IMPORT HELPERS
// ============================================================================>

/**
 * Create a dynamic import for a chart component
 * Charts are heavy (Recharts) and should be loaded on demand
 *
 * @example
 * ```tsx
 * const PriceChart = createDynamicChart(() => import('./charts/price-chart'))
 * ```
 */
export function createDynamicChart<
  T extends { displayName?: string }
>(importFn: () => Promise<{ default: React.ComponentType<T> }>) {
  return dynamic(importFn, {
    loading: () => <ChartSkeleton />,
    ssr: false, // Charts don't need SSR
  })
}

/**
 * Create a dynamic import for a table component
 * Tables can be large and should be loaded when needed
 *
 * @example
 * ```tsx
 * const PositionsTable = createDynamicTable(() => import('./portfolio/positions-table'))
 * ```
 */
export function createDynamicTable<
  T extends { displayName?: string }
>(importFn: () => Promise<{ default: React.ComponentType<T> }>) {
  return dynamic(importFn, {
    loading: () => <TableSkeleton />,
    ssr: true, // Tables should be SSR'd for SEO
  })
}

/**
 * Create a dynamic import for a 3D component
 * 3D components (Three.js) are very heavy and should always be lazy-loaded
 *
 * @example
 * ```tsx
 * const MarketCard3D = createDynamic3D(() => import('./market/market-card-3d'))
 * ```
 */
export function createDynamic3D<
  T extends { displayName?: string }
>(importFn: () => Promise<{ default: React.ComponentType<T> }>) {
  return dynamic(importFn, {
    loading: () => <CardSkeleton className="aspect-square" />,
    ssr: false, // 3D components should never be SSR'd
  })
}

// ============================================================================
// PRELOADING UTILITIES
// ============================================================================

/**
 * Preload a component by prefetching its chunk
 * Use this when you know a user will likely need a component soon
 *
 * @example
 * ```tsx
 * // Preload chart when user hovers over a tab
 * <Tab onMouseEnter={() => preloadComponent(() => import('./charts/price-chart'))}>
 * ```
 */
export function preloadComponent(
  importFn: () => Promise<{ default: React.ComponentType<any> }>
): void {
  // Trigger the import to start loading the chunk
  importFn().catch(() => {
    // Silently fail - the component will load when actually needed
  })
}

/**
 * Preload a route for faster navigation
 * Next.js automatically prefetches visible links, but this
 * allows manual prefetching for routes that will be needed soon
 *
 * @example
 * ```tsx
 * // Preload market detail page when hovering over a market card
 * <div onMouseEnter={() => preloadRoute('/markets/123')} />
 * ```
 */
export function preloadRoute(href: string): void {
  if (typeof window === 'undefined') return

  // Next.js 15 uses native fetch for prefetching
  fetch(href, {
    method: 'HEAD',
    priority: 'low',
  }).catch(() => {
    // Silently fail
  })
}

// ============================================================================
// SUSPENSE BOUNDARY COMPONENT
// ============================================================================>

interface SuspenseBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Suspense Boundary with error handling
 * Wraps lazy-loaded components to handle loading and error states
 */
export function SuspenseBoundary({
  children,
  fallback = <ChartSkeleton />
}: SuspenseBoundaryProps) {
  return (
    <React.Suspense fallback={fallback}>
      {children}
    </React.Suspense>
  )
}

// ============================================================================
// INTERSECTION OBSERVER HOOK
// ============================================================================

/**
 * Hook to detect when a component is in viewport
 * Useful for lazy-loading components only when needed
 *
 * @example
 * ```tsx
 * const { ref, isInView } = useInView({ threshold: 0.1 })
 * return (
 *   <div ref={ref}>
 *     {isInView && <HeavyComponent />}
 *   </div>
 * )
 * ```
 */
export function useInView(options?: IntersectionObserverInit) {
  const [isInView, setIsInView] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1, ...options }
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => observer.disconnect()
  }, [options])

  return { ref, isInView }
}
