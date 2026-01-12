/**
 * Parallax Scroll Component
 *
 * Creates parallax effects where elements move at different speeds during scroll.
 * Uses RAF throttling for smooth 60fps performance.
 *
 * Features:
 * - Variable scroll speed (0-2x)
 * - Horizontal and vertical parallax
 * - Multiple parallax layers
 * - Performance optimized (RAF throttling)
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { ParallaxScroll } from "./parallax-scroll"
 *
 * <ParallaxScroll speed={0.5}>
 *   <div>This moves at half speed</div>
 * </ParallaxScroll>
 *
 * // Multiple layers
 * <div>
 *   <ParallaxScroll speed={0.2}><Background /></ParallaxScroll>
 *   <ParallaxScroll speed={0.5}><Midground /></ParallaxScroll>
 *   <ParallaxScroll speed={1}><Foreground /></ParallaxScroll>
 * </div>
 * ```
 */

import * as React from "react"
import { motion, useReducedMotion, useTransform, useScroll } from "framer-motion"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Parallax axis
 */
export type ParallaxAxis = "x" | "y" | "both"

/**
 * Parallax scroll configuration
 */
export interface ParallaxScrollConfig {
  /** Scroll speed multiplier (0 = no movement, 1 = normal, 2 = 2x speed) */
  speed?: number
  /** Axis to apply parallax effect */
  axis?: ParallaxAxis
  /** Offset from viewport center for scroll trigger (0-1) */
  offset?: [number, number]
  /** Disable parallax (keep element static) */
  disabled?: boolean
  /** Enable smooth damping for parallax */
  damping?: number
  /** Maximum translation distance in pixels */
  maxTranslate?: number
}

/**
 * Parallax scroll props
 */
export interface ParallaxScrollProps extends ParallaxScrollConfig, Omit<React.HTMLAttributes<HTMLElement>, "ref"> {
  /** Child elements */
  children: React.ReactNode
  /** Tag name */
  as?: keyof JSX.IntrinsicElements
  /** Container ref for scroll tracking */
  containerRef?: React.RefObject<HTMLElement>
}

/**
 * Parallax layer configuration
 */
export interface ParallaxLayer {
  /** Layer content */
  children: React.ReactNode
  /** Scroll speed (lower = background, higher = foreground) */
  speed: number
  /** Layer z-index */
  zIndex?: number
  /** Layer className */
  className?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default parallax configuration
 */
export const DEFAULT_PARALLAX_CONFIG: Required<Omit<ParallaxScrollConfig, "containerRef">> = {
  speed: 0.5,
  axis: "y",
  offset: [0, 1],
  disabled: false,
  damping: 0,
  maxTranslate: Infinity,
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * ParallaxScroll Component
 *
 * Applies parallax effect to children based on scroll position
 */
export const ParallaxScroll = React.forwardRef<HTMLElement, ParallaxScrollProps>(
  ({
    children,
    speed = 0.5,
    axis = "y",
    offset = [0, 1],
    disabled = false,
    damping = 0,
    maxTranslate = Infinity,
    as: Tag = "div",
    containerRef,
    className,
    style,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const internalRef = React.useRef<HTMLElement>(null)

    // Merge refs
    React.useImperativeHandle(ref, () => internalRef.current as HTMLElement)

    // Setup scroll tracking
    const { scrollYProgress } = useScroll({
      target: containerRef,
      offset: offset as any,
    })

    // Calculate parallax transform
    let transform: any

    if (disabled || prefersReducedMotion) {
      transform = useTransform(scrollYProgress, [0, 1], [0, 0])
    } else {
      switch (axis) {
        case "y":
          transform = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -window.innerHeight * speed].map(v => {
              const clamped = Math.max(-maxTranslate, Math.min(maxTranslate, v))
              return clamped
            })
          )
          break
        case "x":
          transform = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -window.innerWidth * speed].map(v => {
              const clamped = Math.max(-maxTranslate, Math.min(maxTranslate, v))
              return clamped
            })
          )
          break
        case "both":
          // Diagonal parallax
          const yTransform = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -window.innerHeight * speed * 0.7].map(v => Math.max(-maxTranslate, Math.min(maxTranslate, v)))
          )
          const xTransform = useTransform(
            scrollYProgress,
            [0, 1],
            [0, -window.innerWidth * speed * 0.3].map(v => Math.max(-maxTranslate, Math.min(maxTranslate, v)))
          )
          transform = useTransform([yTransform, xTransform], ([y, x]) => `translate(${x}px, ${y}px)`)
          break
      }
    }

    // Build style object
    const motionStyle: React.CSSProperties = {
      ...style,
      willChange: prefersReducedMotion ? undefined : "transform",
    }

    // Apply transform based on axis
    if (axis === "both" && typeof transform === "object" && "get" in transform) {
      // transform is a MotionValue that returns a string
      // We'll use it directly in the style prop
      motionStyle.transform = transform as any
    } else if (typeof transform !== "object" || !("get" in transform)) {
      motionStyle.y = axis === "y" ? transform : undefined
      motionStyle.x = axis === "x" ? transform : undefined
    } else if (axis !== "both") {
      motionStyle[axis] = transform
    }

    return React.createElement(
      Tag,
      {
        ref: internalRef,
        className,
        ...props,
      } as any,
      <motion.div style={motionStyle}>
        {children}
      </motion.div>
    )
  }
)

ParallaxScroll.displayName = "ParallaxScroll"

// ============================================================================
// MULTI-LAYER COMPONENT
// ============================================================================

/**
 * ParallaxLayers Component
 *
 * Container for multiple parallax layers with different speeds
 */
export interface ParallaxLayersProps {
  /** Parallax layers to render */
  layers: ParallaxLayer[]
  /** Container className */
  className?: string
  /** Container style */
  style?: React.CSSProperties
  /** Scroll offset */
  offset?: [number, number]
}

export function ParallaxLayers({
  layers,
  className,
  style,
  offset = [0, 1],
}: ParallaxLayersProps) {
  // Sort layers by speed (lowest = background, highest = foreground)
  const sortedLayers = React.useMemo(
    () => [...layers].sort((a, b) => a.speed - b.speed),
    [layers]
  )

  return (
    <div className={className} style={{ position: "relative", ...style }}>
      {sortedLayers.map((layer, index) => (
        <ParallaxScroll
          key={`layer-${index}`}
          speed={layer.speed}
          offset={offset}
          className={layer.className}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: layer.zIndex ?? index,
          }}
        >
          {layer.children}
        </ParallaxScroll>
      ))}
    </div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * ParallaxBackground - Slow moving background layer
 */
export const ParallaxBackground = React.forwardRef<HTMLElement, Omit<ParallaxScrollProps, "speed">>((props, ref) => (
  <ParallaxScroll ref={ref} speed={0.2} {...props} />
))
ParallaxBackground.displayName = "ParallaxBackground"

/**
 * ParallaxForeground - Normal speed foreground layer
 */
export const ParallaxForeground = React.forwardRef<HTMLElement, Omit<ParallaxScrollProps, "speed">>((props, ref) => (
  <ParallaxScroll ref={ref} speed={1} {...props} />
))
ParallaxForeground.displayName = "ParallaxForeground"

/**
 * ParallaxDeep - Very deep layer (very slow movement)
 */
export const ParallaxDeep = React.forwardRef<HTMLElement, Omit<ParallaxScrollProps, "speed">>((props, ref) => (
  <ParallaxScroll ref={ref} speed={0.1} {...props} />
))
ParallaxDeep.displayName = "ParallaxDeep"

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Use parallax transform value
 * Returns a MotionValue that can be used in custom animations
 */
export function useParallaxTransform(
  config: ParallaxScrollConfig = {}
): import("framer-motion").MotionValue<number> {
  const { speed = 0.5, axis = "y", offset = [0, 1], disabled = false, maxTranslate = Infinity } = config

  const { scrollYProgress } = useScroll({
    offset: offset as any,
  })

  if (axis === "y") {
    return useTransform(
      scrollYProgress,
      [0, 1],
      [0, -window.innerHeight * speed].map(v => Math.max(-maxTranslate, Math.min(maxTranslate, v)))
    ) as import("framer-motion").MotionValue<number>
  }

  return useTransform(
    scrollYProgress,
    [0, 1],
    [0, -window.innerWidth * speed].map(v => Math.max(-maxTranslate, Math.min(maxTranslate, v)))
  ) as import("framer-motion").MotionValue<number>
}

/**
 * Use parallax style
 * Returns a style object with parallax transform
 */
export function useParallaxStyle(
  config: ParallaxScrollConfig = {}
): React.CSSProperties {
  const transform = useParallaxTransform(config)
  const { axis = "y" } = config

  return {
    willChange: "transform",
    [axis]: transform,
  } as React.CSSProperties
}
