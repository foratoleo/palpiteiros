# Add Market Thumbnails - Proposal Package

**Change ID:** `add-market-thumbnails`
**Status:** 🔵 Proposed
**Created:** 2026-01-12
**Priority:** Medium

## Quick Summary

Adicionar pequenas imagens em miniatura (48x48px) ao lado do título de cada market card, copiando o design do Polymarket.

**Before:**
```
┌────────────────────────────┐
│ Market Question Text       │
│ [No Image]                  │
│ $0.65 | Volume | Actions   │
└────────────────────────────┘
```

**After:**
```
┌────────────────────────────────────┐
│ Market Question Text...    [IMG] │ ← NEW 48x48 thumbnail
│ $0.65 | Volume | Actions           │
└────────────────────────────────────┘
```

## Documentation

| File | Description |
|------|-------------|
| **PROPOSAL.md** | Complete proposal with problem statement, research findings, and solution overview |
| **TASKS.md** | Detailed implementation tasks with specific agents, steps, and validation criteria |
| **DESIGN.md** | Technical design document with architecture, performance strategy, and decisions |

## 5 Implementation Tasks

Each task has a dedicated specialist agent:

| # | Task | Agent | Time | Dependency |
|---|------|-------|------|------------|
| 1 | Verify imageUrl mapping | `dr:nodejs-specialist` | 15 min | None |
| 2 | Redesign MarketCard layout | `dr:react-specialist` | 45 min | Task 1 |
| 3 | Update MarketList component | `dr:react-specialist` | 15 min | Task 2 |
| 4 | Apply to BreakingMarketCard | `dr:react-specialist` | 30 min | Task 2 |
| 5 | Create E2E tests | `dr:playwright-specialist` | 30 min | Tasks 2,4 |

**Total Estimated Time:** ~2 hours (with parallelization)

## Key Technical Decisions

- **Size:** 48x48px (compact square)
- **Position:** Right side of title (horizontal layout)
- **Fallback:** Gradient SVG (already implemented)
- **Performance:** Next.js Image with lazy loading
- **Responsive:** Horizontal layout maintained on mobile

## Ready to Implement?

All research completed, agents assigned, and tasks defined.

**Next Steps:**
1. Review proposal documents
2. Approve implementation
3. Execute tasks using specialist agents

## Files to Modify

- `src/services/gamma.service.ts` - Verify mapping
- `src/components/market/market-card.tsx` - Redesign layout
- `src/components/market/market-list.tsx` - Update usage
- `src/components/breaking/breaking-market-card.tsx` - Apply pattern
- `e2e/market-thumbnails.spec.ts` - New E2E tests

## Risk Assessment

**Low Risk** ✅
- Infrastructure already exists
- Simple layout change
- Backward compatible
- Easy rollback (single prop change)

---

**Proposal Location:** `docs/proposals/add-market-thumbnails/`
