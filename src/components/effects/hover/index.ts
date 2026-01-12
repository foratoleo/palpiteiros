/**
 * Advanced Hover Effects
 *
 * Sophisticated hover interactions for premium user experience.
 * All effects use GPU-accelerated transforms and spring physics.
 *
 * @example
 * ```tsx
 * import {
 *   HoverLift,
 *   HoverGlow,
 *   HoverShine,
 *   HoverScale,
 *   HoverRotate,
 *   CompoundHover
 * } from '@/components/effects/hover'
 * ```
 */

// Lift effect
export { HoverLift } from "./hover-lift"
export {
  HoverLiftSubtle,
  HoverLiftMedium,
  HoverLiftStrong,
  HoverLiftExtreme,
  useHoverLift,
} from "./hover-lift"
export type { HoverLiftProps, UseHoverLiftOptions } from "./hover-lift"

// Glow effect
export { HoverGlow } from "./hover-glow"
export {
  HoverGlowBlue,
  HoverGlowPurple,
  HoverGlowGreen,
  HoverGlowAmber,
  HoverGlowRose,
  HoverGlowWhite,
  HoverGlowSubtle,
  HoverGlowHigh,
  HoverGlowExtreme,
  useHoverGlow,
} from "./hover-glow"
export type { HoverGlowProps, GlowColor, GlowIntensity, UseHoverGlowOptions } from "./hover-glow"

// Shine effect
export { HoverShine } from "./hover-shine"
export {
  HoverShineRight,
  HoverShineLeft,
  HoverShineBottom,
  HoverShineTop,
  HoverShineDiagonal,
  HoverShineFast,
  HoverShineSlow,
  ShinyButton,
} from "./hover-shine"
export type { HoverShineProps, ShineDirection, ShineColor, ShinyButtonProps } from "./hover-shine"

// Scale effect
export { HoverScale } from "./hover-scale"
export {
  HoverScaleSubtle,
  HoverScaleDefault,
  HoverScaleMedium,
  HoverScaleStrong,
  HoverScaleExtreme,
  HoverScaleCenter,
  HoverScaleTopLeft,
  HoverScaleBottomRight,
  useHoverScale,
} from "./hover-scale"
export type {
  HoverScaleProps,
  ScaleOrigin,
  ScalePreset,
  UseHoverScaleOptions,
} from "./hover-scale"

// Rotate effect
export { HoverRotate } from "./hover-rotate"
export {
  HoverRotateSubtle,
  HoverRotateDefault,
  HoverRotateMedium,
  HoverRotateStrong,
  HoverRotateCW,
  HoverRotateCCW,
  HoverRotateWithScale,
  IconWiggle,
  SpinOnHover,
  useHoverRotate,
} from "./hover-rotate"
export type {
  HoverRotateProps,
  RotateDirection,
  RotateOrigin,
  RotatePreset,
  SpinOnHoverProps,
  UseHoverRotateOptions,
} from "./hover-rotate"

// Compound effects
export { CompoundHover } from "./compound-hover"
export {
  CardHover,
  ButtonHover,
  IconHover,
  BadgeHover,
  PremiumHover,
  PlayfulHover,
  SubtleHover,
  DramaticHover,
  Hover3DCard,
  MagneticButton,
  useCompoundHover,
} from "./compound-hover"
export type {
  CompoundHoverProps,
  HoverEffectType,
  CompoundPreset,
  Hover3DCardProps,
  MagneticButtonProps,
  UseCompoundHoverOptions,
} from "./compound-hover"
