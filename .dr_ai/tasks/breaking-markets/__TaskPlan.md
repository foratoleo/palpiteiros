# Breaking Markets Feature - Task Plan

**Task Name**: breaking-markets
**Date**: 11/01/2026 21:10:58
**Git Branch**: feat/breaking-markets

## Task Objectives

Implement a "Breaking" section similar to Polymarket's breaking page (https://polymarket.com/breaking) that displays prediction markets with the most significant price movements within the last 24 hours. The feature will identify and rank markets based on price change percentage, volume spikes, and trend indicators, providing users with real-time insights into the most dynamic markets. This solves the user discovery problem by highlighting markets experiencing notable activity, enabling traders to quickly identify emerging opportunities and significant market shifts. The implementation leverages the existing codebase architecture including TanStack Query for server state management, Zustand for client-side filters, Supabase for data persistence and real-time updates, and the existing design system with Apple-inspired glassmorphism styling.

## Implementation Summary

The architecture follows a hybrid state management pattern: TanStack Query for server state (breaking markets data), Zustand for client-side UI state (filters, sort options), and Supabase real-time subscriptions for live updates. The data flow consists of: (1) Supabase Edge Functions fetch market data from Gamma API, (2) Price history is tracked in a new `market_price_history` table, (3) Movement calculations occur server-side via SQL functions, (4) Breaking markets API endpoint returns ranked results, (5) Frontend polls and subscribes to real-time updates. The Breaking page at `/breaking` will reuse existing components (MarketCard, MiniSparkline) with new variations for the breaking context. Database additions include a `market_price_history` table with indexes on timestamp and market_id for efficient 24-hour queries. Gamma API integration uses the existing `GammaService` class with new methods for fetching price history. The frontend uses Next.js 15 App Router with Server Components for initial data and Client Components for interactive features.

## UX/UI Details

The Breaking page features a two-column responsive layout: left sidebar for filtering (time range, minimum movement, volume threshold) and main content area for the breaking markets list. Each market card displays: (1) rank badge indicating position (1-50), (2) market question with category badge, (3) 24-hour price change percentage with color-coded trend indicator (green for positive, red for negative), (4) MiniSparkline chart showing price trajectory over 24 hours, (5) volume change indicator with sparkline, (6) current price with trade button. Visual hierarchy uses size and color to emphasize movement magnitude - larger percentage changes get more prominent styling. Hover effects expand the card slightly and show additional details. Loading states use skeleton cards matching the card layout. Error states display a retry option. Real-time updates highlight changed markets with a subtle flash animation and update price/sparkline without full re-render. The page uses infinite scroll with a "Load More" button after 20 items. Mobile view collapses filters into a bottom sheet/drawer. Accessibility includes keyboard navigation, ARIA labels for trend indicators, and reduced motion support.

## Tasks

### Task 1: Database Schema and SQL Functions
**Recommended Agent**: sql-query-specialist

**Files to create/change**:
- migration: supabase/migrations/002_add_breaking_markets.sql
- database types: src/types/database.types.ts (regenerate)

**Implementation**: Create a new `market_price_history` table to track price points with columns: id (uuid, PK), market_id (uuid, FK references markets.id), price_yes (decimal), price_no (decimal), volume (decimal), timestamp (timestamptz, default now()). Add indexes on (market_id, timestamp DESC) for efficient 24-hour range queries and (timestamp DESC) for global price point queries. Create a PostgreSQL function `calculate_market_movement(market_id uuid, hours int DEFAULT 24)` that returns movement metrics including price_change_percent (current vs oldest price in range), volume_change_percent, price_high_24h, price_low_24h, volatility_index (stddev of prices). Create a function `get_breaking_markets(limit int DEFAULT 50, min_price_change numeric DEFAULT 0.05, min_volume numeric DEFAULT 1000)` that returns markets ranked by a composite score (price_change_weight * 0.6 + volume_change_weight * 0.4). Set Row Level Security (RLS) policies: authenticated users can read, service role can insert/update. Add a trigger to automatically update `markets.price_change_24h` when new price history is inserted.

**Subtasks**:
- **Subtask 1.1**: Create the market_price_history table migration with all columns, indexes, and foreign key constraints. Use uuid_generate_v4() for default id values. Set timestamp to NOT NULL with default now(). Add CHECK constraint that price_yes and price_no are between 0 and 1. Create unique index on (market_id, timestamp) with granularity of 1 minute to prevent duplicate entries.
  - **Agent**: sql-query-specialist
- **Subtask 1.2**: Implement the calculate_market_movement SQL function using window functions for price range calculations. The function should handle edge cases where fewer than 2 data points exist (return null values). Use percentile_cont for percentile calculations and stddev_samp for volatility.
  - **Agent**: sql-query-specialist
- **Subtask 1.3**: Implement the get_breaking_markets function that joins markets with calculate_market_movement results, applies filters, and orders by composite score. Include a CTE for pre-calculating movements to avoid repeated function calls.
  - **Agent**: sql-query-specialist
- **Subtask 1.4**: Create the trigger function and trigger for automatic price_change_24h updates. The trigger should execute after insert on market_price_history and update the corresponding market row.
  - **Agent**: sql-query-specialist
- **Subtask 1.5**: Regenerate database types using Supabase CLI: `supabase gen types typescript --local > src/types/database.types.ts`. Verify the new MarketPriceHistory type is exported correctly.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Follow existing migration naming convention (001_, 002_, etc.)
- Use SQL comments for table/column descriptions
- Follow PostgreSQL naming conventions (snake_case)
- Include ON DELETE CASCADE for foreign keys
- Use `RETURNING *` for all INSERT/UPDATE operations
- Reference existing migration in supabase/migrations/001_initial_schema.sql for patterns

### Task 2: Supabase Edge Functions for Breaking Markets
**Recommended Agent**: supabase-edge-functions

**Files to create/change**:
- edge function: supabase/functions/sync-price-history/index.ts
- edge function: supabase/functions/get-breaking-markets/index.ts
- types: src/types/breaking.types.ts

**Implementation**: Create a sync-price-history edge function that fetches price data from Gamma API for active markets and inserts into market_price_history table. The function should: (1) Accept optional market_id parameter for single market sync or sync all if omitted, (2) Fetch current prices from Gamma API using existing gammaService.fetchMarkets({ active: true }), (3) Batch insert price points (up to 100 at a time), (4) Use service role key for elevated permissions, (5) Implement rate limiting (max 100 requests/minute), (6) Return success/error response. Create get-breaking-markets edge function that: (1) Accepts query parameters (limit, min_price_change, time_range_hours), (2) Validates and sanitizes inputs, (3) Calls get_breaking_markets SQL function, (4) Returns typed response with BreakingMarket[] array, (5) Implements caching with 30-second TTL. Create breaking.types.ts with BreakingMarket interface extending Market with breaking-specific fields: rank, movement_score, price_change_24h, volume_change_24h, price_high_24h, price_low_24h, volatility_index, trend ('up' | 'down' | 'neutral'), price_history_24h (PriceDataPoint[]). Also create BreakingFilters and BreakingSortOption interfaces.

**Subtasks**:
- **Subtask 2.1**: Create sync-price-history edge function skeleton with Denoserve handler setup, CORS headers configuration, and error handling wrapper. Implement authentication check for service role key.
  - **Agent**: supabase-edge-functions
- **Subtask 2.2**: Implement the core sync logic: fetch from Gamma API, transform to price history format, batch insert to database. Use Promise.all with batching for performance. Add logging for sync operations.
  - **Agent**: supabase-edge-functions
- **Subtask 2.3**: Create get-breaking-markets edge function with query parameter parsing, validation (limit max 100, time_range 1-168 hours), and SQL function invocation. Implement response caching using Supabase Edge Functions cache headers.
  - **Agent**: supabase-edge-functions
- **Subtask 2.4**: Create breaking.types.ts with all TypeScript interfaces. Export BreakingMarket, BreakingFilters (minPriceChange, maxPriceChange, minVolume, categories, timeRange), BreakingSortOption (field: 'movement_score' | 'price_change_24h' | 'volume_change_24h', direction), BreakingMarketResponse.
  - **Agent**: react-architect
- **Subtask 2.5**: Add edge function deployment script to package.json: `"deploy:edge-functions": "supabase functions deploy --project-ref YOUR_PROJECT_ID"`. Update README.md with edge function documentation.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Follow existing edge function patterns in supabase/functions/
- Use Deno standard library (no npm dependencies in edge functions)
- Implement proper error responses with { error: string, details?: unknown } format
- Use environment variables for sensitive data
- Reference gamma.service.ts for Gamma API integration patterns
- Follow existing error handling in src/services/supabase.service.ts

### Task 3: Breaking Markets Service Layer
**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- service: src/services/breaking.service.ts
- query keys: src/lib/query-keys.ts (add breakingKeys)

**Implementation**: Create breaking.service.ts with BreakingService class following the pattern of GammaService. The service should have methods: (1) getBreakingMarkets(filters: BreakingFilters, limit: number) - fetches from Supabase edge function, (2) getBreakingMarketById(marketId: string) - single market with full breaking data, (3) refreshBreakingData() - triggers price history sync, (4) subscribeToBreakingUpdates(callback) - real-time subscription. The service should implement caching with 30-second TTL for getBreakingMarkets. Add breakingKeys to query-keys.ts with hierarchy: all, lists(filters), detail(marketId), trending, timeRange(hours). Breaking-specific query keys should integrate with existing query invalidation patterns.

**Subtasks**:
- **Subtask 3.1**: Create BreakingService class with constructor accepting optional baseUrl and cache TTL. Implement private fetchWithTimeout method matching GammaService pattern. Add private cache Map with getFromCache/setCache methods.
  - **Agent**: nodejs-specialist
- **Subtask 3.2**: Implement getBreakingMarkets method: build URL with query params, fetch from edge function with timeout, handle errors, cache results, return typed BreakingMarket[]. Add getBreakingMarketById using the same pattern.
  - **Agent**: nodejs-specialist
- **Subtask 3.3**: Implement refreshBreakingData method that calls sync-price-history edge function. Add debounce logic to prevent excessive sync calls (max once per 30 seconds).
  - **Agent**: nodejs-specialist
- **Subtask 3.4**: Implement subscribeToBreakingUpdates method using Supabase real-time subscription to market_price_history table. The callback receives updated BreakingMarket data when prices change significantly (>1% change).
  - **Agent**: nodejs-specialist
- **Subtask 3.5**: Add breakingKeys object to query-keys.ts following existing marketKeys pattern. Include keys for: all (base), lists(filters), detail(id), trending, timeRange(hours). Export singleton breakingService instance.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Follow GammaService class pattern in src/services/gamma.service.ts
- Use async/await for all async operations
- Implement proper error types extending Error
- Add JSDoc comments for all public methods
- Reference src/lib/query-keys.ts for query key patterns
- Use service singleton pattern (export const breakingService = new BreakingService())

### Task 4: Breaking Markets Custom Hook
**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- hook: src/hooks/use-breaking-markets.ts
- query client: src/lib/query-client.ts (update for breaking queries)

**Implementation**: Create useBreakingMarkets hook following the pattern of useMarkets. The hook should: (1) Accept optional filters parameter of type BreakingFilters, (2) Use useQuery with breakingKeys.lists(filters) as query key, (3) Call breakingService.getBreakingMarkets as query function, (4) Configure staleTime to 30 seconds and gcTime to 5 minutes, (5) Return { data, isLoading, error, refetch } with proper typing. Also create useBreakingMarket(id: string) hook for single market with useQuery. Create useBreakingRealtime() hook using useQueryClient for manual mutations to update cache when real-time events arrive. Update query-client.ts to add breaking-specific query defaults if needed (retry logic for failed requests).

**Subtasks**:
- **Subtask 4.1**: Create useBreakingMarkets hook with useQuery hook from TanStack Query. Add generic type parameter for BreakingMarket[] return type. Configure query options with refetchOnWindowFocus: true for real-time feel.
  - **Agent**: react-hooks-specialist
- **Subtask 4.2**: Create useBreakingMarket(id: string) hook for fetching single breaking market. Use enabled: !!id to prevent unnecessary requests. Add select option to transform data if needed.
  - **Agent**: react-hooks-specialist
- **Subtask 4.3**: Create useBreakingRealtime() hook that sets up Supabase subscription to market_price_history table. On new price insert, calculate if change >1% and if so, invalidate relevant queries using queryClient.invalidateQueries.
  - **Agent**: react-hooks-specialist
- **Subtask 4.4**: Export all hooks from src/hooks/index.ts. Add JSDoc examples for each hook usage. Include proper error handling in each hook with useEffect to log errors.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Follow useMarkets hook pattern in src/hooks/useMarkets.ts
- Use queryKeys from breakingKeys for cache management
- Implement proper TypeScript typing for all return values
- Add JSDoc comments with usage examples
- Handle loading/error states consistently
- Reference src/lib/query-keys.ts for query key patterns

### Task 5: Breaking Markets Zustand Store
**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- store: src/stores/breaking.store.ts
- index: src/stores/index.ts (export new store)

**Implementation**: Create breaking.store.ts following market.store.ts pattern. The store should manage client-side state for: filters (BreakingFilters), sortOption (BreakingSortOption), viewMode (BreakingViewMode: 'grid' | 'list' | 'ranked'), timeRange (MarketTimeRange: '1h' | '6h' | '24h' | '7d'), autoRefresh (boolean), loading (boolean), error (string | null). Actions should include: setFilters, resetFilters, setSort, setTimeRange, toggleAutoRefresh, setLoading, setError, refresh. Use devtools + persist + immer middleware chain. Persist only filters, sortOption, viewMode, timeRange, autoRefresh (not the actual data). Create selectors: selectFilteredBreaking (filters and sorts data), selectTimeRangeMarkets (returns data for selected time range). Export useBreakingStore and selectors.

**Subtasks**:
- **Subtask 5.1**: Define BreakingState and BreakingActions interfaces following MarketState/MarketActions pattern. Add BreakingViewMode enum and BreakingFilterOptions type.
  - **Agent**: react-hooks-specialist
- **Subtask 5.2**: Create default filters object with sensible defaults: timeRange '24h', minPriceChange 0.05 (5%), autoRefresh true. Create initial state with all state properties.
  - **Agent**: react-hooks-specialist
- **Subtask 5.3**: Implement the store with create<BreakingState & BreakingActions>() using devtools(persist(immer(...))) middleware pattern. Implement all actions: setFilters merges with existing, resetFilters to defaults, setTimeRange triggers refetch, toggleAutoRefresh starts/stops interval.
  - **Agent**: react-hooks-specialist
- **Subtask 5.4**: Create selectors: selectFilteredBreaking applies filters/sorts to passed data, selectTimeRangeMarkets filters by time range, selectAutoRefreshState returns autoRefresh boolean. Use selector pattern for performance.
  - **Agent**: react-hooks-specialist
- **Subtask 5.5**: Export useBreakingStore and selectors from src/stores/index.ts. Add rehydrate handling for Set conversion if needed.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Follow market.store.ts structure exactly
- Use immer middleware for immutable updates
- Use devtools middleware with name 'BreakingStore'
- Persist only UI state (filters, view mode), not server data
- Create selectors for derived state
- Reference src/stores/market.store.ts for patterns

### Task 6: Breaking Market Card Component
**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/breaking/breaking-market-card.tsx
- component: src/components/breaking/breaking-rank-badge.tsx
- component: src/components/breaking/movement-indicator.tsx
- index: src/components/breaking/index.ts

**Implementation**: Create BreakingMarketCard component that extends MarketCard with breaking-specific features. The card should display: (1) Rank badge (1-50) with styling (gold for 1-3, silver for 4-10, bronze for 11-20), (2) Movement score with prominent styling, (3) Price change percentage with color-coded background (green gradient for positive, red for negative), (4) MiniSparkline showing 24h price history, (5) Volume change indicator with trend icon, (6) Market question, category badge, current price, trade button. Create BreakingRankBadge component that displays rank number with appropriate styling (crown icon for rank 1). Create MovementIndicator component that shows: trend icon (TrendingUp/TrendingDown), percentage with +/-, optional arrow animation for significant movements (>10%). All components should use glassmorphism design tokens from src/lib/design-tokens.ts, follow Apple animation patterns with Framer Motion, and support dark mode.

**Subtasks**:
- **Subtask 6.1**: Create BreakingMarketCard component with props: market (BreakingMarket), rank (number), variant ('breaking' | 'compact'). Set up base structure with Card component, motion wrapper for hover effects. Add rank badge positioning in top-right corner.
  - **Agent**: tailwind-specialist
- **Subtask 6.2**: Implement price change display with dynamic background: use success/danger colors based on trend, add gradient background with opacity based on magnitude (higher change = more saturated), add subtle pulse animation for changes >15%.
  - **Agent**: tailwind-specialist
- **Subtask 6.3**: Add MiniSparkline component to card showing 24h price history. Pass price_history_24h from market data. Configure to show trend-based colors, smooth curve, optional fill area. Position in card body with proper sizing.
  - **Agent**: tailwind-specialist
- **Subtask 6.4**: Create BreakingRankBadge component with props: rank (number). Style with different tiers: rank 1 gets gold + crown icon, 2-3 get larger badge, 4-10 medium, 11+ standard. Use design tokens for colors.
  - **Agent**: tailwind-specialist
- **Subtask 6.5**: Create MovementIndicator component with props: changePercent (number), volumeChange (number, optional). Display trend icon (TrendingUp/TrendingDown/Minus), percentage with +/- and color coding, optional mini sparkline for volume. Add hover tooltip showing details.
  - **Agent**: tailwind-specialist
- **Subtask 6.6**: Export all components from src/components/breaking/index.ts. Add displayName to each component. Add prop validation with TypeScript interface exports.
  - **Agent**: react-architect

**Coding Standards**:
- Follow MarketCard component pattern in src/components/market/market-card.tsx
- Use Framer Motion for animations (variants, whileHover)
- Reference design tokens in src/lib/design-tokens.ts
- Use glassmorphism classes (bg-glass-light, backdrop-blur-md)
- Support dark mode with CSS variables
- Include loading skeleton variant
- Reference existing Card, Badge components from src/components/ui/

### Task 7: Breaking Page Layout and Components
**Recommended Agent**: react-architect

**Files to create/change**:
- page: src/app/(main)/breaking/page.tsx
- component: src/components/breaking/breaking-filters.tsx
- component: src/components/breaking/breaking-header.tsx
- component: src/components/breaking/breaking-list.tsx

**Implementation**: Create the Breaking page at src/app/(main)/breaking/page.tsx as a Server Component that fetches initial data and passes to Client Component. The page structure: (1) BreakingHeader with title, subtitle, last update timestamp, refresh button, (2) BreakingFilters with time range selector (1h, 6h, 24h, 7d tabs), minimum movement slider, category filter dropdown, volume toggle, (3) BreakingList with infinite scroll using react-intersection-observer or TanStack Query infinite scroll, (4) Loading skeleton during fetch, (5) Error state with retry button. The page should use layout.tsx from (main) route group. BreakingFilters should use useBreakingStore for state management. BreakingList should use useBreakingMarkets hook and render BreakingMarketCard components in a grid/list layout based on viewMode store state.

**Subtasks**:
- **Subtask 7.1**: Create src/app/(main)/breaking/page.tsx as async Server Component. Fetch initial breaking markets data using breakingService. Pass data as prop to BreakingPageClient component. Add loading and error UI at server level.
  - **Agent**: react-architect
- **Subtask 7.2**: Create BreakingPageClient component ("use client") that uses useBreakingStore and useBreakingMarkets hooks. Set up real-time subscription with useBreakingRealtime. Handle filter changes that trigger refetch.
  - **Agent**: react-architect
- **Subtask 7.3**: Create BreakingHeader component with: page title "Breaking Markets", subtitle showing count of markets, last updated timestamp from store, manual refresh button with loading state. Use glassmorphism styling with subtle animation.
  - **Agent**: tailwind-specialist
- **Subtask 7.4**: Create BreakingFilters component with: time range tabs (1h, 6h, 24h, 7d) using Tab component, minimum movement slider using Slider component, category multi-select, volume toggle switch. Connect to useBreakingStore actions.
  - **Agent**: tailwind-specialist
- **Subtask 7.5**: Create BreakingList component with grid/list view toggle, infinite scroll using React IntersectionObserver or TanStack Query useInfiniteQuery, BreakingMarketCard rendering with rank prop. Show loading skeleton at bottom during fetch.
  - **Agent**: react-architect
- **Subtask 6**: Add metadata export to page.tsx for SEO: title, description, openGraph tags. Add viewport configuration for mobile.
  - **Agent**: react-architect

**Coding Standards**:
- Follow app router structure in src/app/(main)/page.tsx
- Use Server Components for initial data fetch
- Client Components for interactivity
- Reference existing components for patterns
- Use layout.tsx for shared layout
- Add proper metadata for SEO
- Follow existing page structure patterns

### Task 8: Real-time Updates Integration
**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- hook: src/hooks/use-breaking-realtime.ts (detailed implementation)
- service: src/services/breaking.service.ts (add subscription methods)

**Implementation**: Implement real-time price updates using Supabase real-time subscriptions to the market_price_history table. When a new price point is inserted: (1) Query checks if price change >1% from last recorded price, (2) If significant, invalidate relevant TanStack Query caches, (3) Update breaking store with new data, (4) Trigger visual update in UI (flash animation on affected card). The subscription should be set up in a useBreakingRealtime hook that manages subscription lifecycle (subscribe on mount, unsubscribe on unmount). Handle connection errors with exponential backoff retry. Implement connection status indicator in BreakingHeader (green dot for connected, red for disconnected, yellow for reconnecting).

**Subtasks**:
- **Subtask 8.1**: Implement subscribeToPriceChanges method in breaking.service.ts using Supabase real-time. Subscribe to INSERT events on market_price_history table. Filter for markets in current breaking list.
  - **Agent**: nodejs-specialist
- **Subtask 8.2**: Create useBreakingRealtime hook that subscribes on mount, unsubscribes on unmount. Return connection status ('connected' | 'disconnected' | 'reconnecting'). Handle errors with retry logic using exponential backoff.
  - **Agent**: react-hooks-specialist
- **Subtask 8.3**: Add query invalidation logic when significant price changes occur. Use queryClient.invalidateQueries with breakingKeys.all to refresh data. Optimistically update cache if data available.
  - **Agent**: react-hooks-specialist
- **Subtask 8.4**: Add connection status indicator to BreakingHeader component. Show colored dot with status text. Pulse animation when reconnecting. Allow manual reconnection trigger on click when disconnected.
  - **Agent**: tailwind-specialist
- **Subtask 8.5**: Implement flash animation on BreakingMarketCard when its data updates. Use Framer Motion animate prop with highlight background that fades out. Add updated_at timestamp comparison to detect new data.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Follow Supabase real-time patterns in src/services/supabase.service.ts
- Use subscribeToMarketPrices as reference
- Handle subscription cleanup properly
- Implement proper error handling
- Use queryClient for cache invalidation
- Reference src/lib/query-client.ts for patterns

### Task 9: Navigation Integration and Routing
**Recommended Agent**: react-architect

**Files to create/change**:
- navigation: src/components/layout/sidebar.tsx (add Breaking link)
- navigation: src/components/layout/mobile-nav.tsx (add Breaking link)
- types: src/types/index.ts (export breaking types)

**Implementation**: Add "Breaking" navigation link to sidebar with icon (Zap or TrendingUp). Add link to mobile navigation menu. Create breaking types export from src/types/index.ts including BreakingMarket, BreakingFilters, BreakingSortOption, BreakingViewMode. Update sitemap if applicable. Ensure breaking page is accessible from homepage via "View Breaking Markets" call-to-action. Add breaking markets to main navigation tabs if using tabs pattern.

**Subtasks**:
- **Subtask 9.1**: Add Breaking navigation item to sidebar with appropriate icon, link to /breaking, active state styling. Position prominently (near top after Markets).
  - **Agent**: react-architect
- **Subtask 9.2**: Add Breaking navigation item to mobile-nav.tsx. Use same icon and styling. Ensure mobile menu opens to /breaking when clicked.
  - **Agent**: react-architect
- **Subtask 9.3**: Export breaking types from src/types/index.ts: BreakingMarket, BreakingFilters, BreakingSortOption, BreakingViewMode, BreakingTimeRange. Re-export from breaking.types.ts.
  - **Agent**: react-architect
- **Subtask 9.4**: Add "Breaking Markets" CTA to homepage src/app/(main)/page.tsx. Add section near stats or featured markets with link to /breaking.
  - **Agent**: react-architect
- **Subtask 9.5**: Update Next.js app router sitemap generation if using. Add /breaking route to sitemap.xml.
  - **Agent**: react-architect

**Coding Standards**:
- Follow existing navigation patterns in sidebar.tsx
- Use lucide-react icons consistently
- Match active state styling
- Reference mobile-nav.tsx for mobile patterns
- Use Link component from next/link
- Follow routing conventions

### Task 10: Testing Implementation
**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- test: src/hooks/__tests__/use-breaking-markets.test.ts
- test: src/components/breaking/__tests__/breaking-market-card.test.tsx
- test: src/services/__tests__/breaking.service.test.ts
- e2e: e2e/breaking.spec.ts

**Implementation**: Create unit tests for hooks using Vitest and Testing Library. Test useBreakingMarkets with mock data, loading states, error states, refetch functionality. Test BreakingMarketCard component rendering with different props, rank badges, movement indicators, hover states. Test breaking.service.ts methods with mocked fetch calls. Create E2E test with Playwright that navigates to /breaking page, verifies markets load, checks filtering works, tests real-time updates. Set up mocks for Gamma API and Supabase responses. Ensure tests achieve coverage targets (80% lines, 80% functions, 75% branches as per vitest.config.ts).

**Subtasks**:
- **Subtask 10.1**: Create use-breaking-markets.test.ts with mock query client, mock breaking service, test hook returns data correctly, test loading state, test error state, test refetch function works. Use renderHook from @testing-library/react.
  - **Agent**: nodejs-specialist
- **Subtask 10.2**: Create breaking-market-card.test.tsx with test render for different ranks, test price change display colors, test trend indicator, test sparkline rendering, test hover interactions. Use render from @testing-library/react.
  - **Agent**: nodejs-specialist
- **Subtask 10.3**: Create breaking.service.test.ts with mock fetch, test getBreakingMarkets, test caching, test error handling, test subscribeToBreakingUpdates. Mock Supabase client for real-time tests.
  - **Agent**: nodejs-specialist
- **Subtask 10.4**: Create breaking.spec.ts E2E test with Playwright. Test navigation to /breaking, test markets load, test filter interactions, test sort changes, test scroll loads more, test mobile responsive.
  - **Agent**: nodejs-specialist
- **Subtask 10.5**: Run all tests and verify coverage thresholds: npm run test:coverage. Fix any failing tests. Ensure CI pipeline will run tests.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Follow existing test patterns in src/hooks/__tests__/
- Use vitest as test runner
- Use @testing-library/react for component tests
- Use Playwright for E2E tests
- Reference vitest.config.ts for coverage thresholds
- Mock external dependencies (Gamma API, Supabase)
- Test error paths, not just happy paths
- Reference e2e/ for E2E test patterns

### Task 11: Newsletter Subscription System
**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- migration: supabase/migrations/003_add_newsletter_subscriptions.sql
- edge function: supabase/functions/subscribe-newsletter/index.ts
- edge function: supabase/functions/send-breaking-daily/index.ts
- component: src/components/breaking/breaking-newsletter-cta.tsx
- email template: supabase/functions/send-breaking-daily/template.html

**Implementation**: Create a newsletter subscription system allowing users to receive daily email summaries of breaking markets. Database table stores subscriptions with: id (uuid, PK), email (varchar, unique, NOT NULL), active (boolean, default true), created_at (timestamptz), last_sent_at (timestamptz). Create subscribe-newsletter edge function that: (1) Accepts email address in request body, (2) Validates email format, (3) Checks for existing subscriptions, (4) Inserts new subscription or reactivates existing, (5) Returns success/error response. Create send-breaking-daily edge function that: (1) Queries all active subscriptions, (2) Fetches top 10 breaking markets, (3) Generates HTML email template, (4) Sends emails via Resend/SendGrid/Supabase email, (5) Updates last_sent_at timestamp. Create BreakingNewsletterCTA component with: email input field, subscribe button, loading state, success message, error handling with toast notifications. The component should be displayed in the Breaking page below the filters section. Email template should include: Polymarket branding, top 10 breaking markets with rank/price/change, call-to-action to view more, unsubscribe link.

**Subtasks**:
- **Subtask 11.1**: Create breaking_newsletter_subscriptions table migration with columns: id (uuid, PK), email (varchar(255), unique, NOT NULL), active (boolean, default true), created_at (timestamptz, default now()), last_sent_at (timestamptz, nullable). Add unique index on email column. Set up RLS policies: authenticated users can read/write, service role can do everything.
  - **Agent**: nodejs-specialist
- **Subtask 11.2**: Create subscribe-newsletter edge function with Deno.serve handler. Implement email validation (regex), check existing subscription (SELECT where email = $1), insert new subscription, return { success: boolean, message: string, alreadySubscribed: boolean }. Add CORS headers and rate limiting (max 5 requests/hour per IP).
  - **Agent**: nodejs-specialist
- **Subtask 11.3**: Create send-breaking-daily edge function that runs on schedule (cron). Fetch active subscriptions, fetch top 10 breaking markets from get-breaking-markets function, generate HTML email template, send via email service API, update last_sent_at for each subscription.
  - **Agent**: nodejs-specialist
- **Subtask 11.4**: Create BreakingNewsletterCTA component ("use client") with useState for email input, loading state, success/error states. Implement form validation with regex pattern. Show "Get daily updates" heading, description text, email input with placeholder, "Get updates" button. Use Toast for success/error notifications. Style with glassmorphism matching design system.
  - **Agent**: react-architect
- **Subtask 11.5**: Create HTML email template in send-breaking-daily function. Include: Polymarket logo/header, "Breaking Markets Daily" title, top 10 markets table (rank, question, price, change%), call-to-action button "View All Breaking Markets", footer with unsubscribe link (mailto:unsubscribe?url). Use inline CSS for email client compatibility. Add plain text version as fallback.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Follow existing migration patterns (001_, 002_, etc.)
- Use Deno standard library in edge functions
- Validate all user inputs before database operations
- Use environment variables for email API keys
- Follow GDPR best practices (double opt-in, unsubscribe link)
- Reference existing edge functions in supabase/functions/
- Follow email client compatibility guidelines (inline CSS, plain text fallback)

### Task 12: Twitter/X Feed Integration
**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- edge function: supabase/functions/get-polymarket-tweets/index.ts
- component: src/components/breaking/breaking-twitter-feed.tsx
- component: src/components/breaking/tweet-card.tsx
- env: .env.local (add TWITTER_BEARER_TOKEN)

**Implementation**: Integrate Twitter API v2 to fetch latest tweets from @polymarket account and display them in a dedicated "Live from @polymarket" section on the Breaking page. Create get-polymarket-tweets edge function that: (1) Accepts optional count parameter (default 20), (2) Uses Twitter API v2 GET /users/:id/tweets endpoint with Bearer token authentication, (3) Expands tweet fields (author_id, created_at, public_metrics, attachments.media_keys, referenced_tweets), (4) Filters for breaking-related tweets, (5) Implements caching with 30-minute TTL, (6) Returns formatted tweet array. Create BreakingTwitterFeed component that: (1) Fetches tweets from edge function on mount, (2) Displays tweets in a scrollable list, (3) Shows loading skeleton during fetch, (4) Implements auto-refresh every 5 minutes, (5) Handles error states gracefully. Create TweetCard component that displays: category badge ("Breaking news" or "New polymarket"), relative timestamp (ex: "Jan 11, 9:23 PM"), tweet text with @mentions and #hashtags highlighted, media attachments (images/videos), engagement metrics (optional), link to view original tweet. Use color-coded badges: red/pink for "Breaking news", blue/green for "New polymarket".

**Subtasks**:
- **Subtask 12.1**: Set up Twitter API v2 access. Add TWITTER_BEARER_TOKEN to .env.local and .env.example. Store in Supabase secrets management for edge function access. Document Twitter API setup process in README.md.
  - **Agent**: nodejs-specialist
- **Subtask 12.2**: Create get-polymarket-tweets edge function. Use Deno.fetch to call Twitter API v2: https://api.twitter.com/2/users/by/username/polymarket/tweets. Add query parameters: max_results, tweet.fields=created_at,public_metrics,expansions=attachments.media_keys,referenced_tweets.id. Parse response, extract relevant data, implement in-memory cache with 30min TTL (Map with timestamp key). Return array of formatted tweets.
  - **Agent**: nodejs-specialist
- **Subtask 12.3**: Create BreakingTwitterFeed component ("use client"). Use useQuery with 5-minute refetchInterval to fetch from get-polymarket-tweets edge function. Display "Live from @polymarket" heading with "Follow on 𝕏" button. Render tweets in a scrollable container with max-height. Show loading skeleton (TweetCard skeletons) during initial fetch. Add auto-refresh indicator. Handle empty state (no tweets) and error state.
  - **Agent**: react-architect
- **Subtask 12.4**: Create TweetCard component with props: tweet (Tweet object). Display category badge based on tweet content (starts with "Breaking news" → red badge, "New polymarket" → blue badge, else gray). Show relative timestamp using formatAbsoluteTimestamp(). Render tweet text preserving line breaks, highlight @mentions (blue) and #hashtags (blue). Display media attachments (images/videos) in a grid layout. Add click handler to open tweet in new tab. Use glassmorphism card styling with hover effects.
  - **Agent**: tailwind-specialist
- **Subtask 12.5**: Implement auto-refresh with 5-minute interval using useQuery's refetchInterval option. Add visual indicator showing "Last updated X min ago". Implement manual refresh button in header. Add connection error state with retry button. Ensure tweets don't cause full page re-renders (memoization).
  - **Agent**: react-hooks-specialist
- **Subtask 12.6**: Add category detection logic. In get-polymarket-tweets edge function, analyze tweet text: if starts with "Breaking news" (case-insensitive) → category = "breaking", if starts with "New polymarket" → category = "new", else → category = "general". Pass category to TweetCard for badge styling. Add category filtering option in BreakingTwitterFeed UI if desired.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Follow Twitter API v2 documentation and rate limits (450 requests/15min for app auth)
- Use environment variables for sensitive tokens
- Implement proper error handling for API failures
- Cache tweets to minimize API calls
- Follow existing component patterns in src/components/
- Use Framer Motion for smooth animations
- Reference existing Twitter/X integration patterns if any
- Ensure GDPR compliance (embed tweets instead of storing personal data)

### Task 13: Timestamp Utilities
**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- utils: src/lib/utils.ts (add timestamp functions)
- types: src/types/breaking.types.ts (add timestamp types)

**Implementation**: Add utility functions for timestamp formatting to match Polymarket's display format ("Jan 11, 9:23 PM"). Create formatAbsoluteTimestamp(date: Date | string): string that converts ISO timestamp to readable format with logic: (1) Parse date to Date object, (2) Extract month (Jan, Feb, Mar...), (3) Extract day of month, (4) Format time in 12-hour format with AM/PM, (5) Return "Mmm DD, HH:MM AM/PM". Create formatRelativeTimestamp(date: Date | string): string that returns human-readable relative time: (1) Calculate difference from now, (2) If < 1 minute → "just now", (3) If < 1 hour → "X min ago", (4) If < 24 hours → "X hours ago", (5) If older → use formatAbsoluteTimestamp(). These utilities will be used throughout the Breaking feature for consistent timestamp display.

**Subtasks**:
- **Subtask 13.1**: Add formatAbsoluteTimestamp() function to src/lib/utils.ts. Handle both Date objects and ISO string inputs. Use Date methods: getMonth() → map to ["Jan", "Feb", ...], getDate() → day number, getHours() → hour (convert to 12-hour format), getMinutes() → minutes (pad with 0), getHours() >= 12 ? "PM" : "AM". Return formatted string. Add JSDoc with examples.
  - **Agent**: nodejs-specialist
- **Subtask 13.2**: Add formatRelativeTimestamp() function to src/lib/utils.ts. Calculate diff = Date.now() - date.getTime(). If diff < 60000 (1 min) → return "just now". If diff < 3600000 (1 hour) → return `${Math.floor(diff / 60000)} min ago`. If diff < 86400000 (24 hours) → return `${Math.floor(diff / 3600000)} hours ago`. Else → return formatAbsoluteTimestamp(date). Add JSDoc with examples.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Follow existing utility patterns in src/lib/utils.ts
- Add comprehensive JSDoc comments
- Include usage examples in comments
- Handle edge cases (null, undefined, invalid dates)
- Use TypeScript for type safety
- Export functions from index.ts if needed
- Test with various timestamp inputs (recent, old, future)

### Task Modifications

#### Modified Task 6.2: Implement Price Change Display with Previous Price
**Changes**: Update BreakingMarketCard component to display both current AND previous prices. The card layout should show: current price (large, prominent), arrow/indicator showing movement direction, previous price (smaller, gray color). Format: "[87% → 42%]" or "[87% | was 42%]". Add tooltip on hover showing exact movement percentage and timeframe ("45% change in 24h"). Calculate previous_price from BreakingMarket.price_history_24h array (oldest price point). If no history available, hide previous price display.

**Agent**: tailwind-specialist
