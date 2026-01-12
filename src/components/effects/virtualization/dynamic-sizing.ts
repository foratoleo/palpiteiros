/**
 * Dynamic Sizing Utilities
 *
 * T31.3: Support for dynamic item heights in virtualized lists.
 * Provides measurement caching and position calculation utilities.
 *
 * @features
 * - Measure item dimensions on mount
 * - Cache measurements for performance
 * - Handle resize events
 * - Estimated position calculation
 * - Position correction after measurement
 *
 * @performance
 * - O(1) lookup for cached measurements
 * - Debounced resize handling
 * - RAF-based measurement updates
 *
 * @example
 * ```ts
 * import { useDynamicSizing } from '@/components/effects/virtualization/dynamic-sizing'
 *
 * function VirtualList() {
 *   const { getSize, setPosition, getTotalSize } = useDynamicSizing({
 *     estimatedItemHeight: 50,
 *     itemCount: 1000
 *   })
 *
 *   // ...
 * }
 * ```
 */

'use client'

import * as React from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface DynamicSizingOptions {
  /** Estimated height for unmeasured items */
  estimatedItemHeight?: number
  /** Total number of items */
  itemCount: number
  /** Default item size if measurement fails */
  defaultItemSize?: number
  /** Callback when measurement changes */
  onMeasurementChange?: (index: number, size: number) => void
}

export interface ItemPosition {
  /** Top position */
  top: number
  /** Bottom position */
  bottom: number
  /** Item height */
  height: number
  /** Whether size is estimated */
  estimated: boolean
}

export interface DynamicSizingResult {
  /** Get the size of an item */
  getSize: (index: number) => number
  /** Set the size of an item */
  setSize: (index: number, size: number) => void
  /** Get the position of an item */
  getPosition: (index: number) => ItemPosition
  /** Set the position of an item */
  setPosition: (index: number, position: number) => void
  /** Get total size of all items */
  getTotalSize: () => number
  /** Reset all measurements */
  reset: () => void
  /** Get all positions */
  getAllPositions: () => Map<number, ItemPosition>
  /** Recalculate all positions */
  recalculatePositions: () => void
}

export interface UseDynamicMeasurementOptions {
  /** Element ref to measure */
  itemRef: React.RefObject<HTMLElement>
  /** Index of the item */
  index: number
  /** Estimated size before measurement */
  estimatedSize?: number
  /** Callback when size is measured */
  onMeasure?: (index: number, size: number) => void
  /** Whether measurement is enabled */
  enabled?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_ESTIMATED_SIZE = 50
const RESIZE_DEBOUNCE = 100
const MEASUREMENT_THRESHOLD = 0.5 // Minimum size difference to trigger update

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for dynamic sizing of virtualized items
 */
export function useDynamicSizing({
  estimatedItemHeight = DEFAULT_ESTIMATED_SIZE,
  itemCount,
  defaultItemSize = DEFAULT_ESTIMATED_SIZE,
  onMeasurementChange
}: DynamicSizingOptions): DynamicSizingResult {
  // Store for item sizes
  const sizesRef = React.useRef<Map<number, number>>(new Map())

  // Store for item positions
  const positionsRef = React.useRef<Map<number, ItemPosition>>(new Map())

  // Total size cache
  const [totalSize, setTotalSize] = React.useState(() => {
    return itemCount * estimatedItemHeight
  })

  // Ref to track if total size needs recalculation
  const needsRecalcRef = React.useRef(false)

  /**
   * Get the size of an item
   */
  const getSize = React.useCallback((index: number): number => {
    return sizesRef.current.get(index) ?? estimatedItemHeight
  }, [estimatedItemHeight])

  /**
   * Set the size of an item
   */
  const setSize = React.useCallback((index: number, size: number) => {
    const currentSize = sizesRef.current.get(index)
    const clampedSize = Math.max(defaultItemSize, size)

    // Only update if size changed significantly
    if (currentSize === undefined || Math.abs(currentSize - clampedSize) > MEASUREMENT_THRESHOLD) {
      sizesRef.current.set(index, clampedSize)
      needsRecalcRef.current = true
      onMeasurementChange?.(index, clampedSize)

      // Schedule recalculation
      requestAnimationFrame(() => {
        if (needsRecalcRef.current) {
          recalculatePositions()
          needsRecalcRef.current = false
        }
      })
    }
  }, [defaultItemSize, onMeasurementChange])

  /**
   * Get the position of an item
   */
  const getPosition = React.useCallback((index: number): ItemPosition => {
    // Return cached position if available
    const cached = positionsRef.current.get(index)
    if (cached) {
      return cached
    }

    // Calculate position
    let position = 0
    let i = 0

    while (i < index) {
      position += getSize(i)
      i++
    }

    const height = getSize(index)
    const result: ItemPosition = {
      top: position,
      bottom: position + height,
      height,
      estimated: !sizesRef.current.has(index)
    }

    // Cache for future
    positionsRef.current.set(index, result)

    return result
  }, [getSize])

  /**
   * Manually set the position of an item
   */
  const setPosition = React.useCallback((index: number, position: number) => {
    const height = getSize(index)
    positionsRef.current.set(index, {
      top: position,
      bottom: position + height,
      height,
      estimated: !sizesRef.current.has(index)
    })
  }, [getSize])

  /**
   * Calculate total size of all items
   */
  const calculateTotalSize = React.useCallback(() => {
    let total = 0
    for (let i = 0; i < itemCount; i++) {
      total += getSize(i)
    }
    return total
  }, [itemCount, getSize])

  /**
   * Recalculate all positions
   */
  const recalculatePositions = React.useCallback(() => {
    let position = 0
    positionsRef.current.clear()

    for (let i = 0; i < itemCount; i++) {
      const height = getSize(i)
      positionsRef.current.set(i, {
        top: position,
        bottom: position + height,
        height,
        estimated: !sizesRef.current.has(i)
      })
      position += height
    }

    setTotalSize(position)
  }, [itemCount, getSize])

  // Update total size when positions are recalculated
  React.useEffect(() => {
    if (needsRecalcRef.current) {
      const newTotal = calculateTotalSize()
      setTotalSize(newTotal)
      needsRecalcRef.current = false
    }
  }, [calculateTotalSize])

  /**
   * Reset all measurements
   */
  const reset = React.useCallback(() => {
    sizesRef.current.clear()
    positionsRef.current.clear()
    setTotalSize(itemCount * estimatedItemHeight)
  }, [itemCount, estimatedItemHeight])

  /**
   * Get all positions
   */
  const getAllPositions = React.useCallback(() => {
    return positionsRef.current
  }, [])

  return {
    getSize,
    setSize,
    getPosition,
    setPosition,
    getTotalSize: () => totalSize,
    reset,
    getAllPositions,
    recalculatePositions
  }
}

/**
 * Hook for measuring individual items
 */
export function useDynamicMeasurement({
  itemRef,
  index,
  estimatedSize = DEFAULT_ESTIMATED_SIZE,
  onMeasure,
  enabled = true
}: UseDynamicMeasurementOptions): { measuredSize: number; measure: () => void } {
  const [measuredSize, setMeasuredSize] = React.useState(estimatedSize)
  const hasMeasuredRef = React.useRef(false)

  const measure = React.useCallback(() => {
    if (!enabled || !itemRef.current) return

    const element = itemRef.current
    const rect = element.getBoundingClientRect()
    const size = rect.height

    // Only update if size is valid and different
    if (size > 0 && size !== measuredSize) {
      setMeasuredSize(size)
      hasMeasuredRef.current = true
      onMeasure?.(index, size)
    }
  }, [enabled, itemRef, index, measuredSize, onMeasure])

  // Measure on mount
  React.useEffect(() => {
    if (!enabled || hasMeasuredRef.current) return

    // Use RAF to ensure DOM is ready
    const raf = requestAnimationFrame(measure)
    return () => cancelAnimationFrame(raf)
  }, [enabled, measure])

  // Re-measure on resize
  React.useEffect(() => {
    if (!enabled || !itemRef.current) return

    let timeoutId: ReturnType<typeof setTimeout>

    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(measure, RESIZE_DEBOUNCE)
    }

    const resizeObserver = new ResizeObserver(handleResize)
    resizeObserver.observe(itemRef.current)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
    }
  }, [enabled, itemRef, measure])

  return { measuredSize, measure }
}

/**
 * Hook for range calculation with dynamic sizing
 */
export interface DynamicRangeResult {
  /** Start index of visible range */
  startIndex: number
  /** End index of visible range */
  endIndex: number
  /** Offset for start item */
  startOffset: number
}

export function useDynamicRange(
  getPosition: (index: number) => ItemPosition,
  itemCount: number,
  viewportSize: number,
  scrollOffset: number,
  overscan: number = 3
): DynamicRangeResult {
  return React.useMemo(() => {
    const viewportTop = scrollOffset
    const viewportBottom = scrollOffset + viewportSize

    // Binary search for start index
    let startIndex = 0
    let low = 0
    let high = itemCount - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const position = getPosition(mid)

      if (position.bottom <= viewportTop) {
        low = mid + 1
      } else if (position.top >= viewportBottom) {
        high = mid - 1
      } else {
        startIndex = mid
        high = mid - 1
      }
    }

    // Binary search for end index
    let endIndex = itemCount - 1
    low = startIndex
    high = itemCount - 1

    while (low <= high) {
      const mid = Math.floor((low + high) / 2)
      const position = getPosition(mid)

      if (position.top >= viewportBottom) {
        high = mid - 1
        endIndex = mid - 1
      } else {
        low = mid + 1
        endIndex = mid
      }
    }

    // Apply overscan
    startIndex = Math.max(0, startIndex - overscan)
    endIndex = Math.min(itemCount - 1, endIndex + overscan)

    const startOffset = getPosition(startIndex).top

    return { startIndex, endIndex, startOffset }
  }, [getPosition, itemCount, viewportSize, scrollOffset, overscan])
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Find approximate index for a scroll position
 */
export function findApproximateIndex(
  scrollPosition: number,
  estimatedItemHeight: number,
  itemCount: number
): number {
  return Math.min(
    Math.floor(scrollPosition / estimatedItemHeight),
    Math.max(0, itemCount - 1)
  )
}

/**
 * Calculate buffer size for overscan
 */
export function calculateOverscan(
  itemCount: number,
  viewportSize: number,
  estimatedItemHeight: number
): number {
  const visibleItemCount = Math.ceil(viewportSize / estimatedItemHeight)
  return Math.min(5, Math.ceil(visibleItemCount * 0.5))
}

/**
 * Get estimated position before measurement
 */
export function getEstimatedPosition(
  index: number,
  estimatedItemHeight: number
): ItemPosition {
  const top = index * estimatedItemHeight
  return {
    top,
    bottom: top + estimatedItemHeight,
    height: estimatedItemHeight,
    estimated: true
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  useDynamicSizing,
  useDynamicMeasurement,
  useDynamicRange,
  findApproximateIndex,
  calculateOverscan,
  getEstimatedPosition
}
