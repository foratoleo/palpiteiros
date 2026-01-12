/**
 * Error Boundary Component
 *
 * React error boundary with fallback UI, error logging, and recovery options.
 * Catches JavaScript errors anywhere in the component tree.
 *
 * @features
 * - Catches JavaScript errors in component tree
 * - Displays fallback UI
 * - Logs errors to console and optional service
 * - Provides recovery options (retry, reset, navigate)
 * - Error reporting integration
 * - Development mode with stack trace
 *
 * @example
 * ```tsx
 * <ErrorBoundary
 *   fallback={<ErrorFallback />}
 *   onError={(error) => logError(error)}
 * >
 *   <App />
 * </ErrorBoundary>
 * ```
 */

'use client'

import * as React from 'react'
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  Check,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorBoundaryProps {
  /** Children to be wrapped */
  children: React.ReactNode
  /** Fallback component to render on error */
  fallback?: React.ReactNode | ((error: Error, errorInfo: ErrorInfo) => React.ReactNode)
  /** Error callback */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  /** Custom error component */
  ErrorComponent?: React.ComponentType<ErrorComponentProps>
  /** Enable development mode with stack trace */
  showStackTrace?: boolean
  /** Recovery options */
  recovery?: RecoveryOptions
  /** Additional context data */
  context?: Record<string, unknown>
}

export interface ErrorInfo {
  /** Component stack trace */
  componentStack: string | null
  /** Error boundary stack */
  digest?: string
  /** Additional context */
  context?: Record<string, unknown>
}

export interface ErrorComponentProps {
  /** The error that was thrown */
  error: Error
  /** Error information */
  errorInfo: ErrorInfo
  /** Function to reset the error boundary */
  resetError: () => void
  /** Recovery options */
  recovery?: RecoveryOptions
}

export interface RecoveryOptions {
  /** Show retry button */
  showRetry?: boolean
  /** Show home button */
  showHome?: boolean
  /** Show reset button */
  showReset?: boolean
  /** Show copy error button */
  showCopy?: boolean
  /** Custom retry callback */
  onRetry?: () => void
  /** Custom reset callback */
  onReset?: () => void
  /** Custom home callback */
  onHome?: () => void
}

// ============================================================================
// ERROR CLASSIFIER
// ============================================================================

type ErrorType = 'render' | 'network' | 'auth' | 'validation' | 'unknown'

function classifyError(error: Error): ErrorType {
  const message = error.message.toLowerCase()
  const stack = error.stack?.toLowerCase() || ''

  if (message.includes('network') || message.includes('fetch')) {
    return 'network'
  }
  if (message.includes('auth') || message.includes('token')) {
    return 'auth'
  }
  if (message.includes('validation') || message.includes('invalid')) {
    return 'validation'
  }
  if (stack.includes('react') || stack.includes('render')) {
    return 'render'
  }

  return 'unknown'
}

// ============================================================================
// DEFAULT ERROR COMPONENT
// ============================================================================

const DefaultErrorComponent: React.FC<ErrorComponentProps> = ({
  error,
  errorInfo,
  resetError,
  recovery
}) => {
  const [copied, setCopied] = React.useState(false)
  const [isDev] = React.useState(process.env.NODE_ENV === 'development')
  const errorType = classifyError(error)

  // Copy error to clipboard
  const handleCopy = async () => {
    const errorText = `Error: ${error.message}\n\nStack:\n${error.stack}\n\nComponent Stack:\n${errorInfo.componentStack}`

    try {
      await navigator.clipboard.writeText(errorText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      console.error('Failed to copy error to clipboard')
    }
  }

  // Handle retry
  const handleRetry = () => {
    recovery?.onRetry?.()
    resetError()
  }

  // Handle reset
  const handleReset = () => {
    recovery?.onReset?.()
    resetError()
  }

  // Handle home
  const handleHome = () => {
    recovery?.onHome?.()
    window.location.href = '/'
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-background">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription className="text-base mt-2">
            {error.message || 'An unexpected error occurred while rendering this page.'}
          </CardDescription>
          {errorType !== 'unknown' && (
            <Badge variant="outline" className="mt-3">
              {errorType} error
            </Badge>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Recovery options */}
          {(recovery?.showRetry !== false || recovery?.showReset !== false) && (
            <div className="flex flex-wrap gap-2 justify-center">
              {recovery?.showRetry !== false && (
                <Button onClick={handleRetry} variant="default">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
              )}
              {recovery?.showReset !== false && (
                <Button onClick={handleReset} variant="outline">
                  Reset
                </Button>
              )}
              {recovery?.showHome !== false && (
                <Button onClick={handleHome} variant="ghost">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              )}
            </div>
          )}

          {/* Development stack trace */}
          {isDev && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2">
                <Bug className="h-4 w-4" />
                Error Details (Development)
              </summary>
              <div className="mt-3 p-4 rounded-md bg-muted text-xs font-mono overflow-auto max-h-64">
                <div className="font-semibold text-destructive mb-2">
                  {error.name}: {error.message}
                </div>
                {error.stack && (
                  <pre className="whitespace-pre-wrap break-words">
                    {error.stack}
                  </pre>
                )}
                {errorInfo.componentStack && (
                  <>
                    <div className="font-semibold mt-4 mb-2">Component Stack:</div>
                    <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                      {errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            </details>
          )}

          {/* Copy error */}
          {recovery?.showCopy !== false && (
            <Button
              onClick={handleCopy}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy Error Details
                </>
              )}
            </Button>
          )}
        </CardContent>

        <CardFooter className="text-center text-sm text-muted-foreground">
          If this problem persists, please contact support.
        </CardFooter>
      </Card>
    </div>
  )
}

// ============================================================================
// ERROR BOUNDARY CLASS COMPONENT
// ============================================================================

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

const initialState: ErrorBoundaryState = {
  hasError: false,
  error: null,
  errorInfo: null
}

/**
 * Error Boundary
 *
 * Class component that catches JavaScript errors in its child component tree
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = initialState
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Update state with error info
    this.setState({
      errorInfo: {
        componentStack: errorInfo.componentStack ?? null,
        digest: errorInfo.digest ?? undefined,
        context: this.props.context
      }
    })

    // Log error to console
    console.error('ErrorBoundary caught an error:', error)
    console.error('Component stack:', errorInfo.componentStack)

    // Call error callback if provided
    this.props.onError?.(error, {
      componentStack: errorInfo.componentStack ?? null,
      digest: errorInfo.digest ?? undefined,
      context: this.props.context
    })

    // Log to error reporting service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      })
    }
  }

  resetErrorBoundary = (): void => {
    this.setState(initialState)
  }

  render(): React.ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback, ErrorComponent, recovery, showStackTrace } = this.props

    if (!hasError || !error) {
      return children
    }

    // Use custom ErrorComponent if provided
    if (ErrorComponent) {
      return (
        <ErrorComponent
          error={error}
          errorInfo={errorInfo || { componentStack: null }}
          resetError={this.resetErrorBoundary}
          recovery={recovery}
        />
      )
    }

    // Use fallback function if provided
    if (typeof fallback === 'function') {
      return fallback(error, errorInfo || { componentStack: null })
    }

    // Use fallback node if provided
    if (fallback) {
      return fallback
    }

    // Use default error component
    return (
      <DefaultErrorComponent
        error={error}
        errorInfo={errorInfo || { componentStack: null }}
        resetError={this.resetErrorBoundary}
        recovery={{
          showRetry: true,
          showReset: true,
          showHome: true,
          showCopy: true,
          ...recovery
        }}
      />
    )
  }
}

// ============================================================================
// ERROR BOUNDARY PROVIDER
// ============================================================================

interface ErrorBoundaryProviderProps extends ErrorBoundaryProps {
  /** Enable reset on route change */
  resetOnRouteChange?: boolean
}

/**
 * ErrorBoundaryProvider
 *
 * Provider component for easier usage with route-based reset
 */
export const ErrorBoundaryProvider: React.FC<ErrorBoundaryProviderProps> = ({
  resetOnRouteChange = true,
  ...props
}) => {
  const key = React.useMemo(() => {
    return resetOnRouteChange ? window.location.pathname : 'static'
  }, [])

  return (
    <ErrorBoundary key={key} {...props}>
      {props.children}
    </ErrorBoundary>
  )
}

// ============================================================================
// USE ERROR BOUNDARY HOOK
// ============================================================================

/**
 * useErrorBoundary
 *
 * Hook for manually triggering errors in development
 */
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null)

  const triggerError = React.useCallback((error: Error | string) => {
    setError(typeof error === 'string' ? new Error(error) : error)
  }, [])

  const reset = React.useCallback(() => {
    setError(null)
  }, [])

  // Throw error to let ErrorBoundary catch it
  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { triggerError, reset }
}
