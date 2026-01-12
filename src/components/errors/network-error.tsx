/**
 * Network Error Component
 *
 * Network error component with retry mechanism, offline detection,
 * and connection status display.
 *
 * @features
 * - Automatic retry with exponential backoff
 * - Offline detection
 * - Connection status indicator
 * - Retry countdown
 * - Detailed error messages
 * - Manual retry button
 *
 * @example
 * ```tsx
 * <NetworkError
 *   error={error}
 *   onRetry={() => refetch()}
 *   retryCount={3}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import {
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  X,
  Clock,
  ServerCrash
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type NetworkErrorType =
  | 'offline'
  | 'timeout'
  | 'server-error'
  | 'network-error'
  | 'unknown'

export interface NetworkErrorProps {
  /** The error that occurred */
  error?: Error | { message?: string; code?: string | number }
  /** Retry callback */
  onRetry?: () => void | Promise<void>
  /** Current retry attempt */
  retryCount?: number
  /** Maximum retry attempts */
  maxRetries?: number
  /** Retry delay in milliseconds */
  retryDelay?: number
  /** Enable automatic retry */
  autoRetry?: boolean
  /** Show detailed error info */
  showDetails?: boolean
  /** Display variant */
  variant?: 'full' | 'compact' | 'inline' | 'banner'
  /** Additional CSS class names */
  className?: string
  /** Custom message */
  message?: string
  /** Error type override */
  errorType?: NetworkErrorType
}

// ============================================================================
// ERROR CLASSIFICATION
// ============================================================================

function classifyNetworkError(
  error?: Error | { message?: string; code?: string | number }
): NetworkErrorType {
  if (!error) return 'unknown'

  const message = error.message?.toLowerCase() || ''
  const code = String('code' in error ? (error.code || '') : '')

  // Check for offline
  if (typeof window !== 'undefined' && !navigator.onLine) {
    return 'offline'
  }

  // Check for timeout
  if (message.includes('timeout') || code === 'ETIMEDOUT' || code === 'ECONNABORTED') {
    return 'timeout'
  }

  // Check for server errors
  if (code.startsWith('5') || message.includes('server error')) {
    return 'server-error'
  }

  // Check for network errors
  if (
    message.includes('network') ||
    message.includes('fetch') ||
    code === 'ENETWORK' ||
    code === 'ERR_NETWORK'
  ) {
    return 'network-error'
  }

  return 'unknown'
}

// ============================================================================
// ERROR MESSAGES
// ============================================================================

const ERROR_MESSAGES: Record<NetworkErrorType, { title: string; message: string; icon: React.ReactNode }> = {
  offline: {
    title: 'You\'re offline',
    message: 'Please check your internet connection and try again.',
    icon: <WifiOff className="h-5 w-5" />
  },
  timeout: {
    title: 'Request timeout',
    message: 'The request took too long to complete. Please try again.',
    icon: <Clock className="h-5 w-5" />
  },
  'server-error': {
    title: 'Server error',
    message: 'Something went wrong on our end. Please try again later.',
    icon: <ServerCrash className="h-5 w-5" />
  },
  'network-error': {
    title: 'Network error',
    message: 'A network error occurred. Please check your connection.',
    icon: <Wifi className="h-5 w-5" />
  },
  unknown: {
    title: 'Connection error',
    message: 'An unexpected error occurred. Please try again.',
    icon: <AlertCircle className="h-5 w-5" />
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const NetworkError = React.forwardRef<HTMLDivElement, NetworkErrorProps>(
  (
    {
      error,
      onRetry,
      retryCount = 0,
      maxRetries = 3,
      retryDelay = 5000,
      autoRetry = false,
      showDetails = false,
      variant = 'full',
      className,
      message,
      errorType: errorTypeProp
    },
    ref
  ) => {
    const [isRetrying, setIsRetrying] = React.useState(false)
    const [countdown, setCountdown] = React.useState(0)
    const [isOnline, setIsOnline] = React.useState(
      typeof window !== 'undefined' ? navigator.onLine : true
    )

    // Classify error
    const errorType = errorTypeProp || classifyNetworkError(error)
    const errorContent = ERROR_MESSAGES[errorType]

    // Update online status
    React.useEffect(() => {
      const handleOnline = () => setIsOnline(true)
      const handleOffline = () => setIsOnline(false)

      window.addEventListener('online', handleOnline)
      window.addEventListener('offline', handleOffline)

      return () => {
        window.removeEventListener('online', handleOnline)
        window.removeEventListener('offline', handleOffline)
      }
    }, [])

    // Auto retry countdown
    React.useEffect(() => {
      if (!autoRetry || !onRetry || retryCount >= maxRetries || countdown > 0) {
        return
      }

      const timer = setTimeout(() => {
        handleRetry()
      }, 1000)

      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        clearTimeout(timer)
        clearInterval(interval)
      }
    }, [autoRetry, onRetry, retryCount, maxRetries, countdown])

    // Handle retry
    const handleRetry = async () => {
      if (isRetrying) return

      setIsRetrying(true)
      try {
        await onRetry?.()
      } finally {
        setIsRetrying(false)
        setCountdown(0)
      }
    }

    // Remaining retries
    const remainingRetries = maxRetries - retryCount
    const canRetry = remainingRetries > 0 && onRetry

    // Display message
    const displayMessage = message || errorContent.message

    // Render based on variant
    if (variant === 'inline') {
      return (
        <div
          ref={ref}
          className={cn(
            'flex items-center gap-2 text-sm text-destructive',
            className
          )}
        >
          {errorContent.icon}
          <span>{displayMessage}</span>
          {canRetry && (
            <button
              onClick={handleRetry}
              disabled={isRetrying || !isOnline}
              className="ml-auto text-xs underline hover:no-underline disabled:opacity-50 disabled:no-underline"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
        </div>
      )
    }

    if (variant === 'banner') {
      return (
        <motion.div
          ref={ref}
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className={cn(
            'border-l-4 bg-background px-4 py-3 flex items-center gap-3',
            errorType === 'offline' && 'border-l-destructive',
            errorType === 'timeout' && 'border-l-warning',
            errorType === 'server-error' && 'border-l-destructive',
            errorType === 'network-error' && 'border-l-warning',
            className
          )}
        >
          <div className={cn(
            'shrink-0',
            errorType === 'offline' && 'text-destructive',
            errorType === 'timeout' && 'text-warning',
            errorType === 'server-error' && 'text-destructive',
            errorType === 'network-error' && 'text-warning'
          )}>
            {errorContent.icon}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">{errorContent.title}</p>
            <p className="text-xs text-muted-foreground">{displayMessage}</p>
          </div>
          {canRetry && (
            <Button
              size="sm"
              onClick={handleRetry}
              disabled={isRetrying || !isOnline}
              variant="outline"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Retry
                </>
              )}
            </Button>
          )}
        </motion.div>
      )
    }

    if (variant === 'compact') {
      return (
        <Card ref={ref} className={cn('p-4', className)}>
          <div className="flex items-center gap-3">
            <div className={cn(
              'shrink-0',
              errorType === 'offline' && 'text-destructive',
              errorType === 'timeout' && 'text-warning',
              errorType === 'server-error' && 'text-destructive',
              errorType === 'network-error' && 'text-warning'
            )}>
              {errorContent.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{errorContent.title}</p>
              <p className="text-xs text-muted-foreground truncate">{displayMessage}</p>
            </div>
            {canRetry && (
              <Button
                size="sm"
                onClick={handleRetry}
                disabled={isRetrying || !isOnline}
                variant="outline"
                className="shrink-0"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-3 w-3" />
                    Retry
                  </>
                )}
              </Button>
            )}
          </div>
          {!isOnline && (
            <Badge variant="destructive" className="mt-2">
              Offline
            </Badge>
          )}
        </Card>
      )
    }

    // Full variant (default)
    return (
      <Card ref={ref} className={cn('max-w-md mx-auto', className)}>
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <div className={cn(
              'shrink-0',
              errorType === 'offline' && 'text-destructive',
              errorType === 'timeout' && 'text-warning',
              errorType === 'server-error' && 'text-destructive',
              errorType === 'network-error' && 'text-warning'
            )}>
              {errorContent.icon}
            </div>
          </div>
          <CardTitle className="text-center">{errorContent.title}</CardTitle>
          <CardDescription className="text-center">{displayMessage}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="flex items-center justify-center gap-2">
            {isOnline ? (
              <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400">
                <Wifi className="mr-1 h-3 w-3" />
                Online
              </Badge>
            ) : (
              <Badge variant="destructive">
                <WifiOff className="mr-1 h-3 w-3" />
                Offline
              </Badge>
            )}
          </div>

          {/* Retry Info */}
          {retryCount > 0 && (
            <div className="text-center text-sm text-muted-foreground">
              Retry attempt {retryCount} of {maxRetries}
              {remainingRetries > 0 && (
                <span> ({remainingRetries} remaining)</span>
              )}
            </div>
          )}

          {/* Countdown Progress */}
          {countdown > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Auto-retry in</span>
                <span>{countdown}s</span>
              </div>
              <Progress value={(retryDelay / 1000 - countdown) / (retryDelay / 1000) * 100} />
            </div>
          )}

          {/* Retry Button */}
          {canRetry && (
            <Button
              onClick={handleRetry}
              disabled={isRetrying || !isOnline}
              className="w-full"
            >
              {isRetrying ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Try Again
                </>
              )}
            </Button>
          )}

          {/* Error Details */}
          {showDetails && error && (
            <details className="text-xs">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Error details
              </summary>
              <pre className="mt-2 p-2 rounded bg-muted overflow-auto max-h-32">
                {error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    )
  }
)

NetworkError.displayName = 'NetworkError'

// ============================================================================
// USE NETWORK STATUS HOOK
// ============================================================================

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof window !== 'undefined' ? navigator.onLine : true
  )

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    isOnline,
    isOffline: !isOnline
  }
}

// ============================================================================
// WITH NETWORK ERROR RETRY HOC
// ============================================================================

export interface WithNetworkErrorRetryProps {
  /** Fetch function that may fail */
  fetchFn: () => Promise<void>
  /** Children to render while loading */
  children?: React.ReactNode
  /** Error component */
  ErrorComponent?: React.ComponentType<NetworkErrorProps>
  /** Maximum retries */
  maxRetries?: number
  /** Retry delay */
  retryDelay?: number
  /** Enable auto retry */
  autoRetry?: boolean
}

export function WithNetworkErrorRetry({
  fetchFn,
  children,
  ErrorComponent = NetworkError,
  maxRetries = 3,
  retryDelay = 5000,
  autoRetry = false
}: WithNetworkErrorRetryProps) {
  const [error, setError] = React.useState<Error | null>(null)
  const [retryCount, setRetryCount] = React.useState(0)

  const executeFetch = React.useCallback(async () => {
    try {
      await fetchFn()
      setError(null)
      setRetryCount(0)
    } catch (err) {
      setError(err as Error)
    }
  }, [fetchFn])

  React.useEffect(() => {
    executeFetch()
  }, [executeFetch])

  const handleRetry = async () => {
    setRetryCount((prev) => prev + 1)
    try {
      await fetchFn()
      setError(null)
      setRetryCount(0)
    } catch (err) {
      setError(err as Error)
    }
  }

  if (error) {
    return (
      <ErrorComponent
        error={error}
        onRetry={handleRetry}
        retryCount={retryCount}
        maxRetries={maxRetries}
        retryDelay={retryDelay}
        autoRetry={autoRetry}
      />
    )
  }

  return <>{children}</>
}
