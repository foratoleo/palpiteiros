Task Name: typescript-fix-strategy
Date: 11/01/2026 13:08:21
Git Branch: fix/typescript-fix-strategy

## Task Objectives

The project has a Next.js 15 application with TypeScript strict mode enabled that is currently failing to build due to type incompatibility issues in the memoization utilities. The core issue stems from React 19's stricter type definitions for `React.memo()` which requires more precise type handling for component props. The build is failing with a type error in `use-memoized.ts` where `MemoExoticComponent<ComponentType<P>>` is not assignable to `ComponentType<P>`. This task aims to systematically resolve all TypeScript compilation errors by analyzing the root causes, implementing targeted fixes across the optimization utilities, and ensuring the project builds successfully while maintaining type safety.

## Implementation Summary

The fix strategy will follow a three-phase approach: (1) Immediate stabilization by temporarily adjusting tsconfig strictness for problematic areas, (2) Root cause analysis and targeted fixes in memoization utilities focusing on React 19 type compatibility, (3) Restoration of strict mode with comprehensive type coverage. The core technical issue involves React 19's updated `ComponentType` definition which now includes ref forwarding attributes that conflict with the memo wrapper's return type. Key files requiring fixes include `use-memoized.ts` (memoized component wrapper), `use-memoized-callback.ts` (conditional hook usage), and related optimization utilities. The solution involves using proper type assertions, creating compatible wrapper types, and potentially using `@ts-expect-error` comments for known React 19 compatibility issues.

## UX/UI Details

This is a build infrastructure task with no user-facing changes. The UX impact is indirect: fixing these build errors will enable successful production deployments and maintain development velocity.

## Tasks

### Task 1: Analyze All TypeScript Errors
**Recommended Agent**: react-architect

**Files to create/change**:
- Analysis document: `.dr_ai/tasks/typescript-fix-strategy/error-analysis.md`

**Implementation**: Run the full TypeScript compilation to capture all errors. Categorize errors by type: (1) React 19 compatibility issues with memo/ref types, (2) Conditional hook usage violations, (3) Missing dependencies in useEffect/useCallback hooks. Document each error with file location, error code, and potential fix approach. Create a prioritized list based on error dependencies.

**Subtasks**:
- **Subtask 1.1**: Execute `npx tsc --noEmit` to capture all TypeScript errors without Next.js filtering. Output the complete error log to the analysis document. Group errors by error code and affected modules. This provides the complete picture rather than just the first failing error.
  - **Agent**: react-architect

- **Subtask 1.2**: For React 19 memo type errors, analyze the `@types/react` and `@types/react-dom` versions to understand the breaking changes. Document the new `ComponentType` definition and why `MemoExoticComponent` is no longer directly assignable. Research React 19 migration patterns for memoized components.
  - **Agent**: react-architect

**Coding Standards**:
- Document all findings in markdown with code examples
- Include error reproduction steps for each category
- Reference React 19 type definition changes from React's GitHub repo

---

### Task 2: Fix Core Memo Type Compatibility
**Recommended Agent**: react-architect

**Files to create/change**:
- Modify: `src/lib/optimization/memoization/use-memoized.ts`
- Modify: `src/lib/optimization/memoization/use-memoized-callback.ts`

**Implementation**: The primary error at line 597 of `use-memoized.ts` occurs because `React.memo()` returns `MemoExoticComponent<P>` which is not directly assignable to `ComponentType<P>` under React 19's stricter types. The fix involves:

1. Change the return type of the `memoized()` function to return `MemoExoticComponent<P>` explicitly
2. Update the type signature to:
   ```typescript
   export function memoized<P extends object>(
     Component: ComponentType<P>,
     options: MemoizedComponentOptions = {}
   ): MemoExoticComponent<P> {
   ```
3. Use proper type casting for the custom comparison function to satisfy React's `AreEqual` type
4. Add conditional types to handle ref forwarding properly

For `use-memoized-callback.ts`, the conditional hook usage at lines 159-182 violates React's Rules of Hooks. Refactor to:
1. Move all hook calls to the top level
2. Use conditional logic inside the callbacks rather than conditional hook usage
3. Ensure hook dependencies are properly typed

**Subtasks**:
- **Subtask 2.1**: Fix the `memoized()` function type signature in `use-memoized.ts`. Change return type from `ComponentType<P>` to `MemoExoticComponent<P>`. Update the `enhancedAreEqual` function to properly type the comparison function using `Parameters<typeof Component>` for props type extraction.
  - **Agent**: react-architect

- **Subtask 2.2**: Refactor `useMemoizedCallback` in `use-memoized-callback.ts` to eliminate conditional hook usage. Extract the early return logic into a separate value calculation, then call hooks unconditionally. Pattern: `const shouldReturnEarly = ...; const memoizedValue = useMemo(() => { if (shouldReturnEarly) return ...; return ...; }, [deps]);`
  - **Agent**: react-architect

**Coding Standards**:
- Follow React 18+ patterns for custom hooks
- Ensure all hooks are called unconditionally at the top level
- Use `as const` for literal types where applicable
- Add JSDoc comments explaining type workarounds for React 19

---

### Task 3: Fix Conditional Hook Usage Issues
**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- Modify: `src/components/effects/3d/tilt-card.tsx`
- Modify: `src/components/effects/scroll/parallax-scroll.tsx`
- Modify: `src/components/effects/scroll/scroll-triggered-animations.tsx`
- Modify: `src/components/effects/colors/gradient-animation.tsx`

**Implementation**: The ESLint warnings about conditional hook usage are actually preventing TypeScript from properly inferring types. For each file:

1. **tilt-card.tsx**: The `useTransform` hooks at lines 195, 216 are called conditionally. Refactor to always call hooks, but conditionally use their values. Pattern:
   ```typescript
   const transformX = useTransform(...);
   const transformY = useTransform(...);
   // Then conditionally use the values
   ```

2. **parallax-scroll.tsx**: Multiple conditional `useTransform` calls. Same fix pattern - call hooks unconditionally, conditionally apply values.

3. **scroll-triggered-animations.tsx**: Conditional `useScrollAnimation` hooks. Extract to a separate component or use configuration objects instead of conditional hooks.

4. **gradient-animation.tsx**: Conditional `useMemo`. Move the conditional inside the memo factory function.

**Subtasks**:
- **Subtask 3.1**: Fix `tilt-card.tsx` conditional hooks. Extract all hook calls to the top of the component, before any returns or conditional logic. Create a configuration object based on conditions, then pass that configuration to the unconditionally-called hooks.
  - **Agent**: react-hooks-specialist

- **Subtask 3.2**: Fix `parallax-scroll.tsx` conditional hooks. The pattern of conditional `useTransform` calls needs refactoring. Consider creating a single hook that takes an array of transform configs and returns multiple values, or use early-memoization pattern.
  - **Agent**: react-hooks-specialist

- **Subtask 3.3**: Fix `scroll-triggered-animations.tsx`. This file has extensive conditional hook usage. Consider creating separate components for different animation types, or use a hook factory pattern that returns appropriate hooks based on configuration.
  - **Agent**: react-hooks-specialist

- **Subtask 3.4**: Fix `gradient-animation.tsx` conditional `useMemo`. Move the conditional inside the memo callback, and have the memo always execute with an early return pattern if needed.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- React Rules of Hooks: hooks must be called unconditionally
- Use the "config object" pattern for conditional hook behavior
- Extract conditional logic into separate components when appropriate
- Add `@ts-expect-error` only with clear explanation of why it's necessary

---

### Task 4: Fix ESLint Dependency Warnings
**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- Modify: `src/lib/optimization/memoization/use-memoized-callback.ts`
- Modify: `src/components/effects/focus/focus-scope.tsx`
- Modify: `src/hooks/use-alert-checker.ts`
- Modify: `src/hooks/use-performance.ts`

**Implementation**: The exhaustive-deps warnings indicate that either dependencies are missing (causing stale closures) or unnecessary dependencies are included (causing extra re-renders). For each:

1. **use-memoized-callback.ts**: Lines with spread operators in dependency arrays need refactoring. Convert to explicit dependency arrays or use `useCallback` with proper dependency management.

2. **focus-scope.tsx**: Unnecessary dependency `onFocusChange`. Either remove from deps if it's stable, or wrap in `useCallback` at the call site.

3. **use-alert-checker.ts**: Unnecessary dependency `handlePriceUpdate`. Remove if stable, or include all actually-used dependencies.

4. **use-performance.ts**: Missing and unnecessary dependencies. Review the effect logic and include only what's actually used in the effect body.

**Subtasks**:
- **Subtask 4.1**: Fix spread operator dependencies in `use-memoized-callback.ts`. Replace `...deps` patterns with properly typed dependency management. Consider using a ref for deps array to maintain referential stability while still tracking changes.
  - **Agent**: react-hooks-specialist

- **Subtask 4.2**: Fix dependency arrays in effect hooks. For each warning, determine if the dependency is actually used in the effect. If yes, include it. If no, remove it. Use `useCallback` to stabilize callback dependencies where appropriate.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Use `eslint-disable-next-line react-hooks/exhaustive-deps` only with comment explaining why
- Prefer functional updates `setState(prev => ...)` to avoid including setState in deps
- Use `useRef` for values that shouldn't trigger re-renders but are needed in effects

---

### Task 5: Fix Top-Level Hook Usage
**Recommended Agent**: react-hooks-specialist

**Files to create/change**:
- Modify: `src/hooks/use-markets.ts`

**Implementation**: Line 212 shows `useQueryClient` called at the top level (outside any React component or hook). This violates React's Rules of Hooks.

Fix by moving the `useQueryClient` call inside the hook that uses it, or creating a singleton query client instance if top-level access is genuinely needed:

```typescript
// Option 1: Inside the hook
export function useMarkets() {
  const queryClient = useQueryClient();
  // ...
}

// Option 2: Singleton pattern (if really needed)
import { QueryClient } from '@tanstack/react-query';
const queryClient = new QueryClient();
```

**Subtasks**:
- **Subtask 5.1**: Move the `useQueryClient` call from module scope to inside the hook that uses it. If the query client is needed for static methods, create a singleton instance instead of using the hook.
  - **Agent**: react-hooks-specialist

**Coding Standards**:
- Hooks must only be called from React functions (components or other hooks)
- For non-hook modules that need QueryClient, import a singleton instance
- Document why a singleton pattern is used if alternative to hook

---

### Task 6: Temporary Strict Mode Adjustments (If Needed)
**Recommended Agent**: react-architect

**Files to create/change**:
- Modify: `tsconfig.json`
- Create: `src/tsconfig-strict.json` (for future restoration)

**Implementation**: If the above fixes are insufficient to get the build passing quickly:

1. Create a copy of current tsconfig as `tsconfig-strict.json` for reference
2. Temporarily adjust specific strict rules:
   - Consider `strictNullChecks: false` for specific directories using `"compilerOptions": { "overrides": [...] }`
   - Add `skipLibCheck: true` for problematic node_modules types
3. Document in code comments which issues are being temporarily suppressed

**IMPORTANT**: This is a fallback option. The goal is to fix the actual type issues, not suppress them.

**Subtasks**:
- **Subtask 6.1**: Only proceed if Tasks 1-5 are insufficient. Create tsconfig overrides that target only the problematic files rather than disabling strict mode globally. Use path-based compiler options to relax strictness only for specific directories.
  - **Agent**: react-architect

**Coding Standards**:
- Document each temporary suppression with TODO comment
- Create GitHub issue tracking restoration of strict mode
- Do NOT disable `strict: true` globally - use targeted overrides only

---

### Task 7: Validation and Testing
**Recommended Agent**: react-architect

**Files to create/change**:
- Test script verification: `package.json`

**Implementation**: After fixes are complete, verify the build succeeds and no regressions were introduced:

1. Run `npm run build` to verify successful compilation
2. Run `npm run type-check` if available to verify type checking
3. Run `npm run lint` to verify no new lint issues
4. Test the application locally to ensure runtime behavior is unchanged
5. Check that no `@ts-ignore` or `eslint-disable` comments remain without clear justification

**Subtasks**:
- **Subtask 7.1**: Execute full build and type-check. Verify zero TypeScript errors. If any errors remain, categorize them as: (a) new errors introduced by fixes, (b) unrelated pre-existing errors, (c) legitimate type issues that need fixing.
  - **Agent**: react-architect

- **Subtask 7.2**: Run the development server and test components that use the fixed memoization utilities. Verify no runtime errors occur and that memoization still works as intended. Check browser console for any warnings.
  - **Agent**: react-architect

**Coding Standards**:
- All builds must complete successfully
- Zero TypeScript errors in production build
- ESLint warnings should not increase (can decrease)
- All fixes should preserve runtime behavior

## Estimated Completion Time

- Task 1 (Analysis): 30 minutes
- Task 2 (Core Memo Types): 1 hour
- Task 3 (Conditional Hooks): 2-3 hours
- Task 4 (Dependency Warnings): 1 hour
- Task 5 (Top-level Hooks): 15 minutes
- Task 6 (Fallback): Not recommended, but 30 minutes if needed
- Task 7 (Validation): 30 minutes

**Total Estimated Time**: 5-6 hours for complete fix

## Rollback Strategy

If fixes introduce new issues:
1. Git branch allows safe rollback
2. Keep original files as `*.original.ts` backups during refactoring
3. Each task can be independently reverted via git
4. Document which commits fix which specific errors for surgical reverts
