# Breaking Markets Components

Components for displaying breaking markets with significant price movements, volume changes, or volatility.

## Components

### BreakingMarketCard

Main card component for displaying breaking markets.

```tsx
import { BreakingMarketCard } from '@/components/breaking'

<BreakingMarketCard
  market={breakingMarket}
  rank={1}
  showPreviousPrice
  onClick={() => router.push(`/markets/${market.id}`)}
/>
```

**Props:**
- `market: BreakingMarket` - Breaking market data to display
- `rank: number` - Rank in breaking markets list (1 = highest movement)
- `onClick?: () => void` - Click handler for navigation/selection
- `showPreviousPrice?: boolean` - Show both current and previous prices
- `className?: string` - Additional CSS class names

**Features:**
- Glassmorphism card with backdrop blur
- Rank badge (gold for 1-3, silver for 4-10, gray for 11+)
- Market image thumbnail
- Question and category tags
- Current price → Previous price display
- Mini sparkline chart (24h history)
- Volume change indicator
- Movement trend arrow
- Hover effects (scale + shadow)
- Flash animation on price updates

### BreakingRankBadge

Circular badge displaying the market's rank.

```tsx
import { BreakingRankBadge } from '@/components/breaking'

<BreakingRankBadge rank={1} size="md" />
<BreakingRankBadge rank={7} size="sm" variant="inline" />
```

**Props:**
- `rank: number` - Rank number (1 = highest movement)
- `size?: 'sm' | 'md' | 'lg'` - Badge size variant
- `className?: string` - Additional CSS class names
- `variant?: 'absolute' | 'inline'` - Position variant

**Features:**
- Gold gradient for ranks 1-3
- Silver gradient for ranks 4-10
- Gray gradient for ranks 11+
- Subtle glow effect
- Smooth animations

### MovementIndicator

Visual indicator showing price trend direction.

```tsx
import { MovementIndicator } from '@/components/breaking'

<MovementIndicator
  currentPrice={0.65}
  previousPrice={0.50}
  showPercentage
  size={16}
/>
```

**Props:**
- `currentPrice: number` - Current price (0-1)
- `previousPrice: number` - Previous price (0-1)
- `showPercentage?: boolean` - Show percentage change alongside arrow
- `size?: number` - Size of the icon
- `className?: string` - Additional CSS class names

**Features:**
- Animated arrow icons (trending-up/down/flat)
- Color-coded by direction (green/red/gray)
- Optional percentage display
- Smooth animation on value changes

### MiniSparkline

Small SVG sparkline chart showing price history.

```tsx
import { MiniSparkline } from '@/components/breaking'

<MiniSparkline
  data={[0.45, 0.48, 0.52, 0.50, 0.55, 0.60, 0.58]}
  color="#22c55e"
  height={40}
/>
```

**Props:**
- `data: number[]` - Price history data points (array of numbers 0-1)
- `width?: number` - Width of the chart in pixels (responsive by default)
- `height?: number` - Height of the chart in pixels (default: 40)
- `color?: string` - Line color (CSS color value)
- `className?: string` - Additional CSS class names

**Features:**
- Smooth Bezier curve interpolation
- Gradient fill under the line
- Responsive width, fixed height
- Auto-scales to data range
- Shows last 24h price trajectory

## Usage Example

```tsx
'use client'

import { BreakingMarketCard } from '@/components/breaking'
import type { BreakingMarket } from '@/types/breaking.types'

export function BreakingMarketsList({ markets }: { markets: BreakingMarket[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {markets.map((market) => (
        <BreakingMarketCard
          key={market.id}
          market={market}
          rank={market.rank}
          showPreviousPrice
        />
      ))}
    </div>
  )
}
```

## Design System

These components follow the Apple-inspired glassmorphism design system used throughout the application:

- **Glassmorphism**: `bg-glass-light backdrop-blur-md border-glass-border`
- **Hover effects**: `hover:shadow-lg hover:scale-[1.02] transition-all duration-200`
- **Price change**: `bg-gradient-to-r bg-clip-text text-transparent`
- **Responsive**: `w-full md:w-[400px]`
- **Accessibility**: Keyboard navigation, ARIA labels, semantic HTML

## Animations

Components use Framer Motion for smooth animations:

- Spring animations on mount
- Hover scale effects
- Flash animation on price updates
- Smooth transitions between states

Animation timing follows Apple's design tokens:
- `duration-200`: 200ms (default transitions)
- `ease-apple`: `cubic-bezier(0.25, 0.1, 0.25, 1)`
