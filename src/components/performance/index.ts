/**
 * Performance Components Barrel Export
 *
 * T17: Performance optimization components for Palpiteiros v2.
 *
 * @example
 * ```tsx
 * import { CoreWebVitals, PerformanceEntryDisplay } from '@/components/performance'
 * ```
 */

// Core Web Vitals tracking
export {
  CoreWebVitals,
  useCoreWebVitals,
  PerformanceEntryDisplay
} from './core-web-vitals'

export type {
  CoreWebVitalMetric,
  CoreWebVitalsReport,
  CoreWebVitalsProps,
  PerformanceEntryDisplayProps
} from './core-web-vitals'
