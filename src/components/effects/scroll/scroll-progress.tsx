/**
 * Scroll Progress Component
 *
 * Visual indicator of scroll position as a progress bar.
 * Can be positioned at top, bottom, or as an inline element.
 *
 * Features:
 * - Smooth animation with RAF throttling
 * - Configurable position and style
 * - Color variants
 * - Vertical/horizontal orientation
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { ScrollProgress } from "./scroll-progress"
 *
 * // Fixed top bar
 * <ScrollProgress position="top" />
 *
 * // Inline progress
 * <ScrollProgress variant="inline" />
 *
 * // With custom color
 * <ScrollProgress color="rgb(59 130 246)" />
 * ```
 */

import * as React from "react"
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Progress bar position
 */
export type ProgressPosition = "top" | "bottom" | "inline"

/**
 * Progress bar orientation
 */
export type ProgressOrientation = "horizontal" | "vertical"

/**
 * Progress bar variant
 */
export type ProgressVariant = "default" | "thin" | "thick" | "pill"

/**
 * Scroll progress configuration
 */
export interface ScrollProgressConfig {
  /** Bar position */
  position?: ProgressPosition
  /** Bar height */
  height?: number
  /** Bar color */
  color?: string
  /** Background color */
  backgroundColor?: string
  /** Z-index */
  zIndex?: number
  /** Spring animation stiffness */
  stiffness?: number
  /** Spring animation damping */
  damping?: number
  /** Container to track (default: window) */
  containerRef?: React.RefObject<HTMLElement>
  /** Offset for progress calculation (0-1) */
  offset?: [number, number]
  /** Show percentage text */
  showPercentage?: boolean
  /** Progress orientation */
  orientation?: ProgressOrientation
  /** Variant style */
  variant?: ProgressVariant
}

/**
 * Scroll progress props
 */
export interface ScrollProgressProps extends ScrollProgressConfig, Omit<React.HTMLAttributes<HTMLDivElement>, "variant"> {
  /** Custom progress value (0-1) for controlled mode */
  progress?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Variant heights
 */
export const VARIANT_HEIGHTS: Record<ProgressVariant, number> = {
  default: 3,
  thin: 2,
  thick: 6,
  pill: 24,
}

/**
 * Default configuration
 */
export const DEFAULT_PROGRESS_CONFIG: Required<Omit<ScrollProgressConfig, "containerRef" | "showPercentage">> = {
  position: "top",
  height: 3,
  color: "rgb(59 130 246)",
  backgroundColor: "transparent",
  zIndex: 50,
  stiffness: 100,
  damping: 30,
  offset: [0, 0],
  orientation: "horizontal",
  variant: "default",
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ScrollProgress Component
 *
 * Displays a progress bar indicating scroll position
 */
export const ScrollProgress = React.forwardRef<HTMLDivElement, ScrollProgressProps>(
  ({
    position = "top",
    height,
    color = "rgb(59 130 246)",
    backgroundColor = "transparent",
    zIndex = 50,
    stiffness = 100,
    damping = 30,
    containerRef,
    offset = [0, 0],
    showPercentage = false,
    orientation = "horizontal",
    variant = "default",
    progress: controlledProgress,
    className,
    style,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const finalHeight = height ?? VARIANT_HEIGHTS[variant]

    // Calculate scroll progress
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: offset as any,
    })

    // Apply spring animation
    const scaleX = useSpring(
      controlledProgress !== undefined ? controlledProgress : scrollYProgress,
      {
        stiffness: prefersReducedMotion ? 0 : stiffness,
        damping: prefersReducedMotion ? 0 : damping,
      }
    )

    // Progress percentage for display
    const progressPercent = React.useMemo(
      () => Math.round((controlledProgress !== undefined ? controlledProgress : 0) * 100),
      [controlledProgress]
    )

    // Build styles based on position
    const isFixed = position === "top" || position === "bottom"

    const containerStyle: React.CSSProperties = {
      position: isFixed ? "fixed" : "relative",
      left: 0,
      right: 0,
      ...(position === "top" ? { top: 0 } : {}),
      ...(position === "bottom" ? { bottom: 0 } : {}),
      height: orientation === "horizontal" ? finalHeight : "100%",
      width: orientation === "vertical" ? finalHeight : "100%",
      backgroundColor,
      zIndex,
      pointerEvents: "none",
      ...style,
    }

    const barStyle: React.CSSProperties = {
      height: "100%",
      width: orientation === "vertical" ? "100%" : undefined,
      backgroundColor: color,
      transformOrigin: orientation === "horizontal" ? "left" : "top",
      ...(orientation === "horizontal" ? { scaleX } : { scaleY: scaleX }),
    }

    return (
      <div
        ref={ref}
        className={className}
        style={containerStyle}
        {...props}
      >
        <motion.div
          style={barStyle as any}
          initial={false}
          transition={prefersReducedMotion ? { duration: 0 } : undefined}
        />
        {showPercentage && variant === "pill" && (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
            {progressPercent}%
          </span>
        )}
      </div>
    )
  }
)

ScrollProgress.displayName = "ScrollProgress"

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * ScrollProgressTop - Progress bar at top of page
 */
export const ScrollProgressTop = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "position">>((props, ref) => (
  <ScrollProgress ref={ref} position="top" {...props} />
))
ScrollProgressTop.displayName = "ScrollProgressTop"

/**
 * ScrollProgressBottom - Progress bar at bottom of page
 */
export const ScrollProgressBottom = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "position">>((props, ref) => (
  <ScrollProgress ref={ref} position="bottom" {...props} />
))
ScrollProgressBottom.displayName = "ScrollProgressBottom"

/**
 * ScrollProgressThin - Thin progress bar
 */
export const ScrollProgressThin = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "variant">>((props, ref) => (
  <ScrollProgress ref={ref} variant="thin" {...props} />
))
ScrollProgressThin.displayName = "ScrollProgressThin"

/**
 * ScrollProgressThick - Thick progress bar
 */
export const ScrollProgressThick = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "variant">>((props, ref) => (
  <ScrollProgress ref={ref} variant="thick" {...props} />
))
ScrollProgressThick.displayName = "ScrollProgressThick"

/**
 * ScrollProgressPill - Pill-shaped progress with percentage
 */
export const ScrollProgressPill = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "variant" | "showPercentage">>((props, ref) => (
  <ScrollProgress ref={ref} variant="pill" showPercentage {...props} />
))
ScrollProgressPill.displayName = "ScrollProgressPill"

// ============================================================================
// COLOR PRESETS
// ============================================================================

/**
 * Color preset configurations
 */
export const progressColors = {
  blue: "rgb(59 130 246)",
  green: "rgb(34 197 94)",
  red: "rgb(239 68 68)",
  yellow: "rgb(234 179 8)",
  purple: "rgb(168 85 247)",
  pink: "rgb(236 72 153)",
  primary: "rgb(var(--color-primary) / 1)",
  accent: "rgb(var(--color-accent) / 1)",
} as const

/**
 * Colored progress bars
 */
export const ScrollProgressBlue = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "color">>((props, ref) => (
  <ScrollProgress ref={ref} color={progressColors.blue} {...props} />
))
ScrollProgressBlue.displayName = "ScrollProgressBlue"

export const ScrollProgressGreen = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "color">>((props, ref) => (
  <ScrollProgress ref={ref} color={progressColors.green} {...props} />
))
ScrollProgressGreen.displayName = "ScrollProgressGreen"

export const ScrollProgressRed = React.forwardRef<HTMLDivElement, Omit<ScrollProgressProps, "color">>((props, ref) => (
  <ScrollProgress ref={ref} color={progressColors.red} {...props} />
))
ScrollProgressRed.displayName = "ScrollProgressRed"

// ============================================================================
// HOOK
// ============================================================================

/**
 * Use scroll progress hook
 * Returns scroll progress as a value between 0-1
 */
export function useScrollProgress(config?: {
  containerRef?: React.RefObject<HTMLElement>
  offset?: [number, number]
}): number {
  const { scrollYProgress } = useScroll({
    target: config?.containerRef,
    offset: (config?.offset as any) || ["0 0", "1 0"],
  })

  // Convert MotionValue to number via render
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (v) => setProgress(v))
    return unsubscribe
  }, [scrollYProgress])

  return progress
}
