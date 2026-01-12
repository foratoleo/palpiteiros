/**
 * Tweet Card Component
 *
 * Displays a single tweet with Twitter/X branding and features.
 * Supports media attachments, engagement metrics, and category detection.
 *
 * @features
 * - Glassmorphism design with hover effects
 * - Tweet text with hashtag/mention highlighting
 * - Media attachments (images, videos, GIFs)
 * - Engagement metrics (likes, retweets)
 * - Category badge detection
 * - Relative timestamp display
 * - Link to original tweet
 * - Responsive design
 * - Accessibility (keyboard nav, ARIA labels)
 */

'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Repeat2,
  Heart,
  ExternalLink,
  Image as ImageIcon,
  Video,
  AlertCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EnrichedTweet } from '@/types/twitter.types'

/**
 * Tweet Category Detection Result
 */
type TweetCategory = 'Breaking news' | 'New polymarket' | null

/**
 * TweetCard Props
 */
export interface TweetCardProps {
  /** Enriched tweet data to display */
  tweet: EnrichedTweet
  /** Optional media map (for backward compatibility) */
  media?: Map<string, { type: string; url: string; preview_image_url: string }>
  /** Compact variant for smaller cards */
  compact?: boolean
  /** Show media attachments */
  showMedia?: boolean
  /** Show engagement metrics */
  showMetrics?: boolean
  /** Show category badge */
  showCategory?: boolean
  /** Maximum text length before truncation */
  maxTextLength?: number
  /** Additional CSS class names */
  className?: string
  /** Click handler for card (defaults to opening tweet URL) */
  onClick?: () => void
}

/**
 * Detect tweet category based on content keywords
 *
 * @param text - Tweet text content
 * @returns Category label or null
 *
 * @example
 * ```ts
 * detectTweetCategory("BREAKING: Markets surge!") // "Breaking news"
 * detectTweetCategory("New market launched!") // "New polymarket"
 * ```
 */
export function detectTweetCategory(text: string): TweetCategory {
  const lowerText = text.toLowerCase()

  const breakingKeywords = ['breaking', 'urgent', 'alert', '🚨', '⚡']
  const newMarketKeywords = ['new market', 'just launched', 'now live', '🆕']

  if (breakingKeywords.some(kw => lowerText.includes(kw))) {
    return 'Breaking news'
  }

  if (newMarketKeywords.some(kw => lowerText.includes(kw))) {
    return 'New polymarket'
  }

  return null
}

/**
 * Format relative timestamp (e.g., "2h ago")
 * This is a temporary implementation - will be replaced with formatRelativeTimestamp from T13
 *
 * @param createdAt - ISO 8601 timestamp
 * @returns Formatted relative time string
 */
function formatRelativeTimestamp(createdAt: string): string {
  const now = new Date()
  const created = new Date(createdAt)
  const diffMs = now.getTime() - created.getTime()

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) {
    return 'now'
  } else if (minutes < 60) {
    return `${minutes}m ago`
  } else if (hours < 24) {
    return `${hours}h ago`
  } else if (days < 7) {
    return `${days}d ago`
  } else {
    return created.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

/**
 * Format number with K/M/B suffixes
 *
 * @param num - Number to format
 * @returns Formatted string
 */
function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * Parse tweet text and highlight hashtags, mentions, and URLs
 *
 * @param text - Raw tweet text
 * @param entities - Tweet entities for URLs, mentions, hashtags
 * @returns React nodes with highlighted elements
 */
function parseTweetText(
  text: string,
  entities?: EnrichedTweet['entities']
): React.ReactNode {
  if (!entities) {
    return <p className="text-sm whitespace-pre-wrap">{text}</p>
  }

  // Collect all entity positions
  const highlights: Array<{ start: number; end: number; type: string; display: string; href: string }> = []

  // Add hashtags
  entities.hashtags?.forEach(tag => {
    highlights.push({
      start: tag.start,
      end: tag.end,
      type: 'hashtag',
      display: `#${tag.tag}`,
      href: `https://twitter.com/hashtag/${tag.tag}`,
    })
  })

  // Add mentions
  entities.mentions?.forEach(mention => {
    highlights.push({
      start: mention.start,
      end: mention.end,
      type: 'mention',
      display: `@${mention.username}`,
      href: `https://twitter.com/${mention.username}`,
    })
  })

  // Add URLs
  entities.urls?.forEach(url => {
    highlights.push({
      start: url.start,
      end: url.end,
      type: 'url',
      display: url.display_url,
      href: url.expanded_url,
    })
  })

  // Sort by start position
  highlights.sort((a, b) => a.start - b.start)

  // Build the result
  const result: React.ReactNode[] = []
  let lastIndex = 0

  highlights.forEach(highlight => {
    // Add text before the highlight
    if (highlight.start > lastIndex) {
      result.push(text.slice(lastIndex, highlight.start))
    }

    // Add the highlighted element
    const className = cn(
      'rounded-sm transition-colors',
      highlight.type === 'hashtag' && 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
      highlight.type === 'mention' && 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10',
      highlight.type === 'url' && 'text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 hover:underline'
    )

    result.push(
      <a
        key={`${highlight.type}-${highlight.start}`}
        href={highlight.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={(e) => e.stopPropagation()}
      >
        {highlight.display}
      </a>
    )

    lastIndex = highlight.end
  })

  // Add remaining text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex))
  }

  return <p className="text-sm whitespace-pre-wrap">{result}</p>
}

/**
 * TweetCard Component
 *
 * Displays a tweet with:
 * - Author info (avatar, name, username)
 * - Category badge (Breaking news / New polymarket)
 * - Tweet text with highlighted entities
 * - Media attachments
 * - Engagement metrics
 * - Relative timestamp
 * - Link to original tweet
 *
 * @example
 * ```tsx
 * <TweetCard
 *   tweet={enrichedTweet}
 *   showMedia
 *   showMetrics
 *   showCategory
 * />
 * ```
 */
export const TweetCard = React.memo<TweetCardProps>(({
  tweet,
  compact = false,
  showMedia = true,
  showMetrics = true,
  showCategory = true,
  maxTextLength,
  className,
  onClick
}) => {
  const category = React.useMemo(() => detectTweetCategory(tweet.text), [tweet.text])
  const timestamp = React.useMemo(() => formatRelativeTimestamp(tweet.created_at), [tweet.created_at])
  const tweetUrl = React.useMemo(
    () => `https://twitter.com/${tweet.author?.username || 'i'}/status/${tweet.id}`,
    [tweet.id, tweet.author]
  )

  // Truncate text if needed
  const displayText = React.useMemo(() => {
    if (maxTextLength && tweet.text.length > maxTextLength) {
      return tweet.text.slice(0, maxTextLength) + '...'
    }
    return tweet.text
  }, [tweet.text, maxTextLength])

  // Handle card click
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick()
    } else {
      window.open(tweetUrl, '_blank', 'noopener,noreferrer')
    }
  }, [onClick, tweetUrl])

  // Get media items
  const mediaItems = React.useMemo(() => {
    if (!showMedia || !tweet.media || tweet.media.length === 0) {
      return []
    }
    return tweet.media?.slice(0, 4) ?? [] // Max 4 media items
  }, [showMedia, tweet.media])

  return (
    <motion.div
      className={cn(
        'group relative bg-glass-light backdrop-blur-md border border-glass-border rounded-xl overflow-hidden',
        'hover:shadow-lg hover:shadow-black/10 hover:border-glass-border-hover',
        'transition-all duration-200',
        compact && 'p-3',
        !compact && 'p-4',
        className
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      whileHover={{ scale: 1.01 }}
      onClick={handleClick}
      role="article"
      aria-label={`Tweet by ${tweet.author?.name || 'Unknown'}: ${displayText}`}
    >
      {/* Header: Author info + timestamp + category */}
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Avatar */}
          {tweet.author?.profile_image_url ? (
            <img
              src={tweet.author.profile_image_url}
              alt={tweet.author.name}
              className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-white text-xs font-semibold">
                {tweet.author?.name?.charAt(0) || '?'}
              </span>
            </div>
          )}

          {/* Author name + username */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm truncate">
                {tweet.author?.name || 'Unknown'}
              </span>
              {tweet.author?.verified && (
                <svg
                  className="w-4 h-4 text-blue-400 flex-shrink-0"
                  viewBox="0 0 22 22"
                  fill="currentColor"
                >
                  <path d="M20.396 11c-.018-.646-.215-1.275-.57-1.816-.354-.54-.852-.972-1.438-1.246.223-.607.27-1.264.14-1.897-.131-.634-.437-1.218-.882-1.687-.47-.445-1.053-.75-1.687-.882-.633-.13-1.29-.083-1.897.14-.273-.587-.704-1.086-1.245-1.44S11.647 1.62 11 1.604c-.646.017-1.273.213-1.813.568s-.969.854-1.24 1.44c-.608-.223-1.267-.272-1.902-.14-.635.13-1.22.436-1.69.882-.445.47-.749 1.055-.878 1.688-.13.633-.08 1.29.144 1.896-.587.274-1.087.705-1.443 1.245-.356.54-.555 1.17-.574 1.817.02.647.218 1.276.574 1.817.356.54.856.972 1.443 1.245-.224.606-.274 1.263-.144 1.896.13.634.433 1.218.877 1.688.47.443 1.054.747 1.687.878.633.132 1.29.084 1.897-.136.274.586.705 1.084 1.246 1.439.54.354 1.17.551 1.816.569.647-.016 1.276-.213 1.817-.567s.972-.854 1.245-1.44c.604.239 1.266.296 1.903.164.636-.132 1.22-.447 1.68-.907.46-.46.776-1.044.908-1.681s.075-1.299-.165-1.903c.586-.274 1.084-.705 1.439-1.246.354-.54.551-1.17.569-1.816zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z" />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="truncate">@{tweet.author?.username || 'unknown'}</span>
              <span>·</span>
              <span>{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Category badge + External link */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {showCategory && category && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                category === 'Breaking news' && 'bg-red-500/10 text-red-400',
                category === 'New polymarket' && 'bg-green-500/10 text-green-400'
              )}
            >
              {category}
            </span>
          )}
          <ExternalLink className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      {/* Tweet text */}
      <div className="mb-3">
        {parseTweetText(displayText, tweet.entities)}
      </div>

      {/* Media attachments */}
      {mediaItems.length > 0 && (
        <div
          className={cn(
            'mb-3 rounded-lg overflow-hidden bg-black/5',
            mediaItems.length === 1 && 'aspect-video',
            mediaItems.length === 2 && 'grid grid-cols-2 gap-1 aspect-video',
            mediaItems.length >= 3 && 'grid grid-cols-2 gap-1 aspect-square'
          )}
        >
          {mediaItems.map((media, index) => {
            const isVideo = media.type === 'video' || media.type === 'animated_gif'
            const mediaUrl = isVideo ? media.preview_image_url : media.url

            if (!mediaUrl) return null

            return (
              <div key={`${media.media_key}-${index}`} className="relative bg-black/5">
                <img
                  src={mediaUrl}
                  alt={media.alt_text || `Tweet media ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {isVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                  </div>
                )}
                {mediaItems.length > 2 && index === 3 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="text-white font-semibold text-lg">+{mediaItems.length - 3}</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Engagement metrics */}
      {showMetrics && tweet.public_metrics && (
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" title="Replies">
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{formatNumber(tweet.public_metrics?.reply_count ?? 0)}</span>
          </div>
          <div className="flex items-center gap-1" title="Retweets">
            <Repeat2 className="w-3.5 h-3.5" />
            <span>{formatNumber(tweet.public_metrics?.retweet_count ?? 0)}</span>
          </div>
          <div className="flex items-center gap-1" title="Likes">
            <Heart className="w-3.5 h-3.5" />
            <span>{formatNumber(tweet.public_metrics?.like_count ?? 0)}</span>
          </div>
        </div>
      )}
    </motion.div>
  )
})

TweetCard.displayName = 'TweetCard'
