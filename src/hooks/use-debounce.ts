/**
 * useDebounce Hook
 *
 * Custom hook for debouncing values with configurable delay.
 *
 * @example
 * ```ts
 * const debouncedValue = useDebounce(value, 300)
 * ```
 */

'use client'

import * as React from 'react'

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay ?? 500)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
