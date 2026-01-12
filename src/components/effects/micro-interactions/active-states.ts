/**
 * Active State Utilities
 *
 * Apple-inspired active (press) state utilities for tactile feedback.
 * Uses scale and brightness changes to simulate physical button press.
 *
 * Features:
 * - Consistent 200ms duration
 * - Scale down effect for tactile feedback
 * - Brightness decrease for depth effect
 * - Spring animations for natural feel
 *
 * @example
 * ```tsx
 * import { activeStates, activePresets } from "./active-states"
 *
 * <button className={activeStates({ preset: "press" })}>
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
 * Active state scale preset
 */
export type ActiveScalePreset =
  | "none"
  | "subtle" // 0.98
  | "default" // 0.95
  | "strong" // 0.92
  | "extreme" // 0.85

/**
 * Active state brightness change
 */
export type ActiveBrightnessPreset =
  | "none"
  | "subtle" // -0.05
  | "default" // -0.1
  | "strong" // -0.15

/**
 * Active state configuration
 */
export interface ActiveConfig {
  /** Scale transform on active */
  scale?: ActiveScalePreset | number
  /** Brightness change on active */
  brightness?: ActiveBrightnessPreset | number
  /** Duration in ms (default: 100 for quick feedback) */
  duration?: number
  /** Easing function (spring for bounce) */
  easing?: string
  /** Include touch-only styles */
  touchOnly?: boolean
}

/**
 * Active state styles
 */
export interface ActiveStateStyles {
  /** Base classes */
  base: ClassValue
  /** Active classes */
  active: ClassValue
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default active configuration
 */
export const DEFAULT_ACTIVE_CONFIG: Required<ActiveConfig> = {
  scale: "default",
  brightness: "subtle",
  duration: 100,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  touchOnly: false,
}

/**
 * Scale preset values for active state
 */
export const ACTIVE_SCALE_PRESETS: Record<ActiveScalePreset, number> = {
  none: 1,
  subtle: 0.98,
  default: 0.95,
  strong: 0.92,
  extreme: 0.85,
}

/**
 * Brightness preset values for active state
 */
export const ACTIVE_BRIGHTNESS_PRESETS: Record<ActiveBrightnessPreset, number> = {
  none: 0,
  subtle: -0.05,
  default: -0.1,
  strong: -0.15,
}

/**
 * Active state duration presets
 */
export const ACTIVE_DURATIONS = {
  instant: "50ms",
  fast: "100ms",
  default: "150ms",
  slow: "200ms",
} as const

/**
 * Active state easing presets
 */
export const ACTIVE_EASINGS = {
  sharp: "cubic-bezier(0, 0, 0.2, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get scale value from preset or number
 */
function getScaleValue(scale: ActiveScalePreset | number): number {
  return typeof scale === "number" ? scale : ACTIVE_SCALE_PRESETS[scale]
}

/**
 * Get brightness filter value
 */
function getBrightnessFilter(brightness: ActiveBrightnessPreset | number): string {
  const value = typeof brightness === "number" ? brightness : ACTIVE_BRIGHTNESS_PRESETS[brightness]
  return `brightness(${1 + value})`
}

/**
 * Build transition string from config
 */
function buildTransition(config: ActiveConfig): string {
  const duration = config.duration ?? DEFAULT_ACTIVE_CONFIG.duration
  const easing = config.easing ?? DEFAULT_ACTIVE_CONFIG.easing

  const transitions: string[] = [
    `transform ${duration}ms ${easing}`,
    `filter ${duration}ms ${easing}`,
  ]

  return transitions.join(", ")
}

/**
 * Generate active state class string
 */
export function activeStates(config: ActiveConfig = {}): string {
  const styles = getActiveStateStyles(config)
  return twMerge(clsx(styles.base, styles.active))
}

/**
 * Get individual active state styles
 */
export function getActiveStateStyles(config: ActiveConfig = {}): ActiveStateStyles {
  const finalConfig = { ...DEFAULT_ACTIVE_CONFIG, ...config }

  const scale = getScaleValue(finalConfig.scale)
  const brightness = getBrightnessFilter(finalConfig.brightness)
  const transition = buildTransition(finalConfig)

  // Build base classes - use standard Tailwind classes for compatibility
  const baseClasses = [
    "transition-all",
    "duration-150", // Fixed duration for quick feedback
    "ease-out", // Fixed easing
    "will-change-transform",
  ]

  // Build active classes - use standard Tailwind classes
  const activeClasses: string[] = []

  if (scale !== 1) {
    // Use standard scale classes
    if (scale <= 0.92) activeClasses.push("active:scale-90")
    else if (scale <= 0.95) activeClasses.push("active:scale-95")
    else if (scale <= 0.98) activeClasses.push("active:scale-[0.98]")
    else activeClasses.push("active:scale-100")
  }

  if (finalConfig.brightness !== 0) {
    // Use brightness filter - simplified version
    activeClasses.push("active:brightness-95")
  }

  // Add selector variant
  if (finalConfig.touchOnly) {
    // Only apply to touch devices using active pseudo-class
    activeClasses.push("active:scale-95")
  }

  return {
    base: clsx(baseClasses),
    active: clsx(activeClasses),
  }
}

/**
 * Preset active configurations for common use cases
 */
export const activePresets = {
  /**
   * No active state
   */
  none: {
    scale: "none" as const,
    brightness: "none" as const,
  },

  /**
   * Subtle press - minimal feedback
   */
  subtle: {
    scale: "subtle" as const,
    brightness: "none" as const,
  },

  /**
   * Default press - standard button feedback
   */
  default: {
    scale: "default" as const,
    brightness: "subtle" as const,
  },

  /**
   * Strong press - more tactile feedback
   */
  strong: {
    scale: "strong" as const,
    brightness: "default" as const,
  },

  /**
   * Extreme press - maximum feedback
   */
  extreme: {
    scale: "extreme" as const,
    brightness: "strong" as const,
  },

  /**
   * Scale only - no brightness change
   */
  scaleOnly: {
    scale: "default" as const,
    brightness: "none" as const,
  },

  /**
   * Brightness only - no scale change
   */
  brightnessOnly: {
    scale: "none" as const,
    brightness: "default" as const,
  },

  /**
   * Bounce press - springy animation
   */
  bounce: {
    scale: "default" as const,
    brightness: "subtle" as const,
    easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  },

  /**
   * Quick press - very fast feedback
   */
  quick: {
    scale: "subtle" as const,
    brightness: "subtle" as const,
    duration: 50,
  },
} as const

/**
 * Apply preset active configuration
 */
export function applyActivePreset(
  preset: keyof typeof activePresets,
  customConfig?: Partial<ActiveConfig>
): string {
  const presetConfig = activePresets[preset]
  const config = { ...presetConfig, ...customConfig }
  return activeStates(config)
}

/**
 * Combine hover, focus, and active states
 * Convenience function for complete interaction states
 */
export function interactionStates(config: {
  hover?: import("./hover-states").HoverStateConfig
  focus?: import("./focus-states").FocusConfig
  active?: ActiveConfig
}): string {
  // Import dynamically to avoid circular dependency
  const { hoverStates } = require("./hover-states")
  const { focusStyles } = require("./focus-states")

  return twMerge(
    clsx(
      config.hover ? hoverStates(config.hover) : "",
      config.focus ? focusStyles(config.focus) : "",
      config.active ? activeStates(config.active) : ""
    )
  )
}

/**
 * Generate active styles as CSS variables
 */
export function getActiveVars(config: ActiveConfig = {}): Record<string, string> {
  const finalConfig = { ...DEFAULT_ACTIVE_CONFIG, ...config }
  const scale = getScaleValue(finalConfig.scale)
  const brightnessValue = typeof finalConfig.brightness === "number" ? finalConfig.brightness : ACTIVE_BRIGHTNESS_PRESETS[finalConfig.brightness]
  const brightness = 1 + brightnessValue

  return {
    "--active-scale": scale.toString(),
    "--active-brightness": brightness.toString(),
    "--active-duration": `${finalConfig.duration}ms`,
  } as Record<string, string>
}

/**
 * Generate CSS-in-JS active styles
 */
export function getActiveStyles(config: ActiveConfig = {}): {
  base: React.CSSProperties
  active: React.CSSProperties
} {
  const finalConfig = { ...DEFAULT_ACTIVE_CONFIG, ...config }
  const scale = getScaleValue(finalConfig.scale)
  const brightnessValue = typeof finalConfig.brightness === "number" ? finalConfig.brightness : ACTIVE_BRIGHTNESS_PRESETS[finalConfig.brightness]
  const brightness = 1 + brightnessValue

  return {
    base: {
      transition: `transform ${finalConfig.duration}ms ${finalConfig.easing}, filter ${finalConfig.duration}ms ${finalConfig.easing}`,
      willChange: "transform",
    },
    active: {
      transform: `scale(${scale})`,
      filter: `brightness(${brightness})`,
    },
  }
}
