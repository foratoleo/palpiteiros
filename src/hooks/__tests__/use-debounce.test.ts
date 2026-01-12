/**
 * useDebounce Hook Tests
 *
 * Tests for the useDebounce hook which delays value updates.
 * Tests cover debouncing behavior and timing.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from '@/hooks/use-debounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 300))

    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 }
      }
    )

    // Change the value
    rerender({ value: 'updated', delay: 300 })

    // Value should not change immediately
    expect(result.current).toBe('initial')

    // Fast forward time
    vi.advanceTimersByTime(300)

    // Now value should be updated
    expect(result.current).toBe('updated')
  })

  it('should reset delay on rapid changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 300 }
      }
    )

    // First change
    rerender({ value: 'change1', delay: 300 })
    vi.advanceTimersByTime(100)

    // Second change before first debounce completes
    rerender({ value: 'change2', delay: 300 })
    vi.advanceTimersByTime(100)

    // Third change
    rerender({ value: 'change3', delay: 300 })
    vi.advanceTimersByTime(100)

    // Still should be initial
    expect(result.current).toBe('initial')

    // Wait the full 300ms from last change
    vi.advanceTimersByTime(200)

    // Now should be updated
    expect(result.current).toBe('change3')
  })

  it('should use custom delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 }
      }
    )

    rerender({ value: 'updated', delay: 500 })

    vi.advanceTimersByTime(499)
    expect(result.current).toBe('initial')

    vi.advanceTimersByTime(1)
    expect(result.current).toBe('updated')
  })
})
