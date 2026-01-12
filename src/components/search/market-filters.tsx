/**
 * Market Filters Component
 *
 * Container for filtering markets by category, tags, price range, liquidity, and volume.
 * Integrates with market store for filter state management.
 *
 * @features
 * - Category filter with icons
 * - Tag filter with multi-select
 * - Price range slider
 * - Liquidity and volume filters
 * - Active filter count badge
 * - Clear all filters button
 * - Responsive collapsible design
 *
 * @example
 * ```tsx
 * <MarketFilters
 *   categories={categories}
 *   tags={tags}
 *   onFiltersChange={(filters) => console.log(filters)}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import {
  Filter,
  X,
  ChevronDown,
  TrendingUp,
  DollarSign,
  Activity,
  Calendar,
  Star
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useMarketStore } from '@/stores/market.store'
import type { MarketFilterOptions, Tag } from '@/types'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface MarketFiltersProps {
  /** Available categories */
  categories?: string[]
  /** Available tags */
  tags?: Tag[]
  /** Minimum liquidity value */
  minLiquidity?: number
  /** Maximum liquidity value */
  maxLiquidity?: number
  /** Minimum volume value */
  minVolume?: number
  /** Maximum volume value */
  maxVolume?: number
  /** Filters change callback */
  onFiltersChange?: (filters: MarketFilterOptions) => void
  /** Additional CSS class names */
  className?: string
  /** Collapsed state */
  defaultCollapsed?: boolean
  /** Show filter count badge */
  showCount?: boolean
  /** Variant */
  variant?: 'sidebar' | 'dropdown' | 'panel'
}

interface CategoryOption {
  value: string
  label: string
  icon?: React.ReactNode
}

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_CATEGORIES: CategoryOption[] = [
  { value: 'politics', label: 'Politics', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'sports', label: 'Sports', icon: <Activity className="h-4 w-4" /> },
  { value: 'finance', label: 'Finance', icon: <DollarSign className="h-4 w-4" /> },
  { value: 'entertainment', label: 'Entertainment', icon: <Star className="h-4 w-4" /> },
  { value: 'crypto', label: 'Crypto', icon: <TrendingUp className="h-4 w-4" /> },
  { value: 'world', label: 'World Events', icon: <Calendar className="h-4 w-4" /> }
]

const QUICK_FILTERS = [
  { id: 'active', label: 'Active Only', icon: <Activity className="h-3 w-3" /> },
  { id: 'closingSoon', label: 'Closing Soon', icon: <Calendar className="h-3 w-3" /> },
  { id: 'hot', label: 'Trending', icon: <TrendingUp className="h-3 w-3" /> }
]

// ============================================================================
// COMPONENT
// ============================================================================

export const MarketFilters = React.forwardRef<HTMLDivElement, MarketFiltersProps>(
  (
    {
      categories = DEFAULT_CATEGORIES.map((c) => c.value),
      tags = [],
      minLiquidity = 0,
      maxLiquidity = 100000,
      minVolume = 0,
      maxVolume = 1000000,
      onFiltersChange,
      className,
      defaultCollapsed = false,
      showCount = true,
      variant = 'panel'
    },
    ref
  ) => {
    // Store integration
    const filters = useMarketStore((state) => state.filters)
    const setFilters = useMarketStore((state) => state.setFilters)
    const resetFilters = useMarketStore((state) => state.resetFilters)

    // Local state
    const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed)
    const [localCategories, setLocalCategories] = React.useState<string[]>(filters.categories || [])
    const [localTags, setLocalTags] = React.useState<string[]>(filters.tags || [])
    const [priceRange, setPriceRange] = React.useState<[number, number]>(
      filters.priceRange || [0, 100]
    )
    const [liquidityRange, setLiquidityRange] = React.useState<[number, number]>(
      filters.minLiquidity !== undefined || filters.maxLiquidity !== undefined
        ? [filters.minLiquidity || minLiquidity, filters.maxLiquidity || maxLiquidity]
        : [minLiquidity, maxLiquidity]
    )
    const [volumeRange, setVolumeRange] = React.useState<[number, number]>(
      filters.minVolume !== undefined || filters.maxVolume !== undefined
        ? [filters.minVolume || minVolume, filters.maxVolume || maxVolume]
        : [minVolume, maxVolume]
    )

    // Compute active filter count
    const activeFilterCount = React.useMemo(() => {
      let count = 0
      if (filters.categories?.length) count++
      if (filters.tags?.length) count++
      if (filters.priceRange) count++
      if (filters.minLiquidity !== undefined || filters.maxLiquidity !== undefined) count++
      if (filters.minVolume !== undefined || filters.maxVolume !== undefined) count++
      if (filters.active !== undefined) count++
      if (filters.closingSoon) count++
      if (filters.hot) count++
      return count
    }, [filters])

    // Apply filters
    const handleApplyFilters = () => {
      const newFilters: Partial<MarketFilterOptions> = {
        categories: localCategories.length > 0 ? localCategories : undefined,
        tags: localTags.length > 0 ? localTags : undefined,
        priceRange: priceRange[0] === 0 && priceRange[1] === 100 ? undefined : priceRange,
        minLiquidity: liquidityRange[0] === minLiquidity ? undefined : liquidityRange[0],
        maxLiquidity: liquidityRange[1] === maxLiquidity ? undefined : liquidityRange[1],
        minVolume: volumeRange[0] === minVolume ? undefined : volumeRange[0],
        maxVolume: volumeRange[1] === maxVolume ? undefined : volumeRange[1]
      }
      setFilters(newFilters)
      onFiltersChange?.({ ...filters, ...newFilters })
    }

    // Toggle category
    const toggleCategory = (category: string) => {
      setLocalCategories((prev) =>
        prev.includes(category)
          ? prev.filter((c) => c !== category)
          : [...prev, category]
      )
    }

    // Toggle tag
    const toggleTag = (tag: string) => {
      setLocalTags((prev) =>
        prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
      )
    }

    // Toggle quick filter
    const toggleQuickFilter = (filterKey: 'active' | 'closingSoon' | 'hot') => {
      const currentValue = filters[filterKey]
      setFilters({ [filterKey]: currentValue === undefined ? true : !currentValue })
    }

    // Clear all filters
    const handleClearAll = () => {
      setLocalCategories([])
      setLocalTags([])
      setPriceRange([0, 100])
      setLiquidityRange([minLiquidity, maxLiquidity])
      setVolumeRange([minVolume, maxVolume])
      resetFilters()
      onFiltersChange?.({} as MarketFilterOptions)
    }

    // Format currency
    const formatCurrency = (value: number) => {
      if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
      if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`
      return `$${value.toFixed(0)}`
    }

    // Get category label
    const getCategoryLabel = (value: string) => {
      return DEFAULT_CATEGORIES.find((c) => c.value === value)?.label || value
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-4',
          variant === 'panel' && 'p-4 rounded-lg border bg-background',
          variant === 'sidebar' && 'p-4',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
            {showCount && activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearAll}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <motion.div
                animate={{ rotate: isCollapsed ? -90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="h-4 w-4" />
              </motion.div>
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <ScrollArea className="max-h-[60vh] pr-4">
                <div className="space-y-6">
                  {/* Quick Filters */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Quick Filters
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_FILTERS.map((filter) => {
                        const isActive =
                          (filter.id === 'active' && filters.active !== undefined) ||
                          (filter.id === 'closingSoon' && filters.closingSoon) ||
                          (filter.id === 'hot' && filters.hot)
                        return (
                          <Button
                            key={filter.id}
                            variant={isActive ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleQuickFilter(filter.id as 'active' | 'closingSoon' | 'hot')}
                            className="h-8 gap-1.5"
                          >
                            {filter.icon}
                            <span className="text-xs">{filter.label}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  <Separator />

                  {/* Categories */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Categories
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((category) => {
                        const categoryData = DEFAULT_CATEGORIES.find((c) => c.value === category)
                        const isSelected = localCategories.includes(category)
                        return (
                          <Button
                            key={category}
                            variant={isSelected ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleCategory(category)}
                            className="h-8 gap-1.5"
                          >
                            {categoryData?.icon}
                            <span className="text-xs">{getCategoryLabel(category)}</span>
                          </Button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tags */}
                  {tags.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <Label className="text-sm font-medium text-muted-foreground">
                          Tags
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {tags.slice(0, 10).map((tag) => {
                            const isSelected = localTags.includes(tag.slug)
                            return (
                              <Button
                                key={tag.slug}
                                variant={isSelected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleTag(tag.slug)}
                                className="h-8"
                              >
                                <span className="text-xs">{tag.label}</span>
                              </Button>
                            )
                          })}
                        </div>
                      </div>
                    </>
                  )}

                  <Separator />

                  {/* Price Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Price Range
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {priceRange[0]}% - {priceRange[1]}%
                      </span>
                    </div>
                    <Slider
                      value={priceRange}
                      onValueChange={(value) => setPriceRange(value as [number, number])}
                      min={0}
                      max={100}
                      step={1}
                      className="py-4"
                    />
                  </div>

                  <Separator />

                  {/* Liquidity Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        Liquidity
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(liquidityRange[0])} - {formatCurrency(liquidityRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={liquidityRange}
                      onValueChange={(value) => setLiquidityRange(value as [number, number])}
                      min={minLiquidity}
                      max={maxLiquidity}
                      step={1000}
                      className="py-4"
                    />
                  </div>

                  <Separator />

                  {/* Volume Range */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        24h Volume
                      </Label>
                      <span className="text-xs text-muted-foreground">
                        {formatCurrency(volumeRange[0])} - {formatCurrency(volumeRange[1])}
                      </span>
                    </div>
                    <Slider
                      value={volumeRange}
                      onValueChange={(value) => setVolumeRange(value as [number, number])}
                      min={minVolume}
                      max={maxVolume}
                      step={1000}
                      className="py-4"
                    />
                  </div>

                  <Separator />

                  {/* Apply Button */}
                  <Button onClick={handleApplyFilters} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </ScrollArea>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

MarketFilters.displayName = 'MarketFilters'

// ============================================================================
// DROPDOWN VARIANT
// ============================================================================

export interface MarketFiltersDropdownProps extends Omit<MarketFiltersProps, 'variant'> {
  trigger?: React.ReactNode
}

export const MarketFiltersDropdown = React.forwardRef<
  HTMLDivElement,
  MarketFiltersDropdownProps
>(({ trigger, ...props }, ref) => {
    const [open, setOpen] = React.useState(false)
    const activeFilterCount = useMarketStore((state) => {
      const filters = state.filters
      let count = 0
      if (filters.categories?.length) count++
      if (filters.tags?.length) count++
      if (filters.priceRange) count++
      if (filters.minLiquidity !== undefined || filters.maxLiquidity !== undefined) count++
      if (filters.minVolume !== undefined || filters.maxVolume !== undefined) count++
      return count
    })

    return (
      <div ref={ref}>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setOpen(!open)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        )}
        {open && (
          <div className="absolute z-50 mt-2 w-80 rounded-lg border bg-background shadow-xl">
            <MarketFilters {...props} defaultCollapsed={false} />
          </div>
        )}
      </div>
    )
  })

MarketFiltersDropdown.displayName = 'MarketFiltersDropdown'
