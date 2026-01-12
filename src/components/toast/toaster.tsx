"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { motion, AnimatePresence } from "framer-motion"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import type { ToastVariant } from "@/types/ui.types"

/**
 * Toast Position
 *
 * Screen position for toast container
 */
export type ToastPosition =
  | "top-center"
  | "top-right"
  | "top-left"
  | "bottom-center"
  | "bottom-right"
  | "bottom-left"

/**
 * Toast Toaster Props
 */
export interface ToasterProps {
  /** Position of toasts on screen */
  position?: ToastPosition
  /** Maximum number of toasts to display */
  maxToasts?: number
  /** Spacing between toasts */
  gap?: number
  /** Additional CSS class names */
  className?: string
}

/**
 * Position styles mapping
 */
const positionStyles: Record<ToastPosition, string> = {
  "top-center": "top-4 left-1/2 -translate-x-1/2 flex-col",
  "top-right": "top-4 right-4 flex-col",
  "top-left": "top-4 left-4 flex-col",
  "bottom-center": "bottom-4 left-1/2 -translate-x-1/2 flex-col-reverse",
  "bottom-right": "bottom-4 right-4 flex-col-reverse sm:flex-col",
  "bottom-left": "bottom-4 left-4 flex-col-reverse sm:flex-col",
}

/**
 * Toast viewport with positioning
 */
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
    position?: ToastPosition
  }
>(({ className, position = "bottom-right", ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed z-[100] flex max-h-screen w-full p-4 sm:max-w-[420px]",
      positionStyles[position],
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

/**
 * Toast variants with enhanced styles
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default:
          "border-border bg-background text-foreground",
        success:
          "border-green-500/50 bg-green-950/50 text-green-50 dark:border-green-500/30",
        error:
          "border-red-500/50 bg-red-950/50 text-red-50 dark:border-red-500/30",
        warning:
          "border-yellow-500/50 bg-yellow-950/50 text-yellow-50 dark:border-yellow-500/30",
        info:
          "border-blue-500/50 bg-blue-950/50 text-blue-50 dark:border-blue-500/30",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

/**
 * Icon mapping for toast variants
 */
const toastIcons = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

/**
 * Toast animation variants
 */
const toastAnimations = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.2,
      ease: "easeInOut",
    },
  },
}

/**
 * Toast Props
 */
export interface ToastProps extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> {
  /** Toast variant */
  variant?: ToastVariant
  /** Optional icon override */
  icon?: React.ReactNode
  /** Show close button */
  showClose?: boolean
  /** Custom duration (0 = no auto-dismiss) */
  duration?: number
}

/**
 * Toast Component
 *
 * Individual toast notification with variants and animations.
 *
 * @example
 * ```tsx
 * <Toast variant="success" title="Success!" message="Your changes have been saved." />
 * ```
 */
const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(({ className, variant = "default", icon, showClose = true, duration = 5000, children, ...props }, ref) => {
  const Icon = toastIcons[variant] || toastIcons.default

  return (
    <ToastPrimitives.Root
      ref={ref}
      duration={duration}
      className={cn(toastVariants({ variant }), className)}
      {...props}
    >
      {/* Variant icon */}
      {icon !== false && (
        <div className="shrink-0">
          {icon || <Icon className="h-5 w-5" />}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 space-y-1">
        {children}
      </div>

      {/* Close button */}
      {showClose && (
        <ToastPrimitives.Close asChild>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "shrink-0 rounded-md p-1 opacity-0 transition-opacity",
              "hover:bg-accent hover:text-accent-foreground",
              "group-hover:opacity-100",
              "focus:opacity-100 focus:outline-none focus:ring-1 focus:ring-ring"
            )}
          >
            <X className="h-4 w-4" />
          </motion.button>
        </ToastPrimitives.Close>
      )}

      {/* Progress bar for auto-dismiss */}
      {duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: duration / 1000, ease: "linear" }}
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-20 origin-left"
        />
      )}
    </ToastPrimitives.Root>
  )
})
Toast.displayName = ToastPrimitives.Root.displayName

/**
 * Toast Action Button
 */
const ToastAction = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Action>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Action
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:outline-none focus:ring-1 focus:ring-ring",
      "disabled:pointer-events-none disabled:opacity-50",
      "group-[.success]:border-green-500/30 group-[.success]:hover:bg-green-500/20",
      "group-[.error]:border-red-500/30 group-[.error]:hover:bg-red-500/20",
      "group-[.warning]:border-yellow-500/30 group-[.warning]:hover:bg-yellow-500/20",
      "group-[.info]:border-blue-500/30 group-[.info]:hover:bg-blue-500/20",
      className
    )}
    {...props}
  />
))
ToastAction.displayName = ToastPrimitives.Action.displayName

/**
 * Toast Title
 */
const ToastTitle = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Title>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Title
    ref={ref}
    className={cn("text-sm font-semibold", className)}
    {...props}
  />
))
ToastTitle.displayName = ToastPrimitives.Title.displayName

/**
 * Toast Description
 */
const ToastDescription = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Description>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Description
    ref={ref}
    className={cn("text-sm opacity-90", className)}
    {...props}
  />
))
ToastDescription.displayName = ToastPrimitives.Description.displayName

/**
 * Animated Toast Container
 *
 * Wraps toasts with AnimatePresence for smooth enter/exit animations.
 */
interface AnimatedToastProps {
  children: React.ReactNode
  index?: number
}

const AnimatedToast = ({ children, index = 0 }: AnimatedToastProps) => (
  <motion.div
    layout
    variants={{
      ...toastAnimations,
      animate: {
        ...toastAnimations.animate,
        transition: {
          ...toastAnimations.animate.transition,
          delay: index * 0.05,
        },
      },
    }}
    initial="initial"
    animate="animate"
    exit="exit"
    style={{ marginBottom: index > 0 ? 8 : 0 }}
  >
    {children}
  </motion.div>
)

export {
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastAction,
  AnimatedToast,
  toastVariants,
}
