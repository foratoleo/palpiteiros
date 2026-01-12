/**
 * Market Types
 *
 * Type definitions for market components, filters, and state management.
 * Integrates with database.types.ts for persistent storage and gamma.types.ts
 * for external API data.
 */

import type { Database } from './database.types'

// ============================================================================
// MARKET STATE (Database + Gamma Integration)
// ============================================================================

/**
 * Market
 *
 * Combined market state from database (persisted) and Gamma API (real-time).
 * This is the primary market type used throughout the application.
 *
 * The market represents a prediction market where users can buy/sell
 * outcome shares based on their beliefs about future events.
 */
export interface Market {
  /** Market ID (primary key) */
  id: string
  /** Market question/prediction */
  question: string
  /** Unique condition identifier from Polymarket */
  condition_id: string
  /** URL-friendly slug */
  slug: string
  /** Detailed description */
  description?: string | null
  /** Market end date */
  end_date?: string | null
  /** Market start date */
  start_date?: string | null
  /** Possible outcomes */
  outcomes?: any
  /** Trading volume */
  volume?: number | null
  /** Market liquidity */
  liquidity?: number | null
  /** Is market active */
  active: boolean
  /** Is market closed */
  closed: boolean
  /** Is market archived */
  archived?: boolean
  /** Market tags */
  tags?: any
  /** Market category */
  category?: string | null
  /** Market image URL */
  image_url?: string | null
  /** Creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
  /** Current YES price (derived from outcomes) - 0 to 1 */
  current_price?: number
  /** 24-hour price change percentage */
  price_change_24h?: number
  /** 24-hour trading volume */
  volume_24h?: number
}

/**
 * Re-exports from database.types for convenience
 */
export type { MarketOutcome, Tag } from './database.types'

// ============================================================================
// MARKET COMPONENT PROPS
// ============================================================================

/**
 * MarketCard Props
 *
 * Properties for the MarketCard display component
 */
export interface MarketCardProps {
  /** Market data to display */
  market: Market
  /** Display variant affecting layout and detail level */
  variant?: 'default' | 'compact' | 'detailed'
  /** Show current price information */
  showPrice?: boolean
  /** Show trading volume */
  showVolume?: boolean
  /** Show liquidity information */
  showLiquidity?: boolean
  /** Click handler for navigation/selection */
  onClick?: (market: Market) => void
  /** Additional CSS class names */
  className?: string
  /** Show thumbnail image */
  showImage?: boolean
  /** Enable progressive image loading */
  enableProgressiveImage?: boolean
  /** Image loading effect */
  imageLoadingEffect?: 'blur-up' | 'skeleton' | 'progressive'
}

/**
 * MarketList Props
 *
 * Properties for the MarketList container component
 */
export interface MarketListProps {
  /** Array of markets to display */
  markets: Market[]
  /** Loading state indicator */
  loading?: boolean
  /** Error message to display */
  error?: string
  /** Refresh callback for manual reload */
  onRefresh?: () => void
  /** Card display variant */
  variant?: MarketCardProps['variant']
  /** Number of columns in grid layout */
  columns?: 1 | 2 | 3 | 4
}

/**
 * MarketDetail Props
 *
 * Properties for the MarketDetail full view component
 */
export interface MarketDetailProps {
  /** Market to display in detail */
  market: Market
  /** Loading state */
  loading?: boolean
  /** Error state */
  error?: string
  /** Show price chart */
  showChart?: boolean
  /** Show order book */
  showOrderBook?: boolean
  /** Callback for trading actions */
  onTrade?: (outcome: string, side: 'buy' | 'sell') => void
}

// ============================================================================
// FILTER AND SORT TYPES
// ============================================================================

/**
 * Market Filter Options
 *
 * Available filters for market list queries
 */
export interface MarketFilterOptions {
  /** Filter for active markets only */
  active?: boolean
  /** Filter for closed markets */
  closed?: boolean
  /** Filter by category slugs */
  categories?: string[]
  /** Filter by tag slugs */
  tags?: string[]
  /** Filter by Gamma API tag_slug (for API-level filtering) */
  tag_slug?: string
  /** Minimum liquidity threshold */
  minLiquidity?: number
  /** Maximum liquidity threshold */
  maxLiquidity?: number
  /** Minimum volume threshold */
  minVolume?: number
  /** Maximum volume threshold */
  maxVolume?: number
  /** Price range filter [min, max] - 0 to 1 */
  priceRange?: [number, number]
  /** Filter for markets closing within 24 hours */
  closingSoon?: boolean
  /** Filter for high-volume (hot) markets */
  hot?: boolean
  /** Filter by market status */
  status?: MarketStatus
  /** Search query for text filtering */
  searchQuery?: string
}

/**
 * Market Status
 *
 * Current state of a market
 */
export enum MarketStatus {
  /** Market is open for trading */
  ACTIVE = 'active',
  /** Market has closed, awaiting resolution */
  CLOSED = 'closed',
  /** Market has been resolved */
  RESOLVED = 'resolved',
  /** Market is archived/not visible */
  ARCHIVED = 'archived'
}

/**
 * Market Sort Field
 *
 * Available fields for sorting market lists
 */
export enum MarketSortField {
  /** Sort by end date (closest first) */
  END_DATE = 'endDate',
  /** Sort by trading volume */
  VOLUME = 'volume',
  /** Sort by available liquidity */
  LIQUIDITY = 'liquidity',
  /** Sort by current price */
  PRICE = 'price',
  /** Sort by creation date */
  CREATED = 'created_at',
  /** Sort by 24h price change */
  PRICE_CHANGE_24H = 'price_change_24h'
}

/**
 * Market Sort Direction
 *
 * Sort order options
 */
export enum MarketSortDirection {
  /** Ascending order (A-Z, low to high) */
  ASC = 'asc',
  /** Descending order (Z-A, high to low) */
  DESC = 'desc'
}

/**
 * Market Sort Option
 *
 * Combined sort field and direction
 */
export interface MarketSortOption {
  /** Field to sort by */
  field: MarketSortField
  /** Sort direction */
  direction: MarketSortDirection
}

/**
 * Market Search Params
 *
 * Parameters for text-based market search
 */
export interface MarketSearchParams {
  /** Search query string */
  query: string
  /** Maximum results to return */
  limit?: number
  /** Search in question text */
  searchQuestion?: boolean
  /** Search in description */
  searchDescription?: boolean
  /** Search in tags */
  searchTags?: boolean
}

// ============================================================================
// MARKET VIEW TYPES
// ============================================================================

/**
 * Market View Mode
 *
 * Different ways to view market lists
 */
export enum MarketViewMode {
  /** Card grid view */
  GRID = 'grid',
  /** Table/list view */
  LIST = 'list',
  /** Compact table view */
  COMPACT = 'compact'
}

/**
 * Market Time Range
 *
 * Time range filters for price history and statistics
 */
export enum MarketTimeRange {
  /** Last 24 hours */
  HOUR_24 = '24h',
  /** Last 7 days */
  DAY_7 = '7d',
  /** Last 30 days */
  DAY_30 = '30d',
  /** Last 90 days */
  DAY_90 = '90d',
  /** All available data */
  ALL = 'all'
}

// ============================================================================
// MARKET TRADING TYPES
// ============================================================================

/**
 * Market Trade Side
 *
 * Buy or sell direction for a trade
 */
export enum TradeSide {
  /** Buying shares (long position) */
  BUY = 'buy',
  /** Selling shares (closing position) */
  SELL = 'sell'
}

/**
 * Market Order Type
 *
 * Type of order execution
 */
export enum OrderType {
  /** Market order (immediate execution at current price) */
  MARKET = 'market',
  /** Limit order (execute at specified price or better) */
  LIMIT = 'limit'
}

/**
 * Trade Input
 *
 * Input parameters for placing a trade
 */
export interface TradeInput {
  /** Market ID to trade on */
  marketId: string
  /** Outcome to trade ("Yes" | "No") */
  outcome: string
  /** Buy or sell */
  side: TradeSide
  /** Order type */
  orderType: OrderType
  /** Price per share (0-1, required for limit orders) */
  price?: number
  /** Number of shares to trade */
  size: number
  /** Maximum slippage tolerance (for market orders) */
  slippageTolerance?: number
}

/**
 * Trade Confirmation
 *
 * Details of a completed trade
 */
export interface TradeConfirmation {
  /** Unique trade ID */
  id: string
  /** Market ID */
  marketId: string
  /** Outcome traded */
  outcome: string
  /** Buy or sell */
  side: TradeSide
  /** Execution price */
  price: number
  /** Number of shares */
  size: number
  /** Total value (price * size) */
  totalValue: number
  /** Fee amount */
  fee: number
  /** Timestamp of execution */
  timestamp: string
}

// ============================================================================
// MARKET ANALYTICS TYPES
// ============================================================================

/**
 * Market Price History
 *
 * Historical price data for a market
 */
export interface MarketPriceHistory {
  /** Market ID */
  marketId: string
  /** Price data points */
  data: PriceDataPoint[]
}

/**
 * Price Data Point
 *
 * Single point in price history
 */
export interface PriceDataPoint {
  /** ISO timestamp */
  timestamp: string
  /** YES price at this point */
  priceYes: number
  /** NO price at this point */
  priceNo: number
  /** Volume at this point */
  volume?: number
}

/**
 * Market Statistics
 *
 * Aggregated statistics for a market
 */
export interface MarketStats {
  /** Market ID */
  marketId: string
  /** 24-hour volume */
  volume24h: number
  /** 24-hour price change */
  priceChange24h: number
  /** Current liquidity */
  liquidity: number
  /** Total trades */
  totalTrades: number
  /** Unique traders */
  uniqueTraders: number
  /** All-time high price */
  ath?: number
  /** All-time low price */
  atl?: number
}

// ============================================================================
// MARKET NOTIFICATION TYPES
// ============================================================================

/**
 * Market Notification Type
 *
 * Types of notifications related to markets
 */
export enum MarketNotificationType {
  /** Price alert triggered */
  PRICE_ALERT = 'price_alert',
  /** Market closing soon */
  CLOSING_SOON = 'closing_soon',
  /** Market resolved */
  MARKET_RESOLVED = 'market_resolved',
  /** New market in watched category */
  NEW_MARKET = 'new_market',
  /** Large price movement */
  PRICE_MOVEMENT = 'price_movement'
}

/**
 * Market Notification
 *
 * Notification data for market events
 */
export interface MarketNotification {
  /** Unique notification ID */
  id: string
  /** Notification type */
  type: MarketNotificationType
  /** Related market ID */
  marketId: string
  /** Notification title */
  title: string
  /** Notification message */
  message: string
  /** Whether notification was read */
  read: boolean
  /** Timestamp */
  timestamp: string
  /** Action URL (optional) */
  actionUrl?: string
}
