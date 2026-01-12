/**
 * Hover Lift Effect
 *
 * Lift effect on hover with translateY and enhanced shadow.
 * Provides tactile feedback as if the element is being picked up.
 *
 * Features:
 * - Configurable lift distance
 * - Enhanced shadow on hover
 * - Smooth spring animation
 * - Press feedback
 * - GPU accelerated
 *
 * @example
 * ```tsx
 * import { HoverLift } from './hover-lift'
 *
 * <HoverLift lift={8}>
 *   <Card>Content</Card>
 * </HoverLift>
 * ```
 */

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export interface HoverLiftProps {
  /**
   * Children to apply lift effect
   */
  children: React.ReactNode

  /**
   * Lift distance in pixels (negative Y translates up)
   * @default 4
   */
  lift?: number

  /**
   * Scale amount on hover
   * @default 1.02
   */
  scale?: number

  /**
   * Scale amount on press
   * @default 0.98
   */
  pressScale?: number

  /**
   * Shadow level on hover
   * @default "xl"
   */
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "2xl"

  /**
   * Animation duration in seconds
   * @default 0.2
   */
  duration?: number

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
// SHADOW MAPPING
// ============================================================================

export const shadowMap: Record<string, string> = {
  none: "0 0 0 0 rgb(0 0 0 / 0)",
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HoverLift - Apply lift effect on hover
 */
export const HoverLift: React.FC<HoverLiftProps> = ({
  children,
  lift = 4,
  scale = 1.02,
  pressScale = 0.98,
  shadow = "xl",
  duration = 0.2,
  disabled = false,
  asChild = false,
  className,
  onClick,
}) => {
  // Motion props for hover effect
  const motionProps: MotionProps = {
    whileHover: !disabled
      ? {
          y: -lift,
          scale,
          boxShadow: shadowMap[shadow],
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: pressScale,
        }
      : undefined,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
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
 * Subtle lift - 2px lift
 */
export const HoverLiftSubtle = (props: HoverLiftProps) => (
  <HoverLift lift={2} scale={1.01} {...props} />
)

/**
 * Medium lift - 4px lift (default)
 */
export const HoverLiftMedium = (props: HoverLiftProps) => (
  <HoverLift lift={4} {...props} />
)

/**
 * Strong lift - 8px lift
 */
export const HoverLiftStrong = (props: HoverLiftProps) => (
  <HoverLift lift={8} scale={1.03} {...props} />
)

/**
 * Extreme lift - 12px lift
 */
export const HoverLiftExtreme = (props: HoverLiftProps) => (
  <HoverLift lift={12} scale={1.05} shadow="2xl" {...props} />
)

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for hover lift motion props
 */
export interface UseHoverLiftOptions {
  lift?: number
  scale?: number
  pressScale?: number
  shadow?: string
  disabled?: boolean
}

export function useHoverLift(options: UseHoverLiftOptions = {}): MotionProps {
  const {
    lift = 4,
    scale = 1.02,
    pressScale = 0.98,
    shadow = "xl",
    disabled = false,
  } = options

  return {
    whileHover: !disabled
      ? {
          y: -lift,
          scale,
          boxShadow: shadowMap[shadow],
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: pressScale,
        }
      : undefined,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  }
}

export default HoverLift
