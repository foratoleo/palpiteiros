# Design Document: Market Thumbnails

Architecture and design decisions for adding market thumbnail images to cards.

## Table of Contents
1. [Current State Analysis](#current-state-analysis)
2. [Proposed Design](#proposed-design)
3. [Component Architecture](#component-architecture)
4. [Performance Strategy](#performance-strategy)
5. [Accessibility Considerations](#accessibility-considerations)
6. [Responsive Behavior](#responsive-behavior)
7. [Error Handling](#error-handling)

---

## Current State Analysis

### Existing Image Support

**Component:** `MarketCard` (`src/components/market/market-card.tsx`)

Current implementation:
```tsx
export const MarketCard = ({
  showImage = false,  // ← Currently DISABLED by default
  enableProgressiveImage = true,
  imageLoadingEffect = 'blur-up'
}) => {
  // Lines 93-110: Placeholder generation
  const getImageUrl = () => {
    if (market.image_url) return market.image_url
    // Fallback: gradient SVG
    return `data:image/svg+xml;base64,...`
  }
}
```

**Key Findings:**
- ✅ Image loading infrastructure already exists
- ✅ Progressive image loading supported
- ✅ Blur-up effect implemented
- ✅ Fallback placeholder implemented
- ❌ Layout is vertical (image above text)
- ❌ Default is disabled (`showImage = false`)

### Data Flow

```
Gamma API (imageUrl)
       ↓
gamma.service.ts (transformation)
       ↓
Market.image_url (DB)
       ↓
MarketCard component (display)
```

**Issue:** Transformation needs verification

---

## Proposed Design

### Visual Design

**Based on:** Polymarket.com market cards

**Layout Pattern:**
```
┌────────────────────────────────────────────────────┐
│  Title text that can wrap to  ┌────────┐           │
│  multiple lines as needed     │ 48x48  │           │
│  when image is on the right   │ IMG    │           │
│                               └────────┘           │
│  Metadata (price, volume)                          │
│  Actions (favorite, trade)                         │
└────────────────────────────────────────────────────┘
```

**Dimensions:**
- Thumbnail: **48x48px** (compact square)
- Border-radius: **8px** (lg)
- Gap (text ↔ image): **12px** (gap-3)
- Container: Full width with flex

**Why 48x48px?**
- Large enough to be visible and meaningful
- Small enough to not overpower content
- Matches mobile touch target size (44px minimum)
- Balances detail vs space efficiency

---

## Component Architecture

### Component Structure

```
MarketCard
├── CardHeader (NEW LAYOUT)
│   ├── Title Section (flex-1)
│   │   ├── Category Badge (optional)
│   │   └── Question Text (line-clamp-2)
│   └── Thumbnail (shrink-0)
│       └── Image (48x48) + Fallback
├── CardBody (unchanged)
│   ├── Description
│   └── Metadata
└── CardFooter (unchanged)
    ├── Price
    ├── Actions
    └── Status Badge
```

### Props Interface

```typescript
export interface MarketCardProps {
  // Existing props
  market: Market
  variant?: 'default' | 'compact' | 'detailed'
  showPrice?: boolean
  showVolume?: boolean
  showLiquidity?: boolean
  onClick?: (market: Market) => void
  className?: string

  // Image props (CHANGED DEFAULT)
  showImage?: boolean          // ✏️ Change default: false → true
  enableProgressiveImage?: boolean
  imageLoadingEffect?: 'blur-up' | 'fade-in'
}
```

### Breaking Changes

**None** - This is a purely additive change:
- Default behavior changes, but no API changes
- Existing `showImage={false}` calls still work
- Backward compatible

---

## Performance Strategy

### Image Optimization

**Using Next.js Image:**
```tsx
import Image from 'next/image'

<Image
  src={imageUrl}
  alt=""
  width={48}
  height={48}
  className="w-full h-full object-cover"
  loading="lazy"  // ← Defer offscreen images
/>
```

**Performance Benefits:**
- ✅ Automatic WebP/AVIF conversion
- ✅ Responsive srcset generation
- ✅ Lazy loading built-in
- ✅ Blur placeholder during load

### Caching Strategy

**CDN:** Images from Polymarket API
- Already on fast CDN
- Cache headers: public, max-age=31536000 (1 year)

**Local:** Next.js Image Cache
- Filesystem cache in `.next/cache/images`
- In-memory cache during dev

### Progressive Loading

**Current Implementation (Keep):**
1. Show skeleton immediately
2. Load image in background
3. Blur-up effect when loaded
4. Replace skeleton with image

**Perceived Performance:** ⚡ Fast even on slow networks

---

## Accessibility Considerations

### ARIA Attributes

```tsx
<div
  role="img"
  aria-label={`Market image for ${market.question}`}
  className="w-12 h-12 ..."
>
  <img
    src={imageUrl}
    alt=""  ← Decorative, document in parent
    loading="lazy"
  />
</div>
```

**Rationale:**
- `alt=""` on img because parent div has description
- `role="img"` indicates image container
- `aria-label` provides context for screen readers

### Focus States

If thumbnail becomes interactive (future):
```tsx
<button
  className="focus:ring-2 focus:ring-primary focus:ring-offset-2"
  aria-label="View market details"
>
  <img src={imageUrl} alt="" />
</button>
```

### Color Contrast

**Border:** `border-border/50` (subtle)
- Sufficient contrast in both light/dark modes
- Not purely decorative, provides visual boundary

---

## Responsive Behavior

### Breakpoints

**Desktop (>768px):**
```tsx
<div className="flex gap-3 items-start">
  <div className="flex-1">{title}</div>
  <div className="w-12 h-12">{image}</div>
</div>
```

**Tablet (768px - 1024px):**
- Same as desktop
- Gap can reduce to 8px if needed: `gap-2`

**Mobile (<768px):**
```
Option A: Keep horizontal (PREFERRED)
┌──────────────────────┐
│ Title text... [IMG] │
└──────────────────────┘

Option B: Stack vertical
┌──────────────────────┐
│ [IMG]                 │
│ Title text...         │
└──────────────────────┘
```

**Recommendation:** Option A (horizontal) works well on most phones

### Testing Viewports

- **Desktop:** 1920x1080, 1366x768
- **Tablet:** 1024x768, 768x1024
- **Mobile:** 375x667 (iPhone SE), 414x896 (iPhone XR)

---

## Error Handling

### Image Load Failure

**Problem:** URL returns 404 or network error

**Solution:** Error boundary + fallback
```tsx
const [imageError, setImageError] = React.useState(false)

if (imageError || !market.image_url) {
  return <FallbackSVG />
}

return (
  <img
    src={imageUrl}
    onError={() => setImageError(true)}
  />
)
```

### Null/Undefined image_url

**Current:** Handled by `getImageUrl()` fallback
```tsx
const getImageUrl = () => {
  if (market.image_url) return market.image_url
  return generateGradientSVG()  // ← Fallback
}
```

**Verification Needed:** Ensure this is called in all code paths

### Loading Timeout

**Problem:** Slow image load (>3 seconds)

**Solution:** Progressive loading
1. Show skeleton immediately
2. Timeout after 3s → show fallback
3. Continue loading in background
4. Replace when ready (optional)

---

## Design Tokens

### Tailwind Classes

```tsx
// Container
<div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/50">
  {/* w-12 = 48px, h-12 = 48px */}
  {/* shrink-0 = don't compress in flex */}
  {/* rounded-lg = border-radius 8px */}
  {/* border-border/50 = subtle border */}
</div>

// Image
<img className="w-full h-full object-cover" />
  {/* object-cover = cover area, crop if needed */}
```

### Custom CSS Variables (if needed)

```css
.market-thumbnail {
  width: var(--thumbnail-size, 48px);
  height: var(--thumbnail-size, 48px);
  border-radius: var(--radius-lg, 8px);
}
```

---

## Cross-Component Consistency

### Components to Update

1. **MarketCard** (`src/components/market/market-card.tsx`)
   - Primary implementation
   - Reference for other components

2. **BreakingMarketCard** (`src/components/breaking/breaking-market-card.tsx`)
   - Match MarketCard layout
   - Same thumbnail size (48x48px)

3. **MarketListItem** (if exists)
   - Compact variant
   - Maybe smaller thumbnail (40x40px)?

### Design System Integration

**Existing Components:**
- ✅ `BlurUpLoader` - already used
- ✅ `SkeletonImage` - already used
- ✅ `Card` component - compatible

**No new components needed** - leverages existing infrastructure

---

## Migration Path

### Phase 1: Verify Backend (Task 1)
- Confirm imageUrl mapping works
- Test with real data

### Phase 2: Update Components (Tasks 2-4)
- MarketCard first (reference implementation)
- Then MarketList
- Then BreakingMarketCard

### Phase 3: Testing (Task 5)
- E2E tests
- Manual QA
- Performance audit

### Rollback Strategy
If issues detected:
1. Revert `showImage` default to `false`
2. Remove thumbnail sections
3. Single-line revert per component
4. Low risk

---

## Future Enhancements

### Potential Improvements (Out of Scope)

1. **Interactive Thumbnails**
   - Click to view full image
   - Zoom on hover
   - Lightbox gallery

2. **Dynamic Image Sizing**
   - Larger on hover
   - Smaller on mobile (40x40px)

3. **Smart Cropping**
   - AI-based focal point detection
   - Face detection for markets with people

4. **Video Thumbnails**
   - Animated previews for active markets
   - GIF format for highlights

### Extensibility

The current design supports future enhancements:
- Container size is configurable via props
- Image component can be swapped
- Layout pattern reusable across features

---

## Alternatives Considered

### Alternative 1: Use `icon` field

**Pros:**
- Smaller file size
- Optimized for thumbnails

**Cons:**
- May not exist for all markets
- Lower resolution

**Decision:** ❌ Use `image` field instead

### Alternative 2: Larger Thumbnail (64x64)

**Pros:**
- More detail visible
- Better for photos of people/events

**Cons:**
- Takes more space
- Can overpower text content

**Decision:** ❌ 48x48px is optimal balance

### Alternative 3: Square Crop Always

**Pros:**
- Consistent visual presentation
- Easier to implement

**Cons:**
- May crop important parts of image
- Loses context for rectangular images

**Decision:** ✅ Square crop is fine for thumbnails

---

## References

- Polymarket: https://polymarket.com
- Context7: `/llmstxt/polymarket_llms_txt`
- Current MarketCard: `src/components/market/market-card.tsx:51-402`
- Gamma Types: `src/types/gamma.types.ts:17-72`
