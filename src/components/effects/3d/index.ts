/**
 * 3D Card System with Tilt
 *
 * Barrel export for all 3D tilt components and utilities.
 *
 * @example
 * ```tsx
 * import {
 *   TiltCard,
 *   GlassTiltCard,
 *   GradientTiltCard,
 *   NeonTiltCard,
 *   useTilt,
 *   useTiltParallax
 * } from '@/components/effects/3d'
 * ```
 */

// Main components
export {
  TiltCard,
  TiltCardSubtle,
  TiltCardExtreme,
  GlassTiltCard,
  GradientTiltCard,
  NeonTiltCard,
} from "./tilt-card"

// Hooks
export {
  useTilt,
  useTiltParallax,
  use3DTransform,
} from "./use-tilt"

// Types
export type {
  TiltConfig,
  TiltValues,
  TiltHandlers,
} from "./use-tilt"

export type {
  TiltCardProps,
  GradientTiltCardProps,
  NeonTiltCardProps,
  TiltIntensity,
} from "./tilt-card"
