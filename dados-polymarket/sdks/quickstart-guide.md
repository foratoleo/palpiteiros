> Source: https://docs.polymarket.com/quickstart
> Fetched: 2026-01-10
> Category: Getting Started

# Polymarket API Quickstart Guide

Get started with Polymarket APIs in minutes. No API key or wallet required for market data!

## Overview

Polymarket provides two main APIs:

1. **Gamma Markets API** - Read-only market data (no authentication)
2. **CLOB API** - Trading operations (authentication required)

This quickstart focuses on the **Gamma Markets API** for fetching market data.

## Prerequisites

- Node.js 18+ or any programming language
- Basic understanding of REST APIs
- (Optional) TypeScript/JavaScript knowledge

## Zero-Setup Quickstart

### Fetching Market Data (No API Key Required)

The Gamma API is completely public - no setup needed!

#### JavaScript/TypeScript

```typescript
// Install: No packages required!

// Fetch active markets
async function getActiveMarkets() {
  const response = await fetch(
    "https://gamma-api.polymarket.com/markets?active=true"
  );
  const markets = await response.json();
  return markets;
}

// Usage
getActiveMarkets().then(markets => {
  console.log(`Found ${markets.length} active markets`);
  console.log('First market:', markets[0]);
});
```

#### Python

```python
import requests

def get_active_markets():
    response = requests.get(
        "https://gamma-api.polymarket.com/markets?active=true"
    )
    return response.json()

# Usage
markets = get_active_markets()
print(f"Found {len(markets)} active markets")
print(f"First market: {markets[0]}")
```

#### cURL

```bash
curl "https://gamma-api.polymarket.com/markets?active=true"
```

## Installation with SDKs

### Option 1: Official SDK (@polymarket/clob-client)

```bash
npm install @polymarket/clob-client
```

```typescript
import { ClobClient } from "@polymarket/clob-client";

// For market data, no authentication needed
const client = new ClobClient("https://clob.polymarket.com", 137);

// Get markets
const markets = await client.getMarkets();
console.log('Markets:', markets);
```

### Option 2: Full-Featured SDK (@hk/polymarket)

```bash
npm install @hk/polymarket
```

```typescript
import { GammaSDK } from "@hk/polymarket";

// No authentication needed for market data
const gamma = new GammaSDK();

// Get active markets
const markets = await gamma.getMarkets({
  active: true,
  limit: 10
});

console.log(`Found ${markets.length} markets`);
markets.forEach(market => {
  console.log(`- ${market.question}`);
  console.log(`  Price: ${market.outcomes[0].price}`);
});
```

## Common Use Cases

### 1. Fetch Crypto Markets

```typescript
const cryptoMarkets = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true&tag_slug=crypto"
).then(r => r.json());

console.log(`Found ${cryptoMarkets.length} crypto markets`);
```

### 2. Get Market by ID

```typescript
const marketId = "12345";
const market = await fetch(
  `https://gamma-api.polymarket.com/markets?id=${marketId}`
).then(r => r.json());

console.log('Market:', market[0]);
```

### 3. Filter by Price Range

```typescript
const markets = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true"
).then(r => r.json());

// Filter markets where YES price is between 0.4 and 0.6
const contestedMarkets = markets.filter(m =>
  m.outcomes.some(o => o.name === "Yes" && o.price > 0.4 && o.price < 0.6)
);

console.log(`Found ${contestedMarkets.length} contested markets`);
```

### 4. Get High Volume Markets

```typescript
const markets = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true&order=volume&ascending=false&limit=10"
).then(r => r.json());

console.log('Top 10 markets by volume:');
markets.forEach((m, i) => {
  console.log(`${i + 1}. ${m.question} - Volume: $${m.volume}`);
});
```

### 5. Monitor Price Changes

```typescript
async function monitorPrice(conditionId, intervalMs = 60000) {
  let previousPrice = null;

  setInterval(async () => {
    const markets = await fetch(
      `https://gamma-api.polymarket.com/markets?condition_ids=${conditionId}`
    ).then(r => r.json());

    const currentPrice = markets[0].outcomes[0].price;

    if (previousPrice !== null) {
      const change = currentPrice - previousPrice;
      const percentChange = (change / previousPrice) * 100;

      console.log(`Price: ${currentPrice} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%)`);
    }

    previousPrice = currentPrice;
  }, intervalMs);
}

// Usage: monitorPrice('0xabc...');
```

## Complete Example: Market Monitor

```typescript
import { GammaSDK } from "@hk/polymarket";

class MarketMonitor {
  private gamma: GammaSDK;
  private previousPrices: Map<string, number> = new Map();

  constructor() {
    this.gamma = new GammaSDK();
  }

  async monitorMarkets(tagSlug: string, intervalMs: number = 60000) {
    console.log(`Monitoring ${tagSlug} markets...`);

    setInterval(async () => {
      const markets = await this.gamma.getMarkets({
        active: true,
        tag_slug: tagSlug,
        limit: 20
      });

      console.log('\n=== Market Update ===');
      markets.forEach(market => {
        const yesOutcome = market.outcomes.find(o => o.name === "Yes");
        if (!yesOutcome) return;

        const currentPrice = yesOutcome.price;
        const previousPrice = this.previousPrices.get(market.conditionId);

        if (previousPrice !== undefined) {
          const change = currentPrice - previousPrice;
          const percentChange = (change / previousPrice) * 100;

          const icon = percentChange > 0 ? '📈' : percentChange < 0 ? '📉' : '➡️';
          console.log(`${icon} ${market.question}`);
          console.log(`   Price: ${currentPrice.toFixed(3)} (${percentChange > 0 ? '+' : ''}${percentChange.toFixed(2)}%)`);
        }

        this.previousPrices.set(market.conditionId, currentPrice);
      });
    }, intervalMs);
  }
}

// Usage
const monitor = new MarketMonitor();
monitor.monitorMarkets('crypto', 30000); // Update every 30 seconds
```

## Authentication (For Trading)

### Generate API Key

```typescript
import { ClobClient } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  signer // ethers.js signer
);

// Generate API credentials
const credentials = await client.deriveApiKey();
console.log("API Key:", credentials.key);
console.log("Secret:", credentials.secret);
console.log("Passphrase:", credentials.passphrase);
```

### Place Order (Authenticated)

```typescript
import { PolymarketSDK, BuilderConfig } from "@hk/polymarket";

const builderConfig = new BuilderConfig({
  localBuilderCreds: {
    key: process.env.POLY_API_KEY!,
    secret: process.env.POLY_API_SECRET!,
    passphrase: process.env.POLY_API_PASSPHRASE!,
  },
});

const sdk = new PolymarketSDK({ builderConfig });

// Place order
const order = await sdk.placeOrder({
  tokenId: "0x...",
  side: "BUY",
  price: 0.75,
  size: 10
});

console.log("Order placed:", order);
```

## Best Practices

### 1. Implement Caching

```typescript
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

async function getCachedMarkets(query: string) {
  const cached = cache.get(query);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const data = await fetch(
    `https://gamma-api.polymarket.com/markets?${query}`
  ).then(r => r.json());

  cache.set(query, { data, timestamp: Date.now() });
  return data;
}
```

### 2. Handle Errors

```typescript
async function fetchMarkets(query: string) {
  try {
    const response = await fetch(
      `https://gamma-api.polymarket.com/markets?${query}`
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch markets:', error);
    return [];
  }
}
```

### 3. Use Pagination

```typescript
async function getAllMarkets() {
  let allMarkets = [];
  let offset = 0;
  const limit = 100;

  while (true) {
    const markets = await fetch(
      `https://gamma-api.polymarket.com/markets?limit=${limit}&offset=${offset}`
    ).then(r => r.json());

    allMarkets.push(...markets);

    if (markets.length < limit) break;
    offset += limit;
  }

  return allMarkets;
}
```

## Next Steps

### Learn More

- [Gamma API Reference](./api-docs/gamma-api.md) - Complete API documentation
- [CLOB API Reference](./api-docs/clob-api.md) - Trading API documentation
- [SDK Reference](./sdks/official-sdks.md) - Available SDKs

### Advanced Features

- **WebSocket**: Real-time data streaming
- **Portfolio Data**: User positions and PnL
- **Trading**: Order placement and management

### Build Something

- Market explorer
- Price alert system
- Trading bot
- Portfolio tracker
- Analytics dashboard

## Resources

- **Official Docs**: https://docs.polymarket.com
- **GitHub**: https://github.com/Polymarket
- **Discord**: Community support
- **API Changelog**: Track updates

---

**Last Updated**: 2026-01-10
**API Version**: v2
