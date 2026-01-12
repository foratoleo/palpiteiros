# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Palpiteiros application. Edge Functions are serverless Deno functions that run close to your data in Supabase.

## Functions Overview

| Function | Purpose | Authentication |
|----------|---------|----------------|
| `sync-gamma-markets` | Sync markets from Polymarket Gamma API | Service Role |
| `sync-price-history` | Sync price history to `market_price_history` table | Service Role |
| `get-breaking-markets` | Get markets ranked by price movement | Anonymous |
| `subscribe-newsletter` | Subscribe to breaking markets newsletter | Anonymous |
| `send-breaking-daily` | Send daily breaking markets email | Service Role |
| `get-polymarket-tweets` | Fetch latest tweets from @polymarket | Anonymous |

## Deployment

### Prerequisites

1. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```

2. **Link to your Supabase project**:
   ```bash
   supabase link --project-ref fnfuzshbbvwwdhexwjlv
   ```

3. **Set environment variables**:
   Create `.env.local` in the project root:
   ```env
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   GAMMA_API_URL=https://gamma-api.polymarket.com
   TWITTER_BEARER_TOKEN=your_twitter_bearer_token
   ```

### Deploy All Functions

```bash
npm run supabase:deploy
```

Or directly:
```bash
supabase functions deploy
```

### Deploy Specific Functions

**Breaking Markets functions**:
```bash
npm run supabase:deploy:breaking
```

**Twitter integration**:
```bash
npm run supabase:deploy:twitter
```

**Individual function**:
```bash
supabase functions deploy sync-price-history
```

### Deploy with No Verify JWT

Some functions (like `sync-gamma-markets`) are called from server-side code and don't need JWT verification. To deploy without JWT verification:

```bash
supabase functions deploy sync-gamma-markets --no-verify-jwt
```

> **Warning**: Only use `--no-verify-jwt` for functions that are called from trusted server-side code or have their own authentication mechanism.

## Environment Variables

### Function-Secrets Management

Set secrets for your Edge Functions:

```bash
# Set a secret for all functions
supabase secrets set GAMMA_API_URL=https://gamma-api.polymarket.com

# Set Twitter bearer token for get-polymarket-tweets
supabase secrets set TWITTER_BEARER_TOKEN=your_token_here
```

### Required Secrets

| Secret | Required For | Description |
|--------|-------------|-------------|
| `GAMMA_API_URL` | `sync-gamma-markets`, `sync-price-history` | Polymarket Gamma API base URL |
| `TWITTER_BEARER_TOKEN` | `get-polymarket-tweets` | Twitter API v2 Bearer Token |

## Function Details

### 1. sync-gamma-markets

Syncs market data from Polymarket's Gamma API to the `markets` table.

**Endpoint**: `POST /functions/v1/sync-gamma-markets`

**Usage**:
```bash
curl -X POST https://fnfuzshbbvwwdhexwjlv.supabase.co/functions/v1/sync-gamma-markets \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json"
```

**Authentication**: Service Role (required)

**Response**:
```json
{
  "success": true,
  "synced": 150,
  "message": "Synced 150 markets"
}
```

---

### 2. sync-price-history

Syncs current market prices to the `market_price_history` table for 24h movement tracking.

**Endpoint**: `POST /functions/v1/sync-price-history`

**Usage**:
```bash
curl -X POST https://fnfuzshbbvwwdhexwjlv.supabase.co/functions/v1/sync-price-history \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -d '{"market_id": "optional-uuid"}'
```

**Authentication**: Service Role (required)

**Request Body**:
```json
{
  "market_id": "optional-uuid-to-sync-single-market"
}
```

**Response**:
```json
{
  "success": true,
  "synced": 150,
  "message": "Synced price history for 150 markets"
}
```

---

### 3. get-breaking-markets

Returns markets ranked by 24h price movement and volume changes. Uses the `get_breaking_markets()` SQL function.

**Endpoint**: `POST /functions/v1/get-breaking-markets`

**Usage**:
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/get-breaking-markets`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      limit: 50,
      min_price_change: 5,
      min_volume: 1000,
    })
  }
)

const { markets, stats } = await response.json()
```

**Authentication**: Anonymous or Authenticated

**Request Body**:
```json
{
  "limit": 50,
  "min_price_change": 5,
  "min_volume": 1000
}
```

**Response**:
```json
{
  "markets": [
    {
      "market_id": "uuid",
      "question": "Will X happen?",
      "category": "politics",
      "price_yes": 0.65,
      "price_change_percent": 45.5,
      "volume": 150000,
      "composite_score": 27.3
    }
  ],
  "stats": {
    "total": 50,
    "avg_price_change": 18.3,
    "total_volume": 5000000
  }
}
```

---

### 4. subscribe-newsletter

Subscribes an email to the breaking markets daily newsletter.

**Endpoint**: `POST /functions/v1/subscribe-newsletter`

**Usage**:
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/subscribe-newsletter`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      frequency: 'daily'
    })
  }
)

const { success, message } = await response.json()
```

**Authentication**: Anonymous

**Request Body**:
```json
{
  "email": "user@example.com",
  "frequency": "daily"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Subscribed successfully",
  "reactivated": false
}
```

---

### 5. send-breaking-daily

Sends daily breaking markets newsletter to all active subscribers. Should be called by a cron job.

**Endpoint**: `POST /functions/v1/send-breaking-daily`

**Usage**:
```bash
curl -X POST https://fnfuzshbbvwwdhexwjlv.supabase.co/functions/v1/send-breaking-daily \
  -H "Authorization: Bearer {SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json"
```

**Authentication**: Service Role (required)

**Response**:
```json
{
  "success": true,
  "sent": 150,
  "failed": 0,
  "message": "Sent newsletter to 150 subscribers"
}
```

**Cron Job Setup**:
```bash
# Using Supabase Cron (recommended)
supabase functions deploy send-breaking-daily

# Or use GitHub Actions
# .github/workflows/newsletter.yml
name: Send Breaking Newsletter
on:
  schedule:
    - cron: '0 9 * * *'  # Daily at 9 AM UTC
jobs:
  send:
    runs-on: ubuntu-latest
    steps:
      - name: Send newsletter
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/send-breaking-daily \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}"
```

---

### 6. get-polymarket-tweets

Fetches latest tweets from @polymarket Twitter account for the Breaking page.

**Endpoint**: `POST /functions/v1/get-polymarket-tweets`

**Usage**:
```typescript
const response = await fetch(
  `${SUPABASE_URL}/functions/v1/get-polymarket-tweets`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      limit: 10
    })
  }
)

const { tweets } = await response.json()
```

**Authentication**: Anonymous

**Request Body**:
```json
{
  "limit": 10
}
```

**Response**:
```json
{
  "tweets": [
    {
      "id": "1234567890",
      "text": "🔥 Breaking: New prediction market launched!",
      "created_at": "2025-01-11T15:30:00Z",
      "author": {
        "username": "polymarket",
        "name": "Polymarket"
      },
      "category": "breaking_news",
      "media": []
    }
  ]
}
```

---

## Monitoring & Logs

### View Logs for All Functions

```bash
npm run supabase:logs
```

Or directly:
```bash
supabase functions logs
```

### View Logs for Specific Function

```bash
npm run supabase:logs:function get-breaking-markets
```

Or directly:
```bash
supabase functions logs get-breaking-markets
```

### Logs Options

```bash
# Follow logs in real-time
supabase functions logs get-breaking-markets --follow

# Show last 50 lines
supabase functions logs get-breaking-markets --tail 50

# Show logs since specific time
supabase functions logs get-breaking-markets --since 1h
```

## Testing Locally

### Start Local Supabase

```bash
supabase start
```

### Call Functions Locally

```bash
# sync-price-history locally
curl -X POST http://localhost:54321/functions/v1/sync-price-history \
  -H "Authorization: Bearer {LOCAL_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json"
```

### Inspect Functions

```bash
# List all functions
supabase functions list

# Get function details
supabase functions get get-breaking-markets
```

## Troubleshooting

### Function Not Responding

1. **Check logs**:
   ```bash
   supabase functions logs get-breaking-markets --tail 100
   ```

2. **Verify deployment**:
   ```bash
   supabase functions list
   ```

3. **Test locally**:
   ```bash
   supabase start
   supabase functions logs get-breaking-markets --follow
   ```

### Authentication Errors

- **401 Unauthorized**: Check your `SUPABASE_ANON_KEY` or `SUPABASE_SERVICE_ROLE_KEY`
- **403 Forbidden**: Verify RLS policies allow the operation
- **Missing JWT**: Add `Authorization: Bearer {KEY}` header

### Environment Variables Not Set

```bash
# List all secrets
supabase secrets list

# Set missing secret
supabase secrets set TWITTER_BEARER_TOKEN=your_token
```

## Best Practices

1. **Always use service role key for server-to-server calls**
   - Anonymous/Authenticated keys for client-side calls
   - Service role key bypasses RLS (use with caution)

2. **Monitor function invocations**
   - Check Supabase dashboard for usage metrics
   - Set up alerts for high error rates

3. **Keep functions lightweight**
   - Edge Functions have memory and execution time limits
   - Offload heavy processing to background jobs when possible

4. **Version your functions**
   - Use Git to track changes
   - Test locally before deploying to production

5. **Handle errors gracefully**
   - Always return proper HTTP status codes
   - Include helpful error messages in response body

## Additional Resources

- [Supabase Edge Functions Documentation](https://supabase.com/docs/guides/functions)
- [Deno Runtime Documentation](https://deno.land/manual)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
