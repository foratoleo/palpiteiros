/**
 * Breaking Components Barrel Export
 *
 * Central export point for all breaking markets components.
 *
 * @components
 * - BreakingPageClient: Main client wrapper for breaking page
 * - BreakingHeader: Header with title, date, and count badge
 * - BreakingFilters: Filter controls (categories, time range, price change)
 * - BreakingList: Markets list with infinite scroll
 * - BreakingMarketCard: Individual market card with rank badge
 * - BreakingMarketCardSkeleton: Loading skeleton for cards
 * - BreakingRankBadge: Circular rank badge (gold/silver/bronze)
 * - MovementIndicator: Trend arrow indicator
 * - MiniSparkline: Small SVG price chart
 * - BreakingNewsletterCTA: Newsletter subscription call-to-action
 * - BreakingTwitterFeed: Live Twitter/X feed integration
 * - TweetCard: Individual tweet card with media support
 */

// Page Components
export { BreakingPageClient } from './breaking-page-client'
export type { BreakingPageClientProps } from './breaking-page-client'

export { BreakingHeader } from './breaking-header'
export type { BreakingHeaderProps } from './breaking-header'

export { BreakingFilters } from './breaking-filters'
export type { BreakingFiltersProps } from './breaking-filters'

export { BreakingList } from './breaking-list'
export type { BreakingListProps } from './breaking-list'

// Card Components
export { BreakingMarketCard } from './breaking-market-card'
export type { BreakingMarketCardProps } from './breaking-market-card'

export { BreakingMarketCardSkeleton } from './breaking-market-card-skeleton'
export type { BreakingMarketCardSkeletonProps } from './breaking-market-card-skeleton'

// UI Components
export { BreakingRankBadge } from './breaking-rank-badge'
export type { BreakingRankBadgeProps } from './breaking-rank-badge'

export { MovementIndicator } from './movement-indicator'
export type { MovementIndicatorProps } from './movement-indicator'

export { MiniSparkline } from './mini-sparkline'
export type { MiniSparklineProps } from './mini-sparkline'

// Newsletter Components
export { BreakingNewsletterCTA } from './breaking-newsletter-cta'
export type { BreakingNewsletterCTAProps, NewsletterVariant, NewsletterFrequency } from './breaking-newsletter-cta'

// Twitter/X Feed Components
export { BreakingTwitterFeed } from './breaking-twitter-feed'
export type { BreakingTwitterFeedProps } from './breaking-twitter-feed'

export { TweetCard, detectTweetCategory } from './tweet-card'
export type { TweetCardProps } from './tweet-card'
