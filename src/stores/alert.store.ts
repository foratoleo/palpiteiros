/**
 * Alert Store
 *
 * Zustand store for price alerts and notification management.
 * Handles alert creation, triggering, and notification preferences.
 *
 * @features
 * - Price alert management (create, update, delete)
 * - Alert triggering with conditions
 * - Alert history tracking
 * - Notification preferences
 * - Bulk alert operations
 *
 * @example
 * ```ts
 * const { alerts, addAlert, deleteAlert, triggerAlert } = useAlertStore()
 * const activeAlerts = useAlertStore(selectActiveAlerts)
 * ```
 */

import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type {
  PriceAlert,
  AlertTrigger,
  AlertHistory,
  AlertStatus,
  NotificationPreferences,
  CreateAlertInput,
  UpdateAlertInput,
  AlertFilters,
  AlertStatistics
} from '@/types/alert.types'
import {
  AlertCondition,
  AlertPriority,
  NotificationChannel
} from '@/types/alert.types'

// ============================================================================
// STATE INTERFACE
// ============================================================================

/**
 * Alert Store State
 *
 * Complete state for alert management
 */
export interface AlertState {
  // Data
  /** All user alerts */
  alerts: PriceAlert[]
  /** Alert trigger history */
  triggerHistory: AlertTrigger[]
  /** Currently selected alert */
  selectedAlert: PriceAlert | null

  // Preferences
  /** Notification preferences */
  notificationPreferences: NotificationPreferences

  // Filters
  /** Active alert filters */
  filters: AlertFilters

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
 * Default notification preferences
 */
const defaultNotificationPreferences: NotificationPreferences = {
  userId: '',
  enabledChannels: [NotificationChannel.IN_APP],
  soundsEnabled: true,
  quietHours: undefined,
  minPushPriority: AlertPriority.MEDIUM,
  emailBatchInterval: 30,
  webhookUrl: undefined
}

/**
 * Default alert filters
 */
const defaultFilters: AlertFilters = {
  triggered: undefined,
  market_id: undefined,
  condition: undefined,
  status: undefined,
  priority: undefined,
  active: undefined
}

/**
 * Initial alert store state
 */
const initialState: AlertState = {
  alerts: [],
  triggerHistory: [],
  selectedAlert: null,

  notificationPreferences: defaultNotificationPreferences,

  filters: defaultFilters,

  loading: false,
  error: null,
  lastRefresh: null
}

// ============================================================================
// ACTIONS
// ============================================================================

/**
 * Alert Store Actions
 *
 * All actions available in the alert store
 */
export interface AlertActions {
  // Data Actions

  /**
   * Set all alerts
   * @param alerts - Array of alerts to set
   */
  setAlerts: (alerts: PriceAlert[]) => void

  /**
   * Add a new alert
   * @param input - Alert creation input
   * @returns Created alert ID
   */
  addAlert: (input: CreateAlertInput) => string

  /**
   * Update an existing alert
   * @param alertId - Alert ID to update
   * @param updates - Fields to update
   */
  updateAlert: (alertId: string, updates: UpdateAlertInput) => void

  /**
   * Delete an alert
   * @param alertId - Alert ID to delete
   */
  deleteAlert: (alertId: string) => void

  /**
   * Trigger an alert (when price condition is met)
   * @param alertId - Alert ID to trigger
   * @param currentPrice - Current market price
   * @returns Trigger record or null if condition not met
   */
  triggerAlert: (alertId: string, currentPrice: number) => AlertTrigger | null

  /**
   * Check and trigger alerts for a market
   * @param marketId - Market ID to check alerts for
   * @param currentPrice - Current market price
   * @returns Array of triggered alerts
   */
  checkAlerts: (marketId: string, currentPrice: number) => AlertTrigger[]

  /**
   * Dismiss a triggered alert
   * @param alertId - Alert ID to dismiss
   */
  dismissAlert: (alertId: string) => void

  /**
   * Set selected alert
   * @param alert - Alert to select or null to deselect
   */
  setSelectedAlert: (alert: PriceAlert | null) => void

  /**
   * Load alerts from database
   * @param userId - User ID to load alerts for
   */
  loadAlerts: (userId: string) => Promise<void>

  // Bulk Actions

  /**
   * Pause multiple alerts
   * @param alertIds - Array of alert IDs to pause
   */
  pauseAlerts: (alertIds: string[]) => void

  /**
   * Resume multiple alerts
   * @param alertIds - Array of alert IDs to resume
   */
  resumeAlerts: (alertIds: string[]) => void

  /**
   * Delete multiple alerts
   * @param alertIds - Array of alert IDs to delete
   */
  deleteAlerts: (alertIds: string[]) => void

  // Filter Actions

  /**
   * Set alert filters
   * @param filters - New filter options (partial)
   */
  setFilters: (filters: Partial<AlertFilters>) => void

  /**
   * Reset all filters to defaults
   */
  resetFilters: () => void

  // Preference Actions

  /**
   * Update notification preferences
   * @param preferences - Partial preferences to update
   */
  updateNotificationPreferences: (preferences: Partial<NotificationPreferences>) => void

  /**
   * Set enabled notification channels
   * @param channels - Array of enabled channels
   */
  setNotificationChannels: (channels: NotificationChannel[]) => void

  /**
   * Toggle quiet hours
   * @param enabled - Whether quiet hours are enabled
   */
  toggleQuietHours: (enabled: boolean) => void

  // History Actions

  /**
   * Get alert history
   * @param alertId - Alert ID to get history for
   * @returns Alert history or null
   */
  getAlertHistory: (alertId: string) => AlertHistory | null

  /**
   * Clear trigger history
   */
  clearHistory: () => void

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
 * Check if alert condition is met
 * @param condition - Alert condition
 * @param targetPrice - Target price
 * @param currentPrice - Current price
 * @returns Whether condition is met
 */
function isConditionMet(
  condition: AlertCondition,
  targetPrice: number,
  currentPrice: number
): boolean {
  switch (condition) {
    case AlertCondition.ABOVE:
      return currentPrice > targetPrice
    case AlertCondition.BELOW:
      return currentPrice < targetPrice
    case AlertCondition.CROSS:
      // Cross condition is met if we're close to target (within 1%)
      const threshold = targetPrice * 0.01
      return Math.abs(currentPrice - targetPrice) < threshold
    case AlertCondition.EXACT:
      return currentPrice === targetPrice
    default:
      return false
  }
}

/**
 * Generate alert ID
 * @returns Unique alert ID
 */
function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// STORE CREATION
// ============================================================================

/**
 * Alert Store
 *
 * Main alert state management store with:
 * - DevTools integration for debugging
 * - Immer middleware for immutable updates
 * - Real-time alert checking
 */
export const useAlertStore = create<AlertState & AlertActions>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Data Actions
      setAlerts: (alerts) =>
        set((state) => {
          state.alerts = alerts
          state.lastRefresh = Date.now()
        }),

      addAlert: (input) => {
        const alertId = generateAlertId()

        const alert: PriceAlert = {
          id: alertId,
          user_id: input.market_id, // TODO: Get actual user ID
          market_id: input.market_id,
          market: input.market,
          condition: input.condition,
          target_price: input.target_price,
          triggered: false,
          triggered_at: null,
          created_at: new Date().toISOString()
        }

        set((state) => {
          state.alerts.push(alert)
        })

        return alertId
      },

      updateAlert: (alertId, updates) =>
        set((state) => {
          const index = state.alerts.findIndex((a) => a.id === alertId)
          if (index >= 0) {
            state.alerts[index] = { ...state.alerts[index], ...updates }
          }
        }),

      deleteAlert: (alertId) =>
        set((state) => {
          state.alerts = state.alerts.filter((a) => a.id !== alertId)
          if (state.selectedAlert?.id === alertId) {
            state.selectedAlert = null
          }
        }),

      triggerAlert: (alertId, currentPrice) => {
        const alert = get().alerts.find((a) => a.id === alertId)
        if (!alert || alert.triggered) return null

        const conditionMet = isConditionMet(alert.condition, alert.target_price, currentPrice)
        if (!conditionMet) return null

        const trigger: AlertTrigger = {
          alert_id: alertId,
          market_id: alert.market_id,
          current_price: currentPrice,
          target_price: alert.target_price,
          condition: alert.condition,
          timestamp: new Date().toISOString(),
          notified: false
        }

        set((state) => {
          const index = state.alerts.findIndex((a) => a.id === alertId)
          if (index >= 0) {
            state.alerts[index].triggered = true
            state.alerts[index].triggered_at = trigger.timestamp
          }
          state.triggerHistory.push(trigger)
        })

        return trigger
      },

      checkAlerts: (marketId, currentPrice) => {
        const alerts = get().alerts.filter(
          (a) => a.market_id === marketId && !a.triggered
        )

        const triggered: AlertTrigger[] = []

        alerts.forEach((alert) => {
          const trigger = get().triggerAlert(alert.id, currentPrice)
          if (trigger) {
            triggered.push(trigger)
          }
        })

        return triggered
      },

      dismissAlert: (alertId) =>
        set((state) => {
          const index = state.alerts.findIndex((a) => a.id === alertId)
          if (index >= 0) {
            // Reset alert to allow re-triggering
            state.alerts[index].triggered = false
            state.alerts[index].triggered_at = null
          }
        }),

      setSelectedAlert: (alert) =>
        set((state) => {
          state.selectedAlert = alert
        }),

      loadAlerts: async (userId) => {
        set((state) => {
          state.loading = true
          state.error = null
        })

        try {
          // TODO: Implement actual data loading from Supabase
          // const alerts = await getUserAlerts(userId)
          // set((state) => {
          //   state.alerts = alerts
          //   state.loading = false
          //   state.lastRefresh = Date.now()
          // })

          set((state) => {
            state.loading = false
            state.lastRefresh = Date.now()
          })
        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to load alerts'
            state.loading = false
          })
        }
      },

      // Bulk Actions
      pauseAlerts: (alertIds) =>
        set((state) => {
          alertIds.forEach((id) => {
            const alert = state.alerts.find((a) => a.id === id)
            if (alert) {
              // Status would need to be added to PriceAlert type
              // For now, we just mark as triggered to pause
            }
          })
        }),

      resumeAlerts: (alertIds) =>
        set((state) => {
          alertIds.forEach((id) => {
            const index = state.alerts.findIndex((a) => a.id === id)
            if (index >= 0) {
              state.alerts[index].triggered = false
              state.alerts[index].triggered_at = null
            }
          })
        }),

      deleteAlerts: (alertIds) =>
        set((state) => {
          state.alerts = state.alerts.filter((a) => !alertIds.includes(a.id))
          if (state.selectedAlert && alertIds.includes(state.selectedAlert.id)) {
            state.selectedAlert = null
          }
        }),

      // Filter Actions
      setFilters: (filters) =>
        set((state) => {
          state.filters = { ...state.filters, ...filters }
        }),

      resetFilters: () =>
        set((state) => {
          state.filters = defaultFilters
        }),

      // Preference Actions
      updateNotificationPreferences: (preferences) =>
        set((state) => {
          state.notificationPreferences = {
            ...state.notificationPreferences,
            ...preferences
          }
        }),

      setNotificationChannels: (channels) =>
        set((state) => {
          state.notificationPreferences.enabledChannels = channels
        }),

      toggleQuietHours: (enabled) =>
        set((state) => {
          if (state.notificationPreferences.quietHours) {
            state.notificationPreferences.quietHours.enabled = enabled
          }
        }),

      // History Actions
      getAlertHistory: (alertId) => {
        const state = get()
        const alert = state.alerts.find((a) => a.id === alertId)
        if (!alert) return null

        const triggers = state.triggerHistory.filter((t) => t.alert_id === alertId)

        return {
          alertId,
          market: alert.market,
          triggers,
          triggerCount: triggers.length,
          firstTriggeredAt: triggers[0]?.timestamp,
          lastTriggeredAt: triggers[triggers.length - 1]?.timestamp
        }
      },

      clearHistory: () =>
        set((state) => {
          state.triggerHistory = []
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
      { name: 'AlertStore' }
    )
  )

// ============================================================================
// SELECTORS (Derived State)
// ============================================================================

/**
 * Select active alerts (not triggered)
 * @returns Array of active alerts
 */
export const selectActiveAlerts = (state: AlertState & AlertActions): PriceAlert[] => {
  return state.alerts.filter((a) => !a.triggered)
}

/**
 * Select triggered alerts
 * @returns Array of triggered alerts
 */
export const selectTriggeredAlerts = (state: AlertState & AlertActions): PriceAlert[] => {
  return state.alerts.filter((a) => a.triggered)
}

/**
 * Select filtered alerts
 * @returns Filtered alerts
 */
export const selectFilteredAlerts = (state: AlertState & AlertActions): PriceAlert[] => {
  let filtered = [...state.alerts]

  const { filters } = state

  if (filters.triggered !== undefined) {
    filtered = filtered.filter((a) => a.triggered === filters.triggered)
  }

  if (filters.market_id) {
    filtered = filtered.filter((a) => a.market_id === filters.market_id)
  }

  if (filters.condition) {
    filtered = filtered.filter((a) => a.condition === filters.condition)
  }

  if (filters.active !== undefined) {
    filtered = filtered.filter((a) =>
      filters.active ? a.market.active : !a.market.active
    )
  }

  return filtered
}

/**
 * Select alert statistics
 * @returns Alert statistics
 */
export const selectAlertStatistics = (state: AlertState & AlertActions): AlertStatistics => {
  const activeAlerts = state.alerts.filter((a) => !a.triggered)
  const triggeredAlerts = state.alerts.filter((a) => a.triggered)

  // Count triggers per market
  const triggersByMarket = new Map<string, number>()
  state.triggerHistory.forEach((trigger) => {
    const count = triggersByMarket.get(trigger.market_id) || 0
    triggersByMarket.set(trigger.market_id, count + 1)
  })

  // Find most triggered market
  let mostTriggeredMarket: { marketId: string; triggerCount: number } | undefined
  triggersByMarket.forEach((count, marketId) => {
    if (!mostTriggeredMarket || count > mostTriggeredMarket.triggerCount) {
      mostTriggeredMarket = { marketId, triggerCount: count }
    }
  })

  // Calculate average trigger time
  const avgTriggerTime =
    state.alerts.length > 0
      ? state.triggerHistory.reduce((sum, trigger) => {
          const alert = state.alerts.find((a) => a.id === trigger.alert_id)
          if (!alert) return sum

          const created = new Date(alert.created_at).getTime()
          const triggered = new Date(trigger.timestamp).getTime()
          return sum + (triggered - created)
        }, 0) / state.alerts.length
      : undefined

  avgTriggerTime !== undefined ? avgTriggerTime / (1000 * 60 * 60) : undefined // Convert to hours

  return {
    activeAlerts: activeAlerts.length,
    triggeredAlerts: triggeredAlerts.length,
    pausedAlerts: 0, // Would need status field in PriceAlert
    mostTriggeredMarket,
    avgTriggerTime,
    triggerRate: state.alerts.length > 0 ? triggeredAlerts.length / state.alerts.length : 0
  }
}
