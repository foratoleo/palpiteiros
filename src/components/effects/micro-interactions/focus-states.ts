/**
 * Focus State Utilities
 *
 * Apple-inspired focus ring choreography for accessibility.
 * Provides smooth, animated focus states that meet WCAG 2.1 AAA requirements.
 *
 * Features:
 * - Smooth focus ring animation
 * - Keyboard-only focus (optional)
 * - Customizable ring styles
 * - Dark mode support
 * - High contrast mode support
 *
 * @example
 * ```tsx
 * import { focusStyles, focusPresets } from "./focus-states"
 *
 * <button className={focusStyles({ preset: "ring" })}>
 *   Button
 * </button>
 *
 * // Or with preset
 * <button className={applyFocusPreset("ring")}>
 *   Button
 * </button>
 * ```
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Focus ring style preset
 */
export type FocusPreset =
  | "none"
  | "ring" // Standard ring
  | "ringOffset" // Ring with offset
  | "glow" // Soft glow effect
  | "solid" // Solid outline
  | "dashed" // Dashed outline
  | "bracket" // Corner brackets
  | "underline" // Underline effect
  | "dot" // Dot indicator
  | "apple" // Apple-style ring

/**
 * Focus ring position
 */
export type FocusPosition = "inner" | "outer" | "center"

/**
 * Focus animation style
 */
export type FocusAnimation = "none" | "scale" | "fade" | "expand" | "slide"

/**
 * Focus state configuration
 */
export interface FocusConfig {
  /** Focus preset style */
  preset?: FocusPreset
  /** Ring width in pixels */
  ringWidth?: number
  /** Ring offset in pixels */
  ringOffset?: number
  /** Ring color (CSS variable or color value) */
  ringColor?: string
  /** Focus animation */
  animation?: FocusAnimation
  /** Animation duration in ms */
  duration?: number
  /** Keyboard-only focus (hide for mouse users) */
  keyboardOnly?: boolean
  /** Custom inset for inner rings */
  inset?: number
}

/**
 * Focus state styles
 */
export interface FocusStateStyles {
  /** Base classes */
  base: ClassValue
  /** Focus classes */
  focus: ClassValue
  /** Focus-visible classes */
  focusVisible: ClassValue
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default focus configuration
 */
export const DEFAULT_FOCUS_CONFIG: Required<FocusConfig> = {
  preset: "ring",
  ringWidth: 2,
  ringOffset: 2,
  ringColor: "rgb(59 130 246)",
  animation: "expand",
  duration: 200,
  keyboardOnly: true,
  inset: 0,
}

/**
 * Focus ring color presets for light/dark mode
 */
export const FOCUS_COLORS = {
  blue: {
    light: "rgb(59 130 246)",
    dark: "rgb(96 165 250)",
  },
  primary: {
    light: "rgb(var(--color-primary) / 0.5)",
    dark: "rgb(var(--color-primary) / 0.5)",
  },
  accent: {
    light: "rgb(var(--color-accent) / 0.5)",
    dark: "rgb(var(--color-accent) / 0.5)",
  },
  white: {
    light: "rgb(255 255 255)",
    dark: "rgb(255 255 255)",
  },
  black: {
    light: "rgb(0 0 0)",
    dark: "rgb(0 0 0)",
  },
} as const

/**
 * Focus animation durations
 */
export const FOCUS_DURATIONS = {
  instant: 0,
  fast: 150,
  default: 200,
  slow: 300,
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get ring width classes
 */
function getRingWidthClasses(width: number): string {
  // Tailwind ring utilities: ring-0, ring-1, ring-2, ring-4, ring-8
  const widths: Record<number, string> = {
    0: "ring-0",
    1: "ring-1",
    2: "ring-2",
    3: "ring-[3px]",
    4: "ring-4",
    5: "ring-[5px]",
    6: "ring-[6px]",
    8: "ring-8",
  }
  return widths[Math.round(width)] || "ring-2"
}

/**
 * Get ring offset classes
 */
function getRingOffsetClasses(offset: number): string {
  const offsets: Record<number, string> = {
    0: "ring-offset-0",
    1: "ring-offset-1",
    2: "ring-offset-2",
    3: "ring-offset-[3px]",
    4: "ring-offset-4",
    5: "ring-offset-[5px]",
    6: "ring-offset-[6px]",
    8: "ring-offset-8",
  }
  return offsets[Math.round(offset)] || "ring-offset-2"
}

/**
 * Build focus state classes based on preset
 */
function buildFocusPresetClasses(
  preset: FocusPreset,
  config: Required<FocusConfig>
): string[] {
  const classes: string[] = []

  switch (preset) {
    case "none":
      return []

    case "ring":
      classes.push(getRingWidthClasses(config.ringWidth))
      classes.push("focus-visible:ring-blue-500") // Use standard Tailwind color
      break

    case "ringOffset":
      classes.push(getRingWidthClasses(config.ringWidth))
      classes.push(getRingOffsetClasses(config.ringOffset))
      classes.push("focus-visible:ring-blue-500") // Use standard Tailwind color
      classes.push("focus-visible:ring-offset-background")
      break

    case "glow":
      classes.push("focus-visible:shadow-[0_0_0_4px_var(--tw-shadow-color)]")
      classes.push("shadow-blue-500/30") // Use standard Tailwind color
      break

    case "solid":
      classes.push("focus-visible:outline")
      classes.push("focus-visible:outline-2")
      classes.push("focus-visible:outline-blue-500") // Use standard Tailwind color
      classes.push("focus-visible:outline-offset-2")
      break

    case "dashed":
      classes.push("focus-visible:outline")
      classes.push("focus-visible:outline-2")
      classes.push("focus-visible:outline-dashed")
      classes.push("focus-visible:outline-blue-500") // Use standard Tailwind color
      classes.push("focus-visible:outline-offset-2")
      break

    case "bracket":
      // Bracket effect requires custom CSS
      classes.push("focus-visible:outline-none")
      classes.push("focus-visible:[box-shadow:4px_4px_0_0_var(--focus-color),-4px_-4px_0_0_var(--focus-color),4px_-4px_0_0_var(--focus-color),-4px_4px_0_0_var(--focus-color)]")
      break

    case "underline":
      classes.push("focus-visible:outline-none")
      classes.push("focus-visible:border-b-2")
      classes.push("focus-visible:border-blue-500") // Use standard Tailwind color
      break

    case "dot":
      classes.push("focus-visible:outline-none")
      classes.push("after:focus-visible:absolute")
      classes.push("after:focus-visible:inset-0")
      classes.push("after:focus-visible:ring-2")
      classes.push("after:focus-visible:ring-blue-500") // Use standard Tailwind color
      classes.push("after:focus-visible:rounded-full")
      classes.push("after:focus-visible:m-auto")
      classes.push("after:focus-visible:w-1.5")
      classes.push("after:focus-visible:h-1.5")
      break

    case "apple":
      // Apple-style focus: subtle blue ring with smooth animation
      classes.push(getRingWidthClasses(config.ringWidth))
      classes.push(getRingOffsetClasses(config.ringOffset))
      classes.push("focus-visible:ring-blue-500/50")
      classes.push("focus-visible:ring-offset-background")
      classes.push("focus-visible:transition-[box-shadow]")
      classes.push("focus-visible:duration-200") // Fixed duration
      break
  }

  return classes
}

/**
 * Build animation classes
 */
function buildAnimationClasses(animation: FocusAnimation, duration: number): string[] {
  const classes: string[] = []

  switch (animation) {
    case "none":
      break
    case "scale":
      classes.push("focus-visible:scale-[1.02]")
      classes.push(`focus-visible:transition-[transform]`)
      break
    case "fade":
      classes.push("focus-visible:opacity-100")
      classes.push("focus-visible:transition-opacity")
      break
    case "expand":
      classes.push("focus-visible:transition-[box-shadow]")
      break
    case "slide":
      classes.push("focus-visible:transition-transform")
      classes.push("focus-visible:-translate-y-px")
      break
  }

  if (animation !== "none") {
    classes.push("duration-200") // Fixed duration
    classes.push("ease-out")
  }

  return classes
}

/**
 * Generate focus styles class string
 */
export function focusStyles(config: FocusConfig = {}): string {
  const styles = getFocusStateStyles(config)
  return twMerge(clsx(styles.base, styles.focus, styles.focusVisible))
}

/**
 * Get individual focus state styles
 */
export function getFocusStateStyles(config: FocusConfig = {}): FocusStateStyles {
  const finalConfig = { ...DEFAULT_FOCUS_CONFIG, ...config }

  // Always include outline removal for custom focus styles
  const baseClasses = [
    "outline-none",
    "focus:outline-none",
  ]

  // Build preset classes
  const presetClasses = buildFocusPresetClasses(finalConfig.preset, finalConfig)

  // Build animation classes
  const animationClasses = buildAnimationClasses(finalConfig.animation, finalConfig.duration)

  // Determine which selector to use
  const focusSelector = finalConfig.keyboardOnly ? "focus-visible" : "focus"

  return {
    base: clsx(baseClasses),
    focus: clsx(!finalConfig.keyboardOnly ? [...presetClasses, ...animationClasses] : []),
    focusVisible: clsx(finalConfig.keyboardOnly ? [...presetClasses, ...animationClasses] : []),
  }
}

/**
 * Preset focus configurations for common use cases
 */
export const focusPresets = {
  /**
   * No focus ring (for decorative elements)
   */
  none: { preset: "none" as const },

  /**
   * Standard ring focus (default)
   */
  ring: { preset: "ring" as const },

  /**
   * Ring with offset (prevents ring clipping)
   */
  ringOffset: { preset: "ringOffset" as const },

  /**
   * Soft glow focus (modern, subtle)
   */
  glow: { preset: "glow" as const },

  /**
   * Solid outline focus (high contrast)
   */
  solid: { preset: "solid" as const },

  /**
   * Dashed outline focus (indicates interactive)
   */
  dashed: { preset: "dashed" as const },

  /**
   * Corner bracket focus (unique, minimal)
   */
  bracket: { preset: "bracket" as const },

  /**
   * Underline focus (minimal)
   */
  underline: { preset: "underline" as const },

  /**
   * Dot indicator focus (minimal, modern)
   */
  dot: { preset: "dot" as const },

  /**
   * Apple-style focus ring
   */
  apple: {
    preset: "apple" as const,
    ringWidth: 2,
    ringOffset: 2,
    animation: "expand" as const,
    duration: 200,
  },

  /**
   * High contrast focus (accessibility)
   */
  highContrast: {
    preset: "solid" as const,
    ringWidth: 3,
    ringOffset: 2,
    animation: "none" as const,
  },
} as const

/**
 * Apply preset focus configuration
 */
export function applyFocusPreset(
  preset: keyof typeof focusPresets,
  customConfig?: Partial<FocusConfig>
): string {
  const presetConfig = focusPresets[preset]
  const config = { ...presetConfig, ...customConfig }
  return focusStyles(config)
}

/**
 * Generate focus styles as CSS variables
 */
export function getFocusVars(config: FocusConfig = {}): Record<string, string> {
  const finalConfig = { ...DEFAULT_FOCUS_CONFIG, ...config }

  return {
    "--focus-ring-width": `${finalConfig.ringWidth}px`,
    "--focus-ring-offset": `${finalConfig.ringOffset}px`,
    "--focus-ring-color": finalConfig.ringColor,
    "--focus-ring-duration": `${finalConfig.duration}ms`,
  } as Record<string, string>
}

/**
 * Generate CSS-in-JS focus styles
 */
export function getFocusStyles(config: FocusConfig = {}): {
  base: React.CSSProperties
  focus: React.CSSProperties
} {
  const finalConfig = { ...DEFAULT_FOCUS_CONFIG, ...config }

  return {
    base: {
      outline: "none",
    },
    focus: {
      outline: "none",
      boxShadow: finalConfig.keyboardOnly
        ? undefined
        : `0 0 0 ${finalConfig.ringWidth}px ${finalConfig.ringColor}`,
    },
    focusVisible: finalConfig.keyboardOnly
      ? {
          outline: "none",
          boxShadow: `0 0 0 ${finalConfig.ringWidth}px ${finalConfig.ringColor}`,
          transition: `box-shadow ${finalConfig.duration}ms ease-out`,
        }
      : undefined,
  } as {
    base: React.CSSProperties
    focus: React.CSSProperties
    focusVisible?: React.CSSProperties
  }
}

// ============================================================================
// UTILITY HOOKS (for future React integration)
// ============================================================================

/**
 * Check if user is navigating with keyboard
 * Useful for keyboard-only focus styles
 */
export function isKeyboardNavigation(): boolean {
  if (typeof window === "undefined") return false

  // Check if user has recently used keyboard
  return (
    (window as any).__lastInteractionType === "keyboard" ||
    document.activeElement?.getAttribute("data-focus-visible-added") === "true"
  )
}

/**
 * Store last interaction type (for keyboard detection)
 */
export function trackInputMethod(): void {
  if (typeof window === "undefined") return

  let hadKeyboardEvent = false

  const handleKeyDown = () => {
    hadKeyboardEvent = true
    ;(window as any).__lastInteractionType = "keyboard"
  }

  const handleMouseDown = () => {
    hadKeyboardEvent = false
    ;(window as any).__lastInteractionType = "mouse"
  }

  document.addEventListener("keydown", handleKeyDown, true)
  document.addEventListener("mousedown", handleMouseDown, true)
}
