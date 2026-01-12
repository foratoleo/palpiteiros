/**
 * Micro-Interactions
 *
 * Barrel export for all micro-interaction utilities and components.
 *
 * @example
 * ```tsx
 * import {
 *   hoverStates,
 *   focusStyles,
 *   activeStates,
 *   buttonInteractionStyles,
 *   useSwipeGestures,
 *   Ripple
 * } from "@/components/effects/micro-interactions"
 * ```
 */

// ============================================================================
// HOVER STATES
// ============================================================================

export {
  hoverStates,
  getHoverStateStyles,
  applyHoverPreset,
  hoverPresets,
  getHoverVars,
  getHoverStyles,
  type HoverStateConfig,
  type HoverStateStyles,
  type ShadowLevel,
  type BrightnessLevel,
  type ScalePreset,
  HOVER_DURATIONS,
  HOVER_EASINGS,
} from "./hover-states"

// ============================================================================
// FOCUS STATES
// ============================================================================

export {
  focusStyles,
  getFocusStateStyles,
  applyFocusPreset,
  focusPresets,
  getFocusVars,
  getFocusStyles,
  isKeyboardNavigation,
  trackInputMethod,
  type FocusConfig,
  type FocusStateStyles,
  type FocusPreset,
  type FocusPosition,
  type FocusAnimation,
  FOCUS_COLORS,
  FOCUS_DURATIONS,
} from "./focus-states"

// ============================================================================
// ACTIVE STATES
// ============================================================================

export {
  activeStates,
  getActiveStateStyles,
  applyActivePreset,
  activePresets,
  interactionStates,
  getActiveVars,
  getActiveStyles,
  type ActiveConfig,
  type ActiveStateStyles,
  type ActiveScalePreset,
  type ActiveBrightnessPreset,
  ACTIVE_DURATIONS,
  ACTIVE_EASINGS,
} from "./active-states"

// ============================================================================
// BUTTON VARIANTS
// ============================================================================

export {
  ButtonInteraction,
  buttonInteractionStyles,
  applyButtonPreset,
  buttonInteractionPresets,
  iconButtonInteraction,
  getLoadingStyles,
  getDisabledStyles,
  type ButtonInteractionProps,
  type ButtonInteractionConfig,
  type ButtonInteractionStyles,
  type ButtonVariant,
  type ButtonSize,
  type ButtonState,
  BUTTON_SIZES,
  VARIANT_INTERACTIONS,
} from "./button-variants"

// ============================================================================
// SWIPE GESTURES
// ============================================================================

export {
  useSwipeGestures,
  useSwipeToDelete,
  useSwipeToRefresh,
  useSwipeToNavigate,
  type SwipeGestureConfig,
  type SwipeGestureHandlers,
  type SwipeState,
  type SwipeDirection,
  DEFAULT_SWIPE_CONFIG,
} from "./use-swipe-gestures"

// ============================================================================
// RIPPLE EFFECT
// ============================================================================

export {
  Ripple,
  RippleContainer,
  RippleButton,
  useRipple,
  ripplePresets,
  applyRipplePreset,
  type RippleProps,
  type RippleConfig,
  type RippleState,
  type RippleReturn,
  RIPPLE_DURATIONS,
  DEFAULT_RIPPLE_CONFIG,
} from "./ripple-effect"
