/**
 * Toast Components
 *
 * Toast notification system with variants, animations, and convenience hooks.
 *
 * @example
 * ```tsx
 * import { toast, useToast, Toast } from "@/components/toast"
 *
 * function Component() {
 *   const { toast } = useToast()
 *
 *   return (
 *     <>
 *       <button onClick={() => toast.success("Success!")}>
 *         Show Success Toast
 *       </button>
 *       <Toaster />
 *     </>
 *   )
 * }
 * ```
 */

// Main toast components
export { Toast, ToastTitle, ToastDescription, ToastAction, ToastClose } from "./toast"
export type { ToastProps, ToastVariantProps } from "./toast"

// Toaster container
export {
  ToastViewport,
  AnimatedToast,
  toastVariants,
} from "./toaster"
export type { ToasterProps, ToastPosition } from "./toaster"

// Hooks
export {
  useToast,
  toast,
  useToastSuccess,
  useToastError,
  useToastWarning,
  useToastInfo,
  useToastPromise,
} from "./use-toast"

// Notification manager
export {
  toastManager,
  notify,
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyInfo,
  notifyLoading,
  notifyPromise,
  dismissAllNotifications,
  dismissNotification,
  useToastNotification,
  useToastNotificationConfig,
} from "./use-toast-notification"
export type {
  ToastNotificationOptions,
  ToastNotificationManagerConfig,
} from "./use-toast-notification"
