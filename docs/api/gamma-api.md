# Gamma API Documentation

Service layer for interacting with the Polymarket Gamma API.

## Overview

The Gamma API service (`src/services/gamma.service.ts`) provides typed methods for fetching prediction market data from Polymarket. It includes:

- Market fetching with filtering and pagination
- Event data retrieval
- Tag-based queries
- Built-in caching (60-second TTL)
- Error handling and timeout management

## Configuration

### Base URL

Default: `https://gamma-api.polymarket.com`

Can be overridden via environment variable:
```env
NEXT_PUBLIC_GAMMA_API_URL=https://custom-gamma-api.com
```

## API Methods

### fetchMarkets(query)

Fetches markets with optional filtering parameters.

**Parameters:**
```typescript
interface GammaMarketsQuery {
  // Boolean filters
  active?: boolean
  archived?: boolean
  closed?: boolean
  ascending?: boolean

  // String filters
  order?: 'endDate' | 'liquidity' | 'volume'
  slug?: string
  tag_slug?: string
  uma_resolution_status?: string
  game_id?: string

  // Numeric filters
  limit?: number
  offset?: number
  tag_id?: number
  liquidity_num_min?: number
  liquidity_num_max?: number
  volume_num_min?: number
  volume_num_max?: number
  rewards_min_size?: number

  // Date filters (ISO strings)
  max_close_date?: string
  min_close_date?: string
  start_date_max?: string
  start_date_min?: string

  // Array filters
  condition_ids?: string[]
  clob_token_ids?: string[]
  market_maker_address?: string[]
  sports_market_types?: string[]
  question_ids?: string[]
  id?: string[]
}
```

**Returns:** `Promise<GammaMarket[]>`

**Example:**
```typescript
import { gammaService } from '@/services/gamma.service'

// Get active markets
const markets = await gammaService.fetchMarkets({
  active: true,
  limit: 20
})

// Get markets by tag with sorting
const cryptoMarkets = await gammaService.fetchMarkets({
  tag_slug: 'crypto',
  order: 'volume',
  ascending: false,
  limit: 50
})
```

### getMarketBySlug(slug)

Fetches a single market by its slug.

**Parameters:**
- `slug: string` - Market slug

**Returns:** `Promise<GammaMarket | null>`

**Example:**
```typescript
const market = await gammaService.getMarketBySlug(
  'will-bitcoin-exceed-100k-dec-31-2024'
)
```

### getMarketsByConditionIds(conditionIds)

Fetches markets by Polymarket condition IDs.

**Parameters:**
- `conditionIds: string | string[]` - Condition ID(s)

**Returns:** `Promise<GammaMarket[]>`

**Example:**
```typescript
const markets = await gammaService.getMarketsByConditionIds([
  '0xabc123...',
  '0xdef456...'
])
```

### getActiveMarkets(limit, offset)

Fetches active (open) markets.

**Parameters:**
- `limit?: number` - Max markets to return (default: 100)
- `offset?: number` - Number to skip (default: 0)

**Returns:** `Promise<GammaMarket[]>`

### getClosingSoonMarkets(limit)

Fetches markets closing within 24 hours.

**Parameters:**
- `limit?: number` - Max markets to return (default: 10)

**Returns:** `Promise<GammaMarket[]>`

### getPopularMarkets(limit)

Fetches markets sorted by volume (highest first).

**Parameters:**
- `limit?: number` - Max markets to return (default: 20)

**Returns:** `Promise<GammaMarket[]>`

### fetchEvents(slug?)

Fetches event data from Polymarket.

**Parameters:**
- `slug?: string` - Optional event slug filter

**Returns:** `Promise<GammaEvent[]>`

**Example:**
```typescript
// Get all events
const events = await gammaService.fetchEvents()

// Get specific event
const electionEvent = await gammaService.fetchEvents(
  'us-presidential-election-2024'
)
```

### getTagStatistics(tagSlug)

Calculates statistics for markets with a specific tag.

**Parameters:**
- `tagSlug: string` - Tag slug to analyze

**Returns:** `Promise<MarketStatistics>`

**Example:**
```typescript
const stats = await gammaService.getTagStatistics('crypto')
console.log(`Total volume: $${stats.totalVolume}`)
console.log(`Average liquidity: $${stats.averageLiquidity}`)
```

### clearCache()

Clears the internal cache (useful for forcing fresh data).

**Example:**
```typescript
gammaService.clearCache()
const freshMarkets = await gammaService.fetchMarkets()
```

## Type Definitions

### GammaMarket

```typescript
interface GammaMarket {
  conditionId: string
  slug: string
  question: string
  description?: string
  startDate?: string
  endDate?: string
  active: boolean
  closed: boolean
  archived?: boolean
  imageUrl?: string
  outcomes: Array<{
    name: string
    price: number
    ticker?: string
  }>
  tags?: Array<{
    id: number | string
    label: string
    slug: string
    name?: string
  }>
  volume?: number
  liquidity?: number
  orders?: unknown[]
  price?: string
}
```

### GammaEvent

```typescript
interface GammaEvent {
  id: string
  slug: string
  name: string
  description?: string
  startDate?: string
  endDate?: string
}
```

### MarketStatistics

```typescript
interface MarketStatistics {
  marketCount: number
  totalVolume: number
  totalLiquidity: number
  averageVolume: number
  averageLiquidity: number
}
```

## Utility Functions

### fetchAllMarkets(query, service)

Fetches all markets using automatic pagination.

```typescript
import { fetchAllMarkets } from '@/services/gamma.service'

const allMarkets = await fetchAllMarkets({ active: true })
console.log(`Fetched ${allMarkets.length} markets`)
```

### searchMarkets(searchTerm, filters, service)

Client-side search across markets.

```typescript
import { searchMarkets } from '@/services/gamma.service'

const results = await searchMarkets('Bitcoin', { active: true })
```

### getContestedMarkets(threshold, limit, service)

Gets markets with prices close to 50% (highly contested).

```typescript
import { getContestedMarkets } from '@/services/gamma.service'

const contested = await getContestedMarkets(0.05, 20)
// Returns markets with YES price between 45-55%
```

## Error Handling

The service throws errors for:

- Network timeouts (default: 30 seconds)
- HTTP errors (non-2xx responses)
- Invalid responses

```typescript
try {
  const markets = await gammaService.fetchMarkets({ active: true })
} catch (error) {
  if (error.message.includes('timeout')) {
    // Handle timeout
  } else {
    // Handle other errors
  }
}
```

## Caching

The service includes built-in caching:

- **TTL:** 60 seconds (configurable via constructor)
- **Cache key:** Based on query parameters
- **Automatic cache invalidation:** After TTL expires

To create a service with custom cache settings:

```typescript
import { GammaService } from '@/services/gamma.service'

const customService = new GammaService(
  'https://custom-url.com',
  120000 // 2-minute cache TTL
)
```
