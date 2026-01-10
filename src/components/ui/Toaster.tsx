"use client";

import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

let toastIdCounter = 0;

const generateId = () => `toast-${++toastIdCounter}`;

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = generateId();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (toast.duration !== 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, toast.duration ?? 5000);
    }
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
}));

export function toast(toast: Omit<Toast, "id">) {
  useToastStore.getState().addToast(toast);
}

toast.success = (title: string, description?: string) => {
  toast({ title, description, variant: "success" });
};

toast.error = (title: string, description?: string) => {
  toast({ title, description, variant: "error" });
};

toast.warning = (title: string, description?: string) => {
  toast({ title, description, variant: "warning" });
};

toast.info = (title: string, description?: string) => {
  toast({ title, description, variant: "info" });
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  const variantStyles: Record<ToastVariant, string> = {
    default:
      "bg-background border-border text-foreground shadow-md",
    success:
      "bg-success/10 border-success/30 text-success shadow-md",
    error:
      "bg-danger/10 border-danger/30 text-danger shadow-md",
    warning:
      "bg-warning/10 border-warning/30 text-warning shadow-md",
    info:
      "bg-info/10 border-info/30 text-info shadow-md",
  };

  return (
    <div className="fixed bottom-4 right-4 z-[var(--z-index-tooltip)] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start gap-3 rounded-lg border px-4 py-3 min-w-[320px] max-w-md animate-in slide-in-from-right duration-fast ${variantStyles[t.variant ?? "default"]}`}
        >
          <div className="flex-1">
            <p className="font-medium text-sm">{t.title}</p>
            {t.description && (
              <p className="text-sm opacity-80 mt-1">{t.description}</p>
            )}
          </div>
          <button
            onClick={() => removeToast(t.id)}
            className="opacity-60 hover:opacity-100 transition-opacity text-xs"
          >
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
