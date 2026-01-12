/**
 * Ripple Effect Component
 *
 * Material Design-inspired ripple effect for interactive elements.
 * Provides tactile feedback with animated circular ripples on click/tap.
 *
 * Features:
 * - Origin-aware ripples (starts from click position)
 * - Multiple ripple support
 * - Automatic cleanup
 * - Customizable colors and duration
 * - Dark mode support
 * - Accessibility friendly
 *
 * @example
 * ```tsx
 * import { Ripple } from "./ripple-effect"
 * import { useRipple } from "./use-ripple"
 *
 * function Button() {
 *   const { ref, ripples } = useRipple()
 *   return (
 *     <button ref={ref} className="relative overflow-hidden">
 *       <Ripple ripples={ripples} />
 *       Click me
 *     </button>
 *   )
 * }
 * ```
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Ripple animation state
 */
export interface RippleState {
  /** Unique ripple ID */
  id: string
  /** X position */
  x: number
  /** Y position */
  y: number
  /** Ripple size */
  size: number
}

/**
 * Ripple effect configuration
 */
export interface RippleConfig {
  /** Ripple color (CSS variable or color value) */
  color?: string
  /** Animation duration in ms */
  duration?: number
  /** Ripple opacity */
  opacity?: number
  /** Ripple size multiplier */
  sizeMultiplier?: number
  /** Enable on touch only */
  touchOnly?: boolean
}

/**
 * Ripple component props
 */
export interface RippleProps extends RippleConfig {
  /** Array of ripple states */
  ripples: RippleState[]
  /** Container className */
  className?: string
}

/**
 * Ripple return type from hook
 */
export interface RippleReturn {
  /** Container ref */
  ref: React.RefObject<HTMLElement>
  /** Current ripples */
  ripples: RippleState[]
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default ripple configuration
 */
export const DEFAULT_RIPPLE_CONFIG: Required<RippleConfig> = {
  color: "rgba(255, 255, 255, 0.5)",
  duration: 600,
  opacity: 0.5,
  sizeMultiplier: 2,
  touchOnly: false,
}

/**
 * Ripple duration presets
 */
export const RIPPLE_DURATIONS = {
  fast: 400,
  default: 600,
  slow: 800,
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate ripple size based on container
 */
function calculateRippleSize(
  container: HTMLElement,
  x: number,
  y: number,
  multiplier: number = DEFAULT_RIPPLE_CONFIG.sizeMultiplier
): number {
  const rect = container.getBoundingClientRect()
  const maxX = Math.max(x - rect.left, rect.right - x)
  const maxY = Math.max(y - rect.top, rect.bottom - y)
  const radius = Math.sqrt(maxX * maxX + maxY * maxY)
  return radius * multiplier
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `ripple-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Ripple effect hook
 * Manages ripple state for interactive elements
 */
export function useRipple(config: RippleConfig = {}): RippleReturn {
  const {
    duration = DEFAULT_RIPPLE_CONFIG.duration,
    touchOnly = DEFAULT_RIPPLE_CONFIG.touchOnly,
  } = { ...DEFAULT_RIPPLE_CONFIG, ...config }

  const ref = React.useRef<HTMLElement>(null)
  const [ripples, setRipples] = React.useState<RippleState[]>([])

  const addRipple = React.useCallback((event: React.MouseEvent | React.PointerEvent) => {
    const container = ref.current
    if (!container) return

    // Check if should show ripple
    if (touchOnly && 'pointerType' in event && event.pointerType !== "touch") return

    const rect = container.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    const size = calculateRippleSize(container, x, y)

    const newRipple: RippleState = {
      id: generateId(),
      x,
      y,
      size,
    }

    setRipples((prev) => [...prev, newRipple])

    // Auto-remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id))
    }, duration)
  }, [duration, touchOnly])

  // Attach click handler
  React.useEffect(() => {
    const container = ref.current
    if (!container) return

    container.addEventListener("pointerdown", addRipple as unknown as EventListener)

    return () => {
      container.removeEventListener("pointerdown", addRipple as unknown as EventListener)
    }
  }, [addRipple])

  return { ref, ripples }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Ripple Component
 * Renders individual ripple animations
 */
export function Ripple({
  ripples,
  color = DEFAULT_RIPPLE_CONFIG.color,
  duration = DEFAULT_RIPPLE_CONFIG.duration,
  opacity = DEFAULT_RIPPLE_CONFIG.opacity,
  className,
}: RippleProps) {
  return (
    <AnimatePresence>
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className={className}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            transform: `translate(${ripple.x}px, ${ripple.y}px)`,
            borderRadius: "50%",
            pointerEvents: "none",
            backgroundColor: color,
            opacity,
          }}
          initial={{
            width: 0,
            height: 0,
            scale: 0,
          }}
          animate={{
            width: ripple.size * 2,
            height: ripple.size * 2,
            x: -ripple.size,
            y: -ripple.size,
            scale: 1,
          }}
          exit={{
            opacity: 0,
            scale: 1.5,
          }}
          transition={{
            duration: duration / 1000,
            ease: [0.4, 0, 0.2, 1],
          }}
        />
      ))}
    </AnimatePresence>
  )
}

Ripple.displayName = "Ripple"

/**
 * RippleContainer Component
 * Combines container and ripple rendering
 */
export interface RippleContainerProps extends React.HTMLAttributes<HTMLElement> {
  /** Ripple configuration */
  rippleConfig?: RippleConfig
  /** Tag name */
  as?: keyof JSX.IntrinsicElements
  /** Children */
  children: React.ReactNode
}

export const RippleContainer = React.forwardRef<HTMLElement, RippleContainerProps>(
  ({ rippleConfig, as: Tag = "div", children, className, ...props }, ref) => {
    const internalRef = React.useRef<HTMLElement>(null)
    const { ref: rippleRef, ripples } = useRipple(rippleConfig)

    // Merge refs
    React.useImperativeHandle(ref, () => internalRef.current as HTMLElement)
    React.useEffect(() => {
      if (rippleRef.current) {
        (internalRef as React.MutableRefObject<HTMLElement | null>).current = rippleRef.current
      }
    }, [rippleRef])

    return React.createElement(
      Tag,
      {
        ref: rippleRef,
        className,
        ...props,
      } as any,
      <Ripple ripples={ripples} {...rippleConfig} className="absolute inset-0 overflow-hidden rounded-[inherit]" />,
      children
    )
  }
)

RippleContainer.displayName = "RippleContainer"

/**
 * RippleButton Component
 * Button with built-in ripple effect
 */
export interface RippleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Ripple configuration */
  rippleConfig?: RippleConfig
  /** Button variant */
  variant?: "primary" | "secondary" | "ghost" | "outline" | "danger"
}

export const RippleButton = React.forwardRef<HTMLButtonElement, RippleButtonProps>(
  ({ rippleConfig, variant = "primary", className, children, ...props }, ref) => {
    const { ref: rippleRef, ripples } = useRipple(rippleConfig)

    const variantStyles = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      outline: "border border-input bg-background hover:bg-accent",
      danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    }

    return (
      <button
        ref={rippleRef as any}
        className={clsx(
          "relative",
          "inline-flex",
          "items-center",
          "justify-center",
          "rounded-md",
          "px-4",
          "py-2",
          "text-sm",
          "font-medium",
          "overflow-hidden",
          "transition-colors",
          "duration-200",
          "focus-visible:outline-none",
          "focus-visible:ring-2",
          "focus-visible:ring-ring",
          "focus-visible:ring-offset-2",
          "active:scale-95",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <Ripple ripples={ripples} {...rippleConfig} className="absolute inset-0" />
        {children}
      </button>
    )
  }
)

RippleButton.displayName = "RippleButton"

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Ripple configuration presets
 */
export const ripplePresets = {
  /**
   * Default white ripple
   */
  default: {
    color: "rgba(255, 255, 255, 0.5)",
    duration: RIPPLE_DURATIONS.default,
    opacity: 0.5,
  },

  /**
   * Dark ripple for light backgrounds
   */
  dark: {
    color: "rgba(0, 0, 0, 0.2)",
    duration: RIPPLE_DURATIONS.default,
    opacity: 0.3,
  },

  /**
   * Primary color ripple
   */
  primary: {
    color: "rgba(var(--color-primary) / 0.3)",
    duration: RIPPLE_DURATIONS.default,
    opacity: 0.4,
  },

  /**
   * Accent color ripple
   */
  accent: {
    color: "rgba(var(--color-accent) / 0.3)",
    duration: RIPPLE_DURATIONS.default,
    opacity: 0.4,
  },

  /**
   * Fast ripple for quick feedback
   */
  fast: {
    color: "rgba(255, 255, 255, 0.5)",
    duration: RIPPLE_DURATIONS.fast,
    opacity: 0.5,
  },

  /**
   * Slow ripple for emphasis
   */
  slow: {
    color: "rgba(255, 255, 255, 0.5)",
    duration: RIPPLE_DURATIONS.slow,
    opacity: 0.5,
  },
} as const

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Apply preset ripple configuration
 */
export function applyRipplePreset(
  preset: keyof typeof ripplePresets,
  customConfig?: Partial<RippleConfig>
): RippleConfig {
  return { ...ripplePresets[preset], ...customConfig }
}

// Import clsx for RippleButton
import { clsx } from "clsx"
