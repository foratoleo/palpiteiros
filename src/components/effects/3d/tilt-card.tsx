"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"
import { useTilt, type TiltConfig } from "./use-tilt"
import { usePrefersReducedMotion } from "../particles/particle-engine"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Tilt intensity preset
 */
export type TiltIntensity = "subtle" | "medium" | "extreme" | "custom"

/**
 * TiltCard Props
 */
export interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tilt intensity preset */
  intensity?: TiltIntensity
  /** Custom max tilt angle (when intensity is "custom") */
  maxTilt?: number
  /** Scale factor on hover */
  scale?: number
  /** Enable specular highlights */
  specular?: boolean
  /** Enable holographic effect */
  holographic?: boolean
  /** Specular color */
  specularColor?: string
  /** Holographic colors (for gradient) */
  holographicColors?: [string, string, string]
  /** Border glow on hover */
  borderGlow?: boolean
  /** Border glow color */
  borderGlowColor?: string
  /** Perspective depth in pixels */
  perspective?: number
  /** Preserve 3D style */
  preserve3d?: boolean
  /** Content container class name */
  contentClassName?: string
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
}

// ============================================================================
// INTENSITY PRESETS
// ============================================================================

const intensityPresets: Record<TiltIntensity, { maxTilt: number; scale: number }> = {
  subtle: { maxTilt: 5, scale: 1.02 },
  medium: { maxTilt: 15, scale: 1.05 },
  extreme: { maxTilt: 30, scale: 1.1 },
  custom: { maxTilt: 15, scale: 1.05 },
}

// ============================================================================
// TILT CARD COMPONENT
// ============================================================================

/**
 * TiltCard Component
 *
 * Base card with 3D perspective and tilt effect.
 * Optimized with RAF throttling and GPU acceleration.
 *
 * @example
 * ```tsx
 * <TiltCard intensity="medium" specular>
 *   <div className="p-6">
 *     <h3>3D Tilt Card</h3>
 *     <p>Hover me to see the effect!</p>
 *   </div>
 * </TiltCard>
 * ```
 */
export function TiltCard({
  intensity = "medium",
  maxTilt: customMaxTilt,
  scale: customScale,
  specular = true,
  holographic = false,
  specularColor = "rgba(255, 255, 255, 0.5)",
  holographicColors = ["rgba(59, 130, 246, 0.3)", "rgba(139, 92, 246, 0.3)", "rgba(236, 72, 153, 0.3)"],
  borderGlow = false,
  borderGlowColor = "rgba(59, 130, 246, 0.5)",
  perspective = 1000,
  preserve3d = true,
  contentClassName,
  respectReducedMotion = true,
  className,
  children,
  ...props
}: TiltCardProps) {
  const prefersReducedMotion = usePrefersReducedMotion()
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  const preset = intensityPresets[intensity]
  const maxTilt = intensity === "custom" ? customMaxTilt ?? preset.maxTilt : preset.maxTilt
  const scale = customScale ?? preset.scale

  const tilt = useTilt<HTMLDivElement>({
    maxTilt,
    scale,
    enabled: !shouldDisable,
  })

  // Motion values for specular effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Specular highlight position
  const specularX = useTransform(mouseX, [-0.5, 0.5], ["0%", "100%"])
  const specularY = useTransform(mouseY, [-0.5, 0.5], ["0%", "100%"])

  // Update mouse position for specular
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    tilt.onMouseMove(e)

    if (!shouldDisable && tilt.ref.current) {
      const rect = tilt.ref.current.getBoundingClientRect()
      mouseX.set((e.clientX - rect.left) / rect.width - 0.5)
      mouseY.set((e.clientY - rect.top) / rect.height - 0.5)
    }
  }

  const springConfig = { stiffness: 300, damping: 30 }
  const rotateXSpring = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]),
    springConfig
  )
  const rotateYSpring = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]),
    springConfig
  )
  const scaleSpring = useSpring(
    useTransform([mouseX, mouseY] as const, () => (tilt.isHovered ? scale : 1)),
    springConfig
  )

  // Extract only safe HTML attributes (excluding conflicting Framer Motion props)
  const {
    onDrag,
    onDragStart,
    onDragEnd,
    onDragConstraints,
    ...safeProps
  } = props as any

  return (
    <motion.div
      ref={tilt.ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={tilt.onMouseEnter}
      onMouseLeave={tilt.onMouseLeave}
      style={{
        perspective: `${perspective}px`,
        transformStyle: preserve3d ? "preserve-3d" : "flat",
      }}
      className={cn("relative", className)}
      {...safeProps}
    >
      <motion.div
        style={{
          rotateX: shouldDisable ? 0 : rotateXSpring,
          rotateY: shouldDisable ? 0 : rotateYSpring,
          scale: shouldDisable ? 1 : scaleSpring,
          transformStyle: "preserve-3d",
          transform: "translateZ(0)", // Force GPU
          "--border-glow-color": borderGlowColor,
        } as React.CSSProperties}
        className={cn(
          "relative w-full h-full rounded-xl border border-border bg-card",
          "transition-shadow duration-300",
          tilt.isHovered && "shadow-xl",
          borderGlow && tilt.isHovered && "shadow-[0_0_30px_var(--border-glow-color)]"
        )}
      >
        {/* Specular highlight overlay */}
        {specular && !shouldDisable && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            style={{
              mixBlendMode: "overlay",
            }}
          >
            <motion.div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${specularX} ${specularY}, ${specularColor} 0%, transparent 50%)`,
                opacity: useTransform(
                  [mouseX, mouseY],
                  ([x, y]: number[]) => tilt.isHovered ? Math.max(0, 1 - Math.sqrt(x * x + y * y) * 2) : 0
                ),
              }}
            />
          </motion.div>
        )}

        {/* Holographic shimmer effect */}
        {holographic && !shouldDisable && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"
            style={{
              mixBlendMode: "color",
            }}
          >
            <motion.div
              className="absolute inset-0 opacity-0"
              style={{
                background: `linear-gradient(135deg, ${holographicColors[0]} 0%, ${holographicColors[1]} 50%, ${holographicColors[2]} 100%)`,
                opacity: useTransform(
                  [mouseX, mouseY] as const,
                  () => tilt.isHovered ? 0.6 : 0
                ),
              }}
              animate={
                tilt.isHovered
                  ? {
                      x: ["-100%", "100%"],
                    }
                  : false
              }
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          </motion.div>
        )}

        {/* Content with depth */}
        <div
          className={cn("relative", contentClassName)}
          style={{ transform: preserve3d ? "translateZ(30px)" : undefined }}
        >
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ============================================================================
// SPECIALIZED TILT CARD VARIANTS
// ============================================================================

/**
 * TiltCardSubtle Component
 *
 * Subtle tilt effect for minimal visual impact.
 *
 * @example
 * ```tsx
 * <TiltCardSubtle>
 *   <CardContent />
 * </TiltCardSubtle>
 * ```
 */
export function TiltCardSubtle(props: TiltCardProps) {
  return <TiltCard intensity="subtle" {...props} />
}

/**
 * TiltCardExtreme Component
 *
 * Extreme tilt effect for maximum visual impact.
 *
 * @example
 * ```tsx
 * <TiltCardExtreme holographic specular>
 *   <CardContent />
 * </TiltCardExtreme>
 * ```
 */
export function TiltCardExtreme(props: TiltCardProps) {
  return <TiltCard intensity="extreme" {...props} />
}

/**
 * GlassTiltCard Component
 *
 * Glassmorphism variant with blur effect.
 *
 * @example
 * ```tsx
 * <GlassTiltCard>
 *   <CardContent />
 * </GlassTiltCard>
 * ```
 */
export function GlassTiltCard(props: TiltCardProps) {
  return (
    <TiltCard
      className={cn(
        "bg-background/70 backdrop-blur-md",
        "border-white/10 dark:border-white/5",
        props.className
      )}
      specular
      {...props}
    >
      {props.children}
    </TiltCard>
  )
}

/**
 * GradientTiltCard Component
 *
 * Gradient background variant.
 *
 * @example
 * ```tsx
 * <GradientTiltCard from="blue-500" to="purple-500">
 *   <CardContent />
 * </GradientTiltCard>
 * ```
 */
export interface GradientTiltCardProps extends TiltCardProps {
  /** Gradient from color */
  from?: string
  /** Gradient via color */
  via?: string
  /** Gradient to color */
  to?: string
}

export function GradientTiltCard({
  from = "blue-500",
  via,
  to = "purple-500",
  className,
  contentClassName = "text-white",
  ...props
}: GradientTiltCardProps) {
  return (
    <TiltCard
      className={cn(
        "bg-gradient-to-br border-transparent",
        via ? `from-${from} via-${via} to-${to}` : `from-${from} to-${to}`,
        className
      )}
      contentClassName={contentClassName}
      holographic={false}
      {...props}
    >
      {props.children}
    </TiltCard>
  )
}

/**
 * NeonTiltCard Component
 *
 * Neon glow effect variant.
 *
 * @example
 * ```tsx
 * <NeonTiltCard color="cyan" intensity="extreme">
 *   <CardContent />
 * </NeonTiltCard>
 * ```
 */
export interface NeonTiltCardProps extends TiltCardProps {
  /** Neon color */
  color?: "cyan" | "magenta" | "lime" | "yellow"
}

const neonColors = {
  cyan: "0, 255, 255",
  magenta: "255, 0, 255",
  lime: "0, 255, 0",
  yellow: "255, 255, 0",
}

export function NeonTiltCard({
  color = "cyan",
  className,
  ...props
}: NeonTiltCardProps) {
  const rgb = neonColors[color]

  return (
    <TiltCard
      className={cn(
        "bg-black/80 border-2",
        `shadow-[0_0_20px_rgba(${rgb},0.3)]`,
        `hover:shadow-[0_0_40px_rgba(${rgb},0.6)]`,
        className
      )}
      style={{
        borderColor: `rgb(${rgb})`,
      } as React.CSSProperties}
      borderGlow
      borderGlowColor={`rgba(${rgb}, 0.8)`}
      intensity="extreme"
      {...props}
    >
      {props.children}
    </TiltCard>
  )
}
