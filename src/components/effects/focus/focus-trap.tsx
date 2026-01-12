/**
 * Focus Trap
 *
 * Trap focus within a component for modals, dialogs, and dropdowns.
 * Ensures accessibility by keeping keyboard navigation contained.
 *
 * Features:
 * - Automatic focus trapping
 * - Focus restoration on unmount
 * - Configurable initial focus
 * - Escape key callback
 * - ARIA attributes management
 *
 * @example
 * ```tsx
 * import { FocusTrap } from './focus-trap'
 *
 * <FocusTrap active={isOpen} onEscape={() => setIsOpen(false)}>
 *   <DialogContent>Modal content</DialogContent>
 * </FocusTrap>
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface FocusTrapProps {
  /**
   * Children to trap focus within
   */
  children: React.ReactNode

  /**
   * Enable focus trap
   * @default true
   */
  active?: boolean

  /**
   * CSS selector for element to focus initially
   */
  initialFocus?: string

  /**
   * Restore focus to previously focused element on unmount
   * @default true
   */
  restoreFocus?: boolean

  /**
   * Callback when Escape key is pressed
   */
  onEscape?: () => void

  /**
   * Additional classes
   */
  className?: string

  /**
   * Additional props for container
   */
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

// ============================================================================
// FOCUSABLE SELECTORS
// ============================================================================

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ")

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FocusTrap - Trap keyboard focus within a container
 */
export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  initialFocus,
  restoreFocus = true,
  onEscape,
  className,
  containerProps,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)

  // Trap focus
  React.useEffect(() => {
    if (!active) return

    const container = containerRef.current
    if (!container) return

    // Store previously focused element
    previousActiveElementRef.current = document.activeElement as HTMLElement

    // Get focusable elements
    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    )

    if (focusableElements.length === 0) return

    // Set initial focus
    const initialElement =
      initialFocus && container.querySelector<HTMLElement>(initialFocus)
    if (initialElement) {
      initialElement.focus()
    } else {
      focusableElements[0]?.focus()
    }

    // Handle tab key
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      // Handle shift + tab
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape()
      }
    }

    document.addEventListener("keydown", handleTab)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleTab)
      document.removeEventListener("keydown", handleEscape)

      // Restore focus
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }
  }, [active, initialFocus, restoreFocus, onEscape])

  return (
    <div
      ref={containerRef}
      className={cn(className)}
      {...containerProps}
    >
      {children}
    </div>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for focus trap functionality
 */
export interface UseFocusTrapOptions {
  active?: boolean
  initialFocus?: string
  restoreFocus?: boolean
  onEscape?: () => void
}

export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const {
    active = true,
    initialFocus,
    restoreFocus = true,
    onEscape,
  } = options

  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)
  const [isTrapped, setIsTrapped] = React.useState(false)

  const activate = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return

    previousActiveElementRef.current = document.activeElement as HTMLElement

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    )

    if (focusableElements.length === 0) return

    const initialElement =
      initialFocus && container.querySelector<HTMLElement>(initialFocus)
    if (initialElement) {
      initialElement.focus()
    } else {
      focusableElements[0]?.focus()
    }

    setIsTrapped(true)
  }, [initialFocus])

  const deactivate = React.useCallback(() => {
    setIsTrapped(false)

    if (restoreFocus && previousActiveElementRef.current) {
      previousActiveElementRef.current.focus()
    }
  }, [restoreFocus])

  // Auto-activate when active changes to true
  React.useEffect(() => {
    if (active) {
      activate()
    } else {
      deactivate()
    }
  }, [active, activate, deactivate])

  // Handle keyboard
  React.useEffect(() => {
    if (!isTrapped) return

    const container = containerRef.current
    if (!container) return

    const focusableElements = Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    )

    if (focusableElements.length === 0) return

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement?.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement?.focus()
        }
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        onEscape()
      }
    }

    document.addEventListener("keydown", handleTab)
    document.addEventListener("keydown", handleEscape)

    return () => {
      document.removeEventListener("keydown", handleTab)
      document.removeEventListener("keydown", handleEscape)
    }
  }, [isTrapped, onEscape])

  return {
    containerRef,
    activate,
    deactivate,
    isTrapped,
  }
}

export default FocusTrap
