/**
 * Animation Library
 *
 * Central animation variants library using Framer Motion.
 * Provides reusable animation presets for consistent motion design.
 *
 * @example
 * ```tsx
 * import { fadeIn, slideUp, scaleIn } from "@/lib/animations"
 *
 * <motion.div variants={fadeIn} initial="hidden" animate="visible">
 *   Content
 * </motion.div>
 * ```
 */

import { Variants, Transition, MotionProps } from "framer-motion"

// ============================================================================
// EASING FUNCTIONS
// ============================================================================

/**
 * Standard easing presets
 */
export const easings = {
  /** Smooth ease in-out */
  smooth: [0.4, 0, 0.2, 1] as const,
  /** Sharp ease out */
  sharp: [0, 0, 0.2, 1] as const,
  /** Bouncy ease */
  bouncy: [0.68, -0.55, 0.265, 1.55] as const,
  /** Linear */
  linear: [0, 0, 1, 1] as const,
  /** Ease in */
  easeIn: [0.4, 0, 1, 1] as const,
  /** Ease out */
  easeOut: [0, 0, 0.2, 1] as const,
} as const

/**
 * Default transition config
 */
export const defaultTransition: Transition = {
  type: "spring",
  stiffness: 100,
  damping: 15,
}

/**
 * Fast transition config
 */
export const fastTransition: Transition = {
  duration: 0.2,
  ease: easings.sharp,
}

/**
 * Slow transition config
 */
export const slowTransition: Transition = {
  duration: 0.5,
  ease: easings.smooth,
}

// ============================================================================
// FADE ANIMATIONS
// ============================================================================

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

/**
 * Fade in from left
 */
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
}

/**
 * Fade in from right
 */
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
}

/**
 * Fade in from top
 */
export const fadeInTop: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

/**
 * Fade in from bottom
 */
export const fadeInBottom: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
}

// ============================================================================
// SLIDE ANIMATIONS
// ============================================================================

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  hidden: { x: "-100%" },
  visible: { x: 0 },
  exit: { x: "100%" },
}

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
  exit: { x: "-100%" },
}

/**
 * Slide in from top
 */
export const slideInTop: Variants = {
  hidden: { y: "-100%" },
  visible: { y: 0 },
  exit: { y: "-100%" },
}

/**
 * Slide in from bottom
 */
export const slideInBottom: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "100%" },
}

// ============================================================================
// SCALE ANIMATIONS
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
 * Scale in from top
 */
export const scaleInTop: Variants = {
  hidden: { scaleY: 0, transformOrigin: "top" },
  visible: { scaleY: 1 },
  exit: { scaleY: 0, transformOrigin: "top" },
}

/**
 * Scale in from bottom
 */
export const scaleInBottom: Variants = {
  hidden: { scaleY: 0, transformOrigin: "bottom" },
  visible: { scaleY: 1 },
  exit: { scaleY: 0, transformOrigin: "bottom" },
}

/**
 * Pop animation
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
// ROTATE ANIMATIONS
// ============================================================================

/**
 * Rotate in
 */
export const rotateIn: Variants = {
  hidden: { rotate: -180, opacity: 0 },
  visible: { rotate: 0, opacity: 1 },
  exit: { rotate: 180, opacity: 0 },
}

/**
 * Spin animation
 */
export const spinIn: Variants = {
  hidden: { rotate: 0 },
  visible: {
    rotate: 360,
    transition: {
      duration: 0.5,
      ease: "linear",
    },
  },
}

/**
 * Swing animation
 */
export const swingIn: Variants = {
  hidden: { rotate: -45 },
  visible: {
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 10,
    },
  },
}

// ============================================================================
// BLUR ANIMATIONS
// ============================================================================

/**
 * Blur in
 */
export const blurIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)" },
  visible: { opacity: 1, filter: "blur(0px)" },
  exit: { opacity: 0, filter: "blur(10px)" },
}

/**
 * Blur slide in
 */
export const blurSlideIn: Variants = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 20 },
  visible: { opacity: 1, filter: "blur(0px)", y: 0 },
  exit: { opacity: 0, filter: "blur(10px)", y: -20 },
}

// ============================================================================
// SPRING ANIMATIONS
// ============================================================================

/**
 * Spring bounce in
 */
export const springBounceIn: Variants = {
  hidden: { scale: 0 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10,
    },
  },
}

/**
 * Spring slide up
 */
export const springSlideUp: Variants = {
  hidden: { y: 50, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
}

/**
 * Spring elastic
 */
export const springElastic: Variants = {
  hidden: { scale: 0.8 },
  visible: {
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 5,
    },
  },
}

// ============================================================================
// STAGGER ANIMATIONS
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
}

/**
 * Stagger item (fade)
 */
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

/**
 * Stagger fast container
 */
export const staggerFastContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
}

/**
 * Stagger slow container
 */
export const staggerSlowContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
}

// ============================================================================
// LIST ANIMATIONS
// ============================================================================

/**
 * List item slide in
 */
export const listItemSlide: Variants = {
  hidden: { x: -20, opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
  },
  exit: {
    x: 20,
    opacity: 0,
  },
}

/**
 * List item expand
 */
export const listItemExpand: Variants = {
  hidden: { height: 0, opacity: 0 },
  visible: {
    height: "auto",
    opacity: 1,
    transition: {
      height: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
      opacity: { duration: 0.2 },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
  },
}

// ============================================================================
// MODAL/DIALOG ANIMATIONS
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
  hidden: { y: "100%" },
  visible: {
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: "100%",
    transition: { duration: 0.2 },
  },
}

// ============================================================================
// DRAWER/SIDEBAR ANIMATIONS
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
// HOVER/TAP ANIMATIONS
// ============================================================================

/**
 * Hover lift
 */
export const hoverLift = {
  whileHover: { y: -4 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const

/**
 * Hover scale
 */
export const hoverScale = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const

/**
 * Hover glow
 */
export const hoverGlow = {
  whileHover: {
    boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
  },
  whileTap: { scale: 0.98 },
  transition: { duration: 0.2 },
} as const

/**
 * Tap feedback
 */
export const tapFeedback = {
  whileTap: { scale: 0.95 },
  transition: { type: "spring", stiffness: 400, damping: 17 },
} as const

// ============================================================================
// MICRO-INTERACTIONS
// ============================================================================

/**
 * Heart pulse animation
 */
export const heartPulse: Variants = {
  idle: { scale: 1 },
  active: {
    scale: [1, 1.3, 1],
    transition: {
      duration: 0.3,
      times: [0, 0.5, 1],
    },
  },
}

/**
 * Checkmark draw
 */
export const checkmarkDraw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.5, ease: "easeInOut" },
      opacity: { duration: 0.1 },
    },
  },
}

/**
 * Shimmer effect
 */
export const shimmer = {
  initial: { x: "-100%" },
  animate: {
    x: "100%",
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatDelay: 1,
      ease: "linear",
    },
  },
} as const

/**
 * Pulse animation
 */
export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
} as const

/**
 * Bounce animation
 */
export const bounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
} as const

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

/**
 * Spinner rotation
 */
export const spinner = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear",
    },
  },
} as const

/**
 * Dots bounce
 */
export const dotsBounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
} as const

/**
 * Skeleton shimmer
 */
export const skeletonShimmer = {
  animate: {
    x: ["-100%", "100%"],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "linear",
    },
  },
} as const

// ============================================================================
// PRESETS COLLECTION
// ============================================================================

/**
 * Animation presets by category
 */
export const animationPresets = {
  fade: {
    in: fadeIn,
    left: fadeInLeft,
    right: fadeInRight,
    top: fadeInTop,
    bottom: fadeInBottom,
  },
  slide: {
    left: slideInLeft,
    right: slideInRight,
    top: slideInTop,
    bottom: slideInBottom,
  },
  scale: {
    in: scaleIn,
    top: scaleInTop,
    bottom: scaleInBottom,
    pop: popIn,
  },
  rotate: {
    in: rotateIn,
    spin: spinIn,
    swing: swingIn,
  },
  blur: {
    in: blurIn,
    slide: blurSlideIn,
  },
  spring: {
    bounce: springBounceIn,
    slideUp: springSlideUp,
    elastic: springElastic,
  },
  stagger: {
    container: staggerContainer,
    item: staggerItem,
    fast: staggerFastContainer,
    slow: staggerSlowContainer,
  },
  modal: {
    overlay: modalOverlay,
    content: modalContent,
    dialog: dialogSlideUp,
  },
  drawer: {
    left: drawerLeft,
    right: drawerRight,
  },
  hover: {
    lift: hoverLift,
    scale: hoverScale,
    glow: hoverGlow,
  },
  micro: {
    pulse,
    bounce,
    shimmer,
    heartPulse,
    checkmarkDraw,
  },
  loading: {
    spinner,
    dotsBounce,
    skeletonShimmer,
  },
} as const

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get transition by name
 */
export function getTransition(name: keyof typeof easings = "smooth"): Transition {
  return {
    type: "spring",
    stiffness: 100,
    damping: 15,
    ease: easings[name],
  }
}

/**
 * Combine variants
 */
export function combineVariants(...variants: Variants[]): Variants {
  return variants.reduce((combined, variant) => {
    return {
      hidden: { ...combined.hidden, ...variant.hidden },
      visible: { ...combined.visible, ...variant.visible },
      exit: { ...combined.exit, ...variant.exit },
    }
  }, {} as Variants)
}

/**
 * Create custom stagger variants
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
    },
    item: itemVariant,
  }
}
