"use client"

import * as React from "react"
import * as ToastPrimitives from "@radix-ui/react-toast"
import { cva, type VariantProps } from "class-variance-authority"
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ToastVariant } from "@/types/ui.types"

/**
 * Toast Variant Props
 */
export interface ToastVariantProps extends VariantProps<typeof toastVariants> {
  variant?: ToastVariant
}

/**
 * Toast content variants with enhanced styling
 */
const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-start gap-3 overflow-hidden rounded-lg border p-4 shadow-lg transition-all",
  {
    variants: {
      variant: {
        default:
          "border-border bg-background text-foreground",
        success:
          "border-green-500/50 bg-green-950/50 text-green-50 dark:border-green-500/30 dark:bg-green-950/30",
        error:
          "border-red-500/50 bg-red-950/50 text-red-50 dark:border-red-500/30 dark:bg-red-950/30",
        warning:
          "border-yellow-500/50 bg-yellow-950/50 text-yellow-50 dark:border-yellow-500/30 dark:bg-yellow-950/30",
        info:
          "border-blue-500/50 bg-blue-950/50 text-blue-50 dark:border-blue-500/30 dark:bg-blue-950/30",
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
const toastIcons: Record<ToastVariant, React.ComponentType<{ className?: string }>> = {
  default: Info,
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
}

/**
 * Loading spinner for loading toasts
 */
const LoadingSpinner = () => (
  <motion.div
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  >
    <Loader2 className="h-5 w-5" />
  </motion.div>
)

/**
 * Toast Props
 */
export interface ToastProps
  extends React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root>,
    ToastVariantProps {
  /** Toast icon (false to hide, custom node to override) */
  icon?: false | React.ReactNode
  /** Show loading spinner instead of icon */
  loading?: boolean
  /** Show close button */
  showClose?: boolean
  /** Show progress bar for auto-dismiss */
  showProgress?: boolean
  /** Additional CSS class names */
  className?: string
}

/**
 * Toast Action Element
 *
 * React element type for toast action buttons
 */
export type ToastActionElement = React.ReactElement<any> | React.ReactNode

/**
 * Toast Component
 *
 * Individual toast notification with variants, icons, and animations.
 *
 * @example
 * ```tsx
 * <Toast variant="success">
 *   <ToastTitle>Success!</ToastTitle>
 *   <ToastDescription>Your changes have been saved.</ToastDescription>
 * </Toast>
 * ```
 */
export const Toast = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Root>,
  ToastProps
>(
  (
    {
      className,
      variant = "default",
      icon,
      loading = false,
      showClose = true,
      showProgress = false,
      children,
      ...props
    },
    ref
  ) => {
    const Icon = toastIcons[variant] || Info

    return (
      <ToastPrimitives.Root
        ref={ref}
        className={cn(toastVariants({ variant }), className)}
        {...props}
      >
        {/* Shimmer effect for active toasts */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{
            background: [
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)",
              "linear-gradient(90deg, transparent 50%, rgba(255,255,255,0.05) 100%, transparent 100%)",
            ],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{ mixBlendMode: "overlay" }}
        />

        {/* Icon or loading spinner */}
        {(icon !== false) && (
          <div className="shrink-0 mt-0.5">
            {loading ? (
              <LoadingSpinner />
            ) : icon ? (
              <>{icon}</>
            ) : (
              <Icon className="h-5 w-5" />
            )}
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
        {showProgress && (
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: 0 }}
            transition={{ duration: (props.duration || 5000) / 1000, ease: "linear" }}
            className="absolute bottom-0 left-0 right-0 h-0.5 bg-current opacity-20 origin-left"
          />
        )}
      </ToastPrimitives.Root>
    )
  }
)
Toast.displayName = ToastPrimitives.Root.displayName

/**
 * Toast Action Button
 */
export const ToastAction = React.forwardRef<
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
      // Variant-specific hover styles
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
export const ToastTitle = React.forwardRef<
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
export const ToastDescription = React.forwardRef<
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
 * Toast Close Button (standalone)
 */
export const ToastClose = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Close>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Close
    ref={ref}
    className={cn(
      "absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity",
      "hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </ToastPrimitives.Close>
))
ToastClose.displayName = ToastPrimitives.Close.displayName

/**
 * Toast Provider
 */
export const ToastProvider = ToastPrimitives.Provider

/**
 * Toast Viewport
 */
export const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitives.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitives.Viewport
    ref={ref}
    className={cn(
      "fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]",
      className
    )}
    {...props}
  />
))
ToastViewport.displayName = ToastPrimitives.Viewport.displayName

export {
  toastVariants,
}
