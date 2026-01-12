/**
 * Loading Presets
 *
 * Predefined loading configurations for common use cases.
 * Provides consistent loading states across the application.
 *
 * @example
 * ```tsx
 * import { loadingPresets, getPresetConfig } from "./loading-preset"
 *
 * <LoadingSkeleton {...loadingPresets.card} />
 * <Spinner {...loadingPresets.button} />
 * ```
 */

import * as React from "react"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Loading preset type
 */
export type LoadingPreset =
  | "button"
  | "input"
  | "card"
  | "list"
  | "table"
  | "avatar"
  | "text"
  | "image"
  | "market"
  | "portfolio"
  | "alert"
  | "page"
  | "inline"
  | "overlay"

/**
 * Preset configuration
 */
export interface PresetConfig {
  /** Display type */
  type: "skeleton" | "spinner" | "dots" | "progress"
  /** Size */
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  /** Width */
  width?: number | string
  /** Height */
  height?: number | string
  /** Count (for lists) */
  count?: number
  /** Animation variant */
  animation?: "shimmer" | "pulse" | "wave"
}

// ============================================================================
// PRESETS
// ============================================================================

/**
 * Loading presets configuration
 */
export const loadingPresets: Record<LoadingPreset, PresetConfig> = {
  // Button loading - small spinner
  button: {
    type: "spinner",
    size: "sm",
    width: 16,
    height: 16,
  },

  // Input loading - skeleton input
  input: {
    type: "skeleton",
    animation: "pulse",
    width: "100%",
    height: 40,
  },

  // Card loading - full card skeleton
  card: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 200,
  },

  // List loading - multiple text lines
  list: {
    type: "skeleton",
    animation: "shimmer",
    count: 5,
    height: 60,
  },

  // Table loading - table rows
  table: {
    type: "skeleton",
    animation: "shimmer",
    count: 10,
    height: 48,
  },

  // Avatar loading - circle skeleton
  avatar: {
    type: "skeleton",
    width: 40,
    height: 40,
    animation: "pulse",
  },

  // Text loading - single text line
  text: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 16,
  },

  // Image loading - rect skeleton
  image: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 200,
  },

  // Market card loading - market-specific skeleton
  market: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 180,
  },

  // Position card loading - portfolio-specific skeleton
  portfolio: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 160,
  },

  // Alert item loading - alert-specific skeleton
  alert: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 140,
  },

  // Page loading - full page skeleton
  page: {
    type: "skeleton",
    animation: "shimmer",
    width: "100%",
    height: 600,
  },

  // Inline loading - small spinner
  inline: {
    type: "spinner",
    size: "sm",
    width: 16,
    height: 16,
  },

  // Overlay loading - centered spinner
  overlay: {
    type: "spinner",
    size: "lg",
    width: 48,
    height: 48,
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get preset configuration
 */
export function getPresetConfig(preset: LoadingPreset): PresetConfig {
  return loadingPresets[preset]
}

/**
 * Get multiple presets
 */
export function getPresetConfigs(...presets: LoadingPreset[]): Record<LoadingPreset, PresetConfig> {
  const result: Record<string, PresetConfig> = {}
  for (const preset of presets) {
    result[preset] = loadingPresets[preset]
  }
  return result as Record<LoadingPreset, PresetConfig>
}

/**
 * Check if preset uses skeleton
 */
export function isSkeletonPreset(preset: LoadingPreset): boolean {
  return loadingPresets[preset].type === "skeleton"
}

/**
 * Check if preset uses spinner
 */
export function isSpinnerPreset(preset: LoadingPreset): boolean {
  return loadingPresets[preset].type === "spinner"
}

// ============================================================================
// LOADING STATES FOR COMPONENTS
// ============================================================================

/**
 * Component loading states
 * Maps UI components to their loading presets
 */
export const componentLoadingStates: Record<string, LoadingPreset> = {
  // Button components
  Button: "button",
  IconButton: "button",

  // Input components
  Input: "input",
  Textarea: "input",
  Select: "input",

  // Card components
  Card: "card",
  MarketCard: "market",
  PositionCard: "portfolio",
  AlertItem: "alert",

  // List components
  MarketList: "list",
  PositionList: "list",
  AlertList: "list",

  // Table components
  PositionsTable: "table",
  MarketsTable: "table",

  // Display components
  Avatar: "avatar",
  UserAvatar: "avatar",
  MarketThumbnail: "image",
  PriceChart: "image",
  AllocationChart: "image",
}

/**
 * Get loading preset for component
 */
export function getComponentLoadingState(componentName: string): LoadingPreset | undefined {
  return componentLoadingStates[componentName]
}

/**
 * Get loading preset for component type
 */
export function getLoadingPresetForComponent(
  componentType: "button" | "input" | "card" | "list" | "table" | "avatar" | "image"
): LoadingPreset {
  const mapping: Record<typeof componentType, LoadingPreset> = {
    button: "button",
    input: "input",
    card: "card",
    list: "list",
    table: "table",
    avatar: "avatar",
    image: "image",
  }
  return mapping[componentType]
}

// ============================================================================
// LOADING STATE GENERATORS
// ============================================================================

/**
 * Generate loading state for async operation
 */
export interface LoadingState<T> {
  data: T | null
  isLoading: boolean
  error: Error | null
}

export function createLoadingState<T>(): LoadingState<T> {
  return {
    data: null,
    isLoading: true,
    error: null,
  }
}

export function setLoadedData<T>(state: LoadingState<T>, data: T): LoadingState<T> {
  return {
    data,
    isLoading: false,
    error: null,
  }
}

export function setLoadingError<T>(state: LoadingState<T>, error: Error): LoadingState<T> {
  return {
    data: null,
    isLoading: false,
    error,
  }
}

/**
 * Loading state hook pattern
 */
export interface UseLoadingStateOptions<T> {
  initialData?: T | null
  preset?: LoadingPreset
}

export function useLoadingStatePattern<T>(options: UseLoadingStateOptions<T> = {}) {
  const [state, setState] = React.useState<LoadingState<T>>({
    data: options.initialData ?? null,
    isLoading: false,
    error: null,
  })

  const execute = React.useCallback(async (fn: () => Promise<T>) => {
    setState({ data: state.data, isLoading: true, error: null })
    try {
      const data = await fn()
      setState({ data, isLoading: false, error: null })
      return data
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error })
      throw error
    }
  }, [state.data])

  const reset = React.useCallback(() => {
    setState({ data: options.initialData ?? null, isLoading: false, error: null })
  }, [options.initialData])

  return {
    ...state,
    execute,
    reset,
    preset: options.preset,
  }
}
