"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Particle type
 */
export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  color: string
  alpha: number
  decay: number
  type: "circle" | "square" | "triangle" | "star"
  rotation: number
  rotationSpeed: number
}

/**
 * Particle emitter config
 */
export interface EmitterConfig {
  x: number
  y: number
  rate: number // particles per second
  spread: number // emission angle spread
  speed: { min: number; max: number }
  size: { min: number; max: number }
  life: { min: number; max: number }
  colors: string[]
  decay: { min: number; max: number }
  type?: "circle" | "square" | "triangle" | "star" | "mixed"
}

/**
 * Engine config
 */
export interface ParticleEngineConfig {
  maxParticles: number
  gravity: number
  friction: number
  enabled: boolean
}

// ============================================================================
// PARTICLE ENGINE HOOK
// ============================================================================

/**
 * useParticleEngine Hook
 *
 * Core particle system with optimized rendering.
 * Uses OffscreenCanvas when available for better performance.
 *
 * @example
 * ```tsx
 * const { canvasRef, emit, update, particles } = useParticleEngine({
 *   maxParticles: 1000,
 *   gravity: 0.1,
 *   friction: 0.99,
 * })
 * ```
 */
export function useParticleEngine(config: Partial<ParticleEngineConfig> = {}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const offscreenCanvasRef = React.useRef<OffscreenCanvas | null>(null)
  const offscreenCtxRef = React.useRef<OffscreenCanvasRenderingContext2D | null>(null)
  const particlesRef = React.useRef<Particle[]>([])
  const rafRef = React.useRef<number>()
  const lastEmitRef = React.useRef(0)
  const enabledRef = React.useRef(config.enabled ?? true)

  // Engine configuration
  const engineConfig: ParticleEngineConfig = {
    maxParticles: config.maxParticles ?? 500,
    gravity: config.gravity ?? 0.05,
    friction: config.friction ?? 0.99,
    enabled: config.enabled ?? true,
  }

  // Initialize canvas
  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Try to use OffscreenCanvas for better performance
    if (typeof OffscreenCanvas !== "undefined") {
      try {
        const offscreen = canvas.transferControlToOffscreen()
        offscreenCanvasRef.current = offscreen
        offscreenCtxRef.current = offscreen.getContext("2d") as OffscreenCanvasRenderingContext2D
      } catch {
        // Fall back to regular canvas
      }
    }

    // Fallback to regular context
    if (!offscreenCtxRef.current) {
      const ctx = canvas.getContext("2d")
      if (ctx) {
        // Store context directly on canvas ref for fallback
        ;(canvas as any)._ctx = ctx
      }
    }

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  // Get context (either OffscreenCanvas or regular)
  const getContext = (): CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null => {
    if (offscreenCtxRef.current) return offscreenCtxRef.current
    const canvas = canvasRef.current
    return canvas ? (canvas as any)._ctx : null
  }

  /**
   * Update particle physics
   */
  const updateParticle = (particle: Particle): Particle => {
    const { gravity, friction } = engineConfig

    return {
      ...particle,
      x: particle.x + particle.vx,
      y: particle.y + particle.vy,
      vx: particle.vx * friction,
      vy: particle.vy * friction + gravity,
      rotation: particle.rotation + particle.rotationSpeed,
      life: particle.life - particle.decay,
      alpha: Math.max(0, particle.life / particle.maxLife),
    }
  }

  /**
   * Draw particle
   */
  const drawParticle = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    particle: Particle
  ) => {
    ctx.save()
    ctx.translate(particle.x, particle.y)
    ctx.rotate(particle.rotation)
    ctx.globalAlpha = particle.alpha
    ctx.fillStyle = particle.color

    const size = particle.size * particle.alpha

    switch (particle.type) {
      case "circle":
        ctx.beginPath()
        ctx.arc(0, 0, size, 0, Math.PI * 2)
        ctx.fill()
        break

      case "square":
        ctx.fillRect(-size / 2, -size / 2, size, size)
        break

      case "triangle":
        ctx.beginPath()
        ctx.moveTo(0, -size)
        ctx.lineTo(size, size)
        ctx.lineTo(-size, size)
        ctx.closePath()
        ctx.fill()
        break

      case "star":
        drawStar(ctx, 0, 0, 5, size, size / 2)
        break
    }

    ctx.restore()
  }

  /**
   * Draw star shape
   */
  const drawStar = (
    ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ) => {
    let rot = (Math.PI / 2) * 3
    let x = cx
    let y = cy
    const step = Math.PI / spikes

    ctx.beginPath()
    ctx.moveTo(cx, cy - outerRadius)

    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius
      y = cy + Math.sin(rot) * outerRadius
      ctx.lineTo(x, y)
      rot += step

      x = cx + Math.cos(rot) * innerRadius
      y = cy + Math.sin(rot) * innerRadius
      ctx.lineTo(x, y)
      rot += step
    }

    ctx.lineTo(cx, cy - outerRadius)
    ctx.closePath()
    ctx.fill()
  }

  /**
   * Main render loop
   */
  const render = React.useCallback(() => {
    const ctx = getContext()
    const canvas = canvasRef.current
    if (!ctx || !canvas || !enabledRef.current) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Update and draw particles
    particlesRef.current = particlesRef.current
      .map(updateParticle)
      .filter((p) => p.life > 0)
      .slice(0, engineConfig.maxParticles)

    particlesRef.current.forEach((particle) => drawParticle(ctx, particle))

    // Continue loop
    rafRef.current = requestAnimationFrame(render)
  }, [])

  /**
   * Emit particles from an emitter
   */
  const emit = React.useCallback(
    (emitterConfig: EmitterConfig, count: number = 1) => {
      if (particlesRef.current.length >= engineConfig.maxParticles) return

      const now = Date.now()
      const timeSinceLastEmit = now - lastEmitRef.current
      const emissionInterval = 1000 / emitterConfig.rate

      if (timeSinceLastEmit < emissionInterval) return

      lastEmitRef.current = now

      const types: Array<"circle" | "square" | "triangle" | "star"> = ["circle", "square", "triangle", "star"]
      const type = emitterConfig.type ?? "circle"

      for (let i = 0; i < count; i++) {
        if (particlesRef.current.length >= engineConfig.maxParticles) break

        const angle = Math.random() * Math.PI * 2
        const speed =
          emitterConfig.speed.min + Math.random() * (emitterConfig.speed.max - emitterConfig.speed.min)
        const life =
          emitterConfig.life.min + Math.random() * (emitterConfig.life.max - emitterConfig.life.min)
        const size =
          emitterConfig.size.min + Math.random() * (emitterConfig.size.max - emitterConfig.size.min)
        const decay =
          emitterConfig.decay.min + Math.random() * (emitterConfig.decay.max - emitterConfig.decay.min)

        particlesRef.current.push({
          id: `${now}-${i}`,
          x: emitterConfig.x,
          y: emitterConfig.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size,
          life,
          maxLife: life,
          color: emitterConfig.colors[Math.floor(Math.random() * emitterConfig.colors.length)],
          alpha: 1,
          decay,
          type: type === "mixed" ? types[Math.floor(Math.random() * types.length)] : type,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.2,
        })
      }
    },
    [engineConfig.maxParticles]
  )

  /**
   * Emit particles at position
   */
  const emitAt = React.useCallback(
    (x: number, y: number, count: number = 10) => {
      emit(
        {
          x,
          y,
          rate: 60,
          spread: Math.PI * 2,
          speed: { min: 1, max: 3 },
          size: { min: 2, max: 6 },
          life: { min: 30, max: 60 },
          colors: ["hsl(221, 83%, 53%)", "hsl(263, 70%, 50%)", "hsl(174, 72%, 56%)"],
          decay: { min: 0.5, max: 1 },
        },
        count
      )
    },
    [emit]
  )

  /**
   * Clear all particles
   */
  const clear = React.useCallback(() => {
    particlesRef.current = []
  }, [])

  /**
   * Start the render loop
   */
  const start = React.useCallback(() => {
    enabledRef.current = true
    if (!rafRef.current) {
      render()
    }
  }, [render])

  /**
   * Stop the render loop
   */
  const stop = React.useCallback(() => {
    enabledRef.current = false
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = undefined
    }
  }, [])

  /**
   * Set enabled state
   */
  const setEnabled = React.useCallback((enabled: boolean) => {
    enabledRef.current = enabled
    if (enabled) {
      start()
    } else {
      stop()
    }
  }, [start, stop])

  // Get current particles count
  const getParticleCount = React.useCallback(() => particlesRef.current.length, [])

  // Start render loop on mount
  React.useEffect(() => {
    start()
    return stop
  }, [start, stop])

  return {
    canvasRef,
    emit,
    emitAt,
    clear,
    start,
    stop,
    setEnabled,
    getParticleCount,
    particles: particlesRef.current,
  }
}

// ============================================================================
// PARTICLE ENGINE COMPONENT
// ============================================================================

/**
 * ParticleEngineProps
 */
export interface ParticleEngineProps {
  /** Canvas width */
  width?: number
  /** Canvas height */
  height?: number
  /** Maximum particles */
  maxParticles?: number
  /** Gravity */
  gravity?: number
  /** Friction */
  friction?: number
  /** Additional CSS class names */
  className?: string
  /** Children to render on top */
  children?: React.ReactNode
  /** On engine ready callback */
  onReady?: (engine: ReturnType<typeof useParticleEngine>) => void
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

/**
 * ParticleEngine Component
 *
 * Canvas-based particle system for high-performance effects.
 *
 * @example
 * ```tsx
 * <ParticleEngine width={800} height={600} maxParticles={500}>
 *   <YourContent />
 * </ParticleEngine>
 * ```
 */
export function ParticleEngine({
  width = 800,
  height = 600,
  maxParticles = 500,
  gravity = 0.05,
  friction = 0.99,
  className,
  children,
  onReady,
  respectReducedMotion = true,
}: ParticleEngineProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  const engine = useParticleEngine({
    maxParticles: shouldDisable ? 0 : maxParticles,
    gravity,
    friction,
    enabled: !shouldDisable,
  })

  // Notify parent when engine is ready
  React.useEffect(() => {
    if (onReady) {
      onReady(engine)
    }
  }, [engine, onReady])

  return (
    <div className={cn("relative", className)} style={{ width, height }}>
      <canvas
        ref={engine.canvasRef}
        width={width}
        height={height}
        className="absolute inset-0 pointer-events-none"
        style={{ width: "100%", height: "100%" }}
      />
      {children}
    </div>
  )
}

// ============================================================================
// UTILITY HOOKS
// ============================================================================

/**
 * usePrefersReducedMotion Hook
 *
 * Detects user's reduced motion preference.
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    setPrefersReducedMotion(mediaQuery.matches)

    const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener("change", listener)

    return () => mediaQuery.removeEventListener("change", listener)
  }, [])

  return prefersReducedMotion
}

/**
 * useParticleEmitter Hook
 *
 * Convenience hook for emitting particles at specific coordinates.
 *
 * @example
 * ```tsx
 * const { emit } = useParticleEmitter()
 *
 * <div onClick={(e) => emit(e.clientX, e.clientY)}>
 *   Click me!
 * </div>
 * ```
 */
export function useParticleEmitter(config?: Partial<EmitterConfig>) {
  const engineRef = React.useRef<ReturnType<typeof useParticleEngine> | null>(null)

  const emitAt = React.useCallback((x: number, y: number, count: number = 10) => {
    engineRef.current?.emitAt(x, y, count)
  }, [])

  const setEngine = React.useCallback((engine: ReturnType<typeof useParticleEngine>) => {
    engineRef.current = engine
  }, [])

  return {
    emitAt,
    setEngine,
    engine: engineRef.current,
  }
}
