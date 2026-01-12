/**
 * Enhanced useCallback with Dependency Tracking
 *
 * Advanced callback memoization with dependency tracking,
 * debouncing/throttling integration, and cleanup management.
 *
 * @module memoization/use-memoized-callback
 */

import { useRef, useEffect, useCallback, useMemo } from 'react';
import type { ThrottledFunction, DebouncedFunction } from '../raf/raf-throttle';

// ============================================================================
// Dependency Tracking
// ============================================================================

/**
 * Deep equality check for dependency arrays
 */
export function areDepsEqual(prevDeps: unknown[], nextDeps: unknown[]): boolean {
  if (prevDeps === nextDeps) return true;
  if (prevDeps.length !== nextDeps.length) return false;

  for (let i = 0; i < prevDeps.length; i++) {
    const prev = prevDeps[i];
    const next = nextDeps[i];

    if (prev === next) continue;

    // Handle objects and arrays
    if (typeof prev === 'object' && typeof next === 'object' && prev !== null && next !== null) {
      if (Array.isArray(prev) !== Array.isArray(next)) return false;

      try {
        if (JSON.stringify(prev) !== JSON.stringify(next)) {
          return false;
        }
      } catch {
        // Circular reference or non-serializable
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}

/**
 * Track dependency changes with callback
 */
export function useDepsTracker(
  deps: unknown[],
  onChange?: (changed: boolean, prevDeps: unknown[], nextDeps: unknown[]) => void
): boolean {
  const prevDepsRef = useRef<unknown[] | null>(null);

  const changed = prevDepsRef.current === null || !areDepsEqual(prevDepsRef.current, deps);

  useEffect(() => {
    if (prevDepsRef.current !== null) {
      onChange?.(changed, prevDepsRef.current, deps);
    }
    prevDepsRef.current = deps;
  }, [deps, changed, onChange]);

  return changed;
}

// ============================================================================
// Enhanced useCallback
// ============================================================================

/**
 * Options for enhanced callback memoization
 */
export interface MemoizedCallbackOptions {
  /** Debug mode for logging dependency changes */
  debug?: boolean;
  /** Callback name for debugging */
  name?: string;
  /** Track dependency changes */
  trackDeps?: boolean;
  /** Cleanup function to run when callback changes */
  cleanup?: () => void;
  /** Maximum number of cached callback versions */
  cacheSize?: number;
}

/**
 * Enhanced useCallback with dependency tracking and debugging
 */
export interface MemoizedCallback<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T>;
  /** Current dependencies */
  deps: unknown[];
  /** Number of times callback was recreated */
  version: number;
  /** Clear the callback cache */
  clearCache: () => void;
}

export function useMemoizedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[],
  options: MemoizedCallbackOptions = {}
): MemoizedCallback<T> {
  const { debug = false, name = 'callback', trackDeps = false, cleanup } = options;

  const callbackRef = useRef(callback);
  const depsRef = useRef(deps);
  const versionRef = useRef(0);
  const cacheRef = useRef<Map<string, T>>(new Map());

  // Update callback ref
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Track dependency changes
  const changed = useDepsTracker(deps, (isChanged, prev, next) => {
    if (isChanged && debug) {
      console.log(`[${name}] Dependencies changed:`, {
        prev,
        next,
        changed,
      });
    }

    if (isChanged) {
      versionRef.current++;

      // Run cleanup
      cleanup?.();

      // Manage cache size
      if (cacheRef.current.size > (options.cacheSize ?? 5)) {
        const firstKey = cacheRef.current.keys().next().value;
        if (firstKey !== undefined) {
          cacheRef.current.delete(firstKey);
        }
      }
    }
  });

  // Create cache key
  const cacheKey = useMemo(() => {
    try {
      return JSON.stringify(deps);
    } catch {
      return deps.map((d, i) => `dep_${i}_${typeof d}`).join('|');
    }
  }, [deps]);

  // Check cache
  const cachedCallback = cacheRef.current.get(cacheKey);
  if (cachedCallback && !changed) {
    return useMemo(() => {
      const fn = ((...args: Parameters<T>) => cachedCallback(...args)) as MemoizedCallback<T>;
      fn.deps = deps;
      fn.version = versionRef.current;
      fn.clearCache = () => cacheRef.current.clear();
      return fn;
    }, [deps, versionRef.current]);
  }

  // Create new callback
  const memoizedFn = useCallback((...args: Parameters<T>) => {
    return callbackRef.current(...args);
  }, deps) as T;

  // Cache it
  cacheRef.current.set(cacheKey, memoizedFn);

  return useMemo(() => {
    const fn = ((...args: Parameters<T>) => memoizedFn(...args)) as MemoizedCallback<T>;
    fn.deps = deps;
    fn.version = versionRef.current;
    fn.clearCache = () => cacheRef.current.clear();
    return fn;
  }, [deps, memoizedFn, versionRef.current]);
}

// ============================================================================
// Event Handler Callbacks
// ============================================================================

/**
 * Create a stable event handler with automatic cleanup
 *
 * Unlike useCallback, this ensures the callback identity only changes
 * when the handler function reference actually changes, not when deps change.
 */
export function useEventHandler<T extends (...args: unknown[]) => unknown>(
  handler: T,
  deps: unknown[],
  options?: Omit<MemoizedCallbackOptions, 'trackDeps'>
): T {
  const handlerRef = useRef(handler);

  // Update handler ref without changing callback identity
  useEffect(() => {
    handlerRef.current = handler;
    return options?.cleanup;
  }, [handler, ...deps]);

  // Return stable callback
  return useCallback((...args: Parameters<T>) => {
    return handlerRef.current(...args);
  }, []) as T;
}

/**
 * Create a stable click handler
 */
export function useClickHandler<T extends Event = MouseEvent>(
  handler: (event: T) => void,
  deps: unknown[] = []
): (event: T) => void {
  return useEventHandler(handler as (...args: unknown[]) => unknown, deps, { name: 'clickHandler' }) as (event: T) => void;
}

/**
 * Create a stable change handler
 */
export function useChangeHandler<T extends Event = Event>(
  handler: (event: T) => void,
  deps: unknown[] = []
): (event: T) => void {
  return useEventHandler(handler as (...args: unknown[]) => unknown, deps, { name: 'changeHandler' }) as (event: T) => void;
}

/**
 * Create a stable submit handler
 */
export function useSubmitHandler<T extends Event = SubmitEvent>(
  handler: (event: T) => void,
  deps: unknown[] = []
): (event: T) => void {
  return useEventHandler(handler as (...args: unknown[]) => unknown, deps, { name: 'submitHandler' }) as (event: T) => void;
}

// ============================================================================
// Throttled/Debounced Callbacks
// ============================================================================

/**
 * Throttle options for callbacks
 */
export interface ThrottleCallbackOptions {
  /** Throttle delay in ms (default: 16 for 60fps) */
  delay?: number;
  /** Whether to invoke on leading edge */
  leading?: boolean;
  /** Whether to invoke on trailing edge */
  trailing?: boolean;
}

/**
 * Create a throttled callback
 *
 * The throttled function identity remains stable across re-renders.
 */
export function useThrottledCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[],
  options: ThrottleCallbackOptions = {}
): T & { cancel: () => void } {
  const { delay = 16, leading = true, trailing = true } = options;

  const callbackRef = useRef(callback);
  const throttleRef = useRef<ThrottledFunction<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Import dynamically to avoid circular dependency
    import('../raf/raf-throttle').then(({ rafThrottle }) => {
      throttleRef.current = rafThrottle(
        ((...args: Parameters<T>) => callbackRef.current(...args)) as (...args: unknown[]) => unknown,
        { leading, trailing }
      );
    });

    return () => {
      throttleRef.current?.cancel();
    };
  }, [delay, leading, trailing]);

  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        return throttleRef.current?.(...args);
      }) as T & { cancel: () => void },
    []
  );
}

/**
 * Debounce options for callbacks
 */
export interface DebounceCallbackOptions {
  /** Debounce delay in ms (default: 300) */
  delay?: number;
  /** Maximum wait time before invoking */
  maxWait?: number;
}

/**
 * Create a debounced callback
 *
 * The debounced function identity remains stable across re-renders.
 */
export function useDebouncedCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[],
  options: DebounceCallbackOptions = {}
): T & { cancel: () => void; flush: () => void; pending: () => boolean } {
  const { delay = 300, maxWait } = options;

  const callbackRef = useRef(callback);
  const debouncedRef = useRef<DebouncedFunction<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Import dynamically to avoid circular dependency
    import('../raf/raf-throttle').then(({ rafDebounce }) => {
      debouncedRef.current = rafDebounce(
        ((...args: Parameters<T>) => callbackRef.current(...args)) as (...args: unknown[]) => unknown,
        delay,
        { maxWait }
      );
    });

    return () => {
      debouncedRef.current?.cancel();
    };
  }, [delay, maxWait]);

  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        return debouncedRef.current?.(...args);
      }) as T & { cancel: () => void; flush: () => void; pending: () => boolean },
    []
  );
}

// ============================================================================
// Once-Only Callbacks
// ============================================================================

/**
 * Create a callback that only executes once
 *
 * After first execution, subsequent calls are ignored.
 */
export function useOnceCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[] = []
): T {
  const calledRef = useRef(false);
  const callbackRef = useRef(callback);
  const resultRef = useRef<ReturnType<T>>();

  useEffect(() => {
    callbackRef.current = callback;
    calledRef.current = false;
    resultRef.current = undefined;
  }, [callback, ...deps]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!calledRef.current) {
        calledRef.current = true;
        resultRef.current = callbackRef.current(...args) as ReturnType<T>;
      }
      return resultRef.current;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps]
  ) as T;
}

/**
 * Create a callback that executes once per dependency change
 *
 * Unlike useOnceCallback, this resets when deps change.
 */
export function useOncePerDepsCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[]
): T {
  const calledRef = useRef(false);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
    calledRef.current = false;
  }, [callback, ...deps]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (!calledRef.current) {
        calledRef.current = true;
        return callbackRef.current(...args);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  ) as T;
}

// ============================================================================
// Cleanup Callbacks
// ============================================================================

/**
 * Create a callback with automatic cleanup on unmount
 *
 * The returned function can be called, and the cleanup function
 * will be executed when the component unmounts or deps change.
 */
export function useCallbackWithCleanup<T extends (...args: unknown[]) => () => void>(
  callback: T,
  deps: unknown[]
): T {
  const cleanupRef = useRef<(() => void) | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;

    return () => {
      cleanupRef.current?.();
      cleanupRef.current = null;
    };
  }, [callback, ...deps]);

  return useCallback(
    (...args: Parameters<T>) => {
      // Run previous cleanup
      cleanupRef.current?.();

      // Execute callback and store cleanup
      const cleanup = callbackRef.current(...args);
      if (typeof cleanup === 'function') {
        cleanupRef.current = cleanup;
      }

      return cleanup;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps]
  ) as T;
}

// ============================================================================
// RAF Callbacks
// ============================================================================

/**
 * Create a callback wrapped in requestAnimationFrame
 *
 * The callback will be executed during the next animation frame.
 */
export function useRafCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[] = []
): T & { cancel: () => void; pending: () => boolean } {
  const callbackRef = useRef(callback);
  const rafIdRef = useRef<number | null>(null);
  const argsRef = useRef<Parameters<T> | null>(null);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [callback, ...deps]);

  return useMemo(
    () =>
      ((...args: Parameters<T>) => {
        argsRef.current = args;

        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
        }

        return new Promise<ReturnType<T>>((resolve) => {
          rafIdRef.current = requestAnimationFrame(() => {
            const result = callbackRef.current(...(argsRef.current as Parameters<T>));
            rafIdRef.current = null;
            resolve(result as ReturnType<T>);
          });
        }) as unknown as ReturnType<T>;
      }) as T & { cancel: () => void; pending: () => boolean },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps]
  );
}

// ============================================================================
// Conditional Callbacks
// ============================================================================

/**
 * Create a callback that only executes when a condition is met
 */
export function useConditionalCallback<T extends (...args: unknown[]) => unknown>(
  callback: T,
  condition: () => boolean,
  deps: unknown[]
): T {
  const callbackRef = useRef(callback);
  const conditionRef = useRef(condition);

  useEffect(() => {
    callbackRef.current = callback;
    conditionRef.current = condition;
  }, [callback, condition, ...deps]);

  return useCallback(
    (...args: Parameters<T>) => {
      if (conditionRef.current()) {
        return callbackRef.current(...args);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [...deps]
  ) as T;
}

/**
 * Create a callback that switches between two implementations
 */
export function useSwitchCallback<T extends (...args: unknown[]) => unknown>(
  trueCallback: T,
  falseCallback: T,
  condition: boolean,
  deps: unknown[]
): T {
  return useConditionalCallback(
    (callback => (condition ? trueCallback : falseCallback).apply(null, [callback] as unknown as Parameters<T>)) as T,
    () => true,
    [condition, trueCallback, falseCallback, ...deps]
  ) as T;
}

export default useMemoizedCallback;
