/**
 * Cinematic Page Transitions
 *
 * Barrel export for all transition components and utilities.
 *
 * @example
 * ```tsx
 * import {
 *   CinematicPageTransition,
 *   SharedElementTransition,
 *   StaggerContainer,
 *   useRouteTransition,
 *   presets
 * } from '@/components/effects/transitions'
 * ```
 */

// Main components
export {
  CinematicPageTransition,
  SharedElementTransition,
  StaggerContainer,
  SkipLink,
} from "./cinematic-transition"

// Hooks
export { useRouteTransition } from "./cinematic-transition"

// Types
export type {
  CinematicTransitionType,
  RouteTransitionConfig,
  CinematicPageTransitionProps,
  SharedElementTransitionProps,
  StaggerContainerProps,
  SkipLinkProps,
} from "./cinematic-transition"

// Presets
export {
  easing,
  transitions,
  fadeIn,
  fadeInScale,
  fadeBlur,
  slideUp,
  slideDown,
  slideLeft,
  slideRight,
  scaleIn,
  popIn,
  flipHorizontal,
  flipVertical,
  zoomIn,
  zoomRotate,
  blurIn,
  blurSlide,
  wipeLeft,
  wipeRight,
  circleWipe,
  staggerContainer,
  staggerItem,
  staggerFast,
  staggerSlow,
  modalOverlay,
  modalContent,
  dialogSlideUp,
  drawerRight,
  drawerLeft,
  listSlide,
  listExpand,
  getTransition,
  getEasing,
  combineVariants,
  createStaggerVariants,
  presets,
  fadeTransitions,
  slideTransitions,
  scaleTransitions,
  flipTransitions,
  zoomTransitions,
  blurTransitions,
  wipeTransitions,
  staggerTransitions,
} from "./transition-presets"

// Default route transitions
export { defaultRouteTransitions } from "./cinematic-transition"

// Re-export from existing page-transition for backward compatibility
export {
  PageTransition,
  SharedElement,
  TransitionGroup,
  useRouteTransition as useLegacyRouteTransition,
  type PageTransitionType,
  type PageTransitionMode,
  type PageTransitionProps,
  type SharedElementProps,
  type TransitionGroupProps,
} from "../page-transition"
