"use client"

import * as React from "react"
import type { ToastProps, ToastActionElement } from "./toast"
import type { ToastVariant } from "@/types/ui.types"

/**
 * Toast State
 *
 * Internal state for toast management
 */
interface ToasterToast extends Omit<ToastProps, 'title' | 'description' | 'action'> {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

/**
 * Toast Manager Configuration
 */
interface ToastConfig {
  /** Maximum number of toasts to display */
  maxToasts?: number
  /** Default duration in milliseconds (0 = no auto-dismiss) */
  defaultDuration?: number
  /** Enable sound effects */
  sound?: boolean
}

// ============================================================================
// TOAST STATE MANAGEMENT
// ============================================================================

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 5000

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

// ============================================================================
// ACTION TYPES
// ============================================================================

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type ActionType = typeof actionTypes

type Action =
  | { type: ActionType["ADD_TOAST"]; toast: ToasterToast }
  | { type: ActionType["UPDATE_TOAST"]; toast: Partial<ToasterToast> }
  | { type: ActionType["DISMISS_TOAST"]; toastId?: ToasterToast["id"] }
  | { type: ActionType["REMOVE_TOAST"]; toastId?: ToasterToast["id"] }

// ============================================================================
// REDUCER
// ============================================================================

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

// ============================================================================
// DISPATCH & LISTENERS
// ============================================================================

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

// ============================================================================
// TOAST FUNCTION
// ============================================================================

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss()
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

// ============================================================================
// CONVENIENCE TOAST FUNCTIONS
// ============================================================================

/**
 * Convenience function to show a success toast
 */
toast.success = (title: string, description?: string) => {
  return toast({
    variant: "success",
    title,
    description,
  })
}

/**
 * Convenience function to show an error toast
 */
toast.error = (title: string, description?: string) => {
  return toast({
    variant: "error",
    title,
    description,
  })
}

/**
 * Convenience function to show a warning toast
 */
toast.warning = (title: string, description?: string) => {
  return toast({
    variant: "warning",
    title,
    description,
  })
}

/**
 * Convenience function to show an info toast
 */
toast.info = (title: string, description?: string) => {
  return toast({
    variant: "info",
    title,
    description,
  })
}

/**
 * Convenience function to show a loading toast
 */
toast.loading = (title: string, description?: string) => {
  return toast({
    variant: "default",
    title,
    description,
    loading: true,
    duration: 0, // No auto-dismiss for loading toasts
  })
}

/**
 * Convenience function to show a toast with promise
 *
 * Shows a loading toast that transforms to success/error based on promise result.
 */
toast.promise = <T,>(
  promise: Promise<T>,
  {
    loading,
    success,
    error,
  }: {
    loading: string
    success: string | ((data: T) => string)
    error: string | ((error: Error) => string)
  }
) => {
  const id = toast.loading(loading)

  promise
    .then((data) => {
      toast({
        variant: "success",
        title: typeof success === "function" ? success(data) : success,
      })
    })
    .catch((err) => {
      toast({
        variant: "error",
        title: typeof error === "function" ? error(err) : error,
      })
    })
    .finally(() => {
      // Dismiss the loading toast
      toast.dismiss(id.id)
    })

  return id
}

/**
 * Dismiss a toast by ID
 *
 * @param toastId - The ID of the toast to dismiss, or undefined to dismiss all
 */
toast.dismiss = (toastId?: string) => {
  dispatch({
    type: "DISMISS_TOAST",
    toastId,
  })
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * useToast Hook
 *
 * Hook for managing toast notifications.
 *
 * @example
 * ```tsx
 * const { toast, dismiss } = useToast()
 *
 * toast.success("Success!", "Your changes have been saved.")
 * ```
 */
function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

// ============================================================================
// CONVENIENCE HOOKS
// ============================================================================

/**
 * useToastSuccess Hook
 *
 * Convenience hook that only returns success toast function.
 */
export function useToastSuccess() {
  const { toast } = useToast()
  return React.useCallback(
    (title: string, description?: string) => {
      return toast({ variant: "success", title, description })
    },
    [toast]
  )
}

/**
 * useToastError Hook
 *
 * Convenience hook that only returns error toast function.
 */
export function useToastError() {
  const { toast } = useToast()
  return React.useCallback(
    (title: string, description?: string) => {
      return toast({ variant: "error", title, description })
    },
    [toast]
  )
}

/**
 * useToastWarning Hook
 *
 * Convenience hook that only returns warning toast function.
 */
export function useToastWarning() {
  const { toast } = useToast()
  return React.useCallback(
    (title: string, description?: string) => {
      return toast({ variant: "warning", title, description })
    },
    [toast]
  )
}

/**
 * useToastInfo Hook
 *
 * Convenience hook that only returns info toast function.
 */
export function useToastInfo() {
  const { toast } = useToast()
  return React.useCallback(
    (title: string, description?: string) => {
      return toast({ variant: "info", title, description })
    },
    [toast]
  )
}

/**
 * useToastPromise Hook
 *
 * Convenience hook for promise-based toasts.
 */
export function useToastPromise() {
  const { toast } = useToast()
  return React.useCallback(
    <T,>(
      promise: Promise<T>,
      messages: {
        loading: string
        success: string | ((data: T) => string)
        error: string | ((error: Error) => string)
      }
    ) => {
      return toast.promise(promise, messages)
    },
    [toast]
  )
}

export { useToast, toast }
