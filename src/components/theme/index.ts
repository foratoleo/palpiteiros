/**
 * Theme Components & Utilities
 *
 * Complete theme system for Palpiteiros v2 with:
 * - ThemeProvider (context + state management)
 * - ThemeToggle (icon button for light/dark switching)
 * - ThemeSwitch (3-way switch: Light | System | Dark)
 * - Theme utility functions
 * - TypeScript types
 *
 * @features
 * - System preference detection and listening
 * - localStorage persistence
 * - Smooth transitions (FOUC prevention)
 * - SSR support
 * - Full accessibility (ARIA, keyboard navigation)
 * - Integration with ui.store (Zustand)
 *
 * @example
 * ```tsx
 * // In app layout
 * import { ThemeProvider } from '@/components/theme'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <ThemeProvider defaultTheme="system">
 *       {children}
 *     </ThemeProvider>
 *   )
 * }
 *
 * // In component
 * import { useTheme, ThemeToggle, ThemeSwitch } from '@/components/theme'
 *
 * export function Header() {
 *   const { theme, resolvedTheme } = useTheme()
 *   return (
 *     <header>
 *       <ThemeToggle />
 *     </header>
 *   )
 * }
 * ```
 */

// ============================================================================
// PROVIDER
// ============================================================================

export { ThemeProvider, useTheme } from '@/components/providers/ThemeProvider'

// ============================================================================
// COMPONENTS
// ============================================================================

export {
  ThemeToggle,
  ThemeToggleCompact,
  ThemeToggleLarge,
  ThemeToggleGlass,
  type ThemeToggleProps,
} from '@/components/theme/theme-toggle'

export {
  ThemeSwitch,
  ThemeSwitchCompact,
  ThemeSwitchInline,
  ThemeSwitchMinimal,
  type ThemeSwitchProps,
} from '@/components/theme/theme-switch'

// ============================================================================
// UTILITIES
// ============================================================================

export {
  // Constants
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  THEME_TRANSITION_DURATION,
  // Detection
  isServer,
  getInitialTheme,
  getSystemTheme,
  resolveTheme,
  // Storage
  getTheme,
  saveTheme,
  setTheme,
  // DOM
  applyTheme,
  applyThemeSmooth,
  // Transitions
  disableTransitions,
  enableTransitions,
  // Cookies (SSR)
  getThemeFromCookie,
  setThemeCookie,
  // Listener
  listenSystemTheme,
  // Utilities object
  themeUtils,
} from '@/lib/theme'

// ============================================================================
// TYPES
// ============================================================================

export type { Theme } from '@/types/ui.types'
