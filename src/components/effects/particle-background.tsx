"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Particle Configuration
 */
export interface ParticleConfig {
  /** Particle x position (0-1) */
  x: number
  /** Particle y position (0-1) */
  y: number
  /** Particle size in pixels */
  size: number
  /** Particle duration in seconds */
  duration: number
  /** Particle delay in seconds */
  delay: number
  /** Particle opacity */
  opacity: number
  /** Particle blur amount */
  blur?: number
}

/**
 * Generate random particle config
 */
function generateParticle(
  width: number,
  height: number,
  minSize: number,
  maxSize: number,
  minDuration: number,
  maxDuration: number
): ParticleConfig {
  return {
    x: Math.random(),
    y: Math.random(),
    size: Math.random() * (maxSize - minSize) + minSize,
    duration: Math.random() * (maxDuration - minDuration) + minDuration,
    delay: Math.random() * 2,
    opacity: Math.random() * 0.5 + 0.1,
    blur: Math.random() * 2,
  }
}

/**
 * Generate multiple particles
 */
function generateParticles(
  count: number,
  width: number,
  height: number,
  config?: Partial<ParticleBackgroundProps>
): ParticleConfig[] {
  const minSize = config?.minSize ?? 2
  const maxSize = config?.maxSize ?? 6
  const minDuration = config?.minDuration ?? 10
  const maxDuration = config?.maxDuration ?? 20

  return Array.from({ length: count }, () =>
    generateParticle(width, height, minSize, maxSize, minDuration, maxDuration)
  )
}

/**
 * Particle Props
 */
interface ParticleProps {
  config: ParticleConfig
  color: string
  interactive: boolean
  mousePos: { x: number; y: number } | null
  containerRef: React.RefObject<HTMLDivElement>
}

/**
 * Individual Particle Component
 */
function Particle({ config, color, interactive, mousePos, containerRef }: ParticleProps) {
  const [position, setPosition] = React.useState({ x: config.x, y: config.y })
  const [velocity, setVelocity] = React.useState({ vx: 0, vy: 0 })

  // Handle mouse interaction
  React.useEffect(() => {
    if (!interactive || !mousePos || !containerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const particleScreenX = position.x * rect.width
    const particleScreenY = position.y * rect.height

    const dx = mousePos.x - particleScreenX
    const dy = mousePos.y - particleScreenY
    const distance = Math.sqrt(dx * dx + dy * dy)
    const maxDistance = 150

    if (distance < maxDistance) {
      const force = (1 - distance / maxDistance) * 0.02
      setVelocity({
        vx: -(dx / distance) * force,
        vy: -(dy / distance) * force,
      })
    }
  }, [interactive, mousePos, position, containerRef])

  // Apply velocity with damping
  React.useEffect(() => {
    if (velocity.vx === 0 && velocity.vy === 0) return

    const animationFrame = requestAnimationFrame(() => {
      setPosition((prev) => ({
        x: Math.max(0, Math.min(1, prev.x + velocity.vx)),
        y: Math.max(0, Math.min(1, prev.y + velocity.vy)),
      }))
      setVelocity((prev) => ({
        vx: prev.vx * 0.95,
        vy: prev.vy * 0.95,
      }))
    })

    return () => cancelAnimationFrame(animationFrame)
  }, [velocity])

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        width: config.size,
        height: config.size,
        backgroundColor: color,
        opacity: config.opacity,
        filter: config.blur ? `blur(${config.blur}px)` : undefined,
      }}
      animate={{
        y: [0, -20, 0],
        x: [0, Math.sin(config.delay) * 10, 0],
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  )
}

/**
 * Particle Background Props
 */
export interface ParticleBackgroundProps {
  /** Number of particles (default: 50) */
  count?: number
  /** Minimum particle size (default: 2) */
  minSize?: number
  /** Maximum particle size (default: 6) */
  maxSize?: number
  /** Minimum animation duration (default: 10) */
  minDuration?: number
  /** Maximum animation duration (default: 20) */
  maxDuration?: number
  /** Particle color (default: current color) */
  color?: string
  /** Enable mouse interaction (default: true) */
  interactive?: boolean
  /** Number of depth layers (default: 3) */
  depthLayers?: number
  /** Background gradient start color */
  gradientStart?: string
  /** Background gradient end color */
  gradientEnd?: string
  /** Enable connection lines between nearby particles */
  connectParticles?: boolean
  /** Maximum distance for particle connections */
  connectionDistance?: number
  /** Additional CSS class names */
  className?: string
  /** Children to render on top of the background */
  children?: React.ReactNode
}

/**
 * Particle Background Component
 *
 * Ambient particle system with floating particles, mouse interaction, and depth layers.
 *
 * @example
 * ```tsx
 * <ParticleBackground count={50} interactive color="hsl(var(--primary))">
 *   <YourContent />
 * </ParticleBackground>
 * ```
 */
export function ParticleBackground({
  count = 50,
  minSize = 2,
  maxSize = 6,
  minDuration = 10,
  maxDuration = 20,
  color = "hsl(var(--primary))",
  interactive = true,
  depthLayers = 3,
  gradientStart,
  gradientEnd,
  connectParticles = false,
  connectionDistance = 100,
  className,
  children,
}: ParticleBackgroundProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 })
  const [mousePos, setMousePos] = React.useState<{ x: number; y: number } | null>(null)
  const [particles, setParticles] = React.useState<ParticleConfig[]>([])

  // Throttled mouse move handler
  const mouseMoveRef = React.useRef<{ x: number; y: number } | null>(null)
  const rafRef = React.useRef<number>()

  const handleMouseMove = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    mouseMoveRef.current = { x: e.clientX, y: e.clientY }

    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        setMousePos(mouseMoveRef.current)
        rafRef.current = undefined
      })
    }
  }, [])

  const handleMouseLeave = React.useCallback(() => {
    setMousePos(null)
  }, [])

  // Update dimensions on resize
  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // Generate particles when dimensions change
  React.useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      const particlesPerLayer = Math.ceil(count / depthLayers)
      const allParticles: ParticleConfig[] = []

      for (let layer = 0; layer < depthLayers; layer++) {
        const layerParticles = generateParticles(
          particlesPerLayer,
          dimensions.width,
          dimensions.height,
          { minSize, maxSize, minDuration, maxDuration }
        )
        allParticles.push(...layerParticles)
      }

      setParticles(allParticles)
    }
  }, [dimensions, count, depthLayers, minSize, maxSize, minDuration, maxDuration])

  const particlesPerLayer = Math.ceil(particles.length / depthLayers)

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden", className)}
      onMouseMove={interactive ? handleMouseMove : undefined}
      onMouseLeave={interactive ? handleMouseLeave : undefined}
      style={{
        background: gradientStart || gradientEnd
          ? `linear-gradient(to bottom, ${gradientStart || "transparent"}, ${gradientEnd || "transparent"})`
          : undefined,
      }}
    >
      {/* Connection lines SVG */}
      {connectParticles && particles.length > 0 && (
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.3 }}
        >
          {particles.map((p1, i) =>
            particles.slice(i + 1).map((p2, j) => {
              const dx = (p2.x - p1.x) * dimensions.width
              const dy = (p2.y - p1.y) * dimensions.height
              const distance = Math.sqrt(dx * dx + dy * dy)

              if (distance < connectionDistance) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={`${p1.x * 100}%`}
                    y1={`${p1.y * 100}%`}
                    x2={`${p2.x * 100}%`}
                    y2={`${p2.y * 100}%`}
                    stroke={color}
                    strokeWidth="1"
                    opacity={1 - distance / connectionDistance}
                  />
                )
              }
              return null
            })
          )}
        </svg>
      )}

      {/* Particle layers */}
      {Array.from({ length: depthLayers }).map((_, layerIndex) => (
        <div
          key={layerIndex}
          className="absolute inset-0"
          style={{
            zIndex: layerIndex,
            opacity: 0.3 + (layerIndex / depthLayers) * 0.7,
          }}
        >
          {particles
            .slice(layerIndex * particlesPerLayer, (layerIndex + 1) * particlesPerLayer)
            .map((config, i) => (
              <Particle
                key={`${layerIndex}-${i}`}
                config={config}
                color={color}
                interactive={interactive}
                mousePos={mousePos}
                containerRef={containerRef}
              />
            ))}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

/**
 * Particle Background Presets
 */
export const ParticlePresets = {
  /**
   * Subtle ambient particles
   */
  subtle: {
    count: 30,
    minSize: 1,
    maxSize: 3,
    minDuration: 15,
    maxDuration: 25,
    interactive: false,
  },

  /**
   * Standard interactive particles
   */
  standard: {
    count: 50,
    minSize: 2,
    maxSize: 6,
    minDuration: 10,
    maxDuration: 20,
    interactive: true,
  },

  /**
   * Dense particle field
   */
  dense: {
    count: 100,
    minSize: 1,
    maxSize: 4,
    minDuration: 8,
    maxDuration: 15,
    interactive: true,
    connectParticles: true,
    connectionDistance: 80,
  },

  /**
   * Large floating particles
   */
  large: {
    count: 20,
    minSize: 8,
    maxSize: 16,
    minDuration: 20,
    maxDuration: 40,
    interactive: true,
  },
} as const

/**
 * Particle Background with Preset
 */
export interface ParticleBackgroundWithPresetProps
  extends Omit<ParticleBackgroundProps, "count" | "minSize" | "maxSize" | "minDuration" | "maxDuration"> {
  preset?: keyof typeof ParticlePresets
}

/**
 * Particle Background with preset configuration
 */
export function ParticleBackgroundWithPreset({
  preset = "standard",
  ...props
}: ParticleBackgroundWithPresetProps) {
  const presetConfig = ParticlePresets[preset]

  return (
    <ParticleBackground {...presetConfig} {...props}>
      {props.children}
    </ParticleBackground>
  )
}
