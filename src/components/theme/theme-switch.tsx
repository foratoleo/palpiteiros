/**
 * Theme Switch Component
 *
 * Enhanced 3-way switch for theme selection: Light | System | Dark
 * Features:
 * - Visual indicator of current position
 * - Smooth slide animation
 * - Icons for each position (Sun, Monitor, Moon)
 * - Keyboard navigation (Arrow keys, Enter, Space)
 * - Apple-style focus-visible ring
 * - Label and description
 *
 * @example
 * ```tsx
 * <ThemeSwitch
 *   label="Appearance"
 *   description="Customize how Palpiteiros looks"
 * />
 * ```
 */

"use client"

import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/providers/ThemeProvider"
import { cn } from "@/lib/utils"
import { useCallback, useEffect } from "react"
import type { HTMLAttributes } from "react"

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeSwitchProps extends HTMLAttributes<HTMLDivElement> {
  /** Label text */
  label?: string
  /** Description text */
  description?: string
  /** Custom class names */
  className?: string
}

type ThemeOption = "light" | "system" | "dark"

// ============================================================================
// THEME OPTION DEFINITIONS
// ============================================================================

const THEME_OPTIONS: readonly {
  value: ThemeOption
  label: string
  icon: typeof Sun
  description: string
}[] = [
  {
    value: "light",
    label: "Light",
    icon: Sun,
    description: "Light mode",
  },
  {
    value: "system",
    label: "System",
    icon: Monitor,
    description: "Follow system preference",
  },
  {
    value: "dark",
    label: "Dark",
    icon: Moon,
    description: "Dark mode",
  },
]

// ============================================================================
// COMPONENT
// ============================================================================

export function ThemeSwitch({
  label = "Appearance",
  description = "Customize how Palpiteiros looks",
  className,
  ...props
}: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme()

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const currentIndex = THEME_OPTIONS.findIndex((opt) => opt.value === theme)

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          const prevIndex =
            currentIndex > 0 ? currentIndex - 1 : THEME_OPTIONS.length - 1
          setTheme(THEME_OPTIONS[prevIndex].value)
          break
        case "ArrowRight":
          e.preventDefault()
          const nextIndex =
            currentIndex < THEME_OPTIONS.length - 1 ? currentIndex + 1 : 0
          setTheme(THEME_OPTIONS[nextIndex].value)
          break
        case "Enter":
        case " ":
          e.preventDefault()
          // Toggle to next theme
          const nextOptionIndex =
            (currentIndex + 1) % THEME_OPTIONS.length
          setTheme(THEME_OPTIONS[nextOptionIndex].value)
          break
      }
    },
    [theme, setTheme]
  )

  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Label and Description */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium leading-none tracking-tight">
          {label}
        </h3>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* Switch Component */}
      <div
        className={cn(
          "relative inline-flex h-9 w-full max-w-[280px]",
          "items-center rounded-lg bg-muted p-1",
          "shadow-inner"
        )}
        role="radiogroup"
        aria-label={label}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Sliding indicator */}
        <div
          className={cn(
            "absolute z-0 h-7 rounded-md bg-background shadow-sm",
            "transition-all duration-300 ease-out",
            "border border-border"
          )}
          style={{
            width: `calc(33.333% - 4px)`,
            left: `calc(${THEME_OPTIONS.findIndex((opt) => opt.value === theme) * 33.333}% + 4px)`,
          }}
        />

        {/* Theme options */}
        {THEME_OPTIONS.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value

          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={isActive}
              aria-label={option.label}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative z-10 flex flex-1 items-center justify-center",
                "rounded-md px-3 py-1.5 text-sm font-medium",
                "transition-colors duration-200",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-2",
                "disabled:pointer-events-none disabled:opacity-50",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 transition-transform duration-200",
                  isActive && "scale-110"
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="sr-only">{option.description}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Compact theme switch (no label/description)
 */
export function ThemeSwitchCompact(props: Omit<ThemeSwitchProps, "label" | "description">) {
  return <ThemeSwitch label="" description="" {...props} />
}

/**
 * Inline theme switch (horizontal layout with label on side)
 */
export function ThemeSwitchInline({
  label = "Theme",
  className,
  ...props
}: Omit<ThemeSwitchProps, "description">) {
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
      <ThemeSwitchCompact {...props} />
    </div>
  )
}

/**
 * Minimal theme switch (just the switch, no container)
 */
export function ThemeSwitchMinimal(props: ThemeSwitchProps) {
  return (
    <div
      className={cn(
        "relative inline-flex h-9 w-full max-w-[280px]",
        "items-center rounded-lg bg-muted p-1",
        "shadow-inner",
        props.className
      )}
      role="radiogroup"
      aria-label="Theme"
      tabIndex={0}
    >
      {/* Sliding indicator */}
      <div
        className={cn(
          "absolute z-0 h-7 rounded-md bg-background shadow-sm",
          "transition-all duration-300 ease-out",
          "border border-border"
        )}
        style={{
          width: `calc(33.333% - 4px)`,
          left: `calc(${THEME_OPTIONS.findIndex((opt) => opt.value === props.children || "system") * 33.333}% + 4px)`,
        }}
      />

      {/* Theme options */}
      {THEME_OPTIONS.map((option) => {
        const Icon = option.icon
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const { theme, setTheme } = useTheme()
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            onClick={() => setTheme(option.value)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center",
              "rounded-md px-3 py-1.5 text-sm font-medium",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-ring focus-visible:ring-offset-2",
              isActive
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                isActive && "scale-110"
              )}
              strokeWidth={2}
              aria-hidden="true"
            />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeSwitch
