"use client"

import * as React from "react"
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

/**
 * Hero 3D Card Props
 */
export interface Hero3DCardProps {
  /** Card content */
  children: React.ReactNode
  /** Maximum tilt angle in degrees (default: 15) */
  maxTilt?: number
  /** Enable holographic effect (default: true) */
  holographic?: boolean
  /** Enable specular highlights (default: true) */
  specular?: boolean
  /** Card depth scale (default: 1.02) */
  depthScale?: number
  /** Background gradient class */
  gradient?: string
  /** Border color class */
  borderColor?: string
  /** Additional CSS class names */
  className?: string
  /** Content container class names */
  contentClassName?: string
  /** On click handler */
  onClick?: () => void
  /** Enable glare effect (default: true) */
  glare?: boolean
  /** Glare opacity (default: 0.3) */
  glareOpacity?: number
  /** Glow color class */
  glowColor?: string
  /** Floating animation (default: true) */
  floating?: boolean
}

/**
 * Hero 3D Card Component
 *
 * Enhanced hero card with 3D tilt, specular highlights, and holographic gradient.
 *
 * @example
 * ```tsx
 * <Hero3DCard maxTilt={20} holographic>
 *   <h2>Hero Content</h2>
 *   <p>This card responds to mouse movement</p>
 * </Hero3DCard>
 * ```
 */
export function Hero3DCard({
  children,
  maxTilt = 15,
  holographic = true,
  specular = true,
  depthScale = 1.02,
  gradient = "bg-card",
  borderColor = "border-border",
  className,
  contentClassName,
  onClick,
  glare = true,
  glareOpacity = 0.15,
  glowColor = "glow-primary",
  floating = true,
}: Hero3DCardProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isHovered = useMotionValue(0)
  const isPressed = useMotionValue(0)

  // Motion values for smooth transforms
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Spring physics for smooth animation
  const springConfig = { damping: 20, stiffness: 300 }
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [maxTilt, -maxTilt]), springConfig)
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-maxTilt, maxTilt]), springConfig)

  // Scale based on hover and press
  const scale = useSpring(
    useTransform(
      [isHovered, isPressed],
      ([hovered, pressed]: number[]) => {
        if (pressed) return 0.98
        if (hovered) return depthScale
        return 1
      }
    ),
    springConfig
  )

  // Handle mouse move with RAF throttling
  const handleMouseMove = React.useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!ref.current) return

      const rect = ref.current.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      mouseX.set(x)
      mouseY.set(y)
    },
    [mouseX, mouseY]
  )

  // Handle mouse leave
  const handleMouseLeave = () => {
    isHovered.set(0)
    isPressed.set(0)
    mouseX.set(0)
    mouseY.set(0)
  }

  // Handle mouse enter
  const handleMouseEnter = () => {
    isHovered.set(1)
  }

  // Handle mouse down/up
  const handleMouseDown = () => isPressed.set(1)
  const handleMouseUp = () => isPressed.set(0)

  return (
    <motion.div
      ref={ref}
      style={{
        rotateX,
        rotateY,
        scale,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-xl border overflow-hidden",
        "transform-gpu", // Force GPU acceleration
        gradient,
        borderColor,
        "transition-all duration-300",
        isHovered && "shadow-2xl shadow-primary/20",
        className
      )}
    >
      {/* Holographic shimmer effect */}
      {holographic && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            mixBlendMode: "overlay",
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)"
          }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Specular highlight overlay */}
      {specular && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%)",
            mixBlendMode: "overlay",
          }}
          animate={{ opacity: isHovered ? 0.6 : 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Edge glow effect */}
      {holographic && (
        <motion.div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "transition-colors duration-300"
          )}
          style={{
            boxShadow: isHovered
              ? `inset 0 0 30px ${glowColor === "glow-primary" ? "rgba(59, 130, 246, 0.1)" : glowColor}, inset 0 0 60px ${glowColor === "glow-primary" ? "rgba(59, 130, 246, 0.05)" : glowColor}`
              : "none",
          }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Floating animation */}
      {floating && !isHovered && (
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <div
            className={cn(
              "relative",
              "transform-gpu",
              contentClassName
            )}
            style={{ transform: "translateZ(30px)" }}
          >
            {children}
          </div>
        </motion.div>
      )}

      {/* Content when hovered or floating disabled */}
      {(!floating || isHovered) && (
        <div
          className={cn(
            "relative",
            "transform-gpu",
            contentClassName
          )}
          style={{ transform: "translateZ(30px)" }}
        >
          {children}
        </div>
      )}
    </motion.div>
  )
}

/**
 * Hero 3D Card Simple Props
 */
export interface Hero3DCardSimpleProps {
  /** Card content */
  children: React.ReactNode
  /** Tilt intensity (1-10, default: 3) */
  intensity?: number
  /** Additional CSS class names */
  className?: string
  /** On click handler */
  onClick?: () => void
}

/**
 * Hero 3D Card Simple Component
 *
 * Simplified version with subtle 3D effect for better performance.
 *
 * @example
 * ```tsx
 * <Hero3DCardSimple intensity={5}>
 *   <div>Card Content</div>
 * </Hero3DCardSimple>
 * ```
 */
export function Hero3DCardSimple({
  children,
  intensity = 3,
  className,
  onClick,
}: Hero3DCardSimpleProps) {
  return (
    <motion.div
      whileHover={{
        scale: 1.02,
        rotateX: intensity * 0.3,
        rotateY: intensity * 0.3,
        transition: { type: "spring", stiffness: 400, damping: 30 },
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative rounded-xl border border-border bg-card overflow-hidden",
        "transition-all duration-200",
        "hover:shadow-xl hover:shadow-primary/10",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

/**
 * Hero 3D Card Glass Props
 */
export interface Hero3DCardGlassProps extends Hero3DCardProps {
  /** Blur amount (default: blur-lg) */
  blur?: string
}

/**
 * Hero 3D Card Glass Component
 *
 * Glassmorphism variant of the Hero 3D card.
 *
 * @example
 * ```tsx
 * <Hero3DCardGlass blur="blur-xl">
 *   <h2>Glass Card</h2>
 * </Hero3DCardGlass>
 * ```
 */
export function Hero3DCardGlass({
  children,
  blur = "backdrop-blur-lg",
  className,
  contentClassName,
  ...props
}: Hero3DCardGlassProps) {
  return (
    <Hero3DCard
      className={cn(
        "bg-background/50 backdrop-blur-md",
        "border-white/10 dark:border-white/5",
        className
      )}
      contentClassName={contentClassName}
      {...props}
    >
      {children}
    </Hero3DCard>
  )
}

/**
 * Hero 3D Card Gradient Props
 */
export interface Hero3DCardGradientProps extends Hero3DCardProps {
  /** Gradient from color */
  from?: string
  /** Gradient via color */
  via?: string
  /** Gradient to color */
  to?: string
}

/**
 * Hero 3D Card Gradient Component
 *
 * Gradient variant of the Hero 3D card.
 *
 * @example
 * ```tsx
 * <Hero3DCardGradient from="blue-500" to="purple-500">
 *   <h2>Gradient Card</h2>
 * </Hero3DCardGradient>
 * ```
 */
export function Hero3DCardGradient({
  children,
  from = "primary",
  via,
  to = "accent",
  className,
  contentClassName = "text-white",
  ...props
}: Hero3DCardGradientProps) {
  return (
    <Hero3DCard
      className={cn(
        "bg-gradient-to-br",
        via ? `from-${from} via-${via} to-${to}` : `from-${from} to-${to}`,
        "border-transparent",
        className
      )}
      contentClassName={contentClassName}
      holographic={false}
      {...props}
    >
      {children}
    </Hero3DCard>
  )
}
