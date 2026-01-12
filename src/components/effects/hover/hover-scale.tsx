/**
 * Hover Scale Effect
 *
 * Scale transformations on hover with spring physics.
 * Provides smooth, organic scaling behavior.
 *
 * Features:
 * - Configurable scale amounts
 * - Spring physics for natural motion
 * - Press feedback
 * - Origin control (center, corners, edges)
 * - Duration control
 *
 * @example
 * ```tsx
 * import { HoverScale } from './hover-scale'
 *
 * <HoverScale scale={1.1}>
 *   <Icon />
 * </HoverScale>
 * ```
 */

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type ScaleOrigin =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"

export type ScalePreset =
  | "subtle"
  | "default"
  | "medium"
  | "strong"
  | "extreme"

export interface HoverScaleProps {
  /**
   * Children to apply scale effect
   */
  children: React.ReactNode

  /**
   * Scale amount on hover (1 = no change)
   * @default 1.05
   */
  scale?: number

  /**
   * Scale amount on press
   * @default 0.95
   */
  pressScale?: number

  /**
   * Scale origin point
   * @default "center"
   */
  origin?: ScaleOrigin

  /**
   * Animation preset
   */
  preset?: ScalePreset

  /**
   * Spring stiffness
   * @default 400
   */
  stiffness?: number

  /**
   * Spring damping
   * @default 17
   */
  damping?: number

  /**
   * Enable/disable effect
   * @default true
   */
  disabled?: boolean

  /**
   * Apply only to children (no wrapper)
   * @default false
   */
  asChild?: boolean

  /**
   * Additional classes
   */
  className?: string

  /**
   * Click handler
   */
  onClick?: () => void
}

// ============================================================================
// SCALE PRESETS
// ============================================================================

const scalePresets: Record<ScalePreset, number> = {
  subtle: 1.02,
  default: 1.05,
  medium: 1.1,
  strong: 1.15,
  extreme: 1.25,
}

// ============================================================================
// ORIGIN MAPPING
// ============================================================================

const originMap: Record<ScaleOrigin, string> = {
  center: "center",
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
  "top-left": "top left",
  "top-right": "top right",
  "bottom-left": "bottom left",
  "bottom-right": "bottom right",
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HoverScale - Apply scale effect on hover
 */
export const HoverScale: React.FC<HoverScaleProps> = ({
  children,
  scale,
  pressScale = 0.95,
  origin = "center",
  preset,
  stiffness = 400,
  damping = 17,
  disabled = false,
  asChild = false,
  className,
  onClick,
}) => {
  const finalScale = scale !== undefined ? scale : preset ? scalePresets[preset] : 1.05

  const motionProps: MotionProps = {
    style: {
      transformOrigin: originMap[origin],
    },
    whileHover: !disabled
      ? {
          scale: finalScale,
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: pressScale,
        }
      : undefined,
    transition: {
      type: "spring",
      stiffness,
      damping,
    },
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...motionProps,
      className: cn(children.props.className, className),
      onClick,
    } as any)
  }

  return (
    <motion.div
      className={cn("inline-block", className)}
      onClick={onClick}
      {...motionProps}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Subtle scale - Minimal effect
 */
export const HoverScaleSubtle: typeof HoverScale = (props) => (
  <HoverScale preset="subtle" {...props} />
)

/**
 * Default scale - Standard effect
 */
export const HoverScaleDefault: typeof HoverScale = (props) => (
  <HoverScale preset="default" {...props} />
)

/**
 * Medium scale - Noticeable effect
 */
export const HoverScaleMedium: typeof HoverScale = (props) => (
  <HoverScale preset="medium" {...props} />
)

/**
 * Strong scale - Large effect
 */
export const HoverScaleStrong: typeof HoverScale = (props) => (
  <HoverScale preset="strong" {...props} />
)

/**
 * Extreme scale - Maximum effect
 */
export const HoverScaleExtreme: typeof HoverScale = (props) => (
  <HoverScale preset="extreme" {...props} />
)

/**
 * Scale from center (default)
 */
export const HoverScaleCenter: typeof HoverScale = (props) => (
  <HoverScale origin="center" {...props} />
)

/**
 * Scale from top-left
 */
export const HoverScaleTopLeft: typeof HoverScale = (props) => (
  <HoverScale origin="top-left" {...props} />
)

/**
 * Scale from bottom-right
 */
export const HoverScaleBottomRight: typeof HoverScale = (props) => (
  <HoverScale origin="bottom-right" {...props} />
)

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for hover scale motion props
 */
export interface UseHoverScaleOptions {
  scale?: number
  pressScale?: number
  origin?: ScaleOrigin
  preset?: ScalePreset
  stiffness?: number
  damping?: number
  disabled?: boolean
}

export function useHoverScale(options: UseHoverScaleOptions = {}): MotionProps {
  const {
    scale,
    pressScale = 0.95,
    origin = "center",
    preset,
    stiffness = 400,
    damping = 17,
    disabled = false,
  } = options

  const finalScale = scale !== undefined ? scale : preset ? scalePresets[preset] : 1.05

  return {
    style: {
      transformOrigin: originMap[origin],
    },
    whileHover: !disabled
      ? {
          scale: finalScale,
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: pressScale,
        }
      : undefined,
    transition: {
      type: "spring",
      stiffness,
      damping,
    },
  }
}

export default HoverScale
