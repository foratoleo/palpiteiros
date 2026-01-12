/**
 * Focus State Choreography
 *
 * Beautiful, accessible focus states with smooth animations.
 * WCAG AAA compliant with keyboard navigation support.
 *
 * @example
 * ```tsx
 * import {
 *   FocusRing,
 *   FocusGlow,
 *   FocusTrap,
 *   FocusVisibleManager,
 *   FocusScope
 * } from '@/components/effects/focus'
 * ```
 */

// Focus ring
export { FocusRing } from "./focus-ring"
export {
  FocusRingSubtle,
  FocusRingStrong,
  FocusRingHighContrast,
  FocusRingBlue,
  FocusRingPurple,
  FocusRingGreen,
} from "./focus-ring"
export type { FocusRingProps, FocusRingColor, FocusRingPreset } from "./focus-ring"

// Focus glow
export { FocusGlow } from "./focus-glow"
export {
  FocusGlowSubtle,
  FocusGlowHigh,
  FocusGlowExtreme,
  FocusGlowBlue,
  FocusGlowPurple,
  FocusGlowGreen,
  FocusGlowAmber,
  FocusGlowRose,
} from "./focus-glow"
export type { FocusGlowProps, GlowColor, GlowIntensity } from "./focus-glow"

// Focus trap
export { FocusTrap, useFocusTrap } from "./focus-trap"
export type { FocusTrapProps, UseFocusTrapOptions } from "./focus-trap"

// Focus visible manager
export {
  FocusVisibleManager,
  useFocusVisible,
  useInputMethod,
  hasFocusVisible,
  addFocusVisible,
  removeFocusVisible,
  toggleFocusVisible,
  useFocusVisibleElement,
} from "./focus-visible-manager"
export type {
  FocusVisibleManagerProps,
  UseFocusVisibleElementOptions,
} from "./focus-visible-manager"

// Focus scope
export { FocusScope, useFocusScope } from "./focus-scope"
export type {
  FocusScopeProps,
  FocusNavigationDirection,
  UseFocusScopeOptions,
} from "./focus-scope"
