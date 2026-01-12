/**
 * Effects Components
 *
 * 3D effects, animations, and visual enhancement components.
 *
 * @example
 * ```tsx
 * import {
 *   ParticleBackground,
 *   Hero3DCard,
 *   PageTransition,
 *   TiltCard,
 *   CinematicPageTransition,
 *   MouseTrail,
 *   ConfettiEffect
 * } from "@/components/effects"
 *
 * <CinematicPageTransition type="fadeBlur">
 *   <MouseTrail preset="magic" />
 *   <ParticleBackground count={50}>
 *     <TiltCard intensity="medium" specular>
 *       Content
 *     </TiltCard>
 *   </ParticleBackground>
 * </CinematicPageTransition>
 * ```
 */

// ============================================================================
// PARTICLE EFFECTS (NEW)
// ============================================================================

export {
  // Core engine
  useParticleEngine,
  ParticleEngine,
  usePrefersReducedMotion,
  useParticleEmitter,
  type Particle,
  type EmitterConfig,
  type ParticleEngineConfig,

  // Hero particles
  HeroParticles,
  SparkleParticles,
  ConfettiParticles,
  SnowParticles,
  FireworkParticles,
  type HeroParticlePreset,

  // Ambient particles
  AmbientParticles,
  SubtleAmbientParticles,
  FloatingAmbientParticles,
  DustMotes,
  Fireflies,
  type AmbientPreset,

  // Mouse trail
  MouseTrail,
  SparkleTrail,
  FireTrail,
  MagicTrail,
  CometTrail,
  BubbleTrail,
  CursorGlow,
  CursorRing,
  type TrailPreset,

  // Confetti
  ConfettiEffect,
  CelebrationConfetti,
  CannonConfetti,
  ExplosionConfetti,
  ConfettiRain,
  ConfettiButton,
  type ConfettiPreset,
} from "./particles"

// ============================================================================
// 3D EFFECTS (NEW)
// ============================================================================

export {
  TiltCard,
  TiltCardSubtle,
  TiltCardExtreme,
  GlassTiltCard,
  GradientTiltCard,
  NeonTiltCard,
  useTilt,
  useTiltParallax,
  use3DTransform,
  type TiltConfig,
  type TiltValues,
  type TiltHandlers,
  type TiltIntensity,
  type TiltCardProps,
  type GradientTiltCardProps,
  type NeonTiltCardProps,
} from "./3d"

// ============================================================================
// TRANSITIONS (ENHANCED)
// ============================================================================

export {
  // Cinematic transitions
  CinematicPageTransition,
  SharedElementTransition,
  StaggerContainer,
  SkipLink,
  useRouteTransition as useCinematicRouteTransition,
  type CinematicTransitionType,
  type RouteTransitionConfig,
  defaultRouteTransitions,

  // Presets
  easing,
  transitions,
  presets as transitionPresets,
  getTransition,
  getEasing,
  combineVariants,
  createStaggerVariants,
} from "./transitions"

// ============================================================================
// LEGACY EFFECTS (EXISTING)
// ============================================================================

// Particle effects
export {
  ParticleBackground,
  ParticleBackgroundWithPreset,
  ParticlePresets,
} from "./particle-background"
export type { ParticleBackgroundProps, ParticleConfig, ParticleBackgroundWithPresetProps } from "./particle-background"

// 3D Card effects
export {
  Hero3DCard,
  Hero3DCardSimple,
  Hero3DCardGlass,
  Hero3DCardGradient,
} from "./hero-3d-card"
export type { Hero3DCardProps, Hero3DCardSimpleProps, Hero3DCardGlassProps, Hero3DCardGradientProps } from "./hero-3d-card"

// Page transitions
export {
  PageTransition,
  SharedElement,
  TransitionGroup,
  useRouteTransition,
} from "./page-transition"
export type {
  PageTransitionProps,
  PageTransitionType,
  PageTransitionMode,
  SharedElementProps,
  TransitionGroupProps,
} from "./page-transition"

// Stagger children
export {
  StaggerChildren,
  StaggerItem,
  StaggerList,
  GridStagger,
  fadeStagger,
  slideUpStagger,
  scaleStagger,
  blurStagger,
  rotateStagger,
  slideUpItem,
  scaleItem,
  blurItem,
  rotateItem,
  getStaggerVariants,
} from "./stagger-children"
export type {
  StaggerChildrenProps,
  StaggerItemProps,
  StaggerListProps,
  GridStaggerProps,
  StaggerType,
  StaggerDirection,
} from "./stagger-children"

// Number tween
export {
  NumberTween,
  Counter,
  NumberProgress,
  NumberCircularProgress,
  Ticker,
  formatNumber,
} from "./number-tween"
export type {
  NumberTweenProps,
  NumberFormatOptions,
  CounterProps,
  NumberProgressProps,
  NumberCircularProgressProps,
  TickerProps,
} from "./number-tween"

// ============================================================================
// MICRO-INTERACTIONS (NEW)
// ============================================================================

export {
  // Hover states
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

  // Focus states
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

  // Active states
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

  // Button variants
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

  // Swipe gestures
  useSwipeGestures,
  useSwipeToDelete,
  useSwipeToRefresh,
  useSwipeToNavigate,
  type SwipeGestureConfig,
  type SwipeGestureHandlers,
  type SwipeState,
  type SwipeDirection,

  // Ripple effect
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
} from "./micro-interactions"

// ============================================================================
// SCROLL ANIMATIONS (NEW)
// ============================================================================

export {
  // Scroll observer
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

  // Scroll reveal
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

  // Parallax
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

  // Scroll progress
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

  // Scroll triggered animations
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
} from "./scroll"

// ============================================================================
// LOADING ANIMATIONS (NEW)
// ============================================================================

export {
  // Skeleton
  LoadingSkeleton,
  SkeletonRect,
  SkeletonCircle,
  SkeletonText,
  SkeletonAvatar,
  SkeletonList,
  SkeletonTable,
  applySkeletonPreset,
  type LoadingSkeletonProps,
  type LoadingSkeletonConfig,
  type SkeletonVariant,
  type SkeletonAnimation,
  type SkeletonCardProps,
  type SkeletonListProps,
  type SkeletonTableProps,

  // Spinner
  Spinner,
  SpinnerDots,
  SpinnerBars,
  SpinnerPulse,
  SpinnerOrb,
  SpinnerWave,
  SpinnerXS,
  SpinnerSM,
  SpinnerMD,
  SpinnerLG,
  SpinnerXL,
  applySpinnerPreset,
  type SpinnerProps,
  type SpinnerConfig,
  type SpinnerVariant,
  type SpinnerSize,

  // Progress bar
  ProgressBar,
  ProgressBarStriped,
  ProgressBarAnimated,
  ProgressBarThin,
  ProgressBarThick,
  ProgressBarIndeterminate,
  ProgressBarPrimary,
  ProgressBarSuccess,
  ProgressBarWarning,
  ProgressBarDanger,
  ProgressBarInfo,
  ProgressBarSM,
  ProgressBarMD,
  ProgressBarLG,
  CircularProgress,
  type ProgressBarProps,
  type ProgressBarConfig,
  type ProgressBarVariant,
  type ProgressBarSize,
  type ProgressBarColor,
  type CircularProgressProps,

  // Loading screen
  LoadingScreen,
  LoadingScreenSpinner,
  LoadingScreenDots,
  LoadingScreenPulse,
  LoadingScreenProgress,
  useLoadingScreen,
  type LoadingScreenProps,
  type LoadingScreenConfig,
  type LoadingScreenPreset,
  type UseLoadingScreenOptions,

  // Skeleton card
  SkeletonCard,
  SkeletonCardList,
  SkeletonMarket,
  SkeletonPortfolio,
  SkeletonAlert,
  SkeletonProfile,
  SkeletonList as SkeletonListItem,
  SkeletonTable as SkeletonTableComponent,
  SkeletonStat,
  type SkeletonCardProps as SkeletonCardComponentProps,
  type SkeletonCardVariant,
  type SkeletonCardListProps,

  // Loading presets
  loadingPresets,
  getPresetConfig,
  getPresetConfigs,
  isSkeletonPreset,
  isSpinnerPreset,
  componentLoadingStates,
  getComponentLoadingState,
  getLoadingPresetForComponent,
  createLoadingState,
  setLoadedData,
  setLoadingError,
  useLoadingStatePattern,
  type LoadingPreset,
  type PresetConfig,
  type LoadingState,
  type UseLoadingStateOptions,
} from "./loading"

// ============================================================================
// GLASSMORPHISM (NEW)
// ============================================================================

export {
  // Glass cards
  GlassCard,
  GlassCardSubtle,
  GlassCardMedium,
  GlassCardHeavy,
  GlassCardColored,
  GlassCardInteractive,
  GlassCardBlue,
  GlassCardPurple,
  GlassCardGreen,
  GlassCardAmber,
  GlassCardRose,

  // Glass dialog
  GlassDialog,
  GlassDialogHeader,
  GlassDialogFooter,
  DialogContent,

  // Glass sidebar
  GlassSidebar,
  GlassSidebarItem,
  GlassSidebarSection,
  GlassSidebarCollapse,

  // Glass header
  GlassHeader,
  GlassHeaderBrand,
  GlassHeaderNav,
  GlassHeaderNavItem,
  GlassHeaderActions,

  // Presets and utilities
  glassPresets,
  coloredGlassVariants,
  applyGlassPreset,
  getGlassClasses,
  getGlassStyles,
  glassCSS,
  glassUtilities,
  supportsBackdropFilter,
  useGlass,
  type GlassPreset,
  type GlassConfig,
  type GlassStyles,
  type UseGlassOptions,
  type GlassCardProps,
  type GlassDialogProps,
  type DialogContentProps,
  type GlassDialogHeaderProps,
  type GlassDialogFooterProps,
  type GlassSidebarProps,
  type GlassSidebarItemProps,
  type GlassSidebarSectionProps,
  type GlassSidebarCollapseProps,
  type GlassHeaderProps,
  type GlassHeaderBrandProps,
  type GlassHeaderNavProps,
  type GlassHeaderNavItemProps,
  type GlassHeaderActionsProps,
} from "./glassmorphism"

// ============================================================================
// ADVANCED HOVER STATES (NEW)
// ============================================================================

export {
  // Hover lift
  HoverLift,
  HoverLiftSubtle,
  HoverLiftMedium,
  HoverLiftStrong,
  HoverLiftExtreme,
  useHoverLift,

  // Hover glow
  HoverGlow,
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

  // Hover shine
  HoverShine,
  HoverShineRight,
  HoverShineLeft,
  HoverShineBottom,
  HoverShineTop,
  HoverShineDiagonal,
  HoverShineFast,
  HoverShineSlow,
  ShinyButton,

  // Hover scale
  HoverScale,
  HoverScaleSubtle,
  HoverScaleDefault,
  HoverScaleMedium,
  HoverScaleStrong,
  HoverScaleExtreme,
  HoverScaleCenter,
  HoverScaleTopLeft,
  HoverScaleBottomRight,
  useHoverScale,

  // Hover rotate
  HoverRotate,
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

  // Compound hover
  CompoundHover,
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
  type HoverLiftProps,
  type UseHoverLiftOptions,
  type HoverGlowProps,
  type GlowColor,
  type GlowIntensity,
  type UseHoverGlowOptions,
  type HoverShineProps,
  type ShineDirection,
  type ShineColor,
  type ShinyButtonProps,
  type HoverScaleProps,
  type ScaleOrigin,
  type UseHoverScaleOptions,
  type HoverRotateProps,
  type RotateDirection,
  type RotateOrigin,
  type RotatePreset,
  type SpinOnHoverProps,
  type UseHoverRotateOptions,
  type CompoundHoverProps,
  type HoverEffectType,
  type CompoundPreset,
  type Hover3DCardProps,
  type MagneticButtonProps,
  type UseCompoundHoverOptions,
} from "./hover"

// ============================================================================
// FOCUS STATE CHOREOGRAPHY (NEW)
// ============================================================================

export {
  // Focus ring
  FocusRing,
  FocusRingSubtle,
  FocusRingStrong,
  FocusRingHighContrast,
  FocusRingBlue,
  FocusRingPurple,
  FocusRingGreen,

  // Focus glow
  FocusGlow,
  FocusGlowSubtle,
  FocusGlowHigh,
  FocusGlowExtreme,
  FocusGlowBlue,
  FocusGlowPurple,
  FocusGlowGreen,
  FocusGlowAmber,
  FocusGlowRose,

  // Focus trap
  FocusTrap,
  useFocusTrap,

  // Focus visible manager
  FocusVisibleManager,
  useFocusVisible,
  useInputMethod,
  hasFocusVisible,
  addFocusVisible,
  removeFocusVisible,
  toggleFocusVisible,
  useFocusVisibleElement,

  // Focus scope
  FocusScope,
  useFocusScope,
  type FocusRingProps,
  type FocusRingColor,
  type FocusRingPreset,
  type FocusGlowProps,
  type GlowColor as FocusGlowColor,
  type GlowIntensity as FocusGlowIntensity,
  type FocusTrapProps,
  type UseFocusTrapOptions,
  type FocusVisibleManagerProps,
  type UseFocusVisibleElementOptions,
  type FocusScopeProps,
  type FocusNavigationDirection,
  type UseFocusScopeOptions,
} from "./focus"

// ============================================================================
// COLOR TRANSITION EFFECTS (NEW T30)
// ============================================================================

export {
  // Color interpolator
  colorInterpolator,
  parseColor,
  rgbToHex,
  rgbToHsl,
  hslToRgb,
  toRGB,
  toHSL,
  interpolateColor,
  interpolateRGB,
  interpolateHSL,
  interpolateGradient,
  createGradient,
  animateColor,
  cancelAllAnimations,
  prefersReducedMotion,
  easings as colorEasings,
  type ColorInput,
  type ColorStop,
  type RGB,
  type HSL,
  type EasingFunction,
} from "./colors/color-interpolator"

export {
  // Theme transition
  ThemeTransition,
  ThemeAware,
  ThemeSwitchButton,
} from "./colors/theme-transition"

export {
  // Color morph
  ColorMorph,
  MorphingBadge,
  MorphingProgress,
  MorphingTextGradient,
  useColorMorph,
} from "./colors/color-morph"

export {
  // Gradient animation
  AnimatedGradient,
  AuroraGradient,
  MeshGradient,
  ShimmerGradient,
  ConicSpinner,
  useAnimatedGradient,
} from "./colors/gradient-animation"

// ============================================================================
// VIRTUALIZATION EFFECTS (NEW T31)
// ============================================================================

export {
  // Virtual grid
  VirtualGrid,
} from "./virtualization/virtual-grid"

export {
  // Virtual timeline
  VirtualTimeline,
} from "./virtualization/virtual-timeline"

export {
  // Dynamic sizing
  useDynamicSizing,
  useDynamicMeasurement,
  useDynamicRange,
  findApproximateIndex,
  calculateOverscan,
} from "./virtualization/dynamic-sizing"

export {
  // Infinite scroll
  InfiniteScroll,
  VirtualizedInfiniteScroll,
} from "./virtualization/infinite-scroll"

// ============================================================================
// IMAGE LOADING EFFECTS (NEW T32)
// ============================================================================

export {
  // Blur-up loader
  BlurUpLoader,
  BlurUpBackground,
  BlurUpAvatar,
} from "./images/blur-up-loader"

export {
  // Skeleton placeholder
  ImageSkeleton,
  SkeletonImage,
  CardSkeleton,
  GridSkeleton,
  AvatarSkeleton,
} from "./images/skeleton-placeholder"

export {
  // Progressive loader
  ProgressiveLoader,
  ProgressiveGallery,
  ProgressiveBackground,
  useProgressiveImage,
  useImageFormatSupport,
} from "./images/progressive-loader"

