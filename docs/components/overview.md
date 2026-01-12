# Component Library Documentation

Comprehensive guide to all UI components in Palpiteiros v2.

## Table of Contents

- [Base Components](#base-components)
- [Market Components](#market-components)
- [Portfolio Components](#portfolio-components)
- [Alert Components](#alert-components)
- [Search Components](#search-components)
- [Chart Components](#chart-components)
- [Layout Components](#layout-components)
- [Theme Components](#theme-components)

---

## Base Components

### Button

A versatile button component with multiple variants and sizes.

**Import:**
```typescript
import { Button } from '@/components/ui/button'
```

**Variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`, `glass`

**Sizes:** `default`, `sm`, `lg`, `icon`

**Example:**
```tsx
<Button variant="default" size="md">
  Click Me
</Button>

<Button variant="glass" size="sm">
  Glass Button
</Button>

<Button variant="outline" size="icon">
  <Icon name="close" />
</Button>
```

### Card

A container component with glassmorphism variants.

**Import:**
```typescript
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
```

**Variants:** `default`, `glass`, `elevated`

**Example:**
```tsx
<Card variant="glass">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input

Text input with enhanced focus states.

**Import:**
```typescript
import { Input } from '@/components/ui/input'
```

**Example:**
```tsx
<Input
  type="text"
  placeholder="Enter text..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>
```

### Dialog

Modal dialog with glass variant.

**Import:**
```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
```

**Example:**
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent variant="glass">
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>Dialog content</p>
  </DialogContent>
</Dialog>
```

### Badge

Small status or label component.

**Import:**
```typescript
import { Badge } from '@/components/ui/badge'
```

**Variants:** `default`, `success`, `warning`, `error`, `info`, `outline`, `glass`

**Example:**
```tsx
<Badge variant="success">Active</Badge>
<Badge variant="glass">Tag</Badge>
```

---

## Market Components

### MarketCard

Main card component for displaying markets.

**Import:**
```typescript
import { MarketCard } from '@/components/market'
```

**Variants:** `default`, `compact`, `detailed`

**Props:**
```typescript
interface MarketCardProps {
  market: Market
  variant?: 'default' | 'compact' | 'detailed'
  showPrice?: boolean
  showVolume?: boolean
  showLiquidity?: boolean
  onClick?: (market: Market) => void
  className?: string
}
```

**Example:**
```tsx
<MarketCard
  market={market}
  variant="default"
  showPrice
  showVolume
/>
```

### MarketGrid

Responsive grid container for market cards.

**Import:**
```typescript
import { MarketGrid } from '@/components/market'
```

**Example:**
```tsx
<MarketGrid
  markets={markets}
  variant="default"
  loading={isLoading}
/>
```

### MarketList

List/table view for markets with sorting.

**Import:**
```typescript
import { MarketList } from '@/components/market'
```

**Example:**
```tsx
<MarketList
  markets={markets}
  sortField="volume"
  sortDirection="desc"
  onSort={(field, direction) => setSort(field, direction)}
/>
```

---

## Portfolio Components

### PortfolioSummary

Summary cards showing portfolio metrics.

**Import:**
```typescript
import { PortfolioSummary } from '@/components/portfolio'
```

**Example:**
```tsx
<PortfolioSummary />
```

Displays:
- Total Value (with animated counter)
- Total P&L (with trend indicator)
- Win Rate (circular progress)
- Open Positions count

### PositionsTable

Sortable table for portfolio positions.

**Import:**
```typescript
import { PositionsTable } from '@/components/portfolio'
```

**Props:**
```typescript
interface PositionsTableProps {
  positions: Position[]
  onSort?: (field: string) => void
  onClosePosition?: (id: string) => void
}
```

**Example:**
```tsx
<PositionsTable
  positions={positions}
  onSort={handleSort}
  onClosePosition={handleClose}
/>
```

### AllocationChart

Donut chart showing portfolio allocation.

**Import:**
```typescript
import { AllocationChart } from '@/components/portfolio'
```

**Props:**
```typescript
interface AllocationChartProps {
  positions: Position[]
  groupBy?: 'market' | 'category'
  onSliceClick?: (category: string) => void
}
```

**Example:**
```tsx
<AllocationChart
  positions={positions}
  groupBy="category"
  onSliceClick={(category) => filterByCategory(category)}
/>
```

---

## Alert Components

### AlertList

Main container for price alerts.

**Import:**
```typescript
import { AlertList } from '@/components/alerts'
```

**Example:**
```tsx
<AlertList
  alerts={alerts}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onToggle={handleToggle}
/>
```

### CreateAlertDialog

Dialog for creating new price alerts.

**Import:**
```typescript
import { CreateAlertDialog, CreateAlertButton } from '@/components/alerts'
```

**Example:**
```tsx
<CreateAlertDialog
  market={market}
  onCreate={handleCreate}
/>

<!-- Or use the trigger button -->
<CreateAlertButton market={market} />
```

### AlertForm

Reusable form for alert creation/editing.

**Import:**
```typescript
import { AlertForm } from '@/components/alerts'
```

**Props:**
```typescript
interface AlertFormProps {
  market?: Market
  initialData?: Partial<Alert>
  onSubmit: (data: AlertFormData) => void
  onChange?: (data: AlertFormData) => void
}
```

---

## Search Components

### SearchBar

Search input with debouncing and keyboard shortcuts.

**Import:**
```typescript
import { SearchBar } from '@/components/search'
```

**Variants:** `default`, `glass`, `minimal`, `compact`

**Example:**
```tsx
<SearchBar
  value={searchQuery}
  onChange={setSearchQuery}
  placeholder="Search markets..."
  variant="glass"
  onKeyDown={(e) => {
    if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      // Open command palette
    }
  }}
/>
```

### CommandPalette

Global search dialog (Cmd+K).

**Import:**
```typescript
import { CommandPalette } from '@/components/search'
```

**Example:**
```tsx
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  groups={[
    {
      heading: 'Markets',
      items: marketResults
    },
    {
      heading: 'Pages',
      items: pageResults
    }
  ]}
/>
```

### FilterChip

Clickable filter chips.

**Import:**
```typescript
import { FilterChip, FilterChipGroup } from '@/components/search'
```

**Example:**
```tsx
<FilterChipGroup>
  <FilterChip active={active === 'all'} onClick={() => setActive('all')}>
    All
  </FilterChip>
  <FilterChip active={active === 'active'} onClick={() => setActive('active')}>
    Active
  </FilterChip>
</FilterChipGroup>
```

---

## Chart Components

### PriceChart

Main price chart with Recharts.

**Import:**
```typescript
import { PriceChart } from '@/components/charts'
```

**Props:**
```typescript
interface PriceChartProps {
  data: PriceHistoryPoint[]
  timeframe?: '1H' | '24H' | '7D' | '30D' | 'ALL'
  showVolume?: boolean
  interactive?: boolean
}
```

**Example:**
```tsx
<PriceChart
  data={priceHistory}
  timeframe="7D"
  showVolume
  interactive
/>
```

### MiniSparkline

Compact chart for market cards.

**Import:**
```typescript
import { MiniSparkline } from '@/components/charts'
```

**Example:**
```tsx
<MiniSparkline
  data={priceHistory}
  width={60}
  height={30}
  showTrend
/>
```

---

## Layout Components

### Sidebar

Main application sidebar.

**Import:**
```typescript
import { Sidebar } from '@/components/layout'
```

**Example:**
```tsx
<Sidebar
  open={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
  navigation={navigationItems}
/>
```

### Header

Top navigation header.

**Import:**
```typescript
import { Header } from '@/components/layout'
```

**Example:**
```tsx
<Header
  title="Markets"
  actions={<Button>New Alert</Button>}
/>
```

---

## Theme Components

### ThemeToggle

Icon button for toggling theme.

**Import:**
```typescript
import { ThemeToggle } from '@/components/theme'
```

**Variants:** `default`, `compact`, `large`, `glass`

**Example:**
```tsx
<ThemeToggle variant="glass" />
```

### ThemeSwitch

Three-way switch for Light | System | Dark.

**Import:**
```typescript
import { ThemeSwitch } from '@/components/theme'
```

**Example:**
```tsx
<ThemeSwitch
  value={theme}
  onChange={setTheme}
/>
```

---

## Design Tokens

### Colors

```css
/* Semantic */
--primary: ...;
--secondary: ...;
--accent: ...;
--destructive: ...;

/* Functional */
--success: ...;
--warning: ...;
--error: ...;
--info: ...;

/* Neutrals */
--background: ...;
--foreground: ...;
--muted: ...;
--border: ...;
```

### Spacing

```css
/* Scale: 4px base unit */
--spacing-1: 4px;
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-6: 24px;
--spacing-8: 32px;
```

### Border Radius

```css
--radius-sm: 4px;
--radius-md: 8px;
--radius-lg: 12px;
--radius-xl: 16px;
--radius-full: 9999px;
```

### Transitions

```css
--duration-fast: 150ms;
--duration-normal: 200ms;
--duration-slow: 300ms;
--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
```
