# User Channel - Polymarket Documentation

> Fonte: https://docs.polymarket.com/developers/CLOB/websocket/user-channel
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Authenticated channel for updates related to user activities (orders, trades), filtered for authenticated user by apikey.

**SUBSCRIBE**
`<wss-channel> user`

---

## Trade Message

Emitted when:
- When a market order is matched ("MATCHED")
- When a limit order for the user is included in a trade ("MATCHED")
- Subsequent status changes for trade ("MINED", "CONFIRMED", "RETRYING", "FAILED")

### Structure

| Name | Type | Description |
| --- | --- | --- |
| asset_id | string | Asset id (token ID) of order (market order) |
| event_type | string | "trade" |
| id | string | Trade id |
| last_update | string | Time of last update to trade |
| maker_orders | MakerOrder[] | Array of maker order details |
| market | string | Market identifier (condition ID) |
| matchtime | string | Time trade was matched |
| outcome | string | Outcome |
| owner | string | Api key of event owner |
| price | string | Price |
| side | string | BUY/SELL |
| size | string | Size |
| status | string | Trade status |
| taker_order_id | string | Id of taker order |
| timestamp | string | Time of event |
| trade_owner | string | Api key of trade owner |
| type | string | "TRADE" |

Where a `MakerOrder` object is of the form:

| Name | Type | Description |
| --- | --- | --- |
| asset_id | string | Asset of the maker order |
| matched_amount | string | Amount of maker order matched in trade |
| order_id | string | Maker order ID |
| outcome | string | Outcome |
| owner | string | Owner of maker order |
| price | string | Price of maker order |

#### Example

```json
{
  "asset_id": "52114319501245915516055106046884209969926127482827954674443846427813813222426",
  "event_type": "trade",
  "id": "28c4d2eb-bbea-40e7-a9f0-b2fdb56b2c2e",
  "last_update": "1672290701",
  "maker_orders": [
    {
      "asset_id": "52114319501245915516055106046884209969926127482827954674443846427813813222426",
      "matched_amount": "10",
      "order_id": "0xff354cd7ca7539dfa9c28d90943ab5779a4eac34b9b37a757d7b32bdfb11790b",
      "outcome": "YES",
      "owner": "9180014b-33c8-9240-a14b-bdca11c0a465",
      "price": "0.57"
    }
  ],
  "market": "0xbd31dc8a20211944f6b70f31557f1001557b59905b7738480ca09bd4532f84af",
  "matchtime": "1672290701",
  "outcome": "YES",
  "owner": "9180014b-33c8-9240-a14b-bdca11c0a465",
  "price": "0.57",
  "side": "BUY",
  "size": "10",
  "status": "MATCHED",
  "taker_order_id": "0x06bc63e346ed4ceddce9efd6b3af37c8f8f440c92fe7da6b2d0f9e4ccbc50c42",
  "timestamp": "1672290701",
  "trade_owner": "9180014b-33c8-9240-a14b-bdca11c0a465",
  "type": "TRADE"
}
```

---

## Order Message

Emitted when:
- When an order is placed (PLACEMENT)
- When an order is updated (some of it is matched) (UPDATE)
- When an order is canceled (CANCELLATION)

### Structure

| Name | Type | Description |
| --- | --- | --- |
| asset_id | string | Asset ID (token ID) of order |
| associate_trades | string[] | Array of ids referencing trades that the order has been included in |
| event_type | string | "order" |
| id | string | Order id |
| market | string | Condition ID of market |
| order_owner | string | Owner of order |
| original_size | string | Original order size |
| outcome | string | Outcome |
| owner | string | Owner of orders |
| price | string | Price of order |
| side | string | BUY/SELL |
| size_matched | string | Size of order that has been matched |
| timestamp | string | Time of event |
| type | string | PLACEMENT/UPDATE/CANCELLATION |

#### Example

```json
{
  "asset_id": "52114319501245915516055106046884209969926127482827954674443846427813813222426",
  "associate_trades": null,
  "event_type": "order",
  "id": "0xff354cd7ca7539dfa9c28d90943ab5779a4eac34b9b37a757d7b32bdfb11790b",
  "market": "0xbd31dc8a20211944f6b70f31557f1001557b59905b7738480ca09bd4532f84af",
  "order_owner": "9180014b-33c8-9240-a14b-bdca11c0a465",
  "original_size": "10",
  "outcome": "YES",
  "owner": "9180014b-33c8-9240-a14b-bdca11c0a465",
  "price": "0.57",
  "side": "SELL",
  "size_matched": "0",
  "timestamp": "1672290687",
  "type": "PLACEMENT"
}
```
