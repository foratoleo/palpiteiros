/**
 * Alert Form Component
 *
 * Reusable form for creating and editing price alerts.
 * Features market selector, condition picker, target price input with slider,
 * notification preferences, and comprehensive validation.
 *
 * @features
 * - Market combobox with search and preview
 * - Condition selector (above/below/cross/exact)
 * - Target price input with synchronized slider
 * - Notification channel checkboxes
 * - Repeat toggle with cooldown input
 * - Optional expiration date/time picker
 * - Optional notes textarea
 * - Real-time form preview
 * - Smart defaults (current price ±10%)
 * - Comprehensive validation
 *
 * @example
 * ```tsx
 * <AlertForm
 *   onSubmit={(values) => console.log(values)}
 *   marketId={market.id}
 *   defaultCondition={AlertCondition.ABOVE}
 * />
 * ```
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, ExternalLink, Calendar, Clock } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

// Types
import { AlertCondition, NotificationChannel } from '@/types/alert.types'

// ============================================================================
// TYPES
// ============================================================================

export interface AlertFormValues {
  /** Market ID */
  market_id: string
  /** Alert condition */
  condition: AlertCondition
  /** Target price (0-1) */
  target_price: number
  /** Notification channels */
  notification_channels: NotificationChannel[]
  /** Whether alert should repeat */
  repeat: boolean
  /** Cooldown between triggers (minutes) */
  cooldown_minutes: number
  /** Optional notes */
  notes?: string
  /** Optional expiration date */
  expires_at?: string
}

export interface AlertFormProps {
  /** Submit callback */
  onSubmit: (values: AlertFormValues) => void | Promise<void>
  /** Optional change callback (for preview) */
  onChange?: (values: AlertFormValues) => void
  /** Optional pre-selected market ID */
  marketId?: string
  /** Optional default condition */
  defaultCondition?: AlertCondition
  /** Optional default target price */
  defaultTargetPrice?: number
  /** Whether form is disabled */
  disabled?: boolean
  /** Available markets */
  markets?: Array<{ id: string; question: string; current_price: number }>
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CONDITION_OPTIONS = [
  { value: AlertCondition.ABOVE, label: 'Acima de (≥)', icon: TrendingUp, color: 'text-green-500' },
  { value: AlertCondition.BELOW, label: 'Abaixo de (≤)', icon: TrendingDown, color: 'text-red-500' },
  {
    value: AlertCondition.CROSS,
    label: 'Cruzar',
    icon: ExternalLink,
    color: 'text-blue-500'
  },
  { value: AlertCondition.EXACT, label: 'Exatamente', icon: Calendar, color: 'text-purple-500' }
]

const NOTIFICATION_CHANNELS = [
  { value: NotificationChannel.IN_APP, label: 'Na aplicação', description: 'Notificação no app' },
  { value: NotificationChannel.PUSH, label: 'Push', description: 'Notificação push no dispositivo' },
  { value: NotificationChannel.EMAIL, label: 'E-mail', description: 'Enviar por e-mail' }
]

// ============================================================================
// ALERT FORM COMPONENT
// ============================================================================

/**
 * AlertForm - Alert creation/editing form
 *
 * Provides a comprehensive form interface with validation and real-time preview.
 */
export function AlertForm({
  onSubmit,
  onChange,
  marketId,
  defaultCondition = AlertCondition.ABOVE,
  defaultTargetPrice,
  disabled = false,
  markets = []
}: AlertFormProps) {
  // State
  const [selectedMarketId, setSelectedMarketId] = useState<string>(marketId || '')

  // Calculate smart defaults
  const currentPrice = useMemo(() => {
    const market = markets.find((m) => m.id === selectedMarketId)
    return market?.current_price || 0.5
  }, [selectedMarketId, markets])

  const defaultTarget = useMemo(() => {
    if (defaultTargetPrice !== undefined) return defaultTargetPrice
    // Default to current price ±10% based on condition
    if (defaultCondition === AlertCondition.ABOVE) {
      return Math.min(0.99, currentPrice * 1.1)
    } else if (defaultCondition === AlertCondition.BELOW) {
      return Math.max(0.01, currentPrice * 0.9)
    }
    return currentPrice
  }, [currentPrice, defaultCondition, defaultTargetPrice])

  // Form setup
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<AlertFormValues>({
    defaultValues: {
      market_id: marketId || '',
      condition: defaultCondition,
      target_price: defaultTarget,
      notification_channels: [NotificationChannel.IN_APP],
      repeat: false,
      cooldown_minutes: 5,
      notes: '',
      expires_at: undefined
    },
    mode: 'onChange'
  })

  const watchedValues = watch()

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Notify parent of changes (for preview)
  useEffect(() => {
    if (onChange && isValid) {
      onChange(watchedValues)
    }
  }, [watchedValues, isValid, onChange])

  // Update market when marketId prop changes
  useEffect(() => {
    if (marketId && marketId !== selectedMarketId) {
      setSelectedMarketId(marketId)
      setValue('market_id', marketId)
    }
  }, [marketId, selectedMarketId, setValue])

  // ============================================================================
  // HANDLERS
// ============================================================================

  const handleMarketChange = (marketId: string) => {
    setSelectedMarketId(marketId)
    setValue('market_id', marketId)
  }

  const handleConditionChange = (condition: AlertCondition) => {
    setValue('condition', condition)

    // Update target price suggestion
    const newPrice =
      condition === AlertCondition.ABOVE
        ? Math.min(0.99, currentPrice * 1.1)
        : condition === AlertCondition.BELOW
          ? Math.max(0.01, currentPrice * 0.9)
          : currentPrice

    setValue('target_price', newPrice)
  }

  const handleFormSubmit = (data: AlertFormValues) => {
    onSubmit(data)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const selectedMarket = markets.find((m) => m.id === selectedMarketId)

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Market Selector */}
      <div className="space-y-2">
        <Label htmlFor="market_id">Mercado *</Label>
        <Select
          value={selectedMarketId}
          onValueChange={handleMarketChange}
          disabled={disabled}
        >
          <SelectTrigger id="market_id" className="w-full">
            <SelectValue placeholder="Selecione um mercado" />
          </SelectTrigger>
          <SelectContent>
            {markets.map((market) => (
              <SelectItem key={market.id} value={market.id}>
                <div className="flex flex-col">
                  <span className="font-medium">{market.question}</span>
                  <span className="text-xs text-muted-foreground">
                    Preço atual: {(market.current_price * 100).toFixed(1)}¢
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.market_id && (
          <p className="text-sm text-destructive">{errors.market_id.message}</p>
        )}
      </div>

      {/* Condition Selector */}
      <div className="space-y-2">
        <Label>Condição *</Label>
        <div className="grid grid-cols-2 gap-2">
          {CONDITION_OPTIONS.map((option) => {
            const Icon = option.icon
            const isSelected = watchedValues.condition === option.value

            return (
              <Button
                key={option.value}
                type="button"
                variant={isSelected ? 'default' : 'outline'}
                className="h-auto flex-col gap-1 py-3"
                onClick={() => handleConditionChange(option.value)}
                disabled={disabled}
              >
                <Icon className={`h-5 w-5 ${isSelected ? 'text-primary-foreground' : option.color}`} />
                <span className="text-xs">{option.label}</span>
              </Button>
            )
          })}
        </div>
      </div>

      {/* Target Price */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="target_price">Preço Alvo *</Label>
          <Badge variant="secondary">
            Atual: {(currentPrice * 100).toFixed(1)}¢
          </Badge>
        </div>

        {/* Input + Slider */}
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              step="0.1"
              min="0"
              max="100"
              placeholder="50.0"
              {...register('target_price', {
                required: 'Preço alvo é obrigatório',
                min: { value: 0, message: 'Preço deve ser maior que 0' },
                max: { value: 100, message: 'Preço deve ser menor que 100' }
              })}
              className="flex-1"
              disabled={disabled}
              onChange={(e) => {
                const val = parseFloat(e.target.value) / 100
                setValue('target_price', Math.max(0, Math.min(1, val)))
              }}
            />
            <span className="text-sm font-medium text-muted-foreground">¢</span>
          </div>

          <Controller
            name="target_price"
            control={control}
            render={({ field }) => (
              <Slider
                value={[field.value * 100]}
                onValueChange={([val]) => field.onChange(val / 100)}
                min={0}
                max={100}
                step={0.1}
                disabled={disabled}
                className="flex-1"
              />
            )}
          />
        </div>

        {errors.target_price && (
          <p className="text-sm text-destructive">{errors.target_price.message}</p>
        )}

        {/* Visual indicator */}
        {selectedMarket && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {watchedValues.condition === AlertCondition.ABOVE &&
                watchedValues.target_price > currentPrice &&
                'O preço precisa subir para acionar'}
              {watchedValues.condition === AlertCondition.ABOVE &&
                watchedValues.target_price <= currentPrice &&
                'O preço já está acima do alvo'}
              {watchedValues.condition === AlertCondition.BELOW &&
                watchedValues.target_price < currentPrice &&
                'O preço precisa cair para acionar'}
              {watchedValues.condition === AlertCondition.BELOW &&
                watchedValues.target_price >= currentPrice &&
                'O preço já está abaixo do alvo'}
            </span>
          </div>
        )}
      </div>

      {/* Notification Channels */}
      <div className="space-y-2">
        <Label>Canais de Notificação *</Label>
        <div className="space-y-2">
          {NOTIFICATION_CHANNELS.map((channel) => (
            <div
              key={channel.value}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <input
                type="checkbox"
                id={`channel-${channel.value}`}
                {...register('notification_channels', {
                  required: 'Selecione pelo menos um canal de notificação'
                })}
                value={channel.value}
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <div className="flex-1">
                <label
                  htmlFor={`channel-${channel.value}`}
                  className="text-sm font-medium cursor-pointer"
                >
                  {channel.label}
                </label>
                <p className="text-xs text-muted-foreground">{channel.description}</p>
              </div>
            </div>
          ))}
        </div>
        {errors.notification_channels && (
          <p className="text-sm text-destructive">{errors.notification_channels.message}</p>
        )}
      </div>

      {/* Repeat & Cooldown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="repeat">Repetir Alerta</Label>
            <p className="text-xs text-muted-foreground">
              Reativar alerta automaticamente após ser acionado
            </p>
          </div>
          <Controller
            name="repeat"
            control={control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={disabled} />
            )}
          />
        </div>

        {watchedValues.repeat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-2"
          >
            <Label htmlFor="cooldown_minutes">Cooldown (minutos)</Label>
            <Input
              type="number"
              min="1"
              max="1440"
              placeholder="5"
              {...register('cooldown_minutes', {
                required: 'Cooldown é obrigatório quando repetir está ativado',
                min: { value: 1, message: 'Cooldown deve ser pelo menos 1 minuto' },
                max: { value: 1440, message: 'Cooldown não pode exceder 24 horas' }
              })}
              disabled={disabled}
            />
            {errors.cooldown_minutes && (
              <p className="text-sm text-destructive">{errors.cooldown_minutes.message}</p>
            )}
          </motion.div>
        )}
      </div>

      {/* Optional Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notas (opcional)</Label>
        <Textarea
          id="notes"
          placeholder="Adicione notas sobre este alerta..."
          {...register('notes')}
          disabled={disabled}
          rows={3}
        />
      </div>

      {/* Hidden submit button for form submission */}
      <button type="submit" className="hidden" />
    </form>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AlertForm
