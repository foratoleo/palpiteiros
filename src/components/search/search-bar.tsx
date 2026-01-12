/**
 * Search Bar Component
 *
 * Enhanced search input with debouncing, icon, clear button, and loading state.
 * Integrates with market store for search state management.
 *
 * @features
 * - Debounced input to prevent excessive searches
 * - Clear button when input has value
 * - Loading indicator during search
 * - Keyboard shortcut support (Cmd/Ctrl + K)
 * - Responsive design with glassmorphism
 * - Full accessibility with ARIA labels
 *
 * @example
 * ```tsx
 * <SearchBar
 *   placeholder="Search markets..."
 *   onSearch={(query) => console.log(query)}
 *   debounceMs={300}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/hooks/use-debounce'
import { useMarketStore } from '@/stores/market.store'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Minimum query length before triggering search */
  minQueryLength?: number
  /** Custom search handler */
  onSearch?: (query: string) => void
  /** Initial value */
  value?: string
  /** Controlled value change handler */
  onChange?: (value: string) => void
  /** Show loading state */
  loading?: boolean
  /** Additional CSS class names */
  className?: string
  /** Input container variant */
  variant?: 'default' | 'glass' | 'minimal'
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Enable keyboard shortcut hint */
  showShortcut?: boolean
  /** Clear button visibility */
  showClear?: boolean
  /** Disabled state */
  disabled?: boolean
}

// ============================================================================
// STYLES
// ============================================================================

const containerVariants = {
  default: 'bg-background border border-input',
  glass: 'bg-background/50 backdrop-blur-md border border-border/50',
  minimal: 'bg-transparent border-0 border-b border-input'
}

const sizeVariants = {
  sm: 'h-9 text-sm',
  md: 'h-11 text-base',
  lg: 'h-13 text-lg'
}

const iconSizeVariants = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6'
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Search Bar
 *
 * Enhanced search input component with debouncing and loading states
 */
export const SearchBar = React.forwardRef<HTMLInputElement, SearchBarProps>(
  (
    {
      placeholder = 'Search markets...',
      debounceMs = 300,
      minQueryLength = 2,
      onSearch,
      value: controlledValue,
      onChange,
      loading: externalLoading = false,
      className,
      variant = 'default',
      size = 'md',
      showShortcut = true,
      showClear = true,
      disabled = false
    },
    ref
  ) => {
    // Store integration for auto-opening command palette
    const setSearch = useMarketStore((state) => state.setSearch)
    const searchQuery = useMarketStore((state) => state.searchQuery)

    // Internal state for uncontrolled usage
    const [internalValue, setInternalValue] = React.useState('')
    const [isFocused, setIsFocused] = React.useState(false)

    // Determine if controlled or uncontrolled
    const isControlled = controlledValue !== undefined
    const value = isControlled ? controlledValue : internalValue

    // Debounced value for search
    const debouncedValue = useDebounce(value, debounceMs)

    // Combined loading state
    const isLoading = externalLoading || (isFocused && value.length >= minQueryLength && value !== debouncedValue)

    // Input reference
    const inputRef = React.useRef<HTMLInputElement>(null)
    React.useImperativeHandle(ref, () => inputRef.current!)

    // Handle search execution
    React.useEffect(() => {
      if (debouncedValue.length >= minQueryLength || debouncedValue.length === 0) {
        onSearch?.(debouncedValue)
        if (!isControlled) {
          setSearch(debouncedValue)
        }
      }
    }, [debouncedValue, minQueryLength, onSearch, isControlled, setSearch])

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      if (!isControlled) {
        setInternalValue(newValue)
      }
      onChange?.(newValue)
    }

    // Handle clear
    const handleClear = () => {
      if (!isControlled) {
        setInternalValue('')
      }
      onChange?.('')
      onSearch?.('')
      setSearch('')
      inputRef.current?.focus()
    }

    // Handle keyboard shortcut
    React.useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
          e.preventDefault()
          inputRef.current?.focus()
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    // Escape to clear
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape' && value) {
        handleClear()
      }
    }

    return (
      <div
        className={cn(
          'relative flex items-center w-full rounded-lg transition-all duration-200',
          'focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
          containerVariants[variant],
          sizeVariants[size],
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        {/* Search Icon */}
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: isFocused ? 1.1 : 1 }}
          transition={{ duration: 0.2 }}
          className="absolute left-3 pointer-events-none"
        >
          <Search
            className={cn(
              'text-muted-foreground transition-colors',
              isFocused && 'text-foreground',
              iconSizeVariants[size]
            )}
          />
        </motion.div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            'flex-1 bg-transparent border-0 outline-none',
            'placeholder:text-muted-foreground',
            'text-foreground',
            size === 'sm' ? 'pl-9 pr-20' : size === 'md' ? 'pl-10 pr-24' : 'pl-12 pr-28',
            'disabled:cursor-not-allowed'
          )}
          aria-label="Search"
          aria-describedby="search-description"
        />

        {/* Right side actions */}
        <div className="absolute right-2 flex items-center gap-1">
          {/* Loading indicator */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-center"
              >
                <Loader2
                  className={cn(
                    'animate-spin text-muted-foreground',
                    iconSizeVariants[size]
                  )}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Clear button */}
          <AnimatePresence>
            {showClear && value && !isLoading && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                onClick={handleClear}
                className={cn(
                  'flex items-center justify-center rounded-md',
                  'text-muted-foreground hover:text-foreground',
                  'hover:bg-accent transition-colors',
                  size === 'sm' ? 'p-1' : 'p-1.5'
                )}
                aria-label="Clear search"
                type="button"
              >
                <X className={iconSizeVariants[size]} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Keyboard shortcut hint */}
          {showShortcut && !value && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: isFocused ? 0 : 1 }}
              className={cn(
                'hidden sm:flex items-center gap-1 rounded-md px-2 py-0.5',
                'bg-muted text-muted-foreground text-xs font-medium',
                'border border-border/50'
              )}
            >
              <kbd className="font-sans">⌘</kbd>
              <kbd className="font-sans">K</kbd>
            </motion.div>
          )}
        </div>

        {/* Screen reader description */}
        <span id="search-description" className="sr-only">
          Search markets by name, description, or tags. Press Escape to clear.
        </span>
      </div>
    )
  }
)

SearchBar.displayName = 'SearchBar'

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Compact Search Bar
 *
 * Smaller variant for inline usage
 */
export const SearchBarCompact = React.forwardRef<HTMLInputElement, Omit<SearchBarProps, 'size'>>(
  (props, ref) => <SearchBar ref={ref} {...props} size="sm" variant="minimal" showShortcut={false} />
)

SearchBarCompact.displayName = 'SearchBarCompact'

/**
 * Glass Search Bar
 *
 * Glassmorphism variant for hero sections
 */
export const SearchBarGlass = React.forwardRef<HTMLInputElement, Omit<SearchBarProps, 'variant'>>(
  (props, ref) => <SearchBar ref={ref} {...props} variant="glass" size="lg" />
)

SearchBarGlass.displayName = 'SearchBarGlass'
