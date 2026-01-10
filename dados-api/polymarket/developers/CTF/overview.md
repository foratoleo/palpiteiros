# Overview - Conditional Token Framework

> Fonte: https://docs.polymarket.com/developers/CTF/overview
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


All outcomes on Polymarket are tokenized on the Polygon network. Specifically, Polymarket outcomes shares are binary outcomes (ie "YES" and "NO") using Gnosis' Conditional Token Framework (CTF). They are distinct ERC1155 tokens related to a parent condition and backed by the same collateral.

## Technical Details

More technically, the binary outcome tokens are referred to as "positionIds" in Gnosis's documentation. "PositionIds" are derived from a collateral token and distinct "collectionIds". "CollectionIds" are derived from a "parentCollectionId", (always bytes32(0) in our case) a "conditionId", and a unique "indexSet".

The "indexSet" is a 256 bit array denoting which outcome slots are in an outcome collection; it MUST be a nonempty proper subset of a condition's outcome slots. In the binary case, which we are interested in, there are two "indexSets", one for the first outcome and one for the second. The first outcome's "indexSet" is 0b01 = 1 and the second's is 0b10 = 2.

The parent "conditionId" (shared by both "collectionIds" and therefore "positionIds") is derived from a "questionId" (a hash of the UMA ancillary data), an "oracle" (the UMA adapter V2), and an "outcomeSlotCount" (always 2 in the binary case).

## Calculating ERC1155 Token IDs (PositionIds)

The steps for calculating the ERC1155 token ids (positionIds) is as follows:

### 1. Get the conditionId

**Function:**
`getConditionId(oracle, questionId, outcomeSlotCount)`

**Inputs:**
- `oracle`: address - UMA adapter V2
- `questionId`: bytes32 - hash of the UMA ancillary data
- `outcomeSlotCount`: uint - 2 for binary markets

### 2. Get the two collectionIds

**Function:**
`getCollectionId(parentCollectionId, conditionId, indexSet)`

**Inputs:**
- `parentCollectionId`: bytes32 - bytes32(0)
- `conditionId`: bytes32 - the conditionId derived from (1)
- `indexSet`: uint - 1 (0b01) for the first and 2 (0b10) for the second.

### 3. Get the two positionIds

**Function:**
`getPositionId(collateralToken, collectionId)`

**Inputs:**
- `collateralToken`: IERC20 - address of ERC20 token collateral (USDC)
- `collectionId`: bytes32 - the two collectionIds derived from (3)

---

## Splitting and Merging

Leveraging the relations above, specifically "conditionIds" -> "positionIds" the Gnosis CTF contract allows for "splitting" and "merging" full outcome sets.

We explore these actions and provide code examples in the following sections:
- [Splitting USDC](./split.md)
- [Merging Tokens](./merge.md)
- [Redeeming Tokens](./redeem.md)
