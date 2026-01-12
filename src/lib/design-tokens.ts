/**
 * Design Tokens System
 *
 * Apple + Material Design fusion design tokens.
 * Centralized design system for consistent styling across the application.
 *
 * Design Philosophy:
 * - Apple: Subtle animations, SF-inspired typography, glassmorphism
 * - Material: Elevation system, semantic colors, structured spacing
 *
 * @example
 * ```tsx
 * import { tokens } from "@/lib/design-tokens"
 *
 * // Use in styled components
 * const style = { color: tokens.colors.primary.base }
 *
 * // Use with Tailwind
 * // Extend tailwind.config.ts with these tokens
 * ```
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

/**
 * Color Tokens
 *
 * Semantic color system with light/dark mode support.
 * All colors use HSL format for easy manipulation with CSS.
 */
export const colors = {
  // Primary colors (brand)
  primary: {
    base: "hsl(221, 83%, 53%)", // Blue 500
    light: "hsl(221, 83%, 63%)", // Blue 400
    lighter: "hsl(221, 83%, 73%)", // Blue 300
    dark: "hsl(221, 83%, 43%)", // Blue 600
    darker: "hsl(221, 83%, 33%)", // Blue 700
    contrast: "hsl(0, 0%, 100%)",
  },

  // Secondary colors
  secondary: {
    base: "hsl(263, 70%, 50%)", // Purple 500
    light: "hsl(263, 70%, 60%)",
    lighter: "hsl(263, 70%, 70%)",
    dark: "hsl(263, 70%, 40%)",
    darker: "hsl(263, 70%, 30%)",
    contrast: "hsl(0, 0%, 100%)",
  },

  // Accent colors
  accent: {
    base: "hsl(174, 72%, 56%)", // Teal 500
    light: "hsl(174, 72%, 66%)",
    lighter: "hsl(174, 72%, 76%)",
    dark: "hsl(174, 72%, 46%)",
    darker: "hsl(174, 72%, 36%)",
    contrast: "hsl(0, 0%, 100%)",
  },

  // Success colors
  success: {
    base: "hsl(142, 76%, 36%)", // Green 600
    light: "hsl(142, 76%, 46%)",
    lighter: "hsl(142, 76%, 56%)",
    dark: "hsl(142, 76%, 26%)",
    darker: "hsl(142, 76%, 16%)",
    contrast: "hsl(0, 0%, 100%)",
  },

  // Warning colors
  warning: {
    base: "hsl(38, 92%, 50%)", // Amber 500
    light: "hsl(38, 92%, 60%)",
    lighter: "hsl(38, 92%, 70%)",
    dark: "hsl(38, 92%, 40%)",
    darker: "hsl(38, 92%, 30%)",
    contrast: "hsl(0, 0%, 100%)",
  },

  // Danger colors
  danger: {
    base: "hsl(0, 84%, 60%)", // Red 500
    light: "hsl(0, 84%, 70%)",
    lighter: "hsl(0, 84%, 80%)",
    dark: "hsl(0, 84%, 50%)",
    darker: "hsl(0, 84%, 40%)",
    contrast: "hsl(0, 0%, 100%)",
  },

  // Info colors
  info: {
    base: "hsl(199, 89%, 48%)", // Sky 500
    light: "hsl(199, 89%, 58%)",
    lighter: "hsl(199, 89%, 68%)",
    dark: "hsl(199, 89%, 38%)",
    darker: "hsl(199, 89%, 28%)",
    contrast: "hsl(0, 0%, 100%)",
  },

  // Neutral colors (light mode)
  neutral: {
    white: "hsl(0, 0%, 100%)",
    black: "hsl(0, 0%, 0%)",
    50: "hsl(0, 0%, 97%)", // Gray 50
    100: "hsl(0, 0%, 94%)", // Gray 100
    200: "hsl(0, 0%, 86%)", // Gray 200
    300: "hsl(0, 0%, 78%)", // Gray 300
    400: "hsl(0, 0%, 64%)", // Gray 400
    500: "hsl(0, 0%, 50%)", // Gray 500
    600: "hsl(0, 0%, 38%)", // Gray 600
    700: "hsl(0, 0%, 26%)", // Gray 700
    800: "hsl(0, 0%, 18%)", // Gray 800
    900: "hsl(0, 0%, 10%)", // Gray 900
    950: "hsl(0, 0%, 5%)", // Gray 950
  },

  // Semantic tokens
  text: {
    primary: "hsl(0, 0%, 4%)", // Foreground
    secondary: "hsl(0, 0%, 45%)", // Muted foreground
    tertiary: "hsl(0, 0%, 64%)", // Placeholder
    inverse: "hsl(0, 0%, 98%)", // On dark
  },

  background: {
    default: "hsl(0, 0%, 100%)", // Background
    elevated: "hsl(0, 0%, 100%)", // Card
    overlay: "hsl(0, 0%, 0% / 0.5)", // Modal backdrop
    glass: "hsl(0, 0%, 100% / 0.7)", // Glassmorphism
  },

  border: {
    default: "hsl(0, 0%, 90%)", // Border
    subtle: "hsl(0, 0%, 94%)", // Input
    strong: "hsl(0, 0%, 78%)", // Divider
  },
} as const

/**
 * Dark mode color overrides
 */
export const darkColors = {
  // Semantic tokens
  text: {
    primary: "hsl(0, 0%, 98%)",
    secondary: "hsl(0, 0%, 64%)",
    tertiary: "hsl(0, 0%, 45%)",
    inverse: "hsl(0, 0%, 4%)",
  },

  background: {
    default: "hsl(0, 0%, 4%)",
    elevated: "hsl(0, 0%, 4%)",
    overlay: "hsl(0, 0%, 0% / 0.7)",
    glass: "hsl(0, 0%, 10% / 0.7)",
  },

  border: {
    default: "hsl(0, 0%, 15%)",
    subtle: "hsl(0, 0%, 10%)",
    strong: "hsl(0, 0%, 25%)",
  },
} as const

// ============================================================================
// TYPOGRAPHY SCALE
// ============================================================================

/**
 * Font Family Tokens
 *
 * Apple-inspired typography with SF Pro fallback.
 */
export const fontFamily = {
  sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif",
  mono: "'SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Courier New', monospace",
  display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', 'Roboto', sans-serif",
} as const

/**
 * Font Size Tokens
 *
 * Type scale based on major third (1.25).
 * Responsive sizing with clamp for fluid typography.
 */
export const fontSize = {
  xs: "0.75rem", // 12px
  sm: "0.875rem", // 14px
  base: "1rem", // 16px
  lg: "1.125rem", // 18px
  xl: "1.25rem", // 20px
  "2xl": "1.5rem", // 24px
  "3xl": "1.875rem", // 30px
  "4xl": "2.25rem", // 36px
  "5xl": "3rem", // 48px
  "6xl": "3.75rem", // 60px
  "7xl": "4.5rem", // 72px
  "8xl": "6rem", // 96px
  "9xl": "8rem", // 128px
} as const

/**
 * Fluid font size utilities (using clamp)
 */
export const fluidFontSize = {
  sm: "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
  base: "clamp(1rem, 0.9rem + 0.5vw, 1.125rem)",
  lg: "clamp(1.125rem, 1rem + 0.625vw, 1.5rem)",
  xl: "clamp(1.25rem, 1.1rem + 0.75vw, 2rem)",
  "2xl": "clamp(1.5rem, 1.25rem + 1.25vw, 3rem)",
  "3xl": "clamp(1.875rem, 1.5rem + 1.875vw, 4.5rem)",
} as const

/**
 * Font Weight Tokens
 *
 * Apple-style weight scale.
 */
export const fontWeight = {
  hairline: "100",
  thin: "200",
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  extrabold: "800",
  black: "900",
} as const

/**
 * Line Height Tokens
 *
 * Vertical rhythm based on 1.5 (Golden Ratio approximation).
 */
export const lineHeight = {
  none: "1",
  tight: "1.25",
  snug: "1.375",
  normal: "1.5",
  relaxed: "1.625",
  loose: "2",
} as const

/**
 * Letter Spacing Tokens
 *
 * Tracking for optimal readability.
 */
export const letterSpacing = {
  tighter: "-0.05em",
  tight: "-0.025em",
  normal: "0",
  wide: "0.025em",
  wider: "0.05em",
  widest: "0.1em",
} as const

// ============================================================================
// SPACING SYSTEM
// ============================================================================

/**
 * Spacing Scale
 *
 * 4px base unit for consistent spacing.
 * Powers of 2 for harmonious proportions.
 */
export const spacing = {
  0: "0",
  px: "1px", // 1px
  0.5: "0.125rem", // 2px
  1: "0.25rem", // 4px
  2: "0.5rem", // 8px
  3: "0.75rem", // 12px
  4: "1rem", // 16px
  5: "1.25rem", // 20px
  6: "1.5rem", // 24px
  8: "2rem", // 32px
  10: "2.5rem", // 40px
  12: "3rem", // 48px
  16: "4rem", // 64px
  20: "5rem", // 80px
  24: "6rem", // 96px
  32: "8rem", // 128px
  40: "10rem", // 160px
  48: "12rem", // 192px
  56: "14rem", // 224px
  64: "16rem", // 256px
  72: "18rem", // 288px
  80: "20rem", // 320px
  96: "24rem", // 384px
} as const

// ============================================================================
// BORDER RADIUS
// ============================================================================

/**
 * Border Radius Tokens
 *
 * Apple-inspired rounded corners.
 */
export const borderRadius = {
  none: "0",
  sm: "0.25rem", // 4px - Small
  base: "0.5rem", // 8px - Default
  md: "0.625rem", // 10px - Medium
  lg: "0.75rem", // 12px - Large
  xl: "1rem", // 16px - Extra large
  "2xl": "1.5rem", // 24px
  "3xl": "2rem", // 32px
  full: "9999px", // Pill/circle
} as const

// ============================================================================
// SHADOWS / ELEVATION
// ============================================================================

/**
 * Elevation Tokens
 *
 * Material Design-inspired elevation with colored shadows.
 * Colored shadows for depth perception in light mode.
 */
export const elevation = {
  0: "none",
  1: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  2: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  3: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  4: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  5: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  6: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  7: "0 35px 60px -15px rgb(0 0 0 / 0.3)",
  8: "0 50px 80px -20px rgb(0 0 0 / 0.35)",
} as const

/**
 * Colored shadow tokens (for light mode)
 */
export const coloredShadows = {
  primary: {
    sm: "0 1px 2px 0 hsl(221, 83%, 53% / 0.1)",
    md: "0 4px 6px -1px hsl(221, 83%, 53% / 0.15)",
    lg: "0 10px 15px -3px hsl(221, 83%, 53% / 0.2)",
    xl: "0 20px 25px -5px hsl(221, 83%, 53% / 0.25)",
  },
  success: {
    sm: "0 1px 2px 0 hsl(142, 76%, 36% / 0.1)",
    md: "0 4px 6px -1px hsl(142, 76%, 36% / 0.15)",
    lg: "0 10px 15px -3px hsl(142, 76%, 36% / 0.2)",
    xl: "0 20px 25px -5px hsl(142, 76%, 36% / 0.25)",
  },
  warning: {
    sm: "0 1px 2px 0 hsl(38, 92%, 50% / 0.1)",
    md: "0 4px 6px -1px hsl(38, 92%, 50% / 0.15)",
    lg: "0 10px 15px -3px hsl(38, 92%, 50% / 0.2)",
    xl: "0 20px 25px -5px hsl(38, 92%, 50% / 0.25)",
  },
  danger: {
    sm: "0 1px 2px 0 hsl(0, 84%, 60% / 0.1)",
    md: "0 4px 6px -1px hsl(0, 84%, 60% / 0.15)",
    lg: "0 10px 15px -3px hsl(0, 84%, 60% / 0.2)",
    xl: "0 20px 25px -5px hsl(0, 84%, 60% / 0.25)",
  },
} as const

/**
 * Inner shadow tokens (for pressed states)
 */
export const innerShadows = {
  sm: "inset 0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "inset 0 2px 4px 0 rgb(0 0 0 / 0.1)",
  lg: "inset 0 4px 8px 0 rgb(0 0 0 / 0.15)",
} as const

// ============================================================================
// ANIMATION TOKENS
// ============================================================================

/**
 * Animation Duration Tokens
 *
 * Apple-inspired timing (subtle, never rushed).
 */
export const duration = {
  instant: "100ms", // 0.1s
  fast: "150ms", // 0.15s
  normal: "200ms", // 0.2s
  moderate: "300ms", // 0.3s
  slow: "400ms", // 0.4s
  slower: "500ms", // 0.5s
  slowest: "700ms", // 0.7s
} as const

/**
 * Easing Function Tokens
 *
 * Cubic-bezier curves for natural motion.
 * Apple uses custom curves for smooth acceleration/deceleration.
 */
export const easing = {
  // Linear
  linear: "cubic-bezier(0, 0, 1, 1)",

  // Standard ease
  ease: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  easeIn: "cubic-bezier(0.42, 0, 1, 1)",
  easeOut: "cubic-bezier(0, 0, 0.58, 1)",
  easeInOut: "cubic-bezier(0.42, 0, 0.58, 1)",

  // Apple-inspired curves
  apple: "cubic-bezier(0.25, 0.1, 0.25, 1)", // Default iOS
  appleIn: "cubic-bezier(0.42, 0, 1, 1)",
  appleOut: "cubic-bezier(0, 0, 0.58, 1)",

  // Spring-like curves (for Framer Motion)
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  springSoft: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  springBouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",

  // Material Design curves
  material: "cubic-bezier(0.4, 0, 0.2, 1)",
  materialDecelerate: "cubic-bezier(0, 0, 0.2, 1)",
  materialAccelerate: "cubic-bezier(0.4, 0, 1, 1)",

  // Custom curves
  sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
  smooth: "cubic-bezier(0.4, 0, 0.2, 1)",
  bounce: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
} as const

/**
 * Delay Tokens
 *
 * Stagger delays for sequential animations.
 */
export const delay = {
  none: "0ms",
  instant: "50ms",
  fast: "100ms",
  normal: "200ms",
  slow: "300ms",
  slower: "500ms",
} as const

// ============================================================================
// Z-INDEX SCALE
// ============================================================================

/**
 * Z-Index Tokens
 *
 * Logical layering for consistent stacking contexts.
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  overlay: 1040,
  "modal-backdrop": 1050,
  modal: 1060,
  popover: 1070,
  tooltip: 1080,
  toast: 1090,
} as const

// ============================================================================
// GLASSMORPHISM
// ============================================================================

/**
 * Glassmorphism Tokens
 *
 * Blur and opacity for glass effect.
 */
export const glass = {
  blur: {
    xs: "blur(4px)",
    sm: "blur(8px)",
    md: "blur(12px)",
    lg: "blur(16px)",
    xl: "blur(24px)",
    "2xl": "blur(40px)",
  },
  opacity: {
    light: {
      low: "0.7",
      medium: "0.85",
      high: "0.95",
    },
    dark: {
      low: "0.5",
      medium: "0.7",
      high: "0.85",
    },
  },
  border: {
    light: "hsl(0, 0%, 100% / 0.2)",
    dark: "hsl(0, 0%, 100% / 0.1)",
  },
} as const

// ============================================================================
// BREAKPOINTS
// ============================================================================

/**
 * Breakpoint Tokens
 *
 * Responsive design breakpoints.
 */
export const breakpoints = {
  xs: "320px",
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large desktop
} as const

// ============================================================================
// LAYOUT
// ============================================================================

/**
 * Container Tokens
 *
 * Max-width containers for content.
 */
export const container = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
  full: "100%",
} as const

/**
 * Grid Tokens
 *
 * Grid layout dimensions.
 */
export const grid = {
  columns: {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    6: 6,
    12: 12,
  },
  gap: {
    xs: spacing[2],
    sm: spacing[3],
    md: spacing[4],
    lg: spacing[6],
    xl: spacing[8],
  },
} as const

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Complete design tokens object
 */
export const tokens = {
  colors,
  darkColors,
  fontFamily,
  fontSize,
  fluidFontSize,
  fontWeight,
  lineHeight,
  letterSpacing,
  spacing,
  borderRadius,
  elevation,
  coloredShadows,
  innerShadows,
  duration,
  easing,
  delay,
  zIndex,
  glass,
  breakpoints,
  container,
  grid,
} as const

/**
 * Design tokens type
 */
export type DesignTokens = typeof tokens

/**
 * Default export
 */
export default tokens
