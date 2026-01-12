/**
 * useMarketSearch Hook
 *
 * Custom hook for market search with debouncing, fuzzy matching,
 * and results caching.
 *
 * @features
 * - Debounced search input
 * - Fuzzy string matching
 * - Search in questions, descriptions, and tags
 * - Result caching for performance
 * - Minimum query length threshold
 * - Search history tracking
 *
 * @example
 * ```ts
 * const { results, loading, query, setQuery } = useMarketSearch({
 *   markets,
 *   debounceMs: 300,
 *   minQueryLength: 2
 * })
 * ```
 */

'use client'

import * as React from 'react'
import { useDebounce } from './use-debounce'
import type { Market } from '@/types'

// ============================================================================
// TYPES
// ============================================================================

export interface UseMarketSearchOptions {
  /** Markets to search through */
  markets?: Market[]
  /** Debounce delay in milliseconds */
  debounceMs?: number
  /** Minimum query length before searching */
  minQueryLength?: number
  /** Maximum results to return */
  maxResults?: number
  /** Enable fuzzy matching */
  fuzzy?: boolean
  /** Search fields */
  searchFields?: Array<'question' | 'description' | 'tags' | 'category'>
  /** Enable result caching */
  enableCache?: boolean
  /** Cache TTL in milliseconds */
  cacheTtl?: number
}

export interface MarketSearchResult {
  /** Market data */
  market: Market
  /** Match score (0-1) */
  score: number
  /** Highlighted matching text */
  highlights?: {
    question?: string
    description?: string
  }
}

export interface UseMarketSearchReturn {
  /** Search results */
  results: MarketSearchResult[]
  /** Loading state */
  loading: boolean
  /** Current search query */
  query: string
  /** Debounced query */
  debouncedQuery: string
  /** Set search query */
  setQuery: (query: string) => void
  /** Clear search */
  clearSearch: () => void
  /** Recent searches */
  recentSearches: string[]
  /** Add to recent searches */
  addRecentSearch: (query: string) => void
  /** Clear recent searches */
  clearRecentSearches: () => void
  /** Result count */
  resultCount: number
}

// ============================================================================
// FUZZY MATCHING
// ============================================================================

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length
  const len2 = str2.length
  const matrix: number[][] = []

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i]
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        )
      }
    }
  }

  return matrix[len1][len2]
}

/**
 * Calculate fuzzy match score between query and text
 */
function fuzzyMatchScore(query: string, text: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()

  // Exact match
  if (textLower.includes(queryLower)) {
    return 1
  }

  // Calculate normalized Levenshtein distance
  const distance = levenshteinDistance(queryLower, textLower)
  const maxLen = Math.max(queryLower.length, textLower.length)
  const normalizedDistance = 1 - distance / maxLen

  return Math.max(0, normalizedDistance)
}

/**
 * Highlight matching text
 */
function highlightMatches(text: string, query: string): string {
  if (!query) return text

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}

// ============================================================================
// CACHE
// ============================================================================

interface CacheEntry {
  results: MarketSearchResult[]
  timestamp: number
}

class SearchCache {
  private cache = new Map<string, CacheEntry>()
  private ttl: number

  constructor(ttl: number = 60000) {
    this.ttl = ttl
  }

  get(key: string): MarketSearchResult[] | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.results
  }

  set(key: string, results: MarketSearchResult[]): void {
    this.cache.set(key, {
      results,
      timestamp: Date.now()
    })
  }

  clear(): void {
    this.cache.clear()
  }

  // Clean expired entries
  clean(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useMarketSearch
 *
 * Hook for searching markets with debouncing and fuzzy matching
 */
export function useMarketSearch(
  options: UseMarketSearchOptions = {}
): UseMarketSearchReturn {
  const {
    markets = [],
    debounceMs = 300,
    minQueryLength = 2,
    maxResults = 50,
    fuzzy = true,
    searchFields = ['question', 'description', 'tags'],
    enableCache = true,
    cacheTtl = 60000
  } = options

  // State
  const [query, setQuery] = React.useState('')
  const [results, setResults] = React.useState<MarketSearchResult[]>([])
  const [loading, setLoading] = React.useState(false)
  const [recentSearches, setRecentSearches] = React.useState<string[]>([])

  // Cache instance
  const cacheRef = React.useRef<SearchCache | null>(null)
  React.useEffect(() => {
    if (enableCache) {
      cacheRef.current = new SearchCache(cacheTtl)
    }
    return () => {
      cacheRef.current?.clear()
    }
  }, [enableCache, cacheTtl])

  // Debounced query
  const debouncedQuery = useDebounce(query, debounceMs)

  // Load recent searches from localStorage
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('market-recent-searches')
        if (stored) {
          setRecentSearches(JSON.parse(stored))
        }
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [])

  // Perform search
  React.useEffect(() => {
    // Skip if query is too short
    if (debouncedQuery.length < minQueryLength) {
      setResults([])
      setLoading(false)
      return
    }

    setLoading(true)

    // Check cache
    if (cacheRef.current) {
      const cached = cacheRef.current.get(debouncedQuery)
      if (cached) {
        setResults(cached)
        setLoading(false)
        return
      }
    }

    // Perform search
    const searchResults: MarketSearchResult[] = []
    const queryLower = debouncedQuery.toLowerCase()

    for (const market of markets) {
      let totalScore = 0
      let matchCount = 0

      // Search question
      if (searchFields.includes('question')) {
        const score = fuzzy
          ? fuzzyMatchScore(debouncedQuery, market.question)
          : market.question.toLowerCase().includes(queryLower)
            ? 1
            : 0

        if (score > 0) {
          totalScore += score * 2 // Question matches weighted higher
          matchCount++
        }
      }

      // Search description
      if (searchFields.includes('description') && market.description) {
        const score = fuzzy
          ? fuzzyMatchScore(debouncedQuery, market.description)
          : market.description.toLowerCase().includes(queryLower)
            ? 1
            : 0

        if (score > 0) {
          totalScore += score
          matchCount++
        }
      }

      // Search tags
      if (searchFields.includes('tags') && market.tags?.length > 0) {
        for (const tag of market.tags) {
          const score = fuzzy
            ? fuzzyMatchScore(debouncedQuery, tag.label)
            : tag.label.toLowerCase().includes(queryLower)
              ? 1
              : 0

          if (score > 0) {
            totalScore += score * 0.5 // Tag matches weighted lower
            matchCount++
          }
        }
      }

      // Search category
      if (searchFields.includes('category') && market.category) {
        const score = fuzzy
          ? fuzzyMatchScore(debouncedQuery, market.category)
          : market.category.toLowerCase().includes(queryLower)
            ? 1
            : 0

        if (score > 0) {
          totalScore += score * 0.5
          matchCount++
        }
      }

      // Add to results if there was a match
      if (matchCount > 0) {
        const normalizedScore = totalScore / matchCount

        searchResults.push({
          market,
          score: normalizedScore,
          highlights: {
            question: highlightMatches(market.question, debouncedQuery),
            description: market.description
              ? highlightMatches(market.description, debouncedQuery)
              : undefined
          }
        })
      }
    }

    // Sort by score (descending) and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    // Update cache
    if (cacheRef.current) {
      cacheRef.current.set(debouncedQuery, sortedResults)
    }

    setResults(sortedResults)
    setLoading(false)
  }, [
    debouncedQuery,
    markets,
    minQueryLength,
    maxResults,
    fuzzy,
    searchFields,
    enableCache
  ])

  // Add to recent searches
  const addRecentSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim()
    if (!trimmed) return

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed)
      const updated = [trimmed, ...filtered].slice(0, 10)

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('market-recent-searches', JSON.stringify(updated))
        } catch {
          // Ignore localStorage errors
        }
      }

      return updated
    })
  }

  // Clear search
  const clearSearch = () => {
    setQuery('')
    setResults([])
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('market-recent-searches')
      } catch {
        // Ignore localStorage errors
      }
    }
  }

  return {
    results,
    loading,
    query,
    debouncedQuery,
    setQuery: (value: string) => {
      setQuery(value)
      // Add to recent searches when user commits the search
      if (value.length >= minQueryLength) {
        // Debounced add - only add after typing stops
        const timer = setTimeout(() => {
          addRecentSearch(value)
        }, debounceMs + 500)
        return () => clearTimeout(timer)
      }
    },
    clearSearch,
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
    resultCount: results.length
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * useMarketSearchSimple
 *
 * Simplified version with defaults
 */
export function useMarketSearchSimple(markets?: Market[]) {
  return useMarketSearch({ markets })
}

/**
 * useMarketSearchFuzzy
 *
 * Fuzzy search with higher threshold
 */
export function useMarketSearchFuzzy(markets?: Market[]) {
  return useMarketSearch({
    markets,
    fuzzy: true,
    minQueryLength: 1,
    maxResults: 20
  })
}
