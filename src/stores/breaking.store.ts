/**
 * Breaking Store
 *
 * Zustand store for breaking markets state management including filters,
 * sorting, view modes, and market data caching.
 *
 * @features
 * - Breaking markets list with real-time updates
 * - Advanced filtering (price change, volume, categories, time range)
 * - Multiple sort options (movement score, price change, volatility)
 * - View mode switching (grid/list)
 * - Optimistic updates with market cache
 * - Real-time subscription management
 * - Optimized selectors for derived state
 *
 * @example
 * ```ts
 * const { marketsCache, filters, setFilters, setSortOption } = useBreakingStore()
 * const filteredMarkets = useBreakingStore(selectFilteredMarkets)
 * ```
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  BreakingMarket,
  BreakingFilters,
  BreakingSortOption
} from '@/types/breaking.types'

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Breaking Store State
 *
 * Complete state for breaking markets management
 */
export interface BreakingState {
  // Filters
  /** Active filter options */
  filters: BreakingFilters
  /** Current sort option */
  sortOption: BreakingSortOption

  // UI State
  /** Current view mode */
  viewMode: 'grid' | 'list'
  /** Currently selected market ID */
  selectedMarketId: string | null
  /** Whether to show filter panel */
  showFilters: boolean

  // Data cache (for optimistic updates)
  /** Cached breaking markets by ID */
  marketsCache: Map<string, BreakingMarket>
  /** Last data sync timestamp */
  lastSync: Date | null

  // Real-time
  /** Whether real-time connection is active */
  isConnected: boolean
  /** Number of active subscribers */
  subscribers: number
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Default filter options
 */
const defaultFilters: BreakingFilters = {
  minPriceChange: 0.05, // 5% minimum movement
  timeRange: '24h',
  categories: [],
  minVolume: 1000
}

/**
 * Default sort option
 */
const defaultSortOption: BreakingSortOption = {
  field: 'movement_score',
  direction: 'desc'
}

/**
 * Initial breaking store state
 */
const initialState: BreakingState = {
  filters: defaultFilters,
  sortOption: defaultSortOption,
  viewMode: 'grid',
  selectedMarketId: null,
  showFilters: false,
  marketsCache: new Map(),
  lastSync: null,
  isConnected: false,
  subscribers: 0
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Breaking Store Actions
 *
 * All actions available in the breaking store
 */
export interface BreakingActions {
  // Filter Actions

  /**
   * Set filter options
   * @param filters - New filter options (partial)
   */
  setFilters: (filters: Partial<BreakingFilters>) => void

  /**
   * Reset all filters to defaults
   */
  resetFilters: () => void

  /**
   * Set sort option
   * @param sortOption - Sort option to set
   */
  setSortOption: (sortOption: BreakingSortOption) => void

  // UI Actions

  /**
   * Set view mode
   * @param viewMode - View mode to set
   */
  setViewMode: (viewMode: 'grid' | 'list') => void

  /**
   * Set selected market
   * @param marketId - Market ID to select or null to deselect
   */
  setSelectedMarket: (marketId: string | null) => void

  /**
   * Toggle filter panel visibility
   */
  toggleFilters: () => void

  // Cache Actions

  /**
   * Set all markets in cache
   * @param markets - Array of markets to cache
   */
  setMarketsCache: (markets: BreakingMarket[]) => void

  /**
   * Add or update a single market in cache
   * @param market - Market to add or update
   */
  updateMarketCache: (market: BreakingMarket) => void

  /**
   * Clear all markets from cache
   */
  clearMarketCache: () => void

  /**
   * Set last sync timestamp
   * @param date - Sync timestamp
   */
  setLastSync: (date: Date) => void

  // Real-time Actions

  /**
   * Set real-time connection status
   * @param connected - Connection status
   */
  setConnected: (connected: boolean) => void

  /**
   * Increment subscriber count
   */
  incrementSubscribers: () => void

  /**
   * Decrement subscriber count
   */
  decrementSubscribers: () => void

  /**
   * Reset state to initial values
   */
  reset: () => void
}

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * Breaking Store
 *
 * Main breaking markets state management store with:
 * - DevTools integration for debugging
 * - Persistence for filters and view mode
 * - Immer middleware for immutable updates
 */
export const useBreakingStore = create<BreakingState & BreakingActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Filter Actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters }
          }),

        resetFilters: () =>
          set((state) => {
            state.filters = defaultFilters
          }),

        setSortOption: (sortOption) =>
          set((state) => {
            state.sortOption = sortOption
          }),

        // UI Actions
        setViewMode: (viewMode) =>
          set((state) => {
            state.viewMode = viewMode
          }),

        setSelectedMarket: (marketId) =>
          set((state) => {
            state.selectedMarketId = marketId
          }),

        toggleFilters: () =>
          set((state) => {
            state.showFilters = !state.showFilters
          }),

        // Cache Actions
        setMarketsCache: (markets) =>
          set((state) => {
            state.marketsCache = new Map()
            markets.forEach((market) => {
              state.marketsCache.set(market.id, market)
            })
            state.lastSync = new Date()
          }),

        updateMarketCache: (market) =>
          set((state) => {
            state.marketsCache.set(market.id, market)
          }),

        clearMarketCache: () =>
          set((state) => {
            state.marketsCache.clear()
            state.lastSync = null
          }),

        setLastSync: (date) =>
          set((state) => {
            state.lastSync = date
          }),

        // Real-time Actions
        setConnected: (connected) =>
          set((state) => {
            state.isConnected = connected
          }),

        incrementSubscribers: () =>
          set((state) => {
            state.subscribers++
          }),

        decrementSubscribers: () =>
          set((state) => {
            state.subscribers = Math.max(0, state.subscribers - 1)
          }),

        reset: () =>
          set((state) => {
            Object.assign(state, initialState)
            state.marketsCache = new Map()
          })
      })),
      {
        name: 'breaking-store',
        version: 1,
        // Only persist specific fields (not the markets cache itself)
        partialize: (state) => ({
          filters: state.filters,
          sortOption: state.sortOption,
          viewMode: state.viewMode,
          showFilters: state.showFilters
        })
      }
    ),
    { name: 'BreakingStore' }
  )
)

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Select filtered and sorted breaking markets
 * @returns Filtered and sorted breaking markets
 */
export const selectFilteredMarkets = (state: BreakingState & BreakingActions): BreakingMarket[] => {
  let markets = Array.from(state.marketsCache.values())

  // Apply filters
  const { filters } = state

  // Filter by minimum price change
  if (filters.minPriceChange !== undefined) {
    markets = markets.filter((m) => Math.abs(m.price_change_24h) >= filters.minPriceChange!)
  }

  // Filter by maximum price change
  if (filters.maxPriceChange !== undefined) {
    markets = markets.filter((m) => Math.abs(m.price_change_24h) <= filters.maxPriceChange!)
  }

  // Filter by minimum volume
  if (filters.minVolume !== undefined) {
    markets = markets.filter((m) => (m.volume || 0) >= filters.minVolume!)
  }

  // Filter by categories
  if (filters.categories && filters.categories.length > 0) {
    markets = markets.filter((m) => filters.categories!.includes(m.category || ''))
  }

  // Filter by minimum movement score
  if (filters.minMovementScore !== undefined) {
    markets = markets.filter((m) => m.movement_score >= filters.minMovementScore!)
  }

  // Filter by trend
  if (filters.trend) {
    markets = markets.filter((m) => m.trend === filters.trend)
  }

  // Apply sorting
  const { field, direction } = state.sortOption
  const multiplier = direction === 'asc' ? 1 : -1

  markets.sort((a, b) => {
    let comparison = 0

    switch (field) {
      case 'movement_score':
        comparison = a.movement_score - b.movement_score
        break
      case 'price_change_24h':
        comparison = a.price_change_24h - b.price_change_24h
        break
      case 'volume_change_24h':
        comparison = a.volume_change_24h - b.volume_change_24h
        break
      case 'volatility_index':
        comparison = a.volatility_index - b.volatility_index
        break
      case 'rank':
        comparison = a.rank - b.rank
        break
      default:
        comparison = 0
    }

    return comparison * multiplier
  })

  return markets
}

/**
 * Select currently selected market
 * @returns Selected market or null
 */
export const selectSelectedMarket = (state: BreakingState & BreakingActions): BreakingMarket | null => {
  return state.selectedMarketId ? state.marketsCache.get(state.selectedMarketId) || null : null
}

/**
 * Select count of active non-default filters
 * @returns Number of active filters
 */
export const selectActiveFiltersCount = (state: BreakingState & BreakingActions): number => {
  let count = 0

  if (state.filters.minPriceChange !== defaultFilters.minPriceChange) count++
  if (state.filters.maxPriceChange !== undefined) count++
  if (state.filters.minVolume !== defaultFilters.minVolume) count++
  if (state.filters.categories && state.filters.categories.length > 0) count++
  if (state.filters.timeRange !== defaultFilters.timeRange) count++
  if (state.filters.minMovementScore !== undefined) count++
  if (state.filters.trend !== undefined) count++

  return count
}

/**
 * Select whether real-time is active
 * @returns Whether real-time updates are active
 */
export const selectIsRealtimeActive = (state: BreakingState & BreakingActions): boolean => {
  return state.isConnected && state.subscribers > 0
}

/**
 * Select breaking market statistics
 * @returns Statistics about current breaking markets
 */
export const selectBreakingStats = (state: BreakingState & BreakingActions) => {
  const markets = Array.from(state.marketsCache.values())

  const upwardTrendCount = markets.filter((m) => m.trend === 'up').length
  const downwardTrendCount = markets.filter((m) => m.trend === 'down').length
  const neutralTrendCount = markets.filter((m) => m.trend === 'neutral').length

  const avgPriceChange =
    markets.length > 0
      ? markets.reduce((sum, m) => sum + Math.abs(m.price_change_24h), 0) / markets.length
      : 0

  const maxVolatility =
    markets.length > 0 ? Math.max(...markets.map((m) => m.volatility_index)) : 0

  const avgMovementScore =
    markets.length > 0
      ? markets.reduce((sum, m) => sum + m.movement_score, 0) / markets.length
      : 0

  const topMovers = markets
    .slice(0, 5)
    .map((m) => ({
      marketId: m.id,
      question: m.question,
      movementScore: m.movement_score,
      priceChange: m.price_change_24h
    }))

  return {
    totalBreakingMarkets: markets.length,
    avgPriceChange,
    upwardTrendCount,
    downwardTrendCount,
    neutralTrendCount,
    maxVolatility,
    avgMovementScore,
    topMovers
  }
}
