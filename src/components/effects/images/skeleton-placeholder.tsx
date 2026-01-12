/**
 * Skeleton Placeholder Component
 *
 * T32.2: Animated skeleton placeholder for loading images and content.
 * Provides a visual placeholder during image loading with shimmer effect.
 *
 * @features
 * - Configurable shimmer animation
 * - Customizable shapes and sizes
 * - Pulse animation option
 * - Reduced motion support
 * - Accessible loading indication
 *
 * @performance
 * - CSS-based animations (GPU accelerated)
 * - No layout shifts
 * - Minimal re-renders
 *
 * @example
 * ```tsx
 * import { ImageSkeleton } from '@/components/effects/images/skeleton-placeholder'
 *
 * <ImageSkeleton
 *   width={400}
 *   height={300}
 *   variant="rounded"
 *   shimmer
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type SkeletonVariant = 'rect' | 'circle' | 'rounded' | 'text'

export interface ImageSkeletonProps {
  /** Skeleton width */
  width?: number | string
  /** Skeleton height */
  height?: number | string
  /** Skeleton variant/shape */
  variant?: SkeletonVariant
  /** Show shimmer animation */
  shimmer?: boolean
  /** Show pulse animation */
  pulse?: boolean
  /** Custom CSS class names */
  className?: string
  /** Background color */
  backgroundColor?: string
  /** Shimmer color */
  shimmerColor?: string
  /** Animation duration in ms */
  duration?: number
  /** Number of text lines (for text variant) */
  lines?: number
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean
}

export interface SkeletonImageProps {
  /** Image source */
  src: string
  /** Alt text */
  alt: string
  /** Image width */
  width?: number
  /** Image height */
  height?: number
  /** Skeleton variant */
  variant?: SkeletonVariant
  /** Show shimmer */
  shimmer?: boolean
  /** Custom CSS class names */
  className?: string
  /** Image class */
  imageClassName?: string
  /** Loading callback */
  onLoad?: () => void
  /** Error callback */
  onError?: () => void
  /** Fallback component */
  fallback?: React.ReactNode
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BG_COLOR = 'hsl(var(--muted) / 0.5)'
const DEFAULT_SHIMMER_COLOR = 'hsl(var(--muted) / 0.8)'
const DEFAULT_DURATION = 1500

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for reduced motion preference
 */
function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handleChange = () => setPrefersReduced(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Image Skeleton Component
 *
 * Animated skeleton placeholder for loading images.
 */
export function ImageSkeleton({
  width = '100%',
  height = 200,
  variant = 'rounded',
  shimmer = true,
  pulse = false,
  className,
  backgroundColor = DEFAULT_BG_COLOR,
  shimmerColor = DEFAULT_SHIMMER_COLOR,
  duration = DEFAULT_DURATION,
  respectReducedMotion = true
}: ImageSkeletonProps) {
  const prefersReduced = useReducedMotion()
  const shouldAnimate = !respectReducedMotion || !prefersReduced

  const variantStyles: Record<SkeletonVariant, string> = {
    rect: 'rounded-none',
    circle: 'rounded-full',
    rounded: 'rounded-md',
    text: 'rounded-sm h-4'
  }

  // For text variant, generate multiple lines
  if (variant === 'text') {
    return (
      <div className={cn('image-skeleton-text space-y-2', className)} style={{ width }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <motion.div
            key={i}
            className={cn('h-4', variantStyles.text)}
            style={{
              backgroundColor,
              width: i === 2 ? '60%' : '100%'
            }}
            animate={
              shouldAnimate && pulse
                ? {
                    opacity: [0.6, 1, 0.6]
                  }
                : undefined
            }
            transition={
              shouldAnimate
                ? {
                    duration: duration / 1000,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }
                : undefined
            }
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn('image-skeleton relative overflow-hidden', variantStyles[variant], className)}
      style={{ width, height, backgroundColor }}
    >
      {/* Shimmer effect */}
      {shimmer && shouldAnimate && (
        <motion.div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(
              90deg,
              transparent 0%,
              ${shimmerColor} 50%,
              transparent 100%
            )`,
              backgroundSize: '200% 100%'
          }}
          animate={{
            backgroundPosition: ['200% 0', '-200% 0']
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: 'linear'
          }}
          aria-hidden="true"
        />
      )}

      {/* Pulse effect */}
      {pulse && shouldAnimate && (
        <motion.div
          className="absolute inset-0"
          style={{ backgroundColor: shimmerColor }}
          animate={{
            opacity: [0, 0.5, 0]
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}

/**
 * Skeleton with Image Component
 *
 * Shows skeleton while image loads, then reveals image with fade-in.
 */
export function SkeletonImage({
  src,
  alt,
  width = 400,
  height = 300,
  variant = 'rounded',
  shimmer = true,
  className,
  imageClassName,
  onLoad,
  onError,
  fallback
}: SkeletonImageProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [hasError, setHasError] = React.useState(false)
  const prefersReduced = useReducedMotion()
  const shouldAnimate = !prefersReduced

  const handleLoad = React.useCallback(() => {
    setIsLoading(false)
    onLoad?.()
  }, [onLoad])

  const handleError = React.useCallback(() => {
    setIsLoading(false)
    setHasError(true)
    onError?.()
  }, [onError])

  return (
    <div className={cn('skeleton-image relative', className)} style={{ width, height }}>
      {/* Skeleton placeholder */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: shouldAnimate ? 0.3 : 0 }}
          >
            <ImageSkeleton
              width="100%"
              height="100%"
              variant={variant}
              shimmer={shimmer}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actual image */}
      <AnimatePresence>
        {!isLoading && !hasError && (
          <motion.img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={cn(
              'w-full h-full object-cover',
              variant === 'circle' && 'rounded-full',
              variant === 'rounded' && 'rounded-md',
              imageClassName
            )}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: shouldAnimate ? 0.3 : 0 }}
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </AnimatePresence>

      {/* Error fallback */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20">
          {fallback || (
            <svg
              className="w-8 h-8 text-muted-foreground/30"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * Card Skeleton Component
 *
 * Complete card skeleton with multiple elements.
 */
export interface CardSkeletonProps {
  /** Show image area */
  showImage?: boolean
  /** Image height */
  imageHeight?: number
  /** Number of text lines */
  lines?: number
  /** Show action button */
  showActions?: boolean
  /** Custom CSS class names */
  className?: string
  /** Shimmer effect */
  shimmer?: boolean
}

export function CardSkeleton({
  showImage = true,
  imageHeight = 200,
  lines = 3,
  showActions = true,
  className,
  shimmer = true
}: CardSkeletonProps) {
  return (
    <div className={cn('card-skeleton space-y-4', className)}>
      {/* Image skeleton */}
      {showImage && (
        <ImageSkeleton
          width="100%"
          height={imageHeight}
          variant="rounded"
          shimmer={shimmer}
        />
      )}

      {/* Content skeleton */}
      <div className="space-y-3 p-4">
        {/* Title */}
        <ImageSkeleton
          width="70%"
          height={24}
          variant="rect"
          shimmer={shimmer}
        />

        {/* Text lines */}
        {Array.from({ length: lines }).map((_, i) => (
          <ImageSkeleton
            key={i}
            width={i === lines - 1 ? '80%' : '100%'}
            height={16}
            variant="rect"
            shimmer={shimmer}
          />
        ))}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <ImageSkeleton
              width={80}
              height={36}
              variant="rounded"
              shimmer={shimmer}
            />
            <ImageSkeleton
              width={80}
              height={36}
              variant="rounded"
              shimmer={shimmer}
            />
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Grid Skeleton Component
 *
 * Skeleton grid for loading card lists.
 */
export interface GridSkeletonProps {
  /** Number of skeleton cards */
  count?: number
  /** Columns */
  columns?: number
  /** Card skeleton props */
  cardProps?: Omit<CardSkeletonProps, 'className'>
  /** Custom CSS class names */
  className?: string
}

export function GridSkeleton({
  count = 6,
  columns = 3,
  cardProps,
  className
}: GridSkeletonProps) {
  const gridStyle = React.useMemo(() => ({
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
    gap: '1rem'
  }), [columns])

  return (
    <div className={cn('grid-skeleton', className)} style={gridStyle}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} {...cardProps} />
      ))}
    </div>
  )
}

/**
 * Avatar Skeleton Component
 *
 * Skeleton for avatar loading.
 */
export interface AvatarSkeletonProps {
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Shimmer effect */
  shimmer?: boolean
  /** Custom CSS class names */
  className?: string
}

const avatarSizes = {
  sm: { width: 32, height: 32 },
  md: { width: 40, height: 40 },
  lg: { width: 48, height: 48 },
  xl: { width: 64, height: 64 }
}

export function AvatarSkeleton({
  size = 'md',
  shimmer = true,
  className
}: AvatarSkeletonProps) {
  const { width, height } = avatarSizes[size]

  return (
    <ImageSkeleton
      width={width}
      height={height}
      variant="circle"
      shimmer={shimmer}
      className={className}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ImageSkeleton
