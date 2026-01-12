/**
 * Progress Component
 *
 * Progress bar component with smooth animations and variants.
 * Based on Radix UI Progress primitive with Apple-inspired styling.
 *
 * @features
 * - Smooth transitions
 * - Multiple variants (default, striped, animated)
 * - Size variants (sm, md, lg)
 * - Color variants
 * - Accessibility support
 */

'use client'

import * as React from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// VARIANTS
// ============================================================================

const progressVariants = cva(
  'relative w-full overflow-hidden rounded-full bg-secondary transition-all duration-300',
  {
    variants: {
      size: {
        sm: 'h-1',
        md: 'h-2',
        lg: 'h-3'
      },
      variant: {
        default: '',
        striped: '',
        animated: ''
      }
    },
    defaultVariants: {
      size: 'md',
      variant: 'default'
    }
  }
)

const indicatorVariants = cva(
  'h-full w-full flex-1 transition-all duration-500 ease-out',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        striped: 'bg-primary bg-[length:1rem_1rem] [background-image:linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)]',
        animated: 'bg-primary bg-[length:1rem_1rem] [background-image:linear-gradient(45deg,rgba(255,255,255,.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.15)_50%,rgba(255,255,255,.15)_75%,transparent_75%,transparent)] animate-[progress-stripes_1s_linear_infinite]'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

// ============================================================================
// PROGRESS COMPONENT
// ============================================================================

export interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>,
    VariantProps<typeof progressVariants>,
    VariantProps<typeof indicatorVariants> {}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, size, variant, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(progressVariants({ size, variant }), className)}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(indicatorVariants({ variant }))}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName

// ============================================================================
// EXPORTS
// ============================================================================

export { Progress }
