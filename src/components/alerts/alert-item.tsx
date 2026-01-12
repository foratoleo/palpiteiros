/**
 * Alert Item Component
 *
 * Individual alert card with comprehensive display and interactions.
 * Features status badges, progress indicators, swipe actions, and animations.
 *
 * @features
 * - Market question display with icon
 * - Condition badge (above/below/cross)
 * - Target and current price comparison
 * - Progress bar showing distance to target
 * - Status indicators (active, paused, triggered)
 * - Hover actions (edit, delete, pause/resume)
 * - Mobile swipe actions (left to pause, right to delete)
 * - Smooth animations (slide in, fade out)
 * - Last triggered timestamp
 * - Sound/vibration toggle
 *
 * @example
 * ```tsx
 * <AlertItem
 *   alert={alert}
 *   selected={false}
 *   onSelect={(id) => console.log(id)}
 * />
 * ```
 */

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import {
  Bell,
  BellOff,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Pause,
  Play,
  Volume2,
  VolumeX,
  ExternalLink
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// UI Components
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'

// Store & Types
import { useAlertStore } from '@/stores'
import { PriceAlert, AlertCondition } from '@/types/alert.types'

// ============================================================================
// TYPES
// ============================================================================

export interface AlertItemProps {
  /** Alert data */
  alert: PriceAlert
  /** Whether alert is selected for bulk actions */
  selected?: boolean
  /** Toggle selection callback */
  onSelect?: (alertId: string) => void
  /** Compact variant for inline display */
  compact?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONDITION_CONFIG = {
  [AlertCondition.ABOVE]: {
    label: 'Acima de',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20'
  },
  [AlertCondition.BELOW]: {
    label: 'Abaixo de',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20'
  },
  [AlertCondition.CROSS]: {
    label: 'Cruzar',
    icon: ExternalLink,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  [AlertCondition.EXACT]: {
    label: 'Exatamente',
    icon: Bell,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20'
  }
}

const SWIPE_THRESHOLD = 80

// ============================================================================
// ALERT ITEM COMPONENT
// ============================================================================

/**
 * AlertItem - Individual Alert Card
 *
 * Displays a single price alert with all relevant information and actions.
 */
export function AlertItem({ alert, selected = false, onSelect, compact = false }: AlertItemProps) {
  // State
  const [isHovered, setIsHovered] = useState(false)
  const [soundsEnabled, setSoundsEnabled] = useState(true)
  const [swipeX, setSwipeX] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Refs
  const dragRef = useRef<HTMLDivElement>(null)
  const startX = useRef(0)
  const controls = useAnimation()

  // Store
  const { deleteAlert, updateAlert } = useAlertStore()

  // ============================================================================
  // DERIVED STATE
  // ============================================================================

  const conditionConfig = CONDITION_CONFIG[alert.condition]
  const ConditionIcon = conditionConfig.icon

  const isActive = !alert.triggered
  const isPaused = false // TODO: Add status field to PriceAlert type
  const wasTriggered = alert.triggered && alert.triggered_at

  // Calculate progress to target
  const currentPrice = alert.market.current_price || 0.5
  const targetPrice = alert.target_price
  const priceDiff = Math.abs(currentPrice - targetPrice)
  const progress = Math.max(0, Math.min(100, (1 - priceDiff) * 100))

  const isAboveTarget = currentPrice > targetPrice
  const isAtTarget = Math.abs(currentPrice - targetPrice) < 0.01

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDelete = async () => {
    const confirmed = window.confirm('Tem certeza que deseja excluir este alerta?')
    if (!confirmed) return

    await controls.start({
      opacity: 0,
      scale: 0.95,
      x: -100,
      transition: { duration: 0.2 }
    })

    deleteAlert(alert.id)
  }

  const handleTogglePause = async () => {
    // TODO: Implement pause/resume when status field is added
    console.log('Toggle pause:', alert.id)
  }

  const handleEdit = () => {
    // TODO: Open edit dialog
    console.log('Edit alert:', alert.id)
  }

  const handleToggleSound = () => {
    setSoundsEnabled((prev) => !prev)
  }

  const handleNavigateToMarket = () => {
    window.location.href = `/markets/${alert.market.slug || alert.market.id}`
  }

  // ============================================================================
  // SWIPE HANDLERS
  // ============================================================================

  const handleDragStart = (e: any) => {
    setIsDragging(true)
    startX.current = e.point.x
  }

  const handleDrag = (e: any) => {
    if (!isDragging) return

    const diff = e.point.x - startX.current
    setSwipeX(diff)
  }

  const handleDragEnd = async () => {
    setIsDragging(false)

    // Swipe left to pause
    if (swipeX < -SWIPE_THRESHOLD) {
      handleTogglePause()
      await controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
    }
    // Swipe right to delete
    else if (swipeX > SWIPE_THRESHOLD) {
      handleDelete()
    }
    // Reset position
    else {
      await controls.start({ x: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } })
    }

    setSwipeX(0)
  }

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    if (isHovered) {
      controls.start({ scale: 1.01, transition: { duration: 0.2 } })
    } else {
      controls.start({ scale: 1, transition: { duration: 0.2 } })
    }
  }, [isHovered, controls])

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <motion.div
      ref={dragRef}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.1}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      animate={controls}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      {/* Swipe Backgrounds */}
      <div className="absolute inset-0 z-0 flex overflow-hidden rounded-lg">
        {/* Left: Delete */}
        <div className="flex w-1/2 items-center justify-center bg-red-500">
          <Trash2 className="h-6 w-6 text-white" />
        </div>
        {/* Right: Pause */}
        <div className="ml-auto flex w-1/2 items-center justify-center bg-yellow-500">
          <Pause className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Main Card */}
      <Card
        className={`
          relative z-10 transition-all duration-200
          ${isHovered ? 'shadow-lg' : 'shadow-md'}
          ${selected ? 'ring-2 ring-primary' : ''}
          ${conditionConfig.borderColor}
          ${!isActive ? 'opacity-60' : ''}
        `}
      >
        <div className={`p-4 ${compact ? 'space-y-2' : 'space-y-3'}`}>
          {/* Header */}
          <div className="flex items-start gap-3">
            {/* Checkbox */}
            {onSelect && (
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onSelect(alert.id)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                onClick={(e) => e.stopPropagation()}
              />
            )}

            {/* Status Icon */}
            <div className={`
              flex h-10 w-10 shrink-0 items-center justify-center rounded-lg
              ${conditionConfig.bgColor} ${conditionConfig.color}
            `}>
              {isActive && !wasTriggered ? (
                <Bell className="h-5 w-5 animate-pulse" />
              ) : wasTriggered ? (
                <BellOff className="h-5 w-5" />
              ) : (
                <ConditionIcon className="h-5 w-5" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Market Question */}
              <h4 className="font-medium line-clamp-2 text-sm sm:text-base">
                {alert.market.question}
              </h4>

              {/* Market Category */}
              <p className="text-xs text-muted-foreground mt-1">
                {alert.market.category}
              </p>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleNavigateToMarket} className="gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Ver Mercado
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleEdit} className="gap-2">
                  <Edit className="h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleSound} className="gap-2">
                  {soundsEnabled ? (
                    <>
                      <Volume2 className="h-4 w-4" />
                      Som Ativado
                    </>
                  ) : (
                    <>
                      <VolumeX className="h-4 w-4" />
                      Som Silenciado
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleTogglePause} className="gap-2">
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4" />
                      Retomar
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4" />
                      Pausar
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleDelete} className="gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Alert Details */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Condition Badge */}
            <Badge variant="outline" className={`
              gap-1 ${conditionConfig.bgColor} ${conditionConfig.color}
              border-0
            `}>
              <ConditionIcon className="h-3 w-3" />
              {conditionConfig.label}
            </Badge>

            {/* Target Price */}
            <span className="text-sm font-semibold">
              {(alert.target_price * 100).toFixed(1)}¢
            </span>

            {/* Current Price */}
            <span className="text-sm text-muted-foreground">
              (atual: {(currentPrice * 100).toFixed(1)}¢)
            </span>

            {/* Status Badges */}
            {wasTriggered && (
              <Badge variant="secondary" className="gap-1">
                <BellOff className="h-3 w-3" />
                Acionado{' '}
                {formatDistanceToNow(new Date(alert.triggered_at!), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </Badge>
            )}

            {!isActive && !wasTriggered && (
              <Badge variant="outline" className="gap-1">
                <Pause className="h-3 w-3" />
                Pausado
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          {!compact && isActive && !wasTriggered && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Distância do alvo</span>
                <span>{progress.toFixed(0)}%</span>
              </div>
              <Progress value={progress} className="h-2" />

              {/* Price Indicator */}
              {isAtTarget && (
                <div className="flex items-center gap-1 text-xs text-green-500 font-medium">
                  <Bell className="h-3 w-3 animate-bounce" />
                  Preço no alvo!
                </div>
              )}
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground">
            Criado{' '}
            {formatDistanceToNow(new Date(alert.created_at), {
              addSuffix: true,
              locale: ptBR
            })}
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

// ============================================================================
// COMPACT VARIANT
// ============================================================================

export interface AlertItemCompactProps {
  alert: PriceAlert
  onClick?: () => void
}

/**
 * AlertItemCompact - Compact inline variant
 *
 * Smaller version for use in tight spaces like market cards.
 */
export function AlertItemCompact({ alert, onClick }: AlertItemCompactProps) {
  const conditionConfig = CONDITION_CONFIG[alert.condition]
  const ConditionIcon = conditionConfig.icon

  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg
        ${conditionConfig.bgColor} ${conditionConfig.borderColor}
        border cursor-pointer hover:shadow-md transition-all
      `}
    >
      <ConditionIcon className={`h-4 w-4 ${conditionConfig.color} shrink-0`} />
      <span className="text-sm font-medium truncate flex-1">
        {conditionConfig.label} {(alert.target_price * 100).toFixed(0)}¢
      </span>
      {alert.triggered && (
        <BellOff className="h-4 w-4 text-muted-foreground shrink-0" />
      )}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AlertItem
