/**
 * Stores Barrel Export
 *
 * Central export point for all Zustand stores.
 * Import from this file for cleaner imports throughout the application.
 *
 * @example
 * ```ts
 * import { useMarketStore, usePortfolioStore, useUiStore } from '@/stores'
 * ```
 */

import { useMarketStore } from './market.store'
import { usePortfolioStore } from './portfolio.store'
import { useUiStore } from './ui.store'
import { useAlertStore } from './alert.store'
import { useUserStore } from './user.store'
import { useBreakingStore } from './breaking.store'

// ============================================================================
// MARKET STORE
// ============================================================================

export { useMarketStore } from './market.store'
export type { MarketState, MarketActions } from './market.store'
export {
  selectFilteredMarkets,
  selectPaginatedMarkets,
  selectFavoriteMarkets,
  selectMarketStats
} from './market.store'
export type { Market } from '@/types/market.types'
// Re-export common types for convenience
export { MarketViewMode, MarketSortField, MarketSortDirection, MarketStatus } from '@/types/market.types'

// ============================================================================
// PORTFOLIO STORE
// ============================================================================

export { usePortfolioStore } from './portfolio.store'
export type { PortfolioState, PortfolioActions } from './portfolio.store'
export {
  selectOpenPositions,
  selectClosedPositions,
  selectFilteredPositions,
  selectPortfolioPerformance
} from './portfolio.store'
export type { Position, PositionDetails, PortfolioSummary } from '@/types/portfolio.types'

// ============================================================================
// UI STORE
// ============================================================================

export { useUiStore } from './ui.store'
export type { UIState, UIActions } from './ui.store'
export {
  selectToasts,
  selectLoadingState,
  selectHasLoading,
  selectIsModalOpen,
  selectBreakpoint
} from './ui.store'
export type { Toast, ModalState } from '@/types/ui.types'

// ============================================================================
// ALERT STORE
// ============================================================================

export { useAlertStore } from './alert.store'
export type { AlertState, AlertActions } from './alert.store'
export {
  selectActiveAlerts,
  selectTriggeredAlerts,
  selectFilteredAlerts,
  selectAlertStatistics
} from './alert.store'
export type { PriceAlert, AlertTrigger } from '@/types/alert.types'
// Re-export common types for convenience
export { AlertCondition, AlertPriority, AlertStatus } from '@/types/alert.types'

// ============================================================================
// USER STORE
// ============================================================================

export { useUserStore } from './user.store'
export type { UserState, UserActions, UserProfile, UserSettings } from './user.store'
export {
  selectCombinedPreferences,
  selectHasPremium,
  selectDisplayName,
  selectUserInitials
} from './user.store'
export type { UserPreferences } from '@/types/database.types'

// ============================================================================
// BREAKING STORE
// ============================================================================

export { useBreakingStore } from './breaking.store'
export type { BreakingState, BreakingActions } from './breaking.store'
export {
  selectFilteredMarkets as selectFilteredBreakingMarkets,
  selectSelectedMarket as selectSelectedBreakingMarket,
  selectActiveFiltersCount as selectActiveBreakingFiltersCount,
  selectIsRealtimeActive as selectBreakingRealtimeActive,
  selectBreakingStats
} from './breaking.store'
export type { BreakingMarket, BreakingFilters, BreakingSortOption } from '@/types/breaking.types'

// ============================================================================
// STORE HOOKS (Convenience Re-exports)
// ============================================================================

/**
 * Use all stores hook
 *
 * Returns all store hooks for convenience
 * @returns Object containing all store hooks
 *
 * @example
 * ```ts
 * const { useMarketStore, usePortfolioStore, useUiStore } = useStores()
 * ```
 */
export function useStores() {
  return {
    useMarketStore,
    usePortfolioStore,
    useUiStore,
    useAlertStore,
    useUserStore,
    useBreakingStore
  }
}

// ============================================================================
// STORE UTILITIES
// ============================================================================

/**
 * Reset all stores to initial state
 *
 * Useful for logging out or clearing data
 *
 * @example
 * ```ts
 * resetAllStores()
 * ```
 */
export function resetAllStores(): void {
  useMarketStore.getState().reset()
  usePortfolioStore.getState().reset()
  useUiStore.getState().reset()
  useAlertStore.getState().reset()
  useUserStore.getState().reset()
  useBreakingStore.getState().reset()
}

/**
 * Get state from all stores
 *
 * Returns current state from all stores
 * @returns Object containing all store states
 *
 * @example
 * ```ts
 * const allStates = getAllStoreStates()
 * console.log(allStates.markets, allStates.portfolio)
 * ```
 */
export function getAllStoreStates() {
  return {
    market: useMarketStore.getState(),
    portfolio: usePortfolioStore.getState(),
    ui: useUiStore.getState(),
    alert: useAlertStore.getState(),
    user: useUserStore.getState(),
    breaking: useBreakingStore.getState()
  }
}

/**
 * Hydrate all stores from server state
 *
 * Used for SSR hydration in Next.js
 * @param states - Server-side states to hydrate from
 *
 * @example
 * ```ts
 * // In page component
 * hydrateStores({
 *   market: serverMarketState,
 *   portfolio: serverPortfolioState
 * })
 * ```
 */
export function hydrateStores(states: Partial<ReturnType<typeof getAllStoreStates>>): void {
  if (states.market) {
    useMarketStore.setState(states.market as any)
  }
  if (states.portfolio) {
    usePortfolioStore.setState(states.portfolio as any)
  }
  if (states.ui) {
    useUiStore.setState(states.ui as any)
  }
  if (states.alert) {
    useAlertStore.setState(states.alert as any)
  }
  if (states.user) {
    useUserStore.setState(states.user as any)
  }
  if (states.breaking) {
    useBreakingStore.setState(states.breaking as any)
  }
}
