/**
 * Scroll-Triggered Animations
 *
 * Advanced animations triggered by scroll position with support for
 * keyframes, sequences, and timeline-based animations.
 *
 * Features:
 * - Scroll-linked animations
 * - Timeline-based sequences
 * - Scrub control
 * - Pinning elements
 * - Multiple trigger points
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { ScrollTriggered } from "./scroll-triggered-animations"
 *
 * <ScrollTriggered
 *   animations={{
 *     opacity: [0, 1],
 *     scale: [0.8, 1],
 *   }}
 * >
 *   Content
 * </ScrollTriggered>
 * ```
 */

import * as React from "react"
import { motion, useReducedMotion, useScroll, useTransform, MotionValue } from "framer-motion"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Animation keyframe values
 */
export type AnimationKeyframes = number[] | string[]

/**
 * Animation values for different properties
 */
export interface AnimationValues {
  opacity?: number[]
  scale?: number[]
  x?: number[]
  y?: number[]
  rotate?: number[]
  rotateX?: number[]
  rotateY?: number[]
  skewX?: number[]
  skewY?: number[]
  backgroundColor?: string[]
  color?: string[]
}

/**
 * Scroll trigger configuration
 */
export interface ScrollTriggerConfig {
  /** Animation values keyed by CSS property */
  animations: AnimationValues
  /** Scroll position offset [start, end] (0-1) */
  offset?: [number, number]
  /** Scrub animation (smooth following) or snap */
  scrub?: boolean
  /** Pin element during animation */
  pin?: boolean
  /** Container ref for scroll tracking */
  containerRef?: React.RefObject<HTMLElement>
  /** Easing function for scrub */
  ease?: string | number[]
  /** Animation duration (non-scrub mode) */
  duration?: number
}

/**
 * Scroll triggered props
 */
export interface ScrollTriggeredProps extends ScrollTriggerConfig, Omit<React.HTMLAttributes<HTMLElement>, "ref"> {
  /** Child elements */
  children: React.ReactNode
  /** Tag name */
  as?: keyof JSX.IntrinsicElements
  /** Disabled state */
  disabled?: boolean
}

/**
 * Timeline animation step
 */
export interface TimelineStep {
  /** Animation values for this step */
  animations: AnimationValues
  /** Position in timeline (0-1) */
  at: number
  /** Duration of this step (0-1) */
  duration?: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default easing functions
 */
export const EASING_FUNCTIONS = {
  linear: [0, 0, 1, 1] as const,
  ease: [0.25, 0.1, 0.25, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,
  circIn: [0.6, 0.04, 0.98, 0.335] as const,
  circOut: [0.075, 0.82, 0.165, 1] as const,
  circInOut: [0.785, 0.135, 0.15, 0.86] as const,
  backIn: [0.6, -0.28, 0.735, 0.045] as const,
  backOut: [0.175, 0.885, 0.32, 1.275] as const,
  backInOut: [0.68, -0.55, 0.265, 1.55] as const,
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create scroll-linked animation value
 */
function useScrollAnimation(
  scrollProgress: MotionValue<number>,
  keyframes: number[],
  ease?: string | number[]
): MotionValue<number> {
  return useTransform(scrollProgress, [0, 1], keyframes as [number, number], {
    ease: ease as any,
  })
}

/**
 * Create scroll-linked color value
 */
function useScrollColorAnimation(
  scrollProgress: MotionValue<number>,
  keyframes: string[]
): MotionValue<string> {
  return useTransform(scrollProgress, [0, 1], keyframes as [string, string])
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * ScrollTriggered Component
 *
 * Animates children based on scroll position
 */
export const ScrollTriggered = React.forwardRef<HTMLElement, ScrollTriggeredProps>(
  ({
    children,
    animations,
    offset = [0, 1],
    scrub = true,
    pin = false,
    containerRef,
    ease = "linear",
    duration = 0.5,
    disabled = false,
    as: Tag = "div",
    className,
    style,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const internalRef = React.useRef<HTMLElement>(null)

    // Merge refs
    React.useImperativeHandle(ref, () => internalRef.current as HTMLElement)

    // Track scroll progress
    const { scrollYProgress } = useScroll({
      target: containerRef || internalRef,
      offset: offset as any,
    })

    // Build animation values
    const motionStyle: Record<string, MotionValue<any>> = {}

    if (!disabled && !prefersReducedMotion) {
      if (animations.opacity) {
        motionStyle.opacity = useScrollAnimation(scrollYProgress, animations.opacity, ease)
      }
      if (animations.scale) {
        motionStyle.scale = useScrollAnimation(scrollYProgress, animations.scale, ease)
      }
      if (animations.x) {
        motionStyle.x = useScrollAnimation(scrollYProgress, animations.x, ease)
      }
      if (animations.y) {
        motionStyle.y = useScrollAnimation(scrollYProgress, animations.y, ease)
      }
      if (animations.rotate) {
        motionStyle.rotate = useScrollAnimation(scrollYProgress, animations.rotate, ease)
      }
      if (animations.rotateX) {
        motionStyle.rotateX = useScrollAnimation(scrollYProgress, animations.rotateX, ease)
      }
      if (animations.rotateY) {
        motionStyle.rotateY = useScrollAnimation(scrollYProgress, animations.rotateY, ease)
      }
      if (animations.skewX) {
        motionStyle.skewX = useScrollAnimation(scrollYProgress, animations.skewX, ease)
      }
      if (animations.skewY) {
        motionStyle.skewY = useScrollAnimation(scrollYProgress, animations.skewY, ease)
      }
      if (animations.backgroundColor) {
        motionStyle.backgroundColor = useScrollColorAnimation(scrollYProgress, animations.backgroundColor)
      }
      if (animations.color) {
        motionStyle.color = useScrollColorAnimation(scrollYProgress, animations.color)
      }
    }

    return React.createElement(
      Tag,
      {
        ref: internalRef,
        className,
        style: { ...style, ...motionStyle } as any,
        ...props,
      } as any,
      children
    )
  }
)

ScrollTriggered.displayName = "ScrollTriggered"

// ============================================================================
// TIMELINE COMPONENT
// ============================================================================

/**
 * ScrollTimeline Component
 *
 * Creates a timeline of animations triggered at different scroll positions
 */
export interface ScrollTimelineProps extends Omit<React.HTMLAttributes<HTMLElement>, "ref"> {
  /** Timeline steps */
  steps: TimelineStep[]
  /** Container ref for scroll tracking */
  containerRef?: React.RefObject<HTMLElement>
  /** Child elements */
  children: React.ReactNode
  /** Tag name */
  as?: keyof JSX.IntrinsicElements
}

export function ScrollTimeline({
  steps,
  containerRef,
  children,
  as: Tag = "div",
  className,
  style,
  ...props
}: ScrollTimelineProps) {
  const prefersReducedMotion = useReducedMotion()
  const ref = React.useRef<HTMLElement>(null)
  const [currentStep, setCurrentStep] = React.useState(0)

  // Track scroll progress
  const { scrollYProgress } = useScroll({
    target: containerRef || ref,
  })

  // Determine current step based on scroll progress
  React.useEffect(() => {
    if (prefersReducedMotion) return

    const unsubscribe = scrollYProgress.on("change", (progress) => {
      const stepIndex = steps.findIndex((step, index) => {
        const nextStep = steps[index + 1]
        return progress >= step.at && (!nextStep || progress < nextStep.at)
      })
      setCurrentStep(stepIndex >= 0 ? stepIndex : steps.length - 1)
    })

    return unsubscribe
  }, [scrollYProgress, steps, prefersReducedMotion])

  // Get current animations
  const currentAnimations = steps[currentStep]?.animations || {}

  return React.createElement(
    Tag,
    {
      ref,
      className,
      ...props,
    } as any,
    <motion.div
      animate={(prefersReducedMotion ? {} : currentAnimations) as any}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * Fade in on scroll
 */
export const ScrollFadeIn = React.forwardRef<HTMLElement, Omit<ScrollTriggeredProps, "animations">>((props, ref) => (
  <ScrollTriggered
    ref={ref}
    animations={{ opacity: [0, 1] }}
    {...props}
  />
))
ScrollFadeIn.displayName = "ScrollFadeIn"

/**
 * Scale in on scroll
 */
export const ScrollScaleIn = React.forwardRef<HTMLElement, Omit<ScrollTriggeredProps, "animations">>((props, ref) => (
  <ScrollTriggered
    ref={ref}
    animations={{ scale: [0.8, 1], opacity: [0, 1] }}
    {...props}
  />
))
ScrollScaleIn.displayName = "ScrollScaleIn"

/**
 * Slide up on scroll
 */
export const ScrollSlideUp = React.forwardRef<HTMLElement, Omit<ScrollTriggeredProps, "animations">>((props, ref) => (
  <ScrollTriggered
    ref={ref}
    animations={{ y: [50, 0], opacity: [0, 1] }}
    {...props}
  />
))
ScrollSlideUp.displayName = "ScrollSlideUp"

/**
 * Rotate on scroll
 */
export const ScrollRotate = React.forwardRef<HTMLElement, Omit<ScrollTriggeredProps, "animations">>((props, ref) => (
  <ScrollTriggered
    ref={ref}
    animations={{ rotate: [0, 360] }}
    {...props}
  />
))
ScrollRotate.displayName = "ScrollRotate"

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Use scroll animation value
 * Returns a MotionValue linked to scroll progress
 */
export function useScrollAnimationValue(
  keyframes: number[],
  config?: {
    containerRef?: React.RefObject<HTMLElement>
    offset?: [number, number]
    ease?: string | number[]
  }
): MotionValue<number> {
  const { scrollYProgress } = useScroll({
    target: config?.containerRef,
    offset: (config?.offset as any) || ["0 0", "1 0"],
  })

  return useTransform(scrollYProgress, [0, 1], keyframes as [number, number], {
    ease: config?.ease as any,
  })
}

/**
 * Use scroll-triggered animation
 * Returns animation state based on scroll position
 */
export function useScrollTrigger(
  trigger: number, // 0-1
  config?: {
    containerRef?: React.RefObject<HTMLElement>
    offset?: [number, number]
  }
): boolean {
  const { scrollYProgress } = useScroll({
    target: config?.containerRef,
    offset: (config?.offset as any) || ["0 0", "1 0"],
  })

  const [isTriggered, setIsTriggered] = React.useState(false)

  React.useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (progress) => {
      setIsTriggered(progress >= trigger)
    })
    return unsubscribe
  }, [scrollYProgress, trigger])

  return isTriggered
}
