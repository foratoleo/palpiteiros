/**
 * Loading Screen Component
 *
 * Full-page loading animation for app initialization or route transitions.
 * Provides visual feedback during loading states.
 *
 * Features:
 * - Multiple animation presets
 * - Progress display
 * - Custom branding
 * - Smooth enter/exit animations
 * - prefers-reduced-motion support
 *
 * @example
 * ```tsx
 * import { LoadingScreen } from "./loading-screen"
 *
 * <LoadingScreen
 *   isVisible={isLoading}
 *   progress={loadingProgress}
 *   message="Loading your data..."
 * />
 * ```
 */

import * as React from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { clsx } from "clsx"
import { Spinner } from "./spinner"
import type { SpinnerVariant } from "./spinner"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Loading screen preset
 */
export type LoadingScreenPreset =
  | "spinner"
  | "dots"
  | "pulse"
  | "logo"
  | "progress"
  | "wave"
  | "minimal"

/**
 * Loading screen configuration
 */
export interface LoadingScreenConfig {
  /** Loading preset */
  preset?: LoadingScreenPreset
  /** Logo element or text */
  logo?: React.ReactNode
  /** Loading message */
  message?: string
  /** Progress value (0-100) for progress preset */
  progress?: number
  /** Background color */
  backgroundColor?: string
  /** Text color */
  textColor?: string
  /** Spinner variant */
  spinnerVariant?: SpinnerVariant
  /** Show percentage */
  showPercentage?: boolean
  /** Custom className */
  className?: string
}

/**
 * Loading screen props
 */
export interface LoadingScreenProps extends LoadingScreenConfig {
  /** Visibility state */
  isVisible: boolean
  /** Minimum display time in ms */
  minDisplayTime?: number
  /** On complete callback */
  onComplete?: () => void
}

// ============================================================================
// VARIANTS
// ============================================================================

/**
 * Animation variants
 */
const overlayVariants = {
  hidden: {
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  visible: {
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: "easeIn" },
  },
}

const contentVariants = {
  hidden: {
    scale: 0.9,
    opacity: 0,
    transition: { duration: 0.2 },
  },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.3, delay: 0.1 },
  },
  exit: {
    scale: 1.1,
    opacity: 0,
    transition: { duration: 0.2 },
  },
}

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * LoadingScreen Component
 *
 * Full-screen loading overlay with animations
 */
export const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(
  ({
    isVisible,
    preset = "spinner",
    logo,
    message,
    progress,
    backgroundColor = "hsl(var(--background))",
    textColor = "hsl(var(--foreground))",
    spinnerVariant = "default",
    showPercentage = false,
    minDisplayTime = 500,
    onComplete,
    className,
    ...props
  }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const [shouldShow, setShouldShow] = React.useState(false)
    const [displayProgress, setDisplayProgress] = React.useState(0)

    // Handle min display time
    React.useEffect(() => {
      if (isVisible) {
        setShouldShow(true)
      } else {
        const timeout = setTimeout(() => {
          setShouldShow(false)
          onComplete?.()
        }, minDisplayTime)
        return () => clearTimeout(timeout)
      }
    }, [isVisible, minDisplayTime, onComplete])

    // Update progress display
    React.useEffect(() => {
      if (progress !== undefined) {
        setDisplayProgress(progress)
      }
    }, [progress])

    // Render loading content based on preset
    const renderContent = () => {
      const sharedProps = { textColor, message, progress: displayProgress, showPercentage }

      switch (preset) {
        case "spinner":
          return <SpinnerContent spinnerVariant={spinnerVariant} {...sharedProps} />
        case "dots":
          return <DotsContent {...sharedProps} />
        case "pulse":
          return <PulseContent logo={logo} {...sharedProps} />
        case "logo":
          return <LogoContent logo={logo} {...sharedProps} />
        case "progress":
          return <ProgressContent {...sharedProps} />
        case "wave":
          return <WaveContent {...sharedProps} />
        case "minimal":
          return <MinimalContent {...sharedProps} />
        default:
          return <SpinnerContent spinnerVariant={spinnerVariant} {...sharedProps} />
      }
    }

    return (
      <AnimatePresence mode="wait">
        {shouldShow && (
          <motion.div
            ref={ref}
            className={clsx(
              "fixed inset-0 z-50 flex items-center justify-center",
              className
            )}
            style={{ backgroundColor }}
            variants={prefersReducedMotion ? {} : overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            {...props}
          >
            <motion.div
              variants={prefersReducedMotion ? {} : contentVariants}
              className="flex flex-col items-center gap-4"
            >
              {renderContent()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }
)

LoadingScreen.displayName = "LoadingScreen"

// ============================================================================
// CONTENT VARIANTS
// ============================================================================

interface ContentProps {
  textColor?: string
  message?: string
  progress: number
  showPercentage?: boolean
}

function SpinnerContent({ textColor, message, progress, showPercentage, spinnerVariant }: ContentProps & { spinnerVariant?: SpinnerVariant }) {
  return (
    <>
      <Spinner variant={spinnerVariant} size="lg" />
      {message && (
        <p className="text-sm" style={{ color: textColor }}>
          {message}
        </p>
      )}
      {showPercentage && progress > 0 && (
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </p>
      )}
    </>
  )
}

function DotsContent({ textColor, message, progress, showPercentage }: ContentProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        {[0, 1, 2].map((index) => (
          <motion.span
            key={index}
            className="w-3 h-3 rounded-full bg-foreground/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: index * 0.15,
            }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm" style={{ color: textColor }}>
          {message}
        </p>
      )}
    </div>
  )
}

function PulseContent({ logo, textColor, message }: ContentProps & { logo?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-4">
      {logo && (
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {logo}
        </motion.div>
      )}
      {message && (
        <p className="text-sm" style={{ color: textColor }}>
          {message}
        </p>
      )}
    </div>
  )
}

function LogoContent({ logo, textColor, message, progress, showPercentage }: ContentProps & { logo?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-6">
      {logo && (
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          {logo}
        </motion.div>
      )}
      {message && (
        <p className="text-sm" style={{ color: textColor }}>
          {message}
        </p>
      )}
      {showPercentage && progress > 0 && (
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}

function ProgressContent({ textColor, message, progress, showPercentage }: ContentProps) {
  const barWidth = 200

  return (
    <div className="flex flex-col items-center gap-4 w-64">
      {message && (
        <p className="text-sm text-center" style={{ color: textColor }}>
          {message}
        </p>
      )}
      <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-foreground rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <p className="text-xs text-muted-foreground">
          {Math.round(progress)}%
        </p>
      )}
    </div>
  )
}

function WaveContent({ textColor, message }: ContentProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-end gap-1 h-8">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.div
            key={index}
            className="w-1 bg-foreground/30 rounded-t-full"
            animate={{
              height: [8, 32, 8],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: index * 0.1,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>
      {message && (
        <p className="text-sm" style={{ color: textColor }}>
          {message}
        </p>
      )}
    </div>
  )
}

function MinimalContent({ textColor, message }: ContentProps) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-foreground/30 animate-pulse" />
      {message && (
        <p className="text-xs text-muted-foreground">{message}</p>
      )}
    </div>
  )
}

// ============================================================================
// PRESET COMPONENTS
// ============================================================================

/**
 * LoadingScreenSpinner - Spinner preset
 */
export const LoadingScreenSpinner = React.forwardRef<HTMLDivElement, Omit<LoadingScreenProps, "preset">>((props, ref) => (
  <LoadingScreen ref={ref} preset="spinner" {...props} />
))
LoadingScreenSpinner.displayName = "LoadingScreenSpinner"

/**
 * LoadingScreenDots - Dots preset
 */
export const LoadingScreenDots = React.forwardRef<HTMLDivElement, Omit<LoadingScreenProps, "preset">>((props, ref) => (
  <LoadingScreen ref={ref} preset="dots" {...props} />
))
LoadingScreenDots.displayName = "LoadingScreenDots"

/**
 * LoadingScreenPulse - Pulse preset
 */
export const LoadingScreenPulse = React.forwardRef<HTMLDivElement, Omit<LoadingScreenProps, "preset">>((props, ref) => (
  <LoadingScreen ref={ref} preset="pulse" {...props} />
))
LoadingScreenPulse.displayName = "LoadingScreenPulse"

/**
 * LoadingScreenProgress - Progress bar preset
 */
export const LoadingScreenProgress = React.forwardRef<HTMLDivElement, Omit<LoadingScreenProps, "preset">>((props, ref) => (
  <LoadingScreen ref={ref} preset="progress" {...props} />
))
LoadingScreenProgress.displayName = "LoadingScreenProgress"

// ============================================================================
// HOOK
// ============================================================================

/**
 * Use loading screen hook
 * Manages loading screen state with minimum display time
 */
export interface UseLoadingScreenOptions {
  minDisplayTime?: number
  preset?: LoadingScreenPreset
}

export function useLoadingScreen(options: UseLoadingScreenOptions = {}) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [message, setMessage] = React.useState<string>()

  const start = React.useCallback((msg?: string) => {
    setIsLoading(true)
    setProgress(0)
    setMessage(msg)
  }, [])

  const update = React.useCallback((value: number, msg?: string) => {
    setProgress(Math.max(0, Math.min(100, value)))
    if (msg) setMessage(msg)
  }, [])

  const complete = React.useCallback(() => {
    setProgress(100)
    setTimeout(() => {
      setIsLoading(false)
      setProgress(0)
      setMessage(undefined)
    }, options.minDisplayTime || 500)
  }, [options.minDisplayTime])

  return {
    isLoading,
    progress,
    message,
    start,
    update,
    complete,
  }
}
