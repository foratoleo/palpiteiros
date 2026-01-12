/**
 * Glassmorphism Presets
 *
 * Predefined glass variants for consistent glassmorphism effects.
 * Provides optimized configurations with fallbacks for browsers without backdrop-filter support.
 *
 * Features:
 * - 4 preset intensities (subtle, medium, heavy, colored)
 * - Cross-browser compatibility with fallbacks
 * - Performance optimized (minimal backdrop-filter usage)
 * - Dark mode support
 *
 * @example
 * ```tsx
 * import { glassPresets, applyGlassPreset } from './glass-presets'
 *
 * // Apply preset
 * <div style={applyGlassPreset('medium')} />
 *
 * // Get individual values
 * const { blur, opacity, border } = glassPresets.medium
 * ```
 */

// ============================================================================
// TYPES
// ============================================================================

/**
 * Glass preset intensity level
 */
export type GlassPreset = "subtle" | "medium" | "heavy" | "colored"

/**
 * Glass effect configuration
 */
export interface GlassConfig {
  /** Backdrop blur amount */
  blur: string
  /** Background opacity (light mode) */
  bgOpacityLight: string
  /** Background opacity (dark mode) */
  bgOpacityDark: string
  /** Border color/opacity */
  border: string
  /** Shadow level */
  shadow: string
  /** Optional tint color (for colored preset) */
  tint?: string
}

/**
 * CSS properties for glass effect
 */
export interface GlassStyles {
  backdropFilter: string
  WebkitBackdropFilter: string
  backgroundColor: string
  border: string
  boxShadow: string
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Glassmorphism preset configurations
 *
 * Performance notes:
 * - Subtle: blur(8px) - Best performance, use for large areas
 * - Medium: blur(16px) - Balanced performance/quality
 * - Heavy: blur(24px) - High quality, use sparingly
 * - Colored: blur(16px) + tint - Use for accents
 */
export const glassPresets: Record<GlassPreset, GlassConfig> = {
  /**
   * Subtle glass - Best performance, suitable for large surfaces
   */
  subtle: {
    blur: "blur(8px)",
    bgOpacityLight: "rgba(255, 255, 255, 0.7)",
    bgOpacityDark: "rgba(0, 0, 0, 0.5)",
    border: "rgba(255, 255, 255, 0.15)",
    shadow: "0 1px 3px 0 rgb(0 0 0 / 0.05)",
  },

  /**
   * Medium glass - Balanced, suitable for cards and dialogs
   */
  medium: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(255, 255, 255, 0.8)",
    bgOpacityDark: "rgba(0, 0, 0, 0.6)",
    border: "rgba(255, 255, 255, 0.18)",
    shadow: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  },

  /**
   * Heavy glass - High quality, use sparingly for emphasis
   */
  heavy: {
    blur: "blur(24px)",
    bgOpacityLight: "rgba(255, 255, 255, 0.9)",
    bgOpacityDark: "rgba(0, 0, 0, 0.7)",
    border: "rgba(255, 255, 255, 0.2)",
    shadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  },

  /**
   * Colored glass - With subtle blue tint for accents
   */
  colored: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(59, 130, 246, 0.15)",
    bgOpacityDark: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.3)",
    shadow: "0 4px 6px -1px rgb(59 130 246 / 0.1)",
    tint: "hsl(221, 83%, 53%)",
  },
}

/**
 * Colored glass variants with different hues
 */
export const coloredGlassVariants: Record<string, GlassConfig> = {
  blue: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(59, 130, 246, 0.15)",
    bgOpacityDark: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.3)",
    shadow: "0 4px 6px -1px rgb(59 130 246 / 0.1)",
    tint: "hsl(221, 83%, 53%)",
  },
  purple: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(139, 92, 246, 0.15)",
    bgOpacityDark: "rgba(139, 92, 246, 0.1)",
    border: "rgba(139, 92, 246, 0.3)",
    shadow: "0 4px 6px -1px rgb(139 92 246 / 0.1)",
    tint: "hsl(263, 70%, 50%)",
  },
  green: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(34, 197, 94, 0.15)",
    bgOpacityDark: "rgba(34, 197, 94, 0.1)",
    border: "rgba(34, 197, 94, 0.3)",
    shadow: "0 4px 6px -1px rgb(34 197 94 / 0.1)",
    tint: "hsl(142, 76%, 36%)",
  },
  amber: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(251, 191, 36, 0.15)",
    bgOpacityDark: "rgba(251, 191, 36, 0.1)",
    border: "rgba(251, 191, 36, 0.3)",
    shadow: "0 4px 6px -1px rgb(251 191 36 / 0.1)",
    tint: "hsl(38, 92%, 50%)",
  },
  rose: {
    blur: "blur(16px)",
    bgOpacityLight: "rgba(244, 63, 94, 0.15)",
    bgOpacityDark: "rgba(244, 63, 94, 0.1)",
    border: "rgba(244, 63, 94, 0.3)",
    shadow: "0 4px 6px -1px rgb(244 63 94 / 0.1)",
    tint: "hsl(0, 84%, 60%)",
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if backdrop-filter is supported
 */
export function supportsBackdropFilter(): boolean {
  if (typeof window === "undefined") return true // Assume SSR support

  // Check cached result
  if ("__backdropFilterSupport" in window) {
    return (window as unknown as { __backdropFilterSupport: boolean }).__backdropFilterSupport
  }

  const el = document.createElement("div")
  const isSupported =
    el.style.backdropFilter !== undefined ||
    (el.style as any).webkitBackdropFilter !== undefined

  // Cache result
  ;(window as unknown as { __backdropFilterSupport: boolean }).__backdropFilterSupport = isSupported

  return isSupported
}

/**
 * Apply glass preset as CSS-in-JS styles
 */
export function applyGlassPreset(
  preset: GlassPreset | keyof typeof coloredGlassVariants,
  options: {
    darkMode?: boolean
    fallback?: boolean
  } = {}
): React.CSSProperties {
  const { darkMode = false, fallback = false } = options

  const config =
    glassPresets[preset as GlassPreset] ||
    coloredGlassVariants[preset as keyof typeof coloredGlassVariants] ||
    glassPresets.medium

  const bgColor = darkMode ? config.bgOpacityDark : config.bgOpacityLight

  // For browsers without backdrop-filter support, use solid fallback
  if (fallback || !supportsBackdropFilter()) {
    return {
      backgroundColor: bgColor,
      border: `1px solid ${config.border}`,
      boxShadow: config.shadow,
    }
  }

  return {
    backdropFilter: config.blur,
    WebkitBackdropFilter: config.blur,
    backgroundColor: bgColor,
    border: `1px solid ${config.border}`,
    boxShadow: config.shadow,
  }
}

/**
 * Get glass CSS classes for Tailwind
 */
export function getGlassClasses(
  preset: GlassPreset = "medium",
  darkMode = false
): string {
  const config = glassPresets[preset]

  const blurMap: Record<string, string> = {
    "blur(8px)": "backdrop-blur-sm",
    "blur(16px)": "backdrop-blur-md",
    "blur(24px)": "backdrop-blur-xl",
    "blur(40px)": "backdrop-blur-2xl",
  }

  const blurClass = blurMap[config.blur] || "backdrop-blur-md"

  const opacityMap: Record<string, { light: string; dark: string }> = {
    subtle: { light: "bg-white/70", dark: "bg-black/50" },
    medium: { light: "bg-white/80", dark: "bg-black/60" },
    heavy: { light: "bg-white/90", dark: "bg-black/70" },
    colored: { light: "bg-blue-500/15", dark: "bg-blue-500/10" },
  }

  const opacity = opacityMap[preset]

  return [
    blurClass,
    darkMode ? opacity.dark : opacity.light,
    "border border-white/10 dark:border-white/5",
    "shadow-lg",
  ].join(" ")
}

/**
 * Get glass CSS-in-JS with inline styles
 */
export function getGlassStyles(
  preset: GlassPreset = "medium",
  darkMode = false
): GlassStyles {
  const config = glassPresets[preset]
  const bgColor = darkMode ? config.bgOpacityDark : config.bgOpacityLight

  return {
    backdropFilter: config.blur,
    WebkitBackdropFilter: config.blur,
    backgroundColor: bgColor,
    border: `1px solid ${config.border}`,
    boxShadow: config.shadow,
  }
}

/**
 * Generate glass effect CSS string
 */
export function glassCSS(
  preset: GlassPreset = "medium",
  selector = "&"
): string {
  const config = glassPresets[preset]
  const styles = getGlassStyles(preset, false)

  return `
${selector} {
  backdrop-filter: ${config.blur};
  -webkit-backdrop-filter: ${config.blur};
  background-color: ${styles.backgroundColor};
  border: ${styles.border};
  box-shadow: ${styles.boxShadow};
}

@media (prefers-color-scheme: dark) {
  ${selector} {
    background-color: ${config.bgOpacityDark};
    border: 1px solid ${config.border};
  }
}

@supports not (backdrop-filter: blur(1px)) {
  ${selector} {
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }
}
  `.trim()
}

/**
 * Glass effect hook for React components
 */
export interface UseGlassOptions {
  preset?: GlassPreset
  darkMode?: boolean
  fallback?: boolean
}

export function useGlass(options: UseGlassOptions = {}): React.CSSProperties {
  const { preset = "medium", darkMode = false, fallback = false } = options
  return applyGlassPreset(preset, { darkMode, fallback })
}

// ============================================================================
// TAILWIND UTILITIES
// ============================================================================

/**
 * Tailwind-compatible glass utility classes
 */
export const glassUtilities = {
  // Blur levels
  "glass-blur-xs": "backdrop-blur-xs",
  "glass-blur-sm": "backdrop-blur-sm",
  "glass-blur-md": "backdrop-blur-md",
  "glass-blur-lg": "backdrop-blur-lg",
  "glass-blur-xl": "backdrop-blur-xl",
  "glass-blur-2xl": "backdrop-blur-2xl",
  "glass-blur-3xl": "backdrop-blur-3xl",

  // Opacity levels (light mode)
  "glass-light-low": "bg-white/50",
  "glass-light-medium": "bg-white/70",
  "glass-light-high": "bg-white/85",

  // Opacity levels (dark mode)
  "glass-dark-low": "dark:bg-black/30",
  "glass-dark-medium": "dark:bg-black/50",
  "glass-dark-high": "dark:bg-black/70",

  // Border
  "glass-border": "border border-white/10 dark:border-white/5",
  "glass-border-strong": "border border-white/20 dark:border-white/10",

  // Shadow
  "glass-shadow": "shadow-lg shadow-black/5",
  "glass-shadow-strong": "shadow-xl shadow-black/10",
} as const

export default glassPresets
