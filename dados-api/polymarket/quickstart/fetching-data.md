# Fetching Market Data

> Fonte: https://docs.polymarket.com/quickstart/quickstart/fetching-data
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Fetch Polymarket data in minutes with no authentication required

Get market data with zero setup. No API key, no authentication, no wallet required.

---

## Understanding the Data Model

Before fetching data, understand how Polymarket structures its markets:

```json
{
  "outcomes": "[\"Yes\", \"No\"]",
  "outcomePrices": "[\"0.20\", \"0.80\"]"
}
// Index 0: "Yes" → 0.20 (20% probability)
// Index 1: "No" → 0.80 (80% probability)
```

---

## Fetch Active Events

List all currently active events on Polymarket:

```bash
curl "https://gamma-api.polymarket.com/events?active=true&closed=false&limit=5"
```

### Example Response

```json
[
  {
    "id": "123456",
    "slug": "will-bitcoin-reach-100k-by-2025",
    "title": "Will Bitcoin reach $100k by 2025?",
    "active": true,
    "closed": false,
    "tags": [
      { "id": "21", "label": "Crypto", "slug": "crypto" }
    ],
    "markets": [
      {
        "id": "789",
        "question": "Will Bitcoin reach $100k by 2025?",
        "clobTokenIds": ["TOKEN_YES_ID", "TOKEN_NO_ID"],
        "outcomes": "[\"Yes\", \"No\"]",
        "outcomePrices": "[\"0.65\", \"0.35\"]"
      }
    ]
  }
]
```

---

## Market Discovery Best Practices

### For Sports Events

Use the `/sports` endpoint to discover leagues, then query by `series_id`:

```bash
# Get all supported sports leagues
curl "https://gamma-api.polymarket.com/sports"

# Get events for a specific league (e.g., NBA series_id=10345)
curl "https://gamma-api.polymarket.com/events?series_id=10345&active=true&closed=false"

# Filter to just game bets (not futures) using tag_id=100639
curl "https://gamma-api.polymarket.com/events?series_id=10345&tag_id=100639&active=true&closed=false&order=startTime&ascending=true"
```

### For Non-Sports Topics

Use `/tags` to discover all available categories, then filter events:

```bash
# Get all available tags
curl "https://gamma-api.polymarket.com/tags?limit=100"

# Query events by topic
curl "https://gamma-api.polymarket.com/events?tag_id=2&active=true&closed=false"
```

---

## Get Market Details

Once you have an event, get details for a specific market using its ID or slug:

```bash
curl "https://gamma-api.polymarket.com/markets?slug=will-bitcoin-reach-100k-by-2025"
```

The response includes `clobTokenIds`, you'll need these to fetch prices and place orders.

---

## Get Current Price

Query the CLOB for the current price of any token:

```bash
curl "https://clob.polymarket.com/price?token_id=YOUR_TOKEN_ID&side=buy"
```

### Example Response

---

## Get Orderbook Depth

See all bids and asks for a market:

```bash
curl "https://clob.polymarket.com/book?token_id=YOUR_TOKEN_ID"
```

### Example Response

```json
{
  "market": "0x...",
  "asset_id": "YOUR_TOKEN_ID",
  "bids": [
    { "price": "0.64", "size": "500" },
    { "price": "0.63", "size": "1200" }
  ],
  "asks": [
    { "price": "0.66", "size": "300" },
    { "price": "0.67", "size": "800" }
  ]
}
```

---

## More Data APIs
