/**
 * Animation Curves - Apple-Inspired Easing Functions
 *
 * Provides TypeScript exports of cubic-bezier functions for programmatic use
 * in animations, transitions, and Framer Motion.
 *
 * @example
 * ```tsx
 * import { easeOut, spring } from '@/lib/animation-curves';
 *
 * // Use with CSS
 * const style = { transitionTimingFunction: easeOut };
 *
 * // Use with Framer Motion
 * <motion.div transition={{ ease: spring, duration: 0.3 }} />
 * ```
 */

/**
 * Cubic-bezier function for standard ease-out
 * Decelerates quickly at the start, slows down at the end
 * Best for: UI transitions, panel slides, fade outs
 */
export const easeOut = "cubic-bezier(0, 0, 0.2, 1)" as const;

/**
 * Cubic-bezier function for standard ease-in
 * Accelerates slowly at the start, speeds up at the end
 * Best for: Opening animations, entrance effects
 */
export const easeIn = "cubic-bezier(0.4, 0, 1, 1)" as const;

/**
 * Cubic-bezier function for standard ease-in-out
 * Smooth acceleration and deceleration
 * Best for: General purpose transitions, state changes
 */
export const easeInOut = "cubic-bezier(0.4, 0, 0.2, 1)" as const;

/**
 * Cubic-bezier function for spring animation
 * Overshoots slightly with bounce effect
 * Best for: Button presses, card interactions, playful animations
 */
export const spring = "cubic-bezier(0.175, 0.885, 0.32, 1.275)" as const;

/**
 * Cubic-bezier function for bounce effect
 * More pronounced bounce for emphasis
 * Best for: Attention-grabbing animations, success states
 */
export const bounce = "cubic-bezier(0.68, -0.55, 0.265, 1.55)" as const;

/**
 * Animation duration constants (in milliseconds)
 */
export const duration = {
  /** Instant transition (100ms) - hover states, micro-interactions */
  instant: 100,

  /** Fast transition (150ms) - button presses, toggle switches */
  fast: 150,

  /** Normal transition (300ms) - standard UI transitions, panel slides */
  normal: 300,

  /** Slow transition (500ms) - modal open/close, page transitions */
  slow: 500,

  /** Slower transition (700ms) - complex animations, multi-stage transitions */
  slower: 700,

  /** Slowest transition (1000ms) - hero animations, emphasis effects */
  slowest: 1000,
} as const;

/**
 * Pre-configured animation presets combining easing and duration
 */
export const preset = {
  /** Quick micro-interaction (button hover, toggle switch) */
  micro: {
    ease: easeOut,
    duration: duration.fast,
  },

  /** Standard UI transition (panel slide, modal open) */
  standard: {
    ease: easeInOut,
    duration: duration.normal,
  },

  /** Spring animation (button press, card interaction) */
  springy: {
    ease: spring,
    duration: duration.normal,
  },

  /** Bouncy emphasis (success state, notification) */
  bouncy: {
    ease: bounce,
    duration: duration.slow,
  },

  /** Smooth entrance (page load, hero animation) */
  entrance: {
    ease: easeOut,
    duration: duration.slow,
  },

  /** Gentle exit (modal close, panel dismiss) */
  exit: {
    ease: easeIn,
    duration: duration.fast,
  },
} as const;

/**
 * Type definitions for animation values
 */
export type AnimationCurve = typeof easeOut | typeof easeIn | typeof easeInOut | typeof spring | typeof bounce;
export type AnimationDuration = typeof duration[keyof typeof duration];
export type AnimationPreset = typeof preset[keyof typeof preset];

/**
 * Default animation configuration for Framer Motion
 */
export const defaultMotionConfig = {
  transition: {
    type: "tween" as const,
    ease: easeInOut,
    duration: duration.normal / 1000, // Convert to seconds
  },
} as const;

/**
 * Spring configuration for Framer Motion physics-based springs
 */
export const springConfig = {
  /** Gentle spring for subtle interactions */
  gentle: {
    type: "spring" as const,
    stiffness: 300,
    damping: 25,
  },

  /** Default spring for general use */
  default: {
    type: "spring" as const,
    stiffness: 400,
    damping: 20,
  },

  /** Bouncy spring for playful interactions */
  bouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 15,
  },

  /** Stiff spring for precise movements */
  stiff: {
    type: "spring" as const,
    stiffness: 600,
    damping: 30,
  },
} as const;
