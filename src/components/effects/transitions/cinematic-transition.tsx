"use client"

import * as React from "react"
import { motion, AnimatePresence, MotionProps } from "framer-motion"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { presets, getTransition, type Transition } from "./transition-presets"
import { usePrefersReducedMotion } from "../particles/particle-engine"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Cinematic transition type
 */
export type CinematicTransitionType =
  | "fade"
  | "fadeScale"
  | "fadeBlur"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scaleIn"
  | "popIn"
  | "flipHorizontal"
  | "flipVertical"
  | "zoomIn"
  | "zoomRotate"
  | "blurIn"
  | "blurSlide"
  | "wipeLeft"
  | "wipeRight"
  | "circleWipe"

/**
 * Route transition config
 */
export interface RouteTransitionConfig {
  /** Transition type for this route */
  type: CinematicTransitionType
  /** Duration override */
  duration?: number
  /** Custom easing */
  easing?: MotionProps["transition"]
}

/**
 * Cinematic Page Transition Props
 */
export interface CinematicPageTransitionProps {
  /** Children to animate */
  children: React.ReactNode
  /** Transition type */
  type?: CinematicTransitionType
  /** Custom transition config */
  transition?: Transition
  /** Mode for AnimatePresence */
  mode?: "wait" | "sync" | "popLayout"
  /** Additional CSS class names */
  className?: string
  /** Enable animation on first mount */
  animateOnMount?: boolean
  /** Route-specific transitions */
  routeTransitions?: Record<string, RouteTransitionConfig>
  /** Respect reduced motion preference */
  respectReducedMotion?: boolean
  /** Skip transition for specific routes */
  skipRoutes?: string[]
}

// ============================================================================
// ROUTE TRANSITION MAPPING
// ============================================================================

/**
 * Default route transition suggestions
 */
export const defaultRouteTransitions: Partial<Record<string, CinematicTransitionType>> = {
  // Home - fade in
  "/": "fadeScale",

  // Markets - slide up (forward navigation)
  "/markets": "slideUp",
  "/markets/[id]": "slideUp",

  // Portfolio - slide from right
  "/portfolio": "slideLeft",

  // Alerts - slide from left
  "/alerts": "slideRight",

  // Settings - scale in (modal-like)
  "/settings": "scaleIn",
}

// ============================================================================
// CINEMATIC PAGE TRANSITION COMPONENT
// ============================================================================

/**
 * CinematicPageTransition Component
 *
 * Enhanced page wrapper with cinematic transitions and route-aware animations.
 * Features GPU acceleration, reduced motion support, and route-specific configs.
 *
 * @example
 * ```tsx
 * <CinematicPageTransition type="fadeBlur" routeTransitions={{
 *   "/markets": { type: "slideUp" },
 *   "/markets/[id]": { type: "scaleIn" }
 * }}>
 *   {children}
 * </CinematicPageTransition>
 * ```
 */
export function CinematicPageTransition({
  children,
  type = "fadeScale",
  transition,
  mode = "sync",
  className,
  animateOnMount = false,
  routeTransitions = {},
  respectReducedMotion = true,
  skipRoutes = [],
}: CinematicPageTransitionProps) {
  const pathname = usePathname()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [mounted, setMounted] = React.useState(animateOnMount)

  // Get transition type for current route
  const getRouteTransition = React.useCallback((): CinematicTransitionType => {
    // Check if current route should be skipped
    if (skipRoutes.includes(pathname)) {
      return "fade"
    }

    // Check route-specific transitions
    for (const [route, config] of Object.entries(routeTransitions)) {
      if (pathname.match(new RegExp("^" + route.replace(/\[.*?\]/g, ".*") + "$"))) {
        return config.type
      }
    }

    // Check default transitions
    for (const [route, defaultType] of Object.entries(defaultRouteTransitions)) {
      if (pathname.match(new RegExp("^" + route.replace(/\[.*?\]/g, ".*") + "$"))) {
        return defaultType!
      }
    }

    return type
  }, [pathname, type, routeTransitions, skipRoutes])

  const currentType = getRouteTransition()

  // Get route-specific config
  const routeConfig = React.useMemo(() => {
    for (const [route, config] of Object.entries(routeTransitions)) {
      if (pathname.match(new RegExp("^" + route.replace(/\[.*?\]/g, ".*") + "$"))) {
        return config
      }
    }
    return null
  }, [pathname, routeTransitions])

  // Determine if animation should be disabled
  const shouldDisable = respectReducedMotion && prefersReducedMotion

  // Set mounted state after initial render
  React.useEffect(() => {
    if (!animateOnMount) {
      setMounted(true)
    }
  }, [animateOnMount])

  // Get variants for current type
  const getVariants = () => {
    if (shouldDisable) {
      return {
        hidden: {},
        visible: {},
        exit: {},
      }
    }

    switch (currentType) {
      case "fade":
        return presets.fade.in
      case "fadeScale":
        return presets.fade.scale
      case "fadeBlur":
        return presets.fade.blur
      case "slideUp":
        return presets.slide.up
      case "slideDown":
        return presets.slide.down
      case "slideLeft":
        return presets.slide.left
      case "slideRight":
        return presets.slide.right
      case "scaleIn":
        return presets.scale.in
      case "popIn":
        return presets.scale.pop
      case "flipHorizontal":
        return presets.flip.horizontal
      case "flipVertical":
        return presets.flip.vertical
      case "zoomIn":
        return presets.zoom.in
      case "zoomRotate":
        return presets.zoom.rotate
      case "blurIn":
        return presets.blur.in
      case "blurSlide":
        return presets.blur.slide
      case "wipeLeft":
        return presets.wipe.left
      case "wipeRight":
        return presets.wipe.right
      case "circleWipe":
        return presets.wipe.circle
      default:
        return presets.fade.in
    }
  }

  const variants = getVariants()

  // Get transition config
  const transitionConfig: Transition = React.useMemo(() => {
    if (shouldDisable) return { duration: 0 }

    if (transition) return transition
    if (routeConfig?.easing) return routeConfig.easing
    if (routeConfig?.duration) {
      return { duration: routeConfig.duration, ease: [0.22, 1, 0.36, 1] }
    }

    return getTransition("normal")
  }, [shouldDisable, transition, routeConfig])

  return (
    <AnimatePresence mode={mode} initial={mounted ? false : undefined}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={transitionConfig}
        className={cn(
          "w-full",
          shouldDisable ? "" : "will-change-transform",
          className
        )}
        style={{
          // Force GPU acceleration for animated elements
          ...(shouldDisable ? {} : { transform: "translateZ(0)" }),
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// SHARED ELEMENT TRANSITION (ENHANCED)
// ============================================================================

/**
 * SharedElementTransition Props
 */
export interface SharedElementTransitionProps {
  /** Unique element ID for FLIP animation */
  id: string
  /** Element content */
  children: React.ReactNode
  /** Layout animation type */
  layout?: "position" | "size" | boolean
  /** Additional CSS class names */
  className?: string
  /** Enable crossfade during layout animation */
  crossfade?: boolean
}

/**
 * SharedElementTransition Component
 *
 * Enhanced shared element transitions with FLIP animations.
 * Elements with matching IDs smoothly animate between routes.
 *
 * @example
 * ```tsx
 * // Page 1
 * <SharedElementTransition id="hero-image">
 *   <img src="/hero.jpg" alt="Hero" />
 * </SharedElementTransition>
 *
 * // Page 2 - Same ID creates the transition
 * <SharedElementTransition id="hero-image" crossfade>
 *   <img src="/hero.jpg" alt="Hero" />
 * </SharedElementTransition>
 * ```
 */
export function SharedElementTransition({
  id,
  children,
  layout = "position",
  className,
  crossfade = false,
}: SharedElementTransitionProps) {
  return (
    <motion.div
      layoutId={id}
      layout={layout}
      className={className}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
      }}
    >
      {children}
    </motion.div>
  )
}

// ============================================================================
// STAGGER CONTAINER (ENHANCED)
// ============================================================================

/**
 * StaggerContainer Props
 */
export interface StaggerContainerProps {
  /** Children to stagger */
  children: React.ReactNode
  /** Stagger delay in seconds */
  staggerDelay?: number
  /** Delay before starting stagger */
  delayChildren?: number
  /** Stagger direction (1 = forward, -1 = backward) */
  staggerDirection?: 1 | -1
  /** Animation variant for items */
  itemVariant?: "fadeIn" | "slideUp" | "scaleIn" | "slideLeft" | "slideRight"
  /** Additional CSS class names */
  className?: string
  /** Enable animation */
  enabled?: boolean
}

/**
 * StaggerContainer Component
 *
 * Container that staggers children animations with configurable timing.
 *
 * @example
 * ```tsx
 * <StaggerContainer staggerDelay={0.1} itemVariant="slideUp">
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </StaggerContainer>
 * ```
 */
export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  delayChildren = 0,
  staggerDirection = 1,
  itemVariant = "fadeIn",
  className,
  enabled = true,
}: StaggerContainerProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
        staggerDirection,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -staggerDirection as 1 | -1,
      },
    },
  }

  const getItemVariants = () => {
    switch (itemVariant) {
      case "fadeIn":
        return { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
      case "slideUp":
        return presets.slide.up
      case "scaleIn":
        return presets.scale.in
      case "slideLeft":
        return presets.slide.left
      case "slideRight":
        return presets.slide.right
      default:
        return { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    }
  }

  const itemVariants = getItemVariants()

  const childrenArray = React.Children.toArray(children)

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate={enabled ? "visible" : false}
      exit="exit"
      className={className}
    >
      {childrenArray.map((child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}

// ============================================================================
// ROUTE TRANSITION HOOK
// ============================================================================

/**
 * useRouteTransition Hook
 *
 * Programmatic route transitions with type specification.
 *
 * @example
 * ```tsx
 * const { transitionTo, getTransitionType } = useRouteTransition()
 *
 * // Navigate with specific transition
 * transitionTo("/markets", "slideUp")
 *
 * // Get transition type for current route
 * const currentTransition = getTransitionType()
 * ```
 */
export function useRouteTransition() {
  const pathname = usePathname()
  const router = React.useMemo(() => {
    if (typeof window === "undefined") return null
    // Lazy import to avoid SSR issues
    const nextNavigation = require("next/navigation")
    return nextNavigation.useRouter?.() ?? null
  }, [])

  const transitionTo = React.useCallback(
    (href: string, type: CinematicTransitionType = "fade") => {
      // Store transition type for next page
      sessionStorage.setItem("routeTransition", type)
      sessionStorage.setItem("routeTransitionFrom", pathname)

      // Navigate
      if (router?.push) {
        router.push(href)
      } else {
        window.location.href = href
      }
    },
    [pathname, router]
  )

  const getTransitionType = React.useCallback((): CinematicTransitionType => {
    if (typeof window === "undefined") return "fade"

    const stored = sessionStorage.getItem("routeTransition")
    const from = sessionStorage.getItem("routeTransitionFrom")

    // Clean up
    sessionStorage.removeItem("routeTransition")
    sessionStorage.removeItem("routeTransitionFrom")

    // Determine direction based on routes
    const storedType = (stored ?? "fade") as CinematicTransitionType

    // Auto-detect direction for forward/back navigation
    if (!stored && from) {
      const fromDepth = from.split("/").length
      const toDepth = pathname.split("/").length

      if (toDepth > fromDepth) {
        return "slideUp" // Going deeper
      } else if (toDepth < fromDepth) {
        return "slideDown" // Going back
      }
    }

    return storedType
  }, [pathname])

  return {
    transitionTo,
    getTransitionType,
  }
}

// ============================================================================
// SKIP LINK COMPONENT (ACCESSIBILITY)
// ============================================================================

/**
 * SkipLink Props
 */
export interface SkipLinkProps {
  /** Link text */
  label?: string
  /** Target element ID */
  targetId?: string
}

/**
 * SkipLink Component
 *
 * Accessibility component to skip animations and jump to main content.
 *
 * @example
 * ```tsx
 * <SkipLink label="Skip to main content" />
 * ```
 */
export function SkipLink({ label = "Skip to main content", targetId = "main-content" }: SkipLinkProps) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded focus:shadow-lg"
    >
      {label}
    </a>
  )
}