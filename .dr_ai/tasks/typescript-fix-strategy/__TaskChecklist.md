# typescript-fix-strategy Checklist

- [ ] T0: Create branch fix/typescript-fix-strategy

- [ ] T1: Analyze all TypeScript errors → See TaskPlan 1
  - [ ] T1.1: Run tsc --noEmit to capture complete error log
  - [ ] T1.2: Document React 19 memo type incompatibility root cause
  Agent: react-architect

- [ ] T2: Fix core memo type compatibility → See TaskPlan 2
  - [ ] T2.1: Update memoized() return type to MemoExoticComponent<P>
  - [ ] T2.2: Refactor useMemoizedCallback conditional hooks
  Agent: react-architect

- [ ] T3: Fix conditional hook usage violations → See TaskPlan 3
  - [ ] T3.1: Fix tilt-card.tsx conditional useTransform calls
  - [ ] T3.2: Fix parallax-scroll.tsx conditional hooks
  - [ ] T3.3: Fix scroll-triggered-animations.tsx conditional hooks
  - [ ] T3.4: Fix gradient-animation.tsx conditional useMemo
  Agent: react-hooks-specialist

- [ ] T4: Fix ESLint dependency warnings → See TaskPlan 4
  - [ ] T4.1: Replace spread operator dependencies with explicit arrays
  - [ ] T4.2: Fix missing/unnecessary dependency in all effect hooks
  Agent: react-hooks-specialist

- [ ] T5: Fix top-level hook usage → See TaskPlan 5
  - [ ] T5.1: Move useQueryClient from module scope to hook body
  Agent: react-hooks-specialist

- [ ] T6: Temporary strict mode adjustments → See TaskPlan 6
  - [ ] T6.1: Create targeted tsconfig overrides (fallback only)
  Agent: react-architect

- [ ] T7: Validate fixes and test → See TaskPlan 7
  - [ ] T7.1: Run build and verify zero TypeScript errors
  - [ ] T7.2: Test application locally for runtime verification
  Agent: react-architect
