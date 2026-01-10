# Trading

> Fonte: https://docs.polymarket.com/developers/market-makers/trading
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


CLOB order entry and management for market makers

## Overview

Market makers primarily interact with Polymarket through the CLOB (Central Limit Order Book) API to post and manage limit orders.

## Order Entry

### Posting Limit Orders

Use the CLOB client to create and post limit orders:

```javascript
import { ClobClient, Side, OrderType } from "@polymarket/clob-client";

const client = new ClobClient(
  "https://clob.polymarket.com",
  137,
  wallet,
  credentials,
  signatureType,
  funder
);

// Post a bid (buy order)
const bidOrder = await client.createAndPostOrder({
  tokenID: "34097058504275310827233323421517291090691602969494795225921954353603704046623",
  side: Side.BUY,
  price: 0.48,
  size: 1000,
  orderType: OrderType.GTC
});

// Post an ask (sell order)
const askOrder = await client.createAndPostOrder({
  tokenID: "34097058504275310827233323421517291090691602969494795225921954353603704046623",
  side: Side.SELL,
  price: 0.52,
  size: 1000,
  orderType: OrderType.GTC
});
```

See Create Order for full documentation.

### Batch Orders

For efficiency, post multiple orders in a single request:

```javascript
const orders = await Promise.all([
  client.createOrder({ tokenID, side: Side.BUY, price: 0.48, size: 500 }),
  client.createOrder({ tokenID, side: Side.BUY, price: 0.47, size: 500 }),
  client.createOrder({ tokenID, side: Side.SELL, price: 0.52, size: 500 }),
  client.createOrder({ tokenID, side: Side.SELL, price: 0.53, size: 500 })
]);

const response = await client.postOrders(
  orders.map(order => ({ order, orderType: OrderType.GTC }))
);
```

See Post Orders Batch for details.

## Order Types

| Type | Behavior | MM Use Case |
| --- | --- | --- |
| __GTC__ (Good Till Cancelled) | Rests on book until filled or cancelled | Default for passive quoting |
| __GTD__ (Good Till Date) | Auto-expires at specified time | Auto-expire before events |
| __FOK__ (Fill or Kill) | Fill entirely immediately or cancel | Aggressive rebalancing (all or nothing) |
| __FAK__ (Fill and Kill) | Fill available immediately, cancel rest | Partial rebalancing acceptable |

### When to Use Each

__For passive market making (maker orders):__

- __GTC__ - Standard quotes that sit on the book
- __GTD__ - Time-limited quotes (e.g., expire before market close)

__For rebalancing (taker orders):__

- __FOK__ - When you need exact size or nothing
- __FAK__ - When partial fills are acceptable

```javascript
// GTD example: expire in 1 hour
const expiringOrder = await client.createOrder({
  tokenID,
  side: Side.BUY,
  price: 0.50,
  size: 1000,
  orderType: OrderType.GTD,
  expiration: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
});
```

## Order Management

### Cancel Orders

Cancel individual orders or all orders:

```javascript
// Cancel single order
await client.cancelOrder(orderId);

// Cancel multiple orders in a single calls
await client.cancelOrders(orderIds: string[]);

// Cancel all orders for a market
await client.cancelMarketOrders(conditionId);

// Cancel all orders
await client.cancelAll();
```

See Cancel Orders for full documentation.

### Get Active Orders

Monitor your open orders:

```javascript
// Get active order
const order = await client.getOrder(orderId);

// Get active orders optionally filtered
const orders = await client.getOpenOrders({
  id?: string; // Order ID (hash)
  market?: string; // Market condition ID
  asset_id?: string; // Token ID
});
```

See Get Active Orders for details.

## Best Practices

### Quote Management

1. __Two-sided quoting__ - Post both bids and asks to earn maximum liquidity rewards
2. __Monitor inventory__ - Skew quotes based on your position
3. __Cancel stale quotes__ - Remove orders when market conditions change
4. __Use GTD for events__ - Auto-expire quotes before known events

### Latency Optimization

1. __Batch orders__ - Use `postOrders()` instead of multiple `createAndPostOrder()` calls
2. __WebSocket for data__ - Use WebSocket feeds instead of polling REST endpoints

### Risk Management

1. __Size limits__ - Check token balances before quoting; don't exceed inventory
2. __Price guards__ - Validate against book midpoint; reject outlier prices
3. __Kill switch__ - Use `cancelAll()` on error or position breach
4. __Monitor fills__ - Subscribe to WebSocket user channel for real-time fill updates

## Tick Sizes

Markets have different minimum price increments:

```javascript
const tickSize = await client.getTickSize(tokenID);
// Returns: "0.1" | "0.01" | "0.001" | "0.0001"
```

Ensure your prices conform to the market's tick size.

## Fee Structure

| Role | Fee |
| --- | --- |
| Maker | 0 bps |
| Taker | 0 bps |

Current fees are 0% for both makers and takers. See CLOB Introduction for fee calculation details.
