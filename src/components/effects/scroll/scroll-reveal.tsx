/**
 * Scroll Reveal Component
 *
 * Elements animate into view as they scroll into the viewport.
 * Uses Intersection Observer for efficient detection.
 *
 * Features:
 * - Multiple reveal directions (up, down, left, right, fade)
 * - Stagger support for child elements
 * - Configurable thresholds and delays
 * - prefers-reduced-motion support
 * - Custom easing and duration
 *
 * @example
 * ```tsx
 * import { ScrollReveal } from "./scroll-reveal"
 *
 * <ScrollReveal direction="up" delay={100}>
 *   <p>This content reveals when scrolled into view</p>
 * </ScrollReveal>
 *
 * // With stagger
 * <ScrollReveal stagger={0.1}>
 *   {items.map((item) => (
 *     <div key={item.id}>{item.content}</div>
 *   ))}
 * </ScrollReveal>
 * ```
 */

import * as React from "react"
import { motion, Variants, useReducedMotion } from "framer-motion"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Reveal direction
 */
export type RevealDirection = "up" | "down" | "left" | "right" | "fade" | "scale" | "blur" | "flip"

/**
 * Reveal preset
 */
export type RevealPreset =
  | "fade"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleIn"
  | "blurIn"
  | "flip"

/**
 * Scroll reveal configuration
 */
export interface ScrollRevealConfig {
  /** Reveal direction */
  direction?: RevealDirection
  /** Distance to travel during animation (px) */
  distance?: number
  /** Animation duration in ms */
  duration?: number
  /** Animation delay in ms */
  delay?: number
  /** Stagger children animation delay (s) */
  stagger?: number
  /** Stagger from first or last child */
  staggerFrom?: "first" | "last" | "center"
  /** Intersection threshold (0-1) */
  threshold?: number | number[]
  /** Root margin for trigger */
  rootMargin?: string
  /** Only animate once */
  once?: boolean
  /** Easing function */
  easing?: string
  /** Custom variants */
  variants?: Variants
  /** Initial opacity */
  initialOpacity?: number
}

/**
 * Scroll reveal props
 */
export interface ScrollRevealProps extends ScrollRevealConfig, Omit<React.HTMLAttributes<HTMLElement>, "variants"> {
  /** Child elements */
  children: React.ReactNode
  /** Tag name */
  as?: keyof JSX.IntrinsicElements
  /** Disable animation */
  disabled?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default reveal configuration
 */
export const DEFAULT_REVEAL_CONFIG: Required<Omit<ScrollRevealConfig, "variants" | "stagger" | "staggerFrom" | "threshold" | "rootMargin">> = {
  direction: "up",
  distance: 30,
  duration: 600,
  delay: 0,
  initialOpacity: 0,
  easing: "ease-out",
  once: true,
}

/**
 * Reveal presets
 */
export const REVEAL_PRESETS: Record<RevealPreset, ScrollRevealConfig> = {
  fade: {
    direction: "fade",
    distance: 0,
    duration: 500,
    initialOpacity: 0,
  },
  slideUp: {
    direction: "up",
    distance: 40,
    duration: 600,
    initialOpacity: 0,
  },
  slideDown: {
    direction: "down",
    distance: 40,
    duration: 600,
    initialOpacity: 0,
  },
  slideLeft: {
    direction: "left",
    distance: 40,
    duration: 600,
    initialOpacity: 0,
  },
  slideRight: {
    direction: "right",
    distance: 40,
    duration: 600,
    initialOpacity: 0,
  },
  scaleIn: {
    direction: "scale",
    distance: 0,
    duration: 500,
    initialOpacity: 0,
  },
  blurIn: {
    direction: "fade",
    distance: 20,
    duration: 600,
    initialOpacity: 0,
  },
  flip: {
    direction: "fade",
    distance: 0,
    duration: 700,
    initialOpacity: 0,
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get reveal variants based on direction
 */
function getRevealVariants(config: Required<Omit<ScrollRevealConfig, "variants" | "stagger" | "staggerFrom" | "threshold" | "rootMargin">>): Variants {
  const { direction, distance, initialOpacity } = config

  const hidden: Record<string, any> = { opacity: initialOpacity }
  const visible: Record<string, any> = { opacity: 1 }

  switch (direction) {
    case "up":
      hidden.y = distance
      visible.y = 0
      break
    case "down":
      hidden.y = -distance
      visible.y = 0
      break
    case "left":
      hidden.x = distance
      visible.x = 0
      break
    case "right":
      hidden.x = -distance
      visible.x = 0
      break
    case "scale":
      hidden.scale = 0.9
      visible.scale = 1
      break
    case "fade":
      // Only opacity changes
      break
  }

  return {
    hidden,
    visible: {
      ...visible,
      transition: {
        duration: config.duration / 1000,
        delay: config.delay / 1000,
        ease: config.easing,
      },
    },
  }
}

/**
 * Get blur reveal variants
 */
function getBlurRevealVariants(config: typeof DEFAULT_REVEAL_CONFIG): Variants {
  return {
    hidden: {
      opacity: config.initialOpacity,
      filter: "blur(10px)",
      y: config.distance,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        duration: config.duration / 1000,
        delay: config.delay / 1000,
        ease: config.easing,
      },
    },
  }
}

/**
 * Get flip reveal variants
 */
function getFlipRevealVariants(config: typeof DEFAULT_REVEAL_CONFIG): Variants {
  return {
    hidden: {
      opacity: config.initialOpacity,
      rotateX: -90,
      y: config.distance,
    },
    visible: {
      opacity: 1,
      rotateX: 0,
      y: 0,
      transition: {
        duration: config.duration / 1000,
        delay: config.delay / 1000,
        ease: config.easing,
      },
    },
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ScrollReveal Component
 *
 * Wraps children and animates them into view when scrolled into viewport
 */
export const ScrollReveal = React.forwardRef<HTMLElement, ScrollRevealProps>(
  ({
    children,
    direction = "up",
    distance = 30,
    duration = 600,
    delay = 0,
    stagger,
    staggerFrom = "first",
    threshold = 0.1,
    rootMargin = "0px 0px -50px 0px",
    once = true,
    easing = "ease-out",
    variants,
    initialOpacity = 0,
    as: Tag = "div",
    disabled = false,
    className,
    style,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const [isVisible, setIsVisible] = React.useState(false)
    const elementRef = React.useRef<HTMLElement>(null)

    // Merge refs
    React.useImperativeHandle(ref, () => elementRef.current as HTMLElement)

    // Intersection Observer setup
    React.useEffect(() => {
      const element = elementRef.current
      if (!element || disabled || prefersReducedMotion) {
        setIsVisible(true)
        return
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            if (once) {
              observer.disconnect()
            }
          } else if (!once) {
            setIsVisible(false)
          }
        },
        { threshold, rootMargin }
      )

      observer.observe(element)

      return () => observer.disconnect()
    }, [threshold, rootMargin, once, disabled, prefersReducedMotion])

    // Build variants
    const finalVariants = variants || (
      direction === "blur" ? getBlurRevealVariants({ direction, distance, duration, delay, initialOpacity, easing, once })
      : direction === "flip" ? getFlipRevealVariants({ direction, distance, duration, delay, initialOpacity, easing, once })
      : getRevealVariants({ direction, distance, duration, delay, initialOpacity, easing, once })
    )

    // Container variants for stagger
    const containerVariants: Variants | undefined = stagger
      ? {
          visible: {
            transition: {
              staggerChildren: stagger,
              delayChildren: delay / 1000,
              staggerDirection: staggerFrom === "last" ? -1 : 1,
            },
          },
        }
      : undefined

    // Should animate
    const shouldAnimate = !disabled && !prefersReducedMotion

    return React.createElement(
      Tag,
      {
        ref: elementRef,
        className,
        style,
        ...props,
      } as any,
      shouldAnimate ? (
        <motion.div
          initial="hidden"
          animate={isVisible ? "visible" : "hidden"}
          variants={containerVariants || finalVariants}
        >
          {containerVariants ? (
            <motion.div variants={finalVariants}>
              {children}
            </motion.div>
          ) : (
            children
          )}
        </motion.div>
      ) : (
        children
      )
    )
  }
)

ScrollReveal.displayName = "ScrollReveal"

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * ScrollRevealFade - Fade in reveal
 */
export const ScrollRevealFade = React.forwardRef<HTMLElement, Omit<ScrollRevealProps, "direction">>((props, ref) => (
  <ScrollReveal ref={ref} direction="fade" {...props} />
))
ScrollRevealFade.displayName = "ScrollRevealFade"

/**
 * ScrollRevealUp - Slide up reveal
 */
export const ScrollRevealUp = React.forwardRef<HTMLElement, Omit<ScrollRevealProps, "direction">>((props, ref) => (
  <ScrollReveal ref={ref} direction="up" {...props} />
))
ScrollRevealUp.displayName = "ScrollRevealUp"

/**
 * ScrollRevealDown - Slide down reveal
 */
export const ScrollRevealDown = React.forwardRef<HTMLElement, Omit<ScrollRevealProps, "direction">>((props, ref) => (
  <ScrollReveal ref={ref} direction="down" {...props} />
))
ScrollRevealDown.displayName = "ScrollRevealDown"

/**
 * ScrollRevealLeft - Slide left reveal
 */
export const ScrollRevealLeft = React.forwardRef<HTMLElement, Omit<ScrollRevealProps, "direction">>((props, ref) => (
  <ScrollReveal ref={ref} direction="left" {...props} />
))
ScrollRevealLeft.displayName = "ScrollRevealLeft"

/**
 * ScrollRevealRight - Slide right reveal
 */
export const ScrollRevealRight = React.forwardRef<HTMLElement, Omit<ScrollRevealProps, "direction">>((props, ref) => (
  <ScrollReveal ref={ref} direction="right" {...props} />
))
ScrollRevealRight.displayName = "ScrollRevealRight"

/**
 * ScrollRevealScale - Scale in reveal
 */
export const ScrollRevealScale = React.forwardRef<HTMLElement, Omit<ScrollRevealProps, "direction">>((props, ref) => (
  <ScrollReveal ref={ref} direction="scale" {...props} />
))
ScrollRevealScale.displayName = "ScrollRevealScale"

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Apply reveal preset
 */
export function applyRevealPreset(
  preset: RevealPreset,
  customConfig?: Partial<ScrollRevealConfig>
): ScrollRevealConfig {
  return { ...REVEAL_PRESETS[preset], ...customConfig }
}
