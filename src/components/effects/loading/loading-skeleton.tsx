/**
 * Loading Skeleton Component
 *
 * Enhanced skeleton screens with shimmer effect for loading states.
 * Provides placeholder UI that matches the structure of actual content.
 *
 * Features:
 * - Multiple shape variants (rect, circle, text, avatar)
 * - Shimmer animation
 * - Configurable dimensions
 * - Dark mode support
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { LoadingSkeleton } from "./loading-skeleton"
 *
 * <LoadingSkeleton variant="rect" width={200} height={100} />
 * <LoadingSkeleton variant="circle" width={40} height={40} />
 * <LoadingSkeleton variant="text" count={3} />
 * ```
 */

import * as React from "react"
import { motion, useReducedMotion } from "framer-motion"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Skeleton variant types
 */
export type SkeletonVariant = "rect" | "circle" | "text" | "avatar" | "custom"

/**
 * Animation variant
 */
export type SkeletonAnimation = "shimmer" | "pulse" | "wave" | "none"

/**
 * Loading skeleton configuration
 */
export interface LoadingSkeletonConfig {
  /** Shape variant */
  variant?: SkeletonVariant
  /** Animation type */
  animation?: SkeletonAnimation
  /** Width (px or CSS value) */
  width?: number | string
  /** Height (px or CSS value) */
  height?: number | string
  /** Number of skeleton items (for text variant) */
  count?: number
  /** Border radius */
  radius?: number | string
  /** Custom className */
  className?: string
  /** Shimmer color */
  shimmerColor?: string
  /** Base color */
  baseColor?: string
  /** Highlight color */
  highlightColor?: string
  /** Animation duration in ms */
  duration?: number
}

/**
 * Loading skeleton props
 */
export interface LoadingSkeletonProps extends LoadingSkeletonConfig, Omit<React.HTMLAttributes<HTMLDivElement>, "variant"> {
  /** Child elements for custom variant */
  children?: React.ReactNode
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default skeleton configuration
 */
export const DEFAULT_SKELETON_CONFIG: Required<Omit<LoadingSkeletonConfig, "className" | "children">> = {
  variant: "rect",
  animation: "shimmer",
  width: "100%",
  height: 20,
  count: 1,
  radius: 4,
  shimmerColor: "rgba(255, 255, 255, 0.3)",
  baseColor: "rgba(0, 0, 0, 0.05)",
  highlightColor: "rgba(255, 255, 255, 0.1)",
  duration: 1500,
}

/**
 * Variant-specific defaults
 */
export const VARIANT_STYLES: Record<SkeletonVariant, { radius: number | string; defaultWidth?: string; defaultHeight?: string }> = {
  rect: { radius: 4, defaultWidth: "100%", defaultHeight: "20px" },
  circle: { radius: "50%", defaultWidth: "40px", defaultHeight: "40px" },
  text: { radius: 4, defaultWidth: "100%", defaultHeight: "16px" },
  avatar: { radius: "50%", defaultWidth: "40px", defaultHeight: "40px" },
  custom: { radius: 0 },
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * LoadingSkeleton Component
 *
 * Animated skeleton placeholder for loading states
 */
export const LoadingSkeleton = React.forwardRef<HTMLDivElement, LoadingSkeletonProps>(
  ({
    variant = "rect",
    animation = "shimmer",
    width = "100%",
    height = 20,
    count = 1,
    radius,
    className,
    shimmerColor = "rgba(255, 255, 255, 0.3)",
    baseColor = "rgba(0, 0, 0, 0.05)",
    highlightColor = "rgba(255, 255, 255, 0.1)",
    duration = 1500,
    children,
    style,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const finalRadius = radius ?? VARIANT_STYLES[variant].radius
    const finalAnimation = prefersReducedMotion ? "none" : animation

    // Build base style
    const baseStyle: React.CSSProperties = {
      width: typeof width === "number" ? `${width}px` : width,
      height: typeof height === "number" ? `${height}px` : height,
      borderRadius: typeof finalRadius === "number" ? `${finalRadius}px` : finalRadius,
      backgroundColor: baseColor,
      position: "relative",
      overflow: "hidden",
      ...style,
    }

    // Shimmer animation variants
    const shimmerVariants = {
      hidden: { x: "-100%" },
      visible: {
        x: "100%",
        transition: {
          duration: duration / 1000,
          repeat: Infinity,
          repeatDelay: 0.5,
          ease: "linear",
        },
      },
    }

    // Pulse animation variants
    const pulseVariants = {
      hidden: { opacity: 0.5 },
      visible: {
        opacity: 1,
        transition: {
          duration: duration / 1000 / 2,
          repeat: Infinity,
          repeatType: "reverse" as const,
          ease: "easeInOut",
        },
      },
    }

    // Render shimmer overlay
    const renderShimmer = () => {
      if (finalAnimation === "none") return null

      if (finalAnimation === "shimmer") {
        return (
          <motion.span
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, transparent, ${shimmerColor}, transparent)`,
            }}
            variants={shimmerVariants}
            initial="hidden"
            animate="visible"
          />
        )
      }

      if (finalAnimation === "pulse") {
        return (
          <motion.span
            className="absolute inset-0"
            style={{ backgroundColor: highlightColor }}
            variants={pulseVariants}
            initial="hidden"
            animate="visible"
          />
        )
      }

      if (finalAnimation === "wave") {
        return (
          <motion.span
            className="absolute inset-0"
            style={{
              background: `linear-gradient(90deg, ${baseColor}, ${highlightColor}, ${baseColor})`,
              backgroundSize: "200% 100%",
            }}
            animate={{
              backgroundPosition: ["-100% 0", "200% 0"],
            }}
            transition={{
              duration: duration / 1000,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        )
      }

      return null
    }

    // Render multiple items for text variant
    if (variant === "text" && count > 1) {
      return (
        <div ref={ref} className={clsx("space-y-2", className)} {...props}>
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              style={{
                ...baseStyle,
                width: index === count - 1 ? "70%" : undefined, // Last line shorter
              }}
            >
              {renderShimmer()}
            </div>
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={className}
        style={baseStyle}
        {...props}
      >
        {variant === "custom" ? children : renderShimmer()}
      </div>
    )
  }
)

LoadingSkeleton.displayName = "LoadingSkeleton"

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * SkeletonRect - Rectangular skeleton
 */
export const SkeletonRect = React.forwardRef<HTMLDivElement, Omit<LoadingSkeletonProps, "variant">>((props, ref) => (
  <LoadingSkeleton ref={ref} variant="rect" {...props} />
))
SkeletonRect.displayName = "SkeletonRect"

/**
 * SkeletonCircle - Circular skeleton
 */
export const SkeletonCircle = React.forwardRef<HTMLDivElement, Omit<LoadingSkeletonProps, "variant">>((props, ref) => (
  <LoadingSkeleton ref={ref} variant="circle" {...props} />
))
SkeletonCircle.displayName = "SkeletonCircle"

/**
 * SkeletonText - Text line skeleton
 */
export const SkeletonText = React.forwardRef<HTMLDivElement, Omit<LoadingSkeletonProps, "variant">>((props, ref) => (
  <LoadingSkeleton ref={ref} variant="text" {...props} />
))
SkeletonText.displayName = "SkeletonText"

/**
 * SkeletonAvatar - Avatar skeleton
 */
export const SkeletonAvatar = React.forwardRef<HTMLDivElement, Omit<LoadingSkeletonProps, "variant">>((props, ref) => (
  <LoadingSkeleton ref={ref} variant="avatar" {...props} />
))
SkeletonAvatar.displayName = "SkeletonAvatar"

// ============================================================================
// COMPOSITE COMPONENTS
// ============================================================================

/**
 * SkeletonCard - Card with multiple skeletons
 */
export interface SkeletonCardProps {
  /** Show avatar */
  showAvatar?: boolean
  /** Number of text lines */
  textLines?: number
  /** Show button */
  showButton?: boolean
  /** Card className */
  className?: string
}

export function SkeletonCard({
  showAvatar = true,
  textLines = 3,
  showButton = true,
  className,
}: SkeletonCardProps) {
  return (
    <div className={clsx("p-4 rounded-lg border bg-card", className)}>
      {showAvatar && (
        <div className="flex items-center gap-3 mb-3">
          <LoadingSkeleton variant="avatar" width={40} height={40} />
          <div className="flex-1">
            <LoadingSkeleton variant="text" height={16} />
          </div>
        </div>
      )}
      <LoadingSkeleton variant="text" count={textLines} />
      {showButton && (
        <div className="mt-4">
          <LoadingSkeleton variant="rect" width={100} height={36} radius={6} />
        </div>
      )}
    </div>
  )
}

/**
 * SkeletonList - List of skeleton cards
 */
export interface SkeletonListProps {
  /** Number of cards */
  count?: number
  /** Card configuration */
  cardConfig?: SkeletonCardProps
  /** Container className */
  className?: string
}

export function SkeletonList({ count = 5, cardConfig, className }: SkeletonListProps) {
  return (
    <div className={clsx("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} {...cardConfig} />
      ))}
    </div>
  )
}

/**
 * SkeletonTable - Table skeleton
 */
export interface SkeletonTableProps {
  /** Number of rows */
  rows?: number
  /** Number of columns */
  columns?: number
  /** Show header */
  showHeader?: boolean
  /** Table className */
  className?: string
}

export function SkeletonTable({
  rows = 5,
  columns = 4,
  showHeader = true,
  className,
}: SkeletonTableProps) {
  return (
    <div className={clsx("w-full", className)}>
      {showHeader && (
        <div className="flex gap-4 mb-2 pb-2 border-b">
          {Array.from({ length: columns }).map((_, index) => (
            <LoadingSkeleton key={`header-${index}`} variant="text" height={20} className="flex-1" />
          ))}
        </div>
      )}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingSkeleton key={`cell-${rowIndex}-${colIndex}`} variant="text" height={16} className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Apply skeleton preset
 */
export function applySkeletonPreset(
  preset: "card" | "list" | "table" | "avatar" | "text",
  customConfig?: Partial<LoadingSkeletonProps>
): LoadingSkeletonProps {
  return {
    variant: preset === "avatar" ? "avatar" : preset === "text" ? "text" : "rect",
    ...customConfig,
  }
}
