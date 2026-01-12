/**
 * Breaking Newsletter CTA Component
 *
 * Call-to-action component for subscribing to the breaking markets newsletter.
 * Supports multiple variants: card, inline, and minimal.
 *
 * @features
 * - Email input with validation
 * - Subscribe button with loading states
 * - Success/error state handling
 * - Frequency selector (daily/weekly)
 * - Glassmorphism styling
 * - Responsive design
 *
 * @component BreakingNewsletterCTA
 */

'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Mail, CheckCircle, AlertCircle, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

// ============================================================================
// TYPES
// ============================================================================

export type NewsletterVariant = 'card' | 'inline' | 'minimal'
export type NewsletterFrequency = 'daily' | 'weekly'

export interface BreakingNewsletterCTAProps {
  /** Visual variant of the component */
  variant?: NewsletterVariant
  /** Additional CSS classes */
  className?: string
  /** Optional callback when subscription succeeds */
  onSuccess?: (email: string) => void
  /** Optional callback when subscription fails */
  onError?: (error: string) => void
  /** Pre-fill email input */
  defaultEmail?: string
}

interface SubscribeResponse {
  success: boolean
  message: string
  reactivated?: boolean
}

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

function isValidEmail(email: string): boolean {
  return EMAIL_REGEX.test(email)
}

// ============================================================================
// SUBSCRIPTION HOOK
// ============================================================================

function useNewsletterSubscription() {
  const [isSubscribing, setIsSubscribing] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [success, setSuccess] = React.useState<string | null>(null)

  const subscribe = React.useCallback(async (email: string, frequency: NewsletterFrequency) => {
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address')
      return false
    }

    setIsSubscribing(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/subscribe-newsletter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            email: email.toLowerCase().trim(),
            frequency,
          }),
        }
      )

      const data: SubscribeResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Subscription failed')
      }

      if (!data.success) {
        throw new Error(data.message || 'Subscription failed')
      }

      setSuccess(data.message)
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred'
      setError(message)
      return false
    } finally {
      setIsSubscribing(false)
    }
  }, [])

  const reset = React.useCallback(() => {
    setError(null)
    setSuccess(null)
  }, [])

  return { subscribe, isSubscribing, error, success, reset }
}

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Card Variant - Full featured newsletter signup card
 */
interface CardVariantProps {
  frequency: NewsletterFrequency
  setFrequency: (freq: NewsletterFrequency) => void
  email: string
  setEmail: (email: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isSubscribing: boolean
  error: string | null
  success: string | null
}

function CardVariant({
  frequency,
  setFrequency,
  email,
  setEmail,
  handleSubmit,
  isSubscribing,
  error,
  success,
}: CardVariantProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <motion.div
            animate={{
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          >
            <Sparkles className="h-6 w-6 text-primary" />
          </motion.div>
          <div>
            <h3 className="font-semibold text-foreground">Get Daily Updates</h3>
            <p className="text-sm text-muted-foreground">
              Receive the top breaking markets in your inbox every morning
            </p>
          </div>
        </div>

        {/* Frequency Selector */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={frequency === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFrequency('daily')}
            className="flex-1"
          >
            Daily
          </Button>
          <Button
            type="button"
            variant={frequency === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFrequency('weekly')}
            className="flex-1"
          >
            Weekly
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubscribing || !!success}
              className="pl-9"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isSubscribing || !!success || !email}
            className="w-full"
          >
            {isSubscribing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Subscribing...
              </>
            ) : success ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Subscribed!
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Subscribe {frequency === 'daily' ? 'Daily' : 'Weekly'}
              </>
            )}
          </Button>
        </form>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-destructive"
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-500"
            >
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              <span>{success}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/**
 * Inline Variant - Compact horizontal layout
 */
function InlineVariant({
  frequency,
  setFrequency,
  email,
  setEmail,
  handleSubmit,
  isSubscribing,
  error,
  success,
}: CardVariantProps) {
  return (
    <Card variant="glass" className="overflow-hidden">
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Text */}
          <div className="flex-1">
            <p className="font-medium text-foreground text-sm">
              Get breaking markets delivered to your inbox
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Top movers every {frequency === 'daily' ? 'morning' : 'week'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as NewsletterFrequency)}
              disabled={isSubscribing || !!success}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>

            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubscribing || !!success}
                className="w-full sm:w-48"
                required
              />
              <Button
                type="submit"
                disabled={isSubscribing || !!success || !email}
                size="sm"
                className="whitespace-nowrap"
              >
                {isSubscribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  'Subscribe'
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Status Messages */}
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-destructive flex items-center gap-1"
            >
              <AlertCircle className="h-3 w-3" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  )
}

/**
 * Minimal Variant - Very compact, just input and button
 */
function MinimalVariant({
  frequency,
  email,
  setEmail,
  handleSubmit,
  isSubscribing,
  error,
  success,
}: CardVariantProps) {
  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Get daily updates..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={isSubscribing || !!success}
        className="flex-1"
        required
      />
      <Button
        type="submit"
        disabled={isSubscribing || !!success || !email}
        size="sm"
      >
        {isSubscribing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : success ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <Mail className="h-4 w-4" />
        )}
      </Button>
      <input type="hidden" name="frequency" value={frequency} />
    </form>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * BreakingNewsletterCTA Component
 *
 * Newsletter subscription call-to-action with multiple visual variants.
 *
 * @example
 * ```tsx
 * // Card variant (default)
 * <BreakingNewsletterCTA />
 *
 * // Inline variant
 * <BreakingNewsletterCTA variant="inline" />
 *
 * // Minimal variant
 * <BreakingNewsletterCTA variant="minimal" />
 * ```
 */
export function BreakingNewsletterCTA({
  variant = 'card',
  className,
  onSuccess,
  onError,
  defaultEmail = '',
}: BreakingNewsletterCTAProps) {
  const [frequency, setFrequency] = React.useState<NewsletterFrequency>('daily')
  const [email, setEmail] = React.useState(defaultEmail)
  const { subscribe, isSubscribing, error, success, reset } = useNewsletterSubscription()

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      reset()

      const succeeded = await subscribe(email, frequency)

      if (succeeded) {
        onSuccess?.(email)
      } else {
        onError?.(error || 'Subscription failed')
      }
    },
    [email, frequency, subscribe, reset, onSuccess, onError, error]
  )

  // Clear success message after 5 seconds
  React.useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        reset()
        setEmail('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [success, reset])

  const commonProps = {
    frequency,
    setFrequency,
    email,
    setEmail,
    handleSubmit,
    isSubscribing,
    error,
    success,
  }

  const variants = {
    card: <CardVariant {...commonProps} />,
    inline: <InlineVariant {...commonProps} />,
    minimal: <MinimalVariant {...commonProps} />,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(variant === 'minimal' ? 'w-full' : '', className)}
    >
      {variants[variant]}
    </motion.div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default BreakingNewsletterCTA
