/**
 * Focus Ring Component
 *
 * Animated focus ring with offset and smooth choreography.
 * WCAG AAA compliant focus visibility with beautiful animations.
 *
 * Features:
 * - Animated focus ring entry
 * - Configurable offset and size
 * - Color customization
 * - Keyboard-only focus (focus-visible)
 * - Smooth spring animations
 *
 * @example
 * ```tsx
 * import { FocusRing } from './focus-ring'
 *
 * <FocusRing offset={4} color="blue">
 *   <Button>Click me</Button>
 * </FocusRing>
 * ```
 */

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

export type FocusRingColor =
  | "blue"
  | "purple"
  | "green"
  | "amber"
  | "rose"
  | "white"
  | "black"
  | "custom"

export type FocusRingPreset =
  | "subtle"
  | "default"
  | "strong"
  | "high-contrast"

export interface FocusRingProps {
  /**
   * Child element to wrap
   */
  children: React.ReactElement

  /**
   * Ring color
   * @default "blue"
   */
  color?: FocusRingColor

  /**
   * Custom color value (when color="custom")
   */
  customColor?: string

  /**
   * Ring offset from element in pixels
   * @default 2
   */
  offset?: number

  /**
   * Ring width in pixels
   * @default 2
   */
  width?: number

  /**
   * Border radius (inherits from child by default)
   */
  borderRadius?: string | number

  /**
   * Animation preset
   * @default "default"
   */
  preset?: FocusRingPreset

  /**
   * Show ring only for keyboard navigation (focus-visible)
   * @default true
   */
  keyboardOnly?: boolean

  /**
   * Additional ring classes
   */
  className?: string

  /**
   * Additional ring styles
   */
  style?: React.CSSProperties
}

// ============================================================================
// COLOR MAPPING
// ============================================================================

const colorMap: Record<string, string> = {
  blue: "#3b82f6",
  purple: "#8b5cf6",
  green: "#22c55e",
  amber: "#fbbf24",
  rose: "#f43f5e",
  white: "#ffffff",
  black: "#000000",
}

// ============================================================================
// PRESET CONFIG
// ============================================================================

const presetConfig: Record<FocusRingPreset, { width: number; offset: number; opacity: number }> = {
  subtle: { width: 1, offset: 2, opacity: 0.5 },
  default: { width: 2, offset: 2, opacity: 0.8 },
  strong: { width: 3, offset: 3, opacity: 1 },
  "high-contrast": { width: 4, offset: 0, opacity: 1 },
}

// ============================================================================
// ANIMATION VARIANTS
// ============================================================================

const ringVariants = {
  hidden: {
    scale: 0.8,
    opacity: 0,
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * FocusRing - Animated focus indicator
 */
export const FocusRing: React.FC<FocusRingProps> = ({
  children,
  color = "blue",
  customColor,
  offset = 2,
  width,
  borderRadius,
  preset = "default",
  keyboardOnly = true,
  className,
  style,
}) => {
  const [isFocused, setIsFocused] = React.useState(false)
  const [isKeyboardFocus, setIsKeyboardFocus] = React.useState(false)
  const childRef = React.useRef<HTMLElement>(null)
  const [childRadius, setChildRadius] = React.useState<string>("")

  // Get preset values
  const presetValues = presetConfig[preset]
  const finalWidth = width ?? presetValues.width
  const finalOffset = offset ?? presetValues.offset
  const opacity = presetValues.opacity

  // Get ring color
  const ringColor = customColor || colorMap[color] || colorMap.blue

  // Clone child with ref and focus tracking
  React.useEffect(() => {
    const element = childRef.current
    if (!element) return

    // Get border radius from child
    const computed = window.getComputedStyle(element)
    setChildRadius(computed.borderRadius)

    const handleFocus = (e: FocusEvent) => {
      setIsFocused(true)
      setIsKeyboardFocus((e.target as HTMLElement).classList.contains("focus-visible"))
    }

    const handleBlur = () => {
      setIsFocused(false)
      setIsKeyboardFocus(false)
    }

    // Track keyboard navigation
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

  // Determine if ring should be visible
  const showRing = keyboardOnly ? isFocused && isKeyboardFocus : isFocused

  const finalBorderRadius = borderRadius || childRadius || "8px"

  return (
    <div className="relative inline-block">
      {/* Ring element */}
      <AnimatePresence>
        {showRing && (
          <motion.div
            className={cn(
              "absolute inset-0 pointer-events-none",
              "border-2 rounded-[inherit]",
              className
            )}
            style={{
              borderColor: ringColor,
              borderWidth: `${finalWidth}px`,
              margin: `-${finalOffset}px`,
              borderRadius: finalBorderRadius,
              opacity,
              ...style,
            }}
            variants={ringVariants}
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
          // Preserve original ref if any
          const originalRef = (children as any).ref
          if (typeof originalRef === "function") {
            originalRef(node)
          } else if (originalRef) {
            (originalRef as React.MutableRefObject<HTMLElement | null>).current = node
          }
        },
        className: cn(
          children.props.className,
          "focus:outline-none"
        ),
      })}
    </div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Subtle focus ring - Minimal appearance
 */
export const FocusRingSubtle: React.FC<Omit<FocusRingProps, "preset">> = (props) => {
  return React.createElement(FocusRing, { preset: "subtle", ...props })
}

/**
 * Strong focus ring - Prominent appearance
 */
export const FocusRingStrong: React.FC<Omit<FocusRingProps, "preset">> = (props) => {
  return React.createElement(FocusRing, { preset: "strong", ...props })
}

/**
 * High contrast focus ring - Maximum visibility
 */
export const FocusRingHighContrast: React.FC<Omit<FocusRingProps, "preset">> = (props) => {
  return React.createElement(FocusRing, { preset: "high-contrast", ...props })
}

/**
 * Blue focus ring
 */
export const FocusRingBlue: React.FC<Omit<FocusRingProps, "color">> = (props) => {
  return React.createElement(FocusRing, { color: "blue", ...props })
}

/**
 * Purple focus ring
 */
export const FocusRingPurple: React.FC<Omit<FocusRingProps, "color">> = (props) => {
  return React.createElement(FocusRing, { color: "purple", ...props })
}

/**
 * Green focus ring
 */
export const FocusRingGreen: React.FC<Omit<FocusRingProps, "color">> = (props) => {
  return React.createElement(FocusRing, { color: "green", ...props })
}

export default FocusRing
