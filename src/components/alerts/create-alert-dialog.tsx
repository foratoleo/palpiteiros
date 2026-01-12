/**
 * Create Alert Dialog Component
 *
 * Dialog for creating new price alerts with comprehensive form validation.
 * Features market selector, condition picker, target price input with slider,
 * and notification preferences.
 *
 * @features
 * - Market selector with search and preview
 * - Condition selector (above/below/cross/exact)
 * - Target price input with visual slider
 * - Notification preferences (push, email, in-app)
 * - Repeat options (one-time, always)
 * - Optional expiration date/time
 * - Real-time preview summary
 * - Form validation with error messages
 * - Loading state during creation
 * - Success toast notification
 * - Keyboard trap and focus management
 *
 * @example
 * ```tsx
 * <CreateAlertDialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   marketId={market.id}
 * />
 * ```
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Plus, AlertCircle, Check, Info } from 'lucide-react'

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

// Store & Types
import { useAlertStore, useMarketStore } from '@/stores'
import { CreateAlertInput, AlertCondition, AlertPriority } from '@/types/alert.types'
import { AlertForm, AlertFormValues } from './alert-form'

// ============================================================================
// TYPES
// ============================================================================

export interface CreateAlertDialogProps {
  /** Whether dialog is open */
  open: boolean
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void
  /** Optional pre-selected market ID */
  marketId?: string
  /** Optional pre-selected condition */
  defaultCondition?: AlertCondition
  /** Optional pre-selected target price */
  defaultTargetPrice?: number
  /** Callback when alert is created successfully */
  onSuccess?: (alertId: string) => void
}

// ============================================================================
// CREATE ALERT DIALOG
// ============================================================================

/**
 * CreateAlertDialog - Dialog for creating price alerts
 *
 * Provides a comprehensive form interface for creating new price alerts
 * with validation, preview, and error handling.
 */
export function CreateAlertDialog({
  open,
  onOpenChange,
  marketId,
  defaultCondition,
  defaultTargetPrice,
  onSuccess
}: CreateAlertDialogProps) {
  // State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewValues, setPreviewValues] = useState<AlertFormValues | null>(null)

  // Store
  const { addAlert } = useAlertStore()
  const { markets } = useMarketStore()

  // ============================================================================
  // EFFECTS
  // ============================================================================

  // Reset error when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setError(null)
      setPreviewValues(null)
    }
  }, [open])

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleFormChange = useCallback((values: AlertFormValues) => {
    setPreviewValues(values)
    setError(null)
  }, [])

  const handleSubmit = async (values: AlertFormValues) => {
    if (!values.market_id) {
      setError('Selecione um mercado')
      return
    }

    if (!values.target_price || values.target_price <= 0 || values.target_price >= 1) {
      setError('O preço alvo deve estar entre 0 e 100 centavos')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const market = markets.find((m) => m.id === values.market_id)
      if (!market) {
        throw new Error('Mercado não encontrado')
      }

      const input: CreateAlertInput = {
        market_id: values.market_id,
        market,
        condition: values.condition,
        target_price: values.target_price,
        priority: AlertPriority.MEDIUM,
        channels: values.notification_channels,
        repeat: values.repeat,
        cooldown_minutes: values.cooldown_minutes,
        custom_message: values.notes
      }

      const alertId = addAlert(input)

      // Show success toast
      // TODO: Use toast from ui.store
      console.log('Alert created successfully:', alertId)

      // Close dialog
      onOpenChange(false)

      // Call success callback
      onSuccess?.(alertId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar alerta')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Criar Novo Alerta
          </DialogTitle>
          <DialogDescription>
            Configure um alerta de preço para ser notificado quando o mercado atingir o valor alvo.
          </DialogDescription>
        </DialogHeader>

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Alert Form */}
        <AlertForm
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          marketId={marketId}
          defaultCondition={defaultCondition}
          defaultTargetPrice={defaultTargetPrice}
          disabled={isSubmitting}
        />

        {/* Preview Section */}
        {previewValues && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-lg bg-muted/50 border"
          >
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">Resumo do Alerta</p>
                <p className="text-sm text-muted-foreground">
                  Você será notificado quando o preço do mercado{' '}
                  <span className="font-medium text-foreground">
                    {markets.find((m) => m.id === previewValues.market_id)?.question || 'selecionado'}
                  </span>{' '}
                  {previewValues.condition === AlertCondition.ABOVE ? 'for maior ou igual a' : ''}
                  {previewValues.condition === AlertCondition.BELOW ? 'for menor ou igual a' : ''}
                  {previewValues.condition === AlertCondition.CROSS ? 'cruzar' : ''}
                  {previewValues.condition === AlertCondition.EXACT ? 'for exatamente' : ''}{' '}
                  <span className="font-semibold text-primary">
                    {(previewValues.target_price * 100).toFixed(1)}¢
                  </span>
                  .
                </p>
                {previewValues.repeat && (
                  <p className="text-xs text-muted-foreground">
                    Este alerta se repetirá após ser acionado.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={() => previewValues && handleSubmit(previewValues)}
            disabled={isSubmitting || !previewValues}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Criando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Criar Alerta
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// TRIGGER BUTTON
// ============================================================================

export interface CreateAlertButtonProps {
  /** Button variant */
  variant?: 'default' | 'outline' | 'ghost' | 'secondary'
  /** Button size */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /** Optional market ID to pre-select */
  marketId?: string
  /** Callback when dialog opens */
  onOpenChange?: (open: boolean) => void
  /** Callback when alert is created */
  onSuccess?: (alertId: string) => void
  /** Children (optional custom button content) */
  children?: React.ReactNode
}

/**
 * CreateAlertButton - Button that opens the create alert dialog
 *
 * Convenience component that wraps the dialog with a trigger button.
 */
export function CreateAlertButton({
  variant = 'default',
  size = 'default',
  marketId,
  onOpenChange,
  onSuccess,
  children
}: CreateAlertButtonProps) {
  const [open, setOpen] = useState(false)

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    onOpenChange?.(newOpen)
  }

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)} className="gap-2">
        {children || (
          <>
            <Plus className="h-4 w-4" />
            Criar Alerta
          </>
        )}
      </Button>

      <CreateAlertDialog
        open={open}
        onOpenChange={handleOpenChange}
        marketId={marketId}
        onSuccess={onSuccess}
      />
    </>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default CreateAlertDialog
