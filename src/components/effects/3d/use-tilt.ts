"use client"

import * as React from "react"
import { useMotionValue, useSpring, useTransform } from "framer-motion"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tilt configuration
 */
export interface TiltConfig {
  /** Maximum tilt angle in degrees */
  maxTilt?: number
  /** Enable/disable tilt */
  enabled?: boolean
  /** Enable perspective (3D effect) */
  perspective?: boolean
  /** Scale factor on hover */
  scale?: number
  /** Spring stiffness */
  stiffness?: number
  /** Spring damping */
  damping?: number
  /** Reverse tilt direction */
  reverse?: boolean
  /** Reset on mouse leave */
  resetOnLeave?: boolean
}

/**
 * Tilt values returned by useTilt hook
 */
export interface TiltValues<T extends HTMLElement = HTMLDivElement> {
  /** Rotate X value (spring-animated) */
  rotateX: React.MutableRefObject<number>
  /** Rotate Y value (spring-animated) */
  rotateY: React.MutableRefObject<number>
  /** Scale value (spring-animated) */
  scale: React.MutableRefObject<number>
  /** Current X mouse position (-1 to 1) */
  mouseX: React.MutableRefObject<number>
  /** Current Y mouse position (-1 to 1) */
  mouseY: React.MutableRefObject<number>
  /** Whether the element is hovered */
  isHovered: boolean
  /** Reset the tilt */
  reset: () => void
  /** Element ref */
  ref: React.RefObject<T>
}

/**
 * Tilt event handlers
 */
export interface TiltHandlers<T extends HTMLElement = HTMLDivElement> {
  onMouseMove: (e: React.MouseEvent<T>) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
}

// ============================================================================
// USE TILT HOOK
// ============================================================================

/**
 * useTilt Hook
 *
 * Calculates 3D tilt based on mouse position.
 * Uses Framer Motion springs for smooth animations.
 *
 * @example
 * ```tsx
 * const { ref, rotateX, rotateY, scale, handlers } = useTilt({
 *   maxTilt: 15,
 *   scale: 1.05,
 * })
 *
 * <motion.div
 *   ref={ref}
 *   style={{ rotateX, rotateY, scale }}
 *   {...handlers}
 * >
 *   Tilt me!
 * </motion.div>
 * ```
 */
export function useTilt<T extends HTMLElement = HTMLDivElement>(
  config: TiltConfig = {}
): TiltValues<T> & TiltHandlers<T> {
  const {
    maxTilt = 15,
    enabled = true,
    scale = 1.05,
    stiffness = 300,
    damping = 20,
    reverse = false,
    resetOnLeave = true,
  } = config

  const ref = React.useRef<T>(null)
  const [isHovered, setIsHovered] = React.useState(false)

  // Motion values for smooth animation
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics
  const springConfig = { stiffness, damping }

  const rotateXSpring = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig)
  const rotateYSpring = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig)
  const scaleSpring = useSpring(
    useTransform(
      [mouseX, mouseY] as const,
      () => (isHovered ? scale : 1)
    ),
    springConfig
  )

  // Convert spring values to refs for compatibility
  const rotateXRef = React.useRef(0)
  const rotateYRef = React.useRef(0)
  const scaleRef = React.useRef(1)
  const mouseXRef = React.useRef(0)
  const mouseYRef = React.useRef(0)

  // Update refs from spring values
  React.useEffect(() => {
    const unsubscribe = rotateXSpring.on("change", (v) => { rotateXRef.current = v })
    return () => unsubscribe()
  }, [rotateXSpring])

  React.useEffect(() => {
    const unsubscribe = rotateYSpring.on("change", (v) => { rotateYRef.current = v })
    return () => unsubscribe()
  }, [rotateYSpring])

  React.useEffect(() => {
    const unsubscribe = scaleSpring.on("change", (v) => { scaleRef.current = v })
    return () => unsubscribe()
  }, [scaleSpring])

  React.useEffect(() => {
    const unsubscribe = mouseX.on("change", (v) => { mouseXRef.current = v })
    return () => unsubscribe()
  }, [mouseX])

  React.useEffect(() => {
    const unsubscribe = mouseY.on("change", (v) => { mouseYRef.current = v })
    return () => unsubscribe()
  }, [mouseY])

  /**
   * Handle mouse move
   */
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<T>) => {
      if (!enabled || !ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      mouseX.set(reverse ? -x : x)
      mouseY.set(reverse ? -y : y)
    },
    [enabled, reverse, mouseX, mouseY]
  )

  /**
   * Handle mouse enter
   */
  const handleMouseEnter = React.useCallback(() => {
    setIsHovered(true)
  }, [])

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = React.useCallback(() => {
    setIsHovered(false)
    if (resetOnLeave) {
      mouseX.set(0)
      mouseY.set(0)
    }
  }, [resetOnLeave, mouseX, mouseY])

  /**
   * Reset tilt to center
   */
  const reset = React.useCallback(() => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }, [mouseX, mouseY])

  return {
    rotateX: rotateXRef,
    rotateY: rotateYRef,
    scale: scaleRef,
    mouseX: mouseXRef,
    mouseY: mouseYRef,
    isHovered,
    reset,
    ref,
    onMouseMove: handleMouseMove,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  }
}

// ============================================================================
// USE TILT PARALLAX HOOK
// ============================================================================

/**
 * useTiltParallax Hook
 *
 * Enhanced tilt with parallax layers for depth effect.
 *
 * @example
 * ```tsx
 * const { ref, layers, handlers } = useTiltParallax({
 *   layers: [1, 0.5, 0.2], // Different depth factors
 * })
 *
 * <div ref={ref} {...handlers}>
 *   <motion.div style={layers[0]}>Background</motion.div>
 *   <motion.div style={layers[1]}>Middle</motion.div>
 *   <motion.div style={layers[2]}>Foreground</motion.div>
 * </div>
 * ```
 */
export function useTiltParallax<T extends HTMLElement = HTMLDivElement>(
  config: TiltConfig & { layers?: number[] } = {}
) {
  const { layers: layerDepths = [1, 0.5, 0.2], ...tiltConfig } = config
  const tilt = useTilt<T>(tiltConfig)

  const parallaxLayers = React.useMemo(
    () =>
      layerDepths.map(
        (depth) =>
          ({
            rotateX: tilt.rotateY,
            rotateY: tilt.rotateX,
            translateX: tilt.mouseX,
            translateY: tilt.mouseY,
            depth,
          }) as const
      ),
    [layerDepths, tilt]
  )

  return {
    ...tilt,
    layers: parallaxLayers,
  }
}

// ============================================================================
// USE 3D TRANSFORM HOOK
// ============================================================================

/**
 * Use3DTransform Hook
 *
 * Calculates CSS transform values for 3D effects.
 * Returns a CSS transform string.
 *
 * @example
 * ```tsx
 * const { transformStyle } = use3DTransform({ rotateX: 10, rotateY: 5, scale: 1.1 })
 *
 * <div style={{ transform: transformStyle }} />
 * ```
 */
export function use3DTransform(config: {
  rotateX?: number
  rotateY?: number
  rotateZ?: number
  scale?: number
  translateX?: number
  translateY?: number
  translateZ?: number
  perspective?: number
}) {
  const {
    rotateX = 0,
    rotateY = 0,
    rotateZ = 0,
    scale = 1,
    translateX = 0,
    translateY = 0,
    translateZ = 0,
    perspective = 1000,
  } = config

  const transformStyle = React.useMemo(() => {
    const transforms: string[] = []

    if (translateX !== 0) transforms.push(`translateX(${translateX}px)`)
    if (translateY !== 0) transforms.push(`translateY(${translateY}px)`)
    if (translateZ !== 0) transforms.push(`translateZ(${translateZ}px)`)
    if (rotateX !== 0) transforms.push(`rotateX(${rotateX}deg)`)
    if (rotateY !== 0) transforms.push(`rotateY(${rotateY}deg)`)
    if (rotateZ !== 0) transforms.push(`rotateZ(${rotateZ}deg)`)
    if (scale !== 1) transforms.push(`scale(${scale})`)

    return transforms.join(" ")
  }, [rotateX, rotateY, rotateZ, scale, translateX, translateY, translateZ])

  const perspectiveStyle = React.useMemo(() => {
    return `perspective(${perspective}px)`
  }, [perspective])

  return {
    transform: transformStyle,
    perspective: perspectiveStyle,
    transformStyle: `${perspectiveStyle} ${transformStyle}`,
  }
}
