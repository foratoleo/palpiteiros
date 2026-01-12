/**
 * Glass Dialog Component
 *
 * Dialog/modal with glassmorphism backdrop and content.
 * Provides a premium, modern look for modals and overlays.
 *
 * Features:
 * - Glass backdrop with blur effect
 * - Glass content panel
 * - Smooth enter/exit animations with Framer Motion
 * - Focus trap within dialog
 * - Keyboard navigation (Esc to close)
 * - Click outside to close
 * - Cross-browser compatibility
 *
 * @example
 * ```tsx
 * import { GlassDialog } from './glass-dialog'
 *
 * <GlassDialog open={isOpen} onClose={() => setIsOpen(false)}>
 *   <DialogContent>Modal content</DialogContent>
 * </GlassDialog>
 * ```
 */

import React, { forwardRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { applyGlassPreset, type GlassPreset } from "./glass-presets"
import { focusStyles } from "../micro-interactions/focus-states"

// ============================================================================
// TYPES
// ============================================================================

export interface GlassDialogProps {
  /**
   * Whether the dialog is open
   */
  open: boolean

  /**
   * Callback when dialog should close
   */
  onClose: () => void

  /**
   * Glass variant for backdrop
   * @default "heavy"
   */
  backdropVariant?: GlassPreset

  /**
   * Glass variant for content
   * @default "medium"
   */
  contentVariant?: GlassPreset

  /**
   * Enable click outside to close
   * @default true
   */
  closeOnBackdropClick?: boolean

  /**
   * Enable Escape key to close
   * @default true
   */
  closeOnEscape?: boolean

  /**
   * Maximum width of dialog
   * @default "md"
   */
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full"

  /**
   * Border radius of dialog
   * @default "xl"
   */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl"

  /**
   * Additional backdrop classes
   */
  backdropClassName?: string

  /**
   * Additional content classes
   */
  contentClassName?: string

  /**
   * Dialog content
   */
  children: React.ReactNode

  /**
   * ARIA label for accessibility
   */
  "aria-label"?: string

  /**
   * ARIA labelledby
   */
  "aria-labelledby"?: string

  /**
   * ARIA describedby
   */
  "aria-describedby"?: string
}

export interface DialogContentProps {
  /**
   * Content wrapper children
   */
  children: React.ReactNode

  /**
   * Additional classes
   */
  className?: string
}

// ============================================================================
// SIZE MAPPING
// ============================================================================

const sizeClasses: Record<string, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-full mx-4",
}

const roundedClasses: Record<string, string> = {
  none: "rounded-none",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  "3xl": "rounded-3xl",
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const contentVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: { duration: 0.15 },
  },
}

// ============================================================================
// DIALOG CONTENT COMPONENT
// ============================================================================

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  ({ children, className }, ref) => {
    return (
      <div ref={ref} className={cn("p-6", className)}>
        {children}
      </div>
    )
  }
)
DialogContent.displayName = "DialogContent"

// ============================================================================
// MAIN DIALOG COMPONENT
// ============================================================================

export const GlassDialog: React.FC<GlassDialogProps> = ({
  open,
  onClose,
  backdropVariant = "heavy",
  contentVariant = "medium",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  size = "md",
  rounded = "xl",
  backdropClassName,
  contentClassName,
  children,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
}) => {
  const [darkMode, setDarkMode] = React.useState(false)
  const contentRef = React.useRef<HTMLDivElement>(null)

  // Detect dark mode
  React.useEffect(() => {
    const root = window.document.documentElement
    const isDark = root.classList.contains("dark")
    setDarkMode(isDark)

    const observer = new MutationObserver(() => {
      setDarkMode(root.classList.contains("dark"))
    })

    observer.observe(root, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [])

  // Handle escape key
  React.useEffect(() => {
    if (!open || !closeOnEscape) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [open, closeOnEscape, onClose])

  // Focus trap
  React.useEffect(() => {
    if (!open) return

    const content = contentRef.current
    if (!content) return

    // Focus first focusable element
    const focusableElements = content.querySelectorAll<
      HTMLElement | SVGElement
    >(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )

    if (focusableElements.length > 0) {
      focusableElements[0]?.focus()
    } else {
      content.focus()
    }

    // Trap focus within content
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return

      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault()
        firstElement?.focus()
      } else if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault()
        lastElement?.focus()
      }
    }

    document.addEventListener("keydown", handleTab)
    return () => document.removeEventListener("keydown", handleTab)
  }, [open])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose()
    }
  }

  // Get glass styles
  const backdropStyles = applyGlassPreset(backdropVariant, {
    darkMode,
    fallback: false,
  })
  const contentStyles = applyGlassPreset(contentVariant, { darkMode })

  // Override backdrop for overlay effect
  const overlayStyles: React.CSSProperties = {
    ...backdropStyles,
    backgroundColor: darkMode
      ? "rgba(0, 0, 0, 0.7)"
      : "rgba(0, 0, 0, 0.4)",
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className={cn(
              "fixed inset-0 z-50",
              "flex items-center justify-center",
              "p-4",
              backdropClassName
            )}
            style={overlayStyles}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            onClick={handleBackdropClick}
            aria-hidden="true"
          >
            {/* Content */}
            <motion.div
              ref={contentRef}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              aria-labelledby={ariaLabelledby}
              aria-describedby={ariaDescribedby}
              className={cn(
                "relative w-full",
                sizeClasses[size],
                roundedClasses[rounded],
                "overflow-hidden",
                "focus:outline-none",
                contentClassName
              )}
              style={contentStyles}
              variants={contentVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              tabIndex={-1}
            >
              {children}
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ============================================================================
// DIALOG HEADER COMPONENT
// ============================================================================

export interface GlassDialogHeaderProps {
  /**
   * Header content
   */
  children: React.ReactNode

  /**
   * Show close button
   * @default true
   */
  showClose?: boolean

  /**
   * Close button callback
   */
  onClose?: () => void

  /**
   * Additional classes
   */
  className?: string
}

export const GlassDialogHeader: React.FC<GlassDialogHeaderProps> = ({
  children,
  showClose = true,
  onClose,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between",
        "border-b border-white/10 dark:border-white/5",
        "px-6 py-4",
        className
      )}
    >
      {typeof children === "string" ? (
        <h2 className="text-lg font-semibold">{children}</h2>
      ) : (
        children
      )}
      {showClose && onClose && (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "p-1.5 rounded-md",
            "hover:bg-white/10 dark:hover:bg-white/5",
            "transition-colors",
            "focus:outline-none",
            focusStyles({ preset: "ring" })
          )}
          aria-label="Close dialog"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}

// ============================================================================
// DIALOG FOOTER COMPONENT
// ============================================================================

export interface GlassDialogFooterProps {
  /**
   * Footer content
   */
  children: React.ReactNode

  /**
   * Alignment of buttons
   * @default "end"
   */
  align?: "start" | "center" | "end" | "between"

  /**
   * Additional classes
   */
  className?: string
}

export const GlassDialogFooter: React.FC<GlassDialogFooterProps> = ({
  children,
  align = "end",
  className,
}) => {
  const alignClasses: Record<string, string> = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3",
        alignClasses[align],
        "border-t border-white/10 dark:border-white/5",
        "px-6 py-4",
        className
      )}
    >
      {children}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default GlassDialog
export { DialogContent }
