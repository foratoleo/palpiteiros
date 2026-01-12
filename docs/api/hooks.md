# React Hooks Documentation

Custom React hooks for data fetching, state management, and UI interactions.

## Table of Contents

- [Market Hooks](#market-hooks)
- [Portfolio Hooks](#portfolio-hooks)
- [Alert Hooks](#alert-hooks)
- [UI Hooks](#ui-hooks)

---

## Market Hooks

### useMarkets(params)

Fetches a list of markets with optional filtering.

**Import:**
```typescript
import { useMarkets } from '@/hooks/use-markets'
```

**Parameters:**
```typescript
interface UseMarketsParams {
  filters?: MarketFilterOptions
  enabled?: boolean
  refetchInterval?: number
}
```

**Returns:**
```typescript
interface UseMarketsReturn {
  markets: Market[] | undefined
  isLoading: boolean
  error: Error | null
  isRefetching: boolean
  refetch: () => void
  invalidate: () => Promise<void>
}
```

**Example:**
```typescript
function MarketsList() {
  const { markets, isLoading, error } = useMarkets({
    filters: { active: true },
    refetchInterval: 60000 // Refresh every minute
  })

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      {markets?.map(market => (
        <MarketCard key={market.id} market={market} />
      ))}
    </div>
  )
}
```

### useMarket(marketId, options)

Fetches a single market by ID with real-time updates.

**Import:**
```typescript
import { useMarket } from '@/hooks/use-market'
```

**Parameters:**
```typescript
interface UseMarketParams {
  marketId: string
  enabled?: boolean
  refetchInterval?: number
  subscribe?: boolean // Enable real-time subscriptions
}
```

**Returns:**
```typescript
interface UseMarketReturn {
  market: Market | undefined
  isLoading: boolean
  error: Error | null
  isRefetching: boolean
  refetch: () => void
}
```

**Example:**
```typescript
function MarketDetail({ id }: { id: string }) {
  const { market, isLoading } = useMarket(id, {
    subscribe: true // Enable real-time updates
  })

  if (isLoading) return <Skeleton />
  if (!market) return <NotFound />

  return (
    <div>
      <h1>{market.question}</h1>
      <PriceChart market={market} />
    </div>
  )
}
```

### useMarketHistory(marketId, options)

Fetches historical price data for a market.

**Import:**
```typescript
import { useMarketHistory } from '@/hooks/use-market-history'
```

**Parameters:**
```typescript
interface UseMarketHistoryParams {
  marketId: string
  timeRange?: '1H' | '24H' | '7D' | '30D' | 'ALL'
  enabled?: boolean
}
```

**Returns:**
```typescript
interface UseMarketHistoryReturn {
  history: PriceHistoryPoint[] | undefined
  isLoading: boolean
  error: Error | null
}
```

**Example:**
```typescript
function MarketChart({ marketId }: { marketId: string }) {
  const { history, isLoading } = useMarketHistory(marketId, {
    timeRange: '7D'
  })

  if (isLoading) return <ChartSkeleton />

  return <LineChart data={history} />
}
```

---

## Portfolio Hooks

### usePositions()

Fetches user's portfolio positions.

**Import:**
```typescript
import { usePositions } from '@/hooks/use-positions'
```

**Returns:**
```typescript
interface UsePositionsReturn {
  positions: Position[] | undefined
  isLoading: boolean
  error: Error | null
  refetch: () => void
}
```

### usePortfolioSummary()

Calculates portfolio statistics.

**Import:**
```typescript
import { usePortfolioSummary } from '@/hooks/use-portfolio'
```

**Returns:**
```typescript
interface UsePortfolioSummaryReturn {
  totalValue: number
  totalPnL: number
  winRate: number
  openPositions: number
  isLoading: boolean
}
```

**Example:**
```typescript
function PortfolioSummary() {
  const { totalValue, totalPnL, winRate, isLoading } = usePortfolioSummary()

  if (isLoading) return <SummarySkeleton />

  return (
    <div className="grid grid-cols-4 gap-4">
      <MetricCard label="Total Value" value={totalValue} />
      <MetricCard label="Total P&L" value={totalPnL} />
      <MetricCard label="Win Rate" value={`${winRate}%`} />
    </div>
  )
}
```

---

## Alert Hooks

### useAlerts()

Fetches user's price alerts.

**Import:**
```typescript
import { useAlerts } from '@/hooks/use-alerts'
```

**Returns:**
```typescript
interface UseAlertsReturn {
  alerts: Alert[] | undefined
  isLoading: boolean
  error: Error | null
  createAlert: (data: CreateAlertData) => Promise<void>
  deleteAlert: (id: string) => Promise<void>
}
```

### useAlertChecker()

Monitors markets and triggers alerts when conditions are met.

**Import:**
```typescript
import { useAlertChecker } from '@/hooks/use-alert-checker'
```

**Parameters:**
```typescript
interface UseAlertCheckerParams {
  enabled?: boolean
  checkInterval?: number // milliseconds (default: 5000)
  marketIds?: string[] // Monitor specific markets
}
```

**Example:**
```typescript
function AlertMonitor() {
  useAlertChecker({
    enabled: true,
    checkInterval: 10000 // Check every 10 seconds
  })

  return null // Runs in background
}
```

---

## UI Hooks

### useDebounce(value, delay)

Delays updating a value until after a delay.

**Import:**
```typescript
import { useDebounce } from '@/hooks/use-debounce'
```

**Parameters:**
- `value: T` - The value to debounce
- `delay: number` - Delay in milliseconds

**Returns:** `T` - The debounced value

**Example:**
```typescript
function SearchInput() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    // This runs 300ms after search stops changing
    if (debouncedSearch) {
      searchMarkets(debouncedSearch)
    }
  }, [debouncedSearch])

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search markets..."
    />
  )
}
```

### useMarketSearch(query, options)

Searches markets with debouncing.

**Import:**
```typescript
import { useMarketSearch } from '@/hooks/use-market-search'
```

**Parameters:**
```typescript
interface UseMarketSearchParams {
  query: string
  minLength?: number // Default: 2
  debounceMs?: number // Default: 300
  enabled?: boolean
}
```

**Returns:**
```typescript
interface UseMarketSearchReturn {
  results: Market[] | undefined
  isLoading: boolean
  isTooShort: boolean
}
```

### useToast()

Toast notification manager.

**Import:**
```typescript
import { useToast } from '@/hooks/use-toast'
```

**Returns:**
```typescript
interface UseToastReturn {
  toasts: Toast[]
  addToast: (message: string, variant?: ToastVariant) => string
  removeToast: (id: string) => void
  clearToasts: () => void

  // Convenience methods
  toastSuccess: (message: string) => string
  toastError: (message: string) => string
  toastWarning: (message: string) => string
  toastInfo: (message: string) => string
}
```

**Example:**
```typescript
function SaveButton() {
  const { toastSuccess, toastError } = useToast()
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveData()
      toastSuccess('Saved successfully!')
    } catch {
      toastError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return <button onClick={handleSave} disabled={saving}>
    {saving ? 'Saving...' : 'Save'}
  </button>
}
```

---

## Performance Hooks

### useDebouncedCallback(callback, delay)

Returns a debounced version of a callback.

**Import:**
```typescript
import { useDebouncedCallback } from '@/hooks/use-performance'
```

**Example:**
```typescript
function ScrollComponent() {
  const handleScroll = useDebouncedCallback(() => {
    console.log('Scroll ended')
  }, 200)

  return <div onScroll={handleScroll} />
}
```

### useBreakpoint()

Gets the current responsive breakpoint.

**Import:**
```typescript
import { useBreakpoint } from '@/hooks/use-performance'
```

**Returns:** `'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'`

**Example:**
```typescript
function ResponsiveComponent() {
  const breakpoint = useBreakpoint()
  const isMobile = breakpoint === 'xs' || breakpoint === 'sm'

  return isMobile ? <MobileView /> : <DesktopView />
}
```

### usePrevious(value)

Stores and returns the previous value.

**Import:**
```typescript
import { usePrevious } from '@/hooks/use-performance'
```

**Example:**
```typescript
function Component({ value }: { value: number }) {
  const prevValue = usePrevious(value)

  useEffect(() => {
    if (value !== prevValue) {
      console.log(`Value changed from ${prevValue} to ${value}`)
    }
  }, [value, prevValue])
}
```
