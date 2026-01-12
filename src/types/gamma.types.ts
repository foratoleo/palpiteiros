/**
 * Gamma API Types
 *
 * Type definitions for the Polymarket Gamma API
 * API Documentation: https://docs.polymarket.com/developers/gamma-markets-api
 * Base URL: https://gamma-api.polymarket.com
 *
 * The Gamma API provides read-only access to Polymarket market data,
 * including market metadata, pricing, volume, and liquidity information.
 */

/**
 * Gamma Market Response
 *
 * Core market data structure returned by the Gamma API
 */
export interface GammaMarket {
  /** Unique market identifier */
  conditionId: string
  /** Market question/title */
  question: string
  /** Detailed market description */
  description?: string
  /** URL-friendly market identifier */
  slug: string
  /** Market end date (ISO 8601 format) */
  endDate?: string
  /** Market start date (ISO 8601 format) */
  startDate?: string
  /** Available outcomes with current prices */
  outcomes: GammaOutcome[]
  /** Total trading volume */
  volume?: number
  /** Current liquidity available */
  liquidity?: number
  /** Whether market is currently active */
  active: boolean
  /** Whether market has closed */
  closed: boolean
  /** Whether market is archived */
  archived?: boolean
  /** Associated tags for categorization */
  tags?: GammaTag[]
  /** Market category */
  category?: string
  /** Market image/thumbnail URL */
  imageUrl?: string
  /** Twitter card image URL */
  twitterCardImage?: string
  /** Current order book data */
  orderBook?: OrderBook
  /** Last trade information */
  lastTrade?: LastTrade
  /** Current token price (derived from outcomes) */
  tokenPrice?: number
  /** CLOB token IDs for trading */
  clobTokenIds?: string[]
  /** Resolution source */
  resolutionSource?: string
  /** AMM type (e.g., "Bonds") */
  ammType?: string
  /** Sponsor name */
  sponsorName?: string
  /** Sponsor image URL */
  sponsorImage?: string
  /** Market ID */
  id?: string
  /** Denomination token (e.g., "USDC") */
  denominationToken?: string
  /** Whether RFQ (Request for Quote) is enabled */
  rfqEnabled?: boolean
}

/**
 * Gamma Outcome
 *
 * Represents a possible outcome with its current price
 */
export interface GammaOutcome {
  /** Outcome name ("Yes" | "No" or custom) */
  name: string
  /** Current price (0-1 range, where 1 = 100% probability) */
  price: number
  /** Token ticker symbol */
  ticker?: string
}

/**
 * Gamma Tag
 *
 * Category/tag information for market classification
 */
export interface GammaTag {
  /** Tag display name */
  label: string
  /** URL-friendly tag identifier */
  slug: string
  /** Tag ID */
  id?: number
  /** Tag name */
  name?: string
}

/**
 * Order Book
 *
 * Current buy and sell orders at various price levels
 */
export interface OrderBook {
  /** Buy orders (bids) - price levels buyers are willing to pay */
  bids: Array<{ price: number; size: number }>
  /** Sell orders (asks) - price levels sellers are willing to accept */
  asks: Array<{ price: number; size: number }>
}

/**
 * Last Trade
 *
 * Information about the most recent trade
 */
export interface LastTrade {
  /** Trade price */
  price: number
  /** Trade timestamp (ISO 8601 format) */
  timestamp: string
}

/**
 * Gamma Markets Query Parameters
 *
 * Filters and options for fetching markets from the Gamma API
 */
export interface GammaMarketsQuery {
  /** Filter for active markets only */
  active?: boolean
  /** Include archived markets */
  archived?: boolean
  /** Include closed markets */
  closed?: boolean
  /** Field to order results by */
  order?: string
  /** Sort ascending (default: false/descending) */
  ascending?: boolean
  /** Maximum number of markets to return */
  limit?: number
  /** Number of markets to skip (pagination) */
  offset?: number
  /** Filter by market slug(s) */
  slug?: string
  /** Filter by condition ID(s) */
  condition_ids?: string[]
  /** Filter by tag slug */
  tag_slug?: string
  /** Filter by tag ID */
  tag_id?: number
  /** Maximum end date (ISO 8601 format) */
  max_close_date?: string
  /** Minimum end date (ISO 8601 format) */
  min_close_date?: string
  /** Minimum start date (ISO 8601 format) */
  start_date_min?: string
  /** Maximum start date (ISO 8601 format) */
  start_date_max?: string
  /** Minimum liquidity threshold */
  liquidity_num_min?: number
  /** Maximum liquidity threshold */
  liquidity_num_max?: number
  /** Minimum volume threshold */
  volume_num_min?: number
  /** Maximum volume threshold */
  volume_num_max?: number
  /** Filter by CLOB token IDs */
  clob_token_ids?: string[]
  /** Filter by market maker address */
  market_maker_address?: string[]
  /** Include markets with related tags */
  related_tags?: boolean
  /** Filter for CYOM (Create Your Own Market) markets */
  cyom?: boolean
  /** Filter by UMA resolution status */
  uma_resolution_status?: string
  /** Filter by game ID (sports markets) */
  game_id?: string
  /** Filter by sports market types */
  sports_market_types?: string[]
  /** Minimum reward size */
  rewards_min_size?: number
  /** Filter by question IDs */
  question_ids?: string[]
  /** Include tag information in response */
  include_tag?: boolean
  /** Filter by market IDs */
  id?: number[]
}

/**
 * Gamma API Response Wrapper
 *
 * Standard response structure for Gamma API endpoints
 */
export interface GammaApiResponse<T> {
  /** Response data */
  data?: T[]
  /** Error message if request failed */
  error?: string
  /** Metadata for pagination and totals */
  meta?: {
    /** Total number of results */
    total: number
    /** Results per page */
    limit: number
    /** Current offset */
    offset: number
  }
}

/**
 * Gamma Event
 *
 * Event information containing related markets
 */
export interface GammaEvent {
  /** Unique event identifier */
  id: string
  /** URL-friendly event identifier */
  slug: string
  /** Event name/title */
  name: string
  /** Event description */
  description?: string
  /** Event start date (ISO 8601 format) */
  startDate?: string
  /** Event end date (ISO 8601 format) */
  endDate?: string
  /** Related market IDs */
  markets?: string[]
}

/**
 * Price History Point
 *
 * Historical price data point for a market
 */
export interface PriceHistoryPoint {
  /** Timestamp (ISO 8601 format) */
  timestamp: string
  /** Yes price at this timestamp */
  priceYes: number
  /** No price at this timestamp */
  priceNo: number
  /** Trading volume at this timestamp */
  volume?: number
}

/**
 * Market Statistics
 *
 * Aggregated statistics for a market or category
 */
export interface MarketStatistics {
  /** Total number of markets */
  marketCount: number
  /** Total trading volume */
  totalVolume: number
  /** Total liquidity across markets */
  totalLiquidity: number
  /** Average trading volume per market */
  averageVolume: number
  /** Average liquidity per market */
  averageLiquidity: number
}

/**
 * Gamma API Error Response
 *
 * Standard error response structure
 */
export interface GammaApiError {
  /** Error code */
  code?: string
  /** Human-readable error message */
  message: string
  /** Additional error details */
  details?: unknown
  /** HTTP status code */
  status?: number
}
