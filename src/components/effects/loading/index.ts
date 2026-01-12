/**
 * Loading Effects
 *
 * Barrel export for all loading-related components and utilities.
 *
 * @example
 * ```tsx
 * import {
 *   LoadingSkeleton,
 *   Spinner,
 *   ProgressBar,
 *   LoadingScreen,
 *   SkeletonCard,
 *   loadingPresets
 * } from "@/components/effects/loading"
 * ```
 */

// ============================================================================
// SKELETON
// ============================================================================

export {
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
} from "./loading-skeleton"

// ============================================================================
// SPINNER
// ============================================================================

export {
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
} from "./spinner"

// ============================================================================
// PROGRESS BAR
// ============================================================================

export {
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
  PROGRESS_SIZES,
  PROGRESS_COLORS,
} from "./progress-bar"

// ============================================================================
// LOADING SCREEN
// ============================================================================

export {
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
} from "./loading-screen"

// ============================================================================
// SKELETON CARD
// ============================================================================

export {
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
  type SkeletonCardConfig as SkeletonCardComponentConfig,
  type SkeletonCardVariant,
  type SkeletonCardListProps,
} from "./skeleton-card"

// ============================================================================
// LOADING PRESETS
// ============================================================================

export {
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
} from "./loading-preset"
