/**
 * Blur-Up Loader Component
 *
 * T32.1: Progressive image loading with blur-to-sharp transition.
 * Provides a smooth loading experience with a blurred placeholder that sharpens on load.
 *
 * @features
 * - Blur-to-sharp transition on image load
 * - Placeholder color or low-res image
 * - Configurable blur amount
 * - Fade-in animation
 * - Reduced motion support
 * - Error handling
 *
 * @performance
 * - Uses native CSS filters for blur
 * - GPU-accelerated transitions
 * - Preloads critical images
 *
 * @example
 * ```tsx
 * import { BlurUpLoader } from '@/components/effects/images/blur-up-loader'
 *
 * <BlurUpLoader
 *   src="/market-image.jpg"
 *   alt="Market"
 *   placeholderColor="#e5e7eb"
 *   blurAmount={20}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface BlurUpLoaderProps {
  /** Image source */
  src: string
  /** Alt text for accessibility */
  alt: string
  /** Placeholder color (hex) */
  placeholderColor?: string
  /** Low-res placeholder image URL */
  placeholderSrc?: string
  /** Blur amount in pixels (0-100) */
  blurAmount?: number
  /** Transition duration in ms */
  transitionDuration?: number
  /** Image width */
  width?: number
  /** Image height */
  height?: number
  /** Fill container */
  fill?: boolean
  /** Object fit */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
  /** Custom CSS class names */
  className?: string
  /** Image wrapper class */
  imageClassName?: string
  /** Loading state callback */
  onLoad?: () => void
  /** Error state callback */
  onError?: () => void
  /** Quality (1-100) */
  quality?: number
  /** Priority loading */
  priority?: boolean
  /** Enable blur transition */
  enableBlur?: boolean
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_BLUR_AMOUNT = 20
const DEFAULT_TRANSITION_DURATION = 500
const DEFAULT_QUALITY = 75

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
 * Blur-Up Loader Component
 *
 * Displays a blurred placeholder that transitions to sharp when the image loads.
 */
export const BlurUpLoader = React.forwardRef<HTMLImageElement, BlurUpLoaderProps>(
  function BlurUpLoader(
    {
      src,
      alt,
      placeholderColor = '#e5e7eb',
      placeholderSrc,
      blurAmount = DEFAULT_BLUR_AMOUNT,
      transitionDuration = DEFAULT_TRANSITION_DURATION,
      width,
      height,
      fill = false,
      objectFit = 'cover',
      className,
      imageClassName,
      onLoad,
      onError,
      quality = DEFAULT_QUALITY,
      priority = false,
      enableBlur = true,
      respectReducedMotion = true
    },
    ref
  ) {
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasError, setHasError] = React.useState(false)
    const [isInView, setIsInView] = React.useState(priority)
    const prefersReduced = useReducedMotion()
    const shouldAnimate = !respectReducedMotion || !prefersReduced
    const imgRef = React.useRef<HTMLImageElement>(null)

    // Merge refs
    React.useImperativeHandle(ref, () => imgRef.current!)

    // Intersection observer for lazy loading
    React.useEffect(() => {
      if (priority) return

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setIsInView(true)
            observer.disconnect()
          }
        },
        { rootMargin: '50px' }
      )

      const currentRef = imgRef.current
      if (currentRef) {
        observer.observe(currentRef)
      }

      return () => observer.disconnect()
    }, [priority])

    // Handle image load
    const handleLoad = React.useCallback(() => {
      setIsLoading(false)
      onLoad?.()
    }, [onLoad])

    // Handle image error
    const handleError = React.useCallback(() => {
      setIsLoading(false)
      setHasError(true)
      onError?.()
    }, [onError])

    const objectFitClass = {
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
      'scale-down': 'object-scale-down'
    }[objectFit]

    // Generate placeholder style
    const placeholderStyle = React.useMemo(() => ({
      backgroundColor: placeholderColor,
      backgroundImage: placeholderSrc ? `url(${placeholderSrc})` : undefined,
      backgroundSize: 'cover',
      backgroundPosition: 'center'
    }), [placeholderColor, placeholderSrc])

    // Calculate blur style
    const blurStyle = enableBlur && shouldAnimate && isLoading ? {
      filter: `blur(${blurAmount}px)`,
      transform: 'scale(1.02)' // Prevent blur edge artifacts
    } : {}

    // Transition style
    const transitionStyle = shouldAnimate ? {
      transition: `filter ${transitionDuration}ms ease-out, transform ${transitionDuration}ms ease-out`
    } : {}

    return (
      <div
        className={cn('blur-up-loader relative overflow-hidden', className)}
        style={!fill ? { width, height } : undefined}
      >
        {/* Placeholder */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              className="absolute inset-0"
              style={placeholderStyle}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: (shouldAnimate ? transitionDuration : 0) / 1000 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {/* Image */}
        {isInView && (
          <Image
            ref={imgRef}
            src={src}
            alt={alt}
            width={fill ? undefined : width}
            height={fill ? undefined : height}
            fill={fill}
            quality={quality}
            priority={priority}
            className={cn(
              'relative w-full h-full',
              objectFitClass,
              imageClassName
            )}
            style={{
              ...blurStyle,
              ...transitionStyle,
              opacity: hasError ? 0 : 1
            }}
            onLoad={handleLoad}
            onError={handleError}
            sizes={fill ? '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw' : undefined}
          />
        )}

        {/* Error fallback */}
        {hasError && (
          <div
            className="absolute inset-0 flex items-center justify-center bg-muted/20"
            style={{ backgroundColor: placeholderColor }}
          >
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
          </div>
        )}
      </div>
    )
  }
)

BlurUpLoader.displayName = 'BlurUpLoader'

/**
 * Blur-Up Background Component
 *
 * Applies a blur-up effect to background images.
 */
export interface BlurUpBackgroundProps {
  /** Image source */
  src: string
  /** Children content */
  children?: React.ReactNode
  /** Placeholder color */
  placeholderColor?: string
  /** Blur amount */
  blurAmount?: number
  /** Transition duration */
  transitionDuration?: number
  /** Custom CSS class names */
  className?: string
  /** Content class */
  contentClassName?: string
}

export function BlurUpBackground({
  src,
  children,
  placeholderColor = '#e5e7eb',
  blurAmount = DEFAULT_BLUR_AMOUNT,
  transitionDuration = DEFAULT_TRANSITION_DURATION,
  className,
  contentClassName
}: BlurUpBackgroundProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const prefersReduced = useReducedMotion()
  const shouldAnimate = !prefersReduced

  const handleLoad = React.useCallback(() => {
    setIsLoading(false)
  }, [])

  const backgroundStyle = React.useMemo(() => ({
    backgroundImage: `url(${src})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: shouldAnimate && isLoading ? `blur(${blurAmount}px)` : 'none',
    transition: shouldAnimate ? `filter ${transitionDuration}ms ease-out` : 'none'
  }), [src, isLoading, blurAmount, transitionDuration, shouldAnimate])

  return (
    <div
      className={cn('blur-up-background relative min-h-screen', className)}
      style={{ backgroundColor: placeholderColor }}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 -z-10"
        style={backgroundStyle}
        aria-hidden="true"
      >
        <Image
          src={src}
          alt=""
          fill
          quality={85}
          className="invisible"
          onLoad={handleLoad}
        />
      </div>

      {/* Content overlay */}
      <div className={cn('relative z-10', contentClassName)}>
        {children}
      </div>
    </div>
  )
}

/**
 * Blur-Up Avatar Component
 *
 * Avatar component with blur-up loading effect.
 */
export interface BlurUpAvatarProps {
  /** Avatar source */
  src?: string | null
  /** User initials as fallback */
  initials?: string
  /** User name */
  name?: string
  /** Avatar size */
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  /** Avatar shape */
  shape?: 'circle' | 'square'
  /** Placeholder color */
  placeholderColor?: string
  /** Custom CSS class names */
  className?: string
}

const avatarSizes = {
  sm: { width: 32, height: 32, fontSize: 'text-xs' },
  md: { width: 40, height: 40, fontSize: 'text-sm' },
  lg: { width: 48, height: 48, fontSize: 'text-base' },
  xl: { width: 64, height: 64, fontSize: 'text-lg' },
  '2xl': { width: 96, height: 96, fontSize: 'text-xl' }
}

export function BlurUpAvatar({
  src,
  initials,
  name = 'User',
  size = 'md',
  shape = 'circle',
  placeholderColor = '#e5e7eb',
  className
}: BlurUpAvatarProps) {
  const [hasError, setHasError] = React.useState(false)
  const { width, height, fontSize } = avatarSizes[size]

  // Generate initials from name
  const computedInitials = React.useMemo(() => {
    if (initials) return initials
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }, [initials, name])

  // Show fallback if no src or error
  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center font-semibold',
          shape === 'circle' && 'rounded-full',
          shape === 'square' && 'rounded-md',
          className
        )}
        style={{ width, height, backgroundColor: placeholderColor }}
        title={name}
      >
        <span className={fontSize}>{computedInitials}</span>
      </div>
    )
  }

  return (
    <BlurUpLoader
      src={src}
      alt={name}
      width={width}
      height={height}
      placeholderColor={placeholderColor}
      className={cn(
        shape === 'circle' && 'rounded-full overflow-hidden',
        shape === 'square' && 'rounded-md overflow-hidden',
        className
      )}
      onError={() => setHasError(true)}
    />
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BlurUpLoader
