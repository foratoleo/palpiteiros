/**
 * Portfolio Components
 *
 * Export barrel for all portfolio-related components.
 * Provides a clean import interface for portfolio UI components.
 *
 * @example
 * ```tsx
 * import {
 *   PortfolioSummary,
 *   PositionsTable,
 *   PositionCard,
 *   AllocationChart,
 *   PerformanceChart,
 *   PnLBadge
 * } from '@/components/portfolio'
 * ```
 */

// Summary components
export { PortfolioSummary } from './portfolio-summary'
export type { PortfolioSummaryProps } from './portfolio-summary'

// Table components
export { PositionsTable } from './positions-table'
export type { PositionsTableProps } from './positions-table'

// Card components
export { PositionCard, PositionCardSkeleton } from './position-card'
export type { PositionCardProps } from './position-card'

// Chart components
export { AllocationChart } from './allocation-chart'
export type { AllocationChartProps, AllocationItem } from './allocation-chart'

export { PerformanceChart } from './performance-chart'
export type { PerformanceChartProps, TimeRange } from './performance-chart'

// Badge components
export {
  PnLBadge,
  PnLBadgeCompact,
  PnLTrend,
  PnLBadgeWithPulse
} from './pnl-badge'
export type {
  PnLBadgeProps,
  PnLBadgeCompactProps,
  PnLTrendProps,
  PnLBadgeWithPulseProps
} from './pnl-badge'
