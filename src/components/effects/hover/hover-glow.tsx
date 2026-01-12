/**
 * Hover Glow Effect
 *
 * Glow effect on hover using box-shadow.
 * Creates a radiant glow that can be colored or white.
 *
 * Features:
 * - Configurable glow color and intensity
 * - Spread radius control
 * - Multi-layer glow support
 * - Animation on entry
 * - Dark mode support
 *
 * @example
 * ```tsx
 * import { HoverGlow } from './hover-glow'
 *
 * <HoverGlow color="blue" intensity="medium">
 *   <Button>Action</Button>
 * </HoverGlow>
 * ```
 */

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type GlowColor =
  | "white"
  | "black"
  | "blue"
  | "purple"
  | "green"
  | "amber"
  | "rose"
  | "current"

export type GlowIntensity = "subtle" | "low" | "medium" | "high" | "extreme"

export interface HoverGlowProps {
  /**
   * Children to apply glow effect
   */
  children: React.ReactNode

  /**
   * Glow color
   * @default "blue"
   */
  color?: GlowColor

  /**
   * Glow intensity
   * @default "medium"
   */
  intensity?: GlowIntensity

  /**
   * Custom glow color (CSS color value)
   */
  customColor?: string

  /**
   * Scale amount on hover
   * @default 1.05
   */
  scale?: number

  /**
   * Animation duration in seconds
   * @default 0.3
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
// COLOR MAPPING
// ============================================================================

export const colorMap: Record<GlowColor, string> = {
  white: "255, 255, 255",
  black: "0, 0, 0",
  blue: "59, 130, 246",
  purple: "139, 92, 246",
  green: "34, 197, 94",
  amber: "251, 191, 36",
  rose: "244, 63, 94",
  current: "currentColor",
}

// ============================================================================
// INTENSITY MAPPING
// ============================================================================

interface GlowConfig {
  spread: number
  opacity: number
  layers: number
}

export const intensityMap: Record<GlowIntensity, GlowConfig> = {
  subtle: { spread: 10, opacity: 0.1, layers: 1 },
  low: { spread: 15, opacity: 0.2, layers: 1 },
  medium: { spread: 20, opacity: 0.3, layers: 1 },
  high: { spread: 25, opacity: 0.4, layers: 2 },
  extreme: { spread: 30, opacity: 0.5, layers: 3 },
}

/**
 * Build glow shadow value
 */
export function buildGlowShadow(
  color: string,
  config: GlowConfig,
  isCurrent = false
): string {
  if (isCurrent) {
    return `0 0 ${config.spread}px currentColor`
  }

  const shadows: string[] = []
  for (let i = 0; i < config.layers; i++) {
    const spread = config.spread + i * 5
    const opacity = config.opacity - i * 0.1
    shadows.push(`0 0 ${spread}px rgb(${color} / ${opacity})`)
  }
  return shadows.join(", ")
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * HoverGlow - Apply glow effect on hover
 */
export const HoverGlow: React.FC<HoverGlowProps> = ({
  children,
  color = "blue",
  intensity = "medium",
  customColor,
  scale = 1.05,
  duration = 0.3,
  disabled = false,
  asChild = false,
  className,
  onClick,
}) => {
  const glowConfig = intensityMap[intensity]
  const rgbColor = customColor?.match(/\d+, \d+, \d+/)?.[0] || colorMap[color]

  const glowShadow = buildGlowShadow(
    rgbColor,
    glowConfig,
    color === "current"
  )

  const motionProps: MotionProps = {
    whileHover: !disabled
      ? {
          scale,
          boxShadow: glowShadow,
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: 0.95,
          boxShadow: glowShadow,
        }
      : undefined,
    transition: {
      duration,
      ease: "easeOut",
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
 * Blue glow - Primary accent
 */
export const HoverGlowBlue: typeof HoverGlow = (props) => (
  <HoverGlow color="blue" {...props} />
)

/**
 * Purple glow - Secondary accent
 */
export const HoverGlowPurple: typeof HoverGlow = (props) => (
  <HoverGlow color="purple" {...props} />
)

/**
 * Green glow - Success state
 */
export const HoverGlowGreen: typeof HoverGlow = (props) => (
  <HoverGlow color="green" {...props} />
)

/**
 * Amber glow - Warning state
 */
export const HoverGlowAmber: typeof HoverGlow = (props) => (
  <HoverGlow color="amber" {...props} />
)

/**
 * Rose glow - Danger state
 */
export const HoverGlowRose: typeof HoverGlow = (props) => (
  <HoverGlow color="rose" {...props} />
)

/**
 * White glow - Neutral light mode
 */
export const HoverGlowWhite: typeof HoverGlow = (props) => (
  <HoverGlow color="white" {...props} />
)

/**
 * Subtle glow - Minimal effect
 */
export const HoverGlowSubtle: typeof HoverGlow = (props) => (
  <HoverGlow intensity="subtle" {...props} />
)

/**
 * High glow - Strong effect
 */
export const HoverGlowHigh: typeof HoverGlow = (props) => (
  <HoverGlow intensity="high" {...props} />
)

/**
 * Extreme glow - Maximum effect
 */
export const HoverGlowExtreme: typeof HoverGlow = (props) => (
  <HoverGlow intensity="extreme" {...props} />
)

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for hover glow motion props
 */
export interface UseHoverGlowOptions {
  color?: GlowColor
  intensity?: GlowIntensity
  customColor?: string
  scale?: number
  duration?: number
  disabled?: boolean
}

export function useHoverGlow(options: UseHoverGlowOptions = {}): MotionProps {
  const {
    color = "blue",
    intensity = "medium",
    customColor,
    scale = 1.05,
    duration = 0.3,
    disabled = false,
  } = options

  const glowConfig = intensityMap[intensity]
  const rgbColor = customColor?.match(/\d+, \d+, \d+/)?.[0] || colorMap[color]
  const glowShadow = buildGlowShadow(rgbColor, glowConfig, color === "current")

  return {
    whileHover: !disabled
      ? {
          scale,
          boxShadow: glowShadow,
        }
      : undefined,
    whileTap: !disabled
      ? {
          scale: 0.95,
          boxShadow: glowShadow,
        }
      : undefined,
    transition: {
      duration,
      ease: "easeOut",
    },
  }
}

export default HoverGlow
