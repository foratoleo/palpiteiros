/**
 * Gamma Service
 *
 * Service layer for interacting with the Polymarket Gamma API.
 * Provides methods for fetching markets, events, and related data.
 *
 * @see https://docs.polymarket.com/developers/gamma-markets-api
 */

import type {
  GammaMarket,
  GammaMarketsQuery,
  GammaEvent,
  PriceHistoryPoint,
  MarketStatistics,
  GammaApiError
} from '@/types/gamma.types'

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default Gamma API base URL
 */
const DEFAULT_GAMMA_API_URL = 'https://gamma-api.polymarket.com'

/**
 * Get the Gamma API URL from environment variables or use default
 *
 * @returns Gamma API base URL
 */
function getGammaApiUrl(): string {
  return process.env.NEXT_PUBLIC_GAMMA_API_URL || DEFAULT_GAMMA_API_URL
}

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Gamma API Service Class
 *
 * Provides typed methods for interacting with the Gamma API.
 * Supports fetching markets, events, and statistics with caching.
 *
 * @example
 * ```ts
 * const service = new GammaService()
 * const markets = await service.fetchMarkets({ active: true, limit: 10 })
 * ```
 */
export class GammaService {
  private readonly baseUrl: string
  private readonly cache: Map<string, { data: unknown; timestamp: number }>
  private readonly cacheTTL: number

  /**
   * Create a new GammaService instance
   *
   * @param baseUrl - Custom base URL (optional, uses environment variable or default)
   * @param cacheTTL - Cache time-to-live in milliseconds (default: 60000ms = 1 minute)
   */
  constructor(baseUrl?: string, cacheTTL: number = 60000) {
    this.baseUrl = baseUrl || getGammaApiUrl()
    this.cache = new Map()
    this.cacheTTL = cacheTTL
  }

  // ========================================================================
  // MARKET OPERATIONS
  // ========================================================================

  /**
   * Fetch markets from the Gamma API with optional query parameters
   *
   * This is the primary method for fetching market data. Supports
   * comprehensive filtering and sorting options.
   *
   * @param query - Query parameters for filtering and sorting
   * @returns Array of Gamma markets
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * // Get active markets
   * const activeMarkets = await service.fetchMarkets({ active: true })
   *
   * // Get markets by tag with pagination
   * const cryptoMarkets = await service.fetchMarkets({
   *   tag_slug: 'crypto',
   *   limit: 20,
   *   offset: 0
   * })
   *
   * // Get high liquidity markets
   * const liquidMarkets = await service.fetchMarkets({
   *   liquidity_num_min: 50000,
   *   order: 'liquidity',
   *   ascending: false
   * })
   * ```
   */
  async fetchMarkets(query: GammaMarketsQuery = {}): Promise<GammaMarket[]> {
    const cacheKey = `markets:${JSON.stringify(query)}`

    // Check cache
    const cached = this.getFromCache<GammaMarket[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Build query parameters
    const params = this.buildQueryParams(query)
    const url = `${this.baseUrl}/markets?${params.toString()}`

    // Fetch data
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      throw this.createError(response)
    }

    const data: GammaMarket[] = await response.json()

    // Cache the result
    this.setCache(cacheKey, data)

    return data
  }

  /**
   * Fetch a single market by slug
   *
   * @param slug - Market slug
   * @returns Market data or null if not found
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const market = await service.getMarketBySlug('eth-price-above-3000-dec-31-2024')
   * ```
   */
  async getMarketBySlug(slug: string): Promise<GammaMarket | null> {
    const markets = await this.fetchMarkets({ slug })
    return markets[0] || null
  }

  /**
   * Fetch markets by condition ID(s)
   *
   * @param conditionIds - Single condition ID or array of condition IDs
   * @returns Array of matching markets
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const markets = await service.getMarketsByConditionIds([
   *   '0xabc123...',
   *   '0xdef456...'
   * ])
   * ```
   */
  async getMarketsByConditionIds(conditionIds: string | string[]): Promise<GammaMarket[]> {
    const ids = Array.isArray(conditionIds) ? conditionIds : [conditionIds]
    return this.fetchMarkets({ condition_ids: ids })
  }

  /**
   * Fetch markets by tag
   *
   * @param tagSlug - Tag slug (e.g., 'crypto', 'politics')
   * @param limit - Maximum number of markets to return
   * @returns Array of markets with the specified tag
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const cryptoMarkets = await service.getMarketsByTag('crypto', 20)
   * ```
   */
  async getMarketsByTag(tagSlug: string, limit: number = 20): Promise<GammaMarket[]> {
    return this.fetchMarkets({ tag_slug: tagSlug, limit })
  }

  /**
   * Fetch active markets
   *
   * @param limit - Maximum number of markets to return
   * @param offset - Number of markets to skip
   * @returns Array of active markets
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const activeMarkets = await service.getActiveMarkets(50)
   * ```
   */
  async getActiveMarkets(limit: number = 100, offset: number = 0): Promise<GammaMarket[]> {
    return this.fetchMarkets({ active: true, limit, offset })
  }

  /**
   * Fetch markets closing soon
   *
   * @param limit - Maximum number of markets to return
   * @returns Array of markets closing within 24 hours
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const closingSoon = await service.getClosingSoonMarkets(10)
   * ```
   */
  async getClosingSoonMarkets(limit: number = 10): Promise<GammaMarket[]> {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    return this.fetchMarkets({
      active: true,
      max_close_date: tomorrow,
      order: 'endDate',
      ascending: true,
      limit
    })
  }

  /**
   * Fetch popular/high-volume markets
   *
   * @param limit - Maximum number of markets to return
   * @returns Array of markets sorted by volume
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const popular = await service.getPopularMarkets(20)
   * ```
   */
  async getPopularMarkets(limit: number = 20): Promise<GammaMarket[]> {
    return this.fetchMarkets({
      active: true,
      order: 'volume',
      ascending: false,
      limit
    })
  }

  // ========================================================================
  // EVENT OPERATIONS
  // ========================================================================

  /**
   * Fetch events from the Gamma API
   *
   * @param slug - Optional event slug filter
   * @returns Array of events
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const events = await service.fetchEvents()
   * const electionEvent = await service.fetchEvents('us-presidential-election')
   * ```
   */
  async fetchEvents(slug?: string): Promise<GammaEvent[]> {
    const params = new URLSearchParams()
    if (slug) {
      params.append('slug', slug)
    }

    const url = `${this.baseUrl}/events?${params.toString()}`
    const response = await this.fetchWithTimeout(url)

    if (!response.ok) {
      throw this.createError(response)
    }

    return response.json()
  }

  // ========================================================================
  // STATISTICS OPERATIONS
  // ========================================================================

  /**
   * Get statistics for markets with a specific tag
   *
   * @param tagSlug - Tag slug to analyze
   * @returns Market statistics including totals and averages
   * @throws Error if the API request fails
   *
   * @example
   * ```ts
   * const stats = await service.getTagStatistics('crypto')
   * console.log(`Total volume: $${stats.totalVolume}`)
   * console.log(`Average volume: $${stats.averageVolume}`)
   * ```
   */
  async getTagStatistics(tagSlug: string): Promise<MarketStatistics> {
    const markets = await this.getMarketsByTag(tagSlug, 500)

    const totalVolume = markets.reduce((sum, m) => sum + (m.volume || 0), 0)
    const totalLiquidity = markets.reduce((sum, m) => sum + (m.liquidity || 0), 0)

    return {
      marketCount: markets.length,
      totalVolume,
      totalLiquidity,
      averageVolume: markets.length > 0 ? totalVolume / markets.length : 0,
      averageLiquidity: markets.length > 0 ? totalLiquidity / markets.length : 0
    }
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
   * service.clearCache()
   * const freshMarkets = await service.fetchMarkets()
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
   * Build URLSearchParams from GammaMarketsQuery object
   *
   * @param query - Query parameters
   * @returns URLSearchParams
   */
  private buildQueryParams(query: GammaMarketsQuery): URLSearchParams {
    const params = new URLSearchParams()

    // Boolean parameters
    if (query.active !== undefined) {
      params.append('active', String(query.active))
    }
    if (query.archived !== undefined) {
      params.append('archived', String(query.archived))
    }
    if (query.closed !== undefined) {
      params.append('closed', String(query.closed))
    }
    if (query.ascending !== undefined) {
      params.append('ascending', String(query.ascending))
    }
    if (query.related_tags !== undefined) {
      params.append('related_tags', String(query.related_tags))
    }
    if (query.cyom !== undefined) {
      params.append('cyom', String(query.cyom))
    }
    if (query.include_tag !== undefined) {
      params.append('include_tag', String(query.include_tag))
    }

    // String parameters
    if (query.order) {
      params.append('order', query.order)
    }
    if (query.slug) {
      params.append('slug', query.slug)
    }
    if (query.tag_slug) {
      params.append('tag_slug', query.tag_slug)
    }
    if (query.uma_resolution_status) {
      params.append('uma_resolution_status', query.uma_resolution_status)
    }
    if (query.game_id) {
      params.append('game_id', query.game_id)
    }

    // Numeric parameters
    if (query.limit !== undefined) {
      params.append('limit', String(query.limit))
    }
    if (query.offset !== undefined) {
      params.append('offset', String(query.offset))
    }
    if (query.tag_id !== undefined) {
      params.append('tag_id', String(query.tag_id))
    }
    if (query.liquidity_num_min !== undefined) {
      params.append('liquidity_num_min', String(query.liquidity_num_min))
    }
    if (query.liquidity_num_max !== undefined) {
      params.append('liquidity_num_max', String(query.liquidity_num_max))
    }
    if (query.volume_num_min !== undefined) {
      params.append('volume_num_min', String(query.volume_num_min))
    }
    if (query.volume_num_max !== undefined) {
      params.append('volume_num_max', String(query.volume_num_max))
    }
    if (query.rewards_min_size !== undefined) {
      params.append('rewards_min_size', String(query.rewards_min_size))
    }

    // Date parameters
    if (query.max_close_date) {
      params.append('end_date_max', query.max_close_date)
    }
    if (query.min_close_date) {
      params.append('end_date_min', query.min_close_date)
    }
    if (query.start_date_max) {
      params.append('start_date_max', query.start_date_max)
    }
    if (query.start_date_min) {
      params.append('start_date_min', query.start_date_min)
    }

    // Array parameters (comma-separated)
    if (query.condition_ids?.length) {
      params.append('condition_ids', query.condition_ids.join(','))
    }
    if (query.clob_token_ids?.length) {
      params.append('clob_token_ids', query.clob_token_ids.join(','))
    }
    if (query.market_maker_address?.length) {
      params.append('market_maker_address', query.market_maker_address.join(','))
    }
    if (query.sports_market_types?.length) {
      params.append('sports_market_types', query.sports_market_types.join(','))
    }
    if (query.question_ids?.length) {
      params.append('question_ids', query.question_ids.join(','))
    }
    if (query.id?.length) {
      params.append('id', query.id.join(','))
    }

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
          'Accept': 'application/json'
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

  /**
   * Create a standardized error from a failed response
   *
   * @param response - Failed fetch response
   * @returns GammaApiError
   */
  private createError(response: Response): GammaApiError {
    return {
      code: `HTTP_${response.status}`,
      message: response.statusText || 'Unknown error',
      status: response.status
    }
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Singleton instance of GammaService
 *
 * Use this for standard API operations throughout the application.
 *
 * @example
 * ```ts
 * import { gammaService } from '@/services/gamma.service'
 *
 * const markets = await gammaService.fetchMarkets({ active: true })
 * ```
 */
export const gammaService = new GammaService()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Fetch all markets using pagination
 *
 * This function automatically handles pagination to fetch all available markets.
 * Use with caution as it may return a large number of results.
 *
 * @param query - Base query parameters (limit/offset will be overridden)
 * @param service - GammaService instance (uses singleton if not provided)
 * @returns All markets matching the query
 *
 * @example
 * ```ts
 * const allActiveMarkets = await fetchAllMarkets({ active: true })
 * console.log(`Fetched ${allActiveMarkets.length} markets`)
 * ```
 */
export async function fetchAllMarkets(
  query: GammaMarketsQuery = {},
  service: GammaService = gammaService
): Promise<GammaMarket[]> {
  const limit = 100
  let offset = 0
  const allMarkets: GammaMarket[] = []

  while (true) {
    const markets = await service.fetchMarkets({ ...query, limit, offset })
    allMarkets.push(...markets)

    if (markets.length < limit) {
      break
    }

    offset += limit
  }

  return allMarkets
}

/**
 * Search markets by question text
 *
 * Performs a client-side search on fetched market data.
 * For large-scale searches, consider implementing server-side search.
 *
 * @param searchTerm - Text to search for
 * @param filters - Optional filters to apply before searching
 * @param service - GammaService instance (uses singleton if not provided)
 * @returns Markets matching the search term
 *
 * @example
 * ```ts
 * const results = await searchMarkets('Bitcoin')
 * ```
 */
export async function searchMarkets(
  searchTerm: string,
  filters?: GammaMarketsQuery,
  service: GammaService = gammaService
): Promise<GammaMarket[]> {
  const markets = await service.fetchMarkets(filters)
  const lowerSearchTerm = searchTerm.toLowerCase()

  return markets.filter(market =>
    market.question.toLowerCase().includes(lowerSearchTerm) ||
    market.description?.toLowerCase().includes(lowerSearchTerm) ||
    market.tags?.some(tag => tag.label.toLowerCase().includes(lowerSearchTerm))
  )
}

/**
 * Get markets with contested prices (close to 50%)
 *
 * @param threshold - Price range around 0.5 (default: 0.1 = 45-55%)
 * @param limit - Maximum markets to return
 * @param service - GammaService instance (uses singleton if not provided)
 * @returns Markets with YES price in the contested range
 *
 * @example
 * ```ts
 * const contested = await getContestedMarkets(0.05, 20)
 * // Returns markets with YES price between 45-55%
 * ```
 */
export async function getContestedMarkets(
  threshold: number = 0.1,
  limit: number = 20,
  service: GammaService = gammaService
): Promise<GammaMarket[]> {
  const markets = await service.fetchMarkets({ active: true, limit: limit * 5 })

  return markets
    .filter(market => {
      const yesPrice = market.outcomes.find(o => o.name === 'Yes')?.price
      return yesPrice !== undefined && Math.abs(yesPrice - 0.5) < threshold
    })
    .slice(0, limit)
}

/**
 * Get markets with recent price movement
 *
 * Note: This requires price history data which is not directly available
 * from the Gamma API. This is a placeholder for future implementation.
 *
 * @param threshold - Minimum price change percentage
 * @param service - GammaService instance
 * @returns Markets with significant price movement
 */
export async function getMarketsWithPriceMovement(
  threshold: number = 0.1,
  service: GammaService = gammaService
): Promise<GammaMarket[]> {
  // TODO: Implement when price history is available
  // This would require comparing current prices with historical data
  return service.fetchMarkets({ active: true })
}
