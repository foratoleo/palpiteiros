/**
 * Theme Transition Component
 *
 * T30.2: Smooth theme transition between light and dark modes.
 * Provides visual feedback during theme changes with color interpolation.
 *
 * @features
 * - Smooth color interpolation during theme switch
 * - Overlay transition with configurable easing
 * - Respects prefers-reduced-motion
 * - No FOUC (Flash of Unstyled Content)
 * - Integrates with existing ThemeProvider
 *
 * @example
 * ```tsx
 * import { ThemeTransition } from '@/components/effects/colors/theme-transition'
 *
 * function App() {
 *   return (
 *     <ThemeProvider>
 *       <ThemeTransition duration={400}>
 *         <YourContent />
 *       </ThemeTransition>
 *     </ThemeProvider>
 *   )
 * }
 * ```
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/providers/ThemeProvider'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface ThemeTransitionProps {
  children: React.ReactNode
  /** Transition duration in milliseconds */
  duration?: number
  /** Custom easing function */
  easing?: number | number[]
  /** Enable transition overlay */
  showOverlay?: boolean
  /** Overlay opacity */
  overlayOpacity?: number
  /** Custom CSS class names */
  className?: string
  /** Disable transitions for reduced motion */
  respectReducedMotion?: boolean
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Check if reduced motion is preferred
 */
function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handleChange = () => setPrefersReduced(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

/**
 * Track theme changes
 */
function useThemeChange() {
  const { resolvedTheme } = useTheme()
  const [prevTheme, setPrevTheme] = React.useState(resolvedTheme)
  const [isChanging, setIsChanging] = React.useState(false)

  React.useEffect(() => {
    if (resolvedTheme !== prevTheme) {
      setIsChanging(true)
      const timer = setTimeout(() => {
        setPrevTheme(resolvedTheme)
        setIsChanging(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [resolvedTheme, prevTheme])

  return { isChanging, theme: resolvedTheme, previousTheme: prevTheme }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Theme overlay component for smooth transition effect
 */
interface ThemeOverlayProps {
  isDark: boolean
  duration: number
  opacity: number
  show: boolean
}

function ThemeOverlay({ isDark, duration, opacity, show }: ThemeOverlayProps) {
  // Get theme colors from CSS variables
  const getLightColor = () => {
    if (typeof window === 'undefined') return '#ffffff'
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim() || '#ffffff'
  }

  const getDarkColor = () => {
    if (typeof window === 'undefined') return '#09090b'
    return getComputedStyle(document.documentElement)
      .getPropertyValue('--background')
      .trim() || '#09090b'
  }

  const overlayColor = isDark ? getDarkColor() : getLightColor()

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 pointer-events-none z-50"
          style={{ backgroundColor: overlayColor }}
          initial={{ opacity: 0 }}
          animate={{ opacity }}
          exit={{ opacity: 0 }}
          transition={{ duration: duration / 1000, ease: 'easeInOut' }}
        />
      )}
    </AnimatePresence>
  )
}

/**
 * Theme Transition Component
 *
 * Wraps children with smooth theme transition behavior.
 */
export function ThemeTransition({
  children,
  duration = 300,
  easing = [0.4, 0, 0.2, 1],
  showOverlay = false,
  overlayOpacity = 0.1,
  className,
  respectReducedMotion = true
}: ThemeTransitionProps) {
  const { resolvedTheme } = useTheme()
  const prefersReduced = useReducedMotion()
  const { isChanging } = useThemeChange()

  // Should we animate?
  const shouldAnimate = !respectReducedMotion || !prefersReduced

  // Content wrapper variants
  const contentVariants = {
    light: {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      transition: {
        duration: duration / 1000,
        ease: easing,
        staggerChildren: 0.05
      }
    },
    dark: {
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      transition: {
        duration: duration / 1000,
        ease: easing,
        staggerChildren: 0.05
      }
    }
  }

  return (
    <motion.div
      className={cn('theme-transition-wrapper', className)}
      variants={contentVariants}
      animate={resolvedTheme}
      initial={false}
    >
      {showOverlay && shouldAnimate && (
        <ThemeOverlay
          isDark={resolvedTheme === 'dark'}
          duration={duration}
          opacity={overlayOpacity}
          show={isChanging}
        />
      )}
      {children}
    </motion.div>
  )
}

/**
 * Theme-aware wrapper component
 * Applies theme-specific classes with smooth transitions
 */
export interface ThemeAwareProps {
  children: React.ReactNode
  /** Additional class for light theme */
  lightClassName?: string
  /** Additional class for dark theme */
  darkClassName?: string
  /** Transition duration in ms */
  duration?: number
  /** Custom CSS class names */
  className?: string
}

export function ThemeAware({
  children,
  lightClassName,
  darkClassName,
  duration = 300,
  className
}: ThemeAwareProps) {
  const { resolvedTheme } = useTheme()
  const prefersReduced = useReducedMotion()
  const shouldAnimate = !prefersReduced

  return (
    <motion.div
      className={cn(
        'theme-aware',
        resolvedTheme === 'dark' ? darkClassName : lightClassName,
        className
      )}
      initial={false}
      animate={{
        opacity: 1,
        scale: 1
      }}
      transition={{
        duration: shouldAnimate ? duration / 1000 : 0,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Smooth theme switch button
 * Button that triggers theme change with visual feedback
 */
export interface ThemeSwitchButtonProps {
  /** Custom render function for button content */
  children?: (props: { isDark: boolean; isChanging: boolean }) => React.ReactNode
  /** Custom CSS class names */
  className?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show label */
  showLabel?: boolean
  /** Label text */
  label?: string
}

export function ThemeSwitchButton({
  children,
  className,
  size = 'md',
  showLabel = false,
  label
}: ThemeSwitchButtonProps) {
  const { resolvedTheme, toggleTheme } = useTheme()
  const prefersReduced = useReducedMotion()
  const { isChanging } = useThemeChange()

  const isDark = resolvedTheme === 'dark'
  const shouldAnimate = !prefersReduced

  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12'
  }

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  }

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center rounded-full',
        'bg-muted hover:bg-muted/80',
        'transition-colors',
        sizeStyles[size],
        className
      )}
      onClick={toggleTheme}
      disabled={isChanging}
      whileTap={shouldAnimate ? { scale: 0.95 } : undefined}
      whileHover={shouldAnimate ? { scale: 1.05 } : undefined}
      transition={{ duration: 0.2 }}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {children ? (
        children({ isDark, isChanging })
      ) : (
        <>
          {/* Sun icon */}
          <motion.svg
            width={iconSize[size]}
            height={iconSize[size]}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute text-yellow-500 dark:text-yellow-400"
            initial={false}
            animate={{
              rotate: isDark ? 90 : 0,
              scale: isDark ? 0 : 1,
              opacity: isDark ? 0 : 1
            }}
            transition={{ duration: shouldAnimate ? 0.3 : 0 }}
          >
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </motion.svg>

          {/* Moon icon */}
          <motion.svg
            width={iconSize[size]}
            height={iconSize[size]}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute text-blue-600 dark:text-blue-400"
            initial={false}
            animate={{
              rotate: isDark ? 0 : -90,
              scale: isDark ? 1 : 0,
              opacity: isDark ? 1 : 0
            }}
            transition={{ duration: shouldAnimate ? 0.3 : 0 }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>

          {showLabel && (
            <motion.span
              className="ml-8 text-sm font-medium"
              initial={false}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {label || (isDark ? 'Dark' : 'Light')}
            </motion.span>
          )}
        </>
      )}
    </motion.button>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ThemeTransition
