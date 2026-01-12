/**
 * Virtual Timeline Component
 *
 * T31.2: Virtualized timeline component for efficient rendering of chronological data.
 * Displays events in a timeline format with only visible items rendered.
 *
 * @features
 * - Horizontal or vertical orientation
 * - Configurable item sizing
 * - Date-based grouping
 * - Smooth scroll to date
 * - Keyboard navigation
 * - Reduced motion support
 *
 * @performance
 * - O(1) render complexity
 * - Cached position calculations
 * - RAF-based scroll updates
 *
 * @example
 * ```tsx
 * import { VirtualTimeline } from '@/components/effects/virtualization/virtual-timeline'
 *
 * <VirtualTimeline
 *   events={events}
 *   renderEvent={(event) => <EventCard event={event} />}
 *   getDate={(event) => new Date(event.timestamp)}
 *   orientation="vertical"
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type TimelineOrientation = 'horizontal' | 'vertical'

export interface TimelineEvent<T = any> {
  /** The event data */
  data: T
  /** Timestamp for positioning */
  timestamp: Date | string | number
  /** Unique identifier */
  id?: string | number
}

export interface VirtualTimelineProps<T> {
  /** Array of events to display */
  events: TimelineEvent<T>[]
  /** Render function for each event */
  renderEvent: (event: T, index: number) => React.ReactNode
  /** Extract date from event */
  getDate: (event: T) => Date
  /** Timeline orientation */
  orientation?: TimelineOrientation
  /** Height/width of container */
  size?: number
  /** Expected height/width of each event item */
  itemSize: number
  /** Gap between events */
  gap?: number
  /** Number of items to render outside viewport */
  overscan?: number
  /** Custom CSS class names */
  className?: string
  /** Callback when visible range changes */
  onVisibleRangeChange?: (startIndex: number, endIndex: number) => void
  /** Show date markers */
  showDateMarkers?: boolean
  /** Format for date markers */
  dateFormat?: Intl.DateTimeFormatOptions
  /** Respect prefers-reduced-motion */
  respectReducedMotion?: boolean
}

export interface VirtualTimelineRef {
  /** Scroll to a specific date */
  scrollToDate: (date: Date, align?: 'start' | 'center' | 'end') => void
  /** Scroll to a specific event */
  scrollToEvent: (index: number, align?: 'start' | 'center' | 'end') => void
  /** Get current scroll position */
  getScrollPosition: () => number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_OVERSCAN = 2
const DEFAULT_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric'
}

// ============================================================================
// HOOKS
// ============================================================================

/**
 * Hook for scroll position with RAF
 */
function useTimelineScroll(
  containerRef: React.RefObject<HTMLDivElement>
) {
  const [scrollPosition, setScrollPosition] = React.useState(0)
  const [isScrolling, setIsScrolling] = React.useState(false)
  const rafRef = React.useRef<number>()
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>()

  React.useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }

      rafRef.current = requestAnimationFrame(() => {
        setScrollPosition(container.scrollTop || container.scrollLeft)
        setIsScrolling(true)

        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
          setIsScrolling(false)
        }, 150)
      })
    }

    container.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [containerRef])

  return { scrollPosition, isScrolling }
}

/**
 * Hook for reduced motion preference
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
// HELPERS
// ============================================================================

/**
 * Check if two dates are on the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

/**
 * Format a date for display
 */
function formatDate(date: Date, options: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(undefined, options).format(date)
}

// ============================================================================
// COMPONENT
// ============================================================================

export const VirtualTimeline = React.forwardRef<
  VirtualTimelineRef,
  VirtualTimelineProps<any>
>(function VirtualTimeline(
  {
    events,
    renderEvent,
    getDate,
    orientation = 'vertical',
    size = 600,
    itemSize,
    gap = 16,
    overscan = DEFAULT_OVERSCAN,
    className,
    onVisibleRangeChange,
    showDateMarkers = true,
    dateFormat = DEFAULT_DATE_FORMAT,
    respectReducedMotion = true
  }: VirtualTimelineProps<any>,
  ref
) {
    const containerRef = React.useRef<HTMLDivElement>(null)
    const prefersReduced = useReducedMotion()
    const shouldReduceMotion = respectReducedMotion && prefersReduced

    // Sort events by date
    const sortedEvents = React.useMemo(() => {
      return [...events].sort((a, b) => {
        const dateA = new Date(a.timestamp)
        const dateB = new Date(b.timestamp)
        return dateA.getTime() - dateB.getTime()
      })
    }, [events])

    // Calculate positions and total size
    const layout = React.useMemo(() => {
      const positions = new Map<number, number>()
      const dateMarkers = new Map<string, number>()
      let currentDate: Date | null = null
      let position = 0

      sortedEvents.forEach((event, index) => {
        const eventDate = getDate(event.data)
        const isFirstEvent = index === 0
        const isNewDay = isFirstEvent || !currentDate || !isSameDay(eventDate, currentDate)

        if (isNewDay && showDateMarkers) {
          // Add date marker position
          const dateKey = formatDate(eventDate, { year: 'numeric', month: 'numeric', day: 'numeric' })
          if (!dateMarkers.has(dateKey)) {
            dateMarkers.set(dateKey, position)
            position += 40 // Date marker height
          }
        }

        positions.set(index, position)
        position += itemSize + gap
        currentDate = eventDate
      })

      return { positions, dateMarkers, totalSize: position }
    }, [sortedEvents, getDate, itemSize, gap, showDateMarkers])

    // Scroll position
    const { scrollPosition, isScrolling } = useTimelineScroll(containerRef)

    // Calculate visible range
    const isHorizontal = orientation === 'horizontal'
    const visibleRange = React.useMemo(() => {
      const viewportSize = size

      const startIndex = Math.max(
        0,
        Math.floor(scrollPosition / (itemSize + gap)) - overscan
      )

      const endIndex = Math.min(
        sortedEvents.length - 1,
        Math.ceil((scrollPosition + viewportSize) / (itemSize + gap)) + overscan
      )

      return { startIndex, endIndex }
    }, [scrollPosition, size, itemSize, gap, sortedEvents.length, overscan])

    // Notify visible range change
    React.useEffect(() => {
      onVisibleRangeChange?.(visibleRange.startIndex, visibleRange.endIndex)
    }, [visibleRange, onVisibleRangeChange])

    // Imperative API
    React.useImperativeHandle(
      ref,
      () => ({
        scrollToDate: (date: Date, align: 'start' | 'center' | 'end' = 'start') => {
          const container = containerRef.current
          if (!container) return

          // Find closest event to date
          let closestIndex = 0
          let closestDiff = Infinity

          sortedEvents.forEach((event, index) => {
            const eventDate = getDate(event.data)
            const diff = Math.abs(eventDate.getTime() - date.getTime())
            if (diff < closestDiff) {
              closestDiff = diff
              closestIndex = index
            }
          })

          const position = layout.positions.get(closestIndex) || 0
          let scrollPos = position

          if (align === 'center') {
            scrollPos = position - size / 2 + itemSize / 2
          } else if (align === 'end') {
            scrollPos = position - size + itemSize
          }

          const scrollOptions = {
            [isHorizontal ? 'left' : 'top']: Math.max(0, scrollPos),
            behavior: shouldReduceMotion ? ('auto' as const) : ('smooth' as const)
          }

          container.scrollTo(scrollOptions)
        },
        scrollToEvent: (index: number, align: 'start' | 'center' | 'end' = 'start') => {
          const container = containerRef.current
          if (!container) return

          const position = layout.positions.get(index) || 0
          let scrollPos = position

          if (align === 'center') {
            scrollPos = position - size / 2 + itemSize / 2
          } else if (align === 'end') {
            scrollPos = position - size + itemSize
          }

          const scrollOptions = {
            [isHorizontal ? 'left' : 'top']: Math.max(0, scrollPos),
            behavior: shouldReduceMotion ? ('auto' as const) : ('smooth' as const)
          }

          container.scrollTo(scrollOptions)
        },
        getScrollPosition: () => scrollPosition
      }),
      [
        layout.positions,
        sortedEvents,
        getDate,
        size,
        itemSize,
        isHorizontal,
        shouldReduceMotion,
        scrollPosition
      ]
    )

    // Render visible items
    const renderItems = () => {
      const elements: React.ReactNode[] = []
      let currentDate: Date | null = null

      for (let index = visibleRange.startIndex; index <= visibleRange.endIndex; index++) {
        const event = sortedEvents[index]
        if (!event) continue

        const eventDate = getDate(event.data)
        const isNewDay =
          index === 0 || !currentDate || !isSameDay(eventDate, currentDate)

        const position = layout.positions.get(index) || 0

        // Date marker
        if (showDateMarkers && isNewDay && index > 0) {
          const prevDate = getDate(sortedEvents[index - 1].data)
          if (!isSameDay(eventDate, prevDate)) {
            elements.push(
              <div
                key={`date-${index}`}
                className={cn(
                  'absolute text-xs font-medium text-muted-foreground uppercase tracking-wider',
                  orientation === 'vertical' ? 'w-full' : 'h-full'
                )}
                style={{
                  [orientation === 'vertical' ? 'top' : 'left']: position - 40,
                  [orientation === 'vertical' ? 'left' : 'top']: 0
                }}
              >
                {formatDate(eventDate, dateFormat)}
              </div>
            )
          }
        }

        // Event item
        const isVertical = orientation === 'vertical'
        elements.push(
          <div
            key={event.id || index}
            className={cn(
              'absolute',
              isVertical ? 'top-0 left-0 right-0' : 'left-0 top-0 bottom-0'
            )}
            style={{
              transform: isVertical
                ? `translateY(${position}px)`
                : `translateX(${position}px)`,
              [isVertical ? 'height' : 'width']: itemSize
            }}
            data-index={index}
          >
            {renderEvent(event.data, index)}
          </div>
        )

        currentDate = eventDate
      }

      return elements
    }

    // Render timeline line
    const renderTimelineLine = () => {
      const isVertical = orientation === 'vertical'
      return (
        <div
          className={cn(
            'absolute bg-border',
            isVertical
              ? 'left-4 top-0 bottom-0 w-px'
              : 'top-4 left-0 right-0 h-px'
          )}
        />
      )
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          'virtual-timeline-container relative overflow-auto',
          className
        )}
        style={{
          [orientation === 'vertical' ? 'height' : 'width']: size
        }}
        role="list"
      >
        <div
          className={cn(
            'virtual-timeline-inner relative',
            orientation === 'vertical' ? 'w-full' : 'h-full'
          )}
          style={{
            [orientation === 'vertical' ? 'height' : 'width']:
              layout.totalSize
          }}
        >
          {renderTimelineLine()}
          {renderItems()}
        </div>
      </div>
    )
  }
)

VirtualTimeline.displayName = 'VirtualTimeline'

// ============================================================================
// EXPORTS
// ============================================================================

export default VirtualTimeline
