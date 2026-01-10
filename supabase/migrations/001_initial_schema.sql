-- markets table
CREATE TABLE markets (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  condition_id text unique not null,
  slug text unique not null,
  description text,
  end_date timestamptz,
  start_date timestamptz,
  outcomes jsonb,
  volume numeric,
  liquidity numeric,
  active boolean default true,
  closed boolean default false,
  archived boolean default false,
  tags jsonb,
  category text,
  image_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- market_prices table
CREATE TABLE market_prices (
  id uuid primary key default gen_random_uuid(),
  market_id uuid references markets(id) on delete cascade,
  price_yes numeric,
  price_no numeric,
  volume_24h numeric,
  timestamp timestamptz default now()
);

-- user_portfolios table
CREATE TABLE user_portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  market_id uuid references markets(id) on delete cascade,
  outcome text not null,
  size numeric not null,
  average_price numeric not null,
  current_price numeric,
  pnl numeric,
  pnl_percentage numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, market_id)
);

-- price_alerts table
CREATE TABLE price_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  market_id uuid references markets(id) on delete cascade,
  condition text not null check (condition in ('above', 'below')),
  target_price numeric not null check (target_price >= 0 and target_price <= 1),
  triggered boolean default false,
  triggered_at timestamptz,
  created_at timestamptz default now()
);

-- user_preferences table
CREATE TABLE user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  theme text default 'dark' check (theme in ('light', 'dark')),
  currency text default 'USD',
  notifications_enabled boolean default true,
  particle_effects boolean default true,
  data_refresh_interval int default 60000,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
CREATE INDEX idx_markets_active ON markets(active) WHERE active = true;
CREATE INDEX idx_markets_end_date ON markets(end_date desc);
CREATE INDEX idx_markets_category ON markets(category);
CREATE INDEX idx_market_prices_market_timestamp ON market_prices(market_id, timestamp desc);
CREATE INDEX idx_user_portfolios_user ON user_portfolios(user_id);
CREATE INDEX idx_price_alerts_user ON price_alerts(user_id, triggered) WHERE triggered = false;
