/**
 * Filter Panel Component
 *
 * Collapsible filter panel with accordion sections, clear all, and apply button.
 * Organizes filters into collapsible sections for better UX.
 *
 * @features
 * - Accordion-style collapsible sections
 * - Clear all filters button
 * - Apply button for batch updates
 * - Active filter count indicator
 * - Responsive sidebar/drawer variants
 * - Glassmorphism design
 * - Keyboard navigation
 *
 * @example
 * ```tsx
 * <FilterPanel
 *   sections={filterSections}
 *   activeFilters={activeFilters}
 *   onApply={(filters) => console.log(filters)}
 *   onClear={() => console.log('cleared')}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import {
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  RotateCcw,
  Check,
  SlidersHorizontal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface FilterOption {
  value: string
  label: string
  icon?: React.ReactNode
  count?: number
  disabled?: boolean
}

export interface FilterSection {
  id: string
  title: string
  icon?: React.ReactNode
  type: 'checkbox' | 'radio' | 'range' | 'select'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
  value?: string | string[] | [number, number]
  defaultValue?: string | string[] | [number, number]
}

export interface FilterPanelProps {
  /** Filter sections configuration */
  sections: FilterSection[]
  /** Active filter values */
  activeFilters?: Record<string, string | string[] | [number, number]>
  /** Filter change callback */
  onFilterChange?: (sectionId: string, value: string | string[] | [number, number]) => void
  /** Apply filters callback */
  onApply?: () => void
  /** Clear all filters callback */
  onClear?: () => void
  /** Panel state */
  open?: boolean
  /** On open/close callback */
  onOpenChange?: (open: boolean) => void
  /** Apply button text */
  applyButtonText?: string
  /** Clear button text */
  clearButtonText?: string
  /** Show apply button */
  showApplyButton?: boolean
  /** Show clear button */
  showClearButton?: boolean
  /** Panel variant */
  variant?: 'sidebar' | 'drawer' | 'modal' | 'inline'
  /** Panel size */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS class names */
  className?: string
  /** Children for custom content */
  children?: React.ReactNode
}

// ============================================================================
// INTERNAL STATE
// ============================================================================

interface FilterPanelState {
  expandedSections: Set<string>
  pendingValues: Record<string, string | string[] | [number, number]>
}

// ============================================================================
// COMPONENT
// ============================================================================

export const FilterPanel = React.forwardRef<HTMLDivElement, FilterPanelProps>(
  (
    {
      sections,
      activeFilters = {},
      onFilterChange,
      onApply,
      onClear,
      open: controlledOpen,
      onOpenChange,
      applyButtonText = 'Apply Filters',
      clearButtonText = 'Clear All',
      showApplyButton = true,
      showClearButton = true,
      variant = 'sidebar',
      size = 'md',
      className,
      children
    },
    ref
  ) => {
    // Internal state for uncontrolled usage
    const [internalOpen, setInternalOpen] = React.useState(true)
    const [state, setState] = React.useState<FilterPanelState>({
      expandedSections: new Set(sections.map((s) => s.id)),
      pendingValues: { ...activeFilters }
    })

    // Determine open state
    const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen

    // Update pending values when active filters change
    React.useEffect(() => {
      setState((prev) => ({
        ...prev,
        pendingValues: { ...activeFilters }
      }))
    }, [activeFilters])

    // Toggle section expansion
    const toggleSection = (sectionId: string) => {
      setState((prev) => {
        const newExpanded = new Set(prev.expandedSections)
        if (newExpanded.has(sectionId)) {
          newExpanded.delete(sectionId)
        } else {
          newExpanded.add(sectionId)
        }
        return { ...prev, expandedSections: newExpanded }
      })
    }

    // Handle filter value change
    const handleValueChange = (sectionId: string, value: string | string[] | [number, number]) => {
      setState((prev) => ({
        ...prev,
        pendingValues: { ...prev.pendingValues, [sectionId]: value }
      }))
      onFilterChange?.(sectionId, value)
    }

    // Handle apply
    const handleApply = () => {
      onApply?.()
    }

    // Handle clear
    const handleClear = () => {
      setState((prev) => ({
        ...prev,
        pendingValues: {}
      }))
      onClear?.()
    }

    // Calculate active filter count
    const activeFilterCount = Object.entries(activeFilters).filter(([_, value]) => {
      if (Array.isArray(value)) return value.length > 0
      if (Array.isArray(value) && value.length === 2) {
        // Range check
        const section = sections.find((s) => s.id === Object.keys(activeFilters).find((k) => activeFilters[k] === value))
        if (section?.min !== undefined && section?.max !== undefined) {
          return value[0] !== section.min || value[1] !== section.max
        }
        return true
      }
      return value !== undefined && value !== ''
    }).length

    // Check if there are pending changes
    const hasPendingChanges = Object.entries(state.pendingValues).some(
      ([key, value]) => value !== activeFilters[key]
    )

    // Size classes
    const sizeClasses = {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96'
    }

    // Render checkbox/radio options
    const renderOptions = (section: FilterSection) => {
      if (!section.options) return null

      const currentValue = state.pendingValues[section.id]
      const isArrayValue = Array.isArray(currentValue)

      return (
        <div className="space-y-2">
          {section.options.map((option) => {
            const isChecked = isArrayValue
              ? (currentValue as string[]).includes(option.value)
              : currentValue === option.value

            return (
              <label
                key={option.value}
                className={cn(
                  'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                  'hover:bg-accent/50',
                  isChecked && 'bg-accent',
                  option.disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                <input
                  type={section.type === 'radio' ? 'radio' : 'checkbox'}
                  checked={isChecked}
                  disabled={option.disabled}
                  onChange={() => {
                    if (section.type === 'radio') {
                      handleValueChange(section.id, option.value)
                    } else {
                      const currentArray = (currentValue as string[]) || []
                      const newArray = currentArray.includes(option.value)
                        ? currentArray.filter((v) => v !== option.value)
                        : [...currentArray, option.value]
                      handleValueChange(section.id, newArray)
                    }
                  }}
                  className="shrink-0"
                />
                {option.icon && (
                  <span className="shrink-0 text-muted-foreground">{option.icon}</span>
                )}
                <span className="flex-1 text-sm truncate">{option.label}</span>
                {option.count !== undefined && (
                  <span className="text-xs text-muted-foreground">{option.count}</span>
                )}
                {isChecked && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="shrink-0 text-primary"
                  >
                    <Check className="h-4 w-4" />
                  </motion.span>
                )}
              </label>
            )
          })}
        </div>
      )
    }

    // Render range input
    const renderRange = (section: FilterSection) => {
      const value = (state.pendingValues[section.id] as [number, number]) || [section.min || 0, section.max || 100]

      return (
        <div className="space-y-4 py-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{section.min}%</span>
            <span className="font-medium text-foreground">
              {value[0]}% - {value[1]}%
            </span>
            <span>{section.max}%</span>
          </div>
          <input
            type="range"
            min={section.min}
            max={section.max}
            step={section.step || 1}
            value={value[0]}
            onChange={(e) => handleValueChange(section.id, [Number(e.target.value), value[1]])}
            className="w-full accent-primary"
          />
          <input
            type="range"
            min={section.min}
            max={section.max}
            step={section.step || 1}
            value={value[1]}
            onChange={(e) => handleValueChange(section.id, [value[0], Number(e.target.value)])}
            className="w-full accent-primary"
          />
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col bg-background border rounded-lg',
          variant === 'sidebar' && 'h-full',
          variant === 'drawer' && 'fixed right-0 top-0 h-full z-50 shadow-xl',
          variant === 'modal' && 'fixed inset-0 z-50 flex items-center justify-center',
          variant === 'inline' && 'w-full',
          !isOpen && variant !== 'drawer' && 'hidden',
          className
        )}
      >
        {/* Modal Overlay */}
        {variant === 'modal' && (
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange?.(false)}
          />
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
            <h3 className="font-semibold">Filters</h3>
            {activeFilterCount > 0 && (
              <Badge variant="secondary">{activeFilterCount}</Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {showClearButton && activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-8 text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                {clearButtonText}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onOpenChange?.(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filter Sections */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {sections.map((section) => {
              const isExpanded = state.expandedSections.has(section.id)
              const isActive = activeFilters[section.id] !== undefined

              return (
                <div key={section.id} className="space-y-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      'flex items-center gap-2 w-full p-2 rounded-md transition-colors',
                      'hover:bg-accent/50 text-left',
                      isActive && 'text-primary font-medium'
                    )}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronRight className="h-4 w-4 shrink-0" />
                    </motion.div>
                    {section.icon && (
                      <span className="shrink-0">{section.icon}</span>
                    )}
                    <span className="flex-1">{section.title}</span>
                    {isActive && (
                      <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                        Active
                      </Badge>
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden pl-6"
                      >
                        {section.type === 'range' ? renderRange(section) : renderOptions(section)}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <Separator />
                </div>
              )
            })}

            {children && <div className="pt-4">{children}</div>}
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 border-t space-y-2">
          {showApplyButton && (
            <Button onClick={handleApply} className="w-full" disabled={!hasPendingChanges}>
              {applyButtonText}
            </Button>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange?.(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    )
  }
)

FilterPanel.displayName = 'FilterPanel'

// ============================================================================
// COLLAPSIBLE TRIGGER
// ============================================================================

export interface FilterPanelTriggerProps {
  /** Active filter count */
  activeCount?: number
  /** On click callback */
  onClick?: () => void
  /** Additional CSS class names */
  className?: string
  children?: React.ReactNode
}

export const FilterPanelTrigger = React.forwardRef<
  HTMLButtonElement,
  FilterPanelTriggerProps
>(({ activeCount = 0, onClick, className, children }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 px-4 py-2 rounded-md border',
        'bg-background hover:bg-accent transition-colors',
        className
      )}
    >
      <Filter className="h-4 w-4 text-muted-foreground" />
      <span>Filters</span>
      {activeCount > 0 && (
        <Badge variant="secondary" className="ml-1">
          {activeCount}
        </Badge>
      )}
      {children}
    </button>
  )
})

FilterPanelTrigger.displayName = 'FilterPanelTrigger'

// ============================================================================
// PRESET CONFIGS
// ============================================================================

export const MARKET_FILTER_SECTIONS: FilterSection[] = [
  {
    id: 'status',
    title: 'Market Status',
    type: 'checkbox',
    options: [
      { value: 'active', label: 'Active', count: 150 },
      { value: 'closed', label: 'Closed', count: 45 },
      { value: 'resolved', label: 'Resolved', count: 200 }
    ]
  },
  {
    id: 'category',
    title: 'Category',
    type: 'checkbox',
    options: [
      { value: 'politics', label: 'Politics', count: 50 },
      { value: 'sports', label: 'Sports', count: 35 },
      { value: 'finance', label: 'Finance', count: 45 },
      { value: 'crypto', label: 'Crypto', count: 60 },
      { value: 'entertainment', label: 'Entertainment', count: 25 }
    ]
  },
  {
    id: 'priceRange',
    title: 'Price Range',
    type: 'range',
    min: 0,
    max: 100,
    step: 5,
    defaultValue: [0, 100]
  },
  {
    id: 'liquidity',
    title: 'Liquidity',
    type: 'range',
    min: 0,
    max: 100000,
    step: 1000,
    defaultValue: [0, 100000]
  }
]
