/**
 * Focus Scope
 *
 * Manage focus within a specific region of the page.
 * Automatically moves focus when scope mounts, handles arrow key navigation.
 *
 * Features:
 * - Auto-focus on mount
 * - Arrow key navigation
 * - Home/End key support
 * - Focus restoration on unmount
 * - Configurable navigation behavior
 *
 * @example
 * ```tsx
 * import { FocusScope } from './focus-scope'
 *
 * <FocusScope arrowNavigation>
 *   <nav>
 *     <a href="/">Home</a>
 *     <a href="/about">About</a>
 *   </nav>
 * </FocusScope>
 * ```
 */

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type FocusNavigationDirection = "horizontal" | "vertical" | "both" | "grid"

export interface FocusScopeProps {
  /**
   * Children to manage focus for
   */
  children: React.ReactNode

  /**
   * Enable arrow key navigation
   * @default false
   */
  arrowNavigation?: boolean

  /**
   * Navigation direction
   * @default "both"
   */
  direction?: FocusNavigationDirection

  /**
   * Grid columns count (for grid navigation)
   */
  gridColumns?: number

  /**
   * Auto-focus first element on mount
   * @default false
   */
  autoFocus?: boolean

  /**
   * CSS selector for focusable elements
   */
  focusableSelector?: string

  /**
   * Restore focus on unmount
   * @default true
   */
  restoreFocus?: boolean

  /**
   * Callback when focus changes
   */
  onFocusChange?: (newIndex: number, previousIndex: number) => void

  /**
   * Additional classes
   */
  className?: string

  /**
   * Additional container props
   */
  containerProps?: React.HTMLAttributes<HTMLDivElement>
}

// ============================================================================
// DEFAULT SELECTOR
// ============================================================================

const defaultFocusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(", ")

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FocusScope - Manage focus within a container
 */
export const FocusScope: React.FC<FocusScopeProps> = ({
  children,
  arrowNavigation = false,
  direction = "both",
  gridColumns,
  autoFocus = false,
  focusableSelector = defaultFocusableSelector,
  restoreFocus = true,
  onFocusChange,
  className,
  containerProps,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(-1)

  // Get focusable elements
  const getFocusableElements = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return []

    return Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    )
  }, [focusableSelector])

  // Focus element at index
  const focusElement = React.useCallback(
    (index: number) => {
      const elements = getFocusableElements()
      if (index < 0 || index >= elements.length) return

      const element = elements[index]
      element.focus()
      setCurrentIndex(index)
      onFocusChange?.(index, currentIndex)
    },
    [getFocusableElements, currentIndex, onFocusChange]
  )

  // Handle arrow key navigation
  const handleArrowKey = React.useCallback(
    (e: KeyboardEvent) => {
      if (!arrowNavigation) return

      const elements = getFocusableElements()
      if (elements.length === 0) return

      const currentElement = document.activeElement as HTMLElement
      const currentIndex = elements.indexOf(currentElement)

      if (currentIndex === -1) return

      let newIndex = currentIndex

      switch (e.key) {
        case "ArrowUp":
          if (direction === "vertical" || direction === "both" || direction === "grid") {
            e.preventDefault()
            if (gridColumns) {
              // Grid navigation
              newIndex = Math.max(0, currentIndex - gridColumns)
            } else {
              newIndex = Math.max(0, currentIndex - 1)
            }
          }
          break

        case "ArrowDown":
          if (direction === "vertical" || direction === "both" || direction === "grid") {
            e.preventDefault()
            if (gridColumns) {
              newIndex = Math.min(elements.length - 1, currentIndex + gridColumns)
            } else {
              newIndex = Math.min(elements.length - 1, currentIndex + 1)
            }
          }
          break

        case "ArrowLeft":
          if (direction === "horizontal" || direction === "both" || direction === "grid") {
            e.preventDefault()
            newIndex = Math.max(0, currentIndex - 1)
          }
          break

        case "ArrowRight":
          if (direction === "horizontal" || direction === "both" || direction === "grid") {
            e.preventDefault()
            newIndex = Math.min(elements.length - 1, currentIndex + 1)
          }
          break

        case "Home":
          e.preventDefault()
          newIndex = 0
          break

        case "End":
          e.preventDefault()
          newIndex = elements.length - 1
          break

        default:
          return
      }

      if (newIndex !== currentIndex) {
        focusElement(newIndex)
      }
    },
    [
      arrowNavigation,
      direction,
      gridColumns,
      getFocusableElements,
      focusElement,
      onFocusChange,
    ]
  )

  // Auto-focus on mount
  React.useEffect(() => {
    if (!autoFocus) return

    const elements = getFocusableElements()
    if (elements.length > 0) {
      elements[0].focus()
      setCurrentIndex(0)
    }
  }, [autoFocus, getFocusableElements])

  // Store and restore focus
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Store current focus
    previousActiveElementRef.current = document.activeElement as HTMLElement

    // Add key listener
    document.addEventListener("keydown", handleArrowKey)

    return () => {
      document.removeEventListener("keydown", handleArrowKey)

      // Restore focus
      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }
  }, [handleArrowKey, restoreFocus])

  // Update current index when focus changes naturally
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleFocusIn = (e: FocusEvent) => {
      const elements = getFocusableElements()
      const index = elements.indexOf(e.target as HTMLElement)
      if (index !== -1) {
        setCurrentIndex(index)
      }
    }

    container.addEventListener("focusin", handleFocusIn)

    return () => {
      container.removeEventListener("focusin", handleFocusIn)
    }
  }, [getFocusableElements])

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
 * Hook for focus scope functionality
 */
export interface UseFocusScopeOptions {
  arrowNavigation?: boolean
  direction?: FocusNavigationDirection
  gridColumns?: number
  autoFocus?: boolean
  focusableSelector?: string
  restoreFocus?: boolean
  onFocusChange?: (newIndex: number, previousIndex: number) => void
}

export function useFocusScope(options: UseFocusScopeOptions = {}) {
  const {
    arrowNavigation = false,
    direction = "both",
    gridColumns,
    autoFocus = false,
    focusableSelector = defaultFocusableSelector,
    restoreFocus = true,
    onFocusChange,
  } = options

  const containerRef = React.useRef<HTMLDivElement>(null)
  const previousActiveElementRef = React.useRef<HTMLElement | null>(null)
  const [currentIndex, setCurrentIndex] = React.useState(-1)

  // Get focusable elements
  const getFocusableElements = React.useCallback(() => {
    const container = containerRef.current
    if (!container) return []

    return Array.from(
      container.querySelectorAll<HTMLElement>(focusableSelector)
    )
  }, [focusableSelector])

  // Focus element at index
  const focusElement = React.useCallback(
    (index: number) => {
      const elements = getFocusableElements()
      if (index < 0 || index >= elements.length) return

      const element = elements[index]
      element.focus()
      setCurrentIndex(index)
      onFocusChange?.(index, currentIndex)
    },
    [getFocusableElements, currentIndex, onFocusChange]
  )

  // Handle arrow key navigation
  const handleArrowKey = React.useCallback(
    (e: KeyboardEvent) => {
      if (!arrowNavigation) return

      const elements = getFocusableElements()
      if (elements.length === 0) return

      const currentElement = document.activeElement as HTMLElement
      const currentIndex = elements.indexOf(currentElement)

      if (currentIndex === -1) return

      let newIndex = currentIndex

      switch (e.key) {
        case "ArrowUp":
          if (direction === "vertical" || direction === "both" || direction === "grid") {
            e.preventDefault()
            if (gridColumns) {
              newIndex = Math.max(0, currentIndex - gridColumns)
            } else {
              newIndex = Math.max(0, currentIndex - 1)
            }
          }
          break

        case "ArrowDown":
          if (direction === "vertical" || direction === "both" || direction === "grid") {
            e.preventDefault()
            if (gridColumns) {
              newIndex = Math.min(elements.length - 1, currentIndex + gridColumns)
            } else {
              newIndex = Math.min(elements.length - 1, currentIndex + 1)
            }
          }
          break

        case "ArrowLeft":
          if (direction === "horizontal" || direction === "both" || direction === "grid") {
            e.preventDefault()
            newIndex = Math.max(0, currentIndex - 1)
          }
          break

        case "ArrowRight":
          if (direction === "horizontal" || direction === "both" || direction === "grid") {
            e.preventDefault()
            newIndex = Math.min(elements.length - 1, currentIndex + 1)
          }
          break

        case "Home":
          e.preventDefault()
          newIndex = 0
          break

        case "End":
          e.preventDefault()
          newIndex = elements.length - 1
          break

        default:
          return
      }

      if (newIndex !== currentIndex) {
        focusElement(newIndex)
      }
    },
    [arrowNavigation, direction, gridColumns, getFocusableElements, focusElement, currentIndex, onFocusChange]
  )

  // Setup
  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    previousActiveElementRef.current = document.activeElement as HTMLElement

    document.addEventListener("keydown", handleArrowKey)

    if (autoFocus) {
      const elements = getFocusableElements()
      if (elements.length > 0) {
        elements[0].focus()
        setCurrentIndex(0)
      }
    }

    return () => {
      document.removeEventListener("keydown", handleArrowKey)

      if (restoreFocus && previousActiveElementRef.current) {
        previousActiveElementRef.current.focus()
      }
    }
  }, [autoFocus, getFocusableElements, handleArrowKey, restoreFocus])

  return {
    containerRef,
    currentIndex,
    focusElement,
    getFocusableElements,
  }
}

export default FocusScope
