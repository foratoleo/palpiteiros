/**
 * Theme Utility Functions
 *
 * Helper functions for theme management including:
 * - Theme detection and resolution
 * - localStorage persistence
 * - System preference detection
 * - DOM manipulation for theme application
 * - SSR-safe utilities
 * - Transition management (FOUC prevention)
 *
 * @example
 * ```ts
 * import { getTheme, setTheme, resolveTheme, applyTheme } from '@/lib/theme'
 *
 * // Get current theme
 * const theme = getTheme()
 *
 * // Set new theme
 * setTheme('dark')
 *
 * // Resolve system theme to actual theme
 * const actualTheme = resolveTheme('system') // 'dark' or 'light'
 *
 * // Apply theme to DOM
 * applyTheme('dark')
 * ```
 */

import type { Theme } from '@/types/ui.types'

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * localStorage key for theme persistence
 */
export const THEME_STORAGE_KEY = 'palpiteiros-theme'

/**
 * Default theme
 */
export const DEFAULT_THEME: Theme = 'system'

/**
 * Transition duration for theme changes (in ms)
 * Used to prevent FOUC by temporarily disabling transitions
 */
export const THEME_TRANSITION_DURATION = 300

// ============================================================================
// SERVER DETECTION
// ============================================================================

/**
 * Check if code is running on server
 * @returns true if server-side
 */
export const isServer = typeof window === 'undefined'

/**
 * Get initial theme for SSR
 * @returns Default theme or undefined for client-side hydration
 */
export function getInitialTheme(): Theme | undefined {
  if (isServer) {
    return DEFAULT_THEME
  }
  return undefined
}

// ============================================================================
// THEME DETECTION
// ============================================================================

/**
 * Get system theme preference
 * @returns 'dark' if system prefers dark mode, 'light' otherwise
 */
export function getSystemTheme(): 'light' | 'dark' {
  if (isServer) {
    return 'dark' // Default for SSR
  }

  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

/**
 * Resolve theme to actual light/dark value
 * @param theme - Theme to resolve ('light' | 'dark' | 'system')
 * @returns 'light' or 'dark'
 */
export function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme()
  }
  return theme
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

/**
 * Get theme from localStorage
 * @returns Theme from storage or default theme
 */
export function getTheme(storageKey: string = THEME_STORAGE_KEY): Theme {
  if (isServer) {
    return DEFAULT_THEME
  }

  try {
    const stored = localStorage.getItem(storageKey)
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error)
  }

  return DEFAULT_THEME
}

/**
 * Save theme to localStorage
 * @param theme - Theme to save
 * @param storageKey - localStorage key (default: 'palpiteiros-theme')
 */
export function saveTheme(theme: Theme, storageKey: string = THEME_STORAGE_KEY): void {
  if (isServer) {
    return
  }

  try {
    localStorage.setItem(storageKey, theme)
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error)
  }
}

// ============================================================================
// DOM MANIPULATION
// ============================================================================

/**
 * Apply theme to DOM element
 * Adds/removes 'dark' class on <html> element
 * @param theme - Theme to apply
 */
export function applyTheme(theme: Theme): void {
  if (isServer) {
    return
  }

  const root = window.document.documentElement
  const resolvedTheme = resolveTheme(theme)

  // Remove existing theme classes
  root.classList.remove('light', 'dark')

  // Add resolved theme class
  root.classList.add(resolvedTheme)

  // Update data attribute for CSS selectors
  root.setAttribute('data-theme', theme)
}

/**
 * Set theme and apply to DOM
 * @param theme - Theme to set
 * @param storageKey - localStorage key (default: 'palpiteiros-theme')
 */
export function setTheme(theme: Theme, storageKey: string = THEME_STORAGE_KEY): void {
  saveTheme(theme, storageKey)
  applyTheme(theme)
}

// ============================================================================
// TRANSITION MANAGEMENT (FOUC PREVENTION)
// ============================================================================

/**
 * Disable CSS transitions during theme change
 * Prevents flash of unstyled content when switching themes
 */
export function disableTransitions(): void {
  if (isServer) {
    return
  }

  const style = document.createElement('style')
  style.id = 'theme-transitions-disabled'
  style.innerHTML = `
    * {
      transition-property: none !important;
      transition-duration: 0ms !important;
      transition-delay: 0ms !important;
    }
  `
  document.head.appendChild(style)
}

/**
 * Re-enable CSS transitions after theme change
 */
export function enableTransitions(): void {
  if (isServer) {
    return
  }

  const style = document.getElementById('theme-transitions-disabled')
  if (style) {
    style.remove()
  }
}

/**
 * Apply theme with transitions disabled (prevents FOUC)
 * @param theme - Theme to apply
 */
export function applyThemeSmooth(theme: Theme): void {
  if (isServer) {
    return
  }

  // Disable transitions
  disableTransitions()

  // Apply theme
  applyTheme(theme)

  // Re-enable transitions after a brief delay
  setTimeout(() => {
    enableTransitions()
  }, THEME_TRANSITION_DURATION)
}

// ============================================================================
// COOKIE SUPPORT (SSR)
// ============================================================================

/**
 * Get theme from cookie (for SSR)
 * @param cookieHeader - Cookie header string
 * @returns Theme from cookie or default
 */
export function getThemeFromCookie(cookieHeader: string): Theme {
  const match = cookieHeader.match(
    new RegExp(`(^| )${THEME_STORAGE_KEY}=([^;]+)`)
  )

  if (match && match[2] && ['light', 'dark', 'system'].includes(match[2])) {
    return match[2] as Theme
  }

  return DEFAULT_THEME
}

/**
 * Set theme cookie (for SSR)
 * @param theme - Theme to set in cookie
 * @returns Set-Cookie header value
 */
export function setThemeCookie(theme: Theme): string {
  const maxAge = 60 * 60 * 24 * 365 // 1 year
  return `${THEME_STORAGE_KEY}=${theme}; Path=/; Max-Age=${maxAge}; SameSite=Lax`
}

// ============================================================================
// SYSTEM PREFERENCE LISTENER
// ============================================================================

/**
 * Listen for system theme changes
 * @param callback - Callback function when system theme changes
 * @returns Cleanup function to remove listener
 */
export function listenSystemTheme(
  callback: (systemTheme: 'light' | 'dark') => void
): (() => void) | null {
  if (isServer) {
    return null
  }

  if (!window.matchMedia) {
    return null
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    callback(e.matches ? 'dark' : 'light')
  }

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }

  // Legacy browsers
  if (mediaQuery.addListener) {
    mediaQuery.addListener(handler)
    return () => mediaQuery.removeListener(handler)
  }

  return null
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Theme utilities object
 */
export const themeUtils = {
  isServer,
  getInitialTheme,
  getSystemTheme,
  resolveTheme,
  getTheme,
  saveTheme,
  setTheme,
  applyTheme,
  applyThemeSmooth,
  disableTransitions,
  enableTransitions,
  getThemeFromCookie,
  setThemeCookie,
  listenSystemTheme,
}

export default themeUtils
