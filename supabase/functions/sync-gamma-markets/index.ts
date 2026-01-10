// Supabase Edge Function: sync-gamma-markets
// Purpose: Sync market data from Gamma API to Supabase database
// Schedule: Run every 5 minutes via cron or external trigger

import { createClient } from 'jsr:@supabase/supabase-js@2';

// Gamma API base URL
const GAMMA_API_URL = 'https://gamma-api.polymarket.com';

interface GammaMarket {
  conditionId: string;
  question: string;
  description?: string;
  slug: string;
  endDate?: string;
  startDate?: string;
  outcomes: Array<{
    name: string;
    price: number;
  }>;
  volume?: number;
  liquidity?: number;
  active: boolean;
  closed: boolean;
  archived?: boolean;
  tags?: Array<{
    label: string;
    slug: string;
  }>;
  category?: string;
  imageUrl?: string;
  orderBook?: {
    bids: Array<{ price: number; size: number }>;
    asks: Array<{ price: number; size: number }>;
  };
  lastTrade?: {
    price: number;
    timestamp: string;
  };
  tokenPrice?: number;
}

interface MarketInsert {
  condition_id: string;
  question: string;
  description: string | null;
  slug: string;
  end_date: string | null;
  start_date: string | null;
  outcomes: any;
  volume: number | null;
  liquidity: number | null;
  active: boolean;
  closed: boolean;
  archived: boolean | null;
  tags: any;
  category: string | null;
  image_url: string | null;
}

interface MarketPriceInsert {
  market_id?: string;
  condition_id: string;
  price_yes: number | null;
  price_no: number | null;
  volume_24h: number | null;
}

Deno.serve(async (req) => {
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🚀 Starting Gamma API sync...');

    // Step 1: Fetch markets from Gamma API
    console.log('📡 Fetching markets from Gamma API...');
    const gammaResponse = await fetch(`${GAMMA_API_URL}/markets?active=true&limit=100`);

    if (!gammaResponse.ok) {
      throw new Error(`Gamma API request failed: ${gammaResponse.status} ${gammaResponse.statusText}`);
    }

    const markets: GammaMarket[] = await gammaResponse.json();
    console.log(`✅ Fetched ${markets.length} markets from Gamma API`);

    if (markets.length === 0) {
      return new Response(JSON.stringify({ message: 'No markets found', synced: 0 }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Step 2: Transform and upsert markets
    console.log('💾 Upserting markets to database...');
    let upsertedCount = 0;
    let priceInsertedCount = 0;

    for (const market of markets) {
      // Extract Yes/No prices
      const yesOutcome = market.outcomes.find((o) => o.name === 'Yes');
      const noOutcome = market.outcomes.find((o) => o.name === 'No');

      // Prepare market data for insertion
      const marketInsert: MarketInsert = {
        condition_id: market.conditionId,
        question: market.question,
        description: market.description || null,
        slug: market.slug,
        end_date: market.endDate ? new Date(market.endDate).toISOString() : null,
        start_date: market.startDate ? new Date(market.startDate).toISOString() : null,
        outcomes: market.outcomes,
        volume: market.volume || null,
        liquidity: market.liquidity || null,
        active: market.active,
        closed: market.closed,
        archived: market.archived || null,
        tags: market.tags || [],
        category: market.category || null,
        image_url: market.imageUrl || null,
      };

      // Upsert market
      const { data: upsertedMarket, error: upsertError } = await supabase
        .from('markets')
        .upsert(marketInsert, {
          onConflict: 'condition_id',
          ignoreDuplicates: false,
        })
        .select('id')
        .single();

      if (upsertError) {
        console.error(`❌ Error upserting market ${market.conditionId}:`, upsertError);
        continue;
      }

      upsertedCount++;

      // Insert price record
      if (upsertedMarket?.id) {
        const priceInsert: MarketPriceInsert = {
          market_id: upsertedMarket.id,
          condition_id: market.conditionId,
          price_yes: yesOutcome?.price || null,
          price_no: noOutcome?.price || null,
          volume_24h: market.volume || null,
        };

        const { error: priceError } = await supabase
          .from('market_prices')
          .insert(priceInsert);

        if (priceError) {
          console.error(`❌ Error inserting price for ${market.conditionId}:`, priceError);
        } else {
          priceInsertedCount++;
        }
      }
    }

    console.log(`✅ Sync complete: ${upsertedCount} markets upserted, ${priceInsertedCount} price records inserted`);

    // Step 3: Return success response
    return new Response(
      JSON.stringify({
        message: 'Sync completed successfully',
        synced: upsertedCount,
        prices: priceInsertedCount,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Fatal error in sync function:', error);

    return new Response(
      JSON.stringify({
        error: 'Sync failed',
        message: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
