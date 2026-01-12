/**
 * Supabase Service
 *
 * Typed service for Supabase database operations.
 * Provides type-safe CRUD operations and real-time subscriptions.
 *
 * @see https://supabase.com/docs/reference/javascript
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import type { Market } from '@/types/market.types'
import type {
  Database,
  Tables,
  TablesInsert,
  TablesUpdate,
  MarketPrice,
  UserPortfolio,
  PriceAlert,
  UserPreferences
} from '@/types/database.types'

// ============================================================================
// CLIENT CREATION
// ============================================================================

/**
 * Create a browser Supabase client with proper TypeScript types
 *
 * @returns Typed Supabase client
 * @throws Error if environment variables are not configured
 *
 * @example
 * ```ts
 * const supabase = createBrowserClient()
 * const { data } = await supabase.from('markets').select('*')
 * ```
 */
export function createBrowserClient(): SupabaseClient<Database> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      'Missing Supabase environment variables. Please check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.'
    )
  }

  return createClient<Database>(url, key)
}

/**
 * Create a server-side Supabase client with service role privileges
 *
 * @param url Supabase URL (optional, uses env var by default)
 * @param key Service role key (optional, uses env var by default)
 * @returns Typed Supabase client with elevated privileges
 *
 * @example
 * ```ts
 * // In API routes or server components
 * const supabase = createServiceClient()
 * const { data } = await supabase.from('users').select('*')
 * ```
 */
export function createServiceClient(
  url?: string,
  key?: string
): SupabaseClient<Database> {
  const serviceUrl = url || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = key || process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!serviceUrl || !serviceKey) {
    throw new Error(
      'Missing Supabase service role credentials. Please check SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return createClient<Database>(serviceUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// ============================================================================
// MARKET OPERATIONS
// ============================================================================

/**
 * Market Filter Options
 *
 * Filters for querying markets from the database
 */
export interface MarketFilters {
  /** Filter for active markets only */
  active?: boolean
  /** Filter by category slug */
  category?: string
  /** Filter by tag slug */
  tag?: string
  /** Maximum number of results */
  limit?: number
  /** Number of results to skip */
  offset?: number
  /** Sort by field */
  orderBy?: 'end_date' | 'volume' | 'liquidity' | 'created_at'
  /** Sort direction */
  ascending?: boolean
  /** Search in question text */
  search?: string
}

/**
 * Get markets from the database with optional filters
 *
 * @param filters - Optional filters for the query
 * @returns Array of markets
 * @throws Error if query fails
 *
 * @example
 * ```ts
 * // Get active crypto markets
 * const markets = await getMarkets({
 *   active: true,
 *   category: 'crypto',
 *   limit: 20
 * })
 * ```
 */
export async function getMarkets(filters?: MarketFilters): Promise<Market[]> {
  const supabase = createBrowserClient()

  let query = supabase
    .from('markets')
    .select('*')

  // Apply filters
  if (filters?.active !== undefined) {
    query = query.eq('active', filters.active)
  }

  if (filters?.category) {
    query = query.eq('category', filters.category)
  }

  if (filters?.tag) {
    // Filter by tag in the tags array
    query = query.contains('tags', [{ slug: filters.tag }] as any)
  }

  if (filters?.search) {
    // Search in question text
    query = query.ilike('question', `%${filters.search}%`)
  }

  // Apply ordering
  if (filters?.orderBy) {
    query = query.order(filters.orderBy, { ascending: filters.ascending ?? false })
  }

  // Apply pagination
  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  if (filters?.offset) {
    query = query.range(filters.offset, (filters.offset + (filters.limit || 10)) - 1)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch markets: ${error.message}`)
  }

  return data || []
}

/**
 * Get a single market by its slug
 *
 * @param slug - Market slug
 * @returns Market or null if not found
 * @throws Error if query fails
 *
 * @example
 * ```ts
 * const market = await getMarketBySlug('btc-price-above-100k')
 * ```
 */
export async function getMarketBySlug(slug: string): Promise<Market | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null
    }
    throw new Error(`Failed to fetch market: ${error.message}`)
  }

  return data
}

/**
 * Get a market by its condition ID
 *
 * @param conditionId - Polymarket condition ID
 * @returns Market or null if not found
 * @throws Error if query fails
 */
export async function getMarketByConditionId(conditionId: string): Promise<Market | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('markets')
    .select('*')
    .eq('condition_id', conditionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch market: ${error.message}`)
  }

  return data
}

/**
 * Insert or update a market (upsert)
 *
 * @param market - Market data to insert or update
 * @returns Updated market
 * @throws Error if operation fails
 */
export async function upsertMarket(market: TablesInsert['markets']): Promise<Market> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('markets') as any)
    .upsert(market)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to upsert market: ${error.message}`)
  }

  return data
}

// ============================================================================
// MARKET PRICE OPERATIONS
// ============================================================================

/**
 * Get price history for a market
 *
 * @param marketId - Market ID or condition ID
 * @param limit - Maximum number of price points (default: 100)
 * @returns Array of price history points
 * @throws Error if query fails
 *
 * @example
 * ```ts
 * const prices = await getMarketPrices('market-123', 50)
 * ```
 */
export async function getMarketPrices(
  marketId: string,
  limit: number = 100
): Promise<MarketPrice[]> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('market_prices')
    .select('*')
    .eq('market_id', marketId)
    .order('timestamp', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`Failed to fetch market prices: ${error.message}`)
  }

  return data || []
}

/**
 * Insert a new price data point
 *
 * @param price - Price data to insert
 * @returns Inserted price record
 * @throws Error if operation fails
 */
export async function insertMarketPrice(price: TablesInsert['market_prices']): Promise<MarketPrice> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('market_prices') as any)
    .insert(price)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to insert market price: ${error.message}`)
  }

  return data
}

// ============================================================================
// REAL-TIME SUBSCRIPTIONS
// ============================================================================

/**
 * Subscribe to price updates for a market
 *
 * @param marketId - Market ID to monitor
 * @param callback - Function called when price updates
 * @returns Subscription object (call .unsubscribe() to clean up)
 *
 * @example
 * ```ts
 * const subscription = subscribeToMarketPrices('market-123', (price) => {
 *   console.log('New price:', price.price_yes)
 * })
 *
 * // Later: cleanup
 * subscription.unsubscribe()
 * ```
 */
export function subscribeToMarketPrices(
  marketId: string,
  callback: (price: MarketPrice) => void
) {
  const supabase = createBrowserClient()

  return supabase
    .channel(`market-prices-${marketId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'market_prices',
        filter: `market_id=eq.${marketId}`
      },
      (payload) => callback(payload.new as MarketPrice)
    )
    .subscribe()
}

/**
 * Subscribe to market updates
 *
 * @param callback - Function called when market data changes
 * @returns Subscription object
 */
export function subscribeToMarkets(
  callback: (market: Tables['markets']) => void
) {
  const supabase = createBrowserClient()

  return supabase
    .channel('markets-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'markets'
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new as Tables['markets'])
        }
      }
    )
    .subscribe()
}

// ============================================================================
// USER PORTFOLIO OPERATIONS
// ============================================================================

/**
 * Get user's portfolio positions
 *
 * @param userId - User ID
 * @param filters - Optional filters
 * @returns Array of user positions
 * @throws Error if query fails
 */
export async function getUserPositions(
  userId: string,
  filters?: {
    marketId?: string
    outcome?: string
  }
): Promise<UserPortfolio[]> {
  const supabase = createBrowserClient()

  let query = supabase
    .from('user_portfolios')
    .select('*, markets(*)')
    .eq('user_id', userId)

  if (filters?.marketId) {
    query = query.eq('market_id', filters.marketId)
  }

  if (filters?.outcome) {
    query = query.eq('outcome', filters.outcome)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user positions: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new position
 *
 * @param position - Position data to insert
 * @returns Created position
 * @throws Error if operation fails
 */
export async function createPosition(position: TablesInsert['user_portfolios']): Promise<UserPortfolio> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('user_portfolios') as any)
    .insert(position)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create position: ${error.message}`)
  }

  return data
}

/**
 * Update an existing position
 *
 * @param positionId - Position ID
 * @param updates - Fields to update
 * @returns Updated position
 * @throws Error if operation fails
 */
export async function updatePosition(
  positionId: string,
  updates: TablesUpdate['user_portfolios']
): Promise<UserPortfolio> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('user_portfolios') as any)
    .update(updates)
    .eq('id', positionId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update position: ${error.message}`)
  }

  return data
}

// ============================================================================
// PRICE ALERT OPERATIONS
// ============================================================================

/**
 * Get user's price alerts
 *
 * @param userId - User ID
 * @param filters - Optional filters
 * @returns Array of price alerts
 * @throws Error if query fails
 */
export async function getUserAlerts(
  userId: string,
  filters?: {
    marketId?: string
    triggered?: boolean
  }
): Promise<PriceAlert[]> {
  const supabase = createBrowserClient()

  let query = supabase
    .from('price_alerts')
    .select('*, markets(*)')
    .eq('user_id', userId)

  if (filters?.marketId) {
    query = query.eq('market_id', filters.marketId)
  }

  if (filters?.triggered !== undefined) {
    query = query.eq('triggered', filters.triggered)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to fetch user alerts: ${error.message}`)
  }

  return data || []
}

/**
 * Create a new price alert
 *
 * @param alert - Alert data to insert
 * @returns Created alert
 * @throws Error if operation fails
 */
export async function createAlert(alert: TablesInsert['price_alerts']): Promise<PriceAlert> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('price_alerts') as any)
    .insert(alert)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create alert: ${error.message}`)
  }

  return data
}

/**
 * Update an existing alert
 *
 * @param alertId - Alert ID
 * @param updates - Fields to update
 * @returns Updated alert
 * @throws Error if operation fails
 */
export async function updateAlert(
  alertId: string,
  updates: TablesUpdate['price_alerts']
): Promise<PriceAlert> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('price_alerts') as any)
    .update(updates)
    .eq('id', alertId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update alert: ${error.message}`)
  }

  return data
}

/**
 * Delete an alert
 *
 * @param alertId - Alert ID
 * @throws Error if operation fails
 */
export async function deleteAlert(alertId: string): Promise<void> {
  const supabase = createBrowserClient()

  const { error } = await supabase
    .from('price_alerts')
    .delete()
    .eq('id', alertId)

  if (error) {
    throw new Error(`Failed to delete alert: ${error.message}`)
  }
}

// ============================================================================
// USER PREFERENCES OPERATIONS
// ============================================================================

/**
 * Get user preferences
 *
 * @param userId - User ID
 * @returns User preferences or null if not found
 * @throws Error if query fails
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = createBrowserClient()

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(`Failed to fetch user preferences: ${error.message}`)
  }

  return data
}

/**
 * Update user preferences
 *
 * @param userId - User ID
 * @param updates - Fields to update
 * @returns Updated preferences
 * @throws Error if operation fails
 */
export async function updateUserPreferences(
  userId: string,
  updates: TablesUpdate['user_preferences']
): Promise<UserPreferences> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('user_preferences') as any)
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to update user preferences: ${error.message}`)
  }

  return data
}

/**
 * Initialize user preferences with defaults
 *
 * @param userId - User ID
 * @returns Created preferences
 * @throws Error if operation fails
 */
export async function initializeUserPreferences(userId: string): Promise<UserPreferences> {
  const supabase = createBrowserClient()

  const { data, error } = await (supabase
    .from('user_preferences') as any)
    .insert({
      user_id: userId,
      theme: 'dark',
      currency: 'USD',
      notifications_enabled: true,
      particle_effects: true,
      data_refresh_interval: 60000
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to initialize user preferences: ${error.message}`)
  }

  return data
}
