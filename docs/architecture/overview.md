# Architecture Overview

This document describes the overall architecture of Palpiteiros v2.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Next.js 15                           │
│                    (App Router + RSC)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │   Server      │  │   Client      │  │   Edge         │  │
│  │   Components  │  │   Components  │  │   Functions    │  │
│  └───────┬───────┘  └───────┬───────┘  └───────────────┘  │
│          │                  │                               │
│  ┌───────▼──────────────────▼───────┐                      │
│  │       TanStack Query (v5)        │                      │
│  │    (Server State Management)     │                      │
│  └───────┬──────────────────┬───────┘                      │
│          │                  │                               │
│  ┌───────▼───────┐  ┌──────▼──────┐                       │
│  │  Supabase     │  │  Gamma API  │                       │
│  │  (PostgreSQL) │  │ (Polymarket)│                       │
│  └───────────────┘  └─────────────┘                       │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      Client State                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │  Zustand    │  │  React      │  │  URL        │        │
│  │  Stores     │  │  Hook Form  │  │  Search     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘        │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### Server-Side Data Flow

1. **Request** - User navigates to a page
2. **Server Component** - Fetches initial data from Supabase/Gamma API
3. **Render** - Page renders with server data
4. **Hydration** - React hydrates the client
5. **TanStack Query** - Takes over for subsequent data fetching

### Client-Side Data Flow

1. **User Action** - User interacts with UI
2. **Optimistic Update** - Zustand updates UI immediately
3. **Mutation** - TanStack Query sends request to API
4. **Invalidation** - Queries refetch affected data
5. **Real-time** - Supabase subscriptions push updates

## Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main application routes
│   ├── layout.tsx         # Root layout
│   └── providers.tsx      # App-wide providers
│
├── components/            # React components
│   ├── ui/               # Base UI components (Shadcn/UI)
│   ├── market/           # Market components
│   ├── portfolio/        # Portfolio components
│   ├── alerts/           # Alert components
│   ├── charts/           # Chart components
│   ├── search/           # Search/filter components
│   ├── effects/          # Animation effects
│   ├── errors/           # Error handling
│   └── layout/           # Layout components
│
├── hooks/                # Custom React hooks
│   ├── use-market.ts     # Market data hooks
│   ├── use-markets.ts    # Market list hooks
│   ├── use-portfolio.ts  # Portfolio hooks
│   └── use-*.ts          # Other hooks
│
├── stores/               # Zustand stores
│   ├── market.store.ts   # Market state
│   ├── portfolio.store.ts # Portfolio state
│   ├── ui.store.ts       # UI state
│   ├── alert.store.ts    # Alert state
│   └── user.store.ts     # User state
│
├── services/             # API services
│   ├── supabase.service.ts  # Supabase client
│   └── gamma.service.ts     # Gamma API client
│
├── types/                # TypeScript types
│   ├── market.types.ts   # Market types
│   ├── portfolio.types.ts # Portfolio types
│   ├── alert.types.ts    # Alert types
│   └── ui.types.ts       # UI types
│
└── lib/                  # Utilities
    ├── query-client.ts   # TanStack Query setup
    ├── query-keys.ts     # Query key factory
    ├── utils.ts          # General utilities
    └── theme.ts          # Theme utilities
```

## Component Architecture

### Component Patterns

1. **Server Components** - For static content and data fetching
   - Used for pages and layouts
   - Can't use hooks or event handlers
   - Reduce client JavaScript

2. **Client Components** - For interactive features
   - Marked with `'use client'`
   - Can use hooks and event handlers
   - Used for forms, modals, charts

3. **Compound Components** - For complex UI
   - Example: Dialog, Dropdown, Select
   - Share state via context
   - Flexible composition

### Example: Server + Client Pattern

```typescript
// Server Component (page.tsx)
async function MarketsPage() {
  const markets = await fetchMarkets() // Server-side fetch

  return (
    <div>
      <h1>Markets</h1>
      <MarketsList initialMarkets={markets} /> {/* Client component */}
    </div>
  )
}

// Client Component (MarketsList.tsx)
'use client'

export function MarketsList({ initialMarkets }: { initialMarkets: Market[] }) {
  const { markets, isLoading } = useMarkets({
    initialData: initialMarkets
  })

  // Interactive features...
}
```

## State Management Strategy

| State Type | Solution | Example |
|------------|----------|---------|
| Server Data | TanStack Query | Markets, portfolios, prices |
| Client State | Zustand | Filters, UI preferences, toasts |
| Form State | React Hook Form | Alert creation, settings |
| URL State | Next.js searchParams | Search, pagination, filters |
| Transient | React useState | Modal open/close, form inputs |

## Data Fetching Patterns

### TanStack Query Setup

```typescript
// lib/query-client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,      // 1 minute
      gcTime: 5 * 60 * 1000,     // 5 minutes
      retry: 3,
      refetchOnWindowFocus: false
    }
  }
})
```

### Query Key Factory

```typescript
// lib/query-keys.ts
export const marketKeys = {
  all: ['markets'] as const,
  lists: () => [...marketKeys.all, 'list'] as const,
  list: (filters: MarketFilterOptions) =>
    [...marketKeys.lists(), filters] as const,
  details: () => [...marketKeys.all, 'detail'] as const,
  detail: (id: string) =>
    [...marketKeys.details(), id] as const,
}
```

### Hook Pattern

```typescript
export function useMarket(id: string) {
  return useQuery({
    queryKey: marketKeys.detail(id),
    queryFn: () => fetchMarket(id),
    enabled: !!id,
    staleTime: 30 * 1000 // 30 seconds
  })
}
```

## Real-time Updates

### Supabase Subscriptions

```typescript
// In a component or hook
useEffect(() => {
  const channel = supabase
    .channel('market-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'market_prices'
      },
      (payload) => {
        queryClient.setQueryData(
          marketKeys.detail(payload.new.market_id),
          (old: Market) => ({
            ...old,
            current_price: payload.new.price
          })
        )
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [])
```

## Performance Optimizations

1. **Code Splitting** - Dynamic imports for heavy components
2. **Virtual Scrolling** - react-window for long lists
3. **Image Optimization** - Next.js Image with blur placeholders
4. **Memoization** - React.memo for expensive components
5. **Debouncing** - useDebounce for search inputs
6. **Throttling** - RAF throttling for scroll handlers
7. **Bundle Size** - Tree-shaking with ES modules

## Security Considerations

1. **RLS Policies** - Supabase Row Level Security for data access
2. **API Keys** - Server-side for secret keys
3. **XSS Protection** - React's automatic escaping
4. **CSRF Protection** - Next.js built-in protection
5. **CORS** - Configured for allowed origins
6. **Rate Limiting** - Supabase and API rate limits

## Deployment

### Build Process

1. `next build` - Production build
2. Static generation - Pre-rendered pages
3. Server components - Reduced JS bundle
4. Edge functions - For API routes

### Hosting

- **Vercel** - Recommended for Next.js
- **Environment Variables** - Configured in dashboard
- **Database** - Supabase (hosted PostgreSQL)
- **CDN** - Vercel Edge Network

### Monitoring

- **Vercel Analytics** - Performance monitoring
- **Supabase Logs** - Database activity
- **Sentry** (optional) - Error tracking
