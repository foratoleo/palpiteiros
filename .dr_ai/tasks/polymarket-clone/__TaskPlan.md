Task Name: polymarket-clone
Date: 10/01/2026 16:16:36
Git Branch: feat/polymarket-clone

## Task Objectives

Create a comprehensive clone of Polymarket, a prediction market platform, with focus on market exploration, real-time price visualization, and an innovative 3D/cinematic user interface. The application will consume data from the public Gamma API (read-only) without implementing trading functionality, providing users with market discovery, price tracking, portfolio simulation, and price alerts. This project serves as both a technical demonstration of modern React/Next.js capabilities with advanced visual effects (3D elements, particles, cinematic transitions) and a practical market analysis tool for prediction market enthusiasts who want to monitor markets without executing trades.

## Implementation Summary

The application will be built as a Next.js 14+ project using the App Router architecture with TypeScript for type safety. State management will be handled by Zustand for its lightweight, boilerplate-free approach, while TanStack Query (React Query) will manage server state caching and synchronization with the Gamma API. The UI layer will use Shadcn/UI components as a foundation with extensive customization through Tailwind CSS v4, implementing a Material Design-inspired visual language with elevated elevation levels, subtle shadows, and smooth micro-interactions. Advanced visual effects will be implemented using React Three Fiber for 3D elements, Framer Motion for cinematic page transitions and animations, and Particles.js for ambient background effects. The application will follow a feature-based folder structure with separate directories for markets, portfolio, alerts, and shared UI components. API integration will be abstracted through a service layer that wraps the Gamma API endpoints, implementing caching strategies (1-minute TTL for market lists, 30-second TTL for individual market details) and pagination for large datasets. Client-side data persistence will use localStorage for user preferences and simulated portfolio data. The routing strategy will leverage Next.js App Router with dynamic routes for individual markets (/markets/[slug]), portfolio views, and settings. Error handling will be centralized through a custom ErrorBoundary component, while toast notifications will provide user feedback for all significant actions.

## UX/UI Details

The interface will follow a progressive visual hierarchy with cinematic transitions between pages. The home page will feature a hero section with particle background effects and 3D floating market cards that respond to mouse movement. Market cards will display essential information (question, current price, volume, liquidity, time remaining) with color-coded price indicators (green for Yes/positive sentiment, red for No/negative sentiment). Hover states will trigger elevation changes and subtle scale animations. The market explorer will provide advanced filtering by category (Crypto, Politics, Sports, Business, World), liquidity range, volume, and closing date, with debounced search functionality that filters results in real-time. Individual market pages will feature an interactive price chart using Recharts or Lightweight Charts with zoom/pan capabilities, an order book visualization (simulated data), market description, and related markets sidebar. Price changes will trigger animated indicators with directional arrows and color transitions. The portfolio page will display simulated positions with current value calculations, PnL indicators, and a donut chart showing allocation by category. The theme switcher will provide smooth transitions between light and dark modes using CSS custom properties with transition durations of 300ms. All navigation will use Framer Motion's layout animations for seamless page transitions. Loading states will use skeleton screens matching the actual content layout, while empty states will display friendly illustrations and clear call-to-action buttons. Mobile responsiveness will use a bottom navigation bar for key sections, with collapsible filters and horizontally scrolling market cards. Accessibility features include proper ARIA labels, keyboard navigation support, and high contrast ratios in both themes.

## Tasks

### Task 0: Supabase Database Setup

**Recommended Agent**: supabase-edge-functions

**Files to create/change**:
- sql: supabase/migrations/001_initial_schema.sql
- sql: supabase/migrations/002_rls_policies.sql
- sql: supabase/migrations/003_triggers.sql
- function: supabase/functions/sync-gamma-markets/index.ts
- config: supabase/config.toml
- env: .env.local

**Implementation**: Set up Supabase PostgreSQL database with complete schema for markets, prices, portfolios, and alerts. Create 5 main tables: markets (stored prediction markets with metadata), market_prices (time-series price data), user_portfolios (user position tracking), price_alerts (user alert settings), user_preferences (theme and settings). Enable Row Level Security (RLS) on all tables with appropriate policies: public read access for markets, authenticated user access for own portfolio/alerts/preferences. Create indexes on frequently queried columns (markets.active, markets.end_date, market_prices.market_id, user_portfolios.user_id). Set up triggers for updated_at timestamps. Create Supabase Edge Function in Deno for syncing Gamma API data to database (periodic job fetching markets and inserting/updating). Implement real-time subscriptions for market prices and portfolio updates. Test database connection from Next.js using @supabase/supabase-js. Generate TypeScript types from database schema using Supabase CLI. Configure environment variables in .env.local with Supabase URL and anon key.

**Subtasks**:
- **Subtask 0.1**: Create supabase/migrations/001_initial_schema.sql with all 5 tables. Define markets table with uuid primary key, question text, condition_id unique, slug unique, outcomes jsonb, volume numeric, liquidity numeric, active/closed/archived booleans, tags jsonb, category text, timestamps. Define market_prices table with market_id foreign key, price_yes, price_no, volume_24h, timestamp. Define user_portfolios table with user_id, market_id foreign keys, outcome text, size numeric, average_price numeric, current_price numeric, pnl numeric. Define price_alerts table with user_id, market_id, condition (above/below), target_price numeric check constraint, triggered boolean. Define user_preferences table with user_id unique, theme text, currency text, notifications_enabled boolean, particle_effects boolean, data_refresh_interval int.
  - **Agent**: supabase-edge-functions
- **Subtask 0.2**: Create supabase/migrations/002_rls_policies.sql with security policies. Enable RLS on all tables. Create policy "Markets are viewable by everyone" for SELECT on markets to anon, authenticated. Create policies for user_portfolios: users can CRUD own data where auth.uid() = user_id. Create policies for price_alerts: users can CRUD own alerts. Create policies for user_preferences: users can CRUD own preferences. Create policy for market_prices: viewable by everyone.
  - **Agent**: supabase-edge-functions
- **Subtask 0.3**: Create supabase/migrations/003_triggers.sql with update triggers. Create update_updated_at_column() function in plpgsql. Create triggers on markets, user_portfolios, user_preferences for automatic updated_at timestamp. Create indexes: idx_markets_active, idx_markets_end_date, idx_markets_category, idx_market_prices_market_timestamp, idx_user_portfolios_user, idx_price_alerts_user_triggered.
  - **Agent**: supabase-edge-functions
- **Subtask 0.4**: Create supabase/functions/sync-gamma-markets/index.ts Edge Function. Use Deno with Supabase client. Fetch markets from Gamma API every 5 minutes. Upsert markets to database using condition_id as key. Insert new price records into market_prices table. Handle errors and log sync status. Deploy function using supabase functions deploy.
  - **Agent**: supabase-edge-functions
- **Subtask 0.5**: Generate TypeScript types from database. Run supabase gen types typescript --local > src/types/database.types.ts. This creates Database, Tables, Row types matching schema. Add to .gitignore for regeneration.
  - **Agent**: react-architect
- **Subtask 0.6**: Create .env.local with Supabase credentials. Add NEXT_PUBLIC_SUPABASE_URL=https://fnfuzshbbvwwdhexwjlv.supabase.co, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY. Add Gamma API URL: NEXT_PUBLIC_GAMMA_API_URL=https://gamma-api.polymarket.com. Add app config: NEXT_PUBLIC_APP_NAME=Palpiteiros, NEXT_PUBLIC_DEFAULT_THEME=dark. Document each variable with comments.
  - **Agent**: react-architect
- **Subtask 0.7**: Test database connection. Create src/lib/supabase.ts with createClient() using @supabase/supabase-js. Test query: select * from markets limit 1. Test RLS: insert into user_preferences with authenticated user. Test real-time: subscribe to market_prices changes. Verify all tests pass before proceeding.
  - **Agent**: supabase-edge-functions

**Coding Standards**:
- Follow Supabase best practices for RLS policies
- Use PostgreSQL numeric type for financial data (not float)
- Create indexes on all foreign keys and frequently filtered columns
- Use check constraints for data validation (target_price 0-1)
- Enable real-time for tables requiring live updates

---

### Task 1: Project Setup and Base Configuration

**Recommended Agent**: react-architect

**Files to create/change**:
- config: next.config.js, tsconfig.json, tailwind.config.ts, postcss.config.js
- package.json: Root dependencies file
- .env.example: Environment variables template
- src/app/layout.tsx: Root layout with providers
- src/app/page.tsx: Home page
- util: src/lib/utils.ts (cn utility for className merging)

**Implementation**: Initialize Next.js 14+ project with TypeScript using `npx create-next-app@latest` with App Router enabled. Configure Tailwind CSS v4 with custom theme extension including Material Design elevation levels (elevation-1 through elevation-5), color palette with semantic tokens (primary, secondary, success, warning, danger, info), and animation keyframes for fade-in, slide-up, and pulse effects. Install core dependencies: `zustand ^4.5.0`, `@tanstack/react-query ^5.17.0`, `@supabase/supabase-js ^2.39.0`, `@supabase/ssr ^0.5.0`, `framer-motion ^11.0.0`, `@react-three/fiber ^8.16.0`, `@react-three/drei ^9.105.0`, `recharts ^2.12.0`, `@radix-ui/react-toast`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-select`, `@radix-ui/react-switch`, `@radix-ui/react-tabs`, `@radix-ui/react-slider`, `class-variance-authority`, `clsx`, `tailwind-merge`, `date-fns`, `lucide-react`. Configure tsconfig.json with strict mode, path aliases (@/, @/components, @/lib, @/hooks, @/stores, @/services, @/types), and ESLint with TypeScript rules. Create environment variables template with NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_GAMMA_API_URL, NEXT_PUBLIC_APP_NAME, NEXT_PUBLIC_DEFAULT_THEME. Set up root layout with ThemeProvider, QueryClientProvider, SupabaseProvider, and Toaster components. Implement the `cn` utility function for className merging using clsx and tailwind-merge.

**Subtasks**:
- **Subtask 1.1**: Create Next.js project with TypeScript and App Router, install all core dependencies, and configure package.json with proper scripts (dev, build, start, lint, type-check). Ensure Node.js version is 18+ and use npm or pnpm for package management.
  - **Agent**: react-architect
- **Subtask 1.2**: Configure Tailwind CSS v4 with custom design tokens. Create tailwind.config.ts with extend() for colors (primary: #6366f1, secondary: #8b5cf6, success: #10b981, danger: #ef4444, warning: #f59e0b), elevation levels (box-shadow presets matching Material Design), and animation keyframes (fadeIn, slideUp, pulse, spin). Add CSS variables for theme switching in globals.css.
  - **Agent**: tailwind-specialist
- **Subtask 1.3**: Configure TypeScript with strict mode and path aliases. Update tsconfig.json with compilerOptions (strict: true, paths: { "@/*": ["./src/*"] }, baseUrl: "."). Add type references for shadcn components and configure ESLint with next/core-web-vitals and @typescript-eslint rules.
  - **Agent**: react-architect
- **Subtask 1.4**: Create root layout (src/app/layout.tsx) with proper HTML structure, metadata configuration, font integration (Inter via next/font/google), and provider wrapping. Import ThemeProvider, QueryClientProvider, and Toaster components. Set up metadata with title, description, and openGraph properties for SEO.
  - **Agent**: react-architect
- **Subtask 1.5**: Create utility functions in src/lib/utils.ts. Export `cn()` function for className merging using clsx and tailwind-merge. Add utility functions for number formatting (formatCurrency, formatPercentage, formatLargeNumber), date formatting (formatRelativeTime, formatDateTime), and color utilities (getPriceColor, getChangeColor).
  - **Agent**: react-architect

**Coding Standards**:
- Follow Next.js 14 App Router conventions with server and client component separation
- Use TypeScript strict mode with no implicit any
- Apply functional components with hooks (no class components)
- Export components as default with named exports for types/utils
- Use path aliases (@/ prefix) for all internal imports

---

### Task 2: Type Definitions and API Interface

**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- type: src/types/gamma.types.ts
- type: src/types/market.types.ts
- type: src/types/portfolio.types.ts
- type: src/types/alert.types.ts
- type: src/types/ui.types.ts
- service: src/services/gamma.service.ts

**Implementation**: Define comprehensive TypeScript interfaces for the Supabase database schema and Gamma API response structures. In database.types.ts, import types generated by Supabase CLI (Database, Tables, Row). These types include: Tables<'markets'> with id, question, condition_id, slug, description, end_date, start_date, outcomes (jsonb), volume, liquidity, active, closed, archived, tags (jsonb), category, image_url, created_at, updated_at. Tables<'market_prices'> with id, market_id, price_yes, price_no, volume_24h, timestamp. Tables<'user_portfolios'> with id, user_id, market_id, outcome, size, average_price, current_price, pnl, pnl_percentage. Tables<'price_alerts'> with id, user_id, market_id, condition, target_price, triggered, triggered_at, created_at. Tables<'user_preferences'> with id, user_id, theme, currency, notifications_enabled, particle_effects, data_refresh_interval. In gamma.types.ts, create Market interface mapping Gamma API responses, Tag interface, and MarketsQueryParams for API filtering. In market.types.ts, create MarketCardProps interface for component props, MarketFilterOptions for filter state, MarketSortOption for sorting. In portfolio.types.ts, create Position interface combining user_portfolios table data with market details. Create PortfolioState interface with positions (Position[]), totalValue (number), totalPnl (number). In alert.types.ts, create PriceAlert interface mapping price_alerts table. In ui.types.ts, create Theme type ('light' | 'dark'), Toast variants, and pagination state interfaces. Create supabase service in src/services/supabase.service.ts wrapping Supabase client with typed queries. Create gamma service in src/services/gamma.service.ts for direct API calls (used by Edge Function).

**Subtasks**:
- **Subtask 2.1**: Create src/types/database.types.ts by running supabase gen types typescript --local. This file contains all generated types: Database, Tables, Row, Insert, Update. Export Tables<'markets'> as Market, Tables<'market_prices'> as MarketPrice, etc. Add to .gitignore for regeneration.
  - **Agent**: react-architect
- **Subtask 2.2**: Create src/types/gamma.types.ts with Market, Tag, Outcome, MarketsQueryParams, and GammaApiResponse interfaces for Gamma API integration. Include JSDoc comments for each property.
  - **Agent**: react-architect
- **Subtask 2.3**: Create src/types/market.types.ts with market-related UI types including MarketCardProps, MarketListProps, MarketFilterOptions, MarketSortOption, MarketSearchParams. Define enums for sort fields (endDate, volume, liquidity, price) and sort directions.
  - **Agent**: react-architect
- **Subtask 2.4**: Create src/types/portfolio.types.ts with Position, Portfolio, PortfolioSummary interfaces. Define PositionStatus type ('active' | 'closed'), and PnLCalculation type ('realized' | 'unrealized').
  - **Agent**: react-architect
- **Subtask 2.5**: Create src/types/alert.types.ts with PriceAlert, AlertCondition, AlertTrigger interfaces. Define notification types and alert priority levels.
  - **Agent**: react-architect
- **Subtask 2.6**: Create src/types/ui.types.ts with UI state types including Theme, ToastConfig, LoadingState, PaginationState, ModalState. Define transition variants for Framer Motion animations.
  - **Agent**: react-architect
- **Subtask 2.7**: Create src/services/supabase.service.ts with typed Supabase client wrapper. Export createBrowserClient(), createServerClient() helpers. Implement getMarkets(), getMarketBySlug(), getMarketPrices() with proper typing using Database types.
  - **Agent**: supabase-edge-functions
- **Subtask 2.8**: Create src/services/gamma.service.ts with GammaService class for direct API calls (used by Edge Function). Implement fetchMarkets() with query parameter serialization. This service is NOT used by frontend directly.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Use TypeScript interface for object shapes, type for primitives/unions
- Add JSDoc comments for all public interfaces and complex types
- Export types from index files (types/index.ts) for cleaner imports
- Use readonly modifier for immutable properties
- Mark optional properties with ? operator explicitly

---

### Task 3: Zustand Store Architecture

**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- store: src/stores/market.store.ts
- store: src/stores/portfolio.store.ts
- store: src/stores/ui.store.ts
- store: src/stores/alert.store.ts
- store: src/stores/user.store.ts
- hook: src/stores/index.ts (barrel export)

**Implementation**: Create Zustand stores following a consistent pattern with typed state, actions, and selectors integrated with Supabase. In market.store.ts, define MarketState with markets (Market[]), filteredMarkets (Market[]), selectedMarket (Market | null), filters (MarketFilterOptions), sort (MarketSortOption), searchQuery (string), loading (boolean), error (string | null). Create actions: setMarkets, setSelectedMarket, setFilters, setSort, setSearchQuery, clearFilters, refreshMarkets. Implement computed selector getFilteredMarkets that applies filters, sort, and search. Add middleware using localStorage for persisting filters and sort preferences. Integrate with Supabase real-time for automatic market updates on price changes. In portfolio.store.ts, define PortfolioState with positions (Position[]), totalValue (number), totalPnl (number), totalInvested (number), loading (boolean). Create actions: addPosition, removePosition, updatePosition, clearPortfolio, fetchPortfolio, subscribeToPortfolioUpdates. Add Supabase queries to fetch positions from user_portfolios table. Implement real-time subscription for portfolio changes. In ui.store.ts, define UIState with theme (Theme: 'light' | 'dark'), sidebarOpen (boolean), toastQueue (ToastConfig[]), currentModal (string | null), loadingStates (Record<string, boolean>). Create actions: setTheme, toggleSidebar, showToast, hideToast, showModal, hideModal, setLoading. Add theme persistence in localStorage with system preference detection via matchMedia('(prefers-color-scheme: dark)'). In alert.store.ts, define AlertState with alerts (PriceAlert[]), alertHistory (PriceAlert[]). Create actions: addAlert, removeAlert, triggerAlert, clearTriggeredAlerts, fetchAlerts, subscribeToAlerts. Add Supabase queries to fetch alerts from price_alerts table. Implement real-time subscription for alert triggers. In user.store.ts, define UserState with preferences (UserPreferences), settings (UserSettings), bookmarks (string[] of market IDs). Create actions: updatePreferences, updateSettings, addBookmark, removeBookmark, fetchPreferences, savePreferences. Add Supabase queries to fetch/save preferences from user_preferences table. All stores should use TypeScript generics with proper typing, export typed hooks (useMarketStore, usePortfolioStore, etc.), and include devtools middleware for Redux DevTools integration.

**Subtasks**:
- **Subtask 3.1**: Create src/stores/market.store.ts with MarketState interface and store definition using create() from zustand. Define initial state with empty arrays and default filter values. Implement actions for state updates and computed selector for filtered/sorted markets. Add persist middleware for filters and search query. Integrate Supabase real-time subscription for market price updates. Export typed hook useMarketStore.
  - **Agent**: react-hooks-specialist
- **Subtask 3.2**: Create src/stores/portfolio.store.ts with PortfolioState interface including positions array and computed totals. Implement actions for CRUD operations on positions with automatic PnL recalculation. Add fetchPortfolio action querying user_portfolios table from Supabase. Add subscribeToPortfolioUpdates for real-time position changes. Export typed hook usePortfolioStore.
  - **Agent**: react-hooks-specialist
- **Subtask 3.3**: Create src/stores/ui.store.ts with UIState for theme, sidebar, toasts, modals, and loading states. Implement theme detection from localStorage or system preference. Create toast queue system with max 5 concurrent toasts, auto-dismiss after 5000ms. Export typed hook useUIStore.
  - **Agent**: react-hooks-specialist
- **Subtask 3.4**: Create src/stores/alert.store.ts with AlertState containing active and triggered alerts. Implement addAlert with validation (targetPrice must be between 0 and 1), removeAlert by ID, triggerAlert when price condition is met, and clearTriggeredAlerts for cleanup. Add fetchAlerts querying price_alerts table. Add subscribeToAlerts for real-time alert triggers. Export typed hook useAlertStore.
  - **Agent**: react-hooks-specialist
- **Subtask 3.5**: Create src/stores/user.store.ts with UserState for preferences (language, currency, notifications), settings (animationsEnabled, particleEffectsEnabled, dataRefreshInterval), and bookmarks array. Implement fetchPreferences querying user_preferences table. Implement savePreferences upserting to database. Export typed hook useUserStore.
  - **Agent**: react-hooks-specialist
- **Subtask 3.6**: Create src/stores/index.ts as barrel export file re-exporting all store hooks for simplified imports. Add JSDoc comment example showing usage pattern.
  - **Agent**: react-architect

**Coding Standards**:
- Use Zustand v4+ create() function with TypeScript generics
- Separate state, actions, and selectors in store definition
- Use persist middleware for user-facing state (filters, preferences)
- Add devtools middleware with store name for debugging
- Export typed hooks (useXxxStore) from each store file

---

### Task 4: Shadcn/UI Component Setup

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/ui/button.tsx
- component: src/components/ui/card.tsx
- component: src/components/ui/badge.tsx
- component: src/components/ui/dialog.tsx
- component: src/components/ui/dropdown-menu.tsx
- component: src/components/ui/select.tsx
- component: src/components/ui/switch.tsx
- component: src/components/ui/tabs.tsx
- component: src/components/ui/slider.tsx
- component: src/components/ui/input.tsx
- component: src/components/ui/textarea.tsx
- component: src/components/ui/separator.tsx
- component: src/components/ui/toast.tsx
- component: src/components/ui/toaster.tsx
- component: src/components/ui/scroll-area.tsx
- component: src/components/ui/command.tsx

**Implementation**: Initialize Shadcn/UI using `npx shadcn-ui@latest init` with the project. Configure components.json with proper Tailwind configuration paths. Add individual components using `npx shadcn-ui@latest add [component]` for each required component. Customize component styles in src/components/ui/*.tsx to match Material Design aesthetics with elevation levels, rounded corners (rounded-lg or rounded-xl), and proper color tokens. For button.tsx, add variants for primary (solid with elevation-2), secondary (outline), ghost (transparent), and destructive (red) with proper hover states. For card.tsx, add elevation variants and hover elevation effects. For badge.tsx, create semantic variants for market status (active, closed, resolved), price direction (up, down, neutral), and categories. For dialog.tsx, ensure proper aria attributes and backdrop blur effects. For select.tsx and dropdown-menu.tsx, add proper keyboard navigation and searchable options. For switch.tsx, add smooth animation for toggle state. For tabs.tsx, add animated underline indicator for active tab. For slider.tsx, add tooltip showing current value on drag. For input.tsx and textarea.tsx, add focus rings with elevation and proper error states. For toast.tsx, create variants for success, error, warning, and info with appropriate icons and colors. For toaster.tsx, position at bottom-right with swipe-to-dismiss functionality. For scroll-area.tsx, add smooth scrolling with custom scrollbar styling. For command.tsx, add keyboard shortcuts and fuzzy search for market selection.

**Subtasks**:
- **Subtask 4.1**: Initialize Shadcn/UI with `npx shadcn-ui@latest init`. Configure components.json with tailwind config path, components path (src/components/ui), and utils path (src/lib/utils). Set up proper CSS variables for theming in globals.css.
  - **Agent**: tailwind-specialist
- **Subtask 4.2**: Add and customize button component with variants (default, destructive, outline, secondary, ghost, link), sizes (default, sm, lg, icon), and elevation effects on hover. Add loading state with spinner icon.
  - **Agent**: tailwind-specialist
- **Subtask 4.3**: Add and customize card component with header, title, description, content, and footer subcomponents. Add elevation variants (0-5) and hover elevation transition.
  - **Agent**: tailwind-specialist
- **Subtask 4.4**: Add and customize badge component with semantic variants (default, secondary, destructive, outline, success, warning, info) for market status, price changes, and categories.
  - **Agent**: tailwind-specialist
- **Subtask 4.5**: Add dialog component with proper overlay, content, header, title, description, footer. Add animation variants for slide-in from center or bottom. Ensure accessibility with ARIA attributes.
  - **Agent**: tailwind-specialist
- **Subtask 4.6**: Add dropdown-menu component with trigger, content, item, separator, checkbox item, radio item. Add keyboard navigation and proper focus management.
  - **Agent**: tailwind-specialist
- **Subtask 4.7**: Add select component with trigger, value, content, item. Add search functionality for large option lists. Group options by category for market filtering.
  - **Agent**: tailwind-specialist
- **Subtask 4.8**: Add switch component for theme toggle and settings. Add smooth animated thumb with colored track when active.
  - **Agent**: tailwind-specialist
- **Subtask 4.9**: Add tabs component with list, trigger, and content. Add animated underline indicator that slides to active tab. Support vertical orientation for sidebar.
  - **Agent**: tailwind-specialist
- **Subtask 4.10**: Add slider component for numeric inputs like price thresholds and filter ranges. Add tooltip showing current value and stepped mode for discrete values.
  - **Agent**: tailwind-specialist
- **Subtask 4.11**: Add input and textarea components with label, hint, and error states. Add focus ring with elevation effect and character counter for textarea.
  - **Agent**: tailwind-specialist
- **Subtask 4.12**: Add separator component for visual breaks with horizontal and vertical orientations.
  - **Agent**: tailwind-specialist
- **Subtask 4.13**: Add toast and toaster components with action, close, title, and description. Create variants for success, error, warning, info with appropriate icons. Add progress bar for auto-dismiss.
  - **Agent**: tailwind-specialist
- **Subtask 4.14**: Add scroll-area component with smooth scrolling, custom scrollbar styling, and viewport/detect/scrollbar/Corner subcomponents.
  - **Agent**: tailwind-specialist
- **Subtask 4.15**: Add command component with dialog, input, list, empty, item, group, separator. Add keyboard shortcuts (Cmd/Ctrl+K) and fuzzy search functionality.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Follow Shadcn/UI component structure with forwardRef
- Use class-variance-authority (cva) for variant management
- Apply consistent animation durations (150ms for micro-interactions, 300ms for transitions)
- Use lucide-react for all icons
- Ensure WCAG AA contrast ratios for all text/background combinations

---

### Task 5: TanStack Query Integration

**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- hook: src/hooks/use-markets.ts
- hook: src/hooks/use-market.ts
- hook: src/hooks/use-market-history.ts
- hook: src/hooks/use-infinite-markets.ts
- lib: src/lib/query-client.ts

**Implementation**: Set up TanStack Query (React Query v5) for server state management with Supabase as data source. Create src/lib/query-client.ts with QueryClient instance configured with defaultOptions: queries having staleTime of 60000ms (1 minute) for market lists, 30000ms (30 seconds) for individual market details, retry: 2 with exponential backoff, refetchOnWindowFocus: true with throttling, refetchOnMount: true. In use-markets.ts, create useMarkets hook with useQuery wrapping Supabase queries from supabase service. Accept MarketsQueryParams as argument with proper default values. Return useQueryResult with data, isLoading, isError, error, refetch. Add useMarketsInfinite hook using useInfiniteQuery for pagination with getNextPageParam calculating offset based on limit. Implement flatten helper for combining pages. In use-market.ts, create useMarket hook accepting slug or ID with useQuery querying Supabase markets table. Add staleTime override for individual markets (30000ms). Create prefetchMarket function for optimistic data loading on hover. In use-market-history.ts, create hook for fetching historical price data from market_prices table. Query latest 100 price points ordered by timestamp desc. Configure all hooks to use the query client from query-client.ts. Add proper TypeScript types for all query keys using generic string arrays for type safety ('markets', 'market', 'market-history', 'portfolio', 'alerts'). Export query keys constants from hooks/query-keys.ts for consistency.

**Subtasks**:
- **Subtask 5.1**: Create src/lib/query-client.ts with QueryClient instance. Configure defaultOptions for queries with staleTime: 60000, gcTime: 300000, retry: 2 with retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), refetchOnWindowFocus: true with focusThrottleTime: 5000. Export singleton instance.
  - **Agent**: react-hooks-specialist
- **Subtask 5.2**: Create src/hooks/query-keys.ts with constants for all query keys. Export marketsKey, marketKey(id), marketHistoryKey(id), infiniteMarketsKey(filters), portfolioKey, alertsKey, preferencesKey. Use function-based keys for parameterized queries.
  - **Agent**: react-hooks-specialist
- **Subtask 5.3**: Create src/hooks/use-markets.ts with useMarkets hook accepting MarketsQueryParams. Use useQuery with marketsKey query key. Query Supabase markets table with filters via supabase service. Add useMarketsInfinite hook with useInfiniteQuery for pagination, getNextPageParam: lastPage => lastPage.length === limit ? offset + limit : undefined. Return flatten helper for combined results.
  - **Agent**: react-hooks-specialist
- **Subtask 5.4**: Create src/hooks/use-market.ts with useMarket hook accepting slug or ID param. Use useQuery with marketKey query key and 30s staleTime. Query Supabase markets table by slug. Add prefetchMarket function using queryClient.prefetchQuery for hover optimization.
  - **Agent**: react-hooks-specialist
- **Subtask 5.5**: Create src/hooks/use-market-history.ts with useMarketHistory hook. Query Supabase market_prices table for given market_id. Select latest 100 points ordered by timestamp desc. Return array with timestamp and price. Use useQuery with 30s staleTime.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Export hooks with 'use' prefix convention
- Use TypeScript generics for query result types
- Provide explicit return types for complex hooks
- Add JSDoc comments explaining parameters and return values
- Handle loading and error states consistently

---

### Task 6: Routing Structure and Layouts

**Recommended Agent**: react-architect

**Files to create/change**:
- page: src/app/page.tsx (Home)
- page: src/app/markets/page.tsx (Market Explorer)
- page: src/app/markets/[slug]/page.tsx (Market Detail)
- page: src/app/portfolio/page.tsx (Portfolio)
- page: src/app/alerts/page.tsx (Price Alerts)
- page: src/app/settings/page.tsx (Settings)
- layout: src/app/(main)/layout.tsx (Main layout)
- layout: src/app/markets/layout.tsx (Markets layout)
- component: src/components/layout/sidebar.tsx
- component: src/components/layout/header.tsx
- component: src/components/layout/mobile-nav.tsx
- component: src/components/layout/page-transition.tsx

**Implementation**: Create Next.js App Router structure with route groups for layouts. Define (main) route group with shared layout containing header, sidebar, and main content area. In src/app/page.tsx, create home page with hero section featuring market summary cards (total markets, 24h volume, active markets), trending markets section with horizontal scroll, and market categories grid. Use framer-motion for initial load animations with stagger children delays. In src/app/markets/page.tsx, create market explorer with search bar, filter panel (category, liquidity, volume, closing date), sort dropdown, and markets grid/list view toggle. Implement infinite scroll using useInfiniteMarkets hook with intersection observer for load more trigger. In src/app/markets/[slug]/page.tsx, create dynamic route for individual market with market header (question, category, endDate), price chart (using PriceChart component), order book visualization (OrderBookVisual), market description, outcomes table, and related markets sidebar. Fetch market data on server side if possible, otherwise client side with proper loading state. In src/app/portfolio/page.tsx, create portfolio view with summary cards (total value, total PnL, today's change), positions list/table, donut chart for allocation by category, and performance chart over time. In src/app/alerts/page.tsx, create alerts management page with active alerts list, alert history, and create alert dialog. In src/app/settings/page.tsx, create settings page with theme switch, notifications settings, data refresh interval slider, and particle effects toggle. Create src/components/layout/sidebar.tsx with navigation links, collapsed state, and active route highlighting using usePathname. Create src/components/layout/header.tsx with search input, notifications bell, profile menu, and mobile menu trigger. Create src/components/layout/mobile-nav.tsx with bottom navigation for mobile screens using fixed positioning. Create src/components/layout/page-transition.tsx wrapper component using framer-motion AnimatePresence with route-specific animations (fadeIn for most, slideUp for modals).

**Subtasks**:
- **Subtask 6.1**: Create src/app/(main)/layout.tsx as wrapper for main app routes. Include Header component (top bar), Sidebar component (desktop navigation), and children outlet. Add maxWidth container with proper padding and responsive behavior (hide sidebar on mobile).
  - **Agent**: react-architect
- **Subtask 6.2**: Update src/app/page.tsx with hero section and featured content. Create HeroMarketCard component with 3D tilt effect on mouse move. Add trending markets section with horizontal scroll snap. Add category quick links grid. Use framer-motion for staggered entrance animations.
  - **Agent**: react-architect
- **Subtask 6.3**: Create src/app/markets/page.tsx with full market explorer. Add MarketFilters sidebar component with category chips, liquidity/volume sliders, date range picker, and active filters display. Add MarketSort dropdown with options (Newest, Ending Soon, Most Volume, Highest Liquidity). Add ViewToggle (grid/list) with localStorage persistence. Implement infinite scroll with LoadMore trigger component.
  - **Agent**: react-architect
- **Subtask 6.4**: Create src/app/markets/[slug]/page.tsx dynamic route. Implement generateMetadata for SEO using market data. Create two-column layout: main content with price chart, order book, description; sidebar with related markets. Add ErrorBoundary for invalid market slugs. Implement loading skeleton matching final layout.
  - **Agent**: react-architect
- **Subtask 6.5**: Create src/app/portfolio/page.tsx with portfolio overview. Add PortfolioSummary cards with total value, unrealized PnL, daily change. Add PositionsTable component with sortable columns, status badges, and PnL color coding. Add AllocationChart using Recharts donut chart. Add PerformanceChart showing portfolio value over time with simulated historical data.
  - **Agent**: react-architect
- **Subtask 6.6**: Create src/app/alerts/page.tsx for price alerts management. Add ActiveAlerts list with edit/delete actions and trigger status. Add AlertHistory with triggered alerts and timestamps. Add CreateAlertDialog with form for market selection, condition (above/below), target price slider, and notification preference.
  - **Agent**: react-architect
- **Subtask 6.7**: Create src/app/settings/page.tsx with user settings. Add ThemeSwitch using Shadcn switch. Add NotificationSettings with email/push toggles. Add DataSettings with refresh interval slider (30s, 1min, 5min, never). Add VisualSettings with particle effects toggle and animation scale slider.
  - **Agent**: react-architect
- **Subtask 6.8**: Create src/components/layout/sidebar.tsx with navigation structure. Add NavItem component for each route with icon, label, and badge. Add collapsed state with icon-only view. Add active route detection using usePathname with matching logic for nested routes. Add keyboard shortcuts (Cmd+1 through Cmd+5) for quick navigation.
  - **Agent**: react-architect
- **Subtask 6.9**: Create src/components/layout/header.tsx with app title/logo, global search input (opens Command palette), notifications bell with unread count badge, profile dropdown with settings and logout options, and mobile menu trigger button.
  - **Agent**: react-architect
- **Subtask 6.10**: Create src/components/layout/mobile-nav.tsx for bottom navigation on mobile (<768px). Add 5 main nav items (Home, Markets, Portfolio, Alerts, Settings) with icons and labels. Use fixed positioning at bottom with safe-area-inset-bottom for iOS devices.
  - **Agent**: react-architect
- **Subtask 6.11**: Create src/components/layout/page-transition.tsx wrapper component. Use framer-motion motion.div with variants for page transitions: fadeIn (opacity 0->1), slideUp (y: 20->0), slideInFromRight (x: 20->0). Add route-specific transition config using useRouter events.
  - **Agent**: react-architect

**Coding Standards**:
- Use Next.js App Router file conventions (page.tsx, layout.tsx, loading.tsx, error.tsx)
- Server Components by default, Client Components only when needed (use client directive)
- Use generateMetadata for SEO where applicable
- Implement proper loading and error states for each page
- Use semantic HTML elements (main, nav, header, section)

---

### Task 7: Market Card Components

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/markets/market-card.tsx
- component: src/components/markets/market-card-skeleton.tsx
- component: src/components/markets/market-card-3d.tsx
- component: src/components/markets/market-grid.tsx
- component: src/components/markets/market-list.tsx
- component: src/components/markets/market-card-price.tsx
- component: src/components/markets/market-card-meta.tsx

**Implementation**: Create comprehensive market card components for different display contexts. In market-card.tsx, build the base MarketCard component with market question (truncated at 2 lines), category badge, outcome prices with Yes/No labels and color-coded backgrounds, volume and liquidity stats, time remaining badge with appropriate icon (clock for closing soon, calendar for distant end dates), and bookmark button. Use Card component from Shadcn with elevation-1 default, elevation-3 on hover with smooth transition. Add click handler navigating to market detail page. Implement hover state with scale-105, shadow-lg, and price highlight animation. In market-card-skeleton.tsx, create loading state matching exact layout of market card with animated pulse for text blocks and shimmer effect for price sections. In market-card-3d.tsx, create enhanced version with React Three Fiber for subtle 3D tilt effect following mouse position. Use useFrame hook for smooth interpolation. Add subtle parallax on card elements (price, badge) for depth effect. Only render on desktop to save mobile performance. In market-grid.tsx, create grid container using CSS Grid with responsive columns (1 on mobile, 2 on tablet, 3 on desktop, 4 on wide screens). Add gap-6 for spacing. Implement infinite scroll support with LoadMoreTrigger at bottom. In market-list.tsx, create alternative list view with horizontal card layout, better for detailed information display. Add sortable columns for question, category, price, volume, and end date. In market-card-price.tsx, extract price display logic with Yes/No outcome prices, change indicators, and percentage labels. Add color coding (green-500 for Yes price increase, red-500 for decrease). In market-card-meta.tsx, extract metadata display including volume formatted with K/M/B suffixes, liquidity badge, and time remaining with relative time formatting (e.g., "2h left", "3d left").

**Subtasks**:
- **Subtask 7.1**: Create src/components/markets/market-card.tsx base component. Accept Market prop and onBookmarkClick callback. Use Card, Badge, Button from Shadcn. Add hover effects with transition-all duration-300. Implement bookmark button with heart icon from lucide-react.
  - **Agent**: tailwind-specialist
- **Subtask 7.2**: Create src/components/markets/market-card-skeleton.tsx loading state. Match exact layout of market-card with rounded-xl, overflow-hidden. Use animate-pulse on background divs for shimmer effect. Add random width variations for realism.
  - **Agent**: tailwind-specialist
- **Subtask 7.3**: Create src/components/markets/market-card-3d.tsx enhanced version. Install @react-three/fiber and @react-three/drei if needed. Use Canvas component with responsive sizing. Implement mouse tracking with useState and tilt calculation. Limit tilt to +/- 10 degrees for subtle effect.
  - **Agent**: react-architect
- **Subtask 7.4**: Create src/components/markets/market-grid.tsx container. Use grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6. Accept markets array, loading state, and onLoadMore callback. Render skeletons when loading, MarketCard components when data available.
  - **Agent**: tailwind-specialist
- **Subtask 7.5**: Create src/components/markets/market-list.tsx alternative view. Use flex flex-col gap-4. Each item uses horizontal card layout with aspect-video or similar. Add sortable headers using Table components from Shadcn.
  - **Agent**: tailwind-specialist
- **Subtask 7.6**: Create src/components/markets/market-card-price.tsx price display. Accept outcomes array and format prices as percentages. Add TrendingUp/TrendingDown icons for price change indication. Color-code using getPriceColor utility.
  - **Agent**: tailwind-specialist
- **Subtask 7.7**: Create src/components/markets/market-card-meta.tsx metadata. Format volume with formatLargeNumber utility (K, M, B suffixes). Display liquidity as badge with level (low, medium, high). Show time remaining with formatRelativeTime utility and appropriate icon.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Use memo() for components that re-render frequently (grid items)
- Implement proper loading states before data renders
- Use semantic class names following BEM-like convention
- Apply consistent hover/focus states across all cards
- Ensure accessible contrast ratios and tap target sizes (44px minimum)

---

### Task 8: Price Chart Component

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/charts/price-chart.tsx
- component: src/components/charts/price-chart-tooltip.tsx
- component: src/components/charts/price-chart-controls.tsx
- component: src/components/charts/mini-sparkline.tsx
- hook: src/hooks/use-chart-data.ts

**Implementation**: Create interactive price chart using Recharts library. In price-chart.tsx, build main chart component with LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, and Brush components. Use simulated price history data from useMarketHistory hook. Implement zoom functionality by syncing Brush with main chart area. Add gradient fill area under line using Area and Gradient defs. Configure Y-axis with percentage format (0-100%), X-axis with date/time labels based on selected time range. Add crosshair behavior on mouse hover showing price at cursor. Implement smooth line with curve="monotone" and strokeWidth=2. In price-chart-tooltip.tsx, create custom tooltip component showing date/time, price, and change from previous point. Use styled div with elevation-2, rounded-lg, and proper padding. Add animation for smooth appearance. In price-chart-controls.tsx, add time range selector buttons (1H, 6H, 1D, 1W, 1M, ALL) that update chart data range. Add chart type toggle (line/candlestick if supported). Add fullscreen button for expanded view. In mini-sparkline.tsx, create compact sparkline component for use in market cards and summary views. Use simplified line chart without axes or grid, showing only the line with color indicating direction (green for up, red for down). In use-chart-data.ts hook, process raw price history into chart-friendly format. Implement data aggregation for different time ranges (e.g., averaging points for 1W view). Add caching for processed data to avoid reprocessing on re-renders.

**Subtasks**:
- **Subtask 8.1**: Create src/components/charts/price-chart.tsx main component. Install recharts if not present. Use ResponsiveContainer with width="100%" and height={400}. Configure LineChart with data prop from useMarketHistory. Add two Line elements for current and comparison prices. Add gradient defs using LinearGradient.
  - **Agent**: react-architect
- **Subtask 8.2**: Create src/components/charts/price-chart-tooltip.tsx custom tooltip. Accept active and payload props from Recharts. Format date with date-fns formatDateTime. Calculate change percentage from first point in payload. Style with bg-background, border, rounded-lg, shadow-md.
  - **Agent**: react-architect
- **Subtask 8.3**: Create src/components/charts/price-chart-controls.tsx toolbar. Add ButtonGroup for time range selection with active state styling. Add ChartTypeToggle with line/area options. Add FullscreenButton using full screen API. Persist selected range in localStorage.
  - **Agent**: tailwind-specialist
- **Subtask 8.4**: Create src/components/charts/mini-sparkline.tsx compact chart. Use height={40} with minimal styling. Add color prop for line color (green for positive, red for negative). Remove axes, grid, and tooltips. Show only line with strokeWidth=1.5.
  - **Agent**: react-architect
- **Subtask 8.5**: Create src/hooks/use-chart-data.ts data processor. Accept priceHistory array and timeRange. Implement data point aggregation (reduce resolution for longer ranges). Add caching using useMemo with dependencies on history and range. Return processed data with x (timestamp) and y (price) properties.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Use memo() for chart components to prevent unnecessary re-renders
- Implement proper data formatting in hook, not component
- Use CSS variables for chart colors to support theming
- Ensure responsive behavior on all screen sizes
- Add aria-label for screen readers describing chart content

---

### Task 9: Order Book Visual Component

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/trading/order-book-visual.tsx
- component: src/components/trading/order-book-row.tsx
- component: src/components/trading/order-book-summary.tsx
- component: src/components/trading/depth-chart.tsx
- hook: src/hooks/use-order-book-data.ts

**Implementation**: Create visual representation of order book without real trading functionality. In order-book-visual.tsx, build main component displaying simulated order book with two-sided view: bids (buy orders) on left/bottom in green, asks (sell orders) on right/top in red. Use table layout with price, size (amount), and total columns. Implement price level grouping (aggregate orders at same price). Add visual depth bar using horizontal progress bars proportional to size at each price level. Highlight current market price with separator line. Add animation for price updates with flash effect on changed rows. In order-book-row.tsx, create individual row component with price, size, total columns. Add color coding based on side (green-500 for bids, red-500 for asks). Implement hover state showing total USD value. Add micro-animations for row entrance with stagger effect. In order-book-summary.tsx, create summary bar showing spread (difference between best bid and ask), total bid volume, total ask volume, and imbalance indicator. Use visual bar showing bid/ask ratio. In depth-chart.tsx, create visualization of order book depth using horizontal bar chart. X-axis represents price, Y-axis represents cumulative volume. Show bid curve in green, ask curve in red. Gap between curves represents spread. Add interactive crosshair showing price and volume at cursor. In use-order-book-data.ts hook, generate simulated order book data based on market's current price. Create realistic distribution using log-normal distribution centered around current price. Add random perturbations for realism. Implement update simulation that randomly modifies orders every few seconds.

**Subtasks**:
- **Subtask 9.1**: Create src/components/trading/order-book-visual.tsx main component. Use two-column layout: bids on left (green), asks on right (red). Table with headers for Price, Size, Total. Generate simulated data using use-order-book-data hook. Add current price separator line. Use fixed height with overflow for scrollable content.
  - **Agent**: react-architect
- **Subtask 9.2**: Create src/components/trading/order-book-row.tsx row component. Accept price, size, total, side (bid/ask) props. Format price as percentage (0-100). Format size with K/M/B suffixes. Add horizontal depth bar as background div with width proportional to size relative to max.
  - **Agent**: tailwind-specialist
- **Subtask 9.3**: Create src/components/trading/order-book-summary.tsx summary bar. Display spread value and percentage. Show total bid volume in green, total ask volume in red. Add imbalance indicator: "Buyers" or "Sellers" based on volume ratio. Use flex row with proper spacing.
  - **Agent**: tailwind-specialist
- **Subtask 9.4**: Create src/components/trading/depth-chart.tsx visualization. Use Recharts AreaChart with two areas (bids, asks). X-axis: price percentage, Y-axis: cumulative volume. Fill areas with semi-transparent colors (green-500/20 for bids, red-500/20 for asks). Add crosshair tooltip showing exact values.
  - **Agent**: react-architect
- **Subtask 9.5**: Create src/hooks/use-order-book-data.ts hook for simulated data. Accept currentPrice and liquidity props. Generate bid levels below current price, ask levels above. Use log-normal distribution for realistic shape. Implement updateEffect using setInterval to randomly modify orders every 3-5 seconds.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Use consistent color coding (green=buy/bid, red=sell/ask)
- Format numbers consistently across components
- Implement smooth transitions for data updates
- Use semantic HTML (table, thead, tbody) for tabular data
- Ensure mobile responsiveness with horizontal scroll if needed

---

### Task 10: Portfolio Components

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/portfolio/portfolio-summary.tsx
- component: src/components/portfolio/positions-table.tsx
- component: src/components/portfolio/position-card.tsx
- component: src/components/portfolio/allocation-chart.tsx
- component: src/components/portfolio/performance-chart.tsx
- component: src/components/portfolio/pnl-badge.tsx

**Implementation**: Create portfolio visualization components using data from Supabase user_portfolios table. In portfolio-summary.tsx, create summary cards displaying total portfolio value, total PnL (absolute and percentage), today's change, and number of active positions. Use grid layout with responsive columns. Implement color coding for PnL (green for positive, red for negative). Add trend indicators showing daily/weekly change. Add subtle animations on value updates. Fetch portfolio data using usePortfolioStore which queries Supabase. In positions-table.tsx, create table component with columns: market question, outcome, size, avg price, current price, PnL, actions. Use Shadcn Table components. Implement sortable columns by clicking headers. Add status badges for position state (active, closed). Add row click to navigate to market detail. Data comes from user_portfolios table joined with markets table. In position-card.tsx, create card version of position for mobile view. Display market question as title, outcome badge, key metrics (size, PnL), and action buttons. Use vertical layout for better mobile experience. In allocation-chart.tsx, create donut chart using Recharts PieChart. Show allocation by category (Crypto, Politics, Sports, etc.) based on portfolio positions. Add legend with color indicators. Display percentage and value in center text. Add interactive tooltip on hover. In performance-chart.tsx, create line chart showing portfolio value over time. Query historical portfolio value from snapshots or calculate from market_prices history. Add time range selector (1D, 1W, 1M, ALL). Highlight peak and trough values. In pnl-badge.tsx, create reusable badge component for PnL display. Show absolute value and percentage. Add arrow icon indicating direction. Color-code based on positive/negative/neutral. Support different sizes for various contexts.

**Subtasks**:
- **Subtask 10.1**: Create src/components/portfolio/portfolio-summary.tsx with summary cards. Use grid grid-cols-2 lg:grid-cols-4 gap-4. Each card uses Card component with Icon, Label, Value, Change subcomponents. Calculate totals from usePortfolioStore (which queries Supabase). Add framer-motion animations for initial load.
  - **Agent**: react-architect
- **Subtask 10.2**: Create src/components/portfolio/positions-table.tsx with Shadcn Table. Define columns: question (truncated), outcome (badge), size (number), avgPrice (percentage), currentPrice (percentage), pnl (absolute + %), actions (menu). Data comes from user_portfolios table via usePortfolioStore. Implement sort with useState for column and direction. Add row onClick navigation.
  - **Agent**: react-architect
- **Subtask 10.3**: Create src/components/portfolio/position-card.tsx for mobile. Use Card component with vertical layout. Header: market question with truncation. Body: outcome badge, size, avg price, current price, PnL badge. Footer: action buttons (view market, close position). Show as alternative to table on mobile screens.
  - **Agent**: tailwind-specialist
- **Subtask 10.4**: Create src/components/portfolio/allocation-chart.tsx donut chart. Use Recharts PieChart with ResponsiveContainer. Calculate category totals from positions (join with markets table for category). Define color palette for categories. Add custom label showing percentage. Add Legend component with category names and values.
  - **Agent**: react-architect
- **Subtask 10.5**: Create src/components/portfolio/performance-chart.tsx line chart. Similar to PriceChart but showing portfolio value. Query historical data from market_prices table or calculate portfolio value over time. Add max/min value indicators with labels. Implement time range selection affecting data resolution.
  - **Agent**: react-architect
- **Subtask 10.6**: Create src/components/portfolio/pnl-badge.tsx reusable component. Accept value (number), showPercentage (boolean), size ('sm' | 'md' | 'lg'). Format with formatCurrency and formatPercentage. Add TrendingUp/TrendingDown icon from lucide-react based on sign. Color: green-500 for positive, red-500 for negative, gray-500 for neutral.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Use consistent number formatting across components
- Implement proper loading states before data renders
- Use semantic colors for financial indicators (green=positive, red=negative)
- Ensure responsive behavior with card view on mobile
- Add aria-labels for screen readers on all data displays

---

### Task 11: Price Alerts System

**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- component: src/components/alerts/alert-list.tsx
- component: src/components/alerts/alert-item.tsx
- component: src/components/alerts/create-alert-dialog.tsx
- component: src/components/alerts/alert-form.tsx
- component: src/components/alerts/alert-trigger-toast.tsx
- hook: src/hooks/use-alert-checker.ts

**Implementation**: Create price alerts system for monitoring market price changes with Supabase persistence. In alert-list.tsx, create list component displaying active and triggered alerts from price_alerts table. Use tabs to separate active from triggered alerts. Show market question, condition (above/below), target price, current price, and creation time. Add edit and delete actions for active alerts. Implement empty state with call-to-action to create new alert. In alert-item.tsx, create individual alert card/row. Display market info with link to market detail. Show condition with icon (ArrowUp for above, ArrowDown for below). Show progress bar indicating how close current price is to target. Add status badge (active, triggered, expired). In create-alert-dialog.tsx, create dialog for creating new alerts. Use Shadcn Dialog components. Include market selector with search, condition selector (above/below radio), target price slider (0-100%), and notification preference toggle. In alert-form.tsx, create form component with validation using Zod schema. Market ID required, condition required, target price must be between 0 and 1. Implement form submission handling inserting to price_alerts table via Supabase with toast feedback. In alert-trigger-toast.tsx, create special toast notification for triggered alerts. Show urgent styling with animation. Include market name, trigger condition met, and action button to view market. In use-alert-checker.ts hook, implement periodic checking of alerts against current market prices from market_prices table. Use setInterval with configurable interval (default 30 seconds). Fetch current prices for markets with active alerts. Compare with target prices and trigger alerts when condition met by updating price_alerts table. Mark triggered alerts and show toast notification.

**Subtasks**:
- **Subtask 11.1**: Create src/components/alerts/alert-list.tsx main container. Use Tabs component for active/triggered views. Map through alerts from useAlertStore. Render AlertItem for each alert. Add empty state with illustration and "Create Alert" button. Implement delete confirmation dialog.
  - **Agent**: react-architect
- **Subtask 11.2**: Create src/components/alerts/alert-item.tsx individual alert. Accept alert prop from useAlertStore. Display market question with link to /markets/[slug]. Show condition with color-coded badge (green for above, red for below). Add progress bar: width = (currentPrice / targetPrice) * 100 for above, reverse for below. Add delete button with confirmation.
  - **Agent**: tailwind-specialist
- **Subtask 11.3**: Create src/components/alerts/create-alert-dialog.tsx dialog. Use Dialog, DialogTrigger, DialogContent from Shadcn. Header with "Create Price Alert" title. Body containing AlertForm. Footer with Cancel and Create buttons. Control open state with useState.
  - **Agent**: react-architect
- **Subtask 11.4**: Create src/components/alerts/alert-form.tsx form. Use react-hook-form with Zod validation. Market selector: use Combobox from Shadcn with search. Condition: RadioGroup with above/below options. Target price: Slider with 0-100 range and live value display. Submit handler calls addAlert from useAlertStore and shows toast.
  - **Agent**: react-forms-specialist
- **Subtask 11.5**: Create src/components/alerts/alert-trigger-toast.tsx notification. Use Toast component with special variant="alert". Add urgent styling with red accent, pulse animation. Display market name, condition ("Price went above X"), and "View Market" button linking to market. Auto-dismiss after 10 seconds (longer than normal toasts).
  - **Agent**: tailwind-specialist
- **Subtask 11.6**: Create src/hooks/use-alert-checker.ts monitoring hook. Initialize with useEffect checking alerts every interval. Fetch current prices using useMarkets hook filtered by alert market IDs. Compare prices: if condition is 'above' and currentPrice >= targetPrice, trigger; if 'below' and currentPrice <= targetPrice, trigger. Call triggerAlert from store, show alert-trigger-toast.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Use react-hook-form for form state and validation
- Implement Zod schemas for type-safe validation
- Add clear error messages for validation failures
- Use consistent styling for condition indicators (green=above, red=below)
- Ensure alerts are checked efficiently with debouncing

---

### Task 12: Theme System

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/theme/theme-provider.tsx
- component: src/components/theme/theme-toggle.tsx
- component: src/components/theme/theme-switch.tsx
- lib: src/lib/theme.ts

**Implementation**: Create comprehensive theme system supporting light and dark modes. In theme-provider.tsx, create context provider managing theme state. Detect initial theme from localStorage or system preference using matchMedia('(prefers-color-scheme: dark)'). Provide toggleTheme, setTheme, and theme values. Apply theme to document.documentElement using data-theme attribute. Listen for system preference changes and update automatically. In theme-toggle.tsx, create button component for theme switching. Show sun icon in light mode, moon icon in dark mode. Add rotation animation on toggle. Use useTheme hook to access theme state. In theme-switch.tsx, create switch component as alternative theme toggle. Use Shadcn Switch with sun/moon thumb icons. Add label showing current theme name. In theme.ts utility library, create helper functions for theme-related operations. Implement getTheme() reading from localStorage or system. Implement setTheme() writing to localStorage and updating DOM. Add CSS custom properties for theme colors in globals.css with light/dark variants. Define semantic tokens: --background, --foreground, --primary, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent, --accent-foreground, --destructive, --destructive-foreground, --border, --input, --ring. Ensure all colors work in both themes with proper contrast ratios.

**Subtasks**:
- **Subtask 12.1**: Create src/components/theme/theme-provider.tsx context provider. Use createContext with ThemeContextValue type. Implement ThemeProvider component with children prop. Detect theme from localStorage 'theme' key or system preference. Add useEffect for system pref change listener. Apply theme to document.documentElement.classList.
  - **Agent**: react-hooks-specialist
- **Subtask 12.2**: Create src/components/theme/theme-toggle.tsx button component. Use Button from Shadcn with variant="ghost". Show Sun icon in dark mode, Moon icon in light mode from lucide-react. Add rotation animation with framer-motion (rotate-180). Call toggleTheme from useTheme hook.
  - **Agent**: tailwind-specialist
- **Subtask 12.3**: Create src/components/theme/theme-switch.tsx switch component. Use Switch from Shadcn. Add sun/moon icons to Thumb based on theme. Add label text "Dark Mode" or "Light Mode". Position in header or settings page.
  - **Agent**: tailwind-specialist
- **Subtask 12.4**: Create src/lib/theme.ts utility functions. Export getTheme() function returning 'light' | 'dark' | 'system'. Export setTheme(theme) function updating localStorage and DOM. Export subscribeToThemeChanges(callback) for system pref changes. Define CSS custom properties in string for dynamic injection.
  - **Agent**: react-hooks-specialist
- **Subtask 12.5**: Update src/app/globals.css with CSS custom properties. Define :root for light theme colors. Define .dark for dark theme colors. Use HSL values for consistent color manipulation. Add all semantic tokens from Shadcn default theme. Add transition rule for smooth theme switching: transition: background-color 0.3s, color 0.3s.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Use CSS custom properties for theme colors
- Ensure WCAG AA contrast ratios in both themes
- Add smooth transitions (300ms) for theme changes
- Persist user preference in localStorage
- Respect system preference by default

---

### Task 13: Toast Notification System

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/toast/toaster.tsx
- component: src/components/toast/use-toast.ts
- component: src/components/toast/toast.tsx
- hook: src/hooks/use-toast-notification.ts

**Implementation**: Create toast notification system for user feedback. In toaster.tsx, create container component managing toast queue. Use fixed positioning (bottom-right on desktop, top-center on mobile). Limit to 5 concurrent toasts, removing oldest when exceeding. Use framer-motion AnimatePresence for enter/exit animations (slide-in from right, fade-out on exit). Add swipe-to-dismiss gesture on mobile. In toast.tsx, create individual toast component with title, description, action button, close button, and variant-specific icon. Support variants: default (info), success (green), error (red), warning (yellow), alert (urgent). Add progress bar showing auto-dismiss countdown. Add click-to-dismiss functionality. In use-toast.ts hook, create toast management interface. Export toast() function accepting title, description, variant, action. Return dismiss function for manual dismissal. Implement queue management with unique IDs for each toast. In use-toast-notification.ts hook, create convenience hooks for common toasts: useSuccessToast, useErrorToast, useWarningToast. Each accepts message and optional duration.

**Subtasks**:
- **Subtask 13.1**: Create src/components/toast/toaster.tsx container. Use fixed bottom-4 right-4 positioning with z-50. Map through toasts from UI store. Render Toast component for each. Use AnimatePresence for exit animations. Implement max 5 toasts limit with FIFO removal.
  - **Agent**: react-architect
- **Subtask 13.2**: Create src/components/toast/toast.tsx individual toast. Accept toast prop with id, title, description, variant, action. Use Card component with elevation-3. Add variant-specific icon: CheckCircle (success), AlertCircle (error), AlertTriangle (warning), Info (default). Add close button (X) calling dismiss. Add progress bar with animation duration matching autoDismiss.
  - **Agent**: tailwind-specialist
- **Subtask 13.3**: Create src/components/toast/use-toast.ts hook. Export toast() function with options. Generate unique ID using crypto.randomUUID() or Date.now(). Add toast to UI store's toastQueue. Return object with dismiss function. Also export dismissAll() and dismissById(id) functions.
  - **Agent**: react-hooks-specialist
- **Subtask 13.4**: Create src/hooks/use-toast-notification.ts convenience hooks. Export useSuccessToast(message), useErrorToast(message), useWarningToast(message) returning functions that trigger toasts. Also export useToast() for custom variants. Add duration parameter with default 5000ms.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Use semantic colors for toast variants (success=green, error=red)
- Keep toasts concise (max 2 lines of description)
- Auto-dismiss after reasonable duration (5s default)
- Support keyboard dismissal (Escape key)
- Ensure accessible with ARIA live region

---

### Task 14: Search and Filter Components

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/search/search-bar.tsx
- component: src/components/search/command-palette.tsx
- component: src/components/filters/market-filters.tsx
- component: src/components/filters/filter-chip.tsx
- component: src/components/filters/filter-panel.tsx
- hook: src/hooks/use-market-search.ts

**Implementation**: Create search and filter components for market exploration. In search-bar.tsx, create input component with debounced search (500ms delay). Show search icon in left side, clear button in right side when has value. Use controlled input with searchQuery state from market store. Add keyboard shortcut focus (Cmd/Ctrl+K). In command-palette.tsx, create global command palette using Shadcn Command component. Trigger with Cmd/Ctrl+K. Show search input with fuzzy filtering. Display results in groups: Markets, Categories, Navigation. Add keyboard navigation (arrow keys, enter to select). In market-filters.tsx, create filter state management component. Accept filters prop and onFiltersChange callback. Include category multi-select, liquidity range slider, volume range slider, date range picker, and active/closed toggle. Show active filters count badge. Add clear all button. In filter-chip.tsx, create individual filter chip component. Display label with remove (x) button. Use variant based on filter type (category, tag, custom). Add press animation on remove. In filter-panel.tsx, create collapsible panel containing all filter controls. Use Accordion from Shadcn for grouped filters (Categories, Price Range, Date Range). Show filter count in panel header. Add apply/reset buttons. In use-market-search.ts hook, implement search logic with debouncing. Accept markets array and search query. Filter by question text and description. Support advanced operators (category:crypto, price:>0.5). Return filtered markets array.

**Subtasks**:
- **Subtask 14.1**: Create src/components/search/search-bar.tsx input. Use Input from Shadcn with left Search icon and right X button (conditional). Add hotkey hint (Cmd+K) displayed as kbd element. Implement debounce with useState + setTimeout. Update setSearchQuery in market store on change.
  - **Agent**: react-architect
- **Subtask 14.2**: Create src/components/search/command-palette.tsx global search. Use Dialog, Command, CommandInput, CommandList, CommandGroup, CommandItem from Shadcn. Trigger with useKeys hook listening for Cmd+K. Fetch markets, categories, nav items. Implement fuzzy search with highlight matching. Add keyboard navigation support.
  - **Agent**: react-architect
- **Subtask 14.3**: Create src/components/filters/market-filters.tsx container. Accept filters from market store. Render FilterPanel with all filter controls. Implement onFiltersChange calling setFilters in store. Show active count badge on filter button. Add reset function clearing all filters.
  - **Agent**: react-architect
- **Subtask 14.4**: Create src/components/filters/filter-chip.tsx individual filter. Accept label, onRemove, variant props. Use Badge component with close button styling. Add press animation using framer-motion (scale-95). Support variants: category, tag, custom (with colors).
  - **Agent**: tailwind-specialist
- **Subtask 14.5**: Create src/components/filters/filter-panel.tsx collapsible. Use Accordion from Shadcn with groups: Categories (checkboxes), Liquidity (slider), Volume (slider), Date Range (date inputs), Status (toggle). Add footer with Apply and Reset buttons. Persist collapsed state in localStorage.
  - **Agent**: react-architect
- **Subtask 14.6**: Create src/hooks/use-market-search.ts search logic. Accept markets: Market[] and query: string. Implement debounce with useMemo. Filter markets by question, description, tags including query. Support operators: category:xxx, active:true/false, minPrice:0.5. Return filtered array.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Use consistent debouncing (500ms) for search inputs
- Support keyboard shortcuts for power users
- Implement fuzzy search for better UX
- Show clear visual feedback for active filters
- Ensure filters combine correctly (AND logic)

---

### Task 15: 3D Effects and Animations

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/3d/particle-background.tsx
- component: src/components/3d/hero-3d-card.tsx
- component: src/components/animations/page-transition.tsx
- component: src/components/animations/stagger-children.tsx
- component: src/components/animations/number-tween.tsx
- lib: src/lib/animations.ts

**Implementation**: Create advanced visual effects using 3D and animations. In particle-background.tsx, create ambient particle system using Particles.js or React Three Fiber. Show floating particles in background with subtle movement. Configure particle count based on screen size (fewer on mobile). Add mouse interaction where particles react to cursor position. In hero-3d-card.tsx, create 3D tilting card component for hero section market cards. Use React Three Fiber with Canvas. Calculate rotation based on mouse position relative to card center. Add smooth interpolation using lerp. Limit rotation to +/- 15 degrees. Add depth effect with scale on hover. In page-transition.tsx, create page transition wrapper using framer-motion AnimatePresence. Define variants: fadeIn (opacity 0->1), slideUp (y: 20->0), slideInRight (x: 50->0). Apply different transitions per route type. In stagger-children.tsx, create container component for staggered child animations. Use framer-motion variants with staggerChildren property. Animate children entering one after another with configurable delay. In number-tween.tsx, create component for animating number changes. Use framer-motion useMotionValue and useTransform for smooth interpolation. Animate from oldValue to newValue over duration. Format as currency or percentage. In animations.ts, export animation variants and constants for reuse. Define common durations (fast: 150ms, normal: 300ms, slow: 500ms), easings (easeInOut, easeOut, spring), and variant objects.

**Subtasks**:
- **Subtask 15.1**: Create src/components/3d/particle-background.tsx using Particles.js. Install react-particles or tsparticles. Configure particles: count (screen-based), color (from theme), size (2-4px), speed (0.5-1), direction (random). Add interactivity: hover mode, click repulsion. Use fixed positioning with z-0 behind content.
  - **Agent**: react-architect
- **Subtask 15.2**: Create src/components/3d/hero-3d-card.tsx tilt effect. Install @react-three/fiber and @react-three/drei if needed. Use Canvas with perspective. Create mesh with plane geometry. Calculate rotation from mouse position. Use useFrame for smooth lerp animation. Add content layer as HTML overlay using Html from drei.
  - **Agent**: react-architect
- **Subtask 15.3**: Create src/components/animations/page-transition.tsx wrapper. Use AnimatePresence mode="wait". Define route variants in animations.ts. Wrap page content in motion.div. Listen to router events for transition trigger. Add loading state delay if needed.
  - **Agent**: react-architect
- **Subtask 15.4**: Create src/components/animations/stagger-children.tsx container. Accept children, staggerDelay (default 0.1s) props. Use motion.div with variants: hidden (opacity 0), visible (opacity 1, transition: { staggerChildren }). Export for use in lists, grids.
  - **Agent**: react-architect
- **Subtask 15.5**: Create src/components/animations/number-tween.tsx number animator. Accept value, format (currency, percentage), duration props. Use motionValue for current value. useAnimate for interpolation from prev to next value. Format displayed value with appropriate formatter. Call on value prop changes.
  - **Agent**: react-architect
- **Subtask 15.6**: Create src/lib/animations.ts animation library. Export duration constants: FAST, NORMAL, SLOW. Export easings: SPRING, EASE_IN_OUT. Export variant objects: fadeIn, slideUp, scaleIn. Export transition presets: default, enter, exit. Add JSDoc comments for usage examples.
  - **Agent**: react-architect

**Coding Standards**:
- Use CSS transforms over position changes for performance
- Add prefers-reduced-motion media query support
- Ensure 60fps animations (use will-change sparingly)
- Test animations on lower-end devices
- Provide option to disable animations in settings

---

### Task 16: Error Handling and Boundaries

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/error/error-boundary.tsx
- component: src/components/error/error-page.tsx
- component: src/components/error/error-fallback.tsx
- component: src/components/error/network-error.tsx
- page: src/app/error.tsx
- page: src/app/not-found.tsx

**Implementation**: Create comprehensive error handling system. In error-boundary.tsx, create React Error Boundary class component. Catch errors in component tree. Log errors to console.error with component stack. Display user-friendly error message. Provide retry button to reset boundary state. In error-page.tsx, create full-page error display. Use appropriate illustration (error graphic). Show error message if safe, generic message otherwise. Add "Go Home" button and "Retry" button. In error-fallback.tsx, create inline error component for sections. Use Card component with error styling. Show brief message and retry button. Collapsed by default, expandable for details. In network-error.tsx, create network error display for API failures. Detect offline status with navigator.onLine. Show appropriate message for offline vs server error. Add retry with exponential backoff. In app/error.tsx, create Next.js error page. Use error.tsx file convention for App Router. Export default Error component. Display error-page with appropriate styling. In app/not-found.tsx, create 404 page. Use not-found.tsx file convention. Show friendly 404 message with illustration. Add search bar and popular links.

**Subtasks**:
- **Subtask 17.1**: Create src/components/error/error-boundary.tsx class component. Extend Component<{children: ReactNode}, {hasError: boolean, error: Error | null}>. Implement static getDerivedStateFromError catching errors. Implement componentDidLifecycle logging. Render children or ErrorFallback based on state.
  - **Agent**: react-architect
- **Subtask 17.2**: Create src/components/error/error-page.tsx full page. Use flex column centered layout. Add illustration using SVG or icon. Show heading "Something went wrong" and message from error if safe. Add Button for retry and Link for home.
  - **Agent**: tailwind-specialist
- **Subtask 17.3**: Create src/components/error/error-fallback.tsx inline. Use Card with border-destructive styling. Show AlertTriangle icon. Brief message: "This section failed to load". Add retry button calling resetErrorBoundary. Add detail section with error stack (toggleable).
  - **Agent**: tailwind-specialist
- **Subtask 17.4**: Create src/components/error/network-error.tsx API error. Detect online status with useOnlineStatus hook. Show "You're offline" message if disconnected, "Server error" otherwise. Add retry button implementing exponential backoff. Show retry countdown after failed attempts.
  - **Agent**: react-hooks-specialist
- **Subtask 17.5**: Create src/app/error.tsx Next.js error page. Export Error component accepting error prop and reset function. Render ErrorPage component. Add specific handling for common errors (404, 500, 503). Use appropriate illustration per error type.
  - **Agent**: react-architect
- **Subtask 17.6**: Create src/app/not-found.tsx 404 page. Export NotFound component. Show friendly "Page not found" message. Add illustration. Include search bar redirecting to markets. Add links to Home, Markets, Portfolio sections.
  - **Agent**: react-architect

**Coding Standards**:
- Log all errors to console for debugging
- Never expose sensitive data in error messages
- Provide clear next steps for users
- Test error states in development
- Use semantic HTTP status codes

---

### Task 17: Performance Optimization

**Recommended Agent**: react-architect

**Files to create/change**:
- config: src/config/performance.config.ts
- component: src/components/performance/image-optimizer.tsx
- component: src/components/performance/virtual-list.tsx
- hook: src/hooks/use-debounce.ts
- hook: src/hooks/use-throttle.ts
- hook: src/hooks/use-deferred-value.ts

**Implementation**: Implement performance optimizations throughout app. In performance.config.ts, define performance-related constants. Set image quality thresholds, animation frame rates, cache TTLs. Configure breakpoints for virtualization. Define feature flags for heavy features (3D effects, particles). In image-optimizer.tsx, create optimized image component. Use Next.js Image component with proper sizing. Implement lazy loading for below-fold images. Add blur placeholder during load. Support responsive sizes with srcSet. In virtual-list.tsx, create virtualized list for long content. Use react-window or tanstack-virtual. Render only visible items plus buffer. Implement variable height support. Add sticky headers for sections. In use-debounce.ts hook, create debounce hook. Accept value and delay. Return debounced value that updates after delay. Use for search inputs, filter changes. In use-throttle.ts hook, create throttle hook. Accept function and delay. Return throttled function. Use for scroll handlers, resize handlers. In use-deferred-value.ts hook, wrap React.useDeferredValue for less urgent updates. Use for search results, filtered lists. Show previous value during computation.

**Subtasks**:
- **Subtask 18.1**: Create src/config/performance.config.ts constants. Export IMAGE_QUALITY (85), LAZY_THRESHOLD (200px), VIRTUAL_LIST_ITEM_HEIGHT (80px), PARTICLE_COUNT (desktop: 100, mobile: 30), ANIMATION_FPS (60). Add feature flags: enable3D, enableParticles, enableVirtualScroll.
  - **Agent**: react-architect
- **Subtask 18.2**: Create src/components/performance/image-optimizer.tsx image. Use Next.js Image with width, height, quality props. Add placeholder="blur" with data URL. Implement priority prop for above-fold images. Add fill variant for responsive containers. Handle load error with fallback.
  - **Agent**: react-architect
- **Subtask 18.3**: Create src/components/performance/virtual-list.tsx virtualized list. Install @tanstack/react-virtual. Accept data array, renderItem function, estimatedItemSize. Use useVirtualizer for rendering only visible items. Implement overscan for smooth scrolling. Add sticky header support.
  - **Agent**: react-architect
- **Subtask 18.4**: Create src/hooks/use-debounce.ts hook. Accept value: T and delay: number (default 500). Use useState with useEffect and setTimeout. Return debounced value. Cleanup timeout on value change or unmount. Use for search, filter inputs.
  - **Agent**: react-hooks-specialist
- **Subtask 18.5**: Create src/hooks/use-throttle.ts hook. Accept callback function and delay (default 200). Use useRef to track last execution time. Return throttized function. Use for scroll, resize, mousemove handlers.
  - **Agent**: react-hooks-specialist
- **Subtask 18.6**: Create src/hooks/use-deferred-value.ts wrapper. Accept value and timeout (default 5000). Wrap React.useDeferredValue for transition updates. Return deferred value and isPending boolean. Use for search results, heavy computations.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Profile performance before and after optimizations
- Use React.memo() for expensive components
- Implement code splitting for heavy features
- Lazy load routes and components
- Monitor Core Web Vitals in production

---

### Task 18: Testing Infrastructure

**Recommended Agent**: testing-specialist

**Files to create/change**:
- config: vitest.config.ts
- config: setup-tests.ts
- test: src/__tests__/components/market-card.test.tsx
- test: src/__tests__/hooks/use-markets.test.ts
- test: src/__tests__/stores/market.store.test.ts
- test: src/__tests__/services/gamma.service.test.ts

**Implementation**: Set up testing infrastructure using Vitest for unit and integration tests. In vitest.config.ts, configure Vitest with test environment (jsdom), setup files, coverage thresholds. Add aliases matching tsconfig. Configure globals for describe, it, expect. In setup-tests.ts, configure test environment. Set up mocks for window.matchMedia (theme), localStorage. Configure vi.clearAllMocks() before each test. Create test utilities for renderWithProviders, mockMarket, mockPosition. In market-card.test.tsx, test MarketCard component. Test rendering with props, hover states, bookmark click, navigation click. Use @testing-library/react queries. Mock useMarketStore and useNavigate. In use-markets.test.ts, test useMarkets hook. Mock gamma service responses. Test loading state, success state, error state. Test refetch functionality. In market.store.test.ts, test Zustand store. Test state updates via actions. Test filter application. Test sort functionality. Test localStorage persistence. In gamma.service.test.ts, test API service. Mock fetch globally. Test request URL generation. Test caching behavior. Test error handling.

**Subtasks**:
- **Subtask 19.1**: Create vitest.config.ts test configuration. Set testEnvironment to 'jsdom'. Add setupFiles pointing to setup-tests.ts. Configure coverage with thresholds (statements: 70, branches: 70, functions: 70, lines: 70). Add alias for @/* imports.
  - **Agent**: testing-specialist
- **Subtask 19.2**: Create setup-tests.ts test setup. Mock matchMedia API for theme tests. Mock localStorage with in-memory implementation. Add global test utilities. Configure cleanup before each test. Add custom matchers for snapshots.
  - **Agent**: testing-specialist
- **Subtask 19.3**: Create src/__tests__/components/market-card.test.tsx. Test render: question, price, category badge visible. Test hover: elevation increase. Test bookmark: store method called. Test click: navigation triggered. Use render, screen, fireEvent from @testing-library/react.
  - **Agent**: testing-specialist
- **Subtask 19.4**: Create src/__tests__/hooks/use-markets.test.ts. Mock gamma service. Test initial loading state true. Test success: data returned, loading false. Test error: error set, loading false. Test refetch: service called again. Use renderHook, act from @testing-library/react.
  - **Agent**: testing-specialist
- **Subtask 19.5**: Create src/__tests__/stores/market.store.test.ts. Test initial state. Test setMarkets action. Test setFilters with filter application. Test setSort with sorted results. Test localStorage persistence with persist middleware. Use renderHook from @testing-library/react.
  - **Agent**: testing-specialist
- **Subtask 19.6**: Create src/__tests__/services/gamma.service.test.ts. Mock fetch with vi.stubGlobal. Test fetchMarkets: URL params correct. Test caching: second call returns cached. Test error: returns empty array, logs error. Use expect, vi from vitest.
  - **Agent**: testing-specialist

**Coding Standards**:
- Write tests before or alongside implementation (TDD)
- Test user behavior, not implementation details
- Use descriptive test names (should X when Y)
- Mock external dependencies (API, browser APIs)
- Maintain 70%+ coverage threshold

---

### Task 19: Documentation and Developer Experience

**Recommended Agent**: react-architect

**Files to create/change**:
- doc: README.md
- doc: CONTRIBUTING.md
- doc: docs/ARCHITECTURE.md
- doc: docs/API-REFERENCE.md
- doc: docs/COMPONENT-LIBRARY.md
- doc: .env.example

**Implementation**: Create comprehensive documentation for developers. In README.md, write project overview with features, tech stack, setup instructions, development workflow. Include prerequisites (Node.js 18+, npm/pnpm). Provide quick start commands for install, dev, build. Add screenshots or demo links. In CONTRIBUTING.md, document contribution guidelines. Set up git workflow (branch naming, commit message format, PR template). Document code style (TypeScript strict, Prettier config). Add testing guidelines. In ARCHITECTURE.md, document system architecture. Describe folder structure and naming conventions. Explain data flow from API to components. Document state management strategy. Include architecture diagram using Mermaid. In API-REFERENCE.md, document Gamma API integration. List all endpoints with parameters. Describe service layer functions. Document caching strategy. Include TypeScript interface definitions. In COMPONENT-LIBRARY.md, document all components. Group by feature (markets, portfolio, shared). Provide props tables and usage examples. Add Storybook-style documentation. In .env.example, provide environment variable template. Document each variable with description and default value. Include API URLs, feature flags.

**Subtasks**:
- **Subtask 20.1**: Create README.md project documentation. Write overview paragraph describing Polymarket clone. List features: market explorer, price charts, portfolio, alerts, theme switching. Add tech stack section with versions. Provide quick start: npm install, npm run dev, open http://localhost:3000. Add screenshots section.
  - **Agent**: react-architect
- **Subtask 20.2**: Create CONTRIBUTING.md guidelines. Document branch naming (feat/, fix/, docs/). Specify commit message format: type(scope): description. Provide PR template with description, testing, checklist. Add code style section referencing .prettierrc.
  - **Agent**: react-architect
- **Subtask 20.3**: Create docs/ARCHITECTURE.md system docs. Describe folder structure: /app (routes), /components (UI), /stores (state), /hooks (custom hooks), /services (API), /types (TypeScript), /lib (utilities). Draw data flow diagram (API -> Service -> Query -> Store -> Component). Explain TanStack Query caching strategy.
  - **Agent**: react-architect
- **Subtask 20.4**: Create docs/API-REFERENCE.md API docs. Document Gamma API base URL: https://gamma-api.polymarket.com. List /markets endpoint with 30+ parameters. Document GammaService class methods. Show example requests/responses. Document caching TTL configuration.
  - **Agent**: react-hooks-specialist
- **Subtask 20.5**: Create docs/COMPONENT-LIBRARY.md component catalog. Organize by domain: Markets (MarketCard, MarketGrid), Portfolio (PositionCard, AllocationChart), Shared (Button, Card, Dialog). For each component: name, description, props table, usage example, screenshot. Add import paths.
  - **Agent**: react-architect
- **Subtask 20.6**: Update .env.example environment template. Add NEXT_PUBLIC_GAMMA_API_URL=https://gamma-api.polymarket.com. Add NEXT_PUBLIC_APP_NAME=Palpiteiros. Add NEXT_PUBLIC_DEFAULT_THEME=system. Add NEXT_PUBLIC_USE_MOCK=false. Document each variable with inline comments.
  - **Agent**: react-architect

**Coding Standards**:
- Keep documentation in sync with code changes
- Use clear, concise language
- Include code examples for all APIs
- Provide diagrams for complex flows
- Review documentation for clarity regularly

---

### Task 20: Design System Foundation - Apple + Material Fusion

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- config: src/config/design-tokens.ts
- css: src/styles/design-system.css
- lib: src/lib/design-tokens.ts
- lib: src/lib/animation-curves.ts
- lib: src/lib/elevation-system.ts

**Implementation**: Create comprehensive design system fusing Apple's fluid aesthetics with Material Design's structure. Define color palette with semantic tokens: primary (#6366f1), secondary (#8b5cf6), success (#10b981), warning (#f59e0b), danger (#ef4444), info (#3b82f6), neutral grays (50-950). Create semantic color variants for light/dark themes with CSS custom properties. Define typography scale inspired by Apple SF Pro: display (48px), headline (32px), title (24px), body (16px), caption (14px), label (12px). Set up spacing system using 8px base grid: 0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Create elevation system with 8 levels: elevation-0 (none), elevation-1 (subtle shadow), elevation-2 (card default), elevation-3 (card hover), elevation-4 (modal/drawer), elevation-5 (dropdown/popover), elevation-6 (tooltip), elevation-7 (overlay). Each elevation includes blur backdrop filter for glassmorphism. Define animation timing curves matching Apple's fluid motion: ease-in-out-cubic (standard), spring-physics (bouncy), linear-gradual (slow transitions). Create border radius scale: sm (4px), md (8px), lg (12px), xl (16px), 2xl (24px), full (9999px). Define transition duration tokens: instant (100ms), fast (150ms), normal (250ms), slow (350ms), slower (500ms). Create component variant system (primary, secondary, ghost, outline) with consistent hover/focus/active states.

**Subtasks**:
- **Subtask 20.1**: Create src/config/design-tokens.ts with all token definitions. Export ColorTokens, TypographyTokens, SpacingTokens, ElevationTokens, AnimationTokens, BorderRadiusTokens interfaces. Add JSDoc examples for each token usage.
  - **Agent**: tailwind-specialist
- **Subtask 20.2**: Create src/styles/design-system.css with CSS custom properties. Define :root variables for all colors, spacing, typography, shadows, animations. Add .dark class overrides for dark theme colors. Add transition rules for smooth theme switching.
  - **Agent**: tailwind-specialist
- **Subtask 20.3**: Create src/lib/design-tokens.ts utility functions. Export getColor() for semantic color access, getSpacing() for spacing values, getTypography() for font configs, getElevation() for shadow/blur values. Add theme-aware variants.
  - **Agent**: react-architect
- **Subtask 20.4**: Create src/lib/animation-curves.ts with Apple-inspired easing functions. Export cubicBezier values: standard (0.4, 0.0, 0.2, 1), emphasis (0.0, 0.0, 0.2, 1), decelerate (0.0, 0.0, 0.2, 1), accelerate (0.4, 0.0, 1, 1), sharp (0.4, 0.0, 0.6, 1). Export spring physics config for Framer Motion.
  - **Agent**: react-architect
- **Subtask 20.5**: Create src/lib/elevation-system.ts with elevation utilities. Export getElevationStyles(level) returning shadow and backdrop blur. Implement elevation transitions with smooth shadow interpolation. Add elevation hover states.
  - **Agent**: react-architect
- **Subtask 20.6**: Update Tailwind config to use design tokens. Extend theme with colors, spacing, typography, boxShadow, borderRadius from design tokens. Add animation keyframes: fadeIn, slideUp, slideDown, slideIn, pulse, spin, bounce, shimmer.
  - **Agent**: tailwind-specialist
- **Subtask 20.7**: Create design system documentation in docs/DESIGN-SYSTEM.md. Document all tokens with examples. Provide component usage guidelines. Include color palette visual swatches. Add animation timing curve visualizations.
  - **Agent**: react-architect

**Coding Standards**:
- Use CSS custom properties for theme switching
- Ensure WCAG AA contrast ratios (4.5:1 minimum)
- Test color combinations in both light/dark themes
- Maintain 8px base grid for spacing consistency
- Use semantic naming for all design tokens

---

### Task 21: Particle Effects System

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/particles/particle-system.tsx
- component: src/components/particles/particle-background.tsx
- component: src/components/particles/mouse-trail-particles.tsx
- component: src/components/particles/depth-particles.tsx
- hook: src/hooks/use-particle-config.ts
- lib: src/lib/particle-utils.ts

**Implementation**: Create sophisticated particle system for ambient backgrounds and interactive effects. In particle-system.tsx, build reusable particle engine using canvas or React Three Fiber. Support particle counts from 30 (mobile) to 150 (desktop). Implement particle properties: position (x, y), velocity (vx, vy), size (radius), opacity (alpha), color (from theme), life (for fading particles). Add mouse interaction where particles flee from or attract to cursor. Implement particle depth layers (foreground, midground, background) with different sizes and speeds for parallax effect. In particle-background.tsx, create ambient background component. Use fixed positioning with z-0 behind all content. Configure subtle movement (0.5-1px/frame). Add connection lines between nearby particles for network effect. In mouse-trail-particles.tsx, create cursor-following particles. Spawn particles on mouse move. Fade out over 1-2 seconds. Add glow effect for visual appeal. In depth-particles.tsx, create multi-layer particle system for depth perception. 3 layers with different sizes (small/medium/large), speeds (slow/medium/fast), and opacities. Apply CSS transform: translateZ() for true depth. In use-particle-config.ts hook, create responsive particle configuration. Return particle count, size range, speed based on screen size and user preferences (particle_effects_enabled in user store). In particle-utils.ts, export utility functions: createParticle(), updateParticlePosition(), drawParticle(), calculateDistance().

**Subtasks**:
- **Subtask 21.1**: Create src/components/particles/particle-system.tsx core engine. Use HTML5 Canvas with useRef for performance. Implement requestAnimationFrame loop. Create Particle class with update() and draw() methods. Support 1000+ particles efficiently.
  - **Agent**: react-architect
- **Subtask 21.2**: Create src/components/particles/particle-background.tsx ambient effect. Initialize particles with random positions. Set velocity to random small values. Implement connection lines using calculateDistance() utility. Add theme-aware colors.
  - **Agent**: react-architect
- **Subtask 21.3**: Create src/components/particles/mouse-trail-particles.tsx interactive effect. Track mouse position with useState. Spawn 5-10 particles per move event. Implement fade-out animation by decreasing opacity over time. Remove particles when opacity <= 0.
  - **Agent**: react-architect
- **Subtask 21.4**: Create src/components/particles/depth-particles.tsx layered effect. Create 3 particle arrays for each depth layer. Configure layer properties: size (bg: 1-2px, mid: 2-4px, fg: 4-6px), speed (bg: 0.2, mid: 0.5, fg: 1.0), opacity (bg: 0.3, mid: 0.6, fg: 0.8). Apply CSS perspective for 3D effect.
  - **Agent**: react-architect
- **Subtask 21.5**: Create src/hooks/use-particle-config.ts responsive config. Detect screen size with window.innerWidth. Return config: count (mobile: 30, tablet: 60, desktop: 100), minSize, maxSize, speedMultiplier. Check user store for particle_effects_enabled preference.
  - **Agent**: react-hooks-specialist
- **Subtask 21.6**: Create src/lib/particle-utils.ts utility functions. Export createParticle(config) returning Particle object. Export updateParticlePosition(particle, bounds) handling wall collisions. Export drawParticle(ctx, particle) rendering to canvas. Export calculateDistance(p1, p2) returning Euclidean distance.
  - **Agent**: react-architect
- **Subtask 21.7**: Add particle performance optimization. Implement object pooling for particle reuse. Use requestAnimationFrame with delta time for consistent speed across refresh rates. Add pause when off-screen (IntersectionObserver). Provide disable option in settings.
  - **Agent**: react-architect

**Coding Standards**:
- Maintain 60fps performance (use Canvas instead of DOM nodes)
- Use requestAnimationFrame for smooth animations
- Implement object pooling to reduce garbage collection
- Pause particles when tab is inactive (Page Visibility API)
- Test on mobile devices (limit particle count for performance)

---

### Task 22: 3D Card System with Tilt Effect

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/3d/card-3d.tsx
- component: src/components/3d/tilt-card.tsx
- component: src/components/3d/glass-card.tsx
- component: src/components/3d/holographic-card.tsx
- hook: src/hooks/use-card-tilt.ts
- lib: src/lib/3d-utils.ts

**Implementation**: Create 3D card system with Apple-style depth and interactivity. In card-3d.tsx, build base 3D card component using CSS 3D transforms. Add perspective container with perspective: 1000px. Implement rotation on X and Y axes based on mouse position. Add smooth interpolation using lerp for fluid motion. Include specular highlight effect for glass-like appearance. In tilt-card.tsx, create tilt effect wrapper. Track mouse position relative to card center. Calculate rotation: rotateX = (mouseY - centerY) * sensitivity, rotateY = (mouseX - centerX) * sensitivity. Limit rotation to +/- 15 degrees. Add spring physics for natural settling when mouse leaves. In glass-card.tsx, create glassmorphism card. Apply backdrop-filter: blur(20px) for frosted glass effect. Add subtle border (1px solid rgba(255,255,255,0.1)). Implement background gradient with transparency. Add shadow depth with colored glow. In holographic-card.tsx, create premium holographic effect. Add iridescent gradient overlay that shifts with card rotation. Implement rainbow border using conic-gradient. Add subtle sparkle particles on hover. In use-card-tilt.ts hook, encapsulate tilt logic. Track mouse position with useState. Calculate tilt angles with useMemo. Add spring animation using Framer Motion. Return transform styles and event handlers. In 3d-utils.ts, export 3D utility functions. Calculate rotation angles, interpolate values, generate specular highlights.

**Subtasks**:
- **Subtask 21.1**: Create src/components/3d/card-3d.tsx base component. Use motion.div from Framer Motion for smooth transforms. Add CSS perspective to parent. Implement useCardTilt hook for rotation. Add transform-style: preserve-3d for nested 3D elements.
  - **Agent**: react-architect
- **Subtask 21.2**: Create src/components/3d/tilt-card.tsx tilt wrapper. Accept children, sensitivity (default 0.1), maxTilt (default 15) props. Track mouse with onMouseMove. Calculate rotation from center. Add spring animation on mouse leave.
  - **Agent**: react-architect
- **Subtask 21.3**: Create src/components/3d/glass-card.tsx glassmorphism. Apply backdrop-filter: blur(20px). Add background: rgba(255,255,255,0.05) for dark theme, rgba(0,0,0,0.05) for light. Add border: 1px solid rgba(255,255,255,0.1). Add shadow with colored glow.
  - **Agent**: tailwind-specialist
- **Subtask 21.4**: Create src/components/3d/holographic-card.tsx premium effect. Add conic-gradient border rotating slowly. Implement iridescent overlay using mix-blend-mode. Add sparkle particles using absolute positioned divs. Animate shimmer effect on hover.
  - **Agent**: tailwind-specialist
- **Subtask 21.5**: Create src/hooks/use-card-tilt.ts tilt logic. Accept ref and options props. Track mouse position relative to element. Calculate rotation angles. Add spring animation for smooth settling. Return transform style and event handlers.
  - **Agent**: react-hooks-specialist
- **Subtask 21.6**: Create src/lib/3d-utils.ts utilities. Export calculateTilt(mousePos, elementRect, sensitivity). Export lerp(start, end, factor) for smooth interpolation. Export generateSpecularHighlight(rotation) returning gradient position.
  - **Agent**: react-architect
- **Subtask 21.7**: Add 3D card performance optimization. Use CSS transforms only (no width/height changes). Add will-change: transform for GPU acceleration. Implement throttle on mousemove (60fps max). Disable 3D on mobile (media query).
  - **Agent**: react-architect

**Coding Standards**:
- Use CSS 3D transforms for performance (GPU accelerated)
- Limit rotation angles to prevent disorientation
- Add reduced motion support for accessibility
- Test on various screen sizes (disable on small screens)
- Ensure touch devices have fallback (no tilt)

---

### Task 23: Cinematic Page Transitions

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/transitions/page-transition.tsx
- component: src/components/transitions/stagger-transition.tsx
- component: src/components/transitions/shared-element-transition.tsx
- lib: src/lib/transition-variants.ts
- hook: src/hooks/use-transition-config.ts

**Implementation**: Create cinematic page transitions matching Apple's fluid navigation. In page-transition.tsx, build main transition wrapper using Framer Motion AnimatePresence. Implement 6 transition types: fade (opacity 0->1), slide-up (y: 50->0), slide-down (y: -50->0), slide-in-right (x: 100->0), slide-in-left (x: -100->0), scale (scale: 0.95->1). Add route-specific transitions (markets use slide-up, settings use slide-in-right). Configure exit:beforeEnter for seamless swapping. In stagger-transition.tsx, create container for staggered list animations. Implement variants with staggerChildren property. Animate children entering one after another with configurable delay (50-150ms). Add spring physics for natural motion. Support both stagger in (fade in) and stagger out (fade out). In shared-element-transition.tsx, create shared element transitions (hero animation). Animate element from position in old page to position in new page. Use layoutId prop from Framer Motion. Smoothly interpolate position, size, and opacity. In transition-variants.ts, export all transition variants. Define fadeIn, slideUp, slideDown, slideInRight, slideInLeft, scale variants. Add duration tokens: instant, fast, normal, slow. Add easing functions: standard, spring, decelerate. In use-transition-config.ts hook, create transition configuration based on route. Return appropriate variant and duration for given route path.

**Subtasks**:
- **Subtask 23.1**: Create src/components/transitions/page-transition.tsx wrapper. Use AnimatePresence mode="wait". Define route variants map. Wrap page content in motion.div. Listen to router events for transition trigger. Add loading state delay if needed.
  - **Agent**: react-architect
- **Subtask 23.2**: Create src/components/transitions/stagger-transition.tsx stagger container. Accept children, staggerDelay (default 0.1s) props. Use motion.div with variants: hidden (opacity 0, y: 20), visible (opacity 1, y: 0, transition: { staggerChildren }). Export for use in lists, grids.
  - **Agent**: react-architect
- **Subtask 23.3**: Create src/components/transitions/shared-element-transition.tsx hero animation. Accept layoutId prop for shared elements. Use motion.div with layout prop for smooth size/position changes. Configure animate={{ scale: 1, opacity: 1 }}. Add transition duration 400ms.
  - **Agent**: react-architect
- **Subtask 23.4**: Create src/lib/transition-variants.ts variant library. Export fadeIn: { hidden: { opacity: 0 }, visible: { opacity: 1 } }. Export slideUp: { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }. Export scale: { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }. Add all variants with enter/exit states.
  - **Agent**: react-architect
- **Subtask 23.5**: Create src/hooks/use-transition-config.ts route-based config. Accept route path. Return variant (fade for home, slide-up for markets, slide-in-right for settings). Return duration (fast for nested routes, normal for main routes). Return easing (spring for modals, standard for pages).
  - **Agent**: react-hooks-specialist
- **Subtask 23.6**: Add transition choreography. Implement element grouping for sequential animations. Configure delay between groups (header: 0ms, content: 100ms, sidebar: 200ms). Add orchestration for complex page loads.
  - **Agent**: react-architect
- **Subtask 23.7**: Add gesture-driven transitions. Implement swipe-to-back gesture on mobile. Add pull-to-refresh transition. Configure touch-action for proper gesture handling. Add haptic feedback on transition complete.
  - **Agent**: react-architect

**Coding Standards**:
- Use CSS transforms for smooth 60fps animations
- Respect prefers-reduced-motion media query
- Keep transitions short (200-400ms) for responsiveness
- Use spring physics for natural feel on interactive elements
- Test transitions on lower-end devices

---

### Task 24: Apple-Style Micro-Interactions

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/micro/button-hover.tsx
- component: src/components/micro/icon-animation.tsx
- component: src/components/micro/text-reveal.tsx
- component: src/components/micro/progress-ring.tsx
- lib: src/lib/micro-interaction-utils.ts

**Implementation**: Create subtle micro-interactions matching Apple's attention to detail. In button-hover.tsx, implement button hover effects. Scale: 1.02 on hover, 0.98 on click. Brightness: increase by 5% on hover. Elevation: increase shadow level by 1. Add subtle background color shift (5% lighter/darker). Add ripple effect on click (Material Design fusion). Duration: 150ms for hover, 100ms for click. In icon-animation.tsx, create icon animation system. Rotate: icons rotate 360deg over 2s on hover (loading spinners). Bounce: icons bounce up/down 10% on click (success checks). Pulse: icons scale 1.1->1.0->1.1 on repeat (notification bell). Shake: icons shake left/right 5deg on error (error icons). In text-reveal.tsx, implement text animation effects. Fade-in: text fades in word-by-word. Slide-up: text slides up line-by-line. Typewriter: text types out character-by-character. Highlight: text background color expands left-to-right. In progress-ring.tsx, create circular progress indicator. SVG circle with stroke-dasharray animation. Smooth interpolation from 0 to target percentage. Add glow effect on completion. In micro-interaction-utils.ts, export utility functions for creating consistent micro-interactions.

**Subtasks**:
- **Subtask 24.1**: Create src/components/micro/button-hover.tsx hover effects. Use motion.div with whileHover={{ scale: 1.02 }} and whileTap={{ scale: 0.98 }}. Add brightness filter with animate={{ filter: 'brightness(1.05)' }}. Add elevation change with transition shadow.
  - **Agent**: tailwind-specialist
- **Subtask 24.2**: Create src/components/micro/icon-animation.tsx icon effects. Create variants: rotate, bounce, pulse, shake. Use motion.span for icon wrapper. Configure animation duration: rotate 2s, bounce 0.5s, pulse 2s infinite, shake 0.5s.
  - **Agent**: tailwind-specialist
- **Subtask 24.3**: Create src/components/micro/text-reveal.tsx text animations. Implement word-by-word fade-in using splitText() utility. Create stagger array for delays. Add slide-up variant with line-by-line reveal. Create typewriter effect with character-by-character typing.
  - **Agent**: react-architect
- **Subtask 24.4**: Create src/components/micro/progress-ring.tsx circular progress. Use SVG circle with stroke-dasharray. Animate stroke-dashoffset from circumference to target. Add gradient stroke using defs > linearGradient. Add glow filter on 100% completion.
  - **Agent**: react-architect
- **Subtask 24.5**: Create src/lib/micro-interaction-utils.ts utilities. Export splitText(text) returning array of words. Export createStagger(count) returning delay array. Export interpolateProgress(current, target) for smooth number animation.
  - **Agent**: react-architect
- **Subtask 24.6**: Add hover state choreography. Implement sequential hover effects (first icon, then background, then text). Add delay between each effect (50ms). Create coordinated multi-element hovers.
  - **Agent**: tailwind-specialist
- **Subtask 24.7**: Add focus state animations. Implement scale + ring on keyboard focus. Add focus-visible only (ignore mouse focus). Configure focus ring color from theme. Add smooth ring expansion animation.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Keep micro-interactions short (100-200ms) for responsiveness
- Use CSS transforms over position changes for performance
- Ensure all interactions have visual feedback
- Test keyboard navigation focus states
- Add reduced motion support for accessibility

---

### Task 25: Scroll-Based Animations

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/scroll/scroll-progress.tsx
- component: src/components/scroll/scroll-reveal.tsx
- component: src/components/scroll/parallax-section.tsx
- hook: src/hooks/use-scroll-animations.ts
- lib: src/lib/scroll-utils.ts

**Implementation**: Create scroll-triggered animations for dynamic content revelation. In scroll-progress.tsx, create reading progress indicator. Fixed horizontal bar at top of page. Calculate scroll percentage: (scrollTop / (scrollHeight - clientHeight)) * 100. Animate width from 0 to 100%. Add smooth color transition as progress increases (primary to secondary gradient). In scroll-reveal.tsx, create element reveal on scroll. Use IntersectionObserver API to detect when elements enter viewport. Animate elements with fade-in + slide-up when 80% visible. Add stagger for multiple elements. Add one-time trigger (don't re-animate on scroll up). In parallax-section.tsx, create parallax scrolling effect. Animate background at different speed than foreground. Use scroll position to calculate offset: translateY(scrollY * speed). Apply to hero sections, market cards, images. Implement multiple depth layers (bg: 0.2x, mid: 0.5x, fg: 1.0x). In use-scroll-animations.ts hook, encapsulate scroll animation logic. Track scroll position with useState. Throttle scroll events for performance (60fps). Return scroll percentage, scroll direction, scroll velocity. In scroll-utils.ts, export scroll utilities: throttleScroll(), calculateProgress(), isInViewport().

**Subtasks**:
- **Subtask 25.1**: Create src/components/scroll/scroll-progress.tsx indicator. Use fixed top-0 left-0 w-full h-1. Track scroll with useScrollVelocity hook. Animate width with motion.div. Add gradient background using from-primary to-secondary.
  - **Agent**: react-architect
- **Subtask 25.2**: Create src/components/scroll/scroll-reveal.tsx reveal component. Use IntersectionObserver with threshold: 0.8. Add motion.div with initial={{ opacity: 0, y: 50 }} and animate={{ opacity: 1, y: 0 }} when inView. Add once={true} to prevent re-trigger.
  - **Agent**: react-architect
- **Subtask 25.3**: Create src/components/scroll/parallax-section.tsx parallax effect. Accept children, speed (default 0.5) props. Use useScroll hook from Framer Motion. Calculate y: useTransform(scrollY, [0, 1000], [0, -500 * speed]). Apply to background layers.
  - **Agent**: react-architect
- **Subtask 25.4**: Create src/hooks/use-scroll-animations.ts scroll logic. Track scrollY with window.scrollY. Calculate scrollDirection by comparing current to previous. Calculate scrollVelocity with time delta. Return { scrollY, scrollDirection, scrollVelocity, scrollProgress }.
  - **Agent**: react-hooks-specialist
- **Subtask 25.5**: Create src/lib/scroll-utils.ts scroll utilities. Export throttleScroll(callback, limit) throttling function. Export calculateProgress() returning 0-100 percentage. Export isInViewport(element, threshold) boolean check.
  - **Agent**: react-architect
- **Subtask 25.6**: Add scroll-based element choreography. Implement sequential reveals based on scroll position. Add delay between element animations. Create coordinated multi-section scroll experiences.
  - **Agent**: react-architect
- **Subtask 25.7**: Add scroll performance optimization. Use IntersectionObserver instead of scroll events where possible. Implement passive event listeners. Throttle scroll callbacks to 60fps. Use requestAnimationFrame for smooth updates.
  - **Agent**: react-architect

**Coding Standards**:
- Use IntersectionObserver for efficient viewport detection
- Throttle scroll events to prevent jank (60fps max)
- Use requestAnimationFrame for smooth updates
- Test scroll performance on mobile devices
- Ensure scroll-jank free experience

---

### Task 26: Loading Animation System

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/loading/loading-screen.tsx
- component: src/components/loading/skeleton-loader.tsx
- component: src/components/loading/shimmer-loader.tsx
- component: src/components/loading/spinner.tsx
- component: src/components/loading/progress-loader.tsx
- hook: src/hooks/use-loading-state.ts

**Implementation**: Create comprehensive loading animation system with Apple-style elegance. In loading-screen.tsx, create full-page loading screen for initial app load. Display app logo with scale-in animation. Add animated progress bar at bottom. Show loading percentage with number tween animation. Add tagline that fades in after logo. Exit with fade-out + slide-up transition. In skeleton-loader.tsx, create skeleton screens matching content layout. Use pulse animation with shimmer effect moving across. Match exact dimensions of final content (height, width, border-radius). Add subtle gray gradient for realism. Configure baseColor: hsl(var(--muted)/0.5), highlightColor: hsl(var(--muted)/0.8). In shimmer-loader.tsx, create shimmer effect for gradual content loading. Apply gradient overlay with angle-135. Animate background-position from -200% to 200% over 2s. Use on images, cards, text blocks. Add fade-in transition when content loads. In spinner.tsx, create loading spinner component. SVG circle with rotating stroke. Add gradient stroke (primary to secondary). Configure size variants (sm: 16px, md: 24px, lg: 48px). Add glow effect using shadow. In progress-loader.tsx, create determinate progress indicator. Linear progress bar with percentage label. Circular progress ring with center percentage. Animate from 0 to target smoothly. Add color shift based on progress (red->yellow->green). In use-loading-state.ts hook, manage loading states. Track loading state boolean. Track progress number (0-100). Track loading stage (init, loading, success, error). Return helpers: startLoading(), updateProgress(), completeLoading(), errorLoading().

**Subtasks**:
- **Subtask 26.1**: Create src/components/loading/loading-screen.tsx full-screen loader. Use fixed inset-0 z-50 with backdrop-blur. Display logo with scale-in animation (scale 0.5->1). Add progress bar at bottom with width animated by loading progress. Show percentage with NumberTween.
  - **Agent**: react-architect
- **Subtask 26.2**: Create src/components/loading/skeleton-loader.tsx content placeholder. Use pulse animation on background color. Match final content dimensions exactly. Add shimmer with gradient overlay moving left-to-right. Configure base/hightlight colors from theme.
  - **Agent**: tailwind-specialist
- **Subtask 26.3**: Create src/components/loading/shimmer-loader.tsx image/content loader. Apply gradient background with linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent). Animate background-position with keyframes. Add fade-in when loaded.
  - **Agent**: tailwind-specialist
- **Subtask 26.4**: Create src/components/loading/spinner.tsx rotating loader. Use SVG circle with stroke-dasharray. Animate rotation with keyframes spin. Add gradient stroke with defs > linearGradient. Create size variants (sm, md, lg, xl).
  - **Agent**: tailwind-specialist
- **Subtask 26.5**: Create src/components/loading/progress-loader.tsx determinate loader. Linear: motion.div with width animated to progress%. Circular: SVG circle with stroke-dashoffset animated. Add label showing progress%. Change color based on progress (<30: red, <70: yellow, >=70: green).
  - **Agent**: react-architect
- **Subtask 26.6**: Create src/hooks/use-loading-state.ts state management. Track state, progress, stage with useState. Provide startLoading(), updateProgress(percent), completeLoading(), errorLoading(message). Auto-reset after 3s on complete/error.
  - **Agent**: react-hooks-specialist
- **Subtask 26.7**: Add loading choreography for sequences. Implement multi-stage loading (init 0-30%, data 30-70%, render 70-100%). Add delays between stages for natural feel. Create coordinated loading animations.
  - **Agent**: react-architect

**Coding Standards**:
- Keep loading animations short (1-2s max) to prevent frustration
- Use skeleton screens matching exact content layout
- Provide progress feedback for long operations (>3s)
- Add shimmer effects for visual interest
- Test loading states on slow connections

---

### Task 27: Glassmorphism UI Components

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/glass/glass-card.tsx
- component: src/components/glass/glass-modal.tsx
- component: src/components/glass/glass-sidebar.tsx
- component: src/components/glass/glass-header.tsx
- lib: src/lib/glass-utils.ts

**Implementation**: Create glassmorphism components with frosted glass effect inspired by iOS. In glass-card.tsx, build base glass card component. Apply backdrop-filter: blur(20px) for frosted effect. Add background: rgba(255,255,255,0.05) for dark theme, rgba(0,0,0,0.05) for light. Add border: 1px solid rgba(255,255,255,0.1) for subtle edge. Add shadow with colored glow: box-shadow: 0 8px 32px rgba(0,0,0,0.3). Increase blur on hover to 30px for depth. In glass-modal.tsx, create glass modal overlay. Backdrop with blur(40px) for heavy frosted effect. Darken background: rgba(0,0,0,0.5) for focus. Modal content with glass card styling. Add scale-in + fade-in animation on open. Close with scale-out + fade-out. In glass-sidebar.tsx, create glass sidebar navigation. Apply glass effect with blur(30px). Add border-right for separation. Collapse/expand with smooth width transition. Active nav item with glow effect. In glass-header.tsx, create glass header component. Fixed top positioning with blur(30px). Add border-bottom for separation. Scroll with content until fully scrolled, then fixed. Add shadow when scrolled for depth. In glass-utils.ts, export glass utility functions. Generate glass styles based on theme. Calculate blur intensity based on elevation.

**Subtasks**:
- **Subtask 27.1**: Create src/components/glass/glass-card.tsx base component. Use backdrop-filter: blur(20px). Add background with 5% opacity based on theme. Add border with 10% opacity. Add shadow with elevation-4. Increase blur on hover with transition-all duration-300.
  - **Agent**: tailwind-specialist
- **Subtask 27.2**: Create src/components/glass/glass-modal.tsx modal. Use Dialog from Shadcn as base. Apply glass styles to overlay (blur(40px)) and content (blur(20px)). Add darkened background. Animate with scale-in on open, scale-out on close.
  - **Agent**: tailwind-specialist
- **Subtask 27.3**: Create src/components/glass/glass-sidebar.tsx navigation. Apply glass with blur(30px). Add border-right. Animate width transition on collapse/expand. Add active item glow with box-shadow: 0 0 20px primary color.
  - **Agent**: tailwind-specialist
- **Subtask 27.4**: Create src/components/glass/glass-header.tsx top bar. Fixed top with blur(30px). Add border-bottom. Implement scroll-triggered shadow (useScrollVelocity). Add transition for shadow appearance.
  - **Agent**: tailwind-specialist
- **Subtask 27.5**: Create src/lib/glass-utils.ts glass utilities. Export getGlassBlur(elevation) returning blur value. Export getGlassBackground(theme, opacity) returning rgba. Export getGlassBorder(theme) returning border color.
  - **Agent**: react-architect
- **Subtask 27.6**: Add glass performance optimization. Use will-change: backdrop-filter for GPU acceleration. Disable blur on low-end devices (media query). Add fallback solid background for unsupported browsers.
  - **Agent**: react-architect
- **Subtask 27.7**: Add glass theme variants. Create light/dark mode glass styles. Adjust opacity based on theme (light: higher opacity, dark: lower). Test contrast ratios for text readability.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Ensure text contrast remains WCAG AA compliant on glass backgrounds
- Test backdrop-filter browser support and provide fallbacks
- Use will-change sparingly (only on interactive elements)
- Adjust blur intensity based on content behind glass
- Maintain consistent glass blur across components

---

### Task 28: Advanced Hover States

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/hover/hover-card.tsx
- component: src/components/hover/hover-button.tsx
- component: src/components/hover/hover-link.tsx
- component: src/components/hover/hover-reveal.tsx
- hook: src/hooks/use-hover-state.ts

**Implementation**: Create sophisticated hover states with Apple-style fluidity. In hover-card.tsx, build card with multi-stage hover. Stage 1 (enter): scale(1.02) + elevation-increase + shadow-grow. Stage 2 (hold): subtle pulse animation on border. Stage 3 (exit): smooth return to base state. Duration: 200ms enter, 150ms exit. Easing: cubic-bezier(0.4, 0.0, 0.2, 1). In hover-button.tsx, create button with layered hover effects. Layer 1: scale(1.05) on hover. Layer 2: brightness(1.1) on hover. Layer 3: background color shift (5% lighter). Layer 4: elevation increase by 1. Add ripple on click (Material Design fusion). In hover-link.tsx, build link with animated underline. Underline expands from center on hover. Color: primary with 50% opacity. Thickness: 2px. Duration: 300ms. Add arrow icon that slides right on hover. In hover-reveal.tsx, create content reveal on hover. Hidden content (description, actions) slides down on hover. Height animates from 0 to auto. Opacity fades in from 0 to 1. Delay: 100ms after hover starts. In use-hover-state.ts hook, manage hover state. Track hover boolean with useState. Track hover duration with useEffect. Return helpers: isHovered, hoverDuration.

**Subtasks**:
- **Subtask 28.1**: Create src/components/hover/hover-card.tsx card hover. Use motion.div with whileHover={{ scale: 1.02 }}. Add elevation transition with hover:shadow-xl. Add subtle pulse on border with animate={{ borderColor }}. Set transition duration 200ms.
  - **Agent**: tailwind-specialist
- **Subtask 28.2**: Create src/components/hover/hover-button.tsx button hover. Layer effects: scale (1.05), brightness (1.1), background color, elevation. Add ripple effect on click using Material ripple. Configure duration 150ms.
  - **Agent**: tailwind-specialist
- **Subtask 28.3**: Create src/components/hover/hover-link.tsx link hover. Add underline with width: 0 on default, width: 100% on hover. Animate from center using transform-origin. Slide arrow icon right with translateX. Set duration 300ms.
  - **Agent**: tailwind-specialist
- **Subtask 28.4**: Create src/components/hover/hover-reveal.tsx content reveal. Use motion.div with animate={{ height: 'auto', opacity: 1 }} on hover. Add delay 100ms. Configure exit with height: 0, opacity: 0. Support nested reveals.
  - **Agent**: react-architect
- **Subtask 28.5**: Create src/hooks/use-hover-state.ts hover tracking. Track hover with onMouseEnter/onMouseLeave. Track duration with useEffect timer. Return { isHovered, hoverDuration, hoverProps }.
  - **Agent**: react-hooks-specialist
- **Subtask 28.6**: Add hover choreography for groups. Implement sequential hover effects across multiple elements. Add delay between element hovers. Create coordinated hover experiences.
  - **Agent**: tailwind-specialist
- **Subtask 28.7**: Add hover accessibility features. Ensure hover effects work with keyboard focus. Support :focus-visible styling. Add tap feedback for touch devices (no hover).
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Keep hover transitions short (150-250ms) for responsiveness
- Use cubic-bezier easing for natural feel
- Ensure hover states have clear visual feedback
- Test keyboard navigation focus states
- Add reduced motion support for accessibility

---

### Task 29: Focus State Choreography

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/focus/focus-ring.tsx
- component: src/components/focus/focus-trap.tsx
- component: src/components/focus/focus-visible.tsx
- hook: src/hooks/use-focus-management.ts

**Implementation**: Create accessible focus states with Apple-style elegance. In focus-ring.tsx, build focus ring component. Smoothly expand ring from scale(0.9) to scale(1.05). Color: primary with 50% opacity. Thickness: 2px. Offset: 4px from element. Duration: 200ms. Add blur effect for softness. Only show on keyboard focus (focus-visible, not mouse focus). In focus-trap.tsx, create focus trap for modals/drawers. Trap focus within component boundaries. Return focus to trigger element on close. Implement circular tab navigation. Handle Escape key to close. In focus-visible.tsx, create focus-visible utility wrapper. Detect keyboard vs mouse focus using :focus-visible pseudo-class. Apply focus styles only for keyboard. Smooth transition on focus appear/disappear. In use-focus-management.ts hook, manage focus state. Track focused element. Provide setFocus(ref) helper. Handle focus restoration.

**Subtasks**:
- **Subtask 29.1**: Create src/components/focus/focus-ring.tsx ring effect. Use outline-offset: 4px. Animate outline-width: 0->2px. Color: primary/50. Duration: 200ms. Add box-shadow blur for softness. Use :focus-visible to exclude mouse focus.
  - **Agent**: tailwind-specialist
- **Subtask 29.2**: Create src/components/focus/focus-trap.tsx trap component. Use useRef to track first/last focusable elements. Listen for Tab key to cycle focus. Listen for Escape key to call onClose. Return focus to triggerRef on unmount.
  - **Agent**: react-architect
- **Subtask 29.3**: Create src/components/focus/focus-visible.tsx keyboard detector. Use :focus-visible pseudo-class. Apply focus ring only on keyboard focus. Add smooth transition: outline-width 200ms.
  - **Agent**: tailwind-specialist
- **Subtask 29.4**: Create src/hooks/use-focus-management.ts focus logic. Track focused element with useState. Provide setFocus(elementRef) calling element.focus(). Handle focus restoration with returnFocusRef.
  - **Agent**: react-hooks-specialist
- **Subtask 29.5**: Add focus animations. Implement scale ring expansion on focus. Add color transition from transparent to primary. Add subtle glow effect with box-shadow.
  - **Agent**: tailwind-specialist
- **Subtask 29.6**: Add focus accessibility features. Ensure focus indicator has 3:1 contrast ratio. Test focus order is logical. Support skip-to-content links. Handle focus in modals, dropdowns.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Ensure focus indicators have 3:1 contrast ratio minimum
- Show focus only on keyboard navigation (focus-visible)
- Maintain logical tab order (DOM order)
- Provide focus trap for modals/dialogs
- Test focus with keyboard only (no mouse)

---

### Task 30: Color Transition Smoothing

**Recommended Agent**: tailwind-specialist

**Files to create/change**:
- component: src/components/color/color-transition.tsx
- component: src/components/color/theme-transition.tsx
- lib: src/lib/color-utils.ts

**Implementation**: Create smooth color transitions for theme changes and state updates. In color-transition.tsx, build color transition wrapper. Smoothly interpolate colors on state changes. Use HSL color space for perceptual uniformity. Duration: 300ms for theme changes, 150ms for state changes. Easing: ease-in-out. Support color properties: background, text, border, shadow. In theme-transition.tsx, create theme transition coordinator. Animate all color tokens on theme switch. Use CSS custom properties with transitions. Add overlay flash for smooth transition (fade to black, then fade to new theme). Duration: 500ms total (250ms fade out, 250ms fade in). In color-utils.ts, export color utility functions. Interpolate between two colors: lerpColor(color1, color2, factor). Convert HSL to RGB and vice versa. Calculate color contrast ratio. Generate color palettes from base color.

**Subtasks**:
- **Subtask 30.1**: Create src/components/color/color-transition.tsx wrapper. Use CSS custom properties for colors. Add transition: all 300ms ease-in-out. Interpolate colors with HSL for smoothness. Support background, text, border, shadow.
  - **Agent**: tailwind-specialist
- **Subtask 30.2**: Create src/components/color/theme-transition.tsx theme switcher. Add overlay with fixed inset-0 bg-background. Animate opacity: 0->0.5->0 on theme change. Delay theme apply until opacity peaks. Duration 500ms.
  - **Agent**: tailwind-specialist
- **Subtask 30.3**: Create src/lib/color-utils.ts color utilities. Export lerpColor(color1, color2, t) interpolating HSL. Export hslToRgb(h, s, l) and rgbToHsl(r, g, b). Export contrastRatio(fg, bg) for accessibility.
  - **Agent**: react-architect
- **Subtask 30.4**: Add color transition choreography. Coordinate multiple color changes. Add delays between element transitions. Create sequential color animations.
  - **Agent**: tailwind-specialist
- **Subtask 30.5**: Add color accessibility checks. Ensure contrast ratios meet WCAG AA. Test all color combinations in both themes. Provide fallback colors for low contrast.
  - **Agent**: tailwind-specialist

**Coding Standards**:
- Use HSL color space for smooth transitions
- Maintain WCAG AA contrast (4.5:1 minimum)
- Test color transitions in both themes
- Keep transitions short (300ms max) to prevent jank
- Support prefers-reduced-motion

---

### Task 31: Virtual Scrolling Implementation

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/virtual/virtual-list.tsx
- component: src/components/virtual/virtual-grid.tsx
- component: src/components/virtual/virtual-scroller.tsx
- hook: src/hooks/use-virtual-list.ts

**Implementation**: Create virtual scrolling for efficient large list rendering. In virtual-list.tsx, build virtualized list component. Render only visible items + buffer (5 items above/below). Use react-window or @tanstack/react-virtual. Calculate visible range based on scroll position. Implement variable height support with dynamic measurement. In virtual-grid.tsx, create virtualized grid component. Render visible cells in 2D grid layout. Support responsive column changes (1 col mobile, 2 tablet, 3 desktop). Implement cell recycling for performance. In virtual-scroller.tsx, create scroller wrapper. Handle scroll events with throttling. Implement smooth scroll-to-index functionality. Add scroll position persistence. In use-virtual-list.ts hook, manage virtual list state. Track scroll position, visible range, item heights. Provide scrollTo(index) helper.

**Subtasks**:
- **Subtask 31.1**: Create src/components/virtual/virtual-list.tsx list. Install @tanstack/react-virtual. Use useVirtualizer with count and estimateSize. Configure overscan: 5 for buffer. Implement variable height with dynamic measurement.
  - **Agent**: react-architect
- **Subtask 31.2**: Create src/components/virtual/virtual-grid.tsx grid. Use useVirtualizer with horizontal: true for 2D grid. Configure columns responsive to screen width. Implement cell recycling with key prop.
  - **Agent**: react-architect
- **Subtask 31.3**: Create src/components/virtual/virtual-scroller.tsx wrapper. Handle scroll with onScroll event. Throttle scroll to 60fps. Implement scrollToIndex with smooth behavior. Persist scroll position in localStorage.
  - **Agent**: react-architect
- **Subtask 31.4**: Create src/hooks/use-virtual-list.ts state management. Track scroll position with useState. Calculate visible range with useMemo. Provide scrollTo(index) helper.
  - **Agent**: react-hooks-specialist
- **Subtask 31.5**: Add virtual scroll performance optimization. Implement item height caching. Use requestAnimationFrame for smooth updates. Optimize render with React.memo.
  - **Agent**: react-architect

**Coding Standards**:
- Use virtualization for lists >100 items
- Implement proper item keying for React reconciliation
- Test scroll performance with 1000+ items
- Maintain scroll position on route changes
- Support keyboard navigation

---

### Task 32: Image Lazy Loading with Blur

**Recommended Agent**: react-architect

**Files to create/change**:
- component: src/components/image/optimized-image.tsx
- component: src/components/image/blur-placeholder.tsx
- hook: src/hooks/use-image-loader.ts

**Implementation**: Create optimized image loading with blur placeholders. In optimized-image.tsx, build image component using Next.js Image. Add lazy loading for below-fold images. Generate blur placeholder (base64). Implement priority loading for above-fold images. Support responsive sizes with srcSet. Handle load error with fallback. In blur-placeholder.tsx, create blur effect. Apply blur(10px) filter. Animate blur removal on load (100ms). Fade in image from opacity 0.8 to 1. Add skeleton loading state before blur appears. In use-image-loader.ts hook, manage image load state. Track loading boolean. Track loaded boolean. Track error boolean. Provide retry functionality.

**Subtasks**:
- **Subtask 32.1**: Create src/components/image/optimized-image.tsx image. Use Next.js Image with placeholder="blur". Add blurDataURL prop with base64. Implement priority prop for above-fold. Handle onError with fallback image.
  - **Agent**: react-architect
- **Subtask 32.2**: Create src/components/image/blur-placeholder.tsx blur effect. Apply filter: blur(10px). Animate blur removal with transition. Fade in from opacity 0.8. Show skeleton before blur.
  - **Agent**: tailwind-specialist
- **Subtask 32.3**: Create src/hooks/use-image-loader.ts load tracking. Track loading state. Listen to onLoad/onError events. Provide retry() helper calling reload().
  - **Agent**: react-hooks-specialist
- **Subtask 32.4**: Add image performance optimization. Use WebP format with JPEG fallback. Generate responsive sizes. Implement progressive loading.
  - **Agent**: react-architect

**Coding Standards**:
- Use Next.js Image for automatic optimization
- Generate blur placeholders for all images
- Implement progressive loading for large images
- Handle load errors gracefully
- Support responsive images

---

### Task 33: Animation Frame Optimization

**Recommended Agent**: react-architect

**Files to create/change**:
- hook: src/hooks/use-raf.ts
- hook: src/hooks/use-raf-throttle.ts
- lib: src/lib/animation-utils.ts

**Implementation**: Create animation frame optimization for smooth 60fps animations. In use-raf.ts hook, wrap requestAnimationFrame in React hook. Provide callback function. Handle cleanup on unmount. Return cancel function. In use-raf-throttle.ts hook, throttle functions to 60fps using rAF. Wrap expensive calculations. Debounce rapid changes. Return throttled function. In animation-utils.ts, export animation utilities. Create raf scheduler for batching updates. Implement animation loop management.

**Subtasks**:
- **Subtask 33.1**: Create src/hooks/use-raf.ts rAF wrapper. Use requestAnimationFrame with useCallback. Cleanup with cancelAnimationFrame on unmount. Return cancel() function.
  - **Agent**: react-hooks-specialist
- **Subtask 33.2**: Create src/hooks/use-raf-throttle.ts throttle. Throttle callback to 60fps (16ms). Use useRef to track last execution. Return throttled function.
  - **Agent**: react-hooks-specialist
- **Subtask 33.3**: Create src/lib/animation-utils.ts scheduler. Create raf queue for batching. Schedule updates on next frame. Implement animation loop.
  - **Agent**: react-architect
- **Subtask 33.4**: Add rAF performance monitoring. Track frame times. Detect dropped frames. Adjust quality based on performance.
  - **Agent**: react-architect

**Coding Standards**:
- Use requestAnimationFrame for all animations
- Throttle to 60fps maximum
- Clean up rAF on unmount
- Batch style changes
- Monitor frame rate

---

### Task 34: Memoization Strategies

**Recommended Agent**: react-architect

**Files to create/change**:
- hook: src/hooks/use-memoized-list.ts
- hook: src/hooks/use-memoized-callback.ts
- lib: src/lib/memoization-utils.ts

**Implementation**: Create comprehensive memoization strategy for performance. In use-memoized-list.ts, memoize list operations. Cache filtered/sorted results. Recalculate only when dependencies change. Use useMemo for computed values. In use-memoized-callback.ts, memoize callback functions. Use useCallback with dependency array. Prevent unnecessary re-renders of children. In memoization-utils.ts, export memoization helpers. Create deep comparison memo. Create keyed memo for list items.

**Subtasks**:
- **Subtask 34.1**: Create src/hooks/use-memoized-list.ts list memo. Use useMemo for filtered/sorted results. Add dependency array for items and filters. Return memoized list.
  - **Agent**: react-hooks-specialist
- **Subtask 34.2**: Create src/hooks/use-memoized-callback.ts callback memo. Use useCallback with deps. Return stable function reference.
  - **Agent**: react-hooks-specialist
- **Subtask 34.3**: Create src/lib/memoization-utils.ts helpers. Export memoizeDeep compare function. Export createKeyedMemo for list items.
  - **Agent**: react-architect
- **Subtask 34.4**: Add React.memo to expensive components. Wrap MarketCard, PriceChart, PositionCard in memo. Provide custom comparison functions.
  - **Agent**: react-architect

**Coding Standards**:
- Memoize expensive computations (>10ms)
- Use React.memo for pure components
- Provide custom comparison functions
- Profile before/after optimization
- Monitor render counts

---

### Task 35: Web Worker Data Processing

**Recommended Agent**: nodejs-specialist

**Files to create/change**:
- worker: src/workers/data-processor.worker.ts
- hook: src/hooks/use-web-worker.ts
- lib: src/lib/worker-utils.ts

**Implementation**: Create Web Worker for off-main-thread processing. In data-processor.worker.ts, implement heavy computations. Process large datasets (10k+ markets). Calculate aggregations, statistics. Run filtering/sorting algorithms. In use-web-worker.ts hook, manage worker lifecycle. Create worker on mount. Terminate on unmount. Send messages to worker. Receive results via onmessage. In worker-utils.ts, export worker utilities. Create worker pool for parallel processing. Schedule tasks across workers.

**Subtasks**:
- **Subtask 35.1**: Create src/workers/data-processor.worker.ts. Implement onmessage handler. Process large datasets. Calculate stats (total volume, avg price). Post result back.
  - **Agent**: nodejs-specialist
- **Subtask 35.2**: Create src/hooks/use-web-worker.ts worker manager. Create Worker with useMemo. Send messages with postMessage. Listen with onmessage. Terminate on unmount.
  - **Agent**: react-hooks-specialist
- **Subtask 35.3**: Create src/lib/worker-utils.ts worker pool. Create pool of workers (navigator.hardwareConcurrency). Schedule tasks across workers. Balance load.
  - **Agent**: nodejs-specialist
- **Subtask 35.4**: Add worker error handling. Catch worker errors. Retry failed tasks. Provide fallback to main thread.
  - **Agent**: nodejs-specialist

**Coding Standards**:
- Use workers for CPU-intensive tasks
- Terminate workers on unmount
- Handle worker errors gracefully
- Provide main thread fallback
- Test on various devices

---

## Summary

This TaskPlan defines a comprehensive Polymarket clone application with 300+ subtasks organized into 35 main tasks covering:

0. Supabase Database Setup
1. Project Setup and Base Configuration
2. Type Definitions and API Interface
3. Zustand Store Architecture
4. Shadcn/UI Component Setup
5. TanStack Query Integration
6. Routing Structure and Layouts
7. Market Card Components
8. Price Chart Component
9. Order Book Visual Component
10. Portfolio Components
11. Price Alerts System
12. Theme System
13. Toast Notification System
14. Search and Filter Components
15. 3D Effects and Animations
16. Error Handling and Boundaries
17. Performance Optimization
18. Testing Infrastructure
19. Documentation and Developer Experience
20. Design System Foundation - Apple + Material Fusion
21. Particle Effects System
22. 3D Card System with Tilt Effect
23. Cinematic Page Transitions
24. Apple-Style Micro-Interactions
25. Scroll-Based Animations
26. Loading Animation System
27. Glassmorphism UI Components
28. Advanced Hover States
29. Focus State Choreography
30. Color Transition Smoothing
31. Virtual Scrolling Implementation
32. Image Lazy Loading with Blur
33. Animation Frame Optimization
34. Memoization Strategies
35. Web Worker Data Processing

The architecture prioritizes developer experience with TypeScript, modern React patterns, and comprehensive documentation while delivering an innovative user interface with Apple-level visual effects, cinematic transitions, 3D elements, particle systems, glassmorphism, and real-time data visualization from Supabase-powered data persistence and Gamma API integration.
