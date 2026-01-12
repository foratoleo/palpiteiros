/**
 * Memoization Module
 *
 * Advanced memoization utilities for React and vanilla JavaScript.
 *
 * @module optimization/memoization
 */

// Enhanced useMemo
export {
  useMemoized,
  useMemoizedByKey,
  useMemoizedWithTTL,
  useAsyncMemoized,
  useMemoizedDerive,
  useMemoizedStats,
  clearMemoizedCache,
  memoized,
  CacheManager,
  createCacheKey,
  estimateSize,
} from './use-memoized';
export type {
  MemoizedOptions,
  UseMemoizedOptions,
  CacheStats,
  MemoizedAsyncResult,
  MemoizedComponentOptions,
} from './use-memoized';

// Enhanced useCallback
export {
  useMemoizedCallback,
  useDepsTracker,
  useEventHandler,
  useClickHandler,
  useChangeHandler,
  useSubmitHandler,
  useThrottledCallback,
  useDebouncedCallback,
  useOnceCallback,
  useOncePerDepsCallback,
  useCallbackWithCleanup,
  useRafCallback,
  useConditionalCallback,
  useSwitchCallback,
  areDepsEqual,
} from './use-memoized-callback';
export type {
  MemoizedCallback,
  MemoizedCallbackOptions,
  ThrottleCallbackOptions,
  DebounceCallbackOptions,
} from './use-memoized-callback';

// Function memoization
export {
  memoize,
  memoizeAsync,
  memoizeOne,
  memoizeDeep,
  memoizeWith,
  memoizeShallow,
  cached,
  cachedTTL,
  cachedMaxSize,
  memoizedValue,
  createMemoizer,
  createCommutativeMemoizer,
  defaultKeyGenerator,
  registerCache,
  clearAllCaches,
  getRegisteredCacheCount,
} from './memoize-fn';
export type {
  MemoizedFunction,
  MemoizeOptions,
  MemoizeStats,
  MemoizedValue,
} from './memoize-fn';
