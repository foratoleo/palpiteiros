// Supabase Edge Function: subscribe-newsletter
// Purpose: Handle email newsletter subscriptions for breaking markets
// Method: POST
// Body: { email: string, frequency?: 'daily' | 'weekly' }
// Returns: { success: boolean, message: string, data?: Subscription }

import { createClient } from 'jsr:@supabase/supabase-js@2';

// ============================================================================
// CONFIGURATION
// ============================================================================

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 5; // Max 5 subscriptions per hour per email

// ============================================================================
// TYPES
// ============================================================================

interface SubscribeRequest {
  email: string;
  frequency?: 'daily' | 'weekly';
}

interface SubscribeResponse {
  success: boolean;
  message: string;
  data?: SubscriptionData;
  reactivated?: boolean;
}

interface SubscriptionData {
  id: string;
  email: string;
  active: boolean;
  frequency: string;
  created_at: string;
  unsubscribe_token: string;
}

interface ErrorResponse {
  error: string;
  details?: string;
  timestamp: string;
}

// ============================================================================
// CORS HEADERS
// ============================================================================

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validates email format using RFC 5322 compliant regex
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email);
}

/**
 * Validates the subscription request body
 */
function validateSubscribeRequest(body: unknown): { valid: boolean; error?: string } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' };
  }

  const req = body as Partial<SubscribeRequest>;

  if (!req.email || typeof req.email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  if (!isValidEmail(req.email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  if (req.email.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  if (req.frequency !== undefined && !['daily', 'weekly'].includes(req.frequency)) {
    return { valid: false, error: 'Frequency must be either "daily" or "weekly"' };
  }

  return { valid: true };
}

/**
 * Simple in-memory rate limiting cache
 * In production, consider using Redis or Supabase for distributed rate limiting
 */
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

/**
 * Checks rate limit for a given email
 */
function checkRateLimit(email: string): { allowed: boolean; remaining?: number; resetAt?: number } {
  const now = Date.now();
  const key = email.toLowerCase();
  const record = rateLimitCache.get(key);

  // Clean up expired entries
  if (record && record.resetTime < now) {
    rateLimitCache.delete(key);
  }

  const current = rateLimitCache.get(key);

  if (!current) {
    // First request
    rateLimitCache.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW_MS,
    });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      resetAt: current.resetTime,
    };
  }

  // Increment counter
  current.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - current.count, resetAt: current.resetTime };
}

// ============================================================================
// REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        timestamp: new Date().toISOString(),
      } as ErrorResponse),
      {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // Parse request body
    const body: unknown = await req.json();

    // Validate request
    const validation = validateSubscribeRequest(body);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({
          error: validation.error,
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { email, frequency = 'daily' } = body as SubscribeRequest;
    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limit
    const rateLimit = checkRateLimit(normalizedEmail);
    if (!rateLimit.allowed) {
      const resetAt = new Date(rateLimit.resetAt!);
      return new Response(
        JSON.stringify({
          error: 'Too many subscription attempts',
          details: `Rate limit exceeded. Please try again after ${resetAt.toLocaleString()}.`,
          resetAt: resetAt.toISOString(),
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 429,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((rateLimit.resetAt! - Date.now()) / 1000)),
          },
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase credentials');
      throw new Error('Server configuration error');
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    console.log(`Processing newsletter subscription for: ${normalizedEmail}`);

    // Call the subscribe function
    const { data, error } = await supabase.rpc('subscribe_to_newsletter', {
      p_email: normalizedEmail,
      p_frequency: frequency,
    });

    if (error) {
      console.error('Error calling subscribe_to_newsletter:', error);
      throw new Error(`Subscription failed: ${error.message}`);
    }

    const result = data as { success: boolean; message: string; data?: SubscriptionData; reactivated?: boolean };

    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: result.message,
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Subscription successful for: ${normalizedEmail}, reactivated: ${result.reactivated ?? false}`);

    // Prepare success response
    const response: SubscribeResponse = {
      success: true,
      message: result.message,
      reactivated: result.reactivated,
    };

    // Only include subscription data if it's a new subscription
    if (result.data && !result.reactivated) {
      response.data = {
        id: result.data.id,
        email: result.data.email,
        active: result.data.active,
        frequency: result.data.frequency,
        created_at: result.data.created_at,
        unsubscribe_token: result.data.unsubscribe_token,
      };
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-RateLimit-Remaining': String(rateLimit.remaining ?? 0),
        'X-RateLimit-Reset': String(rateLimit.resetAt ?? 0),
      },
    });

  } catch (error) {
    console.error('Fatal error in subscribe-newsletter:', error);

    const errorResponse: ErrorResponse = {
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: error instanceof Error && error.stack ? error.stack.split('\n')[0] : undefined,
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
