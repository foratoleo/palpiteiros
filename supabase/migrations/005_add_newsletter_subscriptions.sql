-- Migration: Add Newsletter Subscriptions Table
-- Purpose: Store email subscriptions for daily breaking markets newsletter
-- Date: 2025-01-11

-- Create breaking_newsletter_subscriptions table
CREATE TABLE IF NOT EXISTS breaking_newsletter_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  active boolean not null default true,
  frequency text not null default 'daily' check (frequency in ('daily', 'weekly')),
  created_at timestamptz not null default now(),
  last_sent_at timestamptz,
  unsubscribed_at timestamptz,
  unsubscribe_token text unique default gen_random_uuid()::text
);

-- Add comments for documentation
COMMENT ON TABLE breaking_newsletter_subscriptions IS 'Email subscriptions for breaking markets daily newsletter';
COMMENT ON COLUMN breaking_newsletter_subscriptions.id IS 'Unique identifier for the subscription';
COMMENT ON COLUMN breaking_newsletter_subscriptions.email IS 'Subscriber email address (must be unique)';
COMMENT ON COLUMN breaking_newsletter_subscriptions.active IS 'Whether the subscription is currently active';
COMMENT ON COLUMN breaking_newsletter_subscriptions.frequency IS 'Email frequency: daily or weekly';
COMMENT ON COLUMN breaking_newsletter_subscriptions.created_at IS 'Timestamp when the subscription was created';
COMMENT ON COLUMN breaking_newsletter_subscriptions.last_sent_at IS 'Timestamp when the last email was sent to this subscriber';
COMMENT ON COLUMN breaking_newsletter_subscriptions.unsubscribed_at IS 'Timestamp when the user unsubscribed (null if still active)';
COMMENT ON COLUMN breaking_newsletter_subscriptions.unsubscribe_token IS 'Unique token for secure unsubscribe links';

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON breaking_newsletter_subscriptions(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON breaking_newsletter_subscriptions(active, last_sent_at);
CREATE INDEX IF NOT EXISTS idx_newsletter_frequency ON breaking_newsletter_subscriptions(frequency, active);
CREATE INDEX IF NOT EXISTS idx_newsletter_unsubscribe_token ON breaking_newsletter_subscriptions(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE breaking_newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can subscribe (create new subscriptions)
-- This allows anonymous users to sign up for the newsletter
CREATE POLICY "Anyone can subscribe to newsletter"
ON breaking_newsletter_subscriptions FOR INSERT
TO anon
WITH CHECK (true);

-- Policy: Users can view their own subscription by email
-- This is useful for checking subscription status
CREATE POLICY "Users can view own newsletter subscription"
ON breaking_newsletter_subscriptions FOR SELECT
TO anon
USING (email = current_setting('request.headers.x-client-email', true));

-- Policy: Users can unsubscribe via their unique token
CREATE POLICY "Users can unsubscribe via token"
ON breaking_newsletter_subscriptions FOR UPDATE
TO anon
USING (
  unsubscribe_token = current_setting('request.headers.x-unsubscribe-token', true)
)
WITH CHECK (
  unsubscribe_token = current_setting('request.headers.x-unsubscribe-token', true)
);

-- Policy: Service role has full access for email sending operations
CREATE POLICY "Service role can manage newsletter subscriptions"
ON breaking_newsletter_subscriptions FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a function to handle subscription upsert (subscribe or reactivate)
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(p_email text, p_frequency text default 'daily')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription breaking_newsletter_subscriptions;
  v_was_reactivated boolean := false;
BEGIN
  -- Validate email format
  IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid email format'
    );
  END IF;

  -- Check if subscription exists
  SELECT * INTO v_subscription
  FROM breaking_newsletter_subscriptions
  WHERE email = p_email;

  -- If exists and was inactive, reactivate
  IF v_subscription IS NOT NULL THEN
    IF NOT v_subscription.active THEN
      UPDATE breaking_newsletter_subscriptions
      SET
        active = true,
        frequency = p_frequency,
        unsubscribed_at = NULL,
        unsubscribe_token = gen_random_uuid()::text
      WHERE email = p_email
      RETURNING * INTO v_subscription;

      v_was_reactivated := true;
    ELSE
      -- Already active, just update frequency if different
      IF v_subscription.frequency != p_frequency THEN
        UPDATE breaking_newsletter_subscriptions
        SET frequency = p_frequency
        WHERE email = p_email
        RETURNING * INTO v_subscription;
      END IF;
    END IF;

    RETURN jsonb_build_object(
      'success', true,
      'data', row_to_json(v_subscription),
      'reactivated', v_was_reactivated,
      'message', CASE
        WHEN v_was_reactivated THEN 'Subscription reactivated successfully'
        WHEN v_subscription.frequency != p_frequency THEN 'Frequency updated successfully'
        ELSE 'Already subscribed'
      END
    );
  END IF;

  -- Create new subscription
  INSERT INTO breaking_newsletter_subscriptions (email, frequency)
  VALUES (p_email, p_frequency)
  RETURNING * INTO v_subscription;

  RETURN jsonb_build_object(
    'success', true,
    'data', row_to_json(v_subscription),
    'reactivated', false,
    'message', 'Subscribed successfully'
  );
END;
$$;

-- Create a function to handle unsubscription
CREATE OR REPLACE FUNCTION unsubscribe_from_newsletter(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription breaking_newsletter_subscriptions;
BEGIN
  -- Find subscription by token
  SELECT * INTO v_subscription
  FROM breaking_newsletter_subscriptions
  WHERE unsubscribe_token = p_token AND active = true;

  IF v_subscription IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid or expired unsubscribe link'
    );
  END IF;

  -- Deactivate subscription
  UPDATE breaking_newsletter_subscriptions
  SET
    active = false,
    unsubscribed_at = now()
  WHERE id = v_subscription.id
  RETURNING * INTO v_subscription;

  RETURN jsonb_build_object(
    'success', true,
    'message', 'Successfully unsubscribed from newsletter'
  );
END;
$$;

-- Create a function to get active subscribers for a frequency
CREATE OR REPLACE FUNCTION get_newsletter_subscribers(p_frequency text default 'daily')
RETURNS TABLE (
  email text,
  unsubscribe_token text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    bns.email,
    bns.unsubscribe_token
  FROM breaking_newsletter_subscriptions bns
  WHERE
    bns.active = true
    AND bns.frequency = p_frequency
    AND (
      -- Never sent, or
      bns.last_sent_at IS NULL
      OR
      -- Last sent was more than 23 hours ago (for daily)
      (p_frequency = 'daily' AND bns.last_sent_at < now() - interval '23 hours')
      OR
      -- Last sent was more than 7 days ago (for weekly)
      (p_frequency = 'weekly' AND bns.last_sent_at < now() - interval '7 days')
    )
  ORDER BY bns.created_at ASC;
END;
$$;

-- Create a function to mark newsletter as sent
CREATE OR REPLACE FUNCTION mark_newsletter_sent(p_email text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE breaking_newsletter_subscriptions
  SET last_sent_at = now()
  WHERE email = p_email;
END;
$$;

-- Grant execute permissions to authenticated users and service role
GRANT EXECUTE ON FUNCTION subscribe_to_newsletter TO anon;
GRANT EXECUTE ON FUNCTION unsubscribe_from_newsletter TO anon;
GRANT EXECUTE ON FUNCTION get_newsletter_subscribers TO service_role;
GRANT EXECUTE ON FUNCTION mark_newsletter_sent TO service_role;
