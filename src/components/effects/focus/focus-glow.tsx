/**
 * Focus Glow Effect
 *
 * Glow effect on focus with animated entry.
 * Creates a radiant glow that enhances focus visibility.
 *
 * Features:
 * - Animated glow entry/exit
 * - Configurable color and intensity
 * - Multi-layer glow support
 * - Keyboard-only focus mode
 * - Smooth spring animations
 *
 * @example
 * ```tsx
 * import { FocusGlow } from './focus-glow'
 *
 * <FocusGlow color="blue" intensity="medium">
 *   <Input />
 * </FocusGlow>
 * ```
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type GlowColor =
  | "blue"
  | "purple"
  | "green"
  | "amber"
  | "rose"
  | "white"
  | "custom"

export type GlowIntensity = "subtle" | "low" | "medium" | "high" | "extreme"

export interface FocusGlowProps {
  /**
   * Child element to wrap
   */
  children: React.ReactElement

  /**
   * Glow color
   * @default "blue"
   */
  color?: GlowColor

  /**
   * Custom color value (when color="custom")
   */
  customColor?: string

  /**
   * Glow intensity
   * @default "medium"
   */
  intensity?: GlowIntensity

  /**
   * Enable keyboard-only focus
   * @default true
   */
  keyboardOnly?: boolean

  /**
   * Additional classes
   */
  className?: string

  /**
   * Additional styles
   */
  style?: React.CSSProperties
}

// ============================================================================
// COLOR MAPPING
// ============================================================================

const colorMap: Record<GlowColor, string> = {
  blue: "59, 130, 246",
  purple: "139, 92, 246",
  green: "34, 197, 94",
  amber: "251, 191, 36",
  rose: "244, 63, 94",
  white: "255, 255, 255",
  custom: "",
}

// ============================================================================
// INTENSITY CONFIG
// ============================================================================

const intensityConfig: Record<
  GlowIntensity,
  { spread: number; opacity: number; layers: number }
> = {
  subtle: { spread: 8, opacity: 0.15, layers: 1 },
  low: { spread: 12, opacity: 0.2, layers: 1 },
  medium: { spread: 16, opacity: 0.3, layers: 2 },
  high: { spread: 20, opacity: 0.4, layers: 2 },
  extreme: { spread: 24, opacity: 0.5, layers: 3 },
}

// ============================================================================
// BUILD GLOW SHADOW
// ============================================================================

function buildGlowShadow(
  rgb: string,
  config: { spread: number; opacity: number; layers: number }
): string {
  const shadows: string[] = []
  for (let i = 0; i < config.layers; i++) {
    const spread = config.spread + i * 4
    const opacity = config.opacity - i * 0.1
    shadows.push(`0 0 ${spread}px rgb(${rgb} / ${opacity})`)
  }
  return shadows.join(", ")
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const glowVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FocusGlow - Glow effect on focus
 */
export const FocusGlow: React.FC<FocusGlowProps> = ({
  children,
  color = "blue",
  customColor,
  intensity = "medium",
  keyboardOnly = true,
  className,
  style,
}) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [isKeyboardFocus, setIsKeyboardFocus] = React.useState(false)
  const childRef = React.useRef<HTMLElement>(null)

  // Get config
  const config = intensityConfig[intensity]
  const rgbColor = customColor || colorMap[color] || colorMap.blue
  const glowShadow = buildGlowShadow(rgbColor, config)

  // Track focus state
  React.useEffect(() => {
    const element = childRef.current
    if (!element) return

    const handleFocus = (e: FocusEvent) => {
      setIsFocused(true)
      setIsKeyboardFocus(
        (e.target as HTMLElement).classList.contains("focus-visible")
      )
    }

    const handleBlur = () => {
      setIsFocused(false)
      setIsKeyboardFocus(false)
    }

    const handleKeyDown = () => setIsKeyboardFocus(true)
    const handleMouseDown = () => setIsKeyboardFocus(false)

    element.addEventListener("focusin", handleFocus)
    element.addEventListener("focusout", handleBlur)
    element.addEventListener("keydown", handleKeyDown)
    element.addEventListener("mousedown", handleMouseDown)

    return () => {
      element.removeEventListener("focusin", handleFocus)
      element.removeEventListener("focusout", handleBlur)
      element.removeEventListener("keydown", handleKeyDown)
      element.removeEventListener("mousedown", handleMouseDown)
    }
  }, [])

  // Show glow only when focused
  const showGlow = keyboardOnly ? isFocused && isKeyboardFocus : isFocused

  return (
    <div className="relative inline-block">
      {/* Glow overlay */}
      <AnimatePresence>
        {showGlow && (
          <motion.div
            className={cn(
              "absolute inset-0 pointer-events-none rounded-[inherit]",
              className
            )}
            style={{
              boxShadow: glowShadow,
              ...style,
            }}
            variants={glowVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />
        )}
      </AnimatePresence>

      {/* Child with ref */}
      {React.cloneElement(children, {
        ref: (node: HTMLElement | null) => {
          ;(childRef as React.MutableRefObject<HTMLElement | null>).current = node
          const originalRef = (children as any).ref
          if (typeof originalRef === "function") {
            originalRef(node)
          } else if (originalRef) {
            ;(originalRef as React.MutableRefObject<HTMLElement | null>).current = node
          }
        },
        className: cn(children.props.className, "focus:outline-none"),
      })}
    </div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Subtle glow
 */
export const FocusGlowSubtle: React.FC<Omit<FocusGlowProps, "intensity">> = (props) => {
  return React.createElement(FocusGlow, { intensity: "subtle", ...props })
}

/**
 * High glow
 */
export const FocusGlowHigh: React.FC<Omit<FocusGlowProps, "intensity">> = (props) => {
  return React.createElement(FocusGlow, { intensity: "high", ...props })
}

/**
 * Extreme glow
 */
export const FocusGlowExtreme: React.FC<Omit<FocusGlowProps, "intensity">> = (props) => {
  return React.createElement(FocusGlow, { intensity: "extreme", ...props })
}

/**
 * Blue glow
 */
export const FocusGlowBlue: React.FC<Omit<FocusGlowProps, "color">> = (props) => {
  return React.createElement(FocusGlow, { color: "blue", ...props })
}

/**
 * Purple glow
 */
export const FocusGlowPurple: React.FC<Omit<FocusGlowProps, "color">> = (props) => {
  return React.createElement(FocusGlow, { color: "purple", ...props })
}

/**
 * Green glow
 */
export const FocusGlowGreen: React.FC<Omit<FocusGlowProps, "color">> = (props) => {
  return React.createElement(FocusGlow, { color: "green", ...props })
}

/**
 * Amber glow
 */
export const FocusGlowAmber: React.FC<Omit<FocusGlowProps, "color">> = (props) => {
  return React.createElement(FocusGlow, { color: "amber", ...props })
}

/**
 * Rose glow
 */
export const FocusGlowRose: React.FC<Omit<FocusGlowProps, "color">> = (props) => {
  return React.createElement(FocusGlow, { color: "rose", ...props })
}

export default FocusGlow
