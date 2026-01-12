"use client"

import * as React from "react"
import { motion, AnimatePresence, Transition, Variants } from "framer-motion"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// ============================================================================
// TRANSITION TYPES
// ============================================================================

/**
 * Page Transition Type
 *
 * Available transition presets for page navigation.
 */
export type PageTransitionType =
  | "fade"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "scale"
  | "scale-fade"
  | "flip"
  | "zoom"
  | "blur"
  | "none"

/**
 * Page Transition Mode
 *
 * AnimatePresence mode for handling enter/exit animations.
 */
export type PageTransitionMode = "wait" | "sync" | "popLayout"

// ============================================================================
// TRANSITION VARIANTS
// ============================================================================

/**
 * Fade transition variants
 */
const fadeVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Slide transition variants by direction
 */
const slideVariants: Record<"up" | "down" | "left" | "right", Variants> = {
  up: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  down: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  left: {
    initial: { opacity: 0, x: 50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  },
  right: {
    initial: { opacity: 0, x: -50 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 50 },
  },
}

/**
 * Scale transition variants
 */
const scaleVariants: Variants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.1, opacity: 0 },
}

/**
 * Scale-fade transition variants
 */
const scaleFadeVariants: Variants = {
  initial: { scale: 0.95, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.05, opacity: 0 },
}

/**
 * Flip transition variants
 */
const flipVariants: Variants = {
  initial: { rotateY: 90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 },
}

/**
 * Zoom transition variants
 */
const zoomVariants: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 2, opacity: 0 },
}

/**
 * Blur transition variants
 */
const blurVariants: Variants = {
  initial: { opacity: 0, filter: "blur(10px)" },
  animate: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(10px)" },
}

/**
 * Get transition variants by type
 */
function getVariants(type: PageTransitionType): Variants {
  switch (type) {
    case "fade":
      return fadeVariants
    case "slide-up":
      return slideVariants.up
    case "slide-down":
      return slideVariants.down
    case "slide-left":
      return slideVariants.left
    case "slide-right":
      return slideVariants.right
    case "scale":
      return scaleVariants
    case "scale-fade":
      return scaleFadeVariants
    case "flip":
      return flipVariants
    case "zoom":
      return zoomVariants
    case "blur":
      return blurVariants
    case "none":
      return { initial: {}, animate: {}, exit: {} }
  }
}

/**
 * Get transition duration by type
 */
function getDuration(type: PageTransitionType): number {
  switch (type) {
    case "fade":
      return 0.2
    case "slide-up":
    case "slide-down":
    case "slide-left":
    case "slide-right":
      return 0.3
    case "scale":
      return 0.25
    case "scale-fade":
      return 0.3
    case "flip":
      return 0.4
    case "zoom":
      return 0.35
    case "blur":
      return 0.3
    case "none":
      return 0
  }
}

// ============================================================================
// PAGE TRANSITION PROPS
// ============================================================================

/**
 * Page Transition Props
 */
export interface PageTransitionProps {
  /** Page content */
  children: React.ReactNode
  /** Transition type/preset */
  type?: PageTransitionType
  /** AnimatePresence mode */
  mode?: PageTransitionMode
  /** Custom transition config */
  transition?: Transition
  /** Additional CSS class names */
  className?: string
  /** Enable on first mount */
  animateOnMount?: boolean
  /** Custom variants */
  variants?: Variants
  /** Preserve scroll position */
  preserveScroll?: boolean
}

// ============================================================================
// PAGE TRANSITION COMPONENT
// ============================================================================

/**
 * PageTransition Component
 *
 * Wraps page content with smooth transition animations.
 * Handles route changes with Framer Motion AnimatePresence.
 *
 * @example
 * ```tsx
 * <PageTransition type="slide-up">
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  type = "fade",
  mode = "sync",
  transition,
  className,
  animateOnMount = false,
  variants,
  preserveScroll = false,
}: PageTransitionProps) {
  const pathname = usePathname()
  const [mounted, setMounted] = React.useState(animateOnMount)

  // Set mounted state after initial render
  React.useEffect(() => {
    if (!animateOnMount) {
      setMounted(true)
    }
  }, [animateOnMount])

  // Preserve scroll position if enabled
  React.useEffect(() => {
    if (preserveScroll) {
      const scrollY = sessionStorage.getItem("scrollY")
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY))
      }
    }

    const handleScroll = () => {
      if (preserveScroll) {
        sessionStorage.setItem("scrollY", window.scrollY.toString())
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [pathname, preserveScroll])

  const selectedVariants = variants || getVariants(type)
  const defaultTransition: Transition = transition || {
    duration: getDuration(type),
    ease: [0.4, 0, 0.2, 1],
  }

  return (
    <AnimatePresence mode={mode} initial={mounted ? false : undefined}>
      <motion.div
        key={pathname}
        variants={selectedVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={defaultTransition}
        className={cn("w-full", className)}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// SHARED ELEMENT TRANSITION
// ============================================================================

/**
 * SharedElementProps
 */
export interface SharedElementProps {
  /** Shared element ID */
  id: string
  /** Element content */
  children: React.ReactNode
  /** Layout animation duration */
  layout?: "position" | "size" | boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * SharedElement Component
 *
 * Enables shared element transitions between routes.
 * Uses layoutId for automatic FLIP animations.
 *
 * @example
 * ```tsx
 * // In page 1
 * <SharedElement id="hero-image">
 *   <img src="/hero.jpg" />
 * </SharedElement>
 *
 * // In page 2
 * <SharedElement id="hero-image">
 *   <img src="/hero.jpg" />
 * </SharedElement>
 * ```
 */
export function SharedElement({
  id,
  children,
  layout = "position",
  className,
}: SharedElementProps) {
  return (
    <motion.div layoutId={id} layout={layout} className={className}>
      {children}
    </motion.div>
  )
}

// ============================================================================
// TRANSITION GROUP
// ============================================================================

/**
 * TransitionGroupProps
 */
export interface TransitionGroupProps {
  /** Items to animate */
  items: readonly unknown[]
  /** Item key extractor */
  itemKey: (item: unknown, index: number) => string
  /** Render function for each item */
  children: (item: unknown, index: number) => React.ReactNode
  /** Transition type */
  type?: PageTransitionType
  /** Stagger delay in seconds */
  staggerDelay?: number
  /** Additional CSS class names */
  className?: string
}

/**
 * TransitionGroup Component
 *
 * Animates a list of items with staggered entrance/exit.
 *
 * @example
 * ```tsx
 * <TransitionGroup
 *   items={items}
 *   itemKey={(item) => item.id}
 *   type="fade"
 *   staggerDelay={0.05}
 * >
 *   {(item) => <div>{item.name}</div>}
 * </TransitionGroup>
 * ```
 */
export function TransitionGroup({
  items,
  itemKey,
  children,
  type = "fade",
  staggerDelay = 0.05,
  className,
}: TransitionGroupProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: staggerDelay * 0.5,
        staggerDirection: -1,
      },
    },
  }

  const itemVariants = getVariants(type)

  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className={className}
      >
        {items.map((item, index) => (
          <motion.div
            key={itemKey(item, index)}
            variants={itemVariants}
            layout
          >
            {children(item, index)}
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================================
// ROUTE TRANSITION HOOK
// ============================================================================

/**
 * useRouteTransition Hook
 *
 * Hook for programmatic route transitions.
 *
 * @example
 * ```tsx
 * const { transitionTo } = useRouteTransition()
 *
 * transitionTo("/markets", "slide-left")
 * ```
 */
export function useRouteTransition() {
  const router = typeof window !== "undefined" ? require("next/navigation").useRouter() : null

  const transitionTo = React.useCallback(
    (href: string, type: PageTransitionType = "fade") => {
      // Store transition type for the next page
      sessionStorage.setItem("pageTransition", type)

      // Navigate to the new route
      if (router) {
        router.push(href)
      } else {
        window.location.href = href
      }
    },
    [router]
  )

  const getTransitionType = React.useCallback((): PageTransitionType => {
    if (typeof window === "undefined") return "fade"
    const stored = sessionStorage.getItem("pageTransition")
    sessionStorage.removeItem("pageTransition")
    return (stored as PageTransitionType) || "fade"
  }, [])

  return {
    transitionTo,
    getTransitionType,
  }
}
