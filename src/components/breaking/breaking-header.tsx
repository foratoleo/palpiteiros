/**
 * Breaking Header Component
 *
 * Header section for the breaking markets page.
 * Displays title, subtitle, current date, and markets count badge.
 *
 * @features
 * - Title "Breaking News" (H1)
 * - Subtitle with description
 * - Current date display
 * - Markets count badge
 * - Glassmorphism card design
 * - Live connection indicator
 * - Refetching animation
 * - Responsive layout
 *
 * @component BreakingHeader
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Activity, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * BreakingHeader Props
 */
export interface BreakingHeaderProps {
  /** Current date for display */
  date: Date
  /** Number of breaking markets */
  marketsCount: number
  /** Whether real-time connection is active */
  isConnected?: boolean
  /** Whether currently refetching data */
  isRefetching?: boolean
}

/**
 * Format date for display
 * Returns formatted date like "January 11, 2026"
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * BreakingHeader Component
 *
 * Displays the header section with title, date, and markets count.
 *
 * @example
 * ```tsx
 * <BreakingHeader
 *   date={new Date()}
 *   marketsCount={42}
 *   isConnected={true}
 *   isRefetching={false}
 * />
 * ```
 */
export function BreakingHeader({
  date,
  marketsCount,
  isConnected = false,
  isRefetching = false,
}: BreakingHeaderProps) {
  const formattedDate = React.useMemo(() => formatDate(date), [date])

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="mb-6"
    >
      <Card variant="glass" className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Title and Subtitle */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {/* Animated Sparkles Icon */}
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

                {/* Title */}
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Breaking News
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-muted-foreground max-w-2xl">
                See the markets that moved the most in the last 24 hours
              </p>
            </div>

            {/* Date and Count */}
            <div className="flex items-center gap-4">
              {/* Date */}
              <div className="hidden sm:block text-right">
                <p className="text-sm text-muted-foreground">{formattedDate}</p>
              </div>

              {/* Markets Count Badge */}
              <Badge
                variant="glass"
                className={cn(
                  'px-4 py-2 text-sm font-medium',
                  'flex items-center gap-2',
                  'bg-primary/10 border-primary/20'
                )}
              >
                <Activity
                  className={cn(
                    'h-4 w-4',
                    isConnected ? 'text-green-500' : 'text-muted-foreground',
                    isRefetching && 'animate-spin'
                  )}
                />
                <span className="tabular-nums">
                  {marketsCount} breaking {marketsCount === 1 ? 'market' : 'markets'}
                </span>
              </Badge>
            </div>
          </div>

          {/* Mobile Date */}
          <p className="text-sm text-muted-foreground sm:hidden mt-3">
            {formattedDate}
          </p>
        </CardContent>

        {/* Animated Bottom Border */}
        <motion.div
          className="h-0.5 bg-gradient-to-r from-primary/50 via-primary to-primary/50"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ originX: 0 }}
        />
      </Card>
    </motion.div>
  )
}
