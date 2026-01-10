# Builder Program Introduction - Polymarket Documentation

> Fonte: https://docs.polymarket.com/developers/builders/builder-intro
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


## What is a Builder?

A "builder" is a person, group, or organization that routes orders from their users to Polymarket. If you've created a platform that allows users to trade on Polymarket via your system, this program is for you.

---

## Program Benefits

### Relayer Access

We expose our relayer to builders, providing gasless transactions for users with Polymarket's Proxy Wallets deployed via Relayer Client. When transactions are routed through proxy wallets, Polymarket pays all gas fees for:

- Deploying Gnosis Safe Wallets or Custom Proxy (Magic Link users) Wallets
- Token approvals (USDC, outcome tokens)
- CTF operations (split, merge, redeem)
- Order execution (via CLOB API)

### Trading Attribution

Attach custom headers to orders to identify your builder account:

- Orders attributed to your builder account
- Compete on the Builder Leaderboard for grants
- Track performance via the Data API
  - Leaderboard API: Get aggregated builder rankings for a time period
  - Volume API: Get daily time-series volume data for trend analysis

---

## Getting Started

1. **Get Builder Credentials**: Generate API keys from your Builder Profile
2. **Configure Order Attribution**: Set up CLOB client to credit trades to your account (guide)
3. **Enable Gasless Transactions**: Use the Relayer for gas-free wallet deployment and trading (guide)

---

## SDKs & Libraries

Complete documentation and examples for integrating with the Polymarket Builder Program.
