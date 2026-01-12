/**
 * Market Store
 *
 * Zustand store for market state management including filters,
 * sorting, view modes, and market data caching.
 *
 * @features
 * - Market list with real-time updates
 * - Advanced filtering (category, tags, price, liquidity)
 * - Multiple sort options
 * - View mode switching (grid/list/compact)
 * - Search functionality
 * - Optimized selectors for derived state
 *
 * @example
 * ```ts
 * const { markets, filters, setFilters, setSearch } = useMarketStore()
 * const filteredMarkets = useMarketStore(selectFilteredMarkets)
 * ```
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  Market,
  MarketFilterOptions,
  MarketSortOption
} from '@/types/market.types'
import type { Tag } from '@/types/database.types'
import {
  MarketSortField,
  MarketSortDirection,
  MarketViewMode
} from '@/types/market.types'

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Market Store State
 *
 * Complete state for market management
 */
export interface MarketState {
  // Data
  /** All loaded markets */
  markets: Market[]
  /** Currently selected market */
  selectedMarket: Market | null
  /** Favorite market IDs */
  favoriteMarkets: Set<string>

  // Filters
  /** Active filter options */
  filters: MarketFilterOptions
  /** Current sort option */
  sortOption: MarketSortOption
  /** Search query string */
  searchQuery: string
  /** Current view mode */
  viewMode: MarketViewMode
  /** Filter version to force re-computation when categories change */
  _filterVersion: number

  // UI State
  /** Loading state */
  loading: boolean
  /** Error message */
  error: string | null
  /** Last data refresh timestamp */
  lastRefresh: number | null

  // Pagination
  /** Current page (1-indexed) */
  page: number
  /** Items per page */
  pageSize: number
  /** Total filtered items count */
  totalFiltered: number
}

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Default filter options
 */
const defaultFilters: MarketFilterOptions = {
  active: true,
  categories: [],
  tags: [],
  minLiquidity: undefined,
  maxLiquidity: undefined,
  minVolume: undefined,
  maxVolume: undefined,
  priceRange: undefined,
  closingSoon: false,
  hot: false,
  status: undefined,
  searchQuery: undefined
}

/**
 * Default sort option
 */
const defaultSortOption: MarketSortOption = {
  field: MarketSortField.END_DATE,
  direction: MarketSortDirection.ASC
}

/**
 * Initial market store state
 */
const initialState: MarketState = {
  markets: [],
  selectedMarket: null,
  favoriteMarkets: new Set<string>(),

  filters: defaultFilters,
  sortOption: defaultSortOption,
  searchQuery: '',
  viewMode: MarketViewMode.GRID,
  _filterVersion: 0,

  loading: false,
  error: null,
  lastRefresh: null,

  page: 1,
  pageSize: 20,
  totalFiltered: 0
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Market Store Actions
 *
 * All actions available in the market store
 */
export interface MarketActions {
  // Data Actions

  /**
   * Set all markets
   * @param markets - Array of markets to set
   */
  setMarkets: (markets: Market[]) => void

  /**
   * Add or update a single market
   * @param market - Market to add or update
   */
  upsertMarket: (market: Market) => void

  /**
   * Remove a market by ID
   * @param marketId - Market ID to remove
   */
  removeMarket: (marketId: string) => void

  /**
   * Set selected market
   * @param market - Market to select or null to deselect
   */
  setSelectedMarket: (market: Market | null) => void

  /**
   * Toggle favorite status for a market
   * @param marketId - Market ID to toggle
   */
  toggleFavorite: (marketId: string) => void

  /**
   * Check if market is favorited
   * @param marketId - Market ID to check
   * @returns Whether market is favorited
   */
  isFavorite: (marketId: string) => boolean

  // Filter Actions

  /**
   * Set filter options
   * @param filters - New filter options (partial)
   */
  setFilters: (filters: Partial<MarketFilterOptions>) => void

  /**
   * Reset all filters to defaults
   */
  resetFilters: () => void

  /**
   * Set search query
   * @param query - Search query string
   */
  setSearch: (query: string) => void

  // Sort Actions

  /**
   * Set sort option
   * @param field - Sort field
   * @param direction - Sort direction
   */
  setSort: (field: MarketSortField, direction?: MarketSortDirection) => void

  /**
   * Toggle sort direction for current field
   */
  toggleSortDirection: () => void

  // View Mode Actions

  /**
   * Set view mode
   * @param mode - View mode to set
   */
  setViewMode: (mode: MarketViewMode) => void

  /**
   * Toggle between grid and list view
   */
  toggleViewMode: () => void

  // Pagination Actions

  /**
   * Set current page
   * @param page - Page number (1-indexed)
   */
  setPage: (page: number) => void

  /**
   * Set page size
   * @param size - Items per page
   */
  setPageSize: (size: number) => void

  /**
   * Go to next page
   */
  nextPage: () => void

  /**
   * Go to previous page
   */
  prevPage: () => void

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

  /**
   * Refresh markets (update last refresh timestamp)
   */
  refresh: () => void
}

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * Market Store
 *
 * Main market state management store with:
 * - DevTools integration for debugging
 * - Persistence for filters and view mode
 * - Immer middleware for immutable updates
 */
export const useMarketStore = create<MarketState & MarketActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        // Data Actions
        setMarkets: (markets) =>
          set((state) => {
            state.markets = markets
            state.lastRefresh = Date.now()
          }),

        upsertMarket: (market) =>
          set((state) => {
            const index = state.markets.findIndex((m) => m.id === market.id)
            if (index >= 0) {
              state.markets[index] = market
            } else {
              state.markets.push(market)
            }
          }),

        removeMarket: (marketId) =>
          set((state) => {
            state.markets = state.markets.filter((m) => m.id !== marketId)
            if (state.selectedMarket?.id === marketId) {
              state.selectedMarket = null
            }
          }),

        setSelectedMarket: (market) =>
          set((state) => {
            state.selectedMarket = market
          }),

        toggleFavorite: (marketId) =>
          set((state) => {
            if (state.favoriteMarkets.has(marketId)) {
              state.favoriteMarkets.delete(marketId)
            } else {
              state.favoriteMarkets.add(marketId)
            }
          }),

        isFavorite: (marketId) => {
          return get().favoriteMarkets.has(marketId)
        },

        // Filter Actions
        setFilters: (filters) =>
          set((state) => {
            state.filters = { ...state.filters, ...filters }
            state._filterVersion++ // Force re-computation in components using filters
            state.page = 1 // Reset to first page when filters change
          }),

        resetFilters: () =>
          set((state) => {
            state.filters = defaultFilters
            state.searchQuery = ''
            state.page = 1
          }),

        setSearch: (query) =>
          set((state) => {
            state.searchQuery = query
            state.page = 1 // Reset to first page when search changes
          }),

        // Sort Actions
        setSort: (field, direction) =>
          set((state) => {
            // If same field, toggle direction if direction not provided
            if (state.sortOption.field === field && !direction) {
              state.sortOption.direction =
                state.sortOption.direction === MarketSortDirection.ASC
                  ? MarketSortDirection.DESC
                  : MarketSortDirection.ASC
            } else {
              state.sortOption.field = field
              state.sortOption.direction = direction || MarketSortDirection.ASC
            }
          }),

        toggleSortDirection: () =>
          set((state) => {
            state.sortOption.direction =
              state.sortOption.direction === MarketSortDirection.ASC
                ? MarketSortDirection.DESC
                : MarketSortDirection.ASC
          }),

        // View Mode Actions
        setViewMode: (mode) =>
          set((state) => {
            state.viewMode = mode
          }),

        toggleViewMode: () =>
          set((state) => {
            state.viewMode =
              state.viewMode === MarketViewMode.GRID
                ? MarketViewMode.LIST
                : MarketViewMode.GRID
          }),

        // Pagination Actions
        setPage: (page) =>
          set((state) => {
            state.page = Math.max(1, page)
          }),

        setPageSize: (size) =>
          set((state) => {
            state.pageSize = size
            state.page = 1 // Reset to first page when page size changes
          }),

        nextPage: () =>
          set((state) => {
            const maxPage = Math.ceil(state.totalFiltered / state.pageSize)
            state.page = Math.min(state.page + 1, maxPage)
          }),

        prevPage: () =>
          set((state) => {
            state.page = Math.max(1, state.page - 1)
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
            state.favoriteMarkets = new Set<string>()
          }),

        refresh: () =>
          set((state) => {
            state.lastRefresh = Date.now()
          })
      })),
      {
        name: 'market-store',
        // Only persist specific fields (not the markets data itself)
        partialize: (state) => ({
          filters: state.filters,
          sortOption: state.sortOption,
          searchQuery: state.searchQuery,
          viewMode: state.viewMode,
          favoriteMarkets: Array.from(state.favoriteMarkets),
          page: state.page,
          pageSize: state.pageSize
        }),
        // Rehydrate Set from array
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.favoriteMarkets = new Set(state.favoriteMarkets as unknown as Set<string>)
          }
        }
      }
    ),
    { name: 'MarketStore' }
  )
)

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Select filtered and sorted markets
 * @returns Filtered and sorted markets for current page
 */
export const selectFilteredMarkets = (state: MarketState & MarketActions): Market[] => {
  let filtered = [...state.markets]

  // Apply filters
  const { filters, searchQuery } = state

  if (filters.active !== undefined) {
    filtered = filtered.filter((m) => m.active === filters.active)
  }

  if (filters.categories && filters.categories.length > 0) {
    filtered = filtered.filter((m) => filters.categories!.includes(m.category || ''))
  }

  if (filters.tags && filters.tags.length > 0) {
    filtered = filtered.filter((m) =>
      m.tags.some((tag: Tag) => filters.tags!.includes(tag.slug))
    )
  }

  if (filters.minLiquidity !== undefined) {
    filtered = filtered.filter((m) => (m.liquidity || 0) >= filters.minLiquidity!)
  }

  if (filters.maxLiquidity !== undefined) {
    filtered = filtered.filter((m) => (m.liquidity || 0) <= filters.maxLiquidity!)
  }

  if (filters.minVolume !== undefined) {
    filtered = filtered.filter((m) => (m.volume || 0) >= filters.minVolume!)
  }

  if (filters.maxVolume !== undefined) {
    filtered = filtered.filter((m) => (m.volume || 0) <= filters.maxVolume!)
  }

  if (filters.priceRange) {
    const [min, max] = filters.priceRange
    filtered = filtered.filter((m) => {
      const price = m.current_price || 0
      return price >= min && price <= max
    })
  }

  if (filters.closingSoon) {
    const oneDay = 24 * 60 * 60 * 1000
    const tomorrow = Date.now() + oneDay
    filtered = filtered.filter((m) => {
      const endDate = m.end_date ? new Date(m.end_date).getTime() : Infinity
      return endDate <= tomorrow
    })
  }

  if (filters.hot) {
    // Sort by volume and take top 20%
    const sortedByVolume = [...filtered].sort((a, b) => (b.volume || 0) - (a.volume || 0))
    const hotThreshold = Math.floor(sortedByVolume.length * 0.2)
    const hotIds = new Set(sortedByVolume.slice(0, hotThreshold).map((m) => m.id))
    filtered = filtered.filter((m) => hotIds.has(m.id))
  }

  // Apply search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase()
    filtered = filtered.filter(
      (m) =>
        m.question.toLowerCase().includes(query) ||
        m.description?.toLowerCase().includes(query) ||
        m.tags.some((tag: Tag) => tag.label.toLowerCase().includes(query))
    )
  }

  // Apply sorting
  const { field, direction } = state.sortOption
  const multiplier = direction === MarketSortDirection.ASC ? 1 : -1

  filtered.sort((a, b) => {
    let comparison = 0

    switch (field) {
      case MarketSortField.END_DATE:
        const aDate = a.end_date ? new Date(a.end_date).getTime() : Infinity
        const bDate = b.end_date ? new Date(b.end_date).getTime() : Infinity
        comparison = aDate - bDate
        break
      case MarketSortField.VOLUME:
        comparison = (a.volume || 0) - (b.volume || 0)
        break
      case MarketSortField.LIQUIDITY:
        comparison = (a.liquidity || 0) - (b.liquidity || 0)
        break
      case MarketSortField.PRICE:
        comparison = (a.current_price || 0) - (b.current_price || 0)
        break
      case MarketSortField.CREATED:
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        break
      case MarketSortField.PRICE_CHANGE_24H:
        comparison = (a.price_change_24h || 0) - (b.price_change_24h || 0)
        break
      default:
        comparison = 0
    }

    return comparison * multiplier
  })

  return filtered
}

/**
 * Select paginated markets
 * @returns Markets for current page
 */
export const selectPaginatedMarkets = (state: MarketState & MarketActions): Market[] => {
  const filtered = selectFilteredMarkets(state)
  const { page, pageSize } = state

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return filtered.slice(start, end)
}

/**
 * Select favorite markets
 * @returns Array of favorite markets
 */
export const selectFavoriteMarkets = (state: MarketState & MarketActions): Market[] => {
  return state.markets.filter((m) => state.favoriteMarkets.has(m.id))
}

/**
 * Select market statistics
 * @returns Statistics about current market state
 */
export const selectMarketStats = (state: MarketState & MarketActions) => {
  const filtered = selectFilteredMarkets(state)
  const totalPages = Math.ceil(filtered.length / state.pageSize)

  return {
    totalMarkets: state.markets.length,
    filteredMarkets: filtered.length,
    favoriteCount: state.favoriteMarkets.size,
    currentPage: state.page,
    totalPages,
    hasNextPage: state.page < totalPages,
    hasPrevPage: state.page > 1
  }
}
