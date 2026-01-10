# WSS Overview - Polymarket Documentation

> Fonte: https://docs.polymarket.com/developers/CLOB/websocket/wss-overview
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Overview and general information about the Polymarket Websocket.

The Polymarket CLOB API provides websocket (wss) channels through which clients can get pushed updates. These endpoints allow clients to maintain almost real-time views of their orders, their trades and markets in general. There are two available channels `user` and `market`.

## Subscription

To subscribe send a message including the following authentication and intent information upon opening the connection.

| Field | Type | Description |
| --- | --- | --- |
| auth | Auth | see next page for auth information |
| markets | string[] | array of markets (condition IDs) to receive events for (for `user` channel) |
| assets_ids | string[] | array of asset ids (token IDs) to receive events for (for `market` channel) |
| type | string | id of channel to subscribe to (USER or MARKET) |
| custom_feature_enabled | bool | enabling / disabling custom features |

Where the `auth` field is of type `Auth` which has the form described in the WSS Authentication section below.

### Subscribe to more assets

Once connected, the client can subscribe and unsubscribe to `asset_ids` by sending the following message:

| Field | Type | Description |
| --- | --- | --- |
| assets_ids | string[] | array of asset ids (token IDs) to receive events for (for `market` channel) |
| markets | string[] | array of market ids (condition IDs) to receive events for (for `user` channel) |
| operation | string | "subscribe" or "unsubscribe" |
| custom_feature_enabled | bool | enabling / disabling custom features |

---

## Related Documentation

- [WSS Authentication](../../../wss-auth.md)
- [User Channel](../../../user-channel.md)
- [Market Channel](../../../market-channel.md)
