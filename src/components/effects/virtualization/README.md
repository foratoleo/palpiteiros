# Virtual Scrolling Documentation

## Overview

This document provides guidelines for implementing virtual scrolling in the application. Virtual scrolling only renders visible items, providing O(1) render complexity regardless of dataset size.

## Components

### Virtual Grid (`virtual-grid.tsx`)

Virtualized grid layout for efficient rendering of large datasets in a grid format.

#### Features
- Fixed or dynamic column layouts
- Configurable item sizes and gaps
- Smooth scrolling with RAF updates
- Overscan for smooth scrolling
- Keyboard navigation support

#### Usage

```tsx
import { VirtualGrid } from '@/components/effects/virtualization/virtual-grid'

<VirtualGrid
  items={markets}
  renderItem={(market) => <MarketCard market={market} />}
  itemHeight={200}
  columnCount={3}
  gap={16}
  height={600}
  onVisibleRangeChange={(start, end) => {
    console.log(`Visible: ${start} - ${end}`)
  }}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | - | Array of items to render |
| `renderItem` | `(item, index) => ReactNode` | - | Render function |
| `itemHeight` | `number` | - | Height of each item in pixels |
| `columnCount` | `number` | - | Number of columns |
| `gap` | `number` | `0` | Gap between items |
| `height` | `number` | `600` | Container height |
| `overscan` | `number` | `3` | Items to render outside viewport |

### Virtual Timeline (`virtual-timeline.tsx`)

Virtualized timeline for chronological data display.

#### Features
- Horizontal or vertical orientation
- Date-based grouping
- Scroll to date functionality
- Date markers

#### Usage

```tsx
import { VirtualTimeline } from '@/components/effects/virtualization/virtual-timeline'

<VirtualTimeline
  events={events}
  renderEvent={(event) => <EventCard event={event} />}
  getDate={(event) => new Date(event.timestamp)}
  orientation="vertical"
  itemSize={80}
  size={600}
/>
```

### Dynamic Sizing (`dynamic-sizing.ts`)

Utilities for supporting dynamic item heights in virtualized lists.

#### Features
- Measure items on mount
- Cache measurements
- Handle resize events
- Estimated position calculation

#### Usage

```tsx
import { useDynamicSizing } from '@/components/effects/virtualization/dynamic-sizing'

function VirtualList() {
  const { getSize, setSize, getPosition, getTotalSize } = useDynamicSizing({
    estimatedItemHeight: 50,
    itemCount: 1000,
    onMeasurementChange: (index, size) => {
      console.log(`Item ${index} measured: ${size}px`)
    }
  })

  // ...
}
```

#### Hooks

- `useDynamicSizing` - Main sizing hook for virtualization
- `useDynamicMeasurement` - Measure individual items
- `useDynamicRange` - Calculate visible range with dynamic sizing

### Infinite Scroll (`infinite-scroll.tsx`)

Infinite scroll with automatic pagination.

#### Features
- Automatic load trigger
- Configurable threshold
- Loading and error states
- Request deduplication

#### Usage

```tsx
import { InfiniteScroll } from '@/components/effects/virtualization/infinite-scroll'

<InfiniteScroll
  items={markets}
  renderItem={(market) => <MarketCard market={market} />}
  onLoadMore={loadNextPage}
  hasMore={hasMorePages}
  isLoading={isLoading}
  threshold={200}
/>
```

#### Virtualized Variant

```tsx
import { VirtualizedInfiniteScroll } from '@/components/effects/virtualization/infinite-scroll'

<VirtualizedInfiniteScroll
  items={markets}
  renderItem={(market) => <MarketCard market={market} />}
  onLoadMore={loadNextPage}
  hasMore={hasMorePages}
  itemHeight={200}
  containerHeight={600}
/>
```

## Performance Best Practices

### 1. Use Stable Keys

Always provide stable, unique keys for items:

```tsx
// Good - stable ID
getKey={(market) => market.id}

// Bad - index
getKey={(market, index) => index}
```

### 2. Optimize Item Size

Provide accurate item sizes to minimize recalculations:

```tsx
// Measure actual size first
const measuredSize = measureItemHeight()
<VirtualGrid itemHeight={measuredSize} />
```

### 3. Adjust Overscan

Balance between smoothness and performance:

- Default: `3` items
- Smooth scrolling: `5-10` items
- Maximum performance: `1-2` items

### 4. Debounce Resize Handlers

The components include built-in debounce for resize events. Ensure your custom resize handlers also debounce.

### 5. Avoid Inline Functions

Define render functions outside component or use `useCallback`:

```tsx
// Good
const renderItem = useCallback((market) => (
  <MarketCard market={market} />
), [])

// Bad
renderItem={(market) => <MarketCard market={market} />}
```

## Accessibility

### Keyboard Navigation

All virtual scrolling components support keyboard navigation:

- Arrow keys: Navigate items
- Page Up/Down: Navigate by page
- Home/End: Jump to start/end

### ARIA Attributes

Components include appropriate ARIA attributes:

- `role="grid"` for grids
- `role="list"` for lists
- `aria-rowcount`, `aria-colcount` for position

### Reduced Motion

Components respect `prefers-reduced-motion`:

```tsx
<VirtualGrid respectReducedMotion={true} />
```

## Troubleshooting

### Items Not Appearing

Check that:
1. `itemHeight` is accurate
2. Container has explicit height
3. Items have unique keys

### Janky Scrolling

- Reduce `overscan` value
- Check for heavy renders in `renderItem`
- Profile with React DevTools

### Memory Issues

- Ensure items are properly unmounted
- Check for closure leaks in `renderItem`
- Limit total items loaded

## API Reference

### VirtualGrid

```tsx
interface VirtualGridRef {
  scrollToItem: (index: number, align?: 'start' | 'center' | 'end') => void
  getScrollPosition: () => number
  resetScroll: () => void
}
```

### VirtualTimeline

```tsx
interface VirtualTimelineRef {
  scrollToDate: (date: Date, align?: 'start' | 'center' | 'end') => void
  scrollToEvent: (index: number, align?: 'start' | 'center' | 'end') => void
  getScrollPosition: () => number
}
```

### InfiniteScroll

```tsx
interface InfiniteScrollRef {
  loadMore: () => void
  reset: () => void
  getScrollPosition: () => number
}
```

### Dynamic Sizing

```tsx
interface DynamicSizingResult {
  getSize: (index: number) => number
  setSize: (index: number, size: number) => void
  getPosition: (index: number) => ItemPosition
  setPosition: (index: number, position: number) => void
  getTotalSize: () => number
  reset: () => void
  getAllPositions: () => Map<number, ItemPosition>
  recalculatePositions: () => void
}
```
