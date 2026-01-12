/**
 * Price Chart Controls Component
 *
 * Toolbar for price chart with timeframe selector, chart type toggle,
 * zoom controls, export button, and refresh functionality.
 * Apple-inspired design with glassmorphism and smooth transitions.
 *
 * @feature Timeframe selector buttons (1H, 24H, 7D, 30D, ALL)
 * @feature Chart type toggle (line, area, candlestick)
 * @feature Zoom controls (+, -, reset)
 * @feature Export button (download as PNG)
 * @feature Fullscreen toggle
 * @feature Refresh button with loading state
 * @feature Responsive: collapses to dropdown on mobile
 * @feature Sticky positioning
 */

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Clock,
  RefreshCw,
  Download,
  Maximize2,
  Minimize2,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
  CandlestickChart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ChartTimeRange, ChartType } from './price-chart'

// ============================================================================
// TYPES
// ============================================================================

export interface PriceChartControlsProps {
  /** Currently selected time range */
  currentTimeRange: ChartTimeRange
  /** Callback when time range changes */
  onTimeRangeChange: (range: ChartTimeRange) => void
  /** Currently selected chart type */
  currentChartType?: ChartType
  /** Callback when chart type changes */
  onChartTypeChange?: (type: ChartType) => void
  /** Refresh callback */
  onRefresh?: () => void
  /** Whether refresh is in progress */
  isRefreshing?: boolean
  /** Export callback */
  onExport?: () => void
  /** Fullscreen toggle callback */
  onFullscreen?: () => void
  /** Whether fullscreen is active */
  isFullscreen?: boolean
  /** Custom CSS class names */
  className?: string
  /** Available time ranges */
  availableTimeRanges?: ChartTimeRange[]
  /** Show chart type selector */
  showChartType?: boolean
  /** Show zoom controls */
  showZoom?: boolean
  /** Show export button */
  showExport?: boolean
  /** Show fullscreen button */
  showFullscreen?: boolean
  /** Variant affecting layout */
  variant?: 'default' | 'compact' | 'minimal'
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TIME_RANGES: ChartTimeRange[] = ['1H', '24H', '7D', '30D', 'ALL']

const TIME_RANGE_LABELS: Record<ChartTimeRange, string> = {
  '1H': '1H',
  '24H': '24H',
  '7D': '7D',
  '30D': '30D',
  'ALL': 'ALL'
}

const CHART_TYPES: Array<{ value: ChartType; label: string; icon: React.ReactNode }> = [
  { value: 'line', label: 'Line', icon: <LineChartIcon className="w-4 h-4" /> },
  { value: 'area', label: 'Area', icon: <AreaChartIcon className="w-4 h-4" /> },
  { value: 'candlestick', label: 'Candle', icon: <CandlestickChart className="w-4 h-4" /> }
]

// ============================================================================
// STYLES
// ============================================================================

const styles = {
  container: cn(
    'flex items-center justify-between gap-2',
    'p-1 rounded-lg bg-muted/30',
    'border border-border/30'
  ),
  timeframeGroup: 'flex items-center gap-1',
  chartTypeGroup: 'flex items-center gap-1',
  actionGroup: 'flex items-center gap-1',
  button: cn(
    'h-7 px-2.5 text-xs font-medium rounded-md',
    'transition-all duration-200',
    'hover:bg-background/50',
    'focus-visible:ring-2 focus-visible:ring-ring',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  ),
  buttonActive: cn(
    'bg-background shadow-sm',
    'text-foreground border border-border/50'
  ),
  buttonInactive: cn(
    'text-muted-foreground',
    'hover:text-foreground'
  ),
  iconButton: cn(
    'h-7 w-7 p-0 rounded-md',
    'flex items-center justify-center',
    'hover:bg-background/50',
    'transition-colors'
  )
}

// ============================================================================
// TIMEFRAME BUTTON COMPONENT
// ============================================================================

interface TimeframeButtonProps {
  value: ChartTimeRange
  isActive: boolean
  onClick: () => void
  isMobile?: boolean
}

function TimeframeButton({ value, isActive, onClick, isMobile }: TimeframeButtonProps) {
  if (isMobile) {
    return null // Handled by Select component
  }

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(styles.button, isActive ? styles.buttonActive : styles.buttonInactive)}
      aria-pressed={isActive}
      aria-label={`Show ${TIME_RANGE_LABELS[value]} timeframe`}
    >
      {TIME_RANGE_LABELS[value]}
    </motion.button>
  )
}

// ============================================================================
// CHART TYPE BUTTON COMPONENT
// ============================================================================

interface ChartTypeButtonProps {
  type: ChartType
  isActive: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function ChartTypeButton({ type, isActive, onClick, icon, label }: ChartTypeButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        styles.iconButton,
        isActive && styles.buttonActive
      )}
      aria-pressed={isActive}
      aria-label={`Switch to ${label} chart`}
      title={label}
    >
      {icon}
    </motion.button>
  )
}

// ============================================================================
// ACTION BUTTON COMPONENT
// ============================================================================

interface ActionButtonProps {
  icon: React.ReactNode
  label: string
  onClick?: () => void
  isSpinning?: boolean
  disabled?: boolean
}

function ActionButton({ icon, label, onClick, isSpinning, disabled }: ActionButtonProps) {
  return (
    <motion.button
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        styles.iconButton,
        !onClick && 'cursor-default'
      )}
      aria-label={label}
      title={label}
    >
      {isSpinning ? (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          {icon}
        </motion.div>
      ) : (
        icon
      )}
    </motion.button>
  )
}

// ============================================================================
// MOBILE SELECT COMPONENT
// ============================================================================

interface MobileTimeframeSelectProps {
  value: ChartTimeRange
  options: ChartTimeRange[]
  onChange: (value: ChartTimeRange) => void
  className?: string
}

function MobileTimeframeSelect({ value, options, onChange, className }: MobileTimeframeSelectProps) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        className={cn(
          'h-8 w-[70px] text-xs',
          'bg-background/50',
          className
        )}
      >
        <Clock className="w-3 h-3 mr-1" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="text-xs">
            {TIME_RANGE_LABELS[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PriceChartControls = React.memo(function PriceChartControls({
  currentTimeRange,
  onTimeRangeChange,
  currentChartType = 'area',
  onChartTypeChange,
  onRefresh,
  isRefreshing = false,
  onExport,
  onFullscreen,
  isFullscreen = false,
  className,
  availableTimeRanges = TIME_RANGES,
  showChartType = true,
  showZoom = false,
  showExport = true,
  showFullscreen = true,
  variant = 'default'
}: PriceChartControlsProps) {
  // Detect mobile (client-side only)
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Memoize available time ranges
  const timeRanges = useMemo(
    () => availableTimeRanges.filter((range) => TIME_RANGES.includes(range)),
    [availableTimeRanges]
  )

  // Handle time range change
  const handleTimeRangeChange = React.useCallback(
    (range: ChartTimeRange | string) => {
      onTimeRangeChange(range as ChartTimeRange)
    },
    [onTimeRangeChange]
  )

  // Handle chart type change
  const handleChartTypeChange = React.useCallback(
    () => {
      if (!onChartTypeChange) return
      const types: ChartType[] = ['line', 'area', 'candlestick']
      const currentIndex = types.indexOf(currentChartType)
      const nextType = types[(currentIndex + 1) % types.length]
      onChartTypeChange(nextType)
    },
    [currentChartType, onChartTypeChange]
  )

  // Compact variant shows minimal controls
  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {isMobile ? (
          <MobileTimeframeSelect
            value={currentTimeRange}
            options={timeRanges}
            onChange={handleTimeRangeChange}
          />
        ) : (
          <div className="flex items-center gap-1">
            {timeRanges.map((range) => (
              <TimeframeButton
                key={range}
                value={range}
                isActive={range === currentTimeRange}
                onClick={() => handleTimeRangeChange(range)}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={cn(styles.container, className)}>
      {/* Left side: Time range selector */}
      <div className={styles.timeframeGroup}>
        {isMobile ? (
          <MobileTimeframeSelect
            value={currentTimeRange}
            options={timeRanges}
            onChange={handleTimeRangeChange}
          />
        ) : (
          timeRanges.map((range) => (
            <TimeframeButton
              key={range}
              value={range}
              isActive={range === currentTimeRange}
              onClick={() => handleTimeRangeChange(range)}
              isMobile={isMobile}
            />
          ))
        )}
      </div>

      {/* Right side: Action buttons */}
      <div className={styles.actionGroup}>
        {/* Chart type selector */}
        {showChartType && onChartTypeChange && !isMobile && (
          <div className={styles.chartTypeGroup}>
            {CHART_TYPES.map(({ value, label, icon }) => (
              <ChartTypeButton
                key={value}
                type={value}
                isActive={currentChartType === value}
                onClick={() => onChartTypeChange(value)}
                icon={icon}
                label={label}
              />
            ))}
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <ActionButton
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            label="Refresh"
            onClick={onRefresh}
            isSpinning={isRefreshing}
            disabled={isRefreshing}
          />
        )}

        {/* Export button */}
        {showExport && onExport && !isMobile && (
          <ActionButton
            icon={<Download className="w-3.5 h-3.5" />}
            label="Export chart"
            onClick={onExport}
          />
        )}

        {/* Fullscreen button */}
        {showFullscreen && onFullscreen && !isMobile && (
          <ActionButton
            icon={isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            onClick={onFullscreen}
          />
        )}
      </div>
    </div>
  )
})

PriceChartControls.displayName = 'PriceChartControls'

// ============================================================================
// STANDALONE TIMEFRAME SELECTOR
// ============================================================================

export interface TimeframeSelectorProps {
  value: ChartTimeRange
  onChange: (value: ChartTimeRange) => void
  options?: ChartTimeRange[]
  className?: string
  variant?: 'buttons' | 'select'
}

export const TimeframeSelector = React.memo(function TimeframeSelector({
  value,
  onChange,
  options = TIME_RANGES,
  className,
  variant = 'buttons'
}: TimeframeSelectorProps) {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (variant === 'select' || isMobile) {
    return (
      <MobileTimeframeSelect
        value={value}
        options={options}
        onChange={onChange}
        className={className}
      />
    )
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {options.map((range) => (
        <TimeframeButton
          key={range}
          value={range}
          isActive={range === value}
          onClick={() => onChange(range)}
        />
      ))}
    </div>
  )
})

TimeframeSelector.displayName = 'TimeframeSelector'
