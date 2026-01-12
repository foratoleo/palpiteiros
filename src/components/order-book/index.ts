/**
 * Order Book Components
 *
 * Barrel export for all order book components and hooks.
 *
 * @example
 * ```tsx
 * import {
 *   OrderBookVisual,
 *   OrderBookCompact,
 *   OrderBookSummary,
 *   DepthChart,
 *   OrderBookRow,
 *   useOrderBookData,
 *   useOrderBookSubscription
 * } from '@/components/order-book'
 * ```
 */

// Main components
export { OrderBookVisual, OrderBookCompact, OrderBookSkeleton, OrderBookEmptyState } from './order-book-visual'
export type { OrderBookVisualProps, OrderBookCompactProps } from './order-book-visual'

// Row component
export {
  OrderBookRow,
  OrderBookRowSkeleton,
  OrderBookHeader
} from './order-book-row'
export type { OrderBookRowProps, OrderBookRowSkeletonProps, OrderBookHeaderProps } from './order-book-row'

// Summary component
export {
  OrderBookSummary,
  OrderBookSummarySkeleton,
  SpreadIndicator
} from './order-book-summary'
export type {
  OrderBookSummaryProps,
  OrderBookSummarySkeletonProps,
  SpreadIndicatorProps
} from './order-book-summary'

// Depth chart
export {
  DepthChart,
  MiniDepthChart,
  DepthChartSkeleton
} from './depth-chart'
export type {
  DepthChartProps,
  MiniDepthChartProps,
  DepthChartSkeletonProps
} from './depth-chart'

// Hooks
export {
  useOrderBookData,
  useOrderBookSubscription
} from './use-order-book-data'
export type {
  OrderBookLevel,
  OrderBookData,
  OrderBookTrade,
  UseOrderBookDataParams,
  UseOrderBookDataReturn
} from './use-order-book-data'
