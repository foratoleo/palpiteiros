/**
 * Hover Shine Effect
 *
 * Shimmer/shine animation on hover.
 * Creates a reflective light sweep effect across the element.
 *
 * Features:
 * - Animated shine sweep on hover
 * - Configurable shine direction
 * - Adjustable shine color and opacity
 * - Smooth entry/exit animations
 * - Performance optimized with CSS transforms
 *
 * @example
 * ```tsx
 * import { HoverShine } from './hover-shine'
 *
 * <HoverShine direction="right">
 *   <Card>Content</Card>
 * </HoverShine>
 * ```
 */

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type ShineDirection = "left" | "right" | "top" | "bottom" | "diagonal"

export type ShineColor = "white" | "black" | "custom"

export interface HoverShineProps {
  /**
   * Children to apply shine effect
   */
  children: React.ReactNode

  /**
   * Shine sweep direction
   * @default "right"
   */
  direction?: ShineDirection

  /**
   * Shine color
   * @default "white"
   */
  color?: ShineColor

  /**
   * Custom shine color (hex or rgba)
   */
  customColor?: string

  /**
   * Shine width in percentage
   * @default 50
   */
  shineWidth?: number

  /**
   * Animation duration in seconds
   * @default 0.6
   */
  duration?: number

  /**
   * Shine opacity
   * @default 0.3
   */
  opacity?: number

  /**
   * Enable/disable effect
   * @default true
   */
  disabled?: boolean

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
// ANIMATION VARIANTS
// ============================================================================

const getVariants = (direction: ShineDirection, shineWidth: number) => {
  const offset = 100 + shineWidth

  switch (direction) {
    case "left":
      return {
        initial: { x: `${offset}%` },
        hover: { x: `-${offset}%` },
      }
    case "right":
      return {
        initial: { x: `-${offset}%` },
        hover: { x: `${offset}%` },
      }
    case "top":
      return {
        initial: { y: `${offset}%` },
        hover: { y: `-${offset}%` },
      }
    case "bottom":
      return {
        initial: { y: `-${offset}%` },
        hover: { y: `${offset}%` },
      }
    case "diagonal":
      return {
        initial: { x: `-${offset}%`, y: `-${offset}%` },
        hover: { x: `${offset}%`, y: `${offset}%` },
      }
    default:
      return {
        initial: { x: `-${offset}%` },
        hover: { x: `${offset}%` },
      }
  }
}

const getShineStyle = (direction: ShineDirection): React.CSSProperties => {
  switch (direction) {
    case "left":
    case "right":
      return {
        top: 0,
        left: 0,
        bottom: 0,
        width: "100px",
        height: "100%",
      }
    case "top":
    case "bottom":
      return {
        left: 0,
        top: 0,
        right: 0,
        width: "100%",
        height: "100px",
      }
    case "diagonal":
      return {
        top: 0,
        left: 0,
        width: "150px",
        height: "150%",
      }
    default:
      return {
        top: 0,
        left: 0,
        bottom: 0,
        width: "100px",
        height: "100%",
      }
  }
}

const getGradient = (
  direction: ShineDirection,
  color: string,
  opacity: number
): string => {
  const colorWithOpacity = color.startsWith("#")
    ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, "0")}`
    : color.replace(/[\d.]+\)$/g, `${opacity})`)

  switch (direction) {
    case "left":
    case "right":
      return `linear-gradient(90deg, transparent, ${colorWithOpacity}, transparent)`
    case "top":
    case "bottom":
      return `linear-gradient(180deg, transparent, ${colorWithOpacity}, transparent)`
    case "diagonal":
      return `linear-gradient(45deg, transparent, ${colorWithOpacity}, transparent)`
    default:
      return `linear-gradient(90deg, transparent, ${colorWithOpacity}, transparent)`
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HoverShine - Apply shine effect on hover
 */
export const HoverShine: React.FC<HoverShineProps> = ({
  children,
  direction = "right",
  color = "white",
  customColor,
  shineWidth = 50,
  duration = 0.6,
  opacity = 0.3,
  disabled = false,
  className,
  onClick,
}) => {
  const shineColor =
    customColor || (color === "white" ? "#ffffff" : "#000000")

  const variants = getVariants(direction, shineWidth)
  const shineStyle = getShineStyle(direction)
  const gradient = getGradient(direction, shineColor, opacity)

  return (
    <motion.div
      className={cn("relative overflow-hidden inline-block", className)}
      onClick={onClick}
      initial={false}
      whileHover={!disabled ? "hover" : "initial"}
    >
      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Shine layer */}
      <motion.div
        className="absolute pointer-events-none z-20"
        style={{
          ...shineStyle,
          background: gradient,
          transform: "skewX(-20deg)",
        }}
        variants={variants}
        transition={{
          duration,
          ease: "easeInOut",
        }}
      />
    </motion.div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Shine from left to right
 */
export const HoverShineRight: typeof HoverShine = (props) => (
  <HoverShine direction="right" {...props} />
)

/**
 * Shine from right to left
 */
export const HoverShineLeft: typeof HoverShine = (props) => (
  <HoverShine direction="left" {...props} />
)

/**
 * Shine from top to bottom
 */
export const HoverShineBottom: typeof HoverShine = (props) => (
  <HoverShine direction="bottom" {...props} />
)

/**
 * Shine from bottom to top
 */
export const HoverShineTop: typeof HoverShine = (props) => (
  <HoverShine direction="top" {...props} />
)

/**
 * Diagonal shine effect
 */
export const HoverShineDiagonal: typeof HoverShine = (props) => (
  <HoverShine direction="diagonal" {...props} />
)

/**
 * Quick shine effect (faster duration)
 */
export const HoverShineFast: typeof HoverShine = (props) => (
  <HoverShine duration={0.3} {...props} />
)

/**
 * Slow shine effect (slower duration)
 */
export const HoverShineSlow: typeof HoverShine = (props) => (
  <HoverShine duration={1} {...props} />
)

// ============================================================================
// BUTTON WRAPPER COMPONENT
// ============================================================================

export interface ShinyButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  /**
   * Button content
   */
  children: React.ReactNode

  /**
   * Shine direction
   */
  direction?: ShineDirection

  /**
   * Button variant
   */
  variant?: "primary" | "secondary" | "outline" | "ghost"
}

/**
 * Button with integrated shine effect
 */
export const ShinyButton: React.FC<ShinyButtonProps> = ({
  children,
  direction = "right",
  variant = "primary",
  className,
  ...props
}) => {
  const variantClasses: Record<string, string> = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md",
    secondary:
      "bg-secondary text-secondary-foreground hover:bg-secondary/90 px-4 py-2 rounded-md",
    outline:
      "border border-input bg-background hover:bg-accent px-4 py-2 rounded-md",
    ghost: "hover:bg-accent px-4 py-2 rounded-md",
  }

  return (
    <HoverShine direction={direction} opacity={0.15}>
      <button className={cn(variantClasses[variant], className)} {...props}>
        {children}
      </button>
    </HoverShine>
  )
}

export default HoverShine
