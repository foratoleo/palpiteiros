# Polymarket Developer Documentation

> **Fonte:** https://docs.polymarket.com
> **Complete offline reference** extracted from docs.polymarket.com
> **Extracted:** 2026-01-07
> **Total pages:** 35 core documents + 12 additional resources

---

## 📚 Quick Navigation

### 🚀 [Quickstart](./quickstart/)
Get started with Polymarket APIs in minutes
- [Overview](./quickstart/overview.md) - Introduction to Polymarket APIs
- [Fetching Data](./quickstart/fetching-data.md) - Access market data without authentication
- [First Order](./quickstart/first-order.md) - Place your first trade
- [Rate Limits](./quickstart/introduction/rate-limits.md) - API throttling rules
- [Glossary](./quickstart/reference/glossary.md) - Key terms and concepts
- [Endpoints](./quickstart/reference/endpoints.md) - API base URLs

### 💼 [Market Makers](./developers/market-makers/)
Liquidity providers and automated trading
- [Introduction](./developers/market-makers/introduction.md) - Overview of market making
- [Setup](./developers/market-makers/setup.md) - Wallet deployment and configuration
- [Trading](./developers/market-makers/trading.md) - Order entry and best practices
- [Data Feeds](./developers/market-makers/data-feeds.md) - WebSocket and real-time data
- [Inventory](./developers/market-makers/inventory.md) - Token splitting/merging
- [Liquidity Rewards](./developers/market-makers/liquidity-rewards.md) - Incentive programs
- [Maker Rebates](./developers/market-makers/maker-rebates-program.md) - Fee rebates

### 🏗️ [Builders Program](./developers/builders/)
Build trading applications for users
- [Introduction](./developers/builders/builder-intro.md) - Program overview
- [Builder Profile](./developers/builders/builder-profile.md) - API keys and setup
- [Builder Tiers](./developers/builders/builder-tiers.md) - Verification levels
- [Order Attribution](./developers/builders/order-attribution.md) - Credit for orders
- [Examples](./developers/builders/examples.md) - Integration examples

### 📊 [CLOB - Order Book](./developers/CLOB/)
Central Limit Order Book API
- [Introduction](./developers/CLOB/introduction.md) - System overview
- [Authentication](./developers/CLOB/authentication.md) - L1/L2 auth methods
- [Status](./developers/CLOB/status.md) - System status page
- [Geoblock](./developers/CLOB/geoblock.md) - Restricted countries
- **WebSocket:**
  - [Overview](./developers/CLOB/websocket/wss-overview.md) - WebSocket guide
  - [Authentication](./developers/CLOB/websocket/wss-auth.md) - WebSocket auth
  - [Market Channel](./developers/CLOB/websocket/market-channel.md) - Order book updates
  - [User Channel](./developers/CLOB/websocket/user-channel.md) - Private fills

### 🔧 [CTF - Conditional Tokens](./developers/CTF/)
Token framework for outcomes
- [Overview](./developers/CTF/overview.md) - Framework introduction
- [Split](./developers/CTF/split.md) - Split USDC into outcome tokens
- [Merge](./developers/CTF/merge.md) - Merge tokens back to USDC
- [Redeem](./developers/CTF/redeem.md) - Redeem winning tokens

### 🌐 [Gamma API](./developers/gamma-markets-api/)
Market metadata and discovery
- [Overview](./developers/gamma-markets-api/overview.md) - API introduction
- [Fetch Markets](./developers/gamma-markets-api/fetch-markets-guide.md) - Query strategies

### 📡 [RTDS - Real-Time Data](./developers/RTDS/)
WebSocket streaming service
- [Overview](./developers/RTDS/RTDS-overview.md) - Real-time data socket

### ⚠️ [Negative Risk](./developers/neg-risk/)
Multi-outcome markets
- [Overview](./developers/neg-risk/overview.md) - Negative risk architecture

### 🌉 [Bridge](./developers/misc-endpoints/)
Cross-chain operations
- [Bridge Overview](./developers/misc-endpoints/bridge-overview.md) - Token bridging

---

## 🔑 Key Concepts

### Market Structure
```
Event (e.g., "US Election 2024")
└── Markets (per outcome)
    ├── YES Tokens
    └── NO Tokens
```

### Token Operations
1. **Split**: Convert 1 USDC → 1 YES + 1 NO
2. **Trade**: Buy/sell tokens on CLOB
3. **Merge**: Convert 1 YES + 1 NO → 1 USDC
4. **Redeem**: Convert winning tokens → 1 USDC each

### API Hierarchy
- **Gamma API**: Market discovery & metadata
- **CLOB API**: Order placement & order book
- **CTF Contracts**: Token operations (on-chain)
- **Data API**: User positions & history

---

## 📖 Documentation Map

```
polymarket/
├── quickstart/           # Getting started guides
│   ├── introduction/     # Rate limits
│   └── reference/        # Glossary & endpoints
│
├── developers/
│   ├── market-makers/    # Liquidity providers
│   ├── builders/         # Trading apps
│   ├── CLOB/             # Order book API
│   │   └── websocket/    # Real-time feeds
│   ├── CTF/              # Token framework
│   ├── gamma-markets-api/# Market metadata
│   ├── RTDS/             # Real-time data
│   ├── neg-risk/         # Multi-outcome markets
│   └── misc-endpoints/   # Bridge & other
│
└── extras/               # Additional resources (not in official list)
```

---

## 🚀 Quick Start Paths

### For Individual Traders
1. Read [Quickstart Overview](./quickstart/overview.md)
2. Learn [Fetching Data](./quickstart/fetching-data.md)
3. Place [First Order](./quickstart/first-order.md)
4. Check [Rate Limits](./quickstart/introduction/rate-limits.md)

### For Market Makers
1. Read [MM Introduction](./developers/market-makers/introduction.md)
2. Complete [Setup](./developers/market-makers/setup.md)
3. Learn [Trading](./developers/market-makers/trading.md)
4. Configure [Data Feeds](./developers/market-makers/data-feeds.md)
5. Manage [Inventory](./developers/market-makers/inventory.md)

### For Application Builders
1. Read [Builder Program](./developers/builders/builder-intro.md)
2. Create [Builder Profile](./developers/builders/builder-profile.md)
3. Understand [Order Attribution](./developers/builders/order-attribution.md)
4. Study [Examples](./developers/builders/examples.md)
5. Integrate [CLOB API](./developers/CLOB/introduction.md)

---

## 📊 Statistics

- **Total Core Documents**: 35
- **Additional Resources**: 12
- **Main Sections**: 9
- **API Endpoints**: 3 (CLOB, Gamma, Data)
- **WebSocket Services**: 2 (CLOB, RTDS)

---

## ⚡ Popular APIs

### Most Used Endpoints
1. **GET /markets** - Fetch market data (Gamma)
2. **POST /order** - Place order (CLOB)
3. **GET /orderbook** - Get order book (CLOB)
4. **WebSocket /market** - Real-time prices (CLOB WS)

### Key Contracts
- **CTF**: `0x4d97dcd97ec945f40cf65f87097ace5ea0476045`
- **NegRisk Adapter**: `0xd91E80cF2E7be2e162c6513ceD06f1dD0dA35296`
- **USDCe**: `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174`

---

## 🔗 External Links

- **Polymarket**: https://polymarket.com
- **Official Docs**: https://docs.polymarket.com
- **GitHub**: https://github.com/polymarket

---

## 📝 Notes

### Duplicate Files
Some documents exist in multiple locations:
- `clob/` vs `developers/CLOB/` - Use `developers/CLOB/` (canonical)
- `ctf/` vs `developers/CTF/` - Use `developers/CTF/` (canonical)

### Version Info
- Extracted from: https://docs.polymarket.com
- Extraction date: 2026-01-07
- Format: Markdown with syntax highlighting
- Base URL: https://gamma-api.polymarket.com

---

**Status**: ✅ Complete and validated
