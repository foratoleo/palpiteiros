> Source: https://docs.polymarket.com/developers/CLOB
> Fetched: 2026-01-10
> Category: API Reference

# CLOB API Reference

The Central Limit Order Book (CLOB) API enables trading operations on Polymarket, including order placement, cancellation, and management.

## Base Configuration

- **Base URL**: `https://clob.polymarket.com`
- **Chain ID**: 137 (Polygon)
- **Required Package**: `@polymarket/clob-client`

## Authentication

### L1 Authentication (Private Key)
```typescript
import { ClobClient } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  signer // ethers.js signer
);
```

### L2 Authentication (API Key)
```typescript
// Derive API credentials from wallet
const credentials = await client.deriveApiKey();
console.log("API Key:", credentials.key);
console.log("Secret:", credentials.secret);
console.log("Passphrase:", credentials.passphrase);
```

**Credentials Response**:
```json
{
  "apiKey": "550e8400-e29b-41d4-a716-446655440000",
  "secret": "base64EncodedSecretString",
  "passphrase": "randomPassphraseString"
}
```

### Request Signing (L2)
For authenticated endpoints, sign requests using HMAC-SHA256:
- API Key: Identifier
- Secret: HMAC signing key
- Passphrase: Additional verification

## Endpoints

### Public Endpoints (No Authentication)

#### GET /markets
Get paginated list of markets with full details.

**Query Parameters**:
- `limit` (number): Max markets per page
- `offset` (number): Number of markets to skip

**Response**:
```json
{
  "limit": 10,
  "count": 100,
  "data": [
    {
      "condition_id": "0x123...",
      "question": "Will ETH price be above $3000?",
      "tokens": [
        {
          "outcome": "Yes",
          "price": 0.75,
          "token_id": "0xabc...yes"
        }
      ],
      "active": true,
      "closed": false
    }
  ]
}
```

#### GET /markets/simplified
Get simplified market data for performance.

**Response**:
```json
{
  "limit": 10,
  "count": 100,
  "data": [
    {
      "condition_id": "0x123...",
      "accepting_orders": true,
      "active": true,
      "tokens": [
        {
          "outcome": "Yes",
          "price": 0.75,
          "token_id": "0xabc...yes"
        }
      ]
    }
  ]
}
```

### Protected Endpoints (L2 Authentication Required)

#### POST /auth/api-key
Create new API credentials.

**Method**: POST
**Endpoint**: `{clob-endpoint}/auth/api-key`

**Response**:
```json
{
  "apiKey": "550e8400-e29b-41d4-a716-446655440000",
  "secret": "base64EncodedSecretString",
  "passphrase": "randomPassphraseString"
}
```

#### GET /trades
Get historical trade data.

**Query Parameters**:
- `status` (string): Filter by status (MATCHED, MINED, CONFIRMED, RETRYING, FAILED)
- `market_order_id` (string): Filter by order ID
- `match_time` (string): Filter by match time

**Response**:
```json
{
  "trades": [
    {
      "market_order_id": "0x123abc",
      "match_time": "2023-10-27T10:00:00Z",
      "bucket_index": 0,
      "status": "CONFIRMED",
      "amount": "100.50",
      "price": "1.23"
    }
  ]
}
```

## Trade Statuses

| Status    | Terminal | Description |
| --------- | -------- | ----------- |
| MATCHED   | No       | Trade matched and submitted to executor |
| MINED     | No       | Trade mined, awaiting finality |
| CONFIRMED | Yes      | Trade achieved probabilistic finality |
| RETRYING  | No       | Trade failed, being resubmitted |
| FAILED    | Yes      | Trade failed, not retrying |

## Order Types

### Limit Orders
- Execute at specified price or better
- Added to order book
- No execution guarantee

### Market Orders
- Execute immediately at current market price
- Taker orders (no rebates)
- Execution guaranteed if liquidity exists

## Fees

- **Maker Fee**: 0.1% (base fee)
- **Taker Fee**: 0.5% (base fee)
- **Rebates**: Available for market makers
- See: [Fees Documentation](https://docs.polymarket.com/trading/fees)

## Key Market Object Fields

| Field | Type | Description |
| ----- | ---- | ----------- |
| `condition_id` | string | Unique market identifier |
| `question` | string | Market question |
| `tokens` | array | Outcome tokens |
| `tokens[].outcome` | string | Outcome name (Yes/No) |
| `tokens[].price` | number | Current price (0-1) |
| `tokens[].token_id` | string | Token contract address |
| `active` | boolean | Market is active |
| `closed` | boolean | Market is closed |
| `end_date_iso` | string | ISO format end date |
| `volume` | string | Total volume |
| `liquidity` | string | Current liquidity |

## SDK Methods

### Public Methods
```typescript
// Get markets
const markets = await client.getMarkets({
  limit: 10,
  offset: 0
});

// Get simplified markets
const simplified = await client.getMarketsSimplified();

// Get specific market
const market = await client.getMarket(conditionId);
```

### Protected Methods (L2 Auth Required)
```typescript
// Place order
const order = await client.postOrder({
  token_id: tokenId,
  side: "BUY", // or "SELL"
  order_type: "LIMIT", // or "MARKET"
  price: "0.75",
  size: "10"
});

// Cancel order
await client.cancelOrder(orderId);

// Get open orders
const orders = await client.getOpenOrders({
  maker_address: userAddress
});

// Check balance
const balance = await client.getBalanceSummary(userAddress);
```

## Error Handling

### Common Errors
- `401 Unauthorized`: Invalid or missing credentials
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource doesn't exist
- `422 Unprocessable Entity`: Invalid parameters
- `429 Too Many Requests`: Rate limit exceeded

### Error Response Format
```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

## Rate Limits

- Public endpoints: 100 requests/minute
- Authenticated endpoints: 200 requests/minute
- WebSocket: 1 connection per application
- Use pagination for large datasets

## Best Practices

1. **Use SDK**: Always use official SDK for type safety
2. **Handle Errors**: Implement proper error handling
3. **Retry Logic**: Implement exponential backoff
4. **Webhook**: Use webhooks for async operations
5. **Test**: Use testnet before production

## Additional Resources

- [CLOB Authentication Guide](https://docs.polymarket.com/developers/CLOB/authentication)
- [Trades Overview](https://docs.polymarket.com/developers/CLOB/trades/trades-overview)
- [GitHub: @polymarket/clob-client](https://github.com/Polymarket/clob-client)
- [Gamma Markets API](https://docs.polymarket.com/developers/gamma-markets-api/overview)

---

**Last Updated**: 2026-01-10
**API Version**: v2
