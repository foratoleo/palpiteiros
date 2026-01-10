# Glossary - Polymarket Documentation

> Fonte: https://docs.polymarket.com/quickstart/quickstart/reference/glossary
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Key terms and concepts for Polymarket developers

## Markets & Events

| Term | Definition |
| --- | --- |
| __Event__ | A collection of related markets grouped under a common topic. Example: "2024 US Presidential Election" contains markets for each candidate. |
| __Market__ | A single tradeable outcome within an event. Each market has a Yes and No side. Corresponds to a condition ID, question ID, and pair of token IDs. |
| __Token__ | Represents a position in a specific outcome (Yes or No). Prices range from 0.00 to 1.00. Winning tokens redeem for $1 USDCe. Also called _outcome token_ or referenced by _token ID_. |
| __Token ID__ | The unique identifier for a specific outcome token. Required when placing orders or querying prices. |
| __Condition ID__ | Onchain identifier for a market's resolution condition. Used in CTF operations. |
| __Question ID__ | Identifier linking a market to its resolution oracle (UMA). |
| __Slug__ | Human-readable URL identifier for a market or event. Found in Polymarket URLs: `polymarket.com/event/[slug]` |

---

## Trading

| Term | Definition |
| --- | --- |
| __CLOB__ | Central Limit Order Book. Polymarket's off-chain order matching system. Orders are matched here before onchain settlement. |
| __Tick Size__ | The minimum price increment for a market. Usually `0.01` (1 cent) or `0.001` (0.1 cent). |
| __Fill__ | When an order is matched and executed. Orders can be partially or fully filled. |

---

## Order Types

| Term | Definition |
| --- | --- |
| __GTC__ | Good-Til-Cancelled. An order that remains open until filled or manually cancelled. |
| __GTD__ | Good-Til-Date. An order that expires at a specified time if not filled. |
| __FOK__ | Fill-Or-Kill. An order that must be filled entirely and immediately, or it's cancelled. No partial fills. |
| __FAK__ | Fill-And-Kill. An order that fills as much as possible immediately, then cancels any remaining unfilled portion. |

---

## Market Types

| Term | Definition |
| --- | --- |
| __Binary Market__ | A market with exactly two outcomes: Yes and No. The prices always sum to approximately $1. |
| __Negative Risk (NegRisk)__ | A multi-outcome event where only one outcome can resolve Yes. Requires `negRisk: true` in order parameters. Details |

---

## Wallets

| Term | Definition |
| --- | --- |
| __EOA__ | Externally Owned Account. A standard Ethereum wallet controlled by a private key. |
| __Funder Address__ | The wallet address that holds funds and tokens for trading. |
| __Signature Type__ | Identifies wallet type when trading. `0` = EOA, `1` = Magic Link proxy, `2` = Gnosis Safe proxy. |

---

## Token Operations (CTF)

| Term | Definition |
| --- | --- |
| __CTF__ | Conditional Token Framework. The onchain smart contracts that manage outcome tokens. |
| __Split__ | Convert USDCe into a complete set of outcome tokens (one Yes + one No). |
| __Merge__ | Convert a complete set of outcome tokens back into USDCe. |
| __Redeem__ | After resolution, exchange winning tokens for $1 USDCe each. |

---

## Infrastructure

| Term | Definition |
| --- | --- |
| __Polygon__ | The blockchain network where Polymarket operates. Chain ID: `137`. |
| __USDCe__ | The stablecoin used as collateral on Polymarket. Bridged USDC on Polygon. |
