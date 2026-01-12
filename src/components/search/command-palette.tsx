/**
 * Command Palette Component
 *
 * Global search dialog with Cmd+K keyboard shortcut, market search,
 * navigation links, and recent searches.
 *
 * @features
 * - Cmd/Ctrl + K keyboard shortcut to open
 * - Fuzzy search across markets, pages, and actions
 * - Keyboard navigation (arrow keys, enter, escape)
 * - Recent searches history
 * - Grouped results with sections
 * - Glassmorphism design
 *
 * @example
 * ```tsx
 * <CommandPalette />
 * ```
 */

'use client'

import * as React from 'react'
import {
  Search,
  TrendingUp,
  Home,
  BarChart3,
  Wallet,
  Bell,
  Settings,
  Clock,
  ArrowRight,
  ExternalLink
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useMarketStore } from '@/stores/market.store'
import { useUiStore } from '@/stores/ui.store'
import { cn } from '@/lib/utils'
import type { Market } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

export interface CommandPaletteProps {
  /** Maximum recent searches to store */
  maxRecentSearches?: number
  /** Storage key for recent searches */
  storageKey?: string
  /** Custom navigation items */
  customNavItems?: NavItem[]
  /** Additional action groups */
  customGroups?: CommandGroup[]
}

interface NavItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  href: string
  description?: string
  keywords?: string[]
}

interface CommandGroup {
  id: string
  heading: string
  items: CommandItem[]
}

interface CommandItem {
  id: string
  label: string
  icon?: React.ReactNode
  shortcut?: string
  action: () => void
  keywords?: string[]
  description?: string
}

interface RecentSearch {
  query: string
  timestamp: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STORAGE_KEY = 'command-palette-recent'

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: <Home className="h-4 w-4" />, href: '/', shortcut: 'G H' },
  { id: 'markets', label: 'Markets', icon: <TrendingUp className="h-4 w-4" />, href: '/markets', shortcut: 'G M' },
  { id: 'portfolio', label: 'Portfolio', icon: <Wallet className="h-4 w-4" />, href: '/portfolio', shortcut: 'G P' },
  { id: 'alerts', label: 'Alerts', icon: <Bell className="h-4 w-4" />, href: '/alerts', shortcut: 'G A' },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" />, href: '/settings', shortcut: 'G S' }
]

const QUICK_ACTIONS: CommandItem[] = [
  {
    id: 'toggle-favorites',
    label: 'Show Favorites',
    icon: <BarChart3 className="h-4 w-4" />,
    action: () => {
      // Navigate to favorites filter
      window.location.href = '/markets?filter=favorites'
    },
    keywords: ['favorite', 'star', 'saved']
  },
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    icon: <Settings className="h-4 w-4" />,
    action: () => {
      // Toggle theme via store
      const { useUiStore } = require('@/stores/ui.store')
      useUiStore.getState().toggleTheme()
    },
    keywords: ['dark', 'light', 'theme', 'mode']
  }
]

// ============================================================================
// COMPONENT
// ============================================================================

export const CommandPalette = React.forwardRef<
  HTMLDivElement,
  CommandPaletteProps
>(
  (
    {
      maxRecentSearches = 5,
      storageKey = STORAGE_KEY,
      customNavItems,
      customGroups = []
    },
    ref
  ) => {
    // State
    const [open, setOpen] = React.useState(false)
    const [search, setSearch] = React.useState('')
    const [recentSearches, setRecentSearches] = React.useState<RecentSearch[]>([])

    // Store integration
    const markets = useMarketStore((state) => state.markets)
    const setSearchQuery = useMarketStore((state) => state.setSearch)

    // Merge navigation items
    const navItems = [...DEFAULT_NAV_ITEMS, ...(customNavItems || [])]

    // Load recent searches from localStorage
    React.useEffect(() => {
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem(storageKey)
          if (stored) {
            const parsed = JSON.parse(stored) as RecentSearch[]
            // Filter searches older than 30 days
            const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
            const valid = parsed.filter((s) => s.timestamp > thirtyDaysAgo)
            setRecentSearches(valid.slice(0, maxRecentSearches))
          }
        } catch {
          // Ignore localStorage errors
        }
      }
    }, [storageKey, maxRecentSearches])

    // Keyboard shortcut to open
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          setOpen((prev) => !prev)
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Save recent search
    const saveRecentSearch = (query: string) => {
      if (!query.trim()) return

      const newSearch: RecentSearch = {
        query: query.trim(),
        timestamp: Date.now()
      }

      const updated = [newSearch, ...recentSearches.filter((s) => s.query !== query)].slice(
        0,
        maxRecentSearches
      )

      setRecentSearches(updated)

      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updated))
        } catch {
          // Ignore localStorage errors
        }
      }
    }

    // Handle market selection
    const handleMarketSelect = (market: Market) => {
      saveRecentSearch(search)
      setOpen(false)
      setSearch('')
      setSearchQuery(market.question)
      window.location.href = `/markets/${market.id}`
    }

    // Handle navigation selection
    const handleNavSelect = (item: NavItem) => {
      setOpen(false)
      setSearch('')
      window.location.href = item.href
    }

    // Handle action execution
    const handleAction = (item: CommandItem) => {
      setOpen(false)
      setSearch('')
      item.action()
    }

    // Filter markets based on search
    const filteredMarkets = React.useMemo(() => {
      if (!search.trim()) return []

      const query = search.toLowerCase()
      return markets
        .filter(
          (m) =>
            m.question.toLowerCase().includes(query) ||
            m.description?.toLowerCase().includes(query) ||
            m.tags.some((t: any) => t.label.toLowerCase().includes(query))
        )
        .slice(0, 5)
    }, [search, markets])

    // Filter nav items
    const filteredNavItems = React.useMemo(() => {
      if (!search.trim()) return navItems

      const query = search.toLowerCase()
      return navItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.keywords?.some((k) => k.toLowerCase().includes(query))
      )
    }, [search, navItems])

    // Filter actions
    const filteredActions = React.useMemo(() => {
      if (!search.trim()) return QUICK_ACTIONS

      const query = search.toLowerCase()
      return QUICK_ACTIONS.filter(
        (item) =>
          item.label.toLowerCase().includes(query) ||
          item.keywords?.some((k) => k.toLowerCase().includes(query))
      )
    }, [search])

    // Filter recent searches
    const filteredRecentSearches = React.useMemo(() => {
      if (!search.trim()) return recentSearches

      const query = search.toLowerCase()
      return recentSearches.filter((s) => s.query.toLowerCase().includes(query))
    }, [search, recentSearches])

    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          ref={ref}
          className="overflow-hidden p-0 shadow-2xl max-w-2xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Command Palette</DialogTitle>
            <DialogDescription>
              Search markets, navigate pages, and run actions
            </DialogDescription>
          </DialogHeader>

          <Command className="rounded-lg border-0 bg-background/95 backdrop-blur-md">
            {/* Search Input */}
            <div className="flex items-center border-b px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <CommandInput
                value={search}
                onValueChange={setSearch}
                placeholder="Search markets, pages, actions..."
                className="flex h-12 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="ml-2 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <kbd className="text-xs">ESC</kbd>
                </button>
              )}
            </div>

            <CommandList>
              <AnimatePresence mode="wait">
                {!search && (
                  <motion.div
                    key="empty-state"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="p-6 text-center"
                  >
                    <Search className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Search for anything
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Markets, pages, settings, and more...
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans">
                          ↑↓
                        </kbd>
                        <span>to navigate</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans">
                          ↵
                        </kbd>
                        <span>to select</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <kbd className="rounded border bg-muted px-1.5 py-0.5 font-sans">
                          esc
                        </kbd>
                        <span>to close</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {search && (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {/* Recent Searches */}
                    {filteredRecentSearches.length > 0 && (
                      <>
                        <CommandGroup heading="Recent Searches">
                          {filteredRecentSearches.map((item) => (
                            <CommandItem
                              key={item.query}
                              onSelect={() => {
                                setSearch(item.query)
                                saveRecentSearch(item.query)
                              }}
                              className="flex items-center gap-2"
                            >
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="flex-1">{item.query}</span>
                              <span className="text-xs text-muted-foreground">
                                {Math.floor((Date.now() - item.timestamp) / (1000 * 60 * 60))}h ago
                              </span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                      </>
                    )}

                    {/* Markets */}
                    {filteredMarkets.length > 0 && (
                      <>
                        <CommandGroup heading="Markets">
                          {filteredMarkets.map((market) => (
                            <CommandItem
                              key={market.id}
                              onSelect={() => handleMarketSelect(market)}
                              className="flex items-center gap-3 py-3"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{market.question}</p>
                                {market.description && (
                                  <p className="text-xs text-muted-foreground truncate">
                                    {market.description}
                                  </p>
                                )}
                              </div>
                              {market.current_price !== undefined && (
                                <Badge variant="secondary" className="ml-2">
                                  {(market.current_price * 100).toFixed(0)}%
                                </Badge>
                              )}
                              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
                            </CommandItem>
                          ))}
                          {filteredMarkets.length >= 5 && (
                            <CommandItem
                              onSelect={() => {
                                setSearchQuery(search)
                                setOpen(false)
                                window.location.href = '/markets'
                              }}
                              className="text-muted-foreground"
                            >
                              <span>View all results for "{search}"</span>
                              <ArrowRight className="ml-auto h-4 w-4" />
                            </CommandItem>
                          )}
                        </CommandGroup>
                        <CommandSeparator />
                      </>
                    )}

                    {/* Navigation */}
                    {filteredNavItems.length > 0 && (
                      <>
                        <CommandGroup heading="Navigation">
                          {filteredNavItems.map((item) => (
                            <CommandItem
                              key={item.id}
                              onSelect={() => handleNavSelect(item)}
                              className="flex items-center gap-3"
                            >
                              {item.icon}
                              <span className="flex-1">{item.label}</span>
                              {item.shortcut && (
                                <kbd className="text-xs text-muted-foreground">
                                  {item.shortcut}
                                </kbd>
                              )}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                        <CommandSeparator />
                      </>
                    )}

                    {/* Quick Actions */}
                    {filteredActions.length > 0 && (
                      <CommandGroup heading="Actions">
                        {filteredActions.map((item) => (
                          <CommandItem
                            key={item.id}
                            onSelect={() => handleAction(item)}
                            className="flex items-center gap-3"
                          >
                            {item.icon}
                            <span className="flex-1">{item.label}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}

                    {/* Custom Groups */}
                    {customGroups.map((group) => (
                      <React.Fragment key={group.id}>
                        <CommandSeparator />
                        <CommandGroup heading={group.heading}>
                          {group.items
                            .filter(
                              (item) =>
                                !search ||
                                item.label.toLowerCase().includes(search.toLowerCase()) ||
                                item.keywords?.some((k) => k.toLowerCase().includes(search.toLowerCase()))
                            )
                            .map((item) => (
                              <CommandItem
                                key={item.id}
                                onSelect={() => handleAction(item)}
                                className="flex items-center gap-3"
                              >
                                {item.icon}
                                <span className="flex-1">{item.label}</span>
                                {item.shortcut && (
                                  <kbd className="text-xs text-muted-foreground">
                                    {item.shortcut}
                                  </kbd>
                                )}
                              </CommandItem>
                            ))}
                        </CommandGroup>
                      </React.Fragment>
                    ))}

                    {/* Empty State */}
                    {filteredMarkets.length === 0 &&
                      filteredNavItems.length === 0 &&
                      filteredActions.length === 0 &&
                      filteredRecentSearches.length === 0 && (
                        <CommandEmpty className="py-6">
                          <p className="text-muted-foreground">No results found for "{search}"</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Try a different search term
                          </p>
                        </CommandEmpty>
                      )}
                  </motion.div>
                )}
              </AnimatePresence>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>
    )
  }
)

CommandPalette.displayName = 'CommandPalette'

// ============================================================================
// TRIGGER COMPONENT
// ============================================================================

export interface CommandPaletteTriggerProps {
  children?: React.ReactNode
  className?: string
}

export const CommandPaletteTrigger = React.forwardRef<
  HTMLButtonElement,
  CommandPaletteTriggerProps
>(({ children, className }, ref) => {
  const [open, setOpen] = React.useState(false)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        setOpen(true)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <button
        ref={ref}
        onClick={() => setOpen(true)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-md',
          'bg-muted/50 hover:bg-muted text-muted-foreground',
          'transition-colors text-sm',
          className
        )}
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto text-xs opacity-60">
          <span className="hidden sm:inline">⌘</span>K
        </kbd>
      </button>
      <CommandPalette />
    </>
  )
})

CommandPaletteTrigger.displayName = 'CommandPaletteTrigger'
