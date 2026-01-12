/**
 * Enhanced Button Micro-Interactions
 *
 * Complete button interaction system combining hover, focus, and active states
 * with Apple-inspired micro-animations.
 *
 * Features:
 * - Combined hover/focus/active states
 * - Size-specific interactions
 * - Variant-specific interactions
 * - Loading state animations
 * - Icon button interactions
 *
 * @example
 * ```tsx
 * import { ButtonInteraction, buttonInteractionPresets } from "./button-variants"
 *
 * <ButtonInteraction variant="primary" size="md">
 *   Click me
 * </ButtonInteraction>
 *
 * // Or use preset
 * <button className={applyButtonPreset("primary")}>
 *   Click me
 * </button>
 * ```
 */

import * as React from "react"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { HoverStateConfig } from "./hover-states"
import type { FocusConfig } from "./focus-states"
import type { ActiveConfig } from "./active-states"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Button variant types
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "outline"
  | "glass"
  | "danger"
  | "success"

/**
 * Button size types
 */
export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl"

/**
 * Button interaction state
 */
export type ButtonState = "default" | "hover" | "focus" | "active" | "loading" | "disabled"

/**
 * Complete button interaction configuration
 */
export interface ButtonInteractionConfig {
  /** Button variant */
  variant?: ButtonVariant
  /** Button size */
  size?: ButtonSize
  /** Hover state config */
  hover?: HoverStateConfig
  /** Focus state config */
  focus?: FocusConfig
  /** Active state config */
  active?: ActiveConfig
  /** Include loading state */
  includeLoading?: boolean
  /** Include disabled state */
  includeDisabled?: boolean
}

/**
 * Button interaction styles
 */
export interface ButtonInteractionStyles {
  /** Base classes */
  base: ClassValue
  /** Hover classes */
  hover: ClassValue
  /** Focus classes */
  focus: ClassValue
  /** Active classes */
  active: ClassValue
  /** Loading classes */
  loading: ClassValue
  /** Disabled classes */
  disabled: ClassValue
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default button configuration
 */
export const DEFAULT_BUTTON_CONFIG: Required<Omit<ButtonInteractionConfig, "includeLoading" | "includeDisabled">> = {
  variant: "primary",
  size: "md",
  hover: {
    scale: "subtle",
    brightness: 0.05,
    shadow: "md",
    lift: 0,
    duration: 200,
  },
  focus: {
    preset: "ringOffset",
    ringWidth: 2,
    ringOffset: 2,
    animation: "expand",
    duration: 200,
    keyboardOnly: true,
  },
  active: {
    scale: "default",
    brightness: "subtle",
    duration: 100,
  },
}

/**
 * Button size dimensions
 */
export const BUTTON_SIZES: Record<ButtonSize, { padding: string; height: string; fontSize: string }> = {
  xs: {
    padding: "px-2 py-0.5",
    height: "h-6",
    fontSize: "text-xs",
  },
  sm: {
    padding: "px-3 py-1",
    height: "h-8",
    fontSize: "text-sm",
  },
  md: {
    padding: "px-4 py-2",
    height: "h-9",
    fontSize: "text-sm",
  },
  lg: {
    padding: "px-6 py-2.5",
    height: "h-10",
    fontSize: "text-base",
  },
  xl: {
    padding: "px-8 py-3",
    height: "h-12",
    fontSize: "text-lg",
  },
}

/**
 * Variant-specific interaction configurations
 */
export const VARIANT_INTERACTIONS: Record<ButtonVariant, {
  hover: HoverStateConfig
  focus: FocusConfig
  active: ActiveConfig
}> = {
  primary: {
    hover: {
      scale: "subtle",
      brightness: 0.1,
      shadow: "lg",
      lift: 0,
      duration: 200,
    },
    focus: {
      preset: "ringOffset",
      ringWidth: 2,
      ringOffset: 2,
      animation: "expand",
      duration: 200,
      keyboardOnly: true,
    },
    active: {
      scale: "default",
      brightness: 0.05,
      duration: 100,
    },
  },
  secondary: {
    hover: {
      scale: "subtle",
      brightness: 0.05,
      shadow: "md",
      lift: 0,
      duration: 200,
    },
    focus: {
      preset: "ring",
      ringWidth: 2,
      ringOffset: 0,
      animation: "expand",
      duration: 200,
      keyboardOnly: true,
    },
    active: {
      scale: "default",
      brightness: 0,
      duration: 100,
    },
  },
  ghost: {
    hover: {
      scale: "subtle",
      brightness: 0.05,
      shadow: "none",
      lift: 0,
      duration: 200,
    },
    focus: {
      preset: "solid",
      ringWidth: 1,
      ringOffset: 0,
      animation: "fade",
      duration: 150,
      keyboardOnly: true,
    },
    active: {
      scale: "subtle",
      brightness: 0,
      duration: 100,
    },
  },
  outline: {
    hover: {
      scale: "subtle",
      brightness: 0.05,
      shadow: "sm",
      lift: 0,
      duration: 200,
    },
    focus: {
      preset: "solid",
      ringWidth: 2,
      ringOffset: 0,
      animation: "expand",
      duration: 200,
      keyboardOnly: true,
    },
    active: {
      scale: "default",
      brightness: 0,
      duration: 100,
    },
  },
  glass: {
    hover: {
      scale: "subtle",
      brightness: 0.05,
      shadow: "glass",
      lift: 2,
      duration: 200,
    },
    focus: {
      preset: "ring",
      ringWidth: 2,
      ringOffset: 2,
      animation: "expand",
      duration: 200,
      keyboardOnly: true,
    },
    active: {
      scale: "default",
      brightness: 0,
      duration: 100,
    },
  },
  danger: {
    hover: {
      scale: "subtle",
      brightness: 0.1,
      shadow: "lg",
      lift: 0,
      duration: 200,
    },
    focus: {
      preset: "ringOffset",
      ringWidth: 2,
      ringOffset: 2,
      animation: "expand",
      duration: 200,
      keyboardOnly: true,
    },
    active: {
      scale: "default",
      brightness: 0.05,
      duration: 100,
    },
  },
  success: {
    hover: {
      scale: "subtle",
      brightness: 0.1,
      shadow: "lg",
      lift: 0,
      duration: 200,
    },
    focus: {
      preset: "ringOffset",
      ringWidth: 2,
      ringOffset: 2,
      animation: "expand",
      duration: 200,
      keyboardOnly: true,
    },
    active: {
      scale: "default",
      brightness: 0.05,
      duration: 100,
    },
  },
}

/**
 * Size-specific interaction adjustments
 */
export const SIZE_INTERACTIONS: Partial<Record<ButtonSize, {
  hover: Partial<HoverStateConfig>
  active: Partial<ActiveConfig>
}>> = {
  xs: {
    hover: { scale: "none" },
    active: { scale: "subtle" },
  },
  sm: {
    hover: { scale: "subtle" },
    active: { scale: "subtle" },
  },
  xl: {
    hover: { scale: "default" },
    active: { scale: "default" },
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate complete button interaction styles
 */
export function buttonInteractionStyles(config: ButtonInteractionConfig = {}): ButtonInteractionStyles {
  const variant = config.variant ?? "primary"
  const size = config.size ?? "md"

  // Get variant-specific configs
  const variantConfig = VARIANT_INTERACTIONS[variant]
  const sizeConfig = SIZE_INTERACTIONS[size]

  // Merge configs: variant > size > default
  const hover: HoverStateConfig = {
    ...variantConfig.hover,
    ...sizeConfig?.hover,
    ...config.hover,
  }

  const focus: FocusConfig = {
    ...variantConfig.focus,
    ...config.focus,
  }

  const active: ActiveConfig = {
    ...variantConfig.active,
    ...sizeConfig?.active,
    ...config.active,
  }

  // Build base classes
  const baseClasses = [
    "inline-flex",
    "items-center",
    "justify-center",
    "gap-2",
    "whitespace-nowrap",
    "rounded-md",
    "font-medium",
    "transition-all",
    "duration-200",
    "focus-visible:outline-none",
    "disabled:pointer-events-none",
    "disabled:opacity-50",
    BUTTON_SIZES[size].padding,
    BUTTON_SIZES[size].height,
    BUTTON_SIZES[size].fontSize,
  ]

  // Build hover classes
  const hoverClasses = [
    `hover:scale-[${hover.scale}]`,
    `hover:brightness-[${1 + (hover.brightness || 0)}]`,
    `hover:shadow-${(hover.shadow as string) || "md"}`,
  ]

  if (hover.lift) {
    hoverClasses.push(`hover:-translate-y-[${hover.lift}px]`)
  }

  // Build focus classes
  const focusClasses = []
  if (focus.preset === "ringOffset") {
    focusClasses.push("focus-visible:ring-2", "focus-visible:ring-offset-2")
  } else if (focus.preset === "ring") {
    focusClasses.push("focus-visible:ring-2")
  } else if (focus.preset === "solid") {
    focusClasses.push("focus-visible:outline", "focus-visible:outline-2")
  }

  // Build active classes
  const activeScale = typeof active.scale === "number"
    ? active.scale
    : active.scale === "subtle" ? 0.98
    : active.scale === "default" ? 0.95
    : active.scale === "strong" ? 0.92
    : 0.95

  const activeClasses = [
    `active:scale-[${activeScale}]`,
  ]

  // Build loading classes
  const loadingClasses = [
    "relative",
    "overflow-hidden",
    "disabled:cursor-wait",
  ]

  // Build disabled classes
  const disabledClasses = [
    "disabled:opacity-50",
    "disabled:cursor-not-allowed",
  ]

  return {
    base: clsx(baseClasses),
    hover: clsx(hoverClasses),
    focus: clsx(focusClasses),
    active: clsx(activeClasses),
    loading: clsx(loadingClasses),
    disabled: clsx(disabledClasses),
  }
}

/**
 * Apply button interaction preset
 */
export function applyButtonPreset(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  customConfig?: Partial<ButtonInteractionConfig>
): string {
  const config = { variant, size, ...customConfig }
  const styles = buttonInteractionStyles(config)

  return twMerge(
    clsx(
      styles.base,
      styles.hover,
      styles.focus,
      styles.active,
      styles.loading,
      styles.disabled
    )
  )
}

/**
 * Button interaction presets for common use cases
 */
export const buttonInteractionPresets = {
  primary: (size: ButtonSize = "md") => applyButtonPreset("primary", size),
  secondary: (size: ButtonSize = "md") => applyButtonPreset("secondary", size),
  ghost: (size: ButtonSize = "md") => applyButtonPreset("ghost", size),
  outline: (size: ButtonSize = "md") => applyButtonPreset("outline", size),
  glass: (size: ButtonSize = "md") => applyButtonPreset("glass", size),
  danger: (size: ButtonSize = "md") => applyButtonPreset("danger", size),
  success: (size: ButtonSize = "md") => applyButtonPreset("success", size),
} as const

/**
 * Icon button specific interactions
 */
export function iconButtonInteraction(
  size: ButtonSize = "md",
  variant: ButtonVariant = "ghost"
): string {
  return twMerge(
    clsx(
      "inline-flex",
      "items-center",
      "justify-center",
      "rounded-md",
      "transition-all",
      "duration-200",
      "focus-visible:outline-none",
      "disabled:pointer-events-none",
      "disabled:opacity-50",
      BUTTON_SIZES[size].height,
      BUTTON_SIZES[size].height, // Width = height for square icon buttons
      // Hover
      "hover:scale-105",
      "hover:brightness-110",
      // Focus
      "focus-visible:ring-2",
      "focus-visible:ring-offset-2",
      // Active
      "active:scale-95",
      // Variant-specific
      variant === "ghost" ? "hover:bg-accent" : "",
      variant === "glass" ? "bg-background/50 backdrop-blur-md border border-border/50" : ""
    )
  )
}

/**
 * Generate loading state styles
 */
export function getLoadingStyles(): string {
  return clsx(
    "relative",
    "overflow-hidden",
    "disabled:cursor-wait",
    "before:absolute",
    "before:inset-0",
    "before:bg-current",
    "before:opacity-10",
    "before:animate-[shimmer_1.5s_infinite]"
  )
}

/**
 * Generate disabled state styles
 */
export function getDisabledStyles(): string {
  return clsx(
    "opacity-50",
    "cursor-not-allowed",
    "pointer-events-none"
  )
}

// ============================================================================
// REACT COMPONENT (for future use)
// ============================================================================

/**
 * ButtonInteraction Component Props
 */
export interface ButtonInteractionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    ButtonInteractionConfig {
  /** Button content */
  children: React.ReactNode
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Button ref */
  buttonRef?: React.RefObject<HTMLButtonElement>
}

/**
 * ButtonInteraction component with built-in micro-interactions
 * Use this component or apply styles to existing buttons
 *
 * @example
 * ```tsx
 * <ButtonInteraction variant="primary" size="md" loading={isLoading}>
 *   Submit
 * </ButtonInteraction>
 * ```
 */
export const ButtonInteraction = React.forwardRef<HTMLButtonElement, ButtonInteractionProps>(
  ({ children, variant = "primary", size = "md", loading = false, disabled = false, className, buttonRef, ...props }, ref) => {
    const styles = buttonInteractionStyles({ variant, size })

    return (
      <button
        ref={ref || buttonRef}
        className={twMerge(
          clsx(
            styles.base,
            styles.hover,
            styles.focus,
            styles.active,
            loading && styles.loading,
            disabled && styles.disabled,
            className
          )
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          </span>
        )}
        <span className={loading ? "opacity-0" : ""}>{children}</span>
      </button>
    )
  }
)

ButtonInteraction.displayName = "ButtonInteraction"
