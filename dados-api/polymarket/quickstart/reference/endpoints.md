# Endpoints - Polymarket Documentation

> Fonte: https://docs.polymarket.com/quickstart/quickstart/reference/endpoints
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


All base URLs for Polymarket APIs. See individual API documentation for available routes and parameters.

---

## REST APIs

| API | Base URL | Description |
| --- | --- | --- |
| __CLOB API__ | `https://clob.polymarket.com` | Order management, prices, orderbooks |
| __Gamma API__ | `https://gamma-api.polymarket.com` | Market discovery, metadata, events |
| __Data API__ | `https://data-api.polymarket.com` | User positions, activity, history |

---

## WebSocket Endpoints

| Service | URL | Description |
| --- | --- | --- |
| __CLOB WebSocket__ | `wss://ws-subscriptions-clob.polymarket.com/ws/` | Orderbook updates, order status |
| __RTDS__ | `wss://ws-live-data.polymarket.com` | Low-latency crypto prices, comments |

---

## Quick Reference

### CLOB API

```
https://clob.polymarket.com
```

Common endpoints:

- `GET /price` — Get current price for a token
- `GET /book` — Get orderbook for a token
- `GET /midpoint` — Get midpoint price
- `POST /order` — Place an order (auth required)
- `DELETE /order` — Cancel an order (auth required)

Full CLOB documentation →

### Gamma API

```
https://gamma-api.polymarket.com
```

Common endpoints:

- `GET /events` — List events
- `GET /markets` — List markets
- `GET /events/{id}` — Get event details

Full Gamma documentation →

### Data API

```
https://data-api.polymarket.com
```

Common endpoints:

- `GET /positions` — Get user positions
- `GET /activity` — Get user activity
- `GET /trades` — Get trade history

Full Data API documentation →

### CLOB WebSocket

```
wss://ws-subscriptions-clob.polymarket.com/ws/
```

Channels:

- `market` — Orderbook and price updates (public)
- `user` — Order status updates (authenticated)

Full WebSocket documentation →

### RTDS (Real-Time Data Stream)

```
wss://ws-live-data.polymarket.com
```

Channels:

- Crypto price feeds
- Comment streams

Full RTDS documentation →
