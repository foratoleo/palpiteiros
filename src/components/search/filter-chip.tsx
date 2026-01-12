/**
 * Filter Chip Component
 *
 * Clickable filter chips with active state, removable, and keyboard navigation.
 * Used for displaying active filters and quick filter options.
 *
 * @features
 * - Active/inactive states with visual feedback
 * - Removable with X button
 * - Keyboard navigation
 * - Size variants (sm, md, lg)
 * - Style variants (solid, outline, ghost)
 * - Icon support
 * - Animation on toggle
 *
 * @example
 * ```tsx
 * <FilterChip
 *   label="Politics"
 *   active={isActive}
 *   onToggle={() => setIsActive(!isActive)}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { X, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ============================================================================
// TYPES
// ============================================================================

export interface FilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Display label */
  label: string
  /** Active state */
  active?: boolean
  /** Toggle callback */
  onToggle?: () => void
  /** Show remove button when active */
  removable?: boolean
  /** Remove callback */
  onRemove?: () => void
  /** Icon to display */
  icon?: React.ReactNode
  /** Count badge */
  count?: number
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Style variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'glass'
  /** Animated toggle */
  animated?: boolean
}

// ============================================================================
// STYLES
// ============================================================================

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        solid: cn(
          'border-transparent',
          'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground',
          'data-[active=false]:bg-secondary data-[active=false]:text-secondary-foreground'
        ),
        outline: cn(
          'border border-input bg-background',
          'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:border-primary',
          'data-[active=false]:text-foreground hover:bg-accent'
        ),
        ghost: cn(
          'border-transparent bg-transparent',
          'data-[active=true]:bg-accent data-[active=true]:text-accent-foreground',
          'data-[active=false]:text-muted-foreground hover:bg-accent/50 hover:text-foreground'
        ),
        glass: cn(
          'border border-border/50 bg-background/50 backdrop-blur-md',
          'data-[active=true]:bg-primary/90 data-[active=true]:text-primary-foreground data-[active=true]:border-primary/50',
          'data-[active=false]:text-foreground hover:bg-accent/50'
        )
      },
      size: {
        sm: 'h-7 px-2.5 text-xs',
        md: 'h-9 px-3.5 text-sm',
        lg: 'h-11 px-4 text-base'
      }
    },
    defaultVariants: {
      variant: 'solid',
      size: 'md'
    }
  }
)

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Filter Chip
 *
 * Individual filter chip with active state and optional remove button
 */
export const FilterChip = React.forwardRef<HTMLButtonElement, FilterChipProps>(
  (
    {
      label,
      active = false,
      onToggle,
      removable = false,
      onRemove,
      icon,
      count,
      disabled = false,
      size = 'md',
      variant = 'solid',
      animated = true,
      className,
      ...props
    },
    ref
  ) => {
    // Filter out drag-related props that conflict with Framer Motion
    const {
      onDrag, onDragStart, onDragEnd, onDragConstraints,
      whileDrag, drag, dragConstraints, dragSnapToOrigin,
      dragElastic, dragMomentum, dragPropagation, dragListener, dragControls,
      ...safeButtonProps
    } = (props || {}) as any

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return
      // If remove button was clicked, don't toggle
      if ((e.target as HTMLElement).closest('[data-remove]')) {
        return
      }
      onToggle?.()
    }

    const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation()
      onRemove?.()
    }

    const showRemove = removable && active

    return (
      <motion.button
        ref={ref}
        type="button"
        data-active={active}
        disabled={disabled}
        onClick={handleClick}
        className={cn(chipVariants({ variant, size }), className)}
        whileHover={disabled ? undefined : { scale: 1.02 }}
        whileTap={disabled ? undefined : { scale: 0.98 }}
        animate={
          animated
            ? {
                scale: active ? [1, 1.05, 1] : 1,
                transition: { duration: 0.2 }
              }
            : undefined
        }
        {...safeButtonProps}
      >
        {/* Icon */}
        {icon && <span className="shrink-0">{icon}</span>}

        {/* Label */}
        <span className="truncate max-w-[120px]">{label}</span>

        {/* Count Badge */}
        {count !== undefined && count > 0 && (
          <span className="ml-auto text-xs opacity-70">{count}</span>
        )}

        {/* Active Check Icon */}
        {active && !showRemove && (
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="shrink-0"
          >
            <Check className="h-3.5 w-3.5" />
          </motion.span>
        )}

        {/* Remove Button */}
        <AnimatePresence>
          {showRemove && (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <span
                data-remove
                onClick={handleRemove}
                className="shrink-0 rounded-full p-0.5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                aria-label={`Remove ${label} filter`}
              >
                <X className="h-3 w-3" />
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    )
  }
)

FilterChip.displayName = 'FilterChip'

// ============================================================================
// CHIP GROUP
// ============================================================================

export interface FilterChipGroupProps {
  /** Available filter options */
  options: Array<{
    value: string
    label: string
    icon?: React.ReactNode
    count?: number
    disabled?: boolean
  }>
  /** Currently selected values */
  value?: string[]
  /** Selection change callback */
  onChange?: (values: string[]) => void
  /** Allow multiple selection */
  multiSelect?: boolean
  /** Show remove button on active chips */
  removable?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Style variant */
  variant?: 'solid' | 'outline' | 'ghost' | 'glass'
  /** Maximum visible chips (rest in dropdown) */
  maxVisible?: number
  /** Additional CSS class names */
  className?: string
  /** Orientation */
  orientation?: 'horizontal' | 'vertical'
}

/**
 * Filter Chip Group
 *
 * Group of filter chips with single or multi-select behavior
 */
export const FilterChipGroup = React.forwardRef<HTMLDivElement, FilterChipGroupProps>(
  (
    {
      options,
      value = [],
      onChange,
      multiSelect = true,
      removable = false,
      size = 'md',
      variant = 'solid',
      maxVisible,
      className,
      orientation = 'horizontal'
    },
    ref
  ) => {
    const [showAll, setShowAll] = React.useState(false)

    const visibleOptions = maxVisible && !showAll ? options.slice(0, maxVisible) : options
    const hasMore = maxVisible && options.length > maxVisible

    const handleToggle = (optionValue: string) => {
      let newValue: string[]

      if (multiSelect) {
        newValue = value.includes(optionValue)
          ? value.filter((v) => v !== optionValue)
          : [...value, optionValue]
      } else {
        newValue = value.includes(optionValue) ? [] : [optionValue]
      }

      onChange?.(newValue)
    }

    const handleRemove = (optionValue: string) => {
      const newValue = value.filter((v) => v !== optionValue)
      onChange?.(newValue)
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex gap-2',
          orientation === 'vertical' ? 'flex-col' : 'flex-wrap',
          className
        )}
      >
        {visibleOptions.map((option) => (
          <FilterChip
            key={option.value}
            label={option.label}
            active={value.includes(option.value)}
            onToggle={() => handleToggle(option.value)}
            onRemove={() => handleRemove(option.value)}
            removable={removable}
            icon={option.icon}
            count={option.count}
            disabled={option.disabled}
            size={size}
            variant={variant}
          />
        ))}

        {hasMore && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
              'text-sm text-muted-foreground hover:text-foreground',
              'px-3 py-1.5 hover:bg-accent'
            )}
          >
            +{options.length - maxVisible} more
          </button>
        )}

        {showAll && (
          <button
            onClick={() => setShowAll(false)}
            className={cn(
              'inline-flex items-center gap-1 rounded-full font-medium transition-colors',
              'text-sm text-muted-foreground hover:text-foreground',
              'px-3 py-1.5 hover:bg-accent'
            )}
          >
            Show less
          </button>
        )}
      </div>
    )
  }
)

FilterChipGroup.displayName = 'FilterChipGroup'

// ============================================================================
// ACTIVE FILTERS DISPLAY
// ============================================================================

export interface ActiveFiltersProps {
  /** Active filters to display */
  filters: Array<{
    key: string
    label: string
    value?: string
  }>
  /** Clear all callback */
  onClearAll: () => void
  /** Clear individual callback */
  onClear: (key: string) => void
  /** Additional CSS class names */
  className?: string
}

/**
 * Active Filters Display
 *
 * Shows active filters with clear buttons and a "Clear All" option
 */
export const ActiveFilters = React.forwardRef<HTMLDivElement, ActiveFiltersProps>(
  ({ filters, onClearAll, onClear, className }, ref) => {
    if (filters.length === 0) return null

    return (
      <div
        ref={ref}
        className={cn('flex flex-wrap items-center gap-2', className)}
      >
        <span className="text-sm text-muted-foreground">Active filters:</span>

        {filters.map((filter) => (
          <FilterChip
            key={filter.key}
            label={filter.label}
            active
            removable
            onRemove={() => onClear(filter.key)}
            size="sm"
            variant="outline"
          />
        ))}

        <button
          onClick={onClearAll}
          className={cn(
            'text-sm text-muted-foreground hover:text-foreground',
            'underline-offset-4 hover:underline transition-colors'
          )}
        >
          Clear all
        </button>
      </div>
    )
  }
)

ActiveFilters.displayName = 'ActiveFilters'
