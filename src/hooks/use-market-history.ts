/**
 * Use Market History Hook
 *
 * Custom React Query hook for fetching market price history.
 * Provides time series data for charts and analytics.
 * Optimized for Recharts integration with formatted data.
 *
 * @feature TanStack Query v5 integration
 * @feature Multiple time ranges (1H, 24H, 7D, 30D, ALL)
 * @feature Recharts-compatible data format
 * @feature Selective invalidation for efficient updates
 */

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getMarketPrices } from '@/services/supabase.service'
import { marketKeys } from '@/lib/query-keys'
import { STALE_TIMES, CACHE_TIMES } from '@/lib/query-client'
import type { PriceDataPoint } from '@/types/market.types'
import type { MarketTimeRange } from '@/types/market.types'
import { MarketTimeRange as MarketTimeRangeEnum } from '@/types/market.types'

// ============================================================================
// TIME RANGE UTILITIES
// ============================================================================

/**
 * Get timestamp range for a time range
 *
 * Calculates start and end timestamps based on the specified time range.
 *
 * @param timeRange - Time range enum
 * @returns Object with start and end timestamps
 *
 * @example
 * ```ts
 * const { start, end } = getTimeRange('7d')
 * // start: 7 days ago, end: now
 * ```
 */
function getTimeRange(timeRange: MarketTimeRange): { start: Date; end: Date } {
  const end = new Date()
  const start = new Date()

  switch (timeRange) {
    case '24h':
      start.setHours(start.getHours() - 24)
      break
    case '7d':
      start.setDate(start.getDate() - 7)
      break
    case '30d':
      start.setDate(start.getDate() - 30)
      break
    case '90d':
      start.setDate(start.getDate() - 90)
      break
    case 'all':
      // No time constraint
      start.setFullYear(start.getFullYear() - 10)
      break
  }

  return { start, end }
}

/**
 * Calculate data point interval based on time range
 *
 * Determines optimal interval between data points to avoid
 * overcrowding the chart while maintaining resolution.
 *
 * @param timeRange - Time range enum
 * @returns Interval in milliseconds
 */
function getDataInterval(timeRange: MarketTimeRange): number {
  switch (timeRange) {
    case '24h':
      return 5 * 60 * 1000 // 5 minutes
    case '7d':
      return 30 * 60 * 1000 // 30 minutes
    case '30d':
      return 4 * 60 * 60 * 1000 // 4 hours
    case '90d':
      return 12 * 60 * 60 * 1000 // 12 hours
    case 'all':
      return 24 * 60 * 60 * 1000 // 1 day
    default:
      return 30 * 60 * 1000 // 30 minutes default
  }
}

// ============================================================================
// USE MARKET HISTORY (Basic)
// ============================================================================

/**
 * Use Market History Hook Parameters
 */
interface UseMarketHistoryParams {
  /** Market ID to fetch history for */
  marketId: string
  /** Time range for price history */
  timeRange?: MarketTimeRange
  /** Maximum number of data points to return */
  limit?: number
  /** Whether to enable the query */
  enabled?: boolean
  /** Whether to refetch on window focus */
  refetchOnWindowFocus?: boolean
}

/**
 * Use Market History Hook Return Type
 */
interface UseMarketHistoryReturn {
  /** Array of price data points */
  history: PriceDataPoint[] | undefined
  /** Formatted data for Recharts (simplified) */
  chartData: Array<{ time: string; priceYes: number; priceNo: number; volume?: number }> | undefined
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Whether data is currently refetching */
  isRefetching: boolean
  /** Manual refetch function */
  refetch: () => void
  /** Invalidate and refetch */
  invalidate: () => Promise<void>
  /** Time range being used */
  activeTimeRange: MarketTimeRange
  /** Number of data points */
  dataPointCount: number
  /** Date range of the data */
  dateRange: { start: string | null; end: string | null }
}

/**
 * Use Market History Hook
 *
 * Fetches historical price data for a market over the specified time range.
 * Returns data in both raw format and Recharts-compatible format.
 *
 * @param params - Hook parameters
 * @returns Price history and query state
 *
 * @example
 * ```tsx
 * function MarketChart({ marketId }: { marketId: string }) {
 *   const { history, chartData, isLoading } = useMarketHistory({
 *     marketId,
 *     timeRange: 'DAY_7'
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *
 *   return (
 *     <ResponsiveContainer width="100%" height={400}>
 *       <LineChart data={chartData}>
 *         <XAxis dataKey="time" />
 *         <YAxis />
 *         <Tooltip />
 *         <Line type="monotone" dataKey="priceYes" stroke="#8884d8" />
 *       </LineChart>
 *     </ResponsiveContainer>
 *   )
 * }
 * ```
 */
export function useMarketHistory(params: UseMarketHistoryParams): UseMarketHistoryReturn {
  const {
    marketId,
    timeRange = MarketTimeRangeEnum.DAY_7,
    limit = 500,
    enabled = true,
    refetchOnWindowFocus = false
  } = params

  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: marketKeys.history(marketId, timeRange),
    queryFn: async () => {
      // Fetch all price points for the market
      const allPrices = await getMarketPrices(marketId, limit)

      // Filter by time range
      const { start: rangeStart, end: rangeEnd } = getTimeRange(timeRange)

      const filteredPrices = allPrices.filter((price) => {
        const priceTime = new Date(price.timestamp).getTime()
        return priceTime >= rangeStart.getTime() && priceTime <= rangeEnd.getTime()
      })

      // Sample data to avoid overcrowding
      const interval = getDataInterval(timeRange)
      const sampledPrices: PriceDataPoint[] = []
      let lastSampleTime = 0

      for (const price of filteredPrices) {
        const priceTime = new Date(price.timestamp).getTime()
        if (priceTime - lastSampleTime >= interval) {
          sampledPrices.push({
            timestamp: price.timestamp,
            priceYes: price.price_yes ?? 0,
            priceNo: price.price_no ?? 0,
            volume: price.volume_24h ?? 0
          })
          lastSampleTime = priceTime
        }
      }

      // Sort by timestamp (newest last)
      sampledPrices.sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )

      return sampledPrices
    },
    staleTime: STALE_TIMES.PRICE_HISTORY,
    gcTime: CACHE_TIMES.PRICE_HISTORY,
    enabled,
    refetchOnWindowFocus
  })

  // Format data for Recharts
  const chartData = query.data?.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    priceYes: point.priceYes,
    priceNo: point.priceNo,
    volume: point.volume
  }))

  // Calculate date range
  const dateRange = {
    start: query.data?.[0]?.timestamp || null,
    end: query.data?.[query.data.length - 1]?.timestamp || null
  }

  return {
    history: query.data,
    chartData,
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: marketKeys.history(marketId, timeRange)
      })
    },
    activeTimeRange: timeRange,
    dataPointCount: query.data?.length || 0,
    dateRange
  }
}

// ============================================================================
// USE MARKET HISTORY WITH AGGREGATION
// ============================================================================

/**
 * Aggregation Type
 */
type AggregationType = 'ohlc' | 'average' | 'median'

/**
 * Use Market History With Aggregation Hook Parameters
 */
interface UseMarketHistoryAggregatedParams extends UseMarketHistoryParams {
  /** Type of aggregation to apply */
  aggregation?: AggregationType
  /** Interval for aggregation in minutes */
  aggregateInterval?: number
}

/**
 * OHLC Data Point (Open, High, Low, Close)
 */
interface OHLCPoint {
  /** Timestamp of the period */
  timestamp: string
  /** Opening price */
  open: number
  /** Highest price */
  high: number
  /** Lowest price */
  low: number
  /** Closing price */
  close: number
  /** Total volume */
  volume: number
}

/**
 * Use Market History With Aggregation Hook Return Type
 */
interface UseMarketHistoryAggregatedReturn extends Omit<UseMarketHistoryReturn, 'history' | 'chartData'> {
  /** Aggregated history data */
  history: OHLCPoint[] | undefined
  /** Formatted data for Recharts candlestick */
  chartData: Array<{
    time: string
    open: number
    high: number
    low: number
    close: number
    volume: number
  }> | undefined
}

/**
 * Use Market History With Aggregation Hook
 *
 * Fetches price history with OHLC (Open-High-Low-Close) aggregation.
 * Useful for candlestick charts and detailed analysis.
 *
 * @param params - Hook parameters
 * @returns Aggregated price history and query state
 *
 * @example
 * ```tsx
 * function CandlestickChart({ marketId }: { marketId: string }) {
 *   const { chartData, isLoading } = useMarketHistoryAggregated({
 *     marketId,
 *     timeRange: 'DAY_7',
 *     aggregation: 'ohlc',
 *     aggregateInterval: 60 // 1-hour candles
 *   })
 *
 *   return (
 *     <ResponsiveContainer width="100%" height={400}>
 *       <ComposedChart data={chartData}>
 *         <XAxis dataKey="time" />
 *         <YAxis />
 *         <Tooltip />
 *         <Candlestick dataKey="open" dataKey2="high" dataKey3="low" dataKey4="close" />
 *       </ComposedChart>
 *     </ResponsiveContainer>
 *   )
 * }
 * ```
 */
export function useMarketHistoryAggregated(
  params: UseMarketHistoryAggregatedParams
): UseMarketHistoryAggregatedReturn {
  const {
    marketId,
    timeRange = MarketTimeRangeEnum.DAY_7,
    aggregation = 'ohlc',
    aggregateInterval = 60,
    limit = 1000,
    enabled = true
  } = params

  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: [...marketKeys.history(marketId, timeRange), aggregation, aggregateInterval],
    queryFn: async () => {
      // Fetch raw price data
      const allPrices = await getMarketPrices(marketId, limit)

      // Filter by time range
      const { start: rangeStart, end: rangeEnd } = getTimeRange(timeRange)
      const filteredPrices = allPrices.filter((price) => {
        const priceTime = new Date(price.timestamp).getTime()
        return priceTime >= rangeStart.getTime() && priceTime <= rangeEnd.getTime()
      })

      // Aggregate by interval
      const intervalMs = aggregateInterval * 60 * 1000
      const aggregated = new Map<string, OHLCPoint>()

      for (const price of filteredPrices) {
        const priceTime = new Date(price.timestamp).getTime()
        const bucketTime = Math.floor(priceTime / intervalMs) * intervalMs
        const bucketKey = new Date(bucketTime).toISOString()

        const priceYes = price.price_yes ?? 0
        const volume = price.volume_24h ?? 0

        if (!aggregated.has(bucketKey)) {
          aggregated.set(bucketKey, {
            timestamp: bucketKey,
            open: priceYes,
            high: priceYes,
            low: priceYes,
            close: priceYes,
            volume: volume
          })
        } else {
          const bucket = aggregated.get(bucketKey)!
          bucket.high = Math.max(bucket.high, priceYes)
          bucket.low = Math.min(bucket.low, priceYes)
          bucket.close = priceYes
          bucket.volume += volume
        }
      }

      // Convert to array and sort
      return Array.from(aggregated.values()).sort((a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
    },
    staleTime: STALE_TIMES.PRICE_HISTORY,
    gcTime: CACHE_TIMES.PRICE_HISTORY,
    enabled
  })

  // Format data for Recharts
  const chartData = query.data?.map((point) => ({
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    open: point.open,
    high: point.high,
    low: point.low,
    close: point.close,
    volume: point.volume
  }))

  const dateRange = {
    start: query.data?.[0]?.timestamp || null,
    end: query.data?.[query.data.length - 1]?.timestamp || null
  }

  return {
    history: query.data,
    chartData,
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: [...marketKeys.history(marketId, timeRange), aggregation, aggregateInterval]
      })
    },
    activeTimeRange: timeRange,
    dataPointCount: query.data?.length || 0,
    dateRange
  }
}

// ============================================================================
// USE MARKET STATISTICS FROM HISTORY
// ============================================================================

/**
 * Market Statistics from History
 */
interface MarketHistoryStats {
  /** Average YES price */
  avgPrice: number
  /** Minimum price */
  minPrice: number
  /** Maximum price */
  maxPrice: number
  /** Price volatility (standard deviation) */
  volatility: number
  /** Total volume */
  totalVolume: number
  /** Number of price updates */
  updateCount: number
  /** Price trend (up/down/flat) */
  trend: 'up' | 'down' | 'flat'
  /** Price change percentage */
  priceChange: number
}

/**
 * Use Market Statistics Hook Parameters
 */
interface UseMarketHistoryStatsParams {
  /** Market ID */
  marketId: string
  /** Time range for statistics */
  timeRange?: MarketTimeRange
  /** Query enabled flag */
  enabled?: boolean
}

/**
 * Use Market Statistics Hook Return Type
 */
interface UseMarketHistoryStatsReturn {
  /** Calculated statistics */
  stats: MarketHistoryStats | undefined
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Refetch function */
  refetch: () => void
}

/**
 * Use Market Statistics Hook
 *
 * Calculates statistics from price history data.
 * Provides insights into price movement, volatility, and trends.
 *
 * @param params - Hook parameters
 * @returns Statistics and query state
 *
 * @example
 * ```tsx
 * function MarketStats({ marketId }: { marketId: string }) {
 *   const { stats, isLoading } = useMarketHistoryStats({
 *     marketId,
 *     timeRange: 'DAY_7'
 *   })
 *
 *   if (isLoading) return <LoadingSpinner />
 *
 *   return (
 *     <div>
 *       <p>Average Price: {stats?.avgPrice.toFixed(2)}%</p>
 *       <p>Volatility: {stats?.volatility.toFixed(2)}%</p>
 *       <p>Trend: {stats?.trend}</p>
 *     </div>
 *   )
 * }
 * ```
 */
export function useMarketHistoryStats(params: UseMarketHistoryStatsParams): UseMarketHistoryStatsReturn {
  const { marketId, timeRange = MarketTimeRangeEnum.DAY_7, enabled = true } = params

  const query = useQuery({
    queryKey: [...marketKeys.history(marketId, timeRange), 'stats'],
    queryFn: async () => {
      const prices = await getMarketPrices(marketId, 1000)

      // Filter by time range
      const { start: rangeStart } = getTimeRange(timeRange)
      const filteredPrices = prices.filter((price) => {
        const priceTime = new Date(price.timestamp).getTime()
        return priceTime >= rangeStart.getTime()
      })

      if (filteredPrices.length === 0) {
        throw new Error('No price data available for the specified time range')
      }

      // Calculate statistics
      const yesPrices = filteredPrices.map((p) => p.price_yes).filter((p): p is number => p !== null)
      const avgPrice = yesPrices.reduce((sum, p) => sum + p, 0) / yesPrices.length
      const minPrice = Math.min(...yesPrices)
      const maxPrice = Math.max(...yesPrices)

      // Calculate volatility (standard deviation)
      const variance = yesPrices.reduce((sum, p) => sum + Math.pow(p - avgPrice, 2), 0) / yesPrices.length
      const volatility = Math.sqrt(variance)

      // Total volume
      const totalVolume = filteredPrices.reduce((sum, p) => sum + (p.volume_24h || 0), 0)

      // Price trend and change
      const firstPrice = yesPrices[yesPrices.length - 1]
      const lastPrice = yesPrices[0]
      const priceChange = ((lastPrice - firstPrice) / firstPrice) * 100

      let trend: 'up' | 'down' | 'flat' = 'flat'
      if (priceChange > 1) trend = 'up'
      else if (priceChange < -1) trend = 'down'

      return {
        avgPrice,
        minPrice,
        maxPrice,
        volatility,
        totalVolume,
        updateCount: filteredPrices.length,
        trend,
        priceChange
      } as MarketHistoryStats
    },
    staleTime: STALE_TIMES.PRICE_HISTORY,
    gcTime: CACHE_TIMES.PRICE_HISTORY,
    enabled
  })

  return {
    stats: query.data,
    isLoading: query.isLoading,
    error: query.error || null,
    refetch: query.refetch
  }
}

// ============================================================================
// PREFETCH HELPER
// ============================================================================

/**
 * Prefetch market history
 *
 * Utility function to prefetch market history data.
 * Useful for SSR or preloading data before user navigates.
 *
 * @param marketId - Market ID to prefetch
 * @param timeRange - Time range to prefetch
 * @example
 * ```ts
 * import { prefetchMarketHistory } from '@/hooks/use-market-history'
 * import { queryClient } from '@/lib/query-client'
 *
 * // In a server component or loader
 * await prefetchMarketHistory('market-123', 'DAY_7', queryClient)
 * ```
 */
export async function prefetchMarketHistory(
  marketId: string,
  timeRange: MarketTimeRange = MarketTimeRangeEnum.DAY_7,
  queryClient: ReturnType<typeof useQueryClient>
) {
  await queryClient.prefetchQuery({
    queryKey: marketKeys.history(marketId, timeRange),
    queryFn: async () => {
      const prices = await getMarketPrices(marketId, 500)
      return prices.map((price) => ({
        timestamp: price.timestamp,
        priceYes: price.price_yes ?? 0,
        priceNo: price.price_no ?? 0,
        volume: price.volume_24h ?? 0
      }))
    },
    staleTime: STALE_TIMES.PRICE_HISTORY
  })
}
