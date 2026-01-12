/**
 * Hover State Utilities
 *
 * Apple-inspired hover state utilities for consistent micro-interactions.
 * Uses CSS transforms for GPU acceleration and smooth 200ms transitions.
 *
 * @example
 * ```tsx
 * import { hoverStates, HoverStateConfig } from "./hover-states"
 *
 * const config: HoverStateConfig = {
 *   scale: 1.05,
 *   brightness: 1.1,
 *   shadow: "lg",
 * }
 *
 * <div className={hoverStates(config)}>
 *   Content
 * </div>
 * ```
 */

import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Shadow elevation levels matching Apple's design system
 */
export type ShadowLevel =
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "inner"
  | "glass"
  | "neon"

/**
 * Brightness adjustment level
 */
export type BrightnessLevel = 0 | 0.05 | 0.1 | 0.15 | 0.2 | 0.25 | 0.3

/**
 * Scale transformation preset
 */
export type ScalePreset =
  | "none"
  | "subtle" // 1.02
  | "default" // 1.05
  | "medium" // 1.08
  | "strong" // 1.1
  | "extreme" // 1.15

/**
 * Hover state configuration
 */
export interface HoverStateConfig {
  /** Scale transform on hover */
  scale?: ScalePreset | number
  /** Brightness filter on hover */
  brightness?: BrightnessLevel | number
  /** Shadow elevation on hover */
  shadow?: ShadowLevel
  /** Y-axis translate on hover (for lift effect) */
  lift?: number
  /** Custom duration in ms (default: 200) */
  duration?: number
  /** Custom easing function */
  easing?: string
  /** Include active state styles */
  includeActive?: boolean
}

/**
 * Complete hover state styles
 */
export interface HoverStateStyles {
  /** Base classes always applied */
  base: ClassValue
  /** Hover classes */
  hover: ClassValue
  /** Active classes */
  active: ClassValue
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default configuration matching Apple's micro-interaction standards
 */
export const DEFAULT_HOVER_CONFIG: Required<HoverStateConfig> = {
  scale: "default",
  brightness: 0,
  shadow: "lg",
  lift: 0,
  duration: 200,
  easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  includeActive: true,
}

/**
 * Scale preset values
 */
export const SCALE_PRESETS: Record<ScalePreset, number> = {
  none: 1,
  subtle: 1.02,
  default: 1.05,
  medium: 1.08,
  strong: 1.1,
  extreme: 1.15,
}

/**
 * Shadow preset classes
 */
export const SHADOW_PRESETS: Record<ShadowLevel, string> = {
  none: "shadow-none",
  sm: "shadow-sm",
  md: "shadow-md",
  lg: "shadow-lg",
  xl: "shadow-xl",
  "2xl": "shadow-2xl",
  inner: "shadow-inner",
  glass: "shadow-lg shadow-black/5 dark:shadow-black/20",
  neon: "shadow-lg shadow-current/20",
}

/**
 * Hover state duration presets
 */
export const HOVER_DURATIONS = {
  instant: "100ms",
  fast: "150ms",
  default: "200ms",
  medium: "300ms",
  slow: "400ms",
} as const

/**
 * Hover state easing presets
 */
export const HOVER_EASINGS = {
  sharp: "cubic-bezier(0, 0, 0.2, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  easeOut: "cubic-bezier(0, 0, 0.2, 1)",
  easeIn: "cubic-bezier(0.4, 0, 1, 1)",
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get scale value from preset or number
 */
function getScaleValue(scale: ScalePreset | number): number {
  return typeof scale === "number" ? scale : SCALE_PRESETS[scale]
}

/**
 * Get brightness filter value
 */
function getBrightnessFilter(brightness: BrightnessLevel | number): string {
  return `brightness(${1 + brightness})`
}

/**
 * Build transition string from config
 */
function buildTransition(config: HoverStateConfig): string {
  const duration = config.duration ?? DEFAULT_HOVER_CONFIG.duration
  const easing = config.easing ?? DEFAULT_HOVER_CONFIG.easing

  const transitions: string[] = [
    `transform ${duration}ms ${easing}`,
    `box-shadow ${duration}ms ${easing}`,
    `filter ${duration}ms ${easing}`,
  ]

  return transitions.join(", ")
}

/**
 * Generate hover state class strings
 */
export function hoverStates(config: HoverStateConfig = {}): string {
  const styles = getHoverStateStyles(config)
  return twMerge(clsx(styles.base, styles.hover, styles.active))
}

/**
 * Get individual hover state styles
 */
export function getHoverStateStyles(config: HoverStateConfig = {}): HoverStateStyles {
  const finalConfig = { ...DEFAULT_HOVER_CONFIG, ...config }

  const scale = getScaleValue(finalConfig.scale)
  const brightness = getBrightnessFilter(finalConfig.brightness)
  const shadow = SHADOW_PRESETS[finalConfig.shadow]
  const lift = finalConfig.lift
  const transition = buildTransition(finalConfig)

  // Build base classes - use standard Tailwind classes for compatibility
  const baseClasses = [
    "transition-all",
    "duration-200", // Fixed duration, can be overridden via inline styles
    "ease-out", // Fixed easing, can be overridden via inline styles
    "will-change-transform",
    "will-change-[box-shadow]",
  ]

  // Build hover classes - use standard Tailwind classes
  const hoverClasses: string[] = []

  if (scale !== 1) {
    // Use standard scale classes instead of dynamic values
    if (scale >= 1.1) hoverClasses.push("hover:scale-110")
    else if (scale >= 1.05) hoverClasses.push("hover:scale-105")
    else hoverClasses.push("hover:scale-[1.02]")
  }

  if (finalConfig.brightness !== 0) {
    // Use brightness filter via inline styles in CSS-in-JS instead
    hoverClasses.push("hover:brightness-110")
  }

  if (shadow) {
    // Shadow classes are already strings
    hoverClasses.push(shadow)
  }

  if (lift !== 0) {
    // Use standard translate classes instead of dynamic values
    if (lift >= 4) hoverClasses.push("hover:-translate-y-1")
    else hoverClasses.push("hover:-translate-y-px")
  }

  // Build active classes
  const activeClasses: string[] = []

  if (finalConfig.includeActive) {
    // Always scale down slightly on active for tactile feedback
    activeClasses.push("active:scale-95")
  }

  return {
    base: clsx(baseClasses),
    hover: clsx(hoverClasses),
    active: clsx(activeClasses),
  }
}

/**
 * Preset hover configurations for common use cases
 */
export const hoverPresets = {
  /**
   * Subtle hover - minimal feedback
   */
  subtle: {
    scale: "subtle" as const,
    brightness: 0.05,
    shadow: "md" as const,
    lift: 0,
  },

  /**
   * Default hover - standard button feedback
   */
  default: {
    scale: "default" as const,
    brightness: 0,
    shadow: "lg" as const,
    lift: 0,
  },

  /**
   * Lift hover - card elevation effect
   */
  lift: {
    scale: "subtle" as const,
    brightness: 0.05,
    shadow: "lg" as const,
    lift: 4,
  },

  /**
   * Glow hover - enhanced brightness
   */
  glow: {
    scale: "subtle" as const,
    brightness: 0.15,
    shadow: "xl" as const,
    lift: 0,
  },

  /**
   * Pop hover - strong scale effect
   */
  pop: {
    scale: "strong" as const,
    brightness: 0.1,
    shadow: "xl" as const,
    lift: 2,
  },

  /**
   * Icon hover - for small icon buttons
   */
  icon: {
    scale: "default" as const,
    brightness: 0.1,
    shadow: "none" as const,
    lift: 0,
  },

  /**
   * Glass hover - for glassmorphism elements
   */
  glass: {
    scale: "subtle" as const,
    brightness: 0.05,
    shadow: "glass" as const,
    lift: 2,
  },

  /**
   * Neon hover - glowing effect
   */
  neon: {
    scale: "default" as const,
    brightness: 0.2,
    shadow: "neon" as const,
    lift: 0,
  },
} as const

/**
 * Apply preset hover configuration
 */
export function applyHoverPreset(
  preset: keyof typeof hoverPresets,
  customConfig?: Partial<HoverStateConfig>
): string {
  const config = { ...hoverPresets[preset], ...customConfig }
  return hoverStates(config)
}

// ============================================================================
// REHOOKS
// ============================================================================

/**
 * Generate CSS custom properties for hover states
 * Useful for dynamic hover states via inline styles
 */
export function getHoverVars(config: HoverStateConfig = {}): Record<string, string> {
  const finalConfig = { ...DEFAULT_HOVER_CONFIG, ...config }
  const scale = getScaleValue(finalConfig.scale)

  return {
    "--hover-scale": scale.toString(),
    "--hover-brightness": (1 + finalConfig.brightness).toString(),
    "--hover-lift": `${finalConfig.lift}px`,
    "--hover-duration": `${finalConfig.duration}ms`,
  } as Record<string, string>
}

/**
 * Generate complete CSS-in-JS hover styles
 */
export function getHoverStyles(config: HoverStateConfig = {}): {
  container: React.CSSProperties
  hover: React.CSSProperties
  active: React.CSSProperties
} {
  const finalConfig = { ...DEFAULT_HOVER_CONFIG, ...config }
  const scale = getScaleValue(finalConfig.scale)
  const brightness = 1 + finalConfig.brightness

  return {
    container: {
      transition: `transform ${finalConfig.duration}ms ${finalConfig.easing}, box-shadow ${finalConfig.duration}ms ${finalConfig.easing}, filter ${finalConfig.duration}ms ${finalConfig.easing}`,
      willChange: "transform, box-shadow",
    },
    hover: {
      transform: `scale(${scale}) translateY(-${finalConfig.lift}px)`,
      filter: `brightness(${brightness})`,
    },
    active: {
      transform: `scale(${Math.max(0.95, scale - 0.05)})`,
    },
  }
}
