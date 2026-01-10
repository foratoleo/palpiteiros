> Source: https://docs.polymarket.com/developers/gamma-markets-api
> Fetched: 2026-01-10
> Category: API Reference

# Gamma Markets API Reference

The Gamma API provides read-only access to Polymarket market data, including market metadata, pricing, volume, and liquidity information. No authentication is required.

## Base Configuration

- **Base URL**: `https://gamma-api.polymarket.com`
- **Authentication**: Not required (public endpoints)
- **Rate Limits**: Moderate, implement caching for frequent requests
- **Response Format**: JSON

## Quick Start

```typescript
// Fetch active markets
const response = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true"
);
const markets = await response.json();

console.log(`Found ${markets.length} markets`);
```

## Endpoints

### GET /markets

Retrieve a list of markets with comprehensive filtering and sorting capabilities.

**Endpoint**: `/markets`
**Method**: GET
**Authentication**: Not required

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Maximum number of markets to return |
| `offset` | integer | No | Number of markets to skip (pagination) |
| `order` | string | No | Comma-separated fields to order by |
| `ascending` | boolean | No | Sort order (default: false) |
| `id` | array[int] | No | Filter by market IDs |
| `slug` | array[string] | No | Filter by market slugs |
| `clob_token_ids` | array[string] | No | Filter by CLOB token IDs |
| `condition_ids` | array[string] | No | Filter by condition IDs |
| `market_maker_address` | array[string] | No | Filter by market maker addresses |
| `liquidity_num_min` | number | No | Minimum liquidity |
| `liquidity_num_max` | number | No | Maximum liquidity |
| `volume_num_min` | number | No | Minimum volume |
| `volume_num_max` | number | No | Maximum volume |
| `start_date_min` | string (datetime) | No | Minimum start date (ISO format) |
| `start_date_max` | string (datetime) | No | Maximum start date (ISO format) |
| `end_date_min` | string (datetime) | No | Minimum end date (ISO format) |
| `end_date_max` | string (datetime) | No | Maximum end date (ISO format) |
| `tag_id` | integer | No | Filter by tag ID |
| `related_tags` | boolean | No | Include markets with related tags |
| `cyom` | boolean | No | Filter for CYOM markets |
| `uma_resolution_status` | string | No | Filter by UMA resolution status |
| `game_id` | string | No | Filter by game ID |
| `sports_market_types` | array[string] | No | Filter by sports market types |
| `rewards_min_size` | number | No | Minimum reward size |
| `question_ids` | array[string] | No | Filter by question IDs |
| `include_tag` | boolean | No | Include tag information |
| `closed` | boolean | No | Include closed markets |
| `active` | boolean | No | Filter for active markets |

#### Request Examples

```bash
# Active markets only
GET https://gamma-api.polymarket.com/markets?active=true

# Markets by tag with pagination
GET https://gamma-api.polymarket.com/markets?tag_id=123&limit=10&offset=0

# Markets with liquidity range
GET https://gamma-api.polymarket.com/markets?liquidity_num_min=10000&liquidity_num_max=100000

# Sorted by end date
GET https://gamma-api.polymarket.com/markets?order=endDate&ascending=false
```

#### Response Structure

```json
[
  {
    "id": "123",
    "question": "Will ETH price be above $3000 on December 31st, 2024?",
    "conditionId": "0xabc...",
    "slug": "eth-price-above-3000-dec-31-2024",
    "twitterCardImage": "https://example.com/image.png",
    "resolutionSource": "Oracle",
    "endDate": "2025-01-01T00:00:00Z",
    "category": "Crypto",
    "ammType": "Bonds",
    "liquidity": "100000",
    "sponsorName": "Polymarket",
    "sponsorImage": "https://example.com/sponsor.png",
    "startDate": "2024-01-01T00:00:00Z",
    "xAxisValue": "Date",
    "yAxisValue": "Price",
    "denominationToken": "USDC",
    "description": "Detailed market description...",
    "tags": [
      {
        "id": 1,
        "name": "Crypto",
        "slug": "crypto"
      }
    ],
    "outcomes": [
      {
        "name": "Yes",
        "price": 0.75,
        "ticker": "YES"
      },
      {
        "name": "No",
        "price": 0.25,
        "ticker": "NO"
      }
    ],
    "volume": "50000",
    "active": true,
    "closed": false,
    "archived": false
  }
]
```

### GET /events

Get event information containing related markets.

**Endpoint**: `/events`
**Method**: GET

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | No | Filter by event slug |

#### Request Example

```bash
GET https://gamma-api.polymarket.com/events?slug=us-presidential-election
```

#### Response Structure

```json
[
  {
    "id": "1",
    "slug": "us-presidential-election",
    "name": "US Presidential Election 2024",
    "description": "Markets related to the 2024 US election",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-11-05T00:00:00Z",
    "markets": [/* market IDs */]
  }
]
```

## Key Fields for Market Makers

| Field | Type | Description |
|-------|------|-------------|
| `conditionId` | string | Unique market identifier (required for trading) |
| `clobTokenIds` | array[string] | Outcome token IDs for trading |
| `outcomes` | array[object] | Outcome names and prices |
| `outcomePrices` | array[number] | Current outcome prices (0-1) |
| `volume` | string | Total trading volume |
| `liquidity` | string | Current liquidity available |
| `rfqEnabled` | boolean | Whether RFQ (Request for Quote) is enabled |
| `question` | string | Market question/title |
| `endDate` | string | Market end date (ISO format) |
| `active` | boolean | Whether market is currently active |
| `closed` | boolean | Whether market is closed |

## Common Filter Combinations

### Active Markets in Category
```typescript
const cryptoMarkets = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true&tag_slug=crypto"
);
```

### High Liquidity Markets
```typescript
const liquidMarkets = await fetch(
  "https://gamma-api.polymarket.com/markets?liquidity_num_min=50000&order=liquidity&ascending=false"
);
```

### Closing Soon
```typescript
const closingSoon = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true&end_date_max=2024-12-31T23:59:59Z&order=endDate&ascending=true"
);
```

### Most Popular
```typescript
const popular = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true&order=volume&ascending=false&limit=20"
);
```

## Best Practices

### 1. Pagination
For large result sets, use pagination:
```typescript
async function getAllMarkets() {
  let allMarkets = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=${limit}&offset=${offset}`
    );
    const markets = await response.json();

    allMarkets.push(...markets);

    if (markets.length < limit) break;
    offset += limit;
  }

  return allMarkets;
}
```

### 2. Caching
Implement caching to reduce API calls:
```typescript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getMarketsWithCache(query) {
  const key = JSON.stringify(query);
  const cached = cache.get(key);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const response = await fetch(
    `https://gamma-api.polymarket.com/markets?${new URLSearchParams(query)}`
  );
  const data = await response.json();

  cache.set(key, { data, timestamp: Date.now() });
  return data;
}
```

### 3. Error Handling
```typescript
async function fetchMarkets(query) {
  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?${new URLSearchParams(query)}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return [];
  }
}
```

### 4. Type Safety (TypeScript)
```typescript
interface Market {
  id: string;
  question: string;
  conditionId: string;
  slug: string;
  endDate: string;
  outcomes: Array<{
    name: string;
    price: number;
  }>;
  volume: string;
  liquidity: string;
  active: boolean;
  closed: boolean;
}

interface MarketsResponse {
  markets: Market[];
}

async function getMarkets(query: object): Promise<Market[]> {
  const response = await fetch(
    `https://gamma-api.polymarket.com/markets?${new URLSearchParams(query)}`
  );
  return response.json();
}
```

## Use Cases

### Market Explorer
Build a market explorer with filtering and search:
```typescript
async function searchMarkets(searchTerm: string) {
  const markets = await fetch(
    `https://gamma-api.polymarket.com/markets?active=true&limit=100`
  ).then(r => r.json());

  return markets.filter(m =>
    m.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );
}
```

### Price Monitor
Monitor price changes for specific markets:
```typescript
async function monitorMarketPrices(conditionIds: string[]) {
  const markets = await fetch(
    `https://gamma-api.polymarket.com/markets?condition_ids=${conditionIds.join(',')}`
  ).then(r => r.json());

  return markets.map(m => ({
    conditionId: m.conditionId,
    question: m.question,
    prices: m.outcomes.map(o => ({ name: o.name, price: o.price }))
  }));
}
```

### Category Analysis
Analyze markets by category:
```typescript
async function getCategoryStats(tagSlug: string) {
  const markets = await fetch(
    `https://gamma-api.polymarket.com/markets?tag_slug=${tagSlug}&active=true`
  ).then(r => r.json());

  const totalVolume = markets.reduce((sum, m) => sum + parseFloat(m.volume), 0);
  const totalLiquidity = markets.reduce((sum, m) => sum + parseFloat(m.liquidity), 0);

  return {
    marketCount: markets.length,
    totalVolume,
    totalLiquidity,
    averageVolume: totalVolume / markets.length
  };
}
```

## Rate Limiting

While the Gamma API doesn't require authentication, implement rate limiting:
```typescript
class RateLimitedClient {
  private requestTimes: number[] = [];
  private readonly maxRequests = 100;
  private readonly windowMs = 60000; // 1 minute

  async fetchMarkets(query: object) {
    const now = Date.now();

    // Remove old request times
    this.requestTimes = this.requestTimes.filter(t => now - t < this.windowMs);

    // Check rate limit
    if (this.requestTimes.length >= this.maxRequests) {
      const waitTime = this.windowMs - (now - this.requestTimes[0]);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.requestTimes.push(now);

    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?${new URLSearchParams(query)}`
    );

    return response.json();
  }
}
```

## Additional Resources

- [Gamma API Overview](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [Fetch Markets Guide](https://docs.polymarket.com/developers/gamma-markets-api/fetch-markets-guide)
- [Fetching Data Quickstart](https://docs.polymarket.com/quickstart/fetching-data)
- [API Changelog](https://docs.polymarket.com/changelog/changelog)

---

**Last Updated**: 2026-01-10
**API Version**: v2
**Base URL**: https://gamma-api.polymarket.com
