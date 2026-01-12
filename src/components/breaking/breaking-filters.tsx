/**
 * Breaking Filters Component
 *
 * Filter controls for the breaking markets page.
 * Includes category tabs, time range selector, price change slider,
 * volume input, and view mode toggle.
 *
 * @features
 * - Category tabs: All, Politics, World, Sports, Crypto, Finance, Tech, Culture
 * - Time range selector: 1h, 24h, 7d, 30d
 * - Min price change slider: 5%, 10%, 20%, 50%
 * - Min volume input
 * - View mode toggle: grid/list icons
 * - Active filters count badge
 * - Clear all filters button
 * - Collapsible on mobile
 *
 * @component BreakingFilters
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import {
  Grid3x3,
  List,
  Filter,
  X,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BreakingFilters as BreakingFiltersType } from '@/types/breaking.types'

/**
 * BreakingFilters Props
 */
export interface BreakingFiltersProps {
  /** Current filter options */
  filters: BreakingFiltersType
  /** Callback when filters change */
  onFiltersChange: (filters: Partial<BreakingFiltersType>) => void
  /** Current view mode */
  viewMode: 'grid' | 'list'
  /** Callback when view mode changes */
  onViewModeChange: (mode: 'grid' | 'list') => void
}

/**
 * Category options for tabs
 */
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Politics', value: 'politics' },
  { label: 'World', value: 'world' },
  { label: 'Sports', value: 'sports' },
  { label: 'Crypto', value: 'crypto' },
  { label: 'Finance', value: 'finance' },
  { label: 'Tech', value: 'tech' },
  { label: 'Culture', value: 'culture' },
] as const

/**
 * Time range options
 */
const TIME_RANGES = [
  { label: '1h', value: '1h' as const },
  { label: '24h', value: '24h' as const },
  { label: '7d', value: '7d' as const },
  { label: '30d', value: '30d' as const },
] as const

/**
 * Price change presets for slider
 */
const PRICE_CHANGE_PRESETS = [
  { label: '5%', value: 0.05 },
  { label: '10%', value: 0.10 },
  { label: '20%', value: 0.20 },
  { label: '50%', value: 0.50 },
] as const

/**
 * Trend direction options
 */
const TREND_OPTIONS = [
  { label: 'All', value: undefined as 'up' | 'down' | 'neutral' | undefined },
  { label: 'Up', value: 'up' as const },
  { label: 'Down', value: 'down' as const },
] as const

/**
 * BreakingFilters Component
 *
 * Displays all filter controls for breaking markets.
 *
 * @example
 * ```tsx
 * <BreakingFilters
 *   filters={filters}
 *   onFiltersChange={handleFiltersChange}
 *   viewMode="grid"
 *   onViewModeChange={setViewMode}
 * />
 * ```
 */
export function BreakingFilters({
  filters,
  onFiltersChange,
  viewMode,
  onViewModeChange,
}: BreakingFiltersProps) {
  // Mobile collapse state
  const [isExpanded, setIsExpanded] = React.useState(false)
  const [showAdvanced, setShowAdvanced] = React.useState(false)
  const [isDesktop, setIsDesktop] = React.useState(false)

  // Detect desktop viewport
  React.useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 640)
    }

    checkDesktop()
    window.addEventListener('resize', checkDesktop)

    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  /**
   * Count active filters
   */
  const activeFiltersCount = React.useMemo(() => {
    let count = 0
    if (filters.categories && filters.categories.length > 0) count++
    if (filters.timeRange && filters.timeRange !== '24h') count++
    if (filters.minPriceChange && filters.minPriceChange > 0.05) count++
    if (filters.minVolume && filters.minVolume > 1000) count++
    if (filters.trend) count++
    return count
  }, [filters])

  /**
   * Handle category change
   */
  const handleCategoryChange = React.useCallback(
    (categoryValue: string) => {
      if (categoryValue === '') {
        onFiltersChange({ categories: [] })
      } else {
        onFiltersChange({ categories: [categoryValue] })
      }
    },
    [onFiltersChange]
  )

  /**
   * Handle time range change
   */
  const handleTimeRangeChange = React.useCallback(
    (timeRange: '1h' | '24h' | '7d' | '30d') => {
      onFiltersChange({ timeRange })
    },
    [onFiltersChange]
  )

  /**
   * Handle price change preset click
   */
  const handlePriceChangePreset = React.useCallback(
    (value: number) => {
      onFiltersChange({ minPriceChange: value })
    },
    [onFiltersChange]
  )

  /**
   * Handle volume input change
   */
  const handleVolumeChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value) || 0
      onFiltersChange({ minVolume: value })
    },
    [onFiltersChange]
  )

  /**
   * Handle trend change
   */
  const handleTrendChange = React.useCallback(
    (trend: 'up' | 'down' | 'neutral' | undefined) => {
      onFiltersChange({ trend: trend === 'neutral' ? undefined : trend })
    },
    [onFiltersChange]
  )

  /**
   * Clear all filters
   */
  const handleClearFilters = React.useCallback(() => {
    onFiltersChange({
      categories: [],
      timeRange: '24h',
      minPriceChange: 0.05,
      minVolume: 1000,
      trend: undefined,
    })
  }, [onFiltersChange])

  /**
   * Get selected category value
   */
  const selectedCategory = React.useMemo(
    () => filters.categories?.[0] || '',
    [filters.categories]
  )

  return (
    <Card variant="glass">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Filter Toggle Button (Mobile) */}
          <Button
            variant="outline"
            size="sm"
            className="sm:hidden"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
            <ChevronDown
              className={cn(
                'h-4 w-4 ml-2 transition-transform',
                isExpanded && 'rotate-180'
              )}
            />
          </Button>

          {/* Title (Desktop) */}
          <h2 className="hidden sm:block text-sm font-medium text-muted-foreground">
            Filters
          </h2>

          {/* Right Side Controls */}
          <div className="flex items-center gap-2">
            {/* Active Filters Badge (Desktop) */}
            {activeFiltersCount > 0 && (
              <Badge
                variant="secondary"
                className="hidden sm:inline-flex items-center gap-1"
              >
                {activeFiltersCount} active
              </Badge>
            )}

            {/* Clear Filters Button */}
            {activeFiltersCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}

            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
                className="h-7"
              >
                <Grid3x3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => onViewModeChange('list')}
                className="h-7"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Content */}
        <AnimatePresence>
          {(isExpanded || isDesktop) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Category Tabs */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Category
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <Button
                      key={category.value}
                      variant={
                        selectedCategory === category.value ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => handleCategoryChange(category.value)}
                      className="text-sm"
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Range Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-2 block">
                  Time Range
                </label>
                <div className="flex gap-2">
                  {TIME_RANGES.map((range) => (
                    <Button
                      key={range.value}
                      variant={filters.timeRange === range.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTimeRangeChange(range.value)}
                      className="flex-1"
                    >
                      {range.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full justify-between"
              >
                <span className="text-sm font-medium">Advanced Filters</span>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    showAdvanced && 'rotate-180'
                  )}
                />
              </Button>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4 pt-2 border-t"
                  >
                    {/* Price Change Presets */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Min Price Change
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {PRICE_CHANGE_PRESETS.map((preset) => (
                          <Button
                            key={preset.label}
                            variant={
                              filters.minPriceChange === preset.value
                                ? 'default'
                                : 'outline'
                            }
                            size="sm"
                            onClick={() => handlePriceChangePreset(preset.value)}
                            className="min-w-[60px]"
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Custom:</span>
                        <span className="text-sm font-medium tabular-nums">
                          {((filters.minPriceChange ?? 0.05) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    {/* Min Volume Input */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Min Volume ($)
                      </label>
                      <Input
                        type="number"
                        value={filters.minVolume || 1000}
                        onChange={handleVolumeChange}
                        min={0}
                        step={100}
                        placeholder="1000"
                        className="max-w-[200px]"
                      />
                    </div>

                    {/* Trend Direction */}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground mb-2 block">
                        Trend
                      </label>
                      <div className="flex gap-2">
                        {TREND_OPTIONS.map((option) => (
                          <Button
                            key={option.label}
                            variant={
                              filters.trend === option.value ? 'default' : 'outline'
                            }
                            size="sm"
                            onClick={() => handleTrendChange(option.value)}
                            className="flex-1"
                          >
                            {option.value === 'up' && (
                              <TrendingUp className="h-4 w-4 mr-1" />
                            )}
                            {option.value === 'down' && (
                              <TrendingDown className="h-4 w-4 mr-1" />
                            )}
                            {option.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}
