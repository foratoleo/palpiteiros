/**
 * Particle Effects System
 *
 * Barrel export for all particle effect components and utilities.
 *
 * @example
 * ```tsx
 * import {
 *   ParticleEngine,
 *   HeroParticles,
 *   AmbientParticles,
 *   MouseTrail,
 *   ConfettiEffect,
 *   useParticleEngine
 * } from '@/components/effects/particles'
 * ```
 */

// Core engine
export {
  useParticleEngine,
  ParticleEngine,
  usePrefersReducedMotion,
  useParticleEmitter,
  type Particle,
  type EmitterConfig,
  type ParticleEngineConfig,
} from "./particle-engine"

// Hero particles
export {
  HeroParticles,
  SparkleParticles,
  ConfettiParticles,
  SnowParticles,
  FireworkParticles,
  type HeroParticlePreset,
  type HeroParticlesProps,
} from "./hero-particles"

// Ambient particles
export {
  AmbientParticles,
  SubtleAmbientParticles,
  FloatingAmbientParticles,
  DustMotes,
  Fireflies,
  type AmbientPreset,
  type AmbientParticlesProps,
} from "./ambient-particles"

// Mouse trail
export {
  MouseTrail,
  SparkleTrail,
  FireTrail,
  MagicTrail,
  CometTrail,
  BubbleTrail,
  CursorGlow,
  CursorRing,
  type TrailPreset,
  type MouseTrailProps,
  type CursorGlowProps,
  type CursorRingProps,
} from "./mouse-trail"

// Confetti effect
export {
  ConfettiEffect,
  CelebrationConfetti,
  CannonConfetti,
  ExplosionConfetti,
  ConfettiRain,
  ConfettiButton,
  type ConfettiPreset,
  type ConfettiEffectProps,
  type CelebrationConfettiProps,
  type ConfettiRainProps,
  type ConfettiButtonProps,
} from "./confetti-effect"
