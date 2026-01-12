/**
 * Search Components Barrel Export
 *
 * Exports all search and filter components for easy importing.
 *
 * @example
 * ```ts
 * import { SearchBar, CommandPalette, MarketFilters } from '@/components/search'
 * ```
 */

// Search input components
export { SearchBar, SearchBarCompact, SearchBarGlass } from './search-bar'
export type { SearchBarProps } from './search-bar'

// Command palette
export {
  CommandPalette,
  CommandPaletteTrigger
} from './command-palette'
export type { CommandPaletteProps, CommandPaletteTriggerProps } from './command-palette'

// Market filters
export {
  MarketFilters,
  MarketFiltersDropdown
} from './market-filters'
export type { MarketFiltersProps, MarketFiltersDropdownProps } from './market-filters'

// Filter chips
export {
  FilterChip,
  FilterChipGroup,
  ActiveFilters
} from './filter-chip'
export type { FilterChipProps, FilterChipGroupProps, ActiveFiltersProps } from './filter-chip'

// Filter panel
export {
  FilterPanel,
  FilterPanelTrigger,
  MARKET_FILTER_SECTIONS
} from './filter-panel'
export type {
  FilterPanelProps,
  FilterPanelTriggerProps,
  FilterOption,
  FilterSection
} from './filter-panel'

// Hooks
export {
  useMarketSearch,
  useMarketSearchSimple,
  useMarketSearchFuzzy
} from '@/hooks/use-market-search'
export type {
  UseMarketSearchOptions,
  MarketSearchResult,
  UseMarketSearchReturn
} from '@/hooks/use-market-search'

export { useDebounce } from '@/hooks/use-debounce'
