/**
 * Twitter/X API Types
 *
 * Type definitions for Twitter API v2 responses.
 * Specifically tailored for the Polymarket tweets integration.
 *
 * @see https://developer.twitter.com/en/docs/twitter-api/data-dictionary/object-model/tweet
 */

// ============================================================================
// TWEET TYPES
// ============================================================================

/**
 * Tweet object from Twitter API v2
 */
export interface TwitterTweet {
  /** Tweet ID (numeric string) */
  id: string
  /** Tweet text content */
  text: string
  /** ISO 8601 creation timestamp */
  created_at: string
  /** Author information */
  author_id?: string
  /** Attachment media keys */
  attachments?: {
    media_keys: string[]
    poll_ids?: string[]
  }
  /** Entity annotations (URLs, mentions, hashtags, cashtags) */
  entities?: {
    urls?: TwitterUrlEntity[]
    mentions?: TwitterMentionEntity[]
    hashtags?: TwitterHashtagEntity[]
    cashtags?: TwitterCashtagEntity[]
  }
  /** Public metrics (likes, retweets, replies, quotes) */
  public_metrics?: TwitterPublicMetrics
  /** Source of the tweet (client name) */
  source?: string
  /** In-reply-to status ID (if reply) */
  in_reply_to_user_id?: string
  /** Referenced tweets (quoted, replied to) */
  referenced_tweets?: TwitterReferencedTweet[]
  /** Language code (e.g., 'en', 'pt') */
  lang?: string
  /** Possibly sensitive flag */
  possibly_sensitive?: boolean
}

/**
 * Public metrics for a tweet
 */
export interface TwitterPublicMetrics {
  like_count: number
  retweet_count: number
  reply_count: number
  quote_count: number
  impression_count?: number
  bookmark_count?: number
}

/**
 * URL entity in tweet
 */
export interface TwitterUrlEntity {
  start: number
  end: number
  url: string
  expanded_url: string
  display_url: string
  images?: TwitterUrlImage[]
  status?: number
  title?: string
  description?: string
  unwound_url?: string
}

/**
 * URL preview image
 */
export interface TwitterUrlImage {
  url: string
  width: number
  height: number
}

/**
 * Mention entity in tweet
 */
export interface TwitterMentionEntity {
  start: number
  end: number
  username: string
  id: string
}

/**
 * Hashtag entity in tweet
 */
export interface TwitterHashtagEntity {
  start: number
  end: number
  tag: string
}

/**
 * Cashtag (ticker symbol) entity in tweet
 */
export interface TwitterCashtagEntity {
  start: number
  end: number
  tag: string
}

/**
 * Referenced tweet (quoted, replied to, retweeted)
 */
export interface TwitterReferencedTweet {
  type: 'quoted' | 'replied_to' | 'retweeted'
  id: string
}

// ============================================================================
// MEDIA TYPES
// ============================================================================

/**
 * Media attachment object
 */
export interface TwitterMedia {
  /** Media key (matches attachments.media_keys) */
  media_key: string
  /** Media type */
  type: 'photo' | 'video' | 'animated_gif'
  /** Media URL (for photos) */
  url?: string
  /** Preview image URL (for videos/gifs) */
  preview_image_url?: string
  /** Alt text for accessibility */
  alt_text?: string
  /** Media dimensions */
  width?: number
  height?: number
  /** Video variants (for videos) */
  variants?: TwitterMediaVariant[]
}

/**
 * Media variant for videos
 */
export interface TwitterMediaVariant {
  content_type: string
  url: string
  bitrate?: number
}

// ============================================================================
// USER TYPES
// ============================================================================

/**
 * Twitter user object
 */
export interface TwitterUser {
  /** User ID */
  id: string
  /** Username (handle without @) */
  username: string
  /** Display name */
  name: string
  /** Profile image URL */
  profile_image_url?: string
  /** Verified status */
  verified?: boolean
  /** Verified type (blue, business, government) */
  verified_type?: 'blue' | 'business' | 'government' | 'none'
  /** Public metrics */
  public_metrics?: TwitterUserMetrics
  /** Description/bio */
  description?: string
  /** Profile location */
  location?: string
  /** Website URL */
  url?: string
  /** Protected/private account */
  protected?: boolean
  /** Created at timestamp */
  created_at?: string
}

/**
 * User public metrics
 */
export interface TwitterUserMetrics {
  followers_count: number
  following_count: number
  tweet_count: number
  listed_count: number
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Twitter API v2 error response
 */
export interface TwitterApiError {
  title?: string
  detail?: string
  type?: string
  status?: number
  errors?: Array<{
    message: string
    code?: number
  }>
}

/**
 * Twitter API response wrapper (with includes)
 */
export interface TwitterApiResponse<T> {
  data: T
  includes?: {
    tweets?: TwitterTweet[]
    media?: TwitterMedia[]
    users?: TwitterUser[]
    places?: unknown[]
  }
  errors?: TwitterApiError[]
  meta?: {
    result_count: number
    newest_id?: string
    oldest_id?: string
    next_token?: string
    previous_token?: string
  }
}

/**
 * Tweets timeline response
 */
export interface TwitterTweetsTimelineResponse {
  data: TwitterTweet[]
  includes?: {
    media?: TwitterMedia[]
    users?: TwitterUser[]
  }
  meta?: {
    result_count: number
    newest_id: string
    oldest_id: string
    next_token?: string
  }
  errors?: TwitterApiError[]
}

/**
 * User lookup response
 */
export interface TwitterUserLookupResponse {
  data: TwitterUser
  errors?: TwitterApiError[]
}

// ============================================================================
// ENRICHED TYPES (for frontend use)
// ============================================================================

/**
 * Enriched tweet with media and user information
 */
export interface EnrichedTweet {
  id: string
  text: string
  created_at: string
  author?: TwitterUser
  media?: TwitterMedia[]
  public_metrics?: TwitterPublicMetrics
  entities?: {
    urls?: TwitterUrlEntity[]
    mentions?: TwitterMentionEntity[]
    hashtags?: TwitterHashtagEntity[]
    cashtags?: TwitterCashtagEntity[]
  }
  source?: string
  lang?: string
  possibly_sensitive?: boolean
  referenced_tweets?: TwitterReferencedTweet[]
}

/**
 * Tweet category detection result
 */
export type TweetCategory = 'Breaking news' | 'New polymarket' | null

/**
 * Connection status for Twitter feed
 */
export type TwitterConnectionStatus = 'connecting' | 'connected' | 'error' | 'rate_limited'

/**
 * Twitter feed state
 */
export interface TwitterFeedState {
  tweets: EnrichedTweet[]
  status: TwitterConnectionStatus
  lastUpdated: string | null
  error: string | null
  hasMore: boolean
  nextToken?: string
}

/**
 * Twitter feed options
 */
export interface TwitterFeedOptions {
  /** Username to fetch tweets from (default: 'polymarket') */
  username?: string
  /** Maximum number of tweets to fetch (default: 10, max: 100) */
  limit?: number
  /** Whether to include replies (default: false) */
  includeReplies?: boolean
  /** Whether to include retweets (default: false) */
  includeRetweets?: boolean
  /** Whether to auto-refresh (default: true) */
  autoRefresh?: boolean
  /** Auto-refresh interval in milliseconds (default: 300000 = 5 minutes) */
  refreshInterval?: number
}

/**
 * Twitter API error types
 */
export enum TwitterApiErrorCode {
  /** Rate limit exceeded */
  RATE_LIMIT_EXCEEDED = 429,
  /** Unauthorized (invalid token) */
  UNAUTHORIZED = 401,
  /** Forbidden (access denied) */
  FORBIDDEN = 403,
  /** Not found */
  NOT_FOUND = 404,
  /** Too many requests */
  TOO_MANY_REQUESTS = 429,
  /** Server error */
  SERVER_ERROR = 500,
  /** Service unavailable */
  SERVICE_UNAVAILABLE = 503,
}

// ============================================================================
// EDGE FUNCTION TYPES
// ============================================================================

/**
 * Request payload for get-polymarket-tweets edge function
 */
export interface GetPolymarketTweetsRequest {
  /** Username to fetch tweets from (default: 'polymarket') */
  username?: string
  /** Maximum number of tweets (default: 10, max: 100) */
  limit?: number
  /** Exclude replies (default: true) */
  excludeReplies?: boolean
  /** Exclude retweets (default: true) */
  excludeRetweets?: boolean
}

/**
 * Response from get-polymarket-tweets edge function
 */
export interface GetPolymarketTweetsResponse {
  success: boolean
  data?: EnrichedTweet[]
  count?: number
  timestamp: string
  cached: boolean
  error?: string
  errorDetails?: string
}
