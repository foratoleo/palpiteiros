"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { useParticleEngine, type EmitterConfig } from "./particle-engine"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Confetti preset
 */
export type ConfettiPreset = "celebration" | "explosion" | "rain" | "cannon" | "burst"

/**
 * Confetti Effect Props
 */
export interface ConfettiEffectProps {
  /** Trigger the confetti effect */
  trigger?: boolean
  /** Confetti preset */
  preset?: ConfettiPreset
  /** Number of particles */
  count?: number
  /** Origin x position (0-1 or px) */
  originX?: number
  /** Origin y position (0-1 or px) */
  originY?: number
  /** Spread angle in radians */
  spread?: number
  /** Particle colors */
  colors?: string[]
  /** Auto-reset after animation */
  autoReset?: boolean
  /** On complete callback */
  onComplete?: () => void
  /** Additional CSS class names */
  className?: string
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

const confettiPresets: Record<
  ConfettiPreset,
  {
    gravity: number
    friction: number
    speed: [number, number]
    size: [number, number]
    life: [number, number]
    decay: [number, number]
    spread: number
  }
> = {
  celebration: {
    gravity: 0.15,
    friction: 0.98,
    speed: [3, 8],
    size: [5, 12],
    life: [100, 180],
    decay: [0.3, 0.6],
    spread: Math.PI * 2,
  },
  explosion: {
    gravity: 0.2,
    friction: 0.96,
    speed: [8, 15],
    size: [4, 10],
    life: [60, 120],
    decay: [0.5, 1],
    spread: Math.PI * 2,
  },
  rain: {
    gravity: 0.3,
    friction: 0.99,
    speed: [0, 2],
    size: [6, 14],
    life: [150, 250],
    decay: [0.2, 0.4],
    spread: Math.PI * 0.5,
  },
  cannon: {
    gravity: 0.25,
    friction: 0.97,
    speed: [10, 18],
    size: [5, 12],
    life: [80, 150],
    decay: [0.4, 0.8],
    spread: Math.PI * 0.3,
  },
  burst: {
    gravity: 0.1,
    friction: 0.98,
    speed: [5, 10],
    size: [4, 10],
    life: [80, 140],
    decay: [0.4, 0.7],
    spread: Math.PI * 1.5,
  },
}

const defaultColors = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Yellow
  "#DDA0DD", // Plum
  "#FF9FF3", // Pink
  "#54A0FF", // Sky
  "#5F27CD", // Purple
  "#FF6348", // Tomato
]

// ============================================================================
// CONFETTI EFFECT COMPONENT
// ============================================================================

/**
 * ConfettiEffect Component
 *
 * Celebration confetti particles on achievements.
 * Automatically cleans up after animation completes.
 *
 * @example
 * ```tsx
 * const [celebrate, setCelebrate] = useState(false)
 *
 * <button onClick={() => setCelebrate(true)}>Achievement Unlocked!</button>
 * <ConfettiEffect trigger={celebrate} preset="celebration" onComplete={() => setCelebrate(false)} />
 * ```
 */
export function ConfettiEffect({
  trigger = false,
  preset = "celebration",
  count = 150,
  originX = 0.5,
  originY = 0.5,
  spread,
  colors = defaultColors,
  autoReset = true,
  onComplete,
  className,
  respectReducedMotion = true,
}: ConfettiEffectProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  const [isActive, setIsActive] = React.useState(false)
  const emissionCompleteRef = React.useRef(false)

  const presetConfig = confettiPresets[preset]
  const effectiveSpread = spread ?? presetConfig.spread

  // Initialize engine
  const engine = useParticleEngine({
    maxParticles: count * 1.5,
    gravity: presetConfig.gravity,
    friction: presetConfig.friction,
    enabled: trigger && isActive,
  })

  // Update dimensions
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

  // Emit confetti when triggered
  React.useEffect(() => {
    if (!trigger || isActive) return

    setIsActive(true)
    emissionCompleteRef.current = false

    // Calculate origin position
    const x = originX < 1 ? originX * dimensions.width : originX
    const y = originY < 1 ? originY * dimensions.height : originY

    // Create emitter config
    const config: EmitterConfig = {
      x,
      y,
      rate: 120, // Emit 2x per frame at 60fps
      spread: effectiveSpread,
      speed: { min: presetConfig.speed[0], max: presetConfig.speed[1] },
      size: { min: presetConfig.size[0], max: presetConfig.size[1] },
      life: { min: presetConfig.life[0], max: presetConfig.life[1] },
      colors,
      decay: { min: presetConfig.decay[0], max: presetConfig.decay[1] },
      type: "square",
    }

    // Burst emit
    let emitted = 0
    const emitInterval = setInterval(() => {
      const remaining = count - emitted
      const toEmit = Math.min(10, remaining) // Emit 10 particles per frame
      engine.emit(config, toEmit)
      emitted += toEmit

      if (emitted >= count) {
        clearInterval(emitInterval)
        emissionCompleteRef.current = true
      }
    }, 16)

    return () => clearInterval(emitInterval)
  }, [trigger, isActive, count, originX, originY, dimensions, presetConfig, effectiveSpread, colors, engine])

  // Check for completion
  React.useEffect(() => {
    if (!isActive || !emissionCompleteRef.current) return

    const checkComplete = setInterval(() => {
      const particleCount = engine.getParticleCount()
      if (particleCount === 0) {
        clearInterval(checkComplete)
        setIsActive(false)
        onComplete?.()
      }
    }, 500)

    return () => clearInterval(checkComplete)
  }, [isActive, engine, onComplete])

  // Reset trigger if auto-reset is enabled
  React.useEffect(() => {
    if (autoReset && !isActive && trigger) {
      onComplete?.()
    }
  }, [autoReset, isActive, trigger, onComplete])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
    >
      <canvas
        ref={engine.canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />
    </div>
  )
}

// ============================================================================
// SPECIALIZED CONFETTI VARIANTS
// ============================================================================

/**
 * CelebrationConfetti Props
 */
export interface CelebrationConfettiProps extends Omit<ConfettiEffectProps, "preset"> {
  /** Auto-trigger on mount */
  autoTrigger?: boolean
}

/**
 * CelebrationConfetti Component
 *
 * Full-screen celebration confetti.
 * Perfect for achievements, milestones, victories.
 *
 * @example
 * ```tsx
 * <CelebrationConfetti trigger={showConfetti} />
 * ```
 */
export function CelebrationConfetti({ autoTrigger = false, ...props }: CelebrationConfettiProps) {
  const [trigger, setTrigger] = React.useState(autoTrigger)

  React.useEffect(() => {
    if (autoTrigger) {
      setTrigger(true)
    }
  }, [autoTrigger])

  return (
    <ConfettiEffect
      trigger={trigger}
      preset="celebration"
      count={200}
      originX={0.5}
      originY={0.3}
      {...props}
      onComplete={() => {
        setTrigger(false)
        props.onComplete?.()
      }}
    />
  )
}

/**
 * CannonConfetti Component
 *
 * Cannon-style confetti from bottom center.
 *
 * @example
 * ```tsx
 * <CannonConfetti trigger={fire} />
 * ```
 */
export function CannonConfetti(props: ConfettiEffectProps) {
  return (
    <ConfettiEffect
      preset="cannon"
      originX={0.5}
      originY={1}
      spread={Math.PI * 0.5}
      {...props}
    />
  )
}

/**
 * ExplosionConfetti Component
 *
 * Explosion effect from center.
 *
 * @example
 * ```tsx
 * <ExplosionConfetti trigger={explode} />
 * ```
 */
export function ExplosionConfetti(props: ConfettiEffectProps) {
  return <ConfettiEffect preset="explosion" originX={0.5} originY={0.5} {...props} />
}

/**
 * ConfettiRain Component
 *
 * Continuous confetti rain effect.
 *
 * @example
 * ```tsx
 * <ConfettiRain active={true} />
 * ```
 */
export interface ConfettiRainProps {
  /** Active state */
  active?: boolean
  /** Duration in ms */
  duration?: number
  /** Confetti count per second */
  intensity?: number
  /** On complete callback */
  onComplete?: () => void
  /** Additional CSS class names */
  className?: string
}

/**
 * ConfettiRain Component
 *
 * Gentle confetti falling from top.
 */
export function ConfettiRain({
  active = false,
  duration = 5000,
  intensity = 30,
  onComplete,
  className,
}: ConfettiRainProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = React.useState({ width: 800, height: 600 })
  const intervalRef = React.useRef<number>()

  const engine = useParticleEngine({
    maxParticles: 500,
    gravity: 0.2,
    friction: 0.99,
  })

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
    if (!active) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    const config: EmitterConfig = {
      x: dimensions.width / 2,
      y: -10,
      rate: intensity,
      spread: Math.PI * 0.5,
      speed: { min: 0, max: 2 },
      size: { min: 6, max: 14 },
      life: { min: 150, max: 250 },
      colors: defaultColors,
      decay: { min: 0.2, max: 0.4 },
      type: "square",
    }

    // Vary x position
    let xOffset = 0
    intervalRef.current = window.setInterval(() => {
      config.x = (dimensions.width / 2) + Math.sin(xOffset) * (dimensions.width * 0.4)
      engine.emit(config, 2)
      xOffset += 0.1
    }, 1000 / intensity)

    const timeout = setTimeout(() => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      onComplete?.()
    }, duration)

    return () => {
      clearTimeout(timeout)
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [active, dimensions, intensity, duration, engine, onComplete])

  return (
    <div
      ref={containerRef}
      className={cn("absolute inset-0 pointer-events-none overflow-hidden", className)}
    >
      <canvas
        ref={engine.canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0"
      />
    </div>
  )
}

// ============================================================================
// CONFETTI BUTTON COMPONENT
// ============================================================================

/**
 * ConfettiButtonProps
 */
export interface ConfettiButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Children */
  children: React.ReactNode
  /** Confetti preset */
  preset?: ConfettiPreset
  /** Confetti count */
  count?: number
  /** Button variant */
  variant?: "default" | "success" | "danger" | "primary"
}

/**
 * ConfettiButton Component
 *
 * Button that triggers confetti on click.
 *
 * @example
 * ```tsx
 * <ConfettiButton preset="celebration" count={100}>
 *   Click to Celebrate!
 * </ConfettiButton>
 * ```
 */
export function ConfettiButton({
  children,
  preset = "celebration",
  count = 80,
  variant = "default",
  onClick,
  className,
  ...props
}: ConfettiButtonProps) {
  const [trigger, setTrigger] = React.useState(false)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setTrigger(true)
    onClick?.(e)
    setTimeout(() => setTrigger(false), 100)
  }

  const variantStyles = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    success: "bg-success text-white hover:bg-success/90",
    danger: "bg-danger text-white hover:bg-danger/90",
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
  }

  // Filter out Framer Motion drag handlers that conflict with HTML props
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onDragConstraints,
    whileDrag,
    drag,
    dragConstraints,
    dragSnapToOrigin,
    dragElastic,
    dragMomentum,
    dragPropagation,
    dragListener,
    dragControls,
    ...safeButtonProps
  } = (props || {}) as any

  return (
    <div className="relative inline-block">
      <ConfettiEffect
        trigger={trigger}
        preset={preset}
        count={count}
        originX={0.5}
        originY={1}
        className="absolute inset-0 -z-10"
      />
      <motion.button
        whileTap={{ scale: 0.95 }}
        whileHover={{ scale: 1.02 }}
        onClick={handleClick}
        className={cn(
          "relative px-6 py-3 rounded-lg font-medium transition-colors",
          variantStyles[variant],
          className
        )}
        {...safeButtonProps}
      >
        {children}
      </motion.button>
    </div>
  )
}
