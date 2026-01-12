/**
 * Performance Optimization Hooks
 *
 * T17.2 & T17.5: Collection of hooks for optimizing React performance.
 *
 * Includes:
 * - Debounced callbacks
 * - Throttled callbacks
 * - Deferred values
 * - Idle callbacks
 * - Media queries
 *
 * @module hooks/use-performance
 */

'use client'

import * as React from 'react'

// ============================================================================
// TYPES
// ============================================================================

type CleanupFn = () => void

// ============================================================================
// USE DEFERRED VALUE
// ============================================================================>

/**
 * T17.2: Defers updating a value to the next React render.
 *
 * Useful for expensive calculations or UI updates that don't need
 * to be immediate. Similar to React.useDeferredValue but with
 * configurable timeout.
 *
 * @example
 * ```tsx
 * const expensiveValue = useDeferredValue(data, (d) => {
 *   return heavyComputation(d)
 * })
 * ```
 */
export function useDeferredValue<T>(
  value: T,
  compute?: (value: T) => T,
  timeoutMs: number = 100
): T {
  const [deferredValue, setDeferredValue] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      const nextValue = compute ? compute(value) : value
      setDeferredValue(nextValue)
    }, timeoutMs)

    return () => clearTimeout(timer)
  }, [value, compute, timeoutMs])

  return deferredValue
}

// ============================================================================
// USE DEBOUNCED CALLBACK
// ============================================================================>

/**
 * T17.2: Returns a debounced version of the callback.
 *
 * The callback will only be invoked after the specified delay
 * has elapsed since the last invocation. Useful for search inputs,
 * resize handlers, and other high-frequency events.
 *
 * @example
 * ```tsx
 * const debouncedSearch = useDebouncedCallback(
 *   (query) => search(query),
 *   300
 * )
 *
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = 300
): T {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()
  const callbackRef = React.useRef(callback)

  // Keep callback ref up to date
  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    },
    [delay]
  ) as T
}

/**
 * T17.2: Returns a debounced value.
 *
 * The value will only update after the specified delay has elapsed
 * since the last change.
 *
 * @example
 * ```tsx
 * const debouncedQuery = useDebouncedValue(searchQuery, 300)
 * React.useEffect(() => {
 *   if (debouncedQuery) {
 *     search(debouncedQuery)
 *   }
 * }, [debouncedQuery])
 * ```
 */
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// ============================================================================
// USE THROTTLED CALLBACK
// ============================================================================>

/**
 * T17.2: Returns a throttled version of the callback.
 *
 * The callback will only be invoked once per specified time period.
 * Useful for scroll handlers, mouse move events, etc.
 *
 * @example
 * ```tsx
 * const throttledScroll = useThrottledCallback(
 *   () => handleScroll(),
 *   100
 * )
 *
 * <div onScroll={throttledScroll} />
 * ```
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  limit: number = 100
): T {
  const limitRef = React.useRef(limit)
  const inThrottle = React.useRef(false)
  const callbackRef = React.useRef(callback)

  // Keep callback ref up to date
  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return React.useCallback(
    (...args: Parameters<T>) => {
      if (!inThrottle.current) {
        callbackRef.current(...args)
        inThrottle.current = true
        setTimeout(() => {
          inThrottle.current = false
        }, limitRef.current)
      }
    },
    [limit]
  ) as T
}

// ============================================================================
// USE THROTTLED VALUE
// ============================================================================>

/**
 * T17.2: Returns a throttled value.
 *
 * The value will only update once per specified time period.
 *
 * @example
 * ```tsx
 * const throttledScrollY = useThrottledValue(scrollY, 100)
 * ```
 */
export function useThrottledValue<T>(value: T, limit: number = 100): T {
  const [throttledValue, setThrottledValue] = React.useState(value)
  const lastUpdated = React.useRef<number>(Date.now())

  React.useEffect(() => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdated.current

    if (timeSinceLastUpdate >= limit) {
      setThrottledValue(value)
      lastUpdated.current = now
    } else {
      const timer = setTimeout(() => {
        setThrottledValue(value)
        lastUpdated.current = Date.now()
      }, limit - timeSinceLastUpdate)

      return () => clearTimeout(timer)
    }
  }, [value, limit])

  return throttledValue
}

// ============================================================================
// USE IDLE CALLBACK
// ============================================================================>

/**
 * T17.2: Runs a callback during browser idle periods.
 *
 * Useful for non-critical updates like analytics, logging, or
 * background computations.
 *
 * @example
 * ```tsx
 * useIdleCallback(() => {
 *   logPageView()
 * })
 * ```
 */
export function useIdleCallback(
  callback: () => void,
  deps: React.DependencyList = []
): void {
  const callbackRef = React.useRef(callback)

  // Keep callback ref up to date
  React.useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const id = requestIdleCallback(() => {
      callbackRef.current()
    })

    return () => cancelIdleCallback(id)
  }, deps)
}

// ============================================================================
// USE MEDIA QUERY
// ============================================================================>

/**
 * T17.2: Respond to media query changes.
 *
 * @example
 * ```tsx
 * const isMobile = useMediaQuery('(max-width: 768px)')
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
 * ```
 */
export function useMediaQuery(query: string, defaultValue: boolean = false): boolean {
  const [matches, setMatches] = React.useState(defaultValue)

  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}

// ============================================================================
// USE BREAKPOINT
// ============================================================================>

/**
 * T17.2: Shorthand for common breakpoint queries.
 *
 * @example
 * ```tsx
 * const isMobile = useBreakpoint('sm')
 * const isTablet = useBreakpoint('md')
 * const isDesktop = useBreakpoint('lg')
 * ```
 */
export function useBreakpoint(breakpoint: 'sm' | 'md' | 'lg' | 'xl' | '2xl'): boolean {
  const queries = {
    sm: '(min-width: 640px)',
    md: '(min-width: 768px)',
    lg: '(min-width: 1024px)',
    xl: '(min-width: 1280px)',
    '2xl': '(min-width: 1536px)'
  }

  return useMediaQuery(queries[breakpoint])
}

// ============================================================================
// USE PREVIOUS VALUE
// ============================================================================>

/**
 * T17.2: Returns the previous value of a variable.
 *
 * Useful for detecting changes and running effects only when
 * specific values change.
 *
 * @example
 * ```tsx
 * const prevMarketId = usePrevious(market?.id)
 * React.useEffect(() => {
 *   if (market?.id !== prevMarketId) {
 *     fetchMarketData(market.id)
 *   }
 * }, [market?.id, prevMarketId])
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>()

  React.useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

// ============================================================================
// USE RERENDER COUNTER (Debug)
// ============================================================================>

/**
 * T17.2: Count re-renders of a component.
 *
 * Use this in development to identify performance issues.
 *
 * @example
 * ```tsx
 * useRenderCounter('MarketCard')
 * ```
 */
export function useRenderCounter(componentName: string = 'Component') {
  const renders = React.useRef(0)

  React.useEffect(() => {
    renders.current += 1
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} rendered ${renders.current} times`)
    }
  })
}

// ============================================================================
// USE RENDER ONCE
// ============================================================================>

/**
 * T17.2: Ensures a callback only runs once per mount.
 *
 * @example
 * ```tsx
 * useRenderOnce(() => {
 *   analytics.track('page_view')
 * })
 * ```
 */
export function useRenderOnce(callback: () => void): void {
  const hasRun = React.useRef(false)

  React.useEffect(() => {
    if (!hasRun.current) {
      callback()
      hasRun.current = true
    }
  }, [callback])
}

// ============================================================================
// USE CONDITIONAL EFFECT
// ============================================================================>

/**
 * T17.2: Runs an effect only when a condition is met.
 *
 * @example
 * ```tsx
 * useConditionalEffect(
 *   () => fetchMarketData(marketId),
 *   marketId !== null
 * )
 * ```
 */
export function useConditionalEffect(
  effect: React.EffectCallback,
  condition: boolean,
  deps: React.DependencyList = []
): void {
  React.useEffect(() => {
    if (condition) {
      return effect()
    }
  }, [condition, ...deps])
}

// ============================================================================
// USE FIRST MOUNT UPDATE
// ============================================================================>

/**
 * T17.2: Distinguish between first mount and subsequent updates.
 *
 * @example
 * ```tsx
 * const isFirstMount = useFirstMountState()
 *
 * React.useEffect(() => {
 *   if (isFirstMount) {
 *     // Only run on mount
 *     initialize()
 *   } else {
 *     // Only run on update
 *     handleUpdate()
 *   }
 * }, [dependency, isFirstMount])
 * ```
 */
export function useFirstMountState(): boolean {
  const isFirst = React.useRef(true)

  React.useEffect(() => {
    isFirst.current = false
  }, [])

  return isFirst.current
}

// ============================================================================
// USE IS MOUNTED
// ============================================================================>

/**
 * T17.2: Check if component is mounted.
 *
 * Useful for preventing state updates after unmount.
 *
 * @example
 * ```tsx
 * const isMounted = useIsMounted()
 *
 * React.useEffect(() => {
 *   fetchData().then(data => {
 *     if (isMounted()) {
 *       setData(data)
 *     }
 *   })
 * }, [])
 * ```
 */
export function useIsMounted(): () => boolean {
  const isMounted = React.useRef(false)

  React.useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])

  return React.useCallback(() => isMounted.current, [])
}

// ============================================================================
// USE SAFE STATE
// ============================================================================>

/**
 * T17.2: Safe state setter that checks if component is mounted.
 *
 * @example
 * ```tsx
 * const [data, setData] = useSafeState<Data | null>(null)
 *
 * React.useEffect(() => {
 *   fetchData().then(setData) // Safe even if unmounted
 * }, [])
 * ```
 */
export function useSafeState<T>(initialValue: T | (() => T)): [T, (value: T | (() => T)) => void] {
  const isMounted = useIsMounted()
  const [state, setState] = React.useState(initialValue)

  const safeSetState = React.useCallback((value: T | (() => T)) => {
    if (isMounted()) {
      setState(value)
    }
  }, [isMounted])

  return [state, safeSetState]
}
