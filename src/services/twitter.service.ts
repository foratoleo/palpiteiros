/**
 * Twitter/X Service
 *
 * Service layer for interacting with Twitter API v2 via Supabase Edge Function.
 * Provides methods for fetching tweets from specified users with caching and
 * error handling.
 *
 * @see /supabase/functions/get-polymarket-tweets
 */

import type {
  EnrichedTweet,
  GetPolymarketTweetsRequest,
  GetPolymarketTweetsResponse,
  TwitterConnectionStatus
} from '@/types/twitter.types'

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
 * Default cache TTL for tweets (30 minutes)
 * Twitter rate limits: 450 requests per 15 minutes for app-only auth
 */
const DEFAULT_CACHE_TTL = 30 * 60 * 1000 // 30 minutes

/**
 * Default fetch timeout (30 seconds)
 */
const FETCH_TIMEOUT = 30000

/**
 * Maximum number of tweets per request (Twitter API limit)
 */
const MAX_LIMIT = 100

/**
 * Default limit for tweet fetches
 */
const DEFAULT_LIMIT = 10

// ============================================================================
// SERVICE CLASS
// ============================================================================

/**
 * Twitter Service Class
 *
 * Provides typed methods for fetching tweets from Twitter API v2.
 * Supports caching, error handling, and connection status tracking.
 *
 * @example
 * ```ts
 * import { twitterService } from '@/services/twitter.service'
 *
 * // Fetch tweets from @polymarket
 * const tweets = await twitterService.getTweets('polymarket', 10)
 *
 * // Check connection status
 * const status = twitterService.getStatus()
 * ```
 */
export class TwitterService {
  private readonly baseUrl: string
  private readonly cache: Map<string, { data: EnrichedTweet[]; timestamp: number }>
  private readonly cacheTTL: number
  private status: TwitterConnectionStatus = 'connecting'
  private lastError: string | null = null

  /**
   * Create a new TwitterService instance
   *
   * @param baseUrl - Custom base URL (optional, uses environment variable)
   * @param cacheTTL - Cache time-to-live in milliseconds (default: 30 minutes)
   */
  constructor(baseUrl?: string, cacheTTL: number = DEFAULT_CACHE_TTL) {
    this.baseUrl = baseUrl || getSupabaseUrl()
    this.cache = new Map()
    this.cacheTTL = cacheTTL
  }

  // ========================================================================
  // PUBLIC METHODS
  // ========================================================================

  /**
   * Fetch tweets from a specified Twitter user
   *
   * @param request - Request parameters (username, limit, etc.)
   * @returns Promise resolving to array of enriched tweets
   *
   * @example
   * ```ts
   * const tweets = await twitterService.getTweets({
   *   username: 'polymarket',
   *   limit: 10,
   *   excludeReplies: true,
   *   excludeRetweets: true,
   * })
   * ```
   */
  async getTweets(
    request: GetPolymarketTweetsRequest
  ): Promise<EnrichedTweet[]> {
    const {
      username = 'polymarket',
      limit = DEFAULT_LIMIT,
      excludeReplies = true,
      excludeRetweets = true,
    } = request

    // Build cache key
    const cacheKey = this.buildCacheKey(username, limit, excludeReplies, excludeRetweets)

    // Check cache
    const cached = this.getFromCache(cacheKey)
    if (cached) {
      this.status = 'connected'
      return cached
    }

    try {
      this.status = 'connecting'
      this.lastError = null

      // Fetch from edge function
      const data = await this.fetchFromEdgeFunction({
        username,
        limit,
        excludeReplies,
        excludeRetweets,
      })

      // Cache the result
      if (data.length > 0) {
        this.setCache(cacheKey, data)
      }

      this.status = 'connected'
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      this.lastError = errorMessage

      // Set status based on error type
      if (errorMessage.includes('Rate limit')) {
        this.status = 'rate_limited'
      } else {
        this.status = 'error'
      }

      throw error
    }
  }

  /**
   * Fetch tweets by username (convenience method)
   *
   * @param username - Twitter username (without @)
   * @param limit - Maximum number of tweets (default: 10)
   * @returns Promise resolving to array of enriched tweets
   */
  async getTweetsByUsername(
    username: string,
    limit: number = DEFAULT_LIMIT
  ): Promise<EnrichedTweet[]> {
    return this.getTweets({ username, limit })
  }

  /**
   * Get current connection status
   */
  getStatus(): TwitterConnectionStatus {
    return this.status
  }

  /**
   * Get last error message
   */
  getLastError(): string | null {
    return this.lastError
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Clear cache for a specific user
   *
   * @param username - Twitter username
   */
  clearUserCache(username: string): void {
    const keysToDelete: string[] = []

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${username}:`)) {
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key))
  }

  // ========================================================================
  // PRIVATE METHODS
  // ========================================================================

  /**
   * Fetch tweets from Supabase Edge Function
   */
  private async fetchFromEdgeFunction(
    request: GetPolymarketTweetsRequest
  ): Promise<EnrichedTweet[]> {
    const edgeFunctionUrl = `${this.baseUrl}/functions/v1/get-polymarket-tweets`

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

    try {
      const response = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        }
        if (response.status === 401) {
          throw new Error('Unauthorized: Invalid Twitter credentials.')
        }
        if (response.status === 404) {
          throw new Error(`User @${request.username} not found.`)
        }

        const text = await response.text()
        throw new Error(`Failed to fetch tweets (${response.status}): ${text}`)
      }

      const data: GetPolymarketTweetsResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch tweets')
      }

      return data.data || []
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout. Please try again.')
        }
        throw error
      }

      throw new Error('Unknown error occurred')
    }
  }

  /**
   * Build cache key from request parameters
   */
  private buildCacheKey(
    username: string,
    limit: number,
    excludeReplies: boolean,
    excludeRetweets: boolean
  ): string {
    return `${username}:${limit}:${excludeReplies}:${excludeRetweets}`
  }

  /**
   * Get data from cache if still valid
   */
  private getFromCache(key: string): EnrichedTweet[] | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    const age = now - cached.timestamp

    if (age > this.cacheTTL) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  /**
   * Set data in cache with timestamp
   */
  private setCache(key: string, data: EnrichedTweet[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    })
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

/**
 * Default Twitter service instance
 */
export const twitterService = new TwitterService()

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Detect tweet category based on content keywords
 *
 * @param text - Tweet text content
 * @returns Category label or null
 */
export function detectTweetCategory(text: string): 'Breaking news' | 'New polymarket' | null {
  const lowerText = text.toLowerCase()

  const breakingKeywords = ['breaking', 'urgent', 'alert', '🚨', '⚡']
  const newMarketKeywords = ['new market', 'just launched', 'now live', '🆕']

  if (breakingKeywords.some(kw => lowerText.includes(kw))) {
    return 'Breaking news'
  }

  if (newMarketKeywords.some(kw => lowerText.includes(kw))) {
    return 'New polymarket'
  }

  return null
}

/**
 * Filter tweets by category
 *
 * @param tweets - Array of enriched tweets
 * @param category - Category to filter by ('Breaking news', 'New polymarket', or 'all')
 * @returns Filtered array of tweets
 */
export function filterTweetsByCategory(
  tweets: EnrichedTweet[],
  category: 'Breaking news' | 'New polymarket' | 'all'
): EnrichedTweet[] {
  if (category === 'all') {
    return tweets
  }

  return tweets.filter(tweet => detectTweetCategory(tweet.text) === category)
}

/**
 * Format number with K/M/B suffixes
 *
 * @param num - Number to format
 * @returns Formatted string
 */
export function formatTweetNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Format relative timestamp (e.g., "2h ago")
 *
 * @param createdAt - ISO 8601 timestamp
 * @returns Formatted relative time string
 */
export function formatRelativeTimestamp(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}
