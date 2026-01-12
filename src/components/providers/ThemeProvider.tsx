/**
 * Theme Provider
 *
 * Comprehensive theme context provider with:
 * - Theme state management (light/dark/system)
 * - System preference detection and listening
 * - localStorage persistence
 * - Smooth transitions (FOUC prevention)
 * - SSR support
 * - Integration with ui.store for consistency
 *
 * @features
 * - Resolves 'system' theme to actual light/dark based on OS preference
 * - Listens for system theme changes and updates automatically
 * - Persists user preference to localStorage
 * - Prevents FOUC by disabling transitions during theme switch
 * - SSR-safe (no localStorage access on server)
 *
 * @example
 * ```tsx
 * import { ThemeProvider, useTheme } from '@/components/theme'
 *
 * // In app layout
 * <ThemeProvider defaultTheme="system">
 *   <App />
 * </ThemeProvider>
 *
 * // In component
 * const { theme, setTheme, resolvedTheme } = useTheme()
 * ```
 */

"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useUiStore } from "@/stores/ui.store"
import {
  getTheme,
  saveTheme,
  resolveTheme as resolveThemeUtil,
  applyTheme,
  applyThemeSmooth,
  listenSystemTheme,
  getSystemTheme,
  isServer,
} from "@/lib/theme"
import type { Theme } from "@/types/ui.types"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Theme Context Value
 */
interface ThemeContextValue {
  /** Current theme setting ('light' | 'dark' | 'system') */
  theme: Theme
  /** Resolved theme ('light' | 'dark') - actual theme being applied */
  resolvedTheme: "light" | "dark"
  /** Set theme (saves to localStorage and applies to DOM) */
  setTheme: (theme: Theme) => void
  /** Toggle between light and dark (ignoring system) */
  toggleTheme: () => void
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

/**
 * useTheme Hook
 *
 * Access theme context from any component
 * @throws Error if used outside ThemeProvider
 */
export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

// ============================================================================
// PROVIDER PROPS
// ============================================================================

interface ThemeProviderProps {
  children: React.ReactNode
  /** Default theme (fallback if no stored theme) */
  defaultTheme?: Theme
  /** localStorage key for persistence */
  storageKey?: string
  /** Enable smooth transitions (prevents FOUC) */
  enableTransitions?: boolean
  /** Enable system theme listening */
  enableSystemListener?: boolean
}

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "palpiteiros-theme",
  enableTransitions = true,
  enableSystemListener = true,
}: ThemeProviderProps) {
  // Get theme from Zustand store
  const { theme: storeTheme, setTheme: setStoreTheme, themeConfig: storeThemeConfig } = useUiStore()

  // Local state for theme (respects store, but can be initialized from localStorage)
  const [theme, setThemeState] = useState<Theme>(() => {
    if (isServer) {
      return defaultTheme
    }
    // Try localStorage first, then store, then default
    const stored = getTheme(storageKey)
    return stored || storeThemeConfig.theme || defaultTheme
  })

  // Resolved theme (actual light/dark being applied)
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
    if (isServer) {
      return "dark" // Default for SSR
    }
    return resolveThemeUtil(theme)
  })

  // Update resolved theme when theme changes
  useEffect(() => {
    if (isServer) {
      return
    }

    const resolved = resolveThemeUtil(theme)
    setResolvedTheme(resolved)

    // Sync with Zustand store
    setStoreTheme(resolved)

    // Apply to DOM with or without transitions
    if (enableTransitions) {
      applyThemeSmooth(theme)
    } else {
      applyTheme(theme)
    }
  }, [theme, enableTransitions, setStoreTheme])

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystemListener || isServer || theme !== "system") {
      return
    }

    const cleanup = listenSystemTheme((systemTheme) => {
      setResolvedTheme(systemTheme)
      setStoreTheme(systemTheme)
      // Don't change theme state, just update resolved theme
      if (enableTransitions) {
        applyThemeSmooth("system")
      } else {
        applyTheme("system")
      }
    })

    return () => {
      cleanup?.()
    }
  }, [theme, enableSystemListener, enableTransitions, setStoreTheme])

  // Set theme function (saves to localStorage and updates state)
  const setTheme = useCallback(
    (newTheme: Theme) => {
      saveTheme(newTheme, storageKey)
      setThemeState(newTheme)
    },
    [storageKey]
  )

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }, [resolvedTheme, setTheme])

  const contextValue: ThemeContextValue = {
    theme,
    resolvedTheme,
    setTheme,
    toggleTheme,
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}
