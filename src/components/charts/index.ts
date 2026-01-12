/**
 * Chart Components Barrel Export
 *
 * Centralized exports for all chart-related components and hooks.
 * Includes price charts, tooltips, controls, sparklines, and data processors.
 *
 * @components
 * - PriceChart: Main interactive price chart with time range selection
 * - PriceChartTooltip: Custom tooltip with glassmorphism design
 * - PriceChartControls: Timeframe selector and chart controls
 * - MiniSparkline: Compact sparkline for market cards
 * - TrendIndicator: Colored trend indicator with sparkline
 *
 * @hooks
 * - useChartData: Data processor for chart formatting
 * - useTimeLabels: Time label formatting
 * - useTrendColor: Trend-based color resolution
 * - useYAxisDomain: Y-axis domain calculation
 *
 * @utilities
 * - formatTooltipLabel: Format timestamps for tooltips
 * - formatPrice: Format price values
 * - formatVolume: Format volume values
 */

// Main components
export { PriceChart } from './price-chart'
export type {
  PriceChartProps,
  ChartTimeRange,
  ChartType
} from './price-chart'

// Tooltip components
export {
  PriceChartTooltip,
  CompactTooltip
} from './price-chart-tooltip'
export type { PriceChartTooltipProps, CompactTooltipProps } from './price-chart-tooltip'

// Control components
export {
  PriceChartControls,
  TimeframeSelector
} from './price-chart-controls'
export type { PriceChartControlsProps, TimeframeSelectorProps } from './price-chart-controls'

// Sparkline components
export {
  MiniSparkline,
  SparklineBatch,
  TrendIndicator
} from './mini-sparkline'
export type {
  MiniSparklineProps,
  SparklineBatchProps,
  TrendIndicatorProps
} from './mini-sparkline'

// Hooks
export {
  useChartData,
  useTimeLabels,
  useTrendColor,
  useYAxisDomain
} from './use-chart-data'

// Utility types from use-chart-data
export type {
  UseChartDataParams,
  UseChartDataReturn,
  ChartDataPoint,
  OHLCDataset,
  ChartStats
} from './use-chart-data'

// Utility functions
export {
  formatTooltipLabel,
  formatPrice,
  formatPriceWithSign,
  formatVolume
} from './use-chart-data'
