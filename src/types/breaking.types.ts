/**
 * Breaking Markets Types
 *
 * Type definitions for the breaking markets feature.
 * Breaking markets are those with significant price movements,
 * volume changes, or volatility within a specified time range.
 */

import type { Market } from './market.types';

// ============================================================================
// BREAKING MARKET TYPES
// ============================================================================

/**
 * Price Data Point from market_price_history table
 *
 * Historical price snapshot for a market
 */
export interface PriceHistoryPoint {
  /** Database ID */
  id?: string;
  /** Market ID reference */
  market_id?: string;
  /** Condition ID from Polymarket */
  condition_id: string;
  /** YES price at timestamp (0-1) */
  price_yes: number;
  /** NO price at timestamp (0-1) */
  price_no: number;
  /** Trading volume at timestamp */
  volume: number | null;
  /** Available liquidity at timestamp */
  liquidity: number | null;
  /** ISO 8601 timestamp of the price record */
  timestamp: string;
}

/**
 * Breaking Market
 *
 * A market with significant price movement or activity.
 * Extends the base Market type with breaking-specific computed fields.
 */
export interface BreakingMarket extends Market {
  /** Rank in breaking markets list (1 = highest movement) */
  rank: number;
  /**
   * Movement score (0-1)
   * Composite score based on price change, volume change, and volatility
   */
  movement_score: number;
  /**
   * Price change over 24 hours (-1 to 1)
   * Positive = price increased, Negative = price decreased
   */
  price_change_24h: number;
  /**
   * Volume change over 24 hours (-1 to 1)
   * Positive = volume increased, Negative = volume decreased
   */
  volume_change_24h: number;
  /**
   * Highest YES price in the last 24 hours (0-1)
   */
  price_high_24h: number;
  /**
   * Lowest YES price in the last 24 hours (0-1)
   */
  price_low_24h: number;
  /**
   * Volatility index (0-1)
   * Higher values indicate more price fluctuation
   */
  volatility_index: number;
  /**
   * Trend direction
   * Determined by price change direction
   */
  trend: 'up' | 'down' | 'neutral';
  /**
   * Price history data points for the specified time range
   * Up to 100 data points depending on time range
   * May be undefined if price history hasn't been synced yet
   */
  price_history_24h?: PriceHistoryPoint[];
}

/**
 * Breaking Market Filter Options
 *
 * Filters for querying breaking markets
 */
export interface BreakingFilters {
  /**
   * Minimum price change threshold (0-1)
   * Example: 0.10 = only show markets with >10% price change
   */
  minPriceChange?: number;
  /**
   * Maximum price change threshold (0-1)
   * Example: 0.50 = only show markets with <50% price change
   */
  maxPriceChange?: number;
  /**
   * Minimum trading volume threshold
   */
  minVolume?: number;
  /**
   * Filter by market categories
   */
  categories?: string[];
  /**
   * Time range for price history analysis
   */
  timeRange?: '1h' | '24h' | '7d' | '30d';
  /**
   * Minimum movement score (0-1)
   */
  minMovementScore?: number;
  /**
   * Filter by trend direction
   */
  trend?: 'up' | 'down' | 'neutral';
}

/**
 * Breaking Market Sort Options
 *
 * Sorting options for breaking markets
 */
export interface BreakingSortOption {
  /** Field to sort by */
  field: 'movement_score' | 'price_change_24h' | 'volume_change_24h' | 'volatility_index' | 'rank';
  /** Sort direction */
  direction: 'asc' | 'desc';
}

/**
 * Breaking Markets API Response
 *
 * Standard response structure for breaking markets API
 */
export interface BreakingMarketResponse {
  /** Whether the request was successful */
  success: boolean;
  /** Array of breaking markets */
  data: BreakingMarket[];
  /** Total number of results */
  count: number;
  /** ISO 8601 timestamp of the data */
  timestamp: string;
  /** Whether the response was served from cache */
  cached?: boolean;
  /** Error message if request failed */
  error?: string;
}

/**
 * Breaking Markets Query Parameters
 *
 * Parameters for fetching breaking markets
 */
export interface BreakingMarketsQuery {
  /** Maximum number of results (default: 20, max: 100) */
  limit?: number;
  /** Minimum price change threshold (default: 0.05 = 5%) */
  min_price_change?: number;
  /** Time range in hours for analysis (default: 24, max: 168) */
  time_range_hours?: number;
}

/**
 * Sync Price History Options
 *
 * Options for the sync-price-history Edge Function
 */
export interface SyncPriceHistoryOptions {
  /** Optional market ID to sync a single market */
  marketId?: string;
  /** Batch size for inserts (default: 100) */
  batchSize?: number;
}

/**
 * Sync Price History Result
 *
 * Response from the sync-price-history Edge Function
 */
export interface SyncPriceHistoryResult {
  /** Whether the sync was successful */
  success: boolean;
  /** Number of records synced successfully */
  synced: number;
  /** Number of records that failed to sync */
  failed: number;
  /** Human-readable message */
  message: string;
  /** ISO 8601 timestamp of the sync */
  timestamp: string;
}

// ============================================================================
// BREAKING MARKET NOTIFICATION TYPES
// ============================================================================

/**
 * Breaking Market Alert Type
 *
 * Types of alerts for breaking market events
 */
export enum BreakingAlertType {
  /** Significant price increase */
  PRICE_SURGE = 'price_surge',
  /** Significant price decrease */
  PRICE_DROP = 'price_drop',
  /** High volatility detected */
  HIGH_VOLATILITY = 'high_volatility',
  /** Unusual volume spike */
  VOLUME_SPIKE = 'volume_spike',
  /** Market enters top breaking list */
  TOP_BREAKING = 'top_breaking',
}

/**
 * Breaking Market Alert
 *
 * Alert notification for breaking market events
 */
export interface BreakingMarketAlert {
  /** Unique alert ID */
  id: string;
  /** Type of breaking alert */
  type: BreakingAlertType;
  /** Market that triggered the alert */
  marketId: string;
  /** Market question/title */
  marketQuestion: string;
  /** Current price */
  currentPrice: number;
  /** Previous price (for comparison) */
  previousPrice: number;
  /** Price change percentage */
  priceChange: number;
  /** Alert severity */
  severity: 'low' | 'medium' | 'high';
  /** ISO 8601 timestamp when alert was created */
  createdAt: string;
  /** Whether alert has been acknowledged */
  acknowledged: boolean;
  /** Optional message with additional context */
  message?: string;
}

// ============================================================================
// BREAKING MARKET STATISTICS
// ============================================================================

/**
 * Breaking Market Statistics
 *
 * Aggregated statistics for breaking markets
 */
export interface BreakingMarketStats {
  /** Total number of breaking markets */
  totalBreakingMarkets: number;
  /** Average price change across all breaking markets */
  avgPriceChange: number;
  /** Number of markets with upward trend */
  upwardTrendCount: number;
  /** Number of markets with downward trend */
  downwardTrendCount: number;
  /** Number of neutral markets */
  neutralTrendCount: number;
  /** Highest volatility index among breaking markets */
  maxVolatility: number;
  /** Average movement score */
  avgMovementScore: number;
  /** Markets with highest movement score */
  topMovers: Array<{
    marketId: string;
    question: string;
    movementScore: number;
    priceChange: number;
  }>;
}

// ============================================================================
// EXPORTS
// ============================================================================

// All types are exported inline above - no additional exports needed