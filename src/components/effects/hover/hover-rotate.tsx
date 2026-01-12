/**
 * Hover Rotate Effect
 *
 * Subtle rotation on hover for dynamic interactive feedback.
 * Creates playful, engaging micro-interactions.
 *
 * Features:
 * - Configurable rotation angle
 * - Clockwise and counter-clockwise
 * - Spring physics for natural motion
 * - Combined with scale for enhanced effect
 * - Origin control
 *
 * @example
 * ```tsx
 * import { HoverRotate } from './hover-rotate'
 *
 * <HoverRotate angle={15}>
 *   <Icon />
 * </HoverRotate>
 * ```
 */

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type RotateDirection = "cw" | "ccw" | "alternate"

export type RotateOrigin =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"

export type RotatePreset = "subtle" | "default" | "medium" | "strong"

export interface HoverRotateProps {
  /**
   * Children to apply rotation effect
   */
  children: React.ReactNode

  /**
   * Rotation angle in degrees (positive = clockwise, negative = counter-clockwise)
   * @default 10
   */
  angle?: number

  /**
   * Rotation direction preset
   */
  direction?: RotateDirection

  /**
   * Scale amount on hover (optional)
   * @default 1
   */
  scale?: number

  /**
   * Rotation origin point
   * @default "center"
   */
  origin?: RotateOrigin

  /**
   * Animation preset
   */
  preset?: RotatePreset

  /**
   * Spring stiffness
   * @default 300
   */
  stiffness?: number

  /**
   * Spring damping
   * @default 20
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
// ROTATE PRESETS
// ============================================================================

const rotatePresets: Record<RotatePreset, { cw: number; ccw: number }> = {
  subtle: { cw: 5, ccw: -5 },
  default: { cw: 10, ccw: -10 },
  medium: { cw: 15, ccw: -15 },
  strong: { cw: 25, ccw: -25 },
}

// ============================================================================
// ORIGIN MAPPING
// ============================================================================

const originMap: Record<RotateOrigin, string> = {
  center: "center",
  top: "top center",
  bottom: "bottom center",
  left: "center left",
  right: "center right",
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HoverRotate - Apply rotation effect on hover
 */
export const HoverRotate: React.FC<HoverRotateProps> = ({
  children,
  angle,
  direction = "cw",
  scale = 1,
  origin = "center",
  preset,
  stiffness = 300,
  damping = 20,
  disabled = false,
  asChild = false,
  className,
  onClick,
}) => {
  // Determine rotation angle
  let rotateAngle = angle

  if (rotateAngle === undefined && preset) {
    const presetAngles = rotatePresets[preset]
    rotateAngle = direction === "ccw" ? presetAngles.ccw : presetAngles.cw
  } else if (rotateAngle === undefined) {
    rotateAngle = direction === "ccw" ? -10 : 10
  }

  const motionProps: MotionProps = {
    style: {
      transformOrigin: originMap[origin],
    },
    whileHover: !disabled
      ? {
          rotate: rotateAngle,
          ...(scale !== 1 && { scale }),
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: scale > 1 ? 0.95 : 1,
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
 * Subtle rotation - Minimal effect
 */
export const HoverRotateSubtle: typeof HoverRotate = (props) => (
  <HoverRotate preset="subtle" {...props} />
)

/**
 * Default rotation - Standard effect
 */
export const HoverRotateDefault: typeof HoverRotate = (props) => (
  <HoverRotate preset="default" {...props} />
)

/**
 * Medium rotation - Noticeable effect
 */
export const HoverRotateMedium: typeof HoverRotate = (props) => (
  <HoverRotate preset="medium" {...props} />
)

/**
 * Strong rotation - Large effect
 */
export const HoverRotateStrong: typeof HoverRotate = (props) => (
  <HoverRotate preset="strong" {...props} />
)

/**
 * Clockwise rotation
 */
export const HoverRotateCW: typeof HoverRotate = (props) => (
  <HoverRotate direction="cw" {...props} />
)

/**
 * Counter-clockwise rotation
 */
export const HoverRotateCCW: typeof HoverRotate = (props) => (
  <HoverRotate direction="ccw" {...props} />
)

/**
 * Rotation with scale effect
 */
export const HoverRotateWithScale: typeof HoverRotate = (props) => (
  <HoverRotate scale={1.1} {...props} />
)

/**
 * Icon wiggle - Quick back and forth
 */
export const IconWiggle: typeof HoverRotate = (props) => (
  <HoverRotate
    angle={15}
    stiffness={500}
    damping={10}
    asChild={props.asChild}
    className={props.className}
    onClick={props.onClick}
  >
    {props.children}
  </HoverRotate>
)

// ============================================================================
// SPIN ON HOVER COMPONENT
// ============================================================================

export interface SpinOnHoverProps {
  /**
   * Children to spin
   */
  children: React.ReactNode

  /**
   * Number of rotations
   * @default 1
   */
  rotations?: number

  /**
   * Animation duration in seconds
   * @default 0.5
   */
  duration?: number

  /**
   * Easing function
   * @default "easeInOut"
   */
  easing?: string

  /**
   * Additional classes
   */
  className?: string
}

/**
 * Complete rotation on hover
 */
export const SpinOnHover: React.FC<SpinOnHoverProps> = ({
  children,
  rotations = 1,
  duration = 0.5,
  easing = "easeInOut",
  className,
}) => {
  return (
    <motion.div
      className={cn("inline-block", className)}
      whileHover={{
        rotate: 360 * rotations,
      }}
      transition={{
        duration,
        ease: easing,
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for hover rotate motion props
 */
export interface UseHoverRotateOptions {
  angle?: number
  direction?: RotateDirection
  scale?: number
  origin?: RotateOrigin
  preset?: RotatePreset
  stiffness?: number
  damping?: number
  disabled?: boolean
}

export function useHoverRotate(options: UseHoverRotateOptions = {}): MotionProps {
  const {
    angle,
    direction = "cw",
    scale = 1,
    origin = "center",
    preset,
    stiffness = 300,
    damping = 20,
    disabled = false,
  } = options

  let rotateAngle = angle

  if (rotateAngle === undefined && preset) {
    const presetAngles = rotatePresets[preset]
    rotateAngle = direction === "ccw" ? presetAngles.ccw : presetAngles.cw
  } else if (rotateAngle === undefined) {
    rotateAngle = direction === "ccw" ? -10 : 10
  }

  return {
    style: {
      transformOrigin: originMap[origin],
    },
    whileHover: !disabled
      ? {
          rotate: rotateAngle,
          ...(scale !== 1 && { scale }),
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: scale > 1 ? 0.95 : 1,
        }
      : undefined,
    transition: {
      type: "spring",
      stiffness,
      damping,
    },
  }
}

export default HoverRotate
