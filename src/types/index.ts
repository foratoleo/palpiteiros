/**
 * Type Definitions Index
 *
 * Central export point for all application types.
 * Import from this file for cleaner imports throughout the application.
 *
 * @example
 * ```ts
 * import type { Market, Portfolio, Position } from '@/types'
 * ```
 */

// ============================================================================
// DATABASE TYPES (from Supabase schema)
// ============================================================================

export type {
  Database,
  // Market is exported from market.types.ts to avoid conflicts
  MarketOutcome,
  MarketPrice,
  UserPortfolio,
  UserPreferences,
  Tag
} from './database.types'

export type {
  MarketInsert,
  MarketPriceInsert,
  UserPortfolioInsert,
  UserPreferencesInsert
} from './database.types'

export type {
  MarketUpdate,
  MarketPriceUpdate,
  UserPortfolioUpdate,
  UserPreferencesUpdate
} from './database.types'

export type { Tables, TablesInsert, TablesUpdate } from './database.types'

// ============================================================================
// GAMMA API TYPES
// ============================================================================

export type {
  GammaMarket,
  GammaOutcome,
  GammaTag,
  OrderBook,
  LastTrade,
  GammaMarketsQuery,
  GammaApiResponse,
  GammaEvent,
  PriceHistoryPoint,
  MarketStatistics,
  GammaApiError
} from './gamma.types'

// ============================================================================
// MARKET TYPES
// ============================================================================

export type {
  Market,
  MarketCardProps,
  MarketListProps,
  MarketDetailProps,
  MarketFilterOptions,
  MarketSortOption,
  MarketSearchParams,
  TradeInput,
  TradeConfirmation,
  MarketPriceHistory,
  PriceDataPoint,
  MarketStats,
  MarketNotification
} from './market.types'

export {
  MarketStatus,
  MarketSortField,
  MarketSortDirection,
  MarketViewMode,
  MarketTimeRange,
  TradeSide,
  OrderType,
  MarketNotificationType
} from './market.types'

// ============================================================================
// BREAKING MARKET TYPES
// ============================================================================

export type {
  BreakingMarket,
  BreakingFilters,
  BreakingSortOption,
  BreakingMarketResponse,
  BreakingMarketsQuery,
  SyncPriceHistoryOptions,
  SyncPriceHistoryResult,
  BreakingMarketAlert,
  BreakingMarketStats
} from './breaking.types'

export {
  BreakingAlertType
} from './breaking.types'

// ============================================================================
// TWITTER/X TYPES
// ============================================================================

export type {
  TwitterTweet,
  TwitterUrlEntity,
  TwitterUrlImage,
  TwitterMentionEntity,
  TwitterHashtagEntity,
  TwitterCashtagEntity,
  TwitterReferencedTweet,
  TwitterPublicMetrics,
  TwitterMedia,
  TwitterMediaVariant,
  TwitterUser,
  TwitterUserMetrics,
  TwitterApiError,
  TwitterApiResponse,
  TwitterTweetsTimelineResponse,
  TwitterUserLookupResponse,
  EnrichedTweet,
  TweetCategory,
  TwitterConnectionStatus,
  TwitterFeedState,
  TwitterFeedOptions,
  GetPolymarketTweetsRequest,
  GetPolymarketTweetsResponse
} from './twitter.types'

export {
  TwitterApiErrorCode
} from './twitter.types'

// ============================================================================
// PORTFOLIO TYPES
// ============================================================================

export type {
  Position,
  PositionDetails,
  Portfolio,
  PortfolioSummary,
  PortfolioAnalytics,
  PortfolioHistoryPoint,
  PortfolioPerformance,
  PnLBreakdown,
  TradeResult,
  ClosePositionInput,
  ClosePositionResult,
  RebalanceOptions,
  RebalanceResult,
  PositionFilters,
  PositionSortOptions
} from './portfolio.types'

export {
  PositionStatus,
  PnLCalculation,
  PortfolioExportFormat
} from './portfolio.types'

// ============================================================================
// ALERT TYPES
// ============================================================================

export type {
  PriceAlert,
  AlertTrigger,
  AlertHistory,
  AlertNotification,
  NotificationChannel,
  NotificationPreferences,
  CreateAlertInput,
  UpdateAlertInput,
  AlertFilters,
  AlertSortOptions,
  AlertGroup,
  BulkAlertAction,
  AlertTemplate,
  AlertStatistics,
  MarketAlertSummary
} from './alert.types'

export {
  AlertCondition,
  AlertPriority,
  AlertStatus,
  AlertNotificationType,
  QuickAlertPreset
} from './alert.types'

// ============================================================================
// UI TYPES
// ============================================================================

export type {
  Theme,
  ThemeConfig,
  ColorScheme,
  Toast,
  ToastAction,
  ToastOptions,
  LoadingState,
  LoadingStatus,
  AsyncState,
  SkeletonProps,
  ModalState,
  ModalSize,
  ModalConfig,
  ModalProps,
  PaginationState,
  PaginationProps,
  PaginationMeta,
  TransitionConfig,
  VariantProps,
  AnimationVariants,
  PresenceProps,
  Breakpoint,
  BreakpointValues,
  ViewportState,
  ResponsiveValue,
  MediaQueryMatches,
  FormFieldState,
  FormState,
  FormFieldProps,
  SelectOption,
  SelectProps,
  ColumnDef,
  TableSortState,
  TableProps
} from './ui.types'

export type {
  ToastPosition,
  ToastVariant,
  TransitionType
} from './ui.types'

// ============================================================================
// LEGACY TYPES (for backwards compatibility)
// ============================================================================

/**
 * @deprecated Use Market from database.types instead
 */
export interface LegacyMarket {
  id: string;
  question: string;
  description?: string;
  slug: string;
  outcomes: string[];
  tags: string[];
  endTime: string;
  liquidity?: number;
  volume?: number;
  probability?: number;
  status: "active" | "closed" | "pending";
  createdAt: string;
  updatedAt: string;
}

/**
 * @deprecated Use UserPortfolio from database.types instead
 */
export interface LegacyOrder {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  type: "buy" | "sell";
  price: number;
  size: number;
  status: "pending" | "filled" | "cancelled";
  createdAt: string;
}

/**
 * Order type for trading operations
 */
export interface Order {
  id: string;
  market_id: string;
  user_id: string;
  outcome: string;
  type: "buy" | "sell";
  price: number;
  size: number;
  status: "pending" | "filled" | "cancelled";
  created_at: string;
  updated_at?: string;
}

/**
 * @deprecated Use Position from portfolio.types instead
 */
export interface LegacyPosition {
  id: string;
  marketId: string;
  userId: string;
  outcome: string;
  size: number;
  avgPrice: number;
  unrealizedPnl: number;
  realizedPnl: number;
}

/**
 * @deprecated User type is not in the current schema
 */
export interface User {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  balance: number;
  createdAt: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// SHARED TYPES
// ============================================================================

/**
 * Common entity with timestamps
 */
export interface Timestamped {
  created_at: string;
  updated_at?: string;
}

/**
 * Entity with ID
 */
export interface WithId<T = string> {
  id: T;
}

/**
 * Range filter
 */
export interface RangeFilter {
  min?: number;
  max?: number;
}

/**
 * Date range filter
 */
export interface DateRangeFilter {
  start?: string | Date;
  end?: string | Date;
}
