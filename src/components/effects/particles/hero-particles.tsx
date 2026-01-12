"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useParticleEngine, type EmitterConfig } from "./particle-engine"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Hero particle preset
 */
export type HeroParticlePreset = "sparkle" | "confetti" | "firework" | "snow" | "rain"

/**
 * Hero Particles Props
 */
export interface HeroParticlesProps {
  /** Particle preset */
  preset?: HeroParticlePreset
  /** Number of particles */
  count?: number
  /** Particle colors */
  colors?: string[]
  /** Auto-emit particles */
  autoEmit?: boolean
  /** Emit interval in ms */
  emitInterval?: number
  /** Additional CSS class names */
  className?: string
  /** Children to render on top */
  children?: React.ReactNode
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
  /** Canvas width */
  width?: number
  /** Canvas height */
  height?: number
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Particle presets configuration
 */
const presets: Record<HeroParticlePreset, Partial<EmitterConfig>> = {
  sparkle: {
    colors: ["#FFD700", "#FFA500", "#FF69B4", "#00BFFF", "#9370DB"],
    speed: { min: 0.5, max: 2 },
    size: { min: 2, max: 4 },
    life: { min: 60, max: 120 },
    decay: { min: 0.3, max: 0.8 },
    type: "star",
  },
  confetti: {
    colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
    speed: { min: 2, max: 5 },
    size: { min: 4, max: 8 },
    life: { min: 90, max: 150 },
    decay: { min: 0.2, max: 0.5 },
    type: "square",
  },
  firework: {
    colors: ["#FF0000", "#FF4500", "#FFD700", "#00FF00", "#00BFFF", "#FF69B4"],
    speed: { min: 3, max: 8 },
    size: { min: 2, max: 5 },
    life: { min: 30, max: 60 },
    decay: { min: 0.5, max: 1 },
    type: "mixed",
  },
  snow: {
    colors: ["#FFFFFF"],
    speed: { min: 0.5, max: 1.5 },
    size: { min: 2, max: 6 },
    life: { min: 120, max: 200 },
    decay: { min: 0.1, max: 0.3 },
    type: "circle",
  },
  rain: {
    colors: ["#4FC3F7", "#81D4FA", "#B3E5FC"],
    speed: { min: 5, max: 10 },
    size: { min: 1, max: 2 },
    life: { min: 40, max: 80 },
    decay: { min: 0.5, max: 1 },
    type: "circle",
  },
}

// ============================================================================
// HERO PARTICLES COMPONENT
// ============================================================================

/**
 * HeroParticles Component
 *
 * Particle effect for hero sections with preset configurations.
 *
 * @example
 * ```tsx
 * <HeroParticles preset="sparkle" count={50}>
 *   <h1>Hero Title</h1>
 * </HeroParticles>
 * ```
 */
export function HeroParticles({
  preset = "sparkle",
  count = 30,
  colors,
  autoEmit = true,
  emitInterval = 100,
  className,
  children,
  respectReducedMotion = true,
  width,
  height,
}: HeroParticlesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  const emitIntervalRef = React.useRef<number>()

  // Get preset config
  const presetConfig = presets[preset]

  // Combine preset colors with custom colors
  const particleColors = colors ?? presetConfig.colors ?? ["hsl(221, 83%, 53%)"]

  // Create emitter config from preset
  const createEmitterConfig = (x: number, y: number): EmitterConfig => ({
    x,
    y,
    rate: 60,
    spread: Math.PI * 2,
    speed: presetConfig.speed ?? { min: 1, max: 3 },
    size: presetConfig.size ?? { min: 2, max: 6 },
    life: presetConfig.life ?? { min: 30, max: 60 },
    colors: particleColors,
    decay: presetConfig.decay ?? { min: 0.5, max: 1 },
    type: presetConfig.type ?? "circle",
  })

  // Initialize engine
  const engine = useParticleEngine({
    maxParticles: count * 2,
    gravity: preset === "snow" || preset === "rain" ? 0.1 : 0.02,
    friction: 0.99,
  })

  // Update container dimensions
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: width ?? rect.width,
          height: height ?? rect.height,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [width, height])

  // Auto-emit particles
  React.useEffect(() => {
    if (!autoEmit) return

    const emit = () => {
      const x = Math.random() * dimensions.width
      const y = Math.random() * dimensions.height
      engine.emit(createEmitterConfig(x, y), 1)
    }

    // Initial burst
    for (let i = 0; i < count; i++) {
      setTimeout(() => emit(), i * 10)
    }

    // Continuous emission
    emitIntervalRef.current = window.setInterval(emit, emitInterval)

    return () => {
      if (emitIntervalRef.current) {
        clearInterval(emitIntervalRef.current)
      }
    }
  }, [autoEmit, count, emitInterval, dimensions, engine])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width: width ?? "100%", height: height ?? "100%" }}
    >
      <canvas
        ref={engine.canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ============================================================================
// SPECIALIZED HERO PARTICLE COMPONENTS
// ============================================================================

/**
 * SparkleParticles Props
 */
export interface SparkleParticlesProps extends Omit<HeroParticlesProps, "preset"> {
  /** Sparkle density */
  density?: number
}

/**
 * SparkleParticles Component
 *
 * Subtle sparkle effect for hero sections.
 *
 * @example
 * ```tsx
 * <SparkleParticles density={30}>
 *   <h1>Shimmering Title</h1>
 * </SparkleParticles>
 * ```
 */
export function SparkleParticles({
  density = 30,
  colors = ["#FFD700", "#FFA500", "#FF69B4", "#00BFFF", "#9370DB"],
  ...props
}: SparkleParticlesProps) {
  return (
    <HeroParticles preset="sparkle" count={density} colors={colors} {...props}>
      {props.children}
    </HeroParticles>
  )
}

/**
 * ConfettiParticles Props
 */
export interface ConfettiParticlesProps extends Omit<HeroParticlesProps, "preset"> {
  /** Trigger confetti burst */
  trigger?: boolean
  /** On complete callback */
  onComplete?: () => void
}

/**
 * ConfettiParticles Component
 *
 * Celebration confetti effect.
 *
 * @example
 * ```tsx
 * const [trigger, setTrigger] = useState(false)
 *
 * <button onClick={() => setTrigger(true)}>Celebrate!</button>
 * <ConfettiParticles trigger={trigger} />
 * ```
 */
export function ConfettiParticles({
  trigger = false,
  count = 100,
  onComplete,
  ...props
}: ConfettiParticlesProps) {
  const engine = useParticleEngine({ maxParticles: 200, gravity: 0.15, friction: 0.98 })
  const [hasBurst, setHasBurst] = React.useState(false)

  React.useEffect(() => {
    if (trigger && !hasBurst) {
      setHasBurst(true)

      const centerX = (props.width ?? 800) / 2
      const centerY = (props.height ?? 600) / 2

      // Create confetti emitter config
      const config: EmitterConfig = {
        x: centerX,
        y: centerY,
        rate: 60,
        spread: Math.PI * 2,
        speed: { min: 3, max: 8 },
        size: { min: 4, max: 10 },
        life: { min: 60, max: 120 },
        colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD"],
        decay: { min: 0.3, max: 0.6 },
        type: "square",
      }

      // Burst confetti
      let emitted = 0
      const burstInterval = setInterval(() => {
        engine.emit(config, 5)
        emitted += 5
        if (emitted >= count) {
          clearInterval(burstInterval)
          setTimeout(() => {
            setHasBurst(false)
            onComplete?.()
          }, 2000)
        }
      }, 16)
    }
  }, [trigger, hasBurst, count, engine, props.width, props.height, onComplete])

  return (
    <canvas
      ref={engine.canvasRef}
      width={props.width ?? 800}
      height={props.height ?? 600}
      className={cn("absolute inset-0 pointer-events-none", props.className)}
    />
  )
}

/**
 * SnowParticles Props
 */
export interface SnowParticlesProps extends Omit<HeroParticlesProps, "preset"> {
  /** Snow intensity */
  intensity?: number
}

/**
 * SnowParticles Component
 *
 * Gentle falling snow effect.
 *
 * @example
 * ```tsx
 * <SnowParticles intensity={50}>
 *   <h1>Winter Wonderland</h1>
 * </SnowParticles>
 * ```
 */
export function SnowParticles({
  intensity = 50,
  ...props
}: SnowParticlesProps) {
  return <HeroParticles preset="snow" count={intensity} {...props} />
}

/**
 * FireworkParticles Props
 */
export interface FireworkParticlesProps extends Omit<HeroParticlesProps, "preset"> {
  /** Firework coordinates */
  x?: number
  y?: number
  /** Trigger firework */
  trigger?: boolean
}

/**
 * FireworkParticles Component
 *
 * Firework explosion effect.
 *
 * @example
 * ```tsx
 * const [trigger, setTrigger] = useState(false)
 *
 * <button onClick={() => setTrigger(!trigger)}>Launch!</button>
 * <FireworkParticles trigger={trigger} x={400} y={300} />
 * ```
 */
export function FireworkParticles({
  x = 400,
  y = 300,
  trigger = false,
  count = 100,
  ...props
}: FireworkParticlesProps) {
  const engine = useParticleEngine({ maxParticles: 300, gravity: 0.1, friction: 0.98 })

  React.useEffect(() => {
    if (trigger) {
      const config: EmitterConfig = {
        x,
        y,
        rate: 120,
        spread: Math.PI * 2,
        speed: { min: 2, max: 6 },
        size: { min: 2, max: 5 },
        life: { min: 40, max: 80 },
        colors: ["#FF0000", "#FF4500", "#FFD700", "#00FF00", "#00BFFF", "#FF69B4"],
        decay: { min: 0.5, max: 1 },
        type: "mixed",
      }

      // Rapid fire particles
      let emitted = 0
      const burstInterval = setInterval(() => {
        engine.emit(config, 10)
        emitted += 10
        if (emitted >= count) {
          clearInterval(burstInterval)
        }
      }, 16)
    }
  }, [trigger, x, y, count, engine])

  return (
    <canvas
      ref={engine.canvasRef}
      width={props.width ?? 800}
      height={props.height ?? 600}
      className={cn("absolute inset-0 pointer-events-none", props.className)}
    />
  )
}
