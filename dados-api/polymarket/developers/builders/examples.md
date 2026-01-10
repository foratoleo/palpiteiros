# Examples - Polymarket Documentation

> Fonte: https://docs.polymarket.com/developers/builders/examples
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Complete Next.js applications demonstrating Polymarket builder integration

## Overview

These open-source demo applications show how to integrate Polymarket's CLOB Client and Builder Relayer Client for gasless trading with builder order attribution.

## Authentication

Multiple wallet providers

## Gasless Trading

Safe & Proxy wallet support

## Full Integration

Orders, positions, CTF ops

---

## Safe Wallet Examples

Deploy Gnosis Safe wallets for your users:

### wagmi + Safe

MetaMask, Phantom, Rabby, and other browser wallets

### Privy + Safe

Privy embedded wallets

### Magic Link + Safe

Magic Link email/social authentication

### Turnkey + Safe

Turnkey embedded wallets

---

## What Each Demo Covers

- **Authentication**
  - User sign-in via wallet provider
  - User API credential derivation (L2 auth)
  - Builder config with remote signing
  - Signature types for Safe vs Proxy wallets

- **Wallet Operations**
  - Safe wallet deployment via Relayer
  - Batch token approvals (USDC.e + outcome tokens)
  - CTF operations (split, merge, redeem)
  - Transaction monitoring

- **Trading**
  - CLOB client initialization
  - Order placement with builder attribution
  - Position and order management
  - Market discovery via Gamma API

---

## Related Documentation

- [Relayer Client](https://docs.polymarket.com/developers/builders/relayer-client)
- [CLOB Introduction](https://docs.polymarket.com/developers/CLOB/introduction)
