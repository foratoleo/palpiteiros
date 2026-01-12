/**
 * Theme Toggle Button
 *
 * Icon button to toggle between light and dark theme.
 * Features:
 * - Sun icon for light mode, Moon icon for dark mode
 * - Smooth rotation animation on toggle
 * - Size variants (sm, md, lg)
 * - Tooltip on hover
 * - Apple-style ripple effect
 * - Full accessibility (ARIA labels, keyboard navigation)
 *
 * @example
 * ```tsx
 * <ThemeToggle size="md" showTooltip />
 * ```
 */

"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import type { HTMLAttributes } from "react"

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeToggleProps extends HTMLAttributes<HTMLButtonElement> {
  /** Button size */
  size?: "sm" | "md" | "lg"
  /** Show tooltip on hover */
  showTooltip?: boolean
  /** Custom tooltip text */
  tooltipText?: string
  /** Variant for the button */
  variant?: "default" | "ghost" | "outline" | "glass"
}

// ============================================================================
// COMPONENT
// ============================================================================

export function ThemeToggle({
  size = "md",
  showTooltip = true,
  tooltipText,
  variant = "ghost",
  className,
  ...props
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  // Size mappings
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  }

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 22,
  }

  // Dynamic tooltip text
  const getTooltipText = () => {
    if (tooltipText) return tooltipText
    return isDark ? "Switch to light mode" : "Switch to dark mode"
  }

  // Button content
  const buttonContent = (
    <Button
      variant={variant}
      size="icon"
      className={cn(
        "relative overflow-hidden rounded-full transition-all duration-300",
        "hover:scale-105 active:scale-95",
        sizeClasses[size],
        className
      )}
      onClick={toggleTheme}
      aria-label={getTooltipText()}
      {...props}
    >
      {/* Ripple effect container */}
      <span className="absolute inset-0 overflow-hidden rounded-full">
        <span className="absolute inset-0 animate-pulse bg-current opacity-0 transition-opacity duration-300 group-hover:opacity-10" />
      </span>

      {/* Icons with rotation animation */}
      <Sun
        className={cn(
          "absolute transition-all duration-500",
          isDark
            ? "rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
          "text-yellow-500 dark:text-yellow-400"
        )}
        style={{ width: iconSize[size], height: iconSize[size] }}
        strokeWidth={2}
      />

      <Moon
        className={cn(
          "absolute transition-all duration-500",
          !isDark
            ? "-rotate-90 scale-0 opacity-0"
            : "rotate-0 scale-100 opacity-100",
          "text-blue-600 dark:text-blue-400"
        )}
        style={{ width: iconSize[size], height: iconSize[size] }}
        strokeWidth={2}
      />

      {/* Screen reader only text */}
      <span className="sr-only">{getTooltipText()}</span>
    </Button>
  )

  // Wrap in tooltip if enabled
  if (showTooltip) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
          <TooltipContent
            className={cn(
              "text-xs font-medium",
              "bg-popover text-popover-foreground",
              "border border-border",
              "shadow-md"
            )}
            sideOffset={8}
          >
            {getTooltipText()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return buttonContent
}

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Compact theme toggle (for mobile or tight spaces)
 */
export function ThemeToggleCompact(props: Omit<ThemeToggleProps, "size">) {
  return <ThemeToggle size="sm" {...props} />
}

/**
 * Large theme toggle (for accessibility or prominence)
 */
export function ThemeToggleLarge(props: Omit<ThemeToggleProps, "size">) {
  return <ThemeToggle size="lg" {...props} />
}

/**
 * Glassmorphism theme toggle (for headers/modals)
 */
export function ThemeToggleGlass(props: ThemeToggleProps) {
  return <ThemeToggle variant="glass" {...props} />
}

export default ThemeToggle
