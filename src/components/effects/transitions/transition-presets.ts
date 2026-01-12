/**
 * Transition Presets
 *
 * Predefined animation variants for cinematic page transitions.
 * Organized by category for easy discovery and composition.
 *
 * @example
 * ```tsx
 * import { fadeIn, slideUp, scaleIn, blurIn } from '@/components/effects/transitions/transition-presets'
 *
 * <motion.div variants={fadeIn} initial="hidden" animate="visible" exit="exit">
 *   Content
 * </motion.div>
 * ```
 */

import { Variants, Transition } from "framer-motion"

// Re-export Transition type for convenience
export type { Transition }

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

/**
 * Apple-inspired easing functions
 */
export const easing = {
  // Linear
  linear: [0, 0, 1, 1] as const,

  // Standard ease
  ease: [0.25, 0.1, 0.25, 1] as const,
  easeIn: [0.42, 0, 1, 1] as const,
  easeOut: [0, 0, 0.58, 1] as const,
  easeInOut: [0.42, 0, 0.58, 1] as const,

  // Apple curves
  apple: [0.25, 0.1, 0.25, 1] as const,
  appleIn: [0.42, 0, 1, 1] as const,
  appleOut: [0, 0, 0.58, 1] as const,

  // Spring-like
  spring: [0.175, 0.885, 0.32, 1.275] as const,
  springSoft: [0.25, 0.1, 0.25, 1] as const,
  springBouncy: [0.68, -0.55, 0.265, 1.55] as const,

  // Material Design
  material: [0.4, 0, 0.2, 1] as const,
  materialDecelerate: [0, 0, 0.2, 1] as const,
  materialAccelerate: [0.4, 0, 1, 1] as const,

  // Cinematic
  cinematic: [0.22, 1, 0.36, 1] as const,
  dramatic: [0.87, 0, 0.13, 1] as const,
} as const

/**
 * Default transition presets
 */
export const transitions: Record<string, Transition> = {
  instant: { duration: 0.1, ease: easing.linear },
  fast: { duration: 0.2, ease: easing.appleOut },
  normal: { duration: 0.3, ease: easing.cinematic },
  slow: { duration: 0.5, ease: easing.cinematic },
  slower: { duration: 0.7, ease: easing.cinematic },
  spring: { type: "spring", stiffness: 300, damping: 25 },
  springBouncy: { type: "spring", stiffness: 200, damping: 15 },
}

// ============================================================================
// FADE TRANSITIONS
// ============================================================================

/**
 * Simple fade in/out
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Fade with slight scale
 */
export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 1.05 },
}

/**
 * Fade with blur
 */
export const fadeBlur: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(10px)" },
}

// ============================================================================
// SLIDE TRANSITIONS
// ============================================================================

/**
 * Slide up from bottom
 */
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -50 },
}

/**
 * Slide down from top
 */
export const slideDown: Variants = {
  hidden: { opacity: 0, y: -50 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 50 },
}

/**
 * Slide left from right
 */
export const slideLeft: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
}

/**
 * Slide right from left
 */
export const slideRight: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50 },
}

/**
 * Slide up with fade
 */
export const slideUpFade: Variants = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -100 },
}

// ============================================================================
// SCALE TRANSITIONS
// ============================================================================

/**
 * Scale in from center
 */
export const scaleIn: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0.8, opacity: 0 },
}

/**
 * Scale from top
 */
export const scaleFromTop: Variants = {
  hidden: { scaleY: 0, transformOrigin: "top", opacity: 0 },
  visible: { scaleY: 1, opacity: 1 },
  exit: { scaleY: 0, opacity: 0 },
}

/**
 * Scale from bottom
 */
export const scaleFromBottom: Variants = {
  hidden: { scaleY: 0, transformOrigin: "bottom", opacity: 0 },
  visible: { scaleY: 1, opacity: 1 },
  exit: { scaleY: 0, opacity: 0 },
}

/**
 * Pop in with spring
 */
export const popIn: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15,
    },
  },
  exit: { scale: 0 },
}

// ============================================================================
// FLIP TRANSITIONS
// ============================================================================

/**
 * Flip in horizontally
 */
export const flipHorizontal: Variants = {
  hidden: { rotateY: 90, opacity: 0 },
  visible: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 },
}

/**
 * Flip in vertically
 */
export const flipVertical: Variants = {
  hidden: { rotateX: 90, opacity: 0 },
  visible: { rotateX: 0, opacity: 1 },
  exit: { rotateX: -90, opacity: 0 },
}

/**
 * Card flip effect
 */
export const cardFlip: Variants = {
  hidden: { rotateY: 180 },
  visible: {
    rotateY: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 },
  },
  exit: { rotateY: -180 },
}

// ============================================================================
// ZOOM TRANSITIONS
// ============================================================================

/**
 * Zoom from far
 */
export const zoomIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 2, opacity: 0 },
}

/**
 * Zoom with rotation
 */
export const zoomRotate: Variants = {
  hidden: { scale: 0, rotate: -180, opacity: 0 },
  visible: { scale: 1, rotate: 0, opacity: 1 },
  exit: { scale: 0, rotate: 180, opacity: 0 },
}

/**
 * Zoom from corner
 */
export const zoomFromCorner: Variants = {
  hidden: { scale: 0, transformOrigin: "top left", opacity: 0 },
  visible: { scale: 1, opacity: 1 },
  exit: { scale: 0, transformOrigin: "bottom right", opacity: 0 },
}

// ============================================================================
// BLUR TRANSITIONS
// ============================================================================

/**
 * Blur in
 */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(20px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(20px)" },
}

/**
 * Blur with slide
 */
export const blurSlide: Variants = {
  hidden: { opacity: 0, filter: "blur(15px)", y: 30 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(15px)", y: -30 },
}

// ============================================================================
// WIPE TRANSITIONS
// ============================================================================

/**
 * Wipe from left
 */
export const wipeLeft: Variants = {
  hidden: { clipPath: "inset(0 100% 0 0)" },
  visible: { clipPath: "inset(0 0% 0 0)" },
  exit: { clipPath: "inset(0 0 0 100%)" },
}

/**
 * Wipe from right
 */
export const wipeRight: Variants = {
  hidden: { clipPath: "inset(0 0 0 100%)" },
  visible: { clipPath: "inset(0 0 0 0%)" },
  exit: { clipPath: "inset(0 100% 0 0)" },
}

/**
 * Circle wipe
 */
export const circleWipe: Variants = {
  hidden: { clipPath: "circle(0% at 50% 50%)" },
  visible: { clipPath: "circle(100% at 50% 50%)" },
  exit: { clipPath: "circle(0% at 50% 50%)" },
}

// ============================================================================
// STAGGER TRANSITIONS
// ============================================================================

/**
 * Stagger container
 */
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

/**
 * Stagger item (fade up)
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

/**
 * Fast stagger
 */
export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
  exit: { opacity: 0 },
}

/**
 * Slow stagger
 */
export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
  exit: { opacity: 0 },
}

// ============================================================================
// LIST ANIMATIONS
// ============================================================================

/**
 * List items slide in
 */
export const listSlide: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 30 },
}

/**
 * List items expand
 */
export const listExpand: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: { type: "spring", stiffness: 300, damping: 30 },
      opacity: { duration: 0.2 },
    },
  },
  exit: { height: 0, opacity: 0 },
}

// ============================================================================
// MODAL/DIALOG TRANSITIONS
// ============================================================================

/**
 * Modal overlay fade
 */
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Modal content scale
 */
export const modalContent: Variants = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

/**
 * Dialog slide up
 */
export const dialogSlideUp: Variants = {
  hidden: { y: "100%", opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// ============================================================================
// DRAWER/SIDEBAR TRANSITIONS
// ============================================================================

/**
 * Drawer from right
 */
export const drawerRight: Variants = {
  hidden: { x: "100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "100%",
    transition: { duration: 0.2 },
  },
}

/**
 * Drawer from left
 */
export const drawerLeft: Variants = {
  hidden: { x: "-100%" },
  visible: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: "-100%",
    transition: { duration: 0.2 },
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get transition preset by name
 */
export function getTransition(name: keyof typeof transitions = "normal"): Transition {
  return transitions[name] ?? transitions.normal
}

/**
 * Get easing function by name
 */
export function getEasing(name: keyof typeof easing = "appleOut"): readonly [number, number, number, number] {
  return easing[name] ?? easing.appleOut
}

/**
 * Combine multiple variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce(
    (combined, variant) => ({
      hidden: { ...combined.hidden, ...variant.hidden },
      visible: { ...combined.visible, ...variant.visible },
      exit: { ...combined.exit, ...variant.exit },
    }),
    {} as Variants
  )
}

/**
 * Create stagger variants
 */
export function createStaggerVariants(
  itemVariant: Variants,
  staggerDelay: number = 0.1,
  delayChildren: number = 0
): { container: Variants; item: Variants } {
  return {
    container: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren,
        },
      },
      exit: { opacity: 0 },
    },
    item: itemVariant,
  }
}

// ============================================================================
// PRESET COLLECTIONS
// ============================================================================

/**
 * All fade transitions
 */
export const fadeTransitions = {
  in: fadeIn,
  scale: fadeInScale,
  blur: fadeBlur,
} as const

/**
 * All slide transitions
 */
export const slideTransitions = {
  up: slideUp,
  down: slideDown,
  left: slideLeft,
  right: slideRight,
  upFade: slideUpFade,
} as const

/**
 * All scale transitions
 */
export const scaleTransitions = {
  in: scaleIn,
  fromTop: scaleFromTop,
  fromBottom: scaleFromBottom,
  pop: popIn,
} as const

/**
 * All flip transitions
 */
export const flipTransitions = {
  horizontal: flipHorizontal,
  vertical: flipVertical,
  card: cardFlip,
} as const

/**
 * All zoom transitions
 */
export const zoomTransitions = {
  in: zoomIn,
  rotate: zoomRotate,
  fromCorner: zoomFromCorner,
} as const

/**
 * All blur transitions
 */
export const blurTransitions = {
  in: blurIn,
  slide: blurSlide,
} as const

/**
 * All wipe transitions
 */
export const wipeTransitions = {
  left: wipeLeft,
  right: wipeRight,
  circle: circleWipe,
} as const

/**
 * All stagger transitions
 */
export const staggerTransitions = {
  container: staggerContainer,
  item: staggerItem,
  fast: staggerFast,
  slow: staggerSlow,
} as const

/**
 * Main preset collection
 */
export const presets = {
  fade: fadeTransitions,
  slide: slideTransitions,
  scale: scaleTransitions,
  flip: flipTransitions,
  zoom: zoomTransitions,
  blur: blurTransitions,
  wipe: wipeTransitions,
  stagger: staggerTransitions,
  modal: { overlay: modalOverlay, content: modalContent },
  dialog: dialogSlideUp,
  drawer: { left: drawerLeft, right: drawerRight },
  list: { slide: listSlide, expand: listExpand },
} as const
