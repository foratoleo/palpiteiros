/**
 * Gradient Animation Component
 *
 * T30.4: Animated gradient backgrounds with smooth color transitions.
 * Supports multiple gradient types, animation patterns, and customization.
 *
 * @features
 * - Linear, radial, and conic gradients
 * - Multi-color animation
 * - Configurable animation patterns (wave, pulse, flow, shift)
 * - Reduced motion support
 * - Performance optimized with CSS transforms
 *
 * @example
 * ```tsx
 * import { AnimatedGradient } from '@/components/effects/colors/gradient-animation'
 *
 * <AnimatedGradient
 *   colors={['#3b82f6', '#8b5cf6', '#ec4899']}
 *   pattern="wave"
 *   duration={10}
 * >
 *   <div>Content</div>
 * </AnimatedGradient>
 * ```
 */

'use client'

import * as React from 'react'
import { motion, MotionValue, useMotionValue, useTransform, useSpring } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type GradientType = 'linear' | 'radial' | 'conic'

export type AnimationPattern = 'wave' | 'pulse' | 'flow' | 'shift' | 'mesh'

export interface GradientStop {
  color: string
  position?: number // 0-1
}

export interface AnimatedGradientProps {
  children?: React.ReactNode
  /** Colors for the gradient */
  colors?: string[]
  /** Gradient stops with positions */
  stops?: GradientStop[]
  /** Type of gradient */
  type?: GradientType
  /** Animation pattern */
  pattern?: AnimationPattern
  /** Animation duration in seconds */
  duration?: number
  /** Custom easing */
  easing?: string
  /** Gradient angle (for linear) */
  angle?: number
  /** Gradient direction (for linear) */
  direction?: string
  /** Center position (for radial) */
  center?: { x: string; y: string }
  /** Enable mouse tracking */
  mouseTrack?: boolean
  /** Mouse influence strength (0-1) */
  mouseInfluence?: number
  /** Custom CSS class names */
  className?: string
  /** Content wrapper class */
  contentClassName?: string
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean
}

export interface UseAnimatedGradientOptions {
  colors: string[]
  duration?: number
  pattern?: AnimationPattern
  respectReducedMotion?: boolean
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for mouse position tracking
 */
function useMousePosition(elementRef: React.RefObject<HTMLElement>, influence: number = 0.5) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  React.useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      // Calculate normalized position (-1 to 1)
      const normX = ((e.clientX - centerX) / (rect.width / 2)) * influence
      const normY = ((e.clientY - centerY) / (rect.height / 2)) * influence

      x.set(normX)
      y.set(normY)
    }

    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    element.addEventListener('mousemove', handleMouseMove)
    element.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      element.removeEventListener('mousemove', handleMouseMove)
      element.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [elementRef, influence, x, y])

  return { x, y }
}

/**
 * Hook for animated gradient background
 */
export function useAnimatedGradient({
  colors,
  duration = 10,
  pattern = 'wave',
  respectReducedMotion = true
}: UseAnimatedGradientOptions) {
  const shouldAnimate = !respectReducedMotion || !React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Create animated values based on pattern
  const time = useMotionValue(0)

  const gradientStyle = React.useMemo(() => {
    const colorString = colors.join(', ')

    switch (pattern) {
      case 'wave':
        return {
          background: `linear-gradient(45deg, ${colorString})`,
          backgroundSize: '300% 300%'
        }
      case 'pulse':
        return {
          background: `radial-gradient(circle at center, ${colorString})`,
          backgroundSize: '200% 200%'
        }
      case 'flow':
        return {
          background: `linear-gradient(90deg, ${colorString})`,
          backgroundSize: '200% 100%'
        }
      case 'shift':
        return {
          background: `linear-gradient(135deg, ${colorString})`,
          backgroundSize: '400% 400%'
        }
      case 'mesh':
        return {
          backgroundImage: `
            radial-gradient(at 40% 20%, ${colors[0]} 0px, transparent 50%),
            radial-gradient(at 80% 0%, ${colors[1] || colors[0]} 0px, transparent 50%),
            radial-gradient(at 0% 50%, ${colors[2] || colors[0]} 0px, transparent 50%),
            radial-gradient(at 80% 50%, ${colors[3] || colors[0]} 0px, transparent 50%),
            radial-gradient(at 0% 100%, ${colors[4] || colors[0]} 0px, transparent 50%),
            radial-gradient(at 80% 100%, ${colors[5] || colors[0]} 0px, transparent 50%)
          `
        }
      default:
        return {
          background: `linear-gradient(45deg, ${colorString})`,
          backgroundSize: '300% 300%'
        }
    }
  }, [colors, pattern])

  const animateProps = shouldAnimate ? {
    backgroundPosition: pattern === 'wave' || pattern === 'shift'
      ? ['0% 0%', '100% 100%', '0% 0%']
      : pattern === 'pulse'
        ? ['0% 0%', '100% 100%', '0% 0%']
        : ['0% 50%', '100% 50%', '0% 50%']
  } : undefined

  const transition = shouldAnimate ? {
    duration,
    repeat: Infinity,
    ease: 'linear'
  } : undefined

  return {
    gradientStyle,
    animateProps,
    transition,
    shouldAnimate
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Animated Gradient Component
 *
 * Container with animated gradient background
 */
export function AnimatedGradient({
  children,
  colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#3b82f6'],
  stops,
  type = 'linear',
  pattern = 'wave',
  duration = 10,
  easing = 'linear',
  angle = 45,
  direction,
  center = { x: '50%', y: '50%' },
  mouseTrack = false,
  mouseInfluence = 0.3,
  className,
  contentClassName,
  respectReducedMotion = true
}: AnimatedGradientProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)

  // Process colors from stops if provided
  const processedColors = React.useMemo(() => {
    if (stops) {
      return stops.map((s) => s.color)
    }
    return colors
  }, [stops, colors])

  const { gradientStyle, animateProps, transition, shouldAnimate } = useAnimatedGradient({
    colors: processedColors,
    duration,
    pattern,
    respectReducedMotion
  })

  const { x, y } = useMousePosition(mouseTrack ? containerRef : { current: null }, mouseInfluence)

  // Spring-smoothed mouse values
  const springX = useSpring(x, { stiffness: 300, damping: 30 })
  const springY = useSpring(y, { stiffness: 300, damping: 30 })

  // Transform background position based on mouse
  const backgroundPosition = useTransform(
    [springX, springY],
    ([latestX, latestY]: number[]) => {
      const baseX = 50
      const baseY = 50
      return `${baseX + latestX * 10}% ${baseY + latestY * 10}%`
    }
  )

  return (
    <motion.div
      ref={containerRef}
      className={cn('animated-gradient-container', className)}
      style={{
        ...gradientStyle,
        backgroundPosition: mouseTrack ? backgroundPosition as any : undefined,
        transform: mouseTrack ? 'perspective(1000px)' : undefined
      }}
      animate={mouseTrack ? undefined : animateProps}
      transition={mouseTrack ? undefined : transition}
    >
      <div className={cn('animated-gradient-content relative z-10', contentClassName)}>
        {children}
      </div>
    </motion.div>
  )
}

/**
 * Aurora Gradient Effect
 *
 * Animated aurora-like gradient with multiple color layers
 */
export interface AuroraGradientProps {
  /** Colors for the aurora effect */
  colors?: string[]
  /** Animation speed */
  speed?: number
  /** Opacity of the effect */
  opacity?: number
  /** Blur amount */
  blur?: string
  /** Custom CSS class names */
  className?: string
  /** Children to overlay */
  children?: React.ReactNode
}

export function AuroraGradient({
  colors = ['#7c3aed', '#2563eb', '#0891b2', '#7c3aed'],
  speed = 20,
  opacity = 0.6,
  blur = '100px',
  className,
  children
}: AuroraGradientProps) {
  const shouldAnimate = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Aurora background */}
      <motion.div
        className="absolute inset-0"
        style={{
          opacity,
          filter: `blur(${blur})`,
          background: `
            radial-gradient(ellipse 80% 50% at 50% -20%, ${colors[0]}, transparent),
            radial-gradient(ellipse 60% 40% at 80% 50%, ${colors[1]}, transparent),
            radial-gradient(ellipse 50% 30% at 20% 80%, ${colors[2]}, transparent)
          `
        }}
        animate={
          shouldAnimate
            ? {
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%']
              }
            : undefined
        }
        transition={{
          duration: speed,
          repeat: Infinity,
          ease: 'linear'
        }}
      />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}

/**
 * Mesh Gradient Component
 *
 * Complex mesh gradient with multiple color points
 */
export interface MeshGradientProps {
  /** Color stops for the mesh */
  colors?: string[]
  /** Animation duration */
  duration?: number
  /** Custom CSS class names */
  className?: string
  /** Content to overlay */
  children?: React.ReactNode
}

export function MeshGradient({
  colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f9d423'],
  duration = 15,
  className,
  children
}: MeshGradientProps) {
  const shouldAnimate = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  // Generate mesh gradient styles
  const meshGradient = React.useMemo(() => {
    const positions = [
      'at 0% 0%',
      'at 100% 0%',
      'at 0% 100%',
      'at 100% 100%',
      'at 50% 50%'
    ]

    return positions
      .map((pos, i) => `radial-gradient(${pos} ${colors[i % colors.length]}, transparent)`)
      .join(', ')
  }, [colors])

  return (
    <motion.div
      className={cn('mesh-gradient-container', className)}
      style={{
        backgroundImage: meshGradient,
        backgroundSize: '200% 200%'
      }}
      animate={
        shouldAnimate
          ? {
              backgroundPosition: [
                '0% 0%',
                '100% 0%',
                '100% 100%',
                '0% 100%',
                '0% 0%'
              ]
            }
          : undefined
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear'
      }}
    >
      {children && <div className="relative z-10">{children}</div>}
    </motion.div>
  )
}

/**
 * Shimmer Gradient Effect
 *
 * Subtle shimmer animation for loading states or highlights
 */
export interface ShimmerGradientProps {
  /** Shimmer direction */
  direction?: 'left' | 'right' | 'top' | 'bottom'
  /** Shimmer color */
  color?: string
  /** Animation duration in seconds */
  duration?: number
  /** Custom CSS class names */
  className?: string
  /** Whether to show shimmer */
  show?: boolean
}

export function ShimmerGradient({
  direction = 'right',
  color = 'rgba(255, 255, 255, 0.3)',
  duration = 2,
  className,
  show = true
}: ShimmerGradientProps) {
  const shouldAnimate = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  if (!show) return null

  const gradientValue = `linear-gradient(
    ${direction === 'right' || direction === 'left' ? '90deg' : '180deg'},
    transparent 0%,
    ${color} 50%,
    transparent 100%
  )`

  return (
    <motion.div
      className={cn('absolute inset-0 pointer-events-none', className)}
      style={{ background: gradientValue, backgroundSize: '200% 100%' }}
      animate={
        shouldAnimate
          ? {
              backgroundPosition: ['200% 0%', '-200% 0%']
            }
          : undefined
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

/**
 * Conic Gradient Spinner
 *
 * Conic gradient with rotation animation
 */
export interface ConicSpinnerProps {
  /** Size in pixels */
  size?: number
  /** Colors for the gradient */
  colors?: string[]
  /** Rotation duration in seconds */
  duration?: number
  /** Custom CSS class names */
  className?: string
}

export function ConicSpinner({
  size = 40,
  colors = ['#3b82f6', 'transparent'],
  duration = 1,
  className
}: ConicSpinnerProps) {
  const shouldAnimate = React.useMemo(() => {
    if (typeof window === 'undefined') return false
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  return (
    <motion.div
      className={cn('inline-block rounded-full', className)}
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${colors.join(', ')})`,
        maskImage: 'radial-gradient(transparent 60%, black 61%)',
        WebkitMaskImage: 'radial-gradient(transparent 60%, black 61%)'
      }}
      animate={
        shouldAnimate
          ? {
              rotate: 360
            }
          : undefined
      }
      transition={{
        duration,
        repeat: Infinity,
        ease: 'linear'
      }}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AnimatedGradient
