# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Palpiteiros v2 is a modern prediction markets interface built with Next.js 15, React 18, and Polymarket's Gamma API. The project features real-time market data, portfolio management, price alerts, and an Apple-inspired glassmorphism design.

**Tech Stack**: Next.js 15 (App Router), React 18.3, TypeScript 5, TanStack Query v5, Zustand, Supabase, TailwindCSS 3, Framer Motion, Recharts

## Development Commands

### Essential Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server (http://localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | Run ESLint |
| `npm run type-check` | TypeScript type checking (run before commits) |
| `npm run analyze` | Bundle analysis (ANALYZE=true next build) |

### Testing Commands

| Command | Purpose |
|---------|---------|
| `npm run test` | Run Vitest unit tests |
| `npm run test:watch` | Watch mode for unit tests |
| `npm run test:coverage` | Generate coverage report |
| `npm run test:ui` | Vitest UI mode |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | E2E tests with UI |
| `npm run test:e2e:debug` | Debug E2E tests |

### Single Test Execution

```bash
# Unit test specific file
npx vitest src/components/ui/Button.test.ts

# E2E test specific file
npx playwright test e2e/markets.spec.ts
```

## Architecture

### State Management Strategy

The application uses a hybrid state management approach:

| State Type | Solution | Example |
|------------|----------|---------|
| Server State | TanStack Query | Market data, portfolios, prices |
| Client State | Zustand | Filters, UI preferences, view modes |
| Form State | React Hook Form | Alert creation, settings |
| URL State | Next.js searchParams | Search, pagination |

**Key Pattern**: Server state (TanStack Query) is the source of truth for data. Client state (Zustand) manages only transient UI state and user preferences.

### Directory Structure

```
src/
├── app/                 # Next.js App Router (Server Components by default)
│   ├── (main)/         # Route groups for shared layouts
│   ├── layout.tsx      # Root layout with providers
│   └── providers.tsx   # App-level providers (QueryClient, Theme, Supabase)
├── components/
│   ├── ui/            # Shadcn/UI base components (unstyled primitives)
│   ├── market/        # Market-specific components
│   ├── portfolio/     # Portfolio components
│   ├── alerts/        # Alert system components
│   ├── charts/        # Recharts wrappers
│   └── effects/       # Animation/3D effects (Framer Motion, Three.js)
├── hooks/             # Custom React hooks (useQuery wrappers, utilities)
├── stores/            # Zustand stores (market, portfolio, ui, alert, user)
├── services/          # API services (gamma.service.ts, supabase.service.ts)
├── types/             # TypeScript definitions (generated + manual)
├── lib/               # Utilities (query-client.ts, design-tokens.ts, utils.ts)
└── config/            # Configuration (supabase.ts)
```

### Data Flow Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Gamma API      │────▶│  Supabase Edge   │────▶│  TanStack Query │
│  (Polymarket)   │     │  Functions       │     │  (Server State) │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Supabase DB    │◀────│  Real-time Subs  │────▶│  Components     │
│  (User Data)    │     │  (Supabase)      │     │  (React)        │
└─────────────────┘     └──────────────────┘     └────────┬────────┘
                                                          │
                                                          ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Zustand Stores │◀────│  User Actions    │────▶│  UI Updates     │
│  (Client State) │     │  (Filters, Sort) │     │  (Re-render)    │
└─────────────────┘     └──────────────────┘     └─────────────────┘
```

### Component Architecture

**Server Components**: Used for static content, initial data fetching, and SEO-critical pages
- Pages in `app/(main)/*` are Server Components by default
- Use `supabase.service.ts` for server-side data fetching

**Client Components**: Used for interactive features
- All components in `components/` use `"use client"` directive
- Use TanStack Query hooks for data fetching
- Use Zustand stores for client state

**Component Patterns**:
- **Compound Components**: Dialog, Dropdown, Select (Radix UI primitives)
- **Higher-Order Components**: ErrorBoundary, withTheme, withQueryClient
- **Render Props**: PriceChart, OrderBookVisual (data-driven components)

## Key Patterns & Conventions

### TanStack Query Patterns

**Query Keys**: Centralized in `src/lib/query-keys.ts`
```typescript
// Always use query keys constants
const { data } = useQuery({
  queryKey: queryKeys.markets.list(filters),
  queryFn: () => fetchMarkets(filters)
})
```

**Cache Times**: Defined in `src/lib/query-client.ts`
- Markets: 10 min GC, 5 min stale
- Prices: 5 min GC, 1 min stale (frequent updates)
- Portfolio: 2 min GC, 30 sec stale (user-specific)

**Invalidation Strategy**: Use helper functions
```typescript
import { invalidateQueries } from '@/lib/query-client'
await invalidateQueries('markets') // Invalidates all market queries
```

### Zustand Store Patterns

**Store Structure** (from `src/stores/market.store.ts`):
```typescript
// State interface + Actions interface
export interface MarketState { ... }
export interface MarketActions { ... }

// Middleware chain: devtools -> persist -> immer
export const useMarketStore = create<MarketState & MarketActions>()(
  devtools(persist(immer((set, get) => ({ ... })))))
)
```

**Selectors for Derived State**: Always use selectors for computed values
```typescript
// Good: Selector (memoized, efficient)
const filteredMarkets = useMarketStore(selectFilteredMarkets)

// Avoid: Direct computation in component
const markets = useMarketStore(state => state.markets.filter(...))
```

**Persistence**: Only persist UI state, not server data
```typescript
partialize: (state) => ({
  filters: state.filters,
  viewMode: state.viewMode,
  // NOT: markets (from server, use Query instead)
})
```

### Supabase Integration

**Client vs Admin**:
```typescript
import { supabase } from '@/config/supabase'          // Client-side (anon key)
import { getSupabaseAdmin } from '@/config/supabase'  // Server-side (service role)
```

**Real-time Subscriptions**: Use for live market updates
```typescript
const channel = supabase
  .channel('market-updates')
  .on('postgres_changes', { event: 'UPDATE', schema: 'public' }, payload => {
    useMarketStore.getState().upsertMarket(payload.new)
  })
  .subscribe()
```

**Edge Functions**: Gateway to Gamma API
- `sync-gamma-markets`: Syncs markets from Polymarket to Supabase
- Protected with service role key
- Use for server-to-server API calls

### Design System

**Apple + Material Fusion**: Design tokens in `src/lib/design-tokens.ts`

**Color System**: HSL format with CSS variables
```css
/* globals.css defines --primary, --background, etc. */
color: hsl(var(--primary)); /* Uses CSS variable from Tailwind config */
```

**Glassmorphism**: Built-in utility classes
```tsx
<div className="bg-glass-light backdrop-blur-md border-glass-border">
  {/* Content with glass effect */}
</div>
```

**Animation**: Framer Motion + custom easing
```tsx
import { motion } from 'framer-motion'
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }} // Apple easing
>
```

### Performance Optimizations (T17)

**Code Splitting**:
- Large libraries lazy-loaded: Recharts, Framer Motion, Three.js
- Route-based splitting: `app/(main)/*` automatic
- Use `dynamic()` from Next.js for heavy components

**Image Optimization**:
```tsx
import Image from 'next/image'
<Image src={src} width={400} height={300} placeholder="blur" />
```

**Bundle Budgets** (see `performance.config.json`):
- Main bundle: 200KB target
- React: 45KB target
- Vendor: 150KB target
- Recharts: 100KB (code split)

**Webpack Configuration**: Vendor chunking for better caching
```javascript
// next.config.ts splits: react, recharts, framer-motion, react-query, radix-ui
```

## Type Safety

### Generated Types

**Database Types** (`src/types/database.types.ts`):
- Generated from Supabase schema
- Run: `supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts`
- Use for type-safe Supabase queries

**Manual Types** (`src/types/*.types.ts`):
- `market.types.ts`: Market UI types, filters, sort options
- `portfolio.types.ts`: Position types, P&L calculations
- `alert.types.ts`: Alert conditions, notification types
- `gamma.types.ts`: Gamma API response shapes

### Type Guards & Validation

**Zod schemas**: Use for runtime validation (if needed)
```typescript
import { z } from 'zod'
const MarketSchema = z.object({
  id: z.string(),
  question: z.string(),
  current_price: z.number().min(0).max(1),
})
```

## Testing Strategy

### Unit Tests (Vitest)

**Test Location**: `src/**/__tests__/*.test.ts` or `src/**/*.test.ts`

**Setup** (`src/__tests__/setup.ts`):
- Configures Testing Library
- Mocks Supabase client
- Provides test utilities

**Coverage Thresholds** (vitest.config.ts):
- Lines: 80%
- Functions: 80%
- Branches: 75%

### E2E Tests (Playwright)

**Test Location**: `e2e/*.spec.ts`

**Configuration** (`playwright.config.ts`):
- Runs against dev server (localhost:3000)
- Tests on Chromium, Firefox, WebKit
- Mobile viewport tests included
- Reuses existing server in local dev

**Test Patterns**:
```typescript
test('user can browse markets', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('text=Markets')).toBeVisible()
  await page.click('[data-testid="market-card"]:first-child')
  await expect(page).toHaveURL(/\/markets\/[^/]+$/)
})
```

## Common Development Tasks

### Adding a New Market Filter

1. Update `MarketFilterOptions` type in `src/types/market.types.ts`
2. Add filter logic to `selectFilteredMarkets` in `src/stores/market.selectors.ts`
3. Update filter UI in `src/components/market/market-filters.tsx`

### Adding a New API Endpoint

1. Add function to `src/services/gamma.service.ts` (Gamma API) or `src/services/supabase.service.ts` (Supabase)
2. Create query key in `src/lib/query-keys.ts`
3. Create hook in `src/hooks/use-*.ts`
4. Use in component with `useQuery` or `useMutation`

### Adding a New UI Component

1. Create in `src/components/ui/` (base) or feature directory
2. Follow Shadcn/UI pattern: Radix UI primitive + Tailwind styles
3. Add props interface with JSDoc comments
4. Export from `src/components/index.ts` if reusable

### Updating Database Schema

1. Create migration in Supabase dashboard
2. Regenerate types: `supabase gen types typescript --project-id ID > src/types/database.types.ts`
3. Update RLS policies if needed
4. Update service functions in `src/services/supabase.service.ts`

## Error Handling

**Error Boundaries**: `src/components/errors/error-boundary.tsx`
- Wrap pages or sections that may throw
- Logs errors and shows fallback UI

**Toast Notifications**: `src/components/ui/toast.tsx`
- Use `useToast()` hook for user feedback
- Import from `@/components/ui/toast`

**API Errors**: TanStack Query handles automatically
- Retry logic configured in `src/lib/query-client.ts`
- Errors available in `useQuery` result

## Environment Variables

Create `.env.local` from `.env.example`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # Server-only

# Gamma API
NEXT_PUBLIC_GAMMA_API_URL=https://gamma-api.polymarket.com
```

## Build & Deployment

**Production Build**:
```bash
npm run build    # Type checks and builds
npm run start    # Starts production server
```

**Bundle Analysis**:
```bash
ANALYZE=true npm run build    # Generates bundle report
# Opens .next/analyze/*.html with bundle sizes
```

**Performance Monitoring**:
- Target Lighthouse scores: Performance 90+, Accessibility 95+, Best Practices 90+, SEO 95+
- Core Web Vitals thresholds in `performance.config.json`
