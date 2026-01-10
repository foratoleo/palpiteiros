> Source: https://docs.polymarket.com/developers + GitHub
> Fetched: 2026-01-10
> Category: SDK Reference

# Polymarket SDKs

Official and community-maintained SDKs for integrating with Polymarket APIs.

## Official SDKs

### @polymarket/clob-client (TypeScript/JavaScript)

**Repository**: [Polymarket/clob-client](https://github.com/Polymarket/clob-client)
**Language**: TypeScript
**Platform**: Node.js, Browser

**Installation**:
```bash
npm install @polymarket/clob-client
```

**Features**:
- CLOB API integration
- Order placement and cancellation
- Balance queries
- Trade history
- WebSocket support
- Polygon chain integration (Chain ID: 137)

**Basic Usage**:
```typescript
import { ClobClient } from "@polymarket/clob-client";

// Initialize client
const client = new ClobClient(
  "https://clob.polymarket.com",
  137, // Polygon chain ID
  signer // ethers.js signer
);

// Get markets
const markets = await client.getMarkets();

// Place order
const order = await client.postOrder({
  token_id: "0x...",
  side: "BUY",
  order_type: "LIMIT",
  price: "0.75",
  size: "10"
});

// Cancel order
await client.cancelOrder(orderId);
```

### Polymarket Real-Time Data Client (TypeScript)

**Repository**: [Polymarket/real-time-data-client](https://github.com/Polymarket/real-time-data-client)
**Language**: TypeScript
**Purpose**: WebSocket real-time data streaming

**Features**:
- Real-time market data
- WebSocket connection management
- Price updates
- Order book changes
- Trade notifications
- Low-latency delivery

**Usage**:
```typescript
import { RealTimeDataClient } from "@polymarket/real-time-data-client";

const client = new RealTimeDataClient({
  websocketUrl: "wss://ws.polymarket.com/ws"
});

// Subscribe to market updates
client.subscribeToMarket(marketId);

// Listen to price updates
client.on('priceUpdate', (update) => {
  console.log('New price:', update.price);
});
```

## Community SDKs

### @hk/polymarket (Polymarket Kit)

**Repository**: [HuakunShen/polymarket-proxy](https://github.com/HuakunShen/polymarket-proxy)
**NPM Package**: `@hk/polymarket`
**Language**: TypeScript
**Type Safety**: Full TypeScript support with OpenAPI schema

**Installation**:
```bash
npm install @hk/polymarket
```

**Features**:
- Complete SDK and proxy server
- GammaSDK for market data
- PolymarketSDK for trading
- WebSocket real-time streaming
- End-to-end type safety
- OpenAPI documentation
- BuilderConfig authentication (recommended)
- Legacy private key authentication

**SDK Components**:
```typescript
import {
  GammaSDK,           // Market data and analytics
  PolymarketSDK,      // Trading operations
  DataSDK,            // User portfolio data
  BuilderConfig       // Authentication configuration
} from "@hk/polymarket";
```

**Basic Usage - GammaSDK (Market Data)**:
```typescript
import { GammaSDK } from "@hk/polymarket";

const gamma = new GammaSDK();

// Get active markets
const markets = await gamma.getMarkets({
  active: true,
  limit: 100
});

// Get specific market
const market = await gamma.getMarket(marketId);

// Get market price history
const prices = await gamma.getMarketPriceHistory(marketId);
```

**Basic Usage - PolymarketSDK (Trading)**:
```typescript
import { PolymarketSDK, BuilderConfig } from "@hk/polymarket";

// Method 1: BuilderConfig (Recommended)
const builderConfig = new BuilderConfig({
  localBuilderCreds: {
    key: "your_api_key",
    secret: "your_secret",
    passphrase: "your_passphrase",
  },
});

const sdk = new PolymarketSDK({
  builderConfig,
});

// Method 2: Remote Builder
const builderConfig = new BuilderConfig({
  remoteBuilderConfig: {
    url: "http://localhost:3000/sign",
  },
});

// Method 3: Legacy (Not Recommended)
const sdkLegacy = new PolymarketSDK({
  privateKey: process.env.POLYMARKET_KEY!,
  funderAddress: process.env.POLYMARKET_FUNDER!,
  host: "https://clob.polymarket.com",
  chainId: 137
});
```

**DataSDK (Portfolio & Analytics)**:
```typescript
import { DataSDK } from "@hk/polymarket";

const data = new DataSDK();
const userAddress = "0x9fc4da94a5175e9c1a0eaca45bb2d6f7a0d27bb2";

// Check API health
const health = await data.healthCheck();

// Get current positions
const positions = await data.getCurrentPositions({
  user: userAddress,
  limit: 50,
  offset: 0
});

// Get closed positions with PnL
const closedPositions = await data.getClosedPositions({
  user: userAddress,
  limit: 100
});

// Get user activity
const activity = await data.getUserActivity({
  user: userAddress,
  limit: 20,
  sortBy: "TIMESTAMP",
  sortDirection: "DESC"
});

// Get trades
const trades = await data.getTrades({
  market: "market-condition-id",
  limit: 50,
  maker_address: userAddress
});

// Get portfolio summary
const portfolio = await data.getPortfolioSummary(userAddress);
console.log("Portfolio Summary:");
console.log(`  Total Value: $${portfolio.totalValue[0]?.value || 0}`);
console.log(`  Markets Traded: ${portfolio.marketsTraded.traded}`);
console.log(`  Active Positions: ${portfolio.currentPositions.length}`);
```

**Authentication Migration**:
```typescript
// Old way (Legacy):
const sdkOld = new PolymarketSDK({
  privateKey: "0x...",
  funderAddress: "0x...",
});

// New way (BuilderConfig - Recommended):
const builderConfig = new BuilderConfig({
  remoteBuilderConfig: {
    url: "http://localhost:3000/sign",
  },
});

const sdkNew = new PolymarketSDK({
  builderConfig,
});
```

### polymarket-py-clob-client (Python)

**Repository**: [polymarket/py-clob-client](https://github.com/polymarket/py-clob-client)
**Language**: Python
**Purpose**: Python client for CLOB API

**Installation**:
```bash
pip install polymarket-py-clob-client
```

**Features**:
- Order placement and cancellation
- Balance queries
- Trade history
- CLOB API integration
- Polygon chain support

### polymarket-apis (Python)

**Repository**: [qualiaenjoyer/polymarket-apis](https://github.com/qualiaenjoyer/polymarket-apis)
**Language**: Python
**Purpose**: Unified Python client library

**Features**:
- Pydantic data validation
- Order book operations
- Market/event data
- Portfolio management
- Blockchain interactions
- Unified API interface

### poly-market-sdk (Go)

**Repository**: [mtt-labs/poly-market-sdk](https://github.com/mtt-labs/poly-market-sdk)
**Language**: Go
**Purpose**: Go SDK with CLOB API

**Features**:
- CLOB API implementation
- Order management
- Market data fetching
- Polygon blockchain integration

### poly-sdk (TypeScript - Advanced)

**Repository**: [cyl19970726/poly-sdk](https://github.com/cyl19970726/poly-sdk)
**Language**: TypeScript
**Purpose**: Comprehensive TypeScript SDK

**Features**:
- Trading operations
- Market data
- Smart money analysis
- On-chain operations
- Real-time streaming
- Arbitrage detection
- Advanced analytics

## Comparison Table

| SDK | Language | Type | Features | Auth | Active |
|-----|----------|------|----------|------|--------|
| @polymarket/clob-client | TS/JS | Official | Trading + WebSocket | L1/L2 | ✅ |
| real-time-data-client | TS/JS | Official | WebSocket only | L1/L2 | ✅ |
| @hk/polymarket | TS/JS | Community | Full-featured SDK | BuilderConfig | ✅ |
| py-clob-client | Python | Official | CLOB trading | L1/L2 | ✅ |
| polymarket-apis | Python | Community | Unified client | L1/L2 | ✅ |
| poly-market-sdk | Go | Community | CLOB API | L1/L2 | ✅ |
| poly-sdk | TS/JS | Community | Advanced features | L1/L2 | ✅ |

## Choosing an SDK

### For Market Data Only
- **@hk/polymarket (GammaSDK)**: TypeScript, market data
- **Direct Gamma API**: REST API, no SDK needed

### For Trading
- **@polymarket/clob-client**: Official, minimal dependencies
- **@hk/polymarket (PolymarketSDK)**: Full-featured, BuilderConfig

### For Real-Time Data
- **@hk/polymarket**: WebSocket support included
- **real-time-data-client**: Official WebSocket client

### For Analytics/Portfolio
- **@hk/polymarket (DataSDK)**: Complete portfolio analytics
- **Direct API**: Custom implementation

## Authentication Methods

### L1: Private Key (Legacy)
```typescript
const sdk = new PolymarketSDK({
  privateKey: "0x...",
  funderAddress: "0x...",
  host: "https://clob.polymarket.com",
  chainId: 137
});
```

### L2: API Key (Recommended)
```typescript
const builderConfig = new BuilderConfig({
  localBuilderCreds: {
    key: "your_api_key",
    secret: "your_secret",
    passphrase: "your_passphrase",
  },
});

const sdk = new PolymarketSDK({
  builderConfig,
});
```

### Remote Builder
```typescript
const builderConfig = new BuilderConfig({
  remoteBuilderConfig: {
    url: "http://localhost:3000/sign",
  },
});
```

## Quick Start Examples

### Fetch Market Data
```typescript
import { GammaSDK } from "@hk/polymarket";

const gamma = new GammaSDK();
const markets = await gamma.getMarkets({ active: true });
console.log(`Found ${markets.length} active markets`);
```

### Place a Trade
```typescript
import { PolymarketSDK, BuilderConfig } from "@hk/polymarket";

const config = new BuilderConfig({
  localBuilderCreds: {
    key: process.env.POLY_API_KEY!,
    secret: process.env.POLY_API_SECRET!,
    passphrase: process.env.POLY_API_PASSPHRASE!,
  },
});

const sdk = new PolymarketSDK({ builderConfig: config });

// Place order
const order = await sdk.placeOrder({
  tokenId: "0x...",
  side: "BUY",
  price: 0.75,
  size: 10
});
```

### Monitor Portfolio
```typescript
import { DataSDK } from "@hk/polymarket";

const data = new DataSDK();
const portfolio = await data.getPortfolioSummary(address);
console.log(`Portfolio Value: $${portfolio.totalValue}`);
```

## Resources

- [Official Documentation](https://docs.polymarket.com/developers)
- [Gamma Markets API](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [CLOB API](https://docs.polymarket.com/developers/CLOB/authentication)
- [GitHub: Polymarket](https://github.com/Polymarket)
- [Community SDKs](https://github.com/topics/polymarket-api?l=typescript)

## Breaking Changes (2025)

### September 15, 2025
- WebSocket price change message format updated
- Migration guide available
- Update SDKs to latest versions

See: [Migration Guide](https://docs.polymarket.com/developers/CLOB/websocket/market-channel-migration-guide)

---

**Last Updated**: 2026-01-10
**Supported Languages**: TypeScript, JavaScript, Python, Go
