"use client"

import * as React from "react"
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion"
import { cn } from "@/lib/utils"

// ============================================================================
// NUMBER FORMATTING UTILITIES
// ============================================================================

/**
 * Number Format Options
 */
export interface NumberFormatOptions {
  /** Minimum decimal places */
  minimumFractionDigits?: number
  /** Maximum decimal places */
  maximumFractionDigits?: number
  /** Show sign (+/-) */
  sign?: boolean
  /** Currency code for currency formatting */
  currency?: string
  /** Unit to append */
  unit?: string
  /** Prefix */
  prefix?: string
  /** Suffix */
  suffix?: string
  /** Compact notation (1K, 1M, etc.) */
  compact?: boolean
  /** Locale for formatting */
  locale?: string
}

/**
 * Format number with options
 */
export function formatNumber(
  value: number,
  options: NumberFormatOptions = {}
): string {
  const {
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    sign = false,
    currency,
    unit,
    prefix = "",
    suffix = "",
    compact = false,
    locale = "en-US",
  } = options

  let formatted: string

  // Handle compact notation
  if (compact) {
    const formatter = new Intl.NumberFormat(locale, {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits,
    })
    formatted = formatter.format(value)
  } else if (currency) {
    // Currency formatting
    const formatter = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits,
      maximumFractionDigits,
    })
    formatted = formatter.format(value)
  } else {
    // Standard formatting
    const formatter = new Intl.NumberFormat(locale, {
      minimumFractionDigits,
      maximumFractionDigits,
      signDisplay: sign ? "always" : "auto",
    })
    formatted = formatter.format(value)
  }

  return `${prefix}${formatted}${unit || ""}${suffix}`
}

// ============================================================================
// NUMBER TWEEN PROPS
// ============================================================================

/**
 * Number Tween Props
 */
export interface NumberTweenProps {
  /** Target value */
  value: number
  /** Starting value (default: 0) */
  from?: number
  /** Duration in seconds (default: 1) */
  duration?: number
  /** Number formatting options */
  format?: NumberFormatOptions
  /** Spring stiffness */
  stiffness?: number
  /** Spring damping */
  damping?: number
  /** Custom formatter function */
  formatter?: (value: number) => string
  /** Enable animation (default: true) */
  animate?: boolean
  /** Additional CSS class names */
  className?: string
  /** Content to render after the number */
  children?: React.ReactNode
  /** Trigger animation when value changes */
  triggerOnChange?: boolean
  /** Decimal places for intermediate calculations */
  precision?: number
}

/**
 * NumberTween Component
 *
 * Animated number counter with tweening and formatting support.
 *
 * @example
 * ```tsx
 * <NumberTween value={1234.56} format={{ compact: true }} />
 * // Renders: 1.23K (animated)
 *
 * <NumberTween value={99.99} format={{ currency: "USD" }} />
 * // Renders: $99.99 (animated)
 *
 * <NumberTween value={42} suffix="%" />
 * // Renders: 42% (animated)
 * ```
 */
export function NumberTween({
  value,
  from = 0,
  duration = 1,
  format,
  stiffness = 100,
  damping = 20,
  formatter,
  animate = true,
  className,
  children,
  triggerOnChange = true,
  precision = 2,
}: NumberTweenProps) {
  const [displayValue, setDisplayValue] = React.useState<string | number>(from)
  const [shouldAnimate, setShouldAnimate] = React.useState(false)

  // Motion value for smooth animation
  const motionValue = useMotionValue(from)

  // Spring animation
  const spring = useSpring(motionValue, {
    stiffness,
    damping,
    duration: duration * 1000,
  })

  // Transform to formatted string
  const formattedValue = useTransform(spring, (latest) => {
    return formatter
      ? formatter(latest)
      : formatNumber(latest, { ...format, maximumFractionDigits: precision })
  })

  // Update display value
  React.useEffect(() => {
    const unsubscribe = formattedValue.on("change", (latest) => {
      setDisplayValue(latest)
    })
    return unsubscribe
  }, [formattedValue])

  // Animate to new value
  React.useEffect(() => {
    if (animate && triggerOnChange) {
      setShouldAnimate(true)
      motionValue.set(value)
    }
  }, [value, animate, triggerOnChange, motionValue])

  // Initial animation on mount
  React.useEffect(() => {
    if (animate && !triggerOnChange) {
      setShouldAnimate(true)
      motionValue.set(value)
    }
  }, [])

  return (
    <span className={cn("tabular-nums", className)}>
      {displayValue}
      {children}
    </span>
  )
}

// ============================================================================
// COUNTER PROPS
// ============================================================================

/**
 * Counter Props
 */
export interface CounterProps extends Omit<NumberTweenProps, "value" | "from"> {
  /** Initial value */
  initial?: number
  /** Target value */
  target?: number
  /** Auto-start animation */
  autoStart?: boolean
  /** Callback when animation completes */
  onComplete?: () => void
  /** Loop animation */
  loop?: boolean
  /** Loop delay in seconds */
  loopDelay?: number
}

/**
 * Counter Component
 *
 * Animated counter that counts up/down to a target value.
 *
 * @example
 * ```tsx
 * <Counter initial={0} target={100} duration={2} />
 * // Counts from 0 to 100 over 2 seconds
 * ```
 */
export function Counter({
  initial = 0,
  target = 0,
  duration = 1,
  autoStart = true,
  onComplete,
  loop = false,
  loopDelay = 1,
  ...props
}: CounterProps) {
  const [value, setValue] = React.useState(initial)
  const [isAnimating, setIsAnimating] = React.useState(false)

  const animateTo = React.useCallback(
    (toValue: number) => {
      setIsAnimating(true)
      setValue(toValue)

      // Schedule completion callback
      setTimeout(() => {
        setIsAnimating(false)
        onComplete?.()

        // Handle looping
        if (loop) {
          setTimeout(() => {
            animateTo(initial)
          }, loopDelay * 1000)
        }
      }, duration * 1000)
    },
    [duration, onComplete, loop, loopDelay, initial]
  )

  // Auto-start
  React.useEffect(() => {
    if (autoStart) {
      animateTo(target)
    }
  }, [autoStart, target, animateTo])

  return (
    <NumberTween
      value={value}
      from={initial}
      duration={duration}
      animate={isAnimating}
      {...props}
    />
  )
}

// ============================================================================
// PROGRESS BAR WITH NUMBER
// ============================================================================

/**
 * NumberProgress Props
 */
export interface NumberProgressProps {
  /** Current value */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Show percentage */
  showPercentage?: boolean
  /** Show count (e.g., 75/100) */
  showCount?: boolean
  /** Bar color class */
  barColor?: string
  /** Background color class */
  bgColor?: string
  /** Height of the bar */
  height?: string
  /** Animation duration */
  duration?: number
  /** Format options for the number */
  format?: NumberFormatOptions
  /** Container className */
  className?: string
}

/**
 * NumberProgress Component
 *
 * Progress bar with animated number display.
 *
 * @example
 * ```tsx
 * <NumberProgress value={75} max={100} showPercentage />
 * // Shows: 75% with a progress bar
 * ```
 */
export function NumberProgress({
  value,
  max = 100,
  showPercentage = true,
  showCount = false,
  barColor = "bg-primary",
  bgColor = "bg-secondary",
  height = "h-2",
  duration = 0.5,
  format,
  className,
}: NumberProgressProps) {
  const percentage = (value / max) * 100

  return (
    <div className={cn("space-y-2", className)}>
      {(showPercentage || showCount) && (
        <div className="flex justify-between text-sm">
          {showCount && (
            <span className="text-muted-foreground">
              <NumberTween value={value} format={format} />
              <span className="text-muted-foreground"> / {formatNumber(max, format)}</span>
            </span>
          )}
          {showPercentage && (
            <span className="font-medium">
              <NumberTween
                value={percentage}
                format={{ maximumFractionDigits: 0, suffix: "%" }}
                duration={duration}
              />
            </span>
          )}
        </div>
      )}
      <div className={cn("w-full rounded-full overflow-hidden", bgColor, height)}>
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration, ease: "easeOut" }}
        />
      </div>
    </div>
  )
}

// ============================================================================
// CIRCULAR PROGRESS WITH NUMBER
// ============================================================================

/**
 * NumberCircularProgress Props
 */
export interface NumberCircularProgressProps {
  /** Current value */
  value: number
  /** Maximum value (default: 100) */
  max?: number
  /** Size in pixels (default: 120) */
  size?: number
  /** Stroke width (default: 8) */
  strokeWidth?: number
  /** Progress color */
  progressColor?: string
  /** Track color */
  trackColor?: string
  /** Show number in center */
  showNumber?: boolean
  /** Number format options */
  format?: NumberFormatOptions
  /** Animation duration */
  duration?: number
  /** Container className */
  className?: string
}

/**
 * NumberCircularProgress Component
 *
 * Circular progress indicator with animated number in center.
 *
 * @example
 * ```tsx
 * <NumberCircularProgress value={75} size={150} />
 * ```
 */
export function NumberCircularProgress({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  progressColor = "hsl(var(--primary))",
  trackColor = "hsl(var(--secondary))",
  showNumber = true,
  format,
  duration = 0.5,
  className,
}: NumberCircularProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), max)
  const percentage = normalizedValue / max
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - percentage)

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>

      {/* Center number */}
      {showNumber && (
        <div className="absolute inset-0 flex items-center justify-center">
          <NumberTween value={normalizedValue} format={format} />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// TICKER PROPS
// ============================================================================

/**
 * Ticker Props
 */
export interface TickerProps {
  /** Values to cycle through */
  values: number[]
  /** Duration per value in seconds */
  duration?: number
  /** Format options */
  format?: NumberFormatOptions
  /** Auto-cycle */
  autoPlay?: boolean
  /** Show dots indicator */
  showDots?: boolean
  /** Container className */
  className?: string
}

/**
 * Ticker Component
 *
 * Animated number that cycles through multiple values.
 *
 * @example
 * ```tsx
 * <Ticker values={[100, 1000, 10000, 100000]} duration={2} />
 * ```
 */
export function Ticker({
  values,
  duration = 2,
  format,
  autoPlay = true,
  showDots = true,
  className,
}: TickerProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0)

  React.useEffect(() => {
    if (!autoPlay) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % values.length)
    }, duration * 1000)

    return () => clearInterval(interval)
  }, [values.length, duration, autoPlay])

  return (
    <div className={cn("relative", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentIndex}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="block"
        >
          <NumberTween value={values[currentIndex]} format={format} />
        </motion.span>
      </AnimatePresence>

      {showDots && (
        <div className="flex gap-1 mt-2 justify-center">
          {values.map((_, i) => (
            <motion.div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-colors",
                i === currentIndex ? "bg-primary" : "bg-secondary"
              )}
              animate={{
                scale: i === currentIndex ? 1.2 : 1,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Import AnimatePresence for Ticker
import { AnimatePresence } from "framer-motion"
