// Supabase Edge Function: get-polymarket-tweets
// Purpose: Fetches latest tweets from @polymarket using Twitter API v2
// Caching: 30-minute TTL via Edge Functions cache

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_TTL_SECONDS = 1800; // 30 minutes
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const DEFAULT_USERNAME = 'polymarket';
const TWITTER_API_BASE = 'https://api.twitter.com/2';

// ============================================================================
// TYPES
// ============================================================================

interface GetPolymarketTweetsRequest {
  username?: string;
  limit?: number;
  excludeReplies?: boolean;
  excludeRetweets?: boolean;
}

interface TwitterTweet {
  id: string;
  text: string;
  created_at: string;
  author_id?: string;
  attachments?: {
    media_keys: string[];
  };
  entities?: {
    urls?: Array<{ start: number; end: number; url: string; expanded_url: string; display_url: string }>;
    mentions?: Array<{ start: number; end: number; username: string }>;
    hashtags?: Array<{ start: number; end: number; tag: string }>;
  };
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    quote_count: number;
  };
  referenced_tweets?: Array<{
    type: 'quoted' | 'replied_to' | 'retweeted';
    id: string;
  }>;
  source?: string;
  lang?: string;
}

interface TwitterMedia {
  media_key: string;
  type: 'photo' | 'video' | 'animated_gif';
  url?: string;
  preview_image_url?: string;
  width?: number;
  height?: number;
}

interface TwitterUser {
  id: string;
  username: string;
  name: string;
  profile_image_url?: string;
  verified?: boolean;
  verified_type?: 'blue' | 'business' | 'government' | 'none';
}

interface EnrichedTweet {
  id: string;
  text: string;
  created_at: string;
  author?: TwitterUser;
  media?: TwitterMedia[];
  public_metrics?: TwitterTweet['public_metrics'];
  entities?: TwitterTweet['entities'];
  source?: string;
  lang?: string;
}

interface TwitterApiResponse {
  data?: TwitterTweet[];
  includes?: {
    media?: TwitterMedia[];
    users?: TwitterUser[];
  };
  errors?: Array<{
    message: string;
    code?: number;
  }>;
  meta?: {
    result_count: number;
    newest_id?: string;
    oldest_id?: string;
    next_token?: string;
  };
}

interface GetPolymarketTweetsResponse {
  success: boolean;
  data?: EnrichedTweet[];
  count?: number;
  timestamp: string;
  cached: boolean;
  error?: string;
  errorDetails?: string;
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
// VALIDATION
// ============================================================================

function validateQuery(query: GetPolymarketTweetsRequest): { valid: boolean; error?: string } {
  if (query.limit !== undefined) {
    if (!Number.isInteger(query.limit) || query.limit < 1) {
      return { valid: false, error: 'Limit must be a positive integer' };
    }
    if (query.limit > MAX_LIMIT) {
      return { valid: false, error: `Limit cannot exceed ${MAX_LIMIT}` };
    }
  }

  if (query.username !== undefined) {
    if (typeof query.username !== 'string' || query.username.length < 1) {
      return { valid: false, error: 'Username must be a non-empty string' };
    }
    if (query.username.length > 15) {
      return { valid: false, error: 'Username cannot exceed 15 characters' };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(query.username)) {
      return { valid: false, error: 'Username can only contain letters, numbers, and underscores' };
    }
  }

  return { valid: true };
}

// ============================================================================
// TWITTER API FUNCTIONS
// ============================================================================

/**
 * Get user ID from username using Twitter API v2
 */
async function getUserIdByUsername(
  username: string,
  bearerToken: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  const url = new URL(`${TWITTER_API_BASE}/users/by/username/${username}`);
  url.searchParams.set('user.fields', 'id,name,username,profile_image_url,verified,verified_type');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return { success: false, error: `User @${username} not found` };
    }
    if (response.status === 401) {
      return { success: false, error: 'Unauthorized: Invalid Twitter Bearer Token' };
    }
    if (response.status === 429) {
      return { success: false, error: 'Rate limit exceeded' };
    }
    const text = await response.text();
    return { success: false, error: `Twitter API error: ${response.status} - ${text}` };
  }

  const data = await response.json() as { data?: TwitterUser; errors?: Array<{ message: string }> };

  if (data.errors && data.errors.length > 0) {
    return { success: false, error: data.errors[0].message };
  }

  if (!data.data) {
    return { success: false, error: 'User data not found in response' };
  }

  return { success: true, userId: data.data.id };
}

/**
 * Get tweets by user ID using Twitter API v2
 */
async function getUserTweets(
  userId: string,
  limit: number,
  bearerToken: string
): Promise<{ success: boolean; response?: TwitterApiResponse; error?: string }> {
  const url = new URL(`${TWITTER_API_BASE}/users/${userId}/tweets`);
  url.searchParams.set('max_results', Math.min(limit, MAX_LIMIT).toString());
  url.searchParams.set('tweet.fields', 'created_at,public_metrics,entities,attachments,referenced_tweets,source,lang');
  url.searchParams.set('expansions', 'attachments.media_keys,author_id');
  url.searchParams.set('media.fields', 'media_keys,type,url,preview_image_url,width,height');
  url.searchParams.set('user.fields', 'id,name,username,profile_image_url,verified,verified_type');
  url.searchParams.set('exclude', 'retweets,replies');

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${bearerToken}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      return { success: false, error: 'Unauthorized: Invalid Twitter Bearer Token' };
    }
    if (response.status === 429) {
      return { success: false, error: 'Rate limit exceeded' };
    }
    const text = await response.text();
    return { success: false, error: `Twitter API error: ${response.status} - ${text}` };
  }

  const data = await response.json() as TwitterApiResponse;
  return { success: true, response: data };
}

/**
 * Enrich tweets with media and user information
 */
function enrichTweets(
  tweets: TwitterTweet[],
  includes?: TwitterApiResponse['includes']
): EnrichedTweet[] {
  const mediaMap = new Map<string, TwitterMedia>();
  const userMap = new Map<string, TwitterUser>();

  // Build media map
  if (includes?.media) {
    for (const media of includes.media) {
      mediaMap.set(media.media_key, media);
    }
  }

  // Build user map
  if (includes?.users) {
    for (const user of includes.users) {
      userMap.set(user.id, user);
    }
  }

  // Enrich tweets
  return tweets.map((tweet) => {
    const enriched: EnrichedTweet = {
      id: tweet.id,
      text: tweet.text,
      created_at: tweet.created_at,
      public_metrics: tweet.public_metrics,
      entities: tweet.entities,
      source: tweet.source,
      lang: tweet.lang,
    };

    // Add author
    if (tweet.author_id) {
      enriched.author = userMap.get(tweet.author_id);
    }

    // Add media
    if (tweet.attachments?.media_keys) {
      enriched.media = tweet.attachments.media_keys
        .map((key) => mediaMap.get(key))
        .filter((media): media is TwitterMedia => media !== undefined);
    }

    return enriched;
  });
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
    let query: GetPolymarketTweetsRequest = {};

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        query = body as GetPolymarketTweetsRequest;
      } catch {
        // Invalid JSON, use defaults
      }
    } else {
      // Parse query params for GET requests
      const url = new URL(req.url);
      const username = url.searchParams.get('username');
      const limit = url.searchParams.get('limit');
      const excludeReplies = url.searchParams.get('excludeReplies');
      const excludeRetweets = url.searchParams.get('excludeRetweets');

      if (username) query.username = username;
      if (limit) query.limit = parseInt(limit, 10);
      if (excludeReplies) query.excludeReplies = excludeReplies === 'true';
      if (excludeRetweets) query.excludeRetweets = excludeRetweets === 'true';
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
    const username = query.username || DEFAULT_USERNAME;
    const limit = query.limit || DEFAULT_LIMIT;

    // Get Twitter bearer token from environment
    const bearerToken = Deno.env.get('TWITTER_BEARER_TOKEN');

    if (!bearerToken) {
      console.error('Missing TWITTER_BEARER_TOKEN environment variable');
      return new Response(
        JSON.stringify({
          error: 'Twitter configuration error',
          details: 'Missing TWITTER_BEARER_TOKEN',
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Fetching tweets for @${username}, limit=${limit}`);

    // Get user ID from username
    const userResult = await getUserIdByUsername(username, bearerToken);

    if (!userResult.success || !userResult.userId) {
      return new Response(
        JSON.stringify({
          error: 'Failed to fetch user',
          details: userResult.error,
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get tweets
    const tweetsResult = await getUserTweets(userResult.userId, limit, bearerToken);

    if (!tweetsResult.success) {
      const statusCode = tweetsResult.error?.includes('Rate limit') ? 429 :
                        tweetsResult.error?.includes('Unauthorized') ? 401 : 500;

      return new Response(
        JSON.stringify({
          error: 'Failed to fetch tweets',
          details: tweetsResult.error,
          timestamp: new Date().toISOString(),
        } as ErrorResponse),
        {
          status: statusCode,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const tweets = tweetsResult.response?.data || [];
    const enrichedTweets = enrichTweets(tweets, tweetsResult.response?.includes);

    console.log(`Returning ${enrichedTweets.length} tweets for @${username}`);

    // Prepare response
    const response: GetPolymarketTweetsResponse = {
      success: true,
      data: enrichedTweets,
      count: enrichedTweets.length,
      timestamp: new Date().toISOString(),
      cached: false,
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
    console.error('Fatal error in get-polymarket-tweets:', error);

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
