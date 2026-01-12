/**
 * Market Components Barrel Export
 *
 * Centralizes all market-related component exports for clean imports.
 *
 * @example
 * ```tsx
 * import { MarketCard, MarketGrid, MarketList } from '@/components/market'
 * ```
 */

// Main card components
export { MarketCard } from './market-card'
export type { MarketCardProps } from '@/types/market.types'

// 3D enhanced card
export { MarketCard3D, MarketCard3DSimple } from './market-card-3d'
export type { MarketCard3DProps, MarketCard3DSimpleProps } from './market-card-3d'

// Skeleton loaders
export { MarketCardSkeleton, MarketGridSkeleton } from './market-card-skeleton'
export type { MarketCardSkeletonProps, MarketGridSkeletonProps } from './market-card-skeleton'

// Sub-components
export { MarketCardPrice } from './market-card-price'
export type { MarketCardPriceProps } from './market-card-price'

export { MarketCardMeta, MarketCardMetaInline } from './market-card-meta'
export type { MarketCardMetaProps } from './market-card-meta'

// Container components
export { MarketGrid, MarketGridMasonry } from './market-grid'
export type { MarketGridProps, MarketGridMasonryProps } from './market-grid'

export { MarketList } from './market-list'
export type { MarketListProps } from './market-list'

// T17.3: Virtual scrolling components for large lists
export { VirtualMarketList, useVirtualListControl } from './virtual-market-list'
export type { VirtualMarketListProps } from './virtual-market-list'
