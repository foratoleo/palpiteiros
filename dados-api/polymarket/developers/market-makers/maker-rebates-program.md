# Maker Rebates Program

> Fonte: https://docs.polymarket.com/developers/market-makers/maker-rebates-program
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Technical guide for handling taker fees and earning maker rebates on Polymarket

Polymarket has enabled __taker fees__ on __15-minute crypto markets__. These fees fund a __Maker Rebates__ program that pays daily USDC rebates to liquidity providers.

## Client Updates Required

### Using Official CLOB Clients (Recommended)

The official CLOB clients automatically fetch the correct fee rate from the CLOB and set it on your orders. __Update to the latest version__ to ensure fee support:

With the latest client versions, fee handling is automatic. The client will:

1. Query the fee rate for the market's token ID
2. Set the correct `feeRateBps` on your orders

### Custom Implementations

If you're __not__ using the official clients, you must manually handle fees:

#### 1. Fetch the Fee Rate

Query the fee rate for a specific token ID:

```bash
GET https://clob.polymarket.com/fee-rate?token_id={token_id}
```

__Response:__

For fee-enabled markets, this returns `1000` (representing 10% base fee rate before the curve calculation).
For fee-free markets, this returns `0`.

#### 2. Set the Fee Rate on Orders

Include the `feeRateBps` parameter when creating orders:

## Fee Calculation

Taker fees are calculated using a curve that varies with the probability:

$$\text{fee} = C \times \text{feeRate} \times (p \cdot (1-p))^{\text{exponent}}$$

Where:

- __C__ = number of shares traded
- __p__ = price of the shares (0 to 1)
- __feeRate__ = 0.25
- __exponent__ = 2

This means:

- Maximum fees at 50% probability (p = 0.5)
- Fees decrease toward the extremes (p → 0 or p → 1)
- Minimum fee precision is 0.0001 USDC (smaller amounts round to zero)

### How Rebates Work

- __Eligibility:__ Your orders must add liquidity (maker orders) and get filled
- __Calculation:__ Proportional to your share of executed maker volume in each eligible market
- __Payment:__ Daily in USDC, paid directly to your wallet

### Rebate Pool

The rebate pool for each market is funded by taker fees collected in that market. Currently, 100% of collected fees are redistributed as maker rebates.

## Which Markets Have Fees?

Currently, only __15-minute crypto markets__ have fees enabled. You can check if a specific market has fees by querying the fee-rate endpoint:

```bash
# Fee-enabled market returns fee_rate_bps > 0
GET https://clob.polymarket.com/fee-rate?token_id={token_id}

# Example response for fee-enabled market:
{ "fee_rate_bps": 1000 }

# Example response for fee-free market:
{ "fee_rate_bps": 0 }
```

## Quick Reference

| Item | Value |
| --- | --- |
| Fee-enabled markets | 15-minute crypto markets |
| Fee rate (BPS) | 1000 |
| Fee curve rate | 0.25* |
| Fee curve exponent | 2* |
| Minimum fee | 0.0001 USDC |
| Rebate frequency | Daily |
| Rebate currency | USDC |

*Subject to change. Always fetch dynamically from the API.
