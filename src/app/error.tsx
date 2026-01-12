/**
 * Next.js 15 Error Page
 *
 * Global error boundary for the application.
 * Catches errors in the root layout and its children.
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */

'use client'

import { useEffect } from 'react'
import { ErrorPage } from '@/components/errors/error-page'

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorPageProps {
  error: Error & { digest?: string }
  reset: () => void
}

// ============================================================================
// ERROR PAGE COMPONENT
// ============================================================================

/**
 * Global Error Boundary
 *
 * This component catches errors that occur in the root layout and its children.
 * It must be a Client Component and accept error and reset props.
 */
export default function GlobalError({
  error,
  reset
}: ErrorPageProps) {
  // Log error to error reporting service
  useEffect(() => {
    console.error('Global error caught:', error)

    // Send to error reporting service if available
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      ;(window as any).Sentry.captureException(error, {
        tags: {
          location: 'global-error-boundary'
        }
      })
    }
  }, [error])

  return (
    <html lang="en">
      <body>
        <ErrorPage
          type="500"
          code={500}
          title="Something went wrong"
          message={error.message || 'An unexpected error occurred.'}
          showBack={false}
          showRefresh={true}
          showHome={true}
          actions={[
            {
              label: 'Try Again',
              onClick: reset,
              variant: 'default'
            }
          ]}
        />
      </body>
    </html>
  )
}

// ============================================================================
// LAYOUT-LEVEL ERROR BOUNDARY
// ============================================================================

/**
 * NOTE: Next.js 15 also supports error.tsx at the layout level.
 * Create app/(main)/error.tsx for layout-specific error handling.
 *
 * Example:
 *
 * export default function Error({
 *   error,
 *   reset,
 * }: {
 *   error: Error & { digest?: string }
 *   reset: () => void
 * }) {
 *   useEffect(() => {
 *     console.error(error)
 *   }, [error])
 *
 *   return (
 *     <div>
 *       <h2>Something went wrong!</h2>
 *       <button onClick={() => reset()}>Try again</button>
 *     </div>
 *   )
 * }
 */
