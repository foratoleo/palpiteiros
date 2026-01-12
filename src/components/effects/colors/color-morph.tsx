/**
 * Color Morph Component
 *
 * T30.3: Color morphing effects for state changes.
 * Provides smooth color transitions for UI elements based on their state.
 *
 * @features
 * - Smooth color morphing between states (hover, active, focus, etc.)
 * - Configurable color palettes and transitions
 * - Gradient morphing support
 * - Reduced motion support
 * - Integration with Framer Motion
 *
 * @example
 * ```tsx
 * import { ColorMorph } from '@/components/effects/colors/color-morph'
 *
 * <ColorMorph
 *   fromColor="#3b82f6"
 *   toColor="#10b981"
 *   trigger="hover"
 *   duration={300}
 * >
 *   <button>Hover me</button>
 * </ColorMorph>
 * ```
 */

'use client'

import * as React from 'react'
import { motion, MotionProps } from 'framer-motion'
import { cn } from '@/lib/utils'
import { interpolateColor, prefersReducedMotion } from './color-interpolator'

// ============================================================================
// TYPES
// ============================================================================

export type ColorMorphTrigger = 'hover' | 'focus' | 'active' | 'visible' | 'always'

export interface ColorMorphProps {
  children: React.ReactNode
  /** Starting color */
  fromColor: string
  /** Target color */
  toColor: string
  /** What triggers the color change */
  trigger?: ColorMorphTrigger
  /** Transition duration in milliseconds */
  duration?: number
  /** Custom easing */
  easing?: number | number[]
  /** CSS property to animate */
  property?: 'color' | 'backgroundColor' | 'borderColor' | 'fill' | 'stroke'
  /** Apply to gradient instead of solid color */
  gradient?: boolean
  /** Gradient direction */
  gradientDirection?: string
  /** Custom CSS class names */
  className?: string
  /** Additional motion props */
  motionProps?: MotionProps
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean
  /** Callback when animation starts */
  onAnimationStart?: () => void
  /** Callback when animation completes */
  onAnimationComplete?: () => void
}

export interface UseColorMorphOptions {
  fromColor: string
  toColor: string
  duration?: number
  easing?: number | number[]
  respectReducedMotion?: boolean
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * useColorMorph Hook
 *
 * Manages color state for morphing animations
 */
export function useColorMorph({
  fromColor,
  toColor,
  duration = 300,
  easing = [0.4, 0, 0.2, 1],
  respectReducedMotion = true
}: UseColorMorphOptions) {
  const [isMorphed, setIsMorphed] = React.useState(false)
  const [currentColor, setCurrentColor] = React.useState(fromColor)
  const shouldAnimate = !respectReducedMotion || !prefersReducedMotion()

  // Animate color change
  React.useEffect(() => {
    if (!shouldAnimate) {
      setCurrentColor(isMorphed ? toColor : fromColor)
      return
    }

    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      setCurrentColor(
        interpolateColor(fromColor, toColor, progress, { easing: (t) => t })
      )

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [isMorphed, fromColor, toColor, duration, shouldAnimate])

  const morphTo = React.useCallback(() => setIsMorphed(true), [])
  const morphFrom = React.useCallback(() => setIsMorphed(false), [])
  const toggle = React.useCallback(() => setIsMorphed((prev) => !prev), [])

  return {
    currentColor,
    isMorphed,
    morphTo,
    morphFrom,
    toggle,
    shouldAnimate
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Color Morph Component
 *
 * Wraps children with color morphing behavior based on trigger state
 */
export function ColorMorph({
  children,
  fromColor,
  toColor,
  trigger = 'hover',
  duration = 300,
  easing = [0.4, 0, 0.2, 1],
  property = 'color',
  gradient = false,
  gradientDirection = 'to right',
  className,
  motionProps,
  respectReducedMotion = true,
  onAnimationStart,
  onAnimationComplete
}: ColorMorphProps) {
  const shouldAnimate = !respectReducedMotion || !prefersReducedMotion()

  // Build style object based on property
  const getStyle = (morphed: boolean): React.CSSProperties => {
    const color = morphed ? toColor : fromColor

    if (gradient) {
      const from = morphed ? toColor : fromColor
      const to = morphed ? fromColor : toColor
      return {
        backgroundImage: `linear-gradient(${gradientDirection}, ${from}, ${to})`,
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      } as React.CSSProperties
    }

    return {
      [property]: color
    } as React.CSSProperties
  }

  // Trigger configurations
  const triggerProps = {
    hover: {
      onHoverStart: () => onAnimationStart?.(),
      onHoverEnd: () => onAnimationComplete?.()
    },
    focus: {
      onFocus: () => onAnimationStart?.(),
      onBlur: () => onAnimationComplete?.()
    },
    active: {
      onTapStart: () => onAnimationStart?.(),
      onTap: () => onAnimationComplete?.()
    },
    visible: {
      initial: 'hidden',
      animate: 'visible',
      exit: 'hidden'
    },
    always: {}
  }[trigger]

  // Build motion variants
  const variants = shouldAnimate
    ? {
        initial: { ...getStyle(false) },
        morphed: { ...getStyle(true) }
      }
    : {}

  return (
    <motion.div
      className={cn('color-morph', className)}
      variants={shouldAnimate ? variants : undefined}
      initial={trigger === 'visible' ? 'initial' : false}
      animate={trigger === 'always' ? 'morphed' : 'initial'}
      style={trigger === 'always' || !shouldAnimate ? getStyle(true) : undefined}
      transition={{
        duration: duration / 1000,
        ease: easing
      }}
      whileHover={trigger === 'hover' && shouldAnimate ? 'morphed' : undefined}
      whileFocus={trigger === 'focus' && shouldAnimate ? 'morphed' : undefined}
      whileTap={trigger === 'active' && shouldAnimate ? 'morphed' : undefined}
      {...triggerProps}
      {...(motionProps as any)}
      onAnimationStart={() => {
        if (trigger === 'visible') onAnimationStart?.()
      }}
      onAnimationComplete={() => {
        if (trigger === 'visible') onAnimationComplete?.()
      }}
    >
      {children}
    </motion.div>
  )
}

/**
 * Morphing Badge Component
 *
 * Badge that morphs color based on state
 */
export interface MorphingBadgeProps {
  children: React.ReactNode
  /** Default state color */
  defaultColor?: string
  /** Active state color */
  activeColor?: string
  /** Success state color */
  successColor?: string
  /** Error state color */
  errorColor?: string
  /** Warning state color */
  warningColor?: string
  /** Current state */
  state?: 'default' | 'active' | 'success' | 'error' | 'warning'
  /** Duration in ms */
  duration?: number
  /** Custom CSS class names */
  className?: string
}

export function MorphingBadge({
  children,
  defaultColor = '#6b7280',
  activeColor = '#3b82f6',
  successColor = '#10b981',
  errorColor = '#ef4444',
  warningColor = '#f59e0b',
  state = 'default',
  duration = 300,
  className
}: MorphingBadgeProps) {
  const colors = {
    default: defaultColor,
    active: activeColor,
    success: successColor,
    error: errorColor,
    warning: warningColor
  }

  const [prevState, setPrevState] = React.useState(state)
  const [isTransitioning, setIsTransitioning] = React.useState(false)

  React.useEffect(() => {
    if (state !== prevState) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setPrevState(state)
        setIsTransitioning(false)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [state, prevState, duration])

  return (
    <ColorMorph
      fromColor={colors[prevState]}
      toColor={colors[state]}
      trigger="always"
      duration={duration}
      property="backgroundColor"
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white',
        'transition-shadow',
        isTransitioning && 'shadow-lg',
        className
      )}
    >
      {children}
    </ColorMorph>
  )
}

/**
 * Morphing Progress Bar
 *
 * Progress bar with color morphing based on progress value
 */
export interface MorphingProgressProps {
  /** Progress value (0-100) */
  value: number
  /** Color stops for different progress levels */
  colorStops?: { value: number; color: string }[]
  /** Duration in ms */
  duration?: number
  /** Height in pixels */
  height?: number
  /** Show label */
  showLabel?: boolean
  /** Custom CSS class names */
  className?: string
}

export function MorphingProgress({
  value,
  colorStops = [
    { value: 0, color: '#ef4444' },
    { value: 33, color: '#f59e0b' },
    { value: 66, color: '#10b981' },
    { value: 100, color: '#3b82f6' }
  ],
  duration = 300,
  height = 8,
  showLabel = false,
  className
}: MorphingProgressProps) {
  const [prevValue, setPrevValue] = React.useState(value)
  const [currentColor, setCurrentColor] = React.useState(
    interpolateColor(
      colorStops[0].color,
      colorStops[colorStops.length - 1].color,
      value / 100
    )
  )

  // Update color when value changes
  React.useEffect(() => {
    // Find surrounding color stops
    let startStop = colorStops[0]
    let endStop = colorStops[colorStops.length - 1]

    for (let i = 0; i < colorStops.length - 1; i++) {
      if (value >= colorStops[i].value && value <= colorStops[i + 1].value) {
        startStop = colorStops[i]
        endStop = colorStops[i + 1]
        break
      }
    }

    const range = endStop.value - startStop.value
    const t = range === 0 ? 0 : (value - startStop.value) / range

    const fromColor = interpolateColor(
      colorStops[0].color,
      colorStops[colorStops.length - 1].color,
      prevValue / 100
    )

    const toColor = interpolateColor(startStop.color, endStop.color, t)

    // Animate color
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      setCurrentColor(interpolateColor(fromColor, toColor, progress))

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
    setPrevValue(value)
  }, [value, colorStops, prevValue, duration])

  return (
    <div className={cn('relative', className)}>
      <div
        className="w-full bg-muted rounded-full overflow-hidden"
        style={{ height }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: currentColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
          transition={{ duration: duration / 1000, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-muted-foreground">
          {Math.round(value)}%
        </span>
      )}
    </div>
  )
}

/**
 * Morphing Text Gradient
 *
 * Text with animated gradient background
 */
export interface MorphingTextGradientProps {
  children: string
  /** Gradient colors */
  colors?: string[]
  /** Animation duration in seconds */
  duration?: number
  /** Custom CSS class names */
  className?: string
}

export function MorphingTextGradient({
  children,
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6'],
  duration = 5,
  className
}: MorphingTextGradientProps) {
  const shouldAnimate = !prefersReducedMotion()

  return (
    <motion.span
      className={cn(
        'bg-clip-text text-transparent bg-gradient-to-r',
        className
      )}
      style={{
        backgroundImage: shouldAnimate
          ? `linear-gradient(to right, ${colors.join(', ')})`
          : `linear-gradient(to right, ${colors[0]}, ${colors[1]})`,
        backgroundSize: shouldAnimate ? '300% 100%' : '100% 100%'
      }}
      animate={
        shouldAnimate
          ? {
              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
            }
          : undefined
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children}
    </motion.span>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ColorMorph
