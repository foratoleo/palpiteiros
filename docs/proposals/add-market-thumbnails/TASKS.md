# Tasks: Add Market Thumbnails

Implementation tasks for adding market thumbnail images to cards.

## Task 1: Verify imageUrl Mapping
**Agent:** `dr:nodejs-specialist`
**Priority:** P0 (Blocking)
**Estimated:** 15 minutes
**File:** `src/services/gamma.service.ts`

**Steps:**
1. Open `src/services/gamma.service.ts`
2. Locate the function that transforms `GammaMarket` → `Market`
3. Verify that `imageUrl` is being mapped to `image_url`
4. If not mapping, add: `image_url: market.imageUrl || null`
5. Test with real API call to confirm image_url is populated

**Validation:**
- [ ] Function returns image_url when GammaMarket has imageUrl
- [ ] Returns null when GammaMarket doesn't have imageUrl
- [ ] Console log shows correct mapping

**Dependencies:** None

---

## Task 2: Redesign MarketCard Layout
**Agent:** `dr:react-specialist`
**Priority:** P0 (Core Feature)
**Estimated:** 45 minutes
**Files:**
- `src/components/market/market-card.tsx`
- `src/components/market/market-card-price.tsx` (if needed)

**Steps:**

1. **Change default behavior:**
   - Change `showImage = false` to `showImage = true` (line 59)
   - This enables image display by default

2. **Redesign CardHeader layout:**
   ```tsx
   // Current (vertical):
   <CardHeader>
     <h3>{question}</h3>
     {showImage && <img src={imageUrl} />}
   </CardHeader>

   // New (horizontal):
   <CardHeader className="flex gap-3 items-start">
     <div className="flex-1 min-w-0">
       <h3 className="font-semibold text-base leading-tight line-clamp-2">
         {market.question}
       </h3>
     </div>
     {showImage && (
       <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/50">
         <img
           src={imageUrl}
           alt=""
           className="w-full h-full object-cover"
           loading="lazy"
         />
       </div>
     )}
   </CardHeader>
   ```

3. **Update getImageUrl function (lines 93-110):**
   - Already generates good placeholder
   - Keep as-is for fallback

4. **Test responsiveness:**
   - Add responsive classes for mobile
   - Ensure image doesn't overflow on small screens

**Validation:**
- [ ] Image appears to the right of title (desktop)
- [ ] Image is 48x48px with rounded corners
- [ ] Fallback gradient shows when image_url is null
- [ ] Mobile layout doesn't break (test at 375px, 768px)
- [ ] Loading skeleton works correctly

**Dependencies:** Task 1 (need image_url data)

---

## Task 3: Update MarketList Component
**Agent:** `dr:react-specialist`
**Priority:** P1 (Required)
**Estimated:** 15 minutes
**File:** `src/components/market/market-list.tsx`

**Steps:**

1. **Find MarketCard usage in market-list.tsx**
2. **Remove explicit `showImage={false}` if present**
3. **Let MarketCard use its new default (true)**

**Before:**
```tsx
<MarketCard
  market={market}
  showImage={false}
  // ... other props
/>
```

**After:**
```tsx
<MarketCard
  market={market}
  // showImage uses default (true) now
  // ... other props
/>
```

**Validation:**
- [ ] Grid view shows thumbnails for all markets
- [ ] List view shows thumbnails for all markets
- [ ] No visual regression in layout

**Dependencies:** Task 2 (MarketCard must be updated first)

---

## Task 4: Apply to BreakingMarketCard
**Agent:** `dr:react-specialist`
**Priority:** P1 (Consistency)
**Estimated:** 30 minutes
**File:** `src/components/breaking/breaking-market-card.tsx`

**Steps:**

1. **Analyze current BreakingMarketCard layout (lines 236-302)**
2. **Restructure to match new MarketCard pattern:**
   ```tsx
   // Current layout has image at top (lines 238-257)
   // Move to horizontal layout in title area

   <div className="flex items-start gap-3 mb-3">
     {/* Title + Category */}
     <div className="flex-1 min-w-0">
       {market.category && (
         <Badge variant="glass" className="mb-2 text-xs">
           {market.category}
         </Badge>
       )}
       <h3 className="font-semibold text-sm leading-tight line-clamp-2">
         {market.question}
       </h3>
     </div>

     {/* Thumbnail - NEW */}
     <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-border/50">
       <img
         src={imageUrl}
         alt=""
         className="w-full h-full object-cover"
         loading="lazy"
       />
     </div>
   </div>
   ```

3. **Remove old large image section** (lines 238-257 if being replaced)
4. **Keep all other features:** sparkline, badges, price section

**Validation:**
- [ ] Thumbnail appears next to title
- [ ] Size matches MarketCard (48x48px)
- [ ] Sparkline still works below title
- [ ] Price section unchanged
- [ ] Hover effects still work

**Dependencies:** Task 2 (use same pattern as MarketCard)

---

## Task 5: Create E2E Tests
**Agent:** `dr:playwright-specialist`
**Priority:** P2 (Quality)
**Estimated:** 30 minutes
**File:** `e2e/market-thumbnails.spec.ts` (new file)

**Steps:**

1. **Create test file:**
   ```bash
   touch e2e/market-thumbnails.spec.ts
   ```

2. **Write test cases:**

   **Test 1: Thumbnail Renders**
   ```typescript
   test('market card displays thumbnail image', async ({ page }) => {
     await page.goto('/markets')

     const thumbnail = page.locator('[data-testid="market-card-thumbnail"]').first()
     await expect(thumbnail).toBeVisible()

     // Check dimensions
     const box = await thumbnail.boundingBox()
     expect(box?.width).toBe(48)
     expect(box?.height).toBe(48)
   })
   ```

   **Test 2: Fallback When No Image**
   ```typescript
   test('market card shows fallback when image_url is null', async ({ page }) => {
     // Mock market without image_url
     await page.goto('/markets')

     const card = page.locator('[data-testid="market-card"]').first()
     const thumbnail = card.locator('[data-testid="market-card-thumbnail"]')

     // Should still render placeholder
     await expect(thumbnail).toBeVisible()
     await expect(thumbnail).toHaveAttribute('src', /data:image\/svg/)
   })
   ```

   **Test 3: Responsive Layout**
   ```typescript
   test('thumbnail layout is responsive', async ({ page }) => {
     await page.goto('/markets')

     // Desktop
     await page.setViewportSize({ width: 1024, height: 768 })
     const title = page.locator('h3').first()
     const thumbnail = page.locator('[data-testid="market-card-thumbnail"]').first()

     const titleBox = await title.boundingBox()
     const thumbBox = await thumbnail.boundingBox()

     // Should be horizontally aligned (similar Y positions)
     expect(Math.abs((titleBox?.y || 0) - (thumbBox?.y || 0))).toBeLessThan(10)

     // Mobile
     await page.setViewportSize({ width: 375, height: 667 })
     // Check layout doesn't break
     await expect(thumbnail).toBeVisible()
   })
   ```

3. **Add data-testid attributes to components:**
   - MarketCard: `data-testid="market-card-thumbnail"`
   - BreakingMarketCard: same attribute

**Validation:**
- [ ] All tests pass: `npm run test:e2e`
- [ ] Coverage includes happy path and edge cases
- [ ] Tests run in <2 minutes

**Dependencies:** Task 2, Task 4 (components must exist first)

---

## Execution Order

```
┌─────────┐
│ Task 1  │  (Can start immediately - verify backend)
└────┬────┘
     │
     ▼
┌─────────┐     ┌─────────┐
│ Task 2  │────▶│ Task 3  │  (MarketList depends on MarketCard)
└────┬────┘     └─────────┘
     │
     ▼
┌─────────┐
│ Task 4  │  (BreakingMarketCard - can run parallel with Task 3)
└────┬────┘
     │
     ▼
┌─────────┐
│ Task 5  │  (Tests need all components ready)
└─────────┘
```

**Parallel Opportunities:**
- Task 3 and Task 4 can run simultaneously after Task 2
- Task 1 can run independently at start

## Total Time Estimate

- **Sequential:** ~2 hours 15 minutes
- **With parallelization:** ~1 hour 45 minutes

## Definition of Done

- [ ] All 5 tasks completed
- [ ] Code review passed
- [ ] E2E tests passing
- [ ] No console errors
- [ ] Responsive on mobile/tablet/desktop
- [ ] Performance impact <5% LCP increase
- [ ] Documentation updated (if needed)

## Rollback Plan

If issues arise:
1. Revert MarketCard to `showImage = false`
2. Remove `showImage` prop from MarketList
3. Comment out thumbnail section in BreakingMarketCard
4. Rollback is simple: single prop change per component
