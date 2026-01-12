/**
 * Enhanced useMemo with Cache Key Support
 *
 * Advanced memoization hook with cache key management,
 * LRU eviction, and memory usage tracking.
 *
 * @module memoization/use-memoized
 */

import { useRef, useEffect, useCallback, useMemo, useState, memo, ComponentType, type MemoExoticComponent } from 'react';

/**
 * Cache entry metadata
 */
interface CacheEntry<T> {
  /** Cached value */
  value: T;
  /** Cache key for this entry */
  key: string;
  /** Timestamp when cached */
  timestamp: number;
  /** Number of times this was accessed */
  hits: number;
  /** Size estimate in bytes */
  size?: number;
}

/**
 * Memoization options
 */
export interface MemoizedOptions {
  /** Maximum number of cache entries (default: 50) */
  maxCacheSize?: number;
  /** Time-to-live for cache entries (ms) */
  ttl?: number;
  /** Enable debug logging */
  debug?: boolean;
  /** Custom key serializer */
  serializeKey?: (key: unknown[]) => string;
  /** Custom size estimator */
  estimateSize?: (value: unknown) => number;
  /** Cleanup interval (ms) */
  cleanupInterval?: number;
}

/**
 * Cache statistics
 */
export interface CacheStats {
  /** Current cache size */
  size: number;
  /** Total cache hits */
  hits: number;
  /** Total cache misses */
  misses: number;
  /** Hit rate (0-1) */
  hitRate: number;
  /** Evicted entries */
  evictions: number;
  /** Estimated memory usage (bytes) */
  memoryUsage: number;
}

// ============================================================================
// Global Cache Manager
// ============================================================================

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats: CacheStats = {
    size: 0,
    hits: 0,
    misses: 0,
    hitRate: 0,
    evictions: 0,
    memoryUsage: 0,
  };
  private accessOrder: string[] = [];
  private options: Required<MemoizedOptions>;
  private cleanupTimer: number | null = null;

  constructor(options: MemoizedOptions = {}) {
    this.options = {
      maxCacheSize: options.maxCacheSize ?? 50,
      ttl: options.ttl ?? 5 * 60 * 1000, // 5 minutes
      debug: options.debug ?? false,
      serializeKey: options.serializeKey ?? this.defaultSerializeKey,
      estimateSize: options.estimateSize ?? this.defaultEstimateSize,
      cleanupInterval: options.cleanupInterval ?? 60 * 1000, // 1 minute
    };

    this.startCleanup();
  }

  private defaultSerializeKey(key: unknown[]): string {
    return JSON.stringify(key, (_key, value) => {
      if (typeof value === 'function') {
        return `function:${value.name || 'anonymous'}`;
      }
      if (value instanceof Set) {
        return `set:${Array.from(value).join(',')}`;
      }
      if (value instanceof Map) {
        return `map:${Array.from(value.entries()).flat().join(',')}`;
      }
      if (typeof value === 'object' && value !== null) {
        try {
          return JSON.stringify(value);
        } catch {
          return '[object]';
        }
      }
      return value;
    });
  }

  private defaultEstimateSize(value: unknown): number {
    if (value === null || value === undefined) return 0;
    const str = JSON.stringify(value);
    return new Blob([str]).size;
  }

  /**
   * Get a value from cache
   */
  get<T>(key: unknown[]): T | undefined {
    const cacheKey = this.options.serializeKey(key);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      if (this.options.debug) {
        console.log(`[Memoized] Cache miss: ${cacheKey}`);
      }
      return undefined;
    }

    // Check TTL
    const now = Date.now();
    if (now - entry.timestamp > this.options.ttl) {
      this.evict(cacheKey);
      this.stats.misses++;
      this.updateHitRate();
      if (this.options.debug) {
        console.log(`[Memoized] Cache expired: ${cacheKey}`);
      }
      return undefined;
    }

    // Update access order (LRU)
    this.accessOrder = this.accessOrder.filter(k => k !== cacheKey);
    this.accessOrder.push(cacheKey);

    entry.hits++;
    this.stats.hits++;
    this.updateHitRate();

    if (this.options.debug) {
      console.log(`[Memoized] Cache hit: ${cacheKey} (hits: ${entry.hits})`);
    }

    return entry.value as T;
  }

  /**
   * Set a value in cache
   */
  set<T>(key: unknown[], value: T): void {
    const cacheKey = this.options.serializeKey(key);
    const now = Date.now();
    const size = this.options.estimateSize(value);

    // Check if we need to evict
    while (this.cache.size >= this.options.maxCacheSize && !this.cache.has(cacheKey)) {
      const lruKey = this.accessOrder.shift();
      if (lruKey) {
        this.evict(lruKey);
      }
    }

    // Update memory usage
    const existing = this.cache.get(cacheKey);
    if (existing) {
      this.stats.memoryUsage -= existing.size ?? 0;
    }
    this.stats.memoryUsage += size;

    // Create cache entry
    const entry: CacheEntry<T> = {
      value,
      key: cacheKey,
      timestamp: now,
      hits: 0,
      size,
    };

    this.cache.set(cacheKey, entry as CacheEntry<unknown>);
    this.stats.size = this.cache.size;

    // Update access order
    if (!this.accessOrder.includes(cacheKey)) {
      this.accessOrder.push(cacheKey);
    }

    if (this.options.debug) {
      console.log(`[Memoized] Cache set: ${cacheKey} (size: ${this.cache.size})`);
    }
  }

  /**
   * Evict a specific entry
   */
  private evict(cacheKey: string): void {
    const entry = this.cache.get(cacheKey);
    if (entry) {
      this.stats.memoryUsage -= entry.size ?? 0;
      this.cache.delete(cacheKey);
      this.stats.evictions++;
      this.stats.size = this.cache.size;
      if (this.options.debug) {
        console.log(`[Memoized] Cache evict: ${cacheKey}`);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.stats = {
      size: 0,
      hits: 0,
      misses: 0,
      hitRate: 0,
      evictions: 0,
      memoryUsage: 0,
    };
  }

  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Start periodic cleanup
   */
  private startCleanup(): void {
    if (this.cleanupTimer !== null) return;

    this.cleanupTimer = window.setInterval(() => {
      const now = Date.now();
      const toEvict: string[] = [];

      for (const [key, entry] of this.cache) {
        if (now - entry.timestamp > this.options.ttl) {
          toEvict.push(key);
        }
      }

      for (const key of toEvict) {
        this.evict(key);
      }

      if (this.options.debug && toEvict.length > 0) {
        console.log(`[Memoized] Cleanup: evicted ${toEvict.length} expired entries`);
      }
    }, this.options.cleanupInterval);
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    if (this.cleanupTimer !== null) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Global cache instance
let globalCache: CacheManager | null = null;

function getGlobalCache(options?: MemoizedOptions): CacheManager {
  if (!globalCache) {
    globalCache = new CacheManager(options);
  }
  return globalCache;
}

// ============================================================================
// Enhanced useMemo Hook
// ============================================================================

/**
 * Enhanced useMemo with caching and cache key support
 *
 * @param factory - Function to compute the value
 * @param deps - Dependencies (changes trigger recomputation)
 * @param options - Memoization options
 * @returns Memoized value
 */
export interface UseMemoizedOptions extends MemoizedOptions {
  /** Use global cache instead of component-local */
  useGlobalCache?: boolean;
  /** Custom cache key (overrides deps serialization) */
  cacheKey?: string;
}

export function useMemoized<T>(
  factory: () => T,
  deps: unknown[],
  options: UseMemoizedOptions = {}
): T {
  const {
    useGlobalCache = false,
    cacheKey,
    ...memoOptions
  } = options;

  // Create cache key
  const key: unknown[] = cacheKey !== undefined ? [cacheKey] : (useGlobalCache ? ['global', ...deps] : deps);

  // Get cache
  const cache = useGlobalCache ? getGlobalCache(memoOptions) : useMemo(() => new CacheManager(memoOptions), []);

  // Try to get from cache
  const cached = cache.get<T>(key);
  if (cached !== undefined) {
    return cached;
  }

  // Compute and cache
  const value = factory();
  cache.set(key, value);

  return value;
}

// ============================================================================
// Specialized Memoized Hooks
// ============================================================================

/**
 * Memoize a value with a string key
 *
 * Useful for memoizing based on data IDs rather than object references.
 */
export function useMemoizedByKey<T>(
  factory: () => T,
  key: string,
  options?: Omit<UseMemoizedOptions, 'cacheKey'>
): T {
  return useMemoized(factory, [key], { ...options, cacheKey: key, useGlobalCache: true });
}

/**
 * Memoize with time-based invalidation
 *
 * @param factory - Function to compute value
 * @param deps - Dependencies
 * @param ttl - Time-to-live in milliseconds
 */
export function useMemoizedWithTTL<T>(
  factory: () => T,
  deps: unknown[],
  ttl: number
): T {
  return useMemoized(factory, deps, { ttl, useGlobalCache: true });
}

/**
 * Memoize async operation result
 *
 * @param factory - Async function to execute
 * @param deps - Dependencies
 * @returns Object with value, loading, and error states
 */
export interface MemoizedAsyncResult<T> {
  value: T | undefined;
  loading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

export function useAsyncMemoized<T>(
  factory: () => Promise<T>,
  deps: unknown[],
  options: UseMemoizedOptions = {}
): MemoizedAsyncResult<T> {
  const cache = useMemo(() => new CacheManager(options), []);
  const key = ['async', ...deps];

  const [, forceUpdate] = useState(0);

  const resultRef = useRef<{
    value: T | undefined;
    loading: boolean;
    error: Error | undefined;
  }>({
    value: cache.get<T>(key),
    loading: false,
    error: undefined,
  });

  // Check cache first
  useEffect(() => {
    const cached = cache.get<T>(key);
    if (cached !== undefined) {
      resultRef.current = {
        value: cached,
        loading: false,
        error: undefined,
      };
      forceUpdate(prev => prev + 1);
      return;
    }

    // Not in cache, fetch
    resultRef.current = {
      value: undefined,
      loading: true,
      error: undefined,
    };
    forceUpdate(prev => prev + 1);

    factory()
      .then(value => {
        cache.set(key, value);
        resultRef.current = {
          value,
          loading: false,
          error: undefined,
        };
        forceUpdate(prev => prev + 1);
      })
      .catch(error => {
        resultRef.current = {
          value: undefined,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
        forceUpdate(prev => prev + 1);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const refetch = useCallback(() => {
    cache.clear(); // Clear cache for this key
    const cached = cache.get<T>(key);
    if (cached !== undefined) {
      resultRef.current = {
        value: cached,
        loading: false,
        error: undefined,
      };
      forceUpdate(prev => prev + 1);
      return;
    }

    resultRef.current = {
      value: undefined,
      loading: true,
      error: undefined,
    };
    forceUpdate(prev => prev + 1);

    factory()
      .then(value => {
        cache.set(key, value);
        resultRef.current = {
          value,
          loading: false,
          error: undefined,
        };
        forceUpdate(prev => prev + 1);
      })
      .catch(error => {
        resultRef.current = {
          value: undefined,
          loading: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
        forceUpdate(prev => prev + 1);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    ...resultRef.current,
    refetch,
  };
}

// ============================================================================
// Derived Value Memoization
// ============================================================================

/**
 * Memoize a derived/computed value from an object
 *
 * Optimized for deriving values from large objects where only
 * a small subset of data is used.
 */
export function useMemoizedDerive<T, U>(
  source: T,
  derive: (source: T) => U,
  deriveKey?: (source: T) => string,
  options?: Omit<UseMemoizedOptions, 'cacheKey'>
): U {
  const key = useMemo(() => {
    if (deriveKey) {
      return deriveKey(source);
    }
    // Try to get a unique identifier
    if (source && typeof source === 'object') {
      if ('id' in source) return `id:${String(source.id)}`;
      if ('key' in source) return `key:${String(source.key)}`;
      if ('slug' in source) return `slug:${String(source.slug)}`;
    }
    return JSON.stringify(source);
  }, [source, deriveKey]);

  return useMemoized(() => derive(source), [key], { ...options, cacheKey: key });
}

// ============================================================================
// Cache Statistics Hook
// ============================================================================

/**
 * Get global cache statistics
 */
export function useMemoizedStats(): CacheStats {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  return getGlobalCache().getStats();
}

/**
 * Clear the global cache
 */
export function clearMemoizedCache(): void {
  getGlobalCache()?.clear();
}

// ============================================================================
// React.memo Enhancement
// ============================================================================

/**
 * Enhanced memo with custom comparison and cache key support
 */
export interface MemoizedComponentOptions {
  /** Custom comparison function */
  areEqual?: (prevProps: unknown, nextProps: unknown) => boolean;
  /** Cache key for props comparison */
  propsKey?: (props: unknown) => string;
  /** Component name for debugging */
  name?: string;
}

export function memoized<P extends object>(
  Component: ComponentType<P>,
  options: MemoizedComponentOptions = {}
): MemoExoticComponent<ComponentType<P>> {
  const { areEqual, propsKey, name } = options;

  if (propsKey) {
    const enhancedAreEqual = (prevProps: P, nextProps: P): boolean => {
      const prevKey = propsKey(prevProps);
      const nextKey = propsKey(nextProps);
      return prevKey === nextKey;
    };
    return memo(Component, enhancedAreEqual);
  }

  if (areEqual) {
    return memo(Component, areEqual);
  }

  return memo(Component);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create a stable cache key from values
 */
export function createCacheKey(...values: unknown[]): string {
  return JSON.stringify(values, (_key, value) => {
    if (typeof value === 'function') {
      return `fn:${value.name || 'anonymous'}`;
    }
    if (value instanceof Error) {
      return `error:${value.message}`;
    }
    return value;
  });
}

/**
 * Estimate size of a value for cache tracking
 */
export function estimateSize(value: unknown): number {
  const cache = new CacheManager();
  return cache['defaultEstimateSize'](value);
}

export { CacheManager };
export default useMemoized;
