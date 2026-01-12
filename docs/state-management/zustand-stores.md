# Zustand State Management Guide

Comprehensive guide to using Zustand stores in Palpiteiros v2.

## Overview

Palpiteiros v2 uses Zustand for client-side state management. Zustand is a lightweight, performant alternative to Redux that requires minimal boilerplate.

## Available Stores

| Store | Location | Purpose |
|-------|----------|---------|
| `market.store` | `src/stores/market.store.ts` | Market filtering, sorting, favorites |
| `portfolio.store` | `src/stores/portfolio.store.ts` | Portfolio positions, P&L |
| `ui.store` | `src/stores/ui.store.ts` | Theme, toasts, modals, loading states |
| `alert.store` | `src/stores/alert.store.ts` | Price alerts management |
| `user.store` | `src/stores/user.store.ts` | User preferences, settings |

## Market Store

### Purpose

Manages market-related state including filters, sort options, view modes, and favorites.

### Usage

```typescript
import { useMarketStore } from '@/stores/market.store'

// Basic usage
function MarketFilters() {
  const { filters, setFilters, resetFilters } = useMarketStore()

  return (
    <div>
      <select
        value={filters.active ? 'true' : 'all'}
        onChange={(e) => setFilters({ active: e.target.value === 'true' })}
      >
        <option value="all">All Markets</option>
        <option value="true">Active Only</option>
      </select>
      <button onClick={resetFilters}>Reset</button>
    </div>
  )
}
```

### Using Selectors

For optimized re-renders, use selectors to access only the state you need:

```typescript
// Good - only re-renders when filters change
const filters = useMarketStore((state) => state.filters)

// Bad - re-renders on ANY store change
const { filters } = useMarketStore()
```

### Pre-defined Selectors

The market store includes optimized selectors for derived state:

```typescript
import {
  selectFilteredMarkets,
  selectPaginatedMarkets,
  selectFavoriteMarkets,
  selectMarketStats
} from '@/stores/market.store'

function MarketList() {
  // Only re-renders when filtered markets change
  const markets = useMarketStore(selectFilteredMarkets)
  const stats = useMarketStore(selectMarketStats)

  return (
    <div>
      <p>Showing {stats.filteredMarkets} of {stats.totalMarkets} markets</p>
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}
```

### Common Actions

```typescript
// Set filters
useMarketStore.getState().setFilters({ active: true, tags: ['crypto'] })

// Set sort
useMarketStore.getState().setSort('volume', 'desc')

// Toggle favorite
useMarketStore.getState().toggleFavorite('market-123')

// Check if favorite
const isFavorite = useMarketStore.getState().isFavorite('market-123')

// Set view mode
useMarketStore.getState().setViewMode('list')

// Reset to defaults
useMarketStore.getState().reset()
```

## Portfolio Store

### Purpose

Manages user portfolio including positions, trade history, and P&L calculations.

### Usage

```typescript
import { usePortfolioStore } from '@/stores/portfolio.store'

function PortfolioSummary() {
  const { positions, totalValue, totalPnL } = usePortfolioStore()

  return (
    <div>
      <p>Total Value: ${totalValue.toFixed(2)}</p>
      <p>Total P&L: ${totalPnL.toFixed(2)}</p>
      <p>Positions: {positions.length}</p>
    </div>
  )
}
```

### Actions

```typescript
// Add position
usePortfolioStore.getState().addPosition({
  id: 'pos-123',
  market_id: 'market-123',
  outcome: 'Yes',
  size: 100,
  avg_price: 0.50
})

// Update position
usePortfolioStore.getState().updatePosition('pos-123', {
  current_price: 0.65
})

// Close position
usePortfolioStore.getState().closePosition('pos-123')
```

## UI Store

### Purpose

Manages global UI state including theme, toasts, modals, and loading states.

### Theme Management

```typescript
import { useUiStore } from '@/stores/ui.store'

function ThemeToggle() {
  const { theme, setTheme, toggleTheme } = useUiStore()

  return (
    <button onClick={toggleTheme}>
      Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
    </button>
  )
}
```

### Toast Notifications

```typescript
import { useUiStore } from '@/stores/ui.store'

function SaveButton() {
  const { addToast } = useUiStore()

  const handleSave = async () => {
    try {
      await saveData()
      addToast('Saved successfully!', 'success')
    } catch {
      addToast('Failed to save', 'error')
    }
  }

  return <button onClick={handleSave}>Save</button>
}
```

### Modal Management

```typescript
import { useUiStore } from '@/stores/ui.store'

function OpenAlertDialog() {
  const { openModal, closeModal } = useUiStore()

  const handleConfirm = () => {
    closeModal() // Closes the top modal
  }

  return (
    <button onClick={() => openModal('confirm-delete', { id: 123 })}>
      Delete Item
    </button>
  )
}
```

### Loading States

```typescript
import { useUiStore } from '@/stores/ui.store'

function DataLoader() {
  const { setLoading, loadingStates } = useUiStore()

  const loadData = async () => {
    setLoading('markets', true)
    try {
      await fetchMarkets()
    } finally {
      setLoading('markets', false)
    }
  }

  const isLoading = loadingStates.markets?.loading || false

  return <button onClick={loadData} disabled={isLoading}>
    {isLoading ? 'Loading...' : 'Load Data'}
  </button>
}
```

## Alert Store

### Purpose

Manages price alerts including creation, deletion, and trigger tracking.

### Usage

```typescript
import { useAlertStore } from '@/stores/alert.store'

function AlertManager() {
  const { alerts, addAlert, removeAlert, updateAlert } = useAlertStore()

  return (
    <div>
      {alerts.map((alert) => (
        <AlertItem
          key={alert.id}
          alert={alert}
          onDelete={() => removeAlert(alert.id)}
        />
      ))}
    </div>
  )
}
```

## Best Practices

### 1. Use Selectors for Performance

```typescript
// Good - selector for specific state
const active = useMarketStore((state) => state.filters.active)

// Bad - entire store (re-renders on any change)
const { filters } = useMarketStore()
```

### 2. Use getState for Actions Outside React

```typescript
// Event handler outside component
const handleMarketUpdate = (market: Market) => {
  useMarketStore.getState().upsertMarket(market)
}
```

### 3. Subscribe to Specific Changes

```typescript
// Subscribe to specific state changes
const unsubscribe = useMarketStore.subscribe(
  (state) => state.filters,
  (filters) => {
    console.log('Filters changed:', filters)
  }
)
```

### 4. Persistence Middleware

Most stores use the persistence middleware to save state to localStorage:

```typescript
import { persist } from 'zustand/middleware'

export const useMarketStore = create(
  persist(
    (set, get) => ({
      // ... store implementation
    }),
    {
      name: 'market-store',
      partialize: (state) => ({
        // Only persist specific fields
        filters: state.filters,
        favorites: state.favorites
      })
    }
  )
)
```

### 5. DevTools Integration

All stores include DevTools for debugging:

```typescript
import { devtools } from 'zustand/middleware'

export const useMarketStore = create(
  devtools(
    (set, get) => ({
      // ... store implementation
    }),
    { name: 'MarketStore' }
  )
)
```

## Testing with Zustand

### Testing Store State

```typescript
import { renderHook, act } from '@testing-library/react'
import { useMarketStore } from '@/stores/market.store'

test('should toggle favorite', () => {
  const { result } = renderHook(() => useMarketStore())

  act(() => {
    result.current.toggleFavorite('market-123')
  })

  expect(result.current.isFavorite('market-123')).toBe(true)
})
```

### Resetting Store State

```typescript
beforeEach(() => {
  useMarketStore.getState().reset()
})
```

## Type Safety

All stores are fully typed. You can import types from each store:

```typescript
import type {
  MarketState,
  MarketActions,
  MarketFilterOptions,
  MarketSortOption
} from '@/stores/market.store'
```
