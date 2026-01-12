/**
 * Spinner Component
 *
 * Animated loading spinner with multiple variants.
 * Provides visual feedback for loading and processing states.
 *
 * Features:
 * - Multiple spinner variants (default, dots, bars, pulse)
 * - Configurable size and color
 * - Smooth animations
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { Spinner } from "./spinner"
 *
 * <Spinner size="md" />
 * <Spinner variant="dots" />
 * <Spinner variant="pulse" />
 * ```
 */

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { clsx } from "clsx"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Spinner variant
 */
export type SpinnerVariant = "default" | "dots" | "bars" | "pulse" | "orb" | "wave"

/**
 * Spinner size
 */
export type SpinnerSize = "xs" | "sm" | "md" | "lg" | "xl" | number

/**
 * Spinner configuration
 */
export interface SpinnerConfig {
  /** Spinner variant */
  variant?: SpinnerVariant
  /** Spinner size */
  size?: SpinnerSize
  /** Spinner color */
  color?: string
  /** Animation duration in ms */
  duration?: number
  /** Custom className */
  className?: string
}

/**
 * Spinner props
 */
export interface SpinnerProps extends SpinnerConfig, Omit<React.HTMLAttributes<HTMLDivElement>, "variant"> {
  /** Label for accessibility */
  label?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Size dimensions
 */
export const SPINNER_SIZES: Record<Exclude<SpinnerSize, number>, { size: number; strokeWidth: number }> = {
  xs: { size: 16, strokeWidth: 2 },
  sm: { size: 20, strokeWidth: 2 },
  md: { size: 24, strokeWidth: 3 },
  lg: { size: 32, strokeWidth: 3 },
  xl: { size: 48, strokeWidth: 4 },
}

/**
 * Default configuration
 */
export const DEFAULT_SPINNER_CONFIG: Required<Omit<SpinnerConfig, "className" | "label">> = {
  variant: "default",
  size: "md",
  color: "currentColor",
  duration: 1000,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get size value from preset
 */
function getSizeValue(size: SpinnerSize): number {
  return typeof size === "number" ? size : SPINNER_SIZES[size].size
}

/**
 * Get stroke width for default spinner
 */
function getStrokeWidth(size: SpinnerSize): number {
  return typeof size === "number" ? 3 : SPINNER_SIZES[size].strokeWidth
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Spinner Component
 *
 * Animated loading indicator
 */
export const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({
    variant = "default",
    size = "md",
    color = "currentColor",
    duration = 1000,
    className,
    label = "Loading...",
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const finalSize = getSizeValue(size)
    const finalDuration = prefersReducedMotion ? 0 : duration

    // Default circular spinner
    if (variant === "default") {
      const strokeWidth = getStrokeWidth(size)
      const radius = (finalSize - strokeWidth) / 2
      const circumference = 2 * Math.PI * radius

      return (
        <div
          ref={ref}
          className={clsx("inline-block", className)}
          style={{ width: finalSize, height: finalSize }}
          role="status"
          aria-label={label}
          {...props}
        >
          <svg
            width={finalSize}
            height={finalSize}
            viewBox={`0 0 ${finalSize} ${finalSize}`}
            className="animate-spin"
            style={{
              animationDuration: prefersReducedMotion ? "0s" : `${finalDuration}ms`,
            }}
          >
            <circle
              cx={finalSize / 2}
              cy={finalSize / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
              opacity={0.25}
            />
            <motion.circle
              cx={finalSize / 2}
              cy={finalSize / 2}
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.75}
              strokeLinecap="round"
              animate={{ rotate: 360 }}
              transition={{
                duration: finalDuration / 1000,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{ transformOrigin: "center" }}
            />
          </svg>
        </div>
      )
    }

    // Dots spinner
    if (variant === "dots") {
      const dotSize = finalSize / 5

      return (
        <div
          ref={ref}
          className={clsx("inline-flex items-center gap-1", className)}
          style={{ height: finalSize }}
          role="status"
          aria-label={label}
          {...props}
        >
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              style={{
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                backgroundColor: color,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: finalDuration / 1000,
                repeat: Infinity,
                delay: index * (finalDuration / 3000),
              }}
            />
          ))}
        </div>
      )
    }

    // Bars spinner
    if (variant === "bars") {
      const barWidth = finalSize / 8
      const barHeight = finalSize

      return (
        <div
          ref={ref}
          className={clsx("inline-flex items-end gap-1", className)}
          style={{ height: barHeight }}
          role="status"
          aria-label={label}
          {...props}
        >
          {[0, 1, 2, 3].map((index) => (
            <motion.span
              key={index}
              style={{
                width: barWidth,
                height: barHeight,
                borderRadius: barWidth / 2,
                backgroundColor: color,
                transformOrigin: "bottom",
              }}
              animate={{
                scaleY: [0.3, 1, 0.3],
              }}
              transition={{
                duration: finalDuration / 1000,
                repeat: Infinity,
                delay: index * (finalDuration / 4000),
              }}
            />
          ))}
        </div>
      )
    }

    // Pulse spinner
    if (variant === "pulse") {
      return (
        <div
          ref={ref}
          className={clsx("inline-block", className)}
          style={{ width: finalSize, height: finalSize }}
          role="status"
          aria-label={label}
          {...props}
        >
          <motion.span
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: color,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: finalDuration / 1000,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      )
    }

    // Orb spinner
    if (variant === "orb") {
      const orbSize = finalSize / 3

      return (
        <div
          ref={ref}
          className={clsx("inline-block", className)}
          style={{ width: finalSize, height: finalSize, position: "relative" }}
          role="status"
          aria-label={label}
          {...props}
        >
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: orbSize,
                height: orbSize,
                marginLeft: -orbSize / 2,
                marginTop: -orbSize / 2,
                borderRadius: "50%",
                backgroundColor: color,
              }}
              animate={{
                transform: [
                  `rotate(0deg) translateX(${finalSize / 3}px) rotate(0deg)`,
                  `rotate(360deg) translateX(${finalSize / 3}px) rotate(-360deg)`,
                ],
              }}
              transition={{
                duration: finalDuration / 1000,
                repeat: Infinity,
                ease: "linear",
                delay: index * (finalDuration / 3000),
              }}
            />
          ))}
        </div>
      )
    }

    // Wave spinner
    if (variant === "wave") {
      const barCount = 5
      const barWidth = finalSize / 10
      const gap = finalSize / 20
      const barHeight = finalSize

      return (
        <div
          ref={ref}
          className={clsx("inline-flex items-center", className)}
          style={{ height: barHeight, gap }}
          role="status"
          aria-label={label}
          {...props}
        >
          {Array.from({ length: barCount }).map((_, index) => (
            <motion.span
              key={index}
              style={{
                width: barWidth,
                height: barHeight * 0.5,
                borderRadius: barWidth / 2,
                backgroundColor: color,
                transformOrigin: "center",
              }}
              animate={{
                scaleY: [1, 2, 1],
              }}
              transition={{
                duration: finalDuration / 1000,
                repeat: Infinity,
                delay: index * (finalDuration / 5000),
              }}
            />
          ))}
        </div>
      )
    }

    return null
  }
)

Spinner.displayName = "Spinner"

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * SpinnerDots - Dot animation
 */
export const SpinnerDots = React.forwardRef<HTMLDivElement, Omit<SpinnerProps, "variant">>((props, ref) => (
  <Spinner ref={ref} variant="dots" {...props} />
))
SpinnerDots.displayName = "SpinnerDots"

/**
 * SpinnerBars - Bar animation
 */
export const SpinnerBars = React.forwardRef<HTMLDivElement, Omit<SpinnerProps, "variant">>((props, ref) => (
  <Spinner ref={ref} variant="bars" {...props} />
))
SpinnerBars.displayName = "SpinnerBars"

/**
 * SpinnerPulse - Pulse animation
 */
export const SpinnerPulse = React.forwardRef<HTMLDivElement, Omit<SpinnerProps, "variant">>((props, ref) => (
  <Spinner ref={ref} variant="pulse" {...props} />
))
SpinnerPulse.displayName = "SpinnerPulse"

/**
 * SpinnerOrb - Orb animation
 */
export const SpinnerOrb = React.forwardRef<HTMLDivElement, Omit<SpinnerProps, "variant">>((props, ref) => (
  <Spinner ref={ref} variant="orb" {...props} />
))
SpinnerOrb.displayName = "SpinnerOrb"

/**
 * SpinnerWave - Wave animation
 */
export const SpinnerWave = React.forwardRef<HTMLDivElement, Omit<SpinnerProps, "variant">>((props, ref) => (
  <Spinner ref={ref} variant="wave" {...props} />
))
SpinnerWave.displayName = "SpinnerWave"

// ============================================================================
// SIZE PRESETS
// ============================================================================

/**
 * Create size-specific spinner
 */
function createSizeSpinner(size: SpinnerSize) {
  return React.forwardRef<HTMLDivElement, Omit<SpinnerProps, "size">>((props, ref) => (
    <Spinner ref={ref} size={size} {...props} />
  ))
}

export const SpinnerXS = createSizeSpinner("xs")
export const SpinnerSM = createSizeSpinner("sm")
export const SpinnerMD = createSizeSpinner("md")
export const SpinnerLG = createSizeSpinner("lg")
export const SpinnerXL = createSizeSpinner("xl")

SpinnerXS.displayName = "SpinnerXS"
SpinnerSM.displayName = "SpinnerSM"
SpinnerMD.displayName = "SpinnerMD"
SpinnerLG.displayName = "SpinnerLG"
SpinnerXL.displayName = "SpinnerXL"

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Apply spinner preset
 */
export function applySpinnerPreset(
  preset: "dots" | "bars" | "pulse" | "orb" | "wave",
  customConfig?: Partial<SpinnerProps>
): SpinnerProps {
  return {
    variant: preset,
    ...customConfig,
  }
}
