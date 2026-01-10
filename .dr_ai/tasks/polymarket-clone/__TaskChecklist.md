# polymarket-clone Checklist

- [ ] T0: Create branch feat/polymarket-clone

- [ ] T0: Supabase Database Setup -> See TaskPlan (0)
  - [ ] T0.1: Create 001_initial_schema.sql with all 5 tables
  - [ ] T0.2: Create 002_rls_policies.sql with security policies
  - [ ] T0.3: Create 003_triggers.sql with update triggers
  - [ ] T0.4: Create sync-gamma-markets Edge Function
  - [ ] T0.5: Generate TypeScript types from database
  - [ ] T0.6: Create .env.local with credentials
  - [ ] T0.7: Test database connection
  Agent: supabase-edge-functions

- [ ] T1: Project Setup and Base Configuration -> See TaskPlan (1)
  - [ ] T1.1: Create Next.js project with TypeScript and App Router
  - [ ] T1.2: Configure Tailwind CSS v4 with design tokens
  - [ ] T1.3: Configure TypeScript with path aliases
  - [ ] T1.4: Create root layout with providers
  - [ ] T1.5: Create utility functions in utils.ts
  Agent: react-architect

- [ ] T2: Type Definitions and API Interface -> See TaskPlan (2)
  - [ ] T2.1: Generate database.types.ts from Supabase
  - [ ] T2.2: Create gamma.types.ts with API interfaces
  - [ ] T2.3: Create market.types.ts with UI types
  - [ ] T2.4: Create portfolio.types.ts with position types
  - [ ] T2.5: Create alert.types.ts with notification types
  - [ ] T2.6: Create ui.types.ts with theme and UI types
  - [ ] T2.7: Create supabase.service.ts with typed client
  - [ ] T2.8: Create gamma.service.ts for Edge Function
  Agent: react-hooks-specialist

- [ ] T3: Zustand Store Architecture -> See TaskPlan (3)
  - [ ] T3.1: Create market.store.ts with filter state
  - [ ] T3.2: Create portfolio.store.ts with positions
  - [ ] T3.3: Create ui.store.ts with theme and toasts
  - [ ] T3.4: Create alert.store.ts with alerts management
  - [ ] T3.5: Create user.store.ts with preferences
  - [ ] T3.6: Create stores barrel export
  Agent: react-hooks-specialist

- [ ] T4: Shadcn/UI Component Setup -> See TaskPlan (4)
  - [ ] T4.1: Initialize Shadcn/UI
  - [ ] T4.2: Add and customize button component
  - [ ] T4.3: Add and customize card component
  - [ ] T4.4: Add and customize badge component
  - [ ] T4.5: Add dialog component
  - [ ] T4.6: Add dropdown-menu component
  - [ ] T4.7: Add select component
  - [ ] T4.8: Add switch component
  - [ ] T4.9: Add tabs component
  - [ ] T4.10: Add slider component
  - [ ] T4.11: Add input and textarea components
  - [ ] T4.12: Add separator component
  - [ ] T4.13: Add toast and toaster components
  - [ ] T4.14: Add scroll-area component
  - [ ] T4.15: Add command component
  Agent: tailwind-specialist

- [ ] T5: TanStack Query Integration -> See TaskPlan (5)
  - [ ] T5.1: Create query-client.ts with QueryClient
  - [ ] T5.2: Create query-keys.ts constants
  - [ ] T5.3: Create use-markets.ts hook
  - [ ] T5.4: Create use-market.ts hook
  - [ ] T5.5: Create use-market-history.ts hook
  Agent: react-hooks-specialist

- [ ] T6: Routing Structure and Layouts -> See TaskPlan (6)
  - [ ] T6.1: Create (main) layout with header and sidebar
  - [ ] T6.2: Update home page with hero section
  - [ ] T6.3: Create markets page with explorer
  - [ ] T6.4: Create market detail dynamic route
  - [ ] T6.5: Create portfolio page
  - [ ] T6.6: Create alerts page
  - [ ] T6.7: Create settings page
  - [ ] T6.8: Create sidebar navigation
  - [ ] T6.9: Create header component
  - [ ] T6.10: Create mobile navigation
  - [ ] T6.11: Create page transition wrapper
  Agent: react-architect

- [ ] T7: Market Card Components -> See TaskPlan (7)
  - [ ] T7.1: Create market-card.tsx base component
  - [ ] T7.2: Create market-card-skeleton.tsx loading
  - [ ] T7.3: Create market-card-3d.tsx enhanced version
  - [ ] T7.4: Create market-grid.tsx container
  - [ ] T7.5: Create market-list.tsx alternative view
  - [ ] T7.6: Create market-card-price.tsx display
  - [ ] T7.7: Create market-card-meta.tsx metadata
  Agent: tailwind-specialist

- [ ] T8: Price Chart Component -> See TaskPlan (8)
  - [ ] T8.1: Create price-chart.tsx main component
  - [ ] T8.2: Create price-chart-tooltip.tsx custom tooltip
  - [ ] T8.3: Create price-chart-controls.tsx toolbar
  - [ ] T8.4: Create mini-sparkline.tsx compact chart
  - [ ] T8.5: Create use-chart-data.ts processor
  Agent: react-architect

- [ ] T9: Order Book Visual Component -> See TaskPlan (9)
  - [ ] T9.1: Create order-book-visual.tsx main component
  - [ ] T9.2: Create order-book-row.tsx row component
  - [ ] T9.3: Create order-book-summary.tsx summary bar
  - [ ] T9.4: Create depth-chart.tsx visualization
  - [ ] T9.5: Create use-order-book-data.ts hook
  Agent: react-architect

- [ ] T10: Portfolio Components -> See TaskPlan (10)
  - [ ] T10.1: Create portfolio-summary.tsx cards
  - [ ] T10.2: Create positions-table.tsx table
  - [ ] T10.3: Create position-card.tsx mobile view
  - [ ] T10.4: Create allocation-chart.tsx donut chart
  - [ ] T10.5: Create performance-chart.tsx line chart
  - [ ] T10.6: Create pnl-badge.tsx reusable badge
  Agent: react-architect

- [ ] T11: Price Alerts System -> See TaskPlan (11)
  - [ ] T11.1: Create alert-list.tsx main container
  - [ ] T11.2: Create alert-item.tsx individual alert
  - [ ] T11.3: Create create-alert-dialog.tsx dialog
  - [ ] T11.4: Create alert-form.tsx form
  - [ ] T11.5: Create alert-trigger-toast.tsx notification
  - [ ] T11.6: Create use-alert-checker.ts monitoring hook
  Agent: react-hooks-specialist

- [ ] T12: Theme System -> See TaskPlan (12)
  - [ ] T12.1: Create theme-provider.tsx context
  - [ ] T12.2: Create theme-toggle.tsx button
  - [ ] T12.3: Create theme-switch.tsx component
  - [ ] T12.4: Create theme.ts utility functions
  - [ ] T12.5: Update globals.css with CSS variables
  Agent: tailwind-specialist

- [ ] T13: Toast Notification System -> See TaskPlan (13)
  - [ ] T13.1: Create toaster.tsx container
  - [ ] T13.2: Create toast.tsx individual toast
  - [ ] T13.3: Create use-toast.ts hook
  - [ ] T13.4: Create use-toast-notification.ts convenience hooks
  Agent: react-architect

- [ ] T14: Search and Filter Components -> See TaskPlan (14)
  - [ ] T14.1: Create search-bar.tsx input
  - [ ] T14.2: Create command-palette.tsx global search
  - [ ] T14.3: Create market-filters.tsx container
  - [ ] T14.4: Create filter-chip.tsx individual filter
  - [ ] T14.5: Create filter-panel.tsx collapsible
  - [ ] T14.6: Create use-market-search.ts search logic
  Agent: react-architect

- [ ] T15: 3D Effects and Animations -> See TaskPlan (15)
  - [ ] T15.1: Create particle-background.tsx effects
  - [ ] T15.2: Create hero-3d-card.tsx tilt effect
  - [ ] T15.3: Create page-transition.tsx wrapper
  - [ ] T15.4: Create stagger-children.tsx container
  - [ ] T15.5: Create number-tween.tsx animator
  - [ ] T15.6: Create animations.ts library
  Agent: react-architect

- [ ] T16: Error Handling and Boundaries -> See TaskPlan (16)
  - [ ] T16.1: Create error-boundary.tsx class component
  - [ ] T16.2: Create error-page.tsx full page
  - [ ] T16.3: Create error-fallback.tsx inline
  - [ ] T16.4: Create network-error.tsx API error
  - [ ] T16.5: Create app/error.tsx Next.js error page
  - [ ] T16.6: Create app/not-found.tsx 404 page
  Agent: react-architect

- [ ] T17: Performance Optimization -> See TaskPlan (17)
  - [ ] T17.1: Create performance.config.ts constants
  - [ ] T17.2: Create image-optimizer.tsx component
  - [ ] T17.3: Create virtual-list.tsx virtualized list
  - [ ] T17.4: Create use-debounce.ts hook
  - [ ] T17.5: Create use-throttle.ts hook
  - [ ] T17.6: Create use-deferred-value.ts hook
  Agent: react-architect

- [ ] T18: Testing Infrastructure -> See TaskPlan (18)
  - [ ] T18.1: Create vitest.config.ts configuration
  - [ ] T18.2: Create setup-tests.ts environment setup
  - [ ] T18.3: Create market-card.test.tsx component tests
  - [ ] T18.4: Create use-markets.test.ts hook tests
  - [ ] T18.5: Create market.store.test.ts store tests
  - [ ] T18.6: Create gamma.service.test.ts service tests
  Agent: testing-specialist

- [ ] T19: Documentation and Developer Experience -> See TaskPlan (19)
  - [ ] T19.1: Create README.md project documentation
  - [ ] T19.2: Create CONTRIBUTING.md guidelines
  - [ ] T19.3: Create docs/ARCHITECTURE.md system docs
  - [ ] T19.4: Create docs/API-REFERENCE.md API docs
  - [ ] T19.5: Create docs/COMPONENT-LIBRARY.md catalog
  - [ ] T19.6: Update .env.example environment template
  Agent: react-architect

- [ ] T20: Design System Foundation - Apple + Material Fusion -> See TaskPlan (20)
  - [ ] T20.1: Create src/config/design-tokens.ts with all token definitions
  - [ ] T20.2: Create src/styles/design-system.css with CSS custom properties
  - [ ] T20.3: Create src/lib/design-tokens.ts utility functions
  - [ ] T20.4: Create src/lib/animation-curves.ts with Apple-inspired easing functions
  - [ ] T20.5: Create src/lib/elevation-system.ts with elevation utilities
  - [ ] T20.6: Update Tailwind config to use design tokens
  - [ ] T20.7: Create design system documentation in docs/DESIGN-SYSTEM.md
  Agent: tailwind-specialist

- [ ] T21: Particle Effects System -> See TaskPlan (21)
  - [ ] T21.1: Create src/components/particles/particle-system.tsx core engine
  - [ ] T21.2: Create src/components/particles/particle-background.tsx ambient effect
  - [ ] T21.3: Create src/components/particles/mouse-trail-particles.tsx interactive effect
  - [ ] T21.4: Create src/components/particles/depth-particles.tsx layered effect
  - [ ] T21.5: Create src/hooks/use-particle-config.ts responsive config
  - [ ] T21.6: Create src/lib/particle-utils.ts utility functions
  - [ ] T21.7: Add particle performance optimization
  Agent: react-architect

- [ ] T22: 3D Card System with Tilt Effect -> See TaskPlan (22)
  - [ ] T22.1: Create src/components/3d/card-3d.tsx base component
  - [ ] T22.2: Create src/components/3d/tilt-card.tsx tilt wrapper
  - [ ] T22.3: Create src/components/3d/glass-card.tsx glassmorphism
  - [ ] T22.4: Create src/components/3d/holographic-card.tsx premium effect
  - [ ] T22.5: Create src/hooks/use-card-tilt.ts tilt logic
  - [ ] T22.6: Create src/lib/3d-utils.ts utilities
  - [ ] T22.7: Add 3D card performance optimization
  Agent: react-architect

- [ ] T23: Cinematic Page Transitions -> See TaskPlan (23)
  - [ ] T23.1: Create src/components/transitions/page-transition.tsx wrapper
  - [ ] T23.2: Create src/components/transitions/stagger-transition.tsx stagger container
  - [ ] T23.3: Create src/components/transitions/shared-element-transition.tsx hero animation
  - [ ] T23.4: Create src/lib/transition-variants.ts variant library
  - [ ] T23.5: Create src/hooks/use-transition-config.ts route-based config
  - [ ] T23.6: Add transition choreography
  - [ ] T23.7: Add gesture-driven transitions
  Agent: react-architect

- [ ] T24: Apple-Style Micro-Interactions -> See TaskPlan (24)
  - [ ] T24.1: Create src/components/micro/button-hover.tsx hover effects
  - [ ] T24.2: Create src/components/micro/icon-animation.tsx icon effects
  - [ ] T24.3: Create src/components/micro/text-reveal.tsx text animations
  - [ ] T24.4: Create src/components/micro/progress-ring.tsx circular progress
  - [ ] T24.5: Create src/lib/micro-interaction-utils.ts utilities
  - [ ] T24.6: Add hover state choreography
  - [ ] T24.7: Add focus state animations
  Agent: tailwind-specialist

- [ ] T25: Scroll-Based Animations -> See TaskPlan (25)
  - [ ] T25.1: Create src/components/scroll/scroll-progress.tsx indicator
  - [ ] T25.2: Create src/components/scroll/scroll-reveal.tsx reveal component
  - [ ] T25.3: Create src/components/scroll/parallax-section.tsx parallax effect
  - [ ] T25.4: Create src/hooks/use-scroll-animations.ts scroll logic
  - [ ] T25.5: Create src/lib/scroll-utils.ts scroll utilities
  - [ ] T25.6: Add scroll-based element choreography
  - [ ] T25.7: Add scroll performance optimization
  Agent: react-architect

- [ ] T26: Loading Animation System -> See TaskPlan (26)
  - [ ] T26.1: Create src/components/loading/loading-screen.tsx full-screen loader
  - [ ] T26.2: Create src/components/loading/skeleton-loader.tsx content placeholder
  - [ ] T26.3: Create src/components/loading/shimmer-loader.tsx image/content loader
  - [ ] T26.4: Create src/components/loading/spinner.tsx rotating loader
  - [ ] T26.5: Create src/components/loading/progress-loader.tsx determinate loader
  - [ ] T26.6: Create src/hooks/use-loading-state.ts state management
  - [ ] T26.7: Add loading choreography for sequences
  Agent: react-architect

- [ ] T27: Glassmorphism UI Components -> See TaskPlan (27)
  - [ ] T27.1: Create src/components/glass/glass-card.tsx base component
  - [ ] T27.2: Create src/components/glass/glass-modal.tsx modal
  - [ ] T27.3: Create src/components/glass/glass-sidebar.tsx navigation
  - [ ] T27.4: Create src/components/glass/glass-header.tsx top bar
  - [ ] T27.5: Create src/lib/glass-utils.ts glass utilities
  - [ ] T27.6: Add glass performance optimization
  - [ ] T27.7: Add glass theme variants
  Agent: tailwind-specialist

- [ ] T28: Advanced Hover States -> See TaskPlan (28)
  - [ ] T28.1: Create src/components/hover/hover-card.tsx card hover
  - [ ] T28.2: Create src/components/hover/hover-button.tsx button hover
  - [ ] T28.3: Create src/components/hover/hover-link.tsx link hover
  - [ ] T28.4: Create src/components/hover/hover-reveal.tsx content reveal
  - [ ] T28.5: Create src/hooks/use-hover-state.ts hover tracking
  - [ ] T28.6: Add hover choreography for groups
  - [ ] T28.7: Add hover accessibility features
  Agent: tailwind-specialist

- [ ] T29: Focus State Choreography -> See TaskPlan (29)
  - [ ] T29.1: Create src/components/focus/focus-ring.tsx ring effect
  - [ ] T29.2: Create src/components/focus/focus-trap.tsx trap component
  - [ ] T29.3: Create src/components/focus/focus-visible.tsx keyboard detector
  - [ ] T29.4: Create src/hooks/use-focus-management.ts focus logic
  - [ ] T29.5: Add focus animations
  - [ ] T29.6: Add focus accessibility features
  Agent: tailwind-specialist

- [ ] T30: Color Transition Smoothing -> See TaskPlan (30)
  - [ ] T30.1: Create src/components/color/color-transition.tsx wrapper
  - [ ] T30.2: Create src/components/color/theme-transition.tsx theme switcher
  - [ ] T30.3: Create src/lib/color-utils.ts color utilities
  - [ ] T30.4: Add color transition choreography
  - [ ] T30.5: Add color accessibility checks
  Agent: tailwind-specialist

- [ ] T31: Virtual Scrolling Implementation -> See TaskPlan (31)
  - [ ] T31.1: Create src/components/virtual/virtual-list.tsx list
  - [ ] T31.2: Create src/components/virtual/virtual-grid.tsx grid
  - [ ] T31.3: Create src/components/virtual/virtual-scroller.tsx wrapper
  - [ ] T31.4: Create src/hooks/use-virtual-list.ts state management
  - [ ] T31.5: Add virtual scroll performance optimization
  Agent: react-architect

- [ ] T32: Image Lazy Loading with Blur -> See TaskPlan (32)
  - [ ] T32.1: Create src/components/image/optimized-image.tsx image
  - [ ] T32.2: Create src/components/image/blur-placeholder.tsx blur effect
  - [ ] T32.3: Create src/hooks/use-image-loader.ts load tracking
  - [ ] T32.4: Add image performance optimization
  Agent: react-architect

- [ ] T33: Animation Frame Optimization -> See TaskPlan (33)
  - [ ] T33.1: Create src/hooks/use-raf.ts rAF wrapper
  - [ ] T33.2: Create src/hooks/use-raf-throttle.ts throttle
  - [ ] T33.3: Create src/lib/animation-utils.ts scheduler
  - [ ] T33.4: Add rAF performance monitoring
  Agent: react-architect

- [ ] T34: Memoization Strategies -> See TaskPlan (34)
  - [ ] T34.1: Create src/hooks/use-memoized-list.ts list memo
  - [ ] T34.2: Create src/hooks/use-memoized-callback.ts callback memo
  - [ ] T34.3: Create src/lib/memoization-utils.ts helpers
  - [ ] T34.4: Add React.memo to expensive components
  Agent: react-architect

- [ ] T35: Web Worker Data Processing -> See TaskPlan (35)
  - [ ] T35.1: Create src/workers/data-processor.worker.ts
  - [ ] T35.2: Create src/hooks/use-web-worker.ts worker manager
  - [ ] T35.3: Create src/lib/worker-utils.ts worker pool
  - [ ] T35.4: Add worker error handling
  Agent: nodejs-specialist
