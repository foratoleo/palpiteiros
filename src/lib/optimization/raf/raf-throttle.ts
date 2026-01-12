/**
 * RequestAnimationFrame Throttle
 *
 * Throttle functions using requestAnimationFrame for optimal performance.
 * Unlike setTimeout-based throttling, RAF throttle syncs with the browser's
 * paint cycle for smooth 60fps animations.
 *
 * @module raf-throttle
 */

import { getRafScheduler, RafPriority } from './raf-scheduler';

/**
 * Throttle options
 */
export interface ThrottleOptions {
  /** Priority level for the scheduled callback */
  priority?: RafPriority;
  /** Whether to invoke on leading edge */
  leading?: boolean;
  /** Whether to invoke on trailing edge */
  trailing?: boolean;
  /** Maximum time to wait before invoking (ms) */
  maxWait?: number;
}

/**
 * Throttled function with cancel method
 */
export interface ThrottledFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): ReturnType<T> | undefined;
  cancel(): void;
  flush(): ReturnType<T> | undefined;
  pending(): boolean;
}

// ============================================================================
// Throttle Implementation
// ============================================================================

class ThrottleManager {
  private throttled = new Map<Function, {
    lastCall: number;
    lastArgs: unknown[];
    rafId: string | null;
    timeoutId: number | null;
    pendingResult: unknown;
  }>();

  /**
   * Create a throttled function
   */
  create<T extends (...args: unknown[]) => unknown>(
    func: T,
    options: ThrottleOptions = {}
  ): ThrottledFunction<T> {
    const {
      priority = RafPriority.NORMAL,
      leading = true,
      trailing = true,
      maxWait,
    } = options;

    let lastCallTime = 0;
    let lastArgs: Parameters<T> | null = null;
    let rafId: string | null = null;
    let timeoutId: number | null = null;
    let pendingResult: ReturnType<T> | undefined;
    let pendingInvoke = false;

    const scheduler = getRafScheduler();

    const invokeFunc = (time: number): ReturnType<T> | undefined => {
      const args = lastArgs;
      lastArgs = null;

      if (args) {
        pendingInvoke = false;
        return func(...args) as ReturnType<T>;
      }
      return undefined;
    };

    const startRaf = (): void => {
      if (rafId !== null) return;

      rafId = scheduler.schedule(
        () => {
          rafId = null;
          const now = performance.now();

          if (now - lastCallTime >= (maxWait ?? 0)) {
            invokeFunc(now);
          } else if (trailing && pendingInvoke) {
            // Continue waiting if trailing is enabled
            startRaf();
          }
        },
        priority
      );
    };

    const throttledFn = function (this: unknown, ...args: Parameters<T>): ReturnType<T> | undefined {
      const now = performance.now();
      const timeSinceLastCall = now - lastCallTime;

      lastArgs = args;
      pendingInvoke = true;

      // Leading edge invocation
      if (leading && timeSinceLastCall >= 16) {
        lastCallTime = now;
        const result = func.apply(this, args) as ReturnType<T>;
        pendingInvoke = false;
        return result;
      }

      // Schedule trailing invocation
      if (trailing && rafId === null) {
        startRaf();
      }

      // Max wait timeout
      if (maxWait && timeoutId === null) {
        timeoutId = window.setTimeout(() => {
          lastCallTime = performance.now();
          invokeFunc(performance.now());
          timeoutId = null;
        }, maxWait);
      }

      return pendingResult;
    } as ThrottledFunction<T>;

    // Add methods to the function
    throttledFn.cancel = (): void => {
      if (rafId !== null) {
        scheduler.cancel(rafId);
        rafId = null;
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastArgs = null;
      pendingInvoke = false;
    };

    throttledFn.flush = (): ReturnType<T> | undefined => {
      throttledFn.cancel();
      return invokeFunc(performance.now());
    };

    throttledFn.pending = (): boolean => {
      return pendingInvoke || rafId !== null;
    };

    return throttledFn;
  }

  /**
   * Clear all throttled functions
   */
  clear(): void {
    for (const { rafId, timeoutId } of this.throttled.values()) {
      if (rafId !== null) {
        getRafScheduler().cancel(rafId);
      }
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    }
    this.throttled.clear();
  }
}

const throttleManager = new ThrottleManager();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Throttle a function using requestAnimationFrame
 *
 * @param func - Function to throttle
 * @param options - Throttle options
 * @returns Throttled function
 */
export function rafThrottle<T extends (...args: unknown[]) => unknown>(
  func: T,
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  return throttleManager.create(func, options);
}

/**
 * Throttle a function with a specific interval
 *
 * Unlike standard throttle, this ensures at least one execution per interval
 *
 * @param func - Function to throttle
 * @param interval - Minimum time between executions (ms)
 * @param options - Additional throttle options
 */
export function rafThrottleInterval<T extends (...args: unknown[]) => unknown>(
  func: T,
  interval: number,
  options: Omit<ThrottleOptions, 'maxWait'> = {}
): ThrottledFunction<T> {
  return rafThrottle(func, { ...options, maxWait: interval });
}

/**
 * Throttle for scroll handlers
 * Optimized for high-frequency scroll events
 */
export function rafThrottleScroll<T extends (...args: unknown[]) => unknown>(
  func: T
): ThrottledFunction<T> {
  return rafThrottle(func, {
    priority: RafPriority.HIGH,
    leading: true,
    trailing: true,
  });
}

/**
 * Throttle for resize handlers
 * Optimized for resize events
 */
export function rafThrottleResize<T extends (...args: unknown[]) => unknown>(
  func: T
): ThrottledFunction<T> {
  return rafThrottle(func, {
    priority: RafPriority.NORMAL,
    leading: false,
    trailing: true,
    maxWait: 100,
  });
}

/**
 * Throttle for mouse move handlers
 * Optimized for high-frequency mouse events
 */
export function rafThrottleMouse<T extends (...args: unknown[]) => unknown>(
  func: T
): ThrottledFunction<T> {
  return rafThrottle(func, {
    priority: RafPriority.HIGH,
    leading: true,
    trailing: true,
  });
}

// ============================================================================
// React Hooks
// ============================================================================

import { useEffect, useRef, useCallback } from 'react';

/**
 * Throttle a callback with RAF
 *
 * @param callback - Function to throttle
 * @param deps - Dependencies (when changed, throttle is reset)
 * @param options - Throttle options
 */
export function useRafThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[] = [],
  options: ThrottleOptions = {}
): ThrottledFunction<T> {
  const throttledRef = useRef<ThrottledFunction<T> | null>(null);

  // Create new throttled function when deps change
  useEffect(() => {
    throttledRef.current = rafThrottle(callback, options);

    return () => {
      throttledRef.current?.cancel();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, options.priority, options.leading, options.trailing, options.maxWait]);

  // Update callback ref without changing throttle
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    function (this: unknown, ...args: Parameters<T>) {
      return throttledRef.current?.apply(this, args);
    },
    []
  ) as unknown as ThrottledFunction<T>;
}

/**
 * Throttle a scroll event callback
 */
export function useScrollThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[] = []
): ThrottledFunction<T> {
  return useRafThrottle(callback, deps, {
    priority: RafPriority.HIGH,
    leading: true,
    trailing: true,
  });
}

/**
 * Throttle a resize event callback
 */
export function useResizeThrottle<T extends (...args: unknown[]) => unknown>(
  callback: T,
  deps: unknown[] = []
): ThrottledFunction<T> {
  return useRafThrottle(callback, deps, {
    priority: RafPriority.NORMAL,
    leading: false,
    trailing: true,
    maxWait: 100,
  });
}

// ============================================================================
// Event Listener Hook
// ============================================================================

/**
 * Add an event listener with RAF throttling
 *
 * @param target - Event target (window, document, or element)
 * @param event - Event name
 * @param callback - Event handler
 * @param options - Throttle and event listener options
 */
export interface ThrottledEventListenerOptions {
  /** Throttle options */
  throttle?: ThrottleOptions;
  /** Event listener options */
  listener?: AddEventListenerOptions;
  /** Whether the listener is active */
  enabled?: boolean;
}

export function useThrottledEventListener<T extends Event>(
  target: EventTarget | null,
  event: string,
  callback: (event: T) => void,
  options: ThrottledEventListenerOptions = {}
): void {
  const { throttle = {}, listener, enabled = true } = options;

  const throttledCallbackRef = useRef<((event: T) => void) & {
    cancel?: () => void;
  } | null>(null);

  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (!target || !enabled) return;

    throttledCallbackRef.current = rafThrottle(
      ((e: T) => callbackRef.current(e)) as (...args: unknown[]) => unknown,
      throttle
    ) as ((event: T) => void) & { cancel?: () => void };

    target.addEventListener(event, throttledCallbackRef.current as EventListener, listener);

    return () => {
      throttledCallbackRef.current?.cancel?.();
      target.removeEventListener(event, throttledCallbackRef.current as EventListener, listener);
    };
  }, [target, event, enabled, listener, throttle]);
}

// ============================================================================
// Debounce Using RAF
// ============================================================================

/**
 * Debounce options
 */
export interface DebounceOptions {
  /** Priority level */
  priority?: RafPriority;
  /** Maximum time to wait (ms) */
  maxWait?: number;
}

/**
 * Debounced function with cancel method
 */
export interface DebouncedFunction<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel(): void;
  flush(): void;
  pending(): boolean;
}

/**
 * Create a debounced function using RAF
 *
 * Unlike standard debounce, this waits for a pause in events using RAF timing
 */
export function rafDebounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
  options: DebounceOptions = {}
): DebouncedFunction<T> {
  const { priority = RafPriority.NORMAL, maxWait } = options;

  const scheduler = getRafScheduler();
  let lastCallTime = 0;
  let lastArgs: Parameters<T> | null = null;
  let rafId: string | null = null;
  let timeoutId: number | null = null;
  let maxTimeoutId: number | null = null;

  const invokeFunc = (): void => {
    if (lastArgs) {
      func(...lastArgs);
      lastArgs = null;
    }
  };

  const debouncedFn = function (this: unknown, ...args: Parameters<T>): void {
    const now = performance.now();

    lastArgs = args;
    lastCallTime = now;

    // Clear existing scheduled calls
    if (rafId !== null) {
      scheduler.cancel(rafId);
      rafId = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Schedule new invocation
    timeoutId = window.setTimeout(() => {
      invokeFunc();
      timeoutId = null;
    }, wait);

    // RAF-based invocation for smoother updates
    rafId = scheduler.scheduleDelayed(
      invokeFunc,
      wait,
      priority
    );

    // Max wait handling
    if (maxWait && maxTimeoutId === null) {
      maxTimeoutId = window.setTimeout(() => {
        invokeFunc();
        maxTimeoutId = null;
      }, maxWait);
    }
  } as DebouncedFunction<T>;

  debouncedFn.cancel = (): void => {
    if (rafId !== null) {
      scheduler.cancel(rafId);
      rafId = null;
    }
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    if (maxTimeoutId !== null) {
      clearTimeout(maxTimeoutId);
      maxTimeoutId = null;
    }
    lastArgs = null;
  };

  debouncedFn.flush = (): void => {
    debouncedFn.cancel();
    invokeFunc();
  };

  debouncedFn.pending = (): boolean => {
    return lastArgs !== null;
  };

  return debouncedFn;
}

export default rafThrottle;
