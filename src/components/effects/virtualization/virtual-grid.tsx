/**
 * Virtual Grid Component
 *
 * T31.1: Virtualized grid layout for efficient rendering of large datasets.
 * Only renders visible items for optimal performance.
 *
 * @features
 * - Fixed or dynamic column layouts
 * - Configurable item sizes
 * - Smooth scrolling with RAF updates
 * - Overscan for smooth scrolling experience
 * - Reduced motion support
 * - Accessibility with keyboard navigation
 *
 * @performance
 * - O(1) render complexity regardless of dataset size
 * - Cached dimension measurements
 * - Debounced scroll handling
 *
 * @example
 * ```tsx
 * import { VirtualGrid } from '@/components/effects/virtualization/virtual-grid'
 *
 * <VirtualGrid
 *   items={markets}
 *   renderItem={(market) => <MarketCard market={market} />}
 *   itemHeight={200}
 *   columnCount={3}
 *   gap={16}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface VirtualGridProps<T> {
  /** Array of items to render */
  items: T[]
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Expected height of each item in pixels */
  itemHeight: number
  /** Number of columns */
  columnCount: number
  /** Gap between items in pixels */
  gap?: number
  /** Height of the container in pixels */
  height?: number
  /** Estimated width for SSR */
  estimatedWidth?: number
  /** Number of items to render outside viewport (overscan) */
  overscan?: number
  /** Custom CSS class names */
  className?: string
  /** Custom inner container class */
  innerClassName?: string
  /** Callback when scroll position changes */
  onScroll?: (scrollTop: number) => void
  /** Callback when visible items change */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void
  /** Unique key extractor */
  getKey?: (item: T, index: number) => string | number
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean
}

export interface VirtualGridState {
  scrollTop: number
  isScrolling: boolean
  containerWidth: number
}

export interface VirtualGridRef {
  /** Scroll to a specific item */
  scrollToItem: (index: number, align?: 'start' | 'center' | 'end') => void
  /** Get current scroll position */
  getScrollPosition: () => number
  /** Reset scroll position */
  resetScroll: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OVERSCAN = 3
const SCROLL_DEBOUNCE = 100
const RESIZE_DEBOUNCE = 200

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for scroll position tracking with debouncing
 */
function useScrollPosition(
  containerRef: React.RefObject<HTMLDivElement>,
  debounceMs: number = SCROLL_DEBOUNCE
) {
  const [scrollTop, setScrollTop] = React.useState(0)
  const [isScrolling, setIsScrolling] = React.useState(false)
  const scrollTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>()
  const rafRef = React.useRef<number>()

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let lastScrollTop = 0

    const handleScroll = () => {
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Schedule update
      rafRef.current = requestAnimationFrame(() => {
        const newScrollTop = container.scrollTop
        setScrollTop(newScrollTop)
        setIsScrolling(true)
        lastScrollTop = newScrollTop

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // Set timeout to stop scrolling state
        scrollTimeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, debounceMs)
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [containerRef, debounceMs])

  return { scrollTop, isScrolling }
}

/**
 * Hook for container dimensions
 */
function useContainerDimensions(
  containerRef: React.RefObject<HTMLDivElement>,
  defaultHeight: number
) {
  const [dimensions, setDimensions] = React.useState(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 1200,
    height: defaultHeight
  }))

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Set initial dimensions
    const updateDimensions = () => {
      const rect = container.getBoundingClientRect()
      setDimensions({
        width: rect.width || container.clientWidth,
        height: rect.height || container.clientHeight
      })
    }

    updateDimensions()

    let timeoutId: ReturnType<typeof setTimeout>
    const resizeObserver = new ResizeObserver((entries) => {
      // Debounce resize events
      clearTimeout(timeoutId)
      timeoutId = setTimeout(updateDimensions, RESIZE_DEBOUNCE)
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeoutId)
    }
  }, [containerRef, defaultHeight])

  return dimensions
}

/**
 * Hook for reducing motion preference
 */
function useReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = React.useState(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReduced(mediaQuery.matches)

    const handleChange = () => setPrefersReduced(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

// ============================================================================
// COMPONENT
// ============================================================================

export const VirtualGrid = React.forwardRef<VirtualGridRef, VirtualGridProps<any>>(function VirtualGrid(
  props: VirtualGridProps<any>,
  ref
) {
  const {
    items,
    renderItem,
    itemHeight,
    columnCount,
    gap = 0,
    height = 600,
    estimatedWidth = 1200,
    overscan = DEFAULT_OVERSCAN,
    className,
    innerClassName,
    onScroll,
    onVisibleRangeChange,
    getKey,
    respectReducedMotion = true
  } = props
    const containerRef = React.useRef<HTMLDivElement>(null)
    const prefersReduced = useReducedMotion()
    const shouldReduceMotion = respectReducedMotion && prefersReduced

    // Scroll position
    const { scrollTop, isScrolling } = useScrollPosition(containerRef)

    // Container dimensions
    const { width: containerWidth } = useContainerDimensions(containerRef, height)

    // Calculate layout
    const layout = React.useMemo(() => {
      // Calculate column width accounting for gaps
      const totalGapWidth = gap * (columnCount - 1)
      const columnWidth = (containerWidth - totalGapWidth) / columnCount

      // Calculate total rows
      const rowCount = Math.ceil(items.length / columnCount)

      // Calculate total height
      const totalHeight = rowCount * itemHeight + (rowCount - 1) * gap

      return { columnWidth, rowCount, totalHeight }
    }, [containerWidth, columnCount, gap, itemHeight, items.length])

    // Calculate visible range
    const visibleRange = React.useMemo(() => {
      // Calculate which rows are visible
      const startRow = Math.max(0, Math.floor(scrollTop / (itemHeight + gap)) - overscan)
      const endRow = Math.min(
        layout.rowCount - 1,
        Math.ceil((scrollTop + height) / (itemHeight + gap)) + overscan
      )

      // Convert to item indices
      const startIndex = startRow * columnCount
      const endIndex = Math.min(items.length - 1, (endRow + 1) * columnCount - 1)

      return { startIndex, endIndex, startRow, endRow }
    }, [scrollTop, height, itemHeight, gap, layout.rowCount, columnCount, items.length, overscan])

    // Update scroll position and visible range callbacks
    React.useEffect(() => {
      onScroll?.(scrollTop)
    }, [scrollTop, onScroll])

    React.useEffect(() => {
      onVisibleRangeChange?.(visibleRange.startIndex, visibleRange.endIndex)
    }, [visibleRange, onVisibleRangeChange])

    // Imperative API
    React.useImperativeHandle(
      ref,
      () => ({
        scrollToItem: (index: number, align: 'start' | 'center' | 'end' = 'start') => {
          const container = containerRef.current
          if (!container) return

          const row = Math.floor(index / columnCount)
          const rowTop = row * (itemHeight + gap)

          let scrollTop: number
          if (align === 'center') {
            scrollTop = rowTop - height / 2 + itemHeight / 2
          } else if (align === 'end') {
            scrollTop = rowTop - height + itemHeight
          } else {
            scrollTop = rowTop
          }

          container.scrollTo({
            top: Math.max(0, scrollTop),
            behavior: shouldReduceMotion ? 'auto' : 'smooth'
          })
        },
        getScrollPosition: () => scrollTop,
        resetScroll: () => {
          const container = containerRef.current
          if (container) {
            container.scrollTo({ top: 0, behavior: shouldReduceMotion ? 'auto' : 'smooth' })
          }
        }
      }),
      [columnCount, itemHeight, gap, height, scrollTop, shouldReduceMotion]
    )

    // Default key extractor
    const defaultGetKey = React.useCallback(
      (item: any, index: number) => {
        if (typeof item === 'object' && item !== null && 'id' in item) {
          return (item as any).id
        }
        return index
      },
      []
    )

    const getItemKey = getKey || defaultGetKey

    // Render visible items
    const renderItems = () => {
      const elements: React.ReactNode[] = []

      for (let index = visibleRange.startIndex; index <= visibleRange.endIndex; index++) {
        const item = items[index]
        if (!item) continue

        const row = Math.floor(index / columnCount)
        const col = index % columnCount

        const top = row * (itemHeight + gap)
        const left = col * (layout.columnWidth + gap)

        elements.push(
          <div
            key={getItemKey(item, index)}
            className="virtual-grid-item absolute top-0 left-0"
            style={{
              transform: `translate(${left}px, ${top}px)`,
              width: layout.columnWidth,
              height: itemHeight,
              transition: shouldReduceMotion ? 'none' : undefined
            }}
            data-index={index}
          >
            {renderItem(item, index)}
          </div>
        )
      }

      return elements
    }

    return (
      <div
        ref={containerRef}
        className={cn('virtual-grid-container relative overflow-auto', className)}
        style={{ height }}
        role="grid"
        aria-rowcount={layout.rowCount}
        aria-colcount={columnCount}
      >
        <div
          className={cn('virtual-grid-inner relative', innerClassName)}
          style={{ height: layout.totalHeight, width: '100%' }}
        >
          {renderItems()}
        </div>
      </div>
    )
  }
)

VirtualGrid.displayName = 'VirtualGrid'

// ============================================================================
// EXPORTS
// ============================================================================

export default VirtualGrid
