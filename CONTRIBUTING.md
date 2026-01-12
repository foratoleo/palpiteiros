# Contributing to Palpiteiros v2

Thank you for your interest in contributing to Palpiteiros v2! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Conventions](#commit-conventions)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- Git
- A code editor (VS Code recommended)

### Initial Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/palpiteiros-v2.git
cd palpiteiros-v2
```

3. Install dependencies:
```bash
npm install
```

4. Create a branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

## Development Workflow

### Branch Naming

Use the following branch naming conventions:

- `feature/` - New features
- `fix/` - Bug fixes
- `refactor/` - Code refactoring
- `docs/` - Documentation changes
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

### Development

1. Make your changes following the [Code Standards](#code-standards)
2. Add tests for your changes (see [Testing Guidelines](#testing-guidelines))
3. Ensure all tests pass:
```bash
npm run test
npm run type-check
npm run lint
```

4. Commit your changes (see [Commit Conventions](#commit-conventions))

## Code Standards

### TypeScript

- Use TypeScript for all new files
- Avoid `any` types
- Use strict mode
- Export types for reuse

```typescript
// Good
interface UserProps {
  name: string
  email: string
}

export function UserCard({ name, email }: UserProps) {
  return <div>{name}</div>
}

// Bad
export function UserCard(props: any) {
  return <div>{props.name}</div>
}
```

### React Components

- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript interfaces for props
- Add JSDoc comments for complex logic

```typescript
/**
 * Market Card Component
 *
 * Displays a prediction market with question, price, and metadata.
 */
export function MarketCard({ market, variant }: MarketCardProps) {
  // ...
}
```

### Styling

- Use TailwindCSS utility classes
- Follow the existing design system
- Support dark mode
- Use responsive prefixes

```tsx
// Good
<div className="flex items-center gap-4 md:gap-6 dark:bg-gray-900">

// Bad (inline styles)
<div style={{ display: 'flex', gap: '16px' }}>
```

### Imports

- Group imports in this order:
  1. React imports
  2. Third-party libraries
  3. Internal imports (absolute paths with @/)
  4. Relative imports

```typescript
// Good
import * as React from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useMarket } from '@/hooks/use-market'
import { Card } from './card'
```

## Testing Guidelines

### Unit Tests

- Test user behavior, not implementation details
- Use `@testing-library/react` utilities
- Mock external dependencies (API calls, services)
- Aim for >80% coverage on critical paths

```typescript
// Good test
test('should add item to cart when add button is clicked', () => {
  render(<ProductCard product={mockProduct} />)
  fireEvent.click(screen.getByRole('button', { name: /add to cart/i }))
  expect(screen.getByText(/1 item in cart/i)).toBeInTheDocument()
})

// Bad test (tests implementation)
test('should call addToCart function', () => {
  const spy = jest.spyOn(cartActions, 'addToCart')
  render(<ProductCard product={mockProduct} />)
  expect(spy).toHaveBeenCalled()
})
```

### E2E Tests

- Test critical user flows
- Use data-testid attributes for selectors
- Keep tests isolated and independent

```typescript
test('should complete purchase flow', async ({ page }) => {
  await page.goto('/products/123')
  await page.click('[data-testid="add-to-cart"]')
  await page.click('[data-testid="cart-icon"]')
  await page.click('[data-testid="checkout-button"]')
  await expect(page).toHaveURL('/checkout')
})
```

## Commit Conventions

We use [Conventional Commits](https://www.conventionalcommits.org/):

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks
- `perf` - Performance improvements

### Examples

```bash
feat(market): add market card component

Implement the market card component with support for
multiple variants (default, compact, detailed).

Closes #123
```

```bash
fix(alerts): prevent duplicate alert creation

Add validation to check if an alert already exists
before creating a new one.

Fixes #456
```

## Pull Request Process

### Before Submitting

1. Update documentation
2. Add/update tests
3. Run all tests and ensure they pass
4. Update the changelog (if applicable)

### PR Title

Use the same format as commits:

```
feat(market): add market card component
```

### PR Description

Include:

- Summary of changes
- Motivation for the change
- Screenshots (for UI changes)
- Related issues
- Breaking changes (if any)

### Example PR Template

```markdown
## Summary
Brief description of changes

## Changes
- Added market card component
- Updated market list page
- Added tests for new component

## Testing
- Added unit tests in `market-card.test.tsx`
- Tested manually in dev environment
- All tests passing

## Related Issues
Closes #123

## Screenshots
(Attach screenshots for UI changes)
```

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one approval required
3. Address all review comments
4. Squash commits if needed
5. Merge when approved

## Questions?

Feel free to open an issue with your question or start a discussion.
