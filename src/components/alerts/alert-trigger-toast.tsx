/**
 * Alert Trigger Toast Component
 *
 * Toast notification shown when a price alert is triggered.
 * Features priority badges, action buttons, sound/vibration, and stacking.
 *
 * @features
 * - Market name and question
 * - Condition hit display with colors
 * - Current and target price comparison
 * - Timestamp with time ago
 * - Priority badges (high/medium/low)
 * - Action buttons (View Market, Dismiss)
 * - Optional notification sound
 * - Haptic feedback on mobile
 * - Auto-dismiss with countdown
 * - Manual dismiss option
 * - Smooth animations (slide in, bounce)
 * - Toast stacking for multiple alerts
 * - ARIA live region for accessibility
 *
 * @example
 * ```tsx
 * <AlertTriggerToast
 *   trigger={trigger}
 *   onDismiss={() => console.log('dismiss')}
 *   onViewMarket={() => router.push(`/markets/${id}`)}
 * />
 * ```
 */

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// UI Components
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

// Store & Types
import { AlertTrigger, AlertCondition, AlertPriority } from '@/types/alert.types'

// ============================================================================
// TYPES
// ============================================================================

export interface AlertTriggerToastProps {
  /** Trigger data */
  trigger: AlertTrigger
  /** Associated market data */
  market?: {
    id: string
    question: string
    slug?: string
    category: string
  }
  /** Dismiss callback */
  onDismiss: () => void
  /** View market callback */
  onViewMarket: () => void
  /** Toast priority */
  priority?: AlertPriority
  /** Auto-dismiss delay (ms), 0 to disable */
  autoDismissDelay?: number
  /** Enable sound */
  enableSound?: boolean
  /** Enable vibration on mobile */
  enableVibration?: boolean
  /** Sound file URL */
  soundUrl?: string
}

// ============================================================================
// CONSTANTS
// ============================================================================

const PRIORITY_CONFIG = {
  [AlertPriority.URGENT]: {
    icon: AlertTriangle,
    label: 'Urgente',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
    borderColor: 'border-red-500',
    gradient: 'from-red-500 to-orange-500'
  },
  [AlertPriority.HIGH]: {
    icon: CheckCircle2,
    label: 'Alta',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
    borderColor: 'border-orange-500',
    gradient: 'from-orange-500 to-yellow-500'
  },
  [AlertPriority.MEDIUM]: {
    icon: Bell,
    label: 'Média',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
    borderColor: 'border-yellow-500',
    gradient: 'from-yellow-500 to-blue-500'
  },
  [AlertPriority.LOW]: {
    icon: Info,
    label: 'Baixa',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500',
    borderColor: 'border-blue-500',
    gradient: 'from-blue-500 to-purple-500'
  }
}

const CONDITION_CONFIG = {
  [AlertCondition.ABOVE]: {
    label: 'acima de',
    icon: TrendingUp,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10'
  },
  [AlertCondition.BELOW]: {
    label: 'abaixo de',
    icon: TrendingDown,
    color: 'text-red-500',
    bgColor: 'bg-red-500/10'
  },
  [AlertCondition.CROSS]: {
    label: 'cruzou',
    icon: ExternalLink,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10'
  },
  [AlertCondition.EXACT]: {
    label: 'atingiu exatamente',
    icon: CheckCircle2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10'
  }
}

const AUTO_DISMISS_DELAY = 10000 // 10 seconds
const DISMISS_COUNTDOWN_STEP = 100 // Update every 100ms

// ============================================================================
// ALERT TRIGGER TOAST
// ============================================================================

/**
 * AlertTriggerToast - Toast notification for triggered alerts
 *
 * Displays an alert trigger with comprehensive information and actions.
 */
export function AlertTriggerToast({
  trigger,
  market,
  onDismiss,
  onViewMarket,
  priority = AlertPriority.MEDIUM,
  autoDismissDelay = AUTO_DISMISS_DELAY,
  enableSound = false,
  enableVibration = true,
  soundUrl = '/sounds/alert.mp3'
}: AlertTriggerToastProps) {
  // State
  const [timeLeft, setTimeLeft] = useState(autoDismissDelay)
  const [isPaused, setIsPaused] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Config
  const priorityConfig = PRIORITY_CONFIG[priority]
  const conditionConfig = CONDITION_CONFIG[trigger.condition]
  const PriorityIcon = priorityConfig.icon
  const ConditionIcon = conditionConfig.icon

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Play sound on mount
  useEffect(() => {
    if (!enableSound) return

    try {
      audioRef.current = new Audio(soundUrl)
      audioRef.current.volume = 0.5
      audioRef.current.play().catch((err) => {
        console.warn('Failed to play alert sound:', err)
      })
    } catch (err) {
      console.warn('Failed to create audio element:', err)
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [enableSound, soundUrl])

  // Vibrate on mount (mobile only)
  useEffect(() => {
    if (!enableVibration || !('vibrate' in navigator)) return

    // Vibrate pattern: [duration, pause, duration, ...]
    navigator.vibrate([200, 100, 200])
  }, [enableVibration])

  // Auto-dismiss countdown
  useEffect(() => {
    if (autoDismissDelay === 0 || isPaused) return

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= DISMISS_COUNTDOWN_STEP) {
          onDismiss()
          return 0
        }
        return prev - DISMISS_COUNTDOWN_STEP
      })
    }, DISMISS_COUNTDOWN_STEP)

    return () => clearInterval(interval)
  }, [autoDismissDelay, isPaused, onDismiss])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleMouseEnter = () => setIsPaused(true)
  const handleMouseLeave = () => setIsPaused(false)
  const handleTouchStart = () => setIsPaused(true)
  const handleTouchEnd = () => setIsPaused(false)

  const handleDismiss = () => {
    onDismiss()
  }

  const handleViewMarket = () => {
    onViewMarket()
    onDismiss()
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const progressPercent = (timeLeft / autoDismissDelay) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative w-full max-w-md"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ARIA Live Region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        className="sr-only"
      >
        Alerta acionado: {market?.question || 'Mercado'} {conditionConfig.label}{' '}
        {(trigger.target_price * 100).toFixed(1)}¢
      </div>

      <Card
        className={`
          overflow-hidden border-l-4 shadow-lg
          ${priorityConfig.borderColor}
        `}
      >
        {/* Priority Header */}
        <div className={`bg-gradient-to-r ${priorityConfig.gradient} px-4 py-2`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PriorityIcon className="h-4 w-4 text-white" />
              <span className="text-sm font-semibold text-white">
                Alerta Acionado
              </span>
            </div>
            <Badge variant="secondary" className="gap-1">
              {priorityConfig.label}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Market Info */}
          {market && (
            <div className="space-y-1">
              <p className="text-sm font-medium line-clamp-2">{market.question}</p>
              <p className="text-xs text-muted-foreground">{market.category}</p>
            </div>
          )}

          {/* Condition Display */}
          <div className={`
            flex items-center gap-2 px-3 py-2 rounded-lg
            ${conditionConfig.bgColor}
          `}>
            <ConditionIcon className={`h-4 w-4 ${conditionConfig.color}`} />
            <span className="text-sm">
              Preço <span className="font-medium">{conditionConfig.label}</span>{' '}
              <span className={`font-bold ${conditionConfig.color}`}>
                {(trigger.target_price * 100).toFixed(1)}¢
              </span>
            </span>
          </div>

          {/* Price Comparison */}
          <div className="flex items-center justify-between text-sm">
            <div>
              <span className="text-muted-foreground">Preço atual:</span>{' '}
              <span className="font-semibold">
                {(trigger.current_price * 100).toFixed(1)}¢
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Alvo:</span>{' '}
              <span className="font-semibold">
                {(trigger.target_price * 100).toFixed(1)}¢
              </span>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground">
            Acionado{' '}
            {formatDistanceToNow(new Date(trigger.timestamp), {
              addSuffix: true,
              locale: ptBR
            })}
          </div>

          {/* Auto-dismiss Progress Bar */}
          {autoDismissDelay > 0 && (
            <Progress value={progressPercent} className="h-1" />
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleViewMarket}
              className="flex-1 gap-2"
              size="sm"
            >
              <ExternalLink className="h-4 w-4" />
              Ver Mercado
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Dispensar
            </Button>
          </div>
        </div>

        {/* Countdown Badge (when paused) */}
        {isPaused && autoDismissDelay > 0 && (
          <div className="absolute top-2 right-2">
            <Badge variant="secondary" className="text-xs">
              {Math.ceil(timeLeft / 1000)}s
            </Badge>
          </div>
        )}
      </Card>
    </motion.div>
  )
}

// ============================================================================
// TOAST STACK MANAGER
// ============================================================================

export interface AlertToastStackProps {
  /** Array of triggers to display */
  triggers: Array<AlertTrigger & { market?: { id: string; question: string; slug?: string; category: string } }>
  /** Dismiss callback */
  onDismiss: (triggerId: string) => void
  /** View market callback */
  onViewMarket: (marketId: string) => void
  /** Maximum number of toasts to show */
  maxToasts?: number
  /** Auto-dismiss delay */
  autoDismissDelay?: number
}

/**
 * AlertToastStack - Manages multiple toast notifications
 *
 * Stacks multiple toasts with proper spacing and animations.
 */
export function AlertToastStack({
  triggers,
  onDismiss,
  onViewMarket,
  maxToasts = 3,
  autoDismissDelay = AUTO_DISMISS_DELAY
}: AlertToastStackProps) {
  // Show only the most recent maxToasts
  const visibleTriggers = triggers.slice(-maxToasts)

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visibleTriggers.map((trigger) => (
          <motion.div
            key={trigger.alert_id}
            layout
            className="pointer-events-auto"
          >
            <AlertTriggerToast
              trigger={trigger}
              market={trigger.market}
              onDismiss={() => onDismiss(trigger.alert_id)}
              onViewMarket={() => onViewMarket(trigger.market_id)}
              autoDismissDelay={autoDismissDelay}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AlertTriggerToast
