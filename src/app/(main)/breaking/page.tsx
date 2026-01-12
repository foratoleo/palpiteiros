/**
 * Breaking Markets Page
 *
 * Server Component for the breaking markets page.
 * Displays markets with significant price movements in the last 24 hours.
 *
 * @features
 * - Server-side data fetching for initial load
 * - SEO metadata with Open Graph and Twitter cards
 * - Client Component wrapper for interactivity
 * - Real-time updates support
 *
 * @route /breaking
 */

import { Metadata } from 'next'
import { BreakingPageClient } from '@/components/breaking/breaking-page-client'
import { breakingService } from '@/services/breaking.service'
import type { BreakingMarket } from '@/types/breaking.types'

/**
 * Generate SEO metadata for the breaking markets page
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Breaking Markets - Palpiteiros',
    description: 'See the prediction markets that moved the most in the last 24 hours. Real-time updates on the most dynamic markets with significant price movements.',
    keywords: ['breaking markets', 'prediction markets', 'polymarket', 'trading', 'price movement', 'volatility'],
    openGraph: {
      title: 'Breaking Markets - Palpiteiros',
      description: 'Real-time breaking markets - See the prediction markets that moved the most in the last 24 hours.',
      type: 'website',
      locale: 'en_US',
      url: 'https://palpiteiros.com/breaking',
      siteName: 'Palpiteiros',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Breaking Markets - Palpiteiros',
      description: 'Real-time breaking markets - See the prediction markets that moved the most.',
    },
    alternates: {
      canonical: '/breaking',
    },
  }
}

/**
 * Breaking Page Server Component
 *
 * Fetches initial breaking markets data on the server
 * and passes it to the client component for interactivity.
 *
 * @returns Breaking page with initial data
 */
export default async function BreakingPage() {
  // Fetch initial breaking markets data on server
  // This provides fast initial load and SEO content
  let initialMarkets: BreakingMarket[] = []
  let initialCount = 0

  try {
    const markets = await breakingService.getBreakingMarkets(
      {
        minPriceChange: 0.05,
        timeRange: '24h',
      },
      20 // Initial page size
    )
    initialMarkets = markets
    initialCount = markets.length
  } catch {
    // Silently fail - client component will handle error state
    initialMarkets = []
    initialCount = 0
  }

  return (
    <div className="min-h-screen bg-background">
      <BreakingPageClient
        initialMarkets={initialMarkets}
        initialCount={initialCount}
      />
    </div>
  )
}
