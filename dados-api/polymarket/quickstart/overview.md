# Developer Quickstart

> Fonte: https://docs.polymarket.com/quickstart/quickstart/overview
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Get started building with Polymarket APIs

Polymarket provides a suite of APIs and SDKs for building prediction market applications. This guide will help you understand what's available and where to find it.

---

## What Can You Build?

| If you want to… | Start here |
| --- | --- |
| Fetch markets & prices | Fetching Market Data |
| Place orders for yourself | Placing Your First Order |
| Build a trading app for users | Builders Program Introduction |
| Provide liquidity | Market Makers |

---

## APIs at a Glance

### Markets & Data

### Gamma API

__Market discovery & metadata__Fetch events, markets, categories, and resolution data. This is where you discover what's tradeable.`https://gamma-api.polymarket.com`

### CLOB API

__Prices, orderbooks & trading__Get real-time prices, orderbook depth, and place orders. The core trading API.`https://clob.polymarket.com`

### Data API

__Positions, activity & history__Query user positions, trade history, and portfolio data.`https://data-api.polymarket.com`

### WebSocket

__Real-time updates__Subscribe to orderbook changes, price updates, and order status.`wss://ws-subscriptions-clob.polymarket.com`

### Additional Data Sources

### RTDS

__Low-latency data stream__Real-time crypto prices and comments. Optimized for market makers.

### Subgraph

__Onchain queries__Query blockchain state directly via GraphQL.

### Trading Infrastructure

### CTF Operations

__Token split/merge/redeem__Convert between USDC and outcome tokens. Essential for inventory management.

### Relayer Client

__Gasless transactions__Builders can offer gasfree transactions via Polymarket's relayer.

---

## SDKs & Libraries

### CLOB Client (TypeScript)

`npm install @polymarket/clob-client`

### CLOB Client (Python)

`pip install py-clob-client`

For builders routing orders for users:

### Relayer Client

Gasless wallet operations

### Signing SDK

Builder authentication headers
