/**
 * Use Order Book Data Hook
 *
 * Custom React Query hook for fetching and managing order book data.
 * Provides real-time order book updates with throttling and optimistic updates.
 *
 * @feature TanStack Query v5 integration
 * @feature Real-time Supabase subscriptions
 * @feature Throttled updates (max 10 per second)
 * @feature Optimistic updates for user orders
 * @feature Gamma API integration
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { gammaService } from '@/services/gamma.service'
import type { OrderBook, LastTrade } from '@/types/gamma.types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'

// ============================================================================
// TYPES
// ============================================================================

/**
 * Order Book Level
 *
 * Aggregated price level with cumulative totals
 */
export interface OrderBookLevel {
  /** Price level (0-1) */
  price: number
  /** Size available at this price */
  size: number
  /** Cumulative size from best price */
  total: number
  /** Percentage of total depth */
  totalPercent: number
  /** Whether this is user's own order */
  isOwnOrder?: boolean
}

/**
 * Order Book Data
 *
 * Complete order book with both sides
 */
export interface OrderBookData {
  /** Buy orders (YES/bids) - sorted descending */
  bids: OrderBookLevel[]
  /** Sell orders (NO/asks) - sorted ascending */
  asks: OrderBookLevel[]
  /** Best bid price */
  bestBid?: number
  /** Best ask price */
  bestAsk?: number
  /** Spread (bestAsk - bestBid) */
  spread?: number
  /** Spread as percentage */
  spreadPercent?: number
  /** Total bid volume */
  totalBidVolume: number
  /** Total ask volume */
  totalAskVolume: number
  /** Implied probability from order book */
  impliedProbability: number
}

/**
 * Order Book Trade
 *
 * Individual trade from the order book
 */
export interface OrderBookTrade {
  /** Trade price */
  price: number
  /** Trade size */
  size: number
  /** Trade timestamp */
  timestamp: string
  /** Trade side (buy/sell) */
  side?: 'buy' | 'sell'
}

/**
 * Use Order Book Data Parameters
 */
export interface UseOrderBookDataParams {
  /** Market ID or slug */
  marketId: string
  /** Whether to enable the query */
  enabled?: boolean
  /** Refetch interval in milliseconds */
  refetchInterval?: number
  /** Maximum updates per second (default: 10) */
  maxUpdatesPerSecond?: number
  /** Enable real-time subscriptions */
  enableRealtime?: boolean
  /** Number of price levels to return (default: 50) */
  depth?: number
}

/**
 * Use Order Book Data Return Type
 */
export interface UseOrderBookDataReturn {
  /** Processed order book data */
  orderBook: OrderBookData | undefined
  /** Last trade information */
  lastTrade: LastTrade | undefined
  /** Recent trades */
  recentTrades: OrderBookTrade[]
  /** Loading state */
  isLoading: boolean
  /** Error state */
  error: Error | null
  /** Whether currently refetching */
  isRefetching: boolean
  /** Manual refetch function */
  refetch: () => void
  /** Invalidate and refetch */
  invalidate: () => Promise<void>
  /** Whether real-time subscription is active */
  isSubscribed: boolean
  /** Add optimistic order */
  addOptimisticOrder: (side: 'bid' | 'ask', price: number, size: number) => void
  /** Remove optimistic order */
  removeOptimisticOrder: (side: 'bid' | 'ask', price: number) => void
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Process raw order book data into aggregated levels
 *
 * @param rawOrderBook - Raw order book from API
 * @param depth - Maximum number of levels
 * @returns Processed order book data
 */
function processOrderBook(rawOrderBook: OrderBook, depth: number = 50): OrderBookData {
  // Process bids (YES orders) - sort descending by price
  const bids = rawOrderBook.bids
    .sort((a, b) => b.price - a.price)
    .slice(0, depth)
    .map((level) => ({ ...level, isOwnOrder: false }))

  // Process asks (NO orders) - sort ascending by price
  const asks = rawOrderBook.asks
    .sort((a, b) => a.price - b.price)
    .slice(0, depth)
    .map((level) => ({ ...level, isOwnOrder: false }))

  // Calculate cumulative totals for bids
  let bidTotal = 0
  const maxBidVolume = bids.reduce((sum, b) => sum + b.size, 0)
  const processedBids: OrderBookLevel[] = bids.map((bid) => {
    bidTotal += bid.size
    return {
      price: bid.price,
      size: bid.size,
      total: bidTotal,
      totalPercent: maxBidVolume > 0 ? (bidTotal / maxBidVolume) * 100 : 0,
      isOwnOrder: bid.isOwnOrder
    }
  })

  // Calculate cumulative totals for asks
  let askTotal = 0
  const maxAskVolume = asks.reduce((sum, a) => sum + a.size, 0)
  const processedAsks: OrderBookLevel[] = asks.map((ask) => {
    askTotal += ask.size
    return {
      price: ask.price,
      size: ask.size,
      total: askTotal,
      totalPercent: maxAskVolume > 0 ? (askTotal / maxAskVolume) * 100 : 0,
      isOwnOrder: ask.isOwnOrder
    }
  })

  // Calculate best bid/ask and spread
  const bestBid = processedBids[0]?.price
  const bestAsk = processedAsks[0]?.price
  const spread = bestBid !== undefined && bestAsk !== undefined ? bestAsk - bestBid : undefined
  const spreadPercent = spread !== undefined && bestBid !== undefined ? (spread / bestBid) * 100 : undefined

  // Calculate total volumes
  const totalBidVolume = maxBidVolume
  const totalAskVolume = maxAskVolume

  // Calculate implied probability (mid price)
  const impliedProbability = bestBid !== undefined && bestAsk !== undefined
    ? (bestBid + bestAsk) / 2
    : bestBid ?? bestAsk ?? 0.5

  return {
    bids: processedBids,
    asks: processedAsks,
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
    totalBidVolume,
    totalAskVolume,
    impliedProbability
  }
}

/**
 * Generate mock order book data for fallback
 *
 * @param basePrice - Base price around which to generate orders
 * @param depth - Number of levels
 * @returns Mock order book data
 */
function generateMockOrderBook(basePrice: number = 0.5, depth: number = 20): OrderBookData {
  const bids: OrderBookLevel[] = []
  const asks: OrderBookLevel[] = []

  // Generate bids below base price
  let bidTotal = 0
  for (let i = 0; i < depth; i++) {
    const price = basePrice - (i + 1) * 0.01
    const size = Math.max(100, Math.random() * 10000)
    bidTotal += size
    bids.push({
      price: Math.max(0.01, price),
      size: Math.round(size),
      total: Math.round(bidTotal),
      totalPercent: ((i + 1) / depth) * 100
    })
  }

  // Generate asks above base price
  let askTotal = 0
  for (let i = 0; i < depth; i++) {
    const price = basePrice + (i + 1) * 0.01
    const size = Math.max(100, Math.random() * 10000)
    askTotal += size
    asks.push({
      price: Math.min(0.99, price),
      size: Math.round(size),
      total: Math.round(askTotal),
      totalPercent: ((i + 1) / depth) * 100
    })
  }

  const bestBid = bids[0]?.price
  const bestAsk = asks[0]?.price
  const spread = bestBid !== undefined && bestAsk !== undefined ? bestAsk - bestBid : 0
  const spreadPercent = spread > 0 ? (spread / bestBid) * 100 : 0

  return {
    bids,
    asks,
    bestBid,
    bestAsk,
    spread,
    spreadPercent,
    totalBidVolume: bidTotal,
    totalAskVolume: askTotal,
    impliedProbability: basePrice
  }
}

// ============================================================================
// MAIN HOOK
// ============================================================================

/**
 * Use Order Book Data Hook
 *
 * Fetches order book data with real-time updates.
 * Throttles updates to prevent performance issues with high-frequency data.
 *
 * @param params - Hook parameters
 * @returns Order book data and state
 *
 * @example
 * ```tsx
 * function OrderBookView({ marketId }: { marketId: string }) {
 *   const { orderBook, lastTrade, isLoading, addOptimisticOrder } = useOrderBookData({
 *     marketId,
 *     enableRealtime: true,
 *     maxUpdatesPerSecond: 10,
 *     depth: 50
 *   })
 *
 *   if (isLoading) return <OrderBookSkeleton />
 *
 *   return (
 *     <OrderBookVisual
 *       bids={orderBook.bids}
 *       asks={orderBook.asks}
 *       spread={orderBook.spread}
 *       onPlaceOrder={addOptimisticOrder}
 *     />
 *   )
 * }
 * ```
 */
export function useOrderBookData(params: UseOrderBookDataParams): UseOrderBookDataReturn {
  const {
    marketId,
    enabled = true,
    refetchInterval,
    maxUpdatesPerSecond = 10,
    enableRealtime = false,
    depth = 50
  } = params

  const queryClient = useQueryClient()
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [recentTrades, setRecentTrades] = useState<OrderBookTrade[]>([])
  const subscriptionRef = useRef<RealtimeChannel | null>(null)

  // Throttle ref using requestAnimationFrame
  const lastUpdateRef = useRef<number>(0)
  const minUpdateInterval = 1000 / maxUpdatesPerSecond

  /**
   * Throttled update function
   */
  const throttledUpdate = useCallback((
    callback: () => void,
    force: boolean = false
  ) => {
    const now = Date.now()
    const timeSinceLastUpdate = now - lastUpdateRef.current

    if (force || timeSinceLastUpdate >= minUpdateInterval) {
      lastUpdateRef.current = now
      callback()
    } else {
      // Schedule for next available slot
      const delay = minUpdateInterval - timeSinceLastUpdate
      setTimeout(() => {
        lastUpdateRef.current = Date.now()
        callback()
      }, delay)
    }
  }, [minUpdateInterval])

  // Main order book query
  const query = useQuery({
    queryKey: ['orderBook', marketId, depth],
    queryFn: async () => {
      try {
        // Try Gamma API first for real-time order book
        const gammaMarket = await gammaService.getMarketBySlug(marketId)

        if (gammaMarket?.orderBook) {
          return {
            orderBook: processOrderBook(gammaMarket.orderBook, depth),
            lastTrade: gammaMarket.lastTrade,
            source: 'gamma' as const
          }
        }
      } catch (error) {
        console.warn('Gamma API order book fetch failed, using mock data:', error)
      }

      // Fallback to mock data
      return {
        orderBook: generateMockOrderBook(0.5, depth),
        lastTrade: undefined,
        source: 'mock' as const
      }
    },
    staleTime: 1000, // Order books go stale quickly (1 second)
    gcTime: 5000, // Keep cached for 5 seconds
    enabled,
    refetchInterval
  })

  // Real-time subscription for order book updates
  useEffect(() => {
    if (!enableRealtime || !enabled) {
      return
    }

    // Subscribe to order book updates from Supabase
    const channel = supabase
      .channel(`order-book-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_trades',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => {
          const trade = payload.new as {
            price: number
            size: number
            side: 'buy' | 'sell'
            timestamp: string
          }

          // Add to recent trades
          setRecentTrades((prev) => [
            {
              price: trade.price,
              size: trade.size,
              timestamp: trade.timestamp,
              side: trade.side
            },
            ...prev.slice(0, 49) // Keep last 50 trades
          ])

          // Throttled cache update
          throttledUpdate(() => {
            queryClient.setQueryData(
              ['orderBook', marketId, depth],
              (old: unknown) => {
                if (!old || typeof old !== 'object') return old

                const oldData = old as { orderBook: OrderBookData; lastTrade?: LastTrade }

                return {
                  ...oldData,
                  lastTrade: {
                    price: trade.price,
                    timestamp: trade.timestamp
                  }
                }
              }
            )
          })
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    subscriptionRef.current = channel

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        setIsSubscribed(false)
      }
    }
  }, [enableRealtime, enabled, marketId, depth, queryClient, throttledUpdate])

  /**
   * Add optimistic order to order book
   */
  const addOptimisticOrder = useCallback((
    side: 'bid' | 'ask',
    price: number,
    size: number
  ) => {
    queryClient.setQueryData(
      ['orderBook', marketId, depth],
      (old: unknown) => {
        if (!old || typeof old !== 'object') return old

        const oldData = old as { orderBook: OrderBookData; lastTrade?: LastTrade }
        const orderBook = { ...oldData.orderBook }

        if (side === 'bid') {
          const newLevel: OrderBookLevel = {
            price,
            size,
            total: orderBook.totalBidVolume + size,
            totalPercent: 100,
            isOwnOrder: true
          }
          orderBook.bids = [...orderBook.bids, newLevel]
            .sort((a, b) => b.price - a.price)
            .slice(0, depth)
          orderBook.totalBidVolume += size

          // Recalculate best bid
          orderBook.bestBid = orderBook.bids[0]?.price
        } else {
          const newLevel: OrderBookLevel = {
            price,
            size,
            total: orderBook.totalAskVolume + size,
            totalPercent: 100,
            isOwnOrder: true
          }
          orderBook.asks = [...orderBook.asks, newLevel]
            .sort((a, b) => a.price - b.price)
            .slice(0, depth)
          orderBook.totalAskVolume += size

          // Recalculate best ask
          orderBook.bestAsk = orderBook.asks[0]?.price
        }

        // Recalculate spread
        if (orderBook.bestBid !== undefined && orderBook.bestAsk !== undefined) {
          orderBook.spread = orderBook.bestAsk - orderBook.bestBid
          orderBook.spreadPercent = (orderBook.spread / orderBook.bestBid) * 100
        }

        return {
          ...oldData,
          orderBook
        }
      }
    )
  }, [marketId, depth, queryClient])

  /**
   * Remove optimistic order from order book
   */
  const removeOptimisticOrder = useCallback((
    side: 'bid' | 'ask',
    price: number
  ) => {
    queryClient.setQueryData(
      ['orderBook', marketId, depth],
      (old: unknown) => {
        if (!old || typeof old !== 'object') return old

        const oldData = old as { orderBook: OrderBookData; lastTrade?: LastTrade }
        const orderBook = { ...oldData.orderBook }

        if (side === 'bid') {
          const levelIndex = orderBook.bids.findIndex((b) => b.price === price && b.isOwnOrder)
          if (levelIndex !== -1) {
            const removedSize = orderBook.bids[levelIndex].size
            orderBook.bids = orderBook.bids.filter((_, i) => i !== levelIndex)
            orderBook.totalBidVolume -= removedSize

            // Recalculate best bid
            orderBook.bestBid = orderBook.bids[0]?.price
          }
        } else {
          const levelIndex = orderBook.asks.findIndex((a) => a.price === price && a.isOwnOrder)
          if (levelIndex !== -1) {
            const removedSize = orderBook.asks[levelIndex].size
            orderBook.asks = orderBook.asks.filter((_, i) => i !== levelIndex)
            orderBook.totalAskVolume -= removedSize

            // Recalculate best ask
            orderBook.bestAsk = orderBook.asks[0]?.price
          }
        }

        // Recalculate spread
        if (orderBook.bestBid !== undefined && orderBook.bestAsk !== undefined) {
          orderBook.spread = orderBook.bestAsk - orderBook.bestBid
          orderBook.spreadPercent = (orderBook.spread / orderBook.bestBid) * 100
        }

        return {
          ...oldData,
          orderBook
        }
      }
    )
  }, [marketId, depth, queryClient])

  return {
    orderBook: query.data?.orderBook,
    lastTrade: query.data?.lastTrade,
    recentTrades,
    isLoading: query.isLoading,
    error: query.error || null,
    isRefetching: query.isRefetching,
    refetch: query.refetch,
    invalidate: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['orderBook', marketId, depth]
      })
    },
    isSubscribed,
    addOptimisticOrder,
    removeOptimisticOrder
  }
}

// ============================================================================
// ORDER BOOK SUBSCRIPTION HOOK
// ============================================================================

/**
 * Use Order Book Subscription Hook
 *
 * Simplified hook for just subscribing to order book updates
 * without the full data fetching logic.
 *
 * @param marketId - Market ID to subscribe to
 * @param callback - Callback function on update
 * @param enabled - Whether subscription is active
 * @returns Subscription status and cleanup function
 *
 * @example
 * ```tsx
 * function useOrderBookUpdates(marketId: string) {
 *   const { isSubscribed, unsubscribe } = useOrderBookSubscription(
 *     marketId,
 *     (update) => {
 *       console.log('Order book updated:', update)
 *     }
 *   )
 *
 *   useEffect(() => {
 *     return () => unsubscribe()
 *   }, [unsubscribe])
 * }
 * ```
 */
export function useOrderBookSubscription(
  marketId: string,
  callback: (update: { price: number; size: number; side: 'bid' | 'ask' }) => void,
  enabled: boolean = true
): {
  isSubscribed: boolean
  unsubscribe: () => void
} {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!enabled) {
      return
    }

    const channel = supabase
      .channel(`order-book-sub-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_orders',
          filter: `market_id=eq.${marketId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const order = payload.new as { price: number; size: number; side: 'buy' | 'sell' }
            callback({
              price: order.price,
              size: order.size,
              side: order.side === 'buy' ? 'bid' : 'ask'
            })
          }
        }
      )
      .subscribe((status) => {
        setIsSubscribed(status === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
        setIsSubscribed(false)
      }
    }
  }, [marketId, callback, enabled])

  const unsubscribe = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      setIsSubscribed(false)
    }
  }, [])

  return {
    isSubscribed,
    unsubscribe
  }
}

// Export types for external use
export type { LastTrade }
