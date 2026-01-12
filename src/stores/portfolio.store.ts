/**
 * Portfolio Store
 *
 * Zustand store for user portfolio and position management.
 * Handles position tracking, PnL calculations, and portfolio analytics.
 *
 * @features
 * - Position management (add, update, close)
 * - Real-time PnL calculations
 * - Portfolio summary with aggregated metrics
 * - Position filtering and sorting
 * - Trade history tracking
 *
 * @example
 * ```ts
 * const { positions, summary, addPosition, closePosition } = usePortfolioStore()
 * const openPositions = usePortfolioStore(selectOpenPositions)
 * ```
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Position,
  PortfolioSummary,
  PositionDetails,
  PositionFilters,
  PositionSortOptions,
  PnLBreakdown,
  TradeResult
} from '@/types/portfolio.types'
import { PositionStatus } from '@/types/portfolio.types'

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Portfolio Store State
 *
 * Complete state for portfolio management
 */
export interface PortfolioState {
  // Data
  /** All user positions */
  positions: Position[]
  /** Currently selected position */
  selectedPosition: Position | null
  /** Trade history */
  tradeHistory: TradeResult[]

  // Computed State
  /** Portfolio summary metrics */
  summary: PortfolioSummary | null
  /** PnL breakdown by category */
  pnlBreakdown: PnLBreakdown | null

  // Filters
  /** Active position filters */
  filters: PositionFilters
  /** Current sort option */
  sortOption: PositionSortOptions

  // UI State
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Last data refresh timestamp */
  lastRefresh: number | null
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Default position filters
 */
const defaultFilters: PositionFilters = {
  status: undefined,
  outcome: undefined,
  category: undefined,
  minPnl: undefined,
  maxPnl: undefined,
  marketStatus: undefined,
  dateRange: undefined
}

/**
 * Default sort option
 */
const defaultSortOption: PositionSortOptions = {
  field: 'created_at',
  direction: 'desc'
}

/**
 * Initial portfolio store state
 */
const initialState: PortfolioState = {
  positions: [],
  selectedPosition: null,
  tradeHistory: [],

  summary: null,
  pnlBreakdown: null,

  filters: defaultFilters,
  sortOption: defaultSortOption,

  loading: false,
  error: null,
  lastRefresh: null
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Portfolio Store Actions
 *
 * All actions available in the portfolio store
 */
export interface PortfolioActions {
  // Data Actions

  /**
   * Set all positions
   * @param positions - Array of positions to set
   */
  setPositions: (positions: Position[]) => void

  /**
   * Add a new position
   * @param position - Position to add
   */
  addPosition: (position: Position) => void

  /**
   * Update an existing position
   * @param positionId - Position ID to update
   * @param updates - Fields to update
   */
  updatePosition: (positionId: string, updates: Partial<Position>) => void

  /**
   * Close a position (fully or partially)
   * @param positionId - Position ID to close
   * @param size - Amount to close (undefined = full close)
   * @param price - Exit price
   * @returns Trade result with realized PnL
   */
  closePosition: (positionId: string, size?: number, price?: number) => TradeResult | null

  /**
   * Remove a position
   * @param positionId - Position ID to remove
   */
  removePosition: (positionId: string) => void

  /**
   * Set selected position
   * @param position - Position to select or null to deselect
   */
  setSelectedPosition: (position: Position | null) => void

  /**
   * Add trade to history
   * @param trade - Trade result to add
   */
  addTrade: (trade: TradeResult) => void

  /**
   * Load positions from database
   * @param userId - User ID to load positions for
   */
  loadPositions: (userId: string) => Promise<void>

  // Filter & Sort Actions

  /**
   * Set position filters
   * @param filters - New filter options (partial)
   */
  setFilters: (filters: Partial<PositionFilters>) => void

  /**
   * Reset all filters to defaults
   */
  resetFilters: () => void

  /**
   * Set sort option
   * @param field - Sort field
   * @param direction - Sort direction
   */
  setSort: (field: PositionSortOptions['field'], direction?: 'asc' | 'desc') => void

  // Computed State Actions

  /**
   * Recalculate portfolio summary
   */
  calculateSummary: () => void

  /**
   * Recalculate PnL breakdown
   */
  calculatePnLBreakdown: () => void

  // Loading State Actions

  /**
   * Set loading state
   * @param loading - Loading status
   */
  setLoading: (loading: boolean) => void

  /**
   * Set error state
   * @param error - Error message or null
   */
  setError: (error: string | null) => void

  /**
   * Reset state to initial values
   */
  reset: () => void
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate position details with computed fields
 * @param position - Base position data
 * @returns Position with computed details
 */
function calculatePositionDetails(position: Position): PositionDetails {
  const totalInvested = position.size * position.average_price
  const currentValue = position.current_price
    ? position.size * position.current_price
    : totalInvested

  const unrealizedPnl = position.current_price
    ? (position.current_price - position.average_price) * position.size
    : 0

  const realizedPnl = position.pnl || 0

  const pnlPercentage = totalInvested > 0
    ? ((currentValue - totalInvested) / totalInvested) * 100
    : 0

  const timeHeld = Date.now() - new Date(position.created_at).getTime()

  return {
    ...position,
    status: position.size > 0 ? PositionStatus.ACTIVE : PositionStatus.CLOSED,
    total_invested: totalInvested,
    current_value: currentValue,
    realized_pnl: realizedPnl,
    unrealized_pnl: unrealizedPnl,
    breakeven_price: position.average_price,
    time_held: timeHeld
  }
}

/**
 * Calculate portfolio summary from positions
 * @param positions - All positions
 * @returns Portfolio summary metrics
 */
function calculatePortfolioSummary(positions: Position[]): PortfolioSummary {
  const activePositions = positions.filter((p) => p.size > 0)
  const closedPositions = positions.filter((p) => p.size === 0)

  let totalValue = 0
  let totalInvested = 0
  let totalPnl = 0
  let bestPosition: Position | null = null
  let worstPosition: Position | null = null

  activePositions.forEach((position) => {
    const details = calculatePositionDetails(position)
    totalValue += details.current_value
    totalInvested += details.total_invested
    totalPnl += details.unrealized_pnl

    if (!bestPosition || details.unrealized_pnl > (bestPosition.pnl || 0)) {
      bestPosition = position
    }

    if (!worstPosition || details.unrealized_pnl < (worstPosition.pnl || 0)) {
      worstPosition = position
    }
  })

  // Add realized PnL from closed positions
  closedPositions.forEach((position) => {
    totalPnl += position.pnl || 0
  })

  const totalPnlPercentage = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0

  // Calculate win rate
  const profitablePositions = closedPositions.filter((p) => (p.pnl || 0) > 0).length
  const winRate = closedPositions.length > 0
    ? (profitablePositions / closedPositions.length) * 100
    : undefined

  return {
    totalValue,
    totalInvested,
    totalPnl,
    totalPnlPercentage,
    activePositions: activePositions.length,
    closedPositions: closedPositions.length,
    bestPosition,
    worstPosition,
    winRate
  }
}

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * Portfolio Store
 *
 * Main portfolio state management store with:
 * - DevTools integration for debugging
 * - Immer middleware for immutable updates
 * - Computed state for PnL calculations
 */
export const usePortfolioStore = create<PortfolioState & PortfolioActions>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Data Actions
      setPositions: (positions) =>
        set((state) => {
          state.positions = positions
          state.lastRefresh = Date.now()
          state.summary = calculatePortfolioSummary(positions)
        }),

      addPosition: (position) =>
        set((state) => {
          state.positions.push(position)
          state.summary = calculatePortfolioSummary(state.positions)
        }),

      updatePosition: (positionId, updates) =>
        set((state) => {
          const index = state.positions.findIndex((p) => p.id === positionId)
          if (index >= 0) {
            state.positions[index] = { ...state.positions[index], ...updates }
            state.summary = calculatePortfolioSummary(state.positions)
          }
        }),

      closePosition: (positionId, size, price) => {
        const position = get().positions.find((p) => p.id === positionId)
        if (!position) return null

        const closeSize = size ?? position.size
        const closePrice = price ?? position.current_price ?? position.average_price

        const realizedPnl = (closePrice - position.average_price) * closeSize

        const trade: TradeResult = {
          id: `trade-${Date.now()}`,
          positionId,
          side: 'sell',
          price: closePrice,
          size: closeSize,
          realizedPnl,
          fee: 0, // TODO: Calculate actual fee
          timestamp: new Date().toISOString()
        }

        set((state) => {
          const index = state.positions.findIndex((p) => p.id === positionId)
          if (index >= 0) {
            state.positions[index].size -= closeSize
            state.positions[index].pnl = (state.positions[index].pnl || 0) + realizedPnl

            if (state.positions[index].size === 0) {
              state.positions[index].current_price = null
            }

            state.summary = calculatePortfolioSummary(state.positions)
          }

          state.tradeHistory.push(trade)
        })

        return trade
      },

      removePosition: (positionId) =>
        set((state) => {
          state.positions = state.positions.filter((p) => p.id !== positionId)
          if (state.selectedPosition?.id === positionId) {
            state.selectedPosition = null
          }
          state.summary = calculatePortfolioSummary(state.positions)
        }),

      setSelectedPosition: (position) =>
        set((state) => {
          state.selectedPosition = position
        }),

      addTrade: (trade) =>
        set((state) => {
          state.tradeHistory.push(trade)
        }),

      loadPositions: async (userId) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          // TODO: Implement actual data loading from Supabase
          // const positions = await getUserPositions(userId)
          // set((state) => {
          //   state.positions = positions
          //   state.summary = calculatePortfolioSummary(positions)
          //   state.loading = false
          //   state.lastRefresh = Date.now()
          // })

          set((state) => {
            state.loading = false
            state.lastRefresh = Date.now()
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load positions'
            state.loading = false
          })
        }
      },

      // Filter & Sort Actions
      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters }
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = defaultFilters
        }),

      setSort: (field, direction) =>
        set((state) => {
          state.sortOption.field = field
          state.sortOption.direction = direction || 'asc'
        }),

      // Computed State Actions
      calculateSummary: () =>
        set((state) => {
          state.summary = calculatePortfolioSummary(state.positions)
        }),

      calculatePnLBreakdown: () =>
        set((state) => {
          const breakdown: PnLBreakdown = {
            total: 0,
            realized: 0,
            unrealized: 0,
            byCategory: {},
            byOutcome: {},
            byPeriod: {
              today: 0,
              week: 0,
              month: 0,
              year: 0
            }
          }

          state.positions.forEach((position) => {
            const details = calculatePositionDetails(position)
            const pnl = details.unrealized_pnl + details.realized_pnl
            breakdown.total += pnl
            breakdown.unrealized += details.unrealized_pnl
            breakdown.realized += details.realized_pnl

            // By category
            const category = position.market.category || 'uncategorized'
            breakdown.byCategory[category] = (breakdown.byCategory[category] || 0) + pnl

            // By outcome
            breakdown.byOutcome[position.outcome] = (breakdown.byOutcome[position.outcome] || 0) + pnl
          })

          state.pnlBreakdown = breakdown
        }),

      // Loading State Actions
      setLoading: (loading) =>
        set((state) => {
          state.loading = loading
        }),

      setError: (error) =>
        set((state) => {
          state.error = error
          state.loading = false
        }),

      reset: () =>
        set((state) => {
          Object.assign(state, initialState)
        })
      })),
      { name: 'PortfolioStore' }
    )
  )

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Select open positions (size > 0)
 * @returns Array of open positions with details
 */
export const selectOpenPositions = (state: PortfolioState & PortfolioActions): PositionDetails[] => {
  return state.positions
    .filter((p) => p.size > 0)
    .map(calculatePositionDetails)
}

/**
 * Select closed positions (size = 0)
 * @returns Array of closed positions
 */
export const selectClosedPositions = (state: PortfolioState & PortfolioActions): Position[] => {
  return state.positions.filter((p) => p.size === 0)
}

/**
 * Select filtered positions
 * @returns Filtered and sorted positions
 */
export const selectFilteredPositions = (state: PortfolioState & PortfolioActions): Position[] => {
  let filtered = [...state.positions]

  const { filters } = state

  if (filters.status) {
    filtered = filtered.filter((p) => {
      const details = calculatePositionDetails(p)
      return details.status === filters.status
    })
  }

  if (filters.outcome) {
    filtered = filtered.filter((p) => p.outcome === filters.outcome)
  }

  if (filters.category) {
    filtered = filtered.filter((p) => p.market.category === filters.category)
  }

  if (filters.minPnl !== undefined) {
    filtered = filtered.filter((p) => (p.pnl || 0) >= filters.minPnl!)
  }

  if (filters.maxPnl !== undefined) {
    filtered = filtered.filter((p) => (p.pnl || 0) <= filters.maxPnl!)
  }

  if (filters.marketStatus) {
    filtered = filtered.filter((p) =>
      filters.marketStatus === 'active' ? p.market.active : !p.market.active
    )
  }

  if (filters.dateRange) {
    const startDate = filters.dateRange.start ? new Date(filters.dateRange.start).getTime() : 0
    const endDate = filters.dateRange.end ? new Date(filters.dateRange.end).getTime() : Infinity

    filtered = filtered.filter((p) => {
      const createdAt = new Date(p.created_at).getTime()
      return createdAt >= startDate && createdAt <= endDate
    })
  }

  // Apply sorting
  const { field, direction } = state.sortOption
  const multiplier = direction === 'asc' ? 1 : -1

  filtered.sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'created_at':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case 'pnl':
        comparison = (a.pnl || 0) - (b.pnl || 0)
        break
      case 'pnl_percentage':
        const aPct = a.pnl_percentage || 0
        const bPct = b.pnl_percentage || 0
        comparison = aPct - bPct
        break
      case 'size':
        comparison = a.size - b.size
        break
      case 'current_price':
        comparison = (a.current_price || 0) - (b.current_price || 0)
        break
      default:
        comparison = 0
    }

    return comparison * multiplier
  })

  return filtered
}

/**
 * Select portfolio performance metrics
 * @returns Portfolio performance statistics
 */
export const selectPortfolioPerformance = (state: PortfolioState & PortfolioActions) => {
  return state.summary
}
