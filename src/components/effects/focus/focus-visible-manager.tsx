/**
 * Focus Visible Manager
 *
 * Distinguish between mouse and keyboard focus.
 * Automatically adds focus-visible class for keyboard navigation.
 *
 * Features:
 * - Automatic focus-visible tracking
 * - Keyboard vs mouse detection
 * - Focus history tracking
 * - Custom handler support
 * - Works with :focus-visible CSS pseudo-class
 *
 * @example
 * ```tsx
 * import { FocusVisibleManager, useFocusVisible } from './focus-visible-manager'
 *
 * // Component-wide
 * <FocusVisibleManager>
 *   <App />
 * </FocusVisibleManager>
 *
 * // Hook usage
 * const isFocusVisible = useFocusVisible()
 * ```
 */

import * as React from "react"

// ============================================================================
// CONTEXT
// ============================================================================

interface FocusVisibleContextValue {
  isFocusVisible: boolean
  lastInputMethod: "keyboard" | "mouse" | "touch" | null
}

const FocusVisibleContext = React.createContext<FocusVisibleContextValue>({
  isFocusVisible: true,
  lastInputMethod: null,
})

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export interface FocusVisibleManagerProps {
  /**
   * App children
   */
  children: React.ReactNode

  /**
   * Class name to add for keyboard focus
   * @default "focus-visible"
   */
  className?: string

  /**
   * Enable focus-visible tracking
   * @default true
   */
  enabled?: boolean
}

/**
 * FocusVisibleManager - Manages focus-visible state app-wide
 */
export const FocusVisibleManager: React.FC<FocusVisibleManagerProps> = ({
  children,
  className = "focus-visible",
  enabled = true,
}) => {
  const [isFocusVisible, setIsFocusVisible] = React.useState(true)
  const [lastInputMethod, setLastInputMethod] = React.useState<
    "keyboard" | "mouse" | "touch" | null
  >(null)

  React.useEffect(() => {
    if (!enabled) return
    if (typeof window === "undefined") return

    let hadKeyboardEvent = false
    let hadFocusVisibleRecently = false

    // Handle keyboard events
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab" || e.key === "Escape" || e.key === "ArrowUp" ||
          e.key === "ArrowDown" || e.key === "ArrowLeft" || e.key === "ArrowRight") {
        hadKeyboardEvent = true
        setLastInputMethod("keyboard")
      }
    }

    // Handle pointer events
    const handlePointerDown = () => {
      hadKeyboardEvent = false
      setLastInputMethod("mouse")
    }

    // Handle focus events
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement

      if (hadKeyboardEvent || hadFocusVisibleRecently) {
        target.classList.add(className)
        setIsFocusVisible(true)
      } else {
        target.classList.remove(className)
        setIsFocusVisible(false)
      }
    }

    const handleBlur = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      target.classList.remove(className)
    }

    // Track recent keyboard focus
    const resetFocusVisibleTimeout = () => {
      hadFocusVisibleRecently = false
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null

    const scheduleReset = () => {
      if (timeoutId) clearTimeout(timeoutId)
      timeoutId = setTimeout(resetFocusVisibleTimeout, 100)
    }

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown, true)
    document.addEventListener("mousedown", handlePointerDown, true)
    document.addEventListener("pointerdown", handlePointerDown, true)
    document.addEventListener("focus", handleFocus, true)
    document.addEventListener("blur", handleBlur, true)
    document.addEventListener("keydown", scheduleReset, true)

    return () => {
      if (timeoutId) clearTimeout(timeoutId)
      document.removeEventListener("keydown", handleKeyDown, true)
      document.removeEventListener("mousedown", handlePointerDown, true)
      document.removeEventListener("pointerdown", handlePointerDown, true)
      document.removeEventListener("focus", handleFocus, true)
      document.removeEventListener("blur", handleBlur, true)
      document.removeEventListener("keydown", scheduleReset, true)
    }
  }, [className, enabled])

  const contextValue: FocusVisibleContextValue = {
    isFocusVisible,
    lastInputMethod,
  }

  return (
    <FocusVisibleContext.Provider value={contextValue}>
      {children}
    </FocusVisibleContext.Provider>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useFocusVisible - Check if current focus is from keyboard
 */
export function useFocusVisible(): boolean {
  const context = React.useContext(FocusVisibleContext)
  return context.isFocusVisible
}

/**
 * useInputMethod - Get last input method (keyboard/mouse/touch)
 */
export function useInputMethod(): "keyboard" | "mouse" | "touch" | null {
  const context = React.useContext(FocusVisibleContext)
  return context.lastInputMethod
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if an element has focus-visible class
 */
export function hasFocusVisible(element: HTMLElement, className = "focus-visible"): boolean {
  return element.classList.contains(className)
}

/**
 * Add focus-visible class to an element
 */
export function addFocusVisible(element: HTMLElement, className = "focus-visible"): void {
  element.classList.add(className)
}

/**
 * Remove focus-visible class from an element
 */
export function removeFocusVisible(element: HTMLElement, className = "focus-visible"): void {
  element.classList.remove(className)
}

/**
 * Toggle focus-visible class on an element
 */
export function toggleFocusVisible(
  element: HTMLElement,
  show: boolean,
  className = "focus-visible"
): void {
  if (show) {
    addFocusVisible(element, className)
  } else {
    removeFocusVisible(element, className)
  }
}

// ============================================================================
// HOOK FOR ELEMENT-LEVEL TRACKING
// ============================================================================

export interface UseFocusVisibleElementOptions {
  /**
   * Custom class name
   */
  className?: string

  /**
   * Callback when focus-visible state changes
   */
  onChange?: (isFocusVisible: boolean) => void
}

/**
 * Track focus-visible state for a specific element
 */
export function useFocusVisibleElement(
  options: UseFocusVisibleElementOptions = {}
): {
  ref: React.RefObject<HTMLElement>
  isFocusVisible: boolean
} {
  const { className = "focus-visible", onChange } = options
  const ref = React.useRef<HTMLElement>(null)
  const [isFocusVisible, setIsFocusVisible] = React.useState(false)

  React.useEffect(() => {
    const element = ref.current
    if (!element) return

    let hadKeyboardEvent = false

    const handleKeyDown = () => {
      hadKeyboardEvent = true
    }

    const handlePointerDown = () => {
      hadKeyboardEvent = false
    }

    const handleFocus = () => {
      const visible = hadKeyboardEvent
      setIsFocusVisible(visible)
      if (visible) {
        element.classList.add(className)
      } else {
        element.classList.remove(className)
      }
      onChange?.(visible)
    }

    const handleBlur = () => {
      element.classList.remove(className)
    }

    element.addEventListener("keydown", handleKeyDown)
    element.addEventListener("mousedown", handlePointerDown)
    element.addEventListener("focus", handleFocus)
    element.addEventListener("blur", handleBlur)

    return () => {
      element.removeEventListener("keydown", handleKeyDown)
      element.removeEventListener("mousedown", handlePointerDown)
      element.removeEventListener("focus", handleFocus)
      element.removeEventListener("blur", handleBlur)
    }
  }, [className, onChange])

  return { ref, isFocusVisible }
}

export default FocusVisibleManager
