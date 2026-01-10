# Market Maker Introduction

> Fonte: https://docs.polymarket.com/developers/market-makers/introduction
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Overview of market making on Polymarket and available tools for liquidity providers

## What is a Market Maker?

A Market Maker (MM) on Polymarket is a sophisticated trader who provides liquidity to prediction markets by continuously posting bid and ask orders. By "laying the spread," market makers enable other users to trade efficiently while earning the spread as compensation for the risk they take.

Market makers are essential to Polymarket's ecosystem:

- __Provide liquidity__ across all markets
- __Tighten spreads__ for better user experience
- __Enable price discovery__ through continuous quoting
- __Absorb trading flow__ from retail and institutional users

__Not a Market Maker?__ If you're building an application that routes orders for your users, see the Builders Program instead. Builders get access to gasless transactions via the Relayer Client and can earn grants through order attribution.

## Getting Started

To become a market maker on Polymarket:

1. __Contact Polymarket__ - Email [email protected] to request acces to RFQ API
2. __Complete setup__ - Deploy wallets, fund with USDCe, set token approvals
3. __Connect to data feeds__ - WebSocket for orderbook, RTDS for low-latency data
4. __Start quoting__ - Post orders via CLOB REST API or respond to RFQ requests

### By Action Type

## Setup

Deposits, token approvals, wallet deployment, API keys

## Trading

CLOB order entry, order types, quoting best practices

## RFQ API

Request for Quote system for responding to large orders

## Data Feeds

WebSocket, RTDS, Gamma API, on-chain data

## Inventory Management

Split, merge, and redeem outcome tokens

## Liquidity Rewards

Earn rewards for providing liquidity

## Quick Reference

| Action | Tool | Documentation |
| --- | --- | --- |
| Deposit USDCe | Bridge API | Bridge Overview |
| Approve tokens | Relayer Client | Setup Guide |
| Post limit orders | CLOB REST API | CLOB Client |
| Respond to RFQ | RFQ API | RFQ Overview |
| Monitor orderbook | WebSocket | WebSocket Overview |
| Low-latency data | RTDS | Data Feeds |
| Split USDCe to tokens | CTF / Relayer | Inventory |
| Merge tokens to USDCe | CTF / Relayer | Inventory |

## Support

For market maker onboarding and support, contact [email protected].
