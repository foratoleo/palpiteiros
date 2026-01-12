# Breaking Markets Checklist

- [ ] T0: Create branch feat/breaking-markets

- [x] T1: Database schema and SQL functions → See TaskPlan §Task 1
  - [x] T1.1: Create market_price_history table migration
  - [x] T1.2: Implement calculate_market_movement SQL function
  - [x] T1.3: Implement get_breaking_markets SQL function
  - [x] T1.4: Create trigger for price_change_24h updates
  - [x] T1.5: Regenerate database types
  Agent: sql-query-specialist

- [x] T2: Supabase Edge Functions → See TaskPlan §Task 2
  - [x] T2.1: Create sync-price-history edge function skeleton
  - [x] T2.2: Implement sync logic with Gamma API integration
  - [x] T2.3: Create get-breaking-markets edge function
  - [x] T2.4: Create breaking.types.ts with interfaces
  - [x] T2.5: Add deployment scripts and documentation
  Agent: supabase-edge-functions

- [x] T3: Breaking service layer → See TaskPlan §Task 3
  - [x] T3.1: Create BreakingService class with caching
  - [x] T3.2: Implement getBreakingMarkets and getBreakingMarketById
  - [x] T3.3: Implement refreshBreakingData with debounce
  - [x] T3.4: Implement subscribeToBreakingUpdates method
  - [x] T3.5: Add breakingKeys to query-keys.ts
  Agent: nodejs-specialist

- [x] T4: Breaking markets custom hook → See TaskPlan §Task 4
  - [x] T4.1: Create useBreakingMarkets hook with useQuery
  - [x] T4.2: Create useBreakingMarket hook for single market
  - [x] T4.3: Create useBreakingRealtime hook for subscriptions
  - [x] T4.4: Export hooks from index.ts with JSDoc
  Agent: react-hooks-specialist

- [x] T5: Breaking Zustand store → See TaskPlan §Task 5
  - [x] T5.1: Define BreakingState and BreakingActions interfaces
  - [x] T5.2: Create default filters and initial state
  - [x] T5.3: Implement store with devtools, persist, immer
  - [x] T5.4: Create selectors for filtered data
  - [x] T5.5: Export store from stores/index.ts
  Agent: react-hooks-specialist

- [x] T6: Breaking market card components → See TaskPlan §Task 6
  - [x] T6.1: Create BreakingMarketCard component
  - [x] T6.2: Implement price change display with gradients AND previous_price
  - [x] T6.3: Add MiniSparkline to card
  - [x] T6.4: Create BreakingRankBadge component
  - [x] T6.5: Create MovementIndicator component
  - [x] T6.6: Export components from breaking/index.ts
  Agent: tailwind-specialist

- [x] T7: Breaking page layout → See TaskPlan §Task 7
  - [x] T7.1: Create breaking page Server Component
  - [x] T7.2: Create BreakingPageClient component
  - [x] T7.3: Create BreakingHeader component
  - [x] T7.4: Create BreakingFilters component
  - [x] T7.5: Create BreakingList with infinite scroll
  - [x] T7.6: Add SEO metadata to page
  Agent: react-architect

- [x] T8: Real-time updates integration → See TaskPlan §Task 8
  - [x] T8.1: Implement subscribeToPriceChanges method
  - [x] T8.2: Create useBreakingRealtime hook
  - [x] T8.3: Add query invalidation logic
  - [x] T8.4: Add connection status indicator
  - [x] T8.5: Implement flash animation on card updates
  Agent: nodejs-specialist

- [x] T9: Navigation and routing → See TaskPlan §Task 9
  - [x] T9.1: Add Breaking link to sidebar
  - [x] T9.2: Add Breaking link to mobile-nav
  - [x] T9.3: Export breaking types from index.ts
  - [x] T9.4: Add CTA to homepage
  - [x] T9.5: Update sitemap with breaking route
  Agent: react-architect

- [x] T10: Testing implementation → See TaskPlan §Task 10
  - [x] T10.1: Create use-breaking-markets.test.ts
  - [x] T10.2: Create breaking-market-card.test.tsx
  - [x] T10.3: Create breaking.service.test.ts
  - [x] T10.4: Create breaking.spec.ts E2E test
  - [x] T10.5: Run tests and verify coverage
  Agent: nodejs-specialist

- [x] T11: Newsletter Subscription System → See TaskPlan §Task 11
  - [x] T11.1: Create breaking_newsletter_subscriptions table migration
  - [x] T11.2: Create subscribe-newsletter edge function
  - [x] T11.3: Create send-breaking-daily edge function
  - [x] T11.4: Create BreakingNewsletterCTA component
  - [x] T11.5: Create HTML email template
  Agent: nodejs-specialist

- [x] T12: Twitter/X Feed Integration → See TaskPlan §Task 12
  - [x] T12.1: Set up Twitter API v2 access and Bearer token
  - [x] T12.2: Create get-polymarket-tweets edge function
  - [x] T12.3: Create BreakingTwitterFeed component
  - [x] T12.4: Create TweetCard component with media support
  - [x] T12.5: Implement auto-refresh with 5min interval
  - [x] T12.6: Add category detection logic (Breaking news vs New polymarket)
  Agent: nodejs-specialist

- [x] T13: Timestamp Utilities → See TaskPlan §Task 13
  - [x] T13.1: Add formatAbsoluteTimestamp() to utils.ts
  - [x] T13.2: Add formatRelativeTimestamp() to utils.ts
  Agent: nodejs-specialist
