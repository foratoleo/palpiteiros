/**
 * Alert Component
 *
 * Callout-style alert component for displaying important messages,
 * warnings, or information within the application.
 *
 * Based on shadcn/ui alert component pattern.
 *
 * @example
 * ```tsx
 * <Alert>
 *   <AlertCircle className="h-4 w-4" />
 *   <AlertTitle>Error</AlertTitle>
 *   <AlertDescription>Something went wrong</AlertDescription>
 * </Alert>
 * ```
 */

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================================================
// ALERT VARIANTS
// ============================================================================

const alertVariants = cva(
  'relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        destructive:
          'border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive',
        warning:
          'border-yellow-500/50 text-yellow-900 dark:text-yellow-200 dark:border-yellow-500 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400',
        info:
          'border-blue-500/50 text-blue-900 dark:text-blue-200 dark:border-blue-500 [&>svg]:text-blue-600 dark:[&>svg]:text-blue-400',
        success:
          'border-green-500/50 text-green-900 dark:text-green-200 dark:border-green-500 [&>svg]:text-green-600 dark:[&>svg]:text-green-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

// ============================================================================
// ALERT COMPONENT
// ============================================================================

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
  )
)
Alert.displayName = 'Alert'

// ============================================================================
// ALERT TITLE COMPONENT
// ============================================================================

export const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn('mb-1 font-medium leading-none tracking-tight', className)}
      {...props}
    />
  )
)
AlertTitle.displayName = 'AlertTitle'

// ============================================================================
// ALERT DESCRIPTION COMPONENT
// ============================================================================

export const AlertDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
  )
)
AlertDescription.displayName = 'AlertDescription'

// ============================================================================
// EXPORTS
// ============================================================================

export { Alert, alertVariants }
