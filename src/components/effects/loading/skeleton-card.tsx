/**
 * Skeleton Card Component
 *
 * Specialized skeleton card with shimmer effect for card-based layouts.
 * Matches common card patterns in the application.
 *
 * Features:
 * - Multiple card layouts
 * - Header with avatar/title
 * - Body with text/image
 * - Footer with actions
 * - Configurable sections
 *
 * @example
 * ```tsx
 * import { SkeletonCard } from "./skeleton-card"
 *
 * <SkeletonCard variant="market" />
 * <SkeletonCard variant="portfolio" />
 * <SkeletonCard variant="alert" />
 * ```
 */

import * as React from "react"
import { clsx } from "clsx"
import { LoadingSkeleton } from "./loading-skeleton"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Skeleton card variant
 */
export type SkeletonCardVariant =
  | "default"
  | "market"
  | "portfolio"
  | "alert"
  | "profile"
  | "list"
  | "table"
  | "stat"

/**
 * Skeleton card configuration
 */
export interface SkeletonCardConfig {
  /** Card variant */
  variant?: SkeletonCardVariant
  /** Show header */
  showHeader?: boolean
  /** Show avatar */
  showAvatar?: boolean
  /** Number of text lines */
  textLines?: number
  /** Show image */
  showImage?: boolean
  /** Show footer */
  showFooter?: boolean
  /** Number of stats */
  statsCount?: number
  /** Card className */
  className?: string
  /** Card style */
  style?: React.CSSProperties
}

/**
 * Skeleton card props
 */
export interface SkeletonCardProps extends SkeletonCardConfig, Omit<React.HTMLAttributes<HTMLDivElement>, "variant"> {}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * SkeletonCard Component
 *
 * Card-shaped skeleton with shimmer effect
 */
export const SkeletonCard = React.forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({
    variant = "default",
    showHeader = true,
    showAvatar = true,
    textLines = 3,
    showImage = false,
    showFooter = false,
    statsCount = 0,
    className,
    style,
    ...props
  }, ref) => {
    // Render based on variant
    const renderContent = () => {
      switch (variant) {
        case "market":
          return <MarketSkeleton />
        case "portfolio":
          return <PortfolioSkeleton />
        case "alert":
          return <AlertSkeleton />
        case "profile":
          return <ProfileSkeleton />
        case "list":
          return <ListSkeleton />
        case "table":
          return <TableSkeleton />
        case "stat":
          return <StatSkeleton />
        default:
          return <DefaultSkeleton showHeader={showHeader} showAvatar={showAvatar} textLines={textLines} showImage={showImage} showFooter={showFooter} statsCount={statsCount} />
      }
    }

    return (
      <div
        ref={ref}
        className={clsx(
          "rounded-lg border bg-card overflow-hidden",
          className
        )}
        style={style}
        {...props}
      >
        {renderContent()}
      </div>
    )
  }
)

SkeletonCard.displayName = "SkeletonCard"

// ============================================================================
// VARIANT SKELETONS
// ============================================================================

function DefaultSkeleton({ showHeader, showAvatar, textLines, showImage, showFooter, statsCount }: SkeletonCardConfig) {
  return (
    <div className="p-4 space-y-3">
      {/* Header */}
      {showHeader && (
        <div className="flex items-center gap-3">
          {showAvatar && <LoadingSkeleton variant="avatar" width={40} height={40} />}
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" height={16} />
            <LoadingSkeleton variant="text" height={14} width="60%" />
          </div>
        </div>
      )}

      {/* Image */}
      {showImage && (
        <LoadingSkeleton variant="rect" height={160} radius={8} />
      )}

      {/* Stats */}
      {(statsCount ?? 0) > 0 && (
        <div className="flex gap-4">
          {Array.from({ length: statsCount ?? 0 }).map((_, index) => (
            <div key={index} className="flex-1">
              <LoadingSkeleton variant="text" height={12} />
              <LoadingSkeleton variant="text" height={16} width="50%" className="mt-1" />
            </div>
          ))}
        </div>
      )}

      {/* Text lines */}
      <div className="space-y-2">
        {Array.from({ length: textLines ?? 3 }).map((_, index) => (
          <LoadingSkeleton
            key={index}
            variant="text"
            height={14}
            width={index === (textLines ?? 3) - 1 ? "70%" : "100%"}
          />
        ))}
      </div>

      {/* Footer */}
      {showFooter && (
        <div className="flex gap-2 pt-2">
          <LoadingSkeleton variant="rect" width={80} height={32} radius={6} />
          <LoadingSkeleton variant="rect" width={80} height={32} radius={6} />
        </div>
      )}
    </div>
  )
}

function MarketSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {/* Title and badge */}
      <div className="flex justify-between items-start">
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" height={16} />
          <LoadingSkeleton variant="text" height={14} width="40%" />
        </div>
        <LoadingSkeleton variant="rect" width={60} height={24} radius={12} />
      </div>

      {/* Price info */}
      <div className="flex items-center justify-between">
        <LoadingSkeleton variant="rect" width={100} height={32} radius={6} />
        <LoadingSkeleton variant="rect" width={80} height={24} radius={6} />
      </div>

      {/* Mini chart */}
      <LoadingSkeleton variant="rect" height={40} radius={4} />

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <LoadingSkeleton variant="text" height={12} width={60} />
        <LoadingSkeleton variant="text" height={12} width={80} />
      </div>
    </div>
  )
}

function PortfolioSkeleton() {
  return (
    <div className="p-4 space-y-4">
      {/* Header with asset name */}
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="circle" width={40} height={40} />
        <div className="flex-1">
          <LoadingSkeleton variant="text" height={16} />
          <LoadingSkeleton variant="text" height={14} width="40%" className="mt-1" />
        </div>
      </div>

      {/* Value and PnL */}
      <div className="space-y-2">
        <LoadingSkeleton variant="text" height={24} width="60%" />
        <LoadingSkeleton variant="rect" width={120} height={28} radius={6} />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 pt-2">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center">
            <LoadingSkeleton variant="text" height={12} />
            <LoadingSkeleton variant="text" height={14} width="50%" className="mt-1 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

function AlertSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {/* Header with condition badge */}
      <div className="flex items-start gap-3">
        <LoadingSkeleton variant="circle" width={32} height={32} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" height={14} />
          <LoadingSkeleton variant="rect" width={70} height={20} radius={10} />
        </div>
      </div>

      {/* Price info */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <LoadingSkeleton variant="text" height={12} />
          <LoadingSkeleton variant="text" height={18} width="60%" className="mt-1" />
        </div>
        <div className="flex-1">
          <LoadingSkeleton variant="text" height={12} />
          <LoadingSkeleton variant="text" height={18} width="60%" className="mt-1" />
        </div>
      </div>

      {/* Progress bar */}
      <LoadingSkeleton variant="rect" height={6} radius={3} />

      {/* Footer with timestamp */}
      <div className="flex justify-between items-center">
        <LoadingSkeleton variant="text" height={12} width={80} />
        <LoadingSkeleton variant="rect" width={60} height={24} radius={6} />
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {/* Avatar and name */}
      <div className="flex items-center gap-4">
        <LoadingSkeleton variant="circle" width={64} height={64} />
        <div className="flex-1 space-y-2">
          <LoadingSkeleton variant="text" height={20} />
          <LoadingSkeleton variant="text" height={14} width="60%" />
          <LoadingSkeleton variant="text" height={14} width="40%" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="text-center">
            <LoadingSkeleton variant="rect" width={60} height={24} radius={6} className="mx-auto mb-1" />
            <LoadingSkeleton variant="text" height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ListSkeleton() {
  return (
    <div className="p-3 flex items-center gap-3">
      <LoadingSkeleton variant="avatar" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <LoadingSkeleton variant="text" height={14} />
        <LoadingSkeleton variant="text" height={12} width="50%" />
      </div>
      <LoadingSkeleton variant="rect" width={60} height={24} radius={6} />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="divide-y">
      {/* Header */}
      <div className="p-3 flex gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} variant="text" height={14} width="20%" />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 5 }).map((_, rowIndex) => (
        <div key={rowIndex} className="p-3 flex gap-4">
          {Array.from({ length: 4 }).map((_, colIndex) => (
            <LoadingSkeleton key={colIndex} variant="text" height={14} width="20%" />
          ))}
        </div>
      ))}
    </div>
  )
}

function StatSkeleton() {
  return (
    <div className="p-4 space-y-2">
      <LoadingSkeleton variant="text" height={14} />
      <LoadingSkeleton variant="text" height={24} width="60%" />
      <LoadingSkeleton variant="text" height={12} width="40%" />
    </div>
  )
}

// ============================================================================
// CARD LIST
// ============================================================================

/**
 * SkeletonCardList Component
 *
 * Grid/list of skeleton cards
 */
export interface SkeletonCardListProps {
  /** Number of cards */
  count?: number
  /** Card variant */
  variant?: SkeletonCardVariant
  /** Grid columns */
  cols?: 1 | 2 | 3 | 4
  /** List variant (for list type) */
  listVariant?: boolean
  /** Card configuration */
  cardConfig?: Partial<SkeletonCardConfig>
  /** Container className */
  className?: string
}

export function SkeletonCardList({
  count = 5,
  variant = "default",
  cols = 1,
  listVariant = false,
  cardConfig,
  className,
}: SkeletonCardListProps) {
  const gridClass = cols === 1 ? "grid-cols-1" :
                    cols === 2 ? "grid-cols-1 sm:grid-cols-2" :
                    cols === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" :
                    "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"

  return (
    <div className={clsx(
      listVariant ? "space-y-3" : "grid",
      !listVariant && gridClass,
      className
    )}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant={variant} {...cardConfig} />
      ))}
    </div>
  )
}

// ============================================================================
// PRESETS
// ============================================================================

export const SkeletonMarket = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="market" {...props} />
))
SkeletonMarket.displayName = "SkeletonMarket"

export const SkeletonPortfolio = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="portfolio" {...props} />
))
SkeletonPortfolio.displayName = "SkeletonPortfolio"

export const SkeletonAlert = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="alert" {...props} />
))
SkeletonAlert.displayName = "SkeletonAlert"

export const SkeletonProfile = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="profile" {...props} />
))
SkeletonProfile.displayName = "SkeletonProfile"

export const SkeletonList = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="list" {...props} />
))
SkeletonList.displayName = "SkeletonList"

export const SkeletonTable = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="table" {...props} />
))
SkeletonTable.displayName = "SkeletonTable"

export const SkeletonStat = React.forwardRef<HTMLDivElement, Omit<SkeletonCardProps, "variant">>((props, ref) => (
  <SkeletonCard ref={ref} variant="stat" {...props} />
))
SkeletonStat.displayName = "SkeletonStat"
