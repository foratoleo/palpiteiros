-- Enable RLS
ALTER TABLE markets ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for markets
CREATE POLICY "Markets are viewable by everyone"
ON markets FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies for market_prices
CREATE POLICY "Market prices are viewable by everyone"
ON market_prices FOR SELECT TO anon, authenticated USING (true);

-- RLS Policies for user_portfolios
CREATE POLICY "Users can view their own portfolio"
ON user_portfolios FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio"
ON user_portfolios FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
ON user_portfolios FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio"
ON user_portfolios FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for price_alerts
CREATE POLICY "Users can view their own alerts"
ON price_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own alerts"
ON price_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts"
ON price_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own alerts"
ON price_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view their own preferences"
ON user_preferences FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
ON user_preferences FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
ON user_preferences FOR UPDATE TO authenticated USING (auth.uid() = user_id);
