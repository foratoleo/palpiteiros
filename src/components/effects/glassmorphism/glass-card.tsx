/**
 * Glass Card Component
 *
 * Enhanced card component with glassmorphism effect.
 * Supports multiple preset intensities with performance optimizations.
 *
 * Features:
 * - 4 preset variants (subtle, medium, heavy, colored)
 * - Cross-browser fallbacks for backdrop-filter
 * - Hover elevation effect
 * - Dark mode support
 * - Performance optimized
 *
 * @example
 * ```tsx
 * import { GlassCard } from './glass-card'
 *
 * <GlassCard variant="medium" hover>
 *   <CardContent>Content</CardContent>
 * </GlassCard>
 * ```
 */

import React, { forwardRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { applyGlassPreset, type GlassPreset } from "./glass-presets"

// ============================================================================
// TYPES
// ============================================================================

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Glass effect preset
   * @default "medium"
   */
  variant?: GlassPreset | "blue" | "purple" | "green" | "amber" | "rose"

  /**
   * Enable hover elevation effect
   * @default false
   */
  hover?: boolean

  /**
   * Hover lift distance in pixels
   * @default 4
   */
  hoverLift?: number

  /**
   * Enable click animation
   * @default true
   */
  pressAnimation?: boolean

  /**
   * Card border radius
   * @default "lg"
   */
  rounded?: "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full"

  /**
   * Additional CSS classes
   */
  className?: string

  /**
   * Card content
   */
  children: React.ReactNode
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * GlassCard with glassmorphism effect
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      variant = "medium",
      hover = false,
      hoverLift = 4,
      pressAnimation = true,
      rounded = "lg",
      className,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const [darkMode, setDarkMode] = useState(false)

    // Detect dark mode
    useEffect(() => {
      const root = window.document.documentElement
      const isDark = root.classList.contains("dark")
      setDarkMode(isDark)

      // Listen for theme changes
      const observer = new MutationObserver(() => {
        setDarkMode(root.classList.contains("dark"))
      })

      observer.observe(root, {
        attributes: true,
        attributeFilter: ["class"],
      })

      return () => observer.disconnect()
    }, [])

    // Get glass styles
    const glassStyles = applyGlassPreset(variant, { darkMode })

    // Border radius mapping
    const roundedClasses: Record<string, string> = {
      none: "rounded-none",
      sm: "rounded-sm",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      "3xl": "rounded-3xl",
      full: "rounded-full",
    }

    // Base classes
    const baseClasses = [
      "overflow-hidden",
      "transition-all",
      "duration-200",
      "ease-out",
      "will-change-transform",
      "will-change-[box-shadow]",
    ]

    // Hover classes
    const hoverClasses = hover
      ? [
          "hover:shadow-xl",
          "hover:-translate-y-[4px]",
          pressAnimation ? "active:scale-[0.98]" : "",
        ]
      : []

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          roundedClasses[rounded],
          hoverClasses,
          className
        )}
        style={{
          ...glassStyles,
          ...style,
          ...(hover && {
            "--hover-lift": `${-hoverLift}px`,
          } as React.CSSProperties),
        }}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = "GlassCard"

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Subtle glass card - Best performance
 */
export const GlassCardSubtle = (props: GlassCardProps) => (
  <GlassCard variant="subtle" {...props} />
)

/**
 * Medium glass card - Balanced
 */
export const GlassCardMedium = (props: GlassCardProps) => (
  <GlassCard variant="medium" {...props} />
)

/**
 * Heavy glass card - High quality
 */
export const GlassCardHeavy = (props: GlassCardProps) => (
  <GlassCard variant="heavy" {...props} />
)

/**
 * Colored glass card - Blue tint
 */
export const GlassCardColored = (props: GlassCardProps) => (
  <GlassCard variant="colored" {...props} />
)

/**
 * Interactive glass card with hover effect
 */
export const GlassCardInteractive = (props: GlassCardProps) => (
  <GlassCard hover {...props} />
)

/**
 * Colored glass card variants
 */
export const GlassCardBlue = (props: GlassCardProps) => (
  <GlassCard variant="blue" {...props} />
)

export const GlassCardPurple = (props: GlassCardProps) => (
  <GlassCard variant="purple" {...props} />
)

export const GlassCardGreen = (props: GlassCardProps) => (
  <GlassCard variant="green" {...props} />
)

export const GlassCardAmber = (props: GlassCardProps) => (
  <GlassCard variant="amber" {...props} />
)

export const GlassCardRose = (props: GlassCardProps) => (
  <GlassCard variant="rose" {...props} />
)

export default GlassCard
