# WebSocket Market Channel

> Fonte: https://docs.polymarket.com/developers/CLOB/websocket/market-channel
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


> Fonte: https://docs.polymarket.com/developers/CLOB/websocket/market-channel
> Baixado em: 2026-01-07

Public channel for updates related to market updates (level 2 price data).

---

## Subscribe

```json
{
  "event_type": "subscribe",
  "channel": "market"
}
```

---

## Message Types

### book Message

**Emitted When:**
- First subscribed to a market
- When there is a trade that affects the book

#### Structure

| Name | Type | Description |
| --- | --- | --- |
| event_type | string | "book" |
| asset_id | string | asset ID (token ID) |
| market | string | condition ID of market |
| timestamp | string | unix timestamp the current book generation in milliseconds |
| hash | string | hash summary of the orderbook content |
| buys | OrderSummary[] | list of type (size, price) aggregate book levels for buys |
| sells | OrderSummary[] | list of type (size, price) aggregate book levels for sells |

Where a `OrderSummary` object is of the form:

| Name | Type | Description |
| --- | --- | --- |
| price | string | size available at that price level |
| size | string | price of the orderbook level |

#### Example

```json
{
  "event_type": "book",
  "asset_id": "65818619657568813474341868652308942079804919287380422192892211131408793125422",
  "market": "0xbd31dc8a20211944f6b70f31557f1001557b59905b7738480ca09bd4532f84af",
  "bids": [
    { "price": ".48", "size": "30" },
    { "price": ".49", "size": "20" },
    { "price": ".50", "size": "15" }
  ],
  "asks": [
    { "price": ".52", "size": "25" },
    { "price": ".53", "size": "60" },
    { "price": ".54", "size": "10" }
  ],
  "timestamp": "123456789000",
  "hash": "0x0...."
}
```

---

### price_change Message

**⚠️ Breaking Change Notice:** The price_change message schema will be updated on September 15, 2025 at 11 PM UTC. Please see the migration guide for details.

**Emitted When:**
- A new order is placed
- An order is cancelled

#### Structure

| Name | Type | Description |
| --- | --- | --- |
| event_type | string | "price_change" |
| market | string | condition ID of market |
| price_changes | PriceChange[] | array of price change objects |
| timestamp | string | unix timestamp in milliseconds |

Where a `PriceChange` object is of the form:

| Name | Type | Description |
| --- | --- | --- |
| asset_id | string | asset ID (token ID) |
| price | string | price level affected |
| size | string | new aggregate size for price level |
| side | string | "BUY" or "SELL" |
| hash | string | hash of the order |
| best_bid | string | current best bid price |
| best_ask | string | current best ask price |

#### Example

```json
{
  "market": "0x5f65177b394277fd294cd75650044e32ba009a95022d88a0c1d565897d72f8f1",
  "price_changes": [
    {
      "asset_id": "71321045679252212594626385532706912750332728571942532289631379312455583992563",
      "price": "0.5",
      "size": "200",
      "side": "BUY",
      "hash": "56621a121a47ed9333273e21c83b660cff37ae50",
      "best_bid": "0.5",
      "best_ask": "1"
    },
    {
      "asset_id": "52114319501245915516055106046884209969926127482827954674443846427813813222426",
      "price": "0.5",
      "size": "200",
      "side": "SELL",
      "hash": "1895759e4df7a796bf4f1c5a5950b748306923e2",
      "best_bid": "0",
      "best_ask": "0.5"
    }
  ],
  "timestamp": "1757908892351",
  "event_type": "price_change"
}
```

---

### tick_size_change Message

**Emitted When:**
- The minimum tick size of the market changes. This happens when the book's price reaches the limits: price > 0.96 or price < 0.04

#### Structure

| Name | Type | Description |
| --- | --- | --- |
| event_type | string | "price_change" |
| asset_id | string | asset ID (token ID) |
| market | string | condition ID of market |
| old_tick_size | string | previous minimum tick size |
| new_tick_size | string | current minimum tick size |
| side | string | buy/sell |
| timestamp | string | time of event |

#### Example

```json
{
  "event_type": "tick_size_change",
  "asset_id": "65818619657568813474341868652308942079804919287380422192892211131408793125422",
  "market": "0xbd31dc8a20211944f6b70f31557f1001557b59905b7738480ca09bd4532f84af",
  "old_tick_size": "0.01",
  "new_tick_size": "0.001",
  "timestamp": "100000000"
}
```

---

### last_trade_price Message

**Emitted When:**
- When a maker and taker order is matched creating a trade event.

#### Example

```json
{
  "asset_id": "114122071509644379678018727908709560226618148003371446110114509806601493071694",
  "event_type": "last_trade_price",
  "fee_rate_bps": "0",
  "market": "0x6a67b9d828d53862160e470329ffea5246f338ecfffdf2cab45211ec578b0347",
  "price": "0.456",
  "side": "BUY",
  "size": "219.217767",
  "timestamp": "1750428146322"
}
```

---

### best_bid_ask Message

**Emitted When:**
- The best bid and ask prices for a market change.

(This message is behind the `custom_feature_enabled` flag)

#### Structure

| Name | Type | Description |
| --- | --- | --- |
| event_type | string | "best_bid_ask" |
| market | string | condition ID of market |
| asset_id | string | asset ID (token ID) |
| best_bid | string | current best bid price |
| best_ask | string | current best ask price |
| spread | string | spread between best bid and best ask |
| timestamp | string | unix timestamp in milliseconds |

#### Example

```json
{
  "event_type": "best_bid_ask",
  "market": "0x0005c0d312de0be897668695bae9f32b624b4a1ae8b140c49f08447fcc74f442",
  "asset_id": "85354956062430465315924116860125388538595433819574542752031640332592237464430",
  "best_bid": "0.73",
  "best_ask": "0.77",
  "spread": "0.04",
  "timestamp": "1766789469958"
}
```

---

### new_market Message

**Emitted When:**
- A new market is created.

(This message is behind the `custom_feature_enabled` flag)

#### Structure

| Name | Type | Description |
| --- | --- | --- |
| id | string | market ID |
| question | string | market question |
| market | string | condition ID of market |
| slug | string | market slug |
| description | string | market description |
| assets_ids | string[] | list of asset IDs |
| outcomes | string[] | list of outcomes |
| event_message | object | event message object |
| timestamp | string | unix timestamp in milliseconds |
| event_type | string | "new_market" |

Where a `EventMessage` object is of the form:

| Name | Type | Description |
| --- | --- | --- |
| id | string | event message ID |
| ticker | string | event message ticker |
| slug | string | event message slug |
| title | string | event message title |
| description | string | event message description |

#### Example

```json
{
  "id": "1031769",
  "question": "Will NVIDIA (NVDA) close above $240 end of January?",
  "market": "0x311d0c4b6671ab54af4970c06fcf58662516f5168997bdda209ec3db5aa6b0c1",
  "slug": "nvda-above-240-on-january-30-2026",
  "description": "This market will resolve to \"Yes\" if the official closing price for NVIDIA (NVDA) on the final trading day of January 2026 is higher than the listed price. Otherwise, this market will resolve to \"No\".",
  "assets_ids": [
    "76043073756653678226373981964075571318267289248134717369284518995922789326425",
    "31690934263385727664202099278545688007799199447969475608906331829650099442770"
  ],
  "outcomes": [
    "Yes",
    "No"
  ],
  "event_message": {
    "id": "125819",
    "ticker": "nvda-above-in-january-2026",
    "slug": "nvda-above-in-january-2026",
    "title": "Will NVIDIA (NVDA) close above ___ end of January?",
    "description": "This market will resolve to \"Yes\" if the official closing price for NVIDIA (NVDA) on the final trading day of January 2026 is higher than the listed price."
  },
  "timestamp": "1766790415550",
  "event_type": "new_market"
}
```

---

### market_resolved Message

**Emitted When:**
- A market is resolved.

(This message is behind the `custom_feature_enabled` flag)

#### Structure

| Name | Type | Description |
| --- | --- | --- |
| id | string | market ID |
| question | string | market question |
| market | string | condition ID of market |
| slug | string | market slug |
| description | string | market description |
| assets_ids | string[] | list of asset IDs |
| outcomes | string[] | list of outcomes |
| winning_asset_id | string | winning asset ID |
| winning_outcome | string | winning outcome |
| event_message | object | event message object |
| timestamp | string | unix timestamp in milliseconds |
| event_type | string | "market_resolved" |

Where a `EventMessage` object is of the form:

| Name | Type | Description |
| --- | --- | --- |
| id | string | event message ID |
| ticker | string | event message ticker |
| slug | string | event message slug |
| title | string | event message title |
| description | string | event message description |

#### Example

```json
{
  "id": "1031769",
  "question": "Will NVIDIA (NVDA) close above $240 end of January?",
  "market": "0x311d0c4b6671ab54af4970c06fcf58662516f5168997bdda209ec3db5aa6b0c1",
  "slug": "nvda-above-240-on-january-30-2026",
  "description": "This market will resolve to \"Yes\" if the official closing price for NVIDIA (NVDA) on the final trading day of January 2026 is higher than the listed price. Otherwise, this market will resolve to \"No\".",
  "assets_ids": [
    "76043073756653678226373981964075571318267289248134717369284518995922789326425",
    "31690934263385727664202099278545688007799199447969475608906331829650099442770"
  ],
  "winning_asset_id": "76043073756653678226373981964075571318267289248134717369284518995922789326425",
  "winning_outcome": "Yes",
  "event_message": {
    "id": "125819",
    "ticker": "nvda-above-in-january-2026",
    "slug": "nvda-above-in-january-2026",
    "title": "Will NVIDIA (NVDA) close above ___ end of January?",
    "description": "This market will resolve to \"Yes\" if the official closing price for NVIDIA (NVDA) on the final trading day of January 2026 is higher than the listed price."
  },
  "timestamp": "1766790415550",
  "event_type": "market_resolved"
}
```

---

## Connection Example

```javascript
const ws = new WebSocket('wss://ws-subscriptions-clob.polymarket.com');

ws.onopen = () => {
  // Subscribe to market channel
  ws.send(JSON.stringify({
    event_type: "subscribe",
    channel: "market"
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch(data.event_type) {
    case 'book':
      console.log('Order book snapshot:', data);
      break;
    case 'price_change':
      console.log('Price changed:', data);
      break;
    case 'last_trade_price':
      console.log('New trade:', data);
      break;
    case 'market_resolved':
      console.log('Market resolved:', data);
      break;
  }
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
};

ws.onclose = () => {
  console.log('WebSocket connection closed');
};
```

---

## See Also

- [CLOB Quickstart](../../../developers/CLOB/introduction.md)
- [Authentication](../../../developers/CLOB/authentication.md)
- [REST API](../../clob/rest-api.md)
