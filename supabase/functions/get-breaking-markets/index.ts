// Supabase Edge Function: get-breaking-markets
// Purpose: Returns markets with significant price movements and activity
// Caching: 30-second TTL via Edge Functions cache
//
// Calculates comprehensive breaking market metrics including:
// - price_change_percent: Price change from oldest to current price
// - volume_change_percent: Volume change over the time period
// - price_high_24h: Highest price in the time window
// - price_low_24h: Lowest price in the time window
// - volatility_index: Standard deviation of prices (volatility measure)
// - price_history_24h: Array of price data points (up to 24)
// - movement_score: Composite score (price change 50% + volume change 30% + volatility 20%)
// - trend: Direction ('up', 'down', 'neutral')

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_TTL_SECONDS = 30;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;
const DEFAULT_MIN_PRICE_CHANGE = 0.05; // 5%
const DEFAULT_TIME_RANGE_HOURS = 24;
const PRICE_HISTORY_MAX_POINTS = 24; // One data point per hour for 24h

// ============================================================================
// TYPES
// ============================================================================

interface BreakingMarketsQuery {
  limit?: number;
  min_price_change?: number;
  time_range_hours?: number;
  market_id?: string;
}

interface MarketRow {
  id: string;
  condition_id: string;
  question: string;
  description: string | null;
  slug: string;
  end_date: string | null;
  start_date: string | null;
  outcomes: unknown;
  volume: number | null;
  liquidity: number | null;
  active: boolean;
  closed: boolean;
  archived: boolean | null;
  tags: unknown;
  category: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

interface PriceHistoryRow {
  id: string;
  market_id: string;
  condition_id: string;
  price_yes: number;
  price_no: number;
  volume: number | null;
  liquidity: number | null;
  timestamp: string;
}

interface PriceStatistics {
  priceChangePercent: number;
  volumeChangePercent: number;
  priceHigh: number;
  priceLow: number;
  volatilityIndex: number;
  movementScore: number;
  trend: 'up' | 'down' | 'neutral';
}

interface BreakingMarketRow extends MarketRow {
  price_yes: number;
  price_no: number;
  price_change_percent: number;
  volume_change_percent: number;
  price_high_24h: number;
  price_low_24h: number;
  volatility_index: number;
  movement_score: number;
  trend: 'up' | 'down' | 'neutral';
  price_history_24h: PriceHistoryPoint[];
}

interface PriceHistoryPoint {
  timestamp: string;
  price_yes: number;
  price_no: number;
  volume: number | null;
}

interface BreakingMarketsResponse {
  success: boolean;
  data: BreakingMarketRow[];
  count: number;
  timestamp: string;
  cached: boolean;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
  timestamp: string;
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate movement score from price data
 * @param priceChange - 24h price change (-1 to 1)
 * @param volumeChange - 24h volume change (-1 to 1)
 * @param volatility - Volatility index (0 to 1)
 * @returns Movement score (0 to 1)
 *
 * Formula: 50% price change + 30% volume change + 20% volatility
 */
function calculateMovementScore(
  priceChange: number,
  volumeChange: number,
  volatility: number
): number {
  return (
    Math.abs(priceChange) * 0.5 +
    Math.abs(volumeChange) * 0.3 +
    volatility * 0.2
  );
}

/**
 * Determine trend direction from price change
 * @param priceChange - 24h price change (-1 to 1)
 * @returns Trend direction ('up', 'down', 'neutral')
 */
function getTrendDirection(priceChange: number): 'up' | 'down' | 'neutral' {
  const threshold = 0.01; // 1% threshold
  if (priceChange > threshold) return 'up';
  if (priceChange < -threshold) return 'down';
  return 'neutral';
}

/**
 * Calculate price statistics from price history
 * @param priceHistory - Array of price history points ordered by timestamp desc
 * @returns Price statistics including change, high/low, volatility, and movement score
 */
function calculatePriceStatistics(priceHistory: PriceHistoryRow[]): PriceStatistics | null {
  if (!priceHistory || priceHistory.length < 2) {
    console.log('Not enough price history data points for statistics calculation');
    return null;
  }

  // Get current (most recent) and oldest prices
  const currentPrice = priceHistory[0].price_yes;
  const oldestPrice = priceHistory[priceHistory.length - 1].price_yes;

  // Calculate price change percent
  const priceChangePercent = oldestPrice > 0
    ? (currentPrice - oldestPrice) / oldestPrice
    : 0;

  // Calculate volume change percent
  const currentVolume = priceHistory[0].volume ?? 0;
  const oldestVolume = priceHistory[priceHistory.length - 1].volume ?? 0;
  const volumeChangePercent = oldestVolume > 0
    ? (currentVolume - oldestVolume) / oldestVolume
    : 0;

  // Calculate high and low prices
  const prices = priceHistory.map(p => p.price_yes);
  const priceHigh = Math.max(...prices);
  const priceLow = Math.min(...prices);

  // Calculate volatility (standard deviation)
  const mean = prices.reduce((sum, price) => sum + price, 0) / prices.length;
  const variance = prices.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / prices.length;
  const volatilityIndex = Math.sqrt(variance);

  // Calculate movement score
  const movementScore = calculateMovementScore(
    priceChangePercent,
    volumeChangePercent,
    volatilityIndex
  );

  // Determine trend
  const trend = getTrendDirection(priceChangePercent);

  return {
    priceChangePercent,
    volumeChangePercent,
    priceHigh,
    priceLow,
    volatilityIndex,
    movementScore,
    trend
  };
}

/**
 * Sample price history to get at most N points evenly distributed
 * @param priceHistory - Full price history
 * @param maxPoints - Maximum number of points to return
 * @returns Sampled price history points
 */
function samplePriceHistory(
  priceHistory: PriceHistoryRow[],
  maxPoints: number
): PriceHistoryPoint[] {
  if (priceHistory.length <= maxPoints) {
    // Return all points if under the limit
    return priceHistory.map(p => ({
      timestamp: p.timestamp,
      price_yes: p.price_yes,
      price_no: p.price_no,
      volume: p.volume
    }));
  }

  // Sample evenly distributed points
  const step = (priceHistory.length - 1) / (maxPoints - 1);
  const sampled: PriceHistoryPoint[] = [];

  for (let i = 0; i < maxPoints; i++) {
    const index = Math.min(Math.round(i * step), priceHistory.length - 1);
    const point = priceHistory[index];
    sampled.push({
      timestamp: point.timestamp,
      price_yes: point.price_yes,
      price_no: point.price_no,
      volume: point.volume
    });
  }

  return sampled;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateQuery(query: BreakingMarketsQuery): { valid: boolean; error?: string } {
  if (query.limit !== undefined) {
    if (!Number.isInteger(query.limit) || query.limit < 1) {
      return { valid: false, error: 'Limit must be a positive integer' };
    }
    if (query.limit > MAX_LIMIT) {
      return { valid: false, error: `Limit cannot exceed ${MAX_LIMIT}` };
    }
  }

  if (query.min_price_change !== undefined) {
    if (typeof query.min_price_change !== 'number' || query.min_price_change < 0 || query.min_price_change > 1) {
      return { valid: false, error: 'min_price_change must be between 0 and 1' };
    }
  }

  if (query.time_range_hours !== undefined) {
    if (!Number.isInteger(query.time_range_hours) || query.time_range_hours < 1 || query.time_range_hours > 168) {
      return { valid: false, error: 'time_range_hours must be between 1 and 168 (7 days)' };
    }
  }

  return { valid: true };
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST and GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed', timestamp: new Date().toISOString() } as ErrorResponse),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse request parameters
    let query: BreakingMarketsQuery = {};

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        query = body as BreakingMarketsQuery;
      } catch {
        // Invalid JSON, use defaults
      }
    } else {
      // Parse query params for GET requests
      const url = new URL(req.url);
      const limit = url.searchParams.get('limit');
      const minPriceChange = url.searchParams.get('min_price_change');
      const timeRange = url.searchParams.get('time_range_hours');
      const marketId = url.searchParams.get('market_id');

      if (limit) query.limit = parseInt(limit, 10);
      if (minPriceChange) query.min_price_change = parseFloat(minPriceChange);
      if (timeRange) query.time_range_hours = parseInt(timeRange, 10);
      if (marketId) query.market_id = marketId;
    }

    // Validate query parameters
    const validation = validateQuery(query);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error, timestamp: new Date().toISOString() } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Set defaults
    const limit = query.limit || DEFAULT_LIMIT;
    const minPriceChange = query.min_price_change ?? DEFAULT_MIN_PRICE_CHANGE;
    const timeRangeHours = query.time_range_hours || DEFAULT_TIME_RANGE_HOURS;

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log(`Fetching breaking markets: limit=${limit}, min_change=${minPriceChange}, hours=${timeRangeHours}`);

    // Fetch markets (single market or all active markets)
    let markets: MarketRow[] = [];
    let marketsError: unknown = null;

    if (query.market_id) {
      // Fetch single market by ID
      const result = await supabase
        .from('markets')
        .select('*')
        .eq('id', query.market_id)
        .single();

      marketsError = result.error;
      markets = result.data ? [result.data] : [];
    } else {
      // Fetch all active markets
      const result = await supabase
        .from('markets')
        .select('*')
        .eq('active', true)
        .eq('closed', false)
        .limit(limit * 2); // Fetch more to account for filtering

      marketsError = result.error;
      markets = result.data || [];
    }

    if (marketsError) {
      console.error('Error fetching markets:', marketsError);
      throw new Error(`Failed to fetch markets: ${(marketsError as { message: string }).message}`);
    }

    if (!markets || markets.length === 0) {
      console.log('No markets found');
      const response: BreakingMarketsResponse = {
        success: true,
        data: [],
        count: 0,
        timestamp: new Date().toISOString(),
        cached: false,
      };
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch price history for all markets
    const marketIds = markets.map(m => m.id);
    const timeRangeCutoff = new Date(Date.now() - timeRangeHours * 60 * 60 * 1000).toISOString();

    console.log(`Fetching price history for ${marketIds.length} markets since ${timeRangeCutoff}`);

    const { data: priceHistory, error: priceError } = await supabase
      .from('market_price_history')
      .select('*')
      .in('market_id', marketIds)
      .gte('timestamp', timeRangeCutoff)
      .order('timestamp', { ascending: true });

    if (priceError) {
      console.error('Error fetching price history:', priceError);
      throw new Error(`Failed to fetch price history: ${priceError.message}`);
    }

    console.log(`Fetched ${priceHistory?.length || 0} price history records`);

    // Group price history by market
    const priceHistoryByMarket = new Map<string, PriceHistoryRow[]>();
    if (priceHistory) {
      for (const price of priceHistory) {
        const marketId = price.market_id;
        if (!priceHistoryByMarket.has(marketId)) {
          priceHistoryByMarket.set(marketId, []);
        }
        priceHistoryByMarket.get(marketId)!.push(price as PriceHistoryRow);
      }
    }

    // Calculate breaking market data for each market
    const breakingMarkets: BreakingMarketRow[] = [];

    for (const market of markets) {
      const marketPriceHistory = priceHistoryByMarket.get(market.id) || [];

      // Skip markets without price history
      if (marketPriceHistory.length < 2) {
        console.log(`Skipping market ${market.id}: insufficient price history (${marketPriceHistory.length} points)`);
        continue;
      }

      // Calculate price statistics
      const stats = calculatePriceStatistics(marketPriceHistory);

      if (!stats) {
        console.log(`Skipping market ${market.id}: could not calculate statistics`);
        continue;
      }

      // Filter by minimum price change if specified
      if (query.market_id === undefined && Math.abs(stats.priceChangePercent) < minPriceChange) {
        continue;
      }

      // Sample price history for response (max 24 points)
      const sampledHistory = samplePriceHistory(
        marketPriceHistory,
        PRICE_HISTORY_MAX_POINTS
      );

      // Create breaking market record
      breakingMarkets.push({
        ...market,
        price_yes: marketPriceHistory[marketPriceHistory.length - 1].price_yes,
        price_no: marketPriceHistory[marketPriceHistory.length - 1].price_no,
        price_change_percent: stats.priceChangePercent,
        volume_change_percent: stats.volumeChangePercent,
        price_high_24h: stats.priceHigh,
        price_low_24h: stats.priceLow,
        volatility_index: stats.volatilityIndex,
        movement_score: stats.movementScore,
        trend: stats.trend,
        price_history_24h: sampledHistory,
      });
    }

    // Sort by movement score (highest first)
    breakingMarkets.sort((a, b) => b.movement_score - a.movement_score);

    // Apply limit after sorting
    const limitedMarkets = breakingMarkets.slice(0, limit);

    console.log(`Returning ${limitedMarkets.length} breaking markets`);

    // Prepare response
    const response: BreakingMarketsResponse = {
      success: true,
      data: limitedMarkets,
      count: limitedMarkets.length,
      timestamp: new Date().toISOString(),
      cached: false, // Edge Functions cache is handled via headers
    };

    // Return response with cache headers
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Cache-Control': `public, s-maxage=${CACHE_TTL_SECONDS}, max-age=${CACHE_TTL_SECONDS}`,
        'CDN-Cache-Control': `public, s-maxage=${CACHE_TTL_SECONDS}, max-age=${CACHE_TTL_SECONDS}`,
        'Vary': 'Accept-Encoding',
      },
    });

  } catch (error) {
    console.error('Fatal error in get-breaking-markets:', error);

    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
