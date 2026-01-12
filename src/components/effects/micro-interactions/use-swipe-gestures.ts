/**
 * Swipe Gesture Hook
 *
 * Apple-inspired swipe gesture detection for touch interactions.
 * Supports swipe to delete, refresh, navigate, and more.
 *
 * Features:
 * - Touch and mouse support
 * - Configurable thresholds
 * - Direction detection (left, right, up, down)
 * - Velocity calculation
 * - Callback hooks
 * - Haptic feedback support
 *
 * @example
 * ```tsx
 * import { useSwipeGestures } from "./use-swipe-gestures"
 *
 * function SwipeableItem() {
 *   const { ref, isDragging, direction } = useSwipeGestures({
 *     onSwipeLeft: () => console.log("Swiped left"),
 *     onSwipeRight: () => console.log("Swiped right"),
 *     threshold: 50,
 *   })
 *
 *   return (
 *     <div ref={ref} style={{ transform: isDragging ? `translateX(${direction.x}px)` : undefined }}>
 *       Swipe me
 *     </div>
 *   )
 * }
 * ```
 */

import * as React from "react"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Swipe direction
 */
export type SwipeDirection = "left" | "right" | "up" | "down" | null

/**
 * Swipe state
 */
export interface SwipeState {
  /** Currently dragging */
  isDragging: boolean
  /** Current swipe position */
  x: number
  /** Current swipe position */
  y: number
  /** Detected swipe direction */
  direction: SwipeDirection
  /** Swipe velocity */
  velocity: number
  /** Has exceeded threshold */
  hasExceededThreshold: boolean
}

/**
 * Swipe gesture configuration
 */
export interface SwipeGestureConfig {
  /** Minimum distance to trigger swipe (default: 50) */
  threshold?: number
  /** Maximum time for swipe gesture (default: 500ms) */
  maxDuration?: number
  /** Minimum velocity to trigger swipe (default: 0.5) */
  minVelocity?: number
  /** Enable swipe left */
  enableLeft?: boolean
  /** Enable swipe right */
  enableRight?: boolean
  /** Enable swipe up */
  enableUp?: boolean
  /** Enable swipe down */
  enableDown?: boolean
  /** Callback when swipe starts */
  onSwipeStart?: (state: SwipeState) => void
  /** Callback when swipe moves */
  onSwipeMove?: (state: SwipeState) => void
  /** Callback when swipe ends (threshold met) */
  onSwipeEnd?: (direction: SwipeDirection, state: SwipeState) => void
  /** Callback when swipe left */
  onSwipeLeft?: (state: SwipeState) => void
  /** Callback when swipe right */
  onSwipeRight?: (state: SwipeState) => void
  /** Callback when swipe up */
  onSwipeUp?: (state: SwipeState) => void
  /** Callback when swipe down */
  onSwipeDown?: (state: SwipeState) => void
  /** Callback when swipe is cancelled (threshold not met) */
  onSwipeCancel?: (state: SwipeState) => void
  /** Haptic feedback on swipe (Vibration API) */
  hapticFeedback?: boolean
  /** Prevent default scroll on swipe */
  preventScroll?: boolean
  /** Debounce swipe end (default: true) */
  debounceEnd?: boolean
}

/**
 * Swipe gesture handlers
 */
export interface SwipeGestureHandlers {
  /** Element ref to attach gesture to */
  ref: React.RefObject<HTMLElement>
  /** Current swipe state */
  state: SwipeState
  /** Programmatically cancel swipe */
  cancel: () => void
  /** Programmatically trigger swipe */
  trigger: (direction: SwipeDirection) => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default swipe configuration
 */
export const DEFAULT_SWIPE_CONFIG: Required<Omit<SwipeGestureConfig, "onSwipeStart" | "onSwipeMove" | "onSwipeEnd" | "onSwipeLeft" | "onSwipeRight" | "onSwipeUp" | "onSwipeDown" | "onSwipeCancel">> = {
  threshold: 50,
  maxDuration: 500,
  minVelocity: 0.5,
  enableLeft: true,
  enableRight: true,
  enableUp: false,
  enableDown: false,
  hapticFeedback: false,
  preventScroll: false,
  debounceEnd: true,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate distance between two points
 */
function getDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

/**
 * Calculate velocity
 */
function getVelocity(distance: number, duration: number): number {
  return duration > 0 ? distance / duration : 0
}

/**
 * Determine swipe direction based on delta
 */
function getSwipeDirection(dx: number, dy: number): SwipeDirection {
  const absDx = Math.abs(dx)
  const absDy = Math.abs(dy)

  if (Math.max(absDx, absDy) < 10) return null

  if (absDx > absDy) {
    return dx > 0 ? "right" : "left"
  } else {
    return dy > 0 ? "down" : "up"
  }
}

/**
 * Trigger haptic feedback
 */
function triggerHaptic(type: "light" | "medium" | "heavy" = "medium"): void {
  if (typeof navigator === "undefined") return
  const vibration = navigator.vibrate
  if (vibration) {
    const duration = type === "light" ? 10 : type === "medium" ? 20 : 30
    vibration(duration)
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Swipe gesture hook
 * Provides touch and mouse swipe detection with callbacks
 */
export function useSwipeGestures(config: SwipeGestureConfig = {}): SwipeGestureHandlers {
  const {
    threshold,
    maxDuration,
    minVelocity,
    enableLeft,
    enableRight,
    enableUp,
    enableDown,
    onSwipeStart,
    onSwipeMove,
    onSwipeEnd,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipeCancel,
    hapticFeedback,
    preventScroll,
    debounceEnd,
  } = { ...DEFAULT_SWIPE_CONFIG, ...config }

  const ref = React.useRef<HTMLElement>(null)
  const startPos = React.useRef({ x: 0, y: 0 })
  const startTime = React.useRef(0)
  const [state, setState] = React.useState<SwipeState>({
    isDragging: false,
    x: 0,
    y: 0,
    direction: null,
    velocity: 0,
    hasExceededThreshold: false,
  })

  // Reset state helper
  const resetState = React.useCallback(() => {
    setState({
      isDragging: false,
      x: 0,
      y: 0,
      direction: null,
      velocity: 0,
      hasExceededThreshold: false,
    })
  }, [])

  // Cancel swipe helper
  const cancel = React.useCallback(() => {
    resetState()
  }, [resetState])

  // Trigger swipe programmatically
  const trigger = React.useCallback((direction: SwipeDirection) => {
    if (!direction) return

    const swipeState: SwipeState = {
      isDragging: false,
      x: direction === "left" ? -threshold : direction === "right" ? threshold : 0,
      y: direction === "up" ? -threshold : direction === "down" ? threshold : 0,
      direction,
      velocity: 1,
      hasExceededThreshold: true,
    }

    onSwipeEnd?.(direction, swipeState)

    if (direction === "left" && onSwipeLeft) onSwipeLeft(swipeState)
    if (direction === "right" && onSwipeRight) onSwipeRight(swipeState)
    if (direction === "up" && onSwipeUp) onSwipeUp(swipeState)
    if (direction === "down" && onSwipeDown) onSwipeDown(swipeState)

    if (hapticFeedback) triggerHaptic("medium")
  }, [threshold, onSwipeEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, hapticFeedback])

  // Handle pointer down
  const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
    if (!ref.current?.contains(e.target as Node)) return
    if (e.button !== 0) return // Only primary button

    startPos.current = { x: e.clientX, y: e.clientY }
    startTime.current = Date.now()

    const newState: SwipeState = {
      isDragging: true,
      x: 0,
      y: 0,
      direction: null,
      velocity: 0,
      hasExceededThreshold: false,
    }

    setState(newState)
    onSwipeStart?.(newState)

    if (preventScroll) {
      e.currentTarget.setPointerCapture(e.pointerId)
    }
  }, [onSwipeStart, preventScroll])

  // Handle pointer move
  const handlePointerMove = React.useCallback((e: React.PointerEvent) => {
    if (!state.isDragging) return

    const dx = e.clientX - startPos.current.x
    const dy = e.clientY - startPos.current.y
    const duration = Date.now() - startTime.current
    const distance = getDistance(0, 0, dx, dy)
    const velocity = getVelocity(distance, duration)
    const direction = getSwipeDirection(dx, dy)
    const hasExceededThreshold = distance >= threshold

    // Check if direction is enabled
    let isEnabled = false
    if (direction === "left" && enableLeft) isEnabled = true
    if (direction === "right" && enableRight) isEnabled = true
    if (direction === "up" && enableUp) isEnabled = true
    if (direction === "down" && enableDown) isEnabled = true

    const newState: SwipeState = {
      isDragging: true,
      x: isEnabled ? dx : 0,
      y: isEnabled ? dy : 0,
      direction: isEnabled ? direction : null,
      velocity,
      hasExceededThreshold: isEnabled && hasExceededThreshold,
    }

    setState(newState)
    onSwipeMove?.(newState)

    // Haptic feedback when threshold is exceeded
    if (hapticFeedback && hasExceededThreshold && !state.hasExceededThreshold) {
      triggerHaptic("light")
    }
  }, [state.isDragging, state.hasExceededThreshold, threshold, enableLeft, enableRight, enableUp, enableDown, onSwipeMove, hapticFeedback])

  // Handle pointer up
  const handlePointerUp = React.useCallback((e: React.PointerEvent) => {
    if (!state.isDragging) return

    const duration = Date.now() - startTime.current
    const distance = getDistance(0, 0, state.x, state.y)
    const velocity = getVelocity(distance, duration)

    // Check if swipe is valid
    const isValidSwipe =
      distance >= threshold &&
      duration <= maxDuration &&
      velocity >= minVelocity

    if (isValidSwipe && state.direction) {
      // Determine final direction
      const finalDirection = getSwipeDirection(state.x, state.y)

      const finalState: SwipeState = {
        ...state,
        isDragging: false,
        velocity,
        hasExceededThreshold: true,
      }

      onSwipeEnd?.(finalDirection, finalState)

      // Call direction-specific callbacks
      if (finalDirection === "left" && onSwipeLeft) onSwipeLeft(finalState)
      if (finalDirection === "right" && onSwipeRight) onSwipeRight(finalState)
      if (finalDirection === "up" && onSwipeUp) onSwipeUp(finalState)
      if (finalDirection === "down" && onSwipeDown) onSwipeDown(finalState)

      if (hapticFeedback) triggerHaptic("medium")
    } else {
      // Swipe cancelled
      onSwipeCancel?.(state)
    }

    resetState()
  }, [state, threshold, maxDuration, minVelocity, onSwipeEnd, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipeCancel, hapticFeedback, resetState])

  // Attach event listeners
  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    element.addEventListener("pointerdown", handlePointerDown as unknown as EventListener)
    element.addEventListener("pointermove", handlePointerMove as unknown as EventListener)
    element.addEventListener("pointerup", handlePointerUp as unknown as EventListener)
    element.addEventListener("pointercancel", resetState as unknown as EventListener)
    element.addEventListener("pointerleave", resetState as unknown as EventListener)

    return () => {
      element.removeEventListener("pointerdown", handlePointerDown as unknown as EventListener)
      element.removeEventListener("pointermove", handlePointerMove as unknown as EventListener)
      element.removeEventListener("pointerup", handlePointerUp as unknown as EventListener)
      element.removeEventListener("pointercancel", resetState as unknown as EventListener)
      element.removeEventListener("pointerleave", resetState as unknown as EventListener)
    }
  }, [handlePointerDown, handlePointerMove, handlePointerUp, resetState])

  return {
    ref,
    state,
    cancel,
    trigger,
  }
}

// ============================================================================
// SPECIALIZED HOOKS
// ============================================================================

/**
 * Swipe to delete hook
 * Common pattern for list items
 */
export function useSwipeToDelete(config: {
  onDelete?: () => void
  threshold?: number
  hapticFeedback?: boolean
} = {}) {
  return useSwipeGestures({
    threshold: config.threshold ?? 80,
    enableLeft: true,
    enableRight: false,
    enableUp: false,
    enableDown: false,
    onSwipeLeft: config.onDelete,
    hapticFeedback: config.hapticFeedback ?? true,
  })
}

/**
 * Swipe to refresh hook
 */
export function useSwipeToRefresh(config: {
  onRefresh?: () => void | Promise<void>
  threshold?: number
  hapticFeedback?: boolean
} = {}) {
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  return useSwipeGestures({
    threshold: config.threshold ?? 100,
    enableLeft: false,
    enableRight: false,
    enableUp: false,
    enableDown: true,
    onSwipeDown: async (state) => {
      if (!isRefreshing && config.onRefresh) {
        setIsRefreshing(true)
        try {
          await config.onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
    },
    hapticFeedback: config.hapticFeedback ?? true,
  })
}

/**
 * Swipe to navigate hook
 */
export function useSwipeToNavigate(config: {
  onNavigateLeft?: () => void
  onNavigateRight?: () => void
  threshold?: number
} = {}) {
  return useSwipeGestures({
    threshold: config.threshold ?? 60,
    enableLeft: true,
    enableRight: true,
    enableUp: false,
    enableDown: false,
    onSwipeLeft: config.onNavigateLeft,
    onSwipeRight: config.onNavigateRight,
  })
}
