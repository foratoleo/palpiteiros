> Source: https://docs.polymarket.com/developers
> Fetched: 2026-01-10
> Category: API Documentation

# Polymarket API Overview

The Polymarket API provides comprehensive access to prediction market data, trading functionality, and real-time updates through multiple endpoints and services.

## API Services

### 1. Gamma Markets API (REST API)
**Purpose**: Read-only market data and indexing
**Base URL**: `https://gamma-api.polymarket.com`
**Authentication**: Not required (public endpoints)

**Key Features**:
- Market metadata and indexing
- Event/condition mapping
- Volume and liquidity data
- Outcome token metadata
- Market filtering and sorting
- Historical market data

**Use Cases**:
- Building market explorers
- Data analysis and analytics
- Market monitoring
- Price tracking

### 2. CLOB API (Central Limit Order Book)
**Purpose**: Trading operations and order management
**Base URL**: `https://clob.polymarket.com`
**Chain ID**: 137 (Polygon)

**Authentication**:
- **L1 (Private Key)**: Wallet-based authentication
- **L2 (API Key)**: API credentials (apiKey, secret, passphrase)
- Public methods: No authentication required
- Protected methods: HMAC-SHA256 signing required

**Key Features**:
- Place and cancel orders
- Check balances and allowances
- Query open orders
- Fetch trade history
- Manage user positions

### 3. WebSocket API
**Purpose**: Real-time market data streaming
**Endpoint**: Market channels for live updates

**Key Features**:
- Real-time price updates
- Order book changes
- Trade notifications
- Market status updates
- Low-latency data delivery

**Migration Note**:
- **Breaking Change**: September 15, 2025 at 11 PM UTC
- See: [Price Change Message Migration Guide](https://docs.polymarket.com/developers/CLOB/websocket/market-channel-migration-guide)

### 4. Data SDK
**Purpose**: User portfolio and activity data
**Base URL**: Via SDK or API endpoints

**Key Features**:
- Current positions
- Closed positions
- User activity logs
- Trade history
- Portfolio analytics
- PnL calculations

## API Endpoints Summary

### Gamma API Endpoints
```
GET /markets - List all markets with filtering
GET /events - Get event information
GET /markets?active=true - Active markets only
```

### CLOB API Endpoints
```
GET /markets - Get market details (paginated)
GET /markets/simplified - Simplified market data
GET /trades - Get trade history
POST /auth/api-key - Generate API credentials
POST /order - Place order
DELETE /order - Cancel order
```

## Quick Start Examples

### Fetch Active Markets (Gamma API)
```typescript
const response = await fetch(
  "https://gamma-api.polymarket.com/markets?active=true"
);
const markets = await response.json();
```

### Initialize CLOB Client
```typescript
import { ClobClient } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://clob.polymarket.com",
  137, // Polygon chain ID
  signer // Wallet signer
);
```

### Generate API Credentials
```typescript
const credentials = await client.deriveApiKey();
console.log("API Key:", credentials.key);
console.log("Secret:", credentials.secret);
console.log("Passphrase:", credentials.passphrase);
```

## Response Formats

### Market Object Structure
```json
{
  "condition_id": "0x123...",
  "question": "Will ETH price be above $3000?",
  "description": "Market description",
  "tokens": [
    {
      "outcome": "Yes",
      "price": 0.75,
      "token_id": "0xabc...yes"
    },
    {
      "outcome": "No",
      "price": 0.25,
      "token_id": "0xabc...no"
    }
  ],
  "volume": "100000",
  "liquidity": "50000",
  "end_date_iso": "2024-12-31T23:59:59Z",
  "active": true,
  "closed": false
}
```

## Trade Statuses

| Status    | Terminal | Description |
| --------- | -------- | ----------- |
| MATCHED   | No       | Trade matched, submitted to executor |
| MINED     | No       | Trade mined, no finality threshold |
| CONFIRMED | Yes      | Trade achieved finality, successful |
| RETRYING  | No       | Trade failed, being retried |
| FAILED    | Yes      | Trade failed, not retrying |

## Rate Limits & Best Practices

1. **Public Endpoints**: No authentication, moderate rate limits
2. **Authenticated Endpoints**: Use API key credentials, respect rate limits
3. **WebSocket**: Single connection per application recommended
4. **Pagination**: Use `limit` and `offset` for large datasets
5. **Caching**: Implement caching for market metadata

## Error Handling

Common HTTP status codes:
- `200`: Success
- `400`: Bad request (invalid parameters)
- `401`: Unauthorized (missing/invalid credentials)
- `429`: Rate limit exceeded
- `500`: Internal server error

## Additional Resources

- [Gamma API Overview](https://docs.polymarket.com/developers/gamma-markets-api/overview)
- [CLOB Authentication](https://docs.polymarket.com/developers/CLOB/authentication)
- [WebSocket Market Channel](https://docs.polymarket.com/developers/CLOB/websocket/market-channel)
- [GitHub: Polymarket/real-time-data-client](https://github.com/Polymarket/real-time-data-client)
- [Changelog](https://docs.polymarket.com/changelog/changelog)

## Authentication Details

### L1 Authentication (Private Key)
- Uses wallet private key
- For initial API key generation
- Requires Polygon wallet (chain ID 137)

### L2 Authentication (API Key)
- API credentials derived from L1
- HMAC-SHA256 request signing
- Required for protected operations:
  - Cancel orders
  - Check balances
  - Post signed orders

## Market Data Filters

Available filters for `/markets` endpoint:
- `id`: Filter by market IDs
- `slug`: Filter by market slugs
- `tag_id`: Filter by tag category
- `liquidity_num_min/max`: Liquidity range
- `volume_num_min/max`: Volume range
- `start_date_min/max`: Date range
- `end_date_min/max`: End date range
- `closed`: Include closed markets
- `active`: Active markets only
- `order`: Sort field
- `ascending`: Sort direction

---

**Last Updated**: 2026-01-10
**API Version**: v2
