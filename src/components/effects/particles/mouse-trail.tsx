"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"
import { useParticleEngine, type EmitterConfig, usePrefersReducedMotion } from "./particle-engine"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Trail preset
 */
export type TrailPreset = "sparkle" | "fire" | "magic" | "comet" | "bubble"

/**
 * Mouse Trail Props
 */
export interface MouseTrailProps {
  /** Trail preset */
  preset?: TrailPreset
  /** Trail color */
  color?: string
  /** Trail colors (for multi-color presets) */
  colors?: string[]
  /** Particle size */
  size?: number
  /** Trail length (particle lifetime) */
  length?: number
  /** Emit frequency (lower = more particles) */
  frequency?: number
  /** Additional CSS class names */
  className?: string
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

const trailPresets: Record<
  TrailPreset,
  {
    gravity: number
    friction: number
    speed: [number, number]
    size: [number, number]
    life: [number, number]
    decay: [number, number]
    type: EmitterConfig["type"]
    colors: string[]
  }
> = {
  sparkle: {
    gravity: 0.02,
    friction: 0.97,
    speed: [0.5, 2],
    size: [2, 5],
    life: [20, 40],
    decay: [1, 2],
    type: "star",
    colors: ["#FFD700", "#FFA500", "#FF69B4"],
  },
  fire: {
    gravity: -0.05,
    friction: 0.98,
    speed: [0.3, 1],
    size: [3, 8],
    life: [15, 30],
    decay: [0.8, 1.5],
    type: "circle",
    colors: ["#FF4500", "#FF6B00", "#FFD700", "#FFFF00"],
  },
  magic: {
    gravity: 0,
    friction: 0.95,
    speed: [1, 3],
    size: [2, 4],
    life: [25, 50],
    decay: [0.5, 1],
    type: "mixed",
    colors: ["#9370DB", "#00BFFF", "#FF69B4", "#00FF7F"],
  },
  comet: {
    gravity: 0.01,
    friction: 0.99,
    speed: [2, 4],
    size: [1, 3],
    life: [30, 60],
    decay: [0.3, 0.8],
    type: "circle",
    colors: ["#87CEEB", "#00BFFF", "#1E90FF"],
  },
  bubble: {
    gravity: -0.08,
    friction: 0.96,
    speed: [0.5, 1.5],
    size: [4, 10],
    life: [30, 50],
    decay: [0.5, 1],
    type: "circle",
    colors: ["#87CEEB", "#B0E0E6", "#E0FFFF"],
  },
}

// ============================================================================
// MOUSE TRAIL COMPONENT
// ============================================================================

/**
 * MouseTrail Component
 *
 * Particle trail that follows the mouse cursor.
 * Uses RAF throttling for optimal performance.
 *
 * @example
 * ```tsx
 * <MouseTrail preset="magic" />
 * ```
 */
export function MouseTrail({
  preset = "sparkle",
  color,
  colors,
  size,
  length,
  frequency = 2,
  className,
  respectReducedMotion = true,
}: MouseTrailProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const engine = useParticleEngine({
    maxParticles: 200,
    gravity: trailPresets[preset].gravity,
    friction: trailPresets[preset].friction,
  })

  const mousePos = React.useRef({ x: 0, y: 0 })
  const lastEmitRef = React.useRef(0)
  const frameCountRef = React.useRef(0)
  const canvasSizeRef = React.useRef({ width: 0, height: 0 })

  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  const presetConfig = trailPresets[preset]
  const trailColors: string[] = colors ?? (color ? [color] : presetConfig.colors)
  const baseSize = size ?? (presetConfig.size[0] + presetConfig.size[1]) / 2

  // Update canvas size
  React.useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        canvasSizeRef.current = { width: rect.width, height: rect.height }
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Handle mouse move with RAF throttling
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (shouldDisable) return

      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      mousePos.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      // Emit particles at controlled frequency
      frameCountRef.current++
      if (frameCountRef.current % frequency === 0) {
        const now = Date.now()
        if (now - lastEmitRef.current > 16) {
          // Cap at 60fps emission
          lastEmitRef.current = now

          const config: EmitterConfig = {
            x: mousePos.current.x,
            y: mousePos.current.y,
            rate: 60,
            spread: Math.PI * 2,
            speed: { min: presetConfig.speed[0], max: presetConfig.speed[1] },
            size: { min: baseSize * 0.8, max: baseSize * 1.2 },
            life: length ? { min: length * 0.8, max: length * 1.2 } : { min: presetConfig.life[0], max: presetConfig.life[1] },
            colors: trailColors,
            decay: { min: presetConfig.decay[0], max: presetConfig.decay[1] },
            type: presetConfig.type,
          }

          engine.emit(config, 1)
        }
      }
    },
    [shouldDisable, frequency, presetConfig, baseSize, length, trailColors, engine]
  )

  const handleMouseLeave = () => {
    frameCountRef.current = 0
  }

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <canvas
        ref={engine.canvasRef}
        width={canvasSizeRef.current.width || 800}
        height={canvasSizeRef.current.height || 600}
        className="absolute inset-0"
      />
    </div>
  )
}

// ============================================================================
// SPECIALIZED TRAIL VARIANTS
// ============================================================================

/**
 * SparkleTrail Component
 *
 * Sparkling star trail following the cursor.
 *
 * @example
 * ```tsx
 * <SparkleTrail />
 * ```
 */
export function SparkleTrail(props: Partial<MouseTrailProps>) {
  return <MouseTrail preset="sparkle" {...props} />
}

/**
 * FireTrail Component
 *
 * Fire-like trail that rises from the cursor.
 *
 * @example
 * ```tsx
 * <FireTrail />
 * ```
 */
export function FireTrail(props: Partial<MouseTrailProps>) {
  return <MouseTrail preset="fire" {...props} />
}

/**
 * MagicTrail Component
 *
 * Magical multi-colored particle trail.
 *
 * @example
 * ```tsx
 * <MagicTrail colors={['#FF69B4', '#00BFFF', '#9370DB']} />
 * ```
 */
export function MagicTrail(props: Partial<MouseTrailProps>) {
  return <MouseTrail preset="magic" {...props} />
}

/**
 * CometTrail Component
 *

 * Comet-like trail with fading tail.
 *
 * @example
 * ```tsx
 * <CometTrail color="#1E90FF" />
 * ```
 */
export function CometTrail(props: Partial<MouseTrailProps>) {
  return <MouseTrail preset="comet" {...props} />
}

/**
 * BubbleTrail Component
 *
 * Bubbles that float up from the cursor.
 *
 * @example
 * ```tsx
 * <BubbleTrail />
 * ```
 */
export function BubbleTrail(props: Partial<MouseTrailProps>) {
  return <MouseTrail preset="bubble" {...props} />
}

// ============================================================================
// CURSOR GLOW COMPONENT
// ============================================================================

/**
 * CursorGlow Props
 */
export interface CursorGlowProps {
  /** Glow size */
  size?: number
  /** Glow color */
  color?: string
  /** Blur amount */
  blur?: string
  /** Additional CSS class names */
  className?: string
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

/**
 * CursorGlow Component
 *
 * Simple glow effect following the cursor.
 * Lighter weight alternative to particle trails.
 *
 * @example
 * ```tsx
 * <CursorGlow size={200} color="rgba(59, 130, 246, 0.3)" />
 * ```
 */
export function CursorGlow({
  size = 200,
  color = "rgba(59, 130, 246, 0.2)",
  blur = "blur(60px)",
  className,
  respectReducedMotion = true,
}: CursorGlowProps) {
  const glowRef = React.useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  const x = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })
  const y = useSpring(useMotionValue(0), { stiffness: 300, damping: 30 })

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldDisable) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    x.set(e.clientX - rect.left - size / 2)
    y.set(e.clientY - rect.top - size / 2)
  }, [shouldDisable, x, y, size])

  if (shouldDisable) return null

  return (
    <motion.div
      ref={glowRef}
      className={cn("pointer-events-none fixed rounded-full", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: blur,
        x,
        y,
        zIndex: 0,
      }}
      onMouseMove={handleMouseMove}
    />
  )
}

// ============================================================================
// CURSOR RING COMPONENT
// ============================================================================

/**
 * CursorRing Props
 */
export interface CursorRingProps {
  /** Ring size */
  size?: number
  /** Ring color */
  color?: string
  /** Ring thickness */
  thickness?: number
  /** Additional CSS class names */
  className?: string
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

/**
 * CursorRing Component
 *
 * Decorative ring that follows the cursor with smooth delay.
 *
 * @example
 * ```tsx
 * <CursorRing size={40} color="hsl(var(--primary))" />
 * ```
 */
export function CursorRing({
  size = 40,
  color = "hsl(var(--primary))",
  thickness = 2,
  className,
  respectReducedMotion = true,
}: CursorRingProps) {
  const ringRef = React.useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  const x = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const y = useSpring(useMotionValue(0), { stiffness: 150, damping: 20 })
  const scale = useSpring(useMotionValue(1), { stiffness: 300, damping: 20 })

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldDisable) return

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    x.set(e.clientX - rect.left - size / 2)
    y.set(e.clientY - rect.top - size / 2)
  }, [shouldDisable, x, y, size])

  const handleMouseDown = () => scale.set(0.8)
  const handleMouseUp = () => scale.set(1)

  if (shouldDisable) return null

  return (
    <motion.div
      ref={ringRef}
      className={cn("pointer-events-none fixed rounded-full border", className)}
      style={{
        width: size,
        height: size,
        borderColor: color,
        borderWidth: thickness,
        x,
        y,
        scale,
        zIndex: 9999,
        pointerEvents: "none",
      }}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    />
  )
}
