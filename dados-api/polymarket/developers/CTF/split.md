# Splitting USDC - Polymarket Documentation

> Fonte: https://docs.polymarket.com/developers/CTF/split
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


At any time, after a condition has been prepared on the CTF contract (via `prepareCondition`), it is possible to "split" collateral into a full (position) set. In other words, one unit USDC can be split into 1 YES unit and 1 NO unit.

## Process

If splitting from the collateral, the CTF contract will attempt to transfer `amount` collateral from the message sender to itself. If successful, `amount` stake will be minted in the split target positions.

If any of the transfers, mints, or burns fail, the transaction will revert. The transaction will also revert if the given partition is trivial, invalid, or refers to more slots than the condition is prepared with.

## Function: splitPosition()

This operation happens via the `splitPosition()` function on the CTF contract with the following parameters:

### Parameters

| Parameter | Type | Description |
| --- | --- | --- |
| `collateralToken` | IERC20 | The address of the positions' backing collateral token |
| `parentCollectionId` | bytes32 | The ID of the outcome collections common to the position being split and the split target positions. Null in Polymarket case |
| `conditionId` | bytes32 | The ID of the condition to split on |
| `partition` | uint[] | An array of disjoint index sets representing a nontrivial partition of the outcome slots of the given condition. E.G. A\|B and C but not A\|B and B\|C (is not disjoint). Each element's a number which, together with the condition, represents the outcome collection. E.G. 0b110 is A\|B, 0b010 is B, etc. In the Polymarket case 1\|2 |
| `amount` | uint | The amount of collateral or stake to split. Also the number of full sets to receive |

---

## Related Documentation

- [CTF Overview](./overview.md)
- [Merging Tokens](./merge.md)
- [Redeeming Tokens](./redeem.md)
