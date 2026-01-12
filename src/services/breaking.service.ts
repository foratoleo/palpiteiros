/**
 * Breaking Markets Service
 *
 * Service layer for interacting with breaking markets data via Supabase Edge Functions.
 * Provides methods for fetching markets with significant price movements, volatility,
 * and real-time subscriptions to price updates.
 *
 * Breaking markets are identified by analyzing price history to detect significant
 * changes, volume spikes, and volatility patterns.
 *
 * @see /supabase/functions/get-breaking-markets
 * @see /supabase/functions/sync-price-history
 */

import type {
  BreakingMarket,
  BreakingFilters,
  BreakingMarketResponse,
  BreakingMarketsQuery,
  SyncPriceHistoryResult,
  PriceHistoryPoint
} from '@/types/breaking.types'
import { supabase } from '@/config/supabase'

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default Supabase base URL (derived from environment)
 */
const getSupabaseUrl = (): string => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || ''
}

/**
 * Default cache TTL for breaking markets (30 seconds)
 * Breaking markets change frequently, so cache is shorter than regular markets
 */
const DEFAULT_CACHE_TTL = 30000

/**
 * Debounce delay for refresh operations (30 seconds)
 * Prevents excessive sync operations
 */
const REFRESH_DEBOUNCE_MS = 30000

/**
 * Price change threshold for triggering notifications (1%)
 */
const PRICE_CHANGE_THRESHOLD = 0.01

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Breaking Markets Service Class
 *
 * Provides typed methods for fetching and subscribing to breaking market data.
 * Supports caching, real-time updates, and manual refresh triggers.
 *
 * @example
 * ```ts
 * import { breakingService } from '@/services/breaking.service'
 *
 * // Fetch breaking markets with filters
 * const markets = await breakingService.getBreakingMarkets(
 *   { minPriceChange: 0.10, timeRange: '24h' },
 *   20
 * )
 *
 * // Subscribe to real-time updates
 * const unsubscribe = breakingService.subscribeToBreakingUpdates((market) => {
 *   console.log('Market updated:', market.question)
 * })
 * ```
 */
export class BreakingService {
  private readonly baseUrl: string
  private readonly cache: Map<string, { data: unknown; timestamp: number }>
  private readonly cacheTTL: number
  private lastRefreshTime: number = 0
  private activeSubscriptions: Map<string, ReturnType<typeof supabase.channel>> = new Map()

  /**
   * Create a new BreakingService instance
   *
   * @param baseUrl - Custom base URL (optional, uses environment variable)
   * @param cacheTTL - Cache time-to-live in milliseconds (default: 30000ms = 30 seconds)
   */
  constructor(baseUrl?: string, cacheTTL: number = DEFAULT_CACHE_TTL) {
    this.baseUrl = baseUrl || getSupabaseUrl()
    this.cache = new Map()
    this.cacheTTL = cacheTTL
  }

  // ========================================================================
  // BREAKING MARKET OPERATIONS
  // ========================================================================

  /**
   * Fetch breaking markets with optional filters
   *
   * This is the primary method for fetching breaking market data.
   * Calls the Supabase Edge Function `get-breaking-markets` which analyzes
   * price history to identify markets with significant movements.
   *
   * @param filters - Filter options for breaking markets
   * @param limit - Maximum number of results (default: 20, max: 100)
   * @returns Array of breaking markets with computed metrics
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * // Get top 20 breaking markets
   * const breaking = await breakingService.getBreakingMarkets({}, 20)
   *
   * // Get markets with >10% price change
   * const movers = await breakingService.getBreakingMarkets(
   *   { minPriceChange: 0.10, timeRange: '24h' },
   *   50
   * )
   *
   * // Get only upward trending markets
   * const bullish = await breakingService.getBreakingMarkets(
   *   { trend: 'up', minMovementScore: 0.5 },
   *   20
   * )
   * ```
   */
  async getBreakingMarkets(
    filters: BreakingFilters = {},
    limit: number = 20
  ): Promise<BreakingMarket[]> {
    const cacheKey = `breaking:${JSON.stringify({ filters, limit })}`

    // Check cache
    const cached = this.getFromCache<BreakingMarket[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Build query parameters for Edge Function
    const params = new URLSearchParams()

    // Apply filters to query params
    if (filters.minPriceChange !== undefined) {
      params.append('min_price_change', String(filters.minPriceChange))
    }
    if (filters.maxPriceChange !== undefined) {
      params.append('max_price_change', String(filters.maxPriceChange))
    }
    if (filters.minVolume !== undefined) {
      params.append('min_volume', String(filters.minVolume))
    }
    if (filters.categories?.length) {
      params.append('categories', filters.categories.join(','))
    }
    if (filters.timeRange) {
      // Convert timeRange to hours for the Edge Function
      const hoursMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 }
      params.append('time_range_hours', String(hoursMap[filters.timeRange] || 24))
    }
    if (filters.minMovementScore !== undefined) {
      params.append('min_movement_score', String(filters.minMovementScore))
    }
    if (filters.trend) {
      params.append('trend', filters.trend)
    }

    // Apply limit
    params.append('limit', String(Math.min(limit, 100)))

    // Build URL for Edge Function
    const url = `${this.baseUrl}/functions/v1/get-breaking-markets?${params.toString()}`

    // Fetch data
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Failed to fetch breaking markets: ${response.status} ${response.statusText}. ${errorText}`
      )
    }

    const result: BreakingMarketResponse = await response.json()

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch breaking markets')
    }

    const data = result.data || []

    // Cache the result
    this.setCache(cacheKey, data)

    return data
  }

  /**
   * Fetch a single breaking market by ID
   *
   * Retrieves detailed breaking market data including computed metrics
   * like movement score, price change, and volatility index.
   *
   * @param marketId - Market ID to fetch
   * @returns Breaking market data or null if not found
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const market = await breakingService.getBreakingMarketById('market-123')
   * if (market) {
   *   console.log(`Movement score: ${market.movement_score}`)
   *   console.log(`Price change 24h: ${market.price_change_24h}`)
   * }
   * ```
   */
  async getBreakingMarketById(marketId: string): Promise<BreakingMarket | null> {
    const cacheKey = `breaking:${marketId}`

    // Check cache
    const cached = this.getFromCache<BreakingMarket>(cacheKey)
    if (cached) {
      return cached
    }

    // Build URL for Edge Function
    const url = `${this.baseUrl}/functions/v1/get-breaking-markets?market_id=${encodeURIComponent(marketId)}`

    // Fetch data
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      // Return null for 404, throw for other errors
      if (response.status === 404) {
        return null
      }
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Failed to fetch breaking market: ${response.status} ${response.statusText}. ${errorText}`
      )
    }

    const result: BreakingMarketResponse = await response.json()

    if (!result.success || !result.data || result.data.length === 0) {
      return null
    }

    const market = result.data[0]

    // Cache the result
    this.setCache(cacheKey, market)

    return market
  }

  // ========================================================================
  // REFRESH OPERATIONS
  // ========================================================================

  /**
   * Trigger price history sync to refresh breaking data
   *
   * Calls the Supabase Edge Function `sync-price-history` to fetch
   * latest price data from Polymarket and update the database.
   * Implements debounce logic to prevent excessive sync operations.
   *
   * @returns Sync result with count of synced records
   * @throws Error if the sync operation fails
   *
   * @example
   * ```ts
   * await breakingService.refreshBreakingData()
   * // Result: { success: true, synced: 150, failed: 0, ... }
   * ```
   */
  async refreshBreakingData(): Promise<SyncPriceHistoryResult> {
    // Debounce check
    const now = Date.now()
    if (now - this.lastRefreshTime < REFRESH_DEBOUNCE_MS) {
      const remainingMs = REFRESH_DEBOUNCE_MS - (now - this.lastRefreshTime)
      throw new Error(
        `Refresh debounce active. Please wait ${Math.ceil(remainingMs / 1000)} seconds.`
      )
    }

    this.lastRefreshTime = now

    // Build URL for Edge Function
    const url = `${this.baseUrl}/functions/v1/sync-price-history`

    // Fetch data
    const response = await this.fetchWithTimeout(url, 120000) // 2 minute timeout for sync

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      throw new Error(
        `Failed to refresh breaking data: ${response.status} ${response.statusText}. ${errorText}`
      )
    }

    const result: SyncPriceHistoryResult = await response.json()

    if (!result.success) {
      throw new Error(result.message || 'Failed to refresh breaking data')
    }

    // Invalidate cache after successful sync
    this.clearCache()

    return result
  }

  // ========================================================================
  // REAL-TIME SUBSCRIPTIONS
  // ========================================================================

  /**
   * Subscribe to breaking market price updates
   *
   * Creates a Supabase real-time subscription to the `market_price_history` table.
   * The callback is invoked when prices change significantly (>1% change).
   *
   * @param callback - Function to call when a market updates significantly
   * @returns Unsubscribe function to clean up the subscription
   *
   * @example
   * ```ts
   * const unsubscribe = breakingService.subscribeToBreakingUpdates((market) => {
   *   console.log(`${market.question} is moving!`)
   *   console.log(`Price change: ${market.price_change_24h}`)
   * })
   *
   * // Later, clean up
   * unsubscribe()
   * ```
   */
  subscribeToBreakingUpdates(
    callback: (market: BreakingMarket) => void
  ): () => void {
    const channelName = `breaking-updates-${Date.now()}`
    const lastKnownPrices = new Map<string, number>()

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_price_history'
        },
        async (payload) => {
          const newPoint = payload.new as PriceHistoryPoint
          if (!newPoint.market_id) return

          // Get last known price for this market
          const lastPrice = lastKnownPrices.get(newPoint.market_id)
          const currentPrice = newPoint.price_yes

          // Store current price
          lastKnownPrices.set(newPoint.market_id, currentPrice)

          // Check if price change is significant (>1%)
          if (lastPrice !== undefined) {
            const priceChange = Math.abs((currentPrice - lastPrice) / lastPrice)
            if (priceChange < PRICE_CHANGE_THRESHOLD) {
              return // Not significant enough
            }
          }

          // Fetch full breaking market data
          try {
            const market = await this.getBreakingMarketById(newPoint.market_id)
            if (market) {
              callback(market)
            }
          } catch (error) {
            console.error('Error fetching breaking market update:', error)
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || err) {
          console.error(`Failed to subscribe to breaking updates: ${channelName}`, err)
        }
      })

    // Store subscription for cleanup
    this.activeSubscriptions.set(channelName, channel)

    // Return unsubscribe function
    return () => {
      supabase.removeChannel(channel)
      this.activeSubscriptions.delete(channelName)
    }
  }

  /**
   * Subscribe to updates for a specific market
   *
   * Creates a filtered real-time subscription for a single market.
   *
   * @param marketId - Market ID to subscribe to
   * @param callback - Function to call when the market updates
   * @returns Unsubscribe function
   *
   * @example
   * ```ts
   * const unsubscribe = breakingService.subscribeToMarket(
   *   'market-123',
   *   (market) => console.log('Updated:', market)
   * )
   * ```
   */
  subscribeToMarket(
    marketId: string,
    callback: (market: BreakingMarket) => void
  ): () => void {
    const channelName = `market-updates-${marketId}-${Date.now()}`
    const lastKnownPrices = new Map<string, number>()

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_price_history',
          filter: `market_id=eq.${marketId}`
        },
        async (payload) => {
          const newPoint = payload.new as PriceHistoryPoint
          const lastPrice = lastKnownPrices.get(marketId)
          const currentPrice = newPoint.price_yes

          lastKnownPrices.set(marketId, currentPrice)

          // Check for significant price change
          if (lastPrice !== undefined) {
            const priceChange = Math.abs((currentPrice - lastPrice) / lastPrice)
            if (priceChange < PRICE_CHANGE_THRESHOLD) {
              return
            }
          }

          try {
            const market = await this.getBreakingMarketById(marketId)
            if (market) {
              callback(market)
            }
          } catch (error) {
            console.error(`Error fetching market update for ${marketId}:`, error)
          }
        }
      )
      .subscribe()

    this.activeSubscriptions.set(channelName, channel)

    return () => {
      supabase.removeChannel(channel)
      this.activeSubscriptions.delete(channelName)
    }
  }

  /**
   * Unsubscribe from all active subscriptions
   *
   * Call this when cleaning up components to prevent memory leaks.
   *
   * @example
   * ```ts
   * // In a component's cleanup
   * useEffect(() => {
   *   const unsubscribe = breakingService.subscribeToBreakingUpdates(handler)
   *   return () => {
   *     unsubscribe()
   *     breakingService.unsubscribeAll()
   *   }
   * }, [])
   * ```
   */
  unsubscribeAll(): void {
    for (const [name, channel] of this.activeSubscriptions) {
      supabase.removeChannel(channel)
    }
    this.activeSubscriptions.clear()
  }

  // ========================================================================
  // CACHE MANAGEMENT
  // ========================================================================

  /**
   * Clear the internal cache
   *
   * Call this method to force fresh data on the next request.
   *
   * @example
   * ```ts
   * breakingService.clearCache()
   * const freshMarkets = await breakingService.getBreakingMarkets()
   * ```
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get a value from cache if not expired
   *
   * @param key - Cache key
   * @returns Cached data or undefined
   */
  private getFromCache<T>(key: string): T | undefined {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as T
    }
    // Remove expired entry
    if (cached) {
      this.cache.delete(key)
    }
    return undefined
  }

  /**
   * Set a value in the cache
   *
   * @param key - Cache key
   * @param data - Data to cache
   */
  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  /**
   * Build URL query parameters from BreakingFilters
   *
   * @param filters - Filter options
   * @returns URLSearchParams object
   */
  private buildQueryParams(filters: BreakingFilters, limit: number): URLSearchParams {
    const params = new URLSearchParams()

    if (filters.minPriceChange !== undefined) {
      params.append('min_price_change', String(filters.minPriceChange))
    }
    if (filters.maxPriceChange !== undefined) {
      params.append('max_price_change', String(filters.maxPriceChange))
    }
    if (filters.minVolume !== undefined) {
      params.append('min_volume', String(filters.minVolume))
    }
    if (filters.categories?.length) {
      params.append('categories', filters.categories.join(','))
    }
    if (filters.timeRange) {
      const hoursMap = { '1h': 1, '24h': 24, '7d': 168, '30d': 720 }
      params.append('time_range_hours', String(hoursMap[filters.timeRange] || 24))
    }
    if (filters.minMovementScore !== undefined) {
      params.append('min_movement_score', String(filters.minMovementScore))
    }
    if (filters.trend) {
      params.append('trend', filters.trend)
    }

    params.append('limit', String(Math.min(limit, 100)))

    return params
  }

  /**
   * Fetch with timeout and error handling
   *
   * @param url - URL to fetch
   * @param timeout - Request timeout in milliseconds (default: 30000)
   * @returns Fetch response
   * @throws Error if timeout or network error occurs
   */
  private async fetchWithTimeout(
    url: string,
    timeout: number = 30000
  ): Promise<Response> {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      clearTimeout(timeoutId)
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout: ${url}`)
      }
      throw error
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of BreakingService
 *
 * Use this for standard breaking markets operations throughout the application.
 *
 * @example
 * ```ts
 * import { breakingService } from '@/services/breaking.service'
 *
 * // Fetch breaking markets
 * const markets = await breakingService.getBreakingMarkets(
 *   { minPriceChange: 0.10 },
 *   20
 * )
 *
 * // Subscribe to updates
 * const unsubscribe = breakingService.subscribeToBreakingUpdates((market) => {
 *   console.log('Breaking update:', market.question)
 * })
 * ```
 */
export const breakingService = new BreakingService()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate movement score from price data
 *
 * @param priceChange - 24h price change (-1 to 1)
 * @param volumeChange - 24h volume change (-1 to 1)
 * @param volatility - Volatility index (0 to 1)
 * @returns Movement score (0 to 1)
 *
 * @example
 * ```ts
 * const score = calculateMovementScore(0.15, 0.5, 0.3)
 * // Returns a composite score based on all three factors
 * ```
 */
export function calculateMovementScore(
  priceChange: number,
  volumeChange: number,
  volatility: number
): number {
  // Weighted average: price change (50%), volume change (30%), volatility (20%)
  return (
    Math.abs(priceChange) * 0.5 +
    Math.abs(volumeChange) * 0.3 +
    volatility * 0.2
  )
}

/**
 * Determine trend direction from price change
 *
 * @param priceChange - 24h price change (-1 to 1)
 * @returns Trend direction
 *
 * @example
 * ```ts
 * const trend = getTrendDirection(0.05) // 'up'
 * const trend = getTrendDirection(-0.03) // 'down'
 * const trend = getTrendDirection(0.005) // 'neutral'
 * ```
 */
export function getTrendDirection(priceChange: number): 'up' | 'down' | 'neutral' {
  const threshold = 0.01 // 1% threshold
  if (priceChange > threshold) return 'up'
  if (priceChange < -threshold) return 'down'
  return 'neutral'
}

/**
 * Check if a market qualifies as "breaking"
 *
 * @param movementScore - Movement score (0-1)
 * @param minScore - Minimum score threshold (default: 0.3)
 * @returns Whether the market qualifies as breaking
 *
 * @example
 * ```ts
 * if (isBreakingMarket(market.movement_score)) {
 *   console.log('This is a breaking market!')
 * }
 * ```
 */
export function isBreakingMarket(movementScore: number, minScore: number = 0.3): boolean {
  return movementScore >= minScore
}

/**
 * Get breaking market severity level
 *
 * @param movementScore - Movement score (0-1)
 * @returns Severity level
 *
 * @example
 * ```ts
 * const severity = getBreakingSeverity(0.8) // 'extreme'
 * const severity = getBreakingSeverity(0.5) // 'high'
 * const severity = getBreakingSeverity(0.2) // 'low'
 * ```
 */
export function getBreakingSeverity(movementScore: number): 'low' | 'medium' | 'high' | 'extreme' {
  if (movementScore >= 0.7) return 'extreme'
  if (movementScore >= 0.5) return 'high'
  if (movementScore >= 0.3) return 'medium'
  return 'low'
}

/**
 * Format price change for display
 *
 * @param priceChange - Price change value (-1 to 1)
 * @returns Formatted string with sign and percentage
 *
 * @example
 * ```ts
 * formatPriceChange(0.1234) // '+12.34%'
 * formatPriceChange(-0.0567) // '-5.67%'
 * ```
 */
export function formatPriceChange(priceChange: number): string {
  const percentage = priceChange * 100
  const sign = priceChange >= 0 ? '+' : ''
  return `${sign}${percentage.toFixed(2)}%`
}
