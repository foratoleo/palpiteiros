/**
 * Function Memoization Utilities
 *
 * Pure function memoization with cache management,
 * LRU eviction, and multi-argument support.
 *
 * @module memoization/memoize-fn
 */

/**
 * Cache entry
 */
interface CacheEntry<V> {
  value: V;
  timestamp: number;
  hits: number;
}

/**
 * Memoization options
 */
export interface MemoizeOptions {
  /** Maximum cache size */
  maxSize?: number;
  /** Time-to-live in milliseconds */
  ttl?: number;
  /** Custom cache key generator */
  keyGenerator?: (...args: unknown[]) => string;
  /** Enable debug logging */
  debug?: boolean;
  /** Serialize complex arguments */
  serializeArgs?: boolean;
}

/**
 * Memoized function with cache control
 */
export interface MemoizedFunction<F extends (...args: unknown[]) => unknown> {
  (...args: Parameters<F>): ReturnType<F>;
  /** Clear the cache */
  clear: () => void;
  /** Get cache statistics */
  getStats: () => MemoizeStats;
  /** Delete a specific cache entry */
  delete: (...args: Parameters<F>) => boolean;
  /** Check if arguments are cached */
  has: (...args: Parameters<F>) => boolean;
}

/**
 * Cache statistics
 */
export interface MemoizeStats {
  size: number;
  hits: number;
  misses: number;
  hitRate: number;
}

// ============================================================================
// LRU Cache Implementation
// ============================================================================

class LRUCache<K, V> {
  private cache = new Map<K, CacheEntry<V>>();
  private maxSize: number;
  private ttl: number;
  private stats: MemoizeStats = {
    size: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
  };

  constructor(maxSize: number, ttl: number) {
    this.maxSize = maxSize;
    this.ttl = ttl;
  }

  get(key: K): V | undefined {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return undefined;
    }

    // Update access order (LRU)
    this.cache.delete(key);
    this.cache.set(key, entry);

    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    return entry.value;
  }

  set(key: K, value: V): void {
    // Evict oldest if at capacity
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now(),
      hits: 0,
    });

    this.stats.size = this.cache.size;
  }

  delete(key: K): boolean {
    const deleted = this.cache.delete(key);
    this.stats.size = this.cache.size;
    return deleted;
  }

  has(key: K): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.size = this.cache.size;
      return false;
    }

    return true;
  }

  clear(): void {
    this.cache.clear();
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
    };
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  getStats(): MemoizeStats {
    return { ...this.stats };
  }
}

// ============================================================================
// Default Key Generator
// ============================================================================

/**
 * Default key generator - serializes arguments
 */
export function defaultKeyGenerator(args: unknown[]): string {
  return args.map((arg, index) => {
    if (arg === null) return `null_${index}`;
    if (arg === undefined) return `undefined_${index}`;
    if (typeof arg === 'function') return `function_${arg.name || 'anonymous'}_${index}`;
    if (typeof arg === 'symbol') return `symbol_${arg.description}_${index}`;
    if (typeof arg === 'object') {
      try {
        return JSON.stringify(arg);
      } catch {
        return `object_${index}`;
      }
    }
    return `${typeof arg}_${String(arg)}_${index}`;
  }).join('|');
}

// ============================================================================
// Memoize Function
// ============================================================================

/**
 * Memoize a function with caching
 *
 * @param fn - Function to memoize
 * @param options - Memoization options
 * @returns Memoized function with cache control methods
 */
export function memoize<F extends (...args: unknown[]) => unknown>(
  fn: F,
  options: MemoizeOptions = {}
): MemoizedFunction<F> {
  const {
    maxSize = 100,
    ttl = 5 * 60 * 1000, // 5 minutes
    keyGenerator = defaultKeyGenerator,
    debug = false,
  } = options;

  const cache = new LRUCache<string, ReturnType<F>>(maxSize, ttl);

  const memoizedFn = function (this: unknown, ...args: Parameters<F>): ReturnType<F> {
    const key = (keyGenerator as any)(...args);

    // Check cache
    const cached = cache.get(key);
    if (cached !== undefined) {
      if (debug) {
        console.log(`[Memoize] Cache hit for key: ${key}`);
      }
      return cached;
    }

    if (debug) {
      console.log(`[Memoize] Cache miss for key: ${key}`);
    }

    // Compute and cache
    const result = fn.apply(this, args) as ReturnType<F>;
    cache.set(key, result);

    return result;
  } as MemoizedFunction<F>;

  // Attach cache control methods
  memoizedFn.clear = () => cache.clear();
  memoizedFn.getStats = () => cache.getStats();
  memoizedFn.delete = (...args: Parameters<F>) => cache.delete((keyGenerator as any)(...args));
  memoizedFn.has = (...args: Parameters<F>) => cache.has((keyGenerator as any)(...args));

  return memoizedFn;
}

// ============================================================================
// Specialized Memoizers
// ============================================================================

/**
 * Memoize an async function
 *
 * Handles promises and caches the resolved value.
 */
export function memoizeAsync<F extends (...args: unknown[]) => Promise<unknown>>(
  fn: F,
  options: MemoizeOptions = {}
): MemoizedFunction<F> {
  const pendingPromises = new Map<string, Promise<unknown>>();

  const memoizedFn = memoize(
    function (this: unknown, ...args: any[]): Promise<unknown> {
      const key = options.keyGenerator
        ? (options.keyGenerator as any)(...args)
        : defaultKeyGenerator(args);

      // Check if already pending
      const pending = pendingPromises.get(key);
      if (pending) {
        return pending;
      }

      // Create new promise
      const promise = Promise.resolve(fn.apply(this, args))
        .then(result => {
          pendingPromises.delete(key);
          return result;
        })
        .catch(error => {
          pendingPromises.delete(key);
          throw error;
        });

      pendingPromises.set(key, promise);
      return promise;
    },
    { ...(options as any), keyGenerator: options.keyGenerator ? options.keyGenerator : (defaultKeyGenerator as any) }
  ) as MemoizedFunction<F>;

  // Override clear to also clear pending promises
  const originalClear = memoizedFn.clear;
  memoizedFn.clear = () => {
    pendingPromises.clear();
    originalClear();
  };

  return memoizedFn;
}

/**
 * Memoize a function with a single argument
 *
 * Optimized for single-argument functions (simpler cache key).
 */
export function memoizeOne<F extends (arg: unknown) => unknown>(
  fn: F,
  options: Omit<MemoizeOptions, 'keyGenerator'> = {}
): MemoizedFunction<F> {
  return memoize(fn, {
    ...options,
    keyGenerator: (arg) => {
      if (arg === null) return 'null';
      if (arg === undefined) return 'undefined';
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    },
  });
}

/**
 * Memoize a function with multiple arguments using deep comparison
 *
 * More robust than default serialization but slower.
 */
export function memoizeDeep<F extends (...args: unknown[]) => unknown>(
  fn: F,
  options: Omit<MemoizeOptions, 'keyGenerator'> = {}
): MemoizedFunction<F> {
  return memoize(fn, {
    ...options,
    keyGenerator: (...args) => {
      try {
        return JSON.stringify(args, (_, value) => {
          if (typeof value === 'function') {
            return `function:${value.name || 'anonymous'}`;
          }
          if (value instanceof Error) {
            return `error:${value.message}`;
          }
          return value;
        });
      } catch {
        return args.map((_, i) => `arg_${i}`).join('|');
      }
    },
  });
}

// ============================================================================
// Comparative Memoizers
// ============================================================================

/**
 * Memoize with custom equality check
 *
 * Uses a custom function to compare arguments instead of serialization.
 */
export function memoizeWith<F extends (...args: unknown[]) => unknown>(
  fn: F,
  areEqual: (prevArgs: Parameters<F>, nextArgs: Parameters<F>) => boolean,
  options: Pick<MemoizeOptions, 'maxSize' | 'debug'> = {}
): MemoizedFunction<F> {
  let lastArgs: Parameters<F> | null = null;
  let lastResult: ReturnType<F> | undefined;

  const maxSize = options.maxSize ?? 1; // Only cache last result by default

  const memoizedFn = function (this: unknown, ...args: Parameters<F>): ReturnType<F> {
    if (lastArgs && areEqual(lastArgs, args)) {
      if (options.debug) {
        console.log('[MemoizeWith] Cache hit');
      }
      return lastResult as ReturnType<F>;
    }

    if (options.debug) {
      console.log('[MemoizeWith] Cache miss');
    }

    lastArgs = args;
    lastResult = fn.apply(this, args) as ReturnType<F>;
    return lastResult;
  } as MemoizedFunction<F>;

  memoizedFn.clear = () => {
    lastArgs = null;
    lastResult = undefined;
  };

  memoizedFn.getStats = () => ({
    size: lastArgs !== null ? 1 : 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
  });

  memoizedFn.delete = () => {
    lastArgs = null;
    lastResult = undefined;
    return true;
  };

  memoizedFn.has = (...args: Parameters<F>) => {
    return lastArgs !== null && areEqual(lastArgs, args);
  };

  return memoizedFn;
}

/**
 * Memoize with shallow equality check
 *
 * Best for functions with object/array arguments where you want
 * to compare by reference and shallow property equality.
 */
export function memoizeShallow<F extends (...args: unknown[]) => unknown>(
  fn: F,
  options: Pick<MemoizeOptions, 'maxSize' | 'debug'> = {}
): MemoizedFunction<F> {
  return memoizeWith(
    fn,
    (prevArgs, nextArgs) => {
      if (prevArgs.length !== nextArgs.length) return false;

      for (let i = 0; i < prevArgs.length; i++) {
        const prev = prevArgs[i];
        const next = nextArgs[i];

        if (prev === next) continue;

        // Shallow comparison for objects
        if (
          typeof prev === 'object' &&
          typeof next === 'object' &&
          prev !== null &&
          next !== null
        ) {
          const prevKeys = Object.keys(prev);
          const nextKeys = Object.keys(next);

          if (prevKeys.length !== nextKeys.length) return false;

          for (const key of prevKeys) {
            if (!Object.prototype.hasOwnProperty.call(next, key)) return false;
            if ((prev as Record<string, unknown>)[key] !== (next as Record<string, unknown>)[key]) {
              return false;
            }
          }
        } else {
          return false;
        }
      }

      return true;
    },
    options
  );
}

// ============================================================================
// Cached Decorator
// ============================================================================

/**
 * Decorator for memoizing class methods
 *
 * @example
 * ```ts
 * class MyClass {
 *   @cached
 *   expensiveMethod(x: number, y: number): number {
 *     return x * y + Math.sqrt(x);
 *   }
 * }
 * ```
 */
export function cached(
  options: MemoizeOptions = {}
): MethodDecorator {
  return function (
    _target: unknown,
    _propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;
    const memoized = memoize(originalMethod, options);

    descriptor.value = function (this: unknown, ...args: unknown[]) {
      return memoized.apply(this, args);
    };

    // Attach cache control to the method
    (descriptor.value as MemoizedFunction<typeof originalMethod>).clear = () => memoized.clear();
    (descriptor.value as MemoizedFunction<typeof originalMethod>).getStats = () =>
      memoized.getStats();
    (descriptor.value as MemoizedFunction<typeof originalMethod>).delete = (...args: unknown[]) =>
      memoized.delete(...(args as Parameters<typeof originalMethod>));
    (descriptor.value as MemoizedFunction<typeof originalMethod>).has = (...args: unknown[]) =>
      memoized.has(...(args as Parameters<typeof originalMethod>));

    return descriptor;
  };
}

/**
 * Decorator for caching with TTL
 *
 * @example
 * ```ts
 * class MyClass {
 *   @cachedTTL(60000) // 1 minute TTL
 *   fetchData(id: string): Promise<Data> {
 *     return fetch(`/api/data/${id}`).then(r => r.json());
 *   }
 * }
 * ```
 */
export function cachedTTL(ttl: number): MethodDecorator {
  return cached({ ttl });
}

/**
 * Decorator for caching with max size
 *
 * @example
 * ```ts
 * class MyClass {
 *   @cachedMaxSize(50)
 *   compute(key: string): Result {
 *     // Expensive computation
 *   }
 * }
 * ```
 */
export function cachedMaxSize(maxSize: number): MethodDecorator {
  return cached({ maxSize });
}

// ============================================================================
// Computed/Memoized Values
// ============================================================================

/**
 * Create a memoized value from a getter function
 *
 * The value is computed once and cached until explicitly invalidated.
 */
export interface MemoizedValue<T> {
  /** Get the current value */
  get: () => T;
  /** Invalidate the cache */
  invalidate: () => void;
  /** Update the value manually */
  set: (value: T) => void;
  /** Check if value is cached */
  isCached: () => boolean;
}

export function memoizedValue<T>(
  getter: () => T,
  options: Pick<MemoizeOptions, 'debug'> = {}
): MemoizedValue<T> {
  let cached: T | undefined;
  let hasCached = false;

  return {
    get: (): T => {
      if (!hasCached) {
        cached = getter();
        hasCached = true;
        if (options.debug) {
          console.log('[MemoizedValue] Computed new value');
        }
      } else if (options.debug) {
        console.log('[MemoizedValue] Returning cached value');
      }
      return cached as T;
    },
    invalidate: (): void => {
      hasCached = false;
      cached = undefined;
      if (options.debug) {
        console.log('[MemoizedValue] Cache invalidated');
      }
    },
    set: (value: T): void => {
      cached = value;
      hasCached = true;
      if (options.debug) {
        console.log('[MemoizedValue] Value set manually');
      }
    },
    isCached: (): boolean => hasCached,
  };
}

// ============================================================================
// Multi-Argument Memoization
// ============================================================================

/**
 * Create a memoizer that respects argument order
 *
 * Useful when argument order matters for your use case.
 */
export function createMemoizer<F extends (...args: unknown[]) => unknown>(
  fn: F,
  options: MemoizeOptions = {}
): MemoizedFunction<F> {
  return memoize(fn, options);
}

/**
 * Create a memoizer that ignores argument order
 *
 * Useful when arguments are commutative (e.g., add(a, b) === add(b, a)).
 */
export function createCommutativeMemoizer<F extends (...args: unknown[]) => unknown>(
  fn: F,
  options: Omit<MemoizeOptions, 'keyGenerator'> = {}
): MemoizedFunction<F> {
  return memoize(fn, {
    ...options,
    keyGenerator: (...args) => {
      // Sort by serialization for commutative behavior
      const serialized = args.map(arg => {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      });
      serialized.sort();
      return serialized.join('|');
    },
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Clear all memoization caches (globally tracked caches)
 */
const globalCaches: Set<() => void> = new Set();

/**
 * Register a cache for global clearing
 */
export function registerCache(clearFn: () => void): () => void {
  globalCaches.add(clearFn);
  return () => globalCaches.delete(clearFn);
}

/**
 * Clear all registered caches
 */
export function clearAllCaches(): void {
  for (const clear of globalCaches) {
    clear();
  }
}

/**
 * Get the number of registered caches
 */
export function getRegisteredCacheCount(): number {
  return globalCaches.size;
}

// Export all
export default memoize;
