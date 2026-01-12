/**
 * Core Web Vitals Tracker
 *
 * T17.6: Performance monitoring component for Core Web Vitals.
 * Tracks and reports LCP, FID, CLS, TTFB, FCP in production.
 *
 * @features
 * - Real-time CWV measurement
 * - Console logging in development
 * - Analytics integration support
 * - Performance budget validation
 * - Per-route tracking
 *
 * @example
 * ```tsx
 * // In root layout
 * import { CoreWebVitals } from '@/components/performance/core-web-vitals'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <CoreWebVitals />
 *         {children}
 *       </body>
 *     </html>
 *   )
 * }
 * ```
 */

'use client'

import * as React from 'react'
import { usePathname } from 'next/navigation'

// ============================================================================
// TYPES
// ============================================================================

export interface CoreWebVitalMetric {
  id: string
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB'
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  entries: PerformanceEntry[]
}

export interface CoreWebVitalsReport {
  cls?: CoreWebVitalMetric
  fid?: CoreWebVitalMetric
  fcp?: CoreWebVitalMetric
  lcp?: CoreWebVitalMetric
  ttfb?: CoreWebVitalMetric
  route?: string
}

/**
 * Cleanup function type for observer cleanup
 */
type CleanupFn = () => void

// ============================================================================
// RATINGS THRESHOLDS
// ============================================================================>

const VITAL_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FID: { good: 100, poor: 300 },
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 }
}

function getRating(
  name: keyof typeof VITAL_THRESHOLDS,
  value: number
): CoreWebVitalMetric['rating'] {
  const thresholds = VITAL_THRESHOLDS[name]
  if (value <= thresholds.good) return 'good'
  if (value <= thresholds.poor) return 'needs-improvement'
  return 'poor'
}

// ============================================================================
// METRIC REPORTING
// ============================================================================>

/**
 * Log metric to console in development
 */
function logMetric(metric: CoreWebVitalMetric) {
  if (process.env.NODE_ENV !== 'development') return

  const emoji = {
    good: '✅',
    'needs-improvement': '⚠️',
    poor: '❌'
  }[metric.rating]

  const value = metric.name === 'CLS'
    ? metric.value.toFixed(4)
    : `${Math.round(metric.value)}ms`

  console.log(
    `[Core Web Vitals] ${emoji} ${metric.name}: ${value} (${metric.rating})`
  )
}

/**
 * Send metric to analytics
 * Override this function to send to your analytics provider
 */
function reportToAnalytics(metric: CoreWebVitalMetric, route?: string) {
  // TODO: Integrate with your analytics provider
  // Example for Google Analytics 4:
  // if (typeof gtag === 'function') {
  //   gtag('event', metric.name, {
  //     value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
  //     metric_id: metric.id,
  //     metric_value: metric.value,
  //     metric_delta: metric.delta,
  //     metric_rating: metric.rating,
  //     custom_map: { metric_rating: 'metric_rating' }
  //   })
  // }

  // Log to console in development
  logMetric(metric)
}

// ============================================================================
// VITAL OBSERVERS
// ============================================================================>

/**
 * Observe Cumulative Layout Shift (CLS)
 */
function observeCLS(onReport: (metric: CoreWebVitalMetric) => void) {
  let clsValue = 0
  let sessionValue = 0
  let sessionEntries: PerformanceEntry[] = []

  const handleEntries = (entries: PerformanceObserverEntryList) => {
    for (const entry of entries.getEntries()) {
      if (!(entry as any).hadRecentInput) {
        sessionValue += (entry as any).value
        sessionEntries = sessionEntries.concat(entry)

        if (sessionValue > clsValue) {
          clsValue = sessionValue
          const metric: CoreWebVitalMetric = {
            id: `v1-${Date.now()}`,
            name: 'CLS',
            value: clsValue,
            delta: sessionValue,
            rating: getRating('CLS', clsValue),
            entries: sessionEntries
          }
          onReport(metric)
        }
      }
    }
  }

  const po = (PerformanceObserver as any).supportedEntryTypes?.includes('layout-shift')
    ? new PerformanceObserver(handleEntries)
    : null

  if (po) {
    po.observe({ type: 'layout-shift', buffered: true })
  }

  return () => po?.disconnect()
}

/**
 * Observe First Input Delay (FID)
 */
function observeFID(onReport: (metric: CoreWebVitalMetric) => void) {
  const handleEntries = (entries: PerformanceObserverEntryList) => {
    for (const entry of entries.getEntries()) {
      const metric: CoreWebVitalMetric = {
        id: `v1-${entry.startTime}-${entry.duration}`,
        name: 'FID',
        value: (entry as any).processingStart - entry.startTime,
        delta: entry.duration,
        rating: getRating('FID', (entry as any).processingStart - entry.startTime),
        entries: [entry]
      }
      onReport(metric)
    }
  }

  const po = (PerformanceObserver as any).supportedEntryTypes?.includes('first-input')
    ? new PerformanceObserver(handleEntries)
    : null

  if (po) {
    po.observe({ type: 'first-input', buffered: true })
  }

  return () => po?.disconnect()
}

/**
 * Observe First Contentful Paint (FCP)
 */
function observeFCP(onReport: (metric: CoreWebVitalMetric) => void) {
  const handleEntries = (entries: PerformanceObserverEntryList) => {
    for (const entry of entries.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        const metric: CoreWebVitalMetric = {
          id: `v1-${entry.startTime}`,
          name: 'FCP',
          value: entry.startTime,
          delta: entry.startTime,
          rating: getRating('FCP', entry.startTime),
          entries: [entry]
        }
        onReport(metric)
      }
    }
  }

  const po = PerformanceObserver ? new PerformanceObserver(handleEntries) : null

  if (po) {
    po.observe({ type: 'paint', buffered: true })
  }

  return () => po?.disconnect()
}

/**
 * Observe Largest Contentful Paint (LCP)
 */
function observeLCP(onReport: (metric: CoreWebVitalMetric) => void) {
  const handleEntries = (entries: PerformanceObserverEntryList) => {
    const lastEntry = entries.getEntries()[entries.getEntries().length - 1] as any

    const metric: CoreWebVitalMetric = {
      id: `v1-${lastEntry.startTime}`,
      name: 'LCP',
      value: lastEntry.startTime,
      delta: lastEntry.startTime - (lastEntry.loadTime || 0),
      rating: getRating('LCP', lastEntry.startTime),
      entries: [lastEntry]
    }

    onReport(metric)
  }

  const po = (PerformanceObserver as any).supportedEntryTypes?.includes('largest-contentful-paint')
    ? new PerformanceObserver(handleEntries)
    : null

  if (po) {
    po.observe({ type: 'largest-contentful-paint', buffered: true })
  }

  return () => po?.disconnect()
}

/**
 * Observe Time to First Byte (TTFB)
 */
function observeTTFB(onReport: (metric: CoreWebVitalMetric) => void) {
  const handleEntries = (entries: PerformanceObserverEntryList) => {
    for (const entry of entries.getEntries()) {
      const metric: CoreWebVitalMetric = {
        id: `v1-${entry.startTime}`,
        name: 'TTFB',
        value: (entry as any).responseStart - (entry as any).requestStart,
        delta: (entry as any).responseStart - entry.startTime,
        rating: getRating(
          'TTFB',
          (entry as any).responseStart - (entry as any).requestStart
        ),
        entries: [entry]
      }
      onReport(metric)
    }
  }

  const po = PerformanceObserver ? new PerformanceObserver(handleEntries) : null

  if (po) {
    po.observe({ type: 'navigation', buffered: true })
  }

  return () => po?.disconnect()
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface CoreWebVitalsProps {
  /**
   * Custom analytics handler
   */
  onAnalytics?: (metric: CoreWebVitalMetric, route?: string) => void
  /**
   * Enable console logging in production
   */
  enableConsoleLogging?: boolean
}

/**
 * Core Web Vitals Tracker Component
 *
 * Tracks and reports Core Web Vitals metrics.
 *
 * Place this component in your root layout to track all page loads.
 *
 * @example
 * ```tsx
 * <CoreWebVitals
 *   onAnalytics={(metric, route) => {
 *     // Send to your analytics provider
 *     analytics.track('core_web_vital', {
 *       name: metric.name,
 *       value: metric.value,
 *       rating: metric.rating,
 *       route
 *     })
 *   }}
 * />
 * ```
 */
export function CoreWebVitals({
  onAnalytics,
  enableConsoleLogging = false
}: CoreWebVitalsProps) {
  const pathname = usePathname()
  const cleanupFns = React.useRef<CleanupFn[]>([])

  React.useEffect(() => {
    // Don't track in development unless enabled
    if (process.env.NODE_ENV === 'development' && !enableConsoleLogging) {
      return
    }

    const reportMetric = (metric: CoreWebVitalMetric) => {
      onAnalytics ? onAnalytics(metric, pathname) : reportToAnalytics(metric, pathname)
    }

    // Set up observers
    cleanupFns.current = [
      observeCLS(reportMetric),
      observeFID(reportMetric),
      observeFCP(reportMetric),
      observeLCP(reportMetric),
      observeTTFB(reportMetric)
    ].filter(Boolean) as CleanupFn[]

    // Cleanup on unmount
    return () => {
      cleanupFns.current.forEach((cleanup) => cleanup())
    }
  }, [pathname, onAnalytics, enableConsoleLogging])

  return null
}

CoreWebVitals.displayName = 'CoreWebVitals'

// ============================================================================
// HOOK FOR MANUAL REPORTING
// ============================================================================>

/**
 * Hook to manually report a Core Web Vital
 *
 * @example
 * ```tsx
 * const { reportMetric } = useCoreWebVitals()
 *
 * // Report a custom metric
 * reportMetric({
 *   id: 'custom-metric',
 *   name: 'CLS',
 *   value: 0.05,
 *   delta: 0.05,
 *   rating: 'good',
 *   entries: []
 * })
 * ```
 */
export function useCoreWebVitals() {
  const pathname = usePathname()

  const reportMetric = React.useCallback(
    (metric: CoreWebVitalMetric) => {
      reportToAnalytics(metric, pathname)
    },
    [pathname]
  )

  return { reportMetric }
}

// ============================================================================
// PERFORMANCE ENTRY COMPONENT
// ============================================================================>

export interface PerformanceEntryDisplayProps {
  metrics: CoreWebVitalsReport
  className?: string
}

/**
 * Display Core Web Vitals in development
 */
export function PerformanceEntryDisplay({
  metrics,
  className
}: PerformanceEntryDisplayProps) {
  if (process.env.NODE_ENV !== 'development') return null

  const allMetrics = Object.values(metrics).filter(Boolean) as CoreWebVitalMetric[]

  if (allMetrics.length === 0) return null

  return (
    <div className={className}>
      <div className="fixed bottom-4 right-4 bg-background/95 border rounded-lg shadow-lg p-4 text-xs space-y-2 max-w-xs z-50">
        <h3 className="font-semibold mb-2">Core Web Vitals</h3>
        {allMetrics.map((metric) => {
          const emoji = {
            good: '✅',
            'needs-improvement': '⚠️',
            poor: '❌'
          }[metric.rating]

          const value = metric.name === 'CLS'
            ? metric.value.toFixed(4)
            : `${Math.round(metric.value)}ms`

          return (
            <div key={metric.id} className="flex items-center justify-between gap-4">
              <span className="font-medium">{metric.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{value}</span>
                <span>{emoji}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CoreWebVitals
