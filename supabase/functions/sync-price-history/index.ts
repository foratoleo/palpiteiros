// Supabase Edge Function: sync-price-history
// Purpose: Sync price history data from Gamma API to market_price_history table
//
// Features:
// - Fetches markets from Supabase or Gamma API
// - Inserts price history records with deduplication
// - Returns detailed sync statistics
// - Rate limiting for API calls

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// CONFIGURATION
// ============================================================================

const GAMMA_API_URL = 'https://gamma-api.polymarket.com';
const DEFAULT_BATCH_SIZE = 100;
const MAX_REQUESTS_PER_MINUTE = 100;
const API_TIMEOUT_MS = 30000; // 30 seconds

// ============================================================================
// TYPES
// ============================================================================

interface GammaMarket {
  conditionId: string;
  question: string;
  description?: string;
  outcomes: Array<{ name: string; price: number }>;
  volume?: number;
  liquidity?: number;
  orderBook?: {
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
  };
  lastTrade?: {
    price: number;
    timestamp: string;
  };
  slug?: string;
  endDate?: string;
  startDate?: string;
  active?: boolean;
  closed?: boolean;
}

interface MarketRow {
  id: string;
  condition_id: string;
  question: string;
  slug?: string;
  end_date?: string;
  active: boolean;
  closed: boolean;
}

interface PriceHistoryInsert {
  market_id?: string;
  condition_id: string;
  price_yes: number;
  price_no: number;
  volume: number | null;
  liquidity: number | null;
  timestamp: string;
}

interface SyncOptions {
  marketId?: string;
  conditionId?: string;
  batchSize?: number;
  fetchFromGamma?: boolean;
}

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  skipped: number;
  total_markets: number;
  message: string;
  timestamp: string;
  duration_ms?: number;
}

interface SyncStatistics {
  totalMarkets: number;
  synced: number;
  failed: number;
  skipped: number;
  errors: Array<{ conditionId: string; error: string }>;
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
// RATE LIMITER
// ============================================================================

class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private windowMs: number;

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }

  async acquire(): Promise<boolean> {
    const now = Date.now();

    // Remove requests outside the current window
    this.requests = this.requests.filter((time) => now - time < this.windowMs);

    if (this.requests.length >= this.maxRequests) {
      const waitTime = this.requests[0] + this.windowMs - now;
      console.log(`Rate limit reached, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      return this.acquire();
    }

    this.requests.push(now);
    return true;
  }

  reset(): void {
    this.requests = [];
  }
}

// ============================================================================
// GAMMA API CLIENT
// ============================================================================

/**
 * Fetch markets from Gamma API
 * @param conditionId - Optional condition ID to fetch a single market
 * @returns Array of markets from Gamma API
 */
async function fetchMarketsFromGamma(conditionId?: string): Promise<GammaMarket[]> {
  const url = conditionId
    ? `${GAMMA_API_URL}/markets?active=true&condition_ids=${conditionId}`
    : `${GAMMA_API_URL}/markets?active=true&limit=1000`;

  console.log(`Fetching from Gamma API: ${url}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Gamma API request failed: ${response.status} ${response.statusText}`);
    }

    const markets: GammaMarket[] = await response.json();
    console.log(`Fetched ${markets.length} markets from Gamma API`);
    return markets;

  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Gamma API request timeout after ${API_TIMEOUT_MS}ms`);
    }
    throw error;
  }
}

/**
 * Fetch markets from Supabase database
 * @param supabase - Supabase client
 * @param marketId - Optional market ID to fetch a single market
 * @returns Array of markets from database
 */
async function fetchMarketsFromSupabase(
  supabase: ReturnType<typeof createClient>,
  marketId?: string
): Promise<MarketRow[]> {
  let query = supabase
    .from('markets')
    .select('id, condition_id, question, slug, end_date, active, closed');

  if (marketId) {
    query = query.eq('id', marketId);
  } else {
    query = query.eq('active', true).eq('closed', false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Database query failed: ${error.message}`);
  }

  console.log(`Fetched ${data?.length || 0} markets from Supabase`);
  return data || [];
}

/**
 * Merge Gamma markets with database markets
 * @param gammaMarkets - Markets from Gamma API
 * @param dbMarkets - Markets from database
 * @returns Map of condition_id to { gammaMarket, dbMarket }
 */
function mergeMarkets(
  gammaMarkets: GammaMarket[],
  dbMarkets: MarketRow[]
): Map<string, { gammaMarket: GammaMarket; dbMarket?: MarketRow }> {
  const dbMarketMap = new Map(dbMarkets.map(m => [m.condition_id, m]));
  const merged = new Map<string, { gammaMarket: GammaMarket; dbMarket?: MarketRow }>();

  // Add all Gamma markets
  for (const gammaMarket of gammaMarkets) {
    merged.set(gammaMarket.conditionId, {
      gammaMarket,
      dbMarket: dbMarketMap.get(gammaMarket.conditionId),
    });
  }

  return merged;
}

// ============================================================================
// PRICE HISTORY SYNC
// ============================================================================

/**
 * Prepare price history records from Gamma markets
 * @param marketsData - Merged market data
 * @returns Array of price history records to insert
 */
function preparePriceHistoryRecords(
  marketsData: Map<string, { gammaMarket: GammaMarket; dbMarket?: MarketRow }>
): PriceHistoryInsert[] {
  const records: PriceHistoryInsert[] = [];
  const timestamp = new Date().toISOString();

  for (const { gammaMarket, dbMarket } of marketsData.values()) {
    const yesOutcome = gammaMarket.outcomes.find((o) => o.name === 'Yes');
    const noOutcome = gammaMarket.outcomes.find((o) => o.name === 'No');

    if (!yesOutcome) {
      console.warn(`Skipping market ${gammaMarket.conditionId}: missing Yes outcome`);
      continue;
    }

    const noPrice = noOutcome?.price ?? (1 - yesOutcome.price);

    records.push({
      market_id: dbMarket?.id,
      condition_id: gammaMarket.conditionId,
      price_yes: yesOutcome.price,
      price_no: noPrice,
      volume: gammaMarket.volume ?? null,
      liquidity: gammaMarket.liquidity ?? null,
      timestamp,
    });
  }

  return records;
}

/**
 * Insert price history records in batches
 * @param supabase - Supabase client
 * @param records - Records to insert
 * @param batchSize - Batch size for inserts
 * @returns Sync statistics
 */
async function insertPriceHistoryRecords(
  supabase: ReturnType<typeof createClient>,
  records: PriceHistoryInsert[],
  batchSize: number
): Promise<SyncStatistics> {
  const stats: SyncStatistics = {
    totalMarkets: records.length,
    synced: 0,
    failed: 0,
    skipped: 0,
    errors: [],
  };

  console.log(`Inserting ${records.length} price history records in batches of ${batchSize}`);

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(records.length / batchSize)}`);

    // Try batch insert first
    const { error: insertError } = await supabase
      .from('market_price_history')
      .insert(batch);

    if (insertError) {
      console.log(`Batch insert failed: ${insertError.message}`);

      // Try inserting one by one if batch fails
      for (const record of batch) {
        const { error: singleError } = await supabase
          .from('market_price_history')
          .insert(record);

        if (singleError) {
          // Check if it's a unique constraint violation (duplicate entry)
          if (singleError.message.includes('unique') || singleError.code === '23505') {
            stats.skipped++;
            console.log(`Skipped duplicate record for ${record.condition_id}`);
          } else {
            stats.failed++;
            stats.errors.push({
              conditionId: record.condition_id,
              error: singleError.message,
            });
            console.error(`Error inserting record for ${record.condition_id}:`, singleError);
          }
        } else {
          stats.synced++;
        }
      }
    } else {
      stats.synced += batch.length;
    }
  }

  return stats;
}

// ============================================================================
// VALIDATION
// ============================================================================

function validateSyncOptions(options: SyncOptions): { valid: boolean; error?: string } {
  if (options.batchSize !== undefined) {
    if (!Number.isInteger(options.batchSize) || options.batchSize < 1 || options.batchSize > 500) {
      return { valid: false, error: 'batchSize must be between 1 and 500' };
    }
  }

  if (options.marketId && options.conditionId) {
    return { valid: false, error: 'Cannot specify both marketId and conditionId' };
  }

  return { valid: true };
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST and GET
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
      }),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse request options
    let options: SyncOptions = {};

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        options = body as SyncOptions;
      } catch {
        // Invalid JSON, continue with empty options
      }
    } else {
      // Parse query params for GET requests
      const url = new URL(req.url);
      const marketId = url.searchParams.get('market_id');
      const conditionId = url.searchParams.get('condition_id');
      const batchSize = url.searchParams.get('batch_size');
      const fetchFromGamma = url.searchParams.get('fetch_from_gamma');

      if (marketId) options.marketId = marketId;
      if (conditionId) options.conditionId = conditionId;
      if (batchSize) options.batchSize = parseInt(batchSize, 10);
      if (fetchFromGamma) options.fetchFromGamma = fetchFromGamma === 'true';
    }

    // Validate options
    const validation = validateSyncOptions(options);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: validation.error,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log('Starting price history sync...', options);

    // Initialize rate limiter
    const rateLimiter = new RateLimiter(MAX_REQUESTS_PER_MINUTE, 60 * 1000);
    const batchSize = options.batchSize || DEFAULT_BATCH_SIZE;

    // Fetch markets from database
    const dbMarkets = await fetchMarketsFromSupabase(supabase, options.marketId);

    if (dbMarkets.length === 0 && !options.conditionId) {
      console.log('No active markets found in database');
      return new Response(
        JSON.stringify({
          success: true,
          synced: 0,
          failed: 0,
          skipped: 0,
          total_markets: 0,
          message: 'No active markets found in database',
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        } as SyncResult),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Determine which condition IDs to fetch from Gamma API
    let conditionIds: string[];

    if (options.conditionId) {
      conditionIds = [options.conditionId];
    } else {
      // Use condition IDs from database markets
      conditionIds = dbMarkets.map(m => m.condition_id);
    }

    console.log(`Fetching ${conditionIds.length} markets from Gamma API`);

    // Fetch markets from Gamma API (rate limited)
    await rateLimiter.acquire();

    // Build condition_ids query parameter
    const gammaMarkets: GammaMarket[] = [];
    const conditionIdChunks: string[][] = [];

    // Gamma API has limits on URL length, so chunk the condition IDs
    const CHUNK_SIZE = 50;
    for (let i = 0; i < conditionIds.length; i += CHUNK_SIZE) {
      conditionIdChunks.push(conditionIds.slice(i, i + CHUNK_SIZE));
    }

    for (const chunk of conditionIdChunks) {
      await rateLimiter.acquire();
      const conditionIdsParam = chunk.join(',');
      const response = await fetch(
        `${GAMMA_API_URL}/markets?active=true&condition_ids=${conditionIdsParam}`
      );

      if (!response.ok) {
        console.error(`Gamma API request failed for chunk: ${response.status}`);
        continue;
      }

      const chunkMarkets: GammaMarket[] = await response.json();
      gammaMarkets.push(...chunkMarkets);
    }

    console.log(`Fetched ${gammaMarkets.length} markets from Gamma API`);

    if (gammaMarkets.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          synced: 0,
          failed: 0,
          skipped: 0,
          total_markets: 0,
          message: 'No markets found in Gamma API',
          timestamp: new Date().toISOString(),
          duration_ms: Date.now() - startTime,
        } as SyncResult),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Merge markets and prepare records
    const mergedMarkets = mergeMarkets(gammaMarkets, dbMarkets);
    const records = preparePriceHistoryRecords(mergedMarkets);

    console.log(`Prepared ${records.length} price history records`);

    // Insert records
    const stats = await insertPriceHistoryRecords(supabase, records, batchSize);

    const durationMs = Date.now() - startTime;
    console.log(`Sync complete in ${durationMs}ms: ${stats.synced} synced, ${stats.failed} failed, ${stats.skipped} skipped`);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        synced: stats.synced,
        failed: stats.failed,
        skipped: stats.skipped,
        total_markets: stats.totalMarkets,
        message: `Synced ${stats.synced} price records successfully${stats.failed > 0 ? `, ${stats.failed} failed` : ''}${stats.skipped > 0 ? `, ${stats.skipped} skipped (duplicates)` : ''}`,
        timestamp: new Date().toISOString(),
        duration_ms: durationMs,
      } as SyncResult),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Fatal error in sync-price-history:', error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
