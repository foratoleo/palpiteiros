/**
 * Error Components Barrel Export
 *
 * Exports all error handling components for easy importing.
 *
 * @example
 * ```ts
 * import { ErrorBoundary, ErrorFallback, NetworkError } from '@/components/errors'
 * ```
 */

// Error boundary
export {
  ErrorBoundary,
  ErrorBoundaryProvider,
  useErrorBoundary
} from './error-boundary'
export type {
  ErrorBoundaryProps,
  ErrorInfo,
  ErrorComponentProps,
  RecoveryOptions
} from './error-boundary'

// Error page
export {
  ErrorPage,
  NotFoundPage,
  ServerErrorPage,
  AccessDeniedPage,
  UnauthorizedPage
} from './error-page'
export type { ErrorPageProps } from './error-page'

// Error fallback
export {
  ErrorFallback,
  InlineError,
  ErrorBanner,
  ErrorCard,
  ErrorBoundaryWithFallback
} from './error-fallback'
export type {
  ErrorFallbackProps,
  InlineErrorProps,
  ErrorBoundaryWithFallbackProps
} from './error-fallback'

// Network error
export {
  NetworkError,
  useNetworkStatus,
  WithNetworkErrorRetry
} from './network-error'
export type {
  NetworkErrorProps,
  NetworkErrorType,
  WithNetworkErrorRetryProps
} from './network-error'
