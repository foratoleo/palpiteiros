"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useParticleEngine, type EmitterConfig, usePrefersReducedMotion } from "./particle-engine"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Ambient particle preset
 */
export type AmbientPreset = "subtle" | "floating" | "drifting" | "rising"

/**
 * Ambient Particles Props
 */
export interface AmbientParticlesProps {
  /** Ambient preset */
  preset?: AmbientPreset
  /** Number of particles */
  count?: number
  /** Particle color */
  color?: string
  /** Additional CSS class names */
  className?: string
  /** Children to render on top */
  children?: React.ReactNode
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

const presetConfigs: Record<AmbientPreset, { gravity: number; speed: [number, number]; size: [number, number]; life: [number, number] }> = {
  subtle: {
    gravity: 0,
    speed: [0.1, 0.3],
    size: [1, 3],
    life: [120, 200],
  },
  floating: {
    gravity: -0.02,
    speed: [0.2, 0.5],
    size: [2, 5],
    life: [150, 250],
  },
  drifting: {
    gravity: 0.01,
    speed: [0.3, 0.8],
    size: [2, 4],
    life: [100, 180],
  },
  rising: {
    gravity: -0.05,
    speed: [0.5, 1],
    size: [3, 6],
    life: [80, 150],
  },
}

// ============================================================================
// AMBIENT PARTICLES COMPONENT
// ============================================================================

/**
 * AmbientParticles Component
 *
 * Subtle background particles that create atmosphere.
 * Optimized for performance with minimal CPU usage.
 *
 * @example
 * ```tsx
 * <AmbientParticles preset="subtle" count={30}>
 *   <YourContent />
 * </AmbientParticles>
 * ```
 */
export function AmbientParticles({
  preset = "subtle",
  count = 30,
  color = "hsl(221, 83%, 53% / 0.3)",
  className,
  children,
  respectReducedMotion = true,
}: AmbientParticlesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  const particlesRef = React.useRef<Array<{ id: string; x: number; y: number; size: number; speed: number; angle: number }>>([])
  const rafRef = React.useRef<number>()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  const config = presetConfigs[preset]

  // Update container dimensions
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Initialize particles
  React.useEffect(() => {
    if (shouldDisable) return

    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: `particle-${i}`,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: config.size[0] + Math.random() * (config.size[1] - config.size[0]),
      speed: config.speed[0] + Math.random() * (config.speed[1] - config.speed[0]),
      angle: Math.random() * Math.PI * 2,
    }))
  }, [count, dimensions, config, shouldDisable])

  // Render loop
  React.useEffect(() => {
    if (shouldDisable) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particlesRef.current.forEach((particle) => {
        // Update position with gentle floating motion
        particle.angle += 0.01
        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y -= particle.speed + config.gravity

        // Wrap around edges
        if (particle.x < 0) particle.x = dimensions.width
        if (particle.x > dimensions.width) particle.x = 0
        if (particle.y < 0) particle.y = dimensions.height
        if (particle.y > dimensions.height) particle.y = 0

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [dimensions, config, color, shouldDisable])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      style={{ width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10">{children}</div>
    </div>
  )
}

// ============================================================================
// SPECIALIZED AMBIENT VARIANTS
// ============================================================================

/**
 * SubtleAmbientParticles Component
 *
 * Very subtle, barely noticeable floating particles.
 * Perfect for backgrounds without distraction.
 *
 * @example
 * ```tsx
 * <SubtleAmbientParticles>
 *   <h1>Clean Background</h1>
 * </SubtleAmbientParticles>
 * ```
 */
export function SubtleAmbientParticles(props: Omit<AmbientParticlesProps, "preset">) {
  return <AmbientParticles preset="subtle" count={20} {...props} />
}

/**
 * FloatingAmbientParticles Component
 *
 * Gentle upward floating particles.
 * Creates a dreamy, ethereal atmosphere.
 *
 * @example
 * ```tsx
 * <FloatingAmbientParticles color="hsl(174, 72%, 56% / 0.3)">
 *   <h1>Dreamy Content</h1>
 * </FloatingAmbientParticles>
 * ```
 */
export function FloatingAmbientParticles(props: Omit<AmbientParticlesProps, "preset">) {
  return <AmbientParticles preset="floating" count={40} {...props} />
}

/**
 * DustMotes Component
 *
 * Small dust particles floating in light beams effect.
 *
 * @example
 * ```tsx
 * <DustMotes>
 *   <YourContent />
 * </DustMotes>
 * ```
 */
export function DustMotes({ count = 50, color = "hsl(45, 100%, 70% / 0.4)", ...props }: AmbientParticlesProps) {
  return <AmbientParticles preset="drifting" count={count} color={color} {...props} />
}

/**
 * Fireflies Component
 *
 * Glowing firefly particles with subtle pulse.
 *
 * @example
 * ```tsx
 * <Fireflies>
 *   <NightScene />
 * </Fireflies>
 * ```
 */
export function Fireflies({ count = 30, ...props }: AmbientParticlesProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  const particlesRef = React.useRef<Array<{
    id: string
    x: number
    y: number
    size: number
    speed: number
    angle: number
    pulse: number
    pulseSpeed: number
  }>>([])
  const rafRef = React.useRef<number>()
  const canvasRef = React.useRef<HTMLCanvasElement>(null)

  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = props.respectReducedMotion !== false && prefersReducedMotion

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  React.useEffect(() => {
    if (shouldDisable) return

    particlesRef.current = Array.from({ length: count }, (_, i) => ({
      id: `firefly-${i}`,
      x: Math.random() * dimensions.width,
      y: Math.random() * dimensions.height,
      size: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.5,
      angle: Math.random() * Math.PI * 2,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }))
  }, [count, dimensions, shouldDisable])

  React.useEffect(() => {
    if (shouldDisable) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle) => {
        particle.angle += 0.005
        particle.pulse += particle.pulseSpeed
        particle.x += Math.cos(particle.angle) * particle.speed
        particle.y += Math.sin(particle.angle) * particle.speed * 0.5

        if (particle.x < 0) particle.x = dimensions.width
        if (particle.x > dimensions.width) particle.x = 0
        if (particle.y < 0) particle.y = dimensions.height
        if (particle.y > dimensions.height) particle.y = 0

        const alpha = 0.3 + Math.sin(particle.pulse) * 0.3

        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(60, 100%, 70% / ${alpha})`
        ctx.fill()

        // Glow effect
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(60, 100%, 70% / ${alpha * 0.2})`
        ctx.fill()
      })

      rafRef.current = requestAnimationFrame(render)
    }

    render()

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [dimensions, shouldDisable])

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", props.className)}
      style={{ width: "100%", height: "100%" }}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
      />
      <div className="relative z-10">{props.children}</div>
    </div>
  )
}
