# Overview - Negative Risk Documentation

> Fonte: https://docs.polymarket.com/developers/neg-risk/overview
> Baixado em: 2026-01-07
> Projeto: Extração Documentação Polymarket

---


Certain events which meet the criteria of being "winner-take-all" may be deployed as **"negative risk"** events/markets. The Gamma API includes a boolean field on events, `negRisk`, which indicates whether the event is negative risk.

Negative risk allows for increased capital efficiency by relating all markets within an event via a convert action. More explicitly, a NO share in any market can be converted into 1 YES share in all other markets.

Converts can be exercised via the Negative Adapter. You can read more about negative risk [here](https://docs.polymarket.com/developers/neg-risk/augmented-negative-risk).

---

## Augmented Negative Risk

There is a known issue with the negative risk architecture which is that the outcome universe must be complete before conversions are made or otherwise conversion will "cost" something. In most cases, the outcome universe can be made complete by deploying all the named outcomes and then an "other" option. But in some cases this is undesirable as new outcomes can come out of nowhere and you'd rather them be directly named versus grouped together in an "other".

To fix this, some markets use a system of **"augmented negative risk"**, where named outcomes, a collection of unnamed outcomes, and an _other_ is deployed. When a new outcome needs to be added, an unnamed outcome can be clarified to be the new outcome via the bulletin board. This means the "other" in the case of augmented negative risk can effectively change definitions (outcomes can be taken out of it). As such, trading should only happen on the named outcomes, and the other outcomes should be ignored until they are named or until resolution occurs. The Polymarket UI will not show unnamed outcomes.

An event can be considered "augmented negative risk" when `enableNegRisk` is true **AND** `negRiskAugmented` is true.

The naming conventions are as follows:

### Original Outcomes
- Outcome A
- Outcome B
- …

### Placeholder Outcomes
- Person A → can be clarified to a named outcome
- Person B → can be clarified to a named outcome
- …

### Explicit Other
- Other → not meant to be traded as the definition of this changes as placeholder outcomes are clarified to named outcomes

---

## Trading Considerations

When trading augmented negative risk markets:

1. **Trade only on named outcomes** - The "Other" outcomes are placeholders and should be ignored
2. **Monitor bulletin board** - Check for outcome clarifications
3. **Wait for clarity** - Don't trade ambiguous placeholder outcomes
4. **Understand resolution rules** - In augmented negative risk, unresolved placeholders typically resolve to "Other"

## Related Documentation

- [Augmented Negative Risk](https://docs.polymarket.com/developers/neg-risk/augmented-negative-risk)
- [Gamma API - negRisk field](https://docs.polymarket.com/developers/gamma-endpoints/markets#negRisk-boolean)
