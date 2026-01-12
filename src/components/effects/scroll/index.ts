/**
 * Scroll Effects
 *
 * Barrel export for all scroll-related effects.
 *
 * @example
 * ```tsx
 * import {
 *   useScrollObserver,
 *   ScrollReveal,
 *   ParallaxScroll,
 *   ScrollProgress,
 *   ScrollTriggered
 * } from "@/components/effects/scroll"
 * ```
 */

// ============================================================================
// HOOKS
// ============================================================================

export {
  useScrollObserver,
  useScrollDirection,
  useScrollVelocity,
  useIsScrolling,
  useScrollEdges,
  type ScrollObserverConfig,
  type ScrollObserverReturn,
  type ScrollState,
  type ScrollPosition,
  type ScrollVelocity,
  type ScrollEdges,
  type ScrollDirection,
} from "./use-scroll-observer"

// ============================================================================
// SCROLL REVEAL
// ============================================================================

export {
  ScrollReveal,
  ScrollRevealFade,
  ScrollRevealUp,
  ScrollRevealDown,
  ScrollRevealLeft,
  ScrollRevealRight,
  ScrollRevealScale,
  applyRevealPreset,
  type ScrollRevealProps,
  type ScrollRevealConfig,
  type RevealDirection,
  type RevealPreset,
} from "./scroll-reveal"

// ============================================================================
// PARALLAX
// ============================================================================

export {
  ParallaxScroll,
  ParallaxLayers,
  ParallaxBackground,
  ParallaxForeground,
  ParallaxDeep,
  useParallaxTransform,
  useParallaxStyle,
  type ParallaxScrollProps,
  type ParallaxScrollConfig,
  type ParallaxLayer,
  type ParallaxAxis,
} from "./parallax-scroll"

// ============================================================================
// SCROLL PROGRESS
// ============================================================================

export {
  ScrollProgress,
  ScrollProgressTop,
  ScrollProgressBottom,
  ScrollProgressThin,
  ScrollProgressThick,
  ScrollProgressPill,
  ScrollProgressBlue,
  ScrollProgressGreen,
  ScrollProgressRed,
  progressColors,
  useScrollProgress,
  type ScrollProgressProps,
  type ScrollProgressConfig,
  type ProgressPosition,
  type ProgressOrientation,
  type ProgressVariant,
} from "./scroll-progress"

// ============================================================================
// SCROLL TRIGGERED ANIMATIONS
// ============================================================================

export {
  ScrollTriggered,
  ScrollTimeline,
  ScrollFadeIn,
  ScrollScaleIn,
  ScrollSlideUp,
  ScrollRotate,
  useScrollAnimationValue,
  useScrollTrigger,
  EASING_FUNCTIONS,
  type ScrollTriggeredProps,
  type ScrollTriggerConfig,
  type AnimationValues,
  type AnimationKeyframes,
  type TimelineStep,
  type ScrollTimelineProps,
} from "./scroll-triggered-animations"
