/**
 * Infinite Scroll Component
 *
 * T31.4: Infinite scroll with pagination for seamless data loading.
 * Automatically loads more data as user scrolls towards the end.
 *
 * @features
 * - Automatic pagination trigger
 * - Configurable threshold distance
 * - Loading state handling
 * - Error recovery
 * - Debounced scroll events
 * - Request cancellation
 *
 * @performance
 * - RAF-based scroll detection
 * - Debounced load triggers
 * - Request deduplication
 *
 * @example
 * ```tsx
 * import { InfiniteScroll } from '@/components/effects/virtualization/infinite-scroll'
 *
 * <InfiniteScroll
 *   items={markets}
 *   renderItem={(market) => <MarketCard market={market} />}
 *   onLoadMore={loadNextPage}
 *   hasMore={hasMorePages}
 *   isLoading={isLoading}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface InfiniteScrollProps<T> {
  /** Array of items to display */
  items: T[]
  /** Render function for each item */
  renderItem: (item: T, index: number) => React.ReactNode
  /** Callback to load more items */
  onLoadMore: () => void | Promise<void>
  /** Whether there are more items to load */
  hasMore: boolean
  /** Whether currently loading */
  isLoading?: boolean
  /** Distance from bottom (in pixels) to trigger load */
  threshold?: number
  /** Whether loading is disabled */
  disabled?: boolean
  /** Custom CSS class names */
  className?: string
  /** Content container class */
  contentClassName?: string
  /** Loading indicator component */
  loadingIndicator?: React.ReactNode
  /** End of list message component */
  endMessage?: React.ReactNode
  /** Error message component */
  errorComponent?: React.ReactNode
  /** Unique key extractor */
  getKey?: (item: T, index: number) => string | number
  /** Initial load trigger (skip first manual trigger) */
  initialLoad?: boolean
  /** Scroll container (defaults to window) */
  scrollContainer?: React.RefObject<HTMLElement> | Window
  /** Orientation of scroll */
  orientation?: 'vertical' | 'horizontal'
}

export interface InfiniteScrollRef {
  /** Manually trigger load more */
  loadMore: () => void
  /** Reset to initial state */
  reset: () => void
  /** Get current scroll position */
  getScrollPosition: () => number
}

export type InfiniteScrollStatus = 'idle' | 'loading' | 'error' | 'complete'

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_THRESHOLD = 200
const SCROLL_DEBOUNCE = 100
const MIN_LOAD_INTERVAL = 500 // Minimum time between load requests

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for infinite scroll detection
 */
function useInfiniteScroll(
  hasMore: boolean,
  isLoading: boolean,
  disabled: boolean,
  threshold: number,
  scrollContainer: React.RefObject<HTMLElement> | Window | undefined,
  orientation: 'vertical' | 'horizontal'
) {
  const [shouldLoad, setShouldLoad] = React.useState(false)
  const lastLoadTimeRef = React.useRef(0)
  const rafRef = React.useRef<number>()
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

  // Get scroll container dimensions
  const getScrollInfo = React.useCallback(() => {
    const isWindow = scrollContainer === undefined || scrollContainer instanceof Window
    const container = isWindow ? window : (scrollContainer as React.RefObject<HTMLElement>).current

    if (!container) {
      return { scrollPosition: 0, scrollSize: 0, clientSize: 0 }
    }

    if (isWindow) {
      return {
        scrollPosition: orientation === 'vertical'
          ? window.scrollY
          : window.scrollX,
        scrollSize: orientation === 'vertical'
          ? document.documentElement.scrollHeight
          : document.documentElement.scrollWidth,
        clientSize: orientation === 'vertical'
          ? window.innerHeight
          : window.innerWidth
      }
    }

    const el = container as HTMLElement
    return {
      scrollPosition: orientation === 'vertical' ? el.scrollTop : el.scrollLeft,
      scrollSize: orientation === 'vertical' ? el.scrollHeight : el.scrollWidth,
      clientSize: orientation === 'vertical' ? el.clientHeight : el.clientWidth
    }
  }, [scrollContainer, orientation])

  // Check if we should load more
  const checkShouldLoad = React.useCallback(() => {
    if (!hasMore || isLoading || disabled) {
      return false
    }

    const { scrollPosition, scrollSize, clientSize } = getScrollInfo()
    const distanceFromBottom = scrollSize - (scrollPosition + clientSize)

    // Rate limiting
    const now = Date.now()
    if (now - lastLoadTimeRef.current < MIN_LOAD_INTERVAL) {
      return false
    }

    return distanceFromBottom <= threshold
  }, [hasMore, isLoading, disabled, threshold, getScrollInfo])

  // Handle scroll events
  React.useEffect(() => {
    if (!hasMore || disabled) {
      return
    }

    const container = scrollContainer === undefined || scrollContainer instanceof Window
      ? window
      : scrollContainer.current

    if (!container) return

    const handleScroll = () => {
      // Cancel any pending RAF
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      // Debounce scroll handling
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        rafRef.current = requestAnimationFrame(() => {
          if (checkShouldLoad()) {
            lastLoadTimeRef.current = Date.now()
            setShouldLoad(true)
          }
        })
      }, SCROLL_DEBOUNCE)
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [hasMore, disabled, scrollContainer, checkShouldLoad])

  // Reset shouldLoad after triggering
  React.useEffect(() => {
    if (shouldLoad) {
      setShouldLoad(false)
    }
  }, [shouldLoad])

  return { shouldLoad }
}

/**
 * Hook for intersection observer based loading (alternative to scroll)
 */
function useIntersectionLoad(
  triggerRef: React.RefObject<HTMLElement>,
  hasMore: boolean,
  isLoading: boolean,
  disabled: boolean,
  rootMargin: string = '200px'
) {
  const [shouldLoad, setShouldLoad] = React.useState(false)

  React.useEffect(() => {
    if (!hasMore || isLoading || disabled || !triggerRef.current) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setShouldLoad(true)
        }
      },
      { rootMargin }
    )

    observer.observe(triggerRef.current)

    return () => observer.disconnect()
  }, [hasMore, isLoading, disabled, triggerRef, rootMargin])

  return { shouldLoad }
}

// ============================================================================
// COMPONENTS
// ============================================================================

export const InfiniteScroll = React.forwardRef<
  InfiniteScrollRef,
  InfiniteScrollProps<any>
>(function InfiniteScroll(
  props: InfiniteScrollProps<any>,
  ref: React.ForwardedRef<InfiniteScrollRef>
) {
  const {
    items,
    renderItem,
    onLoadMore,
    hasMore,
    isLoading = false,
    threshold = DEFAULT_THRESHOLD,
    disabled = false,
    className,
    contentClassName,
    loadingIndicator,
    endMessage,
    errorComponent,
    getKey,
    initialLoad = false,
    scrollContainer,
    orientation = 'vertical'
  } = props
    const [status, setStatus] = React.useState<InfiniteScrollStatus>('idle')
    const [error, setError] = React.useState<Error | null>(null)
    const triggerRef = React.useRef<HTMLDivElement>(null)

    // Use scroll-based detection
    const { shouldLoad } = useInfiniteScroll(
      hasMore,
      isLoading,
      disabled,
      threshold,
      scrollContainer,
      orientation
    )

    // Also use intersection observer as backup
    const { shouldLoad: shouldLoadIntersection } = useIntersectionLoad(
      triggerRef,
      hasMore,
      isLoading,
      disabled,
      `${threshold}px`
    )

    // Load more function
    const loadMore = React.useCallback(async () => {
      if (!hasMore || isLoading || disabled) {
        return
      }

      setStatus('loading')
      setError(null)

      try {
        await Promise.resolve(onLoadMore())
        setStatus('idle')
      } catch (err) {
        setError(err as Error)
        setStatus('error')
      }
    }, [hasMore, isLoading, disabled, onLoadMore])

    // Trigger load when shouldLoad changes
    React.useEffect(() => {
      if (shouldLoad || shouldLoadIntersection) {
        loadMore()
      }
    }, [shouldLoad, shouldLoadIntersection, loadMore])

    // Initial load
    React.useEffect(() => {
      if (initialLoad && hasMore && !isLoading) {
        loadMore()
      }
      // Only run on mount
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Imperative API
    React.useImperativeHandle(
      ref,
      () => ({
        loadMore,
        reset: () => {
          setStatus('idle')
          setError(null)
        },
        getScrollPosition: () => {
          const container = scrollContainer === undefined || scrollContainer instanceof Window
            ? document.documentElement
            : scrollContainer.current

          if (!container) return 0

          return orientation === 'vertical'
            ? (container === document.documentElement ? window.scrollY : (container as HTMLElement).scrollTop)
            : (container === document.documentElement ? window.scrollX : (container as HTMLElement).scrollLeft)
        }
      }),
      [loadMore, scrollContainer, orientation]
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

    // Default loading indicator
    const defaultLoadingIndicator = (
      <div className="flex items-center justify-center py-4">
        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </motion.div>
      </div>
    )

    // Default end message
    const defaultEndMessage = (
      <div className="text-center py-4 text-muted-foreground text-sm">
        No more items
      </div>
    )

    return (
      <div className={cn('infinite-scroll-container', className)}>
        <div className={cn('infinite-scroll-content', contentClassName)}>
          {items.map((item, index) => (
            <div key={getItemKey(item, index)}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>

        {/* Loading indicator */}
        <AnimatePresence>
          {isLoading && (loadingIndicator || defaultLoadingIndicator)}
        </AnimatePresence>

        {/* Error state */}
        {status === 'error' && error && (
          <div className="py-4 text-center">
            {errorComponent || (
              <div className="text-destructive text-sm">
                Failed to load more items.{' '}
                <button
                  onClick={loadMore}
                  className="underline hover:no-underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

        {/* End message */}
        {!hasMore && !isLoading && (endMessage || defaultEndMessage)}

        {/* Intersection observer trigger */}
        {hasMore && !isLoading && (
          <div ref={triggerRef} className="h-4" aria-hidden="true" />
        )}
      </div>
    )
  }
)

InfiniteScroll.displayName = 'InfiniteScroll'

// ============================================================================
// VIRTUALIZED INFINITE SCROLL
// ============================================================================

export interface VirtualizedInfiniteScrollProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  onLoadMore: () => void | Promise<void>
  hasMore: boolean
  isLoading?: boolean
  itemHeight: number
  containerHeight: number
  threshold?: number
  overscan?: number
  className?: string
  getKey?: (item: T, index: number) => string | number
}

/**
 * Virtualized Infinite Scroll
 *
 * Combines virtualization with infinite scroll for maximum performance
 */
export const VirtualizedInfiniteScroll = React.forwardRef<
  InfiniteScrollRef,
  VirtualizedInfiniteScrollProps<any>
>(function VirtualizedInfiniteScroll(
  props: VirtualizedInfiniteScrollProps<any>,
  ref
) {
  const {
    items,
    renderItem,
    onLoadMore,
    hasMore,
    isLoading = false,
    itemHeight,
    containerHeight,
    threshold = DEFAULT_THRESHOLD,
    overscan = 3,
    className,
    getKey
  } = props
    const [scrollTop, setScrollTop] = React.useState(0)
    const containerRef = React.useRef<HTMLDivElement>(null)
    const triggerRef = React.useRef<HTMLDivElement>(null)
    const lastLoadTimeRef = React.useRef(0)

    // Calculate visible range
    const { startIndex, endIndex } = React.useMemo(() => {
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
      const end = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
      )
      return { startIndex: start, endIndex: end }
    }, [scrollTop, itemHeight, containerHeight, items.length, overscan])

    // Check if should load more
    const shouldLoadMore = React.useMemo(() => {
      if (!hasMore || isLoading) return false

      const scrollBottom = scrollTop + containerHeight
      const totalHeight = items.length * itemHeight
      const distanceFromBottom = totalHeight - scrollBottom

      const now = Date.now()
      if (now - lastLoadTimeRef.current < MIN_LOAD_INTERVAL) {
        return false
      }

      return distanceFromBottom <= threshold
    }, [hasMore, isLoading, scrollTop, containerHeight, items.length, itemHeight, threshold])

    // Load more
    const loadMore = React.useCallback(async () => {
      if (!hasMore || isLoading) return

      lastLoadTimeRef.current = Date.now()
      await Promise.resolve(onLoadMore())
    }, [hasMore, isLoading, onLoadMore])

    React.useEffect(() => {
      if (shouldLoadMore) {
        loadMore()
      }
    }, [shouldLoadMore, loadMore])

    // Scroll handler
    const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
      setScrollTop(e.currentTarget.scrollTop)
    }, [])

    // Imperative API
    React.useImperativeHandle(
      ref,
      () => ({
        loadMore,
        reset: () => setScrollTop(0),
        getScrollPosition: () => scrollTop
      }),
      [loadMore, scrollTop]
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

    const totalHeight = items.length * itemHeight
    const offsetY = startIndex * itemHeight

    return (
      <div
        ref={containerRef}
        className={cn('virtualized-infinite-scroll overflow-auto', className)}
        style={{ height: containerHeight }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          {items.slice(startIndex, endIndex + 1).map((item, visibleIndex) => {
            const actualIndex = startIndex + visibleIndex
            return (
              <div
                key={getItemKey(item, actualIndex)}
                style={{
                  position: 'absolute',
                  top: actualIndex * itemHeight,
                  height: itemHeight,
                  width: '100%'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            )
          })}

          {/* Trigger element for intersection observer */}
          {hasMore && !isLoading && (
            <div
              ref={triggerRef}
              style={{
                position: 'absolute',
                top: totalHeight,
                height: threshold
              }}
            />
          )}
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <motion.div
              className="inline-flex gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </motion.div>
          </div>
        )}
      </div>
    )
  }
)

VirtualizedInfiniteScroll.displayName = 'VirtualizedInfiniteScroll'

// ============================================================================
// EXPORTS
// ============================================================================

export default InfiniteScroll
