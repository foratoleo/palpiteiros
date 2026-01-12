/**
 * Error Page Component
 *
 * Full page error display for router errors and critical failures.
 * Provides helpful actions and support information.
 *
 * @features
 * - Full page error display
 * - Error type categorization
 * - Helpful recovery actions
 * - Support information
 * - Animated illustrations
 * - Dark mode support
 *
 * @example
 * ```tsx
 * <ErrorPage
 *   title="Page Not Found"
 *   message="The page you're looking for doesn't exist."
 *   code={404}
 * />
 * ```
 */

'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  Home,
  ArrowLeft,
  RefreshCw,
  Mail,
  Github,
  LifeBuoy,
  Ghost
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorPageProps {
  /** Error title */
  title?: string
  /** Error description */
  message?: string
  /** HTTP error code */
  code?: number
  /** Error type */
  type?: '404' | '500' | '403' | '401' | 'custom'
  /** Custom illustration */
  illustration?: React.ReactNode
  /** Show back button */
  showBack?: boolean
  /** Show refresh button */
  showRefresh?: boolean
  /** Show home button */
  showHome?: boolean
  /** Show support section */
  showSupport?: boolean
  /** Additional actions */
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'ghost'
    icon?: React.ReactNode
  }>
  /** Support email */
  supportEmail?: string
  /** GitHub issues URL */
  githubUrl?: string
  /** Documentation URL */
  docsUrl?: string
  /** Additional CSS class names */
  className?: string
  /** Children for custom content */
  children?: React.ReactNode
}

// ============================================================================
// ERROR ILLUSTRATIONS
// ============================================================================

const Error404Illustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className={cn('relative', className)}
  >
    <div className="text-9xl font-bold text-muted-foreground/20">404</div>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <Ghost className="h-24 w-24 text-muted-foreground" />
    </motion.div>
  </motion.div>
)

const Error500Illustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className={cn('relative', className)}
  >
    <div className="text-9xl font-bold text-destructive/20">500</div>
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <AlertTriangle className="h-24 w-24 text-destructive" />
    </motion.div>
  </motion.div>
)

const Error403Illustration: React.FC<{ className?: string }> = ({ className }) => (
  <motion.div
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.5 }}
    className={cn('relative', className)}
  >
    <div className="text-9xl font-bold text-warning/20">403</div>
    <motion.div
      initial={{ rotate: -45, opacity: 0 }}
      animate={{ rotate: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-4 border-warning flex items-center justify-center">
          <div className="h-20 w-1 bg-warning rounded-full" />
        </div>
      </div>
    </motion.div>
  </motion.div>
)

// ============================================================================
// DEFAULT CONTENT
// ============================================================================

const ERROR_CONTENT: Record<
  string,
  { title: string; message: string; illustration: React.FC<{ className?: string }> }
> = {
  '404': {
    title: 'Page Not Found',
    message: "The page you're looking for doesn't exist or has been moved.",
    illustration: Error404Illustration
  },
  '500': {
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    illustration: Error500Illustration
  },
  '403': {
    title: 'Access Denied',
    message: "You don't have permission to access this resource.",
    illustration: Error403Illustration
  },
  '401': {
    title: 'Unauthorized',
    message: 'Please log in to access this page.',
    illustration: Error403Illustration
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export const ErrorPage = React.forwardRef<HTMLDivElement, ErrorPageProps>(
  (
    {
      title,
      message,
      code = 500,
      type = '500',
      illustration,
      showBack = true,
      showRefresh = true,
      showHome = true,
      showSupport = true,
      actions,
      supportEmail = 'support@palpiteiros.com',
      githubUrl = 'https://github.com/palpiteiros/issues',
      docsUrl = 'https://docs.palpiteiros.com',
      className,
      children
    },
    ref
  ) => {
    const router = useRouter()
    const content = ERROR_CONTENT[type] || ERROR_CONTENT['500']

    const displayTitle = title || content.title
    const displayMessage = message || content.message
    const DefaultIllustration = content.illustration

    const handleGoBack = () => {
      router.back()
    }

    const handleRefresh = () => {
      router.refresh()
    }

    const handleGoHome = () => {
      router.push('/')
    }

    return (
      <div
        ref={ref}
        className={cn(
          'flex min-h-screen items-center justify-center p-4 bg-background',
          className
        )}
      >
        <div className="w-full max-w-2xl space-y-8 text-center">
          {/* Illustration */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center"
          >
            {illustration ? (
              <>{illustration}</>
            ) : (
              <DefaultIllustration className="h-48 w-48" />
            )}
          </motion.div>

          {/* Error Code Badge */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <Badge variant="outline" className="text-lg px-4 py-1">
              Error {code}
            </Badge>
          </motion.div>

          {/* Title and Message */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {displayTitle}
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              {displayMessage}
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {showBack && (
              <Button onClick={handleGoBack} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            )}
            {showRefresh && (
              <Button onClick={handleRefresh} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            )}
            {showHome && (
              <Button onClick={handleGoHome}>
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            )}
            {actions?.map((action, index) => (
              <Button
                key={index}
                onClick={action.onClick}
                variant={action.variant || 'default'}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </motion.div>

          {/* Custom Content */}
          {children}

          {/* Support Section */}
          {showSupport && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Card className="mx-auto max-w-md">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LifeBuoy className="h-5 w-5 text-muted-foreground" />
                    Need Help?
                  </CardTitle>
                  <CardDescription>
                    If the problem persists, reach out to our support team.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <a
                    href={`mailto:${supportEmail}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{supportEmail}</span>
                  </a>
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <Github className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Report on GitHub</span>
                  </a>
                  <a
                    href={docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <LifeBuoy className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">View Documentation</span>
                  </a>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    )
  }
)

ErrorPage.displayName = 'ErrorPage'

// ============================================================================
// PRESET ERROR PAGES
// ============================================================================

export const NotFoundPage = (props: Omit<ErrorPageProps, 'type' | 'code'>) => (
  <ErrorPage type="404" code={404} {...props} />
)

export const ServerErrorPage = (props: Omit<ErrorPageProps, 'type' | 'code'>) => (
  <ErrorPage type="500" code={500} {...props} />
)

export const AccessDeniedPage = (props: Omit<ErrorPageProps, 'type' | 'code'>) => (
  <ErrorPage type="403" code={403} {...props} />
)

export const UnauthorizedPage = (props: Omit<ErrorPageProps, 'type' | 'code'>) => (
  <ErrorPage type="401" code={401} {...props} />
)
