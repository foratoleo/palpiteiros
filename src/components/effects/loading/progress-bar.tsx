/**
 * Progress Bar Component
 *
 * Determinate and indeterminate progress indicators with smooth animations.
 * Visualizes ongoing processes or loading states.
 *
 * Features:
 * - Determinate (0-100%) and indeterminate modes
 * - Multiple variants (default, striped, animated)
 * - Configurable colors and size
 * - Label display
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { ProgressBar } from "./progress-bar"
 *
 * <ProgressBar value={50} />
 * <ProgressBar variant="striped" value={75} />
 * <ProgressBar indeterminate />
 * ```
 */

import * as React from "react"
import { motion, useReducedMotion, useSpring } from "framer-motion"
import { clsx } from "clsx"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Progress bar variant
 */
export type ProgressBarVariant = "default" | "striped" | "animated" | "thin" | "thick"

/**
 * Progress bar size
 */
export type ProgressBarSize = "sm" | "md" | "lg"

/**
 * Progress bar color
 */
export type ProgressBarColor = "primary" | "success" | "warning" | "danger" | "info"

/**
 * Progress bar configuration
 */
export interface ProgressBarConfig {
  /** Current progress value (0-100) */
  value?: number
  /** Indeterminate mode (show loading animation) */
  indeterminate?: boolean
  /** Progress bar variant */
  variant?: ProgressBarVariant
  /** Progress bar size */
  size?: ProgressBarSize
  /** Progress bar color */
  color?: ProgressBarColor
  /** Show percentage label */
  showLabel?: boolean
  /** Label position */
  labelPosition?: "inside" | "outside" | "top"
  /** Custom label */
  label?: string
  /** Animation duration in ms */
  animationDuration?: number
  /** Custom className */
  className?: string
}

/**
 * Progress bar props
 */
export interface ProgressBarProps extends ProgressBarConfig, Omit<React.HTMLAttributes<HTMLDivElement>, "variant" | "color"> {
  /** Minimum value */
  min?: number
  /** Maximum value */
  max?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Size dimensions
 */
export const PROGRESS_SIZES: Record<ProgressBarSize, { height: string; radius: string }> = {
  sm: { height: "4px", radius: "2px" },
  md: { height: "8px", radius: "4px" },
  lg: { height: "12px", radius: "6px" },
}

/**
 * Color classes
 */
export const PROGRESS_COLORS: Record<ProgressBarColor, string> = {
  primary: "bg-primary",
  success: "bg-green-500",
  warning: "bg-yellow-500",
  danger: "bg-red-500",
  info: "bg-blue-500",
}

/**
 * Default configuration
 */
export const DEFAULT_PROGRESS_CONFIG: Required<Omit<ProgressBarConfig, "className" | "label" | "value" | "showLabel" | "labelPosition">> = {
  indeterminate: false,
  variant: "default",
  size: "md",
  color: "primary",
  animationDuration: 300,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Clamp value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Calculate percentage
 */
function calculatePercentage(value: number, min: number, max: number): number {
  return ((value - min) / (max - min)) * 100
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ProgressBar Component
 *
 * Animated progress bar with multiple variants
 */
export const ProgressBar = React.forwardRef<HTMLDivElement, ProgressBarProps>(
  ({
    value = 0,
    min = 0,
    max = 100,
    indeterminate = false,
    variant = "default",
    size = "md",
    color = "primary",
    showLabel = false,
    labelPosition = "outside",
    label,
    animationDuration = 300,
    className,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const [displayValue, setDisplayValue] = React.useState(value)

    // Update display value
    React.useEffect(() => {
      setDisplayValue(value)
    }, [value])

    // Calculate progress percentage
    const clampedValue = clamp(displayValue, min, max)
    const percentage = indeterminate ? 100 : calculatePercentage(clampedValue, min, max)

    // Spring animation for smooth progress
    const springProgress = useSpring(percentage, {
      stiffness: 100,
      damping: 15,
      duration: prefersReducedMotion ? 0 : animationDuration,
    })

    // Build size styles
    const { height, radius } = PROGRESS_SIZES[size]

    // Build container style
    const containerStyle: React.CSSProperties = {
      height: variant === "thin" ? "2px" : variant === "thick" ? "16px" : height,
      borderRadius: radius,
    }

    // Build progress style
    const progressStyle: React.CSSProperties = {
      borderRadius: radius,
    }

    // Build stripes pattern
    const isStriped = variant === "striped" || variant === "animated"
    const stripesStyle = isStriped ? {
      backgroundImage: "linear-gradient(45deg, rgba(255,255,255,0.15) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.15) 75%, transparent 75%, transparent)",
      backgroundSize: "1rem 1rem",
    } : {}

    // Render label
    const renderLabel = () => {
      if (!showLabel) return null

      const labelText = label ?? `${Math.round(percentage)}%`

      if (labelPosition === "top") {
        return (
          <div className="flex justify-between text-xs mb-1">
            <span>{labelText}</span>
          </div>
        )
      }

      if (labelPosition === "inside") {
        return (
          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white mix-blend-difference">
            {labelText}
          </span>
        )
      }

      return null
    }

    // Render progress bar
    return (
      <div className={clsx("w-full", className)} {...props}>
        {renderLabel()}
        <div
          ref={ref}
          className="relative overflow-hidden bg-muted/30"
          style={containerStyle}
        >
          <motion.div
            className={clsx(
              "h-full",
              PROGRESS_COLORS[color],
              variant === "animated" && "animate-[stripe_1s_linear_infinite]"
            )}
            style={{
              ...progressStyle,
              ...stripesStyle,
              width: springProgress,
            }}
            animate={indeterminate ? {
              x: ["-100%", "100%"],
            } : {}}
            transition={indeterminate ? {
              duration: 1.5,
              repeat: Infinity,
              ease: "linear",
            } : undefined}
          >
            {labelPosition === "inside" && renderLabel()}
          </motion.div>
        </div>
        {labelPosition === "outside" && (
          <div className="flex justify-between text-xs mt-1">
            <span>{label ?? `${Math.round(percentage)}%`}</span>
          </div>
        )}
      </div>
    )
  }
)

ProgressBar.displayName = "ProgressBar"

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * ProgressBarStriped - Striped progress bar
 */
export const ProgressBarStriped = React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "variant">>((props, ref) => (
  <ProgressBar ref={ref} variant="striped" {...props} />
))
ProgressBarStriped.displayName = "ProgressBarStriped"

/**
 * ProgressBarAnimated - Animated striped progress bar
 */
export const ProgressBarAnimated = React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "variant">>((props, ref) => (
  <ProgressBar ref={ref} variant="animated" {...props} />
))
ProgressBarAnimated.displayName = "ProgressBarAnimated"

/**
 * ProgressBarThin - Thin progress bar
 */
export const ProgressBarThin = React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "variant">>((props, ref) => (
  <ProgressBar ref={ref} variant="thin" {...props} />
))
ProgressBarThin.displayName = "ProgressBarThin"

/**
 * ProgressBarThick - Thick progress bar
 */
export const ProgressBarThick = React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "variant">>((props, ref) => (
  <ProgressBar ref={ref} variant="thick" {...props} />
))
ProgressBarThick.displayName = "ProgressBarThick"

/**
 * ProgressBarIndeterminate - Indeterminate loading state
 */
export const ProgressBarIndeterminate = React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "indeterminate" | "value">>((props, ref) => (
  <ProgressBar ref={ref} indeterminate {...props} />
))
ProgressBarIndeterminate.displayName = "ProgressBarIndeterminate"

// ============================================================================
// COLOR PRESETS
// ============================================================================

/**
 * Create color-specific progress bar
 */
function createColorProgressBar(color: ProgressBarColor) {
  return React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "color">>((props, ref) => (
    <ProgressBar ref={ref} color={color} {...props} />
  ))
}

export const ProgressBarPrimary = createColorProgressBar("primary")
export const ProgressBarSuccess = createColorProgressBar("success")
export const ProgressBarWarning = createColorProgressBar("warning")
export const ProgressBarDanger = createColorProgressBar("danger")
export const ProgressBarInfo = createColorProgressBar("info")

ProgressBarPrimary.displayName = "ProgressBarPrimary"
ProgressBarSuccess.displayName = "ProgressBarSuccess"
ProgressBarWarning.displayName = "ProgressBarWarning"
ProgressBarDanger.displayName = "ProgressBarDanger"
ProgressBarInfo.displayName = "ProgressBarInfo"

// ============================================================================
// SIZE PRESETS
// ============================================================================

/**
 * Create size-specific progress bar
 */
function createSizeProgressBar(size: ProgressBarSize) {
  return React.forwardRef<HTMLDivElement, Omit<ProgressBarProps, "size">>((props, ref) => (
    <ProgressBar ref={ref} size={size} {...props} />
  ))
}

export const ProgressBarSM = createSizeProgressBar("sm")
export const ProgressBarMD = createSizeProgressBar("md")
export const ProgressBarLG = createSizeProgressBar("lg")

ProgressBarSM.displayName = "ProgressBarSM"
ProgressBarMD.displayName = "ProgressBarMD"
ProgressBarLG.displayName = "ProgressBarLG"

// ============================================================================
// CIRCULAR PROGRESS
// ============================================================================

/**
 * Circular Progress Bar Component
 */
export interface CircularProgressProps {
  /** Progress value (0-100) */
  value?: number
  /** Size in pixels */
  size?: number
  /** Stroke width */
  strokeWidth?: number
  /** Color */
  color?: string
  /** Show label */
  showLabel?: boolean
  /** Custom className */
  className?: string
}

export const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  ({
    value = 0,
    size = 40,
    strokeWidth = 4,
    color = "rgb(59 130 246)",
    showLabel = false,
    className,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const normalizedValue = Math.max(0, Math.min(100, value))
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const offset = circumference - (normalizedValue / 100) * circumference

    return (
      <svg
        ref={ref}
        width={size}
        height={size}
        className={className}
        viewBox={`0 0 ${size} ${size}`}
        {...props}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/30"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={false}
          animate={{ strokeDashoffset: offset }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.3,
            ease: "easeOut",
          }}
          style={{ transformOrigin: "center", transform: "rotate(-90deg)" }}
        />
        {/* Label */}
        {showLabel && (
          <text
            x={size / 2}
            y={size / 2}
            textAnchor="middle"
            dominantBaseline="central"
            className="text-xs font-medium"
            fill="currentColor"
          >
            {Math.round(normalizedValue)}%
          </text>
        )}
      </svg>
    )
  }
)

CircularProgress.displayName = "CircularProgress"
