/**
 * Compound Hover Effects
 *
 * Combines multiple hover effects for rich, layered interactions.
 * Mix and match lift, scale, glow, shine, and rotate effects.
 *
 * Features:
 * - Combine multiple effects
 * - Sequenced animation support
 * - Preset combinations
 * - Custom effect ordering
 * - Performance optimized with single transforms
 *
 * @example
 * ```tsx
 * import { CompoundHover } from './compound-hover'
 *
 * <CompoundHover effects={["lift", "glow", "scale"]}>
 *   <Card>Content</Card>
 * </CompoundHover>
 * ```
 */

import * as React from "react"
import { motion, MotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { colorMap, intensityMap, buildGlowShadow } from "./hover-glow"
import { shadowMap } from "./hover-lift"

// ============================================================================
// TYPES
// ============================================================================

export type HoverEffectType =
  | "lift"
  | "scale"
  | "glow"
  | "shine"
  | "rotate"
  | "brighten"

export type CompoundPreset =
  | "card"
  | "button"
  | "icon"
  | "badge"
  | "premium"
  | "playful"

export interface CompoundHoverProps {
  /**
   * Children to apply effects
   */
  children: React.ReactNode

  /**
   * Array of effects to apply
   */
  effects?: HoverEffectType[]

  /**
   * Use a preset combination
   */
  preset?: CompoundPreset

  // Effect-specific options
  /**
   * Lift distance in pixels
   */
  lift?: number

  /**
   * Scale amount
   */
  scale?: number

  /**
   * Glow color
   */
  glowColor?: string

  /**
   * Glow intensity
   */
  glowIntensity?: "subtle" | "low" | "medium" | "high" | "extreme"

  /**
   * Rotation angle in degrees
   */
  rotate?: number

  /**
   * Brightness increase
   */
  brighten?: number

  /**
   * Animation duration in seconds
   */
  duration?: number

  /**
   * Enable/disable effect
   */
  disabled?: boolean

  /**
   * Apply only to children (no wrapper)
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
// PRESET COMBINATIONS
// ============================================================================

const presetEffects: Record<CompoundPreset, HoverEffectType[]> = {
  card: ["lift", "scale", "glow"],
  button: ["scale", "glow"],
  icon: ["scale", "rotate"],
  badge: ["lift", "brighten"],
  premium: ["lift", "scale", "glow", "shine"],
  playful: ["lift", "scale", "rotate"],
}

// ============================================================================
// BUILD COMBINED MOTION PROPS
// ============================================================================

type BuildMotionPropsOptions = {
  effects: HoverEffectType[]
  lift?: number
  scale?: number
  glowColor?: string
  glowIntensity?: "subtle" | "low" | "medium" | "high" | "extreme"
  rotate?: number
  brighten?: number
  duration?: number
  disabled?: boolean
}

function buildMotionProps(options: BuildMotionPropsOptions): MotionProps {
  const {
    effects,
    lift = 4,
    scale = 1.02,
    glowColor = "59, 130, 246", // blue
    glowIntensity = "medium",
    rotate = 5,
    brighten = 0.1,
    duration = 0.2,
    disabled = false,
  } = options

  const hoverValues: Record<string, any> = {}
  const tapValues: Record<string, any> = {}

  for (const effect of effects) {
    switch (effect) {
      case "lift":
        hoverValues.y = -lift
        hoverValues.boxShadow = shadowMap.xl
        break
      case "scale":
        hoverValues.scale = scale
        tapValues.scale = 0.98
        break
      case "glow":
        const glowConfig = intensityMap[glowIntensity]
        hoverValues.boxShadow = buildGlowShadow(glowColor, glowConfig, false)
        break
      case "rotate":
        hoverValues.rotate = rotate
        break
      case "brighten":
        hoverValues.filter = `brightness(${1 + brighten})`
        break
      case "shine":
        // Shine is handled separately with overlay
        break
    }
  }

  return {
    whileHover: !disabled && Object.keys(hoverValues).length > 0
      ? hoverValues
      : undefined,
    whileTap: !disabled && Object.keys(tapValues).length > 0
      ? tapValues
      : undefined,
    transition: {
      duration,
      type: "spring",
      stiffness: 400,
      damping: 17,
    },
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * CompoundHover - Combine multiple hover effects
 */
export const CompoundHover: React.FC<CompoundHoverProps> = ({
  children,
  effects,
  preset,
  lift = 4,
  scale = 1.02,
  glowColor = "59, 130, 246",
  glowIntensity = "medium",
  rotate = 5,
  brighten = 0.1,
  duration = 0.2,
  disabled = false,
  asChild = false,
  className,
  onClick,
}) => {
  // Determine effects to apply
  const combinedEffects = effects || (preset ? presetEffects[preset] : ["lift", "scale"])

  const hasShine = combinedEffects.includes("shine")

  const motionProps = buildMotionProps({
    effects: combinedEffects.filter((e) => e !== "shine"),
    lift,
    scale,
    glowColor,
    glowIntensity,
    rotate,
    brighten,
    duration,
    disabled,
  })

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...motionProps,
      className: cn(children.props.className, className),
      onClick,
    } as any)
  }

  const content = (
    <motion.div
      className={cn("relative inline-block overflow-hidden", className)}
      onClick={onClick}
      {...motionProps}
    >
      <div className="relative z-10">{children}</div>
    </motion.div>
  )

  // Wrap with shine effect if needed
  if (hasShine && !disabled) {
    const { HoverShine } = require("./hover-shine")
    return <HoverShine>{content}</HoverShine>
  }

  return content
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

type CompoundHoverPropsWithoutChildren = Omit<CompoundHoverProps, "children">

/**
 * Card hover - Lift + Scale + Glow
 */
export const CardHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { preset: "card", ...props } as any)
}

/**
 * Button hover - Scale + Glow
 */
export const ButtonHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { preset: "button", ...props } as any)
}

/**
 * Icon hover - Scale + Rotate
 */
export const IconHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { preset: "icon", rotate: 15, ...props } as any)
}

/**
 * Badge hover - Lift + Brighten
 */
export const BadgeHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { preset: "badge", ...props } as any)
}

/**
 * Premium hover - Lift + Scale + Glow + Shine
 */
export const PremiumHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { preset: "premium", ...props } as any)
}

/**
 * Playful hover - Lift + Scale + Rotate
 */
export const PlayfulHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { preset: "playful", ...props } as any)
}

/**
 * Subtle hover - Just lift
 */
export const SubtleHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, { effects: ["lift"], lift: 2, ...props } as any)
}

/**
 * Dramatic hover - All effects
 */
export const DramaticHover: React.FC<CompoundHoverPropsWithoutChildren> = (props) => {
  return React.createElement(CompoundHover, {
    effects: ["lift", "scale", "glow", "rotate", "brighten"],
    lift: 8,
    scale: 1.05,
    rotate: 3,
    ...props
  } as any)
}

// ============================================================================
// SPECIALIZED COMBINATIONS
// ============================================================================

/**
 * 3D Card effect - Combines multiple transforms for depth
 */
export interface Hover3DCardProps extends Omit<CompoundHoverProps, "effects"> {
  /**
   * Perspective depth in pixels
   */
  perspective?: number
}

export const Hover3DCard: React.FC<Hover3DCardProps> = ({
  children,
  perspective = 1000,
  lift = 8,
  scale = 1.03,
  rotate = 2,
  className,
  onClick,
}) => {
  return (
    <motion.div
      className={cn("inline-block", className)}
      style={{ perspective: `${perspective}px` }}
      onClick={onClick}
      whileHover={{
        y: -lift,
        scale,
        rotateX: rotate,
        rotateY: rotate,
      }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 20,
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Magnetic button - Pulls toward cursor
 */
export interface MagneticButtonProps {
  /**
   * Button content
   */
  children: React.ReactNode

  /**
   * Magnetic strength
   * @default 0.3
   */
  strength?: number

  /**
   * Additional classes
   */
  className?: string

  /**
   * Button props
   */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>
}

export const MagneticButton: React.FC<MagneticButtonProps> = ({
  children,
  strength = 0.3,
  className,
  buttonProps,
}) => {
  const ref = React.useRef<HTMLButtonElement>(null)
  const [x, setX] = React.useState(0)
  const [y, setY] = React.useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    setX((e.clientX - centerX) * strength)
    setY((e.clientY - centerY) * strength)
  }

  const handleMouseLeave = () => {
    setX(0)
    setY(0)
  }

  // Filter out Framer Motion conflicting props from buttonProps
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onDragConstraints,
    whileDrag,
    drag,
    dragConstraints,
    dragSnapToOrigin,
    dragElastic,
    dragMomentum,
    dragPropagation,
    dragListener,
    dragControls,
    ...safeButtonProps
  } = (buttonProps || {}) as any

  return (
    <motion.button
      ref={ref}
      className={cn("inline-block", className)}
      animate={{ x, y }}
      transition={{ type: "spring", stiffness: 150, damping: 15 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      {...safeButtonProps}
    >
      {children}
    </motion.button>
  )
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook for compound hover motion props
 */
export interface UseCompoundHoverOptions {
  effects?: HoverEffectType[]
  preset?: CompoundPreset
  lift?: number
  scale?: number
  glowColor?: string
  glowIntensity?: "subtle" | "low" | "medium" | "high" | "extreme"
  rotate?: number
  brighten?: number
  duration?: number
  disabled?: boolean
}

export function useCompoundHover(
  options: UseCompoundHoverOptions = {}
): MotionProps {
  const {
    effects,
    preset,
    lift = 4,
    scale = 1.02,
    glowColor = "59, 130, 246",
    glowIntensity = "medium",
    rotate = 5,
    brighten = 0.1,
    duration = 0.2,
    disabled = false,
  } = options

  const combinedEffects = effects || (preset ? presetEffects[preset] : ["lift", "scale"])

  return buildMotionProps({
    effects: combinedEffects.filter((e) => e !== "shine"),
    lift,
    scale,
    glowColor,
    glowIntensity,
    rotate,
    brighten,
    duration,
    disabled,
  })
}

export default CompoundHover
