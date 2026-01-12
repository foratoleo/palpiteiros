"use client"

import * as React from "react"
import { toast } from "./use-toast"
import { ToastAction } from "./toast"
import type { ToastVariant } from "@/types/ui.types"
import { ToastPosition } from "@/types/ui.types"

/**
 * Toast Notification Options
 *
 * Extended options for creating toast notifications with additional features.
 */
export interface ToastNotificationOptions {
  /** Toast variant */
  variant?: ToastVariant
  /** Notification title */
  title?: string
  /** Notification message */
  message?: string
  /** Duration in milliseconds (0 = no auto-dismiss) */
  duration?: number
  /** Position on screen */
  position?: ToastPosition
  /** Whether toast can be manually dismissed */
  dismissible?: boolean
  /** Optional action button */
  action?: {
    label: string
    onClick: () => void
  }
  /** Custom icon (false to hide) */
  icon?: false | React.ReactNode
  /** Show progress bar for auto-dismiss */
  showProgress?: boolean
  /** Sound effect */
  sound?: boolean
  /** Haptic feedback for mobile */
  haptic?: boolean
  /** Persistent toast (requires user action to dismiss) */
  persistent?: boolean
  /** Update an existing toast by ID */
  updateId?: string
  /** Callback when toast is dismissed */
  onDismiss?: () => void
  /** Callback when action is clicked */
  onActionClick?: () => void
}

/**
 * Toast Notification Manager Options
 *
 * Global configuration for toast notifications.
 */
export interface ToastNotificationManagerConfig {
  /** Default duration for toasts */
  defaultDuration?: number
  /** Maximum number of toasts to show */
  maxToasts?: number
  /** Enable sound effects by default */
  soundEnabled?: boolean
  /** Enable haptic feedback by default */
  hapticEnabled?: boolean
  /** Default position for toasts */
  defaultPosition?: ToastPosition
}

/**
 * Default configuration
 */
const defaultConfig: ToastNotificationManagerConfig = {
  defaultDuration: 5000,
  maxToasts: 5,
  soundEnabled: false,
  hapticEnabled: true,
  defaultPosition: ToastPosition.BOTTOM_RIGHT,
}

/**
 * Toast Notification Manager
 *
 * Advanced toast management with additional features.
 */
class ToastNotificationManager {
  private config: ToastNotificationManagerConfig
  private activeToasts = new Map<string, { createdAt: number }>()
  private soundContext: AudioContext | null = null

  constructor(config: ToastNotificationManagerConfig = {}) {
    this.config = { ...defaultConfig, ...config }
  }

  /**
   * Update configuration
   */
  setConfig(config: Partial<ToastNotificationManagerConfig>) {
    this.config = { ...this.config, ...config }
  }

  /**
   * Get current configuration
   */
  getConfig() {
    return { ...this.config }
  }

  /**
   * Play notification sound
   */
  private playSound(variant: ToastVariant) {
    if (!this.config.soundEnabled) return

    try {
      if (!this.soundContext) {
        this.soundContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      }

      const oscillator = this.soundContext.createOscillator()
      const gainNode = this.soundContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.soundContext.destination)

      // Different frequencies for different variants
      const frequencies = {
        default: 800,
        success: 880, // A5
        error: 220, // A3
        warning: 440, // A4
        info: 660, // E5
      }

      oscillator.frequency.value = frequencies[variant] || frequencies.default
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, this.soundContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.soundContext.currentTime + 0.2)

      oscillator.start(this.soundContext.currentTime)
      oscillator.stop(this.soundContext.currentTime + 0.2)
    } catch (e) {
      // Audio not supported or allowed
      console.warn("Sound playback failed:", e)
    }
  }

  /**
   * Trigger haptic feedback
   */
  private triggerHaptic(variant: ToastVariant) {
    if (!this.config.hapticEnabled) return

    try {
      const navigatorVibrate = (navigator as any).vibrate
      if (navigatorVibrate) {
        const patterns = {
          default: [10],
          success: [10, 50, 10],
          error: [50, 50, 50],
          warning: [20],
          info: [10],
        }
        navigatorVibrate(patterns[variant] || patterns.default)
      }
    } catch (e) {
      // Haptic feedback not supported
    }
  }

  /**
   * Clean up expired toasts
   */
  private cleanupExpiredToasts() {
    const now = Date.now()
    const maxAge = this.config.defaultDuration! + 1000 // Add buffer

    for (const [id, data] of this.activeToasts.entries()) {
      if (now - data.createdAt > maxAge) {
        this.activeToasts.delete(id)
      }
    }

    // Enforce max toasts limit
    if (this.activeToasts.size >= this.config.maxToasts!) {
      const oldest = Array.from(this.activeToasts.entries()).sort(
        (a, b) => a[1].createdAt - b[1].createdAt
      )[0]
      if (oldest) {
        this.activeToasts.delete(oldest[0])
        toast.dismiss(oldest[0])
      }
    }
  }

  /**
   * Show a toast notification
   */
  notify(options: ToastNotificationOptions) {
    this.cleanupExpiredToasts()

    const {
      variant = "default",
      title,
      message,
      duration = this.config.defaultDuration,
      position = this.config.defaultPosition,
      dismissible = true,
      action,
      icon,
      showProgress,
      sound = this.config.soundEnabled,
      haptic = this.config.hapticEnabled,
      persistent = false,
      updateId,
      onDismiss,
      onActionClick,
    } = options

    // Play sound if enabled
    if (sound) {
      this.playSound(variant)
    }

    // Trigger haptic if enabled
    if (haptic) {
      this.triggerHaptic(variant)
    }

    // Create the toast
    const result = toast({
      variant,
      title,
      description: message,
      duration: persistent ? 0 : duration,
      action: action
        ? React.createElement(
            ToastAction,
            {
              onClick: () => {
                action.onClick()
                onActionClick?.()
              },
              altText: action.label,
            },
            action.label
          )
        : undefined,
      icon,
      showProgress,
      showClose: dismissible,
    })

    // Track active toast
    this.activeToasts.set(result.id, { createdAt: Date.now() })

    // Handle dismiss callback
    if (onDismiss) {
      const originalDismiss = result.dismiss
      result.dismiss = () => {
        onDismiss()
        originalDismiss()
      }
    }

    return result
  }

  /**
   * Success notification
   */
  success(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
    return this.notify({ variant: "success", title, message, ...options })
  }

  /**
   * Error notification
   */
  error(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
    return this.notify({ variant: "error", title, message, ...options })
  }

  /**
   * Warning notification
   */
  warning(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
    return this.notify({ variant: "warning", title, message, ...options })
  }

  /**
   * Info notification
   */
  info(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
    return this.notify({ variant: "info", title, message, ...options })
  }

  /**
   * Loading notification
   */
  loading(title: string, message?: string) {
    return this.notify({
      variant: "default",
      title,
      message,
      duration: 0,
      dismissible: false,
      icon: false,
    })
  }

  /**
   * Promise notification
   */
  async promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => { title: string; message?: string })
      error: string | ((error: Error) => { title: string; message?: string })
    },
    options?: Partial<ToastNotificationOptions>
  ): Promise<T> {
    const loadingToast = this.loading(messages.loading)

    try {
      const result = await promise
      loadingToast.dismiss()

      const successMessages =
        typeof messages.success === "function"
          ? messages.success(result)
          : { title: messages.success }

      this.success(successMessages.title, successMessages.message, options)
      return result
    } catch (error) {
      loadingToast.dismiss()

      const errorMessages =
        typeof messages.error === "function"
          ? messages.error(error as Error)
          : { title: messages.error }

      this.error(errorMessages.title, errorMessages.message, options)
      throw error
    }
  }

  /**
   * Dismiss all toasts
   */
  dismissAll() {
    toast.dismiss()
    this.activeToasts.clear()
  }

  /**
   * Dismiss specific toast
   */
  dismiss(id: string) {
    toast.dismiss(id)
    this.activeToasts.delete(id)
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Global toast notification manager instance
 */
export const toastManager = new ToastNotificationManager()

// ============================================================================
// CONVENIENCE FUNCTIONS
// ============================================================================

/**
 * Show a toast notification
 */
export function notify(options: ToastNotificationOptions) {
  return toastManager.notify(options)
}

/**
 * Show success notification
 */
export function notifySuccess(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
  return toastManager.success(title, message, options)
}

/**
 * Show error notification
 */
export function notifyError(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
  return toastManager.error(title, message, options)
}

/**
 * Show warning notification
 */
export function notifyWarning(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
  return toastManager.warning(title, message, options)
}

/**
 * Show info notification
 */
export function notifyInfo(title: string, message?: string, options?: Partial<ToastNotificationOptions>) {
  return toastManager.info(title, message, options)
}

/**
 * Show loading notification
 */
export function notifyLoading(title: string, message?: string) {
  return toastManager.loading(title, message)
}

/**
 * Show promise-based notification
 */
export function notifyPromise<T>(
  promise: Promise<T>,
  messages: {
    loading: string
    success: string | ((data: T) => { title: string; message?: string })
    error: string | ((error: Error) => { title: string; message?: string })
  },
  options?: Partial<ToastNotificationOptions>
) {
  return toastManager.promise(promise, messages, options)
}

/**
 * Dismiss all notifications
 */
export function dismissAllNotifications() {
  toastManager.dismissAll()
}

/**
 * Dismiss specific notification
 */
export function dismissNotification(id: string) {
  toastManager.dismiss(id)
}

// ============================================================================
// REACT HOOKS
// ============================================================================

/**
 * useToastNotification Hook
 *
 * React hook for toast notifications with the notification manager.
 *
 * @example
 * ```tsx
 * const { notify, success, error, promise } = useToastNotification()
 *
 * success("Saved!", "Your changes have been saved.")
 *
 * await promise(apiCall(), {
 *   loading: "Saving...",
 *   success: (data) => ({ title: "Saved!", message: `ID: ${data.id}` }),
 *   error: (err) => ({ title: "Error", message: err.message })
 * })
 * ```
 */
export function useToastNotification(config?: Partial<ToastNotificationManagerConfig>) {
  // Update config if provided
  React.useEffect(() => {
    if (config) {
      toastManager.setConfig(config)
    }
  }, [config])

  const notify = React.useCallback(
    (options: ToastNotificationOptions) => toastManager.notify(options),
    []
  )

  const success = React.useCallback(
    (title: string, message?: string, options?: Partial<ToastNotificationOptions>) =>
      toastManager.success(title, message, options),
    []
  )

  const error = React.useCallback(
    (title: string, message?: string, options?: Partial<ToastNotificationOptions>) =>
      toastManager.error(title, message, options),
    []
  )

  const warning = React.useCallback(
    (title: string, message?: string, options?: Partial<ToastNotificationOptions>) =>
      toastManager.warning(title, message, options),
    []
  )

  const info = React.useCallback(
    (title: string, message?: string, options?: Partial<ToastNotificationOptions>) =>
      toastManager.info(title, message, options),
    []
  )

  const loading = React.useCallback(
    (title: string, message?: string) => toastManager.loading(title, message),
    []
  )

  const promise = React.useCallback(
    <T,>(
      p: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => { title: string; message?: string })
        error: string | ((error: Error) => { title: string; message?: string })
      },
      options?: Partial<ToastNotificationOptions>
    ) => toastManager.promise(p, messages, options),
    []
  )

  const dismissAll = React.useCallback(() => toastManager.dismissAll(), [])
  const dismiss = React.useCallback((id: string) => toastManager.dismiss(id), [])

  return {
    notify,
    success,
    error,
    warning,
    info,
    loading,
    promise,
    dismissAll,
    dismiss,
  }
}

/**
 * useToastNotificationConfig Hook
 *
 * Hook to configure the toast notification manager.
 */
export function useToastNotificationConfig() {
  const setConfig = React.useCallback(
    (config: Partial<ToastNotificationManagerConfig>) => {
      toastManager.setConfig(config)
    },
    []
  )

  const enableSound = React.useCallback(() => {
    toastManager.setConfig({ soundEnabled: true })
  }, [])

  const disableSound = React.useCallback(() => {
    toastManager.setConfig({ soundEnabled: false })
  }, [])

  const enableHaptic = React.useCallback(() => {
    toastManager.setConfig({ hapticEnabled: true })
  }, [])

  const disableHaptic = React.useCallback(() => {
    toastManager.setConfig({ hapticEnabled: false })
  }, [])

  return {
    setConfig,
    enableSound,
    disableSound,
    enableHaptic,
    disableHaptic,
  }
}
