/**
 * Gamma API Mock
 *
 * Mock implementations for Gamma API service methods.
 * Use these in tests to avoid real API calls to Polymarket.
 */

import { vi } from 'vitest'
import type { GammaMarket } from '@/types/gamma.types'

/**
 * Mock Gamma market data
 */
export const mockGammaMarket: GammaMarket = {
  conditionId: '0x1234567890abcdef',
  slug: 'will-bitcoin-exceed-100k',
  question: 'Will Bitcoin exceed $100,000 by end of 2024?',
  description: 'This market resolves to Yes if BTC exceeds $100k',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  active: true,
  closed: false,
  archived: false,
  imageUrl: 'https://example.com/image.png',
  outcomes: [
    { name: 'Yes', price: 0.65, ticker: 'YES' },
    { name: 'No', price: 0.35, ticker: 'NO' }
  ],
  tags: [
    { id: 1, label: 'Crypto', slug: 'crypto', name: 'Crypto' },
    { id: 2, label: 'Bitcoin', slug: 'bitcoin', name: 'Bitcoin' }
  ],
  volume: 1000000,
  liquidity: 500000,
  orders: [],
  price: '0.65'
}

/**
 * Mock Gamma service
 */
export const mockGammaService = {
  fetchMarkets: vi.fn(async () => [mockGammaMarket]),
  getMarketBySlug: vi.fn(async () => mockGammaMarket),
  getMarketsByConditionIds: vi.fn(async () => [mockGammaMarket]),
  getMarketsByTag: vi.fn(async () => [mockGammaMarket]),
  getActiveMarkets: vi.fn(async () => [mockGammaMarket]),
  getClosingSoonMarkets: vi.fn(async () => [mockGammaMarket]),
  getPopularMarkets: vi.fn(async () => [mockGammaMarket]),
  fetchEvents: vi.fn(async () => []),
  getTagStatistics: vi.fn(async () => ({
    marketCount: 1,
    totalVolume: 1000000,
    totalLiquidity: 500000,
    averageVolume: 1000000,
    averageLiquidity: 500000
  })),
  clearCache: vi.fn()
}

/**
 * Helper to set mock data for fetchMarkets
 */
export function mockFetchMarketsData(markets: GammaMarket[]) {
  mockGammaService.fetchMarkets.mockResolvedValue(markets)
}

/**
 * Helper to set mock error for fetchMarkets
 */
export function mockFetchMarketsError(error: Error) {
  mockGammaService.fetchMarkets.mockRejectedValue(error)
}

/**
 * Helper to reset all mocks
 */
export function resetGammaMocks() {
  vi.clearAllMocks()
}
