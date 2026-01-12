/**
 * Alert List Container
 *
 * Main container for displaying all price alerts with tabs, filters, and bulk actions.
 * Manages active, triggered, and historical alerts with comprehensive sorting and search.
 *
 * @features
 * - Tab navigation (Active, Triggered, History)
 * - Advanced filtering (by market, condition, date)
 * - Bulk operations (pause, resume, delete)
 * - Real-time search
 * - Pull-to-refresh on mobile
 * - Loading skeletons and empty states
 *
 * @example
 * ```tsx
 * <AlertList userId={user.id} />
 * ```
 */

'use client'

import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellOff, Clock, Search, Filter, Trash2, Pause, Play } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// UI Components
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

// Store & Types
import { useAlertStore } from '@/stores'
import { PriceAlert, AlertCondition, AlertStatus } from '@/types/alert.types'
import { AlertItem } from './alert-item'

// ============================================================================
// TYPES
// ============================================================================

export type AlertTab = 'active' | 'triggered' | 'history'

export interface AlertListProps {
  /** User ID to load alerts for */
  userId: string
  /** Optional initial tab */
  defaultTab?: AlertTab
  /** Enable pull-to-refresh on mobile */
  enableRefresh?: boolean
}

export interface AlertListFilters {
  /** Filter by market ID */
  marketId?: string
  /** Filter by condition */
  condition?: AlertCondition
  /** Filter by status */
  status?: AlertStatus
  /** Search query */
  search?: string
}

export interface AlertListSort {
  /** Field to sort by */
  field: 'created_at' | 'target_price' | 'triggered_at'
  /** Sort direction */
  direction: 'asc' | 'desc'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TAB_LABELS = {
  active: 'Ativos',
  triggered: 'Acionados',
  history: 'Histórico'
}

const SORT_OPTIONS = [
  { field: 'created_at' as const, direction: 'desc' as const, label: 'Mais Recentes' },
  { field: 'created_at' as const, direction: 'asc' as const, label: 'Mais Antigos' },
  { field: 'target_price' as const, direction: 'desc' as const, label: 'Maior Preço' },
  { field: 'target_price' as const, direction: 'asc' as const, label: 'Menor Preço' },
  { field: 'triggered_at' as const, direction: 'desc' as const, label: 'Recentemente Acionado' }
]

const CONDITION_OPTIONS = [
  { value: AlertCondition.ABOVE, label: 'Acima de (≥)' },
  { value: AlertCondition.BELOW, label: 'Abaixo de (≤)' },
  { value: AlertCondition.CROSS, label: 'Cruzar' },
  { value: AlertCondition.EXACT, label: 'Exatamente' }
]

// ============================================================================
// ALERT LIST CONTAINER
// ============================================================================

/**
 * AlertList - Main Container Component
 *
 * Displays all user alerts with comprehensive filtering, sorting, and bulk operations.
 */
export function AlertList({ userId, defaultTab = 'active', enableRefresh = true }: AlertListProps) {
  // State
  const [activeTab, setActiveTab] = useState<AlertTab>(defaultTab)
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<AlertListFilters>({})
  const [sort, setSort] = useState<AlertListSort>({ field: 'created_at', direction: 'desc' })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Store
  const { alerts, triggerHistory, loading, loadAlerts, pauseAlerts, resumeAlerts, deleteAlerts } =
    useAlertStore()

  // ============================================================================
  // FILTERED & SORTED ALERTS
  // ============================================================================

  const filteredAlerts = useMemo(() => {
    let filtered = [...alerts]

    // Filter by tab
    if (activeTab === 'active') {
      filtered = filtered.filter((a) => !a.triggered)
    } else if (activeTab === 'triggered') {
      filtered = filtered.filter((a) => a.triggered)
    } else if (activeTab === 'history') {
      // Show all alerts in history tab
    }

    // Filter by market
    if (filters.marketId) {
      filtered = filtered.filter((a) => a.market_id === filters.marketId)
    }

    // Filter by condition
    if (filters.condition) {
      filtered = filtered.filter((a) => a.condition === filters.condition)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((a) =>
        a.market.question.toLowerCase().includes(query) ||
        a.market.slug?.toLowerCase().includes(query) ||
        a.market.category?.toLowerCase().includes(query)
      )
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal: any, bVal: any

      if (sort.field === 'created_at') {
        aVal = new Date(a.created_at).getTime()
        bVal = new Date(b.created_at).getTime()
      } else if (sort.field === 'target_price') {
        aVal = a.target_price
        bVal = b.target_price
      } else if (sort.field === 'triggered_at') {
        aVal = a.triggered_at ? new Date(a.triggered_at).getTime() : 0
        bVal = b.triggered_at ? new Date(b.triggered_at).getTime() : 0
      }

      if (sort.direction === 'asc') {
        return aVal > bVal ? 1 : -1
      } else {
        return aVal < bVal ? 1 : -1
      }
    })

    return filtered
  }, [alerts, activeTab, filters, searchQuery, sort])

  // ============================================================================
  // STATISTICS
  // ============================================================================

  const stats = useMemo(() => {
    const activeCount = alerts.filter((a) => !a.triggered).length
    const triggeredCount = alerts.filter((a) => a.triggered).length

    return {
      active: activeCount,
      triggered: triggeredCount,
      history: triggerHistory.length
    }
  }, [alerts, triggerHistory])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = useCallback(async () => {
    if (!enableRefresh) return

    setIsRefreshing(true)
    try {
      await loadAlerts(userId)
    } finally {
      setIsRefreshing(false)
    }
  }, [enableRefresh, loadAlerts, userId])

  const handleSelectAll = useCallback(() => {
    if (selectedAlerts.size === filteredAlerts.length) {
      setSelectedAlerts(new Set())
    } else {
      setSelectedAlerts(new Set(filteredAlerts.map((a) => a.id)))
    }
  }, [selectedAlerts.size, filteredAlerts])

  const handleToggleSelect = useCallback((alertId: string) => {
    setSelectedAlerts((prev) => {
      const next = new Set(prev)
      if (next.has(alertId)) {
        next.delete(alertId)
      } else {
        next.add(alertId)
      }
      return next
    })
  }, [])

  const handleBulkPause = useCallback(async () => {
    if (selectedAlerts.size === 0) return
    await pauseAlerts(Array.from(selectedAlerts))
    setSelectedAlerts(new Set())
  }, [selectedAlerts, pauseAlerts])

  const handleBulkResume = useCallback(async () => {
    if (selectedAlerts.size === 0) return
    await resumeAlerts(Array.from(selectedAlerts))
    setSelectedAlerts(new Set())
  }, [selectedAlerts, resumeAlerts])

  const handleBulkDelete = useCallback(async () => {
    if (selectedAlerts.size === 0) return
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedAlerts.size} alert${selectedAlerts.size > 1 ? 'as' : 'a'}?`
    )
    if (!confirmed) return

    await deleteAlerts(Array.from(selectedAlerts))
    setSelectedAlerts(new Set())
  }, [selectedAlerts, deleteAlerts])

  const handleFilterChange = useCallback((key: keyof AlertListFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSortChange = useCallback((field: AlertListSort['field'], direction: AlertListSort['direction']) => {
    setSort({ field, direction })
  }, [])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Alertas de Preço</h2>
          <p className="text-sm text-muted-foreground">
            Gerencie seus alertas e receba notificações
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isRefreshing ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              Atualizando...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              Atualizar
            </>
          )}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AlertTab)}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="active" className="gap-2">
              <Bell className="h-4 w-4" />
              {TAB_LABELS.active}
              <Badge variant="secondary" className="ml-1">
                {stats.active}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="triggered" className="gap-2">
              <BellOff className="h-4 w-4" />
              {TAB_LABELS.triggered}
              <Badge variant="secondary" className="ml-1">
                {stats.triggered}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="h-4 w-4" />
              {TAB_LABELS.history}
              <Badge variant="secondary" className="ml-1">
                {stats.history}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar alertas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:w-64"
              />
            </div>

            {/* Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="h-4 w-4" />
                  {(filters.marketId || filters.condition || filters.status) && (
                    <span className="absolute -right-1 -top-1 flex h-3 w-3">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm font-semibold">Filtrar por Condição</div>
                {CONDITION_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={option.value}
                    checked={filters.condition === option.value}
                    onCheckedChange={(checked) =>
                      handleFilterChange('condition', checked ? option.value : undefined)
                    }
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />

                <div className="px-2 py-1.5 text-sm font-semibold">Ordenar</div>
                {SORT_OPTIONS.map((option) => (
                  <DropdownMenuCheckboxItem
                    key={`${option.field}-${option.direction}`}
                    checked={sort.field === option.field && sort.direction === option.direction}
                    onCheckedChange={() => handleSortChange(option.field, option.direction)}
                  >
                    {option.label}
                  </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuSeparator />

                <DropdownMenuItem onClick={() => setFilters({})}>
                  Limpar Filtros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Bulk Actions */}
            {selectedAlerts.size > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Ações ({selectedAlerts.size})
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleBulkPause} className="gap-2">
                    <Pause className="h-4 w-4" />
                    Pausar Selecionados
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleBulkResume} className="gap-2">
                    <Play className="h-4 w-4" />
                    Retomar Selecionados
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleBulkDelete} className="gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Excluir Selecionados
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        {/* Select All */}
        {filteredAlerts.length > 0 && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedAlerts.size === filteredAlerts.length}
              onChange={handleSelectAll}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">
              Selecionar todos ({filteredAlerts.length})
            </span>
          </div>
        )}

        {/* Alert List Content */}
        <div className="mt-4">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredAlerts.length === 0 ? (
            <EmptyState
              tab={activeTab}
              hasFilters={!!searchQuery || !!filters.marketId || !!filters.condition}
            />
          ) : (
            <AlertListContent
              alerts={filteredAlerts}
              selectedAlerts={selectedAlerts}
              onToggleSelect={handleToggleSelect}
            />
          )}
        </div>
      </Tabs>
    </div>
  )
}

// ============================================================================
// ALERT LIST CONTENT
// ============================================================================

interface AlertListContentProps {
  alerts: PriceAlert[]
  selectedAlerts: Set<string>
  onToggleSelect: (alertId: string) => void
}

function AlertListContent({ alerts, selectedAlerts, onToggleSelect }: AlertListContentProps) {
  return (
    <motion.div
      layout
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <AnimatePresence mode="popLayout">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{
              layout: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { delay: index * 0.05 },
              y: { delay: index * 0.05 }
            }}
          >
            <AlertItem
              alert={alert}
              selected={selectedAlerts.has(alert.id)}
              onSelect={onToggleSelect}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

// ============================================================================
// LOADING SKELETON
// ============================================================================

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-start gap-4">
            <Skeleton className="h-5 w-5" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  tab: AlertTab
  hasFilters: boolean
}

function EmptyState({ tab, hasFilters }: EmptyStateProps) {
  let title = 'Nenhum alerta encontrado'
  let description = 'Crie seu primeiro alerta de preço para começar.'

  if (hasFilters) {
    title = 'Nenhum alerta corresponde aos filtros'
    description = 'Tente ajustar os filtros ou a busca.'
  } else if (tab === 'triggered') {
    title = 'Nenhum alerta acionado'
    description = 'Seus alertas acionados aparecerão aqui.'
  } else if (tab === 'history') {
    title = 'Nenhum histórico ainda'
    description = 'Seus alertas acionados serão registrados aqui.'
  }

  return (
    <Card className="flex min-h-[300px] flex-col items-center justify-center p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
    </Card>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AlertList
