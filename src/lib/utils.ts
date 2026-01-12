import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// Timestamp Utilities
// ============================================================================

/**
 * Format a timestamp as absolute date/time (Polymarket style)
 * @param timestamp - ISO string or Date object
 * @param includeTime - Whether to include time (default: true)
 * @returns Formatted string: "Jan 11, 9:23 PM" or "Jan 11, 2026"
 *
 * @example
 * formatAbsoluteTimestamp('2026-01-11T21:23:00Z') // "Jan 11, 9:23 PM"
 * formatAbsoluteTimestamp('2026-01-11T21:23:00Z', false) // "Jan 11, 2026"
 * formatAbsoluteTimestamp(new Date('2026-01-11T21:23:00Z')) // "Jan 11, 9:23 PM"
 */
export function formatAbsoluteTimestamp(
  timestamp: string | Date,
  includeTime: boolean = true
): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  try {
    const formatter = new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
      ...(includeTime ? {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      } : {
        year: 'numeric'
      })
    })

    // Format and clean up the output to match Polymarket style
    // Intl might add extra spaces or commas, so we normalize
    let formatted = formatter.format(date)

    // Normalize to match Polymarket format: "Jan 11, 9:23 PM" or "Jan 11, 2026"
    // Remove any extra spaces and ensure consistent comma usage
    formatted = formatted
      .replace(/\s+/g, ' ')
      .replace(/,(\S)/g, ', $1')
      .trim()

    return formatted
  } catch {
    return 'Invalid date'
  }
}

/**
 * Format a timestamp as relative time (e.g., "2h ago", "3 days ago")
 * @param timestamp - ISO string or Date object
 * @returns Formatted string: "2h ago", "3 days ago", "just now"
 *
 * @example
 * formatRelativeTimestamp('2026-01-11T20:00:00Z') // "2h ago" (if current time is 22:00)
 * formatRelativeTimestamp('2026-01-08T10:00:00Z') // "3 days ago"
 * formatRelativeTimestamp(new Date(Date.now() - 30000)) // "just now"
 */
export function formatRelativeTimestamp(
  timestamp: string | Date
): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const isFuture = diffMs < 0
  const absDiffMs = Math.abs(diffMs)

  // Time constants in milliseconds
  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY
  const MONTH = 30 * DAY

  // Determine the appropriate format
  const value = absDiffMs
  const suffix = isFuture ? '' : ' ago'
  const prefix = isFuture ? 'in ' : ''

  if (value < MINUTE) {
    return 'just now'
  } else if (value < HOUR) {
    const minutes = Math.floor(value / MINUTE)
    return `${prefix}${minutes}m${suffix}`
  } else if (value < DAY) {
    const hours = Math.floor(value / HOUR)
    return `${prefix}${hours}h${suffix}`
  } else if (value < WEEK) {
    const days = Math.floor(value / DAY)
    return `${prefix}${days} day${days > 1 ? 's' : ''}${suffix}`
  } else if (value < MONTH) {
    const weeks = Math.floor(value / WEEK)
    return `${prefix}${weeks} week${weeks > 1 ? 's' : ''}${suffix}`
  } else {
    // For dates older than 30 days, use absolute format
    return formatAbsoluteTimestamp(date, false)
  }
}

/**
 * Format timestamp for tweets (shorter format)
 * @param timestamp - ISO string or Date object
 * @returns Formatted string: "2h", "3d", "Jan 11"
 *
 * @example
 * formatTweetTimestamp('2026-01-11T20:00:00Z') // "2h"
 * formatTweetTimestamp('2026-01-08T10:00:00Z') // "3d"
 * formatTweetTimestamp('2025-12-15T10:00:00Z') // "Dec 15"
 */
export function formatTweetTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  // Handle invalid dates
  if (isNaN(date.getTime())) {
    return 'Invalid date'
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const absDiffMs = Math.abs(diffMs)

  // Time constants in milliseconds
  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR
  const WEEK = 7 * DAY

  // Determine the appropriate format
  if (absDiffMs < MINUTE) {
    return 'now'
  } else if (absDiffMs < HOUR) {
    const minutes = Math.floor(absDiffMs / MINUTE)
    return `${minutes}m`
  } else if (absDiffMs < DAY) {
    const hours = Math.floor(absDiffMs / HOUR)
    return `${hours}h`
  } else if (absDiffMs < WEEK) {
    const days = Math.floor(absDiffMs / DAY)
    return `${days}d`
  } else {
    // For older tweets, use short date format: "Jan 11"
    try {
      const formatter = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric'
      })
      return formatter.format(date)
    } catch {
      return 'Invalid date'
    }
  }
}

/**
 * Get a human-readable duration between two timestamps
 * @param start - Start timestamp (ISO string or Date)
 * @param end - End timestamp (ISO string or Date), defaults to now
 * @returns Formatted duration string
 *
 * @example
 * formatDuration('2026-01-11T10:00:00Z', '2026-01-11T12:30:00Z') // "2h 30m"
 * formatDuration('2026-01-11T10:00:00Z') // Duration from start to now
 */
export function formatDuration(
  start: string | Date,
  end?: string | Date
): string {
  const startDate = typeof start === 'string' ? new Date(start) : start
  const endDate = end
    ? (typeof end === 'string' ? new Date(end) : end)
    : new Date()

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return 'Invalid duration'
  }

  const diffMs = endDate.getTime() - startDate.getTime()
  const absDiffMs = Math.abs(diffMs)

  const MINUTE = 60 * 1000
  const HOUR = 60 * MINUTE
  const DAY = 24 * HOUR

  const parts: string[] = []

  const days = Math.floor(absDiffMs / DAY)
  const hours = Math.floor((absDiffMs % DAY) / HOUR)
  const minutes = Math.floor((absDiffMs % HOUR) / MINUTE)

  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes}m`)

  return parts.join(' ')
}

/**
 * Check if a timestamp is within a recent time window
 * @param timestamp - ISO string or Date to check
 * @param windowMs - Time window in milliseconds (default: 24 hours)
 * @returns True if the timestamp is within the window
 *
 * @example
 * isRecent('2026-01-11T20:00:00Z') // true if within 24h of now
 * isRecent('2026-01-11T20:00:00Z', 60 * 60 * 1000) // true if within 1h
 */
export function isRecent(
  timestamp: string | Date,
  windowMs: number = 24 * 60 * 60 * 1000
): boolean {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp

  if (isNaN(date.getTime())) {
    return false
  }

  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  return Math.abs(diffMs) <= windowMs
}
