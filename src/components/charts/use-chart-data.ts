/**
 * Use Chart Data Hook
 *
 * Processes raw price data for use with Recharts components.
 * Handles sorting, filtering, aggregation, and format conversion.
 * Optimized with memoization for efficient re-renders.
 *
 * @feature Sort by timestamp ascending
 * @feature Filter outliers with optional moving average
 * @feature Aggregate by timeframe (sampling for large datasets)
 * @feature Calculate min/max for Y-axis scaling
 * @feature Calculate price changes for trend coloring
 * @feature Memoization for performance
 * @feature Support for multiple chart types (line, candlestick)
 */

'use client'

import { useMemo, useCallback } from 'react'
import { format, isValid, parseISO } from 'date-fns'
import type { PriceDataPoint } from '@/types/market.types'
import type { ChartTimeRange } from './price-chart'

// ============================================================================
// TYPES
// ============================================================================

export interface UseChartDataParams {
  /** Market ID for fetching */
  marketId: string
  /** Time range for data */
  timeRange?: ChartTimeRange
  /** Raw data override (skips fetching) */
  data?: Array<{ timestamp: string; priceYes: number; priceNo: number }>
  /** Loading state override */
  isLoading?: boolean
  /** Apply moving average smoothing */
  smoothData?: boolean
  /** Moving average window size */
  smoothWindow?: number
  /** Max data points (sampling) */
  maxPoints?: number
  /** Include OHLC data for candlestick */
  includeOHLC?: boolean
}

export interface UseChartDataReturn {
  /** Processed chart data for Recharts */
  data: ChartDataPoint[] | null
  /** OHLC data for candlestick charts */
  ohlcData: OHLCDataset[] | null
  /** Price trend direction */
  trend: 'up' | 'down' | 'neutral'
  /** Price change percentage */
  priceChange: number | null
  /** Min price for Y-axis */
  minPrice: number
  /** Max price for Y-axis */
  maxPrice: number
  /** Loading state */
  isLoading: boolean
  /** Empty state */
  isEmpty: boolean
  /** Refetch function */
  refetch: () => void
}

export interface ChartDataPoint {
  timestamp: string
  formattedTime: string
  priceYes: number
  priceNo: number
  pricePercent: number
  volume?: number
}

export interface OHLCDataset {
  timestamp: string
  formattedTime: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface ChartStats {
  min: number
  max: number
  avg: number
  start: number
  end: number
  change: number
  changePercent: number
}

// ============================================================================
// TIME RANGE UTILITIES
// ============================================================================

/**
 * Get timestamp range for a time range
 */
function getTimeRangeBounds(timeRange: ChartTimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (timeRange) {
    case '1H':
      start.setHours(start.getHours() - 1)
      break
    case '24H':
      start.setHours(start.getHours() - 24)
      break
    case '7D':
      start.setDate(start.getDate() - 7)
      break
    case '30D':
      start.setDate(start.getDate() - 30)
      break
    case 'ALL':
      start.setFullYear(start.getFullYear() - 10)
      break
  }

  return { start, end }
}

/**
 * Calculate optimal interval for data sampling
 */
function getSamplingInterval(timeRange: ChartTimeRange): number {
  switch (timeRange) {
    case '1H':
      return 1 * 60 * 1000 // 1 minute
    case '24H':
      return 5 * 60 * 1000 // 5 minutes
    case '7D':
      return 30 * 60 * 1000 // 30 minutes
    case '30D':
      return 2 * 60 * 60 * 1000 // 2 hours
    case 'ALL':
      return 24 * 60 * 60 * 1000 // 1 day
    default:
      return 30 * 60 * 1000
  }
}

/**
 * Get time format label based on range
 */
function getTimeFormat(timeRange: ChartTimeRange): string {
  switch (timeRange) {
    case '1H':
    case '24H':
      return 'HH:mm'
    case '7D':
      return 'MMM d HH:mm'
    case '30D':
    case 'ALL':
      return 'MMM d'
    default:
      return 'HH:mm'
  }
}

// ============================================================================
// DATA PROCESSING UTILITIES
// ============================================================================

/**
 * Sort data by timestamp ascending
 */
function sortByTimestamp<T extends { timestamp: string }>(data: T[]): T[] {
  return [...data].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime()
    const bTime = new Date(b.timestamp).getTime()
    return aTime - bTime
  })
}

/**
 * Apply moving average smoothing
 */
function applyMovingAverage(
  data: PriceDataPoint[],
  window: number
): PriceDataPoint[] {
  if (window < 2 || data.length < window) return data

  const result: PriceDataPoint[] = []

  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - Math.floor(window / 2))
    const end = Math.min(data.length, i + Math.floor(window / 2) + 1)
    const slice = data.slice(start, end)

    const avgPriceYes = slice.reduce((sum, d) => sum + d.priceYes, 0) / slice.length
    const avgPriceNo = slice.reduce((sum, d) => sum + d.priceNo, 0) / slice.length

    result.push({
      ...data[i],
      priceYes: avgPriceYes,
      priceNo: avgPriceNo
    })
  }

  return result
}

/**
 * Sample data to reduce points
 */
function sampleData(
  data: PriceDataPoint[],
  interval: number,
  maxPoints?: number
): PriceDataPoint[] {
  if (data.length === 0) return []

  // Determine effective max points
  const effectiveMax = maxPoints || data.length
  if (data.length <= effectiveMax) return data

  // Calculate sampling step
  const step = Math.ceil(data.length / effectiveMax)

  return data.filter((_, i) => i % step === 0)
}

/**
 * Aggregate data into OHLC format
 */
function aggregateToOHLC(
  data: PriceDataPoint[],
  intervalMinutes: number
): OHLCDataset[] {
  const intervalMs = intervalMinutes * 60 * 1000
  const buckets = new Map<string, PriceDataPoint[]>()

  // Group into time buckets
  for (const point of data) {
    const timestamp = new Date(point.timestamp).getTime()
    const bucketTime = Math.floor(timestamp / intervalMs) * intervalMs
    const bucketKey = new Date(bucketTime).toISOString()

    if (!buckets.has(bucketKey)) {
      buckets.set(bucketKey, [])
    }
    buckets.get(bucketKey)!.push(point)
  }

  // Calculate OHLC for each bucket
  return Array.from(buckets.entries())
    .map(([bucketTime, points]) => {
      const prices = points.map((p) => p.priceYes)
      const open = prices[0]
      const close = prices[prices.length - 1]
      const high = Math.max(...prices)
      const low = Math.min(...prices)
      const volume = points.reduce((sum, p) => sum + (p.volume || 0), 0)

      const date = parseISO(bucketTime)

      return {
        timestamp: bucketTime,
        formattedTime: isValid(date) ? format(date, getTimeFormat('24H')) : bucketTime,
        open,
        high,
        low,
        close,
        volume
      }
    })
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}

/**
 * Filter by time range
 */
function filterByTimeRange(
  data: PriceDataPoint[],
  timeRange: ChartTimeRange
): PriceDataPoint[] {
  const { start, end } = getTimeRangeBounds(timeRange)

  return data.filter((point) => {
    const timestamp = new Date(point.timestamp).getTime()
    return timestamp >= start.getTime() && timestamp <= end.getTime()
  })
}

/**
 * Calculate statistics from data
 */
function calculateStats(data: PriceDataPoint[]): ChartStats {
  if (data.length === 0) {
    return { min: 0, max: 100, avg: 50, start: 50, end: 50, change: 0, changePercent: 0 }
  }

  const prices = data.map((d) => d.priceYes * 100)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const avg = prices.reduce((sum, p) => sum + p, 0) / prices.length
  const start = prices[0]
  const end = prices[prices.length - 1]
  const change = end - start
  const changePercent = start !== 0 ? (change / start) * 100 : 0

  return { min, max, avg, start, end, change, changePercent }
}

/**
 * Determine trend from stats
 */
function getTrend(stats: ChartStats): 'up' | 'down' | 'neutral' {
  const threshold = 1 // 1% threshold

  if (stats.changePercent > threshold) return 'up'
  if (stats.changePercent < -threshold) return 'down'
  return 'neutral'
}

// ============================================================================
// FORMATTER FUNCTIONS
// ============================================================================

/**
 * Format tooltip label (timestamp)
 */
export function formatTooltipLabel(timestamp: string, timeRange?: ChartTimeRange): string {
  const date = parseISO(timestamp)
  if (!isValid(date)) return timestamp

  const formatStr = timeRange ? getTimeFormat(timeRange) : 'MMM d, HH:mm'
  return format(date, formatStr)
}

/**
 * Format price value
 */
export function formatPrice(
  price: number,
  format: 'percent' | 'decimal' = 'percent'
): string {
  if (format === 'decimal') {
    return price.toFixed(4)
  }
  return `${price.toFixed(1)}%`
}

/**
 * Format price with sign (+/-)
 */
export function formatPriceWithSign(price: number): string {
  return `${price > 0 ? '+' : ''}${formatPrice(price)}`
}

/**
 * Format currency for volume display
 */
export function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `$${(volume / 1000000).toFixed(1)}M`
  }
  if (volume >= 1000) {
    return `$${(volume / 1000).toFixed(1)}K`
  }
  return `$${volume.toFixed(0)}`
}

// ============================================================================
// MAIN HOOK
// ============================================================================

export function useChartData({
  marketId,
  timeRange = '7D',
  data: dataProp,
  isLoading: isLoadingProp,
  smoothData = false,
  smoothWindow = 3,
  maxPoints,
  includeOHLC = false
}: UseChartDataParams): UseChartDataReturn {
  // Process data memoized
  const processedData = useMemo(() => {
    if (!dataProp || dataProp.length === 0) return null

    let processed: PriceDataPoint[] = [...dataProp]

    // 1. Sort by timestamp
    processed = sortByTimestamp(processed)

    // 2. Filter by time range
    processed = filterByTimeRange(processed, timeRange)

    // 3. Apply smoothing if enabled
    if (smoothData) {
      processed = applyMovingAverage(processed, smoothWindow)
    }

    // 4. Sample data to reduce points
    const interval = getSamplingInterval(timeRange)
    processed = sampleData(processed, interval, maxPoints)

    return processed
  }, [dataProp, timeRange, smoothData, smoothWindow, maxPoints])

  // Format for Recharts
  const chartData = useMemo(() => {
    if (!processedData) return null

    const timeFormat = getTimeFormat(timeRange)

    return processedData.map((point) => {
      const date = parseISO(point.timestamp)
      return {
        timestamp: point.timestamp,
        formattedTime: isValid(date) ? format(date, timeFormat) : point.timestamp,
        priceYes: point.priceYes,
        priceNo: point.priceNo,
        pricePercent: point.priceYes * 100,
        volume: point.volume
      }
    })
  }, [processedData, timeRange])

  // Calculate OHLC data if requested
  const ohlcData = useMemo(() => {
    if (!includeOHLC || !processedData) return null

    // Determine aggregation interval based on time range
    const intervalMinutes: Record<ChartTimeRange, number> = {
      '1H': 5,
      '24H': 15,
      '7D': 60,
      '30D': 240, // 4 hours
      'ALL': 1440 // 1 day
    }

    return aggregateToOHLC(processedData, intervalMinutes[timeRange])
  }, [processedData, timeRange, includeOHLC])

  // Calculate statistics
  const stats = useMemo(() => {
    if (!processedData) {
      return { min: 0, max: 100, avg: 50, start: 50, end: 50, change: 0, changePercent: 0 }
    }
    return calculateStats(processedData)
  }, [processedData])

  // Calculate trend
  const trend = useMemo(() => getTrend(stats), [stats])

  // Price change
  const priceChange = useMemo(() => {
    return stats.changePercent
  }, [stats.changePercent])

  // Refetch function (placeholder - actual refetch depends on data source)
  const refetch = useCallback(() => {
    // This would typically trigger a refetch in the parent component
    // via a callback or by invalidating the query
    console.info('[useChartData] Refetch requested for market:', marketId)
  }, [marketId])

  return {
    data: chartData,
    ohlcData,
    trend,
    priceChange,
    minPrice: stats.min,
    maxPrice: stats.max,
    isLoading: isLoadingProp || false,
    isEmpty: !chartData || chartData.length === 0,
    refetch
  }
}

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Hook for getting formatted time labels
 */
export function useTimeLabels(timeRange: ChartTimeRange) {
  return useMemo(() => ({
    format: getTimeFormat(timeRange),
    formatter: (timestamp: string) => formatTooltipLabel(timestamp, timeRange)
  }), [timeRange])
}

/**
 * Hook for getting trend color
 */
export function useTrendColor(trend: 'up' | 'down' | 'neutral'): string {
  return useMemo(() => {
    switch (trend) {
      case 'up':
        return 'hsl(var(--success))'
      case 'down':
        return 'hsl(var(--danger))'
      default:
        return 'hsl(var(--muted-foreground))'
    }
  }, [trend])
}

/**
 * Hook for Y-axis domain calculation
 */
export function useYAxisDomain(
  data: ChartDataPoint[] | null,
  padding: number = 5
): [number, number] {
  return useMemo(() => {
    if (!data || data.length === 0) return [0, 100]

    const prices = data.map((d) => d.pricePercent)
    const min = Math.min(...prices)
    const max = Math.max(...prices)

    return [
      Math.max(0, Math.floor(min / 10) * 10 - padding),
      Math.min(100, Math.ceil(max / 10) * 10 + padding)
    ]
  }, [data, padding])
}

// ============================================================================
// EXPORTS
// ============================================================================
