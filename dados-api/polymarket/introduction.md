# Introduction

Welcome to Polymarket's docs! Here developers can find all the information they need for interacting with Polymarket. This includes documentation on market discovery, resolution, trading etc. Whether you are an academic researcher a market maker or an indy developer, this documentation should provide you what you need to get started. All the code you find linked here and on our GitHub is open source and free to use. If you have any questions please join our discord and direct your questions to the #devs channel.

## Access status

Please regularly check the access status of your account with the ban-status/ endpoint. If the endpoint returns a value of true for `cert_required`, proof of residence is required and failure to provide it within 14 days will result in a close only status. To certify you are not breaching ToS please send an email to ops@polymarket.com with your address, form of id (passport, license, or other) and proof of residence (recent utility bill, bank bill, phone bill). You will also be asked to sign and return a non-US certification in subsequent communications. Once complete, within 24 hours the cert required status should be market to false.

## CLOB API

### Introduction

Welcome to the Polymarket Order Book API! In this documentation you will find overviews, explanations, examples and annotations that aim to make interacting with the order book a breeze. In this section we will provide a general overview of the Polymarket Order Book and the purpose of the API before diving deep into the API and clients in following sections.

#### System

Polymarket's Order Book, also referred to as the "CLOB" (Central Limit Order Book) or "BLOB" (Binary Limit Order Book), is hybrid-decentralized wherein there is an operator that provides off-chain matching/ordering services while settlement/execution happens on-chain, non-custodially according to instructions provided by users in the form of signed order messages. This decentralized exchange model provides users with a powerful, non-custodial exchange experience.

Underlying the exchange system is a custom Exchange contract that facilitates atomic swaps (settlement) between binary Outcome Tokens (both CTF ERC1155 assets and ERC20 PToken assets) and a collateral asset (ERC20) according to signed limit orders. The Exchange contract is purpose built for binary markets (instruments that allow collateral to be split into positions and conversely positions to be merged into collateral with the two positions ultimately being settled to a price equal to 1). This allows "unification" of order books such that orders for a position and its complement can be matched. Explicitly, the Exchange allows for matching operations that include a mint/merge operation which allows orders for complementary outcome tokens to be crossed.

Orders are represented as signed typed structured data (EIP712). When orders are matched, one side is considered the maker and the other side is considered the taker. The relationship is always either one to one or many to one (maker to taker) and any price improvement is captured by the taker. The Operator is responsible for matching, ordering, and submitting matched trades to the underlying blockchain network for execution. As such, order placement and canellation can happen immediately off-chain while only the settlement action must occur on-chain.

#### API

The Polymarket Order Book API is a set of endpoints that allow market makers, traders, and other Polymarket users to programmatically create and manage orders for markets via access to the API provided by the operator.

Orders for any amount can be created and listed, or fetched and read from the order book for a given market. The API also provides data on all available markets, market prices, and order history through REST and WSS endpoints.

#### Security

Polymarket's Exchange contract has been audited by Chainsecurity you can find the audit report here.

The operator has no special privileges outside of ordering, this means that the only actions you must trust them with is enforcing correct ordering, not censoring and removing cancellations (orders can also be cancelled on-chain if operator is not trusted). If the operator is not doing any of these activities fairly a user can simply stop interacting with the operator. The operator is never able to set prices for users, or execute any trade on the user's behalf outside of the signed limit orders the user creates.

#### Fees

##### Schedule

_Subject to change_

| Volume Level | Maker Fee Base Rate (bps) | Taker Fee Base Rate (bps) |
| --- | --- | --- |
| >0 USDC | 0 | 0 |

##### Overview

Fees are levied in the output asset (proceeds). Fees for binary options with a complementary relationship (ie __`A`__ + __`A'`__ = __`C`__) must be symmetric to preserve market integrity. Symmetric means that someone selling 100 shares of `A` @ $0.99 should pay the same fee value as someone buying 100 `A'` @ $0.01. An intuition for this requires understanding that minting/merging a complementary token set for collateral can happen at any time. Fees are thus implemented in the following manner.

If buying (ie receiving __`A`__ or __`A'`__), the fee is levied on the proceed tokens. If selling (ie receiving __`C`__), the fee is levied on the proceed collateral. The base fee rate (`baseFeeRate`) is signed into the order struct. The base fee rate corresponds to % the fee rate paid by traders when the price of the two tokens is equal (ie $0.50 and $0.50). Moving away from a centered price, the following formulas are used to calculate the fees making sure to maintain symmetry.

__Case 1:__ If selling outcome tokens (base) for collateral (quote):

$$
feeQuote = baseRate * \min(price, 1-price) * size
$$

__Case 2:__ If buying outcome tokens (base) with collateral (quote):

$$
feeBase = baseRate * \min(price, 1-price) * \frac{size}{price}
$$

### Additional Resources

- Exchange contract source code
- Exchange contract documentation

## Deployments

The Exchange contract is deployed at the following addresses:

| Network | Address |
| --- | --- |
| __Mumbai:__ | `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` |
| __Polygon:__ | `0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E` |

## Status

https://status-clob.polymarket.com/

## Clients

> Installation

```
npm i -s @polymarket/clob-client

yarn add @polymarket/clob-client
```

```
pip install py-clob-client
```

Polymarket has implemented reference clients that allow programmatic use of the API below:

- clob-client (Typescript)
- py-clob-client (Python)

> Initialization

```
from py_clob_client.client import ClobClient

host: str = ""
key: str = ""
chain_id: int = 137

### Initialization of a client that trades directly from an EOA
client = ClobClient(host, key=key, chain_id=chain_id)

### Initialization of a client using a Polymarket Proxy associated with an Email/Magic account
client = ClobClient(host, key=key, chain_id=chain_id, signature_type=1, funder=POLYMARKET_PROXY_ADDRESS)

### Initialization of a client using a Polymarket Proxy associated with a Browser Wallet(Metamask, Coinbase Wallet, etc)
client = ClobClient(host, key=key, chain_id=chain_id, signature_type=2, funder=POLYMARKET_PROXY_ADDRESS)
```

```
import { ClobClient } from "polymarket/clob-client";
import { SignatureType } from "@polymarket/order-utils";

// Initialization of a client that trades directly from an EOA
const clobClient = new ClobClient(
  host as string,
  (await wallet.getChainId()) as number,
  wallet as ethers.Wallet | ethers.providers.JsonRpcSigner
);

// Initialization of a client using a Polymarket Proxy associated with an Email/Magic account
const clobClient = new ClobClient(
  host as string,
  (await wallet.getChainId()) as number,
  wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
  undefined, // creds
  SignatureType.POLY_PROXY,
  "YOUR_POLYMARKET_PROXY_ADDRESS"
);

// Initialization of a client using a Polymarket Proxy Wallet associated with a Browser Wallet(Metamask, Coinbase Wallet)
const clobClient = new ClobClient(
  host as string,
  (await wallet.getChainId()) as number,
  wallet as ethers.Wallet | ethers.providers.JsonRpcSigner,
  undefined, // creds
  SignatureType.POLY_GNOSIS_SAFE,
  "YOUR_POLYMARKET_PROXY_ADDRESS"
);
```

### Order Utils

Polymarket has implemented utility libraries to programmatically sign and generate orders:

- clob-order-utils (Typescript)
- python-order-utils (Python)
- go-order-utils (Golang)

## Endpoints

### REST

Used for all CLOB REST endpoints, denoted `{clob-endpoint}`.

__https://clob.polymarket.com/__

### Websocket

Used for all CLOB WSS endpoints, denoted `{wss-channel}`.

__wss://ws-subscriptions-clob.polymarket.com/ws/__

> **Fonte:** https://docs.polymarket.com
