/**
 * Error Fallback Component
 *
 * Inline error fallback for component-level errors.
 * Displays compact error UI within the component's space.
 *
 * @features
 * - Compact inline display
 * - Error message and type
 * - Retry button
 * - Dismissible
 * - Variant styles (card, banner, inline)
 * - Animated appearance
 *
 * @example
 * ```tsx
 * <ErrorFallback
 *   error={error}
 *   reset={reset}
 *   variant="banner"
 * />
 * ```
 */

'use client'

import * as React from 'react'
import {
  AlertTriangle,
  X,
  RefreshCw,
  Info,
  AlertCircle,
  Bug
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { cva, type VariantProps } from 'class-variance-authority'

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorFallbackProps {
  /** The error that occurred */
  error?: Error | string
  /** Reset function to retry */
  reset?: () => void
  /** Error type for styling */
  errorType?: 'error' | 'warning' | 'info' | 'debug'
  /** Display variant */
  variant?: 'card' | 'banner' | 'inline' | 'minimal'
  /** Show dismiss button */
  dismissible?: boolean
  /** On dismiss callback */
  onDismiss?: () => void
  /** Show retry button */
  showRetry?: boolean
  /** Custom message */
  message?: string
  /** Custom icon */
  icon?: React.ReactNode
  /** Additional CSS class names */
  className?: string
  /** Compact size */
  compact?: boolean
}

// ============================================================================
// STYLES
// ============================================================================

const fallbackVariants = cva(
  'rounded-lg border transition-all duration-200',
  {
    variants: {
      variant: {
        card: 'p-4 bg-card shadow-sm',
        banner: 'px-4 py-3 bg-background border-l-4',
        inline: 'px-3 py-2 bg-muted/50',
        minimal: 'px-2 py-1 bg-transparent border-transparent'
      },
      errorType: {
        error: 'border-destructive text-destructive',
        warning: 'border-warning text-warning',
        info: 'border-info text-info',
        debug: 'border-muted-foreground text-muted-foreground'
      }
    },
    defaultVariants: {
      variant: 'card',
      errorType: 'error'
    }
  }
)

const iconMap = {
  error: AlertTriangle,
  warning: AlertCircle,
  info: Info,
  debug: Bug
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ErrorFallback = React.forwardRef<HTMLDivElement, ErrorFallbackProps>(
  (
    {
      error,
      reset,
      errorType = 'error',
      variant = 'card',
      dismissible = false,
      onDismiss,
      showRetry = true,
      message,
      icon,
      className,
      compact = false
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = React.useState(true)

    // Get error message
    const errorMessage = React.useMemo(() => {
      if (message) return message
      if (typeof error === 'string') return error
      if (error?.message) return error.message
      return 'Something went wrong'
    }, [error, message])

    // Get icon - check if icon is a component or render node
    const DefaultIcon = iconMap[errorType]
    const iconComponent = icon && typeof icon !== 'boolean' && typeof icon !== 'string' && typeof icon !== 'number'
      ? (icon as any).type ? icon : null
      : null

    // Handle dismiss
    const handleDismiss = () => {
      setIsVisible(false)
      onDismiss?.()
    }

    // Handle reset
    const handleReset = () => {
      reset?.()
    }

    if (!isVisible) return null

    return (
      <AnimatePresence>
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
          transition={{ duration: 0.2 }}
          className={cn(
            fallbackVariants({ variant, errorType }),
            variant === 'banner' && {
              'border-l-destructive': errorType === 'error',
              'border-l-warning': errorType === 'warning',
              'border-l-info': errorType === 'info',
              'border-l-muted-foreground': errorType === 'debug'
            },
            className
          )}
        >
          <div
            className={cn(
              'flex items-start gap-3',
              compact ? 'gap-2' : 'gap-3'
            )}
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
              className={cn(
                'shrink-0',
                errorType === 'error' && 'text-destructive',
                errorType === 'warning' && 'text-warning',
                errorType === 'info' && 'text-info',
                errorType === 'debug' && 'text-muted-foreground'
              )}
            >
              {iconComponent ? (
                icon
              ) : icon ? (
                <>{icon}</>
              ) : (
                <DefaultIcon className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
              )}
            </motion.div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {variant !== 'minimal' && (
                <p className={cn('text-sm', compact ? 'text-xs' : 'text-sm')}>
                  {errorMessage}
                </p>
              )}
              {errorType === 'debug' && error instanceof Error && process.env.NODE_ENV === 'development' && (
                <details className="mt-2">
                  <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    Stack trace
                  </summary>
                  <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              {showRetry && reset && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleReset}
                  className={compact ? 'h-6 w-6' : 'h-8 w-8'}
                  title="Retry"
                >
                  <RefreshCw className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                </Button>
              )}
              {dismissible && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDismiss}
                  className={compact ? 'h-6 w-6' : 'h-8 w-8'}
                  title="Dismiss"
                >
                  <X className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    )
  }
)

ErrorFallback.displayName = 'ErrorFallback'

// ============================================================================
// SPECIALIZED VARIANTS
// ============================================================================

export interface InlineErrorProps extends Omit<ErrorFallbackProps, 'variant'> {
  /** Icon position */
  iconPosition?: 'left' | 'top'
}

export const InlineError = React.forwardRef<HTMLDivElement, InlineErrorProps>(
  ({ iconPosition = 'left', ...props }, ref) => (
    <div ref={ref} className="flex items-center gap-2 text-sm text-destructive">
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span>
        {props.message || (typeof props.error === 'string' ? props.error : props.error?.message) || 'An error occurred'}
      </span>
      {props.reset && (
        <button
          onClick={props.reset}
          className="ml-auto text-xs underline hover:no-underline"
        >
          Retry
        </button>
      )}
    </div>
  )
)

InlineError.displayName = 'InlineError'

export const ErrorBanner = React.forwardRef<HTMLDivElement, ErrorFallbackProps>(
  (props, ref) => <ErrorFallback ref={ref} variant="banner" {...props} />
)

ErrorBanner.displayName = 'ErrorBanner'

export const ErrorCard = React.forwardRef<HTMLDivElement, ErrorFallbackProps>(
  (props, ref) => <ErrorFallback ref={ref} variant="card" {...props} />
)

ErrorCard.displayName = 'ErrorCard'

// ============================================================================
// ERROR BOUNDARY WITH FALLBACK
// ============================================================================

export interface ErrorBoundaryWithFallbackProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error) => void
}

export const ErrorBoundaryWithFallback: React.FC<ErrorBoundaryWithFallbackProps> = ({
  children,
  fallback: FallbackComponent = ErrorFallback,
  onError
}) => {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    const handleError = (e: ErrorEvent) => {
      const err = new Error(e.message)
      err.stack = e.error?.stack
      setError(err)
      onError?.(err)
    }

    const handleRejection = (e: PromiseRejectionEvent) => {
      const err = new Error(e.reason?.message || 'Promise rejected')
      setError(err)
      onError?.(err)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleRejection)
    }
  }, [onError])

  if (error) {
    return (
      <FallbackComponent
        error={error}
        reset={() => setError(null)}
        variant="card"
        showRetry
        dismissible
      />
    )
  }

  return <>{children}</>
}
