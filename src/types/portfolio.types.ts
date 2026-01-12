/**
 * Portfolio Types
 *
 * Type definitions for user portfolio management, positions,
 * profit/loss calculations, and portfolio analytics.
 */

import type { Market } from './market.types'

// ============================================================================
// POSITION TYPES
// ============================================================================

/**
 * Position
 *
 * Represents a user's holding in a specific market outcome.
 * A position is created when a user buys shares and remains
 * until those shares are sold or the market resolves.
 */
export interface Position {
  /** Unique position identifier */
  id: string
  /** User ID who owns this position */
  user_id: string
  /** Market ID for this position */
  market_id: string
  /** Full market data (joined from markets table) */
  market: Market
  /** Outcome being held ("Yes" | "No") */
  outcome: string
  /** Number of shares held */
  size: number
  /** Average entry price per share (0-1) */
  average_price: number
  /** Current market price per share (0-1), null if market closed */
  current_price: number | null
  /** Unrealized profit/loss in currency units */
  pnl: number | null
  /** Unrealized profit/loss as percentage */
  pnl_percentage: number | null
  /** Position creation timestamp */
  created_at: string
  /** Last update timestamp */
  updated_at: string
}

/**
 * Position Status
 *
 * Current state of a position
 */
export enum PositionStatus {
  /** Position is open and active */
  ACTIVE = 'active',
  /** Position has been closed (shares sold) */
  CLOSED = 'closed',
  /** Position is pending resolution */
  PENDING = 'pending',
  /** Position has been resolved */
  RESOLVED = 'resolved'
}

/**
 * Position Details
 *
 * Extended position information with additional computed fields
 */
export interface PositionDetails extends Position {
  /** Position status */
  status: PositionStatus
  /** Total invested amount (size * average_price) */
  total_invested: number
  /** Current position value (size * current_price) */
  current_value: number
  /** Realized profit/loss (from closed trades) */
  realized_pnl: number
  /** Unrealized profit/loss (from open position) */
  unrealized_pnl: number
  /** Breakeven price */
  breakeven_price: number
  /** Time held in milliseconds */
  time_held: number
}

// ============================================================================
// PORTFOLIO TYPES
// ============================================================================

/**
 * Portfolio
 *
 * Complete portfolio containing all user positions and aggregated metrics
 */
export interface Portfolio {
  /** All user positions (open and closed) */
  positions: Position[]
  /** Total current value of all positions */
  total_value: number
  /** Total amount invested across all positions */
  total_invested: number
  /** Total profit/loss (realized + unrealized) */
  total_pnl: number
  /** Total profit/loss as percentage */
  total_pnl_percentage: number
  /** Number of active positions */
  position_count: number
}

/**
 * Portfolio Summary
 *
 * High-level portfolio metrics and statistics
 */
export interface PortfolioSummary {
  /** Total current value of all holdings */
  totalValue: number
  /** Total amount originally invested */
  totalInvested: number
  /** Combined profit/loss */
  totalPnl: number
  /** PnL as percentage of invested amount */
  totalPnlPercentage: number
  /** Number of active positions */
  activePositions: number
  /** Number of closed positions */
  closedPositions: number
  /** Best performing position (highest PnL) */
  bestPosition: Position | null
  /** Worst performing position (lowest PnL) */
  worstPosition: Position | null
  /** Win rate (percentage of profitable positions) */
  winRate?: number
}

/**
 * Portfolio Analytics
 *
 * Detailed analytics for portfolio performance
 */
export interface PortfolioAnalytics {
  /** Total return over time period */
  totalReturn: number
  /** Annualized return rate */
  annualizedReturn: number
  /** Sharpe ratio (risk-adjusted return) */
  sharpeRatio?: number
  /** Maximum drawdown */
  maxDrawdown: number
  /** Average holding period in days */
  avgHoldingPeriod: number
  /** Profit factor (gross profit / gross loss) */
  profitFactor?: number
  /** Total fees paid */
  totalFees: number
  /** Return distribution by outcome */
  returnByOutcome: Record<string, number>
}

/**
 * Portfolio History Point
 *
 * Historical portfolio value at a point in time
 */
export interface PortfolioHistoryPoint {
  /** Timestamp */
  timestamp: string
  /** Portfolio value at this point */
  value: number
  /** Cumulative PnL at this point */
  pnl: number
  /** Number of positions at this point */
  positionCount: number
}

/**
 * Portfolio Performance
 *
 * Performance metrics over different time periods
 */
export interface PortfolioPerformance {
  /** Performance today */
  today: number
  /** Performance this week */
  week: number
  /** Performance this month */
  month: number
  /** Performance this year */
  year: number
  /** All-time performance */
  allTime: number
}

// ============================================================================
// PNL CALCULATION TYPES
// ============================================================================

/**
 * PnL Calculation Type
 *
 * Method for calculating profit/loss
 */
export enum PnLCalculation {
  /** Realized PnL from closed positions */
  REALIZED = 'realized',
  /** Unrealized PnL from open positions */
  UNREALIZED = 'unrealized',
  /** Total PnL (realized + unrealized) */
  TOTAL = 'total'
}

/**
 * PnL Breakdown
 *
 * Detailed profit/loss breakdown by category
 */
export interface PnLBreakdown {
  /** Total PnL */
  total: number
  /** Realized PnL */
  realized: number
  /** Unrealized PnL */
  unrealized: number
  /** By market category */
  byCategory: Record<string, number>
  /** By outcome type (Yes/No) */
  byOutcome: Record<string, number>
  /** By time period */
  byPeriod: {
    today: number
    week: number
    month: number
    year: number
  }
}

/**
 * Trade Result
 *
 * Result of a completed trade affecting portfolio
 */
export interface TradeResult {
  /** Trade ID */
  id: string
  /** Position affected */
  positionId: string
  /** Trade side (buy/sell) */
  side: 'buy' | 'sell'
  /** Price executed */
  price: number
  /** Shares traded */
  size: number
  /** Realized PnL from this trade */
  realizedPnl: number
  /** Fee paid */
  fee: number
  /** Trade timestamp */
  timestamp: string
}

// ============================================================================
// POSITION FILTERS
// ============================================================================

/**
 * Position Filters
 *
 * Available filters for querying positions
 */
export interface PositionFilters {
  /** Filter by position status */
  status?: PositionStatus
  /** Filter by outcome (Yes/No) */
  outcome?: string
  /** Filter by market category */
  category?: string
  /** Minimum PnL threshold */
  minPnl?: number
  /** Maximum PnL threshold */
  maxPnl?: number
  /** Filter by market (active/closed) */
  marketStatus?: 'active' | 'closed'
  /** Filter by date range */
  dateRange?: {
    start?: string
    end?: string
  }
}

/**
 * Position Sort Options
 *
 * Available sorting for position lists
 */
export interface PositionSortOptions {
  /** Field to sort by */
  field: 'created_at' | 'pnl' | 'pnl_percentage' | 'size' | 'current_price' | 'average_price' | 'outcome'
  /** Sort direction */
  direction: 'asc' | 'desc'
}

// ============================================================================
// PORTFOLIO ACTIONS
// ============================================================================

/**
 * Close Position Input
 *
 * Parameters for closing a position
 */
export interface ClosePositionInput {
  /** Position ID to close */
  positionId: string
  /** Number of shares to close (default: all) */
  size?: number
  /** Minimum acceptable price */
  minPrice?: number
}

/**
 * Close Position Result
 *
 * Result of closing a position
 */
export interface ClosePositionResult {
  /** Position ID */
  positionId: number
  /** Shares closed */
  sizeClosed: number
  /** Execution price */
  price: number
  /** Realized PnL from closing */
  realizedPnl: number
  /** Remaining open size */
  remainingSize: number
  /** Transaction hash */
  txHash?: string
}

/**
 * Rebalance Options
 *
 * Options for portfolio rebalancing
 */
export interface RebalanceOptions {
  /** Target allocation by market category */
  targetAllocation: Record<string, number>
  /** Maximum trade size as percentage of portfolio */
  maxTradeSize?: number
  /** Minimum position size to consider */
  minPositionSize?: number
  /** Whether to execute trades or just preview */
  dryRun?: boolean
}

/**
 * Rebalance Result
 *
 * Result of portfolio rebalancing operation
 */
export interface RebalanceResult {
  /** Proposed trades */
  trades: Array<{
    marketId: string
    outcome: string
    side: 'buy' | 'sell'
    size: number
  }>
  /** Expected portfolio value after rebalancing */
  expectedValue: number
  /** Current portfolio value */
  currentValue: number
  /** Expected change in value */
  expectedChange: number
}

// ============================================================================
// PORTFOLIO EXPORT TYPES
// ============================================================================

/**
 * Portfolio Export Format
 *
 * Supported formats for exporting portfolio data
 */
export enum PortfolioExportFormat {
  /** CSV format */
  CSV = 'csv',
  /** JSON format */
  JSON = 'json',
  /** PDF format */
  PDF = 'pdf'
}

/**
 * Portfolio Export Options
 *
 * Options for exporting portfolio data
 */
export interface PortfolioExportOptions {
  /** Export format */
  format: PortfolioExportFormat
  /** Include closed positions */
  includeClosed?: boolean
  /** Date range filter */
  dateRange?: {
    start: string
    end: string
  }
  /** Include trade history */
  includeTradeHistory?: boolean
  /** Include analytics */
  includeAnalytics?: boolean
}
