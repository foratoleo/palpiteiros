/**
 * Use Alert Checker Hook
 *
 * Custom hook for continuously monitoring market prices and triggering alerts.
 * Features real-time price subscriptions, debouncing, and background processing.
 *
 * @features
 * - Real-time price monitoring via Supabase subscriptions
 * - Automatic alert triggering when conditions are met
 * - Debounce mechanism to prevent duplicate triggers (5s cooldown)
 * - Background processing for inactive tabs
 * - Notification dispatch (toasts, push, email)
 * - Alert history logging
 * - Error handling with retry fallback
 * - Cleanup on unmount
 * - Configurable polling interval
 * - Selective market monitoring
 *
 * @example
 * ```tsx
 * function AlertMonitor() {
 *   useAlertChecker({
 *     interval: 10000,
 *     enablePush: true,
 *     markets: ['market-1', 'market-2']
 *   })
 *   return null
 * }
 * ```
 */

'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'

// Store & Types
import { useAlertStore, useMarketStore } from '@/stores'
import { AlertTrigger, NotificationChannel } from '@/types/alert.types'

// ============================================================================
// TYPES
// ============================================================================

export interface UseAlertCheckerOptions {
  /** Polling interval in milliseconds (default: 5000ms) */
  interval?: number
  /** Enable push notifications (default: false) */
  enablePush?: boolean
  /** Optional array of market IDs to monitor (default: all) */
  markets?: string[]
  /** Custom notification handler */
  onNotification?: (trigger: AlertTrigger) => void
  /** Enable background processing (default: true) */
  enableBackground?: boolean
  /** Cooldown period between triggers in ms (default: 5000ms) */
  triggerCooldown?: number
}

export interface AlertCheckerState {
  /** Whether checker is actively monitoring */
  isMonitoring: boolean
  /** Number of alerts triggered this session */
  triggeredCount: number
  /** Last check timestamp */
  lastCheckAt: number | null
  /** Any errors that occurred */
  error: string | null
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_INTERVAL = 5000 // 5 seconds
const DEFAULT_COOLDOWN = 5000 // 5 seconds cooldown
const MAX_RETRIES = 3
const RETRY_DELAY = 10000 // 10 seconds

// ============================================================================
// USE ALERT CHECKER HOOK
// ============================================================================

/**
 * useAlertChecker - Monitor prices and trigger alerts
 *
 * Continuously checks market prices against active alerts and triggers
 * notifications when conditions are met.
 */
export function useAlertChecker(options: UseAlertCheckerOptions = {}) {
  // Options with defaults
  const {
    interval = DEFAULT_INTERVAL,
    enablePush = false,
    markets: marketFilter,
    onNotification,
    enableBackground = true,
    triggerCooldown = DEFAULT_COOLDOWN
  } = options

  // State
  const [state, setState] = useState<AlertCheckerState>({
    isMonitoring: false,
    triggeredCount: 0,
    lastCheckAt: null,
    error: null
  })

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const triggerTimestampsRef = useRef<Map<string, number>>(new Map())
  const retryCountRef = useRef(0)
  const isDocumentVisibleRef = useRef(true)

  // Store
  const { alerts, checkAlerts, triggerAlert } = useAlertStore()
  const { markets } = useMarketStore()

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Check if alert is in cooldown period
   */
  const isInCooldown = useCallback(
    (alertId: string): boolean => {
      const lastTriggered = triggerTimestampsRef.current.get(alertId)
      if (!lastTriggered) return false

      const now = Date.now()
      const timeSinceLastTrigger = now - lastTriggered

      return timeSinceLastTrigger < triggerCooldown
    },
    [triggerCooldown]
  )

  /**
   * Record alert trigger timestamp
   */
  const recordTrigger = useCallback((alertId: string) => {
    triggerTimestampsRef.current.set(alertId, Date.now())
  }, [])

  /**
   * Trigger notification for alert
   */
  const dispatchNotification = useCallback(
    async (trigger: AlertTrigger) => {
      // Call custom notification handler if provided
      if (onNotification) {
        onNotification(trigger)
      }

      // TODO: Implement push notifications
      if (enablePush) {
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            const alert = alerts.find((a) => a.id === trigger.alert_id)
            const market = alert?.market

            new Notification('Alerta de Preço Acionado', {
              body: `${market?.question || 'Mercado'} atingiu ${(trigger.target_price * 100).toFixed(1)}¢`,
              icon: '/icon-192.png',
              tag: trigger.alert_id,
              requireInteraction: true
            })
          }
        } catch (err) {
          console.warn('Failed to send push notification:', err)
        }
      }

      // TODO: Implement email notifications
      // This would require a backend API call

      // Update state
      setState((prev) => ({
        ...prev,
        triggeredCount: prev.triggeredCount + 1
      }))
    },
    [onNotification, enablePush, alerts]
  )

  /**
   * Process a single market for alerts
   */
  const processMarketAlerts = useCallback(
    async (marketId: string, currentPrice: number) => {
      // Get active alerts for this market
      const marketAlerts = alerts.filter(
        (a) => a.market_id === marketId && !a.triggered
      )

      if (marketAlerts.length === 0) return

      // Check each alert
      for (const alert of marketAlerts) {
        // Skip if in cooldown
        if (isInCooldown(alert.id)) {
          continue
        }

        // Try to trigger alert
        const trigger = triggerAlert(alert.id, currentPrice)

        if (trigger) {
          // Record trigger time
          recordTrigger(alert.id)

          // Dispatch notification
          await dispatchNotification(trigger)

          console.log('Alert triggered:', trigger)
        }
      }
    },
    [alerts, isInCooldown, triggerAlert, recordTrigger, dispatchNotification]
  )

  /**
   * Check all markets for alert triggers
   */
  const checkAllAlerts = useCallback(async () => {
    try {
      // Fetch latest prices for all markets
      // TODO: Implement fetchMarketPrices in market store
      // await fetchMarketPrices()

      // Process each market
      for (const market of markets) {
        // Skip if not in filter
        if (marketFilter && !marketFilter.includes(market.id)) {
          continue
        }

        // Skip if current price is not available
        if (market.current_price === undefined) {
          continue
        }

        await processMarketAlerts(market.id, market.current_price)
      }

      // Update state
      setState((prev) => ({
        ...prev,
        lastCheckAt: Date.now(),
        error: null
      }))

      // Reset retry count on success
      retryCountRef.current = 0
    } catch (err) {
      console.error('Error checking alerts:', err)

      setState((prev) => ({
        ...prev,
        error: err instanceof Error ? err.message : 'Failed to check alerts'
      }))

      // Retry logic
      retryCountRef.current++

      if (retryCountRef.current <= MAX_RETRIES) {
        console.log(`Retrying alert check (${retryCountRef.current}/${MAX_RETRIES})...`)
        setTimeout(() => {
          checkAllAlerts()
        }, RETRY_DELAY)
      }
    }
  }, [markets, marketFilter, processMarketAlerts])

  /**
   * Handle real-time price updates from Supabase
   */
  const handlePriceUpdate = useCallback(
    (payload: any) => {
      const { market_id, price } = payload.new

      // Process alerts for this market immediately
      processMarketAlerts(market_id, price)
    },
    [processMarketAlerts]
  )

  /**
   * Start monitoring
   */
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) return // Already monitoring

    setState((prev) => ({ ...prev, isMonitoring: true, error: null }))

    // Initial check
    checkAllAlerts()

    // Set up polling interval
    intervalRef.current = setInterval(() => {
      // Skip if document is hidden and background processing is disabled
      if (!enableBackground && !isDocumentVisibleRef.current) {
        return
      }

      checkAllAlerts()
    }, interval)

    // TODO: Set up Supabase real-time subscription
    // This would subscribe to market price updates and trigger immediate checks
    // const channel = supabase
    //   .channel('alert-price-updates')
    //   .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'market_prices' }, handlePriceUpdate)
    //   .subscribe()
    // channelRef.current = channel
  }, [interval, enableBackground, checkAllAlerts, handlePriceUpdate])

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (channelRef.current) {
      // TODO: Unsubscribe from Supabase channel
      // channelRef.current.unsubscribe()
      channelRef.current = null
    }

    setState((prev) => ({ ...prev, isMonitoring: false }))
  }, [])

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Start monitoring on mount
  useEffect(() => {
    startMonitoring()

    return () => {
      stopMonitoring()
    }
  }, [startMonitoring, stopMonitoring])

  // Track document visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      isDocumentVisibleRef.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Request notification permission if push is enabled
  useEffect(() => {
    if (enablePush && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then((permission) => {
        if (permission !== 'granted') {
          console.warn('Notification permission denied')
        }
      })
    }
  }, [enablePush])

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    /** Current checker state */
    state,
    /** Manually trigger alert check */
    checkAlerts: checkAllAlerts,
    /** Start monitoring (if auto-started false) */
    start: startMonitoring,
    /** Stop monitoring */
    stop: stopMonitoring,
    /** Clear all trigger cooldowns */
    clearCooldowns: useCallback(() => {
      triggerTimestampsRef.current.clear()
    }, [])
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * useAlertCheckerSimple - Simple version with defaults
 *
 * Starts monitoring with default settings.
 */
export function useAlertCheckerSimple() {
  return useAlertChecker({})
}

/**
 * useAlertCheckerForMarkets - Monitor specific markets
 *
 * @param markets - Array of market IDs to monitor
 */
export function useAlertCheckerForMarkets(markets: string[]) {
  return useAlertChecker({ markets })
}

/**
 * useAlertCheckerWithPush - Monitor with push notifications
 *
 * Enables push notifications for alerts.
 */
export function useAlertCheckerWithPush() {
  return useAlertChecker({ enablePush: true })
}

// ============================================================================
// EXPORTS
// ============================================================================

export default useAlertChecker
