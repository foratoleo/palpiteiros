/**
 * Supabase Service Mock
 *
 * Mock implementations for Supabase service methods.
 * Use these in tests to avoid real database connections.
 */

import { vi } from 'vitest'

/**
 * Mock Supabase client
 */
export const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => ({
          data: [],
          error: null
        }))
      })),
      data: [],
      error: null
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        data: null,
        error: null
      }))
    })),
    update: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    })),
    delete: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: null,
        error: null
      }))
    }))
  })),
  auth: {
    getSession: vi.fn(async () => ({ data: { session: null }, error: null })),
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
  },
  channel: vi.fn(() => ({
    on: vi.fn(() => ({
      subscribe: vi.fn(() => ({ subscription: { unsubscribe: vi.fn() } }))
    }))
  }))
}

/**
 * Mock Supabase service functions
 */
export const mockSupabaseService = {
  getMarkets: vi.fn(async () => []),
  getMarketById: vi.fn(async () => null),
  upsertMarket: vi.fn(async () => null),
  deleteMarket: vi.fn(async () => null),
  getMarketPrices: vi.fn(async () => []),
  upsertPrice: vi.fn(async () => null),
  getPositions: vi.fn(async () => []),
  getPositionById: vi.fn(async () => null),
  createPosition: vi.fn(async () => null),
  updatePosition: vi.fn(async () => null),
  deletePosition: vi.fn(async () => null),
  getPriceAlerts: vi.fn(async () => []),
  createPriceAlert: vi.fn(async () => null),
  updatePriceAlert: vi.fn(async () => null),
  deletePriceAlert: vi.fn(async () => null),
  getUserPreferences: vi.fn(async () => null),
  updateUserPreferences: vi.fn(async () => null)
}

/**
 * Helper to set mock data for getMarkets
 */
export function mockGetMarketsData(markets: unknown[]) {
  mockSupabaseService.getMarkets.mockResolvedValue(markets)
}

/**
 * Helper to set mock data for getMarketById
 */
export function mockGetMarketByIdData(market: unknown | null) {
  mockSupabaseService.getMarketById.mockResolvedValue(market)
}

/**
 * Helper to reset all mocks
 */
export function resetSupabaseMocks() {
  vi.clearAllMocks()
}
