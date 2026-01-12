-- ============================================================================
-- Breaking Markets Feature Migration
-- ============================================================================
-- This migration adds support for tracking and ranking markets by price movement
-- and volume changes over time, enabling a "Breaking" page similar to Polymarket.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- market_price_history table
-- ----------------------------------------------------------------------------
-- Stores historical price and volume data for markets, enabling 24h movement
-- calculations and volatility analysis.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS market_price_history (
  id uuid primary key default gen_random_uuid(),
  market_id uuid not null references markets(id) on delete cascade,
  price_yes numeric not null check (price_yes >= 0 and price_yes <= 1),
  price_no numeric not null check (price_no >= 0 and price_no <= 1),
  volume numeric not null check (volume >= 0),
  timestamp timestamptz not null default now()
);

-- Indexes for efficient 24h queries
CREATE INDEX idx_market_price_history_market_timestamp
ON market_price_history(market_id, timestamp desc);

CREATE INDEX idx_market_price_history_timestamp
ON market_price_history(timestamp desc);

-- Unique index with 1-minute granularity to prevent duplicate entries
-- This ensures we don't insert multiple price points for the same minute
CREATE UNIQUE INDEX idx_market_price_history_market_minute
ON market_price_history(market_id, date_trunc('minute', timestamp));

-- ----------------------------------------------------------------------------
-- RLS Policies for market_price_history
-- ----------------------------------------------------------------------------
ALTER TABLE market_price_history ENABLE ROW LEVEL SECURITY;

-- Authenticated users can read price history
CREATE POLICY "Authenticated users can view market price history"
ON market_price_history FOR SELECT
TO authenticated
USING (true);

-- Service role can insert price history (for automated sync jobs)
CREATE POLICY "Service role can insert market price history"
ON market_price_history FOR INSERT
TO service_role
WITH CHECK (true);

-- Service role can update price history
CREATE POLICY "Service role can update market price history"
ON market_price_history FOR UPDATE
TO service_role
USING (true);

-- Service role can delete price history
CREATE POLICY "Service role can delete market price history"
ON market_price_history FOR DELETE
TO service_role
USING (true);

-- ----------------------------------------------------------------------------
-- calculate_market_movement function
-- ----------------------------------------------------------------------------
-- Calculates price and volume movement statistics for a market over a specified
-- time window. Returns comprehensive metrics including volatility, high/low
-- prices, and percentage changes.
--
-- Parameters:
--   p_market_id: UUID of the market to analyze
--   p_hours: Time window in hours (default: 24)
--
-- Returns:
--   - price_change_percent: Percentage change from oldest to current price
--   - volume_change_percent: Percentage change in volume
--   - price_high_24h: Highest price in the time window
--   - price_low_24h: Lowest price in the time window
--   - volatility_index: Standard deviation of prices (volatility measure)
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION calculate_market_movement(
  p_market_id uuid,
  p_hours int DEFAULT 24
)
RETURNS TABLE (
  price_change_percent numeric,
  volume_change_percent numeric,
  price_high_24h numeric,
  price_low_24h numeric,
  volatility_index numeric
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_data_points int;
BEGIN
  -- Count data points in the time window
  SELECT count(*)
  INTO v_data_points
  FROM market_price_history
  WHERE market_id = p_market_id
    AND timestamp >= now() - (p_hours || ' hours')::interval;

  -- Return nulls if we have fewer than 2 data points
  IF v_data_points < 2 THEN
    RETURN QUERY SELECT
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric,
      null::numeric;
    RETURN;
  END IF;

  RETURN QUERY
  WITH price_window AS (
    SELECT
      price_yes,
      volume,
      timestamp
    FROM market_price_history
    WHERE market_id = p_market_id
      AND timestamp >= now() - (p_hours || ' hours')::interval
    ORDER BY timestamp DESC
  ),
  price_stats AS (
    SELECT
      -- Current price (most recent)
      FIRST_VALUE(price_yes) OVER (ORDER BY timestamp DESC) as current_price,
      -- Oldest price in window
      FIRST_VALUE(price_yes) OVER (ORDER BY timestamp ASC) as oldest_price,
      -- Volume stats
      FIRST_VALUE(volume) OVER (ORDER BY timestamp DESC) as current_volume,
      FIRST_VALUE(volume) OVER (ORDER BY timestamp ASC) as oldest_volume,
      -- High/low prices
      MAX(price_yes) OVER () as price_high,
      MIN(price_yes) OVER () as price_low,
      -- All prices for volatility calculation
      price_yes
    FROM price_window
    LIMIT 1
  )
  SELECT
    -- Price change percentage
    CASE
      WHEN oldest_price > 0 THEN
        ROUND(((current_price - oldest_price) / NULLIF(oldest_price, 0)) * 100, 2)
      ELSE null
    END as price_change_percent,
    -- Volume change percentage
    CASE
      WHEN oldest_volume > 0 THEN
        ROUND(((current_volume - oldest_volume) / NULLIF(oldest_volume, 0)) * 100, 2)
      ELSE null
    END as volume_change_percent,
    -- High/low prices
    price_high as price_high_24h,
    price_low as price_low_24h,
    -- Volatility index (standard deviation of all prices)
    ROUND(stddev_samp(price_yes) OVER (), 4) as volatility_index
  FROM price_stats;
END;
$$;

-- ----------------------------------------------------------------------------
-- get_breaking_markets function
-- ----------------------------------------------------------------------------
-- Returns markets ranked by significant price movements and volume changes.
-- Uses a composite scoring system that weights price changes (60%) and volume
-- changes (40%) to identify the most "breaking" markets.
--
-- Parameters:
--   p_limit: Maximum number of markets to return (default: 50)
--   p_min_price_change: Minimum price change percentage (default: 5%)
--   p_min_volume: Minimum volume threshold (default: 1000)
--
-- Returns:
--   Ranked list of markets with movement metrics and composite scores
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_breaking_markets(
  p_limit int DEFAULT 50,
  p_min_price_change numeric DEFAULT 5.0,
  p_min_volume numeric DEFAULT 1000
)
RETURNS TABLE (
  market_id uuid,
  question text,
  category text,
  price_yes numeric,
  price_change_percent numeric,
  volume_change_percent numeric,
  volume numeric,
  price_high_24h numeric,
  price_low_24h numeric,
  volatility_index numeric,
  composite_score numeric
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH market_movements AS (
    -- Calculate movement metrics for all markets
    SELECT
      m.id as market_id,
      m.question,
      m.category,
      -- Current price from latest history entry
      (SELECT price_yes
       FROM market_price_history
       WHERE market_id = m.id
       ORDER BY timestamp DESC
       LIMIT 1) as price_yes,
      -- Movement calculations
      (SELECT * FROM calculate_market_movement(m.id, 24)) as movement
    FROM markets m
    WHERE m.active = true
      AND m.closed = false
      AND EXISTS (
        -- Only include markets with price history data
        SELECT 1
        FROM market_price_history
        WHERE market_id = m.id
      )
  )
  SELECT
    market_id,
    question,
    category,
    price_yes,
    -- Movement metrics
    (movement).price_change_percent,
    (movement).volume_change_percent,
    -- Current volume
    (SELECT volume
     FROM market_price_history
     WHERE market_id = mm.market_id
     ORDER BY timestamp DESC
     LIMIT 1) as volume,
    (movement).price_high_24h,
    (movement).price_low_24h,
    (movement).volatility_index,
    -- Composite score: 60% price change weight, 40% volume change weight
    COALESCE(
      ABS((movement).price_change_percent) * 0.6 +
      COALESCE(ABS((movement).volume_change_percent), 0) * 0.4,
      0
    ) as composite_score
  FROM market_movements mm
  WHERE (
    -- Filter by minimum price change OR high volatility
    ABS((movement).price_change_percent) >= p_min_price_change
    OR (movement).volatility_index > 0.05
  )
  AND COALESCE(
    (SELECT volume
     FROM market_price_history
     WHERE market_id = mm.market_id
     ORDER BY timestamp DESC
     LIMIT 1), 0
  ) >= p_min_volume
  ORDER BY composite_score DESC, (movement).volatility_index DESC
  LIMIT p_limit;
END;
$$;

-- ----------------------------------------------------------------------------
-- update_market_movement_cache trigger
-- ----------------------------------------------------------------------------
-- Automatically updates a denormalized cache table for fast access to breaking
-- markets. This trigger fires on INSERT to market_price_history.
-- ----------------------------------------------------------------------------

-- Cache table for storing pre-calculated movement metrics
CREATE TABLE IF NOT EXISTS market_movement_cache (
  market_id uuid primary key references markets(id) on delete cascade,
  price_change_24h numeric,
  volume_change_24h numeric,
  price_high_24h numeric,
  price_low_24h numeric,
  volatility_index_24h numeric,
  composite_score numeric,
  last_updated timestamptz not null default now()
);

-- Index for breaking page queries
CREATE INDEX idx_market_movement_cache_composite_score
ON market_movement_cache(composite_score DESC, last_updated DESC)
WHERE composite_score IS NOT NULL;

-- Trigger function to update the cache
CREATE OR REPLACE FUNCTION update_market_movement_cache()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO market_movement_cache (
    market_id,
    price_change_24h,
    volume_change_24h,
    price_high_24h,
    price_low_24h,
    volatility_index_24h,
    composite_score,
    last_updated
  )
  SELECT
    NEW.market_id,
    movement.price_change_percent,
    movement.volume_change_percent,
    movement.price_high_24h,
    movement.price_low_24h,
    movement.volatility_index,
    -- Composite score: 60% price change, 40% volume change
    COALESCE(
      ABS(movement.price_change_percent) * 0.6 +
      COALESCE(ABS(movement.volume_change_percent), 0) * 0.4,
      0
    ),
    now()
  FROM calculate_market_movement(NEW.market_id, 24) as movement
  ON CONFLICT (market_id) DO UPDATE SET
    price_change_24h = EXCLUDED.price_change_24h,
    volume_change_24h = EXCLUDED.volume_change_24h,
    price_high_24h = EXCLUDED.price_high_24h,
    price_low_24h = EXCLUDED.price_low_24h,
    volatility_index_24h = EXCLUDED.volatility_index_24h,
    composite_score = EXCLUDED.composite_score,
    last_updated = EXCLUDED.last_updated;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on market_price_history
CREATE TRIGGER trigger_update_market_movement_cache
AFTER INSERT ON market_price_history
FOR EACH ROW
EXECUTE FUNCTION update_market_movement_cache();

-- ----------------------------------------------------------------------------
-- RLS Policies for market_movement_cache
-- ----------------------------------------------------------------------------
ALTER TABLE market_movement_cache ENABLE ROW LEVEL SECURITY;

-- Public read access (breaking page is public)
CREATE POLICY "Everyone can view market movement cache"
ON market_movement_cache FOR SELECT
TO anon, authenticated
USING (true);

-- Service role can manage cache
CREATE POLICY "Service role can manage market movement cache"
ON market_movement_cache FOR ALL
TO service_role
USING (true);

-- ----------------------------------------------------------------------------
-- Helper function: sync_market_price_to_history
-- ----------------------------------------------------------------------------
-- Utility function to sync current market prices from market_prices table to
-- market_price_history. Useful for initial data migration and periodic syncs.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION sync_market_price_to_history(p_market_id uuid DEFAULT null)
RETURNS int AS $$
DECLARE
  v_synced_count int;
BEGIN
  INSERT INTO market_price_history (market_id, price_yes, price_no, volume, timestamp)
  SELECT
    mp.market_id,
    mp.price_yes,
    mp.price_no,
    mp.volume_24h,
    mp.timestamp
  FROM market_prices mp
  WHERE (p_market_id IS NULL OR mp.market_id = p_market_id)
    AND NOT EXISTS (
      -- Avoid duplicates: check if price point already exists for this minute
      SELECT 1
      FROM market_price_history mph
      WHERE mph.market_id = mp.market_id
        AND date_trunc('minute', mph.timestamp) = date_trunc('minute', mp.timestamp)
    )
  ON CONFLICT (market_id, date_trunc('minute', timestamp)) DO NOTHING;

  GET DIAGNOSTICS v_synced_count = ROW_COUNT;
  RETURN v_synced_count;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION sync_market_price_to_history(uuid) TO service_role;

-- ============================================================================
-- Migration complete
-- ============================================================================
-- Next steps:
-- 1. Run this migration in Supabase: psql -f supabase/migrations/004_add_breaking_markets.sql
-- 2. Regenerate TypeScript types: supabase gen types typescript --project-id ID > src/types/database.types.ts
-- 3. Create a sync job to periodically populate market_price_history from market_prices
-- ============================================================================
